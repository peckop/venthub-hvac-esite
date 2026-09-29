# REC-300 · Faz 3e — dilim planı ve ölçüm listesi · 2026-09-29

> **URUN · PLAN: kod YOK, migration YOK.** OPS emri 09-29: "3e için önce güncel dilim planı ve ölçüm listesi; kod
> yayını yayın günü paketine bağlı, dal+PR açık bekleyebilir, merge yok." Üst plan: [ana plan v5](rec-adres-agac-tek-yayin-2026-09-07.md)
> Faz 3 m.10 + m.12, [tazeleme](rec-300-plan-tazeleme-2026-09-29.md) §2.

**KAYNAK/CETVEL:** `canonical-url-standard.md` (§4 dil önekli kanonik, hreflang karşılıklılığı) ·
`rendering-cache-standard.md` (site haritası ikinci tazeleme hattı: `revalidate = 21600`) ·
`docs/standards/adres-semasi-standard.md` (Faz 0 cetveli, #1339) · `vitrin-metni-standard.md` (sözlük terimleri) ·
REC-204 (`EN_YAYIN` açılma şartları). **Ölçüm tazeliği:** master f89b5c9b5 + `origin/master` `src/app/sitemap.ts` ve
`src/config/features.ts` okumaları 2026-09-29.
**YÖNTEM:** şerit (URUN), elle + test; her dilim ayrı küçük PR. Yayın günü kodu bayrak arkasında (`ADRES_SEMASI_K3B = false` iken canlı değişmez).

## 1. Bugünkü durum (master'dan ölçülen)

| Konu | Bugün |
|---|---|
| Site haritası adres üretimi | `Routes.category/brand/product` ile; `adresUret` KULLANMIYOR. Model adresi YOK: ürün satırı yalnız **aile** (`Routes.product(f.slug)`). Canlı sitemap 88 adres (TR). |
| Diller | `EN_YAYIN=false` → yalnız `tr`; EN adresleri haritada yok (REC-204). `alternates.languages` blokları KASITLI dokunulmadı (bayrağın "bilinen sınır" notu). |
| `x-default` | Haritada YOK. |
| Kategori kapsamı | Yalnız ürünü olan kategoriler (`get_category_counts`); alt kategoriler tek seviyeli adresle ilan ediliyor (REC-205 notu). |
| Marka | `HVAC_BRANDS` listesinden (#1461 sonrası 5 marka). |
| Bilgi Merkezi | `bilgiMerkeziSiteHaritasi(baseUrl)` ayrı blok. |
| Sözlük | "Seri" var (`tr.ts`); "Alt Kategori(ler)" var (`subCategoryCount`, `subcategories`). Eksik/yanlış kalan terim envanteri henüz ÇIKARILMADI. |

## 2. Dilimler (her biri ayrı PR, sırayla)

| Dilim | İş | Bayrak kapalıyken |
|---|---|---|
| **3e-1** | Site haritası adres üretimi `adresUret`'e taşınır: kök + dal (iki seviyeli), aile, marka, statik bölümler. | Çıktı **bayt bayt bugünkü** (tablo testi). |
| **3e-2** | **442 model adresi** haritaya girer (`/tr/urun/<slug>-p-<sku>`); kaynak: tek üretici (`adresUret` model kolu), liste = #1356 CSV ile eşit; model başına `lastModified` = `updated_at`. | Bayrak kapalıyken model adresi haritaya **GİRMEZ** (rota 404). |
| **3e-3** | `alternates.languages`: **karşılıklı** hreflang (TR↔EN), `x-default` = TR; EN kolları `EN_YAYIN`'a bağlı. Karar: hreflang de `EN_YAYIN`'a bağlanır mı (REC-204 "bilinen sınır") — bu dilimin İLK ölçümü. | Bugünkü blok birebir. |
| **3e-4** | Sözlük: "alt kategori" / "seri" terim taraması + TR/EN parite (`keycheck`); yanlış/karışık kullanım listesi çıkarılır, düzeltilir. | Yalnız metin; sayfa yapısı aynı. |
| **3e-5** | `features.ts` `EN_YAYIN` yorum metni: açılma şartı 2'ye yeni kural ("TR'de Türkçe harf/kelime VE EN=TR ise eksik" + 24/24 kategori EN açıklama dolu, 8 ailede EN=TR özel ad — KATALOG ölçümü 09-27) + ölçüm tarihi. Yalnız yorum. | Değişiklik yok. |

Sıra gerekçesi: 3e-1 tabloyla bugünkünü kilitler (güvenli taban); 3e-2/3e-3 onun üstüne; 3e-4/5 bağımsız, küçük.

## 3. ÖLÇÜM LİSTESİ (kod yazmadan ÖNCE koşulacak, hepsi salt okuma)

1. **Sitemap tam envanteri:** canlı `sitemap.xml` → tür başına adet (statik / bilgi merkezi / kategori / dal / marka / aile). Beklenen bugün 88; çıkarılan ile kod okuması eşit mi.
2. **Kategori kapsamı:** ürünü OLMAYAN aktif kategori var mı (haritadan düşmeli mi); 7 pasif kategori canlıda 200 dönüyor (ana plan O4) — haritada yer almıyor mu.
3. **Model evreni:** 442 SKU `lower(sku)` tekil, `products.status='active'` ile eşit mi (haritaya YALNIZ aktif modeller girmeli); pasif/arşiv model adresi haritada olmamalı.
4. **`updated_at` kaynağı:** model ve aile `lastModified` için güvenilir mi (toplu yazımlarda tüm satırlar aynı damgayı alıyorsa harita her gün "hepsi değişti" der).
5. **hreflang karşılıklılığı:** her TR adresin EN karşılığı VAR ve EN adres 200 mü (EN_YAYIN kapalıyken EN adresler sayfa olarak var, `noindex`).
6. **Yanlış-pozitif riski:** `EN_YAYIN` kapalıyken hreflang beyanı kalırsa Google'ın davranışı (REC-204'te ölçülmedi) → küçük deney: Search Console URL denetimi 3 örnek (GEO-SEO erişimi) ya da "ölçülmedi" kaydı.
7. **Sözlük terim tarayıcısı:** `tr.ts`/`en.ts`'de "alt kategori", "seri", "sub-category", "series", "subcategory" geçişleri + hangi ekranda görünür; karışık kullanım (ör. aynı ekranda "dal" ve "alt kategori").
8. **Build etkisi:** haritaya 442 model eklenince `sitemap.xml` boyutu (< 50.000 URL, < 50 MB sınırı ile) ve üretim süresi; `generateStaticParams` boş kalır kararı (ana plan m.13) etkilenmez.
9. **IndexNow uyumu:** haritadaki yeni adres kümesi = yayın günü toplu bildirim kümesi (tazeleme §4 madde 4c) — aynı kaynak (`sitemap.xml`), fark 0.

## 4. Kapılar (uygulamayla birlikte)

* **INV-SITEMAP-ADRES-1:** bayrak kapalı → çıktı bugünkü tabloyla bayt bayt aynı; açık → her satır `adresUret`'ten, kanonik ile eşit, tek hop.
* **INV-SITEMAP-MODEL-1:** model satırları = aktif model fikstürü ∩ 442 liste; pasif model yok; çift adres yok.
* **INV-HREFLANG-1:** karşılıklılık + `x-default`; EN kolları `EN_YAYIN` kapalıyken yok.
* Sabotajlar: bir modeli sil, pasif bir modeli ekle, hreflang'ı tek yönlü yap → kırmızı.
* Mevcut `INV-EN-YAYIN-1` iki yönlü kalır.

## 5. Bağımlılıklar ve sınırlar

* **REC-403** (PR #1480) 3e-1'den önce iner (yüzey adresleri sıçramasız olsun; sitemap'i etkilemez ama aynı yardımcı modül).
* Migration YOK. `get_search_suggestions` (3f) ayrı iş.
* Merge YOK: bayrak `false` iken haritada model adresi görünmemeli; dilimler dalda hazır bekler, yayın günü paketine (tazeleme §4) bağlanır.
* **Bu planın bilmediği:** (a) 8 ailenin EN adı gerçekten doldu mu, (b) GSC'nin hreflang+`noindex` çelişkisine tepkisi, (c) `updated_at` güvenilirliği — ölçüm listesi 4, 5, 6 bunları kapatır.

## 6. OPS'tan beklenen

Sıra ve ölçüm listesi onayı. Karar isteyen soru yok; 3e-3'ün "hreflang `EN_YAYIN`'a bağlansın mı" sorusu ölçüm 5-6'nın sonucuyla OPS'a tek satırla gelir.
