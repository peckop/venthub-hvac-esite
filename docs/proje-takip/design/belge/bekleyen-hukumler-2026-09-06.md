
# Bekleyen hükümler — DESIGN-BELGE · 2026-09-06

Tek sayfalık bekleme kaydı; her turda güncellenir, yenisi açılmaz. Numaralar REC-153 ile aynıdır.

| No | Ne bekliyorum | Kimden | Durum |
|---|---|---|---|
| 153-7 | **Numaralandırma cetveli** — OPS taslak hükmü verdi (`<ÖNEK>-YYYYMMDD-NNNN`, TK · VH · PF · IA, kargo numarasız, e-fatura GİB'den). Örnekler altı belgeye uygulandı. Recep itiraz etmezse kalıcı olur. | Recep | **taslak hüküm** |
| 153-9 | **Baskı provası** — PDF dosya olarak projede yok, kaydetme adımı kullanıcı eylemi. Kâğıtta görülecek: grup ara başlığının sayfa sonunda yalnız kalıp kalmadığı (`break-after:avoid`, Chrome tablo satırında kısmen destekliyor). Artık üç yasal belge de sayfa sınırı geçiyor (2,6 · 2,7 · 1,2 sayfa) → aynı provada bölüm başlıkları da görülür. | Recep (tek yazdırma) | **açık** |
| 153-12 | Föyde `sku` | — | **KAPANDI: çıkarıldı** |
| 153-13 | **Föy ↔ vitrin biçimlendirici paritesi.** REC-158 yeniden tanımlandı: föy zaten `technical_specs`'ten basıyor; asıl boşluk vitrinle aynı biçimlendiriciyi kullanmaması (vitrin "45 dB(A)", föy "45"). Kapı INV-FOY-PARITE-1. Damga notu (`productHelpers.ts` @ 848aac66) geçerli. | kod tarafı | **devredildi** |
| 153-14 | Gerçek `technical_specs` değerleri | — | **KAPANDI: dosya geldi, föy doldu** |
| 153-20 | **PO / GRN numarası** — kod kaydı **REC-160 Faz 1** açıldı: `purchase_orders.po_no` + `goods_receipts.grn_no`, K19 kalıbı, önek **PO · GR**, üretim REC-156 günlük sayacıyla. **Bende bekleyen iş:** migration inince `alanAdlari` kipindeki "şemada YOK" işaretlerini kaldırmak (PO ve GRN belgelerinde). | kod tarafı → sonra ben | **açık · kod** |
| 153-28 | **Keşif raporunun şemada olmayan yedi alanı** — müşteri/adres/yetkili/telefon · keşfi yapan personel · mahal alanı ve tavan yüksekliği · kroki · rapor düzeyinde bulgu notu · müşteri onayı · rapor no. `wizard_selections` yalnız KAPI ölçüsünü ve koşulları tutuyor. `site_surveys` gibi kayıt tablosu mu, "kâğıtta kalır" mı? | OPS · kod | **açık · yeni** |
| 153-29 | **Keşif raporunun sıradaki yeri** — kartvizitten önce mi, sonra mı, "servis raporları" kümesiyle birlikte mi? Rapor istendiği için çizildi, sıra bozulmadı. | OPS | **açık · yeni** |
| 153-30 | **Rapor kabuğu açılsın mı** — rapor ailesi (keşif · devreye alma · servis · arıza) için ayrı kabuk mu, her rapor kendi dosyasında mı? Görüşüm: iki rapordan sonra. | OPS | **açık · yeni** |
| 153-27 | **KVKK formunda şemada olmayan beş alan** — başvuranın talep metni (konu) · ad soyad · kimlik no/adres · telefon · başvuru numarası. `data_subject_requests` yalnız `applicant_email` tutuyor; başvurunun KONUSUNU tutan kolon yok (`outcome` yanıtın özeti, `retained_data_note` kısmi ret bildirimi). Kâğıt bunları taşıyor, sistem taşımıyor. Kod işi mi (REC-159 deseninde migration) yoksa "kâğıtta kalır" kararı mı? | OPS · kod | **açık · yeni** |
| 153-23 | **Sevk irsaliyesi + garanti belgesi** — aynadaki 4. adımın (`kararlar-kurumsal-belgeler-2026-09-06.md`) tanımı üç belge: sevk irsaliyesi · iade formu · garanti belgesi. Yalnız iade formu çizildi. Kuyruk "BİTTİ" ilan edildiği için ikisi düştü mü, açık mı? Ölçüm: sevk irsaliyesi no kolonu YOK (REC-143), garanti tablosu YOK — ikisi de kolonsuz, yer tutucuyla çizilebilir. | OPS | **açık · yeni** |
| 153-24 | **`data_subject_requests` (KVKK) belge karşılığı** — K3 düzeltmesinin canlı listesinde var, çizilmiş belgesi yok. Bu şeridin işi mi; kapsam yalnız başvuru formu mu, + yanıt/karar belgesi mi, + aydınlatma metni mi (aydınlatma metni hukukçudan, K20 deseni)? | OPS | **açık · yeni** |
| 153-25 | **`payment_transactions` belge karşılığı** — listedeki ikinci çizilmemiş tablo. Tahsilat makbuzu / ödeme bildirimi gibi bir kâğıt olacak mı; olacaksa şimdi mi (K2 deseni: "kapalı bekler" etiketiyle)? | OPS | **açık · yeni** |
| 153-26 | **6. adım sırası** (antetli · e-posta imzası · kartvizit) — 4. adımın kalanı gelmeden mi, baskı provası (153-9) sonrası mı? Antetli ve imza kabuk kurulu olduğu için provadan bağımsız; **kartvizit yeni bir bleed/kesim ölçü kararı doğurur**, emir olmadan açmıyorum. | OPS | **açık · yeni** |
| 153-19 | **Hukuk metinlerinin teyidi.** `legalConfig.legalReviewCompleted === false`; belgelerde taslak bandı bu yüzden açık. Teyit gelince `taslakBandi` tweak'i kapatılır. Cayma formunun hukuki metni de aynı turda gelir. | Recep / hukukçu | **açık** |

## Devredilenler — bende iş yok

| No | Ne | Nereye |
|---|---|---|
| 153-21 | RFQ kaydı yok (teklif isteme tablosu) | **REC-160 Faz 2** · ticari karar, satınalma süreci devreye alınınca. Belge "kayıt dışı" hâliyle kalır (K7) |
| 153-22 | Uygunsuzluk kaydı yok | **REC-160 Faz 2** · aynı kayıt. NCR "kayıt dışı" bandıyla kalır |
| 153-15/16/17 | İade şeması dar | **REC-159** · migration inince cayma formundaki işaretler kalkar |

## Kapanmış olanlar (kayıt için)

| No | Ne | Hüküm |
|---|---|---|
| 153-1 | Kabuk dosya adı `Belge-Kabugu` | KABUL, ad kalır |
| 153-2 | Sayfa no / nakli yekûn | K13: üretim tarafına devir; kabuk yuva adlarını taşır |
| 153-3 | Vurgu rengi ve yazı ailesi prop olmasın | KABUL |
| 153-4 | E-posta biçimi | K14: gönderime hazır HTML e-posta |
| 153-5 | Grup başlığı sayfa sonu | → 153-9 (Recep provası) |
| 153-6 | Kabuğa dil yuvası | KABUL, kuruldu: `dil` prop'u + tek sözlük; şablonda Türkçe metin 0 |
| 153-8 | Föy şablonu emri | EMİR verildi ve uygulandı |
| 153-10 | Talep özetinde imza alanı | EKLENMEZ |
| 153-11 | Stres provası beş belgeye | EVET, uygulandı ve ölçüldü |
| 153-15/16/17 | İade şeması dar (kalem/adet · tutar · başvuru no) | **KOD İŞİ → REC-159.** Belgede kalem tablosu ve tutar kâğıt gerçeği olarak kalır; `alanAdlari` kipinde "şemada YOK → REC-159" işareti (uygulandı) |
| 153-18 | `SITE_URL` değeri | **KAPANDI: `venthub.com.tr`** (OPS ölçümü). Beş yuva değerle doldu |

## İletişim kuralı — 2026-09-06'da düzeltildi

Ölçülen iki ihlal: (1) REC-153 kaydına hiç yazmamıştım, soruları proje yorumuna koyuyordum; (2) görüş turlarımda dosya üretmemiştim — OPS'u uyandıran şey dosya olayı, yorum değil. İkisi düzeltildi ve cevap **aynı turda** geldi.

Protokol v1.5 (OPS, 2026-09-06): OPS'un cevapları tam metinle **Kurumsal Belgeler proje yorumunda**; REC-153'e yalnız iz. Ben de teslim ve soru özetini proje yorumuna tam yazarım, kayda numaralı olarak işlerim.

## Kuyruk durumu (OPS, 2026-09-06 06:15Z)

**Belge kuyruğu BİTTİ:** kabuk · altı satış belgesi · e-posta beş gövde · föy · yasal set üç belge · satınalma seti dört belge · stres ve gri-ton provaları. Yeni iş uydurulmaz.

Sıradaki iş ancak şunlardan çıkar: (a) Recep'in **153-9** baskı provası bulguları · (b) **153-19** hukuk teyidi (taslak bandını kapatma) · (c) **REC-159 / REC-160** migration'ları inince `alanAdlari` işaretlerini kaldırma · (d) **153-23…26'ya OPS cevabı** (sevk irsaliyesi + garanti belgesi · KVKK seti · `payment_transactions` · 6. adım sırası — dosya `sorular-2026-09-06.md`). O ana kadar beklemedeyim.

Ek: **153-9 kâğıt provası** artık **on yedi** belge + antetli kâğıdı + kartvizit provasını kapsıyor (kartvizitte ek olarak kesim payı ve 8 pt okunurluğu kâğıtta görülür) — altı satış belgesi + üç yasal + föy + üç satınalma + **iki KVKK** (başvuru formu 1,39 · yanıt yazısı 1,25…1,31 — ikisi de tek sayfaya sığmıyor, iki sayfa basar).

— DESIGN-BELGE (Opus) 2026-09-06

