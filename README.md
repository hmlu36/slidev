- **使用說明**  

主頁從 main.md進入  
歌詞放在 pages/lyrics  
當週投影片會放在pages底下，會以yyyyMMdd.md命名  
裡面會引用用到的歌詞  
引用方式，ex:   
```yaml
---
src: ./lyrics/以馬內利.md
---
```
---

- **投影片小程式緣起**  

* 希望可以快速生成投影片，方便小組敬拜使用，減少帶領者的負擔
* 採用Slidev(vue套件)，讀取markdown檔，產生投影片
* 為了精簡字體大小，採用python套件，儘可能壓縮字體檔
* 如果不想做字型處理，在package.json中，拿掉scripts中的predev
* (fonts資料夾底下，字型檔改用CWTEX-K.ttf)
* 將轉換後的字型檔，存成woff2格式(大小約少一半)

---

為了讓字體壓縮到最小，會使用python做處理  
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

* 執行npm run dev的時候，會先做predev，執行batch_commands.bat的指令