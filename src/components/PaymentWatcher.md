---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\PaymentWatcher.tsx
skeleton_hash: 7050f48919ee7325
generated_at: 2026-05-23T22:19:25Z
---

## Genel Bakış
PaymentWatcher modülü, ödeme durumlarını izleyen ve kullanıcıya ilgili bilgileri sunan bir React bileşenidir. Bu bileşen, ödeme takibi gerektiren arayüzlerde kullanıcıya güncel durum ve uyarılar sağlar.

## Fonksiyon Grupları
### Bileşen Tanımı
Bileşenin ana yapısını ve davranışını tanımlayan fonksiyondur.
- PaymentWatcher

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### PaymentWatcher
**Ne yapar**: Bir React fonksiyonel bileşeni tanımlar.  
**Nasıl yapar**: Fonksiyon imzası `() => React.FC` şeklindedir; bileşen render edildiğinde JSX döndürür.  
**Parametreler**: Yok  
**Dönüş**: `React.ReactElement | null` türünde bir JSX elementi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::PaymentWatcher
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — useRouter sonucu, sayfa navigasyonu için kullanılan nesne
  - `checkingRef` — useRef(false) ile oluşturulan referans, kontrol işleminin zaten yapılıp yapmadığını takip eder
  - `timerRef` — useRef<number | null>(null) ile oluşturulan referans, periyodik kontrol için setInterval kimliğini tutar
  - `pathname` — usePathname sonucu, mevcut URL'nin path kısmı
  - `checkOnce` — useCallback ile memoize edilmiş async fonksiyon, ödeme durumunu kontrol eder
  - `STORAGE_KEY` — dışarıdan alınan sabit, localStorage'da sipariş bilgisinin saklandığı anahtar
- **Dönüş**: null (JSX elementi render etmez)

### [N2_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::checkOnce
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `checkingRef` — dışarıdan kapatılan ref, kontrolün tekrar girmesini engeller
  - `STORAGE_KEY` — dışarıdan alınan sabit, localStorage anahtarı
  - `localStorage` — tarayıcı depolama nesnesi, getItem/removeItem ile veri okunur ve silinir
  - `raw` — localStorage.getItem(STORAGE_KEY) sonucu, JSON string veya null
  - `data` — JSON.parse(raw || '{}') sonucu, orderId ve conversationId içeren nesne
  - `orderId` — data.orderId, supabase sorgusunda kullanılan sipariş kimliği
  - `supabase` — dinamik import('../lib/supabase') sonucu elde edilen supabase istemcisi
  - `row` — supabase sorgusundan dönen veri, status alanı içerir
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `router` — dışarıdan kapatılan navigation nesnesi, yönlendirme yapmak için kullanılır
- **Dönüş**: Promise<void> (async fonksiyon, açıkça bir değer döndürmez)

### [N3_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `checkOnce` — dışarıdan kapatılan callback, odak/visibilite olaylarında tetiklenir
  - `onFocus` — window focus olayı için tanımlanan fonksiyon, checkOnce'u çağırır
  - `onVisibility` — document visibilitychange olayı için tanımlanan fonksiyon, sayfa görünür olduğunda checkOnce'u çağırır
  - `window` — tarayıcı window nesnesi, focus eventi dinleyici eklemek/çıkarmak için kullanılır
  - `document` — tarayıcı document nesnesi, visibilitychange eventi dinleyici eklemek/çıkarmak için kullanılır
  - `raw` — localStorage.getItem(STORAGE_KEY) sonucu, bekleyen sipariş olup olmadığını kontrol eder
  - `timerRef` — dışarıdan kapatılan ref, setInterval kimliğini tutar
- **Dönüş**: cleanup fonksiyonu (useEffect tarafından döndürülen temizleme işlevi)

### [N4_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::cleanup function (useEffect return)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — tarayıcı window nesnesi, focus eventi dinleyicisini kaldırmak için kullanılır
  - `document` — tarayıcı document nesnesi, visibilitychange eventi dinleyicisini kaldırmak için kullanılır
  - `onFocus` — daha önce eklenen focus olayı işleyici
  - `onVisibility` — daha önce eklenen visibilitychange olayı işleyici
  - `timerRef` — dışarıdan kapatılan ref, aktif interval kimliğini tutar
- **Dönüş**: (yok) — fonksiyon bir değer döndürmez, sadece temizleme yapar

---

## NODE ID STANDARD

  file: src\components\PaymentWatcher.tsx
  function: src\components\PaymentWatcher.tsx::PaymentWatcher

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentWatcher