/**
 * Audio manager — louder levels + richer synth birthday theme.
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
  private musicSource: AudioBufferSourceNode | OscillatorNode | null = null;
  private musicPlaying = false;
  private musicStarted = false;
  private muted = false;

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
      this.musicGain.gain.value = 0.82;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.95;
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
      // fall through to synth
    }

    this.playSynthLoop();
  }

  private playSynthLoop() {
    if (!this.ctx || !this.musicGain) return;

    // fuller arrangement — melody + soft harmony + bass
    const melody = [
      { f: 261.63, d: 0.32 },
      { f: 261.63, d: 0.32 },
      { f: 293.66, d: 0.64 },
      { f: 261.63, d: 0.64 },
      { f: 349.23, d: 0.64 },
      { f: 329.63, d: 1.1 },
      { f: 261.63, d: 0.32 },
      { f: 261.63, d: 0.32 },
      { f: 293.66, d: 0.64 },
      { f: 261.63, d: 0.64 },
      { f: 392.0, d: 0.64 },
      { f: 349.23, d: 1.1 },
      { f: 261.63, d: 0.32 },
      { f: 261.63, d: 0.32 },
      { f: 523.25, d: 0.64 },
      { f: 440.0, d: 0.64 },
      { f: 349.23, d: 0.64 },
      { f: 329.63, d: 0.64 },
      { f: 293.66, d: 1.0 },
      { f: 466.16, d: 0.32 },
      { f: 466.16, d: 0.32 },
      { f: 440.0, d: 0.64 },
      { f: 349.23, d: 0.64 },
      { f: 392.0, d: 0.64 },
      { f: 349.23, d: 1.2 },
    ];

    let time = this.ctx.currentTime + 0.08;
    const schedule = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      const startT = time;

      melody.forEach((n) => {
        // main voice
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.value = n.f;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.22, time + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, time + n.d);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(time);
        osc.stop(time + n.d + 0.05);

        // soft octave shimmer
        const o2 = this.ctx!.createOscillator();
        const g2 = this.ctx!.createGain();
        o2.type = "sine";
        o2.frequency.value = n.f * 2;
        g2.gain.setValueAtTime(0, time);
        g2.gain.linearRampToValueAtTime(0.06, time + 0.05);
        g2.gain.exponentialRampToValueAtTime(0.001, time + n.d);
        o2.connect(g2);
        g2.connect(this.musicGain!);
        o2.start(time);
        o2.stop(time + n.d + 0.05);

        time += n.d * 0.88;
      });

      // warm pad under whole phrase
      const pad = this.ctx.createOscillator();
      const pg = this.ctx.createGain();
      pad.type = "sine";
      pad.frequency.value = 130.81;
      pg.gain.setValueAtTime(0, startT);
      pg.gain.linearRampToValueAtTime(0.07, startT + 0.4);
      pg.gain.linearRampToValueAtTime(0.001, time + 0.3);
      pad.connect(pg);
      pg.connect(this.musicGain);
      pad.start(startT);
      pad.stop(time + 0.4);

      setTimeout(schedule, Math.max(200, (time - this.ctx.currentTime) * 1000 - 250));
    };
    schedule();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicSource) {
      try {
        (this.musicSource as AudioBufferSourceNode).stop();
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
      const bufferSize = this.ctx.sampleRate * 0.75;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.55, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
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
        g.gain.linearRampToValueAtTime(0.28, now + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.5);
      });
    } else if (type === "envelope") {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(620, now + 0.15);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "firework") {
      const bufferSize = this.ctx.sampleRate * 0.85;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.14));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1000;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);
    } else if (type === "click") {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "whoosh") {
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (i / bufferSize) * Math.exp(-i / (bufferSize * 0.5));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const g = this.ctx.createGain();
      g.gain.value = 0.35;
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
