import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import {
  AlertCircle,
  Mic,
  PhoneOff,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BrandLoaderIcon } from './BrandLoaderIcon';

type LivePhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;

interface ConversationEntry {
  id: string;
  speaker: 'You' | 'Chinaza';
  text: string;
}

interface LiveTokenResponse {
  token?: string;
  model?: string;
  voiceName?: string;
  systemInstruction?: string;
}

interface VoiceTurnResponse {
  transcript?: string;
  answer?: string;
  noSpeech?: boolean;
  audioBase64?: string;
  audioMimeType?: string;
  voiceName?: string;
}

const GEMINI_LIVE_MODEL = 'gemini-3.8-live';
const GEMINI_LIVE_VOICE_NAME = 'Charon' as const;

const DISCUSSION_TOPICS = [
  'Tell me about chixus and what problem you are solving',
  'How does your Multi-Model Orchestration & HITL work?',
  'What drives your focus in robotics, AI, and engineering?',
  'Walk me through Looma, Gloweave, Qorvex, and ShopSpurt™',
];

function float32ToPcm16Base64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

function decodeBase64ToFloat32Pcm(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const floatSamples = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i += 1) {
    floatSamples[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return floatSamples;
}

function normalizeBrandCase(text: string): string {
  return text.replace(/\bCHIXUS\b/g, 'chixus');
}

async function parseApiJson<T>(res: Response, fallbackError: string): Promise<T> {
  const rawText = await res.text();
  let parsed: (T & { error?: string }) | null = null;

  if (rawText.trim().length > 0) {
    try {
      parsed = JSON.parse(rawText) as T & { error?: string };
    } catch {
      if (!res.ok) {
        throw new Error(rawText.trim().slice(0, 220) || `${fallbackError} (HTTP ${res.status})`);
      }
      throw new Error('Received an invalid response format from the live discussion service.');
    }
  }

  if (!res.ok) {
    throw new Error(parsed?.error || `${fallbackError} (HTTP ${res.status})`);
  }

  if (!parsed) {
    throw new Error('The live service returned an empty response. Please try again.');
  }

  return parsed;
}

export function SystemsIntelligenceConsole() {
  const [discussionActive, setDiscussionActive] = useState(false);
  const [livePhase, setLivePhase] = useState<LivePhase>('idle');
  const [micLevel, setMicLevel] = useState(0);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [voiceError, setVoiceError] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [questionInput, setQuestionInput] = useState('');

  const discussionActiveRef = useRef(false);
  const phaseRef = useRef<LivePhase>('idle');
  const speakRepliesRef = useRef(true);
  const conversationRef = useRef<ConversationEntry[]>([]);
  const liveSessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const threadBottomRef = useRef<HTMLDivElement | null>(null);
  const activeInputMsgIdRef = useRef<string | null>(null);
  const activeOutputMsgIdRef = useRef<string | null>(null);

  const setPhase = useCallback((next: LivePhase) => {
    phaseRef.current = next;
    setLivePhase(next);
  }, []);

  useEffect(() => {
    speakRepliesRef.current = speakReplies;
    if (outputGainRef.current) {
      outputGainRef.current.gain.value = speakReplies ? 1 : 0;
    }
  }, [speakReplies]);

  useEffect(() => {
    conversationRef.current = conversation;
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [conversation]);

  const stopScheduledNativePlayback = useCallback(() => {
    for (const node of scheduledSourcesRef.current) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // Node already ended
      }
    }
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.src = '';
      playbackAudioRef.current = null;
    }
  }, []);

  const ensureOutputAudioContext = useCallback(() => {
    if (!outputAudioCtxRef.current || outputAudioCtxRef.current.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 24000 });
      const gain = ctx.createGain();
      gain.gain.value = speakRepliesRef.current ? 1 : 0;
      gain.connect(ctx.destination);
      outputAudioCtxRef.current = ctx;
      outputGainRef.current = gain;
      nextStartTimeRef.current = 0;
    }
    if (outputAudioCtxRef.current.state === 'suspended') {
      void outputAudioCtxRef.current.resume();
    }
    return outputAudioCtxRef.current;
  }, []);

  const scheduleGeminiPcmChunk = useCallback(
    (base64Pcm24k: string) => {
      const ctx = ensureOutputAudioContext();
      const gain = outputGainRef.current;
      if (!ctx || !gain) return;

      const samples = decodeBase64ToFloat32Pcm(base64Pcm24k);
      if (samples.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, samples.length, 24000);
      audioBuffer.copyToChannel(new Float32Array(samples), 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gain);

      const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startAt);
      nextStartTimeRef.current = startAt + audioBuffer.duration;
      scheduledSourcesRef.current.add(source);
      setPhase('speaking');

      source.onended = () => {
        scheduledSourcesRef.current.delete(source);
        source.disconnect();
        if (scheduledSourcesRef.current.size === 0 && discussionActiveRef.current) {
          setPhase('listening');
        }
      };
    },
    [ensureOutputAudioContext, setPhase]
  );

  const playNativeWavClip = useCallback(
    (audioBase64?: string, audioMimeType?: string) => {
      if (!speakRepliesRef.current || !audioBase64) {
        if (!discussionActiveRef.current) setPhase('idle');
        return;
      }

      stopScheduledNativePlayback();
      setPhase('speaking');

      const mime = audioMimeType || 'audio/wav';
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      playbackAudioRef.current = audio;
      audio.onended = () => {
        playbackAudioRef.current = null;
        setPhase(discussionActiveRef.current ? 'listening' : 'idle');
      };
      audio.onerror = () => {
        playbackAudioRef.current = null;
        setPhase(discussionActiveRef.current ? 'listening' : 'idle');
      };
      void audio.play().catch(() => {
        playbackAudioRef.current = null;
        setPhase(discussionActiveRef.current ? 'listening' : 'idle');
      });
    },
    [setPhase, stopScheduledNativePlayback]
  );

  const appendStreamingTranscript = useCallback(
    (speaker: 'You' | 'Chinaza', chunk: string) => {
      const cleaned = normalizeBrandCase(chunk);
      if (!cleaned) return;

      const targetRef = speaker === 'You' ? activeInputMsgIdRef : activeOutputMsgIdRef;
      const otherRef = speaker === 'You' ? activeOutputMsgIdRef : activeInputMsgIdRef;
      otherRef.current = null;

      setConversation((prev) => {
        const existingId = targetRef.current;
        if (existingId) {
          return prev.map((entry) =>
            entry.id === existingId
              ? { ...entry, text: normalizeBrandCase(`${entry.text}${cleaned}`) }
              : entry
          );
        }
        const newId = `${Date.now()}-${speaker}`;
        targetRef.current = newId;
        return [...prev.slice(-14), { id: newId, speaker, text: cleaned.trimStart() }];
      });
    },
    []
  );

  const cleanupAudioPipeline = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      void inputAudioCtxRef.current.close().catch(() => undefined);
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      void outputAudioCtxRef.current.close().catch(() => undefined);
      outputAudioCtxRef.current = null;
      outputGainRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setMicLevel(0);
  }, []);

  const endLiveDiscussion = useCallback(() => {
    discussionActiveRef.current = false;
    setDiscussionActive(false);
    activeInputMsgIdRef.current = null;
    activeOutputMsgIdRef.current = null;

    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch {
        // Session already closed
      }
      liveSessionRef.current = null;
    }

    stopScheduledNativePlayback();
    cleanupAudioPipeline();
    setPhase('idle');
  }, [cleanupAudioPipeline, setPhase, stopScheduledNativePlayback]);

  useEffect(() => {
    return () => {
      endLiveDiscussion();
    };
  }, [endLiveDiscussion]);

  const handleLiveServerMessage = useCallback(
    (message: LiveServerMessage) => {
      const content = message.serverContent;
      if (!content) return;

      if (content.interrupted) {
        stopScheduledNativePlayback();
        activeOutputMsgIdRef.current = null;
        if (discussionActiveRef.current) {
          setPhase('listening');
        }
      }

      if (content.inputTranscription?.text) {
        appendStreamingTranscript('You', content.inputTranscription.text);
      }

      if (content.outputTranscription?.text) {
        appendStreamingTranscript('Chinaza', content.outputTranscription.text);
      }

      for (const part of content.modelTurn?.parts ?? []) {
        if (part.inlineData?.data) {
          scheduleGeminiPcmChunk(part.inlineData.data);
        }
      }

      if (content.turnComplete) {
        activeInputMsgIdRef.current = null;
        activeOutputMsgIdRef.current = null;
        if (scheduledSourcesRef.current.size === 0 && discussionActiveRef.current) {
          setPhase('listening');
        }
      }
    },
    [
      appendStreamingTranscript,
      scheduleGeminiPcmChunk,
      setPhase,
      stopScheduledNativePlayback,
    ]
  );

  const attachMicCapture = useCallback(
    (
      stream: MediaStream,
      inputCtx: AudioContext,
      sendAudioChunk: (base64Pcm16k: string) => void
    ) => {
      const source = inputCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const silentGain = inputCtx.createGain();
      silentGain.gain.value = 0;

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(inputCtx.destination);

      processor.onaudioprocess = (event) => {
        if (!discussionActiveRef.current) return;

        const input = event.inputBuffer.getChannelData(0);
        let sumSq = 0;
        for (let i = 0; i < input.length; i += 1) {
          sumSq += input[i] * input[i];
        }
        const rms = Math.sqrt(sumSq / input.length);
        setMicLevel(Math.min(1, rms * 10));

        const base64Pcm = float32ToPcm16Base64(input);
        sendAudioChunk(base64Pcm);
      };
    },
    []
  );

  const startLiveDiscussion = async () => {
    if (discussionActiveRef.current || phaseRef.current === 'connecting') return;
    setVoiceError('');
    stopScheduledNativePlayback();
    setPhase('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }
      inputAudioCtxRef.current = inputCtx;
      ensureOutputAudioContext();

      // Fetch ephemeral Gemini Live token with voiceName: 'Charon' locked in server-side liveConnectConstraints
      const tokenRes = await fetch('/api/ai/live-token', {
        method: 'POST',
      });

      if (tokenRes.ok) {
        const tokenData = await parseApiJson<LiveTokenResponse>(
          tokenRes,
          'Unable to start Gemini Live session.'
        );
        if (!tokenData.token) {
          throw new Error('Server did not return a valid Gemini Live session token.');
        }

        const ai = new GoogleGenAI({
          apiKey: tokenData.token,
          apiVersion: 'v1alpha',
        });

        const sessionPromise = ai.live.connect({
          model: tokenData.model || GEMINI_LIVE_MODEL,
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
            ...(tokenData.systemInstruction
              ? { systemInstruction: tokenData.systemInstruction }
              : {}),
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              handleLiveServerMessage(message);
            },
            onerror: (err: unknown) => {
              setVoiceError(
                err instanceof Error ? err.message : 'Gemini Live audio connection encountered an error.'
              );
            },
            onclose: () => {
              if (discussionActiveRef.current) {
                endLiveDiscussion();
              }
            },
          },
        });

        const session = await sessionPromise;
        liveSessionRef.current = session;
        discussionActiveRef.current = true;
        setDiscussionActive(true);
        setPhase('listening');

        attachMicCapture(stream, inputCtx, (base64Pcm) => {
          void sessionPromise.then((activeSession) => {
            if (discussionActiveRef.current && liveSessionRef.current === activeSession) {
              activeSession.sendRealtimeInput({
                audio: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' },
              });
            }
          });
        });
        return;
      }

      // If ephemeral token fails due to auth (401/403), surface the exact key error immediately
      const errorData = await parseApiJson<LiveTokenResponse>(
        tokenRes,
        'Unable to authenticate Gemini Live session.'
      ).catch((err) => {
        throw err;
      });
      if (!errorData.token) {
        throw new Error('Failed to initialize Gemini Live discussion.');
      }
    } catch (err) {
      cleanupAudioPipeline();
      discussionActiveRef.current = false;
      setDiscussionActive(false);
      setPhase('idle');
      setVoiceError(
        err instanceof Error
          ? err.message
          : 'Unable to start live voice discussion. Check microphone permissions and API key.'
      );
    }
  };

  const sendQuestion = useCallback(
    async (rawText: string) => {
      const cleanQuestion = rawText.trim();
      if (!cleanQuestion || phaseRef.current === 'thinking' || phaseRef.current === 'connecting') {
        return;
      }

      setVoiceError('');

      // If a Gemini Live session is open, send straight through the live stream (Charon audio reply)
      if (discussionActiveRef.current && liveSessionRef.current) {
        activeInputMsgIdRef.current = null;
        activeOutputMsgIdRef.current = null;
        setConversation((prev) => [
          ...prev.slice(-14),
          { id: `${Date.now()}-You`, speaker: 'You', text: cleanQuestion },
        ]);
        setPhase('thinking');
        liveSessionRef.current.sendRealtimeInput({ text: cleanQuestion });
        return;
      }

      // Otherwise run a turn backed by Gemini + native Gemini Charon audio output stream
      setPhase('thinking');
      try {
        const recentHistory = conversationRef.current
          .slice(-10)
          .map((entry) => `${entry.speaker}: ${entry.text}`)
          .join('\n');

        const res = await fetch('/api/ai/voice-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanQuestion,
            history: recentHistory,
            preferGeminiVoice: speakRepliesRef.current,
          }),
        });

        const data = await parseApiJson<VoiceTurnResponse>(
          res,
          'Live discussion turn failed.'
        );

        const userText = normalizeBrandCase(data.transcript || cleanQuestion);
        const replyText = normalizeBrandCase(data.answer || '');

        setConversation((prev) => [
          ...prev.slice(-14),
          { id: `${Date.now()}-u`, speaker: 'You', text: userText },
          ...(replyText
            ? [{ id: `${Date.now()}-c`, speaker: 'Chinaza' as const, text: replyText }]
            : []),
        ]);

        if (speakRepliesRef.current && data.audioBase64) {
          playNativeWavClip(data.audioBase64, data.audioMimeType);
        } else {
          setPhase('idle');
        }
      } catch (err) {
        setVoiceError(
          err instanceof Error ? err.message : 'Unable to complete live discussion turn.'
        );
        setPhase('idle');
      }
    },
    [playNativeWavClip, setPhase]
  );

  const interruptAndSpeak = () => {
    stopScheduledNativePlayback();
    activeOutputMsgIdRef.current = null;
    if (discussionActiveRef.current) {
      setPhase('listening');
    } else {
      void startLiveDiscussion();
    }
  };

  const statusText =
    livePhase === 'connecting'
      ? 'Connecting live voice session…'
      : livePhase === 'listening'
        ? 'Live with Chinaza — speak or type anytime'
        : livePhase === 'thinking'
          ? 'Thinking through your question…'
          : livePhase === 'speaking'
            ? 'Chinaza speaking live…'
            : 'Live Discussion with Chinaza';

  return (
    <div className="living-glass-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#35D6E8] tracking-wide">
          Live Discussion
        </p>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F1F5F9]">
          Talk &amp; Discuss Live with Chinaza
        </h3>
        <p className="text-sm text-[#D4DFEC] leading-relaxed">
          Speak hands-free or ask any question directly about my work, chixus, values, and systems in one real-time discussion.
        </p>
      </div>

      <div className="rounded-2xl bg-[#090D14]/90 border border-[#B8C5D6]/14 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors shrink-0 ${
                livePhase === 'listening'
                  ? 'bg-[#35D6E8]/15 border-[#35D6E8]/60 text-[#35D6E8]'
                  : livePhase === 'speaking'
                    ? 'bg-[#8B70FF]/15 border-[#8B70FF]/60 text-[#8B70FF]'
                    : 'bg-[#101722] border-[#B8C5D6]/20 text-[#B8C5D6]'
              }`}
            >
              {livePhase === 'thinking' || livePhase === 'connecting' ? (
                <BrandLoaderIcon size="sm" />
              ) : livePhase === 'speaking' ? (
                <Volume2 className="w-5 h-5 text-[#35D6E8]" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#F1F5F9] truncate">
                {statusText}
              </div>
              <div className="text-xs text-[#B8C5D6]/80 truncate">
                Direct live voice &amp; Q&amp;A · Native Gemini audio
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (speakReplies) stopScheduledNativePlayback();
                setSpeakReplies((prev) => !prev);
              }}
              aria-label={speakReplies ? 'Mute voice audio' : 'Enable voice audio'}
              title={speakReplies ? 'Voice audio on' : 'Voice audio muted'}
              className="p-2.5 rounded-xl border border-[#B8C5D6]/25 bg-[#101722] text-[#F1F5F9] hover:border-[#35D6E8]/55 transition-colors cursor-pointer"
            >
              {speakReplies ? (
                <Volume2 className="w-4 h-4 text-[#35D6E8]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#8B70FF]" />
              )}
            </button>

            {livePhase === 'speaking' && (
              <button
                type="button"
                onClick={interruptAndSpeak}
                className="px-3.5 py-2.5 rounded-xl border border-[#35D6E8]/45 bg-[#35D6E8]/15 text-xs font-semibold text-[#35D6E8] hover:bg-[#35D6E8] hover:text-[#090D14] transition-colors cursor-pointer"
              >
                Interrupt
              </button>
            )}

            {discussionActive ? (
              <button
                type="button"
                onClick={endLiveDiscussion}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B70FF]/25 hover:bg-[#8B70FF]/35 border border-[#8B70FF]/55 text-xs font-semibold text-[#F1F5F9] transition-colors cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Discussion</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={livePhase === 'thinking' || livePhase === 'connecting'}
                onClick={() => void startLiveDiscussion()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] disabled:opacity-55 text-xs font-semibold text-[#090D14] transition-all cursor-pointer shadow-[0_8px_24px_-8px_rgba(53,214,232,0.55)]"
              >
                <Mic className="w-4 h-4" />
                <span>Start Live Discussion</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Voice Level Meter */}
        {discussionActive && (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#101722] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#35D6E8] to-[#8B70FF] transition-all duration-75"
                style={{ width: `${Math.max(4, Math.round(micLevel * 100))}%` }}
              />
            </div>
          </div>
        )}

        {voiceError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#8B70FF]/10 border border-[#8B70FF]/35 text-xs text-[#F1F5F9]">
            <AlertCircle className="w-4 h-4 text-[#8B70FF] shrink-0 mt-0.5" />
            <span>{voiceError}</span>
          </div>
        )}

        {/* Quick Questions & Topics */}
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-[#B8C5D6]/80">
            Ask me a question or pick a topic:
          </div>
          <div className="flex flex-wrap gap-2">
            {DISCUSSION_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                disabled={livePhase === 'thinking' || livePhase === 'connecting'}
                onClick={() => void sendQuestion(topic)}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#101722] border border-[#B8C5D6]/18 text-[#D4DFEC] hover:border-[#35D6E8]/50 hover:text-[#35D6E8] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Unified Q&A / Discussion Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = questionInput.trim();
            if (!q || livePhase === 'thinking' || livePhase === 'connecting') return;
            setQuestionInput('');
            void sendQuestion(q);
          }}
          className="flex gap-2 pt-1"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask me anything about my work, chixus, values, or systems..."
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-xs sm:text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
          />
          <button
            type="submit"
            disabled={
              livePhase === 'thinking' || livePhase === 'connecting' || !questionInput.trim()
            }
            aria-label="Send question"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#35D6E8]/15 border border-[#35D6E8]/45 text-xs sm:text-sm font-semibold text-[#35D6E8] hover:bg-[#35D6E8] hover:text-[#090D14] disabled:opacity-45 transition-colors cursor-pointer shrink-0"
          >
            {livePhase === 'thinking' ? (
              <BrandLoaderIcon size="xs" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask</span>
          </button>
        </form>

        {/* Conversation Thread */}
        {conversation.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-3 pt-3 border-t border-[#B8C5D6]/12 pr-1">
            {conversation.map((entry) => (
              <div key={entry.id} className="text-xs sm:text-[13px] leading-relaxed">
                <span
                  className={`font-semibold mr-2 ${
                    entry.speaker === 'You' ? 'text-[#B8C5D6]' : 'text-[#35D6E8]'
                  }`}
                >
                  {entry.speaker}:
                </span>
                <span className="text-[#D4DFEC]">{entry.text}</span>
              </div>
            ))}
            <div ref={threadBottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
