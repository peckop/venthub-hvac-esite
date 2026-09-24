# REC-140 · Ürün maliyet alanlarının kilidi (2026-09-24, ALTYAPI)

**Durum:** PLAN v2 — v1 plan-challenger (Opus) sonucu KOŞULLU: Faz 0 üç ekle geçti, Faz 1–3 BLOK (8 zorunlu değişiklik). v2 bunları işler (§7 izlenebilirlik tablosu) ve yeniden challenger'a gider. Migration içerir → kural 13: merge = prod'a otomatik uygulanır, **Recep onayı** ALTYAPI penceresinde.
**Cetvel:** `migration-safety-standard.md` (Guard A/B/E, süpürmeler) · `pricing-standard.md` v1.1 (§2 liste ≠ maliyet) · `purchasing-standard.md` (§5.2 maliyet, §8.1 UI izni ⊆ DB izni) · `rls-yetki-karari-standard.md` (§1 `is_admin_user()` biçimi, §5 CASCADE yazılmaz) · `denetim-izi-standard.md` · CLAUDE.md kural 11/12/13/14 · karar 95 (Recep 2026-09-24: moderatör maliyeti ve alış iskontosunu GÖRMEZ, yalnız yönetici görür).

### 0 · Anlam düzeltmesi (v2, challenger 2.6 — kendi doğrulamam)

`pricing-standard.md:16-23,56,59`: `products.purchase_price` + `purchase_currency` = **AVenS Katalog 2026.1 iskontosuz LİSTE fiyatı** (Recep 2026-08-14: *"elimde alış fiyatları yok; o fiyatlar liste fiyatları yani iskontosuz"*); `cost_in_base` adına rağmen fiilen liste fiyatının baz para birimindeki karşılığı. **Bugün sistemde gerçek alış maliyeti YOK** (T010 satınalma ile gelecek). Sızan bilgi: tedarikçinin kamusal liste fiyatı + vitrin fiyatıyla yan yana konunca **kâr oranımız**. Onarım yine şart: gerçek maliyet (iskonto Faz B) aynı alanlardan/aynı yoldan gelecekti.
**Recep'e tercih sorusu (sorudu 2026-09-24):** liste fiyatı ileride vitrinde "üstü çizili liste fiyatı" olarak gösterilecek mi? Cevap şemayı belirler: **hayır** (önerim) → liste de gizli tabloya; **evet** → liste kamusal kalır, yalnız gerçek maliyet/iskonto/tedarikçi gizlenir. Bu v2, cevap gelene kadar **hayır** varsayımıyla yazıldı; "evet" gelirse §1.2 evreni daralır, fazlar değişmez.
**Kaynak:** KATALOG iskonto challenger bulgusu (REC-140) → OPS emri → ALTYAPI ölçümü (aşağıda, hepsi 2026-09-24 canlı DB, salt okuma).

---

## 1 · Ölçülen durum

### 1.1 Sızıntı iki kanaldan

| Kanal | Kim görür | Ölçüm |
|---|---|---|
| **Sayfa kaynağı** | Her ziyaretçi, hiçbir araç gerekmeden | `curl https://venthub.com.tr/tr` → HTML'de (RSC yükü) 12× `"purchase_price":<sayı>`, 12× `supplier_name`. Ürün detay sayfası 0. |
| **Doğrudan REST** | Sitenin JS'inde duran herkese açık anahtarı kullanan herkes | `has_column_privilege('anon', 'public.products', k, 'SELECT')` = **true** (4 kolon, anon ve authenticated). `set local role anon` + rollback, yalnız sayım: **442 ürün görünür, purchase_price 442 dolu, cost_in_base 348 dolu**. |

**Kök (sayfa kaynağı):** `src/lib/services/product.columns.ts:19` `VARIANT_DETAIL_COLUMNS` içinde `supplier_name, purchase_price`. Vitrin sorgularının hepsi bu listeyi kullanıyor (ana sayfa `app/[lang]/page.tsx:135` static client).
**Kök (REST):** taban `GRANT ALL ON TABLE public.products TO anon, authenticated` (baseline 2026-09-23:8942-8944); SELECT politikası `prod_public_read_opt` yalnız `tenant_id = jwt_tenant_id()`; `jwt_tenant_id()` claim yoksa varsayılan kiracıyı döndürür → ziyaretçi tüm katalogu görür (bu KASITLI — vitrin böyle çalışıyor; sorun satır değil KOLON).

