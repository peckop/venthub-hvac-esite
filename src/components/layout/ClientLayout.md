---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\layout\ClientLayout.tsx
skeleton_hash: 0c6f663edc271f14
entity_hashes:
  func:ClientLayout: 6950fd4597251d25
  func:ClientLayoutInner: 37e47d9296a1f7a9
  func:NavigationTracker: 42dc03a7f1389152
  func:Providers: 3400c1a5354d979d
  overview: 59f92422c0061f1e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T08:28:11Z
---

## Genel Bakış
Bu modül, istemci tarafı uygulamanın temel yerleşim ve altyapı katmanlarını tanımlayan bir dizi React bileşeninden oluşur. Uygulama genelindeki çocukların erişeceği bağlam sağlayıcılarını yapılandırır, gezinti olaylarını merkezi olarak izler ve sayfa düzeninin dış ile iç katmanlarını oluşturur.

## Fonksiyon Grupları
### Bağlam ve Yapılandırma
Uygulama genelinde kullanılacak olan durum yönetimi ve servis sağlayıcılarını sıralı bir yapıda çocukların üzerine sararak, tüm alt bileşenlerin bu verilere erişmesini sağlar.
- Providers

### Gezinti İzleme
URL değişimlerini ve sayfa geçişlerini izleyen bağımsız bir bileşendir; böylece uygulama içindeki gezinti olayları takip edilebilir ve tetiklenebilir hale gelir.
- NavigationTracker

### Düzen Katmanları
Sayfa yapısının dış ve iç katmanlarını oluşturur. Dış katman genel sayfa çerçevesini ve sağlayıcıları sararken, iç katman içerik alanının yerleşimini, düzenini ve alt bileşenlerin konumunu yönetir.
- ClientLayout, ClientLayoutInner

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Providers

**Ne yapar**: Uygulamanın tüm context provider'larını bir araya getirerekchildren bileşenini saran üst seviye bir sarıcı (wrapper) bileşendir. Bu yapı sayesinde uygulama genelinde Supabase bağlantısı, dil desteği, kimlik doğrulama, kategori verileri, sepet ve proje verileri gibi servisler tek bir noktadan yönetilir.

**Nasıl yapar**: Provider'ları iç içe nesting (yapısal katmanlama) yaparakhiyerarşik bir sarmalama oluşturur. En dış katman `SupabaseProvider` ile başlar ve sırasıyla `I18nProvider`, `AuthProvider`, `CategoryProvider`, `CartProvider` ile devam eder. En iç katman olan `ProjectProvider` içerisine `children` yerleştirilerek tüm provider'ların kapsam alanı tanımlanmış olur. Bu yapı, React Context'in doğası gereği iç katmanların dış katmanlara erişebilmesini sağlar.

**Parametreler**:
- `children`: React.ReactNode — Sarılacak alt bileşenlerdir. Tüm provider'ların kapsam alanı içinde yer alacak React elementlerini veya bileşenlerini temsil eder. Genellikle uygulamanın ana bileşen ağacı veya sayfa içerikleri buraya yerleştirilir.

**Dönüş**: JSX Element — Tüm provider'lar ile sarılmış `children` bileşenini döndürür. Return tipi doğrudan React fonksiyonel bileşen dönüşümü olup, `React.ReactElement` veya JSX.Element formatındadır.

### NavigationTracker
**Ne yapar**: `useSearchParams` hook'u üzerinden geçerli URL arama parametrelerini izleyerek navigasyon değişikliklerini takip eder.  
**Nasıl yapar**: Bileşen içinde `useSearchParams` çağrısı yapar, parametrelerdeki değişikliklere yanıt vererek (örneğin bir efekt içinde) gerekli takip veya güncelleme mantığını çalıştırır. Ayrı bir bileşen olarak `Suspense` içinde render edilmesi önerilir, çünkü hook'un asenkron davranışı nedeniyle bekleme süresi olabilir.  
**Parametreler**: *(yok)*  
**Dönüş**: null – fonksiyon herhangi bir görsel çıktı üretmez, sadece yan etkiler (takip) sağlar.

### ClientLayoutInner
**Ne yapar**: Uygulamanın istemci tarafı ana düzen yapısını oluşturan bir React bileşenidir. Ana layout bileşeni içinde çocuk bileşenleri, çerez onay mekanizmasını, rızaya bağlı analitik izlemeyi ve navigasyon takipçisini bir araya getirir.

**Nasıl yapar**: `MainLayout` bileşeni ile tüm içeriği sarar. Çocuk bileşenlerden sonra sırasıyla `CookieConsent` (çerez onay aracı), `ConsentGatedAnalytics` (rıza kontrollü analitik) ve `Suspense` ile sarılmış `NavigationTracker` (navigasyon takipçisi) bileşenlerini render eder. Yorumda belirtildiği üzere, `ConsentGatedAnalytics` bileşeni `NEXT_PUBLIC_GA_ID` ortam değişkeni tanımlı değilse ya da kullanıcı rıza vermemişse hiçbir analitik kod yüklemez. `NavigationTracker` bileşeni `Suspense` ile sarılarak asenkron yükleme sırasında kullanıcı deneyiminin kesintiye uğraması engellenir; yedek içerik olarak `null` kullanılır.

