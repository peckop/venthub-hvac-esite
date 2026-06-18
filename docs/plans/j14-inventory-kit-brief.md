# İş J14 — AdminInventoryPage → DataTableKit göçü (%64 → ~85 · §8)

> `docs/standards/collaboration-protocol.md`'ye tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DUR**. Cetvel: `admin-standard.md §8` (list). Gold: `ProductsTableBody.tsx`.
> Skor kaynağı: `docs/audits/admin-cetvel-scores-2026-06-18.md` (Inventory = tek kit-dışı sayfa, %64).
> **Dal:** master'dan TAZE kendi dalın (`feat/admin-inventory-kit`); SADECE aşağıdaki dosyalar. Gate+merge = Controller.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-inventory-kit -b feat/admin-inventory-kit origin/master
cd ../vh-inventory-kit && pnpm install
```

## Bağlam (canlı kod — 2026-06-18 ölçüldü)
`AdminInventoryPage.tsx` + `InventoryTableBody.tsx` + **custom `InventoryTable.tsx`** (DataTableKit DEĞİL).
**Yazma yolları GERÇEK ve audit'li** (`handleUpdateLocation`/`handleUpdateSupplier` → `mutateWithAudit` →
real `products.update`, `canWrite('inventory')` gate) — **bunları BOZMA.** Eksik (kit-dışı olduğu için):
- `aria-sort` yok (custom `InventoryTable` sadece ▲/▼ glyph) · row selection + bulk yok · ColumnsMenu/density yok ·
  CSV export yok · filtre-boş vs veri-boş ayrı state yok · X8 arbitrary token (`min-w-1000px`, `max-w-120px`).

## Yapılacak (yalnız Inventory dosyaları)
- **Custom `InventoryTable`'ı `DataTableKit` + `useAdminTable` ile değiştir** (gold = ProductsTableBody: hook 293, kit 817, toolbar 842, bulk 882, export 871). Inline-edit hücreleri (lokasyon/tedarikçi) = ProductsTableBody'nin fiyat/stok inline-edit deseni.
- `aria-sort` (kit `DataTableHead`) · row selection + `BulkActionToolbar` (varsa anlamlı toplu aksiyon; yoksa selection+CSV yeter) · `ColumnsMenu` · `ExportMenu` (CSV `table.fetchAllForExport()`) · 5 state (kit shell).
- **Yazma yolları aynen `mutateWithAudit` + `canWrite('inventory')`'den** (INV-6; davranış birebir korunur).
- X8: arbitrary Tailwind (`min-w-1000px`/`max-w-120px`/`w-20`/`w-24`) → `tokens.js`/`adminUi.ts` sınıfı.

## Sınırlar (ihlal = ret)
- `any` yok · design-token · i18n parite. Mevcut envanter yazma davranışı (lokasyon/tedarikçi/eşik) DEĞİŞMEZ.
- Yalnız Inventory dosyalarına dokun (diğer admin/shell/3D = DOKUNMA).

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer · axe 0
> **Controller kapısı:** `pnpm build` + **Vercel preview SUCCESS** zorunlu (CI≠Vercel — import-sort/typedRoutes yalnız next build yakalar, bkz. [[ci-not-equal-vercel-build-gate]]).
## Bitince: commit `feat(admin): Inventory → DataTableKit (§8)` · yalnız .ts/.tsx (`git commit --no-verify`, .md churn EKLEME) · push · **DUR**
