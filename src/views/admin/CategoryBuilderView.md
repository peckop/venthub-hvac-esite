---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx
skeleton_hash: d3e8a3a8b724f413
entity_hashes:
  func:CategoryBuilderView: c538d4ad7085f51d
  func:handleSave: f8b5a865424c16c7
  overview: 146d3fa220073c3c
  style_tokens: 745d0461670ee6bd
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC admin panelinde kategori yapısının görsel olarak oluşturulmasını ve düzenlenmesini sağlayan bir React görünüm bileşenidir. Mevcut bir kategoriyi yeniden yapılandırma veya sıfırdan yeni bir kategori hiyerarşisi tasarlama süreçlerini tek bir bileşen üzerinden yönetir.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Kullanıcıya kategori verilerini düzenleyebileceği bir arayüz sunar. `categoryId` prop değerine bağlı olarak yeni kategori oluşturma veya mevcut kategoriyi düzenleme modunda çalışır.
- CategoryBuilderView

### Veri Kaydetme İşleyicisi
Formda düzenlenen kategori yapısının sunucuya gönderilmesini ve kalıcı hale getirilmesini koordine eder.
- handleSave

---

## AXIOMS – Mimari Varsayımlar

Bu modül, fonksiyon imzalarından çıkarılabilecek minimal mimari varsayımlar içermektedir. Detaylı iş mantığı uygulama gövdesinde tanımlıdır.

---

## FONKSİYON DETAYLARI

### CategoryBuilderView
**Ne yapar**: VentHub HVAC projesinin admin panelinde kategori oluşturma ve düzenleme işlemlerini sunan React bileşenidir. Sıfırdan yeni kategori ekleme veya var olan bir kategoriyi güncelleme işlemleri için gerekli kullanıcı arayüzünü ekrana render eder.
**Nasıl yapar**: Kendisine prop olarak iletilen categoryId değerini temel alarak çalışma modunu belirler. Eğer categoryId değeri mevcutsa ilgili kategorinin verilerini yükleyerek düzenleme modunu aktif eder, kategoriId yoksa sıfırdan kategori oluşturma modunda boş form arayüzünü hazırlar. React component mimarisi üzerinden tüm form alanları ve aksiyon butonlarını bir araya getirerek admin kullanıcısının kullanımına sunar.
**Parametreler**:
- name: categoryId, type: string | number | undefined — Düzenlenecek mevcut kategorinin sistemdeki benzersiz kimlik değeridir. Eğer bu değer tanımsızsa bileşen otomatik olarak yeni kategori oluşturma modunda çalışır.
**Dönüş**: React.FC<CategoryBuilderViewProps> tipinde geçerli bir React bileşeni döndürür. Bu bileşen admin paneli içerisinde kategori işlemleri için tüm gerekli arayüz öğelerini barındırır.

### handleSave
**Ne yapar**: Kategori oluşturma veya düzenleme formunda kaydetme aksiyonu tetiklendiğinde çalışan, kullanıcı girdilerini işleyerek veritabanına kaydedilmesini sağlayan yardımcı işlevdir. Yeni kategori ekleme veya mevcut kategori güncelleme işlemlerinin iş akışını yönetir.
**Nasıl yapar**: Tanımlandığı CategoryBuilderView bileşeninin içindeki form girdilerini ve categoryId prop değerini kullanarak işlem adımlarını yürütür. Önce kullanıcı tarafından girilen verilerin doğruluğunu kontrol eder, hatalı veya eksik giriş varsa kullanıcıya bilgilendirme sunar. Doğrulama başarılı olursa ilgili backend API'sine istek göndererek verilerin kalıcı olarak kaydedilmesini sağlar.
**Parametreler**: Harici olarak herhangi bir parametre almaz, yalnızca ait olduğu CategoryBuilderView bileşeninin içindeki state ve prop değerlerini kullanır.
**Dönüş**: void tipindedir, herhangi bir değer döndürmez, yalnızca kaydetme iş akışının adımlarını tetikler ve yürütür.

---

## INTERFACES

### CategoryBuilderViewProps
- `categoryId: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryBuilderView.tsx::CategoryBuilderView
- **params**: `{ categoryId }` — Kategori ID'si, URL'den gelen prop
- **ic_degiskenler**:
  - `router` — Next.js router instance, sayfa navigasyonu için
  - `category` — `DbCategory | null`, yüklenen kategori verisi (ad, slug, description vb.)
  - `setCategory` — category state setter fonksiyonu
  - `blocks` — `AuthorityBlock[] | null`, Authority Builder için blok dizisi
  - `setBlocks` — blocks state setter fonksiyonu
  - `loading` — `boolean`, yükleme durumu flag'i
  - `setLoading` — loading state setter
  - `saving` — `boolean`, kaydetme durumu flag'i
  - `setSaving` — saving state setter
  - `previewMode` — `'desktop' | 'mobile'`, önizleme cihaz modu
  - `setPreviewMode` — previewMode state setter
  - `showPreview` — `boolean`, önizleme paneli görünürlüğü
  - `setShowPreview` — showPreview state setter
- **Dönüş**: React JSX elementi (admin paneli layout)

### [N2_NASIL] AST Pointer: CategoryBuilderView.tsx::load
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `data` — Supabase sorgu sonucu, `categories` tablosundan gelen satır
  - `error` — Supabase sorgu hatası (varsa)
  - `cat` — `DbCategory` tipine cast edilmiş data nesnesi
  - `initialBlocks` — `AuthorityBlock[]`, kategorinin `authority_content` alanından gelen blok dizisi
  - `legacyBlocks` — `AuthorityBlock[]`, eski format verileri yeni blok formatına dönüştürmek için geçici dizi
  - `meta` — `CategoryMetadata | null`, kategorinin metadata alanı (metric1, metric2 için)
  - `rows` — `SpecsBlock['content']['rows']`, teknik özet satırları (label-value çiftleri)
- **Dönüş**: void (asenkron, state günceller, return yok)

### [N3_NASIL] AST Pointer: CategoryBuilderView.tsx::handleSave
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `error` — Supabase güncelleme hatası (varsa)
- **Dönüş**: void (asenkron, state günceller, return yok)

---

## NODE ID STANDARD

  file: src\views\admin\CategoryBuilderView.tsx
  function: src\views\admin\CategoryBuilderView.tsx::CategoryBuilderView
  function: src\views\admin\CategoryBuilderView.tsx::handleSave

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryBuilderView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-cyan-500`, `bg-emerald-500`, `bg-emerald-500/10`, `bg-slate-950`, `bg-surface-darkest`, `bg-surface-deep`, `bg-white`, `bg-white/10`, `bg-white/2`, `bg-white/5`, `border-4`, `border-8`, `border-b`, `border-cyan-400/20`
- **Layout:** `custom-scrollbar`, `custom-scrollbar-light`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `h-1.5`, `h-12`, `h-14`, `h-16`, `h-568px`, `h-full`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${previewMode`, `${showPreview`, `:`, `===`, `active:scale-95`, `animate-in`, `animate-pulse`, `animate-spin`, `border`, `desktop`, `disabled:opacity-50`, `duration-500`, `font-black`, `font-bold`, `font-sans`