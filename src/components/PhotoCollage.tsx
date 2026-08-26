"use client";

import { ESHA_PHOTO } from "@/lib/eshaPhoto";

interface Props {
  onNext: () => void;
}

export default function PhotoCollage({ onNext }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      <div className="paper-card w-full max-w-[340px] rounded-2xl p-6 text-center" style={{ animation: "cardIn 0.5s ease-out both" }}>
        <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-1">A moment</p>
        <h2 className="text-lg text-[#4a3038] mb-5" style={{ fontFamily: "Georgia, serif" }}>
          For the scrapbook
        </h2>

        <div
          className="mx-auto bg-white p-2 pb-8 shadow-lg"
          style={{
            width: 200,
            transform: "rotate(-2deg)",
            boxShadow: "0 8px 24px rgba(90,48,56,0.15)",
          }}
        >
          <div className="w-full aspect-[3/4] overflow-hidden bg-[#f5e8e0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ESHA_PHOTO} alt="Esha" className="w-full h-full object-cover" />
          </div>
          <p className="mt-2 text-xs text-[#8a6870] italic" style={{ fontFamily: "Georgia, serif" }}>
            Esha \u00b7 Ashoj 15
          </p>
        </div>

        <div className="mt-4 flex justify-center gap-2 text-lg opacity-60">
          <span style={{ transform: "rotate(8deg)" }}>📷</span>
          <span>✨</span>
          <span style={{ transform: "rotate(-6deg)" }}>🌸</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-8 px-7 py-2.5 rounded-full text-sm text-white active:scale-95"
        style={{ background: "linear-gradient(135deg, #d4788a, #c45c6a)" }}
      >
        Next →
      </button>
    </div>
  );
}
