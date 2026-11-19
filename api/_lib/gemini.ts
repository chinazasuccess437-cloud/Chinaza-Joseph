import { GoogleGenAI, Type } from '@google/genai';

export const GEMINI_FREE_MODEL = 'gemini-3.1-flash-lite';

export const PORTFOLIO_GROUNDING_CONTEXT = `
You are an architectural briefing assistant representing the portfolio of Chinaza Success Joseph (known professionally as Chinaza Joseph), Founder & Lead Systems Architect at CHIXUS Systems.

Verified facts you must strictly adhere to:
- Name: Chinaza Joseph (Full name: Chinaza Success Joseph)
- Roles: Founder & Lead Systems Architect, AI Systems Architecture, Advanced AI Prompt Architecture, Multi-Model Orchestration, Human-in-the-Loop (HITL) Systems, AI-Driven Product Architecture & Technical Problem-Solving. Always use "Founder & Lead Systems Architect" and "Multi-Model Orchestration" verbatim.
- Education: Corner Stone Preparation School (C.S.P.S) in Benin City; Ekwe Secondary School in Imo state (never invent dates or awards).
- Executive Leadership at CHIXUS Systems: Ikenna Joseph (CEO, Senior Technical Manager), Chioma Joseph (COO, Operations & Logistics Specialist), Chinaza Success Joseph (Founder & Lead Systems Architect).
- Core Engineering Collaborators: Stephen Oni (CHIXUS Development Team — co-building CHIXUS), Emmanuel Bempong (Gloweave Development Team — co-building Gloweave; LinkedIn: https://www.linkedin.com/in/emmanuel-bempong-83813422b).
- Professional Network:
  - James Freeborn (Professional Connection — technical exchanges around software development, engineering, and AI systems)
  - Alexander Kapitulsky (Professional Connection & Product Testing Contact — AI systems architecture, human oversight, workflow design, and BeepToolkit testing; LinkedIn: https://www.linkedin.com/in/kapitulsky)
  - Richard (Technical Mentor & Professional Connection — informal technical guidance, product strategy, and CHIXUS MVP feedback)
  - Yiğit Emir Karadağ (Co-Founder & CTO of Clarantica, building Tempest; LinkedIn: https://www.linkedin.com/in/yigit-emir — product growth exchanges and CHIXUS UI review)
- Projects:
  1. CHIXUS (v1.23.4, LIVE at https://chixus.vercel.app) — Online-first AI-assisted hardware diagnostics and industrial intelligence platform designed to help users inspect equipment, understand technical faults and access structured diagnostic guidance (co-built by Chinaza Joseph and Stephen Oni, CHIXUS Systems). Not presented as offline-first.
  2. Looma (v2.5, LIVE at https://looma-plum.vercel.app) — AI-assisted motion & UI design studio built independently by Chinaza Joseph.
  3. Gloweave (UNDER DEVELOPMENT) — Global problem-discovery and solution-matching platform (Discover -> Match -> Solve) by Chinaza Joseph and Emmanuel Bempong, strictly separating Problems, Startups, Structured Solutions, and Community Discussions with independent human verification.
  4. Qorvex (ON ARCHITECTURE) — Independent technology platform initiative architected by Chinaza Joseph and owned by CHIXUS (architecture stage only, not launched).
  5. ShopSpurt™ (PRODUCT ARCHITECTURE) — Multi-channel social commerce super-app and proposed financial trust layer engineered by CHIXUS Systems (architectural design/vision, not a live financial service).
- Contact: Visitors can connect directly using the Email icon or social profile icons (GitHub, X, Medium, Quora) in the Contact section, or sign in with Google under Initiate an Architectural Conversation to share their perspective with their compulsory photo. Do not display raw email addresses in responses.

Keep responses clear, technical, honest about product stages, and concise.
`.trim();

