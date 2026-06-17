# Brief — 3 Sahte Admin Sayfasını §8 Standardına Yeniden Yaz

> **Worker brief'i.** Sahip Controller = **#1 (admin şeridi)**. Worker = **Antigravity CLI**.
> Worker üretir → push eder → **DURUR**. Gate + PR + master merge = **Controller #1** (sen değil).
> **Bu brief kuralları TEKRAR ETMEZ**, kaynaklara REFERANS verir:
> `docs/standards/collaboration-protocol.md` (işbirliği) · `docs/standards/admin-standard.md §8` (cetvel) ·
> `CLAUDE.md` #1–12 (mutlak kurallar) · `docs/audits/admin-cetvel-scores-2026-06-17.md` (ölçüm/skor).

---

## 0. Skill & mod

- **Orkestrasyon skill'i: `maestro-refactor`** (YATAY göç — aynı kit-desenini birden çok dosyaya uygula).
  3 sayfa **bağımsız + paralel** (PMCM); refactor içte gerekirse `maestro-combine` (delta-merge) çağırır.
- **3 dosya = 3 ayrı iş ama TEK dal** (hepsi aynı §8-göç işi). Karışık mega-PR değil; tek konu, tek dal.

## 1. Amaç (standart-önce)

`admin-cetvel-scores-2026-06-17.md` ölçümünde **§8 cetvelinin dibindeki 3 sayfa** (🔴 rewrite) gerçek
admin-standardını taşımıyor — **sahte yazma yolu / stub / ham tablo**. Bunlar dünya-standardına
(≥%85, "keep" kovası) çekilecek. Mimari ZATEN HAZIR: `useAdminTable` + `DataTableKit` + `mutateWithAudit`
kit zemini canlı; bu iş **yeni mimari değil**, mevcut deseni 3 sayfaya uygulamak.

## 2. Kit sözleşmesi (mevcut — yeniden öğretilmiyor, MİRRORLA)

Üçü de **thin-page + body** desenine geçer. Kanonik şablon = `src/views/admin/AdminProductsPage.tsx`
(34 satır, %94) + `src/views/admin/ProductsTableBody.tsx`. Sözleşme:

1. **Sayfa = thin:** `'use client'` + `<header>` (SSOT sınıfları `adminSectionTitleClass`/`adminSubtitleClass`,
   `src/utils/adminUi`) + `<Suspense fallback={<AdminSkeleton variant="table" .../>}>` ile `<XTableBody/>`.
   Ham `text-2xl font-bold ...` başlık YASAK → SSOT sınıfı.
2. **Veri/fetch/sort/filter/selection = `useAdminTable<T>({ resource, rowId, fetcher, ... })`**
   (`src/hooks/useAdminTable.ts`). **DI:** `fetcher`'ın imzası `(supabase, params) => Promise<FetchResult<T>>` —
   ilk param `supabase`. **Modül-düzeyi `import { supabaseBrowserClient as supabase }` YASAK** (CLAUDE.md #2,
   `no-restricted-imports` lint zorlar). Fetcher kit'in verdiği `supabase`'i kullanır.
