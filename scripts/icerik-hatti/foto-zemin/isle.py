"""KTL-64 zemin temizleme (elle yontem, deterministik, yeniden uretilebilir).
mod 'pad'  : beyaz tuval genisletme (urun zaten beyaz zeminde; kenara dayali)
mod 'bg'   : kenardan baglantili duz/yumusak gri zemini beyaza cevir, sonra pad
"""
import sys
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage as ndi

GIRIS, CIKIS, MOD = sys.argv[1], sys.argv[2], sys.argv[3]
BOSLUK = 0.06  # her kenarda en az %6 (kabul >= %4)

im = Image.open(GIRIS).convert("RGB")
a = np.array(im).astype(np.int32)
h, w = a.shape[:2]

if MOD == "bg":
    lum = a.mean(axis=2)
    # yerel gradyan: zemin yumusak, urun kenarlari sert
    gx = ndi.sobel(lum, axis=1); gy = ndi.sobel(lum, axis=0)
    grad = np.hypot(gx, gy)
    doygun = a.max(axis=2) - a.min(axis=2)
    aday = (lum >= 196) & (grad < 14) & (doygun < 14)
    aday = ndi.binary_opening(aday, iterations=1)
    lab, n = ndi.label(aday)
    kenar = np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))
    kenar = kenar[kenar != 0]
    zemin = np.isin(lab, kenar)
    zemin = ndi.binary_dilation(zemin, iterations=1)
    # delikleri koru: urunun icindeki kapali bolgeler zemin sayilmaz (zaten kenara bagli degil)
    alfa = np.where(zemin, 0.0, 1.0)
    alfa = ndi.gaussian_filter(alfa, 0.8)
    out = a * alfa[..., None] + 255 * (1 - alfa[..., None])
    a = np.clip(out, 0, 255).astype(np.int32)
    print("zemin orani %.1f%%" % (100 * zemin.mean()))

# beyaz tuval genisletme
px = int(round(w * BOSLUK)); py = int(round(h * BOSLUK))
tuval = np.full((h + 2 * py, w + 2 * px, 3), 255, dtype=np.uint8)
tuval[py:py + h, px:px + w] = a.astype(np.uint8)
Image.fromarray(tuval).save(CIKIS, "WEBP", quality=82, method=6)
print(CIKIS, tuval.shape[1], "x", tuval.shape[0])
