# Admin Panel — Cetvel Skorlaması (§8) — 2026-06-17 (GÜNCEL ÖLÇÜM)

> **Bu dosya nedir?** `admin-standard.md §8` 24-maddelik cetvelin DataTableKit göçü + i18n
> temizliği SONRASI yeniden ölçümü. 19 admin sayfası, 6 paralel Claude alt-ajanı, her madde
> **dosya:satır kanıtıyla** (uydurma yasak; görülemeyen alt-bileşen = `na`).
> **Skor** = (pass + 0.5·partial) / (uygulanabilir madde). Arketip-dışı madde = `na`.
> **Önceki ölçüm:** `admin-cetvel-scores-2026-06-13.md` (göç ÖNCESİ). Bu dosya = göç SONRASI delta.

## 0. Manşet

| | 2026-06-13 (göç öncesi) | 2026-06-17 (güncel) |
|---|---|---|
| **Ortalama skor** | **~%40** | **~%63** (+23 puan) |
| **En yüksek** | %62 (Movements) | %94 (Products) |
| **≥%85 ("keep")** | 0 sayfa | **3 sayfa** (Products, Movements, ErrorGroups) |
| **Dağılım** | 16 refactor · 3 rewrite · 0 keep | 3 keep · 11 refactor · 2 ağır-refactor · 3 rewrite |

> Not: Alt-ajanlar `na` paydasını madde madde farklı yorumlayabildi (özellikle salt-okunur sayfalarda
> L6/X2/X4). Skorlar ±birkaç puan gürültü taşır; sıralama ve kova-yerleşimi güvenilir.

## 1. Skor matrisi (eski → yeni)

