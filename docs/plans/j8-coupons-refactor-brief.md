# İş J8 — AdminCoupons refactor (X8 token · D2 Zod · X5 realtime)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8`. Gold: `ProductsTableBody.tsx`.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-coupons -b feat/admin-coupons-refactor origin/master
cd ../vh-coupons && pnpm install
```

## Açık (audit — AdminCouponsPage %75)
1. **X8 arbitrary token** (`h-42px` gibi) → `tokens.js` / standart sınıf.
2. **D2 Zod yok** → kupon oluştur/düzenle formuna Zod şema validasyonu.
3. **X5 realtime yok** → tenant-scoped realtime aboneliği (liste canlı güncellensin).

## Yapılacak (yalnız Coupons dosyaları: `CouponsTableBody.tsx` + varsa kupon form bileşeni)
- Token: arbitrary Tailwind/HEX'i tasarım token'ıyla değiştir (CLAUDE.md #8).
- Zod: form alanları (kod, indirim tipi/değeri, geçerlilik, limit) için Zod şema + alan hatası gösterimi.
- Realtime: `supabase.channel(...)` ile **tenant-scoped** kanal (CLAUDE.md #12), değişimde `table.reload()`. Kanal adı + DB satır-filtresi tenant'lı.

## Sınırlar (ihlal = ret)
- Yazma yolları zaten `mutateWithAudit` kapısından; **sahte-success YASAK (INV-6)** — `fn` gerçek yazma içermeli.
- `any` yok · design-token · i18n fallback'siz (parity) · realtime tenant-scoped.
- Yalnız Coupons dosyalarına dokun.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): Coupons token+Zod+realtime (§8)` · yalnız .tsx/.ts commit'le (.md churn EKLEME) · push · **DUR**
