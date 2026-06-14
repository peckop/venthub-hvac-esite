---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoriesTableBody.tsx
skeleton_hash: 097ab28f4c3c8803
entity_hashes:
  func:CategoriesTableBody: d50fe77bdbd7da87
  func:categoriesFetcher: 070e9d2ca8545c0e
  overview: 7082df8f114ee8d8
  style_tokens: fc380c343feea254
generated_at: 2026-06-13T18:04:31Z
---

## Genel Bakış
Bu modül, admin panelindeki kategoriler tablosunun gövde (body) bölümünü render eden bir React bileşeni ve bu bileşenin ihtiyaç duyduğu verileri Supabase veritabanından asenkron olarak çeken bir veri getirici fonksiyonunu içerir. Modül, veri erişimi ve sunum katmanlarını tek bir dosyada birleştirerek kategori yönetimi arayüzünün temel parçasını oluşturur.

## Fonksiyon Grupları
### Veri Erişimi
Bu grup, Supabase veritabanından kategori kayıtlarını çekmek için kullanılan asenkron veri getirici mantığını içerir. Fonksiyon, filtreleme ve sayfalama parametrelerini işleyerek tutarlı bir veri yapısı döndürür.
- categoriesFetcher

### Görsel Bileşen
Bu grup, çekilen kategori verilerini bir tablo gövdesi içinde kullanıcıya sunan React fonksiyonel bileşenini kapsar. Bileşen, gelen veriyi satırlar ve hücreler halinde düzenleyerek admin arayüzünün interaktif bir parçasını oluşturur.
- CategoriesTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon imzaları ve modül sabitleri temelinde çıkarılabilen sınırlı mimari varsayımlar mevcuttur.

[Aksiyom 1]: Eğer `categoriesFetcher` fonksiyonuna geçirilen `supabase` parametresi geçerli bir SupabaseClient<Database> bağlantısı değilse (örn: None veya yanlış tipte bir nesne), fonksiyon veritabanına bağlanamaz ve Promise<FetchResult<DbCategory>> döndürülmesi başarısız olur.

[Aksiyom 2]: Eğer `CATEGORY_SELECT` sabiti geçerli bir Supabase select sorgu dizesi içermiyorsa veya veritabanındaki `categories` tablosunun şemasıyla (örn: sütun isimleri, tipleri) uyumlu değilse, `categoriesFetcher` içinde yapılacak veri sorgusu başarısız olur veya beklenmeyen veri yapısı döner.

[Aksiyom 3]: Eğer `categoriesFetcher` fonksiyonunun döndürdüğü `FetchResult<DbCategory>` yapısı (örn: `data`, `error` alanları) `CategoriesTableBody` bileşeni tarafından beklenen yapı ile (örn: React.FC Props) uyumlu değilse, bileşen veriyi işleyemez ve render edilemez.

[Aksiyom 4]: Eğer `_params` parametresi, `categoriesFetcher` fonksiyonunun beklediği `FetchParams` yapısını (örn: filtre, sayfalama parametreleri) içermiyorsa veya eksik ise, fonksiyon çalışması sırasında hata oluşur veya eksik/varsayılan parametrelerle çalışır; beklenmeyen veri sonuçları dönebilir.

---

## FONKSİYON DETAYLARI

