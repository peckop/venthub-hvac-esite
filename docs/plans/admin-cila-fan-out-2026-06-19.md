# Worker Dispatch — Admin Cetvel Son-Metre Fan-Out (J14/J15/J16)

> ⛔ **GEÇERSİZ / DAĞITMA — BU İŞLER ZATEN BİTMİŞ.** Bu brief 2026-06-19'da hatalı yazıldı:
> J14 (`#413`), J15 (`#421`), J16 (`#415`) ve E2 (`49c9ca84`) **2026-06-18'de zaten master'a girmişti.**
> Eski (dağıtım öncesi) audit'e bakılıp yazıldığı için bitmiş iş "yapılacak" sanıldı → worker'a boşuna
> dağıtıldı, saatler kayboldu. Tarihsel kayıt olarak duruyor; **kimse bunu worker'a vermesin.**

> **Tarih:** 2026-06-19 · **Controller:** #1 (admin şeridi) · **Worker:** Antigravity CLI (ortak)
> **Kaynak cetvel/ölçüm:** `docs/audits/admin-cetvel-scores-2026-06-18.md` (dosya:satır kanıtlı) · `docs/standards/admin-standard.md` §8
> **Amaç:** Admin cetvel %83.5 → daha çok sayfayı **≥%85 ("keep")** üstüne çıkar. Hiçbiri yeni mimari gerektirmez; mekanik cila + bir kit göçü.

## 0. ORTAK KURALLAR (her üç iş için ZORUNLU)

