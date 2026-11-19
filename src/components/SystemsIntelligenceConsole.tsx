import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Mic,
  PhoneOff,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BrandLoaderIcon } from './BrandLoaderIcon';

type LivePhase = 'idle' | 'listening' | 'hearing' | 'thinking' | 'speaking';

interface ConversationEntry {
  id: string;
  speaker: 'You' | 'Assistant';
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

const DISCUSSION_TOPICS = [
  'What is chixus and what problem does it solve?',
  'Explain Chinaza’s Multi-Model Orchestration & HITL method',
  'Tell me about Chinaza’s values, robotics interest & vision',
  'Walk through Looma, Gloweave, Qorvex, and ShopSpurt™',
];

const PREFERRED_MALE_VOICES = [
  'microsoft abeo',
  'abeo',
  'google uk english male',
  'microsoft ryan',
  'microsoft guy',
  'microsoft andrew',
  'microsoft brian',
  'microsoft christopher',
  'microsoft eric',
  'microsoft steffan',
  'daniel',
  'alex',
  'arthur',
  'oliver',
  'liam',
  'aaron',
  'rishi',
  'male',
];

const ROBOTIC_OR_FEMALE_VOICES = [
  'female',
  'espeak',
  'compact',
  'fred',
  'reed',
  'rocko',
  'grandpa',
  'microsoft david',
  'ezinne',
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
  'lekha',
  'natasha',
  'hayley',
  'catherine',
  'katherine',
  'amy',
  'emma',
  'olivia',
  'nicole',
  'joanna',
  'salli',
  'ivy',
  'kimberly',
  'kendra',
  'ava',
  'allison',
  'kate',
  'english australia',
  'google us english',
  'google uk english female',
];

function selectNaturalVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  for (const hint of PREFERRED_MALE_VOICES) {
    const match = pool.find((v) => {
      const name = v.name.toLowerCase();
      return name.includes(hint) && !ROBOTIC_OR_FEMALE_VOICES.some((f) => name.includes(f));
    });
    if (match) return match;
  }

