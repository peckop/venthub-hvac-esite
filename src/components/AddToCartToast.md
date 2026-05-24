---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx
skeleton_hash: 38d8482f76de1dcf
generated_at: 2026-05-23T21:50:57Z
---

## Genel Bakış
`AddToCartToast` modülü, kullanıcı bir ürünü sepete eklediğinde ekranda kısa süreli bir bildirim (toast) gösteren tek bir React fonksiyonel bileşeninden oluşur. Bileşen, bildirimin görünürlüğünü, otomatik kapanmasını ve kullanıcının sepeti görüntüleme ya da kapatma gibi aksiyonlar almasını sağlar.

## Fonksiyon Grupları
### Toast Görüntüleme ve Yönetim
Bildirimin açılıp kapanması, zamanlayıcı ile otomatik kapanma, çeviri metinlerinin kullanımı ve özel olay (CustomEvent) ile tetiklenme gibi tüm toast mantığını kapsar.  
- AddToCartToast

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### AddToCartToast
**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni (Functional Component) tanımlar. Adından anlaşılacağı üzere, bir ürünün sepete başarıyla eklendiğini kullanıcıya bildiren kısa süreli bir bildirim (toast) görüntülemekten sorumludur. Kullanıcıya anlık ve net bir geri bildirim sağlayarak uygulamanın kullanıcı deneyimini iyileştirir.
**Nasıl yapar**: İlgili kaynak dosyasında (`AddToCartToast.tsx`) bulunan bu fonksiyon, `React.FC` dönüş tipine sahiptir ve JSX formatında bir kullanıcı arayüzü öğesi döndürür. Herhangi bir prop (parametre) almadığı için, bildirim mesajı veya görünürlük durumu gibi kontrolleri genellikle kendi iç state'i (örneğin `useState` ve `useEffect` hook'ları) veya bir üst state yönetim mekanizması (Context API, Redux vb.) aracılığıyla yönetir. Bileşen, belirli bir süre sonra otomatik olarak kaybolacak şekilde bir zamanlayıcı kullanır.
**Parametreler**:
- Bu bileşen herhangi bir parametre (prop) kabul etmemektedir.
**Dönüş**:
- `React.FC`: Bir React fonksiyonel bileşeni döndürür. Bu bileşen çağrıldığında veya state'i tetiklendiğinde, render edilecek `JSX.Element` türünde bir bildirim arayüzü üretir.

---

### Toast Görüntüleme ve Kontrol
Bu grup, toast’ın ekranda gösterilmesi, otomatik kapanması ve kullanıcı etkileşimleri (kapatma butonu, sepeti göster) gibi UI mantığını kapsar.  
- AddToCartToast  

(Modül tek bir fonksiyondan oluştuğu için tüm sorumluluklar bu fonksiyon içinde toplanmıştır.)

---

---

## NODE ID STANDARD

  file: src\components\AddToCartToast.tsx
  function: src\components\AddToCartToast.tsx::AddToCartToast

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToCartToast