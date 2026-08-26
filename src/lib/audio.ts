/**
 * Real Happy Birthday tempo + clear melody (not dull drone).
 * Speech: "Happy Birthday to you / dear Esha"
 */

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
  private speechTimers: ReturnType<typeof setTimeout>[] = [];
  private spokenOnce = false;

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
      this.musicGain.gain.value = 0.9;
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1;
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
    if (muted && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  isMuted() {
    return this.muted;
  }

  private clearSpeech() {
    this.speechTimers.forEach(clearTimeout);
    this.speechTimers = [];
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  speakHappyBirthday() {
    if (typeof window === "undefined" || this.muted) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    this.clearSpeech();

    // Timed with classic phrase lengths (~3s each)
    const lines = [
      { text: "Happy birthday to you", at: 200 },
      { text: "Happy birthday to you", at: 3400 },
      { text: "Happy birthday dear Esha", at: 6600 },
      { text: "Happy birthday to you", at: 10200 },
    ];

    lines.forEach((line) => {
      const t = setTimeout(() => {
        if (this.muted || !this.musicPlaying) return;
        const u = new SpeechSynthesisUtterance(line.text);
        u.rate = 0.92;
        u.pitch = 1.08;
        u.volume = 1;
        const voices = synth.getVoices();
        const preferred =
          voices.find(
            (v) =>
              /en/i.test(v.lang) &&
              /female|samantha|google|zira|karen|moira|veena|raveena/i.test(v.name)
          ) || voices.find((v) => /^en/i.test(v.lang));
        if (preferred) u.voice = preferred;
        synth.speak(u);
      }, line.at);
      this.speechTimers.push(t);
    });
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
        if (!this.spokenOnce) {
          this.spokenOnce = true;
          this.speakHappyBirthday();
        }
        return;
      }
    } catch {
      /* synth */
    }

    this.playHappyBirthdayTune();
    if (!this.spokenOnce) {
      this.spokenOnce = true;
      this.speakHappyBirthday();
    }
  }

  /**
   * Classic Happy Birthday in C — proper note lengths so it feels like the song,
   * not a flat lesson tone.
   * Beat unit ~0.38s (lively party tempo)
   */
  private playHappyBirthdayTune() {
    if (!this.ctx || !this.musicGain) return;

    const B = 0.38; // beat
    // pitch Hz
    const C4 = 261.63,
      D4 = 293.66,
      E4 = 329.63,
      F4 = 349.23,
      G4 = 392.0,
      A4 = 440.0,
      Bb4 = 466.16,
      C5 = 523.25;

    // [freq, beats] — real Happy Birthday rhythm
    const notes: [number, number][] = [
      // Happy birth-day to you
      [C4, 0.75],
      [C4, 0.25],
      [D4, 1],
      [C4, 1],
      [F4, 1],
      [E4, 2],
      // Happy birth-day to you
      [C4, 0.75],
      [C4, 0.25],
      [D4, 1],
      [C4, 1],
      [G4, 1],
      [F4, 2],
      // Happy birth-day dear E-sha
      [C4, 0.75],
      [C4, 0.25],
      [C5, 1],
      [A4, 1],
      [F4, 1],
      [E4, 1],
      [D4, 2],
      // Happy birth-day to you
      [Bb4, 0.75],
      [Bb4, 0.25],
      [A4, 1],
      [F4, 1],
      [G4, 1],
      [F4, 2.2],
    ];

    const playPhrase = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      let t = this.ctx.currentTime + 0.06;

      notes.forEach(([freq, beats]) => {
        const dur = beats * B;
        // bright lead (not dull triangle alone)
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        // slight pluck attack so notes pop
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.32, t + 0.025);
        g.gain.linearRampToValueAtTime(0.22, t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(t);
        osc.stop(t + dur + 0.02);

        // quiet fifth for body
        const h = this.ctx!.createOscillator();
        const hg = this.ctx!.createGain();
        h.type = "triangle";
        h.frequency.value = freq * 1.5;
        hg.gain.setValueAtTime(0, t);
        hg.gain.linearRampToValueAtTime(0.06, t + 0.03);
        hg.gain.exponentialRampToValueAtTime(0.001, t + dur);
        h.connect(hg);
        hg.connect(this.musicGain!);
        h.start(t);
        h.stop(t + dur + 0.02);

        t += dur;
      });

      const wait = Math.max(300, (t - this.ctx.currentTime) * 1000 + 400);
      this.synthTimer = setTimeout(() => {
        playPhrase();
        if (this.musicPlaying && !this.muted) this.speakHappyBirthday();
      }, wait);
    };

    playPhrase();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);
    this.clearSpeech();
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
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(to, this.ctx.currentTime + duration);
    }
  }

  playSfx(type: SoundType) {
    if (!this.ctx || !this.sfxGain || this.muted) return;
    this.ensureResumed();
    const now = this.ctx.currentTime;

    if (type === "blow") {
      const n = this.ctx.sampleRate * 0.75;
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.28));
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 900;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.7, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxGain);
      src.start(now);
    } else if (type === "gift") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, now + i * 0.08);
        g.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
        o.connect(g);
        g.connect(this.sfxGain!);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.5);
      });
    } else if (type === "envelope") {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(400, now);
      o.frequency.linearRampToValueAtTime(620, now + 0.14);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(now);
      o.stop(now + 0.35);
    } else if (type === "firework") {
      const n = this.ctx.sampleRate * 0.85;
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.14));
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 1100;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.45, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxGain);
      src.start(now);
    } else if (type === "click") {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(now);
      o.stop(now + 0.1);
    } else if (type === "whoosh") {
      const n = this.ctx.sampleRate * 0.45;
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++)
        d[i] = (Math.random() * 2 - 1) * (i / n) * Math.exp(-i / (n * 0.5));
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.value = 0.38;
      src.connect(g);
      g.connect(this.sfxGain);
      src.start(now);
    }
  }

  isMusicStarted() {
    return this.musicStarted;
  }
}

export const audio = new AudioManager();
