"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onNext: () => void;
}

export default function FlowerCard({ onNext }: Props) {
  const [bloomed, setBloomed] = useState(0);

  const bloom = () => {
    if (bloomed >= 5) return;
    audio.playSfx("click");
    setBloomed((b) => b + 1);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      <div className="paper-card w-full max-w-[340px] rounded-2xl p-6 text-center" style={{ animation: "cardIn 0.5s ease-out both" }}>
        <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-1">Beautiful flowers for you</p>
        <h2 className="text-lg text-[#4a3038] mb-6" style={{ fontFamily: "Georgia, serif" }}>
          A little bouquet
        </h2>

        <button onClick={bloom} className="relative mx-auto block active:scale-95 transition-transform" style={{ width: 180, height: 160 }}>
          <div className="absolute left-1/2 bottom-4 w-1 h-16 bg-[#7a9a6a] -translate-x-1/2 rounded-full" />
          {[
            { x: 50, y: 30 },
            { x: 32, y: 42 },
            { x: 68, y: 40 },
            { x: 40, y: 55 },
            { x: 60, y: 58 },
          ].map((f, i) => (
            <span
              key={i}
              className="absolute text-3xl"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: "translate(-50%, -50%)",
                opacity: bloomed > i ? 1 : 0.15,
                animation: bloomed > i ? "bloom 0.5s ease-out both" : undefined,
                filter: bloomed > i ? "none" : "grayscale(0.8)",
              }}
            >
              {i % 2 === 0 ? "🌸" : "🌷"}
            </span>
          ))}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-16 h-10 rounded-b-full border-2 border-[#e8a0b0]/40 bg-[#fff0f4]/60" />
        </button>

        <p className="mt-4 text-sm text-[#8a6870] italic">
          {bloomed < 5 ? "Tap to bloom the flowers" : "Beautiful flowers \u2014 and you, even more."}
        </p>
      </div>

      {bloomed >= 5 && (
        <button
          onClick={onNext}
          className="mt-8 px-7 py-2.5 rounded-full text-sm text-white active:scale-95"
          style={{ background: "linear-gradient(135deg, #d4788a, #c45c6a)" }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
