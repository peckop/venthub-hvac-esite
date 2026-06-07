---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\router.ts
skeleton_hash: e9ecfccf339fa630
entity_hashes:
  func:clearClaimsCacheCookie: baefb8519ef63f63
  func:createRedirectResponse: 05310081a4cd5ade
  func:decryptClaims: 2068430aed6e8d59
  func:encryptClaims: 76648dff74640cd4
  func:getCryptoKey: 31659864bb2e78d3
  func:resolveUserClaims: d4caa44069b031aa
  func:setClaimsCacheCookie: ec602be634499d82
  overview: efa2eee8e5e3339c
generated_at: 2026-06-07T14:03:33Z
---

## Genel Bakış
Bu modül, bir Next.js uygulamasında kullanıcı oturum yönetimi ve yönlendirme işlemleri için gerekli yardımcı (utility) fonksiyonları içerir. Temel olarak, kullanıcının kimlik doğrulama bilgilerini (claims) güvenli bir şekilde şifreleyip çözmeyi, bunları önbellek cookie'si ile yönetmeyi ve isteklere uygun yönlendirme yanıtları oluşturmayı sağlar.

## Fonksiyon Grupları
### Kripto İşlemleri
Bu grup, hassas kullanıcı bilgilerinin (claims) güvenli bir şekilde şifrelenmesi ve çözülmesi için gerekli kripto anahtarı yönetimini ve asimetrik şifreleme mantığını barındırır.
- getCryptoKey, encryptClaims, decryptClaims

### Kullanıcı İddiası Çözümleme
Bu grup, bir HTTP isteğindeki (request) kullanıcı bilgilerini (claims) çözmek için merkezi bir işlev sunar. Farklı kaynaklardan (cookie önbelleği veya doğrudan istemci) veri almayı ve hatasıyla birlikte sonuç döndürmeyi yönetir.
- resolveUserClaims

### Cookie Yönetimi
Bu grup, çözülmüş kullanıcı bilgilerinin önbelleğe alınması veya temizlenmesi için HTTP yanıtındaki (response) cookie'leri ayarlar veya siler.
- setClaimsCacheCookie, clearClaimsCacheCookie

### Yönlendirme Yardımcıları
Bu grup, bir kullanıcıyı yeni bir URL'ye yönlendirmek için uygun format ve durum koduna sahip HTTP yanıt nesneleri oluşturur.
- createRedirectResponse

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcı kimlik doğrulama claim'lerini (yetkilendirme bilgilerini) şifreleme, çözümleme ve cookie üzerinden yönetme sorumluluğunu üstlenir. Modülün doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `secret` parametresi, kriptografik işlemler için yeterli entropi (rastgelelik ve uzunluk) içermiyorsa, üretilen anahtar (`getCryptoKey`) zayıf olur ve şifreleme (`encryptClaims`, `decryptClaims`) güvenli değildir. Bu durumda, saldırganlar şifrelenmiş claim'leri çözebilir.

[Aksiyom 2]: Eğer `encryptClaims` ve `decryptClaims` fonksiyonları çağrılırken kullanılan `secret` parametreleri birbirinden farklıysa, `decryptClaims` fonksiyonu, daha önce `encryptClaims` ile şifrelenmiş bir `cookieValue`'yu başarıyla çözemez. Bu durumda fonksiyon hata üretir veya geçersiz veri döner.

[Aksiyom 3]: Eğer `resolveUserClaims` fonksiyonuna geçirilen `supabase` nesnesinin `auth.getClaims` metodu çağrılamazsa (örn. fonksiyon tanımsızsa veya promise reddedilirse), kullanıcının mevcut claim'leri (sessions, roller vb.) sunucudan alınamaz. Bu durumda, `resolveUserClaims` hata fırlatır veya varsayılan/boş bir claim seti ile devam eder.

[Aksiyom 4]: Eğer `setClaimsCacheCookie` fonksiyonuna geçirilen `maxAgeSeconds` parametresi, bir tarayıcı cookie'si için geçerli (0'dan büyük) bir süreyi temsil etmiyorsa (örn. negatif veya `Infinity`), cookie'nin süresi tarayıcı tarafından hemen sona erdirilir veya belirsiz hale gelir. Bu durumda, cache cookie'si beklenen süreyi koruyamaz.

[Aksiyom 5]: Eğer `decryptClaims` fonksiyonuna geçirilen `cookieValue`, `encryptClaims` fonksiyonunun output formatına (örn. Base64-URL encoded, belirli bir JSON yapısı) uymuyorsa, çözümleme işlemi başarısız olur. Bu durumda fonksiyon `null`, boş bir nesne veya bir hata fırlatır.

