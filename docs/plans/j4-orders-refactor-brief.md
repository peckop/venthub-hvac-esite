# İş J4 — AdminOrders refactor (L9 satır→detay · L2 çok-kolon sort · L3 faceted)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8`. Gold: `ProductsTableBody.tsx`.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-orders -b feat/admin-orders-refactor origin/master
cd ../vh-orders && pnpm install
```

## Açık (audit — AdminOrdersPage %65)
1. **L9 satır→detay YOK** — satır tıklaması sipariş detayına gitmeli.
2. **L2 tek-kolon sort** — çok-kolon sıralanabilir + `aria-sort`.
3. **L3 düz-select (faceted değil)** — durum süzme faceted chip olmalı.

## Yapılacak (yalnız `OrdersTableBody.tsx`)
1. **Satır→detay:** Uygulamada **var olan** sipariş detay rotasını kullan. ÖNCE rotanın var olduğunu doğrula
   (CodeGraph/grep: order detail route). Navigasyon `useLocalizedRoutes` ile (manuel `/tr/` YASAK — CLAUDE.md #7).
   Var olan rota yoksa genişleyen satır (Products `renderExpandedRow`/`ProductSpecsRow` deseni) ile detay göster — **yeni rota uydurma**.
2. **Çok-kolon sort:** İlgili kolonlara `sortable: true` + `useAdminTable` `sortMode:'server'` SORT_COLUMN_MAP'i
   (Products satır 51-57 deseni) genişlet. `aria-sort` kit'ten otomatik gelir — kolon `sortable` işaretli olsun.
3. **Faceted durum:** Products `statusChips` (satır 745-759) desenini sipariş durumlarına uygula; düz `<select>` yerine
   `AdminToolbar` `chips`. Durum anahtarları sözlükten.

## Sınırlar (ihlal = ret)
- Eğer durum-değiştirme gibi **yazma** eklersen: `mutateWithAudit` + GERÇEK yazma (`.update`/`.rpc`...).
  **No-op `fn` + başarı toast'u = sahte-success = YASAK** (INV-6 reddeder). Sipariş durumu **monoton** (yalnız ileri — CLAUDE.md #11).
- Bu iş esasen okuma-yolu; gereksiz yazma EKLEME.
- `any` yok · design-token · i18n fallback'siz (parity) · yalnız `OrdersTableBody.tsx`.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): Orders satır→detay + çok-kolon sort + faceted durum (§8)` · system_tree churn alma · push · **DUR**
