# -*- coding: utf-8 -*-
"""scripts/icerik-hatti/taslak-kaynak-kapisi.py — İÇERİK TASLAĞI KAYNAK DOĞRULAMA KAPISI

NİÇİN VAR: REC-146 taslakları alt-ajan dalgalarıyla üretilecek. Alt-ajanın tek gerçek riski
UYDURMA'dır: metin doğru görünür, kaynağı yoktur. Bu kapı o riski ÖLÇÜLEBİLİR kılar.

ÖLÇÜT (ve niçin işe yarıyor): taslaktaki her cümle `[KAYNAK s.NN]` ile bir PDF sayfasına
bağlıdır. Metin Türkçe, kaynak çoğu zaman İngilizcedir — yani KELİMELER eşleşmez. Ama
SAYILAR ve KODLAR dile bağlı değildir: `IP55`, `400 °C`, `150 mm`, `%90`, `EC`, `ATEX`,
`EN 12101-3`. Bir cümle "IP55" diyorsa, referans verdiği sayfada "IP55" GEÇMELİDİR.
Geçmiyorsa ya referans yanlıştır ya bilgi uydurulmuştur — ikisi de KIRMIZI.

DÜRÜST SINIR (kapının göremediği): sayı/kod taşımayan cümleler (ör. "galvaniz çelik sac yapı")
bu ölçütle DOĞRULANAMAZ. Kapı onları "ölçülemedi" diye sayar ve bunu RAPORLAR — sessizce
"geçti" demez. Kapsama oranı çıktıda görünür; oran düşükse kapı zayıftır, bunu bilerek okuyun.
    → var-olmayan-kapi-pending-gorunmez · agrega-sayi-ters-gideni-gizler

KULLANIM:
    python scripts/icerik-hatti/taslak-kaynak-kapisi.py docs/audits/icerik-hatti-taslak-*.md
    python scripts/icerik-hatti/taslak-kaynak-kapisi.py <dosya> --ayrinti   # her cümleyi bas

ÇIKIŞ KODU: 0 = kapı YEŞİL · 1 = KIRMIZI (en az bir doğrulanabilir cümle düştü) · 2 = önkoşul
CI'DA KOŞMAZ: PyMuPDF ve yerel PDF deposu gerekir; bu YEREL bir kapıdır, şerit sahibi koşar.
"""
import re
import sys
import unicodedata
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ONKOSUL-HATASI: PyMuPDF yok. 'pip install pymupdf' ile kurun.")
    sys.exit(2)

KOK = Path("C:/Users/alize/venthub-pdf-ingestor/venthub")

# Kısaltma -> PDF dosya adı. Taslak kendi haritasını şu yorumla verebilir (öncelikli):
#   <!-- KAYNAK-HARITASI: HSK=heat-master-slimroof-cati-fanlari-yeni.pdf, VLK=LINEO_QUITE_KATALOG.pdf -->
VARSAYILAN_HARITA = {
    "AVenS": "avens_fiyat_listesi_2026_HQ.pdf",
    "VLK": "LINEO_QUITE_KATALOG.pdf",
    "HSK": "heat-master-slimroof-cati-fanlari-yeni.pdf",
    "VMC": "vortice-brochure-radon-en.pdf",
    "MONO": "vortice_vort_mono_range_new.pdf",
}

# IKI REFERANS BICIMI TANINIR:
#   [KAYNAK s.NN]  -> cok kaynakli taslak (kaynak adi acik)
#   [s.NN]         -> tek kaynakli taslak; kaynak, VARSAYILAN-KAYNAK yorumundan ya da
#                     haritada tek giris varsa ondan alinir.
# NICIN: ilk surum yalniz birinciyi taniyordu ve SEAT taslagini SESSIZCE atladi — kapsama
# %0 ciktigi halde "YESIL" yazdi. Sessiz atlama, kapinin en tehlikeli hatasidir:
# "bakmadim" ile "temiz" ayni gorunur. → var-olmayan-kapi-pending-gorunmez
REF = re.compile(r"\[(?:([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+)?s\.\s*([0-9]+(?:\s*[,–-]\s*[0-9]+)*)\]")

