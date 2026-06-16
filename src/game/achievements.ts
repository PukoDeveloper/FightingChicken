/**
 * Achievement definitions for FightingChicken.
 *
 * Call `initAchievements(core)` once during game bootstrap to register all
 * achievements with the engine's `AchievementPlugin`.
 *
 * Custom game events fired by the scenes:
 *   - `game/win`             — player cleared a level
 *   - `game/no_damage_win`   — player cleared a level without taking damage
 *   - `game/score_1000`      — single-run score reached 1 000
 *   - `game/score_10000`     — single-run score reached 10 000
 *   - `game/item:collected`  — player picked up an item (health or power)
 *   - `game/endless_wave`    — fired each time an endless wave is cleared;
 *                              payload: `{ wave: number }`
 */

import type { Core } from '@inkshot/engine';
import { costumeState } from './store';
import { TOTAL_LEVELS } from './levels';
import { createAchievementTexts } from './i18n';
import type { AchievementTextId } from './i18n';

export type AchievementDef = { name: string; description: string };
export type AchievementId = AchievementTextId;

export const ACHIEVEMENT_DEFS: Record<string, AchievementDef> = createAchievementTexts(TOTAL_LEVELS);

type AchievementRegistration = {
  id: AchievementId;
  triggerEvent: string;
  threshold?: number;
  triggerFilter?: (payload: unknown) => boolean;
};

function defineAchievement(core: Core, registration: AchievementRegistration): void {
  const text = ACHIEVEMENT_DEFS[registration.id];
  core.events.emitSync('achievement/define', {
    achievement: {
      id: registration.id,
      name: text.name,
      description: text.description,
      triggerEvent: registration.triggerEvent,
      threshold: registration.threshold,
      triggerFilter: registration.triggerFilter,
    },
  });
}

export function initAchievements(core: Core): void {
  // ── Level mode ──────────────────────────────────────────────────────────────

  defineAchievement(core, {
    id: 'first_win',
    triggerEvent: 'game/win',
  });

  defineAchievement(core, {
    id: 'level_all_clear',
    triggerEvent: 'game/win',
    triggerFilter: (payload: unknown) => {
      const { isNewClear } = payload as { isNewClear: boolean };
      return isNewClear && costumeState.clearedLevels.size >= TOTAL_LEVELS;
    },
  });

  defineAchievement(core, {
    id: 'no_damage',
    triggerEvent: 'game/no_damage_win',
  });

  // ── Score ───────────────────────────────────────────────────────────────────

  defineAchievement(core, {
    id: 'score_1000',
    triggerEvent: 'game/score_1000',
  });

  defineAchievement(core, {
    id: 'score_10000',
    triggerEvent: 'game/score_10000',
  });

  // ── Endless mode ────────────────────────────────────────────────────────────

  type EndlessWavePayload = { wave: number };

  defineAchievement(core, {
    id: 'endless_wave_10',
    triggerEvent: 'game/endless_wave',
    triggerFilter: (payload: unknown) => (payload as EndlessWavePayload).wave >= 10,
  });

  defineAchievement(core, {
    id: 'endless_wave_25',
    triggerEvent: 'game/endless_wave',
    triggerFilter: (payload: unknown) => (payload as EndlessWavePayload).wave >= 25,
  });

  defineAchievement(core, {
    id: 'endless_wave_50',
    triggerEvent: 'game/endless_wave',
    triggerFilter: (payload: unknown) => (payload as EndlessWavePayload).wave >= 50,
  });

  // ── Collector ───────────────────────────────────────────────────────────────

  defineAchievement(core, {
    id: 'collector',
    threshold: 30,
    triggerEvent: 'game/item:collected',
  });
}
