import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import {
  createChickenDisplay,
  createCourageDisplay,
  createMechDisplay,
  createGrandpaTurkeyDisplay,
  createStarfield,
} from '../game/sprites';
import { sfxMenuClick } from '../game/audio';
import { endlessState, gameResult } from '../game/store';

// ─── Dialogue data ─────────────────────────────────────────────────────────────
interface DialogueLine {
  speaker: string;
  portraitFactory: () => Container;
  accentColor: number;
  text: string;
  side: 'left' | 'right';
}

const DIALOGUE: DialogueLine[] = [
  {
    speaker: '小雞',
    portraitFactory: createChickenDisplay,
    accentColor: 0x66aaff,
    text: '就是這裡……水晶塔。祖父就被封印在裡面！',
    side: 'left',
  },
  {
    speaker: '勇氣',
    portraitFactory: createCourageDisplay,
    accentColor: 0xff6644,
    text: '小心！那道門前有什麼東西——它的能量反應不像普通敵人……',
    side: 'right',
  },
  {
    speaker: '水晶守衛',
    portraitFactory: createMechDisplay,
    accentColor: 0x44ddff,
    text: '……入侵者偵測。封印協議啟動。任何生命體不得接近水晶核心。',
    side: 'right',
  },
  {
    speaker: '小雞',
    portraitFactory: createChickenDisplay,
    accentColor: 0x66aaff,
    text: '我的祖父在裡面！讓開！',
    side: 'left',
  },
  {
    speaker: '水晶守衛',
    portraitFactory: createMechDisplay,
    accentColor: 0x44ddff,
    text: '……情感因素無效。封印為最高優先。威脅等級評估中……評估完成：消滅。',
    side: 'right',
  },
  {
    speaker: '勇氣',
    portraitFactory: createCourageDisplay,
    accentColor: 0xff6644,
    text: '跟機器講道理是沒用的。只能打過去！',
    side: 'right',
  },
  {
    speaker: '祖父的聲音',
    portraitFactory: createGrandpaTurkeyDisplay,
    accentColor: 0xc8a060,
    text: '孫兒……我在塔的最深處……守衛雖然強大，但它也有弱點……你一定找得到……',
    side: 'left',
  },
  {
    speaker: '小雞',
    portraitFactory: createChickenDisplay,
    accentColor: 0x66aaff,
    text: '祖父，我來了！——水晶守衛，今天我要打穿你、衝進那扇門！',
    side: 'left',
  },
];

// ─── Layout constants ──────────────────────────────────────────────────────────
const PORTRAIT_SIZE = 90;
const PANEL_H       = 210;
const PANEL_PAD     = 14;
const PANEL_MARGIN  = 12;

