# hmlu36 slidev（敬拜投影片工具）

🌐 線上播放：<https://hmlu36.github.io/slidev/>

用 Markdown 寫歌詞，[Slidev](https://sli.dev/) 自動變成敬拜投影片；push 到 GitHub 後自動部署上線。

播放快捷鍵：`→`/`空白鍵` 下一頁｜`←` 上一頁｜`F` 全螢幕｜`O` 總覽｜`D` 深色｜`?` 全部快捷鍵

---

## 🤖 用 AI 準備投影片（推薦，不用會寫程式）

用 AI 工具（opencode、Claude Code、Cursor…）打開這個資料夾，直接用中文說要做什麼：

| 想做的事 | 對 AI 說 |
| --- | --- |
| 建立下週投影片 | 「建立下週投影片」 |
| 指定詩歌建立 | 「建立下週投影片，詩歌：永活盼望、我要愛慕祢」 |
| 換本週歌單 | 「把本週歌單換成 `lyrics/願.md`、`lyrics/點燃.md`」 |
| 新增一首歌 | 「把這首歌存成 `lyrics/歌名.md`」（附上歌詞） |
| 找一首歌 | 「找 `lyrics/` 裡有沒有『盼望』相關的歌」 |
| 預覽／上線 | 「啟動預覽」／「幫我部署」 |

> **opencode 使用者**：直接輸入 `/new-week` 即可建立下週投影片，可加歌名：`/new-week 永活盼望 我要愛慕祢`。

小技巧：一次講一件事、附上歌名或檔案路徑；請 AI 先預覽再發布。

---

## 📅 每週流程

1. **建立**：`npm run new-week`（自動取下一個週五，建立 `pages/{年份}/YYYYMMDD.md` 並更新 `main.md`）
   - 可指定詩歌、支援關鍵字模糊比對：`npm run new-week "永活盼望" "我要愛慕祢"`
2. **編輯歌單**：編輯該檔，每首詩歌一段，段落之間空一行：
   ```yaml
   ---
   src: ../../lyrics/稱頌主.md
   ---

   ---
   src: ../../lyrics/我要愛慕祢.md
   ---
   ```
3. **預覽 → 上線**：`npm run dev` 確認 → 雙擊 `deploy.bat`（或 `git push`，GitHub Actions 會自動部署）

首頁 `main.md` 的 `src` 指到本週檔案即可；日期與「主日敬拜／小組敬拜」標題由 `<WeekDate />` 自動判斷，不用手改。

---

## 📝 編輯說明

**歌詞檔 `lyrics/歌名.md`**
- 每頁一行 `# 歌詞`，頁與頁之間用 `---` 分隔。
- 和弦：寫在字詞前，如 `# [1]當我等候 [1/3]在過程中`，自動懸浮在歌詞上方。
- 隱藏全部和弦：frontmatter 加 `hideChords: true`。
- 樂手模式：該頁網址結尾加 `/musician`，變固定雙欄單頁捲動（自動忽略封面頁）。

**常用元件**（Slidev 自動載入 `components/`）
- `<BilingualBlock>`：中英雙語自動置中、一致排版。
- `<JumpToById target="bridge1" align="left">→ Bridge</JumpToById>`：跳轉按鈕；目標用 `<div id="bridge1"/>` 設定。
- `<WeekDate />`：自動顯示日期與敬拜類型。

---

## 📁 目錄結構

```text
├── main.md                  # 首頁入口（指到本週 pages 檔）
├── pages/{年份}/YYYYMMDD.md # 每週投影片（當週歌單）
├── lyrics/                  # 歌詞庫（一首歌一檔）
├── messages/                # 訊息、活動頁
├── components/              # 自訂元件
├── scripts/                 # new-week.js、字型／圖片工具
├── public/images/           # 背景圖與圖片
├── deploy.bat               # 一鍵部署（Windows）
└── .github/workflows/       # 自動部署設定
```

---

## ⚙️ 本機安裝與指令（改版面、寫程式才需要）

```bash
npm install   # 第一次
npm run dev   # 本機預覽（自動開瀏覽器）
```

| 指令 | 說明 |
| --- | --- |
| `npm run build` | 產生靜態網頁到 `dist/` |
| `npm run export` | 匯出 PDF |
| `npm run new-week` | 建立下一週投影片 |

- **字型**：push 後 GitHub Actions 自動產生子集字型（`scripts/findUniqueChar.py`），本機不用處理。
- **背景圖**：放 `public/images/`；可用 `scripts/image2webp.py` 轉 WebP（需 Pillow）。
- **Python 環境（選用，僅工具腳本）**：`setup_env.bat` 建立、`start_env.bat` 進入；或 `pip install -r scripts/requirements.txt`。
- **部署**：push `main` 後由 `.github/workflows/deploy.yml` 自動部署到 GitHub Pages（也可在 Actions 頁手動執行）。

---

## 🔗 教會歌詞來源

https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSPiQPz6gSvt_counl4xx45mDsrLBIr7bbu_mInxjW7nmQngHNeV-OZsUx1AbY_YrYfJvxh1wOiQ9TNYfRvJULYx5AY1vb2nP3g5LzmrvBd8q8dBs-ZHGguCF-fcSuyLkw7NV1SgV79CkaiFIUatrb1-5HnYGp7RJAZUw4DvRx0bG7PducJEVYc2RcwKvEfLEm23azCLobrotITXnLVHNlRM2yUuJHQfxfpi9vVvJVi0uw_I048YIyon_Ql4yRxKBr9K91GmVHmGpYO4Obd_X0p1s8RtolRb1mJ90JE&lib=MtQh7qhGdnyDsPwgekirHl_AgPg7T2ed9
