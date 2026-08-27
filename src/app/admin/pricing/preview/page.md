---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\app\admin\pricing\preview\page.tsx
skeleton_hash: f5e3c4e406a89578
entity_hashes:
  func:Page: 38a14b07f492add8
  overview: f2c812d7ee2b06e8
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T06:55:15Z
---

## Genel Bakış
Bu modül, yönetici panelindeki fiyatlandırma bölümünde yer alan önizleme sayfasını tanımlar. Next.js'in dosya tabanlı yönlendirme yapısı gereği `admin/pricing/preview` yoluna karşılık gelen sayfa bileşenini dışa aktarır. Modül yalnızca tek bir bileşenden oluşur ve fiyatlandırma verilerinin yönetici tarafından önizlenmesini sağlar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Fiyatlandırma önizleme sayfasının kullanıcı arayüzünü oluşturur ve ilgili alt bileşenleri bir araya getirerek sayfanın tamamını render eder.
- Page

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, admin fiyat önizleme sayfasının ana bileşenidir. Next.js'in dosya tabanlı yönlendirme sistemi tarafından otomatik olarak bir sayfa bileşeni olarak tanınır ve ilgili rota ziyaret edildiğinde render edilir.

**Nasıl yapar**: Fonksiyon, herhangi bir ek mantık veya durum yönetimi içermez. Doğrudan `AdminPricePreviewPage` bileşenini döndüren bir sarmalayıcı (wrapper) olarak çalışır. Sayfa seviyesindeki bu soyutlama, Next.js'in dosya tabanlı rota yapısının gerektirdiği dışa aktarım kuralını karşılar ve asıl sayfa mantığını `AdminPricePreviewPage` bileşenine devreder.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `JSX.Element` — `AdminPricePreviewPage` bileşeninin render çıktısını döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/admin/AdminPricePreviewPage::AdminPricePreviewPage

---

## SABİTLER
- **metadata** (object) — `{
  title: 'Fiyat Önizleme | VentHub HVAC',
  description: 'VentHub HVAC fi...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/pricing/preview/page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok — fonksiyon gövdesinde hiçbir değişken tanımlanmamış, doğrudan JSX dönüşü yapılır
- **Dönüş**: `<AdminPricePreviewPage />` — `../../../../views/admin/AdminPricePreviewPage` yolundan import edilen `AdminPricePreviewPage` bileşeninin render edilmiş JSX çıktısı

---

## NODE ID STANDARD

  file: src\app\admin\pricing\preview\page.tsx
  function: src\app\admin\pricing\preview\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: metadata

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
- **Yardımcı Sınıflar:** (yok)