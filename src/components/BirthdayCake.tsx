"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onDone: () => void;
  onBack?: () => void;
}

const CANDLES = 3;
const THRESHOLD = 28;
const FULL = 42;
const QUIET_DECAY = 12;

export default function BirthdayCake({ onDone, onBack }: Props) {
  const [extinguished, setExt] = useState<boolean[]>(Array(CANDLES).fill(false));
  const [leaning, setLeaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [smoke, setSmoke] = useState(false);
  const [mic, setMic] = useState<"off" | "on" | "denied">("off");
  const [holding, setHolding] = useState(false);

  const streak = useRef(0);
  const doneRef = useRef(false);
  const raf = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const holdRaf = useRef(0);

  const apply = useCallback(
    (s: number) => {
      if (doneRef.current) return;
      const n = Math.min(CANDLES, Math.floor((s / FULL) * CANDLES));
      setExt(Array.from({ length: CANDLES }, (_, i) => i < n));
      setProgress(Math.min(1, s / FULL));

      if (n >= CANDLES) {
        doneRef.current = true;
        setDone(true);
        setLeaning(false);
        setHolding(false);
        setSmoke(true);
        audio.playSfx("blow");
        setTimeout(() => onDone(), 2200);
      }
    },
    [onDone]
  );

  const softDecay = useCallback(() => {
    if (doneRef.current) return;
    streak.current = Math.max(0, streak.current - 2);
    setProgress(Math.min(1, streak.current / FULL));
    const n = Math.min(CANDLES, Math.floor((streak.current / FULL) * CANDLES));
    setExt(Array.from({ length: CANDLES }, (_, i) => i < n));
    if (streak.current <= 0) setLeaning(false);
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.25;
      src.connect(an);
      setMic("on");
      const data = new Uint8Array(an.frequencyBinCount);
      let quiet = 0;

      const tick = () => {
        if (doneRef.current) return;
        an.getByteFrequencyData(data);
        let sum = 0;
        let c = 0;
        const start = Math.floor(data.length * 0.05);
        const end = Math.floor(data.length * 0.55);
        for (let i = start; i < end; i++) {
          sum += data[i];
          c++;
        }
        const avg = c ? sum / c : 0;

        if (avg >= THRESHOLD) {
          quiet = 0;
          const boost = avg > 55 ? 2 : 1;
          streak.current = Math.min(FULL, streak.current + boost);
          setLeaning(true);
          apply(streak.current);
        } else {
          quiet += 1;
          if (quiet > QUIET_DECAY) softDecay();
          else if (quiet > 4) setLeaning(false);
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      setMic("denied");
    }
  }, [apply, softDecay]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(holdRaf.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  const blowOnce = () => {
    if (doneRef.current) return;
    streak.current = Math.min(FULL, streak.current + 10);
    setLeaning(true);
    apply(streak.current);
    setTimeout(() => {
      if (!doneRef.current) setLeaning(false);
    }, 280);
  };

  const startHold = () => {
    if (doneRef.current) return;
    setHolding(true);
    setLeaning(true);
    const step = () => {
      if (doneRef.current) return;
      streak.current = Math.min(FULL, streak.current + 1.4);
      apply(streak.current);
      if (streak.current < FULL) {
        holdRaf.current = requestAnimationFrame(step);
      }
    };
    holdRaf.current = requestAnimationFrame(step);
  };

  const endHold = () => {
    setHolding(false);
    cancelAnimationFrame(holdRaf.current);
    if (!doneRef.current) setLeaning(false);
  };

  const xs = [28, 50, 72];

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-5 left-4 z-30 text-xs text-[#8a6870] px-3 py-1.5 rounded-full bg-white/70 border border-[#e8a0b0]/40 active:scale-95"
        >
          ← Back
        </button>
      )}

      <div
        className="paper-card w-full max-w-[340px] rounded-2xl p-6 text-center"
        style={{ animation: "cardIn 0.5s ease-out both" }}
      >
        <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-1">
          Birthday cake for you
        </p>
        <h2 className="text-xl text-[#4a3038] mb-5" style={{ fontFamily: "Georgia, serif" }}>
          Make a wish, Esha ✨
        </h2>

        <div className="relative mx-auto select-none" style={{ width: 220, height: 190 }}>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-48 h-4 rounded-full opacity-20 blur-sm bg-[#c45c6a]" />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-44 h-3 rounded-full"
            style={{ background: "linear-gradient(180deg,#f5e8dc,#e8d5c4)" }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-2 w-40 h-16 rounded-t-lg"
            style={{
              background: "linear-gradient(180deg,#ffd6e0,#f0a0b4)",
              boxShadow:
                "inset 0 6px 12px rgba(255,255,255,0.5), 0 4px 12px rgba(196,92,106,0.2)",
            }}
          >
            <div
              className="absolute -top-3 left-2 right-2 h-5 rounded-full"
              style={{ background: "linear-gradient(180deg,#fff5f8,#ffe0ec)" }}
            />
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[4.2rem] w-24 h-12 rounded-t-md"
            style={{
              background: "linear-gradient(180deg,#ffe4ec,#f5b0c0)",
              boxShadow: "inset 0 4px 8px rgba(255,255,255,0.5)",
            }}
          >
            <div
              className="absolute -top-2 left-1 right-1 h-4 rounded-full"
              style={{ background: "linear-gradient(180deg,#fff8fa,#ffe8f0)" }}
            />
          </div>
          <span className="absolute text-sm" style={{ left: "38%", bottom: "3.5rem" }}>
            🍒
          </span>
          <span className="absolute text-sm" style={{ left: "58%", bottom: "3.5rem" }}>
            🍒
          </span>

          {(leaning || holding) &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${28 + i * 8}%`,
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, rgba(200,220,255,0.55), transparent)",
                  animation: `windLine 0.35s ease-in-out ${i * 0.08}s infinite`,
                }}
              />
            ))}

          {xs.map((x, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: `${x}%`, bottom: "7.2rem", transform: "translateX(-50%)" }}
            >
              {!extinguished[i] && (
                <div
                  className="origin-bottom"
                  style={{
                    transform:
                      leaning || holding
                        ? `rotate(${10 + i * 3}deg) scaleY(0.72)`
                        : "rotate(0) scaleY(1)",
                    transition: "transform 0.12s ease-out",
                  }}
                >
                  <div
                    className="w-3 h-5 rounded-full mx-auto"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 70%,#fffef5,#ffe070 40%,#ff8020)",
                      animation: "flicker 0.28s ease-in-out infinite alternate",
                      boxShadow: "0 0 10px rgba(255,140,40,0.75)",
                    }}
                  />
                </div>
              )}
              {extinguished[i] && (
                <div
                  className="w-2 h-3 rounded-full mx-auto"
                  style={{
                    background: "rgba(160,140,150,0.45)",
                    animation: "smokeUp 1.4s ease-out infinite",
                  }}
                />
              )}
              <div
                className="w-2.5 h-7 rounded-sm mt-0.5"
                style={{
                  background:
                    i === 1
                      ? "linear-gradient(90deg,#f0c090,#fff5e8,#e8c0a0)"
                      : "linear-gradient(90deg,#f0a0b8,#ffe0ec,#e890a8)",
                }}
              />
            </div>
          ))}
        </div>

        {!done && (
          <div className="mt-5 space-y-3">
            <div className="w-40 h-2 mx-auto rounded-full bg-[#ffe4ec] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f0a8bc] to-[#c45c6a]"
                style={{
                  width: `${progress * 100}%`,
                  transition: "width 70ms linear",
                }}
              />
            </div>
            <p className="text-[11px] text-[#8a6870]">
              {progress < 0.33
                ? "Blow gently… first candle"
                : progress < 0.66
                  ? "Keep going… second candle"
                  : "Almost there… last candle"}
            </p>

            <div className="flex flex-col items-center gap-2">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  startHold();
                }}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                onClick={blowOnce}
                className="px-8 py-3 rounded-full text-sm text-white font-medium active:scale-95 select-none touch-none"
                style={{
                  background: holding
                    ? "linear-gradient(135deg, #b84d5c, #9a3a48)"
                    : "linear-gradient(135deg, #d4788a, #c45c6a)",
                  boxShadow: "0 4px 14px rgba(196,92,106,0.35)",
                }}
              >
                {holding ? "💨 Blowing…" : "🌬️ Hold to blow"}
              </button>

              {mic === "off" && (
                <button onClick={startMic} className="text-xs text-[#8a6870] underline">
                  or use microphone (keep blowing)
                </button>
              )}
              {mic === "on" && (
                <p className="text-xs text-[#c45c6a]">Mic on — blow into the phone 🎤</p>
              )}
              {mic === "denied" && (
                <p className="text-xs text-[#8a6870]">Mic blocked — hold the button instead</p>
              )}
            </div>
          </div>
        )}

        {done && (
          <p
            className="mt-5 text-sm text-[#c45c6a]"
            style={{ animation: "cardIn 0.5s ease-out" }}
          >
            Wish granted ✨
          </p>
        )}
      </div>
    </div>
  );
}
