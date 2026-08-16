---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\data-table\BulkPricePanel.tsx
skeleton_hash: c6e852bc24d82b38
entity_hashes:
  func:BulkPricePanel: 98486d576f3fce24
  overview: fe92bf0c51b69212
  style_tokens: e2f13243910dab82
generated_at: 2026-08-15T16:41:17Z
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

**Not:** Fonksiyon gövdesi sağlandığında daha detaylı mimari varsayımlar (eşik değerleri, state bağımlılıkları, API çağrı koşulları vb.) üretilebilir.

---

## FONKSİYON DETAYLARI

### BulkPricePanel
**Ne yapar**: Toplu fiyat güncelleme panelini oluşturan ve yöneten React bileşenidir. Kullanıcının seçili ürünlerin fiyatlarını yüzde olarak veya sabit tutar olarak topluca güncellemesine olanak tanır.

**Nasıl yapar**: `useI18n` hook'u ile çoklu dil desteği sağlar. `priceMode` durumu ile yüzde veya sabit tutar modu arasında seçim yapılmasını, `priceValue` durumu ile girilen değerin takibini ve `priceError` durumu ile hata yönetimini yönetir. `apply` fonksiyonu içinde girilen değeri `parseFloat` ile sayıya dönüştürerek doğrulama yapar; geçersiz bir değer girildiğinde `priceError` durumunu ayarlar ve hata mesajını bileşen içinde gösterir. Geçerli bir değer girildiğinde `onApply` callback'ini çağırarak fiyatı uygular ve paneli kapatır. `modeButtonClass` yardımcı fonksiyonu, aktif/pasif duruma göre dinamik CSS sınıfları üretir.

**Parametreler**:
- `onApply`: `(mode: 'percent' | 'fixed', value: number) => void` — Fiyat güncelleme işlemi uygulandığında çağrılan geri çağırma fonksiyonu. Modu ('percent' veya 'fixed') ve sayısal değeri parametre olarak alır.
- `onClose`: `() => void` — Panel kapatıldığında çağrılan geri çağırma fonksiyonu.

**Dönüş**: `React.ReactNode` — Oluşturulan JSX içeriğini döndürür.

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
- **params**: ({ onApply, onClose }: BulkPricePanelProps)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, UI metinlerini çevirir
  - `priceMode` — Fiyat modu state'i ('percent' veya 'fixed'), varsayılan 'percent'
  - `setPriceMode` — priceMode state'ini güncelleyen setter fonksiyonu
  - `priceValue` — Kullanıcının girdiği fiyat değeri string state'i
  - `setPriceValue` — priceValue state'ini güncelleyen setter fonksiyonu
  - `priceError` — Hata mesajı state'i, null veya string
  - `setPriceError` — priceError state'ini güncelleyen setter fonksiyonu
  - `apply` — Fiyat uygulama fonksiyonu, iç fonksiyon
  - `modeButtonClass` — Mod butonu için CSS class'ını döndüren iç fonksiyon
  - `PERCENT_ICON` — Yüzde ikonu (JSX içinde kullanılır)
  - `LIRA_ICON` — Lira ikonu (JSX içinde kullanılır)
- **Dönüş**: React.ReactNode

### [N2_NASIL] AST Pointer: BulkPricePanel.tsx::apply
- **params**: (yok)
- **ic_degiskenler**:
  - `parsed` — parseFloat(priceValue) ile elde edilen ondalık sayı değeri
- **Dönüş**: void

### [N3_NASIL] AST Pointer: BulkPricePanel.tsx::modeButtonClass
- **params**: (active: boolean)
- **ic_degiskenler**: (yok)
- **Dönüş**: string — Dinamik CSS class string'i

### [N4_NASIL] AST Pointer: BulkPricePanel.tsx::onChange (input handler)
- **params**: (e) — React.ChangeEvent<HTMLInputElement>
- **ic_degiskenler**: (yok)
- **Dönüş**: void

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
- **Renkler:** `bg-white`, `border-gray-200`, `text-gray-400`, `text-gray-800`, `text-primary-navy`, `text-rose-500`, `text-sm`, `text-xs`
- **Layout:** `fixed`, `flex`, `flex-1`, `gap-2`, `items-center`, `min-w-280px`, `p-4`, `shadow-2xl`
- **Varyant/Responsive:** `focus-visible:` önekleri
- **Yardımcı Sınıflar:** `!py-2`, `!text-xs`, `${adminButtonPrimaryClass`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `font-semibold`, `mb-3`, `mt-2`, `percent`, `px-3`, `py-2`, `rounded-lg`, `rounded-xl`