---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\account\quotes\AccountQuotesPage.tsx
skeleton_hash: a73143fe6a704c36
entity_hashes:
  func:AccountQuotesPage: 676b0f814ec2c5da
  overview: c6a0e6e2db5efcaf
  style_tokens: e101b5f2657eda63
generated_at: 2026-08-16T10:23:55Z
---

## Genel Bakış
AccountQuotesPage modülü, kullanıcının hesabına ait alıntıları (fiyat tekliflerini) görüntülediği ana sayfa bileşenidir. Bu sayfa, kullanıcının mevcut alıntılarını listeler, filtreler ve yönetir; ayrıca alıntı detaylarına erişim ve yeni alıntı oluşturma gibi temel işlevleri başlatır.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Yönlendirme
Bu grup, modülün temel yapısını ve kullanıcı arayüzünü oluşturur. Sayfa bileşeni, rota parametrelerini işler, gerekli verileri çeker ve kullanıcının alıntı listesini sunar.
- AccountQuotesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `AccountQuotesPage` fonksiyonu parametresiz bir React bileşenidir ve fonksiyon gövdesine erişim olmadığından, modülün doğru çalışması için gerekli koşullar çıkarılamamıştır. Mimari varsayımlar yalnızca fonksiyon gövdesindeki mantıksal akışa, bağımlılıklara ve koşullara dayanarak üretilebilir. Mevcut bilgi (fonksiyon imzası: `def AccountQuotesPage()`) yetersizdir.

---

## FONKSİYON DETAYLARI

### AccountQuotesPage

**Ne yapar**: Kullanıcının teklif taleplerini (quotes) listeleyen ana React bileşenidir. Bu sayfa, müşterinin kendi teklif isteklerini görüntülemesini, duruma göre filtrelemesini ve her bir teklife tıklayarak detay sayfasına yönlendirilmesini sağlar. Sayfa yüklendiğinde Supabase üzerinden teklif verilerini çeker ve durum etiketlerini SSOT'taki statülerden alarak görsel olarak sunar.

**Nasıl yapar**: Fonksiyon, birden fazla React hook'u kullanarak state yönetimi ve yan etkileri kontrol eder. `useAuth` hook'u ile giriş yapmış kullanıcı bilgisine erişir ve bu bilgi olmadan veri yükleme işlemini başlatmaz. `useEffect` içinde asenkron bir `load` fonksiyonu tanımlayarak `listMyQuotes(supabase)` çağrısı yapar; bu çağrı Supabase istemcisi aracılığıyla kullanıcının kendi tekliflerini çeker. Bileşen unmount edildiğinde memory leak önlenmesi için `mounted` flag'i ile cleanup fonksiyonu çalışır. Durum filtreleme işlemi `rows` dizisi üzerinde `filter` metodu ile yapılır ve sadece seçilen duruma eşleşen kayıtlar `visible` değişkeninde tutulur.

**Parametreler**:

