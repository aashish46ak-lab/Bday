"use client";

import { useEffect, useState, useRef } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { audio } from "@/lib/audio";
import Fireworks from "./Fireworks";

interface Props {
  active: boolean;
}

export default function FinalReveal({ active }: Props) {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    audio.fadeMusic(0.25, 2);
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 4800),
      setTimeout(() => setPhase(4), 6200),
      setTimeout(() => setPhase(5), 8500),
      setTimeout(() => setPhase(6), 11000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    if (!active || phase < 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const letters: { x: number; y: number }[][] = [
      [{ x: 0.18, y: 0.35 }, { x: 0.18, y: 0.5 }, { x: 0.18, y: 0.65 }, { x: 0.28, y: 0.35 }, { x: 0.28, y: 0.5 }, { x: 0.28, y: 0.65 }],
      [{ x: 0.38, y: 0.38 }, { x: 0.34, y: 0.35 }, { x: 0.3, y: 0.4 }, { x: 0.34, y: 0.5 }, { x: 0.38, y: 0.55 }, { x: 0.34, y: 0.65 }, { x: 0.3, y: 0.62 }],
      [{ x: 0.48, y: 0.35 }, { x: 0.48, y: 0.5 }, { x: 0.48, y: 0.65 }, { x: 0.58, y: 0.35 }, { x: 0.58, y: 0.5 }, { x: 0.58, y: 0.65 }, { x: 0.48, y: 0.5 }, { x: 0.58, y: 0.5 }],
      [{ x: 0.68, y: 0.65 }, { x: 0.73, y: 0.35 }, { x: 0.78, y: 0.65 }, { x: 0.7, y: 0.5 }, { x: 0.76, y: 0.5 }],
    ];

    const w = window.innerWidth;
    const h = window.innerHeight;
    let progress = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      progress = Math.min(1, progress + 0.008);
      letters.forEach((pts) => {
        pts.forEach((p, i) => {
          if (i / pts.length > progress) return;
          const x = p.x * w;
          const y = p.y * h;
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 200, 122, ${0.6 + 0.4 * progress})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 200, 122, ${0.08 * progress})`;
          ctx.fill();
        });
        ctx.strokeStyle = `rgba(245, 230, 200, ${0.35 * progress})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        pts.forEach((p, i) => {
          if (i / pts.length > progress) return;
          const x = p.x * w;
          const y = p.y * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      if (progress < 1) requestAnimationFrame(draw);
    };
    draw();
  }, [active, phase]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#050509]">
      {phase >= 1 && phase < 4 && (
        <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
      )}

      {phase >= 3 && phase < 5 && (
        <h1 className="relative z-10 text-5xl sm:text-7xl font-light tracking-[0.2em] text-[#f5e6c8]" style={{ animation: "fadeScale 1.5s ease-out forwards", textShadow: "0 0 30px rgba(232,200,122,0.5)" }}>
          ESHA
        </h1>
      )}

      {phase >= 4 && <Fireworks active intensity={1.2} />}

      {phase >= 4 && (
        <div className="relative z-20 text-center px-6 space-y-6 max-w-md">
          <h2 className="text-3xl sm:text-4xl font-light text-[#fff8f0]" style={{ animation: "fadeScale 1s ease-out 0.3s both" }}>
            HAPPY BIRTHDAY, {SITE_CONFIG.person.name} ❤️
          </h2>
          {phase >= 5 && (
            <p className="text-base sm:text-lg text-[#c9b8e8]/90 font-light leading-relaxed" style={{ animation: "fadeUp 1s ease-out both" }}>
              May this year give you countless reasons to smile, beautiful memories to keep, and dreams that come true.
            </p>
          )}
          {phase >= 5 && (
            <p className="text-[#e8c87a] text-lg font-light" style={{ animation: "fadeUp 1s ease-out 0.4s both" }}>
              Have the happiest birthday, Esha. ✨
            </p>
          )}
        </div>
      )}

      {phase >= 6 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-5 py-4 rounded-xl border border-[#e8c87a]/20 bg-[#0a0f1c]/70 backdrop-blur-md text-center" style={{ animation: "fadeUp 1s ease-out both" }}>
          <p className="text-[#f5e6c8] text-sm tracking-wide">{SITE_CONFIG.person.name}</p>
          <p className="text-xs text-[#c9b8e8]/80 mt-1">🎂 {SITE_CONFIG.person.dobBS}</p>
          <p className="text-xs text-[#c9b8e8]/70 mt-0.5">📍 {SITE_CONFIG.person.home} · 🎓 {SITE_CONFIG.person.studying}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
