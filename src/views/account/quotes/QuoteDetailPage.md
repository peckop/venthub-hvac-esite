---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\account\quotes\QuoteDetailPage.tsx
skeleton_hash: 62c7fec9786e8d95
entity_hashes:
  func:QuoteDetailPage: 3d71e18440faf62b
  overview: 172bfe259539c2cd
  style_tokens: f3eac423c34fd21f
generated_at: 2026-08-27T06:51:24Z
---

## Genel Bakış

Bu modül, teklif (quote) detay sayfasını gösteren bir React sayfa bileşenidir. URL'deki `id` parametresini kullanarak ilgili teklifin tüm bilgilerini yükler ve kullanıcıya sunar. Teklif yönetimi sürecinde görüntüleme noktası olarak görev yapar; duruma göre müşteri için kabul/red karar butonlarını dinamik olarak gösterir.

## Fonksiyon Grupları

### Sayfa Bileşeni

Teklif detay sayfasının tamamını oluşturan ana React bileşenidir. Ürün kalemleri, fiyatlar ve durum bilgileri dahil teklif verisini çeker, düzenler ve kullanıcıya okunabilir biçimde sunar.
- QuoteDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca parametresiz `QuoteDetailPage` imzasından somut mimari varsayımlar çıkarılamamaktadır.

---

## FONKSİYON DETAYLARI

### QuoteDetailPage

**Ne yapar**: `/account/quotes/detail?id=<uuid>` yolunda çalışan bir React fonksiyonel bileşenidir. Teklif detayını ve müşteri kararını (kabul/red) görüntüler. Karar düğmeleri SSOT'tan çizilir (`allowedCustomerQuoteActions` fonksiyonu ile belirlenir) — yerel bir geçiş listesi yoktur. Fiyat kolonları bu bileşende yalnızca okunur (cetvel R5). `useSearchParams` tüketicisidir ve uygulama sayfası `<Suspense>` ile sarar (kural 5).

**Nasıl yapar**: Bileşen, URL'deki `id` parametresini `useSearchParams` ile alır ve `quoteId` olarak kullanır. `useCallback` ile tanımlanan `load` fonksiyonu, Supabase üzerinden `getQuoteDetail` çağırarak teklif detayını yükler. `useEffect` içinde kullanıcı (`user`) mevcut olduğunda `load` tetiklenir. Yükleme sırasında spinner gösterilir; teklif bulunamazsa "bulunamadı" ekranı ve listeye dönüş butonu sunulur. Teklif başarıyla yüklendikçe kalemler tablo halinde listelenir. Fiyatlanmış kalemlerin toplamı yalnızca tüm kalemler fiyatlıysa ve tek para birimindeyse hesaplanır ve gösterilir (kısmi toplamı "Toplam" diye sunmak yanıltıcı olacağından — W4b dersi). Duruma göre `allowedCustomerQuoteActions` ile elde edilen aksiyon listesine göre kabul/red düğmeleri render edilir. `handleDecision` fonksiyonu, kullanıcıdan onay aldıktan sonra `decideQuote` çağırır ve ardından tekrar `load` ile veriyi tazeler. Durum etiketleri `statusLabel` ile çevrilir, durum renkleri `statusClass` ile belirlenir.

