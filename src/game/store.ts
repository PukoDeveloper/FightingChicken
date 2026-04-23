/** Shared game-result state written by GameScene and read by GameOverScene. */
export const gameResult = {
  won: false,
  score: 0,
  highScore: 0,
  /** 1-based current level number. Increments on level completion; reset to 1 by TitleScene. */
  currentLevel: 1,
};
