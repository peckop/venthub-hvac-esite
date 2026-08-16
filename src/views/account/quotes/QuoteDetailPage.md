---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\account\quotes\QuoteDetailPage.tsx
skeleton_hash: bf02fcbd76ed7fdc
entity_hashes:
  func:QuoteDetailPage: ad75de9f3250ca48
  overview: a7b68aa43fac48dc
  style_tokens: f3eac423c34fd21f
generated_at: 2026-08-16T10:24:24Z
---

## Genel Bakış

Bu modül, teklif (quote) detay sayfasını gösteren bir React sayfa bileşenidir. Teklifin tüm bilgilerini ve ilgili ayrıntıları kullanıcılara sunarak, teklif yönetimi sürecinde kritik bir görüntüleme noktası olarak görev yapar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Teklif detay sayfasının tamamını oluşturan ve yöneten ana React bileşenidir. Sayfa yüklenişinde ilgili teklif verisini çeker, düzenler ve kullanıcıya okunabilir bir biçimde sunar.
- QuoteDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen bilgilerden (sadece parametresiz fonksiyon imzası) somut mimari varsayımlar çıkarılamamaktadır.

[Aksiyom 1]: Eğer `QuoteDetailPage` bir React Sayfa (Page) bileşeni olarak çalışıyorsa, bileşenin props almadan (parametresiz) çalıştığı ve gerekli verileri React Router'dan (useParams/useLocation) veya üst bileşenlerden context yoluyla aldığı varsayılır. Aksi takdirde, bileşen bağımsız olarak test edilemez hale gelir.

[Aksiyom 2]: Eğer `QuoteDetailPage` bir quote detay sayfası olarak render ediliyorsa, ilgili quote verisinin (ID, detaylar, kalemler vb.) bileşen içinden erişilebilir bir kaynaktan (API servisi, store veya context) sağlanıyor olması gerekir; aksi takdirde sayfa boş veya hata durumunda render edilir.

---

## FONKSİYON DETAYLARI

### QuoteDetailPage

**Ne yapar**: Teklif detay sayfasını render eden React fonksiyonel bileşenidir. URL'deki `id` parametresini alarak ilgili teklifin tüm bilgilerini (ürün kalemleri, fiyatlar, durum) yükler ve görüntüler. Ayrıca müşteri için kabul/red karar butonlarını duruma göre dinamik olarak gösterir.

**Nasıl yapar**: Sayfa yüklendiğinde `useSearchParams` hook'u ile URL'den `quoteId` parametresini çeker. `useCallback` ile tanımlanan `load` fonksiyonu, `getQuoteDetail` API çağrısı yaparak teklif verisini çeker ve state'e yazar. `useEffect`, `user` değiştiğinde otomatik olarak `load` fonksiyonunu tetikler. Fiyat hesaplaması, tüm kalemlerin fiyatlı ve aynı para biriminde olup olmadığını kontrol ederek toplam tutarı hesaplar. Karar butonları `allowedCustomerQuoteActions` fonksiyonundan gelen izin listesine göre koşullu olarak render edilir. `handleDecision` fonksiyonu, kullanıcı onayı aldıktan sonra `decideQuote` API çağrısı yapar ve ardından sayfayı yeniler.

**Parametreler**:
Bu bileşen doğrudan parametre almaz — props'suz bir sayfa bileşenidir. Veri kaynağı olarak şu hook'ları kullanır:

- `useAuth()` — `{ user }`: Mevcut oturum açmış kullanıcı bilgisini sağlar. Kullanıcı oturum açmamışsa veri yüklenmez.
- `useI18n()` — `{ t, lang }`: Çoklu dil desteği için çeviri fonksiyonu (`t`) ve dil kodu (`lang`) döndürür.
- `useLocalizedRoutes()` — `Routes`: Localize edilmiş rota builder'ları sağlar (örn: `Routes.account.quotes()`).
- `useRouter()` — `router`: Sayfa yönlendirme işlemleri için Next.js router nesnesi.
- `useSearchParams()` — `searchParams`: URL query string parametrelerine erişim sağlar. `id` parametresi teklif UUID'sini taşır.

**Dönüş**: `JSX.Element` — Teklif detay sayfasının tamamını oluşturan JSX yapısı. Yükleniyor durumunda spinner, teklif bulunamadığında hata kartı, aksi halde teklif detayı tablosu ve karar butonları döndürür. Bileşen `<Suspense>` zarfı içinde kullanılmalıdır zira `useSearchParams` kullanır.

**İç Durum Değişkenleri**:
- `quote`: `QuoteWithItems | null` — Yüklenen teklif verisi ve kalemleri.
- `loading`: `boolean` — Veri yükleme durumunu takip eder.
- `deciding`: `boolean` — Karar (kabul/red) işleminin devam edip etmediğini takip eder, butonları devre dışı bırakmak için kullanılır.

**Yardımcı Fonksiyonlar**:

`statusLabel(s: string): string`
Durum kodunu çeviri sistemi üzerinden okunabilir etikete dönüştürür. `t('quotes.statusLabels.${s}')` kalıbını kullanır.

`statusClass(s: string): string`
Durum koduna göre Tailwind CSS sınıfı döndürür. `requested` için sarı, `quoted` için mavi, `accepted` için yeşil, `rejected` için kırmızı, `expired` için gri tonları kullanır.

