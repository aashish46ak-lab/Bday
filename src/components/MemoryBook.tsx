"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";
import { SITE_CONFIG } from "@/lib/config";
import { ESHA_PHOTO } from "@/lib/eshaPhoto";

interface Props {
  onDone: () => void;
}

const PAGES = [
  {
    title: "For Esha",
    body: "यो सानो किताब तिमीलाई मात्रै।\nA little book made just for you.",
  },
  {
    title: "Ashoj 15",
    body: `${SITE_CONFIG.person.dobBS}\nBorn in ${SITE_CONFIG.person.home}.\nThe day the world got a little brighter.`,
  },
  {
    title: "Wish",
    body: "May this year be soft with you —\nquiet joys, warm mornings,\nand moments that make you smile.",
  },
  {
    title: "Photo",
    body: "photo",
  },
  {
    title: "Last page",
    body: "जन्मदिनको हार्दिक शुभकामना ✨\nHappy Birthday, Esha.\nYou deserve every good thing.",
  },
];

export default function MemoryBook({ onDone }: Props) {
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState(false);

  const go = (dir: 1 | -1) => {
    if (flipping) return;
    const next = page + dir;
    if (next < 0 || next >= PAGES.length) return;
    setFlipping(true);
    audio.playSfx("click");
    setTimeout(() => {
      setPage(next);
      setFlipping(false);
    }, 280);
  };

  const current = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-4">
      <p
        className="text-sm tracking-[0.2em] uppercase text-[#f0a8bc] mb-4"
        style={{ fontFamily: "Georgia, serif" }}
      >
        A little book for you
      </p>

      <div
        className="relative w-full max-w-[320px]"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative rounded-r-xl rounded-l-md overflow-hidden border border-[#e8c4d0] bg-[#fffaf7] shadow-xl"
          style={{
            minHeight: 380,
            boxShadow:
              "8px 12px 32px rgba(224,122,154,0.22), inset 4px 0 8px rgba(90,53,69,0.06)",
            transform: flipping ? "rotateY(-12deg)" : "rotateY(0deg)",
            transition: "transform 0.28s ease",
            transformOrigin: "left center",
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-2"
            style={{
              background:
                "linear-gradient(90deg, rgba(224,122,154,0.25), transparent)",
            }}
          />

          <div className="px-7 py-8 h-full flex flex-col">
            <p className="text-[10px] tracking-widest uppercase text-[#c9a0b0] mb-3">
              Page {page + 1} / {PAGES.length}
            </p>

            <h3
              className="text-xl mb-4"
              style={{ color: "#e07a9a", fontFamily: "Georgia, serif" }}
            >
              {current.title}
            </h3>

            {current.body === "photo" ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-[#f0a8bc]/50 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ESHA_PHOTO}
                    alt="Esha"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#5a3545] leading-relaxed whitespace-pre-line flex-1">
                {current.body}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => go(-1)}
                disabled={page === 0 || flipping}
                className="px-4 py-2 rounded-full text-sm border border-[#f0a8bc]/50 text-[#e07a9a] disabled:opacity-30 bg-white/70"
              >
                ← Prev
              </button>
              {!isLast ? (
                <button
                  onClick={() => go(1)}
                  disabled={flipping}
                  className="px-4 py-2 rounded-full text-sm border border-[#e07a9a] text-white bg-[#e07a9a] disabled:opacity-50"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => {
                    audio.playSfx("whoosh");
                    onDone();
                  }}
                  className="px-5 py-2 rounded-full text-sm border border-[#e07a9a] text-white bg-[#e07a9a]"
                >
                  Close book ✨
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-[#9a7080]">Tap next to turn the page</p>
    </div>
  );
}