export interface JsonResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Deterministic Gemini API key resolution:
 * - Primary: process.env.GEMINI_API_KEY
 * - Fallback: process.env.CHINAZA_API_KEY when GEMINI_API_KEY is undefined (or as runtime auth fallback in AI Studio)
 * - Trims whitespace and rejects placeholder values.
 */
function cleanEnvKey(raw: string | undefined): string {
  if (typeof raw !== 'string') return '';
  let val = raw.trim();
  if (
    val.length >= 2 &&
    ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'")))
  ) {
    val = val.slice(1, -1).trim();
  }
  // Strip accidental "KEY_NAME=" or "Bearer " prefix if pasted into a secret field
  val = val.replace(/^(GEMINI_API_KEY|CHINAZA_API_KEY|GOOGLE_API_KEY)\s*=\s*/i, '').trim();
  val = val.replace(/^Bearer\s+/i, '').trim();
  if (
    val.length >= 2 &&
    ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'")))
  ) {
    val = val.slice(1, -1).trim();
  }
  return val;
}

function getOrderedCandidateKeys(): string[] {
  const rawCandidates = [
    process.env.CHINAZA_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ];
  const cleaned = rawCandidates
    .map(cleanEnvKey)
    .filter((k) => Boolean(k) && k !== 'MY_GEMINI_API_KEY');

  const unique: string[] = [];
  for (const key of cleaned) {
    if (!unique.includes(key)) unique.push(key);
  }

  // Always prefer standard AIza... keys first so an invalid platform AQ. token never blocks a valid CHINAZA_API_KEY
  return unique.sort((a, b) => {
    const aIsAiza = a.startsWith('AIza') ? 0 : 1;
    const bIsAiza = b.startsWith('AIza') ? 0 : 1;
    return aIsAiza - bIsAiza;
  });
}

export function resolveGeminiApiKey(): string {
  return getOrderedCandidateKeys()[0] ?? '';
}

export function resolveChinazaFallbackKey(): string {
  const apiKey = cleanEnvKey(process.env.CHINAZA_API_KEY);
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return '';
  }
  return apiKey;
}

function createGeminiClient(options?: {
  overrideApiKey?: string;
  forceDeveloperApi?: boolean;
}): GoogleGenAI {
  const apiKey = options?.overrideApiKey ?? resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  const useVertexExpress = !options?.forceDeveloperApi && apiKey.startsWith('AQ.');
  return new GoogleGenAI({
    ...(useVertexExpress ? { vertexai: true } : {}),
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function runWithKey(
  apiKey: string,
  operation: (ai: GoogleGenAI) => Promise<any>
) {
  try {
    return await operation(createGeminiClient({ overrideApiKey: apiKey }));
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const isAuthMismatch =
      apiKey.startsWith('AQ.') &&
      (rawMsg.includes('UNAUTHENTICATED') ||
        rawMsg.includes('PERMISSION_DENIED') ||
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('"code":401') ||
        rawMsg.includes('"code":403'));

    if (isAuthMismatch) {
      try {
        return await operation(
          createGeminiClient({ overrideApiKey: apiKey, forceDeveloperApi: true })
        );
      } catch (fallbackErr) {
        const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        throw new Error(
          `Vertex Express error: ${extractReadableMessage(rawMsg)} | Developer API error: ${extractReadableMessage(fbMsg)}`
        );
      }
    }
    throw err;
  }
}

async function runWithGeminiClient<T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
  const candidates = getOrderedCandidateKeys();
  if (candidates.length === 0) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  let lastError: unknown;
  for (const key of candidates) {
    try {
      return (await runWithKey(key, operation)) as T;
    } catch (err) {
      lastError = err;
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isAuthFailure =
        rawMsg.includes('UNAUTHENTICATED') ||
        rawMsg.includes('PERMISSION_DENIED') ||
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
        rawMsg.includes('"code":401') ||
        rawMsg.includes('"code":403');
      if (!isAuthFailure) {
        throw err;
      }
    }
  }
  throw lastError;
}

function extractReadableMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string; status?: string } };
    if (parsed?.error?.message) {
      return parsed.error.status
        ? `${parsed.error.status}: ${parsed.error.message}`
        : parsed.error.message;
    }
  } catch {
    // raw is not pure JSON
  }
  return raw;
}

function mapGeminiError(err: unknown): JsonResult {
  const rawMsg = err instanceof Error ? err.message : String(err);
  const readableMsg = extractReadableMessage(rawMsg);

  if (rawMsg === 'GEMINI_API_KEY_MISSING') {
    return {
      status: 500,
      body: {
        error: 'Server configuration error: GEMINI_API_KEY is missing.',
      },
    };
  }

  if (
    rawMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
    rawMsg.includes('UNAUTHENTICATED') ||
    rawMsg.includes('"code":401')
  ) {
    return {
      status: 401,
      body: {
        error: `Gemini authentication failed (${readableMsg}). In AI Studio where GEMINI_API_KEY is reserved, add your valid Gemini API key under CHINAZA_API_KEY in Settings > Secrets (or set GEMINI_API_KEY / CHINAZA_API_KEY on Vercel).`,
      },
    };
  }

  if (
    rawMsg.includes('PERMISSION_DENIED') ||
    rawMsg.includes('API_KEY_INVALID') ||
    rawMsg.includes('"code":403')
  ) {
    return {
      status: 403,
      body: {
        error: `Gemini API key rejected (${readableMsg}). Please verify your API key under CHINAZA_API_KEY in AI Studio Secrets or GEMINI_API_KEY on Vercel.`,
      },
    };
  }

  if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('"code":429')) {
    return {
      status: 429,
      body: {
        error: `Rate limit reached on the free Gemini API key (${readableMsg}). Please wait a moment and try again.`,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: readableMsg || 'Failed to complete Gemini request.',
    },
  };
}

