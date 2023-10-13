
# 教育部常用字
https://language.moe.gov.tw/result.aspx?classify_sn=23&subclassify_sn=437&content_sn=46

# 使用fonttools
pip install fonttools

# ttf to woff
pip install --user --upgrade fonttools[woff]

# 抓出所有使用的字, 並產出unique_chars.txt
findUniqueChar.py

# 使用pyftsubset匯出subset字
pyftsubset CWTEX-K.ttf --text-file=unique_chars.txt --no-hinting --output-file=CWTEX-K2.ttf

# 執行converTtf2Woff.py轉成woff2


方便小組投影片使用，採用Slidev(vue套件)
需要安裝python，以及Python工具 fonttools、ttf to woff

為了讓字體壓縮到最小，會使用python做處理
1. 先讀取pages底下的投影片檔案，抓出不重複中文字寫到fonts/toolkit底下unique-chars.txt
2. 


---

```
pip install fonttools

pip install --user --upgrade fonttools[woff]
```

# 如果不想做字型處理，在package.json中，拿掉scripts中的predev