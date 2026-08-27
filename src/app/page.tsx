"use client";

import { useState, useCallback } from "react";
import VolumePrompt from "@/components/VolumePrompt";
import BirthdayCake from "@/components/BirthdayCake";
import Fireworks from "@/components/Fireworks";
import CherryCelebration from "@/components/CherryCelebration";

type Scene = "intro" | "cake" | "fireworks" | "celebrate";

export default function Home() {
  const [scene, setScene] = useState<Scene>("intro");

  const onCakeDone = useCallback(() => {
    setScene("fireworks");
    setTimeout(() => setScene("celebrate"), 4000);
  }, []);

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden">
      {scene === "intro" && <VolumePrompt onEnter={() => setScene("cake")} />}
      {scene === "cake" && <BirthdayCake onDone={onCakeDone} />}
      {scene === "fireworks" && (
        <div className="fixed inset-0 z-30 bg-hearts flex items-center justify-center">
          <Fireworks active intensity={1.2} />
          <p
            className="relative z-10 text-2xl text-white drop-shadow-lg"
            style={{ fontFamily: "Georgia, serif", animation: "cardIn 0.5s ease-out" }}
          >
            Wish granted ✨
          </p>
        </div>
      )}
      {scene === "celebrate" && <CherryCelebration />}
    </main>
  );
}
