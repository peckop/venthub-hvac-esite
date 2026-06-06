---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx
skeleton_hash: ed9ae4563c42a06c
entity_hashes:
  func:AuthProvider: 8a171b0bec808d24
  overview: d5ddb976c954f5aa
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:55:29Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının React yapısında kimlik doğrulama süreçlerini merkezi olarak yöneten temel bir yapıdır. Tüm bileşenler arasında oturum durumu, kullanıcı verileri ve yetkilendirme işlevlerinin tutarlı ve güvenli bir şekilde paylaşılmasını sağlar.

## Fonksiyon Grupları
### Kimlik Doğrulama Sağlayıcı
React Context API kullanarak kimlik doğrulama durumunu ve ilgili yardımcı fonksiyonları uygulama ağaçının tüm alt bileşenlerine dağıtarak merkezi bir erişim noktası oluşturur.
- AuthProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (implementation) paylaşılmadığından, yalnızca fonksiyon imzasından çıkarılabilen temel aksiyomlar tanımlanabilmektedir.

---

**[Aksiyom 1]:** Eğer `children` prop'u sağlanmazsa, Provider bileşeni uygulama ağaç hiyerarşisinde alt bileşenlere erişilebilir context sunamaz ve React Context zinciri kırılır.

**[Aksiyom 2]:** Eğer `children` olarak geçilen eleman React elemanı (ReactNode) türünde değilse, bileşen render hatası ile karşılaşılır.

---

> **Not:** Bu modülün iç state yönetimi, sağladığı context değeri (value), kullanılan alt hook'lar (örn: useState, useEffect), API çağrıları ve yetkilendirme mantığı fonksiyon gövdesinde belirtilmediğinden, bu alanlara ilişkin aksiyomlar **bilinmiyor** durumdadır. Tam aksiyom üretimi için fonksiyon gövdesinin (implementation) paylaşılması gereklidir.

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

### [N1_NASIL] AST Pointer: AuthContext.tsx::AuthProvider
- **params**: (children: React.ReactNode)
- **ic_degiskenler**:
  - `user` — useState hook ile tutulan aktif kullanıcının bilgileri (User veya null)
  - `session` — useState hook ile tutulan mevcut oturum bilgisi (Session veya null)
  - `role` — useState hook ile tutulan kullanıcının rolü (UserRole veya null)
  - `loading` — useState hook ile tutulan genel yükleme durumu flag'i
  - `roleLoading` — useState hook ile tutulan rol bilgisi yükleme durumu flag'i
  - `fetchRole` — useCallback ile tanımlanan, verilen userId ve email ile kullanıcının rolünü getiren async fonksiyon
  - `signIn` — useCallback ile tanımlanan, email ve şifre ile giriş yapan async fonksiyon
  - `signUp` — useCallback ile tanımlanan, email, şifre ve isim ile kayıt olan async fonksiyon
  - `signOut` — useCallback ile tanımlanan, mevcut oturumu sonlandıran async fonksiyon
  - `resetPassword` — useCallback ile tanımlanan, verilen email için şifre sıfırlama isteği gönderen async fonksiyon
  - `refreshSession` — useCallback ile tanımlanan, mevcut oturumu yenileyen async fonksiyon
  - `value` — useMemo ile hesaplanan, AuthContext.Provider'a geçirilen tüm state ve fonksiyonları içeren nesne
- **Dönüş**: AuthContext.Provider bileşeni (children'ı sarmalar)

### [N2_NASIL] AST Pointer: AuthContext.tsx::fetchRole
- **params**: (userId: string, email?: string)
- **ic_degiskenler**:
  - `userRole` — getUserRole() asenkron fonksiyonu ile getirilen kullanıcının rolü
- **Dönüş**: void (asenkron, state'leri günceller)

### [N3_NASIL] AST Pointer: AuthContext.tsx::useEffectHook
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `getInitialSession` — useState ile tanımlanan asenkron inner fonksiyon, başlangıç oturumunu getirir
  - `subscription` — supabase.auth.onAuthStateChange() Abonelik nesnesi
- **Dönüş**: Cleanup fonksiyonu (subscription.unsubscribe() çağrısı)

### [N4_NASIL] AST Pointer: AuthContext.tsx::getInitialSession
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `initialSession` — supabase.auth.getSession() ile getirilen başlangıç oturumu verisi (data.session)
  - `error` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: void (asenkron, state'leri günceller)

### [N5_NASIL] AST Pointer: AuthContext.tsx::onAuthStateChangeCallback
- **params**: (event: string, currentSession: Session | null)
- **ic_degiskenler**:
  - `newUser` — currentSession?.user ?? null ile hesaplanan kullanıcı nesnesi
- **Dönüş**: void (asenkron, state'leri günceller)

### [N6_NASIL] AST Pointer: AuthContext.tsx::cleanupSubscription
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (subscription.unsubscribe() çağrısı)

### [N7_NASIL] AST Pointer: AuthContext.tsx::signIn
- **params**: (email: string, password: string)
- **ic_degiskenler**:
  - `data` — supabase.auth.signInWithPassword() çağrısının başarılı sonucu (data.user ve data.session)
  - `error` — supabase.auth.signInWithPassword() çağrısının hata sonucu
- **Dönüş**: { error?: AuthError } veya {}

### [N8_NASIL] AST Pointer: AuthContext.tsx::signUp
- **params**: (email: string, password: string, name: string)
- **ic_degiskenler**:
  - `tenantId` — document.cookie'den okunan tenant_id değeri veya undefined
  - `error` — supabase.auth.signUp() çağrısının hata sonucu
- **Dönüş**: { error?: AuthError } veya {}

### [N9_NASIL] AST Pointer: AuthContext.tsx::signOut
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: void (asenkron, state'leri sıfırlar)

### [N10_NASIL] AST Pointer: AuthContext.tsx::resetPassword
- **params**: (email: string)
- **ic_degiskenler**:
  - `error` — supabase.auth.resetPasswordForEmail() çağrısının hata sonucu
- **Dönüş**: { error?: AuthError } veya {}

### [N11_NASIL] AST Pointer: AuthContext.tsx::refreshSession
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `refreshedSession` — supabase.auth.refreshSession() ile yenilenen oturum verisi (data.session)
  - `error` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: Session | null

### [N12_NASIL] AST Pointer: AuthContext.tsx::useMemoCallback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — sadece mevcut state ve fonksiyonları referans alır)
- **Dönüş**: { user, session, role, loading, roleLoading, signIn, signUp, signOut, resetPassword, refreshSession } nesnesi

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