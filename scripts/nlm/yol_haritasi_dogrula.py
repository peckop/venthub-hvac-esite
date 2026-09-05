#!/usr/bin/env python
"""YOL HARITASI DOGRULAYICI — planin test dosyasi (v1).

Recep 09-04: "kodun test dosyasi gibi planin test dosyasi olur mu?" docs/proje-takip/yol-haritasi.json her satir icin
MAKINENIN KOSABILDIGI kanit tasir; bu betik kaniti kosar, satirin rengini KANITTAN turetir ve
docs/proje-takip/yol-haritasi-durum.md ("neredeyiz" sayfasi) uretir. Durum ELLE YAZILMAZ.

Renk kurali:
  YESIL    — satirin butun kanitlari bekleneni verdi
  KIRMIZI  — en az bir kanit bekleneni VERMEDI (belge celiskisi ya da karar degisti; ikisi de gorunur)
  KANITSIZ — kanit yok ya da kosulamadi (veri/canli olculmedi) → BORC; haftalik saglik olcusu = bu sayi

Kanit turleri: anahtar (features.ts sabiti) · kod (dosya/klasor var-yok, desen) · belge (hafiza sinavi son sonucu) ·
canli (HTTP, yalniz --canli) · veri (SQL, v1'de kosulmaz → KANITSIZ).

Kullanim:
  python scripts/nlm/yol_haritasi_dogrula.py            # cevrimdisi kanitlar (kod/anahtar/belge)
  python scripts/nlm/yol_haritasi_dogrula.py --canli    # + HTTP kanitlari
Cikis: 0 kirmizi yok · 3 kirmizi var. Rapor damgasi date -u esdegeri (elle yazilmaz).
Cetvel: docs/standards/proje-takip-defteri-standard.md §9
"""
from __future__ import annotations
import json, os, re, sys, urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding="utf-8")
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
YOL = os.path.join(REPO, "docs", "proje-takip", "yol-haritasi.json")
SINAV_SONUC = os.path.join(REPO, "docs", "proje-takip", "hafiza-sinavi-sonuc.md")
DURUM = os.path.join(REPO, "docs", "proje-takip", "yol-haritasi-durum.md")


def sinav_sonuclari() -> dict[str, str]:
    """hafiza-sinavi-sonuc.md tablosundan {S01: YESIL|KIRMIZI|CEVAPSIZ}. Dosya yoksa bos."""
    if not os.path.exists(SINAV_SONUC):
        return {}
    out = {}
    for satir in open(SINAV_SONUC, encoding="utf-8"):
        m = re.match(r"\|\s*(S\d+)\s*\|\s*[^|]*\|\s*(YESIL|KIRMIZI|CEVAPSIZ)\s*\|", satir)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def kanit_kos(k: dict, sinav: dict, canli: bool):
    """(renk, aciklama). renk: YESIL | KIRMIZI | KANITSIZ."""
    t = k.get("tur")
    if t == "anahtar":
        p = os.path.join(REPO, k["dosya"])
        if not os.path.exists(p):
            return "KIRMIZI", f"anahtar dosyasi yok: {k['dosya']}"
        m = re.search(r"export\s+const\s+" + re.escape(k["sabit"]) + r"\s*=\s*([^\n;]+)", open(p, encoding="utf-8").read())
        if not m:
            return "KIRMIZI", f"sabit yok: {k['sabit']}"
        deger = m.group(1).strip()
        return ("YESIL" if deger == k["beklenen"] else "KIRMIZI"), f"{k['sabit']} = {deger} (beklenen {k['beklenen']})"
    if t == "kod":
        p = os.path.join(REPO, k["yol"])
        var = os.path.exists(p)
        if k.get("desen"):
            if not var:
                bulundu = False
            elif os.path.isdir(p):
                bulundu = any(re.search(k["desen"], open(os.path.join(d, f), encoding="utf-8", errors="ignore").read())
                              for d, _, fs in os.walk(p) for f in fs if not f.endswith((".png", ".jpg", ".webp")))
            else:
                bulundu = re.search(k["desen"], open(p, encoding="utf-8", errors="ignore").read()) is not None
            ok = bulundu == (k["beklenen"] == "var")
            return ("YESIL" if ok else "KIRMIZI"), f"{k['yol']} desen /{k['desen']}/ {'var' if bulundu else 'yok'} (beklenen {k['beklenen']})"
        ok = var == (k["beklenen"] == "var")
        return ("YESIL" if ok else "KIRMIZI"), f"{k['yol']} {'var' if var else 'yok'} (beklenen {k['beklenen']})"
    if t == "belge":
        s = sinav.get(k["sinav"])
        if s is None:
            return "KANITSIZ", f"sinav {k['sinav']} son kosumda yok"
        return ("YESIL" if s == "YESIL" else "KIRMIZI" if s == "KIRMIZI" else "KANITSIZ"), f"sinav {k['sinav']} = {s}"
    if t == "canli":
        if not canli:
            return "KANITSIZ", f"canli olculmedi (--canli yok): {k['url']}"
        try:
            req = urllib.request.Request(k["url"], headers={"User-Agent": "venthub-yol-haritasi/1"})
            with urllib.request.urlopen(req, timeout=20) as r:
                kod, govde = r.status, r.read(200000).decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            kod, govde = e.code, ""
        except Exception as e:
            return "KANITSIZ", f"canli erisilemedi: {type(e).__name__}"
        ok = kod == k.get("beklenen_durum", 200) and (k.get("icerir", "") in govde)
        return ("YESIL" if ok else "KIRMIZI"), f"{k['url']} → {kod} (beklenen {k.get('beklenen_durum', 200)})"
    if t == "veri":
        return "KANITSIZ", "veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): " + k["sql"][:60]
    return "KANITSIZ", f"bilinmeyen kanit turu: {t}"


