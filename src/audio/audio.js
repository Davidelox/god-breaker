// Sonido y música generados con Web Audio (sin archivos). Si el navegador no tiene audio, no hace nada.
import { logError } from '../core/errors.js';

const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const BPM = 76;
const BAR = (4 * 60) / BPM;

// Progresiones por clima: [nota raíz MIDI, 'm' menor | 'M' mayor]
const MOODS = [
  [[57, 'm'], [53, 'M'], [48, 'M'], [55, 'M']], // despejado: Am F C G
  [[50, 'm'], [46, 'M'], [53, 'M'], [48, 'M']], // lluvia: Dm Bb F C
  [[52, 'm'], [48, 'M'], [55, 'M'], [50, 'M']], // nieve: Em C G D
  [[50, 'm'], [51, 'M'], [50, 'm'], [48, 'M']], // arena: Dm Eb Dm C
  [[57, 'm'], [52, 'm'], [53, 'M'], [52, 'm']], // niebla: Am Em F Em
  [[48, 'M'], [55, 'M'], [57, 'm'], [53, 'M']] // sol: C G Am F
];

// Separación mínima entre repeticiones del mismo efecto (s), para que no sature.
const MIN_GAP = { fireHit: 0.06, splash: 0.06, zap: 0.05, frost: 0.06, rumble: 0.08, collect: 0.03, hit: 0.03, launch: 0.045, break: 0.025, shake: 0.08, click: 0.03 };

