---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\support\ShippingPage.tsx
skeleton_hash: 4ace6a6aea5912e9
entity_hashes:
  func:ShippingPage: 321c885e2ea88a49
  overview: 2fb078273ffdbcdc
  style_tokens: f66481541679296a
generated_at: 2026-08-27T07:41:11Z
---

## Genel Bakış

ShippingPage, kargo ve sevkiyat işlemlerine ait kullanıcı arayüzünü sunan bir React bileşenidir. Modül tek bir ana bileşenden oluşur ve dışarıya varsayılan sayfa bileşeni olarak dışa aktarılır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ana sayfa bileşeni olarak kullanıcıya kargo/sevkiyat ile ilgili arayüzü render eder. Modülde yalnızca bu tek bileşen bulunduğu için fonksiyonlar arası çağrı ilişkisi bulunmamaktadır.
- ShippingPage

## Bağımlılıklar ve Mimari Notlar

- Modül tek bir bileşenden oluştuğu için iç bağımlılık yoktur.
- Dış bağımlılıklar (hangi kütüphane veya modüllerin import edildiği) verilen kaynak bilgiden tespit edilememiştir.
- Dinamik veya lazy yüklenen bir alt modül bilgisi mevcut değildir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir; yalnızca `ShippingPage()` imzası ve `React.FC` dönüş tipi mevcuttur. Modül sabitleri ve eski doküman da bulunmadığından, fonksiyon gövdesinden türetilebilecek modüle özgü bir varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

### ShippingPage
**Ne yapar**: Kargo/teslimat sayfasını temsil eden bir React fonksiyon bileşeni döndüren bir üst düzey fonksiyondur. Dosya yolu `src/views/support/ShippingPage.tsx` konumunda yer aldığından, uygulamanın destek/support bölümündeki kargoyla ilgili görünümü oluşturur.

**Nasıl yapar**: Fonksiyon, herhangi bir parametre almadan çağrıldığında bir `React.FC` (React Fonksiyon Bileşeni) döndürür. Docstring alanı boş bırakıldığından, fonksiyonun iç mantığı, kullandığı durum yönetimi (state), yan etkiler (effects) veya alt bileşenler hakkında kaynakta bilgi bulunmamaktadır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React fonksiyon bileşeni türünde bir değer döndürür. Bu bileşen, kargo/teslimat sayfasının kullanıcı arayüzünü render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::ArrowLeft
- import: next/navigation::useRouter
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/support/ShippingPage.tsx::ShippingPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen Next.js yönlendirme nesnesi; `router.back()` çağrısıyla bir önceki sayfaya geri dönmek için kullanılır
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('auth.back')`, `t('support.links.shipping')`, `t('support.shipping.desc1')`, `t('support.shipping.desc2')` anahtarlarıyla yerelleştirilmiş metinleri almak için kullanılır
- **Dönüş**: JSX elementi — kargo bilgi sayfasını gösteren bir `<div>` yapısı; geri butonu, başlık ve açıklama paragraflarını içerir

---

## NODE ID STANDARD

  file: src\views\support\ShippingPage.tsx
  function: src\views\support\ShippingPage.tsx::ShippingPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ShippingPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `border-light-gray`, `hover:text-primary-navy`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`
- **Layout:** `inline-flex`, `items-center`, `max-w-4xl`, `p-6`
- **Varyant/Responsive:** `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `lg:px-8`, `mb-4`, `mb-6`, `mr-1`, `mx-auto`, `px-4`, `py-10`, `rounded-xl`, `sm:px-6`, `space-y-4`, `transition-colors`