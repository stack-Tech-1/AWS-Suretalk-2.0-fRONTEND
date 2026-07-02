"use client";

export default function LogoIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="4" width="92" height="92" rx="20" fill="white" />
      <path d="M 20 58 Q 20 82 50 88 Q 80 82 80 58 Z" fill="#5371FF" />
      <path d="M 20 58 Q 20 30 50 30 Q 80 30 80 58 Z" fill="#FF5758" />
      <path d="M 33 24 Q 50 15 67 24" stroke="#FF5758" strokeWidth="4" strokeLinecap="round" />
      <path d="M 40 16 Q 50 9 60 16" stroke="#FF5758" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="44" r="11" fill="#5371FF" />
    </svg>
  );
}
