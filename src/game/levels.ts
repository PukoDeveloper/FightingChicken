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
  TELEPORT_WARN_MS,
  SNIPER_WARN_MS,
} from '../constants';
import type { EnemyType } from '../constants';

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

/** Configuration for one enemy encounter (wave) within a level. */
export interface WaveConfig {
  waveNumber: number;   // 1-based display number
  enemyHp: number;
  phase2Frac: number;   // HP fraction at which phase 2 starts
  phase3Frac: number;   // HP fraction at which phase 3 starts
  phases: [WavePhaseConfig, WavePhaseConfig, WavePhaseConfig]; // [phase1, phase2, phase3]
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

// ─── Level 1 · 初級挑戰 (1 wave) ──────────────────────────────────────────────

const LEVEL_1: LevelConfig = {
  levelNumber: 1,
  name: '初級挑戰',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
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
// Wave 1: Tracking Mech – sways left-right to follow the player and rains
//         bullets straight down, mixing in rings, aimed shots, and bombs.
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
      enemyTracksPlayer: true,
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

const LEVELS: LevelConfig[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8];

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

/** Story Chapter 1 battle – introductory single wave vs 勇氣. */
const STORY_CH1_LEVEL: LevelConfig = {
  levelNumber: 1,
  name: '遇見勇氣',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 130,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 300, spiralWays: 4, spiralSpeed: BULLET_SPEED_SLOW, spiralColor: COL_BULLET_P1,
          aimInterval: 1800,   aimWays: 2,   aimSpread: 0.20,                 aimSpeed: BULLET_SPEED_SLOW, aimColor: COL_BULLET_P1,
        }),
        phase({
          spiralInterval: 240, spiralWays: 6,  spiralSpeed: BULLET_SPEED_SLOW,   spiralColor: COL_BULLET_P2,
          aimInterval: 1400,   aimWays: 2,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 2200, spreadWays: 4, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 180, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 1000,   aimWays: 3,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P3,
          spreadInterval: 1600, spreadWays: 5, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_SLOW,   spreadColor: COL_BULLET_P3,
          ringInterval: 4500,  ringCount: 14,  ringSpeed: BULLET_SPEED_SLOW,     ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

/** Story Chapter 2 battle – two-wave rematch vs 勇氣; moderate difficulty. */
const STORY_CH2_LEVEL: LevelConfig = {
  levelNumber: 2,
  name: '第一次對決',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 160,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 260, spiralWays: 5, spiralSpeed: BULLET_SPEED_SLOW, spiralColor: COL_BULLET_P1,
          aimInterval: 1500,   aimWays: 2,   aimSpread: 0.22,                 aimSpeed: BULLET_SPEED_SLOW, aimColor: COL_BULLET_P1,
        }),
        phase({
          spiralInterval: 200, spiralWays: 7,  spiralSpeed: BULLET_SPEED_SLOW,   spiralColor: COL_BULLET_P2,
          aimInterval: 1200,   aimWays: 3,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1800, spreadWays: 4, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 150, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 800,    aimWays: 3,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P3,
          spreadInterval: 1200, spreadWays: 5, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_SLOW,   spreadColor: COL_BULLET_P3,
          ringInterval: 3800,  ringCount: 12,  ringSpeed: BULLET_SPEED_SLOW,     ringColor: COL_BULLET_RING,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 180,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 220, spiralWays: 6, spiralSpeed: BULLET_SPEED_SLOW,   spiralColor: COL_BULLET_P2,
          aimInterval: 1300,   aimWays: 3,   aimSpread: 0.25,                   aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 170, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1000,   aimWays: 3,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1500, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 120, spiralWays: 11, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 700,    aimWays: 3,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1000, spreadWays: 6, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3000,  ringCount: 16,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

/** Story Chapter 3 battle – two-wave fight vs 幻影 (Phantom); harder than ch2, introduces shockwaves and bubbles. */
const STORY_CH3_LEVEL: LevelConfig = {
  levelNumber: 3,
  name: '幽靈之謎',
  enemyType: 'phantom',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 180,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 230, spiralWays: 6, spiralSpeed: BULLET_SPEED_SLOW,   spiralColor: COL_BULLET_P1,
          aimInterval: 1400,   aimWays: 3,   aimSpread: 0.22,                   aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P1,
        }),
        phase({
          spiralInterval: 180, spiralWays: 8,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1100,   aimWays: 3,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1600, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 5000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,       shockwaveColor: COL_SHOCKWAVE,
        }),
        phase({
          spiralInterval: 140, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 850,    aimWays: 4,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1200, spreadWays: 6, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3200,  ringCount: 14,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 4200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20, shockwaveColor: COL_SHOCKWAVE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 210,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 7, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1200,   aimWays: 3,   aimSpread: 0.25,                   aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          bubbleInterval: 4500, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,      bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 155, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 900,    aimWays: 4,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1400, spreadWays: 6, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 4000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 15, shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3800, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10, bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 110, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 680,    aimWays: 4,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 980,  spreadWays: 7, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 2600,  ringCount: 18,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 3200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30, shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20, bubbleColor: COL_BUBBLE,
        }),
      ],
    },
  ],
};

