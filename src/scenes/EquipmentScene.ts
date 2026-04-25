import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { currencyState } from '../game/store';
import { startBgm, sfxMenuClick } from '../game/audio';
import { saveProgress } from '../game/persistence';

let _cleanup: (() => void) | null = null;
let _transitioning = false;

const SCENE_ENTER_DEBOUNCE_MS = 300;

type TabId = 'equip' | 'upgrade' | 'gacha';

async function enter(core: Core): Promise<void> {
  _transitioning = false;
  const enterTime = Date.now();
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  startBgm();

  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ────────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Title ─────────────────────────────────────────────────────────────────
  const titleLabel = new Text({
    text: '⚔️  裝備管理',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 30,
      fontWeight: 'bold',
      fill: 0xffd700,
      stroke: { color: 0x330000, width: 4 },
      dropShadow: { color: 0xff8800, distance: 3, alpha: 0.85, blur: 2 },
    }),
  });
  titleLabel.anchor.set(0.5);
  titleLabel.x = W * 0.5;
  titleLabel.y = 44;
  uiLayer.addChild(titleLabel);

  // ── Currency display ──────────────────────────────────────────────────────
  const ashLabel = new Text({
    text: `✨ 宇宙灰燼：${currencyState.cosmicAsh}`,
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0xaaddff,
    }),
  });
  ashLabel.anchor.set(1, 0);
  ashLabel.x = W - 12;
  ashLabel.y = 10;
  uiLayer.addChild(ashLabel);

  function refreshAshLabel(): void {
    ashLabel.text = `✨ 宇宙灰燼：${currencyState.cosmicAsh}`;
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabDefs: { id: TabId; label: string }[] = [
    { id: 'equip',   label: '更換裝備' },
    { id: 'upgrade', label: '裝備升級' },
    { id: 'gacha',   label: '裝備抽獎' },
  ];

  let activeTab: TabId = 'equip';
  const TAB_W = 108, TAB_H = 38;
  const TAB_GAP = 6;
  const TAB_TOTAL_W = tabDefs.length * TAB_W + (tabDefs.length - 1) * TAB_GAP;
  const tabsStartX = (W - TAB_TOTAL_W) / 2;
  const tabsY = 82;
  const tabContainers: Map<TabId, Container> = new Map();

  function buildTabs(): void {
    tabDefs.forEach((def, i) => {
      const isActive = def.id === activeTab;
      const existing = tabContainers.get(def.id);
      if (existing) {
        uiLayer.removeChild(existing);
        existing.destroy({ children: true });
      }

      const tab = new Container();
      tab.eventMode = 'static';
      tab.cursor = 'pointer';

      const bg = new Graphics();
      bg.roundRect(0, 0, TAB_W, TAB_H, 8)
        .fill({ color: isActive ? 0x553300 : 0x1a1a2e, alpha: 0.95 });
      bg.roundRect(0, 0, TAB_W, TAB_H, 8)
        .stroke({ color: isActive ? 0xffd700 : 0x555577, width: isActive ? 2 : 1.5 });
      tab.addChild(bg);

      const txt = new Text({
        text: def.label,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'bold',
          fill: isActive ? 0xffd700 : 0xaaaacc,
        }),
      });
      txt.anchor.set(0.5);
      txt.x = TAB_W / 2;
      txt.y = TAB_H / 2;
      tab.addChild(txt);

      tab.x = tabsStartX + i * (TAB_W + TAB_GAP);
      tab.y = tabsY;
      uiLayer.addChild(tab);
      tabContainers.set(def.id, tab);

      tab.on('pointerdown', () => {
        if (def.id === activeTab) return;
        sfxMenuClick();
        activeTab = def.id;
        buildTabs();
        rebuildPanel();
      });
      if (!isActive) {
        tab.on('pointerover', () => tab.scale.set(1.04));
        tab.on('pointerout',  () => tab.scale.set(1.0));
      }
    });
  }

  // ── Panel area ────────────────────────────────────────────────────────────
  const PANEL_X = 12;
  const PANEL_Y = tabsY + TAB_H + 6;
  const PANEL_W = W - 24;
  const PANEL_H = H - PANEL_Y - 60;

  const panelBg = new Graphics();
  panelBg
    .roundRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 14)
    .fill({ color: 0x080816, alpha: 0.96 });
  panelBg
    .roundRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 14)
    .stroke({ color: 0x444466, width: 1.5 });
  uiLayer.addChild(panelBg);

  let panelContent: Container | null = null;

  function clearPanel(): void {
    if (panelContent) {
      uiLayer.removeChild(panelContent);
      panelContent.destroy({ children: true });
      panelContent = null;
    }
  }

  function makeLabel(text: string, x: number, y: number, size = 16, color = 0xcccccc): Text {
    const t = new Text({
      text,
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: size,
        fill: color,
        align: 'center',
      }),
    });
    t.anchor.set(0.5);
    t.x = x;
    t.y = y;
    return t;
  }

  function makeActionBtn(opts: {
    label: string;
    fillColor: number;
    strokeColor: number;
    textColor: number;
    w?: number;
    h?: number;
  }): Container {
    const bW = opts.w ?? 200;
    const bH = opts.h ?? 48;
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-bW / 2, -bH / 2, bW, bH, 10)
      .fill({ color: opts.fillColor, alpha: 0.9 });
    bg.roundRect(-bW / 2, -bH / 2, bW, bH, 10)
      .stroke({ color: opts.strokeColor, width: 2 });
    c.addChild(bg);

    const txt = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: opts.textColor,
      }),
    });
    txt.anchor.set(0.5);
    c.addChild(txt);

    c.on('pointerover', () => c.scale.set(1.04));
    c.on('pointerout',  () => c.scale.set(1.0));
    return c;
  }

  // ── Equipment slot definitions (stub) ─────────────────────────────────────
  const EQUIP_SLOTS = [
    { name: '武器', desc: '（尚未裝備）', icon: '⚔️' },
    { name: '防具', desc: '（尚未裝備）', icon: '🛡️' },
    { name: '飾品', desc: '（尚未裝備）', icon: '💍' },
  ];

  // ── Panel builder ─────────────────────────────────────────────────────────
  function buildEquipPanel(parent: Container): void {
    const cx = W * 0.5;
    const SLOT_W = PANEL_W - 30, SLOT_H = 58, SLOT_GAP = 10;
    const startY = PANEL_Y + 28;

    parent.addChild(makeLabel('目前裝備欄位', cx, PANEL_Y + 20, 17, 0xffd700));

    EQUIP_SLOTS.forEach((slot, i) => {
      const sy = startY + 24 + i * (SLOT_H + SLOT_GAP);
      const slotBg = new Graphics();
      slotBg
        .roundRect(PANEL_X + 14, sy, SLOT_W, SLOT_H, 10)
        .fill({ color: 0x111130, alpha: 0.92 });
      slotBg
        .roundRect(PANEL_X + 14, sy, SLOT_W, SLOT_H, 10)
        .stroke({ color: 0x3344aa, width: 1.5 });
      parent.addChild(slotBg);

      const iconTxt = new Text({
        text: `${slot.icon} ${slot.name}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          fill: 0xaaccff,
        }),
      });
      iconTxt.x = PANEL_X + 28;
      iconTxt.y = sy + SLOT_H / 2 - 10;
      parent.addChild(iconTxt);

      const descTxt = new Text({
        text: slot.desc,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 13,
          fill: 0x666688,
        }),
      });
      descTxt.x = PANEL_X + 28;
      descTxt.y = sy + SLOT_H / 2 + 8;
      parent.addChild(descTxt);
    });

    const comingText = makeLabel('（裝備功能即將推出）', cx, PANEL_Y + 230, 14, 0x555577);
    parent.addChild(comingText);
  }

  const UPGRADE_COST = 3;
  const INSUFFICIENT_FUNDS_COLOR = 0xff4444;
  const COST_LABEL_COLOR = 0xaaddff;

  function buildUpgradePanel(parent: Container): void {
    const cx = W * 0.5;

    parent.addChild(makeLabel('裝備升級', cx, PANEL_Y + 24, 17, 0xffd700));
    parent.addChild(makeLabel('消耗宇宙灰燼來強化你的裝備能力。', cx, PANEL_Y + 60, 13, 0x888899));

    // Upgrade option rows (stubs)
    const UPGRADE_OPTS = [
      { name: '攻擊力 +1', cost: UPGRADE_COST, color: 0x882200 },
      { name: '防禦力 +1', cost: UPGRADE_COST, color: 0x224488 },
      { name: '速度 +1',   cost: UPGRADE_COST, color: 0x226622 },
    ];

    const ITEM_W = PANEL_W - 30, ITEM_H = 58, ITEM_GAP = 10;
    const startY = PANEL_Y + 86;

    UPGRADE_OPTS.forEach((opt, i) => {
      const iy = startY + i * (ITEM_H + ITEM_GAP);
      const itemBg = new Graphics();
      itemBg
        .roundRect(PANEL_X + 14, iy, ITEM_W, ITEM_H, 10)
        .fill({ color: 0x0d0d22, alpha: 0.92 });
      itemBg
        .roundRect(PANEL_X + 14, iy, ITEM_W, ITEM_H, 10)
        .stroke({ color: 0x333355, width: 1.5 });
      parent.addChild(itemBg);

      const nameTxt = new Text({
        text: opt.name,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          fill: 0xddddee,
        }),
      });
      nameTxt.x = PANEL_X + 28;
      nameTxt.y = iy + ITEM_H / 2 - 10;
      parent.addChild(nameTxt);

      const costTxt = new Text({
        text: `✨ ×${opt.cost}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 13,
          fill: COST_LABEL_COLOR,
        }),
      });
      costTxt.x = PANEL_X + 28;
      costTxt.y = iy + ITEM_H / 2 + 8;
      parent.addChild(costTxt);

      // Upgrade button
      const upgradeBtn = new Container();
      upgradeBtn.eventMode = 'static';
      upgradeBtn.cursor = 'pointer';

      const btnW = 80, btnH = 34;
      const btnBg = new Graphics();
      btnBg
        .roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 8)
        .fill({ color: opt.color, alpha: 0.88 });
      btnBg
        .roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 8)
        .stroke({ color: 0xffffff, width: 1.5, alpha: 0.4 });
      upgradeBtn.addChild(btnBg);

      const btnTxt = new Text({
        text: '升級',
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 15,
          fontWeight: 'bold',
          fill: 0xffffff,
        }),
      });
      btnTxt.anchor.set(0.5);
      upgradeBtn.addChild(btnTxt);

      upgradeBtn.x = PANEL_X + ITEM_W - 14;
      upgradeBtn.y = iy + ITEM_H / 2;

      upgradeBtn.on('pointerdown', async () => {
        if (currencyState.cosmicAsh < opt.cost) {
          // Flash the label red briefly to indicate insufficient funds
          costTxt.style.fill = INSUFFICIENT_FUNDS_COLOR;
          setTimeout(() => { costTxt.style.fill = COST_LABEL_COLOR; }, 800);
          return;
        }
        sfxMenuClick();
        currencyState.cosmicAsh -= opt.cost;
        refreshAshLabel();
        await saveProgress();
        // Show brief confirmation
        btnTxt.text = '✓';
        setTimeout(() => { btnTxt.text = '升級'; }, 1000);
      });
      upgradeBtn.on('pointerover', () => upgradeBtn.scale.set(1.06));
      upgradeBtn.on('pointerout',  () => upgradeBtn.scale.set(1.0));

      parent.addChild(upgradeBtn);
    });
  }

  const GACHA_COST = 1;
  const GACHA_RESULTS = [
    '⚔️ 銀色劍刃', '🛡️ 鐵製盾牌', '💍 翡翠戒指',
    '🌟 星塵項鍊', '🔥 炎焰護腕', '❄️ 霜雪寶石',
    '⚡ 雷光靴子', '🌙 月影斗篷',
  ];

  function buildGachaPanel(parent: Container): void {
    const cx = W * 0.5;

    parent.addChild(makeLabel('裝備抽獎', cx, PANEL_Y + 24, 17, 0xffd700));
    parent.addChild(makeLabel(`消耗 ✨×${GACHA_COST} 進行一次抽獎`, cx, PANEL_Y + 58, 13, 0x888899));

    // Result display box
    const RESULT_W = PANEL_W - 40, RESULT_H = 80;
    const RESULT_X = PANEL_X + 18;
    const RESULT_Y = PANEL_Y + 82;

    const resultBg = new Graphics();
    resultBg
      .roundRect(RESULT_X, RESULT_Y, RESULT_W, RESULT_H, 12)
      .fill({ color: 0x0a0a20, alpha: 0.95 });
    resultBg
      .roundRect(RESULT_X, RESULT_Y, RESULT_W, RESULT_H, 12)
      .stroke({ color: 0x444488, width: 1.5 });
    parent.addChild(resultBg);

    const resultText = new Text({
      text: '－',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      }),
    });
    resultText.anchor.set(0.5);
    resultText.x = RESULT_X + RESULT_W / 2;
    resultText.y = RESULT_Y + RESULT_H / 2;
    parent.addChild(resultText);

    const subResultText = new Text({
      text: '（點擊下方按鈕開始抽獎）',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 12,
        fill: 0x555577,
        align: 'center',
      }),
    });
    subResultText.anchor.set(0.5);
    subResultText.x = RESULT_X + RESULT_W / 2;
    subResultText.y = RESULT_Y + RESULT_H + 16;
    parent.addChild(subResultText);

    const gachaBtn = makeActionBtn({
      label: `✨ 抽獎  (×${GACHA_COST} 灰燼)`,
      fillColor: 0x440066,
      strokeColor: 0xaa44ff,
      textColor: 0xeeaaff,
      w: 230,
      h: 52,
    });
    gachaBtn.x = cx;
    gachaBtn.y = PANEL_Y + 238;
    parent.addChild(gachaBtn);

    gachaBtn.on('pointerdown', async () => {
      if (currencyState.cosmicAsh < GACHA_COST) {
        subResultText.text = '⚠️ 宇宙灰燼不足！';
        subResultText.style.fill = 0xff4444;
        setTimeout(() => {
          subResultText.text = '（點擊下方按鈕開始抽獎）';
          subResultText.style.fill = 0x555577;
        }, 1500);
        return;
      }

      sfxMenuClick();
      currencyState.cosmicAsh -= GACHA_COST;
      refreshAshLabel();
      await saveProgress();

      // Spin animation
      const items = ['...', '?!', '✨✨✨'];
      for (const frame of items) {
        resultText.text = frame;
        await new Promise<void>((r) => setTimeout(r, 300));
      }

      const reward = GACHA_RESULTS[Math.floor(Math.random() * GACHA_RESULTS.length)];
      resultText.text = reward;
      subResultText.text = '🎉 恭喜獲得裝備！';
      subResultText.style.fill = 0x88ffaa;
      setTimeout(() => {
        subResultText.text = '（點擊下方按鈕繼續抽獎）';
        subResultText.style.fill = 0x555577;
      }, 3000);
    });
  }

  function rebuildPanel(): void {
    clearPanel();
    const c = new Container();
    panelContent = c;
    switch (activeTab) {
      case 'equip':   buildEquipPanel(c); break;
      case 'upgrade': buildUpgradePanel(c); break;
      case 'gacha':   buildGachaPanel(c); break;
    }
    uiLayer.addChild(c);
  }

  buildTabs();
  rebuildPanel();

  // ── Back button ───────────────────────────────────────────────────────────
  const backBtnW = 160, backBtnH = 42;
  const backBtn = new Container();
  backBtn.eventMode = 'static';
  backBtn.cursor = 'pointer';

  const backBg = new Graphics();
  backBg.roundRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 10)
    .fill({ color: 0x333355, alpha: 0.88 });
  backBg.roundRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 10)
    .stroke({ color: 0x7777cc, width: 1.5 });
  backBtn.addChild(backBg);

  const backTxt = new Text({
    text: '← 返回',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 18,
      fill: 0xccccff,
    }),
  });
  backTxt.anchor.set(0.5);
  backBtn.addChild(backTxt);

  backBtn.x = W * 0.5;
  backBtn.y = H - 28;
  uiLayer.addChild(backBtn);

  backBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    if (Date.now() - enterTime < SCENE_ENTER_DEBOUNCE_MS) return;
    _transitioning = true;
    sfxMenuClick();
    await core.events.emit('scene/load', { key: 'title' });
  });
  backBtn.on('pointerover', () => backBtn.scale.set(1.04));
  backBtn.on('pointerout',  () => backBtn.scale.set(1.0));

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('equipment');
    clearPanel();
    tabContainers.forEach((tab) => {
      uiLayer.removeChild(tab);
      tab.destroy({ children: true });
    });
    tabContainers.clear();

    worldLayer.removeChild(stars);
    uiLayer.removeChild(titleLabel, ashLabel, panelBg, backBtn);
    stars.destroy({ children: true });
    titleLabel.destroy();
    ashLabel.destroy();
    panelBg.destroy();
    backBtn.destroy({ children: true });
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const EquipmentScene: SceneDescriptor = {
  key: 'equipment',
  enter,
  exit,
};
