---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\components\admin\data-table\BulkPricePanel.tsx
skeleton_hash: 1ddf21d26a06d896
entity_hashes:
  func:BulkPricePanel: fee171469e911c3e
  overview: fe92bf0c51b69212
  style_tokens: 0d100a4eba997618
generated_at: 2026-08-27T04:10:17Z
---

## Genel Bakış

`BulkPricePanel`, yöneticilerin toplu fiyat güncelleme işlemlerini gerçekleştirebildiği bir React panel bileşenidir. Bu panel, veri tablosu üzerinden seçili ürünlerin fiyatlarını tek seferde düzenlemeye olanak tanır ve iki temel callback üzerinden üst bileşene uygulama veya kapatma sinyali iletir.

## Fonksiyon Grupları

### Ana Bileşen (BulkPricePanel)
Tek bir React fonksiyonel bileşeninden oluşan bu modül, toplu fiyat düzenleme panelinin tüm arayüzünü ve mantığını barındırır. Üst bileşenden alınan `onApply` ve `onClose` callback'leri aracılığıyla fiyat uygulama ve paneli kapatma işlemlerini yönetir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, sadece fonksiyon imzasından çıkarılabilecek minimum varsayımlar tanımlanabilmektedir.

[Aksiyom 1]: Eğer `onApply` callback'i verilmezse, bileşen toplu fiyat uygulama işlemini tetikleyemez.

[Aksiyom 2]: Eğer `onClose` callback'i verilmezse, bileşen kapatılamaz veya kullanıcı paneli kapattığında hata oluşur.

---

## FONKSİYON DETAYLARI

### BulkPricePanel
**Ne yapar**: Toplu fiyat güncelleme işlemini kullanıcıya sunan bir React bileşenidir. Kullanıcının yüzde bazlı veya sabit tutar bazlı fiyat değişikliği yapabilmesini sağlar; geçersiz giriş durumunda satır içi hata mesajı gösterir ve geçerli değer girildiğinde üst bileşene fiyat modu ve sayısal değer çiftini iletir.

**Nasıl yapar**: Bileşen, `useI18n` hook'u aracılığıyla uluslararasılaştırma desteğini alır ve tüm metinleri `t()` fonksiyonuyla çözümleyerek çoklu dil desteği sağlar. Üç adet `React.useState` ile durum yönetimi yapar: `priceMode` (yüzde mi sabit tutar mı seçili), `priceValue` (kullanıcının girdiği ham değer) ve `priceError` (satır içi doğrulama hatası). `apply` adlı iç fonksiyon, girilen değeri `parseFloat` ile sayıya dönüştürür; dönüşüm başarısız olursa (NaN) `priceError` durumunu ayarlayarak sayfada satır içi hata görüntüler — `alert()` kullanılmaz, bu tasarım NN/g'nin "hata, oluştuğu yerin yanında raporlanmalıdır" ilkesine uyar. Geçerli bir sayı girildiğinde `onApply` prop'una `(priceMode, parsed)` çiftini aktarır, input alanını sıfırlar ve `onClose` prop'unu çağırarak paneli kapatır. `modeButtonClass` adlı yardımcı fonksiyon, Tailwind CSS sınıflarını birleştirerek aktif/pasif buton durumlarına göre farklı görsel stiller döndürür. JSX dönüşünde iki mod butonu (yüzde ve sabit tutar), bir sayısal input alanı, bir uygulama butonu, koşullu hata mesajı ve mod'a göre değişen ipucu metni yer alır. Input alanı, hata durumunda `aria-invalid` ve `aria-describedby` öznitelikleriyle erişilebilirlik standartlarına uygun şekilde işaretlenir.

**Parametreler**:
- `onApply`: `(mode: 'percent' | 'fixed', value: number) => void` — Kullanıcı geçerli bir değer girdiğinde çağrılan geri çağırım fonksiyonu. Seçili fiyat modu ve sayısal değeri parametre olarak alır.
- `onClose`: `() => void` — Uygulama işlemi tamamlandıktan sonra paneli kapatmak için çağrılan geri çağırım fonksiyonu.

