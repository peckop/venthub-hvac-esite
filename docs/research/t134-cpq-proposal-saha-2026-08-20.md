# T134-VH Rapor 2/2 — Ticari CPQ/Proposal + İnşaat/Saha Satışı (Sonnet ajanı, 2026-08-20)

> Ham ajan raporu; sentez OPS-AUDIT'te. Her iddia kaynak URL'li; "ölçülemedi" işaretleri korunmuştur.

## 1. Proposal/E-imza araçları

### PandaDoc
- Kabul akışı: link e-postayla; alıcı hesabı gerekmez; e-posta doğrulama + alan validasyonu + (yapılandırılmışsa) SMS kodu.
- Kanıt: her aksiyon damga+IP loglu; tamamlanınca PKI sertifika (Entrust): isimler, doğrulanmış e-postalar, IP, konum, belge ref no, damgalar.
- Süre: auto-expiration → "Expired", erişim kapanır. Free/Starter 60 gün sabit; Business/Enterprise 3650 güne kadar ayarlanabilir. UZATMA YOK — taslağa çevir + yeniden gönder.
- Revizyonda eski link: ÖLÇÜLEMEDİ. Müşteri çoklu-teklif portalı: ÖLÇÜLEMEDİ (belge-başına link).

### Proposify
- Kabul: incele + yorum + kabul/imza (+ depozito). İmza yazı veya çizim; "I agree" zorunlu.
- Kanıt: IP + tarih/saat; kimlik = e-posta linki (OTP kanıtı yok — ÖLÇÜLEMEDİ).
- Süre: LAZY EXPIRY — süre dolduğunda müşteri linke ERİŞMEYE ÇALIŞINCA otomatik arşivlenir. Won teklif arşivden çıkarsa linkler yeniden aktive olur.
- Portal: müşteri önizleme yüzeyi var; tek-teklif mi çoklu mu net değil.

### DocuSign
- Kanıt (en detaylı): Certificate of Completion — dijital imzalı, kurcalama-korumalı; isimler, imzalar, IP'ler, konum, chain-of-custody, damgalar.
- Kimlik KADEMELİ (gönderen belge bazında seçer): access code / Phone-SMS OTP / resmi kimlik doğrulama (IDV).

### Qwilr
- Tek akışta seç+kabul+imza+öde. Süre/kimlik/eski-link: ÖLÇÜLEMEDİ.

### Ortak hukuki bulgu
- ESIGN/UETA: checkbox (clickwrap) ile çizilmiş imza EŞDEĞER bağlayıcı — 3 koşul: şartlar önceden net gösterilir, kabul eylemi belirsiz olmaz, kayıt tutulur (Meyer v. Uber 2017 checkbox'ı yeterli buldu).

## 2. Salesforce CPQ / HubSpot
- SF CPQ onay eşiği: mekanizma (rule engine + approval variables + routing) PLATFORM sabiti; eşik değeri ve onaylayan ADMIN CONFIG (örn. %15 üstü indirim → müdür onayı).
- Quote↔Opportunity: bir fırsatta ÇOK quote, yalnız biri PRIMARY (fırsat tutarını o besler; para birimi eşleşme şartı).
- Kabul sonrası otomasyon: "Ordered"/"Contracted" checkbox'ları (admin açar); Order yalnız Primary + admin'in seçtiği status'ten (örn. Approved) üretilir.
- HubSpot: onay switch + workflow tetikleri (tutar/indirim/vade); Primary eşdeğeri terim ÖLÇÜLEMEDİ.

## 3. İnşaat/saha — bid management + deal registration
- Procore: proje sahibi bidder davet eder; "proje = tek ihale sahibi, çoklu bidder" modeli baskın.
- ⭐ "Tek proje, çoklu talep eden taraf" (işveren+yüklenici+kiracı ayrı teklif ister) senaryosu: ENDÜSTRİ STANDARDI BULUNAMADI — VentHub kendi cetvelini yazacak (boşluk).
- Deal registration: amaç marj koruması/yıkıcı iç rekabeti önleme. Çakışma: varsayılan İLK-KAYIT-ÖNCELİĞİ (otonom) + istisnada İNSAN HAKEMLİĞİ (spekülatif kayıt vs gerçek ilişki; co-registration nadir; kanıt yetersizse ikisi de ret). Kayıt süresi tipik 90-180 gün + yenileme.
- Fiyat tutarlılığı: kayıtlı deal'e fiyat koruması + exclusivity window (Red Hat: competing quote protection). "Aynı projede farklı taraflara farklı fiyat uyarısı" pratiği: ÖLÇÜLEMEDİ (alıcı tarafında scope-checklist disiplini var, satıcı sistemi pratiği yok).

## SONUÇ — OTONOM / CONFIG / KULLANICI tablosu
| Karar | Konum | Not |
|---|---|---|
| Süre dolunca davranış | CONFIG (değer) + OTONOM (davranış: link kapanır) | PandaDoc sabit davranış; Proposify LAZY expiry (erişim tetikler) |
| Kabul kimlik seviyesi | CONFIG (gönderen belge-bazında seçer) | DocuSign 3 kademe; varsayılan = e-posta-linki (zayıf) |
| Onay eşiği | Mekanizma OTONOM, değer CONFIG | Hiçbir üründe insan-tanımsız eşik yok |
| Çakışan kayıt tepkisi | Varsayılan OTONOM (ilk-kayıt) + istisna İNSAN | SF'te analog = Primary seçimi (kullanıcı) |
| Revizyonda eski link | ÖLÇÜLEMEDİ | Proposify ipucu: linkler kalıcı kimlik olabilir (doğrulanmadı) |
| Kabul→otomatik sipariş | CONFIG (checkbox + tetik status admin'de) | İnsan onay adımı araya konabilir |

**Genel gözlem:** Hiçbir üründe tamamen otonom kritik karar yok — her dallanma ya admin-kurulu kural ya canlı insan hakemi. En otonom mekanizma ilk-kayıt-önceliği, o bile istisnada insana düşer. Çoklu-taraf-tek-proje senaryosu sektörde çözülmemiş → VentHub'ın özgün cetvel alanı.
