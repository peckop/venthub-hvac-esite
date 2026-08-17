# Satınalma Standardı (Purchasing) — v1.0

> Sahip şerit: **PRICING-STOK** · İş: **T062-VH** · Tarih: 2026-08-16
> Karar çerçevesi Recep onaylı (OPS-AUDIT aracılığıyla, pano notu 2026-08-16).
> Bu cetvel, satınalma modülünün (tedarikçi → sipariş → mal kabul → maliyet kaydı)
> **neyin nasıl inşa edileceğini ve neyin BİLEREK yapılmayacağını** tanımlar.
> Uygulama dalgaları: D2 migration · D3 servis · D4 admin UI · D5 bekçi (INV-PURCH-1).

## 1. Amaç ve kapsam

**v1 kapsamı:** tedarikçi kartları · satınalma siparişi (PO) yaşam döngüsü · mal kabul
(goods receipt) ve stok girişi · satır bazında alış maliyeti **kanıtı** · ürüne
"son alış maliyeti" yansıması · admin UI.

**v1 kapsam DIŞI (bilerek):** tedarikçi portalı · otomatik yeniden-sipariş · çoklu depo ·
teklif (QUOTE/T009) kesişimi · **fiyat motoru köprüsü** (→ §5.4, en kritik dışlama).

## 2. Varlık modeli

Dört yeni tablo (kesin şema D2 migration'ında; burada sözleşme düzeyi):

| Tablo | Rol | Çekirdek alanlar |
|---|---|---|
| `suppliers` | Tedarikçi kartı | name, tax_no, contact, currency (varsayılan alış ccy), is_active, tenant_id |
| `purchase_orders` | PO başlığı | supplier_id, status (§3), currency, expected_at, note, created_by, tenant_id |
| `purchase_order_items` | PO satırı | po_id, product_id, qty_ordered, qty_received (türev), **unit_cost + currency SNAPSHOT** (§5.1), tax_rate |
| `goods_receipts` | Mal kabul başlığı | po_id, document_no, received_by, received_at, note, tenant_id |

- Mevcut `products.supplier_name` (serbest metin) v1'de **kalır**; `suppliers` kartına
  zorunlu FK göçü v2 işi. Yeni PO'lar daima `supplier_id` ile açılır.
- Mal kabulün **satır kanıtı ayrı tablo değildir**: kanıt `inventory_movements`
  satırıdır (§4) — T052'de sipariş tarafında kurulan ilkenin simetriği.

## 3. PO durum makinesi

Tek kaynak (SSOT): `src/lib/purchasing/poStatusMachine.ts` —
`src/lib/admin/returnStatusMachine.ts` ile aynı şekil (geçiş haritası + `allowedNextStatuses`,
bilinmeyen statü → boş dizi = kilitli). CLAUDE.md kural 11: **monoton, yalnız ileri**.

```
draft ──→ ordered ──→ partially_received ──→ received ──→ closed
  │           │                │
  └→ cancelled┘                └──────────────→ closed   (kısa kapama, §3.1)
```

| Kaynak | İzinli hedefler | Not |
|---|---|---|
| `draft` | ordered, cancelled | |
| `ordered` | partially_received, received, cancelled | received/partial **türevdir** (§3.2) |
| `partially_received` | received, closed | **cancelled YASAK** — mal kısmen girdi; geri alma iade/düzeltme akışıdır, statü geri sarma değil |
| `received` | closed | |
| `closed`, `cancelled` | — | terminal, soğurucu |

- **3.1 Kısa kapama:** `partially_received → closed` = kalan miktarın gelmeyeceğinin kabulü.
  Gerekçe notu zorunlu; kalan miktar hiçbir stok/maliyet izi bırakmaz.
- **3.2 Türev statüler:** `partially_received` ve `received` elle SEÇİLMEZ; mal kabul
  RPC'si (§4) satır miktarlarından türetir (`sum(qty_received)` vs `sum(qty_ordered)`).
  Elle yapılabilen geçişler yalnız: draft→ordered, →cancelled, →closed.
- DB tarafı: `status` CHECK constraint'i sözlükle birebir; bekçi (§10/R1) modül haritası ↔
  CHECK listesi paritesini doğrular. (T052 dersi: RPC kapısı CHECK'te olmayan
  `'paid'` bekliyordu ve stok hiç düşmedi — sözlük İKİ yerde ayrı yaşayamaz.)

## 4. Mal kabul = kanıt satırı

İlke (T052 ile simetrik): **stok girişi ancak `inventory_movements` kanıt satırıyla var olur.**

- Yazma yolu TEK: `process_goods_receipt(...)` RPC (SECURITY DEFINER; auth kapısı
  `adjust_stock` ailesiyle aynı desen). Tek transaction'da: movement satırları
  (`reason='purchase_receipt'`, `delta>0`) + `goods_receipts` başlığı + PO satır
  `qty_received` güncellemesi + statü türetme + `products.stock_qty` + §5.3 yansıması.
- `inventory_movements`'a D2'de eklenen alanlar: `unit_cost numeric`, `unit_cost_currency char(3)`,
  `goods_receipt_id uuid FK`. Üçü de **NULLABLE** + koşullu CHECK:
  `reason='purchase_receipt'` ⇒ üçü de NOT NULL. Böylece mevcut satırlara backfill
  GEREKMEZ; yeni satır türü kendi zorunluluğunu taşır. (0-sipariş penceresi başka
  fırsatlar için D2'de yine değerlendirilir — karar çerçevesi md.3.)
- **Aşırı kabul yasak:** RPC, satır başına `qty_received + yeni ≤ qty_ordered` doğrular;
  aşan istek `success=false` döndürür (kısmi başarı YOK — ya hepsi ya hiçbiri).
- **İdempotens:** `goods_receipts (po_id, document_no)` UNIQUE — aynı irsaliye iki kez
  işlenemez. Ayrıca miktar tavanı (yukarıda) hesap-bazlı ikinci kilittir.
- **Restore matematiğiyle uyum (ölçüldü):** `process_order_stock_restore` düşüm/geri-ekleme
  hesabını `order_id` kapsamında yapar; `purchase_receipt` satırları `order_id IS NULL`
  taşır — iki hesap kesişmez. `purchase_receipt` HİÇBİR restore/iade sözlüğüne girmez.
- Zarf kuralı: RPC gövdesi `{success, ...}` döndürür; çağıran **`success === true`** kontrol
  eder — HTTP 200'e güvenmek yasak (T052 dersi).

## 5. Fiyat ve maliyet ilkeleri (Recep-onaylı çerçeve)

### 5.1 PO satırı maliyetini SNAPSHOT'lar
Sipariş anındaki `unit_cost + currency (+tax_rate)` PO satırına yazılır ve **orada kalır** —
tedarikçi/ürün verisi sonradan değişse de satır tarihi gerçeği söyler. (W2b-2'de sipariş
satırına kurulan ilkenin alış tarafı.) Mal kabul, maliyeti PO satırından okur; kabul anında
farklı maliyet girildiyse (fatura farkı) movement satırındaki `unit_cost` gerçek değeri taşır.

### 5.2 `products.purchase_price`'a ÜZERİNE YAZMA YOK
O alan **katalog liste fiyatıdır** ve fiyat motorunun (`refreshCostInBase` →
`cost_in_base` → materialize) **CANLI girdisidir**. Satınalma modülü bu alana ve
`purchase_currency`/`purchase_rate_to_base`'e **hiçbir koşulda yazmaz**. Bekçi R3 bunu doğrular.

### 5.3 Gerçek alış maliyeti YENİ alanlarla yansır
D2, `products`'a ekler: `last_purchase_cost numeric NULL` · `last_purchase_currency char(3) NULL` ·
`last_purchased_at timestamptz NULL`. Yalnız `process_goods_receipt` yazar (son kabul kazanır).
Bunlar **rapor/görünürlük** alanlarıdır — motor zinciri bunları OKUMAZ (v1).

### 5.4 Motor köprüsü v1'de KAPALI (bilerek, yazılı)
Mal kabul **hiçbir yolla** `refreshCostInBase` / `materializePrices` zincirini tetiklemez;
satınalma verisi hiçbir vitrin/render yüzeyini etkilemez. Bu yüzden v1'de
`rendering-cache-standard` kaydı da gerekmez — etkilenen statik yüzey YOKTUR.

**Niçin kapalı:** "motor hangi maliyeti kullanır" sorusu ayrı, bilinçli bir politika
adımıdır. Kapı açılırsa mal-kabul, W5 fx-lock kilidini delebilir ve render zinciri
tetiksiz kalabilir — bugün zararsız görünen köprü, yeni yazar eklenince silahlanır
(T052/#556 dersi). Kapalılık bekçi R4 ile **assert edilir**, varsayılmaz.

**Açılış şartları (v2 — HEPSİ birlikte, tek tasarım):**
1. `pricing_policy`'ye `cost_source` (ör. `catalog | last_purchase`) benzeri açık ayar;
2. fx_lock ile etkileşimin tanımı (kilitli kapsamda maliyet güncellemesi ne yapar?);
3. `rendering-cache-standard`'a tetik + webhook dalı kaydı (hangi yüzey, ne tazelenir);
4. INV-PRICE-7 ve INV-PURCH-1'in birlikte güncellenmesi;
5. bu cetvelin §5.4'ünün yeniden yazılması + Recep onayı.

## 6. Yetki, RLS, denetim

- Dört tablo da **tenant-scoped** RLS; admin politika deseni `pricing_rule` ile aynı,
  rol dizisi `array['super_admin','admin','moderator']` (ölü yazım `superadmin` YASAK).
  Yetki kararı `app_metadata` üzerinden (kural 12).
- `process_goods_receipt` auth kapısı `adjust_stock` ailesiyle aynı; `revoke ... from anon`
  açıkça yazılır (varsayılan-grant tuzağı — #559 dersi).
- PO onayı/iptali/kısa kapama ve mal kabul `admin_audit_log`'a yazılır (kural 11).
- Client'tan PO/receipt tablolarına **doğrudan yazma yok**: durum geçişleri servis + RPC
  üzerinden; bekçi R2 client-side doğrudan insert'i tarar.

## 7. Servis katmanı (D3)

- `src/lib/services/purchasing.service.ts` — kural 2 (DI): ilk parametre
  `supabase: SupabaseClient<Database>`. `diSignature` testi dizin-türevli olduğundan dosya
  doğduğu an kapsamdadır.
- Saf yardımcılar (statü türetme, miktar doğrulama) DI'sız export edilebilir →
  `PURE_HELPERS_EXEMPT` listesine ADLA eklenir.
- Maliyet yansıması (§5.3) servis içinde **ayrı, adlandırılmış adımdır** — mal kabulle aynı
  transaction'da ama kodda ayrı fonksiyon; v2 köprü tasarımı bu dikişten yapılır.

## 8. Admin UI (D4)

- Dosyalar: `src/app/admin/purchasing/**` + `src/views/admin/purchasing/**` +
  `src/components/admin/purchasing/**` + `src/i18n/dictionaries/admin/purchasing.{tr,en}.ts`.
  Oyma 2026-08-16'da ADMIN-CUSTOMER'dan ALINDI; üç koşulu bağlayıcı: mevcut admin sözlük
  dosyalarına dokunma · aggregator kaydı TR+EN'e BİRLİKTE · çözücü NESTED-ONLY.
- `admin-standard` K1–K5 + DataTableKit deseni geçerli; statü butonları
  `allowedNextStatuses`'tan ÜRETİLİR (elle buton listesi yasak — returnStatusMachine deseni).
- Tüm metin sözlükten (kural 7); tutar gösterimi PO para birimiyle, TRY'ye çevrim YOK
  (çevrim = motor işi, köprü kapalı).

### 8.1 UI izni, DB izninin ötesine geçemez — `warehouse` v1'de YOK

**Kural:** bir role admin sayfası/yazma izni verilebilmesi için, o sayfanın okuduğu
tabloların **RLS SELECT politikası da o rolü içermek zorundadır.** Aksi hâlde kullanıcı
sayfayı açar, RLS boş küme döner, ekranda "kayıt yok" yazar ve **hiçbir hata düşmez** —
yetki eksiği boş veriye benzer. Bekçi R6 bu paritenin kalıcı kapısıdır.

**Ölçülen durum (2026-08-16, prod):** `process_goods_receipt` RPC kapısı `warehouse`'u
kabul eder (`adjust_stock` ailesinin deseni), ama `purchase_orders`/`purchase_order_items`/
`goods_receipts` RLS SELECT'i yalnız `super_admin|admin|moderator`'a açıktır
(`pricing_policy` deseni — maliyet hassas). İki desen çarpıştı; D4'te `warehouse`'a
verilen sayfa+yazma izni bu yüzden **geri alındı**. Bugün gerçek bir warehouse kullanıcısı
yok, yani kusur zarar üretmeden kapandı — ama "kapı açıkken göç etmemiş yol" sınıfına
girmeden kapatıldı.

**Warehouse mal kabulünü açma şartları (v1.1, HEPSİ birlikte):**
1. Fiyat/maliyet kolonu taşımayan bir görünüm (ör. `purchase_orders_ops_v`) + o görünüme
   `warehouse` SELECT — maliyet gizli kalır, iş görünür olur;
2. UI'ın o görünümü okuması (tabloyu değil) ve maliyet alanlarını hiç istememesi;
3. `rbac`'a `warehouse` girişlerinin geri eklenmesi — R6 paritesi bu üçüyle sağlanır;
4. migration gerektirir → kural 13, Recep kapısı.

## 9. Migration disiplini (D2)

- Kural 13: migration'lı PR yalnız Recep onayıyla merge. Damga = **gerçek saat** 14 hane
  (`YYYYMMDDHHMMSS_`); uygulanmış migration'ın adı KİMLİKTİR, yeniden adlandırılmaz.
- `_migration_ledger` bayt-sırası: yeni dosya adları mevcut uygulanmışların ardına düşmeli.
- D2 içeriği: 4 tablo + `inventory_movements` 3 kolon + koşullu CHECK + `products` 3 kolon +
  RPC + RLS + grant/revoke + `admin_audit_log` bağları. Backfill kararı (0-sipariş
  penceresi dahil) migration yorumunda ÖLÇÜMLE gerekçelenir.

## 10. Bekçi: INV-PURCH-1 (D5)

`src/__tests__/conformance/purchasing-machine-and-evidence.test.ts`. Kurallar:

| # | Kural | Şekil |
|---|---|---|
| R1 | Durum sözlüğü TEK: `poStatusMachine` haritası ↔ son-tanımlayan migration'daki CHECK listesi birebir; ikinci `TRANSITIONS` haritası yasak | parity + yapısal tarama |
| R2 | Stok girişi kanıtsız olamaz: mal kabul yazan her yol `process_goods_receipt` RPC'sini **çağırır** (`rpc('process_goods_receipt'` veya `/rest/v1/rpc/process_goods_receipt`); client kodunda `purchase_orders`/`goods_receipts`/`inventory_movements`'a doğrudan insert yasak | **çağrı-bazlı**, yorum sıyırmalı |
| R3 | `purchasing*` dosyaları `purchase_price`/`purchase_currency`/`purchase_rate_to_base`'e YAZMAZ | update/insert alan taraması |
| R4 | **Mal kabul motor zincirini ÇAĞIRMAZ**: `purchasing*` içinde `refreshCostInBase`/`materializePrices` çağrısı yok | **ayrı assert, çağrı-bazlı** (karar çerçevesi md.2) |
| R5 | RPC zarfı: çağıranlar `success` alanını kontrol eder | desen taraması |
| R6 | **UI izni ⊆ DB izni**: `canWrite(rol,'purchasing')` doğru olan her rol, `purchase_orders_admin_select` politikasının rol dizisinde de olmalı (§8.1) | `canWrite` **çağrılır** (matris regex'le okunmaz) + son-tanımlayan politikadan rol dizisi |

**Durum (2026-08-16): CANLI.** 9 test; 7 kuralın tamamı bilerek-bozarak kanıtlandı
(sahte geçiş haritası · doğrudan `goods_receipts` insert'i · zarfsız RPC çağrısı ·
`purchase_price:` yazımı · `refreshCostInBase()` çağrısı · modüle sahte statü ·
RPC adını sakatlama · R6 İKİ YÖNDEN: warehouse'a yazma izni geri ekleme **ve** RLS rol
dizisini daraltma — dokuzu da KIRMIZI gördü, restore sonrası yeşil). Parser sağlığı
sentetik pozitif/negatif çiftiyle ölçülür (gerçek ihlalin varlığına bağlı değil);
yorum sıyırma CRLF-güvenli (`[^\r\n]*`); eager glob'lar e2e'nin geçici
`*.compiled.<rastgele>.ts` dosyalarını `!` deseniyle dışlar (#571).

Teknik zorunluluklar (bu oturumun dersleri): yorum sıyırma **CRLF-güvenli** (`[^\r\n]`,
`.` değil) · assert kendi dokümanı/yorumuyla TATMİN OLMAZ · her kural **bilerek-boz**
kanıtıyla gelir (R1: haritaya sahte geçiş ekle; R2: RPC çağrısını doğrudan insert'le
değiştir; R3: purchase_price'a update yaz; R4: servise materializePrices çağrısı ekle —
dördü de KIRMIZI görülmeden PR açılmaz).

## 11. Karar günlüğü

| Tarih | Karar | Kaynak |
|---|---|---|
| 2026-08-16 | `purchase_price` = katalog liste fiyatı, satınalma DOKUNMAZ; gerçek maliyet PO satırı + `last_purchase_*` | Recep (OPS-AUDIT çerçevesi md.1) |
| 2026-08-16 | Motor köprüsü v1 KAPALI; açılış = §5.4 beş şart birlikte | Recep (çerçeve md.2) |
| 2026-08-16 | Backfill/NOT NULL kararları D2'de, 0-sipariş penceresi göz önünde | Recep (çerçeve md.3) |
| 2026-08-16 | `partially_received → cancelled` yasak; kısa kapama `closed` | Bu cetvel (§3.1) |

## 12. Açık sorular (v2 adayları)

- `products.supplier_name` → `supplier_id` FK göçü (veri temizliği ister).
- Fatura/irsaliye belge eşleştirme (T055 fatura hattıyla kesişim).
- Ağırlıklı ortalama maliyet vs son-alış (şu an: yalnız son-alış, raporlama amaçlı).
- Motor köprüsü (§5.4) — en büyük v2 kalemi.

## 13. DB sertleştirme M5–M6 — PLAN (uygulanmadı, Recep dalga onayı bekliyor)

> **Durum: yalnız PLAN.** İki madde de migration gerektirir (kural 13). OPS-AUDIT ataması
> 2026-08-17: "quote modülündeki doğru DB-desenini purchasing'e uygula; şimdi yalnız planı
> çıkar." Uygulama, Recep dalga onayından sonra ayrı bir PR'dır.

**Niçin var:** v1'de satınalmanın iki güvencesi yalnız **uygulama katmanında** duruyor.
Cetvel §3 "monoton" diyor, §5.1 "snapshot" diyor — ama veritabanı ikisini de zorlamıyor.
Doğrudan SQL erişimi olan bir yol (yeni bir servis, bir script, ileride gevşetilecek bir RLS)
her ikisini de sessizce delebilir. Teklif modülü aynı iki güvenceyi DB'de kuruyor; desen
zaten evde, purchasing ona hizalanmalı.

### 13.1 M5 — Kolon düzeyi grant (şu an YOK)

**Ölçüm (2026-08-17, prod):**

| Tablo | `authenticated` INSERT / UPDATE kolon sayısı |
|---|---|
| `venthub_quote_items` (doğru desen) | **6 / 3** — INSERT'te fiyat kolonları YOK; UPDATE yalnız `unit_price, currency, valid_until` |
| `purchase_order_items` | **10 / 10** — hepsi açık |
| `purchase_orders` | 11 / 11 · `goods_receipts` 8 / 8 · `suppliers` 13 / 13 |

Bugün zarar üretmiyor çünkü RLS satır düzeyinde zaten admin rolleriyle sınırlı. Ama RLS
**tek hat**; §8.1'de yazdığımız v1.1 adımı (warehouse'a görünüm üzerinden SELECT) bu hattı
bilerek gevşetiyor. Kolon grant'ı ikinci hattır ve tam o senaryoda çalışır.

**Planlanan kısıtlar** (`revoke` + dar `grant`, `authenticated` için):

| Kolon | Karar | Gerekçe |
|---|---|---|
| `purchase_order_items.qty_received` | UPDATE **çekilir** | Yalnız `process_goods_receipt` yazar (SECURITY DEFINER → grant'tan etkilenmez). Elle yazım kanıt satırını atlatır (§4). |
| `purchase_order_items.unit_cost`, `.currency` | UPDATE **çekilir** (INSERT kalır) | Sipariş anı SNAPSHOT'ıdır (§5.1); doğduktan sonra değişmemeli. Fatura farkı mal kabulde `inventory_movements.unit_cost`'a yazılır, satıra geri yazılmaz. |
| `products.last_purchase_cost/currency/purchased_at` | UPDATE **çekilir** | Yalnız RPC yazar (§5.3). |
| `purchase_orders.status` | UPDATE **kalır** | Servis elle geçiş yapar; sınırı M6 tetiği koyar. |

### 13.2 M6 — Durum geçiş tetiği (şu an YOK)

**Ölçüm (2026-08-17, prod):** `venthub_quotes`'ta `trg_enforce_quote_status_transition` var;
`purchase_orders`'ta durum tetiği **yok** — yalnız CHECK var, o da "hangi değerler geçerli"yi
söyler, "hangi geçiş geçerli"yi değil. Yani `received → draft` geri sarma DB'de mümkün ve
CLAUDE.md kural 11'in (monotonluk) satınalma tarafında DB karşılığı yok.

**Planlanan:** `enforce_po_status_transition()` + `purchase_orders` BEFORE UPDATE tetiği —
`enforce_quote_status_transition` ile birebir aynı şekil (aynı statü → geç; izinli geçiş →
geç; aksi → `raise exception ... errcode 'P0001'`). Harita `poStatusMachine` ile birebir:

```
draft → ordered, cancelled          ordered → partially_received, received, cancelled
partially_received → received, closed   received → closed      closed, cancelled → (yok)
```

**Kapsam dışı (bilinçli):** "türev statüler yalnız RPC'den" kuralının DB'de zorlanması.
Bunun için tetiğin çağıran bağlamını ayırt etmesi gerekir (`set_config` bayrağı); quote
deseninde de yok, INV-PURCH-1/R1b + servis kapısı bugün yeterli. Ayrı öneri olarak durur.

### 13.3 Bekçi eklentileri (INV-PURCH-1)

| # | Kural | Şekil |
|---|---|---|
| R7 | `purchase_order_items` UPDATE grant'ında `unit_cost`/`currency`/`qty_received` **bulunmaz**; `products` UPDATE grant'ında `last_purchase_*` bulunmaz | son-tanımlayan migration'daki `revoke/grant` ifadelerinden kolon kümesi çıkarılır |
| R8 | DB tetiği ↔ modül haritası paritesi: `enforce_po_status_transition` gövdesindeki geçiş çiftleri `poStatusMachine` ile **birebir** | R1a'nın tetik ikizi; `PO_STATUSES` gibi harita da modülden import edilir, tetik gövdesi migration'dan ayrıştırılır |

### 13.4 Sabotaj listesi (uygulama PR'ında koşulacak — hepsi KIRMIZI görmeli)

1. Tetik gövdesine sahte geçiş ekle (`received → draft`) → R8 parite kırmızı.
2. Modül haritasına sahte geçiş ekle, tetiği bırak → R8 kırmızı (**iki yönlü**, tek yön yetmez).
3. Tetiği `drop trigger` ile kaldır → R8 "tetik yok" kırmızı.
4. `unit_cost`'a UPDATE grant'ını geri ver → R7 kırmızı.
5. `qty_received`'e UPDATE grant'ını geri ver → R7 kırmızı.
6. **Canlı davranış** (migration uygulandıktan sonra, prod'da tek seferlik): geçersiz geçiş
   denemesi `P0001` almalı; RPC üzerinden meşru mal kabul ise **çalışmaya devam etmeli**
   (pozitif çapa — her şeyi reddeden bir tetik de "yeşil" görünür).

### 13.6 M7 — `search_path` illüzyonu (aynı pakette düzeltilecek)

**Bulgu LEGAL'den, prod'da KENDİM DOĞRULADIM (2026-08-17).** Yazdığım yedi fonksiyon
(`adjust_stock` ×2, `set_stock` ×2, `process_goods_receipt`,
`process_order_stock_reduction`, `process_order_stock_restore`) şu satırı taşıyor:

```sql
set search_path = 'pg_catalog, public'   -- ❌ TEK TIRNAK: tek bir isim
```

`pg_proc.proconfig` bunu `search_path="pg_catalog, public"` olarak saklıyor — yani
**"pg_catalog, public" adında tek bir şema**. Böyle bir şema yok, dolayısıyla arama
yolu fiilen boş.

**Davranış ölçümü (transaction + rollback, prod'a yan etki yok):**

| Ayar | Geçici tablo YOKken | Oturumda `CREATE TEMP TABLE products` VARken |
|---|---|---|
| `"pg_catalog, public"` (bugünkü 7 fn) | **NULL** — çözülmez | **geçici tabloyu bulur** ⚠️ |
| `public` | `public.products` | **geçici tabloyu bulur** ⚠️ |
| `public, pg_temp` | `public.products` | **`public.products`** ✅ |

> **İlk taslakta yanıldım, ölçüm düzeltti.** "`pg_temp` ASLA yazılmaz" diye yazmıştım;
> OPS-AUDIT itiraz etti ve haklı çıktı. PostgreSQL'de `pg_temp` search_path'te **açıkça
> listelenmezse relation aramasında ÖRTÜK OLARAK İLK** sıradadır. Yani `public` tek başına
> yazıldığında çağıran, kendi oturumunda `CREATE TEMP TABLE products` yapıp SECURITY DEFINER
> fonksiyonuna **gölge tablo yedirebilir**. `pg_temp`'i açıkça SONA yazmak örtük-ilk kuralını
> devre dışı bırakır — resmî güvenli biçim budur.
>
> Aynı ölçüm bugünkü kusuru da ağırlaştırıyor: bozuk tırnaklı ayar yalnız "hiçbir şey
> yapmıyor" değil, **aktif olarak savunmasız** — arama yolu boş olduğu için niteliksiz bir
> referans doğrudan geçici tabloya düşer.

**Neden bugün patlamıyor:** yedi fonksiyonun gövdesi de her nesneyi `public.` ile tam
niteliyor. Yani satır *koruma sağlıyor* sanılıyor ama **hiçbir şey yapmıyor** — gövdeye
eklenecek ilk niteliksiz referans anında patlar. Bu bir "illüzyon-sertleştirme": en
tehlikeli hâli, çünkü denetimde ✅ gibi okunur.

#### Cetvel kuralı — tek doğru desen (yeni fonksiyonlar bunu kopyalasın)

```sql
set search_path = public, pg_temp     -- ✅ tırnaksız liste; pg_temp EN SONDA
```

- **`pg_temp` MUTLAKA ve EN SONDA yazılır.** Yazılmazsa relation aramasında örtük olarak
  **ilk** sıraya geçer ve çağıranın geçici tablosu uygulama tablosunu gölgeler (yukarıdaki
  ölçüm). Açıkça sona yazmak bu davranışı kapatır.
- **`pg_catalog` AÇIKÇA YAZILMAZ.** Yazılmazsa örtük olarak *ilk* aranır; yazılırsa
  yazıldığı sıraya düşer. Bu yüzden `public, pg_catalog` **yanlıştır** — `public`'te
  aynı adlı bir nesne varsa çekirdek fonksiyonun önüne geçer.
- Ek şema gerekiyorsa `public` ile `pg_temp` **arasına** girer
  (ör. webhook fonksiyonu: `set search_path = public, net, vault, pg_temp`).
- `search_path = ''` (tam niteleme zorunlu) daha katı bir alternatiftir ama **gerekmiyor**:
  ölçüldü, `public` şemasında `anon`/`authenticated`/`service_role` için **CREATE yetkisi
  YOK**, yani `public` üzerinden gölgeleme mümkün değil.

#### Planlanan düzeltme (migration — M5/M6 ile AYNI pakette)

Yedi fonksiyon `create or replace` ile yeniden tanımlanır; **tek değişiklik `set` satırı**,
gövdeler aynen korunur. Sonrasında `proconfig` prod'dan yeniden okunur (`{search_path=public}`
görülmeli) ve mal kabul + stok düşme yolları bir kez çalıştırılıp **pozitif çapa** alınır.

> **Depo geneli (ölçüldü):** 28 SECURITY DEFINER fonksiyonunda **7 ayrı desen** var.
> 7'si bu bozuk biçimde (benim — M7 kapatır); **6'sı `public, pg_temp` yani ZATEN DOĞRU**
> (ilk taslakta yanlışlıkla riskli demiştim, düzeltildi); 3'ü `public, pg_catalog`
> (`pg_temp` yok → gölgelenebilir, ayrıca sıra ters). Şeridim dışındakiler OPS-AUDIT'e
> iletildi. Bu cetvel yalnız kendi fonksiyonlarımı bağlar ama **doğru örnek** olarak durur.

### 13.5 Uygulama notları

- Tek migration yeterli (iki madde de aynı tabloları ilgilendiriyor, aynı işlemde).
- **M7 de aynı migration'a girer** — yedi fonksiyon zaten yeniden tanımlanmıyorsa bile
  `set` satırı için yeniden tanım gerekir; ayrı migration açmak ledger'ı gereksiz şişirir.
- Damga gerçek saat 14 hane; ledger bayt-sırasının arkasına düşmeli (§9).
- **Sıra önemli:** önce tetik, sonra grant kısıtı. Ters sırada, grant çekilirken servis
  yazma yolu kısa süre kısıtlı ama kuralsız kalır.
- Mevcut veriye dokunulmaz: prod'da 0 PO var (modül yeni), yani geriye dönük geçiş
  ihlali riski yok — bu pencere de W2b-2'deki gibi bir kolaylık, uygulamadan önce
  **yeniden ölçülmeli** (0 olmayabilir).
