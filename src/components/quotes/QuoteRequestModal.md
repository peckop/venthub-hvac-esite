---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\components\quotes\QuoteRequestModal.tsx
skeleton_hash: e4240ffe1639866f
entity_hashes:
  func:QuoteRequestModal: e6c9fd90c331b096
  func:handleSubmit: 72b54eeeae0b55b3
  overview: f482945c338f8cdb
  style_tokens: 3dcb526ce7d50f48
generated_at: 2026-08-16T10:20:53Z
---

## Genel Bakış
Bu modül, kullanıcıdan proje teklif bilgilerini toplayan bir modal bileşenidir. Dışarıdan gelen açık/kapalı durumu, kaynak bilgisi ve teklif kalemlerini yöneterek, kullanıcının quantity değerlerini düzenlemesine ve formu onaylamasına olanak tanır. Onaylama işlemi, toplanan verileri sunucuya göndermekle sorumlu olan asenkron bir işlev tarafından gerçekleştirilir.

## Fonksiyon Grupları
### Modal Bileşeni ve Görünüm Yönetimi
Bu grup, modalın temel yapısını, dış dünyayla (açma/kapama, kaynak verileri) olan etkileşimini ve içindeki form alanlarını render etmekten sorumludur.
- QuoteRequestModal

### Form İşlemleri ve Veri Gönderimi
Bu grup, kullanıcının formu doldurup gönderdiğinde çalışır. Toplanan verileri doğrular, formatlar ve asenkron olarak bir API isteği ile sunucuya göndererek teklif talebini oluşturur.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar

Bu modül, teklif isteği modal bileşenidir. Aşağıdaki mimari varsayımlar fonksiyon imzalarından türetilmiştir.

**[Aksiyom 1]:** Eğer `open` prop'u falsy (true dışı) bir değer olarak sağlanırsa, modal bileşeni render edilmez (görünmez kalır) olur.

**[Aksiyom 2]:** Eğer `onClose` callback'i sağlanmazsa, modal'ı kapatma işlemi sonucu bileşen kararlı (consistent) durumunu kaybeder olur — çünkü kullanıcı modal'ı kapatamaz.

**[Aksiyom 3]:** Eğer `items` prop'u boş liste (`[]`) veya `undefined` olarak sağlanırsa, submit işlemi anlamsız olur olur — çünkü teklif istenecek kalem yoktur.

**[Aksiyom 4]:** Eğer `source` prop'u `undefined` olarak sağlanırsa, teklif isteğinin hangi kaynaktan geldiği bilinmez olur — bu durum backend tarafında kaynak reference'ının eksik kalmasına neden olur.

**[Aksiyom 5]:** Eğer `sourceProjectId` prop'u `undefined` olarak sağlanırsa, teklif isteği bir projeye bağlı olmadan (orphan) oluşturulur olur.

**[Aksiyom 6]:** Eğer `qtyEditable = true` ise, kullanıcı miktar (quantity) alanlarını düzenleyebilir olur; aksi halde (`qtyEditable = false`, varsayılan durum) miktar alanları salt okunur (read-only) olur.

**[Aksiyom 7]:** `handleSubmit` fonksiyonu `async` yapıda olduğundan, submit işlemi sırasında bir bekleme (loading) durumu yönetilmezse, kullanıcıya çift tıklama (double-submit) ile aynı anda birden fazla teklif isteği gönderilebilir olur.

---

## FONKSİYON DETAYLARI

### QuoteRequestModal
**Ne yapar**: Bu fonksiyon, teklif talep modal penceresini oluşturan bir React fonksiyonel bileşenidir. Kullanıcının teklif talebini oluşturmasını, mevcut kalemleri görüntülemesini ve gerekirse miktarları düzenlemesini sağlayan bir arayüz sağlar.

