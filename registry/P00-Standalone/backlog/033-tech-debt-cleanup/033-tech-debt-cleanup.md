# Faz 3-D & 3-E Bekleyen Teknik Borçlar ve Otomasyon

**Durum:** Bu dosya `JULES_PROMPT.md` arşivlenmeden önce bekleyen görevlerin kaybolmaması için Registry'ye taşınmıştır.

## 3-D: Supabase Tipler & any Temizliği
- [ ] `database.types.ts` üretimi (Supabase MCP)
- [ ] Tip güvenliği entegrasyonu (Client seviyesi)
- [ ] Kritik sayfalarda `any` temizliği:
  - [ ] `AdminOrdersPage.tsx`
  - [ ] `AdminProductsPage.tsx`
  - [ ] `AdminReturnsPage.tsx`
  - [ ] `AdminUsersPage.tsx`

## Mevcut Durum: `any` Kullanım Haritası

Kod tabanı taranarak tespit edilen tüm `any` noktaları:

| # | Dosya | Satır | Kullanım | Çözüm |
|---|-------|-------|----------|-------|
| 1 | `AdminLogisticsPage.tsx` | 48 | `data as any[]` | `ViewAdminOrder` arayüzü tanımlanacak |
| 2 | `AdminLogisticsPage.tsx` | 57 | `catch (err: any)` | `catch (err: unknown)` + `instanceof Error` |
| 3 | `AdminLogisticsPage.tsx` | 127 | `catch (err: any)` | Aynı pattern |
| 4 | `AdminDashboardPage.tsx` | 136 | `productsRes.data as any[]` | `ProductStockRow` arayüzü |
| 5 | `AdminDashboardPage.tsx` | 203 | `daily as any` | Gereksiz cast, kaldırılacak |
| 6 | `AdminInventoryReportPage.tsx` | 56 | `m.products as any` | Supabase join tipi ile çözülecek |
| 7 | `AdminRealtimeNotifications.tsx` | 106, 154 | `payload.new as any` | Realtime payload tipi tanımlanacak |
| 8 | `HeroCarousel.tsx` | 153 | `f: any` | `CategoryFeature` arayüzü |
| 9 | `OrderSummarySidebar.tsx` | 9 | `items: any[]` | `CartLineItem` arayüzü |
| 10 | `AccountOverviewPage.tsx` | 50 | `orderData: any[]` | `OrderSummary` arayüzü |

> [!IMPORTANT]
> `pdfGenerator.ts` (L245) ve `errorReporter.ts` (L9) dosyalarındaki `as any` kullanımları **3rd party API** erişimi olduğu için scope dışı bırakılmıştır.

## 3-E: Edge Function & Otomasyon
- [ ] `stock-alert` fonksiyonu inceleme ve deploy
- [ ] `release-expired-reservations` fonksiyonu deploy
- [ ] Veritabanı tetikleyicileri (Triggers) ve Cron ayarları (pg_cron)
- [ ] İade -> Stok otomasyonu testi

## 3-F: Birim Testleri (Vitest)
- [ ] `InventoryTable.tsx` - Filtreleme ve arama testleri
- [ ] `AdminOrdersBoard.tsx` - Statü değişim mantığı testleri
- [ ] `useRole.ts` - Yetkilendirme (RBAC) testleri
- [ ] `AdminReturnsPage.tsx` - İade akışı testleri
