# İş J13 — AdminInventoryReportPage refactor (URL-state + DI + token · dashboard §8)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8` (dashboard arketip). Gold: `AdminDashboardPage.tsx` (J1 sonrası).
> **Dal kuralı:** Worker master'dan TAZE kendi dalını açar; SADECE aşağıdaki dosyalara dokunur. Gate+merge = Controller.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-invreport -b feat/admin-invreport-refactor origin/master
cd ../vh-invreport && pnpm install
```

## Bağlam (canlı kod — 2026-06-18 doğrulandı)
`src/views/admin/AdminInventoryReportPage.tsx` (401 satır) = **çoğunlukla SAĞLAM dashboard**: gerçek veri
(`inventory_movements`, tarih-aralığı), 3 stat kartı + 3 Recharts grafik + 2 detay tablo, **CSV export VAR**
(128-148), **i18n mükemmel** (`inventory.{tr,en}.ts` 202 satır, 0 hardcoded literal). Bu **rewrite DEĞİL — cila.**

## Açık (dashboard arketipi — son-metre)
1. **URL-state yok** → `dateRange` + `searchQuery` **local `useState`** (28-32). AdminToolbar arama + DateRangePicker render ediliyor ama **URL'ye senkron değil** (paylaşılabilir/bookmark'lanabilir değil — K2). → `useSearchParams`'a taşı + `<Suspense fallback={<Skeleton/>}>` sarmalı (CLAUDE.md #5).
2. **Modül-düzeyi `supabaseBrowserClient`** (11, inline sorgu) → veri çekimi **DI'lı servise** taşınmalı (`supabase`-parametreli; mevcut sorgu mantığını yeniden kullan, kopya yazma). RLS-korumalı client (service_role YASAK).
3. **Arbitrary token:** `max-h-400px` (333, 370) → `tokens.js`/`adminUi` sınıfı.
4. Tenant-güvenli: RLS gateway'e dayan; açık tenant-WHERE EKLEME (ileriye-uyumlu — R4).

## Yapılacak (yalnız InventoryReport dosyaları)
- `AdminInventoryReportPage.tsx`: tarih/arama state'ini `useSearchParams`'a taşı, sayfayı `<Suspense>` ile sar (useSearchParams SSR-zehirlenmesi).
- Veri yükleme → DI'lı fetcher/servis (modül-düzeyi client importunu kaldır). Gerçek-veri + tarih filtresi davranışı birebir korunur (dummy YASAK, zaten gerçek).
- `max-h-400px` → token; CSV export davranışı korunur.

## Sınırlar (ihlal = ret)
- `any` yok · design-token · i18n parite korunur (zaten 0-literal, bozma).
- Gerçek-veri/grafik/CSV davranışı DEĞİŞMEZ; yalnız URL-state + DI + token cilası.
- Yalnız InventoryReport dosyalarına dokun.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer · axe 0
> Not: `useSearchParams` + `<Suspense>` sınırını **yalnız `pnpm build` (prerender)** tam yakalar → o Controller kapısı. Worker hızlı kapıyı geçer + DURUR.
## Bitince: commit `feat(admin): InventoryReport URL-state + DI + token (§8)` · yalnız .tsx/.ts commit'le (.md churn EKLEME) · push · **DUR**
