# Plan: 033-tech-debt-cleanup

## 🎯 Goal
033 nolu 'Teknik Borç Temizliği' görevini başarıyla tamamlayıp, projenin tip güvenliğini artırmak ve Edge Function'ları stabilize etmek.

## 🏗️ Steps
1. **Veritabanı Tiplerini Güncelleme:**
   - Command: `pnpm supabase gen types typescript --project-id hfvkjzkqvxvjxvjx --schema public > src/types/database.types.ts` (Not: Proje ID değişkendir, mevcut yapıdan tespiti gerekir)
   - Verify: `database.types.ts` içeriğinin güncel tablo ve view'ları (özellikle `view_admin_orders`) içerdiğini kontrol et.
2. **`db-rows.ts` Senkronizasyonu:**
   - File: `src/types/db-rows.ts`
   - Change: Yeni tablo/view tiplerini buraya alias olarak ekle. `Json` olan alanları (technical_specs vb.) `CategoryMetadata` veya ilgili arayüzlere cast et.
   - Verify: `tsc --noEmit` çalıştırarak projedeki tip hatalarını listele ve temizle.
3. **Admin Dashboard `any` Temizliği:**
   - File: `src/views/admin/AdminDashboardPage.tsx`
   - Change: `recentOrders` durumunu `DbOrder[]` ile, `chartData` durumunu `{ date: string; orders: number; returns: number }[]` ile tiple.
   - Verify: Sayfa render edilirken verilerin tip güvenliği sağlandı mı?
4. **Admin Logistics `any` Temizliği:**
   - File: `src/views/admin/AdminLogisticsPage.tsx`
   - Change: `view_admin_orders` tipini kullanarak `Record<string, unknown>` veya `any` kullanımlarını kaldır.
   - Verify: Lojistik tablosundaki her kolonun veri tipi (`order_id`, `status` vb.) doğrulanmalı.
5. **Checkout & Account `any` Temizliği:**
   - Files: `src/views/checkout/OrderSummarySidebar.tsx`, `src/views/account/AccountOverviewPage.tsx`
   - Change: `items` için `CartItem[]`, `orderData` için `OrderSummary[]` tiplerini kullan.
   - Verify: Sipariş özeti ve hesap genel bakış sayfaları statik tip kontrolünden geçiyor mu?
6. **Edge Function Deploy & Test:**
   - Functions: `stock-alert`, `release-expired-reservations`
   - Action: `supabase functions deploy [name]` komutunu kullan.
   - Verify: `supabase functions logs [name]` ile çalışma zamanı hatalarını denetle. Shared tiplerin Deno uyumluluğunu kontrol et.
7. **Final Build & Validasyon:**
   - Action: `pnpm build`
   - Verify: Build sürecinin sıfır hata ile tamamlandığını doğrula.
