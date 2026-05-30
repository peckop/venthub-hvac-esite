---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx
skeleton_hash: 9e33076659465857
entity_hashes:
  func:AuthProvider: 8a171b0bec808d24
  overview: 60c35673d50b49a8
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-30T21:35:29Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı uygulamasında merkezi kimlik doğrulama bağlamını yöneten temel yapı taşlarından biridir. Uygulama genelinde oturum durumunu, kullanıcı bilgilerini ve ilgili yetkilendirme işlevlerini tek bir kaynaktan yöneterek tüm bileşenlere tutarlı erişim sağlar. Bu sayede kimlik doğrulama mantığı projenin her katmanında güvenli ve merkezi bir şekilde uygulanır.

## Fonksiyon Grupları
### Kimlik Doğrulama Context Sağlayıcısı
React'ın Context API yapısını kullanarak kimlik doğrulama durumunu ve işlevlerini uygulama ağacının tüm alt bileşenlerine dağıtan merkezi sağlayıcıyı temsil eder.
- AuthProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, yalnızca `AuthProvider({ children })` fonksiyon imzasından çıkarılabilecek yapısal gerekliliklere dayanır.

**[Aksiyom 1]:** Eğer `children` prop'u sağlanmazsa, `AuthProvider` bileşeni React ağacında hiçbir alt bileşen render etmez ve uygulama içeriği görünmez olur.

**[Aksiyom 2]:** Eğer `AuthProvider` React bileşen ağacının kök (root) seviyesindeki bir `<App>` veya benzeri üst bileşen içine yerleştirilmezse, alt bileşenler bu context'e erişemez ve kimlik doğrulama durumu paylaşılamaz.

**[Aksiyom 3]:** Eğer `AuthProvider` içinde消費edildiği (`useContext` ile erişildiği) alt bileşenler bu sağlayıcının alt ağacında konumlandırılmamışsa, context değeri `undefined` veya varsayılan başlangıç değeri olarak döner.

**[Aksiyom 4]:** Eğer `AuthProvider` bileşeninin iç durumu (state) başlatılamazsa (örn: useEffect içindeki asenkron işlemler başarısız olursa), kimlik doğrulama durumu tutarsız olur ve bileşenler geçersiz oturum verisi ile çalışır.

---

## FONKSİYON DETAYLARI

### AuthProvider

**Ne yapar**: AuthProvider, uygulama genelinde kimlik doğrulama (authentication) durumunu ve ilgili işlemleri sağlayan React bileşenidir. Bu bileşen, tüm alt bileşenlerin (children) kimlik doğrulama verilerine ve fonksiyonlarına erişmesini sağlayan React Context Provider olarak görev yapar.

**Nasıl yapar**: React Context API kullanarak authentication state'ini (kullanıcı oturum bilgisi, token, giriş/yapılandırma durumları) tüm alt bileşenlere prop drilling olmadan aktarır. Bileşen, AuthContext'in value prop'u ile sarmalanmış children bileşenlerini render eder. Tipik olarak giriş, çıkış, oturum kontrolü ve kullanıcı bilgisi alma gibi fonksiyonları context value içine dahil eder.

**Parametreler**:
- `children`: React.ReactNode — Provider bileşeninin içine yerleştirilen tüm alt React bileşenleri. Bu prop, kimlik doğrulama durumuna erişmesi gereken tüm alt bileşenleri kapsar.

**Dönüş**: `React.FC<{ children: React.ReactNode }>` — React Fonksiyonel Bileşeni döndürür. AuthContext.Provider ile sarmalanmış children bileşenlerini render eden bir React bileşeni sonucu verir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/contexts/AuthContext.tsx::AuthProvider
- **params**: `children` (React.ReactNode — React bileşen çocuğu)
- **ic_degiskenler**:
  - `user` — Aktif kullanıcı bilgilerini tutar (User veya null)
  - `session` — Supabase oturum bilgilerini tutar (Session veya null)
  - `role` — Kullanıcının rolünü tutar (UserRole veya null)
  - `loading` — İlk yükleme durumunu belirtir (true başlar)
  - `roleLoading` — Rol yükleme durumunu belirtir (false başlar)
  - `fetchRole` — useCallback ile tanımlanan, kullanıcının rolünü getiren fonksiyon
  - `signIn` — useCallback ile tanımlanan, email/password ile giriş yapan fonksiyon
  - `signUp` — useCallback ile tanımlanan, yeni kullanıcı kaydı yapan fonksiyon
  - `signOut` — useCallback ile tanımlanan, oturumu sonlandıran fonksiyon
  - `resetPassword` — useCallback ile tanımlanan, şifre sıfırlama isteği gönderen fonksiyon
  - `refreshSession` — useCallback ile tanımlanan, oturum yenileyen fonksiyon
  - `value` — useMemo ile oluşturulan, AuthContext.Provider'a geçirilen değer nesnesi
