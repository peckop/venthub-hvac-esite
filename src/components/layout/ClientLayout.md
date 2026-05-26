---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\ClientLayout.tsx
skeleton_hash: d3b4d3734259a93f
generated_at: 2026-05-23T22:09:53Z
---

## Genel Bakış
Bu modül, istemci tarafı uygulamasının temel yapısını ve ortak işlevselliğini sağlar. React bileşenleri aracılığıyla sağlayıcıları (providers) yapılandırır, gezinti izleme mantığını yönetir ve sayfa düzenini (layout) tanımlayan iç içe geçmiş bileşenleri bir araya getirir.

## Fonksiyon Grupları
### Sağlayıcı Yapılandırması
Uygulama genelinde gerekli olan bağlam (context) sağlayıcıları oluşturur ve çocuk içeriği bu sağlayıcıların içinde render eder.
- Providers

### Gezinti İzleme
Sayfa geçişlerini ve URL değişikliklerini izleyen mantığı içerir, böylece diğer bileşenler gezinti durumuna göre tepki verebilir.
- NavigationTracker

### Düzen Bileşenleri
Sayfa yapısının temel bloklarını oluşturur; dıştaki `ClientLayout` genel çerçeveyi tanımlarken, içteki `ClientLayoutInner` ise içerik alanının yerleşimini ve stilini yönetir.
- ClientLayout
- ClientLayoutInner

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React tabanlı bir kullanıcı arayüzü bileşeni olduğu için React ortamının mevcut ve işlevli olması gerekir.

- Eğer **Providers**, **NavigationTracker**, **ClientLayoutInner** veya **ClientLayout** fonksiyonlarından biri tanımlı değilse veya çağrılamıyorsa, modül çalışmaz ve çalışma zamanı hatası verir.  
- Eğer **children** prop’u **React.ReactNode** türünde bir değerle sağlanmazsa (örneğin `undefined` veya yanlış tip), tip denetleyicisi hata üretir ve bileşen beklenen şekilde render olmaz.  
- Eğer **React** kütüphanesi projeye dahil edilmezse veya JSX dönüştürücü aktif değilse, dosyadaki JSX sözdizimi tarayıcı tarafından yorumlanamaz ve modül yüklenemez.  
- Eğer **ClientLayout** fonksiyonu dışa aktarım kısmında eksikse, diğer modüller bu bileşeni içeri aktaramaz ve kullanılamaz.  
- Eğer **NavigationTracker** fonksiyonu taraf etkisi (örneğin olay dinleyici, zamanlayıcı) içeriyorsa, bu etkilerin çalışabilmesi için bir tarayıcı veya benzeri ortam (window, document gibi globals) mevcut olmalıdır.  
- Eğer **ClientLayoutInner** fonksiyonu eksikse veya doğru şekilde tanımlanmazsa, **ClientLayout** içindeki görüntüleme mantığı bozulur ve beklenenden farklı bir çıktı üretir.

---

## FONKSIYON DETAYLARI

### Providers
**Ne yapar**: Verilen `children` prop'ını render eder; genellikle uygulama genelinde sağlayıcı (provider) bileşenlerini sarmalamak için kullanılır.  
**Nasıl yapar**: Fonksiyon, aldığı `children` öğesini doğrudan JSX içinde döndürür; ekstra mantık veya durum yönetimi içermez.  
**Parametreler**:  
- children: React.ReactNode — Render edilecek alt öğeler veya içerik  
**Dönüş**: void (veya belirtilmemiş) – fonksiyon bir JSX elementi döndürür, bu yüzden etkili olarak render çıktısı üretir.

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

### [N1_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::Providers
- **params**: children — React.ReactNode, the child elements to wrap with all context providers
- **ic_degiskenler**: (none)
- **Dönüş**: JSX.Element (the nested provider tree wrapping `children`)

### [N2_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::NavigationTracker
- **params**: (none)
- **ic_degiskenler**:
  - `pathname` — current URL pathname from `usePathname()` hook
  - `searchParams` — URL search parameters from `useSearchParams()` hook
  - `handlePopState` — function that writes `vh_is_pop=true` to sessionStorage on `popstate`
  - `handleInteraction` — function that writes `vh_is_pop=false` to sessionStorage on mousedown/keydown events
  - `updateStack` — function that reads/updates the navigation stack (`vh_nav_stack`) in sessionStorage based on the current full path
  - `search` — stringified `searchParams` value or empty string
  - `hash` — `window.location.hash` value or empty string
  - `currentFullPath` — concatenation of `pathname`, `search`, and `hash` representing the full current URL
  - `stack` — array of strings holding the navigation history retrieved from sessionStorage
  - `lastItem` — last element of the `stack` array (`stack[stack.length‑1]`)
  - `secondLastItem` — second‑to‑last element of the `stack` array (`stack[stack.length‑2]`)
- **Dönüş**: null (the component renders nothing; its purpose is purely side‑effects)

### [N3_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::ClientLayoutInner
- **params**: children — React.ReactNode, the child elements to render inside the layout
- **ic_degiskenler**: (none)
- **Dönüş**: JSX.Element (`<MainLayout>` wrapping `children` and a `<Suspense>`‑wrapped `<NavigationTracker />`)

### [N4_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::ClientLayout
- **params**: children — React.ReactNode, the child elements to pass down to `ClientLayoutInner`
- **ic_degiskenler**: (none)
- **Dönüş**: JSX.Element (`<ClientLayoutInner>` wrapping `children`)

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
- **Responsive:** (yok)
