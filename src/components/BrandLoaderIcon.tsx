import { useState } from 'react';

const PRIMARY_ICON_PHOTO = '/assets/aistudio/1795030911144_f9549967.jpg';
const FALLBACK_ICON_PHOTO = '/app-icon-192.png';

interface BrandLoaderIconProps {
  size?: 'xs' | 'sm' | 'lg';
  spinning?: boolean;
}

export function BrandLoaderIcon({ size = 'sm', spinning = true }: BrandLoaderIconProps) {
  const [src, setSrc] = useState(PRIMARY_ICON_PHOTO);
  const usingFallback = src !== PRIMARY_ICON_PHOTO;

  const dims =
    size === 'lg'
      ? {
          outer: 'w-28 h-28 sm:w-32 sm:h-32',
          ringRadius: 'rounded-[30px]',
          imgWrap: 'inset-[5px] rounded-[24px]',
        }
      : size === 'sm'
        ? {
            outer: 'w-9 h-9',
            ringRadius: 'rounded-xl',
            imgWrap: 'inset-[2.5px] rounded-[9px]',
          }
        : {
            outer: 'w-5 h-5',
            ringRadius: 'rounded-md',
            imgWrap: 'inset-[1.5px] rounded-[4px]',
          };

  return (
    <div
      className={`relative ${dims.outer} shrink-0 flex items-center justify-center`}
      aria-hidden="true"
    >
      {/* Subtle rotating conic border arc for loading state */}
      <div
        className={`absolute inset-0 ${dims.ringRadius} p-[2px] ${
          spinning ? 'animate-spin' : ''
        }`}
        style={{
          animationDuration: size === 'lg' ? '2.4s' : '1.3s',
          background:
            'conic-gradient(from 0deg, #35D6E8 0deg, rgba(139, 112, 255, 0.85) 110deg, rgba(184, 197, 214, 0.14) 220deg, rgba(53, 214, 232, 0.08) 320deg, #35D6E8 360deg)',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Rounded App-Icon Portrait Frame */}
      <div
        className={`absolute ${dims.imgWrap} overflow-hidden bg-[#090D14] border border-[#35D6E8]/25 shadow-[0_8px_24px_-6px_rgba(53,214,232,0.38)]`}
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => {
            if (src !== FALLBACK_ICON_PHOTO) {
              setSrc(FALLBACK_ICON_PHOTO);
            }
          }}
          className={`w-full h-full object-cover ${
            usingFallback ? 'object-center' : 'object-[54%_55%] scale-[1.35]'
          }`}
        />
      </div>
    </div>
  );
}
