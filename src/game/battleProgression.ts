import type { LevelConfig } from './levels';

export type WaveClearResolution =
  | { kind: 'endless' }
  | { kind: 'nextWave'; nextWaveIdx: number }
  | { kind: 'victory' };

export function resolveWaveClear(
  isEndless: boolean,
  currentWaveIdx: number,
  levelConfig: LevelConfig | null,
): WaveClearResolution {
  if (isEndless) {
    return { kind: 'endless' };
  }

  const nextWaveIdx = currentWaveIdx + 1;
  if (levelConfig && nextWaveIdx < levelConfig.waves.length) {
    return { kind: 'nextWave', nextWaveIdx };
  }

  return { kind: 'victory' };
}

export function shouldStartGuardianFinale(
  levelConfig: LevelConfig | null,
  params: {
    isEndless: boolean;
    newPhase: number;
    waveIdx: number;
    alreadyTriggered: boolean;
  },
): boolean {
  if (
    params.isEndless ||
    params.newPhase !== 3 ||
    params.alreadyTriggered ||
    !levelConfig?.guardianPetFinale
  ) {
    return false;
  }

  return params.waveIdx === levelConfig.waves.length - 1;
}

export function usesDragonGuardianPets(levelConfig: LevelConfig | null): boolean {
  return levelConfig?.guardianPetFinale === 'dragon';
}
