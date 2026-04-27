import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { endlessState, costumeState, skillState, equipmentState } from '../game/store';
import { pickRandomBuffs, ALL_BUFFS, buffDesc } from '../game/endless';
import type { BuffDef, StatContext } from '../game/endless';
import { FROST_GEM_INVINCIBLE_BONUS } from '../constants';
import { sfxWaveClear, sfxMenuClick } from '../game/audio';

let _cleanup: (() => void) | null = null;

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // ── Audio ─────────────────────────────────────────────────────────────────
  sfxWaveClear();

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ────────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Dimmed overlay ────────────────────────────────────────────────────────
  const overlay = new Graphics();
  overlay.rect(0, 0, W, H).fill({ color: 0x000022, alpha: 0.78 });
  worldLayer.addChild(overlay);

  // ── Title banner ─────────────────────────────────────────────────────────
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 32,
    fontWeight: 'bold',
    fill: 0xffee44,
    stroke: { color: 0x553300, width: 4 },
    dropShadow: { color: 0xff8800, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleText = new Text({
    text: `第 ${endlessState.wave - 1} 波通關！`,
    style: titleStyle,
  });
  titleText.anchor.set(0.5);
  titleText.x = W * 0.5;
  titleText.y = H * 0.11;
  uiLayer.addChild(titleText);

  const subStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 18,
    fill: 0xddddff,
  });
  const subText = new Text({ text: '選擇一個強化效果', style: subStyle });
  subText.anchor.set(0.5);
  subText.x = W * 0.5;
  subText.y = H * 0.19;
  uiLayer.addChild(subText);

  // ── Wave info ─────────────────────────────────────────────────────────────
  const waveInfoStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xaaddff,
  });
  const waveInfoText = new Text({
    text: `即將挑戰第 ${endlessState.wave} 波`,
    style: waveInfoStyle,
  });
  waveInfoText.anchor.set(0.5);
  waveInfoText.x = W * 0.5;
  waveInfoText.y = H * 0.25;
  uiLayer.addChild(waveInfoText);

  // ── Buff cards ────────────────────────────────────────────────────────────
  const buffs: BuffDef[] = pickRandomBuffs(3, endlessState.buffs);

  // Build the stat context from the current equipment / costume / skill state so
  // that buff descriptions show the actual in-game values rather than raw buff math.
  const _eqWeapon    = equipmentState.equippedSlots.weapon;
  const _eqArmor     = equipmentState.equippedSlots.armor;
  const _eqAccessory = equipmentState.equippedSlots.accessory;
  const statCtx: StatContext = {
    equipAttackBonus:    _eqWeapon    === 'rapid_shot'          ? (equipmentState.upgradeLevels['rapid_shot']          ?? 1) * 1                     : 0,
    equipDefenseBonus:   _eqArmor     === 'iron_shield'         ? (equipmentState.upgradeLevels['iron_shield']         ?? 1) * 1                     : 0,
    equipInvincibleBonus:_eqArmor     === 'frost_gem'           ? (equipmentState.upgradeLevels['frost_gem']           ?? 1) * FROST_GEM_INVINCIBLE_BONUS : 0,
    equipEvasionBonus:   _eqArmor     === 'moon_cape'           ? (equipmentState.upgradeLevels['moon_cape']           ?? 1) * 0.01                  : 0,
    isBossCostume: costumeState.selected === 'boss',
    isFoxCostume:  costumeState.selected === 'fox',
    skillIronWill: skillState.selected   === 'iron_will',
    levelItemDropMult: 1.0, // endless mode has no per-level drop multiplier
  };
  const cardW = W * 0.78;
  const cardH = 110;
  const cardGap = 16;
  const totalCardsH = buffs.length * cardH + (buffs.length - 1) * cardGap;
  const cardsStartY = H * 0.5 - totalCardsH / 2;

  const cardContainers: Container[] = [];

  buffs.forEach((buff, i) => {
    const card = new Container();
    card.eventMode = 'static';
    card.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, cardW, cardH, 14)
      .fill({ color: buff.color, alpha: 0.95 });
    bg.roundRect(0, 0, cardW, cardH, 14)
      .stroke({ color: buff.borderColor, width: 2.5 });
    card.addChild(bg);

    const nameStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: buff.borderColor,
    });
    const nameText = new Text({ text: buff.name, style: nameStyle });
    nameText.x = 18;
    nameText.y = 14;
    card.addChild(nameText);

    const descStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 15,
      fill: 0xdddddd,
      lineHeight: 22,
    });
    const descText = new Text({ text: buffDesc(buff.id, endlessState.buffs, endlessState.currentHp, statCtx), style: descStyle });
    descText.x = 18;
    descText.y = 48;
    card.addChild(descText);

    card.x = (W - cardW) / 2;
    card.y = cardsStartY + i * (cardH + cardGap);
    card.alpha = 0;
    uiLayer.addChild(card);
    cardContainers.push(card);

    // Staggered fade-in
    core.events.emitSync('tween/to', {
      target: card as unknown as Record<string, unknown>,
      props: { alpha: 1 },
      duration: 350,
      ease: 'easeOutQuad',
      delay: 100 + i * 100,
    });

    card.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, cardW, cardH, 14)
        .fill({ color: buff.color, alpha: 1 });
      bg.roundRect(0, 0, cardW, cardH, 14)
        .stroke({ color: buff.borderColor, width: 3 });
      card.scale.set(1.03);
    });

    card.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, cardW, cardH, 14)
        .fill({ color: buff.color, alpha: 0.95 });
      bg.roundRect(0, 0, cardW, cardH, 14)
        .stroke({ color: buff.borderColor, width: 2.5 });
      card.scale.set(1.0);
    });

    card.on('pointerdown', async () => {
      // Disable all cards to prevent double-click
      cardContainers.forEach(c => { c.eventMode = 'none'; });
      sfxMenuClick();
      endlessState.buffs.push(buff.id);
      await core.events.emit('scene/load', { key: 'game' });
    });
  });

  // ── Accumulated buffs display ─────────────────────────────────────────────
  let accText: Text | null = null;
  if (endlessState.buffs.length > 0) {
    const accStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 12,
      fill: 0x8899aa,
      align: 'center',
    });
    const buffNames = endlessState.buffs.map(id => {
      const found = ALL_BUFFS.find(b => b.id === id);
      return found ? found.name : id;
    });
    accText = new Text({
      text: `已選強化：${buffNames.join('・')}`,
      style: accStyle,
    });
    accText.anchor.set(0.5);
    accText.x = W * 0.5;
    accText.y = H * 0.93;
    uiLayer.addChild(accText);
  }

  _cleanup = () => {
    core.events.removeNamespace('endlessbuff');
    worldLayer.removeChild(stars, overlay);
    uiLayer.removeChild(titleText, subText, waveInfoText, ...cardContainers);
    stars.destroy({ children: true });
    overlay.destroy();
    titleText.destroy();
    subText.destroy();
    waveInfoText.destroy();
    cardContainers.forEach(c => c.destroy({ children: true }));
    if (accText) {
      uiLayer.removeChild(accText);
      accText.destroy();
    }
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const EndlessBuffScene: SceneDescriptor = {
  key: 'endlessbuff',
  enter,
  exit,
};
