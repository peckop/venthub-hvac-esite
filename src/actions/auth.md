---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\actions\auth.ts
skeleton_hash: b555f38881aa12f9
entity_hashes:
  func:loginAction: c7a355d296759a37
  overview: 73ce20828c8a34de
generated_at: 2026-05-28T22:34:48Z
---

## Genel Bakış
`src/actions/auth.ts` modülü, Venthub HVAC uygulamasının kullanıcı kimlik doğrulama süreçlerini yöneten merkezi bir sunucu eylemleri modülüdür. Kullanıcı giriş işlemini tek bir yapılandırılmış fonksiyon aracılığıyla yürütür, oturum yönetimi katmanına işlem sonuçlarını standart bir formatta iletir.

## Fonksiyon Grupları
### Giriş İşlemi Yönetimi
Bu grup, kullanıcı giriş formundan alınan verileri işleyerek kimlik doğrulama sürecini yürütür, başarılı veya başarısız işlem sonuçlarını yapılandırılmış bir durum nesnesi olarak döndürür.
- loginAction

---

## AXIOMS – Mimari Varsayımlar
Kullanıcı giriş sürecini yöneten bu kimlik doğrulama aksiyon modülünün doğru çalışması için giriş verilerinin beklenen formatta gönderilmesi, bağlı olduğu kimlik doğrulama servisinin erişilebilir olması ve tükettiği oturum yönetimi katmanının döndürülen durum nesnesini doğru işlemesi zorunludur.

[Aksiyom 1]: Eğer loginAction fonksiyonuna iletilen FormData nesnesi kimlik doğrulama için gerekli tüm alanları içermiyorsa, arka uç kimlik doğrulama isteği gönderilemez, tüm giriş denemeleri başarısız olur.
[Aksiyom 2]: Eğer loginAction'ın iletişim kurması gereken arka uç kimlik doğrulama servisi ağ veya servis hatası nedeniyle erişilebilir değilse, hiçbir kullanıcı için geçerli oturum oluşturulamaz, tüm giriş istekleri hata ile sonuçlanır.
[Aksiyom 3]: Eğer loginAction'a gönderilen _prevState parametresi, tanımlanan AuthActionState tipinde veya null değilse, önceki giriş denemelerine ait hata bilgileri veya state verileri doğru işlenemez, form validasyon süreçleri çalışmaz.
[Aksiyom 4]: Eğer uygulamanın oturum yönetimi katmanı bu modül tarafından döndürülen AuthActionState tipindeki durum nesnesini doğru yorumlayamıyorsa, başarılı giriş sonrası oturum açılamaz veya başarısız giriş durumlarında kullanıcıya doğru hata mesajı gösterilemez.

---

## FONKSİYON DETAYLARI

### loginAction
**Ne yapar**: Kullanıcıdan gelen e‑posta ve şifre bilgilerini doğrulayıp, Supabase kimlik doğrulama servisi üzerinden oturum açma işlemini gerçekleştirir. Başarılı ya da hatalı sonuçları `AuthActionState` nesnesi olarak döndürür.

**Nasıl yapar**:  
1. `formData` içinden `email` ve `password` alanlarını alır.  
2. Alanlardan biri eksikse, hata mesajı içeren bir `AuthActionState` döner.  
3. Supabase’ın `signInWithPassword` metodunu `await` ederek kimlik doğrulamayı dener.  
4. Supabase’dan bir `error` gelirse, hata mesajını döner; aksi takdirde `revalidatePath` ile ana sayfa önbelleğini yeniler ve başarı işareti verir.  
5. İstisna yakalanırsa, genel bir hata mesajı döndürülür.

**Parametreler**:
- `_prevState`: AuthActionState | null — Önceki aksiyon durumunu temsil eder; bu fonksiyon içinde kullanılmaz.
- `formData`: FormData — HTTP isteğiyle gelen form verilerini tutar; `email` ve `password` alanlarını içerir.

**Dönüş**: Promise\<AuthActionState\> — Asenkron olarak `error` (string) veya `success` (boolean) alanlarından birini içeren bir nesne döner.

---

## INTERFACES

### AuthActionState
- `success?: boolean`
- `error?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/actions/auth.ts::loginAction
- **params**: `_prevState: AuthActionState | null`, `formData: FormData`
- **ic_degiskenler**:
  - `email` — `formData.get('email')` ile alınan kullanıcı e-posta adresi (string)
  - `password` — `formData.get('password')` ile alınan kullanıcı şifresi (string)
  - `error` — `supabase.auth.signInWithPassword()` çağrısından destructure edilen hata nesnesi; varsa `error.message` dönüş nesnesine yazılır
- **Dönüş**: `Promise<AuthActionState>` — başarılıysa `{ success: true }`, hata varsa `{ error: string }` döndürür.

---

## NODE ID STANDARD

  file: src\actions\auth.ts
  function: src\actions\auth.ts::loginAction

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthActionState
  export: loginAction