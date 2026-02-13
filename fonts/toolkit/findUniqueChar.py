import os
import glob

# 搜尋`pages`目錄下的所有MD檔案（包含子目錄）
pages_mds = glob.glob('pages/**/*.md', recursive=True)

# 合併並去重（避免重複，例如 pages/lyrics 已包含在上面的遞迴結果）
md_files = sorted(set(pages_mds))

# 創建一個集合來存儲不重複的字元（只保留必要字元以便做字型 subset）
import re

allowed_re = re.compile(r"[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3000-\u303F0-9A-Za-z\uFF00-\uFFEF\u2000-\u206F\u002F\[\]\(\)\-,:.?!'\"\\/] ")

def keep_char(ch):
    """只保留：常用漢字範圍、阿拉伯數字、基本 ASCII 標點、全形標點及常用符號。"""
    if ch.isspace():
        return False
    return bool(allowed_re.match(ch))

unique_chars = set()

# 遍歷每個MD檔案並過濾字元
for md_file in md_files:
    with open(md_file, 'r', encoding='utf-8') as file:
        md_content = file.read()
        for char in md_content:
            if keep_char(char):
                unique_chars.add(char)

# 嘗試讀取現有的 unique_chars.txt / slides.md 並過濾後合併
try:
    with open('fonts/toolkit/unique_chars.txt', 'r', encoding='utf-8') as existing_file:
        existing_chars = {c for c in existing_file.read() if keep_char(c)}
    unique_chars.update(existing_chars)

    with open('slides.md', 'r', encoding='utf-8') as existing_file:
        existing_chars = {c for c in existing_file.read() if keep_char(c)}
    unique_chars.update(existing_chars)
except FileNotFoundError:
    pass

# 有序（按 Unicode code point）轉換為字串，確保輸出可重現
unique_chars_str = ''.join(sorted(unique_chars, key=ord))

# 將不重複的繁體中文字符寫入unique_chars.txt檔案
with open('fonts/toolkit/unique_chars.txt', 'w', encoding='utf-8') as output_file:
    output_file.write(unique_chars_str)
