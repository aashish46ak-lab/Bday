"use client";

import { useEffect, useRef } from "react";
import { audio } from "@/lib/audio";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "spark" | "confetti" | "glow";
}

interface Props {
  active: boolean;
  intensity?: number;
}

const COLORS = ["#e8c87a", "#f5e6c8", "#e8b4c8", "#c9b8e8", "#fff8f0", "#ff9f7a", "#7ec8e3"];

export default function Fireworks({ active, intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef(0);
  const lastBurst = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const burst = (cx: number, cy: number, count: number) => {
      audio.playSfx("firework");
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 2 + Math.random() * 5 * intensity;
        particles.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0, maxLife: 50 + Math.random() * 40,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 1.5 + Math.random() * 2.5,
          type: Math.random() > 0.7 ? "confetti" : "spark",
        });
      }
      for (let i = 0; i < 8; i++) {
        particles.current.push({
          x: cx, y: cy,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0, maxLife: 30,
          color: "#fff8f0", size: 4 + Math.random() * 6, type: "glow",
        });
      }
    };

    setTimeout(() => burst(window.innerWidth * 0.3, window.innerHeight * 0.35, 60), 100);
    setTimeout(() => burst(window.innerWidth * 0.7, window.innerHeight * 0.3, 50), 400);
    setTimeout(() => burst(window.innerWidth * 0.5, window.innerHeight * 0.25, 70), 700);

    let last = performance.now();
    const draw = (t: number) => {
      const dt = Math.min((t - last) / 16, 2.5);
      last = t;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (t - lastBurst.current > 900 + Math.random() * 800) {
        lastBurst.current = t;
        burst(w * (0.2 + Math.random() * 0.6), h * (0.15 + Math.random() * 0.35), Math.floor(35 + Math.random() * 30));
      }

      particles.current = particles.current.filter((p) => {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.04 * dt;
        p.vx *= 0.99;
        if (p.life >= p.maxLife) return false;
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        if (p.type === "glow") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          g.addColorStop(0, p.color);
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "confetti") {
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.15);
          ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
          ctx.restore();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" aria-hidden />
  );
}
