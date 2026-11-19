import { processVoiceTurnRequest } from '../_lib/gemini.ts';

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { json(payload: Record<string, unknown>): void };
}

function normalizeBody(raw: unknown): unknown {
  const str = Buffer.isBuffer(raw) ? raw.toString('utf8') : typeof raw === 'string' ? raw : null;
  if (str !== null) {
    try {
      return str.trim() ? JSON.parse(str) : {};
    } catch {
      return {};
    }
  }
  return raw;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }
    const result = await processVoiceTurnRequest(normalizeBody(req.body));
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unexpected voice endpoint error.',
    });
  }
}
