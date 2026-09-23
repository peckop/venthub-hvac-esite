# -*- coding: utf-8 -*-
"""scripts/icerik-hatti/en-jeton-kapisi.py — TR ↔ EN JETON EŞİTLİĞİ KAPISI (REC-146, karar 70)

NİÇİN VAR: EN aile metni, onaylı TR metnin SADIK çevirisidir (plan rec146-karar70 §YÖNTEM,
EN metin kuralı). Çeviriyi alt-ajan yazar, başka bir ajan çürütür — ama ajanın sözü kapı
değildir. Bu kapı dilden bağımsız işaretleri (sayı+birim, IP, standart, kod, faz) iki metinde
çıkarır ve KÜME olarak karşılaştırır. EN'de TR'de olmayan jeton = yeni iddia = KIRMIZI;
TR'de olup EN'de olmayan jeton = düşen iddia = KIRMIZI.

⚠ SAYI DİLE GÖRE OKUNUR (4. ve 5. çürütme, 2026-09-23). TR'de `.` binlik, `,` ondalık; EN'de
tersi. Dilden bağımsız bir "3 hane varsa binlik" kuralı, TR `1.125 m³/h` (1125) değerini EN'e
AYNEN kopyalayan çeviriyi YEŞİL geçirirdi — İngilizcede `1.125` = 1,125, değer 1000 kat kayar.
Bu yüzden EN'de "nokta + tam 3 hane" (`1.125`) BELİRSİZDİR → KIRMIZI; yazar `1,125` ya da
`1125` yazmalı. TR'de "virgül + tam 3 hane" (`1,125`) aynı sebeple belirsizdir → KIRMIZI.

DÜRÜST SINIR: anlamı görmez. "Alüminyum pervane" ↔ "steel impeller" jeton taşımaz; anlam
farkını çürütücü ajan yakalar. Bu kapı yalnız sayı/kod sadakatini ölçer.

KULLANIM:
    python scripts/icerik-hatti/en-jeton-kapisi.py paket/rec146/*.en.md      # yanındaki .tr.md ile
    python scripts/icerik-hatti/en-jeton-kapisi.py --tr a.tr.md --en a.en.md

ÇIKIŞ: 0 YEŞİL · 1 KIRMIZI · 2 önkoşul (eş dosya yok / girdi yok)
"""
import re
import sys
from pathlib import Path

for _akis in (sys.stdout, sys.stderr):
    try:
        _akis.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Taslak iç işaretleri (kaynak atfı, DB etiketi, HTML yorumu) jeton sayılmaz — vitrine gitmez.
IC_ISARET = re.compile(r"<!--.*?-->|\[(?:[A-Za-zÇĞİÖŞÜçğıöşü]+\s+)?s\.\s*[0-9][^\]]*\]|\[DB\]", re.S)

# Birim eşdeğerliği → kanonik ad. Uzun olan önce denenir (m³/h, `m` değil).
BIRIMLER = [
    ("m³/h", "m3/h"), ("m3/h", "m3/h"), ("m³/s", "m3/s"), ("l/s", "l/s"),
    ("d/dk", "rpm"), ("rpm", "rpm"), ("dev/dk", "rpm"),
    ("°C", "°C"), ("ºC", "°C"), ("mm", "mm"), ("m²", "m2"), ("m2", "m2"),
    ("kPa", "kPa"), ("Pa", "Pa"), ("kW", "kW"), ("W", "W"), ("mA", "mA"), ("A", "A"),
    ("kV", "kV"), ("V", "V"), ("Hz", "Hz"), ("dB(A)", "dB(A)"), ("dBA", "dB(A)"), ("dB", "dB"),
    ("kg", "kg"), ("%", "%"),
]
_BIRIM_RX = "|".join(re.escape(b) for b, _ in sorted(BIRIMLER, key=lambda x: -len(x[0])))
_BIRIM_KANON = {b: k for b, k in BIRIMLER}

# Dil başına sayı biçimi. Binlik grupları ZORUNLU 3 hane; ondalık serbest.
SAYI = {
    "tr": r"[0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]+)?|[0-9]+(?:,[0-9]+)?",
    "en": r"[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?",
}
BINLIK = {"tr": ".", "en": ","}
ONDALIK = {"tr": ",", "en": "."}

KODLAR = [
    (re.compile(r"\bIP\s?-?\s?([0-9X])\s?([0-9])\b", re.I), lambda m: f"IP{m.group(1).upper()}{m.group(2)}"),
    (re.compile(r"\bEN\s?([0-9]{3,5}(?:-[0-9]+)*)\b"), lambda m: f"EN{m.group(1)}"),
    (re.compile(r"\b(IE[1-5]|ATEX|EC|AC|PWM|MODBUS|Modbus|DALI|G[1-4]|F[5-9]|M5|ePM[0-9]+)\b"), lambda m: m.group(1).upper()),
    (re.compile(r"\bEx\s+[a-z]{1,3}\s+II[ABC]?(?:\+H2)?\s+T[1-6]\s+G[abc]\b"), lambda m: re.sub(r"\s+", " ", m.group(0))),
    (re.compile(r"\bZone\s+(2[0-2]|[0-2])\b", re.I), lambda m: f"ZONE{m.group(1)}"),
    (re.compile(r"\bT([1-6])\b"), lambda m: f"T{m.group(1)}"),
]
FAZ = [
    (re.compile(r"\b(?:trifaze|üç\s?fazlı|3\s?fazlı|three[\s-]?phase|3[\s-]?phase)\b", re.I), "FAZ3"),
    (re.compile(r"\b(?:monofaze|tek\s?fazlı|single[\s-]?phase|1[\s-]?phase)\b", re.I), "FAZ1"),
]
TR_HARF = re.compile(r"[çğıöşüÇĞİÖŞÜ]")


def temizle(metin):
    # Markdown basliklari ("### Kimlik cümlesi") taslak iskeletidir, vitrine gitmez; Turkce
    # baslik EN dosyada "Turkce harf" yanlis kirmizisi uretiyordu (olculdu, k70 sinavi).
    metin = re.sub(r"(?m)^\s*#{1,6}\s.*$", " ", metin)
    return IC_ISARET.sub(" ", metin)


def sayi_kanon(ham, dil):
    """Dile göre ayrıştırılmış sayıyı kanonik ondalık dizeye çevirir (1.125,5 → 1125.5)."""
    b, o = BINLIK[dil], ONDALIK[dil]
    s = ham.replace(b, "").replace(o, ".")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return s


def belirsizler(metin, dil):
    """Ters dilin binlik biçimi: EN'de `1.125`, TR'de `1,125` — değer 1000 kat kayabilir."""
    ters = ONDALIK["tr"] if dil == "tr" else ONDALIK["en"]
    # TR'de ondalık virgül + tam 3 hane = EN binlik biçimi; EN'de ondalık nokta + 3 hane = TR binlik
    # baştaki 0 binlik olamaz: `0,125` / `0.125` belirsiz DEĞİL (yanlış kırmızı üretmesin)
    rx = re.compile(rf"(?<![0-9.,])[1-9][0-9]{{0,2}}{re.escape(ters)}[0-9]{{3}}(?![0-9.,])")
    return [m.group(0) for m in rx.finditer(metin)]


def jetonlar(metin, dil):
    t = temizle(metin)
    kume = set()
    kod_araliklari = []
    for rx, f in KODLAR:
        for m in rx.finditer(t):
            kume.add(f(m))
            kod_araliklari.append(m.span())
    for rx, ad in FAZ:
        for m in rx.finditer(t):
            kume.add(ad)
            kod_araliklari.append(m.span())
    # yüzde TR önek biçimi: %90
    for m in re.finditer(r"%\s?([0-9]+(?:[.,][0-9]+)?)", t):
        kume.add(f"{sayi_kanon(m.group(1), dil)}%")
        kod_araliklari.append(m.span())
    say_rx = re.compile(rf"(?<![0-9A-Za-z.,])({SAYI[dil]})(?![0-9])\s?({_BIRIM_RX})?(?![A-Za-z])")
    for m in say_rx.finditer(t):
        if any(a <= m.start() < b for a, b in kod_araliklari):
            continue
        k = sayi_kanon(m.group(1), dil)
        birim = _BIRIM_KANON.get(m.group(2) or "", "")
        kume.add(f"{k}{birim}" if birim else k)
    return kume


