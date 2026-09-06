#!/usr/bin/env python3
"""Linear "Kararlar — *" belgelerinin depo aynasi (deterministik, stdlib).

Kaynak: Linear GraphQL API `documents` (baslik "Kararlar" ile baslayanlar) + `document(id).content`.
Anahtar linear_disa_aktar.anahtar() ile alinir (LINEAR_API_KEY ortam degiskeni, yoksa HKCU\\Environment);
hicbir ciktiya yazilmaz. HTTP/ag hatasi okunur tek satirdir (traceback yok, govde basilmaz).

Cikti (varsayilan docs/proje-takip/linear/): kararlar-<slug>-<tarih>.md — baslik + damga satiri mevcut ayna
dosyalariyla BIREBIR:
  satir 1  # Kararlar — <Proje adi> (Linear belgesinin TAM dışa aktarımı · <tarih> ayna: K1–<son K>)
  satir 3  <!-- kaynak_id: <id> · kaynak_updatedAt: <Linear updatedAt> · kopya: <YYYY-MM-DDTHH:MMZ> -->
  satir 4  <!-- Tazelik yalnız yukarıdaki damgayla ölçülür ... -->
  satir 6  > Karar SSOT'u Linear'dır; ...
  satir 8+ Linear `content` BIREBIR; yalniz is baglantilari duz metne cevrilir:
           [REC-nn](https://linear.app/...) → REC-nn   ve   <issue id=… href=…>REC-nn</issue> → REC-nn
           (2026-09-06 olculdu: Linear icerigi markdown baglanti bicimini kullaniyor; donusum taze Katalog aynasini
           bayt-ayni yeniden uretti.)

Kurallar:
  * Kapsam: BEKLENEN tablosu belge ID'siyle (baslik degil — Linear'da baslik degisince belge sessizce 'kapsam disi'
    olup ayna bayat kaliyordu; 09-06 bulgusu). ID bulunamazsa "EKSIK <slug>" satiri + cikis 3.
    Diger "Kararlar — *" belgeleri --tumu ile alinir (slug baslik'tan turetilir); yoksa "atlandi" diye basilir.
  * SIR SUZGECI (repo PUBLIC): govde pano_disa_aktar.sir_suz + yol_suz'dan gecer; sir imzasi > 0 ise DOSYA YAZILMAZ
    ("SIR <slug>" satiri, cikis 3; Linear'da temizlenir). Makine yolu (~/) sessizce donusturulur, sayisi OZET'te.
  * TEK KOPYA: ayni slug'in farkli tarihli eski dosyalari silinir — glob TARIH kalibina bagli
    (kararlar-<slug>-YYYY-MM-DD.md; 'seo' 'seo-ve-yayin'i yakalamaz) ve yalniz kaynak_id == belge id olan dosya
    silinir; farkli id'li / damgasiz dosya "yabanci" diye basilir, DOKUNULMAZ.
  * AYNI: mevcut dosya, 'kopya' degeri maskelenerek TUM METIN uzerinden karsilastirilir (baslik blogu dahil; eski
    surum yalniz govdeye bakiyordu ve 6. satir farki hic yenilenmiyordu). Ayniysa dosyaya DOKUNULMAZ.
  * CAKISMA: iki belge ayni slug'a duserse "CAKISMA" + cikis 3 (sessiz ezme yok). Siralama (title, id) → deterministik.
  * --simdi ISO ile kopya damgasi sabitlenir; 'Z'siz girdi UTC sayilir (yerel saat degil).
  * K araligi sayisal min–max; numarasiz "## K —" basliklari sayilir ve uyari basilir (Linear'da duzeltilir).

Kullanim: python scripts/nlm/kararlar_disa_aktar.py [--tarih YYYY-MM-DD] [--hedef-dizin DIR] [--simdi ISO] [--tumu]
Cikti satiri: "OZET: belge N · yazildi N · silindi N · ayni N · kapsam disi N · eksik N · sir N · yol N · yabanci N · kopya damgasi X"
Cikis kodu: 0 basari · 1 anahtar yok / Linear hatasi · 3 eksik belge / sir imzasi / slug cakismasi.
Cetvel: docs/standards/proje-takip-defteri-standard.md §10.1, §10.2, §10.7
"""
from __future__ import annotations
import argparse, datetime as dt, glob, io, json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)
from linear_disa_aktar import anahtar, iso_utc, sorgu as _sorgu  # noqa: E402  (anahtar: ortam ya da HKCU; deger basilmaz)
from pano_disa_aktar import sir_suz, yol_suz  # noqa: E402

