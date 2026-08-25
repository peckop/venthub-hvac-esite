---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\app\layout.tsx
skeleton_hash: 8412d56ab919a28f
entity_hashes:
  func:RootLayout: b91efb59fd6362f0
  overview: 49bead2b697f0509
  style_tokens: eebc13a3fedd1bcb
generated_at: 2026-08-25T07:23:26Z
---

## Genel Bakış
Bu modül, Next.js uygulamasının kök düzen (root layout) bileşenini tanımlar. Tüm sayfaları saran temel yapıyı oluşturur ve `children` aracılığıyla alt bileşenleri kabul eder.

## Fonksiyon Grupları

### Kök Düzen Bileşeni
Uygulamanın en üst düzey düzen yapısını tanımlar. Sayfa bileşenlerini sararak ortak bir şablon sağlar.
- RootLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imza ve sabit tanımlarından çıkarım yapılabilir.

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa, layout bileşeni alt bileşenleri render edemez; çünkü parametrede varsayılan değer tanımlanmamıştır ve `React.ReactNode` tipi bir içerik bekler.

[Aksiyom 2]: Eğer `inter` çağrısı başarısız olursa, modülün font yükleme işlemi tamamlanamaz; çünkü `inter` sabiti bir çağrı (call) olarak tanımlanmıştır ve gövdede bu sonucun kullanıldığı varsayılır.

[Aksiyom 3]: Eğer `metadata` objesi geçerli bir yapıda tanımlanmazsa, sayfanın meta bilgileri (title, description vb.) eksik olur; çünkü bu sabit Next.js'in beklediği metadata formatında olmalıdır.

**Not:** Fonksiyon gövdesi verilmediğinden, `inter` ve `metadata` sabitlerinin gövdede nasıl kullanıldığı, hangi HTML elementlerinin render edildiği, `children`'ın nereye yerleştirildiği gibi detaylar bilinmemektedir. Daha kesin aksiyomlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### RootLayout
**Ne yapar**: Next.js uygulamasının kök layout bileşenidir. Tüm sayfaları sarmalayan HTML yapısını oluşturur, dil ayarını Türkçe olarak belirler, font değişkenlerini uygular, yapılandırılmış veri (JSON-LD) ekler ve alt bileşenleri Providers ile ClientLayout katmanları içinde render eder.

**Nasıl yapar**: Fonksiyon, bir HTML iskeleti döndürür. `<html>` etiketine `lang="tr"` ve `data-scroll-behavior="smooth"` özellikleri eklenir. `<body>` etiketinde `inter` font ailesinin CSS değişkeni ve sınıf adı birleştirilerek uygulanır. İçerik sırasıyla `Providers`, `ClientLayout` bileşenleriyle sarılır. `ClientLayout` içinde, site adı ve URL bilgisini içeren `WebSite` tipinde bir JSON-LD yapılandırılmış veri bloğu `dangerouslySetInnerHTML` kullanılarak eklenir. Bu blokta HTML karakterleri (`<` ve `>`) Unicode kaçış dizilerine dönüştürülür. Son olarak `children` prop'u bu yapının içine yerleştirilir.

**Parametreler**:
- children: React.ReactNode — Bileşenin içine yerleştirilecek alt bileşenleri temsil eder. Next.js App Router yapısında, bu parametre alt rotaların veya sayfaların içerdiği bileşenleri taşır.

**Dönüş**: Kaynak kodda dönüş tipi açıkça belirtilmemiştir. JSX yapısı döndüren bir React fonksiyon bileşeni olarak çalışır.

---

## İTHALATLAR (IMPORTS)
- import: ../components/layout/ClientLayout::ClientLayout
- import: ../components/layout/ClientLayout::Providers
- import: ../index.css
- import: @/config/siteUrl::SITE_URL
- import: next/font/google::Inter
- import: next::type { Metadata }

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
  - `children` — `React.ReactNode` tipinde; sayfa içeriğini temsil eder, JSX içinde `{children}` olarak `<ClientLayout>` içine yerleştirilir
- **ic_degiskenler**:
  - `inter` — `next/font/google`'dan import edilen Inter font nesnesi; `inter.variable` (CSS değişken sınıfı) ve `inter.className` (font sınıfı) özellikleri `<body>` elementinin `className` prop'unda template literal içinde birlikte kullanılır
  - `SITE_URL` — `@/config/siteUrl`'den import edilen site URL sabiti; JSON-LD yapılandırılmış verisinde `"url"` alanının değerinde kullanılır
  - `Providers` — `../components/layout/ClientLayout`'den import edilen bileşen; `<html>` ve `<body>` altında tüm içeriği sarmalayan en dış context provider katmanıdır
  - `ClientLayout` — `../components/layout/ClientLayout`'den import edilen bileşen; `<Providers>` içinde `{children}`'ı ve JSON-LD `<script>` etiketini birlikte barındıran istemci tarafı düzen bileşenidir
  - `JSON.stringify({...})` — `"@context": "https://schema.org"`, `"@type": "WebSite"`, `"name": "VentHub"`, `"url": SITE_URL` alanlarından oluşan nesneyi string'e dönüştürür
  - `.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')` — XSS koruması için `<` ve `>` karakterlerini Unicode escape dizisine çevirir; sonuç `__html` prop'u aracılığıyla `dangerouslySetInnerHTML` ile `<script>` etiketine enjekte edilir
- **Dönüş**: JSX elementi — `lang="tr"` ve `data-scroll-behavior="smooth"` nitelikli `<html>` kök elementi döndürür

---

## NODE ID STANDARD

  file: layout.tsx
  function: layout.tsx::RootLayout

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