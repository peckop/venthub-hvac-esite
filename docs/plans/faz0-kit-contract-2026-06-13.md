# Faz 0 — Admin Kit İnşa Kontratı (MÜHÜRLÜ · 2026-06-13)

> **Kaynak:** `faz0-kit-contract` workflow (run `wf_e53ca0ec-101`, 4 ajan, 2 adversary cephesi).
> Substrate kararı `faz0-kit-decision` workflow'unun 2 tamamlanan merceğiyle kanıtlandı:
> **lean-custom** (React Compiler v8-builder-API "bayat-UI" tuzağı + 5 otoritenin 3'ü TanStack kullanmaz +
> server-taraflı listede TanStack client row-model motoru zaten devre-dışı).
> **Branch:** `feat/admin-kit-faz0`. **Önkoşul:** Faz 0' (`feat/admin-enterprise-faz0`: HEX-in-JSX kuralı + i18n split).

> ### Tek mühendislik sapması (kod kazanır)
> Kontrat aşağıda K1/K4 lint'ini `error` istiyor. Ama Faz 0'da **18 sayfa henüz göç etmedi** (hepsinde ham
> `<table>` + çıplak `.update/.insert/.delete`). Repo-geneli `error` = `pnpm lint` **anında kırılır**. Roadmap
> zaten K1'i **"uyarı"** diyor. Bu yüzden Faz 0'da bu kurallar **`warn`** (veya kit/migrated-scope) olarak iner;
> tüm sayfalar göç edince (Faz 1 sonu) `error`'a yükseltilir. Test-temelli K3/K4 zorlaması (`mutateWithAudit`
> birim testi) Faz 0'dan itibaren **tam** geçerlidir — asıl mekanizma odur, lint ikincil ağdır.

---

## 1. KARAR + Gerekçe

**KARAR: lean-custom substrate.** `useAdminTable<T>` (state motoru) + `DataTableKit<T>` (sunum), TanStack Table
motoru olmadan, düz `useState` ile.

Bu **dandiğe kaçış değil, React Compiler teknik-doğrusudur**: TanStack Table'ın `useReactTable` builder-API'si
(column instance + row model factory) React Compiler'ın memoization-derleyicisiyle çatışan "bayat-UI" tuzağı
üretir — builder kapanışları her render'da yeniden kurulur, Compiler bunları otomatik memoize edemez (opaque
factory), bu yüzden `flexRender` ağacı sessizce taze kalmaz. Ek olarak otoritelerin 3'ü (Polaris/Saleor/Refine)
TanStack kullanmaz ve server-tarafında sayfalama/sıralama yapılan listelerde TanStack'in client row-model motoru
zaten devre-dışıdır (boş yük). Bizim listelerimiz server-pagination + server-sort (Products) olduğundan
TanStack'in tek değer kattığı yer kullanılmaz; geriye sadece API-yükü + Compiler-çatışması kalır. Düz `useState`
+ tek-yol sort, hem Compiler'a şeffaf hem de eski `AdminProductsPage` çift-sort bug'ının kökünü yapısal keser.

## 2. Tam TypeScript Arayüzleri (özet — kaynak: bu kontrat)

- `AdminColumn<T>` → `src/components/admin/data-table/types.ts` (key/header(i18n-çözülmüş)/sortable/align/
  hideable/defaultHidden/cell/headerClassName/cellClassName/facetAccessor).
