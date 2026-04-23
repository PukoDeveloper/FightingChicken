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

export type AchievementDef = { name: string; description: string };

export const ACHIEVEMENT_DEFS: Record<string, AchievementDef> = {
  first_win:       { name: '初次勝利 🎉',   description: '首次擊敗勇氣！' },
  level_all_clear: { name: '全關通關 🏅',   description: '通關全部 5 關' },
  no_damage:       { name: '無傷英雄 🛡',   description: '通關一關且全程未受傷' },
  score_1000:      { name: '得分高手 ⭐',   description: '單局得分達到 1 000' },
  score_10000:     { name: '傳說分數 💫',   description: '單局得分達到 10 000' },
  endless_wave_10: { name: '波浪挑戰者 🌊', description: '在無盡模式通過第 10 波' },
  endless_wave_25: { name: '無盡鬥士 ⚔️',  description: '在無盡模式通過第 25 波' },
  endless_wave_50: { name: '不滅傳說 👑',  description: '在無盡模式通過第 50 波' },
  collector:       { name: '收藏家 🎁',    description: '累計收集 30 個道具' },
};

export function initAchievements(core: Core): void {
  // ── Level mode ──────────────────────────────────────────────────────────────

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'first_win',
      name: '初次勝利 🎉',
      description: '首次擊敗勇氣！',
      triggerEvent: 'game/win',
    },
  });

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'level_all_clear',
      name: '全關通關 🏅',
      description: '通關全部 5 關',
      threshold: 5,
      triggerEvent: 'game/win',
    },
  });

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'no_damage',
      name: '無傷英雄 🛡',
      description: '通關一關且全程未受傷',
      triggerEvent: 'game/no_damage_win',
    },
  });

  // ── Score ───────────────────────────────────────────────────────────────────

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'score_1000',
      name: '得分高手 ⭐',
      description: '單局得分達到 1 000',
      triggerEvent: 'game/score_1000',
    },
  });

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'score_10000',
      name: '傳說分數 💫',
      description: '單局得分達到 10 000',
      triggerEvent: 'game/score_10000',
    },
  });

  // ── Endless mode ────────────────────────────────────────────────────────────

  type EndlessWavePayload = { wave: number };

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'endless_wave_10',
      name: '波浪挑戰者 🌊',
      description: '在無盡模式通過第 10 波',
      triggerEvent: 'game/endless_wave',
      triggerFilter: (payload: unknown) => (payload as EndlessWavePayload).wave >= 10,
    },
  });

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'endless_wave_25',
      name: '無盡鬥士 ⚔️',
      description: '在無盡模式通過第 25 波',
      triggerEvent: 'game/endless_wave',
      triggerFilter: (payload: unknown) => (payload as EndlessWavePayload).wave >= 25,
    },
  });

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'endless_wave_50',
      name: '不滅傳說 👑',
      description: '在無盡模式通過第 50 波',
      triggerEvent: 'game/endless_wave',
      triggerFilter: (payload: unknown) => (payload as EndlessWavePayload).wave >= 50,
    },
  });

  // ── Collector ───────────────────────────────────────────────────────────────

  core.events.emitSync('achievement/define', {
    achievement: {
      id: 'collector',
      name: '收藏家 🎁',
      description: '累計收集 30 個道具',
      threshold: 30,
      triggerEvent: 'game/item:collected',
    },
  });
}
