// Componentes de interfaz retro: texto, paneles y botones.
import { FONT, BODY_FONT, W, FULL_H, SAFE_TOP } from '../config.js';
import { t, getLang, setLang } from '../i18n.js';

/**
 * Zona segura: la cámara se desplaza SAFE_TOP para que y = 0 quede bajo la hora / la muesca.
 * Llamar al principio de create() de cada escena.
 */
export function fitCamera(scene) {
  scene.cameras.main.setScroll(0, -SAFE_TOP);
}

/** Rectángulo que cubre toda la pantalla (también fuera de la zona segura). */
export function fullRect(scene, color, alpha = 1) {
  return scene.add.rectangle(0, -SAFE_TOP, W, FULL_H, color, alpha).setOrigin(0);
}
import { audio } from '../audio/audio.js';

/** Botones MUSICA / SONIDO que activan o desactivan el audio y lo guardan. */
/**
 * Botón con un icono. Con toggle, se ve encendido (icono brillante) o apagado (icono apagado,
 * botón oscuro y una raya roja en diagonal). setOn(v) cambia el estado.
 */
export function makeIconButton(scene, x, y, w, h, icon, onClick, style = {}, toggle = null) {
  let on = toggle?.on ?? true;
  const btn = makeButton(scene, x, y, w, h, '', () => {
    if (toggle) btn.setOn(!on);
    onClick?.(on);
  }, style);
  const img = scene.add.image(0, -1, `icon_${icon}`).setScale(2);
  const slash = scene.add.graphics();
  slash.lineStyle(3, 0xe04040, 1);
  slash.lineBetween(-9, 8, 9, -10);
  slash.setVisible(false);
  btn.add([img, slash]);
  btn.setOn = (v) => {
    on = v;
    img.setAlpha(on ? 1 : 0.35);
    slash.setVisible(!on);
    if (toggle) btn.setFill(on ? style.fill ?? COLORS.paper : 0x0a0c16);
    return btn;
  };
  if (toggle) btn.setOn(on);
  return btn;
}

/** Música y sonido: dos botones con su símbolo, que se ven encendidos o apagados. */
export function makeAudioToggles(scene, y, save, style = {}, { x = scene.scale.width / 2 - 24, gap = 48, size = 42 } = {}) {
  const s = save.data.settings;
  const music = makeIconButton(scene, x, y, size, 30, 'music', (on) => {
    s.music = on;
    audio.setMusic(on);
    save.write();
  }, style, { on: s.music });
  const sfx = makeIconButton(scene, x + gap, y, size, 30, 'sound', (on) => {
    s.sfx = on;
    audio.setSfx(on);
    save.write();
  }, style, { on: s.sfx });
  return [music, sfx];
}

/** Botón de idioma (inglés / español). Guarda el ajuste y llama a onChange para redibujar. */
export function makeLangToggle(scene, x, y, w, save, onChange, style = {}) {
  return makeButton(scene, x, y, w, 30, 'LANGUAGE: ENGLISH', () => {
    const next = getLang() === 'es' ? 'en' : 'es';
    setLang(next);
    save.data.settings.lang = next;
    save.write();
    onChange?.();
  }, style);
}

export const COLORS = {
  ink: 0x283048,
  inkHex: '#283048',
  paper: 0xf8f8f8,
  night: 0x0c1020,
  board: 0x182038,
  gold: 0xffd84a,
  goldHex: '#ffd84a'
};

/** Texto de lectura (guía, consejos) con la fuente VT323: el tamaño se da como en text() y se duplica. */
export function bodyText(scene, x, y, str, size = 8, color = '#f8f8f8', extra = {}) {
  return text(scene, x, y, str, size * 2 + 2, color, { fontFamily: BODY_FONT, lineSpacing: 0, ...extra });
}