`handleDecision(decision: 'accepted' | 'rejected'): Promise<void>`
Müşteri karar işlerini yürütür. Önce `window.confirm` ile kullanıcı onayı alır, ardından `decideQuote` API çağrısı yapar. Başarılıysa toast bildirimi gösterir ve sayfayı yeniler; başarısızsa hata toast'u gösterir.

**Fiyat Hesaplama Mantığı**:
Toplam tutar, yalnızca tüm kalemlerin `unit_price` değerine sahip olduğu ve tüm kalemlerin aynı para biriminde olduğu durumlarda hesaplanır. Farklı para birimleri varsa veya bazı kalemlerin fiyatı yoksa toplam `null` olarak kalır — bu, kısmi toplamların yanıltıcı olmasını önler.

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

### [N1_NASIL] AST Pointer: QuoteDetailPage.tsx::QuoteDetailPage
- **params**: ()
- **ic_degiskenler**:
  - `user` — useAuth hook'undan alınan kullanıcı bilgisi, kimlik doğrulama için kullanılır
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, uluslararasılaştırma için kullanılır
  - `lang` — useI18n hook'undan alınan dil bilgisi, format fonksiyonlarına parametre olarak geçilir
  - `Routes` — useLocalizedRoutes hook'undan alınan lokalize edilmiş rota nesnesi, navigasyon için kullanılır
  - `router` — useRouter hook'undan alınan Next.js router nesnesi, programlı navigasyon için kullanılır
  - `searchParams` — useSearchParams hook'undan alınan URL arama parametreleri nesnesi
  - `quoteId` — searchParams'dan 'id' parametresinin değeri, teklifin benzersiz tanımlayıcısı
  - `quote` — useState ile yönetilen QuoteWithItems tipinde teklif verisi veya null
  - `loading` — useState ile yönetilen boolean, veri yükleme durumunu takip eder
  - `deciding` — useState ile yönetilen boolean, karar alma işleminin devam ettiğini gösterir
  - `load` — useCallback ile tanımlanan asenkron fonksiyon, teklif detayını yükler
  - `statusLabel` — parametre alan fonksiyon, duruma göre çevrilmiş etiket döndürür
  - `statusClass` — parametre alan fonksiyon, duruma göre CSS sınıf adı döndürür
  - `handleDecision` — parametre alan asenkron fonksiyon, teklif kabul/red işlemini yönetir
  - `allPriced` — boolean, tüm kalemlerin fiyatlanıp fiyatlanmadığını kontrol eder
  - `currencies` — Set nesnesi, kalemlerdeki para birimlerini toplar
  - `singleCurrency` — string veya null, tüm kalemlerde tek para birimi varsa o birimi tutar
  - `total` — number veya null, tüm kalemlerin fiyatlı ve tek para biriminde ise toplam tutar
  - `actions` — string array, mevcut duruma göre izin verilen müşteri aksiyonları
- **Dönüş**: JSX (React bileşeni)

### [N2_NASIL] AST Pointer: QuoteDetailPage.tsx::load
- **params**: ()
- **ic_degiskenler**:
  - `detail` — getQuoteDetail asenkron fonksiyonundan dönen teklif detay verisi
- **Dönüş**: Promise<void> (yan etkiler: quote state'ini günceller, hata durumunda toast gösterir)

### [N3_NASIL] AST Pointer: QuoteDetailPage.tsx::useEffect
- **params**: ()
- **ic_degiskenler**:
  - `user` — useAuth'dan gelen kullanıcı nesnesi, varsa yükleme işlemi başlatılır
  - `load` — useCallback ile tanımlanan yükleme fonksiyonu, user mevcutsa çağrılır
- **Dönüş**: void (yan etkiler: component mount veya dependency değiştiğinde load fonksiyonunu çağırır)

### [N4_NASIL] AST Pointer: QuoteDetailPage.tsx::statusLabel
- **params**: `(s: string)` — durum string'i parametresi
- **ic_degiskenler**:
  - `s` — durum değerini temsil eden string parametre
- **Dönüş**: string (çevrilmiş durum etiketi)

### [N5_NASIL] AST Pointer: QuoteDetailPage.tsx::statusClass
- **params**: `(s: string)` — durum string'i parametresi
- **ic_degiskenler**:
  - `s` — durum değerini temsil eden string parametre
- **Dönüş**: string (duruma göre CSS sınıf adı)

### [N6_NASIL] AST Pointer: QuoteDetailPage.tsx::handleDecision
- **params**: `(decision: 'accepted' | 'rejected')` — karar tipi parametresi
- **ic_degiskenler**:
  - `quote` — mevcut teklif verisi (eğer null ise erken dönüş)
  - `confirmKey` — karar tipine göre çeviri anahtarı
  - `decision` — parametre olarak gelen karar ('accepted' veya 'rejected')
- **Dönüş**: Promise<void> (yan etkiler: decideQuote çağırır, toast gösterir, load fonksiyonunu çağırarak state'i günceller)

### [N7_NASIL] AST Pointer: QuoteDetailPage.tsx::quote.items.map
- **params**: `(item)` — QuoteItem tipinde teklif kalemi parametresi
- **ic_degiskenler**:
  - `item` — map fonksiyonuna parametre olarak gelen teklif kalemi nesnesi
- **Dönüş**: JSX (tablo satırı)

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