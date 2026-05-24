---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\ensureSessionFresh.ts
skeleton_hash: f34dd9fb935a7aac
generated_at: 2026-05-23T22:31:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin temel istemci kütüphanelerinden biri olarak kullanıcı oturumlarının sürekliliğini ve geçerliliğini korumakla sorumludur. Uygulama genelinde kesintisiz erişim sağlamak amacıyla aktif kullanıcı oturumlarının tazeliğini kontrol ederek gerekli durumlarda yenilenmesini tetikler.

## Fonksiyon Grupları
### Oturum Tazeleme İşlevleri
Modülün ana sorumluluğunu yerine getiren, oturum geçerlilik kontrolü ve yenileme işlemini yürüten tek işlevi barındırır.
- ensureSessionFresh

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcı kimlik doğrulama oturumlarının geçerliliğini sürdürmek için oturum tazeleme işlemlerini yönetir, çalışması için erişilebilir bir merkezi oturum deposu ve harici kimlik doğrulama servisi bağlantısı zorunludur.

[Aksiyom 1]: Eğer mevcut kullanıcı oturumunun değerlerini saklayan merkezi oturum deposuna erişim yoksa, oturumun süresi ve geçerliliği sorgulanamaz, modül hiçbir işlem gerçekleştiremez ve işlevsiz kalır.
[Aksiyom 2]: Eğer oturumları yenilemek için kullanılan harici kimlik doğrulama API'sine ağ erişimi yoksa, süresi dolmak üzere olan oturumlar tazelenemez, kullanıcı yetkisi sonlanır ve sisteme erişimi kesilir.
[Aksiyom 3]: Eğer modül çağrıldığında halihazırda devam eden bir oturum tazeleme işleminin durumu takip edilemiyorsa, aynı anda birden fazla paralel tazeleme isteği gönderilir, kaynak israfı oluşur ve oturum durumlarında çakışmalar meydana gelir.

---

## FONKSIYON DETAYLARI

### ensureSessionFresh
**Ne yapar**: VentHub HVAC projesinin istemci tarafı kimlik doğrulama sisteminde kullanılan, kullanıcının mevcut oturumunun (session) güncelliğini ve geçerliliğini denetleyen asenkron bir fonksiyondur. Oturumun süresinin dolmasını önlemek veya süresi dolmuş/geçersiz oturumları güvenli şekilde yönetmek için tüm temel oturum yönetimi işlemlerini yürütür.
**Nasıl yapar**: Öncelikle istemci tarafında depolanmış mevcut oturum verisini ilgili depolama alanından (oturum deposu veya yerel depolama) çeker. Oturuma ait son kullanma zaman damgasını anlık mevcut zamanla karşılaştırır, eğer oturum süresi dolmak üzereyse veya süresi dolmuşsa, projenin arka uç API'sine kayıtlı yenileme tokenı ile istek göndererek yeni erişim kimlik bilgileri ve güncel oturum verisini alır. Elde edilen yeni verilerle mevcut oturumu günceller, herhangi bir hatayla karşılaşması halinde geçersiz oturumu tamamen temizleyerek kullanıcının güvenli bir şekilde tekrar giriş yapmasını sağlar.
**Parametreler**:
Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: Promise<void> türünde asenkron bir dönüş değeri sunar. Oturum doğrulama ve yenileme işlemi başarıyla tamamlandığında boş bir değerle çözülen bir promise döndürür. İşlem sırasında oluşabilecek herhangi bir hata (API erişim hatası, geçersiz yenileme tokenı, depolama erişim hatası vb.) durumunda promise reddedilerek ilgili hata bilgisini iletir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\ensureSessionFresh.ts::ensureSessionFresh
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `session` — supabase oturum nesnesi, getSession çağrısından döner, oturumun varlığını ve son kullanma zamanını kontrol etmek için kullanılır
  - `expiresAt` — session nesnesinden alınan, oturumun sona erdiği saniye cinsinden unix zaman damgası
  - `nowSec` — fonksiyonun çalıştığı anın saniye cinsinden unix zaman damgası, kalan oturum süresini hesaplamak için kullanılır
  - `remaining` — oturumun bitmesine kalan toplam saniye sayısı, yenileme gerekliliğini kontrol etmek için kullanılır
  - `REFRESH_MARGIN_SEC` — oturumun yenilenmesi gereken süre eşiği, kalan süre bu değerin altındaysa oturum yenilenir
  - `err` — try bloğunda yakalanan hata nesnesi, konsola uyarı logu yazmak için kullanılır
- **API çağrıları**:
  - `supabase.auth.getSession()` — aktif supabase oturum bilgilerini almak için kullanılan supabase auth API çağrısı
  - `supabase.auth.refreshSession()` — süresi dolmak üzere olan oturumu yenilemek için kullanılan supabase auth API çağrısı
  - `console.warn()` — oturum yenileme hatasını konsola loglamak için kullanılan standart API çağrısı
- **Dönüş**: Promise<void>

---

## NODE ID STANDARD

  file: src\lib\ensureSessionFresh.ts
  function: src\lib\ensureSessionFresh.ts::ensureSessionFresh

---

## DISA AKTARILANLAR (EXPORTS)
  export: ensureSessionFresh