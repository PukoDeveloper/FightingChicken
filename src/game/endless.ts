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
import type { WaveConfig } from './levels';
import { phase as makePhase } from './levels';

// ─── Buff Definitions ─────────────────────────────────────────────────────────

export type BuffId =
  | 'hp_up'           // +1 max HP, restore 1 HP
  | 'hp_restore'      // restore ceil(maxHp/2) HP
  | 'fire_rate_up'    // -15% fire interval (faster shots, stackable)
  | 'triple_shot'     // +1 extra centre bullet per volley (stackable)
  | 'berserker'       // when HP ≤ 2, fire interval halved
  | 'periodic_shield';// gain 2 s invincibility every 12 s

export interface BuffDef {
  id: BuffId;
  name: string;
  desc: string;
  color: number;
  borderColor: number;
}

export const ALL_BUFFS: BuffDef[] = [
  {
    id: 'hp_up',
    name: '生命上限 +1',
    desc: '最大生命值增加 1，\n並立即恢復 1 點生命',
    color: 0x1a0a0a,
    borderColor: 0xff4466,
  },
  {
    id: 'hp_restore',
    name: '緊急恢復',
    desc: '立即恢復\n一半最大生命值',
    color: 0x0a1a0a,
    borderColor: 0x44ff88,
  },
  {
    id: 'fire_rate_up',
    name: '射速提升',
    desc: '射擊頻率提高 15%\n（可多次疊加）',
    color: 0x0a0a1a,
    borderColor: 0x44aaff,
  },
  {
    id: 'triple_shot',
    name: '多重射擊',
    desc: '每次射擊額外\n增加一顆子彈',
    color: 0x1a0f00,
    borderColor: 0xffcc00,
  },
  {
    id: 'berserker',
    name: '狂暴鬥志',
    desc: '生命 ≤ 2 時\n射速加倍',
    color: 0x1a0000,
    borderColor: 0xff6600,
  },
  {
    id: 'periodic_shield',
    name: '周期護盾',
    desc: '每 12 秒自動獲得\n2 秒無敵效果',
    color: 0x08080f,
    borderColor: 0xaaddff,
  },
];

