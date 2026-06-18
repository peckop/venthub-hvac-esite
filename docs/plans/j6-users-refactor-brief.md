# İş J6 — AdminUsers refactor (L3 faceted rol · L6 bulk · L8 CSV · L9 detay)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8`. Gold: `ProductsTableBody.tsx`.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-users -b feat/admin-users-refactor origin/master
cd ../vh-users && pnpm install
```

## Açık (audit — AdminUsersPage %60)
1. **L3 faceted (rol süzme) YOK** → role göre faceted chip.
2. **L6 bulk YOK** → seçim + toplu işlem.
3. **L8 CSV YOK** → export.
4. **L9 satır→detay YOK** → kullanıcı detayı/genişleyen satır.

## Yapılacak (yalnız `AdminUsersTableBody.tsx`)
- Faceted rol: `statusChips` desenini rollere (`admin`/`moderator`/`user`...) uygula. Rol kaynağı koddaki mevcut enum/SSOT'tan.
- Bulk: `BulkActionToolbar` + handler. **Rol değişikliği gibi yetki-yazması varsa** mevcut servis-delege yolunu kullan
  (`setUserAdminRole(...)` → `supabase.rpc(...)`); doğrudan tablo update'i değil. `mutateWithAudit` kapısından geçir.
- CSV: gold `exportCsv` deseni (`fetchAllForExport`).
- Satır→detay: var olan kullanıcı detay rotası varsa `useLocalizedRoutes` ile; yoksa genişleyen satır.

## Sınırlar (ihlal = ret)
- **Yetki = `app_metadata` üzerinden** (asla `raw_user_meta_data` — CLAUDE.md #12). Rol yazma yolunu UYDURMA;
  mevcut servis fonksiyonunu çağır.
- **Sahte-success YASAK (INV-6):** `mutateWithAudit` `fn`'i gerçek yazma ya da awaited servis çağrısı içermeli.
- **`rbac.ts`'e DOKUNMA** (#387 onu düzenledi — çakışma). Mevcut `canWrite('users')` ile çalış.
- `any` yok · design-token · i18n fallback'siz (parity) · yalnız `AdminUsersTableBody.tsx` (+ gerekirse sözlük).

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): Users faceted-rol+bulk+CSV+detay (§8)` · system_tree churn alma · push · **DUR**