Bu bileşen parametre almamaktadır (props'suz fonksiyonel bileşen).

**İç Hook Kullanımları**:

- `useAuth()` — `{ user }` destructuring ile giriş yapmış kullanıcı nesnesini döndürür. Kullanıcı null ise veri yükleme işlemi başlatılmaz.
- `useI18n()` — `{ t, lang }` değerlerini döndürür. `t` fonksiyonu çeviri anahtarlarından metinleri çeker, `lang` ise tarih formatlama için kullanılır.
- `useLocalizedRoutes()` — Lokalize edilmiş rota nesnelerini döndürür. `Routes.account.quoteDetail(q.id)` çağrısı ile teklif detay sayfasının URL'i üretilir.
- `useRouter()` — Next.js router nesnesini döndürür. `router.push()` metodu ile programlı sayfa yönlendirmesi yapılır.
- `useState<QuoteWithItems[]>([])` — Teklif satırlarını tutan state dizisi. Başlangıç değeri boş dizidir.
- `useState(true)` — Yükleme durumunu takip eden boolean state. Veri çekilirken `true`, yükleme tamamlandığında `false` olur.
- `useState<string>('all')` — Durum filtresi için string state. Varsayılan değer `'all'` olup tüm teklifleri gösterir.

**İç Fonksiyonlar**:

- `load()` — Asenkron fonksiyon. `listMyQuotes(supabase)` çağrısı ile veriyi çeker. Hata oluşursa `toast.error` ile kullanıcıya bildirim gösterir. Her zaman `finally` bloğunda `loading` state'ini `false` yapar.

- `statusClass(s: string): string` — Verilen durum string'ine karşılık gelen Tailwind CSS sınıfını döndürür. Her durum için farklı renk kombinasyonları tanımlıdır: `requested` sarı, `quoted` mavi, `accepted` yeşil, `rejected` kırmızı, `expired` gri tonları kullanır. Tanınmayan durumlar için varsayılan mavi tonlu sınıf döner.

- `statusIcon(s: string): React.ReactNode` — Her durum için uygun Lucide React ikonunu JSX olarak döndürür. `Clock` (requested), `FileText` (quoted), `CheckCircle` (accepted), `XCircle` (rejected), `Hourglass` (expired) ikonları kullanılır. İkonların rengi de duruma uygun şekilde ayarlanmıştır.

- `statusLabel(s: string): string` — `t()` çeviri fonksiyonu ile durum etiketini uluslararasılaştırılmış şekilde döndürür. Çeviri anahtar formatı `quotes.statusLabels.${s}` şeklindedir.

- `visible` — `rows` dizisinin `statusFilter` state'ine göre filtrelenmiş halidir. Filtre `'all'` ise tüm satırlar, aksi halde sadece eşleşen durumdaki satırlar dahil edilir.

**Dönüş**: `JSX.Element` — Sayfanın tüm görünümünü temsil eden React bileşeni. Üç ana durum gösterir: yükleme animasyonu (spinner), boş durum mesajı, veya teklif listesi. Teklif listesi her bir kartı `<button>` olarak render eder ve tıklanabilir yapıdadır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../hooks/useAuth::useAuth
- import: ../../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../../i18n/I18nProvider::useI18n
- import: ../../../i18n/datetime::formatDate
- import: ../../../lib/quotes/quoteStatusMachine::QUOTE_STATUSES
- import: ../../../lib/services/quoteService::listMyQuotes
- import: ../../../lib/services/quoteService::type QuoteWithItems
- import: @/lib/supabase/client::supabaseBrowserClient
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::AccountQuotesPage
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen authenticated kullanıcı nesnesi; useEffect içinde load fonksiyonunun çağrılıp çağrılmayacağını belirler
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu; tüm UI metinleri (hata mesajları, durum etiketleri, başlıklar) bu fonksiyonla çevrilir
  - `lang` — useI18n() hook'undan gelen dil kodu string'i; formatDate fonksiyonuna tarih formatlaması için geçirilir
  - `Routes` — useLocalizedRoutes() hook'undan gelen localized rota üretici nesnesi; `Routes.account.quoteDetail(q.id)` ile detay sayfası rotası oluşturulur
  - `router` — useRouter() hook'undan gelen Next.js router nesnesi; `router.push(...)` ile navigasyon yapılır
  - `rows` — useState ile tanımlı, `QuoteWithItems[]` tipinde state; kullanıcının tekliflerinin listesi, supabase'den yüklenir
  - `loading` — useState ile tanımlı, boolean tipinde state; veri yüklenirken true, yükleme tamamlanınca false olur; spinner gösterilip gösterileceğini kontrol eder
  - `statusFilter` — useState ile tanımlı, string tipinde state; hangi durumdaki tekliflerin filtrelenip gösterileceğini tutar (varsayılan `'all'`)
  - `statusClass` — fonksiyon; durum string'ini alıp ilgili Tailwind CSS class döner (bg-yellow-100 vb.)
  - `statusIcon` — fonksiyon; durum string'ini alıp ilgili lucide-react ikon React.ReactNode döner (Clock, FileText vb.)
  - `statusLabel` — fonksiyon; durum string'ini alıp `t()` ile çevrilmiş insan-okunur etiket döner
  - `visible` — `rows.filter(...)` ile statusFilter'a göre filtrelenmiş `QuoteWithItems[]` dizisi; render sırasında harita üzerinde dönülen liste
- **Dönüş**: JSX (React.ReactNode) — hesap sayfası tekliflerini listeleyen React bileşeni JSX'i

### [N2_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::AccountQuotesPage (useEffect callback)
- **params**: (yok — useEffect arrow function)
- **ic_degiskenler**:
  - `mounted` — boolean flag; useEffect cleanup fonksiyonunda false yapılır, böylece component unmount edildikten sonra state güncellemesi engellenir
  - `list` — `listMyQuotes(supabase)` asenkron çağrısından dönen `QuoteWithItems[]` dizisi; supabase üzerinden kullanıcının teklifleri çekilir
  - `e` — catch bloğunda yakalanan hata nesnesi; console.warn ile loglanır
- **Dönüş**: cleanup fonksiyonu döner → `() => { mounted = false }`

### [N3_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::load
- **params**: (yok)
- **ic_degiskenler**:
  - `list` — `listMyQuotes(supabase)` çağrısından dönen teklif listesi; mounted true ise `setRows(list)` ile rows state'ine yazılır
  - `e` — catch bloğunda yakalanan hata nesnesi; `console.warn` ve `toast.error` ile kullanıcıya hata gösterilir
- **Dönüş**: yok (void) — side effect olarak rows ve loading state'lerini günceller; hata olursa toast bildirimi gösterir

### [N4_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::statusClass
- **params**: `s: string` — teklif durumu string'i (requested, quoted, accepted, rejected, expired)
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — duruma karşılık gelen Tailwind CSS class string'i; örneğin `'requested'` → `'bg-yellow-100 text-yellow-800'`

### [N5_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::statusIcon
- **params**: `s: string` — teklif durumu string'i
- **ic_degiskenler**: (yok)
- **Dönüş**: `React.ReactNode` — duruma karşılık gelen lucide-react ikon bileşeni; örneğin `'requested'` → `<Clock className="text-yellow-600" size={16} />`

### [N6_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::statusLabel
- **params**: `s: string` — teklif durumu string'i
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — `t(`quotes.statusLabels.${s}`)` çağrısıyla dönen çevrilmiş durum etiketi

### [N7_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::filterButtonRender
- **params**: `opt` — `{ value: string, label: string }` nesnesi; filtre butonu seçeneği (all veya QUOTE_STATUSES elemanı)
- **ic_degiskenler**: (yok)
- **Dönüş**: `<button>` JSX'i — filtre butonu; tıklanınca `setStatusFilter(opt.value)` çağrısı ile statusFilter state'ini günceller; `statusFilter === opt.value` koşuluna göre aktif/pasif stil uygulanır

### [N8_NASIL] AST Pointer: src/views/account/quotes/AccountQuotesPage.tsx::quoteCardRender
- **params**: `q` — `QuoteWithItems` nesnesi; tek bir teklif kaydı (id, status, items, created_at, source alanlarını içerir)
- **ic_degiskenler**: (yok)
- **Dönüş**: `<button>` JSX'i — teklif kartı; tıklanınca `router.push(Routes.account.quoteDetail(q.id))` ile detay sayfasına yönlendirme yapılır; kart içinde `q.items[0]?.product_name` ilk ürün adı, `q.items.length` ürün sayısı, `formatDate(q.created_at, lang)` tarih, `q.source` kaynak, `q.status` durum bilgileri gösterilir; `statusClass(q.status)`, `statusIcon(q.status)`, `statusLabel(q.status)` ile durum stili/ikonu/etiketi render edilir

---

## NODE ID STANDARD

  file: src\views\account\quotes\AccountQuotesPage.tsx
  function: src\views\account\quotes\AccountQuotesPage.tsx::AccountQuotesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountQuotesPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-primary-navy/5`, `bg-slate-300`, `bg-slate-50`, `bg-white`, `border-b-2`, `border-primary-navy`, `border-slate-200`, `border-slate-200/60`, `hover:border-primary-navy`, `hover:border-primary-navy/30`, `hover:text-primary-navy`, `text-2xl`, `text-base`, `text-blue-600`
- **Layout:** `flex`, `flex-col`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `h-1`, `h-10`, `h-12`, `h-16`, `h-8`, `hover:shadow-md`, `inline-flex`, `items-center`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${statusClass(q.status`, `${statusFilter`, `:`, `===`, `animate-spin`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `font-bold`, `font-medium`, `font-semibold`, `mb-1`, `mb-4`, `mb-6`