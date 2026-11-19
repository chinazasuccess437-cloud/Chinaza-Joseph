import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Building2, ExternalLink, Globe2, Shield, Users } from 'lucide-react';
import chinazaPortrait from '../assets/images/chinaza-portrait.jpg';
import ikennaPortrait from '../assets/images/ikenna-joseph.jpg';
import alexPortrait from '../assets/images/alexander-kapitulsky.jpg';
import richPortrait from '../assets/images/rich.jpg';
import yigitPortrait from '../assets/images/yigit-emir.jpg';
import jamesPortrait from '../assets/images/james-freeborn.png';
import chiomaPortrait from '../assets/images/chioma-joseph.jpg';
import emmanuelPortrait from '../assets/images/emmanuel-bempong.jpg';
import {
  CORE_ENGINEERING_MEMBERS,
  EXECUTIVE_LEADERSHIP,
  PROFESSIONAL_NETWORK,
  TEAM_ATTRIBUTIONS,
} from '../data/portfolioData';

interface PhotoConfig {
  primary: string;
  fallback: string;
  positionClass: string;
}

const PERSON_PHOTOS: Record<string, PhotoConfig> = {
  'Chinaza Success Joseph': {
    primary: chinazaPortrait,
    fallback: '/assets/aistudio/1795030911144_f9549967.jpg',
    positionClass: 'object-[50%_44%] scale-125',
  },
  'Ikenna Joseph': {
    primary: ikennaPortrait,
    fallback: '/assets/aistudio/1795028015936_21571389.jpg',
    positionClass: 'object-[50%_44%]',
  },
  'Chioma Joseph': {
    primary: chiomaPortrait,
    fallback: '/assets/aistudio/1795032068195_86a36c9e.jpg',
    positionClass: 'object-[50%_45%]',
  },
  'Alexander Kapitulsky': {
    primary: alexPortrait,
    fallback: '/assets/aistudio/1795028185152_7f2f40ee.jpg',
    positionClass: 'object-[42%_22%]',
  },
  Richard: {
    primary: richPortrait,
    fallback: '/assets/aistudio/1795028434426_9d662ac8.jpg',
    positionClass: 'object-[50%_24%]',
  },
  'Yiğit Emir Karadağ': {
    primary: yigitPortrait,
    fallback: '/assets/aistudio/IMG_20261118_195118_965ba558.jpg',
    positionClass: 'object-top scale-[1.15] origin-top',
  },
  'James Freeborn': {
    primary: jamesPortrait,
    fallback: '/assets/aistudio/image_d4f77cdd.png',
    positionClass: 'object-[50%_20%]',
  },
  'Emmanuel Bempong': {
    primary: emmanuelPortrait,
    fallback: '/assets/aistudio/IMG-20261102-WA0015_423c2536.jpg',
    positionClass: 'object-[50%_62%] scale-[2.25] origin-[58%_57%]',
  },
};

function ProfileAvatar({
  name,
  initials,
  sizeClass = 'w-16 h-16 rounded-2xl',
  accentBorderClass = 'border-[#35D6E8]/35',
  initialsColorClass = 'text-[#35D6E8]',
}: {
  name: string;
  initials: string;
  sizeClass?: string;
  accentBorderClass?: string;
  initialsColorClass?: string;
}) {
  const photo = PERSON_PHOTOS[name];
  const [src, setSrc] = useState(photo?.primary ?? '');

  if (photo && src) {
    return (
      <div
        className={`${sizeClass} relative overflow-hidden border ${accentBorderClass} bg-[#090D14] shrink-0`}
      >
        <img
          src={src}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (src !== photo.fallback) {
              setSrc(photo.fallback);
            } else {
              setSrc('');
            }
          }}
          className={`w-full h-full object-cover ${photo.positionClass}`}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} border ${accentBorderClass} bg-gradient-to-br from-[#101722] to-[#090D14] flex items-center justify-center font-display text-lg font-bold ${initialsColorClass} shrink-0`}
    >
      {initials}
    </div>
  );
}