/** Story Chapter 4 battle – three-wave fight vs 混沌 (Chaos); difficulty between story ch3 and normal level 5. */
const STORY_CH4_LEVEL: LevelConfig = {
  levelNumber: 4,
  name: '混沌的降臨',
  enemyType: 'chaos',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 220,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 210, spiralWays: 7,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1300,   aimWays: 3,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1900, spreadWays: 5, spreadAngle: 0.24, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          bombInterval: 8000,  bombCount: 1, bombFuseMs: 2400, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 7000, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 170, spiralWays: 9,  spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 950,    aimWays: 4,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1450, spreadWays: 6, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 4200,   ringCount: 20, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 5800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bombInterval: 6500,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5500, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 125, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 660,    aimWays: 5,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 950,  spreadWays: 7, spreadAngle: 0.17, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2700,  ringCount: 26,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
          bombInterval: 5200,  bombCount: 1, bombFuseMs: 1900, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4200, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4500, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 240,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 195, spiralWays: 8,  spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1150,   aimWays: 3,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1700, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 6200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bombInterval: 7500,  bombCount: 1, bombFuseMs: 2200, bombRingCount: 8,  bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 6200, laserCount: 4, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
        }),
        phase({
          spiralInterval: 155, spiralWays: 10, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 850,    aimWays: 4,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1250, spreadWays: 6, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3600,  ringCount: 24,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
          bombInterval: 6000,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5000, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 5500, curveWays: 2,  curveSpeed: 168, curveTurnRate: 1.2, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 110, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 570,    aimWays: 5,     aimSpread: 0.17,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 790,  spreadWays: 8, spreadAngle: 0.14, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2400,  ringCount: 30,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3600, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 60,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4200, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 18,  bubbleColor: COL_BUBBLE,
          bombInterval: 4800,  bombCount: 2, bombFuseMs: 1800, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 3800, laserCount: 6, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3800, curveWays: 2,  curveSpeed: 178, curveTurnRate: 1.4, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 260,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 185, spiralWays: 9,  spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 1050,   aimWays: 4,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1600, spreadWays: 5, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P2,
          ringInterval: 4400,   ringCount: 20, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 5600, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 7000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
          bombInterval: 7000,  bombCount: 1, bombFuseMs: 2000, bombRingCount: 10, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 5800, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 6500, curveWays: 2,  curveSpeed: 165, curveTurnRate: 1.1, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 145, spiralWays: 11, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 780,    aimWays: 5,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1100, spreadWays: 7, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2900,  ringCount: 28,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 55,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
          bombInterval: 5500,  bombCount: 1, bombFuseMs: 1900, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 4500, laserCount: 5, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 4800, curveWays: 2,  curveSpeed: 175, curveTurnRate: 1.3, curveColor: COL_BULLET_CURVE,
        }),
        phase({
          spiralInterval: 100, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 520,    aimWays: 5,     aimSpread: 0.15,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 720,  spreadWays: 9, spreadAngle: 0.12, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2100,  ringCount: 35,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 75,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3500, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 25,  bubbleColor: COL_BUBBLE,
          bombInterval: 4500,  bombCount: 2, bombFuseMs: 1700, bombRingCount: 12, bombRingSpeed: BULLET_SPEED_MEDIUM, bombColor: COL_BULLET_BOMB,
          laserInterval: 3400, laserCount: 7, laserSpeed: BULLET_SPEED_FAST,     laserColor: COL_BULLET_LASER,
          curveInterval: 3400, curveWays: 2,  curveSpeed: 185, curveTurnRate: 1.6, curveColor: COL_BULLET_CURVE,
        }),
      ],
    },
  ],
};

/** Story-mode level map keyed by 1-based chapter number. */
const STORY_LEVELS: Record<number, LevelConfig> = {
  1: STORY_CH1_LEVEL,
  2: STORY_CH2_LEVEL,
  3: STORY_CH3_LEVEL,
  4: STORY_CH4_LEVEL,
};

/**
 * Returns the story-exclusive LevelConfig for the given 1-based chapter number,
 * or null if no story level has been defined for that chapter.
 */
export function getStoryLevel(chapter: number): LevelConfig | null {
  return STORY_LEVELS[chapter] ?? null;
}
