// Bolas de captura, recompensas y poderes aleatorios (lógica pura, sin Phaser: se puede testear).
import { SPECIALS } from './specials.js';

export const BALL_TYPES = {
  normal: { id: 'normal', name: 'Normal', fill: 0xf8f8f8, tint: null, rates: { normal: 0.4, legendary: 0.1 } },
  super: { id: 'super', name: 'Super', fill: 0x8cd0ff, tint: 0x8cd0ff, rates: { normal: 0.7, legendary: 0.3 } },
  ultra: { id: 'ultra', name: 'Ultra', fill: 0xff9cf0, tint: 0xff9cf0, rates: { normal: 0.9, legendary: 0.5 } }
};

export const BALL_ORDER = ['normal', 'super', 'ultra'];

/** Probabilidad de captura según la bola usada. Las shiny se capturan siempre. */
export function captureChance(ballType, creature, shiny) {
  if (shiny) return 1;
  const rates = (BALL_TYPES[ballType] ?? BALL_TYPES.normal).rates;
  return creature.legendary ? rates.legendary : rates.normal;
}

/** Recompensa por limpiar la pantalla o derrotar a un legendario: 80 % super, 20 % ultra. */
export const rollRewardBall = (rng = Math.random) => (rng() < 0.8 ? 'super' : 'ultra');

/** Poder aleatorio al llenar la barra. */
export const rollPower = (rng = Math.random) => SPECIALS[Math.floor(rng() * SPECIALS.length)].id;
