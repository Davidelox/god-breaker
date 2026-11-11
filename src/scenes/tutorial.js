// Tutorial de la primera partida: consejos cortos que aparecen la primera vez que pasa algo.
// Solo se muestran al empezar un turno (con los orbes quietos) y paran la partida hasta pulsar
// GOT IT. SKIP TIPS los desactiva todos. Los vistos se guardan (save.tutorial).
import { W, ROWS, BOARD_TOP, CELL } from '../config.js';
import { text, bodyText, makeButton, drawPanel, COLORS } from '../gfx/ui.js';

/** Consejos en orden de prioridad; `when(scene)` dice si ya ha pasado lo que explican. */
export const TIPS = [
  { id: 'aim', title: 'AIM & SHOOT', body: 'Drag on the board to aim and release to launch your orbs. They bounce off the walls and the blocks.', when: () => true },
  { id: 'drop', title: 'EACH ROUND', body: 'The number is the block HP. Every round you get +1 orb and all blocks drop one row.', when: (s) => s.turn >= 2 },
  { id: 'beast', title: 'A BEAST!', body: 'Break a beast block and your orb will try to capture it. A red ! means you have not caught it yet.', when: (s) => s.blocks.some((b) => b.creature && b.kind !== 'boss') },
  { id: 'pickup', title: 'EXTRA ORB', body: 'Hit the +1 to get one more orb for the next rounds.', when: (s) => s.pickups.length > 0 },
  { id: 'escape', title: 'IT ESCAPED', body: 'Captures can fail. Better orbs (bottom right) capture more often.', when: (s) => s.tipFlags.escaped },
  { id: 'spell', title: 'NEW SPELL', body: 'Tap a spell at the bottom before launching to use it. Two at once make a COMBO.', when: (s) => s.powers.length > 0 },
  { id: 'speed', title: 'SPEED', body: 'Tap the speed button at the top to make the orbs faster. When no orb can hit anything, they speed up on their own.', when: (s) => s.turn >= 4 },
  { id: 'god', title: 'A GOD!', body: 'Gods have a lot of HP. Defeat one to try to capture it.', when: (s) => s.blocks.some((b) => b.kind === 'boss') },
  { id: 'gold', title: 'GOLD BEAST!', body: 'Gold beasts are rare, shiny versions. They are always captured!', when: (s) => s.blocks.some((b) => b.shiny) },
  { id: 'danger', title: 'DANGER!', body: 'If a block reaches the red line, the game is over.', when: (s) => s.blocks.some((b) => !b.dead && b.row + b.h - 1 >= ROWS - 3) }
];

/** Al empezar un turno: pone en cola los consejos nuevos y muestra el primero. */
export function checkTips(scene) {
  const save = scene.save;
  if (scene.state !== 'aim' || scene.paused) return;
  for (const t of TIPS) {
    if (!save.wantsTip(t.id) || scene.tipQueue.includes(t) || !t.when(scene)) continue;
    scene.tipQueue.push(t);
  }
  if (!scene.tipOpen) showNextTip(scene);
}

function showNextTip(scene) {
  const t = scene.tipQueue.shift();
  if (!t || !scene.save.wantsTip(t.id) || scene.state !== 'aim') {
    scene.tipQueue.length = 0;
    return;
  }
  scene.tipOpen = true;
  scene.paused = true; // bloquea apuntar, hechizos y pausa mientras está abierto
  const pw = W - 56;
  const body = bodyText(scene, 0, 0, t.body, 8, COLORS.inkHex, { wordWrap: { width: pw - 28 } }).setOrigin(0.5, 0);
  const ph = body.height + 92;
  const cy = BOARD_TOP + CELL * 4.2;
  const panel = scene.add.graphics();
  drawPanel(panel, -pw / 2, -ph / 2, pw, ph);
  const title = text(scene, 0, -ph / 2 + 18, t.title, 10, '#b07800').setOrigin(0.5);
  body.setY(-ph / 2 + 34);
  const close = (skip) => {
    if (skip) scene.save.skipTips();
    else scene.save.markTip(t.id);
    scene.tweens.add({ targets: layer, scale: 0.6, alpha: 0, duration: 140, onComplete: () => layer.destroy() });
    // Un instante después, para que el mismo toque no dispare un orbe
    scene.time.delayedCall(60, () => {
      scene.tipOpen = false;
      scene.paused = false;
      if (!skip) showNextTip(scene);
    });
  };
  const ok = makeButton(scene, 52, ph / 2 - 26, 96, 30, 'GOT IT', () => close(false), { fill: 0xd8f0d0 });
  const skip = makeButton(scene, -60, ph / 2 - 26, 96, 30, 'SKIP TIPS', () => close(true));
  const dim = scene.add.rectangle(0, 0, W * 3, 4000, 0x000000, 0.35).setInteractive();
  const layer = scene.add.container(W / 2, cy, [dim, panel, title, body, skip, ok]).setDepth(80).setScale(0.6).setAlpha(0);
  scene.tweens.add({ targets: layer, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
}
