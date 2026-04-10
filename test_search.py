import os
import glob
import sys

# Windows'ta stdout loglarda hata vermesin diye
sys.stdout.reconfigure(encoding='utf-8')

search_paths = [
    r"C:\Users\alize\.gemini\antigravity\brain\**\*.md",
    r"C:\Users\alize\venthub-hvac\registry\**\*.md"
]

keywords = ["pdf", "gemini", "llm", "rag"]
image_keywords = ["resim", "image", "görüntü", "görsel"]

found_files = []

for pattern in search_paths:
    for file_path in glob.glob(pattern, recursive=True):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read().lower()
                
            has_all_kws = all(kw in content for kw in keywords)
            has_image_kw = any(ikw in content for ikw in image_keywords)
            
            if has_all_kws and has_image_kw:
                found_files.append(file_path)
        except Exception:
            pass

if found_files:
    for f in found_files:
        print(f"FOUND: {f}")
else:
    print("NO_FILES_FOUND")
