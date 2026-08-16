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

**Durum (2026-08-16): CANLI.** 8 test; 6 kuralın tamamı bilerek-bozarak kanıtlandı
(sahte geçiş haritası · doğrudan `goods_receipts` insert'i · zarfsız RPC çağrısı ·
`purchase_price:` yazımı · `refreshCostInBase()` çağrısı · modüle sahte statü ·
RPC adını sakatlama — yedisi de KIRMIZI gördü, restore sonrası yeşil). Parser sağlığı
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
