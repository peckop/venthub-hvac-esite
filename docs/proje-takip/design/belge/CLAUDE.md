
# VentHub — Kurumsal Belgeler (DESIGN-BELGE) · karar aynası

Bu dosya yalnız AYNADIR. Karar, Linear "Kararlar — Kurumsal Belgeler" belgesine OPS yazınca verilmiş sayılır.
İmza: "— DESIGN-BELGE (Opus) tarih" (model 2026-09-05'te Fable → Opus değişti, K-belgesi son satırı).
Linear ve Supabase salt okunur; Design karar belgesine yazmaz, tur sonu tek yorum düşer.

## Kaynaklar (öncelik)
1. **VentHub Design System çipi — BAĞLI ve 2026-09-06'da YENİLENDİ** (emir #5 kapanışı sonrası yeniden bağlama). Proje `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`, yerel yol `_ds/venthub-design-system-31b0824c…/`. **Yeniden ölçüldü:** namespace `VentHubDesignSystem_31b082` · **10 bileşen** (önce 6; K29 envanteriyle `KatliCagriSatiri` · `KarsilastirmaTablosu` · `AdetKontrolu` · `PQEgrisi` eklendi) · **57 token** (önce 51; `--surface-dark-inset` dahil) · 4 token dosyası + `styles.css` · `_ds_bundle.js`'te `kolonlar` ve `sonEk` var. Renk, yazı ailesi, kenar, yüzey **token**: kabuk ve altı belgede ham hex **0**, alfa **0**. Altı yeni bileşenin dördü ekran parçası, A4'te işi yok (K17); belge şeridinde yalnız `TeknikTablo` mount edilir.
2. Marka kılavuzu: proje 670f9f75-9e90-499e-a6fe-a98139bb457a (karar: niçin). **Logo dosyadır (K23):** kaynak artık **DS projesi `assets/logo/`** (28 SVG); çip varlık VERMİYOR (`_ds/` altında `assets/` yok) → OPS emri #2 gereği türev kopya `brand/logo/`, damga `brand/logo/README.md`. CSS dilim çizimi SİLİNDİ.
3. Projedeki karar kopyaları (07:14'te yüklendi, eksik 1 KAPANDI): `kararlar-vitrin-15a-2026-09-04.md` (K1–K19; kaynak_updatedAt damgası dosya başında, bayatlık ondan ölçülür) · `anahtar-ve-kip-haritasi-2026-09-04.md` · `venthub-canli-durum.md`.
4. Depo: peckop/venthub-hvac-esite @ master — bkz. `github.md`. **Tablo listesi "sabit" DEĞİL (K3 düzeltmesi, 2026-09-05 13:40 — kendi bulgum, aynama 2026-09-06'da geç işlendi):** liste = şemada canlı olan her tablo; çizim sırası ayrı karar. Bugünkü tam liste: venthub_quotes · venthub_quote_items · project_items · venthub_orders · venthub_order_items · order_invoices · user_invoice_profiles · suppliers · purchase_orders · purchase_order_items · goods_receipts · venthub_returns · data_subject_requests · payment_transactions. "Adı listede olmayan tablo aranmaz" kuralı durur. Çizilmemiş iki tablo: `data_subject_requests` (KVKK seti) · `payment_transactions` (belge karşılığı yok, ödeme kipi kapalı).

## Emir yüzeyi (protokol v1.3)
"Linear" turunun İLK işi: projedeki en yeni `ops-emir-*.md` + `bayat-*.md`. **Dosya kazanır**, Linear yorumu izdir.
**Cevap yolum iki katman, ikisi de zorunlu (2026-09-06'da ölçülen iki ihlal):**
1. **Her görüş/soru turunda DOSYA yazılır** — OPS'u uyandıran şey dosya olayıdır, yorum değil. Yalnız yoruma yazılan görüş OPS'a hiç ulaşmaz; "iletişim olmuyor" şikâyetinin ölçülmüş sebebi buydu.
2. **Sorular → REC-153 kaydı** (numaralı). Kurumsal Belgeler proje yorumu yalnız **iz** düşer. 2026-09-05'e kadar bütün sorularımı yanlış yüzeye (proje yorumuna) yazmışım.
Bekleme kaydı tek dosyada: `bekleyen-hukumler-<tarih>.md` — her turda güncellenir, cevapsız numara tablodan tekrar sayılır.

## Kimlik (çipten — ham hex yazılmaz)
**K25 (2026-09-06):** turkuaz ve kiremit zemin/kenar rengidir, metin rengi DEĞİL. Mürekkep karşılıkları ayrı token: `--brand-cyan-ink` (bağlantı ve küçük turkuaz metin) · `--action-terracotta-deep` (dolu düğme zemini). Belgelerde `a:hover` dokuz dosyada `--brand-cyan` idi → `--brand-cyan-ink`'e çevrildi.
Değerler `hsl(var(--token))` ile gelir: `--primary-navy` · `--brand-cyan` · `--action-terracotta` · `--surface-page` · `--surface-card` · `--surface-inset` (tablo başlığı, #EEEEEA) · `--border-hairline` · `--text-strong` / `--text-body` / `--text-muted` / `--text-on-dark-muted` (#8FA2BD, K22 soluk ton). Yazı: `--font-sans` (Archivo) · `--font-mono` (IBM Plex Mono) · `--font-serif` (belgede kullanılmıyor).
**Ölçülmüş tuzak:** doc-page kabuğu `h1`/`h2`'ye kendi sistem yığınını basıyor; başlıklar Archivo'yu miras ALMIYOR. Kabuk `doc-page h1, doc-page h2 { font-family:var(--font-sans) }` kuralını taşır — bu kural kalkarsa altı belgenin başlıkları sessizce sistem fontuna döner.

## Kimlik (kılavuzdan aynen — arka plan)
Lacivert #1A2B4A · turkuaz #0088B0 · kiremit #D95D0E (belgede yalnız logo üst dilimi) · zemin #f4f4f2 · kart #fff · kenar #e2e2de.
Archivo (metin) · Source Serif 4 (yalnız uzun açıklama; belgelerde kullanılmadı) · IBM Plex Mono (kod, belge no, etiket).
Köşe yarıçapı yok, gölge yok. Wordmark "VentHub" Archivo 700 −0.03em; VENTHUB yazımı yasak (büyük harfli etiketin içinde bile wordmark camel-case kalır). Baskı: işaret ≥6 mm (belgede 36 px ≈ 9,5 mm).

## Kapalı kararlar (Linear "Kararlar — Kurumsal Belgeler")
- **K1** Proje sınırı: yalnız basılı ve PDF belge; ekran çizilmez. Şerit DESIGN-BELGE.
- **K2** Fiyat mantığı: Teklif Talebi Özeti fiyatsız (her iki kipte aynı) · Teklif fiyatlı (her iki kipte) · satış kipi belgeleri şimdi çizilir, "kapalı bekler" etiketiyle.
- **K3** Alanlar koddan ve şemadan okunur, uydurulmaz; tablo listesi sabit.
- **K4** Kimlik ve biçim kılavuzdan; A4, ≥10 pt; üzerine yazma yasak, sürüm ayrı dosya.
- **K5** Türkçe birinci; İngilizce ayrı tur.
- **K6** İlk teslim: E1–E7 KABUL. E6 düzeltmeli — örnek para birimi **TL** (vitrin TL; fiyat motoru EUR maliyetten TL brüt üretir; EUR ayrı hâl DEĞİL). KDV %20. Belge no biçimleri örnek, karar değil. E1'in kalıcı kuralı Marka Kılavuzu'na "Belge sistemi" işi olarak gider (açılış Recep'te).
- **K8** İkinci teslim: E8–E12 KABUL. Proforma no `PF-<sipariş no>`, ayrı seri YOK. Yedi şema eksiği (ETTN · senaryo · yazıyla tutar · kare kod · proforma no/geçerlilik · kargo bedeli) e-fatura entegratörü seçilince tek pakette kapanır → Teklif Akışı REC-48 / REC-73. Belgelerde yer tutucu.
- **K10** Satınalma seti (RFQ · PO · mal kabul · uygunsuzluk) **İngilizce çizilir** — K5 istisnası; karşı taraf yabancı (Vortice/Nicotra/SEAT/Danfoss). TR karşılığı ikinci tur.
- **K11** Belge kabuğu tek şablon, yedinci belgeden ÖNCE: kimlik bloğu · künye · footer · tablo stili · mono etiket dili · "kapalı bekler" şeridi · sayfa no · nakli yekûn. Kimlik yuvası props (logo · unvan · künye · vurgu rengi · yazı ailesi; VentHub varsayılan, kiracı `tenants.styles`).
- **K12** `alanAdlari` kipi KALICI ve her belgede zorunlu.
- **K13** Sayfa no / nakli yekûn → **üretim tarafına devredildi.** Kabuk yalnız alanı ve biçimi taşır; gerçek numara PDF üreticisinden (Puppeteer `footerTemplate`). `alanAdlari` kipinde yuva adları görünür: `sayfaNo` · `toplamSayfa` · `nakliYekun`.
- **K14** E-posta → **gönderime hazır HTML e-posta.** Tablo tabanlı · inline stil · 600 px · Arial (web fontu yok) · logo `brand_logo_url` (URL) · renk `brand_primary_color`. Alan adları koddakiyle birebir. K1 istisnası: e-posta ekran değil gönderim çıktısıdır.
- **K15** E13–E17 KABUL (tasarım ayrıntısı, geri alınabilir). Tek düzeltme E17'de: üçüncü taraf adına iddia cümlesi ("kargo firması işleme almaz") çıktı; kalan metin yalnız davranış tavsiyesi. Belgeye ve e-postaya uygulandı.
- **K16** **Belgenin durumu ayrı dosya değil tweak'tir** (ödeme paid/pending · sevk/teslim · iade talep/onay · garanti aktif/dolmuş). Ayrı dosya yalnız belge TÜRÜ değişince. E-postada karşılığı `{{#if}}` kapıları.
- **K17** (OPS, çip kullanım kuralı) Basılı belge şeridinde tek-kaynak ölçütü **token bağı**, bileşen mount'u DEĞİL: çözülmeyen `var(--*)` 0 · ham hex 0 · alfa 0 (özellik sayısı çiple değişir: 51 → **57**). DS'in on bileşeni ekran parçası, A4'te işi yok. **Tek istisna: `TeknikTablo` föy şablonu turunda gerçekten mount edilir** (alan · değer · anlam yapısı föye birebir).
- **K18** (2026-09-06) **Kabuk dil yuvasıyla tek**: `dil` prop'u (tr|en), kabuk dizeleri tek sözlük nesnesinden. Satınalma seti (K10) aynı kabuktan `dil="en"`; ikinci kabuk YOK. Kapı: şablon gövdesinde Türkçe metin 0.
- **K19** (taslak, Recep itirazı bekler) **Belge numarası**: `<ÖNEK>-YYYYMMDD-NNNN` · teklif **TK** · sipariş **VH** · proforma **PF** · iade **IA** · kargo bildirimi numara TAŞIMAZ (siparişe bağlı) · e-fatura no GİB'den (biz üretmeyiz). 4 hane günlük sayaç, kiracı başına; iptal edilen numara yeniden kullanılmaz. Numara ÜRETİM tarafında doğar (K13 ilkesi), belgede yalnız alan; `alanAdlari` → `belge_no`.
- **K20** (2026-09-06) **Yasal set metni hukuktan, dizgi Design'dan.** Kaynak depo: `DistanceSalesAgreementContent.tsx` · `PreInformationContent.tsx`. Yer tutucu konvansiyonu `src/config/legal.ts`: `[BUYUK_SNAKE]` — kodun kuralı "gerçekmiş gibi duran sahte değer KOYMA". Taslak bandı kod gerçeği (`legalReviewCompleted === false`); amber DEĞİL, lacivert çerçeve + inset. Cayma formunda metin yok, yalnız alan yerleşimi (K7).
- **K21** (2026-09-06) **Satınalma seti İngilizce ve "kapalı bekler" TAŞIMAZ** — satınalma bugün de var. Kabuk `dil="en"`. Para birimi kolondan (`purchase_orders.currency`), TL varsayımı YOK; Avrupalı tedarikçide EUR, biçim en-GB. Mal kabulde fiyat yok (maliyet `inventory_movements` kanıt satırında), NCR'de fiyat yok (kalite belgesi).
- **K22** (15A) Durum alfa ile anlatılmaz: `opacity` yok, soluk hex + zemin + rozet; metin tam opaklık. Belgelerde ihlal yok (ölçüldü: alfa 0). "Kapalı bekler" şeridi = lacivert 1 px çerçeve + `--surface-inset` zemin + mono büyük harf.
- **K23** (15A) Logo elle çizilmez; tek kaynak DS `assets/logo/`. Koyu zemin `tamrenk-koyu` dizilimi: kiremit · **beyaz · beyaz** · turkuaz. **K23-b** (15A, bu projeyi de bağlar): soluk işaret dosyadan gelir; `filter:grayscale()` ve opaklıkla sönükleştirme yasak. Belgelerde soluk işaret sürümü hiç kullanılmıyor (ölçüldü). **Ama "filter 0 · opacity 0" DEĞİL** — iki gerçek eşleşme var, ikisi de K23-b dışı: (1) `Prova Tek Renk.dc.html` iki yerde `filter:grayscale(1)` — yazıcının işlemini taklit eden **denetim** sayfası, müşteri belgesi değil, sönükleştirme değil ölçüm; (2) beş e-posta gövdesinde ön izleme metni `opacity:0` ile gizli (`display:none` + `max-height:0` ile birlikte, standart preheader) — durum anlatımı değil. Bu satırı ilk yazışımda ölçmeden "0" demiştim, aynı turda ölçümle düzeltildi.
- **K26** (2026-09-06, emir #4 · 153-23…26) **Kuyruk yeniden açıldı:** "kuyruk bitti" hükmü K3'ün sonucuyla çelişiyordu — canlı tablosu olup belgesi olmayan yüzey varken kuyruk bitmiş sayılmaz. **153-23** sevk irsaliyesi + garanti belgesi: (c) şema/veri bekler, listeden DÜŞMEZ — sevk irsaliyesi bugün kargo bildirimiyle karşılanıyor (e-irsaliye GİB'den), garanti ürün/marka verisine bağlı; çizilmez. **153-24** `data_subject_requests` EVET bu şeridin işi — iki belge, sıradaki iş. **153-25** `payment_transactions` bugün belge YOK; satış kipi açılınca "Tahsilat Makbuzu / Ödeme Bildirimi" adayı K1a listesine girer. **153-26** sıra: KVKK → 6. adım (antetli + e-posta imzası); **kartvizit Recep kararı**, çizilmez.
- **K7** Teklif koşul metinleri (ödeme, teslim, fiyat esası) ve şirket künyesi (unvan, adres, VKN, MERSİS) şirket kuruluşuyla gelir; o güne kadar yer tutucu, uydurma yok.

## Satış kipi (K1a · anahtar haritası)
"YOK" değil KAPALI. Anahtar `NEXT_PUBLIC_ODEME_ACIK`, bugün kapalı; açar: sepet · ödeme · sipariş · fatura · iade · kargo. Belgeler şimdi çizilir, üstlerinde "Satış kipi · kapalı bekler" etiketi taşır (lacivert çerçeveli mono şerit; kiremit ve amber kullanılmadı).

## OPS'un devrettiği işler (bende değil)
- Seçim kaynağı kolonu (tür · girdiler · dayanak) ve `quote_no`'nun `requested` aşamasında atanması → Teklif Akışı projesi, migration, Recep kapısı. Belgede hücre boş, "KOLON YOK" notuyla duruyor.
- Ürün kodu snapshot kolonu → ayrı iş; kod bugün `products.model_code` join'inden geliyor, belgede kalır.
- "Teklif al" yazımı marka projesinde bayat ayna → DESIGN-MARKA'ya not edildi. Belgelerde fiil geçmiyor.

## Belge kabuğu (K11) — kurulu
`Belge-Kabugu.dc.html` — iki bölüm tek dosyada (`bolum` prop): **baslik** (kapalı bekler şeridi + logo + marka + künye satırı + belge başlığı + alt başlık + kare kod alanı) · **kunye** (footer bandı: künye · sayfa no · belge ref).
Kabuğun helmet'i tablo stilini taşır (`doc-page table/thead th/tbody td`, element seçicileri — sınıf yok) ve ana belgeye **iner; ölçüldü**: th zemini #f4f4f2, padding 8px 6px, IBM Plex Mono. Yani tablo stili artık tek yerde.
Dosya adı tireli (`Belge-Kabugu`) — `dc-import name` dosya adının tıpkısı olmak zorunda.
**Altı belgenin hepsi bindirildi**; her v1 `… v1 ARSIV.dc.html` olarak duruyor (protokol §6):
`Teklif v2` · `Teklif Talebi Ozeti v2` · `Proforma v2` · `Siparis Onayi v2` · `E-Fatura Gorunumu v2` · `Kargo Bildirimi v2`.
Kabuk belge başlığını `white-space:nowrap` basıyor — "e-Fatura" kısa çizgiden iki satıra kırılıyordu.
**Kimlik yuvası bugün:** `markaAdi` · `logoSurumu` (tamrenk · lacivert · siyah · beyaz · tamrenkKoyu · ozel) · `logoDosyasi` · `kunyeSatiri`. **Vurgu rengi ve yazı ailesi prop DEĞİL** (emirden bilinçli sapma, gerekçe `belge-kabugu-notlar.md` §2): çip bağlandıktan sonra ikisinin sahibi DS'tir, kiracı ezmesi token katmanında (`tenants.styles`) yapılır. Onay REC-153-3'te bekliyor.

### Ölçülmüş engel — sayfa no ve nakli yekûn akan belgede YAPILAMAZ
CSS `counter(page)`/`counter(pages)` yalnız `@page` kenar kutularında çözülür; Chrome ve Firefox o kutuları desteklemiyor, doc-page de `@page margin:0` basıyor (tarayıcı başlığını öldürmek için). Nakli yekûn aynı sınıra girer: hangi satırın hangi sayfaya düştüğünü yalnız baskı motoru bilir.
Kabuk bu yüzden sayfa no **alanını** (biçim belirtimi) taşıyor, değerini taşımıyor. **K13'ün son cümlesi 2026-09-06'da tamamlandı:** kabuk artık `alanAdlari` prop'u alıyor ve o kipte künyede yuva ADLARI görünüyor (`sayfaNo / toplamSayfa` · `nakliYekun`); altı belge kendi kipini kabuğa geçiriyor. Önceden kabuk bu kipi hiç bilmiyordu — hüküm eksik uygulanmıştı, ölçümle yakalandı. Varsayılan `__ / __` — bilinmeyen bir sayı İDDİA EDİLMEZ (ilk hâli "1 / 1"di; Teklif v2 iki sayfa bastığı için o değer yanlıştı, ölçümle yakalandı). Gerçek değeri bilen çağıran `sayfaNo` prop'uyla geçer. Gerçek numara üretim tarafında PDF üreticisinden gelir (Puppeteer `footerTemplate` `pageNumber`/`totalPages` destekliyor). Karar OPS'ta.

## Design eklemesi — onay bekler (bu tur)
- E13. Sipariş onayında "Bundan sonra" bloğu (fatura · sevkiyat · teslim · onaylar · belge niteliği): siparişin kendisi değil sıradaki adımlar anlatılır; teslim süresi ve kargo bedeli yer tutucu.
- E14. Sipariş onayı iki ödeme hâli tek belgede: `odeme` tweak'i paid ("Ödeme alındı · hazırlanıyor") / pending ("Ödeme bekleniyor · sevk edilmez") arasında geçirir. Ayrı dosya açılmadı.
- E15. Kargo bildiriminde takip numarası belgenin en büyük ikinci öğesi (18 px mono, harf aralığı açık): belgenin tek işi o numarayı okutmak. Tutar ve fiyat sütunu YOK — sevkiyat belgesi ticari belge değildir.
- E16. Kargo bildirimi iki hâl tek belgede: `durum` tweak'i shipped (sevk tarihi) / delivered (teslim tarihi) arasında geçirir; tarih etiketi de onunla değişir.
- E17. Kargo bildiriminde "hasar varsa tutanaksız teslim almayın" uyarısı kalıcı metin olarak konuldu; süre ve kanal yer tutucu (K7).

## Baskı provası — ÖLÇÜLDÜ (2026-09-05)
Bağıl parlaklık ve kontrast, sRGB üzerinden hesaplandı:

| Ölçüm | Değer | Sonuç |
|---|---|---|
| Turkuaz #0088B0 / beyaz | **4,08:1** | AA eşiği 4,5'in ALTINDA → küçük metinde kullanılamaz |
| Turkuaz / zemin #F4F4F2 | 3,70:1 | daha kötü |
| Lacivert #1A2B4A / beyaz | 14,11:1 | güvenli |
| Gri metin #4A5568 / beyaz | 7,53:1 | güvenli |
| Turkuaz gri tonu | %20,7 | — |
| Kiremit gri tonu | %22,6 | turkuazla **2 puan** fark → tek renk baskıda ayırt EDİLEMEZ |

İki sonuç uygulandı:
1. **Belgelerde turkuaz metin kalmadı.** Grup ara başlığı ve seçim kaynağı türü lacivert 500'e çevrildi (Teklif v2 · Teklif Talebi Ozeti v2). Ayrımı renk değil mono + büyük harf + harf aralığı taşıyor. Turkuaz belgede artık hiç yok (ölçüldü: `a:hover` dışında sıfır kullanım).
2. **Logo için ölçüm bir zorunluluk GÖSTERMEDİ** — ilk yazdığım "dört dilim yerine iki blok okunuyor" sonucu YANLIŞTI, ölçülmedi çıkarsandı (aynı turda gözle denetimde yakalandı, düzeltme `belge-kabugu-notlar.md` §4). Gerçek: işaretin dört poligonu arasında 25 birim **saydam boşluk** var, ayrımı renk değil geometri taşıyor; gri tonda dört dilim iki sürümde de ayrık kalıyor (alt iki dilim tamrenkte de zaten aynı renk). Ölçümün gösterdiği dar bulgu: kiremit %22,6 ve turkuaz %20,7 aynı orta griye düşüyor → **renk kademesi** kayboluyor, yapı kaybolmuyor. `logoSurumu=lacivert` bu yüzden okunurluk düzeltmesi değil **tercih**; kılavuzun tek renk kuralı yerinde, dayanağı tutarlılık.
**Kural:** ölçüm sonucu yazılırken neyin ölçüldüğü ile neyin çıkarsandığı ayrılır. Bu tur ikisi karıştı ve yanlış sonuç dört yere (prova sayfası · notlar · bu ayna · Linear) yayıldı.

## Stres provası — ÖLÇÜLDÜ (Teklif v2, `kalemSayisi` tweak'i)
40 kalem · 8 grup (Blok A bodrum/zemin/1. kat · Blok B ×3 · yükleme alanı · ofis bloğu) · iki seçim kaynağı satırı · uzun ürün adları. Sonuç: sayfa yüksekliği 4 965 px, A4 basılabilir kutu 1 368 px → **~3,6 sayfa (4 sayfa basar)**. Tablo başlığı `<thead>` olduğu için her sayfada tekrar eder.
Grup ara başlığı sayfa sonunda yalnız kalmasın diye satıra `break-after:avoid` kondu (Chrome tablo satırında kısmen destekliyor; baskıda doğrulanması gereken tek nokta bu).

## E-posta şablonları (K14) — kurulu
Gönderilecek dosyalar `email/` altında, **tek kaynak onlar** — **beşi tamam**: `talep-alindi.html` · `teklif-yanitlandi.html` · `hesap-olusturuldu.html` · `siparis-onayi.html` · `kargo-bildirimi.html`.
Son ikisi kapalı bekleyen gövdeler ama **e-postada "kapalı bekler" etiketi YOK** (OPS hükmü: e-posta gönderilmiyorsa etiketi de yoktur); rozet yalnız prova sayfasında. İki hâller `{{#if}}` kapılarıyla: `payment_received`/`payment_pending` · `is_shipped`/`is_delivered` (K16).
Kodda yerine geçtiği şablon: `supabase/functions/order-confirmation/templates/email/order_confirmation.html`.
**Motorun ölçülmüş sınırı:** `renderTemplate` yalnız `{{alan}}` ve `{{#if alan}}…{{/if}}` biliyor — **döngü yok**. E-postada kalem listesi çizilemez; e-posta sayı ve numara taşır, kalemler ekteki belgede kalır.
**İki zorunlu sapma:** (1) Arial — e-postada web fontu güvenilir değil, Archivo taşınamaz; mono etiketler `'Courier New'`. (2) Ham hex — istemci CSS değişkeni okumaz, token çözülmez. Marka rengi çift bildirimle geliyor: `background-color:#1A2B4A;background-color:{{brand_primary_color}}` — alan boşsa lacivert fallback kalır.
**Ölçülen tutarsızlık:** `order-confirmation` numarayı `#${order_number.split('-')[1]}` ile kısaltıyor → e-postada `#000318`, belgede `2026-000318`. Kod kararı, kod tarafında düzelir.
Prova: `E-Posta Provasi.dc.html` — dosyaları okuyup motorun kurallarıyla dolduruyor (kopya değil). Ölçülen tarayıcı sınırı: iframe `srcDoc` niteliği güncellenince iç DOM yenilenmiyor → üç ayrı iframe + blob `src`.

## Ürün teknik föyü (K17 istisnası) — kurulu
`Urun Teknik Foyu.dc.html` — 1 şablon → 375 belge. Kabuk + dört teknik tablo + uygulama alanları (Source Serif 4, yalnız `description_i18n` doluysa) + belge kimliği + kare kod yuvası. Satış kipinden bağımsız: kapalı-bekler etiketi ve fiyat YOK. Ölçüldü: 16 alan → 9+3+3+1 satır, sayfa 1,42 (alanAdlari kipinde 1,28); iki kipte de taşan hücre 0.
**Kolon genişliği artık `kolonlar` prop'undan** (çip 2026-09-06). Föy 215/120/1fr basıyor, `alanAdlari` kipinde 215/210/1fr; ölçüldü: alan 112/215, değer 194/210, taşan 0. Önceki turda değer kolonu sabit 150 px'ti ve uzun yuva adları 8 hücrede taşıp 5'inde anlam metninin üstüne basıyordu (en kötüsü 150 px örtüşme) — ve ben notlara "taşan hücre 0" yazmıştım, ölçmeden. ZWSP hilesi de o günden kalmıştı, kalktı.
**TeknikTablo mount ölçümü:** `x-import component-from-global-scope` DOM'a **hiç düşmedi** (sc-if içinde de dışında da sıfır, konsol sessiz, global mevcut). Bileşen logic tarafından mount ediliyor (`React.createElement(DS.TeknikTablo, …)`); render eden kod DS'in kendisi, elle tablo yok. Bedeli: tablo gövdesi editörden tıklanamaz.
**Veri mantığı koddan:** `translateSpecKey` · `formatSpecValue` (birim sonekleri UZUNDAN KISAYA — `_db_a` önce `_a`'dan; kodun kendi yorumu bu kusurun 142 üründe "58 A" bastığını anlatıyor) · `groupTechnicalSpecs` dört grubu · `SPEC_SORT_ORDER`. **Bu dört tablo KOPYADIR, sahibi kod tarafı → bayatlama riski (REC-153-13).**
**Değerler GELDİ (2026-09-06):** `foy-veri-lineo-100-2026-09-06.json` (OPS, canlı DB SELECT). Birincil ürün **17160 Vortice Lineo 100 Quiet**, `urun` tweak'i 17143'e geçirir. 22 anahtarın 21'i çizilir (`pq_curve` çizilmez, K20 ileride); ölçüldü: performans 5 · elektriksel 8 · fiziksel 5 · diğer 3, sayfa **1,46**, taşan 0. Biçimleme `formatSpecValue` mantığıyla (boolean → Var/Yok, `phase:1` → "Monofaze (1~)"). **Etiketler i18n sözlüğünden** (`src/i18n/dictionaries/tr.ts` → `pdp.specs.*`), çözüm zinciri `specLabel.ts`. `sku` ÇIKTI (153-12): belge kimliği `model_code` + föy sürümü + kaynak.
**Eski hâl (kayıt):** `technical_specs` gerçek değerlerine erişimim yok (Supabase kapalı, depoda yok — arandı). Değer hücreleri yuva adı taşıyor (`[max_delivery_max_speed_m3h] m³/h`); yapı, sıra, birim ve satır sayısı böyle de ölçülebilir (REC-153-14).

## Stres provası — ALTI belgede ölçüldü (2026-09-06)
Aynı üretici: 40 kalem · 8 grup · uzun adlar · **17 nolu kalem KDV istisnalı** (tax 0 → ikinci KDV satırı) · iki grupta %5 iskonto. A4 basılabilir kutu 1 358 px.

| Belge | Sayfa yüksekliği | Sayfa | Taşan hücre |
|---|---|---|---|
| Teklif v2 | 5 201 px | 3,83 → 4 | 0 |
| E-Fatura Görünümü v2 | 4 086 px | 3,01 → 4 | 0 |
| Proforma v2 | 3 414 px | 2,51 → 3 | 0 |
| Sipariş Onayı v2 | 3 272 px | 2,41 → 3 | 0 |
| Teklif Talebi Özeti v2 | 2 999 px | 2,21 → 3 | 0 |
| Kargo Bildirimi v2 | 2 428 px | 1,79 → 2 | 0 |

İki fiyatsız belgede para birimi ifadesi 0 (ölçüldü). Ölçülemeyen tek şey grup başlığının sayfa sonunda yalnız kalması — kâğıt provası bekliyor (153-9).

## KVKK seti (K26 · 153-24) — kurulu
İki belge, A4, kabuk `dil="tr"`, **"kapalı bekler" etiketi YOK** (ölçülmüş gerekçe: tablo + RLS + `anonymize_user_personal_data` prod'da — migration "merge = uygulama" diyor — ve `/legal/kvkk` sitemap'te; satış kipi anahtarıyla ilgisi yok, K21 deseni).
`KVKK Basvuru Formu v1.dc.html` (**1,39** sayfa) · `KVKK Basvuru Yanit Yazisi v1.dc.html` (**1,25**; uzun gerekçede **1,31**). Ölçüldü: taşan hücre 0 · ham hex 0 · alfa 0 · Arial 0 · ham turkuaz 0. (Sayfa genelindeki 10 hex/10 alfa çalışma zamanı kabuğundan — `support.js` ve `doc-page.js` gölge DOM'u; ölçüm `doc-page` alt ağacına daraldı.)
**Kaynak migration T063** (`20260816120000_kvkk_data_subject_requests.sql`) + `src/lib/kvkk/dueState.ts`. Tablo 16 kolon; listeler CHECK kısıtından: `request_type` altı tür (access · rectification · erasure · portability · objection · restriction) · `status` beş durum (received · identity_pending · in_progress · completed · rejected).
**30 gün belgeye SAYI olarak yazılmadı:** otorite DB `due_at` default'u; `dueState.ts` "30 GÜN BURADA YOK: son tarih otoritesi DB" diyor. Gecikme sayacı `TERMINAL_STATUSES` (completed · rejected) hâlinde donar.
**Kısmi ret cümlesi kodun, Design'ın değil:** `anonymize_user_personal_data`'nın format string'i ("%s adet sipariş/fatura kaydı, VUK/TTK %s yıllık saklama yükümlülüğü nedeniyle silinmemiştir…") sayı yuvalı hâliyle duruyor; niçini de kodda (KVKK m.7 · sessiz kısmi ret meşru değil). İşlem dökümü tablosu fonksiyonun jsonb rapor anahtarlarından.
**Şemada olmayan beş alan → 153-27:** başvuranın talep METNİ · ad soyad · kimlik no/adres · telefon · başvuru numarası (uuid; K19 öneki KV). `alanAdlari` kipinde "şemada YOK" işaretiyle görünür.

## Yasal set (K20) — kurulu
Üç belge, A4, kabuk `dil="tr"`, "kapalı bekler" etiketi:
`Mesafeli Satis Sozlesmesi v1.dc.html` (14 bölüm, 2,61 sayfa) · `On Bilgilendirme Formu v1.dc.html` (15 bölüm, 2,66 sayfa; §10 örnek cayma formu doldurulabilir yuvalara çevrildi) · `Cayma ve Iade Formu v1.dc.html` (metin YOK, alan yerleşimi, 1,16 sayfa).
Kapı ölçüldü (dördü, föy dahil): **ham hex 0 · alfa 0 · Arial 0 · para birimi 0 · taşan hücre 0.** Not: ilk ölçümde `&#8220;` gibi varlık kodları "ham hex" olarak yakalandı — yanlış pozitif, desen düzeltilip yeniden ölçüldü.
**Sözleşmede 16 tekil yer tutucu**; dolu değerler koddan geldi (teslim 1-5 iş günü · iade 14 gün · fatura 7 gün · garanti 2 yıl · ömür 10 yıl · yürürlük 2026-08-15). `[SITE_ADRESI]` benim eklediğim yuva: `SITE_URL` dosyasını okumadım, çıkarsamayı değer yerine koymadım (REC-153-18).

### ⚠ `venthub_returns` sanılandan dar — ölçüldü
Tablonun tamamı: `id (uuid)` · `user_id` · `order_id` · `reason` · `description` · `status` (requested→approved/rejected→in_transit→received→refunded/cancelled) · `created_at` · `updated_at`.
**Kalem/adet kolonu YOK** (iade sipariş düzeyinde) · **iade tutarı kolonu YOK** · **başvuru numarası yok** (uuid). Kendi aynamda `refund_amount · requested_at · approved_at · processed_at` yazmıştım — **dördü de yok**, ölçümle düzeltildi. REC-153-15/16/17.

## Satınalma seti (K10 · K21) — kurulu
Dört belge, A4, kabuk `dil="en"`, kapalı-bekler etiketi YOK. Veri `20260816143015_purchasing_t062_core.sql`.
`Purchase Order v1.dc.html` (1,15 sayfa · 40 kalemde **2,43**) · `Request for Quotation v1.dc.html` (1,04) · `Goods Receipt Note v1.dc.html` (0,96) · `Supplier Non-Conformance Report v1.dc.html` (1,06). Ölçüldü: dördünde taşan hücre 0, Türkçe metin 0; GRN ve NCR'de tutar 0.
**Mal kabulde en büyük ikinci öğe tedarikçinin irsaliye numarası** (18 px mono) — gerekçe şemada: `UNIQUE (po_id, document_no)` idempotens kilidi o kolonda. "Open" kolonu türetilir; aşırı kabul DB CHECK + RPC kapısıyla imkânsız olduğu için negatif değer çizilmez.
**Şema eksikleri (REC-153-20/21/22):** PO numarası kolonu YOK (kimlik uuid; K19'da satınalma öneki de yok) · RFQ kaydı YOK · uygunsuzluk kaydı YOK (en yakın `goods_receipts.note` + `purchase_orders.close_note`, ikisi de yetmiyor → NCR kayıt dışı çalışıyor, belgede bunu söyleyen bant var).

## Açık eksikler (alan-envanteri F2 tablosunda tam liste)
ETTN · e-fatura senaryosu · yazı ile tutar · GİB kare kod · proforma no ve geçerliliği · kargo bedeli — hiçbirinin şemada kolonu yok. Entegratör seçilmedi; UBL-TR eşleme tablosu sağlayıcı belli olunca eklenir.

## Beceri kullanımı (2026-09-06, kullanıcı onayı)
Üç beceri bu şeride yarıyor, gerisi yaramıyor — gerekçesi ölçüm:
- **Save as PDF — uygulanıyor.** 153-9'un cevabı ekranda üretilemez (`counter(page)` `@page` kenar kutusu gerektiriyor, tarayıcılar desteklemiyor; `break-after:avoid` tablo satırında Chrome'da kısmi). Baskı kopyası kuralı: kaynak + sürüm damgası (`omelette-print-source`) + renk/animasyon dondurma; `doc-page` baskı geometrisinin sahibi olduğu için `@page` yazılmaz. **`Teklif v2-print.dc.html`** ilk kopya (stres hâli varsayılan: 8 grup ara başlığı sayfa sınırına düşsün). Kalan on dört belge aynı mekanikle, istendikçe.
- **Handoff to Claude Code — uygulanıyor.** `design_handoff_belge_sistemi/` (README + `tasarim/` 22 dosya + `olcum/` 8 not). İçinde K13'ün devredilmiş işi Puppeteer `footerTemplate` karşılığıyla yazılı.
- **HTML email** — yalnız denetim için değerli (beş gövde elde yazıldı, K14); sırası gelmedi.

**Gerekmeyenler ve niye:** Interactive prototype → **K1 yasağı** (ekran çizilmez) · Make a doc → fiilen uygulanmış (`doc-page`) · Make tweakable → bitti (her belgede `alanAdlari` + hâl anahtarları, K16) · Create design system → çip bağlı · Wireframe · deck · flier · 3D · harita · web research → konu değil.

## Dosyalar
- `belge-kabugu-notlar.md` — kabuk teslim notu: çip ölçümü · kimlik yuvası · üç kusur · provalar · REC-153 soruları
- `Urun Teknik Foyu.dc.html` — föy şablonu; tweaks: alanAdlari · anlamSutunu
- `urun-teknik-foyu-notlar.md` — föy + dil yuvası + stres provası teslim notu
- `Mesafeli Satis Sozlesmesi v1.dc.html` · `On Bilgilendirme Formu v1.dc.html` · `Cayma ve Iade Formu v1.dc.html` — yasal set (K20); tweaks: alanAdlari · kapaliEtiket · taslakBandi / kalemSatiri
- `KVKK Basvuru Formu v1.dc.html` · `KVKK Basvuru Yanit Yazisi v1.dc.html` — KVKK seti (K26 · 153-24); tweaks: alanAdlari · kayitBlogu / sonuc · gerekce · rapor
- `kvkk-seti-notlar-2026-09-06.md` — KVKK teslim notu: T063 şema ölçümü · etiket gerekçesi · 153-27
- `kvkk-seti-notlar-2026-09-06.md` yanında: `yasal-set-notlar-2026-09-06.md` — yasal set + föy gerçek veri teslim notu
- `foy-veri-lineo-100-2026-09-06.json` — OPS'un verdiği canlı veri (Design değiştirmez)
- `Purchase Order v1.dc.html` · `Request for Quotation v1.dc.html` · `Goods Receipt Note v1.dc.html` · `Supplier Non-Conformance Report v1.dc.html` — satınalma seti EN (K10 · K21); tweaks: alanAdlari · durum / kabul · kalemSayisi
- `satinalma-seti-notlar-2026-09-06.md` — satınalma teslim notu
- `Kartvizit v1.dc.html` · `Kartvizit v1-print.dc.html` · `kartvizit-notlar-2026-09-06.md` — kartvizit (emir #5); tweaks: alanAdlari · kesimCizgisi
- `Kesif Raporu v1.dc.html` · `sorular-2026-09-06-3.md` — keşif raporu (kullanıcı isteği) + 153-28/29/30; tweaks: alanAdlari · kalemSatiri · krokiAlani
- `Antetli Kagit v1.dc.html` · `email/imza.html` · `antetli-ve-imza-notlar-2026-09-06.md` — 6. adım; tweaks: sayfa · kilit · provaCizgileri
- `bekleyen-hukumler-2026-09-06.md` — açık numaralar (REC-153 ile aynı)
- `sorular-2026-09-06.md` — OPS'a numaralı soru dosyası (153-23…26, emir #4 ile kapandı) + proje yorumu tam metni
- `sorular-2026-09-06-2.md` — ikinci soru dosyası: 153-27 (KVKK'da şemada olmayan beş alan) + 6. adım belirsizlikleri + proje yorumu tam metni
- `linear-turu-2026-09-06-2.md` — Linear turu kaydı: emir #3 hükümlerinin ölçümü + aynada bulunan iki bayatlık (K3 düzeltmesi · K23-b)
- `Prova Tek Renk.dc.html` — tek renk/fotokopi denetim sayfası (müşteri belgesi değil): iki logo sürümü gri tonda yan yana + ölçülen kontrast tablosu
- `eposta-sablonlari-notlar.md` — e-posta teslim notu: motor sınırı · iki sapma · alan tablosu · numara tutarsızlığı
- `design-eklemeleri-e13-e17-2026-09-05.md` — E13–E17 madde · ne · gerekçe (OPS hükmü bekliyor)
- `ops-emir-2026-09-05-1…5-belge.md` (+ `-2-cip.md`) · `bayat-2026-09-05.md` · `ops-iletisim-protokolu.md` — OPS yazar, Design değiştirmez
- `alan-envanteri-2026-09-05.md` — A–F tablolar + F2 eki (proforma / e-fatura eksikleri)
- `Teklif Talebi Ozeti v1.dc.html` — tweaks: alanAdlari · kaynak · grupla
- `Belge-Kabugu.dc.html` — kabuk (K11); tweaks: bolum · kimlik yuvası (markaAdi · logoSurumu · logoDosyasi · kunyeSatiri) · baslik/altBaslik · kapaliEtiket · kareKod · kunyeMetni · belgeRef · sayfaNo
- `brand/logo/` — işaret SVG'leri: tamrenk (varsayılan) · lacivert (tek renk baskı) · siyah (faks) · beyaz (koyu zemin) + README (koyu zemin dizilimi ölçülü). Renk props'ları düştü: kiremit ve turkuaz artık yalnız SVG'nin içinde.
- `Teklif v2.dc.html` — kabuğa bindirilmiş; tweaks: alanAdlari · durum · revizyon · **kalemSayisi (5/40 stres provası)** · iskonto · teknikOzet · kurSatiri
- `Teklif Talebi Ozeti v2.dc.html` · `Proforma v2.dc.html` · `Siparis Onayi v2.dc.html` · `E-Fatura Gorunumu v2.dc.html` · `Kargo Bildirimi v2.dc.html` — kabuğa bindirilmiş (tweaks v1'lerle aynı)
- `Teklif v1 ARSIV.dc.html` — v1 (protokol §6, üzerine yazılmadı)
- `Proforma v1.dc.html` — tweaks: alanAdlari · kapaliEtiket · teklifBagi
- `E-Fatura Gorunumu v1.dc.html` — tweaks: alanAdlari · alici · kapaliEtiket · teklifBagi
- `Siparis Onayi v1.dc.html` — tweaks: alanAdlari · odeme · kapaliEtiket · teklifBagi
- `Kargo Bildirimi v1.dc.html` — tweaks: alanAdlari · durum · kapaliEtiket
- `Teklif v2-print.dc.html` — baskı kopyası (Save as PDF mekaniği): kaynak + sürüm damgası + renk/animasyon dondurma, stres hâli varsayılan. Teslim değil, PDF sekmesinin tesisatı — kaynak değişirse yeniden yazılır
- `design_handoff_belge_sistemi/` — geliştirici paketi: README (sayfa geometrisi · `footerTemplate` · token tablosu · belge→şema haritası · REC-159/160 · 153-27 · içerik kuralları) + `tasarim/` (16 belge + kabuk + doc-page.js + 5 e-posta) + `olcum/` (8 not)
- `doc-page.js` — belge kabuğu (dokunulmaz) · `github.md` — depo bağı
- Karar kopyaları: `kararlar-vitrin-15a-2026-09-04.md` · `anahtar-ve-kip-haritasi-2026-09-04.md` · `venthub-canli-durum.md` (OPS yazar, Design değiştirmez)

## Kartvizit (emir #5) — kurulu
`Kartvizit v1.dc.html` (prova, A4 yatay) · `Kartvizit v1-print.dc.html` (baskı kopyası) · not: `kartvizit-notlar-2026-09-06.md`.
Ölçüldü: kesim **85×55 mm** (321,3×207,9 px) · taşma 3 mm → basılan **91×61 mm** (343,9×230,5 px, beklenen 343,9×230,6) · **4 kare** (2 varyant × 2 yüz) · **32 kesim işareti** ayrı katman (`kesimCizgisi` tweak'i; kapanınca kartın kendisi değişmez) · taşan 0 · dört logo dosyadan yüklü.
Varyant A beyaz zemin/lacivert mürekkep · B lacivert zemin/beyaz mürekkep (logo `tamrenk-koyu`, ikincil metin `--text-on-dark-muted`, K22 alfa yok). **Kiremit yalnız arka yüzde tek çizgi** (22×1,2 mm), dolgu ve metin rengi yok. Turkuaz yalnız logonun içinde.
Altı yer tutucu (`{{ad_soyad}}` · `{{unvan}}` · `{{telefon}}` · `{{eposta}}` · `[Adres]` · `[Şirket unvanı]`), sahte veri 0; şirket unvanı/adres antetlideki AYNI yer tutucudan.
**Tipografi sapması bilinçli:** ad 11 pt · unvan ve iletişim 8 pt — belgelerin 10 pt tabanı 85×55 mm kartta geçmiyor (10 pt'de dört satırlık iletişim bloğu sığmıyor).
**Ham hex 2, ikisi de METİN içinde** (matbaa notu: `#1A2B4A` ve `#D95D0E` CMYK karşılığı profille üretilir) — stilde ham hex 0.
**CMYK YAPILAMADI, sebep kayıtlı:** tarayıcı baskı motoru yalnız RGB üretir, ICC profili gömemez; dönüşümü matbaa kendi profiliyle yapar. PDF dosyası hazır.

## Keşif raporu (kullanıcı isteği, 2026-09-06 · sıra dışı) — kurulu
`Kesif Raporu v1.dc.html` — A4, kenar 20 mm. **Kimlik akan içerikte, yalnız künye `slot="footer"`** — on altı belgenin deseni. Ölçülmüş sebep: kabuğun `_measure()`'ı başlık slotunu bu dosyada bulamadı, `.hdr-space` 0 kaldı ve kimlik bloğu rapor başlığının üstüne bastı (42 px örtüşme); `doc-page.js` dokunulmaz olduğu için desen değiştirildi. Bedeli: kimlik yalnız ilk sayfada — her sayfada kimlik yalnız `Antetli Kagit v1`'de ölçülmüş hâliyle duruyor (orada `.hdr-space` 85 px). Künye slot'u burada da çalışıyor (29 px, örtüşme 0). **1,71 sayfa** · taşan hücre 0 · ham hex 0 · alfa 0 · sahte veri 0 · 20 kutucuk. Tweaks: alanAdlari · kalemSatiri · krokiAlani (küçük/yarım/tam sayfa).
**Alanlar `wizard_selections`'tan** (`20251218_wizard_selections.sql`): kapı ölçüsü · usage_location (4) · wind_condition (4) · traffic_intensity (3) · climate_zone (3) · heating_needed (3) · sector · calculated_* üç sonuç · recommended_series (2) · project_items kalemleri. Tablonun kendi yorumu gerekçeyi veriyor: "hukuki koruma amacıyla". **Hesap sonuçları kâğıtta boş** — formülü sistem çalıştırır, sahada tahmin yazılmaz.
**Yedi alanın kolonu yok → 153-28:** müşteri/adres/yetkili/telefon · keşfi yapan personel · mahal alanı ve tavan yüksekliği · kroki · rapor düzeyinde bulgu notu · müşteri onayı · rapor no (taslak önek **KS**). 153-29 sıradaki yeri, 153-30 rapor kabuğu — ikisi de OPS'ta.

## Antetli + e-posta imzası (6. adım) — kurulu
`Antetli Kagit v1.dc.html` · `email/imza.html` · not: `antetli-ve-imza-notlar-2026-09-06.md`.
**Antetli kabuğa bindirilmedi, gerekçe:** kabuk bir BELGE kimliği (başlık · alt başlık · kare kod · kapalı bekler şeridi); antetlinin bunların hiçbiri yok, taşıdığı tek şey kimlik + künye + boş yazı alanı. Kimlik dizilimi ve ölçüleri kabuğunkiyle birebir (36 px işaret · 11 px boşluk · 22 px wordmark · 1 px lacivert kural · 13 px mono künye).
**Ölçülmüş slot kararı:** kimlik `slot="header"`, künye `slot="footer"` — `doc-page` ikisini basılan HER sayfada tekrar eder; antetlinin tanımı bu. Geometri A4 · kenar 20 mm (belgeler 18) · yazı alanı 170×257 mm. Ölçüldü: ham hex 0 · alfa 0 · logo 36 px dosyadan yüklendi · yer tutucu 7 · sahte numara 0. Tweaks: sayfa (ilk/ikinci) · kilit · provaCizgileri.
**İmza HTML** (K14 sapmaları aynen: Arial · ham hex · tablo · inline; 460 px). Beş kişi alanı yer tutucu, **kodda karşılığı yok ve gerekmiyor** — imza istemcide doldurulur, `renderTemplate` bu dosyayı işlemez. Bağlantı rengi `#00708F` (K25-b; ham turkuaz 4,08 ile AA altı). Logo uzak URL'den gelir (`venthub.com.tr/brand/…`) — o yola yayınlama kod tarafı.

## Kuyruk durumu — YENİDEN AÇILDI (OPS emri #4, 2026-09-06 · K26)
KVKK seti **teslim** (iki belge). **6. adım teslim** (antetli + e-posta imzası). **Kartvizit teslim** (emir #5; 4 kare, kesim katmanı, CMYK sebebiyle yapılamadı notu). Sevk irsaliyesi ve garanti belgesi şema bekler, listeden düşmez. **Yeni iş uydurulmaz.**
Sonrası yalnız üç kaynaktan: (a) **153-9** baskı provası (on beş belge) · (b) **153-19** hukuk teyidi · (c) **REC-159 / REC-160** migration'ları + **153-27**. Ayrıntı `bekleyen-hukumler-2026-09-06.md`.

## Sıradaki (OPS sırası)
1 ~~Kabuğa bindirme~~ ~~stres + gri-ton provası~~ ~~çip bağlama~~ **TAMAM** → 2 ~~e-posta şablonları (beş gövde)~~ **TAMAM** → 3 ~~ürün teknik föyü şablonu~~ ~~dil yuvası~~ ~~stres provası~~ **TAMAM** → 4 ~~yasal set (mesafeli satış · ön bilgilendirme · cayma formu)~~ **TAMAM** → kalan yasal: sevk irsaliyesi · garanti belgesi (**şema bekler, K26**) → 5 ~~satınalma seti EN (K10)~~ **TAMAM** → ~~KVKK seti (başvuru formu · yanıt yazısı)~~ **TAMAM** → 6 ~~antetli + e-posta imzası~~ **TAMAM** → 7 ~~kartvizit~~ **TAMAM** (emir #5). Sırada emir bekleyen iş yok; devreye alma ve servis raporları Recep'in kurulum-bakım kurgusunu bekler (keşif raporu çizildi, 153-29).

Eski sıra notu — e-posta şablonları (tek kalıp, değişen gövde: talep alındı · teklif yanıtlandı · hesap oluşturuldu · sipariş onayı · kargo) → antetli kâğıt + e-posta imzası → kartvizit, sunum, sosyal.
Satış kipi belge seti TAMAM: sipariş onayı · proforma · e-fatura görünümü · kargo bildirimi, dördü de "kapalı bekler" etiketiyle.

— DESIGN-BELGE (Opus) 2026-09-05

