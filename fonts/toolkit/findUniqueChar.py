"""
================================================================================
Slidev 字型子集化 (Font Subsetting) 預處理腳本
================================================================================
【用途】
1. 從主檔案 (main.md) 開始，遞迴追蹤所有透過 `src: path.md` 語法引用的投影片。
2. 自動解析相對路徑（支援 ./ 與 ../ 語法），確保抓取到正確的歌詞或頁面檔案。
3. 提取所有引用檔案中的不重複字元。
4. 根據正則表達式過濾字元（保留漢字、標點、數字、英文字母）。
5. 產出 `unique_chars.txt` 供字型縮減工具（如 font-spider 或 glyphhanger）使用。
**注意：此版本會忽略舊有的 unique_chars.txt，確保刪除的文字不會留在字型中。**

【運作邏輯】
- 起點：main.md
- 追蹤鏈：main.md -> pages/2026/date.md -> lyrics/song.md
- 優點：只會抓取「真正有用到」的檔案字元，避免字型檔包含未使用的冗餘字。
================================================================================
"""
import os
import re

# 1. 設定入口檔案與輸出路徑
ENTRY_FILE = 'main.md' 
OUTPUT_PATH = 'fonts/toolkit/unique_chars.txt'

# 2. 定義 Slidev 引用語法的正則表達式
SRC_PATTERN = re.compile(r'^src:\s*(.+?\.md)', re.MULTILINE)

def get_referenced_files(entry_path, found_files=None):
    """
    遞迴搜尋所有被引用的 Markdown 檔案。
    """
    if found_files is None:
        found_files = set()
    
    entry_path = os.path.normpath(entry_path)

    if not os.path.exists(entry_path) or entry_path in found_files:
        return found_files

    found_files.add(entry_path)
    
    try:
        with open(entry_path, 'r', encoding='utf-8') as f:
            content = f.read()
            matches = SRC_PATTERN.findall(content)
            for rel_path in matches:
                clean_path = rel_path.strip(' "\'')
                dir_name = os.path.dirname(entry_path)
                full_path = os.path.normpath(os.path.join(dir_name, clean_path))
                if os.path.exists(full_path):
                    get_referenced_files(full_path, found_files)
    except Exception as e:
        print(f"❌ 讀取檔案失敗 {entry_path}: {e}")
    
    return found_files

# --- 執行部分 ---

print("🔍 正在分析 Slidev 引用鏈（僅抓取當前使用的檔案）...")
referenced_mds = get_referenced_files(ENTRY_FILE)

print(f"✅ 成功追蹤到 {len(referenced_mds)} 個有效的 MD 檔案")
print("-" * 30)

# 字元過濾規則
allowed_re = re.compile(r"[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3000-\u303F0-9A-Za-z\uFF00-\uFFEF\u2000-\u206F\u002F\[\]\(\)\-,:.?!'\"\\/]")

def keep_char(ch):
    if ch.isspace():
        return False
    return bool(allowed_re.match(ch))

unique_chars = set()

# 遍歷真正有被使用的檔案並提取字元
for md_file in referenced_mds:
    with open(md_file, 'r', encoding='utf-8') as file:
        md_content = file.read()
        for char in md_content:
            if keep_char(char):
                unique_chars.add(char)

# 【已移除】原本這裡有讀取舊檔案並合併的邏輯，現在每次都會產出最乾淨的結果。

# 將字元按 Unicode 順序排序
unique_chars_str = ''.join(sorted(unique_chars, key=ord))

# 寫入結果 (使用 'w' 模式會自動覆蓋掉舊檔內容)
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, 'w', encoding='utf-8') as output_file:
    output_file.write(unique_chars_str)

print(f"🎉 處理完成！舊資料已清除。")
print(f"📊 目前共有 {len(unique_chars_str)} 個字元已寫入 {OUTPUT_PATH}")