// Sonido y música generados con Web Audio (sin archivos). Si el navegador no tiene audio, no hace nada.
import { logError } from '../core/errors.js';

const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const BPM = 76;
const BAR = (4 * 60) / BPM;
// Pista de combate (dentro de la partida): más rápida, con tambores, ostinato y metales.
const BATTLE_BPM = 112;
const BATTLE_BAR = (4 * 60) / BATTLE_BPM;
const S16 = BATTLE_BAR / 16; // semicorchea

// Melodía heroica por compases, en grados del acorde: r raíz, 3 tercera, 5 quinta, 8 octava, 9 novena.
// Cada nota: [inicio en semicorcheas, grado, duración en semicorcheas]
const MOTIFS = [
  [[0, '5', 3], [3, '5', 1], [4, '8', 6], [10, '9', 2], [12, '5', 4]],
  [[0, '3', 4], [4, '5', 2], [6, '3', 2], [8, 'r', 8]],
  [[0, '5', 3], [3, '5', 1], [4, '8', 4], [8, '9', 4], [12, '8', 4]],
  [[0, '9', 4], [4, '5', 4], [8, '3', 2], [10, '5', 2], [12, 'r', 4]]
];
const DEGREE = { r: 0, 5: 7, 8: 12, 9: 14 };
const degree = (d, q) => (d === '3' ? (q === 'm' ? 3 : 4) : DEGREE[d]);
// Tambores por compás (semicorcheas): bombo grave (taiko), caja y charles
const KICK = [0, 3, 6, 8, 10, 11];
const SNARE = [4, 12];

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

