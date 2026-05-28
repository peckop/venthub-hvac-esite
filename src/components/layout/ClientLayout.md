---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\ClientLayout.tsx
skeleton_hash: d3b4d3734259a93f
entity_hashes:
  func:ClientLayout: 6950fd4597251d25
  func:ClientLayoutInner: 23353a9d63803b3a
  func:NavigationTracker: 42dc03a7f1389152
  func:Providers: 17b4bbfa6b876fcf
  overview: a03fb83dd971b4d9
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:18Z
---

## Genel Bakış
Bu modül, istemci tarafı uygulamasının temel yapısını ve ortak işlevselliğini sağlar. React bileşenleri aracılığıyla uygulama genelindeki sağlayıcıları yapılandırır, gezinti izleme mantığını yönetir ve sayfa düzenini (layout) tanımlayan iç içe geçmiş bileşenleri bir araya getirir.

## Fonksiyon Grupları
### Sağlayıcı Yapılandırması
Uygulama genelinde gerekli olan bağlam (context) sağlayıcılarını oluşturur ve çocuk içeriği bu sağlayıcıların içinde render ederek globally erişilebilir kılar.
- Providers

### Gezinti İzleme
Sayfa geçişlerini ve URL değişikliklerini izleyen mantığı içerir; böylece diğer bileşenler gezinti durumuna göre tepki verebilir.
- NavigationTracker

### Düzen Bileşenleri
Sayfa yapısının temel bloklarını oluşturur; dıştaki `ClientLayout` bileşeni genel çerçeveyi tanımlarken, içteki `ClientLayoutInner` bileşeni ise içerik alanının yerleşimini ve stilini yönetir.
- ClientLayout
- ClientLayoutInner

---



---

## FONKSİYON DETAYLARI

### Providers
**Ne yapar**: Uygulama genelinde kullanılacak olan bağlam (context) sağlayıcılarını çocuk bileşenlerin üzerine katmanlar halinde sararak, tüm alt bileşenlerin bu bağlam verilerine erişmesini sağlar.

**Nasıl yapar**: Beş farklı sağlayıcıyı iç içe bir yapıda sıralar: I18nProvider → AuthProvider → CategoryProvider → CartProvider → ProjectProvider. Sıralama önemlidir çünkü dış katmandaki sağlayıcılar, iç katmanlardaki sağlayıcıların verilerine erişebilir. `{children}` en iç katmanda yer alarak tüm bağlam verilerini miras alır.

**Parametreler**:
- `children`: `React.ReactNode` — Bu sağlayıcıların sarmalayacağı tüm alt bileşenlerin düğüm yapısıdır. Tüm uygulama içeriği bu parameter aracılığıyla sağlayıcılara dahil edilir.

**Dönüş**: JSX yapısı döndürür. Doğrudan `{children}` düğümünü, sağlanan bağlam katmanlarının içine yerleştirilmiş biçimde render eder.

### NavigationTracker
**Ne yapar**: `useSearchParams` hook'u üzerinden geçerli URL arama parametrelerini izleyerek navigasyon değişikliklerini takip eder.  
**Nasıl yapar**: Bileşen içinde `useSearchParams` çağrısı yapar, parametrelerdeki değişikliklere yanıt vererek (örneğin bir efekt içinde) gerekli takip veya güncelleme mantığını çalıştırır. Ayrı bir bileşen olarak `Suspense` içinde render edilmesi önerilir, çünkü hook'un asenkron davranışı nedeniyle bekleme süresi olabilir.  
**Parametreler**: *(yok)*  
**Dönüş**: null – fonksiyon herhangi bir görsel çıktı üretmez, sadece yan etkiler (takip) sağlar.

### ClientLayoutInner
**Ne yapar**: Aldığı `children` prop'ını render eder; genellikle düzen veya stil sağlayan bir sarmalayıcı bileşen olarak kullanılır.  
**Nasıl yapar**: Fonksiyon, `children` öğesini doğrudan JSX içinde döndürür; ekstra işlem, durum veya efekt içermez.  
**Parametreler**:  
- children: React.ReactNode — Görüntülenecek alt içerik  
**Dönüş**: void (veya belirtilmemiş) – fonksiyon bir JSX elementi döndürür, bu yüzden render çıktısı üretir.

