import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const PORTFOLIO_GROUNDING_CONTEXT = `
You are an architectural briefing assistant representing the portfolio of Chinaza Success Joseph (known professionally as Chinaza Joseph), Founder & Lead Systems Architect at CHIXUS Systems.

Verified facts you must strictly adhere to:
- Name: Chinaza Joseph (Full name: Chinaza Success Joseph)
- Roles: Founder & Lead Systems Architect, Advanced AI Prompt Architect, Multi-Model Orchestration Architect, AI Systems & Application Architect, Human-in-the-Loop (HITL) Systems Design. Always use "Founder & Lead Systems Architect" and "Multi-Model Orchestration" verbatim.
- Education: Corner Stone Preparation School (C.S.P.S) in Benin City; Ekwe Secondary School in Imo state (never invent dates or awards).
- Executive Leadership at CHIXUS Systems: Ikenna Joseph (CEO, Senior Technical Manager), Chioma Joseph (COO, Operations & Logistics Specialist), Chinaza Success Joseph (Founder & Lead Systems Architect).
- Core Engineering Collaborators: Stephen Oni (CHIXUS Development Team — co-building CHIXUS), Emmanuel Bempong (Gloweave Development Team — co-building Gloweave).
- Projects:
  1. CHIXUS (v1.23.4, LIVE at https://chixus.vercel.app) — Online-first AI-assisted hardware diagnostics and industrial intelligence platform by Chinaza Joseph and Stephen Oni (CHIXUS Systems). Not presented as offline-first.
  2. Looma (v2.5, LIVE at https://looma-plum.vercel.app) — AI-assisted motion & UI design studio built independently by Chinaza Joseph.
  3. Gloweave (UNDER DEVELOPMENT) — Global problem-discovery and solution-matching platform (Discover -> Match -> Solve) by Chinaza Joseph and Emmanuel Bempong, strictly separating Problems, Startups, Structured Solutions, and Community Discussions with independent human verification.
  4. Qorvex (ON ARCHITECTURE) — Independent technology platform initiative architected by Chinaza Joseph and owned by CHIXUS (architecture stage only, not launched).
  5. ShopSpurt™ (PRODUCT ARCHITECTURE) — Multi-channel social commerce super-app and proposed financial trust layer engineered by CHIXUS Systems (architectural design/vision, not a live financial service).
- Contact: Visitors can connect directly using the Email icon or social profile icons (GitHub, X, Medium, Quora) in the Contact section, or sign in with Google under Initiate an Architectural Conversation to share their perspective with their photo. Do not display raw email addresses in responses.

Keep responses clear, technical, honest about product stages, and concise.
`.trim();

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getReadableGeminiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === 'GEMINI_API_KEY_NOT_CONFIGURED') {
    return {
      status: 503,
      message: 'GEMINI_API_KEY is not configured in Settings > Secrets.',
    };
  }
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'The configured GEMINI_API_KEY was rejected. Please verify it in Settings > Secrets.',
    };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Rate limit reached on the free Gemini API key. Please wait a moment and try again.',
    };
  }
  return {
    status: 500,
    message: msg || 'Failed to complete Gemini request.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    const hasKey =
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
    res.json({ ok: true, geminiConfigured: hasKey });
  });

  // Free-tier Gemini Architectural Briefing Q&A (gemini-3.1-flash-lite)
  app.post('/api/ai/briefing', async (req, res) => {
    try {
      const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
      if (!rawQuery) {
        res.status(400).json({ error: 'A question is required.' });
        return;
      }
      if (rawQuery.length > 600) {
        res.status(400).json({ error: 'Question must be 600 characters or fewer.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: rawQuery,
        config: {
          systemInstruction: PORTFOLIO_GROUNDING_CONTEXT,
        },
      });

      res.json({
        answer: (response.text ?? '').trim(),
      });
    } catch (err) {
      const { status, message } = getReadableGeminiError(err);
      res.status(status).json({ error: message });
    }
  });

  // Free-tier Voice Conversation Turn (gemini-3.1-flash-lite multimodal audio + text)
  app.post('/api/ai/voice-turn', async (req, res) => {
    try {
      const ai = createGeminiClient();
      const textInput = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      const audioBase64 =
        typeof req.body?.audioBase64 === 'string' ? req.body.audioBase64 : '';
      const mimeType =
        typeof req.body?.mimeType === 'string' && req.body.mimeType.startsWith('audio/')
          ? req.body.mimeType.split(';')[0]
          : 'audio/webm';
      const historyText =
        typeof req.body?.history === 'string' && req.body.history.trim()
          ? `Recent conversation:\n${req.body.history.trim().slice(0, 1200)}\n\n`
          : '';

      if (!textInput && !audioBase64) {
        res.status(400).json({ error: 'Please speak a question or enter text.' });
        return;
      }

      if (textInput) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `${historyText}Visitor asked: ${textInput}`,
          config: {
            systemInstruction:
              PORTFOLIO_GROUNDING_CONTEXT +
              '\n\nRespond naturally as in a spoken architectural conversation, in 2 to 4 crisp sentences without markdown bullets.',
          },
        });

        res.json({
          transcript: textInput,
          answer: (response.text ?? '').trim(),
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: `${historyText}Listen carefully to the visitor's audio clip. If there is no clear spoken human speech or only silence/noise, set "transcript" to "" and "answer" to "No clear speech was detected. Please tap Speak Question and ask your question clearly." Otherwise transcribe the exact question in "transcript" and answer concisely in "answer" (2 to 4 crisp sentences, plain text without markdown bullets).`,
            },
          ],
        },
        config: {
          systemInstruction: PORTFOLIO_GROUNDING_CONTEXT,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: {
                type: Type.STRING,
                description: 'Exact short transcription of what the visitor asked.',
              },
              answer: {
                type: Type.STRING,
                description: 'Concise spoken-style answer grounded in Chinaza Joseph portfolio facts.',
              },
            },
            required: ['transcript', 'answer'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        transcript?: string;
        answer?: string;
      };

      res.json({
        transcript: parsed.transcript?.trim() || 'Voice question',
        answer: parsed.answer?.trim() || '',
      });
    } catch (err) {
      const { status, message } = getReadableGeminiError(err);
      res.status(status).json({ error: message });
    }
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
