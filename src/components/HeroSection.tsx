import { useState, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowRight, Layers, Mic } from 'lucide-react';
import chinazaPortrait from '../assets/images/chinaza-portrait.jpg';
import { HERO_PROFILE } from '../data/portfolioData';

const FALLBACK_PORTRAIT_PATH =
  '/assets/aistudio/1795030911144_f9549967.jpg';

const ARCHITECTURAL_PILLARS = [
  {
    label: 'AI Systems & Prompt Architecture',
    detail: 'Layered instruction hierarchies, semantic guardrails & deterministic output schemas',
  },
  {
    label: 'Multi-Model Orchestration',
    detail: 'Specialized model routing for reasoning, comparative research & implementation',
  },
  {
    label: 'Human-in-the-Loop (HITL) Systems',
    detail: 'Independent human verification gates & accountable architectural decisions',
  },
  {
    label: 'AI-Driven Product Architecture',
    detail: 'Technical problem-solving across full-stack web, backend APIs & offline-capable systems',
  },
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [imgSrc, setImgSrc] = useState(chinazaPortrait);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 7,
      rotateY: x * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section
      id="hero"
      className="relative z-10 pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 px-5 sm:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Two-Column Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Identity & Introduction */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            {/* Unboxed typographic kicker */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium tracking-wide text-[#35D6E8]">
              <span>{HERO_PROFILE.title}</span>
              <span aria-hidden="true" className="text-[#B8C5D6]/40">
                ·
              </span>
              <span className="text-[#B8C5D6]">{HERO_PROFILE.company}</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.15rem] font-bold tracking-tight text-[#F1F5F9] leading-[1.06]">
                {HERO_PROFILE.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#B8C5D6]/85 font-medium">
                Full name: <span className="text-[#F1F5F9]">{HERO_PROFILE.fullName}</span>
              </p>

              <p className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-[#B8C5D6] leading-snug max-w-2xl pt-1">
                {HERO_PROFILE.focusLine}
              </p>
            </div>

            <p className="text-base sm:text-[17px] text-[#DCE6F2] leading-[1.7] max-w-2xl">
              {HERO_PROFILE.intro}
            </p>

            {/* Unboxed Positioning Specialties */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs sm:text-[13px] text-[#C9D6E6] max-w-2xl">
              {HERO_PROFILE.positioningRoles.map((role, index) => (
                <span key={role} className="inline-flex items-center gap-2.5">
                  <span className={index === 0 ? 'text-[#35D6E8] font-medium' : ''}>{role}</span>
                  {index < HERO_PROFILE.positioningRoles.length - 1 && (
                    <span aria-hidden="true" className="text-[#B8C5D6]/45">
                      /
                    </span>
                  )}
                </span>
              ))}
            </div>

            <p className="text-xs sm:text-[13px] text-[#B8C5D6]/85 max-w-2xl">
              Designed for technical evaluation by investors, hiring managers, founders, and collaborators—separating shipped products from active builds and system blueprints.
            </p>

            {/* Primary Navigation CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] text-[#090D14] font-semibold text-sm transition-all duration-200 shadow-[0_10px_30px_-8px_rgba(53,214,232,0.55)] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1F5F9]"
              >
                <span>View Five Systems</span>
                <ArrowDownRight className="w-4 h-4" />
              </a>

              <a
                href="#capabilities"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-[#B8C5D6]/25 bg-[#101722]/80 hover:border-[#35D6E8]/60 hover:text-[#35D6E8] text-[#F1F5F9] font-medium text-sm transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8]"
              >
                <Layers className="w-4 h-4 text-[#35D6E8]" />
                <span>Architectural Capabilities</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#intelligence"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#8B70FF]/35 bg-[#8B70FF]/10 hover:border-[#35D6E8]/60 hover:text-[#35D6E8] text-[#F1F5F9] font-medium text-sm transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8]"
              >
                <Mic className="w-4 h-4 text-[#35D6E8]" />
                <span>Voice &amp; AI Briefing</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Dimensional Floating Portrait Composition */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex items-center justify-center lg:justify-end"
          >
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[430px] lg:max-w-none lg:h-full min-h-[430px] flex items-center justify-center"
              style={{ perspective: '1100px' }}
            >
              {/* Atmospheric ambient rim glow behind portrait */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-3xl opacity-55 blur-2xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(53, 214, 232, 0.24), transparent 58%), radial-gradient(circle at 80% 78%, rgba(139, 112, 255, 0.2), transparent 55%)',
                }}
              />

              {/* Floating Dimensional Frame */}
              <div
                className="relative w-full aspect-[4/5] rounded-3xl p-3 living-glass-elevated transition-transform duration-300 ease-out animate-float-slow"
                style={{
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Subtle animated cyan light trail across top hairline */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-6 right-6 h-px overflow-hidden pointer-events-none"
                >
                  <div className="h-full w-28 bg-gradient-to-r from-transparent via-[#35D6E8] to-transparent animate-light-trail" />
                </div>

                {/* Portrait Image Viewport (cleanly crops out top/bottom screenshot bars) */}
                <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-[#090D14]">
                  <img
                    src={imgSrc}
                    alt="Chinaza Success Joseph — Founder and Lead Systems Architect"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      if (imgSrc !== FALLBACK_PORTRAIT_PATH) {
                        setImgSrc(FALLBACK_PORTRAIT_PATH);
                      }
                    }}
                    className="w-full h-full object-cover object-[50%_55%] brightness-[0.98] contrast-[1.03]"
                  />

                  {/* Measured bottom contrast scrim for readable caption */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#090D14]/92 via-[#090D14]/18 to-transparent pointer-events-none"
                  />

                  {/* Subtle architectural caption inside lower frame */}
                  <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="font-display text-base font-semibold text-[#F1F5F9]">
                        {HERO_PROFILE.name}
                      </p>
                      <p className="text-[11px] text-[#B8C5D6]/85">
                        {HERO_PROFILE.fullName}
                      </p>
                      <p className="text-xs text-[#35D6E8] mt-0.5">
                        Founder &amp; Lead Systems Architect · CHIXUS Systems
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-[#35D6E8] tracking-wide shrink-0">
                      HITL · AI SYSTEMS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Architectural Pillars Row Below Split */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 lg:mt-16 pt-8 border-t border-[#B8C5D6]/14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {ARCHITECTURAL_PILLARS.map((pillar) => (
            <div key={pillar.label} className="space-y-1.5">
              <div className="font-display text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35D6E8] shrink-0" aria-hidden="true" />
                <span>{pillar.label}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#C9D6E6] leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
