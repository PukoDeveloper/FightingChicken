export type EquipmentId =
  | 'silver_blade'
  | 'iron_shield'
  | 'jade_ring'
  | 'stardust_necklace'
  | 'flame_bracer'
  | 'frost_gem'
  | 'thunder_boots'
  | 'moon_cape'
  | 'beam_cannon'
  | 'homing_gun'
  | 'pulse_emitter';

/** The three equipment slot categories. */
export type EquipSlotId = 'weapon' | 'armor' | 'accessory';

/**
 * Identifies which special attack mode a weapon-slot equipment piece provides.
 * When set on the equipped weapon, the player's normal auto-fire pattern is
 * replaced entirely by the corresponding special fire mechanic.
 */
export type WeaponAttackMode = 'beam' | 'homing' | 'pulse';

export interface EquipmentDef {
  id: EquipmentId;
  name: string;
  icon: string;
  /** Short stat description shown in the upgrade panel. */
  stat: string;
  /** Which equipment slot this item belongs to. */
  slot: EquipSlotId;
  /**
   * Only for weapon-slot items: when set, this weapon replaces the player's
   * normal auto-fire with a special attack mode.
   */
  attackMode?: WeaponAttackMode;
}

export const EQUIPMENT_DEFS: EquipmentDef[] = [
  { id: 'silver_blade',      name: '銀色劍刃',    icon: '⚔️',  stat: '攻擊力 +1/升',    slot: 'weapon'    },
  { id: 'iron_shield',       name: '鐵製盾牌',    icon: '🛡️',  stat: '防禦力 +1/升',    slot: 'armor'     },
  { id: 'jade_ring',         name: '翡翠戒指',    icon: '💍',  stat: '速度 +1/升',      slot: 'accessory' },
  { id: 'stardust_necklace', name: '星塵項鍊',    icon: '🌟',  stat: '暴擊 +1/升',      slot: 'accessory' },
  { id: 'flame_bracer',      name: '炎焰護腕',    icon: '🔥',  stat: '攻擊力 +2/升',    slot: 'weapon'    },
  { id: 'frost_gem',         name: '霜雪寶石',    icon: '❄️',  stat: '防禦力 +2/升',    slot: 'armor'     },
  { id: 'thunder_boots',     name: '雷光靴子',    icon: '⚡',  stat: '速度 +2/升',      slot: 'accessory' },
  { id: 'moon_cape',         name: '月影斗篷',    icon: '🌙',  stat: '閃躲 +2/升',      slot: 'armor'     },
  { id: 'beam_cannon',       name: '蓄力光束砲',  icon: '🔵',  stat: '光束傷害 +5/升',  slot: 'weapon',   attackMode: 'beam'   },
  { id: 'homing_gun',        name: '追蹤型子彈',  icon: '🎯',  stat: '追蹤傷害 +2/升',  slot: 'weapon',   attackMode: 'homing' },
  { id: 'pulse_emitter',     name: '近身波發射器', icon: '💫',  stat: '脈衝傷害 +3/升',  slot: 'weapon',   attackMode: 'pulse'  },
];

/** Maximum upgrade level for any single equipment piece. */
export const EQUIPMENT_MAX_LEVEL = 5;

/** Cost in 宇宙灰燼 to perform one upgrade on any equipment piece. */
export const EQUIPMENT_UPGRADE_COST = 3;
