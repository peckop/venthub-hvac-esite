# KTL-63 · Kontrol ürünleri kategori taşıması — canlı ölçüm ve taşıma önerisi

Tarih: 2026-10-26 (canlı SELECT, bugün). Emir: OPS, Recep KARAR 409. Cetvel: `docs/standards/category-taxonomy-standard.md` §6.1 (eski satır "Frekans konvertörleri · `accessories`/`frequency-converters`" bu karara göre güncellenir), `docs/plans/slug-localization-2026-08-10.md`, `docs/standards/migration-safety-standard.md`. Durum: ÖLÇÜM TAMAM, PLAN ÖNERİ (yazım yok, migration yok).

## 1. Karar 409'un hedefi

Ana kategori "Elektrik Aksesuarları / Electrical Accessories". Altında üç kategori: "Frekans Konvertörleri (İnvertör) / Frequency Converters" (Danfoss FC 51/101/102), "Hız Anahtarları / Speed Controllers", "Sensörler ve Koruma / Sensors and Protection" (SEAT PTC). "Sürücüler" adı yok. İki kademe; karar 407 tek segmentli adres (`/tr/kategori/<alt>`) geçerli.

## 2. Canlı ölçüm (bugün)

| Kategori | EN slug | TR slug | Düzey | Üstü | Aile | Ürün |
|---|---|---|---|---|---|---|
| Kontrol Sistemleri | `control-systems` | `kontrol-ve-suruculer` | 0 | — | 4 | 37 |
| Frekans Konvertörleri | `frequency-converters` | `frekans-konvertorleri` | 1 | control-systems | 3 | 35 |
| Hız Anahtarları | `speed-controllers` | `hiz-anahtarlari` | 1 | control-systems | 1 | 2 |
| Aksesuarlar | `accessories` | `aksesuarlar` | 0 | — | 2 | 3 |
| Yedek Parça ve Sensörler | `spare-parts-sensors` | `yedek-parcalar-ve-sensorler` | 1 | accessories | 2 | 3 |

Aile ve ürün atamaları (altısı da: ürünlerin kategori ve alt kategorisi ailesiyle aynı, sapma 0):

| Aile | Bugünkü kategori / alt | Ürün |
|---|---|---|
| Danfoss VLT Micro Drive FC 51 | control-systems / frequency-converters | 2 |
| Danfoss VLT HVAC Basic Drive FC 101 | control-systems / frequency-converters | 16 |
| Danfoss VLT HVAC Drive FC 102 | control-systems / frequency-converters | 17 |
| AVenS Hız Anahtarları | control-systems / speed-controllers | 2 |
| SEAT ATEX PTC Sensörü | accessories / spare-parts-sensors | 1 |
| AVenS BVU-LS Kurşun Seperatör | accessories / spare-parts-sensors | 2 |

Önemli bulgular:

- Karar 409'daki üç alt kategoriden ikisi (Frekans Konvertörleri, Hız Anahtarları) bugün "Kontrol Sistemleri"nin altında; Sensör kategorisi ise "Aksesuarlar" altında. Yani iki ayrı ana kategori tek ana kategoriye birleşiyor.
- "Elektrik Aksesuarları" adlı bir kategori canlıda yok; en yakını mevcut `accessories` ("Aksesuarlar").
- Eski kategori adresleri otomatik yönlendirilir: `categories` tablosundaki `url_takma_ad_kategori` tetiği, slug ya da `metadata.slug.tr/en` değişince eski adı `url_takma_adlari`'na yazar (emsal: 10 Ekim `kontrol-sistemleri → kontrol-ve-suruculer`, 8 kategori). Alt kategori adresi tek segmentli olduğu için bir alt kategoriyi başka üste taşımak onun adresini DEĞİŞTİRMEZ; yalnızca ana kategori adresleri değişir.
- Koda gömülü bağlantılar: `src/config/markaYonlendirmeleri.mjs` (`frekans-konvertoru` marka adresi → kök `control-systems`), `src/data/eski-adres-tohum.json` (`aksesuarlar → accessories`, `hiz-kontrolu-cihazlari → speed-controllers`; hedef bulunamazsa derleme düşer), `src/i18n/dictionaries/{tr,en}.ts` (kategori adları: `control-systems`, `accessories`, `freq-converters`, `speed-controllers`, `spare-parts`), `src/utils/getCategoryIcon.tsx`, `src/lib/services/wizard.service.ts` ve testler/fikstürler.

## 3. Önerilen taşıma (A: `accessories` satırı yeni ana kategori olur)

Gerekçe: üç alt kategorinin ikisi taşınacağı için en az satır `accessories`'e doğru taşınır; ürün ve aile kimlikleri değişmez. Emsal 10 Ekim kararı: EN kanonik slug değişmez, yalnız görünen ad ve TR slug Design adına çekilir (EN yayın kapalı).

| Adım | Ne | Etkilenen satır |
|---|---|---|
| 1 | `accessories`: ad "Elektrik Aksesuarları" (TR), "Electrical Accessories" (EN); `metadata.slug.tr` `aksesuarlar` → `elektrik-aksesuarlari`; EN slug `accessories` ya da `electrical-accessories` (bkz. soru 2) | 1 kategori |
| 2 | `frequency-converters` ve `speed-controllers`: `parent_id` control-systems → accessories; ad "Frekans Konvertörleri (İnvertör)" (görünen ad; TR slug `frekans-konvertorleri` aynı kalır) | 2 kategori |
| 3 | `spare-parts-sensors`: ad "Sensörler ve Koruma" / "Sensors and Protection"; TR slug `sensorler-ve-koruma`; EN slug bkz. soru 2 | 1 kategori |
| 4 | 4 aile (FC 51, FC 101, FC 102, AVenS Hız Anahtarları) ve 37 ürün: `category_id` control-systems → accessories (alt kategori aynı kalır) | 4 aile, 37 ürün |
| 5 | `control-systems`: boşalır (0 aile, 0 ürün); `is_active=false` ve `parent_id`=accessories. NİÇİN ÜST ATANIR: eski adres eşleyicisi (`eslestirici.ts`) pasif kategoriyi "aktif üstüne tırmanarak" çözer; üstü olmayan pasif kök "tüm ürünler"e düşerdi, takma ad satırı da işe yaramazdı (canlı slug takma adın önüne geçer, `haritaUret.ts`). Üstü accessories olunca üç eski kök adresi tek 308 ile yeni ana kategoriye gider; kod ve elle takma ad satırı gerekmez. Satır silinmez (cetvel §1, §9) | 1 kategori |
| 6 | Kod: `markaYonlendirmeleri.mjs` kök, `eski-adres-tohum.json`, sözlükler, ikon eşlemesi, fikstürler | ayrı kod değişikliği |

Yönlendirme listesi (hepsi tek 308):

| Eski adres | Yeni adres | Kaynak |
|---|---|---|
| `/tr/kategori/aksesuarlar` | `/tr/kategori/elektrik-aksesuarlari` | tetik (otomatik) |
| `/tr/kategori/kontrol-ve-suruculer` | `/tr/kategori/elektrik-aksesuarlari` | pasif kök, üstü accessories (adım 5) |
| `/tr/kategori/kontrol-sistemleri` | `/tr/kategori/elektrik-aksesuarlari` | mevcut takma ad (hedef pasif kök) → aynı yol |
| `/tr/kategori/yedek-parcalar-ve-sensorler` | `/tr/kategori/sensorler-ve-koruma` | tetik (otomatik) |
| `/en/category/control-systems` | `/en/category/accessories` | pasif kök, üstü accessories (EN slug'lar değişmez) |
| marka adresi `frekans-konvertoru` | `/tr/kategori/frekans-konvertorleri` | `markaYonlendirmeleri.mjs` kök güncellenir |

Geri alma: tek işlemlik ters migration (`scripts/db/geri-alma/`): ad, TR slug, `parent_id`, `category_id` (aile ve ürün), `is_active` ve elle eklenen takma adlar eski değerlerine döner; yedek: bu belgedeki ölçüm tablosu + yazım öncesi `categories`/aile/ürün kategori sütunlarının dökümü.

Etki: migration içerir → CLAUDE.md kural 13 (master'a birleşince prod'a otomatik uygulanır); birleştirme yalnız Recep onayıyla, "yaz" sözü OPS penceresinde. Statik vitrin sayfalarında kategori verisi değiştiği için `rendering-cache-standard.md` gereği yazımdan sonra sayfa tazelenmesi ayrıca ölçülür (ana kategori, üç alt kategori, 6 aile sayfası, menü, TR+EN).

## 4. Karar bekleyen sorular (OPS'a)

1. `AVenS BVU-LS Kurşun Seperatör` (sığınak havalandırma ünitesine takılan opsiyonel seperatör) bugün "Yedek Parça ve Sensörler" altında. Karar 409 yalnız SEAT PTC'yi "Sensörler ve Koruma"ya yazıyor. Öneri: BVU-LS de "Sensörler ve Koruma" altında kalsın (koruma aksesuarı); aksi halde kendi kategorisi gerekir.
2. EN slug değişsin mi? Öneri: hayır; `accessories` ve `spare-parts-sensors` EN slug'ları kalsın (10 Ekim emsali, EN yayın kapalı, fikstür/tohum değişikliği küçük); yalnız görünen ad ve TR slug değişir. Menü farklı bir EN slug istiyorsa DESIGN-MENU önerisi gelince karşılaştırılır.
3. "Frekans Konvertörleri (İnvertör)" görünen adında parantez var; TR slug parantezsiz kalır (`frekans-konvertorleri`). Menü etiketi için ayrı kısa ad mı gerekir?

## 5. OPS kararları (2026-10-26) ve uygulama

- EN slug'lar değişmez, onay. Menü'nün EN önerisi gelince karşılaştırılacak, fark çıkarsa OPS'a yazılır.
- Parantezli ad yalnız görünen adda; TR slug parantezsiz, onay.
- BVU-LS yeri (Recep'e soruluyor): şimdilik bugünkü yerinde, "Sensörler ve Koruma" altında. Aile bu migration'da HİÇ güncellenmez; sonradan taşımak tek satırdır: `update public.product_families set subcategory_id = <yeni alt>, updated_at = now() where slug = 'avens-bvu-ls-kursun-seperator'` (+ ürünlerde aynı alan, ürün kimlikleri aşağıdaki dökümde).
- Migration: `supabase/migrations/20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql`; geri alma: `scripts/db/geri-alma/20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.geri-al.sql`; test: `src/lib/adres/__tests__/kontrol-urunleri-elektrik-aksesuarlari-karar409.test.ts`.

## 6. DÖKÜM (taksonomi cetveli §9: yazımdan ÖNCE id + ad + önceki değer)

Kategoriler (kiracı `d3b07384-d113-495f-a558-8c38634e0000`):

| id | EN slug | Önceki ad | Önceki TR slug | Önceki üst | Önceki aktif | Önceki güncelleme |
|---|---|---|---|---|---|---|
| `6d3749d5-13fa-4cb0-9467-d99586a39f89` | `accessories` | Aksesuarlar | `aksesuarlar` | — | evet | 2026-08-27 |
| `9dcf8e58-32bf-4828-8422-b1e2e1499abe` | `control-systems` | Kontrol Sistemleri | `kontrol-ve-suruculer` | — | evet | 2026-08-31 |
| `194adcb5-df15-45b2-adc1-d5502012e4c1` | `frequency-converters` | Frekans Konvertörleri | `frekans-konvertorleri` | control-systems | evet | 2026-08-31 |
| `7c673ad2-ed6a-48b4-9aba-6930e9815636` | `speed-controllers` | Hız Anahtarları | `hiz-anahtarlari` | control-systems | evet | 2026-08-31 |
| `1a87e18b-6195-48f4-8c75-2f5f5feb137f` | `spare-parts-sensors` | Yedek Parça ve Sensörler | `yedek-parcalar-ve-sensorler` | accessories | evet | 2026-10-06 |

Önceki SEO ve açıklama metinleri (geri alma dosyasında aynen): accessories `seo_title` "Aksesuarlar: Tamamlayıcı Parçalar ve Ekipman", `seo_desc` "Ana cihazın kendisi değil, onu tamamlayan parçalar ve ekipman; yedek parçalar ve sensörler alt kategoride yer alır.", `description_i18n` TR/EN ve `seo_title_en`/`seo_desc_en` geri alma dosyasındaki dizelerle birebir; spare-parts-sensors `seo_title` "Yedek Parça ve Sensörler: Motor Koruma Sensörleri", `seo_title_en` "Spare Parts and Sensors: Motor Protection Sensors".

Aileler (taşınanlar: ilk dört; kategori `control-systems` → `accessories`, alt kategori aynı):

| Aile id | Slug | Alt kategori | Ürün sayısı |
|---|---|---|---|
| `da94e4ce-e15b-4b45-aceb-a870b9534a42` | `danfoss-vlt-micro-drive-fc-51` | frequency-converters | 2 |
| `fe4a10ed-7102-4c7b-a2b5-c511b07f6a68` | `danfoss-vlt-hvac-basic-drive-fc-101` | frequency-converters | 16 |
| `21a456fe-cdf8-48d9-911a-62022b2b8f7e` | `danfoss-vlt-hvac-drive-fc-102` | frequency-converters | 17 |
| `af7717b1-37e7-4360-9f7d-e530528e68d1` | `avens-hiz-anahtarlari` | speed-controllers | 2 |
| `55937a21-b3f4-4aea-b0c3-4a19f54d9006` | `seat-atex-ptc-sensoru` (taşınmaz) | spare-parts-sensors | 1 |
| `61a657c1-1e4e-48c9-838f-7a43c7492dd6` | `avens-bvu-ls-kursun-seperator` (taşınmaz) | spare-parts-sensors | 2 |

Taşınan 37 ürün kimliği (aile kimliği ile süzülür): FC 51: `24e6c073-6a4b-4503-8976-4497179a3f79`, `c76aefa5-501a-4ced-b856-749a78f0b699`. AVenS Hız Anahtarları: `e3dc34e5-bc06-4d1f-b303-f554d7339a16`, `e8d96abe-7f3b-4453-84f8-a59623ac7cce`. FC 101 (16) ve FC 102 (17) ürün kimlikleri canlıda `product_families` → `products.family_id` ile okunur; migration kimlik listesi yerine aile kimliğiyle ve `category_id = control-systems` koşuluyla sayılır (guard 4: 37 ürün, aksi halde durur).