// Fin de partida: compases lentos en la menor y una melodía que baja (notas MIDI; null = silencio)
const DEFEAT_BAR = 3.2;
const DEFEAT_CHORDS = [[57, 'm'], [53, 'M'], [50, 'm'], [52, 'M']];
const DEFEAT_MELODY = [
  [76, 74, 72, null],
  [72, 71, 69, null],
  [69, 67, 65, 64],
  [64, null, 68, null]
];

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.mood = 0;
    this.track = 'ambient';
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
      this.musicFilter.frequency.value = this.track === 'battle' ? 4200 : 1500;
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

  tone(freq, dur, { type = 'square', gain = 0.1, attack = 0.005, slideTo = null, delay = 0, dest = this.sfxGain, detune = 0 } = {}) {
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    if (detune) osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  noise(dur, { gain = 0.1, filter = 1500, sweepTo = null, delay = 0, type = 'lowpass', dest = this.sfxGain } = {}) {
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
    src.connect(f).connect(g).connect(dest);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ---------- Música ambiente generativa ----------

  setMood(i) {
    this.mood = ((i % MOODS.length) + MOODS.length) % MOODS.length;
  }

  /** 'ambient' (menús), 'battle' (partida) o 'defeat' (fin de partida). Entra al momento, desde el compás 0. */
  setTrack(name) {
    if (this.track === name) return;
    this.track = name;
    if (!this.ctx) return;
    this.musicFilter.frequency.setTargetAtTime(name === 'battle' ? 4200 : name === 'defeat' ? 1100 : 1500, this.ctx.currentTime, 0.2);
    if (this.musicTimer) {
      this.bar = 0;
      this.nextBar = this.ctx.currentTime + 0.12;
    }
  }

  barLen() {
    return this.track === 'battle' ? BATTLE_BAR : this.track === 'defeat' ? DEFEAT_BAR : BAR;
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
    this.beat = 0;
    this.nextBar = this.ctx.currentTime + 0.2;
    this.musicTimer = setInterval(() => {
      try {
        const now = this.ctx.currentTime;
        if (this.track === 'battle') {
          // La pista de combate se programa pulso a pulso (no el compás entero de golpe),
          // para repartir la creación de nodos de audio y no dar tirones en móvil.
          while (this.nextBar + (this.beat * BATTLE_BAR) / 4 < now + 0.5) {
            this.playBattleBar(this.nextBar, this.beat);
            if (++this.beat === 4) {
              this.beat = 0;
              this.nextBar += BATTLE_BAR;
              this.bar++;
            }
          }
          return;
        }
        this.beat = 0;
        while (this.nextBar < now + 0.8) {
          if (this.track === 'defeat') this.playDefeatBar(this.nextBar);
          else this.playBar(this.nextBar);
          this.nextBar += this.barLen();
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

  // ---------- Pista de combate ----------

  /** Nota con timbre de metal/cuerda: diente de sierra con filtro que se abre y se cierra. */
  brass(m, t, dur, gain, { cutoff = 1600, attack = 0.03, type = 'sawtooth', detune = 0 } = {}) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = midi(m);
    osc.detune.value = detune;
    f.type = 'lowpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(cutoff * 0.35, t);
    f.frequency.linearRampToValueAtTime(cutoff, t + attack + 0.05);
    f.frequency.exponentialRampToValueAtTime(cutoff * 0.5, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.setValueAtTime(gain, t + Math.max(attack, dur - 0.06));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    osc.connect(f).connect(g).connect(this.musicFilter);
    osc.start(t);
    osc.stop(t + dur + 0.2);
  }

  /** Tambor grave tipo taiko: seno que cae de tono. */
  kick(t, gain = 0.32) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.28);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    osc.connect(g).connect(this.musicFilter);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  /** Filtros compartidos de la pista de combate (uno por grupo en vez de uno por nota). */
  battleBuses() {
    if (this.buses) return this.buses;
    const ctx = this.ctx;
    const bus = (type, freq) => {
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.connect(this.musicFilter);
      return f;
    };
    this.buses = { ost: bus('lowpass', 2400), bass: bus('lowpass', 520), hat: bus('highpass', 7000) };
    return this.buses;
  }

  /** Charles: ráfaga corta de ruido hacia el filtro compartido. */
  hat(t, gain) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(g).connect(this.battleBuses().hat);
    src.start(t, Math.random() * 0.5);
    src.stop(t + 0.06);
  }

  /** Programa un pulso (beat 0-3) del compás que empieza en t. */
  playBattleBar(t, beat = 0) {
    const now = this.ctx.currentTime;
    const bar = this.bar;
    const [root, q] = MOODS[this.mood][bar % 4];
    const third = root + (q === 'm' ? 3 : 4);
    const section = Math.floor(bar / 4) % 4; // 0 entrada, 1 y 2 melodía, 3 puente más intenso
    const lastBeat = bar % 4 === 3;
    const lo = beat * 4, hi = lo + 4; // semicorcheas de este pulso
    const inBeat = (s) => s >= lo && s < hi;
    const buses = this.battleBuses();

    // Tambores
    for (const s of KICK) if (inBeat(s)) this.kick(t + s * S16, s === 0 ? 0.34 : 0.22);
    if (section > 0) for (const s of SNARE) if (inBeat(s)) this.noise(0.16, { gain: 0.11, filter: 1900, type: 'bandpass', delay: t + s * S16 - now, dest: this.musicFilter });
    for (let s = lo; s < hi; s += section === 3 ? 1 : 2) this.hat(t + s * S16, s % 4 === 0 ? 0.035 : 0.02);
    // Redoble al final de cada frase de 4 compases
    if (lastBeat && beat === 3) for (let s = 12; s < 16; s++) this.kick(t + s * S16, 0.16 + (s - 12) * 0.04);

    // Bajo en corcheas (octava baja de la raíz)
    for (let s = lo; s < hi; s += 2) this.tone(midi(root - 12), S16 * 1.6, { type: 'sawtooth', gain: 0.05, attack: 0.01, delay: t + s * S16 - now, dest: buses.bass });

    // Ostinato de cuerdas en semicorcheas: raíz, quinta, octava, quinta
    const ost = [root, root + 7, root + 12, root + 7];
    for (let s = lo; s < hi; s++) {
      this.tone(midi(ost[s % 4] + 12), S16 * 0.7, { type: 'sawtooth', gain: s % 4 === 0 ? 0.026 : 0.019, attack: 0.008, delay: t + s * S16 - now, dest: buses.ost });
    }

    // Acorde largo de metales (quinta vacía + octava) y coro suave, al empezar el compás
    if (beat === 0) {
      for (const n of [root, root + 7, root + 12]) this.brass(n, t, BATTLE_BAR * 0.96, 0.022, { cutoff: 1100, attack: 0.18 });
      for (const [n, det] of [[third + 12, -6], [third + 12, 6], [root + 19, 0]]) {
        this.tone(midi(n), BATTLE_BAR, { type: 'triangle', gain: 0.012, attack: 0.4, delay: t - now, dest: buses.ost, detune: det });
      }
    }

    // Melodía heroica (en la entrada solo suena el ritmo)
    if (section > 0) {
      const motif = MOTIFS[(bar % 4 + (section === 3 ? 2 : 0)) % MOTIFS.length];
      for (const [s, d, len] of motif) {
        if (!inBeat(s)) continue;
        const n = root + 12 + degree(d, q);
        const dur = len * S16 * 0.95;
        this.brass(n, t + s * S16, dur, 0.06, { cutoff: section === 3 ? 3200 : 2400, attack: 0.025 });
        // Segunda voz una octava abajo en el puente
        if (section === 3) this.brass(n - 12, t + s * S16, dur, 0.035, { cutoff: 1600, attack: 0.025 });
      }
    }
  }

  /**
   * Música de derrota: lenta, en la menor (Am - F - Dm - E), con coro suave, bajo largo, un timbal
   * apagado al empezar cada compás y una melodía de trompa que desciende.
   */
  playDefeatBar(t) {
    const now = this.ctx.currentTime;
    const [root, q] = DEFEAT_CHORDS[this.bar % 4];
    const chord = [root, root + (q === 'm' ? 3 : 4), root + 7];
    for (const n of chord) this.pad(n, t, DEFEAT_BAR, 0.026);
    this.tone(midi(root - 12), DEFEAT_BAR * 0.9, { type: 'triangle', gain: 0.06, attack: 0.08, delay: t - now, dest: this.musicFilter });
    this.kick(t, 0.16);
    const line = DEFEAT_MELODY[this.bar % 4];
    line.forEach((n, i) => {
      if (n == null) return;
      this.brass(n, t + (i * DEFEAT_BAR) / line.length, (DEFEAT_BAR / line.length) * 0.95, 0.04, { cutoff: 900, attack: 0.08, type: 'triangle' });
    });
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
