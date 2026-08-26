"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onBlownOut: () => void;
}

const CANDLE_COUNT = 5;
const BLOW_THRESHOLD = 52;
const BLOW_FRAMES_NEEDED = 14;

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
    const t = setTimeout(() => setVisible(true), 200);
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
            y: p.y + (Math.random() - 0.5) * 1.2,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );
      if (frame < 50) {
        setWindParticles((prev) => [
          ...prev,
          ...Array.from({ length: 4 }, () => ({
            id: windId.current++,
            x: 12 + Math.random() * 28,
            y: 18 + Math.random() * 40,
            vx: 6 + Math.random() * 7,
            life: 14 + Math.floor(Math.random() * 12),
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
      Array.from({ length: 50 }, () => ({
        id: confettiId.current++,
        x: 40 + Math.random() * 20,
        y: 28 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -2 - Math.random() * 3,
        rot: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 50 + Math.random() * 40,
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
            rot: c.rot + 6,
            life: c.life - 1,
          }))
          .filter((c) => c.life > 0)
      );
      if (frame < 90) requestAnimationFrame(tick);
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
        setTimeout(() => onBlownOut(), 2200);
        return;
      }
      setExtinguished((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      i += 1;
      setTimeout(step, 200);
    };
    setTimeout(step, 300);
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
        let sum = 0;
        let count = 0;
        const start = Math.floor(data.length * 0.08);
        const end = Math.floor(data.length * 0.55);
        for (let i = start; i < end; i++) {
          sum += data[i];
          count++;
        }
        const avg = count ? sum / count : 0;
        setListeningPulse(Math.min(1, avg / 90));

        if (avg >= BLOW_THRESHOLD) {
          blowStreak.current += 1;
          setBlowProgress(Math.min(1, blowStreak.current / BLOW_FRAMES_NEEDED));
          if (blowStreak.current >= BLOW_FRAMES_NEEDED) {
            extinguishAll();
            return;
          }
        } else {
          blowStreak.current = Math.max(0, blowStreak.current - 2);
          setBlowProgress(Math.min(1, blowStreak.current / BLOW_FRAMES_NEEDED));
        }
        rafRef.current = requestAnimationFrame(check);
      };
      rafRef.current = requestAnimationFrame(check);
    } catch {
      setMicState("denied");
    }
  }, [extinguishAll]);

  useEffect(() => {
    const t = setTimeout(() => startMic(), 900);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [startMic]);

  /** Fixed candle x positions across top tier (%) */
  const candleXs = [18, 34, 50, 66, 82];

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center mb-4 space-y-1.5">
        <p className="text-xl sm:text-2xl text-[#f5e6c8] font-light">
          Make a wish, Esha ✨
        </p>
        <p className="text-sm text-[#c9b8e8]/65">Blow out the candles</p>
      </div>

      {/* ===== SOLID 3D CAKE (fixed layout, no floating candles) ===== */}
      <div
        className="relative"
        style={{ width: 260, height: 240 }}
      >
        {/* ground glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-56 h-8 rounded-full blur-2xl opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(232,200,122,0.4) 0%, transparent 70%)",
          }}
        />

        {/* wind layer */}
        {blowing && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {windParticles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: 5,
                  height: 2,
                  opacity: Math.min(0.85, p.life / 16),
                  background: "rgba(255,255,255,0.45)",
                  boxShadow: "0 0 6px rgba(255,255,255,0.4)",
                  transform: "scaleX(2)",
                }}
              />
            ))}
          </div>
        )}

        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: 6,
              height: 4,
              background: c.color,
              opacity: Math.min(1, c.life / 28),
              transform: `rotate(${c.rot}deg)`,
              borderRadius: 1,
            }}
          />
        ))}

        {/* plate */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0"
          style={{
            width: 220,
            height: 18,
            borderRadius: "50%",
            background:
              "linear-gradient(180deg, #6a6a78 0%, #3a3a48 40%, #1e1e28 100%)",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        />

        {/* bottom tier */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 12,
            width: 180,
            height: 72,
            borderRadius: "12px 12px 8px 8px",
            background:
              "linear-gradient(90deg, #a87848 0%, #e8c898 18%, #fff0d8 38%, #f0d4a0 58%, #d4a060 80%, #9a6838 100%)",
            boxShadow:
              "inset 0 -16px 28px rgba(0,0,0,0.28), inset 0 6px 10px rgba(255,255,255,0.28), 0 10px 22px rgba(0,0,0,0.4)",
          }}
        >
          {/* frosting scallops on bottom tier */}
          <div
            className="absolute left-0 right-0 flex justify-between px-1"
            style={{ top: -10 }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 35%, #fffaf2, #f0e0c8)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
                  marginTop: i % 2 === 0 ? 0 : 4,
                }}
              />
            ))}
          </div>
          {/* left shine */}
          <div
            className="absolute top-3 bottom-4 left-2 w-2.5 rounded-full opacity-40"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.7), transparent)",
            }}
          />
        </div>

        {/* top tier */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 78,
            width: 118,
            height: 52,
            borderRadius: "10px 10px 6px 6px",
            background:
              "linear-gradient(90deg, #a87848 0%, #f0d4a8 20%, #fff5e8 42%, #e8c898 62%, #c89858 85%, #9a6838 100%)",
            boxShadow:
              "inset 0 -12px 20px rgba(0,0,0,0.22), inset 0 4px 8px rgba(255,255,255,0.32), 0 6px 14px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="absolute left-0 right-0 flex justify-between px-0.5"
            style={{ top: -8 }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 35%, #fffaf2, #f0e0c8)",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>
          <div
            className="absolute top-2 bottom-3 left-1.5 w-2 rounded-full opacity-45"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.75), transparent)",
            }}
          />
        </div>

        {/* candles — planted ON top tier, not floating */}
        {candleXs.map((xPct, i) => {
          const isOut = extinguished[i];
          const isLeaning = blowing && !isOut && lit;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left: `${xPct}%`,
                bottom: 128,
                transform: "translateX(-50%)",
                width: 14,
              }}
            >
              {/* flame sits on wick */}
              {!isOut && lit && (
                <div
                  className={isLeaning ? "flame-wind" : ""}
                  style={{
                    transformOrigin: "50% 100%",
                    marginBottom: -2,
                    position: "relative",
                    height: 22,
                    width: 14,
                  }}
                >
                  <div
                    className="candle-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(255,170,50,0.5) 0%, transparent 70%)",
                      animationDelay: `${i * 0.09}s`,
                    }}
                  />
                  <div
                    className="candle-flame absolute left-1/2 bottom-0 -translate-x-1/2"
                    style={{
                      width: 10,
                      height: 18,
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background:
                        "radial-gradient(ellipse at 50% 75%, #fffef8 0%, #ffe070 30%, #ff9030 65%, #ff5010 100%)",
                      boxShadow: "0 0 8px rgba(255,150,40,0.75)",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
              )}

              {isOut && smoke && (
                <div
                  className="relative"
                  style={{ height: 28, width: 12, marginBottom: -4 }}
                >
                  <div
                    className="smoke-puff"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                </div>
              )}

              {/* candle body — fixed height, sits on cake */}
              <div
                style={{
                  width: 9,
                  height: 28,
                  borderRadius: 2,
                  background:
                    i % 2 === 0
                      ? "linear-gradient(90deg, #b89870, #f5ecd8 40%, #d8c8a0)"
                      : "linear-gradient(90deg, #b88090, #f0d0dc 40%, #d0a0b0)",
                  boxShadow:
                    "1px 0 2px rgba(0,0,0,0.25), inset 1px 0 0 rgba(255,255,255,0.4)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 2,
                    height: 5,
                    background: "#2a2a2a",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* mic UI */}
      {lit && !blowing && (
        <div className="mt-6 text-center space-y-3 max-w-xs">
          {micState === "loading" && (
            <p className="text-sm text-[#c9b8e8]/70 animate-pulse">
              Preparing microphone…
            </p>
          )}
          {micState === "on" && (
            <div className="flex flex-col items-center gap-2.5">
              <div
                className="w-14 h-14 rounded-full border-2 border-[#e8c87a]/40 flex items-center justify-center"
                style={{
                  boxShadow: `0 0 ${10 + listeningPulse * 36}px rgba(232,200,122,${
                    0.12 + listeningPulse * 0.45
                  })`,
                }}
              >
                <span className="text-xl">🌬️</span>
              </div>
              <div className="w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e8c87a] to-[#e8b4c8]"
                  style={{
                    width: `${blowProgress * 100}%`,
                    transition: "width 80ms linear",
                  }}
                />
              </div>
              <p className="text-sm text-[#f5e6c8]">Keep blowing…</p>
            </div>
          )}
          {micState === "denied" && (
            <div className="space-y-2">
              <p className="text-sm text-[#c9b8e8]/80">
                Microphone needed to blow
              </p>
              <button
                onClick={startMic}
                className="px-5 py-2 rounded-full border border-[#e8c87a]/45 text-[#f5e6c8] text-sm"
              >
                Enable microphone
              </button>
            </div>
          )}
        </div>
      )}

      {blowing && lit && (
        <p className="mt-6 text-sm text-[#c9b8e8]/75 animate-pulse">
          Make a wish…
        </p>
      )}

      <style jsx>{`
        .candle-flame {
          animation: flicker 0.3s ease-in-out infinite alternate;
        }
        .candle-glow {
          animation: glowPulse 1s ease-in-out infinite alternate;
        }
        .flame-wind {
          animation: windLean 0.15s ease-in-out infinite alternate;
        }
        @keyframes flicker {
          0% { transform: translateX(-50%) scaleY(1) scaleX(1) rotate(-2deg); }
          100% { transform: translateX(-50%) scaleY(1.15) scaleX(0.88) rotate(3deg); }
        }
        @keyframes glowPulse {
          0% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.65; transform: translate(-50%, -50%) scale(1.25); }
        }
        @keyframes windLean {
          0% { transform: rotate(12deg) scaleY(0.85) translateX(2px); opacity: 0.7; }
          100% { transform: rotate(24deg) scaleY(0.65) translateX(5px); opacity: 0.4; }
        }
        .smoke-puff {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 8px;
          height: 8px;
          margin-left: -4px;
          border-radius: 50%;
          background: rgba(200, 200, 210, 0.5);
          animation: smokeUp 1.5s ease-out forwards;
        }
        @keyframes smokeUp {
          0% { opacity: 0.55; transform: translateY(0) scale(0.6); }
          100% { opacity: 0; transform: translateY(-32px) scale(2) translateX(4px); }
        }
      `}</style>
    </div>
  );
}
