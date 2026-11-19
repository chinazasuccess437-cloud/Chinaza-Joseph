import { useState } from 'react';
import chinazaAppIcon from '../assets/images/chinaza_app_icon_1795098406271.jpg';

const PRIMARY_BRAND_ICON = '/icon-512.png';

interface BrandLoaderIconProps {
  size?: 'xs' | 'sm' | 'lg';
  spinning?: boolean;
}

export function BrandLoaderIcon({ size = 'sm', spinning = true }: BrandLoaderIconProps) {
  const [src, setSrc] = useState<string>(PRIMARY_BRAND_ICON);
  const usingFallback = src !== PRIMARY_BRAND_ICON;

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

      {/* Rounded App-Icon Frame */}
      <div
        className={`absolute ${dims.imgWrap} overflow-hidden bg-[#090D14] border border-[#35D6E8]/25 shadow-[0_8px_24px_-6px_rgba(53,214,232,0.38)]`}
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => {
            if (src !== chinazaAppIcon) {
              setSrc(chinazaAppIcon);
            }
          }}
          className={`w-full h-full object-cover object-center ${
            usingFallback ? 'scale-[1.38]' : ''
          }`}
        />
      </div>
    </div>
  );
}
