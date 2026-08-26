"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onBlownOut: () => void;
}

const CANDLE_COUNT = 5;

interface WindParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  life: number;
}

export default function BirthdayCake({ onBlownOut }: Props) {
  const [visible, setVisible] = useState(false);
  const [lit, setLit] = useState(true);
  const [blowing, setBlowing] = useState(false);
  const [extinguished, setExtinguished] = useState<boolean[]>(
    Array(CANDLE_COUNT).fill(false)
  );
  const [smoke, setSmoke] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [windParticles, setWindParticles] = useState<WindParticle[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const windId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // animate wind particles while blowing
  useEffect(() => {
    if (!blowing) return;
    let frame = 0;
    const tick = () => {
      frame += 1;
      setWindParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + (Math.random() - 0.5) * 1.2,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );
      // keep spawning soft wind streaks for ~1.2s
      if (frame < 40) {
        setWindParticles((prev) => [
          ...prev,
          ...Array.from({ length: 3 }, () => ({
            id: windId.current++,
            x: 20 + Math.random() * 40,
            y: 30 + Math.random() * 50,
            vx: 4 + Math.random() * 6,
            life: 18 + Math.floor(Math.random() * 12),
          })),
        ]);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [blowing]);

  const extinguishAll = useCallback(() => {
    if (!lit || blowing) return;
    setBlowing(true);
    audio.playSfx("blow");

    // candles lean in the wind then go out one by one (left → right)
    let i = 0;
    const step = () => {
      if (i >= CANDLE_COUNT) {
        setLit(false);
        setSmoke(true);
        setTimeout(() => onBlownOut(), 2000);
        return;
      }
      setExtinguished((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      i += 1;
      setTimeout(step, 220);
    };
    // short wind delay before first candle dies
    setTimeout(step, 280);
  }, [lit, blowing, onBlownOut]);

  useEffect(() => {
    let mounted = true;
    const setupMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        setMicActive(true);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const check = () => {
          if (!mounted || !lit) return;
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          if (avg > 55) {
            extinguishAll();
            return;
          }
          rafRef.current = requestAnimationFrame(check);
        };
        rafRef.current = requestAnimationFrame(check);
      } catch {
        // mic denied — tap still works
      }
    };
    const t = setTimeout(setupMic, 2500);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearTimeout(t);
    };
  }, [lit, extinguishAll]);

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center mb-8 space-y-2">
        <p className="text-xl sm:text-2xl text-[#f5e6c8] font-light">
          Make a wish, Esha. ✨
        </p>
        <p className="text-sm text-[#c9b8e8]/70">Whenever you&apos;re ready...</p>
      </div>

      <div className="relative select-none" style={{ width: 240, height: 220 }}>
        {/* wind particles overlay */}
        {blowing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {windParticles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full bg-white/25"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: 3 + (p.life % 4),
                  height: 1.5,
                  opacity: Math.min(1, p.life / 20),
                  transform: "scaleX(2)",
                  boxShadow: "0 0 6px rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        )}

        {/* plate */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-3 rounded-full bg-gradient-to-b from-[#3a3a45] to-[#1a1a22]"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
        />

        {/* bottom tier */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 h-[70px] rounded-t-lg"
          style={{
            background:
              "linear-gradient(180deg, #f8e8d0 0%, #e8c9a0 40%, #d4a574 100%)",
            boxShadow:
              "inset 0 -8px 16px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div className="absolute -top-2 left-0 right-0 h-4 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-5 h-5 rounded-full bg-[#fff8f0]"
                style={{ left: `${i * 12.5 + 2}%`, opacity: 0.95 }}
              />
            ))}
          </div>
        </div>

        {/* top tier */}
        <div
          className="absolute bottom-[78px] left-1/2 -translate-x-1/2 w-32 h-14 rounded-t-md"
          style={{
            background:
              "linear-gradient(180deg, #fff0e0 0%, #f0d4b0 50%, #e0b888 100%)",
            boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.12)",
          }}
        >
          <div className="absolute -top-1.5 left-0 right-0 h-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-4 h-4 rounded-full bg-[#fff8f0]"
                style={{ left: `${i * 18 + 6}%` }}
              />
            ))}
          </div>
        </div>

        {/* candles */}
        <div className="absolute bottom-[128px] left-1/2 -translate-x-1/2 flex gap-3.5">
          {[...Array(CANDLE_COUNT)].map((_, i) => {
            const isOut = extinguished[i];
            const isLeaning = blowing && !isOut;
            return (
              <div key={i} className="relative flex flex-col items-center">
                {/* flame */}
                {!isOut && lit && (
                  <div
                    className={`relative -mb-0.5 transition-transform duration-300 ${
                      isLeaning ? "flame-wind" : ""
                    }`}
                    style={{
                      transformOrigin: "bottom center",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    <div
                      className="w-3 h-5 rounded-full origin-bottom candle-flame"
                      style={{
                        background:
                          "radial-gradient(ellipse at center bottom, #fff8e0 0%, #ffcc66 28%, #ff8844 65%, transparent 100%)",
                        animationDelay: `${i * 0.12}s`,
                        filter: "blur(0.2px)",
                      }}
                    />
                    <div
                      className="absolute inset-0 w-5 h-6 -left-1 rounded-full candle-glow"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,180,80,0.55) 0%, transparent 70%)",
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  </div>
                )}

                {/* smoke after extinguish */}
                {isOut && smoke && (
                  <div className="relative h-8 w-4 -mb-1 flex justify-center">
                    <div
                      className="smoke-puff"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                    <div
                      className="smoke-puff smoke-puff-2"
                      style={{ animationDelay: `${i * 0.12 + 0.25}s` }}
                    />
                  </div>
                )}

                {/* wick spark die */}
                {isOut && !smoke && (
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#ffaa44] ember"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  />
                )}

                {/* candle body */}
                <div
                  className="w-2.5 h-8 rounded-sm"
                  style={{
                    background:
                      i % 2 === 0
                        ? "linear-gradient(90deg, #f0e0c0, #e8d4a8, #f0e0c0)"
                        : "linear-gradient(90deg, #e8c0d0, #d8a8b8, #e8c0d0)",
                    boxShadow: "1px 0 2px rgba(0,0,0,0.25)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {lit && !blowing && (
        <div className="mt-10 space-y-3 text-center">
          <button
            onClick={extinguishAll}
            className="px-7 py-3.5 rounded-full border border-[#e8c87a]/50 text-[#f5e6c8] text-sm tracking-wide hover:bg-[#e8c87a]/10 hover:shadow-[0_0_24px_rgba(232,200,122,0.2)] transition-all active:scale-95"
          >
            🌬️ Blow out the candles
          </button>
          {micActive && (
            <p className="text-xs text-[#c9b8e8]/60">
              or blow toward your microphone
            </p>
          )}
        </div>
      )}

      {blowing && lit && (
        <p className="mt-8 text-sm text-[#c9b8e8]/70 animate-pulse">
          Make a wish...
        </p>
      )}

      <style jsx>{`
        .candle-flame {
          animation: flicker 0.35s ease-in-out infinite alternate;
        }
        .candle-glow {
          animation: glowPulse 1.1s ease-in-out infinite alternate;
        }
        .flame-wind {
          animation: windLean 0.18s ease-in-out infinite alternate;
        }
        @keyframes flicker {
          0% {
            transform: scaleY(1) scaleX(1) rotate(-2deg);
            opacity: 0.92;
          }
          100% {
            transform: scaleY(1.18) scaleX(0.88) rotate(3deg);
            opacity: 1;
          }
        }
        @keyframes glowPulse {
          0% {
            opacity: 0.28;
            transform: scale(1);
          }
          100% {
            opacity: 0.55;
            transform: scale(1.25);
          }
        }
        @keyframes windLean {
          0% {
            transform: rotate(12deg) scaleY(0.85) scaleX(1.15) translateX(2px);
            opacity: 0.7;
          }
          100% {
            transform: rotate(22deg) scaleY(0.7) scaleX(1.3) translateX(4px);
            opacity: 0.45;
          }
        }
        .smoke-puff {
          position: absolute;
          bottom: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(190, 190, 200, 0.45);
          animation: smokeUp 1.6s ease-out forwards;
        }
        .smoke-puff-2 {
          width: 6px;
          height: 6px;
          left: 4px;
        }
        @keyframes smokeUp {
          0% {
            opacity: 0.55;
            transform: translateY(0) scale(0.6);
          }
          100% {
            opacity: 0;
            transform: translateY(-36px) scale(2.2) translateX(6px);
          }
        }
        .ember {
          animation: emberDie 0.4s ease-out forwards;
        }
        @keyframes emberDie {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}
