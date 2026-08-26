"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onBlownOut: () => void;
}

const CANDLE_COUNT = 3;
const BLOW_THRESHOLD = 48;
const FULL_BLOW_FRAMES = 40;

export default function BirthdayCake({ onBlownOut }: Props) {
  const [visible, setVisible] = useState(false);
  const [extinguished, setExtinguished] = useState<boolean[]>(Array(CANDLE_COUNT).fill(false));
  const [leaning, setLeaning] = useState(false);
  const [micState, setMicState] = useState<"loading" | "on" | "denied">("loading");
  const [blowProgress, setBlowProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [smoke, setSmoke] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const blowStreak = useRef(0);
  const doneRef = useRef(false);
  const outCountRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const applyBlowLevel = useCallback((streak: number) => {
    if (doneRef.current) return;
    const targetOut = Math.min(CANDLE_COUNT, Math.floor((streak / FULL_BLOW_FRAMES) * CANDLE_COUNT));
    setExtinguished((prev) => prev.map((_, i) => i < targetOut));
    outCountRef.current = targetOut;
    if (targetOut >= CANDLE_COUNT) {
      doneRef.current = true;
      setDone(true);
      setLeaning(false);
      setSmoke(true);
      audio.playSfx("blow");
      setTimeout(() => onBlownOut(), 1600);
    }
  }, [onBlownOut]);

  const relightIfStopped = useCallback(() => {
    if (doneRef.current) return;
    blowStreak.current = 0;
    setBlowProgress(0);
    setLeaning(false);
    setExtinguished(Array(CANDLE_COUNT).fill(false));
    outCountRef.current = 0;
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
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
        let sum = 0, count = 0;
        const start = Math.floor(data.length * 0.1);
        const end = Math.floor(data.length * 0.5);
        for (let i = start; i < end; i++) { sum += data[i]; count++; }
        const avg = count ? sum / count : 0;
        if (avg >= BLOW_THRESHOLD) {
          quietFrames = 0;
          blowStreak.current += 1;
          setLeaning(true);
          setBlowProgress(Math.min(1, blowStreak.current / FULL_BLOW_FRAMES));
          applyBlowLevel(blowStreak.current);
        } else {
          quietFrames += 1;
          if (quietFrames > 8 && blowStreak.current > 0 && !doneRef.current) {
            if (outCountRef.current < CANDLE_COUNT) relightIfStopped();
          } else if (quietFrames > 3) setLeaning(false);
        }
        rafRef.current = requestAnimationFrame(check);
      };
      rafRef.current = requestAnimationFrame(check);
    } catch {
      setMicState("denied");
    }
  }, [applyBlowLevel, relightIfStopped]);

  useEffect(() => {
    const t = setTimeout(() => startMic(), 700);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [startMic]);

  const candlePositions = [28, 50, 72];

  return (
    <div className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="text-center mb-6 space-y-1">
        <p className="text-2xl sm:text-3xl font-medium" style={{ color: "#e07a9a", fontFamily: "Georgia, serif" }}>
          Make a wish, Esha
        </p>
        <p className="text-sm text-[#9a7080]">Blow toward the mic — keep going</p>
      </div>

      <div className="relative" style={{ width: 280, height: 220 }}>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-56 h-5 rounded-full opacity-25 blur-sm" style={{ background: "#e07a9a" }} />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1" style={{ width: 230, height: 18, borderRadius: "50%", background: "linear-gradient(180deg, #f5e8dc 0%, #e8d5c4 100%)", boxShadow: "0 4px 12px rgba(90,53,69,0.12)" }} />

        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 16, width: 200, height: 100, borderRadius: "16px 16px 12px 12px", background: "linear-gradient(180deg, #ffd6e4 0%, #f8b8cc 40%, #f0a0b8 100%)", boxShadow: "inset 0 8px 16px rgba(255,255,255,0.5), inset 0 -10px 20px rgba(200,80,110,0.15), 0 8px 24px rgba(224,122,154,0.25)" }}>
          <div className="absolute left-0 right-0" style={{ top: -14, height: 28, borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%", background: "linear-gradient(180deg, #fff5f8 0%, #ffe4ec 50%, #ffd0e0 100%)", boxShadow: "inset 0 2px 6px rgba(255,255,255,0.8)" }} />
          {[18, 42, 58, 78].map((left, i) => (
            <div key={i} className="absolute" style={{ left: `${left}%`, top: -2, width: 14, height: 22 + (i % 2) * 6, borderRadius: "0 0 50% 50%", background: "linear-gradient(180deg, #ffe4ec 0%, #ffd0e0 100%)", transform: "translateX(-50%)" }} />
          ))}
          {[[15, 35, "#ff8fab"], [28, 55, "#ffd166"], [45, 28, "#a0e7e5"], [62, 48, "#ff8fab"], [78, 32, "#cdb4db"], [22, 70, "#ffd166"], [55, 72, "#a0e7e5"], [85, 60, "#ff8fab"]].map(([x, y, color], i) => (
            <div key={i} className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: 6, height: 3, background: color as string, transform: `rotate(${i * 35}deg)`, opacity: 0.9 }} />
          ))}
        </div>

        {candlePositions.map((xPct, i) => {
          const isOut = extinguished[i];
          return (
            <div key={i} className="absolute flex flex-col items-center" style={{ left: `${xPct}%`, bottom: 118, transform: "translateX(-50%)", width: 20 }}>
              {!isOut && (
                <div className={leaning ? "flame-lean" : "flame-idle"} style={{ position: "relative", width: 18, height: 28, marginBottom: -4 }}>
                  <div style={{ position: "absolute", left: "50%", bottom: 4, transform: "translateX(-50%)", width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,180,60,0.45) 0%, transparent 70%)", animation: "glowPulse 0.9s ease-in-out infinite alternate" }} />
                  <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 12, height: 22, borderRadius: "50% 50% 40% 40% / 55% 55% 45% 45%", background: "radial-gradient(ellipse at 50% 70%, #fffef5 0%, #ffe070 30%, #ff9020 65%, #ff5010 100%)", boxShadow: "0 0 12px rgba(255,140,40,0.75)", animation: "flicker 0.28s ease-in-out infinite alternate" }} />
                </div>
              )}
              {isOut && smoke && (
                <div style={{ width: 10, height: 24, marginBottom: -2, position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", bottom: 0, width: 8, height: 8, marginLeft: -4, borderRadius: "50%", background: "rgba(160,140,150,0.4)", animation: "smokeUp 1.3s ease-out forwards" }} />
                </div>
              )}
              <div style={{ width: 10, height: 36, borderRadius: 3, background: i === 1 ? "linear-gradient(90deg, #f0c090, #fff5e8 45%, #e8c0a0)" : "linear-gradient(90deg, #f0a0b8, #ffe0ec 45%, #e890a8)", boxShadow: "2px 0 3px rgba(90,53,69,0.12), inset 1px 0 0 rgba(255,255,255,0.6)" }}>
                <div style={{ width: 2, height: 5, margin: "0 auto", background: "#4a3040", borderRadius: 1 }} />
              </div>
            </div>
          );
        })}
      </div>

      {!done && (
        <div className="mt-8 text-center space-y-3 max-w-xs">
          {micState === "loading" && <p className="text-sm text-[#9a7080] animate-pulse">Preparing microphone…</p>}
          {micState === "on" && (
            <>
              <div className="w-44 h-2 mx-auto rounded-full bg-[#ffe4ec] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#f0a8bc] to-[#e07a9a]" style={{ width: `${blowProgress * 100}%`, transition: "width 70ms linear" }} />
              </div>
              <p className="text-sm text-[#5a3545]">{blowProgress > 0.05 ? (blowProgress < 1 ? "Keep blowing…" : "Yes!") : "Blow toward the mic"}</p>
              <p className="text-xs text-[#9a7080]">Stop early and the candles light again</p>
            </>
          )}
          {micState === "denied" && (
            <button onClick={startMic} className="px-5 py-2 rounded-full border border-[#f0a8bc] text-[#e07a9a] text-sm bg-white/80">Enable microphone</button>
          )}
        </div>
      )}

      {done && <p className="mt-6 text-sm text-[#e07a9a]" style={{ animation: "fadeUp 0.6s ease-out" }}>Wish granted ✨</p>}

      <style jsx>{`
        .flame-idle { animation: none; }
        .flame-lean { animation: windLean 0.15s ease-in-out infinite alternate; transform-origin: 50% 100%; }
        @keyframes flicker {
          0% { transform: translateX(-50%) scaleY(1) rotate(-2deg); }
          100% { transform: translateX(-50%) scaleY(1.1) scaleX(0.92) rotate(3deg); }
        }
        @keyframes glowPulse {
          0% { opacity: 0.4; transform: scale(1); }
          100% { opacity: 0.75; transform: scale(1.15); }
        }
        @keyframes windLean {
          0% { transform: rotate(8deg) scaleY(0.9); }
          100% { transform: rotate(18deg) scaleY(0.7); opacity: 0.65; }
        }
        @keyframes smokeUp {
          0% { opacity: 0.5; transform: translateY(0) scale(0.5); }
          100% { opacity: 0; transform: translateY(-26px) scale(2); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
