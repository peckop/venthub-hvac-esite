from PIL import Image
import os
import glob

path = r"C:\Users\alize\.gemini\antigravity\brain\420b5bb3-ec73-47bf-829d-7fe57dd279b1\*.png"
for img_path in glob.glob(path):
    with Image.open(img_path) as img:
        w, h = img.size
        name = os.path.basename(img_path)
        print(f"IMAGE: {name} | SIZE: {w}x{h}")
