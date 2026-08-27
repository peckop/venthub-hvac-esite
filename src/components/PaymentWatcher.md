---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\PaymentWatcher.tsx
skeleton_hash: 46f9d1c3d77ead53
entity_hashes:
  func:PaymentWatcher: 50650d649c0e5bdb
  overview: 933db85f944b5101
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T13:06:38Z
---

## Genel Bakış
PaymentWatcher modülü, uygulama genelinde ödeme durumunu arka planda sürekli olarak izleyen bir React bileşenidir. Kullanıcıya herhangi bir arayüz göstermeden, belirli aralıklarla ödeme durumunu kontrol ederek ilgili durumlarda otomatik yönlendirmeler veya durum güncellemeleri yapar. VentHub HVAC projesinde ödeme süreçlerinin takip edilmesini ve gerekli durum güncellemelerinin yapılmasını sağlar.

## Fonksiyon Grupları
### Bileşen Tanımı ve İzleme Mantığı
Modülün temel yapısını ve periyodik izleme mekanizmasını tanımlayan ana bileşen fonksiyonunu içerir. Ödeme ile ilgili değişiklikleri izleyerek ilgili bileşenlere veya servislere bildirimlerde bulunur.
- PaymentWatcher

## Bağımlılıklar ve Mimari Notlar

**Dış Bağımlılıklar:**
- React kütüphanesi ve bileşen hiyerarşisi (React Runtime) — yoksa bileşen doğru şekilde render edilmez
- React Context veya global state kaynağı (Redux, Zustand vb.) — yoksa izlenecek ödeme siparişlerine erişim sağlanamaz ve işlevselliği çalışmaz
- Tarayıcı ortamı (veya React DOM/SSR ortamı) — yoksa bileşen DOM'a bağlanamaz ve periyodik izleme döngüsü başlatılamaz

**İç Bağımlılıklar:**
- Modül tek bir fonksiyondan oluştuğundan iç bağımlılık bulunmuyor

**Dinamik/Lazy Yükleme:**
- Kaynakta bu yönde bir bilgi yer almıyor

**Mimari Önem:**
- Kullanıcıya görünmez (headless) bir bileşendir; arayüz sunmaz, yalnızca arka plan izleme işlevi görür
- Uygulama genelinde ödeme durumu yönetiminin merkezi noktasıdır; ödeme akışının sağlıklı ilerlemesi bu bileşenin çalışmasına bağlıdır

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, fonksiyon gövdesine dayalı özel bir aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### PaymentWatcher
**Ne yapar**: 3DS ödeme doğrulama penceresinden dönemeyen müşterileri kurtaran bir güvenlik ağı bileşenidir. Ödeme sürecinde kullanıcı 3DS doğrulama sayfasına yönlendirildiğinde ve çeşitli nedenlerle (tarayıcı kapanması, bağlantı kesilmesi vb.) ana uygulamaya geri dönemediğinde, bekleyen sipariş durumunu kontrol ederek kullanıcının kaybolmasını önlemeyi amaçlar.

**Nasıl yapar**: Bileşen, `vh_pending_order` anahtarını kontrol ederek bekleyen bir sipariş olup olmadığını sorgular. Ancak kaynakta belirtildiği üzere bu bileşen 2026-08-15 tarihine kadar HİÇ çalışmadı. Bunun birinci sebebi tetikleyicisinin olmamasıdır: `vh_pending_order` anahtarını kodun hiçbir yerine YAZMIYORDU; dokuz kullanımın hepsi yalnızca `getItem` ve `removeItem` çağrılarından oluşuyordu. Bu durum `raw` değişkeninin daima `null` olmasına ve dolayısıyla erken çıkış yapılmasına neden oluyordu. Bileşen bir React fonksiyonel bileşeni (`React.FC`) olarak tanımlanmıştır.

**Parametreler**:
- Bu fonksiyon parametre almaz (boş parantez ile çağrılmıştır).

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür. Bu bileşen, ödeme akışında güvenlik ağı görevi görerek 3DS sürecinden dönemeyen kullanıcıların sipariş durumlarının korunmasını sağlar.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useCheckoutPayment::PENDING_ORDER_KEY
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useRef

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::PaymentWatcher
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — `useRouter()` ile elde edilen Next.js router nesnesi; ödeme durumuna göre sayfa yönlendirmelerinde kullanılır
  - `checkingRef` — `useRef(false)` ile oluşturulan boolean referans; aynı anda birden fazla kontrol çalışmasını engellemek için kilit bayrağı olarak kullanılır
  - `timerRef` — `useRef<number | null>(null)` ile oluşturulan interval ID referansı; periyodik kontrol zamanlayıcısının temizlenmesi için saklanır
  - `pathname` — `usePathname()` ile elde edilen mevcut URL yolu; useEffect bağımlılığında kullanılır
  - `checkOnce` — `useCallback` ile sarılmış async fonksiyon; bekleyen siparişin ödeme durumunu Supabase üzerinden kontrol eder
- **Dönüş**: `null` — React bileşeni olarak hiçbir UI öğesi üretmez, yalnızca yan etki (side effect) çalıştırır

### [N2_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::checkOnce
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `raw` — `localStorage.getItem(PENDING_ORDER_KEY)` ile okunan ham string; bekleyen sipariş verisini temsil eder, yoksa fonksiyondan çıkılır
  - `data` — `JSON.parse(raw || '{}')` ile parse edilen nesne; `{ orderId?: string, conversationId?: string }` tipindedir
  - `orderId` — `data.orderId` alanından alınan sipariş numarası stringi; yoksa fonksiyondan çıkılır
  - `supabase` — `await import('../lib/supabase/client')` ile lazy yüklenen `supabaseBrowserClient`; Supabase veritabanı sorguları için kullanılır
  - `row` — `supabase.from('venthub_orders').select('payment_status').eq('id', orderId).maybeSingle()` sorgusundan dönen veri nesnesi
  - `error` — aynı Supabase sorgusundan dönen hata nesnesi; yoksa ödeme durumu kontrolü yapılır
  - `row.payment_status` — siparişin ödeme durumu stringi; `'paid'` ise başarı sayfasına, `'failed'` ise hata sayfasına yönlendirilir
- **Dönüş**: yok (void) — yan etki olarak localStorage temizliği ve `router.push` ile sayfa yönlendirmesi yapar

### [N3_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onFocus` — `window` üzerindeki `focus` olayını dinleyen arrow fonksiyon; pencere odaklandığında `checkOnce()` çağırır
  - `onVisibility` — `document` üzerindeki `visibilitychange` olayını dinleyen arrow fonksiyon; `document.visibilityState === 'visible'` olduğunda `checkOnce()` çağırır
  - `raw` — `localStorage.getItem(PENDING_ORDER_KEY)` ile okunan ham string; bekleyen sipariş varsa periyodik interval kurulur
- **Dönüş**: cleanup fonksiyonu — `focus` ve `visibilitychange` event listener'larını kaldırır, `timerRef.current` varsa `window.clearInterval` ile zamanlayıcıyı temizler

### [N4_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::onFocus
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: yok — `checkOnce()` çağrısını tetikler

### [N5_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::onVisibility
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: yok — `document.visibilityState === 'visible'` koşulu sağlanırsa `checkOnce()` çağrısını tetikler

### [N6_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::useEffect cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: yok — `window.removeEventListener('focus', onFocus)`, `document.removeEventListener('visibilitychange', onVisibility)` ve `timerRef.current` varsa `window.clearInterval(timerRef.current)` işlemlerini gerçekleştirir

---

## NODE ID STANDARD

  file: src\components\PaymentWatcher.tsx
  function: src\components\PaymentWatcher.tsx::PaymentWatcher

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentWatcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)