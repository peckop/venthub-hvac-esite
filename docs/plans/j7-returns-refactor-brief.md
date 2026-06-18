# İş J7 — AdminReturns refactor (L6 selection+bulk · L9 detay · L1 server-pagination)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8`. Gold: `ProductsTableBody.tsx`.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-returns -b feat/admin-returns-refactor origin/master
cd ../vh-returns && pnpm install
```

## Açık (audit — AdminReturnsPage %79)
1. **L6 selection+bulk HİÇ BAĞLANMAMIŞ** → seçim + toplu işlem bağla.
2. **L9 satır→detay YOK** → iade detayı.
3. **L1 client-500 tavan** → mümkünse server-side pagination (`useAdminTable` `paginationMode:'server'`).

## Yapılacak (yalnız `ReturnsTableBody.tsx`)
- Selection+bulk: `BulkActionToolbar` (Products ~880-891) + handler. İade durum geçişi gibi bir toplu işlem.
- Detay: var olan iade detay rotası varsa `useLocalizedRoutes` ile; yoksa genişleyen satır deseni.
- Pagination: client-fetch-all-then-slice yerine `paginationMode:'server'` + fetcher `range()` (Products fetcher ~125-145 deseni)
  — view/tablo server sort/filter destekliyorsa. Desteklemiyorsa client tavanını en az **belgeleyen** bir not bırak (sessiz kesme yok).

## Sınırlar (ihlal = ret)
- **İade durumu MONOTON** (yalnız ileri — CLAUDE.md #11). Geri alma geçişi ekleme.
- **Sahte-success YASAK (INV-6):** her bulk `mutateWithAudit` `fn`'i gerçek yazma/awaited servis çağrısı içermeli.
- `any` yok · design-token · i18n fallback'siz (parity) · yalnız `ReturnsTableBody.tsx` (+ gerekirse sözlük).

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): Returns selection+bulk+detay+server-pagination (§8)` · system_tree churn alma · push · **DUR**
