import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { startBgm, sfxMenuClick } from '../game/audio';

// ─── Story chapter data ────────────────────────────────────────────────────
interface ChapterEntry {
  number: string;
  title: string;
  subtitle: string;
}

const CHAPTERS: ChapterEntry[] = [
  { number: '序章',   title: '小雞的覺醒',   subtitle: '一切從這裡開始……' },
  { number: '第一章', title: '遇見勇氣',     subtitle: '命中注定的相遇' },
  { number: '第二章', title: '第一次對決',   subtitle: '初戰告捷，卻留下疑問' },
  { number: '第三章', title: '幽靈之謎',     subtitle: '神秘的幻影在暗中窺視' },
  { number: '第四章', title: '混沌的降臨',   subtitle: '星空深處的真正主人現身' },
];

const CHAPTER_ITEM_H = 88;
const CHAPTER_ITEM_GAP = 12;
const CHAPTER_ITEM_W = 320;

let _cleanup: (() => void) | null = null;
let _inputReady = false;

async function enter(core: Core): Promise<void> {
  _inputReady = false;
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // Unlock interaction after a short delay so the tap that opened this scene
  // cannot immediately trigger a chapter button.
  const inputLockTimer = window.setTimeout(() => { _inputReady = true; }, 400);

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
    fontSize: 32,
    fontWeight: 'bold',
    fill: 0xffcc55,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff8800, distance: 3, alpha: 0.8, blur: 2 },
  });
  const titleLabel = new Text({ text: '📖  故事模式', style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.09;
  uiLayer.addChild(titleLabel);

  // ── Scrollable chapter list ───────────────────────────────────────────────
  const listTop    = H * 0.17;
  const listBottom = H * 0.88;
  const listHeight = listBottom - listTop;

  // Mask that clips the list
  const maskRect = new Graphics();
  maskRect.rect(0, listTop, W, listHeight).fill({ color: 0xffffff });
  uiLayer.addChild(maskRect);

  // Outer container that stays fixed; inner scroll container moves
  const outerList = new Container();
  outerList.mask = maskRect;
  uiLayer.addChild(outerList);

  const innerList = new Container();
  innerList.x = (W - CHAPTER_ITEM_W) / 2;
  innerList.y = listTop;
  outerList.addChild(innerList);

  // Build chapter items
  const totalContentH = CHAPTERS.length * (CHAPTER_ITEM_H + CHAPTER_ITEM_GAP) - CHAPTER_ITEM_GAP;

  /** Maps a 0-based chapter index to its scene key, or null if not yet implemented. */
  function chapterSceneKey(idx: number): string | null {
    const keys: Record<number, string> = {
      0: 'story_prologue',
      1: 'story_ch1',
      2: 'story_ch2',
      3: 'story_ch3',
      4: 'story_ch4',
    };
    return keys[idx] ?? null;
  }

  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    const itemY = i * (CHAPTER_ITEM_H + CHAPTER_ITEM_GAP);
    // Chapter 0 (prologue), Chapter 1 (index 1), Chapter 2 (index 2), Chapter 3 (index 3), and Chapter 4 (index 4) are playable; all others are coming soon
    const isPlayable = chapterSceneKey(i) !== null;

    const item = new Container();
    item.y = itemY;
    if (isPlayable) {
      item.eventMode = 'static';
      item.cursor = 'pointer';
    }

    // Background card
    const cardBg = new Graphics();
    cardBg.roundRect(0, 0, CHAPTER_ITEM_W, CHAPTER_ITEM_H, 10)
      .fill({ color: isPlayable ? 0x1a2a1a : 0x1a1a3a, alpha: 0.9 });
    cardBg.roundRect(0, 0, CHAPTER_ITEM_W, CHAPTER_ITEM_H, 10)
      .stroke({ color: isPlayable ? 0x44ff88 : 0xffaa44, width: isPlayable ? 2 : 1.5 });
    item.addChild(cardBg);

    // Chapter number label
    const numStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 12,
      fill: 0xffcc88,
    });
    const numLabel = new Text({ text: ch.number, style: numStyle });
    numLabel.x = 16;
    numLabel.y = 14;
    item.addChild(numLabel);

    // Chapter title
    const namStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: isPlayable ? 0xeeffee : 0xffffff,
    });
    const namLabel = new Text({ text: ch.title, style: namStyle });
    namLabel.x = 16;
    namLabel.y = 30;
    item.addChild(namLabel);

    // Chapter subtitle
    const subStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 13,
      fill: isPlayable ? 0x88cc88 : 0xaaaaaa,
    });
    const subLabel = new Text({ text: ch.subtitle, style: subStyle });
    subLabel.x = 16;
    subLabel.y = 58;
    item.addChild(subLabel);

    // Right badge: "▶ 開始" for playable, "即將推出" for others
    const badgeStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 11,
      fill: isPlayable ? 0x44ff88 : 0x888888,
    });
    const badgeLabel = new Text({
      text: isPlayable ? '▶ 開始' : '即將推出',
      style: badgeStyle,
    });
    badgeLabel.anchor.set(1, 0.5);
    badgeLabel.x = CHAPTER_ITEM_W - 14;
    badgeLabel.y = CHAPTER_ITEM_H / 2;
    item.addChild(badgeLabel);

    if (isPlayable) {
      item.on('pointerover', () => item.scale.set(1.03));
      item.on('pointerout',  () => item.scale.set(1.0));
      item.on('pointerdown', async () => {
        if (!_inputReady) return;
        sfxMenuClick();
        await core.events.emit('scene/load', { key: chapterSceneKey(i)! });
      });
    }

    innerList.addChild(item);
  }

  // ── Scroll logic ──────────────────────────────────────────────────────────
  const maxScrollY = Math.max(0, totalContentH - listHeight);
  let scrollY = 0;
  let dragStartPointerY = 0;
  let dragStartScrollY  = 0;
  let isDragging = false;
  let velocity = 0;
  let lastPointerY = 0;
  let totalDragDist = 0;

  // Make the outer list interactive for pointer events
  const scrollHitArea = new Graphics();
  scrollHitArea.rect(0, listTop, W, listHeight).fill({ color: 0x000000, alpha: 0.001 });
  scrollHitArea.eventMode = 'static';
  scrollHitArea.cursor = 'default';
  scrollHitArea.hitArea = new Rectangle(0, listTop, W, listHeight);
  uiLayer.addChild(scrollHitArea);

  function applyScroll(y: number): void {
    scrollY = Math.max(0, Math.min(maxScrollY, y));
    innerList.y = listTop - scrollY;
  }

  scrollHitArea.on('pointerdown', (e) => {
    isDragging = true;
    dragStartPointerY = e.global.y;
    dragStartScrollY  = scrollY;
    lastPointerY = e.global.y;
    velocity = 0;
    totalDragDist = 0;
  });

  scrollHitArea.on('pointermove', (e) => {
    if (!isDragging) return;
    const dy = dragStartPointerY - e.global.y;
    totalDragDist += Math.abs(e.global.y - lastPointerY);
    velocity = lastPointerY - e.global.y;
    lastPointerY = e.global.y;
    applyScroll(dragStartScrollY + dy);
  });

  const endDrag = (e: { global: { x: number; y: number } }): void => {
    isDragging = false;
    // Treat minimal movement as a tap and forward to the correct chapter item
    if (_inputReady && totalDragDist < 8) {
      const innerPos = innerList.getGlobalPosition();
      const localY = e.global.y - innerPos.y;
      const localX = e.global.x - innerPos.x;
      const idx = Math.floor(localY / (CHAPTER_ITEM_H + CHAPTER_ITEM_GAP));
      if (idx >= 0 && idx < CHAPTERS.length) {
        const remainder = localY - idx * (CHAPTER_ITEM_H + CHAPTER_ITEM_GAP);
        if (remainder < CHAPTER_ITEM_H && localX >= 0 && localX < CHAPTER_ITEM_W) {
          const key = chapterSceneKey(idx);
          if (key !== null) {
            sfxMenuClick();
            void core.events.emit('scene/load', { key });
          }
        }
      }
    }
  };
  scrollHitArea.on('pointerup', endDrag);
  scrollHitArea.on('pointerupoutside', () => { isDragging = false; });

  // Momentum / inertia via tick
  const unsubTick = core.events.on('story', 'core/tick', () => {
    titleLabel.y = H * 0.09 + Math.sin(Date.now() / 900) * 2;

    if (!isDragging && Math.abs(velocity) > 0.3) {
      applyScroll(scrollY + velocity);
      velocity *= 0.92;
    }
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

  const backStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 18,
    fill: 0xccccff,
  });
  const backText = new Text({ text: '回主選單', style: backStyle });
  backText.anchor.set(0.5);
  backBtn.addChild(backText);

  backBtn.x = W * 0.5;
  backBtn.y = H * 0.945;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    if (!_inputReady) return;
    sfxMenuClick();
    await core.events.emit('scene/load', { key: 'modeselect' });
  });

  // ── Entry fade-in ─────────────────────────────────────────────────────────
  titleLabel.alpha = 0;
  outerList.alpha = 0;
  backBtn.alpha   = 0;

  core.events.emitSync('tween/to', {
    target: titleLabel as unknown as Record<string, unknown>,
    props: { alpha: 1 }, duration: 400, ease: 'easeOutQuad', delay: 0,
  });
  core.events.emitSync('tween/to', {
    target: outerList as unknown as Record<string, unknown>,
    props: { alpha: 1 }, duration: 400, ease: 'easeOutQuad', delay: 150,
  });
  core.events.emitSync('tween/to', {
    target: backBtn as unknown as Record<string, unknown>,
    props: { alpha: 1 }, duration: 400, ease: 'easeOutQuad', delay: 300,
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    clearTimeout(inputLockTimer);
    core.events.removeNamespace('story');
    unsubTick();
    worldLayer.removeChild(stars);
    uiLayer.removeChild(titleLabel, maskRect, outerList, scrollHitArea, backBtn);
    stars.destroy({ children: true });
    titleLabel.destroy();
    maskRect.destroy();
    outerList.destroy({ children: true });
    scrollHitArea.destroy();
    backBtn.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const StoryScene: SceneDescriptor = {
  key: 'story',
  enter,
  exit,
};
