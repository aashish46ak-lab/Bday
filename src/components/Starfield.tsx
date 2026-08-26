"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
  speed: number;
  color: string;
}

interface StarfieldProps {
  density?: number;
  className?: string;
}

export default function Starfield({ density = 1, className = "" }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "rgba(232,160,180,",
      "rgba(196,92,122,",
      "rgba(255,200,210,",
      "rgba(212,165,116,",
    ];

    let stars: Star[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        120,
        Math.floor((window.innerWidth * window.innerHeight) / 9000 * density)
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 0.8 + Math.random() * 1.8,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.025,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    let last = performance.now();
    const draw = (t: number) => {
      const dt = Math.min((t - last) / 16, 3);
      last = t;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      stars.forEach((s) => {
        s.twinkle += s.speed * dt;
        const a = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${a})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      aria-hidden
    />
  );
}
