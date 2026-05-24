---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx
skeleton_hash: 9e33076659465857
generated_at: 2026-05-23T22:29:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı uygulamasında kimlik doğrulama bağlamını yöneten merkezi bir context modülüdür. Uygulama genelinde kimlik doğrulama durumunu tek noktadan yöneterek tüm alt bileşenlere bu duruma erişim imkanı sunar, kimlik doğrulama mantığının tüm projede tutarlı bir şekilde kullanılmasını sağlar.

## Fonksiyon Grupları
### Kimlik Doğrulama Context Sağlayıcısı
React context yapısı entegrasyonuyla çalışarak, uygulamanın herhangi bir yerinden kimlik doğrulama verilerine güvenli erişim sağlayan ana sağlayıcıyı barındırır.
- AuthProvider

---

## AXIOMS – Mimari Varsayımlar
Bu React Context tabanlı kimlik doğrulama sağlayıcı modülü, yalnızca geçerli bir React çalışma zamanında ve kendisine iletilen zorunlu children prop'u ile çalışarak kimlik doğrulama durumunu alt bileşenlere iletme görevini yerine getirir.

[Aksiyom 1]: Eğer AuthProvider'a zorunlu `children` prop'u geçirilmemişse, modülün sarmaladığı hiçbir alt bileşen oluşturulamaz, kimlik doğrulama durumuna hiçbir alt katmanda erişim sağlanamaz.
[Aksiyom 2]: Eğer modülün çalıştığı ortamda React Context API çalışmıyorsa, auth durumu alt bileşenlere paylaştırılamaz, tüm kimlik doğrulaması tabanlı işlevler devre dışı kalır.
[Aksiyom 3]: Eğer AuthProvider, React uygulama ağacında yetkilendirme gerektiren bileşenleri kapsayacak şekilde konumlandırılmamışsa, kapsama dışındaki bileşenler auth context'ine erişemez, tüm yetki kontrolü işlemleri başarısız olur.

---

## FONKSIYON DETAYLARI

### AuthProvider
**Ne yapar**: AuthProvider, venthub-hvac projesinin kimlik doğrulama (auth) sisteminin temel sağlayıcısı olarak çalışan React fonksiyonel bir bileşenidir. Uygulama genelinde tüm alt bileşenlerin kimlik doğrulama durumuna, kullanıcı oturum verilerine ve auth ile ilgili işlevlere erişmesini sağlamak için tasarlanmıştır. Sadece auth erişimi gerektiren bileşenleri değil, uygulamanın tamamını sarmalayarak tüm uygulama genelinde tutarlı bir kimlik doğrulama durumu sunar.
**Nasıl yapar**: React'ın yerel Context API'sini temel alarak çalışır ve AuthContext.tsx dosyasında tanımlanan özel kimlik doğrulama context'inin sağlayıcısı olarak görev alır. İçerisinde kullanıcı oturumu, yetkilendirme durumu gibi tüm auth ile ilgili state'leri yönetir, bu state'leri ve giriş, çıkış gibi işlevleri, sarmaladığı tüm çocuk bileşenlere aktarır. Böylece herhangi bir alt bileşen auth context'ini tüketerek tüm bu verilere ve işlevlere erişebilir.
**Parametreler**:
- name: children, type: React.ReactNode — AuthProvider tarafından sarmalanan, auth context'ine erişmesi gereken tüm uygulama alt bileşenlerini içeren React düğümüdür. Genellikle uygulamanın kök bileşenini veya kimlik doğrulama verilerine ihtiyaç duyan tüm bileşen grubunu temsil eder.
**Dönüş**: React.FC<{ children: React.ReactNode }> tipinde bir React bileşeni döndürür. Bu döndürülen bileşen, aldığı children prop'unu sarmalayarak tüm alt ağaca kimlik doğrulama context değerini iletir, çocukları kalıcı olarak render ederek tüm uygulama genelinde tutarlı auth erişimi sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::AuthProvider
- **params**: children — React alt ağaçlarını temsil eden children prop'u
- **ic_degiskenler**:
  - `user` — Supabase kullanıcı nesnesini tutan state, null ise oturum açılmamış
  - `setUser` — user state'ini güncelleyen setter fonksiyonu
  - `session` — Supabase oturum nesnesini tutan state
  - `setSession` — session state'ini güncelleyen setter fonksiyonu
  - `role` — kullanıcının RBAC rolünü tutan state
  - `setRole` — role state'ini güncelleyen setter fonksiyonu
  - `loading` — genel yükleme durumunu tutan state
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `roleLoading` — kullanıcı rolü yükleme durumunu tutan state
  - `setRoleLoading` — roleLoading state'ini güncelleyen setter fonksiyonu
  - `fetchRole` — kullanıcı rolünü çeken useCallback ile sarmalanmış async fonksiyon
  - `useEffect` — oturum başlangıcı ve kimlik doğrulama değişikliklerini dinleyen hook
  - `supabase.auth.getSession` — ilk oturumu çeken Supabase API çağrısı
  - `supabase.auth.onAuthStateChange` — kimlik durumu değişikliklerini dinleyen Supabase API çağrısı
  - `signIn` — e-posta/şifre ile giriş yapan useCallback fonksiyonu
  - `signUp` — yeni kullanıcı kaydı yapan useCallback fonksiyonu
  - `signOut` — oturumu kapatan useCallback fonksiyonu
  - `resetPassword` — şifre sıfırlama e-postası gönderen useCallback fonksiyonu
  - `refreshSession` — oturumu yenileyen useCallback fonksiyonu
  - `value` — useMemo ile önbelleğe alınan AuthContext sağlayıcı değeri
  - `AuthContext.Provider` — Tüm alt bileşenlere kimlik durumu verisini sunan context sağlayıcı bileşeni
