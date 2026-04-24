import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import {
  createChickenDisplay,
  createElegantChickenDisplay,
  createMooseChickenDisplay,
  createFoxChickenDisplay,
  createWizardChickenDisplay,
  createAdventureChickenDisplay,
  createHeroChickenDisplay,
  createBossChickenDisplay,
  createCourageDisplay,
  createStarfield,
} from '../game/sprites';
import { costumeState, endlessState } from '../game/store';
import { COSTUMES, isCostumeUnlocked } from '../game/costumes';
import type { CostumeId } from '../game/costumes';
import { startBgm, sfxMenuClick } from '../game/audio';

// Clean up function stored between enter/exit
let _cleanup: (() => void) | null = null;
let _transitioning = false;

/** Build the preview Container for the given costume. */
function buildCostumePreview(id: CostumeId): Container {
  switch (id) {
    case 'elegant':   return createElegantChickenDisplay();
    case 'moose':     return createMooseChickenDisplay();
    case 'fox':       return createFoxChickenDisplay();
    case 'wizard':    return createWizardChickenDisplay();
    case 'adventure': return createAdventureChickenDisplay();
    case 'hero':      return createHeroChickenDisplay();
    case 'boss':      return createBossChickenDisplay();
    default:          return createChickenDisplay();
  }
}

