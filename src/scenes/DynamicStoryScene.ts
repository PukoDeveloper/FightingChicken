import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import {
  createBlackHoleDisplay,
  createChaosDisplay,
  createChickenDisplay,
  createCourageDisplay,
  createDragonDisplay,
  createGrandpaTurkeyDisplay,
  createMechDisplay,
  createPhantomDisplay,
  createStarfield,
  createStormDisplay,
} from '../game/sprites';
import { endlessState, gameResult, storyState, voidState } from '../game/store';
import { sfxMenuClick } from '../game/audio';
import { loadStoryNode } from '../game/story/loadStoryNode';
import type { StoryDialogueLine, StoryNextAction, StoryNode, StoryPortraitId } from '../game/story/types';

const PORTRAIT_SIZE = 90;
const PANEL_H = 210;
const PANEL_PAD = 14;
const PANEL_MARGIN = 12;

const PORTRAIT_FACTORIES: Record<StoryPortraitId, () => Container> = {
  chicken: createChickenDisplay,
  grandpa: createGrandpaTurkeyDisplay,
  courage: createCourageDisplay,
  phantom: createPhantomDisplay,
  chaos: createChaosDisplay,
  mech: createMechDisplay,
  storm: createStormDisplay,
  dragon: createDragonDisplay,
  void: createBlackHoleDisplay,
};

let _cleanup: (() => void) | null = null;

function fallbackNode(errorMessage: string): StoryNode {
  return {
    id: 'story-load-error',
    chapterLabel: '故事載入失敗',
    title: '星路訊號中斷',
    next: { type: 'menu' },
    finalHint: '▶ 回到故事選單',
    lines: [
      {
        speaker: '系統',
        portrait: 'chicken',
        accentColor: 0xff6666,
        side: 'left',
        text: `無法載入劇情資料：${errorMessage}`,
      },
    ],
  };
}

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;
  const namespace = 'story_dynamic';

  let node: StoryNode;
  try {
    node = await loadStoryNode(storyState.currentNodeId);
  } catch (err) {
    node = fallbackNode(err instanceof Error ? err.message : String(err));
  }

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  const dimOverlay = new Graphics();
  dimOverlay.rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.5 });
  dimOverlay.eventMode = 'none';
  worldLayer.addChild(dimOverlay);

  // ── Chapter title card ──────────────────────────────────────────────────────
  const titleCard = new Container();
  const titleCardBg = new Graphics();
  titleCardBg
    .roundRect(-160, -38, 320, 76, 14)
    .fill({ color: 0x0a0a22, alpha: 0.9 });
  titleCardBg
    .roundRect(-160, -38, 320, 76, 14)
    .stroke({ color: 0xffaa44, width: 2 });
  titleCard.addChild(titleCardBg);

  const titleCardChapter = new Text({
    text: node.chapterLabel,
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 12,
      fill: 0xffcc88,
    }),
  });
  titleCardChapter.anchor.set(0.5);
  titleCardChapter.y = -18;
  titleCard.addChild(titleCardChapter);

  const titleCardTitle = new Text({
    text: node.title,
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 25,
      fontWeight: 'bold',
      fill: 0xffffff,
      dropShadow: { color: 0xffaa44, distance: 2, alpha: 0.7, blur: 4 },
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
    .stroke({ color: 0x5555aa, width: 1.5 });
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

  function showLine(idx: number): void {
    const line: StoryDialogueLine = node.lines[idx];

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

    const sprite = PORTRAIT_FACTORIES[line.portrait]();
    const localBounds = sprite.getLocalBounds();
    const maxFit = PORTRAIT_SIZE - 16;
    const scale = Math.min(
      maxFit / (localBounds.width || 1),
      maxFit / (localBounds.height || 1),
    );
    sprite.scale.set(scale);
    const scaledCx = (localBounds.x + localBounds.width * 0.5) * scale;
    const scaledCy = (localBounds.y + localBounds.height * 0.5) * scale;
    sprite.x = portraitX + PORTRAIT_SIZE * 0.5 - scaledCx;
    sprite.y = portraitFrameY + PORTRAIT_SIZE * 0.5 - scaledCy;
    portraitHolder.addChild(sprite);

    nameText.style.fill = line.accentColor;
    nameText.text = line.speaker;
    nameText.x = textX;
    nameText.y = panelY + PANEL_PAD;

    bodyText.style.wordWrapWidth = textAreaWidth;
    bodyText.text = line.text;
    bodyText.x = textX;
    bodyText.y = panelY + PANEL_PAD + 26;

    tapHint.text = idx === node.lines.length - 1
      ? (node.finalHint ?? '▶ 繼續')
      : '▶ 點擊繼續';
  }

  async function executeAction(action: StoryNextAction): Promise<void> {
    if (action.type === 'battle') {
      endlessState.active = false;
      voidState.active = false;
      gameResult.currentLevel = action.level;
      gameResult.storyMode = true;
      await core.events.emit('scene/load', { key: 'skillselect' });
      return;
    }

    if (action.type === 'story') {
      storyState.currentNodeId = action.nodeId;
      await core.events.emit('scene/load', { key: 'story_dynamic' });
      return;
    }

    gameResult.storyMode = false;
    await core.events.emit('scene/load', { key: 'story' });
  }

  let lineIndex = 0;
  let advanceLocked = true;
  const unlockTimer = window.setTimeout(() => {
    advanceLocked = false;
  }, 1800);

  async function advance(): Promise<void> {
    if (advanceLocked) return;
    advanceLocked = true;
    sfxMenuClick();

    lineIndex++;
    if (lineIndex >= node.lines.length) {
      await executeAction(node.next);
      return;
    }

    showLine(lineIndex);
    advanceLocked = false;
  }

  async function skip(): Promise<void> {
    if (advanceLocked) return;
    advanceLocked = true;
    sfxMenuClick();
    await executeAction(node.next);
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
  skipBtn.on('pointerout', () => skipBtn.scale.set(1.0));

  showLine(0);

  const panelElements: Container[] = [
    panelBg,
    portraitFrame,
    portraitHolder,
    nameText,
    bodyText,
    tapHint,
    skipBtn,
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

  const unsubTick = core.events.on(namespace, 'core/tick', () => {
    if (!advanceLocked) {
      tapHint.alpha = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 600));
    }
  });

  _cleanup = () => {
    clearTimeout(unlockTimer);
    core.events.removeNamespace(namespace);
    unsubTick();
    worldLayer.removeChild(stars, dimOverlay);
    uiLayer.removeChild(
      titleCard,
      panelBg,
      portraitFrame,
      portraitHolder,
      nameText,
      bodyText,
      tapHint,
      tapArea,
      skipBtn,
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

export const DynamicStoryScene: SceneDescriptor = {
  key: 'story_dynamic',
  enter,
  exit,
};
