import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createChickenDisplay, createCourageDisplay, createStarfield } from '../game/sprites';
import { endlessState } from '../game/store';
import { startBgm } from '../game/audio';

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
  title.alpha = 0;
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
  subtitle.alpha = 0;
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
  hint.alpha = 0;
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
  btn.y = H * 0.74;
  btn.alpha = 0;
  uiLayer.addChild(btn);

  // ── Endless Mode button ───────────────────────────────────────────────────
  const endlessBtnW = 200, endlessBtnH = 52;
  const endlessBtn = new Container();
  endlessBtn.eventMode = 'static';
  endlessBtn.cursor = 'pointer';

  const endlessBtnBg = new Graphics();
  endlessBtnBg.roundRect(-endlessBtnW / 2, -endlessBtnH / 2, endlessBtnW, endlessBtnH, 12)
    .fill({ color: 0x004488, alpha: 0.9 });
  endlessBtnBg.roundRect(-endlessBtnW / 2, -endlessBtnH / 2, endlessBtnW, endlessBtnH, 12)
    .stroke({ color: 0x44aaff, width: 2 });
  endlessBtn.addChild(endlessBtnBg);

  const endlessBtnStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 22,
    fontWeight: 'bold',
    fill: 0xaaddff,
  });
  const endlessBtnText = new Text({ text: '∞  無盡模式', style: endlessBtnStyle });
  endlessBtnText.anchor.set(0.5);
  endlessBtn.addChild(endlessBtnText);

  // Best wave sub-label
  const bestWaveStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 12,
    fill: 0x88bbdd,
  });
  const bestWaveText = new Text({
    text: endlessState.bestWave > 1 ? `最高波數：第 ${endlessState.bestWave} 波` : '挑戰無限關卡！',
    style: bestWaveStyle,
  });
  bestWaveText.anchor.set(0.5);
  bestWaveText.y = endlessBtnH / 2 + 10;
  endlessBtn.addChild(bestWaveText);

  endlessBtn.x = W * 0.5;
  endlessBtn.y = H * 0.84;
  endlessBtn.alpha = 0;
  uiLayer.addChild(endlessBtn);

  // ── DEV button (bottom-right corner) ─────────────────────────────────────
  const devBtnW = 46, devBtnH = 22;
  const devBtn = new Container();
  devBtn.eventMode = 'static';
  devBtn.cursor = 'pointer';
  const devBtnBg = new Graphics();
  devBtnBg.roundRect(0, 0, devBtnW, devBtnH, 5)
    .fill({ color: 0x333333, alpha: 0.85 })
    .stroke({ color: 0xff6644, width: 1 });
  devBtn.addChild(devBtnBg);
  const devBtnStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    fill: 0xffaa66,
    fontWeight: 'bold',
  });
  const devBtnText = new Text({ text: 'DEV', style: devBtnStyle });
  devBtnText.anchor.set(0.5);
  devBtnText.x = devBtnW / 2;
  devBtnText.y = devBtnH / 2;
  devBtn.addChild(devBtnText);
  devBtn.x = W - devBtnW - 10;
  devBtn.y = H - devBtnH - 10;
  uiLayer.addChild(devBtn);

  devBtn.on('pointerup', async () => {
    await core.events.emit('scene/load', { key: 'devmenu' });
  });

  // ── Scene fade-in via TweenManager ────────────────────────────────────────
  const fadeTargets = [title, subtitle, hint, btn, endlessBtn] as unknown as Record<string, unknown>[];
  const delays = [0, 150, 600, 350, 500];
  fadeTargets.forEach((t, i) => {
    core.events.emitSync('tween/to', {
      target: t,
      props: { alpha: 1 },
      duration: 500,
      ease: 'easeOutQuad',
      delay: delays[i],
    });
  });

  // ── Button pulse animations via TweenManager ──────────────────────────────
  core.events.emitSync('tween/to', {
    target: btn.scale as unknown as Record<string, unknown>,
    props: { x: 1.05, y: 1.05 },
    duration: 800,
    ease: 'easeInOutSine',
    loop: true,
    yoyo: true,
    delay: 700,
  });
  core.events.emitSync('tween/to', {
    target: endlessBtn.scale as unknown as Record<string, unknown>,
    props: { x: 1.04, y: 1.04 },
    duration: 900,
    ease: 'easeInOutSine',
    loop: true,
    yoyo: true,
    delay: 900,
  });

  // ── Background music ──────────────────────────────────────────────────────
  startBgm();

  // ── Float characters (tick-driven) ────────────────────────────────────────
  const unsubTick = core.events.on('title', 'core/tick', ({ delta }: { delta: number }) => {
    const dt = delta;
    vsText.rotation += 0.002 * dt;
    chickenPreview.y = H * 0.5 + Math.sin(Date.now() / 600) * 10;
    couragePreview.y = H * 0.5 + Math.sin(Date.now() / 600 + Math.PI) * 10;
  });

  // Click / touch start
  btn.on('pointerdown', async () => {
    endlessState.active = false;
    await core.events.emit('scene/load', { key: 'levelselect' });
  });

  endlessBtn.on('pointerdown', async () => {
    endlessState.active = true;
    endlessState.wave = 1;
    endlessState.buffs = [];
    endlessState.score = 0;
    endlessState.periodicShieldTimer = 0;
    endlessState.regenTimer = 0;
    await core.events.emit('scene/load', { key: 'costumeselect' });
  });

  _cleanup = () => {
    core.events.removeNamespace('title');
    core.events.emitSync('tween/kill', { target: btn.scale as unknown as Record<string, unknown> });
    core.events.emitSync('tween/kill', { target: endlessBtn.scale as unknown as Record<string, unknown> });
    worldLayer.removeChild(stars, chickenPreview, couragePreview, vsText);
    uiLayer.removeChild(title, subtitle, hint, btn, endlessBtn, devBtn);
    stars.destroy({ children: true });
    chickenPreview.destroy({ children: true });
    couragePreview.destroy({ children: true });
    vsText.destroy();
    title.destroy();
    subtitle.destroy();
    hint.destroy();
    btn.destroy({ children: true });
    endlessBtn.destroy({ children: true });
    devBtn.destroy({ children: true });
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
