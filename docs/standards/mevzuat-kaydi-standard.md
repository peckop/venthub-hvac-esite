# Mevzuat Kaydı Standardı (Cetvel) — v0.1 TASLAK

> **Sahibi:** MEVZUAT şeridi. **Doğuran olay:** 2026-09-25, Recep'in sözü: *"mevzuatlar adında bir şerit
> gerekebilir; tüm konuları tarar, standartlar vs olur, tüm konulara ve ürünlere destek olur."*
> Aynı hafta BLOG şeridi, fan tüzüğü 327/2011'in yerini 2024/1834'e bıraktığını bir yazı hazırlarken
> tesadüfen buldu (REC-369). Katalogdaki hiçbir sayfa bunu bilmiyordu; bilginin tek bir yeri yoktu.
>
> **Durum:** TASLAK — OPS üzerinden Recep onayına gider. Onaysız hiçbir şerit bu dosyayı kural diye
> uygulamaz.

---

## M0 — Kapsam

**Kapsamda:** ürünlerimize dokunan teknik mevzuat ve standartlar.

| Tür | Örnek |
|---|---|
| AB tüzüğü / direktifi | 2019/1781 (motor), 2024/1834 (fan), 2014/34 (ATEX), 2014/30 (EMC) |
| TR yönetmelik / tebliğ | SGM tebliğleri, ATEX yönetmeliği, EMC yönetmeliği |
| Standart (EN / ISO / IEC / TS) | IEC 61800-3, EN 12101-3, EN ISO 80079-36 |

Konu ekseni: çevreye duyarlı tasarım (ErP) ve enerji etiketi, patlayıcı ortam (ATEX), CE ve uygunluk,
EMC ve alçak gerilim, makine emniyeti, yangın ve duman tahliyesi, F-gaz, yapı ürünleri.

**Kapsam dışı:** hukuki ticaret metinleri (KVKK, mesafeli satış, e-ticaret, fatura). Onlar
`legal-compliance-standard.md`'nin alanıdır ve şirket kuruluşuna bağlı bekleyen konudur.

---

## M1 — Kaydın yeri ve biçimi

| Ne | Yer | Niçin |
|---|---|---|
| Kurallar (bu dosya) | `docs/standards/mevzuat-kaydi-standard.md` | Diğer cetvellerle aynı yerde; README haritasına girer |
| Kayıt verisi | `docs/mevzuat/kayit.json` | Tek dosya, makinece okunur, diff'i okunur; betik ve ajan aynı dosyayı okur |
| Kaynak kanıtları | `docs/mevzuat/kanit/<kimlik>.json` | Her kaynağın ham çekim kaydı (M3); kayıt dosyasını şişirmez |