| Yeni | Eski | Δ | Sayfa | Arketip | Kova | #1 kalan boşluk |
|---|---|---|---|---|---|---|
| **%94** | 58 | +36 | AdminProductsPage | list | 🟢 keep | X5 realtime yok (products'ta tenant_id yok) |
| **%93** | 62 | +31 | AdminMovementsPage | list (RO) | 🟢 keep | L9 satır→detay yok |
| **%92** | 61 | +31 | AdminErrorGroupsPage | list | 🟢 keep | X5 realtime kanal-adı tenant'lı ama DB satır-filtresi yok (kozmetik) |
| **%81** | 50 | +31 | CategoryBuilderView | detail | 🟡 refactor | D2 Zod yok + D4 kirli-durum guard yok |
| **%79** | 58 | +21 | AdminReturnsPage | list | 🟡 refactor | L6 selection+bulk hiç bağlanmamış; L9 detay yok; L1 client-500 tavan |
| **%78** | 43 | +35 | AdminAuditLogPage | list (RO) | 🟡 refactor | L8 CSV export yok (denetim çıktısı) |
| **%75** | 36 | +39 | AdminCouponsPage | list | 🟡 refactor | X5 realtime hiç yok; D2 Zod yok; X8 arbitrary token (`h-42px`) |
| **%75** | 41 | +34 | AdminErrorsPage | list (RO) | 🟡 refactor | L8 CSV export yok |
| **%72** | 42 | +30 | AdminInventorySettingsPage | settings | 🟡 refactor | §5 annotasyonlu iki-kolon düzen değil; X8 arbitrary token |
| **%72** | 35 | +37 | AdminOrdersBoard | kanban | 🟡 refactor | `.limit(200)` sabit tavan (200+ sipariş sessiz kesilir); X8 token |
| **%65** | 47 | +18 | AdminOrdersPage | list | 🟡 refactor | L9 satır→detay yok; L2 tek-kolon sort; L3 düz-select (faceted değil) |
| **%64** | 44 | +20 | AdminDashboardPage | dashboard | 🟡 refactor | SalesChart HÂLÂ DUMMY veri (`:60-67`); rota `ssr:false` |
| **%63** | 44 | +19 | AdminCategoriesPage | list | 🟡 refactor | L8 CSV export yok; L3 faceted yok; L6 bulk yok |
| **%60** | 39 | +21 | AdminUsersPage | list | 🟡 refactor | L3 faceted (rol süzme) yok; L6/L8/L9 yok |
| **%42** | 41 | +1 | AdminInventoryReportPage | dashboard | 🟠 ağır | Durum URL'de değil (K2); sorgu limitsiz (client `.slice`) |
| **%31** | 23 | +8 | AdminLogisticsPage | list | 🟠 ağır | Hâlâ local-state ham `<table>`; kit yok (ama bulk-submit audit'li ✓) |
| **%21** | 8 | +13 | AdminInventoryPage | list | 🔴 rewrite | Yazma yolu SAHTE: `hasWriteAccess={true}` hardcoded + handler'lar no-op |
| **%19** | 15 | +4 | AdminSettingsPage | settings | 🔴 rewrite | STUB — gerçek form yok (`handleSave` sahte success) |
| **%14** | 3 | +11 | AdminWebhookEventsPage | list | 🔴 rewrite | Ham `<table>`, sıfır kit, hiç liste yeteneği yok |

(RO = read-only / salt-okunur — mutasyon olmadığı için RBAC-yazma maddeleri `na`.)

## 2. Göçün KAPATTIĞI sistemik boşluklar (kanıtlı)

DataTableKit + `useAdminTable` + `mutateWithAudit` + i18n temizliği, 2026-06-13 audit'inin en çok
düşen contract-maddelerini toplu çözdü:

| Madde | 06-13 FAIL | 06-17 durumu |
|---|---|---|
| **X6 i18n** | 15 / 19 | Kite geçen 10 sayfa + CategoryBuilder'da **PASS**; sadece rewrite-adayları (Inventory/Settings/Webhook zaten i18n'liydi, ironik) |
| **L5 URL-state (K2)** | 14 / 19 | Kite geçen 10 sayfada **PASS** (syncUrl + Suspense bariyeri) |
| **L1 server-pagination** | 9 | Server-mode sayfalarda PASS; client-mode (Categories/Users/Coupons/Returns) bilinçli `na`/`Pa` |
| **L2 sort sessiz-bug** | 8 | Kit **tek-yol sort** zorluyor → eski "server-pagination+client-sort" sessiz bug'ı yapısal imkânsız |
| **L6 selection+bulk** | 9 | Products/ErrorGroups/Coupons'ta PASS; Returns/Categories/Users'ta hâlâ bağlanmamış |
| **X4 audit** | 5 (+5 partial) | Tüm yazma yolları `mutateWithAudit`→`logAdminAction` kapısından (Products 6, ErrorGroups 4 yol) — **sağlam** |
| **X3 sunucu RLS** | — | Yazan sayfalarda RLS policy'leri canlı doğrulandı (`products_update_admin_only`, `returns_update_admin`, `error_groups_update_admin`, `inventory_settings_update_admin`, `categories_update_admin`) |

## 3. HÂLÂ açık sistemik eksikler (göç-üstü "son-metre" + veri-katmanı)

1. **X5 — tenant-scoped realtime = en zayıf eksen (yapısal).** `products`, `categories`,
   `client_errors`, `orders`, `user_profiles`, `admin_audit_log` tablolarında **`tenant_id` kolonu yok**.
   ErrorGroups/Errors realtime kanal ADI tenant'lı ama `postgres_changes` satır-filtresi yok → izolasyon
   kozmetik. Bu bir **kod değil veri-katmanı** açığı; gerçek çözüm = dealer-blueprint **R4 onarımı**.
2. **Son-metre kit-config boşlukları (göç eden ama eksik-kurulu sayfalar).** Kit yetenekleri var ama
   her sayfaya bağlanmamış: **L9 satır→detay** (`rowHref`/`onRowClick` çoğu sayfada verilmemiş),
   **L8 CSV export** (Categories/Users/AuditLog/Errors'ta yok), **L3 gerçek faceted** (çoğu düz-select),
   **L6 bulk** (Returns/Categories/Users'ta yok), **L2 çok-kolon sort** (kit tek-kolon zorluyor — cetvel
   "çok-kolon" der → kalıcı `Pa`; cetvel maddesi gözden geçirilebilir).
3. **D1–D5 (Detay/CRUD Savebar) standardize değil.** Kit yalnız liste iskeleti. CategoryBuilder hariç
   detay formları (route-modal, Zod, sticky Savebar, kirli-durum guard) Faz-2'ye ertelendi.
4. **Dashboard chart hâlâ DUMMY.** `AdminDashboardPage.tsx:60-67` sabit dizi ("to pass build" yorumu
   duruyor); KPI kartları gerçek, grafik sahte. Rota `ssr:false`.
5. **Design token (X8) dağınık ihlal.** Migrasyon-dışı + bazı kit sayfalarında arbitrary Tailwind
   (`min-w-1000px`, `max-h-400px`, `h-42px`, `w-480px`, `left-10%`) — K1/K4 lint Faz-2'de `error`'a açılınca yakalanır.

## 4. Verdict

- **Göç işe yaradı:** ortalama %40→%63, ilk kez 3 sayfa ≥%85. Contract-seviyesi hatalar (i18n/URL-state/
  audit/sessiz-sort) toplu kapandı.
- **Kalan iş iki kovada:** (a) **son-metre kit-config** (faceted/export/satır-link/bulk — sayfa başına
  küçük, mekanik) ve (b) **3 rewrite + 2 ağır-refactor** (Webhook/Inventory/Settings rewrite;
  Logistics/InventoryReport kit-göçü). Hiçbiri yeni mimari gerektirmiyor — kit zemini hazır.
- **X5 tenant-realtime** kod değil veri-katmanı işi → dealer-blueprint R4 ile birlikte çözülür, izole iş değil.
- **Stratejik bağlam:** `faz2-admin-backlog` + `dealer-pivot-decision` gereği bu kalan iş **bilinçli
  ertelendi**; öncelik bayi modülü (R0→B2). Bu skor o kararı çürütmüyor — "admin yeterince iyi, bayiye geç" tezini güçlendiriyor.

---

*Kaynak: 6 paralel Claude alt-ajanı (dosya:satır kanıtlı) + §8 cetvel + CodeGraph (kit-tüketici doğrulama)
+ NLM ikiz (2026-06-15 snapshot delta) + canlı RLS doğrulama. Strateji: memory `standard-first-strategy`,
`standard-plus-enforcing-test-is-control`.*
