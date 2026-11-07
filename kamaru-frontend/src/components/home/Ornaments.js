import React from "react";
import { motion } from "framer-motion";

// Archimedean spiral (r = 1.6·θ) rendered once as a polyline path
const SPIRAL_PATH = (() => {
  const pts = [];
  for (let t = 0; t <= Math.PI * 6.2; t += 0.15) {
    const r = 1.6 * t * 1.6;
    pts.push(`${(100 + r * Math.cos(t)).toFixed(1)} ${(100 + r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
})();

/** Rayed sun with a spiral core — echoes the mark on the event programme. */
export const SunSpiral = ({ className = "", color = "#D57500", spin = true }) => (
  <svg viewBox="0 0 200 200" className={`${className} ${spin ? "animate-spin-slow" : ""}`} aria-hidden="true">
    <g fill={color}>
      {Array.from({ length: 16 }).map((_, i) => (
        <polygon key={i} points="100,4 108,30 92,30" transform={`rotate(${i * 22.5} 100 100)`} />
      ))}
    </g>
    <circle cx="100" cy="100" r="64" fill={color} />
    <path
      d={SPIRAL_PATH}
      fill="none"
      stroke="#FBF3E8"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

/** Stylised Kikuyu shield (ngo) silhouette with chevron markings. */
export const Shield = ({ className = "", fill = "#B5441B", accent = "#FBF3E8" }) => (
  <svg viewBox="0 0 100 180" className={className} aria-hidden="true">
    <path d="M50 2 C80 20 96 60 96 90 C96 120 80 160 50 178 C20 160 4 120 4 90 C4 60 20 20 50 2Z" fill={fill} />
    <path d="M50 18 L50 162" stroke={accent} strokeWidth="3" />
    {[40, 70, 100, 130].map((y) => (
      <path key={y} d={`M22 ${y} L50 ${y - 14} L78 ${y}`} fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
    ))}
    <ellipse cx="50" cy="90" rx="10" ry="16" fill={accent} />
  </svg>
);

/** Animated equaliser bars — the "Kamaru" sound. */
export const SoundBars = ({ bars = 24, className = "", color = "#D57500" }) => (
  <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
    {Array.from({ length: bars }).map((_, i) => {
      const base = 20 + ((i * 37) % 60);
      return (
        <motion.span
          key={i}
          className="w-[3px] md:w-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ height: `${base}%` }}
          animate={{ height: [`${base}%`, `${100 - base / 2}%`, `${base / 2 + 10}%`, `${base}%`] }}
          transition={{ duration: 1.4 + (i % 5) * 0.2, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.1 }}
        />
      );
    })}
  </div>
);

/** Wavy section edge in the cream background colour. */
export const WaveEdge = ({ className = "", fill = "#FBF3E8", flip = false }) => (
  <svg
    viewBox="0 0 1440 80"
    preserveAspectRatio="none"
    className={`block w-full h-10 md:h-16 ${flip ? "rotate-180" : ""} ${className}`}
    aria-hidden="true"
  >
    <path d="M0 40 C240 90 480 -10 720 40 C960 90 1200 -10 1440 40 L1440 80 L0 80 Z" fill={fill} />
  </svg>
);

