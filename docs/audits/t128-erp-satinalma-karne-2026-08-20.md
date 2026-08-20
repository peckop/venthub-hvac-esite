# T128-VH — ERP/Satınalma Gerçekleşme Karnesi (2026-08-20)

## KAYNAK / CETVEL

| Kaynak | Rol | Tazelik |
|---|---|---|
| `docs/standards/purchasing-standard.md` | **yöneten cetvel** (§1–§13) | 2026-08-16/17; §13 hâlâ "PLAN" diyor — **bu karnede doğrulandı** |
| `docs/audits/operasyon-dongusu-denetimi-2026-08-15.md` | önceki karne | **BAYAT** — 08-15'ten beri ~40 PR geçti |
| prod DB (canlı sorgu) | gerçeklik | 2026-08-20 08:30Z |

**Cetvel var** — yazılması iş kapsamına girmiyor.

## YÖNTEM

Üç katman paralel ölçüldü (mekanik tarama Sonnet alt-ajanlarında, yargı ve doğrulama ana
oturumda — model-ekonomisi kararı 08-20):

- **Servis + durum makinesi** · **Admin UI + i18n** · **Bekçi testleri + migration'lar** → alt-ajanlar
- **Canlı prod DB** (tablo, RLS, politika, tetik, FK, CHECK, RPC, satır sayısı) → ana oturum

**Ajan bulgusu düzeltildi:** bir ajan INV-PURCH-1'de "8 test var, cetvel 9 diyor → doküman
kayması" raporladı. Kendim saydım: **9**. Kayma YOK, bulgu karneye girmedi.

---

## ÖZET

| Katman | VAR | KISMEN | YOK |
|---|---|---|---|
| Veri modeli + RLS (D2) | 8 | 0 | 0 |
| Servis + durum makinesi (D3) | 14 | 0 | 0 |
| Admin UI + i18n (D4) | 12 | 1 | 1 |
| Bekçi INV-PURCH-1 (D5) | 8 | 0 | 0 |
| §13 DB sertleştirme (M5–M8) | 0 | 0 | 5 |

> **Tek cümlelik hüküm:** modül **kodda tam, kapılarla korunuklu ve canlıda kurulu** —
> ama **üretimde HİÇ KULLANILMAMIŞ**, ve DB seviyesinde durum geçişi korumasız.

---

## 1. ⚠ EN SERT BULGU — SIFIR KULLANIM

Canlı sorgu (2026-08-20 08:30Z):

| Tablo | Satır | Son kayıt |
|---|---|---|
| `suppliers` | **0** | — |
| `purchase_orders` | **0** | — |
| `purchase_order_items` | **0** | — |
| `goods_receipts` | **0** | — |

Modül 2026-08-16'da canlıya indi. **Dört gündür tek tedarikçi, tek sipariş, tek mal kabul yok.**

**Bunun karne açısından anlamı:** "VAR" işaretlerinin tamamı **yapısal** kanıttır —
kod yolu, kısıt, politika. **Davranışsal kanıt YOK**: RPC'nin gerçek bir mal kabulünde
doğru çalıştığı, stok hareketinin gerçekten doğduğu, idempotens reddinin gerçek bir çift
gönderimde tetiklendiği **hiç görülmedi**. Bu bir kusur değil, **kanıt boşluğu** — ve
ERP tasarımı bu modülü "çalışıyor" varsayarsa yanlış zemine oturur.

---

## 2. VERİ MODELİ ve RLS (D2) — VAR

Canlı DB'den ölçüldü:

- **Dört tablo kurulu**, hepsinde **RLS açık**: `suppliers` (4 politika), `purchase_orders` (4),
  `purchase_order_items` (4), `goods_receipts` (2).
- **Kanıt zinciri FK ile kilitli:** `goods_receipts.po_id → purchase_orders` **RESTRICT**,
  `inventory_movements.goods_receipt_id → goods_receipts` **RESTRICT**.
  → Mal kabulü olan bir PO **silinemez**; kabulü olan bir hareket kabulü kilitler.
- `purchase_orders`'ta DELETE politikası **var** — ilk bakışta risk göründü, **ölçümle çürüdü:**
  RESTRICT nedeniyle yalnız kabulü olmayan (boş) PO silinebilir. `purchase_order_items` CASCADE
  ile temizlenir. **İhlal değil.**
- `goods_receipts`'te **UPDATE ve DELETE politikası hiç yok** → salt-ekleme kanıt defteri. Doğru.
- **CHECK kısıtları canlıda:** `purchase_order_items_receipt_cap (qty_received <= qty_ordered)`,
  `goods_receipts_po_document_uniq UNIQUE (po_id, document_no)`,
  `inventory_movements_purchase_receipt_evidence` (reason='purchase_receipt' ⇒ receipt_id +
  unit_cost + currency dolu, delta>0, **order_id NULL**).
