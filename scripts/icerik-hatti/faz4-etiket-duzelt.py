#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FAZ 4 ADIM 1 — staging CSV'lerinde ETIKET DUZELTME (deger yeniden cekilmez).

Girdi : venthub-pdf-ingestor/staging/teknik-*-2026-09-06.csv  (DOKUNULMAZ, kanit)
Cikti : .../staging/duzeltilmis/teknik-*.csv                  (yuklemeye aday)

⛔SATIR NUMARASI KULLANILMAZ. OPS receti (rec172-faz2-sonuc) satir numaralarini IKI FARKLI
kuralla vermis (ADH/AT veri-satiri indeksi, RDH dosya satiri) — 2026-09-07 07:5xZ'de olculdu;
koru koruna uygulansa DOGRU satirlar silinip YANLISLAR kalirdi. Bu yuzden secim daima
(sku, alan) ikilisiyle yapilir; bagimsiz dogrulama: alan-bazli secim recetenin saydigi
22 ve 8 rakamini birebir uretiyor.

KARARI VERILMEYEN HICBIR SATIRA DOKUNULMAZ — silinmez de, donusturulmez de; RAPORDA
"KARAR BEKLIYOR" diye listelenir ve yuklemeye GIRMEZ.
"""
import csv
import sys
from collections import defaultdict
from pathlib import Path

STAGING = Path(r"C:/Users/alize/venthub-pdf-ingestor/staging")
CIKTI = STAGING / "duzeltilmis"

# ---- Recep kararlari (2026-09-07 07:3xZ, K9/K10/K11) --------------------------------
# K9 : kayis tahrikli govdede "izinli motor anma gucu" AYRI ALAN (statige/emilene sikistirilmaz)
K9_ALAN = "permissible_motor_power_w"
K9_DOSYA = {"teknik-nicotra-gebhardt-adh-2026-09-06.csv",
            "teknik-nicotra-gebhardt-at-2026-09-06.csv",
            "teknik-nicotra-gebhardt-rdh-2026-09-06.csv"}
# K10: Nicotra egrisi TOPLAM basinctir; statige CEVRILMEZ, ayri alan
K10_ALAN = "max_total_pressure_pa"
K10_DOSYA = {"teknik-nicotra-gebhardt-adh-2026-09-06.csv"}
# K11: ATEX kodu teknik tabloda KALIR (aciklama cumlesi ayri is) -> CSV degisikligi YOK

# SEAT 50: dayanaksiz wiring + min_/max_ semantik ihlali (12) = 15 satir CIKAR
SEAT_CIKAR_SKU = {"SEA-51501000", "SEA-51502000", "SEA-51502003"}
SEAT_CIKAR_ALAN = {"wiring", "max_delivery_m3h", "min_delivery_m3h",
                   "max_static_pressure_pa", "min_static_pressure_pa"}
# STORM: 230/400 cift gerilim min_/max_'a sikistirilamaz -> tek voltage_v=400 + not
STORM_NOT = ("230/400 V cift gerilim: 400 V yildiz baglanti degeri. "
             "230 V delta secenegi wiring alaninda anlatilir.")


def oku(yol: Path):
    with open(yol, encoding="utf-8", newline="") as fh:
        r = csv.DictReader(fh)
        return list(r), r.fieldnames


def duzelt(dosya: Path):
    satirlar, basliklar = oku(dosya)
    ad = dosya.name
    rapor = defaultdict(int)
    bekleyen = []
    cikti = []

    # STORM mukerrer: AYNI DEGER olanlar tekillestirilir; CELISEN olanlar KARAR bekler
    sayac = defaultdict(list)
    for s in satirlar:
        sayac[(s["sku"], s["alan"])].append(s["deger"])
    celisen = {k for k, v in sayac.items() if len(v) > 1 and len(set(v)) > 1}
    gorulen = set()

    for s in satirlar:
        anahtar = (s["sku"], s["alan"])

        # --- karar bekleyenler: DOKUNMA, yuklemeye ALMA
        if anahtar in celisen:
            bekleyen.append((s["sku"], s["alan"], s["deger"], "ayni anahtara CELISEN iki deger"))
            rapor["karar_bekliyor"] += 1
            continue
        # IP20 supbesi YALNIZ STORM'da yasiyor. DD'nin 9 IP20 satirini kendi FAZ 2 incelemem
        # CURUTTU (2026-09-07, s.47 satir 85-86: M955 sutununun STANDART degeri, komsu M939=IP44);
        # Danfoss IP20'si recetede hic sorgulanmadi. Genis bir "tum IP20" kurali kendi olcumumu
        # geri alirdi — kapsam dosyaya BAGLANIR.
        if ad.startswith("teknik-storm") and s["alan"] == "ip_rating" and s["deger"] == "IP20":
            bekleyen.append((s["sku"], s["alan"], s["deger"],
                             "IP20 dayanagi tartismali; recete TEK satir dedi, olcumde IKI satir cikti"))
            rapor["karar_bekliyor"] += 1
            continue
        # AT ailesinde agirlik: DB adi "AT 7/7" surum harfi tasimiyor, siparis kodu PDF'in
        # TAMAMINDA 0 kez geciyor; belirsizlik iki surume indi (S / SC) ve aralarinda agirlik
        # %20-26 sapiyor. %26 sapan bir agirlik vitrine yazilamaz -> KARAR bekler.
        if ad.startswith("teknik-nicotra-gebhardt-at") and s["alan"] == "weight_kg":
            bekleyen.append((s["sku"], s["alan"], s["deger"],
                             "AT surum belirsiz (S/SC); iki surum arasi agirlik %20-26 sapiyor"))
            rapor["karar_bekliyor"] += 1
            continue
        # K11 ("ATEX kodu teknik tabloda + cumle aciklamada") BICIM sorusunu cozer ama degerin
        # KOD oldugunu varsayar. JET'in 7 satiri kod DEGIL, kurulum BOLGESI beyani
        # ("Zone II, Category 3G"). Canlida atex_marking = 14 Vortice urununde ekipman-grubu
        # isaretlemesi ("II 2G/D h T3/125C X Gb/Db") — olculdu 2026-09-07. Ikisi de "II" ile
        # basliyor ama biri GRUP, digeri BOLGE; ayni alana konursa alan iki anlam tasir ve
        # uzerindeki her karsilastirma sessizce anlamsizlasir. KARAR bekler (ayri anahtar mi,
        # yoksa yalniz aciklama cumlesi mi).
        if s["alan"] == "atex_marking" and s["deger"].strip().lower().startswith("zone"):
            bekleyen.append((s["sku"], s["alan"], s["deger"],
                             "BOLGE beyani; canlidaki atex_marking ekipman-grubu KODU (14 Vortice) — ayni alanda iki anlam"))
            rapor["karar_bekliyor"] += 1
            continue
        if s["alan"] in ("frequency_hz",):
            bekleyen.append((s["sku"], s["alan"], s["deger"], "50/60 Hz -> min_/max_ alan karari yok"))
            rapor["karar_bekliyor"] += 1
            continue

        # --- SEAT 50 cikarma
        if ad.startswith("teknik-seat") and s["sku"] in SEAT_CIKAR_SKU and s["alan"] in SEAT_CIKAR_ALAN:
            rapor["seat50_cikarildi"] += 1
            continue

        # --- K9 / K10 etiket tasima
        if ad in K9_DOSYA and s["alan"] == "max_absorbed_power_w":
            s["alan"] = K9_ALAN
            s["not"] = (s["not"] + " | " if s["not"] else "") + \
                "K9 (Recep 2026-09-07): kayis tahrikli govdede izinli motor anma gucu tavani; emilen guc DEGIL."
            rapor["k9_tasindi"] += 1
        elif ad in K10_DOSYA and s["alan"] == "max_static_pressure_pa":
            s["alan"] = K10_ALAN
            s["not"] = (s["not"] + " | " if s["not"] else "") + \
                "K10 (Recep 2026-09-07): kaynak egrisi TOPLAM basinc (p_F); statige cevrilmedi."
            rapor["k10_tasindi"] += 1

        # --- STORM cift gerilim: min_ at, max_ -> voltage_v
        # Cetvel §11 "Gerilim: bir alan bir bilgi" bu vakanin cevabini ZATEN veriyor:
        # voltage_v = calisma gerilimi (tek sayi) · voltage_alt_v = varsa ikinci gerilim.
        # Ilk yazimda 230 V'u ATMISTIM; cetvel onu voltage_alt_v'ye koyuyor -> 12 deger
        # cope gitmiyor. (Kendi kusurum, 2026-09-07 08:1xZ'de cetvel okunarak yakalandi.)
        elif ad.startswith("teknik-storm") and s["alan"] in ("min_voltage_v", "max_voltage_v"):
            s["alan"] = "voltage_alt_v" if s["alan"] == "min_voltage_v" else "voltage_v"
            s["not"] = (s["not"] + " | " if s["not"] else "") + STORM_NOT
            rapor["storm_gerilim_ayristirildi"] += 1

        # --- ADH not duzeltmesi: sf.40 -> sf.41
        if "sf.40" in s["not"]:
            s["not"] = s["not"].replace("sf.40", "sf.41")
            rapor["adh_not_duzeltildi"] += 1

        # --- mukerrer (AYNI DEGER) tekillestirme
        if anahtar in gorulen:
            rapor["mukerrer_tekillestirildi"] += 1
            continue
        gorulen.add(anahtar)
        cikti.append(s)

    return cikti, basliklar, rapor, bekleyen


def main():
    if not STAGING.exists():
        raise SystemExit(f"⛔ staging yok: {STAGING}")
    dosyalar = sorted(p for p in STAGING.glob("teknik-*-2026-09-06.csv")
                      if ".dogrulama." not in p.name)
    if not dosyalar:
        raise SystemExit(f"⛔ EVREN BOS: {STAGING} altinda teknik-*.csv bulunamadi")
    if len(dosyalar) != 8:
        raise SystemExit(f"⛔ EVREN BEKLENENDEN FARKLI: {len(dosyalar)} dosya, 8 bekleniyordu "
                         f"— dar/yanlis dizinle uretilen rapor sessizce dogru gorunur")
    CIKTI.mkdir(exist_ok=True)
    top_giren = top_cikan = 0
    tum_bekleyen = []
    print(f"{'dosya':<46}{'giren':>7}{'cikan':>7}  degisiklikler")
    for d in dosyalar:
        cikti, basliklar, rapor, bekleyen = duzelt(d)
        giren = sum(1 for _ in open(d, encoding="utf-8")) - 1
        hedef = CIKTI / d.name.replace("-2026-09-06.csv", "-duzeltilmis.csv")
        with open(hedef, "w", encoding="utf-8", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=basliklar)
            w.writeheader()
            w.writerows(cikti)
        top_giren += giren
        top_cikan += len(cikti)
        tum_bekleyen += [(d.name, *b) for b in bekleyen]
        ozet = " ".join(f"{k}={v}" for k, v in sorted(rapor.items())) or "-"
        print(f"{d.name:<46}{giren:>7}{len(cikti):>7}  {ozet}")

    print(f"\nTOPLAM: giren {top_giren} -> cikan {top_cikan} "
          f"(fark {top_giren - top_cikan}: cikarilan + karar bekleyen + mukerrer)")
    print(f"\nKARAR BEKLEYEN {len(tum_bekleyen)} SATIR (yuklemeye GIRMEZ):")
    for dosya, sku, alan, deger, sebep in tum_bekleyen:
        print(f"  {sku:<14} {alan:<24} {deger:<8} {sebep}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
