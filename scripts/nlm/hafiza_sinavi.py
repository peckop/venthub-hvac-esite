#!/usr/bin/env python
"""HAFIZA SINAVI — belgeler icin kapi (v1.1).

docs/proje-takip/hafiza-sinavi.json'daki her soru 'Venthub Proje Takip' defterine sorulur; cevap 'beklenen' anahtar
ifadelerin HEPSINI ve 'beklenen_biri' kumesinden EN AZ BIRINI icermeli, 'yasak' ifadelerin HICBIRINI icermemeli.
Sapma = KIRMIZI. Cevap anahtari Recep'ten degil YAZILI kararlardan gelir (Linear Kararlar, VISION, SaaS yol haritasi,
Anahtar ve Kip Haritasi).
v1.1 (2026-09-05, ilk kosum dersi): yasak ifadeler IDDIA CUMLESIDIR — "self-merge" kelimesi "self-merge YAPILMAZ"
cumlesinde de gecer ve dogru cevabi kirmiziya boyar; ayrica defter cevabi degiskendir, kirmizida bir kez daha sorulur.
v1.2 (ayni sabah, tam kosum 16/20 dersi): 4 kirmizinin 4'u de olcut hatasi ("kaldiriliyor" ≠ "kalkar"). Kural: tek kelimeye
BAGLANMA — degismez adlar disinda (Recep, Linear, technical_specs) anlam tasiyan ifade 'beklenen_biri' esanlamli kumesine
yazilir; yasak ifade SORUNUN PARCASI olamaz ("Supabase'e yazabilir mi? Hayir" cevabinda "supabase'e yazabilir" gecer),
yalniz olumlu iddia bicimi ("yazma yetkisi vardir"). Olcut hatasi ile belge hatasi ayni renkte gorunur; bu yuzden her
kirmizida ONCE cevap okunur, sonra belge suclanir.

Kullanim:
  python scripts/nlm/hafiza_sinavi.py            # tum sorular
  python scripts/nlm/hafiza_sinavi.py S01 S06    # secili sorular
  python scripts/nlm/hafiza_sinavi.py --alan vitrin
Cikis kodu: 0 hepsi yesil · 3 en az bir kirmizi · 2 defter cevap vermedi.
Rapor: docs/proje-takip/hafiza-sinavi-sonuc.md (her kosumda ustune yazilir; damga date -u ile olculur, elle yazilmaz).
  HAFIZA_SINAV_SONUC=<yol> ile baska yere yazilir — paylasilan ana dizinde (ritüel kosumu) ZORUNLU; depo kopyasi PR ile.
Cetvel: docs/standards/proje-takip-defteri-standard.md
"""
from __future__ import annotations
import json, os, re, subprocess, sys, unicodedata
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding="utf-8")
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
SINAV = os.path.join(REPO, "docs", "proje-takip", "hafiza-sinavi.json")
# v1.3: sonuc yolu ortamdan ezilebilir (HAFIZA_SINAV_SONUC). Sebep: ritüel koşumu (compact/resume dönüşü) PAYLAŞILAN
# ana dizinde koşuyordu ve depodaki üretilmiş dosyayı commit'siz kirletiyordu (09-05, iki kez checkout ile geri alındı).
# Kural: depo kopyası yalnız şerit PR'ında güncellenir; ritüel koşumu scratchpad'e yazar (OPS açılış rutini).
SONUC = os.environ.get("HAFIZA_SINAV_SONUC") or os.path.join(REPO, "docs", "proje-takip", "hafiza-sinavi-sonuc.md")
DEFTER = json.load(open(os.path.join(REPO, "docs", "proje-takip", "manifest.json"), encoding="utf-8"))["defter"]["id"]


