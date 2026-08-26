"use client";

import { useState, useEffect } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onEnter: () => void;
}

export default function VolumePrompt({ onEnter }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = async () => {
    setCountdown(3);
    await audio.ensureResumed();
    let c = 3;
    const iv = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        audio.startMusic();
        onEnter();
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050509] text-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-ambient" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-8 animate-fade-in">
        <div className="text-4xl mb-2 opacity-80">🎧</div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#f5e6c8]">
          Before we begin...
        </h1>
        <p className="text-xl sm:text-2xl font-medium text-white tracking-tight">
          Turn your volume up
        </p>
        <p className="text-sm text-[#c9b8e8]/opacity-80 italic">
          Trust me, you&apos;ll want to hear this.
        </p>

        <div className="flex items-center justify-center gap-1 h-12 my-6">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#e8c87a] to-[#f5e6c8] sound-bar"
              style={{ animationDelay: `${i * 0.1}s`, height: "40%" }}
            />
          ))}
        </div>

        {countdown !== null ? (
          <div className="text-6xl font-light text-[#e8c87a] tabular-nums animate-pulse">
            {countdown > 0 ? countdown : "✨"}
          </div>
        ) : (
          <button
            onClick={handleEnter}
            disabled={!ready}
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#e8c87a]/20 to-[#e8b4c8]/20 border border-[#e8c87a]/40 text-[#f5e6c8] font-medium tracking-wide transition-all duration-500 hover:border-[#e8c87a] hover:shadow-[0_0_40px_rgba(232,200,122,0.25)] active:scale-95 disabled:opacity-50"
          >
            <span className="relative z-10">TURN VOLUME UP & ENTER</span>
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e8c87a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      <style jsx>{`
        .sound-bar {
          animation: wave 1.2s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { height: 25%; opacity: 0.5; }
          50% { height: 90%; opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 1.2s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stars-ambient {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(1px 1px at 20% 30%, rgba(255, 248, 240, 0.4), transparent),
            radial-gradient(1px 1px at 70% 60%, rgba(232, 200, 122, 0.3), transparent),
            radial-gradient(1.5px 1.5px at 40% 80%, rgba(255, 255, 255, 0.25), transparent),
            radial-gradient(1px 1px at 85% 20%, rgba(201, 184, 232, 0.35), transparent);
          background-size: 200% 200%;
          animation: drift 40s linear infinite;
        }
        @keyframes drift {
          from { background-position: 0% 0%; }
          to { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}
