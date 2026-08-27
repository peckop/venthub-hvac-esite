---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\PaymentWatcher.tsx
skeleton_hash: 90f59405bec9d434
entity_hashes:
  func:PaymentWatcher: 50650d649c0e5bdb
  overview: 933db85f944b5101
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T09:05:23Z
---

## Genel Bakış
PaymentWatcher modülü, ödeme durumunu arka planda sürekli olarak izleyen ve kullanıcıya arayüz göstermeden çalışan bir React bileşenidir. Belirli aralıklarla ödeme durumunu kontrol ederek ilgili durumlarda otomatik yönlendirmeler veya durum güncellemeleri yapar. Modül, React Runtime, geçerli bir state kaynağı ve tarayıcı ortamı gerektirir; bu ortamlar sağlanamazsa bileşen işlevselliğini yerine getirmez.

## Fonksiyon Grupları
### Bileşen Tanımı ve İzleme Mantığı
Modülün temel yapısını ve periyodik izleme mekanizmasını tanımlayan ana bileşen fonksiyonunu içerir. Bileşen, ödeme ile ilgili değişiklikleri izleyerek ilgili bileşenlere veya servislere bildirimlerde bulunur.
- PaymentWatcher

## Bağımlılıklar ve Mimari Notlar
- **İç bağımlılıklar**: Tek fonksiyonlu modül olduğundan iç bağımlılık bulunmuyor.
- **Dış bağımlılıklar**: React Runtime, React Context veya global state kaynağı (Redux, Zustand vb.) ve tarayıcı ortamı (React DOM) gerektirir.
- **Dinamik/lazy yükleme**: Kaynakta belirtilmemiş.
- **Mimari önem**: Uygulama genelinde ödeme süreçlerinin takibini sağlayan altyapı bileşenidir; ödeme durumu değişikliklerini yakalayıp sistemin geri kalanını bilgilendirir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, fonksiyon gövdesinden türetilebilecek mimari varsayımlar belirlenememiştir.

---

## FONKSİYON DETAYLARI

### PaymentWatcher
**Ne yapar**: 3DS ödeme doğrulama penceresinden dönemeyen müşterileri kurtaran bir güvenlik ağı bileşenidir. Ödeme sürecinde müşterinin 3DS sayfasından başarıyla dönemediği durumlarda, bekleyen sipariş durumunu kontrol ederek müşteriyi kurtarmayı amaçlar.

**Nasıl yapar**: Bileşen, `vh_pending_order` anahtarını localStorage'dan okuyarak çalışır. Ancak kaynakta belirtildiği üzere, bu bileşen 2026-08-15 tarihine kadar hiç çalışmadı — iki bağımsız sebeple: (1) Tetikleyicisi yoktu; `vh_pending_order` anahtarını kodun hiçbir yeri yazmıyordu (dokuz kullanımın hepsi `getItem`/`removeItem` idi), bu nedenle `raw` daima `null` oluyordu ve bileşen erken çıkış yapıyordu. Bileşen bir React fonksiyon bileşeni olarak tanımlanmıştır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `React.FC` — React fonksiyon bileşeni döndürür. Bileşen, 3DS ödeme sürecinde güvenlik ağı görevi görerek müşterilerin kaybolmasını önlemeyi amaçlar.

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
  - `router` — `useRouter()` ile alınan Next.js router nesnesi; sayfa yönlendirmelerinde kullanılır
  - `checkingRef` — `useRef(false)` ile oluşturulan boolean ref; `checkOnce` fonksiyonunun eşzamanlı olarak birden fazla kez çalışmasını engellemek için kilit bayrağı olarak kullanılır
  - `timerRef` — `useRef<number | null>(null)` ile oluşturulan number|null ref; `setInterval` ile dönen timer kimliğini tutar, temizleme işleminde kullanılır
  - `pathname` — `usePathname()` ile alınan mevcut URL yolu; useEffect bağımlılığında yer alır
  - `checkOnce` — `useCallback` ile oluşturulan async fonksiyon; bekleyen siparişin ödeme durumunu kontrol eder
- **Dönüş**: `null` — React bileşeni olarak ekrana bir şey render etmez

### [N2_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::checkOnce
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `raw` — `localStorage.getItem(PENDING_ORDER_KEY)` ile alınan ham string; bekleyen sipariş verisini içerir, yoksa fonksiyondan çıkılır
  - `data` — `JSON.parse(raw || '{}')` ile parse edilen nesne; `{ orderId?: string, conversationId?: string }` tipindedir
  - `orderId` — `data.orderId` alanından okunan sipariş numarası; yoksa fonksiyondan çıkılır
  - `supabase` — `await import('../lib/supabase/client')` ile dinamik olarak yüklenen `supabaseBrowserClient` nesnesi; veritabanı sorguları için kullanılır
  - `row` — `supabase.from('venthub_orders').select('payment_status').eq('id', orderId).maybeSingle()` sorgusundan dönen veri satırı; `payment_status` alanını içerir
  - `error` — aynı supabase sorgusundan dönen hata nesnesi; hata yoksa null/undefined olur
- **Dönüş**: yok — yan etki olarak `localStorage.removeItem(PENDING_ORDER_KEY)` çağrısı yapar ve `router.push` ile sayfa yönlendirmesi gerçekleştirir

### [N3_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onFocus` — `window` nesnesinin `focus` olayına eklenen callback fonksiyonu; pencere odaklandığında `checkOnce()` çağrısı yapar
  - `onVisibility` — `document` nesnesinin `visibilitychange` olayına eklenen callback fonksiyonu; `document.visibilityState === 'visible'` olduğunda `checkOnce()` çağrısı yapar
  - `raw` — `localStorage.getItem(PENDING_ORDER_KEY)` ile alınan ham string; bekleyen sipariş varsa periyodik kontrol interval'ı başlatmak için kontrol edilir
- **Dönüş**: cleanup fonksiyonu — `window.removeEventListener('focus', onFocus)`, `document.removeEventListener('visibilitychange', onVisibility)` ve `window.clearInterval(timerRef.current)` işlemlerini gerçekleştirir

### [N4_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::useEffect cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: yok — dışarıdan erişilen `onFocus`, `onVisibility` ve `timerRef` kullanılır
- **Dönüş**: yok — yan etki olarak `window.removeEventListener('focus', onFocus)`, `document.removeEventListener('visibilitychange', onVisibility)` ve koşullu olarak `window.clearInterval(timerRef.current)` çağrısı yapar

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