import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import { createStarfield } from '../game/sprites';
import { currencyState, equipmentState } from '../game/store';
import { startBgm, sfxMenuClick } from '../game/audio';
import { saveProgress } from '../game/persistence';
import {
  EQUIPMENT_DEFS,
  EQUIPMENT_MAX_LEVEL,
  EQUIPMENT_UPGRADE_COST,
  type EquipmentId,
  type EquipSlotId,
} from '../game/equipment';

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
  let panelMask: Graphics | null = null;
  let panelScrollbar: Graphics | null = null;

  function clearPanel(): void {
    panelBg.eventMode = 'none';
    panelBg.off('wheel');
    panelBg.off('pointerdown');
    panelBg.off('pointermove');
    panelBg.off('pointerup');
    panelBg.off('pointerupoutside');
    if (panelContent) {
      panelContent.mask = null;
      uiLayer.removeChild(panelContent);
      panelContent.destroy({ children: true });
      panelContent = null;
    }
    if (panelMask) {
      uiLayer.removeChild(panelMask);
      panelMask.destroy();
      panelMask = null;
    }
    if (panelScrollbar) {
      uiLayer.removeChild(panelScrollbar);
      panelScrollbar.destroy();
      panelScrollbar = null;
    }
  }

  function setupScroll(c: Container, contentBottom: number): void {
    const PANEL_BOTTOM_PADDING = 8;
    const MIN_SCROLLBAR_THUMB_HEIGHT = 24;
    const SCROLLBAR_VERTICAL_PADDING = 8;

    const contentH = contentBottom - PANEL_Y;
    const maxScroll = Math.max(0, contentH - PANEL_H + PANEL_BOTTOM_PADDING);
    if (maxScroll <= 0) return;

    // Clip mask
    const mask = new Graphics();
    mask.rect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H).fill({ color: 0xffffff });
    uiLayer.addChild(mask);
    panelMask = mask;
    c.mask = mask;

    // Scrollbar
    const SB_W = 5;
    const SB_X = PANEL_X + PANEL_W - SB_W - 3;
    const thumbH = Math.max(MIN_SCROLLBAR_THUMB_HEIGHT, (PANEL_H / contentH) * PANEL_H);
    const thumbRange = PANEL_H - thumbH - SCROLLBAR_VERTICAL_PADDING;

    const scrollbar = new Graphics();
    uiLayer.addChild(scrollbar);
    panelScrollbar = scrollbar;

    function drawScrollbar(sy: number): void {
      scrollbar.clear();
      scrollbar.roundRect(SB_X, PANEL_Y + 4, SB_W, PANEL_H - SCROLLBAR_VERTICAL_PADDING, 3)
        .fill({ color: 0x333355, alpha: 0.7 });
      const thumbY = PANEL_Y + 4 + (sy / maxScroll) * thumbRange;
      scrollbar.roundRect(SB_X, thumbY, SB_W, thumbH, 3)
        .fill({ color: 0x8888cc, alpha: 0.9 });
    }

    let scrollY = 0;
    drawScrollbar(0);

    function applyScroll(newY: number): void {
      scrollY = Math.max(0, Math.min(maxScroll, newY));
      c.y = -scrollY;
      drawScrollbar(scrollY);
    }

    // Mouse wheel
    panelBg.eventMode = 'static';
    panelBg.on('wheel', (e: FederatedWheelEvent) => {
      applyScroll(scrollY + e.deltaY * 0.5);
    });

    // Touch / pointer drag
    let dragging = false;
    let dragStartY = 0;
    let dragStartScroll = 0;

    panelBg.on('pointerdown', (e: FederatedPointerEvent) => {
      dragging = true;
      dragStartY = e.global.y;
      dragStartScroll = scrollY;
    });
    panelBg.on('pointermove', (e: FederatedPointerEvent) => {
      if (!dragging) return;
      applyScroll(dragStartScroll + (dragStartY - e.global.y));
    });
    const endDrag = () => { dragging = false; };
    panelBg.on('pointerup', endDrag);
    panelBg.on('pointerupoutside', endDrag);
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

  // ── Equipment slot definitions ────────────────────────────────────────────
  const EQUIP_SLOT_DEFS: { id: EquipSlotId; name: string; icon: string }[] = [
    { id: 'weapon',    name: '武器',   icon: '⚔️' },
    { id: 'armor',     name: '防具',   icon: '🛡️' },
    { id: 'accessory', name: '飾品',   icon: '💍' },
    { id: 'wingman',   name: '僚雞武器', icon: '🐔' },
  ];

  // ── Panel builder ─────────────────────────────────────────────────────────
  function buildEquipPanel(parent: Container): void {
    const cx = W * 0.5;
    const SLOT_W = PANEL_W - 30;
    const SLOT_H = 50, SLOT_GAP = 8;
    const slotsStartY = PANEL_Y + 38;

    parent.addChild(makeLabel('裝備欄位', cx, PANEL_Y + 18, 16, 0xffd700));

    // ── Slot rows ──────────────────────────────────────────────────────────
    EQUIP_SLOT_DEFS.forEach((slotDef, i) => {
      const sy = slotsStartY + i * (SLOT_H + SLOT_GAP);

      const slotBg = new Graphics();
      slotBg.roundRect(PANEL_X + 14, sy, SLOT_W, SLOT_H, 10)
        .fill({ color: 0x111130, alpha: 0.92 });
      slotBg.roundRect(PANEL_X + 14, sy, SLOT_W, SLOT_H, 10)
        .stroke({ color: 0x3344aa, width: 1.5 });
      parent.addChild(slotBg);

      const slotTypeTxt = new Text({
        text: `${slotDef.icon} ${slotDef.name}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'bold',
          fill: 0xaaccff,
        }),
      });
      slotTypeTxt.x = PANEL_X + 28;
      slotTypeTxt.y = sy + SLOT_H / 2 - 9;
      parent.addChild(slotTypeTxt);

      const equippedId = equipmentState.equippedSlots[slotDef.id];
      const equippedDef = equippedId ? EQUIPMENT_DEFS.find((d) => d.id === equippedId) : null;
      const lvl = equippedId ? (equipmentState.upgradeLevels[equippedId] ?? 1) : 0;

      const equippedTxt = new Text({
        text: equippedDef
          ? `${equippedDef.icon} ${equippedDef.name}  Lv.${lvl}  ${equippedDef.stat}`
          : '（空）',
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 12,
          fill: equippedDef ? 0x88ffaa : 0x555566,
        }),
      });
      equippedTxt.x = PANEL_X + 28;
      equippedTxt.y = sy + SLOT_H / 2 + 7;
      parent.addChild(equippedTxt);

      if (equippedDef) {
        const bW = 52, bH = 28;
        const unequipBtn = new Container();
        unequipBtn.eventMode = 'static';
        unequipBtn.cursor = 'pointer';
        const unequipBg = new Graphics();
        unequipBg.roundRect(-bW / 2, -bH / 2, bW, bH, 7)
          .fill({ color: 0x441111, alpha: 0.9 });
        unequipBg.roundRect(-bW / 2, -bH / 2, bW, bH, 7)
          .stroke({ color: 0xff5555, width: 1.5 });
        unequipBtn.addChild(unequipBg);
        const unequipTxt = new Text({
          text: '卸除',
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 12,
            fontWeight: 'bold',
            fill: 0xff9999,
          }),
        });
        unequipTxt.anchor.set(0.5);
        unequipBtn.addChild(unequipTxt);
        unequipBtn.x = PANEL_X + 14 + SLOT_W - bW / 2 - 8;
        unequipBtn.y = sy + SLOT_H / 2;
        unequipBtn.on('pointerdown', async () => {
          sfxMenuClick();
          equipmentState.equippedSlots[slotDef.id] = null;
          await saveProgress();
          rebuildPanel();
        });
        unequipBtn.on('pointerover', () => unequipBtn.scale.set(1.06));
        unequipBtn.on('pointerout',  () => unequipBtn.scale.set(1.0));
        parent.addChild(unequipBtn);
      }
    });

    // ── Obtained equipment list grouped by type ───────────────────────────
    const obtained = [...equipmentState.obtained];
    const listStartY = slotsStartY + EQUIP_SLOT_DEFS.length * (SLOT_H + SLOT_GAP) + 12;

    if (obtained.length === 0) {
      parent.addChild(makeLabel('（尚未獲得任何裝備，前往裝備抽獎！）', cx, listStartY + 12, 13, 0x555577));
      return;
    }

    parent.addChild(makeLabel('已獲得裝備（點擊「裝備」按鈕換裝）', cx, listStartY, 13, 0xaaddff));

    const LIST_H = 44, LIST_GAP = 6;
    const SECTION_HEADER_H = 24, SECTION_GAP = 10;
    let cursorY = listStartY + 20;

    // Show weapon items once with two equip buttons: 「武器」slot and 「僚雞」slot.
    // Other slots (armor, accessory) show normally without a wingman button.
    EQUIP_SLOT_DEFS.forEach((slotDef) => {
      // For the wingman row we skip: it is handled inline in the weapon section below.
      if (slotDef.id === 'wingman') return;

      const slotItems = obtained.filter((id) => {
        const d = EQUIPMENT_DEFS.find((e) => e.id === id);
        return d?.slot === slotDef.id;
      });
      if (slotItems.length === 0) return;

      // Section header
      const headerBg = new Graphics();
      headerBg.roundRect(PANEL_X + 14, cursorY, SLOT_W, SECTION_HEADER_H, 6)
        .fill({ color: 0x1a1a3a, alpha: 0.95 });
      headerBg.roundRect(PANEL_X + 14, cursorY, SLOT_W, SECTION_HEADER_H, 6)
        .stroke({ color: 0x4455aa, width: 1 });
      parent.addChild(headerBg);

      const headerTxt = new Text({
        text: `${slotDef.icon} ${slotDef.name}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 13,
          fontWeight: 'bold',
          fill: 0xaaccff,
        }),
      });
      headerTxt.anchor.set(0, 0.5);
      headerTxt.x = PANEL_X + 28;
      headerTxt.y = cursorY + SECTION_HEADER_H / 2;
      parent.addChild(headerTxt);
      cursorY += SECTION_HEADER_H + 4;

      slotItems.forEach((id) => {
        const def = EQUIPMENT_DEFS.find((d) => d.id === id);
        if (!def) return;
        const ly = cursorY;
        // For weapon items: show both a main-weapon button AND a wingman button.
        const isWeaponItem = def.slot === 'weapon';
        const rowH = isWeaponItem ? LIST_H + 4 : LIST_H;

        const listBg = new Graphics();
        listBg.roundRect(PANEL_X + 14, ly, SLOT_W, rowH, 8)
          .fill({ color: 0x0d1122, alpha: 0.9 });
        listBg.roundRect(PANEL_X + 14, ly, SLOT_W, rowH, 8)
          .stroke({ color: 0x333366, width: 1.2 });
        parent.addChild(listBg);

        const itemLvl = equipmentState.upgradeLevels[id] ?? 1;
        const itemNameTxt = new Text({
          text: `${def.icon} ${def.name}  Lv.${itemLvl}`,
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 13,
            fontWeight: 'bold',
            fill: 0xddddee,
          }),
        });
        itemNameTxt.x = PANEL_X + 28;
        itemNameTxt.y = ly + (isWeaponItem ? LIST_H / 2 - 10 : LIST_H / 2 - 8);
        parent.addChild(itemNameTxt);

        const statTxt = new Text({
          text: def.stat,
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 11,
            fill: 0x7799bb,
          }),
        });
        statTxt.x = PANEL_X + 28;
        statTxt.y = ly + (isWeaponItem ? LIST_H / 2 + 2 : LIST_H / 2 + 7);
        parent.addChild(statTxt);

        // ── Main-weapon equip button ─────────────────────────────────────
        const isEquipped = equipmentState.equippedSlots[def.slot] === id;
        const bW = 56, bH = 28;
        const equipBtn = new Container();
        equipBtn.eventMode = 'static';
        equipBtn.cursor = isEquipped ? 'default' : 'pointer';
        const equipBg = new Graphics();
        equipBg.roundRect(-bW / 2, -bH / 2, bW, bH, 7)
          .fill({ color: isEquipped ? 0x115511 : 0x224488, alpha: 0.9 });
        equipBg.roundRect(-bW / 2, -bH / 2, bW, bH, 7)
          .stroke({ color: isEquipped ? 0x55cc55 : 0x6688ff, width: 1.5 });
        equipBtn.addChild(equipBg);
        const equipBtnTxt = new Text({
          text: isEquipped ? '已裝備' : '武器',
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 12,
            fontWeight: 'bold',
            fill: isEquipped ? 0x88ee88 : 0xffffff,
          }),
        });
        equipBtnTxt.anchor.set(0.5);
        equipBtn.addChild(equipBtnTxt);
        // Position: right edge of the row, top half for weapon items, centre otherwise
        const btnRightX = PANEL_X + 14 + SLOT_W - bW / 2 - 8;
        equipBtn.x = btnRightX;
        equipBtn.y = ly + (isWeaponItem ? LIST_H / 2 - 8 : LIST_H / 2);

        if (!isEquipped) {
          equipBtn.on('pointerdown', async () => {
            sfxMenuClick();
            equipmentState.equippedSlots[def.slot] = id;
            await saveProgress();
            rebuildPanel();
          });
          equipBtn.on('pointerover', () => equipBtn.scale.set(1.06));
          equipBtn.on('pointerout',  () => equipBtn.scale.set(1.0));
        }
        parent.addChild(equipBtn);

        // ── Wingman equip button (weapon items only) ─────────────────────
        if (isWeaponItem) {
          const isWingmanEquipped = equipmentState.equippedSlots['wingman'] === id;
          const wgW = 56, wgH = 26;
          const wingmanBtn = new Container();
          wingmanBtn.eventMode = 'static';
          wingmanBtn.cursor = isWingmanEquipped ? 'default' : 'pointer';
          const wgBg = new Graphics();
          wgBg.roundRect(-wgW / 2, -wgH / 2, wgW, wgH, 7)
            .fill({ color: isWingmanEquipped ? 0x003311 : 0x224422, alpha: 0.9 });
          wgBg.roundRect(-wgW / 2, -wgH / 2, wgW, wgH, 7)
            .stroke({ color: isWingmanEquipped ? 0x44cc88 : 0x44cc66, width: 1.5 });
          wingmanBtn.addChild(wgBg);
          const wgTxt = new Text({
            text: isWingmanEquipped ? '僚雞中' : '僚雞',
            style: new TextStyle({
              fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
              fontSize: 12,
              fontWeight: 'bold',
              fill: isWingmanEquipped ? 0x88ffcc : 0x88ff88,
            }),
          });
          wgTxt.anchor.set(0.5);
          wingmanBtn.addChild(wgTxt);
          wingmanBtn.x = btnRightX;
          wingmanBtn.y = ly + LIST_H / 2 + 14;

          if (!isWingmanEquipped) {
            wingmanBtn.on('pointerdown', async () => {
              sfxMenuClick();
              equipmentState.equippedSlots['wingman'] = id;
              await saveProgress();
              rebuildPanel();
            });
            wingmanBtn.on('pointerover', () => wingmanBtn.scale.set(1.06));
            wingmanBtn.on('pointerout',  () => wingmanBtn.scale.set(1.0));
          }
          parent.addChild(wingmanBtn);
        }

        cursorY += rowH + LIST_GAP;
      });

      cursorY += SECTION_GAP;
    });
  }

  const INSUFFICIENT_FUNDS_COLOR = 0xff4444;
  const COST_LABEL_COLOR = 0xaaddff;

  function buildUpgradePanel(parent: Container): void {
    const cx = W * 0.5;

    parent.addChild(makeLabel('裝備升級', cx, PANEL_Y + 24, 17, 0xffd700));

    const obtained = [...equipmentState.obtained];

    if (obtained.length === 0) {
      parent.addChild(makeLabel('（尚未獲得任何裝備，請先前往裝備抽獎！）', cx, PANEL_Y + 80, 13, 0x555577));
      return;
    }

    parent.addChild(makeLabel(`升級費用：✨×${EQUIPMENT_UPGRADE_COST}／次　最高 Lv.${EQUIPMENT_MAX_LEVEL}`, cx, PANEL_Y + 52, 12, 0x888899));

    const ITEM_W = PANEL_W - 30, ITEM_H = 58, ITEM_GAP = 8;
    const startY = PANEL_Y + 72;

    obtained.forEach((id, i) => {
      const def = EQUIPMENT_DEFS.find((d) => d.id === id);
      if (!def) return;

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
        text: `${def.icon} ${def.name}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 15,
          fontWeight: 'bold',
          fill: 0xddddee,
        }),
      });
      nameTxt.x = PANEL_X + 28;
      nameTxt.y = iy + ITEM_H / 2 - 12;
      parent.addChild(nameTxt);

      const currentLvl = equipmentState.upgradeLevels[id] ?? 1;

      const lvlTxt = new Text({
        text: `Lv.${currentLvl}  ${def.stat}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 12,
          fill: 0x88aadd,
        }),
      });
      lvlTxt.x = PANEL_X + 28;
      lvlTxt.y = iy + ITEM_H / 2 + 4;
      parent.addChild(lvlTxt);

      const BTN_X = PANEL_X + 14 + ITEM_W - 44;
      const btnW = 72, btnH = 32;

      if (currentLvl >= EQUIPMENT_MAX_LEVEL) {
        const maxTxt = new Text({
          text: '✅ 已達最高等級',
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 12,
            fill: 0x55aa55,
          }),
        });
        maxTxt.anchor.set(1, 0.5);
        maxTxt.x = PANEL_X + 14 + ITEM_W - 10;
        maxTxt.y = iy + ITEM_H / 2;
        parent.addChild(maxTxt);
      } else {
        const costTxt = new Text({
          text: `✨×${EQUIPMENT_UPGRADE_COST}`,
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 12,
            fill: COST_LABEL_COLOR,
          }),
        });
        costTxt.anchor.set(1, 0.5);
        costTxt.x = BTN_X - btnW / 2 - 8;
        costTxt.y = iy + ITEM_H / 2;
        parent.addChild(costTxt);

        // Upgrade button
        const upgradeBtn = new Container();
        upgradeBtn.eventMode = 'static';
        upgradeBtn.cursor = 'pointer';

        const btnBg = new Graphics();
        btnBg
          .roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 8)
          .fill({ color: 0x334488, alpha: 0.9 });
        btnBg
          .roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 8)
          .stroke({ color: 0x6688ff, width: 1.5 });
        upgradeBtn.addChild(btnBg);

        const btnTxt = new Text({
          text: '升級',
          style: new TextStyle({
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xffffff,
          }),
        });
        btnTxt.anchor.set(0.5);
        upgradeBtn.addChild(btnTxt);

        upgradeBtn.x = BTN_X;
        upgradeBtn.y = iy + ITEM_H / 2;

        upgradeBtn.on('pointerdown', async () => {
          if (currencyState.cosmicAsh < EQUIPMENT_UPGRADE_COST) {
            costTxt.style.fill = INSUFFICIENT_FUNDS_COLOR;
            setTimeout(() => { costTxt.style.fill = COST_LABEL_COLOR; }, 800);
            return;
          }
          sfxMenuClick();
          currencyState.cosmicAsh -= EQUIPMENT_UPGRADE_COST;
          refreshAshLabel();

          const newLvl = (equipmentState.upgradeLevels[id] ?? 1) + 1;
          equipmentState.upgradeLevels[id as EquipmentId] = newLvl;

          await saveProgress();

          btnTxt.text = '✓';
          setTimeout(() => { rebuildPanel(); }, 800);
        });
        upgradeBtn.on('pointerover', () => upgradeBtn.scale.set(1.06));
        upgradeBtn.on('pointerout',  () => upgradeBtn.scale.set(1.0));

        parent.addChild(upgradeBtn);
      }
    });
  }

  const GACHA_COST = 1;

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

    // Collection progress indicator
    const progressTxt = new Text({
      text: `收集進度：${equipmentState.obtained.size} / ${EQUIPMENT_DEFS.length}`,
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 12,
        fill: 0x8888aa,
        align: 'center',
      }),
    });
    progressTxt.anchor.set(0.5);
    progressTxt.x = cx;
    progressTxt.y = RESULT_Y + RESULT_H + 36;
    parent.addChild(progressTxt);

    const gachaBtn = makeActionBtn({
      label: `✨ 抽獎  (×${GACHA_COST} 灰燼)`,
      fillColor: 0x440066,
      strokeColor: 0xaa44ff,
      textColor: 0xeeaaff,
      w: 230,
      h: 52,
    });
    gachaBtn.x = cx;
    gachaBtn.y = PANEL_Y + 256;
    parent.addChild(gachaBtn);

    gachaBtn.on('pointerdown', async () => {
      // Check if all equipment has been obtained
      const remaining = EQUIPMENT_DEFS.filter((d) => !equipmentState.obtained.has(d.id));
      if (remaining.length === 0) {
        subResultText.text = '🎊 已收集全部裝備！';
        subResultText.style.fill = 0xffdd44;
        setTimeout(() => {
          subResultText.text = '（已收集全部裝備）';
          subResultText.style.fill = 0x888899;
        }, 2000);
        return;
      }

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

      // Spin animation
      const frames = ['...', '?!', '✨✨✨'];
      for (const frame of frames) {
        resultText.text = frame;
        await new Promise<void>((r) => setTimeout(r, 300));
      }

      // Draw from equipment not yet obtained
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      equipmentState.obtained.add(pick.id);
      equipmentState.upgradeLevels[pick.id] = 1;

      await saveProgress();

      resultText.text = `${pick.icon} ${pick.name}`;
      subResultText.text = '🎉 恭喜獲得新裝備！';
      subResultText.style.fill = 0x88ffaa;
      progressTxt.text = `收集進度：${equipmentState.obtained.size} / ${EQUIPMENT_DEFS.length}`;

      setTimeout(() => {
        const allCollected = equipmentState.obtained.size >= EQUIPMENT_DEFS.length;
        subResultText.text = allCollected ? '（已收集全部裝備！）' : '（點擊下方按鈕繼續抽獎）';
        subResultText.style.fill = allCollected ? 0xffdd44 : 0x555577;
      }, 3000);
    });
  }

  function rebuildPanel(): void {
    clearPanel();
    const c = new Container();
    panelContent = c;

    switch (activeTab) {
      case 'equip': {
        buildEquipPanel(c);
        const obtained = [...equipmentState.obtained];
        const SLOT_H = 50, SLOT_GAP = 8, LIST_H = 44, LIST_GAP = 6;
        const SECTION_HEADER_H = 24, SECTION_GAP = 10;
        const listStartY = PANEL_Y + 38 + EQUIP_SLOT_DEFS.length * (SLOT_H + SLOT_GAP) + 12;
        let contentBottom: number;
        if (obtained.length === 0) {
          contentBottom = listStartY + 30;
        } else {
          const numSections = EQUIP_SLOT_DEFS.filter((slotDef) =>
            obtained.some((id) => EQUIPMENT_DEFS.find((d) => d.id === id)?.slot === slotDef.id)
          ).length;
          contentBottom = listStartY + 20
            + numSections * (SECTION_HEADER_H + 4 + SECTION_GAP)
            + obtained.length * (LIST_H + LIST_GAP)
            + 16;
        }
        uiLayer.addChild(c);
        setupScroll(c, contentBottom);
        break;
      }
      case 'upgrade': {
        buildUpgradePanel(c);
        const obtained = [...equipmentState.obtained];
        const ITEM_H = 58, ITEM_GAP = 8;
        const contentBottom = PANEL_Y + 72 + obtained.length * (ITEM_H + ITEM_GAP) + 16;
        uiLayer.addChild(c);
        setupScroll(c, contentBottom);
        break;
      }
      case 'gacha':
        buildGachaPanel(c);
        uiLayer.addChild(c);
        break;
    }
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
