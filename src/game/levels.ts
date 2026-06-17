import {
  BULLET_SPEED_SLOW,
  BULLET_SPEED_MEDIUM,
  BULLET_SPEED_FAST,
  COL_BULLET_P1,
  COL_BULLET_P2,
  COL_BULLET_P3,
  COL_BULLET_RING,
  COL_SHOCKWAVE,
  COL_BUBBLE,
  COL_BULLET_BOMB,
  COL_BULLET_LASER,
  COL_BULLET_CURVE,
  COL_BULLET_MECH,
  COL_BULLET_STORM,
  COL_BULLET_FLAME,
  COL_BULLET_SNIPER,
  SHOCKWAVE_EXPAND_SPEED,
  BUBBLE_SPEED,
  PHASE2_FRAC,
  PHASE3_FRAC,
  TELEPORT_WARN_MS,
  SNIPER_WARN_MS,
} from '../constants';
import type { EnemyType, MobSpriteId } from '../constants';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Bullet-pattern settings for a single phase of one wave. A timer value of 0 disables that pattern. */
export interface WavePhaseConfig {
  spiralInterval: number;   // ms between spiral fires; 0 = disabled
  spiralWays: number;
  spiralSpeed: number;
  spiralColor: number;

  aimInterval: number;      // ms between aimed fires; 0 = disabled
  aimWays: number;
  aimSpread: number;        // radians of total spread
  aimSpeed: number;
  aimColor: number;

  spreadInterval: number;   // ms between spread fires; 0 = disabled
  spreadWays: number;
  spreadAngle: number;
  spreadSpeed: number;
  spreadColor: number;

  ringInterval: number;     // ms between ring fires; 0 = disabled
  ringCount: number;
  ringSpeed: number;
  ringColor: number;

  shockwaveInterval: number; // ms between shockwave fires; 0 = disabled
  shockwaveSpeed: number;    // px/s expansion speed
  shockwaveColor: number;

  bubbleInterval: number;    // ms between bubble volleys; 0 = disabled
  bubbleCount: number;       // bubbles per volley
  bubbleSpeed: number;       // px/s travel speed
  bubbleColor: number;

  // ── New attack types ──────────────────────────────────────────────────────

  bombInterval: number;      // ms between bomb volleys; 0 = disabled
  bombCount: number;         // bombs per volley
  bombFuseMs: number;        // ms until the bomb explodes
  bombRingCount: number;     // bullets spawned in the explosion ring
  bombRingSpeed: number;     // px/s speed of explosion ring bullets
  bombColor: number;

  laserInterval: number;     // ms between laser columns; 0 = disabled
  laserCount: number;        // bullets per column
  laserSpeed: number;        // px/s downward speed
  laserColor: number;

  curveInterval: number;     // ms between curving-bullet volleys; 0 = disabled
  curveWays: number;         // curving bullets per volley
  curveSpeed: number;        // px/s travel speed
  curveTurnRate: number;     // radians/s to turn toward the player
  curveColor: number;

  straightInterval: number;  // ms between straight-down volleys; 0 = disabled
  straightCount: number;     // bullets per volley (spread horizontally)
  straightSpeed: number;     // px/s downward speed
  straightColor: number;

  // ── Flame burst attack (dragon) ──────────────────────────────────────────
  flameInterval: number;    // ms between flame volleys; 0 = disabled
  flameWaves: number;       // sequential bursts per volley
  flameWaveGapMs: number;   // ms between bursts within a volley
  flameCount: number;       // bullets per burst (fan)
  flameSpeed: number;       // px/s
  flameColor: number;

  // ── Ground slam attack (dragon / chaos) ──────────────────────────────────
  groundSlamInterval: number; // ms between ground slam volleys; 0 = disabled
  groundSlamRings: number;    // concentric rings per volley
  groundSlamGapMs: number;    // ms between rings within a volley
  groundSlamSpeed: number;    // px/s expansion speed
  groundSlamColor: number;

  // ── Scatter attack (storm / chaos) ──────────────────────────────────────
  scatterInterval: number;  // ms between scatter volleys; 0 = disabled
  scatterCount: number;     // bullets per volley
  scatterSpeedMin: number;  // px/s minimum speed
  scatterSpeedMax: number;  // px/s maximum speed
  scatterColor: number;

  // ── Sniper aim attack (mech enhanced / dragon) ────────────────────────────
  sniperInterval: number;   // ms between sniper shots; 0 = disabled
  sniperWarnMs: number;     // warning duration before firing
  sniperSpeed: number;      // px/s bullet speed
  sniperColor: number;

  // ── Teleport attack (storm phase 3) ──────────────────────────────────────
  teleportInterval: number; // ms between teleports; 0 = disabled
}

/** Configuration for a group of smaller enemies that must all be defeated to clear a wave. */
export interface MobGroupConfig {
  /** Display label shown in the HP bar for this encounter. */
  label: string;
  /** Visual silhouette used by the mobs. Defaults to chicklet. */
  mobSprite?: MobSpriteId;
  /** Primary body colour for the mob sprite. */
  bodyColor?: number;
  /** Accent / glow colour for the mob sprite. */
  accentColor?: number;
  /** Number of mobs spawned at the start of the wave. */
  count: number;
  /** HP for each individual mob. */
  mobHp: number;
  /** Collision radius for each mob. Defaults to 26 px. */
  hitboxRadius?: number;
  /** Visual scale applied to the mob sprite. Defaults to 1.0. */
  displayScale?: number;
  /** Horizontal formation shape. Defaults to a straight line. */
  layout?: 'line' | 'arc';
  /** Movement style used by the group. Defaults to sine. */
  movementPattern?: 'sine' | 'zigzag' | 'dive' | 'orbit';
  /** Attack style used by each mob volley. Defaults to aimed. */
  attackPattern?: 'aimed' | 'straight' | 'ring' | 'split';
  /** Vertical spawn position as a fraction of screen height. Defaults to 0.2. */
  yFrac?: number;
  /** Horizontal patrol amplitude in px. Defaults to 24. */
  moveAmplitude?: number;
  /** Vertical patrol amplitude in px. Defaults to 8. */
  verticalAmplitude?: number;
  /** Patrol period in ms. Defaults to 2400. */
  movePeriodMs?: number;
  /** Delay before each mob's first shot, staggered by mob index. Defaults to 500 ms. */
  initialFireDelayMs?: number;
  /** Interval between shots for each mob. */
  fireInterval: number;
  /** Bullets fired per volley. */
  bulletWays: number;
  /** Radian spread between bullets in a volley. */
  bulletSpread: number;
  /** Bullet speed in px/s. */
  bulletSpeed: number;
  /** Bullet colour for mob volleys. */
  bulletColor: number;
}

/** Configuration for one enemy encounter (wave) within a level. */
export interface WaveConfig {
  waveNumber: number;   // 1-based display number
  enemyHp: number;      // Boss HP, or total encounter HP for mob-group waves
  phase2Frac: number;   // HP fraction at which phase 2 starts
  phase3Frac: number;   // HP fraction at which phase 3 starts
  phases: [WavePhaseConfig, WavePhaseConfig, WavePhaseConfig]; // [phase1, phase2, phase3]
  /** Optional mob encounter; when set, this wave spawns several smaller enemies instead of the boss. */
  mobGroup?: MobGroupConfig;
  /**
   * When true the enemy smoothly tracks the player's X position (horizontally)
   * during gameplay, creating a "left-right swaying tracking" movement pattern.
   * Defaults to false when omitted.
   */
  enemyTracksPlayer?: boolean;
  /**
   * When true the enemy oscillates horizontally in a sinusoidal pattern.
   * Configure the amplitude and period with the fields below.
   * Defaults to false when omitted.
   */
  enemySineMoves?: boolean;
  /** Horizontal amplitude (px) for sine-wave movement. Default: 120. */
  enemySineAmplitude?: number;
  /** Full oscillation period (ms) for sine-wave movement. Default: 2000. */
  enemySinePeriodMs?: number;
}

