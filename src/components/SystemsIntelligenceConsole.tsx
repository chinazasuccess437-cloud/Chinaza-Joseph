import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  MessageSquare,
  Mic,
  PhoneOff,
  Radio,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BrandLoaderIcon } from './BrandLoaderIcon';

type ConsoleMode = 'voice' | 'ask';
type LivePhase = 'idle' | 'listening' | 'hearing' | 'thinking' | 'speaking';

interface ConversationEntry {
  id: string;
  speaker: 'You' | 'Male Architectural Voice';
  text: string;
}

interface VoiceTurnResponse {
  transcript?: string;
  answer?: string;
  noSpeech?: boolean;
  audioBase64?: string;
  audioMimeType?: string;
  voiceName?: string;
}

const BRIEFING_PRESETS = [
  'Explain Chinaza’s Multi-Model Orchestration method',
  'Walk through CHIXUS and Looma live systems',
  'How does HITL verification govern Gloweave?',
];

const PREFERRED_MALE_VOICES = [
  'google uk english male',
  'microsoft guy',
  'microsoft ryan',
  'microsoft mark',
  'microsoft david',
  'microsoft george',
  'daniel',
  'alex',
  'arthur',
  'oliver',
  'liam',
  'aaron',
  'fred',
  'male',
];

const FEMALE_VOICE_HINTS = [
  'female',
  'zira',
  'samantha',
  'victoria',
  'karen',
  'fiona',
  'serena',
  'tessa',
  'susan',
  'hazel',
  'libby',
  'sonia',
  'aria',
  'jenny',
  'clara',
  'moira',
  'veena',
];

function selectMaleBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  for (const hint of PREFERRED_MALE_VOICES) {
    const match = pool.find((v) => {
      const name = v.name.toLowerCase();
      return name.includes(hint) && !FEMALE_VOICE_HINTS.some((f) => name.includes(f));
    });
    if (match) return match;
  }

  const nonFemale = pool.find(
    (v) => !FEMALE_VOICE_HINTS.some((f) => v.name.toLowerCase().includes(f))
  );
  return nonFemale || pool[0] || null;
}

function encodeMonoWavBase64(chunks: Float32Array[], sampleRate: number): string {
  const totalSamples = chunks.reduce((acc, c) => acc + c.length, 0);
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  let offset = 44;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i += 1) {
      const clamped = Math.max(-1, Math.min(1, chunk[i]));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += 2;
    }
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
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
      throw new Error('Received an invalid response format from the AI briefing service.');
    }
  }

  if (!res.ok) {
    throw new Error(parsed?.error || `${fallbackError} (HTTP ${res.status})`);
  }

  if (!parsed) {
    throw new Error('The AI service returned an empty response. Please try again.');
  }

  return parsed;
}

