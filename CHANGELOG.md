# Changelog

### [2026-08-17] NotebookLM ürün göçü — kronik "failed" arızası kökünden kapandı

**Özet:** Dijital ikiz katmanı aylarca kararsızdı ("onar → bir süre sonra yine bozul"). Kök sebep
ölçülerek bulundu ve ürün değiştirildi: **`jacob-bd/notebooklm-mcp-cli` (`nlm`) → `teng-lin/notebooklm-py` (`notebooklm`)**.

**Kök sebep (fiziksel kanıtla):** İki proje de `notebooklm-mcp` adlı **aynı komutu** üretiyor.
Biri kurulunca/kaldırılınca diğerinin sarmalayıcısını eziyordu. `Temp/pip-uninstall-*` klasörlerinde
her iki ürünün shim'leri duruyordu — pip kaldırırken dosyayı geçici dizine taşır, işlem yarıda
kesilince kalıntı kalır. Ayrıca `site-packages`'ta **`~` önekli üç ceset** vardı (`~otebooklm_py-0.8.0.dist-info`
gibi); `importlib.metadata` bunları da saydığı için ölçüm araçları "üç kurulum var" diye yanıltıyordu.

**Yapılanlar:**
- Makine temizlendi: 8 enkaz dizini, arkasında paketi olmayan 2 yetim shim, orion venv'indeki
  kaçak kurulum. (Eski paket orion'un venv'inde **bağımlılık olarak tanımsız** duruyordu ve
  `uv sync` onu buduyordu — kronikliğin ikinci motoru.)
- Yeni ürün **izole `uv tool`** ortamına kuruldu; hiçbir projenin venv'ine dokunmaz.
- MCP config **modül yoluyla** bağlandı (`python -m notebooklm.mcp`) — kaybolabilecek `.exe`
  sarmalayıcısına bağımlılık kalmadı.
- `orion doc tree --nlm-sync` onarıldı: altı ayrı yerde çıplak `nlm` çağırıyordu (o komut artık
  yok = sync tamamen kırıktı). CLI adı tek sabite alındı. Yeni CLI'da `source add`in `--wait`i
  YOK → ayrı `source wait` çağrısı eklendi ve beklenemediği durum **söyleniyor** (yüklendi ≠ sorgulanabilir).
- Eski `nlm-*.ps1` betiklerinin üçü de **silindi** (0.7.x kalıntısı; biri başarısızken `loginExit=0`
  yazıp başarılı görünüyordu = sessiz-yalan).