- **RPC canlıda:** `process_goods_receipt(p_po_id, p_document_no, p_lines, p_note)`,
  `SECURITY DEFINER`. Migration ile prod arasında **drift yok** (ikisi de ölçüldü).
- §5.3 maliyet alanları `products`'ta mevcut: `last_purchase_cost`, `last_purchase_currency`,
  `last_purchased_at`, ayrıca `cost_in_base`, `purchase_rate_to_base`.

---

## 3. SERVİS ve DURUM MAKİNESİ (D3) — VAR

- **DI kuralı:** dokuz servis fonksiyonunun tamamı ilk parametre `supabase: SupabaseClient<Database>`
  (`src/lib/services/purchasing.service.ts:70,81,96,121,132,152,207,280,310`); `diSignature` bekçisi
  dizin-türevli kapsamda otomatik yakalıyor.
- **Durum makinesi SSOT tek:** `src/lib/purchasing/poStatusMachine.ts:37-44` cetvel §3 tablosuyla
  birebir; türev statüler (`partially_received`, `received`) elle seçilemiyor (satır 62-66).
- **Yarış kapısı:** statü UPDATE'i `.eq('status', current.status)` ile atılıyor
  (`purchasing.service.ts:234-240`) — eş zamanlı iki geçişten yalnız biri satır bulur.
- **Kısa kapama gerekçesi zorunlu** (satır 224-226), hem serviste hem UI'da.
- **Mal kabul TEK yazma yolu:** yalnız `supabase.rpc('process_goods_receipt')`; istemciden
  `goods_receipts`/`inventory_movements`'a doğrudan insert **yok**.
- **§5.2 yasağı korunuyor:** `purchase_price` / `purchase_currency` / `purchase_rate_to_base`
  satınalma kodunda hiç geçmiyor; RPC yalnız `stock_qty` + `last_purchase_*` yazıyor. **İhlal yok.**
- **§5.4 motor köprüsü kapalı:** `refreshCostInBase` / `materializePrices` yalnız yorumda.
- **Denetim kaydı:** statü geçişi ve mal kabul `logAdminAction` ile `admin_audit_log`'a yazıyor.

---

## 4. ADMIN UI (D4) — VAR (bir KISMEN, bir YOK)

- **Ekranlar:** PO listesi (server-side sayfalama), PO oluşturma paneli, mal kabul girişi —
  hepsi mevcut ve `admin-resources.ts:279-287` ile menüde/rotada bağlı.
- **PO detayı ayrı rota olarak YOK** — genişleyen satır içinde. Cetvel ayrı ekran şart koşmuyor,
  DataTableKit deseni admin standardında yaygın → **ihlal değil**, yüzey farkı olarak kaydedildi.
- **Tedarikçi yönetimi KISMEN:** yalnız "hızlı tedarikçi ekle" var. Bağımsız tedarikçi listesi /
  düzenleme ekranı yok; **`updateSupplier` servis fonksiyonu ölü — hiçbir yerden çağrılmıyor**
  (doğrulandı: `purchasing.service.ts` dışında tek atıf yok).
- **§8.1 parite korunuyor:** `warehouse` rolünün ne sayfa erişimi (`rbac.ts:6-21`) ne yazma izni
  (`rbac.ts:37-49`) var; satınalma dosyalarında `warehouse` kelimesi hiç geçmiyor. RLS SELECT de
  yalnız `super_admin,admin,moderator`. **UI izni DB iznini aşmıyor.**
- **Statü butonları SSOT'tan üretiliyor** (`PurchasingTableBody.tsx:501-504`), türev statüler eleniyor.
- **i18n tam:** TR/EN sözlükler 88'er satır, aggregator'a birlikte kayıtlı; hardcoded görünür
  metin bulunamadı. Tutarlar PO para birimiyle basılıyor, TRY'ye çevrim yok (cetvele uygun).

---

## 5. BEKÇİ INV-PURCH-1 (D5) — VAR

`src/__tests__/conformance/purchasing-machine-and-evidence.test.ts` — **9 test**, cetvel §10 ile
sayı uyumlu. R1a/R1b/R2a/R2b/R3/R4/R5/R6 + parser sağlığı.

**Kalite notu (zayıflık, adıyla):** R5 (RPC zarfı `success` kontrolü) gerçek bir **substring**
kontrolü — `success` kelimesinin dosyada herhangi bir yerde geçmesi yeterli; dönen değerin
gerçekten kontrol edildiğini kanıtlamıyor. Cetvel bunu "desen taraması" diye zaten işaretlemiş,
yani **bilinçli kabul**. Diğerleri yapısal: R1a migration CHECK listesini ayrıştırıp `toEqual`
ile karşılaştırıyor, R6 `canWrite`'ı gerçekten çağırıyor.

---

## 6. §13 DB SERTLEŞTİRME (M5–M8) — YOK (cetvelle tutarlı)

Cetvel §13 "PLAN, uygulanmadı, Recep dalga onayı bekliyor" diyor. **İki bağımsız kaynakla
doğrulandı ve ifade hâlâ doğru:**

