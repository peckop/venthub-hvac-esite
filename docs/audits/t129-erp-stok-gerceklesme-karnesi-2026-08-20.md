# T129-VH — ERP/Stok Gerçekleşme Karnesi (2026-08-20)

> **Ölçen:** EDGE (`4397deef`) · **Yöntem:** canlı prod DB + master kaynak kodu.
> Her satır kanıtlıdır; kanıtlayamadığım her şey **"ölçemedim"** diye adıyla yazılıdır (K11).

## 0. KAYNAK / CETVEL

| Cetvel | Kapsadığı | Tazelik |
|---|---|---|
| `docs/standards/purchasing-standard.md` | PO durum makinesi, mal kabul, maliyet ilkeleri, `warehouse` v1 kararı | **GÜNCEL** — §8.1 "warehouse v1'de YOK" ölçümle doğrulandı |
| `docs/audits/operasyon-dongusu-denetimi-2026-08-15.md` §2 | Satışta stok düşmemesi (T052) | ⛔ **BAYAT** — aşağıda madde madde çürütüldü |
| `docs/standards/admin-capabilities.md` §4.5 | Enterprise admin yetenekleri (N1-N4, E1-E10) | **GÜNCEL ama KAPSAMSIZ** — §4.5'te **tek bir stok/ERP yeteneği yok** |

⚠️ **CETVEL BOŞLUĞU, adıyla:** ERP/stok yeteneklerinin çoğunu yöneten bir cetvel **yok**.
`purchasing-standard` yalnız satınalma hattını kapsıyor; depo/lot/sayım tarafı için
**"cetvel yok — yazımı işin kapsamında"** (bkz. §4).

---

## 1. Tek cümlelik cevap

**Mekanizma büyük ölçüde DOĞRU, gerçekleşme SIFIR.** Stok motoru (RPC'ler, hareket defteri,
idempotens, mal kabul) kurulu ve T052 kusuru onarılmış; ama **hiç çalışmamış** — `inventory_movements`
**0 satır**, `purchase_orders` **0 satır**. Bu bir gerileme değil, **hiç-yapılmamış iş** sınıfı
(krş. T095 yetim pending, T105 teklif modülü).

---

## 2. Yetenek karnesi

| # | Yetenek | Karne | Kanıt (ölçüm) |
|---|---|---|---|
| S1 | Satışta stok düşümü | **VAR (kullanılmamış)** | `process_order_stock_reduction` kapısı `status in ('confirmed','processing') AND payment_status='paid'` + `FOR UPDATE` satır kilidi + `order_sale` hareketiyle idempotens. **T052 ONARILMIŞ.** |
| S2 | Hareket defteri (`inventory_movements`) | **VAR (boş)** | Tablo 15 kolon, **0 satır** |
| S3 | İptal/iadede geri ekleme | **VAR** | `process_order_stock_restore(p_order_id, p_reason)` |
| S4 | Elle stok düzeltme | **VAR** | `adjust_stock` (3 ve 4 argümanlı), `set_stock` (3 ve 4 argümanlı) |
| S5 | Toplu hareketi geri alma | **VAR** | `reverse_inventory_batch` (1 ve 2 argümanlı) |
| S6 | Mal kabul → stok girişi | **VAR (kullanılmamış)** | `process_goods_receipt(p_po_id, p_document_no, p_lines, p_note)`; `purchase_orders` **0 satır** |
| S7 | Düşük stok eşiği | **VAR** | `inventory_settings` 1 satır, `update_inventory_thresholds` |
| S8 | Düşük stok **bildirimi** | **KISMEN** | `stock-alert` edge fonksiyonu var ama **zamanlanmış çağıranı YOK** — `cron.job`'da tek iş: `tcmb-rates-sync-daily`. Yetenek var, tetikleyen yok. |
| S9 | Envanter ekranları | **VAR** | `AdminInventoryPage` · `AdminInventoryReportPage` · `AdminInventorySettingsPage` · `InventoryTableBody` |
| S10 | Stok rezervasyonu | **YOK** | `stock_reservations` tablosu **hiç yok** (`to_regclass` → null) |
| S11 | Çoklu depo | **YOK** | Depo tablosu yok; koddaki `warehouse` = **rol adı** + `products.warehouse_location` **serbest metin** |
| S12 | Lot / seri takibi | **YOK** | `lot_no`, `serial_no` → kodda **0 dosya** |
| S13 | Sayım / cycle count | **YOK** | `stocktake`, `cycle_count` → **0 dosya**; tablo yok |

**Özet:** VAR 8 · KISMEN 1 · YOK 4. Ama **VAR'ların hiçbiri üretimde bir kez bile çalışmamış.**

---

## 3. Bayat cetvel maddeleri — `operasyon-dongusu §2` ÇÜRÜTÜLDÜ

| §2'nin iddiası | Bugünkü ölçüm |
|---|---|
| "RPC kapısı `('paid','processing')`, callback `confirmed` yazıyor → hiç düşmüyor" | ⛔ **ÇÜRÜK** — kapı artık `('confirmed','processing') AND payment_status='paid'` |
| "İdempotens yok" | ⛔ **ÇÜRÜK** — `order_sale` hareketi varsa tekrar düşmüyor |
| "`stock_reservations` tablosuna yazan kod yok" | ⚠️ **EKSİK İFADE** — yazan kod değil, **tablonun kendisi yok** |

