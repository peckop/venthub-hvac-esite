# İş J3 — CSV Export çifti: AuditLog + Errors (L8)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8` (L8 CSV export).

## Worktree (K0 — paylaşılan klasör YASAK)
```bash
git fetch origin
git worktree add ../vh-csv -b feat/admin-csv-export origin/master
cd ../vh-csv && pnpm install
```

## Açık (audit `admin-cetvel-scores-2026-06-17.md`)
- **AdminAuditLogPage %78** → tek eksik: **L8 CSV export** (denetim çıktısı — kritik).
- **AdminErrorsPage %75** → tek eksik: **L8 CSV export**.
Her ikisi de zaten kit'e (DataTableKit + useAdminTable) geçmiş **read-only** listeler.

## Yapılacak — gold deseni BİREBİR kopyala
Referans: `src/views/admin/ProductsTableBody.tsx` → `exportCsv` (satır ~777-800) + `ExportMenu` slot (satır ~871).
İki dosyaya (`AuditLogTableBody.tsx`, `ErrorsTableBody.tsx`) ayrı ayrı uygula:
1. `exportCsv` callback: `const rows = await table.fetchAllForExport()` (kit sağlar — TÜM filtreli sonuç,
   yalnız mevcut sayfa DEĞİL). Sayfanın anlamlı kolonlarını CSV'ye yaz (BOM `'﻿'` + `"` kaçışı, Products'taki gibi).
2. Toolbar `rightExtra`/uygun slota `<ExportMenu items={[{ key:'csv', label: t(...), onSelect: () => void exportCsv() }]} />` ekle.
3. CSV başlık etiketleri ve dosya adı **i18n'den** (`t('admin.auditLog.export.csvLabel')` vb.) — hardcoded metin YOK.
   Anahtar yoksa `src/i18n/dictionaries/tr.ts` + `en.ts`'e **ikisine birden** ekle (parity).

## Sınırlar (ihlal = ret)
- Read-only sayfalar: `mutateWithAudit` EKLEME. Yalnız export ekliyorsun.
- Boş/sahte export YASAK: buton gerçekten **tüm filtreli satırları** indirmeli (`fetchAllForExport`, current-page değil).
- `any` yok · design-token (arbitrary Tailwind/HEX yok) · i18n fallback'siz, parity korunur.
- Yalnız bu iki TableBody + (gerekiyorsa) iki sözlük dosyasına dokun.

## Hızlı kapı (worker — build YAPMA): `pnpm type-check` 0 · `pnpm lint` 0 · `pnpm test -- --run` geçer
## Bitince: commit `feat(admin): AuditLog+Errors CSV export (§8 L8)` · `docs/system_tree.md` churn alma · push · **DUR**
