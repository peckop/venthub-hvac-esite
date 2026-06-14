# Faz 2 — Admin Kalan Yüzeyler (BACKLOG / bilinçli ertelendi)

> **Bu dosya nedir?** Admin DataTableKit göçü Faz 1'de (10 liste sayfası) tamamlandı. Geriye **4 liste-olmayan/atlanmış admin yüzeyi** kaldı. Bunlar **kaybolmasın diye** tek yerde kayıt altına alındı.
> **Durum:** Bilinçli ertelendi — bayi modülü (R0→B2) bittikten sonra ya da gerçek audit delikleri için fırsatçı/cerrahi olarak ele alınacak.
> **Neden ertelendi:** Twin verdict + `VISION.md` ("mükemmeliyetçilik×scope creep = #1 risk") + `admin-capabilities` ("ÖNCE AVENSAIR"). **A, bayi B1 panelinin ön-koşulu DEĞİL** (B1 yalnız DataTableKit + admin-standard cetveline dayanır, ikisi de bitti). Detay: memory `dealer-pivot-decision`.

## Kalan 4 yüzey (kaynak: `admin-cetvel-scores-2026-06-13.md` + `admin-standard.md` — snapshot; uygulama anında gerçek kod doğrulanmalı)

| Sayfa | Arketip | Cetvel | #1 kritik boşluk (kanun) | Önerilen yaklaşım | Boyut |
|---|---|---|---|---|---|
| **Logistics** (`AdminLogisticsPage`) | **list** | %23 | Audit'siz sipariş mutasyonu confirmed→shipped (**K4**) | **Kit-göçü** (useAdminTable + DataTableKit + mutateWithAudit). NOT: aslında liste — Faz-1 Dalga-1a'da planlıydı, atlandı. Rewrite değil. | M |
| **InventorySettings** (`AdminInventorySettingsPage`) | settings | %42 | Audit'siz geri-alınamaz toplu products UPDATE (**K4**) | Settings arketipi: dikey istiflenmiş ayar grupları + annotasyonlu iki-kolon. Toplu UPDATE → `mutateWithAudit`. | M |
| **InventoryReport** (`AdminInventoryReportPage`) | dashboard | %41 | Durum URL'de değil (**K2**) | Dashboard (kit-light): gerçek-veri zorunlu (dummy yasak), tarih/filtre/rapor parametreleri URL-state'e, tenant+limit doğru sorgu. | M |
| **CategoryBuilder** (`CategoryBuilderView`) | detail | %50 | i18n hiç yok (baştan sona hardcoded) + yazma guard yok (**K3**) | Detay/CRUD: iki-kolon + card bileşimi (sol 2/3 içerik, sağ 1/3 metadata) + route-modal. Yazmalar RBAC-kapılı + i18n. | L |

> Ek (yeniden-yaz adayları, cetvel çok düşük — Faz 2 "rewrite" kovası): `AdminWebhookEventsPage` (%3, ham `<table>`), `AdminInventoryPage` (%8, RBAC/audit yok ama yazma handler'ları no-op = canlı açık YOK), `AdminSettingsPage` (%15, placeholder/stub).

## ✅ Gerçek audit/RBAC delikleri — KAPATILDI (2026-06-14, cerrahi; tam göçü beklemeden)

1. **InventorySettings** ✅ — `save()` (geri-alınamaz toplu eşik RPC) + `saveGeneralSettings()` artık `mutateWithAudit`'ten geçiyor (resource `'inventory_settings'`, K3 katman-2 + K4 audit). Eskiden yalnız UI-disable vardı.
2. **Logistics** ✅ — `handleBulkSubmit()` (confirmed→shipped, `admin-update-shipping` edge fn) artık `mutateWithAudit`'ten (resource `'logistics'`, `auditedByEdge:false`). Eskiden audit'siz.
3. **CategoryBuilder** ✅ — **zaten güvenliydi:** `handleSave()` içinde `if(!hasWriteAccess) return` guard + `logAdminAction` mevcut (cetvel snapshot bayatmış; muhtemelen `0430d136`'da eklendi). Dokunulmadı.

> Doğrulama: tsc 0 · lint 0 (21 jsx-literal warning = aşağıdaki i18n cila borcu) · 473 test geçti. `mutateWithAudit`→unified gate refactor'u (CategoryBuilder'ın manuel guard+logAdminAction'ını da dahil) = cila, aşağıdaki tam-standardizasyon kapsamında.

**Kalan iş = tam standardizasyon/cila (aşağıdaki tablo), ertelenmeye devam.**

## Ne zaman?
- **Varsayılan:** Bayi R0→B2 bittikten sonra (ticari değer önce).
- **İstisna:** Yukarıdaki 3 gerçek audit deliği, güvenlik gerekçesiyle istenirse **şimdi cerrahi** kapatılabilir (tam göçten bağımsız).
- **K1/K4 lint** (`faz1-k1k4-lint-deferred`): bu 4 yüzey de kite/kapıya geçince `error`'a açılır.
