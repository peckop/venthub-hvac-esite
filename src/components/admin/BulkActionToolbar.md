---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\BulkActionToolbar.tsx
skeleton_hash: 8d306dcdeac63716
entity_hashes:
  func:BulkActionToolbar: ba39222c0aa88e73
  overview: f47185db4076328f
  style_tokens: 812207303bb8adc3
generated_at: 2026-06-19T20:47:03Z
---

## Genel Bakış
BulkActionToolbar bileşeni, yönetim panelinde toplu seçim işlemlerini yönetmek için kullanılan bir araç çubuğudur. Seçili öğe sayısını görüntüler ve durum güncelleme, özellik değiştirme veya silme gibi toplu eylemleri tetiklemek için dışarıdan sağlanan callback fonksiyonlarını arayüz üzerinden sunar.

## Fonksiyon Grupları
### Toplu İşlem Arayüzü ve Eylem Tetikleme
Bu grup, seçili öğe sayısını gösteren etiketi ve toplu işlem butonlarını (durum güncelleme, özellik açma/kapama, silme) oluşturarak kullanıcı etkileşimlerini üst bileşene aktarır.
- BulkActionToolbar

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### BulkActionToolbar
**Ne yapar**: Seçili öğe sayısını gösteren ve toplu eylemler (durum değişikliği, özellik geçişi, silme) için tetikleyiciler sağlayan bir React bileşenini tanımlar.  

**Nasıl yapar**: Props olarak aldığı `selectedCount`, `onStatusChange`, `onFeatureToggle` ve `onDelete` fonksiyonlarını UI elemanlarına bağlayarak, kullanıcı etkileşimlerine göre ilgili geri çağırma fonksiyonlarını çalıştırır. Bileşen, `BulkActionToolbarProps` tipinde bir fonksiyonel bileşen (`React.FC`) olarak döndürülür.  

**Parametreler**:
- `selectedCount`: number — Kullanıcı tarafından seçilen öğelerin toplam sayısı.
- `onStatusChange`: (newStatus: string) => void — Seçili öğelerin durumunu güncellemek için çağrılan geri çağırma fonksiyonu.
- `onFeatureToggle`: (featureName: string, enabled: boolean) => void — Belirli bir özelliğin etkinleştirilip devre dışı bırakılmasını yönetmek için kullanılan geri çağırma fonksiyonu.
- `onDelete`: () => void — Seçili öğelerin toplu silinmesini tetikleyen geri çağırma fonksiyonu.

**Dönüş**: React.FC<BulkActionToolbarProps> — Tanımlanan props tipine uygun bir fonksiyonel React bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: ../../utils/adminUi::adminButtonPrimaryClass
- import: @/i18n/I18nProvider::useI18n
- import: react::React

---

## INTERFACES

### BulkActionToolbarProps
- `selectedCount: number`
- `onStatusChange: (status: string) => void`
- `onFeatureToggle: (featured: boolean) => void`
- `onDelete: () => void`
- `onPriceAdjust: (mode: 'percent' | 'fixed', value: number) => void`
- `onClearSelection: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/BulkActionToolbar.tsx::BulkActionToolbar

- **params**:
  - `selectedCount` — Seçili ürün/hizmet sayısını belirtir; 0 ise bileşen render edilmez (early return)
  - `onStatusChange` — Seçili öğelerin durumunu ('active'/'inactive') değiştirmek için çağrılan callback fonksiyonu
  - `onFeatureToggle` — Seçili öğelerin öne çıkarma durumunu değiştirmek için çağrılan callback fonksiyonu
  - `onDelete` — Seçili öğeleri silmek için çağrılan callback fonksiyonu
  - `onPriceAdjust` — Toplu fiyat güncelleme işlemi tetiklemek için çağrılan callback fonksiyonu; priceMode ve numeric değeri parametre olarak alır
  - `onClearSelection` — Tüm seçimleri temizlemek için çağrılan callback fonksiyonu

- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; UI metinlerini çoklu dil desteğiyle render etmek için kullanılır
  - `showPricePanel` — Fiyat güncelleme panelinin açılıp kapanma durumunu tutar (boolean state); toggle ile yönetilir
  - `priceMode` — Fiyat güncelleme modunu belirler: `'percent'` (yüzde) veya `'fixed'` (sabit tutar); varsayılan `'percent'`
  - `priceValue` — Fiyat güncelleme panelindeki input alanına girilen ham metin değerini tutar (string state); submit'te `parseFloat` ile number'a dönüştürülür
  - `v` — `parseFloat(priceValue)` ile elde edilen sayısal fiyat değeri; `isNaN` kontrolünden geçer, geçemezse `alert` ile hata gösterilir ve fonksiyon durdurulur; geçerse `onPriceAdjust(priceMode, v)` ile üst bileşene iletilir

- **Dönüş**: JSX (React elementi) — Seçili öğe sayısına göre toplu işlem toolbar'ı render eder; `selectedCount === 0` ise `null` döner (nothing rendered). Toolbar içinde durum değiştirme, öne çıkarma, toplu fiyat güncelleme ve silme butonları; fiyat paneli input'u ve seçim bilgisi bulunur. Yan etkiler: `setShowPricePanel(false)` ve `setPriceValue('')` ile fiyat paneli submit sonrası kapanır ve input temizlenir; geçersiz sayıda `alert()` çağrılır.

---

## NODE ID STANDARD

  file: src\components\admin\BulkActionToolbar.tsx
  function: src\components\admin\BulkActionToolbar.tsx::BulkActionToolbar

---

## DISA AKTARILANLAR (EXPORTS)
  export: BulkActionToolbar

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-400/80`, `bg-emerald-500/80`, `bg-gray-400/80`, `bg-gray-50`, `bg-primary-navy`, `bg-red-500/80`, `bg-white`, `bg-white/20`, `bg-yellow-500/80`, `border-gray-200`, `border-primary-navy`, `hover:bg-blue-400`, `hover:bg-emerald-500`, `hover:bg-gray-400`, `hover:bg-red-500`
- **Layout:** `absolute`, `bg-yellow-500/80`, `bottom-4`, `bottom-full`, `fixed`, `flex`, `flex-1`, `flex-wrap`, `gap-2`, `gap-3`, `h-6`, `h-8`, `hover:bg-yellow-500`, `items-center`, `justify-center`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `!py-2`, `!text-xs`, `${adminButtonPrimaryClass`, `${priceMode`, `:`, `===`, `animate-slide-up`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `font-bold`, `font-medium`, `font-semibold`, `mb-2`