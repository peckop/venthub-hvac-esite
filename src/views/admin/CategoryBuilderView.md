---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx
skeleton_hash: d0d925c567f6b49d
generated_at: 2026-05-23T22:38:28Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin admin panelinde kategori oluşturma ve düzenleme işlemlerini yöneten React görünüm bileşenidir. Gelen kategoriId parametresiyle hem yeni kategori ekleme hem de mevcut bir kategoriyi düzenleme senaryolarını destekler, kategori işlemleri için gerekli temel işlevleri barındırır.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Modülün temel React bileşeni olarak admin arayüzünde kategori oluşturma/düzenleme ekranını yükler, gelen kategoriId prop'u ile işlem akışını başlatır.
- CategoryBuilderView

### Kayıt İşleyici Fonksiyonu
Oluşturulan veya düzenlenen kategori bilgilerinin kalıcı olarak kaydedilmesi sürecini asenkron olarak yürütür, sunucu ile iletişimi yönetir.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
Bu admin paneline ait kategori yapılandırma görünümü modülünün doğru çalışması için gerekli giriş prop'larının, yetki mekanizmalarının ve arka plan entegrasyonlarının eksiksiz olarak sağlanması zorunludur.

[Aksiyom 1]: Eğer CategoryBuilderView bileşenine zorunlu giriş olarak tanımlanan categoryId prop'u sağlanmazsa, hem mevcut kategorinin düzenlenmesi hem de yeni kategorinin sistemde doğru tanımlanması işlemleri başarısız olur.
[Aksiyom 2]: Eğer handleSave() fonksiyonunu kullanan kullanıcının admin seviyesinde kategori oluşturma/güncelleme yetkisi yoksa, kayıt işlemi reddedilir ve yapılan tüm kategori değişiklikleri kalıcı olarak kaydedilemez.
[Aksiyom 3]: Eğer handleSave() fonksiyonunun veri göndermesi gereken arka plan servisleri/API uç noktaları erişilemez durumdaysa, kategori değişiklikleri kaydedilemez ve işlem başarısız olur.
[Aksiyom 4]: Eğer modülün bağlı olduğu React uygulama runtime ortamı sağlanmamışsa, CategoryBuilderView bileşeni hiçbir şekilde render edilemez ve admin panelinin kategori yönetimi ekranı kullanılamaz.

---

## FONKSIYON DETAYLARI

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx::CategoryBuilderView
- **params**: [categoryId] — Düzenlenecek kategorinin benzersiz veritabanı kimliği
- **ic_degiskenler**: 
  - `router` — Next.js yönlendirme hook'u ile sayfa gezinmesi işlemlerini yöneten nesne
  - `category` — DbCategory tipinde yüklenen kategori verisini tutan state, başlangıç değeri null
  - `setCategory` — category state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `blocks` — AuthorityBlock tipinde kategori içerik düzenleme bloklarını tutan state, başlangıç değeri null
  - `setBlocks` — blocks state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `loading` — Kategori verilerinin ilk yükleme durumunu tutan boolean state
  - `setLoading` — loading state değerini güncellemek için kullanılan state setter fonksiyonu
  - `saving` — Kategori değişikliklerinin kaydedilme durumunu tutan boolean state
  - `setSaving` — saving state değerini güncellemek için kullanılan state setter fonksiyonu
  - `previewMode` — Önizleme panelinin görünüm modunu (desktop/mobile) tutan string state, varsayılan 'desktop'
  - `setPreviewMode` — previewMode state değerini güncellemek için kullanılan state setter fonksiyonu
  - `showPreview` — Önizleme panelinin görünürlüğünü kontrol eden boolean state, varsayılan true
  - `setShowPreview` — showPreview state değerini güncellemek için kullanılan state setter fonksiyonu
  - `load` — Kategori verilerini Supabase'den çeken, eski verileri yeni blok yapısına dönüştüren useCallback ile sarmalanmış async fonksiyon
  - `supabase` — Veritabanı işlemleri için kullanılan Supabase istemcisi
  - `toast` — Kullanıcıya bildirim göstermek için kullanılan react-hot-toast kütüphane fonksiyonu
- **Dönüş**: Kategori düzenleme arayüzünü oluşturan React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx::handleSave
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `setSaving` — Kaydetme işleminin yük durumunu güncellemek için kullanılan state setter fonksiyonu
  - `supabase` — Veritabanı güncelleme işlemleri için kullanılan Supabase istemcisi
  - `blocks` — Kaydedilecek AuthorityBlock tipinde içerik blokları dizisi
  - `categoryId` — Güncellenecek kategorinin veritabanı kimliği
  - `toast` — Kullanıcıya kaydetme başarısı veya hatası bildirimi gösteren react-hot-toast fonksiyonu
  - `console.error` — Kaydetme sırasında oluşan hataları konsola loglayan fonksiyon
- **Dönüş**: yok (yalnızca yan etki: Supabase'de kategori verisini günceller, kullanıcıya bildirim gösterir)

---

## NODE ID STANDARD

  file: src\views\admin\CategoryBuilderView.tsx
  function: src\views\admin\CategoryBuilderView.tsx::CategoryBuilderView
  function: src\views\admin\CategoryBuilderView.tsx::handleSave

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryBuilderView