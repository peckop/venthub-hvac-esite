---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\actions\auth.ts
skeleton_hash: 3a5d9cd138c91154
entity_hashes:
  func:loginAction: c30804abb0cb7f33
  overview: d107b84c0f7e9bda
generated_at: 2026-06-06T19:22:29Z
---

## Genel Bakış
`src/actions/auth.ts` modülü, Venthub HVAC uygulamasının kullanıcı kimlik doğrulama süreçlerini yöneten sunucu taraflı eylem modülüdür. Kullanıcı giriş işlemlerini form verileri üzerinden alarak merkezi bir yapı ile işler ve sonuçları standartlaştırılmış durum nesneleri olarak döndürür.

## Fonksiyon Grupları
### Kimlik Doğrulama Eylemleri
Kullanıcı giriş formundan gelen verileri işleyerek kimlik doğrulama sürecini yönetir ve işlem sonucunu yapılandırılmış bir durum nesnesi olarak ilgili katmana iletir.
- loginAction

---

## AXIOMS – Mimari Varsayımlar

Bu kimlik doğrulama modülünün doğru çalışması için giriş formu verilerinin ve durum yönetimi altyapısının beklenen şekilde hazırlanmış olması gerekir.

[Aksiyom 1]: Eğer `formData` parametresi geçerli bir `FormData` nesnesi olarak sağlanmazsa, giriş işlemi yürütülemez ve fonksiyon hata ile karşılaşır.

[Aksiyom 2]: Eğer `formData` içinde kimlik doğrulama için gerekli alanlar (kullanıcı adı/e-posta ve şifre) mevcut değilse, kimlik doğrulama başarısız olur.

[Aksiyom 3]: Eğer `AuthActionState` tipi tanımlı değilse veya beklenen yapıda değilse, fonksiyon imzası derleme zamanında hata verir.

[Aksiyom 4]: Eğer oturum yönetimi katmanı (session management) erişilebilir değilse, başarılı kimlik doğrulama sonrası oturum başlatılamaz.

---

## FONKSİYON DETAYLARI

### loginAction

**Ne yapar**: Kullanıcının email ve şifresini kullanarak Supabase kimlik doğrulama sistemi üzerinden giriş yapmasını sağlar. Bu fonksiyon bir Next.js Server Action olarak tanımlanmıştır ve React'ın useActionState hook'u ile entegre çalışacak şekilde tasarlanmıştır.

**Nasıl yapar**: FormData nesnesinden email ve şifre bilgilerini çıkarır. Önce bu alanların dolu olup olmadığını kontrol eder, ardından createSupabaseServerClient() ile sunucu tarafı Supabase istemcisi oluşturur. Supabase auth.signInWithPassword metodunu çağırarak kimlik doğrulamasını gerçekleştirir. İşlem başarılı olduğunda revalidatePath ile sayfa önbelleğini yeniler ve success durumunu döner.

**Parametreler**:
- `_prevState`: AuthActionState | null — Önceki action durumunu temsil eder. React useActionState hook'unun ilk parametresi olarak kullanılır, bu fonksiyon tarafından doğrudan erişilmez (underscore prefix ile belirtilmiştir)
- `formData`: FormData — Formdan gelen verileri içeren nesne. 'email' ve 'password' alanlarını barındırır

**Dönüş**: Promise<AuthActionState> — İşlem sonucuna göre success: true veya error: string alanlarını içeren durum nesnesi döner. Hata durumunda kullanıcıya bilgilendirme mesajı, başarı durumunda success flag'i döner

---

## INTERFACES

### AuthActionState
- `success?: boolean`
- `error?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/actions/auth.ts::loginAction
- **params**: `_prevState: AuthActionState | null, formData: FormData`
- **ic_degiskenler**:
  - `email` — FormData nesnesinden `'email'` anahtarı ile alınan string değer, kullanıcının giriş e-posta adresi; boşsa doğrudan hata döner
  - `password` — FormData nesnesinden `'password'` anahtarı ile alınan string değer, kullanıcının giriş şifresi; boşsa doğrudan hata döner
  - `supabase` — `createSupabaseServerClient()` asenkron çağrısının sonucu, Supabase istemci nesnesi; oturum açma işlemleri için kullanılır
  - `error` — `supabase.auth.signInWithPassword({ email, password })` çağrısının destructuring ile çıkarılan hata alanı; giriş başarısızsa Supabase hata mesajını içerir
- **Dönüş**: `Promise<AuthActionState>` — Hata durumunda `{ error: string }`, başarı durumunda `{ success: true }` nesnesi döner; ayrıca `revalidatePath('/', 'layout')` çağrısı ile Next.js önbelleğini yeniler (yan etki)

---

## NODE ID STANDARD

  file: src\actions\auth.ts
  function: src\actions\auth.ts::loginAction

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthActionState
  export: loginAction