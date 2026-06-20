---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\PaymentWatcher.tsx
skeleton_hash: 043ce5cffec8a10b
entity_hashes:
  func:PaymentWatcher: 0d799bcd7a7c68f4
  overview: cac0a3def1dcd9ec
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:10Z
---

## Genel Bakış
PaymentWatcher modülü, uygulama genelinde ödeme durumunu arka planda sürekli olarak izleyen bir React bileşenidir. Kullanıcıya herhangi bir arayüz göstermeden, belirli aralıklarla ödeme durumunu kontrol ederek ilgili durumlarda otomatik yönlendirmeler veya durum güncellemeleri yapar.

## Fonksiyon Grupları
### Bileşen Tanımı ve İzleme Mantığı
Modülün temel yapısını ve periyodik izleme mekanizmasını tanımlayan ana bileşen fonksiyonunu içerir. Bu grup, bileşenin iç durumunu, zamanlayıcı referanslarını ve durum kontrol mantığını bir arada yönetir.
- PaymentWatcher

---

## AXIOMS – Mimari Varsayımlar

PaymentWatcher modülü, parametre almayan bir React bileşenidir ve sadece fonksiyon imzasına dayalı sınırlı bilgi mevcuttur.

[Aksiyom 1]: Eğer React Runtime (React kütüphanesi ve bileşen hiyerarşisi) yoksa, bileşen doğru şekilde render edilmez.

[Aksiyom 2]: Eğer bileşen için geçerli bir React Context veya global state kaynağı (Redux, Zustand vb.) yoksa, PaymentWatcher'ın izleyeceği ödeme siparişlerine erişimi olmaz ve işlevselliği çalışmaz.

[Aksiyom 3]: Eğer tarayıcı ortamı (veya React DOM/Server-Side Rendering ortamı) yoksa, bileşen DOM'a bağlanamaz ve periyodik izleme döngüsü başlatılamaz.

---

## FONKSİYON DETAYLARI

### PaymentWatcher

**Ne yapar**: PaymentWatcher, ödeme işlemlerinin durumunu izleyen bir React bileşenidir. VentHub HVAC projesinde ödeme süreçlerinin takip edilmesini ve gerekli durum güncellemelerinin yapılmasını sağlar.

**Nasıl yapar**: Bileşen, uygulama içinde ödeme ile ilgili değişiklikleri izleyerek ilgili bileşenlere veya servislere bildirimlerde bulunur. Ödeme durumlarındaki değişiklikleri yakalayıp gerektiğinde UI güncellemeleri veya tetikleyiciler oluşturur.

**Parametreler**:
- Parametre almamaktadır (props tanımlı değildir).

**Dönüş**: `React.FC` - Standart bir React işlevsel bileşeni olarak render edilir.

---

## İTHALATLAR (IMPORTS)
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
  - `router` — useRouter() hook'undan gelen Next.js router instance'ı, programmatic navigasyon için kullanılır
  - `checkingRef` — useRef<boolean>, checkOnce'ın eşzamanlı çalışmasını engelleyen guard flag tutar
  - `timerRef` — useRef<number | null>, periyodik checkOnce çağrısını tutan interval ID'si
  - `pathname` — usePathname() hook'undan gelen mevcut URL path string'i
  - `checkOnce` — useCallback ile tanımlı async fonksiyon, localStorage'dan sipariş bilgisini okur ve Supabase'den sipariş durumunu kontrol eder
- **Dönüş**: JSX null döner (yarn component, yalnızca yan etkileri vardır)

### [N2_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::PaymentWatcher::checkOnce
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `raw` — localStorage.getItem(STORAGE_KEY) ile okunan ham JSON string'i veya null
  - `data` — JSON.parse(raw || '{}') sonucu elde edilen `{ orderId?: string, conversationId?: string }` tipinde parsed obje
  - `orderId` — data.orderId erişimi ile elde edilen sipariş ID string'i
  - `supabase` — dinamik import ile yüklenen supabaseBrowserClient instance'ı
  - `row` — supabase.from('venthub_orders').select('status').eq('id', orderId).maybeSingle() sorgusundan dönen veri satırı
  - `error` — aynı Supabase sorgusundan dönen hata nesnesi
- **Dönüş**: void (Promise<void)), fonksiyon localStorage temizler ve router.push ile navigasyon yapar

### [N3_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::PaymentWatcher::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onFocus` — window focus olayında checkOnce çağıran callback
  - `onVisibility` — document visibilitychange olayında visible ise checkOnce çağıran callback
  - `raw` — localStorage.getItem(STORAGE_KEY) ile okunan ham JSON string'i veya null, bekleyen sipariş olup olmadığını kontrol eder
- **Dönüş**: temizleme fonksiyonu döner — event listener'ları kaldırır ve interval'ı temizler

### [N4_NASIL] AST Pointer: src/components/PaymentWatcher.tsx::PaymentWatcher::useEffect_cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — yalnızca outer scope'taki onFocus, onVisibility ve timerRef kullanılır)
- **Dönüş**: void, event listener'ları ve interval'ı temizler

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