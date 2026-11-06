// Componentes de interfaz retro: texto, paneles y botones.
import { FONT } from '../config.js';

export const COLORS = {
  ink: 0x283048,
  inkHex: '#283048',
  paper: 0xf8f8f8,
  night: 0x0c1020,
  board: 0x182038,
  gold: 0xffd84a,
  goldHex: '#ffd84a'
};

export function text(scene, x, y, str, size = 8, color = '#f8f8f8', extra = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    align: 'center',
    lineSpacing: 6,
    ...extra
  });
}

/** Panel blanco con borde doble y esquinas recortadas, estilo RPG clásico. */
export function drawPanel(g, x, y, w, h, { fill = COLORS.paper, border = COLORS.ink } = {}) {
  g.fillStyle(border);
  g.fillRect(x + 2, y, w - 4, h);
  g.fillRect(x, y + 2, w, h - 4);
  g.fillStyle(fill);
  g.fillRect(x + 3, y + 3, w - 6, h - 6);
  g.fillStyle(0xa8b4cc);
  g.fillRect(x + 5, y + h - 5, w - 10, 1);
  return g;
}

export function makePanel(scene, x, y, w, h, opts) {
  return drawPanel(scene.add.graphics(), x, y, w, h, opts);
}

export function makeButton(scene, x, y, w, h, label, onClick, { fill = COLORS.paper, textColor = COLORS.inkHex, size = 8 } = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const t = text(scene, 0, 0, label, size, textColor).setOrigin(0.5);
  let enabled = true;
  let selected = false;
  const draw = (pressed) => {
    const oy = pressed ? 2 : 0;
    g.clear();
    g.fillStyle(0x080a14);
    g.fillRect(-w / 2, -h / 2 + 2, w, h);
    g.fillStyle(selected ? COLORS.gold : COLORS.ink);
    g.fillRect(-w / 2, -h / 2 + oy, w, h - 2);
    g.fillStyle(fill);
    g.fillRect(-w / 2 + 2, -h / 2 + 2 + oy, w - 4, h - 6);
    t.setY(oy - 1);
  };
  const hit = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
  hit.on('pointerdown', (_p, _x, _y, ev) => {
    ev?.stopPropagation?.();
    if (enabled) draw(true);
  });
  hit.on('pointerup', (_p, _x, _y, ev) => {
    ev?.stopPropagation?.();
    draw(false);
    if (enabled) onClick();
  });
  hit.on('pointerout', () => draw(false));
  c.add([g, t, hit]);
  c.setEnabled = (v) => {
    enabled = v;
    c.setAlpha(v ? 1 : 0.4);
    return c;
  };
  c.setSelected = (v) => {
    selected = v;
    draw(false);
    return c;
  };
  c.setLabel = (s) => {
    t.setText(s);
    return c;
  };
  draw(false);
  return c;
}

/** Texto que sube y se desvanece (daño, puntos, avisos). */
export function floatText(scene, x, y, str, color = '#ffffff', size = 8) {
  const t = text(scene, x, y, str, size, color).setOrigin(0.5).setDepth(40).setStroke('#101828', 3);
  scene.tweens.add({ targets: t, y: y - 22, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  return t;
}
