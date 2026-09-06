# Kararlar — Kurumsal Belgeler (Linear belgesinin TAM dışa aktarımı · 2026-09-06 ayna: K1–K17-b)

<!-- kaynak_id: 9e95d258-98a2-4c51-9a2d-40576c87a7bf · kaynak_updatedAt: 2026-09-06T11:09:42.064Z · kopya: 2026-09-06T11:20Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır.

Tek kaynak; karar buraya yazılmadan verilmiş sayılmaz. Yazan: OPS. Design eklemesi Recep "evet" demeden karar değildir.

## K1 · Proje sınırı (2026-09-05, Recep)

Bu proje basılı ve PDF belgelerin yeridir; ekran çizilmez. Site kararları "Kararlar — Vitrin 15A", kimlik Marka Kılavuzu projesinde. Design şeridi adı DESIGN-BELGE, imza "— DESIGN-BELGE (Fable) tarih"; Linear'a yalnız bu projeye yazar.

## K2 · Fiyat mantığı (2026-09-05, OPS düzeltmesi, Recep brief'iyle yürürlükte)

Sitenin fiyat gizlemesi vitrin içindir. Müşteriye gönderilen TEKLİF fiyatlı bir belgedir. Belgeler: **Teklif Talebi Özeti** (müşterinin talebi; adet ve not, fiyat ve tutar yok; her iki kipte aynı) · **Teklif** (bizim yanıtımız; birim fiyat, tutar, KDV, genel toplam, geçerlilik, koşullar, imza; her iki kipte fiyatlı) · **satış kipi belgeleri** (sipariş onayı, proforma, e-fatura görünümü, kargo bildirimi) şimdi çizilir, "kapalı bekler" etiketiyle (K1a mantığı).

## K3 · Veri kaynağı (2026-09-05)

Belge alanları koddan ve şemadan okunur, uydurulmaz. Gerçek tablo adları: venthub_quotes, venthub_quote_items, project_items, venthub_orders, venthub_order_items, order_invoices, user_invoice_profiles. Supabase ve Linear salt okunur.

## K4 · Kimlik ve biçim (kılavuzdan)

Palet, yazı tipleri, logo 14A-3, "VentHub" yazımı, "Teklif iste" tek fiil — Marka Kılavuzu'ndan aynen; burada icat edilmez. Eksik (belge ızgarası, tablo stili, 24 px ikon) marka projesine iş olarak yazılır. A4, yazı ≥10 pt, baskı kontrastı; üzerine yazma yasak, sürüm ayrı dosya.

## K5 · Dil (2026-09-05)

Türkçe birinci; İngilizce hâl ayrı tur, şimdi çizilmez.

## K6 · İlk teslim hükümleri (OPS, 2026-09-05; Design eklemeleri E1–E7)

