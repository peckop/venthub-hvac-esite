#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FAZ 4 ADIM 2 — duzeltilmis staging CSV'lerini products.technical_specs'e YUKLEYICI.

VARSAYILAN: KURU KOSUM (hicbir sey yazilmaz). Canliya yazim icin `--yaz` VE ortam
degiskeni CANLI_YAZIM_ONAYI=<Recep'in verdigi damga> gerekir — ikisi birden.
⛔Recep'in KENDI sozu olmadan yazilmaz; akran aktarimi onay degildir.

KAPILAR (hepsi fail-closed):
1. EVREN — duzeltilmis/ altinda 8 dosya olmali (dar dizin = sessiz eksik yukleme).
2. VERI  — canli okuma `_veri.tumunu_cek` ile: kesin sayi + sirali sayfalama + karsilastirma
           (PostgREST 1000 satirda SESSIZCE keser).
3. ESLESME — CSV'deki her sku canlida bulunmali; bulunamayan varsa YAZIM YAPILMAZ.
4. IDEMPOTENT — ayni deger zaten yaziliysa hucre DEGISMEZ sayilir; ikinci kosum 0 degisiklik.

Cikti: hangi SKU · hangi anahtar · eski -> yeni. Rapor Recep'e gider.
"""
import argparse
import csv
import json
import os
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _veri  # noqa: E402

DUZELTILMIS = Path(r"C:/Users/alize/venthub-pdf-ingestor/staging/duzeltilmis")
BEKLENEN_DOSYA = 8


def csv_oku() -> tuple[dict, int]:
    if not DUZELTILMIS.exists():
        raise SystemExit(f"⛔ EVREN YOK: {DUZELTILMIS} — once faz4-etiket-duzelt.py kos")
    dosyalar = sorted(DUZELTILMIS.glob("teknik-*-duzeltilmis.csv"))
    if len(dosyalar) != BEKLENEN_DOSYA:
        raise SystemExit(f"⛔ EVREN EKSIK: {len(dosyalar)} dosya, {BEKLENEN_DOSYA} bekleniyordu "
                         f"— dar dizinle uretilen yukleme SESSIZCE eksik yazar")
    veri, satir = defaultdict(dict), 0
    for d in dosyalar:
        with open(d, encoding="utf-8", newline="") as fh:
            for s in csv.DictReader(fh):
                deger = s["deger"].strip()
                try:
                    deger = int(deger) if deger.lstrip("-").isdigit() else float(deger.replace(",", "."))
                except ValueError:
                    pass  # metin deger (ip_rating, wiring, atex_marking...) oldugu gibi kalir
                veri[s["sku"]][s["alan"]] = deger
                satir += 1
    return veri, satir


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true", help="CANLIYA YAZ (ayrica CANLI_YAZIM_ONAYI gerekir)")
    a = ap.parse_args()

    veri, satir = csv_oku()
    print(f"CSV: {len(veri)} SKU · {satir} deger (evren kapisi: {BEKLENEN_DOSYA}/{BEKLENEN_DOSYA} dosya)")

    U, h = _veri.baglan()
    urunler = _veri.tumunu_cek(U, h, "products?select=id,sku,technical_specs", "products")
    canli = {u["sku"]: u for u in urunler}
    print(f"CANLI: {len(urunler)} urun (kesin sayi ile dogrulandi)")

    eksik = sorted(set(veri) - set(canli))
    if eksik:
        raise SystemExit(f"⛔ ESLESMEYEN {len(eksik)} SKU canlida YOK — yazim yapilmadi: {eksik[:8]}")

    degisiklik, dokunulan, ayni = [], {}, 0
    for sku, alanlar in veri.items():
        mevcut = canli[sku].get("technical_specs") or {}
        yeni = dict(mevcut)
        for k, v in alanlar.items():
            if mevcut.get(k) == v:
                ayni += 1
                continue
            degisiklik.append((sku, k, mevcut.get(k, "—"), v))
            yeni[k] = v
        if yeni != mevcut:
            dokunulan[sku] = (canli[sku]["id"], yeni)

    print(f"\nKURU KOSUM RAPORU")
    print(f"  degisecek hucre : {len(degisiklik)}")
    print(f"  degisecek urun  : {len(dokunulan)}")
    print(f"  zaten ayni      : {ayni}  (idempotent: ikinci kosumda hepsi buraya duser)")
    print(f"\n  SKU            anahtar                       eski -> yeni")
    for sku, k, e, y in degisiklik[:40]:
        print(f"  {sku:<14} {k:<28} {str(e):<12} -> {y}")
    if len(degisiklik) > 40:
        print(f"  ... {len(degisiklik) - 40} satir daha (tam liste: --yaz oncesi dosyaya alinir)")

    if not a.yaz:
        print("\nKURU KOSUM — hicbir sey yazilmadi. Canliya yazim icin: --yaz + CANLI_YAZIM_ONAYI")
        return 0

    onay = os.environ.get("CANLI_YAZIM_ONAYI")
    if not onay:
        raise SystemExit("⛔ CANLI YAZIM REDDEDILDI: CANLI_YAZIM_ONAYI yok. "
                         "Recep'in KENDI sozu gerekir; akran aktarimi onay degildir.")
    print(f"\nCANLIYA YAZILIYOR (onay damgasi: {onay}) — {len(dokunulan)} urun")
    yazilan = 0
    for sku, (uid, yeni) in dokunulan.items():
        gvd = json.dumps({"technical_specs": yeni}).encode("utf-8")
        istek = urllib.request.Request(
            f"{U}/rest/v1/products?id=eq.{uid}", data=gvd, method="PATCH",
            headers={**h, "Content-Type": "application/json", "Prefer": "return=minimal"})
        with urllib.request.urlopen(istek) as c:
            if c.status not in (200, 204):
                raise SystemExit(f"⛔ YAZIM HATASI {sku}: HTTP {c.status} — durduruldu ({yazilan} yazilmisti)")
        yazilan += 1
    print(f"✓ {yazilan} urun guncellendi")
    return 0


if __name__ == "__main__":
    _veri.utf8_akis()
    sys.exit(main())
