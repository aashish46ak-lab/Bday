"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";

interface Props {
  onAllExplored: () => void;
}

const WISHES = [
  { title: "Happiness", text: "May joy find you in quiet moments and loud ones alike." },
  { title: "Success", text: "May every step lead somewhere beautiful." },
  { title: "Adventures", text: "May the year be full of stories worth telling." },
  { title: "Peace", text: "May your heart stay light and kind to itself." },
  { title: "Dreams", text: "May the things you hope for start becoming real." },
  { title: "Memories", text: "May this year give you more reasons to smile." },
];

export default function GiftReveal({ onAllExplored }: Props) {
  const [explored, setExplored] = useState({
    message: false,
    music: false,
    wishes: false,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showWishes, setShowWishes] = useState(false);
  const [finalUnlocked, setFinalUnlocked] = useState(false);

  const mark = (key: "message" | "music" | "wishes") => {
    setExplored((p) => {
      const next = { ...p, [key]: true };
      if (next.message && next.music && next.wishes && !finalUnlocked) {
        setTimeout(() => setFinalUnlocked(true), 500);
      }
      return next;
    });
  };

  const card =
    "w-full text-left p-5 rounded-2xl border border-[#e8a0b4]/40 bg-white/70 backdrop-blur-sm shadow-sm hover:border-[#c45c7a]/50 hover:shadow-md transition-all active:scale-[0.99]";

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto py-12 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        <h2 className="text-center text-2xl text-[#c45c7a] font-light mb-6">
          Inside your gift
        </h2>

        <button
          onClick={() => {
            audio.playSfx("envelope");
            setShowMessage(true);
            mark("message");
          }}
          className={card}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💌</span>
            <div>
              <p className="text-[#5a3545] font-medium">A Little Message</p>
              <p className="text-xs text-[#8b6b78]">Open the card</p>
            </div>
          </div>
          {showMessage && (
            <div className="mt-4 pt-4 border-t border-[#f5d0dc] text-[#5a3545] text-sm leading-relaxed space-y-2.5 animate-fade">
              <p>Dear Esha,</p>
              <p>
                On this special day, I hope the sky feels a little brighter and the
                world a little kinder — just for you.
              </p>
              <p>
                May your year be filled with quiet joys, unexpected laughter, and
                everything that makes you feel most like yourself.
              </p>
              <p className="italic text-[#c45c7a]">Happy Birthday. ✨</p>
            </div>
          )}
        </button>

        <button
          onClick={() => {
            audio.playSfx("click");
            setShowMusic(true);
            mark("music");
          }}
          className={card}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎵</span>
            <div>
              <p className="text-[#5a3545] font-medium">Birthday Tune</p>
              <p className="text-xs text-[#8b6b78]">Playing for you</p>
            </div>
          </div>
          {showMusic && (
            <div className="mt-4 pt-4 border-t border-[#f5d0dc] animate-fade">
              <div className="flex items-end gap-1 h-9 mb-2">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-[#e8a0b4] to-[#c45c7a] music-bar"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-[#8b6b78]">Enjoy the moment</p>
            </div>
          )}
        </button>

        <button
          onClick={() => {
            audio.playSfx("click");
            setShowWishes(true);
            mark("wishes");
          }}
          className={card}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-[#5a3545] font-medium">Birthday Wishes</p>
              <p className="text-xs text-[#8b6b78]">Little stars for you</p>
            </div>
          </div>
          {showWishes && (
            <div className="mt-4 pt-4 border-t border-[#f5d0dc] grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fade">
              {WISHES.map((w) => (
                <div
                  key={w.title}
                  className="p-3 rounded-xl bg-[#fff8f3] border border-[#f5d0dc]"
                >
                  <p className="text-[#c45c7a] text-sm font-medium mb-1">{w.title}</p>
                  <p className="text-xs text-[#8b6b78] leading-snug">{w.text}</p>
                </div>
              ))}
            </div>
          )}
        </button>

        <button
          onClick={() => {
            if (!finalUnlocked) return;
            audio.playSfx("whoosh");
            onAllExplored();
          }}
          disabled={!finalUnlocked}
          className={`w-full text-left p-5 rounded-2xl border transition-all ${
            finalUnlocked
              ? "border-[#c45c7a]/50 bg-white/80 shadow-sm cursor-pointer"
              : "border-[#f5d0dc] bg-white/40 opacity-55 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{finalUnlocked ? "🔓" : "🔐"}</span>
            <div>
              <p className="text-[#5a3545] font-medium">One Last Thing</p>
              <p className="text-xs text-[#8b6b78]">
                {finalUnlocked
                  ? "There's still one last surprise…"
                  : "Explore the other gifts first"}
              </p>
            </div>
          </div>
        </button>
      </div>

      <style jsx>{`
        .animate-fade {
          animation: fadeUp 0.45s ease-out forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .music-bar {
          animation: barWave 0.75s ease-in-out infinite alternate;
          height: 25%;
        }
        @keyframes barWave {
          0% { height: 18%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
