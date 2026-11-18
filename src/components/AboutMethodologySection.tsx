import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2, Cpu, GraduationCap, MapPin, ShieldCheck } from 'lucide-react';
import { EDUCATION_LIST, EXPERTISE_LIST, METHODOLOGY_STAGES } from '../data/portfolioData';

export function AboutMethodologySection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage = METHODOLOGY_STAGES[activeStageIndex];

  return (
    <section
      id="philosophy"
      className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10"
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {/* About Me & Systems Architecture Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-5"
          >
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              01. About &amp; Systems Philosophy
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
              Architecture-first engineering guided by human accountability.
            </h2>
            <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-[1.72]">
              Modern software is constrained by{' '}
              <span className="text-[#F1F5F9] font-medium">
                architectural clarity, system boundaries, and verification discipline
              </span>
              . As Founder &amp; Lead Systems Architect, my work centers on defining product vision, decomposing complex domains, orchestrating multiple AI models, and governing every transition from blueprint to production.
            </p>
            <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-[1.72]">
              Rather than treating AI as an autonomous black box—or claiming to hand-write every line manually—I direct structured multi-model workflows where human architectural reasoning and independent validation govern every system invariant.
            </p>

            {/* Education Block */}
            <div className="pt-3 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#35D6E8]">
                <GraduationCap className="w-4 h-4" />
                <span>Education</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {EDUCATION_LIST.map((edu) => (
                  <div
                    key={edu.institution}
                    className="living-glass rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-sm font-medium text-[#F1F5F9]">
                      {edu.institution}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#B8C5D6] shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[#35D6E8]" />
                      <span>{edu.location}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Core Technical Expertise Matrix (Exact 8 Areas) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="lg:col-span-7 living-glass rounded-3xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#B8C5D6]/12">
              <h3 className="font-display text-lg font-semibold text-[#F1F5F9]">
                Core Technical Expertise
              </h3>
              <span className="text-xs text-[#B8C5D6]">
                System Design · Multi-Model Orchestration · Delivery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {EXPERTISE_LIST.map((item, idx) => (
                <div
                  key={item}
                  className="flex items-start gap-3 py-1.5 text-sm sm:text-[15px] text-[#D4DFEC] hover:text-[#F1F5F9] transition-colors"
                >
                  <span className="font-mono text-xs text-[#35D6E8] tabular-nums pt-1 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#B8C5D6]/14 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-[#C9D6E6] leading-relaxed">
                Personal architectural expertise includes offline-capable application architecture alongside online-first AI systems.
              </p>
              <a
                href="#projects"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#35D6E8] hover:text-[#5ce1f0] whitespace-nowrap shrink-0"
              >
                <span>See Systems in Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* 7-Stage Interactive Working Methodology */}
        <div id="methodology" className="scroll-mt-24 space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              02. Multi-Model Orchestration Methodology
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F1F5F9]">
              Seven-stage Human-in-the-Loop engineering workflow.
            </h2>
            <p className="text-sm sm:text-base text-[#B8C5D6]/85 leading-relaxed">
              Select any stage below to inspect how architectural decision-making, multi-model specialization, and validation gates work together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Stage Selector List */}
            <div className="lg:col-span-5 space-y-2">
              {METHODOLOGY_STAGES.map((stage, idx) => {
                const isActive = idx === activeStageIndex;
                return (
                  <button
                    key={stage.step}
                    type="button"
                    onClick={() => setActiveStageIndex(idx)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                      isActive
                        ? 'bg-[#101722] border-[#35D6E8]/55 text-[#F1F5F9] shadow-[0_8px_24px_-12px_rgba(53,214,232,0.45)]'
                        : 'bg-[#090D14]/65 border-[#B8C5D6]/12 text-[#B8C5D6] hover:border-[#B8C5D6]/30 hover:text-[#F1F5F9]'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs tabular-nums shrink-0 ${
                        isActive ? 'text-[#35D6E8] font-semibold' : 'text-[#B8C5D6]/60'
                      }`}
                    >
                      {stage.step}
                    </span>
                    <span className="text-sm font-medium leading-snug">{stage.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Inspector Panel */}
            <div className="lg:col-span-7 living-glass-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#B8C5D6]/12">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#35D6E8] tabular-nums">
                      Stage {activeStage.step}
                    </span>
                    <span className="text-[#B8C5D6]/40" aria-hidden="true">
                      /
                    </span>
                    <span className="text-xs text-[#B8C5D6]">
                      {activeStage.artifact}
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl sm:text-[1.7rem] font-bold text-[#F1F5F9] leading-snug">
                  {activeStage.title}
                </h3>

                <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-[1.7]">
                  {activeStage.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl bg-[#090D14]/90 border border-[#35D6E8]/25 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#35D6E8]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Human Architect Direction</span>
                  </div>
                  <p className="text-sm text-[#D4DFEC] leading-relaxed">
                    {activeStage.humanRole}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#090D14]/90 border border-[#8B70FF]/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E2EAF4]">
                    <Cpu className="w-4 h-4 text-[#8B70FF] shrink-0" />
                    <span>AI Model Execution</span>
                  </div>
                  <p className="text-sm text-[#D4DFEC] leading-relaxed">
                    {activeStage.aiRole}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#B8C5D6]/12 flex items-center justify-between text-xs text-[#B8C5D6]/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#35D6E8] shrink-0" />
                  <span>
                    Verified before advancing to Stage{' '}
                    {activeStageIndex < 6 ? METHODOLOGY_STAGES[activeStageIndex + 1].step : 'Release'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeStageIndex === 0}
                    onClick={() => setActiveStageIndex((i) => Math.max(0, i - 1))}
                    className="px-2.5 py-1 rounded border border-[#B8C5D6]/20 hover:border-[#35D6E8]/50 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={activeStageIndex === METHODOLOGY_STAGES.length - 1}
                    onClick={() =>
                      setActiveStageIndex((i) => Math.min(METHODOLOGY_STAGES.length - 1, i + 1))
                    }
                    className="px-2.5 py-1 rounded border border-[#B8C5D6]/20 hover:border-[#35D6E8]/50 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
