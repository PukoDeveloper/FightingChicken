import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { gameResult } from '../game/store';
import { createLevel, TOTAL_LEVELS } from '../game/levels';
import { startBgm, sfxMenuClick } from '../game/audio';

let _cleanup: (() => void) | null = null;

/** Minimum pointer travel (px) that is treated as a scroll drag instead of a tap. */
const DRAG_THRESHOLD = 8;

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // ── Audio ─────────────────────────────────────────────────────────────────
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
    fontSize: 36,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleLabel = new Text({ text: '選擇關卡', style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.12;
  uiLayer.addChild(titleLabel);

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

  const backStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 18,
    fill: 0xccccff,
  });
  const backText = new Text({ text: '回主選單', style: backStyle });
  backText.anchor.set(0.5);
  backBtn.addChild(backText);

  backBtn.x = W * 0.5;
  backBtn.y = H * 0.95;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    sfxMenuClick();
    await core.events.emit('scene/load', { key: 'modeselect' });
  });

  // ── Scrollable level list ─────────────────────────────────────────────────
  const scrollTop = H * 0.21;        // top edge of the visible list area
  const scrollBottom = H * 0.90;     // bottom edge (above back button)
  const scrollViewH = scrollBottom - scrollTop;

  // Clip region drawn as a transparent hit area so drag events register
  const scrollHitArea = new Graphics();
  scrollHitArea.rect(0, scrollTop, W, scrollViewH).fill({ color: 0x000000, alpha: 0 });
  scrollHitArea.eventMode = 'static';
  uiLayer.addChild(scrollHitArea);

  // Mask that clips the list content
  const listMask = new Graphics();
  listMask.rect(0, scrollTop, W, scrollViewH).fill({ color: 0xffffff });
  uiLayer.addChild(listMask);

  // Container that holds all the buttons; we scroll by moving its y
  const listContent = new Container();
  listContent.mask = listMask;
  uiLayer.addChild(listContent);

  const levelColors = [0x226622, 0xcc7700, 0x880088, 0x005588, 0x660000, 0x111a2a, 0x1a0a2a, 0x3a0a00];
  const levelBorderColors = [0x44ff44, 0xffaa33, 0xff88ff, 0x44bbff, 0xff4444, 0x44aaff, 0xcc44ff, 0xff6600];
  const btnW = 260, btnH = 68, btnGap = 16;
  const levelBtns: Container[] = [];

  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const cfg = createLevel(i);
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
      .fill({ color: levelColors[i - 1], alpha: 0.88 });
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
      .stroke({ color: levelBorderColors[i - 1], width: 2.5 });
    btn.addChild(bg);

    const numStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 12,
      fill: 0xaaaaaa,
    });
    const numLabel = new Text({ text: `第 ${i} 關`, style: numStyle });
    numLabel.anchor.set(0.5);
    numLabel.y = -20;
    btn.addChild(numLabel);

    const nameStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    const nameLabel = new Text({ text: cfg.name, style: nameStyle });
    nameLabel.anchor.set(0.5);
    nameLabel.y = 4;
    btn.addChild(nameLabel);

    const waveStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 12,
      fill: 0xdddddd,
    });
    const waveLabel = new Text({ text: `${cfg.waves.length} 波`, style: waveStyle });
    waveLabel.anchor.set(0.5);
    waveLabel.y = 24;
    btn.addChild(waveLabel);

    btn.x = W * 0.5;
    btn.y = scrollTop + btnH / 2 + (i - 1) * (btnH + btnGap);
    listContent.addChild(btn);
    levelBtns.push(btn);
  }

  // Total content height so we can clamp scrolling
  const contentH = TOTAL_LEVELS * (btnH + btnGap) - btnGap;
  // Maximum upward offset (negative y shift on listContent)
  const maxScroll = Math.max(0, contentH - scrollViewH);

  // ── Drag-scroll state ─────────────────────────────────────────────────────
  let dragging = false;
  let dragStartY = 0;
  let dragStartScrollY = 0;
  let totalDragDist = 0;
  let scrollOffsetY = 0;

  function applyScroll(newOffset: number): void {
    scrollOffsetY = Math.max(0, Math.min(newOffset, maxScroll));
    listContent.y = -scrollOffsetY;
  }

  scrollHitArea.on('pointerdown', (e) => {
    dragging = true;
    dragStartY = e.global.y;
    dragStartScrollY = scrollOffsetY;
    totalDragDist = 0;
  });

  scrollHitArea.on('pointermove', (e) => {
    if (!dragging) return;
    const dy = e.global.y - dragStartY;
    totalDragDist = Math.abs(dy);
    applyScroll(dragStartScrollY - dy);
  });

  const onPointerUp = (): void => {
    dragging = false;
    totalDragDist = 0;
  };

  scrollHitArea.on('pointerup', onPointerUp);
  scrollHitArea.on('pointerupoutside', onPointerUp);
  scrollHitArea.on('pointercancel', onPointerUp);

  // ── Level button tap handlers (fire only when not dragging) ──────────────
  levelBtns.forEach((btn, idx) => {
    btn.on('pointerdown', (e) => {
      // Start drag tracking from button area too
      dragging = true;
      dragStartY = e.global.y;
      dragStartScrollY = scrollOffsetY;
      totalDragDist = 0;
    });

    btn.on('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.global.y - dragStartY;
      totalDragDist = Math.abs(dy);
      applyScroll(dragStartScrollY - dy);
    });

    btn.on('pointerup', async () => {
      const wasTap = totalDragDist < DRAG_THRESHOLD;
      dragging = false;
      totalDragDist = 0;
      if (wasTap) {
        sfxMenuClick();
        gameResult.currentLevel = idx + 1;
        await core.events.emit('scene/load', { key: 'skillselect' });
      }
    });

    btn.on('pointerupoutside', onPointerUp);
    btn.on('pointercancel',    onPointerUp);
    btn.on('pointerover', () => btn.scale.set(1.04));
    btn.on('pointerout',  () => btn.scale.set(1.0));
  });

  // ── Entry animations via TweenManager ────────────────────────────────────
  levelBtns.forEach((btn, i) => {
    btn.alpha = 0;
    core.events.emitSync('tween/to', {
      target: btn as unknown as Record<string, unknown>,
      props: { alpha: 1 },
      duration: 350,
      ease: 'easeOutQuad',
      delay: 80 + i * 70,
    });
  });

  // ── Animate title ──────────────────────────────────────────────────────────
  const unsubTick = core.events.on('levelselect', 'core/tick', () => {
    titleLabel.y = H * 0.12 + Math.sin(Date.now() / 900) * 3;
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('levelselect');
    unsubTick();
    worldLayer.removeChild(stars);
    stars.destroy({ children: true });
    uiLayer.removeChild(titleLabel, backBtn, scrollHitArea, listMask, listContent);
    titleLabel.destroy();
    backBtn.destroy({ children: true });
    scrollHitArea.destroy();
    listMask.destroy();
    listContent.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const LevelSelectScene: SceneDescriptor = {
  key: 'levelselect',
  enter,
  exit,
};