export function getHealthResult(): JsonResult {
  try {
    const apiKey = resolveGeminiApiKey();
    const chinazaKey = resolveChinazaFallbackKey();
    const isAQ = apiKey.startsWith('AQ.');
    return {
      status: 200,
      body: {
        ok: true,
        model: GEMINI_FREE_MODEL,
        geminiConfigured: Boolean(apiKey),
        chinazaKeyConfigured: Boolean(chinazaKey),
        keyFormatAIza: apiKey.startsWith('AIza'),
        keyFormatAQ: isAQ,
        routingMode: isAQ ? 'vertex-express' : 'gemini-developer-api',
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}

export async function processBriefingRequest(rawBody: unknown): Promise<JsonResult> {
  try {
    const body =
      rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, unknown>) : {};
    const rawQuery = typeof body.query === 'string' ? body.query.trim() : '';

    if (!rawQuery) {
      return {
        status: 400,
        body: { error: 'A question is required.' },
      };
    }

    if (rawQuery.length > 600) {
      return {
        status: 400,
        body: { error: 'Question must be 600 characters or fewer.' },
      };
    }

    const response = await runWithGeminiClient((ai) =>
      ai.models.generateContent({
        model: GEMINI_FREE_MODEL,
        contents: rawQuery,
        config: {
          systemInstruction: PORTFOLIO_GROUNDING_CONTEXT,
        },
      })
    );

    return {
      status: 200,
      body: {
        answer: (response.text ?? '').trim(),
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}

async function synthesizeMaleSpeech(text: string): Promise<{
  audioBase64?: string;
  audioMimeType?: string;
}> {
  const clean = text.trim();
  if (!clean) return {};

  try {
    const ttsResponse = await runWithGeminiClient((ai) =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: clean,
                speechMetadata: {
                  style: 'Calm, confident male systems architect in a live discussion',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              // Deep, clear male Gemini voice
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      })
    );

    const inlineAudio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineAudio?.data) {
      return {
        audioBase64: inlineAudio.data,
        audioMimeType: inlineAudio.mimeType || 'audio/wav',
      };
    }
  } catch {
    // Gracefully fall back to client male voice synthesis if TTS quota or tier limits occur
  }

  return {};
}

export async function processVoiceTurnRequest(rawBody: unknown): Promise<JsonResult> {
  try {
    const body =
      rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, unknown>) : {};

    const textInput = typeof body.text === 'string' ? body.text.trim() : '';
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
    const rawMime = typeof body.mimeType === 'string' ? body.mimeType.trim() : '';
    const mimeType = rawMime.startsWith('audio/') ? rawMime.split(';')[0] : 'audio/wav';
    const rawHistory = typeof body.history === 'string' ? body.history.trim() : '';
    const wantTts = body.preferGeminiVoice !== false;
    const historyText = rawHistory
      ? `Recent live discussion:\n${rawHistory.slice(0, 1400)}\n\n`
      : '';

    if (!textInput && !audioBase64) {
      return {
        status: 400,
        body: { error: 'Please speak or enter a message to continue the discussion.' },
      };
    }

    if (textInput) {
      const response = await runWithGeminiClient((ai) =>
        ai.models.generateContent({
          model: GEMINI_FREE_MODEL,
          contents: `${historyText}Visitor said: ${textInput}`,
          config: {
            systemInstruction:
              PORTFOLIO_GROUNDING_CONTEXT +
              '\n\nYou are speaking as a knowledgeable male architectural representative in a live two-way voice discussion about Chinaza Joseph. Respond naturally, directly, and conversationally in 2 to 3 crisp spoken sentences with plain text (no markdown, no asterisks, no bullet points), inviting natural follow-up.',
          },
        })
      );

      const answerText = (response.text ?? '').trim();
      const tts = wantTts ? await synthesizeMaleSpeech(answerText) : {};

      return {
        status: 200,
        body: {
          transcript: textInput,
          answer: answerText,
          noSpeech: false,
          ...(tts.audioBase64
            ? {
                audioBase64: tts.audioBase64,
                audioMimeType: tts.audioMimeType,
                voiceName: 'Charon',
              }
            : {}),
        },
      };
    }

    const response = await runWithGeminiClient((ai) =>
      ai.models.generateContent({
        model: GEMINI_FREE_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: `${historyText}Listen carefully to the visitor's spoken clip in this live discussion. If there is no clear spoken human speech or only ambient noise/silence, set "transcript" to "" and "answer" to "". Otherwise transcribe what the visitor said accurately in "transcript" and reply in "answer" as a knowledgeable male architectural representative in a live voice discussion (2 to 3 natural conversational sentences, plain text only, no markdown or bullet lists).`,
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
                description: 'Exact short transcription of what the visitor said, or empty string if silence/noise.',
              },
              answer: {
                type: Type.STRING,
                description: 'Concise spoken conversational answer in plain text, or empty string if no speech.',
              },
            },
            required: ['transcript', 'answer'],
          },
        },
      })
    );

    let parsed: { transcript?: string; answer?: string } = {};
    const rawText = (response.text ?? '{}').trim();
    try {
      parsed = JSON.parse(rawText) as { transcript?: string; answer?: string };
    } catch {
      parsed = { transcript: 'Voice turn', answer: rawText };
    }

    const transcriptText = parsed.transcript?.trim() || '';
    const answerText = parsed.answer?.trim() || '';

    if (!transcriptText) {
      return {
        status: 200,
        body: {
          transcript: '',
          answer: '',
          noSpeech: true,
        },
      };
    }

    const tts = wantTts && answerText ? await synthesizeMaleSpeech(answerText) : {};

    return {
      status: 200,
      body: {
        transcript: transcriptText,
        answer: answerText,
        noSpeech: false,
        ...(tts.audioBase64
          ? {
              audioBase64: tts.audioBase64,
              audioMimeType: tts.audioMimeType,
              voiceName: 'Charon',
            }
          : {}),
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}
