# 腦圖書館

個人專屬的學習空間：科目樹、筆記，之後會加入單字卡複習（FSRS）、PDF 螢光筆、影片和 AI 小助手。

## 開發

```bash
npm install
npm run dev      # 開發伺服器
npm run build    # 型別檢查 + 打包
```

## 目前進度（第一階段）

- 可自訂深度的科目樹：資料夾與筆記的新增、重新命名、刪除
- 筆記編輯，自動保存
- 手機與桌面版面
- 資料目前存在瀏覽器本機（`src/store/localStore.ts`）。登入與 Firestore 雲端同步會替換這一層，介面見 `src/store/types.ts`
