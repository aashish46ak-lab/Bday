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
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4800),
      setTimeout(() => setPhase(5), 6400),
      setTimeout(() => onComplete(), 8200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
      <div
        className={`absolute w-64 h-64 rounded-full blur-3xl transition-opacity duration-1000 ${
          phase >= 1 ? "opacity-70" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(232,160,180,0.45) 0%, transparent 70%)",
        }}
      />

      <div
        className={`relative transition-all duration-1000 ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <p className="text-xs tracking-[0.4em] uppercase text-[#e8a0b4] mb-5">
          Tonight is for you
        </p>
      </div>

      <div
        className={`relative transition-all duration-[1100ms] ${
          phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h1 className="text-4xl sm:text-6xl font-light tracking-wide text-[#5a3545]">
          Happy Birthday
        </h1>
      </div>

      <div
        className={`relative mt-4 transition-all duration-[1200ms] ${
          phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <h2 className="text-4xl sm:text-6xl font-medium text-[#c45c7a]">
          {SITE_CONFIG.person.name}
        </h2>
      </div>

      <div
        className={`mt-7 h-px transition-all duration-1000 ${
          phase >= 4 ? "w-20 opacity-60" : "w-0 opacity-0"
        }`}
        style={{
          background: "linear-gradient(90deg, transparent, #e8a0b4, transparent)",
        }}
      />

      <div
        className={`mt-5 transition-all duration-1000 ${
          phase >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-base text-[#8b6b78] italic">Something sweet is waiting…</p>
      </div>

      <div
        className={`mt-8 transition-all duration-700 ${
          phase >= 5 ? "opacity-50" : "opacity-0"
        }`}
      >
        <p className="text-xs tracking-[0.25em] uppercase text-[#c45c7a]">Make a wish</p>
      </div>
    </div>
  );
}