def satir_rengi(renkler: list[str]) -> str:
    if not renkler:
        return "KANITSIZ"
    if "KIRMIZI" in renkler:
        return "KIRMIZI"
    if all(r == "YESIL" for r in renkler):
        return "YESIL"
    return "KANITSIZ" if not any(r == "YESIL" for r in renkler) else "YESIL*"  # *: bir kismi olculemedi, olculen hepsi yesil


def main(argv):
    canli = "--canli" in argv
    yol = json.load(open(YOL, encoding="utf-8"))
    satirlar = yol["satirlar"]
    if len(satirlar) > yol.get("tavan_satir", 40):
        print(f"HATA: satir sayisi {len(satirlar)} tavani ({yol['tavan_satir']}) asiyor — kirp ya da cetveli degistir")
        return 3
    sinav = sinav_sonuclari()
    damga = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    sayac, fazlar, detay = Counter(), defaultdict(list), []
    for s in satirlar:
        sonuc = [kanit_kos(k, sinav, canli) for k in s.get("kanit", [])]
        renk = satir_rengi([r for r, _ in sonuc])
        sayac[renk.rstrip("*")] += 1
        fazlar[s["faz"]].append((s, renk, sonuc))
        print(f"{renk:<9} {s['id']} [{s['faz']}] {s['durum']:<13} {s['yetenek'][:70]}")
        for r, a in sonuc:
            if r != "YESIL":
                print(f"          · {r}: {a}")
    kanitsiz_kanit = sum(1 for f in fazlar.values() for _, _, so in f for r, _ in so if r == "KANITSIZ")
    rapor = [f"# VentHub Yol Haritasi ve Durum — {damga} (uretilmis; elle duzenlenmez; kaynak yol-haritasi.json)", "",
             f"Satir {len(satirlar)}/{yol.get('tavan_satir', 40)} · YESIL {sayac['YESIL']} · KIRMIZI {sayac['KIRMIZI']} · KANITSIZ {sayac['KANITSIZ']} · "
             f"olculmemis kanit {kanitsiz_kanit} (saglik olcusu; haftalik dusmeli) · canli {'olculdu' if canli else 'OLCULMEDI'}",
             "",
             "Renk KANITTAN turer: YESIL = kanitlar bekleneni verdi · KIRMIZI = belge celiskisi YA DA karar degisti (ikisi de gorunur, biri duzeltilir) · "
             "KANITSIZ = borc · YESIL* = olculen kanitlar yesil, bir kismi olculemedi. 'durum' sutunu BEYANDIR; renk beyanin kanitidir.", ""]
    for faz in sorted(fazlar):
        rapor += [f"## {faz}", "", "| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |", "|---|---|---|---|---|---|---|---|"]
        for s, renk, sonuc in fazlar[faz]:
            kan = "<br>".join(f"{r}: {a}" for r, a in sonuc) or "— (kanit yok)"
            rapor.append(f"| {s['id']} | {renk} | {s['durum']} | {s['yetenek']} | {s['sebep']} | {s['sorumlu']} | {s['karar']} | {kan} |")
        rapor.append("")
    with open(DURUM, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(rapor))
    print(f"\nOZET: yesil {sayac['YESIL']} / kirmizi {sayac['KIRMIZI']} / kanitsiz {sayac['KANITSIZ']} · olculmemis kanit {kanitsiz_kanit} → {os.path.relpath(DURUM, REPO)}")
    return 3 if sayac["KIRMIZI"] else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
