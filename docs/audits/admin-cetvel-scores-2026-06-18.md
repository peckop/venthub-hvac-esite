# Admin Panel — Cetvel Skorlaması (§8) — 2026-06-18 (YENİDEN ÖLÇÜM, dalga-sonrası)

> **Bu dosya nedir?** §8 cetvelinin **3 dalga göç + cila SONRASI** yeniden ölçümü (4 paralel Claude
> alt-ajanı, her sayfa **dosya:satır kanıtıyla**, canlı koddan). Önceki: `admin-cetvel-scores-2026-06-17.md`
> (dalga öncesi). Bu = dalgaların KAPATTIĞI deltayı gösterir.

## 0. Manşet

| | 2026-06-17 (dalga öncesi) | 2026-06-18 (güncel) |
|---|---|---|
| **Ortalama** | ~%63 | **~%83.5** (+20) |
| **≥%85 ("keep")** | 3 | **8** |
| **En düşük** | %14 (Webhook) | %64 (Inventory) |

## 1. Skor matrisi (06-17 → 06-18)

| 06-18 | 06-17 | Sayfa | Arketip | Kova | #1 kalan (closable) boşluk |
|---|---|---|---|---|---|
| **94** | 94 | Products | list | 🟢 keep | (altın referans) |
| **93** | 93 | Movements | list RO | 🟢 keep | — |
| **92** | 92 | ErrorGroups | list | 🟢 keep | — |
| **90** | 79 | Returns | list | 🟢 keep | (J7 oturdu) |
| **90** | 75 | Coupons | list | 🟢 keep | (J8 oturdu) |
| **88** | 78 | AuditLog | list RO | 🟢 keep | (J3 CSV oturdu) |
| **87** | 75 | Errors | list RO | 🟢 keep | (J3 CSV oturdu) |
| **87** | 81 | CategoryBuilder | detail | 🟢 keep | X6 i18n fallback (66/67/423/433) · X8 token (w-480px/w-320px/h-568px) |
| **84** | 72 | InventorySettings | settings | 🟡 refactor | X8 token (max-w-120px/!h-12/blur-blob) · D4 dirty-guard yok |
| **84** | 65 | Orders | list | 🟡 refactor | D2/D3/D4 (modal Zod/Savebar/dirty) · L9 detay-rota (expand by-design) |
| **82** | 31 | Logistics | list | 🟡 refactor | L3 faceted yok · X5 realtime (R4) |
| **80** | 14 | WebhookEvents | list RO | 🟡 refactor | L8 CSV export yok · X6 i18n fallback (225/226/232/233/244) |
| **80** | 42 | InventoryReport | dashboard | 🟡 refactor | X8 token (max-w-150px) · CSV başlıkları hardcoded TR (:184) |
| **80** | 64 | Dashboard | dashboard | 🟡 refactor | realtime refresh yok (chart artık GERÇEK ✓) |
| **80** | 63 | Categories | list | 🟡 refactor | L1 server-pag yok (none) · L2 sort · onPriceAdjust sızıntısı |
| **78** | 60 | Users | list | 🟡 refactor | L1 server-pag yok ("all users" ölçek) · bespoke bulk-bar · L9 |
| **78** | 19 | Settings | settings | 🟡 refactor | D2 Zod yok · D3 isSaveDisabled state-machine · D4 dirty-guard |
| **76** | 72 | OrdersBoard | kanban | 🟡 refactor | X8 token (left-10%/md:w-320px/max-h-70vh/bg-white-N) · placeholder toast-key (:192) |
| **64** | 21 | **Inventory** | list | 🟠 ağır | **DataTableKit'e HİÇ geçmemiş** (custom InventoryTable) → aria-sort/selection/bulk/columnvis/CSV yok |

(RO = read-only — mutasyon yok, RBAC-yazma maddeleri `na`.)

## 2. Kalan iş — 4 tema + bilinçli erteleme

**A) X8 design-token (arbitrary Tailwind) — 5 sayfa.** OrdersBoard · InventorySettings · InventoryReport ·
CategoryBuilder · Inventory. Mekanik token-değişimi; ayrıca Faz-2 K1/K4 lint→error kapısını açar.

**B) X6 i18n fallback (`t()||'x'`) — 2 sayfa.** CategoryBuilder (66/67/423/433) · WebhookEvents (225/226/232/233/244).
Artı OrdersBoard placeholder toast-key (:192) = gerçek i18n defekti.

**C) Inventory %64 → DataTableKit göçü.** Tek kit-dışı sayfa; en büyük tek kazanç (~+20). J12 Logistics gibi.

**D) D2/D3/D4 Detay-CRUD archetype (Zod + sticky Savebar + dirty-guard).** Orders/Settings/Categories modalları.
CategoryBuilder hariç standardize değil → **Faz-2 archetype işi** (daha büyük, ayrı standart).

**Bilinçli ERTELENEN (kod değil / by-design):**
- **X5 tenant-scoped realtime** — `tenant_id` kolonları yok → `dealer-blueprint R4` veri-katmanı işi, izole değil.
- **L9 satır→detay-rota** — sayfalar expand-row/modal kullanıyor (by-design); rubric maddesi gözden geçirilebilir.
- **L1 server-pagination** — Categories/Coupons sınırlı-set (kabul); yalnız Users "all users" sekmesi ölçek riski.

## 3. Verdict
3 dalga göç çalıştı: %63→%83.5, keep 3→8. Kalan = (a) **son-metre cila** (X8 token + X6 i18n + WebhookEvents CSV +
OrdersBoard toast — mekanik, ~5 sayfayı 85 üstüne çıkarır) ve (b) **Inventory kit göçü** (tek aykırı) ve
(c) **Faz-2 Detay-CRUD archetype** (Orders/Settings/Categories). Hiçbiri yeni mimari gerektirmiyor.

*Kaynak: 4 paralel Claude alt-ajanı (dosya:satır) + §8 cetvel + canlı kod/RLS. Strateji: `standard-first-strategy`.*
