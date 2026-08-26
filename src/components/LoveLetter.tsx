"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onNext: () => void;
}

export default function LoveLetter({ onNext }: Props) {
  const [opened, setOpened] = useState(false);

  const open = () => {
    if (opened) return;
    audio.playSfx("envelope");
    setOpened(true);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      {!opened ? (
        <div className="paper-card w-full max-w-[320px] rounded-2xl p-8 text-center" style={{ animation: "cardIn 0.6s ease-out both" }}>
          <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-4">A note for you</p>
          <div className="relative mx-auto w-40 h-28 my-6 cursor-pointer" onClick={open}>
            <div
              className="absolute inset-0 rounded-sm border-2 border-[#c45c6a]/40 bg-[#fff5f2]"
              style={{ boxShadow: "0 6px 16px rgba(196,92,106,0.15)" }}
            />
            <button
              onClick={open}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs text-white bg-[#c45c6a] shadow-md active:scale-95"
            >
              Open
            </button>
          </div>
          <p className="text-sm text-[#8a6870]">Tap the envelope</p>
        </div>
      ) : (
        <div className="paper-card w-full max-w-[340px] rounded-2xl p-6" style={{ animation: "cardIn 0.5s ease-out both" }}>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl">💌</span>
            <p className="text-sm text-[#c45c6a]" style={{ fontFamily: "Georgia, serif" }}>Dear Esha,</p>
          </div>
          <p className="text-sm text-[#4a3038] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            Another year of you — soft smiles, quiet strength, and all the little things that make the days warmer.
            <br /><br />
            May this year be gentle. May it bring soft mornings, good people, and moments that make you laugh without trying.
            <br /><br />
            <span className="text-[#c45c6a]">Happy birthday. You deserve every good thing.</span>
          </p>
          <div className="mt-5 flex justify-end">
            <span className="text-xs text-[#8a6870] italic">— with care ✨</span>
          </div>
        </div>
      )}

      {opened && (
        <button
          onClick={onNext}
          className="mt-8 px-7 py-2.5 rounded-full text-sm text-white active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #d4788a, #c45c6a)" }}
        >
          Next gift →
        </button>
      )}
    </div>
  );
}