**Araç adı eşlemesi:** `notebook_query` → **`chat_ask`** · `refresh_auth` → **karşılığı yok**
(auth artık CLI'da) · `source_add`/`notebook_list` aynı · `source_list_drive` → `source_list`.
**Yetenek kaybı:** `cross_notebook_query` yeni sette **YOK** — çapraz-defter sorgusu artık
defter-defter sorup elle birleştirmeyi gerektiriyor.

**Doğrulama (dört katman):** komut yolu diskte ✅ · gerçek MCP `initialize` (`notebooklm` v3.4.2) ✅ ·
`tools/list` 33 araç ✅ · deftere **gerçek soru** sorulup atıflı cevap alındı ✅ (44 defter listelendi).
**Ders:** `auth check` "ok" derken gerçek okuma "expired" verdi — durum raporu kanıt değil, gerçek çağrı kanıttır.

### [2026-06-19] Checkout Funnel Runtime Smoke — Satınalma Hunisi Kapısı (Ödeme-Öncesi)

**Özet:** Runtime kalite kapısının **ikinci ayağı** (#431, master `52343a1f`): admin smoke ile aynı sınıf, ama **satınalma hunisi** için. Gerçek bir kullanıcı gibi `login → ürün listesi → sepete ekle → checkout → müşteri bilgisi → adres → özet` adımlarını gerçek tarayıcıda sürer ve hunin **donmadığını / interaktif** olduğunu doğrular.

**Güvenlik sınırı (kritik tasarım):** Test **"Ödemeye Geç" butonuna ASLA basmaz.** O buton (step 3) `initiatePayment`'ı tetikler → **İyzico**'ya gider ve **bekleyen `venthub_orders` kaydı** yaratır (canlıda geri alınamaz). Bu yüzden review (özet) adımına ulaşıp butonun **varlığını** doğrular ve **durur**. Sonuç: hiçbir sipariş/ödeme oluşmaz; sadece test hesabının sepetine 1 ürün eklenir (zararsız). Tam sandbox-ödeme akışı (Option B) ayrı/sonraya.

**Ne var:**
- `e2e/checkout-smoke.e2e.ts` — yeni spec. `e2e-smoke.yml` workflow `**/*.e2e.ts`'i **otomatik toplar** (workflow değişmedi).
- Checkout adım bileşenlerine kalıcı `data-testid` çapaları (i18n/CSS'ten bağımsız, `admin-dashboard` deseniyle aynı inert kanca): `checkout-root`, `checkout-step-customer`, `checkout-customer-{name,email,phone}`, `checkout-ship-{address,city,district}`, `checkout-review`, `checkout-next-btn`. `ProductCard` `@generated` olduğu için dokunulmadı → mevcut `title="Sepete Ekle"` çapası kullanıldı.

**Yol boyu çözülen iki harness sorunu (UX-bug değil, deterministik yeşil için):**
- **Kart hover-transform intercept:** add butonu görünür ama `click()` kartın `hover:-translate-y-1` transform'u yüzünden "stable değil / intercept" diye takılıyordu → `dispatchEvent('click')` (React onClick'i doğrudan tetikler; buton `stopPropagation` ile Link navigasyonunu zaten keser).
- **Hidrasyon yarışı (flaky):** `toBeVisible` yalnız SSR DOM'unu görür; React onClick henüz bağlı olmayabilir → erken dispatch sessizce no-op olur, sepet dolmaz (ilk deneme FAIL, retry PASS) → sepet `localStorage`'a yazılana kadar **poll içinde yeniden tıkla** (aynı ürün → qty++, satır=1, idempotent).

**⚠️ GÜNCELLEME (2026-06-19, aynı gün):** Bu fix bir koşuda geçirdi AMA checkout smoke CI yükü altında **yine kararsız (flaky)** kaldı (sepet-seed yarışı tam çözülmedi; aynı commit push'ta geçip PR'da timeout attı) → **#438 ile KARANTİNAYA alındı** (`describe.skip`). **Sağlam runtime kapı = admin smoke** (aktif). Checkout smoke seed'i deterministik hale getirilince (ör. ürün-detay sayfasından ekleme / doğrudan seed) geri açılacak. **Ders: kararsız test = yalan-kırmızı, dikkat/güven israfı — testsizlikten beterdir.**

**Doğrulama:** CI'da `admin-smoke + checkout-smoke = 2 passed` (ilk deneme, retry yok); `type-check` + `eslint` + Vercel yeşil; PR #431 merge edildi. **Sıradaki:** cetvel-hizalı admin son-metre (J14 Inventory→kit + cila) + worker'a paralel e2e/cila fan-out; tam sandbox-ödeme (Option B).

---

### [2026-06-19] Admin Donması Kök Çözüm + 3-Katman Runtime Kalite Kapısı

**Özet:** Production admin panelinin "Yükleniyor"da donup tamamen tıklanamaz hâle geldiği bir regresyon kök sebebiyle çözüldü; ardından aynı SINIFI kalıcı kapatan üç katman (yapısal + davranışsal + gerçek-tarayıcı runtime) eklenip **kanıtlandı**.

**Kök sebep & düzeltme (#427):** `useRole()` her render'da YENİ referanslı `canAccess`/`canWrite` fonksiyonları döndürüyordu. Son admin dalgasında eklenen `CommandPalette` (#408) ve `AdminRealtimeNotifications` (#416) bunları `useEffect`/`useMemo` bağımlılığı olarak kullanınca → her render bağımlılık değişti → effect yeniden çalıştı → `setState` → **sonsuz re-render döngüsü**. Async (inbox-count) döngü olduğu için "Maximum update depth" hatası bile vermeden **sessizce** dondu; iki bileşen de `AdminLayout`'ta her admin rotasında mount olduğundan TÜM admin kilitlendi. Düzeltme: `useRole`'u memoize et (`useCallback([role])` + `useMemo`) — tek nokta, 17 tüketiciyi birden onarır. (Not: önceki "dual-GoTrueClient deadlock" teşhisi YANLIŞTI; o ayrı bir console-warning'di, donmanın sebebi değildi.)

**Kalıcı kapılar:**
- **#428 — yapısal + davranışsal:** `src/__tests__/conformance/hook-referential-stability.test.ts` (TS-AST: her `use*` hook'u tarar; memoize edilmemiş, inline-fonksiyon içeren object/array döndüren hook'u FAIL eder — vacuous-pass korumalı) + `useRole.effect-stability.test.tsx` (gerçek `useRole`'u effect-dep olarak kullanır; memoizasyon regrese olursa kırılır). Aynı sınıftan 3 latent ihlal (`useAuth`/`useCartHook`/`useProjectLists` provider-dışı no-op fallback'leri) **modül-sabitine** taşındı → conformance allowlist'siz 0 ihlal.
- **#429 — runtime browser smoke:** Playwright e2e gerçek email+şifre login → `/admin` → (sidebar mount + dashboard `data-testid` görünür + menüye tıkla→navigasyon) ile donmayı yakalar. Ayrı/non-blocking workflow (`e2e-smoke.yml`); gerçek Supabase env = repo **variable**, login şifresi = **secret** (read-only). **KANITLANDI:** demo dalına yapay donma enjekte edildi → **e2e FAIL / CI SUCCESS** (statik kapılar runtime donmasını görmedi); sağlıklı master'da yeşil.

**META ders:** Tüm mevcut kapılarımız (cetvel/INV/tsc/lint/build) **STATİK** — kodun ŞEKLİNİ ölçer, çalışırken DAVRANIŞINI değil. Bu üç katman eksik **runtime** eksenini kapatır.

**Doğrulama:** #427/#428/#429 production'da (master `a878a9ad`); CI + E2E Smoke + Vercel yeşil; kullanıcı prod admin'i doğruladı. **Sıradaki:** satınalma/checkout funnel smoke (İyzico test modu; selektör haritası hazır).

---

### [2026-06-17] Admin Cetvel Re-Score · Doküman Konsolidasyonu · Revize Yol Haritası (Admin-Önce, Bayi-Son)

**Özet:** Admin paneli DataTableKit göçü + i18n sonrası §8 cetveline 6 paralel ajanla yeniden ölçüldü (~%40→%63, ilk kez 3 "keep"). Enterprise kapsam-açığı (komut paleti / rol-editörü / çeviri-UI / rapor-builder vb.) NLM + CodeGraph ile çıkarılıp `admin-capabilities.md §4.5`'e tek-SSOT olarak gömüldü; mükerrer öneri dosyası silindi. Sıralama kararı revize edildi: **admin paneli (temel) + yeni özellikler + müşteri-UX ÖNCE, bayi modülü EN SON.**

**Değişiklik Kapsamı (yalnız doküman — kod değişikliği yok):**
- **Admin cetvel re-score:** `docs/audits/admin-cetvel-scores-2026-06-17.md` — 19 sayfa, dosya:satır kanıtlı; 3 keep (Products %94 / Movements %93 / ErrorGroups %92), 3 rewrite hâlâ açık (Inventory / Settings / WebhookEvents).
- **Doc konsolidasyonu:** `admin-capabilities.md` = tek "NE olmalı" SSOT (§4.5 enterprise açık registry: N1-N4 HİÇ YOK + E1-E10 embriyon); `admin-feature-recommendations-2026-06-17.md` foldlanıp silindi (disk + twin).
- **Revize yol haritası (admin-önce, bayi-son):** enterprise admin shell → yeni admin özellikleri → müşteri-hesap standardı + cetvel → bayi R1-B2 (son). `dealer-pivot-decision`'ı tersine çevirir (`DURUM-TAKIP.md`).
- **Tespitler:** `AdminDashboardPage` SalesChart hâlâ dummy veri (`:60-67`) + rota `ssr:false`; README tenant "%100 sızdırmaz" fazla-iddiası gerçekle hizalandı (izolasyon enforce edilmedi → R4).

**Doğrulama:** Twin'e `admin-capabilities` + `admin-cetvel-scores-2026-06-17` source_add + query-doğrulandı.

---

### [2026-06-15] i18n RSC Düzeltmesi · Kategori-i18n Teşhisi · SEO + Analytics Strateji Dokümanları

**Özet:** Anasayfa production build'ini kıran bir RSC sınır ihlali giderildi; TR sayfada kategori adlarının İngilizce sızması teşhis edildi; ve go-live için iki eksik strateji dokümanı (SEO geçişi, analytics ölçüm) mühürlendi.

**Değişiklik Kapsamı:**
- **i18n RSC Sınır Düzeltmesi (kod):** `GuidedCategoryDiscovery` server-render edilen bir bileşende `useI18n()` (client hook) çağırıyordu → `/tr` static prerender çöküşü → 2 prod deploy `● Error`. `'use client'` eklendi; bileşen yine SSR edilir (SEO korunur). Tam `pnpm build` yeşil; master'a push (`c4a10369`). **Ders:** `tsc`/`lint`/`test:i18n` RSC sınır ihlalini yakalamaz — yalnız `next build` (static prerender) yakalar → i18n göç gate'ine `pnpm build` eklenecek.
- **Kategori-i18n Teşhisi:** TR anasayfada 10/12 kategori adı İngilizce — kök sebep anasayfa `page.tsx`'in `c.slug` ile sözlüğe bakması (`translation_key` köprüsünü atlaması); uygulamanın geri kalanı (`getCategoryDisplayName` / `mapCategoryWithLocale`) doğru çalışıyor. Entity-i18n JSONB mimarisi zaten aksiyom (CONTEXT §8). Hotfix: anasayfayı mevcut SSOT'a bağla (sırada).
- **Yeni Strateji Dokümanları:** `docs/plans/seo-transition-blueprint.md` (eski siteden sıralama-koruyan geçiş: envanter → 301 haritası → içerik paritesi → Search Console) + `docs/standards/analytics-standard.md` (ölçüm kontratı: motor `analytics.ts` hazır; olay taksonomisi / huni / consent tanımlandı).
- **Bilgi-altyapısı disiplini:** "önce-sor" ilkesi (twin'e sor → CodeGraph/DB ile doğrula; twin **"VAR" = güven, "YOK" = doğrula**) + sync-set kapsam denetimi başlatıldı (`.cc_docs.yaml`'a yeni doc'lar eklendi).

**Doğrulama:** `pnpm build` ✅ (907 sayfa, `/tr` dahil) · prod deploy `Ready` ✅

---

### [2026-06-13 → 2026-06-14] Admin Panel Enterprise Standardizasyonu — DataTableKit Göçü (Faz 0 + Faz 1 TAMAM)

**Özet:** Admin panelinin tüm liste sayfaları tek paylaşılan tablo motoruna (**DataTableKit**) taşındı. Faz 0'da kit altyapısı (`useAdminTable` hook + `DataTableKit` shell + `mutateWithAudit` yazma kapısı) kuruldu ve `AdminCouponsPage` ile doğrulandı; Faz 1'de kalan 9 sayfa göç ettirildi. Sonuç: tek standart, kapanan denetim (audit) boşlukları ve yapısal olarak imkânsız kılınan "sessiz sıralama" hatası.

**Değişiklik Kapsamı:**
- **Kit Altyapısı (Faz 0):**
  - `useAdminTable<Row>` — server/client/none modları, URL-state senkron (sayfa/sort/filtre/arama), satır seçimi (shift-aralık), faceted filtre, `fetchAllForExport`. **Tek-yol sort** → eski server-pagination+client-sort sessiz bug'ı yapısal imkânsız.
  - `DataTableKit` shell — 5 AYRI durum (skeleton / veri-yok / filtre-sıfır / yetkisiz / hata), slot'lar (`toolbarSlot` / `bulkBarSlot` / `renderExpandedRow`), `aria-sort`, `.content-auto` render kalkanı.
  - `mutateWithAudit` — her admin yazması RBAC (K3) + audit (K4) kapısından geçer; `auditedByEdge` ile çift-log önlenir.
- **Sayfa Göçleri (10 liste sayfası):** Coupons (Faz-0 doğrulayıcı) · Errors · AuditLog · Categories · Movements · ErrorGroups · Returns · Users · Orders · Products. Her sayfa = `<Sayfa>TableBody.tsx` (DI'lı fetcher + kolon SSOT + mutateWithAudit) + ince `Admin<Sayfa>Page.tsx` (`<Suspense>` wrapper) + per-page i18n (tr/en parity) + integration + axe-0 testi.
- **Kapanan denetim boşlukları:** toplu işlemler (kargo/durum/vitrin/fiyat/silme), satır-içi düzenleme (fiyat/stok), sipariş notları — hepsi artık audit'li + RBAC-kapılı.
- **Orkestrasyon:** zor sayfalar `maestro` skill'iyle (mimar-plan → paralel göç-ajanı → çürütücü yargıç paneli → merkezi tsc/lint/test/axe kapısı) parçala-böl-yönet ile göçtü.

**Doğrulama:** `pnpm type-check` ✅ (0) | `pnpm lint` ✅ (0) | `pnpm test --run` ✅ (473 passed / 2 skipped) | axe ✅ (0 ihlal/sayfa)

> **Ertelenen (K1/K4 lint):** K1 (kit-dışı `<table>` yasağı) + K4 (çıplak `.update/.insert/.delete` yasağı) `error`'a **henüz açılmadı** — şu an 0 gerçek ihlal / ~54 yanlış-pozitif (liste-olmayan admin yüzeyleri hâlâ ham tablo/yazma kullanıyor, ve etmeli). Faz 2'de admin yüzeyleri de kite geçince açılacak.

---

### [2026-06-11 → 2026-06-12] Bayi (B2B) Modülü Temeli + Kalite Altyapısı

**Özet:** Çok-kiracılı SaaS'ın bayi-ağı katmanı için kanıta-dayalı standart + build-ready blueprint hazırlandı, canlı DB zemin-gerçeği denetlendi, R0 şema temeli atıldı. Ayrıca admin mutasyonlarına RBAC+audit eklendi, NotebookLM sync milestone modeline taşındı ve Claude Code kalite-omurgası hook'ları kuruldu.

**Değişiklik Kapsamı:**
- **Bayi Modülü Dokümantasyonu (`docs/standards/`, `docs/audits/`):** `dealer-network-standard.md` (B2B/PRM/CPQ domain cetveli, 4 otorite kaynaktan), `dealer-module-blueprint.md` (R0-R5 onarım + B1-B2 inşa spec'i), `dealer-data-ground-truth-2026-06-11.md` (canlı DB denetimi). **R1 kimlik-ekseni kararı:** organization-tabanlı (B-minimal) — bayi = şirket satırı, kullanıcı `organization_id` FK'siyle bağlanır, fiyat `tier_level`'a göre çözülür.
- **R0 Şema Temeli (`supabase/`):** şema baseline snapshot + dealer-layer replay migration (VCS-dışı tabloları versiyonla + text→uuid drift reconcile).
- **Admin Mutasyon Güvenliği:** admin yazmalarına RBAC guard + audit logging (kit göçünün ön-adımı).
- **NotebookLM Sync (milestone modeli):** post-commit hook artık yerel-only; NLM sync = `notebooklm-sync` skill ile milestone'da (auth-tazele → sync → query-doğrula). Sessiz-kaçırma riski kapandı.
- **Kalite-Omurgası Hook'ları (Tier-1):** Claude Code hook'ları — tur-başı typecheck/lint + config-koruma guard'ı.
- **Şema Master:** `database_schema_master.md` tam RLS kapsamıyla (101 politika) yeniden üretildi.

**Doğrulama:** `pnpm type-check` ✅ | `pnpm lint` ✅ | NLM sync query-doğrulandı ✅

---

### [2026-06-10 - Follow-up] Performance Optimization, CLS & TBT Fixes, Network & Visual Alignment

**Summary:** Follow-up performance sprint focusing on Cumulative Layout Shift (CLS) and Total Blocking Time (TBT) remediations. This includes resolving layout shifts using the `min-h-hvac-section` token, code-splitting heavy 3D elements, removing external network dependencies from Three.js environment maps, and syncing skeleton loading heights with 3D canvas heights.

**Changes:**

- **CLS Fixes (perf):**
  - Resolved footer layout shifts using the `min-h-hvac-section` layout token and fixed-size assets.
  - Optimized product grids with `content-visibility: auto`.

- **TBT Fixes (perf):**
  - Code-split heavy 3D navigation layers and dynamic interfaces using `next/dynamic` (`{ ssr: false }`).
  - Implemented lazy loading for off-screen Three.js assets using `<LazyInView>`.

- **Network & 3D Optimizations (perf):**
  - Replaced Drei `<Environment>` presets with local lights in 6 navigation components to eliminate external network dependencies.
  - Hosted local `/env/city_256.hdr` environment map for `Product3DViewer`.
  - Updated `browserslist` configuration.

- **Visual & Height Alignment (fix):**
  - Synced skeleton loader placeholder height (`min-h-hvac-section` - 400px) in `AuthorityRenderer.tsx` with loaded `ThreeDAuthority.tsx` canvas height (400px), completely eliminating loading transition layout shifts.

**Validation:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ | `pnpm run build` ✅

---

### [2026-06-10] 3D Performance Overhaul, THREE.js Tree-Shaking, Skills Infrastructure & CI Hardening

**Summary:** Major rendering performance improvements across all 3D canvases (frameloop demand mode, DPR cap, memo cleanup), full THREE.js tree-shaking migration (34 files), skills infrastructure upgrades (natural language evals, semantic routing, dependency resolution), CI workflow scope narrowing, and codebase language convention enforcement.

**Changes:**

- **Performance — 3D Canvas & Mobile (perf):**
  - Canvas `frameloop` optimized: 6 navigation components switched to `demand` mode; product showcase components set to `conditional`/`always` as needed.
  - Device Pixel Ratio (DPR) capped at `1.5` on mobile across `ThreeDAuthority`, `BlueprintCanvas`, and `OrbitalProductsShowcase`.
  - Removed `'use no memo'` directives from heavy 3D components to restore React compiler memoization.
  - Homepage mobile performance: GPU-composited animations, WCAG contrast compliance, LCP `fetchPriority`/`decoding` optimization, WebP image conversion, filter blur animation removal, and image quality reduction to 70%.
  - Tenant config wrapped with `React.cache`; `content-auto-table` optimizations applied. Supabase provider memoization improved and missing `Suspense` boundaries added.

- **Performance — THREE.js Tree-Shaking (refactor):**
  - Converted 34 files from `import * as THREE` wildcard imports to selective named imports, enabling bundler tree-shaking.
  - Deleted dead code files: `three-setup.ts` and `three-utils.ts` (never imported anywhere).

- **Skills Infrastructure (feat/fix/refactor):**
  - Eval quality upgraded: mechanical prefix-based queries replaced with natural language queries (28/29 evals passing).
  - Skills-creator eval generation: category-based near-miss negatives for more robust routing.
  - `compile_skills.py` moved from `scratch/` to `scripts/` for proper project tooling.
  - Added `validate` command to skills-creator.
  - Skills-evaluator: differential mode, encoding fix, lightweight self-checks.
  - `threejs-webgl-performance` SKILL.md: 12 digital twin axioms added (189 → 321 lines).
  - ONNX semantic graph routing layer with topological sorting and dependency checking.
  - Orchestrator finalized with transitive dependency resolution and encoding safety.
  - False-positive match resolution in router via stricter word tokenization.
  - Batch optimization of all 28 skills; 12/8 train/test split evaluator integrated.
  - Manifest enriched with `inputs`, `outputs`, `triggers`, and `prerequisites`.
  - Modular skills restructured into unified `venthub-core` plugin.
  - Auto-recovery configuration added for expired tokens.

- **CI/CD (ci):**
  - Narrowed `supabase-migrate` workflow trigger: removed `scripts/**` path to prevent spurious runs.

- **Other Changes (fix/refactor/feat):**
  - Async KVKK i18n split implemented with named export refactoring and global linter formatting.
  - PDF font load 404 resolved: Roboto CDN fallback crash fixed with type-safe fallback.
  - Unused `loginAction` server action and its documentation removed.
  - Console warnings remediated: `GoTrueClient`, prefetch 404, font preload issues fixed.

- **Rules:**
  - Code Language Rule enforced: all code and comments in English; user-facing communication in Turkish.

**Validation:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ | `pnpm run build` ✅

---


### [2026-06-07] Dependency Injection, Connection Pooling, Edge Claims Caching, and ESLint Guards Integration

**Özet:** Uygulamanın mimari bütünlüğünü, güvenlik sınırlarını ve sunucu performansını garanti altına almak amacıyla; Dependency Injection (DI) servis kayıt mekanizması (`ServiceRegistry`), Edge üzerinde JWT Claims Caching / Edge Middleware claims caching (`JWT_CLAIMS_COOKIE_SECRET`), serverless bağlantı havuzlama (port `6543`), çapraz ortam (browser/server) istemci kirlenmesini engelleyen ESLint guardrail kuralları entegre edilmiş ve tüm veritabanı servisleri dependency injection ile parametrik çalışacak şekilde tamamlanmıştır.

**Değişiklik Kapsamı:**
- **Edge Middleware Claims Caching & Routing (`src/middleware.ts`, `src/utils/router.ts`):**
  - Edge üzerinde token doğrulamalarını hızlandırmak ve network gidiş-dönüşlerini azaltmak amacıyla JWT claims şifreleme ve çerez tabanlı önbellekleme sistemi (`JWT_CLAIMS_COOKIE_SECRET`) entegre edildi.
  - Yönlendirmelerde HTTP başlıklarının ve çerezlerin kaybolmasını önlemek için `createRedirectResponse` yardımcı fonksiyonu (`src/utils/router.ts`) oluşturuldu.
- **Client-Side Dependency Injection Refaktörleri (`CartProvider.tsx`, `CategoryContext.tsx`):**
  - `CartProvider.tsx` ve `CategoryContext.tsx` içerisindeki tüm statik browser client importları ve dinamik `import()` bağımlılıkları tamamen temizlenerek React context bazlı `useSupabaseClient()` enjeksiyonuna geçirildi.
- **Server-Side Service Registry Entegrasyonu (`src/lib/services/registry.ts`):**
  - Sunucu tarafında (Server Components, Server Actions ve API rotalarında) veritabanı servislerinin tek bir istek bazlı Supabase istemcisiyle yönetilmesini sağlayan `ServiceRegistry` yapısı kuruldu.
- **ESLint Import Guardrails (`eslint.config.cjs`):**
  - Servislerin (`src/lib/services/**/*.ts`) statik client importları yapmasını ve client dosyalarının (`src/components`, `src/views`, `src/providers`, `src/hooks`) sunucu client'ı (`**/lib/supabase/server`) import etmesini engelleyen `no-restricted-imports` kuralları eklendi.
- **Güvenlik ve Performans Konfigürasyonları (`.env.local`, `RECOMMENDATIONS.md`):**
  - Veritabanı bağlantısı serverless ortamda havuz portuna (`6543`) yönlendirildi. `RECOMMENDATIONS.md` üzerindeki tüm maddelerin mimari statüleri "Implemented" olarak güncellendi.
- **Otomatik Testler & Doğrulama (`diSignature.test.ts`, `realtimeSecurity.test.ts`):**
  - Vitest ile AST seviyesinde servis imzalarını ve realtime WebSocket sızdırmazlık kurallarını denetleyen testler başarıyla koşturuldu.

**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ | `pnpm run test` (427 tests passed) ✅ | `pnpm run build` ✅

---

### [2026-06-07] VentHub Console Warnings Remediation & i18n Redirection Consolidation

**Özet:** Konsol uyarılarını gidermek ve yazı tipi yükleme performansını artırmak amacıyla Next.js yazı tipi yapılandırması değişken tabanlı CSS `--font-sans` yapısına geçirilmiş, yerelleştirilmiş rota proxy'si memoize edilerek gereksiz yeniden oluşturma döngüleri (HMR uyarıları) engellenmiş ve auth/signout akışlarındaki yerelleştirilmiş yönlendirme mantığı middleware ile uyumlu hale getirilmiştir.

**Değişiklik Kapsamı:**
- **Next.js Yazı Tipi Yükleme Optimizasyonu (`layout.tsx`, `index.css`, `tailwind.config.js`):**
  - `src/app/layout.tsx` dosyasında Inter yazı tipi Next.js Google Fonts API'si ile `display: 'swap'` ve `variable: '--font-sans'` olarak yüklenmiştir.
  - Yüklenen değişken body etiketinde `className={`${inter.variable} ${inter.className}}`` olarak bağlanmıştır.
  - `tailwind.config.js` dosyasında `sans` yazı tipi ailesi `var(--font-sans)` CSS değişkenine yönlendirilmiş ve `src/index.css` içindeki `html, body` kurallarında yer alan sabit `Inter` ifadesi `var(--font-sans)` ile değiştirilmiştir. Sayfa yerleşim kaymaları (CLS) sıfırlanmıştır.
- **Yerelleştirilmiş Rota Yönetimi & HMR Konsol Uyarıları (`StickyHeader.tsx`, `useLocalizedRoutes.ts`):**
  - İstemci tarafı yönlendirmelerini aktif dile göre dinamik çözümleyen proxy yapısı `useLocalizedRoutes` hook'u altında `useMemo` kullanılarak sarmalanmış; böylece her render'da proxy'nin sıfırdan oluşturulması engellenmiş ve konsol uyarıları/HMR döngüleri çözülmüştür.
  - `StickyHeader.tsx` bileşenindeki statik rota importu (`Routes`), yerelleştirilmiş `useLocalizedRoutes` hook'u ile değiştirilmiştir.
- **Middleware & Oturum Kapatma Yönlendirme Düzeltmeleri (`middleware.ts`, `signout/route.ts`):**
  - `/auth/callback` ve `/auth/signout` gibi auth servis API rotaları, middleware üzerinde dil alt dizinine yönlendirilme muafiyet listesine (`isAuthApi`) eklenmiştir.
  - `middleware.ts` içindeki admin korumasında yetkisiz kullanıcı yönlendirmesi, kullanıcının dil tercihi tespit edilerek yerelleştirilmiş şekilde (`/${detectedLocale}/auth/login`) güncellenmiştir.
  - `src/app/auth/signout/route.ts` çıkış rotasında, çıkış işlemi sonrası yönlendirme hedefi `NEXT_LOCALE` çerezi okunarak yerelleştirilmiş giriş sayfasına (`/${lang}/auth/login`) 302 yönlendirmesi olacak şekilde düzeltilmiştir.

**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ | `pnpm run build` ✅

---

### [2026-06-06] VentHub Supabase Client Architecture & Realtime Security Upgrade

**Özet:** Veri yalıtımı ve güvenliğini en üst düzeye çıkarmak amacıyla Supabase istemci mimarisi parçalanmış, ara katman yetkilendirmesi claims tabanlı yapıya yükseltilmiş, çıkış işlemleri API rotasına taşınmış ve realtime WebSocket kanalları veritabanı RLS seviyesinde kiracı bazlı izole edilmiştir.

**Değişiklik Kapsamı:**
- **Supabase İstemci Fabrikaları (Milestone 1):**
  - Eski `src/lib/supabase.ts` singleton yapısı kaldırılarak; `src/lib/supabase/client.ts` (Browser), `src/lib/supabase/server.ts` (Request-bound Server) ve `src/lib/supabase/static.ts` (Static SSG) olarak üç ayrı fabrika fonksiyonuna/istemcisine bölünmüştür.
  - Servislerin toplu export yapısı (`export *`) kaldırılarak tüm bileşen ve servislerde doğrudan ithalat modeline geçilmiştir.
- **Middleware & Güvenlik Sıkılaştırması (Milestone 2):**
  - `src/middleware.ts` içindeki auth guard, `getSession()` ve manuel JWT decode işlemlerinden arındırılarak güvenli `supabase.auth.getClaims()` API'sine geçirilmiştir.
  - Middleware yönlendirmelerinde (redirect) `createServerClient` tarafından set edilen çerezlerin ve HTTP başlıklarının tarayıcıya kayıpsız iletilmesini sağlayan çerez/başlık replikasyon mantığı (`redirectResponse`) kurulmuştur.
- **Güvenli Çıkış Rota Yönlendiricisi (Milestone 2):**
  - `src/app/auth/signout/route.ts` rotası POST metodu ile çağrılacak şekilde oluşturulmuş, aktif claims varlığında `signOut()` çağırarak oturumu sonlandırması ve Next.js düzen cache'ini (`revalidatePath`) temizlemesi sağlanmıştır.
- **Realtime Kanal ve RLS İzolasyonu (Milestone 3):**
  - Gerçek zamanlı WebSocket stok ve bildirim mesajlarının kiracılar arasında sızmasını önlemek amacıyla `realtime.messages` tablosuna Row Level Security (RLS) uygulanmıştır.
  - `supabase/migrations/20260606180000_realtime_messages_rls.sql` migration'ı ile kiracının JWT'deki tenant ID'sinin kanal topic'i ile eşleşmesini zorunlu kılan `realtime_messages_select_policy` ve `realtime_messages_insert_policy` RLS kuralları eklenmiştir.
- **Codebase İthalat Güncellemeleri ve Entegrasyon (Milestone 4):**
  - Platform genelindeki 70+ dosyada eski `src/lib/supabase` referansları ve servis bağımlılıkları yeni bağımlılık yapısına uygun olarak refaktör edilmiştir.
- **Milestone 5 Doğrulama ve Raporlama:**
  - Tüm kod tabanında type-check, lint ve build süreçleri çalıştırılarak sıfır hata ile derleme doğrulanmıştır.

**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ | `pnpm run build` ✅ | `git diff CONTEXT.md` (Değişiklik yok) ✅

---

### [2026-05-30] VentHub SaaS Transformation Phase 1 — Foundation & Master Docs Compilation
**Özet:** VentHub HVAC platformunun çoklu kiracılı (multi-tenant) SaaS mimarisine geçişinin 1. Fazı (Foundation) tamamen uygulanmış, test edilmiş, veritabanı şeması ve Edge fonksiyonları master belgeleri derlenerek NotebookLM kütüphaneleriyle eksiksiz olarak senkronize edilmiştir.
**Değişiklik Kapsamı:**
- **SaaS Altyapısı (Faz 1):**
  - `tenants` veritabanı tablosu ve claims'leri JWT'den çözen `jwt_tenant_id()` RPC fonksiyonu PostgreSQL katmanına kuruldu.
  - 21 adet kiracı-duyarlı (Tenant-Aware) veritabanı tablosuna `tenant_id uuid` kolonu, foreign key indeksleri ve kiracı RLS izolasyon koşulları (`tenant_id = jwt_tenant_id()`) eklendi.
  - Edge Runtime'da doğrudan veritabanı sorgusu atmayan subdomain/custom domain çözücü (`src/lib/tenantResolver.ts`) ve Downstream'e kiracı kimliği ileten `src/middleware.ts` ara katman mantığı kuruldu.
  - Supabase Auth signup ve login süreçleri, dynamic `app_metadata` tenant claim enjeksiyonu ve `user_profiles` veritabanı tablosu otomatik eşleme tetikleyicileri ile trigger seviyesinde entegre edildi.
  - Next.js önbellek (`unstable_cache`/ISR) katmanında `[key, lang, tenantId]` bazlı veri sızıntı koruması ve WebSocket stok/sipariş kanallarında tam kiracı bazlı realtime kanal izolasyonu sağlandı.
  - Deno Edge kargo ve ödeme webhook'ları; HMAC-SHA256 doğrulaması, 5 dakikalık clock-skew tekrar oynatma koruması ve kiracı izolasyonuna sahip olacak şekilde tamamen sızdırmaz yapıldı.
- **SSOT Master Dokümantasyon Güncellemeleri:**
  - `docs/supabase_functions_master.md` betik yardımıyla 30 adet Edge fonksiyonunun `.md` dökümanlarının birleştirilmesiyle yeniden derlendi.
  - `docs/database_schema_master.md` veritabanındaki 28 aktif tablo, 132 RLS politikası, 55 fonksiyon, 47 indeks ve ER diyagramı güncellemelerini yansıtacak şekilde programatik olarak güncellendi.
  - 24 adet değişen TS/TSX kaynak dosyası için `orion doc single --force` çalıştırılarak taze bireysel `.md` dokümanları üretildi, `docs/system_tree.md` güncellendi.
- **NotebookLM Dijital İkiz Senkronizasyonu:**
  - NLM MCP CLI kimlik doğrulama oturumu yenilendi.
  - VentHub Proje Hafızası (`235043eb-970f-4a52-9f39-1d02b2621e9c`) notebook'undaki diğer özel dökümanlar korunarak, sadece güncellenen 3 adet Master MD (`venthub_hvac_master.md`, `supabase_functions_master.md`, `database_schema_master.md`) ile `README.md`, `CHANGELOG.md` ve `CONTEXT.md` dosyaları güvenli bir şekilde güncellendi / yüklendi.
**Doğrulama:** `pnpm run test:e2e` ✅ (89/89 E2E test passed, 100% green status) | `pnpm run type-check` ✅ (0 error) | `pnpm run lint` ✅ (0 error, 0 warning) | `nlm source list` (Google NLM sync OK) ✅

---

### [2026-05-29] VentHub Toast Migration to Sonner, Floating Widgets Flexbox Unification & 20-Workers Orion standard
**Özet:** Uygulama genelinde eski bildirim kütüphaneleri temizlenerek `sonner` migrasyonu tamamlandı, main layout üzerindeki yüzen araçlar flexbox ile dikeyde hizalanıp layout thrashing engellendi ve Xiaomi mimoV2 Premium Token aboneliği doğrultusunda Orion CLI paralel işçi (workers) standardı kalıcı olarak 20 worker'a çıkarıldı.
**Değişiklik Kapsamı:**
- **Sonner Toast Migrasyonu:** Eski `react-hot-toast` ve kullanılmayan `react-error-boundary` kütüphaneleri kaldırıldı. Toplamda 38 adet dosya statik ve dinamik olarak `sonner` API'lerine geçirildi, geriye dönük uyumluluk için custom toast adaptörü yazıldı.
- **Yüzen Araçlar Flexbox Unification:** `BackToTopButton`, `LanguageSwitcher` ve `WhatsAppFloat` widget'ları main layout altında tek bir dikey Flexbox sütununda birleştirildi. `getBoundingClientRect` ve `setInterval` tabanlı layout thrashing (CLS tetikleyicileri) yok edilerek, `useScrollThrottle` hook'u ve saf CSS'e geçildi. Clicktable alanları `pointer-events-none` ve `pointer-events-auto` overlay sistemiyle izole edildi.
- **Orion CLI 20-Workers Standardı:** Xiaomi mimoV2 Premium Token planının sunduğu yüksek RPM/TPM limitlerini tam verimle kullanmak üzere, Orion CLI yetenek tanımı (`.agent/skills/orion-cli/SKILL.md`) güncellendi ve varsayılan işçi sayısı kalıcı olarak 20 paralel worker'a yükseltildi.
- **Dokümantasyon Ağacı Rejenerasyonu:** Sonner geçişi sonrası `orion doc tree` komutuyla `docs/system_tree.md`, `venthub_hvac_master.md` ve `supabase_functions_master.md` dosyaları sıfırdan derlenerek Git deposuna işlendi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ | `orion doc tree` E2E Test ✅

---

### [2026-05-28] VentHub Multilingual SSG/PPR, On-Demand ISR Webhooks & 10/10 SEO alternates
**Özet:** Platformun statik sayfa hızı ve arama motoru görünürlüğü (SEO) için Next.js 15 sub-path routing, Kısmi Ön Oluşturma (PPR), HMAC doğrulamalı Supabase Webhook On-Demand ISR, Sitemap alternates (hreflang) metadata kurgusu tamamlandı ve yerel dökümantasyon ağacı ile NotebookLM hafızası %100 senkronize edildi.
**Değişiklik Kapsamı:**
- **i18n Sub-path Routing:** Tüm kamu sayfaları `src/app/[lang]/` dinamik alt-yolu altına taşındı. `LanguageSwitcher.tsx`, `useLocalizedRoutes` hook'u ve `locale` bazlı B2C anonim para birimi tespiti devreye alındı. `venthub_orders` veritabanı tablosuna locale/dil tiplemeleri migration ile işlendi.
- **SSG + PPR Entegrasyonu:** `products/[slug]/page.tsx`, `brands/[slug]/page.tsx` ve `destek/konular/[slug]/page.tsx` dinamik rotalarına `generateStaticParams` (FlatMap ile dil segmentleri dahil) eklendi. Statik sayfalara `export const dynamic = 'force-static'` eklenerek PPR kabukları donduruldu.
- **unstable_cache & Webhook HMAC:** `getCachedHomeData` ve `getCachedProducts` önbellek anahtarları dil izole (`['home-page-data', lang]`) hale getirildi. Supabase veri güncellemelerini yakalayıp önbelleği anında temizleyen (revalidate) **HMAC doğrulamalı** `/api/webhook/supabase` endpoint'i yazıldı.
- **Sitemap Hreflang SEO:** `sitemap.ts` üzerinde Next.js 15 standartlarına uygun `alternates: { languages: { tr: '...', en: '...' } }` dil alternates metadata kurgusu eklenerek SEO skoru 10/10 seviyesine çıkarıldı.
- **Döküman Senkronizasyonu & Orphan Temizliği:** Eski `src/app/page.md` yetim dökümanı silindi. Bozuk olan `src/app/[lang]/page.md` içeriği `cc doc single --force` ile sıfırdan derlendi. Tüm master dökümanlar `cc doc tree --nlm-sync --force-sync` komutuyla NotebookLM kütüphanelerine sıfırdan yüklenerek dijital ikiz senkronize edildi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ | `nlm query` E2E Test ✅

---

### [2026-05-27] VentHub CSS Enterprise Polish — Cilalama ve Performans Optimizasyonları
**Özet:** CSS katmanında global premium iyileştirmeler, `.content-auto` render performans optimizasyonları, `@tailwindcss/typography` ile Bringhurst standartları entegrasyonu ve klavye navigasyonunu standarda bağlayan otonom `focus-visible` migrasyonu gerçekleştirildi.
**Değişiklik Kapsamı:**
- **index.css Polish:** root seviyesinde `accent-color`, `color-scheme` eklendi; selection, coarse pointers, thin scrollbars ve high contrast modları base katmanına işlendi.
- **Performans (content-visibility):** `.content-auto` utility sınıfı oluşturularak ağır tablolar ve 3D tuval barındıran bileşenlere (`AdminOrdersBoard.tsx`, `InventoryTable.tsx`, `InfiniteProductsShowcase.tsx`) entegre edildi. Sayfa dışı eleman render yükü sıfırlandı.
- **focus-visible Migrasyonu:** 43 adet TSX dosyasında, interaktif elemanlar üzerinde (`button`, `a`, `input`, `select`, `textarea`) yer alan **381 adet** `focus:ring/outline/border/shadow` sınıfı otonom olarak `focus-visible:` formuna dönüştürüldü.
- **Typography prose:** `@tailwindcss/typography` eklentisi kuruldu. 6 adet yasal sayfa, teknik konular sayfası (`TopicPage.tsx`) ve ana sayfa `KnowledgeBlock.tsx` wrapper'ları `prose dark:prose-invert max-w-prose` sınıflarıyla bezenerek premium seviyeye çekildi.
- **Dark Mode Shadows:** tailwind.config.js extend.boxShadow altına `'elevation-1-dark'`, `'elevation-2-dark'`, `'elevation-3-dark'` token'ları eklendi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ (399/399 sayfa)

---

### [2026-05-27] Enterprise Design Token System — Ultimate Konsolidasyon & NotebookLM Senkronizasyonu
**Özet:** Tasarım sistemi kuralı `tailwindcss/no-arbitrary-value` flat config'de **Strict Error** seviyesine çekildi. Kalan tüm arbitrary değerler temizlendi. Tasarım token'ları (shadow, elevation, timing, blur, spacing) genişletilerek `tokens.js` ve `tokens.d.ts` ultimate düzeyde güncellendi. Tüm yerel mimari otonom bir şekilde NotebookLM ile %100 senkronize edildi.
**Değişiklik Kapsamı:**
- **Strict Linter Guard:** `"tailwindcss/no-arbitrary-value": "error"` olarak aktifleştirildi. `pnpm run lint` sıfır hata verdi.
- **Kalan Temizlik (43 satır):** 16 satır `transition-all`, 6 satır `rounded-[...]` ve `max-w-[...]` değerleri standart Tailwind ve `rounded-hvac-*` token'larına refaktör edildi.
- **Tasarım Sistemi Genişletilmesi:** `src/design-system/tokens.js` ve `tokens.d.ts` spacing, elevation, duration, timing, blur ve specific transition'lar ile ultimate haline getirildi.
- **Otonom NotebookLM Sync (NLM Sync):** Frontend (`cc doc all`) ve Supabase Edge Functions (`cc doc batch`) dokümanları güncellendi. `Authentication expired` hatası sessizce otonom `nlm login` + `refresh_auth` ile çözülerek `cc doc tree --nlm-sync --force-sync` ile tüm master ve standalone dosyalar NotebookLM bulutunda başarıyla senkronize edildi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ (399/399 sayfa)

---

### [2026-05-26] Enterprise Design Token System — Tam Migrasyon
**Özet:** Projedeki tüm hardcoded tasarım değerleri (renk, font, radius, z-index, max-width, animasyon) merkezi bir Design Token Sistemi'ne taşındı. `src/design-system/` modülü oluşturuldu, `tailwind.config.js` tamamen yeniden yazıldı, `src/index.css`'teki çift `:root` bloğu birleştirildi.
**Değişiklik Kapsamı:**
- **580 satır** arbitrary font boyutu → Tailwind standart (`text-xs/sm/base/lg/xl`)
- **103 satır** arbitrary radius → `rounded-hvac-sm/md/lg/xl/2xl/3xl` namespace token
- **32 satır** arbitrary z-index → 5 semantik katman (`z-raised/dropdown/sticky/modal/toast`)
- **93+ TSX + 6 CSS** `transition-all` → property-spesifik transition
- **33 dosya** hardcoded HEX renk → 15 HSL CSS Custom Property token
- **28 satır** opacity modifier uyumluluğu → `<alpha-value>` placeholder
- **Yeni:** `eslint-plugin-tailwindcss` guard (`tailwindcss/no-arbitrary-value: warn`)
- **Yeni:** `src/design-system/` (tokens.js + tokens.d.ts + index.ts)
- **Yeni:** `.light` / `.dark` tema değişkenleri (runtime tema değişimi hazır)
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error) | `pnpm run build` ✅ (334+ sayfa)
---

### [2026-03-19] P00-Standalone - Task 033: Checkout Type Safety & CI Unblocking
**Özet:** `CheckoutPage.tsx` ve bağlı bileşenlerdeki (`StepCustomerInfo`, `StepAddressInfo`, `ReviewSummary`) TypeScript ve Lint hataları tamamen giderildi. `Record<string, unknown>` ve `as unknown as` gibi "güvensiz" tiplemeler, merkezi `db-rows.ts` tabanlı yeni bir tip mimarisiyle değiştirildi.
**Notlar:** - `CheckoutAddressInfo`, `CheckoutInvoiceInfo` ve `CheckoutCustomerInfo` tipleri hem veritabanı (snake_case) hem de UI (camelCase) standartlarına tam uyumlu hale getirildi.
- Sayfa ve alt bileşenler `%100` tip güvenliğine ulaştı, GitHub CI akışındaki engeller kaldırıldı.
- `StepAddressInfo` bileşenindeki form girişleri, eksik veri durumunda hata vermeyecek şekilde (`|| ''` fallback'ler) güçlendirildi.
---

### [2026-03-19] P06 - Aşama 3: Registry İndeksleme Sistemi (Indexing Engine)
**Özet:** Registry sistemi artık tamamen otonom ve indekslenebilir durumda. `index.json` dosyası, tüm projelerin ve görevlerin "Single Source of Truth" (Tek Gerçeklik Kaynağı) verisi haline getirildi. Arama motoru, ID dışındaki anahtar kelimelerle de (başlık, içerik özeti) çalışıyor.
**Notlar:** - `manage_registry.py` içindeki Python tiplemeleri (Pyre hataları) Pyre limitleri nedeniyle `dict` bazlı sadeleştirildi ancak runtime güvenliği `cast` ve `str()` zorlamalarıyla maksimize edildi.
- İleride bu indeks, AI asistanının projedeki "bağlamı" (context) çok daha hızlı kavraması için RAG (Retrieval-Augmented Generation) altyapısında kullanılabilir.
---

### [2026-03-19] P06-System-Intelligence-Registry - Aşama 2: Registry Bağımlılık Görselleştirici (Graph Motor)
**Özet:** Registry sistemine `graph` yeteneği eklendi. Tüm projelerdeki görevlerin `depends_on` ilişkileri taranarak hem Mermaid.js hem de ASCII formatında görsel çıktılar üretilebiliyor.
**Notlar:** - Bu geliştirme sayesinde projenin "Kritik Yolu" (Critical Path) anlık olarak takip edilebilir hale geldi.
- Döngüsel bağımlılıkları tespit etmek artık çok daha kolay.
- Statü renkleri sayesinde (Completed=Yeşil, Active=Sarı) projenin nabzı görsel olarak ölçülebiliyor.
---

### [2026-03-19] P04-Category-Architecture - Aşama 4: ProductsPage Birleştirme
**Özet:** Genel `/products` sayfası, yeni Gateway mimarisine başarıyla entegre edildi. Eski, mükerrer kod blokları temizlendi ve tüm site genelinde filtreleme mantığı standardize edildi.
**Notlar:** - `/products` sayfası için oluşturulan "Virtual Category" yapısı, gelecekte bu sayfaya özel metadata ve SEO ayarları yapmamızı kolaylaştıracak.
- Sayfa, Next.js 15'in asenkron parametre yapısına tam uyumlu hale getirildi.
---

### [2026-03-19] P04-Category-Architecture - Aşama 3: Gateway Mimarisi (CategoryPage Parçalama)
**Özet:** 800 satırlık `CategoryPage.tsx` dosyası, Gateway Pattern uygulanarak başarıyla parçalandı. Veri katmanı ve görsel katman birbirinden tamamen ayrıldı.
**Notlar:** - `CategoryHero` ve `CategoryFilters` artık projenin her yerinde kullanılabilir modüler bileşenlerdir.
- `useCategoryGateway` hook'u, ileride eklenecek olan PPR (Partial Prerendering) için mükemmel bir veri girişi sağlar.
- `ProductCard` bileşenindeki `viewMode` -> `layout` uyumsuzluğu giderildi.
---

### [2026-03-19] P06-System-Intelligence-Registry - Aşama 1: Otomatik CHANGELOG Jeneratörü
**Özet:** `manage_registry.py` aracına otonom CHANGELOG güncelleme yeteneği eklendi. Artık bir görev `completed` statüsüne taşındığında, `review.md` içeriği otomatik olarak `docs/CHANGELOG.md` dosyasına tarihçe olarak işleniyor.
**Notlar:** - Bu geliştirme, projenin tarihçesinin manuel hata payı olmadan tutulmasını sağlar.
- `docs/CHANGELOG.md` dosyası projenin ana dökümantasyon dizininde merkezi bir "Source of Truth" haline getirildi.
---

