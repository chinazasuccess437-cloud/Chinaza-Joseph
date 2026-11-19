import { GoogleGenAI, Modality, Type } from '@google/genai';

export const GEMINI_FREE_MODEL = 'gemini-4-hydrogen';
const GEMINI_FALLBACK_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
export const GEMINI_LIVE_MODEL = 'gemini-3.8-live';
export const GEMINI_LIVE_VOICE_NAME = 'Charon' as const;

export const PORTFOLIO_GROUNDING_CONTEXT = `
You are Chinaza Success Joseph (known professionally as Chinaza Joseph), Founder & Lead Systems Architect at chixus Systems, speaking directly with a visitor on your personal portfolio.

Identity & Voice Rules (Strictly Follow):
- ALWAYS speak directly in the first person as Chinaza ("I", "me", "my"). NEVER say "I am an AI assistant", "I am configured around Chinaza", or talk about Chinaza in the third person.
- Never make binding legal or financial contracts in chat—for formal engagements or partnerships, invite the visitor to reach out through the Contact channels on this page.
- STRICT PRIVACY BOUNDARY: Never reveal, confirm, or discuss my exact date of birth, age, school records, WAEC or testimonial certificates, private credentials, API keys, private project code/internals, private conversations, or raw personal contact info (such as raw email addresses). If asked for those, politely say those personal records are private.
- Always write and pronounce "chixus" in lowercase ("chixus" / "chixus Systems", never all-caps "CHIXUS") so it reads and sounds cleanly as one word.

Who I Am (Public Profile & Ambitions):
- Role: I am the Founder & Lead Systems Architect at chixus Systems, specializing in AI Systems Architecture, Advanced AI Prompt Architecture, Multi-Model Orchestration, Human-in-the-Loop (HITL) Systems, and AI-Driven Product Architecture & Technical Problem-Solving.
- Learning & Technical Focus: I am a curious, goal-oriented builder focused on applied problem-solving, mathematics, physics, artificial intelligence, humanoid and industrial robotics, engineering systems, and practical technology.
- How I Work: I use Multi-Model Orchestration with Human-in-the-Loop (HITL) oversight—structuring tasks and prompts across specialized AI models, comparing and validating outputs, and keeping human review and accountability over product, architecture, and security decisions.
- Values & Collaboration: I value dedication, healthy competition, respect, cooperation without ego friction, purposeful focus, and genuine long-term connections with serious, forward-looking builders and collaborators worldwide.
- Long-Term Vision: I aim to contribute to Benin City's development by building an AI Problem Solvers community and engaging with institutions such as Edo Innovation Hub to help people apply AI to practical problems (clearly framed as my long-term vision, not a completed outcome).

My Projects & Collaborators (Keep Stages Honest):
1. chixus (v1.23.4, LIVE at https://chixus.vercel.app) — My main AI and engineering venture under chixus Systems, co-built with Stephen Oni. Current priority is an AI Visual Inspector using images or video to identify equipment faults, assess severity, and give practical diagnostic guidance. Current MVP is online and cloud-based; offline-first capability remains a longer-term ambition.
2. Looma (v2.5, LIVE at https://looma-plum.vercel.app) — An AI-assisted motion & UI design studio I built independently.
3. Gloweave (UNDER DEVELOPMENT) — Co-built with Emmanuel Bempong (LinkedIn: https://www.linkedin.com/in/emmanuel-bempong-83813422b). A problem-discovery, evidence analysis, and solution-matching platform with independent human verification.
4. Qorvex (ON ARCHITECTURE) — An independent technology platform initiative owned by chixus (architecture stage only, not launched).
5. ShopSpurt™ (PRODUCT ARCHITECTURE) — A separate multi-channel social commerce and escrow trust layer concept focused on helping businesses participate in wider trade (architecture/vision, not a live financial service).
- Executive Leadership at chixus Systems: Ikenna Joseph (CEO, Senior Technical Manager), Chioma Joseph (COO, Operations & Logistics Specialist), and me, Chinaza Success Joseph (Founder & Lead Systems Architect).
- Core Engineering Collaborators: Stephen Oni (chixus Development Team) and Emmanuel Bempong (Gloweave Development Team; LinkedIn: https://www.linkedin.com/in/emmanuel-bempong-83813422b).
- Professional Network: James Freeborn (technical exchanges on software and AI systems), Alexander Kapitulsky (AI systems architecture, human oversight, workflow design, and BeepToolkit testing; LinkedIn: https://www.linkedin.com/in/kapitulsky), Richard (informal technical guidance, product strategy, and chixus MVP feedback), and Yiğit Emir Karadağ (Co-Founder & CTO of Clarantica, building Tempest; LinkedIn: https://www.linkedin.com/in/yigit-emir — product growth exchanges and chixus UI review).
- Contact: Direct visitors to the Email icon, social links (GitHub, X, Medium, Quora), or Google-verified Shared Perspectives section in the Contact area.

Communication Style:
- Answer first, then explain only the reasoning that matters. Keep responses clear, practical, and proportional—no padding, long intros, or repetition.
- Be curious, constructive, and respectful. Never mock or talk down. If disagreeing, do so calmly with evidence.
- Be honest about uncertainty: never invent unverified experiences, promises, or unpublished technical details; say clearly if something isn't verified or ask one focused question.
- Never use Pidgin or slang; speak in clear, articulate Standard English.
`.trim();

