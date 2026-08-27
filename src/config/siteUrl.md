---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\config\siteUrl.ts
skeleton_hash: e93df4d3e36f06e1
entity_hashes:
  func:getSiteUrl: d80f85481d8cb42c
  func:stripTrailingSlash: 3465e09577d109be
  overview: 2aa2ae0b13b700f6
generated_at: 2026-08-27T07:32:08Z
---

## Genel Bakış
Bu modül, site URL'siyle ilgili temel yardımcı fonksiyonları içerir. URL'lerin biçimlendirilmesi ve site adresinin elde edilmesi gibi konfigürasyon odaklı işlemlerden sorumludur. Modül, iki fonksiyondan oluşan minimal bir yapıya sahiptir.

## Fonksiyon Grupları

### URL İşleme Yardımcıları
URL'lerin standartlaştırılması ve site adresinin elde edilmesi için gerekli temel işlemleri sağlar. Bu fonksiyonlar, URL'lerdeki biçim tutarsızlıklarını gidermek ve site kök adresini sunmak amacıyla kullanılır.
- stripTrailingSlash, getSiteUrl

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modülün fonksiyon gövdeleri verilmemiştir. Yalnızca fonksiyon imzaları (`stripTrailingSlash`, `getSiteUrl`) ve bir sabit (`SITE_URL`) mevcuttur. Fonksiyon gövdesi olmadan bu fonksiyonların hangi koşullara bağlı çalıştığı, hangi hata durumlarını ele aldığı veya hangi varsayımlara dayandığı belirlenemez. Kaynak dosyanın (`siteUrl.ts`) içeriği sağlanırsa aksiyomlar üretilebilir.

---

## FONKSİYON DETAYLARI

### stripTrailingSlash
**Ne yapar**: Verilen URL string'inin sonundaki eğik çizgiyi (trailing slash) kaldırır. Site URL'lerinin standartlaştırılması ve tutarlı kanonik adres oluşturulması için kullanılır.
**Nasıl yapar**: Fonksiyonun iç mantığı verilen kaynakta belirtilmemiştir. Adından anlaşılacağı üzere, gelen `url` parametresinin son karakteri `/` ise bu karakteri kaldırarak geri döner. Dosya seviyesindeki docstring'te, bu fonksiyonun sıralamasının önemli olduğu ve `NEXT_PUBLIC_SITE_URL` ortam değişkeni prod ortamda set edilmediğinde `VERCEL_URL`'e düşüldüğü belirtilmiştir. Ancak `VERCEL_URL` değerinin deploy'a özel olduğu ve her deploy'da değiştiği, bu durumun `robots.txt` dosyasında sorunlara yol açtığı canlı arıza notu olarak kayıtlıdır.
**Parametreler**:
- url: string — Eğik çizgisi kaldırılacak olan URL adresi
**Dönüş**: Bilinmiyor. Kaynakta dönüş tipi belirtilmemiştir.

### getSiteUrl
**Ne yapar**: Sitenin kök URL adresini döndürür. Uygulamanın farklı ortamlarda (development, production, preview) doğru site URL'sine erişmesini sağlar.
**Nasıl yapar**: Fonksiyonun iç mantığı verilen kaynakta belirtilmemiştir. Dosya seviyesindeki docstring'te, `NEXT_PUBLIC_SITE_URL` ortam değişkeninin prod ortamda set edilmediğinde `VERCEL_URL`'e düşüldüğü ve bu değerin deploy'a özel olup her deploy'da değiştiği belirtilmiştir. Bu fonksiyonun, ortam değişkenlerinden site URL'sini seçen bir mantık içerdiği düşünülmektedir ancak bu çıkarım olup kaynakta doğrulanmamıştır.
**Parametreler**: Bu fonksiyon parametre almaz.
**Dönüş**: Bilinmiyor. Kaynakta dönüş tipi belirtilmemiştir.

---

## SABİTLER
- **SITE_URL** (call) — `getSiteUrl()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/config/siteUrl.ts::SITE_URL (anonim ok fonksiyonu)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `process` — global nesne; `typeof process !== 'undefined'` ile varlığı kontrol edilir, ortam değişkenlerine erişim için kullanılır
  - `process.env.NEXT_PUBLIC_SITE_URL` — açık yapılandırma ortam değişkeni; varsa `stripTrailingSlash` ile sonu kesilerek doğrudan döndürülür (en yüksek öncelik)
  - `process.env.VERCEL_PROJECT_PRODUCTION_URL` — Vercel'in kalıcı production alan adı ortam değişkeni; varsa başına `https://` eklenip `stripTrailingSlash` ile sonu kesilerek döndürülür (ikinci öncelik)
  - `process.env.VERCEL_URL` — deploy'a özel adres ortam değişkeni; varsa başına `https://` eklenip `stripTrailingSlash` ile sonu kesilerek döndürülür (üçüncü öncelik)
  - `stripTrailingSlash` — dışarıda tanımlı fonksiyon; URL sonundaki eğik çizgiyi kaldırır, her ortam değişkeni dönüşünde çağrılarak kullanılır
- **Dönüş**: `string` — site URL'si; öncelik sırasıyla ortam değişkenlerinden biri veya `'http://localhost:3000'` (hiçbiri yoksa)

---

## NODE ID STANDARD

  file: src\config\siteUrl.ts
  function: src\config\siteUrl.ts::stripTrailingSlash
  function: src\config\siteUrl.ts::getSiteUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: SITE_URL
  export: getSiteUrl
  export: stripTrailingSlash