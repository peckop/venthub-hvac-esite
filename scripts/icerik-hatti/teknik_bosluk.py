#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TEKNIK BOSLUK MATRISI — hangi ailede hangi alan EKSIK, ve doldurulabilir mi? (FAZ 1)

EMIR: OPS -> KATALOG, Recep girdisi ("teknik ozellikler tamamlanmadi, markalarin
sitelerinden KANITLI alalim"). SALT OKUMA — canliya hicbir sey yazilmaz.

NE SORAR — ve nicin bu soru:
"Urunde alan bos" tek basina bir sey soylemez; bazi alanlar o aile icin ZATEN anlamsizdir
(hiz anahtarinda 'debi' aranmaz). Anlamli soru sudur:
    ailenin urunlerinin cogunda DOLU olan bir alan, bazi kardeslerinde BOS mu?
Cunku o zaman alan o aile icin BEKLENIYOR demektir ve bosluk gercek bir eksiktir.

K13 ESIGI: bir alan, ailenin urunlerinin >= %60'inda doluysa o aile icin BEKLENEN sayilir.
Beklenen ama bos hucre = BOSLUK.

BOSLUK SINIFLARI (asil teslimat — "ne kadar eksik" degil "kim doldurabilir"):
  PDF_TEKNIK_VAR      : ailenin dizinde TEKNIK bir kaynagi var -> bizden cikarim yeter
  SADECE_FIYAT_LISTESI: tek kaynagi AVenS fiyat listesi -> orada spec YOK, web gerekir
  KAYNAK_YOK          : dizinde hicbir kaynagi yok        -> web gerekir

⚠SINIF BIR VEKILDIR, KANIT DEGIL: "ailenin teknik PDF'i var" demek "o deger o PDF'te
yaziyor" demek DEGILDIR. Iddia "bakilacak yer var"dir. Ters yon guclu: kaynagi YOKSA
bizden cikarim mumkun degildir, web gerekir.
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import sys
from pathlib import Path

# Betigin KENDI dizini yola eklenir: aksi halde yalniz o dizinden kosunca calisir,
# depo kokunden kosulunca "Cannot find module _veri" ile duser. Calisma dizinine
# bagli betik, bir gun baska bir yerden cagrildiginda sessizce kirilir.
sys.path.insert(0, str(Path(__file__).resolve().parent))

import _veri  # noqa: E402

_veri.utf8_akis()

DIZIN_VARSAYILAN = Path.home() / "venthub-pdf-ingestor" / "kaynak-dizini" / "sayfalar.jsonl"
FIYAT_LISTESI = "avens_fiyat_listesi_2026_HQ.pdf"
K13_ESIK = 0.60


def dolu(v) -> bool:
    return v not in (None, "", [], {}) and not (isinstance(v, str) and not v.strip())


def main() -> int:
    ap = argparse.ArgumentParser(description="Teknik bosluk matrisi (FAZ 1)")
    ap.add_argument("--dizin", default=str(DIZIN_VARSAYILAN))
    ap.add_argument("--harita", default=str(Path(__file__).resolve().parent / "aile-kaynak-haritasi.json"))
    ap.add_argument("--cikti", required=True)
    a = ap.parse_args()

    U, h = _veri.baglan()
    urunler = _veri.tumunu_cek(
        U, h, "products?select=slug,brand,model_code,family_id,technical_specs,deleted_at&order=slug",
        "products")
    canli = [u for u in urunler if not u.get("deleted_at")]
    aileler = _veri.rest(U, h, "product_families?select=id,slug")
    aile_slug = {f["id"]: f["slug"] for f in aileler}

    # --- dizindeki kaynaklar (takma ad cozumu dahil) -------------------------
    dizin_yol = Path(a.dizin)
    tabanlar = set()
    for satir in open(dizin_yol, encoding="utf-8"):
        if satir.strip():
            tabanlar.add(os.path.basename(json.loads(satir)["dosya"]))
    manifest = dizin_yol.parent / "manifest.json"
    takma = {}
    if manifest.exists():
        for kanonik, adlar in (json.loads(manifest.read_text(encoding="utf-8"))
                               .get("takma_adlar") or {}).items():
            for ad in adlar:
                takma[os.path.basename(ad)] = os.path.basename(kanonik)
    harita = json.loads(Path(a.harita).read_text(encoding="utf-8"))

    def kaynak_sinifi(aile: str) -> str:
        pdfler = {takma.get(t, t) for t in harita.get(aile, [])} & tabanlar
        if not pdfler:
            return "KAYNAK_YOK"
        if pdfler == {FIYAT_LISTESI}:
            return "SADECE_FIYAT_LISTESI"
        return "PDF_TEKNIK_VAR"

    # --- aile x alan matrisi -------------------------------------------------
    aile_urun = collections.defaultdict(list)
    for u in canli:
        aile_urun[aile_slug.get(u.get("family_id")) or "—"].append(u)

    satirlar = []
    toplam_bosluk = 0
    sinif_sayaci = collections.Counter()
    for aile, urs in sorted(aile_urun.items()):
        sayac = collections.Counter()
        for u in urs:
            for k, v in (u.get("technical_specs") or {}).items():
                if dolu(v):
                    sayac[k] += 1
        beklenen = [k for k, c in sayac.items() if c / len(urs) >= K13_ESIK]
        bosluk = {}
        for k in beklenen:
            eksik = [u["slug"] for u in urs if not dolu((u.get("technical_specs") or {}).get(k))]
            if eksik:
                bosluk[k] = eksik
        sinif = kaynak_sinifi(aile)
        hucre = sum(len(v) for v in bosluk.values())
        toplam_bosluk += hucre
        sinif_sayaci[sinif] += hucre
        satirlar.append({
            "aile": aile, "urun": len(urs), "marka": (urs[0].get("brand") or "—"),
            "kodlar": sorted({(u.get("model_code") or "").strip()
                              for u in urs if (u.get("model_code") or "").strip()}),
            "beklenen_alan": len(beklenen), "bosluk_hucre": hucre,
            "bosluk": bosluk, "sinif": sinif,
            "ort_alan": round(sum(len([1 for v in (u.get("technical_specs") or {}).values()
                                       if dolu(v)]) for u in urs) / len(urs), 1),
        })

    # --- ⭐IKINCI OLCUT: AILE YOKSULLUGU (K13'un KOR NOKTASI) -----------------
    # K13 aile ICI tutarsizligi olcer. Bir ailede alan HIC KIMSEDE yoksa o alan
    # "beklenen" sayilmaz ve BOSLUK DOGMAZ. Sonuc: katalogun EN BOS aileleri
    # kusursuz gorunur. Olculdu: danfoss-fc51 ortalama 0.0 alan -> 0 bosluk;
    # nicotra x4 ortalama 1.0 alan -> 0 bosluk. Tek basina K13 ile yayimlanan
    # bir rapor "sorun SEAT'te" derdi; asil sorun Nicotra'da.
    # Bu yuzden ikinci, BAGIMSIZ olcut: ailenin ortalama dolu alan sayisi,
    # katalog ORTANCASININ yarisindan az mi.
    tum_dolu = sorted(len([1 for v in (u.get("technical_specs") or {}).values() if dolu(v)])
                      for u in canli)
    ortanca = tum_dolu[len(tum_dolu) // 2]
    yoksul_esik = ortanca / 2
    yoksul = [s for s in satirlar if s["ort_alan"] < yoksul_esik]
    yoksul_urun = sum(s["urun"] for s in yoksul)

    pdf_var = sinif_sayaci["PDF_TEKNIK_VAR"]
    web_ger = sinif_sayaci["SADECE_FIYAT_LISTESI"] + sinif_sayaci["KAYNAK_YOK"]

    print(f"canli urun           : {len(canli)}")
    print(f"aile                 : {len(satirlar)}")
    print(f"BOSLUK HUCRESI       : {toplam_bosluk}")
    print(f"  PDF'de bakilabilir : {pdf_var}   (ailenin TEKNIK kaynagi dizinde var)")
    print(f"  WEB GEREKIR        : {web_ger}   (sadece fiyat listesi {sinif_sayaci['SADECE_FIYAT_LISTESI']}"
          f" + kaynak yok {sinif_sayaci['KAYNAK_YOK']})")
    print(f"  olcum: {toplam_bosluk} = {pdf_var} + {web_ger}")
    print()
    print(f"⭐IKINCI OLCUT — AILE YOKSULLUGU (K13'un goremedigi)")
    print(f"  katalog ortancasi    : {ortanca} alan   -> yoksulluk esigi {yoksul_esik}")
    print(f"  YOKSUL AILE          : {len(yoksul)} / {len(satirlar)}")
    print(f"  bu ailelerdeki URUN  : {yoksul_urun} / {len(canli)}  "
          f"({100*yoksul_urun//len(canli)}%)")
    for s in sorted(yoksul, key=lambda x: x["ort_alan"]):
        print(f"     {s['ort_alan']:5.1f} alan  {s['urun']:3d} urun  {s['marka']:18s} {s['aile']}")

    # --- rapor ---------------------------------------------------------------
    ç = []
    ç.append("# Teknik boşluk matrisi — hangi alan eksik, kim doldurabilir? (FAZ 1)")
    ç.append("")
    ç.append("**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · "
             "**Durum:** SALT OKUMA; canlıya hiçbir şey yazılmadı.")
    ç.append("")
    ç.append("## KAYNAK / CETVEL")
    ç.append("")
    ç.append("* `docs/standards/product-schema-standard.md` — alan adı → anlam sözleşmesi.")
    ç.append("* `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini; "
             "**PDF doğrudan taranmaz, dizin okunur**.")
    ç.append("* Emir: OPS → KATALOG, Recep girdisi *\"teknik özellikler tamamlanmadı, "
             "markaların sitelerinden **kanıtlı** alalım\"*. **YÖNTEM:** şerit, alt ajan yok. Sapma yok.")
    ç.append("")
    ç.append("---")
    ç.append("")
    ç.append("## 0 · Soru nasıl kuruldu (ve niçin böyle)")
    ç.append("")
    ç.append("\"Üründe alan boş\" tek başına bir şey söylemez: bazı alanlar o aile için "
             "**zaten anlamsızdır** — hız anahtarında debi aranmaz. Anlamlı soru şu:")
    ç.append("")
    ç.append("> Ailenin ürünlerinin **çoğunda dolu** olan bir alan, bazı kardeşlerinde **boş** mu?")
    ç.append("")
    ç.append(f"Çünkü o zaman alan o aile için **bekleniyor** demektir. Eşik (K13): bir alan "
             f"ailenin ürünlerinin **≥%{int(K13_ESIK*100)}**'ında doluysa beklenen sayılır; "
             "beklenen ama boş hücre = **BOŞLUK**.")
    ç.append("")
    ç.append("## 1 · Ölçüm")
    ç.append("")
    ç.append("| Ölçüt | Sayı |")
    ç.append("|---|---|")
    ç.append(f"| Canlı ürün | {len(canli)} |")
    ç.append(f"| Aile | {len(satirlar)} |")
    ç.append(f"| **Boşluk hücresi** | **{toplam_bosluk}** |")
    ç.append(f"| — ailenin teknik PDF'i dizinde **var** (bizden çıkarım) | {pdf_var} |")
    ç.append(f"| — **web kaynağı gerekir** | **{web_ger}** |")
    ç.append("")
    ç.append(f"**{toplam_bosluk} = {pdf_var} + {web_ger}**")
    ç.append("")
    ç.append("## 2 · ⛔EMİRDEN SAPMA — K13 tek başına YETMEZ, ikinci ölçüt eklendi")
    ç.append("")
    ç.append("Emir K13 eşiğini tarif etti (aile içi: ≥%60 dolu = beklenen, beklenen ama boş = "
             "boşluk). Uyguladım ve **kör noktası çıktı**:")
    ç.append("")
    ç.append("| Aile | Ort. dolu alan | K13 boşluğu |")
    ç.append("|---|---|---|")
    ç.append("| `danfoss-fc51` | **0.0** | **0** |")
    ç.append("| `avens-sulu-batarya` | **0.8** | **0** |")
    ç.append("| `nicotra-gebhardt-*` (4 aile) | **1.0** | **0** |")
    ç.append("")
    ç.append("Bir ailede alan **hiç kimsede** yoksa o alan \"beklenen\" sayılmaz ve boşluk "
             "doğmaz. Sonuç: **kataloğun en boş aileleri kusursuz görünür.** K13 tek başına "
             "yayımlansaydı rapor \"sorun SEAT'te\" derdi; oysa asıl sorun Nicotra'da — "
             "35 üründe fiilen veri yok.")
    ç.append("")
    ç.append("**Sapma:** ikinci, bağımsız ölçüt eklendi — *aile yoksulluğu*: ailenin ortalama "
             f"dolu alan sayısı, katalog ortancasının (**{ortanca}**) yarısından az mı "
             f"(eşik **{yoksul_esik}**). K13 *tutarsızlığı*, bu *yetersizliği* ölçer; ikisi "
             "farklı sorular ve biri ötekinin yerine geçmez.")
    ç.append("")
    ç.append(f"**Ölçülen: {len(yoksul)} yoksul aile, {yoksul_urun} ürün "
             f"({100*yoksul_urun//len(canli)}%).**")
    ç.append("")
    ç.append("| Aile | Marka | Ürün | Ort. dolu alan |")
    ç.append("|---|---|---|---|")
    for s in sorted(yoksul, key=lambda x: x["ort_alan"]):
        ç.append(f"| `{s['aile']}` | {s['marka']} | {s['urun']} | **{s['ort_alan']}** |")
    ç.append("")
    ç.append("**Karar için anlamı:** yoksul ailelerde kardeşlerden çıkarım YAPILAMAZ — "
             "alınacak bir şey yok. Bunlar doğrudan **web kaynağı** sınıfıdır.")
    ç.append("")
    ç.append("## 3 · Aile tablosu")
    ç.append("")
    ç.append("| Aile | Marka | Ürün | Ort. dolu alan | Beklenen alan | Boşluk hücresi | Kaynak sınıfı |")
    ç.append("|---|---|---|---|---|---|---|")
    for s in sorted(satirlar, key=lambda x: (-x["bosluk_hucre"], x["aile"])):
        ç.append(f"| `{s['aile']}` | {s['marka']} | {s['urun']} | {s['ort_alan']} | "
                 f"{s['beklenen_alan']} | {s['bosluk_hucre']} | **{s['sinif']}** |")
    ç.append("")
    ç.append("## 4 · Boşluk sınıfı ne demek")
    ç.append("")
    ç.append("| Sınıf | Anlamı | Kimin işi |")
    ç.append("|---|---|---|")
    ç.append("| `PDF_TEKNIK_VAR` | ailenin **teknik** kaynağı dizinde duruyor | bizden çıkarım yeter |")
    ç.append("| `SADECE_FIYAT_LISTESI` | tek kaynağı AVenS fiyat listesi — orada **spec yok** | web kaynağı gerekir |")
    ç.append("| `KAYNAK_YOK` | dizinde hiçbir kaynağı yok | web kaynağı gerekir |")
    ç.append("")
    ç.append("⚠**Sınıf bir VEKİLDİR, kanıt değil.** \"Ailenin teknik PDF'i var\" demek "
             "\"o değer o PDF'te yazıyor\" demek **değildir**; iddia \"bakılacak bir yer var\"dır. "
             "Ters yön güçlü: kaynağı **yoksa** bizden çıkarım mümkün değildir.")
    ç.append("")
    ç.append("## 5 · OPS'un \"alan adı ikiliği\" sorusu — ÖNCÜLÜ YANLIŞ")
    ç.append("")
    ç.append("Soru şöyle geldi: *\"`max_delivery_m3h` 243 vs `nominal_delivery_m3h` 89 — "
             "hangisi kanonik?\"* **İkisi de kanonik; mükerrer değiller.** "
             "`product-schema-standard.md` \"Ön ek → anlam\" tablosu bunu açıkça ayırıyor:")
    ç.append("")
    ç.append("| Ön ek | Anlamı |")
    ç.append("|---|---|")
    ç.append("| `max_…` | üreticinin verdiği çalışma aralığının **üst sınırı** (serbest hava) |")
    ç.append("| `nominal_…` | eğri üzerinde **belirli bir çalışma noktası** (devir + karşı basınç) |")
    ç.append("")
    ç.append("Cetvel ayrıca **yasak** koyuyor: *\"Nominal noktayı `max_` alanına yazmak yasak.\"* "
             "Gerekçesi ölçülmüş (2026-08-21, SEAT föyleri): nominal değeri `max_` alanına "
             "yazmak **birim hatasını kapatırken semantik hata üretiyordu**. "
             "Yani ikisini birleştirmek düzeltme değil, **bozma** olurdu.")
    ç.append("")
    ç.append("## 6 · FAZ 2 arama listesi — ajanlar koddan başlasın")
    ç.append("")
    ç.append("Yoksul ailelerin **model kodları**. Arama bunlarla başlar; kod üreticinin "
             "kendi kataloğunda birebir geçer ve marka adıyla arama yapmaktan çok daha kesindir.")
    ç.append("")
    ç.append("⚠**Marka sitesi adayı UYDURMUYORUM.** Doğrulamadığım bir adresi rapora koymak, "
             "bütün bu hattın kurulma sebebine aykırı olurdu: uydurulmuş bir kaynak, "
             "kaynaksızlıktan daha tehlikelidir çünkü kanıtlıymış gibi görünür. "
             "Aşağıdaki yönlendirme **ölçülmüş** kayıtlardan geliyor ve her satır kaynağını "
             "ve sınırını taşıyor.")
    ç.append("")
    ç.append("### 6.0 · Kaynak yönlendirmesi — üç marka, üç farklı yol")
    ç.append("")
    ç.append("ÜRÜN şeridinin **2026-08-21 tarihli ölçülmüş marka-kaynak haritası** "
             "(`brand-image-sources.md`) planımdaki bir varsayımı çürüttü; kendi kayıtlarımızla "
             "doğruladım (`catalog-ingestion-standard.md` satır 94: *\"avens/ — AVenS kendi "
             "üretimi\"*; K7.10'da iki AVenS ailesi zaten Recep'ten föy bekliyordu).")
    ç.append("")
    ç.append("| Marka | Ürün | Kaynak nerede | Kim getirir | Bilinen tuzak |")
    ç.append("|---|---|---|---|---|")
    ç.append("| **AVenS** | 34 | Bizim markamız. `avensair.com/kataloglar`'daki 24 katalog **Vortice + fiyat listesi**ydi (dizine alınan küme); AVenS föyleri orada görünmedi. Kaynak: Recep'in arşivi — ya da föy sitede varsa **linki** | **Recep** (link ya da PDF) | ajanı üretici sitesi aramaya gönderirsen 34 üründe sıfır sonuç alır ve bunu \"bulunamadı\" diye raporlar — üretici biziz |")
    ç.append("| **Nicotra Gebhardt** | 35 | `avensair.com/nicotra-gebhardt` (ÜRÜN 08-21: 28/35 eşleşti); resmî site yalnız AT serisi | FAZ 2 ajanı (ya da Recep'in katalog PDF'i varsa o, daha iyi) | **koda değil MODEL TANIMLAYICIYA** eşle — sipariş kodu iki kaynakta farklı yazılıyor, 7 ürün kodla düştü; site araması sorgu başına sonuç sınırlıyor (1000 satır tavanının web kardeşi) |")
    ç.append("| **Danfoss** | 2 | `danfoss.com` FC-51 sayfası (ÜRÜN 08-21) | FAZ 2 ajanı | — |")
    ç.append("")
    ç.append("**Sınır (ÜRÜN'ün kendi ifadesiyle):** bu harita **görsel** kaynağı için çıkarıldı, "
             "teknik özellik için değil; bir sayfanın görseli taşıması teknik tabloyu da "
             "taşıdığını kanıtlamaz; ölçüm 16 gün önce. Yani \"kaynak listesi\" değil, "
             "**\"aranacak yer + bilinen tuzaklar\"**.")
    ç.append("")
    ç.append("**Bunun karar için anlamı:** 71 ürünün **34'ü (yaklaşık yarısı) web fazına hiç "
             "girmez.** O 34 için tek yol Recep'in AVenS föylerini teslim etmesi. FAZ 2 ajan "
             "kotası yalnız Nicotra + Danfoss'a (37 ürün) harcanmalı.")
    ç.append("")
    for s2 in sorted(yoksul, key=lambda x: (x["marka"], x["aile"])):
        ç.append(f"### `{s2['aile']}` — {s2['marka']} · {s2['urun']} ürün · "
                 f"ort. {s2['ort_alan']} alan")
        ç.append("")
        if s2["kodlar"]:
            ç.append("```")
            for i in range(0, len(s2["kodlar"]), 6):
                ç.append("  ".join(s2["kodlar"][i:i + 6]))
            ç.append("```")
        else:
            ç.append("*(model kodu yok — arama ürün adıyla yapılacak)*")
        ç.append("")
    ç.append("## 7 · Bu ölçümün kapatmadığı")
    ç.append("")
    ç.append("* Hangi web kaynağının **kullanılabilir** olduğu (üretici sitesinde PDF var mı) — FAZ 2.")
    ç.append("* `PDF_TEKNIK_VAR` sınıfındaki boşlukların **gerçekten** o PDF'te bulunup "
             "bulunmadığı — vekil, kanıt değil.")
    ç.append("* Eşiğin (%60) kendisi bir **seçim**; daha yüksek eşik daha az ama daha kesin "
             "boşluk verir. Değiştirilirse sayı değişir, bu yüzden eşik raporda yazılı.")

    Path(a.cikti).parent.mkdir(parents=True, exist_ok=True)
    Path(a.cikti).write_text("\n".join(ç) + "\n", encoding="utf-8", newline="\n")
    print(f"\nrapor: {a.cikti}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