export const CHINAZA_LIVE_SYSTEM_INSTRUCTION = `
${PORTFOLIO_GROUNDING_CONTEXT}

Live Spoken Discussion Rules:
- You are in a live voice and Q&A discussion on your portfolio. Speak naturally as Chinaza Joseph in first person ("I", "my", "me") using a warm, confident, articulate male conversational tone.
- Lead directly with the answer in 2 to 3 crisp spoken sentences using plain text only (no markdown, no asterisks, no bullet points).
- Always write and say "chixus" in lowercase ("chixus", never "CHIXUS"), and speak clear Standard English (never Pidgin or slang).
`.trim();

export function buildLiveSessionConfig() {
  return {
    responseModalities: [Modality.AUDIO],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: GEMINI_LIVE_VOICE_NAME,
        },
      },
    },
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    systemInstruction: CHINAZA_LIVE_SYSTEM_INSTRUCTION,
  };
}

export interface JsonResult {
  status: number;
  body: Record<string, unknown>;
}

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

export function createGeminiClient(options?: {
  overrideApiKey?: string;
  useVertexExpress?: boolean;
  apiVersion?: string;
}): GoogleGenAI {
  const apiKey = options?.overrideApiKey ?? resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    ...(options?.useVertexExpress ? { vertexai: true } : {}),
    ...(options?.apiVersion ? { apiVersion: options.apiVersion } : {}),
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isAuthErrorMessage(msg: string): boolean {
  return (
    msg.includes('UNAUTHENTICATED') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
    msg.includes('"code":401') ||
    msg.includes('"code":403')
  );
}

function isTransientCapacityError(msg: string): boolean {
  return (
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('"code":503') ||
    msg.includes('"code":429') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('"code":404')
  );
}

async function runWithKey(
  apiKey: string,
  operation: (ai: GoogleGenAI) => Promise<any>,
  options?: { apiVersion?: string; allowVertexFallback?: boolean }
) {
  try {
    return await operation(
      createGeminiClient({
        overrideApiKey: apiKey,
        useVertexExpress: false,
        apiVersion: options?.apiVersion,
      })
    );
  } catch (devErr) {
    const devMsg = devErr instanceof Error ? devErr.message : String(devErr);

    if (
      options?.allowVertexFallback !== false &&
      apiKey.startsWith('AQ.') &&
      isAuthErrorMessage(devMsg)
    ) {
      try {
        return await operation(
          createGeminiClient({
            overrideApiKey: apiKey,
            useVertexExpress: true,
            apiVersion: options?.apiVersion,
          })
        );
      } catch (vtxErr) {
        const vtxMsg = vtxErr instanceof Error ? vtxErr.message : String(vtxErr);
        if (!isAuthErrorMessage(vtxMsg)) {
          throw vtxErr;
        }
        throw new Error(
          `Developer API error: ${extractReadableMessage(devMsg)} | Vertex Express error: ${extractReadableMessage(vtxMsg)}`
        );
      }
    }

    throw devErr;
  }
}

async function runWithGeminiClient<T>(
  operation: (ai: GoogleGenAI) => Promise<T>,
  options?: { apiVersion?: string; allowVertexFallback?: boolean }
): Promise<T> {
  const candidates = getOrderedCandidateKeys();
  if (candidates.length === 0) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  let lastError: unknown;
  for (const key of candidates) {
    try {
      return (await runWithKey(key, operation, options)) as T;
    } catch (err) {
      lastError = err;
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (!isAuthErrorMessage(rawMsg)) {
        throw err;
      }
    }
  }
  throw lastError;
}

async function generateWithModelFallback(
  buildParams: (model: string) => any
) {
  let lastError: unknown;

  for (let i = 0; i < GEMINI_FALLBACK_MODELS.length; i += 1) {
    const model = GEMINI_FALLBACK_MODELS[i];
    try {
      return await runWithGeminiClient((ai) =>
        ai.models.generateContent(buildParams(model))
      );
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const hasNext = i < GEMINI_FALLBACK_MODELS.length - 1;
      if (!hasNext || !isTransientCapacityError(msg)) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 450));
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
    rawMsg.includes('UNAVAILABLE') ||
    rawMsg.includes('high demand') ||
    rawMsg.includes('"code":503')
  ) {
    return {
      status: 503,
      body: {
        error: 'The Gemini model is temporarily busy due to high demand. Please retry in a few seconds.',
      },
    };
  }

  if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('"code":429')) {
    return {
      status: 429,
      body: {
        error: `Rate limit reached on the Gemini API key (${readableMsg}). Please wait a moment and try again.`,
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
        error: `Gemini authentication failed (${readableMsg}). Add a valid AIza... Gemini API key under CHINAZA_API_KEY in AI Studio Secrets or GEMINI_API_KEY on Vercel.`,
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
        liveModel: GEMINI_LIVE_MODEL,
        liveVoiceName: GEMINI_LIVE_VOICE_NAME,
        fallbackModels: GEMINI_FALLBACK_MODELS,
        geminiConfigured: Boolean(apiKey),
        chinazaKeyConfigured: Boolean(chinazaKey),
        keyFormatAIza: apiKey.startsWith('AIza'),
        keyFormatAQ: isAQ,
        routingMode: 'gemini-developer-api',
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}

export async function processLiveTokenRequest(): Promise<JsonResult> {
  try {
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const token = await runWithGeminiClient(
      (ai) =>
        ai.authTokens.create({
          config: {
            uses: 1,
            expireTime,
            newSessionExpireTime,
            liveConnectConstraints: {
              model: GEMINI_LIVE_MODEL,
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: GEMINI_LIVE_VOICE_NAME,
                    },
                  },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: CHINAZA_LIVE_SYSTEM_INSTRUCTION,
              },
            },
          },
        }),
      { apiVersion: 'v1alpha', allowVertexFallback: false }
    );

    if (!token?.name) {
      return {
        status: 502,
        body: {
          error: 'Failed to issue ephemeral Gemini Live session token.',
        },
      };
    }

    return {
      status: 200,
      body: {
        token: token.name,
        model: GEMINI_LIVE_MODEL,
        voiceName: GEMINI_LIVE_VOICE_NAME,
        systemInstruction: CHINAZA_LIVE_SYSTEM_INSTRUCTION,
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}

export async function connectServerLiveSession(callbacks: {
  onmessage: (message: unknown) => void;
  onerror?: (error: unknown) => void;
  onclose?: (event: unknown) => void;
}) {
  return runWithGeminiClient((ai) =>
    ai.live.connect({
      model: GEMINI_LIVE_MODEL,
      config: buildLiveSessionConfig(),
      callbacks,
    })
  );
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

    const response = await generateWithModelFallback((model) => ({
      model,
      contents: rawQuery,
      config: {
        systemInstruction: PORTFOLIO_GROUNDING_CONTEXT,
      },
    }));

    const formattedAnswer = (response.text ?? '').trim().replace(/\bCHIXUS\b/g, 'chixus');

    return {
      status: 200,
      body: {
        answer: formattedAnswer,
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}

function ensurePlayableWav(base64Data: string, mimeType: string): {
  audioBase64: string;
  audioMimeType: string;
} {
  const lower = mimeType.toLowerCase();
  if (lower.includes('wav') || lower.includes('mpeg') || lower.includes('mp3') || lower.includes('ogg')) {
    return { audioBase64: base64Data, audioMimeType: mimeType || 'audio/wav' };
  }

  // Wrap raw PCM (L16) into a 44-byte RIFF/WAV header if a TTS response returns headerless PCM
  const pcmBytes = Buffer.from(base64Data, 'base64');
  if (
    pcmBytes.length >= 4 &&
    pcmBytes[0] === 0x52 &&
    pcmBytes[1] === 0x49 &&
    pcmBytes[2] === 0x46 &&
    pcmBytes[3] === 0x46
  ) {
    return { audioBase64: base64Data, audioMimeType: 'audio/wav' };
  }

  const sampleRateMatch = /rate=(\d+)/i.exec(mimeType);
  const sampleRate = sampleRateMatch ? Number(sampleRateMatch[1]) : 24000;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBytes.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBytes.length, 40);

  return {
    audioBase64: Buffer.concat([header, pcmBytes]).toString('base64'),
    audioMimeType: 'audio/wav',
  };
}

async function synthesizeMaleSpeech(text: string): Promise<{
  audioBase64?: string;
  audioMimeType?: string;
  voiceName?: string;
}> {
  const clean = text.trim().replace(/\bCHIXUS\b/gi, 'chixus');
  if (!clean) return {};

  const ttsAttempts: Array<{
    model: string;
    voiceName: typeof GEMINI_LIVE_VOICE_NAME;
    useSpeechMetadata: boolean;
  }> = [
    { model: 'gemini-3.8-flash-lite-tts', voiceName: GEMINI_LIVE_VOICE_NAME, useSpeechMetadata: true },
    { model: 'gemini-3.8-flash-tts', voiceName: GEMINI_LIVE_VOICE_NAME, useSpeechMetadata: true },
    { model: 'gemini-3.8-flash-lite-tts', voiceName: GEMINI_LIVE_VOICE_NAME, useSpeechMetadata: false },
  ];

  for (const attempt of ttsAttempts) {
    try {
      const ttsResponse = await runWithGeminiClient((ai) =>
        ai.models.generateContent({
          model: attempt.model,
          contents: [
            {
              role: 'user',
              parts: [
                attempt.useSpeechMetadata
                  ? {
                      text: clean,
                      speechMetadata: {
                        style:
                          'Warm, natural, confident human male voice speaking clear Standard English (strictly never Pidgin), smooth everyday conversational cadence, not theatrical or robotic',
                      },
                    }
                  : {
                      text: clean,
                    },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: attempt.voiceName },
              },
            },
          },
        })
      );

      const inlineAudio =
        ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineAudio?.data) {
        const playable = ensurePlayableWav(
          inlineAudio.data,
          inlineAudio.mimeType || 'audio/wav'
        );
        return {
          ...playable,
          voiceName: attempt.voiceName,
        };
      }
    } catch {
      // Try next Gemini Charon TTS attempt
    }
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
      const response = await generateWithModelFallback((model) => ({
        model,
        contents: `${historyText}Visitor said: ${textInput}`,
        config: {
          systemInstruction: CHINAZA_LIVE_SYSTEM_INSTRUCTION,
        },
      }));

      const answerText = (response.text ?? '').trim().replace(/\bCHIXUS\b/g, 'chixus');
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
                voiceName: GEMINI_LIVE_VOICE_NAME,
              }
            : {}),
        },
      };
    }

    const response = await generateWithModelFallback((model) => ({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: `${historyText}Listen carefully to the visitor's spoken clip in this live discussion with you (Chinaza Joseph). If there is no clear spoken human speech or only ambient noise/silence, set "transcript" to "" and "answer" to "". Otherwise transcribe what the visitor said accurately in "transcript" and reply in "answer" directly as Chinaza Joseph in first person ("I", "my", "me") using clear Standard English (never Pidgin, always write "chixus" in lowercase, 2 to 3 crisp conversational sentences, plain text only).`,
          },
        ],
      },
      config: {
        systemInstruction: CHINAZA_LIVE_SYSTEM_INSTRUCTION,
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
              description: 'Concise first-person answer as Chinaza Joseph in clear Standard English (never Pidgin, write chixus in lowercase), plain text, or empty string if no speech.',
            },
          },
          required: ['transcript', 'answer'],
        },
      },
    }));

    let parsed: { transcript?: string; answer?: string } = {};
    const rawText = (response.text ?? '{}').trim();
    try {
      parsed = JSON.parse(rawText) as { transcript?: string; answer?: string };
    } catch {
      parsed = { transcript: 'Voice turn', answer: rawText };
    }

    const transcriptText = (parsed.transcript?.trim() || '').replace(/\bCHIXUS\b/g, 'chixus');
    const answerText = (parsed.answer?.trim() || '').replace(/\bCHIXUS\b/g, 'chixus');

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
              voiceName: GEMINI_LIVE_VOICE_NAME,
            }
          : {}),
      },
    };
  } catch (err) {
    return mapGeminiError(err);
  }
}
