# Admin Panel — Cetvel Skorlaması (§8) — 2026-06-13

> **Yöntem:** 19 admin sayfası, her biri ayrı bir Claude alt-ajanı tarafından
> `docs/standards/admin-standard.md §8` 24-maddelik cetvele vuruldu — her madde
> **dosya:satır kanıtıyla** (uydurma yasak; görülemeyen alt-bileşen = `na`).
> **Skor** = (pass + 0.5·partial) / (uygulanabilir madde sayısı). Arketip-dışı madde = `na`.
> Bu skor "refactor mı rewrite mı" kararını **his değil sayı** yapar (standart §8).
> Ham çıktı: `tasks/was0bs28j.output` (19 sayfa × 24 madde, kanıtlı JSON).

## 1. Skor matrisi

| Skor | Sayfa | Arketip | P / Pa / F / na | Verdict |
|---|---|---|---|---|
| %3 | AdminWebhookEventsPage | list | 0 / 1 / 15 / 8 | 🔴 rewrite |
| %8 | AdminInventoryPage | list | 0 / 3 / 15 / 6 | 🔴 rewrite |
| %15 | AdminSettingsPage | settings | 2 / 0 / 11 / 11 | 🔴 rewrite |
| %23 | AdminLogisticsPage | list | 3 / 4 / 15 / 2 | 🟡 refactor |
| %35 | AdminOrdersBoard | list | 3 / 8 / 9 / 4 | 🟡 refactor |
| %36 | AdminCouponsPage | list | 5 / 6 / 11 / 1 | 🟡 refactor |
| %39 | AdminUsersPage | list | 5 / 4 / 9 / 6 | 🟡 refactor |
| %41 | AdminInventoryReportPage | dashboard | 3 / 3 / 5 / 13 | 🟡 refactor |
| %41 | AdminErrorsPage | list | 4 / 5 / 7 / 8 | 🟡 refactor |
| %42 | AdminInventorySettingsPage | settings | 4 / 3 / 6 / 11 | 🟡 refactor |
| %43 | AdminAuditLogPage | list | 4 / 4 / 6 / 10 | 🟡 refactor |
| %44 | AdminDashboardPage | dashboard | 2 / 4 / 3 / 15 | 🟡 refactor |
| %44 | AdminCategoriesPage | list | 5 / 6 / 7 / 6 | 🟡 refactor |
| %47 | AdminOrdersPage | list | 5 / 8 / 6 / 5 | 🟡 refactor |
| %50 | CategoryBuilderView | detail | 5 / 3 / 5 / 11 | 🟡 refactor |
| %58 | AdminProductsPage | list | 9 / 4 / 6 / 5 | 🟡 refactor |
| %58 | AdminReturnsPage | list | 9 / 4 / 6 / 5 | 🟡 refactor |
| %61 | AdminErrorGroupsPage | list | 8 / 7 / 4 / 5 | 🟡 refactor |
| %62 | AdminMovementsPage | list | 6 / 4 / 3 / 11 | 🟡 refactor |

**Dağılım: 16 refactor · 3 rewrite · 0 keep.** En yüksek skor %62 → hiçbir sayfa "olduğu gibi bırak" değil.

## 2. Sistemik eksikler (sözleşme seviyesi — neredeyse her sayfada)

Hatalar rastgele dağılmamış; birkaç **contract** maddesi sayfaların çoğunda düşüyor:

