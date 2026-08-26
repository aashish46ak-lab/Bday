"use client";

import { useState, useCallback } from "react";
import Starfield from "@/components/Starfield";
import VolumePrompt from "@/components/VolumePrompt";
import BirthdayHero from "@/components/BirthdayHero";
import BirthdayCake from "@/components/BirthdayCake";
import Fireworks from "@/components/Fireworks";
import GiftBox from "@/components/GiftBox";
import GiftReveal from "@/components/GiftReveal";
import FinalReveal from "@/components/FinalReveal";
import SoundController from "@/components/SoundController";

type Scene =
  | "intro"
  | "hero"
  | "cake"
  | "fireworks"
  | "gift"
  | "reveal"
  | "final";

export default function Home() {
  const [scene, setScene] = useState<Scene>("intro");
  const [showFireworks, setShowFireworks] = useState(false);
  const [finalActive, setFinalActive] = useState(false);

  const go = useCallback((s: Scene) => setScene(s), []);

  const handleBlownOut = () => {
    setShowFireworks(true);
    setTimeout(() => go("fireworks"), 300);
    setTimeout(() => {
      setShowFireworks(false);
      go("gift");
    }, 5500);
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#050509] text-[#fff8f0]">
      {scene !== "final" && <Starfield density={scene === "intro" ? 0.6 : 1} />}

      {scene === "intro" && (
        <VolumePrompt onEnter={() => go("hero")} />
      )}

      {scene === "hero" && (
        <BirthdayHero onComplete={() => go("cake")} />
      )}

      {scene === "cake" && (
        <BirthdayCake onBlownOut={handleBlownOut} />
      )}

      {(scene === "fireworks" || showFireworks) && (
        <>
          <Fireworks active intensity={1.1} />
          <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
            <h2
              className="text-3xl sm:text-5xl font-light text-[#fff8f0] text-center px-4"
              style={{
                animation: "popIn 1.2s ease-out forwards",
                textShadow: "0 0 40px rgba(232,200,122,0.4)",
              }}
            >
              HAPPY BIRTHDAY, ESHA! 🎂
            </h2>
          </div>
        </>
      )}

      {scene === "gift" && (
        <GiftBox onOpen={() => go("reveal")} />
      )}

      {scene === "reveal" && (
        <GiftReveal
          onAllExplored={() => {
            setFinalActive(true);
            go("final");
          }}
        />
      )}

      {scene === "final" && <FinalReveal active={finalActive} />}

      {scene !== "intro" && <SoundController />}

      <style jsx global>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.85); }
          60% { opacity: 1; transform: scale(1.05); }
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
