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
  type: "spark" | "confetti" | "glow" | "trail";
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  trail: { x: number; y: number; life: number }[];
  exploded: boolean;
}

interface Props {
  active: boolean;
  intensity?: number;
}

const COLORS = [
  "#ff6b8a", "#ffb3c1", "#ffd166", "#fff8f0",
  "#c4b5fd", "#7ec8e3", "#ff9f7a", "#e8c87a", "#f72585",
];

export default function Fireworks({ active, intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rockets = useRef<Rocket[]>([]);
  const animRef = useRef(0);

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

    const explode = (cx: number, cy: number, count: number, baseColor?: string) => {
      audio.playSfx("firework");
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const speed = 2.2 + Math.random() * 5.5 * intensity;
        particles.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 45 + Math.random() * 50,
          color: baseColor || COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 1.8 + Math.random() * 2.8,
          type: Math.random() > 0.65 ? "confetti" : "spark",
        });
      }
      for (let i = 0; i < 10; i++) {
        particles.current.push({
          x: cx, y: cy,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 0, maxLife: 28,
          color: "#fff8f0",
          size: 5 + Math.random() * 8,
          type: "glow",
        });
      }
    };

    const launchRocket = (xFrac: number, delay = 0) => {
      setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        audio.playSfx("whoosh");
        rockets.current.push({
          x: w * xFrac + (Math.random() - 0.5) * 30,
          y: h + 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(7.5 + Math.random() * 2.5) * (0.85 + intensity * 0.15),
          targetY: h * (0.18 + Math.random() * 0.28),
          rotation: 0,
          rotSpeed: 0.12 + Math.random() * 0.18,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          trail: [],
          exploded: false,
        });
      }, delay);
    };

    launchRocket(0.25, 80);
    launchRocket(0.55, 280);
    launchRocket(0.75, 480);
    launchRocket(0.4, 720);
    launchRocket(0.65, 980);
    if (intensity > 1) {
      launchRocket(0.35, 1200);
      launchRocket(0.8, 1400);
    }

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      rockets.current = rockets.current.filter((r) => {
        if (r.exploded) return false;
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.045;
        r.rotation += r.rotSpeed;

        r.trail.push({ x: r.x, y: r.y, life: 1 });
        if (r.trail.length > 18) r.trail.shift();
        r.trail.forEach((t) => (t.life *= 0.88));

        r.trail.forEach((t, i) => {
          if (t.life < 0.05) return;
          ctx.globalAlpha = t.life * 0.7;
          ctx.fillStyle = i % 2 === 0 ? "#ffb347" : "#fff0c0";
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.5 + t.life * 2, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rotation * 0.15);
        ctx.globalAlpha = 1;
        const grd = ctx.createLinearGradient(-4, 0, 4, 0);
        grd.addColorStop(0, "#5a3a2a");
        grd.addColorStop(0.4, r.color);
        grd.addColorStop(1, "#3a2010");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.roundRect(-3.5, -14, 7, 22, 2);
        ctx.fill();
        ctx.fillStyle = "#f5f0e8";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-3.5, -12);
        ctx.lineTo(3.5, -12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(255,${160 + ((Math.random() * 60) | 0)},40,0.9)`;
        ctx.beginPath();
        ctx.moveTo(-2.5, 8);
        ctx.lineTo(0, 14 + Math.random() * 6);
        ctx.lineTo(2.5, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (r.y <= r.targetY || r.vy > -0.5) {
          r.exploded = true;
          explode(r.x, r.y, Math.floor(55 + intensity * 25), r.color);
          return false;
        }
        return true;
      });

      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.99;
        p.life += 1;
        const t = p.life / p.maxLife;
        if (t >= 1) return false;
        ctx.globalAlpha = 1 - t;
        if (p.type === "glow") {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "confetti") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.18);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
          ctx.restore();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - t * 0.3), 0, Math.PI * 2);
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
      rockets.current = [];
      particles.current = [];
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" aria-hidden />
  );
}
