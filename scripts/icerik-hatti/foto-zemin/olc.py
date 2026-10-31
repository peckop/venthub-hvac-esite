import sys, glob, os
from PIL import Image
import numpy as np

def olc(yol):
    im = Image.open(yol).convert("RGBA")
    a = np.array(im)
    h, w = a.shape[:2]
    s = 3
    seritler = np.concatenate([
        a[:s, :].reshape(-1, 4), a[-s:, :].reshape(-1, 4),
        a[:, :s].reshape(-1, 4), a[:, -s:].reshape(-1, 4)])
    ok = (seritler[:, 3] < 16) | ((seritler[:, :3] >= 236).all(axis=1))
    # icerik sinirlari: beyaz-olmayan ve opak
    govde = (a[:, :, 3] >= 16) & ~((a[:, :, :3] >= 236).all(axis=2))
    ys, xs = np.where(govde)
    kenar = ""
    if len(ys):
        kenar = "bosluk%% sol %.1f sag %.1f ust %.1f alt %.1f" % (
            100 * xs.min() / w, 100 * (w - 1 - xs.max()) / w,
            100 * ys.min() / h, 100 * (h - 1 - ys.max()) / h)
    alfa = (a[:, :, 3] < 255).mean() * 100
    print("%s %dx%d serit>=236/saydam %%%.1f | alfa-piksel %%%.1f | %s" % (
        os.path.basename(yol), w, h, 100 * ok.mean(), alfa, kenar))

for y in sorted(glob.glob(sys.argv[1])):
    olc(y)
