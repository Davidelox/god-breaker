// Orbes de captura (los proyectiles del cazador), recompensas y hechizos aleatorios.
// Lógica pura, sin Phaser: se puede testear. Los id se mantienen por compatibilidad.
import { SPECIALS } from './specials.js';

export const BALL_TYPES = {
  // fill: color del botón; trail: color de la estela; tint: color del cristal de captura
  normal: { id: 'normal', name: 'Common', fill: 0xc8f4f8, trail: 0x4ce0e8, tint: null, rates: { normal: 0.6, legendary: 0.25 } },
  super: { id: 'super', name: 'Runic', fill: 0xdcc8ff, trail: 0xa070f0, tint: 0xc0a0ff, rates: { normal: 0.75, legendary: 0.4 } },
  ultra: { id: 'ultra', name: 'Divine', fill: 0xffe070, trail: 0xffd84a, tint: 0xffe070, rates: { normal: 0.9, legendary: 0.6 } }
};

export const BALL_ORDER = ['normal', 'super', 'ultra'];

/** Probabilidad de captura según el orbe usado. Las shiny se capturan siempre. */
export function captureChance(ballType, creature, shiny) {
  if (shiny) return 1;
  const rates = (BALL_TYPES[ballType] ?? BALL_TYPES.normal).rates;
  return creature.legendary ? rates.legendary : rates.normal;
}

/** Recompensa por limpiar la pantalla o derrotar a un legendario: 80 % rúnico, 20 % divino. */
export const rollRewardBall = (rng = Math.random) => (rng() < 0.8 ? 'super' : 'ultra');

/** Hechizo aleatorio al llenar la barra. */
export const rollPower = (rng = Math.random) => SPECIALS[Math.floor(rng() * SPECIALS.length)].id;
