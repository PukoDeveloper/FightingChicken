// ─── Screen & Layout ────────────────────────────────────────────────────────
/** Logical game width in px (canvas fills window via resizeTo) */
export const GAME_W = 390;
/** Logical game height in px */
export const GAME_H = 844;

// ─── Player ─────────────────────────────────────────────────────────────────
export const PLAYER_HP_MAX = 5;
/** Radius of the player's hitbox (small for bullet-hell dodging) */
export const PLAYER_HITBOX_R = 7;
/** Player bullet speed in px/s */
export const PLAYER_BULLET_SPEED = 520;
/** Player auto-fire interval in ms */
export const PLAYER_FIRE_INTERVAL = 280;
/** Player bullet radius (visual) */
export const PLAYER_BULLET_R = 5;
/** Invincibility duration after taking a hit in ms */
export const INVINCIBLE_MS = 1200;
/** Default player movement speed in px/s */
export const PLAYER_MOVE_SPEED = 380;

// ─── Enemy (Courage / 勇氣) ──────────────────────────────────────────────────
export const ENEMY_HP_MAX = 200;
/** Radius of the enemy's hitbox */
export const ENEMY_HITBOX_R = 42;

// ─── Enemy bullet speeds (px/s) ──────────────────────────────────────────────
export const BULLET_SPEED_SLOW   = 140;
export const BULLET_SPEED_MEDIUM = 200;
export const BULLET_SPEED_FAST   = 270;

/** Enemy bullet visual radius */
export const ENEMY_BULLET_R = 6;

// ─── Phase thresholds ────────────────────────────────────────────────────────
/** HP fraction at which phase 2 starts */
export const PHASE2_FRAC = 0.66;
/** HP fraction at which phase 3 starts */
export const PHASE3_FRAC = 0.33;

// ─── Pickups ─────────────────────────────────────────────────────────────────
/** Pickup falling speed in px/s */
export const ITEM_FALL_SPEED = 120;
/** Collection radius for pickups (px) */
export const ITEM_COLLECT_R = 22;
/** Time before an uncollected pickup disappears (ms) */
export const ITEM_LIFETIME_MS = 7000;
/** Minimum time between pickup spawns (ms) */
export const ITEM_SPAWN_MIN_MS = 8000;
/** Maximum time between pickup spawns (ms) */
export const ITEM_SPAWN_MAX_MS = 16000;
/** Duration of the damage power-up (ms) */
export const POWER_UP_DURATION_MS = 8000;
/** Fire interval while damage power-up is active (ms) */
export const POWER_FIRE_INTERVAL = 140;
/** Probability (0–1) that a spawned pickup is a health item vs a power item */
export const HEALTH_ITEM_PROB = 0.7;
/** Fixed interval (ms) between moose-costume gift-box spawns (independent of normal item spawns) */
export const MOOSE_GIFT_INTERVAL_MS = 8000;
/** Invincibility duration granted when collecting a health item (ms) */
export const HEALTH_ITEM_INVINCIBLE_MS = 2000;

// ─── Scoring ─────────────────────────────────────────────────────────────────
export const SCORE_PER_HIT = 10;
/** Multiplied by the wave's max HP to compute the wave-clear bonus score. */
export const SCORE_BONUS_WAVE_MULT = 20;

// ─── Enemy types ─────────────────────────────────────────────────────────────
/** Identifies which enemy sprite & theme is used for a level. */
export type EnemyType = 'courage' | 'phantom' | 'chaos' | 'blackhole' | 'mech' | 'storm' | 'dragon';

// ─── Void Realm mode ─────────────────────────────────────────────────────────
/** Duration of a Void Realm timed session in ms (60 seconds). */
export const VOID_DURATION_MS = 60000;

// ─── Shockwave ────────────────────────────────────────────────────────────────
/** Default shockwave ring expansion speed in px/s */
export const SHOCKWAVE_EXPAND_SPEED = 210;
/** Maximum shockwave radius (px) before it despawns */
export const SHOCKWAVE_MAX_RADIUS   = 290;
/** Visual and collision half-thickness of the shockwave ring (px) */
export const SHOCKWAVE_THICKNESS    = 22;

// ─── Trap Bubble ─────────────────────────────────────────────────────────────
/** Default trap-bubble travel speed in px/s */
export const BUBBLE_SPEED     = 90;
/** Collision radius of a trap bubble (px) */
export const BUBBLE_HITBOX_R  = 12;
/** Duration the player is slowed when hit by a bubble (ms) */
export const TRAP_DURATION_MS = 2500;
/** Player speed multiplier while trapped (fraction of normal) */
export const TRAP_SLOW_FACTOR = 0.22;

// ─── Colours ─────────────────────────────────────────────────────────────────
export const COL_BG          = 0x000011;
export const COL_STAR        = 0xffffff;
export const COL_PLAYER_BULLET = 0xffff44;
export const COL_BULLET_P1   = 0xff4444; // phase 1 – red
export const COL_BULLET_P2   = 0xff8800; // phase 2 – orange
export const COL_BULLET_P3   = 0xcc44ff; // phase 3 – purple
export const COL_BULLET_RING = 0x44ccff; // ring burst – cyan
export const COL_SHOCKWAVE   = 0xffee00; // shockwave ring – yellow
export const COL_BUBBLE      = 0x44ddff; // trap bubble – cyan
export const COL_BULLET_BOMB  = 0xff7700; // exploding bomb projectile – orange
export const COL_BULLET_LASER = 0x00ffff; // top-screen laser column – bright cyan
export const COL_BULLET_CURVE = 0xff44cc; // homing/curving bullet – pink
export const COL_BULLET_MECH  = 0x44aaff; // mech straight-down shot – steel blue
export const COL_BULLET_STORM  = 0xee66ff; // storm scatter – electric violet
export const COL_BULLET_FLAME  = 0xff5500; // dragon flame – deep orange
export const COL_BULLET_SNIPER = 0xffffff; // sniper beam – white

