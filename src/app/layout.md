---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\layout.tsx
skeleton_hash: 335e557e99a8a428
entity_hashes:
  func:RootLayout: b91efb59fd6362f0
  overview: a13603912e8a012c
  style_tokens: eebc13a3fedd1bcb
generated_at: 2026-06-08T10:08:11Z
---

## Genel Bakış
Bu modül, VentHub web uygulamasının kök yerleşim bileşenidir. Tüm sayfaları saran ortak HTML yapısını, dil ayarlarını, font yapılandırmasını ve sağlayıcı sarmalayıcısını tanımlayarak uygulamanın tutarlı bir şekilde render edilmesini sağlar.

## Fonksiyon Grupları
### Sayfa Yerleşimi
Uygulamanın en dış HTML çerçevesini oluşturarak tüm sayfa içeriklerinin bu düzen içinde tarayıcıya sunulmasını sağlar.
- RootLayout

---

## AXIOMS – Mimari Varsayımlar

Bu Next.js layout modülü için temel mimari varsayımlar şunlardır:

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa veya geçerli bir React.ReactNode içermiyorsa, React bileşeni hata fırlatır veya boş bir layout render edilir.

[Aksiyom 2]: Eğer `inter` font sabiti (call() metoduyla kullanılır) tanımlı değilse veya geçerli bir Next.js font nesnesi içermiyorsa, layout’daki tipografi doğru şekilde yüklenemez.

[Aksiyom 3]: Eğer `metadata` sabiti tanımlı değilse veya geçerli bir Next.js metadata nesnesi (başlık, açıklama vb. içeren) içermiyorsa, sayfaların head bölümü doğru meta bilgilerle oluşturulamaz.

[Aksiyom 4]: Eğer `RootLayout` bileşeni React subtree olarak (children ile) çağrılmazsa, uygulamanın hiçbir içeriği render edilmez.

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
- **params**: `children` — React.ReactNode tipinde, sayfanın içeriğini temsil eder
- **ic_degiskenler**: (değişken yok, sadece parametre ve import edilen sabitler kullanılır)
  - `inter` — `next/font/google`'den import edilen font nesnesi; `.variable` ve `.className` özellikleri CSS sınıfları üretir
  - `SITE_URL` — `@/config/siteUrl`'dan import edilen sabit string; JSON-LD şemasında site URL'sini belirtir
  - `Providers` — `../components/layout/ClientLayout`'dan import edilen bileşen; sağlayıcı (context) sarmalayıcısı
  - `ClientLayout` — `../components/layout/ClientLayout`'dan import edilen bileşen; istemci tarafı layout sarmalayıcısı
- **Dönüş**: yok (JSX element döner, TypeScript'te dönüş tipi belirtilmemiş)

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