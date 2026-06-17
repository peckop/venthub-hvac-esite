# İMPLEMENTASYON BRIEF — Admin Shell E1: Federe Komut Paleti (⌘K)

> **Bu dosya nedir?** Antigravity (agy) CLI'nin uygulayacağı **tam, self-contained iş-akış brief'i.**
> Yazan: Claude (mimar) — canlı koddan doğrulanmış (`verify-live-state-before-cross-tool-brief`).
> Denetleyen: Claude (yargıç) — §9 checklist'iyle.
> **Dal kuralı (`collaboration-protocol.md §1`):** Worker **master'dan TAZE kendi kod dalını** açar (öneri: `feat/admin-e1-command-palette`); SADECE §4 dosyalarına dokunur, başka ajanın dosyasına DOKUNMAZ. Bu brief + `§10` cetveli ayrı docs bazında (master'da referans). **Son kontrol + master'a merge = Controller (Claude), Worker DEĞİL.**
> Kapsam: **YALNIZ E1** (federe komut paleti). E2/E8/nav-redesign = ayrı brief (§8 kapsam-dışı).
>
> **Worker harness:** `maestro-feature` (DİKEY özellik: registry + searchers + palette + i18n + test = tek özellik × çok katman). **Bu brief skill'i EZER.** Akış: worker paralel ÜRETİR → push → **DURUR**. Deterministik kapı (type-check · lint · test · `pnpm build` · axe) + commit/PR/merge = **Controller (Claude)**, worker DEĞİL. "Ajan geçti" ≠ güven → diff'ten doğrulanır.
>
> **Cetvel (standart-önce):** Bu brief `admin-standard.md §10` (shell standardı — kaynak-bağlı, §10.5 provenance) cetveline UYAR. **Kabul ölçütü = §10.4 17-madde shell cetveli ≥ 15/17** + §9 deterministik kapı. Brief = §10'un uygulama izdüşümü; controller hem kapıyı hem **§10.4 cetvelini** kendi vurur.

---

## 1. Bağlam (mevcut durum — kanıtlı)