> §2 bugün **yanlış yönlendirir**. Cetvel dosyasına "T129 ile çürütüldü" notu düşülmeli;
> bu karne o notun kaynağıdır.

---

## 4. CETVEL YOK — yazımı işin kapsamında

Aşağıdakiler hiçbir cetvelde geçmiyor; tasarlanmadan önce cetvel yazılmalı:

- **Çoklu depo modeli** (depo varlığı, depo-bazlı stok, transfer)
- **Lot / seri numarası** izlenebilirliği
- **Sayım (stocktake / cycle count)** ve fark mutabakatı
- **Rezervasyon** semantiği (sepet/sipariş rezerve eder mi, ne kadar tutar)

---

## 5. ⭐ ÇELİŞEN-MEVCUT — bugünkü kararlarla çelişen canlı durum

### Ç1 — `warehouse` ROLÜ var, depo MODELİ yok
`user_profiles.role` whitelist'inde `warehouse` var ve `BulkRolePanel` bu rolü **atanabilir**
olarak sunuyor; `set_stock`/`adjust_stock` gövdeleri bu role **stok yazma yetkisi** veriyor.
Ama depo diye bir varlık yok — rol, olmayan bir kapsamı yönetiyor.
`purchasing-standard §8.1` zaten "warehouse v1'de YOK" diyor → **UI, cetvelin dışına çıkıyor.**
**Geri alma:** rolü whitelist'te bırak, `BulkRolePanel` seçeneğinden çıkar (migration'sız, UI-only).

### Ç2 — `products.warehouse_location` serbest metin
Tek-depo semantiğini veriye gömüyor (QR etiketi de bunu basıyor: `InventoryQrLabel`).
Çoklu depo modeli gelince bu alan **çelişir**. **Geri alma:** migration'lı; alan korunur,
"eski tek-depo konumu" olarak yeni modele taşınır. **Recep kapısı.**

### Ç3 — `set_stock` RPC'sinin çağıranı YOK
DB'de tanımlı, `authenticated`'a EXECUTE verilmiş, ama kodda tek geçtiği yer
`src/types/database.types.ts` (üretilmiş tip). **Yetenek var, çağıran yok** — T095'in aynı sınıfı,
bu karnede **dördüncü örnek**. **Geri alma:** ya bir yüzeye bağla ya da REVOKE + drop.

### Ç4 — Yetki kaynağı `user_profiles.role`, `app_metadata` DEĞİL
`set_stock`/`adjust_stock` gövdeleri rolü **tablodan** okuyor. Ev kuralı yetki kararlarının
`app_metadata`'dan türetilmesini söylüyor. İki kaynak ayrışırsa DB bir şey, arayüz başka şey der.
**Geri alma:** gövdeleri `app_metadata`'ya çevir (migration'lı, **Recep kapısı**).

---

## 6. ⚠️ LATENT AÇIK — rol yükseltme, INSERT yolu

Üç katman ölçüldü, **yalnız üçüncüsü kapatıyor**:

1. **Kolon grant'ı AÇIK** — `authenticated` **ve `anon`**, `user_profiles.role` üzerinde `UPDATE` yetkisine sahip.
2. **RLS AÇIK** — `user_profiles_update_policy` kendi satırını güncellemeye izin veriyor (`id = auth.uid()`), **kolon kısıtı yok**.
3. **TETİK KAPATIYOR** — `trg_enforce_role_change`: kendi rolünü değiştirene `super_admin` değilse `not authorized`.

⚠️ **Ama tetik yalnız `BEFORE UPDATE`.** `user_profiles_insert_policy` kendi satırını **herhangi bir
rolle** INSERT etmeye izin veriyor ve **INSERT tetikle kapsanmıyor**.

**Sömürü ön koşulu:** profil satırı **olmayan** bir auth kullanıcısı.
**Bugünkü ölçüm:** `auth.users` = 2, `user_profiles` = 2, **profilsiz kullanıcı = 0**
→ **açık LATENT, bugün sömürülemez.** Profil oluşturma bir gün kayıt akışından ayrılırsa **canlanır**.

**Önerilen kapatma (tek satır, davranış-nötr):** tetiği `BEFORE INSERT OR UPDATE` yap.
Migration'lı → **Recep kapısı**. Kalıcı çözüm Ç4 ile aynı: yetkiyi `app_metadata`'ya taşı.

---

## 7. Ölçemediklerim (K11)

- **Edge fonksiyonlarının gizli değişkenleri** — okuyan aracım yok.
- **`stock-alert`'in geçmişte elle çağrılıp çağrılmadığı** — edge log penceresi 24 saat, olay eski.
- **UI'ın hangi RPC'yi hangi ekranda çağırdığı** — dosya sayısı ölçüldü, **çağrı yolu izlenmedi**;
  S4/S5 "VAR" satırları DB tarafını kanıtlar, **ekran davranışını değil**.

---

## 8. Ölçüm aracımın körlüğü (kendi hatam, kayda geçiyor)

Rol kapısını ararken anahtar kelime listeme `user_role` yazmıştım; gövdedeki gerçek desen
`up.role` idi. Aracım **"ROL KAPISI İZİ YOK"** dedi — kapı **vardı**. Gövdeyi okumasaydım
`set_stock`/`adjust_stock` için **yanlış bir CRITICAL** yazacaktım.

**Ders:** bir tarayıcı "bulamadı" dediğinde, önce **tarayıcının kendisi** sınanır.
Aynı sınıf bu depoda daha önce iki bekçiyi kör etmişti.
