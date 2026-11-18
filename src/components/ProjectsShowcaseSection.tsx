import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PROJECTS, type ProjectItem, type ProjectStatus } from '../data/portfolioData';
import { ProjectIcon } from './ProjectIcons';
import { ProjectPreviewVisual } from './ProjectPreviewVisuals';

type FilterKey = 'all' | 'live' | 'development' | 'architecture';

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#35D6E8]">
        <span className="w-1.5 h-1.5 rotate-45 bg-[#35D6E8]" aria-hidden="true" />
        <span>LIVE</span>
      </span>
    );
  }

  if (status === 'UNDER DEVELOPMENT') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#8B70FF]">
        <Compass className="w-3.5 h-3.5" aria-hidden="true" />
        <span>UNDER DEVELOPMENT</span>
      </span>
    );
  }

  if (status === 'ON ARCHITECTURE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#B8C5D6]">
        <Layers className="w-3.5 h-3.5" aria-hidden="true" />
        <span>ON ARCHITECTURE</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#35D6E8]/85">
      <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
      <span>PRODUCT ARCHITECTURE</span>
    </span>
  );
}

export function ProjectsShowcaseSection() {
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<ProjectItem['id']>('chixus');
  const [modalProject, setModalProject] = useState<ProjectItem | null>(null);

  const filteredProjects = PROJECTS.filter((p) =>
    filter === 'all' ? true : p.filterGroup === filter
  );

  const activeSpotlight =
    filteredProjects.find((p) => p.id === selectedProjectId) ?? filteredProjects[0] ?? PROJECTS[0];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalProject(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <section
      id="projects"
      className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header + Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              03. Featured Applications &amp; Ventures
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-[#F1F5F9] leading-tight">
              Five systems spanning diagnostics, motion tooling, discovery &amp; commerce architecture.
            </h2>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="tablist"
            aria-label="Filter projects by stage"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#101722] border border-[#B8C5D6]/14 self-start lg:self-auto"
          >
            {([
              { key: 'all', label: 'All Five' },
              { key: 'live', label: 'Live' },
              { key: 'development', label: 'Development' },
              { key: 'architecture', label: 'Architecture' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.key
                    ? 'bg-[#35D6E8] text-[#090D14] font-semibold shadow-sm'
                    : 'text-[#B8C5D6] hover:text-[#F1F5F9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Project Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {filteredProjects.map((project, idx) => {
            const isSelected = activeSpotlight.id === project.id;
            return (
              <motion.div
                key={project.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                onClick={() => setSelectedProjectId(project.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProjectId(project.id);
                  }
                }}
                aria-pressed={isSelected}
                className={`group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8] ${
                  isSelected
                    ? 'living-glass-elevated -translate-y-1'
                    : 'living-glass hover:-translate-y-1 hover:border-[#35D6E8]/35'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={isSelected ? 'animate-float-gentle' : ''}>
                      <ProjectIcon projectId={project.id} size="md" />
                    </div>
                    {project.version && (
                      <span className="font-mono text-xs font-semibold text-[#35D6E8] tabular-nums">
                        {project.version}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <StatusBadge status={project.status} />
                    <h3 className="font-display text-lg font-bold text-[#F1F5F9] group-hover:text-[#35D6E8] transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#D4DFEC] leading-relaxed line-clamp-3">
                      {project.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#B8C5D6]/14 flex items-center justify-between text-xs">
                  <span className="text-[#C9D6E6] truncate">{project.attribution}</span>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-[#35D6E8] translate-x-0.5' : 'text-[#B8C5D6]/60'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Case Study Inspector Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSpotlight.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="living-glass-elevated rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8"
          >
            {/* Spotlight Top Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#B8C5D6]/14">
              <div className="flex items-start sm:items-center gap-5">
                <div className="animate-float-gentle">
                  <ProjectIcon projectId={activeSpotlight.id} size="lg" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={activeSpotlight.status} />
                    {activeSpotlight.version && (
                      <>
                        <span className="text-[#B8C5D6]/35" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#F1F5F9] tabular-nums">
                          {activeSpotlight.version}
                        </span>
                      </>
                    )}
                    {activeSpotlight.company && (
                      <>
                        <span className="text-[#B8C5D6]/35" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-[#B8C5D6]">{activeSpotlight.company}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F1F5F9]">
                    {activeSpotlight.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8C5D6]">
                    Attribution: <span className="text-[#F1F5F9] font-medium">{activeSpotlight.attribution}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalProject(activeSpotlight)}
                  className="px-4 py-2.5 rounded-xl border border-[#B8C5D6]/25 bg-[#090D14]/70 hover:border-[#35D6E8]/60 text-xs sm:text-sm font-medium text-[#F1F5F9] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Open Full Case Study
                </button>

                {activeSpotlight.publicUrl && (
                  <a
                    href={activeSpotlight.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] text-[#090D14] text-xs sm:text-sm font-semibold transition-all shadow-[0_8px_24px_-8px_rgba(53,214,232,0.55)] whitespace-nowrap shrink-0"
                  >
                    <span>Launch Application</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Spotlight Body: Definition + Problem + Capabilities + Interactive Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35D6E8]">
                    System Definition
                  </h4>
                  <p className="text-sm sm:text-[15px] text-[#F1F5F9] leading-[1.7]">
                    {activeSpotlight.definition}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9D6E6]">
                    Problem Addressed
                  </h4>
                  <p className="text-sm sm:text-[15px] text-[#D4DFEC] leading-[1.7]">
                    {activeSpotlight.problemSolved}
                  </p>
                  {activeSpotlight.problemsList && (
                    <ul className="mt-2.5 space-y-2 text-sm text-[#D4DFEC]">
                      {activeSpotlight.problemsList.map((problem) => (
                        <li key={problem} className="flex items-start gap-2">
                          <span className="text-[#35D6E8] mt-1" aria-hidden="true">
                            ·
                          </span>
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9D6E6]">
                    Core Capabilities &amp; Architectural Pillars
                  </h4>
                  <ul className="space-y-2 text-sm text-[#D4DFEC]">
                    {activeSpotlight.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#35D6E8] mt-2 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <ProjectPreviewVisual projectId={activeSpotlight.id} />

                {/* Governance / Scope Clarity Notes */}
                <div className="rounded-2xl bg-[#090D14]/90 border border-[#B8C5D6]/18 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]">
                    <ShieldCheck className="w-4 h-4 text-[#35D6E8]" />
                    <span>Architectural Scope &amp; Accuracy Boundary</span>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#D4DFEC] leading-relaxed">
                    {activeSpotlight.governanceNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detailed Project Case Study Modal */}
      {modalProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalProject(null);
          }}
          className="fixed inset-0 z-50 bg-[#090D14]/88 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div className="living-glass-elevated rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#B8C5D6]/14">
              <div className="flex items-center gap-4">
                <ProjectIcon projectId={modalProject.id} size="md" />
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={modalProject.status} />
                    {modalProject.version && (
                      <span className="font-mono text-xs text-[#F1F5F9] tabular-nums">
                        {modalProject.version}
                      </span>
                    )}
                  </div>
                  <h3 id="case-study-title" className="font-display text-2xl font-bold text-[#F1F5F9] mt-1">
                    {modalProject.name}
                  </h3>
                  <p className="text-xs text-[#B8C5D6]">
                    {modalProject.attribution}
                    {modalProject.company ? ` · ${modalProject.company}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalProject(null)}
                aria-label="Close case study"
                className="p-2 rounded-xl border border-[#B8C5D6]/20 text-[#B8C5D6] hover:text-[#F1F5F9] hover:border-[#35D6E8]/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-[#B8C5D6] leading-relaxed">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35D6E8] mb-1.5">
                  Overview
                </h4>
                <p className="text-[#F1F5F9]">{modalProject.definition}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35D6E8] mb-1.5">
                  Problem Space
                </h4>
                <p>{modalProject.problemSolved}</p>
                {modalProject.problemsList && (
                  <ul className="mt-2 space-y-1.5">
                    {modalProject.problemsList.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span className="text-[#35D6E8]">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {modalProject.pillars && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35D6E8]">
                    Architectural Pillars
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modalProject.pillars.map((pillar) => (
                      <div
                        key={pillar.title}
                        className="rounded-2xl bg-[#090D14]/80 border border-[#B8C5D6]/14 p-4 space-y-1"
                      >
                        <div className="text-xs font-semibold text-[#F1F5F9]">{pillar.title}</div>
                        <p className="text-xs text-[#B8C5D6]/85 leading-relaxed">{pillar.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(modalProject.targetUsers || modalProject.revenueModel) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modalProject.targetUsers && (
                    <div className="rounded-2xl bg-[#090D14]/80 border border-[#B8C5D6]/14 p-4 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35D6E8]">
                        Target Users
                      </h4>
                      <ul className="space-y-1 text-xs">
                        {modalProject.targetUsers.map((u) => (
                          <li key={u}>· {u}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {modalProject.revenueModel && (
                    <div className="rounded-2xl bg-[#090D14]/80 border border-[#B8C5D6]/14 p-4 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35D6E8]">
                        Proposed Revenue Model
                      </h4>
                      <ul className="space-y-1 text-xs">
                        {modalProject.revenueModel.map((r) => (
                          <li key={r}>· {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <ProjectPreviewVisual projectId={modalProject.id} />

              <div className="rounded-2xl bg-[#090D14]/80 border border-[#B8C5D6]/14 p-4 space-y-1.5 text-xs">
                <div className="font-semibold text-[#F1F5F9]">Verification &amp; Scope Notes</div>
                {modalProject.governanceNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#B8C5D6]/14 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalProject(null)}
                className="px-4 py-2 rounded-xl border border-[#B8C5D6]/20 text-xs font-medium text-[#B8C5D6] hover:text-[#F1F5F9] cursor-pointer"
              >
                Close Case Study
              </button>
              {modalProject.publicUrl && (
                <a
                  href={modalProject.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] text-[#090D14] text-xs font-semibold transition-colors"
                >
                  <span>Visit Live Application</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
