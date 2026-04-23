import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield, createChickenDisplay, createCourageDisplay } from '../game/sprites';
import { gameResult } from '../game/store';
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
  const { won, score, highScore } = gameResult;

  const character = won ? createCourageDisplay() : createChickenDisplay();
  character.scale.set(won ? 1.8 : 1.6);
  character.x = W * 0.5;
  character.y = H * 0.42;
  if (!won) {
    // Make chicken look defeated — tilt it
    character.rotation = 0.4;
  }
  worldLayer.addChild(character);

  // X mark over courage if defeated
  if (won) {
    const xMark = new Graphics();
    xMark.moveTo(-35, -35).lineTo(35, 35).stroke({ color: 0xff0000, width: 8, alpha: 0.9 });
    xMark.moveTo(35, -35).lineTo(-35, 35).stroke({ color: 0xff0000, width: 8, alpha: 0.9 });
    xMark.x = W * 0.5;
    xMark.y = H * 0.42;
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
  uiLayer.addChild(hiScoreLabel);

  // ── Level reached ─────────────────────────────────────────────────────────
  const clearedLevel = gameResult.playedLevel;
  const clearedLevelConfig = createLevel(clearedLevel);
  const levelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 16,
    fill: 0xaaddff,
  });
  const levelLabel = new Text({
    text: won
      ? `通關第 ${clearedLevel} 關「${clearedLevelConfig.name}」！`
      : `挑戰第 ${clearedLevel} 關「${clearedLevelConfig.name}」`,
    style: levelStyle,
  });
  levelLabel.anchor.set(0.5);
  levelLabel.x = W * 0.5;
  levelLabel.y = H * 0.74;
  uiLayer.addChild(levelLabel);

  // ── Result message ────────────────────────────────────────────────────────
  const msgStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 17,
    fill: won ? 0xaaffaa : 0xffaaaa,
    align: 'center',
  });
  const msgText = won
    ? '你用勇氣戰勝了勇氣！\n小雞的逆襲成功了！'
    : '被彈幕擊倒了...\n再試一次！';
  const msgLabel = new Text({ text: msgText, style: msgStyle });
  msgLabel.anchor.set(0.5);
  msgLabel.x = W * 0.5;
  msgLabel.y = H * 0.3;
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
  uiLayer.addChild(btn);

  btn.on('pointerdown', async () => {
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
  uiLayer.addChild(titleBtn);

  titleBtn.on('pointerdown', async () => {
    await core.events.emit('scene/load', { key: 'title' });
  });

  // ── Animations ────────────────────────────────────────────────────────────
  let btnScale = 1;
  let btnDir = 1;

  const unsubTick = core.events.on('gameover', 'core/tick', ({ delta }: { delta: number }) => {
    btnScale += 0.0007 * btnDir * delta;
    if (btnScale > 1.05) btnDir = -1;
    if (btnScale < 0.97) btnDir = 1;
    btn.scale.set(btnScale);

    character.y = H * 0.42 + Math.sin(Date.now() / 800) * 6;
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('gameover');
    unsubTick();

    worldLayer.removeChild(stars, character);
    stars.destroy({ children: true });
    character.destroy({ children: true });

    uiLayer.removeChild(titleLabel, msgLabel, scoreLabel, hiScoreLabel, levelLabel, btn, titleBtn);
    titleLabel.destroy();
    msgLabel.destroy();
    scoreLabel.destroy();
    hiScoreLabel.destroy();
    levelLabel.destroy();
    btn.destroy({ children: true });
    titleBtn.destroy({ children: true });

    if (won) {
      // xMark is a sibling on worldLayer
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
