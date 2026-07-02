"use client";
import Image from "next/image";

export default function LogoIcon({ size = 36, className = "" }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="SureTalk"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
      unoptimized
    />
  );
}
