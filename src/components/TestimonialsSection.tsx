import { ArrowDown, MessageSquarePlus, Quote, ShieldCheck, Trash2 } from 'lucide-react';
import { usePerspectives } from '../context/PerspectivesContext';

function formatPerspectiveDate(timestamp: { toDate?: () => Date } | null): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return 'Verified entry';
  try {
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Verified entry';
  }
}

export function TestimonialsSection() {
  const {
    user,
    perspectives,
    perspectivesLoading,
    perspectivesError,
    deletePerspective,
  } = usePerspectives();

  return (
    <section
      id="endorsements"
      className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              08. Shared Perspectives
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
              Real perspectives shared by visitors &amp; peers.
            </h2>
            <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-relaxed">
              Every perspective displayed here is authored directly by a Google-authenticated visitor alongside their required portrait photo.
            </p>
          </div>

          <a
            href="#share-perspective"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#35D6E8]/15 border border-[#35D6E8]/45 text-xs sm:text-sm font-semibold text-[#35D6E8] hover:bg-[#35D6E8] hover:text-[#090D14] transition-all shrink-0 self-start lg:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Share Your Perspective</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>

        {perspectivesLoading && (
          <div className="living-glass rounded-3xl p-8 text-sm text-[#C9D6E6]">
            Loading verified visitor perspectives…
          </div>
        )}

        {!perspectivesLoading && perspectivesError && (
          <div className="living-glass rounded-3xl p-8 text-sm text-[#D4DFEC] border-[#8B70FF]/35">
            {perspectivesError}
          </div>
        )}

        {!perspectivesLoading && !perspectivesError && perspectives.length === 0 && (
          <div className="living-glass-elevated rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#35D6E8] tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Google Sign-In · Picture Required</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F1F5F9]">
                Be the first to leave your perspective for Chinaza Joseph.
              </h3>
              <p className="text-sm text-[#D4DFEC] leading-relaxed">
                Sign in with your Google account under Initiate an Architectural Conversation below, attach your picture, and share your perspective or feedback directly.
              </p>
            </div>

            <a
              href="#share-perspective"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] text-[#090D14] text-sm font-semibold transition-all shrink-0 shadow-[0_10px_28px_-8px_rgba(53,214,232,0.55)]"
            >
              <span>Sign In &amp; Add Perspective</span>
              <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        )}

        {!perspectivesLoading && perspectives.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {perspectives.map((item) => {
              const canDelete = Boolean(user) && user?.uid === item.authorUid;

              return (
                <article
                  key={item.id}
                  className="living-glass-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#35D6E8]/40 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#35D6E8] tracking-wide">
                        <Quote className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Verified Perspective</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#B8C5D6]/75">
                          {formatPerspectiveDate(item.createdAt)}
                        </span>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void deletePerspective(item.id)}
                            aria-label={`Delete perspective from ${item.authorName}`}
                            title="Delete perspective"
                            className="p-1.5 rounded-lg border border-[#B8C5D6]/20 text-[#B8C5D6] hover:text-[#35D6E8] hover:border-[#35D6E8]/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <blockquote className="text-[15px] sm:text-base text-[#F1F5F9] leading-relaxed whitespace-pre-line">
                      &ldquo;{item.message}&rdquo;
                    </blockquote>
                  </div>

                  <div className="pt-5 border-t border-[#B8C5D6]/14 flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden border border-[#35D6E8]/40 bg-[#090D14] shrink-0">
                      <img
                        src={item.photoUrl}
                        alt={item.authorName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-[#F1F5F9] truncate">
                        {item.authorName}
                      </h3>
                      {item.authorRole && (
                        <p className="text-xs text-[#C9D6E6] leading-snug truncate">
                          {item.authorRole}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
