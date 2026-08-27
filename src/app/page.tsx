"use client";

import { useState } from "react";
import VolumePrompt from "@/components/VolumePrompt";
import HeartBirthday from "@/components/HeartBirthday";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden">
      {!started ? (
        <VolumePrompt onEnter={() => setStarted(true)} />
      ) : (
        <HeartBirthday />
      )}
    </main>
  );
}
