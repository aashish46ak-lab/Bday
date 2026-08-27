"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { audio } from "@/lib/audio";
import SoundController from "./SoundController";

/** Next Ashoj 15 ≈ early October — adjust year if needed */
function getTargetBirthday(): Date {
  const now = new Date();
  let y = now.getFullYear();
  const target = new Date(y, 9, 1, 0, 0, 0); // Oct 1 approx Ashoj season
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

export default function HeartBirthday() {
  const [phase, setPhase] = useState<Phase>("heart");
  const [typed, setTyped] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [showRestart, setShowRestart] = useState(false);

  const target = useMemo(() => getTargetBirthday(), []);
  const cd = useCountdown(target);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("burst"), 1800);
    const t2 = setTimeout(() => setPhase("tree"), 2800);
    const t3 = setTimeout(() => setPhase("message"), 4800);
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
      }, 32);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setTyped((p) => p + "\n");
      setLineIdx((i) => i + 1);
      setCharIdx(0);
    }, 280);
    return () => clearTimeout(t);
  }, [phase, lineIdx, charIdx]);

  const floaters = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 17) % 84),
        delay: (i * 0.35) % 4,
        size: 10 + (i % 5) * 4,
        dur: 3.5 + (i % 4) * 0.8,
      })),
    []
  );

  const canopy = useMemo(() => {
    const pts: { x: number; y: number; s: number; c: string; d: number }[] = [];
    const colors = ["#e63956", "#ff4d6d", "#ff758f", "#c9184a", "#ff8fa3", "#ffb3c1"];
    for (let i = 0; i < 55; i++) {
      const t = (i / 55) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy =
        -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push({
        x: 50 + hx * 1.9,
        y: 42 + hy * 1.55,
        s: 11 + (i % 4) * 3,
        c: colors[i % colors.length],
        d: (i % 12) * 0.05,
      });
    }
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 18;
      pts.push({
        x: 50 + Math.cos(a) * r * 0.9,
        y: 38 + Math.sin(a) * r * 0.75,
        s: 9 + Math.random() * 8,
        c: colors[i % colors.length],
        d: 0.3 + Math.random() * 0.5,
      });
    }
    return pts;
  }, []);

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 220,
        dy: -80 - Math.random() * 160,
        c: ["#e63956", "#ff758f", "#ffb3c1", "#fff", "#ff4d6d"][i % 5],
        delay: Math.random() * 0.2,
      })),
    []
  );

  const restart = useCallback(() => {
    setPhase("heart");
    setTyped("");
    setLineIdx(0);
    setCharIdx(0);
    setShowRestart(false);
    setTimeout(() => setPhase("burst"), 1800);
    setTimeout(() => setPhase("tree"), 2800);
    setTimeout(() => setPhase("message"), 4800);
  }, []);

  return (
    <div className="fixed inset-0 z-10 bg-hearts overflow-hidden flex flex-col items-center justify-center px-4 py-6">
      {floaters.map((f) => (
        <span
          key={f.id}
          className="pointer-events-none absolute text-pink-200/40"
          style={{
            left: `${f.left}%`,
            top: `${12 + (f.id % 8) * 10}%`,
            fontSize: f.size,
            animation: `floatHeart ${f.dur}s ease-in-out ${f.delay}s infinite`,
          }}
        >
          ♥
        </span>
      ))}

      <div
        className="cream-card relative w-full max-w-[380px] min-h-[520px] overflow-hidden px-5 pt-8 pb-6"
        style={{ animation: "cardIn 0.7s ease-out both" }}
      >
        {(phase === "heart" || phase === "burst") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div
              className="relative"
              style={{
                animation:
                  phase === "burst"
                    ? "popBurst 0.9s ease-out forwards"
                    : "softPulse 1.4s ease-in-out infinite",
              }}
            >
              <span className="text-6xl text-[#e63956]">♥</span>
            </div>
            {phase === "heart" && (
              <p
                className="mt-4 text-xl text-[#c9184a]"
                style={{ fontFamily: "Georgia, serif" }}
              >
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
                    animation: `confetti 0.9s ease-out ${c.delay}s forwards`,
                    ...({ ["--dx"]: `${c.dx}px`, ["--dy"]: `${c.dy}px` } as React.CSSProperties),
                  }}
                />
              ))}
          </div>
        )}

        {(phase === "tree" || phase === "message") && (
          <div className="relative z-10 flex flex-col h-full min-h-[480px]">
            <div className="flex-1 min-h-[140px] pt-1">
              {phase === "message" && (
                <pre
                  className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#4a3038] text-left"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {typed}
                  <span
                    className="inline-block w-[2px] h-[0.9em] bg-[#e63956] ml-0.5 align-middle"
                    style={{ animation: "typeCaret 0.8s step-end infinite" }}
                  />
                </pre>
              )}
            </div>

            <div className="relative mx-auto mt-2" style={{ width: 260, height: 260 }}>
              {canopy.map((p, i) => (
                <span
                  key={i}
                  className="absolute"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    fontSize: p.s,
                    color: p.c,
                    transform: "translate(-50%, -50%)",
                    animation: `bloomHeart 0.55s ease-out ${p.d}s both`,
                    textShadow: "0 1px 2px rgba(180,30,60,0.25)",
                  }}
                >
                  ♥
                </span>
              ))}
              <div
                className="absolute left-1/2 bottom-2 -translate-x-1/2 origin-bottom"
                style={{
                  width: 18,
                  height: 90,
                  background: "linear-gradient(180deg, #a67c52, #7a5638)",
                  animation: "growTrunk 0.8s ease-out both",
                  borderRadius: "6px 6px 2px 2px",
                }}
              />
              <div className="absolute left-4 right-4 bottom-1 h-[2px] bg-[#d4b8a0]/80" />
            </div>

            {phase === "message" &&
              Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={`fall-${i}`}
                  className="pointer-events-none absolute text-[#ff6b8a]"
                  style={{
                    left: `${30 + (i * 7) % 45}%`,
                    top: "38%",
                    fontSize: 10 + (i % 4) * 3,
                    animation: `fallHeart ${3.5 + (i % 3)}s linear ${i * 0.4}s infinite`,
                  }}
                >
                  ♥
                </span>
              ))}

            <div className="mt-3 text-center">
              <p className="text-[11px] text-[#8a6870]">
                {cd.done
                  ? "It's your day, Esha 🎂"
                  : "Waiting for your birthday…"}
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
          </div>
        )}
      </div>

      {showRestart && (
        <button
          onClick={restart}
          className="mt-5 px-6 py-2.5 rounded-full text-sm text-white bg-white/20 border border-white/40 backdrop-blur-sm active:scale-95"
        >
          ↻ Watch again
        </button>
      )}

      <SoundController />
    </div>
  );
}