**Nasıl yapar**: Fonksiyon, bir React bileşeni olarak props'ları alır ve bir JSX yapısı döndürür. `open` prop'u modal'ın görünürlüğünü kontrol eder, `onClose` prop'u kapatma işlevini tetikler. `source` ve `sourceProjectId` prop'ları teklifin kaynağını belirlerken, `items` prop'u teklife eklenecek kalem listesini taşır. `qtyEditable` prop'u ise opsiyonel olarak miktarların düzenlenip düzenlenemeyeceğini belirler.

**Parametreler**:
- open: boolean — Modal'ın açık olup olmadığını kontrol eden mantıksal değer.
- onClose: () => void — Modal kapatıldığında çağrılacak geri çağırma işlevi.
- source: string — Teklif isteğinin geldiği kaynağı belirten tanımlayıcı dize.
- sourceProjectId: string — Teklifin ilişkili olduğu projenin kimliğini içeren dize.
- items: QuoteRequestItem[] — Teklife dahil edilecek kalem nesnelerinden oluşan dizi.
- qtyEditable: boolean — Varsayılan değer: false. Miktarların kullanıcının düzenlemesine izin verilip verilmeyeceğini belirler.

**Dönüş**: React.FC<QuoteRequestModalProps> — Fonksiyon, `QuoteRequestModalProps` arabirimini kullanan bir React fonksiyonel bileşeni döndürür.

### handleSubmit
**Ne yapar**: Bu fonksiyon, teklif talep formunun gönderilmesi işlemini yöneten asenkron bir işlevdir. Kullanıcının form verilerini toplar ve teklif isteğini sunucuya iletir.

**Nasıl yapar**: Fonksiyon `async` olarak tanımlanmıştır, bu da içinde `await` kullanarak asenkron işlemler (örneğin API istekleri) yapabileceğini gösterir. Fonksiyon gövdesi boş bir ok fonksiyonu (`() => void handleSubmit()`) olarak belirtilmiştir; bu, fonksiyonun gerçek implementasyonunun elsewhere'da (muhtemelen bir useCallback veya benzeri bir React hook içinde) tanımlandığını ima eder. İşlev çağrıldığında, form verilerini toplayacak, doğrulama yapacak ve ardından bir API isteği göndererek teklif isteğini sunucuya iletecektir.

**Parametreler**: Bu işlev parametre almaz.

**Dönüş**: void — İşlev bir değer döndürmez, yalnızca yan etkileri (API çağrısı, state güncellemesi) vardır.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/services/quoteService::createQuoteRequest
- import: ../../types/quotes.bridge::type { QuoteSource }
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::FileText
- import: lucide-react::Minus
- import: lucide-react::Plus
- import: lucide-react::XCircle
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### QuoteRequestModalItem
Teklif isteme modali — T067-VH v1 (cetvel: docs/standards/quote-standard.md §Q4). Giriş kapıları: PDP (tek kalem, adet düzenlenebilir) + sepet (fiyatsız kalemler). Teklif LOGIN'lidir; oturum yoksa buton katmanı (QuoteRequestButton) login'e yönlendirir, modal hiç açılmaz. Fiyat otoritesi (cetvel R5):
- `productId: string | null`
- `productName: string`
- `qty: number`

