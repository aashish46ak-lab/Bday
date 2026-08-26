"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  twinkle: number;
  speed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface StarfieldProps {
  density?: number;
  shooting?: boolean;
  className?: string;
}

export default function Starfield({
  density = 1,
  shooting = true,
  className = "",
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootsRef = useRef<ShootingStar[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const initStars = () => {
      const count = Math.floor(
        (window.innerWidth * window.innerHeight) / 3500 * density
      );
      starsRef.current = Array.from({ length: Math.min(count, 900) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random(),
        size: Math.random() * 1.8 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.008,
      }));
    };

    const spawnShoot = () => {
      if (!shooting || reduced.current) return;
      if (Math.random() > 0.015) return;
      shootsRef.current.push({
        x: Math.random() * window.innerWidth * 0.8,
        y: Math.random() * window.innerHeight * 0.4,
        vx: 4 + Math.random() * 6,
        vy: 2 + Math.random() * 3,
        life: 0,
        maxLife: 40 + Math.random() * 40,
      });
    };

    let last = performance.now();
    const draw = (t: number) => {
      const dt = Math.min((t - last) / 16, 3);
      last = t;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.8);
      grad.addColorStop(0, "rgba(20, 30, 60, 0.15)");
      grad.addColorStop(1, "rgba(5, 5, 9, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      starsRef.current.forEach((s) => {
        s.twinkle += s.speed * dt;
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.twinkle));
        const r = s.size * (0.7 + s.z * 0.6);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 240, ${alpha * (0.4 + s.z * 0.6)})`;
        ctx.fill();
        if (s.z > 0.7 && !reduced.current) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 200, 122, ${alpha * 0.08})`;
          ctx.fill();
        }
      });

      spawnShoot();
      shootsRef.current = shootsRef.current.filter((sh) => {
        sh.life += dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        const progress = sh.life / sh.maxLife;
        if (progress >= 1) return false;
        const alpha = 1 - progress;
        ctx.strokeStyle = `rgba(255, 248, 230, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 4, sh.y - sh.vy * 4);
        ctx.stroke();
        ctx.strokeStyle = `rgba(232, 200, 122, ${alpha * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 2, sh.y - sh.vy * 2);
        ctx.stroke();
        return true;
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
  }, [density, shooting]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      aria-hidden
    />
  );
}
