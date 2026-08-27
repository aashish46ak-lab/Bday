"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { SITE_CONFIG } from "@/lib/config";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";
import { audio } from "@/lib/audio";
import SoundController from "./SoundController";

type Page = 0 | 1 | 2;

function useLandscape() {
  const [land, setLand] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 520px)");
    const wide = window.matchMedia("(min-width: 720px)");
    const apply = () => setLand(mq.matches || wide.matches);
    apply();
    mq.addEventListener("change", apply);
    wide.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      wide.removeEventListener("change", apply);
    };
  }, []);
  return land;
}

function buildBlossoms() {
  const pts: { x: number; y: number; s: number; c: string; d: number }[] = [];
  const colors = ["#ffb7c5", "#ffc0cb", "#ff69b4", "#ff85a2", "#ffe4ec", "#ff9ebb", "#f8bbd0"];
  let seed = 99;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const centers = [
    { x: 50, y: 22, r: 28 },
    { x: 32, y: 30, r: 20 },
    { x: 68, y: 28, r: 20 },
    { x: 42, y: 40, r: 16 },
    { x: 58, y: 38, r: 16 },
    { x: 25, y: 42, r: 12 },
    { x: 75, y: 40, r: 12 },
  ];
  centers.forEach((c, ci) => {
    for (let i = 0; i < 18; i++) {
      const a = rnd() * Math.PI * 2;
      const r = rnd() * c.r;
      pts.push({
        x: c.x + Math.cos(a) * r * 0.9,
        y: c.y + Math.sin(a) * r * 0.7,
        s: 8 + rnd() * 12,
        c: colors[Math.floor(rnd() * colors.length)],
        d: ci * 0.08 + i * 0.02,
      });
    }
  });
  return pts;
}

const LETTERS: Record<string, { x: number; y: number }[]> = {
  E: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[1,2],[2,2],[1,4],[2,4]].map(([x,y]) => ({ x, y })),
  S: [[2,0],[1,0],[0,0],[0,1],[0,2],[1,2],[2,2],[2,3],[2,4],[1,4],[0,4]].map(([x,y]) => ({ x, y })),
  H: [[0,0],[0,1],[0,2],[0,3],[0,4],[2,0],[2,1],[2,2],[2,3],[2,4],[1,2]].map(([x,y]) => ({ x, y })),
  A: [[0,4],[0,3],[0,2],[0,1],[1,0],[2,1],[2,2],[2,3],[2,4],[0.5,2.2],[1.5,2.2]].map(([x,y]) => ({ x, y })),
};

function EshaConstellation() {
  const letters = ["E", "S", "H", "A"];
  return (
    <div className="relative w-full h-28 mt-3">
      {letters.map((L, li) => {
        const pts = LETTERS[L] || [];
        return (
          <div key={L} className="absolute top-0" style={{ left: `${li * 24}%`, width: "22%", height: "100%" }}>
            {pts.map((p, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-[#ffd6e0]"
                style={{
                  left: `${(p.x / 2) * 100}%`,
                  top: `${(p.y / 4) * 100}%`,
                  width: 5,
                  height: 5,
                  boxShadow: "0 0 6px 2px rgba(255,180,200,0.7)",
                  animation: `starTwinkle ${1.2 + (i % 5) * 0.25}s ease-in-out ${(li + i) * 0.08}s infinite`,
                }}
              />
            ))}
          </div>
        );
      })}
      <p className="absolute -bottom-1 left-0 right-0 text-center text-[10px] tracking-[0.35em] text-[#c9184a]/80">
        E S H A
      </p>
    </div>
  );
}

function CherryTree({ falling }: { falling: boolean }) {
  const blossoms = useMemo(() => buildBlossoms(), []);
  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 15 + ((i * 11) % 70),
        delay: i * 0.45,
        dur: 4.5 + (i % 5) * 0.7,
        size: 7 + (i % 4) * 3,
        px: (i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 15),
      })),
    []
  );

  return (
    <div className="relative w-full max-w-[280px] mx-auto" style={{ height: 280 }}>
      {blossoms.map((b, i) => (
        <span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            fontSize: b.s,
            color: b.c,
            transform: "translate(-50%, -50%)",
            animation: `bloomHeart 0.5s ease-out ${b.d}s both`,
            filter: "drop-shadow(0 1px 1px rgba(200,80,100,0.2))",
            lineHeight: 1,
          }}
        >
          ❀
        </span>
      ))}
      <div
        className="absolute left-1/2"
        style={{
          bottom: 8,
          width: 14,
          height: 100,
          marginLeft: -7,
          background: "linear-gradient(90deg,#6b4420,#c4a06a 40%,#8b5a2b)",
          borderRadius: "4px 4px 2px 2px",
          animation: "bloomHeart 0.8s ease-out both",
        }}
      />
      <div className="absolute" style={{ left: "28%", bottom: 95, width: 55, height: 4, background: "#8b5a2b", borderRadius: 2, transform: "rotate(-32deg)", transformOrigin: "right center", animation: "bloomHeart 0.5s ease-out 0.3s both" }} />
      <div className="absolute" style={{ left: "50%", bottom: 100, width: 55, height: 4, background: "#8b5a2b", borderRadius: 2, transform: "rotate(28deg)", transformOrigin: "left center", animation: "bloomHeart 0.5s ease-out 0.35s both" }} />
      <div className="absolute left-[18%] right-[18%] bottom-2 h-[2px] rounded-full" style={{ background: "rgba(180,150,120,0.5)" }} />

      {falling &&
        petals.map((p) => (
          <span
            key={p.id}
            className="absolute pointer-events-none text-[#ffb7c5]"
            style={{
              left: `${p.left}%`,
              top: "18%",
              fontSize: p.size,
              animation: `fallPetal ${p.dur}s linear ${p.delay}s infinite`,
              ...({ ["--px"]: `${p.px}px` } as React.CSSProperties),
            }}
          >
            ❀
          </span>
        ))}
    </div>
  );
}

