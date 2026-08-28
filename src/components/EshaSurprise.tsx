"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";
import { audio } from "@/lib/audio";
import SoundController from "./SoundController";
import Fireworks from "./Fireworks";

type Scene =
  | "pin"
  | "gift"
  | "splash"
  | "bouquet"
  | "letter"
  | "photo"
  | "journey"
  | "leaves"
  | "final";

const SECRET = "1509";

const FLOWERS = [
  { emoji: "🌸", msg: "You make ordinary days feel soft and special." },
  { emoji: "🌷", msg: "Your quiet strength is something I truly admire." },
  { emoji: "🌺", msg: "May every morning greet you with a reason to smile." },
  { emoji: "🌻", msg: "You turn toward light — and become it for others." },
  { emoji: "🌹", msg: "Gentle, rare, and worth celebrating always." },
  { emoji: "🌼", msg: "Simple joys suit you — and you make them brighter." },
];

const JOURNEY = [
  { tag: "THE BEGINNING", title: "A special person", sub: "Someone who lights up the room without trying." },
  { tag: "SOFT MOMENTS", title: "Quiet strength", sub: "The way you carry your days with grace." },
  { tag: "WARMTH", title: "Little kindnesses", sub: "All the small things that make people feel seen." },
  { tag: "TODAY", title: "Your very special day", sub: "Celebrating you — today and always." },
];

const LEAF_MSGS = [
  { emoji: "🍃", title: "Soft days", text: "May every morning feel light, like petals on warm air." },
  { emoji: "🌸", title: "Your smile", text: "The world is kinder every time you smile." },
  { emoji: "🌿", title: "Quiet strength", text: "You carry hard days with a grace most people never notice." },
  { emoji: "🍂", title: "Little joys", text: "You turn ordinary moments into memories worth keeping." },
  { emoji: "🌺", title: "You matter", text: "You deserve soft people, honest love, and endless reasons to laugh." },
  { emoji: "🌷", title: "This year", text: "May this year wrap you in softness, courage, and surprise." },
  { emoji: "🍀", title: "Lucky us", text: "Anyone who knows you is already a little luckier." },
  { emoji: "🌼", title: "Always", text: "Happy birthday, Esha — many many happy returns." },
];

function FloatingPetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 3 + ((i * 13) % 94),
        delay: i * 0.4,
        dur: 6 + (i % 5) * 1.1,
        size: 11 + (i % 6) * 3,
        px: (i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 14),
        char: i % 3 === 0 ? "❀" : i % 3 === 1 ? "🌸" : "🍃",
      })),
    []
  );
  return (
    <>
      {petals.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute text-pink-300/40"
          style={{
            left: `${p.left}%`,
            top: "-8%",
            fontSize: p.size,
            animation: `fallPetal ${p.dur}s linear ${p.delay}s infinite`,
            ...({ ["--px"]: `${p.px}px` } as React.CSSProperties),
          }}
        >
          {p.char}
        </span>
      ))}
    </>
  );
}

