import React, { useId } from 'react';

interface ManaHealthLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ManaHealthLogoProps['size']>, string> = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24 sm:w-28 sm:h-28',
  xl: 'w-28 h-28 sm:w-36 sm:h-36'
};

export const ManaHealthLogo: React.FC<ManaHealthLogoProps> = ({
  size = 'lg',
  className = ''
}) => {
  const uid = useId().replace(/:/g, '');
  const redGradId = `mhc-red-${uid}`;
  const blueGradId = `mhc-blue-${uid}`;
  const greenGradId = `mhc-green-${uid}`;

  return (
    <svg
      viewBox="0 0 120 112"
      className={`${SIZE_CLASSES[size]} select-none ${className}`}
      role="img"
      aria-label="MANA HEALTH CONNECT Heart Logo with Family and Medical Cross"
    >
      <defs>
        <linearGradient id={redGradId} x1="0" y1="0" x2="120" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id={blueGradId} x1="40" y1="0" x2="120" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id={greenGradId} x1="18" y1="78" x2="105" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="55%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {/* Left Red Heart Ribbon */}
      <path
        d="M58 29 C50 16 36 11 23 18 C10 26 8 44 16 62 C24 79 42 90 55 95 C41 85 30 74 26 58 C22 43 26 28 38 25 C46 23 53 27 58 34 Z"
        fill={`url(#${redGradId})`}
      />

      {/* Right Blue Heart Ribbon + Upper-Right Medical Cross Lobe */}
      <path
        d="M56 32 C61 17 75 9 90 13 C105 17 112 34 107 52 C101 73 82 88 62 95 C78 85 92 71 95 54 C97 46 92 45 84 46 C73 46 63 39 56 32 Z"
        fill={`url(#${blueGradId})`}
      />
      <circle cx="85" cy="30" r="16" fill={`url(#${blueGradId})`} />

      {/* Crisp White Medical Cross */}
      <rect x="81.5" y="21" width="7" height="18" rx="1.6" fill="#ffffff" />
      <rect x="76" y="26.5" width="18" height="7" rx="1.6" fill="#ffffff" />

      {/* Family Silhouette (Father Blue, Mother Green, Child Orange with White Halo) */}
      <circle cx="43" cy="48" r="6.8" fill="#1d4ed8" />
      <path d="M31 85 C31 64 36 58 43 58 C50 58 54 64 54 86 Q42 87 31 85 Z" fill="#1d4ed8" />

      <circle cx="76.5" cy="51.5" r="6.2" fill="#16a34a" />
      <path d="M66.5 86 C66.5 66.5 70.5 61 76.5 61 C82.5 61 87.5 66.5 87.5 84 Q77 87 66.5 86 Z" fill="#16a34a" />

      <path
        d="M49.5 66 C52 66 55 70 57 72.5 L63 72.5 C65 70 68 66 70.5 66 C72 68.5 69 75 65.5 77.5 L65.5 90 Q60 91 54.5 90 L54.5 77.5 C51 75 48 68.5 49.5 66 Z"
        fill="#f97316"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="63" r="5.2" fill="#f97316" stroke="#ffffff" strokeWidth="2" />

      {/* Sweeping Green Leaf Base */}
      <path
        d="M19 82 C42 96 77 94 103 74 C92 99 57 110 26 96 C21 94 18 88 19 82 Z"
        fill={`url(#${greenGradId})`}
      />
      <path d="M27 89 Q63 98 96 79" fill="none" stroke="#dcfce7" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};
