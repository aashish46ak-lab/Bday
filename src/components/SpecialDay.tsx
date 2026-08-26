"use client";

interface Props {
  onNext: () => void;
}

export default function SpecialDay({ onNext }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      <div className="paper-card w-full max-w-[340px] rounded-2xl overflow-hidden" style={{ animation: "cardIn 0.6s ease-out both" }}>
        <div className="flex">
          <div className="w-[42%] bg-[#c45c6a] text-white p-5 flex flex-col items-center justify-center">
            <p className="text-[10px] tracking-widest uppercase opacity-80">Ashoj</p>
            <p className="text-5xl font-light my-1" style={{ fontFamily: "Georgia, serif" }}>15</p>
            <p className="text-xs opacity-80">2064 B.S.</p>
            <div className="mt-4 w-full border-t border-white/20 pt-3">
              <p className="text-[10px] text-center leading-relaxed opacity-90">This is your special day</p>
            </div>
          </div>
          <div className="flex-1 p-5 flex flex-col items-center justify-center text-center bg-[#fff5f2]">
            <span className="text-2xl mb-2">🎀</span>
            <p className="text-sm text-[#c45c6a]" style={{ fontFamily: "Georgia, serif" }}>For Esha</p>
            <p className="text-xs text-[#8a6870] mt-2 leading-relaxed">
              Born in Dang.
              <br />
              Growing brighter every year.
            </p>
            <div className="mt-4 flex gap-1">
              <span className="text-sm">🌸</span>
              <span className="text-sm">✨</span>
              <span className="text-sm">🌸</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-8 px-7 py-2.5 rounded-full text-sm border border-[#c45c6a] text-[#c45c6a] bg-white/80 active:scale-95 transition-transform"
      >
        Next →
      </button>
    </div>
  );
}
