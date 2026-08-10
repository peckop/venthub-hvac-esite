---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx
skeleton_hash: f4d5ced51ff2d848
entity_hashes:
  func:AuthProvider: 8a171b0bec808d24
  overview: 367d05e5814d0229
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, uygulama genelinde kimlik doğrulama sürecini merkezi olarak yöneten bir React Context yapısıdır. Oturum durumu, kullanıcı bilgileri ve ilgili yetkilendirme işlevlerini tüm alt bileşenlere güvenli bir şekilde dağıtılmasını sağlar.

## Fonksiyon Grupları
### Kimlik Doğrulama Sağlayıcı
React Context API aracılığıyla kimlik doğrulama durumunu ve ilişkili yardımcı fonksiyonları uygulama ağacındaki tüm alt bileşenlere sunarak tutarlı bir erişim noktası oluşturur.
- AuthProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzası (`AuthProvider({ children })`) mevcut olup, fonksiyon gövdesi (implementation) paylaşılmamıştır. Bu nedenle, sadece imzadan çıkarılabilen kesin varsayımlar aşağıda listelenmiştir:

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa, AuthProvider bileşeni hata verir veya geçersiz bir duruma düşer — çünkü `children`'ın default değeri yoktur ve React Context Provider pattern'inde alt bileşenlerin varlığı zorunludur.

[Aksiyom 2]: Bu modülün iç kimlik doğrulama mantığı (token yönetimi, oturum kontrolü, yetkilendirme akışı vb.) bilinmiyor — çünkü fonksiyon gövdesi paylaşılmamıştır. Mimari varsayımlar, yalnızca kod implementasyonundan üretilebilir; docstring, yorum veya isimlendirmeden çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### AuthProvider

**Ne yapar**: AuthProvider, uygulama genelinde kimlik doğrulama (authentication) durumunu ve ilgili işlemleri sağlayan React bileşenidir. Bu bileşen, tüm alt bileşenlerin (children) kimlik doğrulama verilerine ve fonksiyonlarına erişmesini sağlayan React Context Provider olarak görev yapar.

**Nasıl yapar**: React Context API kullanarak authentication state'ini (kullanıcı oturum bilgisi, token, giriş/yapılandırma durumları) tüm alt bileşenlere prop drilling olmadan aktarır. Bileşen, AuthContext'in value prop'u ile sarmalanmış children bileşenlerini render eder. Tipik olarak giriş, çıkış, oturum kontrolü ve kullanıcı bilgisi alma gibi fonksiyonları context value içine dahil eder.

**Parametreler**:
- `children`: React.ReactNode — Provider bileşeninin içine yerleştirilen tüm alt React bileşenleri. Bu prop, kimlik doğrulama durumuna erişmesi gereken tüm alt bileşenleri kapsar.

**Dönüş**: `React.FC<{ children: React.ReactNode }>` — React Fonksiyonel Bileşeni döndürür. AuthContext.Provider ile sarmalanmış children bileşenlerini render eden bir React bileşeni sonucu verir.

---

## İTHALATLAR (IMPORTS)
- import: ../config/admin::getUserRole
- import: ../lib/rbac::type { UserRole }
- import: ./AuthContextDefinition::AuthContext
- import: ./AuthContextDefinition::type AuthError
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { Session,User }
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/contexts/AuthContext.tsx::AuthProvider`
- **params**: `{ children }` — React child bileşenleri, AuthContext.Provider içine sarılır
- **ic_degiskenler**:
  - `user` — `useState<User | null>(null)` — Mevcut oturum açmış kullanıcı bilgisi
  - `session` — `useState<Session | null>(null)` — Supabase oturum nesnesi
  - `role` — `useState<UserRole | null>(null)` — Kullanıcının rol bilgisi
  - `loading` — `useState(true)` — İlk yükleme durumu flag'i
  - `roleLoading` — `useState(false)` — Rol yükleme sırasında true olan flag
  - `fetchRole` — `useCallback` ile sarılmış, userId/email ile rol getiren fonksiyon
  - `signIn` — `useCallback` ile sarılmış, e-posta/şifre ile giriş yapan fonksiyon
  - `signUp` — `useCallback` ile sarılmış, e-posta/şifre/isim ile kayıt yapan fonksiyon
  - `signOut` — `useCallback` ile sarılmış, oturumu kapatan fonksiyon
  - `resetPassword` — `useCallback` ile sarılmış, şifre sıfırlama e-postası gönderen fonksiyon
  - `refreshSession` — `useCallback` ile sarılmış, session yenileyen fonksiyon
  - `value` — `useMemo` ile oluşturulmuş, AuthContext'e verilen değer nesnesi
- **Dönüş**: JSX — `<AuthContext.Provider value={value}>{children}</AuthContext.Provider>`

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