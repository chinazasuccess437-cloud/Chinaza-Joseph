import { useState } from 'react';
import chixusIcon from '../assets/icons/chixus-icon.png';
import loomaIconSvg from '../assets/icons/looma-icon.svg';
import loomaIconPng from '../assets/icons/looma-icon.png';
import gloweaveIcon from '../assets/icons/gloweave-icon.png';
import qorvexIcon from '../assets/icons/qorvex-icon.png';
import shopspurtIcon from '../assets/icons/shopspurt-icon.jpg';
import type { ProjectItem } from '../data/portfolioData';

interface ProjectIconProps {
  projectId: ProjectItem['id'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-11 h-11 rounded-xl',
  md: 'w-14 h-14 rounded-2xl',
  lg: 'w-16 h-16 rounded-2xl',
};

const FALLBACK_ASSETS: Record<ProjectItem['id'], string> = {
  chixus: chixusIcon,
  looma: loomaIconPng,
  gloweave: '/assets/aistudio/file_00000000f8d081f4b9c54166c8314eca_001118e7.png',
  qorvex: '/assets/aistudio/qordex-icon_8f8673c3.png',
  shopspurt: '/assets/aistudio/IMG_20261024_144015_14f8bb9a.jpg',
};

const PRIMARY_ASSETS: Record<ProjectItem['id'], { src: string; alt: string; frameClass: string }> = {
  chixus: {
    src: chixusIcon,
    alt: 'CHIXUS application icon',
    frameClass: 'border-[#35D6E8]/35 bg-[#090D14] shadow-[0_8px_24px_-6px_rgba(53,214,232,0.35)]',
  },
  looma: {
    src: loomaIconSvg,
    alt: 'Looma application icon',
    frameClass: 'border-[#35D6E8]/30 bg-[#090B10] shadow-[0_8px_24px_-6px_rgba(59,130,246,0.3)]',
  },
  gloweave: {
    src: gloweaveIcon,
    alt: 'Gloweave application icon',
    frameClass: 'border-[#8B70FF]/35 bg-[#090D14] shadow-[0_8px_24px_-6px_rgba(139,112,255,0.3)]',
  },
  qorvex: {
    src: qorvexIcon,
    alt: 'Qorvex application icon',
    frameClass: 'border-[#35D6E8]/30 bg-[#090D14] shadow-[0_8px_24px_-6px_rgba(53,214,232,0.28)]',
  },
  shopspurt: {
    src: shopspurtIcon,
    alt: 'ShopSpurt application icon',
    frameClass: 'border-[#B8C5D6]/30 bg-[#101722] shadow-[0_8px_24px_-6px_rgba(184,197,214,0.25)]',
  },
};

export function ProjectIcon({ projectId, size = 'md', className = '' }: ProjectIconProps) {
  const sizeClass = SIZE_CLASSES[size];
  const config = PRIMARY_ASSETS[projectId];
  const [src, setSrc] = useState(config.src);

  return (
    <div
      className={`${sizeClass} relative overflow-hidden border ${config.frameClass} shrink-0 ${className}`}
    >
      <img
        src={src}
        alt={config.alt}
        referrerPolicy="no-referrer"
        onError={() => {
          const fallback = FALLBACK_ASSETS[projectId];
          if (src !== fallback) {
            setSrc(fallback);
          }
        }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
