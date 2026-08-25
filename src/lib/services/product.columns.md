---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\product.columns.ts
skeleton_hash: 48841921b454beb5
entity_hashes:
  overview: ef888ebf26b7056e
generated_at: 2026-08-25T08:44:37Z
---

## Genel Bakış

Bu modül, ürün varyantları ve aileleri için tablo/liste görünümlerinde kullanılacak sütun tanımlarını içerir. Dosyada fonksiyon bulunmaz; yalnızca modül seviyesinde üç sabit tanımlanmıştır: `VARIANT_DETAIL_COLUMNS`, `VARIANT_LIST_COLUMNS` ve `FAMILY_LIST_COLUMNS`. Bu sabitler, ürün verilerinin farklı bağlamlarda nasıl görüntüleneceğini belirleyen sütun yapılandırmalarını tutar.

## Fonksiyon Grupları

Bu dosyada fonksiyon bulunmadığından fonksiyon gruplaması yapılmamıştır. Modül, yalnızca sabit tanımlarından oluşur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül yalnızca sabit tanımları (`VARIANT_DETAIL_COLUMNS`, `VARIANT_LIST_COLUMNS`, `FAMILY_LIST_COLUMNS`) içermekte olup, fonksiyon gövdesi bulunmamaktadır. Aksiyomlar yalnızca fonksiyon gövdelerinden üretildiğinden, bu modüle ilişkin çıkarım yapılabilecek bir kaynak mevcut değildir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **VARIANT_DETAIL_COLUMNS** (str) — `'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status,...`
- **VARIANT_LIST_COLUMNS** (str) — `'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status,...`
- **FAMILY_LIST_COLUMNS** (str) — `'id, name, slug, series_code, description, brand_id, category_id, subcategory...`

---

## AST POINTERS

Bu dosyada (`product.columns.ts`) tanımlı fonksiyon bulunmamaktadır. Dosya yalnızca üç sabit string değişken içermektedir:

- `VARIANT_DETAIL_COLUMNS` — sabit (str)
- `VARIANT_LIST_COLUMNS` — sabit (str)
- `FAMILY_LIST_COLUMNS` — sabit (str)

Analiz edilecek fonksiyon gövdesi olmadığı için AST Pointer kaydı oluşturulmamıştır.

---

## NODE ID STANDARD

  file: src\lib\services\product.columns.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: FAMILY_LIST_COLUMNS
  export: VARIANT_DETAIL_COLUMNS
  export: VARIANT_LIST_COLUMNS