**Dönüş**: `React.ReactNode` — Toplu fiyat güncelleme panelinin JSX ağacını döndürür. Panel; başlık, iki mod seçici buton, sayısal input, uygulama butonu, koşullu hata mesajı ve ipucu metni içeren bir kapsayıcı div'den oluşur.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminButtonPrimaryClass
- import: @/i18n/I18nProvider::useI18n
- import: react::React

---

## INTERFACES

### BulkPricePanelProps
TOPLU FİYAT GÜNCELLEME PANELİ `BulkActionToolbar`'dan çıkarıldı: o bileşen `BulkBar` ile MÜKERRERDİ (aynı işi yapan iki yapışkan toplu-işlem çubuğu, üstelik farklı görsel dillerde — biri koyu cam, diğeri açık zeminli emoji'li). Cetvel §4'ün "aynı işlem farklı sayfada farklı görünmemeli" maddesi bunu
- `onApply: (mode: 'percent' | 'fixed', value: number) => void`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BulkPricePanel.tsx::BulkPricePanel
- **params**: `{ onApply, onClose }` — `BulkPricePanelProps` tipinde, `onApply` fiyat güncelleme işlemini başlatan fonksiyon, `onClose` paneli kapatan fonksiyon
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, metinleri yerelleştirmek için kullanılır
  - `priceMode` — state, `'percent' | 'fixed'` tipinde, seçili fiyat modunu tutar (başlangıç: `'percent'`)
  - `setPriceMode` — `priceMode` state'ini güncelleyen setter fonksiyonu
  - `priceValue` — state, string tipinde, kullanıcının girdiği fiyat değerini tutar (başlangıç: `''`)
  - `setPriceValue` — `priceValue` state'ini güncelleyen setter fonksiyonu
  - `priceError` — state, `string | null` tipinde, doğrulama hatası mesajını tutar (başlangıç: `null`)
  - `setPriceError` — `priceError` state'ini güncelleyen setter fonksiyonu
  - `apply` — içinde tanımlı fonksiyon, form gönderimini işler
  - `modeButtonClass` — içinde tanımlı fonksiyon, mod butonlarının CSS sınıfını döndürür
- **Dönüş**: `React.ReactNode`

### [N2_NASIL] AST Pointer: BulkPricePanel.tsx::apply
- **params**: yok
- **ic_degiskenler**:
  - `parsed` — `parseFloat(priceValue)` sonucu, kullanıcının girdiği değerin sayısal karşılığı
- **Dönüş**: `void` — ancak yan etki olarak `setPriceError`, `onApply`, `setPriceValue` ve `onClose` fonksiyonlarını çağırır

### [N3_NASIL] AST Pointer: BulkPricePanel.tsx::modeButtonClass
- **params**: `active: boolean` — butonun aktif olup olmadığını belirtir
- **ic_degiskenler**: yok
- **Dönüş**: `string` — CSS sınıf adlarını içeren template literal

### [N4_NASIL] AST Pointer: BulkPricePanel.tsx::onChange
- **params**: `e` — input değişiklik olayı nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak `setPriceValue(e.target.value)` ve `setPriceError(null)` çağırır

---

## NODE ID STANDARD

  file: src\components\admin\data-table\BulkPricePanel.tsx
  function: src\components\admin\data-table\BulkPricePanel.tsx::BulkPricePanel

---

## DISA AKTARILANLAR (EXPORTS)
  export: BulkPricePanel
  export: BulkPricePanelProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `border-admin-border`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-primary-navy`, `text-sm`, `text-xs`
- **Layout:** `fixed`, `flex`, `flex-1`, `gap-2`, `items-center`, `min-w-280px`, `p-4`, `shadow-admin-lg`
- **Varyant/Responsive:** `focus-visible:` önekleri
- **Yardımcı Sınıflar:** `!py-2`, `!text-xs`, `${adminButtonPrimaryClass`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `font-semibold`, `mb-3`, `mt-2`, `percent`, `px-3`, `py-2`, `rounded-admin-md`