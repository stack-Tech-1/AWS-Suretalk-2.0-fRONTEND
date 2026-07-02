"use client";

export default function LogoIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="112" fill="#5371FF"/>
      <rect x="46" y="46" width="420" height="420" rx="84" fill="#FFFFFF"/>
      <g transform="translate(256 262) scale(0.72) translate(-256 -256)">
        <path
          d="M 116 278 Q 116 262 132 262 L 380 262 Q 396 262 396 278 L 396 300 C 396 390 328 446 270 476 Q 256 483 242 476 C 184 446 116 390 116 300 Z"
          fill="#5371FF"
        />
        <path
          d="M 116 228 Q 117 240 128 240 L 384 240 Q 395 240 396 228 A 140 108 0 0 0 116 228 Z"
          fill="#FF5758"
        />
        <rect x="221" y="184" width="70" height="68" rx="17" fill="#FFFFFF"/>
        <circle cx="256" cy="274" r="74" fill="#FFFFFF"/>
        <circle cx="256" cy="274" r="47" fill="#5371FF"/>
        <path d="M 132 88 Q 256 4 380 88" stroke="#FF5758" strokeWidth="22" strokeLinecap="round" fill="none"/>
        <path d="M 152 122 Q 256 62 360 122" stroke="#FF5758" strokeWidth="22" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}