E1 geçici belge ızgarası ve tablo stili KABUL (hairline #e2e2de, başlık zemin #f4f4f2 + lacivert üst çizgi, etiket IBM Plex Mono 10 pt, gövde Archivo 10–10,5 pt, tabular sayı) — kalıcı kural Marka Kılavuzu'na "Belge sistemi" işi olarak gider (açılış Recep) · E2 grup etiketi ara başlık KABUL · E3 seçim kaynağı satırı çizili kalır, kolon işi Teklif Akışı projesinde · E4 Teklif Talebi Özeti'nde imza YOK (imza atan taraf yok) KABUL · E5 kabul kutusu quote-standard §7.1 metniyle KABUL · E6 örnek para birimi **TL** (vitrin TL; EUR ayrı hâl değil), KDV %20, belge no biçimi örnek · E7 fatura bloğu yalnız profil varsa KABUL.

## K7 · Recep'ten gelecek içerik (açık, acele yok)

Teklif koşul metinleri (ödeme, teslim, fiyat esası, geçerlilik dili) ve şirket künyesi (unvan, adres, VKN, MERSİS) şirket kuruluşuyla gelir; o güne kadar belgelerde yer tutucu, uydurma yok.

## K8 · İkinci teslim hükümleri (OPS, 2026-09-05; Proforma v1 + E-Fatura Görünümü v1; Design eklemeleri E8–E12)

E8 "kapalı bekler" etiketi: lacivert 1 px çerçeve + IBM Plex Mono büyük harf + anahtar adı (amber belgeye taşınmaz) KABUL · E9 proforma no `PF-<sipariş no>`, ayrı seri yok KABUL · E10 GİB kare kod 64 px kare KABUL · E11 proformada yalnız düzenleyen imzası KABUL · E12 e-faturada kurumsal/bireysel alıcı tek belgede tweak KABUL. **Yedi şema eksiği** (ETTN, e-fatura senaryosu, yazıyla tutar, kare kod, proforma no/geçerlilik, kargo bedeli) e-fatura entegratörü seçilince tek pakette (Teklif Akışı REC-48/REC-73); belgelerde yer tutucu.

---

*2026-09-05 ilk sürüm (OPS). Brief: kurumsal-belgeler-brief-v1 (OPS düzeltmeli), Design projesine yapıştırıldı. Aynı gün K6–K7 (ilk teslim). Model: Fable → Opus (ilk iki belgeden sonra; ihlal+düzeltme sayısıyla karşılaştırılır).*

## K3 düzeltmesi (OPS, 2026-09-05 13:40 TR [Linear damgası 10:40Z] — DESIGN-BELGE bulgusu, Ç10 sınıfı bayatlık)

K3'teki tablo listesi şemanın gerisindeydi. Yeni kural: **liste = şemada canlı olan her tablo; çizim sırası ayrı karardır.** Eklenenler: `suppliers` · `purchase_orders` · `purchase_order_items` · `goods_receipts` (satınalma, `20260816143015`) · `venthub_returns` · `data_subject_requests` · `payment_transactions`. "Adı listede olmayan tablo aranmaz" kuralı kalır; liste artık tam.

## K10 · Satınalma belgeleri İngilizce çizilir (OPS, 2026-09-05; K5 istisnası)

RFQ · PO · mal kabul · tedarikçiye uygunsuzluk bildirimi **İngilizce** çizilir; karşı taraf yabancı (Vortice, Nicotra Gebhardt, SEAT, AVenS, Danfoss). K5 ("İngilizce ayrı tur") müşteriye dönük belgeler için geçerli kalır. TR karşılığı ikinci tur.

## K11 · Belge kabuğu tek şablon + kimlik yuvası (OPS, 2026-09-05; 15A K8 ile aynı ilke: az şablon + veri)

`Belge-Kabugu.dc.html` tek şablon: kimlik bloğu · künye · footer · tablo stili · mono etiket dili · "kapalı bekler" şeridi · sayfa no alanı · nakli yekûn alanı (değerleri K13). Belgeler `dc-import` ile alır; gövde belgeye özel. **Kimlik yuvası props (düzeltildi 2026-09-05 akşam, DESIGN-BELGE sapması KABUL):** marka adı (`markaAdi`) · logo (`logoSurumu` + `logoDosyasi`) · künye satırı (`kunyeSatiri`). **Vurgu rengi ve yazı ailesi prop DEĞİLDİR:** DS çipi bağlıyken sahibi DS token katmanıdır; kiracı ezmesi `tenants.styles` → token, belge şablonu ikinci sahip olmaz (ölçüm sahipliği). VentHub varsayılan (SaaS PARK, kural 12 yürürlükte). Yedinci belgeden önce yapıldı; mevcut 6 belge kabuğa bindi. Bedel: dosyayı çoğaltıp serbest deneme kolaylığı azalır; ölçülen bakım maliyeti (tek etiket düzeltmesi = 6 dosya) ağır bastı. **Uygulandı (2026-09-05):** `Belge-Kabugu.dc.html` (ad tireli; `dc-import name` dosya adının tıpkısı olmak zorunda, değiştirilmez) + altı belge v2 (v1'ler ARSIV); logo K23 gereği `brand/logo/` SVG türev kopyası (`venthub-isaret-lacivert/beyaz/siyah/tamrenk.svg` — dosya adlarında `tek-renk-` parçası YOK); kiremit/turkuaz belgede yalnız logoda yaşar. Çipe bağlanınca yakalanan üç kusur: başlıklar Archivo değildi (doc-page host stili), tablo başlığı zemini `#EEEEEA` olmalıydı, ham hex/alfa 0 doğrulandı.

## K12 · `alanAdlari` kipi kalıcı ve zorunlu (OPS, 2026-09-05)

Her belgede kolon adlarını gösteren tweak = geliştirici teslim belgesi, şablon↔kolon eşlemesinin canlı aynası. Her yeni belgede zorunlu; kağıt envanterin yerine geçmez.

## K13 · Sayfa no ve nakli yekûn ÜRETİM TARAFINDA (OPS hükmü, 2026-09-05; DESIGN-BELGE ölçümü üzerine)

Akan HTML belgede canlı sayfa numarası üretilemez (CSS `counter(page)` yalnız `@page` kenar kutularında; Chrome/Firefox desteklemiyor; doc-page `@page{margin:0}`). Nakli yekûn aynı sınırda, daha sert. **Karar: 1. yol.** Kabuk yalnız **alanı ve biçimi** taşır (`__ / __` yer tutucu; bilinen tek sayfalıda "1 / 1"); `alanAdlari` kipinde `sayfaNo` · `toplamSayfa` · `nakliYekun` adları yazılı. Gerçek değerleri PDF üreticisi basar (Puppeteer `footerTemplate` `pageNumber`/`totalPages`; tablo sayfalama orada). 2. yol (JS sayfa modeli) bakım yükü, 3. yol (vazgeç) kurumsal belgede kabul edilmez. **Baskı provası:** Design PDF'i projeye dosya olarak yazamaz (kaydetme kullanıcı eylemi); prova = Design'ın ölçüm tablosu + Recep'in bir kez yazdırması (grup başlığı `break-after: avoid` gözle orada doğrulanır).

## K14 · E-posta şablonları GÖNDERİME HAZIR HTML E-POSTA (OPS hükmü, 2026-09-05; K1 istisnası)

E-posta ekran değil gönderim çıktısıdır; bu projede çizilir. Kod ölçümü: `supabase/functions/order-confirmation` kendi yanındaki `templates/email/order_confirmation.html` şablonunu `{{alan}}` ve `{{#if alan}}…{{/if}}` ile dolduruyor; şablon yoksa Arial gömülü HTML basıyor (marka yok). Belge o şablonun yerine geçer. Kurallar: tablo tabanlı · inline stil · 600 px · web-safe yedek yazı tipi · logo `brand_logo_url` (URL), renk `brand_primary_color` alanından · **alan adları koddaki adlarla birebir** (`brand_name` · `customer_name` · `order_number` + şablona özel alanlar), `alanAdlari` kipi zorunlu (K12). Tek kalıp, değişen gövde: talep alındı · teklif yanıtlandı · hesap oluşturuldu · sipariş onayı (kapalı bekler) · kargo (kapalı bekler). Yetenek: HTML email.

## K15 · Sipariş Onayı ve Kargo Bildirimi hükümleri (OPS, 2026-09-05; Design eklemeleri E13–E17, dosya `design-eklemeleri-e13-e17-2026-09-05.md`)

E13 "Bundan sonra" bloğu KABUL (teslim süresi · kargo bedeli yer tutucu, K7) · E14 ödeme iki hâl tek belgede tweak KABUL (şema `venthub_orders.payment_status` + `enforce_invoice_only_for_paid_order`; "ödeme bekleniyor · sevk edilmez") · E15 kargo bildiriminde **tutar yok**, takip no en büyük ikinci öğe KABUL (ticari belge değil; elden geçen kâğıtta tutar sızıntısı) · E16 sevk/teslim iki hâl tek belgede tweak KABUL (`shipped_at` / `delivered_at`) · **E17 hasar uyarısı KABUL, tek düzeltme:** üçüncü taraf adına iddia ("kargo firması tarafından işleme alınmaz") çıkar; kalan yalnız davranış tavsiyesi ("paketi kurye yanındayken kontrol edin; hasar varsa kuryeye tutanak tutturun"); bildirim süresi/kanalı yer tutucu (K7). Recep isterse E17 tümüyle kalkar, ticari karar değil.

## K16 · Belgenin durumu ayrı dosya değil TWEAK'tir (OPS, 2026-09-05; E14/E16 deseninden kural)

Aynı belgenin iki durumu (ödeme alındı/bekleniyor · sevk/teslim · iade talep/onay · garanti aktif/dolmuş) tek dosyada tweak ile geçer; ayrı dosya yalnız belge **türü** değişince açılır. Gerekçe ölçülü: `lang="tr"` düzeltmesi altı dosyaya dokundurmuştu; durum başına dosya aynı düzeltmeyi katlar.

## Belge sırası (OPS, 2026-09-05)

1 Belge Kabuğu + kimlik yuvası (BİTTİ) → 2 e-posta şablonları (tek kalıp, değişen gövde; SÜRÜYOR) → 3 ürün teknik föyü şablonu (1 şablon, 375 belge; REC-145 ilk yük) → 4 satış kipi yasal seti "kapalı bekler" (sevk irsaliyesi · iade formu/onayı · garanti belgesi) → 5 satınalma seti EN → 6 antetli/imza/kartvizit. **Recep'e tek başına soru (açık):** devreye alma ve servis raporları — kurulum/bakım işi nasıl kurgulanıyor; şema yok, çizim bekler. Kolon eksikleri (birim, kalem termini, sevk irsaliyesi no) → REC-143. E13–E17 → K15 (kapandı).

*2026-09-05 akşam: K13, K14, K15, K16 eklendi; K11 uygulandı + kimlik yuvası düzeltmesi (OPS).*

## K17 · Belge sırasının kalanı ve şema bekleyen belgeler (2026-09-06 12:15Z, OPS hükmü; Belge soruları 153-23…26)

**K3'ün sonucu:** canlı tablosu olup belgesi olmayan yüzey varken "kuyruk bitti" denmez. **Sevk irsaliyesi ve garanti belgesi:** kolon karşılığı yok → şema/veri bekler, listeden düşmez; e-irsaliye GİB'den (e-fatura gibi), garanti şeması satış kipiyle karar. `data_subject_requests` **→ KVKK seti Belge'nin işi:** Başvuru Formu (önek taslak **KV**) + Başvuru Yanıt Yazısı (30 gün); sıradaki iş. `payment_transactions` **→** bugün belge yok; satış kipi açılınca Tahsilat Makbuzu/Ödeme Bildirimi adayı (K1a kapalı-bekler). **6. adım:** KVKK setinden sonra antetli kâğıt + e-posta imzası; **kartvizit Recep kararı** (basılı ürün). Baskı provasından (153-9) bağımsız.

### K17-a · Kartvizit = KARAR (2026-09-06, Recep: "yapılsın")

K17'deki "kartvizit Recep kararı" kalemi kapandı: kartvizit yapılır. Sıra: antetli + e-posta imzası SONRA. Kapsam ve ölçüm satırı: Belge emir #5 (`ops-emir-2026-09-06-5-belge.md`, proje yorumu). Kişi verisi Recep'ten; gelene kadar yer tutucu, sahte veri yazılmaz.

### K17-b · Keşif Raporu (2026-09-06, Recep isteği; OPS hükmü 153-28/29/30)

Keşif Raporu v1 KABUL (alanlar `wizard_selections`, hesap sonuçları boş, sahte veri 0). **153-28:** yedi alanın (müşteri/yetkili · keşfi yapan · mahal ölçüleri · bulgu notu · müşteri onayı · rapor no · kroki) kaydı KOD İŞİ (`site_surveys` + `wizard_selections` bağı); Linear kaydı OPS açar (09-07 sabah), "şema bekler" kümesi (REC-159/160 yanı); migration Recep kapısı, öncelik Recep'e sorulur. Rapor no öneki KS taslak → 153-7. **153-29:** sıra bozulmadı, sıradaki iş kartvizit (emir #5); devreye alma/servis raporları Recep'in kurulum-bakım kurgusunu bekler, Recep istemeden çizilmez. **153-30:** rapor kabuğu ikinci raporla açılır, bugün açılmaz. Kağıt provası 153-9 = 17 belge + antetli (Recep).