**Parametreler**: Fonksiyon herhangi bir parametre almaz (React bileşeni olarak props'suz tanımlanmıştır).

**Dönüş**: JSX elementi döndürür. Üç farklı durumda farklı arayüz sunar:
- Yükleme durumunda: Dönen bir spinner (animate-spin) içeren ortalanmış bir `div`.
- Teklif bulunamadığında: Dosya ikonu, "bulunamadı" mesajı ve listeye dönüş butonu içeren beyaz kart.
- Teklif mevcut olduğunda: Başlık satırı (tarih, kaynak, durum etiketi), duruma özel bilgi banner'ı (beklemede veya kabul edildi), kalemler tablosu (ürün adı, not, miktar, birim fiyat, satır toplamı, geçerlilik tarihi) ve toplam satırı (koşullu), ardından kabul/red düğmeleri (aksiyon listesine göre koşullu).

---

## İTHALATLAR (IMPORTS)
- import: ../../../hooks/useAuth::useAuth
- import: ../../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../../i18n/I18nProvider::useI18n
- import: ../../../i18n/datetime::formatDate
- import: ../../../i18n/format::formatCurrency
- import: ../../../lib/quotes/quoteStatusMachine::allowedCustomerQuoteActions
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::ArrowLeft
- import: lucide-react::CheckCircle
- import: lucide-react::FileText
- import: lucide-react::Hourglass
- import: lucide-react::XCircle
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::QuoteDetailPage
- **params**: yok
- **ic_degiskenler**:
  - `user` — `useAuth()` hook'undan dönen kullanıcı nesnesi; useEffect içinde `load` fonksiyonunu tetiklemek için varlığı kontrol edilir
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; tüm metin etiketlerinde, hata/başarı toast mesajlarında kullanılır
  - `lang` — `useI18n()` hook'undan dönen dil kodu; `formatDate` ve `formatCurrency` çağrılarına aktarılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota nesnesi; `Routes.account.quotes()` ile teklif listesine geri dönüş URL'si üretilir
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi; `router.push()` ile programatik yönlendirme yapılır
  - `searchParams` — `useSearchParams()` hook'undan dönen URLSearchParams nesnesi; `?.get('id')` ile teklif ID'si alınır
  - `quoteId` — URL'deki `id` query parametresi; yoksa boş string atanır; `load` fonksiyonuna bağımlılık olarak kullanılır
  - `quote` — `useState<QuoteWithItems | null>(null)` ile tutulan teklif detayı; yükleme sonrası `setQuote` ile güncellenir; null ise "bulunamadı" ekranı gösterilir
  - `setQuote` — `quote` state'inin setter fonksiyonu; `load` ve `handleDecision` içinde teklif verisini atamak için kullanılır
  - `loading` — `useState(true)` ile tutulan yükleme durumu; true iken spinner gösterilir
  - `setLoading` — `loading` state'inin setter fonksiyonu; `load` içinde yükleme başlangıcında true, bitişinde false yapılır
  - `deciding` — `useState(false)` ile tutulan karar verme durumu; butonların `disabled` prop'una bağlanır
  - `setDeciding` — `deciding` state'inin setter fonksiyonu; `handleDecision` içinde işlem başlangıcında true, bitişinde false yapılır
  - `load` — `useCallback` ile sarılmış async fonksiyon; `quoteId` varsa `getQuoteDetail` çağırarak teklif detayını yükler, state'i günceller
  - `statusLabel` — durum string'ini alıp `t('quotes.statusLabels.${s}')` ile çevrilmiş etiket döndüren fonksiyon
  - `statusClass` — durum string'ini alıp ilgili Tailwind CSS sınıfını döndüren fonksiyon; switch-case ile requested/quoted/accepted/rejected/expired/default durumlarını eşler
  - `handleDecision` — async fonksiyon; `decision` parametresiyle kabul/red işlemi yapar, onay dialogu gösterir, `decideQuote` çağırır, ardından `load` ile veriyi yeniler
  - `allPriced` — `quote.items.length > 0` VE `quote.items.every((i) => typeof i.unit_price === 'number')` koşullarının sonucu; tüm kalemlerin fiyatlı olup olmadığını belirten boolean
  - `currencies` — `quote.items.map((i) => i.currency ?? 'TRY')` ile oluşturulan para birimlerini tutan `Set`; tek para birimi kontrolü için kullanılır
  - `singleCurrency` — `currencies.size === 1` ise tek para birimi string'i, değilse null; toplam hesaplamada ve `formatCurrency` çağrılarında kullanılır
  - `total` — `allPriced && singleCurrency` koşulu sağlanıyorsa `quote.items.reduce((sum, i) => sum + Number(i.unit_price) * i.qty, 0)` ile hesaplanan toplam fiyat; sağlanmıyorsa null
  - `actions` — `allowedCustomerQuoteActions(quote.status)` fonksiyonundan dönen izin verilen aksiyon dizisi; butonların gösterilip gösterilmeyeceğini kontrol eder
- **Dönüş**: JSX (React bileşeni); loading durumunda spinner, quote null ise "bulunamadı" ekranı, aksi halde teklif detay tablosu ve aksiyon butonları render eder

### [N2_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::load (useCallback)
- **params**: yok (useCallback içinde tanımlanmış, bağımlılıkları: `[quoteId, t]`)
- **ic_degiskenler**:
  - `detail` — `await getQuoteDetail(supabase, quoteId)` sonucu dönen teklif detayı; `setQuote(detail)` ile state'e atanır
  - `e` — `catch` bloğunda yakalanan hata nesnesi; `console.warn` ile loglanır
- **Dönüş**: yok (void); yan etkileri: `setLoading`, `setQuote` state güncellemeleri, hata durumunda `toast.error` gösterimi

### [N3_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok (kapsam değişkenleri `user` ve `load` doğrudan erişilir)
- **Dönüş**: yok; `user` truthy ise `load()` fonksiyonunu çağırır (void ile fire-and-foretch)

### [N4_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::statusLabel
- **params**: `s` — durum string'i (örn: 'requested', 'quoted', 'accepted', 'rejected', 'expired')
- **ic_degiskenler**: yok
- **Dönüş**: string — `t('quotes.statusLabels.${s}')` ile çevrilmiş durum etiketi

### [N5_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::statusClass
- **params**: `s` — durum string'i
- **ic_degiskenler**: yok
- **Dönüş**: string — Tailwind CSS sınıfı; switch-case ile: 'requested' → 'bg-yellow-100 text-yellow-800', 'quoted' → 'bg-blue-100 text-blue-800', 'accepted' → 'bg-green-100 text-green-800', 'rejected' → 'bg-red-100 text-red-800', 'expired' → 'bg-slate-100 text-slate-600', default → 'bg-air-blue/10 text-primary-navy'

### [N6_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::handleDecision
- **params**: `decision` — `'accepted' | 'rejected'` union tipinde karar değeri
- **ic_degiskenler**:
  - `confirmKey` — `decision === 'accepted'` ise 'quotes.detail.acceptConfirm', değilse 'quotes.detail.rejectConfirm'; onay dialogu çeviri anahtarı olarak kullanılır
  - `e` — `catch` bloğunda yakalanan hata nesnesi; `console.error` ile loglanır
- **Dönüş**: yok (void); yan etkileri: `window.confirm` ile onay dialogu, `setDeciding` state güncellemesi, `decideQuote(supabase, quote, decision)` API çağırısı, `toast.success`/`toast.error` gösterimi, `load()` ile veri yenileme

### [N7_NASIL] AST Pointer: src/views/account/quotes/QuoteDetailPage.tsx::items map callback
- **params**: `item` — `quote.items` dizisinin elemanı (teklif kalemi nesnesi)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<tr>`); `item.id` key olarak kullanılır; `item.product_name`, `item.note`, `item.qty`, `item.unit_price`, `item.currency`, `item.valid_until` alanlarını render eder; `item.unit_price` number ise `formatCurrency` ile fiyat gösterilir, değilse '—' gösterilir; `item.valid_until` varsa `formatDate` ile tarih gösterilir, yoksa '—'

---

## NODE ID STANDARD

  file: src\views\account\quotes\QuoteDetailPage.tsx
  function: src\views\account\quotes\QuoteDetailPage.tsx::QuoteDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuoteDetailPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue`, `bg-green-50`, `bg-primary-navy`, `bg-slate-50`, `bg-white`, `border-b`, `border-b-2`, `border-green-200`, `border-primary-navy`, `border-red-200`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-slate-50`, `border-t`
- **Layout:** `flex`, `flex-wrap`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `h-11`, `h-16`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `min-h-20vh`, `min-h-50vh`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `last:`, `max-md:` önekleri
- **Yardımcı Sınıflar:** `${statusClass(quote.status`, `animate-spin`, `border`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `focus-visible:ring-primary-navy/50`, `focus-visible:ring-red-200`, `font-bold`, `font-medium`, `font-semibold`, `hover:scale-102`, `mb-4`, `mt-0.5`