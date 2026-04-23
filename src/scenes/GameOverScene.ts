import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield, createPlayerChicken, createCourageDisplay } from '../game/sprites';
import { gameResult, costumeState } from '../game/store';
import { endlessState } from '../game/store';
import { createLevel } from '../game/levels';

let _cleanup: (() => void) | null = null;

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

  // ── Character display ────────────────────────────────────────────────────
  const { won, score } = gameResult;
  const isEndlessGameOver = endlessState.active && gameResult.playedLevel === 0;
  const highScore = isEndlessGameOver
    ? endlessState.highScore
    : (gameResult.levelHighScores[gameResult.playedLevel] ?? 0);

  const character = won ? createCourageDisplay() : createPlayerChicken(costumeState.selected);
  character.scale.set(won ? 1.8 : 1.6);
  character.x = W * 0.5;
  character.y = H * 0.42;
  if (!won) {
    character.rotation = 0.4;
  }
  worldLayer.addChild(character);

  // X mark over courage if defeated
  let xMark: Graphics | null = null;
  if (won) {
    xMark = new Graphics();
    xMark.moveTo(-35, -35).lineTo(35, 35).stroke({ color: 0xff0000, width: 8, alpha: 0.9 });
    xMark.moveTo(35, -35).lineTo(-35, 35).stroke({ color: 0xff0000, width: 8, alpha: 0.9 });
    xMark.x = W * 0.5;
    xMark.y = H * 0.42;
    xMark.alpha = 0;
    worldLayer.addChild(xMark);
  }

  // ── Result title ──────────────────────────────────────────────────────────
  const titleText = won ? '勝利！🎉' : '敗北...';
  const titleColor = won ? 0xffd700 : 0xff6666;
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 52,
    fontWeight: 'bold',
    fill: titleColor,
    stroke: { color: 0x220000, width: 5 },
    dropShadow: { color: won ? 0xdd8800 : 0x880000, distance: 4, alpha: 0.85, blur: 3 },
  });
  const titleLabel = new Text({ text: titleText, style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = H * 0.2;
  titleLabel.scale.set(0.5);
  titleLabel.alpha = 0;
  uiLayer.addChild(titleLabel);

  // ── Score ──────────────────────────────────────────────────────────────────
  const scoreStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 28,
    fill: 0xffffff,
    fontWeight: 'bold',
  });
  const scoreLabel = new Text({ text: `得分：${score}`, style: scoreStyle });
  scoreLabel.anchor.set(0.5);
  scoreLabel.x = W * 0.5;
  scoreLabel.y = H * 0.60;
  scoreLabel.alpha = 0;
  uiLayer.addChild(scoreLabel);

  const hiScoreStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 18,
    fill: 0xffdd88,
  });
  const hiScoreLabel = new Text({ text: `最高分：${highScore}`, style: hiScoreStyle });
  hiScoreLabel.anchor.set(0.5);
  hiScoreLabel.x = W * 0.5;
  hiScoreLabel.y = H * 0.67;
  hiScoreLabel.alpha = 0;
  uiLayer.addChild(hiScoreLabel);

  // ── Level / endless wave reached ──────────────────────────────────────────
  const clearedLevel = gameResult.playedLevel;
  const levelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 16,
    fill: 0xaaddff,
  });
  let levelLabelText: string;
  if (isEndlessGameOver) {
    const waveReached = endlessState.wave;
    const best = endlessState.bestWave;
    levelLabelText = `無盡模式 · 第 ${waveReached} 波  最高：第 ${best} 波`;
  } else {
    const clearedLevelConfig = createLevel(clearedLevel);
    levelLabelText = won
      ? `通關第 ${clearedLevel} 關「${clearedLevelConfig.name}」！`
      : `挑戰第 ${clearedLevel} 關「${clearedLevelConfig.name}」`;
  }
  const levelLabel = new Text({ text: levelLabelText, style: levelStyle });
  levelLabel.anchor.set(0.5);
  levelLabel.x = W * 0.5;
  levelLabel.y = H * 0.74;
  levelLabel.alpha = 0;
  uiLayer.addChild(levelLabel);

  // ── Result message ────────────────────────────────────────────────────────
  const msgStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 17,
    fill: won ? 0xaaffaa : 0xffaaaa,
    align: 'center',
  });
  const msgText = isEndlessGameOver
    ? '被彈幕擊倒了...\n無盡的挑戰等著你！'
    : (won
      ? '你用勇氣戰勝了勇氣！\n小雞的逆襲成功了！'
      : '被彈幕擊倒了...\n再試一次！');
  const msgLabel = new Text({ text: msgText, style: msgStyle });
  msgLabel.anchor.set(0.5);
  msgLabel.x = W * 0.5;
  msgLabel.y = H * 0.3;
  msgLabel.alpha = 0;
  uiLayer.addChild(msgLabel);

  // ── Replay button ─────────────────────────────────────────────────────────
  const btnW = 220, btnH = 58;
  const btn = new Container();
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  const btnBg = new Graphics();
  const btnColor = won ? 0x006600 : 0x880000;
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .fill({ color: btnColor, alpha: 0.9 });
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .stroke({ color: won ? 0x44ff44 : 0xff6644, width: 2 });
  btn.addChild(btnBg);

  const btnStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 24,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const btnText = new Text({ text: '再玩一次', style: btnStyle });
  btnText.anchor.set(0.5);
  btn.addChild(btnText);

  btn.x = W * 0.5;
  btn.y = H * 0.84;
  btn.alpha = 0;
  uiLayer.addChild(btn);

  btn.on('pointerdown', async () => {
    if (isEndlessGameOver) {
      endlessState.active = true;
      endlessState.wave = 1;
      endlessState.buffs = [];
      endlessState.currentHp = 0;
      endlessState.score = 0;
      endlessState.periodicShieldTimer = 0;
      endlessState.regenTimer = 0;
    }
    await core.events.emit('scene/load', { key: 'game' });
  });

  // ── Title button ──────────────────────────────────────────────────────────
  const titleBtnW = 160, titleBtnH = 44;
  const titleBtn = new Container();
  titleBtn.eventMode = 'static';
  titleBtn.cursor = 'pointer';

  const titleBtnBg = new Graphics();
  titleBtnBg.roundRect(-titleBtnW / 2, -titleBtnH / 2, titleBtnW, titleBtnH, 10)
    .fill({ color: 0x333366, alpha: 0.85 });
  titleBtnBg.roundRect(-titleBtnW / 2, -titleBtnH / 2, titleBtnW, titleBtnH, 10)
    .stroke({ color: 0x7777cc, width: 1.5 });
  titleBtn.addChild(titleBtnBg);

  const titleBtnStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 18,
    fill: 0xccccff,
  });
  const titleBtnText = new Text({ text: '回主選單', style: titleBtnStyle });
  titleBtnText.anchor.set(0.5);
  titleBtn.addChild(titleBtnText);

  titleBtn.x = W * 0.5;
  titleBtn.y = H * 0.92;
  titleBtn.alpha = 0;
  uiLayer.addChild(titleBtn);

  titleBtn.on('pointerdown', async () => {
    endlessState.active = false;
    await core.events.emit('scene/load', { key: 'title' });
  });

  // ── Entry animations via TweenManager ────────────────────────────────────
  // Title pops in with a scale bounce
  core.events.emitSync('tween/to', {
    target: titleLabel as unknown as Record<string, unknown>,
    props: { alpha: 1 },
    duration: 300,
    ease: 'easeOutQuad',
    delay: 100,
  });
  core.events.emitSync('tween/to', {
    target: titleLabel.scale as unknown as Record<string, unknown>,
    props: { x: 1, y: 1 },
    duration: 400,
    ease: 'easeOutBack',
    delay: 100,
  });
  if (xMark) {
    core.events.emitSync('tween/to', {
      target: xMark as unknown as Record<string, unknown>,
      props: { alpha: 1 },
      duration: 250,
      ease: 'easeOutQuad',
      delay: 500,
    });
  }
  const fadeInItems = [msgLabel, scoreLabel, hiScoreLabel, levelLabel, btn, titleBtn] as unknown as Record<string, unknown>[];
  const fadeDelays = [300, 450, 600, 700, 800, 900];
  fadeInItems.forEach((t, i) => {
    core.events.emitSync('tween/to', {
      target: t,
      props: { alpha: 1 },
      duration: 400,
      ease: 'easeOutQuad',
      delay: fadeDelays[i],
    });
  });

  // Replay button pulse
  core.events.emitSync('tween/to', {
    target: btn.scale as unknown as Record<string, unknown>,
    props: { x: 1.05, y: 1.05 },
    duration: 850,
    ease: 'easeInOutSine',
    loop: true,
    yoyo: true,
    delay: 1000,
  });

  // ── Floating character animation (tick-driven) ────────────────────────────
  const unsubTick = core.events.on('gameover', 'core/tick', () => {
    character.y = H * 0.42 + Math.sin(Date.now() / 800) * 6;
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('gameover');
    core.events.emitSync('tween/kill', { target: btn.scale as unknown as Record<string, unknown> });
    unsubTick();

    worldLayer.removeChild(stars, character);
    stars.destroy({ children: true });
    character.destroy({ children: true });
    if (xMark) {
      worldLayer.removeChild(xMark);
      xMark.destroy();
    }

    uiLayer.removeChild(titleLabel, msgLabel, scoreLabel, hiScoreLabel, levelLabel, btn, titleBtn);
    titleLabel.destroy();
    msgLabel.destroy();
    scoreLabel.destroy();
    hiScoreLabel.destroy();
    levelLabel.destroy();
    btn.destroy({ children: true });
    titleBtn.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const GameOverScene: SceneDescriptor = {
  key: 'gameover',
  enter,
  exit,
};
