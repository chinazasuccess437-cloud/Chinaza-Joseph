import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  LogOut,
  Mail,
  Send,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { HERO_PROFILE } from '../data/portfolioData';
import { usePerspectives } from '../context/PerspectivesContext';
import { compressProfileImage } from '../lib/firebase';

function SocialAppIcon({ label }: { label: string }) {
  if (label === 'GitHub') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  if (label === 'X') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (label === 'Medium') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    );
  }

  // Quora Q mark
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
      <path d="M12.37 2C6.89 2 3 5.87 3 11.15c0 5.18 3.74 8.95 9.02 9.13.97 1.32 2.24 2.22 3.92 2.22 1.67 0 2.9-.84 3.43-2.2l-1.52-.64c-.34.67-.89 1.03-1.61 1.03-.96 0-1.66-.56-2.23-1.41 3.78-1.14 6.19-4.29 6.19-8.13C20.2 5.87 17.11 2 12.37 2zm-.13 15.8c-3.17 0-5.12-2.66-5.12-6.65 0-3.99 1.95-6.64 5.12-6.64 3.16 0 5.05 2.65 5.05 6.64 0 2.71-.88 4.86-2.43 5.93-.72-.89-1.58-1.54-2.82-1.54-.89 0-1.63.36-2.08.91l1.02 1.05c.26-.2.57-.31.92-.31.78 0 1.29.43 1.75 1.15-.44.18-.92.26-1.41.26z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.97z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export function ContactFooterSection() {
  const {
    user,
    authReady,
    authBusy,
    authError,
    signInWithGoogle,
    logOut,
    submitPerspective,
  } = usePerspectives();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [message, setMessage] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (user?.displayName && !authorName) {
      setAuthorName(user.displayName);
    }
  }, [user, authorName]);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError('');
    setFormSuccess(false);
    setPhotoLoading(true);
    try {
      const compressed = await compressProfileImage(file);
      setPhotoDataUrl(compressed);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to process picture.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!photoDataUrl) {
      setFormError(
        'Your picture is compulsory before submitting—please upload your photo (or attach your Google profile photo) so people can see who shared this perspective.'
      );
      return;
    }

    if (message.trim().length < 5) {
      setFormError('Please write at least 5 characters sharing your perspective or message for Chinaza.');
      return;
    }

    setSubmitting(true);
    try {
      await submitPerspective({
        authorName,
        authorRole,
        photoUrl: photoDataUrl,
        message,
      });
      setMessage('');
      setAuthorRole('');
      setFormSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Unable to publish your perspective. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section
        id="contact"
        className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="living-glass-elevated rounded-3xl p-7 sm:p-10 lg:p-12 space-y-10">
            {/* Top Row: Initiate an architectural conversation + Icon-only Direct Links */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-[#B8C5D6]/14">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
                  10. Contact &amp; Professional Opportunities
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                  Initiate an architectural conversation.
                </h2>
                <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-relaxed max-w-xl">
                  Available for AI systems architecture, multi-model orchestration design, full-stack application direction, and technical leadership collaborations.
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-col lg:items-end space-y-4">
                <div className="text-xs font-medium text-[#C9D6E6]">
                  Connect via Email or Social Platforms
                </div>

                <div className="flex flex-wrap items-center gap-3.5">
                  <a
                    href={HERO_PROFILE.mailtoHref}
                    aria-label="Send email to Chinaza Joseph"
                    title="Email"
                    className="w-14 h-14 rounded-2xl bg-[#35D6E8] hover:bg-[#5ce1f0] text-[#090D14] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-[0_10px_28px_-8px_rgba(53,214,232,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1F5F9]"
                  >
                    <Mail className="w-6 h-6" aria-hidden="true" />
                  </a>

                  {HERO_PROFILE.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className="w-14 h-14 rounded-2xl living-glass flex items-center justify-center text-[#F1F5F9] hover:text-[#35D6E8] hover:border-[#35D6E8]/55 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6E8]"
                    >
                      <SocialAppIcon label={social.label} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Area: Google Sign-In & Compulsory-Photo Perspective Submission */}
            <div id="share-perspective" className="scroll-mt-24 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#35D6E8] tracking-wide">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Share Your Perspective With Chinaza Joseph</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F1F5F9]">
                    Want to say something to Chinaza or share your perspective?
                  </h3>
                  <p className="text-sm text-[#D4DFEC] leading-relaxed">
                    You sign in with your Google account so we can verify who you are before you share what you want to say to Chinaza or publish your perspective—and uploading your picture is required so your photo appears beside your perspective.
                  </p>
                </div>

                {user && (
                  <button
                    type="button"
                    onClick={() => void logOut()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#B8C5D6]/25 bg-[#090D14]/80 text-xs font-medium text-[#D4DFEC] hover:border-[#35D6E8]/50 hover:text-[#35D6E8] transition-colors cursor-pointer self-start md:self-center shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out ({user.displayName || 'Google Account'})</span>
                  </button>
                )}
              </div>

              {!authReady && (
                <div className="rounded-2xl bg-[#090D14]/80 border border-[#B8C5D6]/14 p-5 text-sm text-[#C9D6E6]">
                  Checking Google sign-in status…
                </div>
              )}

              {authReady && !user && (
                <div className="rounded-2xl bg-[#090D14]/85 border border-[#B8C5D6]/16 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <p className="text-sm font-semibold text-[#F1F5F9]">
                      Why Google Sign-In is required
                    </p>
                    <p className="text-sm text-[#D4DFEC] leading-relaxed">
                      Signing in with Google verifies your identity so you can share your genuine thoughts, feedback, or architectural perspective with Chinaza—and ensures only real contributors appear in the Perspectives section.
                    </p>
                    {authError && (
                      <div className="flex items-start gap-2 pt-2 text-xs text-[#F1F5F9]">
                        <AlertCircle className="w-4 h-4 text-[#8B70FF] shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    disabled={authBusy}
                    className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#F1F5F9] hover:bg-white text-[#090D14] text-sm font-semibold transition-all cursor-pointer shrink-0 shadow-[0_10px_28px_-10px_rgba(241,245,249,0.35)] disabled:opacity-60"
                  >
                    {authBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}

              {authReady && user && (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl bg-[#090D14]/85 border border-[#B8C5D6]/16 p-6 sm:p-8 space-y-6"
                >
                  {/* Compulsory Picture Upload Row */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#101722]/90 border border-[#35D6E8]/28 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#35D6E8]/45 bg-[#090D14] flex items-center justify-center shrink-0">
                      {photoDataUrl ? (
                        <img
                          src={photoDataUrl}
                          alt="Your selected portrait"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-7 h-7 text-[#B8C5D6]/60" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#F1F5F9]">
                          Your Picture
                        </span>
                        <span className="text-xs font-semibold text-[#35D6E8]">
                          (Required)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#D4DFEC] leading-relaxed">
                        Please upload your picture so when you share your perspective, visitors can see who you are.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="sr-only"
                          id="perspective-photo-upload"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={photoLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] text-[#090D14] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {photoLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{photoDataUrl ? 'Change Picture' : 'Upload Your Picture'}</span>
                        </button>

                        {user.photoURL && photoDataUrl !== user.photoURL && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoDataUrl(user.photoURL ?? '');
                              setFormError('');
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#B8C5D6]/25 bg-[#090D14] text-xs font-medium text-[#D4DFEC] hover:border-[#35D6E8]/50 hover:text-[#35D6E8] transition-colors cursor-pointer"
                          >
                            Use Google Profile Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name & Role Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="perspective-author-name"
                        className="block text-xs font-medium text-[#C9D6E6]"
                      >
                        Your Name *
                      </label>
                      <input
                        id="perspective-author-name"
                        type="text"
                        required
                        maxLength={80}
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="perspective-author-role"
                        className="block text-xs font-medium text-[#C9D6E6]"
                      >
                        Your Role or Context (Optional)
                      </label>
                      <input
                        id="perspective-author-role"
                        type="text"
                        maxLength={100}
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="e.g. Software Engineer, Founder, Collaborator"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8]"
                      />
                    </div>
                  </div>

                  {/* Perspective / Message Question */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="perspective-message"
                      className="block text-xs font-medium text-[#C9D6E6]"
                    >
                      What would you like to say to Chinaza or share as your perspective? *
                    </label>
                    <textarea
                      id="perspective-message"
                      rows={4}
                      required
                      minLength={5}
                      maxLength={1200}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your perspective on Chinaza Joseph’s AI systems architecture, projects, or leave a direct note..."
                      className="w-full px-4 py-3 rounded-xl bg-[#101722] border border-[#B8C5D6]/20 text-sm text-[#F1F5F9] placeholder-[#B8C5D6]/50 focus:outline-none focus:border-[#35D6E8] resize-y"
                    />
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#8B70FF]/12 border border-[#8B70FF]/40 text-xs text-[#F1F5F9]">
                      <AlertCircle className="w-4 h-4 text-[#8B70FF] shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#35D6E8]/12 border border-[#35D6E8]/40 text-xs text-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#35D6E8] shrink-0" />
                        <span>Your perspective and picture have been published!</span>
                      </div>
                      <a
                        href="#endorsements"
                        className="font-semibold text-[#35D6E8] hover:underline"
                      >
                        View in Shared Perspectives
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-[#B8C5D6]/75">
                      {photoDataUrl
                        ? 'Picture attached and ready.'
                        : 'Upload your picture above before submitting.'}
                    </span>
                    <button
                      type="submit"
                      disabled={submitting || photoLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#35D6E8] hover:bg-[#5ce1f0] disabled:opacity-55 text-sm font-semibold text-[#090D14] transition-all cursor-pointer shadow-[0_8px_24px_-8px_rgba(53,214,232,0.55)]"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Publish Perspective</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#B8C5D6]/12 bg-[#090D14]/90 py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C9D6E6]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="font-display font-semibold text-[#F1F5F9]">Chinaza Joseph</span>
            <span aria-hidden="true">·</span>
            <span>{HERO_PROFILE.fullName}</span>
            <span aria-hidden="true">·</span>
            <span>Founder &amp; Lead Systems Architect</span>
            <span aria-hidden="true">·</span>
            <span>CHIXUS Systems</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="#projects" className="hover:text-[#35D6E8] transition-colors">
              Projects
            </a>
            <a href="#capabilities" className="hover:text-[#35D6E8] transition-colors">
              Capabilities
            </a>
            <a href="#attribution" className="hover:text-[#35D6E8] transition-colors">
              Leadership
            </a>
            <a href="#endorsements" className="hover:text-[#35D6E8] transition-colors">
              Perspectives
            </a>
            <a href="#faq" className="hover:text-[#35D6E8] transition-colors">
              FAQ
            </a>
            <a
              href={HERO_PROFILE.mailtoHref}
              aria-label="Send email to Chinaza Joseph"
              title="Email"
              className="p-2 rounded-lg border border-[#B8C5D6]/20 text-[#35D6E8] hover:border-[#35D6E8]/60 hover:text-[#5ce1f0] transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
            </a>
            <span>&copy; 2026 Chinaza Joseph</span>
          </div>
        </div>
      </footer>
    </>
  );
}
