---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useAuth.ts
skeleton_hash: a4e9e5fa01c34aa4
entity_hashes:
  func:useAuth: b070102d665df675
  overview: 71c8310fd4b630c4
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı kullanıcı arayüzünde kimlik doğrulama süreçlerini merkezi olarak yöneten bir React özel hook'unu (useAuth) tanımlar. Tek bir hook aracılığıyla tüm bileşenlere oturum durumunu, giriş/çıkış fonksiyonlarını ve yetkilendirme kontrollerini tutarlı ve erişilebilir bir şekilde sunar.

## Fonksiyon Grupları
### Merkezi Kimlik Doğrulama Hook'u
Tüm kimlik doğrulama verilerini, oturum yönetimini ve yetkilendirme işlevlerini tek bir yapı altında sarmalayarak uygulama genelinde tekil bir erişim noktası oluşturur.
- useAuth

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediği için mimari aksiyom üretilememektedir. Sadece `useAuth()` fonksiyon imzası mevcut olup, hook'un iç mantığı, bağımlılıkları veya döndüğü yapı bilinmemektedir.

[Aksiyom 1]: Eğer fonksiyon gövdesi sağlanmazsa, hook'un hangi bağlam sağlayıcılara (Context Provider) bağımlı olduğu bilinemez.

[Aksiyom 2]: Eğer hook'un döndürdüğü yapı (return type) tanımlanmazsa, tüketicilerin hangi alanları ve fonksiyonları kullanabileceği bilinemez.

[Aksiyom 3]: Eğer auth state kaynağı (localStorage, sessionStorage, cookie, vs.) belirtilmezse, oturum süresinin nasıl yönetildiği ve sayfa yenilemelerinde durumun korunup korunmayacağı bilinemez.

---

## FONKSİYON DETAYLARI

### useAuth
**Ne yapar**: useAuth, React bileşenlerinden kimlik doğrulama bağlamını (AuthContext) güvenli bir şekilde tüketen özel bir React kancasıdır (hook). Fonksiyon, AuthProvider bileşeninin dışında (örneğin, statik site oluşturma procesleri veya izole test ortamları gibi) çağrıldığında bile uygulamanın çökmesini önleyen, no-op (işlem yapmayan) bir geri dönüş nesnesi sağlar.

**Nasıl yapar**: Fonksiyon, `useContext` hook'unu kullanarak en yakın `AuthContext` sağlayıcısından mevcut değerleri alır. Eğer `useContext` sonucu `undefined` ise, yani çağrının yapıldığı yer bir `AuthProvider` içinde değilse, tanımlı bir fallback (geri dönüş) nesnesi döndürür. Bu fallback nesnesi, tüm durum alanlarını (`user`, `session`, vb.) null veya false olarak başlatır ve tüm işlevleri (`signIn`, `signUp`, vb.) hata mesajı döndüren asenkron fonksiyonlar olarak tanımlar. Bağlam mevcutsa, doğrudan gerçek kimlik doğrulama bağlamı nesnesi döndürülür.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: `AuthContext` tipinde bir nesne. Bu nesne şu alan ve işlevleri içerir:
- `user`: Mevcut oturum açmış kullanıcının bilgileri veya kimlik doğrulama yapılmamışsa `null`.
- `session`: Aktif oturumun detayları veya `null`.
- `role`: Kullanıcının rolü veya `null`.
- `loading`: Kullanıcı bilgilerinin yüklenme durumu (`true`/`false`).
- `roleLoading`: Kullanıcı rolünün yüklenme durumu (`true`/`false`).
- `signIn`: E-posta ve şifre ile giriş yapan asenkron fonksiyon.
- `signUp`: Yeni kullanıcı kaydı yapan asenkron fonksiyon.
- `signOut`: Oturumu sonlandıran fonksiyon.
- `resetPassword`: Şifre sıfırlama isteği gönderen asenkron fonksiyon.
- `refreshSession`: Mevcut oturumu yenilemeye çalışan ve sonuç döndüren asenkron fonksiyon.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useAuth.ts::useAuth
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — React Context API ile AuthContext'ten alınan değer. Kimlik doğrulama durumu, kullanıcı bilgileri ve oturum yönetim fonksiyonlarını içerir.
- **Dönüş**: `context` nesnesi veya fallback nesnesi. Context tanımsızsa (statik build/izole ortam) `{ user, session, role, loading, roleLoading, signIn, signUp, signOut, resetPassword, refreshSession }` properties'leri ile varsayılan nesne döner. Değilse doğrudan context değeri döner.

---

## NODE ID STANDARD

  file: src\hooks\useAuth.ts
  function: src\hooks\useAuth.ts::useAuth

---

## DISA AKTARILANLAR (EXPORTS)
  export: useAuth