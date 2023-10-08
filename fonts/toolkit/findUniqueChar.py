# 打開MD文字檔
with open('../../pages/20231006.md', 'r', encoding='utf-8') as md_file:
    # 讀取MD文件的內容
    md_content = md_file.read()

# 使用set來儲存不重複的中文字
unique_chars = set()

# 遍歷MD文件內容，將中文字添加到set中
for char in md_content:
    if '\u4e00' <= char <= '\u9fff':
        unique_chars.add(char)

# 將set轉換為字串
unique_chars_str = ''.join(unique_chars)

# 將不重複的中文字寫入unique_chars.txt文件
with open('unique_chars.txt', 'w', encoding='utf-8') as output_file:
    output_file.write(unique_chars_str)