- **`src/components/admin/CommandPalette.tsx`** (293 satır): `Ctrl/Cmd+K` ile açılır (satır 54). ŞU AN sadece **6 sabit nav öğesi** (satır 34-41: dashboard/orders/products/inventory/users/settings) + **ürün araması** (`products` tablosunda `ilike`, satır 82-87) yapıyor. `selectItem` (117-132) `router.push` ile gider; ürün → `/admin/products?id={id}`. Keyboard state machine `handleKeyDown` (102-115). Debounce 300ms, min 2 karakter.
- **`src/views/admin/AdminLayout.tsx`** (193 satır): sol-nav 5 grupta SABİT dizi (89-110); `useRole()` (43) ile RBAC; CommandPalette'i mount eder (185).
- **`src/lib/rbac.ts`**: `ROLE_PAGE_ACCESS` (sayfa erişimi) + `ROLE_WRITE_ACCESS` (yazma). `useRole()` → `{ role, loading, canAccess(path), canWrite(entity), isReadOnly }`.
- **`src/lib/services/product.service.ts:216`**: `adminSearchProducts(supabase, q, limit, offset, categoryId?)` — federe arama için **örnek/altın searcher** (FTS RPC + query hibrit, DI'lı).
- **i18n**: `src/i18n/dictionaries/admin/{menu,search,ui}.{tr,en}.ts` — `commandPalette`, `searchCommandPlaceholder`, kaynak-spesifik `search.tr.ts` ipuçları zaten var.
- **Tasarım**: `src/utils/adminUi.ts` sınıfları; Radix Dialog primitive; `tokens.js` (z-modal 100). Arbitrary Tailwind/HEX YASAK.

## 2. Hedef (E1 tanımı)

Tek ⌘K kutusu, **tüm admin kaynaklarında federe arama + navigasyon**: orders · products · returns · categories · users · coupons · movements · error_groups · audit · inventory. Sorgu girilince **erişilebilir + searchable** kaynakların hepsi **paralel** sorgulanır, sonuçlar kaynağa göre gruplanmış gösterilir; Enter → ilgili detay/route. RBAC-kapılı, tenant-scoped, i18n, a11y. (Linear/Vercel/Stripe komut paleti hissi.)

## 3. Mimari

### 3.1 Kaynak registry (SSOT) — YENİ `src/config/admin-resources.ts`
Sabit `navItems`/`navGroups`'un yerine geçen tek-doğru-kaynak. Her kaynak:
```ts
export interface AdminResource {
  key: string;                 // 'orders' | 'products' | ...
  labelKey: string;            // i18n anahtarı (admin.menu.*)
  group: 'main'|'sales'|'catalog'|'stock'|'system';
  route: string;               // '/admin/orders'
  icon: LucideIcon;
  requiredAccess: string;      // canAccess(path) için route VEYA entity
  searchable: boolean;
  search?: AdminSearcher;      // searchable ise zorunlu
  searchHintKey?: string;      // admin.search.* (placeholder/ipucu)
}
```
> Not: AdminLayout sol-nav'ı da bu registry'yi tüketebilir (DRY) — ama scope'u bağlamak için **bu brief'te AdminLayout sidebar refactor'u OPSİYONEL**; öncelik paletin federe olması. Registry'yi yaz, CommandPalette tüketsin; sidebar göçü follow-up.

### 3.2 Searcher sözleşmesi — YENİ `src/lib/admin/search/resourceSearchers.ts`
Her searchable kaynak için DI'lı fonksiyon (modül-düzeyi client importu YASAK):
```ts
export interface CommandResult {
  resourceKey: string;
  id: string;
  title: string;            // ör. sipariş no / ürün adı
  subtitle?: string;        // ör. müşteri / SKU / durum
  route: string;            // tıklanınca gidilecek (detay)
}
export type AdminSearcher =
  (supabase: SupabaseClient<Database>, query: string, limit: number) => Promise<CommandResult[]>;
```
- **products** → mevcut `adminSearchProducts`'ı sar (yeniden yazma).
- **orders** → `order_number` + `conversation_id` (OrdersTableBody:60-69 alanları).
- **returns/coupons/categories/users/movements/error_groups/audit/inventory** → her biri için ilgili tablo + makul arama alanı (kupon=kod/tip, kategori=ad, kullanıcı=email/ad, movement=ürün/sebep, error_group=signature/message). Alan belirsizse `search.tr.ts` ipucu anahtarını referans al.
- Hepsi **RLS-korumalı normal client** ile (service-role bypass YASAK) → tenant izolasyonu RLS'e dayanır (§5).

### 3.3 Federe palet — MODIFY `src/components/admin/CommandPalette.tsx`
- `navItems` sabitini KALDIR → registry'den oku, `useRole().canAccess` ile filtrele.
- Sorguda (debounce 300ms, min 2 char): erişilebilir+searchable kaynakların `search()`'lerini **`Promise.all` ile paralel** çalıştır, kaynak-başı `limit` (ör. 5), sonuçları gruplu birleştir.
- Render: nav eşleşmeleri + kaynak-grupları (başlıklı) + (ops.) hızlı aksiyonlar. Mevcut keyboard cycling'i tüm öğelere genişlet.
- 5 durum: idle / loading (kaynak-başı spinner ops.) / sonuç / boş / hata (bir searcher patlarsa o grup atlanır, diğerleri görünür — `Promise.allSettled`).
- Hardcoded `"VentHub AI Search Engine"` (satır 144) ve diğer çıplak metinleri i18n'e taşı.

## 4. Dosyalar
| Aksiyon | Dosya |
|---|---|
| YENİ | `src/config/admin-resources.ts` (registry + AdminResource tipi) |
| YENİ | `src/lib/admin/search/resourceSearchers.ts` (CommandResult, AdminSearcher, kaynak-başı searcher'lar) |
| MODIFY | `src/components/admin/CommandPalette.tsx` (federe et) |
| MODIFY | `src/i18n/dictionaries/admin/search.{tr,en}.ts` + `ui.{tr,en}.ts` (yeni anahtarlar, TR/EN parite) |
| YENİ/GENİŞLET | `src/components/admin/__tests__/CommandPalette.test.tsx` (federe arama + RBAC + keyboard + axe) |

## 5. RBAC + Tenant (KRİTİK)
- **RBAC katman-1:** Palet yalnız `useRole().canAccess(resource.requiredAccess)` true olan kaynakları gösterir/aratır. (Ör. `sales` rolü users/inventory aratamaz.)
- **Searcher güvenliği:** Tüm searcher'lar **RLS-korumalı client** kullanır; `service_role`/admin-bypass YASAK. Sunucu RLS = asıl kapı (CLAUDE.md #11, #12).
- **Tenant-scope (CLAUDE.md #12):** Searcher'lar tenant-safe yazılır; tenant_id kolonu olan tablolarda RLS otomatik süzer. (Mevcut tek-tenant; multi-tenant R4'te açılacak — kodu ileriye-uyumlu yaz, ama yeni `service_role` sorgusu ekleme.)

## 6. i18n & a11y
- **i18n:** Tüm metin sözlükten (`admin.menu.*`, `admin.search.*`, `admin.ui.*`); `_t('x') || 'Fallback'` ve hardcoded string YASAK; **TR/EN parite** zorunlu (keycheck geçer).
- **a11y:** Palet `role="combobox"`/`listbox` + `aria-activedescendant` + `aria-label`; sonuç öğeleri `role="option"`; `focus-visible` halkası; Esc kapatır; focus trap Dialog'da. **axe = 0 ihlal.**

## 7. Kısıtlar (VentHub mutlak kuralları — ihlal = ret)
1. **DI:** `lib/services`/searcher fonksiyonları ilk parametre `supabase: SupabaseClient<Database>`; modül-düzeyi statik client importu YASAK (ESLint `no-restricted-imports` + AST testi zorlar).
2. **Tip:** `any` YASAK, strict TS.
3. **'use client':** CommandPalette zaten client; yeni server-only kod client'a sızmasın.
4. **Design token:** arbitrary Tailwind (`w-[..]`) + ham HEX YASAK → `adminUi.ts`/`tokens.js`/HSL custom property.
5. **i18n/RBAC/tenant:** §5-§6.
6. **Test:** yeni davranış için Vitest + axe.
7. **Mükerrerlik YASAĞI (kritik):** Searcher'lar var olan servis/sorgu mantığını **YENİDEN KULLANIR** (ör. products → `adminSearchProducts`'ı sar; başka kaynakta servis fonksiyonu varsa onu çağır), sıfırdan kopya sorgu YAZMAZ. Registry, paletteki + AdminLayout'taki **çift nav listesini TEK kaynağa indirir** (kopyayı azaltır — çoğaltmaz). Yeni dosyalar = dağınıklığı toplama + eksik doldurma; mevcut bir şeyin kopyası DEĞİL. Worker, eklemeden önce "bu zaten var mı?" diye CodeGraph/grep ile kontrol eder.

## 8. KAPSAM DIŞI (ayrı brief — yapma)
- E2 bildirim inbox · E8 gelişmiş klavye-nav (`g+o`) · modern sidebar **görsel** redesign · AdminLayout sidebar'ın registry'ye göçü (opsiyonel) · hızlı-create aksiyonları (ops. minimal bırak) · yeni RPC gerektiren kaynaklar için DB migration (gerekirse AYRI iş — bu brief mevcut tablolara `ilike`/select ile arar).

## 9. Kabul kriterleri + kapı sorumluluğu (iki katman)

> Kapı bölüşümü `collaboration-protocol.md §2-§3`'e tabi. **`pnpm build` worker'ın işi DEĞİL** —
> skill "build" dese de worker build **ÇALIŞTIRMAZ** (bkz. `230345df` 3D dersi: ajan build koşmaz).
> Build = **Controller** kapısı; çünkü `'use client'` paleti + yeni modül importları RSC/prerender
> sınırını zorlar ve bunu **yalnız `pnpm build` yakalar** (tsc/lint/test YAKALAMAZ — bkz. RSC boundary gap).

**A) Worker (maestro-feature) teslimden ÖNCE yeşil yapar — HIZLI kapı (build YOK):**
- [ ] `pnpm type-check` 0 · `pnpm lint` 0 · `pnpm test -- --run` geçer · axe 0
- [ ] Palet ≥8 kaynakta federe arıyor (paralel, `allSettled`)
- [ ] RBAC: `sales` rolü yalnız kendi kaynaklarını görür/aratır (testle kanıt)
- [ ] Searcher'lar DI'lı + RLS-client (service_role yok) — AST/lint geçer
- [ ] i18n TR/EN parite (keycheck) + hardcoded string yok
- [ ] a11y combobox/aria-activedescendant + axe 0
- [ ] `any` yok · arbitrary Tailwind yok
> Worker bitince push eder ve **DURUR** — build/PR/merge'e dokunmaz.

**B) Controller (Claude) deterministik kapı — worker'a GÜVENMEden diff'ten kendi vurur:**
- [ ] A listesini tekrar koş + diff'ten doğrula (type-check/lint/test/axe)
- [ ] **`pnpm build` yeşil** (RSC/prerender sınırı — paletin `'use client'` + yeni importlar)
- [ ] **§10.4 17-madde shell cetveli ≥ 15/17** (kabul eşiği)
- [ ] Manuel denetim: federe kapsam tam mı · tenant-leak (her searcher RLS'e mi dayanıyor) · keyboard nav tüm gruplarda · ürün-arama regresyon yok · registry SSOT temiz
- [ ] Yeşilse → commit + PR + master'a merge (K5: fetch+rebase-if-behind)

---

*Kaynak: canlı kod haritası (Explore subagent, feat/admin-shell) + admin-standard.md + admin-capabilities.md §4.5 (E1). Worker = Antigravity; Architect+Judge = Claude.*
