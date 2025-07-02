from PIL import Image
import os

def compress_and_convert_image(source_filename, target_filename, quality=80):
    # 取得目前資料夾路徑
    current_dir = os.getcwd()
    # 組合完整路徑
    source_path = os.path.join(current_dir, "public", "images", source_filename)
    target_path = os.path.join(current_dir, "public", "images", target_filename)
    # 開啟圖片
    with Image.open(source_path) as img:
        # 轉換成 webp 並壓縮
        img.save(target_path, 'webp', quality=quality)

# Example: Compress and convert test.jpg to test.webp
compress_and_convert_image('caleb-white-PLfzwAmflos-unsplash.jpg', 'caleb-white-PLfzwAmflos.webp', quality=5)