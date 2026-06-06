---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\cart.ts
skeleton_hash: 46dc29d150f0a1fa
entity_hashes:
  overview: 54581459c744006e
generated_at: 2026-06-06T21:56:01Z
---

## Genel Bakış

Bu dosya, alışveriş sepeti (cart) ile ilgili TypeScript tip tanımlarını içerir. Sepet verilerinin yapısını ve.sepetteki ürünlerle ilişkili veri modellerini tanımlar. Modül, `Product` tipini `ui-models` dosyasından içe aktararak ürün bilgilerinin sepet içindeki temsilini sağlar.

Bu dosyada fonksiyon veya metot bulunmamaktadır; yalnızca arayüz (interface) ve tip (type) tanımları yer alır. Bu tanımlar, sepet işlemlerinin (ekleme, çıkarma, güncelleme) tip güvenliğini sağlamak ve farklı dosyalar arası veri tutarlılığını korumak için kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

**Açıklama:** Verilen girdilerde fonksiyon imzaları, modül sabitleri veya kod içeriği bulunmamaktadır. Mimari varsayımlar yalnızca mevcut fonksiyon gövdelerinden türetilebilir; docstring'lerden, yorumlardan veya değişken isimlerinden bilgi çıkarılamaz. `cart.ts` dosyasının içeriği (tip tanımları, interface'ler, type alias'lar vb.) analiz için sağlanmamıştır.

**Gerekli bilgiler:**
- Fonksiyon imzaları veya metot tanımları
- Interface / Type tanımları (eğer fonksiyonel bir rol üstleniyorsa)
- Modül içi sabitler veya varsayılan değerler

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### CartItem
- `id: string`
- `product: Product`
- `quantity: number`
- `unitPrice?: number`

---

## AST POINTERS

Bu dosyada (`cart.ts`) tanımlanmış herhangi bir fonksiyon gövdesi bulunmamaktadır. Dosya yalnızca TypeScript tip/arayüz tanımları içermektedir.

> Fonksiyon gövdesi verilmediğinden AST Pointer üretilememektedir.

---

## NODE ID STANDARD

  file: src\types\cart.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartItem