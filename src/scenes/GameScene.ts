import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneDescriptor } from '@inkshot/engine';
import type { Core } from '@inkshot/engine';
import type { Entity } from '@inkshot/engine';
import { ObjectPool } from '@inkshot/engine';
import {
  createPlayerChicken,
  createEnemyDisplay,
  createEnemyHitFlash,
  createPetDisplay,
  createTrapBubble,
  createTrapRing,
  createStarfield,
  createHeart,
  createBossHpBar,
  createFlashOverlay,
  createHealthItem,
  createPowerItem,
  createGiftBoxItem,
  createFireball,
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
  COL_BULLET_BOMB,
  COL_BULLET_LASER,
} from '../constants';
import { gameResult, devConfig, endlessState, costumeState, skillState } from '../game/store';
import { createLevel, getStoryLevel, TOTAL_LEVELS } from '../game/levels';
import type { WaveConfig } from '../game/levels';
import { createEndlessWaveConfig, endlessEnemyType, pickRandomBuffs } from '../game/endless';
import type { BuffId } from '../game/endless';
import { SKILLS } from '../game/skills';
import { saveProgress } from '../game/persistence';
import {
  sfxShoot,
  sfxEnemyHit,
  sfxPlayerHit,
  sfxShockwave,
  sfxBubble,
  sfxPickup,
  sfxPhaseChange,
  sfxWaveClear,
  sfxVictory,
  sfxDefeat,
  sfxEnemyDeath,
  startBgm,
  stopBgm,
} from '../game/audio';

// ─── Object pools for bullets ────────────────────────────────────────────────

/** Pooled player bullet Graphics (yellow circle, drawn once and reused). */
const playerBulletPool = new ObjectPool<Graphics>(
  () => {
    const g = new Graphics();
    g.circle(0, 0, 7).fill({ color: 0xffff88, alpha: 0.3 });
    g.circle(0, 0, 5).fill(0xffff44);
    return g;
  },
  200,
  (g) => { g.x = 0; g.y = 0; g.visible = false; },
);

/** Pooled enemy bullet Graphics (redrawn with the required colour on acquire). */
const enemyBulletPool = new ObjectPool<Graphics>(
  () => new Graphics(),
  400,
  (g) => { g.x = 0; g.y = 0; g.visible = false; },
);

/** Pre-warm pools at module load to avoid allocation spikes on first wave. */
playerBulletPool.prewarm(30);
enemyBulletPool.prewarm(60);

// ─── Bullet data ─────────────────────────────────────────────────────────────
interface BulletData {
  display: Graphics;
  x: number;
  y: number;
  vx: number; // px/s
  vy: number; // px/s
  /** True when this enemy bullet has been deflected toward the enemy by the elegant costume ability. */
  deflected?: boolean;
  /** Override damage for special projectiles (e.g. wizard fireball). Defaults to bulletDamage. */
  damage?: number;
}

// ─── Item (pickup) data ───────────────────────────────────────────────────────
interface ItemData {
  display: Container;
  x: number;
  y: number;
  vx: number; // px/s (horizontal, currently 0)
  vy: number; // px/s (vertical fall speed)
  type: 'health' | 'power' | 'gift';
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

// ─── Bomb (exploding projectile) data ────────────────────────────────────────
interface BombData {
  display: Graphics;
  x: number;
  y: number;
  vx: number;           // px/s
  vy: number;           // px/s
  fuseMs: number;       // ms until explosion
  ringCount: number;    // bullets spawned in explosion ring
  ringSpeed: number;    // px/s speed of explosion ring bullets
  ringColor: number;
}

// ─── Curving bullet data ──────────────────────────────────────────────────────
interface CurveBulletData {
  display: Graphics;
  x: number;
  y: number;
  angle: number;       // current direction (radians)
  speed: number;       // constant magnitude (px/s)
  turnRate: number;    // radians/s toward player
}

// ─── Laser beam data ─────────────────────────────────────────────────────────
interface LaserBeamData {
  display: Graphics;
  x: number;            // center x of the beam
  phase: 'warning' | 'active' | 'fading';
  phaseMs: number;      // ms remaining in current phase
  color: number;
  hitDealt: boolean;    // only deal damage once per active phase
}

// ─── Pet Guardian data ────────────────────────────────────────────────────────
interface PetData {
  display: Container;
  hitFlash: Graphics;
  hpBarContainer: Container;
  hpBarFill: Graphics;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  bobTimer: number;
  fireTimer: number;
  hitFlashMs: number;
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
  // For story mode we use the story-exclusive level config when available.
  const levelConfig = isEndless
    ? null
    : (gameResult.storyMode
        ? (getStoryLevel(gameResult.currentLevel) ?? createLevel(gameResult.currentLevel))
        : createLevel(gameResult.currentLevel));

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
  const lasersContainer = new Container();
  const petsContainer = new Container();
  worldLayer.addChild(shockwavesContainer, enemyBulletsContainer, bubblesContainer, lasersContainer, petsContainer, itemsContainer, playerBulletsContainer);

  // ── Player entity ────────────────────────────────────────────────────────
  const chickenDisplay = createPlayerChicken(costumeState.selected);
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

  // ── BGM ───────────────────────────────────────────────────────────────────
  startBgm();

  // ── Bullet arrays ────────────────────────────────────────────────────────
  const playerBullets: BulletData[] = [];
  const enemyBullets: BulletData[] = [];
  const shockwaves: ShockwaveData[] = [];
  const bubbles: BubbleData[] = [];
  const bombs: BombData[] = [];
  const curveBullets: CurveBulletData[] = [];
  const lasers: LaserBeamData[] = [];

  // ── Item (pickup) state ───────────────────────────────────────────────────
  const items: ItemData[] = [];
  let itemSpawnTimer = 5000; // first item spawns after 5 s
  let powerUpTimer = 0;      // ms remaining on current damage power-up

  // ── Endless-mode buff state ───────────────────────────────────────────────
  // Gift buffs: granted mid-game by the moose costume's gift-box passive.
  const giftBuffs: BuffId[] = [];

  /** Count total stacks of a buff across both endless-mode buffs and mid-game gift buffs. */
  const countBuff = (id: BuffId): number =>
    (isEndless ? endlessState.buffs.filter(b => b === id).length : 0) +
    giftBuffs.filter(b => b === id).length;

  // Derive effective player stats from accumulated buffs (mutable so gift buffs can update them).
  let buffHpUpCount       = countBuff('hp_up');
  let buffFireRateCount   = countBuff('fire_rate_up');
  let buffTripleCount     = countBuff('triple_shot');
  let buffBloodPriceCount = countBuff('blood_price');
  let buffBulletPowerCount= countBuff('bullet_power');
  let buffEvasionCount    = countBuff('evasion');
  let buffRegenCount      = countBuff('regen');
  let buffLongInvCount    = countBuff('long_invincible');
  let buffItemDropCount   = countBuff('item_drop_up');
  let hasBerserker        = (isEndless && endlessState.buffs.includes('berserker')) || giftBuffs.includes('berserker');
  let hasPeriodicShield   = (isEndless && endlessState.buffs.includes('periodic_shield')) || giftBuffs.includes('periodic_shield');

  // Effective max HP: base + hp_up stacks − blood_price stacks (min 1, max 10)
  // iron_will skill: +1 max HP
  const skillIronWill = skillState.selected === 'iron_will';
  let effectiveHpMax = Math.min(Math.max(PLAYER_HP_MAX + buffHpUpCount - buffBloodPriceCount + (skillIronWill ? 1 : 0), 1), 10);
  // Effective base fire interval (reduced by 10% per fire_rate_up stack, floored at 60 ms)
  let effectiveFireInterval = Math.max(
    Math.round(PLAYER_FIRE_INTERVAL * Math.pow(0.90, buffFireRateCount)),
    60,
  );
  // Bullet damage per hit (1 base + blood_price bonus + bullet_power bonus)
  let bulletDamage = 1 + buffBloodPriceCount * 2 + buffBulletPowerCount;
  // Evasion chance: 10% per stack, capped at 30%
  let evasionChance = Math.min(buffEvasionCount * 0.10, 0.30);
  // Effective invincibility duration: base + 600 ms per long_invincible stack
  let effectiveInvincibleMs = INVINCIBLE_MS + buffLongInvCount * 600;
  // Effective item spawn interval: reduced 25% per stack (capped at 75% reduction, floor 2 s / 4 s)
  // Level itemDropMult further scales the intervals (< 1 = more frequent drops for hard levels)
  const levelItemDropMult = levelConfig?.itemDropMult ?? 1.0;
  let itemSpawnMinMs = buffItemDropCount > 0
    ? Math.max(Math.round(ITEM_SPAWN_MIN_MS * levelItemDropMult * Math.pow(0.75, buffItemDropCount)), 2000)
    : Math.round(ITEM_SPAWN_MIN_MS * levelItemDropMult);
  let itemSpawnMaxMs = buffItemDropCount > 0
    ? Math.max(Math.round(ITEM_SPAWN_MAX_MS * levelItemDropMult * Math.pow(0.75, buffItemDropCount)), 4000)
    : Math.round(ITEM_SPAWN_MAX_MS * levelItemDropMult);
  // Regen: 15 s base interval on first stack, each additional stack subtracts 3 s more (min 6 s)
  let regenIntervalMs = buffRegenCount > 0
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
  // Tracks whether the player has been hit this run (for the no-damage achievement).
  let playerHitThisRun = false;
  // Score thresholds already notified (for score achievements).
  let score1000Notified = false;
  let score10000Notified = false;

  // ── Pet guardian state (Level 5, last wave, phase 3 only) ────────────────
  const pets: PetData[] = [];
  let petPhaseActive = false;
  let petPhaseTriggered = false;
  let petBannerTimer = 0;

  // Pet constants
  const PET_HP = 55;
  const PET_HITBOX_R = 18;
  const PET_FIRE_INTERVAL = 1400; // ms between pet aimed shots
  const PET_BULLET_WAYS = 2;
  const PET_BULLET_SPREAD = 0.38;
  const PET_BULLET_SPEED = 200; // BULLET_SPEED_MEDIUM
  const PET_BULLET_COLOR = 0xaa44ff;
  const PET_BAR_W = 54;