/** Pick `count` unique random buffs from the full pool. */
export function pickRandomBuffs(count: number): BuffDef[] {
  const pool = [...ALL_BUFFS];
  const result: BuffDef[] = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// ─── Endless Wave Generator ───────────────────────────────────────────────────

/**
 * Returns the enemy type for the given endless wave number.
 * Waves 1-5  → courage
 * Waves 6-10 → phantom
 * Waves 11+  → chaos
 */
export function endlessEnemyType(waveNum: number): EnemyType {
  if (waveNum <= 5) return 'courage';
  if (waveNum <= 10) return 'phantom';
  return 'chaos';
}

/**
 * Build a WaveConfig for an endless-mode wave.
 * Difficulty scales smoothly with `waveNum` (1-based).
 */
export function createEndlessWaveConfig(waveNum: number): WaveConfig {
  // Each wave is ~12% harder than the previous.
  const d = Math.pow(1.12, waveNum - 1);

  // Enemy HP grows with difficulty (capped to keep it fun).
  const hp = Math.min(Math.round(120 * d), 900);

  // Intervals shrink (faster attacks) but are floored.
  const spiral1 = Math.max(55, Math.round(260 / d));
  const spiral2 = Math.max(45, Math.round(200 / d));
  const spiral3 = Math.max(38, Math.round(150 / d));

  const aim1 = Math.max(400, Math.round(1500 / d));
  const aim2 = Math.max(300, Math.round(1100 / d));
  const aim3 = Math.max(220, Math.round(800 / d));

  const spread1 = Math.max(500, Math.round(2000 / d));
  const spread2 = Math.max(380, Math.round(1500 / d));
  const spread3 = Math.max(280, Math.round(1100 / d));

  const ring3 = Math.max(1200, Math.round(3500 / d));

  // Way counts grow slowly.
  const spiralWays1 = Math.min(6 + Math.floor((waveNum - 1) * 0.8), 20);
  const spiralWays2 = Math.min(9 + Math.floor((waveNum - 1) * 0.9), 24);
  const spiralWays3 = Math.min(12 + Math.floor((waveNum - 1) * 1.0), 28);

  const aimWays1 = Math.min(2 + Math.floor((waveNum - 1) * 0.3), 6);
  const aimWays2 = Math.min(3 + Math.floor((waveNum - 1) * 0.3), 7);
  const aimWays3 = Math.min(4 + Math.floor((waveNum - 1) * 0.35), 8);

  const ringCount3 = Math.min(20 + Math.floor((waveNum - 1) * 2), 56);

  // Introduce shockwaves from wave 6, bubbles from wave 6 too.
  const hasShockwave = waveNum >= 6;
  const hasBubble = waveNum >= 6;
  const sw1 = hasShockwave ? Math.max(2500, Math.round(6000 / d)) : 0;
  const sw2 = hasShockwave ? Math.max(2000, Math.round(4500 / d)) : 0;
  const sw3 = hasShockwave ? Math.max(1500, Math.round(3200 / d)) : 0;
  const swSpeed = Math.min(SHOCKWAVE_EXPAND_SPEED + (waveNum - 6) * 8, 320);

  const bub1 = hasBubble ? Math.max(2800, Math.round(6500 / d)) : 0;
  const bub2 = hasBubble ? Math.max(2200, Math.round(5000 / d)) : 0;
  const bub3 = hasBubble ? Math.max(1800, Math.round(3800 / d)) : 0;
  const bubSpeed = Math.min(BUBBLE_SPEED + (waveNum - 6) * 5, 200);
  const bubCount1 = hasBubble ? Math.min(1 + Math.floor((waveNum - 6) * 0.2), 3) : 1;
  const bubCount2 = hasBubble ? Math.min(2 + Math.floor((waveNum - 6) * 0.2), 4) : 1;
  const bubCount3 = hasBubble ? Math.min(2 + Math.floor((waveNum - 6) * 0.25), 5) : 1;

  return {
    waveNumber: waveNum,
    enemyHp: hp,
    phase2Frac: 0.66,
    phase3Frac: 0.33,
    phases: [
      makePhase({
        spiralInterval: spiral1, spiralWays: spiralWays1, spiralSpeed: BULLET_SPEED_SLOW,  spiralColor: COL_BULLET_P1,
        aimInterval:    aim1,    aimWays: aimWays1,       aimSpread: 0.30,                 aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P1,
        spreadInterval: spread1, spreadWays: aimWays1 + 2, spreadAngle: 0.25, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P1,
        shockwaveInterval: sw1, shockwaveSpeed: swSpeed, shockwaveColor: COL_SHOCKWAVE,
        bubbleInterval: bub1, bubbleCount: bubCount1, bubbleSpeed: bubSpeed, bubbleColor: COL_BUBBLE,
      }),
      makePhase({
        spiralInterval: spiral2, spiralWays: spiralWays2, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
        aimInterval:    aim2,    aimWays: aimWays2,       aimSpread: 0.27,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
        spreadInterval: spread2, spreadWays: aimWays2 + 2, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        ringInterval: ring3 + 500, ringCount: ringCount3 - 8, ringSpeed: BULLET_SPEED_MEDIUM, ringColor: COL_BULLET_RING,
        shockwaveInterval: sw2, shockwaveSpeed: swSpeed + 10, shockwaveColor: COL_SHOCKWAVE,
        bubbleInterval: bub2, bubbleCount: bubCount2, bubbleSpeed: bubSpeed, bubbleColor: COL_BUBBLE,
      }),
      makePhase({
        spiralInterval: spiral3, spiralWays: spiralWays3, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
        aimInterval:    aim3,    aimWays: aimWays3,       aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,  aimColor: COL_BULLET_P3,
        spreadInterval: spread3, spreadWays: aimWays3 + 3, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
        ringInterval: ring3,     ringCount: ringCount3,  ringSpeed: BULLET_SPEED_FAST,      ringColor: COL_BULLET_RING,
        shockwaveInterval: sw3, shockwaveSpeed: swSpeed + 20, shockwaveColor: COL_SHOCKWAVE,
        bubbleInterval: bub3, bubbleCount: bubCount3, bubbleSpeed: bubSpeed + 10, bubbleColor: COL_BUBBLE,
      }),
    ],
  };
}
