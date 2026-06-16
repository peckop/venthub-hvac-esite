---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx
skeleton_hash: 84f66d0b325761e6
entity_hashes:
  func:Page: 851f6a31795db41b
  func:generateStaticParams: 42ae72125a484b5f
  overview: c6e80b9884dd71c2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-16T11:52:56Z
---

## Genel Bakış
Bu modül, uygulamanın yasal bilgilendirme formu sayfasını temsil eden bir Next.js sayfa bileşenidir. Modül, yasal zorunluluklar gereği kullanıcılara ön bilgilendirme içeriğini sunar ve dil parametresine göre dinamik olarak render edilir.

## Fonksiyon Grupları
### Statik Yolların Üretimi
Bu grup, sayfanın statik yollarını oluşturarak Next.js'in önceden render edebileceği sayfaları belirler.
- generateStaticParams

### Sayfa Bileşeni
Bu grup, yasal bilgilendirme formu sayfasının ana React bileşenini ve sayfa yapısını tanımlar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Next.js App Router yapısında çalışan bir sayfa bileşenidir; çalışması için ortam ve rota yapılandırmasına ihtiyaç duyar.

[Aksiyom 1]: Eğer `params` parametresi verilmemişse veya `lang` alanı içermiyorsa, sayfa doğru yüklenemez ve hata oluşur.

[Aksiyom 2]: Eğer `generateStaticParams()`fonksiyonu geçerli dil (lang) değerleri içermeyen bir dizi döndürürse, statik sayfa oluşturma başarısız olur ve ilgili rotalar için buildsnapshots oluşturulamaz.

[Aksiyom 3]: Eğer `lang` parametresi desteklenmeyen bir dil kodu (örn: "xx") ise, sayfa içeriği doğru yüklenemez veya fallback mekanizması devreye giremez.

[Aksiyom 4]: Eğer `params`Promise'i çözülemez veya reddedilirse, sayfa bileşeni render edilemez ve kullanıcı hata ekranı görür.

[Aksiyom 5]: Eğer uygulama dil destek mekanizması (i18n) yapılandırması yanlışsa, `generateStaticParams()`调用 başarısız olur ve statik sayfalar oluşturulamaz.

---

## FONKSİYON DETAYLARI

### generateStaticParams
**Ne yapar**: Next.js uygulaması için statik olarak oluşturulabilecek sayfa yollarının (path) parametrelerini üretir. Bu durumda, uygulamanın iki dil versiyonu (`tr` ve `en`) olduğunu tanımlar.
**Nasıl yapar**: Fonksiyon, içeriği önceden tanımlanmış sabit bir dizi olan `Promise` döndürür. Bu dizi, her biri bir dil kodunu (`lang` anahtarıyla) temsil eden iki nesne içerir. Next.js, bu bilgiyi build zamanında kullanarak belirtilen parametrelerle (`/tr/...`, `/en/...`) önceden oluşturulmuş HTML sayfaları üretir.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `Promise<Array<{ lang: string }>>` — Dönen değer, `Promise` ile sarılmış ve iki nesnenin bulunduğu bir dizidir. Her nesne `{ lang: 'tr' }` veya `{ lang: 'en' }` formatındadır.

### Page
**Ne yapar**: Belirli bir dil (`lang`) parametresi ile Legal On-Bilgilendirme Formu sayfasını render eden ana React sayfa bileşenidir.
**Nasıl yapar**: Fonksiyon, bir `Promise` türünde olan `params` prop'unu alır. Fonksiyon gövdesinde `await params` ifadesi kullanılarak Promise çözülür ve içinden `lang` değeri提取edilir. Bu `lang` değeri, asıl sayfa içeriğini oluşturan `PageComponent` bileşenine prop olarak geçirilerek sayfa dilinin ayarlanması sağlanır.
**Parametreler**:
- `params`: `Promise<{ lang: string }>` — Next.js tarafından sunulan ve sayfa yolundaki dinamik parametreleri (burada `lang`) bir `Promise` içinde sunan nesne. Bu Promise, bileşen içinde `await` ile çözümlenerek gerçek parametre değerine erişilir.
**Dönüş**: `Promise<JSX.Element>` — `PageComponent` bileşeninin oluşturduğu JSX yapısını içeren bir `Promise`. Next.js, bu JSX'i alarak istemci tarafında render edecektir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/PreInformationPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: [lang]/legal/on-bilgilendirme-formu/page.tsx::generateStaticParams
- **params**: yok
- **ic_degiskenler**:
  - `{ lang: 'tr' }, { lang: 'en' }` — Statik parametre nesneleri; Next.js'in önceden oluşturma (SSG) aşamasında hangi dil değerleri için sayfa üretileceğini tanımlar
- **Dönüş**: `{ lang: string }[]` — Dil dizisi (tr ve en), her biri `generateStaticParams` çağrıldığında sayfanın derlenmesini tetikler

### [N2_NASIL] AST Pointer: [lang]/legal/on-bilgilendirme-formu/page.tsx::Page
- **params**: `{ params: Promise<{ lang: string }> }` — Next.js App Router tarafından sağlanan asenkron parametre objesi; `lang` alanını barındırır
- **ic_degiskenler**:
  - `lang` — `await params` ile çözümlenmiş dil kodu string'i ('tr' veya 'en'); `PageComponent`'e prop olarak传递传递传递
- **Dönüş**: JSX — `PageComponent` bileşeninin `lang` prop'u ile render ettiği React JSX düğümü

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx
  function: src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx::generateStaticParams
  function: src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx::Page

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