# İş J12 — AdminLogisticsPage refactor (el-yapımı tablo → DataTableKit · §8)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8` (list arketip). Gold: `ProductsTableBody.tsx`.
> **Dal kuralı:** Worker master'dan TAZE kendi dalını açar; SADECE aşağıdaki dosyalara dokunur. Gate+merge = Controller.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-logistics -b feat/admin-logistics-refactor origin/master
cd ../vh-logistics && pnpm install
```

## Bağlam (canlı kod — 2026-06-18 doğrulandı)
`src/views/admin/AdminLogisticsPage.tsx` (323 satır) = **el-yapımı `<table>` + `useState`**. Bekleyen siparişler
(`view_admin_orders`, `status in (confirmed,processing)` + `shipped_at IS NULL`) listelenir; her satıra **kargo
firması + takip no** girilir; toplu **confirmed→shipped** gönderimi yapılır.
- **`handleBulkSubmit`** (108-162) `mutateWithAudit` → `supabase.functions.invoke('admin-update-shipping')`, resource `'logistics'`, `auditedByEdge:false`. **ÇALIŞIYOR — davranışı BOZMA, monoton ileri (CLAUDE.md #11).**
- i18n: `logistics.{tr,en}.ts` VAR; sayfa `t()` kullanıyor. **Ama 6 kargo firması adı (Yurtiçi/Aras/MNG/PTT/UPS) `<option>`'da hardcoded** (193-197, 262-266).
- Veri: **modül-düzeyi `supabaseBrowserClient`** (inline sorgu) → kit/DI desenine taşınmalı.

## Açık (list arketipi — kit eksiği)
1. **El-yapımı tablo → `useAdminTable` + `DataTableKit`** (gold = `ProductsTableBody.tsx`: hook satır 293, kit 817, toolbar 842, export 871, bulk 882). Inline-edit hücre deseni (ProductsTableBody fiyat/stok) = kargo/takip inputlarının karşılığı.
2. **AdminToolbar** — sipariş-no/müşteri araması + durum/tarih faceted (`chips`).
3. **ExportMenu** — CSV (`table.fetchAllForExport()`).
4. **URL-state** — arama/filtre/sıra `syncUrl:true` (useSearchParams + `<Suspense>` sarmalı — CLAUDE.md #5).
5. **Kargo adları → sözlük** (`logistics.tr/en.ts` `carriers.*`), hardcoded `<option>` kaldır.

## Yapılacak (yalnız Logistics dosyaları)
- `AdminLogisticsPage.tsx` (ince sayfa) + `AdminLogisticsTableBody.tsx` (YENİ, kit gövdesi) — gold ProductsTableBody bölüşümü gibi.
- Veri çekimi **DI'lı fetcher** (modül-düzeyi client importunu kaldır; `useAdminTable` fetcher imzası `supabase`-parametreli). Mevcut `view_admin_orders` sorgu mantığını **yeniden kullan**, kopya yazma.
- Inline kargo-firma + takip-no girişi + toplu gönderim **mutateWithAudit'ten** (mevcut `admin-update-shipping` davranışı birebir korunur).
- Tenant-güvenli: **RLS-korumalı normal client** (service_role YASAK); açık tenant-WHERE EKLEME (RLS gateway, ileriye-uyumlu — R4).
- `logistics.{tr,en}.ts`'e `carriers.*` ekle (TR/EN parite).

## Sınırlar (ihlal = ret)
- `any` yok · design-token (arbitrary Tailwind/HEX yok) · i18n fallback'siz (TR/EN parite, keycheck geçer).
- **Sevkiyat akışı (confirmed→shipped) davranışı DEĞİŞMEZ**, monoton ileri; `mutateWithAudit` resource `'logistics'` korunur.
- Yalnız Logistics dosyalarına dokun (CommandPalette/registry/diğer admin sayfaları/3D = DOKUNMA).

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer · axe 0
## Bitince: commit `feat(admin): Logistics → DataTableKit + toolbar/CSV/URL-state (§8)` · yalnız .tsx/.ts commit'le (.md companion churn EKLEME) · push · **DUR**
