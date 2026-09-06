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
HARITA_VARSAYILAN = Path(__file__).resolve().parent / "aile-kaynak-haritasi.json"


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
            sayfalar.append({"dosya": k["dosya"], "taban": os.path.basename(k["dosya"]),
                             "sayfa": k["sayfa"], "pdf_hash": k["pdf_hash"],
                             "n": norm(metin)})
    return sayfalar


# Aranabilir deger mi: sayi ya da kod tasimayan metin (ör. "Evet", "Beyaz") kaynakta
# aranamaz — bunlar AYRI sinifta sayilir, "kanitsiz" ile karistirilmaz.
ARANABILIR = re.compile(r"[0-9]|IP\s?[0-9X]|ATEX|EC|IE[3-5]", re.I)

# --- BIRIM DONUSUMU (artim 2) --------------------------------------------------
# NICIN: DB bazi degerleri TUREV birimde tutuyor; katalog baska birimde basiyor.
# Olculdu 2026-09-06: 123 kanitsiz max_delivery_ls degerinin 108'i l/s -> m3/h ile
# KAPANDI. Ornek: 719.44 l/s tuhaf bir sayidir cunku tam olarak 2590 m3/h / 3.6 —
# ve 2590 AVenS s.34'te duruyor. Bu rastlanti degil, birim farki.
#
# ⭐KURAL: donusum KANITSIZI KAPATIR, GIZLEMEZ. Donusumle bulunan satirin
# esleme_yontemi'i AYRIDIR (BIRIM_DONUSUMUYLE_SAYFA_ICINDE) ve hangi donusumun
# uygulandigi satirda yazar. Dogrudan eslesme ile ayni kefeye KONMAZ.
BIRIM_DONUSUMLERI = [
    # (alan deseni, aciklama, carpan, HEDEF BIRIM)
    (re.compile(r"_ls$"), "l/s -> m3/h", 3.6, "m³/h"),
    (re.compile(r"_w$"), "W -> kW", 0.001, "kW"),
    (re.compile(r"_kw$"), "kW -> W", 1000.0, "W"),
    (re.compile(r"_m3h$"), "m3/h -> l/s", 1.0 / 3.6, "l/s"),
]


def donusum_adaylari(alan: str, deger: str):
    """(gosterim, aciklama) uretir. Sayiya cevrilemeyen deger sessizce atlanir."""
    try:
        v = float(str(deger).replace(",", "."))
    except ValueError:
        return
    for desen, aciklama, carpan, birim in BIRIM_DONUSUMLERI:
        if not desen.search(alan):
            continue
        y = v * carpan
        if y <= 0:
            continue
        # ⭐YUVARLAMA TOLERANSI — olcumle eklendi: DB degeri ZATEN yuvarlidir.
        # 719.44 l/s x 3.6 = 2589.984; katalogda yazan 2590. Fark (%0.0006) degerin
        # kendi yuvarlanmasindan gelir, baska bir sayi degildir. Tolerans BAGIL ve
        # dardir (%0.1); genis tolerans komsu model degerini yakalar ve kanit uydurur.
        gosterimler = {f"{y:.3f}".rstrip("0").rstrip(".")}
        for basamak in (0, 1):
            yuv = round(y, basamak)
            if abs(y - yuv) <= 0.001 * abs(y):
                gosterimler.add(str(int(yuv)) if basamak == 0
                                else f"{yuv:.1f}".rstrip("0").rstrip("."))
        # ⭐ASGARI BELIRGINLIK — olcumle eklendi: donusum kisa gosterim uretirse arama
        # ANLAMSIZ olur. 11000 W -> "11" 46 sayfada "bulunuyor"; 11 her katalogda gecer.
        # Ilk surumde 180 donusumun 37'si boyleydi. Kural: donusumlu esleme icin
        # gosterim EN AZ 3 BASAMAK tasimali (2590 gecerli, 7.5 ve 11 gecersiz).
        # Dogrudan eslesmeye bu kural uygulanmaz — orada deger DB'nin kendi yazimidir.
        for g in gosterimler:
            if sum(c.isdigit() for c in g) >= 3:
                yield g, aciklama, birim


