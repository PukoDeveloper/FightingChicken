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
  COL_BULLET_STORM,
  COL_BULLET_FLAME,
  COL_BULLET_SNIPER,
  SHOCKWAVE_EXPAND_SPEED,
  BUBBLE_SPEED,
  PLAYER_HP_MAX,
  PLAYER_FIRE_INTERVAL,
  INVINCIBLE_MS,
  ITEM_SPAWN_MIN_MS,
  ITEM_SPAWN_MAX_MS,
  SNIPER_WARN_MS,
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
  | 'periodic_shield' // gain 2 s invincibility every 12 s
  | 'blood_price'     // max HP -1 (min 1), but each bullet deals +2 damage (stackable)
  | 'bullet_power'    // each bullet deals +1 bonus damage (stackable)
  | 'evasion'         // +10% chance to nullify incoming damage (stackable, capped at 30%)
  | 'regen'           // heal 1 HP every 12 s (stackable: each stack reduces interval by 3 s, min 6 s)
  | 'long_invincible' // +600 ms invincibility after taking damage (stackable)
  | 'item_drop_up';   // item spawn interval reduced 25% per stack (stackable, capped at 75% reduction)

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
    desc: '射擊頻率提高 10%\n（可多次疊加）',
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
  {
    id: 'blood_price',
    name: '血之代價',
    desc: '最大生命 -1（最低 1），\n每顆子彈傷害 +2',
    color: 0x1a0005,
    borderColor: 0xff2255,
  },
  {
    id: 'bullet_power',
    name: '穿甲彈',
    desc: '每顆子彈傷害 +1\n（可多次疊加）',
    color: 0x0d0a00,
    borderColor: 0xffdd00,
  },
  {
    id: 'evasion',
    name: '閃避本能',
    desc: '受到攻擊時有 10% 機率\n完全無效化傷害（最高 30%）',
    color: 0x000a0a,
    borderColor: 0x00eebb,
  },
  {
    id: 'regen',
    name: '生命再生',
    desc: '每隔一段時間\n自動恢復 1 點生命',
    color: 0x001a08,
    borderColor: 0x22ff88,
  },
  {
    id: 'long_invincible',
    name: '無敵延長',
    desc: '受傷後無敵時間\n延長 0.6 秒（可疊加）',
    color: 0x080810,
    borderColor: 0x8888ff,
  },
  {
    id: 'item_drop_up',
    name: '道具好運',
    desc: '道具出現間隔縮短 25%\n（可疊加，最多縮短 75%）',
    color: 0x100a00,
    borderColor: 0xffaa22,
  },
];

/** Non-stackable buff IDs: only one copy can be held at a time. */
const NON_STACKABLE_BUFFS: BuffId[] = ['berserker', 'periodic_shield'];

/** Maximum stack counts for buffs that have a hard cap on usefulness. */
const MAX_BUFF_STACKS: Partial<Record<BuffId, number>> = {
  evasion: 3,        // 3 × 10% = 30% dodge cap; a 4th stack is wasted
  item_drop_up: 3,   // 3 stacks reduces both spawn intervals by 75% (linear), hitting the 2 s / 4 s floors; a 4th is wasted
  regen: 3,          // 3 stacks reaches the 6 s interval floor; a 4th stack is wasted
};

/**
 * Pick `count` unique random buffs from the full pool,
 * filtering out non-stackable buffs already acquired and buffs at max stacks.
 *
 * @param count        Number of buffs to pick.
 * @param currentBuffs Buffs already held by the player.
 * @param ctx          Optional stat context (equipment / costume / skill bonuses).
 *                     When provided, the hp_up ceiling check uses `computeEffectiveStats`
 *                     so that iron_shield, boss costume, and iron_will bonuses are factored in.
 */
