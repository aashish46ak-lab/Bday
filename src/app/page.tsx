"use client";

import { useState, useCallback } from "react";
import Starfield from "@/components/Starfield";
import VolumePrompt from "@/components/VolumePrompt";
import BirthdayHero from "@/components/BirthdayHero";
import BirthdayCake from "@/components/BirthdayCake";
import Fireworks from "@/components/Fireworks";
import GiftBox from "@/components/GiftBox";
import FlipCards from "@/components/FlipCards";
import MemoryBook from "@/components/MemoryBook";
import FinalReveal from "@/components/FinalReveal";
import SoundController from "@/components/SoundController";

type Scene =
  | "intro"
  | "hero"
  | "cake"
  | "fireworks"
  | "gift"
  | "cards"
  | "book"
  | "final";

export default function Home() {
  const [scene, setScene] = useState<Scene>("intro");
  const [showFireworks, setShowFireworks] = useState(false);
  const [finalActive, setFinalActive] = useState(false);

  const go = useCallback((s: Scene) => setScene(s), []);

  const handleBlownOut = () => {
    setShowFireworks(true);
    setTimeout(() => go("fireworks"), 200);
    setTimeout(() => {
      setShowFireworks(false);
      go("gift");
    }, 4500);
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden text-[#5a3545]">
      <Starfield density={scene === "intro" ? 0.25 : 0.35} />

      {scene === "intro" && <VolumePrompt onEnter={() => go("hero")} />}
      {scene === "hero" && <BirthdayHero onComplete={() => go("cake")} />}
      {scene === "cake" && <BirthdayCake onBlownOut={handleBlownOut} />}

      {(scene === "fireworks" || showFireworks) && (
        <>
          <Fireworks active intensity={1.0} />
          <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
            <h2
              className="text-3xl sm:text-4xl font-medium text-center px-4"
              style={{
                color: "#e07a9a",
                fontFamily: "Georgia, serif",
                animation: "popIn 1.1s ease-out forwards",
                textShadow: "0 2px 24px rgba(224,122,154,0.35)",
              }}
            >
              Happy Birthday, Esha! 🎂
            </h2>
          </div>
        </>
      )}

      {scene === "gift" && <GiftBox onOpen={() => go("cards")} />}
      {scene === "cards" && <FlipCards onAllFlipped={() => go("book")} />}
      {scene === "book" && (
        <MemoryBook
          onDone={() => {
            setFinalActive(true);
            go("final");
          }}
        />
      )}
      {scene === "final" && <FinalReveal active={finalActive} />}

      {scene !== "intro" && <SoundController />}

      <style jsx global>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.88); }
          60% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        html, body {
          overscroll-behavior: none;
          touch-action: manipulation;
        }
      `}</style>
    </main>
  );
}
