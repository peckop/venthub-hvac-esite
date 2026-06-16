---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\mesafeli-satis-sozlesmesi\page.tsx
skeleton_hash: 05c1042723e61e07
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: 0f7f79057de13ae8
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-16T11:52:41Z
---

## Genel Bakış
Bu modül, dil parametresine göre (`[lang]`) dinamik olarak render edilen mesafeli satış sözleşmesi sayfasını sunan bir Next.js sayfa bileşenidir. Modül, hem statik site oluşturma (SSG) için gerekli parametreleri üretir hem de ana sayfa bileşenini döndürerek sözleşme içeriğini kullanıcıya sunar.

## Fonksiyon Grupları
### Statik Sayfa Üretimi
Bu grup, Next.js'in statik site oluşturma sürecinde sayfaların hangi dil parametreleri ile oluşturulacağını belirler.
- `generateStaticParams`

### Sayfa Bileşeni
Bu grup, mesafeli satış sözleşmesi sayfasının ana render noktasını oluşturur ve dil bağlamına uygun sözleşme içeriğini kullanıcıya sunar.
- `Page`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js'in App Router yapısında yer alan bir sayfa bileşenidir; `generateStaticParams()` ile statik yollar üretilir, `Page` bileşeni ise `params` Promise'inden `lang` değerini alarak çalışır.

**[Aksiyom 1]**: Eğer `generateStaticParams()` fonksiyonu çalıştırılmazsa veya geçerli parametre setleri döndürmezse, build aşamasında statik sayfa üretimi başarısız olur ve ilgili dil için sayfa derlenemez.

**[Aksiyom 2]**: Eğer `params` Promise'i çözülmez veya `lang` alanı içermiyorsa, `Page` bileşeni geçerli bir dil parametresi alamaz ve sayfa içeriğinin doğru dilde gösterilmesi garantilenemez.

**[Aksiyom 3]**: Eğer `generateStaticParams()` tarafından döndürülen `lang` değerleri ile gerçek URL yapıları (dosya yolu `[lang]` slug'ı) eşleşmezse, istenen dildeki sayfa bulunamaz ve 404 hatası oluşur.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Bu fonksiyon, Next.js'in statik yol parametrelerini oluşturmak için kullanılır ve yalnızca "tr" ve "en" dil değerleriyle statik sayfaların önceden oluşturulmasını sağlar.
**Nasıl yapar**: Fonksiyon, dil desteklerini sabit bir dizi içinde döndürerek, Next.js build sürecinde hangi parametreler için sayfa oluşturacağını belirler. Bu sayede sadece belirtilen diller için statik yollar üretilir.
**Parametreler**: Bu fonksiyon parametre almaz.
**Dönüş**: `{ lang: string }` nesnelerinden oluşan bir dizi döndürür. Döndürülen dizi `[{ lang: 'tr' }, { lang: 'en' }]` şeklindedir.

### Page
**Ne yapar**: Bu fonksiyon, meşru-satış-sözleşmesi sayfasının asıl React bileşenini temsil eder ve dil parametresine göre dinamik bir sayfa render eder.
**Nasıl yapar**: Fonksiyon, `params` adında bir Promise olarak gelen parametreleri bekler ve `await` ile çözerek `lang` değerini çıkarır. Ardından, `PageComponent` bileşenini oluşturur ve `lang` prop'unu buna aktarır. Bu yapı, Next.js App Router'da asenkron sayfa bileşenleri için standart bir kalıptır.
**Parametreler**:
- `params`: `Promise<{ lang: string }>` — Sayfa için gerekli olan dil parametrelerini içeren bir Promise. Next.js tarafından otomatik olarak sağlanır ve `lang` alanını barındırır.
**Dönüş**: `<PageComponent lang={lang} />` JSX ifadesini döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/DistanceSalesAgreementPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/legal/mesafeli-satis-sozlesmesi/page.tsx::generateStaticParams
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang: 'tr'` — İlk dil parametresi nesnesi, Türkçe dilini temsil eder
  - `lang: 'en'` — İkinci dil parametresi nesnesi, İngilizce dilini temsil eder
- **Dönüş**: `Array<{ lang: string }>` — Statik olarak oluşturulacak dil parametreleri dizisi

### [N2_NASIL] AST Pointer: src/app/[lang]/legal/mesafeli-satis-sozlesmesi/page.tsx::Page
- **params**: `{ params: Promise<{ lang: string }> }` — Next.js tarafından sağlanan asenkron dil parametresi
- **ic_degiskenler**:
  - `lang` — Params promise'inden çözülen dil kodu (örn. 'tr' veya 'en'), sayfanın dil sürümünü belirler
- **Dönüş**: JSX bileşeni — `PageComponent`'in `lang` prop'u ile render edilmiş React bileşeni

---

**Fonksiyon İlişkileri:**
- `generateStaticParams` → `Page` (statik parametreleri sağlar)
- `Page` → `PageComponent` (görüntüleme bileşenini çağırır)

**Yan Etkiler:**
- Fonksiyonlar saf fonksiyondur, herhangi bir yan etki oluşturmazlar

**Değişken Yaşam Döngüsü:**
- `lang`: Fonksiyon içinde tanımlanıp hemen `PageComponent`'e prop olarak iletilir, harici etkisi yoktur

**Import Bağımlılıkları:**
- `PageComponent`: `../../../../views/legal/DistanceSalesAgreementPage` yolundan içe aktarılır

**Veri Akışı:**
- `generateStaticParams` → statik parametreler → `Page` fonksiyonu
- `params` → `lang` değişkeni → `PageComponent` prop'u

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\mesafeli-satis-sozlesmesi\page.tsx
  function: src\app\[lang]\legal\mesafeli-satis-sozlesmesi\page.tsx::generateStaticParams
  function: src\app\[lang]\legal\mesafeli-satis-sozlesmesi\page.tsx::Page

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