"use client";

import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function BirthdayHero({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1800);
    const t3 = setTimeout(() => setStep(3), 3400);
    const t4 = setTimeout(() => onComplete(), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute text-[#f0a8bc]/40 select-none"
            style={{
              left: `${8 + i * 11}%`,
              top: `${12 + (i % 4) * 20}%`,
              fontSize: `${14 + (i % 4) * 8}px`,
              animation: `drift ${5 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      {step >= 1 && (
        <p
          className="text-sm tracking-[0.2em] uppercase text-[#f0a8bc] mb-4"
          style={{ animation: "fadeUp 0.8s ease-out both" }}
        >
          Made just for you
        </p>
      )}

      {step >= 2 && (
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-medium leading-tight"
          style={{
            color: "#e07a9a",
            fontFamily: "Georgia, serif",
            animation: "fadeUp 1s ease-out both",
            textShadow: "0 2px 20px rgba(224,122,154,0.2)",
          }}
        >
          Happy Birthday
          <br />
          <span className="text-[#5a3545]">Esha</span>
        </h1>
      )}

      {step >= 3 && (
        <p
          className="mt-6 text-base text-[#9a7080] max-w-xs"
          style={{ animation: "fadeUp 0.9s ease-out both" }}
        >
          A little surprise is waiting…
        </p>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-10px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
