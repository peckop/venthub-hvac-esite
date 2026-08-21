# T138-VH — Model Katmanı Planı: "Kart = Model, Seri = Landing" (2026-08-21)

> Şerit: **ÜRÜN · T138-VH** · Durum: **PLAN — Recep onayı bekliyor. Veri yazımı YOK.**
>
> **KAYNAK/CETVEL:** `product-schema-standard` (Split-Model Aksiyom-1: `product_families` parent +
> `products.family_id`; Aksiyom-3 Sıfır-EAV) · `category-taxonomy-standard` ·
> `canonical-url-standard` §4 (aile URL'i tek kanonik adres, `?sku=` canonical'a girmez;
> bekçi INV-CANONICAL-2) · `rendering-cache-standard` (görünen her tablonun tetik+webhook dalı) ·
> `storefront-design-standard`. Ölçüm dayanağı: `docs/audits/t138-hiyerarsi-calismasi.md`.
>
> **KARAR ZİNCİRİ:** Recep itirazı ("piyasada B aktif, insan alışkanlığına ters mi?") → A önerisi
> geri çekildi → ÜRÜN ve OPS bağımsız olarak aynı yere vardı: **C = kart-model + seri-landing**.

## 1. Ne değişiyor (tek paragraf)

Bugün `product_families` = **seri** (Lineo Quiet) ve vitrinde 1 kart; boy seçimi aynı sayfada
`?sku=` ile yapılıyor. Yeni düzende `product_families` = **model** (Lineo 100 Quiet) ve her
modelin kendi sayfası olur; **seri** üstte bir landing sayfası olarak yaşar (tanıtım + model
kartları + karşılaştırma tablosu). Varyant (standart/ES, faz, ATEX) model sayfası içinde küçük
seçici olarak kalır — ayrı sayfa DEĞİL.

```
Kategori: Konut Havalandırma › Kanal İçi Fanlar
   └─ SERİ LANDING  /tr/products/vortice-lineo-quiet        ← bugünkü slug AYNEN kalır
        ├─ tanıtım metni + karşılaştırma tablosu (debi/basınç/ses/çap/güç)
        ├─ [KART] Lineo 100 Quiet → /tr/products/vortice-lineo-100-quiet
        │        └─ sayfa içi seçici: standart (AC) / ES (EC)   ?sku=
        ├─ [KART] Lineo 125 Quiet …  (6 model)
```

## 2. Pilot: Vortice Lineo Quiet (ölçümle seçildi)

| Ölçüt | Değer |
|---|---|
| Ürün | 12 (6 model × 2 varyant: AC standart / EC "ES") |
| technical_specs | 12/12 dolu · **23 anahtar**, **14'ü modeller arasında değişiyor** (rpm, debi m³/h & l/s, statik basınç Pa, ses dBA, çap, A/B/C ölçü, ağırlık, akım, güç, motor tipi) |
| Görsel | %100 |
| Geri alım | 12 satır |

Tek ailede **üç mekanizma birden** sınanır: model bölünmesi, sayfa-içi varyant seçici,
karşılaştırma tablosu. **SEAT pilot önerisi geri çekildi** — ölçüm: 81 ürün ama yalnız 4 spec
anahtarı; orada model sayfası boş çıkar, tasarımı kanıtlamaz (T140'ın ilk kalemi: SEAT spec
zenginleştirme, kaynak seat-ventilation.fr ürün fişleri — model sayfasından ÖNCE).

## 3. Veri işi (RECEP KAPISI — migration YOK)

Betik: `scripts/db/product-data/t138-model-split.mjs` (yeni), `--dry-run` varsayılan, yazım
yalnız `--apply` + service_role ile; `upload-pilot-images.mjs` deseninde **artımlı envanter**
(her yazımdan sonra diske) + `--rollback`.

**Pilot dry-run envanteri (beklenen):**
- `product_families` **+6 yeni satır** (model): slug `vortice-lineo-100-quiet` … `-315-quiet`;
  `series_code` = mevcut seri kodu; kategori/alt-kategori seri kaydından miras.
- `products` **12 satırda `family_id` güncellemesi** (her ürün kendi modeline).
- Seri kaydı (`vortice-lineo-quiet`) **SİLİNMEZ** — tipi "seri/landing" olur (bkz. §4 kolon kararı).
- **308 haritası**: eski varyant slug'ları → yeni **model** sayfası (bugün aile sayfasına gidiyorlar;
  `[slug]/page.tsx:130-160` mekanizması korunur, hedef değişir). Harita dry-run çıktısında satır satır.

**Kabul:** dry-run çıktısı Recep'e gösterilir, GO gelirse `--apply`, sonra envanter + canlı kanıt.

## 4. Şema kararı (tek soru gerektirir — §8'de)

Seri ile modeli ayırt etmek için `product_families`'e ayrım gerekir. İki yol:
- **(a) `parent_family_id` (öneri):** seri = parent satır, model = child satır. Split-Model'in
  kendi mantığının bir üst katmanı; kart listeleri `parent_family_id is not null` ile modelleri,
  landing `is null` ile serileri çeker. **Migration gerektirir** (kolon + FK) → Recep kapısı.
- **(b) Kolon yok, `series_code` ile gruplama:** seri landing'i `series_code`'tan türetilir, seri
  kaydı silinir. Migration yok ama seri sayfasının kendi metni/SEO alanı olmaz (bugün seri
  kaydında `description`, `meta_title` var — kaybedilir).

Öneri **(a)**: seri sayfası gerçek bir içerik sayfası olacaksa kendi kaydı olmalı. Tek migration,
tek kolon, geri alınabilir.

## 5. Kod işi (ÜRÜN şeridi, ayrı PR'lar)

1. `src/app/[lang]/products/[slug]/page.tsx` — slug çözümü iki dallı olur: **model** ise mevcut
   PDP; **seri** ise yeni landing görünümü. `generateStaticParams` her ikisini üretir.
2. Yeni bileşen `SeriesLandingView` (tanıtım + model kartları + karşılaştırma tablosu). Tablo
   kolonları `technical_specs`'te **değişen** anahtarlardan otomatik türetilir (Lineo'da 14 alan).
3. `VariantSelector` **küçülür**: kapasite ekseni kalkar (kapasite artık model), geriye
   standart/ES · faz · ATEX kalır. (registry-T139 kademeli seçici bu sayede sadeleşir.)
4. `family.service.ts` — `getFamiliesEnriched` model/seri ayrımını bilir; keşif yüzeyleri
   **model** kartı gösterir.
5. **Tazeleme:** yeni landing yolları `handle_supabase_webhook` revalidate dalına eklenir
   (rendering-cache-standard: görünen her yüzeyin dalı olacak). Kanıt = `net._http_response` taze 200.

## 6. SEO kabul kriterleri (üçü de kapı — OPS şartı)

1. **Model başına özgün açıklama.** 220 sayfa aynı metinle açılırsa kopya-içerik olur. Pilotta
   6 model için metin, spec'ten türetilmiş **ayırt edici** cümlelerle yazılır (debi/çap/ses).
   Ölçek dalgasında bu T140 (içerik kalitesi) ile birleşik yürür — spec'i zayıf marka (SEAT)
   model sayfasına ONDAN ÖNCE geçmez.
2. **Varyant ayrı sayfa DEĞİL.** `?sku=` davranışı ve canonical = model sayfası korunur
   (canonical-url-standard §4; bekçi INV-CANONICAL-2 kırmızı vermemeli).
3. **308 haritası eksiksiz.** Eski varyant slug'ları → yeni model sayfası; **19 seri slug'ı
   değişmez** (kırık link yok, biriken SEO korunur). Harita dry-run envanterinde.

Ek kabul: sitemap iki katmanı da içerir (seri + model), `lastmod` tazelenir.

## 7. Canlı yüzey kanıtı (pilot bitiminde)

- `/tr/products/vortice-lineo-quiet` → seri landing, 6 model kartı + karşılaştırma tablosu görünür.
- `/tr/products/vortice-lineo-100-quiet` → model sayfası: fiyat, spec, standart/ES seçici, görsel.
- Eski varyant slug'ı → 308 → doğru **model** sayfası (aile değil).
- `net._http_response` taze 200 (tetik→webhook→revalidate kendiliğinden).
- Gönderim öncesi kapı seti ÜÇ: `type-check` + `test` (TAM takım) + `lint`.

## 8. Recep'e açık iki soru

1. **§4 şema:** `parent_family_id` kolonu (migration, önerilen) mi, migration'sız `series_code`
   gruplaması mı?
2. **Kart adı biçimi:** model kartı "Lineo 100 Quiet" mi, "Vortice Lineo 100 Quiet" mi
   (marka önekli)? Bugünkü ürün adları marka önekli; kartta tekrar eder.

## 9. Sıra ve bedel

| Dalga | Kapsam | Yeni aile | Not |
|---|---|---|---|
| **Pilot** | Lineo Quiet | 6 | kanıt üretir, 12 satır geri alınır |
| 2 | Vortice kalanı | ~108 | pilot kanıtı sonrası; 19 seri landing korunur |
| 3 | SEAT | 14 | **önce** T140 spec zenginleştirme |
| 4 | Nicotra/Danfoss/AVenS | ~94 | model = SKU olan yerlerde kart tek seçenekli (piyasa da böyle) |

Toplam hedef ~220 model-aile + ~32 seri landing.

## 10. ÇELİŞEN-MEVCUT

- `canonical-url-standard` §4 "aile URL'i tek kanonik adres" cümlesi, aile=model olunca
  **aynen geçerli** kalır ama metin "aile" kelimesini seri anlamında kullanıyor → cetvel
  sözlüğü güncellenmeli (bu planla birlikte).
- `getFamiliesEnriched` bugün her aileyi kart sayıyor; model katmanı gelince kart sayısı
  32 → ~220 olur: keşif sayfası sayfalama/performans ölçümü gerekir (ölç-önce, kabul kriteri).
- `product_images` INSERT/DELETE politikası hâlâ yok (T069, ADMIN) — bu plan görsel yazımı
  yapmaz, etkilenmez.
