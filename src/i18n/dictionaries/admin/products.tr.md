---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\products.tr.ts
skeleton_hash: 6d89d5e03d102bda
entity_hashes:
  overview: b4058d53edae1644
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış

Bu dosya, VentHub HVAC admin panelinin ürünlerle ilgili arayüz metinlerinin Türkçe çeviri sözlüğünü tanımlar. i18n (uluslararasılaştırma) sistemi tarafından yüklenen bir modül olup, ürün yönetimi ekranlarında kullanılacak tüm Türkçe metinleri merkezi bir yapıda sunar. Dosya herhangi bir fonksiyon veya dış bağımlılık içermeyip, doğrudan bir sözlük nesnesi dışa aktarır.

## Fonksiyon Grupları

Bu dosyada fonksiyon bulunmamaktadır. Modül, yalnızca `products` adında bir çeviri sözlüğü nesnesi tanımlayan üst seviye bir TypeScript dosyasıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel aksiyomlar:

[Aksiyom 1]: Eğer `products` sabiti tanımlı (defined) değilse, i18n lookup işlemleri `undefined` veya hata sonucu üretir.

[Aksiyom 2]: Eğer `products` bir object değilse (örn: null, string, array), çeviri anahtarlarına erişimde TypeError oluşur.

[Aksiyom 3]: Eğer `products` nesnesi içeriği boş object `{}` ise, hiçbir çeviri anahtarı eşleşmez ve fallback mekanizması devreye girer veya ham key string'i döner.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **products** (object) — `{
  subtitle: 'Tüm ürün kataloğunu yönetin, stok ve fiyat güncellemelerini a...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır. Dosya, bir i18n sözlük dosyası olup yalnızca sabit bir nesne (`products`) içermektedir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\products.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: products