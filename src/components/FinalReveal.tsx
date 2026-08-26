"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";
import { audio } from "@/lib/audio";
import Fireworks from "./Fireworks";

interface Props {
  active: boolean;
}

export default function FinalReveal({ active }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) return;
    audio.fadeMusic(0.3, 2);
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => setPhase(4), 4200),
      setTimeout(() => setPhase(5), 5600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6">
      {phase >= 3 && <Fireworks active intensity={0.9} />}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute text-[#f0a8bc]/30 select-none"
            style={{
              left: `${10 + i * 14}%`,
              top: `${15 + (i % 3) * 25}%`,
              fontSize: `${16 + (i % 3) * 8}px`,
              animation: `floatH ${4 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      {phase >= 1 && (
        <div
          className="relative z-10 mb-6"
          style={{ animation: "fadeScale 1s ease-out both" }}
        >
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white mx-auto"
            style={{ boxShadow: "0 8px 32px rgba(224,122,154,0.3)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ESHA_PHOTO}
              alt="Esha"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {phase >= 2 && (
        <h1
          className="relative z-10 text-3xl sm:text-4xl font-medium text-center"
          style={{
            color: "#e07a9a",
            fontFamily: "Georgia, serif",
            animation: "fadeScale 1s ease-out both",
            textShadow: "0 2px 20px rgba(224,122,154,0.25)",
          }}
        >
          Happy Birthday, Esha
        </h1>
      )}

      {phase >= 4 && (
        <div
          className="relative z-10 mt-6 text-center max-w-sm space-y-3"
          style={{ animation: "fadeUp 0.9s ease-out both" }}
        >
          <p className="text-sm text-[#5a3545] leading-relaxed">
            May this year be gentle with you, bright with joy, and full of
            moments that make you smile.
          </p>
          <p className="text-[#e07a9a] text-base">
            जन्मदिनको हार्दिक शुभकामना ✨
          </p>
        </div>
      )}

      {phase >= 5 && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-6 py-3.5 rounded-2xl border border-[#f0a8bc]/40 bg-white/85 backdrop-blur-md text-center shadow-sm"
          style={{ animation: "fadeUp 0.8s ease-out both" }}
        >
          <p className="text-[#e07a9a] text-sm tracking-wide font-medium">
            {SITE_CONFIG.person.name}
          </p>
          <p className="text-xs text-[#9a7080] mt-1">
            🎂 {SITE_CONFIG.person.dobBS}
          </p>
          <p className="text-xs text-[#9a7080] mt-0.5">
            📍 {SITE_CONFIG.person.home}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatH {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-10px); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