**Biçim JSON'dur**, YAML değil: depodaki doğrulama betikleri (`scripts/rehber/alinti-dogrula.mjs`)
JSON okuyor ve ikinci bir ayrıştırıcı gerekmiyor. Kayıt **PUBLIC depoya** girer; mevzuat zaten
herkese açık bilgidir. ⛔Pazar verisi, müşteri verisi, fiyat ve tedarikçi sözleşmesi bu dosyalara
**girmez** (repo 2026-08-15'ten beri public).

Tek dosya yeterlidir: kalem sayısı yüzleri geçmeden bölünmez. Bölmek gerekirse yetki alanına göre
bölünür (`kayit-ab.json`, `kayit-tr.json`), konuya göre değil; çünkü AB–TR karşılık bağı dosya
içinde kalmalıdır.

---

## M2 — Kalem alanları

Her kalem bir mevzuat metnidir. Bir AB tüzüğü ile onun TR karşılığı **iki ayrı kalemdir** ve
`karsilik` alanıyla birbirine bağlanır: tarihleri, numaraları ve durumları farklıdır.

| Alan | Zorunlu | Tür | Açıklama |
|---|---|---|---|
| `kimlik` | ✅ | metin | Kararlı anahtar. Biçim: `<YETKİ>-<numara>` → `AB-2024/1834`, `TR-SGM-2026/2`, `STD-IEC-61800-3`. Bir kez verilir, değişmez |
| `ad` | ✅ | metin | Resmî tam ad, kaynağın dilinde |
| `ad_tr` | — | metin | AB metni için Türkçe kısa ad (yazılarda kullanılan) |
| `tur` | ✅ | sabit | `kanun` · `tuzuk` · `direktif` · `uygulama-karari` · `yonetmelik` · `teblig` · `standart` · `rehber` |
| `yetki` | ✅ | sabit | `AB` · `TR` · `ULUSLARARASI` |
| `konu` | ✅ | liste | M0'daki eksenler: `erp` · `enerji-etiketi` · `atex` · `emc` · `alcak-gerilim` · `makine` · `yangin-duman` · `f-gaz` · `yapi-urunleri` · `ses` · `cerceve` |
| `kapsam` | ✅ | metin | Kendi cümlemizle, Türkçe, en fazla üç cümle. Standart metninden kopya **yasak** (M4) |
| `tarihler` | ✅ | nesne | `kabul`, `yayim`, `yururluk` (ISO tarih) + `asamalar: [{tarih, ne}]`. Bilinmeyen alan `null`, tahmin yazılmaz |
| `yerini_aldigi` | — | liste | Bu metnin kaldırdığı kalemlerin `kimlik`leri |
| `yerine_gelen` | — | metin | Bu metin kaldırıldıysa yerine gelenin `kimlik`i |
| `degistirenler` | — | liste | Değişiklik metinleri (`AB-2021/341` gibi); ayrı kalem açılması şart değil |
| `karsilik` | — | liste | Öbür yetki alanındaki karşılığın `kimlik`i (AB ↔ TR) |
| `durum` | ✅ | sabit | `yururlukte` · `gecis-doneminde` · `kaldirildi` · `taslak` · `revizyonda` |
| `kaynaklar` | ✅ | liste | En az bir **resmî** kaynak: `{url, yayinci, erisim_sinifi, erisim_tarihi, kanit}`. `kanit` = `docs/mevzuat/kanit/…` yolu |
| `etkilenen_aileler` | ✅ | liste | `{slug, etki, neden}` — `slug` KATALOG'un aile slug'ı (`product_families.slug`); `etki` = `kapsamda` · `kapsam-disi` · `belirsiz` |
| `urun_sayfasi_sartlari` | — | liste | Metnin ürün sayfasına ya da teknik föye yüklediği bilgi şartları (etiket, föy, plaka bilgisi) |
| `yazi_konusu` | — | liste | BLOG için önerilen konu başlıkları |
| `son_kontrol` | ✅ | tarih | Kaynağın en son ham çekildiği gün (M5) |
| `notlar` | — | metin | Açık soru, çelişki, doğrulanamayan iddia |

**İlişki alanları** (`yerini_aldigi`, `degistirenler`, `karsilik`) yalnız kimlik taşır. Kaldırılmış
eski bir metne (ör. `AB-640/2009`) kayıtta ayrı kalem açmadan atıf yapılabilir; serbest metin ise
`iliski_notlari`na yazılır, kimlik alanına yazılmaz.

**Neden `kapsam-disi` de yazılır:** bir tüzüğün bir aileyi kapsamaması da sayfa bilgisidir. Duman
tahliye fanı fan tüzüğünden muaf ise bu, müşteriye verilen "ErP uyumlu" cümlesini değiştirir.

---

## M3 — Kaynak ve kanıt

Kaynak sınıfları ve doğrulama `rehber-yazisi-standard.md` R2 ile **aynıdır**; bu cetvel onları
yeniden tanımlamaz, uygular:

1. **Öncelik:** EUR-Lex, Resmî Gazete, mevzuat.gov.tr, bakanlık ve Komisyon siteleri. Standart için
   yalnız yayıncının (IEC, ISO, CEN/CENELEC, TSE) katalog/kapsam sayfası.
2. **Erişim sınıfı (R2.2):** tüzük ve yönetmelik `AÇIK`; standart tam metni `KAPALI` → yalnız ad ve
   kapsam, **sayı alınmaz**.
3. **Ham kanıt (R2.3):** `curl` ile ham çekim; kayıtta ilk ve son adres, HTTP durumu, yönlendirme
   zinciri, sayfanın durum satırı (EUR-Lex'te *"In force"* / *"No longer in force"*), etiketi soyulmuş
   metnin sha256'sı, birebir alıntı, erişim tarihi. Özetleyici araç (WebFetch) keşif içindir,
   kanıt değildir.
4. **robots.txt ve kullanım şartı önce okunur.** Otomatik okuma yasaksa o kaynak elle okunur ve
   kanıt dosyasına `robots: yasak — elle okundu` yazılır. (Niçin: 2026-09-24'te Google Trends'e
   bu kontrol yapılmadan otomatik erişildi.)
5. **EUR-Lex programla okunamaz** (ölçüldü 2026-09-25, altı ajanın altısında): robots.txt izin
   veriyor ama site güvenlik duvarı her `curl` isteğine boş gövdeli HTTP 202 döner. Aynı resmî metin
   AB Yayın Ofisi'nin veri servisinden alınır: `http://publications.europa.eu/resource/celex/<CELEX>`
   (`Accept: application/xhtml+xml`, `Accept-Language: eng`). Yedek yol web.archive.org kopyasıdır;
   kopyanın tarihi kanıta yazılır. ⚠Veri servisi EUR-Lex'in "In force / No longer in force" durum
   satırını vermez; durum, değişiklik zincirinden ve Komisyon sayfasından çıkarılır ve bu, kanıtta
   belirtilir. Tarayıcı otomasyonuyla EUR-Lex'e girmek yöntem sapmasıdır; yapıldıysa kanıta yazılır.
6. **Depo PUBLIC olduğu için kanıt dosyasına ne girer** (OPS notu, 2026-09-25):

   | Kaynak | `kanit/` dosyasına giren | Girmeyen |
   |---|---|---|
   | AB tüzük/direktif (EUR-Lex), TR yönetmelik/tebliğ (Resmî Gazete, mevzuat.gov.tr) | Kısa birebir alıntı (iki cümleyi geçmez) + durum satırı + hash | Uzun bölüm kopyası |
   | Standart (EN / ISO / IEC / TS) | Yalnız yayıncının **kapsam sayfasındaki açık metin**: ad, numara, baskı yılı, kapsam cümlesi | Standart **gövdesinden** tek cümle, tablo ya da sayı (telif) |

   Resmî metinler kamu malıdır ve kısa alıntı serbesttir; standart gövdesi satılan telifli üründür.
   Satın alınmış bir standart okunmuş olsa bile gövdesi depoya girmez.
7. Yapay zekâ cevabı, blog, üretici sitesi ve rakip sitesi **kaynak değildir**. Üretici belgesi
   ürünün kendisi hakkında kanıttır (kaynak dizini), mevzuatın içeriği hakkında değil.

---

## M4 — Yasaklar

- ⛔Standart metninden cümle, tablo ya da sayı kopyalanmaz (telif). Kapsam kendi cümlemizle yazılır.
- ⛔Kayıtta tarih tahmin edilmez. Bulunamayan tarih `null` ve `notlar`da "bulunamadı" olur.
- ⛔Kayıt canlı veriye yazmaz. Bir ürün sayfasının değişmesi gerekiyorsa MEVZUAT **liste** üretir,
  sayfayı KATALOG değiştirir (M6).
- ⛔Hukuki ticaret metinleri bu kayda girmez (M0).

---

## M5 — Tazelik

`son_kontrol` alanı kalemin ne kadar güvenilir olduğunu söyler. Kontrol, kaynağın ham yeniden
çekilip sha256'nın ve durum satırının öncekiyle karşılaştırılmasıdır; sayfaya bakıp "değişmemiş"
demek kontrol değildir.

| Kalem durumu | Kontrol sıklığı |
|---|---|
| `gecis-doneminde`, `taslak`, `revizyonda` | ayda bir |
| `yururlukte` | üç ayda bir |
| `kaldirildi` | kontrol edilmez (yalnız `yerine_gelen` izlenir) |

Takip düzeni önerisi M5.1'dedir; zamanlayıcı kurulmadan önce Recep'e sorulur (karar 53). O gelene
kadar kontrol elle koşulur ve tarihi `son_kontrol`a yazılır.

### M5.1 Takip düzeni — ÖNERİ (kurulmadı)

> **Durum:** yalnız öneri. Recep kararı (2026-09-25, OPS aktarımı): MEVZUAT şeridi tohum işinden sonra
> park eder; betik yazılmaz, zamanlayıcı kurulmaz. Şerit yeniden açıldığında bu bölümden başlanır.

| Kaynak | Ne izlenir | Yol | Sıklık |
|---|---|---|---|
| AB metinleri | Konsolide sürüm tarihi, değişiklik ve kaldırma zinciri | Yayın Ofisi veri servisi (M3/5) — CELEX başına ham çekim, metin sha256'sı öncekiyle kıyas | M5 tablosu |
| AB Resmî Gazetesi uyumlaştırılmış standart listeleri | ATEX, EMC, alçak gerilim, makine listelerinde baskı ve geri çekilme tarihi | Komisyonun single-market-economy sayfalarındaki liste dosyası | üç ayda bir |
| Komisyon ecodesign gözden geçirme sayfaları | Motor (2019/1781) ve havalandırma ünitesi (1253/2014) revizyon taslakları | energy-efficient-products.ec.europa.eu | ayda bir |
| Resmî Gazete | Yeni SGM tebliği, yönetmelik değişikliği | Günlük fihrist sayfası; "çevreye duyarlı tasarım", "enerji etiket", "patlayıcı ortam", "florlu sera" anahtar sözcükleri | haftada bir |

**Önerilen biçim:** elle koşulan tek betik (ALTYAPI'nın `scripts/` alanında, sahibi ALTYAPI) — kayıttaki her
kalem için `kaynaklar_kanit` dosyasındaki adresi yeniden çeker, sha256'yı ve durum satırını karşılaştırır,
değişenleri listeler; **kayda yazmaz**, listeyi MEVZUAT okur ve kaydı elle günceller. Aynı betik kayıt
tutarlılığını da sınar: her aile slug'ı KATALOG paketinde var mı, her `karsilik` kimliği kayıtta var mı.
İlk elle koşum tarihi önerisi: şerit yeniden açıldığı gün. Zamanlayıcıya bağlamak ayrı karardır (karar 53).

---

## M6 — Çıktılar ve kullanıcıları

| Kullanıcı | Aldığı | Biçim |
|---|---|---|
| KATALOG | Sayfa bilgisi değişmesi gereken aileler | Aile slug'ı · hangi kalem · ne değişmeli · hangi tarihten itibaren |
| BLOG | Yazı olması gereken konular | Konu · dayandığı kalemler · zaman baskısı (yaklaşan uygulama tarihi) |
| SATIS | Müşteriye verilen bilginin güncelliği | Kalem · eski ifade · doğru ifade |

Bir kalem **durum değiştirdiğinde** (yeni aşama, kaldırılma, TR karşılığının yayımı) üç listenin
hangisini etkilediği aynı gün yazılır ve ilgili şeride iletilir.

### M6.0 Ürün sayfasında uygunluk satırı ("ErP Uyumlu" vb.) — gösterim kuralı (2026-09-25)

KATALOG'un 187 değerlik `erp_compliant` denetimi için verildi (değerlerin hiçbirinin kaynağı yoktu).

| Durum | Gösterim |
|---|---|
| Ürün o ürün grubunun tüzüğünün **kapsamında** ve **modeli adıyla anan** üretici belgesi (föy, uygunluk beyanı, EPREL) uygunluk diyor | "ErP Uyumlu" + hangi tüzük; kaynak sayfası satıra bağlı |
| Ürünün kendisi kapsam dışı ya da beyan yok, ama üretici **yalnız motor** için 2019/1781 uygunluğu beyan ediyor | Daraltılmış satır: "Motor: AB 2019/1781 ekotasarım tüzüğüne uygun" |
| Ürün tüzükten **muaf** (ATEX, duman tahliye, hava sirkülasyon fanı, aşındırıcı gaz…) | Satır **hiç gösterilmez**; "Hayır" da yazılmaz ("uymuyor" diye okunur) |
| Seri/broşür geneli uygunluk cümlesi var, model adı geçmiyor | Yetmez; model belgesi gelene kadar satır gösterilmez |

Dayanak: uygunluk model bazında beyan edilir (1253/2014 ve 1254/2014 bilgi şartları, TR SGM 2021/19 Md.5
"her bir modeli için"). Muafiyet koşulları kayıttaki kalemin metnindedir; örneğin hava sirkülasyon fanı istisnası
(2024/1834 Md.1(3)(p)), üretici sıfırdan farklı basınçta performans yayımlıyorsa düşer.

### M6.1 BLOG ↔ MEVZUAT iş bölümü (kalıcı — OPS/Recep, 2026-09-25)

1. **Yazıdan önce mevzuat paketi.** BLOG konuyu MEVZUAT'a bildirir. MEVZUAT o konunun ürün
   ailelerine dokunan kalemleri çıkarır: yürürlükteki metin, AB/TR farkı, geçiş tarihleri, birebir
   doğrulanmış alıntı ve kaynak. Paket kayıttaki kimliklere atıf yapar; kayıtta olmayan kalem pakete
   girmeden önce kayda eklenir.
2. **Mevzuat iddiası yalnız paketten.** BLOG yönetmelik yorumlamaz; pakette olmayan bir mevzuat
   iddiasını önce MEVZUAT'a sorar.
3. **Yazı bitince mevzuat kontrolü.** Yazıdaki her mevzuat cümlesini MEVZUAT kontrol eder: tarih,
   madde numarası, AB/TR ayrımı, geçiş dönemi. Bu kontrol `rehber-yazisi-standard.md` R5.1 doğrulama
   akışında ayrı bir adımdır.
4. **Kayıt değişince güncelleme bildirimi.** Bir kalemin durumu ya da tarihi değişirse, o kaleme
   dayanan yayındaki yazılar BLOG'a "güncelle" diye bildirilir. Bunun için her paket, dayandığı
   kalem kimliklerini listeler; yazı yayımlanınca bu liste yazının kaydında tutulur.
5. **"İlk anlatan" adayları.** Yaklaşan uygulama tarihleri BLOG'un konu sırasına öneri olarak verilir.
   Sırayı Recep belirler, öneriyi OPS götürür.

---

## Ölçüm geçmişi

- 2026-09-25 — v0.1 taslak. Tohum: altı eksende (motor, fan, ATEX, EMC/alçak gerilim, havalandırma
  üniteleri/enerji etiketi, makine/duman/F-gaz) **42 kalem** (`docs/mevzuat/kayit.json`, kanıtlar
  `docs/mevzuat/kanit/`). Aile slug'larının 47/47'si KATALOG paketiyle eşleşti. Resmî ve doğrulanmış
  alıntısı olmayan tek kalem `STD-EN-12101-3` (CEN kataloğu HTTP 500 verdi). Bu sürümde `tarihler`
  alanları ajanların metin notlarını taşır; ISO tarihe çevrilmesi v0.2 işidir.
- 2026-09-25 — kayıt v0.2: ses ekseni (G) — `TR-YON-GURULTU-BINA-2017`, `TR-YON-CEVRE-GURULTU-2010`,
  `AB-BILDIRIM-2016/C416/06`; 45 kalem. `TR-SGM-2021/23` özeti düzeltildi (yalnız erteleme değil;
  sürücü tarihi Md.5 ile değişir). Üç ölçülmüş ders:
  (1) **Resmî Gazete ekleri taranmış PDF olabilir** (SGM 2021/16, 2021/18, gürültü yönetmeliği):
  metin katmanı yok, OCR aracı yok; sayı ve madde **sayfa görüntüsünden** okunur ve kanıtta sayfa
  numarası yazılır. Alt ajanın görüntü transkripsiyonu kanıt değildir: bu turda iki hata yakalandı
  (Ek-8 8.2.1 fıkra metni, Tablo 5.1 dipnotunun yanlış tabloya bağlanması).
  (2) Madde numarası varsayılmaz: "Ek-I madde 2 = sürücü" varsayımı yanlıştı (madde 2 motor ürün
  bilgisi, madde 3 sürücü); BLOG'a yanlış madde gitti, aynı gün düzeltildi.
  (4) **Kapsam istisnası kelimesi kelimesine okunur ve üretici beyanıyla çaprazlanır** (v0.3): 1253/2014
  Md.1(2)(c) "axial or centrifugal fans only equipped with a housing" diyor; MEVZUAT bunu "gövdeli kanal
  fanı kapsam dışı" diye genelleştirip BLOG'a paket verdi. BLOG, üreticinin 1253/2014 beyanıyla
  itiraz etti. Karışık akışlı fan istisnada yok, üretici CA kanal fanlarını "RVU-U" beyan edip SEC
  sınıfı yayımlıyor. Kural: bir ürün ailesini "kapsam dışı" ilan etmeden önce kaynak dizininde o ailenin
  aynı tüzüğe atfı aranır (`sayfalar.jsonl`'da tüzük numarası); atıf varsa hüküm üretici beyanıyla
  uzlaştırılmadan verilmez.
  (5) **Açık bir hükmü kapatan tur, kaydın kendi "okunmadı" notlarını da kapatır** (v0.4): SVGM 2019/15
  yürürlüğü REC-397 hükmünde Md.10 ile kullanıldığı hâlde kayıtta "okunmadı" yazıyordu. Karar yorumu
  kayıttan güçlü olmamalı. v0.4'te üç kalem eklendi ya da tamamlandı: SGM 2021/18 Ek-III (AB 2018
  aşaması değerleri 1/10/2021'den itibaren) ve Md.2(2)(c) açık sorusu, SVGM 2019/15 Md.10 (20.12.2020),
  yeni `TR-KANUN-7223` (`tur` listesine `kanun` eklendi). 46 kalem.
  (3) AB konsolide sürüm listesi Yayın Ofisi SPARQL servisinden tek sorguyla alınır
  (`cdm:resource_legal_id_celex`, `STRSTARTS("0<CELEX>")`); M5.1 takip betiği için en ucuz değişiklik
  algılayıcısıdır.