export default function CherryCelebration() {
  const [page, setPage] = useState<Page>(0);
  const landscape = useLandscape();

  useEffect(() => {
    audio.fadeMusic(0.55, 1.5);
  }, []);

  const next = useCallback(() => {
    audio.playSfx("click");
    setPage((p) => (p < 2 ? ((p + 1) as Page) : p));
  }, []);
  const prev = useCallback(() => {
    audio.playSfx("click");
    setPage((p) => (p > 0 ? ((p - 1) as Page) : p));
  }, []);

  const book = (
    <div className="flex flex-col h-full min-h-[240px]">
      <p className="text-[10px] tracking-[0.25em] uppercase text-[#c9184a] mb-2 text-center">
        Page {page + 1} / 3
      </p>

      <div className="flex-1 cream-card border border-[#f0d0d8] px-4 py-5 relative overflow-hidden" style={{ borderRadius: 16, minHeight: 220 }}>
        {page === 0 && (
          <div style={{ animation: "cardIn 0.45s ease-out both" }}>
            <p className="text-xs text-[#c9184a] mb-2">A wish for you</p>
            <p className="text-[14px] leading-relaxed text-[#4a3038]" style={{ fontFamily: "Georgia, serif" }}>
              Dear Esha,
              <br /><br />
              Another year of soft smiles, quiet strength, and all the little things that make the days warmer.
              <br /><br />
              May this year be gentle — soft mornings, good people, and more reasons to smile than you can count.
            </p>
          </div>
        )}

        {page === 1 && (
          <div className="flex flex-col items-center" style={{ animation: "cardIn 0.45s ease-out both" }}>
            <p className="text-xs text-[#c9184a] mb-3">A moment</p>
            <div className="bg-white p-2 pb-7 shadow-md" style={{ width: 160, transform: "rotate(-2deg)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ESHA_PHOTO} alt="Esha" className="w-full aspect-[3/4] object-cover" />
              <p className="mt-1.5 text-[10px] text-center text-[#8a6870] italic">Esha · Ashoj 15</p>
            </div>
          </div>
        )}

        {page === 2 && (
          <div style={{ animation: "cardIn 0.45s ease-out both" }}>
            <p className="text-xs text-[#c9184a] mb-2 text-center">Many many happy returns</p>
            <p className="text-[13px] leading-relaxed text-[#4a3038] text-center" style={{ fontFamily: "Georgia, serif" }}>
              Have the happiest birthday, Esha.
              <br />
              You deserve every good thing. ✨
            </p>
            <EshaConstellation />
            <p className="text-[10px] text-center text-[#a08088] mt-3">
              {SITE_CONFIG.person.dobBS} · {SITE_CONFIG.person.home}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 gap-2">
        <button onClick={prev} disabled={page === 0} className="px-4 py-2 rounded-full text-xs border border-[#e8a0b0]/50 text-[#c9184a] disabled:opacity-30 active:scale-95">
          ← Prev
        </button>
        {page < 2 ? (
          <button onClick={next} className="px-5 py-2 rounded-full text-xs text-white active:scale-95" style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}>
            Next →
          </button>
        ) : (
          <span className="text-[11px] text-[#c9184a]">❀ The end</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-10 bg-hearts overflow-hidden flex flex-col items-center justify-center px-3 py-4">
      <div
        className={`cream-card relative w-full overflow-hidden ${
          landscape
            ? "max-w-[860px] min-h-[min(88dvh,440px)] px-5 py-4"
            : "max-w-[400px] min-h-[min(90dvh,640px)] px-4 pt-5 pb-4"
        }`}
        style={{ animation: "cardIn 0.6s ease-out both" }}
      >
        <div className={landscape ? "flex flex-row items-stretch gap-4 h-full min-h-[360px]" : "flex flex-col gap-3"}>
          <div className={landscape ? "flex-1 flex flex-col items-center justify-center min-w-0" : "flex flex-col items-center"}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9184a] mb-1">Cherry blossoms for you</p>
            <CherryTree falling />
          </div>
          <div className={landscape ? "flex-1 min-w-0" : ""}>{book}</div>
        </div>
      </div>
      <SoundController />
    </div>
  );
}
