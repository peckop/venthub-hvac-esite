# Task 035: Login ve Panel Erişim Sorunu Fix

## 🎯 Hedef
Kullanıcının login olmasına rağmen panele erişememe (admin/dashboard erişim) ve oturumun sürekliliği (persistence) sorunlarını çözmek.

## 🔍 Analiz
1. **Login State:** `loginAction` başarılı (`success: true`) dönüyor ancak `LoginPage` yönlendirme sonrası `AdminLayout` korumasına takılıyor olabilir.
2. **Admin Guard:** `AdminLayout.tsx` içindeki `isDev` kontrolü development ortamında korumayı bypass ediyor ancak `isProdEnv()` kontrolü yanlış tetikleniyor olabilir.
3. **Session Persistence:** `supabase.ts` içinde `persistSession: true` olsa da `AuthContext.tsx` içindeki `getInitialSession` ve `onAuthStateChange` akışında bir senkronizasyon problemi olabilir.
4. **Action State:** `LoginPage.tsx` yönlendirme için `state.success` bekliyor, ancak refresh sonrası router push yeterli olmuyor olabilir.

## ✅ Alt Görevler
- [ ] `AdminLayout.tsx` içindeki koruma mantığını `useRole` ile senkronize et.
- [ ] `AuthContext.tsx` içindeki profil/rol yükleme sürecini iyileştir.
- [ ] `loginAction` sonrasında redirect mekanizmasını doğrula.
- [ ] `supabase.ts` auth ayarlarını manuel persistence için kontrol et.

## 🚀 Plan
1. `AuthContext.tsx` içine rol bilgisini (`user_profiles` tablosundan) doğru şekilde entegre et.
2. `AdminLayout.tsx` içindeki `isDev` kontrolünü güvenli hale getir ve `loading` durumlarını daha iyi yönet.
3. LoginPage'de login sonrası yönlendirmeyi brute-force (hard redirect) yerine Next.js standartlarında cleanup yap.

## 🏁 Doğrulama
1. Login sonrası `/admin` sayfasına otomatik yönlendirme.
2. Sayfa yenilendiğinde `/admin` erişiminin devam etmesi.
3. Non-admin kullanıcıların `/admin` sayfasına erişememesi.
