import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getHealthResult,
  processBriefingRequest,
  processVoiceTurnRequest,
} from './api/_lib/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const result = getHealthResult();
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected health check error.',
      });
    }
  });

  // Free-tier Gemini Architectural Briefing Q&A (gemini-3.1-flash-lite)
  app.post('/api/ai/briefing', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const result = await processBriefingRequest(req.body);
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected briefing endpoint error.',
      });
    }
  });

  // Free-tier Voice Conversation Turn (gemini-3.1-flash-lite multimodal audio + text)
  app.post('/api/ai/voice-turn', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const result = await processVoiceTurnRequest(req.body);
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected voice endpoint error.',
      });
    }
  });

  // Always return valid JSON for malformed JSON bodies or unhandled /api/* errors
  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const message =
      err instanceof Error ? err.message : 'Malformed request payload or API server error.';
    res.status(400).json({ error: message });
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (IS_PRODUCTION) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
