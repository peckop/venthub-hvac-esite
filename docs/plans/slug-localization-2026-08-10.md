# Dile Göre Kategori Slug'ları (Localized Category Slugs) — Plan + Eşleme SSOT

> v1.0 · 2026-08-10 · Karar: **kanonik kimlik = EN slug** (DB `categories.slug`, CSV, kod) ·
> **görünen URL = dile göre** (`/tr/` Türkçe slug, `/en/` İngilizce slug) · çift `metadata.slug` JSONB'de.
> Gerekçe: TR kullanıcı için yerli/profesyonel URL (Trendyol/Hepsiburada normu) + EN sayfada EN URL;
> site canlıya geçmeden yapıldığı için migrasyon maliyeti ~0. Taksonomi cetveli §4'ün üstüne gelir.
> Ürün slug'ları DİL-NÖTR (marka+model) — bu plan kapsamı DIŞI, dokunulmaz.

## 1. Mimari

- `categories.metadata.slug = { "tr": "...", "en": "..." }` — her iki dil için görünen slug.
  `metadata.slug.en` daima kanonik `slug` kolonuna eşittir (tek kaynak: kolon; metadata.en = kolay erişim kopyası).
- **Çözüm (server):** kategori sayfası gelen param'ı `slug` kolonu **VEYA** `metadata.slug->tr/en` üzerinden bulur.
  Param, aktif dilin slug'ı değilse → aktif dilin slug'ına **301**. (Eski TR kanonik URL'ler böylece kayıpsız yaşar.)
- **Link üretimi (client/RSC):** kategori objesi olan her yerde `getLocalizedCategorySlug(category, lang)`
  (= `metadata.slug?.[lang] || slug`). Literal slug yazan münferit yerler 301'e yaslanabilir.
- **hreflang:** kategori sayfası `alternates.languages` ile tr↔en URL çiftini bildirir + `x-default`.
- Middleware'e DB sorgusu EKLENMEZ (Kural 12) — çözüm page/RSC katmanında.

## 2. Eşleme tablosu (SSOT — migration + kod + CSV bundan türer)

### Üst kategoriler (kanonik slug DEĞİŞMİYOR; sadece metadata.slug.tr eklenir)

| Kanonik (EN) | TR slug |
|---|---|
| residential-ventilation | konut-tipi-havalandirma |
| commercial-ventilation | ticari-havalandirma |
| industrial-ventilation | endustriyel-havalandirma |
| heat-recovery-vmc | isi-geri-kazanim |
| air-treatment | hava-sartlandirma |
| air-conditioning | iklimlendirme |
| electric-heating | elektrikli-isitma |
| hygiene-sanitizer | hijyen-ve-sanitasyon |
| industrial-ceiling-fans | endustriyel-tavan-vantilatorleri |
| smart-home | akilli-ev |
| summer-ventilation | yaz-havalandirmasi |
| accessories-components | aksesuarlar |

### Alt kategoriler (⚠️ 9 kanonik RENAME + tümüne metadata.slug)

| ESKİ kanonik | YENİ kanonik (EN) | TR slug |
|---|---|---|
| banyo-ve-tuvalet-fanlari | bathroom-toilet-fans | banyo-ve-tuvalet-fanlari |
| cam-ve-pencere-tipi-fanlar | window-fans | cam-ve-pencere-tipi-fanlar |
| kanal-ici-hayalet-fanlar | inline-duct-fans | kanal-ici-hayalet-fanlar |
| aksiyel-sanayi-fanlari | axial-industrial-fans | aksiyel-sanayi-fanlari |
| cati-tipi-fanlar | roof-fans | cati-tipi-fanlar |
| radyal-fanlar | centrifugal-fans | radyal-fanlar |
| siginak-havalandirma | shelter-ventilation | siginak-havalandirma |
| dikdortgen-kanal-fanlari | rectangular-duct-fans | dikdortgen-kanal-fanlari |
| yuvarlak-kanal-tipi-fanlar | circular-duct-fans | yuvarlak-kanal-tipi-fanlar |
| iklimlendirme-cozumleri | air-conditioning-solutions | iklimlendirme-cozumleri |
| ex-proof-atex-fanlar | ex-proof-atex-fans | ex-proof-atex-fanlar |
| air-curtains | (değişmez) | hava-perdeleri |
| dehumidifiers | (değişmez) | nem-alma-cihazlari |
| jet-fans | (değişmez) | otopark-jet-fanlari |
| smoke-exhaust-fans | (değişmez) | duman-egzoz-fanlari |

### translation_key onarımı (aynı migration'da; sözlüğe 4 yeni sub.* anahtarı kod dalgasında eklenir)

| Kategori | translation_key |
|---|---|
| dikdortgen-kanal-fanlari → rectangular-duct-fans | `sub.rect-duct` (YENİ dict anahtarı) |
| yuvarlak-kanal-tipi-fanlar → circular-duct-fans | `sub.round-duct` (YENİ) |
| ex-proof-atex-fanlar → ex-proof-atex-fans | `sub.exproof` (YENİ) |
| siginak-havalandirma → shelter-ventilation | `sub.shelter` (YENİ) |

## 3. İş paketleri

1. **Migration** (`supabase/migrations/20260810_localized_category_slugs.sql`): §2 tablosunu uygular
   (9 rename + 26 metadata.slug + 4 translation_key). ⚠️ master'a merge = prod'a OTOMATİK uygulanır.
2. **Kod dalgası:** tip (`CategoryMetadata.slug`) · helper (`getLocalizedCategorySlug`) · çözüm+301
   (`getCachedCategoryData` genişletme + iki kategori page'i) · hreflang · generateStaticParams (dil-bazlı) ·
   Routes.category callsite süpürmesi (kategori objesi olan yerler) · sözlüğe 4 sub.* anahtarı (tr+en).
3. **CSV senkronu (ingestor):** ESKİ→YENİ kanonik eşlemesi script ile.
4. **Doğrulama:** tsc+lint+build (RSC prerender kapısı) + preview'da: `/tr/category/konut-tipi-havalandirma/banyo-ve-tuvalet-fanlari`
   çalışır; `/tr/category/residential-ventilation/...` → 301 TR'ye; `/en/...` EN slug'larla.

## 4. Kapsam dışı / ertelenen

- Ürün slug'ları (dil-nötr, ideal durumda).
- `/category|/products` segmentlerinin dile çevrilmesi (`/tr/kategori/...`) — istenirse ayrı, middleware-rewrite işi.
- Eski Vite-site SEO geçişi (`seo-transition-blueprint.md`) — bu plan onun girdisini değiştirmez, kolaylaştırır.
