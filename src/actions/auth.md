---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\actions\auth.ts
skeleton_hash: b555f38881aa12f9
generated_at: 2026-05-23T21:47:08Z
---

## Genel Bakış
`src/actions/auth.ts` modülü, kullanıcı giriş sürecini yöneten tek bir asenkron eylem fonksiyonu içerir. Bu fonksiyon, giriş formundan gelen verileri alır, arka uç kimlik doğrulama servisiyle iletişim kurar ve işlem sonucunu `AuthActionState` tipinde döndürür. Modül, uygulamanın oturum yönetimi katmanına veri sağlayarak giriş işlemlerinin merkezi bir noktada işlenmesini sağlar.

## Fonksiyon Grupları
### Kimlik Doğrulama İşlemi
Bu grup, kullanıcı giriş formundan alınan verileri işleyerek kimlik doğrulama servisine gönderir ve oturum durumunu günceller.
- loginAction

(Grup içinde tek fonksiyon bulunduğu için diğer fonksiyonlarla doğrudan bir çağrı ilişkisi yoktur.)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### loginAction
**Ne yapar**: Kullanıcı giriş işlemini gerçekleştiren bir sunucu eylemidir. Form aracılığıyla gönderilen kimlik bilgilerini alır, doğrular ve kimlik doğrulama sürecini başlatır.
**Nasıl yapar**: İlk parametre olarak önceki durum bilgisini (genellikle başlangıçta `null` veya daha önceki bir hata durumu) alır. İkinci parametre olarak giriş formundaki alanları içeren `FormData` nesnesini alır. Bu verileri kullanarak kullanıcıyı doğrular, başarılı veya başarısız sonuca göre `AuthActionState` türünde bir nesne döndürür.
**Parametreler**:
- `_prevState: AuthActionState | null` — Önceki eylem durumu; başlangıçta genellikle `null` olup, hata durumlarında bir önceki hatayı taşıyabilir.
- `formData: FormData` — Kullanıcının giriş formunda doldurduğu alanları (ör. e-posta, parola) içeren veri yapısı.
**Dönüş**: `Promise<AuthActionState>` — İşlemin sonucunu belirten asenkron bir dönüş değeri. Başarılı girişte kullanıcı bilgilerini içeren bir durum, başarısız girişte ise hata bilgilerini içeren bir durum döndürür.

---

## INTERFACES

### AuthActionState
- `success?: boolean`
- `error?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/actions/auth.ts::loginAction
- **params**: `_prevState: AuthActionState | null` (gövdede kullanılmamış), `formData: FormData`
- **ic_degiskenler**: 
  - `email` — `formData.get('email')` ile alınan e-posta adresi (string)
  - `password` — `formData.get('password')` ile alınan şifre (string)
  - `error` — `supabase.auth.signInWithPassword` çağrısından dönen hata nesnesi (yoksa `null`)
- **Dönüş**: `Promise<AuthActionState>` — giriş başarılıysa `{ success: true }` döner ve `revalidatePath('/', 'layout')` ile sayfa önbelleği temizlenir; form alanları eksikse `{ error: 'Email ve şifre zorunludur.' }`; Supabase hatası durumunda `{ error: error.message }`; beklenmedik hata durumunda `{ error: 'Beklenmedik bir hata oluştu.' }` döner.

---

## NODE ID STANDARD

  file: src\actions\auth.ts
  function: src\actions\auth.ts::loginAction

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthActionState
  export: loginAction