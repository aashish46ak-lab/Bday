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
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setPhase(2), 2800),
      setTimeout(() => setPhase(3), 4200),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => onComplete(), 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
      <div
        className={`transition-all duration-1000 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <p className="text-sm sm:text-base tracking-[0.35em] uppercase text-[#e8c87a]/80 mb-4">
          A little something for
        </p>
      </div>

      <div
        className={`transition-all duration-[1400ms] ease-out ${
          phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#fff8f0] drop-shadow-[0_0_40px_rgba(232,200,122,0.3)]">
          HAPPY BIRTHDAY
        </h1>
      </div>

      <div
        className={`mt-4 sm:mt-6 transition-all duration-[1400ms] ease-out delay-100 ${
          phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium bg-gradient-to-r from-[#e8c87a] via-[#f5e6c8] to-[#e8b4c8] bg-clip-text text-transparent">
          {SITE_CONFIG.person.name}
        </h2>
      </div>

      <div
        className={`mt-8 transition-all duration-1000 ${
          phase >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-lg sm:text-xl text-[#c9b8e8]/90 font-light italic">
          Today is all about you. ✨
        </p>
      </div>
    </div>
  );
}
