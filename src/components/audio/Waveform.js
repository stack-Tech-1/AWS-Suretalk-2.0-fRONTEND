"use client";

/**
 * Animated waveform decoration component.
 *
 * Props:
 *   isActive  — true while recording or playing (bars animate tall)
 *   barCount  — number of bars (default 12)
 *   height    — container height in px (default 40)
 *   color     — CSS color string (default uses --audio token)
 *   className — extra classes
 */
export default function Waveform({
  isActive = false,
  barCount = 12,
  height = 40,
  color,
  className = '',
}) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      className={`flex items-end gap-[3px] ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {bars.map((i) => (
        <span
          key={i}
          className={`waveform-bar${isActive ? '' : ' idle'}`}
          style={{
            height: isActive ? `${randomHeight(i, barCount)}%` : '30%',
            animationDelay: `${(i * 0.07).toFixed(2)}s`,
            animationDuration: `${(0.9 + (i % 5) * 0.12).toFixed(2)}s`,
            ...(color ? { background: color } : {}),
          }}
        />
      ))}
    </div>
  );
}

function randomHeight(index, total) {
  // deterministic "random" heights so SSR and client match
  const heights = [60, 90, 45, 75, 100, 55, 85, 40, 70, 95, 50, 80, 65, 35, 78];
  return heights[index % heights.length];
}
