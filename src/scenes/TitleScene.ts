import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createChickenDisplay, createCourageDisplay, createStarfield } from '../game/sprites';
import { gameResult } from '../game/store';

// Clean up function stored between enter/exit
let _cleanup: (() => void) | null = null;

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // ── Layers ──────────────────────────────────────────────────────────────
  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ───────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Characters preview ───────────────────────────────────────────────────
  const chickenPreview = createChickenDisplay();
  chickenPreview.scale.set(1.6);
  chickenPreview.x = W * 0.32;
  chickenPreview.y = H * 0.5;
  worldLayer.addChild(chickenPreview);

  const couragePreview = createCourageDisplay();
  couragePreview.scale.set(1.2);
  couragePreview.x = W * 0.68;
  couragePreview.y = H * 0.5;
  worldLayer.addChild(couragePreview);

  // VS text between them
  const vsStyle = new TextStyle({
    fontFamily: 'Arial Black, Arial, sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    fill: 0xffffff,
    dropShadow: { color: 0xff4400, distance: 4, alpha: 0.9, blur: 2 },
  });
  const vsText = new Text({ text: 'VS', style: vsStyle });
  vsText.anchor.set(0.5);
  vsText.x = W * 0.5;
  vsText.y = H * 0.5;
  worldLayer.addChild(vsText);

  // ── Title ─────────────────────────────────────────────────────────────────
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 36,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const title = new Text({ text: '小雞大戰勇氣！', style: titleStyle });
  title.anchor.set(0.5);
  title.x = W * 0.5;
  title.y = H * 0.22;
  uiLayer.addChild(title);

  const subtitleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 18,
    fill: 0xffdd88,
  });
  const subtitle = new Text({ text: '彈幕射擊遊戲', style: subtitleStyle });
  subtitle.anchor.set(0.5);
  subtitle.x = W * 0.5;
  subtitle.y = H * 0.29;
  uiLayer.addChild(subtitle);

  // ── Controls hint ─────────────────────────────────────────────────────────
  const hintStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 15,
    fill: 0xaaaaaa,
    align: 'center',
  });
  const hint = new Text({ text: '拖曳移動小雞  •  自動射擊\n躲開勇氣的彈幕，擊敗他！', style: hintStyle });
  hint.anchor.set(0.5);
  hint.x = W * 0.5;
  hint.y = H * 0.65;
  uiLayer.addChild(hint);

  // ── Start button ──────────────────────────────────────────────────────────
  const btnW = 200, btnH = 56;
  const btn = new Container();
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  const btnBg = new Graphics();
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .fill({ color: 0xcc0000, alpha: 0.9 });
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .stroke({ color: 0xff6644, width: 2 });
  btn.addChild(btnBg);

  const btnStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 26,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const btnText = new Text({ text: '開始遊戲', style: btnStyle });
  btnText.anchor.set(0.5);
  btn.addChild(btnText);

  btn.x = W * 0.5;
  btn.y = H * 0.78;
  uiLayer.addChild(btn);

  // ── Button animation & interaction ────────────────────────────────────────
  let btnScale = 1;
  let btnScaleDir = 1;

  const unsubTick = core.events.on('title', 'core/tick', ({ delta }: { delta: number }) => {
    const dt = delta;
    btnScale += 0.0008 * btnScaleDir * dt;
    if (btnScale > 1.05) btnScaleDir = -1;
    if (btnScale < 0.96) btnScaleDir = 1;
    btn.scale.set(btnScale);

    // Pulse VS text
    vsText.rotation += 0.002 * dt;

    // Float characters
    chickenPreview.y = H * 0.5 + Math.sin(Date.now() / 600) * 10;
    couragePreview.y = H * 0.5 + Math.sin(Date.now() / 600 + Math.PI) * 10;
  });

  // Click / touch start
  btn.on('pointerdown', async () => {
    gameResult.currentLevel = 1;
    await core.events.emit('scene/load', { key: 'game' });
  });

  _cleanup = () => {
    core.events.removeNamespace('title');
    worldLayer.removeChild(stars, chickenPreview, couragePreview, vsText);
    uiLayer.removeChild(title, subtitle, hint, btn);
    stars.destroy({ children: true });
    chickenPreview.destroy({ children: true });
    couragePreview.destroy({ children: true });
    vsText.destroy();
    title.destroy();
    subtitle.destroy();
    hint.destroy();
    btn.destroy({ children: true });
    unsubTick();
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const TitleScene: SceneDescriptor = {
  key: 'title',
  enter,
  exit,
};
