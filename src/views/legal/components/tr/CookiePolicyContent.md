---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\tr\CookiePolicyContent.tsx
skeleton_hash: 782d0430be589f04
entity_hashes:
  func:CookiePolicyContentTr: 405488fadaf0218c
  overview: a62575be1eca51d1
  style_tokens: 342fd94b09ce272b
generated_at: 2026-08-27T07:38:59Z
---

## Genel Bakış

Bu modül, VentHub platformunun Türkçe çerez politikası sayfası için içerik sunan bir React bileşenidir. Çerezlerin kullanımı, türleri ve yönetimi hakkında yasal bilgilendirme sağlamaktan sorumludur. Bileşen, dil parametresine göre dinamik olarak ilgili dildeki içeriği yükler.

## Fonksiyon Grupları

### İçerik Görüntüleme

Çerez politikasının Türkçe metin ve bölümlerini tarayıcıda render eden bileşeni içerir. Dil parametresine bağlı olarak ilgili dildeki içerik bileşeni dinamik olarak import edilir ve sayfaya entegre edilir.

- CookiePolicyContentTr

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### CookiePolicyContentTr
**Ne yapar**: Türkçe çerez politikası içeriğini görüntülemek için kullanılan bir React bileşenidir. Bileşen, dil bilgisini (`lang`) prop olarak alır ve Türkçe çerez politikası metnini kullanıcıya sunar.

**Nasıl yapar**: Bileşen, `lang` prop'unu destructuring yöntemiyle alır. `React.FC<{ lang: string }>` tipinde bir fonksiyonel bileşen olarak tanımlanmıştır. Dosya yolu (`src\views\legal\components\tr\`) incelendiğinde, Türkçe ("tr") diline özel çerez politikası içeriğini render ettiği anlaşılmaktadır. Bileşenin iç yapısı hakkında verilen kaynakta ek bilgi bulunmamaktadır.

**Parametreler**:
- `lang`: `string` — Bileşenin hangi dilde çalışacağını belirten dil kodu parametresi. Prop olarak dışarıdan alınır ve bileşenin dil davranışını yönlendirmek için kullanılır.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` prop'u alan bir React fonksiyonel bileşeni döndürür. Döndürülen bileşen, Türkçe çerez politikası içeriğini render etmek üzere tasarlanmıştır.

---

## İTHALATLAR (IMPORTS)
- import: @/components/consent/CookiePreferencesButton::CookiePreferencesButton
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/CookiePolicyContent.tsx::CookiePolicyContentTr
- **params**: `lang` — bileşene dışarıdan aktarılan dil bilgisi (ör. `"tr"`)
- **ic_degiskenler**:
  - `lang` — `localizedHref` fonksiyonuna ikinci argüman olarak geçirilir; KVKK linkinin dile özgü URL'sini üretmek için kullanılır
  - `legalConfig.sellerEmail` — iletişim bölümünde satıcı e-posta adresi olarak JSX içinde gösterilir
  - `legalConfig.lastUpdated` — yürürlük bölümünde politikanın son güncelleme tarihi olarak JSX içinde gösterilir
  - `localizedHref(Routes.legal.kvkk(), lang)` — KVKK Aydınlatma Metni linkinin `href` değeri olarak hesaplanır; `Routes.legal.kvkk()` döndürdüğü yol ve `lang` parametresiyle dile özgü tam URL üretir
  - `Routes.legal.kvkk()` — KVKK sayfasının rota yolunu döndüren fonksiyon çağrısı; `localizedHref`'e ilk argüman olarak aktarılır
  - `CookiePreferencesButton` — çerez tercipleri yönetim düğmesi olarak JSX içinde render edilir
  - `Link` — Next.js link bileşeni; KVKK metnine yönlendiren `<Link>` etiketinde kullanılır
- **Dönüş**: `React.ReactElement` — çerez politikasının Türkçe içeriğini barındıran JSX fragment (`<>...</>`) döndürür; sekiz adet `<section>` bloğu içerir (çerez tanımı, kullanılan çerezler tablosu, hukuki dayanak, üçüncü taraf hizmetleri, tercip yönetimi, kişisel veriler, iletişim, yürürlük)

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\CookiePolicyContent.tsx
  function: src\views\legal\components\tr\CookiePolicyContent.tsx::CookiePolicyContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookiePolicyContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `border-b`, `border-light-gray`, `text-industrial-gray`, `text-left`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xl`, `text-xs`
- **Layout:** `min-w-full`, `overflow-x-auto`, `p-2`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `list-disc`, `mb-3`, `mt-3`, `mt-4`, `pl-6`, `space-y-1`, `underline`