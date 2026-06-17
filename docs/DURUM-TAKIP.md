# DURUM TAKİP — Canlı Çalışma Panosu

> Tek "neredeyiz?" kaynağı. Daldan dala geçince buraya bak. Her önemli adımda güncellenir.
> **Son güncelleme: 2026-06-17** — admin cetvel YENİDEN ölçüldü (~%40→%63, 3 keep; `docs/audits/admin-cetvel-scores-2026-06-17.md`); doc konsolidasyonu (`admin-capabilities.md` = tek SSOT, §4.5 enterprise açık registry; mükerrer `admin-feature-recommendations` silindi); ve **yeni sıralama kararı: ADMIN-ÖNCE, BAYİ-SON** (aşağıda).

## 🚦 Şerit Panosu (append-only — her Controller YALNIZ kendi bölümüne yazar)

> Kural: `collaboration-protocol.md §0.5 (K1/K2)`. İşe başlamadan **claim**, bitince **release**.
> Eş Controller'ın bölümüne **DOKUNMA** — yoksa pano çakışma noktası olur.

### Controller #1 — admin şeridi
- **Aktif:** Admin shell E1 (federe komut paleti) + `collaboration-protocol.md` (sahip)
- **Dal:** `feat/admin-shell` (lokal, push yok)
- **Kilit dosyalar:** `admin-standard.md §10`, `admin-capabilities.md §4.5`, `collaboration-protocol.md`, `docs/plans/admin-shell-e1-command-palette-brief.md`, `CLAUDE.md` doc-map, bu pano
- **Durum:** 🟡 E1 brief hazır → worker'a verilmeyi bekliyor

### Controller #2 — 3D şeridi
- _(ikiz #2 kendi satırlarını buraya yazar — origin/master'daki #374/#375 onun işi)_

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

| Sıra | İş | Durum | Detay |
|---|---|---|---|
| **0** | Takip dosyalarını güncelle (bu pano + README + CHANGELOG) | ⏳ bu oturum | — |
| **1** | **Enterprise admin shell** — E1 komut paleti federe + E8 klavye-nav + modern sol-nav + E2 bildirim inbox | ⬜ | mevcut `CommandPalette.tsx` + `AdminLayout.tsx` üstüne |
| **2** | **Yeni admin özellikleri** — N1-N4 (rol-editörü/çeviri-UI/rapor-builder/API-key) + E3-E10 + dashboard-dummy düzelt | ⬜ | `admin-capabilities.md §4.5` |
| **3** | **Müşteri-hesap standardı + cetvel + en zayıf yüzeyleri düzelt** (profil/adres/sipariş self-service) | ⬜ | önce `customer-account-standard.md`, sonra ölç→düzelt |
| **4** | **Bayi R1→B2 — EN SON** (artık altyapı = dünya-standardı admin) | ⬜ | R0 dosya hazır; tablo aşağıda |

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