1. **Bir-iş-bir-dal:** Her iş (J14/J15/J16) **master'dan TAZE** ayrı dal. Dalları birbirine YIĞMA (tangle = mega-PR). Dal adı: `feat/j14-inventory-kit`, `feat/j15-cila-a`, `feat/j16-cila-b`.
2. **Kapsam (dosya sınırları KATI):** Aşağıda her işin dosya listesi var. **Listenin DIŞINDA dosya değiştirme.** Üç iş dosya-disjoint → paralel güvenli.
3. **Kabul kapısı (gate) — hepsi geçmeli:**
   - `pnpm type-check` (tsc) · `pnpm lint` (uyarı sıfırlamak için kural KAPATMA — gerçek ihlali DÜZELT)
   - **`pnpm build`** — CI'daki `build:ci` Vercel'in `next build`'ini EŞİTLEMEZ (import-sort=error, typedRoutes tsc'de görünmez). Yerelde gerçek `pnpm build` yeşil olmadan PR açma.
   - İlgili conformance/keycheck: i18n işleri için `pnpm test -- --run` (INV-5 keycheck + parity) · token işleri için lint (K1/K4 arbitrary-value).
   - **Vercel preview ZORUNLU** (admin PR'da). CI yeşili yetmez.
4. **Commit hijyeni:** Yalnız `.ts/.tsx/.css` kaynak commit'le. **Daemon `.md` companion churn'ünü commit ETME** (orion-doc otomatik üretir; `git add` ederken dosyaları açıkça say). Bundle'lı `database.types.ts` regen EKLEME (ayrı Controller işi). _Ama_ meşru `index.css`/token migration'ı varsa onu ATLAMA (negatif-liste mantığı).
5. **i18n kuralı:** Kullanıcıya görünen metin sözlükten. `t()||'fallback'` deseni **defekt** (kaldır → gerçek anahtar). Resolver **nested-only**; içinde-nokta düz anahtar (`'a.b'`) ham render eder → nested koy. Anahtarları ilgili **per-module** admin dict'e ekle (`src/i18n/dictionaries/admin/<module>.{tr,en}.ts`), TR+EN **parite**.
6. **Design token kuralı:** Arbitrary Tailwind (`w-[480px]`, `max-w-[150px]`, `h-[568px]`, `left-[10%]`, `bg-white/N` keyfi) **YASAK**. `src/design-system/tokens.js`'teki ölçek/spacing/z-index token'larını kullan; yoksa en yakın standart Tailwind sınıfı. Renkler HEX değil CSS custom property (HSL).
7. **Self-rapor güvenilmez:** "yaptım" yetmez — Controller gate'i kendi worktree'sinde doğrular. Push'un remote'a ULAŞTIĞINI teyit et.

---

## J14 — Inventory → DataTableKit göçü  (büyüklük: M, en yüksek tek kazanç ~+20)

**Skor:** %64 (tek kit-dışı sayfa, 🟠 ağır). **Hedef:** ≥%85.

**Sorun:** `Inventory` hâlâ **custom InventoryTable** kullanıyor; `DataTableKit`'e HİÇ geçmemiş → aria-sort, satır seçimi, bulk-bar, kolon görünürlüğü (columnvis), CSV export YOK.

**Dosyalar (yalnız bunlar):**
- `src/views/admin/AdminInventoryPage.tsx` (sayfa orkestratörü)
- `src/components/admin/InventoryTable.tsx` (custom tablo → kit'e taşı)
- `src/views/admin/InventoryTableBody.tsx`
- (gerekirse) `src/i18n/dictionaries/admin/inventory.{tr,en}.ts` (yeni kolon/aksiyon başlıkları)

**Referans (AYNEN izle, kanıtlı keep-grade kit göçü):** J12 Logistics → `src/views/admin/AdminLogisticsTableBody.tsx` + onun sayfası. Kit API: `src/components/admin/data-table/DataTableKit.tsx` (+ `DataTableHead.tsx`). Temiz kit tüketicileri: `AdminAuditLogPage.tsx`, `AdminErrorGroupsPage.tsx` (CSV export deseni dahil).

**Adımlar:** (1) InventoryTable'ın kolon tanımlarını kit'in column-config'ine çevir. (2) aria-sort + selection + bulk-bar + columnvis kit'ten gelsin. (3) CSV export'u kit deseniyle ekle (başlıklar i18n). (4) URL-state (sıralama/filtre) kit konvansiyonu. (5) i18n: tüm görünür metin dict'ten, parite.

**Kabul:** kit göçü tam (custom tablo kalmadı); aria-sort/selection/bulk/columnvis/CSV çalışır; tüm gate maddeleri yeşil.

---

## J15 — Cila-A: token + i18n (OrdersBoard / InventoryReport / InventorySettings)  (büyüklük: S)

**Hedef:** 3 sayfayı ≥%85'e çıkar (mekanik X8 token + i18n defekt kapatma).

**Dosyalar (yalnız bunlar):**
- `src/views/admin/AdminOrdersBoard.tsx` — X8 token (`left-[10%]` · `md:w-[320px]` · `max-h-[70vh]` · keyfi `bg-white/N`) → token/standart sınıf. **Placeholder toast-key (:192)** = gerçek i18n defekti → doğru dict anahtarı.
- `src/views/admin/AdminInventoryReportPage.tsx` — X8 token (`max-w-[150px]`) → token. **CSV başlıkları hardcoded TR (:184)** → i18n (dict anahtarı, TR+EN).
- `src/views/admin/AdminInventorySettingsPage.tsx` — X8 token (`max-w-[120px]` · `!h-12` · keyfi `blur-blob`) → token/standart.
- (gerekirse) `src/i18n/dictionaries/admin/{inventory,orders}.{tr,en}.ts`

**NOT:** InventorySettings'in **D4 dirty-guard**'ı bu işe DAHİL DEĞİL (o Faz-2 Detay-CRUD archetype işi). J15 yalnız token + i18n cilası.

**Kabul:** sıfır arbitrary Tailwind (3 sayfa); OrdersBoard toast + InventoryReport CSV başlıkları i18n; gate yeşil.

---

## J16 — Cila-B: i18n + CSV (CategoryBuilder / WebhookEvents)  (büyüklük: S)

**Hedef:** 2 sayfayı ≥%85'e çıkar (i18n fallback kaldır + WebhookEvents CSV ekle).

**Dosyalar (yalnız bunlar):**
- `src/views/admin/CategoryBuilderView.tsx` — X6 i18n fallback (`t()||'x'` satır **66/67/423/433**) → gerçek anahtar. X8 token (`w-[480px]` · `w-[320px]` · `h-[568px]`) → token/standart.
- `src/views/admin/AdminWebhookEventsPage.tsx` + `src/views/admin/WebhookEventsTableBody.tsx` — X6 i18n fallback (satır **225/226/232/233/244**) → gerçek anahtar. **L8 CSV export YOK** → ekle (kit CSV deseni; başlıklar i18n).
- (gerekirse) `src/i18n/dictionaries/admin/{categories,webhooks}.{tr,en}.ts`

**CSV referansı:** kit CSV export deseni (`AdminAuditLogPage`/`AdminErrorGroupsPage`). İçe-aktarma değil **dışa-aktarma** (export) — `InventoryCsvImport` ÖRNEK DEĞİL (o import).

**Kabul:** `t()||` fallback sıfır (her iki sayfa); WebhookEvents CSV export çalışır + başlıkları i18n; sıfır arbitrary Tailwind (CategoryBuilder); gate yeşil.

---

## Controller (ben) — paralel, ayrı şerit
- Avensair P0 mimari (rota i18n sweep / LLM danışman spec) — worker dosyalarıyla ÇAKIŞMAZ.
- **types-sync** (`database.types.ts` regen) — Controller, ayrı PR.
- Her worker PR'ını gate'leyip merge ederim (Vercel preview + INV + build doğrulaması).

## Entegrasyon
- 3 dal disjoint → sırayla ya da paralel merge. Çakışma beklenmiyor (farklı dosyalar).
- Bittiğinde cetvel YENİDEN ölçülür (`admin-cetvel-scores-2026-06-XX.md`) → keep sayısı güncellenir.
