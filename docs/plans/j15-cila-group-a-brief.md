# İş J15 — §8 son-metre cila Grup A (OrdersBoard + InventoryReport + InventorySettings)

> `docs/standards/collaboration-protocol.md`'ye tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DUR**. Skor kaynağı: `docs/audits/admin-cetvel-scores-2026-06-18.md`.
> **Dal:** master'dan TAZE (`feat/admin-cila-a`); SADECE aşağıdaki 3 sayfanın dosyaları. Gate+merge = Controller.
> **Amaç:** bu 3 sayfanın X8/X6 boşluklarını kapatıp ≥85'e taşımak (mekanik cila, mimari değişiklik YOK).

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-cila-a -b feat/admin-cila-a origin/master
cd ../vh-cila-a && pnpm install
```

## Yapılacak (yalnız bu 3 sayfa)

### 1. AdminOrdersBoard (`src/views/admin/AdminOrdersBoard.tsx`) — %76
- **X8 arbitrary token → `tokens.js`/`adminUi.ts`:** `left-10% right-10%` (107-108) · `max-h-70vh` (224) · `bg-white/2`·`/3`·`/6` (237/270/524/572) · `md:w-320px` (524). Inline `style={{maxHeight,minHeight}}` (551) → token/sınıf.
- **X6 defekt:** note-ekleme başarısı **placeholder toast-key** kullanıyor (`:192`, `// Placeholder` yorumu) — `shippingUpdateSuccess` yerine **gerçek `noteAddSuccess` anahtarı** ekle (orders dict TR/EN) ve onu kullan.

### 2. AdminInventoryReportPage (`src/views/admin/AdminInventoryReportPage.tsx`) — %80
- **X8:** `max-w-150px` (401/438) → token.
- **X6:** CSV export başlıkları **hardcoded TR** (`['ID','Tarih','Ürün','Miktar','Sebep','Ürün ID']`, `:184`) → sözlükten (`inventory.*` CSV başlık anahtarları, TR/EN parite).

### 3. AdminInventorySettingsPage (`src/views/admin/AdminInventorySettingsPage.tsx`) — %84
- **X8:** `max-w-120px` (179) · `!h-12 !text-center !text-lg` (179) · `!h-12` (320) · blur-blob `w-64 h-64 -mr-32 -mt-32` (167/245/306) · `bg-white/2` → token/sınıf.
- **D4 dirty-guard:** kaydedilmemiş değişiklikte uyarı yok → CategoryBuilder deseni (`isFormDirty` + `beforeunload` + navigate-confirm) uygula. (Ref: `CategoryBuilderView.tsx` J9 dirty-guard.)

## Sınırlar (ihlal = ret)
- `any` yok · arbitrary Tailwind/HEX YASAK (bu zaten işin özü) · i18n parite (keycheck) · davranış (kaydetme/sevk/grafik/CSV) DEĞİŞMEZ — yalnız token/i18n/dirty-guard cilası.
- Yalnız bu 3 sayfanın dosyaları + ilgili dict (orders/inventory). Başka sayfaya DOKUNMA (J16 ayrı sayfalarda).

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer · axe 0
> **Controller kapısı:** `pnpm build` + **Vercel preview SUCCESS** (CI≠Vercel, bkz. [[ci-not-equal-vercel-build-gate]]).
## Bitince: commit `feat(admin): §8 cila A — OrdersBoard/InvReport/InvSettings token+i18n` · yalnız .ts/.tsx (`--no-verify`) · push · **DUR**