[Aksiyom 6]: Eğer `createRedirectResponse` fonksiyonuna geçirilen `targetUrl`, geçerli bir URL nesnesi veya string'i değilse (örn. boş string, `undefined` veya bozuk bir yapı), oluşan redirect response (`302`/`301` status kodu ile) tarayıcıyı geçersiz veya beklenmeyen bir hedefe yönlendirir. Bu durumda kullanıcı hedef sayfaya ulaşamaz.

[Aksiyom 7]: Eğer `setClaimsCacheCookie` veya `clearClaimsCacheCookie` fonksiyonlarına

---

## FONKSİYON DETAYLARI

### getCryptoKey
**Ne yapar**: Verilen bir gizli metin dizesinden (secret) AES kriptoografik anahtarı türetir. Bu işlem,Edge ortamlarıyla uyumlu Web Crypto API kullanılarak gerçekleştirilir.

**Nasıl yapar**: Secret dizisini UTF-8 byte dizisine dönüştürür, SHA-256 algoritması ile deterministik bir hash (dize parmak izi) üretir. Elde edilen 256-bit hash değerini, AES-GCM algoritması için ‘raw’ formatında import ederek, şifreleme ve şifre çözümü için kullanılabilecek bir CryptoKey nesnesi oluşturur.

**Parametreler**:
- `secret`: string — Anahtar türetme için kullanılacak gizli dize.

**Dönüş**: `Promise<CryptoKey>` — AES-GCM algoritması için kullanılabilecek, ‘encrypt’ ve ‘decrypt’ izinlerine sahip CryptoKey nesnesi.

### encryptClaims
**Ne yapar**: Bir claims (talep) nesnesini AES-GCM algoritması ile şifreler, oluşturulan şifreli veriyi Base64URL formatına dönüştürerek bir token string’i üretir.

**Nasıl yapar**: Claims nesnesini JSON stringine dönüştürür ve byte dizisine çevirir. Rastgele 12 byte uzunluğunda bir başlatma vektörü (IV) üretir. CryptoKey ile AES-GCM şifreleme işlemi yapar. Oluşturulan rastgele IV ile şifreli veriyi tek bir byte dizisinde birleştirir. Son olarak, bu byte dizisini Base64URL formatına (URL'lerde güvenli, padding'siz) dönüştürür.

**Parametreler**:
- `claims`: Record<string, unknown> — Şifrelenecek anahtar-değer çiftlerinden oluşan nesne.
- `secret`: string — Kriptoografik anahtarı türetmek için kullanılacak gizli dize.

**Dönüş**: `Promise<string>` — Base64URL ile kodlanmış, IV ve şifreli veriyi içeren tek bir string.

### decryptClaims
**Ne yapar**: Base64URL kodlanmış bir AES-GCM token'ını çözer ve claims nesnesine dönüştürür. Şifreleme başarısız olursa (imza geçersizse, veriler değiştirilmişse veya secret yanlış/expiry ise) null döner.

**Nasıl yapar**: Base64URL string'ini standart Base64'e ve ardından byte dizisine geri dönüştürür. Byte dizisinin en az 12 byte (IV uzunluğu) olup olmadığını kontrol eder. İlk 12 byte'ı IV olarak, geri kalanını şifreli veri olarak ayırır. CryptoKey ve IV ile AES-GCM şifre çözümü yapar. Çözülmüş byte'ları UTF-8 stringine ve ardından JSON nesnesine dönüştürür. İşlem sırasında oluşabilecek herhangi bir hatayı yakalar ve null döner.

**Parametreler**:
- `cookieValue`: string — Base64URL ile kodlanmış, çözülecek token.
- `secret`: string — Kriptoografik anahtarı türetmek için kullanılacak gizli dize.

**Dönüş**: `Promise<Record<string, unknown> | null>` — Başarılı olursa claims nesnesi, başarısız olursa `null`.

### resolveUserClaims
**Ne yapar**: Kullanıcı claims bilgisini önbellekten veya Supabase istemcisinden çözer. Önce HTTP cookie'sindeki şifreli önbelleği kontrol eder, geçerli claims yoksa Supabase'den taze bilgi çeker ve önbelleği günceller.

**Nasıl yapar**: İstek cookie'sindeki ‘sb-claims-cache’ değerini alır ve `decryptClaims` ile çözmeyi dener. Çözülen claims içinde `user_role` alanı varsa, bu bilgiyi ‘cache’ kaynağından döner. Önbellek miss (bulunamadı/hatalı) ise, `supabase.auth.getClaims()` çağrısıyla sunucudan taze claims alır. Başarılı olursa claims’i `encryptClaims` ile şifreler ve `setClaimsCacheCookie` ile yanıt nesnesinde 15 dakikalık (900 saniye) bir cookie olarak saklar.