REPO = os.path.abspath(os.path.join(BURASI, "..", ".."))
VARSAYILAN_HEDEF = os.path.join(REPO, "docs", "proje-takip", "linear")

# Linear belge ID → dosya slug'i (mevcut ayna dosya adlariyla AYNI; kapsam OPS karari, --tumu ile genisler).
# ID'ler 2026-09-06 GraphQL documents sorgusundan olculdu.
BEKLENEN = {
    "061e6113-0f57-4296-a327-4e0f1a07cd76": "vitrin-15a",          # Kararlar — Vitrin 15A
    "9e95d258-98a2-4c51-9a2d-40576c87a7bf": "kurumsal-belgeler",   # Kararlar — Kurumsal Belgeler
    "935079bf-b265-49d2-854a-a334abea07af": "katalog",             # Kararlar — Katalog ve Ürün Verisi
}
LISTE = """
query($after: String) {
  documents(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes { id title updatedAt slugId project { name } }
  }
}
"""
BELGE = """
query($id: String!) { document(id: $id) { id title updatedAt content project { name } } }
"""
LINK = re.compile(r"\[(REC-\d+)\]\(https://linear\.app/[^)\s]*\)")
ISSUE_TAG = re.compile(r"<issue\b[^>]*>\s*(REC-\d+)\s*</issue>")
K_BASLIK = re.compile(r"^#{2,3}\s+(K(\d+)[0-9A-Za-z.\-]*)", re.M)
K_NUMARASIZ = re.compile(r"^#{2,3}\s+K\s*[—–-]", re.M)
DAMGA = re.compile(r"^<!-- kaynak_id: (\S+) · kaynak_updatedAt: (\S+) · kopya: (\S+) -->\s*$", re.M)
PROJE_EK = re.compile(r"\s*\(DESIGN-[^)]*\)\s*$")
TR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
TARIH_GLOB = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]"
KOPYA_MASKE = "<KOPYA>"


def sorgu(key, query, variables):
    j = _sorgu(key, variables, query=query)  # HTTP/ag hatasi orada okunur mesajla cikar (anahtar basilmaz)
    if "errors" in j:
        sys.exit("Linear hatasi: " + json.dumps(j["errors"], ensure_ascii=False)[:300])
    return j["data"]


def belgeleri_listele(key):
    after, out = None, []
    while True:
        blk = sorgu(key, LISTE, {"after": after})["documents"]
        out.extend(blk["nodes"])
        if not blk["pageInfo"]["hasNextPage"]:
            break
        after = blk["pageInfo"]["endCursor"]
    return out


def duzlestir(icerik: str) -> str:
    """Linear is baglantilarini duz 'REC-nn' metnine cevir; CR → LF. Baska hicbir sey degismez."""
    t = (icerik or "").replace("\r\n", "\n").replace("\r", "\n")
    t = ISSUE_TAG.sub(r"\1", t)
    return LINK.sub(r"\1", t)


def slugla(baslik: str) -> str:
    t = re.sub(r"^Kararlar\s*[—–-]\s*", "", baslik).translate(TR).lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", t)).strip("-") or "belge"


def proje_adi(d: dict) -> str:
    p = ((d.get("project") or {}).get("name")) or re.sub(r"^Kararlar\s*[—–-]\s*", "", d["title"])
    return PROJE_EK.sub("", p).strip()