### 1.2 Hassas alan evreni (tablonun tam kolon listesinden, tahmin değil)

`products` 38 kolon. Maliyet/tedarik sınıfı **8 kolon:** `purchase_price`, `purchase_currency`, `purchase_rate_to_base`, `cost_in_base`, `last_purchase_cost`, `last_purchase_currency`, `last_purchased_at`, `supplier_name`. `technical_specs` içinde fiyat/maliyet/iskonto/tedarikçi anahtarı **YOK** (ölçüldü). Dolu olanlar bugün: purchase_price 442, cost_in_base 348; last_purchase_cost ve supplier_name 0.
İç-operasyon sınıfı (sır değil, müşteriye gerekmez; bu planın DIŞINDA, ayrı karar): `warehouse_location`, `low_stock_threshold`, `low_stock_override`.

### 1.3 Diğer tablolar (anon'a kolon yetkisi var, satır politikası yok)

| Tablo | Hassas kolon | Okuma politikası | Karar 95 ile |
|---|---|---|---|
| `pricing_rule` | margin_pct, min/max_margin_abs | authenticated + rol ∈ {super_admin, admin, **moderator**} | ÇELİŞİR |
| `purchase_orders` | supplier_id | aynı | ÇELİŞİR |
| `purchase_order_items` | unit_cost | aynı | ÇELİŞİR |
| `suppliers` | (tablo) | aynı | ÇELİŞİR |
| `product_prices` | discount_percentage | anon + authenticated | vitrin indirimi — KAMUSAL, dokunulmaz |

Ziyaretçi ve sıradan müşteri bu dört tablodan satır GÖREMEZ (politika yok) → sızıntı değil; yalnız moderatör kapsamı karar 95'e aykırı.

### 1.4 Rol kaynağı sağlam mı (planın dayandığı zemin)

- `is_admin_user()`: rol `claims.user_role` / `app_metadata.user_role`'dan (hook), `user_metadata` BİLEREK yok; JWT yoksa `user_profiles`'a düşer; **admin, super_admin** → moderatör DIŞARIDA. Karar 95'in yardımcısı budur.
- `user_profiles.role` yazımı `trg_enforce_role_change` (BEFORE INSERT OR UPDATE, DEFINER): kendi rolünü yalnız super_admin değiştirir; super_admin'e yalnız super_admin yükseltir; oturumsuz ayrıcalıklı yazım yalnız service_role. → Kullanıcı kendini moderatör/admin yapamaz (ölçüldü, fonksiyon gövdesi okundu).

### 1.5 Tüketici haritası (Explore alt-ajanı, kod + taban; özet)

| Sınıf | Kırılan (anon/authenticated) | Etkilenmeyen |
|---|---|---|
| A · maliyet kolonunu açıkça okuyan | 20 çağrı noktası: VARIANT_DETAIL_COLUMNS kullanan 12 (vitrin + ProductFormModal), admin ekranları 5 (AdminDashboardPage:95, ProductsTableBody:60/139, PricePreviewPanel:68/175/204, pricingAdmin.service:45/244, pricingMaterialize.service:157/410), görünüm/RPC üzerinden 3 | 1 betik (service_role) |
| B · `*` / `products(*)` | 1: `project.service.ts:128` `product:products(*)` | 4 service_role (order-validate, katalog betikleri) |
| C · SQL fonksiyon/görünüm | 8: `display_price(p)`, `display_price_tax_included(p)`, `get_display_prices`, `fts_search_products`, `get_family_detail`, `get_product_families_enriched` (hepsi INVOKER, tüm satırı alır), `admin_search_products` (INVOKER, **anon EXECUTE**, purchase_price döner), görünümler `inventory_summary` (purchase_price×stok), `inventory_velocity` (supplier_name) | `process_goods_receipt` (DEFINER, yazar) |

⚠ **Kolon REVOKE neden tek başına olmaz:** Postgres'te tüm satır referansı (`display_price(p)`, `products(*)`) TABLONUN TÜM kolonlarına SELECT ister. Tablo düzeyi SELECT kaldırılıp kolon listesi verilirse vitrin fiyat fonksiyonları "permission denied" ile düşer; `withDisplayPricesSafe` (product.service.ts:18-26) hatayı yutar → **vitrin fiyatsız kalır ve hiçbir kapı görmez**.

---

## 2 · Hedef (kabul ölçütleri)

1. **Sayfa kaynağı:** vitrin HTML'inde 8 hassas kolondan hiçbiri geçmez (ana sayfa, kategori, ürün detay, arama; curl ile ölçülür).
2. **anon:** 8 kolonun hiçbiri REST'ten, RPC'den ya da görünümden okunamaz. Ölçüm: `set local role anon` + tek tek kolon SELECT → hata ya da kolon yok.
3. **authenticated, rol ∉ {admin, super_admin}** (user, moderator, warehouse, sales, viewer): aynı — okuyamaz. Ölçüm: moderatör JWT claim'i taklit edilerek (`set local request.jwt.claims`).
4. **admin / super_admin:** bugünkü tüm admin ekranları aynı veriyi görür (maliyet önizleme, fiyat üretimi, maliyet tazeleme, envanter sermaye/tedarikçi).
5. **Vitrin fiyatı değişmez:** `get_display_prices`, arama, aile detay/listesi aynı fiyatları döner (önce/sonra fark 0, 442 ürün).
6. **Karar 95 diğer tablolar:** pricing_rule, purchase_orders, purchase_order_items, suppliers okuma politikasından `moderator` çıkar.

---

### 1.6 Sayfa türü taraması ve süre (2026-09-24, OPS isteği)

