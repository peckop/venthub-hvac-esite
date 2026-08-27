---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminPricingRulesPage.tsx
skeleton_hash: 57846c9846dcd9f7
entity_hashes:
  func:AdminPricingRulesPage: c44326a0069563ae
  overview: 349955979a3fd56e
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:20:43Z
---

## Genel Bakış
Bu modül, HVAC servis platformunun yönetici panelinde fiyatlandırma kurallarının yönetimini sağlayan sayfa bileşenini içerir. Tek bir fonksiyonel bileşenden oluşan modül, fiyatlandırma politikalarının görüntülenmesi ve düzenlenmesi için kullanıcı arayüzü sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Tek bileşenli bir sayfa yapısına sahiptir ve fiyatlandırma kuralları yönetimini üstlenir. Bileşen, veri yüklenirken bir yedek içerik göstermek için Suspense kullanır.
- AdminPricingRulesPage

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
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./PricingRulesTableBody::PricingRulesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminPricingRulesPage.tsx::AdminPricingRulesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.pricing.rules.title')` ve `t('admin.pricing.rules.subtitle')` çağrılarıyla sayfa başlığı ve açıklaması için metin üretmek amacıyla kullanılır
- **Dönüş**: JSX elementi — `div.space-y-6.pb-20` kapsayıcısı içinde `AdminPageHeader` bileşeni (title ve description prop'ları ile) ve `Suspense` ile sarılmış `PricingRulesTableBody` bileşeni döndürülür; `Suspense` fallback olarak `AdminSkeleton` (variant="table", count={8}, rows={6}) kullanır

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