def sadelestir(t: str) -> str:
    """Turkce harf/aksan ve buyuk-kucuk farkini yok et; karsilastirma bu biçimde yapilir."""
    t = t.replace("ı", "i").replace("İ", "i").replace("ş", "s").replace("Ş", "s").replace("ğ", "g").replace("Ğ", "g")
    t = t.replace("ü", "u").replace("Ü", "u").replace("ö", "o").replace("Ö", "o").replace("ç", "c").replace("Ç", "c")
    t = unicodedata.normalize("NFKD", t)
    t = "".join(ch for ch in t if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", t.lower())


def sor(soru: str) -> str | None:
    r = subprocess.run(["notebooklm", "ask", "-n", DEFTER, "--new", "--json", soru],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        return None
    try:
        j = json.loads(r.stdout)
    except json.JSONDecodeError:
        return r.stdout or None
    return j.get("answer") if isinstance(j, dict) else str(j)


def degerlendir(s: dict, cevap: str):
    """beklenen: HEPSI gecmeli · beklenen_biri: EN AZ BIRI gecmeli · yasak: iddia cumlesi, HICBIRI gecmemeli (v1.1)."""
    c = sadelestir(cevap)
    eksik = [b for b in s.get("beklenen", []) if sadelestir(b) not in c]
    biri = s.get("beklenen_biri", [])
    if biri and not any(sadelestir(b) in c for b in biri):
        eksik.append("biri: " + "|".join(biri))
    ihlal = [y for y in s.get("yasak", []) if sadelestir(y) in c]
    return eksik, ihlal


DENEME = 2  # v1.1: defter cevabi degisken; kirmizida soru bir kez daha sorulur, iki denemede de kirmiziysa KIRMIZI


def sor_ve_degerlendir(s: dict):
    """(cevap, eksik, ihlal, deneme_no). Cevapsizsa cevap None."""
    son = (None, [], [], 0)
    for n in range(1, DENEME + 1):
        cevap = sor(s["soru"])
        if not cevap:
            return None, [], [], n
        eksik, ihlal = degerlendir(s, cevap)
        son = (cevap, eksik, ihlal, n)
        if not eksik and not ihlal:
            return son
    return son


def main(argv):
    sinav = json.load(open(SINAV, encoding="utf-8"))
    sorular = sinav["sorular"]
    if "--alan" in argv:
        alan = argv[argv.index("--alan") + 1]
        sorular = [s for s in sorular if s["alan"] == alan]
    secili = [a for a in argv[1:] if re.fullmatch(r"S\d+", a)]
    if secili:
        sorular = [s for s in sorular if s["id"] in secili]
    damga = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    # v1.2: kismi kosum onceki sonuclari SILMEZ — mevcut tablo okunur, kosan sorular yenilenir, digerleri korunur.
    # (Aksi halde 'S09 S18' kosumu 20 satirlik sonucu 2 satira indiriyordu; yol haritasi belge-kaniti kor kaliyordu.)
    eski = {}
    if os.path.exists(SONUC):
        for satir in open(SONUC, encoding="utf-8"):
            m = re.match(r"\|\s*(S\d+)\s*\|", satir)
            if m:
                eski[m.group(1)] = satir.rstrip("\n")
    satirlar, kirmizi, cevapsiz = [], 0, 0
    for s in sorular:
        cevap, eksik, ihlal, deneme = sor_ve_degerlendir(s)
        if not cevap:
            cevapsiz += 1
            durum, not_ = "CEVAPSIZ", "defter cevap vermedi"
        else:
            if eksik or ihlal:
                kirmizi += 1
                durum = "KIRMIZI"
                not_ = ("eksik: " + ", ".join(eksik) if eksik else "") + (" · yasak gecti: " + ", ".join(ihlal) if ihlal else "")
                not_ += f" · {deneme} deneme"
            else:
                durum, not_ = "YESIL", (f"{deneme}. denemede" if deneme > 1 else "")
        print(f"{durum:<8} {s['id']} [{s['alan']}] {s['soru'][:70]}  {not_}")
        ozet = (cevap or "").replace("\n", " ").replace("|", "/")[:220]
        eski[s["id"]] = f"| {s['id']} | {s['alan']} | {durum} | {s['soru']} | {not_} | {ozet} |"
    satirlar = [eski[k] for k in sorted(eski, key=lambda x: int(x[1:]))]
    toplam_yesil = sum(1 for v in satirlar if "| YESIL |" in v)
    toplam_kirmizi = sum(1 for v in satirlar if "| KIRMIZI |" in v)
    toplam_cevapsiz = sum(1 for v in satirlar if "| CEVAPSIZ |" in v)
    rapor = [f"# Hafiza sinavi sonucu — {damga} (olculmus, `date -u` esdegeri)", "",
             f"Defter: `{DEFTER}` · tabloda {len(satirlar)} soru · yesil {toplam_yesil} · kirmizi {toplam_kirmizi} · cevapsiz {toplam_cevapsiz} · "
             f"bu kosumda {len(sorular)} soru ({', '.join(s['id'] for s in sorular)})",
             "Kural: KIRMIZI = ya belge celiskisi (belge duzeltilir) ya karar degisti (sinav guncellenir) ya OLCUT hatasi (once cevap okunur); ucu de GORUNUR.",
             "Kismi kosum onceki satirlari korur; satirin tarihi bu baslik degil, o sorunun son kosumudur.", "",
             "| id | alan | durum | soru | not | cevap (ilk 220) |", "|---|---|---|---|---|---|", *satirlar, ""]
    with open(SONUC, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(rapor))
    print(f"\nOZET: yesil {len(sorular)-kirmizi-cevapsiz} / kirmizi {kirmizi} / cevapsiz {cevapsiz} → {os.path.relpath(SONUC, REPO)}")
    return 2 if cevapsiz and not kirmizi else (3 if kirmizi else 0)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
