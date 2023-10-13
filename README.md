方便小組投影片使用，採用Slidev(vue套件)  
需要安裝python的套件，對字做處理，儘可能壓縮字體檔  
將轉換後的字型檔，存成CWTEX-K.ttf  

執行npm run dev的時候，會先做predev，執行batch_commands.bat的指令  
如果不想做字型處理，在package.json中，拿掉scripts中的predev  
fonts資料夾底下，字型檔改用CWTEX-K.ttf  

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