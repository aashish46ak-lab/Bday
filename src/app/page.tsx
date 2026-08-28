"use client";

import { useState } from "react";
import VolumePrompt from "@/components/VolumePrompt";
import EshaSurprise from "@/components/EshaSurprise";

export default function Home() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <VolumePrompt onEnter={() => setEntered(true)} />;
  }

  return <EshaSurprise />;
}