- `useAdminTable<T>` → `src/hooks/useAdminTable.ts`. **FetchResult İKİ-TOTAL [ADV-1#1]:** `{ rows, totalMatched }`
  — `totalMatched` client-süzme SONRASI değer; `pageCount = ceil(totalMatched/pageSize)`. `AdminMode =
  'server'|'client'|'none'`; **sortMode TEK-TARAF ZORLA** (kitte ikinci sort yolu yok → eski çift-sort bug'ı
  yapısal imkansız). `tenantScoped` flag **KALDIRILDI [ADV-2 fail-open]**. `fetchAllForExport()` = CSV tam-export.
- `DataTableKit<T>` → `src/components/admin/data-table/DataTableKit.tsx`. Slots: `toolbarSlot`, `bulkBarSlot`,
  `renderExpandedRow?`, `editableCells?`. **5 durum AYRI:** emptyState ≠ filterEmptyState (`hasActiveFilters`),
  + `accessDeniedState`. **Satır→detay [ADV-2#a-9]:** `rowHref` (gerçek `<a>`) veya `onRowClick` (role=button).
  `.content-auto` kalkanı ZORUNLU. URL-sync `useRouter().replace` (ham `history.replaceState` YASAK [ADV-2#e]).
- `BulkBar` → `src/components/admin/data-table/BulkBar.tsx` (jenerik, i18n "fiil+isim", multi-select).
- `mutateWithAudit(supabase, args)` → `src/lib/admin/mutateWithAudit.ts`. K3 (canWrite gate → throw) + K4
  (logAdminAction). `auditedByEdge` ile çift-log önlenir [ADV-1#6]. RLS = asıl kapı (K3 katman-3).

## 3. Dosya Yerleşimi (`src/features/` AÇMA — CLAUDE.md dizin sözleşmesi kazanır)

```
src/components/admin/data-table/   DataTableKit.tsx · types.ts · BulkBar.tsx · DataTableHead.tsx ·
                                    FacetedFilter.tsx · persist.ts
src/hooks/useAdminTable.ts
src/lib/admin/mutateWithAudit.ts   (MEVCUT src/lib/audit.ts'i kullanır)
src/i18n/dictionaries/{tr,en}.ts   admin.dataTable + admin.coupons grupları (sayfa-başı dosya)
views/admin/<page>.columns.tsx     kaynak-config sayfanın yanında
```

## 4. 5-Kanun Lint + Test (Faz 0 = lint WARN, test FULL)

- **K1** — ham `<table>` yasak: `no-restricted-syntax` `JSXOpeningElement[name.name='table']` (Faz 0 **warn**;
  kit dosyaları override ile muaf; Faz 1 sonu `error`).
- **K4** — çıplak mutasyon yasak: `CallExpression > MemberExpression[property.name=/^(update|insert|delete)$/]`
  admin views/services'te (Faz 0 **warn/ertelenir** — 18 sayfa henüz çıplak; Faz 1 sonu `error`).
- **K2** — Suspense konvansiyonu: `useAdminTable` çağıran iç bileşen `*TableBody.tsx`; `*Page.tsx` yalnız
  `<Suspense>` + `<TableBody/>` kurar. Entegrasyon testiyle doğrulanır.
- **Testler (Faz 0'dan tam geçerli):**
  `src/lib/admin/__tests__/mutateWithAudit.test.ts` (K3 gate + K4 audit + auditedByEdge + non-fatal),
  `src/hooks/__tests__/useAdminTable.sortMode.test.ts` (tek-taraf sort + shift-aralık + pageCount=totalMatched),
  `src/components/admin/data-table/__tests__/DataTableKit.a11y.test.tsx` (aria-sort + empty≠filterEmpty + satır-link + axe 0),
  `src/views/admin/__tests__/AdminCouponsPage.integration.test.tsx` (K2 Suspense + cetvel kanıtı).

## 5. Coupons Migration (İLK VALIDATOR) — özet checklist

- DB→UI eşleme (`dbToUi` mevcut → fetcher'a taşı). **RLS:** `coupons` UPDATE/INSERT admin-only policy doğrula.
- **Çift-audit kararı [ADV-1#6]:** `admin-create-coupon` edge kendi audit'ini yazıyorsa INSERT yolu
  `auditedByEdge:true`; client `toggleActive` UPDATE ise kit loglar (`auditedByEdge:false`). Çift-log YASAK.
- `saveCoupon` audit'i EKSİK → `mutateWithAudit`/edge ile gelir. `used_count` server-default (client payload sil).
- Checkbox + `BulkBar` (toplu aktif/pasif) ekle (yoksa cetvel #6 düşer). `emptyState ≠ filterEmptyState` (K5).
- Yeni i18n: `admin.dataTable` (jenerik) + `admin.coupons` grupları; `_t('x')||'Fallback'` YASAK.
- **Kabul kapısı:** `pnpm lint` 0 hata · `type-check` 0 · `test --run` yeşil · axe 0 · cetvel **≥90** (kanıtlanır,
  iddia edilmez: sort/facet/selection/bulk/5-durum Coupons'ta GERÇEKTEN kodda var, integration testi doğrular).

## 6. İnşa Sırası (katı topolojik)

1. `src/lib/admin/mutateWithAudit.ts` + testi  ← bağımsız çekirdek (yalnız `logAdminAction`'a bağlı)
2. `src/i18n/dictionaries/{tr,en}.ts` admin.dataTable + admin.coupons grupları
3. `src/components/admin/data-table/types.ts`  ← saf tip
4. `src/hooks/useAdminTable.ts` + sortMode testi
5. `src/components/admin/data-table/persist.ts`
6. `FacetedFilter.tsx` → `DataTableHead.tsx` → `BulkBar.tsx` → `DataTableKit.tsx` + a11y testi
7. ESLint kuralları (K1/K4 **warn** + override'lar) — kit yazıldıktan SONRA (kendi dosyalarını tetiklemesin)
8. Coupons DB hazırlığı (RLS policy + index + edge-audit kararı)
9. `coupons.columns.tsx` + `CouponsTableBody.tsx` + `AdminCouponsPage` Suspense-sarmalı + integration testi
10. Kabul kapısı (§5) → geçerse kit MÜHÜRLENİR; Inventory/Products **ayrı PR** (bu kontrat = kit + Coupons).

## Scope Sınırı (bilinçli — bu kontrata DAHİL DEĞİL)

Detay/CRUD route-modal geçişi · realtime tenant-scope · undoable-mutation · **çok-kolon sort** (tek-kolon MVP,
aria-sort zorunlu) · server-mode facet-count (V2) · Inventory/Products migrasyonu. Bu kit yalnız **Resource Index
(liste)** iskeleti + **Coupons ilk-validator**'dır.

---

*Tam kontrat (verbatim TS + test iskeletleri + adversary entegrasyon notları) workflow çıktısında; bu doküman
inşa-rehberi özetidir. Çelişkide kod + bu özet kazanır.*
