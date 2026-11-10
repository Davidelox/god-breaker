// Fondos de clima: partículas suaves y de baja opacidad dentro del tablero (solo visual).
import { BOARD_TOP, BOARD_FLOOR_Y, WALL_L, WALL_R } from '../config.js';

export const WEATHERS = [
  { id: 'despejado', name: 'Clear night', bg: 0x182038 },
  { id: 'lluvia', name: 'Rain', bg: 0x142236 },
  { id: 'nieve', name: 'Snow', bg: 0x1c2642 },
  { id: 'arena', name: 'Sandstorm', bg: 0x2a2228 },
  { id: 'niebla', name: 'Fog', bg: 0x1e2434 },
  { id: 'sol', name: 'Blazing sun', bg: 0x222a40 }
];

const X0 = WALL_L;
const X1 = WALL_R;
const Y0 = BOARD_TOP;
const Y1 = BOARD_FLOOR_Y;
const W = X1 - X0;
const H = Y1 - Y0;
const COUNT = { despejado: 40, lluvia: 45, nieve: 40, arena: 34, niebla: 6, sol: 22 };
const rnd = (a, b) => a + Math.random() * (b - a);

function spawn(id, anywhere) {
  const p = { x: rnd(X0, X1), y: anywhere ? rnd(Y0, Y1) : Y0 - 6, phase: rnd(0, Math.PI * 2) };
  switch (id) {
    case 'despejado':
      return { ...p, y: rnd(Y0, Y1), size: Math.random() < 0.2 ? 2 : 1, speed: rnd(0.6, 2) };
    case 'lluvia':
      return { ...p, vy: rnd(360, 460), len: Math.round(rnd(4, 8)) };
    case 'nieve':
      return { ...p, vy: rnd(14, 36), size: Math.random() < 0.3 ? 2 : 1 };
    case 'arena':
      return { ...p, x: anywhere ? rnd(X0, X1) : X0 - 14, y: rnd(Y0, Y1), vx: rnd(150, 260), len: Math.round(rnd(5, 14)) };
    case 'niebla':
      return { ...p, x: anywhere ? rnd(X0 - 40, X1) : X0 - 80, y: rnd(Y0, Y1), vx: rnd(6, 14), r: rnd(40, 75) };
    case 'sol':
      return { ...p, y: anywhere ? rnd(Y0, Y1) : Y1 + 4, vy: -rnd(8, 18), size: Math.random() < 0.3 ? 2 : 1 };
    default:
      return p;
  }
}

export class Weather {
  constructor(scene, depth, onBackground) {
    this.scene = scene;
    this.g = scene.add.graphics().setDepth(depth);
    this.onBackground = onBackground;
    this.index = 0;
    this.t = 0;
    this.reset();
  }

  get current() {
    return WEATHERS[this.index];
  }

  reset() {
    const id = this.current.id;
    this.parts = Array.from({ length: COUNT[id] }, () => spawn(id, true));
    this.onBackground?.(this.current.bg);
  }

  /** Pasa al siguiente clima con un fundido. Devuelve el nuevo clima. */
  next() {
    this.index = (this.index + 1) % WEATHERS.length;
    const target = this.current;
    this.scene.tweens.add({
      targets: this.g, alpha: 0, duration: 500,
      onComplete: () => {
        this.reset();
        this.scene.tweens.add({ targets: this.g, alpha: 1, duration: 900 });
      }
    });
    return target;
  }

  update(dt) {
    this.t += dt;
    const g = this.g;
    const id = this.current.id;
    g.clear();
    if (id === 'sol') {
      // Rayos de luz diagonales muy tenues
      const a = 0.025 + 0.015 * Math.sin(this.t * 0.4);
      g.fillStyle(0xffe8a0, a);
      for (let i = 0; i < 3; i++) {
        const x = X0 + 30 + i * 90;
        g.fillPoints([{ x, y: Y0 }, { x: x + 40, y: Y0 }, { x: x - 60, y: Y1 }, { x: x - 120, y: Y1 }], true);
      }
    }
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      switch (id) {
        case 'despejado': {
          const a = 0.12 + 0.25 * (0.5 + 0.5 * Math.sin(this.t * p.speed + p.phase));
          g.fillStyle(0xffffff, a);
          g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          break;
        }
        case 'lluvia':
          p.y += p.vy * dt;
          p.x -= 40 * dt;
          if (p.y > Y1 || p.x < X0) this.parts[i] = spawn(id, false);
          g.fillStyle(0x9cc8ff, 0.2);
          g.fillRect(Math.round(p.x), Math.round(p.y), 1, p.len);
          break;
        case 'nieve': {
          p.y += p.vy * dt;
          if (p.y > Y1) this.parts[i] = spawn(id, false);
          const x = p.x + Math.sin(this.t * 0.8 + p.phase) * 6;
          if (x < X0 || x > X1) break;
          g.fillStyle(0xffffff, 0.3);
          g.fillRect(Math.round(x), Math.round(p.y), p.size, p.size);
          break;
        }
        case 'arena':
          p.x += p.vx * dt;
          if (p.x > X1) this.parts[i] = spawn(id, false);
          g.fillStyle(0xe8b878, 0.16);
          g.fillRect(Math.round(Math.max(X0, p.x)), Math.round(p.y), Math.min(p.len, X1 - p.x), 1);
          break;
        case 'niebla':
          p.x += p.vx * dt;
          if (p.x - p.r > X1) this.parts[i] = spawn(id, false);
          g.fillStyle(0xc8d0e0, 0.035);
          g.fillCircle(p.x, p.y, p.r);
          g.fillCircle(p.x + p.r * 0.3, p.y - p.r * 0.2, p.r * 0.7);
          break;
        case 'sol': {
          p.y += p.vy * dt;
          if (p.y < Y0) this.parts[i] = spawn(id, false);
          const x = p.x + Math.sin(this.t * 0.6 + p.phase) * 5;
          g.fillStyle(0xffe8a0, 0.15 + 0.15 * Math.sin(this.t * 2 + p.phase));
          g.fillRect(Math.round(x), Math.round(p.y), p.size, p.size);
          break;
        }
        default:
          break;
      }
    }
  }
}

export const WEATHER_AREA = { x: X0, y: Y0, w: W, h: H };
