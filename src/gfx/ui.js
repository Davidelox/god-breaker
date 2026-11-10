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
export function makeAudioToggles(scene, y, save) {
  const s = save.data.settings;
  const label = (name, on) => t(`${name} {0}`, t(on ? 'ON' : 'OFF'));
  const music = makeButton(scene, scene.scale.width / 2 - 72, y, 136, 30, label('MUSIC', s.music), () => {
    s.music = !s.music;
    audio.setMusic(s.music);
    save.write();
    music.setLabel(label('MUSIC', s.music));
  });
  const sfx = makeButton(scene, scene.scale.width / 2 + 72, y, 136, 30, label('SOUND', s.sfx), () => {
    s.sfx = !s.sfx;
    audio.setSfx(s.sfx);
    save.write();
    sfx.setLabel(label('SOUND', s.sfx));
  });
  return [music, sfx];
}

/** Botón de idioma (inglés / español). Guarda el ajuste y llama a onChange para redibujar. */
export function makeLangToggle(scene, x, y, w, save, onChange) {
  return makeButton(scene, x, y, w, 30, 'LANGUAGE: ENGLISH', () => {
    const next = getLang() === 'es' ? 'en' : 'es';
    setLang(next);
    save.data.settings.lang = next;
    save.write();
    onChange?.();
  });
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

export function makePanel(scene, x, y, w, h, opts) {
  return drawPanel(scene.add.graphics(), x, y, w, h, opts);
}

export function makeButton(scene, x, y, w, h, label, onClick, { fill = COLORS.paper, textColor = COLORS.inkHex, size = 8 } = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const lbl = text(scene, 0, 0, label, size, textColor).setOrigin(0.5);
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
    lbl.setY(oy - 1);
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
  c.add([g, lbl, hit]);
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
