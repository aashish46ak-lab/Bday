"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onBlownOut: () => void;
}

const CANDLE_COUNT = 5;
const BLOW_THRESHOLD = 50;
/** Frames of continuous blow to fully extinguish all */
const FULL_BLOW_FRAMES = 45;

interface WindParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  life: number;
}

export default function BirthdayCake({ onBlownOut }: Props) {
  const [visible, setVisible] = useState(false);
  const [extinguished, setExtinguished] = useState<boolean[]>(
    Array(CANDLE_COUNT).fill(false)
  );
  const [leaning, setLeaning] = useState(false);
  const [smokeIdx, setSmokeIdx] = useState<boolean[]>(Array(CANDLE_COUNT).fill(false));
  const [micState, setMicState] = useState<"loading" | "on" | "denied">("loading");
  const [windParticles, setWindParticles] = useState<WindParticle[]>([]);
  const [listeningPulse, setListeningPulse] = useState(0);
  const [blowProgress, setBlowProgress] = useState(0);
  const [done, setDone] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const windId = useRef(0);
  const blowStreak = useRef(0);
  const doneRef = useRef(false);
  const outCountRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  // wind particles while actively blowing
  useEffect(() => {
    if (!leaning || done) return;
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
      if (frame % 2 === 0) {
        setWindParticles((prev) => [
          ...prev.slice(-40),
          {
            id: windId.current++,
            x: 8 + Math.random() * 25,
            y: 15 + Math.random() * 45,
            vx: 5 + Math.random() * 8,
            life: 12 + Math.floor(Math.random() * 10),
          },
        ]);
      }
      localRaf = requestAnimationFrame(tick);
    };
    localRaf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(localRaf);
  }, [leaning, done]);

  const applyBlowLevel = useCallback((streak: number) => {
    if (doneRef.current) return;
    // how many candles should be out based on continuous blow
    const targetOut = Math.min(
      CANDLE_COUNT,
      Math.floor((streak / FULL_BLOW_FRAMES) * CANDLE_COUNT)
    );

    setExtinguished((prev) => {
      const next = prev.map((_, i) => i < targetOut);
      return next;
    });
    setSmokeIdx((prev) => prev.map((_, i) => i < targetOut));
    outCountRef.current = targetOut;

    if (targetOut >= CANDLE_COUNT) {
      doneRef.current = true;
      setDone(true);
      setLeaning(false);
      audio.playSfx("blow");
      setTimeout(() => onBlownOut(), 1800);
    }
  }, [onBlownOut]);

  const relightIfStopped = useCallback(() => {
    if (doneRef.current) return;
    // incomplete blow → candles come back on
    blowStreak.current = 0;
    setBlowProgress(0);
    setLeaning(false);
    setExtinguished(Array(CANDLE_COUNT).fill(false));
    setSmokeIdx(Array(CANDLE_COUNT).fill(false));
    outCountRef.current = 0;
  }, []);

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
      analyser.smoothingTimeConstant = 0.35;
      source.connect(analyser);
      setMicState("on");

      const data = new Uint8Array(analyser.frequencyBinCount);
      let quietFrames = 0;

      const check = () => {
        if (doneRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        let count = 0;
        const start = Math.floor(data.length * 0.1);
        const end = Math.floor(data.length * 0.5);
        for (let i = start; i < end; i++) {
          sum += data[i];
          count++;
        }
        const avg = count ? sum / count : 0;
        setListeningPulse(Math.min(1, avg / 85));

        if (avg >= BLOW_THRESHOLD) {
          quietFrames = 0;
          blowStreak.current += 1;
          setLeaning(true);
          setBlowProgress(Math.min(1, blowStreak.current / FULL_BLOW_FRAMES));
          applyBlowLevel(blowStreak.current);
        } else {
          quietFrames += 1;
          // stop blowing for a moment → flames lean back, then relight
          if (quietFrames > 8 && blowStreak.current > 0 && !doneRef.current) {
            // partial extinguish without finish → relight
            if (outCountRef.current < CANDLE_COUNT) {
              relightIfStopped();
            }
          } else if (quietFrames > 3) {
            setLeaning(false);
          }
        }
        rafRef.current = requestAnimationFrame(check);
      };
      rafRef.current = requestAnimationFrame(check);
    } catch {
      setMicState("denied");
    }
  }, [applyBlowLevel, relightIfStopped]);

  useEffect(() => {
    const t = setTimeout(() => startMic(), 800);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [startMic]);

  // candles near edges of top tier
  const candleXs = [12, 31, 50, 69, 88];

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center mb-3 space-y-1">
        <p className="text-xl sm:text-2xl text-[#c45c7a] font-light">
          Make a wish, Esha ✨
        </p>
        <p className="text-sm text-[#8b6b78]">Blow from the front — keep going</p>
      </div>

      <div className="relative" style={{ width: 270, height: 250 }}>
        {/* soft shadow under cake */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-1 w-52 h-6 rounded-full blur-md opacity-30"
          style={{ background: "#c45c7a" }}
        />

        {/* wind from front-left */}
        {leaning && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {windParticles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: 6,
                  height: 2,
                  opacity: Math.min(0.7, p.life / 14),
                  background: "rgba(196,92,122,0.35)",
                  transform: "scaleX(2.5)",
                }}
              />
            ))}
          </div>
        )}

        {/* plate */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0"
          style={{
            width: 230,
            height: 20,
            borderRadius: "50%",
            background:
              "linear-gradient(180deg, #f0e4d8 0%, #e0d0c0 50%, #d0c0b0 100%)",
            boxShadow:
              "0 6px 18px rgba(90,53,69,0.2), inset 0 2px 4px rgba(255,255,255,0.8)",
          }}
        />

        {/* bottom tier 3D */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 14,
            width: 188,
            height: 78,
            borderRadius: "14px 14px 10px 10px",
            background:
              "linear-gradient(90deg, #e8a878 0%, #ffe8c8 22%, #fff5e8 45%, #ffd8b0 70%, #e8a878 100%)",
            boxShadow:
              "inset 0 -18px 30px rgba(180,100,60,0.25), inset 0 8px 12px rgba(255,255,255,0.5), 0 10px 24px rgba(90,53,69,0.18)",
          }}
        >
          <div className="absolute left-0 right-0 flex justify-between px-1" style={{ top: -11 }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 30%, #fff, #ffe4ec)",
                  boxShadow: "0 2px 5px rgba(196,92,122,0.2)",
                  marginTop: i % 2 === 0 ? 0 : 5,
                }}
              />
            ))}
          </div>
          <div
            className="absolute top-4 bottom-5 left-2.5 w-3 rounded-full opacity-50"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.9), transparent)",
            }}
          />
        </div>

        {/* top tier */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 86,
            width: 124,
            height: 56,
            borderRadius: "12px 12px 8px 8px",
            background:
              "linear-gradient(90deg, #e898b0 0%, #ffd0e0 25%, #fff0f5 48%, #ffd0e0 72%, #e898b0 100%)",
            boxShadow:
              "inset 0 -14px 22px rgba(180,80,100,0.2), inset 0 6px 10px rgba(255,255,255,0.55), 0 8px 16px rgba(90,53,69,0.15)",
          }}
        >
          <div className="absolute left-0 right-0 flex justify-between px-0.5" style={{ top: -9 }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 30%, #fff, #ffe4ec)",
                  boxShadow: "0 2px 4px rgba(196,92,122,0.18)",
                }}
              />
            ))}
          </div>
        </div>

        {/* candles on edges of top tier */}
        {candleXs.map((xPct, i) => {
          const isOut = extinguished[i];
          const showSmoke = smokeIdx[i];
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(50% - 62px + ${(xPct / 100) * 124}px)`,
                bottom: 140,
                width: 16,
                transform: "translateX(-50%)",
              }}
            >
              {!isOut && (
                <div
                  className={leaning ? "flame-wind" : ""}
                  style={{
                    transformOrigin: "50% 100%",
                    position: "relative",
                    height: 24,
                    width: 16,
                    marginBottom: -3,
                  }}
                >
                  <div
                    className="candle-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(255,160,60,0.55) 0%, transparent 70%)",
                    }}
                  />
                  <div
                    className="candle-flame absolute left-1/2 bottom-0 -translate-x-1/2"
                    style={{
                      width: 11,
                      height: 20,
                      borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
                      background:
                        "radial-gradient(ellipse at 50% 75%, #fffef8 0%, #ffe070 28%, #ff9030 60%, #ff5010 100%)",
                      boxShadow: "0 0 10px rgba(255,140,40,0.8)",
                    }}
                  />
                </div>
              )}

              {isOut && showSmoke && (
                <div style={{ height: 24, width: 12, position: "relative", marginBottom: -2 }}>
                  <div className="smoke-puff" />
                </div>
              )}

              <div
                style={{
                  width: 10,
                  height: 30,
                  borderRadius: 3,
                  background:
                    i % 2 === 0
                      ? "linear-gradient(90deg, #e8b890, #fff5e8 40%, #e0c0a0)"
                      : "linear-gradient(90deg, #e8a0b8, #ffe0ec 40%, #e090a8)",
                  boxShadow:
                    "2px 0 3px rgba(90,53,69,0.15), inset 1px 0 0 rgba(255,255,255,0.6)",
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
                    background: "#4a3040",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!done && (
        <div className="mt-5 text-center space-y-2.5 max-w-xs">
          {micState === "loading" && (
            <p className="text-sm text-[#8b6b78] animate-pulse">Preparing mic…</p>
          )}
          {micState === "on" && (
            <>
              <div
                className="mx-auto w-14 h-14 rounded-full border-2 border-[#e8a0b4] flex items-center justify-center"
                style={{
                  boxShadow: `0 0 ${8 + listeningPulse * 32}px rgba(196,92,122,${
                    0.2 + listeningPulse * 0.4
                  })`,
                  background: "rgba(255,255,255,0.6)",
                }}
              >
                <span className="text-xl">🌬️</span>
              </div>
              <div className="w-40 h-1.5 mx-auto rounded-full bg-[#f5d0dc] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e8a0b4] to-[#c45c7a]"
                  style={{
                    width: `${blowProgress * 100}%`,
                    transition: "width 70ms linear",
                  }}
                />
              </div>
              <p className="text-sm text-[#5a3545]">
                {blowProgress > 0.05
                  ? blowProgress < 1
                    ? "Keep blowing…"
                    : "Yes!"
                  : "Blow toward the mic"}
              </p>
              <p className="text-xs text-[#8b6b78]">
                Stop early and the candles light again
              </p>
            </>
          )}
          {micState === "denied" && (
            <button
              onClick={startMic}
              className="px-5 py-2 rounded-full border border-[#e8a0b4] text-[#c45c7a] text-sm bg-white/70"
            >
              Enable microphone
            </button>
          )}
        </div>
      )}

      {done && (
        <p className="mt-5 text-sm text-[#c45c7a] animate-pulse">Wish granted ✨</p>
      )}

      <style jsx>{`
        .candle-flame {
          animation: flicker 0.28s ease-in-out infinite alternate;
        }
        .candle-glow {
          animation: glowPulse 0.9s ease-in-out infinite alternate;
        }
        .flame-wind {
          animation: windLean 0.14s ease-in-out infinite alternate;
        }
        @keyframes flicker {
          0% { transform: translateX(-50%) scaleY(1) rotate(-2deg); }
          100% { transform: translateX(-50%) scaleY(1.12) scaleX(0.9) rotate(3deg); }
        }
        @keyframes glowPulse {
          0% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes windLean {
          0% { transform: rotate(10deg) scaleY(0.88) translateX(2px); }
          100% { transform: rotate(22deg) scaleY(0.68) translateX(5px); opacity: 0.55; }
        }
        .smoke-puff {
          position: absolute;
          bottom: 0;
          left: 50%;
          margin-left: -4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(160, 140, 150, 0.45);
          animation: smokeUp 1.4s ease-out forwards;
        }
        @keyframes smokeUp {
          0% { opacity: 0.5; transform: translateY(0) scale(0.5); }
          100% { opacity: 0; transform: translateY(-28px) scale(2) translateX(5px); }
        }
      `}</style>
    </div>
  );
}
