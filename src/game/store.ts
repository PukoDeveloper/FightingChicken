import { PLAYER_MOVE_SPEED, ITEM_FALL_SPEED } from '../constants';
import type { BuffId } from './endless';

/** Shared game-result state written by GameScene and read by GameOverScene. */
export const gameResult = {
  won: false,
  score: 0,
  highScore: 0,
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
};

