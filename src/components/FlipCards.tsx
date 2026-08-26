"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";

interface Props {
  onAllFlipped: () => void;
}

const CARDS = [
  {
    id: "letter",
    front: "💌",
    frontLabel: "Letter",
    backTitle: "Dear Esha",
    backText:
      "May this year be gentle with you — full of quiet joy and warm moments.",
  },
  {
    id: "photo",
    front: "🌸",
    frontLabel: "Photo",
    backTitle: "A moment",
    backText: "photo",
  },
  {
    id: "wish",
    front: "✨",
    frontLabel: "Wish",
    backTitle: "A wish",
    backText:
      "जन्मदिनको हार्दिक शुभकामना ✨\nMay your dreams feel close this year.",
  },
];

export default function FlipCards({ onAllFlipped }: Props) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const flip = (id: string) => {
    if (flipped[id]) return;
    audio.playSfx("envelope");
    const next = { ...flipped, [id]: true };
    setFlipped(next);
    if (Object.keys(next).length >= CARDS.length) {
      setTimeout(() => onAllFlipped(), 900);
    }
  };

  const allDone = Object.keys(flipped).length >= CARDS.length;

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-4 py-10">
      <p className="text-sm tracking-[0.2em] uppercase text-[#f0a8bc] mb-2">
        Flip each card
      </p>
      <h2
        className="text-2xl mb-8 text-center"
        style={{ color: "#e07a9a", fontFamily: "Georgia, serif" }}
      >
        Little surprises
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
        {CARDS.map((card) => {
          const isFlipped = !!flipped[card.id];
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              className="relative h-44 sm:h-48 focus:outline-none"
              style={{ perspective: "800px" }}
              aria-label={card.frontLabel}
            >
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl border border-[#f0a8bc]/50 bg-white shadow-md flex flex-col items-center justify-center gap-2"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-4xl">{card.front}</span>
                  <span className="text-xs text-[#9a7080]">{card.frontLabel}</span>
                  <span className="text-[10px] text-[#f0a8bc]">Tap to flip</span>
                </div>
                <div
                  className="absolute inset-0 rounded-2xl border border-[#e07a9a]/40 bg-[#fff5f8] shadow-md flex flex-col items-center justify-center px-3 py-3"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "#e07a9a", fontFamily: "Georgia, serif" }}
                  >
                    {card.backTitle}
                  </p>
                  {card.backText === "photo" ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#f0a8bc]/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ESHA_PHOTO}
                        alt="Esha"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-[#5a3545] leading-relaxed text-center whitespace-pre-line">
                      {card.backText}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {allDone && (
        <p className="mt-8 text-sm text-[#e07a9a] animate-pulse">
          All opened — continuing…
        </p>
      )}
    </div>
  );
}
