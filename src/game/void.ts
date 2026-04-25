import {
  BULLET_SPEED_SLOW,
  BULLET_SPEED_MEDIUM,
  COL_BULLET_P3,
  COL_SHOCKWAVE,
  COL_BUBBLE,
  SHOCKWAVE_EXPAND_SPEED,
  BUBBLE_SPEED,
} from '../constants';
import type { WaveConfig } from './levels';
import { phase } from './levels';

/**
 * Build a WaveConfig for the Void Realm (虛空之境) black-hole encounter.
 *
 * The enemy is effectively invincible — GameScene ignores the HP value and
 * never ends the wave on HP depletion.  We still need a WaveConfig so the
 * existing bullet-pattern machinery (spiralTimer, aimTimer, etc.) can be
 * reused unchanged.
 *
 * Phase fractions of 0 ensure the game always stays in phase 1 (since the
 * computed HP fraction is 1.0, which is > 0, so the phase-1 branch always
 * triggers).  Phases 2 and 3 are defined with slightly elevated patterns in
 * case future code changes allow phase transitions.
 */
export function createVoidWaveConfig(): WaveConfig {
  const voidPhase1 = phase({
    spiralInterval: 360,
    spiralWays: 10,
    spiralSpeed: BULLET_SPEED_SLOW,
    spiralColor: COL_BULLET_P3,

    aimInterval: 1800,
    aimWays: 3,
    aimSpread: 0.35,
    aimSpeed: BULLET_SPEED_MEDIUM,
    aimColor: COL_BULLET_P3,

    shockwaveInterval: 4500,
    shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED,
    shockwaveColor: COL_SHOCKWAVE,

    bubbleInterval: 5000,
    bubbleCount: 2,
    bubbleSpeed: BUBBLE_SPEED,
    bubbleColor: COL_BUBBLE,
  });

  const voidPhase2 = phase({
    spiralInterval: 300,
    spiralWays: 12,
    spiralSpeed: BULLET_SPEED_SLOW,
    spiralColor: COL_BULLET_P3,

    aimInterval: 1500,
    aimWays: 4,
    aimSpread: 0.32,
    aimSpeed: BULLET_SPEED_MEDIUM,
    aimColor: COL_BULLET_P3,

    shockwaveInterval: 3800,
    shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 20,
    shockwaveColor: COL_SHOCKWAVE,

    bubbleInterval: 4200,
    bubbleCount: 3,
    bubbleSpeed: BUBBLE_SPEED + 10,
    bubbleColor: COL_BUBBLE,
  });

  const voidPhase3 = phase({
    spiralInterval: 250,
    spiralWays: 14,
    spiralSpeed: BULLET_SPEED_MEDIUM,
    spiralColor: COL_BULLET_P3,

    aimInterval: 1200,
    aimWays: 5,
    aimSpread: 0.30,
    aimSpeed: BULLET_SPEED_MEDIUM,
    aimColor: COL_BULLET_P3,

    shockwaveInterval: 3000,
    shockwaveSpeed: SHOCKWAVE_EXPAND_SPEED + 40,
    shockwaveColor: COL_SHOCKWAVE,

    bubbleInterval: 3500,
    bubbleCount: 3,
    bubbleSpeed: BUBBLE_SPEED + 20,
    bubbleColor: COL_BUBBLE,
  });

  return {
    waveNumber: 1,
    // Very high HP so the enemy never dies from player damage.
    // GameScene skips the enemyHP<=0 check in void mode anyway.
    enemyHp: 999999,
    // Phase fractions at 0: HP fraction is always 1.0 > 0, so always phase 1.
    phase2Frac: 0,
    phase3Frac: 0,
    phases: [voidPhase1, voidPhase2, voidPhase3],
  };
}
