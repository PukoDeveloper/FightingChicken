import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import {
  createChickenDisplay,
  createElegantChickenDisplay,
  createMooseChickenDisplay,
  createFoxChickenDisplay,
  createWizardChickenDisplay,
  createAdventureChickenDisplay,
  createHeroChickenDisplay,
  createBossChickenDisplay,
  createCourageDisplay,
  createStarfield,
} from '../game/sprites';
import { costumeState, endlessState } from '../game/store';
import { COSTUMES, isCostumeUnlocked } from '../game/costumes';
import type { CostumeId } from '../game/costumes';
import { startBgm, sfxMenuClick } from '../game/audio';

// Clean up function stored between enter/exit
let _cleanup: (() => void) | null = null;
let _transitioning = false;

/** Build the preview Container for the given costume. */
function buildCostumePreview(id: CostumeId): Container {
  switch (id) {
    case 'elegant':   return createElegantChickenDisplay();
    case 'moose':     return createMooseChickenDisplay();
    case 'fox':       return createFoxChickenDisplay();
    case 'wizard':    return createWizardChickenDisplay();
    case 'adventure': return createAdventureChickenDisplay();
    case 'hero':      return createHeroChickenDisplay();
    case 'boss':      return createBossChickenDisplay();
    default:          return createChickenDisplay();
  }
}

