---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx
skeleton_hash: db9ea97a25e2dcc9
entity_hashes:
  func:AddToCartToast: 581f14d900d31bb4
  overview: 2f0c7613311f5aad
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-29T19:59:05Z
---

## Genel Bakış
Bu modül, kullanıcıya sepete ekleme işlemi sonrası kısa süreli bir bildirim (toast) gösteren tek bir React fonksiyonel bileşenini tanımlar. Bileşen, bildirimin zamanlamasını, otomatik kaybolmasını ve kullanıcı etkileşimlerini (örn. bildirimi kapatma) kendi içinde yönetir.

## Fonksiyon Grupları
### Bildirim Bileşeni
Modül, sepete ekleme sonrası bildirimini gösteren ve yöneten ana (ve tek) bileşeni içerir. Bu bileşen, olaylarla tetiklenir, belirli süre sonra otomatik kaybolur ve çeviri destekli metinler kullanır.
- AddToCartToast

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, fonksiyon imzası (`AddToCartToast()`) ve modül sabitlerine dayanarak belirlenebilecek somut aksiyomlar sınırlıdır. Aşağıda sadece arayüz seviyesinde çıkarılabilen varsayımlar yer almaktadır.

---

**[Aksiyom 1]**: Eğer `AddToCartToast` bileşeni React bileşen ağacının dışında (React Provider hiyerarşisi dışında) render edilirse, bileşen düzgün çalışmaz veya hata fırlatır olur.

> *Gerekçe*: Fonksiyon imzasında prop parametresi (`props`) tanımlı değildir; bileşen React Hook'ları veya Context API kullanarak dış kaynaklara erişebilir. Bu kaynakların sağlanması için bileşenin uygun bir React.Provider içnde bulunması zorunludur.

**[Aksiyom 2]**: Eğer bileşenin bağımlı olduğu translation (i18n) sistemi mevcut değilse veya sağlanamıyorsa, bileşen gösterilen bildirim metinlerini doğru dille render edemez olur.

> *Gerekçe*: Fonksiyon imzasında dışarıdan çeviri/lokalizasyon parametresi geçirilmez; bu nedenle çeviri kaynakları iç hook veya context aracılığıyla çözülmelidir.

**[Aksiyom 3]**: Eğer bileşenin tetiklenmesini sağlayan üst bileşen (parent) bileşeni mount/unmount döngüsünü uygun şekilde yönetmezse, birden fazla toast bildirimi üst üste birikir veya beklenmeyen zamanlama davranışı gösterir olur.

> *Gerekçe*: Fonksiyon `AddToCartToast()` adıyla çağrılmaktadır; bileşenin ne zaman挂載edileceği ve ne zaman kaldırılacağı üst bileşenin sorumluluğundadır. İç zamanlayıcı (timer) ve state yönetimi bileşen içindedir, ancak mount sıklığı dışarıdan kontrol edilir.

---

**Not**: Bu bileşenin fonksiyon gövdesi (implementation body) analiz edilemediğinden, iç state yönetimi, timer süreleri, animation parametreleri gibi detaylı aksiyomlar çıkarılamamıştır. Yukarıdaki aksiyomlar yalnızca fonksiyon imzası ve bileşen türü (React .tsx) bilgisine dayanmaktadır.

---

## FONKSİYON DETAYLARI

### AddToCartToast
**Ne yapar**: Sepete ekleme işlemi sonrası kullanıcıya gösterilen bir bildirim (toast) bileşenini oluşturur. Bu bildirim, kullanıcının sepete bir ürün eklediğini görsel olarak onaylar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanmıştır ve muhtemelen bir UI kütüphanesinden (örneğin, Chakra UI, Material UI) toast mekanizmasını kullanarak bildirim mesajını ve stilini yönetir. İçerisinde sepete eklenen ürünle ilgili kısa bir bilgi veya başarılı ekleme mesajı barındırabilir.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: React.FC — Sepete ekleme bildirimini temsil eden bir React fonksiyonel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/AddToCartToast.tsx::AddToCartToast
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onAdded` — Sepete ürün eklendiğinde tetiklenen event handler; CustomEvent'ten product bilgisini çıkarır ve Sonner toast'unu tetikler
- **Dönüş**: `null` (Saf controller bileşeni, DOM render etmez; yan etki olarak toast gösterir)

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