3. **`useSearchParams` tüketicisi (body, `syncUrl`) `<Suspense>` ile sarılı** (CLAUDE.md #5 / kit L5).
4. **Her yazma yolu TEK kapıdan:** `mutateWithAudit(supabase, { resource, canWrite, action, rowPk, before, after, fn })`
   (`src/lib/admin/mutateWithAudit.ts`). **`canWrite` = `useRole`'den gelen gerçek RBAC** — `hardcoded true` YASAK.
   `fn` = asıl mutasyon (closure'dan `supabase`). No-op `async () => {}` handler YASAK.
5. **i18n:** kullanıcıya görünen her metin sözlükten; URL `useLocalizedRoutes`. (Üçü zaten i18n'liydi — koru.)

## 3. Sayfa-sayfa kapsam (ölçülen ihlal → hedef → arketip referansı)

### 3.1 `AdminInventoryPage.tsx` — %21 🔴 (list arketip, YAZAR)
- **Ölçülen ihlal:** yazma yolu **SAHTE** — `hasWriteAccess={true}` hardcoded (`:154`), `onUpdateLocation`/
  `onUpdateSupplier` **no-op** (`:151-152`), `onSort` no-op (`:149`); inline fetch + modül-düzeyi statik
  client importu (`:12`); SSOT-dışı ham başlık (`:84`); arama/filtre elle-örülmüş (kit toolbar değil).
- **Hedef:** `InventoryTableBody` (yeni, `useAdminTable` + DI fetcher; `inventory_summary` view'ından okur).
  `canWrite = useRole()` gerçek RBAC. `onUpdateLocation`/`onUpdateSupplier` → **gerçek** `mutateWithAudit`
  (`action:'UPDATE'`, `resource:'inventory'`, `before`/`after` dolu). **Yazma hedef tablosu `inventory_summary`
  bir VIEW (salt-okunur)** → konum/tedarikçi güncellemesi alttaki gerçek tabloya gider; **doğru tabloyu +
  canlı RLS policy'sini CodeGraph/şema ile DOĞRULA** (uydurma yazma yolu YASAK — RLS yoksa Controller'a bildir,
  ekleme migration'ı AYRI iştir, bu brief'te değil). `InventoryTable` satır-renderer'ı korunabilir, kit
  state'inden sürülür.
- **Arketip referansı:** yazma-kapısı kablolaması için `AdminProductsPage`/`ProductsTableBody` (%94) +
  `AdminErrorGroupsPage` (%92, 4 yazma yolu).

### 3.2 `AdminSettingsPage.tsx` — %19 🔴 (settings arketip)
- **Ölçülen ihlal:** **STUB** — `handleSave` sahte success (`:45-48`, hiçbir şey yazmaz); `saving` sabit
  `useState(false)` (`:20`, asla set edilmez); içerik alanı literal placeholder (`:112-115`, sekmeler
  general/payment/admins/system **hiç içerik render etmiyor**); RBAC gate yok; ham token'lı düzen.
- **Hedef:** her sekme için **gerçek form** (`useSettings`/`AppSettings`'ten okur, dirty-state ile düzenler);
  **gerçek kaydet** → `mutateWithAudit(supabase, { resource:'settings', action:'UPDATE', canWrite, before, after, fn })`;
  `saving`/`saveStatus` gerçek async durumdan; `canWrite = useRole()`. En az "general" sekmesi tam işlevsel
  bitmeli; kalan sekmeler için iskelet + gerçek alanlar (placeholder metin YASAK).
- **Arketip referansı:** **`AdminInventorySettingsPage` (%72, settings arketip — projenin en iyi ayar sayfası)** —
  §5 annotasyonlu iki-kolon düzen + gerçek kaydet desenini buradan al (Products list arketipi DEĞİL).

### 3.3 `AdminWebhookEventsPage.tsx` — %14 🔴 (list arketip, SALT-OKUNUR)
- **Ölçülen ihlal:** ham `<table>` (`:89-128`), **sıfır kit**, hiç liste-yeteneği (sort/filter/pagination/
  export yok); inline fetch + modül-düzeyi statik client importu (`:16`); `.limit(50)` sabit tavan;
  `AdminDatabase` cast hack'i (`:24-35`, "missing table" `webhook_events`).
- **Hedef:** `WebhookEventsTableBody` (`useAdminTable` + DI fetcher, RO list). DataTableKit liste + sağdaki
  detay panelini KORU (payload JSON + error_message). **Yazma YOK** → `mutateWithAudit` gerekmez (RO; RBAC-yazma
  maddeleri `na`). `webhook_events` üretilmiş tiplerde değilse: cast hack'ini temizle — tek merkezi tip
  (`DbWebhookEvent`, `@/types/db-rows`) ile fetcher'da çöz; **`pnpm supabase:gen` ÇALIŞTIRMA** (DB tipleri
  ayrı iş, Controller kararı).
- **Arketip referansı:** **`AdminMovementsPage` (%93, list RO)** — salt-okunur liste kit desenini buradan al.

## 4. Kapsam DIŞI (DOKUNMA)

- Diğer 16 admin sayfası (son-metre sweep AYRI batch), **3D şeridi** (ikiz #2), `.agent/skills/`,
  herhangi bir DB migration / `database.types.ts` üretimi, dealer modülü.
- Yeni kit primitifi yazma; mevcut `useAdminTable`/`DataTableKit`/`mutateWithAudit`'i **SAR**, kopyalama (protokol §5).

## 5. Mutlak kurallar (bağlayıcı — `CLAUDE.md` #1–12)

No-Plan-No-Code · **DI** (servis/fetcher ilk param `supabase`, modül-düzeyi client importu yok) · **no-`any`** ·
RSC/`'use client'` yalnız etkileşimli uçta · **PPR/Suspense** (`useSearchParams` → `<Suspense>`) · i18n
(metin sözlükten, URL `useLocalizedRoutes`) · **design-token** (arbitrary Tailwind/HEX yasak; `focus-visible:`) ·
admin yazma → `admin_audit_log` (`mutateWithAudit` üzerinden). **İhlal = ret.**

## 6. Kuralları-zorlayan testler (INV-*) — kapıda koşar

- **INV-5 `i18n-key-resolution`:** YENİ eklenen her statik `t('a.b')` **namespaced (≥2 segment)** + sözlükte
  çözülmeli; düz-anahtar-içi-nokta (`t('table.x')`) = YASAK (sessiz ham-key). Mevcut anahtarları koru.
- **INV-2 `localized-route-ssot`:** `/admin` rotaları **dil-önekinden MUAF** — admin path'lerine manuel `/tr/` ekleme.
- **DI** = `pnpm lint` (`no-restricted-imports`) — modül-düzeyi client importu kırmızı yapar.

## 7. Dal & iş akışı

- **Dal adı (master'dan TAZE aç): `feat/admin-page-rewrites`** — `git fetch` + en güncel `origin/master`'dan.
  Worker **kendi worktree'sinde** çalışır (K0). Sadece bu 3 sayfa + ürettiği body/fetcher dosyalarını stage'le.
- Worker: üret → kendi hızlı kapısını geç (§8.A) → push → **DURUR**. Master'a merge ETME, PR'ı Controller açar.

## 8. Kabul kapısı (iki aşamalı)

**A) Worker hızlı kapısı (push'tan ÖNCE — `pnpm build` YOK):**
- `pnpm type-check` 0 · `pnpm lint` 0 (DI dahil) · `pnpm test -- --run` geçer · `pnpm test`'te INV-2/INV-5 yeşil ·
  (varsa) `axe` 0. **`pnpm build` ÇALIŞTIRMA** — RSC/prerender doğrulaması Controller'ın işi (3D dersi 230345df).

**B) Controller #1 kapısı (merge'den ÖNCE — BENDE):**
- `pnpm build` (RSC/prerender sınırı) yeşil · `pnpm test -- --run` tam · diff'ten §8 yeniden-skorla:
  **her 3 sayfa ≥%85 ("keep" kovası)**, sahte-yazma/stub/ham-tablo bulguları kapanmış · `mutateWithAudit`
  yolları + `canWrite=useRole` + canlı RLS doğrulanmış · manuel duman testi. Yeşilse PR → master merge.

---

*SSOT: bu brief. Cetvel = `admin-standard.md §8` + `admin-cetvel-scores-2026-06-17.md`. İşbirliği =
`collaboration-protocol.md`. Sahip = Controller #1.*
