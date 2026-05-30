---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx
skeleton_hash: 2762eb4f250e5d06
entity_hashes:
  func:AdminErrorsPage: a54e992b31a4d175
  func:fmt: f911ea01809e8b2a
  overview: d57f965472ef04ba
  style_tokens: a98ae3ae7fce0104
generated_at: 2026-05-30T20:26:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici paneli için geliştirilmiş bir hata görüntüleme sayfasıdır. Sistemde oluşan hataların listelenmesini ve incelenmesini sağlarken, tarih bilgilerini okunabilir formata dönüştüren yardımcı bir fonksiyon barındırır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Tüm sayfa düzenini ve veri akışını yöneterek hata kayıtlarını admin kullanıcılarına sunan ana React bileşenidir.
- AdminErrorsPage

### Tarih Formatlama Yardımcıları
Hata kayıtlarındaki ham tarih nesnelerini kullanıcı arayüzünde gösterilebilir string formatına dönüştürmekten sorumludur.
- fmt

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `AdminErrorsPage` bileşeni için dışarıdan (örn. API, context, prop) hata kayıtları listesi sağlanmazsa, sayfa boş veya yükleniyor durumunda kalır ve hata kayıtları gösterilmez.

[Aksiyom 2]: Eğer `fmt` fonksiyonuna `Date` nesnesi dışındaki bir veri tipi (örn. string, null, undefined) verilirse, fonksiyon hata verir veya beklenmeyen bir çıktı üretir.

[Aksiyom 3]: Eğer `fmt` fonksiyonu için gerekli olan tarih formatı (örn. "DD.MM.YYYY HH:mm") modül içinde sabitlenmemişse, format bilinmiyor olur.

[Aksiyom 4]: Eğer `AdminErrorsPage` bileşeninin render edeceği ana yapının (header, tablo/liste bölümü, vb.) en az bir `div` veya benzeri bir container içermesi zorunluysa, bu yapı yoksa sayfa düzgün render edilemez.

---

## FONKSİYON DETAYLARI

### AdminErrorsPage
**Ne yapar**: VentHub HVAC sisteminin yönetici paneli için geliştirilmiş hata kayıtları sayfası React bileşenidir. Yöneticilerin sistemde oluşan tüm hataları tek bir merkezden görüntülemesine ve incelemesine olanak tanır.
**Nasıl yapar**: Proje dizinindeki `src/views/admin/AdminErrorsPage.tsx` dosyası içinde tanımlanan React fonksiyonel bileşeni olarak çalışır. Yönetici arayüzünün hata yönetimi bölümünün tüm görsel ve işlevsel yapısını oluşturur, sayfa içindeki alt bileşenleri, hata listeleme mantığını ve kullanıcı etkileşimlerini bu ana bileşen üzerinden yönetir.
**Parametreler**: Herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür, bu bileşen yönetici panelinin rota yapısı içinde çağrılarak DOM'a eklenir ve hata sayfasını kullanıcıya sunar.

### fmt
**Ne yapar**: AdminErrorsPage bileşeni içinde kullanılmak üzere tasarlanmış tarih biçimlendirme yardımcı fonksiyonudur. Hata kayıtlarında yer alan tarihlerin kullanıcı tarafından okunabilir, anlaşılır bir formatta gösterilmesini sağlar.
**Nasıl yapar**: Girdi olarak aldığı JavaScript Date nesnesini alır, sistemde tanımlı standart bir tarih formatına dönüştürerek ekranda gösterilmek üzere hazırlar. Sadece AdminErrorsPage içindeki tarih formatlama ihtiyacını karşılamak için özel olarak geliştirilmiştir.
**Parametreler**:
- d: Date — Biçimlendirilecek geçerli bir JavaScript Date nesnesi, ilgili hata kaydının oluştuğu zaman bilgisini içerir.
**Dönüş**: Dönüş tipi resmi olarak tanımlanmamıştır, herhangi bir değer döndürmediği veya dönüş türünün belirlenmediği bilgisi mevcuttur.

---

## INTERFACES

