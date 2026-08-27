---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminCouponsPage.tsx
skeleton_hash: 6d57f8d3c8d3cf9a
entity_hashes:
  func:AdminCouponsPage: e1c124663ca9483b
  overview: 2094a307cb4d0099
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:11:39Z
---

## Genel Bakış
AdminCouponsPage modülü, yönetici panelinde kupon yönetimi sayfasını sunan React bileşenidir. Kuponların veritabanı formatından arayüz formatına dönüştürülmesi, kullanıcı tanımlı kriterlere göre filtrelenmesi, yeni kupon kaydedilmesi ve aktiflik durumlarının değiştirilmesi gibi temel kupon yaşam döngüsü operasyonlarını tek bir sayfa bileşeni altında birleştirir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kupon yönetimi arayüzünün ana yapısını, state yönetimini, form elemanlarını ve kullanıcı etkileşim akışlarını orkestre eden merkezi React bileşenidir. Veri dönüştürme, filtreleme ve API etkileşimleri dahil tüm kupon yaşam döngüsü operasyonlarını bu bileşen içinde gerçekleştirir.
- AdminCouponsPage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `AdminCouponsPage` fonksiyonunun gövdesi veri setinde yer almamaktadır. Yalnızca fonksiyon imzası (`def AdminCouponsPage() -> React.FC`) ve modül sabitleri (boş) mevcuttur. İmzada parametre veya default değer bulunmadığından, fonksiyon gövdesi olmadan mimari varsayım üretilemez.

---

## FONKSİYON DETAYLARI

### AdminCouponsPage
**Ne yapar**: Kupon yönetimi için bir React sayfası bileşenidir. Kupon listeleme, filtreleme ve yönetme işlemlerinin yapıldığı ana sayfayı render eder.
**Nasıl yapar**: Bileşen, sayfa yapısını `Suspense` ile sararak asenkron yüklemeleri (veri çekme işlemleri) yönetir. Sayfa başlığını ve `CouponsTableBody` bileşenini içeren bir düzen (layout) oluşturur. Veri ve URL durumu (state) yönetimi tamamen `useAdminTable` hook'u ve `CouponsTableBody` bileşeni tarafından yürütülür. Sayfa, URL arama parametrelerini (`useSearchParams`) kullanırken CLAUDE.md'deki Kural 5 / K2 gereği `<Suspense>` sarıcı içinde yer alır; bu, sayfanın asenkron veri getirme işlemleri yüklenirken kullanıcıya bir yükleme durumu göstermesini sağlar.
**Parametreler**:
- (Parametre yok)
**Dönüş**: `React.FC` — Fonksiyonel bir React bileşeni. Doğrudan bir JSX yapısı (sayfa düzeni) döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./CouponsTableBody::CouponsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminCouponsPage.tsx::AdminCouponsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.titles.coupons')` ve `t('admin.coupons.subtitle')` çağrılarıyla sayfa başlığı ve alt başlık metinlerini lokalize eder
- **Dönüş**: JSX elementi — `className="space-y-6 pb-20"` ile stillenmiş bir `<div>` kapsayıcısı; içinde `AdminPageHeader` bileşeni (`title` ve `description` prop'larıyla) ve `Suspense` ile sarılmış `CouponsTableBody` bileşeni (fallback olarak `AdminSkeleton` kullanır, `variant="table"`, `count={8}`, `rows={6}` prop'larıyla) bulunur

---

## NODE ID STANDARD

  file: src\views\admin\AdminCouponsPage.tsx
  function: src\views\admin\AdminCouponsPage.tsx::AdminCouponsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminCouponsPage

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