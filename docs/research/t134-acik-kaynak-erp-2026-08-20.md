# T134-VH Rapor 1/2 — Açık-Kaynak ERP'lerde Teklif/Proje Modeli (Sonnet ajanı, 2026-08-20)

> Ham ajan raporu; kod düzeyinde doğrulanmış bulgular. "Ölçülemedi" işaretleri korunmuştur.

## Odoo (addons/sale, sale_crm, crm)
- Durumlar (sale.order.state): draft/sent/sale/cancel — 4 durum; confirm AYNI kaydı yazar (yeni belge yok).
- Geçerlilik: validity_date = şirket ayarı (quotation_validity_days); is_expired YALNIZ GÖRSEL BAYRAK — state değişmez, expiry cron'u YOK (ir_cron.xml bizzat okundu, doğrulandı).
- Revizyon: yerleşik sürüm YOK — manuel Duplicate; _compute_duplicated_order_ids yalnız tespit eder, engellemez.
- Fırsat↔teklif: crm.lead.order_ids One2many — SINIRSIZ teklif, hiçbir kısıt/uyarı yok (kod doğrulandı).
- Onay eşiği: sale çekirdeğinde YOK; jenerik "Approvals" app'e devredilmiş olabilir (ölçülemedi).
- Proje: crm.lead'de project_id YOK; bağ sale.order→project_id (sale_project) seviyesinde.

## ERPNext (Quotation/Opportunity/Sales Order/Authorization Rule)
- Durumlar (8): Draft/Open/Replied/Partially Ordered/Ordered/Lost/Cancelled/Expired.
- ⭐Expiry OTOMATİK: set_expired_status GÜNLÜK CRON (hooks.py daily_maintenance, doğrulandı) — SO üretilmemişse Expired'a çeker. Üç sistemde tek gerçek otomatik expiry.
- Revizyon: Frappe çekirdek AMEND deseni — submit→cancel→amend = YENİ belge + amended_from zinciri (platform-genel kural).
- Fırsat↔teklif: Quotation.opportunity tekil Link; Opportunity tarafında liste alanı yok — bire-çok, KISITSIZ.
- Party: Dynamic Link (Customer VEYA Lead) — quotation_to/opportunity_from.
- Proje: Opportunity/Quotation'da YOK; Sales Order.project'te VAR.
- ⭐Onay eşiği: Authorization Rule doctype — transaction + based_on (Grand Total/discount) + value + approving_role: TAM CONFIG, kodda sabit eşik yok.
- Çakışan teklif: sistem hiçbir şey yapmıyor.

## Dolibarr (comm/propal, onlineSign)
- Durumlar: CANCELED/DRAFT/VALIDATED/SIGNED/NOTSIGNED/BILLED — Signed/NotSigned MÜŞTERİ KARARINI açıkça modelliyor (diğerlerinde yok).
- ⭐Online imza + kanıt (en somut delil zinciri): onlineSign.php — base64 PNG imza dosyaya, propal tablosuna date_signature + online_sign_ip + online_sign_name + fk_user_signature. Public URL deseni var. Bilinen kusur: imza sonrası bildirim e-postası bazı sürümlerde gitmiyor (#20204/#20432).
- Expiry: cron YOK — yıllardır açık feature request (#5995); manuel kapatma zorunlu.
- Revizyon: createFromClone — yeni bağımsız belge; eskiyle zincir kurmaz, PROJE BAĞINI SIFIRLAR.
- ⭐Proje TEK-MUHATAP kilidi: fk_projet tekil; GitHub #13524 "Multiple Thirdparty under a single project… needed by most companies" — bir projeye farklı muhataplara çoklu teklif YERLEŞİK DESTEKLENMİYOR (bilinen açık kısıt; 3. parti modülle aşılıyor).
- Onay eşiği: bulunamadı (ölçülemedi).

## Metasfresh / Axelor (kısa)
- Metasfresh: teklif = AYNI C_Order tablosu + DocType alanı (ayrı model değil) — iDempiere soyu; DocStatus enum çıkarım, doğrulanmadı (kısmen ölçülemedi).
- Axelor: Opportunity→tek tık Quotation; revizyon = AYNI teklif altında PDF sürümleri ("New version" düğmesi) — belge-merkezli sürüm modeli (dok. düzeyi, kod doğrulanmadı).

## OTONOM/CONFIG karşılaştırma özeti
| Davranış | Odoo | ERPNext | Dolibarr |
|---|---|---|---|
| Süre değeri | CONFIG (şirket) | config (ölçülemedi) | config alanı |
| Süre dolunca | HİÇ (bayrak) | ⭐OTONOM cron | HİÇ (açık FR) |
| Revizyon | manuel duplicate | ⭐amend zinciri (platform kuralı) | clone (proje bağı sıfırlanır) |
| Onay eşiği | ölçülemedi | ⭐TAM CONFIG (Authorization Rule) | ölçülemedi |
| Fırsata çoklu teklif | SERBEST kısıtsız | SERBEST kısıtsız | proje tek-muhatap KİLİT |
| Online kabul kanıtı | yok/ölçülemedi | yok | ⭐IP+damga+imza-görseli |
| Çakışma tepkisi | yok | yok | yapısal imkânsız |

**Sinyal:** Hiçbiri çakışan/rakip teklifi engellemiyor ya da uyarmıyor; çoklu-taraf-tek-proje Dolibarr'da bilinen karşılanmamış talep (#13524) → VentHub'ın özgün cetvel alanı.
