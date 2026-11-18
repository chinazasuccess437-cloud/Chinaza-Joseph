import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Leadership', href: '#attribution' },
  { label: 'Perspectives', href: '#endorsements' },
  { label: 'FAQ & AI', href: '#faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
        scrolled
          ? 'bg-[#090D14]/88 backdrop-blur-xl border-b border-[#B8C5D6]/12'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#hero"
          className="font-display text-lg font-bold tracking-tight text-[#F1F5F9] hover:text-[#35D6E8] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8] rounded"
        >
          Chinaza Joseph
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#B8C5D6]"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8] rounded"
            >
              <span>{item.label}</span>
              <span
                aria-hidden="true"
                className="absolute left-0 bottom-0 h-[1.5px] w-0 bg-[#35D6E8] transition-all duration-200 group-hover:w-full"
              />
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#090D14] bg-[#35D6E8] hover:bg-[#5ce1f0] rounded-lg transition-all duration-200 shadow-[0_0_24px_-6px_rgba(53,214,232,0.55)] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1F5F9]"
          >
            Connect
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-lg border border-[#B8C5D6]/20 bg-[#101722]/90 text-[#F1F5F9] hover:border-[#35D6E8]/50 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive mobile drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden bg-[#090D14]/96 backdrop-blur-xl border-b border-[#B8C5D6]/15 px-5 py-4 space-y-2"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#B8C5D6] hover:text-[#35D6E8] hover:bg-[#101722] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