def k_araligi(govde: str) -> str:
    """Sayisal min–max (belge sirasi degil): en kucuk numarali ve en buyuk numarali (esitlikte belgede sonraki, orn K17-b)
    basligin TAM adi; numarasiz '## K —' basliklari sayilmaz (ayri uyari)."""
    k = [(int(n), i, ad) for i, (ad, n) in enumerate(K_BASLIK.findall(govde))]
    if not k:
        return "K yok"
    return f"{min(k)[2]}–{max(k)[2]}"


def ayna_metni(d: dict, govde: str, tarih: str, kopya: str) -> str:
    L = [
        f"# Kararlar — {proje_adi(d)} (Linear belgesinin TAM dışa aktarımı · {tarih} ayna: {k_araligi(govde)})",
        "",
        f"<!-- kaynak_id: {d['id']} · kaynak_updatedAt: {d['updatedAt']} · kopya: {kopya} -->",
        "<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->",
        "",
        "> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.",
        "",
    ]
    return "\n".join(L) + "\n" + govde + ("" if govde.endswith("\n") else "\n")


def maskele(metin: str) -> str:
    """'kopya: <deger>' maskelenir; geri kalan TUM metin karsilastirmaya girer."""
    return DAMGA.sub(lambda m: f"<!-- kaynak_id: {m.group(1)} · kaynak_updatedAt: {m.group(2)} · kopya: {KOPYA_MASKE} -->", metin)


def mevcut_aynalar(hedef: str, slug: str) -> dict:
    """{yol: (kaynak_id, kaynak_updatedAt, kopya, metin)} — yalniz kararlar-<slug>-YYYY-MM-DD.md; damgasiz dosya (None, None, None, metin)."""
    out = {}
    for p in sorted(glob.glob(os.path.join(hedef, f"kararlar-{slug}-{TARIH_GLOB}.md"))):
        with io.open(p, encoding="utf-8") as f:
            metin = f.read()
        m = DAMGA.search(metin)
        out[p] = (m.group(1), m.group(2), m.group(3), metin) if m else (None, None, None, metin)
    return out