### QuoteRequestModalProps
- `open: boolean`
- `onClose: () => void`
- `source: QuoteSource`
- `sourceProjectId?: string | null`
- `items: QuoteRequestModalItem[]`
- `qtyEditable?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `QuoteRequestModal.tsx`::QuoteRequestModal
- **params**: `open`, `onClose`, `source`, `sourceProjectId`, `items`, `qtyEditable`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; bileşen içindeki tüm kullanıcıya dönük metinlerin lokalize edilmesini sağlar
  - `user` — `useAuth()` hook'undan dönen mevcut oturum açmış kullanıcı nesnesi; null olabilir, handleSubmit içinde oturum kontrolü için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen lokalize edilmiş rota nesnesi; gönderim sonrası yönlendirme için `Routes.account.quotes()` çağrılır
  - `note` — kullanıcının textarea'ya girdiği serbest metin notu; `useState('')` ile yönetilir, ilk kaleme eklenir
  - `qtys` — her kalem kalemi için miktar değerlerini tutan `number[]` dizisi; `useState` ile `items.map(i => i.qty)` başlangıç değeri alınır, +/- butonlarıyla güncellenir
  - `submitting` — form gönderim işleminin devam edip etmediğini belirten boolean; true iken submit butonu devre dışıdır ve spinner gösterilir
  - `submitted` — formun başarıyla gönderilip gönderilmediğini belirten boolean; true olduğunda başarı mesajı ve rota linki gösterilir
- **Dönüş**: JSX — modal dialog bileşeni (`<div>` sarmalayıcı) veya `open` false ise `null`

---

### [N2_NASIL] AST Pointer: `QuoteRequestModal.tsx`::useEffect callback (modal reset)
- **params**: (yok)
- **ic_degiskenler**: (yok — sadece dış kapsam state setter'larını çağırır)
  - Dış kapsam erişimleri: `open` (bağımlılık), `items` (bağımlılık), `setQtys`, `setNote`, `setSubmitted`
- **Dönüş**: yok — modal her açıldığında (`open` true olduğunda) form state'lerini sıfırlar: `qtys` dizisini `items`'ınqty değerlerine, `note`'u boş string'e, `submitted`'ı false'a çeker

---

### [N3_NASIL] AST Pointer: `QuoteRequestModal.tsx`::handleSubmit
- **params**: (yok)
- **ic_degiskenler**:
  - `e` — catch bloğunda yakalanan hata nesnesi; `console.error('Quote request error', e)` ile loglanır
  - Dış kapsam erişimleri: `user` (oturum kontrolü), `t` (toast çeviri metinleri), `setSubmitting` (gönderim durumu), `setSubmitted` (başarı durumu), `createQuoteRequest` (API servis fonksiyonu), `supabaseBrowserClient` (supabase istemcisi), `source` (talep kaynağı), `sourceProjectId` (proje ID), `items` (kalem listesi), `qtys` (miktar dizisi), `note` (not metni), `toast` (bildirim fonksiyonu)
- **Dönüş**: yok (async void) — yan etkileri: `createQuoteRequest` ile supabase'e teklif talebi oluşturur; `toast.success`/`toast.error` ile bildirim gösterir; `setSubmitted(true)` ile başarı durumunu aktive eder

---

### [N4_NASIL] AST Pointer: `QuoteRequestModal.tsx`::items.map callback (handleSubmit içi — veri hazırlama)
- **params**: `item` (tek bir kalem nesnesi), `idx` (dizideki indeks)
- **ic_degiskenler**: (yok — sadece parametre ve dış kapsam değişkenlerini okur)
  - Dış kapsam erişimleri: `qtys[idx]` (ilgili indeksteki miktar), `item.productId`, `item.productName`, `item.qty` (varsayılan miktar), `note` (not metni, `idx === 0` olduğunda trim edilir)
- **Dönüş**: `{ productId, productName, qty, note }` — `createQuoteRequest` API'sine gönderilecek kalem nesnesi

---

## NODE ID STANDARD

  file: src\components\quotes\QuoteRequestModal.tsx
  function: src\components\quotes\QuoteRequestModal.tsx::QuoteRequestModal
  function: src\components\quotes\QuoteRequestModal.tsx::handleSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuoteRequestModal
  export: QuoteRequestModalItem

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `bg-slate-900/40`, `bg-white`, `border-2`, `border-b`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-t`, `border-t-transparent`, `border-white`, `focus-visible:border-primary-navy`, `hover:bg-industrial-gray`, `hover:bg-slate-50`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `fixed`, `flex`, `gap-1.5`, `gap-2`, `gap-3`, `h-10`, `h-4`, `h-7`, `inline-block`, `inline-flex`, `items-center`, `justify-between`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `align-middle`, `animate-in`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-200`, `fade-in`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `focus-visible:ring-primary-navy/30`, `focus-visible:ring-primary-navy/50`, `focus-visible:ring-slate-200`, `font-bold`