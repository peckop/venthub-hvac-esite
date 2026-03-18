# Plan: 002-auth-modernization (React 19)

## 🏗️ Proposed Changes

### [Component: Server Actions]
#### [NEW] [auth.ts](src/actions/auth.ts)
- `loginAction` fonksiyonu oluşturuldu. Email/Password doğrulaması ve Supabase auth entegrasyonu sunucu tarafında yapılıyor.

### [Component: Authentication UI]
#### [MODIFY] [LoginPage.tsx](src/views/LoginPage.tsx)
- `useActionState` entegrasyonu yapıldı.
- Lucide ikonları (`Mail`, `Lock`, `Eye` vb.) `Any` cast ara değişkenlerine taşındı.
- `useTransition` ile loading animasyonları senkronize edildi.

### [Component: UI/UX Fixes]
#### [MODIFY] [SearchOverlay.tsx](src/components/SearchOverlay.tsx)
#### [MODIFY] [TopicPage.tsx](src/views/knowledge/TopicPage.tsx)
- `Image` ve `Link` bileşenlerindeki React 19 tip hataları `Any` ara değişkenleri ile çözüldü.

## ✅ Verification Plan
- [x] Giriş formunun hatalı ve başarılı senaryolarda doğru mesajları gösterdiği manuel test edildi.
- [x] SearchOverlay render stabilitesi kontrol edildi.
