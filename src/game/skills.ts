// ─── Skill IDs ────────────────────────────────────────────────────────────────

export type SkillId =
  | 'swift_dodge'   // Active: gain 2 s invincibility (cooldown 15 s)
  | 'burst_fire'    // Active: double fire-rate for 4 s  (cooldown 18 s)
  | 'bullet_clear'  // Active: clear all enemy bullets   (cooldown 22 s)
  | 'eagle_eye'     // Passive: enemy bullets at 80 % speed
  | 'fortune'       // Passive: 25 % chance to heal 1 HP on any item pickup
  | 'iron_will';    // Passive: max HP +1

export type SkillType = 'active' | 'passive';

// ─── Skill definition ─────────────────────────────────────────────────────────

export interface SkillDef {
  id: SkillId;
  /** Display name (Chinese) */
  name: string;
  /** Flavour description */
  description: string;
  /** Short one-liner shown directly on the skill card */
  effect: string;
  type: SkillType;
  /** Active skills only – cooldown in ms */
  cooldownMs?: number;
  /** Card background colour */
  color: number;
  /** Card border / accent colour */
  borderColor: number;
}

// ─── Skill catalogue ──────────────────────────────────────────────────────────

export const SKILLS: SkillDef[] = [
  {
    id: 'swift_dodge',
    name: '急速閃避',
    description: '【主動】按下技能鍵\n立即獲得 2 秒無敵狀態\n冷卻時間：15 秒',
    effect: '立即獲得 2 秒無敵狀態',
    type: 'active',
    cooldownMs: 15000,
    color: 0x080d1a,
    borderColor: 0x44aaff,
  },
  {
    id: 'burst_fire',
    name: '連射爆發',
    description: '【主動】按下技能鍵\n射速加倍持續 4 秒\n冷卻時間：18 秒',
    effect: '射速加倍，持續 4 秒',
    type: 'active',
    cooldownMs: 18000,
    color: 0x1a0f00,
    borderColor: 0xffcc00,
  },
  {
    id: 'bullet_clear',
    name: '彈幕消除',
    description: '【主動】按下技能鍵\n消除畫面所有敵方子彈\n冷卻時間：22 秒',
    effect: '消除畫面所有敵方子彈',
    type: 'active',
    cooldownMs: 22000,
    color: 0x0d0a18,
    borderColor: 0xcc44ff,
  },
  {
    id: 'eagle_eye',
    name: '鷹眼',
    description: '【被動】\n所有敵方子彈速度\n降低 20%',
    effect: '所有敵方子彈速度降低 20%',
    type: 'passive',
    color: 0x001a08,
    borderColor: 0x22ff88,
  },
  {
    id: 'fortune',
    name: '好運附體',
    description: '【被動】\n拾取任何道具時\n有 25% 機率額外恢復 1 點生命',
    effect: '拾取道具時 25% 機率額外回血',
    type: 'passive',
    color: 0x100a00,
    borderColor: 0xffaa22,
  },
  {
    id: 'iron_will',
    name: '鋼鐵意志',
    description: '【被動】\n最大生命值增加 1',
    effect: '最大生命值 +1',
    type: 'passive',
    color: 0x1a0505,
    borderColor: 0xff4466,
  },
];
