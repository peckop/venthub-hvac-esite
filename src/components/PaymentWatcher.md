---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\PaymentWatcher.tsx
skeleton_hash: 7050f48919ee7325
entity_hashes:
  func:PaymentWatcher: 0d799bcd7a7c68f4
  overview: 5bfe4be680217e97
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:44Z
---

## Genel Bakış
PaymentWatcher modülü, kullanıcı oturumu sırasında ödeme durumunu periyodik olarak izleyen ve gerekli durumlarda yönlendirme yapan bir React bileşenidir. Bileşen, arka planda sessizce çalışarak siparişlerin ödeme durumunu kontrol eder ve kullanıcıya doğrudan görünür bir arayüz sunmaz.

## Fonksiyon Grupları
### Bileşen Tanımı
Bileşenin temel yapısını, iç durumunu ve periyodik kontrol mekanizmasını tanımlayan ana fonksiyondur.
- PaymentWatcher

---



---

## FONKSİYON DETAYLARI

### PaymentWatcher

**Ne yapar**: PaymentWatcher, ödeme işlemlerinin durumunu izleyen bir React bileşenidir. VentHub HVAC projesinde ödeme süreçlerinin takip edilmesini ve gerekli durum güncellemelerinin yapılmasını sağlar.

**Nasıl yapar**: Bileşen, uygulama içinde ödeme ile ilgili değişiklikleri izleyerek ilgili bileşenlere veya servislere bildirimlerde bulunur. Ödeme durumlarındaki değişiklikleri yakalayıp gerektiğinde UI güncellemeleri veya tetikleyiciler oluşturur.

**Parametreler**:
- Parametre almamaktadır (props tanımlı değildir).

**Dönüş**: `React.FC` - Standart bir React işlevsel bileşeni olarak render edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: PaymentWatcher.tsx::PaymentWatcher
- **params**: ()
- **ic_degiskenler**:
  - `router` — useRouter() hook'unun dönüşü, Next.js programatik navigasyon (router.push) için
  - `checkingRef` — useRef(false), checkOnce'un eşzamanlı çalışmasını önleyen boolean lock
  - `timerRef` — useRef\<number | null\>(null), periyodik setInterval timer ID'sini tutan referans
  - `pathname` — usePathname() hook'unun dönüşü, mevcut URL path bilgisi
  - `checkOnce` — useCallback ile tanımlanmış async fonksiyon, sipariş ödeme durumunu Supabase'den kontrol eder
- **Dönüş**: `null` (React.FC — render edeceği bir JSX yok, sadece side-effect yönetimi yapar)

---

### [N2_NASIL] AST Pointer: PaymentWatcher.tsx::checkOnce (useCallback içindeki async fn)
- **params**: ()
- **ic_degiskenler**:
  - `raw` — localStorage.getItem(STORAGE_KEY) ile okunan ham JSON string; bekleyen sipariş verisi yoksa fonksiyon erken dönüş yapar
  - `data` — JSON.parse(raw || '{}') ile parse edilmiş nesne, `{ orderId?: string, conversationId?: string }` yapısında
  - `orderId` — `data.orderId`'den çıkarılan sipariş ID'si, Supabase sorgusunda filtre parametresi olarak kullanılır
  - `supabase` — `await import('../lib/supabase')` ile dinamik olarak yüklenen Supabase istemci nesnesi
  - `row` — `supabase.from('venthub_orders').select('status').eq('id', orderId).maybeSingle()` sorgusunun `data` dönüşü; venthub_orders tablosundan gelen tek satır, `row.status` alanı kontrol edilir (`'paid'` veya `'failed'`)
  - `error` — aynı Supabase sorgusunun `error` dönüşü; null ise sorgu başarılı demektir
- **Dönüş**: void (implicit) — localStorage temizler ve `router.push(...)` ile sayfa yönlendirmesi yapar (yan etki)

---

### [N3_NASIL] AST Pointer: PaymentWatcher.tsx::useEffect callback
- **params**: ()
- **ic_degiskenler**:
  - `onFocus` — window `focus` olay handler'ı; pencere odaklandığında `checkOnce()` çağırır
  - `onVisibility` — document `visibilitychange` olay handler'ı; `document.visibilityState === 'visible'` ise `checkOnce()` çağırır
  - `raw` — localStorage.getItem(STORAGE_KEY) ile okunan ham JSON string; eğer veri varsa periyodik kontrol (setInterval) başlatılır
- **Dönüş**: cleanup fonksiyonu — event listener'ları kaldırır ve interval timer'ı temizler

---

### [N4_NASIL] AST Pointer: PaymentWatcher.tsx::useEffect cleanup function
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `window.removeEventListener('focus', onFocus)`, `document.removeEventListener('visibilitychange', onVisibility)` ve `window.clearInterval(timerRef.current)` ile kaynakları serbest bırakır

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