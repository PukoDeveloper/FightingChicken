import type { Core } from '@inkshot/engine';
import { gameResult, endlessState, costumeState, currencyState, equipmentState, storyState, voidState, wingmanState } from './store';
import type { CostumeId } from './costumes';
import type { EquipmentId, EquipSlotId } from './equipment';
import { EQUIPMENT_DEFS } from './equipment';
import type { WingmanId } from './wingmen';
import { WINGMAN_DEFS } from './wingmen';

/** Convenience type alias for the upgrade-levels record. */
type UpgradeLevelsRecord = Record<EquipmentId, number>;

/** The default costume used when resetting progress. */
const DEFAULT_COSTUME: CostumeId = 'default';

/** The engine's save-slot ID used for all game progress. */
const SLOT_ID = 'progress';

/** Module-level reference to `Core`, set by {@link initPersistence}. */
let _core: Core | null = null;

export type PersistenceOperation = 'save' | 'load' | 'export' | 'import' | 'clear';

export type PersistenceResult =
  | { ok: true }
  | { ok: false; operation: PersistenceOperation; message: string; error: unknown };

let _lastPersistenceError: Extract<PersistenceResult, { ok: false }> | null = null;

function persistenceOk(): PersistenceResult {
  _lastPersistenceError = null;
  return { ok: true };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.length > 0) return error;
  return 'Unknown persistence error';
}

function reportPersistenceFailure(
  operation: PersistenceOperation,
  error: unknown,
  notify = true,
): PersistenceResult {
  const failure: Extract<PersistenceResult, { ok: false }> = {
    ok: false,
    operation,
    message: errorMessage(error),
    error,
  };
  _lastPersistenceError = failure;
  console.warn(`[persistence] ${operation} failed: ${failure.message}`, error);
  if (notify && _core) {
    _core.events.emitSync('persistence/error', {
      operation,
      message: failure.message,
    });
  }
  return failure;
}

export function getLastPersistenceError(): Extract<PersistenceResult, { ok: false }> | null {
  return _lastPersistenceError;
}

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
export async function saveProgress(): Promise<PersistenceResult> {
  if (!_core) return reportPersistenceFailure('save', new Error('Persistence module has not been initialised'), false);
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
        storyClearedLevels: [...storyState.clearedLevels],
        selectedCostume: costumeState.selected,
        endlessBestWave: endlessState.bestWave,
        endlessHighScore: endlessState.highScore,
        endlessBestSurgeMs: endlessState.bestSurgeMs,
        cosmicAsh: currencyState.cosmicAsh,
        obtainedEquipment: [...equipmentState.obtained],
        equipmentUpgradeLevels: { ...equipmentState.upgradeLevels },
        equippedSlots: { ...equipmentState.equippedSlots },
        obtainedWingmen: [...wingmanState.obtained],
        wingmanUpgradeLevels: { ...wingmanState.upgradeLevels },
        equippedWingman: wingmanState.equipped,
        voidHighScore: voidState.highScore,
        _achievements: achievementsSnapshot,
      },
    });
    await _core.events.emit('save/slot:save', { id: SLOT_ID });
    return persistenceOk();
  } catch (error) {
    return reportPersistenceFailure('save', error);
  }
}

/**
 * Restore player progress from storage into the in-memory store.
 * Should be called once during game bootstrap before the first scene loads.
 */
export async function loadProgress(): Promise<PersistenceResult> {
  if (!_core) return reportPersistenceFailure('load', new Error('Persistence module has not been initialised'), false);
  try {
    const { output: loadOut } = await _core.events.emit('save/slot:load', { id: SLOT_ID });
    if (!(loadOut as { loaded: boolean }).loaded) return persistenceOk();

    const { output: slotOut } = _core.events.emitSync('save/slot:get', { id: SLOT_ID });
    const data = (slotOut as { slot?: { data: Record<string, unknown> } }).slot?.data;
    if (!data) return persistenceOk();

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

    if (Array.isArray(data.storyClearedLevels)) {
      for (const lvl of data.storyClearedLevels) {
        if (typeof lvl === 'number' && Number.isFinite(lvl)) {
          storyState.clearedLevels.add(lvl);
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

    if (typeof data.endlessBestSurgeMs === 'number' && Number.isFinite(data.endlessBestSurgeMs)) {
      endlessState.bestSurgeMs = data.endlessBestSurgeMs;
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
        const def = typeof val === 'string' ? EQUIPMENT_DEFS.find((d) => d.id === val) : undefined;
        if (def && def.slot === slotId && equipmentState.obtained.has(val as EquipmentId)) {
          equipmentState.equippedSlots[slotId] = val as EquipmentId;
        } else {
          equipmentState.equippedSlots[slotId] = null;
        }
      }
    }

    if (Array.isArray(data.obtainedWingmen)) {
      for (const id of data.obtainedWingmen) {
        if (typeof id === 'string' && WINGMAN_DEFS.some((d) => d.id === id)) {
          wingmanState.obtained.add(id as WingmanId);
        }
      }
    }

    if (data.wingmanUpgradeLevels && typeof data.wingmanUpgradeLevels === 'object') {
      for (const [id, lvl] of Object.entries(data.wingmanUpgradeLevels as Record<string, unknown>)) {
        if (typeof lvl === 'number' && Number.isFinite(lvl) && WINGMAN_DEFS.some((d) => d.id === id)) {
          wingmanState.upgradeLevels[id as WingmanId] = lvl;
        }
      }
    }

    if (typeof data.equippedWingman === 'string') {
      const def = WINGMAN_DEFS.find((d) => d.id === data.equippedWingman);
      if (def && wingmanState.obtained.has(data.equippedWingman as WingmanId)) {
        wingmanState.equipped = data.equippedWingman as WingmanId;
      }
    }
    return persistenceOk();
  } catch (error) {
    return reportPersistenceFailure('load', error, false);
  }
}

/**
 * Export the current player progress as a downloadable JSON file.
 * Triggers a browser file download with a timestamped filename.
 */
export function exportProgress(): PersistenceResult {
  try {
    type AchievementEntry = { id: string; progress: number; unlockedAt: string | null };
    const achOut = _core?.events.emitSync('achievement/list', {})?.output as { achievements?: AchievementEntry[] } | undefined;
    const achList: AchievementEntry[] = achOut?.achievements ?? [];
    const achievementsSnapshot: Record<string, { progress: number; unlockedAt: string | null }> = Object.fromEntries(
      achList.map((a) => [a.id, { progress: a.progress, unlockedAt: a.unlockedAt }]),
    );

    const snapshot = {
      levelHighScores: { ...gameResult.levelHighScores },
      clearedLevels: [...costumeState.clearedLevels],
      storyClearedLevels: [...storyState.clearedLevels],
      selectedCostume: costumeState.selected,
      endlessBestWave: endlessState.bestWave,
      endlessHighScore: endlessState.highScore,
      endlessBestSurgeMs: endlessState.bestSurgeMs,
      voidHighScore: voidState.highScore,
      cosmicAsh: currencyState.cosmicAsh,
      obtainedEquipment: [...equipmentState.obtained],
      equipmentUpgradeLevels: { ...equipmentState.upgradeLevels },
      equippedSlots: { ...equipmentState.equippedSlots },
      obtainedWingmen: [...wingmanState.obtained],
      wingmanUpgradeLevels: { ...wingmanState.upgradeLevels },
      equippedWingman: wingmanState.equipped,
      _achievements: { data: achievementsSnapshot },
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fightingchicken-save-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return persistenceOk();
  } catch (error) {
    return reportPersistenceFailure('export', error);
  }
}

/**
 * Import player progress from a plain-object snapshot (parsed from JSON).
 * Validates each field before writing to in-memory state, then persists.
 */
export async function importProgress(data: Record<string, unknown>): Promise<PersistenceResult> {
  if (!_core) return reportPersistenceFailure('import', new Error('Persistence module has not been initialised'), false);
  try {
    // Reset all state first so stale data is not carried over.
    gameResult.levelHighScores = {};
    endlessState.bestWave = 1;
    endlessState.highScore = 0;
    endlessState.bestSurgeMs = 0;
    endlessState.surgeElapsedMs = 0;
    endlessState.lastSurgeMs = 0;
    voidState.highScore = 0;
    costumeState.clearedLevels = new Set();
    storyState.clearedLevels = new Set();
    costumeState.selected = DEFAULT_COSTUME;
    currencyState.cosmicAsh = 0;
    equipmentState.obtained = new Set();
    equipmentState.upgradeLevels = {} as UpgradeLevelsRecord;
    equipmentState.equippedSlots = { weapon: null, armor: null, accessory: null };
    wingmanState.obtained = new Set();
    wingmanState.upgradeLevels = {} as Record<WingmanId, number>;
    wingmanState.equipped = null;

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

    if (Array.isArray(data.storyClearedLevels)) {
      for (const lvl of data.storyClearedLevels) {
        if (typeof lvl === 'number' && Number.isFinite(lvl)) {
          storyState.clearedLevels.add(lvl);
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

    if (typeof data.endlessBestSurgeMs === 'number' && Number.isFinite(data.endlessBestSurgeMs)) {
      endlessState.bestSurgeMs = data.endlessBestSurgeMs;
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
        const def = typeof val === 'string' ? EQUIPMENT_DEFS.find((d) => d.id === val) : undefined;
        if (def && def.slot === slotId && equipmentState.obtained.has(val as EquipmentId)) {
          equipmentState.equippedSlots[slotId] = val as EquipmentId;
        } else {
          equipmentState.equippedSlots[slotId] = null;
        }
      }
    }

    if (Array.isArray(data.obtainedWingmen)) {
      for (const id of data.obtainedWingmen) {
        if (typeof id === 'string' && WINGMAN_DEFS.some((d) => d.id === id)) {
          wingmanState.obtained.add(id as WingmanId);
        }
      }
    }

    if (data.wingmanUpgradeLevels && typeof data.wingmanUpgradeLevels === 'object') {
      for (const [id, lvl] of Object.entries(data.wingmanUpgradeLevels as Record<string, unknown>)) {
        if (typeof lvl === 'number' && Number.isFinite(lvl) && WINGMAN_DEFS.some((d) => d.id === id)) {
          wingmanState.upgradeLevels[id as WingmanId] = lvl;
        }
      }
    }

    if (typeof data.equippedWingman === 'string') {
      const wmDef = WINGMAN_DEFS.find((d) => d.id === data.equippedWingman);
      if (wmDef && wingmanState.obtained.has(data.equippedWingman as WingmanId)) {
        wingmanState.equipped = data.equippedWingman as WingmanId;
      }
    }

    // Restore achievements if present.
    const achData = (data._achievements as { data?: Record<string, unknown> } | undefined)?.data;
    if (achData && typeof achData === 'object') {
      for (const [id, entry] of Object.entries(achData)) {
        const e = entry as { progress?: unknown; unlockedAt?: unknown };
        if (typeof e.progress === 'number') {
          _core.events.emitSync('achievement/set', {
            id,
            progress: e.progress,
            unlockedAt: typeof e.unlockedAt === 'string' ? e.unlockedAt : null,
          });
        }
      }
    }

    // Persist the imported state to storage.
    _core.events.emitSync('save/slot:set', {
      id: SLOT_ID,
      patch: {
        levelHighScores: { ...gameResult.levelHighScores },
        clearedLevels: [...costumeState.clearedLevels],
        storyClearedLevels: [...storyState.clearedLevels],
        selectedCostume: costumeState.selected,
        endlessBestWave: endlessState.bestWave,
        endlessHighScore: endlessState.highScore,
        endlessBestSurgeMs: endlessState.bestSurgeMs,
        voidHighScore: voidState.highScore,
        cosmicAsh: currencyState.cosmicAsh,
        obtainedEquipment: [...equipmentState.obtained],
        equipmentUpgradeLevels: { ...equipmentState.upgradeLevels },
        equippedSlots: { ...equipmentState.equippedSlots },
        obtainedWingmen: [...wingmanState.obtained],
        wingmanUpgradeLevels: { ...wingmanState.upgradeLevels },
        equippedWingman: wingmanState.equipped,
        _achievements: { data: achData ?? {} },
      },
    });
    await _core.events.emit('save/slot:save', { id: SLOT_ID });
    return persistenceOk();
  } catch (error) {
    return reportPersistenceFailure('import', error);
  }
}

/**
 * Clear all persisted player progress and reset in-memory store state to
 * its initial values.  Called from the developer menu to wipe records.
 */
export async function clearProgress(): Promise<PersistenceResult> {
  if (!_core) return reportPersistenceFailure('clear', new Error('Persistence module has not been initialised'), false);
  try {
    // Reset in-memory state.
    gameResult.levelHighScores = {};
    endlessState.bestWave = 1;
    endlessState.highScore = 0;
    endlessState.bestSurgeMs = 0;
    endlessState.surgeElapsedMs = 0;
    endlessState.lastSurgeMs = 0;
    voidState.highScore = 0;
    costumeState.clearedLevels = new Set();
    storyState.clearedLevels = new Set();
    costumeState.selected = DEFAULT_COSTUME;
    currencyState.cosmicAsh = 0;
    equipmentState.obtained = new Set();
    equipmentState.upgradeLevels = {} as UpgradeLevelsRecord;
    equipmentState.equippedSlots = { weapon: null, armor: null, accessory: null };
    wingmanState.obtained = new Set();
    wingmanState.upgradeLevels = {} as Record<WingmanId, number>;
    wingmanState.equipped = null;

    // Overwrite the save slot with blank data so the cleared state is persisted.
    _core.events.emitSync('save/slot:set', {
      id: SLOT_ID,
      patch: {
        levelHighScores: {},
        clearedLevels: [],
        storyClearedLevels: [],
        selectedCostume: DEFAULT_COSTUME,
        endlessBestWave: 1,
        endlessHighScore: 0,
        endlessBestSurgeMs: 0,
        voidHighScore: 0,
        cosmicAsh: 0,
        obtainedEquipment: [],
        equipmentUpgradeLevels: {},
        equippedSlots: { weapon: null, armor: null, accessory: null },
        obtainedWingmen: [],
        wingmanUpgradeLevels: {},
        equippedWingman: null,
        _achievements: { data: {} },
      },
    });
    await _core.events.emit('save/slot:save', { id: SLOT_ID });
    return persistenceOk();
  } catch (error) {
    return reportPersistenceFailure('clear', error);
  }
}
