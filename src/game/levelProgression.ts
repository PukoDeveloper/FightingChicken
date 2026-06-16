import { TOTAL_LEVELS } from './levels';

export function isValidLevelNumber(levelNumber: number): boolean {
  return Number.isInteger(levelNumber) && levelNumber >= 1 && levelNumber <= TOTAL_LEVELS;
}

export function isLevelUnlocked(levelNumber: number, clearedLevels: ReadonlySet<number>): boolean {
  if (!isValidLevelNumber(levelNumber)) return false;
  return levelNumber === 1 || clearedLevels.has(levelNumber) || clearedLevels.has(levelNumber - 1);
}

export function nextLevelAfterClear(levelNumber: number): number {
  if (!Number.isFinite(levelNumber)) return 1;
  return Math.max(1, Math.min(Math.floor(levelNumber) + 1, TOTAL_LEVELS));
}
