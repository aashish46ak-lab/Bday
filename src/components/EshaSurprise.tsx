"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";
import { audio } from "@/lib/audio";
import SoundController from "./SoundController";

type Scene =
  | "pin"
  | "gift"
  | "splash"
  | "bouquet"
  | "letter"
  | "photo"
  | "journey"
  | "reasons"
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

const REASONS = [
  "You make hard days feel lighter.",
  "Your smile is genuinely contagious.",
  "You care in a quiet, steady way.",
  "You deserve soft mornings and good people.",
  "The world is kinder with you in it.",
  "You turn ordinary moments into memories.",
  "Your strength is soft and real.",
  "You are worth every good wish.",
];

function FloatingPetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 5 + ((i * 17) % 90),
        delay: i * 0.55,
        dur: 5 + (i % 4) * 1.2,
        size: 10 + (i % 5) * 3,
        px: (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 12),
      })),
    []
  );
  return (
    <>
      {petals.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute text-pink-300/35"
          style={{
            left: `${p.left}%`,
            top: "-5%",
            fontSize: p.size,
            animation: `fallPetal ${p.dur}s linear ${p.delay}s infinite`,
            ...({ ["--px"]: `${p.px}px` } as React.CSSProperties),
          }}
        >
          ❀
        </span>
      ))}
    </>
  );
}

