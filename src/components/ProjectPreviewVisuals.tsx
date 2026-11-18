import { useState } from 'react';
import {
  Camera,
  Check,
  GitBranch,
  Layers,
  Lock,
  Pause,
  Play,
  Shield,
  Sliders,
} from 'lucide-react';
import type { ProjectItem } from '../data/portfolioData';

export function ProjectPreviewVisual({ projectId }: { projectId: ProjectItem['id'] }) {
  if (projectId === 'chixus') return <ChixusPreview />;
  if (projectId === 'looma') return <LoomaPreview />;
  if (projectId === 'gloweave') return <GloweavePreview />;
  if (projectId === 'qorvex') return <QorvexPreview />;
  return <ShopSpurtPreview />;
}

function ChixusPreview() {
  const [step, setStep] = useState<'inspect' | 'reason' | 'guide'>('inspect');

  return (
    <div className="rounded-2xl bg-[#090D14] border border-[#35D6E8]/22 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8C5D6]/12 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F1F5F9]">
          <Camera className="w-4 h-4 text-[#35D6E8]" />
          <span>Online-First Inspection Workspace</span>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#101722] border border-[#B8C5D6]/12">
          {(['inspect', 'reason', 'guide'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStep(tab)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                step === tab
                  ? 'bg-[#35D6E8] text-[#090D14] font-semibold'
                  : 'text-[#B8C5D6] hover:text-[#F1F5F9]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {step === 'inspect' && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          <div className="sm:col-span-5 rounded-xl bg-[#101722] border border-[#35D6E8]/25 p-4 flex flex-col items-center justify-center min-h-[126px] relative overflow-hidden">
            <svg viewBox="0 0 120 80" className="w-full max-w-[140px]" fill="none">
              <rect x="14" y="14" width="92" height="52" rx="6" stroke="#B8C5D6" strokeOpacity="0.35" strokeWidth="1.5" />
              <circle cx="44" cy="40" r="14" stroke="#35D6E8" strokeWidth="1.5" strokeDasharray="3 3" />
              <rect x="68" y="26" width="26" height="28" rx="3" stroke="#B8C5D6" strokeOpacity="0.45" strokeWidth="1.2" />
              <path d="M10 22V10H22M98 10H110V22M10 58V70H22M98 70H110V58" stroke="#35D6E8" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="mt-2 text-[11px] text-[#35D6E8]">Visual Component Capture</span>
          </div>
          <div className="sm:col-span-7 space-y-2 text-xs">
            <div className="font-semibold text-[#F1F5F9]">1. Hardware Visual Intake</div>
            <p className="text-[#B8C5D6]/85 leading-relaxed">
              Equipment imagery and operator fault notes enter an online-first diagnostic session for structured assessment.
            </p>
            <div className="text-[11px] text-[#B8C5D6]/70">
              Visual inspection · Context capture · Online session
            </div>
          </div>
        </div>
      )}

      {step === 'reason' && (
        <div className="space-y-2.5 text-xs">
          <div className="font-semibold text-[#F1F5F9]">2. AI-Assisted Technical Fault Reasoning</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3 space-y-1">
              <div className="text-[11px] text-[#35D6E8] font-medium">Symptom Isolation</div>
              <div className="text-[#B8C5D6]/85">Cross-references observed assembly wear against fault categories.</div>
            </div>
            <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3 space-y-1">
              <div className="text-[11px] text-[#35D6E8] font-medium">Boundary Framing</div>
              <div className="text-[#B8C5D6]/85">Surfaces candidate failure points for human technician verification.</div>
            </div>
          </div>
        </div>
      )}

      {step === 'guide' && (
        <div className="space-y-2 text-xs">
          <div className="font-semibold text-[#F1F5F9]">3. Structured Diagnostic Guidance</div>
          <div className="space-y-1.5">
            {[
              'Step A — Verify power isolation and safety clearance before physical probing.',
              'Step B — Inspect primary connector seating and thermal discoloration.',
              'Step C — Document verified finding inside the session diagnostic log.',
            ].map((line) => (
              <div
                key={line}
                className="flex items-start gap-2 rounded-lg bg-[#101722] px-3 py-2 text-[#B8C5D6]"
              >
                <Check className="w-3.5 h-3.5 text-[#35D6E8] mt-0.5 shrink-0" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoomaPreview() {
  const [playing, setPlaying] = useState(true);
  const [preset, setPreset] = useState<'orbital' | 'kinetic' | 'settle'>('orbital');

  return (
    <div className="rounded-2xl bg-[#090D14] border border-[#35D6E8]/22 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8C5D6]/12 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F1F5F9]">
          <Sliders className="w-4 h-4 text-[#35D6E8]" />
          <span>Interactive Motion &amp; State Canvas</span>
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101722] border border-[#35D6E8]/35 text-[11px] font-medium text-[#35D6E8] hover:bg-[#35D6E8]/10 transition-colors cursor-pointer"
        >
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{playing ? 'Pause Motion' : 'Play Motion'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-5 rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-5 flex items-center justify-center min-h-[132px]">
          <svg
            viewBox="0 0 80 80"
            className={`w-16 h-16 transition-transform duration-700 ${
              !playing
                ? ''
                : preset === 'orbital'
                  ? 'animate-spin'
                  : preset === 'kinetic'
                    ? 'scale-110'
                    : 'translate-y-[-4px]'
            }`}
            style={{ animationDuration: preset === 'orbital' ? '8s' : undefined }}
            fill="none"
          >
            <circle cx="40" cy="40" r="28" stroke="#35D6E8" strokeOpacity="0.3" strokeWidth="1.5" />
            <path
              d="M52 20C52 10 26 10 26 26C26 38 54 42 54 56C54 70 28 70 28 58"
              stroke="#35D6E8"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="40" cy="40" r="5" fill="#F1F5F9" />
          </svg>
        </div>

        <div className="sm:col-span-7 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {([
              { id: 'orbital', label: 'Orbital Loop' },
              { id: 'kinetic', label: 'Kinetic Scale' },
              { id: 'settle', label: 'Spring Settle' },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  preset === item.id
                    ? 'bg-[#35D6E8]/15 border-[#35D6E8] text-[#35D6E8]'
                    : 'bg-[#101722] border-[#B8C5D6]/15 text-[#B8C5D6] hover:text-[#F1F5F9]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-[#101722] border border-[#B8C5D6]/12 p-2.5 font-mono text-[11px] text-[#B8C5D6] leading-relaxed">
            <div>export: SVG + React Component + CSS Keyframes</div>
            <div className="text-[#35D6E8]">
              curve: {preset === 'orbital' ? 'linear(0..360deg)' : preset === 'kinetic' ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'spring(stiffness: 240)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GloweavePreview() {
  const [selectedEntity, setSelectedEntity] = useState<'problems' | 'startups' | 'solutions' | 'discussions'>('problems');

  const ENTITY_DETAIL = {
    problems: {
      title: 'Problems Entity',
      desc: 'Real-world problem statements anchored with supporting evidence and independent verification boundaries.',
    },
    startups: {
      title: 'Startups Entity',
      desc: 'Ventures and teams mapped cleanly as distinct entities without conflating startup presence with solution proof.',
    },
    solutions: {
      title: 'Structured Solutions Entity',
      desc: 'Analyzed solution approaches evaluated separately from raw AI coverage percentages.',
    },
    discussions: {
      title: 'Community Discussions Entity',
      desc: 'Open researcher and innovator dialogue kept distinct from verified problem evidence.',
    },
  };

  return (
    <div className="rounded-2xl bg-[#090D14] border border-[#8B70FF]/30 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8C5D6]/12 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F1F5F9]">
          <GitBranch className="w-4 h-4 text-[#8B70FF]" />
          <span>Core Workflow: Discover → Match → Solve</span>
        </div>
        <span className="text-[11px] text-[#B8C5D6]">Development Architecture</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(['problems', 'startups', 'solutions', 'discussions'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedEntity(key)}
            className={`px-2.5 py-2 rounded-xl border text-xs font-medium capitalize transition-colors cursor-pointer ${
              selectedEntity === key
                ? 'bg-[#8B70FF]/18 border-[#8B70FF] text-[#F1F5F9]'
                : 'bg-[#101722] border-[#B8C5D6]/14 text-[#B8C5D6] hover:text-[#F1F5F9]'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3.5 space-y-1.5">
        <div className="text-xs font-semibold text-[#F1F5F9]">
          {ENTITY_DETAIL[selectedEntity].title}
        </div>
        <p className="text-xs text-[#B8C5D6]/85 leading-relaxed">
          {ENTITY_DETAIL[selectedEntity].desc}
        </p>
        <div className="pt-1.5 text-[11px] text-[#35D6E8]">
          Independent Human Verification Layer · AI coverage is analytical signal, never proof
        </div>
      </div>
    </div>
  );
}

function QorvexPreview() {
  return (
    <div className="rounded-2xl bg-[#090D14] border border-[#B8C5D6]/22 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8C5D6]/12 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F1F5F9]">
          <Layers className="w-4 h-4 text-[#B8C5D6]" />
          <span>Independent Platform Boundary Blueprint</span>
        </div>
        <span className="text-[11px] text-[#B8C5D6]">Architecture Stage</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/16 p-3.5 space-y-1">
          <div className="font-semibold text-[#F1F5F9]">Ownership Domain</div>
          <p className="text-[#B8C5D6]/80">Owned by CHIXUS as a separate technology initiative.</p>
        </div>
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/16 p-3.5 space-y-1">
          <div className="font-semibold text-[#F1F5F9]">Architectural Separation</div>
          <p className="text-[#B8C5D6]/80">Designed to operate independently from sibling applications.</p>
        </div>
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/16 p-3.5 space-y-1">
          <div className="font-semibold text-[#F1F5F9]">Current Stage</div>
          <p className="text-[#B8C5D6]/80">System architecture &amp; foundational specification only.</p>
        </div>
      </div>
    </div>
  );
}

function ShopSpurtPreview() {
  const [stage, setStage] = useState<'chat' | 'invoice' | 'escrow' | 'trust'>('chat');

  return (
    <div className="rounded-2xl bg-[#090D14] border border-[#35D6E8]/22 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8C5D6]/12 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F1F5F9]">
          <Shield className="w-4 h-4 text-[#35D6E8]" />
          <span>Conceptual Architecture Preview — SELL OUT Workflow</span>
        </div>
        <span className="text-[11px] text-[#B8C5D6]/75">Product Vision</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {([
          { id: 'chat', label: '1. Social Chat & Video' },
          { id: 'invoice', label: '2. SELL OUT Invoice' },
          { id: 'escrow', label: '3. Proposed Escrow Vault' },
          { id: 'trust', label: '4. Merchant Trust Tiers' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStage(tab.id)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              stage === tab.id
                ? 'bg-[#35D6E8]/15 border-[#35D6E8] text-[#35D6E8]'
                : 'bg-[#101722] border-[#B8C5D6]/14 text-[#B8C5D6] hover:text-[#F1F5F9]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {stage === 'chat' && (
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3.5 text-xs space-y-1.5">
          <div className="font-semibold text-[#F1F5F9]">Multi-Channel Broadcast &amp; Conversational Inspection</div>
          <p className="text-[#B8C5D6]/85 leading-relaxed">
            Proposed unified inbox connecting social broadcasts across Instagram, TikTok, WhatsApp, Facebook, and X with voice notes and WebRTC video product inspection.
          </p>
        </div>
      )}

      {stage === 'invoice' && (
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3.5 text-xs space-y-1.5">
          <div className="font-semibold text-[#F1F5F9]">In-Chat Dynamic Invoicing (SELL OUT)</div>
          <p className="text-[#B8C5D6]/85 leading-relaxed">
            Sellers generate itemized invoices directly inside the active buyer conversation without forcing shoppers into fragmented external tools.
          </p>
        </div>
      )}

      {stage === 'escrow' && (
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3.5 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-[#F1F5F9]">
            <Lock className="w-3.5 h-3.5 text-[#35D6E8]" />
            <span>Proposed Double-Entry Escrow Architecture</span>
          </div>
          <p className="text-[#B8C5D6]/85 leading-relaxed">
            Conceptual double-entry ledger holding buyer funds conditionally until delivery confirmation, with broader vision for P2P, local payouts, PIN/biometrics, and multi-currency FX.
          </p>
        </div>
      )}

      {stage === 'trust' && (
        <div className="rounded-xl bg-[#101722] border border-[#B8C5D6]/14 p-3.5 text-xs space-y-2">
          <div className="font-semibold text-[#F1F5F9]">Tiered Merchant Verification &amp; GPS Proximity</div>
          <div className="flex flex-wrap gap-3 text-[11px] text-[#B8C5D6]">
            <span>Gold Tier Audit</span>
            <span aria-hidden="true">·</span>
            <span>Silver Tier Audit</span>
            <span aria-hidden="true">·</span>
            <span>Blue Verification</span>
            <span aria-hidden="true">·</span>
            <span>GPS Proximity Context</span>
          </div>
        </div>
      )}
    </div>
  );
}