/** Texto con la fuente pixel. Los textos fijos en inglés se traducen solos (ver i18n.js). */
export function text(scene, x, y, str, size = 8, color = '#f8f8f8', extra = {}) {
  return scene.add.text(x, y, t(str), {
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

/** Estilo dorado de la partida: fondo oscuro, borde de oro y letras doradas (seleccionado: borde blanco). */
export const GOLD_UI = { fill: 0x1e1838, border: 0xd8a030, textColor: '#ffe27a', selBorder: 0xffffff };

/** Panel con marco de oro, brillo arriba, fondo oscuro y remaches en las esquinas. */
export function drawGoldPanel(g, x, y, w, h, fill = 0x1a1430) {
  g.fillStyle(0x6a3e0c);
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(0xd8a030);
  g.fillRect(x, y, w, h);
  g.fillStyle(0xffe27a);
  g.fillRect(x, y, w, 2);
  g.fillStyle(fill);
  g.fillRect(x + 3, y + 3, w - 6, h - 6);
  g.fillStyle(0xffe27a);
  for (const [a, b] of [[x + 1, y + 1], [x + w - 4, y + 1], [x + 1, y + h - 4], [x + w - 4, y + h - 4]]) g.fillRect(a, b, 3, 3);
  return g;
}

export function makePanel(scene, x, y, w, h, opts) {
  return drawPanel(scene.add.graphics(), x, y, w, h, opts);
}

export function makeButton(scene, x, y, w, h, label, onClick, { fill = COLORS.paper, textColor = COLORS.inkHex, size = 8, border = COLORS.ink, selBorder = COLORS.gold } = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const lbl = text(scene, 0, 0, label, size, textColor).setOrigin(0.5);
  let enabled = true;
  let selected = false;
  // Aura dorada que late alrededor del botón marcado
  const glow = scene.add.graphics().setVisible(false);
  glow.lineStyle(2, selBorder, 1);
  glow.strokeRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 5);
  glow.lineStyle(1, 0xfff4c8, 0.8);
  glow.strokeRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 9);
  let glowTween = null;
  const draw = (pressed) => {
    // Pulsado: el botón se hunde (baja 2 px y se oscurece); marcado: más claro, borde dorado
    // grueso con brillo interior y aura que late
    const oy = pressed || selected ? 2 : 0;
    const base = selected ? mixHex(fill, 0xffffff, 0.22) : fill;
    const face = pressed ? mixHex(base, 0x000000, 0.28) : base;
    g.clear();
    g.fillStyle(0x080a14);
    g.fillRect(-w / 2, -h / 2 + 2, w, h);
    g.fillStyle(selected ? selBorder : border);
    g.fillRect(-w / 2, -h / 2 + oy, w, h - 2);
    const inset = selected ? 3 : 2;
    g.fillStyle(face);
    g.fillRect(-w / 2 + inset, -h / 2 + inset + oy, w - inset * 2, h - 2 - inset * 2);
    if (pressed) {
      // Sombra interior arriba: se ve hundido
      g.fillStyle(0x000000, 0.35);
      g.fillRect(-w / 2 + inset, -h / 2 + inset + oy, w - inset * 2, 2);
    } else {
      g.fillStyle(0xffffff, selected ? 0.5 : 0.18);
      g.fillRect(-w / 2 + inset, -h / 2 + inset + oy, w - inset * 2, 1);
    }
    if (selected) {
      // Esquinas brillantes
      g.fillStyle(0xfff4c8);
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.fillRect(sx * (w / 2 - 2) - 1, sy * (h / 2 - 3) + oy - 1, 2, 2);
    }
    lbl.setY(oy - 1);
    glow.setY(oy);
    glow.setVisible(selected && enabled);
    if (selected && enabled && !glowTween) glowTween = scene.tweens.add({ targets: glow, alpha: { from: 1, to: 0.25 }, duration: 520, yoyo: true, repeat: -1 });
    if (!(selected && enabled) && glowTween) { glowTween.stop(); glowTween = null; glow.setAlpha(1); }
  };
  const hit = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
  hit.on('pointerdown', (_p, _x, _y, ev) => {
    ev?.stopPropagation?.();
    if (enabled) draw(true);
  });
  hit.on('pointerup', (_p, _x, _y, ev) => {
    ev?.stopPropagation?.();
    draw(false);
    if (enabled) {
      audio.play('click');
      onClick();
    }
  });
  hit.on('pointerout', () => draw(false));
  c.add([glow, g, lbl, hit]);
  c.setEnabled = (v) => {
    enabled = v;
    c.setAlpha(v ? 1 : 0.4);
    draw(false);
    return c;
  };
  c.setSelected = (v) => {
    selected = v;
    draw(false);
    return c;
  };
  c.setLabel = (s) => {
    lbl.setText(t(s));
    return c;
  };
  c.setFill = (newFill, newTextColor) => {
    fill = newFill;
    if (newTextColor) lbl.setColor(newTextColor);
    draw(false);
    return c;
  };
  draw(false);
  return c;
}

/** Texto que sube y se desvanece (daño, puntos, avisos). */
export function floatText(scene, x, y, str, color = '#ffffff', size = 8) {
  const ft = text(scene, x, y, str, size, color).setOrigin(0.5).setDepth(40).setStroke('#101828', 3);
  scene.tweens.add({ targets: ft, y: y - 22, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => ft.destroy() });
  return ft;
}

/**
 * Bocadillo de texto junto a una opción (encima, o debajo si no cabe arriba), con un pico que
 * señala el punto (x, y). Solo hay uno por escena: al abrir otro, el anterior se cierra, así
 * que nunca se superponen. Se cierra solo tras un rato.
 * opts: { color: color del texto, border: color del borde, below: forzar debajo, gap: separación }
 */
export function showTip(scene, x, y, msg, opts = {}) {
  scene._tip?.destroy();
  const pad = 6, maxW = Math.min(220, W - 24);
  const label = text(scene, 0, 0, msg, 8, opts.color ?? '#ffe27a', { wordWrap: { width: maxW - pad * 2 } }).setOrigin(0.5);
  const bw = Math.ceil(label.width) + pad * 2, bh = Math.ceil(label.height) + pad * 2;
  const gap = opts.gap ?? 26;
  const top = scene.cameras.main.worldView?.y ?? 0;
  const below = opts.below ?? y - gap - bh < top + 8;
  const cy = below ? y + gap + bh / 2 : y - gap - bh / 2;
  const cx = Math.max(8 + bw / 2, Math.min(W - 8 - bw / 2, x));
  const g = scene.add.graphics();
  const border = opts.border ?? 0xd8a030;
  g.fillStyle(border);
  g.fillRect(-bw / 2 - 2, -bh / 2 - 2, bw + 4, bh + 4);
  g.fillStyle(0x101828, 0.96);
  g.fillRect(-bw / 2, -bh / 2, bw, bh);
  // Pico hacia la opción
  const px = Math.max(-bw / 2 + 8, Math.min(bw / 2 - 8, x - cx));
  const tipY = below ? -bh / 2 : bh / 2, dir = below ? -1 : 1;
  g.fillStyle(border);
  g.fillTriangle(px - 6, tipY, px + 6, tipY, px, tipY + dir * 8);
  g.fillStyle(0x101828, 0.96);
  g.fillTriangle(px - 4, tipY - dir, px + 4, tipY - dir, px, tipY + dir * 5);
  // Tocar el bocadillo lo cierra (sin que el toque llegue a lo de debajo, p. ej. apuntar)
  const hit = scene.add.zone(0, 0, bw + 4, bh + 4).setInteractive({ useHandCursor: true });
  hit.on('pointerdown', (_p, _x, _y, ev) => ev?.stopPropagation?.());
  hit.on('pointerup', (_p, _x, _y, ev) => { ev?.stopPropagation?.(); hideTip(scene); });
  const tip = scene.add.container(cx, cy, [g, label, hit]).setDepth(opts.depth ?? 95).setScale(0.6).setAlpha(0);
  scene.tweens.add({ targets: tip, scale: 1, alpha: 1, duration: 140, ease: 'Back.easeOut' });
  const life = 1800 + Math.min(2200, String(msg).length * 35);
  scene.tweens.add({
    targets: tip, alpha: 0, delay: life, duration: 300,
    onComplete: () => { if (scene._tip === tip) scene._tip = null; tip.destroy(); }
  });
  scene._tip = tip;
  return tip;
}

/** Cierra el bocadillo abierto de la escena (si hay). */
export function hideTip(scene) {
  const tip = scene._tip;
  if (!tip) return;
  scene._tip = null;
  scene.tweens.killTweensOf(tip);
  scene.tweens.add({ targets: tip, alpha: 0, scale: 0.85, duration: 110, onComplete: () => tip.destroy() });
}

/** Mezcla dos colores 0xRRGGBB (f = 0 da a, f = 1 da b). */
function mixHex(a, b, f) {
  const m = (sh) => Math.round(((a >> sh) & 255) * (1 - f) + ((b >> sh) & 255) * f) << sh;
  return m(16) | m(8) | m(0);
}
