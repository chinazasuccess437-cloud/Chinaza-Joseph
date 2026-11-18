import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BrainCircuit,
  Code2,
  GitFork,
  Globe,
  Layers,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { CAPABILITY_CATEGORIES } from '../data/portfolioData';

const CAPABILITY_ICONS: Record<string, typeof BrainCircuit> = {
  'ai-systems': BrainCircuit,
  'multi-model': GitFork,
  'prompt-architecture': TerminalSquare,
  hitl: ShieldCheck,
  'app-architecture': Layers,
  'web-development': Globe,
};

const TOPOLOGY_NODES = [
  {
    id: 'framing',
    label: '01 · Problem Framing',
    role: 'Human Architect',
    detail:
      'Defines domain invariants, explicit system boundaries, and failure tolerances before any model prompt executes.',
  },
  {
    id: 'prompt',
    label: '02 · Prompt Architecture',
    role: 'Structured Contract',
    detail:
      'Encodes layered instructions, deterministic output schemas, and strict non-hallucination constraints.',
  },
  {
    id: 'orchestration',
    label: '03 · Multi-Model Routing',
    role: 'Specialized Models',
    detail:
      'Dispatches reasoning, comparative research, synthesis, and implementation subtasks to models suited for each role.',
  },
  {
    id: 'synthesis',
    label: '04 · System Synthesis',
    role: 'App & API Layer',
    detail:
      'Assembles full-stack web interfaces, backend APIs, and offline-capable data flows into cohesive products.',
  },
  {
    id: 'hitl',
    label: '05 · HITL Verification',
    role: 'Independent Gate',
    detail:
      'Human architectural review validates outputs, verifies edge cases, and holds final release accountability.',
  },
];

export function CapabilitiesSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);
  const currentNode = TOPOLOGY_NODES[activeNodeIdx];

  return (
    <section
      id="capabilities"
      className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10"
    >
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              04. AI Systems Architecture &amp; Technical Capabilities
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-[#F1F5F9] leading-tight">
              Structured intelligence paired with resilient software engineering.
            </h2>
          </div>
          <p className="lg:col-span-5 text-sm sm:text-base text-[#D4DFEC] leading-relaxed">
            Every capability centers on turning ambiguous product challenges into deterministic architectures, modular websites, and verifiable AI workflows.
          </p>
        </div>

        {/* Interactive Multi-Model & HITL Topology Diagram */}
        <div className="living-glass-elevated rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#B8C5D6]/12">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F1F5F9]">
              <Code2 className="w-4 h-4 text-[#35D6E8]" />
              <span>Interactive Systems Architecture Flow</span>
            </div>
            <span className="text-xs text-[#B8C5D6]">
              Select a node to inspect boundary responsibilities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
            {TOPOLOGY_NODES.map((node, idx) => {
              const isSelected = idx === activeNodeIdx;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveNodeIdx(idx)}
                  className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#101722] border-[#35D6E8] shadow-[0_10px_28px_-12px_rgba(53,214,232,0.5)]'
                      : 'bg-[#090D14]/75 border-[#B8C5D6]/14 hover:border-[#35D6E8]/40'
                  }`}
                >
                  <div className="font-mono text-[11px] text-[#35D6E8] tabular-nums">
                    {node.role}
                  </div>
                  <div className="font-display text-sm font-semibold text-[#F1F5F9] mt-1">
                    {node.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-[#090D14]/90 border border-[#B8C5D6]/18 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#35D6E8]">{currentNode.label}</div>
              <p className="text-sm sm:text-[15px] text-[#D4DFEC] leading-relaxed max-w-3xl">
                {currentNode.detail}
              </p>
            </div>
            <div className="text-xs font-mono text-[#C9D6E6] shrink-0">
              Boundary: {currentNode.role}
            </div>
          </div>
        </div>

        {/* Six Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITY_CATEGORIES.map((category, idx) => {
            const Icon = CAPABILITY_ICONS[category.id] ?? Layers;
            return (
              <motion.article
                key={category.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="living-glass rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-[#35D6E8]/35 transition-colors duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#090D14] border border-[#35D6E8]/30 flex items-center justify-center text-[#35D6E8]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs text-[#B8C5D6]/60 tabular-nums">
                      0{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-[#F1F5F9]">
                      {category.title}
                    </h3>
                    <p className="text-xs font-medium text-[#35D6E8]">{category.subtitle}</p>
                  </div>

                  <p className="text-sm sm:text-[15px] text-[#D4DFEC] leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <ul className="pt-4 border-t border-[#B8C5D6]/14 space-y-2 text-xs sm:text-[13px] text-[#C9D6E6]">
                  {category.focusAreas.map((area) => (
                    <li key={area} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#35D6E8] shrink-0" aria-hidden="true" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
