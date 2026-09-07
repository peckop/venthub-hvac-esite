#!/usr/bin/env python3
"""ACILIS KAPISI — gun kapanisi damgasini okur (YH-47 ucuncu bilesen; cetvel §5 'kapi kopya > simdi halini HATA sayar').

Okur: <hedef>/state.json → "gun_kapanisi" (CANLI kosum kaydi). "gun_kapanisi_kuru" (--kuru kaydi) kapiya SAYILMAZ: kuru
kosum defteri esitlemez, Linear'a yazmaz; damgasi kapanis degildir ('var olmayan kapi pending gorunmez' dersi).
Hukum:
  damga > simdi (+5 dk)          → HATA    (cikis 2; damga elle yazilmis ya da saat yanlis — kapi kor olur)
  kayit yok                      → KIRMIZI (cikis 3; gun kapanisi hic CANLI kosmadi)
  simdi − damga > --saat (24)    → KIRMIZI (cikis 3; kapanis bayat)
  son kosum KIRMIZI              → KIRMIZI (cikis 3; kirmizi adimla bitti — ekran dosyasi §6)
  defter_bekleyen > 0            → KIRMIZI (cikis 3; DEFTER BAYAT — 2. tur esitle yapilmamis)
  aksi                           → YESIL   (cikis 0)
Ekrana tek satir SEVIYE basar (state.json gun_kapanisi.seviye'den): acilis ritüelinde "hangi asama, ne bekliyor" buradan
okunur; ayrintisi ekran dosyasinda (gun-kapanisi-<tarih>.md).
Kullanim: python scripts/nlm/acilis_kapisi.py [--hedef docs/proje-takip] [--simdi ISO] [--saat 24]
"""
from __future__ import annotations
import argparse, datetime as dt, json, os, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))


def iso_utc(s):
    d = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
    return (d.replace(tzinfo=dt.timezone.utc) if d.tzinfo is None else d).astimezone(dt.timezone.utc)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--hedef", default=os.path.join("docs", "proje-takip"))
    ap.add_argument("--simdi", default=None, help="ISO UTC (test icin); vars. su an")
    ap.add_argument("--saat", type=float, default=24.0)
    a = ap.parse_args()
    hedef = a.hedef if os.path.isabs(a.hedef) else os.path.join(REPO, a.hedef)
    state_yolu = os.path.join(hedef, "state.json")
    simdi = iso_utc(a.simdi) if a.simdi else dt.datetime.now(dt.timezone.utc)
    if not os.path.exists(state_yolu):
        print(f"KIRMIZI: state.json yok ({os.path.relpath(state_yolu, REPO)}); gun kapanisi hic kosmadi"); return 3
    with open(state_yolu, encoding="utf-8") as f:
        state = json.load(f)
    g = state.get("gun_kapanisi")
    kuru = state.get("gun_kapanisi_kuru")
    if not g:
        print("KIRMIZI: state.json'da gun_kapanisi kaydi yok — gun kapanisi CANLI kosmadi"
              + (f" (yalniz KURU kayit var: {kuru.get('damga')}; kapiya sayilmaz)" if kuru else "")); return 3
    if g.get("kuru") or (g.get("seviye") or {}).get("kuru"):  # eski surum kuru bayragini yalniz seviye'ye yaziyordu (09-06 olculdu)
        print(f"KIRMIZI: gun_kapanisi kaydi KURU kosumdan ({g.get('damga')}); kapiya sayilmaz — canli kosum gerekli"); return 3
    try:
        damga = iso_utc(g["damga"])
    except (KeyError, ValueError):
        print("HATA: gun_kapanisi.damga okunamadi"); return 2
    yas = (simdi - damga).total_seconds() / 3600
    sv = g.get("seviye") or {}
    seviye = " · ".join(x for x in [
        f"Linear %{sv.get('linear_yuzde')} bitti · acik {sv.get('acik')} · bayat {sv.get('bayat_acik')} · bloklu {sv.get('bloklu_acik')} · Recep kapisi {sv.get('recep_kapisi_acik')}" + (" (BAYAT JSON)" if sv.get("linear_bayat") else ""),
        ("asama: " + " · ".join(sv["asama"])) if sv.get("asama") else "",
        f"yol haritasi {sv.get('yh_yesil')} yesil / {sv.get('yh_kirmizi')} kirmizi / {sv.get('yh_kanitsiz')} kanitsiz",
        f"defter {sv.get('defter_kaynak')}/{sv.get('defter_beklenen')} kaynak · bekleyen {sv.get('defter_bekleyen')}",
        f"sinav {sv.get('sinav_yesil')} yesil / {sv.get('sinav_kirmizi')} kirmizi",
        f"Linear ayna {sv.get('linear_ayna')}",
        f"kosum {sv.get('kosum')}"] if x)
    print(f"SEVIYE ({g['damga']}, {yas:.1f} saat once): {seviye}")
    print(f"ekran: {g.get('ekran')} · sonraki en gec: {g.get('sonraki_en_gec')}")
    if yas < -5 / 60:
        print(f"HATA: damga gelecekte ({g['damga']} > {simdi:%Y-%m-%dT%H:%M:%SZ}); damga elle yazilmis ya da saat yanlis — kapi kor"); return 2
    if yas > a.saat:
        print(f"KIRMIZI: gun kapanisi bayat ({yas:.1f} saat > {a.saat:g}); once `python scripts/nlm/gun_kapanisi.py`"); return 3
    if sv.get("kosum") == "KIRMIZI":
        print("KIRMIZI: son kapanis kirmizi adimla bitti; ekran dosyasi §6"); return 3
    if (sv.get("defter_bekleyen") or 0) > 0:
        print(f"KIRMIZI: DEFTER BAYAT — {sv['defter_bekleyen']} demet esitlenmemis"); return 3
    print(f"YESIL: gun kapanisi {yas:.1f} saat once, kosum {sv.get('kosum')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