  // Timers (ms counters ticked down each update)
  let playerFireTimer = 0;
  let spiralTimer = 0;
  let aimTimer = 0;
  let spreadTimer = 0;
  let ringTimer = 0;
  let shockwaveTimer = 0;
  let bubbleTimer = 0;
  let bombTimer = 0;
  let laserTimer = 0;
  let curveTimer = 0;
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
    // Cap to the current interval so a newly-added stack is felt immediately
    // (carry-over could exceed the shorter interval when a second stack is picked).
    regenTimer = Math.min(endlessState.regenTimer, regenIntervalMs);
  } else {
    regenTimer = regenIntervalMs;
  }

  // Touch tracking
  let touchActive = false;
  let touchTargetX = playerEntity.position.x;
  let touchTargetY = playerEntity.position.y;

  // ── Skill state ──────────────────────────────────────────────────────────
  const activeSkillId = skillState.selected;
  const activeSkillDef = activeSkillId !== null
    ? SKILLS.find(s => s.id === activeSkillId) ?? null
    : null;
  const isActiveSkill = activeSkillDef?.type === 'active';
  // Cooldown in ms for the active skill (0 = ready to use)
  let skillCooldownMs = 0;
  // Active skill effect timer (ms remaining while the skill effect is active)
  let skillActiveMs = 0;
  // Position constants for the skill button (bottom-right corner)
  const SKILL_BTN_X = W - 38;
  const SKILL_BTN_Y = H - 72;
  const SKILL_BTN_R = 26; // tap hitbox radius

  // ── Elegant costume ability state ────────────────────────────────────────
  // Active ability: 彈幕反彈 – deflects all enemy bullets back at the enemy for 4 s.
  const isElegantCostume = costumeState.selected === 'elegant';
  const DEFLECT_DURATION_MS = 4000;
  const DEFLECT_COOLDOWN_MS = 18000;
  let deflectActiveMs   = 0; // ms remaining while deflect shield is on
  let deflectCooldownMs = 0; // ms until ability is ready again (0 = ready)
  // Position for the costume ability button (above skill button on the right)
  const COSTUME_BTN_X = W - 38;
  const COSTUME_BTN_Y = H - 140;
  const COSTUME_BTN_R = 26;

  // ── Moose costume passive state ──────────────────────────────────────────
  // Passive: every 18 s a gift box spawns at a random position; collecting it awards a random buff.
  const isMooseCostume = costumeState.selected === 'moose';
  const MOOSE_GIFT_INTERVAL_MS = 18000;
  let mooseGiftTimer = isMooseCostume ? MOOSE_GIFT_INTERVAL_MS : 0;

  // ── Fox costume passive state ─────────────────────────────────────────────
  // Passive: items within FOX_ATTRACT_RADIUS px are continuously pulled toward the player.
  const isFoxCostume = costumeState.selected === 'fox';
  const FOX_ATTRACT_RADIUS = 150;
  const FOX_ATTRACT_ACCEL  = 280; // extra px/s added toward player each second