- **Dönüş**: `<AuthContext.Provider value={value}>{children}</AuthContext.Provider>` (JSX)

### [N2_NASIL] AST Pointer: src/contexts/AuthContext.tsx::fetchRole
- **params**: `userId` (string — kullanıcının ID'si), `email` (string, opsiyonel — kullanıcının emaili)
- **ic_degiskenler**:
  - `userRole` — getUserRole() çağrısından dönen kullanıcı rolü
- **Dönüş**: void (asenkron, promise)

### [N3_NASIL] AST Pointer: src/contexts/AuthContext.tsx::useEffect
- **params**: yok
- **ic_degiskenler**:
  - `getInitialSession` — İlk oturumu getiren asenkron iç fonksiyon
  - `subscription` — supabase.auth.onAuthStateChange() aboneliği, temizleme için kullanılır
- **Dönüş**: cleanup fonksiyonu (subscription.unsubscribe())

### [N4_NASIL] AST Pointer: src/contexts/AuthContext.tsx::getInitialSession
- **params**: yok
- **ic_degiskenler**:
  - `initialSession` — supabase.auth.getSession() çağrısından dönen ilk oturum
  - `error` — hata yakalama bloğundaki hata nesnesi
- **Dönüş**: void (asenkron, promise)

### [N5_NASIL] AST Pointer: src/contexts/AuthContext.tsx::authStateChangeCallback
- **params**: `event` (string — auth olay türü), `currentSession` (Session | null — mevcut oturum)
- **ic_degiskenler**:
  - `newUser` — currentSession.user'dan çıkarılan veya null olan kullanıcı nesnesi
- **Dönüş**: void (asenkron, promise)

### [N6_NASIL] AST Pointer: src/contexts/AuthContext.tsx::cleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N7_NASIL] AST Pointer: src/contexts/AuthContext.tsx::signIn
- **params**: `email` (string — kullanıcı emaili), `password` (string — kullanıcı şifresi)
- **ic_degiskenler**:
  - `data` — supabase.auth.signInWithPassword() çağrısından dönen veri
  - `error` — supabase.auth.signInWithPassword() çağrısından dönen hata
- **Dönüş**: `{ error?: AuthError }` veya `{}` (başarısızsa hata, başarılıysa boş nesne)

### [N8_NASIL] AST Pointer: src/contexts/AuthContext.tsx::signUp
- **params**: `email` (string — kullanıcı emaili), `password` (string — kullanıcı şifresi), `name` (string — kullanıcının tam adı)
- **ic_degiskenler**:
  - `error` — supabase.auth.signUp() çağrısından dönen hata
- **Dönüş**: `{ error?: AuthError }` veya `{}` (başarısızsa hata, başarılıysa boş nesne)

### [N9_NASIL] AST Pointer: src/contexts/AuthContext.tsx::signOut
- **params**: yok
- **ic_degiskenler**:
  - `error` — hata yakalama bloğundaki hata nesnesi
- **Dönüş**: void (asenkron, promise)

### [N10_NASIL] AST Pointer: src/contexts/AuthContext.tsx::resetPassword
- **params**: `email` (string — şifre sıfırlanacak email)
- **ic_degiskenler**:
  - `error` — supabase.auth.resetPasswordForEmail() çağrısından dönen hata
- **Dönüş**: `{ error?: AuthError }` veya `{}` (başarısızsa hata, başarılıysa boş nesne)

### [N11_NASIL] AST Pointer: src/contexts/AuthContext.tsx::refreshSession
- **params**: yok
- **ic_degiskenler**:
  - `refreshedSession` — supabase.auth.refreshSession() çağrısından dönen yenilenmiş oturum
  - `error` — hata yakalama bloğundaki hata nesnesi
- **Dönüş**: `Session | null` (yenilenmiş oturum veya hata durumunda null)

---

## NODE ID STANDARD

  file: src\contexts\AuthContext.tsx
  function: src\contexts\AuthContext.tsx::AuthProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthProvider

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