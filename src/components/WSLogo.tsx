'use client';

import React from 'react';

interface WSLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const WSLogo: React.FC<WSLogoProps> = ({ size = 'sm', className = '', onClick }) => {
  // Dimension presets
  const sizeMap = {
    xs: { box: 'w-7 h-7 rounded-lg', ws: 'text-xs', year: 'text-[7px]' },
    sm: { box: 'w-9 h-9 rounded-xl', ws: 'text-sm tracking-tight', year: 'text-[9px]' },
    md: { box: 'w-12 h-12 rounded-2xl', ws: 'text-lg tracking-tight', year: 'text-xs' },
    lg: { box: 'w-16 h-16 rounded-[22px]', ws: 'text-2xl tracking-tight', year: 'text-sm' },
    xl: { box: 'w-24 h-24 rounded-[32px]', ws: 'text-4xl tracking-tight', year: 'text-lg' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`relative select-none flex flex-col items-center justify-center text-white shadow-md transition-transform ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${currentSize.box} ${className}`}
      style={{
        background: 'linear-gradient(180deg, #D81818 0%, #B80A0A 52%, #9E0404 100%)',
        boxShadow: '0 3px 8px rgba(184, 10, 10, 0.35), inset 0 1px 1px rgba(255,255,255,0.3)',
      }}
      title="Batalyon Wira Satya 1996"
    >
      {/* "WS" in Arial Black */}
      <span
        className={`font-black leading-none text-white ${currentSize.ws}`}
        style={{
          fontFamily: '"Arial Black", Gadget, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
          transform: 'translateY(1px)',
        }}
      >
        WS
      </span>

      {/* "1996" in Bierstadt / Aptos */}
      <span
        className={`font-semibold leading-none text-white/95 ${currentSize.year}`}
        style={{
          fontFamily: '"Bierstadt", "Aptos", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          letterSpacing: '0.04em',
          transform: 'translateY(2px)',
        }}
      >
        1996
      </span>
    </div>
  );
};

export default WSLogo;
