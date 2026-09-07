#!/usr/bin/env python3
"""YOL HARITASI → LINEAR AYNA (YH-47 'Linear ayna' bileseni; deterministik, stdlib).

Kaynak: docs/proje-takip/yol-haritasi-durum.md (yol_haritasi_dogrula.py uretir; SSOT yol-haritasi.json).
Hedef 1: Linear belgesi "VentHub Yol Haritası ve Durum" (documents; baslik onekiyle bulunur; tam bir belge beklenir —
         yoksa EKSIK, birden fazlaysa CAKISMA; ikisi de cikis 3). Icerik: "# … — AYNA" basligi + uretim notu + durum md.
Hedef 2: depo aynasi <hedef-dizin>/venthub-yol-haritasi-ve-durum.md — satir 1 "# VentHub Yol Haritası ve Durum — AYNA (…)",
         satir 3 damga (kaynak_id · kaynak_updatedAt · kopya), Linear'daki icerik BIREBIR. Deftere GIRMEZ (manifest demeti yok):
         ayni icerik yol-haritasi-durum.md ile demet 11'de zaten var (§10.2 tek kopya).
Kurallar:
  * Linear'a giden metin pano_disa_aktar.sir_suz + yol_suz'dan gecer; sir imzasi > 0 → Linear'a YAZILMAZ, cikis 3.
  * Icerik Linear'dakiyle ayniysa documentUpdate CAGRILMAZ (updatedAt bosuna oynamaz).
  * --kuru: Linear'a YAZILMAZ; ayna dosyasi Linear'daki MEVCUT icerikten uretilir; 'Linear kopyasi bayat mi' olculur
    (KURU-ayni / KURU-BAYAT). Canli: farkliysa yazilir, belge yeniden okunur (updatedAt), ayna dosyasi yazilir.
  * Ayna dosyasinin icerigi (kopya damgasi maskelenerek) mevcutla ayniysa dosyaya dokunulmaz.
Kullanim: python scripts/nlm/yol_haritasi_ayna.py [--durum <md>] [--hedef-dizin DIR] [--simdi ISO] [--tarih YYYY-MM-DD] [--kuru]
Cikti satiri: "OZET: linear <ayni|yazildi|KURU-ayni|KURU-BAYAT> · ayna <yol> · sir N · yol N · kaynak_updatedAt <…>"
Cikis: 0 · 1 anahtar yok / Linear hatasi · 3 belge yok / birden fazla / sir imzasi / documentUpdate basarisiz.
"""
from __future__ import annotations
import argparse, datetime as dt, io, json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)
from linear_disa_aktar import anahtar, iso_utc, sorgu as _sorgu  # noqa: E402
from pano_disa_aktar import sir_suz, yol_suz  # noqa: E402

REPO = os.path.abspath(os.path.join(BURASI, "..", ".."))
VARSAYILAN_DURUM = os.path.join(REPO, "docs", "proje-takip", "yol-haritasi-durum.md")
VARSAYILAN_HEDEF = os.path.join(REPO, "docs", "proje-takip", "linear")
BASLIK_ONEK = "VentHub Yol Haritas"   # 'ı' Linear'da Unicode; onek ASCII kismiyla eslesir
AYNA_BASLIK = "# VentHub Yol Haritası ve Durum — AYNA"
LISTE = """
query($after: String) {
  documents(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes { id title updatedAt project { name } }
  }
}
"""
BELGE = "query($id: String!) { document(id: $id) { id title updatedAt content } }"
GUNCELLE = """
mutation($id: String!, $content: String!) { documentUpdate(id: $id, input: { content: $content }) { success document { id updatedAt } } }
"""
DAMGA = re.compile(r"^<!-- kaynak_id: (\S+) · kaynak_updatedAt: (\S+) · kopya: (\S+) -->\s*$", re.M)


def sorgu(key, query, variables):
    j = _sorgu(key, variables, query=query)
    if "errors" in j:
        sys.exit("Linear hatasi: " + json.dumps(j["errors"], ensure_ascii=False)[:300])
    return j["data"]


def belgeyi_bul(key):
    after, out = None, []
    while True:
        blk = sorgu(key, LISTE, {"after": after})["documents"]
        out += [n for n in blk["nodes"] if (n.get("title") or "").startswith(BASLIK_ONEK)]
        if not blk["pageInfo"]["hasNextPage"]:
            break
        after = blk["pageInfo"]["endCursor"]
    return out


def linear_icerik(durum_metni: str) -> str:
    """Linear belgesine giden metin: AYNA basligi + uretim notu + durum md (oldugu gibi)."""
    L = [AYNA_BASLIK, "",
         "**Bu belge üretilmiş bir aynadır; elle düzenlenmez.** Kaynak: repo `docs/proje-takip/yol-haritasi.json` → "
         "`docs/proje-takip/yol-haritasi-durum.md` (`scripts/nlm/yol_haritasi_dogrula.py`); gün kapanışı "
         "(`scripts/nlm/gun_kapanisi.py` adım 11 → `scripts/nlm/yol_haritasi_ayna.py`) yeniler. Çelişirse repo dosyası kazanır. "
         "Renk KANITTAN türer: YEŞİL = kanıtlar bekleneni verdi · KIRMIZI = belge çelişkisi ya da karar değişti · KANITSIZ = borç · "
         "YEŞİL* = bir kısmı ölçülemedi. \"durum\" sütunu beyandır, renk beyanın kanıtıdır.", ""]
    return "\n".join(L) + "\n" + durum_metni.replace("\r\n", "\n").rstrip("\n") + "\n"


