# hmlu36 slidev

網址: [https://hmlu36.github.io/slidev/](https://hmlu36.github.io/slidev/)

## 📖 專案簡介 (Introduction)

**投影片小程式緣起：**
1. 希望可以快速生成投影片，方便小組敬拜使用，減少帶領者的負擔。
2. 採用 [Slidev (Vue 套件)](https://sli.dev/)，讀取 Markdown 檔，產生投影片。
3. 為了精簡字體大小，採用 Python 套件，儘可能壓縮字體檔。
   - *（如果不想做字型處理，在執行 `npm run dev` 時可加入參數 `--no-predev`）*
4. 將轉換後的字型檔，存成 `woff2` 格式 (大小約少一半)。

---

## 🚀 快速開始 (Quick Start)

### 1. 安裝與設定 Python 環境 (僅第一次需要)
為了支援字體處理及未來的擴充功能，請先設定 Python 虛擬環境：
- **Windows**: 執行 `setup_env.bat`
- **Linux/Mac**: 執行 `./setup_env.sh`

### 2. 進入 Python 虛擬環境 (開發者/進階操作用)
如果需要手動執行其他的 Python 腳本 (如 `fonts/toolkit` 底下的工具)：
- **Windows**: 執行 `start_env.bat`
- **Linux/Mac**: 執行 `./start_env.sh`

---

## 📁 目錄結構與基礎使用 (Usage)

### 目錄結構
```text
. (repository root)  
├── package.json  
├── main.md                 # 首頁入口
├── components/             # Vue 自訂元件
├── pages/  
│   ├── 年份/                 # 當週投影片，以 yyyyMMdd.md 命名
│   │   ├── 20231006.md  
│   │   └── ...  
│   └── lyrics/             # 獨立的歌詞檔
│       ├── 以馬內利.md  
│       └── ...  
└── public/
    └── images/             # 背景圖存放處
```

### 投影片建立與引用
1. 主頁面固定從 `main.md` 進入。
2. 共用的歌詞檔統一放在 `pages/lyrics/` 底下。
3. 當週投影片放在 `pages/{年份}/` 底下，直接透過 YAML 中的 `src` 引用歌詞：
   ```yaml
   ---
   src: ../lyrics/以馬內利.md
   ---
   ```

### 樂手樂譜模式 (Musician Mode)
若要給樂手使用單頁樂譜模式，可在該歌詞頁網址結尾加上 `/musician`（例如 `.../lyrics/歌名/musician`），即可切換成固定雙欄的單頁捲動。
- 該模式會依視窗大小做 RWD 縮放，盡量維持原始排版比例，避免和弦偏移，並且**自動忽略**第一頁的主題封面內容。

---

## ⚙️ 核心功能與工具 (Features & Tools)

### 1. 自動化每週投影片建立 (New Week Automation)
提供自動化腳本，自動計算下一個週五的日期，產生當週 Markdown 檔並自動更新 `main.md`。

- **快速建立 (使用預設歌曲)**：
  ```bash
  npm run new-week
  ```
- **指定歌曲建立**：可直接帶入歌名，腳本會自動去 `pages/lyrics/` 尋找對應的檔案：
  ```bash
  npm run new-week "永活盼望" "我要愛慕祢" "祢是我的一切"
  ```
- **互動式搜尋 (模糊比對)**：如不確定完整歌名，輸入關鍵字即可。如果找到多個部分匹配結果，腳本會顯示清單詢問您要使用哪一首。
  ```bash
  npm run new-week "Center"
  ```
  *(輸出範例：將列出 Center 中心.md、Jesus at the Center... 供選擇)*

### 2. 和弦標示與隱藏
本專案支援自動轉換 Markdown 中的和弦標記，方便隨時切換純歌詞投影片與有和弦的樂譜模式。

- **標示和弦**：在 `.md` 檔案內的歌詞標題 (`#`) 段落中，直接使用中括號 `[和弦]` 寫在字詞前面或中間，系統渲染時會將其自動轉換並懸浮於歌詞上方。
  ```markdown
  # [1]當我等候 [1/3]在過程中
  # [4]祢向我唱出[5]愛的旋[1]律
  ```
- **全域隱藏和弦**：若特定場合不需要顯示和弦，可在該首詩歌最前方的 YAML Frontmatter 區塊中加入 `hideChords: true` 即可完全隱藏所有和弦。
  ```yaml
  ---
  layout: center
  hideChords: true
  ---
  ```

### 3. 字體處理與背景圖壓縮
- **字體壓縮 (已自動化)**：系統由 Github Actions 自動執行 Python 腳本抓取出使用到的不重複中文字，並根據 `unique-chars.txt` 篩選產生子集字體檔 (`woff2`)，大幅減少載入體積。
- **背景圖處理**：背景圖放置於 `public/images`。推薦使用內部腳本 `image2webp.py` 將圖片轉為 WebP 格式以減少空間佔用 (須安裝套件：`pip install Pillow`)。

---

## 🧩 自訂元件說明 (Components)

Slidev 會自動載入 `components/` 目錄中的元件，直接在 Markdown 中呼叫標籤即可。

### 1. BilingualBlock（雙語區塊）
- **作用**：將中英雙語歌詞自動置中，並維持一致的排版，減少手動加上 HTML `<div>` 的繁瑣。
- **使用方式**：
  ```markdown
  <BilingualBlock>
  # 祢是我依靠的力量
  ## You are my strength when I am weak
  </BilingualBlock>
  ```
  *(註：若只需要將單行內的少部分英文縮小，也可以使用 `<span class="spacing-0">英文</span>` 來幫助排版。)*

### 2. JumpToById（跳轉按鈕）
- **作用**：點擊後自動平滑滾動到指定 ID 的 DOM 元素。若目標 ID 不在當前視圖，元件會自動在被編譯好的所有分頁中尋找並跳轉到目標。
- **屬性 (Props)**：
  - `target` *(必填)*：目標元素的 HTML ID。
  - `align` *(選填)*：行內對齊方式，`left` 或 `right` (預設為右側 `right`)。
- **使用方式**：
  ```markdown
  <!-- 放一個向右對齊的跳轉按鈕 -->
  <JumpToById target="bridge1">→ 跳至 Bridge</JumpToById>
  
  <!-- 放一個向左對齊的跳轉按鈕 -->
  <JumpToById target="verse2" align="left">→ Verse 2</JumpToById>
  ```
  **如何設定目標錨點：** 在任何位置加入帶有 ID 的標籤即可。
  ```markdown
  <div id="bridge1"/>  
  <!-- 或 -->
  <h1 id="verse2">...</h1>
  ```