- Sitemap'in 88 adresi + arama/bilgi/karşılaştırma tek tek indirildi: HTML'de maliyet alanı **yalnız ana sayfa** (`/tr`, `/en`: 12'şer `purchase_price`, `supplier_name` anahtarı var değeri boş). Kategori 24, ürün 48, marka 7, diğer 10 sayfa: 0. Diğer 6 maliyet kolonu hiçbir sayfada yok.
- HTML dışı: ürün detay (tarayıcı sorgusu), sepet, sihirbaz, sipariş detayı aynı listeyi tarayıcıdan çeker → değer ağ yanıtında görünür. Faz 0 bunları da kapatır.
- Eski dağıtım adresleri (`venthub-hvac-esite-<hash>-…`): 302, SSO korumalı. Üretim takma adı `venthub-hvac-esite.vercel.app`: 200, ana siteyle aynı içerik (12 `purchase_price`) → Faz 0 ile düzelir.
- Başlangıç: `purchase_price` vitrin servis sorgularında 2026-04-03'ten (73d9ff4a2) beri; 2026-08-12'de ortak listeye taşındı (683d2d75b). REST yolu aynı dönemden. Değerlerin DB'ye doluş tarihi ölçülmedi.
- **Giriş yapmış müşteri de görüyor (v2, challenger 2.12 + canlı ölçüm):** `inventory_summary` (`capital_tied_up = purchase_price × stok`) ve `inventory_velocity` (`supplier_name`) görünümleri `security_invoker` ve `authenticated`'a SELECT'li (`has_table_privilege` = true, ölçüldü) → her müşteri hesabı sermaye/tedarikçi alanını okuyabilir. Faz 2-DB'ye kadar açık.
- **Webhook yükü (challenger 2.11):** `handle_supabase_webhook` products satırının tamamını (liste fiyatı dahil) kendi uç noktamıza yollar — dışarı sızıntı değil, Faz 3 ile kendiliğinden kapanır.

## 3 · Seçenekler

| | **A · Kolon yetkisi** | **B · Ayrı tablo `product_costs`** | **C · Yalnız anon'dan tablo SELECT'i kaldır** |
|---|---|---|---|
| Ne | products'ta tablo SELECT'i kaldır, 30 kolona kolon-GRANT; admin okuma DEFINER RPC | 8 kolon yeni tabloya; products'tan düşer; RLS `(select public.is_admin_user())` | anon'a kolon listesi, authenticated aynen |
| Tüm-satır fonksiyonları | 4 anon/6 toplam fonksiyon `display_price(p)` ile tüm satırı alır → HEPSİ yeniden yazılır; hata `withDisplayPricesSafe` içinde yutulur → vitrin SESSİZ fiyatsız | **Dokunulmaz** | A ile aynı kırılma (anon tarafında) |
| Giriş yapmış müşteri | Kapanır | Kapanır | **AÇIK KALIR** → kabul 3 sağlanmaz |
| Yeni kolon eklenince | fail-closed (verilmeyen kolon görünmez; unutulursa vitrin kırılır) | **fail-open** (products'a eklenen maliyet kolonu kamusal olur) → INV-MALIYET-KOLON-2 ad yasak listesiyle kapatılır | A gibi |
| Dış belge | Supabase "Column Level Security": *"We do not recommend using column-level privileges for most users… `select *` will fail"* (challenger WebFetch ile teyit etti) | Ayrı tablo + politika | — |

**Öneri: B** (A ve C kanıtla elendi). B'nin fail-open zaafı §5 INV-MALIYET-KOLON-2 ile kapanır.

---

## 4 · Fazlar (B, v2)

### Faz 0 — ACİL, migration'sız, URUN (bugün; challenger: GEÇTİ, 3 ekle)
1. `VARIANT_DETAIL_COLUMNS`'tan `supplier_name`, `purchase_price` çıkar.
2. `project.service.ts:128` `products(*)` → açık kolon listesi (giriş yapmış müşteriye liste fiyatı dönüyordu).
3. `ProductFormModal` ayrı admin kolon listesi; eksik alan **0** yazar (kolon `NOT NULL DEFAULT 0`) → "kaydetme purchase_price'ı değiştirmez" regresyon testi.
4. Kapı INV-MALIYET-KOLON-1: vitrin kolon listesi 8 hassas kolonu içermez; `src/` altında `from('products').select('*'…)` ve `products(*)` YASAK.
5. Merge sonrası `revalidateTag(HOME_DATA_TAG)` (ana sayfa `unstable_cache` 3600 sn) → sonra curl ile `/tr`, `/en`, vercel.app takma adı 0 ölçülür. → Kabul 1.
(URUN'a iletildi: 08:19Z + 08:49Z ek.)

### Faz 1 — migration 1 (ekleyici; veri + tablo + senkron). Dosya: `supabase/migrations/2026092xHHMMSS_rec140_product_costs_ekle.sql` (14 hane)
- **Tablo:** `product_costs (product_id uuid, tenant_id uuid not null, <8 kolon, products'taki tip/NOT NULL/DEFAULT birebir>, updated_at)`; `primary key (product_id)`; products'a `unique (id, tenant_id)` + product_costs'ta `foreign key (product_id, tenant_id) references products(id, tenant_id) on update cascade on delete cascade` (kiracı ayrışamaz, kural 12).
- **RLS:** enable (FORCE yazılabilir ama güvence SAYILMAZ: postgres `rolbypassrls=true` ölçüldü, service_role da atlar). Politikalar SELECT/INSERT/UPDATE/DELETE: `tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user())`. GRANT: anon HİÇ; authenticated yalnız `select, insert, update, delete` (TRUNCATE yok — RLS'e tabi değil).
- **Kopya + tetik AYNI işlemde:** `insert … select … from products` (442) → Guard A: sayım + satır satır `is not distinct from` eşitliği; fark ≠ 0 ise `raise exception` (migration geri döner).
- **Senkron tetik `products → product_costs`** (geçiş dönemi): `SECURITY DEFINER`, `set search_path = pg_catalog, public`; `tenant_id` = `NEW.tenant_id` (`jwt_tenant_id()` DEĞİL); AFTER INSERT (satır yarat) ve AFTER UPDATE (yalnız `IS DISTINCT FROM OLD` olan kolonlar); `pg_trigger_depth() > 1` ise çık (özyineleme koruması). Yön TEK: products → product_costs. Bayat-üzerine-yazma riski (challenger 2.3): Faz 2 boyunca **yazıcı kuralı** — hiçbir yeni kod product_costs'a DOĞRUDAN yazmaz; tüm yazımlar products üzerinden gider ve tetik taşır. Böylece tek yön tutarlı kalır. Doğrudan yazım Faz 3'te açılır.
- **Denetim izi:** product_costs'a `denetim_izi_yaz()` tetiği, products süzgeciyle aynı mantık — otomasyon kolonları (`cost_in_base`, `purchase_rate_to_base`, `last_*`) DIŞARIDA (aksi hâlde her maliyet tazelemesi ~348 satır). Senkron tetik aynı değişiklik için ikinci satır doğurmasın diye Faz 1'de product_costs denetim tetiği **kurulmaz**, Faz 3'te products tetiğinden devralınır. `denetim-izi-hukum.mjs` KAPSAM listesine product_costs Faz 3'te eklenir.
- **Kabul (Faz 1):** anon ve moderatör claim taklidiyle `select … from product_costs` → 0 satır/izin yok; admin claim → 442.
- **Moderatör DEĞİŞİKLİĞİ YOK** (v1'de vardı; v2'de Faz 1b'ye taşındı — challenger 2.4).

### Faz 1b — karar 95 moderatör kapsamı (migration + kod, AYNI PR)
- DB: `pricing_rule`, `purchase_orders`, `purchase_order_items`, `suppliers` SELECT politikaları satır içi `role = any(array[…,'moderator'])` yerine `(select public.is_admin_user())` (rls-yetki-karari §1). INSERT/UPDATE/DELETE politikaları için karar açıkça: aynı (moderatör satınalma yazmaz).
- Kod: `src/lib/rbac.ts:60-67,123` → `/admin/purchasing` sayfası ve `purchasing` izni moderatörden çıkar (purchasing-standard §8.1: UI izni ⊆ DB izni). `AdminDashboardPage` sermaye kartı admin olmayana gizlenir.
- Kapı: R6 (`purchasing-machine-and-evidence.test.ts:310`) ayrıştırıcısı `is_admin_user()` biçimini tanıyacak şekilde güncellenir; yoksa kırmızı.
- Sahip: DB ALTYAPI, `rbac.ts`/dashboard URUN — tek PR, iki şerit onayı.

### Faz 2-DB — migration 2 (kural 13)
- `inventory_summary`, `inventory_velocity` → `product_costs`'a LEFT JOIN ile yeniden tanım (moderatör/müşteri: NULL). Görünümler authenticated'a açık kalıyorsa sermaye/tedarikçi kolonu RLS'le NULL döner (ölçülür).
- `admin_search_products`: anon EXECUTE **revoke**; `purchase_price` product_costs'tan LEFT JOIN.
- `process_goods_receipt` (DEFINER): `last_purchase_*` yazımı products üzerinden kalır (tetik taşır) — Faz 3'te product_costs'a çevrilir.
- Guard E: `admin_search_products` ve `process_goods_receipt` işlem içinde gerçekten çağrılıp geri alınır.

### Faz 2-kod — okuyucular (URUN admin + ALTYAPI servisleri)
Okuma noktaları `product_costs`'tan: v1'in 20'si + challenger'ın eklediği `pricingAdmin.service.ts:301,322` (`purchase_currency` NOT NULL varsayımı → satır yoksa açık hata), `CostRefreshModal`, `MaterializePricesModal`, `resourceSearchers.ts:28`, `InventoryTable.tsx`. Yazıcılar Faz 2'de products'a yazmaya DEVAM eder (yazıcı kuralı). Betik/dış depo yazıcıları (`katalog-karnesi.mjs:53`, `fiyat-bosluk.mjs`, `katalog-paket-uret.mjs`, `kademe2-load/load.mjs`, `venthub-pdf-ingestor/paket/*.sql`) **ayrı kayıt**la KATALOG'a envanterlenir (Faz 3 öncesi taşınmaları şart).

### Faz 3 — migration 3 (kaldırıcı; en riskli)
Önkoşul: Faz 2-kod ve betik taşımaları canlıda; `src/`+`scripts/`+dış depo taramasında 8 kolon adı products bağlamında 0.
1. `denetim_izi_products_upd` 8 kolon OLMADAN yeniden kurulur; product_costs'a eşdeğer süzgeçli denetim tetiği kurulur. **CASCADE YASAK** (rls-yetki-karari §5).
2. Görünüm/fonksiyon bağımlılıkları Faz 2-DB'de çözülmüş olmalı; Guard B: `pg_proc.prosrc` regex taraması (plpgsql bağımlılığı izlenmez) → 8 kolon adı products bağlamında 0.
3. Guard A: DROP öncesi products ↔ product_costs satır satır eşitlik.
4. Senkron tetik kaldırılır; yerine **kalıcı** DEFINER `AFTER INSERT ON products` tetiği product_costs satırını yaratır (yeni ürün + CSV upsert INSERT'i); `purchase_currency NOT NULL DEFAULT 'TRY'` product_costs'ta korunur.
5. `alter table products drop column …` (8 kolon, CASCADE'siz). Önce GÖLGE DB'de denenir (challenger önerisi).
6. Yazıcılar product_costs'a çevrilir (ProductFormModal koşullu: yalnız admin ve alan değiştiyse; InventoryTableBody supplier_name; pricingMaterialize; process_goods_receipt).
7. Tip sırası: Faz 1 PR'ında product_costs tipi gölgeden/elle; Faz 3 PR'ında `db-rows.ts` `Omit<…, 8 kolon>` + tip daraltma; tip-drift merge'e kadar kırmızı → merge sonrası yeşil (PR açıklamasına yazılır).
→ Kabul 2–5 bu fazdan sonra ölçülür.

**Sıra ve pencere:** Faz 0 bugün. Faz 1 → 1b → 2-DB → 2-kod → 3. REST/müşteri sızıntısı Faz 3'e kadar açık; **hedef süre: Faz 3 canlı ≤ 7 gün** (2026-10-01). **Faz B (gerçek maliyet girişi) Faz 3 canlı olmadan açılmaz** (OPS kilidi).

---

## 5 · Kapılar (kalıcı katman — var olanlara bağlanır)

- `INV-MALIYET-HTML-1` (dağıtım sonrası duman, REC-381 adımına ek): sitemap adresleri + ana sayfa + vercel.app takma adı indirilir, 8 kolon adından biri geçerse KIRMIZI. Ek kol: anon anahtarıyla REST yoklaması `products?select=purchase_price` → 400 (Faz 3 sonrası).
- `INV-MALIYET-KOLON-1` (conformance, Faz 0): §4 Faz 0 madde 4.
- `INV-MALIYET-KOLON-2` (DB, `information_schema` canlıdan, advisor/db-gate): products'ta ad yasak listesi `(cost|purchase|supplier|margin|iskonto|alis)` → 0 kolon (B'nin fail-open zaafını kapatır); product_costs anon GRANT yok, SELECT politikası `is_admin_user()` içerir. FORCE RLS bu kapıda güvence olarak SAYILMAZ.
- Var olanlar: tip-drift, denetim-izi-tetik-kapısı (KAPSAM'a product_costs), R6 (Faz 1b güncellemesi), migration-atomicity.

## 6 · Açık sorular

1. ~~display_price maliyet okuyor mu?~~ ÖLÇÜLDÜ, HAYIR (fiyat `product_prices`'tan).
2. ~~Senkron tetik DEFINER mı?~~ EVET (challenger 2.2) — §4 Faz 1.
3. ~~Moderatör kaldırılınca ekran kırılır mı?~~ EVET (challenger 2.4) — Faz 1b'de rbac + R6 + dashboard aynı PR.
4. ~~Tip sırası?~~ §4 Faz 3 madde 7.
5. **Recep tercihi (açık):** liste fiyatı ileride vitrinde gösterilecek mi (§0).
6. **Gölge DB denemesi (açık):** Faz 3 madde 5 öncesi `drop column` gölgede.

## 7 · İzlenebilirlik (challenger v1 → v2)

| Challenger | Konu | v2'de |
|---|---|---|
| 2.1 | DROP ↔ denetim tetiği/görünüm | Faz 3 m.1-2, CASCADE yasak |
| 2.2 | Senkron tetik bağlamı | Faz 1: DEFINER + NEW.tenant_id; ProductFormModal koşullu yazım Faz 3 m.6 |
| 2.3 | Bayat üzerine yazma | Faz 1 "yazıcı kuralı" (tek yön, doğrudan yazım Faz 3'te) |
| 2.4 | Moderatör/R6/rbac | Faz 1b ayrı, aynı PR |
| 2.5 | Faz 2 gizli migration | Faz 2-DB / 2-kod ayrıldı; process_goods_receipt çelişkisi giderildi |
| 2.6 | purchase_price = liste | §0 + Recep tercih sorusu |
| 2.7 | Eksik tüketici/yazıcı | Faz 2-kod listesi + betikler ayrı kayıt + kalıcı INSERT tetiği |
| 2.8 | Faz 0 boşlukları | Faz 0 m.2,3,5 |
| 2.9 | Denetim gürültüsü | Faz 1 denetim maddesi |
| 2.10 | Kiracı/FORCE | Bileşik FK; FORCE güvence sayılmaz |
| 2.11 | Ad/tip/GRANT/initplan | 14 hane, asgari GRANT, `(select …)` biçimi |
| 2.14 | fail-open | INV-MALIYET-KOLON-2 ad yasak listesi |