def ayna_metni(d: dict, icerik: str, tarih: str, kopya: str) -> str:
    L = [f"# VentHub Yol Haritası ve Durum — AYNA (Linear belgesinin dışa aktarımı · {tarih})", "",
         f"<!-- kaynak_id: {d['id']} · kaynak_updatedAt: {d['updatedAt']} · kopya: {kopya} -->",
         "<!-- Tazelik yalnız yukarıdaki damgayla ölçülür. Tek kopya: yol-haritasi-durum.md deftere gider, bu dosya gitmez (aynı içerik; YH-47 kanıtı). -->", "",
         "> SSOT: docs/proje-takip/yol-haritasi.json → yol-haritasi-durum.md. Bu dosya Linear'daki AYNA belgesinin kopyasıdır; Linear ile repo çelişirse repo kazanır.", ""]
    return "\n".join(L) + "\n" + icerik.replace("\r\n", "\n").rstrip("\n") + "\n"


def maskele(metin: str) -> str:
    return DAMGA.sub(lambda m: f"<!-- kaynak_id: {m.group(1)} · kaynak_updatedAt: {m.group(2)} · kopya: <KOPYA> -->", metin)


def rel(p: str) -> str:
    ap = os.path.abspath(p)
    for kok, onek in ((REPO, ""), (os.path.expanduser("~"), "~/")):
        if ap.lower().startswith(os.path.abspath(kok).lower()):
            return onek + os.path.relpath(ap, kok).replace("\\", "/")
    return ap.replace("\\", "/")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--durum", default=VARSAYILAN_DURUM)
    ap.add_argument("--hedef-dizin", default=VARSAYILAN_HEDEF)
    ap.add_argument("--simdi", default=None)
    ap.add_argument("--tarih", default=None)
    ap.add_argument("--kuru", action="store_true", help="Linear'a yazma; ayna dosyasi Linear'daki mevcut icerikten")
    a = ap.parse_args()
    simdi = iso_utc(a.simdi) if a.simdi else dt.datetime.now(dt.timezone.utc)
    kopya = simdi.strftime("%Y-%m-%dT%H:%MZ")
    tarih = a.tarih or simdi.strftime("%Y-%m-%d")
    if not os.path.exists(a.durum):
        print(f"HATA: durum md yok: {rel(a.durum)}"); return 3
    with io.open(a.durum, encoding="utf-8") as f:
        durum = f.read()
    yeni, y = yol_suz(linear_icerik(durum))
    yeni, s = sir_suz(yeni)
    key = anahtar()
    adaylar = belgeyi_bul(key)
    if not adaylar:
        print(f"EKSIK: Linear'da '{BASLIK_ONEK}…' baslikli belge yok"); return 3
    if len(adaylar) > 1:
        print("CAKISMA: birden fazla belge: " + " · ".join(f"{n['title']} ({n['id'][:8]}…)" for n in adaylar)); return 3
    d = sorgu(key, BELGE, {"id": adaylar[0]["id"]})["document"]
    mevcut = (d.get("content") or "").replace("\r\n", "\n")
    ayni = mevcut.rstrip("\n") == yeni.rstrip("\n")
    if s:
        print(f"SIR: Linear'a giden metinde sir imzasi {s}; yazilmadi (yol-haritasi-durum.md / yol-haritasi.json temizlenmeli)")
        print(f"OZET: linear SIR · ayna - · sir {s} · yol {y} · kaynak_updatedAt {d['updatedAt']}")
        return 3
    if a.kuru:
        durum_l = "KURU-ayni" if ayni else "KURU-BAYAT"
        icerik = mevcut
        print(f"  kuru     Linear belge {d['id'][:8]}… {'ayni' if ayni else 'FARKLI (bayat; canli kosum yazar)'} · updatedAt {d['updatedAt']}")
    elif ayni:
        durum_l, icerik = "ayni", mevcut
        print(f"  ayni     Linear belge {d['id'][:8]}… guncel · updatedAt {d['updatedAt']}")
    else:
        r = sorgu(key, GUNCELLE, {"id": d["id"], "content": yeni})["documentUpdate"]
        if not r.get("success"):
            print("HATA: documentUpdate basarisiz"); return 3
        d = sorgu(key, BELGE, {"id": d["id"]})["document"]
        icerik = (d.get("content") or "").replace("\r\n", "\n")
        durum_l = "yazildi"
        print(f"  yazildi  Linear belge {d['id'][:8]}… · updatedAt {d['updatedAt']} · {len(yeni.encode('utf-8'))} bayt")
    os.makedirs(a.hedef_dizin, exist_ok=True)
    yol = os.path.join(a.hedef_dizin, "venthub-yol-haritasi-ve-durum.md")
    metin = ayna_metni(d, icerik, tarih, kopya)
    if os.path.exists(yol):
        with io.open(yol, encoding="utf-8") as f:
            eski = f.read()
        if maskele(eski) == maskele(metin):
            print(f"  ayni     ayna dosyasi degismedi ({rel(yol)})")
            print(f"OZET: linear {durum_l} · ayna {rel(yol)} · sir {s} · yol {y} · kaynak_updatedAt {d['updatedAt']}")
            return 0
    with io.open(yol, "w", encoding="utf-8", newline="\n") as f:
        f.write(metin)
    print(f"  yazildi  ayna dosyasi {rel(yol)} ({len(metin.encode('utf-8'))} bayt)")
    print(f"OZET: linear {durum_l} · ayna {rel(yol)} · sir {s} · yol {y} · kaynak_updatedAt {d['updatedAt']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
