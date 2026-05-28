---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\konular\[slug]\page.tsx
skeleton_hash: e0d4abb9cfa64325
entity_hashes:
  func:Page: 2d510b14b2c5d81b
  func:generateStaticParams: f1cbfd553f9fcd39
  overview: 379a6c4a34f8235e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:34:48Z
---

## Genel Bakış
Bu modül, Next.js'in dinamik rotalama özelliğini kullanarak "destek/konular" bölümünde her bir konu için ayrı bir sayfa oluşturur. Derleme sürecinde konu listesinden slug değerlerini alarak statik yolları belirler, ardından kullanıcının eriştiği slug'a göre o konuya ait verileri çekip sayfayı render eder.

## Fonksiyon Grupları
### Statik Sayfa Yolları Üretimi
Uygulamada tanımlı tüm konuların slug'larını toplayarak Next.js'e derleme aşamasında hangi sayfaların önceden hazırlanacağını bildirir.
- `generateStaticParams`

### Dinamik Sayfa Render
Kullanıcı tarafından ziyaret edilen URL'deki slug parametresini işleyerek ilgili konu sayfasının içeriğini asenkron biçimde getirip ekrana yansıtır.
- `Page`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzalarından çıkarılabilecek minimum mimari varsayımlar tanımlanmıştır. Fonksiyon gövdeleri verilmediği için işlevsel davranışa ilişkin aksiyomlar belirlenememiştir.

[Aksiyom 1]: Eğer `generateStaticParams` fonksiyonu geçerli bir `Array<{ lang: string, slug: string }>` dönüş değeri üretmiyorsa, Next.js derleme sürecinde ilgili slug'lar için statik sayfalar oluşturulmaz.

[Aksiyom 2]: Eğer `Page` fonksiyonu içinde `params` Promise'i `await` edilmeden kullanılıyorsa, `lang` ve `slug` değerleri `Promise` nesnesi olarak ele geçer ve beklenen string değerlerine ulaşılamaz.

[Aksiyom 3]: Eğer URL'den gelen `slug` parametresi (`Promise` çözümlemesi sonrası) geçerli bir konu tanımlayıcısına karşılık gelmiyorsa, sayfada ilgili konu verisi gösterilemez.

[Aksiyom 4]: Eğer `lang` parametresi (`Promise` çözümlemesi sonrası) desteklenen bir dil kodu (örn: "tr", "en") içermiyorsa, çok dilli içerik doğru dilde sunulamaz.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Next.js uygulaması için statik sayfa oluşturma (Static Site Generation - SSG) süreçlerinde, sunucuda önceden oluşturulacak tüm sayfa yollarını (path) tanımlar.
**Nasıl yapar**: Uygulamanın dil destekleri (tr ve en) ve bilgi bankası konuları (topics) kullanılarak, her bir konu (slug) için dil çiftlerinden oluşan bir parametre dizisi üretir. Bu sayede her bir konu için hem Türkçe hem de İngilizce birer statik sayfa oluşturulması mümkün olur.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `{ lang: string, slug: string }` tipinde bir dizi (array) döndürür. Dizi elemanları, oluşturulacak her sayfanın `lang` ve `slug` parametrelerini içeren nesnelerdir.

### Page
**Ne yapar**: Bu sayfa rotası için asıl render edilecek React bileşenini (PageComponent) döndüren bir sunucu bileşenidir. URL'den gelen dinamik parametreleri işler.
**Nasıl yapar**: `params` adlı Promise nesnesini `await` ile çözerek içinden `slug` değerini çıkarır. Ardından, çözümleme sonucu elde edilen slug'ı bir prop olarak `PageComponent` bileşenine iletir ve bunun render edilmesini sağlar. Bu yapı, Next.js App Router'ın dinamik segmentleri için standart bir yaklaşımdır.
**Parametreler**:
- params: `Promise<{ lang: string, slug: string }>` — Rota segmentlerinden gelen dinamik parametreleri içeren Promise nesnesi. `await` edilerek içeriğine erişilir.
**Dönüş**: Bir JSX elementi (React bileşeni) döndürür.specifically, `<PageComponent slug={slug} />` ifadesi.

**Kaynak Dosya**: `src\app\[lang]\destek\konular\[slug]\page.tsx`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/destek/konular/[slug]/page.tsx::generateStaticParams
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `topics` — `tr.knowledge.topics` objesinin tüm anahtarlarını (slug'ları) içeren string dizisi. Statik sayfa oluşturma için kullanılacak konu listesini temsil eder.
- **Dönüş**: `{ lang: string, slug: string }[]` — Her slug için iki dil seçeneği ('tr' ve 'en') içeren objelerin dizisi. Next.js statik sayfa oluşturma tarafından kullanılır.

### [N2_NASIL] AST Pointer: src/app/[lang]/destek/konular/[slug]/page.tsx::Page
- **params**: `params: Promise<{ lang: string, slug: string }>` — Sayfanın URL parametrelerini içeren promise. `lang` dil kodunu, `slug` ise konu tanımlayıcısını tutar.
- **ic_degiskenler**:
  - `slug` — `await params` ile çözümlenen params objesinden çıkarılan konu tanımlayıcısı string'i. `PageComponent` bileşenine prop olarak geçirilir.
- **Dönüş**: JSX (`PageComponent` bileşeninin döndürdüğü React elemanı) — `slug` prop'uyla render edilen `PageComponent` bileşeni.

---

## NODE ID STANDARD

  file: src\app\[lang]\destek\konular\[slug]\page.tsx
  function: src\app\[lang]\destek\konular\[slug]\page.tsx::generateStaticParams
  function: src\app\[lang]\destek\konular\[slug]\page.tsx::Page

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