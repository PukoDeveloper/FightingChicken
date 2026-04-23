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
    ...overrides,
  };
}

// ─── Level 1 · 初級挑戰 (2 waves) ─────────────────────────────────────────────

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
    {
      waveNumber: 2,
      enemyHp: 150,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 200, spiralWays: 6, spiralSpeed: BULLET_SPEED_SLOW, spiralColor: COL_BULLET_P1,
          aimInterval: 1200,   aimWays: 3,   aimSpread: 0.30,                 aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P1,
        }),
        phase({
          spiralInterval: 160, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 800,    aimWays: 3,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1400, spreadWays: 5, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 100, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 550,    aimWays: 4,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 700, spreadWays: 8,  spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 2800,  ringCount: 28,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

// ─── Level 2 · 中級考驗 (3 waves) ─────────────────────────────────────────────

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
    {
      waveNumber: 3,
      enemyHp: 160,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 160, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 900,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1400, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 140, spiralWays: 11, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 650,    aimWays: 5,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 950, spreadWays: 7,  spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3000,  ringCount: 28,  ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 80,  spiralWays: 18, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 400,    aimWays: 6,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 550, spreadWays: 10, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1800,  ringCount: 40,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

// ─── Level 3 · 終極試煉 (4 waves) ─────────────────────────────────────────────

const LEVEL_3: LevelConfig = {
  levelNumber: 3,
  name: '終極試煉',
  enemyType: 'courage',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 220,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 170, spiralWays: 9,  spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 1000,   aimWays: 4,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1800, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 140, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 700,    aimWays: 5,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1100, spreadWays: 8, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3000,   ringCount: 28, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 85,  spiralWays: 18, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 420,    aimWays: 6,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 580, spreadWays: 10, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2000,  ringCount: 40,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
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
          spiralInterval: 160, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 900,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1500, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          ringInterval: 4500,   ringCount: 20, ringSpeed: BULLET_SPEED_SLOW,     ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 130, spiralWays: 13, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 620,    aimWays: 5,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1000, spreadWays: 8, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 2800,   ringCount: 32, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 80,  spiralWays: 20, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 380,    aimWays: 7,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 520, spreadWays: 11, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1600,  ringCount: 44,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 240,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 150, spiralWays: 11, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P3,
          aimInterval: 850,    aimWays: 5,     aimSpread: 0.30,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1300, spreadWays: 7, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3500,   ringCount: 24, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 120, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 580,    aimWays: 6,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 880, spreadWays: 9,  spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2400,  ringCount: 36,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 75,  spiralWays: 22, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 360,    aimWays: 7,     aimSpread: 0.16,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 500, spreadWays: 12, spreadAngle: 0.14, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1500,  ringCount: 48,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
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
          spiralInterval: 140, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 800,    aimWays: 5,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1200, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3200,   ringCount: 28, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 110, spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 500,    aimWays: 6,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 780, spreadWays: 10, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2200,  ringCount: 40,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
        }),
        phase({
          spiralInterval: 70,  spiralWays: 24, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 330,    aimWays: 8,     aimSpread: 0.14,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 460, spreadWays: 13, spreadAngle: 0.12, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1400,  ringCount: 52,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
        }),
      ],
    },
  ],
};

// ─── Level 4 · 幽靈試煉 (4 waves, Phantom enemy) ──────────────────────────────
// Introduces shockwaves in phase 2/3 and bubbles in phase 3.

