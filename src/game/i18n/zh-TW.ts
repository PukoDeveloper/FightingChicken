import type { EnemyType } from '../../constants';

export type AchievementTextId =
  | 'first_win'
  | 'level_all_clear'
  | 'no_damage'
  | 'score_1000'
  | 'score_10000'
  | 'endless_wave_10'
  | 'endless_wave_25'
  | 'endless_wave_50'
  | 'collector';

export type AchievementText = {
  name: string;
  description: string;
};

export const ENEMY_NAMES: Record<EnemyType, string> = {
  courage: '勇氣',
  phantom: '幽靈',
  chaos: '混沌',
  blackhole: '黑洞',
  mech: '機甲',
  storm: '暴風魔',
  dragon: '龍王',
};

export function createAchievementTexts(totalLevels: number): Record<AchievementTextId, AchievementText> {
  return {
    first_win:       { name: '初次勝利 🎉',   description: '首次擊敗勇氣！' },
    level_all_clear: { name: '全關通關 🏅',   description: `通關全部 ${totalLevels} 關` },
    no_damage:       { name: '無傷英雄 🛡',   description: '通關一關且全程未受傷' },
    score_1000:      { name: '得分高手 ⭐',   description: '單局得分達到 1 000' },
    score_10000:     { name: '傳說分數 💫',   description: '單局得分達到 10 000' },
    endless_wave_10: { name: '波浪挑戰者 🌊', description: '在無盡模式通過第 10 波' },
    endless_wave_25: { name: '無盡鬥士 ⚔️',  description: '在無盡模式通過第 25 波' },
    endless_wave_50: { name: '不滅傳說 👑',  description: '在無盡模式通過第 50 波' },
    collector:       { name: '收藏家 🎁',    description: '累計收集 30 個道具' },
  };
}

export const zhTW = {
  common: {
    gameTitle: '小雞大戰勇氣！',
    gameSubtitle: '彈幕射擊遊戲',
    startGame: '開始遊戲',
    costume: '造型',
    back: '← 返回',
    backToTitle: '回主選單',
  },
  enemies: {
    names: ENEMY_NAMES,
    fallbackName: '強敵',
  },
  modes: {
    title: '選擇模式',
    level: {
      label: '⚔️  關卡模式',
      subLabel: '挑戰關卡，擊敗各種敵人',
    },
    story: {
      label: '📖  故事模式',
      subLabel: '跟隨小雞展開冒險旅程',
    },
    endless: {
      label: '∞  無盡模式',
      defaultSubLabel: '挑戰無限關卡！',
      bestWave: (wave: number): string => `最高波數：第 ${wave} 波`,
    },
    void: {
      label: '⬛  虛空之境',
      defaultSubLabel: '60秒造成最多傷害！',
      highDamage: (damage: number): string => `最高傷害：${damage}`,
    },
  },
  achievements: {
    sceneTitle: '🏆 成就',
    titleButton: '🏆  成就',
    unlockedToastTitle: '🏆 成就解鎖！',
    backButton: '← 返回',
  },
  persistence: {
    errorToastTitle: '⚠️ 存檔失敗',
    errorToastBody: '進度可能尚未保存，請確認瀏覽器儲存空間或隱私模式設定。',
    exportSuccess: '✅ 匯出成功',
    exportFailure: (message: string): string => `❌ 匯出失敗：${message}`,
    importSuccess: '✅ 匯入成功！頁面即將重新載入…',
    importFailure: (message: string): string => `❌ 匯入失敗：${message}`,
    clearSuccess: '✅ 存檔已清除，頁面即將重新載入…',
    clearFailure: (message: string): string => `❌ 清除失敗：${message}`,
    invalidImportFile: '檔案格式不正確',
  },
  levelSelect: {
    title: '選擇關卡',
    levelNumber: (level: number): string => `第 ${level} 關`,
    waves: (count: number): string => `${count} 波`,
    highScore: (score: number): string => `最高 ${score}`,
    locked: (previousLevel: number): string => `🔒 通關第 ${previousLevel} 關解鎖`,
  },
  gameHud: {
    bossHpLabel: (bossName: string): string => `${bossName}  HP`,
    mobHpLabel: (mobName: string): string => `${mobName}  HP`,
    voidTimerLabel: '⏱ 剩餘時間',
    score: (score: number): string => `SCORE: ${score}`,
    damage: (damage: number): string => `傷害：${damage}`,
    phase: (phase: number): string => `PHASE ${phase}`,
    voidStatus: '⬛ 虛空之境',
    endlessWave: (wave: number): string => `∞ 無盡  第 ${wave} 波`,
    levelWave: (level: number, wave: number, totalWaves: number): string => `LVL ${level}  WAVE ${wave}/${totalWaves}`,
  },
  gameOver: {
    titles: {
      voidWin: '時間到！⏱',
      voidLose: '虛空湮滅...',
      win: '勝利！🎉',
      lose: '敗北...',
    },
    score: (score: number): string => `得分：${score}`,
    damage: (damage: number): string => `總傷害：${damage}`,
    highScore: (score: number): string => `最高分：${score}`,
    highDamage: (damage: number): string => `最高傷害：${damage}`,
    voidLevelWin: '虛空之境 · 60秒挑戰完成！',
    voidLevelLose: '虛空之境 · 被黑洞湮滅了',
    endlessSummary: (wave: number, best: number): string => `無盡模式 · 第 ${wave} 波  最高：第 ${best} 波`,
    levelWin: (level: number, name: string): string => `通關第 ${level} 關「${name}」！`,
    levelChallenge: (level: number, name: string): string => `挑戰第 ${level} 關「${name}」`,
    messages: {
      voidWin: '黑洞無法被消滅...\n但你的傷害已被記錄！',
      defeat: '被彈幕擊倒了...\n再接再厲！',
      endlessDefeat: '被彈幕擊倒了...\n無盡的挑戰等著你！',
      win: (bossName: string): string => `你擊敗了${bossName}！\n小雞的逆襲成功了！`,
    },
    replayButton: '再玩一次',
    continueStoryButton: '繼續劇情 ▶',
  },
} as const;