| Madde | Kaç sayfada FAIL | Ne |
|---|---|---|
| **X6 i18n** | 15 / 19 | hardcoded TR + yasak `?? fallback` |
| **X8 design token** | 15 / 19 | arbitrary Tailwind / ham HEX / bozuk class |
| **L5 URL-state (K2)** | 14 / 19 | durum (sayfa/sort/filtre/arama) URL'de değil → link paylaşılamaz, geri-tuş/reload bozuk |
| L1 server-side pagination | 9 | tüm satırlar client'a çekilip filtreleniyor |
| L6 selection + bulk | 9 | — |
| L2 sort + aria-sort | 8 (+6 partial) | sık: server pagination + client sort = sessiz bug |
| L8 CSV export | 8 | — |
| L9 satır → detay | 8 | — |
| X7 a11y | 8 (+11 partial) | aria-sort/label/focus eksik |
| L3 faceted filter | 7 | — |
| L4 debounced arama | 7 | — |
| X2 fonksiyon-içi RBAC guard | 7 | UI butonu gizli ama handler korumasız |
| X4 audit log | 5 (+5 partial) | kritik mutasyonlar `logAdminAction` yazmıyor |
| X5 realtime / tenant-scope | 5 | SaaS data-bleeding riski |

**L10 (5 durum): 15 sayfada partial** — "veri-yok" ile "filtre-sıfır" karıştırılıyor ya da bir durum atlanıyor.

## 3. Her sayfanın 1. kritik boşluğu

- **WebhookEvents:** ham `<table>`, sıfır ortak-kit — standardın §7.3'ü zaten "yeniden yaz" diye listelemiş.
- **Inventory:** RBAC/audit tamamen yok; `hasWriteAccess={true}` koşulsuz hardcoded, `logAdminAction` hiç yok.
- **Settings:** sayfa bir PLACEHOLDER/stub — gerçek ayar formu yok.
- **Logistics:** monoton sipariş mutasyonu (confirmed→shipped) audit izi bırakmıyor.
- **OrdersBoard:** liste-tablo kontratının tümü eksik (pagination `.limit(200)` tavanı, sort, faceted).
- **Coupons:** liste state motoru tümüyle eksik (pagination/sort/faceted/URL/debounce).
- **Users:** server-side pagination yok — tüm satırlar client'a çekilip `.filter` ediliyor; URL-state yok.
- **InventoryReport / Errors / AuditLog / Categories / Orders / ErrorGroups:** durum URL'de değil (K2 ihlali).
- **Dashboard:** sahte/dummy grafik verisi hardcoded; sorgular tenant-scope'suz; ana rota `ssr:false`.
- **InventorySettings:** geri-alınamaz toplu `products` UPDATE'i audit'siz.
- **CategoryBuilder:** i18n hiç yok (baştan sona hardcoded); yazma guard'ı yok.
- **Products:** her yerde hardcoded TR + yasak `|| Fallback`.
- **Returns:** liste state client-side + URL-dışı.
- **Movements:** server pagination + client sort karışımı (standardın adlandırdığı sessiz bug).

## 4. Verdict

- **Sıfırdan DEĞİL** — 16 sayfanın gövdesi çalışıyor; ortak parçalar (`ColumnsMenu`, `ExportMenu`, `BulkActionToolbar`, `adminUi`, `useRole`, `logAdminAction`) zaten mevcut (§7.1).
- **Sayfa-sayfa yama da DEĞİL** — asıl hatalar contract-seviyesi ve her sayfada; aynı şeyi 19 kez düzeltmek israf.
- **→ Doğru yol: bu altyapı üzerine devam + merkezi omurga + göç:**
  1. Ortak **`useAdminTable` + DataTable kiti** (URL-state + server pagination + sort + selection) **bir kez** → L1/L2/L5/L6/L7 toplu çözülür.
  2. **i18n + design-token sweep** (X6/X8) toplu — sayfa sayfa değil.
  3. Sayfaları kite **göç** ettir (§7.3 sırası: altın referans → kit çıkar → tek tek).
  4. **3 sayfa** (Webhook / Inventory / Settings) kite göre **yeniden yaz**.

Bu, standardın §7.3'ünün öngördüğü yol — artık **ölçülmüş skorla** doğrulanmış.

---

*Kaynak: 19 paralel alt-ajan + §8 cetvel. Strateji: memory `standard-first-strategy`. Önceki ölçüm: `admin-panel-audit-2026-06-11.md` (bulgu listesi; bu dosya skorlama).*
