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
/** Probability (0–1) that a moose-costume gift box also spawns alongside each normal item */
export const MOOSE_GIFT_PROB = 0.35;
/** Invincibility duration granted when collecting a health item (ms) */
export const HEALTH_ITEM_INVINCIBLE_MS = 2000;

// ─── Scoring ─────────────────────────────────────────────────────────────────
export const SCORE_PER_HIT = 10;
/** Multiplied by the wave's max HP to compute the wave-clear bonus score. */
export const SCORE_BONUS_WAVE_MULT = 20;

// ─── Enemy types ─────────────────────────────────────────────────────────────
/** Identifies which enemy sprite & theme is used for a level. */
export type EnemyType = 'courage' | 'phantom' | 'chaos';

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

// ─── Adventure Chicken ────────────────────────────────────────────────────────
/** Distance (px) at or below which the adventure costume's max damage multiplier applies */
export const ADVENTURE_PROXIMITY_MIN_DIST = 60;
/** Distance (px) at or beyond which the adventure costume grants no extra damage (1×) */
export const ADVENTURE_PROXIMITY_MAX_DIST = 350;
/** Maximum damage multiplier when the player is at ADVENTURE_PROXIMITY_MIN_DIST or closer */
export const ADVENTURE_PROXIMITY_MAX_MULT = 3;
