import { gameResult, endlessState, costumeState } from './store';
import type { CostumeId } from './costumes';

const SAVE_KEY = 'fightingchicken_save';

interface SaveData {
  /** Per-level best scores keyed by stringified level number. */
  levelHighScores: Record<string, number>;
  /** 1-based level numbers that have been cleared at least once. */
  clearedLevels: number[];
  /** Last costume selected by the player. */
  selectedCostume: CostumeId;
  /** Best wave reached in endless mode. */
  endlessBestWave: number;
  /** Best score achieved in endless mode. */
  endlessHighScore: number;
}

/**
 * Persist the current player progress to localStorage.
 * Called automatically after each level ends and when the player confirms a costume.
 */
export function saveProgress(): void {
  try {
    const data: SaveData = {
      levelHighScores: { ...gameResult.levelHighScores },
      clearedLevels: [...costumeState.clearedLevels],
      selectedCostume: costumeState.selected,
      endlessBestWave: endlessState.bestWave,
      endlessHighScore: endlessState.highScore,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Silently ignore write failures (e.g., private browsing quota exceeded).
  }
}

/**
 * Restore player progress from localStorage into the in-memory store.
 * Should be called once during game bootstrap before the first scene loads.
 */
export function loadProgress(): void {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw) as Partial<SaveData>;

    if (data.levelHighScores && typeof data.levelHighScores === 'object') {
      for (const [key, val] of Object.entries(data.levelHighScores)) {
        const lvl = Number(key);
        if (Number.isFinite(lvl) && typeof val === 'number') {
          gameResult.levelHighScores[lvl] = val;
        }
      }
    }

    if (Array.isArray(data.clearedLevels)) {
      for (const lvl of data.clearedLevels) {
        if (typeof lvl === 'number' && Number.isFinite(lvl)) {
          costumeState.clearedLevels.add(lvl);
        }
      }
    }

    if (typeof data.selectedCostume === 'string') {
      costumeState.selected = data.selectedCostume as CostumeId;
    }

    if (typeof data.endlessBestWave === 'number' && Number.isFinite(data.endlessBestWave)) {
      endlessState.bestWave = data.endlessBestWave;
    }

    if (typeof data.endlessHighScore === 'number' && Number.isFinite(data.endlessHighScore)) {
      endlessState.highScore = data.endlessHighScore;
    }
  } catch {
    // Silently ignore corrupt or unreadable save data.
  }
}
