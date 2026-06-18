# İş J16 — §8 son-metre cila Grup B (CategoryBuilder + WebhookEvents)

> `docs/standards/collaboration-protocol.md`'ye tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DUR**. Skor kaynağı: `docs/audits/admin-cetvel-scores-2026-06-18.md`.
> **Dal:** master'dan TAZE (`feat/admin-cila-b`); SADECE aşağıdaki 2 sayfanın dosyaları. Gate+merge = Controller.
> **Amaç:** X6 i18n fallback temizliği + WebhookEvents CSV export → ≥85. (J15'le ÇAKIŞMAZ — ayrı sayfalar.)

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-cila-b -b feat/admin-cila-b origin/master
cd ../vh-cila-b && pnpm install
```

## Yapılacak (yalnız bu 2 sayfa)

### 1. CategoryBuilderView (`src/views/admin/CategoryBuilderView.tsx`) — %87 (keep ama 2 gerçek boşluk)
- **X6 i18n fallback YASAĞI:** `_t('x') || 'TR-fallback'` kalıbı kaldırılacak — satır **66** (`|| 'Kategori adı zorunludur'`), **67** (`|| 'Slug zorunludur'`), **423** (`|| 'Durum'`), **433** (`|| 'Aktif'`). Anahtarları sözlüğe ekle (TR/EN parite), fallback'siz kullan. (admin-standard §6.5.)
- **X8 token:** `w-480px` (468) · `w-320px h-568px` (491) · `max-w-content` (326) · inline `<style jsx global>` scrollbar bloğu (32-37/509) → `tokens.js`/`adminUi.ts` / global CSS sınıfı.

### 2. AdminWebhookEventsPage (`src/views/admin/WebhookEventsTableBody.tsx` + sayfa) — %80
- **L8 CSV export YOK:** kit `ExportMenu`'yü toolbar `rightExtra`'ya ekle (`table.fetchAllForExport()` ile CSV — diğer list sayfaları gibi). (Sayfa read-only; export ekleme güvenli.)
- **X6 i18n fallback:** `t(...) || 'English fallback'` — satır **225/226/232/233/244** → sözlükten (webhooks dict TR/EN parite), fallback'siz.

## Sınırlar (ihlal = ret)
- `any` yok · arbitrary Tailwind/HEX YASAK · i18n parite (keycheck) · davranış (CategoryBuilder kaydetme/dirty-guard, Webhook liste/detay) DEĞİŞMEZ.
- HMAC/replay/idempotency görünürlüğü (Webhook) korunur. Yalnız bu 2 sayfanın dosyaları + webhooks dict. Başka sayfaya DOKUNMA.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer · axe 0
> **Controller kapısı:** `pnpm build` + **Vercel preview SUCCESS** (CI≠Vercel, bkz. [[ci-not-equal-vercel-build-gate]]).
## Bitince: commit `feat(admin): §8 cila B — CategoryBuilder/Webhook i18n+CSV+token` · yalnız .ts/.tsx (`--no-verify`) · push · **DUR**