function SolarSystem() {
  const planets = [
    { r: 28, size: 8, speed: 22, color: "#f0a0b0" },
    { r: 42, size: 11, speed: 36, color: "#ffc8a0" },
    { r: 58, size: 12, speed: 48, color: "#7ec8e3" },
    { r: 74, size: 10, speed: 62, color: "#e07050" },
    { r: 92, size: 16, speed: 80, color: "#e8c87a" },
  ];
  return (
    <div className="relative mx-auto my-2" style={{ width: 220, height: 220 }}>
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(255,200,120,0.5) 0%, transparent 70%)" }}
      />
      {planets.map((p, i) => (
        <div
          key={`orbit-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full border border-pink-300/15"
          style={{ width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r }}
        />
      ))}
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 28, height: 28, marginLeft: -14, marginTop: -14,
          background: "radial-gradient(circle at 35% 35%, #fff5c0, #ffb347 50%, #e07020)",
          boxShadow: "0 0 24px 8px rgba(255,180,80,0.55)",
          animation: "softPulse 2.5s ease-in-out infinite",
        }}
      />
      {planets.map((p, i) => (
        <div
          key={`spin-${i}`}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r,
            animation: `orbitSpin ${p.speed}s linear infinite`,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: p.size, height: p.size,
              left: "50%", top: 0,
              marginLeft: -p.size / 2, marginTop: -p.size / 2,
              background: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function EshaSurprise() {
  const [scene, setScene] = useState<Scene>("pin");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [pickedFlower, setPickedFlower] = useState<number | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

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
        audio.playSfx("click");
        setTimeout(() => go("gift"), 350);
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
    setTimeout(() => go("splash"), 900);
  };

  const shakeJar = () => {
    if (shaking) return;
    setShaking(true);
    audio.playSfx("click");
    setTimeout(() => {
      setReason(REASONS[Math.floor(Math.random() * REASONS.length)]);
      setShaking(false);
    }, 900);
  };

  const shell = (children: React.ReactNode) => (
    <div
      className="fixed inset-0 z-10 overflow-y-auto overflow-x-hidden flex flex-col items-center"
      style={{ background: "linear-gradient(165deg, #1a0a18 0%, #2d1528 40%, #3d1a32 100%)" }}
    >
      <FloatingPetals />
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
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < code.length ? "bg-pink-300 scale-110" : "bg-white/20"}`} />
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
              className="h-12 rounded-xl text-lg text-pink-100/90 active:scale-95 active:bg-pink-400/30"
              style={{ background: "rgba(255,180,200,0.08)", border: "1px solid rgba(255,180,200,0.12)" }}
            >{k}</button>
          ))}
        </div>
        <p className="text-[11px] text-pink-300/50 mt-5">Hint: Ashoj 15 → 1509 💜</p>
        {error && <p className="text-xs text-pink-300 mt-2">Wrong code, try again 💙</p>}
      </div>
    );
  }

  if (scene === "gift") {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-sm text-pink-200/70 mb-8">Tap the gift box to open it 🎁</p>
        <button onClick={openGift} className="relative active:scale-95 transition-transform" style={{ width: 140, height: 140, animation: giftOpen ? "none" : "softPulse 1.4s ease-in-out infinite" }}>
          <div className="absolute inset-0 rounded-lg" style={{ background: giftOpen ? "linear-gradient(180deg,#ff8fab,#c9184a)" : "linear-gradient(180deg,#ffb3c1,#e63956)", boxShadow: "0 12px 40px rgba(230,57,86,0.45)", transform: giftOpen ? "scaleY(0.7) translateY(20px)" : "none", transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-full bg-white/80" style={{ top: 0 }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-4 bg-white/80" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl transition-all duration-500" style={{ transform: giftOpen ? "translateY(-40px) rotate(-15deg) scale(1.2)" : "none", opacity: giftOpen ? 0.3 : 1 }}>🎀</div>
        </button>
      </div>
    );
  }

  if (scene === "splash") {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ animation: "sceneIn 0.55s ease-out both" }}>
        <span className="text-4xl mb-3">🎂</span>
        <p className="text-[10px] tracking-[0.3em] uppercase text-pink-300/60 mb-2">Your Special Day</p>
        <h1 className="text-3xl text-transparent bg-clip-text mb-2" style={{ fontFamily: "Georgia, serif", backgroundImage: "linear-gradient(90deg,#ffb3c1,#fff,#c4b5fd)" }}>HAPPY BIRTHDAY</h1>
        <h2 className="text-2xl text-[#f5d0d8] mb-4" style={{ fontFamily: "Georgia, serif" }}>ESHA</h2>
        <p className="text-xs text-pink-200/50 mb-1">Today · The most special day</p>
        <p className="text-sm text-pink-100/80 max-w-xs leading-relaxed mb-8">&ldquo;Wishing you happiness, good health, and all your dreams come true.&rdquo; 💜</p>
        <button onClick={() => go("bouquet")} className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>Continue →</button>
      </div>
    );
  }

  if (scene === "bouquet") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— A little gift —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-1" style={{ fontFamily: "Georgia, serif" }}>A Digital Bouquet for You</h2>
        <p className="text-xs text-pink-200/40 text-center mb-6">Each flower holds a little message</p>
        <div className="grid grid-cols-3 gap-4 place-items-center mb-6">
          {FLOWERS.map((f, i) => (
            <button key={i} onClick={() => { setPickedFlower(i); audio.playSfx("click"); }} className={`text-4xl active:scale-90 transition-transform ${pickedFlower === i ? "scale-125" : ""}`} style={{ animation: `bloomHeart 0.5s ease-out ${i * 0.08}s both` }}>{f.emoji}</button>
          ))}
        </div>
        <div className="min-h-[72px] rounded-2xl px-4 py-3 text-center text-sm text-pink-100/85 leading-relaxed" style={{ background: "rgba(255,180,200,0.08)", border: "1px solid rgba(255,180,200,0.12)" }}>
          {pickedFlower !== null ? FLOWERS[pickedFlower].msg : "Tap a flower to read its wish 🌸"}
        </div>
        <div className="mt-auto pt-6 flex justify-center">
          <button onClick={() => go("letter")} className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>Next →</button>
        </div>
      </div>
    );
  }

  if (scene === "letter") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— From the heart —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-4" style={{ fontFamily: "Georgia, serif" }}>A Letter For You</h2>
        <div className="flex-1 rounded-2xl px-4 py-5 text-[13px] leading-relaxed text-pink-50/90 overflow-y-auto" style={{ background: "rgba(255,200,220,0.06)", border: "1px solid rgba(255,180,200,0.12)", fontFamily: "Georgia, serif" }}>
          <p className="mb-3">Dear Esha,</p>
          <p className="mb-3">On this special day, I hope you feel how much light you bring — even on the quietest days. Your smile, your strength, and the way you move through the world are gifts.</p>
          <p className="mb-3">May this year be gentle: soft mornings, good people, and more reasons to smile than you can count. You deserve every beautiful thing.</p>
          <p className="mb-3 text-pink-200/70 text-xs border-l-2 border-pink-400/40 pl-3">P.S. Wishing you endless soft days ahead.</p>
          <p className="text-right text-pink-200/80 mt-4">With warm wishes 💜</p>
        </div>
        <div className="pt-5 flex justify-between">
          <button onClick={() => go("bouquet")} className="text-xs text-pink-300/50 px-3 py-2">← Back</button>
          <button onClick={() => go("photo")} className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>Next →</button>
        </div>
      </div>
    );
  }

  if (scene === "photo") {
    return shell(
      <div className="flex-1 flex flex-col items-center" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— A collection of memories —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-6" style={{ fontFamily: "Georgia, serif" }}>A Moment for Esha</h2>
        <div className="bg-white p-2.5 pb-8 shadow-xl" style={{ width: 220, transform: "rotate(-1.5deg)", animation: "cardIn 0.5s ease-out both" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ESHA_PHOTO} alt="Esha" className="w-full aspect-[3/4] object-cover" />
          <p className="mt-2 text-center text-[11px] text-gray-500 italic">Esha · Ashoj 15 · Dang</p>
        </div>

        <div className="mt-5 w-full relative">
          <p className="text-[9px] tracking-[0.2em] uppercase text-pink-300/40 text-center mb-1">little friends for Esha</p>
          <div className="relative h-9 overflow-hidden w-full">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="absolute text-base"
                style={{
                  animation: `hamsterRun ${2.8 + i * 0.25}s linear ${i * 0.35}s infinite`,
                  top: `${(i % 3) * 5}px`,
                  filter: "hue-rotate(-15deg) saturate(1.4) brightness(1.1)",
                }}
              >
                🐹
              </span>
            ))}
          </div>
          <div className="flex justify-center gap-2.5 mt-1">
            {["E", "S", "H", "A"].map((L, i) => (
              <span
                key={L}
                className="inline-flex flex-col items-center"
                style={{ animation: `starTwinkle ${1.2 + i * 0.18}s ease-in-out ${i * 0.1}s infinite` }}
              >
                <span className="text-sm" style={{ filter: "hue-rotate(-15deg) saturate(1.4)" }}>🐹</span>
                <span className="text-[11px] text-pink-200/90 font-semibold tracking-wide">{L}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 flex justify-between w-full">
          <button onClick={() => go("letter")} className="text-xs text-pink-300/50 px-3 py-2">← Back</button>
          <button onClick={() => go("journey")} className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>Next →</button>
        </div>
      </div>
    );
  }

  if (scene === "journey") {
    return shell(
      <div className="flex-1 flex flex-col" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— Our journey —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-1" style={{ fontFamily: "Georgia, serif" }}>Moments Worth Celebrating</h2>
        <p className="text-xs text-pink-200/40 text-center mb-5">Every step, a story</p>
        <div className="space-y-3 flex-1">
          {JOURNEY.map((j, i) => (
            <div key={i} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,180,200,0.07)", border: "1px solid rgba(255,180,200,0.1)", animation: `cardIn 0.4s ease-out ${i * 0.1}s both` }}>
              <p className="text-[9px] tracking-[0.2em] text-pink-300/50 uppercase">{j.tag}</p>
              <p className="text-sm text-pink-50 mt-0.5">{j.title}</p>
              <p className="text-xs text-pink-200/45 mt-0.5">{j.sub}</p>
            </div>
          ))}
        </div>
        <div className="pt-5 flex justify-between">
          <button onClick={() => go("photo")} className="text-xs text-pink-300/50 px-3 py-2">← Back</button>
          <button onClick={() => go("reasons")} className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>Next →</button>
        </div>
      </div>
    );
  }

  if (scene === "reasons") {
    return shell(
      <div className="flex-1 flex flex-col items-center" style={{ animation: "sceneIn 0.45s ease-out both" }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 text-center">— From the heart —</p>
        <h2 className="text-xl text-[#f5d0d8] text-center mt-1 mb-1" style={{ fontFamily: "Georgia, serif" }}>Reasons I'm Grateful for You</h2>
        <p className="text-xs text-pink-200/40 text-center mb-8">Shake the jar and pick a note</p>
        <button onClick={shakeJar} className="relative active:scale-95" style={{ width: 90, height: 130, animation: shaking ? "softPulse 0.25s ease-in-out infinite" : "none" }}>
          <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(180deg,#e8b4c8,#c45c8a)", boxShadow: "0 8px 28px rgba(180,60,100,0.4)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 rounded-b bg-pink-200/80" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute left-1/2 -translate-x-1/2 w-10 h-3 rounded-sm bg-white/70" style={{ top: 28 + i * 16, transform: `translateX(-50%) rotate(${(i % 2) * 4 - 2}deg)` }} />
          ))}
        </button>
        <p className="text-[11px] text-pink-300/50 mt-3">Tap to shake</p>
        {reason && (
          <div className="mt-6 max-w-xs rounded-2xl px-5 py-4 text-center text-sm text-pink-50 leading-relaxed" style={{ background: "rgba(255,180,200,0.1)", border: "1px solid rgba(255,180,200,0.2)", animation: "cardIn 0.4s ease-out both" }}>
            {reason}<div className="mt-2 text-pink-300">💜</div>
          </div>
        )}
        <div className="mt-auto pt-6 flex justify-between w-full">
          <button onClick={() => go("journey")} className="text-xs text-pink-300/50 px-3 py-2">← Back</button>
          <button onClick={() => go("final")} className="px-6 py-2.5 rounded-full text-sm text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>Final wish →</button>
        </div>
      </div>
    );
  }

  return shell(
    <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ animation: "sceneIn 0.55s ease-out both" }}>
      <SolarSystem />
      <p className="text-[10px] tracking-[0.25em] uppercase text-pink-300/50 mb-2 mt-1">❀ With all my heart ❀</p>
      <h2 className="text-2xl text-[#f5d0d8] leading-snug mb-4" style={{ fontFamily: "Georgia, serif" }}>
        May your life always be<br /><em className="text-pink-300">filled with flowers</em>
      </h2>
      <p className="text-sm text-pink-100/75 leading-relaxed max-w-xs mb-2">
        Happy birthday, Esha. May this year bring soft days, honest people, and so many reasons to smile. You deserve the best of everything.
      </p>
      <p className="text-xs text-pink-300/50 mb-4">{SITE_CONFIG.person.dobBS} · {SITE_CONFIG.person.home}</p>
      <div className="relative w-full h-16 mb-3">
        {["E", "S", "H", "A"].map((L, li) => (
          <span key={L} className="absolute text-2xl text-pink-200/90" style={{ left: `${18 + li * 18}%`, top: "20%", textShadow: "0 0 12px rgba(255,150,180,0.6)", animation: `starTwinkle ${1.4 + li * 0.2}s ease-in-out ${li * 0.15}s infinite` }}>{L}</span>
        ))}
      </div>
      <p className="text-[11px] text-pink-300/40">— many many happy returns —</p>
      <button
        onClick={() => { setCode(""); setGiftOpen(false); setPickedFlower(null); setReason(null); go("pin"); }}
        className="mt-6 px-5 py-2 rounded-full text-xs text-pink-200/70 border border-pink-300/20 active:scale-95"
      >↻ Experience again</button>
    </div>
  );
}
