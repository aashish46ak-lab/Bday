"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onBlownOut: () => void;
}

const CANDLE_COUNT = 5;

export default function BirthdayCake({ onBlownOut }: Props) {
  const [visible, setVisible] = useState(false);
  const [lit, setLit] = useState(true);
  const [blowing, setBlowing] = useState(false);
  const [extinguished, setExtinguished] = useState<boolean[]>(Array(CANDLE_COUNT).fill(false));
  const [smoke, setSmoke] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const extinguishAll = useCallback(() => {
    if (!lit || blowing) return;
    setBlowing(true);
    audio.playSfx("blow");
    let i = 0;
    const step = () => {
      if (i >= CANDLE_COUNT) {
        setLit(false);
        setSmoke(true);
        setTimeout(() => onBlownOut(), 1800);
        return;
      }
      setExtinguished((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      i += 1;
      setTimeout(step, 180);
    };
    step();
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
      } catch {}
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
    <div className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="text-center mb-8 space-y-2">
        <p className="text-xl sm:text-2xl text-[#f5e6c8] font-light">Make a wish, Esha. ✨</p>
        <p className="text-sm text-[#c9b8e8]/70">Whenever you&apos;re ready...</p>
      </div>

      <div className="relative select-none" style={{ width: 220, height: 200 }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-52 h-3 rounded-full bg-gradient-to-b from-[#3a3a45] to-[#1a1a22]" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-44 h-16 rounded-t-lg" style={{ background: "linear-gradient(180deg, #f8e8d0 0%, #e8c9a0 40%, #d4a574 100%)", boxShadow: "inset 0 -8px 16px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.3)" }}>
          <div className="absolute -top-2 left-0 right-0 h-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="absolute top-0 w-5 h-5 rounded-full bg-[#fff8f0]" style={{ left: `${i * 14 + 4}%`, opacity: 0.95 }} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 w-28 h-12 rounded-t-md" style={{ background: "linear-gradient(180deg, #fff0e0 0%, #f0d4b0 50%, #e0b888 100%)", boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.12)" }}>
          <div className="absolute -top-1.5 left-0 right-0 h-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute top-0 w-4 h-4 rounded-full bg-[#fff8f0]" style={{ left: `${i * 18 + 6}%` }} />
            ))}
          </div>
        </div>

        <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 flex gap-3">
          {[...Array(CANDLE_COUNT)].map((_, i) => (
            <div key={i} className="relative flex flex-col items-center">
              {!extinguished[i] && lit && (
                <div className="relative -mb-0.5">
                  <div className="w-2.5 h-4 rounded-full origin-bottom candle-flame" style={{ background: "radial-gradient(ellipse at center bottom, #fff8e0 0%, #ffcc66 30%, #ff8844 70%, transparent 100%)", animationDelay: `${i * 0.15}s`, filter: "blur(0.3px)" }} />
                  <div className="absolute inset-0 w-4 h-5 -left-0.5 rounded-full opacity-40 candle-glow" style={{ background: "radial-gradient(circle, rgba(255,180,80,0.6) 0%, transparent 70%)", animationDelay: `${i * 0.15}s` }} />
                </div>
              )}
              {extinguished[i] && smoke && (
                <div className="w-1 h-6 mb-0 opacity-40 smoke-rise" style={{ background: "linear-gradient(to top, rgba(180,180,190,0.5), transparent)", animationDelay: `${i * 0.1}s` }} />
              )}
              <div className="w-2 h-7 rounded-sm" style={{ background: i % 2 === 0 ? "linear-gradient(90deg, #f0e0c0, #e8d4a8, #f0e0c0)" : "linear-gradient(90deg, #e8c0d0, #d8a8b8, #e8c0d0)", boxShadow: "1px 0 2px rgba(0,0,0,0.2)" }} />
            </div>
          ))}
        </div>
      </div>

      {lit && !blowing && (
        <div className="mt-10 space-y-3 text-center">
          <button onClick={extinguishAll} className="px-6 py-3 rounded-full border border-[#e8c87a]/50 text-[#f5e6c8] text-sm tracking-wide hover:bg-[#e8c87a]/10 transition-all active:scale-95">
            Tap to blow out the candles
          </button>
          {micActive && <p className="text-xs text-[#c9b8e8]/60">or blow toward your microphone 🌬️</p>}
        </div>
      )}

      <style jsx>{`
        .candle-flame { animation: flicker 0.4s ease-in-out infinite alternate; }
        .candle-glow { animation: glowPulse 1.2s ease-in-out infinite alternate; }
        @keyframes flicker {
          0% { transform: scaleY(1) scaleX(1) rotate(-2deg); opacity: 0.95; }
          100% { transform: scaleY(1.15) scaleX(0.9) rotate(2deg); opacity: 1; }
        }
        @keyframes glowPulse {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.55; transform: scale(1.2); }
        }
        .smoke-rise { animation: rise 1.8s ease-out forwards; }
        @keyframes rise {
          0% { opacity: 0.5; transform: translateY(0) scaleX(1); }
          100% { opacity: 0; transform: translateY(-30px) scaleX(1.5); }
        }
      `}</style>
    </div>
  );
}
