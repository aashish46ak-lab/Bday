"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onOpen: () => void;
}

export default function GiftBox({ onOpen }: Props) {
  const [opening, setOpening] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    audio.playSfx("gift");
    setTimeout(onOpen, 1600);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-6">
      <p
        className={`text-center text-lg text-[#8b6b78] mb-12 transition-all duration-600 ${
          opening ? "opacity-0 -translate-y-3" : "opacity-100"
        }`}
      >
        One more little thing for you…
      </p>

      <button
        onClick={handleOpen}
        disabled={opening}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group focus:outline-none"
        aria-label="Open gift"
        style={{ perspective: "600px" }}
      >
        <div
          className={`absolute -inset-10 rounded-full blur-2xl transition-opacity duration-500 ${
            opening ? "opacity-90" : hovered ? "opacity-65" : "opacity-40"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(232,160,180,0.6) 0%, transparent 70%)",
          }}
        />

        <div
          className="relative"
          style={{
            width: 180,
            height: 150,
            transformStyle: "preserve-3d",
            transform: opening
              ? "rotateX(-8deg) scale(1.12)"
              : hovered
              ? "rotateX(-6deg) rotateY(-8deg) scale(1.05)"
              : "rotateX(-4deg) rotateY(6deg)",
            transition: "transform 0.55s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        >
          <div
            className="absolute left-0 right-0 origin-bottom z-20"
            style={{
              top: -6,
              height: 42,
              transformStyle: "preserve-3d",
              transform: opening
                ? "rotateX(-118deg) translateY(-10px)"
                : "rotateX(0deg)",
              transition: "transform 1.1s cubic-bezier(0.34, 1.3, 0.64, 1)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, #f8c0d0 0%, #e890a8 100%)",
                borderRadius: "10px 10px 3px 3px",
                boxShadow:
                  "0 -3px 14px rgba(196,92,122,0.3), inset 0 2px 6px rgba(255,255,255,0.45)",
              }}
            />
            <div
              className="absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(180deg, #fff5f8 0%, #f5d0dc 50%, #e8a0b4 100%)",
                boxShadow: "inset 1px 0 2px rgba(255,255,255,0.6)",
              }}
            />
            <div
              className="absolute left-1/2 top-1 -translate-x-1/2 flex items-center gap-0"
              style={{ transform: "translateZ(4px)" }}
            >
              <div
                style={{
                  width: 22,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 40%, #fff0f5, #e8a0b4)",
                  boxShadow: "0 2px 4px rgba(196,92,122,0.25)",
                  transform: "rotate(-25deg)",
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 40%, #fff, #f0b0c0)",
                  margin: "0 -4px",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  width: 22,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 40%, #fff0f5, #e8a0b4)",
                  boxShadow: "0 2px 4px rgba(196,92,122,0.25)",
                  transform: "rotate(25deg)",
                }}
              />
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #f8c8d8 0%, #e8a0b4 42%, #d07090 100%)",
              boxShadow:
                "inset 0 3px 12px rgba(255,255,255,0.45), inset 0 -8px 16px rgba(160,60,90,0.2), 0 14px 32px rgba(196,92,122,0.35)",
              transform: "translateZ(0)",
            }}
          >
            <div
              className="absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(180deg, #fff5f8 0%, #f5d0dc 40%, #e090a8 100%)",
              }}
            />
            <div
              className="absolute left-0 right-0 top-1/2 h-6 -translate-y-1/2"
              style={{
                background:
                  "linear-gradient(90deg, #e090a8 0%, #f5d0dc 30%, #fff5f8 50%, #f5d0dc 70%, #e090a8 100%)",
              }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 w-4 opacity-30"
              style={{
                background:
                  "linear-gradient(90deg, rgba(120,40,60,0.35), transparent)",
              }}
            />
            <div
              className="absolute left-3 right-3 top-2 h-4 rounded-full opacity-40"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.7), transparent)",
              }}
            />
          </div>

          {opening && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-[#fff0f5]"
                  style={{
                    left: "50%",
                    top: "40%",
                    animation: `spark ${0.6 + i * 0.08}s ease-out forwards`,
                    animationDelay: `${i * 0.04}s`,
                    ["--dx" as string]: `${(i % 2 === 0 ? 1 : -1) * (30 + i * 12)}px`,
                    ["--dy" as string]: `${-40 - i * 10}px`,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </button>

      <p
        className={`mt-10 text-sm text-[#c45c7a] transition-opacity duration-500 ${
          opening ? "opacity-0" : "opacity-80"
        }`}
      >
        Tap to open
      </p>

      <style jsx>{`
        @keyframes spark {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(0.2);
          }
        }
      `}</style>
    </div>
  );
}