**Parametreler**:
- `request`: NextRequest — Mevcut HTTP isteği (cookie'leri okumak için).
- `response`: NextResponse — Önbellek cookie'sinin ayarlanacağı HTTP yanıtı.
- `supabase`: `{ auth: { getClaims: () => Promise<{ data: { claims: Record<string, unknown> | null } | null; error: unknown }> } }` — Kullanıcı claims'ini almak için Supabase client instance.
- `secret`: string — Kriptoografik anahtarı türetmek için kullanılacak gizli dize.

**Dönüş**: `Promise<{ claims: Record<string, unknown> | null; error: unknown; source: 'cache' | 'client' }>` — Çözülen claims, varsa hata ve bilginin kaynak bilgisini (önbellek veya istemci) içeren nesne.

### setClaimsCacheCookie
**Ne yapar**: HTTP-only, güvenli ve belirli bir ömre sahip claims önbellek cookie'sini HTTP yanıtına ekler.

**Nasıl yapar**: `response.cookies.set` metodunu kullanarak ‘sb-claims-cache’ adında bir cookie ayarlar. Cookie, sadece HTTP istekleriyle gönderilir (`httpOnly: true`), production ortamında sadece HTTPS üzerinden gönderilir (`secure`), CSRF saldırılarına karşı ‘lax’ sameSite politikası uygulanır ve belirtilen `maxAgeSeconds` süresince tarayıcıda kalır.

**Parametreler**:
- `response`: NextResponse — Cookie'nin ekleneceği HTTP yanıtı.
- `cookieValue`: string — Cookie'nin değeri (genellikle şifreli claims token'ı).
- `maxAgeSeconds`: number — Cookie'nin tarayıcıda kalma süresi (saniye cinsinden, varsayılan: 900).

**Dönüş**: Yok (void).

### clearClaimsCacheCookie
**Ne yapar**: Claims önbellek cookie'sini hemen silmek için HTTP yanıtına ekler. Çıkış (logout) işlemlerinde çağrılmalıdır.

**Nasıl yapar**: `response.cookies.set` metodunu kullanarak ‘sb-claims-cache’ cookie’sini boş bir değerle ve `maxAge: 0` ile ayarlayarak tarayıcıdan anında silinmesini sağlar. Diğer güvenlik ayarları (`httpOnly`, `secure`, `sameSite`) korunur.

**Parametreler**:
- `response`: NextResponse — Cookie'nin silineceği HTTP yanıtı.

**Dönüş**: Yok (void).

### createRedirectResponse
**Ne yapar**: Mevcut bir HTTP yanıtındaki (örn., bir middleware yanıtında) tüm header'ları ve cookie'leri koruyarak yeni bir yönlendirme (redirect) yanıtı oluşturur. Bu, kimlik doğrulama veya kiracı (tenant) bilgisi içeren cookie'lerin yönlendirme sırasında kaybolmasını önler.

**Nasıl yapar**: Belirtilen URL ve durum koduyla yeni bir `NextResponse.redirect` nesnesi oluşturur. `responseToCopyFrom` parametresinden gelen yanıtın tüm cookie'lerini (`getAll()`) yeni yanıta kopyalar. Aynı şekilde, tüm header'ları da (`forEach`) yeni yanıta aktarır.

**Parametreler**:
- `request`: NextRequest — Yönlendirme isteği (mevcut API için gerekli, ancak işlevde doğrudan kullanılmıyor).
- `targetUrl`: string | URL — Yönlendirme yapılacak hedef URL.
- `responseToCopyFrom`: NextResponse — Header ve cookie'lerin kopyalanacağı kaynak yanıt.
- `status`: number — Yönlendirme HTTP durum kodu (varsayılan: 302).

**Dönüş**: `NextResponse` — Tüm header ve cookie'leri korunmuş yönlendirme yanıtı.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/router.ts::getCryptoKey
- **params**: (secret: string)
- **ic_degiskenler**:
    - `encoder` — Metinleri byte dizisine dönüştüren TextEncoder nesnesi
    - `secretBytes` — `secret` parametresinin byte dizisi karşılığı
    - `hash` — `secretBytes` değerinin SHA-256 ile hashlenmiş 256-bit hali
- **Dönüş**: Promise<CryptoKey>

### [N2_NASIL] AST Pointer: src/utils/router.ts::encryptClaims
- **params**: (claims: Record<string, unknown>, secret: string)
- **ic_degiskenler**:
    - `key` — `secret` kullanılarak oluşturulan şifreleme anahtarı (CryptoKey)
    - `encoder` — Metinleri byte dizisine dönüştüren TextEncoder nesnesi
    - `dataBytes` — `claims` nesnesinin JSON string halinin byte dizisi
    - `iv` — AES-GCM şifrelemesi için rastgele 12 byte'lık başlatma vektörü
    - `encryptedBuffer` — `dataBytes`'ın `iv` ile şifrelenmiş hali (ArrayBuffer)
    - `combined` — `iv` ve `encryptedBuffer`'ın birleştirilmiş byte dizisi
