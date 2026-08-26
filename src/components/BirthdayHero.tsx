"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/config";

interface Props {
  onComplete: () => void;
}

export default function BirthdayHero({ onComplete }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3400),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 7000),
      setTimeout(() => onComplete(), 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none overflow-hidden">
      {/* soft light bloom */}
      <div
        className={`absolute w-[280px] h-[280px] rounded-full blur-3xl transition-opacity duration-[2000ms] ${
          phase >= 1 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(232,200,122,0.22) 0%, transparent 70%)",
        }}
      />

      {/* line 1 */}
      <div
        className={`relative transition-all duration-1000 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-xs sm:text-sm tracking-[0.45em] uppercase text-[#e8c87a]/90 mb-6">
          Tonight is for you
        </p>
      </div>

      {/* HAPPY BIRTHDAY — letter stagger feel via scale */}
      <div
        className={`relative transition-all duration-[1200ms] ease-out ${
          phase >= 2
            ? "opacity-100 scale-100 blur-0"
            : "opacity-0 scale-90 blur-sm"
        }`}
      >
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.08em] text-[#fff8f0]"
          style={{
            textShadow:
              "0 0 40px rgba(232,200,122,0.35), 0 0 80px rgba(232,200,122,0.15)",
          }}
        >
          Happy Birthday
        </h1>
      </div>

      {/* name */}
      <div
        className={`relative mt-5 sm:mt-7 transition-all duration-[1300ms] ease-out ${
          phase >= 3 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
        }`}
      >
        <h2
          className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-wide"
          style={{
            background:
              "linear-gradient(120deg, #e8c87a 0%, #f5e6c8 40%, #e8b4c8 70%, #e8c87a 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: phase >= 3 ? "shimmer 4s ease-in-out infinite" : "none",
          }}
        >
          {SITE_CONFIG.person.name}
        </h2>
      </div>

      {/* decorative line */}
      <div
        className={`mt-8 h-px transition-all duration-1000 ${
          phase >= 4 ? "w-24 opacity-70" : "w-0 opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent, #e8c87a, transparent)",
        }}
      />

      {/* closing line */}
      <div
        className={`mt-6 transition-all duration-1000 ${
          phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-base sm:text-lg text-[#c9b8e8]/90 font-light italic">
          Something special is waiting…
        </p>
      </div>

      {/* soft cue before cake */}
      <div
        className={`mt-10 transition-all duration-700 ${
          phase >= 5 ? "opacity-60" : "opacity-0"
        }`}
      >
        <p className="text-xs tracking-[0.3em] uppercase text-[#e8c87a]/70">
          Make a wish
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  );
}
