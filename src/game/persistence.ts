import type { Core } from '@inkshot/engine';
import { gameResult, endlessState, costumeState, currencyState, equipmentState, voidState } from './store';
import type { CostumeId } from './costumes';
import type { EquipmentId, EquipSlotId } from './equipment';

/** Convenience type alias for the upgrade-levels record. */
type UpgradeLevelsRecord = Record<EquipmentId, number>;

/** The default costume used when resetting progress. */
const DEFAULT_COSTUME: CostumeId = 'default';

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
    // Snapshot achievement states so they are included in the slot patch before
    // the storage adapter writes.  The AchievementPlugin hooks into the
    // save/slot:save *after* phase, but the LocalStorageSaveAdapter (registered
    // first) also runs in that phase and writes to storage before the plugin can
    // append its data.  By embedding achievements in the patch here we guarantee
    // they are part of the slot data that gets persisted.
    const { output: achOut } = _core.events.emitSync('achievement/list', {});
    type AchievementEntry = { id: string; progress: number; unlockedAt: string | null };
    const achList = (achOut as { achievements: AchievementEntry[] }).achievements ?? [];
    const achievementsSnapshot: { data: Record<string, { progress: number; unlockedAt: string | null }> } = {
      data: Object.fromEntries(achList.map((a) => [a.id, { progress: a.progress, unlockedAt: a.unlockedAt }])),
    };

    _core.events.emitSync('save/slot:set', {
      id: SLOT_ID,
      patch: {
        levelHighScores: { ...gameResult.levelHighScores },
        clearedLevels: [...costumeState.clearedLevels],
        selectedCostume: costumeState.selected,
        endlessBestWave: endlessState.bestWave,
        endlessHighScore: endlessState.highScore,
        cosmicAsh: currencyState.cosmicAsh,
        obtainedEquipment: [...equipmentState.obtained],
        equipmentUpgradeLevels: { ...equipmentState.upgradeLevels },
        equippedSlots: { ...equipmentState.equippedSlots },
        voidHighScore: voidState.highScore,
        _achievements: achievementsSnapshot,
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

    if (typeof data.voidHighScore === 'number' && Number.isFinite(data.voidHighScore)) {
      voidState.highScore = data.voidHighScore;
    }

    if (typeof data.cosmicAsh === 'number' && Number.isFinite(data.cosmicAsh)) {
      currencyState.cosmicAsh = Math.max(0, Math.floor(data.cosmicAsh));
    }

    if (Array.isArray(data.obtainedEquipment)) {
      for (const id of data.obtainedEquipment) {
        if (typeof id === 'string') {
          equipmentState.obtained.add(id as EquipmentId);
        }
      }
    }

    if (data.equipmentUpgradeLevels && typeof data.equipmentUpgradeLevels === 'object') {
      for (const [id, lvl] of Object.entries(data.equipmentUpgradeLevels as Record<string, unknown>)) {
        if (typeof lvl === 'number' && Number.isFinite(lvl)) {
          (equipmentState.upgradeLevels as UpgradeLevelsRecord)[id as EquipmentId] = lvl;
        }
      }
    }

    if (data.equippedSlots && typeof data.equippedSlots === 'object') {
      const slots = data.equippedSlots as Record<string, unknown>;
      for (const slotId of ['weapon', 'armor', 'accessory'] as EquipSlotId[]) {
        const val = slots[slotId];
        if (typeof val === 'string' && equipmentState.obtained.has(val as EquipmentId)) {
          equipmentState.equippedSlots[slotId] = val as EquipmentId;
        } else {
          equipmentState.equippedSlots[slotId] = null;
        }
      }
    }
  } catch {
    // Silently ignore corrupt or unreadable save data.
  }
}

/**
 * Clear all persisted player progress and reset in-memory store state to
 * its initial values.  Called from the developer menu to wipe records.
 */
export async function clearProgress(): Promise<void> {
  if (!_core) return;
  try {
    // Reset in-memory state.
    gameResult.levelHighScores = {};
    endlessState.bestWave = 1;
    endlessState.highScore = 0;
    voidState.highScore = 0;
    costumeState.clearedLevels = new Set();
    costumeState.selected = DEFAULT_COSTUME;
    currencyState.cosmicAsh = 0;
    equipmentState.obtained = new Set();
    equipmentState.upgradeLevels = {} as UpgradeLevelsRecord;
    equipmentState.equippedSlots = { weapon: null, armor: null, accessory: null };

    // Overwrite the save slot with blank data so the cleared state is persisted.
    _core.events.emitSync('save/slot:set', {
      id: SLOT_ID,
      patch: {
        levelHighScores: {},
        clearedLevels: [],
        selectedCostume: DEFAULT_COSTUME,
        endlessBestWave: 1,
        endlessHighScore: 0,
        voidHighScore: 0,
        cosmicAsh: 0,
        obtainedEquipment: [],
        equipmentUpgradeLevels: {},
        equippedSlots: { weapon: null, armor: null, accessory: null },
        _achievements: { data: {} },
      },
    });
    await _core.events.emit('save/slot:save', { id: SLOT_ID });
  } catch {
    // Silently ignore write failures.
  }
}
