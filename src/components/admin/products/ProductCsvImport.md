---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\products\ProductCsvImport.tsx
skeleton_hash: c0e5d32399c7f0b6
entity_hashes:
  func:ProductCsvImport: 2d3e91e9df88f214
  overview: 59646c8b18833a0c
  style_tokens: 3b8273019bfac780
generated_at: 2026-08-27T08:22:53Z
---

## Genel Bakış
ProductCsvImport, admin panelinde ürünlerin CSV dosyası aracılığıyla toplu olarak içe aktarılmasını sağlayan bir React bileşenidir. Bileşen, kategori listesini ve başarılı içe aktarma sonrası çağrılacak geri bildirim fonksiyonunu dışarıdan alır.

## Fonksiyon Grupları

### Ana Bileşen
Bileşen, CSV dosyasından ürün verilerini okuyup sisteme aktarma işlemini yönetir. Dışarıdan sağlanan kategori verilerini kullanarak içe aktarılan ürünlerin doğru kategorilere eşlenmesini ve işlem tamamlandığında `onSuccess` geri bildiriminin tetiklenmesini sağlar.
- ProductCsvImport

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon imzasından çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `categories` prop'u sağlanmazsa, bileşenin kategori ile ilgili işlemleri gerçekleştirilemez.

[Aksiyom 2]: Eğer `onSuccess` prop'u sağlanmazsa, başarılı CSV import işlemi sonrası bildirim yapılamaz.

[Aksiyom 3]: Eğer fonksiyon gövdesi mevcut değilse, bileşenin dahili davranışları belirlenemez.

---

## FONKSİYON DETAYLARI

### ProductCsvImport
**Ne yapar**: Admin panelinde ürün CSV dosyası içe aktarma işlemini yöneten React fonksiyonel bileşenidir. Kullanıcının bir CSV dosyası seçmesini sağlar, dosya içeriğini önizleme olarak gösterir, veri doğrulama (dry-run) yapar ve veritabanına toplu ürün kaydı gerçekleştirir. Bilinmeyen SKU'lar ve çözülemeyen kategoriler için kullanıcıdan onay alarak sessiz veri bozulmalarını önler.

**Nasıl yapar**: Bileşen, dört ana state yönetimi ve dört handler fonksiyonuyla çalışır. Dosya yükleme (`handleFileChange`) CSV'yi satır satır ayrıştırır ve ilk 10 satırı önizleme olarak gösterir. Kuru çalıştırma (`handleDryRun`) gerekli sütunların varlığını kontrol eder. Asıl içe aktarma (`handleImport`) satırları `hazirlaUrunSatirlari` fonksiyonuyla hazırlar, kategorisi çözülemeyen satırları reddeder, ardından veritabanında mevcut olmayan SKU'ları tespit eder ve kullanıcıya üç seçenek sunar: sadece mevcut ürünleri güncelle, yeni ürünler oluştur veya işlemi iptal et. Yazma işlemi (`writePayloads`) 100'er satırlık parçalar halinde `upsert` ile `sku` alanına göre çatışma çözümlemesi yaparak veritabanına yazar. Bildirimler `alert()` yerine inline olarak `role="status"` ve `aria-live="polite"` ile ekran okuyucuya duyurulur. Bilinmeyen SKU onayı `role="alertdialog"` ile sunulur ve butonlarda eylemler adıyla (Evet/Hayır değil) belirtilir.

**Parametreler**:
- categories: `Database['public']['Tables']['categories']['Row'][]` — Ürünlerin atanacağı kategorilerin listesi. `hazirlaUrunSatirlari` fonksiyonuna gönderilir ve CSV'deki kategori slug'larının veritabanında karşılığı olup olmadığını doğrulamak için kullanılır.
- onSuccess: `() => void` — İçe aktarma başarıyla tamamlandığında çağrılan geri çağırma fonksiyonu. Üst bileşenin listeyi yenilemesi gibi yan etkileri tetikler.

**Dönüş**: JSX elementi döndürür. Bileşen, gizli dosya input'u, yükleme butonu, bilinmeyen SKU onay dialogu, inline bildirim ve önizleme modalı olmak üzere beş ana UI parçası render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../../types/database.types::type { Database }
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/admin/csvProductMapping::hazirlaUrunSatirlari
- import: @/lib/admin/csvProductMapping::type KategoriSecenegi
- import: @/lib/data/csvImportGuard::splitByExistingSku
- import: @/lib/supabase/client::supabaseBrowserClient
- import: react::React

---

## INTERFACES

### ProductCsvImportProps
- `categories: KategoriSecenegi[]`
- `onSuccess: () => void`

---

## NODE ID STANDARD

  file: src\components\admin\products\ProductCsvImport.tsx
  function: src\components\admin\products\ProductCsvImport.tsx::ProductCsvImport

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductCsvImport

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger-weak`, `bg-admin-surface-2`, `border-admin-accent/30`, `border-admin-border`, `border-admin-danger/30`, `border-b`, `border-t`, `hover:bg-admin-surface-2`, `hover:text-admin-fg-subtle`, `hover:text-current`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-3`, `h-10`, `hidden`, `items-center`, `items-start`, `justify-between`, `justify-center`, `justify-end`, `max-h-90vh`, `max-w-4xl`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminButtonPrimaryClass`, `${adminButtonSecondaryClass`, `${adminCardClass`, `:`, `===`, `animate-in`, `border`, `divide-admin-border`, `divide-y`, `duration-200`, `error`, `fade-in`, `focus-visible:outline-none`, `focus-visible:ring-2`