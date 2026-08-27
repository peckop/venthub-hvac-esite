---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useCartHook.ts
skeleton_hash: 423a81c5d372a8e1
entity_hashes:
  func:useCart: 809254743b71e846
  overview: a6bb925fcf63c562
generated_at: 2026-08-27T08:34:20Z
---

## Genel Bakış
Bu modül, alışveriş sepeti (cart) işlemlerini yöneten bir React custom hook'u içerir. Modülde yalnızca `useCart` fonksiyonu tanımlıdır ve sepete ilişkin durum bilgisini ve işlemleri tek bir noktadan sunar.

## Fonksiyon Grupları
### Sepet Hook'u
Alışveriş sepetinin durumunu ve sepete ait işlemleri dışarıya açan ana hook fonksiyonudur. Modüldeki tek fonksiyon olduğundan, tüm sepet sorumluluğu bu fonksiyon üzerindedir.
- useCart

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### useCart
**Ne yapar**: CartContext'i güvenli bir şekilde tüketerek alışveriş sepeti durumunu ve aksiyonlarını sağlayan bir React custom hook'udur. CartProvider dışında kullanıldığında (statik build veya izole test ortamları gibi durumlar) runtime hatalarını önlemek için güvenli bir no-op fallback nesnesi döndürür.

**Nasıl yapar**: React'in `useContext` hook'u ile `CartContext`'i tüketir. Elde edilen context değerini kontrol eder; eğer context mevcut değilse (yani fonksiyon bir `CartProvider` sarmalayıcısı dışında çağrılıyorsa), `CART_FALLBACK` adlı önceden tanımlanmış güvenli bir fallback nesnesi döndürür. Bu mekanizma, statik site üretimi veya izole test senaryoları gibi provider'ın bulunmadığı ortamlarda uygulamanın çökmesini engeller. Context mevcutsa, doğrudan o context nesnesini döndürür.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Güncel alışveriş sepeti context'ini döndürür. Bu context; sepet öğelerini (items), toplam değerleri (totals) ve sepeti değiştirme fonksiyonlarını (modification functions) içerir. `CartProvider` dışında çağrıldığında `CART_FALLBACK` nesnesi döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/CartContext::CartContext
- import: react::useContext

---

## SABİTLER
- **CART_FALLBACK** (object) — `{
  items: [],
  syncing: false,
  addToCart: () => { },
  removeFromCart...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCartHook.ts::useCart
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — `useContext(CartContext)` çağrısının dönüş değeri; CartContext provider tarafından sağlanan mevcut sepet bağlamını tutar
- **Dönüş**: `context` truthy ise `context` (CartContext değeri); `context` falsy ise `CART_FALLBACK` sabiti (statik build veya izole ortamlar için güvenli geri dönüş)

---

## NODE ID STANDARD

  file: src\hooks\useCartHook.ts
  function: src\hooks\useCartHook.ts::useCart

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCart