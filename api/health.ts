import { getHealthResult } from './_lib/gemini.ts';

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { json(payload: Record<string, unknown>): void };
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    if (req.method && req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed.' });
      return;
    }
    const result = getHealthResult();
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unexpected server error.',
    });
  }
}
