"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onNext: () => void;
}

const CARDS = [
  { id: "happy", front: "😊", label: "Happiness", back: "A little more joy in the everyday." },
  { id: "luck", front: "🍀", label: "Luck", back: "Gentle luck on quiet days and big ones." },
  { id: "smile", front: "✨", label: "Smiles", back: "A lot of reasons to smile this year." },
];

export default function FlipCards({ onNext }: Props) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const flip = (id: string) => {
    if (flipped[id]) return;
    audio.playSfx("envelope");
    setFlipped({ ...flipped, [id]: true });
  };

  const all = Object.keys(flipped).length >= CARDS.length;

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5 py-10">
      <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-2">Little things</p>
      <h2 className="text-xl text-[#4a3038] mb-6 text-center" style={{ fontFamily: "Georgia, serif" }}>
        Open each card
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
        {CARDS.map((c) => {
          const isF = !!flipped[c.id];
          return (
            <button
              key={c.id}
              onClick={() => flip(c.id)}
              className="relative h-40 focus:outline-none"
              style={{ perspective: "800px" }}
            >
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isF ? "rotateY(180deg)" : "rotateY(0)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl paper-card flex flex-col items-center justify-center gap-2"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-3xl">{c.front}</span>
                  <span className="text-xs text-[#8a6870]">{c.label}</span>
                  <span className="text-[10px] text-[#c45c6a]">Tap</span>
                </div>
                <div
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center px-3"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(180deg,#fff5f2,#ffe8ec)",
                    border: "1.5px solid rgba(196,92,106,0.3)",
                  }}
                >
                  <p className="text-xs text-[#4a3038] leading-relaxed text-center" style={{ fontFamily: "Georgia, serif" }}>
                    {c.back}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {all && (
        <button
          onClick={onNext}
          className="mt-8 px-7 py-2.5 rounded-full text-sm text-white active:scale-95"
          style={{ background: "linear-gradient(135deg, #d4788a, #c45c6a)", animation: "cardIn 0.5s ease-out" }}
        >
          Almost there →
        </button>
      )}
    </div>
  );
}
