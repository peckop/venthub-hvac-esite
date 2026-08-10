---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCartHook.ts
skeleton_hash: 83483c8bf6e92f1f
entity_hashes:
  func:useCart: 809254743b71e846
  overview: a6bb925fcf63c562
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, uygulama genelinde alışveriş sepeti işlevselliğini yönetmek ve merkezileştirmek için tasarlanmış bir React hook'udur. Sepetin durumunu, öğelerini ve ilgili tüm işlemleri (ekleme, kaldırma, güncelleme) kontrol ederek tutarlı bir kullanıcı deneyimi sağlar.

## Fonksiyon Grupları
### Merkezi Sepet Yönetimi Hook'u
Uygulamanın tüm bölümlerinden erişilebilen, sepet verisiyle ilgili tüm durum ve işlemleri tek bir接口 üzerinden sunar.
- useCart

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi (function body) sağlanmadığından, bu modüle özgü somut mimari varsayımlar çıkarılamamıştır. Aşağıda yalnızca fonksiyon imzasından türetilen minimal aksiyomlar yer almaktadır:

**[Aksiyom 1]:** Eğer `useCart()` bir React hook olarak çağrılmıyorsa (React bileşen içi veya başka bir hook içinde değilse), React Hook kuralları ihlal edilir ve beklenmeyen davranış oluşur.

---

## FONKSİYON DETAYLARI

### useCart
**Ne yapar**: React uygulamasının alışveriş sepeti durumunu ve sepet üzerinde gerçekleştirilabilecek eylemleri (ürün ekleme, çıkarma, miktar değiştirme vb.) sağlayan React Context'i tüketir. Fonksiyon, çağrıldığı ortamda CartProvider mevcut değilse bile uygulamanın çökmesini engelleyerek güvenli bir şekilde çalışmaya devam etmesini sağlar.

**Nasıl yapar**: `useContext` hook'unu kullanarak `CartContext` değerini alır. Eğer bu değer `null` veya `undefined` ise (örneğin, fonksiyon bir `CartProvider` ağacı dışındaki bir bileşende veya izole bir test ortamında çağrıldığında), varsayılan olarak tanımlı ve tüm sepet yöntemlerini (ekle, çıkar, temizle vb.) boş işlem yapan (`no-op`) bir nesne olan `CART_FALLBACK` sabitini döndürür. Bu, bileşenin hata almadan normal şekilde render edilmesini garanti altına alır. Eğer geçerli bir context mevcutsa, sepetin güncel durumu (items, totals) ve bu durumu değiştiren fonksiyonları içeren nesnenin kendisini döndürür.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `CartContextType | typeof CART_FALLBACK`. Geçerli bir context varsa, sepet öğelerini (`items`), toplamları (`totals`) ve bu sepeti değiştirecek eylem fonksiyonlarını (ör. `addItem`, `removeItem`) içeren bir nesne döndürür. Context yoksa, tüm bu alanları tanımlı ancak boş işlem yapan (`() => {}`) fonksiyonlarla güvenli bir fallback nesnesi döndürür.

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
  - `context` — `useContext(CartContext)` ile alınan sepet context nesnesi; sepet verilerini ve metodlarını içerir
- **Dönüş**: `context` (CartContext tipinde) veya `CART_FALLBACK` (context erişilemezse Statik build/izole ortam fallback'i)

---

## NODE ID STANDARD

  file: src\hooks\useCartHook.ts
  function: src\hooks\useCartHook.ts::useCart

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCart