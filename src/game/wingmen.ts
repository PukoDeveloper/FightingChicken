// ─── Wingman Chicken (僚雞) definitions ───────────────────────────────────────

/** Unique identifier for each wingman companion. */
export type WingmanId = 'gunner' | 'medic' | 'hunter' | 'pulsar' | 'bouncer';

/** The gameplay mechanic each wingman uses. */
export type WingmanAbilityKey = 'rapid' | 'heal' | 'homing' | 'pulse' | 'bounce';

export interface WingmanDef {
  id: WingmanId;
  name: string;
  icon: string;
  /** Primary body colour for the sprite. */
  bodyColor: number;
  /** Comb / accent colour for the sprite. */
  accentColor: number;
  /** Short ability description shown in the UI. */
  abilityDesc: string;
  /** The gameplay mechanic this wingman uses. */
  abilityKey: WingmanAbilityKey;
}

export const WINGMAN_DEFS: WingmanDef[] = [
  {
    id: 'gunner',
    name: '射手僚雞',
    icon: '🔫',
    bodyColor:   0x44bbee,
    accentColor: 0x00cccc,
    abilityDesc: '快速連射，每升 1 級攻擊力 +1',
    abilityKey:  'rapid',
  },
  {
    id: 'medic',
    name: '醫護僚雞',
    icon: '💚',
    bodyColor:   0x33cc66,
    accentColor: 0x00ff88,
    abilityDesc: '定期治療玩家 1 點生命，每升 1 級縮短治療間隔',
    abilityKey:  'heal',
  },
  {
    id: 'hunter',
    name: '獵人僚雞',
    icon: '🎯',
    bodyColor:   0xff6622,
    accentColor: 0xffaa00,
    abilityDesc: '發射追蹤彈，每升 1 級傷害 +1',
    abilityKey:  'homing',
  },
  {
    id: 'pulsar',
    name: '脈衝僚雞',
    icon: '💫',
    bodyColor:   0xaa22dd,
    accentColor: 0xff44ff,
    abilityDesc: '發射擴散脈衝波，每升 1 級傷害 +2',
    abilityKey:  'pulse',
  },
  {
    id: 'bouncer',
    name: '彈射僚雞',
    icon: '🏐',
    bodyColor:   0xccaa00,
    accentColor: 0xffee44,
    abilityDesc: '發射反彈追蹤彈，撞頂後轉向追蹤敵人，每升 1 級傷害 +1',
    abilityKey:  'bounce',
  },
];

/** Maximum upgrade level for any wingman (level up on duplicate draw). */
export const WINGMAN_MAX_LEVEL = 5;

/** Cosmic Ash cost to perform one wingman gacha draw. */
export const WINGMAN_GACHA_COST = 3;

/**
 * Cosmic Ash refunded when a duplicate draw lands on a wingman that is
 * already at WINGMAN_MAX_LEVEL.
 */
export const WINGMAN_DUPE_REFUND = 1;
