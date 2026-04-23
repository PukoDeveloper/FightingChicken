import { TOTAL_LEVELS } from './levels';

// ─── Costume IDs ─────────────────────────────────────────────────────────────
export type CostumeId = 'default' | 'elegant' | 'adventure' | 'hero' | 'boss' | 'moose';

// ─── Stat modifiers (reserved for future use) ────────────────────────────────
/** Multipliers / additive bonuses applied to player stats when a costume is equipped. */
export interface CostumeStats {
  /** Multiplicative speed modifier (1.0 = no change). Reserved, currently unused. */
  speedMult: number;
  /** Multiplicative fire-rate modifier (lower = faster). Reserved, currently unused. */
  fireRateMult: number;
  /** Additive HP bonus on top of base PLAYER_HP_MAX. Reserved, currently unused. */
  hpBonus: number;
}

// ─── Costume definition ──────────────────────────────────────────────────────
export interface CostumeConfig {
  id: CostumeId;
  /** Display name (Chinese) */
  name: string;
  /** Short flavour description */
  description: string;
  /** How this costume is unlocked */
  unlockHint: string;
  /** Stat modifiers – all neutral until actively designed */
  stats: CostumeStats;
}

// ─── Costume catalogue ───────────────────────────────────────────────────────
export const COSTUMES: CostumeConfig[] = [
  {
    id: 'default',
    name: '勇氣小雞',
    description: '充滿鬥志的普通小雞',
    unlockHint: '預設解鎖',
    stats: { speedMult: 1.0, fireRateMult: 1.0, hpBonus: 0 },
  },
  {
    id: 'elegant',
    name: '優雅小雞',
    description: '舉止優雅、氣質出眾的小雞',
    unlockHint: '預設解鎖',
    stats: { speedMult: 1.0, fireRateMult: 1.0, hpBonus: 0 },
  },
  {
    id: 'moose',
    name: '麋鹿小雞',
    description: '頭頂鹿角、憨厚可愛的特殊小雞',
    unlockHint: '預設解鎖',
    stats: { speedMult: 1.0, fireRateMult: 1.0, hpBonus: 0 },
  },
  {
    id: 'adventure',
    name: '冒險小雞',
    description: '走遍四方、無所畏懼的旅行者',
    unlockHint: '通關關卡模式第一關解鎖',
    stats: { speedMult: 1.0, fireRateMult: 1.0, hpBonus: 0 },
  },
  {
    id: 'hero',
    name: '勇者小雞',
    description: '征服所有關卡的傳奇勇者',
    unlockHint: '通關全部關卡解鎖',
    stats: { speedMult: 1.0, fireRateMult: 1.0, hpBonus: 0 },
  },
  {
    id: 'boss',
    name: 'BOSS雞',
    description: '在無盡模式中崛起的究極形態',
    unlockHint: '無盡模式通關 20 關解鎖',
    stats: { speedMult: 1.0, fireRateMult: 1.0, hpBonus: 0 },
  },
];

// ─── Unlock helper ────────────────────────────────────────────────────────────
/**
 * Returns true if the given costume is currently unlocked.
 * @param id       Costume ID to check.
 * @param cleared  Set of level numbers (1-based) that the player has cleared.
 * @param bestWave Best wave reached in endless mode.
 */
export function isCostumeUnlocked(
  id: CostumeId,
  cleared: ReadonlySet<number>,
  bestWave: number,
): boolean {
  switch (id) {
    case 'default':   return true;
    case 'elegant':   return true;
    case 'moose':     return true;
    case 'adventure': return cleared.has(1);
    case 'hero':      return cleared.size >= TOTAL_LEVELS;
    case 'boss':      return bestWave >= 20;
    default:          return false;
  }
}
