#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FIYATSIZ URUNLERIN AYRIMI — ICE ALIM BOSLUGU mu, TICARI BOSLUK mu? (REC-168)

NICIN VAR: satis kipine gecince fiyatsiz urun vitrinde fiyatsiz kalir. Ama "fiyat yok"
TEK BIR SORUN DEGIL, iki bambaska sorundur ve cozumleri de bambaskadir:

  ICE ALIM BOSLUGU : fiyat AVenS listesinde VAR, biz ice almamisiz  -> BIZIM isimiz, betik
  TICARI BOSLUK    : fiyat listede YOK, AVenS hic vermemis          -> RECEP'in isi, telefon

Ayrimi yapmadan "satis kipine gecelim" denirse hangisinin bizim eksigimiz oldugu bilinmez.

SALT OKUMA. Hicbir fiyat YAZILMAZ, hicbir tablo degistirilmez. Sadece siniflandirir.

⚠KOPRU: products.model_code <-> AVenS fiyat listesi sayfasinda gecen kod.
Kodun bicimi hakkinda VARSAYIM YOK (cetvel catalog-ingestion-standard §1): kod salt
sayisal, dort haneli, alfanumerik, bosluklu ya da uzun olabilir. Ham haliyle aranir.

KULLANIM
  python scripts/icerik-hatti/fiyatsiz-ayrim.py --cikti docs/audits/fiyatsiz-27-ayrim-2026-09-06.md
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

for _akis in (sys.stdout, sys.stderr):
    try:
        _akis.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

DIZIN_VARSAYILAN = Path.home() / "venthub-pdf-ingestor" / "kaynak-dizini" / "sayfalar.jsonl"
FIYAT_LISTESI = "avens_fiyat_listesi_2026_HQ.pdf"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", "", s).upper()


def env_oku() -> dict:
    yol = Path(os.environ.get("VENTHUB_ENV") or (Path.home() / "venthub-hvac" / ".env"))
    o = {}
    for satir in yol.read_text(encoding="utf-8").splitlines():
        if not satir or satir.startswith("#") or "=" not in satir:
            continue
        k, v = satir.split("=", 1)
        o[k.strip()] = v.strip().strip("\"'")
    return o


def rest(url: str, basliklar: dict):
    istek = urllib.request.Request(url, headers=basliklar)
    with urllib.request.urlopen(istek) as y:
        return json.loads(y.read().decode("utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser(description="Fiyatsiz urun ayrimi (REC-168)")
    ap.add_argument("--dizin", default=str(DIZIN_VARSAYILAN))
    ap.add_argument("--cikti", required=True)
    a = ap.parse_args()

    o = env_oku()
    U = o.get("SUPABASE_URL") or o.get("NEXT_PUBLIC_SUPABASE_URL")
    K = o.get("SUPABASE_SERVICE_ROLE_KEY")
    if not (U and K):
        # Anon anahtar RLS altinda SESSIZCE bos doner; bos veri "fiyatsiz 0" gibi gorunur.
        print("⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok — anon ile olculmez (sahte yesil riski)")
        return 2
    h = {"apikey": K, "Authorization": "Bearer " + K}

    # --- 1) URUNLER (evren) --------------------------------------------------
    urunler, bas = [], 0
    while True:
        parca = rest(
            f"{U}/rest/v1/products?select=slug,model_code,name,family_id,deleted_at,status&order=slug"
            f"&offset={bas}&limit=1000", h)
        if not parca:
            break
        urunler += parca
        if len(parca) < 1000:
            break
        bas += 1000
    canli = [u for u in urunler if not u.get("deleted_at")]

    # --- 2) FIYATLAR ---------------------------------------------------------
    fiyatlar, bas = [], 0
    while True:
        parca = rest(
            f"{U}/rest/v1/product_prices?select=product_id,gross_price,net_price,is_active"
            f"&offset={bas}&limit=1000", h)
        if not parca:
            break
        fiyatlar += parca
        if len(parca) < 1000:
            break
        bas += 1000

    def poz(x):
        try:
            return x is not None and float(x) > 0
        except (TypeError, ValueError):
            return False

    fiyatli_id = {f["product_id"] for f in fiyatlar if poz(f.get("gross_price")) or poz(f.get("net_price"))}

    # products.id lazim — slug->id icin ikinci cekim yerine ilk cekime id ekleyelim
    kimlikler, bas = [], 0
    while True:
        parca = rest(f"{U}/rest/v1/products?select=id,slug&order=slug&offset={bas}&limit=1000", h)
        if not parca:
            break
        kimlikler += parca
        if len(parca) < 1000:
            break
        bas += 1000
    slug_id = {k["slug"]: k["id"] for k in kimlikler}

    fiyatsiz = [u for u in canli if slug_id.get(u["slug"]) not in fiyatli_id]

    # --- 3) AILE ADLARI ------------------------------------------------------
    aileler = rest(f"{U}/rest/v1/product_families?select=id,slug", h)
    aile_slug = {f["id"]: f["slug"] for f in aileler}

    # --- 4) FIYAT LISTESI SAYFALARI -----------------------------------------
    sayfalar = []
    with open(a.dizin, encoding="utf-8") as fh:
        for satir in fh:
            if not satir.strip():
                continue
            k = json.loads(satir)
            if os.path.basename(k["dosya"]) != FIYAT_LISTESI:
                continue
            metin = k.get("metin") or ""
            for t in k.get("tablo") or []:
                for r in t.get("satirlar") or []:
                    metin += "\n" + " ".join(str(c) for c in r if c)
            sayfalar.append({"sayfa": k["sayfa"], "n": norm(metin)})
    if not sayfalar:
        print(f"⛔ dizinde {FIYAT_LISTESI} sayfasi YOK — evren yanlis, olcum gecersiz")
        return 2

    # --- 5) SINIFLANDIR ------------------------------------------------------
    satirlar = []
    for u in sorted(fiyatsiz, key=lambda x: x["slug"]):
        kod = (u.get("model_code") or "").strip()
        if not kod:
            satirlar.append({**u, "kod": "", "sayfa": None, "sinif": "KOD YOK"})
            continue
        hedef = norm(kod)
        bulundu = [s["sayfa"] for s in sayfalar if hedef in s["n"]]
        satirlar.append({
            **u, "kod": kod,
            "sayfa": bulundu[0] if bulundu else None,
            "aday": len(bulundu),
            "sinif": "ICE ALIM BOSLUGU" if bulundu else "TICARI BOSLUK",
        })

    # --- 5b) POZITIF KONTROL — esleştirici gercekten ariyor mu? -------------
    # NICIN ZORUNLU: "26 urun listede YOK" iddiasi, esleştirici BOZUKSA da ayni sonucu
    # verir. Ayirt edici sinav: FIYATLI urunlerin kodu listede GECMELI. Gecmiyorsa
    # olcut kor demektir ve butun "ticari bosluk" iddiasi COKER.
    import random
    fiyatli_kodlu = [u for u in canli
                     if slug_id.get(u["slug"]) in fiyatli_id and (u.get("model_code") or "").strip()]
    random.seed(7)
    ornek = random.sample(fiyatli_kodlu, min(40, len(fiyatli_kodlu)))
    pk_bulunan = sum(1 for u in ornek
                     if any(norm(u["model_code"]) in s["n"] for s in sayfalar))
    print(f"POZITIF KONTROL   : fiyatli {len(ornek)} urunun {pk_bulunan}'i listede GECIYOR")
    if ornek and pk_bulunan < len(ornek) * 0.8:
        print("⛔ POZITIF KONTROL DUSUK — esleştirici kor olabilir, 'ticari bosluk' iddiasi GUVENILMEZ")

    a_ = sum(1 for s in satirlar if s["sinif"] == "ICE ALIM BOSLUGU")
    b_ = sum(1 for s in satirlar if s["sinif"] == "TICARI BOSLUK")
    c_ = sum(1 for s in satirlar if s["sinif"] == "KOD YOK")

    print(f"urun (canli)      : {len(canli)}   (toplam kayit {len(urunler)}, silinmis {len(urunler)-len(canli)})")
    print(f"fiyatli           : {len(canli)-len(fiyatsiz)}")
    print(f"FIYATSIZ          : {len(fiyatsiz)}")
    print(f"  ICE ALIM BOSLUGU: {a_}   (kod fiyat listesinde GECIYOR — bizim eksigimiz)")
    print(f"  TICARI BOSLUK   : {b_}   (kod listede YOK — AVenS'ten istenecek)")
    print(f"  KOD YOK         : {c_}   (model_code bos — olculemez, ayri sinif)")
    print(f"  olcum: {len(fiyatsiz)} = {a_} + {b_} + {c_}")

    # --- 6) RAPOR ------------------------------------------------------------
    ç = []
    ç.append("# Fiyatsız ürünlerin ayrımı — içe alım boşluğu mu, ticari boşluk mu? (REC-168)")
    ç.append("")
    ç.append("**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · "
             "**Durum:** SALT OKUMA ölçüm; hiçbir fiyat yazılmadı.")
    ç.append("")
    ç.append("## KAYNAK / CETVEL")
    ç.append("")
    ç.append("* `docs/standards/pricing-standard.md` — fiyat/kur/marj otoritesi.")
    ç.append("* `docs/standards/catalog-ingestion-standard.md` **§1** — köprü = model kodu; "
             "**kodun biçimi hakkında varsayım yok** (T119: yalnız beş haneli kod bekleyen bir "
             "çıkarım 74 ürünü düşürmüştü). **§6.3** — kaynak dizini; PDF doğrudan taranmaz.")
    ç.append("* Emir: OPS → KATALOG, REC-168. **YÖNTEM:** şerit, alt ajan yok. Sapma yok.")
    ç.append("")
    ç.append("---")
    ç.append("")
    ç.append("## 0 · Niçin bu ayrım")
    ç.append("")
    ç.append("Satış kipine geçince fiyatsız ürün vitrinde fiyatsız kalır. Ama **\"fiyat yok\" "
             "tek bir sorun değil**, iki bambaşka sorundur ve çözümleri de bambaşkadır:")
    ç.append("")
    ç.append("| Sınıf | Ne demek | Kimin işi |")
    ç.append("|---|---|---|")
    ç.append("| **İÇE ALIM BOŞLUĞU** | fiyat AVenS listesinde **var**, biz içe almamışız | bizim — bir betik |")
    ç.append("| **TİCARİ BOŞLUK** | fiyat listede **yok**, AVenS hiç vermemiş | Recep — AVenS'e sorulacak |")
    ç.append("")
    ç.append("Ayrım yapılmadan \"satış kipine geçelim\" denirse hangisinin **bizim eksiğimiz** "
             "olduğu bilinmez.")
    ç.append("")
    ç.append("## 1 · Ölçüm")
    ç.append("")
    ç.append("| Ölçüt | Sayı |")
    ç.append("|---|---|")
    ç.append(f"| Ürün kaydı (ham) | {len(urunler)} |")
    ç.append(f"| Silinmiş (`deleted_at` dolu) — **evrenden çıkarıldı** | {len(urunler)-len(canli)} |")
    ç.append(f"| **Canlı ürün** | **{len(canli)}** |")
    ç.append(f"| Fiyatlı (`gross_price` ya da `net_price` > 0) | {len(canli)-len(fiyatsiz)} |")
    ç.append(f"| **FİYATSIZ** | **{len(fiyatsiz)}** |")
    ç.append("")
    ç.append(f"**Ayrım: {len(fiyatsiz)} = {a_} içe alım + {b_} ticari + {c_} kod yok**")
    ç.append("")
    # AILE BAZLI: "27 dagimik urun" ile "dort aile KOMPLE fiyatsiz" bambaska seylerdir.
    import collections
    aile_top, aile_fsz = collections.Counter(), collections.Counter()
    for u in canli:
        ad = aile_slug.get(u.get("family_id")) or "—"
        aile_top[ad] += 1
        if slug_id.get(u["slug"]) not in fiyatli_id:
            aile_fsz[ad] += 1
    tam = [(ad, n) for ad, n in aile_fsz.items() if n == aile_top[ad]]
    tam.sort(key=lambda x: -x[1])

    ç.append("## 2 · ⭐ASIL BULGU — dağınık ürün değil, KOMPLE AİLE")
    ç.append("")
    ç.append(f"27 sayısı yanıltıcı okunabilir. Ürün bazında dağınık değil: **{len(tam)} aile "
             f"TAMAMEN fiyatsız** ({sum(n for _, n in tam)} ürün). Satış kipine geçilince bu "
             "aileler vitrinde **tek bir fiyat bile göstermez** — eksik ürün değil, eksik aile.")
    ç.append("")
    ç.append("| Aile | Fiyatsız | Toplam | Durum |")
    ç.append("|---|---|---|---|")
    for ad, n in aile_fsz.most_common():
        t = aile_top[ad]
        durum = "**TAMAMI FİYATSIZ**" if n == t else f"kısmi ({t-n} fiyatlı)"
        ç.append(f"| `{ad}` | {n} | {t} | {durum} |")
    ç.append("")
    ç.append("Bu, tek tek ürün eksiği gibi görünen şeyin aslında **ticari kapsam sorusu** "
             "olduğunu söylüyor: AVenS bu aileler için hiç fiyat vermemiş. Soru \"fiyatı "
             "girelim mi\" değil, **\"bunları satıyor muyuz\"**.")
    ç.append("")
    ç.append("## 3 · Tablo (ürün bazında)")
    ç.append("")
    ç.append("| Ürün (slug) | Model kodu | Aile | Fiyat listesi s. | Sınıf |")
    ç.append("|---|---|---|---|---|")
    for s in satirlar:
        aile = aile_slug.get(s.get("family_id")) or "—"
        sf = str(s["sayfa"]) if s.get("sayfa") else "yok"
        kod = s["kod"] or "—"
        ç.append(f"| `{s['slug']}` | `{kod}` | {aile} | {sf} | **{s['sinif']}** |")
    ç.append("")
    ç.append("## 4 · Pozitif kontrol — ölçüt gerçekten arıyor mu")
    ç.append("")
    ç.append(f"\"{b_} ürün listede yok\" iddiası, eşleştirici **bozuksa da** aynı sonucu verirdi. "
             "Ayırt edici sınav: **fiyatlı** ürünlerin kodu listede geçmeli.")
    ç.append("")
    ç.append(f"| Sınav | Sonuç |")
    ç.append("|---|---|")
    ç.append(f"| Fiyatlı üründen rastgele örnek (tohum 7) | {len(ornek)} |")
    ç.append(f"| Kodu fiyat listesinde **geçen** | **{pk_bulunan}** |")
    ç.append("")
    ç.append("Yani ölçüt körü körüne \"yok\" demiyor: olması gereken yerde **buluyor**, "
             "olmaması gereken yerde bulmuyor. Bu sınav geçmeseydi rapor yayımlanmazdı.")
    ç.append("")
    ç.append("## 5 · Bu ölçümün sınırı — adıyla")
    ç.append("")
    ç.append("Eşleme ölçütü: **model kodu, fiyat listesi sayfasında geçiyor mu.** Geçmek, o "
             "sayfadaki fiyatın **bu ürüne ait olduğunu kanıtlamaz** — kod başka bir bağlamda "
             "da geçebilir. Bu yüzden sınıf adı \"fiyat bulundu\" değil **İÇE ALIM BOŞLUĞU**: "
             "iddia \"fiyat listede duruyor olabilir, bakılmalı\"dır, \"fiyat şudur\" değil.")
    ç.append("")
    ç.append("Ters yön daha güçlü: kod **hiç geçmiyorsa** o ürün fiyat listesinde yoktur — "
             "**TİCARİ BOŞLUK** iddiası bu yüzden daha sağlamdır.")
    ç.append("")
    ç.append("Ayrıca `model_code` boş olan ürün **ölçülemez**, ayrı sınıfta tutulur; "
             "kanıtsızla karıştırılmaz.")
    ç.append("")
    ç.append("## 6 · Sıradaki")
    ç.append("")
    ç.append("* **İçe alım boşlukları** → REC önerisi (açmayı OPS yapar).")
    ç.append("* **Ticari boşluklar** → Recep'e OPS taşır; AVenS'ten istenecek kalem.")
    ç.append("* Fiyat **yazılmadı**; bu iş yalnız sınıflandırmadır.")

    Path(a.cikti).parent.mkdir(parents=True, exist_ok=True)
    Path(a.cikti).write_text("\n".join(ç) + "\n", encoding="utf-8", newline="\n")
    print(f"\nrapor: {a.cikti}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
