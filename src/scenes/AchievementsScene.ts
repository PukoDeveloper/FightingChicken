import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { startBgm } from '../game/audio';
import { ACHIEVEMENT_DEFS } from '../game/achievements';

type AchEntry = {
  id: string;
  progress: number;
  threshold?: number;
  unlockedAt: string | null;
};

let _cleanup: (() => void) | null = null;

async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  startBgm();

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ──────────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Title ────────────────────────────────────────────────────────────────────
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 32,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff8800, distance: 3, alpha: 0.85, blur: 2 },
  });
  const titleLabel = new Text({ text: '🏆 成就', style: titleStyle });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = 44;
  uiLayer.addChild(titleLabel);

  // ── Fetch achievements ───────────────────────────────────────────────────────
  const { output: achOut } = core.events.emitSync('achievement/list', {});
  const achList = ((achOut as { achievements?: AchEntry[] }).achievements ?? []) as AchEntry[];

  // ── Achievement list ─────────────────────────────────────────────────────────
  const listContainer = new Container();
  uiLayer.addChild(listContainer);

  const ITEM_H = 62;
  const ITEM_GAP = 5;
  const ITEM_W = W - 28;
  const startY = 82;

  achList.forEach((ach, idx) => {
    const unlocked = ach.unlockedAt !== null;
    const item = new Container();
    item.y = startY + idx * (ITEM_H + ITEM_GAP);
    item.x = 14;

    const bg = new Graphics();
    bg.roundRect(0, 0, ITEM_W, ITEM_H, 10)
      .fill({ color: unlocked ? 0x0d3322 : 0x151520, alpha: 0.92 });
    bg.roundRect(0, 0, ITEM_W, ITEM_H, 10)
      .stroke({ color: unlocked ? 0x44ff88 : 0x333355, width: 1.5 });
    item.addChild(bg);

    const nameStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 17,
      fontWeight: 'bold',
      fill: unlocked ? 0xeeffee : 0x777788,
    });
    const nameText = new Text({ text: ACHIEVEMENT_DEFS[ach.id]?.name ?? ach.id, style: nameStyle });
    nameText.x = 12;
    nameText.y = 10;
    item.addChild(nameText);

    const descStyle = new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 13,
      fill: unlocked ? 0x99bb99 : 0x555566,
    });
    const descText = new Text({ text: ACHIEVEMENT_DEFS[ach.id]?.description ?? '', style: descStyle });
    descText.x = 12;
    descText.y = 34;
    item.addChild(descText);

    // Right badge: progress counter or checkmark
    if (ach.threshold && ach.threshold > 1) {
      const prog = Math.min(ach.progress, ach.threshold);
      const badge = new Text({
        text: `${prog}/${ach.threshold}`,
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fill: unlocked ? 0x44ff88 : 0x555577,
          fontWeight: 'bold',
        }),
      });
      badge.anchor.set(1, 0.5);
      badge.x = ITEM_W - 12;
      badge.y = ITEM_H / 2;
      item.addChild(badge);
    } else if (unlocked) {
      const check = new Text({
        text: '✓',
        style: new TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: 22,
          fill: 0x44ff88,
          fontWeight: 'bold',
        }),
      });
      check.anchor.set(1, 0.5);
      check.x = ITEM_W - 12;
      check.y = ITEM_H / 2;
      item.addChild(check);
    }

    listContainer.addChild(item);
  });

  // ── Back button ───────────────────────────────────────────────────────────────
  const btnW = 160, btnH = 48;
  const btn = new Container();
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  const btnBg = new Graphics();
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
    .fill({ color: 0x333344, alpha: 0.92 })
    .stroke({ color: 0x8888aa, width: 1.5 });
  btn.addChild(btnBg);

  const btnText = new Text({
    text: '← 返回',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffffff,
    }),
  });
  btnText.anchor.set(0.5);
  btn.addChild(btnText);

  btn.x = W * 0.5;
  btn.y = H - 44;
  uiLayer.addChild(btn);

  btn.on('pointerup', async () => {
    await core.events.emit('scene/load', { key: 'title' });
  });

  _cleanup = () => {
    worldLayer.removeChild(stars);
    uiLayer.removeChild(titleLabel, listContainer, btn);
    stars.destroy({ children: true });
    titleLabel.destroy();
    listContainer.destroy({ children: true });
    btn.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const AchievementsScene: SceneDescriptor = {
  key: 'achievements',
  enter,
  exit,
};
