# TASARIM defteri: yüzey gözlemi (müşteri sitesi ve kiracı paneli)

Sahibi: TASARIM · Son doğrulama: 2026-11-20 · Cetvel: `docs/standards/departman-defter-standard.md` · Kaynak: TSR-29 (kayıt), TSR-21, TSR-23, OPS-335, OPS-336, OPS-337, OPS-338

**Kapsam.** Design projesinin yayınladığı iki yüzeyin görsel ve işlev gözlemi: müşteri sitesi (SiteShell, `onizleme.venthub.com.tr`) ve kiracı paneli (PanelShell, ERP). Gözlemi TASARIM yapar (gerçek Chrome, kod okunmaz, kayıt silinmez); düzeltme Design'dadır, bu defter düzeltme yazmaz. Defter bir **tazelik haritasıdır**: hangi ekran ne zaman ölçüldü, hangi bulgu açık, ne zaman yeniden ölçülür.
Kapsam dışı: canlı sitenin kendisi (eski vitrin; GEO-SEO ve URUN ölçer), kurumsal belge şablonlarının içeriği (sahibi Kurumsal Belgeler projesi; yalnız durum satırı burada), ürün verisi (KATALOG).

> **KURAL (ölçüm tazeliği).** Satır "geçti" ve ölçüm tarihi tazeyse (varsayılan eşik: Design o yüzeyi yeniden yayınlayana kadar ya da 14 gün) yeniden ölçülmez. Yeniden ölçüm yalnız (a) satırda açık bulgu varsa, (b) Design "düzeltti" dediyse, (c) eşik aşıldıysa yapılır. Her tur sonunda defter güncellenir; güncellenmeyen tur bitmiş sayılmaz.

Okuma notları (2. bölüm için). Tarihler 2026'dır. Durum: **geçti** = ilk ölçümde açık bulgu yok · **yeniden ölçüldü geçti** = Design düzeltmesinden sonra ölçüldü, kapandı · **Design'a gitti** = bulgu bir Design paketine girdi (düzeltme sonucu henüz ölçülmedi ya da yeniden ölçümde sürdü) · **Design düzeltti** = Design "hazır" dedi, yeniden ölçüm bekliyor · **açık** = bulgu var, Design paketine henüz girmedi · **ölçülmedi** = hiç ölçülmedi. Bulgu sayıları ağır / orta / hafif sırasıyla; sınıf: ağır = ana akış bozuk, yanlış sonuç ya da tutar, sayfa açılmıyor; orta = yanıltıcı metin, eksik içerik, ham anahtar, erişilebilirlik adı; hafif = boyut, görsel, küçük etkileşim; sınıflama TASARIM'ındır. † = son ölçümden beri yeniden ölçülmedi. Tur kısaltmaları: ST1 = site tur 1 (19 Kasım), YO = yeniden ölçüm (20 Kasım), KA = kalan ölçüm A ve B (20 Kasım), T27 = tur 27 (19 Kasım). **Depo dışı ayrıntı:** kare adları, ham rapor adları, bulgu metinleri ve deneme kayıtları TASARIM'ın depo dışı arşivinde "gözlem defteri" klasöründe durur; bu belgeye yol yazılmaz.

## 1 Ne yaptık

| Tarih | İş | Sonuç | Kart |
|---|---|---|---|
| 2026-11-20 | Görsel inceleme turu (site-gorsel-inceleme skill'iyle ilk koşu): site 21 şablon, panel 8 ekran masaüstü ve 6 ekran 390 px; ilk 5 saniye, hiyerarşi, boşluk, tutarlılık, kontrast, odak, 44 px, duyarlılık | Ağır 6 (mobil menüde odak tuzağı, Seri model satırında teklif düğmesi yok, Karşılaştır başlık sabit değil ve grafik eğrileri aynı renk, panel alt çubuğunda "D" harfi, mobil geçişte konum sıfırlanması, mobil liste satırı tıklaması şüphesi), orta yaklaşık 35, hafif yaklaşık 30; 3 ve altı puanlı yerler Design'a çizimle seçenek listesinde; Design paketine girmedi (OPS özeti bekliyor) | TSR-28 |
| 2026-11-20 | Yeniden ölçüm: Design'ın 19 Kasım paketinden sonra panel ve site, madde 1-8 (parça 1) ve 10-13, 15, EK A-C (parça 2); kalan ölçüm A (teklif onayı, durum ekranları, açılış ham anahtarı, basma alanı, kıyas çubuğu) ve B (bayi başvurusu, taslak Önizle, iş emri bildirimi, Taleplerim, üst çubuk) | p1: geçti 3 · kısmen 3 · kaldı 2; p2: geçti 3 · kısmen 4 · ölçülemedi 1 (16 hüküm); kalan ölçüm A (8 hüküm): geçti 1 · kısmen 1 · kaldı 4 · ölçülemedi 2; kalan ölçüm B (5 hüküm): geçti 1 · kısmen 1 · kaldı 2 · ölçülemedi 1 | OPS-338 |
| 2026-11-19 | Site tur 1 (önizleme sitesi, TR ve EN, 1604 ve 390 px): p1 menü, gezinti, ürün zinciri, arama, markalar; p2 form, teklif onayı, belgeler, rehber, hesapla, destek, 390 px ve yavaş bağlantı | p1 15 hüküm: geçti 6 · kısmen 7 · kaldı 1 · ölçülemedi 1; p2 20 hüküm: geçti 11 · kısmen 5 · kaldı 3 · ölçülemedi 1; 15 başlıklı tek Design paketi çıktı | OPS-336, OPS-337 |
| 2026-11-19 | Tur 27 (30 madde + tevkifat + KDV istisna kodu + rehber tarihi) ve aynı gün yeniden ölçüm (10 madde) | Tur 27: geçti 20 · kısmen 9 · geçmedi 1 (Design'a 11 açık); yeniden ölçüm: geçti 9 · kısmen 1; on açığın dokuzu kapandı | OPS-335 |
| 2026-11-18 | Tur 23, 24, 25 ve tur 26 ölçümü (panel: şablon adı, ürün kartı, bildirim türleri, Raporlar, sayfa yardımı 32/75 sayfa, alan "?" 15/21, sayım, toplu tahsilat ve ödeme, teknisyen ata, iş emri sorusu) | Design'a 22 madde (ağır 4 · orta 9 · küçük 9) + yeni sitede rehber tarihi; tur 26: açık 8 · geçti 18 kalem · ölçülemedi 6 kalem (aracın sınırı: yerel açılır liste) | kart no raporda yok |
| 2026-11-16/17 | Tur 16-22. 16: 6 madde (geçti 1, kısmen 1, kaldı 2, puan 2); 17: 2 madde (geçti 1, kısmen 1); 18: 12 madde (geçti 7, kısmen 3, ölçülemedi 2, kaldı 1 ağır: taslak irsaliye çökmesi); 19: 10 madde (geçti 6, kısmen 2, kaldı 1, ölçülemedi 2; çökme kapandı); 20: 8 madde (geçti 4, kısmen 2, kaldı 2); 21: 5 madde (geçti 3, kısmen 2, ölçülemedi 1; ağır yeni: Teklifler satır işaretleme çökmesi); 22: kalan 5 madde (geçti 3, kısmen 1, kaldı 1; çökme kapandı) | Açık ağır kusur 0 (tur 22 sonu); sayılar raporlardaki yazıldığı gibi alındı | kart no raporda yok |
| 2026-11-16/17 | Tasarım gözlemi (TSR-23): 3 parça, 24 ekran, 1-5 puan (kabuk ve menü, yerleşim, tutarlılık, kolaylık, göz akışı); 3 ve altı puanlı yerler Design'a çizimli seçenek için | 10 konu tur 23 notuna girdi (ürün kartı boş durumu, Ayarlar kabuğu, Cariler, Stok durumu, Projeler, Tahsilat girişi, başlık düğme kalıbı, Cari kartı kutuları, Satış ayarları, hesap menüsü) | TSR-23 |
| 2026-11-14/16 | TSR-19/20/21: tur 13 (15 madde: geçti 9 · kısmen 4 · ölçülemedi 2), tur 14 (11 madde: geçti 9 · kısmen 2; raporu arşivde yok, sayı kapsam tablosundan), tur 15 (8 madde: geçti 5 · kaldı 2 · bilgi 1); panel tek takip tablosu kuruldu (87 sayfa: açık 25 · geçti 39 · ekranda görülmedi 23) | Açık ağır kusur 6 → 1 (tur 15) → 0 (tur 16); TSR-19 ve TSR-20 için ayrı kaynak rapor bulunamadı | TSR-19, TSR-20, TSR-21 |

## 2 Envanter

**2a. Müşteri sitesi** (satır = şablon; 22 satır; hiçbiri hiç ölçülmemiş değil; Teklif onayı ve 404/Durum satırlarının son ölçümde ölçülemeyen parçası Design'a soru olarak durur)

| Ekran | Son ölçüm | Açık (a/o/h) | Durum | Tur | Sonraki ölçüm | Dayanak |
|---|---|---|---|---|---|---|
| Ana sayfa (menü, arama, alt bilgi, duyuru şeridi, mobil alt sekme) | 2026-11-20 | 0/0/3 | Design'a gitti; YO ve kalan ölçüm A: duyuru şeridi (Nasıl çalışır, ×) basma alanı 36 px (4 px altı Menü'yü açıyor), Ana arama düğmesi 40 px; açılışta ham anahtar yalnız mobil EN'de 1 örnek, ≤235 ms (önbellek sıcak) | ST1, YO, KA | Design düzeltti | site-tur1-p1, yeniden-olcum-p1 |
| Ürünler (sihirbaz) | 2026-11-20 | 0/1/2 | Design'a gitti; YO kısmen: toplam 1.164 tuttu, Ticari Fanlar düğmesi 611 ↔ sayfa 586, binlik ayıracı yok, Jet ve Ex-Proof grup kartı fotoğrafsız † | ST1, YO | Design düzeltti | site-tur1-p1, yeniden-olcum-p1 |
| Ürün grubu | 2026-11-20 | 0/0/1 | Design'a gitti; YO kısmen: mobil basma alanı (etkin <43,5 px: 2), katlı "Tüm modeller" bölümü ölçülmedi | ST1, YO | Design düzeltti | site-tur1-p1, yeniden-olcum-p1 |
| Ürün türü | 2026-11-19 | 0/0/2 | Design'a gitti; yeniden ölçülmedi: 3 seri kartı fotoğrafsız †, mobil basma alanı | ST1 | Design düzeltti | site-tur1-p1 |
| Seri | 2026-11-20 | 0/0/2 | Design'a gitti; YO kısmen: ham anahtarlı aria-label kapandı; Debi ve Statik basınç etiketleri girişe odak veriyor (geçti); mobilde kıyas çubuğu satır onay kutusunu örtüyor, Banyo serilerinde fotoğrafsız kart † | ST1, YO, KA | Design düzeltti | site-tur1-p1, yeniden-olcum-p1 |
| Ürün (model) | 2026-11-20 | 0/2/2 | Design'a gitti; YO kısmen: EN birimler ve mobil yapışık çubuk geçti; veri yazımı hatası (Hız Anahtarı); KA kaldı: mobil fotoğraf noktalarına dokunuş komşu noktaya gidiyor, kıyas çubuğu mobilde adet çubuğuna 19 px, masaüstünde varyant düğmesine biniyor | ST1, YO, KA | Design düzeltti | site-tur1-p1, yeniden-olcum-p2 |
| Karşılaştır | 2026-11-20 | 0/0/3 | yeniden ölçüldü geçti (3 model sütunları ve boş durum doğru); küçük: seçimi temizleyince alt bar bayat, bar masaüstünde "Teklif listesine ekle" düğmesini yarı örtüyor, bu sayfada çubuk gereksiz | ST1, YO | eşik 2026-12-04 ya da Design düzeltti | site-tur1-p1, yeniden-olcum-p1 |
| Arama (öneri listesi, sonuç sayfası, Tara kamera) | 2026-11-20 | 1/2/2 | açık: YO'da kaldı. "ısıtıcı" yanlış grubu öneriyor, doğrudan-git sorgularda "bütün sonuçlar" satırı yok, süzgeç çipi yok, boş resimli kart; Tara ekranı geçti | ST1, YO | Design düzeltti | site-tur1-p1, yeniden-olcum-p1, yeniden-olcum-p2 |
| Markalar | 2026-11-19 | 0/0/1 | geçti (mobil basma alanı hafif) | ST1 | eşik 2026-12-03 | site-tur1-p1 |
| Marka | 2026-11-19 | 0/0/0 | geçti | ST1 | eşik 2026-12-03 | site-tur1-p1 |
| Uygulama alanları | 2026-11-19 | 0/0/1 | geçti (mobil basma alanı hafif) | ST1 | eşik 2026-12-03 | site-tur1-p1 |
| Bir Uygulama alanı (Konut, Banyo, ...) | 2026-11-20 | 0/2/1 | Design'a gitti; YO kısmen: mekân görünür ikinci basamak değil, Konut sayfasında "Uygulama alanları" basamağı yok, kök adı "Anasayfa"; EN/TR kökeni düzeldi | ST1, YO | Design düzeltti | site-tur1-p1, yeniden-olcum-p2 |
| Teklif formu | 2026-11-20 | 0/1/3 | Design'a gitti; YO kısmen: ürün akışı ve Taleplerim eşleşmesi geçti; Şehir, Sektör, Projeniz var mı alanında alan altı mesajı yok; ihtiyaç yolunda liste temizlenmiyor; basma alanı | ST1, YO | Design düzeltti | site-tur1-p2, yeniden-olcum-p2 |
| Teklif onayı | 2026-11-20 | 0/3/1 (ST1) | ölçülemedi, Design'a soru: önizlemede örnek teklifi açan yol yok (YO ve KA'da "Teklif bulunamadı"); hüküm konmadı. ST1 bulguları (ret düğmesi yok, "Muhatap" yarım veri, önizleme kodu ekranda) doğrulanamıyor | ST1, YO, KA | Design örnek teklifin açılış yolunu yazınca | site-tur1-p2, yeniden-olcum-p2, kalan-olcum-a |
| Belgeler (İndirme Merkezi) | 2026-11-19 | 0/1/1 | açık: 42 katalogun hepsi "Belge iste" (içerik kararı olabilir), mobil basma alanı | ST1 | Design düzeltti | site-tur1-p2 |
| Rehberler | 2026-11-19 | 0/0/1 | geçti (mobil basma alanı hafif) | ST1 | eşik 2026-12-03 | site-tur1-p2 |
| Yazı | 2026-11-20 | 0/0/1 | yeniden ölçüldü geçti (EN'de "yalnız Türkçe" notu tasarım gereği; tarih okura görünmüyor); JSON-LD ve site haritası `lastmod` önizlemede ölçülemez, canlıda GEO-SEO ölçer | ST1, T27, YO | eşik 2026-12-04 | site-tur1-p2, tur27-w4, yeniden-olcum-p2 |
| Hesapla | 2026-11-19 | 0/0/1 | geçti (basma alanı; 324 → 325 yuvarlama bilgi) | ST1 | eşik 2026-12-03 | site-tur1-p2 |
| Destek | 2026-11-19 | 0/0/2 | geçti (KVKK bağlantısı 18 px; sayfa adı "Teknik destek" ↔ sözlük adı "Destek") | ST1 | eşik 2026-12-03 | site-tur1-p2 |
| İletişim | 2026-11-19 | 0/1/1 | geçti (yanıt süresi iddiası kaynak doğrulaması bekler; basma alanı) | ST1 | eşik 2026-12-03 | site-tur1-p2 |
| 404 / Durum (yükleniyor, hata) | 2026-11-20 | 0/0/1 | 404 geçti (EN'de adres "/tr/…" kalıyor); yükleniyor ve hata ekranları ölçülemedi, Design'a soru: durum seçicisi (parametre) hangisi; hüküm konmadı | ST1, YO, KA | Design durum seçicisini bildirince | site-tur1-p2, yeniden-olcum-p2, kalan-olcum-a |
| Hesabım | 2026-11-20 | 0/2/0 | kısmen ölçüldü: Taleplerim e-postaya göre eşleşiyor, numara + e-posta ile takip çalışıyor (geçti); oturumsuz yüzde cihaz talepleri yolu görünmüyor (Design'a soru); "Teklif al" metni (Design K5 ile çelişir) ölçülmedi †; diğer sekmeler ölçülmedi | ST1, YO, KA | Design düzeltti | site-tur1-p2, yeniden-olcum-p2, kalan-olcum-b |

**2b. Kiracı paneli** (satır = modül ya da ekran grubu; 31 satır, 3 satır ölçülmedi)

| Ekran | Son ölçüm | Açık (a/o/h) | Durum | Tur | Sonraki ölçüm | Dayanak |
|---|---|---|---|---|---|---|
| Kabuk · ilk açılış ve yükleme | 2026-11-20 | 0/0/0 | yeniden ölçüldü geçti (sıfırdan "Ana sayfa" kartı açılışı ayrıca denenmedi) | T27, YO | Design yeniden yayınlayınca | tur27-yeniden-olcum, yeniden-olcum-p1 |
| Kabuk · üst çubuk (?, zil, avatar) | 2026-11-20 | 0/0/1 | Design'a gitti; kaldı: masaüstünde basma alanı 36 px, katman yok (4 px dışı gerçek tık YO'da 7/7, KA'da 12/12 başarısız); mobil 390'da 44 px katman var, geçti | T27, YO, KA | Design düzeltti | tur27-yeniden-olcum, yeniden-olcum-p1, kalan-olcum-b |
| Kabuk · şerit simgeleri, modül girişleri, 390 px kabuk | 2026-11-16 | 0/0/2 | yeniden ölçüldü geçti (hafif †: 390 px Stok kapanış sırası, iskelet ham anahtarı, Teklifler 24 px altı 1) | T13, T16, T18 | Design yeniden yayınlayınca (390 px tarama) | chrome-deneme-rapor-13, -16, -18 |
| Kabuk · Ctrl K ve arama paleti | 2026-11-19 | 0/0/0 | yeniden ölçüldü geçti (kur, döviz, iban, vkn) | T27 | eşik 2026-12-03 | tur27-yeniden-olcum |
| Kabuk · Ayarlar menüsü, avatar menüsü, Ayarlar kabuğu | 2026-11-19 | 0/0/2 | menü yapısı yeniden ölçüldü geçti; Ayarlar kabuğu ve hesap menüsü gözlem puanı 3: Design'a gitti (tur 23 notu), sonucu ölçülmedi | TSR-23, T27 | Design düzeltti | gozlem-parca1, gozlem-parca3, tur27-w2 |
| Kabuk · rol önizleme ve rol görünürlüğü | 2026-11-19 | 0/0/0 | geçti (Depo, Satış, Yönetici, Firma sahibi) | T27 | eşik 2026-12-03 | tur27-w2 |
| Kabuk · yardım "?" ve sayfa yardımları | 2026-11-19 | 0/0/1 | yeniden ölçüldü geçti (Çoğalt yardımı, Görünüm logo satırı, Destek talebi aynı sekmede); "Kur farkı payı" "?" yeri ölçülemedi | T24, T26, T27 | eşik 2026-12-03 | tur24-p1, tur26-p3, tur27-yeniden-olcum |
| Kabuk · zil ve bildirim türleri | 2026-11-18 | 0/0/0 | yeniden ölçüldü geçti (tür kapatınca canlı değişiyor) | T26 | eşik 2026-12-02 | tur26-p1 |
| Masa | 2026-11-16 | 0/0/2 | açık †: görev "Masa'ya düşer" ama "Sıradaki işler" boş; yol satırında "← Teklifler · Masa" | T12, TSR-23 | Design yeniden yayınlayınca | gozlem-parca1, panel-kapsam-tablosu |
| Satış · Teklifler (liste, satır işaretleme, toplu şerit) | 2026-11-18 | 0/0/1 | yeniden ölçüldü geçti (çökme kapandı tur 22, 390 px şerit geçti); hafif †: 24 px altı 1 | T21, T22, T23 | eşik 2026-12-02 | rapor-22, tur23-25-ortak |
| Satış · belge zinciri ve Siparişler (Siparişe çevir, irsaliye, fatura, tahsilat, Çoğalt, iş emri sorusu, proje) | 2026-11-19 | 0/0/1 | yeniden ölçüldü geçti (iş emri bildirimi, Çoğalt yardımı); hafif †: kaynak bağı sipariş ekranında görünmüyor | T19, T26, T27 | eşik 2026-12-03 | rapor-19, tur26-p2, tur27-yeniden-olcum |
| Satış · belge Önizle ve belge içeriği (teklif, sipariş, irsaliye, fatura, e-Arşiv) | 2026-11-20 | 0/0/1 | yeniden ölçüldü geçti (12/12 yolda Kurumsal Belgeler belgesi; künye, banka, Hazırlayan, Teslim); kaydedilmemiş taslakta eski çekmece yok (tam ekran Önizle), künye VKN ve banka satırı taslakta yok; iş emri bildirimi görünür ve role=status | T27, KA | Kurumsal Belgeler panel önizlemesine bağlanınca | tur27-w3, tur27-yeniden-olcum, kalan-olcum-b |
| Kurumsal belge şablonları (15 belge, 8 e-posta; sahibi Kurumsal Belgeler projesi) | 2026-11-18 | 8/0/0 | Design'a gitti (Kurumsal Belgeler projesi); yeniden ölçülmedi | TSR-27 | Kurumsal Belgeler "hazır" derse | yeni-site-gecis defteri 1. bölüm (2026-11-18 satırı) |
| Satış · Satış ayarları, Onay kuralları, şablonlar | 2026-11-19 | 0/0/2 | Design'a gitti (tur 23: sekme çubuğu kayması, boş Koşul kütüphanesi); kur metni ve onay kuralları geçti | T22, T27 | Design düzeltti | gozlem-parca3, rapor-22, tur27-yeniden-olcum |
| Satış · Takip ve Satış özeti | 2026-11-16 | 0/0/0 | geçti | T13, T14 | eşik 2026-11-30 (yeniden yayında) | chrome-deneme-rapor-13 |
| Satış · Projeler ve Proje kartı | 2026-11-17 | 0/0/3 | Design'a gitti (tur 23): seyrek satırlar, sekme kalıbı farkı; Proje kartı başlığı 4/5 geçti | T18, TSR-23 | Design düzeltti | gozlem-parca2, rapor-18 |
| Ön muhasebe · Faturalar (tevkifat, KDV istisna kodu), Muhasebe ayarları, Raporlar, Masraflar, Kasa, Banka | 2026-11-19 | 0/0/0 | yeniden ölçüldü geçti (Kasa seçicisi: kasa hesabı yok, nakit varsayılanı ölçülemedi) | T13, T26, T27 | eşik 2026-12-03 | tur27-w3, tur27-yeniden-olcum |
| Ön muhasebe · Tahsilat ve Ödeme (çekmece, toplu) | 2026-11-18 | 0/0/1 | Design'a gitti (tur 23): "Tahsilat gir" Satış'tan modülü Ön muhasebe'ye çeviriyor; toplu işlemler geçti | T25, TSR-23 | Design düzeltti | tur25-p2, gozlem-parca2 |
| Ürün · Ürün kartı (başlık kutuları, Teknik, Görseller) | 2026-11-18 | 0/1/1 | açık: satış fiyatı etiketinde "KDV hariç/dahil" yok, seri satırında kod araması boş; Teknik ve Görseller sekmeleri geçti | T18, T23-25 | Design düzeltti | tur23-25-ortak, gozlem-parca3 |
| Ürün · Fiyatlar ve Ürünler listesi | 2026-11-17 | 0/0/1 | açık: "Yüzde değişim" yazınca Tutar kutusu güncellenmiyor; hız ve Geri al geçti | T13-T15, T24 | Design düzeltti | chrome-deneme-rapor-15, tur24-p2 |
| Cari · Cariler (liste) ve Cari kartı | 2026-11-17 | 0/1/2 | Design'a gitti (tur 23): Bakiye sütunu yok, boş sütunlar, kutu kesilmesi, "Eksik bilgiler" paneli baskın; sonucu ölçülmedi | T17, T18, TSR-23 | Design düzeltti | gozlem-parca2, gozlem-parca3 |
| Cari · Bayi koşulları, bayi başvuruları, site girişi | 2026-11-20 | 0/0/0 | yeniden ölçüldü geçti (grup adı doğru). Başvuru gönderimi ölçülemedi: sitede başvuru bağlantısı yok, bu kusur değil (Design planı: hesap sırası 3, bkz. 3. bölüm) | T27, YO, KA | Design bayi başvurusunu kurunca | tur27-w4, yeniden-olcum-p1, kalan-olcum-b |
| Stok · Stok durumu, Hareketler, Depolar, Transfer, Stok ayarları | 2026-11-17 | 0/0/3 | Design'a gitti (tur 23): ana eylem belirsiz, sekme ve "Görünümü kaydet" yok, Depo süzgeci boş kutu; Hareketler sayaçları † | T12, TSR-23 | Design düzeltti | gozlem-parca2, panel-kapsam-tablosu |
| Stok · Sayım (başlat, liste, sayacak kişi) | 2026-11-18 | 0/0/1 | yeniden ölçüldü geçti (bozuk tarih reddediliyor); "Sayacak kişi" seçimi ve sayım sonucu ölçülemedi (araç sınırı) | T25, T26 | eşik 2026-12-02 | tur25-p1, tur26-p1 |
| Satınalma · Siparişler, Mal kabul, Öneriler, Tedarikçi teklifleri, Tedarikçiler | 2026-11-16 | 0/0/4 | açık †: kabul edilen/kalan sütunu yok, kesilmiş mal kabulde Alış faturası düğmesi yok, numarasız taslak, iade girişinde tedarikçi sütunu | T12, T24 | Design yeniden yayınlayınca | panel-kapsam-tablosu, tur24-p1 |
| Servis · İş emirleri, Planlama, Cihaz parkı, Bugünkü işler | 2026-11-18 | 0/0/6 | açık †: İş emri adım çubuğunda Servis adımı yok, cihaz adı Cari kartına gidiyor, Seri sütunu yok; Teknisyen ata ve Planlama geçti | T12, T25, T26 | Design yeniden yayınlayınca | panel-kapsam-tablosu, tur26-p2 |
| Mağaza · Görünüm, Site bilgileri, Ödeme ve kargo, Yasal ve arama motoru | 2026-11-19 | 0/0/1 | açık †: "Canlı adres … yok" rozeti açıklamasız; Görünüm yardımı geçti | T12, T27 | Design yeniden yayınlayınca | panel-kapsam-tablosu, tur27-w1 |
| Ayarlar · Firma bilgileri, Numara biçimleri, e-Fatura ve e-Arşiv, Kullanıcılar ve roller | 2026-11-19 | 0/0/0 | yeniden ölçüldü geçti (VKN, TCKN, MERSİS, entegratör doğrulamaları); form yerleşimi gözlem puanı 3 (Ayarlar kabuğu satırında) | T27 | eşik 2026-12-03 | tur27-w2, tur27-w3 |
| Üretim (6 sayfa, Plan) | ölçülmedi | n/a | ölçülmedi: Plan etiketli, sayfa kurulmadı (tur 13'te "henüz kurulmadı" metni görüldü) | — | Design sayfayı kurunca | panel-kapsam-tablosu |
| Plan sayfaları (Servis 2, Ürün 3, Ön muhasebe 4, Mağaza 1, Cari Gruplar, Katalog Setler ve diğer) | ölçülmedi | n/a | ölçülmedi: iskelet; sonradan kurulan Raporlar ve Masraflar yukarıda ayrı | — | Design sayfayı kurunca | panel-kapsam-tablosu |
| Müşteri hizmetleri (4 sayfa, kapalı modül) ve içe aktarma (cari, stok) | ölçülmedi | n/a | ölçülmedi: modül kapalı; dosya seçici araçla sürülemiyor | — | Design modülü açınca; içe aktarma için araç yolu bulununca | panel-kapsam-tablosu |

**2c. Görsel inceleme (skill turu, 2026-11-20).** Satır = bakış; ilk koşu tek geçişte yapıldı, ayrıntı depo dışı arşivde. Tazelik kuralı aynıdır: aşağıdaki açıklar Design paketine girip düzelene kadar bu bakışlar yeniden koşulmaz.

| Bakış | Son ölçüm | Açık (a/o/h) | Durum | Sonraki ölçüm |
|---|---|---|---|---|
| Site: ilk 5 saniye, hiyerarşi, boşluk, tutarlılık (21 şablon) | 2026-11-20 | 2/16/14 | açık; Design'a gitmedi (OPS özeti bekliyor) | Design düzeltti |
| Site: kontrast ve odak (8 şablon hesaplı, kalanı ortak bant) | 2026-11-20 | 1/3/2 | açık: mobil menü odak tuzağı, duyuru bandı odak halkası 1:1, form kenarlığı 1,65:1 | Design düzeltti |
| Panel: yoğunluk, tablo, çekmece, sekme (masaüstü 8 ekran) | 2026-11-20 | 0/10/8 | açık; Design'a gitmedi | Design düzeltti |
| Panel: 390 px (6 ekran) ve alt çubuk | 2026-11-20 | 2/6/4 | açık: "D" harfi, konum sıfırlanması, satır tıklaması şüphesi (390'da yeniden doğrulanacak) | yeniden doğrulama |
| Kurumsal Belge önizlemesi | 2026-11-20 | 0/1/5 | 390 ölçülemedi (sayfa daralmıyor) | ölçülmedi |
| Site: klavye ve odak (14 şablon masaüstü, 3 şablon 390 px) | 2026-11-20 | 0/5/1 | açık: arama paneli odak çıkınca kapanmıyor ve odağı örtüyor, alt bilgi odak halkası 1:1, mobil Ürün sabit alt çubuk odağı örtüyor, menü çekmecesi odağı içeri almıyor ve 7 adsız durak, atlama bağlantısı yok, radyo grupları ayrı durak; Tab ile çıkılamayan yer yok; Design'a gitmedi (ek 2, OPS onayı bekliyor) | Design düzeltti |
| Ölçülmedi: mobil odak örtmesi gerçek telefon yüksekliğinde (önizleme penceresi 616 px) | 2026-11-20 | n/a | ölçülmedi (araç: pencere yüksekliği sabit) | gerçek cihaz ya da yüksek pencerede yeniden |
| Ölçülmedi: 44 px altı öğelerin ::after basma alanı (Gizli seviyeler 14×28, Kodu kopyala 28×28, galeri noktaları 22×44 ve diğerleri) | 2026-11-20 | n/a | ölçülmedi (gerçek tıkla doğrulanmadı) | Design düzeltti ya da gerçek tıkla ayrı ölçüm |
| Ölçülemeyen: Hesabım oturumlu, Teklif onayı geçerli hâl, 404 yükleniyor/hata | 2026-11-20 | n/a | ölçülmedi (kimlik girilmez, örnek teklif yok, durum sayfada yok) | Design'a soru |

## 3 Sırada ve yapılabilecekler

| Madde | Gerekçe | Öncelik | Kart |
|---|---|---|---|
| Design'a gidecek tek paket: yeniden ölçümde açık kalan kalemler (p1 8, p2 7; benzerleri birleşince 12 başlık) + görsel inceleme bulguları | Arama (ağır), model sayısı farkı, basma alanı, konum satırı, teklif formu alan mesajı, teklif onayı örnek bağlantısı, durum ekranları; Design'a toplu gider, Design tek pakette düzeltir | yüksek | OPS-338 |
| Hesap ve bayi başvurusu: Design planında sıra 1 hesap seçenek çizimi (Recep görecek), 2 hesap türleri, 3 bayi başvurusu ve panel onayı; ne zaman? (Design'a soru) | Açık bulgu sayılmaz; sitede başvuru bağlantısı bu yüzden yok, panelde Bayi başvuruları listesi boş durumda | orta | OPS-338 |
| Design'a iki soru: (1) önizlemede Teklif onayı sayfasını örnek teklifle açan yol, (2) Durum sayfasında yükleniyor ve hata ekranını seçen parametre; ayrıca (3) oturumsuz cihaz talepleri yolu var mı | Üçü ölçülemedi; Design yazmadan ölçülemez, hüküm konmaz | yüksek | OPS-338 |
| Görsel inceleme turu: site ve panel her şablon, 1-5 puan + şiddet, kare yoluyla | Mevcut turlar işlev ve ölçüm odaklı; hiyerarşi, hizalama, kontrast, odak ve yerleşim sistemli bakılmıyor; skill'i YETENEK yazıyor | yüksek | TSR-28, YTN-58 |
| Kapsam tablosunda ölçülmemiş ekranlar: Üretim, Plan sayfaları, Müşteri hizmetleri, içe aktarma | Design sayfayı kurmadan ölçülemez; kurulunca ilk tur | orta | — |
| † işaretli panel satırlarını Design yeniden yayınlayınca tek turda yeniden ölçmek (Masa, Satınalma, Servis, Mağaza) | 15 Kasım'dan beri ölçülmedi; kapsam tablosu "34 † açık" diyordu, çoğu hâlâ doğrulanmadı | orta | — |
| Site: bu turda ölçülemeyenler (fotoğraf ve gradyan zeminli metin kontrastı, sol kategori ağacı, mobil EN, arama "lineo" ve model kodu, Hesabım'ın öteki sekmeleri, kamera izin reddi) | Ölçüm eksiği, bulgu değil; tur 2'de kapatılır | orta | — |
| Yavaş bağlantı (Slow 4G) ölçümü | Tarayıcı aracında ağ kısma yok; kısmasız ölçüm: ilk boyama 756 ms, en büyük boyama 1324 ms, iframe toplam ≈ 5,8 MB; kısma ARAC ya da ALTYAPI aracıyla | orta | — |
| Rehber tarihi: önizlemede JSON-LD ve site haritası `lastmod` canlıda ölçülmeli | Önizleme prototipi JSON-LD üretmiyor; kanıt zayıf | orta | TSR-26 (GEO-SEO ölçer) |
| Teklif onayı: mesafeli satış ve cayma metninin B2B teklifteki hukuki doğruluğu | TASARIM ölçmez; MEVZUAT'a gider | orta | — |
| Kategori adları (17 grup, pazar karşılaştırması) için karar kaydı | Öneri raporda var, defterde karar satırı yok | düşük | TSR-24 |
| Deneme kayıtları (önizleme) notu | Kayıtlar yalnız tarayıcı depolamasında, silinmedi; listede önceki turdan 1 ürün duruyor; yeni ölçüm bu verinin üstüne kurulur | düşük | — |

## 4 Kararlar

| Tarih | Karar | Kaynak |
|---|---|---|
| 2026-11-20 | Önizleme sitesi (`onizleme.venthub.com.tr`) ölçüm yüzeyidir; Design Venthub New projesinin açık sekmesinde ölçüm yapılmaz | yeniden ölçüm p1 ve p2 ("Design sekmesine dokunulmadı"), site tur 1 |
| 2026-11-20 | Ölçüm tek sekmede yürür; çalışan kendi açmadığı sekmeye dokunmaz, rapor sekmede bıraktığı durumu (genişlik, dil, kip) yazar | yeniden ölçüm p2 "Şaşırılan yerler" |
| 2026-11-19 | Hesap sırası (Design planı): 1 hesap seçenek çizimi, 2 hesap türleri, 3 bayi başvurusu ve panel onayı; müşteri sitesinde bayi başvurusu bağlantısı bu yüzden yoktur, kusur sayılmaz | Design'ın 19 Kasım kararı (OPS bildirimi) |
| 2026-11-19 | Design Venthub New'e "tek paket" gider; Design düzeltince yalnız o maddeler yeniden ölçülür, geçen maddeler ölçülmez | design-paket-tur27-site1 (Design'a giden paket, 19 Kasım) |
| 2026-11-19 | İade faturası "Belge tipi" listesinde bulunmaz, asıl faturadan "İade faturası aç…" ile açılır (Design'ın kararı; ölçüm hatası sayılmaz) | tur 27 yeniden ölçüm madde 3 |
| 2026-11-19 | Panel modül menüsünde satır adları "Muhasebe ayarları" ve "Stok ayarları"dır, "Ayarlar" değil (Design'a göre bilerek); "Ön muhasebe ayarları" adı kalktı | tur 27 yeniden ölçüm madde 6 |
| 2026-11-19 | Rehber yazısında yayın ve güncelleme tarihi okura görünmez; yapılandırılmış veride tarih yok; site haritası `lastmod` kalır (yazının gerçek güncelleme tarihine bağlı) | tur 23-25 ortak rapor, BLG-87, OPS-332, TSR-26 |
| 2026-11-18 | Yeni belge numaraları tiresiz biçimdedir; eski kayıtlarda tireli biçim bulunur, görünüm karışıktır; biçim Numara biçimleri sayfasından seçilir, belge numarası kararı Kurumsal Belgeler'dedir | tur 26 mesajı madde 8, tur 27 W3 madde 17 |
| 2026-11-18 | Basılı ve PDF kurumsal belgelerin tek kaynağı "VentHub Kurumsal Belgeler" projesidir; panel kopyayı alır, kaydı tek `veri` alanıyla verir | yeni-site-gecis defteri 4. bölüm, OPS-334 |
| 2026-11-18 | Önizleme menü yapısı karar 410'a göre yayınlandı; tasarım ölçümü geçti | yeni-site-gecis defteri 1. bölüm, OPS-329 |
| 2026-11-17 | Tara (kamera) ekranı Chrome'a verilmiş kamera izniyle ölçülür; izin reddi hâli ölçülmedi | yeniden ölçüm p2 EK C |
| 2026-11-17 | Ölçümde deneme kayıtları önizleme verisidir, silinmez; yalnız önizleme tarayıcı depolamasına yazılır, e-posta gitmez | tur 23 isteği (kurallar), site tur 1 p2 |
| 2026-11-15 | Kiracı paneli için tek takip tablosu vardır; "geçti" madde yeniden ölçülmez, tur sonunda 5 dakikalık genel kontrol yapılır (bu defterin kural kutusu bunun devamıdır) | panel kapsam tablosu "Okuma kuralları", TSR-21 |
| 2026-11-09 | Claude Design projesi 14 Aralık 2026'da kapanıyor; içerik ve veri o tarihten önce kalıcı depoya alınır, ölçüm yüzeyi önizleme sitesidir | yeni-site-gecis defteri, OPS-333, OPS-228 |
