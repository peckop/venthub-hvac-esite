# İş J11 — AdminOrdersBoard refactor (.limit(200) sessiz tavan · X8 token)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8` (kanban arketip).

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-ordersboard -b feat/admin-ordersboard-refactor origin/master
cd ../vh-ordersboard && pnpm install
```

## Açık (audit — AdminOrdersBoard %72, kanban)
1. **`.limit(200)` sabit tavan** → 200+ sipariş **sessizce kesiliyor** (veri kaybı algısı). Bu en kritik.
2. **X8 arbitrary token** → `tokens.js` / standart sınıf.

## Yapılacak (yalnız OrdersBoard dosyası/dosyaları)
- Tavan: sessiz `.limit(200)` kesmesini gider — ya sütun-bazlı sayfalama/"daha fazla yükle", ya durum-bazlı sorgu,
  ya da en azından **görünür uyarı** ("ilk 200 gösteriliyor, N daha var"). **Sessiz kesme YASAK** (kullanıcı eksik veriyi fark etmeli).
- Token: arbitrary Tailwind/HEX → tasarım token'ı.
- Durum geçişi yazımı varsa `mutateWithAudit` + **monoton** (yalnız ileri, CLAUDE.md #11); **sahte-success YASAK (INV-6)**.

## Sınırlar (ihlal = ret)
- `any` yok · design-token · i18n fallback'siz (parity).
- Sipariş durumu monoton; mevcut sürükle-bırak/geçiş davranışını bozma.
- Yalnız OrdersBoard dosyalarına dokun.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): OrdersBoard tavan-uyarı + token (§8)` · yalnız .tsx/.ts commit'le (.md churn EKLEME) · push · **DUR**
