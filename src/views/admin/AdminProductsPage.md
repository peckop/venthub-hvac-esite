---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\AdminProductsPage.tsx
skeleton_hash: 932e1a5d4d27d29f
entity_hashes:
  func:AdminProductsPage: c722f6b673f81dbe
  overview: 20b1fe71a28f1bf8
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-25T07:29:54Z
---

## Genel Bakış
AdminProductsPage, admin panelindeki ürünler yönetim sayfasını temsil eden bir React fonksiyonel bileşenidir. Modül, tek bir bileşen fonksiyonundan oluşur ve ürün listeleme, düzenleme veya silme gibi admin işlemlerinin gerçekleştirildiği arayüzü sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Admin ürünler sayfasının ana bileşenini tanımlar. Bu bileşen, admin kullanıcıların ürün verilerini görüntülemesine ve yönetmesine olanak sağlayan kullanıcı arayüzünü render eder.
- AdminProductsPage

## Bağımlılıklar
Modül, React kütüphanesine bağlıdır (React.FC tipi kullanılmaktadır). Kaynakta başka iç veya dış bağımlılığa dair bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, yalnızca `AdminProductsPage` fonksiyon imzasından (`() -> React.FC`) modüle özgü bir çıkarım yapılamamaktadır. Mimari varsayımlar yalnızca fonksiyon gövdesinden üretilebilir.

---

## FONKSİYON DETAYLARI

### AdminProductsPage
**Ne yapar**: Ürünler yönetim sayfasını oluşturan React fonksiyon bileşenidir. Projedeki en karmaşık liste görünümüdür ve DataTableKit altyapısına göç edilmiş bir "thin-page" (ince sayfa) olarak tasarlanmıştır. Sayfa, ürün verilerinin görüntülenmesi, düzenlenmesi ve yönetilmesi için gerekli tüm arayüzü sunar.

**Nasıl yapar**: Sayfa kendisi minimal bir yapıdadır; başlık ve bir `Suspense` sınırı içerir. Veri getirme (fetch), hibrit tam metin arama (FTS) ve sorgu tabanlı arama, sıralama, filtreleme, satır içi düzenleme (inline-edit), satır genişletme (expand), toplu işlemler (bulk) ve 6 yazma kapısı gibi tüm karmaşık işlevsellik, `ProductsTableBody` bileşeni içerisine taşınmıştır. Bu bileşen `useAdminTable` kancasını kullanarak sunucu tarafı modunda (server-mode) çalışır. Sayfa ayrıca "Yeni Ürün" butonu, `ProductFormModal` bileşeni ve CSV ile ilgili bir özellik (docstring kesilmiş olduğundan tam işlevi belirsizdir) içerir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz. React fonksiyon bileşeni olarak tanımlanmış olup, props belirtilmemiştir.

**Dönüş**: `React.FC` — React fonksiyon bileşeni döndürür. Bu bileşen, ürünler yönetim sayfasının tamamını render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./ProductsTableBody::ProductsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminProductsPage.tsx::AdminProductsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.titles.products')` ve `t('admin.products.subtitle')` çağrılarında kullanılır
- **Dönüş**: JSX element — `div.space-y-6.pb-20` kapsayıcısı içinde `AdminPageHeader` ve `Suspense` ile sarılmış `ProductsTableBody` bileşenlerini döndürür. `Suspense` bileşeninin `fallback` prop'unda `AdminSkeleton` bileşeni `variant="table"`, `count={10}`, `rows={5}` özellikleriyle kullanılır.

---

## NODE ID STANDARD

  file: AdminProductsPage.tsx
  function: AdminProductsPage.tsx::AdminProductsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminProductsPage

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