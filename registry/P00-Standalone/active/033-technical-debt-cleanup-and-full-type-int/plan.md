# 📋 Plan: Genişletilmiş Teknik Borç ve Full Tip Bütünlüğü (033)

## 🎯 Hedefler
Codebase genelindeki `any` sızıntılarını cerrahi olarak temizlemek ve V7 standartlarında mühürlemek.

## 🛠️ Uygulama Adımları

### 1. Admin & Dashboard (Tamamlandı)
- [x] `AdminLogisticsPage.tsx`: Tip temizliği.
- [x] `AdminDashboardPage.tsx`: Veri modelleri mühürlendi.

### 2. Ödeme ve Checkout Katmanı (Tamamlandı)
- [x] `src/views/CheckoutPage.tsx`: Ödeme formları tiplemesi.
- [x] `src/hooks/useCheckoutPayment.ts`: API cevapları mühürlendi.

### 3. 3D Renderer & Viewer (Tamamlandı)
- [x] `src/components/products/3d/Product3DViewer.tsx`: OrbitControls mühürlendi.

### 4. Supabase & Edge Katmanı (Tamamlandı)
- [x] `src/lib/supabase.ts`: RPC ve generic sorgu tiplemeleri.
- [x] `supabase/functions/release-expired-reservations`: Deno/TypeScript mühürlemesi.

## ✅ Doğrulama (Final)
- [x] Otonom İçerik Senkronizasyonu.
- [ ] `pnpm build` denetimi.
