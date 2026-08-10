---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\about\page.tsx
skeleton_hash: 5b26b94087063b88
entity_hashes:
  func:Page: 32fe3fdb17787a5b
  func:generateStaticParams: 6d1b3e72f8b2da9f
  overview: 8dff6fca298bde81
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:27Z
---

## Genel Bakış
Bu modül, çoklu dil desteği sunan "Hakkında" sayfasını oluşturur. Next.js App Router yapısında `[lang]/about` rotasına karşılık gelir ve hem statik sayfa yapılandırmasını hem de sayfa içeriğinin render edilmesini yönetir.

## Fonksiyon Grupları
### Statik Sayfa Yapılandırması
Bu grup, sayfanın hangi dil varyantları için önceden oluşturulacağını belirler.
- generateStaticParams

### Sayfa Renderlama
Bu grup, dil parametresine göre sayfa içeriğini JSX olarak üretir ve kullanıcıya sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js App Router yapısında çoklu dil destekli "Hakkında" sayfasını yöneten bir sayfa bileşenidir. Aşağıdaki varsayımlar fonksiyon imzalarından çıkarılmıştır.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Bu fonksiyon, Next.js uygulamasındaki "/about" sayfasının ana sayfa bileşenidir. Dinamik dil parametresini alarak ilgili dilde About sayfasını render eder.

**Nasıl yapar**: Fonksiyon, `params` prop'unu await ederek asenkron olarak dil parametrelerini çıkarır. Elde edilen `lang` değerini `PageComponent` bileşenine prop olarak geçirir ve sayfanın ilgili dilde görüntülenmesini sağlar. Bu yapı, Next.js App Router'ın dinamik rotaları için standart bir yaklaşımdır.

**Parametreler**:
- `params` : `PageProps` — Sayfanın dinamik parametrelerini içeren nesne. `{ lang: string }` yapısına sahiptir ve URL segmentinden gelen dil kodunu barındırır.

**Dönüş**: JSX elementi döndürür. `PageComponent` bileşeninin `lang` prop'u ile birlikte render edilmiş halini返回 eder.

### generateStaticParams
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../views/AboutPage::PageComponent

---

## INTERFACES

### PageProps
- `params: Promise<{ lang: string }>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/[lang]/about/page.tsx`::Page
- **params**: `{ params }: PageProps` — Next.js route params objesi, `lang` parametresini içerir
- **ic_degiskenler**:
  - `lang` — `params` objesinden `await` ile çözülüp destructure edilen dil kodu (ör. `'tr'` veya `'en'`); `PageComponent`'e prop olarak iletilir
- **Dönüş**: JSX — `<PageComponent lang={lang} />` bileşeni döner

### [N2_NASIL] AST Pointer: `src/app/[lang]/about/page.tsx`::generateStaticParams
- **params**: (yok)
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: `Array<{ lang: string }>` — `[ { lang: 'tr' }, { lang: 'en' } ]` statik olarak oluşturulmuş dil parametreleri listesi; Next.js'in statik site oluşturmada hangi `[lang]` değerleri için sayfa üretileceğini tanımlar

---

## NODE ID STANDARD

  file: src\app\[lang]\about\page.tsx
  function: src\app\[lang]\about\page.tsx::Page
  function: src\app\[lang]\about\page.tsx::generateStaticParams

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