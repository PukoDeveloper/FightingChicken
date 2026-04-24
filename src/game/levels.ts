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
  SHOCKWAVE_EXPAND_SPEED,
  BUBBLE_SPEED,
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
}

/** Configuration for one enemy encounter (wave) within a level. */
export interface WaveConfig {
  waveNumber: number;   // 1-based display number
  enemyHp: number;
  phase2Frac: number;   // HP fraction at which phase 2 starts
  phase3Frac: number;   // HP fraction at which phase 3 starts
  phases: [WavePhaseConfig, WavePhaseConfig, WavePhaseConfig]; // [phase1, phase2, phase3]
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


const LEVELS: LevelConfig[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];

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

/** Story-mode level map keyed by 1-based chapter number. */
const STORY_LEVELS: Record<number, LevelConfig> = {
  1: STORY_CH1_LEVEL,
  2: STORY_CH2_LEVEL,
  3: STORY_CH3_LEVEL,
};

/**
 * Returns the story-exclusive LevelConfig for the given 1-based chapter number,
 * or null if no story level has been defined for that chapter.
 */
export function getStoryLevel(chapter: number): LevelConfig | null {
  return STORY_LEVELS[chapter] ?? null;
}
