#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""REC-172 karar 76 — 4 ailenin teknik verisini KAYNAK DIZININDEN deterministik okur (plan v5.1 adim 2).

Aileler: NIMUS · NIMAX (Casals flipbook 191/192 · 199/200, yalniz metin) · Enkelfan EEC (Casals
plug-fan PDF s.16, metin + tablo) · Vorticent CMS ATEX (urun basina foy: s.1 baslik/genel metin,
s.2 TECHNICAL DATA tablosu). PDF ACILMAZ (K15, catalog-ingestion §6.3); dil modeli deger OKUMAZ.

CIKTI: CSV `sku,urun_id,alan,deger,birim,belge,sayfa,alinti,kaynak,kural` — `faz4-teknik-yukle.py
--girdi` bunu okur. kaynak ∈ alıntı | koşullu | türetildi (kabul 1). Satirlar (sku, alan) sirali;
iki kosum bayt-esit (kabul 4).

KAPILAR (fail-closed):
  1. EVREN — kaynak dizini manifest'le ayni buyuklukte (`_kaynak.taban_dogrula`).
  2. ESLESME — urun ↔ kaynak satiri MODEL ADIYLA (AVenS kodu ≠ Casals kodu, REC-370); CMS'te
     boyut + kutup (T) + kW birlikte (gevsek "14/5" eslemesi yasak → 14/5 T2 foysuz kalir).
  3. KOL 2 — tablolu kaynaklarda (Enkelfan s.16, CMS s.2) ikinci okuyucu DUZ METINDEN okur,
     birincisi TABLO HUCRESINDEN; ayrisan tek deger → KIRMIZI (cikis 1).
  4. ALINTI — her `alıntı`/`koşullu` satirin alintisi, bosluk normalize edilerek, atif verdigi
     sayfanin metin+tablo havuzunda yeniden aranir; bulunamazsa KIRMIZI.
CMS s.2'de "RPM" ve "Approx. weight" hem Fan hem Motor bolumunde; iki okuyucu da BOLUM ETIKETIYLE
okur ("ilk RPM" kurali yasak — iki okuyucu ayni hatada anlasir). Fan ve motor devri farkliysa
(12/5, 14/5: 1450 ↔ 1346) devir YAZILMAZ (plan acik soru 3).

KULLANIM:
  python scripts/icerik-hatti/rec172-cikarim.py --cikti <csv> [--urunler <json>] [--dizin <sayfalar.jsonl>]
  --urunler yoksa urun listesi canlidan SALT OKUNUR (4 aile, deleted_at null).
Cikis: 0 YESIL · 1 KIRMIZI · 2 onkosul.
"""
from __future__ import annotations

import csv
import io
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _kaynak  # noqa: E402

DIZIN_VARSAYILAN = Path.home() / "venthub-pdf-ingestor" / "kaynak-dizini" / "sayfalar.jsonl"
AILELER = ("avens-nimus", "avens-nimax", "avens-enkelfan-ec-plug", "vortice-vorticent-cms-atex")
KOLONLAR = ["sku", "urun_id", "alan", "deger", "birim", "belge", "sayfa", "alinti", "kaynak", "kural"]
BIRIM = {"rpm_max": "rpm", "absorbed_current_a": "A", "max_current_a": "A", "rated_power_w": "W",
         "weight_kg": "kg", "voltage_v": "V", "voltage_alt_v": "V", "max_delivery_m3h": "m³/h",
         "max_delivery_ls": "l/s"}
ENKELFAN = "82f7f-cata-logo-plug-fans_casals.pdf"
FLIP = {"NIMUS": ("www.casals.com__Casals_catalogue__flipbook__191.txt", "www.casals.com__Casals_catalogue__flipbook__192.txt"),
        "NIMAX": ("www.casals.com__Casals_catalogue__flipbook__199.txt", "www.casals.com__Casals_catalogue__flipbook__200.txt")}


def arg(ad, vars_=None):
    return sys.argv[sys.argv.index(ad) + 1] if ad in sys.argv and sys.argv.index(ad) + 1 < len(sys.argv) else vars_


def norm(s):
    return re.sub(r"\s+", " ", s or "").strip()


def sayi(s):
    """Kaynak sayisi → float. Ondalik virgul; binlik nokta yalniz 3'lu grupta ("4.720")."""
    s = s.strip()
    if re.fullmatch(r"[0-9]{1,3}(?:\.[0-9]{3})+", s):
        s = s.replace(".", "")
    return float(s.replace(",", "."))


