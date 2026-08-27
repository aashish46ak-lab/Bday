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
        setTimeout(() => onEnter(), 400);
      }
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-hearts px-6">
      {phase === "idle" && (
        <div
          className="cream-card w-full max-w-sm px-8 py-10 text-center space-y-4"
          style={{ animation: "cardIn 0.7s ease-out both" }}
        >
          <div className="text-4xl">🎧</div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#c9184a]">Before you begin</p>
          <h1 className="text-2xl text-[#4a3038]" style={{ fontFamily: "Georgia, serif" }}>
            Turn your volume up
          </h1>
          <p className="text-sm text-[#8a6870] italic">Trust me, you&apos;ll want to hear this.</p>

          <div className="flex items-center justify-center gap-1 h-10 my-1">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#e63956] to-[#ff8fa3]"
                style={{ animation: `wave 1s ease-in-out ${i * 0.1}s infinite`, height: "40%" }}
              />
            ))}
          </div>

          <button
            onClick={handleEnter}
            disabled={!ready}
            className="mt-2 px-10 py-3.5 rounded-full text-white font-medium tracking-wide transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #ff4d6d, #c9184a)",
              boxShadow: "0 6px 20px rgba(201,24,74,0.4)",
            }}
          >
            ENTER ✨
          </button>
        </div>
      )}

      {phase === "count" && (
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-white/80 mb-2">Get ready</p>
          <div key={count} className="text-7xl text-white" style={{ animation: "softPulse 0.6s ease-out" }}>
            {count}
          </div>
        </div>
      )}

      {phase === "go" && (
        <div className="text-5xl text-white" style={{ animation: "softPulse 0.5s ease-out" }}>
          ♥
        </div>
      )}
    </div>
  );
}