| Madde | Ne | Durum | Kanıt |
|---|---|---|---|
| M5 | kolon düzeyi UPDATE grant kısıtı | **YOK** | migration'da tablo/kolon `revoke` yok; yalnız RPC'ye grant |
| M6 | `enforce_po_status_transition` tetiği | **YOK** | grep sıfır eşleşme **+ canlı DB'de dört tabloda TETİK SAYISI 0** |
| R7 | bekçi: kolon grant taraması | **YOK** | M5 olmadığı için hedefi yok |
| R8 | bekçi: tetik ↔ modül parite | **YOK** | M6 olmadığı için hedefi yok |
| M8 | kalem-bazlı düşüş idempotensi | **YOK** | `20260815224500_stock_restore_evidence_and_reduction_gate.sql:188-200` — idempotens hâlâ `product_id` koşulu olmadan |

**M6'nın somut sonucu:** `purchase_orders.status` DB'de yalnız **değer** CHECK'iyle korunuyor,
**geçiş** korunmuyor. Monotonluk bugün sadece uygulama katmanında. Doğrudan SQL veya RLS'i aşan
bir yol `received → draft` geri sarabilir. Bugün sömürülebilir değil (yazan tek yol servis),
**ama ERP kabuğu ikinci bir yazma yolu açarsa bu boşluk anında canlı bir tehlikeye döner.**

---

## 7. ⭐ ÇELİŞEN-MEVCUT (zorunlu bölüm)

Bugünkü ERP/CRM/teklif kararlarıyla **çelişen veya onları yanlış zemine oturtan** canlı durumlar:

| # | Çelişen mevcut durum | Neden çelişiyor | Geri alma / çözüm |
|---|---|---|---|
| Ç1 | **Satınalma verisi sıfır** | ERP kabuğu (T133) ve CRM (T130) tasarımı "satınalma çalışıyor" varsayarsa, üzerine kurulacak akış (maliyet, tedarik süresi, stok tahmini) **veri bulamaz** | Tasarım belgesi bunu açıkça "boş modül" varsaymalı; ilk gerçek PO bir **kabul testi** olarak planlanmalı |
| Ç2 | **`warehouse` rolünün satınalmaya erişimi yok** (bilinçli, §8.1) | ERP modelinde mal kabulü tipik olarak **depo personelinin** işidir; T133 kabuğu depo rolüne kabul girişi verirse cetvelin §8.1'i ve RLS SELECT listesi ters düşer | Değişecekse **önce RLS**, sonra `rbac.ts`; ikisi ayrı PR olmamalı (sessiz-boş sınıfı) |
| Ç3 | **DB seviyesinde durum geçiş tetiği yok** (M6) | ERP kabuğu ikinci bir yazma yolu (toplu içe aktarma, entegrasyon, servis dışı script) açacaksa uygulama-katmanı monotonluğu **yeterli değil** | M6 migration'ı ERP kabuğundan **ÖNCE** inmeli — Recep dalga onayı gerekiyor |
| Ç4 | **`updateSupplier` ölü kod** | ERP tedarikçi kartı tasarımı bu fonksiyonu "var" sayıp üzerine kurabilir; oysa hiç çağrılmamış, dolayısıyla **hiç çalıştırılmamış** | Ya UI'ya bağlanır ya silinir — ölü kalırsa tasarımda yanlış güven üretir |
| Ç5 | **Fiyat motoru köprüsü kapalı** (§5.4, bilinçli) | ERP "alış maliyeti → satış fiyatı" zincirini otomatik varsayarsa, bugün **böyle bir zincir yok**; `last_purchase_cost` yazılıyor ama hiçbir yere akmıyor | Açılacaksa ayrı karar; kapalı kalacaksa ERP tasarımında **açıkça** yazılmalı |

**Geri alma planı:** Ç1/Ç4/Ç5 doküman düzeltmesiyle kapanır, kod değişikliği gerekmez.
Ç2 ve Ç3 **migration doğurur** → `CLAUDE.md` md.13 gereği PR'ı yalnız Recep merge eder.

---

## 8. ÖLÇÜLEMEYEN / KAPSAM DIŞI

- **Testler koşturulmadı** — bekçi bloklarının varlığı ve içeriği ölçüldü, CI'da yeşil geçtiği
  bu turda ayrıca doğrulanmadı.
- **Davranışsal kanıt yok** (bkz. §1) — sıfır kullanım nedeniyle hiçbir kod yolu gerçek veriyle
  çalışmadı. Bu karne **yapısal** bir karnedir.
- `src/__tests__/conformance/stock-restore-evidence.test.ts` içeriği okunmadı — M8 kuralının
  kısmen orada test edilip edilmediği ölçülmedi.
- `CreatePurchaseOrderPanel`'deki `currency` alanının ISO 4217 doğrulaması yok (cetvelde kural
  yok, bu yüzden madde açılmadı; **v2 adayı** olarak not edildi).
