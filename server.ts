import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import type { LiveServerMessage } from '@google/genai';
import {
  connectServerLiveSession,
  getHealthResult,
  processBriefingRequest,
  processLiveTokenRequest,
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

  // Ephemeral Gemini Live API session token with voiceName: 'Charon' locked in liveConnectConstraints
  const handleLiveToken = async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    try {
      const result = await processLiveTokenRequest();
      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected live token endpoint error.',
      });
    }
  };
  app.get('/api/ai/live-token', handleLiveToken);
  app.post('/api/ai/live-token', handleLiveToken);

  // Free-tier Gemini Q&A
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

  // Single-turn Gemini Voice + Native Charon TTS fallback for typed Q&A outside a live mic session
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

  // Server-side WebSocket bridge for Gemini Live API (voiceName: 'Charon' locked in buildLiveSessionConfig)
  const wss = new WebSocketServer({ server, path: '/api/live' });
  wss.on('connection', async (clientWs) => {
    let liveSession: Awaited<ReturnType<typeof connectServerLiveSession>> | null = null;
    try {
      liveSession = await connectServerLiveSession({
        onmessage: (rawMsg) => {
          if (clientWs.readyState !== clientWs.OPEN) return;
          const message = rawMsg as LiveServerMessage;
          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            clientWs.send(JSON.stringify({ inputTranscript: content.inputTranscription.text }));
          }
          if (content?.outputTranscription?.text) {
            clientWs.send(JSON.stringify({ outputTranscript: content.outputTranscription.text }));
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
          }
          if (content?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
          if (content?.turnComplete) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onerror: (err) => {
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.send(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Gemini Live session error.',
              })
            );
          }
        },
        onclose: () => {
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.close();
          }
        },
      });

      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({ ready: true }));
      }
    } catch (err) {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: err instanceof Error ? err.message : 'Failed to connect Gemini Live session.',
          })
        );
        clientWs.close();
      }
      return;
    }

    clientWs.on('message', (raw) => {
      if (!liveSession) return;
      try {
        const parsed = JSON.parse(raw.toString()) as { audio?: string; text?: string };
        if (parsed.audio) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.text) {
          liveSession.sendRealtimeInput({ text: parsed.text });
        }
      } catch {
        // Ignore malformed WS frame
      }
    });

    clientWs.on('close', () => {
      liveSession?.close();
      liveSession = null;
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