function SolarSystem3D() {
  const planets = [
    { r: 36, size: 9, speed: 14, color: "#f0a0b0", z: 1 },
    { r: 52, size: 12, speed: 22, color: "#ffc8a0", z: 2 },
    { r: 70, size: 13, speed: 30, color: "#7ec8e3", z: 3 },
    { r: 88, size: 11, speed: 40, color: "#e07050", z: 2 },
    { r: 108, size: 18, speed: 55, color: "#e8c87a", z: 1 },
  ];
  return (
    <div
      className="relative mx-auto"
      style={{ width: 240, height: 240, perspective: "600px", transformStyle: "preserve-3d" }}
    >
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,190,100,0.35) 0%, transparent 65%)",
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: "translate(-50%, -50%) rotateX(62deg)",
          animation: "orbitSpin 60s linear infinite",
        }}
      >
        {planets.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: p.r * 2,
              height: p.r * 2,
              left: -p.r,
              top: -p.r,
              borderRadius: "50%",
              border: "1px solid rgba(255,200,220,0.12)",
              transformStyle: "preserve-3d",
              animation: `orbitSpin ${p.speed}s linear infinite`,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: "50%",
                top: 0,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                background: `radial-gradient(circle at 30% 30%, #fff8f0, ${p.color})`,
                boxShadow: `0 0 12px ${p.color}, 0 0 4px rgba(255,255,255,0.4)`,
                transform: `translateZ(${p.z * 8}px)`,
              }}
            />
          </div>
        ))}
      </div>
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 34,
          height: 34,
          marginLeft: -17,
          marginTop: -17,
          background: "radial-gradient(circle at 32% 28%, #fff8d0, #ffb347 45%, #e06018)",
          boxShadow:
            "0 0 30px 10px rgba(255,180,80,0.55), 0 0 60px 20px rgba(255,140,40,0.25)",
          animation: "softPulse 2.8s ease-in-out infinite",
          zIndex: 5,
        }}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="absolute text-[8px] text-pink-100/50"
          style={{
            left: `${12 + i * 15}%`,
            top: `${8 + (i % 3) * 28}%`,
            animation: `starTwinkle ${1.4 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function PinkHamsters() {
  return (
    <div className="mt-5 w-full">
      <p className="text-[9px] tracking-[0.22em] uppercase text-pink-300/45 text-center mb-2">
        little friends for Esha
      </p>
      <div
        className="relative mx-auto overflow-hidden rounded-full"
        style={{
          height: 44,
          maxWidth: 280,
          background: "linear-gradient(180deg, rgba(255,180,200,0.12), rgba(255,140,170,0.06))",
          border: "1px solid rgba(255,180,200,0.18)",
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute text-lg select-none"
            style={{
              animation: `hamsterRun ${2.6 + i * 0.28}s linear ${i * 0.32}s infinite`,
              top: 6 + (i % 2) * 8,
              filter: "hue-rotate(-18deg) saturate(1.45) brightness(1.08)",
              fontSize: 16 + (i % 3),
            }}
          >
            🐹
          </span>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-3">
        {["E", "S", "H", "A"].map((L, i) => (
          <div
            key={L}
            className="flex flex-col items-center"
            style={{ animation: `cardIn 0.5s ease-out ${0.1 + i * 0.1}s both` }}
          >
            <span
              className="text-xl leading-none"
              style={{
                filter: "hue-rotate(-18deg) saturate(1.5)",
                animation: `softPulse ${1.6 + i * 0.15}s ease-in-out ${i * 0.12}s infinite`,
              }}
            >
              🐹
            </span>
            <span
              className="text-sm font-semibold text-pink-100 mt-0.5 tracking-widest"
              style={{ textShadow: "0 0 12px rgba(255,150,180,0.55)" }}
            >
              {L}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EshaSurprise() {
  const [scene, setScene] = useState<Scene>("pin");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [pickedFlower, setPickedFlower] = useState<number | null>(null);
  const [pickedLeaf, setPickedLeaf] = useState<number | null>(null);
  const [showFw, setShowFw] = useState(false);

  useEffect(() => {
    audio.startMusic().catch(() => {});
  }, []);

  const go = useCallback((s: Scene) => {
    audio.playSfx("click");
    setScene(s);
  }, []);

  const pressDigit = (d: string) => {
    if (code.length >= 4) return;
    const next = code + d;
    setCode(next);
    setError(false);
    if (next.length === 4) {
      if (next === SECRET) {
        audio.playSfx("gift");
        setShowFw(true);
        setTimeout(() => setShowFw(false), 4800);
        setTimeout(() => go("gift"), 700);
      } else {
        setError(true);
        setTimeout(() => setCode(""), 600);
      }
    }
  };

  const openGift = () => {
    if (giftOpen) return;
    setGiftOpen(true);
    audio.playSfx("gift");
    setShowFw(true);
    setTimeout(() => setShowFw(false), 4200);
    setTimeout(() => go("splash"), 850);
  };

  const shell = (children: React.ReactNode) => (
    <div
      className="fixed inset-0 z-10 overflow-y-auto overflow-x-hidden flex flex-col items-center"
      style={{ background: "linear-gradient(165deg, #1a0a18 0%, #2d1528 40%, #3d1a32 100%)" }}
    >
      <FloatingPetals />
      {showFw && <Fireworks active intensity={1.4} />}
      <div className="relative z-10 w-full max-w-md px-5 py-8 min-h-[100dvh] flex flex-col">{children}</div>
      <SoundController />
    </div>
  );

  if (scene === "pin") {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <span className="text-3xl mb-3">🌷</span>
        <h1 className="text-xl text-[#f5d0d8]" style={{ fontFamily: "Georgia, serif" }}>For You, Esha</h1>
        <p className="text-xs text-pink-200/50 mt-1 mb-6">Enter the secret code</p>
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < code.length
                  ? "bg-pink-300 scale-125 shadow-[0_0_10px_rgba(255,180,200,0.7)]"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 w-56">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "×", "0", "⌫"].map((k) => (
            <button
              key={k}
              onClick={() => {
                if (k === "×") setCode("");
                else if (k === "⌫") setCode((c) => c.slice(0, -1));
                else pressDigit(k);
              }}
              className="h-12 rounded-xl text-lg text-pink-100/90 active:scale-90 transition-transform"
              style={{ background: "rgba(255,180,200,0.08)", border: "1px solid rgba(255,180,200,0.12)" }}
            >
              {k}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-pink-300/50 mt-5">Hint: Ashoj 15 → 1509 💜</p>
        {error && <p className="text-xs text-pink-300 mt-2 animate-pulse">Wrong code, try again 💙</p>}
      </div>
    );
  }

  if (scene === "gift") {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-sm text-pink-200/70 mb-8">Tap the gift box to open it 🎁</p>
        <button
          onClick={openGift}
          className="relative active:scale-95 transition-transform"
          style={{ width: 140, height: 140, animation: giftOpen ? "none" : "softPulse 1.4s ease-in-out infinite" }}
        >
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: giftOpen
                ? "linear-gradient(180deg,#ff8fab,#c9184a)"
                : "linear-gradient(180deg,#ffb3c1,#e63956)",
              boxShadow: "0 12px 40px rgba(230,57,86,0.45)",
              transform: giftOpen ? "scaleY(0.7) translateY(20px)" : "none",
              transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-full bg-white/80" style={{ top: 0 }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-4 bg-white/80" />
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl transition-all duration-500"
            style={{
              transform: giftOpen ? "translateY(-40px) rotate(-15deg) scale(1.2)" : "none",
              opacity: giftOpen ? 0.3 : 1,
            }}
          >
            🎀
          </div>
        </button>
      </div>
    );
  }

  if (scene === "splash") {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ animation: "sceneIn 0.55s ease-out both" }}>
        <span className="text-4xl mb-3">🎂</span>
        <p className="text-[10px] tracking-[0.3em] uppercase text-pink-300/60 mb-2">Your Special Day</p>
        <h1
          className="text-3xl text-transparent bg-clip-text mb-2"
          style={{
            fontFamily: "Georgia, serif",
            backgroundImage: "linear-gradient(90deg,#ffb3c1,#fff,#c4b5fd)",
          }}
        >
          HAPPY BIRTHDAY
        </h1>
        <h2 className="text-2xl text-[#f5d0d8] mb-4" style={{ fontFamily: "Georgia, serif" }}>
          ESHA
        </h2>
        <p className="text-xs text-pink-200/50 mb-1">Today · The most special day</p>
        <p className="text-sm text-pink-100/80 max-w-xs leading-relaxed mb-8">
          &ldquo;Wishing you happiness, good health, and all your dreams come true.&rdquo; 💜
        </p>
        <button
          onClick={() => go("bouquet")}
          className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95"
          style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
        >
          Continue →
        </button>
      </div>
    );
  }

  if (scene === "bouquet") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— A little gift —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-1" style={{ fontFamily: "Georgia, serif" }}>
          A Digital Bouquet for You
        </h2>
        <p className="text-xs text-pink-200/40 text-center mb-6">Tap a flower for a wish</p>
        <div className="grid grid-cols-3 gap-4 place-items-center mb-6">
          {FLOWERS.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                setPickedFlower(i);
                audio.playSfx("click");
              }}
              className={`text-4xl active:scale-90 transition-transform ${pickedFlower === i ? "scale-125" : ""}`}
              style={{ animation: `bloomHeart 0.5s ease-out ${i * 0.08}s both` }}
            >
              {f.emoji}
            </button>
          ))}
        </div>
        <div
          className="min-h-[72px] rounded-2xl px-4 py-3 text-center text-sm text-pink-100/85 leading-relaxed"
          style={{ background: "rgba(255,180,200,0.08)", border: "1px solid rgba(255,180,200,0.12)" }}
        >
          {pickedFlower !== null ? FLOWERS[pickedFlower].msg : "Tap a flower to read its wish 🌸"}
        </div>
        <div className="mt-auto pt-6 flex justify-center">
          <button
            onClick={() => go("letter")}
            className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (scene === "letter") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— From the heart —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-4" style={{ fontFamily: "Georgia, serif" }}>
          A Letter For You
        </h2>
        <div
          className="flex-1 rounded-2xl px-4 py-5 text-[13px] leading-relaxed text-pink-50/90 overflow-y-auto"
          style={{
            background: "rgba(255,200,220,0.06)",
            border: "1px solid rgba(255,180,200,0.12)",
            fontFamily: "Georgia, serif",
          }}
        >
          <p className="mb-3">Dear Esha,</p>
          <p className="mb-3">
            On this special day, I hope you feel how much light you bring — even on the quietest days. Your
            smile, your strength, and the way you move through the world are gifts.
          </p>
          <p className="mb-3">
            May this year be gentle: soft mornings, good people, and more reasons to smile than you can count.
            You deserve every beautiful thing.
          </p>
          <p className="mb-3 text-pink-200/70 text-xs border-l-2 border-pink-400/40 pl-3">
            P.S. Wishing you endless soft days ahead.
          </p>
          <p className="text-right text-pink-200/80 mt-4">With warm wishes 💜</p>
        </div>
        <div className="pt-5 flex justify-between">
          <button onClick={() => go("bouquet")} className="text-xs text-pink-300/50 px-3 py-2">
            ← Back
          </button>
          <button
            onClick={() => go("photo")}
            className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (scene === "photo") {
    return shell(
      <div className="flex-1 flex flex-col items-center" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">
          — A collection of memories —
        </p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-5" style={{ fontFamily: "Georgia, serif" }}>
          A Moment for Esha
        </h2>
        <div
          className="bg-white p-2.5 pb-8 shadow-xl"
          style={{ width: 220, transform: "rotate(-1.5deg)", animation: "cardIn 0.5s ease-out both" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ESHA_PHOTO} alt="Esha" className="w-full aspect-[3/4] object-cover" />
          <p className="mt-2 text-center text-[11px] text-gray-500 italic">Esha · Ashoj 15 · Dang</p>
        </div>

        <PinkHamsters />

        <div className="mt-auto pt-6 flex justify-between w-full">
          <button onClick={() => go("letter")} className="text-xs text-pink-300/50 px-3 py-2">
            ← Back
          </button>
          <button
            onClick={() => go("journey")}
            className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (scene === "journey") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— Our journey —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-1" style={{ fontFamily: "Georgia, serif" }}>
          Moments Worth Celebrating
        </h2>
        <p className="text-xs text-pink-200/40 text-center mb-5">Every step, a story</p>
        <div className="space-y-3 flex-1">
          {JOURNEY.map((j, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,180,200,0.07)",
                border: "1px solid rgba(255,180,200,0.1)",
                animation: `cardIn 0.4s ease-out ${i * 0.1}s both`,
              }}
            >
              <p className="text-[9px] tracking-[0.2em] text-pink-300/50 uppercase">{j.tag}</p>
              <p className="text-sm text-pink-50 mt-0.5">{j.title}</p>
              <p className="text-xs text-pink-200/45 mt-0.5">{j.sub}</p>
            </div>
          ))}
        </div>
        <div className="pt-5 flex justify-between">
          <button onClick={() => go("photo")} className="text-xs text-pink-300/50 px-3 py-2">
            ← Back
          </button>
          <button
            onClick={() => go("leaves")}
            className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (scene === "leaves") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— Soft wishes —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-1" style={{ fontFamily: "Georgia, serif" }}>
          Floating Leaves
        </h2>
        <p className="text-xs text-pink-200/45 text-center mb-4">Tap any leaf to open a wish 🍃</p>

        <div className="relative flex-1 min-h-[220px]">
          {LEAF_MSGS.map((leaf, i) => {
            const cols = i % 4;
            const rows = Math.floor(i / 4);
            const left = 8 + cols * 22 + (rows % 2) * 6;
            const top = 8 + rows * 42 + (cols % 2) * 8;
            return (
              <button
                key={i}
                onClick={() => {
                  setPickedLeaf(i);
                  audio.playSfx("click");
                }}
                className="absolute active:scale-90 transition-transform"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  fontSize: 28 + (i % 3) * 4,
                  animation: `leafFloat ${3.2 + (i % 4) * 0.6}s ease-in-out ${i * 0.15}s infinite`,
                  filter: pickedLeaf === i ? "drop-shadow(0 0 10px rgba(255,200,150,0.8))" : "none",
                }}
                aria-label={leaf.title}
              >
                {leaf.emoji}
              </button>
            );
          })}
        </div>

        <div
          className="min-h-[88px] rounded-2xl px-4 py-3 text-center"
          style={{
            background: "rgba(255,180,200,0.08)",
            border: "1px solid rgba(255,180,200,0.15)",
            animation: pickedLeaf !== null ? "cardIn 0.35s ease-out both" : undefined,
          }}
        >
          {pickedLeaf !== null ? (
            <>
              <p className="text-[10px] tracking-[0.2em] uppercase text-pink-300/60 mb-1">
                {LEAF_MSGS[pickedLeaf].emoji} {LEAF_MSGS[pickedLeaf].title}
              </p>
              <p className="text-sm text-pink-50/90 leading-relaxed">{LEAF_MSGS[pickedLeaf].text}</p>
            </>
          ) : (
            <p className="text-sm text-pink-200/50 pt-4">Click a floating leaf…</p>
          )}
        </div>

        <div className="pt-5 flex justify-between">
          <button onClick={() => go("journey")} className="text-xs text-pink-300/50 px-3 py-2">
            ← Back
          </button>
          <button
            onClick={() => go("final")}
            className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
          >
            Final wish →
          </button>
        </div>
      </div>
    );
  }

  return shell(
    <div
      className="flex-1 flex flex-col items-center justify-center text-center"
      style={{ animation: "sceneIn 0.55s ease-out both" }}
    >
      <SolarSystem3D />
      <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 mb-2 mt-1">❀ With all my heart ❀</p>
      <h2 className="text-2xl text-[#f5d0d8] leading-snug mb-4" style={{ fontFamily: "Georgia, serif" }}>
        May your life always be
        <br />
        <em className="text-pink-300">filled with flowers</em>
      </h2>
      <p className="text-sm text-pink-100/75 leading-relaxed max-w-xs mb-2">
        Happy birthday, Esha. May this year bring soft days, honest people, and so many reasons to smile. You
        deserve the best of everything.
      </p>
      <p className="text-xs text-pink-300/50 mb-4">
        {SITE_CONFIG.person.dobBS} · {SITE_CONFIG.person.home}
      </p>
      <div className="relative w-full h-14 mb-2">
        {["E", "S", "H", "A"].map((L, li) => (
          <span
            key={L}
            className="absolute text-2xl text-pink-200/90"
            style={{
              left: `${18 + li * 18}%`,
              top: "15%",
              textShadow: "0 0 12px rgba(255,150,180,0.6)",
              animation: `starTwinkle ${1.4 + li * 0.2}s ease-in-out ${li * 0.15}s infinite`,
            }}
          >
            {L}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-pink-300/40">— many many happy returns —</p>
      <button
        onClick={() => {
          setCode("");
          setGiftOpen(false);
          setPickedFlower(null);
          setPickedLeaf(null);
          go("pin");
        }}
        className="mt-6 px-5 py-2 rounded-full text-xs text-pink-200/70 border border-pink-300/20 active:scale-95"
      >
        ↻ Experience again
      </button>
    </div>
  );
}
