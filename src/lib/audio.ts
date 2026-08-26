/**
 * Audio manager
 * - Louder music + SFX
 * - Recognizable Happy Birthday melody
 * - Speaks "Happy Birthday… Esha" with Web Speech API in sync with phrases
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
  private speechTimer: ReturnType<typeof setTimeout> | null = null;
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
      this.musicGain.gain.value = 0.88;
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
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
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

  /** Speak “Happy Birthday Esha” clearly */
  speakHappyBirthday() {
    if (typeof window === "undefined" || this.muted) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();

    const lines = [
      { text: "Happy Birthday to you", rate: 0.88 },
      { text: "Happy Birthday to you", rate: 0.88 },
      { text: "Happy Birthday dear Esha", rate: 0.85 },
      { text: "Happy Birthday to you", rate: 0.88 },
    ];

    let delay = 400;
    lines.forEach((line) => {
      this.speechTimer = setTimeout(() => {
        if (this.muted || !this.musicPlaying) return;
        const u = new SpeechSynthesisUtterance(line.text);
        u.rate = line.rate;
        u.pitch = 1.05;
        u.volume = 1;
        // prefer a soft English voice if available
        const voices = synth.getVoices();
        const preferred =
          voices.find((v) => /en(-|_)?(US|GB|IN)?/i.test(v.lang) && /female|samantha|google|zira|linda/i.test(v.name)) ||
          voices.find((v) => /^en/i.test(v.lang)) ||
          null;
        if (preferred) u.voice = preferred;
        synth.speak(u);
      }, delay);
      delay += 3200;
    });
  }

  async startMusic() {
    await this.ensureResumed();
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;

    this.musicPlaying = true;
    this.musicStarted = true;

    // try real mp3 first
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
        // still speak name once over the track
        if (!this.spokenOnce) {
          this.spokenOnce = true;
          setTimeout(() => this.speakHappyBirthday(), 800);
        }
        return;
      }
    } catch {
      // synth fallback
    }

    this.playHappyBirthdaySynth();
    if (!this.spokenOnce) {
      this.spokenOnce = true;
      // voice sits with the melody phrases
      setTimeout(() => this.speakHappyBirthday(), 600);
    }
  }

  /** Classic Happy Birthday melody (C major), looped, louder */
  private playHappyBirthdaySynth() {
    if (!this.ctx || !this.musicGain) return;

    // Happy Birthday to you / to you / dear Esha / to you
    const phrase: { f: number; d: number }[] = [
      // Happy birthday to you
      { f: 261.63, d: 0.28 }, // C
      { f: 261.63, d: 0.28 }, // C
      { f: 293.66, d: 0.55 }, // D
      { f: 261.63, d: 0.55 }, // C
      { f: 349.23, d: 0.55 }, // F
      { f: 329.63, d: 1.05 }, // E
      // Happy birthday to you
      { f: 261.63, d: 0.28 },
      { f: 261.63, d: 0.28 },
      { f: 293.66, d: 0.55 },
      { f: 261.63, d: 0.55 },
      { f: 392.0, d: 0.55 }, // G
      { f: 349.23, d: 1.05 }, // F
      // Happy birthday dear E-sha
      { f: 261.63, d: 0.28 },
      { f: 261.63, d: 0.28 },
      { f: 523.25, d: 0.55 }, // C5
      { f: 440.0, d: 0.55 }, // A
      { f: 349.23, d: 0.55 }, // F
      { f: 329.63, d: 0.55 }, // E
      { f: 293.66, d: 0.9 }, // D
      // Happy birthday to you
      { f: 466.16, d: 0.28 }, // Bb
      { f: 466.16, d: 0.28 },
      { f: 440.0, d: 0.55 }, // A
      { f: 349.23, d: 0.55 }, // F
      { f: 392.0, d: 0.55 }, // G
      { f: 349.23, d: 1.15 }, // F
    ];

    const scheduleLoop = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      let time = this.ctx.currentTime + 0.05;
      const startT = time;

      phrase.forEach((n) => {
        // lead
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.value = n.f;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.28, time + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, time + n.d);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(time);
        osc.stop(time + n.d + 0.04);

        // soft upper harmony
        const h = this.ctx!.createOscillator();
        const hg = this.ctx!.createGain();
        h.type = "sine";
        h.frequency.value = n.f * 2;
        hg.gain.setValueAtTime(0, time);
        hg.gain.linearRampToValueAtTime(0.08, time + 0.04);
        hg.gain.exponentialRampToValueAtTime(0.001, time + n.d);
        h.connect(hg);
        hg.connect(this.musicGain!);
        h.start(time);
        h.stop(time + n.d + 0.04);

        time += n.d * 0.92;
      });

      // warm bass pad under phrase
      const pad = this.ctx.createOscillator();
      const pg = this.ctx.createGain();
      pad.type = "sine";
      pad.frequency.value = 130.81;
      pg.gain.setValueAtTime(0, startT);
      pg.gain.linearRampToValueAtTime(0.09, startT + 0.3);
      pg.gain.linearRampToValueAtTime(0.001, time + 0.2);
      pad.connect(pg);
      pg.connect(this.musicGain);
      pad.start(startT);
      pad.stop(time + 0.3);

      const durationMs = Math.max(400, (time - this.ctx.currentTime) * 1000 - 200);
      this.synthTimer = setTimeout(() => {
        scheduleLoop();
        // re-sing every other loop
        if (this.musicPlaying && !this.muted) {
          this.speakHappyBirthday();
        }
      }, durationMs);
    };

    scheduleLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);
    if (this.speechTimer) clearTimeout(this.speechTimer);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        // already stopped
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
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 850;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.65, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);
    } else if (type === "gift") {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        g.gain.setValueAtTime(0, now + i * 0.08);
        g.gain.linearRampToValueAtTime(0.32, now + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.55);
      });
    } else if (type === "envelope") {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(640, now + 0.15);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "firework") {
      const bufferSize = this.ctx.sampleRate * 0.9;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.14));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1100;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.48, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);
    } else if (type === "click") {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.value = 900;
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "whoosh") {
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (i / bufferSize) * Math.exp(-i / (bufferSize * 0.5));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const g = this.ctx.createGain();
      g.gain.value = 0.4;
      noise.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);
    }
  }

  isMusicStarted() {
    return this.musicStarted;
  }
}

export const audio = new AudioManager();
