---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx
skeleton_hash: 820ddda4877d9f9a
entity_hashes:
  func:CategoryBuilderView: c538d4ad7085f51d
  func:handleSave: f8b5a865424c16c7
  overview: 917910d329f085fc
  style_tokens: 745d0461670ee6bd
generated_at: 2026-06-11T09:02:13Z
---

## Genel Bakış
VentHub HVAC admin panelinde kategori yapısının görsel olarak oluşturulmasını ve yönetilmesini sağlayan React görünüm bileşenidir. Mevcut bir kategoriyi yeniden yapılandırma veya sıfırdan yeni bir kategori hiyerarşisi tasarlama süreçlerini tek bir bileşen üzerinden koordine eder.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Kullanıcıya kategori verilerini düzenleyebileceği interaktif bir arayüz sunar. Verilen kategori kimliğine bağlı olarak yeni kategori oluşturma veya mevcut kategoriyi düzenleme modunda çalışır.
- CategoryBuilderView

### Veri Kaydetme İşleyicisi
Formda düzenlenen kategori yapısının sunucuya gönderilmesini ve veritabanında kalıcı hale getirilmesini sağlar.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, verilen fonksiyon imzalarına dayanarak, aşağıdaki temel mimari varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer `categoryId` parametresi (`CategoryBuilderView` bileşenine) sağlanmamışsa, bileşenin hangi kategoriyi düzenleyeceği bilinmiyor olur ve bu durumda bileşenin çalışma davranışı belirsizdir.

[Aksiyom 2]: Eğer `handleSave()` işlevi çağrıldığında geçerli bir form durumu veya kaydedilecek veri seti (`state` veya bağlam üzerinden) mevcut değilse, kaydetme işlemi başarısız olur veya beklenmeyen bir duruma yol açar.

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

### [N1_NASIL] AST Pointer: `CategoryBuilderView.tsx`::CategoryBuilderView
- **params**: `({ categoryId })` — kategori ID'si, string veya number olarak gelen prop
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen navigasyon nesnesi, `router.back()` ile geri dönüş sağlanır
  - `canWrite` — `useRole()` hook'undan dönen write yetkisi kontrol fonksiyonu
  - `hasWriteAccess` — `canWrite('categories')` çağrısı sonucu boolean, kategoriler için yazma yetkisi var mı
  - `category` — `useState<DbCategory | null>(null)` — Supabase'den yüklenen kategori nesnesi, header'da `category?.name` olarak gösterilir
  - `blocks` — `useState<AuthorityBlock[] | null>(null)` — AuthorityBuilder'a verilen blok dizisi, sayfa içeriğini oluşturur
  - `loading` — `useState(true)` — yükleme durumu boolean, true iken loading spinner gösterilir
  - `saving` — `useState(false)` — kaydetme durumu boolean, kaydetme butonu disabled/animasyon kontrolü
  - `previewMode` — `useState<'desktop' | 'mobile'>('desktop')` — önizleme cihaz modu, `Monitor`/`Smartphone` icon seçimi
  - `showPreview` — `useState(true)` — önizleme panelinin açık olup olmadığı boolean, `Eye` icon toggle
  - `load` — `useCallback(async () => { ... }, [categoryId])` — kategori verisini Supabase'den yükleyen ve legacy migrasyon yapan fonksiyon
  - `handleSave` — `async () => { ... }` — blokları Supabase'e kaydeden ve audit log yazan fonksiyon
- **Dönüş**: JSX — `loading`true iken loading spinner, false iken tam sayfa CategoryBuilder arayüzü (header + AuthorityBuilder + Preview sidebar)

---

### [N2_NASIL] AST Pointer: `CategoryBuilderView.tsx`::load
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — `await supabase.from('categories').select(...).single()` sonucu dönen `{ data, error }` destructured `data` alanı, kategori satırı
  - `error` — `{ data, error }` destructured `error` alanı, Supabase sorgu hatası varsa fırlatılır
  - `cat` — `data as DbCategory` — data'nın DbCategory tipine cast edilmiş hali, tüm kategori alanlarını içerir (id, name, slug, description, metadata, authority_content vb.)
  - `initialBlocks` — `(cat.authority_content as AuthorityBlock[]) || []` — kategorinin mevcut blok dizisi veya boş dizi
  - `legacyBlocks` — `AuthorityBlock[]` — eski statik verileri (description, metadata.metric1/metric2) yeni blok formatına dönüştürmek için oluşturulan geçici dizi
  - `meta` — `cat.metadata as CategoryMetadata | null` — kategorinin metadata alanı, `metric1` ve `metric2` alanlarını barındırır
  - `rows` — `SpecsBlock['content']['rows']` — teknik özet satırları dizisi, `{ label, value }` objelerinden oluşur
  - `e` — catch bloğu hata nesnesi, `console.error('Builder load error:', e)` ile loglanır
- **Dönüş**: yok (void) — yan etkiler: `setCategory(cat)`, `setBlocks(initialBlocks)`, `setLoading(false)`, hata durumunda `toast.error`, migrasyon durumunda `toast.success`

---

### [N3_NASIL] AST Pointer: `CategoryBuilderView.tsx`::handleSave
- **params**: (yok)
- **ic_degiskenler**:
  - `error` — `await supabase.from('categories').update(...).eq(...)` sonucu `{ error }` destructured `error` alanı, update hatası varsa fırlatılır
  - `e` — catch bloğu hata nesnesi, `console.error('Save error:', e)` ile loglanır
- **Dönüş**: yok (void) — yan etkiler: `setSaving(true/false)`, Supabase'de `authority_content` alanı güncellenir, `logAdminAction` ile audit log yazılır, `toast.success` veya `toast.error` gösterilir

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