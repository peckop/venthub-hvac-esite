#!/usr/bin/env python
"""HAFIZA SINAVI — belgeler icin kapi (v1.1).

docs/proje-takip/hafiza-sinavi.json'daki her soru 'Venthub Proje Takip' defterine sorulur; cevap 'beklenen' anahtar
ifadelerin HEPSINI ve 'beklenen_biri' kumesinden EN AZ BIRINI icermeli, 'yasak' ifadelerin HICBIRINI icermemeli.
Sapma = KIRMIZI. Cevap anahtari Recep'ten degil YAZILI kararlardan gelir (Linear Kararlar, VISION, SaaS yol haritasi,
Anahtar ve Kip Haritasi).
v1.1 (2026-09-05, ilk kosum dersi): yasak ifadeler IDDIA CUMLESIDIR — "self-merge" kelimesi "self-merge YAPILMAZ"
cumlesinde de gecer ve dogru cevabi kirmiziya boyar; ayrica defter cevabi degiskendir, kirmizida bir kez daha sorulur.

Kullanim:
  python scripts/nlm/hafiza_sinavi.py            # tum sorular
  python scripts/nlm/hafiza_sinavi.py S01 S06    # secili sorular
  python scripts/nlm/hafiza_sinavi.py --alan vitrin
Cikis kodu: 0 hepsi yesil · 3 en az bir kirmizi · 2 defter cevap vermedi.
Rapor: docs/proje-takip/hafiza-sinavi-sonuc.md (her kosumda ustune yazilir; damga date -u ile olculur, elle yazilmaz).
Cetvel: docs/standards/proje-takip-defteri-standard.md
"""
from __future__ import annotations
import json, os, re, subprocess, sys, unicodedata
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding="utf-8")
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
SINAV = os.path.join(REPO, "docs", "proje-takip", "hafiza-sinavi.json")
SONUC = os.path.join(REPO, "docs", "proje-takip", "hafiza-sinavi-sonuc.md")
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
        ozet = (cevap or "").replace("\n", " ")[:220]
        satirlar.append(f"| {s['id']} | {s['alan']} | {durum} | {s['soru']} | {not_} | {ozet} |")
    rapor = [f"# Hafiza sinavi sonucu — {damga} (olculmus, `date -u` esdegeri)", "",
             f"Defter: `{DEFTER}` · soru {len(sorular)} · yesil {len(sorular)-kirmizi-cevapsiz} · kirmizi {kirmizi} · cevapsiz {cevapsiz}",
             "Kural: KIRMIZI = ya belge celiskisi (belge duzeltilir) ya karar degisti (sinav guncellenir); ikisi de GORUNUR.", "",
             "| id | alan | durum | soru | not | cevap (ilk 220) |", "|---|---|---|---|---|---|", *satirlar, ""]
    with open(SONUC, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(rapor))
    print(f"\nOZET: yesil {len(sorular)-kirmizi-cevapsiz} / kirmizi {kirmizi} / cevapsiz {cevapsiz} → {os.path.relpath(SONUC, REPO)}")
    return 2 if cevapsiz and not kirmizi else (3 if kirmizi else 0)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
