---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\layout.tsx
skeleton_hash: 427402ca19687e8b
entity_hashes:
  func:RootLayout: 81f35cb6d72f3218
  overview: b75fce6203810ddf
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-02T21:30:18Z
---

## Genel Bakış
Bu modül, VentHub web uygulamasının temel yapı taşını oluşturur. Tüm sayfaları saran kök layout bileşenini tanımlayarak tutarlı bir HTML yapısı, font ayarları ve ortak stil referanslarını sağlar. Sayfa içerikleri bu düzenin içine yerleştirilerek uygulamanın genel görünümünü ve düzenini belirler.

## Fonksiyon Grupları
### Layout Rendering
Uygulamanın en dış çerçevesini ve temel HTML yapısını oluşturarak tüm sayfaların bu düzen bileşeni üzerinden tarayıcıya sunulmasını sağlar.
- RootLayout

---



---

## FONKSİYON DETAYLARI

### RootLayout
**Ne yapar**: Uygulamanın kök yerleşim bileşenidir ve tüm sayfaların sarmalandığı temel HTML yapısını oluşturur. Bu fonksiyon, VentHub web sitesinin her sayfasında ortak olan html, body etiketlerini ve provider yapılarını tanımlar.

**Nasıl yapar**: Fonksiyon, React Server Component olarak çalışır ve şu yapıları oluşturur: Türkçe dil ayarlı ve yumuşak kaydırma davranışına sahip bir html etiketi oluşturur. İçeride Inter font ailesini kullanan body etiketi yer alır. Sayfa içeriği Providers (muhtemelen tema/context sağlayıcıları) ve ClientLayout (istemci tarafı düzen bileşeni) ile sarılır. Ek olarak, Google arama motorları için VentHub web sitesinin yapılandırılmış verisini (JSON-LD) içeren bir script etiketi enjekte eder, bu sayede SEO performansı iyileştirilir.

**Parametreler**:
- `children`: React.ReactNode — Ana sayfa içeriği ve alt bileşenler. Bu parametre, her sayfa için özel içeriği temsil eder ve yerleşim ağacının iç部分ını oluşturur.

**Dönüş**: JSX element döndürür. Return ifadesi, tam bir HTML yapısı (html > body > Providers > ClientLayout > script + children) içeren React elementidir.

---

## SABİTLER
- **inter** (call) — `Inter({ subsets: ['latin'], display: 'swap' })`
- **metadata** (object) — `{
    metadataBase: new URL(SITE_URL),
    title: "VentHub - Endüstriyel Ha...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/layout.tsx::RootLayout
- **params**: `{ children }` — React bileşenlerinin içeriği (React.ReactNode tipinde)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (React layout yapısı) — `<html>` ve `<body>` etiketlerini, Providers, ClientLayout, JSON-LD scripti ve children içeren tam sayfa layout'unu döndürür. Yan etki: `inter.className` ile font stillendirir, `SITE_URL` ile SEO URL'si ekler.

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
- **Yardımcı Sınıflar:** (yok)