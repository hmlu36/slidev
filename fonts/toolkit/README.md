# 使用fonttools
pip install fonttools

# 教育部常用字
https://language.moe.gov.tw/result.aspx?classify_sn=23&subclassify_sn=437&content_sn=46

# 使用pyftsubset匯出subset字
pyftsubset CWTEX-K.ttf --text-file=word.txt --no-hinting --output-file=CWTEX-K2.ttf

# ttf to woff
pip install --user --upgrade fonttools[woff]