import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { endlessState, devConfig, voidState } from '../game/store';
import { startBgm, sfxMenuClick } from '../game/audio';
import { saveProgress } from '../game/persistence';

let _cleanup: (() => void) | null = null;
let _transitioning = false;

async function enter(core: Core): Promise<void> {
  _transitioning = false;
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  startBgm();

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ───────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Title ─────────────────────────────────────────────────────────────────
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 34,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleLabel = new Text({ text: '選擇模式', style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.12;
  uiLayer.addChild(titleLabel);

  // ── Helper to build a mode button ────────────────────────────────────────
  function makeModeBtn(opts: {
    label: string;
    subLabel?: string;
    fillColor: number;
    strokeColor: number;
    textColor: number;
    subTextColor?: number;
    w?: number;
    h?: number;
  }): Container {
    const bW = opts.w ?? 240;
    const bH = opts.h ?? 60;
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-bW / 2, -bH / 2, bW, bH, 12)
      .fill({ color: opts.fillColor, alpha: 0.9 });
    bg.roundRect(-bW / 2, -bH / 2, bW, bH, 12)
      .stroke({ color: opts.strokeColor, width: 2 });
    c.addChild(bg);

    const labelY = opts.subLabel ? -bH / 4 : 0;
    const mainText = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: opts.textColor,
      }),
    });
    mainText.anchor.set(0.5);
    mainText.y = labelY;
    c.addChild(mainText);

    if (opts.subLabel) {
      const subText = new Text({
        text: opts.subLabel,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 12,
          fill: opts.subTextColor ?? 0xaaaaaa,
        }),
      });
      subText.anchor.set(0.5);
      subText.y = bH / 4 + 2;
      c.addChild(subText);
    }

    c.on('pointerover', () => c.scale.set(1.04));
    c.on('pointerout',  () => c.scale.set(1.0));

    return c;
  }

  // ── Build buttons (positions depend on whether story mode is on) ─────────
  const storyEnabled = devConfig.storyModeEnabled;
  const allBtns: Container[] = [];

  // 關卡模式
  const levelBtn = makeModeBtn({
    label: '⚔️  關卡模式',
    subLabel: '挑戰關卡，擊敗各種敵人',
    fillColor: 0x226622,
    strokeColor: 0x44ff44,
    textColor: 0xaaffaa,
    subTextColor: 0x88cc88,
    w: 260,
    h: 70,
  });
  levelBtn.x = W * 0.5;
  levelBtn.alpha = 0;
  uiLayer.addChild(levelBtn);
  allBtns.push(levelBtn);

  levelBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    endlessState.active = false;
    await saveProgress();
    await core.events.emit('scene/load', { key: 'levelselect' });
  });

  // 故事模式 (conditional)
  let storyBtn: Container | null = null;
  if (storyEnabled) {
    storyBtn = makeModeBtn({
      label: '📖  故事模式',
      subLabel: '跟隨小雞展開冒險旅程',
      fillColor: 0x3d1a00,
      strokeColor: 0xffaa44,
      textColor: 0xffcc88,
      subTextColor: 0xcc9955,
      w: 260,
      h: 70,
    });
    storyBtn.x = W * 0.5;
    storyBtn.alpha = 0;
    uiLayer.addChild(storyBtn);
    allBtns.push(storyBtn);

    storyBtn.on('pointerdown', async () => {
      if (_transitioning) return;
      _transitioning = true;
      sfxMenuClick();
      await core.events.emit('scene/load', { key: 'story' });
    });
  }

  // 無盡模式
  const endlessBtn = makeModeBtn({
    label: '∞  無盡模式',
    subLabel: endlessState.bestWave > 1 ? `最高波數：第 ${endlessState.bestWave} 波` : '挑戰無限關卡！',
    fillColor: 0x004488,
    strokeColor: 0x44aaff,
    textColor: 0xaaddff,
    subTextColor: 0x88bbdd,
    w: 260,
    h: 70,
  });
  endlessBtn.x = W * 0.5;
  endlessBtn.alpha = 0;
  uiLayer.addChild(endlessBtn);
  allBtns.push(endlessBtn);

  endlessBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    endlessState.active = true;
    endlessState.wave = 1;
    endlessState.buffs = [];
    endlessState.score = 0;
    endlessState.periodicShieldTimer = 0;
    endlessState.regenTimer = 0;
    await saveProgress();
    await core.events.emit('scene/load', { key: 'skillselect' });
  });

  // 虛空之境
  const voidBtn = makeModeBtn({
    label: '⬛  虛空之境',
    subLabel: voidState.highScore > 0 ? `最高傷害：${voidState.highScore}` : '60秒造成最多傷害！',
    fillColor: 0x110022,
    strokeColor: 0x8833ff,
    textColor: 0xcc88ff,
    subTextColor: 0x9966cc,
    w: 260,
    h: 70,
  });
  voidBtn.x = W * 0.5;
  voidBtn.alpha = 0;
  uiLayer.addChild(voidBtn);
  allBtns.push(voidBtn);

  voidBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    voidState.active = true;
    endlessState.active = false;
    await saveProgress();
    await core.events.emit('scene/load', { key: 'skillselect' });
  });

  // ── Position all buttons vertically ──────────────────────────────────────
  // Spread them evenly between H*0.22 and H*0.88
  const topY = H * 0.22;
  const spacing = storyEnabled ? 0.165 : 0.175;
  allBtns.forEach((b, i) => {
    b.y = topY + i * spacing * H;
  });

  // ── Back button ───────────────────────────────────────────────────────────
  const backBtnW = 160, backBtnH = 44;
  const backBtn = new Container();
  backBtn.eventMode = 'static';
  backBtn.cursor = 'pointer';

  const backBg = new Graphics();
  backBg.roundRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 10)
    .fill({ color: 0x333366, alpha: 0.85 });
  backBg.roundRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 10)
    .stroke({ color: 0x7777cc, width: 1.5 });
  backBtn.addChild(backBg);

  const backText = new Text({
    text: '← 返回',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 18,
      fill: 0xccccff,
    }),
  });
  backText.anchor.set(0.5);
  backBtn.addChild(backText);

  backBtn.x = W * 0.5;
  backBtn.y = H * 0.93;
  backBtn.alpha = 0;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    await core.events.emit('scene/load', { key: 'title' });
  });
  backBtn.on('pointerover', () => backBtn.scale.set(1.04));
  backBtn.on('pointerout',  () => backBtn.scale.set(1.0));

  // ── Fade-in ───────────────────────────────────────────────────────────────
  const fadeTargets = [titleLabel, ...allBtns, backBtn] as unknown as Record<string, unknown>[];
  fadeTargets.forEach((t, i) => {
    core.events.emitSync('tween/to', {
      target: t,
      props: { alpha: 1 },
      duration: 400,
      ease: 'easeOutQuad',
      delay: i * 70,
    });
  });

  // ── Pulse on level and endless buttons ───────────────────────────────────
  core.events.emitSync('tween/to', {
    target: levelBtn.scale as unknown as Record<string, unknown>,
    props: { x: 1.04, y: 1.04 },
    duration: 900,
    ease: 'easeInOutSine',
    loop: true,
    yoyo: true,
    delay: 600,
  });

  // ── Tick: floating title ───────────────────────────────────────────────────
  const unsubTick = core.events.on('modeselect', 'core/tick', () => {
    titleLabel.y = H * 0.12 + Math.sin(Date.now() / 900) * 2;
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('modeselect');
    unsubTick();
    core.events.emitSync('tween/kill', { target: levelBtn.scale as unknown as Record<string, unknown> });
    worldLayer.removeChild(stars);
    uiLayer.removeChild(titleLabel, backBtn, ...allBtns);
    stars.destroy({ children: true });
    titleLabel.destroy();
    backBtn.destroy({ children: true });
    allBtns.forEach(b => b.destroy({ children: true }));
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const ModeSelectScene: SceneDescriptor = {
  key: 'modeselect',
  enter,
  exit,
};