- **Dönüş**: AuthContext.Provider bileşeni sarmalında React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::fetchRole
- **params**: userId — kullanıcının benzersiz kimliği, email — kullanıcının e-posta adresi (opsiyonel)
- **ic_degiskenler**:
  - `setRoleLoading` — rol yükleme durumunu aktif yapan setter
  - `getUserRole` — kullanıcı rolünü çeken dışarıdan import edilen admin config fonksiyonu
  - `userRole` — getirilen kullanıcı rolü nesnesi
  - `setRole` - getirilen rolü state'e yazan setter
  - `err` — rol çekme sırasında oluşan hata nesnesi
  - `console.error` — oluşan hatayı konsola yazdıran fonksiyon
- **Dönüş**: yok (async void)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::useEffect_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `getInitialSession` — ilk oturumu çeken iç async fonksiyon
  - `fetchRole` — ana bileşenden alınan rol çekme fonksiyonu
  - `supabase.auth.onAuthStateChange` — kimlik durumu değişikliklerini dinleyen Supabase API'si
  - `subscription` — dinleyiciyi iptal etmek için kullanılan Supabase abonelik nesnesi
- **Dönüş**: temizleme fonksiyonu (subscription.unsubscribe çağıran fonksiyon)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::getInitialSession
- **params**: (yok)
- **ic_degiskenler**:
  - `supabase.auth.getSession` — mevcut oturumu çeken Supabase API çağrısı
  - `initialSession` — getirilen ilk oturum nesnesi
  - `setSession` — oturumu state'e yazan setter
  - `setUser` — kullanıcıyı state'e yazan setter
  - `fetchRole` — kullanıcı varsa rolünü çeken fonksiyon
  - `error` — oturum çekme sırasında oluşan hata nesnesi
  - `setLoading` — yükleme durumunu kapatan setter
- **Dönüş**: yok (async void)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::onAuthStateChange_callback
- **params**: event — kimlik durumu değişikliği olayı, currentSession — güncel oturum nesnesi
- **ic_degiskenler**:
  - `setSession` — güncel oturumu state'e yazan setter
  - `newUser` — güncel oturumdaki kullanıcı nesnesi, oturum yoksa null
  - `setUser` — kullanıcıyı state'e yazan setter
  - `setLoading` — yükleme durumunu açıp kapatan setter
  - `fetchRole` — oturum açma durumlarında kullanıcı rolünü çeken fonksiyon
  - `setRole` — çıkış yapıldığında rolü null yapan setter
- **Dönüş**: yok (async void)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::useEffect_cleanup
- **params**: (yok)
- **ic_degiskenler**:
  - `subscription.unsubscribe` — kimlik durumu dinleyicisini iptal eden Supabase metodu
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::signIn
- **params**: email — giriş yapacak kullanıcının e-postası, password — kullanıcının şifresi
- **ic_degiskenler**:
  - `supabase.auth.signInWithPassword` — e-posta/şifre ile giriş yapan Supabase API çağrısı
  - `data` — giriş başarılıysa dönen kullanıcı ve oturum verisi
  - `error` — giriş sırasında oluşan hata nesnesi
  - `AuthError` — context'te tanımlanan hata tipi
  - `fetchRole` — giriş başarılıysa kullanıcı rolünü çeken fonksiyon
- **Dönüş**: hata durumunda { error: AuthError }, başarılıysa boş nesne {}

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::signUp
- **params**: email — kayıt olacak kullanıcının e-postası, password — kullanıcının şifresi, name — kullanıcının tam adı
- **ic_degiskenler**:
  - `supabase.auth.signUp` — yeni kullanıcı kaydı yapan Supabase API çağrısı
  - `options.data.full_name` — kullanıcı profiline kaydedilecek tam adı içeren metadata alanı
  - `error` — kayıt sırasında oluşan hata nesnesi
  - `AuthError` — context'te tanımlanan hata tipi
- **Dönüş**: hata durumunda { error: AuthError }, başarılıysa boş nesne {}

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::signOut
- **params**: (yok)
- **ic_degiskenler**:
  - `supabase.auth.signOut` — oturumu kapatan Supabase API çağrısı
  - `setUser` — kullanıcı state'ini null yapan setter
  - `setSession` — oturum state'ini null yapan setter
  - `setRole` — rol state'ini null yapan setter
  - `error` — çıkış sırasında oluşan hata nesnesi
  - `console.error` — hatayı konsola yazdıran fonksiyon
- **Dönüş**: yok (async void)

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::resetPassword
- **params**: email — şifresini sıfırlamak isteyen kullanıcının e-postası
- **ic_degiskenler**:
  - `supabase.auth.resetPasswordForEmail` — şifre sıfırlama e-postası gönderen Supabase API çağrısı
  - `error` — e-posta gönderimi sırasında oluşan hata nesnesi
  - `AuthError` — context'te tanımlanan hata tipi
- **Dönüş**: hata durumunda { error: AuthError }, başarılıysa boş nesne {}

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::refreshSession
- **params**: (yok)
- **ic_degiskenler**:
  - `supabase.auth.refreshSession` — mevcut oturumu yenileyen Supabase API çağrısı
  - `refreshedSession` — yenilenen oturum nesnesi
  - `setSession` — yenilenen oturumu state'e yazan setter
  - `setUser` — yenilenen kullanıcı bilgisini state'e yazan setter
  - `fetchRole` — oturum yenilendiyse kullanıcı rolünü tekrar çeken fonksiyon
  - `error` — oturum yenileme sırasında oluşan hata nesnesi
  - `console.error` — hatayı konsola yazdıran fonksiyon
- **Dönüş**: başarılıysa yenilenmiş oturum nesnesi, hata durumunda null

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContext.tsx::useMemo_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — state'teki mevcut kullanıcı nesnesi
  - `session` — state'teki mevcut oturum nesnesi
  - `role` — state'teki kullanıcının rolü
  - `loading` — genel yükleme durumu
  - `roleLoading` — rol yükleme durumu
  - `signIn` — giriş fonksiyonu
  - `signUp` — kayıt fonksiyonu
  - `signOut` — çıkış fonksiyonu
  - `resetPassword` — şifre sıfırlama fonksiyonu
  - `refreshSession` — oturum yenileme fonksiyonu
- **Dönüş**: Tüm kimlik durumu verilerini ve metotlarını içeren context değeri nesnesi

---

## NODE ID STANDARD

  file: src\contexts\AuthContext.tsx
  function: src\contexts\AuthContext.tsx::AuthProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthProvider