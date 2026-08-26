"use client";

import { useState, useCallback } from "react";
import VolumePrompt from "@/components/VolumePrompt";
import ScrapbookCover from "@/components/ScrapbookCover";
import SpecialDay from "@/components/SpecialDay";
import LoveLetter from "@/components/LoveLetter";
import GiftPicker from "@/components/GiftPicker";
import BirthdayCake from "@/components/BirthdayCake";
import FlowerCard from "@/components/FlowerCard";
import PhotoCollage from "@/components/PhotoCollage";
import FlipCards from "@/components/FlipCards";
import FinalCard from "@/components/FinalCard";
import SoundController from "@/components/SoundController";

type Scene =
  | "intro"
  | "cover"
  | "day"
  | "letter"
  | "gifts"
  | "cake"
  | "flowers"
  | "photos"
  | "cards"
  | "final";

export default function Home() {
  const [scene, setScene] = useState<Scene>("intro");
  const [finalOn, setFinalOn] = useState(false);
  const [giftOrder, setGiftOrder] = useState<("cake" | "flowers" | "photos")[]>([]);
  const [giftIdx, setGiftIdx] = useState(0);

  const go = useCallback((s: Scene) => setScene(s), []);

  const onPickGift = (g: "cake" | "flowers" | "photos") => {
    const rest = (["cake", "flowers", "photos"] as const).filter((x) => x !== g);
    const order = [g, ...rest];
    setGiftOrder(order);
    setGiftIdx(0);
    go(order[0]);
  };

  const nextGift = () => {
    const next = giftIdx + 1;
    if (next < giftOrder.length) {
      setGiftIdx(next);
      go(giftOrder[next]);
    } else {
      go("cards");
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden">
      {scene === "intro" && <VolumePrompt onEnter={() => go("cover")} />}
      {scene === "cover" && <ScrapbookCover onNext={() => go("day")} />}
      {scene === "day" && <SpecialDay onNext={() => go("letter")} />}
      {scene === "letter" && <LoveLetter onNext={() => go("gifts")} />}
      {scene === "gifts" && <GiftPicker onPick={onPickGift} />}
      {scene === "cake" && <BirthdayCake onDone={nextGift} />}
      {scene === "flowers" && <FlowerCard onNext={nextGift} />}
      {scene === "photos" && <PhotoCollage onNext={nextGift} />}
      {scene === "cards" && (
        <FlipCards
          onNext={() => {
            setFinalOn(true);
            go("final");
          }}
        />
      )}
      {scene === "final" && <FinalCard active={finalOn} />}

      {scene !== "intro" && <SoundController />}
    </main>
  );
}
