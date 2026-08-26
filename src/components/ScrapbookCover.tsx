"use client";

import { useEffect, useState } from "react";

interface Props {
  onNext: () => void;
}

export default function ScrapbookCover({ onNext }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      <div
        className={`paper-card relative w-full max-w-[340px] rounded-2xl overflow-hidden transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ minHeight: 420 }}
      >
        <div className="absolute inset-3 border border-[#e8a0b0]/50 rounded-xl pointer-events-none" />
        <div className="absolute inset-5 border border-dashed border-[#e8a0b0]/30 rounded-lg pointer-events-none" />

        <span className="absolute top-6 left-6 text-xl opacity-60" style={{ animation: "floatY 3s ease-in-out infinite" }}>🎈</span>
        <span className="absolute top-8 right-8 text-lg opacity-50" style={{ animation: "floatY 3.5s ease-in-out 0.5s infinite" }}>⭐</span>
        <span className="absolute bottom-20 left-8 text-lg opacity-50" style={{ animation: "floatY 4s ease-in-out 0.3s infinite" }}>🌸</span>
        <span className="absolute bottom-24 right-10 text-xl opacity-50" style={{ animation: "floatY 3.2s ease-in-out 0.8s infinite" }}>🎀</span>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 py-14 text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#c45c6a] mb-3">A little scrapbook for</p>
          <h1
            className="text-4xl sm:text-5xl leading-tight text-[#c45c6a] mb-2"
            style={{ fontFamily: "Georgia, serif", fontWeight: 600 }}
          >
            HAPPY
            <br />
            BIRTHDAY
          </h1>
          <p className="text-2xl text-[#4a3038] mt-2 mb-1" style={{ fontFamily: "Georgia, serif" }}>
            Esha 🎂
          </p>
          <p className="text-xs text-[#8a6870] mt-1">Ashoj 15 · Dang</p>

          <div className="mt-8 flex gap-2 text-2xl">
            <span>🪔</span>
            <span>💕</span>
            <span>✨</span>
          </div>

          <button
            onClick={onNext}
            className="mt-10 px-8 py-3 rounded-full text-sm text-white tracking-wide active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #d4788a, #c45c6a)" }}
          >
            Open the scrapbook →
          </button>
        </div>
      </div>
    </div>
  );
}
