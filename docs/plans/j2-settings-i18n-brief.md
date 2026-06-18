# İş J2 — AdminSettings i18n literal temizliği (27 literal)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. (#387 merge oldu → `AdminSettingsPage` artık master'da, rewrite'lı sürüm.)

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-settings-i18n -b feat/admin-settings-i18n origin/master
cd ../vh-settings-i18n && pnpm install
```

## Açık
`src/views/admin/AdminSettingsPage.tsx` — form alanlarında **27 hardcoded Türkçe literal**
(jsx-no-literals uyarısı). Kullanıcıya görünen tüm metin sözlükten gelmeli (CLAUDE.md #7).

## Yapılacak (yalnız i18n — mantık DEĞİŞMEZ)
1. Tüm görünür Türkçe stringleri (label, placeholder, başlık, buton, toast, yardım metni) `t('admin.settings.…')`'e taşı.
2. Anahtarlar **namespaced (≥2 segment)** ve **per-module** sözlüğe: `src/i18n/dictionaries/admin/settings.tr.ts` **+** `settings.en.ts` (ikisine birden — parity).
3. **Gerçek upsert mantığına / `mutateWithAudit` / secret-exclusion'a DOKUNMA** — yalnız metinleri dışarı al.

## Sınırlar (ihlal = ret)
- i18n fallback yok, **tr+en parity** zorunlu. Düz-anahtar-içi-nokta YASAK (INV-5: namespaced + sözlükte çözülmeli).
- `any` yok · design-token · mevcut form davranışı/validasyonu korunur.
- Yalnız `AdminSettingsPage.tsx` + iki settings sözlük dosyası.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 (jsx-no-literals **düşmeli**) · `pnpm test -- --run` geçer (INV-5/keycheck dahil)
## Bitince: commit `feat(admin): Settings i18n literal temizliği (27→t())` · **yalnız .tsx + .ts sözlük commit'le (.md/system_tree churn EKLEME)** · push · **DUR**
