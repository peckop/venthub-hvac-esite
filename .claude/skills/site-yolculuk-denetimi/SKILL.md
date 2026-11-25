---
name: site-yolculuk-denetimi
description: 'Kullanıcı yolculuğu denetimi: önizleme sitesinde S1-S8 müşteri senaryolarını (modele inme, sonuçsuz arama, Hesapla, föy/CAD, karşılaştırma, teklif, sepet) yürütür; tamam mı, kaç tık, nerede takıldı. Görsel puan değil. Tetik: "yolculuk turu", "senaryoları yürüt", "kaç tıkta", "nerede takılıyor".'
category: research
metadata:
  kaynak: "OPS emri 25 Kasım 2026 (OPS kartı Site kullanıcı yolculuğu denetimi disiplini, TSR-45); ölçüt NN/g 10 kullanılabilirlik sezgisi. Uyarlanan ölçütler (kod alınmadı, yalnız soru listesi ve ölçek): coreyhaines31/marketingskills cro + references/form.md (MIT; 5 sn netliği, birincil eylem, güven, form sürtünmesi), pbakaus/impeccable reference/critique-rubric.md (Apache-2.0; sezgi başına 0-4 puan bantları, çalışan bellek ≤4 seçenek kuralı), emilkowalski/skills break-ui (MIT; gerçekçi en kötü girdi ilkesi, yalnız S3), sickn33/agentic-awesome-skills android-ui-journey-testing (MIT; adım başına durum doğrulaması kalıbı)"
  sahibi: "TASARIM kullanır (tasarim-dogrulayici); senaryo ve tuzak listesini TASARIM besler, açıklama ve tetik YETENEK'te"
---

# Site yolculuk denetimi

Önizleme sitesinde gerçek bir müşterinin yapacağı sekiz işi baştan sona yürütür ve her biri için tek soruya kanıtlı cevap verir: **iş bitti mi, kaç tıkta, nerede takıldı?** Amaç zip'ten zip'e aynı senaryoları aynı biçimde ölçüp gidişatı görmektir; bu yüzden senaryolar sabittir ve satır biçimi değişmez.

Bu skill görünüşü puanlamaz (o `site-gorsel-inceleme`), paneli yürütmez (o `panel-gezinme`), hata düzeltmez (o `qa`). Yalnız yolculuğun akışını ölçer.

## Ne zaman

- Yeni zip önizlemeye çıktığında sekiz senaryoyu (ya da görev metninin seçtiklerini) yürütüp önceki zip ile kıyaslamak.
- "Müşteri X'i bulabiliyor mu, kaç tıkta" sorusuna ölçümle cevap vermek.
- Design bir akışı değiştirdikten sonra aynı senaryoyu yeniden yürütmek.

## Ne zaman DEĞİL

- Hiyerarşi, boşluk, kontrast, 1-5 görsel puan: `site-gorsel-inceleme`.
- Kiracı paneli (ERP) belge zinciri ve modül işlevi: `panel-gezinme`.
- Canlı sitede kırık bağlantı avı ve düzeltme: `qa`.
- Gelen karenin K kurallarına uyumu, Design'a emir: `venthub-tasarim-dili`.
- Hız ölçümü (LCP, CLS): `web-performance`.

## Kurulum

Tarayıcı kuralları `site-gorsel-inceleme` Kurulum bölümündedir; oradan oku, burada tekrarlanmaz: yalnız claude-in-chrome, adres yalnız `onizleme.venthub.com.tr/onizleme/`, sayfa `iframe#cer` içinde (ölçüm `contentDocument` üzerinden, tıklama gerçek tıkla), genişlik 1568 ve "Mobil 390" düğmesi (ölçülen `innerWidth` yazılır), `javascript_tool` çıktısında adres ve `? &` yok (BLOCKED), kirli tarayıcı durumu raporda yazılır, iş ≤ 8 maddelik parçalara bölünür.

Bu skill'e özgü ek kurallar:

- **Zip numarası** sayfada yazmaz; görev metninden alınır ve satıra öyle yazılır.
- **Ortak tarayıcı kaydı.** Önizleme verisi (`vh-*` anahtarları) sekmeler ve çalışanlar arasında ortaktır ve yolculuğu değiştirir: `vh-mahal` ana sayfa kapağını başka sekmeyle açar, `vh-liste` ve sepet sayaçları dolu gelir, her arama `vh-son-arama` listesinin başına eklenir. Başlarken `vh-mahal`, `vh-liste`, `vh-kiyas`, `vh-son-arama`, sepet (`venthub-cart`), `vh-oturum`, `vh-model-gorunum`, `vh-dil` ve `vh-onizleme-serit-gizli` değerlerini oku, rapora "başlangıç durumu" diye yaz; değiştirdiğin her kaydı bitişte başlangıç değerine aynen geri koy ve okuyarak doğrula. Hiçbir `vh-*` kaydını silme. `vh-son-arama` 8 kayıtla sınırlıdır, yeni arama eskisini iter: başlangıç dizisinin tamamını rapora yaz. Aynı anda başka çalışan koşuyorsa kayıtları o da değiştirir; bitişte "benim değişikliğim" ile "başkasının" farkını ayrı yaz.
- **Ana sayfa durumu.** Kapak önce iframe adresindeki `mekan` değerinden ve sekmeye özel `sessionStorage` `vh-mekan` kaydından okunur, `vh-mahal` ancak sonra. Mekân çipine basmak ikisini de yazar; `vh-mahal` ile ölçeceksen önce adresten `mekan`'ı kaldır (`history.replaceState`) ve `vh-mekan`'ı temizle.
- **Ölçüm ayarını aynı çağrıda geri al.** `#cer` çerçevesine genişlik ya da yükseklik verdiysen aynı `javascript_tool` çağrısının sonunda `width/height/maxWidth/maxHeight/flex` değerlerini `''` yap. Bırakılan ayar Recep'in ekranında sahte bulgu üretir (25 Kasım: 1285x520 bırakıldı, kapak taşması "canlıda" sanıldı).
- **Yeni kare kuralı.** Genişlik, Mobil 390, dil, kip, yakınlaştırma ya da kare boyutu (ör. 718 → 662; önizleme çubuğu açılınca iframe 734 → 673) değişince yeni ekran görüntüsü al; eski karenin koordinatıyla tıklama. Kare 1568, iç genişlik 1604 çıkarsa DOM koordinatını tıklamadan önce ×0,9776 ölçekle.
- **Sekmeyi kapatırken** `navigate` `about:blank`'i reddeder; `javascript_tool` ile `location.replace('about:blank')` kullan.
- **Arama gönderimi.** Yaz, 2 sn bekle, sonra Enter; beklemeden Enter aramayı göndermez ve sonraki yazım eski metne eklenir.
- **Basılmayan düğmeler.** Gönder, Siparişi ver, Ödemeye geç (ödeme Onay adımının son düğmesi; ödeme yöntemine göre adı değişir), Öde, Onayla, Sil, Hepsini seç, Çıkış yap, Belge iste. Sepet çekmecesindeki "Siparişi tamamla →" yalnız ödeme sayfasını açan gezinti düğmesidir, basılabilir. Senaryo basılmayan düğmenin göründüğü ekranda biter; düğmenin görünmesi ve etkin olması kanıttır. Gönderim sonrası hata yeri bu yüzden ölçülemez; SÜRTÜNME alanına `gönderim hatası ölçülemedi` yaz.
- **Gerçek kişi verisi yazılmaz.** Formda `DENEME-<tur>` adı, `ornek@gmail.com` gibi örnek değer kullan.
- **Önizleme çubuğu.** Üstteki önizleme çubuğu varsayılan gizlidir, "⌄" düğmesiyle açılır ve "⌃" ile kapanır (`vh-onizleme-serit-gizli` değerini geri yazmak çubuğu kapatmaz, bitişte ⌃ ile kapat); çubuktaki sayfa adı ("Ana sayfa") düğme değil etikettir. Dil, kip ya da genişlik değişince açık sayfa yerinde kalır: senaryoyu başlatmak için "‹ Listeye dön" ile Sayfalar listesine dön ve Ana sayfa kartını aç.
- **Kaydırma.** 1568'de `contentWindow.scrollTo` çalışır. 390'da sayfa iç kaydırıcıdadır (`document.scrollHeight` pencere boyu kadar çıkar), `scrollTo` çalışmaz: fare tekerleğiyle (`computer scroll`) kaydır; her kaydırma tam boy kare döndürür, gereğinden fazla kaydırma bağlamı doldurur.
- **İç içe çerçeve.** Kıyas çekmecesi `#cer` içinde ikinci bir iframe'dir (`name=vh-kiyas`); ölçüm `contentDocument.querySelector('iframe')` üzerinden yapılır.
- **Kip.** Teklif ve satış kipi önizleme sayfasındaki `kip` seçicisinden ya da adres parametresinden gelir; satırdaki KİP alanına ölçülen kipi yaz.

