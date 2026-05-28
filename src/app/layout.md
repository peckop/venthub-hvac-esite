---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\layout.tsx
skeleton_hash: cea0240c16858674
entity_hashes:
  func:RootLayout: 81f35cb6d72f3218
  overview: 21a28938937a2d25
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:35:18Z
---

## Genel Bakış
Bu modül, uygulamanın tüm sayfalarını saran kök layout bileşenini tanımlar. Next.js'in varsayılan düzen mekanizmasını kullanarak her sayfaya ortak HTML yapısı, font ayarları ve stil referanslarını sağlar. Sayfa içerikleri `children` prop'u aracılığıyla bu düzenin içine yerleştirilerek tutarlı bir görünüm elde edilir.

## Fonksiyon Grupları
### Layout Rendering
Uygulamanın en dış çerçevesini oluşturur; tüm sayfaların bu düzen bileşeni üzerinden geçerek tarayıcıya sunulmasını sağlar.
- RootLayout

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir React fonksiyonel bileşeni olan bir layout bileşenidir. Temel mimari varsayımlar, children parametresinin varlığı ve tipine dayanır.

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa (null, undefined veya hiç geçilmezse), TypeScript derleme hatası oluşur ve bileşen render edilemez.

[Aksiyom 2]: Eğer `children` parametresi sağlanan bir React.ReactNode değeri değilse (örn: geçersiz bir nesne veya React tarafından işlenemeyen bir veri tipi), bileşen render sırasında bir hata fırlatır ve uygulama kırılabilir.

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
- **params**: `children` — React.ReactNode, alt sayfa bileşenlerini temsil eder, JSX içinde {children} olarak render edilir
- **ic_degiskenler**: (yok — fonksiyonda herhangi bir yerel değişken tanımlanmamıştır; tüm değerler parametre veya modül seviyesindeki sabitlerden (inter, SITE_URL) gelir)
- **Dönüş**: yok (JSX döndürür — `<html>` elementi ile sarılmış tam sayfa yapısı; yan etkiler: Providers ve ClientLayout sarmalayıcıları ile sayfa düzenini oluşturur, JSON-LD yapılandırılmış veri script'i enjekte eder)

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