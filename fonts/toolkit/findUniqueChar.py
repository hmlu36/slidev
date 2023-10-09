import os
import glob

# 搜尋`pages`目錄下的所有MD檔案
md_files = glob.glob('pages/*.md')

# 創建一個集合來存儲不重複的中文字
unique_chars = set()

# 遍歷每個MD檔案
for md_file in md_files:
    with open(md_file, 'r', encoding='utf-8') as file:
        md_content = file.read()
        # 遍歷MD檔案的內容，將繁體中文字符添加到集合中
        for char in md_content:
            if '\u4e00' <= char <= '\u9fff':
                unique_chars.add(char)

# 嘗試讀取現有的unique_chars.txt檔案，如果不存在，則創建一個新的檔案
try:
    with open('fonts/toolkit/unique_chars.txt', 'r', encoding='utf-8') as existing_file:
        existing_chars = set(existing_file.read())
    unique_chars.update(existing_chars)
except FileNotFoundError:
    pass

# 將集合轉換為字串
unique_chars_str = ''.join(unique_chars)

# 將不重複的繁體中文字符寫入unique_chars.txt檔案
with open('fonts/toolkit/unique_chars.txt', 'w', encoding='utf-8') as output_file:
    output_file.write(unique_chars_str)