/** Configuration for a complete level. */
export interface LevelConfig {
  levelNumber: number;
  name: string;
  /** Determines which enemy sprite & mechanics theme is active. */
  enemyType: EnemyType;
  waves: WaveConfig[];
  /**
   * Optional final-phase guardian encounter. This keeps boss-specific phase-3
   * events data-driven instead of hard-coded by level number in GameScene.
   */
  guardianPetFinale?: 'chaos' | 'dragon';
  /**
   * Multiplier applied to item spawn intervals (< 1 = more frequent drops).
   * Defaults to 1.0 when omitted.
   */
  itemDropMult?: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function phase(overrides: Partial<WavePhaseConfig>): WavePhaseConfig {
  return {
    spiralInterval: 0,
    spiralWays: 0,
    spiralSpeed: BULLET_SPEED_SLOW,
    spiralColor: COL_BULLET_P1,
    aimInterval: 0,
    aimWays: 0,
    aimSpread: 0.25,
    aimSpeed: BULLET_SPEED_MEDIUM,
    aimColor: COL_BULLET_P1,
    spreadInterval: 0,
    spreadWays: 0,
    spreadAngle: 0.22,
    spreadSpeed: BULLET_SPEED_SLOW,
    spreadColor: COL_BULLET_P1,
    ringInterval: 0,
    ringCount: 0,
    ringSpeed: BULLET_SPEED_MEDIUM,
    ringColor: COL_BULLET_RING,
    shockwaveInterval: 0,
    shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,
    shockwaveColor: COL_SHOCKWAVE,
    bubbleInterval: 0,
    bubbleCount: 1,
    bubbleSpeed: BUBBLE_SPEED,
    bubbleColor: COL_BUBBLE,
    bombInterval: 0,
    bombCount: 1,
    bombFuseMs: 2500,
    bombRingCount: 8,
    bombRingSpeed: BULLET_SPEED_MEDIUM,
    bombColor: COL_BULLET_BOMB,
    laserInterval: 0,
    laserCount: 6,
    laserSpeed: BULLET_SPEED_FAST,
    laserColor: COL_BULLET_LASER,
    curveInterval: 0,
    curveWays: 2,
    curveSpeed: BULLET_SPEED_SLOW + 20,
    curveTurnRate: 1.2,
    curveColor: COL_BULLET_CURVE,
    straightInterval: 0,
    straightCount: 3,
    straightSpeed: BULLET_SPEED_FAST,
    straightColor: COL_BULLET_MECH,
    flameInterval: 0,
    flameWaves: 3,
    flameWaveGapMs: 200,
    flameCount: 5,
    flameSpeed: BULLET_SPEED_MEDIUM,
    flameColor: COL_BULLET_FLAME,
    groundSlamInterval: 0,
    groundSlamRings: 3,
    groundSlamGapMs: 180,
    groundSlamSpeed: BULLET_SPEED_SLOW,
    groundSlamColor: COL_BULLET_RING,
    scatterInterval: 0,
    scatterCount: 10,
    scatterSpeedMin: BULLET_SPEED_SLOW,
    scatterSpeedMax: BULLET_SPEED_FAST,
    scatterColor: COL_BULLET_STORM,
    sniperInterval: 0,
    sniperWarnMs: SNIPER_WARN_MS,
    sniperSpeed: BULLET_SPEED_FAST * 2,
    sniperColor: COL_BULLET_SNIPER,
    teleportInterval: 0,
    ...overrides,
  };
}

// ─── Level 1 · 初級挑戰 (mob warm-up + boss) ──────────────────────────────────

const LEVEL_1: LevelConfig = {
  levelNumber: 1,
  name: '初級挑戰',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 120,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      mobGroup: {
        label: '勇氣小隊',
        mobSprite: 'chicklet',
        bodyColor: 0xffcc44,
        accentColor: 0xff4444,
        count: 3,
        mobHp: 40,
        hitboxRadius: 24,
        displayScale: 0.95,
        layout: 'line',
        movementPattern: 'zigzag',
        attackPattern: 'aimed',
        yFrac: 0.20,
        moveAmplitude: 44,
        verticalAmplitude: 10,
        movePeriodMs: 2600,
        initialFireDelayMs: 650,
        fireInterval: 1550,
        bulletWays: 1,
        bulletSpread: 0.22,
        bulletSpeed: BULLET_SPEED_SLOW,
        bulletColor: COL_BULLET_P1,
      },
      phases: [phase({}), phase({}), phase({})],
    },
    {
      waveNumber: 2,
      enemyHp: 200,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 240, spiralWays: 5, spiralSpeed: BULLET_SPEED_SLOW, spiralColor: COL_BULLET_P1,
          aimInterval: 1400,   aimWays: 2,   aimSpread: 0.25,                 aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P1,
        }),
        phase({
          spiralInterval: 180, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 900,    aimWays: 3,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1600, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 110, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST, spiralColor: COL_BULLET_P3,
          aimInterval: 600,    aimWays: 3,     aimSpread: 0.20,                 aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 800, spreadWays: 7,  spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_SLOW,   spreadColor: COL_BULLET_P3,
          ringInterval: 3200,  ringCount: 24,  ringSpeed: BULLET_SPEED_MEDIUM,  ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

// ─── Level 2 · 中級考驗 (2 waves) ─────────────────────────────────────────────

const LEVEL_2: LevelConfig = {
  levelNumber: 2,
  name: '中級考驗',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 180,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 7,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P1,
          aimInterval: 1100,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P1,
          spreadInterval: 2000, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P1,
        }),
        phase({
          spiralInterval: 160, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 750,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1200, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          ringInterval: 4000,   ringCount: 20, ringSpeed: BULLET_SPEED_SLOW,     ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 100, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 500,    aimWays: 5,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 700, spreadWays: 8,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 2500,  ringCount: 32,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 200,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 180, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1000,   aimWays: 3,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1600, spreadWays: 5, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 150, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 700,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1100, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3500,   ringCount: 24, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 90,  spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 450,    aimWays: 5,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 600, spreadWays: 9,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 2200,  ringCount: 36,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

// ─── Level 3 · 終極試煉 (3 waves) ─────────────────────────────────────────────
// Difficulty tuned down ~25 % vs original; new bomb / laser / curve attacks
// are introduced from phase 2 onward to add variety without overwhelming density.

const LEVEL_3: LevelConfig = {
  levelNumber: 3,
  name: '終極試煉',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 200,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 220, spiralWays: 7,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1300,   aimWays: 3,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 2400, spreadWays: 5, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 185, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 950,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1450, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 4000,   ringCount: 22, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          bombInterval: 8000,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
        }),
        phase({
          spiralInterval: 120, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 580,    aimWays: 5,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 800, spreadWays: 8,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2800,  ringCount: 32,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          bombInterval: 6000,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5000, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 5500, curveWays: 2,  curveSpeed: 160, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 190,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 210, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1200,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 2000, spreadWays: 5, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          ringInterval: 6000,   ringCount: 16, ringSpeed: BULLET_SPEED_SLOW,     ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 175, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 840,    aimWays: 4,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1350, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3750,   ringCount: 26, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          bombInterval: 7000,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6000, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 112, spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 520,    aimWays: 6,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 720, spreadWays: 9,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 2250,  ringCount: 35,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          bombInterval: 5000,  bombCount: 2, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4500, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4000, curveWays: 2,  curveSpeed: 160, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 210,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 1150,   aimWays: 4,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1750, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 4700,   ringCount: 19, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          bombInterval: 9000,  bombCount: 1, bombFuseMs: 2400, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
        }),
        phase({
          spiralInterval: 160, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 780,    aimWays: 5,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1200, spreadWays: 7, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3250,   ringCount: 29, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          bombInterval: 6500,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5500, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 100, spiralWays: 18, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 490,    aimWays: 6,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 680, spreadWays: 10, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2000,  ringCount: 38,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          bombInterval: 5000,  bombCount: 2, bombFuseMs: 1900, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4000, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3500, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.4, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
  ],
};

// ─── Level 4 · 幽靈試煉 (3 waves, Phantom enemy) ──────────────────────────────
// Difficulty reduced ~20 % vs original; bomb, laser and curve attacks added
// from phase 1 onward; shockwave / bubble retained for phantom flavour.

const LEVEL_4: LevelConfig = {
  levelNumber: 4,
  name: '幽靈試煉',
  enemyType: 'phantom',
  itemDropMult: 0.65,
  waves: [
    {
      waveNumber: 1,
      enemyHp: 240,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1150,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 2000, spreadWays: 5, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          bombInterval: 8500,  bombCount: 1, bombFuseMs: 2400, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 7000, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 165, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 880,    aimWays: 4,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1500, spreadWays: 6, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 4400,   ringCount: 22, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 6000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED, shockwaveColor: COL_SHOCKWAVE,
          bombInterval: 7000,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5500, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 115, spiralWays: 13, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 600,    aimWays: 5,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 940, spreadWays: 7,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2750,  ringCount: 29,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4400, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5600, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
          bombInterval: 5500,  bombCount: 1, bombFuseMs: 1900, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4200, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4500, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 220,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 190, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1060,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1750, spreadWays: 6, spreadAngle: 0.24, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 6800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,       shockwaveColor: COL_SHOCKWAVE,
          bombInterval: 8000,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6500, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 150, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 812,    aimWays: 4,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1250, spreadWays: 6, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3750,   ringCount: 25, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 5000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6200, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
          bombInterval: 6500,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5000, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 5500, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 100, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 525,    aimWays: 5,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 775, spreadWays: 8,  spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2375,  ringCount: 32,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3750, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4375, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
          bombInterval: 5000,  bombCount: 2, bombFuseMs: 1900, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4000, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3800, curveWays: 2,  curveSpeed: 170, curveTurnRate: 1.5, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 255,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 175, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1000,   aimWays: 4,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1625, spreadWays: 6, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 5625, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,       shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 7500, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
          bombInterval: 7500,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6000, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 6500, curveWays: 2,  curveSpeed: 160, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 138, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 725,    aimWays: 5,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1062, spreadWays: 7, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3125,   ringCount: 29, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4375, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
          bombInterval: 6000,  bombCount: 2, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4500, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4500, curveWays: 2,  curveSpeed: 170, curveTurnRate: 1.5, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 94,  spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 475,    aimWays: 5,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 650, spreadWays: 9,  spreadAngle: 0.14, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2000,  ringCount: 35,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3500, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
          bombInterval: 4500,  bombCount: 2, bombFuseMs: 1800, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 3500, laserCount: 7, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3500, curveWays: 3,  curveSpeed: 175, curveTurnRate: 1.6, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
  ],
};

// ─── Level 5 · 混沌深淵 (4 waves, Chaos enemy) ────────────────────────────────
// All patterns active from phase 1; difficulty scaled down ~15 % vs original.
// New bomb / laser / curve attacks layered on top for maximum variety.

const LEVEL_5: LevelConfig = {
  levelNumber: 5,
  name: '混沌深淵',
  enemyType: 'chaos',
  guardianPetFinale: 'chaos',
  itemDropMult: 0.65,
  waves: [
    {
      waveNumber: 1,
      enemyHp: 280,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 228, spiralWays: 8,  spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1222,   aimWays: 3,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 2145, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P2,
          ringInterval: 5330,   ringCount: 20, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 6890, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 9100, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
          bombInterval: 9750,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 7800, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 8450, curveWays: 2,  curveSpeed: 160, curveTurnRate: 1.0, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 183, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 918,    aimWays: 4,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1529, spreadWays: 5, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3823,  ringCount: 24,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 5353, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6882, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
          bombInterval: 7800,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6110, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 6500, curveWays: 2,  curveSpeed: 170, curveTurnRate: 1.1, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 122, spiralWays: 13, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 611,    aimWays: 5,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 857,  spreadWays: 8, spreadAngle: 0.15, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2600,  ringCount: 33,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3977, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 60,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4588, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
          bombInterval: 5850,  bombCount: 1, bombFuseMs: 1800, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4550, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4550, curveWays: 2,  curveSpeed: 180, curveTurnRate: 1.35, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 260,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 221, spiralWays: 9,  spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1147,   aimWays: 3,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1988, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P2,
          ringInterval: 4895,   ringCount: 20, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 6423, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 8412, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
          bombInterval: 9100,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 7150, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 7800, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.0, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 176, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 857,    aimWays: 4,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1346, spreadWays: 6, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3364,  ringCount: 27,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4895, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6118, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
          bombInterval: 7150,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5460, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 5850, curveWays: 2,  curveSpeed: 175, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 114, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 566,    aimWays: 5,     aimSpread: 0.16,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 764,  spreadWays: 9, spreadAngle: 0.13, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2295,  ringCount: 36,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3671, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 70,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3977, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 25,  bubbleColor: COL_BUBBLE,
          bombInterval: 5200,  bombCount: 1, bombFuseMs: 1700, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4160, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4160, curveWays: 2,  curveSpeed: 185, curveTurnRate: 1.5, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 295,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 207, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 1101,   aimWays: 4,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1836, spreadWays: 5, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 4588,   ringCount: 22, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 6118, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 7647, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
          bombInterval: 8450,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6500, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 7150, curveWays: 2,  curveSpeed: 170, curveTurnRate: 1.1, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 161, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 826,    aimWays: 5,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1255, spreadWays: 7, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3059,  ringCount: 30,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4588, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 60,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5353, bubbleCount: 3, bubbleSpeed: BULLET_SPEED_SLOW + 5,   bubbleColor: COL_BUBBLE,
          bombInterval: 6500,  bombCount: 1, bombFuseMs: 1800, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4940, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 5200, curveWays: 2,  curveSpeed: 180, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 104, spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 536,    aimWays: 5,     aimSpread: 0.14,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 703,  spreadWays: 10, spreadAngle: 0.12, spreadSpeed: BULLET_SPEED_FAST,  spreadColor: COL_BULLET_P3,
          ringInterval: 2064,  ringCount: 38,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3364, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 80,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3671, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 28,  bubbleColor: COL_BUBBLE,
          bombInterval: 4940,  bombCount: 2, bombFuseMs: 1600, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 3640, laserCount: 7, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3640, curveWays: 2,  curveSpeed: 190, curveTurnRate: 1.65, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 4,
      enemyHp: 280,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 199, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 1040,   aimWays: 4,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1682, spreadWays: 6, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 4282,   ringCount: 23, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 5812, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6882, bubbleCount: 2, bubbleSpeed: BULLET_SPEED_SLOW,  bubbleColor: COL_BUBBLE,
          bombInterval: 7800,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6110, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 6500, curveWays: 2,  curveSpeed: 170, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 153, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 764,    aimWays: 5,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1162, spreadWays: 7, spreadAngle: 0.15, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2753,  ringCount: 32,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4282, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 70,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4895, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 22,  bubbleColor: COL_BUBBLE,
          bombInterval: 5850,  bombCount: 1, bombFuseMs: 1800, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4550, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4940, curveWays: 2,  curveSpeed: 185, curveTurnRate: 1.45, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 95,  spiralWays: 18, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 504,    aimWays: 6,     aimSpread: 0.13,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 658,  spreadWays: 10, spreadAngle: 0.11, spreadSpeed: BULLET_SPEED_FAST,  spreadColor: COL_BULLET_P3,
          ringInterval: 1912,  ringCount: 40,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3059, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 90,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3364, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 30,  bubbleColor: COL_BUBBLE,
          bombInterval: 4550,  bombCount: 2, bombFuseMs: 1600, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 3510, laserCount: 7, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3510, curveWays: 3,  curveSpeed: 195, curveTurnRate: 1.65, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
  ],
};

// ─── Level 6 · 機甲試煉 (2 waves) ─────────────────────────────────────────────
// Wave 1: Mech Drone Squad – several smaller drones fan out before the boss.
// Wave 2: Mech Chicken BOSS – full arsenal with straight-down curtains.

const LEVEL_6: LevelConfig = {
  levelNumber: 6,
  name: '機甲試煉',
  enemyType: 'mech',
  itemDropMult: 0.85,
  waves: [
    {
      waveNumber: 1,
      enemyHp: 320,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      mobGroup: {
        label: '機甲小隊',
        mobSprite: 'drone',
        bodyColor: 0x253545,
        accentColor: COL_BULLET_MECH,
        count: 4,
        mobHp: 80,
        hitboxRadius: 25,
        displayScale: 0.92,
        layout: 'arc',
        movementPattern: 'sine',
        attackPattern: 'straight',
        yFrac: 0.21,
        moveAmplitude: 54,
        verticalAmplitude: 16,
        movePeriodMs: 2200,
        initialFireDelayMs: 500,
        fireInterval: 1350,
        bulletWays: 2,
        bulletSpread: 0.24,
        bulletSpeed: BULLET_SPEED_FAST,
        bulletColor: COL_BULLET_MECH,
      },
      phases: [
        phase({
          spiralInterval: 280, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_MECH,
          aimInterval: 1600,   aimWays: 2,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_MECH,
          straightInterval: 1800, straightCount: 3, straightSpeed: BULLET_SPEED_FAST, straightColor: COL_BULLET_MECH,
        }),
        phase({
          spiralInterval: 220, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_MECH,
          aimInterval: 1200,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P2,
          ringInterval: 4000,  ringCount: 18,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          straightInterval: 1400, straightCount: 5, straightSpeed: BULLET_SPEED_FAST, straightColor: COL_BULLET_MECH,
          bombInterval: 7000,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
        }),
        phase({
          spiralInterval: 160, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 850,    aimWays: 4,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P3,
          ringInterval: 3000,  ringCount: 22,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 5500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          straightInterval: 1000, straightCount: 7, straightSpeed: BULLET_SPEED_FAST, straightColor: COL_BULLET_MECH,
          bombInterval: 5500,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6000, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 6500, curveWays: 2,  curveSpeed: 160, curveTurnRate: 1.0, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 520,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1200,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P2,
          spreadInterval: 1800, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P2,
          straightInterval: 1600, straightCount: 4, straightSpeed: BULLET_SPEED_FAST, straightColor: COL_BULLET_MECH,
          bombInterval: 8000,  bombCount: 1, bombFuseMs: 2300, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 7000, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 155, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 900,    aimWays: 4,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P3,
          spreadInterval: 1300, spreadWays: 7, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3500,  ringCount: 24,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 5000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          straightInterval: 1200, straightCount: 6, straightSpeed: BULLET_SPEED_FAST, straightColor: COL_BULLET_MECH,
          bombInterval: 6000,  bombCount: 2, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5000, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 6000, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.1, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 110, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 560,    aimWays: 5,     aimSpread: 0.16,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P3,
          spreadInterval: 780,  spreadWays: 9, spreadAngle: 0.14, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2400,  ringCount: 32,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3700, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 70,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4500, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
          straightInterval: 800,  straightCount: 8, straightSpeed: BULLET_SPEED_FAST, straightColor: COL_BULLET_MECH,
          bombInterval: 4500,  bombCount: 2, bombFuseMs: 1700, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 3800, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4200, curveWays: 3,  curveSpeed: 180, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
  ],
};


// ─── Level 7 · 暴風試煉 (3 waves, Storm enemy) ────────────────────────────────
// Wave 1: Sine movement – light spiral + scatter
// Wave 2: Faster sine + sniper aim added
// Wave 3: Teleport-mode – dense spiral + scatter + sniper
const LEVEL_7: LevelConfig = {
  levelNumber: 7,
  name: '暴風試煉',
  enemyType: 'storm',
  itemDropMult: 0.90,
  waves: [
    {
      waveNumber: 1,
      enemyHp: 380,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      enemySineMoves: true,
      enemySineAmplitude: 100,
      enemySinePeriodMs: 2400,
      phases: [
        phase({
          spiralInterval: 240, spiralWays: 7,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_STORM,
          aimInterval: 1600,   aimWays: 2,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_STORM,
          scatterInterval: 3500, scatterCount: 10, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_MEDIUM, scatterColor: COL_BULLET_STORM,
        }),
        phase({
          spiralInterval: 185, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1100,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P2,
          scatterInterval: 2600, scatterCount: 14, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
        }),
        phase({
          spiralInterval: 120, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 750,    aimWays: 4,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P3,
          scatterInterval: 1800, scatterCount: 18, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 480,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      enemySineMoves: true,
      enemySineAmplitude: 130,
      enemySinePeriodMs: 1900,
      phases: [
        phase({
          spiralInterval: 210, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_STORM,
          aimInterval: 1400,   aimWays: 2,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_STORM,
          scatterInterval: 3000, scatterCount: 12, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_MEDIUM, scatterColor: COL_BULLET_STORM,
          sniperInterval: 5500, sniperWarnMs: 900, sniperSpeed: 580, sniperColor: COL_BULLET_SNIPER,
        }),
        phase({
          spiralInterval: 160, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 950,    aimWays: 3,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P2,
          scatterInterval: 2200, scatterCount: 16, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
          sniperInterval: 4200, sniperWarnMs: 800, sniperSpeed: 600, sniperColor: COL_BULLET_SNIPER,
        }),
        phase({
          spiralInterval: 105, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 620,    aimWays: 4,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P3,
          scatterInterval: 1500, scatterCount: 20, scatterSpeedMin: BULLET_SPEED_MEDIUM, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
          sniperInterval: 3200, sniperWarnMs: 700, sniperSpeed: 640, sniperColor: COL_BULLET_SNIPER,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 600,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_STORM,
          scatterInterval: 2800, scatterCount: 14, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_MEDIUM, scatterColor: COL_BULLET_STORM,
          teleportInterval: 5000,
        }),
        phase({
          spiralInterval: 155, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1100,   aimWays: 3,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P2,
          scatterInterval: 2000, scatterCount: 18, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
          sniperInterval: 4500, sniperWarnMs: 800, sniperSpeed: 580, sniperColor: COL_BULLET_SNIPER,
          teleportInterval: 4000,
        }),
        phase({
          spiralInterval: 100, spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 680,    aimWays: 4,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_P3,
          scatterInterval: 1400, scatterCount: 22, scatterSpeedMin: BULLET_SPEED_MEDIUM, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
          sniperInterval: 3000, sniperWarnMs: 700, sniperSpeed: 640, sniperColor: COL_BULLET_SNIPER,
          teleportInterval: 3200,
        }),
      ],
    },
  ],
};

// ─── Level 8 · 龍王之戰 (4 waves, Dragon enemy) ────────────────────────────────
// Wave 1: Stationary – flame bursts + spread
// Wave 2: Flame + ground slam added
// Wave 3: Horizontal tracking – flame + slam + curve
// Wave 4 (final): Full arsenal + sniper; Phase 3 summons Dragon Eye guardians
const LEVEL_8: LevelConfig = {
  levelNumber: 8,
  name: '龍王之戰',
  enemyType: 'dragon',
  guardianPetFinale: 'dragon',
  itemDropMult: 0.80,
  waves: [
    {
      waveNumber: 1,
      enemyHp: 420,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          flameInterval: 3000, flameWaves: 3, flameWaveGapMs: 220, flameCount: 5, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 2200, spreadWays: 5, spreadAngle: 0.28, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_FLAME,
        }),
        phase({
          flameInterval: 2400, flameWaves: 4, flameWaveGapMs: 200, flameCount: 6, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1600, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_FLAME,
          aimInterval: 1400,   aimWays: 2,   aimSpread: 0.30,    aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_FLAME,
        }),
        phase({
          flameInterval: 1800, flameWaves: 5, flameWaveGapMs: 180, flameCount: 7, flameSpeed: BULLET_SPEED_FAST, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1100, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_FLAME,
          aimInterval: 900,    aimWays: 3,   aimSpread: 0.25,    aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_FLAME,
          ringInterval: 4500,  ringCount: 18, ringSpeed: BULLET_SPEED_MEDIUM, ringColor: COL_BULLET_RING,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 560,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          flameInterval: 2800, flameWaves: 3, flameWaveGapMs: 220, flameCount: 5, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 2000, spreadWays: 5, spreadAngle: 0.28, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_FLAME,
          groundSlamInterval: 6500, groundSlamRings: 3, groundSlamGapMs: 200, groundSlamSpeed: BULLET_SPEED_SLOW, groundSlamColor: COL_BULLET_RING,
        }),
        phase({
          flameInterval: 2200, flameWaves: 4, flameWaveGapMs: 200, flameCount: 6, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1500, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_FLAME,
          aimInterval: 1200,   aimWays: 3,   aimSpread: 0.28,    aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_FLAME,
          groundSlamInterval: 5000, groundSlamRings: 4, groundSlamGapMs: 180, groundSlamSpeed: BULLET_SPEED_MEDIUM, groundSlamColor: COL_BULLET_RING,
        }),
        phase({
          flameInterval: 1600, flameWaves: 5, flameWaveGapMs: 180, flameCount: 7, flameSpeed: BULLET_SPEED_FAST, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1000, spreadWays: 8, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_FLAME,
          aimInterval: 750,    aimWays: 4,   aimSpread: 0.22,    aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_FLAME,
          ringInterval: 3600,  ringCount: 22, ringSpeed: BULLET_SPEED_FAST, ringColor: COL_BULLET_RING,
          groundSlamInterval: 3800, groundSlamRings: 4, groundSlamGapMs: 160, groundSlamSpeed: BULLET_SPEED_MEDIUM, groundSlamColor: COL_BULLET_RING,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 700,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      enemyTracksPlayer: true,
      phases: [
        phase({
          flameInterval: 2600, flameWaves: 3, flameWaveGapMs: 220, flameCount: 6, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 2000, spreadWays: 5, spreadAngle: 0.28, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_FLAME,
          groundSlamInterval: 6000, groundSlamRings: 3, groundSlamGapMs: 200, groundSlamSpeed: BULLET_SPEED_SLOW, groundSlamColor: COL_BULLET_RING,
          curveInterval: 7000, curveWays: 2, curveSpeed: 155, curveTurnRate: 1.0, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          flameInterval: 2000, flameWaves: 4, flameWaveGapMs: 200, flameCount: 7, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1400, spreadWays: 7, spreadAngle: 0.24, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_FLAME,
          aimInterval: 1100,   aimWays: 3,   aimSpread: 0.25,    aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_FLAME,
          groundSlamInterval: 4500, groundSlamRings: 4, groundSlamGapMs: 180, groundSlamSpeed: BULLET_SPEED_MEDIUM, groundSlamColor: COL_BULLET_RING,
          curveInterval: 5500, curveWays: 2, curveSpeed: 165, curveTurnRate: 1.1, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          flameInterval: 1500, flameWaves: 5, flameWaveGapMs: 170, flameCount: 8, flameSpeed: BULLET_SPEED_FAST, flameColor: COL_BULLET_FLAME,
          spreadInterval: 850,  spreadWays: 8, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST, spreadColor: COL_BULLET_FLAME,
          aimInterval: 700,    aimWays: 4,   aimSpread: 0.20,    aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_FLAME,
          ringInterval: 3200,  ringCount: 26, ringSpeed: BULLET_SPEED_FAST, ringColor: COL_BULLET_RING,
          groundSlamInterval: 3500, groundSlamRings: 5, groundSlamGapMs: 160, groundSlamSpeed: BULLET_SPEED_MEDIUM, groundSlamColor: COL_BULLET_RING,
          curveInterval: 4200, curveWays: 3, curveSpeed: 175, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 4,
      enemyHp: 900,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      enemyTracksPlayer: true,
      phases: [
        phase({
          spiralInterval: 220, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_FLAME,
          flameInterval: 2400, flameWaves: 4, flameWaveGapMs: 200, flameCount: 6, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1800, spreadWays: 5, spreadAngle: 0.26, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_FLAME,
          groundSlamInterval: 5500, groundSlamRings: 3, groundSlamGapMs: 200, groundSlamSpeed: BULLET_SPEED_SLOW, groundSlamColor: COL_BULLET_RING,
          sniperInterval: 6000, sniperWarnMs: 900, sniperSpeed: 560, sniperColor: COL_BULLET_SNIPER,
        }),
        phase({
          spiralInterval: 170, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_FLAME,
          flameInterval: 1800, flameWaves: 5, flameWaveGapMs: 180, flameCount: 7, flameSpeed: BULLET_SPEED_FAST, flameColor: COL_BULLET_FLAME,
          spreadInterval: 1300, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_FLAME,
          aimInterval: 950,    aimWays: 4,   aimSpread: 0.22,    aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_FLAME,
          groundSlamInterval: 4000, groundSlamRings: 4, groundSlamGapMs: 180, groundSlamSpeed: BULLET_SPEED_MEDIUM, groundSlamColor: COL_BULLET_RING,
          curveInterval: 5000, curveWays: 2, curveSpeed: 165, curveTurnRate: 1.1, curveColor: COL_BULLET_CURVE,
          sniperInterval: 4500, sniperWarnMs: 800, sniperSpeed: 580, sniperColor: COL_BULLET_SNIPER,
        }),
        phase({
          spiralInterval: 110, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          flameInterval: 1400, flameWaves: 6, flameWaveGapMs: 160, flameCount: 8, flameSpeed: BULLET_SPEED_FAST, flameColor: COL_BULLET_FLAME,
          spreadInterval: 850,  spreadWays: 8, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_FLAME,
          aimInterval: 600,    aimWays: 5,   aimSpread: 0.18,    aimSpeed: BULLET_SPEED_FAST, aimColor: COL_BULLET_FLAME,
          ringInterval: 3000,  ringCount: 28, ringSpeed: BULLET_SPEED_FAST, ringColor: COL_BULLET_RING,
          groundSlamInterval: 3000, groundSlamRings: 5, groundSlamGapMs: 155, groundSlamSpeed: BULLET_SPEED_FAST, groundSlamColor: COL_BULLET_RING,
          curveInterval: 3800, curveWays: 3, curveSpeed: 180, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
          bombInterval: 5500,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          sniperInterval: 3000, sniperWarnMs: 700, sniperSpeed: 620, sniperColor: COL_BULLET_SNIPER,
        }),
      ],
    },
  ],
};

// ─── Scaled late-game progression helpers ────────────────────────────────────

type PhaseScale = {
  /** Raises pattern density by shortening active intervals. */
  density: number;
  /** Multiplies bullet speeds and ring expansion speeds. */
  speed: number;
  /** Multiplies way/count values for active volleys. */
  count: number;
  /** Multiplies HP independently from pattern pressure. */
  hp: number;
};

const INTERVAL_KEYS: (keyof WavePhaseConfig)[] = [
  'spiralInterval',
  'aimInterval',
  'spreadInterval',
  'ringInterval',
  'shockwaveInterval',
  'bubbleInterval',
  'bombInterval',
  'laserInterval',
  'curveInterval',
  'straightInterval',
  'flameInterval',
  'groundSlamInterval',
  'scatterInterval',
  'sniperInterval',
  'teleportInterval',
];

const COUNT_KEYS: (keyof WavePhaseConfig)[] = [
  'spiralWays',
  'aimWays',
  'spreadWays',
  'ringCount',
  'bubbleCount',
  'bombCount',
  'bombRingCount',
  'laserCount',
  'curveWays',
  'straightCount',
  'flameWaves',
  'flameCount',
  'groundSlamRings',
  'scatterCount',
];

const SPEED_KEYS: (keyof WavePhaseConfig)[] = [
  'spiralSpeed',
  'aimSpeed',
  'spreadSpeed',
  'ringSpeed',
  'shockwaveSpeed',
  'bubbleSpeed',
  'bombRingSpeed',
  'laserSpeed',
  'curveSpeed',
  'straightSpeed',
  'flameSpeed',
  'groundSlamSpeed',
  'scatterSpeedMin',
  'scatterSpeedMax',
  'sniperSpeed',
];

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function scaleActiveInterval(value: number, density: number): number {
  if (value <= 0) return 0;
  return Math.max(280, roundToStep(value / density, 25));
}

function scaleActiveCount(value: number, count: number): number {
  if (value <= 0) return value;
  return Math.max(1, Math.round(value * count));
}

function scaleActiveSpeed(value: number, speed: number): number {
  if (value <= 0) return value;
  return Math.max(60, roundToStep(value * speed, 5));
}

function scalePhase(base: WavePhaseConfig, scale: PhaseScale, phaseIndex: number): WavePhaseConfig {
  const phasePressure = 1 + phaseIndex * 0.04;
  const scaled: WavePhaseConfig = { ...base };

  for (const key of INTERVAL_KEYS) {
    scaled[key] = scaleActiveInterval(base[key], scale.density * phasePressure);
  }
  for (const key of COUNT_KEYS) {
    scaled[key] = scaleActiveCount(base[key], scale.count * (1 + phaseIndex * 0.03));
  }
  for (const key of SPEED_KEYS) {
    scaled[key] = scaleActiveSpeed(base[key], scale.speed);
  }

  if (base.bombFuseMs > 0) {
    scaled.bombFuseMs = Math.max(1500, roundToStep(base.bombFuseMs / Math.sqrt(scale.density), 50));
  }
  if (base.flameWaveGapMs > 0) {
    scaled.flameWaveGapMs = Math.max(120, roundToStep(base.flameWaveGapMs / Math.sqrt(scale.density), 10));
  }
  if (base.groundSlamGapMs > 0) {
    scaled.groundSlamGapMs = Math.max(110, roundToStep(base.groundSlamGapMs / Math.sqrt(scale.density), 10));
  }
  if (base.sniperWarnMs > 0) {
    scaled.sniperWarnMs = Math.max(580, roundToStep(base.sniperWarnMs / Math.sqrt(scale.density), 25));
  }
  if (base.curveTurnRate > 0) {
    scaled.curveTurnRate = Number((base.curveTurnRate * Math.sqrt(scale.speed)).toFixed(2));
  }

  return scaled;
}

function scaleWave(
  base: WaveConfig,
  waveNumber: number,
  scale: PhaseScale,
  movement?: Pick<WaveConfig, 'enemyTracksPlayer' | 'enemySineMoves' | 'enemySineAmplitude' | 'enemySinePeriodMs'>,
): WaveConfig {
  const scaledMobGroup = base.mobGroup
    ? {
        ...base.mobGroup,
        mobHp: Math.max(10, roundToStep(base.mobGroup.mobHp * scale.hp, 5)),
        fireInterval: scaleActiveInterval(base.mobGroup.fireInterval, scale.density),
        bulletWays: scaleActiveCount(base.mobGroup.bulletWays, scale.count),
        bulletSpeed: scaleActiveSpeed(base.mobGroup.bulletSpeed, scale.speed),
      }
    : undefined;

  return {
    waveNumber,
    enemyHp: scaledMobGroup
      ? scaledMobGroup.count * scaledMobGroup.mobHp
      : Math.max(120, roundToStep(base.enemyHp * scale.hp, 5)),
    phase2Frac: PHASE2_FRAC,
    phase3Frac: PHASE3_FRAC,
    phases: [
      scalePhase(base.phases[0], scale, 0),
      scalePhase(base.phases[1], scale, 1),
      scalePhase(base.phases[2], scale, 2),
    ],
    mobGroup: scaledMobGroup,
    enemyTracksPlayer: movement?.enemyTracksPlayer ?? base.enemyTracksPlayer,
    enemySineMoves: movement?.enemySineMoves ?? base.enemySineMoves,
    enemySineAmplitude: movement?.enemySineAmplitude ?? base.enemySineAmplitude,
    enemySinePeriodMs: movement?.enemySinePeriodMs ?? base.enemySinePeriodMs,
  };
}

// ─── Level 9 · 機械風暴 (hybrid Mech/Storm pressure) ──────────────────────────

const LEVEL_9: LevelConfig = {
  levelNumber: 9,
  name: '機械風暴',
  enemyType: 'mech',
  itemDropMult: 0.78,
  waves: [
    scaleWave(LEVEL_6.waves[0], 1, { hp: 1.12, density: 1.04, speed: 1.03, count: 1.04 }, { enemyTracksPlayer: true }),
    scaleWave(LEVEL_7.waves[0], 2, { hp: 1.05, density: 1.08, speed: 1.04, count: 1.04 }, { enemySineMoves: true, enemySineAmplitude: 120, enemySinePeriodMs: 2100 }),
    scaleWave(LEVEL_6.waves[1], 3, { hp: 1.18, density: 1.12, speed: 1.05, count: 1.08 }, { enemyTracksPlayer: true }),
  ],
};

// ─── Level 10 · 風暴龍影 (Storm control + Dragon fire) ────────────────────────

const LEVEL_10: LevelConfig = {
  levelNumber: 10,
  name: '風暴龍影',
  enemyType: 'storm',
  itemDropMult: 0.74,
  waves: [
    scaleWave(LEVEL_7.waves[1], 1, { hp: 1.10, density: 1.08, speed: 1.04, count: 1.05 }, { enemySineMoves: true, enemySineAmplitude: 145, enemySinePeriodMs: 1900 }),
    scaleWave(LEVEL_8.waves[1], 2, { hp: 1.00, density: 1.10, speed: 1.05, count: 1.05 }, { enemyTracksPlayer: true }),
    scaleWave(LEVEL_7.waves[2], 3, { hp: 1.12, density: 1.15, speed: 1.06, count: 1.08 }, { enemySineMoves: true, enemySineAmplitude: 160, enemySinePeriodMs: 1700 }),
  ],
};

// ─── Level 11 · 龍王再臨 (extended Dragon rematch) ────────────────────────────

const LEVEL_11: LevelConfig = {
  levelNumber: 11,
  name: '龍王再臨',
  enemyType: 'dragon',
  guardianPetFinale: 'dragon',
  itemDropMult: 0.70,
  waves: [
    scaleWave(LEVEL_8.waves[0], 1, { hp: 1.08, density: 1.06, speed: 1.04, count: 1.03 }),
    scaleWave(LEVEL_8.waves[1], 2, { hp: 1.10, density: 1.10, speed: 1.05, count: 1.06 }),
    scaleWave(LEVEL_8.waves[2], 3, { hp: 1.12, density: 1.14, speed: 1.06, count: 1.08 }, { enemyTracksPlayer: true }),
    scaleWave(LEVEL_8.waves[3], 4, { hp: 1.16, density: 1.18, speed: 1.07, count: 1.10 }, { enemyTracksPlayer: true }),
  ],
};

// ─── Level 12 · 虛空核心 (final mixed-pattern gauntlet) ───────────────────────

const LEVEL_12: LevelConfig = {
  levelNumber: 12,
  name: '虛空核心',
  enemyType: 'blackhole',
  itemDropMult: 0.68,
  waves: [
    scaleWave(LEVEL_5.waves[3], 1, { hp: 1.12, density: 1.10, speed: 1.05, count: 1.06 }),
    scaleWave(LEVEL_10.waves[2], 2, { hp: 1.10, density: 1.08, speed: 1.04, count: 1.04 }, { enemySineMoves: true, enemySineAmplitude: 165, enemySinePeriodMs: 1650 }),
    scaleWave(LEVEL_11.waves[3], 3, { hp: 1.10, density: 1.10, speed: 1.04, count: 1.06 }, { enemyTracksPlayer: true }),
  ],
};

const LEVELS: LevelConfig[] = [
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
  LEVEL_6,
  LEVEL_7,
  LEVEL_8,
  LEVEL_9,
  LEVEL_10,
  LEVEL_11,
  LEVEL_12,
];

/** Total number of defined levels. */
export const TOTAL_LEVELS = LEVELS.length;

/**
 * Returns the LevelConfig for the given 1-based level number.
 * Clamps to the last level if levelNumber exceeds the defined set.
 */
export function createLevel(levelNumber: number): LevelConfig {
  const idx = Math.max(0, Math.min(levelNumber - 1, LEVELS.length - 1));
  return LEVELS[idx];
}

// ─── Story-exclusive levels ───────────────────────────────────────────────────

const STORY_LEVEL_NAMES = [
  '星野出發',
  '守門者勇氣',
  '不准說害怕',
  '星火徽記',
  '第一個同行者',
  '祖父的訊號',
  '記憶碎片一',
  '勇氣的規矩',
  '被偷走的聲音',
  '星路裂口',
  '幽光森林',
  '假祖父',
  '勇氣的沉默',
  '記憶碎片二',
  '幻影之謎',
  '小雞的嫉妒',
  '勇氣回歸',
  '記憶不是證據',
  '幻影的空白',
  '被吞下的名字',
  '黑潮邊界',
  '勇氣的失敗',
  '不只是救人',
  '混沌低語',
  '混沌的降臨',
  '分歧的同伴',
  '一個人的星路',
  '勇氣的真名',
  '混沌的真話',
  '重新同行',
  '水晶塔入口',
  '封印協議',
  '無效的眼淚',
  '祖父的筆跡',
  '水晶守衛試煉',
  '故障的保護',
  '幻影的交易',
  '勇氣不相信幻影',
  '塔心鑰匙',
  '守衛的最後命令',
  '暴風信使',
  '停不下來的風',
  '被送丟的訊息',
  '小雞學會等待',
  '風暴之眼',
  '龍王門前',
  '大局與一人',
  '幻影的選擇',
  '龍王之戰',
  '虛空門扉',
];

/** Story mode's first chapter is planned as a 50-level arc. */
export const STORY_TOTAL_LEVELS = STORY_LEVEL_NAMES.length;

function storyBaseLevel(level: number): LevelConfig {
  if (level <= 1) return LEVEL_1;
  if (level <= 3) return LEVEL_2;
  if (level <= 8) return LEVEL_3;
  if (level <= 20) return LEVEL_4;
  if (level <= 30) return LEVEL_5;
  if (level <= 40) return LEVEL_6;
  if (level <= 45) return LEVEL_7;
  if (level <= 49) return LEVEL_8;
  return LEVEL_12;
}

function storyWaveCount(level: number): number {
  if (level === 1) return 1;
  if (level <= 20) return level % 5 === 0 ? 2 : 1;
  if (level < STORY_TOTAL_LEVELS) return level % 5 === 0 ? 3 : 2;
  return 3;
}

function storyScale(level: number, waveIndex: number): PhaseScale {
  const progress = (level - 1) / Math.max(1, STORY_TOTAL_LEVELS - 1);
  const milestoneBoost = level % 5 === 0 ? 0.08 : 0;
  const waveBoost = waveIndex * 0.04;
  return {
    hp: 0.55 + progress * 0.95 + milestoneBoost + waveIndex * 0.08,
    density: 0.72 + progress * 0.65 + milestoneBoost + waveBoost,
    speed: 0.88 + progress * 0.28 + waveIndex * 0.025,
    count: 0.82 + progress * 0.35 + waveIndex * 0.025,
  };
}

function storyGuardianFinale(level: number, base: LevelConfig): LevelConfig['guardianPetFinale'] {
  if (level === 30 && base.guardianPetFinale === 'chaos') return 'chaos';
  if (level === 49 && base.guardianPetFinale === 'dragon') return 'dragon';
  return undefined;
}

function createStoryBattleLevel(level: number): LevelConfig {
  const base = storyBaseLevel(level);
  const waveCount = storyWaveCount(level);
  const baseOffset = (level - 1) % base.waves.length;

  return {
    levelNumber: level,
    name: STORY_LEVEL_NAMES[level - 1],
    enemyType: base.enemyType,
    guardianPetFinale: storyGuardianFinale(level, base),
    itemDropMult: base.itemDropMult,
    waves: Array.from({ length: waveCount }, (_, idx) => {
      const baseWave = base.waves[(baseOffset + idx) % base.waves.length];
      return scaleWave(baseWave, idx + 1, storyScale(level, idx));
    }),
  };
}

/** Story-mode level map keyed by 1-based story level number. */
const STORY_LEVELS: Record<number, LevelConfig> = {};
for (let level = 1; level <= STORY_TOTAL_LEVELS; level++) {
  STORY_LEVELS[level] = createStoryBattleLevel(level);
}

/**
 * Returns the story-exclusive LevelConfig for the given 1-based story level,
 * or null if no story level has been defined for that number.
 */
export function getStoryLevel(storyLevel: number): LevelConfig | null {
  return STORY_LEVELS[storyLevel] ?? null;
}
