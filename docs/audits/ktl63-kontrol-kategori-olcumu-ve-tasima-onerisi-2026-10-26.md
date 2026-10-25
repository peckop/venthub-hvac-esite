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
| 5 | `control-systems`: boşalır (0 aile, 0 ürün); `is_active=false`. Eski adresleri (`control-systems`, `kontrol-ve-suruculer`, `kontrol-sistemleri`) yeni ana kategoriye yönlendirmek için `url_takma_adlari`'na doğrudan satır (tetik slug değişimi olmadığı için yazmaz) | 1 kategori, 3 takma ad |
| 6 | Kod: `markaYonlendirmeleri.mjs` kök, `eski-adres-tohum.json`, sözlükler, ikon eşlemesi, fikstürler | ayrı kod değişikliği |

Yönlendirme listesi (hepsi tek 308):

| Eski adres | Yeni adres | Kaynak |
|---|---|---|
| `/tr/kategori/aksesuarlar` | `/tr/kategori/elektrik-aksesuarlari` | tetik (otomatik) |
| `/tr/kategori/kontrol-ve-suruculer` | `/tr/kategori/elektrik-aksesuarlari` | adım 5 (elle satır) |
| `/tr/kategori/kontrol-sistemleri` | `/tr/kategori/elektrik-aksesuarlari` | mevcut takma ad, hedef güncellenir |
| `/tr/kategori/yedek-parcalar-ve-sensorler` | `/tr/kategori/sensorler-ve-koruma` | tetik (otomatik) |
| `/en/category/control-systems`, `/en/category/spare-parts-sensors` (EN slug değişirse) | yeni EN adresler | tetik / adım 5 |
| marka adresi `frekans-konvertoru` | `/tr/kategori/frekans-konvertorleri` | `markaYonlendirmeleri.mjs` kök güncellenir |

Geri alma: tek işlemlik ters migration (`scripts/db/geri-alma/`): ad, TR slug, `parent_id`, `category_id` (aile ve ürün), `is_active` ve elle eklenen takma adlar eski değerlerine döner; yedek: bu belgedeki ölçüm tablosu + yazım öncesi `categories`/aile/ürün kategori sütunlarının dökümü.

Etki: migration içerir → CLAUDE.md kural 13 (master'a birleşince prod'a otomatik uygulanır); birleştirme yalnız Recep onayıyla, "yaz" sözü OPS penceresinde. Statik vitrin sayfalarında kategori verisi değiştiği için `rendering-cache-standard.md` gereği yazımdan sonra sayfa tazelenmesi ayrıca ölçülür (ana kategori, üç alt kategori, 6 aile sayfası, menü, TR+EN).

## 4. Karar bekleyen sorular (OPS'a)

1. `AVenS BVU-LS Kurşun Seperatör` (sığınak havalandırma ünitesine takılan opsiyonel seperatör) bugün "Yedek Parça ve Sensörler" altında. Karar 409 yalnız SEAT PTC'yi "Sensörler ve Koruma"ya yazıyor. Öneri: BVU-LS de "Sensörler ve Koruma" altında kalsın (koruma aksesuarı); aksi halde kendi kategorisi gerekir.
2. EN slug değişsin mi? Öneri: hayır; `accessories` ve `spare-parts-sensors` EN slug'ları kalsın (10 Ekim emsali, EN yayın kapalı, fikstür/tohum değişikliği küçük); yalnız görünen ad ve TR slug değişir. Menü farklı bir EN slug istiyorsa DESIGN-MENU önerisi gelince karşılaştırılır.
3. "Frekans Konvertörleri (İnvertör)" görünen adında parantez var; TR slug parantezsiz kalır (`frekans-konvertorleri`). Menü etiketi için ayrı kısa ad mı gerekir?
