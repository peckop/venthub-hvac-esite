---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx
skeleton_hash: d0d925c567f6b49d
entity_hashes:
  func:CategoryBuilderView: c538d4ad7085f51d
  func:handleSave: f8b5a865424c16c7
  overview: 34385cca754b2c32
  style_tokens: 745d0461670ee6bd
generated_at: 2026-05-28T22:39:30Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin admin panelinde kategori yapılandırma işlemlerini yöneten bir React görünüm bileşenidir. Yeni bir kategori oluşturma veya mevcut bir kategoriyi düzenleme senaryolarını tek bir bileşen üzerinden destekler ve temel veri kaydetme işlevini içerir.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Modülün temel React arayüzünü oluşturur ve kullanıcıya kategori bilgilerini gireceği formu sunar. Aldığı `categoryId` parametresiyle mevcut bir kategoriyi düzenleme modunda çalışıp çalışmayacağını belirler.
- CategoryBuilderView

### Kayıt İşleyici
Kullanıcı tarafından forma girilen veya düzenlenen kategori bilgilerinin, arka plan servislerine asenkron olarak gönderilmesini ve kaydedilmesini yönetir. İşlem başarısız olursa kullanıcıya geri bildirim sağlama sorumluluğu bu fonksiyondadır.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
Bu admin paneline ait kategori yapılandırma görünümü modülünün doğru çalışması için gerekli giriş prop'larının, yetki mekanizmalarının ve arka plan entegrasyonlarının eksiksiz olarak sağlanması zorunludur.

[Aksiyom 1]: Eğer CategoryBuilderView bileşenine zorunlu giriş olarak tanımlanan categoryId prop'u sağlanmazsa, hem mevcut kategorinin düzenlenmesi hem de yeni kategorinin sistemde doğru tanımlanması işlemleri başarısız olur.
[Aksiyom 2]: Eğer handleSave() fonksiyonunu kullanan kullanıcının admin seviyesinde kategori oluşturma/güncelleme yetkisi yoksa, kayıt işlemi reddedilir ve yapılan tüm kategori değişiklikleri kalıcı olarak kaydedilemez.
[Aksiyom 3]: Eğer handleSave() fonksiyonunun veri göndermesi gereken arka plan servisleri/API uç noktaları erişilemez durumdaysa, kategori değişiklikleri kaydedilemez ve işlem başarısız olur.
[Aksiyom 4]: Eğer modülün bağlı olduğu React uygulama runtime ortamı sağlanmamışsa, CategoryBuilderView bileşeni hiçbir şekilde render edilemez ve admin panelinin kategori yönetimi ekranı kullanılamaz.

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
- **params**: `{ categoryId }` — Kategorinin benzersiz tanımlayıcısı, Supabase sorgusu ve child fonksiyonlarda kapanım olarak kullanılır
- **ic_degiskenler**:
  - `router` — Next.js useRouter hook'undan dönen yönlendirici nesne, `router.back()` ile geri gitmek için kullanılır
  - `category` — `DbCategory | null` tipinde state, yüklenen kategori verisini tutar; header'da `category?.name` olarak görüntülenir
  - `blocks` — `AuthorityBlock[] | null` tipinde state, yetki içerik bloklarını tutar; `AuthorityBuilder`'a `value`, `AuthorityRenderer`'a `content`, `handleSave`'e güncelleme için beslenir
  - `loading` — `boolean` tipinde state, yükleme durumunu kontrol eder; `true` iken tam sayfa spinner gösterilir
  - `saving` — `boolean` tipinde state, kaydetme durumunu kontrol eder; `true` iken kaydetme butonu `disabled` ve spinner gösterilir
  - `previewMode` — `'desktop' | 'mobile'` tipinde state, önizleme panelinin cihaz görünüm modunu belirler; CSS class'ları buna göre değişir
  - `showPreview` — `boolean` tipinde state, sağ sidebar önizleme panelinin görünürlüğünü kontrol eder
  - `load` — `useCallback` ile sarılı async fonksiyon referansı, kategori verilerini Supabase'den çeker ve legacy migrasyonunu yapar; `useEffect` içinde çağrılır
  - `handleSave` — async fonksiyon referansı, `blocks` state'ini Supabase `categories` tablosuna `authority_content` olarak kaydeder; kaydet butonuna `onClick` bağlanır
- **Dönüş**: `JSX.Element` — Loading durumunda spinner JSX'i, normal durumda tam sayfa editor layout JSX'i (header, main editor area, preview sidebar)

### [N2_NASIL] AST Pointer: CategoryBuilderView.tsx::load
- **params**: `(parametre yok)` — Closure yoluyla `categoryId`, `setCategory`, `setBlocks`, `setLoading` erişir
- **ic_degiskenler**:
  - `data` — Supabase `select` sorgusundan dönen ham kategori verisi, tüm kategori alanlarını içerir (id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content)
  - `error` — Supabase sorgusundan dönen hata nesnesi; truthy ise `throw` ile yakalanır
  - `cat` — `data`'nın `DbCategory` tipine cast edilmiş hali, `authority_content` alanından bloklar okunur
  - `initialBlocks` — `AuthorityBlock[]` tipinde mutable değişken, `cat.authority_content`'ten okunan blokları tutar; `null` ise boş dizi fallback'i alınır; legacy migrasyonunda yeniden atanabilir
  - `legacyBlocks` — `AuthorityBlock[]` tipinde geçici dizi, eski statik verilerden (`description`, `metadata.metric1/metric2`) oluşturulan bloklar tutulur
  - `meta` — `cat.metadata`'nın `CategoryMetadata | null` tipine cast edilmiş hali, `meta.metric1` ve `meta.metric2` erişimleri ile eski metrik verilerine ulaşılan nesne
  - `rows` — `SpecsBlock['content']['rows']` tipinde dizi, legacy specs bloğu için `{ label, value }` satırlar tutulur; `meta.metric1?.label` ve `meta.metric2?.label` kontrol edilerek doldurulur
- **Dönüş**: `yok` — Yan etkiler: `setLoading(true)` ile başlar, `setCategory(cat)` ile kategoriyi set eder, `setBlocks(initialBlocks)` ile blokları set eder, legacy dönüşüm varsa `toast.success('Eski veriler bloklara dönüştürüldü. Kaydetmeyi unutmayın.')` gösterir, hata durumunda `console.error('Builder load error:', e)` ve `toast.error('Veriler yüklenemedi.')` çağırır, `finally` bloğunda `setLoading(false)` yapar

### [N3_NASIL] AST Pointer: CategoryBuilderView.tsx::handleSave
- **params**: `(parametre yok)` — Closure yoluyla `blocks`, `categoryId`, `setSaving` erişir
- **ic_degiskenler**:
  - `error` — Supabase `update` sorgusundan dönen hata nesnesi; truthy ise `throw` ile yakalanır
- **Dönüş**: `yok` — Yan etkiler: `setSaving(true)` ile başlar, `supabase.from('categories').update({ authority_content: blocks as DbJson }).eq('id', categoryId)` çağrısı ile veritabanını günceller, başarı durumunda `toast.success('Değişiklikler sisteme mühürlendi.')` gösterir, hata durumunda `console.error('Save error:', e)` ve `toast.error('Kaydetme hatası!')` çağırır, `finally` bloğunda `setSaving(false)` yapar

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