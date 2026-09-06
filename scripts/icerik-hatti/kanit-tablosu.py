#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""KANIT TABLOSU + KANITSIZ DEGER MANDALI (REC-163 Adim 2).

NE YAPAR: her DB degerini kaynak dizinindeki bir sayfaya baglamaya CALISIR ve
baglanamayanlari SAYAR. Cikti iki dosya:
  kanit-tablosu.jsonl   — baglanabilen her deger icin bir satir
  kanitsiz.jsonl        — baglanamayan her deger icin bir satir (URUN x ALAN)

⭐NICIN "KANITSIZ" SAYISI YAYIMLANIR (URUN'un onerisi, OPS kabul etti):
Bir dizin, ICERDIGIYLE degerlendirilirse hep iyi gorunur — kanitsiz kisim GORUNMEZ olur.
"Kac degerin kaynagi yok" sayisi basilmazsa "katalogda ne eksik" sorusunun olculebilir
cevabi hic dogmaz. Bu sayi TEK YONLU MANDALDIR: yalniz kuculur. Buyuduyse ya yeni veri
geldi (aciklanir) ya da bir kaynak baglantisi koptu (kirmizi).

⚠ V1'IN DURUST SINIRI — ADI DA ONU SOYLUYOR:
Bu surum "deger, ailenin kaynak PDF'lerinden birinde GECIYOR mu" sorusunu sorar; "o sayfa
bu urun icin DOGRU mu" sorusunu SORMAZ. Bu yuzden bulunan satirin alani `kanit_gucu`
degil `esleme_yontemi`dir ve degeri SAYFA_ICINDE_GECIYOR'dur. Gecmek, dogrulugu kanitlamaz
(bugun kapida olculdu: sayi sayfada MODEL ADI olarak da gecebiliyor — 'HF/S 315' vs '315 mm').
Guclu esleme (tablo hucresi, satir/sutun) bir sonraki adimdir ve o zaman bu alan degisir.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

for _akis in (sys.stdout, sys.stderr):
    try:
        _akis.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

DIZIN_VARSAYILAN = Path.home() / "venthub-pdf-ingestor" / "kaynak-dizini" / "sayfalar.jsonl"


def norm(s: str) -> str:
    s = s.replace("º", "°")
    s = re.sub(r"(?<=[0-9]),(?=[0-9])", ".", s)
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", "", s).upper().replace("M3/H", "M³/H")


def dizini_yukle(yol: Path):
    """(pdf_hash, dosya, sayfa) -> normalize edilmis sayfa metni."""
    sayfalar = []
    with open(yol, encoding="utf-8") as fh:
        for satir in fh:
            if not satir.strip():
                continue
            k = json.loads(satir)
            metin = k.get("metin") or ""
            # tablo hucreleri de aranabilir metne katilir — deger cogu zaman TABLODADIR
            for t in k.get("tablo") or []:
                for r in t.get("satirlar") or []:
                    metin += "\n" + " ".join(str(h) for h in r if h)
            sayfalar.append({"dosya": k["dosya"], "sayfa": k["sayfa"],
                             "pdf_hash": k["pdf_hash"], "n": norm(metin)})
    return sayfalar


# Aranabilir deger mi: sayi ya da kod tasimayan metin (ör. "Evet", "Beyaz") kaynakta
# aranamaz — bunlar AYRI sinifta sayilir, "kanitsiz" ile karistirilmaz.
ARANABILIR = re.compile(r"[0-9]|IP\s?[0-9X]|ATEX|EC|IE[3-5]", re.I)


def main() -> int:
    ap = argparse.ArgumentParser(description="Kanit tablosu + kanitsiz mandal (REC-163)")
    ap.add_argument("--dizin", default=str(DIZIN_VARSAYILAN))
    ap.add_argument("--veri", required=True, help="products JSON (slug, family_slug, technical_specs)")
    ap.add_argument("--cikti-dizin", default=".")
    a = ap.parse_args()

    dizin_yol = Path(a.dizin)
    if not dizin_yol.exists():
        print(f"⛔ kaynak dizini YOK: {dizin_yol}")
        print("   Once: python scripts/kaynak_dizini/cikar.py (ingestor deposu)")
        return 2

    sayfalar = dizini_yukle(dizin_yol)
    print(f"dizin: {len(sayfalar)} sayfa yuklendi ({dizin_yol.name})")

    urunler = json.loads(Path(a.veri).read_text(encoding="utf-8"))
    print(f"veri : {len(urunler)} urun")

    kanit, kanitsiz = [], []
    olculemez = 0
    for u in urunler:
        ozellikler = u.get("technical_specs") or {}
        for alan, deger in sorted(ozellikler.items()):
            if deger is None or str(deger).strip() == "":
                continue
            metin = str(deger)
            if not ARANABILIR.search(metin):
                olculemez += 1
                continue
            hedef = norm(metin)
            if len(hedef) < 2:
                olculemez += 1
                continue
            bulunanlar = [s for s in sayfalar if hedef in s["n"]]
            if bulunanlar:
                ilk = bulunanlar[0]
                kanit.append({
                    "urun": u["slug"], "aile": u.get("family_slug"), "alan": alan,
                    "deger": metin, "pdf_hash": ilk["pdf_hash"], "dosya": ilk["dosya"],
                    "sayfa": ilk["sayfa"], "aday_sayfa_sayisi": len(bulunanlar),
                    # ⚠ GECMEK DOGRULUK DEGILDIR — alan adi bunu itiraf eder.
                    "esleme_yontemi": "SAYFA_ICINDE_GECIYOR",
                })
            else:
                kanitsiz.append({"urun": u["slug"], "aile": u.get("family_slug"),
                                 "alan": alan, "deger": metin})

    cd = Path(a.cikti_dizin)
    cd.mkdir(parents=True, exist_ok=True)
    (cd / "kanit-tablosu.jsonl").write_text(
        "".join(json.dumps(k, ensure_ascii=False, sort_keys=True) + chr(10) for k in kanit),
        encoding="utf-8", newline="\n")
    (cd / "kanitsiz.jsonl").write_text(
        "".join(json.dumps(k, ensure_ascii=False, sort_keys=True) + chr(10) for k in kanitsiz),
        encoding="utf-8", newline="\n")

    toplam = len(kanit) + len(kanitsiz)
    print()
    print("== KANIT TABLOSU ==")
    print(f"  aranabilir deger      : {toplam}")
    print(f"  kaynakta BULUNAN      : {len(kanit)}  ({100*len(kanit)//max(toplam,1)}%)")
    print(f"  ⛔ KANITSIZ KALAN      : {len(kanitsiz)}  ← tek yonlu mandal, yalniz kuculur")
    print(f"  aranamaz (sayi/kod yok): {olculemez}  (ayri sinif, kanitsizla karistirilmaz)")
    print()
    print("  NOT: 'bulundu' = deger, dizindeki bir sayfada GECIYOR. O sayfanin bu urun icin")
    print("       DOGRU sayfa oldugunu KANITLAMAZ (esleme_yontemi alani bunu soyler).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
