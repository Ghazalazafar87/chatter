import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import { parseCleanErrorMessage } from './_constants.ts';

// Helper to read body from Node IncomingMessage if not pre-parsed by runtime
async function getRequestBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(
  req: IncomingMessage & { body?: any; socket?: any },
  res: ServerResponse & {
    status?: (code: number) => any;
    json?: (data: any) => void;
    flush?: () => void;
    flushHeaders?: () => void;
  }
) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  const body = await getRequestBody(req);
  const {
    messages = [],
    model = 'gemini-flash-lite-latest',
    temperature = 0.7,
    systemInstruction,
    useSearch = false,
  } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Messages array is required and must not be empty.' }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error:
          'GEMINI_API_KEY is not configured on the server. If deployed to Vercel, please add GEMINI_API_KEY in your Vercel Project Settings (Settings -> Environment Variables) and redeploy.',
      })
    );
    return;
  }

  // Optimize socket buffering for instant SSE chunk delivery
  req.socket?.setNoDelay(true);

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  let isAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Limit conversation history to the most recent 8 messages to prevent bloat & latency
  const trimmedMessages = messages.slice(-8);

  const formattedContents = trimmedMessages.map((m: any) => {
    const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    const parts: any[] = [];

    if (m.image) {
      let base64Data = m.image;
      let mimeType = 'image/png';
      if (typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    if (m.content) {
      parts.push({ text: m.content });
    } else if (parts.length === 0) {
      parts.push({ text: ' ' });
    }

    return { role, parts };
  });

  const config: any = {
    temperature: Math.max(0, Math.min(2, Number(temperature) || 0.7)),
  };

  if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
    config.systemInstruction = systemInstruction.trim();
  }

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  // Candidate models chain prioritizing lowest latency and high availability
  const candidateModels = Array.from(
    new Set([
      model,
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ])
  );

  let streamSuccess = false;
  let lastError: any = null;
  let actualModelUsed = model;

  for (const candidateModel of candidateModels) {
    if (isAborted) break;

    try {
      const responseStream = await ai.models.generateContentStream({
        model: candidateModel,
        contents: formattedContents,
        config,
      });

      let totalTokensEstimate = 0;
      let receivedAnyChunk = false;

      for await (const chunk of responseStream) {
        if (isAborted) break;

        const chunkText = chunk.text;
        if (chunkText) {
          receivedAnyChunk = true;
          totalTokensEstimate += Math.ceil(chunkText.length / 4);
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
          if (typeof res.flush === 'function') {
            res.flush();
          }
        }
      }

      if (receivedAnyChunk || !isAborted) {
        streamSuccess = true;
        actualModelUsed = candidateModel;
        res.write(
          `data: ${JSON.stringify({
            done: true,
            estimatedTokens: totalTokensEstimate,
            model: actualModelUsed,
          })}\n\n`
        );
        res.end();
        break;
      }
    } catch (err: any) {
      lastError = err;
      if (isAborted) break;
      // Continue to next candidate model in chain
    }
  }

  if (!streamSuccess && !isAborted) {
    const cleanErrorMessage = parseCleanErrorMessage(lastError);
    const isRateLimit = cleanErrorMessage.includes('rate limit');

    if (!res.headersSent) {
      res.statusCode = isRateLimit ? 429 : 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: cleanErrorMessage, isRateLimit }));
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: cleanErrorMessage,
          isRateLimit,
          done: true,
        })}\n\n`
      );
      res.end();
    }
  }
}