### ClientLayout
**Ne yapar**: Uygulama istemci tarafı düzenini oluşturmak için `ClientLayoutInner` bileşenini kullanarak verilen `children` öğesini sarmalar.  
**Nasıl yapar**: Fonksiyon, `ClientLayoutInner` bileşenini render eder ve içine `children` prop'ını yerleştirir; bu sayfa düzeninin temel yapısını sağlar.  
**Parametreler**:  
- children: React.ReactNode — Düzen içinde gösterilecek içerik  
**Dönüş**: JSX elementi – `<ClientLayoutInner>{children}</ClientLayoutInner>` şeklinde bir ağaç döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ClientLayout.tsx::Providers
- **params**: `{ children }: { children: React.ReactNode }`
- **ic_degiskenler**: (yok — sadece JSX döndürür, hiçbir iç değişken tanımlamaz)
- **Dönüş**: JSX — `I18nProvider > AuthProvider > CategoryProvider > CartProvider > ProjectProvider` sarmalayıcı zincirini oluşturup `children`'ı en içe yerleştirir

### [N2_NASIL] AST Pointer: ClientLayout.tsx::NavigationTracker
- **params**: (yok)
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook'undan gelen mevcut URL path'i; navigasyon stack mantığında sayfa kimliği olarak kullanılır
  - `searchParams` — `useSearchParams()` hook'undan gelen URL arama parametreleri; query string'i olarak tam yola eklenir
  - `handlePopState` — arrow function; tarayıcı geri/ileri butonu tetiklendiğinde `sessionStorage`'a `vh_is_pop` = `'true'` yazar
  - `handleInteraction` — arrow function; `mousedown` ve `keydown` olaylarında `sessionStorage`'a `vh_is_pop` = `'false'` yazar
  - `updateStack` — arrow function; navigasyon geçmişini `sessionStorage`'taki `vh_nav_stack` JSON array'inde tutan ana mantık fonksiyonu
  - `search` — `searchParams?.toString() || ''` sorgu dizgesi; mevcut query string'i temsil eder
  - `hash` — `window.location.hash || ''` URL fragment'i; mevcut hash değerini temsil eder
  - `currentFullPath` — `pathname + search + hash` birleştirilmesiyle oluşan tam URL yolu
  - `stack` — `JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]')` sonucu; navigasyon geçmişi dizisi, `try-catch` ile parse edilir hata olursa boş diziye düşer
  - `lastItem` — `stack[stack.length - 1]` erişimi; stack'in son elemanı, mevcut yolun tekrar eklenip eklenmeyeceğini kontrol eder
  - `secondLastItem` — `stack[stack.length - 2]` erişimi; sondan ikinci eleman, geri tuşu durumunu tespit etmek için kullanılır
- **Dönüş**: `null` — JSX üretmez; yan etkisi olarak `sessionStorage`'a navigasyon bilgisi yazar, `popstate`/`hashchange`/`mousedown`/`keydown` event listener'ları ekler, cleanup'ta temizler

### [N3_NASIL] AST Pointer: ClientLayout.tsx::ClientLayoutInner
- **params**: `{ children }: { children: React.ReactNode }`
- **ic_degiskenler**: (yok — sadece JSX döndürür, iç değişken tanımı yok)
- **Dönüş**: JSX — `MainLayout` sarmalayıcısı içinde `children` ve `Suspense` sarmalayıcısı içinde `NavigationTracker` bileşenini render eder

### [N4_NASIL] AST Pointer: ClientLayout.tsx::ClientLayout
- **params**: `{ children }: { children: React.ReactNode }`
- **ic_degiskenler**: (yok — sadece JSX döndürür, iç değişken tanımı yok)
- **Dönüş**: JSX — `children`'ı `ClientLayoutInner` bileşeninin içine sararak döndürür

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    ClientLayout_tsx__ClientLayout["ClientLayout"]
    ClientLayout_tsx__ClientLayoutInner["ClientLayoutInner"]
    ClientLayout_tsx__NavigationTracker["NavigationTracker"]
    ClientLayout_tsx__Providers["Providers"]
```

## NODE ID STANDARD

  file: src\components\layout\ClientLayout.tsx
  function: src\components\layout\ClientLayout.tsx::Providers
  function: src\components\layout\ClientLayout.tsx::NavigationTracker
  function: src\components\layout\ClientLayout.tsx::ClientLayoutInner
  function: src\components\layout\ClientLayout.tsx::ClientLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: ClientLayout
  export: ClientLayoutInner
  export: NavigationTracker
  export: Providers

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