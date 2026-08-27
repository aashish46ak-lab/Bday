"use client";

import { useState, useEffect } from "react";
import { audio } from "@/lib/audio";

export default function SoundController() {
  const [muted, setMuted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => {
        const next = !muted;
        setMuted(next);
        audio.setMuted(next);
      }}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full border border-white/40 bg-white/25 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-sm"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </button>
  );
}
