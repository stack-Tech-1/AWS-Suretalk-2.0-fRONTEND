"use client";

export default function LogoIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Blue lower chevron (location pin base) */}
      <path d="M 20 62 Q 20 92 50 110 Q 80 92 80 62 Z" fill="#5371FF" />
      {/* Red phone handset (C-shape horseshoe with inner U-notch) */}
      <path d="M 20 62 Q 20 30 50 28 Q 80 30 80 62 L 67 62 Q 67 47 50 46 Q 33 47 33 62 Z" fill="#FF5758" />
      {/* White ring (location pin hole / donut) */}
      <circle cx="50" cy="62" r="18" fill="white" />
      {/* Blue center dot */}
      <circle cx="50" cy="62" r="10" fill="#5371FF" />
      {/* Wifi arc 1 (wider) */}
      <path d="M 29 24 Q 50 13 71 24" stroke="#FF5758" strokeWidth="5.5" strokeLinecap="round" />
      {/* Wifi arc 2 (narrower, higher) */}
      <path d="M 37 15 Q 50 6 63 15" stroke="#FF5758" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}
