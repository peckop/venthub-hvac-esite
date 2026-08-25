---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\app\[lang]\about\page.tsx
skeleton_hash: f0da2bf968e8f6b7
entity_hashes:
  func:Page: 6f033064b6e4463f
  func:generateStaticParams: 8c98a454509d7f36
  overview: 8dff6fca298bde81
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:23:39Z
---

## Genel Bakış

Bu modül, Next.js App Router yapısında uluslararasılaştırma destekli bir "Hakkımızda" sayfasını tanımlar. `[lang]` yol parametresini kullanarak çok dilli statik sayfa oluşturma işlevselliği sağlar. `generateStaticParams` fonksiyonu, desteklenen diller için statik yollar üretir ve bu yollar `Page` bileşenine `params` olarak aktarılır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ana sayfa bileşenini tanımlar ve gelen yol parametrelerini kullanarak içeriği render eder.
- Page

### Statik Yol Üretimi
Desteklenen diller için statik olarak oluşturulacak sayfa yollarını belirler; bu sayede derleme anında tüm dil varyantları hazır hale gelir.
- generateStaticParams

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri verilmemiştir. Yalnızca `Page` ve `generateStaticParams` fonksiyon imzaları mevcuttur. Fonksiyon gövdesi olmadan modülün doğru çalışması için hangi koşulların varolması gerektiğini belirleyecek yeterli bilgi bulunmamaktadır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Next.js uygulamasında "about" sayfasının ana bileşenini oluşturan asenkron fonksiyondur. URL'den gelen dil parametresini alır ve ilgili dil için sayfa bileşenini render eder.

**Nasıl yapar**: Fonksiyon `PageProps` tipinde bir parametre alır ve bu parametre içindeki `params` nesnesini `await` ile çözümleyerek `lang` değerini elde eder. Ardından `PageComponent` bileşenini `lang` prop'u ile birlikte döndürür. Bu yapı Next.js'in dinamik rotalar ve statik site oluşturma (SSG) özelliklerini kullanır.

**Parametreler**:
- params: PageProps — Sayfa özelliklerini içeren nesne. `params` alt nesnesi URL'den gelen yol parametrelerini içerir ve `lang` değerini barındırır.

**Dönüş**: JSX elementi — `PageComponent` bileşeninin `lang` prop'u ile render edilmiş hali.

### generateStaticParams
**Ne yapar**: Next.js'in statik site oluşturma (SSG) sürecinde kullanılacak statik parametreleri tanımlayan asenkron fonksiyondur. Bu fonksiyon, uygulamanın hangi dil yolları için statik sayfalar oluşturacağını belirler.

**Nasıl yapar**: Fonksiyon herhangi bir parametre almaz ve sabit bir dizi döndürür. Dizi içinde iki nesne bulunur: biri Türkçe (`tr`) diğeri İngilizce (`en`) dil kodlarını içerir. Next.js bu dönüş değerini kullanarak `/tr/about` ve `/en/about` yolları için statik sayfalar oluşturur.

**Parametreler**: Yok — fonksiyon parametre almaz.

**Dönüş**: Array<{ lang: string }> — `lang` özelliğine sahip nesnelerden oluşan dizi. Dizi şu iki elemanı içerir: `{ lang: 'tr' }` ve `{ lang: 'en' }`.

---

## İTHALATLAR (IMPORTS)
- import: ../../../views/AboutPage::PageComponent

---

## INTERFACES

### PageProps
- `params: Promise<{ lang: string }>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/about/page.tsx::Page
- **params**: `params` — PageProps tipinde, async olarak await edilen route parametreleri nesnesi
- **ic_degiskenler**:
  - `lang` — `await params` sonucu destruct edilen dil parametresi (params.lang karşılığı)
- **Dönüş**: `<PageComponent lang={lang} />` — AboutPage view bileşenini `lang` prop'u ile render eden JSX elementi

### [N2_NASIL] AST Pointer: src/app/[lang]/about/page.tsx::generateStaticParams
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: `[{ lang: 'tr' }, { lang: 'en' }]` — iki statik route parametre seti içeren dizi; her eleman `lang` alanına sahip nesne

---

## NODE ID STANDARD

  file: page.tsx
  function: page.tsx::Page
  function: page.tsx::generateStaticParams

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