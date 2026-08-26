"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";
import { audio } from "@/lib/audio";
import Fireworks from "./Fireworks";

interface Props {
  active: boolean;
}

export default function FinalCard({ active }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) return;
    audio.fadeMusic(0.35, 2);
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center plaid-bg px-5">
      {phase >= 3 && <Fireworks active intensity={0.9} />}

      <div
        className="paper-card relative w-full max-w-[340px] rounded-2xl overflow-hidden"
        style={{ animation: "cardIn 0.7s ease-out both" }}
      >
        <div className="absolute inset-3 border border-[#e8a0b0]/40 rounded-xl pointer-events-none" />

        <div className="relative z-10 px-7 py-10 text-center">
          {phase >= 1 && (
            <div className="mb-4" style={{ animation: "cardIn 0.6s ease-out both" }}>
              <div
                className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white"
                style={{ boxShadow: "0 6px 20px rgba(196,92,106,0.25)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ESHA_PHOTO} alt="Esha" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <p className="text-[11px] tracking-[0.25em] uppercase text-[#c45c6a] mb-2">The last page</p>
          <h1
            className="text-3xl text-[#c45c6a] mb-4"
            style={{ fontFamily: "Georgia, serif", fontWeight: 600 }}
          >
            HAPPY BIRTHDAY
          </h1>
          <p className="text-xl text-[#4a3038] mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Esha 🎂
          </p>

          {phase >= 2 && (
            <p
              className="text-sm text-[#4a3038] leading-relaxed max-w-xs mx-auto"
              style={{ fontFamily: "Georgia, serif", animation: "cardIn 0.6s ease-out both" }}
            >
              Thank you for being you \u2014 for the quiet kindness, the soft light you bring.
              <br /><br />
              May this year hold soft mornings, brave little steps, and more reasons to smile than you can count.
              <br /><br />
              <span className="text-[#c45c6a]">Have the happiest birthday, Esha. ✨</span>
            </p>
          )}

          {phase >= 4 && (
            <div
              className="mt-6 pt-4 border-t border-[#e8a0b0]/30"
              style={{ animation: "cardIn 0.5s ease-out both" }}
            >
              <p className="text-xs text-[#c45c6a]">{SITE_CONFIG.person.name}</p>
              <p className="text-[11px] text-[#8a6870] mt-1">🎂 {SITE_CONFIG.person.dobBS}</p>
              <p className="text-[11px] text-[#8a6870]">📍 {SITE_CONFIG.person.home}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
