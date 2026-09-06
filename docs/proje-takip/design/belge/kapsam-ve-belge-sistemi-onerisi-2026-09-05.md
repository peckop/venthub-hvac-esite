
# Kapsam boşlukları ve belge sisteminin hâli — DESIGN-BELGE görüşü

Tarih: 2026-09-05 · Yazan: DESIGN-BELGE (Opus) · Durum: **görüş, karar değil.** OPS eler, Recep karar verir.
Ölçüm kaynağı: peckop/venthub-hvac-esite @ master (şema + migration'lar, 2026-09-05 okuması) · `docs/standards/quote-standard.md` · `purchasing-standard` atıfları · marka kılavuzu · karar kopyaları.

---

## BÖLÜM 1 — Kapsam: kurumsal bir şirketin belge seti neresi eksik

### 1.1 Önce bir cetvel bayatlığı: K3'ün tablo listesi bugünkü şemanın gerisinde

K3 sabit bir liste veriyor: venthub_quotes · venthub_quote_items · project_items · venthub_orders · venthub_order_items · order_invoices · user_invoice_profiles. Brief'in kuralı da net: "adı listede olmayan tablo aranmaz."

Ölçüm: depoda **satınalma modülü canlı** ve listede yok.

| Tablo | Kaynak | Ne tutuyor |
|---|---|---|
| `suppliers` | `20260816143015_purchasing_t062_core.sql` | tedarikçi kartı: name · tax_no · contact_name · email · phone · currency · is_active |
| `purchase_orders` | aynı | PO başlığı: supplier_id · status (draft→ordered→partially_received→received→closed/cancelled) · currency · expected_at · note · close_note |
| `purchase_order_items` | aynı | PO satırı: product_id · qty_ordered · qty_received · unit_cost · currency · tax_rate |
| `goods_receipts` | aynı | mal kabul başlığı: po_id · **document_no** (gelen irsaliye no) · received_by · received_at · note |
| `data_subject_requests` | `20260816120000_kvkk_data_subject_requests.sql` | KVKK veri sahibi başvuruları |
| `venthub_returns` | `202508271900_venthub_returns.sql` | iade: status · reason · refund_amount · requested_at · approved_at · processed_at |

Dördü de RLS'li, `process_goods_receipt` RPC'si stok girişinin tek yazma yolu, mal kabul başlığında UPDATE/DELETE politikası bilerek yok (kanıt belgesi). Yani **iş akışı hazır, belgesi yok.**

Bu tam olarak quote-standard'ın Ç10 sınıfı: cetvel gerçeğin gerisinde kaldı. K3 listesi ya güncellenmeli ya da "liste teklif–sipariş hattı içindir, satınalma ayrı kapsam" diye sınırı yazmalı. Ben listeye uydum ve satınalmaya bakmadım; bakınca modülü buldum.

### 1.2 Eksik belge aileleri

Sıra, "kurumsal bir şirket bunu bir gün mutlaka basar" ağırlığına göre.

**A · Yasal zorunlu, bugün hiç yok**

| Belge | Niçin zorunlu | Şema |
|---|---|---|
| **Sevk irsaliyesi (e-İrsaliye)** | Türkiye'de mal hareketi irsaliyesiz yapılamaz. Kargo Bildirimi v1'de bunu kendim işaretledim: "sevk irsaliyesi değildir." | Karşı yön var (`goods_receipts.document_no` = GELEN irsaliye); bizim kestiğimiz irsaliyenin kolonu YOK |
| **Garanti belgesi** | Distribütör için zorunlu; içeriği mevzuatla sabit (ürün · marka · model · seri no · garanti süresi · satıcı künyesi · fatura tarih/no · yetkili servis) | KOLON YOK — garanti süresi `products.technical_specs` içinde olabilir, ölçmedim |
| **Ön bilgilendirme formu + mesafeli satış sözleşmesi** | Satış kipi açılışının kontrol listesinde "yasal metinler" olarak yazılı; belge olarak Design'a hiç gelmedi | `venthub_orders.legal_consents` (jsonb) onay KAYDINI tutuyor, metni tutmuyor |
| **KVKK aydınlatma metni · açık rıza · veri sahibi başvuru formu** | REC-43 açık | `data_subject_requests` var |

Not: sözleşme ve KVKK metinlerinin **dizgisi** benim işim, **metni** değil. Hukuk metnini ben yazmam; gelirse belge diline giydiririm.

**B · Satınalma hattı (şema hazır, belge sıfır)**

- Tedarikçiye **teklif isteme (RFQ)** — biz de teklif isteyen taraftayız
- **Satınalma siparişi (PO)** — Vortice, Nicotra Gebhardt, SEAT, AVenS, Danfoss'a giden belge. Dikkat: bu belgelerin çoğu **İngilizce** olmak zorunda; K5 "İngilizce ayrı tur, şimdi çizilmez" diyor ama satınalma İngilizceyi zorunlu kılıyor. Çelişki, kararı OPS versin.
- **Mal kabul formu** — `goods_receipts` + `inventory_movements` kanıt satırı; depo elinde kâğıt olarak dolaşır (sayım, imza, uygunsuzluk notu)
- **Tedarikçiye uygunsuzluk / iade bildirimi** — KOLON YOK

**C · Satış sonrası (kurulum + bakım hibrit modeli var, belgesi yok)**

- **İade formu + iade onayı** — `venthub_returns` dolu, REC-57 lansman engeli
- **Devreye alma (commissioning) raporu** — HVAC'ta ölçüm belgesi: debi · statik basınç · akım · devir · ses. Bu belge şirketi rakiplerinden ayırır ve şu an hiçbir yerde yok.
- **Bakım / periyodik servis formu**
- **Arıza kayıt + teknik servis raporu** — K19'da "Arıza ve garanti" iletişim satırı satış kipiyle açılıyor; belge karşılığı yok

**D · Ticari / muhasebe**

- **Cari hesap ekstresi + mutabakat mektubu (BA-BS)** — B2B'de her ay lazım, KOLON YOK
- **Tahsilat makbuzu / ödeme talimatı** — `payment_transactions` var
- **Bayi/distribütör sözleşmesi + bayi fiyat listesi** — bayi hattı PARK (Recep 08-20), belge de park

**E · Yüksek hacimli, veri hazır, en kârlı iş**

- **Ürün teknik föyü (PDF)** — 375 ürün · 40 aile · 867 izole fotoğraf · `technical_specs` jsonb dolu. 15A K7: "Belge düğmeleri (PDF, DXF) yalnız dosya bağlıysa görünür" — yani PDF'lerin kendisi üretilmeli. **Bir şablon çizilir, 375 belge basılır.** Belge tarafında en yüksek getirili tek iş bu.
- **Teklif eki teknik föy paketi** — teklifin arkasına eklenen föyler; "Ek 1 / Ek 2" sayfalandırması

**F · Kimlik uygulamaları (brief'in 3–5. maddeleri, zaten sırada)**
E-posta şablonları · antetli kâğıt · e-posta imzası · kartvizit · sunum şablonu · sosyal kalıp.

**G · Kapsam dışı olduğunu düşündüğüm** — İK ve iç işleyiş formları (personel, zimmet, izin, masraf). Recep isterse açılır; ticari belge hattının parçası değil.

---

## BÖLÜM 2 — Çizdiğim altı belge yeterli mi? (kendi işimin eleştirisi)

Kısa cevap: **belge olarak doğru, sistem olarak değil.** Altı belge var, belge SİSTEMİ yok.

### 2.1 En büyük kusur: altı belge, altı kopya

Kabuk (başlık bloğu, logo, künye, footer, tablo stili, mono etiket dili) altı dosyada **tekrarlandı**. 15A'nın K8'i "sayfa başına özel görünüm değil, az sayıda şablon + veri" diyor; ben belge tarafında tam tersini yaptım.

**Ölçülmüş bedel:** Türkçe büyük harf kusuru (`lang="tr"` eksikliği, "SATIŞ KIPI" → "KİPİ") tek bir etiket düzeltmesiydi ve **altı dosyaya dokunmayı** gerektirdi. Yedinci belgede yedi, on beşincide on beş olur.

**Öneri:** `Belge Kabugu.dc.html` — tek şablon (kimlik bloğu · künye · footer · tablo stili · etiket dili · "kapalı bekler" şeridi), belgeler onu `dc-import` ile alır, gövde belgeye özel kalır. Bunu **yedinci belgeden önce** yapmak en ucuz an.

### 2.2 SaaS uygunluğu: kimlik sabit, kiracı değil

`tenants` tablosunda `styles` · `theme_config` · `config` kolonları var; REC-88 SaaS Faz 2 PARK. Benim belgelerimde logo CSS dilimi ve lacivert **sabit kodlu**. SaaS açıldığı gün her kiracı kendi antetiyle basmak zorunda ve altı belge birden elden geçer.

**Öneri:** kimlik yuvası şablonun props'u olsun — logo · unvan · künye satırı · vurgu rengi · yazı ailesi. VentHub varsayılan değer olur, kiracı `tenants.styles`'tan gelir. PARK'taki işi bugün kırmadan hazırlar.

### 2.3 Tablo ve sayfa düzeni: SaaS'ta ilk kırılacak yerler

| # | Eksik | Niçin önemli | Kaynak |
|---|---|---|---|
| 1 | **Sayfa no yok** ("Sayfa 1 / 3") | 40 kalemlik teklifte belge kaç sayfa belli değil; eksik sayfa fark edilmez. Kurumsal belgede standart. | Tasarım eksiği, şema değil |
| 2 | **Nakli yekûn / devir satırı yok** | Tablo sayfa değiştirince ara toplam taşınmıyor | Tasarım eksiği |
| 3 | **Birim sütunu yok** (adet · takım · m · set) | HVAC'ta "3 takım" ≠ "3 adet"; teklifte belirsizlik ticari risk | **KOLON YOK** — ne `venthub_quote_items`'ta ne `products`'ta birim alanı var |
| 4 | **Kalem bazlı termin yok** | Her kalemin teslim süresi farklı; tek "Teslim" satırı gerçeği söylemiyor | **KOLON YOK** |
| 5 | **Teknik özet satırı yok** | `technical_specs` dolu; debi/basınç/güç kalem altında görünmeli. Markanın ayırt edici iddiası "konuşan teknik tablo" (15A K6) ve teklif belgesi onu hiç taşımıyor. | Veri VAR, belge kullanmıyor |
| 6 | **Ürün görseli yok** | 867 izole fotoğraf var; 20–24 mm küçük görsel kalem tanımayı çok kolaylaştırır. Mürekkep maliyeti gerçek itiraz → tweak olarak sunulur, varsayılan kapalı. | Veri VAR |
| 7 | **40 kalemlik hâl denenmedi** | Ben 5 satırla çizdim. Stres provası gerekiyor: 40 kalem · 3 grup · uzun ürün adları · iki KDV oranı · sayfa taşması. | Test eksiği |
| 8 | **Uzun İngilizce etiket sütunu taşırır** | Sabit px genişlikler ("Kod 96px", "Birim 80px") EN turunda kırılır | K5 ile birlikte gelir |
| 9 | **Kur satırı yok** | `tcmb-rates-sync` edge fonksiyonu ve `pricing_w5_policy_fx_lock` migration'ı VAR; fiyat motoru EUR maliyetten TL üretiyor (K6/E6). EUR'lu bir belgede "1 EUR = X TL · TCMB · tarih" satırı yoksa tutar tartışmalı hâle gelir. | Veri VAR, belge kullanmıyor |
| 10 | **Kabul yolu belgede yok** | quote-standard §8 müşteri portalı, §12 PDF + iletim diyor. Teklif PDF'inde portala giden kare kod / kısa bağlantı yok — müşteri kabul etmek için e-postayı bulmak zorunda. E-faturada kare kod alanı var, teklifte yok. | Tasarım eksiği |
| 11 | **Revizyon farkı görünmüyor** | `amended_from` · `revision_no` · `superseded_by` şemada; rev 2 belgesinde "neyin değiştiği" bloğu yok. Müşteri iki PDF'i yan yana koyup arıyor. | Veri VAR |
| 12 | **Tek renk / fotokopi provası yapılmadı** | Marka kılavuzunda tek renk kuralları var; turkuaz grup etiketi ve seçim kaynağı satırı gri tonda okunur mu ölçülmedi. Faksla dolaşan teklif gerçek. | Ölçüm eksiği |
| 13 | **Numaralandırma cetveli yok** | Belge no biçimleri "örnek" olarak duruyor (K6). Kurumsal şirkette tek cetvel lazım: seri önekleri · sıfır dolgusu · yıl devri · iptal edilen numara · tenant kapsamı (`quote_no` zaten tenant kapsamında UNIQUE). | Karar eksiği, çizim değil |

### 2.4 Korunması gereken bir yetenek: `alanAdlari` kipi

Her belgede kolon adlarını gösteren tweak var. Bu aslında bir yan ürün değil, **geliştirici teslim belgesi**: şablon ↔ kolon eşlemesinin tek doğruluk kaynağı. Yeni kiracı veya yeni belge eklenirken "bu hücre nereden geliyor" sorusu tek tıkla cevaplanıyor.

**Öneri:** kalıcı yetenek sayılsın, her yeni belgede zorunlu olsun ve envanter tablosunun yerine geçmesin (envanter kâğıt üzerinde kalsın, kip canlı ayna olsun).

---

## BÖLÜM 3 — Önerdiğim sıra

1. **Belge kabuğunu tek şablona indir + kimlik yuvası aç.** Yedinci belgeden önce yapılırsa en ucuz; sonra her belge onun üzerine biner. SaaS hazırlığı da bedavaya gelir.
2. **Satış kipi setinin gerçek eksikleri:** sevk irsaliyesi (yasal) · iade formu + iade onayı (REC-57 lansman engeli) · garanti belgesi (yasal).
3. **Satınalma seti:** PO + mal kabul formu + tedarikçiye RFQ. Şema hazır, iş akışı canlı, belge sıfır. İngilizce kararı burada gerekiyor.
4. **Ürün teknik föyü şablonu.** Bir şablon, 375 belge; veri hazır.
5. **E-posta şablonları** (zaten sırada) → antetli kâğıt · imza · kartvizit.
6. **Devreye alma / servis raporları** — şema yok; önce Recep'in bakım-kurulum işini nasıl kurguladığı bilinmeli.

## Karar bekleyen üç soru

1. **K3 tablo listesi** güncellenecek mi (satınalma + iade + KVKK tabloları eklenecek mi), yoksa liste "teklif–sipariş hattı" olarak sınırlanıp satınalma ayrı kapsam mı sayılacak?
2. **Satınalma belgeleri İngilizce** olmak zorunda (yabancı tedarikçi). K5 "İngilizce ayrı tur" diyor — satınalma bu kuralın istisnası mı, yoksa İngilizce turu satınalmayla birlikte mi açılacak?
3. **Belge kabuğu tek şablona insin mi?** Bunun bir bedeli var: bir dosyayı çoğaltıp serbestçe deneme kolaylığı azalır. Ben ölçülen bakım maliyeti yüzünden "insin" diyorum, ama karar OPS'un.

— DESIGN-BELGE (Opus) 2026-09-05