# Doğrulanabilir jetonlar — dile bağlı OLMAYAN işaretler:
JETON_DESENLERI = [
    re.compile(r"\bIP\s?[0-9X][0-9]\b", re.I),                 # IP55, IPX5
    re.compile(r"\bEN\s?[0-9]{3,5}(?:-[0-9]+)?\b"),            # EN 12101-3, EN 60335
    # ⚠ ONDALIK AYIRICI SAYININ PARCASIDIR. Ilk surum `0,18 kW` icinden `18 kW` cikariyordu
    # ve kaynakta "0,18 kW" yazdigi halde "sayfada YOK: 18 kW" diye YANLIS KIRMIZI veriyordu.
    # Yanlis kirmizi de en az yanlis yesil kadar zararlidir: kapiya guveni bitirir, sonra
    # gercek kirmizilar da "herhalde yine yaniliyor" diye gecistirilir.
    re.compile(r"(?<![0-9.,])[0-9]{1,5}(?:[.,][0-9]{1,3})?\s?(?:mm|m³/h|m3/h|m²|m2|Pa|kW|W|V|Hz|dB|°C|kg)\b", re.I),
    re.compile(r"\b(?:IE[3-5]|ATEX|EC|AC|PWM|MESH|Wi-Fi|G3|F400|HCS|V0)\b"),
    re.compile(r"%\s?[0-9]{1,3}\b"),                            # %90
    re.compile(r"\b[0-9]{2,5}\s?°C\b"),
]


def sayfa_metni_getir(pdf_ad, sayfa, onbellek):
    anahtar = (pdf_ad, sayfa)
    if anahtar in onbellek:
        return onbellek[anahtar]
    yollar = list(KOK.rglob(pdf_ad))
    if not yollar:
        onbellek[anahtar] = None
        return None
    d = fitz.open(yollar[0])
    t = d[sayfa - 1].get_text("text") if 0 < sayfa <= d.page_count else None
    d.close()
    onbellek[anahtar] = t
    return t


def norm(s):
    """Aksan/boşluk farklarını eritir; sayı ve kod karşılaştırması için."""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", "", s).upper().replace("M3/H", "M³/H")


def jetonlari_cikar(cumle):
    bulunan = []
    for rx in JETON_DESENLERI:
        bulunan += [m.group(0) for m in rx.finditer(cumle)]
    # tekille, cok kisa/gurultulu olanlari at
    out, gorulen = [], set()
    for j in bulunan:
        n = norm(j)
        if len(n) >= 2 and n not in gorulen:
            gorulen.add(n)
            out.append(j)
    return out


