"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onOpen: () => void;
}

export default function GiftBox({ onOpen }: Props) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    audio.playSfx("gift");
    setTimeout(onOpen, 1400);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-6">
      <p
        className={`text-center text-lg text-[#8b6b78] mb-10 transition-all duration-600 ${
          opening ? "opacity-0 -translate-y-3" : "opacity-100"
        }`}
      >
        One more little thing for you…
      </p>

      <button
        onClick={handleOpen}
        disabled={opening}
        className="relative group focus:outline-none"
        aria-label="Open gift"
      >
        <div
          className={`absolute -inset-8 rounded-full blur-2xl transition-opacity ${
            opening ? "opacity-80" : "opacity-40 group-hover:opacity-60"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(232,160,180,0.55) 0%, transparent 70%)",
          }}
        />

        <div
          className={`relative w-40 h-32 transition-transform duration-500 ${
            opening ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          {/* lid */}
          <div
            className={`absolute -top-2 left-0 right-0 h-9 origin-bottom transition-all duration-1000 z-10 ${
              opening ? "rotate-[-105deg] -translate-y-6 opacity-90" : ""
            }`}
            style={{
              background: "linear-gradient(180deg, #f0b0c0 0%, #e890a8 100%)",
              borderRadius: "8px 8px 2px 2px",
              boxShadow: "0 -2px 10px rgba(196,92,122,0.25)",
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-b from-[#fff0f5] to-[#f5d0dc]" />
          </div>

          {/* box */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #f5c0d0 0%, #e8a0b4 45%, #d4789c 100%)",
              boxShadow:
                "inset 0 2px 10px rgba(255,255,255,0.4), 0 10px 28px rgba(196,92,122,0.3)",
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-b from-[#fff0f5] via-[#f5d0dc] to-[#e8a0b4]" />
            <div className="absolute top-1/2 left-0 right-0 h-5 -translate-y-1/2 bg-gradient-to-r from-[#fff0f5] via-[#f5d0dc] to-[#e8a0b4]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#fff8f3] shadow-inner" />
          </div>

          {opening && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ animation: "burst 0.9s ease-out forwards" }}
            >
              <div
                className="w-3 h-3 rounded-full bg-white"
                style={{
                  boxShadow:
                    "0 0 50px 35px rgba(255,240,245,0.9), 0 0 100px 60px rgba(232,160,180,0.4)",
                }}
              />
            </div>
          )}
        </div>

        {!opening && (
          <p className="mt-8 text-sm tracking-widest text-[#c45c7a] uppercase">
            Open your gift 🎁
          </p>
        )}
      </button>

      <style jsx>{`
        @keyframes burst {
          0% { opacity: 0; transform: scale(0.2); }
          40% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.4); }
        }
      `}</style>
    </div>
  );
}