### categoriesFetcher
**Ne yapar**: Supabase istemcisini kullanarak veritabanından tüm kategori kayıtlarını asenkron olarak çeker ve düzenli bir şekilde sıralanmış olarak döndürür.
**Nasıl yapar**: Önce `ensureSessionFresh()` çağrısı yaparak kullanıcı oturumunun güncel olduğunu garanti altına alır. Ardından Supabase istemcisi üzerinden `categories` tablosuna sorgu gönderir. Sorguda `CATEGORY_SELECT` sabiti ile belirlenen alanları seçer ve sonuçları `sort_order` (artan) ve ardından `name` (artan) alanlarına göre sıralar. Bir hata oluşursa hatayı fırlatır, başarırsa veri satırlarını `FetchResult` formatında ambalajlayarak döndürür.
**Parametreler**:
- supabase: `SupabaseClient<Database>` — Veritabanı işlemlerini yürütmek için kullanılan yetkilendirilmiş Supabase istemcisi örneği.
- _params: `FetchParams` — Fonksiyonun imzası tarafından gereklidir ancak mevcut uygulamada kullanılmamaktadır (prefiks `_` ile belirtilmiştir).
**Dönüş**: `Promise<FetchResult<DbCategory>>` — Kategorilerin bir dizisini ve toplam eşleşen sayısını içeren bir nesne. `rows` alanı `DbCategory[]` tipindedir.

### CategoriesTableBody
**Ne yapar**: React uygulamasında bir kategori tablosunun gövdesini (satırlarını) oluşturan ve verileri asenkron olarak işleyen bir fonksiyonel bileşendir.
**Nasıl yapar**: Bileşen, `categoriesFetcher` fonksiyonunu bir veri çekme mekanizmasıyla (muhtemelen bir `useSWR` veya benzeri kütüphane) bağlayarak kategori listesini alır. Gelen `DbCategory[]` dizisi üzerinde bir haritalama (mapping) işlemi uygular ve her bir kategori için tablo satırı (`<tr>`) bileşenlerini oluşturarak JSX olarak render eder.
**Parametreler**: Bu fonksiyon bir React FC (Functional Component) olduğu için dışarıdan parametre almaz.
**Dönüş**: `React.FC` — Kategori verisini satırlar olarak gösteren bir `JSX.Element` (tablo gövdesi `<tbody>` veya satırlar dizisi).

---

## SABİTLER
- **CATEGORY_SELECT** (str) — `'id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_titl...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx::categoriesFetcher`

- **params**:
  - `supabase: SupabaseClient<Database>` — Supabase istemci instance'ı, veritabanı sorguları için kullanılır
  - `_params: FetchParams` — fetch parametreleri (bu fonksiyonda kullanılmıyor, underscore prefix ile belirtilmiş)

- **ic_degiskenler**:
  - `data` — Supabase `select` sorgusundan dönen ham satır verisi
  - `error` — Supabase sorgu sonucu hata nesnesi (null ise başarılı)
  - `rows` — `data`'nın `DbCategory[]` türüne cast edilmiş hali; cast başarısız olursa boş dizi fallback'i

- **Dönüş**: `Promise<FetchResult<DbCategory>>` — `{ rows, totalMatched }` objesi; `totalMatched` her zaman `rows.length`'e eşittir

- **Yan etkiler**: `ensureSessionFresh()` çağrısı ile oturum tazeler; Supabase üzerinden `categories` tablosunu `sort_order` ve `name` sıralamasıyla sorgular

---

### [N2_NASIL] AST Pointer: `src/views/admin/CategoriesTableBody.tsx::CategoriesTableBody`

- **params**: yok (React fonksiyonel component)

- **ic_degiskenler** (callback gövdelerinden çıkarılan):
  - `setEditingId` — Düzenleme modunda olan kategori ID'sini ayarlayan state setter
  - `setIsModalOpen` — Modalın açık/kapalı durumunu ayarlayan state setter
  - `val` — `saveName` callback'inde EditableCell'den gelen ham string değer, trimmed hali
  - `num` — `saveSortOrder` callback'inde ham değerden parse edilmiş tamsayı sıralama değeri
  - `hasWriteAccess` — Kullanıcının yazma izni olup olmadığını belirten boolean flag; CRUD butonlarının görünürlüğünü ve EditableCell aktifliğini kontrol eder
  - `table` — Tablo instance'ı; `table.reload()` ile veri yeniden yüklenir
  - `categoryNameMap` — `Map<string, string>` türünde; parent_id -> kategori adı eşlemesi, `categoryNameMap.get(r.parent_id)` ile lookup yapılır
  - `router` — Next.js router instance'ı; `router.push()` ile navigasyon yapılır (`/admin/categories/${r.id}/builder`)
  - `t` — i18n çeviri fonksiyonu, tüm UI metinleri için kullanılır
  - `adminTableActionClass` — Aksiyon butonları için ortak CSS class string'i
  - `adminTableActionDangerClass` — Tehlikeli aksiyon (silme) butonu için ortak CSS class string'i
  - `r` — Kolon hücre render callback'lerine giren `DbCategory` satır objesi; tüm kolonlarda (`r.name`, `r.id`, `r.slug`, `r.parent_id`, `r.image_url`, `r.sort_order`, `r.is_featured`, `r.description`, `r.parent_id`) erişilir