async function enter(core: Core): Promise<void> {
  _transitioning = false;
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // ── Layers ──────────────────────────────────────────────────────────────
  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;

  // ── Background ───────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Costume state for cycling ─────────────────────────────────────────────
  const unlockedCostumes = COSTUMES.filter(c =>
    isCostumeUnlocked(c.id, costumeState.clearedLevels, endlessState.bestWave),
  );
  let costumeIndex = unlockedCostumes.findIndex(c => c.id === costumeState.selected);
  if (costumeIndex < 0) costumeIndex = 0;

  // ── Characters preview ───────────────────────────────────────────────────
  // Left side: selected costume preview (changes when player cycles)
  const chickenContainer = new Container();
  chickenContainer.x = W * 0.30;
  chickenContainer.y = H * 0.43;
  worldLayer.addChild(chickenContainer);

  let currentCostumeDisplay = buildCostumePreview(unlockedCostumes[costumeIndex].id);
  currentCostumeDisplay.scale.set(1.6);
  chickenContainer.addChild(currentCostumeDisplay);

  // Right side: enemy preview (static)
  const couragePreview = createCourageDisplay();
  couragePreview.scale.set(1.2);
  couragePreview.x = W * 0.70;
  couragePreview.y = H * 0.43;
  worldLayer.addChild(couragePreview);

  // VS text
  const vsStyle = new TextStyle({
    fontFamily: 'Arial Black, Arial, sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    fill: 0xffffff,
    dropShadow: { color: 0xff4400, distance: 4, alpha: 0.9, blur: 2 },
  });
  const vsText = new Text({ text: 'VS', style: vsStyle });
  vsText.anchor.set(0.5);
  vsText.x = W * 0.5;
  vsText.y = H * 0.43;
  worldLayer.addChild(vsText);

  // ── Title ─────────────────────────────────────────────────────────────────
  const titleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 36,
    fontWeight: 'bold',
    fill: 0xffd700,
    stroke: { color: 0x330000, width: 4 },
    dropShadow: { color: 0xff0000, distance: 3, alpha: 0.85, blur: 2 },
  });
  const title = new Text({ text: '小雞大戰勇氣！', style: titleStyle });
  title.anchor.set(0.5);
  title.x = W * 0.5;
  title.y = H * 0.16;
  title.alpha = 0;
  uiLayer.addChild(title);

  const subtitleStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 18,
    fill: 0xffdd88,
  });
  const subtitle = new Text({ text: '彈幕射擊遊戲', style: subtitleStyle });
  subtitle.anchor.set(0.5);
  subtitle.x = W * 0.5;
  subtitle.y = H * 0.24;
  subtitle.alpha = 0;
  uiLayer.addChild(subtitle);

  // ── Costume picker ────────────────────────────────────────────────────────
  // Label above picker
  const costumeLabel = new Text({
    text: '造型',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 13,
      fill: 0xaaaaaa,
    }),
  });
  costumeLabel.anchor.set(0.5);
  costumeLabel.x = W * 0.5;
  costumeLabel.y = H * 0.57;
  costumeLabel.alpha = 0;
  uiLayer.addChild(costumeLabel);

  // Costume name
  const costumeNameStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const costumeNameText = new Text({
    text: unlockedCostumes[costumeIndex].name,
    style: costumeNameStyle,
  });
  costumeNameText.anchor.set(0.5);
  costumeNameText.x = W * 0.5;
  costumeNameText.y = H * 0.625;
  costumeNameText.alpha = 0;
  uiLayer.addChild(costumeNameText);

  // Prev / Next arrow buttons
  function makeArrowBtn(label: string): Container {
    const arrowW = 44, arrowH = 44;
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    const bg = new Graphics();
    bg.roundRect(-arrowW / 2, -arrowH / 2, arrowW, arrowH, 10)
      .fill({ color: 0x333355, alpha: 0.85 })
      .stroke({ color: 0x8888cc, width: 1.5 });
    c.addChild(bg);
    const txt = new Text({
      text: label,
      style: new TextStyle({ fontFamily: 'Arial, sans-serif', fontSize: 22, fill: 0xddddff, fontWeight: 'bold' }),
    });
    txt.anchor.set(0.5);
    c.addChild(txt);
    return c;
  }

  const prevBtn = makeArrowBtn('<');
  prevBtn.x = W * 0.5 - 90;
  prevBtn.y = H * 0.625;
  prevBtn.alpha = 0;
  uiLayer.addChild(prevBtn);

  const nextBtn = makeArrowBtn('>');
  nextBtn.x = W * 0.5 + 90;
  nextBtn.y = H * 0.625;
  nextBtn.alpha = 0;
  uiLayer.addChild(nextBtn);

  function refreshCostume(): void {
    // Update costume display
    chickenContainer.removeChild(currentCostumeDisplay);
    currentCostumeDisplay.destroy({ children: true });
    currentCostumeDisplay = buildCostumePreview(unlockedCostumes[costumeIndex].id);
    currentCostumeDisplay.scale.set(1.6);
    chickenContainer.addChild(currentCostumeDisplay);
    // Update name label
    costumeNameText.text = unlockedCostumes[costumeIndex].name;
    // Persist selection
    costumeState.selected = unlockedCostumes[costumeIndex].id;
  }

  prevBtn.on('pointerdown', () => {
    sfxMenuClick();
    costumeIndex = (costumeIndex - 1 + unlockedCostumes.length) % unlockedCostumes.length;
    refreshCostume();
  });
  prevBtn.on('pointerover', () => prevBtn.scale.set(1.08));
  prevBtn.on('pointerout',  () => prevBtn.scale.set(1.0));

  nextBtn.on('pointerdown', () => {
    sfxMenuClick();
    costumeIndex = (costumeIndex + 1) % unlockedCostumes.length;
    refreshCostume();
  });
  nextBtn.on('pointerover', () => nextBtn.scale.set(1.08));
  nextBtn.on('pointerout',  () => nextBtn.scale.set(1.0));

  // ── Start button ──────────────────────────────────────────────────────────
  const btnW = 200, btnH = 56;
  const btn = new Container();
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  const btnBg = new Graphics();
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .fill({ color: 0xcc0000, alpha: 0.9 });
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    .stroke({ color: 0xff6644, width: 2 });
  btn.addChild(btnBg);

  const btnStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 26,
    fontWeight: 'bold',
    fill: 0xffffff,
  });
  const btnText = new Text({ text: '開始遊戲', style: btnStyle });
  btnText.anchor.set(0.5);
  btn.addChild(btnText);

  btn.x = W * 0.5;
  btn.y = H * 0.74;
  btn.alpha = 0;
  uiLayer.addChild(btn);

  // ── Achievements button ───────────────────────────────────────────────────
  const achBtnW = 180, achBtnH = 44;
  const achBtn = new Container();
  achBtn.eventMode = 'static';
  achBtn.cursor = 'pointer';

  const achBtnBg = new Graphics();
  achBtnBg.roundRect(-achBtnW / 2, -achBtnH / 2, achBtnW, achBtnH, 10)
    .fill({ color: 0x222233, alpha: 0.88 });
  achBtnBg.roundRect(-achBtnW / 2, -achBtnH / 2, achBtnW, achBtnH, 10)
    .stroke({ color: 0x8888bb, width: 1.5 });
  achBtn.addChild(achBtnBg);

  const achBtnText = new Text({
    text: '🏆  成就',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xccccee,
    }),
  });
  achBtnText.anchor.set(0.5);
  achBtn.addChild(achBtnText);

  achBtn.x = W * 0.5;
  achBtn.y = H * 0.855;
  achBtn.alpha = 0;
  uiLayer.addChild(achBtn);

  achBtn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    sfxMenuClick();
    await core.events.emit('scene/load', { key: 'achievements' });
  });
  achBtn.on('pointerover', () => achBtn.scale.set(1.04));
  achBtn.on('pointerout',  () => achBtn.scale.set(1.0));

  // ── DEV button (bottom-right corner) ─────────────────────────────────────
  const devBtnW = 46, devBtnH = 22;
  const devBtn = new Container();
  devBtn.eventMode = 'static';
  devBtn.cursor = 'pointer';
  const devBtnBg = new Graphics();
  devBtnBg.roundRect(0, 0, devBtnW, devBtnH, 5)
    .fill({ color: 0x333333, alpha: 0.85 })
    .stroke({ color: 0xff6644, width: 1 });
  devBtn.addChild(devBtnBg);
  const devBtnStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    fill: 0xffaa66,
    fontWeight: 'bold',
  });
  const devBtnText = new Text({ text: 'DEV', style: devBtnStyle });
  devBtnText.anchor.set(0.5);
  devBtnText.x = devBtnW / 2;
  devBtnText.y = devBtnH / 2;
  devBtn.addChild(devBtnText);
  devBtn.x = W - devBtnW - 10;
  devBtn.y = H - devBtnH - 10;
  uiLayer.addChild(devBtn);

  devBtn.on('pointerup', async () => {
    await core.events.emit('scene/load', { key: 'devmenu' });
  });

  // ── Costume panel button (bottom-left corner, bigger than DEV) ───────────
  const cpBtnW = 72, cpBtnH = 34;
  const cpBtn = new Container();
  cpBtn.eventMode = 'static';
  cpBtn.cursor = 'pointer';
  const cpBtnBg = new Graphics();
  cpBtnBg
    .roundRect(0, 0, cpBtnW, cpBtnH, 8)
    .fill({ color: 0x1a1a44, alpha: 0.92 })
    .stroke({ color: 0x7777cc, width: 1.5 });
  cpBtn.addChild(cpBtnBg);
  const cpBtnText = new Text({
    text: '👗 造型',
    style: new TextStyle({
      fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xaaaaff,
    }),
  });
  cpBtnText.anchor.set(0.5);
  cpBtnText.x = cpBtnW / 2;
  cpBtnText.y = cpBtnH / 2;
  cpBtn.addChild(cpBtnText);
  cpBtn.x = 10;
  cpBtn.y = H - cpBtnH - 10;
  uiLayer.addChild(cpBtn);

  // ── Inline costume overlay ────────────────────────────────────────────────
  let overlayContainer: Container | null = null;

  function closeOverlay(): void {
    if (!overlayContainer) return;
    uiLayer.removeChild(overlayContainer);
    overlayContainer.destroy({ children: true });
    overlayContainer = null;
  }

  function openCostumeOverlay(): void {
    if (overlayContainer) return;

    const overlay = new Container();
    overlayContainer = overlay;

    // Full-screen dim that blocks pointer events from reaching the title scene
    const dim = new Graphics();
    dim.rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.78 });
    dim.eventMode = 'static';
    overlay.addChild(dim);

    // Panel background
    const PANEL_X = 12, PANEL_Y = 52, PANEL_W = W - 24, PANEL_H = 730;
    const panelBg = new Graphics();
    panelBg
      .roundRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 16)
      .fill({ color: 0x080818, alpha: 0.97 });
    panelBg
      .roundRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 16)
      .stroke({ color: 0x7777cc, width: 2 });
    overlay.addChild(panelBg);

    // Title
    const ovTitleText = new Text({
      text: '選擇造型',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 26,
        fontWeight: 'bold',
        fill: 0xffd700,
        stroke: { color: 0x330000, width: 3 },
        dropShadow: { color: 0xff0000, distance: 2, alpha: 0.7, blur: 2 },
      }),
    });
    ovTitleText.anchor.set(0.5);
    ovTitleText.x = W * 0.5;
    ovTitleText.y = PANEL_Y + 38;
    overlay.addChild(ovTitleText);

    // Close button (top-right of panel)
    const xBtnSize = 34;
    const xBtn = new Container();
    xBtn.eventMode = 'static';
    xBtn.cursor = 'pointer';
    const xBtnBg = new Graphics();
    xBtnBg
      .roundRect(0, 0, xBtnSize, xBtnSize, 8)
      .fill({ color: 0x333355, alpha: 0.9 })
      .stroke({ color: 0x9999cc, width: 1 });
    xBtn.addChild(xBtnBg);
    const xBtnTxt = new Text({
      text: '✕',
      style: new TextStyle({ fontFamily: 'Arial, sans-serif', fontSize: 16, fill: 0xddddff, fontWeight: 'bold' }),
    });
    xBtnTxt.anchor.set(0.5);
    xBtnTxt.x = xBtnSize / 2;
    xBtnTxt.y = xBtnSize / 2;
    xBtn.addChild(xBtnTxt);
    xBtn.x = PANEL_X + PANEL_W - xBtnSize - 10;
    xBtn.y = PANEL_Y + 8;
    overlay.addChild(xBtn);
    xBtn.on('pointerdown', closeOverlay);
    xBtn.on('pointerover', () => xBtn.scale.set(1.08));
    xBtn.on('pointerout',  () => xBtn.scale.set(1.0));

    // Preview sprite holder
    let ovSelectedId: CostumeId = costumeState.selected;
    const ovPreviewHolder = new Container();
    ovPreviewHolder.x = W * 0.5;
    ovPreviewHolder.y = PANEL_Y + 120;
    overlay.addChild(ovPreviewHolder);

    function buildOvPreview(): void {
      const old = ovPreviewHolder.removeChildren();
      old.forEach(c => (c as Container).destroy({ children: true }));
      const spr = buildCostumePreview(ovSelectedId);
      spr.scale.set(1.8);
      ovPreviewHolder.addChild(spr);
    }
    buildOvPreview();

    // Name + description labels
    const ovNameText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    ovNameText.anchor.set(0.5);
    ovNameText.x = W * 0.5;
    ovNameText.y = PANEL_Y + 210;
    overlay.addChild(ovNameText);

    const ovDescText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 13,
        fill: 0xbbbbbb,
        align: 'center',
      }),
    });
    ovDescText.anchor.set(0.5);
    ovDescText.x = W * 0.5;
    ovDescText.y = PANEL_Y + 238;
    overlay.addChild(ovDescText);

    function refreshOvLabels(): void {
      const cfg = COSTUMES.find(c => c.id === ovSelectedId) ?? COSTUMES[0];
      ovNameText.text = cfg.name;
      ovDescText.text = cfg.description;
    }
    refreshOvLabels();

    // Costume card grid (2 cols × 4 rows)
    const OV_CARD_W = 142, OV_CARD_H = 60;
    const OV_GAP_X = 12, OV_GAP_Y = 10;
    const ovGridTotalW = 2 * OV_CARD_W + OV_GAP_X;
    const ovGridStartX = (W - ovGridTotalW) / 2 + OV_CARD_W / 2;
    const ovCardsStartY = PANEL_Y + 272;
    const ovCards: Container[] = [];

    function buildOvCard(index: number): Container {
      const cfg = COSTUMES[index];
      const unlocked = isCostumeUnlocked(cfg.id, costumeState.clearedLevels, endlessState.bestWave);
      const isSelected = cfg.id === ovSelectedId;

      const card = new Container();
      card.eventMode = 'static';
      card.cursor = unlocked ? 'pointer' : 'default';

      const borderCol = isSelected ? 0xffd700 : (unlocked ? 0x4466aa : 0x333333);
      const fillCol   = isSelected ? 0x443300 : (unlocked ? 0x112244 : 0x1a1a1a);
      const cardBg = new Graphics();
      cardBg
        .roundRect(-OV_CARD_W / 2, -OV_CARD_H / 2, OV_CARD_W, OV_CARD_H, 10)
        .fill({ color: fillCol, alpha: 0.93 });
      cardBg
        .roundRect(-OV_CARD_W / 2, -OV_CARD_H / 2, OV_CARD_W, OV_CARD_H, 10)
        .stroke({ color: borderCol, width: isSelected ? 2.5 : 1.5 });
      card.addChild(cardBg);

      const cardName = new Text({
        text: cfg.name,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 15,
          fontWeight: 'bold',
          fill: unlocked ? 0xffffff : 0x666666,
        }),
      });
      cardName.anchor.set(0.5);
      cardName.y = -10;
      card.addChild(cardName);

      const hint = new Text({
        text: unlocked ? '已解鎖' : `🔒 ${cfg.unlockHint}`,
        style: new TextStyle({
          fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
          fontSize: 11,
          fill: unlocked ? 0x88aacc : 0x555555,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: OV_CARD_W - 16,
        }),
      });
      hint.anchor.set(0.5);
      hint.y = 13;
      card.addChild(hint);

      const col = index % 2;
      const row = Math.floor(index / 2);
      card.x = ovGridStartX + col * (OV_CARD_W + OV_GAP_X);
      card.y = ovCardsStartY + row * (OV_CARD_H + OV_GAP_Y);

      if (unlocked) {
        card.on('pointerdown', () => {
          sfxMenuClick();
          ovSelectedId = cfg.id;
          costumeState.selected = ovSelectedId;
          // Sync main title-screen picker
          const newIdx = unlockedCostumes.findIndex(c => c.id === ovSelectedId);
          if (newIdx >= 0) {
            costumeIndex = newIdx;
            refreshCostume();
          }
          refreshOvLabels();
          buildOvPreview();
          rebuildOvCards();
        });
        card.on('pointerover', () => card.scale.set(1.04));
        card.on('pointerout',  () => card.scale.set(1.0));
      }
      return card;
    }

    function rebuildOvCards(): void {
      ovCards.forEach(c => { overlay.removeChild(c); c.destroy({ children: true }); });
      ovCards.length = 0;
      COSTUMES.forEach((_, i) => {
        const card = buildOvCard(i);
        overlay.addChild(card);
        ovCards.push(card);
      });
    }
    rebuildOvCards();

    // Confirm / close button at bottom of panel
    const confirmBtnW = 180, confirmBtnH = 46;
    const ovConfirmBtn = new Container();
    ovConfirmBtn.eventMode = 'static';
    ovConfirmBtn.cursor = 'pointer';
    const ovConfirmBg = new Graphics();
    ovConfirmBg
      .roundRect(-confirmBtnW / 2, -confirmBtnH / 2, confirmBtnW, confirmBtnH, 12)
      .fill({ color: 0xaa2200, alpha: 0.9 });
    ovConfirmBg
      .roundRect(-confirmBtnW / 2, -confirmBtnH / 2, confirmBtnW, confirmBtnH, 12)
      .stroke({ color: 0xff6644, width: 2 });
    ovConfirmBtn.addChild(ovConfirmBg);
    const ovConfirmTxt = new Text({
      text: '✓ 確認造型',
      style: new TextStyle({
        fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
      }),
    });
    ovConfirmTxt.anchor.set(0.5);
    ovConfirmBtn.addChild(ovConfirmTxt);
    ovConfirmBtn.x = W * 0.5;
    ovConfirmBtn.y = PANEL_Y + PANEL_H - 46;
    overlay.addChild(ovConfirmBtn);
    ovConfirmBtn.on('pointerdown', closeOverlay);
    ovConfirmBtn.on('pointerover', () => ovConfirmBtn.scale.set(1.04));
    ovConfirmBtn.on('pointerout',  () => ovConfirmBtn.scale.set(1.0));

    // Fade in overlay
    overlay.alpha = 0;
    uiLayer.addChild(overlay);
    core.events.emitSync('tween/to', {
      target: overlay as unknown as Record<string, unknown>,
      props: { alpha: 1 },
      duration: 220,
      ease: 'easeOutQuad',
    });
  }

  cpBtn.on('pointerdown', () => {
    sfxMenuClick();
    openCostumeOverlay();
  });
  cpBtn.on('pointerover', () => cpBtn.scale.set(1.06));
  cpBtn.on('pointerout',  () => cpBtn.scale.set(1.0));

  // ── Scene fade-in via TweenManager ────────────────────────────────────────
  const fadeTargets = [title, subtitle, costumeLabel, prevBtn, costumeNameText, nextBtn, btn, achBtn] as unknown as Record<string, unknown>[];
  const delays      = [0, 150, 300, 350, 350, 350, 450, 530];
  fadeTargets.forEach((t, i) => {
    core.events.emitSync('tween/to', {
      target: t,
      props: { alpha: 1 },
      duration: 500,
      ease: 'easeOutQuad',
      delay: delays[i],
    });
  });

  // ── Button pulse animation ────────────────────────────────────────────────
  core.events.emitSync('tween/to', {
    target: btn.scale as unknown as Record<string, unknown>,
    props: { x: 1.05, y: 1.05 },
    duration: 800,
    ease: 'easeInOutSine',
    loop: true,
    yoyo: true,
    delay: 700,
  });

  // ── Background music ──────────────────────────────────────────────────────
  startBgm();

  // ── Float characters (tick-driven) ────────────────────────────────────────
  const unsubTick = core.events.on('title', 'core/tick', ({ delta }: { delta: number }) => {
    const dt = delta;
    vsText.rotation += 0.002 * dt;
    chickenContainer.y = H * 0.43 + Math.sin(Date.now() / 600) * 10;
    couragePreview.y   = H * 0.43 + Math.sin(Date.now() / 600 + Math.PI) * 10;
  });

  // ── Button handlers ───────────────────────────────────────────────────────
  btn.on('pointerdown', async () => {
    if (_transitioning) return;
    _transitioning = true;
    await core.events.emit('scene/load', { key: 'modeselect' });
  });

  _cleanup = () => {
    core.events.removeNamespace('title');
    core.events.emitSync('tween/kill', { target: btn.scale as unknown as Record<string, unknown> });
    closeOverlay();
    worldLayer.removeChild(stars, chickenContainer, couragePreview, vsText);
    uiLayer.removeChild(title, subtitle, costumeLabel, costumeNameText, prevBtn, nextBtn, btn, achBtn, devBtn, cpBtn);
    stars.destroy({ children: true });
    chickenContainer.destroy({ children: true });
    couragePreview.destroy({ children: true });
    vsText.destroy();
    title.destroy();
    subtitle.destroy();
    costumeLabel.destroy();
    costumeNameText.destroy();
    prevBtn.destroy({ children: true });
    nextBtn.destroy({ children: true });
    btn.destroy({ children: true });
    achBtn.destroy({ children: true });
    devBtn.destroy({ children: true });
    cpBtn.destroy({ children: true });
    unsubTick();
  };
}

async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const TitleScene: SceneDescriptor = {
  key: 'title',
  enter,
  exit,
};
