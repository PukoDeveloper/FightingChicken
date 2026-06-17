# FightingChicken

手機直向彈幕遊戲：小雞大戰勇氣

## 遊戲介紹

這是一款以 [@inkshot/engine](https://www.npmjs.com/package/@inkshot/engine) 與 Pixi.js 開發的手機彈幕射擊遊戲。
玩家扮演小雞，在密集彈幕中閃躲、反擊，逐步挑戰勇氣、幽靈、混沌、機甲、暴風、龍王與虛空核心。

## 玩法說明

| 操作 | 動作 |
|------|------|
| 拖曳螢幕 | 移動小雞 |
| 自動射擊 | 小雞自動向上發射子彈 |
| 技能/造型按鈕 | 施放戰前選擇的技能或造型能力 |
| 躲開彈幕 | 小雞中心的小紅點是真正碰撞判定 |

## 遊戲模式

- **關卡模式**：12 關，後段關卡使用縮放後的混合 Boss pattern，難度曲線更長。
- **故事模式**：章節對話與專屬戰鬥；第一章 50 關大綱見 [`docs/story-chapter-1-outline.md`](docs/story-chapter-1-outline.md)。
- **無盡模式**：逐波提升難度，每波後可選 Buff。
- **虛空之境**：60 秒內對黑洞造成最高傷害。

## 遊戲特色

- **三階段 Boss 戰**：依 HP 進入 Phase 1 / 2 / 3，彈幕密度與機制逐步提升。
- **多種彈幕機制**：螺旋、瞄準、扇形、環形、衝擊波、泡泡、炸彈、雷射、追蹤曲線彈、散射、狙擊、傳送、火焰與地面衝擊。
- **進度系統**：服裝、技能、裝備、僚雞、成就、圖鑑與宇宙灰燼貨幣。
- **關卡解鎖**：通關前一關後解鎖下一關，選關畫面會顯示最高分。
- **短暫無敵時間**：受擊後有約 1.2 秒緩衝，利於彈幕閃避節奏。

## 關卡進度

| 區段 | 關卡 | 內容定位 |
|------|------|----------|
| 入門 | 1–3 | 勇氣 Boss，逐步教學螺旋、瞄準、扇形與環形彈 |
| 中段 | 4–5 | 幽靈與混沌，引入陷阱泡泡、衝擊波、炸彈、雷射與護衛 |
| 後段 | 6–8 | 機甲、暴風、龍王，各自帶有追蹤、散射、狙擊、傳送、火焰與地震機制 |
| 終盤 | 9–12 | 以縮放後的混合 pattern 組合出高壓進階挑戰 |

## 成就系統

成就由 `src/game/achievements.ts` 註冊，顯示文字由 `src/game/i18n/zh-TW.ts` 的 `createAchievementTexts()` 提供。

目前成就包含：

- 首次勝利
- 全關通關，門檻會自動使用 `TOTAL_LEVELS`
- 無傷通關
- 單局分數 1,000 / 10,000
- 無盡模式第 10 / 25 / 50 波
- 累計收集 30 個道具

遊戲內成就相關顯示：

- 解鎖 toast：`src/main.ts`
- 成就列表：`src/scenes/AchievementsScene.ts`
- 成就定義與觸發條件：`src/game/achievements.ts`
- 語言文字來源：`src/game/i18n/zh-TW.ts`

## 文字與語言檔

目前主要 UI 共用文案集中在：

```text
src/game/i18n/
├── index.ts       # 對外輸出目前語言與 helper
└── zh-TW.ts       # 繁體中文文字表
```

已集中管理的文字包含：

- 遊戲標題、開始遊戲、返回主選單等共用按鈕
- 敵人顯示名稱
- 模式選擇按鈕與副標
- 選關畫面標題、鎖定提示、波數與最高分顯示
- 戰鬥 HUD 的 Boss HP、分數、傷害、Phase、關卡/波次狀態
- 結算畫面標題、分數、通關提示、失敗提示與按鈕
- 成就名稱、描述、成就頁標題與解鎖 toast

暫時仍保留在原場景檔內的長文本：

- 故事章節對白
- 圖鑑長篇說明
- 裝備、服裝、技能、僚雞的資料型描述

新增或修改 UI 文案時，優先檢查 `src/game/i18n/zh-TW.ts` 是否已有對應分類；只有劇情、圖鑑或資料型長文才建議保留在原資料檔。

## 開發 & 執行

```bash
npm install
npm run dev       # 開發模式 (http://localhost:3000)
npm run build     # 生產打包 → dist/
npm run preview   # 預覽打包結果
```

## 技術棧

- **[@inkshot/engine](https://www.npmjs.com/package/@inkshot/engine)** – Data-oriented TypeScript 遊戲引擎（基於 Pixi.js v8）
- **Vite** – 建置工具
- **TypeScript** – 型別安全
- 所有圖形以 **Pixi.js Graphics** API 程式化繪製，無需外部圖片資源

## 重要目錄

```text
src/
├── game/
│   ├── levels.ts             # 關卡、波次、Boss pattern
│   ├── battleProgression.ts  # 波次清除與 Boss 終章事件 helper
│   ├── achievements.ts       # 成就註冊與觸發條件
│   ├── i18n/                 # UI 語言檔
│   ├── endless.ts            # 無盡模式 scaling 與 Buff
│   └── persistence.ts        # 存檔載入/寫入
└── scenes/
    ├── GameScene.ts          # 核心戰鬥場景
    ├── LevelSelectScene.ts   # 關卡選擇
    ├── AchievementsScene.ts  # 成就列表
    └── GameOverScene.ts      # 結算畫面
```

```text
docs/
└── story-chapter-1-outline.md # 第一章 50 關故事大綱與角色弧線
```