**Parametreler**:
- children: React.ReactNode — Ana layout içinde gösterilecek alt bileşenlerin tamamı. Bu bileşenler `MainLayout` kapsayıcısı içinde render edilir.

**Dönüş**: JSX elementi döndürür. `MainLayout` ile sarılmış, içinde çocuk bileşenleri, çerez onay aracını, rızaya bağlı analitik bileşenini ve `Suspense` ile sarılmış navigasyon takipçisini barındıran bir React ağacı üretir.

### ClientLayout
**Ne yapar**: Uygulama istemci tarafı düzenini oluşturmak için `ClientLayoutInner` bileşenini kullanarak verilen `children` öğesini sarmalar.  
**Nasıl yapar**: Fonksiyon, `ClientLayoutInner` bileşenini render eder ve içine `children` prop'ını yerleştirir; bu sayfa düzeninin temel yapısını sağlar.  
**Parametreler**:  
- children: React.ReactNode — Düzen içinde gösterilecek içerik  
**Dönüş**: JSX elementi – `<ClientLayoutInner>{children}</ClientLayoutInner>` şeklinde bir ağaç döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../contexts/AuthContext::AuthProvider
- import: ../../contexts/CartProvider::CartProvider
- import: ../../contexts/CategoryContext::CategoryProvider
- import: ../../contexts/ProjectProvider::ProjectProvider
- import: ../../i18n/I18nProvider::I18nProvider
- import: ./CookieConsent::CookieConsent
- import: ./MainLayout::MainLayout
- import: @/components/analytics/ConsentGatedAnalytics::ConsentGatedAnalytics
- import: @/providers/SupabaseProvider::SupabaseProvider
- import: next/navigation::usePathname
- import: next/navigation::useSearchParams
- import: react::React
- import: react::Suspense
- import: react::useEffect

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::Providers
- **params**: `{ children }: { children: React.ReactNode }` — sarmalanacak alt bileşenler
- **ic_degiskenler**: yok (yalnızca JSX return eder)
- **Dönüş**: JSX ağacı — `SupabaseProvider` > `I18nProvider` > `AuthProvider` > `CategoryProvider` > `CartProvider` > `ProjectProvider` > `{children}` sıralı sarma yapısı

### [N2_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::NavigationTracker
- **params**: yok
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook'undan dönen mevcut URL yolu
  - `searchParams` — `useSearchParams()` hook'undan dönen mevcut arama parametreleri nesnesi
  - `handlePopState` — `popstate` olayını dinleyen callback; `sessionStorage`'da `vh_is_pop` anahtarını `'true'` yapar
  - `handleInteraction` — `mousedown` ve `keydown` olaylarını dinleyen callback; `sessionStorage`'da `vh_is_pop` anahtarını `'false'` yapar
  - `updateStack` — navigasyon geçmişini `sessionStorage`'da `vh_nav_stack` anahtarında güncelleyen fonksiyon
  - `search` — `searchParams?.toString()` sonucu, yoksa boş string
  - `hash` — `window.location.hash`, yoksa boş string
  - `currentFullPath` — `pathname + (search ? '?' + search : '') + hash` birleşimi; tam URL yolu
  - `stack` — `sessionStorage`'dan `JSON.parse` ile okunan navigasyon yığını dizisi (`string[]`)
  - `lastItem` — `stack[stack.length - 1]`; yığının son elemanı
  - `secondLastItem` — `stack[stack.length - 2]`; yığının sondan ikinci elemanı
- **Dönüş**: `null` (yalnızca yan etki üretir; `sessionStorage`'da `vh_is_pop` ve `vh_nav_stack` anahtarlarını yönetir, `popstate`/`hashchange`/`mousedown`/`keydown` olay dinleyicileri kurar ve temizler)

### [N3_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::ClientLayoutInner
- **params**: `{ children }: { children: React.ReactNode }` — sarmalanacak alt bileşenler
- **ic_degiskenler**: yok (yalnızca JSX return eder)
- **Dönüş**: JSX ağacı — `MainLayout` içinde `{children}`, `CookieConsent`, `ConsentGatedAnalytics` ve `Suspense` ile sarılı `NavigationTracker` bileşenlerini render eder

### [N4_NASIL] AST Pointer: src/components/layout/ClientLayout.tsx::ClientLayout
- **params**: `{ children }: { children: React.ReactNode }` — sarmalanacak alt bileşenler
- **ic_degiskenler**: yok (yalnızca JSX return eder)
- **Dönüş**: JSX — `ClientLayoutInner` bileşeni ile `{children}` sarmalayan yapı

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