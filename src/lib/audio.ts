/** Calm Happy Birthday instrumental — slower tempo, no voice */

type SoundType = "blow" | "gift" | "envelope" | "firework" | "click" | "whoosh";

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicPlaying = false;
  private musicStarted = false;
  private muted = false;
  private synthTimer: ReturnType<typeof setTimeout> | null = null;

  init() {
    if (typeof window === "undefined") return;
    if (this.ctx) return;
    try {
      const Win = window as WebkitWindow;
      const Ctx = window.AudioContext || Win.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.8;
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn("AudioContext not available", e);
    }
  }

  async ensureResumed() {
    this.init();
    if (this.ctx?.state === "suspended") await this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  isMuted() {
    return this.muted;
  }

  async startMusic() {
    await this.ensureResumed();
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;
    this.musicPlaying = true;
    this.musicStarted = true;

    try {
      const res = await fetch("/audio/birthday-theme.mp3");
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const audioBuf = await this.ctx.decodeAudioData(buf);
        const src = this.ctx.createBufferSource();
        src.buffer = audioBuf;
        src.loop = true;
        src.connect(this.musicGain);
        src.start();
        this.musicSource = src;
        return;
      }
    } catch {
      /* synth */
    }

    this.playHappyBirthdayTune();
  }

  /** Calmer Happy Birthday (~60 BPM feel) */
  private playHappyBirthdayTune() {
    if (!this.ctx || !this.musicGain) return;

    const B = 0.70; // calmer ~60 BPM feel
    const C4 = 261.63,
      D4 = 293.66,
      E4 = 329.63,
      F4 = 349.23,
      G4 = 392.0,
      A4 = 440.0,
      Bb4 = 466.16,
      C5 = 523.25;

    const notes: [number, number][] = [
      [C4, 0.75],
      [C4, 0.25],
      [D4, 1],
      [C4, 1],
      [F4, 1],
      [E4, 2.2],
      [C4, 0.75],
      [C4, 0.25],
      [D4, 1],
      [C4, 1],
      [G4, 1],
      [F4, 2.2],
      [C4, 0.75],
      [C4, 0.25],
      [C5, 1],
      [A4, 1],
      [F4, 1],
      [E4, 1],
      [D4, 2.2],
      [Bb4, 0.75],
      [Bb4, 0.25],
      [A4, 1],
      [F4, 1],
      [G4, 1],
      [F4, 2.5],
    ];

    const playPhrase = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      let t = this.ctx.currentTime + 0.08;

      notes.forEach(([freq, beats]) => {
        const dur = beats * B;
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.06);
        g.gain.linearRampToValueAtTime(0.14, t + dur * 0.55);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(t);
        osc.stop(t + dur + 0.03);

        const h = this.ctx!.createOscillator();
        const hg = this.ctx!.createGain();
        h.type = "triangle";
        h.frequency.value = freq * 2;
        hg.gain.setValueAtTime(0, t);
        hg.gain.linearRampToValueAtTime(0.04, t + 0.05);
        hg.gain.exponentialRampToValueAtTime(0.001, t + dur);
        h.connect(hg);
        hg.connect(this.musicGain!);
        h.start(t);
        h.stop(t + dur + 0.03);

        t += dur;
      });

      const wait = Math.max(400, (t - this.ctx.currentTime) * 1000 + 900);
      this.synthTimer = setTimeout(playPhrase, wait);
    };

    playPhrase();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        /* */
      }
      this.musicSource = null;
    }
  }

  fadeMusic(to: number, duration = 1.5) {
    if (!this.musicGain || !this.ctx) return;
    this.musicGain.gain.setTargetAtTime(to, this.ctx.currentTime, duration / 3);
  }

  playSfx(type: SoundType) {
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t0 = this.ctx.currentTime;
    if (type === "blow") {
      const n = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.35, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.25));
      n.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.45, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      n.connect(f);
      f.connect(g);
      g.connect(this.sfxGain);
      n.start(t0);
    } else if (type === "gift" || type === "envelope") {
      [523, 659, 784].forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t0 + i * 0.08);
        g.gain.linearRampToValueAtTime(0.18, t0 + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.08 + 0.4);
        o.connect(g);
        g.connect(this.sfxGain!);
        o.start(t0 + i * 0.08);
        o.stop(t0 + i * 0.08 + 0.45);
      });
    } else if (type === "firework") {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(200, t0);
      o.frequency.exponentialRampToValueAtTime(80, t0 + 0.5);
      g.gain.setValueAtTime(0.2, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(t0);
      o.stop(t0 + 0.55);
    } else {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.frequency.value = type === "whoosh" ? 180 : 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.12, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(t0);
      o.stop(t0 + 0.2);
    }
  }
}

export const audio = new AudioManager();
