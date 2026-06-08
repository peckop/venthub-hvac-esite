---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\ensureSessionFresh.ts
skeleton_hash: f34dd9fb935a7aac
entity_hashes:
  func:ensureSessionFresh: 28037b5d7337277a
  overview: 7e306322f9d1fbb3
generated_at: 2026-06-08T08:57:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin istemci tarafında kullanıcının oturumunun güncelliğini ve geçerliliğini korumakla sorumludur. Tek bir asenkron fonksiyonla, oturumun süresinin dolmasını önlemek veya süresi dolmuş oturumları güvenli bir şekilde yenilemek için gerekli kontrolleri ve tetiklemeleri merkezi olarak yönetir.

## Fonksiyon Grupları
### Oturum Sürekliliği Yönetimi
Modülün tek ve temel sorumluluğunu yerine getiren, oturum tazeliğini denetleyen ve gerekirse yenileme işlemini başlatan işlevi içerir.
- ensureSessionFresh

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen bilgiler (fonksiyon imzası ve modül sabitleri) aksiyom üretmek için yeterli değildir.

**Neden:**
- Fonksiyon gövdesi (implementation) paylaşılmamıştır
- Sadece `ensureSessionFresh()` fonksiyon imzası mevcuttur (parametresiz, dönüş tipi belirsiz)
- Modül sabitleri tanımlanmamıştır
- Aksiyomlar yalnızca fonksiyon gövdesinden türetilebilir; docstring, yorum veya isimlendirmeden bilgi çıkarılamaz

**Sonuç:** Fonksiyonun gerçek uygulaması (gövdesi) paylaşıldığında mimari varsayımlar üretilebilir.

---

## FONKSİYON DETAYLARI

### ensureSessionFresh
**Ne yapar**: Supabase oturumunun geçerliliğini kontrol eder ve token süresi dolmak üzereyken oturumu otomatik olarak yeniler. Bu sayede kullanıcılar uzun süreli oturumlarda beklenmedik auth hatalarıyla karşılaşmaz ve kesintisiz bir deneyim yaşanır.

**Nasıl yapar**: Fonksiyon önce `supabase.auth.getSession()` çağrısıyla mevcut oturumu alır. Eğer oturum yoksa hiçbir işlem yapmadan geri döner. Oturum mevcutsa, token'ın sona erme zamanını (`expires_at`) Unix timestamp olarak alır ve o anki zamanla karşılaştırarak kalan süreyi hesaplar. Kalan süre `REFRESH_MARGIN_SEC` sabitinin altındaysa, token süresi dolmak üzere veya dolmuş demektir ve `supabase.auth.refreshSession()` ile otomatik yenileme yapılır. Tüm işlemler bir try-catch bloğu içindedir; hata oluşursa `console.warn` ile sessizce loglanır ve uygulamanın veri çekme süreçleri engellenmez.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `Promise<void>` — Fonksiyon asenkron çalışır ve anlamlı bir değer dönmez. Yenileme işlemi başarılı olsa da olmasa da çağrıyı tamamlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/lib/ensureSessionFresh.ts::ensureSessionFresh`
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `session` — `supabase.auth.getSession()` çağrısının `data.session` alanından destructure edilen oturum nesnesi; `null` veya `undefined` ise fonksiyon erken döner
  - `data` — `supabase.auth.getSession()` sonucundaki üst seviye data nesnesi, `{ session }` daha fazla destructure edilir
  - `expiresAt` — `session.expires_at` değerinden atanan Unix timestamp (saniye); oturumun sona erme zamanını tutar, `undefined` ise erken dönülür
  - `nowSec` — `Math.floor(Date.now() / 1000)` ifadesinden elde edilen mevcut zamanın Unix timestamp karşılığı saniye cinsinden
  - `remaining` — `expiresAt - nowSec` hesaplamasıyla bulunan oturumun kalan süresi saniye cinsinden; `REFRESH_MARGIN_SEC` sabitinden küçükse token yenilenir
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.warn` ile `[ensureSessionFresh] refresh failed:` ön ekine bağlanarak loglanır
- **Dönüş**: `Promise<void>` — geri dönüş değeri yoktur; yan etki olarak supabase oturumunu kontrol eder ve gerekirse yeniler
- **Referans sabitler**: `REFRESH_MARGIN_SEC` — fonksiyon gövdesinde `remaining < REFRESH_MARGIN_SEC` koşulunda kullanılır, tanımlı olduğu yerde `0` olarak verilmişti; token yenileme eşiğini belirler

---

## NODE ID STANDARD

  file: src\lib\ensureSessionFresh.ts
  function: src\lib\ensureSessionFresh.ts::ensureSessionFresh

---

## DISA AKTARILANLAR (EXPORTS)
  export: ensureSessionFresh