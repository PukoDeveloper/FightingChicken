import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import {
  createChickenDisplay,
  createElegantChickenDisplay,
  createMooseChickenDisplay,
  createAdventureChickenDisplay,
  createHeroChickenDisplay,
  createBossChickenDisplay,
  createStarfield,
} from '../game/sprites';
import { costumeState } from '../game/store';
import { endlessState } from '../game/store';
import { COSTUMES, isCostumeUnlocked } from '../game/costumes';
import type { CostumeId } from '../game/costumes';

let _cleanup: (() => void) | null = null;

/** Build the preview Container for the given costume. */
function buildPreview(id: CostumeId): Container {
  switch (id) {
    case 'elegant':   return createElegantChickenDisplay();
    case 'moose':     return createMooseChickenDisplay();
    case 'adventure': return createAdventureChickenDisplay();
    case 'hero':      return createHeroChickenDisplay();
    case 'boss':      return createBossChickenDisplay();
    default:          return createChickenDisplay();
  }
}

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

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
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleLabel = new Text({ text: '選擇造型', style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.07;
  uiLayer.addChild(titleLabel);

  // ── Preview area ──────────────────────────────────────────────────────────
  let selectedId: CostumeId = costumeState.selected;

  // Ensure the saved selection is still unlocked; fall back to default
  if (!isCostumeUnlocked(selectedId, costumeState.clearedLevels, endlessState.bestWave)) {
    selectedId = 'default';
  }

  const previewContainer = new Container();
  previewContainer.x = W * 0.5;
  previewContainer.y = H * 0.23;
  worldLayer.addChild(previewContainer);

  let currentPreview = buildPreview(selectedId);
  currentPreview.scale.set(2.2);
  previewContainer.addChild(currentPreview);

  // ── Costume name + description ────────────────────────────────────────────
  const nameStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 22,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const nameLabel = new Text({ text: '', style: nameStyle });
  nameLabel.anchor.set(0.5);
  nameLabel.x = W * 0.5;
  nameLabel.y = H * 0.37;
  uiLayer.addChild(nameLabel);

  const descStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xdddddd,
    align: 'center',
  });
  const descLabel = new Text({ text: '', style: descStyle });
  descLabel.anchor.set(0.5);
  descLabel.x = W * 0.5;
  descLabel.y = H * 0.43;
  uiLayer.addChild(descLabel);

  function refreshLabels(id: CostumeId): void {
    const cfg = COSTUMES.find(c => c.id === id)!;
    nameLabel.text = cfg.name;
    descLabel.text = cfg.description;
  }
  refreshLabels(selectedId);

  // ── Costume card grid (2 columns × 3 rows) ────────────────────────────────
  const cardW = 148, cardH = 72;
  const cols = 2;
  const startX = W * 0.5 - (cols * cardW + (cols - 1) * 10) / 2 + cardW / 2;
  const startY = H * 0.52;
  const gapX = cardW + 12;
  const gapY = cardH + 12;

  const cards: Container[] = [];

  function buildCard(index: number): Container {
    const cfg = COSTUMES[index];
    const unlocked = isCostumeUnlocked(cfg.id, costumeState.clearedLevels, endlessState.bestWave);
    const isSelected = cfg.id === selectedId;

    const card = new Container();
    card.eventMode = 'static';
    card.cursor = unlocked ? 'pointer' : 'default';

    const bg = new Graphics();
    const borderCol = isSelected ? 0xffd700 : (unlocked ? 0x4466aa : 0x333333);
    const fillCol   = isSelected ? 0x443300 : (unlocked ? 0x112244 : 0x1a1a1a);
    bg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10)
      .fill({ color: fillCol, alpha: 0.92 });
    bg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10)
      .stroke({ color: borderCol, width: isSelected ? 2.5 : 1.5 });
    card.addChild(bg);

    const cardNameStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      fill: unlocked ? 0xffffff : 0x666666,
    });
    const cardName = new Text({ text: cfg.name, style: cardNameStyle });
    cardName.anchor.set(0.5);
    cardName.y = -12;
    card.addChild(cardName);

    const hintStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 11,
      fill: unlocked ? 0x88aacc : 0x555555,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: cardW - 16,
    });
    const hintText = unlocked ? '已解鎖' : `🔒 ${cfg.unlockHint}`;
    const hint = new Text({ text: hintText, style: hintStyle });
    hint.anchor.set(0.5);
    hint.y = 14;
    card.addChild(hint);

    const col = index % cols;
    const row = Math.floor(index / cols);
    card.x = startX + col * gapX;
    card.y = startY + row * gapY;

    if (unlocked) {
      card.on('pointerdown', () => {
        selectedId = cfg.id;
        costumeState.selected = selectedId;
        refreshLabels(selectedId);
        rebuildCards();
        rebuildPreview();
      });
      card.on('pointerover', () => card.scale.set(1.04));
      card.on('pointerout',  () => card.scale.set(1.0));
    }

    return card;
  }

  function rebuildCards(): void {
    cards.forEach(c => {
      uiLayer.removeChild(c);
      c.destroy({ children: true });
    });
    cards.length = 0;
    COSTUMES.forEach((_, i) => {
      const card = buildCard(i);
      uiLayer.addChild(card);
      cards.push(card);
    });
  }

  function rebuildPreview(): void {
    previewContainer.removeChild(currentPreview);
    currentPreview.destroy({ children: true });
    currentPreview = buildPreview(selectedId);
    currentPreview.scale.set(2.2);
    previewContainer.addChild(currentPreview);
  }

  rebuildCards();

  // ── Confirm button ────────────────────────────────────────────────────────
  const confirmBtnW = 200, confirmBtnH = 52;
  const confirmBtn = new Container();
  confirmBtn.eventMode = 'static';
  confirmBtn.cursor = 'pointer';

  const confirmBg = new Graphics();
  confirmBg.roundRect(-confirmBtnW / 2, -confirmBtnH / 2, confirmBtnW, confirmBtnH, 12)
    .fill({ color: 0xcc0000, alpha: 0.9 });
  confirmBg.roundRect(-confirmBtnW / 2, -confirmBtnH / 2, confirmBtnW, confirmBtnH, 12)
    .stroke({ color: 0xff6644, width: 2 });
  confirmBtn.addChild(confirmBg);

  const confirmStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 24,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const confirmText = new Text({ text: '出發！', style: confirmStyle });
  confirmText.anchor.set(0.5);
  confirmBtn.addChild(confirmText);

  confirmBtn.x = W * 0.5;
  confirmBtn.y = H * 0.93;
  uiLayer.addChild(confirmBtn);

  confirmBtn.on('pointerdown', async () => {
    costumeState.selected = selectedId;
    await core.events.emit('scene/load', { key: 'game' });
  });
  confirmBtn.on('pointerover', () => confirmBtn.scale.set(1.04));
  confirmBtn.on('pointerout',  () => confirmBtn.scale.set(1.0));

  // ── Back button ───────────────────────────────────────────────────────────
  const backBtnW = 100, backBtnH = 36;
  const backBtn = new Container();
  backBtn.eventMode = 'static';
  backBtn.cursor = 'pointer';

  const backBg = new Graphics();
  backBg.roundRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 8)
    .fill({ color: 0x333366, alpha: 0.85 });
  backBg.roundRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 8)
    .stroke({ color: 0x7777cc, width: 1.5 });
  backBtn.addChild(backBg);

  const backStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 16,
    fill: 0xccccff,
  });
  const backText = new Text({ text: '← 返回', style: backStyle });
  backText.anchor.set(0.5);
  backBtn.addChild(backText);

  backBtn.x = W * 0.14;
  backBtn.y = H * 0.07;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    if (endlessState.active) {
      await core.events.emit('scene/load', { key: 'title' });
    } else {
      await core.events.emit('scene/load', { key: 'levelselect' });
    }
  });
  backBtn.on('pointerover', () => backBtn.scale.set(1.04));
  backBtn.on('pointerout',  () => backBtn.scale.set(1.0));

  // ── Tick: float preview, pulse confirm button ─────────────────────────────
  let confirmScale = 1;
  let confirmDir = 1;

  const unsubTick = core.events.on('costumeselect', 'core/tick', ({ delta }: { delta: number }) => {
    titleLabel.y = H * 0.07 + Math.sin(Date.now() / 900) * 2;

    confirmScale += 0.0008 * confirmDir * delta;
    if (confirmScale > 1.05) confirmDir = -1;
    if (confirmScale < 0.97) confirmDir = 1;
    confirmBtn.scale.set(confirmScale);

    previewContainer.y = H * 0.23 + Math.sin(Date.now() / 700) * 6;
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('costumeselect');
    unsubTick();

    worldLayer.removeChild(stars, previewContainer);
    stars.destroy({ children: true });
    currentPreview.destroy({ children: true });
    previewContainer.destroy({ children: true });

    uiLayer.removeChild(titleLabel, nameLabel, descLabel, confirmBtn, backBtn);
    titleLabel.destroy();
    nameLabel.destroy();
    descLabel.destroy();
    confirmBtn.destroy({ children: true });
    backBtn.destroy({ children: true });

    cards.forEach(c => {
      uiLayer.removeChild(c);
      c.destroy({ children: true });
    });
    cards.length = 0;
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const CostumeSelectScene: SceneDescriptor = {
  key: 'costumeselect',
  enter,
  exit,
};