## Sekiz sabit senaryo

Her senaryonun başlangıcı, hedef ekranı ve "tamam" ölçütü sabittir. Tamamlama **ajanın beyanından değil, ulaşılan ekrandan** okunur: hedef ekranın başlığı ve ayırt edici öğesi karede görünmüyorsa senaryo tamam değildir.

| No | Kullanıcının işi | Başlangıç | Tamam sayılan ekran | Basılmaz |
|---|---|---|---|---|
| S1 | Ana sayfadan bir ürün türüne, oradan seriye, oradan tek modele inmek | Ana sayfa | Model sayfası: model adı başlıkta, model kodu ve teknik değer tablosu ekranda (ilk karede değilse kaydırınca; hangisi olduğunu yaz) | — |
| S2 | Model sayfasından seriye geri dönmek, sayfa sonuna inip alt bilgi, iletişim ve yasal bağlantıları bulmak | S1'in model sayfası | Seri sayfası açık; alt bilgide iletişim ve en az bir yasal metin bağlantısı görünür ve açılır | — |
| S3 | Bilinen bir model kodunu aramak; ayrıca sonuçsuz bir arama yapmak | Ana sayfa arama kutusu | Kodun model sayfası açık; sonuçsuz aramada boş durum ekranı ve bir çıkış yolu (öneri, iletişim, tüm ürünler) görünür | — |
| S4 | Hesapla ile bir ihtiyaçtan (hacim, debi) uygun ürüne ulaşmak | Üst menüde Hesapla | Hesap sonucundan açılan bir seri ya da model sayfası **ve** o ürünün debisi hesaplanan debiyi karşılıyor; karşılamıyorsa DURUM `yarım`, iki değer TAKILMA'ya yazılır | — |
| S5 | Bir modelin teknik föyünü ya da CAD dosyasını bulmak | Ana sayfa | Föy ya da CAD bağlantısı görünür ve hangi dosya olduğu yazılı (indirme yapılmaz). Dosya yok, yalnız "Belge iste" varsa DURUM `yarım`, TAKILMA'ya `veri yok: Belge iste` ve dosya bağlantısı sayısı yazılır | İndir, Belge iste |
| S6 | İki seriyi karşılaştırmak | Lineo seri sayfası, ikinci seri CA ES (aynı tür) | Karşılaştırma ekranında iki seriden birer model yan yana, "Ürün" satırında iki seri adı ve ortak satırlar okunur; seri düzeyinde kıyas yoksa TAKILMA'ya yaz | — |
| S7 | Teklif listesine ürün ekleyip teklif formunun son adımına gelmek | Bir model sayfası (teklif kipi) | Formun son adımı: Gönder düğmesi görünür ve etkin | Gönder |
| S8 | Satış kipinde sepete ekleyip ödeme girişine gelmek | Fiyatlı model sayfası (satış kipi; örnek VRT-17144 Lineo 100, VRT-11201 fiyatsızdır) | Ödeme sayfası açık, özet görünür; formun Onay adımında son düğme ("Siparişi ver" ya da "Ödemeye geç") görünür ve etkin. TIK iki parçadır: `3 (sayfa) / 12 (son düğme)` | Siparişi ver, Ödemeye geç |

