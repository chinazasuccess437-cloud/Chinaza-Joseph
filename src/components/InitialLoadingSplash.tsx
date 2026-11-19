import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BrandLoaderIcon } from './BrandLoaderIcon';
import { HERO_PROFILE } from '../data/portfolioData';

const FIRST_VISIT_STORAGE_KEY = 'chinaza_portfolio_entered_v1';

function isFirstPortfolioVisit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(FIRST_VISIT_STORAGE_KEY) !== '1';
  } catch {
    return false;
  }
}

function markPortfolioVisited(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FIRST_VISIT_STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors in restricted browsing contexts
  }
}

export function InitialLoadingSplash() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => isFirstPortfolioVisit());
  const [progress, setProgress] = useState(14);

  useEffect(() => {
    if (!visible) return;

    const totalDuration = prefersReducedMotion ? 550 : 1750;
    const stepOne = window.setTimeout(() => setProgress(62), prefersReducedMotion ? 120 : 420);
    const stepTwo = window.setTimeout(() => setProgress(100), prefersReducedMotion ? 320 : 1220);
    const doneTimer = window.setTimeout(() => {
      markPortfolioVisited();
      setVisible(false);
    }, totalDuration);

    return () => {
      window.clearTimeout(stepOne);
      window.clearTimeout(stepTwo);
      window.clearTimeout(doneTimer);
    };
  }, [visible, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="Loading Chinaza Joseph portfolio"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.015 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-[#090D14] flex flex-col items-center justify-center px-6 select-none overflow-hidden"
        >
          {/* Subtle atmospheric background radial */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(53, 214, 232, 0.14), transparent 52%), radial-gradient(circle at 55% 60%, rgba(139, 112, 255, 0.1), transparent 55%)',
            }}
          />

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-xs w-full"
          >
            <BrandLoaderIcon size="lg" spinning={!prefersReducedMotion} />

            <div className="space-y-1.5">
              <p className="font-display text-2xl font-bold tracking-tight text-[#F1F5F9]">
                {HERO_PROFILE.name}
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#35D6E8]">
                {HERO_PROFILE.title}
              </p>
              <p className="text-xs text-[#B8C5D6]/75">
                {HERO_PROFILE.company}
              </p>
            </div>

            {/* Minimal hairline progress track */}
            <div className="w-44 h-[3px] rounded-full bg-[#101722] border border-[#B8C5D6]/12 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#35D6E8] to-[#8B70FF] transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
