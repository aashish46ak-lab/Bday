"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onOpen: () => void;
}

export default function GiftBox({ onOpen }: Props) {
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    if (opening || opened) return;
    setOpening(true);
    audio.playSfx("gift");
    setTimeout(() => {
      setOpened(true);
      setTimeout(onOpen, 900);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-6">
      <div
        className={`text-center mb-10 transition-all duration-700 ${
          opening ? "opacity-0 -translate-y-4" : "opacity-100"
        }`}
      >
        <p className="text-lg sm:text-xl text-[#c9b8e8]/90 font-light">
          There&apos;s one more thing for you...
        </p>
      </div>

      <button
        onClick={handleOpen}
        disabled={opening}
        className="relative group focus:outline-none"
        aria-label="Open your gift"
      >
        <div
          className={`absolute inset-0 rounded-2xl blur-2xl transition-opacity duration-700 ${
            opening ? "opacity-80" : "opacity-40 group-hover:opacity-60"
          }`}
          style={{
            background: "radial-gradient(circle, rgba(232,200,122,0.45) 0%, transparent 70%)",
            transform: "scale(1.4)",
          }}
        />

        <div
          className={`relative w-36 h-28 sm:w-44 sm:h-32 transition-transform duration-500 ${
            opening ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          <div
            className={`absolute -top-3 left-0 right-0 h-8 sm:h-10 origin-bottom transition-all duration-1000 ease-out z-10 ${
              opening ? "rotate-[-110deg] -translate-y-8 opacity-80" : ""
            }`}
            style={{
              background: "linear-gradient(180deg, #c9a050 0%, #a67c30 100%)",
              borderRadius: "6px 6px 2px 2px",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 bg-gradient-to-b from-[#e8b4c8] to-[#c08098]" />
          </div>

          <div
            className="absolute inset-0 rounded-md overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #d4a84b 0%, #b8860b 40%, #8b6914 100%)",
              boxShadow: "inset 0 2px 8px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-b from-[#e8b4c8] via-[#d090a8] to-[#c08098]" />
            <div className="absolute top-1/2 left-0 right-0 h-5 -translate-y-1/2 bg-gradient-to-r from-[#e8b4c8] via-[#d090a8] to-[#c08098]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#f0c0d0] shadow-inner" />
          </div>

          {opening && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ animation: "burst 1s ease-out forwards" }}
            >
              <div
                className="w-4 h-4 rounded-full bg-[#fff8f0]"
                style={{
                  boxShadow: "0 0 60px 40px rgba(255,248,240,0.7), 0 0 120px 80px rgba(232,200,122,0.4)",
                }}
              />
            </div>
          )}
        </div>

        {!opening && (
          <p className="mt-8 text-sm tracking-widest text-[#e8c87a] uppercase opacity-80 group-hover:opacity-100 transition-opacity">
            Open your gift 🎁
          </p>
        )}
      </button>

      <style jsx>{`
        @keyframes burst {
          0% { opacity: 0; transform: scale(0.2); }
          40% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
      `}</style>
    </div>
  );
}
