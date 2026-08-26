"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onPick: (gift: "cake" | "flowers" | "photos") => void;
}

const GIFTS = [
  { id: "cake" as const, emoji: "🎂", label: "Cake", hint: "Make a wish" },
  { id: "flowers" as const, emoji: "💐", label: "Flowers", hint: "A little bouquet" },
  { id: "photos" as const, emoji: "📷", label: "Photos", hint: "Memories" },
];

export default function GiftPicker({ onPick }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (id: "cake" | "flowers" | "photos") => {
    if (picked) return;
    setPicked(id);
    audio.playSfx("click");
    setTimeout(() => onPick(id), 450);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      <div className="paper-card w-full max-w-[340px] rounded-2xl p-6 text-center" style={{ animation: "cardIn 0.6s ease-out both" }}>
        <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-1">A surprise</p>
        <h2 className="text-xl text-[#4a3038] mb-6" style={{ fontFamily: "Georgia, serif" }}>
          Do you want a birthday gift?
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {GIFTS.map((g) => (
            <button
              key={g.id}
              onClick={() => choose(g.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                picked === g.id
                  ? "border-[#c45c6a] bg-[#fff0f2] scale-105"
                  : "border-[#e8a0b0]/40 bg-white hover:border-[#c45c6a]/60"
              }`}
            >
              <span className="text-[10px] text-[#c45c6a] font-medium">Yes</span>
              <span className="text-3xl">{g.emoji}</span>
              <span className="text-[10px] text-[#8a6870]">{g.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs text-[#8a6870]">Tap one to open</p>
      </div>
    </div>
  );
}