- **Dönüş**: Promise<string> (Base64URL formatında şifreli metin)

### [N3_NASIL] AST Pointer: src/utils/router.ts::decryptClaims
- **params**: (cookieValue: string, secret: string)
- **ic_degiskenler**:
    - `key` — `secret` kullanılarak oluşturulan şifreleme anahtarı (CryptoKey)
    - `base64` — `cookieValue`'nin Base64'e dönüştürülmüş hali (tire ve alt çizgi temizlenmiş)
    - `binary` — `base64` string'inin atob() ile çözülmüş ikili metin hali
    - `bytes` — `binary` metninin Uint8Array karşılığı
    - `iv` — `bytes` dizisinin ilk 12 byte'ı (başlatma vektörü)
    - `encryptedData` — `bytes` dizisinin 12. byte'dan sonuna kadar olan şifreli veri kısmı
    - `decryptedBuffer` — `encryptedData`'nın `iv` ile çözülmüş hali (ArrayBuffer)
    - `decryptedStr` — `decryptedBuffer`'ın TextDecoder ile metin string'e dönüştürülmüş hali
- **Dönüş**: Promise<Record<string, unknown> | null> (hata durumunda null)

### [N4_NASIL] AST Pointer: src/utils/router.ts::resolveUserClaims
- **params**: (request: NextRequest, response: NextResponse, supabase: { auth: { getClaims: () => Promise<{ data: { claims: Record<string, unknown> | null } | null; error: unknown }> } }, secret: string)
- **ic_degiskenler**:
    - `cachedCookie` — İstekten alınan 'sb-claims-cache' cookie değeri
    - `claims` — Önbellekten başarıyla çözülen veya Supabase'den alınan kullanıcı iddiaları (claims)
    - `data` — Supabase auth.getClaims() çağrısının successful sonucu (claims içeren nesne)
    - `error` — Supabase auth.getClaims() çağrısının hata sonucu
    - `encrypted` — `claims`'in `secret` ile şifrelenmiş hali (cookie için hazırlanmış)
- **Dönüş**: Promise<{ claims: Record<string, unknown> | null; error: unknown; source: 'cache' | 'client' }>

### [N5_NASIL] AST Pointer: src/utils/router.ts::setClaimsCacheCookie
- **params**: (response: NextResponse, cookieValue: string, maxAgeSeconds: number)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: response nesnesine cookie ekler)

### [N6_NASIL] AST Pointer: src/utils/router.ts::clearClaimsCacheCookie
- **params**: (response: NextResponse)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: response nesnesindeki cookie'yi siler)

### [N7_NASIL] AST Pointer: src/utils/router.ts::createRedirectResponse
- **params**: (request: NextRequest, targetUrl: string | URL, responseToCopyFrom: NextResponse, status: number)
- **ic_degiskenler**:
    - `redirectRes` — Yeni oluşturulacak ve döndürülecek yönlendirme yanıtı
- **Dönüş**: NextResponse (yeni yönlendirme yanıtı)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    router_ts__clearClaimsCacheCookie["clearClaimsCacheCookie"]
    router_ts__createRedirectResponse["createRedirectResponse"]
    router_ts__decryptClaims["decryptClaims"]
    router_ts__encryptClaims["encryptClaims"]
    router_ts__getCryptoKey["getCryptoKey"]
    router_ts__resolveUserClaims["resolveUserClaims"]
    router_ts__setClaimsCacheCookie["setClaimsCacheCookie"]
    router_ts__decryptClaims --> router_ts__getCryptoKey
    router_ts__resolveUserClaims --> router_ts__encryptClaims
    router_ts__resolveUserClaims --> router_ts__decryptClaims
    router_ts__encryptClaims --> router_ts__getCryptoKey
    router_ts__resolveUserClaims --> router_ts__setClaimsCacheCookie
```

## NODE ID STANDARD

  file: src\utils\router.ts
  function: src\utils\router.ts::getCryptoKey
  function: src\utils\router.ts::encryptClaims
  function: src\utils\router.ts::decryptClaims
  function: src\utils\router.ts::resolveUserClaims
  function: src\utils\router.ts::setClaimsCacheCookie
  function: src\utils\router.ts::clearClaimsCacheCookie
  function: src\utils\router.ts::createRedirectResponse

---

## DISA AKTARILANLAR (EXPORTS)
  export: clearClaimsCacheCookie
  export: createRedirectResponse
  export: decryptClaims
  export: encryptClaims
  export: getCryptoKey
  export: resolveUserClaims
  export: setClaimsCacheCookie