const SFX = {
  click: (a) => a.tone(660, 0.05, { type: 'square', gain: 0.05 }),
  launch: (a) => a.tone(520, 0.06, { type: 'triangle', gain: 0.05, slideTo: 760 }),
  hit: (a, o) =>
    o.boss
      ? a.tone(150, 0.09, { type: 'triangle', gain: 0.12, slideTo: 90 })
      : a.tone(360 + Math.random() * 140, 0.035, { type: 'square', gain: 0.035 }),
  break: (a) => {
    a.noise(0.12, { gain: 0.1, filter: 2600 });
    a.tone(320, 0.1, { type: 'square', gain: 0.05, slideTo: 120 });
  },
  breakCreature: (a) => {
    SFX.break(a);
    a.tone(880, 0.09, { type: 'triangle', gain: 0.07, delay: 0.04 });
  },
  bossBreak: (a) => {
    a.noise(0.7, { gain: 0.25, filter: 1200, sweepTo: 120 });
    a.tone(120, 0.6, { type: 'triangle', gain: 0.2, slideTo: 40 });
    [523, 659, 784, 1047].forEach((f, i) => a.tone(f, 0.12, { type: 'square', gain: 0.05, delay: 0.25 + i * 0.08 }));
  },
  bossAppear: (a) => {
    a.tone(110, 0.7, { type: 'triangle', gain: 0.12, slideTo: 220 });
    a.tone(165, 0.7, { type: 'triangle', gain: 0.08, slideTo: 330, delay: 0.1 });
  },
  pickup: (a) => {
    a.tone(988, 0.06, { type: 'square', gain: 0.04 });
    a.tone(1318, 0.08, { type: 'square', gain: 0.04, delay: 0.05 });
  },
  collect: (a, o) => a.tone(660 * 2 ** (Math.min(o.step ?? 0, 24) / 12), 0.07, { type: 'triangle', gain: 0.05 }),
  powerCast: (a) => {
    a.noise(0.5, { gain: 0.08, filter: 300, sweepTo: 3000, type: 'bandpass' });
    [523, 784, 1047].forEach((f, i) => a.tone(f, 0.25, { type: 'square', gain: 0.04, delay: 0.05 + i * 0.05 }));
  },
  fireHit: (a) => a.noise(0.18, { gain: 0.09, filter: 900, sweepTo: 200 }),
  splash: (a) => a.noise(0.14, { gain: 0.06, filter: 1800, type: 'bandpass', sweepTo: 600 }),
  zap: (a) => a.tone(1400, 0.06, { type: 'sawtooth', gain: 0.03, slideTo: 300 }),
  frost: (a) => a.tone(2093 + Math.random() * 400, 0.09, { type: 'triangle', gain: 0.04 }),
  rumble: (a) => {
    a.noise(0.35, { gain: 0.18, filter: 400, sweepTo: 80 });
    a.tone(90, 0.3, { type: 'triangle', gain: 0.12, slideTo: 45 });
  },
  mission: (a) => [784, 1047, 1319, 1568, 2093].forEach((f, i) => a.tone(f, 0.16, { type: 'triangle', gain: 0.06, delay: i * 0.07 })),
  vertical: (a) => {
    a.noise(0.6, { gain: 0.2, filter: 4000, sweepTo: 200 });
    a.tone(1800, 0.5, { type: 'square', gain: 0.06, slideTo: 120 });
    [523, 784, 1047, 1568].forEach((f, i) => a.tone(f, 0.14, { type: 'square', gain: 0.05, delay: 0.3 + i * 0.07 }));
  },
  shake: (a) => a.tone(240, 0.05, { type: 'triangle', gain: 0.07 }),
  capture: (a) => [523, 659, 784, 1047].forEach((f, i) => a.tone(f, 0.09, { type: 'square', gain: 0.05, delay: i * 0.07 })),
  shiny: (a) => [1047, 1319, 1568, 2093, 2637].forEach((f, i) => a.tone(f, 0.12, { type: 'triangle', gain: 0.07, delay: i * 0.05 })),
  escape: (a) => a.tone(420, 0.16, { type: 'triangle', gain: 0.07, slideTo: 200 }),
  power: (a) => [659, 988, 1319].forEach((f, i) => a.tone(f, 0.14, { type: 'triangle', gain: 0.07, delay: i * 0.06 })),
  reward: (a) => [784, 988, 1175, 1568].forEach((f, i) => a.tone(f, 0.12, { type: 'square', gain: 0.045, delay: i * 0.07 })),
  clear: (a) =>
    [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3], [784, 0.45], [1047, 0.55]].forEach(([f, d]) =>
      a.tone(f, 0.14, { type: 'square', gain: 0.05, delay: d })
    ),
  weather: (a) => a.noise(1.2, { gain: 0.05, filter: 500, sweepTo: 2200, type: 'bandpass' }),
  gameover: (a) => [392, 330, 262, 196].forEach((f, i) => a.tone(f, 0.3, { type: 'triangle', gain: 0.09, delay: i * 0.2 }))
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.mood = 0;
    this.last = {};
    this.failed = false;
  }

  configure({ music = true, sfx = true } = {}) {
    this.musicOn = music;
    this.sfxOn = sfx;
  }

  /** Debe llamarse desde un gesto del usuario (los navegadores bloquean el audio hasta entonces). */
  unlock() {
    if (this.failed) return;
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        this.failed = true;
        return;
      }
      const ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(ctx.destination);
      this.sfxGain = ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.master);
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = this.musicOn ? 0.5 : 0;
      this.musicFilter = ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.value = 1500;
      this.musicFilter.connect(this.musicGain);
      this.musicGain.connect(this.master);
      const len = ctx.sampleRate;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) ctx.suspend();
        else ctx.resume();
      });
      if (this.musicOn) this.startMusic();
    } catch (err) {
      this.failed = true;
      this.ctx = null;
      logError('audio', err);
    }
  }

  play(name, opts = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime;
    const gap = MIN_GAP[name] ?? 0;
    if (gap && now - (this.last[name] ?? -1) < gap) return;
    this.last[name] = now;
    try {
      SFX[name]?.(this, opts);
    } catch (err) {
      logError('audio-sfx', err, { name });
    }
  }

  tone(freq, dur, { type = 'square', gain = 0.1, attack = 0.005, slideTo = null, delay = 0, dest = this.sfxGain } = {}) {
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  noise(dur, { gain = 0.1, filter = 1500, sweepTo = null, delay = 0, type = 'lowpass' } = {}) {
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(filter, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ---------- Música ambiente generativa ----------

  setMood(i) {
    this.mood = ((i % MOODS.length) + MOODS.length) % MOODS.length;
  }

  setMusic(on) {
    this.musicOn = on;
    if (!this.ctx) return;
    this.musicGain.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.3);
    if (on) this.startMusic();
    else this.stopMusic();
  }

  setSfx(on) {
    this.sfxOn = on;
  }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    this.bar = 0;
    this.nextBar = this.ctx.currentTime + 0.2;
    this.musicTimer = setInterval(() => {
      try {
        while (this.nextBar < this.ctx.currentTime + 0.8) {
          this.playBar(this.nextBar);
          this.nextBar += BAR;
          this.bar++;
        }
      } catch (err) {
        logError('audio-music', err);
        this.stopMusic();
      }
    }, 250);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  pad(m, t, dur, gain) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = midi(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.9);
    g.gain.setValueAtTime(gain, t + dur - 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
    osc.connect(g).connect(this.musicFilter);
    osc.start(t);
    osc.stop(t + dur + 1.3);
  }

  playBar(t) {
    const [root, q] = MOODS[this.mood][this.bar % 4];
    const chord = [root, root + (q === 'm' ? 3 : 4), root + 7];
    for (const n of chord) this.pad(n, t, BAR, 0.022);
    // Bajo suave
    for (const off of [0, BAR / 2]) {
      this.tone(midi(root - 12), 1.2, { type: 'triangle', gain: 0.045, attack: 0.03, delay: t + off - this.ctx.currentTime, dest: this.musicFilter });
    }
    // Arpegio disperso
    for (let i = 0; i < 8; i++) {
      if (Math.random() > 0.38) continue;
      const n = chord[Math.floor(Math.random() * 3)] + (Math.random() < 0.5 ? 12 : 24);
      this.tone(midi(n), 0.4, { type: 'triangle', gain: 0.02, attack: 0.01, delay: t + (i * BAR) / 8 - this.ctx.currentTime, dest: this.musicFilter });
    }
  }
}

export const audio = new AudioEngine();
