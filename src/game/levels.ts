import {
  BULLET_SPEED_SLOW,
  BULLET_SPEED_MEDIUM,
  BULLET_SPEED_FAST,
  COL_BULLET_P1,
  COL_BULLET_P2,
  COL_BULLET_P3,
  COL_BULLET_RING,
} from '../constants';

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
  waves: WaveConfig[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function phase(overrides: Partial<WavePhaseConfig>): WavePhaseConfig {
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
    ...overrides,
  };
}

// ─── Level 1 · 初級挑戰 (2 waves) ─────────────────────────────────────────────

const LEVEL_1: LevelConfig = {
  levelNumber: 1,
  name: '初級挑戰',
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

// ─── Registry & factory ───────────────────────────────────────────────────────

const LEVELS: LevelConfig[] = [LEVEL_1, LEVEL_2, LEVEL_3];

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