const LEVEL_4: LevelConfig = {
  levelNumber: 4,
  name: '幽靈試煉',
  enemyType: 'phantom',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 260,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 160, spiralWays: 10, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 900,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1600, spreadWays: 6, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        }),
        phase({
          spiralInterval: 130, spiralWays: 13, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 700,    aimWays: 5,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1200, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3500,   ringCount: 28, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 5000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED, shockwaveColor: COL_SHOCKWAVE,
        }),
        phase({
          spiralInterval: 90,  spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 480,    aimWays: 6,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 750, spreadWays: 9,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2200,  ringCount: 36,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4500, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
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
          spiralInterval: 150, spiralWays: 11, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
          aimInterval: 850,    aimWays: 4,     aimSpread: 0.28,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
          spreadInterval: 1400, spreadWays: 7, spreadAngle: 0.24, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 5500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,       shockwaveColor: COL_SHOCKWAVE,
        }),
        phase({
          spiralInterval: 120, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 650,    aimWays: 5,     aimSpread: 0.25,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1000, spreadWays: 8, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
          ringInterval: 3000,   ringCount: 32, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 80,  spiralWays: 18, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 420,    aimWays: 6,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 620, spreadWays: 10, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1900,  ringCount: 40,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3500, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 280,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 140, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 800,    aimWays: 5,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1300, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P2,
          shockwaveInterval: 4500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,       shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 110, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 580,    aimWays: 6,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 850, spreadWays: 9,  spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2500,  ringCount: 36,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 75,  spiralWays: 20, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 380,    aimWays: 7,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 520, spreadWays: 11, spreadAngle: 0.14, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1600,  ringCount: 44,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2800, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
    {
      waveNumber: 4,
      enemyHp: 300,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 130, spiralWays: 13, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 750,    aimWays: 5,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1100, spreadWays: 8, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3000,   ringCount: 30, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 100, spiralWays: 17, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 520,    aimWays: 6,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 720, spreadWays: 10, spreadAngle: 0.17, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2000,  ringCount: 42,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3500, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 65,  spiralWays: 22, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 320,    aimWays: 8,     aimSpread: 0.14,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 440, spreadWays: 13, spreadAngle: 0.12, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1400,  ringCount: 50,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 70,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2400, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 25,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
  ],
};

// ─── Level 5 · 混沌深淵 (5 waves, Chaos enemy) ────────────────────────────────
// Full chaos: all patterns active from phase 1, maximum density.

const LEVEL_5: LevelConfig = {
  levelNumber: 5,
  name: '混沌深淵',
  enemyType: 'chaos',
  waves: [
    {
      waveNumber: 1,
      enemyHp: 300,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 150, spiralWays: 12, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 800,    aimWays: 5,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1400, spreadWays: 7, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P2,
          ringInterval: 3500,   ringCount: 28, ringSpeed: BULLET_SPEED_MEDIUM,   ringColor: COL_BULLET_RING,
          shockwaveInterval: 4500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 6000, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED,       bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 120, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 600,    aimWays: 6,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1000, spreadWays: 9, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2500,  ringCount: 36,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4500, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 80,  spiralWays: 20, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 400,    aimWays: 8,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 560, spreadWays: 12, spreadAngle: 0.15, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1700,  ringCount: 48,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2600, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 60,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3000, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
    {
      waveNumber: 2,
      enemyHp: 280,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 145, spiralWays: 13, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P2,
          aimInterval: 750,    aimWays: 5,     aimSpread: 0.26,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P2,
          spreadInterval: 1300, spreadWays: 8, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P2,
          ringInterval: 3200,   ringCount: 30, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 30,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5500, bubbleCount: 2, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 115, spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 560,    aimWays: 6,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 880, spreadWays: 10, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2200,  ringCount: 40,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 75,  spiralWays: 22, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 370,    aimWays: 8,     aimSpread: 0.16,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 500, spreadWays: 13, spreadAngle: 0.13, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1500,  ringCount: 52,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2400, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 70,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2600, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 25,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
    {
      waveNumber: 3,
      enemyHp: 320,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 135, spiralWays: 14, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 720,    aimWays: 6,     aimSpread: 0.24,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1200, spreadWays: 8, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 3000,   ringCount: 32, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 4000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 5000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 10,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 105, spiralWays: 17, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 540,    aimWays: 7,     aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 820, spreadWays: 11, spreadAngle: 0.16, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2000,  ringCount: 44,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 60,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3500, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 68,  spiralWays: 24, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 350,    aimWays: 8,     aimSpread: 0.14,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 460, spreadWays: 14, spreadAngle: 0.12, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1350,  ringCount: 56,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2200, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 80,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2400, bubbleCount: 5, bubbleSpeed: BUBBLE_SPEED + 28,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
    {
      waveNumber: 4,
      enemyHp: 300,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 130, spiralWays: 15, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 680,    aimWays: 6,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1100, spreadWays: 9, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 2800,   ringCount: 34, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 50,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4500, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 15,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 100, spiralWays: 18, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 500,    aimWays: 7,     aimSpread: 0.18,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 760, spreadWays: 11, spreadAngle: 0.15, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1800,  ringCount: 46,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 70,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 3200, bubbleCount: 4, bubbleSpeed: BUBBLE_SPEED + 22,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 62,  spiralWays: 26, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 330,    aimWays: 9,     aimSpread: 0.13,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 430, spreadWays: 14, spreadAngle: 0.11, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1250,  ringCount: 58,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2000, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 90,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2200, bubbleCount: 5, bubbleSpeed: BUBBLE_SPEED + 30,  bubbleColor: COL_BUBBLE,
        }),
      ],
    },
    {
      waveNumber: 5,
      enemyHp: 360,
      phase2Frac: 0.66,
      phase3Frac: 0.33,
      phases: [
        phase({
          spiralInterval: 120, spiralWays: 16, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 640,    aimWays: 7,     aimSpread: 0.22,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 1000, spreadWays: 10, spreadAngle: 0.20, spreadSpeed: BULLET_SPEED_FAST,  spreadColor: COL_BULLET_P3,
          ringInterval: 2600,   ringCount: 36, ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 3500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 60,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 4000, bubbleCount: 3, bubbleSpeed: BUBBLE_SPEED + 20,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 90,  spiralWays: 20, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 460,    aimWays: 8,     aimSpread: 0.17,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 680, spreadWays: 12, spreadAngle: 0.14, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1600,  ringCount: 52,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 2500, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 80,  shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2800, bubbleCount: 5, bubbleSpeed: BUBBLE_SPEED + 28,  bubbleColor: COL_BUBBLE,
        }),
        phase({
          spiralInterval: 56,  spiralWays: 28, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
          aimInterval: 300,    aimWays: 10,    aimSpread: 0.12,                  aimSpeed: BULLET_SPEED_FAST,   aimColor: COL_BULLET_P3,
          spreadInterval: 400, spreadWays: 16, spreadAngle: 0.10, spreadSpeed: BULLET_SPEED_FAST,   spreadColor: COL_BULLET_P3,
          ringInterval: 1100,  ringCount: 64,  ringSpeed: BULLET_SPEED_FAST,     ringColor: COL_BULLET_RING,
          shockwaveInterval: 1800, shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 110, shockwaveColor: COL_SHOCKWAVE,
          bubbleInterval: 2000, bubbleCount: 6, bubbleSpeed: BUBBLE_SPEED + 35,  bubbleColor: COL_BUBBLE,
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
