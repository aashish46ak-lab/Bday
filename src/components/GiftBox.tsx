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
        className={`text-center text-lg mb-3 transition-all duration-500 ${
          opening ? "opacity-0 -translate-y-2" : "opacity-100"
        }`}
        style={{ color: "#e07a9a", fontFamily: "Georgia, serif" }}
      >
        One more little thing for you…
      </p>
      <p
        className={`text-center text-sm text-[#9a7080] mb-10 transition-opacity duration-500 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        Click the gift to open your surprise
      </p>

      <button
        onClick={handleOpen}
        disabled={opening}
        className="relative focus:outline-none group"
        aria-label="Open gift"
      >
        <div
          className={`absolute -inset-10 rounded-full blur-2xl transition-opacity duration-500 ${
            opening ? "opacity-90" : "opacity-40 group-hover:opacity-60"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(240,168,188,0.55) 0%, transparent 70%)",
          }}
        />

        <div
          className={`relative w-40 h-36 transition-transform duration-500 ${
            opening ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          <div
            className="absolute -top-1 left-0 right-0 h-10 origin-bottom z-10 transition-all duration-1000"
            style={{
              background: "linear-gradient(180deg, #f8c0d0 0%, #e890a8 100%)",
              borderRadius: "10px 10px 2px 2px",
              boxShadow: "0 -2px 12px rgba(224,122,154,0.25)",
              transform: opening
                ? "rotateX(-110deg) translateY(-8px)"
                : "rotateX(0)",
              transformOrigin: "bottom center",
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-b from-[#fff5f8] to-[#f5d0dc]" />
            <div className="absolute left-1/2 top-0.5 -translate-x-1/2 flex items-center">
              <div
                style={{
                  width: 20,
                  height: 12,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 40% 40%, #fff0f5, #e8a0b4)",
                  transform: "rotate(-22deg)",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 40% 40%, #fff, #f0b0c0)",
                  margin: "0 -3px",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  width: 20,
                  height: 12,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 40% 40%, #fff0f5, #e8a0b4)",
                  transform: "rotate(22deg)",
                }}
              />
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #f8c8d8 0%, #e8a0b4 45%, #d87898 100%)",
              boxShadow:
                "inset 0 2px 10px rgba(255,255,255,0.4), 0 12px 28px rgba(224,122,154,0.3)",
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-b from-[#fff5f8] via-[#f5d0dc] to-[#e890a8]" />
            <div className="absolute left-0 right-0 top-1/2 h-5 -translate-y-1/2 bg-gradient-to-r from-[#e890a8] via-[#fff5f8] to-[#e890a8]" />
          </div>
        </div>
      </button>

      <p
        className={`mt-10 text-sm text-[#e07a9a] transition-opacity ${
          opening ? "opacity-0" : "opacity-80"
        }`}
      >
        Tap to open 🎁
      </p>
    </div>
  );
}
