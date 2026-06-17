# 開發指引

## 版本與更新日誌

每次提交任何玩家可見的更新時，必須同步完成以下事項：

1. **更新版本號**
   - 修改 `package.json` 的 `version`。
   - 同步更新 `package-lock.json`。
   - 建議使用：
     ```bash
     npm version <new-version> --no-git-tag-version
     ```

2. **更新遊戲內日誌**
   - 修改 `src/game/changelog.ts`。
   - `APP_VERSION` 必須與 `package.json` 一致。
   - `CHANGELOG` 陣列最上方必須新增最新版本條目。

3. **更新 repo 日誌**
   - 修改根目錄 `CHANGELOG.md`。
   - 最新版本放在最上方。
   - 條目至少包含：
     - 更新重點
     - 詳細內容
     - 日期

4. **確認主畫面日誌頁**
   - 主畫面底部「日誌」按鈕會讀取 `src/game/changelog.ts`。
   - 若日誌資料格式調整，需同步檢查 `src/scenes/ChangelogScene.ts`。

## 提交前檢查

- 執行：
  ```bash
  npm run build
  ```
- 若 build 產生 `dist/index.html` 變更，但沒有要提交 build 產物，提交前請還原。
- 確認沒有把故事模式進度寫入一般關卡進度。
- 若新增劇情長文本，優先使用動態載入內容 chunk，避免主封包膨脹。

## 內容與資料維護

- 故事文字：放在 `src/game/story/content/`，按章節或段落拆 chunk。
- 圖鑑資料：目前集中在 `src/scenes/EncyclopediaScene.ts`。
- 造型資料：放在 `src/game/costumes.ts`。
- 關卡與小怪資料：放在 `src/game/levels.ts` 與 `src/game/endless.ts`。
