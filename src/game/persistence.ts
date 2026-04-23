import type { Core } from '@inkshot/engine';
import { gameResult, endlessState, costumeState } from './store';
import type { CostumeId } from './costumes';

/** The engine's save-slot ID used for all game progress. */
const SLOT_ID = 'progress';

/** Module-level reference to `Core`, set by {@link initPersistence}. */
let _core: Core | null = null;

/**
 * Initialise the persistence module.
 * Must be called once during game bootstrap (before the first scene loads)
 * so that subsequent `saveProgress` / `loadProgress` calls have a `Core`
 * reference to emit save events through.
 */
export function initPersistence(core: Core): void {
  _core = core;
}

/**
 * Persist the current player progress via the engine's SaveManager.
 * Returns a Promise that resolves once the slot has been written to storage.
 */
export async function saveProgress(): Promise<void> {
  if (!_core) return;
  try {
    _core.events.emitSync('save/slot:set', {
      id: SLOT_ID,
      patch: {
        levelHighScores: { ...gameResult.levelHighScores },
        clearedLevels: [...costumeState.clearedLevels],
        selectedCostume: costumeState.selected,
        endlessBestWave: endlessState.bestWave,
        endlessHighScore: endlessState.highScore,
      },
    });
    await _core.events.emit('save/slot:save', { id: SLOT_ID });
  } catch {
    // Silently ignore write failures (e.g., private-browsing quota exceeded).
  }
}

/**
 * Restore player progress from storage into the in-memory store.
 * Should be called once during game bootstrap before the first scene loads.
 */
export async function loadProgress(): Promise<void> {
  if (!_core) return;
  try {
    const { output: loadOut } = await _core.events.emit('save/slot:load', { id: SLOT_ID });
    if (!(loadOut as { loaded: boolean }).loaded) return;

    const { output: slotOut } = _core.events.emitSync('save/slot:get', { id: SLOT_ID });
    const data = (slotOut as { slot?: { data: Record<string, unknown> } }).slot?.data;
    if (!data) return;

    if (data.levelHighScores && typeof data.levelHighScores === 'object') {
      for (const [key, val] of Object.entries(data.levelHighScores as Record<string, unknown>)) {
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
