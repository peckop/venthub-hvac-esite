# 📋 Implementation Plan: Auth Persistence & Session Fix (035)

Bu plan, Next.js 15 ve React 19 mimarisiyle uyumlu, SSR destekli ve cookie tabanlı bir Supabase oturum yönetimi kurmayı hedefler.

## 🏁 1. Hazırlık ve Doğrulama
- [x] `@supabase/ssr` paketinin varlığını doğrula.
- [x] `src/middleware.ts` dosyasının mevcudiyetini ve temel işlevini (updateSession) kontrol et.
- [x] `src/utils/supabase/server.ts` ve `client.ts` dosyalarının eksiksizliğini teyit et.
  - `Verify:` `createClient` fonksiyonları Next.js 15 async cookies yapısıyla uyumlu mu? (EVET - `await cookies()` kullanılıyor)

## 🛠️ 2. Supabase Mimari İyileştirmesi
- [x] `src/lib/supabase.ts` dosyasını "as any" hilelerinden temizle.
  - [x] Global `supabase` singleton'ı yerine, ortamı (server/client) tespit eden ve doğru istemciyi (utils/supabase) dönen bir sarmalayıcı (wrapper) yapısı kur.
  - [x] Mevcut tüm yardımcı fonksiyonları (`getProducts`, `getCategories` vb.), sunucu tarafında çağrıldıklarında `createServerClient` (async cookies) kullanacak şekilde dinamik hale getir.
  - `Verify:` `tsc` ile tip uyumluluğu sağlandı ve `insert` gibi operasyonlar için yeni `Insert` tipleri eklendi.

## 🔐 3. Oturum ve Rol Güvenliği (RBAC)
- [x] `src/contexts/AuthContext.tsx` içindeki `onAuthStateChange` akışının cookie'lerle tam senkronize olduğunu doğrula.
- [x] `middleware.ts` üzerinde, oturum süresi dolan kullanıcıları otomatik olarak yenileyen veya yönlendiren mantığı güçlendir. (Admin koruması eklendi)
  - `Verify:` Token refresh sonrası sayfa yenilendiğinde oturumun korunup korunmadığını test et.

## 🧪 4. Final Validasyon
- [x] Tüm projede `tsc` (type-check) çalıştırarak tip uyumsuzluklarını gider.
- [x] `src/app/page.tsx` gibi SSR sayfalarında oturum bilgisinin sunucu tarafında okunabildiğini kanıtla.