// ─── Scene ────────────────────────────────────────────────────────────────────
let _cleanup: (() => void) | null = null;

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ──────────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  const dimOverlay = new Graphics();
  dimOverlay.rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.5 });
  dimOverlay.eventMode = 'none';
  worldLayer.addChild(dimOverlay);

  // ── Chapter title card (fades out after 1.5 s) ──────────────────────────────
  const titleCard = new Container();
  const titleCardBg = new Graphics();
  titleCardBg
    .roundRect(-160, -36, 320, 72, 14)
    .fill({ color: 0x0a1222, alpha: 0.9 });
  titleCardBg
    .roundRect(-160, -36, 320, 72, 14)
    .stroke({ color: 0x44ddff, width: 2 });
  titleCard.addChild(titleCardBg);

  const titleCardChapter = new Text({
    text: '第五章',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 13,
      fill: 0xaaeeff,
    }),
  });
  titleCardChapter.anchor.set(0.5);
  titleCardChapter.y = -18;
  titleCard.addChild(titleCardChapter);

  const titleCardTitle = new Text({
    text: '水晶守衛的試煉',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xffffff,
      dropShadow: { color: 0x0088cc, distance: 2, alpha: 0.7, blur: 4 },
    }),
  });
  titleCardTitle.anchor.set(0.5);
  titleCardTitle.y = 10;
  titleCard.addChild(titleCardTitle);

  titleCard.x = W * 0.5;
  titleCard.y = H * 0.35;
  titleCard.alpha = 0;
  uiLayer.addChild(titleCard);

  core.events.emitSync('tween/to', {
    target: titleCard as unknown as Record<string, unknown>,
    props: { alpha: 1 },
    duration: 600,
    ease: 'easeOutQuad',
    delay: 0,
  });
  core.events.emitSync('tween/to', {
    target: titleCard as unknown as Record<string, unknown>,
    props: { alpha: 0 },
    duration: 500,
    ease: 'easeInQuad',
    delay: 1600,
  });

  // ── Dialogue panel ──────────────────────────────────────────────────────────
  const panelY = H - PANEL_H - 16;
  const panelW = W - PANEL_MARGIN * 2;

  const panelBg = new Graphics();
  panelBg
    .roundRect(PANEL_MARGIN, panelY, panelW, PANEL_H, 16)
    .fill({ color: 0x080818, alpha: 0.93 });
  panelBg
    .roundRect(PANEL_MARGIN, panelY, panelW, PANEL_H, 16)
    .stroke({ color: 0x3355aa, width: 1.5 });
  panelBg.alpha = 0;
  uiLayer.addChild(panelBg);

  const portraitFrame = new Graphics();
  portraitFrame.alpha = 0;
  uiLayer.addChild(portraitFrame);

  const portraitHolder = new Container();
  portraitHolder.alpha = 0;
  uiLayer.addChild(portraitHolder);

  const nameText = new Text({
    text: '',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0xffdd88,
    }),
  });
  nameText.alpha = 0;
  uiLayer.addChild(nameText);

  const textAreaWidth = panelW - PORTRAIT_SIZE - PANEL_PAD * 3;
  const bodyText = new Text({
    text: '',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 15,
      fill: 0xf0f0f0,
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: textAreaWidth,
      lineHeight: 24,
    }),
  });
  bodyText.alpha = 0;
  uiLayer.addChild(bodyText);

  const tapHint = new Text({
    text: '▶ 點擊繼續',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 13,
      fill: 0x9999bb,
    }),
  });
  tapHint.anchor.set(1, 1);
  tapHint.x = W - PANEL_MARGIN - PANEL_PAD;
  tapHint.y = H - 20;
  tapHint.alpha = 0;
  uiLayer.addChild(tapHint);

  const skipBtn = new Container();
  skipBtn.eventMode = 'static';
  skipBtn.cursor = 'pointer';
  const skipBg = new Graphics();
  skipBg
    .roundRect(0, 0, 60, 28, 8)
    .fill({ color: 0x1a1a30, alpha: 0.9 })
    .stroke({ color: 0x5555aa, width: 1 });
  skipBtn.addChild(skipBg);
  const skipLabel = new Text({
    text: '跳過',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 14,
      fill: 0x8888bb,
    }),
  });
  skipLabel.anchor.set(0.5);
  skipLabel.x = 30;
  skipLabel.y = 14;
  skipBtn.addChild(skipLabel);
  skipBtn.x = W - 76;
  skipBtn.y = 16;
  skipBtn.alpha = 0;
  uiLayer.addChild(skipBtn);

  // ── Render one dialogue line ────────────────────────────────────────────────
  function showLine(idx: number): void {
    const line = DIALOGUE[idx];

    const oldChildren = portraitHolder.removeChildren();
    for (const ch of oldChildren) ch.destroy({ children: true });

    const portraitFrameY = panelY + PANEL_PAD;
    let portraitX: number;
    let textX: number;

    if (line.side === 'left') {
      portraitX = PANEL_MARGIN + PANEL_PAD;
      textX = portraitX + PORTRAIT_SIZE + PANEL_PAD;
    } else {
      portraitX = PANEL_MARGIN + panelW - PANEL_PAD - PORTRAIT_SIZE;
      textX = PANEL_MARGIN + PANEL_PAD;
    }

    portraitFrame.clear();
    portraitFrame
      .roundRect(portraitX, portraitFrameY, PORTRAIT_SIZE, PORTRAIT_SIZE, 10)
      .fill({ color: 0x0c0c22, alpha: 0.95 })
      .stroke({ color: line.accentColor, width: 2 });

    const sprite = line.portraitFactory();
    const localBounds = sprite.getLocalBounds();
    const maxFit = PORTRAIT_SIZE - 16;
    const scale  = Math.min(
      maxFit / (localBounds.width  || 1),
      maxFit / (localBounds.height || 1),
    );
    sprite.scale.set(scale);
    const scaledCx = (localBounds.x + localBounds.width  * 0.5) * scale;
    const scaledCy = (localBounds.y + localBounds.height * 0.5) * scale;
    sprite.x = portraitX + PORTRAIT_SIZE * 0.5 - scaledCx;
    sprite.y = portraitFrameY + PORTRAIT_SIZE * 0.5 - scaledCy;
    portraitHolder.addChild(sprite);

    nameText.style.fill = line.accentColor;
    nameText.text  = line.speaker;
    nameText.x = textX;
    nameText.y = panelY + PANEL_PAD;

    bodyText.style.wordWrapWidth = textAreaWidth;
    bodyText.text = line.text;
    bodyText.x = textX;
    bodyText.y = panelY + PANEL_PAD + 26;

    tapHint.text = idx === DIALOGUE.length - 1 ? '▶ 開始挑戰！' : '▶ 點擊繼續';
  }

  // ── Advance dialogue ────────────────────────────────────────────────────────
  let lineIndex    = 0;
  let advanceLocked = true;

  const unlockTimer = window.setTimeout(() => {
    advanceLocked = false;
  }, 1800);

  async function advance(): Promise<void> {
    if (advanceLocked) return;
    advanceLocked = true;
    sfxMenuClick();

    lineIndex++;
    if (lineIndex >= DIALOGUE.length) {
      endlessState.active = false;
      gameResult.currentLevel = 5;
      gameResult.storyMode = true;
      await core.events.emit('scene/load', { key: 'skillselect' });
      return;
    }

    showLine(lineIndex);
    advanceLocked = false;
  }

  async function skip(): Promise<void> {
    if (advanceLocked) return;
    advanceLocked = true;
    sfxMenuClick();
    endlessState.active = false;
    gameResult.currentLevel = 5;
    gameResult.storyMode = true;
    await core.events.emit('scene/load', { key: 'skillselect' });
  }

  const tapArea = new Graphics();
  tapArea
    .rect(0, panelY - 30, W, PANEL_H + 46)
    .fill({ color: 0x000000, alpha: 0.001 });
  tapArea.eventMode = 'static';
  tapArea.cursor = 'pointer';
  uiLayer.addChild(tapArea);
  tapArea.on('pointerdown', advance);

  skipBtn.on('pointerdown', skip);
  skipBtn.on('pointerover', () => skipBtn.scale.set(1.05));
  skipBtn.on('pointerout',  () => skipBtn.scale.set(1.0));

  showLine(0);

  // ── Fade in the panel + UI after a short delay ──────────────────────────────
  const panelElements: Container[] = [
    panelBg, portraitFrame, portraitHolder, nameText, bodyText, tapHint, skipBtn,
  ];
  panelElements.forEach((el, i) => {
    core.events.emitSync('tween/to', {
      target: el as unknown as Record<string, unknown>,
      props: { alpha: 1 },
      duration: 400,
      ease: 'easeOutQuad',
      delay: 300 + i * 60,
    });
  });

  // ── Tick: blink tap hint ────────────────────────────────────────────────────
  const unsubTick = core.events.on('story_ch5', 'core/tick', () => {
    if (!advanceLocked) {
      tapHint.alpha = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 600));
    }
  });

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  _cleanup = () => {
    clearTimeout(unlockTimer);
    core.events.removeNamespace('story_ch5');
    unsubTick();
    worldLayer.removeChild(stars, dimOverlay);
    uiLayer.removeChild(
      titleCard, panelBg, portraitFrame, portraitHolder,
      nameText, bodyText, tapHint, tapArea, skipBtn,
    );
    stars.destroy({ children: true });
    dimOverlay.destroy();
    titleCard.destroy({ children: true });
    panelBg.destroy();
    portraitFrame.destroy();
    portraitHolder.destroy({ children: true });
    nameText.destroy();
    bodyText.destroy();
    tapHint.destroy();
    tapArea.destroy();
    skipBtn.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const StoryChapter5Scene: SceneDescriptor = {
  key: 'story_ch5',
  enter,
  exit,
};
