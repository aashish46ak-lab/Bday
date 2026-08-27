"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SITE_CONFIG } from "@/lib/config";
import SoundController from "./SoundController";

function getTargetBirthday(): Date {
  const now = new Date();
  let y = now.getFullYear();
  const target = new Date(y, 9, 1, 0, 0, 0);
  if (now > target) target.setFullYear(y + 1);
  return target;
}

function useCountdown(target: Date) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setLeft({ d: 0, h: 0, m: 0, s: 0, done: true });
        return;
      }
      const s = Math.floor(diff / 1000);
      setLeft({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
        done: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function useLandscape() {
  const [land, setLand] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
    const wide = window.matchMedia("(min-width: 700px)");
    const apply = () => setLand(mq.matches || wide.matches);
    apply();
    mq.addEventListener("change", apply);
    wide.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      wide.removeEventListener("change", apply);
    };
  }, []);
  return land;
}

const MESSAGE_LINES = [
  "For you, Esha 💕",
  "",
  "Another year of soft smiles,",
  "quiet strength, and all the little",
  "things that make the days warmer.",
  "",
  "May this year be gentle —",
  "soft mornings, good people,",
  "and more reasons to smile",
  "than you can count.",
  "",
  "Happy Birthday.",
  "You deserve every good thing. ✨",
];

type Phase = "heart" | "burst" | "tree" | "message";

function buildCanopy() {
  const pts: { x: number; y: number; s: number; c: string; d: number }[] = [];
  const colors = [
    "#e63956", "#ff4d6d", "#ff758f", "#c9184a", "#ff8fa3",
    "#ffb3c1", "#ff6b8a", "#d62839", "#ff99ac", "#f72585", "#ff5c8a",
  ];

  let seed = 12345;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const mapX = (hx: number) => 50 + hx * 2.15;
  const mapY = (hy: number) => 32 - hy * 1.65;

  for (let ring = 0; ring < 4; ring++) {
    const n = 56 + ring * 8;
    const scale = 1 - ring * 0.12;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3) * scale;
      const hy =
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)) *
        scale;
      pts.push({
        x: mapX(hx),
        y: mapY(hy),
        s: 11 + (i % 4) * 2.5 - ring * 0.5,
        c: colors[(i + ring * 2) % colors.length],
        d: 0.08 * ring + (i % 8) * 0.015,
      });
    }
  }

  const inHeart = (nx: number, ny: number) => {
    const x = nx;
    const y = ny;
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y <= 0.0;
  };

  let filled = 0;
  let tries = 0;
  while (filled < 140 && tries < 1200) {
    tries++;
    const nx = rnd() * 2.2 - 1.1;
    const ny = rnd() * 2.0 - 0.9;
    if (!inHeart(nx, ny * 0.95)) continue;
    const hx = nx * 14;
    const hy = -ny * 12;
    pts.push({
      x: mapX(hx),
      y: mapY(hy),
      s: 7 + rnd() * 11,
      c: colors[Math.floor(rnd() * colors.length)],
      d: 0.2 + rnd() * 0.55,
    });
    filled++;
  }

  return pts;
}

function TreeVisual({
  canopy,
  showFall,
}: {
  canopy: ReturnType<typeof buildCanopy>;
  showFall: boolean;
}) {
  return (
    <div className="relative mx-auto" style={{ width: "100%", maxWidth: 300, height: 260 }}>
      {canopy.map((p, i) => (
        <span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.s,
            color: p.c,
            transform: "translate(-50%, -50%)",
            animation: `bloomHeart 0.55s ease-out ${p.d}s both`,
            textShadow: "0 1px 2px rgba(160,30,50,0.18)",
            lineHeight: 1,
          }}
        >
          ♥
        </span>
      ))}

      <div
        className="absolute left-1/2"
        style={{
          bottom: 4,
          width: 16,
          height: 72,
          marginLeft: -8,
          background:
            "linear-gradient(90deg, #7a5630 0%, #c4a06a 35%, #a67c42 55%, #6b4420 100%)",
          borderRadius: "6px 6px 2px 2px",
          animation: "growTrunk 0.9s ease-out both",
          boxShadow: "2px 0 4px rgba(0,0,0,0.12)",
        }}
      />
      <div
        className="absolute left-1/2"
        style={{
          bottom: 70,
          width: 22,
          height: 14,
          marginLeft: -11,
          background: "linear-gradient(180deg, #8b6914, #a67c52)",
          borderRadius: "50% 50% 4px 4px",
          opacity: 0.85,
          animation: "bloomHeart 0.4s ease-out 0.3s both",
        }}
      />

      <div
        className="absolute left-[12%] right-[12%] bottom-0 h-[2px] rounded-full"
        style={{ background: "rgba(180,150,120,0.55)" }}
      />

      {showFall &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={`f${i}`}
            className="pointer-events-none absolute text-[#ff6b8a]"
            style={{
              left: `${20 + ((i * 6) % 60)}%`,
              top: "28%",
              fontSize: 8 + (i % 5) * 2.5,
              animation: `fallHeart ${3 + (i % 4) * 0.55}s linear ${i * 0.3}s infinite`,
            }}
          >
            ♥
          </span>
        ))}
    </div>
  );
}

