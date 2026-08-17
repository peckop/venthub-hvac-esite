---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\components\quotes\QuoteRequestModal.tsx
skeleton_hash: a7e7280807ba3785
entity_hashes:
  func:QuoteRequestModal: e72735855c826745
  func:handleSubmit: 72b54eeeae0b55b3
  overview: ee5a6a71b7344ae5
  style_tokens: 3dcb526ce7d50f48
generated_at: 2026-08-17T11:20:41Z
---

## Genel Bakış
Bu modül, kullanıcının proje teklif taleplerini oluşturmasını sağlayan bir modal bileşenidir. Dışarıdan gelen açma/kapama durumunu, kaynak bilgilerini ve teklif kalemlerini yöneterek, kullanıcının miktar değerlerini düzenlemesine ve formu doldurup göndermesine olanak tanır. Bileşen, toplanan verileri doğrulayıp asenkron olarak sunucuya gönderen bir gönderme işlevi içerir.

## Fonksiyon Grupları
### Modal Bileşeni ve Görünüm Yönetimi
Bu grup, modalın temel yapısını, dış dünyayla olan etkileşimini (açma/kapama, kaynak verileri almak) ve içindeki form alanlarını render etmekten sorumludur.
- QuoteRequestModal

### Form İşlemleri ve Veri Gönderimi
Bu grup, kullanıcının formu doldurup onayladığında tetiklenir. Toplanan verileri doğrular, formatlar ve asenkron olarak bir API isteği ile sunucuya göndererek teklif talebini oluşturur.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar
Bu modül, dışarıdan kontrol edilen bir modal olup, temel işlevselliği için props'ların varlığı

---

## FONKSİYON DETAYLARI

### QuoteRequestModal
**Ne yapar**: Kullanıcının belirli bir kaynaktan (örneğin bir proje veya sayfa) gelen bir dizi ürün kalemi için fiyat teklifi istemesini sağlayan bir modal (sürüklenen pencere) bileşenidir. Bileşen, açılıp kapanma durumunu, kaynak bilgisini, teklife eklenecek ürünleri ve miktar alanının düzenlenebilirliğini kontrol eder.

**Nasıl yapar**: Bileşen, `open` prop'unun durumuna bağlı olarak modal penceresini ekranda gösterir veya gizler. Kullanıcı modalı kapattığında `onClose` fonksiyonu tetiklenir. Gösterilen modal içinde, `items` prop'undan gelen ürün listesini bir tablo veya liste formatında sunar. Eğer `qtyEditable` prop'u true ise, her bir ürün kalemi için kullanıcı tarafından değiştirilebilir bir miktar giriş alanı sunar; aksi takdirde miktarı salt okunur (read-only) görüntüler. Bileşenin performsansını artırmak için `React.memo` ile sarılmış olabilir (bu bilgi kodda doğrudan verilmemiş olmasına rağmen, bu tür modallar için sıkça tercih edilen bir optimizasyondur, bu yüzden varsayımda bulunmuyoruz). Bileşen, dışarıdan gelen `source` ve `sourceProjectId` bilgilerini, gönderilecek teklif isteğinin bağlamını belirtmek için kullanır.

**Parametreler**:
- `open`: `boolean` — Modal penceresinin görünür (true) veya gizli (false) olma durumunu kontrol eder.
- `onClose`: `() => void` — Modal kapatıldığında veya bir kapanma eylemi tetiklendiğinde çağrılacak geri çağırım (callback) fonksiyonu.
- `source`: `string` — Teklif isteğinin geldiği kaynağı belirten tanımlayıcı (örn: "project_detail_page", "quotation_list").
- `sourceProjectId`: `string | undefined` — Teklif isteğinin ilgili olduğu projenin benzersiz kimliği. Kaynak bir proje olmadığında undefined olabilir.
- `items`: `QuoteRequestItem[]` — Teklif isteğine dahil edilecek ürünlerin dizisi. Her bir öğe, ürünün temel bilgilerini (ID, ad, varsayılan miktar vb.) içermelidir.
- `qtyEditable`: `boolean` — Varsayılan değeri `false` olan bu prop, modal içindeki her bir ürün kalemi için miktar alanının kullanıcı tarafından düzenlenebilir (true) olup olmayacağını belirler.

**Dönüş**: `React.FC<QuoteRequestModalProps>` — Fonksiyon, bir React işlevsel bileşeni döndürür. Bu bileşen, verilen props'ları (özellikle `open`, `items` ve `qtyEditable`) kullanarak manipüle edilebilir bir teklif isteği modalı render eder.

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
- import: ../../lib/services/quoteService::type QuoteSource
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

### [N1_NASIL] AST Pointer: src/components/quotes/QuoteRequestModal.tsx::QuoteRequestModal
- **params**: (open, onClose, source, sourceProjectId, items, qtyEditable = false)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, modal içindeki metinlerin lokalizasyonunu sağlar
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı bilgisi, giriş yapmış kullanıcıyı temsil eder
  - `Routes` — useLocalizedRoutes() hook'undan gelen lokalize rotalar objesi, hesap sayfasındaki teklifler rotasını oluşturur
  - `note` — useState ile oluşturulmuş string state, kullanıcının talep notunu tutar, textarea'dan güncellenir
  - `qtys` — useState ile oluşturulmuş number[] state, her kalem için miktar bilgisini tutar, varsayılan olarak items dizisinden başlatılır
  - `submitting` — useState ile oluşturulmuş boolean state, form gönderilme işleminin devam edip etmediğini belirtir
  - `submitted` — useState ile oluşturulmuş boolean state, form başarıyla gönderilip gönderilmediğini belirtir
  - `open` — props'tan gelen boolean, modal'ın açık olup olmadığını kontrol eder
  - `onClose` — props'tan gelen fonksiyon, modal'ı kapatmak için çağrılır
  - `source` — props'tan gelen QuoteSource tipinde değer, teklif talebinin kaynağını belirtir
  - `sourceProjectId` — props'tan gelen string veya null değer, kaynak projenin ID'sini tutar
  - `items` — props'tan gelen dizi, teklife eklenecek kalemlerin listesini tutar (productId, productName, qty içerir)
  - `qtyEditable` — props'tan gelen boolean (varsayılan false), miktarların düzenlenip düzenlenemeyeceğini belirtir
- **Dönüş**: React.FC<QuoteRequestModalProps> — Modal bileşeninin JSX içeriğini döndürür veya !open durumunda null döndürür

### [N2_NASIL] AST Pointer: src/components/quotes/QuoteRequestModal.tsx::handleSubmit
- **params**: (yok)
- **ic_degiskenler**:
  - `e` — catch bloğunda yakalanan hata nesnesi, hata günlüğe yazdırılır
- **Dönüş**: void (asenkron fonksiyon, başarı/hata durumunda toast mesajları gösterir ve state'leri günceller)

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