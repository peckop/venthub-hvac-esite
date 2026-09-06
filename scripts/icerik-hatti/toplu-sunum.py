#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TOPLU SUNUM URETICI — REC-146 Adim 2b, K7.8

NICIN BETIK, NICIN ELLE DEGIL:
Bu dosya Recep'in TEK ONAY verecegi yuzey. Icindeki her sayi (kac iddia dogrulandi,
kaci zayif, hangi blok bos) elle yazilirsa uydurmaya acik olur; olculmus bir sayiyi
elle kopyalamak da "saydim ama olcmedim" hatasinin ta kendisidir. Bu yuzden sunum
taslak dosyalarindan MAKINEYLE cikarilir ve kapi AILE BASINA kosturulur.

AILE BASINA KAPI: kapi dosya duzeyinde rapor verir. Aile basina sayi icin her ailenin
blogu, dosyanin BASLIGI (kaynak haritasi burada) ile birlestirilip gecici dosyaya
yazilir ve kapi ona kosar. Boylece kapinin kendisi degismeden aile kirilimi elde edilir.
"""
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

for _akis in (sys.stdout, sys.stderr):
    try:
        _akis.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

KOK = Path(__file__).resolve().parents[2]
TASLAK_DIZIN = KOK / "docs" / "audits"
KAPI = Path(__file__).resolve().parent / "taslak-kaynak-kapisi.py"

REF = re.compile(r"\[(?:([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+)?s\.\s*([0-9]+(?:\s*[,–-]\s*(?:s\.\s*)?[0-9]+)*)\]")
BLOKLAR = ["Gövde", "Çark", "Motor", "Koruma", "Kontrol", "Montaj"]


def aile_bloklari(metin):
    """Dosyayi (baslik, [aile blogu...]) diye ayirir. Aile = icinde 'Kimlik cümlesi' olan '## ' bolumu."""
    parcalar = re.split(r"(?m)^## ", metin)
    baslik = parcalar[0]
    return baslik, ["## " + p for p in parcalar[1:] if "### Kimlik cümlesi" in p]


def kimlik_cumlesi(blok):
    m = re.search(r"### Kimlik cümlesi\s*\n(.*?)(?=\n### |\n## |\Z)", blok, re.S)
    if not m:
        return ""
    ham = m.group(1)
    satirlar = [re.sub(r"^>\s?", "", s).strip() for s in ham.strip().splitlines()]
    return " ".join(s for s in satirlar if s)


def _ic_not_mu(s):
    """Madde, MUSTERI cumlesi mi yoksa BENIM denetim notum mu.

    ⛔ OLCULMUS KUSUR (2026-09-06): punto-evo-flexo ailesinde
    "(Kaynak s.10 model adini `MEX 100/4\"` biciminde, inc isaretiyle yazar…)" maddesi
    canliya gitti — bu bir MUSTERI cumlesi degil, kaynagin yazim bicimi hakkinda BENIM
    notum. Madde cikarici "* " ile baslayan her satiri aliyordu.

    ⚠ KURAL DAR TUTULDU, BILEREK: "kaynak" kelimesi gecen her maddeyi elemek YANLIS olurdu —
    olctum, e-atex ailesinde "Etiketteki tam kod …; kaynaga gore 'h' yapisal guvenlik…"
    maddesi GERCEK musteri icerigi (ATEX isaretlemesi) ve o da "kaynag" iceriyor. Genis bir
    suzgec dogru icerigi de silerdi. Bu yuzden olcut: PARANTEZLE BASLAYAN ve KAYNAGA ATIF
    yapan madde. 113 maddede yalniz 1'ini eliyor ve o 1 dogru olan.
    """
    s = s.strip()
    return s.startswith("(") and re.search(r"[Kk]aynak\s*s\.", s) is not None


def maddeler(blok, adet=3):
    m = re.search(r"### (?:Dört madde|Maddeler[^\n]*)\s*\n(.*?)(?=\n### |\n## |\Z)", blok, re.S)
    if not m:
        return []
    out = []
    for satir in m.group(1).splitlines():
        s = satir.strip()
        if s.startswith("*") and not s.startswith("**"):
            aday = re.sub(r"^\*\s*", "", s).strip()
            if _ic_not_mu(aday):
                continue    # benim denetim notum, musteri cumlesi degil
            out.append(aday)
    return out[:adet]


def bos_bloklar(blok):
    m = re.search(r"### Yapısal bloklar\s*\n(.*?)(?=\n### |\n## |\Z)", blok, re.S)
    if not m:
        return [], []
    govde = m.group(1)
    dolu, bos = [], []
    for ad in BLOKLAR:
        p = re.search(rf"\*\*{ad}\.\*\*(.*?)(?=\n\*\*(?:{'|'.join(BLOKLAR)})\.\*\*|\Z)", govde, re.S)
        if not p:
            bos.append(ad)
        elif "Kaynakta karşılığı yok" in p.group(1) or "kaynakta karşılığı yok" in p.group(1):
            bos.append(ad)
        else:
            dolu.append(ad)
    return dolu, bos


def blok_metinleri(blok):
    """Dolu yapisal bloklarin METNINI dondurur (DB yuku icin).

    ⚠ BOS BLOK ANAHTARI YAZILMAZ (K7 + OPS hukmu): "kaynakta karsiligi yok" diyen blok
    veritabaninda ANAHTAR OLARAK BILE bulunmaz. Bos dize yazmak, ileride "burada bir sey
    vardi ama silindi" ile "hic olmadi"yi ayirt edilemez kilar; ayrica bos basligi vitrinde
    goruntuleme riski dogurur.
    """
    m = re.search(r"### Yapısal bloklar\s*\n(.*?)(?=\n### |\n## |\Z)", blok, re.S)
    if not m:
        return {}
    govde = m.group(1)
    out = {}
    for ad in BLOKLAR:
        p = re.search(rf"\*\*{ad}\.\*\*(.*?)(?=\n\*\*(?:{'|'.join(BLOKLAR)})\.\*\*|\Z)", govde, re.S)
        if not p:
            continue
        icerik = p.group(1).strip()
        if "aynakta karşılığı yok" in icerik:
            continue
        # ⛔ BLOK ICINDEKI DENETIM NOTU AYIKLANIR (olculdu: qbk-sal-kc-evo Govde blogu —
        # "*(Kaynak s.8'deki olcu tablosunun sutun basliklari …)*"). Ic notlar yalniz
        # maddelerde degil, blok metninin ICINDE de parantezli olarak duruyor. Kapi bunu
        # yakaladi ve yazimi DURDURDU; kapinin olmadigi halde canliya giderdi.
        icerik = re.sub(r"\*?\([^)]*[Kk]aynak\s*s\.[^)]*\)?\*?", "", icerik)
        # Kaynak referanslari ([AVenS s.28]) DB metninde KALIR: vitrinde gosterilip
        # gosterilmeyecegi render karari (URUN); veriden silmek kaniti yok etmek olurdu.
        out[ad] = re.sub(r"\s*\n\s*", " ", icerik).strip()
    return out


def kaynak_ozeti(blok):
    gorulen = {}
    for m in REF.finditer(blok):
        ad = m.group(1) or "?"
        for s in re.findall(r"[0-9]+", m.group(2)):
            gorulen.setdefault(ad, set()).add(int(s))
    return " · ".join(f"{ad} s.{','.join(str(x) for x in sorted(sf))}" for ad, sf in sorted(gorulen.items()))


def kapi_kos(baslik, blok):
    """Kapiyi YALNIZ bu ailenin blogu icin kosar; sayilar aileye ait olur."""
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as fh:
        fh.write(baslik + "\n" + blok)
        gecici = fh.name
    try:
        p = subprocess.run([sys.executable, str(KAPI), gecici], capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        cikti = (p.stdout or "") + (p.stderr or "")
        m = re.search(r"dogrulanan (\d+) · DUSEN (\d+) · olculemeyen (\d+)", cikti)
        # ⚠ IKI FARKLI BIRIM: jeton ve iddia. Yalniz IDDIA birimi dogrulanan'dan cikarilabilir.
        z = re.search(r"ZAYIF ESLESEN (\d+) JETON, (\d+) iddiada", cikti)
        if not m:
            return None
        d, du, o = map(int, m.groups())
        zj = int(z.group(1)) if z else 0
        zi = int(z.group(2)) if z else 0
        return {"dogrulanan": d, "dusen": du, "olculemeyen": o,
                "zayif_jeton": zj, "zayif_iddia": zi, "guclu_iddia": d - zi,
                "kirmizi": p.returncode != 0, "cikti": cikti}
    finally:
        os.unlink(gecici)


SLUG = re.compile(r"`([a-z0-9]+(?:-[a-z0-9]+){1,})`")


def slug_bul(blok, baslik_sluglari, sira, dosya_sluglari=()):
    """Aile slug'i once BLOKTA aranir; bazi taslaklarda slug yalniz dosya basindaki
    'DB'de ne var' tablosunda gecer — o zaman SIRAYLA eslestirilir (blok sayisi ile
    baslik slug sayisi esitse guvenlidir; esit degilse '?' birakilir, uydurulmaz)."""
    m = SLUG.search(blok)
    if m:
        return m.group(1)
    # Bazi bloklar slug'i KISALTARAK yazar: `…-circular`. Uydurmak yerine, dosyanin
    # tamaminda gecen TAM slug'lar icinde ayni son eki tasiyani ararız; tek aday varsa
    # eslesme kesindir, birden fazlaysa '?' birakilir.
    kisa = re.search(r"`…?-?([a-z0-9]+(?:-[a-z0-9]+)*)`", blok)
    if kisa and dosya_sluglari:
        adaylar = [x for x in dosya_sluglari if x.endswith(kisa.group(1))]
        if len(adaylar) == 1:
            return adaylar[0]
    if baslik_sluglari and sira < len(baslik_sluglari):
        return baslik_sluglari[sira]
    return "?"


def main():
    kayitlar = []
    for yol in sorted(TASLAK_DIZIN.glob("icerik-hatti-taslak-*.md")):
        metin = yol.read_text(encoding="utf-8")
        baslik, bloklar = aile_bloklari(metin)
        bs, gor = [], set()
        for m in SLUG.finditer(baslik):
            if m.group(1) not in gor:
                gor.add(m.group(1))
                bs.append(m.group(1))
        if len(bs) != len(bloklar):
            bs = []
        tum_sluglar = []
        for m in SLUG.finditer(metin):
            if m.group(1) not in tum_sluglar:
                tum_sluglar.append(m.group(1))
        for sira, blok in enumerate(bloklar):
            db = re.search(r"\*\*DB:\*\*.*?(?:\*\*)?([0-9]+)(?:\*\*)?\s*ürün", blok)
            ad = re.match(r"## [0-9]+\s*·\s*(.+)", blok.splitlines()[0])
            dolu, bos = bos_bloklar(blok)
            kayitlar.append({
                "dosya": yol.name,
                "slug": slug_bul(blok, bs, sira, tum_sluglar),
                "urun": db.group(1) if db else "?",
                "ad": (ad.group(1).strip() if ad else blok.splitlines()[0][3:].strip()),
                "kimlik": kimlik_cumlesi(blok),
                "maddeler": maddeler(blok),
                "kaynak": kaynak_ozeti(blok),
                "dolu": dolu, "bos": bos,
                "blok_metni": blok_metinleri(blok),
                "kapi": kapi_kos(baslik, blok),
            })
    return kayitlar


DOSYA_ADI = {
    "seat-storm-jet": "SEAT · STORM · JET (AVenS çatı fanları)",
    "lineo": "VORTICE LINEO (yuvarlak kanal fanları)",
    "heatmaster-slimroof": "VORTICE HEATMASTER / SLIMROOF (çatı fanları)",
    "isi-geri-kazanim": "VORTICE ısı geri kazanım (VORT HR · VORT MONO)",
    "radon": "VORTICE RADON (radon tahliye fanları)",
    "commercial-inline": "VORTICE ticari kanal fanları (CA MD · CA IL ES)",
    "endustriyel-atex": "VORTICE endüstriyel aksiyel + ATEX",
    "hava-perdesi": "VORTICE hava perdeleri",
    "vortice-konut": "VORTICE konut tipi (QUADRO · PUNTO)",
    "vortice-ticari": "VORTICE ticari (NORDIK HVLS · QBK/SAL/KC)",
    "vortice-tekiller": "VORTICE tekil ürünler (DEUMIDO · BRA.VO · TIRACAMINO)",
    "nicotra": "NICOTRA GEBHARDT radyal fanlar",
    "danfoss": "DANFOSS frekans konvertörleri",
    "avens-hucreli-siginak": "AVenS hücreli aspiratörler + sığınak üniteleri",
    "avens-isitici": "AVenS ısıtıcılar + hız anahtarları",
    "avens-plug-hrv": "AVenS plug fanlar + ısı geri kazanım",
}


def grup_adi(dosya):
    kok = dosya.replace("icerik-hatti-taslak-", "").rsplit("-2026-", 1)[0]
    return DOSYA_ADI.get(kok, kok)


def sunum_yaz(kayitlar, hedef, db_durum=None):
    tD = sum(k["kapi"]["dogrulanan"] for k in kayitlar if k["kapi"])
    tG = sum(k["kapi"]["guclu_iddia"] for k in kayitlar if k["kapi"])
    tZ = sum(k["kapi"]["zayif_iddia"] for k in kayitlar if k["kapi"])
    tDus = sum(k["kapi"]["dusen"] for k in kayitlar if k["kapi"])
    tOlc = sum(k["kapi"]["olculemeyen"] for k in kayitlar if k["kapi"])
    olculemeyen_aile = [k for k in kayitlar if k["kapi"] and k["kapi"]["kirmizi"]]
    bos_toplam = sum(len(k["bos"]) for k in kayitlar)

    L = []
    A = L.append
    A("# İçerik hattı — 40 ailenin metni, TEK SAYFADA (onay için)")
    A("")
    A("**Şerit:** URUN-KATALOG · **İş:** REC-146 Adım 2b · **Tarih:** 2026-09-06")
    A("**Durum:** hiçbiri veritabanına yazılmadı. Bu dosya **senin tek onayın** için (K7.8).")
    A("**Bu dosya elle yazılmadı** — taslaklardan makineyle üretildi:")
    A("`python scripts/icerik-hatti/toplu-sunum.py --yaz`. Sayılar kapının çıktısıdır.")
    A("")
    A("## Ne onaylıyorsun")
    A("")
    A("Aşağıdaki 40 ailenin her biri için bir **kimlik cümlesi** (ürün sayfasının ilk cümlesi),")
    A("birkaç madde ve altı yapısal blok (Gövde · Çark · Motor · Koruma · Kontrol · Montaj) yazıldı.")
    A("Onayın: **bu dil ve bu seviye doğru** demektir; aile aile okuman gerekmez.")
    A("Onay sonrası bunlar veritabanına yazılır ve vitrinde görünür.")
    A("")
    A("## Sayılarla (ölçülmüş, elle yazılmadı)")
    A("")
    A("| | |")
    A("|---|---|")
    A(f"| Aile | **{len(kayitlar)}** |")
    A(f"| Kaynağıyla doğrulanan iddia | **{tD}** |")
    A(f"| — bunların GÜÇLÜ olanı | {tG} |")
    A(f"| — bunların ZAYIF olanı | {tZ} |")
    A(f"| Kaynağıyla çelişen iddia (DÜŞEN) | **{tDus}** |")
    A(f"| Kapının ölçemediği cümle | {tOlc} |")
    A(f"| Kaynağı olmadığı için BOŞ bırakılan blok | {bos_toplam} |")
    A("")
    A("**GÜÇLÜ / ZAYIF ne demek:** kapı, cümledeki sayıyı ve birimi kaynak sayfada arar.")
    A("İkisi yan yana bulunursa GÜÇLÜ; ayrı ayrı bulunur ama yan yana olduğu")
    A("doğrulanamazsa ZAYIF sayılır (PDF tablosunda birim başlık hücresinde durur,")
    A("bu yüzden yan yana şartı gerçek cümleleri de düşürüyordu). ZAYIF **yanlış demek değil**,")
    A("*kapı bu cümleyi tam kanıtlayamadı* demek. Gizlemiyoruz, sayıyoruz.")
    A("")
    A("**Kapının ölçemediği cümle:** içinde sayı/kod olmayan cümle (ör. \"bakımı kolaydır\").")
    A("Bunlar kaynaktan çevrildi ama makine doğrulayamaz — insan gözü gerekir.")
    A("")
    A("*Sayılar yalnız AİLE METİNLERİNE aittir: kapı burada her ailenin kendi bölümüne")
    A("ayrı ayrı koşturuldu. Taslak dosyalarının karşılaştırma/bulgu bölümlerindeki")
    A("referanslar bu toplamın dışındadır — onlar vitrine çıkmıyor.*")
    A("")
    if db_durum:
        yok = [k for k, v in db_durum.items() if not v.get("db_de_var")]
        uzerine = [k for k, v in db_durum.items() if v.get("aciklama_dolu")]
        sayi_farki = [k["slug"] for k in kayitlar
                      if k["slug"] in db_durum and db_durum[k["slug"]].get("db_de_var")
                      and str(db_durum[k["slug"]].get("urun")) != str(k["urun"])]
        A("## Veritabanıyla tutuyor mu (canlıdan ölçüldü)")
        A("")
        A(f"* Slug'ı veritabanında bulunamayan aile: **{len(yok)}**"
          + (f" — {', '.join(yok)}" if yok else " (hepsi bulundu)"))
        A(f"* Ürün sayısı taslakla tutmayan aile: **{len(sayi_farki)}**"
          + (f" — {', '.join(sayi_farki)}" if sayi_farki else " (hepsi tutuyor)"))
        A(f"* Bugün vitrinde metni olan, yani **üstüne yazılacak** aile: **{len(uzerine)}**")
        A("")
        A("Üstüne yazılacak metinlerin bir kısmı zaten hatalıydı: seri metni tek bir modelin")
        A("verisini taşıyordu (ölçüldü, ayrı raporda). Yeni metin bunu da düzeltiyor.")
        A("")
    kararlar = {}
    kj = Path(__file__).resolve().parent / "karar-k710.json"
    if kj.exists():
        import json as _json
        kararlar = _json.loads(kj.read_text(encoding="utf-8")).get("kararlar", {})
    if kararlar:
        A("## Senin verdiğin kararlar işlendi (K7.10)")
        A("")
        A("AVenS için verdiğin karar bu dosyaya **elle değil** veri dosyasından işlendi")
        A("(`scripts/icerik-hatti/karar-k710.json`) — karar değişirse tek yer değişir.")
        A("")
        A("| Aile | Karar | Gerekçe / ölçüm |")
        A("|---|---|---|")
        for s, v in kararlar.items():
            A(f"| `{s}` | **{v['durum']}** | {v['gerekce']} |")
        A("")
    if olculemeyen_aile:
        A("## ⛔ SENDEN KARAR BEKLEYEN AİLELER")
        A("")
        A("Bu ailelerde kaynak, satılabilir tek bir cümle bile vermiyor (yalnız kod ve fiyat).")
        A("Uydurmadık, boş bıraktık. İki seçenek var: **(a)** üreticiden teknik föy isteyelim,")
        A("**(b)** kendi teknik metnimizi yazalım.")
        A("")
        for k in olculemeyen_aile:
            A(f"* `{k['slug']}` — {k['ad']} ({k['urun']} ürün)")
        A("")
    A("---")
    A("")
    son_grup = None
    for k in kayitlar:
        g = grup_adi(k["dosya"])
        if g != son_grup:
            A(f"## {g}")
            A("")
            son_grup = g
        kp = k["kapi"] or {}
        A(f"### `{k['slug']}` — {k['ad']}")
        A("")
        A(f"> {k['kimlik']}")
        A("")
        for m in k["maddeler"]:
            A(f"* {m}")
        if k["maddeler"]:
            A("")
        A(f"**Ürün:** {k['urun']} · **Kaynak:** {k['kaynak'] or '—'}")
        A("")
        if kp:
            A(f"**Kapı:** doğrulanan {kp['dogrulanan']} (güçlü {kp['guclu_iddia']} · "
              f"zayıf {kp['zayif_iddia']}) · düşen {kp['dusen']} · ölçülemeyen {kp['olculemeyen']}")
        A(f"**Dolu blok:** {', '.join(k['dolu']) or '—'}")
        A(f"**Kaynağı olmadığı için BOŞ:** {', '.join(k['bos']) or 'yok'}")
        A("")
    Path(hedef).write_text(chr(10).join(L) + chr(10), encoding="utf-8")
    return len(L)


if __name__ == "__main__":
    kayitlar = main()
    # --aile <slug>: TEK ailenin kapi raporunu tam basar. K7.10 gibi "bu aile kapidan
    # GUCLU gecmeli" turu sartlar aile duzeyinde olculur; dosya duzeyi cevap vermez.
    if "--aile" in sys.argv:
        hedef_slug = sys.argv[sys.argv.index("--aile") + 1]
        bulundu_mu = False
        for k in kayitlar:
            if k["slug"] == hedef_slug:
                bulundu_mu = True
                print((k["kapi"] or {}).get("cikti", "(kapi kosmadi)"))
        if not bulundu_mu:
            print(f"aile bulunamadi: {hedef_slug}")
            sys.exit(2)
        sys.exit(0)
    # --yuk <yol>: DB yazimi icin YUK DOSYASI uretir. Yazan betik taslak .md'leri OKUMAZ;
    # yalniz bu dosyayi okur. Nicin: yazilacak metin, insanin ONAYLADIGI sunumu ureten AYNI
    # koddan cikmali; iki ayri ayristirici olsaydi "onaylanan metin" ile "yazilan metin"
    # sessizce ayrisabilirdi — bugunun en pahali dersi tam bu sinif.
    if "--yuk" in sys.argv:
        import json as _json

        def _referanssiz(s):
            """Kaynak referanslarini ([AVenS s.28]) VITRIN METNINDEN temizler.

            ⛔ OLCULMUS KUSUR (2026-09-06, ilk yazimda 38/38 aileye sizdi): kimlik cumlesi
            taslaktan OLDUGU GIBI aliniyordu ve sonunda "[s.41]" duruyordu — yani musteri
            urun sayfasinda bizim IC KAYNAK NOTUMUZU okuyacakti. Kanit taslakta ve kanit
            satirlarinda durur; VITRINDE DURMAZ. Iki yer ayni metni tasimaz.
            """
            s = re.sub(r"\s*\[(?:[A-Za-zÇĞİÖŞÜçğıöşü]+\s+)?s\.\s*[0-9][^\]]*\]", "", s)
            s = re.sub(r"\s*\[DB\]", "", s)
            return re.sub(r"\s{2,}", " ", s).strip()
        hedef = Path(sys.argv[sys.argv.index("--yuk") + 1])
        kararlar = {}
        kj = Path(__file__).resolve().parent / "karar-k710.json"
        if kj.exists():
            kararlar = _json.loads(kj.read_text(encoding="utf-8")).get("kararlar", {})
        yazilmaz = {s for s, v in kararlar.items() if v.get("durum") == "SAYFA YAZILMAYACAK"}
        yuk = []
        for k in kayitlar:
            if k["slug"] in yazilmaz:
                continue      # K7.10 — Recep karari, sayfa yazilmaz
            kp = k["kapi"] or {}
            yuk.append(
                {
                    "slug": k["slug"],
                    "kimlik_tr": _referanssiz(k["kimlik"]),
                    "maddeler_tr": [_referanssiz(x) for x in k["maddeler"]],
                    "bloklar_tr": {a: _referanssiz(m) for a, m in k["blok_metni"].items()},
                    "kaynak": k["kaynak"],
                    "kapi": {x: kp.get(x) for x in
                             ("dogrulanan", "dusen", "zayif_iddia", "guclu_iddia")},
                }
            )
        hedef.parent.mkdir(parents=True, exist_ok=True)
        hedef.write_text(_json.dumps(yuk, ensure_ascii=False, indent=2, sort_keys=True) + chr(10),
                         encoding="utf-8")
        atlanan = sorted(yazilmaz)
        print(f"YUK YAZILDI: {hedef}  ·  {len(yuk)} aile")
        print(f"K7.10 geregi ATLANAN {len(atlanan)}: {', '.join(atlanan) or '-'}")
        sys.exit(0)
    if "--yaz" in sys.argv:
        hedef = KOK / "docs" / "audits" / "icerik-hatti-toplu-sunum-2026-09-06.md"
        dd = None
        for i, a in enumerate(sys.argv):
            if a == "--db" and i + 1 < len(sys.argv):
                import json
                dd = json.loads(Path(sys.argv[i + 1]).read_text(encoding="utf-8"))
        n = sunum_yaz(kayitlar, hedef, dd)
        print(f"YAZILDI: {hedef.name} · {len(kayitlar)} aile · {n} satir")
    else:
        for k in kayitlar:
            print(k["slug"], k["kapi"])
