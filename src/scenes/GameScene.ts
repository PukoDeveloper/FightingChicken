import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import type { Entity } from '@inkshot/engine';
import {
  createChickenDisplay,
  createEnemyDisplay,
  createEnemyHitFlash,
  createPlayerBullet,
  createEnemyBullet,
  createTrapBubble,
  createTrapRing,
  createStarfield,
  createHeart,
  createBossHpBar,
  createFlashOverlay,
  createHealthItem,
  createPowerItem,
} from '../game/sprites';
import {
  PLAYER_HP_MAX,
  PLAYER_HITBOX_R,
  PLAYER_BULLET_SPEED,
  PLAYER_FIRE_INTERVAL,
  PLAYER_BULLET_R,
  INVINCIBLE_MS,
  PLAYER_MOVE_SPEED,
  ENEMY_HITBOX_R,
  ENEMY_BULLET_R,
  SCORE_PER_HIT,
  SCORE_BONUS_WAVE_MULT,
  ITEM_COLLECT_R,
  ITEM_LIFETIME_MS,
  ITEM_SPAWN_MIN_MS,
  ITEM_SPAWN_MAX_MS,
  POWER_UP_DURATION_MS,
  POWER_FIRE_INTERVAL,
  HEALTH_ITEM_PROB,
  HEALTH_ITEM_INVINCIBLE_MS,
  SHOCKWAVE_MAX_RADIUS,
  SHOCKWAVE_THICKNESS,
  BUBBLE_HITBOX_R,
  TRAP_DURATION_MS,
  TRAP_SLOW_FACTOR,
  COL_BUBBLE,
} from '../constants';
import { gameResult, devConfig, endlessState } from '../game/store';
import { createLevel, TOTAL_LEVELS } from '../game/levels';
import type { WaveConfig } from '../game/levels';
import { createEndlessWaveConfig, endlessEnemyType } from '../game/endless';

// ─── Bullet data ─────────────────────────────────────────────────────────────
interface BulletData {
  display: Graphics;
  x: number;
  y: number;
  vx: number; // px/s
  vy: number; // px/s
}

// ─── Item (pickup) data ───────────────────────────────────────────────────────
interface ItemData {
  display: Container;
  x: number;
  y: number;
  vx: number; // px/s (horizontal, currently 0)
  vy: number; // px/s (vertical fall speed)
  type: 'health' | 'power';
  lifetime: number; // ms remaining
}

// ─── Shockwave data ───────────────────────────────────────────────────────────
interface ShockwaveData {
  display: Graphics;
  x: number;
  y: number;
  radius: number; // current radius in px (grows over time)
  speed: number;  // expansion speed px/s
  color: number;
}

// ─── Trap Bubble data ─────────────────────────────────────────────────────────
interface BubbleData {
  display: Graphics;
  x: number;
  y: number;
  vx: number; // px/s
  vy: number; // px/s
}

// ─── Module-level cleanup handle ────────────────────────────────────────────
let _cleanup: (() => void) | null = null;

// ─── Convert clientX/Y to canvas coordinates ─────────────────────────────────
function toCanvas(clientX: number, clientY: number, core: Core): { x: number; y: number } {
  const canvas = core.app.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * core.app.screen.width,
    y: ((clientY - rect.top) / rect.height) * core.app.screen.height,
  };
}

