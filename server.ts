import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

import { SUPPORTED_MODELS, parseCleanErrorMessage } from './api/_constants.ts';

export { SUPPORTED_MODELS };

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    hasApiKey: hasKey,
    defaultModel: 'gemini-flash-lite-latest',
    supportedModels: SUPPORTED_MODELS,
    tier: 'Free Tier (15 RPM / 1M TPM)',
  });
});

// Models list endpoint
app.get('/api/models', (req: Request, res: Response) => {
  res.json(SUPPORTED_MODELS);
});

// Streaming Chat API Endpoint (SSE) with Ultra-Fast Dispatch
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages = [],
    model = 'gemini-flash-lite-latest',
    temperature = 0.7,
    systemInstruction,
    useSearch = false,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error:
        'GEMINI_API_KEY is not configured on the server. If deployed to Vercel, please add GEMINI_API_KEY in your Vercel Project Settings (Settings -> Environment Variables) and redeploy.',
    });
    return;
  }

  // Optimize socket buffering for instant SSE chunk delivery
  req.socket?.setNoDelay(true);

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
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

  // Fast candidate chain prioritizing ultra-fast models
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
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
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
      // Continue to next candidate
    }
  }

  if (!streamSuccess && !isAborted) {
    const cleanErrorMessage = parseCleanErrorMessage(lastError);
    const isRateLimit = cleanErrorMessage.includes('rate limit');

    if (!res.headersSent) {
      res.status(isRateLimit ? 429 : 503).json({ error: cleanErrorMessage, isRateLimit });
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
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
