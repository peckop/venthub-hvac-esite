# İş J9 — CategoryBuilderView refactor (D2 Zod · D4 kirli-durum guard)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8` (Detay/CRUD arketipi).

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-catbuilder -b feat/admin-categorybuilder-refactor origin/master
cd ../vh-catbuilder && pnpm install
```

## Açık (audit — CategoryBuilderView %81, detail arketip)
1. **D2 Zod yok** → kategori alanları (ad, slug, üst-kategori, sıra, açıklama, aktiflik) için Zod şema validasyonu.
2. **D4 kirli-durum guard yok** → kaydedilmemiş değişiklik varken sayfadan ayrılma/kapatma uyarısı (dirty-state guard).

## Yapılacak (yalnız `CategoryBuilderView` dosyası/dosyaları)
- Zod: şema + submit'te parse + alan-bazlı hata mesajları (i18n).
- Dirty guard: form dirty iken `beforeunload` / route-ayrılma onayı; temizken sessiz.
- Mevcut yazma yolu (`mutateWithAudit`, `canWrite`) korunur — **sahte-success YASAK (INV-6)**.

## Sınırlar (ihlal = ret)
- `any` yok · design-token · i18n fallback'siz (parity, yeni mesajlar tr+en).
- Var olan kaydetme/CRUD davranışını bozma; yalnız validasyon + guard ekle.
- Yalnız CategoryBuilder dosyalarına dokun.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): CategoryBuilder Zod+kirli-durum guard (§8)` · yalnız .tsx/.ts commit'le (.md churn EKLEME) · push · **DUR**
