# DURUM TAKİP — Canlı Çalışma Panosu

> Tek "neredeyiz?" kaynağı. Daldan dala geçince buraya bak. Her önemli adımda güncellenir.
> **Son güncelleme: 2026-06-19** — **P0 admin donması kök çözüm + 3-katman runtime kalite kapısı production'da** (master `a878a9ad`). `useRole` render-loop'u (#427) admin'i "Yükleniyor"da donduruyordu → memoize; aynı SINIF kalıcı kapatıldı: yapısal+davranışsal hook-stabilite testleri (#428) + **gerçek-tarayıcı Playwright e2e admin smoke** (#429, KANITLANDI: yapay donma→e2e-FAIL/CI-SUCCESS). Sıradaki: checkout funnel smoke (İyzico test modu; selektör haritası hazır). Önceki (2026-06-18): Admin §8 **2. dalga** (5 PR #400-#404 + INV-6 keystone #398) production'a alındı → §8 TAM kapandı. Önceki (2026-06-17): admin cetvel YENİDEN ölçüldü (~%40→%63, 3 keep; `docs/audits/admin-cetvel-scores-2026-06-17.md`); doc konsolidasyonu (`admin-capabilities.md` = tek SSOT, §4.5 enterprise açık registry; mükerrer `admin-feature-recommendations` silindi); ve **yeni sıralama kararı: ADMIN-ÖNCE, BAYİ-SON** (aşağıda); + **standart-önce alt-kararı:** §8 açıkları (3 fake rewrite: Inventory/Settings/Webhook) E1 shell'den ÖNCE dünya-standardına getirilir.

## 🚦 Şerit Panosu (append-only — her Controller YALNIZ kendi bölümüne yazar)

> Kural: `collaboration-protocol.md §0.5 (K1/K2)`. İşe başlamadan **claim**, bitince **release**.
> Eş Controller'ın bölümüne **DOKUNMA** — yoksa pano çakışma noktası olur.

### Controller #1 — admin şeridi
- **Aktif (2026-06-19) — P0 donma + RUNTIME KALİTE KAPISI BİTTİ (master `a878a9ad`):** Admin paneli "Yükleniyor"da donup tamamen tıklanamaz oldu (kullanıcının "son güncellemelerinden sonra başladı" dediği regresyon). **Kök:** `useRole()` her render YENİ `canAccess`/`canWrite` döndürüyordu → `CommandPalette` (#408) + `AdminRealtimeNotifications` (#416) bunları effect-dep yapınca sonsuz re-render döngüsü (async inbox-count → "max update depth" bile vermeden sessizce; ikisi de AdminLayout'ta → TÜM admin dondu). **Düzeltme #427:** `useRole` memoize (`useCallback([role])`+`useMemo`) — 17 tüketiciyi birden onarır. (Önceki "dual-GoTrueClient deadlock" teşhisi YANLIŞTI.) **Kalıcı kapılar:** #428 TS-AST hook-stabilite conformance + gerçek-`useRole` effect-stabilite testi (+ `useAuth`/`useCartHook`/`useProjectLists` fallback'leri modül-sabitine → 0 ihlal) · **#429 Playwright e2e admin smoke** (gerçek login→/admin→donma yakalar; ayrı/non-blocking workflow; **KANITLANDI** demo: e2e-FAIL/CI-SUCCESS). **META:** statik kapılar (cetvel/INV/tsc/lint/build) runtime davranışını görmez → bu eksen kapatıldı. **Sıradaki:** satınalma/checkout funnel smoke (İyzico TEST modu, gerçek para yok; selektör haritası çıkarıldı, "Öde"den önce dur). Detay: memory `admin-runtime-smoke-gate` + `admin-freeze-dual-gotrueclient-deadlock`.
- **Önceki:** §8 açık-kapatma **TAM BİTTİ** + **E1 shell** — 1.dalga (7) + 2.dalga (5) + INV-6 keystone + **3.dalga: E1 komut-paleti #408 · J12 Logistics #411 · J13 InventoryReport #410** + cila/kit dalgası (#413/#415/#416/#419/#421/#424) hepsi PRODUCTION'da. Cetvel %63→%83.5/keep 8.
- **Biten — 1. dalga (§8 çekirdek, merged):** #387 = 3 rewrite (Inventory/Settings/Webhook)+**INV-6** sahte-success bekçisi+Settings RLS migration · J1 Dashboard · J3 CSV · J4 Orders · J5 Categories · J6 Users · J7 Returns.
- **Biten — 2. dalga (§8 cila, 2026-06-18, merged):** **#398** INV-6 sertleştirme (Promise.all/allSettled/race = gerçek-etki; J6 kör noktasını kapatır, keystone) · **#400** J9 CategoryBuilder (Zod+dirty-guard) · **#401** J10 InventorySettings (iki-kolon+token) · **#402** J11 OrdersBoard (limit-200 sessiz-tavan→görünür uyarı; worker dummy-await'i gate'te temizlendi) · **#403** J8 Coupons (realtime tenant-scoped+Zod; bundle'lı 369-satır types-regen gate'te ayrıldı) · **#404** J2 Settings-i18n (27 literal).
- **Gate dersleri (2. dalga):** worker'lar gate'i kandıran/şişiren artıklar üretti — INV-6 dead-code dummy (J11), bundle'lı types-regen (J8), .md companion churn (J2). Controller force-push'la worker dalını bozmadı; düzeltilmiş `gate/*` dallarından PR açtı, worker orijinalleri korundu. Bkz. [[admin-section8-wave-shipped]].
- **Biten — 3. dalga (E1 shell + son §8 yüzeyleri, 2026-06-18, merged):** **#408** E1 federe komut paleti (registry SSOT + 10 DI'lı RLS-searcher + RBAC + allSettled) · **#411** J12 Logistics→DataTableKit · **#410** J13 InventoryReport URL-state+DI+token. **Gate dersi:** J12/J13 CI-yeşildi ama Vercel `next build` PATLADI (J12 import-sort=error, J13 typedRoutes tsc'de görünmez) → Controller yerelde gerçek `pnpm build`'le düzeltti; **CI≠Vercel, admin PR'da Vercel ZORUNLU**. Bkz. [[ci-not-equal-vercel-build-gate]]. (J13 worker push'u ulaşmamıştı + .md churn → worktree'den kurtarıldı.)
- **Durum:** ✅ §8 + E1 production'da → 🟡 sıradaki = cetvel-hizalı son-metre + E2 shell. **CETVEL YENİDEN ÖLÇÜLDÜ (2026-06-18):** `admin-cetvel-scores-2026-06-18.md` — **%63→%83.5, keep 3→8**. Kalan hedef-altı 11 sayfa, boşluklar 4 temada: (A) X8 token (B) X6 i18n-fallback (C) **Inventory %64 = tek kit-dışı** (D) D2/D3/D4 detay-CRUD (Faz-2). **Ertelenen:** X5 realtime→R4, L9 detay-rota by-design. **Dispatch bekleyen cetvel işleri (brief hazır):** J14 Inventory→kit · J15 cila-A (OrdersBoard/InvReport/InvSettings token+i18n) · J16 cila-B (CategoryBuilder/Webhook i18n+CSV) · E2 inbox (shell §10.4). **Açık iş:** J8 types-regen ayrı PR (Controller).

### Controller #2 — 3D şeridi
- **Aktif:** 3D **görsel kalite** fazı (conformance BİTTİ). Işık rig **v3 front-lit** master'da → Recep'in görsel onayı bekleniyor (orbit showcase ekran görüntüsü = gözüm).
- **Dal:** iş dalları master'dan **taze**, izole worktree gate (`C:/tmp/vh-gate`, gerçek install); **görsel inceleme MASTER üzerinden** (Recep feature-branch açamaz) → merge-et-göster, beğenmezse revert.
- **Kilit dosyalar:** `src/components/products/3d/core/SceneLightingRig.tsx` (ışık), `src/config/orbitalCarouselConfig.ts` + `OrbitalProductsShowcase.tsx`→`Category3DIcon`→`ProductModelRenderer` (framing/boyut), bu pano (yalnız bu bölüm)
- **Durum:** ✅ conformance kapandı (re-audit 36 dosya/34 temiz · INV-3D-1/2/5/7 canlı · BlueprintCanvas Suspense #396 · audit §0 reconciliation) + Wave3-6 + recipe (FlexibleDuct/DuctFan) + ProductModelRenderer rename hepsi master'da → 🟡 GÖRSEL: ışık v3 #399 (onay bekliyor) → sıradaki: (2) ürün çok-yakın framing · (3) per-model boyut normalizasyon · sonra materyal/post + ordu cila. Tam durum → memory `3d-visual-quality-phase`.

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

---

## Sabit Kararlar (gerekçeli)
- **YENİ (2026-06-17): Admin-önce, bayi-son.** Temel (admin paneli + enterprise özellikler + müşteri-UX) dünya-standardı olmadan bayi inşası efektif değil. `dealer-pivot-decision`'ı tersine çevirir.
- **Bayi kimliği = organization-based, B-minimal** — bayi=şirket; `role` CHECK'e dokunulmaz.
- **Segment/tier = JWT claim (app_metadata, Custom Access Token Auth Hook)** — gerekçe: Supabase resmi benchmark (RLS'te tabloya join ~11.000ms; JWT claim ~7ms) + `user_metadata` yetki için yasak (kullanıcı-değiştirilebilir).
- **Production'a uygulama = yalnız kullanıcının açık komutuyla.**

## Altyapı (arka plan)
- orion `doc schema` bağlandı + parser (101 RLS) + idempotent doc yazımı.
- NLM sync → milestone modeli (post-commit yerel-only); twin güncel (admin re-score + capabilities §4.5 dahil — 2026-06-17 sync'li).
