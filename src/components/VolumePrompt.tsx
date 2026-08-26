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
        setTimeout(() => onEnter(), 700);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute text-pink-200/60 select-none"
            style={{
              left: `${12 + i * 15}%`,
              top: `${18 + (i % 3) * 25}%`,
              fontSize: `${18 + (i % 3) * 10}px`,
              animation: `floatHeart ${4 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <div className="relative z-10 max-w-sm mx-auto">
        {phase === "idle" && (
          <div className="space-y-5" style={{ animation: "fadeUp 0.9s ease-out both" }}>
            <div className="text-5xl">🎀</div>
            <h1
              className="text-3xl sm:text-4xl font-medium tracking-tight"
              style={{ color: "#e07a9a", fontFamily: "Georgia, serif" }}
            >
              Something awaits…
            </h1>
            <p className="text-base text-[#9a7080]">
              Turn your volume up for Esha
            </p>
            <div className="flex items-center justify-center gap-1.5 h-8 my-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-[#f0a8bc] to-[#e07a9a]"
                  style={{
                    animation: "wave 1.1s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                    height: "40%",
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleEnter}
              disabled={!ready}
              className="mt-2 px-10 py-3.5 rounded-full bg-white border border-[#f0a8bc] text-[#e07a9a] font-medium shadow-sm hover:shadow-md hover:border-[#e07a9a] active:scale-95 transition-all disabled:opacity-50"
            >
              Begin
            </button>
          </div>
        )}

        {phase === "count" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs tracking-[0.25em] uppercase text-[#f0a8bc]">
              Get ready
            </p>
            <div
              key={count}
              className="text-7xl font-light text-[#e07a9a]"
              style={{ animation: "pop 0.45s ease-out" }}
            >
              {count}
            </div>
          </div>
        )}

        {phase === "go" && (
          <div className="text-4xl" style={{ animation: "pop 0.5s ease-out" }}>
            ✨
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { opacity: 0; transform: scale(0.6); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wave {
          0%, 100% { height: 25%; opacity: 0.5; }
          50% { height: 90%; opacity: 1; }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-12px) scale(1.1); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
