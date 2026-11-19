import { processLiveTokenRequest } from '../_lib/gemini.ts';

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { json(payload: Record<string, unknown>): void };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed. Use POST or GET.' });
      return;
    }
    const result = await processLiveTokenRequest();
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unexpected live token endpoint error.',
    });
  }
}