// ─── Adventure Chicken ────────────────────────────────────────────────────────
/** Distance (px) at or below which the adventure costume's max damage multiplier applies */
export const ADVENTURE_PROXIMITY_MIN_DIST = 60;
/** Distance (px) at or beyond which the adventure costume grants no extra damage (1×) */
export const ADVENTURE_PROXIMITY_MAX_DIST = 350;
/** Maximum damage multiplier when the player is at ADVENTURE_PROXIMITY_MIN_DIST or closer */
export const ADVENTURE_PROXIMITY_MAX_MULT = 4;

// ─── Weapon equipment attack modes ──────────────────────────────────────────

// Frost gem (霜雪寶石)
/** Extra post-hit invincibility duration (ms) added per upgrade level for the frost gem */
export const FROST_GEM_INVINCIBLE_BONUS = 150;

// Beam cannon (蓄力光束砲)
/** Milliseconds needed to fully charge one beam shot */
export const BEAM_CHARGE_MAX_MS = 1800;
/** Extra damage added per upgrade level for the beam cannon */
export const BEAM_DAMAGE_PER_LEVEL = 6;
/** Visual and collision radius of the beam projectile (px) */
export const BEAM_BULLET_R = 12;
/** Travel speed of a fired beam bolt (px/s) */
export const BEAM_SPEED = 700;
/** Beam bolt colour (bright cyan) */
export const COL_BEAM = 0x00ccff;

// Homing gun (追蹤型子彈)
/** Steering rate of homing player bullets (radians/s) toward the enemy */
export const HOMING_TURN_RATE = 4.0;
/** Extra damage added per upgrade level for the homing gun */
export const HOMING_DAMAGE_PER_LEVEL = 1;
/** Travel speed of homing player bullets (px/s) */
export const HOMING_SPEED = 380;
/** Homing bullet colour (teal-green) */
export const COL_HOMING = 0x44ffaa;

// Pulse emitter (近身波發射器)
/** Base milliseconds between pulse wave bursts */
export const PULSE_INTERVAL_MS = 1800;
/** Extra damage added per upgrade level for the pulse emitter */
export const PULSE_DAMAGE_PER_LEVEL = 2;
/** Expansion speed of player-fired pulse wave rings (px/s) */
export const PULSE_SPEED = 260;
/** Pulse wave ring colour (golden) */
export const COL_PULSE = 0xffcc44;

// ─── Storm & Dragon enemy constants ─────────────────────────────────────────
/** Warning duration (ms) before the storm enemy teleports to its new position. */
export const TELEPORT_WARN_MS = 800;
/** Warning duration (ms) before a sniper bullet fires (default; can be overridden per phase). */
export const SNIPER_WARN_MS = 900;

// ─── Flame Bracer (烈焰腕甲) armor equipment ─────────────────────────────────
/** Fire interval reduction per upgrade level (fraction, e.g. 0.05 = 5%). */
export const FLAME_BRACER_FIRE_RATE_BONUS = 0.05;

// ─── Battle Emblem (戰鬥紋章) accessory equipment ─────────────────────────────
/** Extra attack damage per upgrade level for the battle emblem. */
export const BATTLE_EMBLEM_ATTACK_PER_LEVEL = 2;

// ─── Wingman Chicken (僚雞) companion ─────────────────────────────────────────
/** Horizontal offset (px) of the wingman from the player's centre (positive = right side). */
export const WINGMAN_OFFSET_X = 52;
/** Fire interval (ms) for the wingman using rapid-shot mode. */
export const WINGMAN_RAPID_INTERVAL_MS = 420;
/** Charge duration (ms) for the wingman beam cannon to fully charge. */
export const WINGMAN_BEAM_CHARGE_MAX_MS = 2600;
/** Fire interval (ms) for the wingman homing gun. */
export const WINGMAN_HOMING_INTERVAL_MS = 540;
/** Fire interval (ms) for the wingman pulse emitter. */
export const WINGMAN_PULSE_INTERVAL_MS = 2200;
/** Colour of the wingman chicken's bullet (sky blue). */
export const COL_WINGMAN_BULLET = 0x44ccff;

// ─── Princess Chicken (公主小雞) active ability ───────────────────────────────
/** Max HP consumed (deducted from effectiveHpMax) each time the ability is activated. */
export const PRINCESS_HP_COST = 1;
/** Maximum number of guard chickens that can be active simultaneously. */
export const PRINCESS_GUARD_MAX = 6;
/** HP of each summoned guard chicken. */
export const PRINCESS_GUARD_HP = 15;
/** Orbit radius around the player for guard chickens (px). */
export const PRINCESS_GUARD_ORBIT_R = 60;
/** Milliseconds between each guard chicken's auto-fire shots at the enemy. */
export const PRINCESS_GUARD_FIRE_INTERVAL_MS = 600;
/** Cooldown after activating the princess ability (ms). */
export const PRINCESS_COOLDOWN_MS = 20000;
/** Bullet colour for guard-chicken shots (soft rose). */
export const COL_PRINCESS_GUARD_BULLET = 0xff88dd;
