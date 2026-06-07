---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\layout.tsx
skeleton_hash: 121ea14bce4b42cb
entity_hashes:
  func:RootLayout: b91efb59fd6362f0
  overview: b75fce6203810ddf
  style_tokens: eebc13a3fedd1bcb
generated_at: 2026-06-07T11:00:50Z
---

## Genel Bakış
Bu modül, VentHub web uygulamasının temel yapı taşını oluşturur. Tüm sayfaları saran kök layout bileşenini tanımlayarak tutarlı bir HTML yapısı, font ayarları ve ortak stil referanslarını sağlar. Sayfa içerikleri bu düzenin içine yerleştirilerek uygulamanın genel görünümünü ve düzenini belirler.

## Fonksiyon Grupları
### Layout Rendering
Uygulamanın en dış çerçevesini ve temel HTML yapısını oluşturarak tüm sayfaların bu düzen bileşeni üzerinden tarayıcıya sunulmasını sağlar.
- RootLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül için belirgin mimari varsayımlar mevcuttur.

**[Aksiyom 1]:** Eğer `children` parametresi sağlanmazsa, React bileşeni hata verir veya boş bir layout render edilir.

---

**Not:** Verilen bilgiler (fonksiyon imzası, modül sabitleri ve eski doküman içeriği) incelendiğinde, bu bir React layout bileşenidir ve minimal bir API'ye sahiptir. Fonksiyon gövdesine erişim olmadan, iş mantığına dayalı detaylı aksiyomlar çıkarılamamaktadır. Mevcut verilerden sadece parametre zorunluluğu tespit edilebilmiştir.

---

## FONKSİYON DETAYLARI

### RootLayout

**Ne yapar**: Next.js uygulamasının kök layout (yerleşim) bileşenidir. Tüm sayfaların ortak HTML yapısını, stil değişkenlerini, sağlayıcıları (providers) ve JSON-LD yapılandırılmış veri şemasını tanımlayarak sayfa içeriğinin render edilmesini sağlar.

**Nasıl yapar**: Fonksiyon, React.ReactNode türünde children parametresini alır ve bu içeriği çok katmanlı bir sarmalama (wrapper) yapısı içerisinde render eder. Önce `<html>` etiketi ile Türkçe dil ayarı ve smooth scroll davranışı tanımlanır, ardından Inter font değişkenleri body etiketine uygulanır. İçerik sırasıyla Providers (uygulama sağlayıcıları), ClientLayout (istemci tarafı düzen) ve son olarak children ile sarılır. Ek olarak, JSON-LD formatında WebSite schema markup'u script etiketi ile enjekte edilerek SEO dostu yapılandırılmış veri sunulur; bu veride VentHub adı ve SITE_URL değişkeni kullanılır.

**Parametreler**:
- `children`: React.ReactNode — Layout bileşeninin içinde render edilecek olan alt sayfa veya bileşen içeriği. Next.js'de her sayfa bu parametre aracılığıyla root layout'a传递 edilir.

**Dönüş**: `JSX.Element` — Tüm HTML yapısını, provider sarmalını, client layout'u ve children içeriğini içeren JSX yapısı döndürülür. Return ifadesinde `<html>` elementi kök olarak verilmiştir.

---

## SABİTLER
- **inter** (call) — `Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })`
- **metadata** (object) — `{
    metadataBase: new URL(SITE_URL),
    title: "VentHub - Endüstriyel Ha...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/layout.tsx`::RootLayout
- **params**:
  - `children` — `React.ReactNode` tipinde, layout içinde render edilecek alt sayfa ve bileşenlerin tümünü temsil eder; `ClientLayout` içine `{children}` olarak yerleştirilir
- **ic_degiskenler**: Fonksiyon gövdesinde `const`/`let` ile tanımlanmış yerel değişken yoktur. JSX içinde aşağıdaki harici referanslar kullanılır:
  - `inter` — `next/font/google`'dan import edilmiş font nesnesi; `inter.variable` ve `inter.className` özellikleri `<body>`'nin `className` prop'una template literal ile bağlanarak Inter fontu uygulanır
  - `Providers` — `ClientLayout` modülünden import edilmiş context sağlayıcı sarmalayıcı bileşen; sayfa genelinde (theme, query client vb.) sağlayıcıları children'a outer sarmalayıcı olarak sarılır
  - `ClientLayout` — client tarafı layout sarmalayıcı bileşen; `Providers` içinde, `children`'ı ve JSON-LD scriptini sarmalar
  - `SITE_URL` — `@/config/siteUrl`'den import edilmiş sabit string; JSON-LD `WebSite` nesnesinin `url` alanına atanarak schema.org yapılandırılmış verisi oluşturulur
  - `JSON.stringify` — JSON-LD nesnesini string'e dönüştürür; ardından `.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')` zinciri ile `<` ve `>` karakterleri escape edilir
  - `dangerouslySetInnerHTML` — React prop'u; script etiketine `__html` anahtarıyla doğrudan HTML enjekte eder
- **Dönüş**: Belirtilmemiş (Explicit return type yok). Fonksiyon JSX döndürür — `<html>` > `<body>` > `<Providers>` > `<ClientLayout>` > (`<script>` JSON-LD + `{children}`) şeklinde tam sayfa iskeletini render eder. Yan etki olarak Inter font CSS değişkenleri sayfaya yayılır ve schema.org WebSite JSON-LD markup'u DOM'a enjekte edilir.

---

## NODE ID STANDARD

  file: src\app\layout.tsx
  function: src\app\layout.tsx::RootLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: RootLayout
  export: metadata

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
- **Yardımcı Sınıflar:** `${inter.className`, `${inter.variable`