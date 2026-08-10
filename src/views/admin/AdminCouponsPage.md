---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminCouponsPage.tsx
skeleton_hash: df403a75acdea28d
entity_hashes:
  func:AdminCouponsPage: e1c124663ca9483b
  overview: 4ef12aeba405f39c
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-19T20:48:41Z
---

## Genel Bakış
AdminCouponsPage modülü, yönetici panelinde kupon yönetimi sayfasını sunan React bileşenidir. Kuponların veritabanı formatından arayüz formatına dönüştürülmesi, kullanıcı tanımlı kriterlere göre filtrelenmesi, yeni kupon kaydedilmesi ve aktiflik durumlarının değiştirilmesi gibi temel kupon yaşam döngüsü operasyonlarını tek bir sayfa bileşeni altında birleştirir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kupon yönetimi arayüzünün ana yapısını, state yönetimini, form elemanlarını ve kullanıcı etkileşim akışlarını orkestre eden merkezi React bileşenidir.
- AdminCouponsPage

### Veri Dönüştürme ve Doğrulama
Veritabanından gelen kupon verilerini arayüzde gösterilebilir forma dönüştürür ve kupon türlerinin sistem tarafından izin verilen değerler arasında olup olmadığını doğrular.
- dbToUi, isAllowedCouponType

### Filtreleme
Kullanıcı tarafından seçilen kriterlere göre kupon listesini dinamik olarak filtreleyerek görüntülenecek alt kümesi belirler.
- filtered

### API Etkileşimleri
Sunucu tarafında yeni kupon kaydetme ve mevcut kuponların aktif/pasif durumunu değiştirme gibi kalıcı veri değişiklikleri için asenkron istekleri yönetir.
- saveCoupon, toggleActive

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./CouponsTableBody::CouponsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminCouponsPage.tsx::AdminCouponsPage
- **params**: () — parametre almaz
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('admin.titles.coupons')` ve `t('admin.coupons.subtitle')` çağrılarıyla anahtar kelime tabanlı lokalize metin döndürür
- **JSX Icindeki Kullanimlar**:
  - `adminSectionTitleClass` — `adminUi` modülünden import edilen CSS class string'i; `<h1>` başlık elemanına uygulanır
  - `adminSubtitleClass` — `adminUi` modülünden import edilen CSS class string'i; `<p>` alt başlık elemanına uygulanır
  - `AdminSkeleton` — Suspense fallback'inde `variant="table" count={8} rows={6}` propslarıyla kullanılır; yükleme durumunda iskelet tablo gösterir
  - `CouponsTableBody` — Suspense içine sarılı ana tablo gövdesi bileşeni; coupon verilerini yükler ve tablolar
- **Dönüş**: `JSX.Element` — Admin Coupons sayfasının tamamını oluşturan React bileşeni; başlık, alt başlık ve Suspense ile sarılmış CouponsTableBody içeren bir `<div>` döndürür

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