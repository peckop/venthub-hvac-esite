/**
 * BİLGİ MERKEZİ YAZILARI — yayındaki rehber yazılarının içerik kaynağı (karar 92, PR-2).
 *
 * ⚠GEÇİCİ YER, BİLEREK: rehber-yazisi-standard.md R6 yayındaki metni bir DB tablosunda ister
 * (dil başına satır, durum ↔ sha256, ziyaretçi rolü yalnız `yayında` satırı okur). O tablo ayrı bir
 * migration PR'ıdır (kural 13). O gelene kadar yalnız YAYINA ONAYLANMIŞ metin burada durur. R4.8
 * gereği yayından önceki taslak (ör. BLOG'un frekans konvertörü yazısı) onaydan önce BURAYA GİRMEZ
 * — depo PUBLIC; taslak yalnız yerel dalda ön izlenir.
 *
 * ŞU AN BOŞ — karar 121/c (Recep, 2026-09-25): `knowledge.topics`'ten taşınan üç yazı (hava perdesi,
 * otopark jet fan, ısı geri kazanım) "çok kaba bilgiler" diye yayından kalktı. Adresleri geçici (307)
 * yönlendirmeyle liste sayfasına gider (`src/config/bilgiMerkeziYonlendirmeleri.mjs` →
 * `YAYINDAN_KALKAN`); liste sayfası yazı yokken "rehberler hazırlanıyor" boş durumunu gösterir.
 * Aynı adreste yeni yazı eklenince slug `YAYINDAN_KALKAN`'dan AYNI PR'da silinir (test ölçer).
 *
 * BİÇİM: gövde markdown'dır (R6), izinli alt küme `src/lib/bilgiMerkezi/markdown.ts`'te. Site içi
 * bağlantı düz adres DEĞİL kimliktir: `[metin](vh:<tür>/<anahtar>)` (R3; BLOG kapısı
 * `icBaglantiDenetle` ile aynı biçim). Kimlik sayfa üretilirken güncel adrese çözülür; çözülemeyen
 * kimlik derlemeyi DURDURUR. Kaynak listesi olmayan yazıda rakam bulunamaz
 * (INV-BILGI-MERKEZI-ICERIK-1).
 */

export type YaziDili = 'tr' | 'en'

/** Liste kartındaki konu etiketi; görünen ad sözlükte `bilgiMerkezi.konular.<anahtar>`. */
export type YaziKonusu = 'konfor' | 'guvenlik' | 'verimlilik'

export interface YaziMetni {
  /** Adres metni (o dilde). */
  slug: string
  /** Liste kartı ve meta açıklaması. Gövdenin ilk paragrafıyla aynı cevap, tek cümle. */
  ozet: string
  /** Markdown; tek `# ` başlık (H1) ile başlar. */
  govde: string
}

export interface RehberYazisi {
  /** Dilden bağımsız kalıcı kimlik. */
  kimlik: string
  konu: YaziKonusu
  /** ISO tarih (YYYY-MM-DD). */
  yayinTarihi: string
  guncellemeTarihi: string
  /** Ürün kartı olarak basılacak kimlikler (`vh:aile/…`, `vh:model/…`). Fiyat basılmaz (R3). */
  urunler: readonly string[]
  /** Yalnız yazılmış diller. Olmayan dilde sayfa YOKTUR (başka dile düşme yasak, K10). */
  diller: Partial<Record<YaziDili, YaziMetni>>
}

