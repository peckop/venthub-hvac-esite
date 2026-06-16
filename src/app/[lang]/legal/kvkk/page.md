---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\kvkk\page.tsx
skeleton_hash: db1c502cc9757f4b
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: 5fe3924512d7505c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-16T11:52:23Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasında KVKK (Kişisel Verilerin Korunması Kanunu) yasal metnini sunan statik bir Next.js sayfasıdır. Modül, dil bazlı erişim sağlamak için gerekli parametreleri önceden hesaplar ve ilgili yasal içeriği, bağımlı olduğu bileşen aracılığıyla kullanıcıya sunar.

## Fonksiyon Grupları
### Statik Yol Parametreleri
Modülün dil destekli erişimini sağlamak için gerekli dinamik segmentleri (ör. dil kodları) üretir.
- generateStaticParams

### Sayfa Bileşeni
KVKK yasal içeriğini düzenleyerek ve dil parametresini işleyerek kullanıcıya sunan üst seviye sayfa giriş noktasıdır.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, statik olarak oluşturulmuş çoklu dilde KVKK bilgilendirme sayfalarını sunar.

[Aksiyom 1]: Eğer `generateStaticParams()` fonksiyonu, desteklenen dil kodlarını (`lang`) içeren geçerli bir parametre listesi döndürmezse, ilgili dildeki statik sayfa (örneğin `/tr/kvkk` veya `/en/kvkk`) oluşturulamaz.
[Aksiyom 2]: Eğer `Page` fonksiyonuna传递 edilen `params` nesnesi içindeki `lang` değeri, uygulama tarafında tanımlanmış geçerli bir dil kodu (örneğin 'tr', 'en') değilse veya params sözleşmeye uygun hazırlanmamışsa, sayfa bileşeni doğru içeriği render edemeyebilir veya hata verebilir.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Next.js uygulaması için statik olarak oluşturulacak sayfaların parametrelerini (dil kodları) belirler. Bu fonksiyon, build zamanında çalışarak uygulamanın hangi dil sürümlerinin (tr ve en) statik olarak önbelleğe alınacağını tanımlar.

**Nasıl yapar**: Fonksiyon asenkron (`async`) olarak tanımlanmıştır ancak içinde herhangi bir bekleme işlemi (await) yapmaz. Doğrudan sabit bir dizin döndürür. Bu dizi, her biri `lang` anahtarına sahip birer nesne içerir ve bu anahtarın değeri `'tr'` veya `'en'` olarak atanmıştır. Next.js bu çıktıyı kullanarak ilgili dil sürümleri için statik HTML dosyaları üretir.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `{ lang: 'tr' } | { lang: 'en' }` formatında bir nesne dizisi döndürür. Her nesne, uygulamanın desteklediği bir dil kodunu temsil eder.

### Page
**Ne yapar**: Next.js uygulamasının `/[lang]/legal/kvkk` rotasındaki sayfa bileşenini asenkron olarak oluşturur ve render eder. Bu bileşen, dinamik bir `lang` parametresine bağlı olarak farklı dil sürümlerinde KVKK (Kişisel Verilerin Korunması Kanunu) sayfasını gösterir.

**Nasıl yapar**: Fonksiyon asenkron (`async`) bir bileşendir. `params` prop'u olarak bir `Promise` alır. Fonksiyon içinde `await` operatörü kullanarak bu promise'ın çözülmesini bekler ve `lang` değerini çıkarır. Ardından, çıkarılan `lang` değerini `PageComponent` adlı alt bileşenine prop olarak geçirerek JSX'ini döndürür. Bu yapı, Next.js App Router'daki dinamik segmentlerin asenkron olarak ele alınmasının standart bir yoludur.

**Parametreler**:
- `params`: `Promise<{ lang: string }>` — Next.js tarafından otomatik olarak sağlanan, URL'deki dinamik segmentleri (bu durumda dil kodunu) içeren bir promise nesnesi. `await` ile çözüldüğünde `{ lang: string }` formatında bir nesneye dönüşür.

**Dönüş**: `<PageComponent lang={lang} />` formatında bir React JSX'ini döndürür. Döndürülen JSX, `lang` prop'u aracılığıyla istenen dil sürümü için gerekli içeriği gösteren bileşendir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/KVKKPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/[lang]/legal/kvkk/page.tsx`::generateStaticParams
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ lang: string }[]` — Statik olarak `[ 'tr' ]` ve `[ 'en' ]` dilleri için sayfa oluşturur.

### [N2_NASIL] AST Pointer: `src/app/[lang]/legal/kvkk/page.tsx`::Page
- **params**: `{ params: Promise<{ lang: string }> }`
- **ic_degiskenler**:
  - `lang` — `params` promise'inden çözülen dil kodu (string). Sayfanın görüntüleme dilini belirler.
- **Dönüş**: `JSX.Element` — `PageComponent` bileşenini `lang` prop'u ile birlikte döndürür.

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\kvkk\page.tsx
  function: src\app\[lang]\legal\kvkk\page.tsx::generateStaticParams
  function: src\app\[lang]\legal\kvkk\page.tsx::Page

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