def tam(x):
    return int(x) if float(x).is_integer() else x


def kw_anahtar(s):
    return round(sayi(s), 3)


# ---------------------------------------------------------------- dizin
def dizin_yukle(yol):
    if not yol.exists():
        print(f"ONKOSUL-HATASI: kaynak dizini yok: {yol}")
        sys.exit(2)
    sayfalar = {}
    with open(yol, encoding="utf-8") as fh:
        for satir in fh:
            if satir.strip():
                k = json.loads(satir)
                sayfalar[(os.path.basename(k["dosya"].replace(chr(92), "/")), int(k["sayfa"]))] = k
    _kaynak.taban_dogrula(yol, len(sayfalar))
    return sayfalar


def havuz(k):
    """Alinti aramasi icin sayfa metni + tablo satirlari (hucreler bosluklu), normalize."""
    m = k.get("metin") or ""
    for t in k.get("tablo") or []:
        for r in t.get("satirlar") or []:
            m += "\n" + " ".join(str(h) for h in r if h)
    return norm(m)


# ---------------------------------------------------------------- urunler
def urunleri_al():
    yol = arg("--urunler")
    if yol:
        return json.loads(Path(yol).read_text(encoding="utf-8"))
    import _veri
    U, h = _veri.baglan()
    aile = {f["id"]: f["slug"] for f in _veri.tumunu_cek(
        U, h, f"product_families?select=id,slug&slug=in.({','.join(AILELER)})", "product_families")}
    out = []
    for u in _veri.tumunu_cek(U, h, "products?select=id,sku,name,family_id&deleted_at=is.null", "products"):
        if u["family_id"] in aile:
            ad = u["name"].get("tr") if isinstance(u["name"], dict) else u["name"]
            out.append({"id": u["id"], "sku": u["sku"], "ad": ad, "aile": aile[u["family_id"]]})
    return sorted(out, key=lambda x: x["sku"])


# ---------------------------------------------------------------- satir ureticisi
class Cikti:
    def __init__(self):
        self.satirlar, self.kirmizi, self.notlar = [], [], []

    def ekle(self, u, alan, deger, belge, sayfa, alinti, kaynak="alıntı", kural=""):
        self.satirlar.append({"sku": u["sku"], "urun_id": u["id"], "alan": alan, "deger": deger,
                              "birim": BIRIM.get(alan, ""), "belge": belge, "sayfa": sayfa,
                              "alinti": norm(alinti), "kaynak": kaynak, "kural": kural})


# ---------------------------------------------------------------- NIMUS / NIMAX (yalniz metin)
CASALS_SATIR = re.compile(
    r"(N[SX]\d+) (NIM(?:US|AX) (\d+) T(\d) ([\d,]+)kW) (\d{3,4}) (-|[\d,]+) ([\d,]+) ([\d,]+) "
    r"([\d.]+) (\d{2,3}) ([\d.,]+)(?: (\d))?")


