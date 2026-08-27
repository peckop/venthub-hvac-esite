---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminPricingSettingsPage.tsx
skeleton_hash: 6f1e3f69a5ed165e
entity_hashes:
  func:AdminPricingSettingsPage: 7b17b7472ba422a3
  func:isPricingCurrencyArray: f3e407c6f7c7c97c
  func:openModal: 56d5f744f446dcc1
  overview: 4724b5b6bdd27e03
  style_tokens: 00041ff73bf3ebb3
generated_at: 2026-08-27T07:20:44Z
---

## Genel Bakış
Bu modül, yönetici panelindeki fiyatlandırma ayarlarını görüntülemek ve düzenlemek için kullanılan bir sayfa bileşenidir. Para birimi verilerinin doğrulanması ve kullanıcı etkileşimi için modal açılması gibi temel işlevleri içerir.

## Fonksiyon Grupları

### Tip Doğrulama
Verilen değerin geçerli bir fiyatlandırma para birimi dizisi olup olmadığını kontrol eden yardımcı fonksiyonu içerir. Bu fonksiyon, veri yükleme veya kullanıcı girdisi sırasında veri bütünlüğünü sağlamak amacıyla kullanılır.
- isPricingCurrencyArray

### Bileşen ve Etkileşim
Ana sayfa bileşenini ve kullanıcı arabirimi etkileşimlerini yönetir. Sayfa bileşeni, fiyatlandırma ayarlarını görüntülerken; modal açma fonksiyonu, düzenleme veya detay işlemleri için kullanıcıya bir pencere sunar.
- AdminPricingSettingsPage, openModal

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### isPricingCurrencyArray
**Ne yapar**: Verilen değerin fiyatlandırma para birimi dizisi olup olmadığını kontrol eden bir doğrulama fonksiyonudur. Fonksiyon adından, bir type guard (tip koruyucu) işlevi gördüğü anlaşılmaktadır.
**Nasıl yapar**: Kaynak kodda docstring bulunmadığından iç mantığı bilinmiyor. `unknown` tipinde bir değer alarak, bu değerin beklenen fiyatlandırma para birimi yapısına uygun olup olmadığını denetlediği düşünülmektedir; ancak kesin doğrulama kriterleri kaynakta belirtilmemiştir.
**Parametreler**:
- value: unknown — Doğrulanacak değer. Herhangi bir tipte olabilir; fonksiyon bu değerin geçerli bir fiyatlandırma para birimi dizisi olup olmadığını sınar.
**Dönüş**: Kaynakta dönüş tipi belirtilmemiştir. Bilinmiyor.

### AdminPricingSettingsPage
**Ne yapar**: Admin panelindeki fiyatlandırma ayarları sayfasını oluşturan bir React bileşenidir. Dosya yolu (`src/views/admin/AdminPricingSettingsPage.tsx`) bu bileşenin admin görünüm katmanında yer aldığını göstermektedir.
**Nasıl yapar**: Kaynak kodda docstring bulunmadığından bileşenin iç yapısı ve hangi alt bileşenleri, durum yönetimini veya yan etkileri kullandığı bilinmiyor. `React.FC` tipinde bir fonksiyonel bileşen olarak tanımlanmıştır; bu, bir React elementi döndüren fonksiyonel bileşen anlamına gelir.
**Parametreler**:
- (Parametre almıyor) — Fonksiyon tanımında herhangi bir parametre belirtilmemiştir.
**Dönüş**: `React.FC` — React fonksiyonel bileşeni. JSX elementi döndürür.

### openModal
**Ne yapar**: Fiyatlandırma ayarları sayfasında bir modal (açılır pencere/diyalog) açma işlemini gerçekleştiren fonksiyondur. Fonksiyon adı, kullanıcı etkileşimiyle tetiklenen bir modal gösterme eylemini ifade eder.
**Nasıl yapar**: Kaynak kodda docstring bulunmadığından hangi modal'ı açtığı, modal'ın içeriğinin ne olduğu ve nasıl bir durum değişikliği tetiklediği bilinmiyor. `AdminPricingSettingsPage` bileşeni içinde tanımlanmış bir yardımcı fonksiyon olduğu anlaşılmaktadır.
**Parametreler**:
- (Parametre almıyor) — Fonksiyon tanımında herhangi bir parametre belirtilmemiştir.
**Dönüş**: Kaynakta dönüş tipi belirtilmemiştir. Bilinmiyor.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: @/components/admin/pricing/CurrencyRatesCard::CurrencyRatesCard
- import: @/hooks/useRole::useRole
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::DollarSign
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminPricingSettingsPage.tsx::isPricingCurrencyArray
- **params**: `value: unknown`
- **ic_degiskenler**: (yok — doğrudan parametre üzerinde işlem yapılır)
- **Dönüş**: `value is PricingSettingsValues['enabled_currencies']` — TypeScript type guard; `value` dizisi `PricingSettingsValues` tipindeki `enabled_currencies` alanına uygunsa `true` döner. Kontrol: `Array.isArray(value)` ve `value.length > 0` ve her eleman `'TRY'` veya `'EUR'` veya `'USD'` olmalı.

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    AdminPricingSettingsPage_tsx__AdminPricingSettingsPage["AdminPricingSettingsPage"]
    AdminPricingSettingsPage_tsx__isPricingCurrencyArray["isPricingCurrencyArray"]
    AdminPricingSettingsPage_tsx__openModal["openModal"]
    AdminPricingSettingsPage_tsx__AdminPricingSettingsPage --> AdminPricingSettingsPage_tsx__isPricingCurrencyArray
```

## NODE ID STANDARD

  file: src\views\admin\AdminPricingSettingsPage.tsx
  function: src\views\admin\AdminPricingSettingsPage.tsx::isPricingCurrencyArray
  function: src\views\admin\AdminPricingSettingsPage.tsx::AdminPricingSettingsPage
  function: src\views\admin\AdminPricingSettingsPage.tsx::openModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPricingSettingsPage
  export: isPricingCurrencyArray

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger-weak`, `border-admin-accent/30`, `border-admin-border`, `border-admin-danger/30`, `border-b`, `border-t`, `hover:bg-admin-accent`, `hover:text-admin-fg-subtle`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-lg`, `text-sm`
- **Layout:** `block`, `flex`, `flex-col`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `lg:grid-cols-2`, `lg:p-10`, `md:flex-row`, `md:items-end`
- **Varyant/Responsive:** `disabled:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminCardClass`, `animate-in`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-300`, `duration-700`, `fade-in`, `font-bold`, `font-semibold`, `group`, `pb-20`, `pb-4`, `pt-6`, `py-3`