export default function HeartBirthday() {
  const [phase, setPhase] = useState<Phase>("heart");
  const [typed, setTyped] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [showRestart, setShowRestart] = useState(false);
  const landscape = useLandscape();

  const target = useMemo(() => getTargetBirthday(), []);
  const cd = useCountdown(target);
  const canopy = useMemo(() => buildCanopy(), []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("burst"), 1600);
    const t2 = setTimeout(() => setPhase("tree"), 2600);
    const t3 = setTimeout(() => setPhase("message"), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (phase !== "message") return;
    if (lineIdx >= MESSAGE_LINES.length) {
      setShowRestart(true);
      return;
    }
    const line = MESSAGE_LINES[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setTyped((p) => p + line[charIdx]);
        setCharIdx((c) => c + 1);
      }, 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setTyped((p) => p + "\n");
      setLineIdx((i) => i + 1);
      setCharIdx(0);
    }, 240);
    return () => clearTimeout(t);
  }, [phase, lineIdx, charIdx]);

  const floaters = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: 6 + ((i * 19) % 88),
        delay: (i * 0.4) % 4,
        size: 10 + (i % 5) * 4,
        dur: 3.5 + (i % 4) * 0.8,
      })),
    []
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 200,
        dy: -70 - Math.random() * 140,
        c: ["#e63956", "#ff758f", "#ffb3c1", "#fff", "#ff4d6d"][i % 5],
        delay: Math.random() * 0.15,
      })),
    []
  );

  const restart = useCallback(() => {
    setPhase("heart");
    setTyped("");
    setLineIdx(0);
    setCharIdx(0);
    setShowRestart(false);
    setTimeout(() => setPhase("burst"), 1600);
    setTimeout(() => setPhase("tree"), 2600);
    setTimeout(() => setPhase("message"), 4200);
  }, []);

  const messageBlock = phase === "message" && (
    <pre
      className="whitespace-pre-wrap text-[13px] sm:text-[14px] leading-relaxed text-[#4a3038] text-left"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {typed}
      <span
        className="inline-block w-[2px] h-[0.9em] bg-[#e63956] ml-0.5 align-middle"
        style={{ animation: "typeCaret 0.8s step-end infinite" }}
      />
    </pre>
  );

  const countdownBlock = (
    <div className="text-center mt-2">
      <p className="text-[11px] text-[#8a6870]">
        {cd.done ? "It's your day, Esha 🎂" : "Waiting for your birthday…"}
      </p>
      {!cd.done && (
        <p className="text-sm text-[#c9184a] mt-0.5 tabular-nums">
          {cd.d}d {cd.h}h {cd.m}m {cd.s}s
        </p>
      )}
      <p className="text-[10px] text-[#a08088] mt-1">
        {SITE_CONFIG.person.dobBS} · {SITE_CONFIG.person.home}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-10 bg-hearts overflow-hidden flex flex-col items-center justify-center px-3 py-4 sm:px-5">
      {floaters.map((f) => (
        <span
          key={f.id}
          className="pointer-events-none absolute text-pink-200/35"
          style={{
            left: `${f.left}%`,
            top: `${10 + (f.id % 8) * 10}%`,
            fontSize: f.size,
            animation: `floatHeart ${f.dur}s ease-in-out ${f.delay}s infinite`,
          }}
        >
          ♥
        </span>
      ))}

      <div
        className={`cream-card relative w-full overflow-hidden ${
          landscape
            ? "max-w-[820px] min-h-[min(90dvh,420px)] px-6 py-5"
            : "max-w-[380px] min-h-[min(90dvh,560px)] px-5 pt-7 pb-5"
        }`}
        style={{ animation: "cardIn 0.65s ease-out both" }}
      >
        {(phase === "heart" || phase === "burst") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div
              style={{
                animation:
                  phase === "burst"
                    ? "popBurst 0.85s ease-out forwards"
                    : "softPulse 1.3s ease-in-out infinite",
              }}
            >
              <span className="text-6xl text-[#e63956]">♥</span>
            </div>
            {phase === "heart" && (
              <p className="mt-4 text-xl text-[#c9184a]" style={{ fontFamily: "Georgia, serif" }}>
                Happy Birthday
              </p>
            )}
            {phase === "burst" &&
              confetti.map((c) => (
                <span
                  key={c.id}
                  className="absolute w-2 h-2 rounded-sm"
                  style={{
                    background: c.c,
                    left: "50%",
                    top: "45%",
                    animation: `confetti 0.85s ease-out ${c.delay}s forwards`,
                    ...({ ["--dx"]: `${c.dx}px`, ["--dy"]: `${c.dy}px` } as React.CSSProperties),
                  }}
                />
              ))}
          </div>
        )}

        {(phase === "tree" || phase === "message") && (
          <div
            className={
              landscape
                ? "relative z-10 flex flex-row items-center gap-4 h-full min-h-[340px]"
                : "relative z-10 flex flex-col h-full"
            }
          >
            <div
              className={
                landscape
                  ? "flex-1 min-w-0 pr-2 flex flex-col justify-center"
                  : "min-h-[150px] mb-2"
              }
            >
              {messageBlock}
            </div>

            <div
              className={
                landscape
                  ? "flex-1 min-w-0 flex flex-col items-center justify-center"
                  : "flex flex-col items-center"
              }
            >
              <TreeVisual canopy={canopy} showFall={phase === "message"} />
              {countdownBlock}
            </div>
          </div>
        )}
      </div>

      {showRestart && (
        <button
          onClick={restart}
          className="mt-4 px-6 py-2.5 rounded-full text-sm text-white bg-white/20 border border-white/40 backdrop-blur-sm active:scale-95"
        >
          ↻ Watch again
        </button>
      )}

      <SoundController />
    </div>
  );
}
