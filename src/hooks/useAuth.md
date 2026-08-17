---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useAuth.ts
skeleton_hash: 8bee269d3e6af457
entity_hashes:
  func:useAuth: d77303020f71d360
  overview: 71c8310fd4b630c4
generated_at: 2026-06-19T20:47:53Z
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
**Ne yapar**: `useAuth`, React bileşenlerinden kimlik doğrulama bağlamını (AuthContext) güvenli bir şekilde tüketen bir custom hook'tur. Bileşenin AuthProvider kapsamı dışında kaldığı durumlarda (örneğin statik build'ler veya izole test ortamları) çalışmayı bozan hataların önüne geçmek için güvenli bir yedek nesne döndürür.

**Nasıl yapar**: Fonksiyon, React'ın `useContext` hook'unu kullanarak `AuthContext` değerine erişir. Bağlamın `undefined` olup olmadığını kontrol eder — bu durum bileşenin AuthProvider ağacının dışında kaldığını gösterir. Eğer bağlam tanımsızsa, önceden tanımlanmış `AUTH_FALLBACK` sabitini döndürür; aksi takdirde orijinal bağlam nesnesini döndürür. Bu sayede hiçbir zaman `undefined` bir değerle çalışılmaz ve runtime hataları engellenir.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `context` — `AuthContext` tipinde bir nesne döndürür. Bu nesne kullanıcı bilgisi (user info), oturum (session), rol (role), yükleme durumları (loading states) ve kimlik doğrulama fonksiyonlarını (auth functions) içerir. Bağlam tanımsız olduğunda `AUTH_FALLBACK` sabiti döndürülür; bu nesne tüm bu alanları güvenli, no-op (işlem yapmayan) değerlerle doldurulmuştur.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/AuthContextDefinition::AuthContext
- import: react::useContext

---

## SABİTLER
- **AUTH_FALLBACK** (object) — `{
  user: null,
  session: null,
  role: null,
  loading: false,
  roleL...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useAuth.ts::useAuth
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — React AuthContext değerini useContext hook'u ile sağlayan değişken
- **Dönüş**: `context` (AuthContext nesnesi) veya `AUTH_FALLBACK` (statik fallback nesnesi)

---

## NODE ID STANDARD

  file: src\hooks\useAuth.ts
  function: src\hooks\useAuth.ts::useAuth

---

## DISA AKTARILANLAR (EXPORTS)
  export: useAuth