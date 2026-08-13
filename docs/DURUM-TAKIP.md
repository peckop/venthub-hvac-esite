# DURUM TAKİP — Canlı Çalışma Panosu

> Tek "neredeyiz?" kaynağı. Daldan dala geçince buraya bak. Her önemli adımda güncellenir.
> **Son güncelleme: 2026-08-10 — YAKALAMA (7 haftalık boşluk kapatıldı) + SLUG LOKALİZASYONU CANLI:**
> **(A) Gemini dönemi (Haz sonu–Ağu):** katalog hattı Kademe-1 Gemini orkestrasyonuyla (venthub-pdf-ingestor, M0-M5 çok-ajan, 69/69 pytest) TAMAMLANDI — 28 katalog CSV (374 ürün) + 3 fiyat listesi; walkthrough.md'de seri-bazlı mühendislik notları. **(B) 2026-08-10 denetim+düzeltme günü:** CSV tam denetimi (format ✅, mükerrer 0, fiyat-eşleşme 348/374; tek açık = 230 satır kategori sapması) → 417 düzeltme ingestor master'da · **taksonomi cetveli v1.2** `#455` (12 dal, +parking-jet-fan; ingestor doc-fork kapandı; yeni kategoriler: acid-resistant-fans/frequency-converters/electric-duct-heaters — DB'de Kademe-2'de açılacak) · **TR kategori-adı sızıntısı 4 yüzeyde kapatıldı** `#456` (PDP breadcrumb+özellik, Footer, kategori SEO metadata → getCategoryDisplayName SSOT) · **⭐ SLUG LOKALİZASYONU** `#457` (kanonik=EN slug, görünen URL dile göre `metadata.slug={tr,en}`; `/tr/category/konut-tipi-havalandirma` ✅ 200, eski URL 308; migration prod'a uygulandı+canlı doğrulandı; SSOT `docs/plans/slug-localization-2026-08-10.md`). NLM MCP arızası kökten çözüldü (Gemini Notebook rebrand + `nlm login --clear`; memory `nlm-auth-issue`). İş bölümü modeli oturdu: **Fable=controller (plan/brief/kapı/migration), Opus subagent=kod, script=deterministik veri.** **ZİNCİR SIRADAKİ: Kademe-2 loader (CSV→DB + 4 yeni kategori migration'ı) → ₺0-fiyat "teklif al" ara-çözümü → fiyat motoru (177 fiyatsız) → görseller (390).**
> **Son güncelleme: 2026-06-19 (akşam) — 4-İŞ BATCH MASTER'DA + canlı DB doğrulandı:** (1) **types-sync** `database.types.ts` regen `#440` · (2) **checkout smoke deterministik DÜZELTİLDİ → karantinadan ÇIKTI** (ürün-detay `pdp-add-to-cart` + href-goto; actionability flaky'si bitti; **3/3 yeşil** koşu) `#442` · (3) **moderator rolü** `user_profiles_role_check`'e eklendi `#443` — **migration PROD DB'ye uygulandı ve canlıdan DOĞRULANDI** (kısıt artık moderator kabul ediyor; "Moderatör yap" butonu çalışır) · (4) **Faz-2 Detay-CRUD archetype** (Orders/Settings/Categories modal, Zod+dirty-guard) `#444` + Controller'ın eklediği 2 düzeltme: sipariş statüsü **monoton guard** (iptal/iade serbest, terminal→aktif geri-alma yasak, iptal→iade ilerlemesi serbest) + Order/Settings i18n. **Master CI/E2E yeşil. Cetvel D2/D3/D4 + types-sync KAPANDI.**
> **Önceki: 2026-06-19** — **Runtime kalite kapısı 2. ayak: checkout funnel smoke MERGED** (master `52343a1f`, #431). Satınalma hunisinin TÜM ödeme-öncesi adımları (login→sepete ekle→müşteri→adres→özet→"Ödemeye Geç" var) gerçek tarayıcıda boot+donma-yok doğrulanır; **"Öde"ye ASLA basılmaz** (İyzico/`venthub_orders` yok); ilk koşuda yeşildi AMA sonradan CI yükü altında **kararsız (flaky)** çıktı (sepet-seed yarışı tam çözülmedi) → **#438 ile KARANTİNAYA alındı** (`describe.skip`). **Sağlam runtime kapı = admin smoke** (aktif/yeşil). Checkout smoke seed'i deterministik hale gelince geri açılacak. Önce (aynı gün): **P0 admin donması kök çözüm + 3-katman runtime kapı** (#427 `useRole` memoize · #428 hook-stabilite conformance · #429 admin e2e smoke; KANITLANDI yapay donma→e2e-FAIL/CI-SUCCESS). **Admin cetvel son-metre ZATEN BİTTİ** (hepsi master'da, 2026-06-18): J14 Inventory→kit `#413` · J15 cila-A `#421` · J16 cila-B `#415` · E2 inbox `49c9ca84`. **Gerçek sıradaki:** types-sync (`database.types.ts` regen, Controller) + Faz-2 Detay-CRUD archetype (D2/D3/D4: Orders/Settings/Categories modal). ⚠️ **DÜZELTME 2026-06-19:** bu işler 06-18'de bitmişti ama doc yanlışlıkla "bekliyor/sıradaki" diyordu → bitmiş işin worker'a yeniden dağıtılmasına ve saatlerin boşa harcanmasına yol açtı. Bir daha olmaması için bitmiş işler PR no'larıyla işaretlendi. Önceki (2026-06-18): Admin §8 **2. dalga** (5 PR #400-#404 + INV-6 keystone #398) production'a alındı → §8 TAM kapandı. Önceki (2026-06-17): admin cetvel YENİDEN ölçüldü (~%40→%63, 3 keep; `docs/audits/admin-cetvel-scores-2026-06-17.md`); doc konsolidasyonu (`admin-capabilities.md` = tek SSOT, §4.5 enterprise açık registry; mükerrer `admin-feature-recommendations` silindi); ve **yeni sıralama kararı: ADMIN-ÖNCE, BAYİ-SON** (aşağıda); + **standart-önce alt-kararı:** §8 açıkları (3 fake rewrite: Inventory/Settings/Webhook) E1 shell'den ÖNCE dünya-standardına getirilir.

## 🚦 Şerit Panosu (append-only — her Controller YALNIZ kendi bölümüne yazar)

> Kural: `collaboration-protocol.md §0.5 (K1/K2)`. İşe başlamadan **claim**, bitince **release**.
> Eş Controller'ın bölümüne **DOKUNMA** — yoksa pano çakışma noktası olur.

### Controller #1 — admin şeridi
- **Biten (2026-06-19 akşam) — 4-İŞ BATCH MASTER'DA (master `5e5d9229`):** (1) **types-sync** regen `#440` (boş-dosya hatası: `>` redirect + CLI access-token; MCP/`cmd` ile çözüldü) · (2) **checkout smoke** deterministik düzeltildi → **karantinadan çıktı** (`#442`): karta `click()` actionability'de flaky'di → href alıp `page.goto` (ürün-detay `pdp-add-to-cart`); **3/3 bağımsız yeşil** koşuyla doğrulandı, ANCAK tek-yeşille merge edip master'da kırmızı yakma hatası (#441) yapıldı→geri düzeltildi · (3) **moderator** `#443`: `user_profiles_role_check`'e `moderator` eklendi, **migration prod'a OTOMATİK uygulandı + canlıdan doğrulandı** (NLM ikiz + grep + RLS `is_staff_user` zaten moderator içeriyordu → tek eksik DB kısıtıydı; **B=koddan-sil yanlıştı, A=DB'ye-ekle doğruydu**) · (4) **Faz-2 Detay-CRUD** (Orders/Settings/Categories modal, Zod+dirty-guard) `#444`: worker yazdı, Controller inceledi (audit/RBAC/zod/dirty-guard PASS, ayar kaybı YOK) + **2 gerçek fix ekledi:** sipariş **monoton statü guard** (kullanıcı yakaladı: iptal→iade ilerlemesi serbest, sadece terminal→aktif yasak) + Order/Settings i18n (tr/en parity). **Ders:** kararsız testi tek-yeşille merge etme (3+ koşu); bitmiş işi dağıtmadan `git log`'dan doğrula; rol eklerken NLM+grep+RLS ile tam-resmi gör. Detay: memory `admin-runtime-smoke-gate` · `verify-live-state-before-cross-tool-brief`.
- **Önceki (2026-06-19) — CHECKOUT FUNNEL SMOKE BİTTİ (master `52343a1f`, #431):** Runtime kalite kapısının 2. ayağı. `e2e/checkout-smoke.e2e.ts`: gerçek login → `/tr/products`'tan sepete ekle → `/tr/checkout` → adım 1 (müşteri) mount+interaktif → adım 2 (adres) → adım 3 (özet) → **"Ödemeye Geç" butonu VAR doğrula, ASLA tıklama** (o buton `initiatePayment`→İyzico+bekleyen `venthub_orders`; canlıda geri alınamaz). Sipariş/ödeme YOK. Checkout adım bileşenlerine kalıcı `data-testid` çapaları (ProductCard `@generated`→mevcut `title="Sepete Ekle"` kullanıldı). **İki harness sorunu çözüldü:** kart hover-transform intercept→`dispatchEvent('click')`; hidrasyon yarışı (flaky)→poll-içi-retry (idempotent qty++). İlk koşuda 2 passed'di AMA checkout smoke sonradan CI'da yine **flaky** çıktı (sepet-seed yarışı) → **#438 ile KARANTİNA** (`describe.skip`); **admin smoke sağlam/aktif kaldı.** `e2e-smoke.yml` yeni spec'i otomatik topladı (workflow değişmedi). **Ders: kararsız test = yalan-kırmızı, testsizlikten beter; seed deterministik olunca geri açılır.** Detay: memory `admin-runtime-smoke-gate`. **Sıradaki (DÜZELTİLDİ):** J14/J15/J16/E2 **zaten BİTMİŞTİ** (master'da: `#413`/`#421`/`#415`/`49c9ca84`) — doc yanlışlıkla "bekliyor" diyordu, ben de bitmiş işi worker'a yeniden dağıttım (hata). Gerçek kalan: types-sync (Controller) + Faz-2 Detay-CRUD (D2/D3/D4).
- **Önceki (2026-06-19) — P0 donma + RUNTIME KALİTE KAPISI BİTTİ (master `a878a9ad`):** Admin paneli "Yükleniyor"da donup tamamen tıklanamaz oldu (kullanıcının "son güncellemelerinden sonra başladı" dediği regresyon). **Kök:** `useRole()` her render YENİ `canAccess`/`canWrite` döndürüyordu → `CommandPalette` (#408) + `AdminRealtimeNotifications` (#416) bunları effect-dep yapınca sonsuz re-render döngüsü (async inbox-count → "max update depth" bile vermeden sessizce; ikisi de AdminLayout'ta → TÜM admin dondu). **Düzeltme #427:** `useRole` memoize (`useCallback([role])`+`useMemo`) — 17 tüketiciyi birden onarır. (Önceki "dual-GoTrueClient deadlock" teşhisi YANLIŞTI.) **Kalıcı kapılar:** #428 TS-AST hook-stabilite conformance + gerçek-`useRole` effect-stabilite testi (+ `useAuth`/`useCartHook`/`useProjectLists` fallback'leri modül-sabitine → 0 ihlal) · **#429 Playwright e2e admin smoke** (gerçek login→/admin→donma yakalar; ayrı/non-blocking workflow; **KANITLANDI** demo: e2e-FAIL/CI-SUCCESS). **META:** statik kapılar (cetvel/INV/tsc/lint/build) runtime davranışını görmez → bu eksen kapatıldı. **Sıradaki:** satınalma/checkout funnel smoke (İyzico TEST modu, gerçek para yok; selektör haritası çıkarıldı, "Öde"den önce dur). Detay: memory `admin-runtime-smoke-gate` + `admin-freeze-dual-gotrueclient-deadlock`.
- **Önceki:** §8 açık-kapatma **TAM BİTTİ** + **E1 shell** — 1.dalga (7) + 2.dalga (5) + INV-6 keystone + **3.dalga: E1 komut-paleti #408 · J12 Logistics #411 · J13 InventoryReport #410** + cila/kit dalgası (#413/#415/#416/#419/#421/#424) hepsi PRODUCTION'da. Cetvel %63→%83.5/keep 8.
- **Biten — 1. dalga (§8 çekirdek, merged):** #387 = 3 rewrite (Inventory/Settings/Webhook)+**INV-6** sahte-success bekçisi+Settings RLS migration · J1 Dashboard · J3 CSV · J4 Orders · J5 Categories · J6 Users · J7 Returns.
- **Biten — 2. dalga (§8 cila, 2026-06-18, merged):** **#398** INV-6 sertleştirme (Promise.all/allSettled/race = gerçek-etki; J6 kör noktasını kapatır, keystone) · **#400** J9 CategoryBuilder (Zod+dirty-guard) · **#401** J10 InventorySettings (iki-kolon+token) · **#402** J11 OrdersBoard (limit-200 sessiz-tavan→görünür uyarı; worker dummy-await'i gate'te temizlendi) · **#403** J8 Coupons (realtime tenant-scoped+Zod; bundle'lı 369-satır types-regen gate'te ayrıldı) · **#404** J2 Settings-i18n (27 literal).
- **Gate dersleri (2. dalga):** worker'lar gate'i kandıran/şişiren artıklar üretti — INV-6 dead-code dummy (J11), bundle'lı types-regen (J8), .md companion churn (J2). Controller force-push'la worker dalını bozmadı; düzeltilmiş `gate/*` dallarından PR açtı, worker orijinalleri korundu. Bkz. [[admin-section8-wave-shipped]].
- **Biten — 3. dalga (E1 shell + son §8 yüzeyleri, 2026-06-18, merged):** **#408** E1 federe komut paleti (registry SSOT + 10 DI'lı RLS-searcher + RBAC + allSettled) · **#411** J12 Logistics→DataTableKit · **#410** J13 InventoryReport URL-state+DI+token. **Gate dersi:** J12/J13 CI-yeşildi ama Vercel `next build` PATLADI (J12 import-sort=error, J13 typedRoutes tsc'de görünmez) → Controller yerelde gerçek `pnpm build`'le düzeltti; **CI≠Vercel, admin PR'da Vercel ZORUNLU**. Bkz. [[ci-not-equal-vercel-build-gate]]. (J13 worker push'u ulaşmamıştı + .md churn → worktree'den kurtarıldı.)
- **Durum:** ✅ §8 + E1 production'da → 🟡 sıradaki = cetvel-hizalı son-metre + E2 shell. **CETVEL YENİDEN ÖLÇÜLDÜ (2026-06-18):** `admin-cetvel-scores-2026-06-18.md` — **%63→%83.5, keep 3→8**. Kalan hedef-altı 11 sayfa, boşluklar 4 temada: (A) X8 token (B) X6 i18n-fallback (C) **Inventory %64 = tek kit-dışı** (D) D2/D3/D4 detay-CRUD (Faz-2). **Ertelenen:** X5 realtime→R4, L9 detay-rota by-design. **Dispatch işleri BİTTİ (master'da):** J14 Inventory→kit `#413` · J15 cila-A (OrdersBoard/InvReport/InvSettings token+i18n) `#421` · J16 cila-B (CategoryBuilder/Webhook i18n+CSV) `#415` · E2 inbox (shell §10.4) `49c9ca84`. **Gerçekten açık iş:** types-sync (`database.types.ts` regen, ayrı PR, Controller) + Faz-2 Detay-CRUD (D2/D3/D4).

### Controller — katalog/ticaret + i18n şeridi (Fable oturumu)
- **Biten (2026-08-13) — F5-B KAPANIŞI + hava-perdeleri onarımı + STOREFRONT CETVELİ + registry Aşama-2:** **F5-B D0-D4 tamamı** `#474-481` (D4 legacy-kolon DROP kullanıcı onayıyla, prod doğrulandı; ultrareview 4 gerçek bulguyu merge-öncesi yakaladı) · **sınır-körlüğü kilitleri** `#483` (INV-8 edge-select testi — ilk gün `log-client-error` `_count` hatasını yakaladı · `migration-safety-standard.md` · CI >50MB guard) · doc senkron `#484`/`#485` (taze DB baseline + 12 çekirdek companion) + **post-merge hook** (pull'da otomatik companion üretimi) · **hava-perdeleri sayfa onarımı** `#486`/`#487` + DB `image_url` düzeltmesi (ölü Unsplash 404 → yerel varlık; kırpılan infografik/diyagram + CLS + breadcrumb hiyerarşi; **kök = VentImage primitifi** → FigureImage/PageKit gerekçesi) · **storefront tasarım cetveli v1.0** `#488` (eş-Controller session yazdı; bu session ölçüm-sadakati + token-gerçekliğini bağımsız doğruladı) · **registry Aşama-2 BİTTİ:** 8 iş emri `T.GEN.SIS.1308261527A-H.VH` girildi — **yapısal iş/durum SSOT'u artık registry** (`orion task list --project venthub-hvac` / `orion_durum`); bu pano anlatı + id-referansı taşır (work-tracking-ssot-standard Model A).
- **Biten (2026-08-11) — KADEME-2 TEMİZ YENİDEN KURULUŞ F0-F5A (uçtan-uca, kullanıcı delegasyonuyla):** plan `#463` · **F0** arşiv+tasfiye `#464` (388 legacy ürün + test siparişleri → `archive_pre_kademe2` şeması + repo JSON yedeği; canlı tablolar 0 doğrulandı) · **F1** güvenlik `#465`+onarım (rol kanonikleştirme superadmin→super_admin 12 fonksiyon+13 politika; set_user_admin_role yalnız admin/super_admin; edge çift-CORS fix deploy edildi) · **F2+F3** Split-Model şema `#466`+`#467` (brands + product_families JSONB-i18n + varyant kolonları + tenant_id/RLS/Storage kilidi + CASCADE→RESTRICT + 4 yeni kategori) · **F4** deterministik loader (`scripts/kademe2-load/`) → **374 ürün / 32 aile / 5 marka prod'da** (0 yetim, 374 TR+EN açıklama, 348 EUR alış fiyatı, 161 active + 213 draft) · **F5-A** `#468` (Teklif Alın modeli — ₺0 tarihe karıştı; PDP description_i18n; draft/deleted süpürmesi; 4 kategori aktif + sözlük; types regen). Kapılar: her fazda DB'yi elle doğrulama + tsc 0/lint 0/524 test/build yeşil.
- **Bulgular:** `supabase-migrate.yml` psql hatalarını YUTUYOR ("Files with errors: 48", success döner) — F1/F2 rollback'lerini DB-doğrulamam yakaladı; sertleştirme açık iş. · CSV'lerin beyan ettiği 187 görsel dosyası ingestor diskinde YOK → ürünler görselsiz, görsel temini ayrı iş. · checkout-smoke e2e karantinada (fiyat motoru gelince açılır).
- **Açık (yapısal SSOT = registry, id'ler `T.GEN.SIS.1308261527*.VH`):** **A**=Fiyat Motoru (open; 348 EUR maliyet hazır; tam yüklemenin ön koşulu) · **B**=INV-9 stil-conformance + screenshot taraması (open; cetvel §4-5) · **C**=Görsel temini 187 (open) · **D**=Aile-kartı/Avens zenginleştirme (blocked: C + Recep kararı) · **E**=PageKit göçü (backlog; fiyat motorundan SONRA) · **F**=Companion süpürmesi (backlog) · **G**=Eksen-bazlı tam denetim (backlog) · **H**=Küçük fix paketi EK1/5/6/7 (backlog). Registry-dışı manuel: leaked-password koruması (dashboard) · migrate-workflow sertleştirme · NLM sync (milestone modeli).
- **Kilit dosyalar:** `docs/plans/kademe2-clean-rebuild-2026-08-11.md` (F0-F5 SSOT) · `docs/plans/f5b-family-architecture-plan.md` · `scripts/kademe2-load/` · `docs/archive/db-backup-pre-kademe2/`.

### Controller #2 — 3D şeridi
- **Aktif:** 3D **görsel kalite** fazı (conformance BİTTİ). Işık rig **v3 front-lit** master'da → Recep'in görsel onayı bekleniyor (orbit showcase ekran görüntüsü = gözüm).
- **Dal:** iş dalları master'dan **taze**, izole worktree gate (`C:/tmp/vh-gate`, gerçek install); **görsel inceleme MASTER üzerinden** (Recep feature-branch açamaz) → merge-et-göster, beğenmezse revert.
- **Kilit dosyalar:** `src/components/products/3d/core/SceneLightingRig.tsx` (ışık), `src/config/orbitalCarouselConfig.ts` + `OrbitalProductsShowcase.tsx`→`Category3DIcon`→`ProductModelRenderer` (framing/boyut), bu pano (yalnız bu bölüm)
- **Durum:** ✅ conformance kapandı (re-audit 36 dosya/34 temiz · INV-3D-1/2/5/7 canlı · BlueprintCanvas Suspense #396 · audit §0 reconciliation) + Wave3-6 + recipe (FlexibleDuct/DuctFan) + ProductModelRenderer rename hepsi master'da → 🟡 GÖRSEL: ışık v3 #399 (onay bekliyor) → sıradaki: (2) ürün çok-yakın framing · (3) per-model boyut normalizasyon · sonra materyal/post + ordu cila. Tam durum → memory `3d-visual-quality-phase`.

### Controller #3 — katalog/ticaret şeridi
- **Aktif (2026-06-19) — FİYAT CETVELİ YAZILDI, Recep incelemesinde:** Bu şerit = ürün kataloğunu **doğru kategori + doğru fiyatla** doldurma (full ürün yüklemesinin ön-koşulları). Yürüten: ben (Controller) + Antigravity worker (ürün çıkarım). **İzole worktree'de çalışılır** (`docs/catalog-commerce-foundation` dalı) — paylaşılan ana dizin ikiz tarafından dal-değiştirildiğinden burada commit'lenmemiş iş kaybolur (yaşandı).
- **Yapıldı:** boş kategori gizleme `#435` (`get_category_counts` RPC + CategoryContext tek-nokta filtre, SaaS-uyumlu) · ürün kategorizasyon düzeltme `#436` (67 `category_id=alt` normalize + 12 orphan; prod'a uygulandı; 0 tutarsızlık) · Avensair NLM defteri **24/24** (web kataloğuyla doğrulandı) · kategori cetveli `category-taxonomy-standard.md` v1.1 · **fiyat cetveli `pricing-standard.md` v1.0** (3 paralel araştırma ajanı: Odoo/SAP/Salesforce CPQ + çoklu-para/KDV + canlı yer-gerçeği).
- **ZORUNLU SIRA (her biri öncekine BAĞIMLI — bu yüzden ürün yükleme EN SONDA):**
  1. **Taksonomi** Avensair'e oturt (hâlâ Vortice-şekilli) + TR render doğrula + HRV slug + çatı-fan böl
  2. **Fiyat altyapısı build** (`pricing-standard.md §15`): F0 maliyet+parite (products kolonları + `currency_rates` + TCMB günlük job) → F1 marj motoru (`pricing_rule` + `resolvePrice`, = bayi **R2**) → R0–R5 → B1 admin panel → B2 seed → 359 ürün göç
  3. **Ürün yükleme** (PDF→Supabase, Antigravity worker — araç=skill `.agent/skills/venthub-catalog-importer` HAZIR, **RUN bekliyor**)
  4. **29 borç-ürün** modele oturt (sabit ×46,83 TL sil → € alış + marj + kur + KDV)
- **Bağımlılık kuralı:** ürün yükleme yanlış kategori/fiyatla koşarsa = 29-ürün fiyat borcunun **×100'ü**. Taksonomi + fiyat **ÖNCE**, yükleme **SONRA**. (Worker'ın işi doğru sırada bekliyor; "el atma" değil ön-koşul.)
- **Fiyat kararları (cetvel kilidi):** fiyat **TÜRETİLİR** (cache; elle-yazma yok) · marj merdiveni **ürün > MARKA > kategori > global** (en-özel-kazanır) · base=TRY + **iki kur** (tedarik=snapshot / gösterim=canlı) + TCMB · **NET sakla**, B2C-dahil / B2B-hariç. INV-PRICE-1..4 conformance tanımlı.
- **İlişki:** bu şerit admin/3D şeritlerine ⟂ (dik); fiyat build'i bayi **R2/R5/B2** ile ÖRTÜŞÜR (`pricing-standard §15` entegre). ⚠️ `catalog-ingestion-standard.md` hafızada "var" sanılıyordu, tree'de **YOK** (skill var: `.agent/skills/venthub-catalog-importer`) → yazılacak. Memory: `pricing-currency-requirements` · `category-taxonomy-state` · `catalog-ingestion-system` · `documents-are-the-decision` · `avensair-delivery-roadmap`.

---

## Büyük Resim (zincir)

```
1. STANDART (cetvel) → 2. ANALİZ (cetvelle ölç) → 3. PLAN (ne onarılır/kurulur)
   → 4. DOSYA YAZ (uygulamadan) → 5. UYGULA (yalnız kullanıcı komutuyla)
```

**⚠️ GÜNCELLENDİ 2026-06-18:** Admin §8 dalgası (1. dalga 7 PR + 2. dalga 5 PR + INV-6 keystone) master'a merge edildi → **production'da CANLI** (Vercel master'ı deploy eder). Settings RLS migration de `supabase-migrate.yml` ile **prod DB'ye otomatik uygulandı** (#387 merge tetikledi). **Ders:** master'a migration-içeren dal merge'i = otomatik DB apply; "sadece komutla" istiyorsan migration'ı merge ETME (bkz. [[migration-merge-auto-applies]]). **Bayi (R0/R1) ve diğer migration'lar hâlâ yalnız git'te.**

---

## Üç İş Kolu (thread)

### A) Standartlar (cetvel) — ✅ büyük ölçüde bitti
- `docs/standards/admin-standard.md` (admin NASIL — **§10 shell standardı + §10.4 17-madde cetvel** dahil), `admin-capabilities.md` (admin NE — **§4.5 enterprise açık registry** dahil)
- `docs/standards/dealer-network-standard.md` (B2B domain), `dealer-module-blueprint.md` (R0→B2)
- 🆕 `docs/standards/collaboration-protocol.md` — **çok-ajan işbirliği kuralları** (eş-Controller'lar + ortak Antigravity worker; controller↔controller şerit sahipliği + worktree izolasyonu; bir-iş-bir-dal; deterministik kapı; doküman SSOT). Tüm ajanlar buna uyar; brief'ler buna referans verir.
- 🆕 **Katalog/ticaret kolu (2026-06-19):** `docs/standards/category-taxonomy-standard.md` (kategori taksonomisi v1.1) + `docs/standards/pricing-standard.md` (**fiyat/para-birimi/marj v1.0** — maliyet-artı motor, ürün>marka>kategori>global marj merdiveni, çoklu-para/parite/KDV, R0–R5 entegre build sırası). ⚠️ `catalog-ingestion-standard.md` (worker ürün-çıkarım cetveli) tree'de **YOK** — skill var, cetvel yazılacak.
- ❌ **EKSİK STANDART:** müşteri-hesap / storefront-UX cetveli YOK → `docs/standards/customer-account-standard.md` yazılacak (yeni domain, admin-standard'ın müşteri-tarafı karşılığı)

### B) ANALİZ (cetvelle mevcut uygulamayı ölç)
- ✅ Bayi veri katmanı: `docs/audits/dealer-data-ground-truth-2026-06-11.md` (B2B = "premium yüzey/bozuk")
- ✅ Admin panel ön-denetim: `docs/audits/admin-panel-audit-2026-06-11.md`
- ✅ **Admin cetvel ölçümü TAMAM (2026-06-17):** `docs/audits/admin-cetvel-scores-2026-06-17.md` — ~%63 ort., 3 keep (Products %94/Movements %93/ErrorGroups %92), kalan = son-metre cila + 3 rewrite (Inventory/Settings/WebhookEvents)
- ⬜ **Müşteri-hesap UX ölçümü — YAPILMADI** (standardı yazılınca ölçülecek; "amatör" hipotezi kanıta bağlanacak)

### C) İmplementasyon — **yeni sıraya göre** (aşağı)

---

## YENİ SIRA (kullanıcı kararı, 2026-06-17) — ADMIN-ÖNCE, BAYİ-SON

> **Karar + gerekçe:** Yeni admin özellikleri olmadan "doğru taleplere karşılık veremeyen" bir admin paneli
> üstüne kurulan bayi yönetimi efektif olmaz. Önce admin paneli (temel) + yeni özellikler + müşteri-UX
> dünya-standardı olur; **bayi EN SONA gelir.**
> ⚠️ **Bu, `dealer-pivot-decision` (bayi-önce / admin-Faz2-atla) kararını TERSİNE çevirir — supersedes.**
> Bilinen ödün: Avensair geliri geriye kayar (kabul edildi).
>
> 🔄 **Alt-karar (2026-06-17, standart-önce):** Yeni özellikle (E1 shell) BAŞLAMAK standart-önce ilkesiyle çelişir
> ("zayıf/sahte admin üstüne yeni kat"). Önce ÖLÇÜLEN §8 açıkları dünya-standardına getirilir
> (cetvel = `docs/audits/admin-cetvel-scores-2026-06-17.md`), SONRA shell + yeni özellikler. Sıra buna göre güncellendi (gaps-önce).

| Sıra | İş | Durum | Detay |
|---|---|---|---|
| **0** | Takip dosyalarını güncelle (bu pano + brief) | ✅ bu oturum | — |
| **1** | **§8 AÇIK-KAPATMA — admin sayfalarını dünya-standardına getir** | ✅ **TAM BİTTİ (12 PR + keystone PRODUCTION'da)** | master `a4a8bce4`; INV-6 sahte-success bekçisi sertleştirildi |
| 1a | 3 fake rewrite: Inventory(%21)/Settings(%19)/Webhook(%14) → §8 kit standardı | ✅ #387 merged (+INV-6 +RLS migration uygulandı) | — |
| 1b | Dashboard SalesChart dummy → gerçek son-7-gün | ✅ J1 #394 merged | — |
| 1c | Son-metre sweep (CSV/faceted/bulk/detay/server-pagination) | ✅ J3/J4/J5/J6/J7 merged (AuditLog+Errors/Orders/Categories/Users/Returns) | — |
| 1d | **2. dalga §8 cila** | ✅ **5 PR + keystone merged (2026-06-18)** | #398 INV-6-harden · #400 J9 CategoryBuilder · #401 J10 InvSettings · #402 J11 OrdersBoard · #403 J8 Coupons · #404 J2 Settings-i18n |
| **2** | **Enterprise admin shell** — E1 federe komut paleti + E8 klavye-nav + sol-nav + E2 inbox | ⬜ | brief HAZIR (master) → §8 sonrası |
| **3** | **Yeni admin özellikleri** — N1-N4 (rol-editörü/çeviri-UI/rapor-builder/API-key) + E3-E10 | ⬜ | `admin-capabilities.md §4.5` |
| **4** | **Müşteri-hesap standardı + cetvel + en zayıf yüzeyleri düzelt** (profil/adres/sipariş self-service) | ⬜ | önce `customer-account-standard.md`, sonra ölç→düzelt |
| **5** | **Bayi R1→B2 — EN SON** (artık altyapı = dünya-standardı admin) | ⬜ | R0 dosya hazır; tablo aşağıda |

---

## Bayi Modülü (R0→B2) — referans tablo (artık SON sırada)

| Faz | İş | Durum |
|---|---|---|
| R0 | 5 out-of-band tabloyu versiyonla | ✅ dosya yazıldı + no-op/idempotent **ispatlandı**; **UYGULANMADI** |
| R1 | organization_id FK + app_metadata (Custom Access Token Auth Hook) | ⏳ plan onaylandı, dosya yazılmadı |
| R2 | iki fiyat çözücüyü birleştir + ölü order-validate'i yeniden yaz | ⬜ |
| R3 | cart→order snapshot yazımı (iyzico) | ⬜ |
| R4 | organizations/projects'e tenant_id + RLS (gerçek tenant izolasyonu) | ⬜ |
| R5 | fiyat segment RLS daraltması | ⬜ |
| B1 | bayi/fiyat admin paneli (admin-standard'a göre) | ⬜ |
| B2 | product_prices seed + uçtan-uca kanıt = "Avensair-hazır" | ⬜ |

> 🔒 **İzolasyon ön-koşulu (denetim 2026-06-20):** R4 (`organizations`/`user_projects`/`project_items` `tenant_id` + RLS)
> ve R5, bayi-CPQ iş mantığından (B1/B2) **bağımsız bir güvenlik işidir.** Bugün tek kiracı (`DEFAULT_TENANT_ID`)
> olduğu için sızıntı **YOK**; ama **2. kiracı (Avensair white-label / SaaS Faz 2) eklenmeden ÖNCE R4 zorunludur**
> (data-bleeding kapısı). Yani R4'ü bayi modülünün en-son sırasına **rehin bırakma** — gerektiğinde bayi-CPQ'yu
> beklemeden öne çekilebilir.

---

## Sabit Kararlar (gerekçeli)
- **YENİ (2026-06-17): Admin-önce, bayi-son.** Temel (admin paneli + enterprise özellikler + müşteri-UX) dünya-standardı olmadan bayi inşası efektif değil. `dealer-pivot-decision`'ı tersine çevirir.
- **Bayi kimliği = organization-based, B-minimal** — bayi=şirket; `role` CHECK'e dokunulmaz.
- **Segment/tier = JWT claim (app_metadata, Custom Access Token Auth Hook)** — gerekçe: Supabase resmi benchmark (RLS'te tabloya join ~11.000ms; JWT claim ~7ms) + `user_metadata` yetki için yasak (kullanıcı-değiştirilebilir).
- **Production'a uygulama = yalnız kullanıcının açık komutuyla.**

## Altyapı (arka plan)
- orion `doc schema` bağlandı + parser (101 RLS) + idempotent doc yazımı.
- NLM sync → milestone modeli (post-commit yerel-only); twin güncel (admin re-score + capabilities §4.5 dahil — 2026-06-17 sync'li).