def taslagi_denetle(yol, ayrinti=False):
    metin = Path(yol).read_text(encoding="utf-8")
    harita = dict(VARSAYILAN_HARITA)
    m = re.search(r"<!--\s*KAYNAK-HARITASI:\s*(.+?)\s*-->", metin)
    if m:
        for parca in m.group(1).split(","):
            if "=" in parca:
                k, v = parca.split("=", 1)
                harita[k.strip()] = v.strip()

    # tek kaynakli taslakta [s.NN] icin varsayilan kaynak
    vk = re.search(r"<!--\s*VARSAYILAN-KAYNAK:\s*([A-Za-z]+)\s*-->", metin)
    varsayilan_kaynak = vk.group(1) if vk else (list(harita)[0] if len(harita) == 1 else None)
    if varsayilan_kaynak is None:
        # taslak metninde hangi kisaltmalar geciyorsa ve TEK ise onu kullan
        gecenler = {m.group(1) for m in REF.finditer(metin) if m.group(1)}
        if len(gecenler) == 1:
            varsayilan_kaynak = gecenler.pop()

    onbellek = {}
    dogrulanan = dusen = olculemeyen = 0
    adsiz_ref = 0
    eksik_pdf = set()
    hatalar = []

    # Referansla BITEN her parcayi bir "iddia" say: metin ... [KAYNAK s.NN]
    for kaynak_ad, sayfalar_ham, once in [
        (mm.group(1), mm.group(2), metin[max(0, mm.start() - 400):mm.start()])
        for mm in REF.finditer(metin)
    ]:
        if not kaynak_ad:
            kaynak_ad = varsayilan_kaynak
            adsiz_ref += 1
            if not kaynak_ad:
                eksik_pdf.add("[s.NN] adsiz referans — VARSAYILAN-KAYNAK yorumu yok")
                continue
        pdf_ad = harita.get(kaynak_ad)
        if not pdf_ad:
            eksik_pdf.add(kaynak_ad)
            continue
        # iddia = referanstan onceki son cumle/madde.
        # ⚠ SON BOS OLMAYAN parca alinir: "…sinifi. [HSK s.5]" gibi NOKTAYLA BITEN bir cumlede
        # bolme sonrasi son parca BOS kalir ve iddia sessizce ATLANIRDI. Kapinin ilk surumu
        # bu yuzden noktayla biten her cumleyi gormuyordu — kasitli sahte iddia sinavi
        # olmasaydi fark edilmezdi. "0 dusen" ile "hic bakmadim" ayni gorunuyordu.
        parcalar = [p.strip() for p in re.split(r"(?<=[.!?])\s+|\n[*\-|>]\s*|\n\n", once) if p.strip()]
        iddia = parcalar[-1] if parcalar else ""
        if not iddia:
            continue
        jetonlar = jetonlari_cikar(iddia)
        if not jetonlar:
            olculemeyen += 1
            if ayrinti:
                print(f"    olculemedi (jeton yok): {iddia[:70]}")
            continue

        sayfalar = [int(x.strip()) for x in sayfalar_ham.split(",")]
        havuz = ""
        for sf in sayfalar:
            t = sayfa_metni_getir(pdf_ad, sf, onbellek)
            if t is None:
                eksik_pdf.add(f"{pdf_ad}:s{sf}")
            else:
                havuz += "\n" + t
        if not havuz:
            olculemeyen += 1
            continue
        havuz_n = norm(havuz)

        # IKI ASAMALI ESLESME — olculmus gerekce (2026-09-06):
        #   1) once TAM jeton aranir ("IP55", "0,18 kW")
        #   2) bulunamazsa, jeton sayi+birim ise YALNIZ SAYI aranir ("0,18")
        # Nicin: PDF tablolarinda birim BASLIK hucresindedir, deger hucresinde yalniz sayi
        # durur — "0,18 kW" metin akisinda BITISIK gecmez. Olctum: s.41'de "0,18" 5 kez var,
        # "kW" 1 kez (baslikta). Ilk surum bu yuzden DOGRU bir cumleye yanlis KIRMIZI verdi.
        # Ayirt edicilik korunur: uydurma sayi ("850", "3200", "48") sayfada HIC gecmez.
        # ⚠ KISA ALFABETIK KODLAR HAM METINDE, KELIME SINIRIYLA ARANIR.
        # Olculmus zaaf (alt-ajan buldu, 2026-09-06): norm() aksani eritiyor, boylece
        # Turkce "aç / AÇ" hecesi "AC" oluyor ve `AC` jetonu YANLIS ESLESIYOR — kapi
        # yanlis POZITIF yesil veriyordu. Uzun jetonlarda (IP55, 400 °C) bu risk yok;
        # yalniz 2-3 harfli kodlarda var, o yuzden ayri yol.
        KISA_KOD = {"AC", "EC", "G3", "V0", "MD", "RF", "ES"}

        def bulundu(j):
            if j.strip().upper() in KISA_KOD:
                return re.search(rf"(?<![A-Za-z0-9]){re.escape(j.strip())}(?![A-Za-z0-9])", havuz) is not None
            if norm(j) in havuz_n:
                return True
            m = re.match(r"^([0-9]{1,5}(?:[.,][0-9]{1,3})?)\s*[A-Za-zÇĞİÖŞÜçğıöşü³²/°%]+$", j.strip())
            return bool(m) and norm(m.group(1)) in havuz_n

        kayip = [j for j in jetonlar if not bulundu(j)]
        if kayip:
            dusen += 1
            hatalar.append((kaynak_ad, sayfalar_ham, kayip, jetonlar, iddia))
        else:
            dogrulanan += 1
            if ayrinti:
                print(f"    OK [{kaynak_ad} s.{sayfalar_ham}] {'·'.join(jetonlar)}")

    return {
        "dosya": Path(yol).name,
        "dogrulanan": dogrulanan,
        "dusen": dusen,
        "olculemeyen": olculemeyen,
        "adsiz_ref": adsiz_ref,
        "ref_toplam": len(REF.findall(metin)),
        # [DB] = kaynagi PDF degil canli veritabani olan iddia. Ajanlar bunu UYDURMAK YERINE
        # kaynagini acikca yazmak icin kullandi (dogru davranis) ama kapi PDF'e bakar, DB'ye
        # bakmaz — yani bu iddialar kapinin KOR NOKTASINDA. Sessiz kalmasin diye sayilir.
        "db_etiketi": len(re.findall(r"\[DB\]", metin)),
        "eksik_pdf": sorted(eksik_pdf),
        "hatalar": hatalar,
    }


