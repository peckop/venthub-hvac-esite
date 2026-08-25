---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInvoicesPage.tsx
skeleton_hash: 46a81d128aeb705d
entity_hashes:
  func:AdminInvoicesPage: c0f0396efd933c45
  overview: e42bbd9fcb9329a9
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-25T08:45:20Z
---

## Genel Bakış
Bu modül, admin panelindeki fatura yönetim sayfasını temsil eden bir React bileşenidir. Kullanıcıya fatura listeleme, görüntüleme ve yönetim işlemlerini sunan sayfa düzeyinde bir bileşendir. Modül, admin yetkisine sahip kullanıcıların fatura verilerine erişimini sağlayan bir arayüz katmanı olarak görev yapar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Admin panelinin fatura yönetim ekranını oluşturan ana sayfa bileşenidir. Fatura ile ilgili verilerin görüntülenmesi ve kullanıcı etkileşimlerinin yönetilmesinden sorumludur.
- AdminInvoicesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, yalnızca `AdminInvoicesPage` imzası (parametresiz, `React.FC` döndüren) mevcuttur. Gövdeden çıkarılabilecek koşul, eşik değeri veya domain kuralı bulunmamaktadır.

---

## FONKSİYON DETAYLARI

### AdminInvoicesPage
**Ne yapar**: Fatura defteri ekranını oluşturan React bileşenidir (T132-VH). Köprü döneminde fatura entegratör panelinde elle kesilmesi gereken faturaların yönetimini sağlayan bir arayüz sunar. Bu ekran, yasal uyumluluk standardı (`legal-compliance-standard.md §2.3`) kapsamında tanımlanan prosedürün 1. ve 5. adımlarının kullanıcıya gösterildiği yüzeydir.

**Nasıl yapar**: Bileşen, iki temel adımın gerçekleştirilmesini destekler: (1) hangi ödenmiş siparişin faturasının eksik olduğunun tespiti ve listelenmesi, (5) kesilen faturanın kimliğinin fatura defterine işlenmesi. Docstring kesilmiş durumda olduğundan ("Kesim işi b..."), kesim adımının nasıl yürütüldüğüne dair ek bilgi kaynakta mevcut değildir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almamaktadır. `React.FC` dönüş tipiyle tanımlanmış, parametresiz bir bileşendir.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür. Bu bileşen, fatura defteri ekranının tamamını render eden JSX ağacını içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./AdminInvoicesTableBody::AdminInvoicesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminInvoicesPage.tsx::AdminInvoicesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.invoices.title')` ve `t('admin.invoices.subtitle')` çağrılarıyla sayfa başlığı ve açıklamasının metinlerini almak için kullanılır
- **Dönüş**: JSX elementi — `className="space-y-6 pb-20"` olan bir `<div>` kapsayıcısı içinde `<AdminPageHeader>` (title ve description prop'ları ile) ve `<Suspense>` (fallback olarak `variant="table" count={6} rows={6}` prop'lu `<AdminSkeleton />` ile) içinde `<AdminInvoicesTableBody />` bileşeni render edilir

---

## NODE ID STANDARD

  file: src\views\admin\AdminInvoicesPage.tsx
  function: src\views\admin\AdminInvoicesPage.tsx::AdminInvoicesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInvoicesPage

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