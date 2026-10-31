"""Galeri taramasi: product-images deposundaki tum fotograflarin 3 px kenar seridi olcumu.
Kabul: serit pikselinin >=%85'i beyaz (RGB>=236) ya da saydam. Sirali istek, 0.15 sn aralik."""
import sys, json, re, time, io, urllib.request
from PIL import Image
import numpy as np

kaynak = open(sys.argv[1], encoding="utf-8").read()
yollar = re.findall(r'\\"path\\":\\"([^"\\]+)\\"', kaynak)
BASE = "https://tnofewwkwlyjsqgwjjga.supabase.co/storage/v1/object/public/product-images/"
print("yol sayisi", len(yollar), flush=True)
sonuc = []
for i, y in enumerate(yollar):
    try:
        with urllib.request.urlopen(BASE + y, timeout=30) as r:
            veri = r.read()
        a = np.array(Image.open(io.BytesIO(veri)).convert("RGBA"))
        s = 3
        sr = np.concatenate([a[:s].reshape(-1, 4), a[-s:].reshape(-1, 4),
                             a[:, :s].reshape(-1, 4), a[:, -s:].reshape(-1, 4)])
        ok = ((sr[:, 3] < 16) | (sr[:, :3] >= 236).all(axis=1)).mean() * 100
        sonuc.append({"path": y, "w": a.shape[1], "h": a.shape[0], "serit": round(float(ok), 1)})
    except Exception as e:
        sonuc.append({"path": y, "hata": str(e)[:80]})
    if i % 100 == 0:
        print(i, flush=True)
    time.sleep(0.15)
json.dump(sonuc, open("C:/tmp/ktl64/galeri-tarama.json", "w"), ensure_ascii=False)
gecen = [r for r in sonuc if r.get("serit", 0) >= 85]
print("bitti", len(sonuc), "gecen", len(gecen), "kalan", len([r for r in sonuc if "serit" in r and r["serit"] < 85]), "hata", len([r for r in sonuc if "hata" in r]))
