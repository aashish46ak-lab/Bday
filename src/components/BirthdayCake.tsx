"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onDone: () => void;
}

const CANDLES = 3;
const THRESHOLD = 48;
const FULL = 36;

export default function BirthdayCake({ onDone }: Props) {
  const [extinguished, setExt] = useState<boolean[]>(Array(CANDLES).fill(false));
  const [leaning, setLeaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [smoke, setSmoke] = useState(false);
  const [mic, setMic] = useState<"off" | "on" | "denied">("off");
  const streak = useRef(0);
  const doneRef = useRef(false);
  const raf = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  const apply = useCallback((s: number) => {
    if (doneRef.current) return;
    const n = Math.min(CANDLES, Math.floor((s / FULL) * CANDLES));
    setExt(Array.from({ length: CANDLES }, (_, i) => i < n));
    if (n >= CANDLES) {
      doneRef.current = true;
      setDone(true);
      setLeaning(false);
      setSmoke(true);
      audio.playSfx("blow");
      setTimeout(() => onDone(), 1800);
    }
  }, [onDone]);

  const relight = useCallback(() => {
    if (doneRef.current) return;
    streak.current = 0;
    setProgress(0);
    setLeaning(false);
    setExt(Array(CANDLES).fill(false));
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      an.smoothingTimeConstant = 0.35;
      src.connect(an);
      setMic("on");
      const data = new Uint8Array(an.frequencyBinCount);
      let quiet = 0;
      const tick = () => {
        if (doneRef.current) return;
        an.getByteFrequencyData(data);
        let sum = 0, c = 0;
        for (let i = Math.floor(data.length * 0.1); i < Math.floor(data.length * 0.5); i++) {
          sum += data[i]; c++;
        }
        const avg = c ? sum / c : 0;
        if (avg >= THRESHOLD) {
          quiet = 0;
          streak.current += 1;
          setLeaning(true);
          setProgress(Math.min(1, streak.current / FULL));
          apply(streak.current);
        } else {
          quiet += 1;
          if (quiet > 8 && streak.current > 0 && !doneRef.current) relight();
          else if (quiet > 3) setLeaning(false);
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      setMic("denied");
    }
  }, [apply, relight]);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const blowTap = () => {
    if (doneRef.current) return;
    streak.current = Math.min(FULL, streak.current + 8);
    setLeaning(true);
    setProgress(Math.min(1, streak.current / FULL));
    apply(streak.current);
    setTimeout(() => { if (!doneRef.current) setLeaning(false); }, 400);
  };

  const xs = [28, 50, 72];

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center plaid-bg px-5">
      <div className="paper-card w-full max-w-[340px] rounded-2xl p-6 text-center" style={{ animation: "cardIn 0.5s ease-out both" }}>
        <p className="text-xs tracking-[0.2em] uppercase text-[#c45c6a] mb-1">Birthday cake for you</p>
        <h2 className="text-xl text-[#4a3038] mb-5" style={{ fontFamily: "Georgia, serif" }}>Make a wish, Esha ✨</h2>

        {/* cake illustration */}
        <div className="relative mx-auto" style={{ width: 220, height: 180 }}>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-48 h-4 rounded-full opacity-20 blur-sm bg-[#c45c6a]" />
          {/* plate */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-44 h-3 rounded-full" style={{ background: "linear-gradient(180deg,#f5e8dc,#e8d5c4)" }} />
          {/* bottom tier */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-40 h-16 rounded-t-lg" style={{ background: "linear-gradient(180deg,#ffd6e0,#f0a0b4)", boxShadow: "inset 0 6px 12px rgba(255,255,255,0.5), 0 4px 12px rgba(196,92,106,0.2)" }}>
            <div className="absolute -top-3 left-2 right-2 h-5 rounded-full" style={{ background: "linear-gradient(180deg,#fff5f8,#ffe0ec)" }} />
          </div>
          {/* top tier */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[4.2rem] w-24 h-12 rounded-t-md" style={{ background: "linear-gradient(180deg,#ffe4ec,#f5b0c0)", boxShadow: "inset 0 4px 8px rgba(255,255,255,0.5)" }}>
            <div className="absolute -top-2 left-1 right-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg,#fff8fa,#ffe8f0)" }} />
          </div>
          {/* cherries */}
          <span className="absolute text-sm" style={{ left: "42%", bottom: "7.8rem" }}>🍒</span>
          <span className="absolute text-sm" style={{ left: "52%", bottom: "8.1rem" }}>🍒</span>
          <span className="absolute text-sm" style={{ left: "35%", bottom: "3.8rem" }}>🍒</span>
          <span className="absolute text-sm" style={{ left: "58%", bottom: "3.5rem" }}>🍒</span>
          {/* candles */}
          {xs.map((x, i) => (
            <div key={i} className="absolute flex flex-col items-center" style={{ left: `${x}%`, bottom: "7.2rem", transform: "translateX(-50%)" }}>
              {!extinguished[i] && (
                <div className={leaning ? "origin-bottom" : ""} style={leaning ? { transform: "rotate(12deg) scaleY(0.75)", transition: "0.1s" } : {}}>
                  <div className="w-3 h-5 rounded-full mx-auto" style={{ background: "radial-gradient(ellipse at 50% 70%,#fffef5,#ffe070 40%,#ff8020)", animation: "flicker 0.3s ease-in-out infinite alternate", boxShadow: "0 0 8px rgba(255,140,40,0.7)" }} />
                </div>
              )}
              {extinguished[i] && smoke && (
                <div className="w-2 h-2 rounded-full bg-[rgba(160,140,150,0.4)] mx-auto" style={{ animation: "smokeUp 1.2s ease-out forwards" }} />
              )}
              <div className="w-2.5 h-7 rounded-sm mt-0.5" style={{ background: i === 1 ? "linear-gradient(90deg,#f0c090,#fff5e8,#e8c0a0)" : "linear-gradient(90deg,#f0a0b8,#ffe0ec,#e890a8)" }} />
            </div>
          ))}
        </div>

        {!done && (
          <div className="mt-5 space-y-3">
            <div className="w-36 h-1.5 mx-auto rounded-full bg-[#ffe4ec] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#f0a8bc] to-[#c45c6a]" style={{ width: `${progress * 100}%`, transition: "width 80ms linear" }} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={blowTap}
                className="px-6 py-2 rounded-full text-sm border border-[#c45c6a] text-[#c45c6a] bg-white active:scale-95"
              >
                🌬️ Blow (tap)
              </button>
              {mic === "off" && (
                <button onClick={startMic} className="text-xs text-[#8a6870] underline">
                  or use microphone
                </button>
              )}
              {mic === "on" && <p className="text-xs text-[#c45c6a]">Mic on — keep blowing…</p>}
              {mic === "denied" && <p className="text-xs text-[#8a6870]">Mic blocked — use the button</p>}
            </div>
          </div>
        )}

        {done && <p className="mt-5 text-sm text-[#c45c6a]" style={{ animation: "cardIn 0.5s ease-out" }}>Wish granted ✨</p>}
      </div>
    </div>
  );
}
