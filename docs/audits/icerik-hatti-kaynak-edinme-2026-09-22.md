# Kaynak edinme listesi — teknik verisi olmayan 7 aile (2026-09-22)

**Şerit:** URUN-KATALOG · **İş:** REC-172 (karar 71 hazırlığı) · **OPS emri:** 2026-09-22.
**Kapsam:** yalnız ÖLÇÜM. Hiçbir belge kaynak dizinine alınmadı; **indirme = Recep kararı.**
**Cetvel:** `catalog-ingestion-standard.md` §6.3 (kaynak dizini; PDF bir kez çıkarılır, K15).

## Neden

Teknik alanı boş 73 ürünün 72'si için kaynak dizininde teknik tablo **yok**: yedi aile yalnız
`avens_fiyat_listesi_2026_HQ.pdf`'te (kod · ad · bazen debi · fiyat) geçiyor (REC-172 yorumu 2026-09-22 11:02Z).
Çıkarım kaynak olmadan yapılamaz; kardeşten çıkarım yasak. Sıra: **kaynak edin → `cikar.py` ile dizine al →
adım 3 çıkarım → Recep onayı → canlı.**

## Liste

Ölçüm: `curl -sIL` / okuma, 2026-09-22 (alt ajan; URL'ler uydurulmadı, bulunamayan "BULUNAMADI").

| marka · aile | ürün | elimizde | üretici (kanıt) | en iyi kaynak | durum | model eşleşmesi |
|---|---|---|---|---|---|---|
| AVenS · NIMUS santrifüj | 15 | fiyat listesi s.47 (kod · ad · debi) | **Casals** — Fanware'de "NIMUS 311 T2 1,1kW" kod NS311280 | Casals teknik kataloğu flipbook s.191–198 — `https://www.casals.com/Casals_catalogue/flipbook/192/` (HTML; PDF sürümü 404) · broşür PDF `https://www.casals.com/assets/uploads/cat_pdf/77854-ns-nx-casals-en.pdf` (769 kB) | 200 | YÜKSEK — tablo: kod · rpm · akım · kW · m³/h · dB(A) · kg |
| AVenS · NIMAX santrifüj | 15 | fiyat listesi s.48 | **Casals** — katalog s.200 "NIMAX 314 T2 1,5kW" | aynı katalog flipbook s.199–205 · aynı broşür | 200 | YÜKSEK — ⚠kod farkı (aşağıda) |
| Vortice · VORTICENT CMS ATEX | 11 | fiyat listesi | **Vortice** — Fan Selection Pro 2026'da "cms-atex-12-5-t4-0-09kw" | model başına föy (AVenS barındırıyor), ör. `https://www.avensair.com/uploads/11032611474069b1565cead3f_VORTICENT-CMS-ATEX-12-5-T4-0-09kW.pdf` · vortice.it föy 30171 (875 kB) | 200 (vortice.it sonra 503) | YÜKSEK ad; ⚠10 PDF / 11 ürün; kodumuz 253080106XN web'de hiç geçmiyor; föy Zone 1/Zone 2 ayrımı var — bizimki hangisi belirsiz |
| AVenS · QE-B Kasa | 9 | fiyat listesi | **Vortice** — ürün numaraları 11560–11568 = kodlarımız | vortice.com föy 11560 (1,05 MB) | 200 → 503 (hız sınırı) | ORTA — içerik okunamadı; fansız gömme kasa, performans tablosu beklenmez (boyut/bağlantı alanları) |
| AVenS · ENKELFAN EC plug | 9 | fiyat listesi | **Casals** — Fanware 155–630, kod ENKEC155…ENKEC630 | Casals plug fan kataloğu `https://www.casals.com/assets/uploads/cat_pdf/82f7f-cata-logo-plug-fans_casals.pdf` (2,6 MB) | 200 | **YÜKSEK — 9/9 model + 9/9 kod belgede**; alanlar m³/h · Pa · kW · dB · rpm · kg |
| AVenS · dikdörtgen kanal radyal | 7 | fiyat listesi s.27 (debi 1100–9500 m³/h, hız anahtarı) | BULUNAMADI (AVenS kendi markası; OEM görünmüyor) | — | — | yalnız debi; basınç · güç · ses · ağırlık yok → **AVenS'ten föy istenmeli** |
| AVenS · sulu batarya | 6 | fiyat listesi s.69 (kcal/h, 90/70 °C) | BULUNAMADI (AVenS kendi markası) | — | — | boyut · ağırlık · basınç kaybı yok → **AVenS'ten föy istenmeli** |

Ek (içeriği ölçülmedi): Casals endüstriyel fan kataloğu (31,7 MB) ve ATEX teknik kataloğu (34,6 MB), ikisi de 200 · PDF.

## Çıkarımdan önce bilinmesi gereken üç bulgu

1. **AVenS kodu ≠ üretici kodu (Casals).** Bizim kodlar AVenS fiyat listesiyle **birebir aynı** (s.47–48, ölçüldü) —
   yazım hatası yok. Ama Casals'ta aynı ürün farklı kodla: `NIMAX 314 T2 1,5kW` AVenS **NX313290** · Casals **NX314290**;
   `NIMUS 1001 T4 45kW` AVenS **NS10014225** · Casals **NS1001422**. Adım 3 bu ailelerde **kodla değil model adıyla**
   eşlemeli (kaynak-eslemesi.mjs ad yolu zaten var).
2. **İki kaynak aynı ürüne farklı debi veriyor.** `NIMAX 314 T2 1,5kW`: AVenS fiyat listesi **5240 m³/h**, Casals
   kataloğu **5500 m³/h**. Hangi kaynağın kazanacağı (distribütör mü üretici mi) çıkarımdan ÖNCE kural olmalı;
   yoksa adım 3 bunu ÇELİŞİYOR sayar ve karar Recep'e yığılır.
3. **CMS ATEX'in ATEX bölgesi belirsiz.** Vortice föyleri Zone 1 ve Zone 2 ayrı; ürün adlarımız bölge yazmıyor.
   Bölge müşteriye güvenlik bilgisidir — tahminle yazılmaz.

## Karar gerektirenler (OPS → Recep)

- **İndirme:** 5 aile için herkese açık üretici belgesi var (NIMUS · NIMAX · CMS ATEX · QE-B · ENKELFAN, 59 ürün).
  İndirilip `cikar.py` ile dizine alınması Recep kararı.
- **AVenS'ten talep:** 2 aile (dikdörtgen radyal 7 · sulu batarya 6 = 13 ürün) için web'de föy yok.
- **Kaynak önceliği:** distribütör fiyat listesi ile üretici kataloğu çeliştiğinde hangisi (bulgu 2).

## Yöntem notu

Alt ajan iki PDF'in metnini doğrulama için okudu (WebFetch aracı onları kendiliğinden geçici klasöre kaydetti,
okunduktan sonra silindi). Kaynak dizinine hiçbir şey eklenmedi.