export function pickRandomBuffs(count: number, currentBuffs: BuffId[] = [], ctx?: StatContext): BuffDef[] {
  // Compute effective max HP so we can hide irrelevant buffs.
  // When a StatContext is available we use the canonical computeEffectiveStats formula
  // so that equipment / costume / skill bonuses are correctly reflected; otherwise we
  // fall back to the simplified buff-only formula.
  const effectiveHpMax = ctx
    ? computeEffectiveStats(currentBuffs, ctx).effectiveHpMax
    : Math.min(Math.max(PLAYER_HP_MAX + currentBuffs.filter(b => b === 'hp_up').length - currentBuffs.filter(b => b === 'blood_price').length, 1), 10);

  // Pre-compute fire_rate_up floor check: once the interval can no longer decrease,
  // further stacks provide no benefit and should be hidden.
  const fireRateCount = currentBuffs.filter(b => b === 'fire_rate_up').length;
  const curFireInterval = Math.max(Math.round(PLAYER_FIRE_INTERVAL * Math.pow(0.90, fireRateCount)), 60);
  const nxtFireInterval = Math.max(Math.round(PLAYER_FIRE_INTERVAL * Math.pow(0.90, fireRateCount + 1)), 60);
  const fireRateAtFloor = curFireInterval === nxtFireInterval;

  const pool = ALL_BUFFS.filter(buff => {
    // Skip non-stackable buffs the player already has (once acquired they cannot stack further)
    if (NON_STACKABLE_BUFFS.includes(buff.id) && currentBuffs.includes(buff.id)) {
      return false;
    }
    // Skip berserker when max HP ≤ 2: the HP ≤ 2 trigger would be permanently true,
    // making the buff a free unconditional bonus with no meaningful trade-off.
    if (buff.id === 'berserker' && effectiveHpMax <= 2) {
      return false;
    }
    // Skip blood_price when max HP is already at the minimum (1):
    // the -1 HP penalty would be silently capped to no effect, making it a
    // free damage buff with no trade-off.
    if (buff.id === 'blood_price' && effectiveHpMax <= 1) {
      return false;
    }
    // Skip fire_rate_up when the fire interval is already at its hard floor (60 ms):
    // additional stacks would have no effect.
    if (buff.id === 'fire_rate_up' && fireRateAtFloor) {
      return false;
    }
    // Skip hp_up when the effective max HP is already at the hard ceiling (10):
    // additional stacks would not increase max HP or provide any healing.
    if (buff.id === 'hp_up' && effectiveHpMax >= 10) {
      return false;
    }
    // Skip buffs that have reached their stack cap
    const maxStacks = MAX_BUFF_STACKS[buff.id];
    if (maxStacks !== undefined) {
      const held = currentBuffs.filter(b => b === buff.id).length;
      if (held >= maxStacks) return false;
    }
    return true;
  });

  const result: BuffDef[] = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// ─── Stat Context & Unified Stat Computation ──────────────────────────────────

/**
 * All external bonuses (equipment, costume, skill) that modify effective player
 * stats on top of the raw buff stack values. Pass this to `computeEffectiveStats`
 * so that descriptions in `buffDesc` show the exact in-game numbers.
 */
export interface StatContext {
  /** Extra attack damage from rapid_shot equipment (0 if not equipped). */
  equipAttackBonus: number;
  /** Extra max HP from iron_shield equipment (0 if not equipped). */
  equipDefenseBonus: number;
  /** Extra invincibility duration (ms) from frost_gem equipment (0 if not equipped). */
  equipInvincibleBonus: number;
  /** Extra evasion chance (0–1 fraction) from moon_cape equipment (0 if not equipped). */
  equipEvasionBonus: number;
  /** Whether the boss costume (×1.5 multiplier to all stats) is active. */
  isBossCostume: boolean;
  /** Whether the fox costume (−30% item spawn intervals) is active. */
  isFoxCostume: boolean;
  /** Whether the iron_will skill (+1 max HP) is selected. */
  skillIronWill: boolean;
  /** Level-specific item-drop frequency multiplier (< 1 = more frequent; always 1.0 in endless mode). */
  levelItemDropMult: number;
}

/** Effective player stats after applying all buffs and external context modifiers. */
export interface EffectiveStats {
  effectiveHpMax: number;
  effectiveFireInterval: number;
  bulletDamage: number;
  evasionChance: number;
  effectiveInvincibleMs: number;
  itemSpawnMinMs: number;
  itemSpawnMaxMs: number;
  /** 0 means regen is inactive (no regen buffs). */
  regenIntervalMs: number;
}

/** Context with no equipment, default costume, and no skill bonuses (useful as a fallback). */
export const DEFAULT_STAT_CONTEXT: StatContext = {
  equipAttackBonus: 0,
  equipDefenseBonus: 0,
  equipInvincibleBonus: 0,
  equipEvasionBonus: 0,
  isBossCostume: false,
  isFoxCostume: false,
  skillIronWill: false,
  levelItemDropMult: 1.0,
};

/** Boss costume stat multiplier (mirrors BOSS_STAT_MULT in GameScene). */
const BOSS_STAT_MULT = 1.5;

/**
 * Compute the player's effective stats from a combined buff list and external
 * context. This is the single canonical formula used by both GameScene (runtime)
 * and EndlessBuffScene (preview descriptions), ensuring the two always agree.
 */
export function computeEffectiveStats(buffs: BuffId[], ctx: StatContext): EffectiveStats {
  const count = (id: BuffId): number => buffs.filter(b => b === id).length;

  const buffHpUpCount        = count('hp_up');
  const buffFireRateCount    = count('fire_rate_up');
  const buffBloodPriceCount  = count('blood_price');
  const buffBulletPowerCount = count('bullet_power');
  const buffEvasionCount     = count('evasion');
  const buffLongInvCount     = count('long_invincible');
  const buffItemDropCount    = count('item_drop_up');
  const buffRegenCount       = count('regen');

  let effectiveHpMax = Math.min(
    Math.max(PLAYER_HP_MAX + buffHpUpCount - buffBloodPriceCount + (ctx.skillIronWill ? 1 : 0), 1),
    10,
  );
  let effectiveFireInterval = Math.max(
    Math.round(PLAYER_FIRE_INTERVAL * Math.pow(0.90, buffFireRateCount)),
    60,
  );
  let bulletDamage = 1 + buffBloodPriceCount * 2 + buffBulletPowerCount;
  let evasionChance = Math.min(buffEvasionCount * 0.10, 0.30);
  let effectiveInvincibleMs = INVINCIBLE_MS + buffLongInvCount * 600;
  let itemSpawnMinMs = buffItemDropCount > 0
    ? Math.max(Math.round(ITEM_SPAWN_MIN_MS * ctx.levelItemDropMult * Math.max(1 - 0.25 * buffItemDropCount, 0)), 2000)
    : Math.round(ITEM_SPAWN_MIN_MS * ctx.levelItemDropMult);
  let itemSpawnMaxMs = buffItemDropCount > 0
    ? Math.max(Math.round(ITEM_SPAWN_MAX_MS * ctx.levelItemDropMult * Math.max(1 - 0.25 * buffItemDropCount, 0)), 4000)
    : Math.round(ITEM_SPAWN_MAX_MS * ctx.levelItemDropMult);
  let regenIntervalMs = buffRegenCount > 0 ? Math.max(15000 - buffRegenCount * 3000, 6000) : 0;

  if (ctx.isBossCostume) {
    effectiveHpMax        = Math.min(Math.round(effectiveHpMax * BOSS_STAT_MULT), 10);
    effectiveFireInterval = Math.max(Math.round(effectiveFireInterval / BOSS_STAT_MULT), 60);
    bulletDamage          = Math.round(bulletDamage * BOSS_STAT_MULT);
    effectiveInvincibleMs = Math.round(effectiveInvincibleMs * BOSS_STAT_MULT);
    evasionChance         = Math.min(evasionChance * BOSS_STAT_MULT, 0.30);
    itemSpawnMinMs        = Math.max(Math.round(itemSpawnMinMs / BOSS_STAT_MULT), 2000);
    itemSpawnMaxMs        = Math.max(Math.round(itemSpawnMaxMs / BOSS_STAT_MULT), 4000);
    regenIntervalMs       = regenIntervalMs > 0 ? Math.max(Math.round(regenIntervalMs / BOSS_STAT_MULT), 6000) : 0;
  }

  if (ctx.isFoxCostume) {
    itemSpawnMinMs = Math.max(Math.round(itemSpawnMinMs * 0.7), 2000);
    itemSpawnMaxMs = Math.max(Math.round(itemSpawnMaxMs * 0.7), 4000);
  }

  bulletDamage          += ctx.equipAttackBonus;
  effectiveHpMax         = Math.min(effectiveHpMax + ctx.equipDefenseBonus, 10);
  evasionChance          = Math.min(evasionChance + ctx.equipEvasionBonus, 0.30);
  effectiveInvincibleMs += ctx.equipInvincibleBonus;

  return {
    effectiveHpMax,
    effectiveFireInterval,
    bulletDamage,
    evasionChance,
    effectiveInvincibleMs,
    itemSpawnMinMs,
    itemSpawnMaxMs,
    regenIntervalMs,
  };
}

// ─── Dynamic Buff Descriptions ────────────────────────────────────────────────

/** Helper: format milliseconds as a clean seconds string (1 decimal, no trailing zero). */
function toSec(ms: number): string {
  return `${parseFloat((ms / 1000).toFixed(1))}s`;
}

/**
 * Returns a dynamic description for a buff card showing the player's current
 * value and the expected value *after* selecting this buff.
 *
 * Uses `computeEffectiveStats` for both the before and after snapshots so that
 * the displayed numbers always match the actual in-game values, including
 * equipment bonuses, costume multipliers, and skill effects.
 *
 * @param id          The buff being previewed.
 * @param currentBuffs Buffs already held (before this selection).
 * @param currentHp   Player's actual HP entering this screen (0 = omit HP line).
 * @param ctx         External modifier context; defaults to `DEFAULT_STAT_CONTEXT`.
 */
export function buffDesc(
  id: BuffId,
  currentBuffs: BuffId[],
  currentHp: number = 0,
  ctx: StatContext = DEFAULT_STAT_CONTEXT,
): string {
  const cur = computeEffectiveStats(currentBuffs, ctx);
  const nxt = computeEffectiveStats([...currentBuffs, id], ctx);
  const count = (b: BuffId): number => currentBuffs.filter(x => x === b).length;

  switch (id) {
    case 'fire_rate_up': {
      const n = count('fire_rate_up');
      if (cur.effectiveFireInterval === nxt.effectiveFireInterval)
        return `射擊間隔：${cur.effectiveFireInterval}ms（已達最短間隔）\n（已疊加 ${n} 次）`;
      if (n === 0)
        return `射擊間隔：${cur.effectiveFireInterval}ms → ${nxt.effectiveFireInterval}ms\n（每次提升 10%，可多次疊加）`;
      return `射擊間隔：${cur.effectiveFireInterval}ms → ${nxt.effectiveFireInterval}ms\n（已疊加 ${n} 次）`;
    }

    case 'triple_shot': {
      const n = count('triple_shot');
      const bullets = 1 + n;
      if (n === 0)
        return `每次射擊子彈數：${bullets} → ${bullets + 1} 顆\n（每次疊加 +1 顆）`;
      return `每次射擊子彈數：${bullets} → ${bullets + 1} 顆\n（已疊加 ${n} 次）`;
    }

    case 'blood_price': {
      const dmgDelta = nxt.bulletDamage - cur.bulletDamage;
      const hpDelta  = nxt.effectiveHpMax - cur.effectiveHpMax;
      const hpNote   = hpDelta < 0 ? `（${hpDelta}）` : '（無變化）';
      return `傷害：${cur.bulletDamage} → ${nxt.bulletDamage}（+${dmgDelta}）\n生命上限：${cur.effectiveHpMax} → ${nxt.effectiveHpMax}${hpNote}`;
    }

    case 'bullet_power': {
      const n        = count('bullet_power');
      const dmgDelta = nxt.bulletDamage - cur.bulletDamage;
      if (n === 0)
        return `子彈傷害：${cur.bulletDamage} → ${nxt.bulletDamage}（+${dmgDelta}）\n（可多次疊加）`;
      return `子彈傷害：${cur.bulletDamage} → ${nxt.bulletDamage}（+${dmgDelta}）\n（已疊加 ${n} 次）`;
    }

    case 'evasion': {
      const n      = count('evasion');
      const curPct = Math.round(cur.evasionChance * 100);
      const nxtPct = Math.round(nxt.evasionChance * 100);
      if (n === 0)
        return `閃避機率：${curPct}% → ${nxtPct}%\n（每次 +10%，上限 30%）`;
      return `閃避機率：${curPct}% → ${nxtPct}%\n（已疊加 ${n} 次，上限 30%）`;
    }

    case 'regen': {
      const n = count('regen');
      if (n === 0)
        return `每 ${toSec(nxt.regenIntervalMs)} 自動回復 1 HP\n（可疊加 3 次）`;
      if (cur.regenIntervalMs === nxt.regenIntervalMs)
        return `每 ${toSec(cur.regenIntervalMs)} 自動回復 1 HP\n（已達最短間隔，疊加 ${n} 次）`;
      return `回復間隔：${toSec(cur.regenIntervalMs)} → ${toSec(nxt.regenIntervalMs)}\n（已疊加 ${n} 次）`;
    }

    case 'long_invincible': {
      const n     = count('long_invincible');
      const delta = nxt.effectiveInvincibleMs - cur.effectiveInvincibleMs;
      if (n === 0)
        return `受傷無敵：${toSec(cur.effectiveInvincibleMs)} → ${toSec(nxt.effectiveInvincibleMs)}（+${toSec(delta)}）\n（可多次疊加）`;
      return `受傷無敵：${toSec(cur.effectiveInvincibleMs)} → ${toSec(nxt.effectiveInvincibleMs)}（+${toSec(delta)}）\n（已疊加 ${n} 次）`;
    }

    case 'item_drop_up': {
      const n = count('item_drop_up');
      if (n === 0)
        return `道具最長間隔：${toSec(cur.itemSpawnMaxMs)} → ${toSec(nxt.itemSpawnMaxMs)}\n（每次縮短 25%，最多疊加 3 次）`;
      const nxtReductionPct = Math.min((n + 1) * 25, 100);
      return `道具最長間隔：${toSec(cur.itemSpawnMaxMs)} → ${toSec(nxt.itemSpawnMaxMs)}\n（已疊加 ${n + 1} 次，累計縮短 ${nxtReductionPct}%）`;
    }

    case 'hp_up': {
      const hpNow   = currentHp > 0 ? currentHp : cur.effectiveHpMax;
      const hpAfter = Math.min(hpNow + 1, nxt.effectiveHpMax);
      return `生命上限：${cur.effectiveHpMax} → ${nxt.effectiveHpMax}（+1）\nHP：${hpNow}/${cur.effectiveHpMax} → ${hpAfter}/${nxt.effectiveHpMax}`;
    }

    case 'hp_restore': {
      const heal    = Math.ceil(cur.effectiveHpMax / 2);
      const hpNow   = currentHp > 0 ? currentHp : cur.effectiveHpMax;
      const hpAfter = Math.min(hpNow + heal, cur.effectiveHpMax);
      const gained  = hpAfter - hpNow;
      if (gained <= 0)
        return `立即恢復 HP（上限 ${heal}）\nHP：${hpNow}/${cur.effectiveHpMax}（已滿血，效果浪費）`;
      return `立即恢復 ${gained} HP\nHP：${hpNow}/${cur.effectiveHpMax} → ${hpAfter}/${cur.effectiveHpMax}`;
    }

    case 'periodic_shield':
      return `每 12 秒自動觸發 2 秒無敵效果\n（不可疊加）`;

    case 'berserker':
      return `生命 ≤ 2 時射速加倍\n（不可疊加）`;

    default: {
      return ALL_BUFFS.find(b => b.id === id)?.desc ?? '';
    }
  }
}

// ─── Endless Wave Generator ───────────────────────────────────────────────────

/**
 * Returns the enemy type for the given endless wave number.
 * Waves 1-5   → courage
 * Waves 6-10  → phantom
 * Waves 11-15 → chaos
 * Waves 16-20 → storm
 * Waves 21+   → rotating: chaos / storm / dragon
 */
export function endlessEnemyType(waveNum: number): EnemyType {
  if (waveNum <= 5) return 'courage';
  if (waveNum <= 10) return 'phantom';
  if (waveNum <= 15) return 'chaos';
  if (waveNum <= 20) return 'storm';
  // Wave 21+: cycle through chaos → storm → dragon every 3 waves
  const cycle = ((waveNum - 21) % 9);
  if (cycle < 3) return 'chaos';
  if (cycle < 6) return 'storm';
  return 'dragon';
}

/**
 * After this wave number all hard upper-bound caps are lifted so that
 * difficulty can scale without limit — making the mode feel truly endless.
 */
const ENDLESS_UNCAP_WAVE = 20;

/**
 * Build a WaveConfig for an endless-mode wave.
 * Difficulty scales smoothly with `waveNum` (1-based).
 */
export function createEndlessWaveConfig(waveNum: number): WaveConfig {
  // Each wave is ~15% harder than the previous.
  const d = Math.pow(1.15, waveNum - 1);

  // After ENDLESS_UNCAP_WAVE the hard caps are lifted so values grow freely.
  const uncapped = waveNum >= ENDLESS_UNCAP_WAVE;
  const capAt = (val: number, max: number) => uncapped ? val : Math.min(val, max);

  // Enemy HP: exponential raw growth soft-capped so it asymptotically
  // approaches ENDLESS_HP_SOFT_CAP and can never reach or exceed it.
  const ENDLESS_HP_SOFT_CAP = 95000;
  const rawHp = Math.round(150 * d);
  const hp = Math.round(ENDLESS_HP_SOFT_CAP * rawHp / (ENDLESS_HP_SOFT_CAP + rawHp));

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

  // Way counts grow slowly; caps are lifted after ENDLESS_UNCAP_WAVE.
  const spiralWays1 = capAt(6 + Math.floor((waveNum - 1) * 0.8), 20);
  const spiralWays2 = capAt(9 + Math.floor((waveNum - 1) * 0.9), 24);
  const spiralWays3 = capAt(12 + Math.floor((waveNum - 1) * 1.0), 28);

  const aimWays1 = capAt(2 + Math.floor((waveNum - 1) * 0.3), 6);
  const aimWays2 = capAt(3 + Math.floor((waveNum - 1) * 0.3), 7);
  const aimWays3 = capAt(4 + Math.floor((waveNum - 1) * 0.35), 8);

  const ringCount3 = capAt(20 + Math.floor((waveNum - 1) * 2), 56);

  // Introduce shockwaves from wave 6, bubbles from wave 6 too.
  const hasShockwave = waveNum >= 6;
  const hasBubble = waveNum >= 6;
  const sw1 = hasShockwave ? Math.max(2500, Math.round(6000 / d)) : 0;
  const sw2 = hasShockwave ? Math.max(2000, Math.round(4500 / d)) : 0;
  const sw3 = hasShockwave ? Math.max(1500, Math.round(3200 / d)) : 0;
  const swSpeed = capAt(SHOCKWAVE_EXPAND_SPEED + (waveNum - 6) * 8, 320);

  const bub1 = hasBubble ? Math.max(2800, Math.round(6500 / d)) : 0;
  const bub2 = hasBubble ? Math.max(2200, Math.round(5000 / d)) : 0;
  const bub3 = hasBubble ? Math.max(1800, Math.round(3800 / d)) : 0;
  const bubSpeed = capAt(BUBBLE_SPEED + (waveNum - 6) * 5, 200);
  const bubCount1 = hasBubble ? capAt(1 + Math.floor((waveNum - 6) * 0.2), 3) : 1;
  const bubCount2 = hasBubble ? capAt(2 + Math.floor((waveNum - 6) * 0.2), 4) : 1;
  const bubCount3 = hasBubble ? capAt(2 + Math.floor((waveNum - 6) * 0.25), 5) : 1;

  // Introduce scatter from wave 16.
  const hasScatter = waveNum >= 16;
  const sc1 = hasScatter ? Math.max(2000, Math.round(5000 / d)) : 0;
  const sc2 = hasScatter ? Math.max(1500, Math.round(3800 / d)) : 0;
  const sc3 = hasScatter ? Math.max(1200, Math.round(2800 / d)) : 0;
  const scCount1 = hasScatter ? capAt(8 + Math.floor((waveNum - 16) * 0.4), 20) : 8;
  const scCount2 = hasScatter ? capAt(12 + Math.floor((waveNum - 16) * 0.4), 24) : 12;
  const scCount3 = hasScatter ? capAt(16 + Math.floor((waveNum - 16) * 0.5), 30) : 16;

  // Introduce flame from wave 21.
  const hasFlame = waveNum >= 21;
  const fl1 = hasFlame ? Math.max(2000, Math.round(4500 / d)) : 0;
  const fl2 = hasFlame ? Math.max(1500, Math.round(3400 / d)) : 0;
  const fl3 = hasFlame ? Math.max(1200, Math.round(2600 / d)) : 0;
  const flWaves = hasFlame ? capAt(3 + Math.floor((waveNum - 21) * 0.15), 7) : 3;
  const flCount = hasFlame ? capAt(5 + Math.floor((waveNum - 21) * 0.2), 10) : 5;

  // Introduce sniper from wave 21.
  const hasSniper = waveNum >= 21;
  const sn1 = hasSniper ? Math.max(3500, Math.round(8000 / d)) : 0;
  const sn2 = hasSniper ? Math.max(2500, Math.round(6000 / d)) : 0;
  const sn3 = hasSniper ? Math.max(1800, Math.round(4500 / d)) : 0;
  const snSpeed = capAt(550 + (waveNum - 21) * 10, 900);

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
        scatterInterval: sc1, scatterCount: scCount1, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_MEDIUM, scatterColor: COL_BULLET_STORM,
        flameInterval: fl1, flameWaves: flWaves, flameWaveGapMs: 200, flameCount: flCount, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
        sniperInterval: sn1, sniperWarnMs: SNIPER_WARN_MS, sniperSpeed: snSpeed, sniperColor: COL_BULLET_SNIPER,
      }),
      makePhase({
        spiralInterval: spiral2, spiralWays: spiralWays2, spiralSpeed: BULLET_SPEED_MEDIUM, spiralColor: COL_BULLET_P2,
        aimInterval:    aim2,    aimWays: aimWays2,       aimSpread: 0.27,                  aimSpeed: BULLET_SPEED_MEDIUM, aimColor: COL_BULLET_P2,
        spreadInterval: spread2, spreadWays: aimWays2 + 2, spreadAngle: 0.22, spreadSpeed: BULLET_SPEED_SLOW, spreadColor: COL_BULLET_P2,
        ringInterval: ring3 + 500, ringCount: ringCount3 - 8, ringSpeed: BULLET_SPEED_MEDIUM, ringColor: COL_BULLET_RING,
        shockwaveInterval: sw2, shockwaveSpeed: swSpeed + 10, shockwaveColor: COL_SHOCKWAVE,
        bubbleInterval: bub2, bubbleCount: bubCount2, bubbleSpeed: bubSpeed, bubbleColor: COL_BUBBLE,
        scatterInterval: sc2, scatterCount: scCount2, scatterSpeedMin: BULLET_SPEED_SLOW, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
        flameInterval: fl2, flameWaves: flWaves, flameWaveGapMs: 185, flameCount: flCount, flameSpeed: BULLET_SPEED_MEDIUM, flameColor: COL_BULLET_FLAME,
        sniperInterval: sn2, sniperWarnMs: SNIPER_WARN_MS - 100, sniperSpeed: snSpeed + 30, sniperColor: COL_BULLET_SNIPER,
      }),
      makePhase({
        spiralInterval: spiral3, spiralWays: spiralWays3, spiralSpeed: BULLET_SPEED_FAST,   spiralColor: COL_BULLET_P3,
        aimInterval:    aim3,    aimWays: aimWays3,       aimSpread: 0.20,                  aimSpeed: BULLET_SPEED_FAST,  aimColor: COL_BULLET_P3,
        spreadInterval: spread3, spreadWays: aimWays3 + 3, spreadAngle: 0.18, spreadSpeed: BULLET_SPEED_MEDIUM, spreadColor: COL_BULLET_P3,
        ringInterval: ring3,     ringCount: ringCount3,  ringSpeed: BULLET_SPEED_FAST,      ringColor: COL_BULLET_RING,
        shockwaveInterval: sw3, shockwaveSpeed: swSpeed + 20, shockwaveColor: COL_SHOCKWAVE,
        bubbleInterval: bub3, bubbleCount: bubCount3, bubbleSpeed: bubSpeed + 10, bubbleColor: COL_BUBBLE,
        scatterInterval: sc3, scatterCount: scCount3, scatterSpeedMin: BULLET_SPEED_MEDIUM, scatterSpeedMax: BULLET_SPEED_FAST, scatterColor: COL_BULLET_STORM,
        flameInterval: fl3, flameWaves: flWaves + 1, flameWaveGapMs: 170, flameCount: flCount, flameSpeed: BULLET_SPEED_FAST, flameColor: COL_BULLET_FLAME,
        sniperInterval: sn3, sniperWarnMs: Math.max(600, SNIPER_WARN_MS - 200), sniperSpeed: snSpeed + 60, sniperColor: COL_BULLET_SNIPER,
      }),
    ],
  };
}