// ─── Scene enter ─────────────────────────────────────────────────────────────
async function enter(core: Core): Promise<void> {
  const W = core.app.screen.width;
  const H = core.app.screen.height;

  // ── Level / wave config ────────────────────────────────────────────────────
  const isEndless = endlessState.active;

  // For endless mode we compute a single-wave "level" from endlessState.wave;
  // for normal mode we load the full level and set up multi-wave progression.
  const levelConfig = isEndless
    ? null
    : createLevel(gameResult.currentLevel);

  let waveIdx = 0;
  let waveConfig: WaveConfig = isEndless
    ? createEndlessWaveConfig(endlessState.wave)
    : levelConfig!.waves[waveIdx];
  let waveMaxHp = waveConfig.enemyHp;

  const enemyTypeForDisplay = isEndless
    ? endlessEnemyType(endlessState.wave)
    : levelConfig!.enemyType;

  // ── Layers ──────────────────────────────────────────────────────────────
  const { output: worldOut } = core.events.emitSync('renderer/layer', { name: 'world' });
  const worldLayer = worldOut.layer as Container;
  const { output: uiOut } = core.events.emitSync('renderer/layer', { name: 'ui' });
  const uiLayer = uiOut.layer as Container;
  const { output: sysOut } = core.events.emitSync('renderer/layer', { name: 'system' });
  const sysLayer = sysOut.layer as Container;

  // ── Background ───────────────────────────────────────────────────────────
  const stars = createStarfield(W, H);
  worldLayer.addChild(stars);

  // ── Scrolling starfield containers (two rows for looping) ────────────────
  const scrollA = createStarfield(W, H);
  const scrollB = createStarfield(W, H);
  scrollB.y = -H;
  worldLayer.addChild(scrollA, scrollB);
  let scrollY = 0;

  // ── Bullet containers ────────────────────────────────────────────────────
  const playerBulletsContainer = new Container();
  const enemyBulletsContainer = new Container();
  const itemsContainer = new Container();
  const shockwavesContainer = new Container();
  const bubblesContainer = new Container();
  worldLayer.addChild(shockwavesContainer, enemyBulletsContainer, bubblesContainer, itemsContainer, playerBulletsContainer);

  // ── Player entity ────────────────────────────────────────────────────────
  const chickenDisplay = createChickenDisplay();
  const { output: playerOut } = await core.events.emit('entity/create', {
    id: 'player',
    tags: ['player'],
    position: { x: W * 0.5, y: H * 0.82 },
    display: chickenDisplay,
  });
  const playerEntity = playerOut.entity as Entity;

  // ── Enemy entity ─────────────────────────────────────────────────────────
  const enemyDisplay = createEnemyDisplay(enemyTypeForDisplay);
  const enemyHitFlashRadius = enemyTypeForDisplay === 'chaos' ? 48
    : enemyTypeForDisplay === 'phantom' ? 42 : 44;
  const enemyHitFlash = createEnemyHitFlash(enemyHitFlashRadius);
  enemyDisplay.addChild(enemyHitFlash);

  const { output: enemyOut } = await core.events.emit('entity/create', {
    id: 'enemy',
    tags: ['enemy'],
    position: { x: W * 0.5, y: H * 0.18 },
    display: enemyDisplay,
  });
  const enemyEntity = enemyOut.entity as Entity;

  // ── Bullet arrays ────────────────────────────────────────────────────────
  const playerBullets: BulletData[] = [];
  const enemyBullets: BulletData[] = [];
  const shockwaves: ShockwaveData[] = [];
  const bubbles: BubbleData[] = [];

  // ── Item (pickup) state ───────────────────────────────────────────────────
  const items: ItemData[] = [];
  let itemSpawnTimer = 5000; // first item spawns after 5 s
  let powerUpTimer = 0;      // ms remaining on current damage power-up

  // ── Endless-mode buff state ───────────────────────────────────────────────
  // Derive effective player stats from accumulated buffs.
  const buffHpUpCount      = isEndless ? endlessState.buffs.filter(b => b === 'hp_up').length : 0;
  const buffFireRateCount  = isEndless ? endlessState.buffs.filter(b => b === 'fire_rate_up').length : 0;
  const buffTripleCount    = isEndless ? endlessState.buffs.filter(b => b === 'triple_shot').length : 0;
  const buffBloodPriceCount = isEndless ? endlessState.buffs.filter(b => b === 'blood_price').length : 0;
  const buffBulletPowerCount = isEndless ? endlessState.buffs.filter(b => b === 'bullet_power').length : 0;
  const buffEvasionCount   = isEndless ? endlessState.buffs.filter(b => b === 'evasion').length : 0;
  const buffRegenCount     = isEndless ? endlessState.buffs.filter(b => b === 'regen').length : 0;
  const buffLongInvCount   = isEndless ? endlessState.buffs.filter(b => b === 'long_invincible').length : 0;
  const buffItemDropCount  = isEndless ? endlessState.buffs.filter(b => b === 'item_drop_up').length : 0;
  const hasBerserker       = isEndless && endlessState.buffs.includes('berserker');
  const hasPeriodicShield  = isEndless && endlessState.buffs.includes('periodic_shield');

  // Effective max HP: base + hp_up stacks − blood_price stacks (min 1, max 10)
  const effectiveHpMax = Math.min(Math.max(PLAYER_HP_MAX + buffHpUpCount - buffBloodPriceCount, 1), 10);
  // Effective base fire interval (reduced by 10% per fire_rate_up stack, floored at 60 ms)
  const effectiveFireInterval = Math.max(
    Math.round(PLAYER_FIRE_INTERVAL * Math.pow(0.90, buffFireRateCount)),
    60,
  );
  // Bullet damage per hit (1 base + blood_price bonus + bullet_power bonus)
  const bulletDamage = 1 + buffBloodPriceCount * 2 + buffBulletPowerCount;
  // Evasion chance: 25% per stack, capped at 75%
  const evasionChance = Math.min(buffEvasionCount * 0.25, 0.75);
  // Effective invincibility duration: base + 600 ms per long_invincible stack
  const effectiveInvincibleMs = INVINCIBLE_MS + buffLongInvCount * 600;
  // Effective item spawn interval: reduced 25% per stack (capped at 75% reduction, floor 2 s / 4 s)
  const itemSpawnMinMs = buffItemDropCount > 0
    ? Math.max(Math.round(ITEM_SPAWN_MIN_MS * Math.pow(0.75, buffItemDropCount)), 2000)
    : ITEM_SPAWN_MIN_MS;
  const itemSpawnMaxMs = buffItemDropCount > 0
    ? Math.max(Math.round(ITEM_SPAWN_MAX_MS * Math.pow(0.75, buffItemDropCount)), 4000)
    : ITEM_SPAWN_MAX_MS;
  // Regen: 12 s base interval per first stack, each additional stack subtracts 3 s more (min 6 s)
  const regenIntervalMs = buffRegenCount > 0
    ? Math.max(15000 - buffRegenCount * 3000, 6000)
    : 0;

  // Periodic shield: counts down ms until next activation.
  // Carry over the remaining time from the previous wave (or start fresh at 12 s).
  let periodicShieldTimer: number;
  if (!hasPeriodicShield) {
    periodicShieldTimer = 0;
  } else if (isEndless && endlessState.periodicShieldTimer > 0) {
    periodicShieldTimer = endlessState.periodicShieldTimer;
  } else {
    periodicShieldTimer = 12000;
  }

  // ── Game state ───────────────────────────────────────────────────────────
  // In endless mode, carry HP from the previous wave; on wave 1 start at full HP.
  // Then apply the most recently chosen buff (last in the buffs array) if it's hp_restore.
  const latestBuff = isEndless && endlessState.buffs.length > 0
    ? endlessState.buffs[endlessState.buffs.length - 1]
    : null;
  let playerHP: number;
  if (!isEndless) {
    playerHP = PLAYER_HP_MAX;
  } else if (endlessState.currentHp <= 0) {
    // First wave — start at full effective max
    playerHP = effectiveHpMax;
  } else {
    // Carry over HP from last wave, clamped to new max (hp_up may have raised it)
    playerHP = Math.min(endlessState.currentHp, effectiveHpMax);
    // hp_restore: heal ceil(effectiveHpMax / 2) when this buff was just chosen
    if (latestBuff === 'hp_restore') {
      playerHP = Math.min(effectiveHpMax, playerHP + Math.ceil(effectiveHpMax / 2));
    }
    // hp_up: the max increased by 1 — grant that extra HP on pickup
    if (latestBuff === 'hp_up') {
      playerHP = Math.min(effectiveHpMax, playerHP + 1);
    }
  }
  let enemyHP = waveMaxHp;
  // In endless mode, score is cumulative across waves; carry it over from the previous wave.
  let score = isEndless ? endlessState.score : 0;
  let phase: 1 | 2 | 3 = 1;
  let invincibleMs = 0;
  let gameEnded = false;
  let waveTransitioning = false;
  let trappedMs = 0; // ms remaining on player trap (bubble hit)
  let trapAnimMs = 0; // accumulated ms for trap ring pulse animation

  // Timers (ms counters ticked down each update)
  let playerFireTimer = 0;
  let spiralTimer = 0;
  let aimTimer = 0;
  let spreadTimer = 0;
  let ringTimer = 0;
  let shockwaveTimer = 0;
  let bubbleTimer = 0;
  let spiralAngle = 0;
  let enemyBobTimer = 0;
  let hitFlashTimer = 0;
  let phaseFlashTimer = 0;
  // Regen: counts down to next HP regen tick.
  // Carry over the remaining time from the previous wave (or start fresh at the full interval).
  let regenTimer: number;
  if (regenIntervalMs <= 0) {
    regenTimer = 0;
  } else if (isEndless && endlessState.regenTimer > 0) {
    regenTimer = endlessState.regenTimer;
  } else {
    regenTimer = regenIntervalMs;
  }

  // Touch tracking
  let touchActive = false;
  let touchTargetX = playerEntity.position.x;
  let touchTargetY = playerEntity.position.y;

  // ── HUD ──────────────────────────────────────────────────────────────────
  // HP hearts
  const heartsContainer = new Container();
  const hearts: Graphics[] = [];
  for (let i = 0; i < effectiveHpMax; i++) {
    const h = createHeart(true);
    h.scale.set(1.1);
    h.x = 18 + i * 26;
    h.y = 0;
    heartsContainer.addChild(h);
    hearts.push(h);
  }
  heartsContainer.y = H - 30;
  uiLayer.addChild(heartsContainer);

  // Boss HP bar
  const BAR_W = W * 0.72;
  const { container: hpBarContainer, fill: hpBarFill } = createBossHpBar(BAR_W);
  hpBarContainer.x = (W - BAR_W) / 2;
  hpBarContainer.y = 8;
  uiLayer.addChild(hpBarContainer);

  const bossLabelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 13,
    fill: 0xffcccc,
    fontWeight: 'bold',
  });
  const bossLabel = new Text({ text: '勇氣  HP', style: bossLabelStyle });
  bossLabel.anchor.set(0.5);
  bossLabel.x = W * 0.5;
  bossLabel.y = 35;
  uiLayer.addChild(bossLabel);

  // Score text
  const scoreStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 18,
    fill: 0xffffff,
    fontWeight: 'bold',
  });
  const scoreText = new Text({ text: 'SCORE: 0', style: scoreStyle });
  scoreText.anchor.set(1, 0);
  scoreText.x = W - 10;
  scoreText.y = 10;
  uiLayer.addChild(scoreText);

  // Phase text
  const phaseStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xff8888,
  });
  const phaseText = new Text({ text: 'PHASE 1', style: phaseStyle });
  phaseText.anchor.set(0.5);
  phaseText.x = W * 0.5;
  phaseText.y = 48;
  uiLayer.addChild(phaseText);

  // Level & wave info text (bottom-right)
  const levelWaveStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xaaddff,
    fontWeight: 'bold',
  });
  const levelWaveText = new Text({
    text: isEndless
      ? `∞ 無盡  第 ${endlessState.wave} 波`
      : `LVL ${levelConfig!.levelNumber}  WAVE 1/${levelConfig!.waves.length}`,
    style: levelWaveStyle,
  });
  levelWaveText.anchor.set(1, 1);
  levelWaveText.x = W - 10;
  levelWaveText.y = H - 10;
  uiLayer.addChild(levelWaveText);

  // Wave-clear banner (hidden by default, shown between waves)
  const waveBannerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 38,
    fontWeight: 'bold',
    fill: 0xffee44,
    stroke: { color: 0x553300, width: 5 },
    dropShadow: { color: 0xff8800, distance: 4, alpha: 0.9, blur: 3 },
  });
  const waveBannerText = new Text({ text: '', style: waveBannerStyle });
  waveBannerText.anchor.set(0.5);
  waveBannerText.x = W * 0.5;
  waveBannerText.y = H * 0.5;
  waveBannerText.alpha = 0;
  uiLayer.addChild(waveBannerText);

  // Flash overlay (for phase transitions & hits)
  const flashOverlay = createFlashOverlay(W, H);
  sysLayer.addChild(flashOverlay);

  // Trap ring (shown around player while trapped by a bubble)
  const trapRing = createTrapRing();
  worldLayer.addChild(trapRing);

  // Timer indicators (bottom-left, stacked vertically above hearts).
  // Each timer type gets its own Text object so multiple can show simultaneously.
  const powerUpStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xffee44,
    fontWeight: 'bold',
    dropShadow: { color: 0xff8800, distance: 2, alpha: 0.8, blur: 2 },
  });
  const trappedTimerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0x44ddff,
    fontWeight: 'bold',
    dropShadow: { color: 0x006688, distance: 2, alpha: 0.8, blur: 2 },
  });
  const shieldTimerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xaaddff,
    fontWeight: 'bold',
    dropShadow: { color: 0x224466, distance: 2, alpha: 0.8, blur: 2 },
  });
  const regenTimerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0x44ff88,
    fontWeight: 'bold',
    dropShadow: { color: 0x006633, distance: 2, alpha: 0.8, blur: 2 },
  });
  const powerUpText       = new Text({ text: '', style: powerUpStyle });
  const trappedTimerText  = new Text({ text: '', style: trappedTimerStyle });
  const shieldTimerText   = new Text({ text: '', style: shieldTimerStyle });
  const regenTimerText    = new Text({ text: '', style: regenTimerStyle });
  [powerUpText, trappedTimerText, shieldTimerText, regenTimerText].forEach(t => {
    t.anchor.set(0, 1);
    t.x = 10;
    t.y = H - 38;
    t.visible = false;
    uiLayer.addChild(t);
  });

  function spawnEnemyBullet(
    x: number, y: number,
    vx: number, vy: number,
    color: number
  ): void {
    const display = createEnemyBullet(color);
    display.x = x;
    display.y = y;
    enemyBulletsContainer.addChild(display);
    enemyBullets.push({ display, x, y, vx, vy });
  }

  // ── Helper: spawn player bullet ───────────────────────────────────────────
  function spawnPlayerBullet(x: number, y: number): void {
    const display = createPlayerBullet();
    display.x = x;
    display.y = y;
    playerBulletsContainer.addChild(display);
    playerBullets.push({ display, x, y, vx: 0, vy: -PLAYER_BULLET_SPEED });
  }

  // ── Helper: remove bullet ─────────────────────────────────────────────────
  function removeBullet(arr: BulletData[], idx: number, container: Container): void {
    const b = arr[idx];
    container.removeChild(b.display);
    b.display.destroy();
    arr.splice(idx, 1);
  }

  // ── Helper: spawn a random pickup item ────────────────────────────────────
  function spawnItem(): void {
    const type: 'health' | 'power' = Math.random() < HEALTH_ITEM_PROB ? 'health' : 'power';
    const display = type === 'health' ? createHealthItem() : createPowerItem();
    const x = 40 + Math.random() * (W - 80);
    const y = -20;
    display.x = x;
    display.y = y;
    itemsContainer.addChild(display);
    items.push({
      display, x, y,
      vx: 0,
      vy: devConfig.itemFallSpeed,
      type,
      lifetime: ITEM_LIFETIME_MS,
    });
  }

  // ── Helper: remove pickup item ────────────────────────────────────────────
  function removeItem(arr: ItemData[], idx: number, container: Container): void {
    const item = arr[idx];
    container.removeChild(item.display);
    item.display.destroy();
    arr.splice(idx, 1);
  }

  // ── Helper: update HUD ────────────────────────────────────────────────────
  function updateHUD(): void {
    // Hearts
    for (let i = 0; i < effectiveHpMax; i++) {
      const filled = i < playerHP;
      hearts[i].clear();
      const col = filled ? 0xff2244 : 0x444444;
      hearts[i].circle(-5, -4, 6).fill(col);
      hearts[i].circle(5, -4, 6).fill(col);
      hearts[i].moveTo(-11, -2).lineTo(0, 12).lineTo(11, -2).closePath().fill(col);
    }

    // Boss HP bar
    const frac = Math.max(0, enemyHP / waveMaxHp);
    hpBarFill.clear();
    if (frac > 0) {
      const barColor = frac > waveConfig.phase2Frac ? 0xff2222
        : frac > waveConfig.phase3Frac ? 0xff8800 : 0xaa00ff;
      hpBarFill.rect(0, 0, BAR_W * frac, 18).fill(barColor);
    }

    // Score / phase / wave
    scoreText.text = `SCORE: ${score}`;
    phaseText.text = `PHASE ${phase}`;

    // Build bottom-right status line
    let statusLine = isEndless
      ? `∞ 無盡  第 ${endlessState.wave} 波`
      : `LVL ${levelConfig!.levelNumber}  WAVE ${waveIdx + 1}/${levelConfig!.waves.length}`;
    if (bulletDamage > 1) statusLine += `  ATK:${bulletDamage}`;
    if (evasionChance > 0) statusLine += `  EVA:${Math.round(evasionChance * 100)}%`;
    if (buffLongInvCount > 0) statusLine += `  INV:${(effectiveInvincibleMs / 1000).toFixed(1)}s`;
    if (buffItemDropCount > 0) statusLine += `  ITEM:${Math.round(itemSpawnMinMs / 1000)}s`;
    levelWaveText.text = statusLine;

    // Timer indicators: collect active timers, then stack them above the hearts.
    const timerEntries: Array<[Text, string]> = [];
    if (powerUpTimer > 0) timerEntries.push([powerUpText, `⚡ 火力提升 ${Math.ceil(powerUpTimer / 1000)}s`]);
    if (trappedMs > 0) timerEntries.push([trappedTimerText, `🫧 行動遲緩 ${Math.ceil(trappedMs / 1000)}s`]);
    if (hasPeriodicShield && periodicShieldTimer > 0) timerEntries.push([shieldTimerText, `🛡 護盾 ${Math.ceil(periodicShieldTimer / 1000)}s`]);
    if (regenIntervalMs > 0 && regenTimer > 0) timerEntries.push([regenTimerText, `💚 再生 ${Math.ceil(regenTimer / 1000)}s`]);

    const timerBaseY = H - 38;
    const timerLineH = 18;
    [powerUpText, trappedTimerText, shieldTimerText, regenTimerText].forEach(t => {
      t.text = '';
      t.visible = false;
    });
    timerEntries.forEach(([text, label], i) => {
      text.text = label;
      text.y = timerBaseY - (timerEntries.length - 1 - i) * timerLineH;
      text.visible = true;
    });
  }

  // ── Helper: check phase ───────────────────────────────────────────────────
  function checkPhase(): void {
    const frac = enemyHP / waveMaxHp;
    const newPhase: 1 | 2 | 3 = frac > waveConfig.phase2Frac ? 1 : frac > waveConfig.phase3Frac ? 2 : 3;
    if (newPhase !== phase) {
      phase = newPhase;
      // Trigger phase flash
      phaseFlashTimer = 600;
      // Clear bullets for brief pause
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(enemyBullets[i].display);
        enemyBullets[i].display.destroy();
      }
      enemyBullets.length = 0;
    }
  }

  // ── Bullet patterns ────────────────────────────────────────────────────────

  /** Spiral: fires nWay bullets spread evenly around spiralAngle */
  function fireSpiral(nWay: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    for (let i = 0; i < nWay; i++) {
      const a = ((spiralAngle + (i * 360) / nWay) * Math.PI) / 180;
      spawnEnemyBullet(ex, ey, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
    spiralAngle = (spiralAngle + 13) % 360;
  }

  /** Aimed: fires nWay bullets toward player with spread */
  function fireAimed(nWay: number, spreadRad: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    const px = playerEntity.position.x;
    const py = playerEntity.position.y;
    const baseAngle = Math.atan2(py - ey, px - ex);
    const half = (nWay - 1) / 2;
    for (let i = 0; i < nWay; i++) {
      const a = baseAngle + (i - half) * spreadRad;
      spawnEnemyBullet(ex, ey, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  }

  /** Ring: fires n bullets in a full circle */
  function fireRing(n: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      spawnEnemyBullet(ex, ey, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  }

  /** Shockwave: spawns an expanding ring centred on the enemy's current position. */
  function fireShockwave(speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    const display = new Graphics();
    display.x = ex;
    display.y = ey;
    shockwavesContainer.addChild(display);
    shockwaves.push({ display, x: ex, y: ey, radius: 0, speed, color });

    // Initial small burst particles to signal the shockwave
    core.events.emitSync('particle/emit', {
      config: {
        x: ex, y: ey, burst: true, burstCount: 12, speed: 60, speedVariance: 30,
        spread: 180, lifetime: 400, startAlpha: 0.9, endAlpha: 0,
        startScale: 1, endScale: 0, startColor: color, endColor: 0xffffff, radius: 4,
      },
    });
  }

  /** Bubble: fires count bubbles aimed roughly toward the player. Traps on contact. */
  function fireBubble(count: number, speed: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    const px = playerEntity.position.x;
    const py = playerEntity.position.y;
    const baseAngle = Math.atan2(py - ey, px - ex);
    const spreadPerBullet = count > 1 ? 0.28 : 0;
    const half = (count - 1) / 2;
    for (let i = 0; i < count; i++) {
      const a = baseAngle + (i - half) * spreadPerBullet;
      const display = createTrapBubble(color);
      display.x = ex;
      display.y = ey;
      bubblesContainer.addChild(display);
      bubbles.push({ display, x: ex, y: ey, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed });
    }
  }

  // ── Touch input ────────────────────────────────────────────────────────────
  const unsubTouchStart = core.events.on(
    'game',
    'input/touch:start',
    ({ x, y }: { x: number; y: number }) => {
      const pos = toCanvas(x, y, core);
      touchActive = true;
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubTouchMove = core.events.on(
    'game',
    'input/touch:move',
    ({ x, y }: { x: number; y: number }) => {
      if (!touchActive) return;
      const pos = toCanvas(x, y, core);
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubTouchEnd = core.events.on('game', 'input/touch:end', () => {
    touchActive = false;
  });

  // Pointer (mouse) support for desktop testing
  const unsubPointerDown = core.events.on(
    'game',
    'input/pointer:down',
    ({ x, y }: { x: number; y: number }) => {
      const pos = toCanvas(x, y, core);
      touchActive = true;
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubPointerMove = core.events.on(
    'game',
    'input/pointer:move',
    ({ x, y }: { x: number; y: number }) => {
      if (!touchActive) return;
      const pos = toCanvas(x, y, core);
      touchTargetX = pos.x;
      touchTargetY = pos.y;
    }
  );

  const unsubPointerUp = core.events.on('game', 'input/pointer:up', () => {
    touchActive = false;
  });

  // ── Main game update ────────────────────────────────────────────────────────
  const unsubUpdate = core.events.on(
    'game',
    'core/update',
    ({ dt }: { dt: number }) => {
      if (gameEnded) return;

      // ── Scroll starfield ──────────────────────────────────────────────────
      scrollY += 40 * (dt / 1000);
      if (scrollY >= H) scrollY -= H;
      scrollA.y = scrollY;
      scrollB.y = scrollY - H;

      // ── Player movement toward touch target ───────────────────────────────
      if (touchActive) {
        const targetX = Math.max(20, Math.min(W - 20, touchTargetX));
        const targetY = Math.max(60, Math.min(H - 40, touchTargetY - 80));
        const dx = targetX - playerEntity.position.x;
        const dy = targetY - playerEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speedMult = trappedMs > 0 ? TRAP_SLOW_FACTOR : 1;
        const maxMove = devConfig.playerMoveSpeed * speedMult * (dt / 1000);
        if (dist < maxMove) {
          playerEntity.position.x = targetX;
          playerEntity.position.y = targetY;
        } else {
          playerEntity.position.x += (dx / dist) * maxMove;
          playerEntity.position.y += (dy / dist) * maxMove;
        }
      }

      // ── Trap countdown & visual ring ──────────────────────────────────────
      if (trappedMs > 0) {
        trappedMs = Math.max(0, trappedMs - dt);
        trapAnimMs += dt;
        trapRing.visible = true;
        trapRing.x = playerEntity.position.x;
        trapRing.y = playerEntity.position.y;
        const pulse = 1 + 0.08 * Math.sin(trapAnimMs / 180);
        trapRing.clear();
        trapRing.circle(0, 0, 26 * pulse).fill({ color: COL_BUBBLE, alpha: 0.12 });
        trapRing.circle(0, 0, 26 * pulse).stroke({ color: COL_BUBBLE, width: 3, alpha: 0.70 });
        if (trappedMs <= 0) { trapRing.visible = false; trapAnimMs = 0; }
      }

      // ── Enemy bobbing animation ───────────────────────────────────────────
      enemyBobTimer += dt;
      enemyEntity.position.y = H * 0.18 + Math.sin(enemyBobTimer / 800) * 12;

      // ── Phase flash ───────────────────────────────────────────────────────
      if (phaseFlashTimer > 0) {
        phaseFlashTimer -= dt;
        flashOverlay.alpha = Math.max(0, phaseFlashTimer / 600) * 0.5;
        const flashCol = phase === 2 ? 0xff8800 : 0xcc00ff;
        flashOverlay.clear().rect(0, 0, W, H).fill({ color: flashCol, alpha: 1 });
        if (phaseFlashTimer <= 0) flashOverlay.alpha = 0;
      }

      // ── Invincibility & blink ─────────────────────────────────────────────
      if (invincibleMs > 0) {
        invincibleMs -= dt;
        playerEntity.display.alpha = Math.floor(invincibleMs / 120) % 2 === 0 ? 0.35 : 1;
        if (invincibleMs <= 0) playerEntity.display.alpha = 1;
      }

      // ── Hit flash on enemy ────────────────────────────────────────────────
      if (hitFlashTimer > 0) {
        hitFlashTimer -= dt;
        enemyHitFlash.visible = true;
        enemyHitFlash.alpha = hitFlashTimer / 80;
        if (hitFlashTimer <= 0) {
          enemyHitFlash.visible = false;
          hitFlashTimer = 0;
        }
      }

      // ── Periodic shield (endless buff) ───────────────────────────────────
      if (hasPeriodicShield) {
        periodicShieldTimer -= dt;
        if (periodicShieldTimer <= 0) {
          // Activate 2 s invincibility and reset timer
          invincibleMs = Math.max(invincibleMs, 2000);
          periodicShieldTimer = 12000;
          flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xaaddff, alpha: 1 });
          flashOverlay.alpha = 0.25;
          phaseFlashTimer = Math.max(phaseFlashTimer, 300);
        }
      }

      // ── Regen (endless buff) ─────────────────────────────────────────────
      if (regenIntervalMs > 0) {
        regenTimer -= dt;
        if (regenTimer <= 0) {
          regenTimer = regenIntervalMs;
          if (playerHP < effectiveHpMax) {
            playerHP = Math.min(effectiveHpMax, playerHP + 1);
            updateHUD();
            core.events.emitSync('particle/emit', {
              config: {
                x: playerEntity.position.x, y: playerEntity.position.y,
                burst: true, burstCount: 10, speed: 70, speedVariance: 30,
                spread: 180, lifetime: 400, startAlpha: 0.9, endAlpha: 0,
                startScale: 1.0, endScale: 0,
                startColor: 0x44ff88, endColor: 0x00cc44, radius: 4,
              },
            });
          }
        }
      }

      // ── Player auto-fire ──────────────────────────────────────────────────
      playerFireTimer -= dt;
      if (playerFireTimer <= 0) {
        // Berserker: halve fire interval when HP ≤ 2
        const berserkerActive = hasBerserker && playerHP <= 2;
        const baseInterval = berserkerActive
          ? Math.max(effectiveFireInterval / 2, 60)
          : effectiveFireInterval;
        const fireInterval = powerUpTimer > 0 ? POWER_FIRE_INTERVAL : baseInterval;
        playerFireTimer = fireInterval;
        spawnPlayerBullet(playerEntity.position.x - 6, playerEntity.position.y - 18);
        spawnPlayerBullet(playerEntity.position.x + 6, playerEntity.position.y - 18);
        // Centre bullet(s) from power-up or triple_shot buffs
        const centreBullets = (powerUpTimer > 0 ? 1 : 0) + buffTripleCount;
        for (let k = 0; k < centreBullets; k++) {
          const offset = (k - (centreBullets - 1) / 2) * 8;
          spawnPlayerBullet(playerEntity.position.x + offset, playerEntity.position.y - 22);
        }
      }

      // ── Enemy bullet patterns (driven by wave config) ─────────────────────
      if (phaseFlashTimer <= 0 && !waveTransitioning) {
        const p = waveConfig.phases[phase - 1];

        if (p.spiralInterval > 0) {
          spiralTimer -= dt;
          if (spiralTimer <= 0) {
            spiralTimer = p.spiralInterval;
            fireSpiral(p.spiralWays, p.spiralSpeed, p.spiralColor);
          }
        }

        if (p.aimInterval > 0) {
          aimTimer -= dt;
          if (aimTimer <= 0) {
            aimTimer = p.aimInterval;
            fireAimed(p.aimWays, p.aimSpread, p.aimSpeed, p.aimColor);
          }
        }

        if (p.spreadInterval > 0) {
          spreadTimer -= dt;
          if (spreadTimer <= 0) {
            spreadTimer = p.spreadInterval;
            fireAimed(p.spreadWays, p.spreadAngle, p.spreadSpeed, p.spreadColor);
          }
        }

        if (p.ringInterval > 0) {
          ringTimer -= dt;
          if (ringTimer <= 0) {
            ringTimer = p.ringInterval;
            fireRing(p.ringCount, p.ringSpeed, p.ringColor);
          }
        }

        if (p.shockwaveInterval > 0) {
          shockwaveTimer -= dt;
          if (shockwaveTimer <= 0) {
            shockwaveTimer = p.shockwaveInterval;
            fireShockwave(p.shockwaveSpeed, p.shockwaveColor);
          }
        }

        if (p.bubbleInterval > 0) {
          bubbleTimer -= dt;
          if (bubbleTimer <= 0) {
            bubbleTimer = p.bubbleInterval;
            fireBubble(p.bubbleCount, p.bubbleSpeed, p.bubbleColor);
          }
        }
      }

      // ── Move player bullets ───────────────────────────────────────────────
      for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        b.y += b.vy * (dt / 1000);
        b.display.y = b.y;

        // Off-screen
        if (b.y < -20) {
          removeBullet(playerBullets, i, playerBulletsContainer);
          continue;
        }

        // Skip hitting enemy during wave transition
        if (waveTransitioning) continue;

        // Hit enemy
        const dx = b.x - enemyEntity.position.x;
        const dy = b.y - enemyEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ENEMY_HITBOX_R + PLAYER_BULLET_R) {
          removeBullet(playerBullets, i, playerBulletsContainer);
          enemyHP = Math.max(0, enemyHP - bulletDamage);
          score += SCORE_PER_HIT * bulletDamage;
          hitFlashTimer = 80;

          // Emit explosion particles
          core.events.emitSync('particle/emit', {
            config: {
              x: enemyEntity.position.x + (Math.random() - 0.5) * 30,
              y: enemyEntity.position.y + (Math.random() - 0.5) * 30,
              burst: true,
              burstCount: 8,
              speed: 90,
              speedVariance: 40,
              spread: 180,
              angle: 0,
              lifetime: 350,
              startAlpha: 1,
              endAlpha: 0,
              startScale: 1,
              endScale: 0,
              startColor: 0xff6600,
              endColor: 0xff0000,
              radius: 4,
            },
          });

          checkPhase();

          if (enemyHP <= 0) {
            score += waveMaxHp * SCORE_BONUS_WAVE_MULT;
            if (isEndless) {
              advanceEndlessWave();
            } else {
              const nextWaveIdx = waveIdx + 1;
              if (nextWaveIdx < levelConfig!.waves.length) {
                advanceWave(nextWaveIdx);
              } else {
                endGame(true);
              }
            }
            return;
          }
        }
      }

      // ── Move enemy bullets ────────────────────────────────────────────────
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx * (dt / 1000);
        b.y += b.vy * (dt / 1000);
        b.display.x = b.x;
        b.display.y = b.y;

        // Off-screen
        if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
          removeBullet(enemyBullets, i, enemyBulletsContainer);
          continue;
        }

        // Skip collision if invincible
        if (invincibleMs > 0) continue;

        // Hit player
        const dx = b.x - playerEntity.position.x;
        const dy = b.y - playerEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ENEMY_BULLET_R + PLAYER_HITBOX_R) {
          removeBullet(enemyBullets, i, enemyBulletsContainer);

          // Evasion roll: skip damage but still remove the bullet
          if (evasionChance > 0 && Math.random() < evasionChance) {
            // Show a brief "dodge" flash in green
            core.events.emitSync('particle/emit', {
              config: {
                x: playerEntity.position.x, y: playerEntity.position.y,
                burst: true, burstCount: 6, speed: 80, speedVariance: 30,
                spread: 180, lifetime: 300, startAlpha: 0.9, endAlpha: 0,
                startScale: 0.9, endScale: 0,
                startColor: 0x00ffaa, endColor: 0x00cc88, radius: 4,
              },
            });
            continue;
          }

          playerHP = Math.max(0, playerHP - 1);
          invincibleMs = effectiveInvincibleMs;

          // Screen flash red on hit
          flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xff0000, alpha: 1 });
          flashOverlay.alpha = 0.4;
          // Fade it out over time via the flash timer
          phaseFlashTimer = Math.max(phaseFlashTimer, 300);

          // Hit particles around player
          core.events.emitSync('particle/emit', {
            config: {
              x: playerEntity.position.x,
              y: playerEntity.position.y,
              burst: true,
              burstCount: 12,
              speed: 120,
              speedVariance: 60,
              spread: 180,
              lifetime: 500,
              startAlpha: 1,
              endAlpha: 0,
              startScale: 1.2,
              endScale: 0,
              startColor: 0xffff00,
              endColor: 0xff8800,
              radius: 5,
            },
          });

          if (playerHP <= 0) {
            endGame(false);
            return;
          }
        }
      }

      // ── Item spawn timer ──────────────────────────────────────────────────
      if (!waveTransitioning) {
        itemSpawnTimer -= dt;
        if (itemSpawnTimer <= 0) {
          itemSpawnTimer = itemSpawnMinMs + Math.random() * (itemSpawnMaxMs - itemSpawnMinMs);
          spawnItem();
        }
      }

      // ── Expand shockwave rings ────────────────────────────────────────────
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed * (dt / 1000);

        // Redraw ring at updated radius
        const opacity = Math.max(0, 1 - sw.radius / SHOCKWAVE_MAX_RADIUS) * 0.85;
        sw.display.clear();
        if (sw.radius > 0) {
          sw.display.circle(0, 0, sw.radius).stroke({ color: sw.color, width: SHOCKWAVE_THICKNESS, alpha: opacity });
        }

        // Despawn when fully expanded
        if (sw.radius >= SHOCKWAVE_MAX_RADIUS) {
          shockwavesContainer.removeChild(sw.display);
          sw.display.destroy();
          shockwaves.splice(i, 1);
          continue;
        }

        // Collision: player inside the ring boundary
        if (invincibleMs <= 0) {
          const sdx = playerEntity.position.x - sw.x;
          const sdy = playerEntity.position.y - sw.y;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          const halfThick = SHOCKWAVE_THICKNESS / 2;
          if (Math.abs(sdist - sw.radius) < halfThick + PLAYER_HITBOX_R) {
            shockwavesContainer.removeChild(sw.display);
            sw.display.destroy();
            shockwaves.splice(i, 1);

            // Evasion roll for shockwave
            if (evasionChance > 0 && Math.random() < evasionChance) {
              core.events.emitSync('particle/emit', {
                config: {
                  x: playerEntity.position.x, y: playerEntity.position.y,
                  burst: true, burstCount: 6, speed: 80, speedVariance: 30,
                  spread: 180, lifetime: 300, startAlpha: 0.9, endAlpha: 0,
                  startScale: 0.9, endScale: 0,
                  startColor: 0x00ffaa, endColor: 0x00cc88, radius: 4,
                },
              });
              continue;
            }

            playerHP = Math.max(0, playerHP - 1);
            invincibleMs = effectiveInvincibleMs;

            flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xffee00, alpha: 1 });
            flashOverlay.alpha = 0.45;
            phaseFlashTimer = Math.max(phaseFlashTimer, 300);

            core.events.emitSync('particle/emit', {
              config: {
                x: playerEntity.position.x, y: playerEntity.position.y,
                burst: true, burstCount: 14, speed: 140, speedVariance: 70,
                spread: 180, lifetime: 500, startAlpha: 1, endAlpha: 0,
                startScale: 1.2, endScale: 0,
                startColor: 0xffee00, endColor: 0xff8800, radius: 5,
              },
            });

            if (playerHP <= 0) { endGame(false); return; }
          }
        }
      }

      // ── Move trap bubbles ─────────────────────────────────────────────────
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bub = bubbles[i];
        bub.x += bub.vx * (dt / 1000);
        bub.y += bub.vy * (dt / 1000);
        bub.display.x = bub.x;
        bub.display.y = bub.y;

        // Off-screen
        if (bub.x < -30 || bub.x > W + 30 || bub.y < -30 || bub.y > H + 30) {
          bubblesContainer.removeChild(bub.display);
          bub.display.destroy();
          bubbles.splice(i, 1);
          continue;
        }

        // Trap player on contact (no HP damage)
        if (invincibleMs <= 0) {
          const bdx = bub.x - playerEntity.position.x;
          const bdy = bub.y - playerEntity.position.y;
          if (Math.sqrt(bdx * bdx + bdy * bdy) < BUBBLE_HITBOX_R + PLAYER_HITBOX_R) {
            bubblesContainer.removeChild(bub.display);
            bub.display.destroy();
            bubbles.splice(i, 1);
            trappedMs = TRAP_DURATION_MS;

            core.events.emitSync('particle/emit', {
              config: {
                x: playerEntity.position.x, y: playerEntity.position.y,
                burst: true, burstCount: 16, speed: 80, speedVariance: 40,
                spread: 180, lifetime: 600, startAlpha: 1, endAlpha: 0,
                startScale: 1.1, endScale: 0,
                startColor: 0x44ddff, endColor: 0x0088cc, radius: 5,
              },
            });
          }
        }
      }

      // ── Move and collect items ────────────────────────────────────────────
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.lifetime -= dt;

        // Move vertically
        item.y += item.vy * (dt / 1000);

        item.display.x = item.x;
        item.display.y = item.y;

        // Fade out when about to expire
        item.display.alpha = item.lifetime < 2000 ? Math.max(0, item.lifetime / 2000) : 1;

        // Remove if fallen off screen or expired
        if (item.y > H + 20 || item.lifetime <= 0) {
          removeItem(items, i, itemsContainer);
          continue;
        }

        // Collect
        const cdx = item.x - playerEntity.position.x;
        const cdy = item.y - playerEntity.position.y;
        if (Math.sqrt(cdx * cdx + cdy * cdy) < ITEM_COLLECT_R + 14) {
          if (item.type === 'health') {
            playerHP = Math.min(effectiveHpMax, playerHP + 1);
            invincibleMs = Math.max(invincibleMs, HEALTH_ITEM_INVINCIBLE_MS);
          } else {
            powerUpTimer = POWER_UP_DURATION_MS;
          }
          // Sparkle burst on collect
          core.events.emitSync('particle/emit', {
            config: {
              x: item.x,
              y: item.y,
              burst: true,
              burstCount: 14,
              speed: 100,
              speedVariance: 50,
              spread: 180,
              angle: 0,
              lifetime: 450,
              startAlpha: 1,
              endAlpha: 0,
              startScale: 1,
              endScale: 0,
              startColor: item.type === 'health' ? 0x00ff88 : 0xffee44,
              endColor: item.type === 'health' ? 0x00cc55 : 0xff8800,
              radius: 5,
            },
          });
          removeItem(items, i, itemsContainer);
          continue;
        }
      }

      // ── Power-up countdown ────────────────────────────────────────────────
      if (powerUpTimer > 0) {
        powerUpTimer = Math.max(0, powerUpTimer - dt);
      }

      updateHUD();
    }
  );

  // ── Advance to the next wave ─────────────────────────────────────────────────
  // nextWaveIdx is the 0-based index of the wave to load.
  async function advanceWave(nextWaveIdx: number): Promise<void> {
    waveTransitioning = true;

    // Clear all enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(enemyBullets[i].display);
      enemyBullets[i].display.destroy();
    }
    enemyBullets.length = 0;

    // Clear shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwavesContainer.removeChild(shockwaves[i].display);
      shockwaves[i].display.destroy();
    }
    shockwaves.length = 0;

    // Clear bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      bubblesContainer.removeChild(bubbles[i].display);
      bubbles[i].display.destroy();
    }
    bubbles.length = 0;

    // Clear any leftover items between waves
    for (let i = items.length - 1; i >= 0; i--) {
      itemsContainer.removeChild(items[i].display);
      items[i].display.destroy();
    }
    items.length = 0;

    // Show wave-clear banner (1-based wave number for display)
    waveBannerText.text = `第 ${nextWaveIdx + 1} 波！`;
    waveBannerText.alpha = 1;

    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    if (gameEnded) return;

    waveBannerText.alpha = 0;

    // Switch to new wave config
    waveIdx = nextWaveIdx;
    waveConfig = levelConfig!.waves[waveIdx];
    waveMaxHp = waveConfig.enemyHp;
    enemyHP = waveMaxHp;
    phase = 1;
    spiralTimer = 0;
    aimTimer = 0;
    spreadTimer = 0;
    ringTimer = 0;
    shockwaveTimer = 0;
    bubbleTimer = 0;
    trappedMs = 0;
    trapAnimMs = 0;
    phaseFlashTimer = 0;
    flashOverlay.alpha = 0;
    itemSpawnTimer = 3000; // first item spawns 3 s into new wave

    // Reset enemy position
    enemyEntity.position.x = W * 0.5;
    enemyEntity.position.y = H * 0.18;
    enemyBobTimer = 0;

    updateHUD();
    waveTransitioning = false;
  }

  // ── Advance to the next endless wave (go to buff selection scene) ───────────
  async function advanceEndlessWave(): Promise<void> {
    if (gameEnded) return;
    gameEnded = true; // prevent further updates while transitioning

    // Show wave-clear banner briefly
    waveBannerText.text = `第 ${endlessState.wave} 波通關！`;
    waveBannerText.alpha = 1;

    await new Promise<void>((resolve) => setTimeout(resolve, 1400));

    waveBannerText.alpha = 0;

    // Store accumulated score
    gameResult.score = score;
    if (score > gameResult.highScore) gameResult.highScore = score;

    // Carry the player's current HP, cumulative score, and buff timers into the next wave
    endlessState.currentHp = playerHP;
    endlessState.score = score;
    endlessState.periodicShieldTimer = periodicShieldTimer;
    endlessState.regenTimer = regenTimer;

    // Advance wave counter for the next round
    endlessState.wave += 1;
    if (endlessState.wave > endlessState.bestWave) {
      endlessState.bestWave = endlessState.wave;
    }

    await core.events.emit('scene/load', { key: 'endlessbuff' });
  }

  // ── End game ────────────────────────────────────────────────────────────────
  async function endGame(won: boolean): Promise<void> {
    if (gameEnded) return;
    gameEnded = true;

    gameResult.won = won;
    gameResult.score = score;
    if (score > gameResult.highScore) gameResult.highScore = score;

    if (isEndless) {
      // In endless mode, record the wave reached and reset the session
      if (endlessState.wave > endlessState.bestWave) {
        endlessState.bestWave = endlessState.wave;
      }
      endlessState.currentHp = 0; // reset for next attempt
      endlessState.score = 0;
      endlessState.periodicShieldTimer = 0;
      endlessState.regenTimer = 0;
      gameResult.playedLevel = 0; // signals "endless mode" to GameOverScene
    } else {
      // Advance level on win, reset on loss
      if (won) {
        gameResult.playedLevel = gameResult.currentLevel;
        gameResult.currentLevel = Math.min(gameResult.currentLevel + 1, TOTAL_LEVELS);
      } else {
        gameResult.playedLevel = gameResult.currentLevel;
      }
    }

    // Big explosion on enemy if won
    if (won) {
      for (let k = 0; k < 6; k++) {
        core.events.emitSync('particle/emit', {
          config: {
            x: enemyEntity.position.x + (Math.random() - 0.5) * 60,
            y: enemyEntity.position.y + (Math.random() - 0.5) * 60,
            burst: true,
            burstCount: 20,
            speed: 160,
            speedVariance: 80,
            spread: 180,
            lifetime: 700,
            startAlpha: 1,
            endAlpha: 0,
            startScale: 1.5,
            endScale: 0,
            startColor: 0xffdd00,
            endColor: 0xff0000,
            radius: 6,
          },
        });
      }
    }

    // Brief delay before switching scene
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    await core.events.emit('scene/load', { key: 'gameover' });
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  _cleanup = () => {
    core.events.removeNamespace('game');

    unsubUpdate();
    unsubTouchStart();
    unsubTouchMove();
    unsubTouchEnd();
    unsubPointerDown();
    unsubPointerMove();
    unsubPointerUp();

    // Destroy all bullets
    for (const b of playerBullets) {
      playerBulletsContainer.removeChild(b.display);
      b.display.destroy();
    }
    for (const b of enemyBullets) {
      enemyBulletsContainer.removeChild(b.display);
      b.display.destroy();
    }
    playerBullets.length = 0;
    enemyBullets.length = 0;

    // Destroy all shockwaves
    for (const sw of shockwaves) {
      shockwavesContainer.removeChild(sw.display);
      sw.display.destroy();
    }
    shockwaves.length = 0;

    // Destroy all bubbles
    for (const bub of bubbles) {
      bubblesContainer.removeChild(bub.display);
      bub.display.destroy();
    }
    bubbles.length = 0;

    // Destroy all items
    for (const item of items) {
      itemsContainer.removeChild(item.display);
      item.display.destroy();
    }
    items.length = 0;

    // Destroy entities
    core.events.emitSync('entity/destroy', { id: 'player' });
    core.events.emitSync('entity/destroy', { id: 'enemy' });

    // Destroy world objects
    worldLayer.removeChild(stars, scrollA, scrollB, playerBulletsContainer, itemsContainer, enemyBulletsContainer, shockwavesContainer, bubblesContainer, trapRing);
    stars.destroy({ children: true });
    scrollA.destroy({ children: true });
    scrollB.destroy({ children: true });
    playerBulletsContainer.destroy({ children: true });
    itemsContainer.destroy({ children: true });
    enemyBulletsContainer.destroy({ children: true });
    shockwavesContainer.destroy({ children: true });
    bubblesContainer.destroy({ children: true });
    trapRing.destroy();

    // Destroy UI
    uiLayer.removeChild(heartsContainer, hpBarContainer, bossLabel, scoreText, phaseText, levelWaveText, waveBannerText, powerUpText, trappedTimerText, shieldTimerText, regenTimerText);
    heartsContainer.destroy({ children: true });
    hpBarContainer.destroy({ children: true });
    bossLabel.destroy();
    scoreText.destroy();
    phaseText.destroy();
    levelWaveText.destroy();
    waveBannerText.destroy();
    powerUpText.destroy();
    trappedTimerText.destroy();
    shieldTimerText.destroy();
    regenTimerText.destroy();

    sysLayer.removeChild(flashOverlay);
    flashOverlay.destroy();
  };
}

// ─── Scene exit ───────────────────────────────────────────────────────────────
async function exit(_core: Core): Promise<void> {
  _cleanup?.();
  _cleanup = null;
}

export const GameScene: SceneDescriptor = {
  key: 'game',
  enter,
  exit,
};