export function SystemsIntelligenceConsole() {
  const [mode, setMode] = useState<ConsoleMode>('voice');

  // Live hands-free discussion state
  const [discussionActive, setDiscussionActive] = useState(false);
  const [livePhase, setLivePhase] = useState<LivePhase>('idle');
  const [micLevel, setMicLevel] = useState(0);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [voiceLabel, setVoiceLabel] = useState('Male Voice (Charon / Male Synth)');
  const [voiceError, setVoiceError] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [voiceTextInput, setVoiceTextInput] = useState('');

  // Text briefing Q&A state
  const [askQuery, setAskQuery] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askAnswer, setAskAnswer] = useState('');
  const [askError, setAskError] = useState('');

  // Audio & VAD refs (used inside real-time callbacks to avoid stale closures)
  const discussionActiveRef = useRef(false);
  const phaseRef = useRef<LivePhase>('idle');
  const speakRepliesRef = useRef(true);
  const conversationRef = useRef<ConversationEntry[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const maleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const preRollChunksRef = useRef<Float32Array[]>([]);
  const capturedChunksRef = useRef<Float32Array[]>([]);
  const speechStartTimeRef = useRef(0);
  const lastSpeechTimeRef = useRef(0);
  const isCapturingUtteranceRef = useRef(false);

  const setPhase = useCallback((next: LivePhase) => {
    phaseRef.current = next;
    setLivePhase(next);
  }, []);

  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // Preload male browser voice list cleanly
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const picked = selectMaleBrowserVoice(voices);
      if (picked) {
        maleVoiceRef.current = picked;
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const stopSpeechOutput = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.src = '';
      playbackAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const resumeListeningIfActive = useCallback(() => {
    preRollChunksRef.current = [];
    capturedChunksRef.current = [];
    isCapturingUtteranceRef.current = false;
    if (discussionActiveRef.current) {
      setTimeout(() => {
        if (discussionActiveRef.current) {
          setPhase('listening');
        }
      }, 220);
    } else {
      setPhase('idle');
    }
  }, [setPhase]);

  const speakWithMaleVoice = useCallback(
    (text: string, audioBase64?: string, audioMimeType?: string) => {
      if (!speakRepliesRef.current || !text.trim()) {
        resumeListeningIfActive();
        return;
      }

      stopSpeechOutput();
      setPhase('speaking');

      // 1. Prefer Gemini Studio Male Voice (Charon) WAV audio when provided
      if (audioBase64) {
        setVoiceLabel('Male Voice: Gemini Charon');
        const mime = audioMimeType || 'audio/wav';
        const audio = new Audio(`data:${mime};base64,${audioBase64}`);
        playbackAudioRef.current = audio;
        audio.onended = () => {
          playbackAudioRef.current = null;
          resumeListeningIfActive();
        };
        audio.onerror = () => {
          playbackAudioRef.current = null;
          // Fall back cleanly to male browser synthesis
          speakWithMaleVoice(text);
        };
        void audio.play().catch(() => {
          playbackAudioRef.current = null;
          speakWithMaleVoice(text);
        });
        return;
      }

      // 2. Fallback: Male browser SpeechSynthesis tuned to a male register
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resumeListeningIfActive();
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const maleVoice = maleVoiceRef.current || selectMaleBrowserVoice(voices);
      setVoiceLabel(
        maleVoice ? `Male Voice: ${maleVoice.name}` : 'Male Voice (Deep Pitch)'
      );

      const utterance = new SpeechSynthesisUtterance(text);
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
      utterance.pitch = 0.8; // Natural deeper male register
      utterance.rate = 1.0;
      utterance.onend = () => resumeListeningIfActive();
      utterance.onerror = () => resumeListeningIfActive();
      window.speechSynthesis.speak(utterance);
    },
    [resumeListeningIfActive, setPhase, stopSpeechOutput]
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
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    preRollChunksRef.current = [];
    capturedChunksRef.current = [];
    isCapturingUtteranceRef.current = false;
    setMicLevel(0);
  }, []);

  const endLiveDiscussion = useCallback(() => {
    discussionActiveRef.current = false;
    setDiscussionActive(false);
    stopSpeechOutput();
    cleanupAudioPipeline();
    setPhase('idle');
  }, [cleanupAudioPipeline, setPhase, stopSpeechOutput]);

  useEffect(() => {
    return () => {
      endLiveDiscussion();
    };
  }, [endLiveDiscussion]);

  const sendVoiceTurn = useCallback(
    async (payload: { text?: string; audioBase64?: string; mimeType?: string }) => {
      setVoiceError('');
      setPhase('thinking');

      try {
        const recentHistory = conversationRef.current
          .slice(-8)
          .map((entry) => `${entry.speaker}: ${entry.text}`)
          .join('\n');

        const res = await fetch('/api/ai/voice-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            history: recentHistory,
            preferGeminiVoice: speakRepliesRef.current,
          }),
        });

        const data = await parseApiJson<VoiceTurnResponse>(
          res,
          'Live discussion turn failed.'
        );

        if (data.noSpeech || (!data.transcript && !data.answer)) {
          resumeListeningIfActive();
          return;
        }

        const userText = data.transcript || payload.text || 'Spoken turn';
        const replyText = data.answer || '';

        setConversation((prev) => [
          ...prev.slice(-10),
          {
            id: `${Date.now()}-u`,
            speaker: 'You',
            text: userText,
          },
          ...(replyText
            ? [
                {
                  id: `${Date.now()}-a`,
                  speaker: 'Male Architectural Voice' as const,
                  text: replyText,
                },
              ]
            : []),
        ]);

        if (replyText) {
          speakWithMaleVoice(replyText, data.audioBase64, data.audioMimeType);
        } else {
          resumeListeningIfActive();
        }
      } catch (err) {
        setVoiceError(
          err instanceof Error ? err.message : 'Unable to complete live discussion turn.'
        );
        resumeListeningIfActive();
      }
    },
    [resumeListeningIfActive, setPhase, speakWithMaleVoice]
  );

  const startLiveDiscussion = async () => {
    if (discussionActiveRef.current) return;
    setVoiceError('');
    stopSpeechOutput();

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
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      // Silent gain node keeps ScriptProcessor running without mic feedback in speakers
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      discussionActiveRef.current = true;
      setDiscussionActive(true);
      setPhase('listening');

      const sampleRate = audioCtx.sampleRate;
      const maxPreRollFrames = Math.max(3, Math.round((0.45 * sampleRate) / 2048));
      const SPEECH_THRESHOLD = 0.022;
      const SILENCE_HANG_MS = 1200;
      const MIN_SPEECH_MS = 450;
      const MAX_TURN_MS = 15000;

      processor.onaudioprocess = (event) => {
        if (!discussionActiveRef.current) return;

        // Ignore incoming frames while processing or speaking back to prevent speaker echo
        const currentPhase = phaseRef.current;
        if (currentPhase !== 'listening' && currentPhase !== 'hearing') {
          setMicLevel(0);
          return;
        }

        const input = event.inputBuffer.getChannelData(0);
        const copy = new Float32Array(input.length);
        copy.set(input);

        let sumSq = 0;
        for (let i = 0; i < copy.length; i += 1) {
          sumSq += copy[i] * copy[i];
        }
        const rms = Math.sqrt(sumSq / copy.length);
        setMicLevel(Math.min(1, rms * 10));

        const now = performance.now();

        if (!isCapturingUtteranceRef.current) {
          preRollChunksRef.current.push(copy);
          if (preRollChunksRef.current.length > maxPreRollFrames) {
            preRollChunksRef.current.shift();
          }

          if (rms > SPEECH_THRESHOLD) {
            isCapturingUtteranceRef.current = true;
            speechStartTimeRef.current = now;
            lastSpeechTimeRef.current = now;
            capturedChunksRef.current = [...preRollChunksRef.current];
            preRollChunksRef.current = [];
            setPhase('hearing');
          }
          return;
        }

        capturedChunksRef.current.push(copy);
        if (rms > SPEECH_THRESHOLD * 0.78) {
          lastSpeechTimeRef.current = now;
        }

        const silenceElapsed = now - lastSpeechTimeRef.current;
        const turnDuration = now - speechStartTimeRef.current;

        if (silenceElapsed >= SILENCE_HANG_MS || turnDuration >= MAX_TURN_MS) {
          isCapturingUtteranceRef.current = false;
          const chunksToSend = capturedChunksRef.current;
          capturedChunksRef.current = [];

          if (turnDuration < MIN_SPEECH_MS || chunksToSend.length === 0) {
            setPhase('listening');
            return;
          }

          const audioBase64 = encodeMonoWavBase64(chunksToSend, sampleRate);
          void sendVoiceTurn({ audioBase64, mimeType: 'audio/wav' });
        }
      };
    } catch (err) {
      cleanupAudioPipeline();
      discussionActiveRef.current = false;
      setDiscussionActive(false);
      setPhase('idle');
      setVoiceError(
        err instanceof Error
          ? err.message
          : 'Microphone access was denied or unavailable on this device.'
      );
    }
  };

  const interruptAndSpeak = () => {
    stopSpeechOutput();
    if (discussionActiveRef.current) {
      preRollChunksRef.current = [];
      capturedChunksRef.current = [];
      isCapturingUtteranceRef.current = false;
      setPhase('listening');
    } else {
      void startLiveDiscussion();
    }
  };

  const runAskBriefing = async (queryOverride?: string) => {
    const q = (queryOverride ?? askQuery).trim();
    if (!q || askLoading) return;
    if (queryOverride) setAskQuery(queryOverride);

    setAskLoading(true);
    setAskError('');
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await parseApiJson<{ answer?: string }>(
        res,
        'Architectural briefing request failed.'
      );
      setAskAnswer(data.answer || '');
    } catch (err) {
      setAskError(
        err instanceof Error ? err.message : 'Unable to answer question right now.'
      );
    } finally {
      setAskLoading(false);
    }
  };

  const statusText =
    livePhase === 'listening'
      ? 'Live discussion open — speak naturally anytime'
      : livePhase === 'hearing'
        ? 'Listening to you… pause briefly when done'
        : livePhase === 'thinking'
          ? 'Formulating architectural response…'
          : livePhase === 'speaking'
            ? 'Male voice responding live…'
            : 'Hands-Free Live Discussion (Male Voice)';

  return (
    <div className="living-glass-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-[#35D6E8] tracking-wide">
            Gemini Live Voice Discussion
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F1F5F9]">
            Live Discussion &amp; Architectural Q&amp;A
          </h3>
        </div>

        <div
          role="tablist"
          aria-label="Briefing Modes"
          className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#090D14]/85 border border-[#B8C5D6]/14"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'voice'}
            onClick={() => setMode('voice')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              mode === 'voice'
                ? 'bg-[#35D6E8] text-[#090D14] font-semibold shadow-[0_6px_20px_-6px_rgba(53,214,232,0.5)]'
                : 'text-[#C9D6E6] hover:text-[#F1F5F9]'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span>Live Discussion</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'ask'}
            onClick={() => setMode('ask')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              mode === 'ask'
                ? 'bg-[#35D6E8] text-[#090D14] font-semibold shadow-[0_6px_20px_-6px_rgba(53,214,232,0.5)]'
                : 'text-[#C9D6E6] hover:text-[#F1F5F9]'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Ask Architecture</span>
          </button>
        </div>
      </div>

      {/* MODE 1: HANDS-FREE LIVE MALE VOICE DISCUSSION */}
      {mode === 'voice' && (
        <div className="space-y-4">
          <p className="text-sm text-[#D4DFEC] leading-relaxed">
            Tap <span className="text-[#F1F5F9] font-medium">Start Live Discussion</span> for a continuous, hands-free voice conversation—just speak naturally and pause when finished; replies play automatically in a natural male voice.
          </p>

          <div className="rounded-2xl bg-[#090D14]/90 border border-[#B8C5D6]/14 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors shrink-0 ${
                    livePhase === 'hearing' || livePhase === 'listening'
                      ? 'bg-[#35D6E8]/15 border-[#35D6E8]/60 text-[#35D6E8]'
                      : livePhase === 'speaking'
                        ? 'bg-[#8B70FF]/15 border-[#8B70FF]/60 text-[#8B70FF]'
                        : 'bg-[#101722] border-[#B8C5D6]/20 text-[#B8C5D6]'
                  }`}
                >
                  {livePhase === 'thinking' ? (
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
                    {voiceLabel} · Auto turn-taking
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (speakReplies) stopSpeechOutput();
                    setSpeakReplies((prev) => !prev);
                  }}
                  aria-label={speakReplies ? 'Mute male voice replies' : 'Enable male voice replies'}
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
                    disabled={livePhase === 'thinking'}
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

            <div className="space-y-2">
              <div className="text-[11px] font-medium text-[#B8C5D6]/80">
                Or start with a topic below:
              </div>
              <div className="flex flex-wrap gap-2">
                {BRIEFING_PRESETS.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    disabled={livePhase === 'thinking'}
                    onClick={() => void sendVoiceTurn({ text: hint })}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#101722] border border-[#B8C5D6]/18 text-[#D4DFEC] hover:border-[#35D6E8]/50 hover:text-[#35D6E8] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = voiceTextInput.trim();
                if (!q || livePhase === 'thinking') return;
                setVoiceTextInput('');
                void sendVoiceTurn({ text: q });
              }}
              className="flex gap-2 pt-1"
            >
              <input
                type="text"
                value={voiceTextInput}
                onChange={(e) => setVoiceTextInput(e.target.value)}
                placeholder="Or type a message into the live discussion..."
                className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-xs sm:text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
              />
              <button
                type="submit"
                disabled={livePhase === 'thinking' || !voiceTextInput.trim()}
                aria-label="Send message to live discussion"
                className="px-3.5 py-2 rounded-xl bg-[#35D6E8]/15 border border-[#35D6E8]/45 text-[#35D6E8] hover:bg-[#35D6E8] hover:text-[#090D14] disabled:opacity-45 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {conversation.length > 0 && (
              <div className="max-h-52 overflow-y-auto space-y-2.5 pt-3 border-t border-[#B8C5D6]/12">
                {conversation.map((entry) => (
                  <div key={entry.id} className="text-xs leading-relaxed">
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: ARCHITECTURAL Q&A */}
      {mode === 'ask' && (
        <div className="space-y-4">
          <p className="text-sm text-[#D4DFEC] leading-relaxed">
            Ask detailed questions about Chinaza Joseph&rsquo;s Multi-Model Orchestration methodology, HITL design principles, CHIXUS, Looma, Gloweave, Qorvex, or ShopSpurt™.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runAskBriefing();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Ask about Chinaza's architecture or projects..."
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[#090D14] border border-[#B8C5D6]/20 text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
            />
            <button
              type="submit"
              disabled={askLoading || !askQuery.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] disabled:opacity-50 text-xs sm:text-sm font-semibold text-[#090D14] transition-colors cursor-pointer shrink-0"
            >
              {askLoading ? (
                <BrandLoaderIcon size="xs" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Ask</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {BRIEFING_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => void runAskBriefing(preset)}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#090D14]/80 border border-[#B8C5D6]/18 text-[#C9D6E6] hover:border-[#35D6E8]/50 hover:text-[#35D6E8] transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {askError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#8B70FF]/10 border border-[#8B70FF]/35 text-xs text-[#F1F5F9]">
              <AlertCircle className="w-4 h-4 text-[#8B70FF] shrink-0 mt-0.5" />
              <span>{askError}</span>
            </div>
          )}

          {askAnswer && (
            <div className="rounded-2xl bg-[#090D14]/90 border border-[#B8C5D6]/14 p-4 sm:p-5">
              <div className="text-sm text-[#D4DFEC] leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto pr-1">
                {askAnswer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