- **Dönüş**: `React.FC` — JSX element döndürür

- **Yan etkiler**:
  - `saveName` callback: `mutateWithAudit` ile kategori adını audit loglayarak günceller, ardından `toast.success` / `toast.error` bildirimleri ve `table.reload()` tetikler
  - `saveSortOrder` callback: `mutateWithAudit` ile sıralama değerini audit loglayarak günceller, ardından `toast.success` / `toast.error` bildirimleri ve `table.reload()` tetikler
  - `removeCategory` callback: `confirm()` dialog'u ile onay alır, `mutateWithAudit` ile kategoriyi audit loglayarak siler, ardından `toast.success` / `toast.error` ve `table.reload()` tetikler
  - `openNew` callback: `setEditingId(null)` ve `setIsModalOpen(true)` ile yeni kategori modalını açar
  - `openEdit` callback: `setEditingId(r.id)` ve `setIsModalOpen(true)` ile mevcut kategori düzenleme modalını açar
  - Kolon hücreleri: `VentImage` ve `EditableCell` component'lerini render eder; `process.env.NEXT_PUBLIC_SUPABASE_URL` ile storage URL'i oluşturur

- **Supabase_ops**:
  - `supabaseBrowserClient.from('categories').update({ name: val }).eq('id', r.id)` — kategori adını güncelle
  - `supabaseBrowserClient.from('categories').update({ sort_order: num }).eq('id', r.id)` — sıralama değerini güncelle
  - `supabaseBrowserClient.from('categories').delete().eq('id', r.id)` — kategoriyi sil

- **audit_ops**: Tüm CRUD işlemleri `mutateWithAudit` sarmalayıcısı içinde yürütülür; `resource: 'categories'`, `canWrite: hasWriteAccess`, `auditedByEdge: false` parametreleri ile

---

## NODE ID STANDARD

  file: src\views\admin\CategoriesTableBody.tsx
  function: src\views\admin\CategoriesTableBody.tsx::categoriesFetcher
  function: src\views\admin\CategoriesTableBody.tsx::CategoriesTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoriesTableBody
  export: categoriesFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-snug`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-indigo-500/10`, `bg-slate-700`, `bg-white/5`, `border-indigo-500/20`, `border-white/5`, `group-hover:border-cyan-400/30`, `group-hover:border-white/10`, `group-hover:text-cyan-400`, `group-hover:text-cyan-400/60`, `hover:bg-indigo-500`, `hover:text-white`, `text-center`, `text-cyan-400`, `text-indigo-400`
- **Layout:** `flex`, `flex-col`, `gap-1.5`, `gap-2`, `h-1`, `h-12`, `h-full`, `h-px`, `inline-block`, `items-center`, `justify-center`, `justify-end`, `line-clamp-1`, `max-w-200px`, `overflow-hidden`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminButtonPrimaryClass`, `${adminTableActionClass`, `:`, `border`, `duration-300`, `duration-500`, `duration-700`, `font-black`, `font-mono`, `glass`, `group`, `group-hover:rotate-90`, `group-hover:scale-110`, `italic`