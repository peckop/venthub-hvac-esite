<instruction>You are an expert software engineer. You are working on a WIP branch. Please run `git status` and `git diff` to understand the changes and the current state of the code. Analyze the workspace context and complete the mission brief.</instruction>
<workspace_context>
<artifacts>
--- CURRENT TASK CHECKLIST ---
# Faz 3: Admin Mobil & Kalite Yükseltmesi

## 3-A: Mobil Responsive
- [x] `AdminLayout.tsx` — Body scroll kilidi (drawer açıkken) ✅
- [x] `AdminLayout.tsx` — Swipe-to-close desteği ✅
- [x] `AdminLayout.tsx` — Drawer başlığına kullanıcı/rol bilgisi ✅
- [x] `AdminToolbar.tsx` — Mobil katlanabilir filtre paneli ✅
- [x] `AdminOrdersBoard.tsx` — Mobilde tab yapısı eklendi ✅
- [x] 9 admin tablosunda `max-*:hidden` → yatay scroll geçişi (Sorun 2 Fix) ✅

## 3-A.FIX: Kritik Bug Fix'ler
- [x] **Sorun 1:** ~16 admin sayfasında `usePathname` dependency ile veri yenileme ✅
- [x] **Sorun 2:** Tüm tablolara `min-w` + `overflow-x-auto` ile mobil yatay scroll ✅
- [x] **Sorun 3:** Lojistik sayfa scroll başa dönme ✅
- [x] **Sorun 4:** Sipariş sayfaları çift başlık ve Kanban scroll düzeltmesi ✅
- [x] **Sorun 5:** Admin Panel Stale Data / Soft Navigation Cache Bug Fix (Hard Navigation uygulandı) ✅

- [x] `AdminInventoryPage.tsx` → Ana sayfa + Diğer alt bileşenler
  - [x] `InventoryCsvImport.tsx` ✅ (Mevcut)
  - [x] `InventoryQrLabel.tsx` ✅ (Mevcut)
  - [x] `InventoryTable.tsx` ✅ (Yeni)
  - [x] `InventoryStockAdjust.tsx` ✅ (Drawer'dan ayrıldı)
  - [x] `InventoryReservedTable.tsx` ✅ (Drawer'dan ayrıldı)
  - [x] `InventoryMovementHistory.tsx` ✅ (Drawer'dan ayrıldı)
- [x] `CheckoutPage.tsx` → Ana koordinatör + 4 alt bileşen ✅
- [ ] Her bölme sonrası `lint` + `build` doğrulaması

## 3-C: Loader & Empty State Yaygınlaştırma
- [x] `AdminInventoryPage` — Skeleton + EmptyState ✅
- [x] `AdminProductsPage` — Skeleton + EmptyState ✅
- [x] Tüm admin sayfalarında (16/16) Skeleton + EmptyState entegrasyonu tamamlandı ✅
- [x] `AdminEmptyState` — `compact` varyantı ve Dashboard entegrasyonu ✅
- [x] `AdminInventorySettingsPage` — Form skeleton entegrasyonu ✅
- [x] Tüm sistemde `lint` sıfırlandı ✅

## 3-D: Supabase Tipler & any Temizliği
- [ ] `database.types.ts` üretimi (Supabase MCP)
- [/] Tip güvenliği entegrasyonu (Client seviyesi)
- [ ] Kritik sayfalarda `any` temizliği:
  - [ ] `AdminOrdersPage.tsx`
  - [ ] `AdminProductsPage.tsx`
  - [ ] `AdminReturnsPage.tsx`
  - [ ] `AdminUsersPage.tsx`

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

--- IMPLEMENTATION PLAN ---
# Faz 3 Devamı: Tip Güvenliği, Otomasyon & Testler

Admin panelindeki teknik borçları sıfırlama, kritik otomasyon süreçlerini aktifleştirme ve iş mantığını testlerle garanti altına alma planı.

---

## Mevcut Durum: `any` Kullanım Haritası

Kod tabanı taranarak tespit edilen tüm `any` noktaları:

| # | Dosya | Satır | Kullanım | Çözüm |
|---|-------|-------|----------|-------|
| 1 | [AdminLogisticsPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminLogisticsPage.tsx#L48) | 48 | `data as any[]` | `ViewAdminOrder` arayüzü tanımlanacak |
| 2 | [AdminLogisticsPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminLogisticsPage.tsx#L57) | 57 | `catch (err: any)` | `catch (err: unknown)` + `instanceof Error` |
| 3 | [AdminLogisticsPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminLogisticsPage.tsx#L127) | 127 | `catch (err: any)` | Aynı pattern |
| 4 | [AdminDashboardPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminDashboardPage.tsx#L136) | 136 | `productsRes.data as any[]` | `ProductStockRow` arayüzü |
| 5 | [AdminDashboardPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminDashboardPage.tsx#L203) | 203 | `daily as any` | Gereksiz cast, kaldırılacak |
| 6 | [AdminInventoryReportPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminInventoryReportPage.tsx#L56) | 56 | `m.products as any` | Supabase join tipi ile çözülecek |
| 7 | [AdminRealtimeNotifications.tsx](file:///c:/Users/alize/venthub-hvac/src/components/admin/AdminRealtimeNotifications.tsx#L106) | 106, 154 | `payload.new as any` | Realtime payload tipi tanımlanacak |
| 8 | [HeroCarousel.tsx](file:///c:/Users/alize/venthub-hvac/src/components/HeroCarousel.tsx#L153) | 153 | `f: any` | `CategoryFeature` arayüzü |
| 9 | [OrderSummarySidebar.tsx](file:///c:/Users/alize/venthub-hvac/src/views/checkout/OrderSummarySidebar.tsx#L9) | 9 | `items: any[]` | `CartLineItem` arayüzü |
| 10 | [AccountOverviewPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/account/AccountOverviewPage.tsx#L50) | 50 | `orderData: any[]` | `OrderSummary` arayüzü |

> [!IMPORTANT]
> `pdfGenerator.ts` (L245) ve `errorReporter.ts` (L9) dosyalarındaki `as any` kullanımları **3rd party API** erişimi olduğu için scope dışı bırakılmıştır. Bunlar `// eslint-disable-next-line @typescript-eslint/no-explicit-any` ile işaretlenecek.

---

## Proposed Changes

### Faz 3-D: Tip Güvenliği

#### [NEW] [database.types.ts](file:///c:/Users/alize/venthub-hvac/src/types/database.types.ts)
Supabase MCP `generate_typescript_types` komutuyla üretilecek. Tüm tablolar (`products`, `venthub_orders`, `categories`, `inventory_movements` vb.) için `Row`, `Insert`, `Update` tipleri sağlanacak.

#### [MODIFY] [supabase.ts](file:///c:/Users/alize/venthub-hvac/src/lib/supabase.ts)
```diff
-import { createClient } from '@supabase/supabase-js'
+import { createClient } from '@supabase/supabase-js'
+import type { Database } from '../types/database.types'

-export const supabase = createClient(...)
+export const supabase = createClient<Database>(...)
```
Mevcut manuel arayüzler (`Product`, `Category`, `CartItem` vb.) korunacak ancak `Database['public']['Tables']['products']['Row']` ile uyum kontrol edilecek.

#### [MODIFY] [AdminLogisticsPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminLogisticsPage.tsx)
- L48: `data as any[]` → `data as ViewAdminOrder[]` (yerel arayüz tanımı)
- L57, L127: `catch (err: any)` → `catch (err: unknown)` + guard

#### [MODIFY] [AdminDashboardPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminDashboardPage.tsx)
- L136: `as any[]` → `as { stock_qty: number | null; price: number | null; low_stock_threshold: number | null }[]`
- L203: `as any` cast kaldırılacak (tip zaten uyumlu)

#### [MODIFY] [AdminInventoryReportPage.tsx](file:///c:/Users/alize/venthub-hvac/src/views/admin/AdminInventoryReportPage.tsx)
- L56: `m.products as any` → Supabase join `select('*, products(name)')` ile `{ name: string }` tipi

#### [MODIFY] [AdminRealtimeNotifications.tsx](file:///c:/Users/alize/venthub-hvac/src/components/admin/AdminRealtimeNotifications.tsx)
- L106, L154: `payload.new as any` → `RealtimePostgresChangesPayload<OrderRow>` ile tip güvenli

#### [MODIFY] 3 Ek Dosya (Admin dışı)
- `HeroCarousel.tsx` L153, `OrderSummarySidebar.tsx` L9, `AccountOverviewPage.tsx` L50

---

### Faz 3-E: Edge Function Deploy & Otomasyon

#### [DEPLOY] [stock-alert](file:///c:/Users/alize/venthub-hvac/supabase/functions/stock-alert/index.ts)
- **Durum:** 411 satırlık tam fonksiyonel kod mevcut.
- **Akış:** `GET` → tüm ürünleri tarar | `POST {productId}` → tek ürün kontrolü
- **Bağımlılık:** `notification-service` Edge Function'ının **önceden deploy** edilmiş olması gerekir.
- **Deploy:** `mcp_supabase_deploy_edge_function` ile `verify_jwt: true`

> [!WARNING]
> `stock-alert` fonksiyonu varsayılan alıcıya (+905551234567) SMS/WhatsApp göndermeye çalışır. Canlıya almadan **`inventory_settings` tablosundaki `alert_email`** doğrulanmalıdır.

#### [DEPLOY] [release-expired-reservations](file:///c:/Users/alize/venthub-hvac/supabase/functions/release-expired-reservations/index.ts)
- **Durum:** 94 satır, tam fonksiyonel.
- **Akış:** `inventory_settings.reservation_timeout_hours` süresini aşan `pending` siparişleri iptal edip stokları geri verir.
- **Deploy:** `mcp_supabase_deploy_edge_function` ile `verify_jwt: false` (CRON tarafından çağrılacak)

#### [DATABASE] CRON Schedule (pg_cron)
```sql
-- Her 6 saatte bir süresi dolmuş rezervasyonları temizle
SELECT cron.schedule(
  'release-expired-reservations',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/release-expired-reservations',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
  )$$
);
```

#### [DATABASE] İade → Stok Otomasyonu (Trigger)
İade statüsü `received` olduğunda stoğu otomatik geri verecek SQL trigger incelenecek.

---

### Faz 3-F: Birim Testleri (Vitest)

Mevcut test altyapısı: `vitest` + `happy-dom` + `@testing-library/react`.
Mevcut test dosyaları: 7 adet (`useApiCall`, `OrdersPage`, `AccountSecurityPage` vb.)

#### [NEW] `src/lib/__tests__/rbac.test.ts`
[RBAC modülü](file:///c:/Users/alize/venthub-hvac/src/lib/rbac.ts) şu anda test edilmemiş. Kritik güvenlik mantığı:
- `canAccessPage('warehouse', '/admin/users')` → `false` olmalı
- `canWrite('viewer', 'orders')` → `false` olmalı
- `canWrite('admin', 'users')` → `false` olmalı (özel kural)
- `isReadOnly('viewer')` → `true` olmalı

#### [NEW] `src/views/admin/__tests__/AdminOrdersBoard.test.tsx`
- `getEffectiveStatus()` fonksiyonu: `payment_status: 'refunded'` olan sipariş → İade sütununa düşmeli
- Sütun eşleştirmesi: Her `ColumnDef.statuses` dizisinin tam kapsamı

#### [NEW] `src/hooks/__tests__/useRole.test.tsx`
- Her rol için `canAccess`, `canWrite`, `isReadOnly` çıktılarının doğruluğu
- `loading` durumunun bileşen mount'unda true → false geçişi

---

## Etki Analizi

| Değişiklik | Risk | Etkilenen Alanlar |
|-----------|------|-------------------|
| `database.types.ts` ekleme | **Düşük** | Sadece yeni dosya, mevcut kodu kırmaz |
| `supabase` client'a generic tip | **Orta** | Tüm `supabase.from()` çağrıları için IntelliSense aktif olur; uyumsuz tipler derleme hatasına döner |
| `any` → gerçek tipler | **Düşük** | Yalnızca render dallanmaları, veri akışı mantığı değişmez |
| Edge Function deploy | **Orta** | Canlı ortamı etkiler, önce staging'de test gerekir |
| CRON schedule | **Yüksek** | Sipariş iptali ve stok geri dönüşü tetikler, yanlış yapılandırma veri kaybına neden olabilir |

## Doğrulama Planı

### Otomatik
```bash
npm run lint           # ESLint kontrolü (sıfır hata)
npm run test           # Tüm Vitest testleri pass
pnpm exec tsc --noEmit # TypeScript derleme (sıfır any uyarısı)
```

### Manuel
- Edge Function'lar deploy sonrası Supabase Dashboard → Edge Functions → Logs'tan izlenecek
- `stock-alert` fonksiyonu test ortamında `GET` isteğiyle çağrılarak yanıt kontrol edilecek
- CRON kurulumu öncesinde `release-expired-reservations` el ile (`curl`) çağrılarak stok geri dönüşü doğrulanacak
</artifacts>
</workspace_context>
<mission_brief>[Describe your task here...]</mission_brief>