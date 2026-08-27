---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\AddToCartToast.tsx
skeleton_hash: 79117146ebc05a83
entity_hashes:
  func:AddToCartToast: 581f14d900d31bb4
  overview: 4631aecdd4e1b7b7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:52:12Z
---

## Genel Bakış
AddToCartToast modülü, sepete ürün ekleme işleminde kullanıcıya gösterilen bildirim (toast) bileşenini tanımlar. Modül tek bir dışa aktarılan bileşenden oluşur ve bir React fonksiyonel bileşeni olarak çalışır.

## Fonksiyon Grupları

### Bileşen
Sepete ekleme işleminin sonucunu kullanıcıya görsel bildirim olarak sunar. Modülde yalnızca bu tek bileşen yer alır; iç veya dış fonksiyon çağrıları, alt yardımcılar ya da ek bağımlılıklar bulunmaz.
- AddToCartToast

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Fonksiyon gövdesi sağlanmadığından, bileşenin çalışma koşulları belirlenememektedir. Yalnızca imzadan `AddToCartToast` fonksiyonunun parametre almadığı ve bir React bileşeni (`React.FC`) döndürdüğü tespit edilebilir.

---

## FONKSİYON DETAYLARI

### AddToCartToast
**Ne yapar**: Sepete ürün ekleme işleminde kullanıcıya gösterilen bir bildirim (toast) bileşeni tanımlayan fonksiyondur. Bileşenin adı, sepete ekleme eylemiyle ilişkili bir toast/arayüz elemanı olduğunu gösterir.

**Nasıl yapar**: Fonksiyonun iç mantığı verilen kaynakta belirtilmemiştir. Bir React fonksiyonel bileşeni (`React.FC`) döndürdüğü bilinmektedir. Docstring alanı boş olduğundan, bileşenin hangi görsel öğeleri render ettiği, hangi durumları yönettiği veya hangi yan etkileri tetiklediği kaynakta açıklanmamıştır.

**Parametreler**:
- Kaynakta fonksiyonun aldığı parametreler belirtilmemiştir. Parametre listesi bilinmiyor.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür. Bu, JSX elemanı üreten ve isteğe bağlı olarak props alan bir fonksiyon tipidir.

---

## İTHALATLAR (IMPORTS)
- import: ./AddToCartToastContent::AddToCartToastContent
- import: @/types/ui-models::type { Product }
- import: react::React
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/AddToCartToast.tsx::AddToCartToast
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: null — saf controller, DOM döndürmez

---

## NODE ID STANDARD

  file: src\components\AddToCartToast.tsx
  function: src\components\AddToCartToast.tsx::AddToCartToast

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToCartToast

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)