def casals(u, seri, sayfalar, c):
    genel_ad, deger_ad = FLIP[seri]
    genel, deger = sayfalar.get((genel_ad, 1)), sayfalar.get((deger_ad, 1))
    if not genel or not deger:
        c.kirmizi.append(f"{u['sku']}: {seri} flipbook sayfasi dizinde yok")
        return
    m_ad = re.match(rf"{seri} (\d+) T(\d) ([\d,]+) ?kW", u["ad"])
    if not m_ad:
        c.kirmizi.append(f"{u['sku']}: ad cozulemedi ({u['ad']})")
        return
    anahtar = (m_ad.group(1), m_ad.group(2), kw_anahtar(m_ad.group(3)))
    dm = norm(deger.get("metin"))
    bul = [m for m in CASALS_SATIR.finditer(dm)
           if (m.group(3), m.group(4), kw_anahtar(m.group(5))) == anahtar and m.group(2).startswith(seri)]
    if len(bul) != 1:
        c.kirmizi.append(f"{u['sku']}: {seri} deger satiri {len(bul)} kez bulundu (1 beklenir) — {u['ad']}")
        return
    m = bul[0]
    satir, kw = m.group(0), sayi(m.group(9))
    kol = lambda ad: f"{deger_ad} satiri, sütun '{ad}'"  # noqa: E731
    c.ekle(u, "rpm_max", int(m.group(6)), deger_ad, 1, satir,
           kural=kol("R.P.M.") + " — sabit devirli AC motorda anma devri (cetvel rpm_max notu)")
    c.ekle(u, "absorbed_current_a", tam(sayi(m.group(8))), deger_ad, 1, satir, kural=kol("Rated I (A) 400 V"))
    c.ekle(u, "rated_power_w", tam(round(kw * 1000)), deger_ad, 1, satir, kural=kol("Rated Power kW") + " × 1000")
    c.ekle(u, "weight_kg", tam(sayi(m.group(12))), deger_ad, 1, satir, kural=kol("Weight Kg"))
    c.ekle(u, "motor_poles", int(m.group(4)), deger_ad, 1, satir, kural="model adındaki T<n> = <n> kutup")
    if "THREE PHASE RANGE" not in dm:
        c.kirmizi.append(f"{u['sku']}: 'THREE PHASE RANGE' {deger_ad}'de yok")
    else:
        c.ekle(u, "phase", 3, deger_ad, 1, "THREE PHASE RANGE", kural="tablo başlığı")
    gm = norm(genel.get("metin"))
    gv = re.search(r"Standard voltages 230/400V 50Hz for three-?phase motors up to 4kW and 400/690V 50Hz, for higher powers", gm)
    ip = re.search(r"IP-55 protection and class F electrical insulation", gm)
    if not gv or not ip:
        c.kirmizi.append(f"{u['sku']}: {genel_ad} gerilim/IP cumlesi bulunamadi")
        return
    c.ekle(u, "voltage_v", 400, genel_ad, 1, gv.group(0), kural="iki gerilim aralığında da 400 V")
    c.ekle(u, "voltage_alt_v", 230 if kw <= 4 else 690, genel_ad, 1, gv.group(0), kaynak="koşullu",
           kural=f"≤4 kW → 230 V, >4 kW → 690 V (ürün {m.group(9)} kW)")
    c.ekle(u, "ip_rating", "IP55", genel_ad, 1, ip.group(0))
    c.ekle(u, "insulation_class", "Class F", genel_ad, 1, ip.group(0))


# ---------------------------------------------------------------- Enkelfan (tablo + metin)
def enkelfan_tablo(k):
    out = {}
    for t in k.get("tablo") or []:
        rows = t.get("satirlar") or []
        if not rows or not rows[0] or rows[0][0] != "Code":
            continue
        bas = [norm(h) for h in rows[0]]
        gerilim = "230" if "230V" in bas[3] else ("400" if "400V" in bas[3] else None)
        for r in rows[1:]:
            if r and r[0] and r[0].startswith("ENKEC"):
                out[r[1]] = {"rpm": r[2], "akim": r[3], "agirlik": r[7], "gerilim": gerilim,
                             "alinti": " ".join(str(h) for h in r if h)}
    return out


def enkelfan_metin(k):
    """Kol 2: ayni degerleri DUZ METINDEN okur (satir satir: kod, model, rpm, akim, guc, debi, ses, agirlik)."""
    satirlar = [s.strip() for s in (k.get("metin") or "").splitlines() if s.strip()]
    out, gerilim = {}, None
    for i, s in enumerate(satirlar):
        if s == "Rated I (A)" and i + 1 < len(satirlar):
            gerilim = satirlar[i + 1].replace("V", "")
        if re.fullmatch(r"ENKEC\d+", s) and i + 8 < len(satirlar):
            v = satirlar[i + 1: i + 9]
            out[v[0]] = {"rpm": v[1], "akim": v[2], "agirlik": v[6], "gerilim": gerilim}
    return out


def enkelfan(u, sayfalar, c, onbellek={}):
    k = sayfalar.get((ENKELFAN, 16))
    if not k:
        c.kirmizi.append(f"{u['sku']}: {ENKELFAN} s.16 dizinde yok")
        return
    if "t" not in onbellek:
        onbellek["t"], onbellek["m"] = enkelfan_tablo(k), enkelfan_metin(k)
    t, mt = onbellek["t"].get(u["ad"]), onbellek["m"].get(u["ad"])
    if not t or not mt:
        c.kirmizi.append(f"{u['sku']}: Enkelfan satiri bulunamadi ({u['ad']}) tablo={bool(t)} metin={bool(mt)}")
        return
    for a in ("rpm", "akim", "agirlik", "gerilim"):
        if norm(t[a]) != norm(mt[a]):
            c.kirmizi.append(f"{u['sku']}: KOL 2 AYRISTI {a}: tablo {t[a]!r} ↔ metin {mt[a]!r}")
            return
    kol = lambda ad: f"s.16 tablo, sütun '{ad}' (kol 2: düz metin aynı)"  # noqa: E731
    c.ekle(u, "rpm_max", int(sayi(t["rpm"])), ENKELFAN, 16, t["alinti"], kural=kol("R.P.M"))
    c.ekle(u, "absorbed_current_a", tam(sayi(t["akim"])), ENKELFAN, 16, t["alinti"],
           kural=kol(f"Rated I (A) {t['gerilim']}V"))
    c.ekle(u, "weight_kg", tam(sayi(t["agirlik"])), ENKELFAN, 16, t["alinti"], kural=kol("Weight Kg"))
    gm = norm(k.get("metin"))
    ip = re.search(r"IP54 motor and class B insulation", gm)
    ec = re.search(r"external rotor EC motor", gm)
    if not ip or not ec:
        c.kirmizi.append(f"{u['sku']}: Enkelfan IP/EC cumlesi yok")
        return
    c.ekle(u, "ip_rating", "IP54", ENKELFAN, 16, ip.group(0))
    c.ekle(u, "insulation_class", "Class B", ENKELFAN, 16, ip.group(0))
    c.ekle(u, "motor_type", "EC", ENKELFAN, 16, ec.group(0))
    boy = int(re.search(r"ENKELFAN (\d+)", u["ad"]).group(1))
    if 155 <= boy <= 310:
        g = re.search(r"Sin- ?gle-phase 230V 50/60Hz power supply for models 155 to 310", gm)
        if not g or t["gerilim"] != "230":
            c.kirmizi.append(f"{u['sku']}: Enkelfan tek faz cumlesi/tablo basligi tutmadi")
            return
        c.ekle(u, "voltage_v", 230, ENKELFAN, 16, g.group(0), kural="155-310 tek faz 230 V; tablo başlığı 'Rated I (A) 230V'")
        c.ekle(u, "phase", 1, ENKELFAN, 16, g.group(0))
    else:
        c.notlar.append(f"{u['sku']}: gerilim/faz YAZILMADI — s.16 '400V' ↔ s.17 şema 'AC380V' (açık soru 4)")


# ---------------------------------------------------------------- CMS ATEX (foy basina)
CMS_BASLIK = re.compile(
    r"VORTICENT CMS ATEX (\d+/\d+) T(\d) ([\d,]+)kW Zone (\d): FAN \((Ex [^)]*)\) \+ MOTOR \((Ex [^)]*)\)")


def cms_tablo(k):
    d, bol = {"Fan": {}, "Motor": {}}, None
    for t in k.get("tablo") or []:
        for r in t.get("satirlar") or []:
            if not r:
                continue
            if r[0] in ("Fan", "Motor") and not any(r[1:]):
                bol = r[0]
                continue
            if bol is None:
                continue
            for i in range(0, len(r) - 1, 2):
                if r[i] and r[i + 1]:
                    d[bol][norm(r[i])] = norm(r[i + 1])
    return d


def cms_metin(k):
    """Kol 2: s.2 duz metninde TECHNICAL DATA → DIMENSIONS arasi; 'Fan'/'Motor' bolum etiketi, sonra etiket/deger ciftleri."""
    s = [x.strip() for x in (k.get("metin") or "").splitlines()]
    s = [x for x in s if x]
    try:
        bas, son = s.index("TECHNICAL DATA"), s.index("DIMENSIONS")
    except ValueError:
        return None
    d, bol, i = {"Fan": {}, "Motor": {}}, None, bas + 1
    while i < son:
        if s[i] in ("Fan", "Motor"):
            bol, i = s[i], i + 1
            continue
        if bol and i + 1 < son:
            d[bol][s[i]] = s[i + 1]
            i += 2
        else:
            i += 1
    return d


def cms_foyleri(sayfalar):
    out = {}
    for (ad, sayfa), k in sayfalar.items():
        if sayfa == 1 and "VORTICENT-CMS-ATEX-" in ad:
            m = CMS_BASLIK.search(norm(k.get("metin")))
            if m:
                out[(m.group(1), m.group(2), kw_anahtar(m.group(3)))] = (ad, m)
    return out


def cms(u, sayfalar, c, onbellek={}):
    if "f" not in onbellek:
        onbellek["f"] = cms_foyleri(sayfalar)
    m_ad = re.search(r"CMS ATEX (\d+/\d+) T(\d) ([\d,]+) ?kW", u["ad"])
    if not m_ad:
        c.kirmizi.append(f"{u['sku']}: ad cozulemedi ({u['ad']})")
        return
    anahtar = (m_ad.group(1), m_ad.group(2), kw_anahtar(m_ad.group(3)))
    if anahtar not in onbellek["f"]:
        c.notlar.append(f"{u['sku']}: FÖYSÜZ ({u['ad']}) — boyut+T+kW eşleşen föy yok, yazılmaz")
        return
    ad, bm = onbellek["f"][anahtar]
    s1, s2 = sayfalar[(ad, 1)], sayfalar.get((ad, 2))
    if not s2:
        c.kirmizi.append(f"{u['sku']}: {ad} s.2 dizinde yok")
        return
    t, mt = cms_tablo(s2), cms_metin(s2)
    if mt is None:
        c.kirmizi.append(f"{u['sku']}: {ad} s.2 metninde TECHNICAL DATA/DIMENSIONS yok")
        return
    gerek = [("Fan", "RPM"), ("Fan", "Max. Flow"), ("Motor", "RPM"), ("Motor", "Power"), ("Motor", "I max. (400V)")]
    for b, e in gerek:
        if t[b].get(e) is None or t[b].get(e) != mt[b].get(e):
            c.kirmizi.append(f"{u['sku']}: KOL 2 AYRISTI {b}/{e}: tablo {t[b].get(e)!r} ↔ metin {mt[b].get(e)!r}")
            return
    baslik = bm.group(0)
    zone, fan_ex, mot_ex = bm.group(4), bm.group(5), bm.group(6)
    c.ekle(u, "atex_zone", f"Zone {zone}", ad, 1, baslik, kural="föy başlığı; kategori öneki föyde yok → eklenmez")
    c.ekle(u, "atex_marking", f"Fan: {fan_ex} · Motor: {mot_ex}", ad, 1, baslik, kural="föy başlığı, fan ve motor ayrı işaretli")
    c.ekle(u, "motor_poles", int(bm.group(2)), ad, 1, baslik, kural="model adındaki T<n> = <n> kutup")
    gm = norm(s1.get("metin"))
    ip = re.search(r"IP55 protection, and class F insulation", gm)
    gv = re.search(r"230/400V 50Hz for three phase motors up to 4kW and 400/690V 50Hz for higher powers", gm)
    if not ip or not gv:
        c.kirmizi.append(f"{u['sku']}: {ad} s.1 IP/gerilim cumlesi yok")
        return
    kw = sayi(bm.group(3))
    c.ekle(u, "ip_rating", "IP55", ad, 1, ip.group(0))
    c.ekle(u, "insulation_class", "Class F", ad, 1, ip.group(0))
    c.ekle(u, "voltage_v", 400, ad, 1, gv.group(0), kural="üç faz, iki gerilim aralığında da 400 V")
    c.ekle(u, "voltage_alt_v", 230 if kw <= 4 else 690, ad, 1, gv.group(0), kaynak="koşullu",
           kural=f"≤4 kW → 230 V, >4 kW → 690 V (ürün {bm.group(3)} kW)")
    c.ekle(u, "phase", 3, ad, 1, gv.group(0), kaynak="koşullu",
           kural="s.1 'three phase motors' + s.2 'I max. (400V)' — gerilimle aynı kanıt")
    # s.2 — bolum etiketiyle
    kol2 = "s.2 tablo, bölüm '{}' etiket '{}' (kol 2: düz metin aynı)"
    fan_rpm, mot_rpm = t["Fan"]["RPM"], t["Motor"]["RPM"]
    if fan_rpm == mot_rpm:
        c.ekle(u, "rpm_max", int(sayi(fan_rpm)), ad, 2, f"Fan RPM {fan_rpm}", kural=kol2.format("Fan", "RPM"))
    else:
        c.notlar.append(f"{u['sku']}: devir YAZILMADI — fan {fan_rpm} ↔ motor {mot_rpm} (açık soru 3)")
    guc = re.fullmatch(r"([\d,.]+) kW", t["Motor"]["Power"])
    akim = re.fullmatch(r"([\d,.]+) A", t["Motor"]["I max. (400V)"])
    debi = re.fullmatch(r"([\d.,]+) m³/h", t["Fan"]["Max. Flow"])
    if not (guc and akim and debi):
        c.kirmizi.append(f"{u['sku']}: {ad} s.2 guc/akim/debi bicimi cozulemedi")
        return
    c.ekle(u, "rated_power_w", tam(round(sayi(guc.group(1)) * 1000)), ad, 2,
           f"Power {t['Motor']['Power']}", kural=kol2.format("Motor", "Power") + " × 1000")
    c.ekle(u, "max_current_a", tam(sayi(akim.group(1))), ad, 2,
           f"I max. (400V) {t['Motor']['I max. (400V)']}", kural=kol2.format("Motor", "I max. (400V)"))
    m3h = sayi(debi.group(1))
    c.ekle(u, "max_delivery_m3h", tam(m3h), ad, 2, f"Max. Flow {t['Fan']['Max. Flow']}",
           kural=kol2.format("Fan", "Max. Flow"))
    c.ekle(u, "max_delivery_ls", round(m3h / 3.6, 2), ad, 2, "", kaynak="türetildi",
           kural="max_delivery_m3h / 3,6 (2 ondalık)")


# ---------------------------------------------------------------- ana akis
def alinti_kapisi(c, sayfalar):
    for s in c.satirlar:
        if s["kaynak"] == "türetildi":
            continue
        k = sayfalar.get((s["belge"], int(s["sayfa"])))
        if not k or s["alinti"] not in havuz(k):
            c.kirmizi.append(f"{s['sku']} {s['alan']}: ALINTI sayfada bulunamadi ({s['belge']} s.{s['sayfa']}): {s['alinti'][:60]}")


def main():
    cikti = arg("--cikti")
    if not cikti:
        print("ONKOSUL-HATASI: --cikti <csv> zorunlu")
        return 2
    sayfalar = dizin_yukle(Path(arg("--dizin") or os.environ.get("VENTHUB_KAYNAK_DIZINI") or DIZIN_VARSAYILAN))
    urunler = urunleri_al()
    c = Cikti()
    for u in urunler:
        if u["aile"] == "avens-nimus":
            casals(u, "NIMUS", sayfalar, c)
        elif u["aile"] == "avens-nimax":
            casals(u, "NIMAX", sayfalar, c)
        elif u["aile"] == "avens-enkelfan-ec-plug":
            enkelfan(u, sayfalar, c)
        elif u["aile"] == "vortice-vorticent-cms-atex":
            cms(u, sayfalar, c)
    alinti_kapisi(c, sayfalar)
    c.satirlar.sort(key=lambda s: (s["sku"], s["alan"]))
    tampon = io.StringIO()
    w = csv.DictWriter(tampon, fieldnames=KOLONLAR, lineterminator="\n")
    w.writeheader()
    w.writerows(c.satirlar)
    Path(cikti).parent.mkdir(parents=True, exist_ok=True)
    Path(cikti).write_text(tampon.getvalue(), encoding="utf-8", newline="")
    tur = {}
    for s in c.satirlar:
        tur[s["kaynak"]] = tur.get(s["kaynak"], 0) + 1
    aile_say = {}
    for u in urunler:
        aile_say[u["aile"]] = aile_say.get(u["aile"], 0) + 1
    yazilan_urun = len({s["sku"] for s in c.satirlar})
    print(f"URUN: {len(urunler)} ({', '.join(f'{a} {n}' for a, n in sorted(aile_say.items()))}) · satir alan urun {yazilan_urun}")
    print(f"SATIR: {len(c.satirlar)} ({' · '.join(f'{k} {v}' for k, v in sorted(tur.items()))}) → {cikti}")
    for n in c.notlar:
        print(f"  NOT  {n}")
    for k in c.kirmizi:
        print(f"  ⛔   {k}")
    print("SONUC: KIRMIZI" if c.kirmizi else "SONUC: YESIL")
    return 1 if c.kirmizi else 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
