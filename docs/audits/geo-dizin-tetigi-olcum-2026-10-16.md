# Dizin tetiği ölçümü ve otomatik tetik tasarımı (SEO-55, 2026-10-16)

Cetvel: `docs/standards/yayin-gorunurluk-denetim-standard.md` Y2.1 · `docs/standards/rendering-cache-standard.md` (DB tetiği ↔ webhook dalı).
Yöntem: kod okuma (`src/app/api/webhook/supabase/route.ts`, `src/lib/seo/indexnow.ts`, `src/config/features.ts`), canlı veritabanında salt okuma sorguları (tetik listesi, tablo-sütun taraması), iş akışı dizini taraması. Canlıya yazım yok. Sorgu/arama verisi bu dosyaya girmedi (P6).

## 1. Soru ve kısa cevap

Soru: sayfa metni, adresi ya da meta açıklaması canlıda değişince arama motorlarına kendiliğinden haber gidiyor mu?

Cevap: DB yazımı webhook'a kadar kendiliğinden gidiyor, webhook IndexNow'u çağırıyor, ama **ürün, kategori ve marka adresleri bugün süzgeçte düşüyor**; kod deploy'u için hiçbir tetik yok; Google için kuyruk yok. FC 101 olayı bu üç boşluğun toplamıdır.

## 2. Ölçülen zincir

| Halka | Durum | Kanıt |
|---|---|---|
| DB yazımı → webhook | VAR. 9 tabloda tetik, hepsi `AFTER INSERT/UPDATE/DELETE`, sütun filtresi yok (`UPDATE OF` yok): metin, slug, meta yazımı webhook'a gider. Tetiği olan tablolar: products, product_families, categories, brands, product_images, product_prices, price_lists, inventory_movements, site_settings (yalnız `satis_kipi`). | `pg_trigger` sorgusu, 16 Ekim |
| Metin taşıyan tablolar tetiksiz mi? | Yalnız `product_authorities` (sayfa kodu kullanmıyor: `src/`te yalnız tip dosyası) ve `product_search_index` (iç arama). Sayfa metni taşıyan tablo açıkta değil. | tablo-sütun taraması |
| Webhook → IndexNow | VAR ve yalnız fiyat/stok DEĞİL: `indexNowBildir(revalidatedPaths)` tek çağrıyla her dalın tazelediği yolları bildirir. (REC-127 notundaki "yalnız fiyat/stok" ifadesi yanlış okunmuş.) | `route.ts` 794. satır |
| IndexNow süzgeci | **KAPALI-KİP DÜŞÜRÜR.** `ADRES_SEMASI_K3B = false` iken `indexNoweGiderMi` `/tr/products`, `/tr/category`, `/tr/brands` ve tüm ürün/kategori/marka yollarını düşürür; yalnız bilgi merkezi, destek, hakkımızda, iletişim, ürün seçici ve dil kökü gider. Sonuç webhook yanıtında `atlandi/yayin-oncesi` görünür ama kalıcı kaydı yoktur. Gerekçe: K4 (adresler K3-b açılınca değişecek, arama motoruna eski şemayı öğretme). | `indexnow.ts` 176-188; `features.ts` 131; test `indexnow.test.ts` "bayrak KAPALI" |
| Webhook sonucunun kaydı | YOK. pg_net yanıt tablosunda saatlik tutuluyor (30 günlük sorguda tek satır); Vercel günlüğüne yalnız hata düşüyor. "IndexNow gitti mi" sorusunun geçmişe dönük cevabı yok. | `net._http_response` sorgusu |
| Kod deploy'u → dizin | YOK. `.github/workflows` altında `deployment_status` ya da deploy hook yok. Şablon değişikliği (başlık formülü, meta kırpma, JSON-LD) hiçbir bildirim üretmez. | iş akışı dizini taraması |
| Google dizin isteği | Otomatik yolu YOK. Hizmet hesabı URL denetimi API'si yalnız inceler; dizin isteği Search Console arayüzünde, günlük sınır 11 (SEO-54'te ölçüldü). Haritadaki `lastmod` dışında kendiliğinden Google'a haber yolu yok. | SEO-45, SEO-54 |
| Harita `lastmod` | Aile: ailenin ve aktif varyantlarının en son `updated_at`'i (REC-454). Marka, sabit sayfa: `lastmod` yok. Yani metin değişimi aile için haritaya yansır, marka metni yansımaz. | `src/app/sitemap.ts` |

## 3. FC 101 olayının sebep zinciri

1. Aile adresi (slug) DB'de değişti. Tetik çalıştı, webhook eski ve yeni yolu tazeledi.
2. IndexNow süzgeci K4 gereği ürün adresini düşürdü; kayıt kalmadı. Kimse GEO-SEO'ya haber vermedi.
3. Google eski adresi eski metniyle dizinde tutmaya devam etti; yeni adres için "bilinmiyor" döndü.

Metin düzeltmesinin yayılmaması değil, **adres değişimine bağlı bildirimin hiç gitmemesi** sorundu.

## 4. Kararı bekleyen nokta: K4 ile "her değişiklikte dizinle" çelişiyor

K4 (2026-09-03) ürün/kategori/marka adreslerinin IndexNow'a gitmemesini ister; 16 Ekim talimatı "canlıya çıkan her değişiklik bildirilsin" ister. İkisi aynı anda geçerli olamaz.

Önerim: **K4 gevşetilsin.** Bugün canlı olan, haritada listeli ve 200 veren adresler bayrak kapalıyken de gitsin. Gerekçe: IndexNow yalnız "bu sayfa değişti" der; K3-b açılınca eski adres 308 ile yeni adrese gider ve arama motorları 308'i izler; Google bu adresleri zaten haritadan biliyor. Bedeli: Bing, eski şemayı kısa süre öğrenir. K4 Recep kararıdır; değiştirme yetkisi OPS üzerinden Recep'tedir.

## 5. Tasarım (üç parça, DB yazımına bağımlılığı azaltan yedekli)

**Parça A: hızlı yol (webhook, ÜRÜN).** K4 kararı gevşerse `indexNoweGiderMi` kapalı kipte haritada olan adresleri geçirir (test gerektirir: INV-INDEXNOW-1 güncellenir). Ek: webhook `indexNow` sonucunu `console.warn("[IndexNow] durum=… gonderilen=…")` ile Vercel günlüğüne yazar; kalıcı kayıt şimdilik bu. Kalıcı tablo gerekirse ayrı karar (migration = Recep kapısı).

**Parça B: yedek ve kod değişimi yakalayıcı (betik, GEO-SEO).** `scripts/seo/degisen-adres-bildir.mjs`: canlı site haritasını ve her adresin `title / meta description / H1` özetini (hash) önceki tabanla karşılaştırır; değişen ya da yeni adresleri IndexNow'a gönderir, Google kuyruk dosyasını (depo dışı) üretir. DB tetiğinden bağımsızdır: webhook düşse, toplu yazım tetiği atlasa, şablon kodu değişse de yakalar. `--kuru` ilk koşu, taban ilk koşuda alınır. Öncelik: yeni adres > metin değişimi > yalnız `lastmod`.

**Parça C: tetik (iş akışı, ALTYAPI).** `.github/workflows/dizin-tetigi.yml`: (1) `deployment_status` production `success` olunca B'yi koşar, (2) günde bir cron yedeği (DB yazımı için), taban önbellekte (depo dışı). `permissions: contents: read`. Sır gerekmez (IndexNow anahtarı kamuya açıktır).

**Google (GEO-SEO, günlük).** Kuyruk dosyasından günde 11 adres Search Console'da dizin isteği alır; bu adım tarayıcı oturumuyla yapılır ve benim günlük koşumdur, Recep'ten bir şey beklemez. Tam otomatik olmayan tek halka budur; sınırı Google koyuyor.

## 6. Kim neyi yapacak

| İş | Sahip | Önkoşul |
|---|---|---|
| K4 gevşetme kararı | Recep (OPS iletir) | Bu not |
| `indexNoweGiderMi` kapalı-kip düzeltmesi + sonuç günlüğü + test | URUN (webhook rotası: ÜRÜN/EDGE) | K4 kararı |
| `degisen-adres-bildir.mjs` + testi + taban | GEO-SEO | yok (K4'ten bağımsız, hemen başlanır) |
| `dizin-tetigi.yml` | ALTYAPI | betik birleşmiş olacak |
| Cetvel Y2.1: "dizin tetiği otomatiktir" maddesi | GEO-SEO | Parça B-C canlı |
| Kesik meta açıklamalı 25 sayfanın veri düzeltmesi | URUN (SEO-54 notu) | yok |

## 7. Bitiş ölçütü (karttan)

İnsan tetiği olmadan bir canlı değişiklikte IndexNow `200` kaydı görülünce SEO-55 Done. Kayıt kaynağı: Parça C'nin Actions koşu günlüğü (ya da Parça A günlüğü). Ölçülmeden "oldu" yazılmaz.
