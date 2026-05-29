---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx
skeleton_hash: d0d925c567f6b49d
entity_hashes:
  func:CategoryBuilderView: c538d4ad7085f51d
  func:handleSave: f8b5a865424c16c7
  overview: 248cf966562364e2
  style_tokens: 745d0461670ee6bd
generated_at: 2026-05-29T19:01:11Z
---

## Genel Bakış
Bu modül, VentHub HVAC admin panelinde kategori yapısı oluşturma ve düzenleme işlemlerini yöneten bir React görünüm bileşenidir. Mevcut bir kategoriyi yeniden yapılandırma veya yeni bir kategori hiyerarşisi tasarlama yeteneği sağlar ve kaydetme işlemini merkezi olarak kontrol eder.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Kullanıcıya kategori verilerini görsel olarak düzenleyebileceği bir arayüz sunar. Modunu (yeni oluşturma veya mevcut kategoriyi düzenleme) belirleyen temel bileşendir.
- CategoryBuilderView

### Veri Kaydetme İşleyicisi
Formda düzenlenen kategori yapısının veya verisinin sunucuya gönderilmesini ve kaydedilmesini koordine eder. Başarılı veya başarısız sonuçlara göre kullanıcı bildirimleri yönetir.
- handleSave

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir kategori oluşturma/düzenleme formu sunan React görünüm bileşenidir ve temel kaydetme işlevini içerir. Aşağıdaki mimari varsayımlar fonksiyon imzalarına dayanarak çıkarılmıştır.

---

**[Aksiyom 1]:** `CategoryBuilderView` bileşeni bir `categoryId` prop'u ile çağrılır. Eğer `categoryId` değer olarak `undefined` veya `null` gelirse, bileşen "yeni kategori oluşturma" modunda çalışır (varsa mevcut kategori verisi yüklenmez). Eğer geçerli bir `categoryId` değer gelirse, bileşen ilgili kategoriyi düzenleme modunda çalışır.

**[Aksiyom 2]:** `handleSave()` fonksiyonu çağrıldığında, kaydedilecek kategori verisinin (form durumu veya bileşen state'i) önceden doldurulmuş ve geçerli bir durumda olması gerekir. Eğer kaydedilecek geçerli veri yoksa, `handleSave()` işlevinin anlamlı bir kayıt işlemi gerçekleştirmesi beklenemez.

**[Aksiyom 3]:** `CategoryBuilderView` bileşeni, varsa kategori listesini veya kategoriye ait hiyerarşik yapı bilgisini (üst kategori referansları vb.) dışarıdan bir kaynaktan (API, context veya prop) almalıdır. Eğer bu veri kaynağı mevcut değilse, kategori formu ilgili alanları (örn. üst kategori seçimi) eksik veya boş olarak render eder.

**[Aksiyom 4]:** `handleSave()` sonucunda bir API isteği发起lması bekleniyorsa, ilgili API endpoint'inin (kategori oluşturma/güncelleme) erişilebilir veYetkili olması gerekir. Eğer API erişilemezse veya yetkinlik yoksa, kaydetme işlemi başarısız olur.

---

> **Not:** Bu modülde herhangi bir sabit (constant) tanımlı değildir. Fonksiyon gövdelerine ilişkin detaylı bilgi sağlanmadığından, axioms yalnızca fonksiyon imzaları ve modülün amacına ilişkin üst düzey mimari varsayımları içermektedir.

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
- **params**: ({ categoryId })
- **ic_degiskenler**:
  - `router` — Next.js useRouter hook'undan gelen router nesnesi, sayfa yönlendirmeleri için kullanılır
  - `category` — useState ile tutulan kategori verisi (DbCategory tipinde veya null), yüklenen kategorinin tüm bilgilerini barındırır
  - `blocks` — useState ile tutulan yetkilendirme blokları dizisi (AuthorityBlock[] tipinde veya null), sayfa içeriğini oluşturur
  - `loading` — useState ile tutulan yükleme durumu (boolean), verilerin yüklenip yüklenmediğini takip eder
  - `saving` — useState ile tutulan kaydetme durumu (boolean), kaydetme işlemi sırasında buton durumunu kontrol eder
  - `previewMode` — useState ile tutulan önizleme modu ('desktop' veya 'mobile'), sağ paneldeki cihaz görünümünü belirler
  - `showPreview` — useState ile tutulan önizleme paneli görünürlüğü (boolean), sağ panelin açılıp kapanmasını kontrol eder
  - `load` — useCallback ile sarılmış asenkron fonksiyon, kategori verilerini ve blokları yükler
  - `handleSave` — asenkron fonksiyon, güncellenmiş blokları veritabanına kaydeder
- **Dönüş**: React.FC<CategoryBuilderViewProps> (JSX)

### [N2_NASIL] AST Pointer: CategoryBuilderView.tsx::load
- **params**: (parametre yok - useCallback closure'unda categoryId kullanılır)
- **ic_degiskenler**:
  - `data` — supabase.from('categories').select() sorgusundan dönen veri (DbCategory veya null)
  - `error` — supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `cat` — data'nın DbCategory tipine cast edilmiş hali
  - `initialBlocks` — cat.authority_content alanından elde edilen AuthorityBlock dizisi veya boş dizi
  - `legacyBlocks` — eski veri yapısını yeni blok formatına dönüştürmek için oluşturulan AuthorityBlock dizisi
  - `meta` — cat.metadata alanının CategoryMetadata tipine cast edilmiş hali veya null
  - `rows` — SpecsBlock['content']['rows'] tipinde dizi, teknik özet satırlarını tutar
- **Dönüş**: yok (async fonksiyon, verileri state'lere kaydeder)

### [N3_NASIL] AST Pointer: CategoryBuilderView.tsx::handleSave
- **params**: (parametre yok - closure'unda blocks ve categoryId kullanılır)
- **ic_degiskenler**:
  - `error` — supabase.from('categories').update() sorgusu sırasında oluşabilecek hata nesnesi
- **Dönüş**: yok (async fonksiyon, veritabanına kayıt yapar ve toast bildirimleri gösterir)

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