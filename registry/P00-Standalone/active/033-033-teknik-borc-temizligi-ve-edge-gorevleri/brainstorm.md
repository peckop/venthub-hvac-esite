# Brainstorm: 033-tech-debt-cleanup

## 🎯 Goal
Projedeki `any` kullanımlarının temizlenmesi, Supabase tiplerinin güncellenmesi ve Edge Function'ların (stock-alert, reservation-cleanup) güvenilirliğinin artırılması.

## 🛡️ Constraints & Risks
- **Risk:** `database.types.ts` güncellemesi, mevcut manuel tiplemelerle (`db-rows.ts`) çakışabilir. Özellikle `Pick` ve `Omit` kullanılan yerlerde kırılmalar olabilir.
- **Risk:** Admin sayfalarında `any` temizliği yaparken, veritabanı view'larından (örn: `view_admin_orders`) dönen verilerin tiplerinin tam eşleşmemesi UI hatalarına yol açabilir.
- **Kısıt:** `pdfGenerator.ts` gibi dış kütüphane bağımlılığı yüksek yerler kapsam dışı tutulmuştur.

## 💡 Options & Recommendation
- **Öneri:** Önce `supabase gen types` çalıştırılarak temel tipler güncellenmeli.
- **Öneri:** `db-rows.ts` içindeki alias'lar, yeni şema ile senkronize edilmeli.
- **Öneri:** View'lar için `DbViewAdminOrder` gibi özel arayüzler oluşturulmalı.
- **Öneri:** Edge function'lar için frontend ile ortak bir `_shared` tip klasörü oluşturulup `Deno` import map ile bağlanmalı (veya kopyalanmalı).

## ✅ Acceptance Criteria
- [ ] `database.types.ts` güncel ve hatasız.
- [ ] Belirtilen 4 ana dosyada (`AdminLogisticsPage`, `AdminDashboardPage`, `OrderSummarySidebar`, `AccountOverviewPage`) hiç `any` kalmamış olması.
- [ ] Edge function'ların `supabase functions download` ile yerel kopyalarıyla bulut sürümü eşleşmeli ve deploy edilmeli.
- [ ] Build (`pnpm build`) hatasız tamamlanmalı.