**Düzeyler.** Sitede dört katalog düzeyi vardır: tür (Banyo Fanları), seri ("Punto serisi"), ürün ("PUNTO") ve model (VRT-11201). Aynı ad birden çok düzeyde geçebilir; ADIM alanında her ekranın düzeyini köşeli parantezle yaz (`Punto [seri, 111 model]`, `PUNTO [ürün, 47 model]`). Bir düzey atlanıyorsa bunu da yaz; düzey etiketi olmadan satırlar zipler arası kıyaslanamaz.

S1 ve S3 ayrıca **EN** dilinde ve **390** genişlikte de yürütülür (her biri ayrı satır). Diğerleri görev metni istemedikçe TR ve 1568'dedir.

S3'te sonuçsuz aramaya ek olarak bir **gerçekçi en kötü girdi** dene (break-ui ilkesi: saçma değil, gerçek kullanıcının yazacağı): küçük harf ve boşluklu kod (`vrt 11201`), Türkçe karakterli tür adı (`banyo fanı`, `ısı geri kazanım`). Uydurma uzun metin bulgu sayılmaz. S3 satırında TIK iki parçadır: `2 (kod) + 2 (sonuçsuz)`; arama kutusuna dokunmak bir tık, öneriye basmak ya da Enter bir tıktır. En kötü girdileri ve sonuçlarını ADIM alanına yaz. EN dilinde Türkçe terimin sonuç vermemesi bulgu değil gözlemdir; EN terimiyle de sonuç yoksa bulgudur.

Görev metni senaryo için örnek veri vermezse: S1 ve S3'te ilk görülen tür ve bilinen bir Vortice model kodu (ör. Punto serisinden), S4'te 20 m² banyo, S6'da aynı türden iki seri. Seçilen örneği satıra yaz ki sonraki zip aynı örnekle ölçülsün.

## Yürütme

1. Senaryoyu başlangıç ekranından yürüt; her tıklamadan sonra kare al ve o adımın beklenen ekranına gelindiğini karede doğrula (adım başına durum doğrulaması; gelinmediyse sonraki adıma geçme, takılma yaz). **TIK** sayımı: kullanıcının yaptığı her tıklama, dokunma ve arama gönderimi birdir; kaydırma sayılmaz. Sayfa içi atlama düğmesi ("Modeller ↓") bir tık sayılır; kaydırarak aynı yere gelinebiliyorsa ÖNERİ alanına "kaydırarak n" yaz. Form alanına odaklanmak için dokunmak bir tıktır. Çıkmaz yola girdiysen TIK'a toplamı yaz, en kısa yolu ayrıca belirt (`6 (>4), en kısa 3`). Hedef ≤ 4.
2. Takıldığın yerde dur ve yaz: hangi ekran, hangi öğe, ne bekledin, ne oldu. Sonra **ikinci deneme** yap. Geçici takılmada (tıklama tutmadı, ekran gelmedi) sayfayı yenile, 2-10 sn bekle, yeni kare al, aynı yolu tekrar dene. Yapısal takılmada (yanlış hedefe giden bağlantı, eksik metin, tutarsız sayı) yolu baştan yürümek gerekmez: bağımsız ikinci kanıt yeter (başka dilde ya da genişlikte aynı nokta, ya da DOM okuması); hangisini kullandığını yaz. İkinci denemede geçerse takılma senin hatandır (eski kare, erken tıklama, iskelet ekran); satırda `AJAN-HATASI-ELENDİ: evet` yaz ve bulgu açma. İkinci kanıt da takılmayı gösterirse bulgudur.
3. Aynı kök nedenden doğan takılmalar **tek bulgu** olur (ör. arama kutusu iki senaryoda aynı sebeple sonuç vermiyorsa bir bulgu, iki senaryoda anılır).
4. Her takılmaya bir NN/g sezgisi bağla (aşağıdaki kodlar). Bağlayamıyorsan `N0` yaz.

## NN/g 10 sezgi kodları

Ölçüt Nielsen Norman Group'un 10 kullanılabilirlik sezgisidir (açık kaynak). Baymard ücretli olduğu için kullanılmaz.

| Kod | Sezgi | Bu sitede tipik örnek |
|---|---|---|
| N1 | Sistem durumunun görünürlüğü | ekleme sonrası bildirim yok, yükleme göstergesi yok |
| N2 | Sistem ile gerçek dünyanın uyumu | teknik jargon, birim karışıklığı |
| N3 | Kullanıcı denetimi ve özgürlük | geri dönüş yok, yanlış adımdan çıkış yok |
| N4 | Tutarlılık ve standartlar | sayaçlar yerden yere farklı, aynı iş farklı yerde |
| N5 | Hata önleme | fiyatlı ürün teklif listesine gidiyor |
| N6 | Hatırlamak yerine tanıma | seçenek gizli, kullanıcı kodu bilmek zorunda |
| N7 | Esneklik ve kullanım verimi | kısa yol yok, tık sayısı > 4 |
| N8 | Estetik ve sade tasarım | ana eylem kalabalıkta kayboluyor |
| N9 | Hatayı tanıma ve kurtarma | sonuçsuz aramada çıkış yolu yok |
| N10 | Yardım ve belgeler | föy/CAD bulunamıyor, yardım bağlantısı yok |

## Satır biçimi

Her senaryo yürütmesi **tek satırdır**; alanlar ` | ` ile ayrılır ve sırası değişmez:

`SENARYO | ZİP/tarih | GEN | DİL | KİP | DURUM | TIK | ADIM | TAKILMA | AJAN-HATASI-ELENDİ | NETLİK-5SN | BİRİNCİL-EYLEM | GÜVEN | SÜRTÜNME | GÖRSEL | ZORLUK | ÖNERİ | ŞİDDET | KARE`

| Alan | İçerik |
|---|---|
| SENARYO | S1-S8, varyant varsa `S1-EN`, `S3-390` |
| ZİP/tarih | zip numarası ve ölçüm tarihi (ör. `19 / 25.11`) |
| GEN | istenen → ölçülen `innerWidth` (ör. `1568 → 1604`, `390`) |
| DİL | TR / EN |
| KİP | teklif / satış |
| DURUM | `tamam` (hedef ekran karede) · `yarım` (hedefin bir kısmı) · `terk` (ulaşılamadı) |
| TIK | sayı; hedef ≤ 4, aşarsa `6 (>4)` |
| ADIM | geçilen ekranların sırası, kısa (ör. `ana › Banyo › Punto › VRT-11201`) |
| TAKILMA | ekran + öğe + ne oldu; yoksa `—` |
| AJAN-HATASI-ELENDİ | `evet` (ikinci denemede geçti, bulgu yok) · `hayır` (ikinci denemede de takıldı) · `—` |
| Not | NETLİK-5SN ve BİRİNCİL-EYLEM senaryonun **başlangıç ekranı** için, GÜVEN **hedef ekran** için yazılır (S2'de seri sayfası ve alt bilgi). |
| NETLİK-5SN | senaryonun ilk ekranında, etkileşimsiz ilk karede sayfanın ne işe yaradığı anlaşılıyor mu: `evet` / `hayır` + başlık yazısı (CRO "değer önerisi netliği") |
| BİRİNCİL-EYLEM | senaryonun bir sonraki adımı için basılacak öğe kaydırmadan görünüyor mu ve tek mi: `görünür` / `kaydırınca` / `yok` + düğme yazısı; aynı karar noktasında 4'ten çok eşit ağırlıklı seçenek varsa `kalabalık (n)` (çalışan bellek ≤4 kuralı). n = ilk karenin görünür alanındaki görünür `a`, `button`, `input`, `[role=tab]` sayısı (`javascript_tool` ile say, genişlik ve yüksekliği yaz: `kalabalık (36 @1604x673)`; önizleme çubuğu açıkken yükseklik düşer) |
| GÜVEN | yolun kritik ekranında (model, form, ödeme) güven öğesi: garanti, iade, iletişim, teslim süresi, marka/sertifika; her öğeye `ilk karede` ya da `kaydırınca` ekle; yoksa `yok` |
| SÜRTÜNME | formu olan senaryoda (S7, S8, S4 girişi) alan sayısı / zorunlu sayısı, gereksiz görünen alan, hata mesajı yeri (hata yerini görmek için bir alana geçersiz değer yazmak serbesttir; sonra eski değeri geri yaz) (ör. `7/5, telefon zorunlu, hata alttaki çubukta`); 7+ alan sürtünme sayılır (CRO form ölçeği); formsuz senaryoda `—` |
| GÖRSEL | yolculuğu etkileyen görsel gözlem (kırık görsel, taşma); puan değil; yoksa `—` |
| ZORLUK | 1 (takılmadan) - 5 (bitirilemez); NN/g kodu ile (ör. `3 N9`) |
| ÖNERİ | kullanıcı etkisi cümlesi; çözüm çizmez, CSS yazmaz |
| ŞİDDET | ağır (iş bitmiyor) · orta (bitiyor ama takılıyor) · hafif (kozmetik) · `—` |
| KARE | `save_to_disk` ile aracın verdiği yol, aynen |

## Rapor

Biçim `panel-gezinme` Rapor bölümüyle aynıdır (başlık, yöntem, özet, madde listesi, denenemeyenler, şaşırılan yerler, bıraktığın durum); bu skill'de madde listesi yukarıdaki satırlardır. Ek olarak:

- Üstte: `ÖLÇÜLEN n/N senaryo, DENENEMEDİ m (sebep)` ve başlangıç durumu (`vh-*` değerleri).
- **Zip × senaryo kıyas tablosu:** satırlar senaryo (varyantlar dahil), sütunlar zip; hücrede `DURUM / TIK`. Önceki zip'in değerleri bir önceki rapordan alınır, yeniden ölçülmez; ilk turda tek sütun olur.
- Sonda: bulgu listesi (kök neden başına bir satır, hangi senaryolarda görüldüğü, NN/g kodu, şiddet).
- **Sezgi puanı (tur başına, senaryo başına değil):** yürütülen senaryoların tamamına bakarak N1-N10'un her birine 0-4 puan ve tek cümle gerekçe ver; gerekçe bir senaryo satırına ve kareye dayanır. Bantlar: 0 = kullanıcı tıkanıyor ya da tahmin ediyor · 1 = çoğu adımda sorun · 2 = kısmi, büyük boşluklar var · 3 = çoğu adım iyi, küçük boşluk · 4 = her adımda sorunsuz. 4 gerçekten kusursuz demektir, "iyi sayılır" değil. Senaryolarda hiç sınanmayan sezgiye puan verme, `sınanmadı` yaz. Toplam yalnız sınananlar üzerinden `puan / (4 × sınanan sayısı)` yazılır (ör. `21/32`); zipler arası kıyas aynı sezgi kümesiyle yapılır. Toplam kıyas tablosunun altına zip sütunu olarak eklenir.

Dosya `C:\tmp\yolculuk-denetimi-zip<n>-<tarih>.md`. Rapor müdüre (TASARIM) döner; Design'a ve OPS'a müdür iletir.

## Çalışan düzeni

Müdür işi parçalara böler (bir çalışana en çok 8 senaryo satırı), her çalışana kendi boş sekmesini (`tabId`) verir; S7 ve S8 listeye/sepete yazdığı için aynı anda tek çalışanda koşar. Görev metnine şu satırlar yazılır: skill dosya yolu (çalışanın çalışma kopyasında `.claude/skills/site-yolculuk-denetimi/SKILL.md`; Skill aracı "Unknown skill" derse `Read` ile aç), basılmayan düğmeler, açık PR dalına push yok, Design'a ve Recep'e yazma yok. Müdür her parçadan 1-2 satırı kendi sekmesinde örnekler; tutmuyorsa parça yeniden koşar.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