export const YAZILAR: readonly RehberYazisi[] = [
  {
    // BLOG, doğrulanmış metin sha 138df0114e60, gövde sha 1288fb4e48ff (2026-09-25). MEVZUAT
    // mevzuat cümlelerini onayladı. Yayın: karar 120 ve 135 (Recep, 2026-09-25: "yayına girsin, görsel
    // sonradan"); kapak karar 134'e göre kapak şablonu PR'ında eklenecek.
    kimlik: 'frekans-konvertoru',
    konu: 'verimlilik',
    yayinTarihi: '2026-09-25',
    guncellemeTarihi: '2026-09-25',
    urunler: ['vh:aile/danfoss-vlt-hvac-basic-drive-fc-101', 'vh:aile/danfoss-vlt-hvac-drive-fc-102', 'vh:aile/danfoss-vlt-micro-drive-fc-51'],
    diller: {
      tr: {
        slug: 'frekans-konvertoru-nedir',
        ozet: 'Frekans konvertörü, motora uyguladığı gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik bir kontrol cihazıdır.',
        govde: `# Frekans konvertörü nedir, fan ve pompada nasıl seçilir?

Frekans konvertörü, motora uyguladığı gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik bir kontrol cihazıdır [1]. Fan ve pompada hız biraz düşürüldüğünde enerji tüketimi belirgin biçimde azalır: üretici belgesindeki örnekte hızı %20 azaltmak elektrik tüketimini %50 azaltır [2]. Doğru cihaz; besleme gerilimi, güç aralığı, koruma sınıfı, çalışma ortamı ve uygulamanın tork karakteristiği birlikte değerlendirilerek seçilir [1][2].

## Frekans konvertörü nedir?

Frekans konvertörü, motor hızını değiştirebilen ya da yükteki değişime rağmen sabit tutabilen bir kontrol cihazıdır [1]. ABD Enerji Bakanlığı, Europump ve Hydraulic Institute'un ortak pompa rehberine göre elektronik değişken hız sürücülerinin en yaygın biçimi, gerilim kaynaklı ve darbe genişlik modülasyonlu (PWM) frekans konvertörüdür [7]. Danfoss belgelerindeki "FC" kısaltması da "frequency converter", yani frekans konvertörü anlamına gelir [2].

## Nasıl çalışır?

Bir frekans konvertörü dört ana bölümden oluşur: doğrultucu, DC ara devre, evirici ve kontrol birimi [1].

| Bölüm | Görevi |
|---|---|
| Doğrultucu | Şebekedeki 3 fazlı AC gerilimi diyot ya da SCR'larla darbeli DC gerilime çevirir [1] |
| DC ara devre | Endüktör ve kapasitörlerle bu gerilimi dengeler [1] |
| Evirici | IGBT'lerle DC gerilimi, gerilimi ve frekansı değişken AC'ye çevirir [1] |

Evirici, motora giden dalgayı kısa elektriksel darbelerle oluşturur; bu darbelerin tekrarlanma hızına anahtarlama frekansı denir [1]. Anahtarlama frekansı bir dengedir: düşük tutulursa motorda duyulabilir ses oluşur, yüksek tutulursa sürücüde ısı artar [1]. Örneğin Danfoss FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir ve fabrika ayarı 4 kHz'dir [5].

Hızı ayarlamanın temel yolu gerilimi ve frekansı birlikte değiştirmektir (V/Hz kontrolü); sürücü düşük hızlarda da tam tork verebilmek için bu oranı bir eğriye göre ayarlar [1]. Danfoss'un gerilim vektör kontrolü (VVC+), standart V/Hz kontrolüne göre hız ayarı ve yük torku değiştiğinde daha iyi dinamik tepki ve kararlılık sağlar [2][4].

## Fan ve pompada neden kullanılır?

Santrifüj fan ve pompalar orantı yasalarına (benzerlik yasaları) uyar: debi devirle doğru orantılı, basınç devrin karesiyle, güç ise devrin küpüyle orantılıdır [2]. Bu yüzden hızdaki küçük bir düşüş güçte büyük bir düşüş getirir [2]. Üretici belgesindeki örnekte hız anma değerine göre yalnız %20 azaltıldığında debi de %20 azalır, elektrik tüketimi ise %50 azalır [2].

Örnek varsayım: anma hızında 10 kW çeken bir fan düşünelim. Hız %80'e indirildiğinde güç (0,8)³ = 0,51 katına, yani yaklaşık 5,1 kW'a iner [2].

Bu hesap her sistemde aynı sonucu vermez. Aynı pompa rehberi, orantı yasalarını enerji tasarrufu hesabında doğrudan kullanmanın statik basma yüksekliği olan pompa sistemlerinde büyük hatalara yol açabileceğini belirtir [7]. Bu nedenle statik basma yüksekliği olan pompa sistemlerinde tasarruf ayrıca hesaplanmalıdır [7].

Frekans konvertörü, fan ya da pompanın hızını dahili kontrolüyle değiştirerek debiyi, seviyeyi ya da basıncı istenen değerde tutabilir [2].

## Yumuşak kalkış

Büyük motorlarda kalkış akımını sınırlamak için geleneksel olarak yıldız/üçgen yol verici ya da yumuşak yol verici kullanılır; frekans konvertörü kullanıldığında bu ayrı yol vericilere gerek kalmaz [2][1]. Frekans konvertörü motoru kalkındırırken anma akımından fazla akım çekmez [2].

## Değişken tork ve sabit tork

Üretici belgeleri yükleri iki karakteristiğe ayırır: pompa ve fanlar değişken tork (VT), konveyör bantları, deplasmanlı pompalar ve vinçler sabit tork (CT) uygulamasıdır [1]. Değişken tork uygulamalarında tork devrin karesiyle, güç devrin küpüyle değişir ve düşük hızda motor için ek soğutma ya da akım düşürme gerekmez [1]. Sabit tork uygulamalarında motor anma hızının yarısının altında sürekli çalışacaksa ek hava soğutması ya da bu çalışma için tasarlanmış bir motor gerekir [1].

## Seçim: neye bakılır?

- **Besleme gerilimi ve faz sayısı.** FC 51 tek fazlı 200–240 V, üç fazlı 200–240 V ve üç fazlı 380–480 V girişle sunulur [4]. FC 101 üç fazlı 200–240 V, 380–480 V ve 525–600 V girişle üretilir [2].
- **Güç aralığı.** FC 51 gerilim sınıfına göre 0,18 kW ile 22 kW arasında güç sunar [6]. FC 101'in güç aralığı 0,25 kW ile 90 kW arasındadır [2].
- **Koruma sınıfı (IP).** FC 101 IP20 ve IP54 seçenekleriyle, isteğe bağlı kitle IP21 olarak sunulur [3]. FC 51'in gövde koruma sınıfı IP20'dir; kitle IP21 yapılabilir [5].
- **Çalışma ortamı.** Düşük hız, düşük hava basıncı (yüksek rakım), yüksek ortam sıcaklığı, yüksek anahtarlama frekansı ve uzun motor kablosu akım düşürme gerektirebilecek koşullardır; bu durumlarda bir güç boyutu büyük cihaz seçilmesi önerilir [1].
- **Motor kablosu uzunluğu.** Sınır modele göre değişir; örneğin FC 51'de ekranlı kabloda azami 15 m, ekransız kabloda azami 50 m'dir [4].
- **Tork karakteristiği.** Uygulamanın değişken tork mu sabit tork mu olduğu, düşük hızda soğutma ihtiyacını belirler [1].

## Danfoss FC 51, FC 101 ve FC 102 karşılaştırması

| Özellik | FC 51 (VLT Micro Drive) | FC 101 (VLT HVAC Basic Drive) | FC 102 (VLT HVAC Drive) |
|---|---|---|---|
| Güç aralığı | 0,18–22 kW, gerilim sınıfına göre [6] | 0,25–90 kW [2] | Modele göre; ürün sayfasına bakınız |
| Giriş | Tek faz 200–240 V; üç faz 200–240 V ve 380–480 V [4] | Üç faz 200–240 V, 380–480 V, 525–600 V [2] | Modele göre; ürün sayfasına bakınız |
| Koruma sınıfı | IP20; kitle IP21 [5] | IP20, IP54; kitle IP21 [3] | Modele göre; ürün sayfasına bakınız |
| Öne çıkan işlevler | Dahili süreç PI kontrolü, otomatik enerji optimizasyonu [6] | Uyku modu, yangın modu [3] | Yerleşik PID kontrolü, pompa kademeleme [1] |

Bu üç ailenin modellerini [FC 51](vh:aile/danfoss-vlt-micro-drive-fc-51), [FC 101](vh:aile/danfoss-vlt-hvac-basic-drive-fc-101) ve [FC 102](vh:aile/danfoss-vlt-hvac-drive-fc-102) sayfalarında, tüm cihazları [frekans konvertörleri](vh:kategori/frequency-converters) kategorisinde inceleyebilirsiniz.

## HVAC'a özel işlevler

- **Uyku modu.** Debi düşük ya da sıfır olduğunda sürücü enerji tasarrufu için uyku moduna geçer; basınç ayar değerinin altına düştüğünde kendiliğinden yeniden başlar [3].
- **Yangın modu.** Sürücünün kendini korumak için durmasını engeller; merdiven basınçlandırma, otopark egzoz fanları ve duman tahliyesi gibi uygulamalarda fanın çalışmasını sürdürür [3].
- **Yerleşik PID kontrolü.** Kapalı çevrim sistemlerde basıncı, debiyi ya da sıcaklığı korumak için dış kontrol cihazına duyulan ihtiyacı ortadan kaldırır; iki ayrı cihazdan gelen iki geri besleme sinyaliyle çalışabilir [1].
- **Otomatik enerji optimizasyonu.** FC 51'de HVAC uygulamalarında %5–15 enerji tasarrufu sağlar [6].
- **Pompa kademeleme.** FC 102'nin temel kademe kontrolü, değişken hızlı bir pompaya ek olarak sabit hızlı pompaları sırayla devreye alır [1].

FC 102 işlevleri için kaynak olarak kullanılan tasarım kılavuzu 355–800 kW gövdeleri kapsar [1]. Bu yüzden yerleşik PID kontrolünün ve pompa kademelemenin seçtiğiniz güçteki modelde bulunduğunu ürün belgesinden doğrulayın.

## Türkiye'de verimlilik şartı var mı?

AB'nin 2019/1781 sayılı Komisyon Tüzüğü, 1 Temmuz 2021'den itibaren 0,12 kW ile 1000 kW arasındaki motorlarla kullanılan üç fazlı girişli değişken hız sürücülerinin güç kayıplarının IE2 verim düzeyine karşılık gelen en yüksek güç kaybını aşmamasını zorunlu kılar [8]. Tüzük 2021'de (EU) 2021/341 sayılı tüzükle değiştirildi; 24.01.2023 tarihli konsolide metinde sürücülere yönelik IE2 şartı ilk metindeki ifadesiyle yer alır [9].

Türkiye'de elektrik motorları ve değişken hız sürücüleri için çevreye duyarlı tasarım gereklilikleri, Sanayi ve Teknoloji Bakanlığı'nın 28 Nisan 2021 tarihli ve 31468 sayılı Resmî Gazete'de yayımlanan Elektrik Motorlarının ve Değişken Hız Sürücülerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM: 2021/16) ile belirlenmiştir [10]. Tebliğ, 0,12 kW ile 1000 kW arasındaki motorlarla çalışan üç fazlı girişli değişken hız sürücülerini kapsar ve AB'nin 2019/1781 sayılı Komisyon Tüzüğü ile onu değiştiren 2021/341 sayılı tüzük esas alınarak hazırlanmıştır [10]. Tebliğin maddelerinin çoğu 15 Ağustos 2021'de yürürlüğe girmiştir; ilk metindeki 1 Temmuz 2021 tarihi, 29 Haziran 2021 tarihli değişiklik tebliğiyle (SGM: 2021/23) ertelenmiştir [10][12]. Bu nedenle Türkiye'deki başlangıç tarihi, AB tüzüğünün uygulandığı 1 Temmuz 2021'den farklıdır [8][12]. Tebliğ, 1 sayılı Cumhurbaşkanlığı Kararnamesi ile 2010/643 sayılı Bakanlar Kurulu Kararıyla yürürlüğe konulan yönetmeliğe dayanır [10].

## Kurulumda dikkat edilecekler

- Motor kablosundaki hızlı gerilim değişimi (dU/dt), kablonun fazları ile ekranı ve ekran ile toprak arasında kaçak akımlar oluşturur; bu da sürücünün elektromanyetik yayılımını değiştirir [1].
- Şebeke, motor ve kontrol kabloları birbirinden ayrı döşenmelidir; aksi hâlde istenmeyen davranış ya da düşük performans görülebilir [1].
- Sürücüler için elektromanyetik uyumluluk kategorileri (C1–C4) EN/IEC 61800-3 standardında tanımlanır: C1 ve C2 konut ve ofis ortamı, C3 endüstriyel ortam içindir [1]. Standardın güncel baskısı ayarlanabilir hızlı sürücü sistemlerinin EMC gerekliliklerini tanımlar [11].
- Motor yatak akımlarını önlemek için tahrik ucu olmayan tarafta yalıtımlı rulman kullanılması ve sürücü, motor ile tahrik edilen makinenin doğru topraklanması önerilir [1].
- Elektrik çarpmasına karşı kaçak akım koruma cihazı kullanılacaksa besleme tarafında yalnız Tip B cihaz kullanılmalıdır, çünkü sürücü toprak iletkeninde DC akım oluşturabilir [1].
- Sürücü patlayıcı ortama kurulmamalıdır; gerekiyorsa bu alanın dışındaki bir panoya yerleştirilir [1].
- Hava ile soğutma için sürücünün üstünde ve altında üreticinin belirttiği boşluk bırakılmalıdır; yetersiz boşluk aşırı ısınmaya ve performans düşüşüne yol açar [1].

## Güvenlik ve bakım

- Sürücü şebekeden ayrıldıktan sonra da içindeki DC ara devre kapasitörleri yüklü kalabilir; servis öncesi üreticinin belirttiği süre kadar beklenmelidir [1]. Örneğin FC 51'de bu süre M1, M2 ve M3 gövdelerinde 4 dakika, M4 ve M5 gövdelerinde 15 dakikadır [4].
- Sürücü şebekeye bağlıyken motor her an çalışabilir [4].
- Kurulum, devreye alma ve bakım yalnız yetkili ve eğitimli personel tarafından yapılmalıdır [4].
- Toz, elektronik bileşenlerin üzerinde yalıtım katmanı gibi davranarak soğutmayı azaltır; bu yüzden soğutucu ve fanların düzenli olarak tozdan arındırılması önerilir [1].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez; güncel fiyat ürün sayfasında görünür. İki teklif ancak aşağıdaki seçimler aynıysa karşılaştırılabilir, çünkü her biri teklif edilen cihazı ya da kurulumu değiştirir.

- **Güç ve giriş gerilimi.** Aynı aile içinde modeli güç ve gerilim sınıfı belirler; örneğin FC 101 0,25 kW ile 90 kW arasında, üç fazlı 200–240 V, 380–480 V ve 525–600 V girişle üretilir [2].
- **Koruma sınıfı ve kitler.** FC 101 IP20 ya da IP54 gövdeyle sunulur; IP21 isteğe bağlı bir kitle sağlanır [3].
- **Montaj yerinin koşulları.** Yüksek ortam sıcaklığı, yüksek rakım, yüksek anahtarlama frekansı ya da uzun motor kablosu akım düşürme gerektirebilir; bu durumlarda bir güç boyutu büyük cihaz seçilmesi önerilir [1].
- **Elektromanyetik uyumluluk kategorisi.** EN/IEC 61800-3'e göre C1 ve C2 konut ve ofis ortamı, C3 endüstriyel ortam içindir [1]. Teklifteki cihazın, kurulacağı ortamın kategorisine uyduğuna bakın.
- **Kurulum kalemleri.** Toplam maliyete cihazın yanında kurulum da girer: motor kablosunun türü ve uzunluğu (FC 51'de ekranlı kabloda azami 15 m, ekransız kabloda azami 50 m [4]), kaçak akım koruması kullanılacaksa besleme tarafındaki Tip B cihaz [1] ve şebeke, motor ve kontrol kablolarının ayrı döşenmesi [1].

## İzlenecek yol

1. Uygulamanın değişken tork mu sabit tork mu olduğunu belirleyin [1].
2. Besleme gerilimine ve güç aralığına uygun aileyi seçin [2][4].
3. Montaj yerinin sıcaklık, rakım ve kablo uzunluğu koşullarını kontrol edin; gerekiyorsa bir üst güç boyutunu seçin [1].
4. Ortama uygun koruma sınıfını belirleyin [3][5].
5. Kurulumu elektromanyetik uyumluluk ve topraklama kurallarına göre planlayın [1].
6. Pompa sistemlerinde enerji tasarrufu hesabında statik basma yüksekliğini göz önüne alın [7].

## Sık sorulan sorular

### Frekans konvertörü ile inverter aynı şey mi?

Frekans konvertörü, elektronik değişken hız sürücülerinin en yaygın biçimidir [7]. Evirici (inverter) ise cihazın içinde DC gerilimi değişken AC'ye çeviren bölümün adıdır [1].

### Frekans konvertörü ne kadar enerji tasarrufu sağlar?

Tasarruf uygulamaya bağlıdır. Fan ve pompada hızı %20 azaltmak, üretici örneğinde elektrik tüketimini %50 azaltır [2]. FC 101 seçim kılavuzu da değişken tork uygulamalarında bu oranı tipik değer olarak verir [3]. Statik basma yüksekliği olan pompa sistemlerinde gerçek tasarruf ayrıca hesaplanmalıdır [7].

### Frekans konvertörü motorda ses yapar mı?

Anahtarlama frekansı düşük tutulursa motorda duyulabilir ses oluşur; yüksek tutulursa sürücüde ısı artar [1]. FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir [5].

### Yangın anında sürücü fanı durdurur mu?

FC 101'in yangın modu açıldığında sürücü kendini korumak için durmaz; kontrol sinyallerine, uyarılara ya da alarmlara bakmadan fanın çalışmasını sürdürür [3].

### Türkiye'de frekans konvertörleri için verimlilik şartı var mı?

Evet. AB tüzüğüne göre 1 Temmuz 2021'den beri üç fazlı girişli değişken hız sürücülerinin güç kayıpları IE2 sınırını aşmamalıdır [8]. Türkiye'de bu sürücüler, AB tüzüğü esas alınarak hazırlanan ve 28 Nisan 2021 tarihli Resmî Gazete'de yayımlanan Tebliğ'in kapsamındadır [10]; tebliğin sürücülere yönelik şartı değişiklik tebliğiyle 15 Ağustos 2021'den itibaren uygulanır [12].

### Doğru teklif için hangi bilgileri paylaşmalıyım?

Teklifin doğru cihaza dayanması için motorun gücü, besleme gerilimi ve faz sayısı [2][4], uygulamanın değişken tork mu sabit tork mu olduğu [1], montaj yerinin sıcaklığı ve rakımı ile motor kablosunun uzunluğu [1] ve istenen koruma sınıfı [3][5] gerekir. Bu bilgilerle aynı özellikteki cihazlar karşılaştırılabilir.

## Kaynaklar

1. Danfoss A/S, VLT® HVAC Drive FC 102 Design Guide, MG16Z102 (355–800 kW gövdeler), 2017.
2. Danfoss A/S, VLT® HVAC Basic Drive FC 101 Design Guide, MG18C822, 2018.
3. Danfoss A/S, VLT® HVAC Basic Drive FC 101 Selection Guide, AD449962666883en.
4. Danfoss A/S, VLT® Micro Drive FC 51 Design Guide, MG02K202.
5. Danfoss A/S, VLT® Micro Drive FC 51 Operating Guide, AQ276736419659en, 2021.
6. Danfoss Drives, VLT® Micro Drive FC 51 Fact Sheet, 2019.
7. U.S. Department of Energy, Europump, Hydraulic Institute, Variable Speed Pumping — A Guide to Successful Applications, Executive Summary, 2004. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/variable_speed_pumping.pdf (erişim 24.09.2026)
8. Avrupa Komisyonu, Commission Regulation (EU) 2019/1781, EUR-Lex. https://eur-lex.europa.eu/eli/reg/2019/1781/oj (erişim 24.09.2026)
9. EUR-Lex, 2019/1781 sayılı Tüzüğün konsolide metni (24.01.2023). https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02019R1781-20230124 (erişim 24.09.2026)
10. T.C. Resmî Gazete, 28.04.2021, Sayı 31468, Elektrik Motorlarının ve Değişken Hız Sürücülerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM: 2021/16). https://www.resmigazete.gov.tr/eskiler/2021/04/20210428-2.htm (erişim 24.09.2026)
11. IEC, IEC 61800-3:2022 Adjustable speed electrical power drive systems — Part 3: EMC requirements (kapsam sayfası). https://webstore.iec.ch/en/publication/65056 (erişim 24.09.2026)
12. T.C. Resmî Gazete, 29.06.2021, Sayı 31526, Elektrik Motorlarının ve Değişken Hız Sürücülerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM: 2021/16)'de Değişiklik Yapılmasına Dair Tebliğ (SGM: 2021/23). https://www.resmigazete.gov.tr/eskiler/2021/06/20210629-12.htm (erişim 25.09.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Yazıdaki tasarruf oranları üretici belgelerindeki örneklerdir; kendi sisteminizdeki sonuç farklı olabilir ve ölçülmüş işletme verisiyle hesaplanmalıdır. Kurulum, devreye alma ve bakım yetkili ve eğitimli personel tarafından yapılmalıdır. Yasal şartlara ilişkin bilgiler yayın tarihindeki resmî metinlere dayanır; uygulamadan önce güncel metin kontrol edilmelidir.
`,
      },
    },
  },
]

/** O dilde yazılmış yazılar, yeniden eskiye (R3 liste sayfası). */
export function dildekiYazilar(dil: YaziDili, yazilar: readonly RehberYazisi[] = YAZILAR): RehberYazisi[] {
  return yazilar
    .filter((y) => y.diller[dil])
    .slice()
    .sort((a, b) => (a.yayinTarihi < b.yayinTarihi ? 1 : a.yayinTarihi > b.yayinTarihi ? -1 : a.kimlik < b.kimlik ? -1 : 1))
}

/** Adres metninden yazı; o dilde yoksa `null`. */
export function yaziBul(dil: YaziDili, slug: string, yazilar: readonly RehberYazisi[] = YAZILAR): RehberYazisi | null {
  return yazilar.find((y) => y.diller[dil]?.slug === slug) ?? null
}
