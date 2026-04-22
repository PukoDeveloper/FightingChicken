# FightingChicken

手機彈幕遊戲：小雞大戰勇氣 🐔⚔️

## 遊戲介紹

這是一款以 [@inkshot/engine](https://www.npmjs.com/package/@inkshot/engine) 為底層開發的手機彈幕射擊遊戲。
玩家扮演**小雞**，對抗強大的 Boss **勇氣**，在密集的彈幕中閃躲並反擊！

## 玩法說明

| 操作 | 動作 |
|------|------|
| 拖曳螢幕 | 移動小雞 |
| 自動射擊 | 小雞自動向上發射子彈 |
| 躲開彈幕 | 閃避勇氣的攻擊 |

## 遊戲特色

- **3 個戰鬥階段**：隨著勇氣血量減少，彈幕密度與速度提升
  - Phase 1（HP 100%–66%）：螺旋彈幕 + 瞄準射擊
  - Phase 2（HP 66%–33%）：高密度螺旋 + 扇形彈幕
  - Phase 3（HP 33%–0%）：超高速彈幕 + 環形爆發
- **觸控操作**：專為手機設計，拖曳移動
- **粒子特效**：命中與爆炸效果
- **小紅點瞄準**：小雞中心的紅點為真正的碰撞判定點
- **2.4 秒無敵時間**：被擊中後短暫閃爍

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
