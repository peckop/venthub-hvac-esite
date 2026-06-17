# DURUM TAKİP — Canlı Çalışma Panosu

> Tek "neredeyiz?" kaynağı. Daldan dala geçince buraya bak. Her önemli adımda güncellenir.
> **Son güncelleme: 2026-06-17** — admin cetvel YENİDEN ölçüldü (~%40→%63, 3 keep; `docs/audits/admin-cetvel-scores-2026-06-17.md`); doc konsolidasyonu (`admin-capabilities.md` = tek SSOT, §4.5 enterprise açık registry; mükerrer `admin-feature-recommendations` silindi); ve **yeni sıralama kararı: ADMIN-ÖNCE, BAYİ-SON** (aşağıda); + **standart-önce alt-kararı:** §8 açıkları (3 fake rewrite: Inventory/Settings/Webhook) E1 shell'den ÖNCE dünya-standardına getirilir.

## 🚦 Şerit Panosu (append-only — her Controller YALNIZ kendi bölümüne yazar)

> Kural: `collaboration-protocol.md §0.5 (K1/K2)`. İşe başlamadan **claim**, bitince **release**.
> Eş Controller'ın bölümüne **DOKUNMA** — yoksa pano çakışma noktası olur.

### Controller #1 — admin şeridi
- **Aktif:** §8 açık-kapatma — 3 fake rewrite (Inventory/Settings/Webhook → §8 kit standardı). **E1 shell SONRAYA kaydı** (standart-önce).
- **Dal:** `feat/admin-page-rewrites` (worker = Antigravity üretir+push+DURUR; gate+merge = #1) · brief = `docs/plans/admin-page-rewrites-brief.md`
- **Kilit dosyalar (worker):** `src/views/admin/{AdminInventoryPage,AdminSettingsPage,AdminWebhookEventsPage}.tsx` (+ ilgili TableBody/servis/kit-tüketim) · **DOKUNMA:** diğer admin sayfaları, 3D şeridi, `.agent/skills`
- **Durum:** 🟡 brief yazıldı → worker'a verilmeyi bekliyor (sonra ben gate: type/lint/test/**build**/§8/INV-*)

### Controller #2 — 3D şeridi
- **Aktif:** 3D standartlaştırma — INV-3D-2 **tek-Canvas KİLİTLİ** (allowlist boş); sıradaki = kapsamlı 3D cetveli (standart-önce) + eski borç süpürmesi
- **Dal:** (şu an) `docs/durum-takip-3d-lane`; iş dalları master'dan **taze** açılır (worktree izole — K0)
- **Kilit dosyalar:** `src/components/products/3d/core/VentHubCanvas.tsx`, `src/__tests__/conformance/3d-single-canvas.test.ts`, (yazılacak) `docs/standards/3d-standard.md`, bu pano (yalnız bu bölüm)
- **Durum:** 🟢 tek-Canvas kilitlendi (#374/#375/#379 — tüm 3D yüzeyleri VentHubCanvas'a taşındı) → 🟡 sıradaki: kapsamlı **3D cetveli** + eski borç (Wave 3 = 23 model · FanRenderer→Product3DViewer rename · INV-3D-5 CSP · INV-3D-6 perf) — standart-önce/worker-judge akışıyla

---

## Büyük Resim (zincir)

```
1. STANDART (cetvel) → 2. ANALİZ (cetvelle ölç) → 3. PLAN (ne onarılır/kurulur)
   → 4. DOSYA YAZ (uygulamadan) → 5. UYGULA (yalnız kullanıcı komutuyla)
```

**Production'a bu güne kadar HİÇBİR ŞEY uygulanmadı.** Tüm migration'lar yalnız git'te dosya + ispat.

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
| **1** | **§8 AÇIK-KAPATMA — admin sayfalarını dünya-standardına getir** | ⏳ aktif | gaps-önce; cetvel = `admin-cetvel-scores-2026-06-17.md` |
| 1a | 3 fake rewrite: Inventory(%21)/Settings(%19)/Webhook(%14) → §8 kit standardı | ⏳ worker'a veriliyor | `feat/admin-page-rewrites` · brief = `docs/plans/admin-page-rewrites-brief.md` |
| 1b | Dashboard SalesChart dummy → gerçek veri (`AdminDashboardPage.tsx:60-67`) | ⬜ | sonraki batch |
| 1c | Son-metre kit-config sweep (faceted/CSV-export/rowHref/bulk — 11 refactor sayfa) | ⬜ | mekanik, sayfa-başı küçük |
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
