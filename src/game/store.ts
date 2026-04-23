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
