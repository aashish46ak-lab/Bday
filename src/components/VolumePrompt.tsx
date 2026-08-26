"use client";

import { useState, useEffect } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onEnter: () => void;
}

export default function VolumePrompt({ onEnter }: Props) {
  const [phase, setPhase] = useState<"idle" | "count" | "go">("idle");
  const [count, setCount] = useState(3);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = async () => {
    setPhase("count");
    await audio.ensureResumed();
    let c = 3;
    setCount(3);
    const iv = setInterval(() => {
      c -= 1;
      if (c > 0) setCount(c);
      else {
        clearInterval(iv);
        setPhase("go");
        audio.startMusic();
        setTimeout(() => onEnter(), 600);
      }
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6">
      <div className="relative z-10 max-w-md mx-auto">
        {phase === "idle" && (
          <div className="space-y-6 animate-in">
            <div className="text-4xl">🎀</div>
            <h1 className="text-2xl sm:text-3xl font-light text-[#c45c7a]">
              A surprise for Esha
            </h1>
            <p className="text-lg text-[#5a3545]">Turn the volume up</p>
            <p className="text-sm text-[#8b6b78] italic">Something awaits…</p>
            <div className="flex items-center justify-center gap-1 h-9">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-[#e8a0b4] to-[#c45c7a] bar"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <button
              onClick={handleEnter}
              disabled={!ready}
              className="px-9 py-3.5 rounded-full bg-white/80 border border-[#e8a0b4] text-[#c45c7a] font-medium shadow-sm hover:shadow-md hover:border-[#c45c7a] active:scale-95 transition-all disabled:opacity-50"
            >
              Begin
            </button>
          </div>
        )}

        {phase === "count" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs tracking-[0.3em] uppercase text-[#e8a0b4]">Get ready</p>
            <div key={count} className="text-7xl font-light text-[#c45c7a] count-pop">
              {count}
            </div>
          </div>
        )}

        {phase === "go" && <div className="text-4xl go-in">✨</div>}
      </div>

      <style jsx>{`
        .animate-in { animation: fadeUp 0.8s ease-out both; }
        .bar { height: 28%; animation: wave 1.1s ease-in-out infinite; }
        @keyframes wave {
          0%, 100% { height: 20%; opacity: 0.4; }
          50% { height: 90%; opacity: 1; }
        }
        .count-pop { animation: pop 0.5s ease-out both; }
        @keyframes pop {
          0% { opacity: 0; transform: scale(0.6); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .go-in { animation: fadeUp 0.45s ease-out both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
