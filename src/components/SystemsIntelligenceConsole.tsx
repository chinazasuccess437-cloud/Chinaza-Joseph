import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  Mic,
  Send,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';

type ConsoleMode = 'voice' | 'ask';

interface ConversationEntry {
  id: string;
  speaker: 'You' | 'Architect Briefing';
  text: string;
}

const BRIEFING_PRESETS = [
  'Explain Chinaza’s Multi-Model Orchestration method',
  'Walk through CHIXUS and Looma live systems',
  'How does HITL verification govern Gloweave?',
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to encode audio recording.'));
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
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

  // Voice conversation state
  const [recording, setRecording] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [voiceTextInput, setVoiceTextInput] = useState('');

  // Text briefing Q&A state
  const [askQuery, setAskQuery] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askAnswer, setAskAnswer] = useState('');
  const [askError, setAskError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopSpeechOutput = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!speakReplies || !text.trim()) return;
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 0.96;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [speakReplies]
  );

  useEffect(() => {
    return () => {
      stopSpeechOutput();
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, [stopSpeechOutput]);

  const sendVoiceTurn = async (payload: {
    text?: string;
    audioBase64?: string;
    mimeType?: string;
  }) => {
    setVoiceError('');
    setVoiceProcessing(true);

    try {
      const recentHistory = conversation
        .slice(-6)
        .map((entry) => `${entry.speaker}: ${entry.text}`)
        .join('\n');

      const res = await fetch('/api/ai/voice-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          history: recentHistory,
        }),
      });

      const data = await parseApiJson<{
        transcript?: string;
        answer?: string;
      }>(res, 'Voice conversation turn failed.');

      const userText = data.transcript || payload.text || 'Voice question';
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
                speaker: 'Architect Briefing' as const,
                text: replyText,
              },
            ]
          : []),
      ]);

      if (replyText) {
        speakText(replyText);
      }
    } catch (err) {
      setVoiceError(
        err instanceof Error ? err.message : 'Unable to complete voice turn.'
      );
    } finally {
      setVoiceProcessing(false);
    }
  };

  const startRecording = async () => {
    if (recording || voiceProcessing) return;
    setVoiceError('');
    stopSpeechOutput();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        mediaStreamRef.current = null;

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        if (blob.size < 400) {
          setVoiceError('Recording was too brief. Hold and speak for a second before stopping.');
          return;
        }

        const audioBase64 = await blobToBase64(blob);
        await sendVoiceTurn({ audioBase64, mimeType });
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      setVoiceError(
        err instanceof Error
          ? err.message
          : 'Microphone access was denied or unavailable on this device.'
      );
    }
  };

  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    setRecording(false);
    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
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

  return (
    <div className="living-glass-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-[#35D6E8] tracking-wide">
            Gemini Interactive Briefing
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F1F5F9]">
            Voice Conversations &amp; Architectural Q&amp;A
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
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>Voice Conversation</span>
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

      {/* MODE 1: FREE-TIER VOICE CONVERSATION */}
      {mode === 'voice' && (
        <div className="space-y-4">
          <p className="text-sm text-[#D4DFEC] leading-relaxed">
            Record a spoken question or choose a prompt below to converse with Chinaza Joseph&rsquo;s Gemini-powered architectural briefing with spoken voice replies.
          </p>

          <div className="rounded-2xl bg-[#090D14]/90 border border-[#B8C5D6]/14 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors ${
                    recording
                      ? 'bg-[#35D6E8]/15 border-[#35D6E8]/60 text-[#35D6E8]'
                      : 'bg-[#101722] border-[#B8C5D6]/20 text-[#B8C5D6]'
                  }`}
                >
                  {voiceProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#35D6E8]" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F1F5F9]">
                    {recording
                      ? 'Listening… tap Stop & Send when finished'
                      : voiceProcessing
                        ? 'Processing spoken turn…'
                        : isSpeaking
                          ? 'Speaking architectural reply…'
                          : 'Ready for Voice Turn'}
                  </div>
                  <div className="text-xs text-[#B8C5D6]/80">
                    Gemini Multimodal Audio + Spoken Playback
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (speakReplies) stopSpeechOutput();
                    setSpeakReplies((prev) => !prev);
                  }}
                  aria-label={speakReplies ? 'Mute voice replies' : 'Enable voice replies'}
                  title={speakReplies ? 'Voice replies on' : 'Voice replies muted'}
                  className="p-2.5 rounded-xl border border-[#B8C5D6]/25 bg-[#101722] text-[#F1F5F9] hover:border-[#35D6E8]/55 transition-colors cursor-pointer"
                >
                  {speakReplies ? (
                    <Volume2 className="w-4 h-4 text-[#35D6E8]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#8B70FF]" />
                  )}
                </button>

                {recording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B70FF]/25 hover:bg-[#8B70FF]/35 border border-[#8B70FF]/55 text-xs font-semibold text-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop &amp; Send</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={voiceProcessing}
                    onClick={() => void startRecording()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] disabled:opacity-55 text-xs font-semibold text-[#090D14] transition-all cursor-pointer shadow-[0_8px_24px_-8px_rgba(53,214,232,0.55)]"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Speak Question</span>
                  </button>
                )}
              </div>
            </div>

            {voiceError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#8B70FF]/10 border border-[#8B70FF]/35 text-xs text-[#F1F5F9]">
                <AlertCircle className="w-4 h-4 text-[#8B70FF] shrink-0 mt-0.5" />
                <span>{voiceError}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[11px] font-medium text-[#B8C5D6]/80">
                Or tap a prompt for an immediate spoken reply:
              </div>
              <div className="flex flex-wrap gap-2">
                {BRIEFING_PRESETS.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    disabled={voiceProcessing || recording}
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
                if (!q || voiceProcessing) return;
                setVoiceTextInput('');
                void sendVoiceTurn({ text: q });
              }}
              className="flex gap-2 pt-1"
            >
              <input
                type="text"
                value={voiceTextInput}
                onChange={(e) => setVoiceTextInput(e.target.value)}
                placeholder="Or type a question for a spoken reply..."
                className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-xs sm:text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
              />
              <button
                type="submit"
                disabled={voiceProcessing || !voiceTextInput.trim()}
                aria-label="Ask voice briefing"
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

      {/* MODE 2: FREE-TIER ARCHITECTURAL Q&A */}
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
                <Loader2 className="w-4 h-4 animate-spin" />
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