### ErrorRow
- `id: string`
- `at: string`
- `url?: string | null`
- `message: string`
- `stack?: string | null`
- `user_agent?: string | null`
- `release?: string | null`
- `env?: string | null`
- `level?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::AdminErrorsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tenantId` — `useTenant()` hook'undan destructured `id` değeri, Supabase real-time kanal ismi ve tenant bağlamsı için kullanılır
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, tüm UI metinleri ve hata mesajları için kullanılır
  - `lang` — `useI18n()` hook'undan gelen mevcut dil kodu, `formatDateTime` çağrısına geçirilir
  - `dragScrollRef` — `useDragScroll<HTMLDivElement>()` hook'undan dönen ref, tablonun yatay sürüklenebilir alanı için DOM referansı
  - `fmt` — inner fonksiyon, Date nesnesini "YYYY-MM-DD" formatına çevirir
  - `now` — `new Date()`, şu anki tarih/saat
  - `defaultToDate` — `fmt(now)` çağrısıyla elde edilen bugünkü tarih stringi
  - `defaultFromDate` — `now`'dan 6 gün öncesinin formatlanmış tarih stringi
  - `rows` — `React.useState<ErrorRow[]>([])`, Supabase'den çekilen hata kayıtları dizisi
  - `loading` — `React.useState<boolean>(false)`, veri yükleme durumu
  - `error` — `React.useState<string | null>(null)`, hata mesajı veya null
  - `total` — `React.useState(0)`, sunucudaki toplam kayıt sayısı (pagination için)
  - `page` — `React.useState(1)`, mevcut sayfa numarası
  - `q` — `React.useState('')`, arama kutusuna yazılan ham sorgu metni
  - `debouncedQ` — `React.useState('')`, 300ms gecikmeli arama sorgusu, API istekleri için kullanılır
  - `fromDate` — `React.useState(defaultFromDate)`, başlangıç tarihi filtresi
  - `toDate` — `React.useState(defaultToDate)`, bitiş tarihi filtresi
  - `level` — `React.useState('')`, hata seviyesi filtresi (error/warn/info/)
  - `env` — `React.useState('production')`, ortam filtresi (production/preview/development/)
  - `fetchErrors` — `React.useCallback`, Supabase'den hata kayıtlarını çeken asenkron fonksiyon, filtre/sayfalama parametrelerine göre query oluşturur
  - `pathname` — `usePathname()` hook'undan gelen mevcut URL yolu, sayfa değişikliğinde veriyi yeniden çeker
  - `fetchRef` — `React.useRef(fetchErrors)`, fetchErrors fonksiyonunun güncel referansını tutar, real-time callback'lerde güncel versiyonuna erişmek için kullanılır
  - `refetchTimer` — `React.useRef<ReturnType<typeof setTimeout> | null>(null)`, debounce amaçlı setTimeout ID'si
  - `scheduleRefetch` — `React.useCallback`, 400ms gecikmeyle fetchErrors'u tetikleyen debounce fonksiyonu
  - `expandedId` — `React.useState<string | null>(null)`, genişletilmiş satırın ID'si, detay panelini açar/kapar
- **Dönüş**: JSX (React element — admin paneli hata listesi tablosu)

---

### [N2_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::fmt
- **params**: `(d: Date)` — Formatlanacak tarih nesnesi
- **ic_degiskenler**:
  - `y` — `d.getFullYear()`, tam yıl numarası (örn. 2025)
  - `m` — `String(d.getMonth() + 1).padStart(2, '0')`, sıfır dolgulu ay stringi (örn. "01"-"12")
  - `day` — `String(d.getDate()).padStart(2, '0')`, sıfır dolgulu gün stringi (örn. "01"-"31")
- **Dönüş**: `string` — "YYYY-MM-DD" formatında tarih (örn. "2025-01-15")

---

### [N3_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::debounceEffect
- **params**: (parametre yok — React.useEffect callback)
- **ic_degiskenler**:
  - `t` — `setTimeout(() => setDebouncedQ(q.trim()), 300)` dönüş değeri, 300ms debounce timer ID'si; temizleme fonksiyonunda `clearTimeout(t)` ile iptal edilir
- **Dönüş**: cleanup fonksiyonu — timer'ı temizler

---

### [N4_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::fetchErrors
- **params**: (parametre yok — useCallback, bağımlılıklar: `[fromDate, toDate, level, env, debouncedQ, page, t]`)
- **ic_degiskenler**:
  - `query` — `supabase.from('client_errors').select(...)` ile başlayan Supabase query builder nesnesi; filtreler (`gte`, `lte`, `eq`, `or`) ve sıralama zincirlenerek eklenir
  - `like` — `` `%${debouncedQ}%` `` formatında arama deseni, `query.or()` içinde `url.ilike` ve `message.ilike` için kullanılır
  - `from` — `(page - 1) * PAGE_SIZE`, pagination için başlangıç indeksi
  - `to` — `from + PAGE_SIZE - 1`, pagination için bitiş indeksi
  - `data` — `await query.range(from, to)` sonucundan dönen `data` özelliği, hata satırları dizisi
  - `error` — `await query.range(from, to)` sonucundan dönen `error` özelliği, Supabase hatası veya null
  - `count` — `await query.range(from, to)` sonucundan dönen `count` özelliği, toplam kayıt sayısı
