import { PLAYER_MOVE_SPEED, ITEM_FALL_SPEED } from '../constants';
import type { BuffId } from './endless';
import type { CostumeId } from './costumes';
import type { SkillId } from './skills';

/** Shared game-result state written by GameScene and read by GameOverScene. */
export const gameResult = {
  won: false,
  score: 0,
  /** Per-level best scores keyed by 1-based level number. Independent of endless mode. */
  levelHighScores: {} as Record<number, number>,
  /** 1-based current level number. Set by LevelSelectScene; increments on win for auto-advance. */
  currentLevel: 1,
  /** The level that was just played. Set by GameScene before it mutates currentLevel. */
  playedLevel: 1,
};

/** Developer-only runtime config. Values here are editable via the dev menu. */
export const devConfig = {
  /** Player movement speed in px/s. Initialised from PLAYER_MOVE_SPEED constant. */
  playerMoveSpeed: PLAYER_MOVE_SPEED,
  /** Item fall speed in px/s. Initialised from ITEM_FALL_SPEED constant. */
  itemFallSpeed: ITEM_FALL_SPEED,
};

/** Endless mode state shared between GameScene and EndlessBuffScene. */
export const endlessState = {
  /** Whether the current game session is endless mode. */
  active: false,
  /** 1-based number of the wave currently being (or about to be) played. */
  wave: 1,
  /** Accumulated buff IDs chosen by the player so far. */
  buffs: [] as BuffId[],
  /** Best (highest) wave reached in endless mode. */
  bestWave: 1,
  /** Best score achieved in endless mode. */
  highScore: 0,
  /** HP carried over from the previous wave (0 = start fresh at base HP). */
  currentHp: 0,
  /** Cumulative score across all waves in the current endless run. */
  score: 0,
  /** Remaining ms on the periodic-shield countdown carried over from the previous wave. */
  periodicShieldTimer: 0,
  /** Remaining ms on the regen countdown carried over from the previous wave. */
  regenTimer: 0,
};

/** Costume / skin state persisted across scenes within a single session. */
export const costumeState = {
  /** The costume currently selected by the player. */
  selected: 'default' as CostumeId,
  /**
   * Set of 1-based level numbers cleared at least once in level mode.
   * Used to determine which costumes are unlocked.
   */
  clearedLevels: new Set<number>(),
};

/** Skill state for the current run. Reset when SkillSelectScene is entered. */
export const skillState = {
  /** The skill selected before the current run, or null for no skill. */
  selected: null as SkillId | null,
};

