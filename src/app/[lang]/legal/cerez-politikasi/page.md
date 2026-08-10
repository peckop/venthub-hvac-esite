---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\cerez-politikasi\page.tsx
skeleton_hash: fe900b3d5527f4b2
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: dbefcec9367e9b65
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, VentHUB platformunun yasal "Çerez Politikası" sayfasını sunan bir Next.js sayfa modülüdür. Tek bir sayfa bileşeni aracılığıyla kullanıcıya çerez kullanımı ile ilgili zorunlu yasal bilgilendirmeyi sunmakla sorumludur.

## Fonksiyon Grupları
### Statik Sayfa Oluşturma
Modülün, statik site oluşturma süreci için gerekli olan dil bazlı sayfa parametrelerini (örn. `/en/legal/cerez-politikasi`, `/tr/legal/cerez-politikasi`) dinamik olarak üretmekten sorumludur.
- generateStaticParams

### Sayfa Görüntüleme
Modülün temel kullanıcı arayüzünü oluşturarak, ilgili çerez politikası içeriğini tarayıcıda göstermekten sorumludur. Sayfa yapısı, dışarıdan import edilen bir bileşene yönlendirilerek modüler bir tasarım sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js App Router yapısında uluslararası dil destekli bir sayfa bileşenidir.

[Aksiyom 1]: Eğer `params.lang` parametresi sağlanmazsa veya string türünde değilse, sayfa doğru şekilde render edilemez ve hata oluşur.

[Aksiyom 2]: Eğer `generateStaticParams()` fonksiyonu geçerli dil parametrelerini (lang) döndürmezse, build aşamasında statik sayfa üretimi başarısız olur.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Bu fonksiyon, Next.js tarafından statik sayfa oluşturma (Static Site Generation - SSG) procesinde kullanılır. Uygulama build edilirken, hangi `lang` (dil) parametreleri ile `page.tsx` dosyasının önceden oluşturulacağını belirler.

**Nasıl yapar**: Fonksiyon, bir Promise döndüren bir asenkron fonksiyondur. Gövdesinde doğrudan, önceden tanımlanmış iki dil seçeneği (`'tr'` ve `'en'`) içeren bir nesne dizisi döndürür. Bu dizi, Next.js'e "bu sayfayı hem Türkçe (`/tr/legal/cerez-politikasi`) hem de İngilizce (`/en/legal/cerez-politikasi`) rotaları için build aşamasında statik olarak oluşturmamı sağla" talimatını verir.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**:
- `Promise<Array<{ lang: string }>>` — Fonksiyon, bir Promise resolve eder ve içinde iki nesne bulunan bir döndürür. Her nesne, bir dil kodu (`lang`) içerir. Dönen değer `{ lang: 'tr' }, { lang: 'en' }` dizisidir.

### Page
**Ne yapar**: Bu, tarayıcıda veya istemcide kullanıcıya gösterilecek olan asıl React bileşenidir. Cookie politikası sayfasının temel iskeletini oluşturur ve gerekli olan dil parametresini alarak, dil-specific içeriği gösteren alt bileşene (`PageComponent`) aktarır.

**Nasıl yapar**: Fonksiyon, bir `params` prop'u alır. Bu prop, Next.js tarafından sunulan bir Promise'tir ve sayfa rotasındaki dinamik parametreleri (`[lang]`) içerir. Fonksiyon `await params` kullanarak bu Promise'i çözer ve `lang` değerini çıkarır. Ardından, dil bilgisini (`lang` prop'u olarak) `PageComponent` alt bileşenine aktararak render eder. Bu yapı, sayfanın farklı dillerde gösterilmesini sağlar.

**Parametreler**:
- `{ params }: { params: Promise<{ lang: string }> }` — Fonksiyon, bir prop nesnesi alır. Bu nesnenin `params` alanı, bir `Promise`'tır ve `{ lang: string }` şeklinde bir nesne ile resolve olur. `Promise`'ın çözülmesi, URL'deki dinamik `lang` parametresine karşılık gelen dizi değerini (`'tr'` veya `'en'`) verir.

**Dönüş**:
- `Promise<JSX.Element>` — Fonksiyon, bir `PageComponent` JSX elementi döndüren bir Promise'tır. `PageComponent`'e `lang` prop'u olarak, URL'den çözülen dil kodu geçirilir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/CookiePolicyPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `[lang]/legal/cerez-politikasi/page.tsx::generateStaticParams`
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Array<{ lang: string }>` — statik olarak üretilen `[tr, en]` dil parametreleri listesi

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\cerez-politikasi\page.tsx
  function: src\app\[lang]\legal\cerez-politikasi\page.tsx::generateStaticParams
  function: src\app\[lang]\legal\cerez-politikasi\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: generateStaticParams

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