def rel(p: str) -> str:
    """Depo ici → depoya gore; ev dizini → '~/…' (makine yolu basilmaz, INV-MUTLAK-YOL-1)."""
    ap = os.path.abspath(p)
    for kok, onek in ((REPO, ""), (os.path.expanduser("~"), "~/")):
        if ap.lower().startswith(os.path.abspath(kok).lower()):
            return onek + os.path.relpath(ap, kok).replace("\\", "/")
    return ap.replace("\\", "/")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--tarih", default=None)
    ap.add_argument("--hedef-dizin", default=VARSAYILAN_HEDEF)
    ap.add_argument("--simdi", default=None, help="ISO UTC; kopya damgasi buradan (determinizm); 'Z'siz girdi UTC sayilir")
    ap.add_argument("--tumu", action="store_true", help="BEKLENEN tablosu disindaki Kararlar belgelerini de al")
    a = ap.parse_args()
    simdi = iso_utc(a.simdi) if a.simdi else dt.datetime.now(dt.timezone.utc)
    kopya = simdi.strftime("%Y-%m-%dT%H:%MZ")
    tarih = a.tarih or simdi.strftime("%Y-%m-%d")
    hedef = os.path.abspath(a.hedef_dizin)
    os.makedirs(hedef, exist_ok=True)

    key = anahtar()
    belgeler = sorted((n for n in belgeleri_listele(key) if (n.get("title") or "").startswith("Kararlar")), key=lambda n: (n["title"], n["id"]))
    yazildi = ayni = silindi = kapsam_disi = eksik = sir_toplam = yol_toplam = yabanci = 0
    gorulen_slug: dict[str, str] = {}
    bulunan_id = set()
    for n in belgeler:
        slug = BEKLENEN.get(n["id"]) or (slugla(n["title"]) if a.tumu else None)
        if slug is None:
            kapsam_disi += 1
            print(f"  atlandi  {n['title']} (kapsam disi; --tumu ile alinir; Linear {n['updatedAt']})")
            continue
        if slug in gorulen_slug:
            print(f"  CAKISMA  {slug:<18} iki belge ayni slug'a dusuyor: {gorulen_slug[slug][:8]}… ve {n['id'][:8]}… (Linear {n['updatedAt']})")
            sys.exit(3)
        gorulen_slug[slug] = n["id"]
        bulunan_id.add(n["id"])
        d = sorgu(key, BELGE, {"id": n["id"]})["document"]
        govde = duzlestir(d.get("content") or "")
        govde, y = yol_suz(govde)
        govde, s = sir_suz(govde)
        yol_toplam += y
        sir_toplam += s
        if not govde.endswith("\n"):
            govde += "\n"
        numarasiz = len(K_NUMARASIZ.findall(govde))
        if numarasiz:
            print(f"  uyari    {slug:<18} numarasiz K basligi {numarasiz} ('## K —'; Linear'da numaralanmali, aralik eksik gosterir)")
        mevcut = mevcut_aynalar(hedef, slug)
        if s:
            print(f"  SIR      {slug:<18} yazilmadi (sir imzasi {s}; Linear'da temizle) (Linear {d['updatedAt']})")
            continue  # mevcut dosyalara dokunulmaz (eski ayna kalir; adim KIRMIZI)
        yeni_metin = ayna_metni(d, govde, tarih, kopya)
        ayni_yol = next((p for p in sorted(mevcut, reverse=True)
                         if mevcut[p][0] == d["id"] and mevcut[p][1] == d["updatedAt"] and maskele(mevcut[p][3]) == maskele(yeni_metin)), None)
        if ayni_yol:
            ayni += 1
            print(f"  ayni     {slug:<18} TAZE (Linear {d['updatedAt']} = kaynak_updatedAt; kopya {mevcut[ayni_yol][2]}; {rel(ayni_yol)})")
            tutulan = ayni_yol
        else:
            yol = os.path.join(hedef, f"kararlar-{slug}-{tarih}.md")
            onceki = sorted((v[1] or "damgasiz") for v in mevcut.values() if v[0] == d["id"] or v[0] is None)
            with io.open(yol, "w", encoding="utf-8", newline="\n") as f:
                f.write(yeni_metin)
            yazildi += 1
            durum = "BAYAT→YENILENDI" if mevcut else "YENI"
            print(f"  yazildi  {slug:<18} {durum} (Linear {d['updatedAt']} · onceki kopya kaynak_updatedAt {', '.join(onceki) or '-'} · {k_araligi(govde)}; {rel(yol)})")
            tutulan = yol
        for p in sorted(mevcut):
            if os.path.abspath(p) == os.path.abspath(tutulan):
                continue
            if mevcut[p][0] != d["id"]:  # farkli belgenin ya da damgasiz elle yazilmis dosya: ASLA silinmez
                yabanci += 1
                print(f"  yabanci  {slug:<18} {rel(p)} (kaynak_id {'yok' if mevcut[p][0] is None else 'farkli'}; dokunulmadi)")
                continue
            os.remove(p)
            silindi += 1
            print(f"  silindi  {slug:<18} {rel(p)} (tek kopya)")
    for bid, slug in BEKLENEN.items():
        if bid not in bulunan_id:
            eksik += 1
            print(f"  EKSIK    {slug:<18} Linear'da bulunamadi (beklenen id {bid[:8]}…; belge silindi/tasindi ya da baslik artik 'Kararlar' ile baslamiyor) (Linear -)")
    print(f"OZET: belge {len(belgeler) - kapsam_disi} · yazildi {yazildi} · silindi {silindi} · ayni {ayni} · kapsam disi {kapsam_disi} · eksik {eksik} · sir {sir_toplam} · yol {yol_toplam} · yabanci {yabanci} · kopya damgasi {kopya}")
    return 3 if (eksik or sir_toplam) else 0


if __name__ == "__main__":
    sys.exit(main())
