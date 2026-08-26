"use client";

import { useEffect, useState, useRef } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { audio } from "@/lib/audio";
import Fireworks from "./Fireworks";

interface Props {
  active: boolean;
}

const LETTERS: { x: number; y: number }[][] = [
  [
    { x: 0, y: 0 }, { x: 0, y: 0.5 }, { x: 0, y: 1 },
    { x: 0.55, y: 0 }, { x: 0.45, y: 0.5 }, { x: 0.55, y: 1 },
  ],
  [
    { x: 0.55, y: 0.08 }, { x: 0.25, y: 0 }, { x: 0, y: 0.2 },
    { x: 0.15, y: 0.45 }, { x: 0.4, y: 0.55 }, { x: 0.55, y: 0.75 },
    { x: 0.3, y: 1 }, { x: 0, y: 0.9 },
  ],
  [
    { x: 0, y: 0 }, { x: 0, y: 0.5 }, { x: 0, y: 1 },
    { x: 0.55, y: 0 }, { x: 0.55, y: 0.5 }, { x: 0.55, y: 1 },
    { x: 0.27, y: 0.5 },
  ],
  [
    { x: 0, y: 1 }, { x: 0.28, y: 0 }, { x: 0.55, y: 1 },
    { x: 0.12, y: 0.55 }, { x: 0.42, y: 0.55 },
  ],
];

export default function FinalReveal({ active }: Props) {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    audio.fadeMusic(0.4, 2);
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 7200),
      setTimeout(() => setPhase(6), 9500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    if (!active || phase < 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const letterW = Math.min(w * 0.17, 78);
    const letterH = letterW * 1.4;
    const gap = letterW * 0.32;
    const totalW = letterW * 4 + gap * 3;
    const startX = (w - totalW) / 2;
    const startY = h * 0.28;

    type Star = { x: number; y: number; delay: number; tw: number };
    const stars: Star[] = [];
    LETTERS.forEach((pts, li) => {
      const ox = startX + li * (letterW + gap);
      pts.forEach((p, pi) => {
        stars.push({
          x: ox + p.x * letterW,
          y: startY + p.y * letterH,
          delay: (li * 0.1 + pi * 0.035) * 55,
          tw: Math.random() * Math.PI * 2,
        });
      });
    });

    let frame = 0;
    let raf = 0;
    const draw = () => {
      frame += 1;
      ctx.clearRect(0, 0, w, h);

      // soft letter outlines (readable, not messy)
      LETTERS.forEach((pts, li) => {
        const ox = startX + li * (letterW + gap);
        const reveal = Math.min(1, Math.max(0, (frame - li * 6) / 45));
        if (reveal <= 0) return;
        ctx.strokeStyle = `rgba(232, 200, 122, ${0.22 * reveal})`;
        ctx.lineWidth = 1.25;
        ctx.lineJoin = "round";
        ctx.beginPath();
        pts.forEach((p, i) => {
          const x = ox + p.x * letterW;
          const y = startY + p.y * letterH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      stars.forEach((s) => {
        const local = Math.max(0, frame - s.delay);
        if (local <= 0) return;
        const appear = Math.min(1, local / 18);
        s.tw += 0.055;
        const pulse = 0.65 + 0.35 * Math.sin(s.tw);
        const r = (2.4 + pulse * 1.4) * appear;

        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 6);
        g.addColorStop(0, `rgba(232, 200, 122, ${0.4 * appear * pulse})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 240, ${0.9 * appear})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, phase]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-transparent">
      {phase >= 1 && phase < 5 && (
        <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
      )}

      {phase >= 3 && phase < 5 && (
        <h1
          className="relative z-10 text-5xl sm:text-7xl font-light tracking-[0.35em] text-[#f5e6c8] pl-[0.35em]"
          style={{
            animation: "fadeScale 1.4s ease-out forwards",
            textShadow: "0 0 40px rgba(232,200,122,0.55)",
          }}
        >
          ESHA
        </h1>
      )}

      {phase >= 4 && <Fireworks active intensity={1.2} />}

      {phase >= 4 && (
        <div className="relative z-20 text-center px-6 space-y-5 max-w-md">
          <h2
            className="text-3xl sm:text-4xl font-light text-[#fff8f0]"
            style={{ animation: "fadeScale 1s ease-out 0.25s both" }}
          >
            Happy Birthday, Esha
          </h2>
          {phase >= 5 && (
            <>
              <p
                className="text-base sm:text-lg text-[#c9b8e8]/90 font-light leading-relaxed"
                style={{ animation: "fadeUp 1s ease-out both" }}
              >
                May this year be gentle with you, bright with joy, and full of
                moments that make you smile for no reason at all.
              </p>
              <p
                className="text-[#e8c87a] text-lg font-light"
                style={{ animation: "fadeUp 1s ease-out 0.35s both" }}
              >
                जन्मदिनको हार्दिक शुभकामना ✨
              </p>
            </>
          )}
        </div>
      )}

      {phase >= 6 && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-6 py-4 rounded-2xl border border-[#e8c87a]/20 bg-[#0a0f1c]/75 backdrop-blur-md text-center"
          style={{ animation: "fadeUp 1s ease-out both" }}
        >
          <p className="text-[#f5e6c8] text-sm tracking-wide">{SITE_CONFIG.person.name}</p>
          <p className="text-xs text-[#c9b8e8]/85 mt-1.5">
            🎂 {SITE_CONFIG.person.dobBS}
          </p>
          <p className="text-xs text-[#c9b8e8]/70 mt-1">
            📍 {SITE_CONFIG.person.home}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
