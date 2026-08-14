---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminPricingRulesPage.tsx
skeleton_hash: 1193a447d8f1fa22
entity_hashes:
  func:AdminPricingRulesPage: c44326a0069563ae
  overview: 20aa255e4d5d76e9
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-14T09:18:03Z
---

## Genel Bakış

`AdminPricingRulesPage` modülü, HVAC servis platformunun yönetici panelinde fiyatlandırma kurallarının yönetildiği sayfa bileşenidir. Tek bir React fonksiyonel bileşeninden oluşan bu modül, fiyatlandırma politikalarının görüntülenmesi, eklenmesi ve düzenlenmesi için arayüz sağlar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Tek bileşenli bir sayfa yapısına sahiptir ve fiyatlandırma kuralları yönetimini üstlenir.
- `AdminPricingRulesPage` — Yönetici panelinde fiyatlandırma kurallarını listeleme ve yönetim işlemlerini gerçekleştiren ana sayfa bileşeni

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminPricingRulesPage
**Ne yapar**: Bu fonksiyon, yönetici panelinde marj kurallarının yönetimi için bir sayfa bileşeni oluşturur. Sayfa, başlık ve Suspense ile sarılmış bir içeriğe sahiptir.

**Nasıl yapar**: Fonksiyon, `PricingRulesTableBody` bileşenini (`useAdminTable` kancasını kullanarak) ve `useSearchParams` kancasını Suspense içinde sararak SSR zehirlenmesini önler. Suspense, veri yüklenirken bir yedek içeriğin gösterilmesini sağlar.

**Parametreler**: 
- Parametre almaz.

**Dönüş**: 
- `React.FC` (React işlevsel bileşeni) döndürür. Bileşen, marj kurallarını yönetmek için gerekli arayüzü sağlar.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./PricingRulesTableBody::PricingRulesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminPricingRulesPage.tsx::AdminPricingRulesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan elde edilen çeviri fonksiyonu, UI metinlerini uluslararası dilde göstermek için kullanılır
- **Dönüş**: React.FC (JSX element döndürür)

---

## NODE ID STANDARD

  file: src\views\admin\AdminPricingRulesPage.tsx
  function: src\views\admin\AdminPricingRulesPage.tsx::AdminPricingRulesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPricingRulesPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`