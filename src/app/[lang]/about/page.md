---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\about\page.tsx
skeleton_hash: 0764930d9f5459d2
entity_hashes:
  func:Page: 32fe3fdb17787a5b
  func:generateStaticParams: 6d1b3e72f8b2da9f
  overview: 8dff6fca298bde81
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-12T10:17:31Z
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

**[Aksiyom 1]**: Eğer `Page` fonksiyonuna geçirilen `params` nesnesi `lang` alanı içermiyorsa, sayfa içeriği istenen dilde render edilemez.

> Next.js App Router'da `[lang]` bir dinamik rotadır ve `params.lang` zorunlu olarak beslenmelidir.

---

**[Aksiyom 2]**: Eğer `generateStaticParams()` fonksiyonu boş bir dizi döndürüyorsa, hiçbir dil için statik sayfa önceden oluşturulamaz ve istek üzerine (on-demand) render edilmesi gerekir.

> Fonksiyon, desteklenen dil kodlarının listesini döndürerek hangi varyantların build aşamasında oluşturulacağını belirler.

---

**[Aksiyom 3]**: Eğer `generateStaticParams()` tarafından döndürülen dil kodları ile `Page` fonksiyonunun beklediği `params.lang` değerleri tutarsızsa, geçersiz bir rotaya erişim denenir ve hata oluşur.

> Örneğin, `generateStaticParams` yalnızca `["tr", "en"]` döndürüyor ama runtime'da `params.lang === "de"` isteği geliyorsa, bu geçersizdir.

---

**[Aksiyom 4]**: Eğer `Page` bileşeni `params` parametresi olmadan (veya `params.lang` alanına erişilmeden) çağrılırsa, bileşen düzgün render edilemez.

> Fonksiyon imzası `Page({ params }: PageProps)` şeklindedir; `params` bağımlılığı zorunludur.

---

**[Aksiyom 5]**: Eğer bu modül bir "Hakkında" sayfasıysa ve `generateStaticParams` desteklenen dilleri dış kaynaktan (ör. yapılandırma dosyası, API) alıyorsa, o kaynağın erişilebilir ve tutarlı olması gerekir; aksi halde build aşamasında hata oluşur.

> Bu modülde `generateStaticParams` gövdesi verilmediği için kaynağın doğası bilinmemektedir, ancak herhangi bir dış bağımlılık varsa erişilebilir olmalıdır.

---

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, bir Next.js sayfa bileşeni olarak davranır ve belirli bir dile ait "Hakkımızda" sayfasının içeriğini sunar. Fonksiyon asenkrondur ve URL'den gelen dil parametresini alarak ilgili bileşeni render eder.

**Nasıl yapar**: Fonksiyon, `params` nesnesinden asenkron olarak `lang` değerini çözer. Çözülen bu dil kodu, sayfa içeriğini ve çevirilerini yöneten `PageComponent` bileşenine prop olarak iletilir. Bu sayede aynı sayfa yapısı farklı diller için içeriğini dinamik olarak günceller.

**Parametreler**:
- `params`: `Promise<PageProps>` — URL'den gelen ve `lang` anahtarını içeren asenkron parametre nesnesi. Next.js tarafından sayfa yolundaki dinamik segmentlerden otomatik olarak oluşturulur.

**Dönüş**: `JSX.Element` — `PageComponent` bileşeninin döndürdüğü ve ilgili dil için hazırlanmış "Hakkımızda" sayfasının JSX yapısı.

### generateStaticParams
**Ne yapar**: Bu fonksiyon, Next.js'in statik site oluşturma (SSG) sürecinde kullanılacak olan tüm olası `lang` parametre değerlerini döndürür. Temel amacı, build esnasında hangi diller için statik HTML dosyası oluşturulacağını sisteme bildirmektir.

**Nasıl yapar**: Fonksiyon, önceden tanımlı bir array döndürür. Her bir obje, bir `lang` parametre değeri temsil eder. Next.js bu listeyi iterasyona uğratır ve her bir `lang` değeri için `Page` fonksiyonunu ayrı ayrı çalıştırarak statik HTML dosyaları üretir. Bu mekanizma, uygulama performansını artırır ve sayfaların önceden derlenmesini sağlar.

**Parametreler**: Bu fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**: `Array<{ lang: string }>` — Statik olarak oluşturulacak sayfalar için gerekli dil kodlarını içeren bir nesne dizisi. Mevcut yapıda `tr` (Türkçe) ve `en` (İngilizce) olmak üzere iki dil desteği tanımlıdır.

---

## INTERFACES

### PageProps
- `params: Promise<{ lang: string }>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `[lang]/about/page.tsx::Page`
- **params**: `{ params: PageProps }` — Next.js sayfası prop'ları, `lang` parametresini içerir
- **ic_degiskenler**:
  - `lang` — `await params` sonucu destructure edilen dil kodu ('tr' veya 'en'), `PageComponent`'e prop olarak geçirilir
- **Dönüş**: JSX (`<PageComponent lang={lang} />`) — About sayfasının dil bazlı bileşeni

### [N2_NASIL] AST Pointer: `[lang]/about/page.tsx::generateStaticParams`
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Array<{ lang: string }>` — Statik olarak üretilecek sayfa dil varyasyonları listesi (`tr` ve `en`)

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