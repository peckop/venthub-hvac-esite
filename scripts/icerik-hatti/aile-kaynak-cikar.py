#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Aile -> kendi kaynak PDF'leri haritasini TASLAKLARDAN cikarir (elle yazilmaz).

KULLANIM
  python scripts/icerik-hatti/aile-kaynak-cikar.py docs/audits urunler.json cikti.json
  (ikinci arguman: urun-veri-cek.mjs ciktisi ya da duz aile-slug listesi)

NICIN taslaktan: taslak, bir ailenin hangi katalog sayfalarindan yazildiginin
KAYITIDIR. Elle harita yazmak, olculmemis bir esleme uydurmak olurdu.

Yontem:
  1. Her taslakta kod->pdf haritasi = yerlesik varsayilan + <!-- KAYNAK-HARITASI: ... -->
  2. Taslak, icinde `aile-slug` gecen ## basliklariyla BOLUMLERE ayrilir.
  3. Bir ailenin PDF kumesi = KENDI bolumunde gecen [KOD s.NN] referanslarinin PDF'leri.
  4. Bolumunde hic referans yoksa taslagin tumundeki kodlar kullanilir (durust genisleme).
"""
import json
import re
import sys
from pathlib import Path

YERLESIK = {
    "AVenS": "avens_fiyat_listesi_2026_HQ.pdf",
    "VLK": "LINEO_QUITE_KATALOG.pdf",
    "HSK": "heat-master-slimroof-cati-fanlari-yeni.pdf",
    "VMC": "vortice-brochure-radon-en.pdf",
    "MONO": "vortice_vort_mono_range_new.pdf",
}
HARITA_YORUM = re.compile(r"<!--\s*KAYNAK-HARITASI:\s*([^>]*?)-->")
VARSAYILAN_YORUM = re.compile(r"<!--\s*VARSAYILAN-KAYNAK:\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)\s*-->")
REF = re.compile(r"\[([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+s\.\s*[0-9]")
# Adsiz referans: [s.41] — kaynak adi VARSAYILAN-KAYNAK yorumundan gelir.
REF_ADSIZ = re.compile(r"\[s\.\s*[0-9]")
BASLIK = re.compile(r"^#{2,4}\s+.*$", re.M)

taslak_dizin = Path(sys.argv[1])
_ham = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
# Girdi ya duz slug listesi ya da urun-veri-cek.mjs ciktisidir (tek girdi ile kosulabilsin).
if _ham and isinstance(_ham[0], dict):
    aile_sluglari = {u["family_slug"] for u in _ham if u.get("family_slug")}
else:
    aile_sluglari = set(_ham)
cikti = Path(sys.argv[3])

aile_pdf = {}
kapsanan_taslak = {}

for yol in sorted(taslak_dizin.glob("icerik-hatti-taslak-*.md")):
    if "kategori-rehber" in yol.name:
        continue
    metin = yol.read_text(encoding="utf-8")
    harita = dict(YERLESIK)
    m = HARITA_YORUM.search(metin)
    if m:
        for parca in m.group(1).split(","):
            if "=" in parca:
                k, v = parca.split("=", 1)
                harita[k.strip()] = v.strip()

    vm = VARSAYILAN_YORUM.search(metin)
    varsayilan = vm.group(1) if vm and vm.group(1) in harita else None

    def kodlari_bul(govde):
        k = {c for c in REF.findall(govde) if c in harita}
        if varsayilan and REF_ADSIZ.search(govde):
            k.add(varsayilan)
        return k

    taslak_kodlari = kodlari_bul(metin)

    # bolumlere ayir: (baslangic, bitis, govde)
    sinirlar = [b.start() for b in BASLIK.finditer(metin)] + [len(metin)]
    if sinirlar[0] != 0:
        sinirlar = [0] + sinirlar
    bolumler = [(sinirlar[i], sinirlar[i + 1], metin[sinirlar[i]:sinirlar[i + 1]])
                for i in range(len(sinirlar) - 1)]

    # Aile slug'i BASLIKTA degil GOVDEDE gecer (olculdu: baslik insan adi kullaniyor).
    # Bu yuzden slug'in gectigi HER bolumun referanslari o aileye sayilir.
    for s in aile_sluglari:
        if s not in metin:
            continue
        kodlar = set()
        for _b, _e, govde in bolumler:
            if s in govde:
                kodlar |= kodlari_bul(govde)
        if not kodlar:
            kodlar = taslak_kodlari  # durust genisleme: dar kume yerine taslagin tumu
        if not kodlar:
            continue
        aile_pdf.setdefault(s, set()).update(harita[k] for k in kodlar)
        kapsanan_taslak.setdefault(s, set()).add(yol.name)

sonuc = {a: sorted(p) for a, p in sorted(aile_pdf.items())}
cikti.write_text(json.dumps(sonuc, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                 encoding="utf-8", newline="\n")

eksik = sorted(aile_sluglari - set(sonuc))
print(f"aile (DB)          : {len(aile_sluglari)}")
print(f"haritaya giren     : {len(sonuc)}")
print(f"HARITASIZ KALAN    : {len(eksik)}")
for e in eksik:
    print(f"   - {e}")
print()
dagilim = {}
for a, p in sonuc.items():
    dagilim[len(p)] = dagilim.get(len(p), 0) + 1
print("aile basina PDF sayisi dagilimi:", dict(sorted(dagilim.items())))
