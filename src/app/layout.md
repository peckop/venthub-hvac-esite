---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\layout.tsx
skeleton_hash: cea0240c16858674
generated_at: 2026-05-23T21:49:31Z
---

## Genel Bakış
Bu modül, uygulamanın her sayfasında ortak olan kök düzen bileşenini barındırır. `RootLayout` adlı tek bir bileşen aracılığıyla tüm sayfalara temel HTML yapısını, genel stilleri ve font ayarlarını sağlar; sayfa içerikleri ise `children` prop’u ile bu şablon içine yerleştirilir.

## Fonksiyon Grupları
### Layout Rendering
Uygulamanın dış çerçevesini oluşturur ve alt bileşenlerin doğru konumda görüntülenmesini yönetir.
- RootLayout

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### RootLayout
**Ne yapar**: Uygulamanın kök layout bileşenini tanımlar. Tüm sayfaların ortak yapısını oluşturur ve içeriğin doğru şekilde sarılmasını sağlar. Next.js projelerinde her sayfanın render edilmeden önce geçtiği ana düzen bileşenidir.
**Nasıl yapar**: `children` prop'unu alır ve doğrudan render ederek alt bileşenlerin sayfa içeriği olarak iletilmesini sağlar. Herhangi bir ek UI katmanı eklemez; sadece içeriği olduğu gibi döndürür.
**Parametreler**:
- `children`: React.ReactNode — Layout içinde görüntülenecek alt bileşenler. Sayfa içeriğini temsil eder ve doğrudan render edilir.
**Dönüş**: void veya bilinmiyor (kaynak kodda return tipi belirtilmemiştir; genellikle JSX.Element döndüren bir React bileşenidir).

---

## SABİTLER
- **inter** (call) — `Inter({ subsets: ['latin'], display: 'swap' })`
- **metadata** (object) — `{
    metadataBase: new URL(SITE_URL),
    title: "VentHub - Endüstriyel Ha...`

---

## AST POINTERS

### [N1_RootLayout] AST Pointer: src/app/layout.tsx::RootLayout
- **params**:
  - `children` — React bileşen içeriğini temsil eder; render edilecek alt içerik
- **ic_degiskenler**:
  - `children` — alt bileşenleri içeren React.ReactNode; JSX içinde `{children}` ile kullanılır
  - `inter.className` — `Inter` fontunun CSS sınıf adı; `<body>` elementine `className` olarak atanır
  - `SITE_URL` — site ana URL'si; `json-ld-website` scripti içinde JSON-LD yapısının `"url"` alanına değer olarak atanır (export edilen yapılandırma sabiti)
- **Dönüş**: JSX.Element — HTML döküman yapısı (`<html>`, `<body>`, `<Providers>`, `<ClientLayout>`, script ve children) döndüren Next.js layout bileşeni

---

## NODE ID STANDARD

  file: src\app\layout.tsx
  function: src\app\layout.tsx::RootLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: RootLayout
  export: metadata