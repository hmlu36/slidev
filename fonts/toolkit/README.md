
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