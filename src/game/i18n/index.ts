import type { EnemyType } from '../../constants';
import { ENEMY_NAMES, zhTW } from './zh-TW';

export type { AchievementText, AchievementTextId } from './zh-TW';
export { createAchievementTexts } from './zh-TW';

export const TEXT = zhTW;

export function getEnemyDisplayName(enemyType: EnemyType | string): string {
  return ENEMY_NAMES[enemyType as EnemyType] ?? zhTW.enemies.fallbackName;
}
