export type EquipmentId =
  | 'silver_blade'
  | 'iron_shield'
  | 'jade_ring'
  | 'stardust_necklace'
  | 'flame_bracer'
  | 'frost_gem'
  | 'thunder_boots'
  | 'moon_cape';

/** The three equipment slot categories. */
export type EquipSlotId = 'weapon' | 'armor' | 'accessory';

export interface EquipmentDef {
  id: EquipmentId;
  name: string;
  icon: string;
  /** Short stat description shown in the upgrade panel. */
  stat: string;
  /** Which equipment slot this item belongs to. */
  slot: EquipSlotId;
}

export const EQUIPMENT_DEFS: EquipmentDef[] = [
  { id: 'silver_blade',      name: '銀色劍刃', icon: '⚔️',  stat: '攻擊力 +1/升', slot: 'weapon'    },
  { id: 'iron_shield',       name: '鐵製盾牌', icon: '🛡️',  stat: '防禦力 +1/升', slot: 'armor'     },
  { id: 'jade_ring',         name: '翡翠戒指', icon: '💍',  stat: '速度 +1/升',   slot: 'accessory' },
  { id: 'stardust_necklace', name: '星塵項鍊', icon: '🌟',  stat: '暴擊 +1/升',   slot: 'accessory' },
  { id: 'flame_bracer',      name: '炎焰護腕', icon: '🔥',  stat: '攻擊力 +2/升', slot: 'weapon'    },
  { id: 'frost_gem',         name: '霜雪寶石', icon: '❄️',  stat: '防禦力 +2/升', slot: 'armor'     },
  { id: 'thunder_boots',     name: '雷光靴子', icon: '⚡',  stat: '速度 +2/升',   slot: 'accessory' },
  { id: 'moon_cape',         name: '月影斗篷', icon: '🌙',  stat: '閃躲 +2/升',   slot: 'armor'     },
];

/** Maximum upgrade level for any single equipment piece. */
export const EQUIPMENT_MAX_LEVEL = 5;

/** Cost in 宇宙灰燼 to perform one upgrade on any equipment piece. */
export const EQUIPMENT_UPGRADE_COST = 3;
