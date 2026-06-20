---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\error-groups\page.tsx
skeleton_hash: faa4b355afc8b0b6
entity_hashes:
  func:Loading: 657ee72781ec51d8
  func:Page: b47a5eb18beb6937
  overview: 5b1a16aab3aba293
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-19T20:46:38Z
---

## Genel Bakış
Yönetim panelindeki "Hata Grupları" sayfasını tanımlayan Next.js kök bileşen modülüdür. Dinamik import mekanizmasıyla `AdminErrorGroupsPage` bileşenini yükler ve sayfa hazırlanırken gösterilecek bir `Loading` skeleton bileşeni sağlar.

## Fonksiyon Grupları
### Sayfa Kök Bileşeni
Ana sayfa bileşenini dışa aktarır ve `AdminErrorGroupsPage` arayüzünü dinamik olarak yükleyerek hata gruplarının yönetildiği yönetici ekranını sunar.
- Page

### Yükleniyor Durumu
Sayfa ve ilgili bileşenler yüklenirken kullanıcıya gösterilecek geçici arayüz skeleton'ını tanımlar.
- Loading

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Loading
**Ne yapar**: Uygulamada verilerin yüklendiği veya bir işlemin devam ettiği durumlarda kullanıcıya görsel bir geri bildirim (yükleniyor animasyonu vb.) sağlamak için kullanılan bir React bileşenidir.
**Nasıl yapar**: Bu bir React fonksiyonel bileşenidir. Doğrudan JSX içeriği (bir loading spinner, animasyon veya metin gibi) döndürerek tarayıcıda render edilir. Fonksiyonun içinde herhangi bir durum (state) yönetimi veya yan etki (effect) bulunmamaktadır, saf bir bileşendir.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `JSX.Element` veya `React.ReactElement` tipinde bir React bileşeni döndürür.

### Page
**Ne yapar**: `Page` fonksiyonu, yönetici arayüzünde hata gruplarını görüntülemek için kullanılan `AdminErrorGroupsPage` bileşenini döndürür.  
**Nasıl yapar**: Fonksiyon, React bileşeni olarak tanımlanmış olup, JSX içinde `<AdminErrorGroupsPage />` etiketini render eder. Bu sayede sayfa, hata gruplarının yönetim ekranını sunar.  
**Parametreler**:
- *None*  
**Dönüş**: `<AdminErrorGroupsPage />` bileşeni (React element)

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **AdminErrorGroupsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminErrorGroupsPage'),
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/error-groups/page.tsx::Loading
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan destructure edilen çeviri fonksiyonu; `t('admin.common.loading')` çağrısıyla loading metnini çevirir
- **Dönüş**: JSX — `div` elementi (className: `p-8 text-center text-slate-400 animate-pulse`), içinde `t('admin.common.loading')` sonucunu render eder

### [N2_NASIL] AST Pointer: src/app/admin/error-groups/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<AdminErrorGroupsPage />` bileşenini döndürür

---

## NODE ID STANDARD

  file: src\app\admin\error-groups\page.tsx
  function: src\app\admin\error-groups\page.tsx::Loading
  function: src\app\admin\error-groups\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Loading
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`