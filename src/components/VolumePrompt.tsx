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
    const t = setTimeout(() => setReady(true), 500);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => clearTimeout(t);
  }, []);

  const handleEnter = async () => {
    setPhase("count");
    await audio.ensureResumed();
    let c = 3;
    setCount(3);
    const iv = setInterval(() => {
      c -= 1;
      if (c > 0) {
        setCount(c);
      } else {
        clearInterval(iv);
        setPhase("go");
        audio.startMusic();
        setTimeout(() => onEnter(), 700);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6">
      <div className="relative z-10 max-w-md mx-auto space-y-7">
        {phase === "idle" && (
          <div className="space-y-7 animate-in">
            <div className="text-4xl opacity-85">🎧</div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#f5e6c8]">
              A surprise for Esha
            </h1>
            <p className="text-lg text-white/90">Turn the volume up</p>
            <p className="text-sm text-[#c9b8e8]/75 italic">
              You&apos;ll hear Happy Birthday
            </p>
            <div className="flex items-center justify-center gap-1 h-10">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-[#e8c87a] to-[#f5e6c8] bar"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <button
              onClick={handleEnter}
              disabled={!ready}
              className="px-9 py-4 rounded-full border border-[#e8c87a]/45 text-[#f5e6c8] font-medium tracking-wide hover:border-[#e8c87a] hover:shadow-[0_0_36px_rgba(232,200,122,0.28)] active:scale-95 transition-all disabled:opacity-50"
            >
              Begin
            </button>
          </div>
        )}

        {phase === "count" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm tracking-[0.35em] uppercase text-[#e8c87a]/80">
              Get ready
            </p>
            <div
              key={count}
              className="text-7xl font-light text-[#f5e6c8] tabular-nums count-pop"
              style={{
                textShadow: "0 0 40px rgba(232,200,122,0.45)",
              }}
            >
              {count}
            </div>
          </div>
        )}

        {phase === "go" && (
          <div className="text-3xl sm:text-4xl font-light text-[#e8c87a] go-in">
            ✨
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-in {
          animation: fadeUp 0.9s ease-out both;
        }
        .bar {
          height: 30%;
          animation: wave 1.1s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { height: 22%; opacity: 0.45; }
          50% { height: 95%; opacity: 1; }
        }
        .count-pop {
          animation: pop 0.55s ease-out both;
        }
        @keyframes pop {
          0% { opacity: 0; transform: scale(0.6); }
          70% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .go-in {
          animation: fadeUp 0.5s ease-out both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
