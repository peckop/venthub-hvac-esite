# Admin Panel → Enterprise: Birleşik Altın Yol Haritası (v3 — stres-testli + twin doktrin-denetimli)

> **2026-06-13.** İki bağımsız plan (Claude: CodeGraph+fallow / NLM twin: doktrin) birleştirildi → 6-ajanlı **adversaryal stres-testinden** geçirildi (13 HIGH + 10 MED bulgu). Bu v2, o bulguların düzeltmelerini içerir. Çekirdek mimari (merkezi kit + göç + cetvel-döngü) doğrulandı; yürütme detayları düzeltildi.

## Stres-testi düzeltmeleri (v1 → v2)
1. **Tenant-scope kite GÖMÜLMÜYOR** — altyapı yok: `products/categories/client_errors` tablolarında `tenant_id` kolonu yok, `database.types.ts`'de hiç geçmiyor, `resolveTenant` sabit-UUID döndüren tek-tenant stub. → Yetenek-flag'i (`tenantScoped`) + gerçek çok-kiracılık **SaaS Faz 2'ye** (ayrı track) ertelendi.
2. **shadcn/ui ÇIKARILDI** — repo'da zaten `@radix-ui/*` + tailwind-merge + sonner + `src/components/ui` var; ikinci primitive katmanı = tekrar. → Doğrudan mevcut Radix + TanStack Table.
3. **Faz 0 küçültüldü** — "bitmeden göç yok" kapısı aylarca kapalı kalıp planın #1 riskine (teslim edememe) düşüyordu. Kritik yol = kit + Coupons; ölü-kod/codemod/lint-kilit bloklamaz.
4. **OrdersBoard (kanban) + Dashboard (chart) liste-göçünden ÇIKARILDI** → özel arketip (kit-light); cetvel onlara liste-maddelerini `na` sayar.
5. **Kit kontratı EN ZOR sayfadan tasarlanır** (Products + Inventory), Coupons sadece ilk doğrulayıcı; opsiyonel slot'lar (`renderExpandedRow`, `editableCells`, `fetchAdapter`).
6. **i18n paralel-çatışması çözüldü** — sözlük sayfa-başı parçalanır; "dondurma" tüm paylaşımlı altyapıyı kapsar.
7. **Cetvel sertleştirilecek** — tenant/RLS-doğruluk/performans `na` değil ZORUNLU.

## Twin doktrin-denetimi düzeltmeleri (v2 → v3)
Twin (doktrin merceği) v2'yi standarda karşı çürüttü; her bulgu **gerçek kaynağa** doğrulandı (çelişince kod kazanır):
8. **`.content-auto` kite gömülüyor** — proje kuralı: ağır/below-the-fold tablolar `content-visibility:auto` ile ekran-dışı render yükünü sıfırlar. Admin tablo kodunda hiç yoktu → `DataTableKit` shell'inde zorunlu + cetvele performans alt-maddesi.
9. **route-modal CRUD eklendi** — `admin-standard 4.3` + `dealer-module-blueprint B1` create/edit'i route-modal (URL-kaynak, deep-link, geri-tuş kapatır) hedefler; v2 sadece listeye odaklıydı. Yeni form ekranları route-modal; mevcut `ProductFormModal`/`CategoryFormModal` kademeli geçer.
10. **Bayi-modül planına bağ** — muğlak "SaaS Faz 2"nin somut karşılığı `dealer-module-blueprint.md` (R0-R5 onarım + B1-B2 inşa). O planın **B1 fazı (Bayi-Org admin paneli) BU planın kitini + cetvelini kullanır** → kit önce gelir. Tenant ihlali DEĞİL, bağımlılık.
11. **Inventory "acil güvenlik" = YANLIŞ ALARM (kod-denetimiyle çürütüldü).** Twin "kapısı açık, yetkisiz mutate" dedi; `AdminInventoryPage` kodunda yazma handler'ları **boş no-op** (`onUpdateSupplier={async () => {}}`), gerçek mutasyon yok — `hasWriteAccess={true}` sadece EditableCell'i gösteren kozmetik yalan. Canlı açık YOK → **faz sırası değişmez**, Inventory Faz 2 rewrite'ta kalır (orada hardcoded true → `canWrite('inventory')` + handler gate + audit). Faz öne-çekme iptal.

---

## Temel ilke
19 sayfayı 19 kez ayrı düzeltmek YASAK. Sistemik eksikler **bir kez merkezi katmanda** (`useAdminTable` + `DataTableKit` + 5 Kanun lint/test) çözülür; her sayfa **göç ederek** kazanır. Sıfırdan değil, sayfa-sayfa yama da değil → **merkezi omurga + göç.**
> **#1 RİSK: scope creep × mükemmeliyetçilik = teslim edememe.** Her parça küçük ve bitebilir kalsın; kit kontratını spekülatif genişletme.

## Sistemik eksikleri MERKEZİ çözme

| Sistemik fail | Tek merkezi çözüm |
|---|---|
| i18n (15) | Kit i18n'li slot + kolon `header` sözlük anahtarı **zorunlu prop**; sözlük **sayfa-başı parçalı** (çatışma yok) |
| design-token (15) | Lint zaten `error`+0-ihlal; **gerçek ham HEX** Recharts/SVG `color/fill` prop'larında → ayrı `no-restricted-syntax` HEX-in-JSX kuralı; codemod **yalnız className string'lerine** sınırlı |
| URL-state (14) | `useAdminTable` → URL senkron + Suspense sarmalı zorunlu |
| server-pagination (9) | `useAdminTable` fetch+range+count; **çift-mod adaptör** (normal sorgu + RPC) destekli |
| selection+bulk (9) | `selectedIds` **multi-select normalize** (Set→string[]) + generic `BulkBar` |
| sort+aria (8) | `toggleSort` + `<th aria-sort>`; **kural: sort ya tam-server ya tam-client, karışım YASAK** (sessiz bug'ı engelle) |
| a11y (8+11) | mevcut Radix primitive + axe testi kit-seviyesinde |
| RBAC fonksiyon-içi (7) | Kit mutasyon wrapper'ı `canWrite` olmadan çalışmaz |
| audit (5+5) | Kit mutasyonu `logAdminAction`'sız commit etmez |
| **tenant-scope** | **Yetenek-flag'i:** tablo `tenant_id`'liyse kit filtreyi enjekte eder, değilse `tenantScoped:false` opt-out. Gerçek çok-kiracılık = SaaS Faz 2. RLS `jwt_tenant_id()` **fail-CLOSED** yapılmalı (ayrı güvenlik görevi) |

---

## FAZ 0' — Ön-koşullar ✅ TAMAMLANDI (2026-06-13 · branch `feat/admin-enterprise-faz0` · gate: lint 0, tsc 0, 445 test)
1. ✅ **3 lint error temizlendi** (i18n AST checker: console→error, import-sort autofix, ölü `const r`). Commit `775168c`.
2. ✅ **HEX-in-JSX kuralı eklendi** — `eslint.config.cjs`: admin tsx'te ham HEX = **error** (`no-restricted-syntax` + esquery regex; JSX prop + obje/style değeri). 3D (R3F) ve storefront **muaf**; chart dosyaları (`admin/dashboard/**` + `AdminInventoryReportPage`) Faz 2 token-göçüne dek **`ignores` ile karantinalı**. Commit `74fc982`.
3. ✅ **i18n sözlüğü parçalandı** — admin bloğu (22 grup) → `src/i18n/dictionaries/admin/<grup>.tr|en.ts` (44 dosya) + 2 barrel (`admin/tr.ts`, `admin/en.ts`); ana `tr.ts`/`en.ts` barrel'ı import edip `admin,` ile yerleştirir; `typeof tr` **birebir korundu**, parity testi barrel düzeyinde. **Faz 1 göçü için:** her sayfa yalnız kendi `admin/<grup>.tr|en.ts` dosyasına yazar (çatışma yok). Gruplar: `authority, categories, products, common, users, inventory, orders, dashboard, errors, toolbar, menu, titles, webhooks, a11y, returns, logistics, audit, errorGroups, movements, search, settings, ui`. Commit `6869066`.
4. ✅ **Tenant kararı** — kite `tenantScoped?: boolean` flag'i (varsayılan **kapalı**); kod-doğrulandı (admin tablolarında `tenant_id` yok, `resolveTenant` sabit-UUID stub). Gerçek çok-kiracılık = `dealer-module-blueprint` / SaaS Faz 2 (bu plan KAPSAMAZ).

## FAZ 0 — TEMEL (tek/odaklı, küçük)
1. **`useAdminTable<Row>` hook'u** — kontratı **Products + Inventory'nin gerçek ihtiyacından** kazı (en zor sayfalar): density, visibleCols, sort (tam-server|tam-client), server pagination+count, **çift-mod fetchAdapter** (normal + RPC), selectedIds (multi-normalize), debounced arama, URL-state senkron, opsiyonel `tenantScoped`.
2. **`DataTableKit` shell'i** — soyutlama kaynağı InventoryTable DEĞİL, **standart kontratı**; InventoryTable yalnız render-iskelet referansı. Opsiyonel slot'lar: `renderExpandedRow?`, `editableCells?`. Slot'lar: AdminToolbar/Skeleton/EmptyState/ColumnsMenu/ExportMenu/EditableCell. `<th aria-sort>` + RBAC-gate + `logAdminAction` + **`.content-auto` shell sarmalayıcısı** (content-visibility render kalkanı) zorunlu.
3. **Generic `BulkBar`** (i18n'li, multi-select). `BulkActionToolbar` dokunulmaz.
4. **5 Kanunu lint/test'e göm** (K1 kit-dışı `<table>` uyarı, K3 RBAC-gate, K4 audit; tenant **flag varsa** test).
5. **Altın referans = AdminCouponsPage** — ilk **doğrulayıcı** (kit kontratını test eder; kit'i Coupons şekillendirmez, en-zor şekillendirir). Tam göç → cetvel ≥90, axe 0.
- **(Paralel/bloklamayan prep):** ölü kod sil (8 bileşen + `database.ts`/`registry.ts`/`make_graph.cjs`, CodeGraph 0-caller teyitli) — ayrı commit, kapıyı bloklamaz.

**Bitti:** kit+BulkBar testli; Coupons ≥90; HEX-in-JSX + 5-kanun ihlali build kırar (kanıtlı).
**Risk azaltım:** kit'i en-zor 2 sayfadan tasarla; Products/Inventory **kit-evrim sayfaları, seri göç** (paralel değil); kit kırılırsa Faz 0'a dön.

## FAZ 1 — Paralel göç (14 liste sayfası, cetvel döngüsü)
Sıra = cetvel skoru × Avensair B2B değeri. **OrdersBoard ve Dashboard burada DEĞİL** (özel arketip → Faz 2).

| Dalga | Sayfalar |
|---|---|
| 1a | Logistics(23), Coupons(✓F0) |
| 1b | Users(39), Orders(47), Movements(62) — Avensair B2B |
| 1c | InventoryReport(41), Errors(41), AuditLog(43), InventorySettings(42) |
| 1d | Categories(44), CategoryBuilder(50) |
| 1e | Products(58)*, Returns(58), ErrorGroups(61) — *Products kit-evrim, seri |

**Her göç checklist'i:** local state sil → `useAdminTable` → `DataTableKit` → hardcoded TR → **kendi sözlük dosyası** → bulk→`BulkBar` → mutasyon RBAC-gate+audit → axe → cetvel.
**Paralel güvenlik:** her sayfa ayrı worktree+branch; **dalga sırasında TÜM paylaşımlı altyapı DONDURULUR** = {kit, BulkBar, adminUi.ts, tokens.js, eslint.config.cjs, sözlük barrel}. Sadece Mimar bunlara dokunur.
**Bitti:** her sayfa ayrı branch + lint/tsc/test yeşil + cetvel ≥85.

> **⚠️ Faz 1 KAPANIŞ görevi (Faz 0'dan ertelendi — UNUTMA):** 14 sayfa da göçtükten SONRA K1+K4 ESLint
> kurallarını `eslint.config.cjs`'e **error** olarak aç. Faz 0'da WARN bile koymadık çünkü 18 göçmemiş sayfa
> ham `<table>` + çıplak `.update/.insert/.delete` kullanıyor → repo kırılır/gürültü olur. Test-temelli K3/K4
> (`mutateWithAudit` birim testi) zaten canlı; bu lint = ikinci ağ, ancak tüm sayfalar göçünce anlamlı.
> Selector'lar: **K1** `JSXOpeningElement[name.name='table']` (`src/components/admin/data-table/**` muaf) ·
> **K4** `CallExpression > MemberExpression[property.name=/^(update|insert|delete)$/]` (`src/views/admin/**` +
> `src/lib/services/**` kapsamı; `mutateWithAudit`'in `fn` closure'ı için satır-bazlı allowlist). Config GUARD'lı
> → Bash ile uygula, kullanıcı commit'te inceler.

## FAZ 2 — Rewrite + özel arketipler
- **WebhookEvents (%3):** kit liste + HMAC/replay/idempotency görünür + audit (Kural 11).
- **Inventory (%8):** kit-tabanlı; mutasyon RBAC+audit; tenant flag (kolon eklenince).
- **Settings (%15 stub):** form-ağırlıklı; yetki `app_metadata`.
- **OrdersBoard (kanban):** tabloya ZORLAMA; kendi DnD/a11y'siyle kalır, sadece token+i18n+RBAC+audit kazanır.
- **Dashboard (chart):** kit-light; **dummy chartData → gerçek `venthub_orders` agregatı**; sorgular limit/doğru.
- **Create/Edit kalıbı (tüm CRUD):** yeni form ekranları **route-modal** (URL-kaynak, deep-link, geri-tuş kapatır — `admin-standard 4.3`); mevcut `ProductFormModal`/`CategoryFormModal` kademeli geçer (yıkıcı rewrite değil).

## FAZ 3 — Storefront hizalama
Token SSOT ortak, **düzen kasıtlı farklı.** Arbitrary/HEX ihlalleri lint'le yakala→`tokens.js`; ortak primitive Radix tabanına hizala; **layout paylaşılmaz** (DataTableKit storefront'a sızmaz). Kural: **token paylaş, düzen paylaşma.**

---

## Yürütme motoru (cetvel-güdümlü döngü)
Her dalga: **Ölç (cetvel)** → **Dilimle** → **Paralel göç (ultracode, ayrı worktree)** → **Doğrula** (lint+tsc+test+axe + RBAC/audit çürütücü-ajan) → **Kapı** (skor ≥85 + yeşil = merge) → **Yeniden ölç** → **Tekrar.**

## Cetvel v2 (sertleştirme — ölçümün kendisi düzeltilecek)
- Tenant-scope: `tenant_id`'li tablo sorgulayıp **filtresiz = otomatik FAIL** (na değil).
- RBAC-L3: tek "rls_enabled" değil → (a) enabled (b) policy>0 (c) yazma-policy tenant/claim içeriyor; SQL-temelli (`pg_policies`).
- **Performans (yeni, zorunlu):** agregasyon/sayım DB-tarafında (client `.reduce`/`.filter` yasak); tüm liste `.range()+count:exact`; ağır tablo sarmalayıcısı `.content-auto` (content-visibility).
- Dashboard arketipi: "gerçek-veri kaynağı (dummy yasak)" + "sorgu tenant+limit doğru" zorunlu.
- na-ağırlıklı payda düzeltilir (sahte ≥85 engellenir).

## "BİTTİ" tanımı
Cetvel v2 **19/19 ≥85 + sistemik sayaçlar 0 + performans/tenant maddeleri geçer** dediğinde. Sahte-bitti yok.

## Güvenlik (tüm fazlar)
Her parça ayrı branch → `pnpm lint`+`type-check`+`test --run`+cetvel yeşil olmadan merge yok. DI AST + K1-K5 lint = otomatik bekçi. **Kritik zincir:** Faz 0' ön-koşul → Faz 0 kit+Coupons → Faz 1 göç → Faz 2 rewrite/özel → Faz 3 storefront.

## Kapsam dışı (bilinçli)
Gerçek çok-kiracılık altyapısı (tenant_id kolonları, JWT claim, RLS tenant-policy) = **`dealer-module-blueprint.md`** (R0-R5 onarım + B1-B2 inşa), ayrı plan. Bu plan onu KAPSAMAZ; sadece kite `tenantScoped` flag'iyle **hazır** bırakır. **Bağ:** blueprint'in B1 fazı (Bayi-Org admin paneli) BU planın kitini + cetvelini kullanır → **kit önce gelir.**

*Kaynak: Claude (CodeGraph+fallow) ∪ NLM twin (doktrin) bağımsız planları → 6-ajan adversaryal stres-test (13H+10M) → v2 → twin doktrin-denetimi + kod ground-truth → v3.*