  // ── Wizard costume active state ───────────────────────────────────────────
  // Active ability: 火球術 – charge for WIZARD_CHANNEL_MS ms, then launch a high-damage fireball.
  const isWizardCostume = costumeState.selected === 'wizard';
  const WIZARD_CHANNEL_MS       = 2000;  // charge duration in ms
  const WIZARD_COOLDOWN_MS      = 15000; // cooldown after firing in ms
  const WIZARD_FIREBALL_DAMAGE  = 15;    // HP damage dealt to enemy on hit
  const WIZARD_FIREBALL_SPEED   = 360;   // px/s
  let wizardCooldownMs    = 0;
  let wizardChannelingMs  = 0; // counts DOWN from WIZARD_CHANNEL_MS while charging (0 = not charging)

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
  const skillTimerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xffcc44,
    fontWeight: 'bold',
    dropShadow: { color: 0x884400, distance: 2, alpha: 0.8, blur: 2 },
  });
  const deflectTimerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xff88cc,
    fontWeight: 'bold',
    dropShadow: { color: 0x660044, distance: 2, alpha: 0.8, blur: 2 },
  });
  const wizardTimerStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 14,
    fill: 0xffcc00,
    fontWeight: 'bold',
    dropShadow: { color: 0x885500, distance: 2, alpha: 0.8, blur: 2 },
  });
  const powerUpText       = new Text({ text: '', style: powerUpStyle });
  const trappedTimerText  = new Text({ text: '', style: trappedTimerStyle });
  const shieldTimerText   = new Text({ text: '', style: shieldTimerStyle });
  const regenTimerText    = new Text({ text: '', style: regenTimerStyle });
  const skillTimerText    = new Text({ text: '', style: skillTimerStyle });
  const deflectTimerText  = new Text({ text: '', style: deflectTimerStyle });
  const wizardTimerText   = new Text({ text: '', style: wizardTimerStyle });
  [powerUpText, trappedTimerText, shieldTimerText, regenTimerText, skillTimerText, deflectTimerText, wizardTimerText].forEach(t => {
    t.anchor.set(0, 1);
    t.x = 10;
    t.y = H - 38;
    t.visible = false;
    uiLayer.addChild(t);
  });

  // ── Deflect ring (elegant costume visual) ────────────────────────────────
  // Pulsing pink ring drawn around the player while the deflect shield is active.
  const deflectRing = new Graphics();
  deflectRing.visible = false;
  let deflectAnimMs = 0;
  worldLayer.addChild(deflectRing);

  // ── Active skill button (bottom-right) ────────────────────────────────────
  // Only rendered when an active skill is selected.
  const skillBtnContainer = new Container();
  skillBtnContainer.visible = isActiveSkill;
  const skillBtnBg = new Graphics();
  const skillBtnCooldownArc = new Graphics();
  const skillBtnLabelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 10,
    fill: 0xffffff,
    align: 'center',
    fontWeight: 'bold',
    wordWrap: true,
    wordWrapWidth: SKILL_BTN_R * 2 - 4,
  });
  const skillBtnLabel = new Text({ text: '', style: skillBtnLabelStyle });
  skillBtnLabel.anchor.set(0.5);
  skillBtnContainer.addChild(skillBtnBg, skillBtnCooldownArc, skillBtnLabel);
  skillBtnContainer.x = SKILL_BTN_X;
  skillBtnContainer.y = SKILL_BTN_Y;
  uiLayer.addChild(skillBtnContainer);

  function redrawSkillBtn(): void {
    if (!activeSkillDef) return;
    const ready = skillCooldownMs <= 0;
    const borderColor = ready ? activeSkillDef.borderColor : 0x555566;
    const fillColor = ready ? activeSkillDef.color : 0x111122;

    skillBtnBg.clear();
    skillBtnBg.circle(0, 0, SKILL_BTN_R)
      .fill({ color: fillColor, alpha: 0.9 });
    skillBtnBg.circle(0, 0, SKILL_BTN_R)
      .stroke({ color: borderColor, width: ready ? 2 : 1 });

    // Cooldown sweep arc (dark overlay, clockwise from top)
    skillBtnCooldownArc.clear();
    if (!ready) {
      const totalMs = activeSkillDef.cooldownMs ?? 15000;
      const frac = skillCooldownMs / totalMs;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + frac * Math.PI * 2;
      skillBtnCooldownArc
        .moveTo(0, 0)
        .arc(0, 0, SKILL_BTN_R - 2, startAngle, endAngle)
        .closePath()
        .fill({ color: 0x000000, alpha: 0.55 });
    }

    // Label: skill name when ready, countdown seconds when cooling down
    if (ready) {
      skillBtnLabel.text = activeSkillDef.name;
      skillBtnLabel.style.fill = 0xffffff;
    } else {
      skillBtnLabel.text = `${Math.ceil(skillCooldownMs / 1000)}s`;
      skillBtnLabel.style.fill = 0x888888;
    }
  }

  if (isActiveSkill) redrawSkillBtn();

  // ── Costume ability button (elegant & wizard costumes) ────────────────────
  const hasActiveCostumeAbility = isElegantCostume || isWizardCostume;
  const costumeBtnContainer = new Container();
  costumeBtnContainer.visible = hasActiveCostumeAbility;
  const costumeBtnBg = new Graphics();
  const costumeBtnCooldownArc = new Graphics();
  const costumeBtnLabelStyle = new TextStyle({
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    fontSize: 10,
    fill: 0xffffff,
    align: 'center',
    fontWeight: 'bold',
    wordWrap: true,
    wordWrapWidth: COSTUME_BTN_R * 2 - 4,
  });
  const costumeBtnLabel = new Text({ text: '', style: costumeBtnLabelStyle });
  costumeBtnLabel.anchor.set(0.5);
  costumeBtnContainer.addChild(costumeBtnBg, costumeBtnCooldownArc, costumeBtnLabel);
  costumeBtnContainer.x = COSTUME_BTN_X;
  costumeBtnContainer.y = COSTUME_BTN_Y;
  uiLayer.addChild(costumeBtnContainer);

  function redrawCostumeBtn(): void {
    if (isElegantCostume) {
      const ready = deflectCooldownMs <= 0;
      const borderColor = ready ? 0xff88cc : 0x555566;
      const fillColor   = ready ? 0x1a0011 : 0x111122;
      costumeBtnBg.clear();
      costumeBtnBg.circle(0, 0, COSTUME_BTN_R).fill({ color: fillColor, alpha: 0.9 });
      costumeBtnBg.circle(0, 0, COSTUME_BTN_R).stroke({ color: borderColor, width: ready ? 2 : 1 });
      costumeBtnCooldownArc.clear();
      if (!ready) {
        const frac = deflectCooldownMs / DEFLECT_COOLDOWN_MS;
        costumeBtnCooldownArc
          .moveTo(0, 0)
          .arc(0, 0, COSTUME_BTN_R - 2, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2)
          .closePath()
          .fill({ color: 0x000000, alpha: 0.55 });
      }
      costumeBtnLabel.text  = ready ? '彈反' : `${Math.ceil(deflectCooldownMs / 1000)}s`;
      costumeBtnLabel.style.fill = ready ? 0xffffff : 0x888888;
    } else if (isWizardCostume) {
      const channeling = wizardChannelingMs > 0;
      const onCooldown = wizardCooldownMs > 0;
      const ready      = !channeling && !onCooldown;
      const borderColor = channeling ? 0xffcc00 : ready ? 0xff8800 : 0x555566;
      const fillColor   = channeling ? 0x1a1000 : ready ? 0x1a0800 : 0x111122;
      costumeBtnBg.clear();
      costumeBtnBg.circle(0, 0, COSTUME_BTN_R).fill({ color: fillColor, alpha: 0.9 });
      costumeBtnBg.circle(0, 0, COSTUME_BTN_R).stroke({ color: borderColor, width: (ready || channeling) ? 2 : 1 });
      costumeBtnCooldownArc.clear();
      if (channeling) {
        // Show channel progress (fills as charge completes)
        const frac = 1 - wizardChannelingMs / WIZARD_CHANNEL_MS;
        costumeBtnCooldownArc
          .moveTo(0, 0)
          .arc(0, 0, COSTUME_BTN_R - 2, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2)
          .closePath()
          .fill({ color: 0xffcc00, alpha: 0.35 });
      } else if (onCooldown) {
        const frac = wizardCooldownMs / WIZARD_COOLDOWN_MS;
        costumeBtnCooldownArc
          .moveTo(0, 0)
          .arc(0, 0, COSTUME_BTN_R - 2, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2)
          .closePath()
          .fill({ color: 0x000000, alpha: 0.55 });
      }
      if (channeling) {
        costumeBtnLabel.text = '蓄力中';
        costumeBtnLabel.style.fill = 0xffcc00;
      } else if (onCooldown) {
        costumeBtnLabel.text = `${Math.ceil(wizardCooldownMs / 1000)}s`;
        costumeBtnLabel.style.fill = 0x888888;
      } else {
        costumeBtnLabel.text = '火球';
        costumeBtnLabel.style.fill = 0xffffff;
      }
    }
  }

  if (hasActiveCostumeAbility) redrawCostumeBtn();

  // eagle_eye skill: enemy bullet speed multiplier
  const eagleEyeSpeedMult = skillState.selected === 'eagle_eye' ? 0.80 : 1.0;

  function spawnEnemyBullet(
    x: number, y: number,
    vx: number, vy: number,
    color: number
  ): void {
    const display = enemyBulletPool.acquire();
    display.clear();
    display.circle(0, 0, 9).fill({ color, alpha: 0.25 });
    display.circle(0, 0, 6).fill(color);
    display.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.4 });
    display.x = x;
    display.y = y;
    display.visible = true;
    enemyBulletsContainer.addChild(display);
    // If the deflect shield is active, immediately reverse the bullet toward the enemy.
    const deflected = deflectActiveMs > 0;
    enemyBullets.push({
      display,
      x, y,
      vx: vx * eagleEyeSpeedMult * (deflected ? -1 : 1),
      vy: vy * eagleEyeSpeedMult * (deflected ? -1 : 1),
      deflected,
    });
  }

  // ── Helper: spawn player bullet ───────────────────────────────────────────
  function spawnPlayerBullet(x: number, y: number): void {
    const display = playerBulletPool.acquire();
    display.x = x;
    display.y = y;
    display.visible = true;
    playerBulletsContainer.addChild(display);
    playerBullets.push({ display, x, y, vx: 0, vy: -PLAYER_BULLET_SPEED });
  }

  // ── Helper: remove bullet (returns display to its pool) ──────────────────
  function removeBullet(arr: BulletData[], idx: number, container: Container, isPlayer: boolean): void {
    const b = arr[idx];
    container.removeChild(b.display);
    if (isPlayer) {
      playerBulletPool.release(b.display);
    } else {
      enemyBulletPool.release(b.display);
    }
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
    // burst_fire skill: show active duration
    if (activeSkillId === 'burst_fire' && skillActiveMs > 0) timerEntries.push([skillTimerText, `🔥 爆發射擊 ${Math.ceil(skillActiveMs / 1000)}s`]);
    // elegant costume: show deflect shield duration
    if (deflectActiveMs > 0) timerEntries.push([deflectTimerText, `🌸 彈幕反彈 ${Math.ceil(deflectActiveMs / 1000)}s`]);
    // wizard costume: show channel countdown
    if (wizardChannelingMs > 0) timerEntries.push([wizardTimerText, `✨ 蓄力中 ${Math.ceil(wizardChannelingMs / 1000)}s`]);

    const timerBaseY = H - 38;
    const timerLineH = 18;
    [powerUpText, trappedTimerText, shieldTimerText, regenTimerText, skillTimerText, deflectTimerText, wizardTimerText].forEach(t => {
      t.text = '';
      t.visible = false;
    });
    timerEntries.forEach(([text, label], i) => {
      text.text = label;
      text.y = timerBaseY - (timerEntries.length - 1 - i) * timerLineH;
      text.visible = true;
    });
  }

  // ── Helper: recompute all buff-derived stats (called after a gift buff is granted) ──
  function recomputeBuffStats(): void {
    buffHpUpCount        = countBuff('hp_up');
    buffFireRateCount    = countBuff('fire_rate_up');
    buffTripleCount      = countBuff('triple_shot');
    buffBloodPriceCount  = countBuff('blood_price');
    buffBulletPowerCount = countBuff('bullet_power');
    buffEvasionCount     = countBuff('evasion');
    buffRegenCount       = countBuff('regen');
    buffLongInvCount     = countBuff('long_invincible');
    buffItemDropCount    = countBuff('item_drop_up');
    hasBerserker      = (isEndless && endlessState.buffs.includes('berserker'))       || giftBuffs.includes('berserker');
    hasPeriodicShield = (isEndless && endlessState.buffs.includes('periodic_shield')) || giftBuffs.includes('periodic_shield');

    effectiveHpMax = Math.min(Math.max(PLAYER_HP_MAX + buffHpUpCount - buffBloodPriceCount + (skillIronWill ? 1 : 0), 1), 10);
    effectiveFireInterval = Math.max(Math.round(PLAYER_FIRE_INTERVAL * Math.pow(0.90, buffFireRateCount)), 60);
    bulletDamage = 1 + buffBloodPriceCount * 2 + buffBulletPowerCount;
    evasionChance = Math.min(buffEvasionCount * 0.10, 0.30);
    effectiveInvincibleMs = INVINCIBLE_MS + buffLongInvCount * 600;
    itemSpawnMinMs = buffItemDropCount > 0
      ? Math.max(Math.round(ITEM_SPAWN_MIN_MS * levelItemDropMult * Math.pow(0.75, buffItemDropCount)), 2000)
      : Math.round(ITEM_SPAWN_MIN_MS * levelItemDropMult);
    itemSpawnMaxMs = buffItemDropCount > 0
      ? Math.max(Math.round(ITEM_SPAWN_MAX_MS * levelItemDropMult * Math.pow(0.75, buffItemDropCount)), 4000)
      : Math.round(ITEM_SPAWN_MAX_MS * levelItemDropMult);
    regenIntervalMs = buffRegenCount > 0 ? Math.max(15000 - buffRegenCount * 3000, 6000) : 0;
  }

  // ── Helper: apply a gift buff received from the moose costume's gift box ────
  function applyGiftBuff(id: BuffId): void {
    giftBuffs.push(id);
    recomputeBuffStats();

    // Grow the hearts display if max HP increased due to hp_up
    while (hearts.length < effectiveHpMax) {
      const h = createHeart(true);
      h.scale.set(1.1);
      h.x = 18 + hearts.length * 26;
      h.y = 0;
      heartsContainer.addChild(h);
      hearts.push(h);
    }

    // Immediate HP effects
    if (id === 'hp_up') {
      playerHP = Math.min(effectiveHpMax, playerHP + 1);
    } else if (id === 'hp_restore') {
      playerHP = Math.min(effectiveHpMax, playerHP + Math.ceil(effectiveHpMax / 2));
    }

    // Start periodic shield timer if just unlocked via gift
    if (id === 'periodic_shield' && periodicShieldTimer <= 0) {
      periodicShieldTimer = 12000;
    }
    // Initialize regen timer if newly acquired
    if (id === 'regen' && regenIntervalMs > 0 && regenTimer <= 0) {
      regenTimer = regenIntervalMs;
    }

    updateHUD();
  }


  function checkPhase(): void {
    const frac = enemyHP / waveMaxHp;
    const newPhase: 1 | 2 | 3 = frac > waveConfig.phase2Frac ? 1 : frac > waveConfig.phase3Frac ? 2 : 3;
    if (newPhase !== phase) {
      phase = newPhase;
      // Trigger phase flash + audio + camera shake
      phaseFlashTimer = 600;
      sfxPhaseChange();
      core.events.emitSync('camera/shake', { intensity: 6, duration: 250 });
      // Clear bullets for brief pause
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(enemyBullets[i].display);
        enemyBulletPool.release(enemyBullets[i].display);
      }
      enemyBullets.length = 0;
      // Clear bombs
      for (let i = bombs.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(bombs[i].display);
        bombs[i].display.destroy();
      }
      bombs.length = 0;
      // Clear curving bullets
      for (let i = curveBullets.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(curveBullets[i].display);
        enemyBulletPool.release(curveBullets[i].display);
      }
      curveBullets.length = 0;
      // Clear laser beams
      for (let i = lasers.length - 1; i >= 0; i--) {
        lasersContainer.removeChild(lasers[i].display);
        lasers[i].display.destroy();
      }
      lasers.length = 0;
      // Reset new attack timers so the first volley fires at their configured interval
      bombTimer = 0;
      laserTimer = 0;
      curveTimer = 0;

      // When entering phase 3 on the final wave of level 5: summon pet guardians
      if (
        newPhase === 3 &&
        !petPhaseTriggered &&
        !isEndless &&
        levelConfig?.levelNumber === 5 &&
        waveIdx === levelConfig.waves.length - 1
      ) {
        petPhaseTriggered = true;
        spawnPets();
      }
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

  /** Ring: fires n bullets in a full circle from the given position. */
  function fireRingAt(ox: number, oy: number, n: number, speed: number, color: number): void {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      spawnEnemyBullet(ox, oy, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  }

  /** Ring: fires n bullets in a full circle centered on the enemy. */
  function fireRing(n: number, speed: number, color: number): void {
    fireRingAt(enemyEntity.position.x, enemyEntity.position.y, n, speed, color);
  }

  /** Shockwave: spawns an expanding ring centered on the enemy's current position. */
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

  // ── Attack-specific constants ────────────────────────────────────────────────
  const BOMB_SPEED = 85;                   // px/s, slow tracking projectile
  const BOMB_PULSE_PERIOD_MS = 120;        // controls pulse frequency as fuse counts down
  const LASER_MARGIN = 50;                 // px from screen edge for random laser column position
  const LASER_DOUBLE_THRESHOLD = 6;       // min bullet count that triggers a second beam
  const LASER_WARNING_MS_BEAM = 900;      // warning phase duration (ms)
  const LASER_ACTIVE_MS_BEAM  = 350;      // active beam damage phase (ms)
  const LASER_FADE_MS_BEAM    = 300;      // fade-out phase (ms)
  const LASER_BEAM_HALF_W     = 12;       // half-width of beam collision zone (px)

  /** Bomb: slow projectile aimed at the player; explodes into a ring after fuseMs. */
  function fireBomb(
    count: number, fuseMs: number,
    ringCount: number, ringSpeed: number, color: number
  ): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    const px = playerEntity.position.x;
    const py = playerEntity.position.y;
    const baseAngle = Math.atan2(py - ey, px - ex);
    const half = (count - 1) / 2;
    for (let i = 0; i < count; i++) {
      const a = count > 1 ? baseAngle + (i - half) * 0.35 : baseAngle;
      const display = new Graphics();
      // Outer glow + core
      display.circle(0, 0, 14).fill({ color, alpha: 0.25 });
      display.circle(0, 0, 10).fill(color);
      display.circle(0, 0, 5).fill({ color: 0xffffff, alpha: 0.55 });
      display.x = ex;
      display.y = ey;
      display.visible = true;
      enemyBulletsContainer.addChild(display);
      bombs.push({
        display, x: ex, y: ey,
        vx: Math.cos(a) * BOMB_SPEED,
        vy: Math.sin(a) * BOMB_SPEED,
        fuseMs, ringCount, ringSpeed, ringColor: color,
      });
    }
  }

  /** Laser: fires a visible beam from the top of the screen downward.
   *  Phase 1 (warning): thin flashing line marks the target column.
   *  Phase 2 (active):  wide glowing beam deals damage on contact.
   *  Phase 3 (fading):  beam fades out. */
  function fireLaser(count: number, _speed: number, color: number): void {
    const spawnBeam = (bx: number) => {
      const display = new Graphics();
      lasersContainer.addChild(display);
      lasers.push({ display, x: bx, phase: 'warning', phaseMs: LASER_WARNING_MS_BEAM, color, hitDealt: false });
    };
    spawnBeam(LASER_MARGIN + Math.random() * (W - LASER_MARGIN * 2));
    if (count >= LASER_DOUBLE_THRESHOLD) {
      spawnBeam(LASER_MARGIN + Math.random() * (W - LASER_MARGIN * 2));
    }
  }

  /** Curve: fires bullets aimed at the player that gradually home in. */
  function fireCurve(nWay: number, speed: number, turnRate: number, color: number): void {
    const ex = enemyEntity.position.x;
    const ey = enemyEntity.position.y;
    const px = playerEntity.position.x;
    const py = playerEntity.position.y;
    const baseAngle = Math.atan2(py - ey, px - ex);
    const half = (nWay - 1) / 2;
    for (let i = 0; i < nWay; i++) {
      const angle = baseAngle + (nWay > 1 ? (i - half) * 0.40 : 0);
      const display = enemyBulletPool.acquire();
      display.clear();
      display.circle(0, 0, 9).fill({ color, alpha: 0.30 });
      display.circle(0, 0, 6).fill(color);
      display.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.55 });
      display.x = ex;
      display.y = ey;
      display.visible = true;
      enemyBulletsContainer.addChild(display);
      curveBullets.push({ display, x: ex, y: ey, angle, speed, turnRate });
    }
  }

  /** Aimed shots fired from an arbitrary world position (used by pet guardians). */
  function fireAimedFrom(ox: number, oy: number, nWay: number, spreadRad: number, speed: number, color: number): void {
    const px = playerEntity.position.x;
    const py = playerEntity.position.y;
    const baseAngle = Math.atan2(py - oy, px - ox);
    const half = (nWay - 1) / 2;
    for (let i = 0; i < nWay; i++) {
      const a = baseAngle + (i - half) * spreadRad;
      spawnEnemyBullet(ox, oy, Math.cos(a) * speed, Math.sin(a) * speed, color);
    }
  }

  // ── Pet guardian helpers ─────────────────────────────────────────────────

  /** Spawn the two pet guardians flanking the boss. */
  function spawnPets(): void {
    petPhaseActive = true;
    // Clear all existing boss bullets for a dramatic pause
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(enemyBullets[i].display);
      enemyBulletPool.release(enemyBullets[i].display);
    }
    enemyBullets.length = 0;
    for (let i = bombs.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(bombs[i].display);
      bombs[i].display.destroy();
    }
    bombs.length = 0;
    for (let i = curveBullets.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(curveBullets[i].display);
      enemyBulletPool.release(curveBullets[i].display);
    }
    curveBullets.length = 0;
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasersContainer.removeChild(lasers[i].display);
      lasers[i].display.destroy();
    }
    lasers.length = 0;

    const petPositions: Array<{ x: number; y: number }> = [
      { x: W * 0.25, y: H * 0.20 },
      { x: W * 0.75, y: H * 0.20 },
    ];
    for (const pos of petPositions) {
      const display = createPetDisplay();
      display.x = pos.x;
      display.y = pos.y;
      petsContainer.addChild(display);

      const hitFlash = createEnemyHitFlash(20);
      display.addChild(hitFlash);

      // HP bar background + fill
      const hpBarContainer = new Container();
      const hpBarBg = new Graphics();
      hpBarBg.roundRect(0, 0, PET_BAR_W, 7, 2).fill({ color: 0x220033, alpha: 0.85 });
      hpBarContainer.addChild(hpBarBg);
      const hpBarFill = new Graphics();
      hpBarFill.rect(0, 0, PET_BAR_W, 7).fill(0xcc44ff);
      hpBarContainer.addChild(hpBarFill);
      const hpBarBorder = new Graphics();
      hpBarBorder.roundRect(0, 0, PET_BAR_W, 7, 2).stroke({ color: 0xee88ff, width: 1 });
      hpBarContainer.addChild(hpBarBorder);
      // Centre bar above the pet
      hpBarContainer.x = pos.x - PET_BAR_W / 2;
      hpBarContainer.y = pos.y - 32;
      petsContainer.addChild(hpBarContainer);

      pets.push({
        display,
        hitFlash,
        hpBarContainer,
        hpBarFill,
        hp: PET_HP,
        maxHp: PET_HP,
        x: pos.x,
        y: pos.y,
        bobTimer: 0,
        fireTimer: 600, // first shot fires after a short delay
        hitFlashMs: 0,
      });
    }

    // Show summoning banner
    waveBannerText.text = '護衛召喚！';
    waveBannerText.alpha = 1;
    petBannerTimer = 2000;

    // Camera shake + flash
    core.events.emitSync('camera/shake', { intensity: 10, duration: 400 });
    flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xaa00ff, alpha: 1 });
    flashOverlay.alpha = 0.28;
    phaseFlashTimer = Math.max(phaseFlashTimer, 500);

    core.events.emitSync('particle/emit', {
      config: {
        x: W * 0.5, y: H * 0.20,
        burst: true, burstCount: 28, speed: 160, speedVariance: 80,
        spread: 180, lifetime: 700, startAlpha: 1, endAlpha: 0,
        startScale: 1.4, endScale: 0,
        startColor: 0xcc44ff, endColor: 0x660088, radius: 6,
      },
    });
  }

  /** Remove a pet at index pi. Returns true if it was the last pet. */
  function removePet(pi: number): boolean {
    const pet = pets[pi];
    // Death particle burst
    core.events.emitSync('particle/emit', {
      config: {
        x: pet.x, y: pet.y,
        burst: true, burstCount: 22, speed: 140, speedVariance: 70,
        spread: 180, lifetime: 600, startAlpha: 1, endAlpha: 0,
        startScale: 1.4, endScale: 0,
        startColor: 0xcc44ff, endColor: 0x440066, radius: 6,
      },
    });
    core.events.emitSync('camera/shake', { intensity: 8, duration: 250 });
    sfxEnemyDeath();
    petsContainer.removeChild(pet.display);
    petsContainer.removeChild(pet.hpBarContainer);
    pet.display.destroy();
    pets.splice(pi, 1);
    return pets.length === 0;
  }

  /** Called when all pets are defeated — resume boss attacks. */
  function onAllPetsDefeated(): void {
    petPhaseActive = false;
    // Flash to signal boss resuming
    flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xff4400, alpha: 1 });
    flashOverlay.alpha = 0.30;
    phaseFlashTimer = Math.max(phaseFlashTimer, 600);
    core.events.emitSync('camera/shake', { intensity: 12, duration: 350 });
    waveBannerText.text = '護衛消滅！';
    waveBannerText.alpha = 1;
    petBannerTimer = 1600;
    // Reset all boss attack timers so there is a brief pause before the first shot
    spiralTimer = 0; aimTimer = 0; spreadTimer = 0; ringTimer = 0;
    shockwaveTimer = 0; bubbleTimer = 0; bombTimer = 0; laserTimer = 0; curveTimer = 0;
  }

  // ── Active skill activation helper ───────────────────────────────────────
  function tryActivateSkill(): boolean {
    if (!isActiveSkill || gameEnded || skillCooldownMs > 0) return false;
    const cooldown = activeSkillDef?.cooldownMs ?? 15000;
    skillCooldownMs = cooldown;

    if (activeSkillId === 'swift_dodge') {
      // Grant 2 s invincibility
      invincibleMs = Math.max(invincibleMs, 2000);
      flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0x44aaff, alpha: 1 });
      flashOverlay.alpha = 0.20;
      phaseFlashTimer = Math.max(phaseFlashTimer, 250);
      core.events.emitSync('particle/emit', {
        config: {
          x: playerEntity.position.x, y: playerEntity.position.y,
          burst: true, burstCount: 14, speed: 100, speedVariance: 50,
          spread: 180, lifetime: 450, startAlpha: 1, endAlpha: 0,
          startScale: 1.2, endScale: 0,
          startColor: 0x44aaff, endColor: 0xaaddff, radius: 5,
        },
      });
    } else if (activeSkillId === 'burst_fire') {
      // Activate burst fire for 4 s
      skillActiveMs = 4000;
      flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xffcc00, alpha: 1 });
      flashOverlay.alpha = 0.18;
      phaseFlashTimer = Math.max(phaseFlashTimer, 250);
      core.events.emitSync('particle/emit', {
        config: {
          x: playerEntity.position.x, y: playerEntity.position.y,
          burst: true, burstCount: 20, speed: 150, speedVariance: 60,
          spread: 180, lifetime: 500, startAlpha: 1, endAlpha: 0,
          startScale: 1.4, endScale: 0,
          startColor: 0xffcc00, endColor: 0xff8800, radius: 5,
        },
      });
    } else if (activeSkillId === 'bullet_clear') {
      // Clear all enemy projectiles
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(enemyBullets[i].display);
        enemyBulletPool.release(enemyBullets[i].display);
      }
      enemyBullets.length = 0;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        shockwavesContainer.removeChild(shockwaves[i].display);
        shockwaves[i].display.destroy();
      }
      shockwaves.length = 0;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        bubblesContainer.removeChild(bubbles[i].display);
        bubbles[i].display.destroy();
      }
      bubbles.length = 0;
      for (let i = bombs.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(bombs[i].display);
        bombs[i].display.destroy();
      }
      bombs.length = 0;
      for (let i = curveBullets.length - 1; i >= 0; i--) {
        enemyBulletsContainer.removeChild(curveBullets[i].display);
        enemyBulletPool.release(curveBullets[i].display);
      }
      curveBullets.length = 0;
      for (let i = lasers.length - 1; i >= 0; i--) {
        lasersContainer.removeChild(lasers[i].display);
        lasers[i].display.destroy();
      }
      lasers.length = 0;
      flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xcc44ff, alpha: 1 });
      flashOverlay.alpha = 0.25;
      phaseFlashTimer = Math.max(phaseFlashTimer, 300);
      core.events.emitSync('camera/shake', { intensity: 6, duration: 200 });
      core.events.emitSync('particle/emit', {
        config: {
          x: W * 0.5, y: H * 0.5,
          burst: true, burstCount: 24, speed: 180, speedVariance: 80,
          spread: 180, lifetime: 600, startAlpha: 1, endAlpha: 0,
          startScale: 1.5, endScale: 0,
          startColor: 0xcc44ff, endColor: 0xffffff, radius: 6,
        },
      });
    }

    redrawSkillBtn();
    return true;
  }

  // ── Elegant costume: deflect activation helper ────────────────────────────
  function tryActivateDeflect(): boolean {
    if (!isElegantCostume || gameEnded || deflectCooldownMs > 0) return false;
    deflectCooldownMs = DEFLECT_COOLDOWN_MS;
    deflectActiveMs   = DEFLECT_DURATION_MS;
    deflectAnimMs     = 0;

    // Flip all existing enemy bullets toward the enemy
    for (const b of enemyBullets) {
      if (!b.deflected) {
        b.vx = -b.vx;
        b.vy = -b.vy;
        b.deflected = true;
      }
    }

    flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xff88cc, alpha: 1 });
    flashOverlay.alpha = 0.22;
    phaseFlashTimer = Math.max(phaseFlashTimer, 300);
    core.events.emitSync('camera/shake', { intensity: 5, duration: 200 });
    core.events.emitSync('particle/emit', {
      config: {
        x: playerEntity.position.x, y: playerEntity.position.y,
        burst: true, burstCount: 22, speed: 130, speedVariance: 60,
        spread: 180, lifetime: 550, startAlpha: 1, endAlpha: 0,
        startScale: 1.3, endScale: 0,
        startColor: 0xff88cc, endColor: 0xffffff, radius: 5,
      },
    });
    redrawCostumeBtn();
    return true;
  }

  // ── Wizard costume: fireball activation helper ───────────────────────────
  function tryActivateWizard(): boolean {
    if (!isWizardCostume || gameEnded || wizardCooldownMs > 0 || wizardChannelingMs > 0) return false;
    // Start charging
    wizardChannelingMs = WIZARD_CHANNEL_MS;
    redrawCostumeBtn();
    // Visual flash to indicate charge start
    core.events.emitSync('particle/emit', {
      config: {
        x: playerEntity.position.x, y: playerEntity.position.y,
        burst: true, burstCount: 14, speed: 80, speedVariance: 40,
        spread: 180, lifetime: 450, startAlpha: 1, endAlpha: 0,
        startScale: 1.1, endScale: 0,
        startColor: 0xffaa00, endColor: 0xff6600, radius: 5,
      },
    });
    return true;
  }

  // ── Helpers: hit-test costume & skill buttons ─────────────────────────────
  function isOverCostumeBtn(canvasX: number, canvasY: number): boolean {
    if (!hasActiveCostumeAbility) return false;
    const dx = canvasX - COSTUME_BTN_X;
    const dy = canvasY - COSTUME_BTN_Y;
    return Math.sqrt(dx * dx + dy * dy) <= COSTUME_BTN_R + 10;
  }

  function tryActivateCostumeAbility(): boolean {
    if (isElegantCostume) return tryActivateDeflect();
    if (isWizardCostume)  return tryActivateWizard();
    return false;
  }

  // ── Touch input ────────────────────────────────────────────────────────────
  function isOverSkillBtn(canvasX: number, canvasY: number): boolean {
    if (!isActiveSkill) return false;
    const dx = canvasX - SKILL_BTN_X;
    const dy = canvasY - SKILL_BTN_Y;
    return Math.sqrt(dx * dx + dy * dy) <= SKILL_BTN_R + 10;
  }

  const unsubTouchStart = core.events.on(
    'game',
    'input/touch:start',
    ({ x, y }: { x: number; y: number }) => {
      const pos = toCanvas(x, y, core);
      if (isOverCostumeBtn(pos.x, pos.y)) {
        tryActivateCostumeAbility();
        return;
      }
      if (isOverSkillBtn(pos.x, pos.y)) {
        tryActivateSkill();
        return;
      }
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
      if (isOverCostumeBtn(pos.x, pos.y)) {
        tryActivateCostumeAbility();
        return;
      }
      if (isOverSkillBtn(pos.x, pos.y)) {
        tryActivateSkill();
        return;
      }
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

      // ── Active skill cooldown & effect countdown ──────────────────────────
      if (isActiveSkill) {
        if (skillCooldownMs > 0) {
          skillCooldownMs = Math.max(0, skillCooldownMs - dt);
          redrawSkillBtn();
        }
        if (skillActiveMs > 0) {
          skillActiveMs = Math.max(0, skillActiveMs - dt);
        }
      }

      // ── Elegant costume: deflect shield countdown & ring visual ───────────
      if (isElegantCostume) {
        if (deflectCooldownMs > 0) {
          deflectCooldownMs = Math.max(0, deflectCooldownMs - dt);
          redrawCostumeBtn();
        }
        if (deflectActiveMs > 0) {
          deflectActiveMs = Math.max(0, deflectActiveMs - dt);
          deflectAnimMs += dt;
          deflectRing.visible = true;
          deflectRing.x = playerEntity.position.x;
          deflectRing.y = playerEntity.position.y;
          const pulse = 1 + 0.10 * Math.sin(deflectAnimMs / 160);
          deflectRing.clear();
          deflectRing.circle(0, 0, 32 * pulse).fill({ color: 0xff88cc, alpha: 0.10 });
          deflectRing.circle(0, 0, 32 * pulse).stroke({ color: 0xff88cc, width: 3, alpha: 0.75 });
          if (deflectActiveMs <= 0) { deflectRing.visible = false; deflectAnimMs = 0; }
        }
      }

      // ── Moose costume: gift box passive timer ──────────────────────────────
      if (isMooseCostume && !waveTransitioning) {
        mooseGiftTimer -= dt;
        if (mooseGiftTimer <= 0) {
          mooseGiftTimer = MOOSE_GIFT_INTERVAL_MS;
          // Spawn a gift box at a random horizontal position near the top of the play area
          const gx = 30 + Math.random() * (W - 60);
          const gy = -20; // start just above the screen so it falls in
          const gDisplay = createGiftBoxItem();
          gDisplay.x = gx;
          gDisplay.y = gy;
          itemsContainer.addChild(gDisplay);
          items.push({ display: gDisplay, x: gx, y: gy, vx: 0, vy: devConfig.itemFallSpeed, type: 'gift', lifetime: ITEM_LIFETIME_MS });
        }
      }

      // ── Wizard costume: channel countdown & fireball launch ───────────────
      if (isWizardCostume) {
        if (wizardCooldownMs > 0) {
          wizardCooldownMs = Math.max(0, wizardCooldownMs - dt);
          redrawCostumeBtn();
        }
        if (wizardChannelingMs > 0) {
          wizardChannelingMs = Math.max(0, wizardChannelingMs - dt);
          redrawCostumeBtn();
          // Channeling particles around player (growing intensity)
          const chargePct = 1 - wizardChannelingMs / WIZARD_CHANNEL_MS;
          if (Math.random() < 0.4 + chargePct * 0.5) {
            const angle = Math.random() * Math.PI * 2;
            const r = 20 + Math.random() * 14;
            core.events.emitSync('particle/emit', {
              config: {
                x: playerEntity.position.x + Math.cos(angle) * r,
                y: playerEntity.position.y + Math.sin(angle) * r,
                burst: true, burstCount: 1, speed: 20, speedVariance: 10,
                spread: 360, lifetime: 300, startAlpha: 0.9, endAlpha: 0,
                startScale: 0.8 + chargePct * 0.6, endScale: 0,
                startColor: 0xffcc00, endColor: 0xff6600, radius: 4,
              },
            });
          }
          if (wizardChannelingMs <= 0) {
            // Channel complete: fire the fireball
            wizardCooldownMs = WIZARD_COOLDOWN_MS;
            const ex = enemyEntity.position.x;
            const ey = enemyEntity.position.y;
            const px = playerEntity.position.x;
            const py = playerEntity.position.y;
            const dist = Math.sqrt((ex - px) * (ex - px) + (ey - py) * (ey - py)) || 1;
            const fbVx = ((ex - px) / dist) * WIZARD_FIREBALL_SPEED;
            const fbVy = ((ey - py) / dist) * WIZARD_FIREBALL_SPEED;
            const fbDisplay = createFireball();
            fbDisplay.x = px;
            fbDisplay.y = py - 10;
            playerBulletsContainer.addChild(fbDisplay);
            playerBullets.push({ display: fbDisplay, x: px, y: py - 10, vx: fbVx, vy: fbVy, damage: WIZARD_FIREBALL_DAMAGE });
            flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xff8800, alpha: 1 });
            flashOverlay.alpha = 0.20;
            phaseFlashTimer = Math.max(phaseFlashTimer, 250);
            core.events.emitSync('particle/emit', {
              config: {
                x: px, y: py,
                burst: true, burstCount: 28, speed: 160, speedVariance: 80,
                spread: 180, lifetime: 600, startAlpha: 1, endAlpha: 0,
                startScale: 1.5, endScale: 0,
                startColor: 0xffcc00, endColor: 0xff4400, radius: 6,
              },
            });
            redrawCostumeBtn();
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
        // burst_fire skill: halve fire interval while skillActiveMs > 0
        const burstFireActive = activeSkillId === 'burst_fire' && skillActiveMs > 0;
        const fireInterval = powerUpTimer > 0
          ? POWER_FIRE_INTERVAL
          : burstFireActive
            ? Math.max(Math.round(baseInterval / 2), 60)
            : baseInterval;
        playerFireTimer = fireInterval;
        spawnPlayerBullet(playerEntity.position.x - 6, playerEntity.position.y - 18);
        spawnPlayerBullet(playerEntity.position.x + 6, playerEntity.position.y - 18);
        // Centre bullet(s) from power-up or triple_shot buffs
        const centreBullets = (powerUpTimer > 0 ? 1 : 0) + buffTripleCount;
        for (let k = 0; k < centreBullets; k++) {
          const offset = (k - (centreBullets - 1) / 2) * 8;
          spawnPlayerBullet(playerEntity.position.x + offset, playerEntity.position.y - 22);
        }
        sfxShoot();
      }

      // ── Enemy bullet patterns (driven by wave config) ─────────────────────
      // Boss does not attack while pet guardians are active.
      if (phaseFlashTimer <= 0 && !waveTransitioning && !petPhaseActive) {
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

        if (p.bombInterval > 0) {
          bombTimer -= dt;
          if (bombTimer <= 0) {
            bombTimer = p.bombInterval;
            fireBomb(p.bombCount, p.bombFuseMs, p.bombRingCount, p.bombRingSpeed, p.bombColor);
          }
        }

        if (p.laserInterval > 0) {
          laserTimer -= dt;
          if (laserTimer <= 0) {
            laserTimer = p.laserInterval;
            fireLaser(p.laserCount, p.laserSpeed, p.laserColor);
          }
        }

        if (p.curveInterval > 0) {
          curveTimer -= dt;
          if (curveTimer <= 0) {
            curveTimer = p.curveInterval;
            fireCurve(p.curveWays, p.curveSpeed, p.curveTurnRate, p.curveColor);
          }
        }
      }

      // ── Pet guardian update (fire + bob + hit-flash) ──────────────────────
      if (petPhaseActive && !waveTransitioning) {
        for (const pet of pets) {
          // Bob animation
          pet.bobTimer += dt;
          const bobY = pet.y + Math.sin(pet.bobTimer / 600) * 8;
          pet.display.y = bobY;
          pet.hpBarContainer.y = bobY - 32;

          // Hit-flash fade
          if (pet.hitFlashMs > 0) {
            pet.hitFlashMs = Math.max(0, pet.hitFlashMs - dt);
            pet.hitFlash.visible = true;
            pet.hitFlash.alpha = pet.hitFlashMs / 80;
            if (pet.hitFlashMs <= 0) pet.hitFlash.visible = false;
          }

          // Aimed fire at player
          pet.fireTimer -= dt;
          if (pet.fireTimer <= 0) {
            pet.fireTimer = PET_FIRE_INTERVAL;
            fireAimedFrom(pet.x, pet.display.y, PET_BULLET_WAYS, PET_BULLET_SPREAD, PET_BULLET_SPEED, PET_BULLET_COLOR);
          }
        }

        // Pet summoning banner fade
        if (petBannerTimer > 0) {
          petBannerTimer = Math.max(0, petBannerTimer - dt);
          waveBannerText.alpha = petBannerTimer < 400 ? petBannerTimer / 400 : 1;
          if (petBannerTimer <= 0) waveBannerText.alpha = 0;
        }
      } else if (petBannerTimer > 0) {
        // Handle banner fade-out even when pet phase just ended
        petBannerTimer = Math.max(0, petBannerTimer - dt);
        waveBannerText.alpha = petBannerTimer < 400 ? petBannerTimer / 400 : 1;
        if (petBannerTimer <= 0) waveBannerText.alpha = 0;
      }

      // ── Move player bullets ───────────────────────────────────────────────
      for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        b.y += b.vy * (dt / 1000);
        b.display.y = b.y;

        // Off-screen
        if (b.y < -20) {
          removeBullet(playerBullets, i, playerBulletsContainer, true);
          continue;
        }

        // Skip hitting enemy during wave transition
        if (waveTransitioning) continue;

        // During pet phase: only pets can be hit; boss is invulnerable
        if (petPhaseActive) {
          for (let pi = pets.length - 1; pi >= 0; pi--) {
            const pet = pets[pi];
            const pdx = b.x - pet.x;
            const pdy = b.y - pet.display.y;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < PET_HITBOX_R + PLAYER_BULLET_R) {
              removeBullet(playerBullets, i, playerBulletsContainer, true);
              pet.hp = Math.max(0, pet.hp - bulletDamage);
              pet.hitFlashMs = 80;
              score += SCORE_PER_HIT * bulletDamage;
              sfxEnemyHit();

              // Update pet HP bar fill
              const barFrac = Math.max(0, pet.hp / pet.maxHp);
              pet.hpBarFill.clear();
              if (barFrac > 0) {
                pet.hpBarFill.rect(0, 0, PET_BAR_W * barFrac, 7).fill(0xcc44ff);
              }

              core.events.emitSync('particle/emit', {
                config: {
                  x: pet.x + (Math.random() - 0.5) * 20,
                  y: pet.display.y + (Math.random() - 0.5) * 20,
                  burst: true, burstCount: 7, speed: 80, speedVariance: 35,
                  spread: 180, lifetime: 300, startAlpha: 1, endAlpha: 0,
                  startScale: 1, endScale: 0,
                  startColor: 0xcc44ff, endColor: 0x880088, radius: 4,
                },
              });

              if (pet.hp <= 0) {
                const allDead = removePet(pi);
                if (allDead) onAllPetsDefeated();
              }
              break;
            }
          }
          // Skip boss hit check during pet phase — boss is invulnerable while pets are alive
          continue;
        }

        // Hit enemy
        const dx = b.x - enemyEntity.position.x;
        const dy = b.y - enemyEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ENEMY_HITBOX_R + PLAYER_BULLET_R) {
          const dmg = b.damage ?? bulletDamage;
          removeBullet(playerBullets, i, playerBulletsContainer, true);
          enemyHP = Math.max(0, enemyHP - dmg);
          score += SCORE_PER_HIT * dmg;
          hitFlashTimer = 80;
          sfxEnemyHit();

          // Score milestone achievements
          if (!score1000Notified && score >= 1000) {
            score1000Notified = true;
            core.events.emitSync('game/score_1000', {});
          }
          if (!score10000Notified && score >= 10000) {
            score10000Notified = true;
            core.events.emitSync('game/score_10000', {});
          }

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
          removeBullet(enemyBullets, i, enemyBulletsContainer, false);
          continue;
        }

        // Deflected bullets fly toward the enemy instead of the player.
        if (b.deflected) {
          if (!waveTransitioning && !petPhaseActive) {
            const edx = b.x - enemyEntity.position.x;
            const edy = b.y - enemyEntity.position.y;
            if (Math.sqrt(edx * edx + edy * edy) < ENEMY_HITBOX_R + ENEMY_BULLET_R) {
              removeBullet(enemyBullets, i, enemyBulletsContainer, false);
              enemyHP = Math.max(0, enemyHP - 1);
              hitFlashTimer = 80;
              score += SCORE_PER_HIT;
              sfxEnemyHit();
              core.events.emitSync('particle/emit', {
                config: {
                  x: enemyEntity.position.x + (Math.random() - 0.5) * 30,
                  y: enemyEntity.position.y + (Math.random() - 0.5) * 30,
                  burst: true, burstCount: 8, speed: 90, speedVariance: 40,
                  spread: 180, lifetime: 350, startAlpha: 1, endAlpha: 0,
                  startScale: 1, endScale: 0,
                  startColor: 0xff88cc, endColor: 0xff4488, radius: 4,
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
          continue; // deflected bullets never harm the player
        }

        // Skip collision if invincible
        if (invincibleMs > 0) continue;

        // Hit player
        const dx = b.x - playerEntity.position.x;
        const dy = b.y - playerEntity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ENEMY_BULLET_R + PLAYER_HITBOX_R) {
          removeBullet(enemyBullets, i, enemyBulletsContainer, false);

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
          playerHitThisRun = true;

          // Audio + camera shake on hit
          sfxPlayerHit();
          core.events.emitSync('camera/shake', { intensity: 8, duration: 320 });

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
            playerHitThisRun = true;

            sfxShockwave();
            core.events.emitSync('camera/shake', { intensity: 10, duration: 350 });

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
            sfxBubble();

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

      // ── Move bombs and check fuse ──────────────────────────────────────────
      for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        bomb.x += bomb.vx * (dt / 1000);
        bomb.y += bomb.vy * (dt / 1000);
        bomb.display.x = bomb.x;
        bomb.display.y = bomb.y;
        bomb.fuseMs -= dt;

        // Pulse scale to signal fuse countdown
        const pulseScale = 1 + 0.20 * Math.abs(Math.sin((bomb.fuseMs / BOMB_PULSE_PERIOD_MS) * Math.PI));
        bomb.display.scale.set(pulseScale);

        // Helper: explode this bomb
        const explodeBomb = () => {
          fireRingAt(bomb.x, bomb.y, bomb.ringCount, bomb.ringSpeed, bomb.ringColor);
          core.events.emitSync('particle/emit', {
            config: {
              x: bomb.x, y: bomb.y,
              burst: true, burstCount: 18, speed: 120, speedVariance: 60,
              spread: 180, lifetime: 500, startAlpha: 1, endAlpha: 0,
              startScale: 1.6, endScale: 0,
              startColor: bomb.ringColor, endColor: 0xffffff, radius: 5,
            },
          });
          core.events.emitSync('camera/shake', { intensity: 6, duration: 200 });
          enemyBulletsContainer.removeChild(bomb.display);
          bomb.display.destroy();
          bombs.splice(i, 1);
        };

        // Off-screen: remove without explosion
        if (bomb.x < -40 || bomb.x > W + 40 || bomb.y < -40 || bomb.y > H + 40) {
          enemyBulletsContainer.removeChild(bomb.display);
          bomb.display.destroy();
          bombs.splice(i, 1);
          continue;
        }

        // Fuse expired: explode
        if (bomb.fuseMs <= 0) {
          explodeBomb();
          continue;
        }

        // Collision with player: explode + deal damage
        if (invincibleMs <= 0) {
          const bdx = bomb.x - playerEntity.position.x;
          const bdy = bomb.y - playerEntity.position.y;
          if (Math.sqrt(bdx * bdx + bdy * bdy) < 14 + PLAYER_HITBOX_R) {
            explodeBomb();

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

            playerHP = Math.max(0, playerHP - bulletDamage);
            invincibleMs = effectiveInvincibleMs;
            playerHitThisRun = true;
            sfxPlayerHit();
            core.events.emitSync('camera/shake', { intensity: 10, duration: 350 });
            flashOverlay.clear().rect(0, 0, W, H).fill({ color: COL_BULLET_BOMB, alpha: 1 });
            flashOverlay.alpha = 0.45;
            phaseFlashTimer = Math.max(phaseFlashTimer, 300);
            core.events.emitSync('particle/emit', {
              config: {
                x: playerEntity.position.x, y: playerEntity.position.y,
                burst: true, burstCount: 14, speed: 140, speedVariance: 70,
                spread: 180, lifetime: 500, startAlpha: 1, endAlpha: 0,
                startScale: 1.2, endScale: 0,
                startColor: COL_BULLET_BOMB, endColor: 0xff2200, radius: 5,
              },
            });
            if (playerHP <= 0) { endGame(false); return; }
          }
        }
      }

      // ── Move curving bullets ───────────────────────────────────────────────
      for (let i = curveBullets.length - 1; i >= 0; i--) {
        const cb = curveBullets[i];

        // Turn toward player
        const cpx = playerEntity.position.x;
        const cpy = playerEntity.position.y;
        const targetAngle = Math.atan2(cpy - cb.y, cpx - cb.x);
        let diff = targetAngle - cb.angle;
        while (diff > Math.PI)  diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        const maxTurn = cb.turnRate * (dt / 1000);
        cb.angle += Math.sign(diff) * Math.min(Math.abs(diff), maxTurn);

        // Move
        cb.x += Math.cos(cb.angle) * cb.speed * (dt / 1000);
        cb.y += Math.sin(cb.angle) * cb.speed * (dt / 1000);
        cb.display.x = cb.x;
        cb.display.y = cb.y;

        // Off-screen
        if (cb.x < -30 || cb.x > W + 30 || cb.y < -30 || cb.y > H + 30) {
          enemyBulletsContainer.removeChild(cb.display);
          enemyBulletPool.release(cb.display);
          curveBullets.splice(i, 1);
          continue;
        }

        // Collision with player
        if (invincibleMs <= 0) {
          const ddx = cb.x - cpx;
          const ddy = cb.y - cpy;
          if (Math.sqrt(ddx * ddx + ddy * ddy) < ENEMY_BULLET_R + PLAYER_HITBOX_R) {
            enemyBulletsContainer.removeChild(cb.display);
            enemyBulletPool.release(cb.display);
            curveBullets.splice(i, 1);

            if (evasionChance > 0 && Math.random() < evasionChance) {
              core.events.emitSync('particle/emit', {
                config: {
                  x: cpx, y: cpy,
                  burst: true, burstCount: 6, speed: 80, speedVariance: 30,
                  spread: 180, lifetime: 300, startAlpha: 0.9, endAlpha: 0,
                  startScale: 0.9, endScale: 0,
                  startColor: 0x00ffaa, endColor: 0x00cc88, radius: 4,
                },
              });
              continue;
            }

            playerHP = Math.max(0, playerHP - bulletDamage);
            invincibleMs = effectiveInvincibleMs;
            playerHitThisRun = true;
            sfxPlayerHit();
            core.events.emitSync('camera/shake', { intensity: 8, duration: 300 });
            flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0xff44cc, alpha: 1 });
            flashOverlay.alpha = 0.38;
            phaseFlashTimer = Math.max(phaseFlashTimer, 280);
            core.events.emitSync('particle/emit', {
              config: {
                x: cpx, y: cpy,
                burst: true, burstCount: 12, speed: 130, speedVariance: 60,
                spread: 180, lifetime: 450, startAlpha: 1, endAlpha: 0,
                startScale: 1.1, endScale: 0,
                startColor: 0xff44cc, endColor: 0xaa0088, radius: 5,
              },
            });
            if (playerHP <= 0) { endGame(false); return; }
          }
        }
      }

      // ── Update laser beams ──────────────────────────────────────────────
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.phaseMs -= dt;

        if (laser.phase === 'warning') {
          // Thin flashing line + warning diamond at the top
          const elapsed = LASER_WARNING_MS_BEAM - laser.phaseMs;
          const alpha = 0.3 + 0.4 * Math.abs(Math.sin((elapsed / 120) * Math.PI));
          laser.display.clear();
          laser.display.rect(laser.x - 1, 0, 2, H)
            .fill({ color: laser.color, alpha });
          // Warning diamond marker
          laser.display
            .moveTo(laser.x,      18)
            .lineTo(laser.x + 9,  30)
            .lineTo(laser.x,      42)
            .lineTo(laser.x - 9,  30)
            .closePath()
            .fill({ color: laser.color, alpha });

          if (laser.phaseMs <= 0) {
            laser.phase = 'active';
            laser.phaseMs = LASER_ACTIVE_MS_BEAM;
          }
        } else if (laser.phase === 'active') {
          // Wide glowing beam
          laser.display.clear();
          laser.display.rect(laser.x - LASER_BEAM_HALF_W - 8, 0, (LASER_BEAM_HALF_W + 8) * 2, H)
            .fill({ color: laser.color, alpha: 0.15 });
          laser.display.rect(laser.x - LASER_BEAM_HALF_W, 0, LASER_BEAM_HALF_W * 2, H)
            .fill({ color: laser.color, alpha: 0.65 });
          laser.display.rect(laser.x - 3, 0, 6, H)
            .fill({ color: 0xffffff, alpha: 0.90 });

          // Collision: check if player is within the beam's width
          if (!laser.hitDealt && invincibleMs <= 0) {
            const cpx = playerEntity.position.x;
            const cpy = playerEntity.position.y;
            if (Math.abs(cpx - laser.x) < LASER_BEAM_HALF_W + PLAYER_HITBOX_R) {
              laser.hitDealt = true;

              if (evasionChance > 0 && Math.random() < evasionChance) {
                core.events.emitSync('particle/emit', {
                  config: {
                    x: cpx, y: cpy,
                    burst: true, burstCount: 6, speed: 80, speedVariance: 30,
                    spread: 180, lifetime: 300, startAlpha: 0.9, endAlpha: 0,
                    startScale: 0.9, endScale: 0,
                    startColor: 0x00ffaa, endColor: 0x00cc88, radius: 4,
                  },
                });
              } else {
                playerHP = Math.max(0, playerHP - 1);
                invincibleMs = effectiveInvincibleMs;
                playerHitThisRun = true;
                sfxPlayerHit();
                core.events.emitSync('camera/shake', { intensity: 10, duration: 350 });
                flashOverlay.clear().rect(0, 0, W, H).fill({ color: 0x00ffff, alpha: 1 });
                flashOverlay.alpha = 0.42;
                phaseFlashTimer = Math.max(phaseFlashTimer, 300);
                core.events.emitSync('particle/emit', {
                  config: {
                    x: cpx, y: cpy,
                    burst: true, burstCount: 14, speed: 120, speedVariance: 60,
                    spread: 180, lifetime: 500, startAlpha: 1, endAlpha: 0,
                    startScale: 1.2, endScale: 0,
                    startColor: 0x00ffff, endColor: 0x0088aa, radius: 5,
                  },
                });
                if (playerHP <= 0) { endGame(false); return; }
              }
            }
          }

          if (laser.phaseMs <= 0) {
            laser.phase = 'fading';
            laser.phaseMs = LASER_FADE_MS_BEAM;
          }
        } else {
          // Fading: draw at reduced alpha
          const alpha = laser.phaseMs / LASER_FADE_MS_BEAM;
          laser.display.clear();
          laser.display.rect(laser.x - LASER_BEAM_HALF_W - 8, 0, (LASER_BEAM_HALF_W + 8) * 2, H)
            .fill({ color: laser.color, alpha: 0.15 * alpha });
          laser.display.rect(laser.x - LASER_BEAM_HALF_W, 0, LASER_BEAM_HALF_W * 2, H)
            .fill({ color: laser.color, alpha: 0.65 * alpha });
          laser.display.rect(laser.x - 3, 0, 6, H)
            .fill({ color: 0xffffff, alpha: 0.90 * alpha });

          if (laser.phaseMs <= 0) {
            lasersContainer.removeChild(laser.display);
            laser.display.destroy();
            lasers.splice(i, 1);
          }
        }
      }

      // ── Move and collect items ────────────────────────────────────────────
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.lifetime -= dt;

        // ── Fox costume: attract items within radius toward player ──────────
        if (isFoxCostume) {
          const adx = playerEntity.position.x - item.x;
          const ady = playerEntity.position.y - item.y;
          const aDist = Math.sqrt(adx * adx + ady * ady);
          if (aDist < FOX_ATTRACT_RADIUS && aDist > 1) {
            const pull = FOX_ATTRACT_ACCEL * (dt / 1000);
            item.vx += (adx / aDist) * pull;
            item.vy += (ady / aDist) * pull;
            // Cap speed so items don't overshoot wildly
            const spd = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
            const maxSpd = devConfig.itemFallSpeed * 3;
            if (spd > maxSpd) {
              item.vx = (item.vx / spd) * maxSpd;
              item.vy = (item.vy / spd) * maxSpd;
            }
          }
        }

        // Move (apply velocity)
        item.x += item.vx * (dt / 1000);
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
          } else if (item.type === 'gift') {
            // Moose costume gift box: apply a random buff
            const picked = pickRandomBuffs(1, [...(isEndless ? endlessState.buffs : []), ...giftBuffs]);
            if (picked.length > 0) {
              applyGiftBuff(picked[0].id);
            }
          } else {
            powerUpTimer = POWER_UP_DURATION_MS;
          }
          // fortune skill: 25% chance to heal 1 HP on any pickup
          if (skillState.selected === 'fortune' && Math.random() < 0.25 && playerHP < effectiveHpMax) {
            playerHP = Math.min(effectiveHpMax, playerHP + 1);
            core.events.emitSync('particle/emit', {
              config: {
                x: item.x, y: item.y,
                burst: true, burstCount: 8, speed: 80, speedVariance: 30,
                spread: 180, lifetime: 350, startAlpha: 0.9, endAlpha: 0,
                startScale: 1.0, endScale: 0,
                startColor: 0xffaa22, endColor: 0xff6600, radius: 4,
              },
            });
          }
          sfxPickup();
          core.events.emitSync('game/item:collected', {});
          // Sparkle burst on collect
          const sparkleStart = item.type === 'gift' ? 0xffdd00 : item.type === 'health' ? 0x00ff88 : 0xffee44;
          const sparkleEnd   = item.type === 'gift' ? 0xff8800 : item.type === 'health' ? 0x00cc55 : 0xff8800;
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
              startColor: sparkleStart,
              endColor: sparkleEnd,
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

    sfxWaveClear();
    core.events.emitSync('camera/shake', { intensity: 10, duration: 400 });

    // Clear all enemy bullets (return to pool)
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(enemyBullets[i].display);
      enemyBulletPool.release(enemyBullets[i].display);
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

    // Clear bombs
    for (let i = bombs.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(bombs[i].display);
      bombs[i].display.destroy();
    }
    bombs.length = 0;

    // Clear curving bullets
    for (let i = curveBullets.length - 1; i >= 0; i--) {
      enemyBulletsContainer.removeChild(curveBullets[i].display);
      enemyBulletPool.release(curveBullets[i].display);
    }
    curveBullets.length = 0;

    // Clear laser beams
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasersContainer.removeChild(lasers[i].display);
      lasers[i].display.destroy();
    }
    lasers.length = 0;

    // Clear any leftover items between waves
    for (let i = items.length - 1; i >= 0; i--) {
      itemsContainer.removeChild(items[i].display);
      items[i].display.destroy();
    }
    items.length = 0;

    // Clear any pet guardians (safety — normally they are only on last wave)
    for (let i = pets.length - 1; i >= 0; i--) {
      petsContainer.removeChild(pets[i].display);
      petsContainer.removeChild(pets[i].hpBarContainer);
      pets[i].display.destroy();
    }
    pets.length = 0;
    petPhaseActive = false;
    petPhaseTriggered = false;
    petBannerTimer = 0;
    waveBannerText.alpha = 0;

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

    // Restore 2 HP to the player on wave clear (capped at effective max)
    playerHP = Math.min(effectiveHpMax, playerHP + 2);
    phase = 1;
    spiralTimer = 0;
    aimTimer = 0;
    spreadTimer = 0;
    ringTimer = 0;
    shockwaveTimer = 0;
    bubbleTimer = 0;
    bombTimer = 0;
    laserTimer = 0;
    curveTimer = 0;
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

    sfxWaveClear();
    core.events.emitSync('camera/shake', { intensity: 10, duration: 400 });

    // Fire endless wave achievement event
    core.events.emitSync('game/endless_wave', { wave: endlessState.wave });

    // Show wave-clear banner briefly
    waveBannerText.text = `第 ${endlessState.wave} 波通關！`;
    waveBannerText.alpha = 1;

    await new Promise<void>((resolve) => setTimeout(resolve, 1400));

    waveBannerText.alpha = 0;

    // Store accumulated score
    gameResult.score = score;
    if (score > endlessState.highScore) endlessState.highScore = score;

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

    await saveProgress();
    await core.events.emit('scene/load', { key: 'endlessbuff' });
  }

  // ── End game ────────────────────────────────────────────────────────────────
  async function endGame(won: boolean): Promise<void> {
    if (gameEnded) return;
    gameEnded = true;

    gameResult.won = won;
    gameResult.score = score;

    if (isEndless) {
      // In endless mode, record the wave reached, update endless high score, and reset the session
      if (score > endlessState.highScore) endlessState.highScore = score;
      if (endlessState.wave > endlessState.bestWave) {
        endlessState.bestWave = endlessState.wave;
      }
      endlessState.currentHp = 0; // reset for next attempt
      endlessState.score = 0;
      endlessState.periodicShieldTimer = 0;
      endlessState.regenTimer = 0;
      gameResult.playedLevel = 0; // signals "endless mode" to GameOverScene
    } else {
      // Update per-level high score
      const lvl = gameResult.currentLevel;
      if (score > (gameResult.levelHighScores[lvl] ?? 0)) {
        gameResult.levelHighScores[lvl] = score;
      }
      // Advance level on win, reset on loss
      if (won) {
        gameResult.playedLevel = gameResult.currentLevel;
        // Track cleared level for costume unlock system
        const isNewClear = !costumeState.clearedLevels.has(gameResult.currentLevel);
        costumeState.clearedLevels.add(gameResult.currentLevel);
        gameResult.currentLevel = Math.min(gameResult.currentLevel + 1, TOTAL_LEVELS);

        // Achievement events
        core.events.emitSync('game/win', { isNewClear });
        if (!playerHitThisRun) {
          core.events.emitSync('game/no_damage_win', {});
        }
      } else {
        gameResult.playedLevel = gameResult.currentLevel;
      }
    }

    // Audio feedback + camera shake
    if (won) {
      sfxVictory();
      core.events.emitSync('camera/shake', { intensity: 14, duration: 500 });
      // Big explosion on enemy
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
    } else {
      sfxDefeat();
      core.events.emitSync('camera/shake', { intensity: 16, duration: 600 });
    }

    stopBgm();

    await saveProgress();

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

    // Destroy all bullets (return to pools)
    for (const b of playerBullets) {
      playerBulletsContainer.removeChild(b.display);
      playerBulletPool.release(b.display);
    }
    for (const b of enemyBullets) {
      enemyBulletsContainer.removeChild(b.display);
      enemyBulletPool.release(b.display);
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

    // Destroy all bombs
    for (const bomb of bombs) {
      enemyBulletsContainer.removeChild(bomb.display);
      bomb.display.destroy();
    }
    bombs.length = 0;

    // Destroy all curving bullets
    for (const cb of curveBullets) {
      enemyBulletsContainer.removeChild(cb.display);
      enemyBulletPool.release(cb.display);
    }
    curveBullets.length = 0;

    // Destroy all laser beams
    for (const laser of lasers) {
      lasersContainer.removeChild(laser.display);
      laser.display.destroy();
    }
    lasers.length = 0;

    // Destroy all items
    for (const item of items) {
      itemsContainer.removeChild(item.display);
      item.display.destroy();
    }
    items.length = 0;

    // Destroy all pet guardians
    for (const pet of pets) {
      petsContainer.removeChild(pet.display);
      petsContainer.removeChild(pet.hpBarContainer);
      pet.display.destroy();
    }
    pets.length = 0;

    // Destroy entities
    core.events.emitSync('entity/destroy', { id: 'player' });
    core.events.emitSync('entity/destroy', { id: 'enemy' });

    // Destroy world objects
    worldLayer.removeChild(stars, scrollA, scrollB, playerBulletsContainer, itemsContainer, enemyBulletsContainer, shockwavesContainer, bubblesContainer, lasersContainer, petsContainer, trapRing, deflectRing);
    stars.destroy({ children: true });
    scrollA.destroy({ children: true });
    scrollB.destroy({ children: true });
    playerBulletsContainer.destroy({ children: true });
    itemsContainer.destroy({ children: true });
    enemyBulletsContainer.destroy({ children: true });
    shockwavesContainer.destroy({ children: true });
    bubblesContainer.destroy({ children: true });
    lasersContainer.destroy({ children: true });
    petsContainer.destroy({ children: true });
    trapRing.destroy();
    deflectRing.destroy();

    // Destroy UI
    uiLayer.removeChild(heartsContainer, hpBarContainer, bossLabel, scoreText, phaseText, levelWaveText, waveBannerText, powerUpText, trappedTimerText, shieldTimerText, regenTimerText, skillTimerText, deflectTimerText, wizardTimerText, skillBtnContainer, costumeBtnContainer);
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
    skillTimerText.destroy();
    deflectTimerText.destroy();
    wizardTimerText.destroy();
    skillBtnContainer.destroy({ children: true });
    costumeBtnContainer.destroy({ children: true });

    sysLayer.removeChild(flashOverlay);
    flashOverlay.destroy();

    // Cleanup BGM
    stopBgm();
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
