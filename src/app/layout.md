---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\layout.tsx
skeleton_hash: ec7afc7631488d32
entity_hashes:
  func:RootLayout: b91efb59fd6362f0
  overview: 49bead2b697f0509
  style_tokens: eebc13a3fedd1bcb
generated_at: 2026-06-10T09:12:03Z
---

## Genel Bakış
Bu modül, VentHub web uygulamasının en üst düzey React yerleşim bileşenidir. Tüm sayfaları saran temel HTML yapısını, dil ayarlarını, font yapılandırmasını ve uygulama genelindeki sağlayıcıları tanımlayarak sayfaların tutarlı ve doğru bir şekilde tarayıcıya sunulmasını sağlar.

## Fonksiyon Grupları
### Yerleşim ve Sarmalama
Uygulamanın tüm sayfalarını kapsayan temel HTML yapısını ve gerekli sağlayıcıları oluşturarak içeriğin doğru ortamda render edilmesini sağlar.
- RootLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js App Router kök layout bileşenidir ve tüm sayfaları saran HTML yapısını tanımlar.

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa, React bileşeni render edilemez ve uygulama hata fırlatır.

[Aksiyom 2]: Eğer `inter` font sabiti (`inter (call)`) geçerli bir Next.js Font nesnesi değilse, uygulamabuild/compile aşamasında hata oluşur.

[Aksiyom 3]: Eğer `metadata` nesnesi geçerli bir Next.js Metadata yapısı içermiyorsa, SEO ve sayfa başlık bilgileri düzgün render edilmez.

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

### [N1_NASIL] AST Pointer: src/app/layout.tsx::RootLayout
- **params**:
  - `children` — React.ReactNode türünde, sayfanın alt sayfa içeriklerini temsil eder, doğrudan `{children}` olarak JSX'e yerleştirilir
- **ic_degiskenler**:
  - Fonksiyon gövdesinde harici bir değişken tanımlanmamıştır
- **Return**: JSX eleman döndürür — `<html>` etiketi ile sarılmış tam sayfa yapısı (`<html>` > `<body>` > `<Providers>` > `<ClientLayout>` > JSON-LD script + `{children}`)
- **Yan etkileri**: `inter` font değişkeni ve className'i `<body>` üzerinde uygulanır; `dangerouslySetInnerHTML` ile JSON-LD yapılandırılmış veri sayfaya enjekte edilir; `SITE_URL` sabitinden site adresi alınarak schema.org WebSite objesi oluşturulur

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