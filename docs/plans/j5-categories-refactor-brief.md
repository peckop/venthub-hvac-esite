# İş J5 — AdminCategories refactor (L8 CSV · L3 faceted · L6 bulk)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8`. Gold: `ProductsTableBody.tsx`.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-categories -b feat/admin-categories-refactor origin/master
cd ../vh-categories && pnpm install
```

## Açık (audit — AdminCategoriesPage %63)
1. **L8 CSV export YOK** → Products `exportCsv` desenini kopyala (`fetchAllForExport`, BOM+kaçış, `ExportMenu` slot).
2. **L3 faceted YOK** → anlamlı bir faceted boyut ekle (ör. üst-kategori / aktiflik). `statusChips` veya `select` deseni.
3. **L6 bulk YOK** → `BulkActionToolbar` + satır seçimi. En az bir gerçek toplu işlem (ör. toplu sil/aktif-pasif).

## Yapılacak (yalnız `CategoriesTableBody.tsx`)
- CSV: gold `exportCsv` (ProductsTableBody ~777-800) birebir uyarla; kolonlar kategori alanları.
- Faceted: `AdminToolbar` `chips`/`select` (Products ~745-767 + toolbar slot ~841-878).
- Bulk: `BulkActionToolbar` (Products ~880-891) + bulk handler **`mutateWithAudit` kapısından GERÇEK yazma**
  (`.update`/`.delete`/`.in('id', ids)` — Products `bulkStatusChange`/`bulkDelete` deseni). `canWrite('categories')`.

## Sınırlar (ihlal = ret)
- **Sahte-success YASAK (INV-6):** her bulk `mutateWithAudit` `fn`'i gerçek `.update/.delete/...` içermeli; no-op = FAIL.
- Boş CSV / işlevsiz faceted YASAK — gerçekten süzmeli / indirmeli.
- `any` yok · design-token · i18n fallback'siz (parity, tr+en) · yalnız `CategoriesTableBody.tsx` (+ gerekirse sözlük).
- RBAC 3 katman: UI guard + fonksiyon-içi `canWrite` + (yazma yolu zaten RLS'li products/categories politikalarına tabi).

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): Categories CSV+faceted+bulk (§8)` · system_tree churn alma · push · **DUR**
