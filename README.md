# hmlu36 slidev

- **投影片小程式緣起**  

1. 希望可以快速生成投影片，方便小組敬拜使用，減少帶領者的負擔
2. 採用Slidev(vue套件)，讀取markdown檔，產生投影片
3. 為了精簡字體大小，採用python套件，儘可能壓縮字體檔
3. 如果不想做字型處理，在執行npm run dev時加入參數 --no-predev
4. 將轉換後的字型檔，存成woff2格式(大小約少一半)

---

-  **使用說明**  

主頁從 main.md進入，歌詞放在 pages/lyrics  
當週投影片會放在pages底下，會以yyyyMMdd.md命名  
裡面會引用用到的歌詞  
引用方式，ex:   

```yaml
---
src: ../lyrics/以馬內利.md
---
```

目錄結構如下:   
. (repository root)  
├── README.md   
├── package-lock.json   
├── package.json  
├── main.md  
└── pages  
    ├── 年份, ex: 2023  
    ├────20231006.md  
    ├────20231013.md  
    ├── ...  
    └── lyrics  
         ├── 以馬內利.md  
         ├── 在呼召我之處.md  
         └── ...  

---

- **字體處理**  

改成從Github執行Python取出字體

<!-- 
- **為了讓字體壓縮到最小，python處理動作如下**  
1. 先讀取pages底下的投影片檔案，抓出不重複中文字寫到fonts/toolkit底下unique-chars.txt
   (fonts/toolkit/findUniqueChar.py)
2. 會根據unique-chars.txt比對字型檔(CWTEX-K.ttf)中的字，篩選出有的字產生CWTEX-K2.ttf
3. 將ttf轉成woff2格式，檔案會更小
   (fonts/toolkit/converTtf2Woff.py)

須安裝以下兩個python套件
```
# 使用fonttools
pip install fonttools

# ttf to woff
pip install --user --upgrade fonttools[woff] 
```

* 執行npm run dev的時候，會先做predev，執行batch_commands.bat的指令，再產生投影片
-->

```
.\fonts\toolkit\batch_commands.bat
```

---

- **背景圖**
背景圖放在public/images底下  
可以透過image2webp.py轉成webp格式，減少檔案大小

需安裝
```
pip install Pillow
```

---

## 元件使用說明：JumpToById 與 BilingualBlock

### BilingualBlock（雙語區塊）
- 作用：把中英歌詞自動置中並維持一致排版，減少每段都要包 `<div>` 的需要。
- 使用方式（在 .md 裡）：
```markdown
<BilingualBlock>
# 祢是我依靠的力量
## You are my strength when I am weak
</BilingualBlock>
```
- 已包含在 `components/BilingualBlock.vue`，Slidev 會自動載入 components 資料夾裡的元件。
- 若需要縮小英文，仍可用 `.spacing-0`（例如：`# 主祢真偉大 <span class="spacing-0">How awesome You are</span>`），或在 style.css 提供更通用的字型規則。

### JumpToById（跳轉按鈕）
- 作用：按下後會滾動到指定 ID 的 DOM 元素；若該 ID 不在當前頁，元件會嘗試導航到包含該 ID 的分頁並滾動到目標。
- Props：
  - `target: string`（必填）：目標元素的 id
  - `align?: 'left' | 'right'`（選填）：用來決定按鈕在行內對齊（預設為 `right`）
- 使用方式（在 .md 裡）：
```markdown
<!-- 在投影片任意位置放按鈕 -->
<JumpToById target="holy-forever-pre-chorus1">→ Pre Chorus 1</JumpToById>

<!-- 或靠左 -->
<JumpToById target="holy-forever-verse1" align="left">→ Verse 1</JumpToById>
```
- 目標元素（anchor）可以這樣建立：
  - 自閉合的 HTML 標籤：
    ```markdown
    <div id="holy-forever-pre-chorus1"/>
    ```
  - 或任何 HTML 元素帶上 `id` 屬性（例如 `<h1 id="my-id">`）。
- 行為細節：
  - 元件會先嘗試在當前頁尋找目標（若找到會直接滾動）。
  - 若未找到，會自動向前、向後掃描分頁並嘗試導航去找目標，找到後滾動並快取該 id → 頁碼對應，減少後續搜尋時間。
  - 在搜尋期間會暫時在 `body` 上加 `jumping` class，以避免跟全域換頁事件衝突。
- 範例：固定在右側垂直排列（若需要多個按鈕）


---

## Python 環境
### 1. 安裝與設定 Python 環境 (僅第一次需要)

為了支援部分功能及未來的擴充，請先設定 Python 環境：

**Windows:**
執行 `setup_env.bat`

**Linux/Mac:**
執行 `./setup_env.sh`

### 2. 進入 Python 虛擬環境 (開發者用)

如果需要執行其他 Python 腳本 (如 `fonts/toolkit` 底下的工具)：

**Windows:**
執行 `start_env.bat`

**Linux/Mac:**
執行 `./start_env.sh`


## 自動化每週投影片建立 (New Week Automation)

我們提供了一個自動化腳本來簡化每週投影片的建立流程。

### 1. 使用方式 (快速建立投影片)

執行以下指令，將會：
1. 自動計算下一個週五的日期。
2. 建立 `pages/YYYY/YYYYMMDD.md` 檔案。
3. 自動更新 `main.md` 指向新檔案。

#### 基本用法 (使用預設歌曲)
```bash
npm run new-week
```

#### 指定歌曲
可以直接帶入歌名，腳本會自動去 `pages/lyrics/` 尋找對應的 `.md` 檔案。
```bash
npm run new-week "永活盼望" "我要愛慕祢" "祢是我的一切"
```

#### 互動式搜尋 (模糊比對)
如果不確定完整歌名，可以輸入關鍵字。如果找到多個部分匹配的結果，腳本會詢問你要使用哪一首。
```bash
npm run new-week "Center"
```
輸出範例：
```text
[NOT FOUND] Lyric file: Center.md
    Possible matches:
      1. Center 中心.md
      2. Jesus at the Center 耶穌祢是中心.md
    Select a song (1-2) or press Enter to keep "Center.md": 
```
輸入 `1` 即可選擇 `Center 中心.md`。