  const cleanVoice = pool.find((v) => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    return (
      lang !== 'en-au' &&
      !ROBOTIC_OR_FEMALE_VOICES.some((f) => name.includes(f))
    );
  });
  return cleanVoice || pool[0] || null;
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
      throw new Error('Received an invalid response format from the AI discussion service.');
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
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const naturalVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const threadBottomRef = useRef<HTMLDivElement | null>(null);

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
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [conversation]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const picked = selectNaturalVoice(voices);
      if (picked) {
        naturalVoiceRef.current = picked;
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

  const playReplyAudio = useCallback(
    (text: string, audioBase64?: string, audioMimeType?: string, allowBrowserFallback = true) => {
      if (!speakRepliesRef.current || !text.trim()) {
        resumeListeningIfActive();
        return;
      }

      stopSpeechOutput();
      setPhase('speaking');

      if (audioBase64) {
        const mime = audioMimeType || 'audio/wav';
        const audio = new Audio(`data:${mime};base64,${audioBase64}`);
        playbackAudioRef.current = audio;
        audio.onended = () => {
          playbackAudioRef.current = null;
          resumeListeningIfActive();
        };
        audio.onerror = () => {
          playbackAudioRef.current = null;
          if (allowBrowserFallback) {
            playReplyAudio(text, undefined, undefined, true);
          } else {
            resumeListeningIfActive();
          }
        };
        void audio.play().catch(() => {
          playbackAudioRef.current = null;
          if (allowBrowserFallback) {
            playReplyAudio(text, undefined, undefined, true);
          } else {
            resumeListeningIfActive();
          }
        });
        return;
      }

      if (!allowBrowserFallback || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resumeListeningIfActive();
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const picked = naturalVoiceRef.current || selectNaturalVoice(voices);
      const spokenText = text.replace(/\bCHIXUS\b/gi, 'chixus');

      const utterance = new SpeechSynthesisUtterance(spokenText);
      if (picked) {
        utterance.voice = picked;
        utterance.lang = picked.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }
      utterance.pitch = 1.0;
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

  const sendDiscussionTurn = useCallback(
    async (payload: { text?: string; audioBase64?: string; mimeType?: string }) => {
      if (phaseRef.current === 'thinking') return;
      setVoiceError('');
      setPhase('thinking');

      const isVoiceClip = Boolean(payload.audioBase64);
      const shouldSpeakOut = speakRepliesRef.current && (isVoiceClip || discussionActiveRef.current);

      try {
        const recentHistory = conversationRef.current
          .slice(-10)
          .map((entry) => `${entry.speaker}: ${entry.text}`)
          .join('\n');

        const res = await fetch('/api/ai/voice-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            history: recentHistory,
            preferGeminiVoice: shouldSpeakOut,
          }),
        });

        const data = await parseApiJson<VoiceTurnResponse>(
          res,
          'Real-time discussion turn failed.'
        );

        if (data.noSpeech || (!data.transcript && !data.answer)) {
          resumeListeningIfActive();
          return;
        }

        const userText = (data.transcript || payload.text || 'Spoken question').replace(
          /\bCHIXUS\b/g,
          'chixus'
        );
        const replyText = (data.answer || '').replace(/\bCHIXUS\b/g, 'chixus');

        setConversation((prev) => [
          ...prev.slice(-14),
          {
            id: `${Date.now()}-u`,
            speaker: 'You',
            text: userText,
          },
          ...(replyText
            ? [
                {
                  id: `${Date.now()}-a`,
                  speaker: 'Assistant' as const,
                  text: replyText,
                },
              ]
            : []),
        ]);

        if (replyText && shouldSpeakOut) {
          playReplyAudio(replyText, data.audioBase64, data.audioMimeType, true);
        } else {
          resumeListeningIfActive();
        }
      } catch (err) {
        setVoiceError(
          err instanceof Error ? err.message : 'Unable to complete discussion turn.'
        );
        resumeListeningIfActive();
      }
    },
    [playReplyAudio, resumeListeningIfActive, setPhase]
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
          void sendDiscussionTurn({ audioBase64, mimeType: 'audio/wav' });
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

  const statusText =
    livePhase === 'listening'
      ? 'Real-time discussion open — speak or type anytime'
      : livePhase === 'hearing'
        ? 'Listening to you… pause briefly when done'
        : livePhase === 'thinking'
          ? 'Thinking through your question…'
          : livePhase === 'speaking'
            ? 'Speaking live…'
            : 'Real-Time Voice & Q&A Discussion';

  return (
    <div className="living-glass-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#35D6E8] tracking-wide">
          Real-Time AI Discussion
        </p>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F1F5F9]">
          Ask Questions &amp; Discuss Live
        </h3>
        <p className="text-sm text-[#D4DFEC] leading-relaxed">
          Speak hands-free or type any question about Chinaza Joseph&rsquo;s work, values, and systems in one real-time discussion.
        </p>
      </div>

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
                Real-time voice &amp; Q&amp;A · Auto turn-taking
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
              aria-label={speakReplies ? 'Mute voice replies' : 'Enable voice replies'}
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
                <span>Start Real-Time Discussion</span>
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
            Ask a question or pick a topic:
          </div>
          <div className="flex flex-wrap gap-2">
            {DISCUSSION_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                disabled={livePhase === 'thinking'}
                onClick={() => void sendDiscussionTurn({ text: topic })}
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
            if (!q || livePhase === 'thinking') return;
            setQuestionInput('');
            void sendDiscussionTurn({ text: q });
          }}
          className="flex gap-2 pt-1"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask anything about Chinaza, chixus, systems, or projects..."
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-xs sm:text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
          />
          <button
            type="submit"
            disabled={livePhase === 'thinking' || !questionInput.trim()}
            aria-label="Send question to discussion"
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
