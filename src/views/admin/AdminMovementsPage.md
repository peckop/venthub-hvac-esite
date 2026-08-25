---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\AdminMovementsPage.tsx
skeleton_hash: a5583dcc150ffea6
entity_hashes:
  func:AdminMovementsPage: 1f83a4be333ac82c
  overview: f79fd144fc0bf6c1
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-25T07:29:51Z
---

## Genel Bakış

Bu modül, admin panelindeki hareketler (movements) sayfasını temsil eden bir React bileşenidir. `src/views/admin` dizininde yer alması, uygulamanın yönetici arayüzüne ait bir görünüm katmanı olduğunu gösterir. Modül tek bir ana bileşenden oluşur ve sayfa düzeyinde bir sorumluluk üstlenir.

## Fonksiyon Grupları

### Sayfa Bileşeni

Ana sayfa bileşeni olarak hareketler ekranını render eder. Admin kullanıcılarına yönelik hareket verilerinin görüntülendiği veya yönetildiği arayüzü sunar.

- AdminMovementsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modülün fonksiyon gövdesi verilmemiştir. Yalnızca `AdminMovementsPage` fonksiyonunun imzası (`() -> React.FC`) ve prop almadığı bilgisi mevcuttur. Fonksiyon gövdesi olmadan, bileşenin doğru çalışması için hangi koşulların gerekli olduğunu belirlemek mümkün değildir.

---

## FONKSİYON DETAYLARI

### AdminMovementsPage
**Ne yapar**: Envanter hareketlerini (`inventory_movements`) görüntülemek için bir yönetici sayfası oluşturur. DataTableKit bileşenine göç edilmiş sunucu tarafı (server-mode) modunda çalışır. Sayfa salt okunur (READ-ONLY) olarak tasarlanmıştır; mutasyon, seçim veya toplu işlem (bulk) desteği yoktur.

**Nasıl yapar**: Sayfa yapısı bir başlık ve `Suspense` bileşeninden oluşur. Arama, sıralama ve kategori filtresi işlemleri, sunucu tarafında embedded inner-join ile çözümlenir; istemci tarafında filtreleme yapılmaz. Veri yönetimi, URL senkronizasyonu ve filtre durumu `MovementsTableBody` bileşeni tarafından `useAdminTable` kancası aracılığıyla taşınır ve yönetilir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React fonksiyonel bileşen döndürür. Bu bileşen, envanter hareketlerinin listelendiği yönetici sayfasını render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./MovementsTableBody::MovementsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminMovementsPage.tsx::AdminMovementsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.titles.movements')` ile sayfa başlığı, `t('admin.movements.subtitle')` ile alt başlık metinlerini çözmek için kullanılır
- **Dönüş**: JSX elementi — dış sarmalayıcı `div` (className `"space-y-6 pb-20"`) içinde `AdminPageHeader` bileşeni (title ve description prop'ları ile) ve `Suspense` ile sarmalanmış `MovementsTableBody` bileşeni döner; `Suspense` yüklenme sırasında `AdminSkeleton` (variant `"table"`, count `5`, rows `8`) fallback gösterir

---

## NODE ID STANDARD

  file: AdminMovementsPage.tsx
  function: AdminMovementsPage.tsx::AdminMovementsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminMovementsPage

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