def main():
    argv = [a for a in sys.argv[1:] if not a.startswith("--")]
    ayrinti = "--ayrinti" in sys.argv
    if not argv:
        print(__doc__)
        sys.exit(2)

    dosyalar = []
    for a in argv:
        p = Path(a)
        dosyalar += sorted(Path(".").glob(a)) if any(c in a for c in "*?") else [p]

    toplam_dusen = 0
    print("== TASLAK KAYNAK KAPISI ==")
    print("olcut: cumledeki sayi/kod jetonlari (IP55, 400 °C, 150 mm, EC, %90) referans")
    print("       verilen PDF sayfasinda GECIYOR mu. Gecmiyorsa referans yanlis ya da uydurma.\n")
    for f in dosyalar:
        if not f.exists():
            print(f"  ⚠ dosya yok: {f}")
            continue
        r = taslagi_denetle(f, ayrinti)
        toplam = r["dogrulanan"] + r["dusen"]
        kapsama = (100 * toplam / (toplam + r["olculemeyen"])) if (toplam + r["olculemeyen"]) else 0
        # SESSIZ ATLAMA KIRMIZIDIR: hic referans yoksa ya da hicbiri olculemediyse,
        # "temiz" ile "bakmadim" ayni gorunur — bu kapinin en tehlikeli hatasidir.
        hic_ref = r["ref_toplam"] == 0
        hic_olcum = toplam == 0
        durum = "KIRMIZI" if (r["dusen"] or hic_ref or hic_olcum) else "YESIL"
        print(f"  [{durum}] {r['dosya']}")
        print(f"      dogrulanan {r['dogrulanan']} · DUSEN {r['dusen']} · "
              f"olculemeyen {r['olculemeyen']} (jeton tasimayan cumle) · kapsama %{kapsama:.0f}"
              f" · referans {r['ref_toplam']}" + (f" ({r['adsiz_ref']} adsiz)" if r["adsiz_ref"] else ""))
        if hic_ref:
            print("      ⛔ HIC REFERANS YOK — taslak kaynaga baglanmamis ya da bicim taninmadi.")
            toplam_dusen += 1
        elif hic_olcum:
            print("      ⛔ HIC IDDIA OLCULEMEDI — jeton tasiyan tek cumle yok; kapi bu dosyada KOR.")
            toplam_dusen += 1
        if r["db_etiketi"]:
            print(f"      ⓘ [DB] etiketli {r['db_etiketi']} iddia — KAPI BUNLARI OLCMEZ.")
            print("         (kaynak PDF degil, canli DB. Dogrulamasi SQL ile ELLE yapilir;")
            print("          sessiz gecmesin diye burada sayiliyor.)")
        if r["eksik_pdf"]:
            print(f"      ⚠ kaynak bulunamadi: {', '.join(r['eksik_pdf'][:5])}")
        for kaynak, sf, kayip, hepsi, iddia in r["hatalar"]:
            print(f"      ⛔ [{kaynak} s.{sf}] sayfada YOK: {', '.join(kayip)}")
            print(f"         iddia: {iddia[:110]}")
        toplam_dusen += r["dusen"]
        print()

    if toplam_dusen:
        print(f"SONUC: KIRMIZI — {toplam_dusen} iddia kaynagiyla dogrulanamadi.")
        print("Her biri ya YANLIS REFERANS ya UYDURMA. Ikisi de duzeltilmeden yayimlanmaz.")
        sys.exit(1)
    print("SONUC: YESIL — jeton tasiyan her iddia, referans verdigi sayfada dogrulandi.")
    print("NOT: jeton tasimayan cumleler bu kapiyla OLCULEMEZ; kapsama orani yukarida.")
    sys.exit(0)


if __name__ == "__main__":
    main()
