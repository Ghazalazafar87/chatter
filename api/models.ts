import type { IncomingMessage, ServerResponse } from 'http';
import { SUPPORTED_MODELS } from './_constants.ts';

export default function handler(req: IncomingMessage, res: ServerResponse & { json?: (data: any) => void; status?: (code: number) => any }) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(SUPPORTED_MODELS));
}