def karsilastir(tr_metin, en_metin):
    tr_j, en_j = jetonlar(tr_metin, "tr"), jetonlar(en_metin, "en")
    return {
        "fazla_en": sorted(en_j - tr_j),
        "eksik_en": sorted(tr_j - en_j),
        "belirsiz_en": belirsizler(temizle(en_metin), "en"),
        "belirsiz_tr": belirsizler(temizle(tr_metin), "tr"),
        "tr_harf_en": sorted(set(TR_HARF.findall(temizle(en_metin)))),
        "tr_jeton": len(tr_j),
    }


def ciftler(argv):
    if "--tr" in argv and "--en" in argv:
        return [(Path(argv[argv.index("--tr") + 1]), Path(argv[argv.index("--en") + 1]))]
    out = []
    for a in argv:
        if a.startswith("--"):
            continue
        for en in (sorted(Path(".").glob(a)) if any(c in a for c in "*?") else [Path(a)]):
            out.append((Path(str(en).replace(".en.md", ".tr.md")), en))
    return out


def main():
    argv = sys.argv[1:]
    cf = ciftler(argv)
    if not cf:
        print(__doc__)
        sys.exit(2)
    kirmizi = 0
    print("== TR ↔ EN JETON KAPISI ==")
    for tr_yol, en_yol in cf:
        if not tr_yol.exists() or not en_yol.exists():
            print(f"  ⛔ ÖNKOŞUL: eş dosya yok — {tr_yol} / {en_yol}")
            sys.exit(2)
        r = karsilastir(tr_yol.read_text(encoding="utf-8"), en_yol.read_text(encoding="utf-8"))
        sorun = r["fazla_en"] or r["eksik_en"] or r["belirsiz_en"] or r["belirsiz_tr"] or r["tr_harf_en"]
        # hiç jeton yoksa kapı KÖR — "temiz" ile "bakmadım" aynı görünmesin
        kor = r["tr_jeton"] == 0
        durum = "KIRMIZI" if sorun else ("KÖR" if kor else "YESIL")
        print(f"  [{durum}] {en_yol.name} · TR jeton {r['tr_jeton']}")
        if r["fazla_en"]:
            print(f"      ⛔ EN'de FAZLA (TR'de yok → yeni iddia): {', '.join(r['fazla_en'])}")
        if r["eksik_en"]:
            print(f"      ⛔ EN'de EKSİK (TR'de var → düşen iddia): {', '.join(r['eksik_en'])}")
        if r["belirsiz_en"]:
            print(f"      ⛔ EN'de BELİRSİZ sayı (nokta + 3 hane; `1,125` ya da `1125` yazın): {', '.join(r['belirsiz_en'])}")
        if r["belirsiz_tr"]:
            print(f"      ⛔ TR'de BELİRSİZ sayı (virgül + 3 hane; `1.125` ya da `1125` yazın): {', '.join(r['belirsiz_tr'])}")
        if r["tr_harf_en"]:
            print(f"      ⛔ EN metinde Türkçe harf: {' '.join(r['tr_harf_en'])}")
        if kor and not sorun:
            print("      ⚠ jeton taşımayan metin — bu kapı ÖLÇEMEDİ; sadakat yalnız çürütücü ajanın hükmünde.")
        kirmizi += 1 if sorun else 0
    if kirmizi:
        print(f"\nSONUÇ: KIRMIZI — {kirmizi} aile. Kırmızı satır toplu tabloya girmez.")
        sys.exit(1)
    print("\nSONUÇ: YEŞİL — sayı/kod/birim jetonları iki dilde birebir.")
    sys.exit(0)


if __name__ == "__main__":
    main()
