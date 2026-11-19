import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/portfolioData';
import { SystemsIntelligenceConsole } from './SystemsIntelligenceConsole';

export function FAQSection() {
  const prefersReducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string>(FAQ_ITEMS[0]?.id ?? '');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      id="faq"
      className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
            09. Orchestration FAQ &amp; Live Intelligence
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
            Methodology answers &amp; real-time architectural briefing.
          </h2>
          <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-relaxed">
            Explore common questions on Multi-Model Orchestration, Human-in-the-Loop governance, and systems consulting—or start a real-time voice and Q&amp;A discussion directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 6 Cols: Collapsible FAQ Accordion */}
          <motion.div
            initial={prefersReducedMotion ? false : { y: 10 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6 space-y-3"
          >
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const triggerId = `faq-trigger-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`living-glass rounded-2xl transition-colors duration-200 ${
                    isOpen ? 'border-[#35D6E8]/45 bg-[#101722]/95' : 'hover:border-[#B8C5D6]/30'
                  }`}
                >
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8] rounded-2xl"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-[#35D6E8] tracking-wide">
                          <span className="font-mono tabular-nums">0{idx + 1}</span>
                          <span className="text-[#B8C5D6]/40" aria-hidden="true">
                            ·
                          </span>
                          <span>{item.category}</span>
                        </div>
                        <span className="block font-display text-base sm:text-[17px] font-semibold text-[#F1F5F9] leading-snug">
                          {item.question}
                        </span>
                      </div>

                      <ChevronDown
                        aria-hidden="true"
                        className={`w-5 h-5 text-[#35D6E8] shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-6 pb-5 pt-1 text-sm text-[#D4DFEC] leading-relaxed border-t border-[#B8C5D6]/10">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Right 6 Cols: Live Voice, Search Grounding & Maps Grounding Console */}
          <motion.div
            id="intelligence"
            initial={prefersReducedMotion ? false : { y: 10 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="lg:col-span-6 scroll-mt-24"
          >
            <SystemsIntelligenceConsole />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