- **Dönüş**: `Promise<void>` — state setter'ları ile `rows`, `total`, `error`, `loading` güncellenir

---

### [N5_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::scheduleRefetch
- **params**: (parametre yok — useCallback, bağımlılık: `[]`)
- **ic_degiskenler**: (yok — sadece outer scope'taki `refetchTimer` ve `fetchRef` referanslarına erişir)
- **Dönüş**: `void` — varsa önceki timer'ı temizler, ardından 400ms sonrası için `fetchRef.current()` çağrısı zamanlar

---

### [N6_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::realtimeEffect
- **params**: (parametre yok — React.useEffect callback, bağımlılıklar: `[scheduleRefetch, tenantId]`)
- **ic_degiskenler**:
  - `ch` — `` supabase.channel(`client-errors-${tenantId}`) `` ile oluşturulan Supabase real-time kanal aboneliği; `postgres_changes` event'i ile `client_errors` tablosundaki tüm değişiklikleri dinler
- **Dönüş**: cleanup fonksiyonu — `supabase.removeChannel(ch)` ile kanalı kapatır, `refetchTimer.current` varsa timer'ı temizler

---

### [N7_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::realtimeChangeHandler
- **params**: (parametre yok — Supabase `postgres_changes` callback)
- **ic_degiskenler**: (yok — sadece outer scope'taki `scheduleRefetch`'i çağırır)
- **Dönüş**: `void` — tabloda değişiklik gerçekleştiğinde `scheduleRefetch()` ile yeniden veri çekilmesini tetikler

---

### [N8_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::realtimeCleanup
- **params**: (parametre yok — realtimeEffect cleanup fonksiyonu)
- **ic_degiskenler**:
  - `ch` — outer scope'tan kapanış yoluyla erişilen Supabase kanal nesnesi (realtimeEffect içinde tanımlı)
- **Dönüş**: `void` — `supabase.removeChannel(ch)` ile real-time aboneliği kaldırır; `refetchTimer.current` varsa pending timer'ı iptal eder

---

### [N9_NASIL] AST Pointer: `src/views/admin/AdminErrorsPage.tsx`::mapRenderRow
- **params**: `r: ErrorRow` — Tek bir hata kaydı nesnesi
- **ic_degiskenler**: (yok — parametre `r`'nin özellikleri doğrudan JSX içinde erişilir)
  - `r.id` — hata kaydının benzersiz tanımlayıcısı, `key` ve `expandedId` karşılaştırması için kullanılır
  - `r.at` — hata oluşma zamanı, `formatDateTime(r.at, lang)` ile formatlanarak gösterilir
  - `r.level` — hata seviyesi (`error`/`warn`/`info`), renkli badge ile gösterilir
  - `r.message` — hata mesajı metni, tablo hücresinde doğrudan yazdırılır
  - `r.url` — hata oluşan URL, yoksa `"-"` gösterilir
  - `r.stack` — stack trace metni, `String(r.stack || '').slice(0, 8000)` ile 8000 karakterle kısaltılıp `<pre>` içinde gösterilir
  - `r.user_agent` — tarayıcı kullanıcı ajanı stringi, detay panelinde gösterilir
  - `r.release` — uygulama versiyon/release bilgisi, detay panelinde gösterilir
  - `r.env` — ortam bilgisi (production/preview/development), detay panelinde gösterilir
- **Dönüş**: `JSX.Element` — `<React.Fragment>` içinde satır + genişletme detayı (varsa)

---

## NODE ID STANDARD

  file: src\views\admin\AdminErrorsPage.tsx
  function: src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage
  function: src\views\admin\AdminErrorsPage.tsx::fmt

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-rose-50`, `bg-sky-50`, `bg-surface-deep`, `bg-surface-deep/40`, `bg-surface-deep/80`, `bg-white/3`, `bg-white/5`, `border-b`, `border-red-100`, `border-t`, `border-white/10`, `border-white/5`, `hover:bg-white/10`, `hover:bg-white/2`
- **Layout:** `backdrop-blur-md`, `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `gap-6`, `grid`, `inline-flex`, `items-center`, `justify-between`, `justify-end`, `max-h-80`, `md:grid-cols-2`, `min-w-full`, `overflow-auto`
- **Varyant/Responsive:** `:`, `disabled:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminCardClass`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `${r.level`, `:`, `===`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-30`, `error`, `font-black`, `font-bold`, `font-medium`, `font-mono`, `glass-strong`