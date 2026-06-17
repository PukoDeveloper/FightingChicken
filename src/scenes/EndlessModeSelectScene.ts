import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { endlessState } from '../game/store';
import type { EndlessVariant } from '../game/store';
import { startBgm, sfxMenuClick } from '../game/audio';
import { saveProgress } from '../game/persistence';
import { TEXT } from '../game/i18n';

let _cleanup: (() => void) | null = null;
let _transitioning = false;

function resetEndlessRun(variant: EndlessVariant): void {
  endlessState.active = true;
  endlessState.variant = variant;
  endlessState.wave = 1;
  endlessState.buffs = [];
  endlessState.currentHp = 0;
  endlessState.score = 0;
  endlessState.surgeElapsedMs = 0;
  endlessState.lastSurgeMs = 0;
  endlessState.periodicShieldTimer = 0;
  endlessState.regenTimer = 0;
}

async function enter(core: Core): Promise<void> {
  _transitioning = false;

  const W = core.app.screen.width;
  const H = core.app.screen.height;

  startBgm();

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 34,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleLabel = new Text({ text: TEXT.modes.endless.selectTitle, style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.14;
  uiLayer.addChild(titleLabel);

  function makeModeCard(opts: {
    label: string;
    subLabel: string;
    fillColor: number;
    strokeColor: number;
    textColor: number;
    subTextColor: number;
  }): Container {
    const cardW = W * 0.78;
    const cardH = 112;
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 16)
      .fill({ color: opts.fillColor, alpha: 0.92 });
    bg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 16)
      .stroke({ color: opts.strokeColor, width: 2.5 });
    c.addChild(bg);

    const labelText = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 26,
        fontWeight: 'bold',
        fill: opts.textColor,
      }),
    });
    labelText.anchor.set(0.5);
    labelText.y = -22;
    c.addChild(labelText);

    const subText = new Text({
      text: opts.subLabel,
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 14,
        fill: opts.subTextColor,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardW - 32,
      }),
    });
    subText.anchor.set(0.5);
    subText.y = 22;
    c.addChild(subText);

    c.on('pointerover', () => c.scale.set(1.04));
    c.on('pointerout',  () => c.scale.set(1.0));

    return c;
  }

  const classicBtn = makeModeCard({
    label: TEXT.modes.endless.classic.label,
    subLabel: endlessState.bestWave > 1
      ? TEXT.modes.endless.bestWave(endlessState.bestWave)
      : TEXT.modes.endless.classic.subLabel,
    fillColor: 0x003355,
    strokeColor: 0x44aaff,
    textColor: 0xaaddff,
    subTextColor: 0x88bbdd,
  });
  classicBtn.x = W * 0.5;
  classicBtn.y = H * 0.38;
  classicBtn.alpha = 0;
  uiLayer.addChild(classicBtn);

  const surgeBestSec = Math.floor(endlessState.bestSurgeMs / 1000);
  const surgeBtn = makeModeCard({
    label: TEXT.modes.endless.surge.label,
    subLabel: surgeBestSec > 0
      ? TEXT.modes.endless.surge.bestTime(surgeBestSec)
      : TEXT.modes.endless.surge.subLabel,
    fillColor: 0x002f33,
    strokeColor: 0x22eedd,
    textColor: 0xaaffff,
    subTextColor: 0x88dddd,
  });
  surgeBtn.x = W * 0.5;
  surgeBtn.y = H * 0.58;
  surgeBtn.alpha = 0;
  uiLayer.addChild(surgeBtn);

  classicBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    resetEndlessRun('classic');
    await saveProgress();
    await core.events.emit('scene/load', { key: 'skillselect' });
  });

  surgeBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    resetEndlessRun('surge');
    await saveProgress();
    await core.events.emit('scene/load', { key: 'skillselect' });
  });

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
    text: TEXT.common.back,
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 18,
      fill: 0xccccff,
    }),
  });
  backText.anchor.set(0.5);
  backBtn.addChild(backText);
  backBtn.x = W * 0.5;
  backBtn.y = H * 0.84;
  backBtn.alpha = 0;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    endlessState.active = false;
    await core.events.emit('scene/load', { key: 'modeselect' });
  });
  backBtn.on('pointerover', () => backBtn.scale.set(1.04));
  backBtn.on('pointerout',  () => backBtn.scale.set(1.0));

  [titleLabel, classicBtn, surgeBtn, backBtn].forEach((target, i) => {
    core.events.emitSync('tween/to', {
      target: target as unknown as Record<string, unknown>,
      props: { alpha: 1 },
      duration: 380,
      ease: 'easeOutQuad',
      delay: i * 80,
    });
  });

  const unsubTick = core.events.on('endlessselect', 'core/tick', () => {
    titleLabel.y = H * 0.14 + Math.sin(Date.now() / 900) * 2;
  });

  _cleanup = () => {
    core.events.removeNamespace('endlessselect');
    unsubTick();
    worldLayer.removeChild(stars);
    uiLayer.removeChild(titleLabel, classicBtn, surgeBtn, backBtn);
    stars.destroy({ children: true });
    titleLabel.destroy();
    classicBtn.destroy({ children: true });
    surgeBtn.destroy({ children: true });
    backBtn.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const EndlessModeSelectScene: SceneDescriptor = {
  key: 'endlessselect',
  enter,
  exit,
};
