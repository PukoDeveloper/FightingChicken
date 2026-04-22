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
export const INVINCIBLE_MS = 2400;

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

// ─── Scoring ─────────────────────────────────────────────────────────────────
export const SCORE_PER_HIT = 10;
export const SCORE_BONUS_WIN = 5000;

// ─── Colours ─────────────────────────────────────────────────────────────────
export const COL_BG          = 0x000011;
export const COL_STAR        = 0xffffff;
export const COL_PLAYER_BULLET = 0xffff44;
export const COL_BULLET_P1   = 0xff4444; // phase 1 – red
export const COL_BULLET_P2   = 0xff8800; // phase 2 – orange
export const COL_BULLET_P3   = 0xcc44ff; // phase 3 – purple
export const COL_BULLET_RING = 0x44ccff; // ring burst – cyan