export function TeamCollaborationsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="attribution"
      className="relative z-10 py-20 sm:py-28 px-5 sm:px-8 border-t border-[#B8C5D6]/10"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section 1: CHIXUS Executive Leadership (Strictly separated from external network) */}
        <div className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              05. CHIXUS Executive Leadership
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
              Executive leadership guiding CHIXUS Systems.
            </h2>
            <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-relaxed">
              Dedicated executive leadership directing strategic operations, enterprise discipline, and systems architecture across CHIXUS Systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXECUTIVE_LEADERSHIP.map((exec, idx) => (
              <motion.article
                key={exec.name}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="living-glass-elevated rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
              >
                <div className="flex items-center gap-4">
                  <ProfileAvatar
                    name={exec.name}
                    initials={exec.initials}
                    sizeClass="w-16 h-16 rounded-2xl"
                    accentBorderClass="border-[#35D6E8]/45"
                    initialsColorClass="text-[#35D6E8]"
                  />

                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-[#F1F5F9] leading-snug">
                      {exec.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#35D6E8] tracking-wide">
                      {exec.role}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#D4DFEC] leading-relaxed pt-4 border-t border-[#B8C5D6]/14">
                  {exec.summary}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Section 2: Project Attribution & Core Team */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-5"
          >
            <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
              06. Team &amp; Company Attribution
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
              CHIXUS Systems &amp; project contributors.
            </h2>
            <p className="text-[15px] sm:text-base text-[#D4DFEC] leading-relaxed">
              Every system presented in this portfolio carries transparent attribution across co-built platforms, solo engineering studios, and initiatives under{' '}
              <span className="text-[#F1F5F9] font-medium">CHIXUS Systems</span>.
            </p>

            <div className="living-glass rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F1F5F9]">
                <Building2 className="w-4 h-4 text-[#35D6E8]" />
                <span>Company Identity: CHIXUS Systems</span>
              </div>
              <p className="text-sm text-[#D4DFEC] leading-relaxed">
                Parent technology organization behind CHIXUS, Qorvex ownership, and the ShopSpurt™ social commerce and financial trust architecture.
              </p>
            </div>

            {CORE_ENGINEERING_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="living-glass rounded-2xl p-5 flex items-start gap-4"
              >
                <ProfileAvatar
                  name={member.name}
                  initials={member.initials}
                  sizeClass="w-14 h-14 rounded-2xl"
                  accentBorderClass="border-[#35D6E8]/30"
                  initialsColorClass="text-[#35D6E8]"
                />
                <div className="space-y-1">
                  <div className="font-display text-base font-bold text-[#F1F5F9]">
                    {member.name}
                  </div>
                  <div className="text-xs font-medium text-[#35D6E8]">{member.role}</div>
                  <p className="text-sm text-[#D4DFEC] leading-relaxed">{member.summary}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="lg:col-span-7 living-glass-elevated rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#B8C5D6]/12">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F1F5F9]">
                <Users className="w-4 h-4 text-[#35D6E8]" />
                <span>Verified Project Contributions</span>
              </div>
              <span className="text-xs text-[#B8C5D6]">5 Systems</span>
            </div>

            <div className="divide-y divide-[#B8C5D6]/12">
              {TEAM_ATTRIBUTIONS.map((item) => (
                <div
                  key={item.project}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display text-base font-bold text-[#F1F5F9]">
                        {item.project}
                      </span>
                      <span className="text-[#B8C5D6]/35" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-medium text-[#35D6E8]">{item.context}</span>
                    </div>
                    <p className="text-xs text-[#B8C5D6]/85">{item.roleDetail}</p>
                  </div>

                  <div className="text-xs sm:text-sm font-medium text-[#F1F5F9] sm:text-right shrink-0">
                    {item.contributors}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Section 3: Professional Network (Separated cleanly from CHIXUS Executive Leadership) */}
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs sm:text-sm font-medium text-[#35D6E8] tracking-wide">
                07. Professional Network
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                Technical exchanges, product feedback &amp; independent perspectives.
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-[#B8C5D6]/80">
              <Shield className="w-4 h-4 text-[#8B70FF] shrink-0" />
              <span>External professional connections (distinct from CHIXUS leadership)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROFESSIONAL_NETWORK.map((person, idx) => (
              <motion.article
                key={person.name}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="living-glass rounded-3xl p-6 sm:p-7 space-y-4 hover:border-[#35D6E8]/35 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ProfileAvatar
                      name={person.name}
                      initials={person.initials}
                      sizeClass="w-15 h-15 rounded-2xl"
                      accentBorderClass="border-[#8B70FF]/35"
                      initialsColorClass="text-[#B8C5D6]"
                    />
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-bold text-[#F1F5F9]">
                        {person.name}
                      </h3>
                      <p className="text-xs font-medium text-[#35D6E8]">
                        {person.classification}
                      </p>
                      {person.building && (
                        <p className="text-xs font-medium text-[#C9D6E6]">
                          Building: <span className="text-[#F1F5F9]">{person.building}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${person.name} on LinkedIn`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B8C5D6]/20 bg-[#090D14]/80 text-xs font-medium text-[#D4DFEC] hover:border-[#35D6E8]/55 hover:text-[#35D6E8] transition-colors shrink-0"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-[#D4DFEC] leading-relaxed pt-3 border-t border-[#B8C5D6]/14">
                  {person.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Collaboration Domains */}
        <div className="living-glass rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-display text-base font-bold text-[#F1F5F9]">
              <Globe2 className="w-4 h-4 text-[#35D6E8]" />
              <span>AI Systems &amp; Prompt Architecture</span>
            </div>
            <p className="text-xs sm:text-[13px] text-[#B8C5D6]/85 leading-relaxed">
              Designing multi-model orchestration pipelines, prompt hierarchies, and structured evaluation boundaries for technical products.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-base font-bold text-[#F1F5F9]">
              Product &amp; Application Architecture
            </h3>
            <p className="text-xs sm:text-[13px] text-[#B8C5D6]/85 leading-relaxed">
              Collaborating with founders and engineering teams on full-stack web applications, API contracts, and offline-capable system designs.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-base font-bold text-[#F1F5F9]">
              Interactive Web &amp; Venture Prototyping
            </h3>
            <p className="text-xs sm:text-[13px] text-[#B8C5D6]/85 leading-relaxed">
              Translating complex system concepts into responsive, production-ready web interfaces and interactive product showcases.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
