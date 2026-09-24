# REC-140 · Ürün maliyet alanlarının kilidi (2026-09-24, ALTYAPI)

**Durum:** PLAN v1 — plan-challenger bekliyor. Migration içerir → kural 13: merge = prod'a otomatik uygulanır, **Recep onayı** ALTYAPI penceresinde.
**Cetvel:** `docs/standards/migration-safety-standard.md` (migration) · CLAUDE.md kural 11/12 (RLS-first, yetki `app_metadata`) · karar 95 (Recep 2026-09-24: moderatör maliyeti ve alış iskontosunu GÖRMEZ, yalnız yönetici görür).
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

## 3 · Seçenekler

| | **A · Kolon yetkisi** | **B · Ayrı tablo `product_costs`** |
|---|---|---|
| Ne | products'ta tablo SELECT'i kaldır, 30 kolona kolon-GRANT; admin okuma DEFINER RPC | 8 kolon yeni tabloya; products'tan düşer; RLS: yalnız `is_admin_user()` |
| Tüm-satır fonksiyonları (6) | HEPSİ yeniden yazılır (DEFINER ya da id parametresi) | **Dokunulmaz** (products'ta sır kalmaz) |
| Yeni kolon eklenince | Her migration GRANT listesini günceller; unutulursa vitrin kırılır | Varsayılan güvenli: products'a eklenen kolon kamusal, maliyet tablosuna eklenen gizli |
| Sektör deseni | Kolon yetkisi tüm-satır referanslarıyla çakışır (§1.5 ⚠) | Hassas veri ayrı tablo + ayrı politika (dış belge teyidi challenger'a bırakıldı — ÖLÇÜLMEDİ) |
| Admin kod değişikliği | 20 nokta RPC'ye | 20 nokta `product_costs` embed/join'e |
| Risk | Yüksek (sessiz fiyat kaybı yolu) | Orta (veri taşıma — aşamalı yapılır) |

**Öneri: B.** A, bugünkü tüketicilerin 6'sını kırar ve her gelecek kolonda aynı tuzağı kurar. B'de sırrın yeri tek, politika tek.

---

## 4 · Fazlar (B)

**Faz 0 — ACİL, migration'sız, URUN (bugün):** `VARIANT_DETAIL_COLUMNS`'tan `supplier_name`, `purchase_price` çıkar; `ProductFormModal` ayrı admin kolon listesi alır (yoksa kaydetme alış fiyatını null'a yazar); conformance: vitrin kolon listesi 8 hassas kolondan hiçbirini içermez. Merge sonrası ana sayfa yeniden üretilir, curl ile 0 ölçülür. → Kabul 1. (URUN'a iletildi 08:19Z.)

**Faz 1 — migration 1 (ekleyici, hiçbir şeyi kırmaz):**
- `create table public.product_costs (product_id uuid primary key references products(id) on delete cascade, tenant_id uuid not null, <8 kolon>, updated_at)`; RLS **enable + force**; politikalar: SELECT/INSERT/UPDATE/DELETE `tenant_id = jwt_tenant_id() and is_admin_user()`; `revoke all on product_costs from anon`; authenticated'a tablo GRANT (satırı politika süzer).
- Kopya: `insert into product_costs select id, tenant_id, <8 kolon> from products` (442 satır; sayım önce/sonra).
- Senkron tetik (geçiş dönemi): products'taki 8 kolona yazım → product_costs'a upsert (eski yazıcılar Faz 2'de taşınana kadar veri ayrışmasın).
- Denetim izi: `denetim_izi_*` tetiği product_costs'a da.
- Karar 95: pricing_rule, purchase_orders, purchase_order_items, suppliers SELECT politikalarından `moderator` çıkar (UPDATE/DELETE politikaları ayrıca ölçülür; moderatörün ürün düzenleme yetkisi bu planın konusu DEĞİL).

**Faz 2 — kod (URUN admin ekranları + ALTYAPI servisleri):** 20 okuma noktası `product_costs`'tan okur (embed `product_costs(...)` ya da ayrı sorgu); yazıcılar (ProductFormModal, ProductCsvImport upsert, pricingMaterialize update, InventoryTableBody supplier_name update, `process_goods_receipt`) product_costs'a yazar. `admin_search_products` anon EXECUTE kaldırılır, purchase_price product_costs'tan (INVOKER kalır → RLS süzer). Görünümler `inventory_summary`/`inventory_velocity` product_costs'a LEFT JOIN (moderatör: sermaye/tedarikçi NULL).

**Faz 3 — migration 2 (kaldırıcı):** products'tan 8 kolon DROP (önce: kodda 0 referans kapısı + taban taraması; `archive_pre_kademe2.products` kopyasına dokunulmaz); senkron tetik kaldırılır. → Kabul 2–5 bu fazdan sonra ölçülür.

**Sıra kısıtı:** Faz 3, Faz 2'nin tüm tüketicileri canlıda iken merge edilir; aksi hâlde admin ekranları kırılır. Faz 1 tek başına güvenlidir (ekleyici) ama REST sızıntısını KAPATMAZ — kapanış Faz 3'tür. **Faz B (gerçek maliyet girişi) Faz 3 canlı olmadan açılmaz** (OPS).

---

### 1.6 Sayfa türü taraması ve süre (2026-09-24, OPS isteği)

- Sitemap'in 88 adresi + arama/bilgi/karşılaştırma tek tek indirildi: HTML'de maliyet alanı **yalnız ana sayfa** (`/tr`, `/en`: 12'şer `purchase_price`, `supplier_name` anahtarı var değeri boş). Kategori 24, ürün 48, marka 7, diğer 10 sayfa: 0. Diğer 6 maliyet kolonu hiçbir sayfada yok.
- HTML dışı: ürün detay (tarayıcı sorgusu), sepet, sihirbaz, sipariş detayı aynı listeyi tarayıcıdan çeker → değer ağ yanıtında görünür. Faz 0 bunları da kapatır.
- Eski dağıtım adresleri (`venthub-hvac-esite-<hash>-…`): 302, SSO korumalı. Üretim takma adı `venthub-hvac-esite.vercel.app`: 200, ana siteyle aynı içerik (12 `purchase_price`) → Faz 0 ile düzelir.
- Başlangıç: `purchase_price` vitrin servis sorgularında 2026-04-03'ten (73d9ff4a2) beri; 2026-08-12'de ortak listeye taşındı (683d2d75b). REST yolu aynı dönemden. Değerlerin DB'ye doluş tarihi ölçülmedi.

## 5 · Kapılar (kalıcı katman)

- `INV-MALIYET-HTML-1` (dağıtım sonrası duman): sitemap'teki tüm adresler + ana sayfa indirilir, 8 hassas kolon adından biri geçerse KIRMIZI. REC-381'in "birleşme sonrası üretim izleme" adımına eklenir (URUN'un statik testine EK: statik test kolon listesini, bu kapı çıktıyı ölçer).

- `INV-MALIYET-KOLON-1` (conformance): `VARIANT_DETAIL_COLUMNS` ve `src/` altındaki anon/static client sorguları 8 hassas kolonu içermez.
- `INV-MALIYET-KOLON-2` (DB, advisor/db-gate): `products` tablosunda 8 hassas kolon adı YOK; `product_costs` RLS force=true, anon GRANT yok, SELECT politikası `is_admin_user()` içerir.
- Canlı duman (elle, Faz 3 sonrası): anon + moderatör claim taklidiyle kolon okuma → reddedilir; admin → okur.

## 6 · Açık sorular (challenger'a)

1. ~~`display_price(p)` ailesi maliyet okuyor mu?~~ **ÖLÇÜLDÜ, HAYIR:** `display_price` fiyatı `product_prices` + `price_lists`'ten (segment sırası) alır, `p`'den yalnız `p.id` okur; `display_price_tax_included` yalnız `jwt_price_segment()`. → Faz 3 vitrin fiyatını bozmaz.
2. Senkron tetik DEFINER mı olmalı (products'a yazan admin, product_costs'a da yazabilir; ama `process_goods_receipt` DEFINER)?
3. `pricing_rule` vb. moderatörden kaldırılınca moderatörün kullandığı bir ekran kırılır mı?
4. Supabase tip üretimi (`supabase:gen`) ve `tip-drift` kapısı Faz 1/3'te nasıl sıralanır?