async function enter(core: Core): Promise<void> {
  _transitioning = false;
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

  // ── Costume state for cycling ─────────────────────────────────────────────
  const unlockedCostumes = COSTUMES.filter(c =>
    isCostumeUnlocked(c.id, costumeState.clearedLevels, endlessState.bestWave),
  );
  let costumeIndex = unlockedCostumes.findIndex(c => c.id === costumeState.selected);
  if (costumeIndex < 0) costumeIndex = 0;

  // ── Characters preview ───────────────────────────────────────────────────
  // Left side: selected costume preview (changes when player cycles)
  const chickenContainer = new Container();
  chickenContainer.x = W * 0.30;
  chickenContainer.y = H * 0.43;
  worldLayer.addChild(chickenContainer);

  let currentCostumeDisplay = buildCostumePreview(unlockedCostumes[costumeIndex].id);
  currentCostumeDisplay.scale.set(1.6);
  chickenContainer.addChild(currentCostumeDisplay);

  // Right side: enemy preview (static)
  const couragePreview = createCourageDisplay();
  couragePreview.scale.set(1.2);
  couragePreview.x = W * 0.70;
  couragePreview.y = H * 0.43;
  worldLayer.addChild(couragePreview);

  // VS text
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
  vsText.y = H * 0.43;
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
  title.y = H * 0.16;
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
  subtitle.y = H * 0.24;
  subtitle.alpha = 0;
  uiLayer.addChild(subtitle);

  // ── Costume picker ────────────────────────────────────────────────────────
  // Label above picker
  const costumeLabel = new Text({
    text: '造型',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 13,
      fill: 0xaaaaaa,
    }),
  });
  costumeLabel.anchor.set(0.5);
  costumeLabel.x = W * 0.5;
  costumeLabel.y = H * 0.57;
  costumeLabel.alpha = 0;
  uiLayer.addChild(costumeLabel);

  // Costume name
  const costumeNameStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const costumeNameText = new Text({
    text: unlockedCostumes[costumeIndex].name,
    style: costumeNameStyle,
  });
  costumeNameText.anchor.set(0.5);
  costumeNameText.x = W * 0.5;
  costumeNameText.y = H * 0.625;
  costumeNameText.alpha = 0;
  uiLayer.addChild(costumeNameText);

  // Prev / Next arrow buttons
  function makeArrowBtn(label: string): Container {
    const arrowW = 44, arrowH = 44;
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    const bg = new Graphics();
    bg.roundRect(-arrowW / 2, -arrowH / 2, arrowW, arrowH, 10)
      .fill({ color: 0x333355, alpha: 0.85 })
      .stroke({ color: 0x8888cc, width: 1.5 });
    c.addChild(bg);
    const txt = new Text({
      text: label,
      style: new TextStyle({ fontFamily: 'Arial, sans-serif', fontSize: 22, fill: 0xddddff, fontWeight: 'bold' }),
    });
    txt.anchor.set(0.5);
    c.addChild(txt);
    return c;
  }

  const prevBtn = makeArrowBtn('<');
  prevBtn.x = W * 0.5 - 90;
  prevBtn.y = H * 0.625;
  prevBtn.alpha = 0;
  uiLayer.addChild(prevBtn);

  const nextBtn = makeArrowBtn('>');
  nextBtn.x = W * 0.5 + 90;
  nextBtn.y = H * 0.625;
  nextBtn.alpha = 0;
  uiLayer.addChild(nextBtn);

  function refreshCostume(): void {
    // Update costume display
    chickenContainer.removeChild(currentCostumeDisplay);
    currentCostumeDisplay.destroy({ children: true });
    currentCostumeDisplay = buildCostumePreview(unlockedCostumes[costumeIndex].id);
    currentCostumeDisplay.scale.set(1.6);
    chickenContainer.addChild(currentCostumeDisplay);
    // Update name label
    costumeNameText.text = unlockedCostumes[costumeIndex].name;
    // Persist selection
    costumeState.selected = unlockedCostumes[costumeIndex].id;
  }

  prevBtn.on('pointerdown', () => {
    sfxMenuClick();
    costumeIndex = (costumeIndex - 1 + unlockedCostumes.length) % unlockedCostumes.length;
    refreshCostume();
  });
  prevBtn.on('pointerover', () => prevBtn.scale.set(1.08));
  prevBtn.on('pointerout',  () => prevBtn.scale.set(1.0));

  nextBtn.on('pointerdown', () => {
    sfxMenuClick();
    costumeIndex = (costumeIndex + 1) % unlockedCostumes.length;
    refreshCostume();
  });
  nextBtn.on('pointerover', () => nextBtn.scale.set(1.08));
  nextBtn.on('pointerout',  () => nextBtn.scale.set(1.0));

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
  const fadeTargets = [title, subtitle, costumeLabel, prevBtn, costumeNameText, nextBtn, btn] as unknown as Record<string, unknown>[];
  const delays      = [0, 150, 300, 350, 350, 350, 450];
  fadeTargets.forEach((t, i) => {
    core.events.emitSync('tween/to', {
      target: t,
      props: { alpha: 1 },
      duration: 500,
      ease: 'easeOutQuad',
      delay: delays[i],
    });
  });

  // ── Button pulse animation ────────────────────────────────────────────────
  core.events.emitSync('tween/to', {
    target: btn.scale as unknown as Record<string, unknown>,
    props: { x: 1.05, y: 1.05 },
    duration: 800,
    ease: 'easeInOutSine',
    loop: true,
    yoyo: true,
    delay: 700,
  });

  // ── Background music ──────────────────────────────────────────────────────
  startBgm();

  // ── Float characters (tick-driven) ────────────────────────────────────────
  const unsubTick = core.events.on('title', 'core/tick', ({ delta }: { delta: number }) => {
    const dt = delta;
    vsText.rotation += 0.002 * dt;
    chickenContainer.y = H * 0.43 + Math.sin(Date.now() / 600) * 10;
    couragePreview.y   = H * 0.43 + Math.sin(Date.now() / 600 + Math.PI) * 10;
  });

  // ── Button handlers ───────────────────────────────────────────────────────
  btn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    await core.events.emit('scene/load', { key: 'modeselect' });
  });

  _cleanup = () => {
    core.events.removeNamespace('title');
    core.events.emitSync('tween/kill', { target: btn.scale as unknown as Record<string, unknown> });
    worldLayer.removeChild(stars, chickenContainer, couragePreview, vsText);
    uiLayer.removeChild(title, subtitle, costumeLabel, costumeNameText, prevBtn, nextBtn, btn, devBtn);
    stars.destroy({ children: true });
    chickenContainer.destroy({ children: true });
    couragePreview.destroy({ children: true });
    vsText.destroy();
    title.destroy();
    subtitle.destroy();
    costumeLabel.destroy();
    costumeNameText.destroy();
    prevBtn.destroy({ children: true });
    nextBtn.destroy({ children: true });
    btn.destroy({ children: true });
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