def main() -> int:
    ap = argparse.ArgumentParser(description="Kanit tablosu + kanitsiz mandal (REC-163)")
    ap.add_argument("--dizin", default=str(DIZIN_VARSAYILAN))
    ap.add_argument("--veri", required=True, help="products JSON (slug, family_slug, technical_specs)")
    ap.add_argument("--cikti-dizin", default=".")
    ap.add_argument("--aile-harita", default=str(HARITA_VARSAYILAN),
                    help="aile_slug -> kendi kaynak PDF'leri (aile-kaynak-cikar.py uretir)")
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

    # --- AILE -> KENDI KAYNAKLARI (artim 1) -------------------------------
    harita_yol = Path(a.aile_harita)
    if not harita_yol.exists():
        print(f"⛔ aile-kaynak haritasi YOK: {harita_yol}")
        print("   Once: python scripts/icerik-hatti/aile-kaynak-cikar.py ...")
        return 2
    harita = json.loads(harita_yol.read_text(encoding="utf-8"))
    # ⭐TAKMA AD COZUMU — bu adim OLCUMLE eklendi (2026-09-06):
    # Dizin, bayt-ayni PDF'leri tek kayda indirger ve otekini manifest'te takma ad olarak
    # tutar. Taban ada gore filtre takma adlara KORDUR: MONO ailesinin 101 degeri
    # "kendi kaynaginda yok" sayilmisti — oysa ayni PDF baska adla dizinde DURUYOR.
    takma = {}
    manifest_yol = dizin_yol.parent / "manifest.json"
    if manifest_yol.exists():
        for kanonik, adlar in (json.loads(
                manifest_yol.read_text(encoding="utf-8")).get("takma_adlar") or {}).items():
            for ad in adlar:
                takma[os.path.basename(ad)] = os.path.basename(kanonik)
    dizindeki_tabanlar = {s["taban"] for s in sayfalar}
    istenen = {takma.get(t, t) for v in harita.values() for t in v}
    dizinde_olmayan = sorted(istenen - dizindeki_tabanlar)
    # Sayfa kumelerini aile basina ONCEDEN kur (urun basina taramak O(n*m) olurdu).
    aile_sayfalari = {}
    for aile, pdfler in harita.items():
        kume = {takma.get(t, t) for t in pdfler}
        aile_sayfalari[aile] = [s for s in sayfalar if s["taban"] in kume]

    kanit, kanitsiz, yabanci = [], [], []
    olculemez = 0
    kapsamsiz_aile = set()
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
            aile = u.get("family_slug")
            evren = aile_sayfalari.get(aile)
            if evren is None:
                # Haritasiz aile: DARALTILMADI. Satir bunu SOYLER; sessizce dar sayilmaz.
                kapsamsiz_aile.add(aile)
                evren = sayfalar
                kapsam = "TUM_DIZIN"
            else:
                kapsam = "AILENIN_KENDI_KAYNAGI"

            ortak = {"urun": u["slug"], "aile": aile, "tenant_id": u.get("tenant_id"),
                     "alan": alan, "deger": metin}
            bulunanlar = [s for s in evren if hedef in s["n"]]
            if bulunanlar:
                ilk = bulunanlar[0]
                kanit.append({
                    **ortak, "pdf_hash": ilk["pdf_hash"], "dosya": ilk["dosya"],
                    "sayfa": ilk["sayfa"], "aday_sayfa_sayisi": len(bulunanlar),
                    "kapsam": kapsam,
                    # ⚠ GECMEK DOGRULUK DEGILDIR — alan adi bunu itiraf eder.
                    "esleme_yontemi": "SAYFA_ICINDE_GECIYOR",
                })
            else:
                # ⭐ARTIM 2: dogrudan bulunamadi — BIRIM DONUSUMU ile kendi kaynaginda
                # kapaniyor mu? Kapaniyorsa KANITTIR ama esleme_yontemi AYRIDIR.
                donusen = None
                for gosterim, aciklama, birim in donusum_adaylari(alan, metin):
                    # ⭐BIRIMLE BITISIK ARANIR — ciplak sayi degil.
                    # Iki yonlu sinav (2026-09-06): l/s -> m3/h donusumu
                    #   ciplak sayi ile : dogru katsayi 105, YANLIS katsayilar 41-56  (AYIRT ETMIYOR)
                    #   birimle bitisik : dogru katsayi  91, YANLIS katsayilar   0-1  (AYIRT EDIYOR)
                    # Ciplak arama sayfadaki yuzlerce sayidan birine carpip kanit uyduruyordu.
                    h2 = norm(gosterim + birim)
                    ad = [s for s in evren if h2 in s["n"]]
                    if ad:
                        donusen = (ad, gosterim, aciklama, birim)
                        break
                if donusen:
                    ad, gosterim, aciklama, birim = donusen
                    ilk = ad[0]
                    kanit.append({
                        **ortak, "pdf_hash": ilk["pdf_hash"], "dosya": ilk["dosya"],
                        "sayfa": ilk["sayfa"], "aday_sayfa_sayisi": len(ad),
                        "kapsam": kapsam, "donusum": aciklama, "aranan_gosterim": gosterim + " " + birim,
                        "esleme_yontemi": "BIRIM_DONUSUMUYLE_BIRIME_BITISIK",
                    })
                    continue

                # Kendi kaynaginda YOK ama BASKA bir katalogda geciyor mu? Bu ucuncu bir
                # siniftir: v1'de bu satirlar KANIT sayiliyordu (baska markanin sayfasinda
                # ayni sayi gectigi icin). Rastlanti kanit degildir — ayri sayilir.
                if kapsam == "AILENIN_KENDI_KAYNAGI":
                    disarida = [s for s in sayfalar if hedef in s["n"]]
                    if disarida:
                        yabanci.append({**ortak, "yabanci_dosya": disarida[0]["dosya"],
                                        "yabanci_sayfa": disarida[0]["sayfa"],
                                        "yabanci_aday_sayisi": len(disarida)})
                        continue
                kanitsiz.append(ortak)

    cd = Path(a.cikti_dizin)
    cd.mkdir(parents=True, exist_ok=True)
    (cd / "kanit-tablosu.jsonl").write_text(
        "".join(json.dumps(k, ensure_ascii=False, sort_keys=True) + chr(10) for k in kanit),
        encoding="utf-8", newline="\n")
    (cd / "kanitsiz.jsonl").write_text(
        "".join(json.dumps(k, ensure_ascii=False, sort_keys=True) + chr(10) for k in kanitsiz),
        encoding="utf-8", newline="\n")

    (cd / "yabanci-kaynak.jsonl").write_text(
        "".join(json.dumps(k, ensure_ascii=False, sort_keys=True) + chr(10) for k in yabanci),
        encoding="utf-8", newline="\n")
    toplam = len(kanit) + len(kanitsiz) + len(yabanci)
    tek_aday = sum(1 for k in kanit if k["aday_sayfa_sayisi"] == 1)
    dar = sum(1 for k in kanit if k["kapsam"] == "AILENIN_KENDI_KAYNAGI")
    dogrudan = sum(1 for k in kanit if k["esleme_yontemi"] == "SAYFA_ICINDE_GECIYOR")
    donusumlu = len(kanit) - dogrudan
    print()
    print("== KANIT TABLOSU (v3 — aileye daraltilmis + birim donusumu) ==")
    print(f"  aranabilir deger        : {toplam}")
    print(f"  KENDI kaynaginda BULUNAN: {len(kanit)}  ({100*len(kanit)//max(toplam,1)}%)")
    print(f"    - bunun TEK ADAYLI    : {tek_aday}  ({100*tek_aday//max(len(kanit),1)}%)  <- tek sayfa gosterebildigimiz kisim")
    print(f"    - daraltma uygulanan  : {dar}/{len(kanit)}")
    print(f"    - DOGRUDAN eslesen    : {dogrudan}")
    print(f"    - BIRIM DONUSUMUYLE   : {donusumlu}  (ayri esleme_yontemi — gizlenmedi)")
    print(f"  ⚠ YABANCI kaynakta gecen: {len(yabanci)}  <- v1'de KANIT sayiliyordu; rastlanti kanit degildir")
    print(f"  ⛔ KANITSIZ KALAN        : {len(kanitsiz)}  <- tek yonlu mandal, yalniz kuculur")
    print(f"  aranamaz (sayi/kod yok) : {olculemez}  (ayri sinif, kanitsizla karistirilmaz)")
    if kapsamsiz_aile:
        print(f"  ⚠ HARITASIZ aile        : {len(kapsamsiz_aile)} — {sorted(kapsamsiz_aile)[:5]}")
    if dizinde_olmayan:
        print(f"  ⚠ haritada olup DIZINDE OLMAYAN kaynak: {len(dizinde_olmayan)}")
        for d in dizinde_olmayan:
            print(f"      - {d}   (o aileler kaynaksiz olculuyor)")
    print()
    print("  NOT: 'bulundu' = deger, ailenin KENDI kaynak PDF'inde GECIYOR. Tek adayli")
    print("       degilse hangi sayfa oldugunu hala GOSTEREMEYIZ (esleme_yontemi soyler).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
