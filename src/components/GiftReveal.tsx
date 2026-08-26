"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";
import { SITE_CONFIG } from "@/lib/config";

interface Props {
  onAllExplored: () => void;
}

const WISHES = [
  { title: "Happiness", text: "May joy find you in the quiet moments and the loud ones alike." },
  { title: "Success", text: "May every step you take lead somewhere beautiful." },
  { title: "Adventures", text: "May the year ahead be full of stories worth telling." },
  { title: "Peace", text: "May your heart stay light and your mind stay kind to itself." },
  { title: "Dreams", text: "May the things you hope for quietly start becoming real." },
  { title: "Good memories", text: "May this year give you more reasons to smile when you look back." },
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
        setTimeout(() => setFinalUnlocked(true), 600);
      }
      return next;
    });
  };

  const openMessage = () => {
    audio.playSfx("envelope");
    setShowMessage(true);
    mark("message");
  };

  const openMusic = () => {
    audio.playSfx("click");
    setShowMusic(true);
    mark("music");
  };

  const openWishes = () => {
    audio.playSfx("click");
    setShowWishes(true);
    mark("wishes");
  };

  const openFinal = () => {
    if (!finalUnlocked) return;
    audio.playSfx("whoosh");
    onAllExplored();
  };

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <h2 className="text-center text-2xl text-[#f5e6c8] font-light mb-8">Inside your gift</h2>

        <button onClick={openMessage} className="w-full text-left p-5 rounded-2xl border border-[#e8c87a]/25 bg-[#0a0f1c]/80 backdrop-blur-sm hover:border-[#e8c87a]/50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💌</span>
            <div>
              <p className="text-[#f5e6c8] font-medium">A Little Message</p>
              <p className="text-xs text-[#c9b8e8]/60">Open the card</p>
            </div>
          </div>
          {showMessage && (
            <div className="mt-4 pt-4 border-t border-[#e8c87a]/20 text-[#f5e6c8]/90 text-sm leading-relaxed space-y-3 animate-fade">
              <p>Dear Esha,</p>
              <p>On this special day, I hope the sky feels a little brighter and the world a little kinder just for you.</p>
              <p>May your year ahead be filled with quiet joys, unexpected laughter, and everything that makes you feel most like yourself.</p>
              <p className="italic text-[#e8c87a]">Happy Birthday. ✨</p>
            </div>
          )}
        </button>

        <button onClick={openMusic} className="w-full text-left p-5 rounded-2xl border border-[#e8c87a]/25 bg-[#0a0f1c]/80 backdrop-blur-sm hover:border-[#e8c87a]/50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎵</span>
            <div>
              <p className="text-[#f5e6c8] font-medium">Your Birthday Tune</p>
              <p className="text-xs text-[#c9b8e8]/60">{SITE_CONFIG.music.title}</p>
            </div>
          </div>
          {showMusic && (
            <div className="mt-4 pt-4 border-t border-[#e8c87a]/20 animate-fade">
              <div className="flex items-end gap-1 h-10 mb-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#e8c87a] to-[#e8b4c8] music-bar" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <p className="text-xs text-[#c9b8e8]/70">Playing softly in the background · Enjoy the moment</p>
            </div>
          )}
        </button>

        <button onClick={openWishes} className="w-full text-left p-5 rounded-2xl border border-[#e8c87a]/25 bg-[#0a0f1c]/80 backdrop-blur-sm hover:border-[#e8c87a]/50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-[#f5e6c8] font-medium">Birthday Wishes</p>
              <p className="text-xs text-[#c9b8e8]/60">Little stars for you</p>
            </div>
          </div>
          {showWishes && (
            <div className="mt-4 pt-4 border-t border-[#e8c87a]/20 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade">
              {WISHES.map((w) => (
                <div key={w.title} className="p-3 rounded-xl bg-[#050509]/60 border border-[#c9b8e8]/15">
                  <p className="text-[#e8c87a] text-sm font-medium mb-1">{w.title}</p>
                  <p className="text-xs text-[#f5e6c8]/75 leading-snug">{w.text}</p>
                </div>
              ))}
            </div>
          )}
        </button>

        <button
          onClick={openFinal}
          disabled={!finalUnlocked}
          className={`w-full text-left p-5 rounded-2xl border transition-all ${
            finalUnlocked
              ? "border-[#e8c87a]/50 bg-[#0a0f1c]/80 hover:border-[#e8c87a] cursor-pointer"
              : "border-[#ffffff]/10 bg-[#0a0f1c]/40 opacity-60 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{finalUnlocked ? "🔓" : "🔐"}</span>
            <div>
              <p className="text-[#f5e6c8] font-medium">One Last Thing</p>
              <p className="text-xs text-[#c9b8e8]/60">
                {finalUnlocked ? "There&apos;s still one last surprise..." : "Explore the other gifts first"}
              </p>
            </div>
          </div>
        </button>
      </div>

      <style jsx>{`
        .animate-fade { animation: fadeUp 0.5s ease-out forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .music-bar { animation: barWave 0.8s ease-in-out infinite alternate; height: 30%; }
        @keyframes barWave {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
