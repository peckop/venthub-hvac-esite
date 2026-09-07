#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""KAYNAK DIZINI EVREN KAPISI — "kapi kendi evrenini SAYSIN".

NICIN VAR (olculdu 2026-09-07 sabahi, URUN'un 09-06 bulgusundan tureyen sinav):
`teknik_bosluk.py` ve `kanit-tablosu.py` kaynak dizini uzerinde yuruyor. Dizini GECERLI ama
YANLIS bir kumeye cevirdim (tek belge, 164 sayfa; dosya var, JSON okunuyor, manifest yerinde):

    teknik_bosluk : 40 aile satirinin 40'i sinif degistirdi (SADECE_FIYAT -> KAYNAK_YOK)  cikis 0
    kanit-tablosu : KANITSIZ 208 -> 909, yabanci 287 -> 2824                              cikis 0

Yani iki betik de evren daralmasini GORUYOR ama SESSIZ: rapor yine uretiliyor, cikis 0.
Yanlis dizinle kosulan bir rapor "bu ailelerin kaynagi yok, web gerekir" der ve gercekte
olmayan bir is emri dogurur. Kusur "sonuc yanlis" degil, **yanlisligi kimse gormuyor**.

⚠SINAVIN SEKLI: evreni BOSALTMA, DARALT. Bos/yok dizin zaten cokerdi (kanit-tablosu :134
zaten "kaynak dizini YOK" diyor) — o sinav kolaydir ve asil kusuru KACIRIR.

KAPI: manifest.json'un bildirdigi sayfa sayisi = fiilen yuklenen sayfa sayisi. Manifest
dizinle birlikte uretilir (cikar.py), yani beklenen buyuklugun KAYITLI olcusudur.
Bilincli daraltma icin KAYNAK_TABAN_YOKSAY=1 — sessiz degil, ekrana SAPMA satiri basar.
"""
from __future__ import annotations

import json
import os
from pathlib import Path


def taban_dogrula(dizin_yol: Path, yuklenen_sayfa: int) -> dict:
    """Yuklenen evren, manifest'in bildirdigi buyuklukte mi? Degilse KIRMIZI.

    Doner: manifest sozlugu (cagiran belge sayisi vb. icin kullanabilir).
    """
    manifest_yol = Path(dizin_yol).parent / "manifest.json"
    if not manifest_yol.exists():
        raise SystemExit(f"⛔ EVREN OLCULEMEDI: {manifest_yol} yok — kaynak dizininin beklenen "
                         "buyuklugu bilinmiyor. Cikti uretilmedi.")
    manifest = json.loads(manifest_yol.read_text(encoding="utf-8"))
    beklenen = manifest.get("sayfa_sayisi")
    if not isinstance(beklenen, int) or beklenen <= 0:
        raise SystemExit(f"⛔ EVREN OLCULEMEDI: manifest'te gecerli 'sayfa_sayisi' yok "
                         f"({beklenen!r}). Cikti uretilmedi.")
    if yuklenen_sayfa != beklenen:
        if os.environ.get("KAYNAK_TABAN_YOKSAY") == "1":
            print(f"⚠ SAPMA (KAYNAK_TABAN_YOKSAY=1): evren {yuklenen_sayfa}/{beklenen} sayfa — "
                  "bilincli daraltma, cikti YINE de uretiliyor.")
            return manifest
        raise SystemExit(
            f"⛔ EVREN EKSIK: {yuklenen_sayfa} sayfa yuklendi, manifest {beklenen} diyor "
            f"({dizin_yol}). Dar/yanlis bir dizinle uretilen rapor, olmayan bir bosluk ya da "
            "olmayan bir kanitsizlik ilan eder. Cikti uretilmedi. "
            "Bilincli daraltma icin KAYNAK_TABAN_YOKSAY=1.")
    return manifest
