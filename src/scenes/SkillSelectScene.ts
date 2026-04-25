import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { SKILLS } from '../game/skills';
import type { SkillDef, SkillId } from '../game/skills';
import { skillState, endlessState, voidState } from '../game/store';
import { sfxMenuClick } from '../game/audio';

let _cleanup: (() => void) | null = null;

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // Reset skill selection each time this scene is entered
  skillState.selected = null;

  // ── Background ─────────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Title ──────────────────────────────────────────────────────────────────
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 32,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleLabel = new Text({ text: '選擇技能', style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.06;
  uiLayer.addChild(titleLabel);

  // ── Sub-title ──────────────────────────────────────────────────────────────
  const subtitleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 13,
    fill: 0xaaaaaa,
    align: 'center',
  });
  const subtitleLabel = new Text({ text: '每次最多攜帶一種技能　可跳過不選', style: subtitleStyle });
  subtitleLabel.anchor.set(0.5);
  subtitleLabel.x = W * 0.5;
  subtitleLabel.y = H * 0.12;
  uiLayer.addChild(subtitleLabel);

  // ── Skill description area ─────────────────────────────────────────────────
  const descBg = new Graphics();
  descBg.roundRect(W * 0.05, H * 0.14, W * 0.9, 68, 8)
    .fill({ color: 0x111122, alpha: 0.85 });
  uiLayer.addChild(descBg);

  const descStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xdddddd,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: W * 0.88,
  });
  const descLabel = new Text({ text: '選擇一個技能，或按「跳過」直接出發', style: descStyle });
  descLabel.anchor.set(0.5);
  descLabel.x = W * 0.5;
  descLabel.y = H * 0.14 + 34;
  uiLayer.addChild(descLabel);

  // ── Skill cards (2 columns × 3 rows) ──────────────────────────────────────
  const cardW = 168;
  const cardH = 110;
  const cols = 2;
  const startX = W * 0.5 - (cols * cardW + (cols - 1) * 10) / 2 + cardW / 2;
  const startY = H * 0.27;
  const gapX = cardW + 12;
  const gapY = cardH + 10;

  let selectedId: SkillId | null = skillState.selected;
  const cards: Container[] = [];

  function buildCard(index: number): Container {
    const skill: SkillDef = SKILLS[index];
    const isSelected = skill.id === selectedId;

    const card = new Container();
    card.eventMode = 'static';
    card.cursor = 'pointer';

    const borderCol = isSelected ? 0xffd700 : skill.borderColor;
    const fillCol = isSelected ? 0x332200 : skill.color;

    const bg = new Graphics();
    bg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10)
      .fill({ color: fillCol, alpha: 0.92 });
    bg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10)
      .stroke({ color: borderCol, width: isSelected ? 2.5 : 1.5 });
    card.addChild(bg);

    // Skill type badge
    const badgeStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 10,
      fill: skill.type === 'active' ? 0xffcc44 : 0x88ffbb,
      fontWeight: 'bold',
    });
    const badge = new Text({ text: skill.type === 'active' ? '● 主動' : '◆ 被動', style: badgeStyle });
    badge.anchor.set(0.5, 0);
    badge.x = 0;
    badge.y = -cardH / 2 + 6;
    card.addChild(badge);

    // Skill name
    const nameStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 17,
      fontWeight: 'bold',
      fill: isSelected ? 0xffd700 : 0xffffff,
    });
    const nameText = new Text({ text: skill.name, style: nameStyle });
    nameText.anchor.set(0.5);
    nameText.x = 0;
    nameText.y = -cardH / 2 + 32;
    card.addChild(nameText);

    // Skill description (short, single line per card)
    const shortDesc = skill.type === 'active'
      ? `按鍵觸發 | 冷卻 ${(skill.cooldownMs! / 1000)}s`
      : '被動永久生效';
    const shortDescStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 11,
      fill: isSelected ? 0xffeeaa : 0xaaaaaa,
    });
    const shortDescText = new Text({ text: shortDesc, style: shortDescStyle });
    shortDescText.anchor.set(0.5);
    shortDescText.x = 0;
    shortDescText.y = -cardH / 2 + 52;
    card.addChild(shortDescText);

    // Skill effect description
    const effectStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 12,
      fill: isSelected ? 0xffffff : 0xccddff,
      fontWeight: 'bold',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: cardW - 12,
    });
    const effectText = new Text({ text: skill.effect, style: effectStyle });
    effectText.anchor.set(0.5);
    effectText.x = 0;
    effectText.y = -cardH / 2 + 74;
    card.addChild(effectText);

    // Selection indicator
    if (isSelected) {
      const checkStyle = new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: 0xffd700,
      });
      const check = new Text({ text: '✓', style: checkStyle });
      check.anchor.set(0.5);
      check.x = 0;
      check.y = cardH / 2 - 20;
      card.addChild(check);
    }

    const col = index % cols;
    const row = Math.floor(index / cols);
    card.x = startX + col * gapX;
    card.y = startY + row * gapY;

    card.on('pointerdown', () => {
      sfxMenuClick();
      if (selectedId === skill.id) {
        // Deselect on second tap
        selectedId = null;
        skillState.selected = null;
      } else {
        selectedId = skill.id;
        skillState.selected = selectedId;
      }
      refreshDesc();
      rebuildCards();
    });
    card.on('pointerover', () => card.scale.set(1.04));
    card.on('pointerout', () => card.scale.set(1.0));

    return card;
  }

  function rebuildCards(): void {
    cards.forEach(c => {
      uiLayer.removeChild(c);
      c.destroy({ children: true });
    });
    cards.length = 0;
    SKILLS.forEach((_, i) => {
      const card = buildCard(i);
      uiLayer.addChild(card);
      cards.push(card);
    });
  }

  function refreshDesc(): void {
    if (selectedId === null) {
      descLabel.text = '選擇一個技能，或按「跳過」直接出發';
    } else {
      const skill = SKILLS.find(s => s.id === selectedId)!;
      // Show description without newlines for the single-line box
      descLabel.text = skill.description.replace(/\n/g, '　');
    }
  }

  rebuildCards();

  // ── Confirm button ──────────────────────────────────────────────────────────
  const confirmBtnW = 180;
  const confirmBtnH = 48;
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
    fontSize: 22,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const confirmText = new Text({ text: '出發！', style: confirmStyle });
  confirmText.anchor.set(0.5);
  confirmBtn.addChild(confirmText);

  confirmBtn.x = W * 0.62;
  confirmBtn.y = H * 0.93;
  uiLayer.addChild(confirmBtn);

  confirmBtn.on('pointerdown', async () => {
    sfxMenuClick();
    await core.events.emit('scene/load', { key: 'game' });
  });
  confirmBtn.on('pointerover', () => confirmBtn.scale.set(1.04));
  confirmBtn.on('pointerout', () => confirmBtn.scale.set(1.0));

  // ── Skip button ─────────────────────────────────────────────────────────────
  const skipBtnW = 120;
  const skipBtnH = 48;
  const skipBtn = new Container();
  skipBtn.eventMode = 'static';
  skipBtn.cursor = 'pointer';

  const skipBg = new Graphics();
  skipBg.roundRect(-skipBtnW / 2, -skipBtnH / 2, skipBtnW, skipBtnH, 10)
    .fill({ color: 0x223344, alpha: 0.88 });
  skipBg.roundRect(-skipBtnW / 2, -skipBtnH / 2, skipBtnW, skipBtnH, 10)
    .stroke({ color: 0x5566aa, width: 1.5 });
  skipBtn.addChild(skipBg);

  const skipStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 17,
    fill: 0xaabbdd,
  });
  const skipText = new Text({ text: '跳過', style: skipStyle });
  skipText.anchor.set(0.5);
  skipBtn.addChild(skipText);

  skipBtn.x = W * 0.24;
  skipBtn.y = H * 0.93;
  uiLayer.addChild(skipBtn);

  skipBtn.on('pointerdown', async () => {
    sfxMenuClick();
    skillState.selected = null;
    await core.events.emit('scene/load', { key: 'game' });
  });
  skipBtn.on('pointerover', () => skipBtn.scale.set(1.04));
  skipBtn.on('pointerout', () => skipBtn.scale.set(1.0));

  // ── Back button ─────────────────────────────────────────────────────────────
  const backBtnW = 100;
  const backBtnH = 36;
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
  backBtn.y = H * 0.06;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    sfxMenuClick();
    const dest = (endlessState.active || voidState.active) ? 'modeselect' : 'levelselect';
    await core.events.emit('scene/load', { key: dest });
  });
  backBtn.on('pointerover', () => backBtn.scale.set(1.04));
  backBtn.on('pointerout', () => backBtn.scale.set(1.0));

  // ── Tick: subtle title float ────────────────────────────────────────────────
  const unsubTick = core.events.on('skillselect', 'core/tick', () => {
    titleLabel.y = H * 0.06 + Math.sin(Date.now() / 900) * 2;
  });

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('skillselect');
    unsubTick();

    worldLayer.removeChild(stars);
    stars.destroy({ children: true });

    uiLayer.removeChild(titleLabel, subtitleLabel, descBg, descLabel, confirmBtn, skipBtn, backBtn);
    titleLabel.destroy();
    subtitleLabel.destroy();
    descBg.destroy();
    descLabel.destroy();
    confirmBtn.destroy({ children: true });
    skipBtn.destroy({ children: true });
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

export const SkillSelectScene: SceneDescriptor = {
  key: 'skillselect',
  enter,
  exit,
};
