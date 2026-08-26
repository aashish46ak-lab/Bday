"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onBlownOut: () => void;
}

const CANDLE_COUNT = 5;
/** Need sustained blow — not a single noise spike */
const BLOW_THRESHOLD = 52;
const BLOW_FRAMES_NEEDED = 14; // ~230ms continuous blow at 60fps

interface WindParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  life: number;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  color: string;
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
  const [micState, setMicState] = useState<"loading" | "on" | "denied">("loading");
  const [windParticles, setWindParticles] = useState<WindParticle[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [listeningPulse, setListeningPulse] = useState(0);
  const [blowProgress, setBlowProgress] = useState(0);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const windId = useRef(0);
  const confettiId = useRef(0);
  const blownRef = useRef(false);
  const blowStreak = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 280);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!blowing) return;
    let frame = 0;
    let localRaf = 0;
    const tick = () => {
      frame += 1;
      setWindParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + (Math.random() - 0.5) * 1.4,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );
      if (frame < 55) {
        setWindParticles((prev) => [
          ...prev,
          ...Array.from({ length: 5 }, () => ({
            id: windId.current++,
            x: 8 + Math.random() * 30,
            y: 22 + Math.random() * 55,
            vx: 5.5 + Math.random() * 8,
            life: 16 + Math.floor(Math.random() * 14),
          })),
        ]);
      }
      localRaf = requestAnimationFrame(tick);
    };
    localRaf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(localRaf);
  }, [blowing]);

  useEffect(() => {
    if (!smoke) return;
    const colors = ["#e8c87a", "#e8b4c8", "#c9b8e8", "#f5e6c8", "#fff8f0", "#ff9f7a"];
    setConfetti(
      Array.from({ length: 56 }, () => ({
        id: confettiId.current++,
        x: 38 + Math.random() * 24,
        y: 32 + Math.random() * 12,
        vx: (Math.random() - 0.5) * 4,
        vy: -2.2 - Math.random() * 3.2,
        rot: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 55 + Math.random() * 45,
      }))
    );
    let frame = 0;
    const tick = () => {
      frame += 1;
      setConfetti((prev) =>
        prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            vy: c.vy + 0.09,
            rot: c.rot + 7,
            life: c.life - 1,
          }))
          .filter((c) => c.life > 0)
      );
      if (frame < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [smoke]);

  const extinguishAll = useCallback(() => {
    if (!lit || blowing || blownRef.current) return;
    blownRef.current = true;
    setBlowing(true);
    setBlowProgress(1);
    audio.playSfx("blow");

    let i = 0;
    const step = () => {
      if (i >= CANDLE_COUNT) {
        setLit(false);
        setSmoke(true);
        setTimeout(() => onBlownOut(), 2300);
        return;
      }
      setExtinguished((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      i += 1;
      setTimeout(step, 210);
    };
    setTimeout(step, 350);
  }, [lit, blowing, onBlownOut]);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicState("on");
      blowStreak.current = 0;

      const data = new Uint8Array(analyser.frequencyBinCount);

      const check = () => {
        if (blownRef.current) return;
        analyser.getByteFrequencyData(data);

        // focus mid-high bins (breath energy), ignore very low rumble
        let sum = 0;
        let count = 0;
        const start = Math.floor(data.length * 0.08);
        const end = Math.floor(data.length * 0.55);
        for (let i = start; i < end; i++) {
          sum += data[i];
          count += 1;
        }
        const avg = count ? sum / count : 0;
        setListeningPulse(Math.min(1, avg / 90));

        if (avg >= BLOW_THRESHOLD) {
          blowStreak.current += 1;
          setBlowProgress(
            Math.min(1, blowStreak.current / BLOW_FRAMES_NEEDED)
          );
          if (blowStreak.current >= BLOW_FRAMES_NEEDED) {
            extinguishAll();
            return;
          }
        } else {
          // require continuous blow — reset if user stops
          blowStreak.current = Math.max(0, blowStreak.current - 2);
          setBlowProgress(
            Math.min(1, blowStreak.current / BLOW_FRAMES_NEEDED)
          );
        }

        rafRef.current = requestAnimationFrame(check);
      };
      rafRef.current = requestAnimationFrame(check);
    } catch {
      setMicState("denied");
    }
  }, [extinguishAll]);

  useEffect(() => {
    const t = setTimeout(() => startMic(), 1000);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [startMic]);

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center mb-5 space-y-2">
        <p className="text-xl sm:text-2xl text-[#f5e6c8] font-light">
          Make a wish, Esha ✨
        </p>
        <p className="text-sm text-[#c9b8e8]/70">Blow to put out the candles</p>
      </div>

      <div className="relative select-none" style={{ width: 280, height: 260 }}>
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-10 rounded-full blur-xl opacity-50"
          style={{
            background:
              "radial-gradient(ellipse, rgba(232,200,122,0.35) 0%, transparent 70%)",
          }}
        />

        {blowing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {windParticles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: 4 + (p.life % 5),
                  height: 2,
                  opacity: Math.min(0.9, p.life / 18),
                  background: "rgba(255,255,255,0.4)",
                  boxShadow: "0 0 8px rgba(255,255,255,0.45)",
                  transform: "scaleX(2.2)",
                }}
              />
            ))}
          </div>
        )}

        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute z-40 pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: 6,
              height: 4,
              background: c.color,
              opacity: Math.min(1, c.life / 30),
              transform: `rotate(${c.rot}deg)`,
              borderRadius: 1,
            }}
          />
        ))}

        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-60 h-5 rounded-[50%]"
          style={{
            background:
              "linear-gradient(180deg, #5a5a68 0%, #2a2a35 45%, #1a1a22 100%)",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        />

        <div
          className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-48 h-[78px] rounded-t-[18px]"
          style={{
            background:
              "linear-gradient(90deg, #c9a06a 0%, #f5e0c0 18%, #fff0d8 35%, #f0d4a8 55%, #d4a878 78%, #b88850 100%)",
            boxShadow:
              "inset 0 -14px 24px rgba(0,0,0,0.22), inset 0 4px 8px rgba(255,255,255,0.25), 0 8px 20px rgba(0,0,0,0.35)",
          }}
        >
          <div className="absolute -top-3 left-0 right-0 h-6 flex justify-around px-1">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #fffaf0, #f0e0c8)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  marginTop: i % 2 === 0 ? 0 : 3,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-[82px] left-1/2 -translate-x-1/2 w-32 h-[58px] rounded-t-[14px]"
          style={{
            background:
              "linear-gradient(90deg, #c89868 0%, #f8e8d0 22%, #fff5e8 40%, #f0d8b0 60%, #d4a878 85%, #b88850 100%)",
            boxShadow:
              "inset 0 -10px 18px rgba(0,0,0,0.18), inset 0 3px 6px rgba(255,255,255,0.3), 0 6px 14px rgba(0,0,0,0.28)",
          }}
        >
          <div className="absolute -top-2.5 left-0 right-0 h-5 flex justify-around px-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #fffaf0, #f0e0c8)",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-[136px] left-1/2 -translate-x-1/2 flex gap-4">
          {[...Array(CANDLE_COUNT)].map((_, i) => {
            const isOut = extinguished[i];
            const isLeaning = blowing && !isOut;
            return (
              <div key={i} className="relative flex flex-col items-center">
                {!isOut && lit && (
                  <div
                    className={`relative -mb-0.5 ${isLeaning ? "flame-wind" : ""}`}
                    style={{ transformOrigin: "bottom center" }}
                  >
                    <div
                      className="absolute -inset-3 rounded-full candle-glow"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,180,60,0.45) 0%, transparent 70%)",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                    <div
                      className="w-3.5 h-6 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] candle-flame relative z-10"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 80%, #fffef5 0%, #ffe08a 25%, #ff9a3c 55%, #ff5a1a 85%, transparent 100%)",
                        animationDelay: `${i * 0.11}s`,
                        boxShadow: "0 0 10px rgba(255,160,50,0.7)",
                      }}
                    />
                  </div>
                )}

                {isOut && smoke && (
                  <div className="relative h-10 w-5 -mb-1 flex justify-center">
                    <div className="smoke-puff" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div
                      className="smoke-puff smoke-puff-2"
                      style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                    />
                  </div>
                )}

                <div
                  className="w-3 h-9 rounded-sm relative overflow-hidden"
                  style={{
                    background:
                      i % 2 === 0
                        ? "linear-gradient(90deg, #c8b090 0%, #f5ecd8 35%, #e8dcc0 65%, #b8a080 100%)"
                        : "linear-gradient(90deg, #c090a0 0%, #f0d0dc 35%, #e0b8c8 65%, #b08090 100%)",
                    boxShadow:
                      "2px 0 3px rgba(0,0,0,0.2), inset 1px 0 0 rgba(255,255,255,0.35)",
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1.5 bg-[#2a2a2a]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {lit && !blowing && (
        <div className="mt-8 text-center space-y-3 max-w-xs">
          {micState === "loading" && (
            <p className="text-sm text-[#c9b8e8]/70 animate-pulse">
              Preparing microphone…
            </p>
          )}
          {micState === "on" && (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-full border-2 border-[#e8c87a]/40 flex items-center justify-center relative"
                style={{
                  boxShadow: `0 0 ${12 + listeningPulse * 40}px rgba(232,200,122,${
                    0.15 + listeningPulse * 0.5
                  })`,
                }}
              >
                <span className="text-2xl">🌬️</span>
              </div>
              {/* sustained blow progress */}
              <div className="w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e8c87a] to-[#e8b4c8] transition-[width] duration-75"
                  style={{ width: `${blowProgress * 100}%` }}
                />
              </div>
              <p className="text-sm text-[#f5e6c8]">Keep blowing…</p>
              <p className="text-xs text-[#c9b8e8]/55">
                A real continuous blow — not a short puff
              </p>
            </div>
          )}
          {micState === "denied" && (
            <div className="space-y-3">
              <p className="text-sm text-[#c9b8e8]/80">
                Microphone needed to blow out the candles
              </p>
              <button
                onClick={startMic}
                className="px-5 py-2.5 rounded-full border border-[#e8c87a]/45 text-[#f5e6c8] text-sm hover:bg-[#e8c87a]/10 transition-all"
              >
                Enable microphone
              </button>
            </div>
          )}
        </div>
      )}

      {blowing && lit && (
        <p className="mt-8 text-sm text-[#c9b8e8]/75 animate-pulse">
          Make a wish…
        </p>
      )}

      <style jsx>{`
        .candle-flame {
          animation: flicker 0.32s ease-in-out infinite alternate;
        }
        .candle-glow {
          animation: glowPulse 1s ease-in-out infinite alternate;
        }
        .flame-wind {
          animation: windLean 0.16s ease-in-out infinite alternate;
        }
        @keyframes flicker {
          0% { transform: scaleY(1) scaleX(1) rotate(-3deg); opacity: 0.9; }
          100% { transform: scaleY(1.2) scaleX(0.85) rotate(4deg); opacity: 1; }
        }
        @keyframes glowPulse {
          0% { opacity: 0.35; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.3); }
        }
        @keyframes windLean {
          0% { transform: rotate(14deg) scaleY(0.82) scaleX(1.2) translateX(3px); opacity: 0.65; }
          100% { transform: rotate(26deg) scaleY(0.65) scaleX(1.35) translateX(6px); opacity: 0.35; }
        }
        .smoke-puff {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(200, 200, 210, 0.5);
          animation: smokeUp 1.7s ease-out forwards;
        }
        .smoke-puff-2 {
          width: 7px;
          height: 7px;
          left: 5px;
        }
        @keyframes smokeUp {
          0% { opacity: 0.6; transform: translateY(0) scale(0.5); }
          100% { opacity: 0; transform: translateY(-42px) scale(2.4) translateX(8px); }
        }
      `}</style>
    </div>
  );
}
