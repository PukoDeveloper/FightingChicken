import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield, createPlayerChicken, createEnemyDisplay } from '../game/sprites';
import { gameResult, costumeState, endlessState, voidState } from '../game/store';
import { createLevel, getStoryLevel } from '../game/levels';
import { startBgm, sfxMenuClick } from '../game/audio';

let _cleanup: (() => void) | null = null;

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

  // ── Character display ────────────────────────────────────────────────────
  const { won, score } = gameResult;
  const isVoidGameOver    = gameResult.playedLevel === -1;
  const isEndlessGameOver = !isVoidGameOver && endlessState.active && gameResult.playedLevel === 0;
  const highScore = isVoidGameOver
    ? voidState.highScore
    : (isEndlessGameOver
        ? endlessState.highScore
        : (gameResult.levelHighScores[gameResult.playedLevel] ?? 0));

  // Resolve which boss was fought so the victory screen shows the right sprite.
  const clearedLevel = gameResult.playedLevel;
  const isNormalLevelWin = won && !isVoidGameOver && !isEndlessGameOver;
  const bossEnemyType = isNormalLevelWin
    ? ((gameResult.storyMode ? getStoryLevel(clearedLevel) : null) ?? createLevel(clearedLevel)).enemyType
    : 'courage' as const;

  const bossNameMap: Record<string, string> = {
    courage:  '勇氣',
    phantom:  '幽靈',
    chaos:    '混沌',
    mech:     '機甲',
  };
  const bossName = bossNameMap[bossEnemyType] ?? '強敵';

  const character = (won && !isVoidGameOver) ? createEnemyDisplay(bossEnemyType) : createPlayerChicken(costumeState.selected);
  character.scale.set((won && !isVoidGameOver) ? 1.8 : 1.6);
  character.x = W * 0.5;
  character.y = H * 0.42;
  if (!won || isVoidGameOver) {
    character.rotation = 0.4;
  }
  worldLayer.addChild(character);

  // X mark over courage if defeated (not used in void mode)
  let xMark: Graphics | null = null;
  if (won && !isVoidGameOver) {
    xMark = new Graphics();
    xMark.moveTo(-35, -35).lineTo(35, 35).stroke({ color: 0xff0000, width: 8, alpha: 0.9 });
    xMark.moveTo(35, -35).lineTo(-35, 35).stroke({ color: 0xff0000, width: 8, alpha: 0.9 });
    xMark.x = W * 0.5;
    xMark.y = H * 0.42;
    xMark.alpha = 0;
    worldLayer.addChild(xMark);
  }

  // ── Result title ──────────────────────────────────────────────────────────
  const titleText = isVoidGameOver
    ? (won ? '時間到！⏱' : '虛空湮滅...')
    : (won ? '勝利！🎉' : '敗北...');
  const titleColor = isVoidGameOver ? 0xcc88ff : (won ? 0xffd700 : 0xff6666);
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 52,
    fontWeight: 'bold',
    fill: titleColor,
    stroke: { color: 0x220000, width: 5 },
    dropShadow: { color: isVoidGameOver ? 0x660088 : (won ? 0xdd8800 : 0x880000), distance: 4, alpha: 0.85, blur: 3 },
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
  const scoreLabel = new Text({
    text: isVoidGameOver ? `總傷害：${score}` : `得分：${score}`,
    style: scoreStyle,
  });
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
  const hiScoreLabel = new Text({
    text: isVoidGameOver ? `最高傷害：${highScore}` : `最高分：${highScore}`,
    style: hiScoreStyle,
  });
  hiScoreLabel.anchor.set(0.5);
  hiScoreLabel.x = W * 0.5;
  hiScoreLabel.y = H * 0.67;
  hiScoreLabel.alpha = 0;
  uiLayer.addChild(hiScoreLabel);

  // ── Level / endless wave reached ──────────────────────────────────────────
  const levelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 16,
    fill: 0xaaddff,
  });
  let levelLabelText: string;
  if (isVoidGameOver) {
    levelLabelText = won ? '虛空之境 · 60秒挑戰完成！' : '虛空之境 · 被黑洞湮滅了';
  } else if (isEndlessGameOver) {
    const waveReached = endlessState.wave;
    const best = endlessState.bestWave;
    levelLabelText = `無盡模式 · 第 ${waveReached} 波  最高：第 ${best} 波`;
  } else {
    const storyLevelCfg = gameResult.storyMode ? getStoryLevel(clearedLevel) : null;
    const clearedLevelConfig = storyLevelCfg ?? createLevel(clearedLevel);
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
    fill: isVoidGameOver ? 0xddaaff : (won ? 0xaaffaa : 0xffaaaa),
    align: 'center',
  });
  const msgText = isVoidGameOver
    ? (won ? '黑洞無法被消滅...\n但你的傷害已被記錄！' : '被彈幕擊倒了...\n再接再厲！')
    : (isEndlessGameOver
        ? '被彈幕擊倒了...\n無盡的挑戰等著你！'
        : (won
          ? `你擊敗了${bossName}！\n小雞的逆襲成功了！`
          : '被彈幕擊倒了...\n再試一次！'));
  const msgLabel = new Text({ text: msgText, style: msgStyle });
  msgLabel.anchor.set(0.5);
  msgLabel.x = W * 0.5;
  msgLabel.y = H * 0.3;
  msgLabel.alpha = 0;
  uiLayer.addChild(msgLabel);

  // ── Replay button ─────────────────────────────────────────────────────────
  const isStoryWin = gameResult.storyMode && won && !isEndlessGameOver && !isVoidGameOver;

  const btnW = 220, btnH = 58;
  const btn = new Container();
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  const btnBg = new Graphics();
  const btnColor = isVoidGameOver ? 0x330055 : (won ? 0x006600 : 0x880000);
  const btnStroke = isVoidGameOver ? 0x9933ff : (won ? 0x44ff44 : 0xff6644);
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .fill({ color: btnColor, alpha: 0.9 });
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .stroke({ color: btnStroke, width: 2 });
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
  btn.y = isStoryWin ? H * 0.87 : H * 0.84;
  btn.alpha = 0;
  uiLayer.addChild(btn);

  btn.on('pointerdown', async () => {
    sfxMenuClick();
    if (isVoidGameOver) {
      voidState.active = true;
    } else if (isEndlessGameOver) {
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

  // ── Story continuation button (only on story-mode win) ────────────────────
  let storyBtn: Container | null = null;
  if (isStoryWin) {
    const sBtnW = 190, sBtnH = 42;
    storyBtn = new Container();
    storyBtn.eventMode = 'static';
    storyBtn.cursor = 'pointer';

    const sBtnBg = new Graphics();
    sBtnBg.roundRect(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH, 10)
      .fill({ color: 0x1a4466, alpha: 0.9 });
    sBtnBg.roundRect(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH, 10)
      .stroke({ color: 0x44aaff, width: 2 });
    storyBtn.addChild(sBtnBg);

    const sBtnText = new Text({
      text: '繼續劇情 ▶',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xaaddff,
      }),
    });
    sBtnText.anchor.set(0.5);
    storyBtn.addChild(sBtnText);

    storyBtn.x = W * 0.5;
    storyBtn.y = H * 0.77;
    storyBtn.alpha = 0;
    uiLayer.addChild(storyBtn);

    storyBtn.on('pointerdown', async () => {
      sfxMenuClick();
      await core.events.emit('scene/load', { key: `story_ch${gameResult.playedLevel}_end` });
    });
    storyBtn.on('pointerover', () => storyBtn!.scale.set(1.04));
    storyBtn.on('pointerout',  () => storyBtn!.scale.set(1.0));
  }

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
  titleBtn.y = isStoryWin ? H * 0.94 : H * 0.92;
  titleBtn.alpha = 0;
  uiLayer.addChild(titleBtn);

  titleBtn.on('pointerdown', async () => {
    sfxMenuClick();
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
  const fadeInItems = [
    msgLabel, scoreLabel, hiScoreLabel, levelLabel,
    ...(storyBtn ? [storyBtn] : []),
    btn, titleBtn,
  ] as unknown as Record<string, unknown>[];
  const fadeDelays = storyBtn
    ? [300, 450, 600, 700, 750, 850, 950]
    : [300, 450, 600, 700, 800, 900];
  fadeInItems.forEach((t, i) => {
    core.events.emitSync('tween/to', {
      target: t,
      props: { alpha: 1 },
      duration: 400,
      ease: 'easeOutQuad',
      delay: fadeDelays[i],
    });
  });

  // Primary action button pulse
  const pulseTarget = storyBtn ?? btn;
  core.events.emitSync('tween/to', {
    target: pulseTarget.scale as unknown as Record<string, unknown>,
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
    core.events.emitSync('tween/kill', { target: pulseTarget.scale as unknown as Record<string, unknown> });
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
    if (storyBtn) {
      uiLayer.removeChild(storyBtn);
      storyBtn.destroy({ children: true });
    }
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
