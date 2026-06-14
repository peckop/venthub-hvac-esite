# Faz 1 — Sayfa Göç Reçetesi (Coupons'da kanıtlandı)

> Her liste sayfası BU adımları izler. Coupons (`src/views/admin/CouponsTableBody.tsx` +
> `AdminCouponsPage.tsx` + `__tests__/AdminCouponsPage.integration.test.tsx`) = **çalışan şablon**, kopyala-uyarla.
> Kit kilitli (`feat/admin-kit-faz0`, commit `15eef1b6` + `7decd5c0`); göç sırasında kite DOKUNMA.

## Önce karar: server-mode mi client-mode mı?

| Mod | Ne zaman | Ayar |
|---|---|---|
| **client/none** | Kayıt sayısı sınırlı (≲200), tümü yüklenebilir | `paginationMode:'none'`, `sortMode:'client'`, fetcher `.limit(N)` |
| **server** | Liste büyük (binlerce satır) | `paginationMode:'server'`, `sortMode:'server'`, fetcher `.range(from,to)+count:'exact'` (+ arama varsa server `.ilike`/RPC) |

**Kural:** server-pagination + client-sort = YASAK (kit dev'de uyarır). Büyükse her şey server, küçükse her şey client.
14 sayfa için tahmin: **büyük (server)** → Products, Orders, Movements, AuditLog, Errors, InventoryReport.
**sınırlı (client)** → Coupons✓, Logistics, InventorySettings, Categories, Returns, ErrorGroups, Users (ölç, sınırdaysa server).

## Her sayfa için adımlar

1. **Branch + worktree:** `feat/admin-kit-<sayfa>` ayrı worktree (paralel güvenlik).
2. **`<Sayfa>TableBody.tsx` yaz** (Coupons'u kopyala):
   - `'use client'`. `useAdminTable<Row>({ resource, rowId, fetcher, paginationMode, sortMode, initialSort, syncUrl:true })`.
   - **fetcher** = DI'lı `(supabase, params) => {rows, totalMatched}`. Server-mode'da params'ı KULLAN (range+count+order+filter); client-mode'da yok say (hepsini çek).
   - **columns** = `useMemo<AdminColumn<Row>[]>` — SSOT. `header: t('...')` (i18n-çözülmüş, fallback YASAK). `sortable`, `hideable`, `align:'right'` (sayısal), `cell:(r)=>JSX`.
   - **facets** = `useMemo<DataTableFacet[]>` — count'lar `table.allRows`'tan (filtre-öncesi). Kolon key = satır property adı (client filtre öyle eşliyor).
   - **mutasyonlar** = HER yazma `mutateWithAudit(supabase, {resource, canWrite:hasWriteAccess, action, rowPk, before, after, auditedByEdge, fn})`. Edge-function kendi audit'ini yazıyorsa `auditedByEdge:true`, yoksa `false` (client loglar). `await table.reload()` sonra.
   - **bulk** = `BulkBar` (fiil+isim etiket, i18n). **toolbar** = `AdminToolbar` slot (search→`table.filtering`) + `rightExtra`'da `FacetedFilter`'lar + `ExportMenu` (CSV → `table.fetchAllForExport()`).
   - **DataTableKit**: `emptyState` (veri-yok) ve `filterEmptyState` (filtre-sıfır) AYRI. `hasWriteAccess`, `persistKey`.
3. **`Admin<Sayfa>Page.tsx` = ince wrapper:** başlık + `<Suspense fallback={<AdminSkeleton variant="table"/>}><...TableBody/></Suspense>` (K2: useSearchParams Suspense içinde).
4. **i18n:** sadece kendi `src/i18n/dictionaries/admin/<grup>.tr|en.ts` dosyana yaz (çatışma yok). Hardcoded TR'yi tamamen sözlüğe taşı. tr/en **parity** şart.
5. **Test:** `__tests__/Admin<Sayfa>Page.integration.test.tsx` — Coupons testini kopyala (mock'lar: next/navigation, @/lib/supabase/client, @/lib/audit, @/hooks/useRole, @/i18n/I18nProvider, ensureSessionFresh). Doğrula: satırlar render + sıralı başlıkta `aria-sort` + `testA11y` axe 0.
6. **Kapı:** `tsc 0` + `eslint --fix` sonrası lint 0 + test yeşil + cetvel ≥85 → merge.

## Zaten çözülmüş tuzaklar (kit içinde — tekrar yaşama)
- **URL-sync feedback-loop:** `useAdminTable` içinde `justWroteRef` ile çözüldü (yoksa sort/filter anında resetlenir).
- **Shift-aralık selection:** anchor updater'dan önce yakalanıyor (concurrency fix).
- **Next typed-routes:** `router.replace` string kabul etmez → `as import('next').Route` (repo idiomu).
- **Guard kestirme yakalar:** `as any`/`as unknown as`/`eslint-disable`/`@ts-ignore` yazımda BLOKLANIR → gerçek çözümü yaz.
- **a11y heading-order:** sayfa h1 → bölüm başlığı h2 (h3 atlama = axe FAIL).

## Sonraki adımlar (yürütme)
- Dalga sırası: roadmap §"FAZ 1" tablosu (1a→1e). Düşük-cetvel + Avensair-B2B önce.
- Her dalga `ultracode` + ayrı worktree paralel; Mimar (ben) kite dokunmaz = dondurulmuş altyapı.
- **Faz 1 KAPANIŞ:** 14 sayfa bitince K1+K4 lint'i error'a aç (roadmap'te detay).
