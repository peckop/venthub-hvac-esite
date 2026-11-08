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
  /**
   * META AÇIKLAMASI: `<meta name="description">`, `og:description` ve `Article` JSON-LD `description`.
   * Gövdenin ilk paragrafıyla aynı cevap, tek cümle. Hiçbir kartta BASILMAZ (`kartOzeti`).
   */
  ozet: string
  /**
   * KART METNİ — her kart yüzeyi bunu basar: liste kartı ve araması (BilgiMerkeziListe, BilgiMerkeziArama),
   * ana sayfa Bilgi bloğu (KnowledgeBlock), kategori ve aile sayfasının "ilgili rehberler" kartları
   * (tersDizin.ts → IlgiliRehberler) ve yazı altı "ilgili yazılar" (sayfa.ts → RehberYazisiSayfasi).
   * ZORUNLU, `ozet`ten FARKLI ve gövde cümlelerini tekrarlamayan kısa YÖNLENDİRME cümlesi olmalıdır
   * (URN-140; her yüzeyde `data-nosnippet` içinde basılır): kart ile meta açıklaması aynı alandan geliyordu ve tam başlık
   * aramasında yazı yerine liste sayfası görünüyordu (SEO-30). Yazının KENDİ metninden yazılır; gövdede
   * olmayan sayı, marka ya da iddia eklenmez. Kapılar: src/lib/bilgiMerkezi/__tests__/kartOzeti.test.tsx
   * ve kartOzetiYuzeyler.test.tsx.
   */
  kartOzeti: string
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
  /**
   * Gövdede bağlantısı olmayan, ama bu rehbere bağlanacak kategoriler (`vh:kategori/<categories.slug>`;
   * URN-140). Ters dizin (tersDizin.ts) gövdedeki `vh:kategori/…` bağlantılarına bunları ekler; gövdeye
   * dokunmadan kategori sayfasından rehbere yol açar.
   */
  ilgiliKategoriler?: readonly `vh:kategori/${string}`[]
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
    // Güncelleme tarihi 2026-10-14: gövdenin son değişikliği, alt başlıkların yenilenmesi (BLG-13, #1945; 14 Ekim
    // 2026'da birleşti). Liste kartı ve yazı künyesi "Güncelleme" olarak basar; site haritası lastmod'u ve Article
    // `dateModified` buradan. Önceki değerler: 2026-10-10 (URN-90), 2026-10-08 (#1755, "Fiyatı belirleyen etkenler"
    // giriş cümlesi), 2026-10-06 (#1733).
    // Güncelleme tarihi 2026-11-01 (BLG-29): sessiz fan rehberine iç bağlantı eklendi ("Frekans konvertörü motorda ses yapar mı?").
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/danfoss-vlt-hvac-basic-drive-fc-101', 'vh:aile/danfoss-vlt-hvac-drive-fc-102', 'vh:aile/danfoss-vlt-micro-drive-fc-51'],
    diller: {
      tr: {
        slug: 'frekans-konvertoru-nedir',
        ozet: 'Frekans konvertörü, motora uyguladığı gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik bir kontrol cihazıdır.',
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ya da konu listesini tekrarlamaz; yeni iddia, sayı ya da marka yok.
        kartOzeti: 'Konvertör seçimine nereden başlayacağınızı bu rehberde bulun.',
        govde: `# Frekans konvertörü nedir, fan ve pompada nasıl seçilir?

Frekans konvertörü, motorun hızını motora verdiği gerilimi ve frekansı değiştirerek ayarlayan elektronik kontrol cihazıdır [1]. Pompa ve fanda hız biraz düşürüldüğünde enerji tüketimi belirgin biçimde azalır; üretici belgesindeki örnekte hızı %20 azaltmak elektrik tüketimini %50 azaltır [2]. Cihaz seçimi besleme gerilimi, güç aralığı, koruma sınıfı, çalışma ortamı ve uygulamanın tork karakteristiğine bakılarak yapılır [1][2].

Kısaca:

- Çalışma: cihaz doğrultucu, DC ara devre, invertör ve kontrol birimi olmak üzere dört ana bölümden oluşur [1].
- Enerji: santrifüj fan ve pompada küçük bir hız düşüşü güçte büyük bir düşüş getirir [2].
- Tork: pompa ve fanlar değişken tork uygulamasıdır; bu uygulamada düşük hızda motor için ek soğutma ya da akım düşürme gerekmez [1].

Frekans konvertörü, motora uyguladığı gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik bir kontrol cihazıdır [1]. Fan ve pompada hız biraz düşürüldüğünde enerji tüketimi belirgin biçimde azalır: üretici belgesindeki örnekte hızı %20 azaltmak elektrik tüketimini %50 azaltır [2]. Doğru cihaz; besleme gerilimi, güç aralığı, koruma sınıfı, çalışma ortamı ve uygulamanın tork karakteristiği birlikte değerlendirilerek seçilir [1][2].

## Frekans konvertörü nedir?

Frekans konvertörü, motor hızını değiştirebilen ya da yükteki değişime rağmen sabit tutabilen bir kontrol cihazıdır [1]. ABD Enerji Bakanlığı, Europump ve Hydraulic Institute'un ortak pompa rehberine göre elektronik değişken hız sürücülerinin en yaygın biçimi, gerilim kaynaklı ve darbe genişlik modülasyonlu (PWM) frekans konvertörüdür [7]. Danfoss belgelerindeki "FC" kısaltması da "frequency converter", yani frekans konvertörü anlamına gelir [2].

## Frekans konvertörü nasıl çalışır?

Bir frekans konvertörü dört ana bölümden oluşur: doğrultucu, DC ara devre, invertör (İngilizcesi inverter) ve kontrol birimi [1].

| Bölüm | Görevi |
|---|---|
| Doğrultucu | Şebekedeki 3 fazlı AC gerilimi diyot ya da SCR'larla darbeli DC gerilime çevirir [1] |
| DC ara devre | Endüktör ve kapasitörlerle bu gerilimi dengeler [1] |
| İnvertör | IGBT'lerle DC gerilimi, gerilimi ve frekansı değişken AC'ye çevirir [1] |

İnvertör, motora giden dalgayı kısa elektriksel darbelerle oluşturur; bu darbelerin tekrarlanma hızına anahtarlama frekansı denir [1]. Anahtarlama frekansı bir dengedir: düşük tutulursa motorda duyulabilir ses oluşur, yüksek tutulursa sürücüde ısı artar [1]. Örneğin Danfoss FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir ve fabrika ayarı 4 kHz'dir [5].

Hızı ayarlamanın temel yolu gerilimi ve frekansı birlikte değiştirmektir (V/Hz kontrolü); sürücü düşük hızlarda da tam tork verebilmek için bu oranı bir eğriye göre ayarlar [1]. Danfoss'un gerilim vektör kontrolü (VVC+), standart V/Hz kontrolüne göre hız ayarı ve yük torku değiştiğinde daha iyi dinamik tepki ve kararlılık sağlar [2][4].

## Fan ve pompada frekans konvertörü neden kullanılır?

Santrifüj fan ve pompalar orantı yasalarına (benzerlik yasaları) uyar: debi devirle doğru orantılı, basınç devrin karesiyle, güç ise devrin küpüyle orantılıdır [2]. Bu yüzden hızdaki küçük bir düşüş güçte büyük bir düşüş getirir [2]. Üretici belgesindeki örnekte hız anma değerine göre yalnız %20 azaltıldığında debi de %20 azalır, elektrik tüketimi ise %50 azalır [2].

Örnek varsayım: anma hızında 10 kW çeken bir fan düşünelim. Hız %80'e indirildiğinde güç (0,8)³ = 0,51 katına, yani yaklaşık 5,1 kW'a iner [2].

Bu hesap her sistemde aynı sonucu vermez. Aynı pompa rehberi, orantı yasalarını enerji tasarrufu hesabında doğrudan kullanmanın statik basma yüksekliği olan pompa sistemlerinde büyük hatalara yol açabileceğini belirtir [7]. Bu nedenle statik basma yüksekliği olan pompa sistemlerinde tasarruf ayrıca hesaplanmalıdır [7].

Frekans konvertörü, fan ya da pompanın hızını dahili kontrolüyle değiştirerek debiyi, seviyeyi ya da basıncı istenen değerde tutabilir [2].

## Frekans konvertörüyle yumuşak kalkış

Büyük motorlarda kalkış akımını sınırlamak için geleneksel olarak yıldız/üçgen yol verici ya da yumuşak yol verici kullanılır; frekans konvertörü kullanıldığında bu ayrı yol vericilere gerek kalmaz [2][1]. Frekans konvertörü motoru kalkındırırken anma akımından fazla akım çekmez [2].

## Değişken tork ve sabit tork uygulamaları

Üretici belgeleri yükleri iki karakteristiğe ayırır: pompa ve fanlar değişken tork (VT), konveyör bantları, deplasmanlı pompalar ve vinçler sabit tork (CT) uygulamasıdır [1]. Değişken tork uygulamalarında tork devrin karesiyle, güç devrin küpüyle değişir ve düşük hızda motor için ek soğutma ya da akım düşürme gerekmez [1]. Sabit tork uygulamalarında motor anma hızının yarısının altında sürekli çalışacaksa ek hava soğutması ya da bu çalışma için tasarlanmış bir motor gerekir [1].

## Frekans konvertörü seçerken neye bakılır?

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

## HVAC uygulamalarına özel sürücü işlevleri

- **Uyku modu.** Debi düşük ya da sıfır olduğunda sürücü enerji tasarrufu için uyku moduna geçer; basınç ayar değerinin altına düştüğünde kendiliğinden yeniden başlar [3].
- **Yangın modu.** Sürücünün kendini korumak için durmasını engeller; merdiven basınçlandırma, otopark egzoz fanları ve duman tahliyesi gibi uygulamalarda fanın çalışmasını sürdürür [3].
- **Yerleşik PID kontrolü.** Kapalı çevrim sistemlerde basıncı, debiyi ya da sıcaklığı korumak için dış kontrol cihazına duyulan ihtiyacı ortadan kaldırır; iki ayrı cihazdan gelen iki geri besleme sinyaliyle çalışabilir [1].
- **Otomatik enerji optimizasyonu.** FC 51'de HVAC uygulamalarında %5–15 enerji tasarrufu sağlar [6].
- **Pompa kademeleme.** FC 102'nin temel kademe kontrolü, değişken hızlı bir pompaya ek olarak sabit hızlı pompaları sırayla devreye alır [1].

FC 102 işlevleri için kaynak olarak kullanılan tasarım kılavuzu 355–800 kW gövdeleri kapsar [1]. Bu yüzden yerleşik PID kontrolünün ve pompa kademelemenin seçtiğiniz güçteki modelde bulunduğunu ürün belgesinden doğrulayın.

## Üç fazlı girişli frekans konvertörlerinde verimlilik şartı var mı?

AB'nin 2019/1781 sayılı Komisyon Tüzüğü, 1 Temmuz 2021'den itibaren 0,12 kW ile 1000 kW arasındaki motorlarla kullanılan üç fazlı girişli değişken hız sürücülerinin güç kayıplarının IE2 verim düzeyine karşılık gelen en yüksek güç kaybını aşmamasını zorunlu kılar [8]. Tüzük 2021'de (EU) 2021/341 sayılı tüzükle değiştirildi; 24.01.2023 tarihli konsolide metinde sürücülere yönelik IE2 şartı ilk metindeki ifadesiyle yer alır [9].

Türkiye'de elektrik motorları ve değişken hız sürücüleri için çevreye duyarlı tasarım gereklilikleri, Sanayi ve Teknoloji Bakanlığı'nın 28 Nisan 2021 tarihli ve 31468 sayılı Resmî Gazete'de yayımlanan Elektrik Motorlarının ve Değişken Hız Sürücülerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM: 2021/16) ile belirlenmiştir [10]. Tebliğ, 0,12 kW ile 1000 kW arasındaki motorlarla çalışan üç fazlı girişli değişken hız sürücülerini kapsar ve AB'nin 2019/1781 sayılı Komisyon Tüzüğü ile onu değiştiren 2021/341 sayılı tüzük esas alınarak hazırlanmıştır [10]. Tebliğin maddelerinin çoğu 15 Ağustos 2021'de yürürlüğe girmiştir; ilk metindeki 1 Temmuz 2021 tarihi, 29 Haziran 2021 tarihli değişiklik tebliğiyle (SGM: 2021/23) ertelenmiştir [10][12]. Bu nedenle Türkiye'deki başlangıç tarihi, AB tüzüğünün uygulandığı 1 Temmuz 2021'den farklıdır [8][12]. Tebliğ, 1 sayılı Cumhurbaşkanlığı Kararnamesi ile 2010/643 sayılı Bakanlar Kurulu Kararıyla yürürlüğe konulan yönetmeliğe dayanır [10].

## Sürücü kurulumunda dikkat edilecekler

- Motor kablosundaki hızlı gerilim değişimi (dU/dt), kablonun fazları ile ekranı ve ekran ile toprak arasında kaçak akımlar oluşturur; bu da sürücünün elektromanyetik yayılımını değiştirir [1].
- Şebeke, motor ve kontrol kabloları birbirinden ayrı döşenmelidir; aksi hâlde istenmeyen davranış ya da düşük performans görülebilir [1].
- Sürücüler için elektromanyetik uyumluluk kategorileri (C1–C4) EN/IEC 61800-3 standardında tanımlanır: C1 ve C2 konut ve ofis ortamı, C3 endüstriyel ortam içindir [1]. Standardın güncel baskısı ayarlanabilir hızlı sürücü sistemlerinin EMC gerekliliklerini tanımlar [11].
- Motor yatak akımlarını önlemek için tahrik ucu olmayan tarafta yalıtımlı rulman kullanılması ve sürücü, motor ile tahrik edilen makinenin doğru topraklanması önerilir [1].
- Elektrik çarpmasına karşı kaçak akım koruma cihazı kullanılacaksa besleme tarafında yalnız Tip B cihaz kullanılmalıdır, çünkü sürücü toprak iletkeninde DC akım oluşturabilir [1].
- Sürücü patlayıcı ortama kurulmamalıdır; gerekiyorsa bu alanın dışındaki bir panoya yerleştirilir [1].
- Hava ile soğutma için sürücünün üstünde ve altında üreticinin belirttiği boşluk bırakılmalıdır; yetersiz boşluk aşırı ısınmaya ve performans düşüşüne yol açar [1].

## Sürücü güvenliği ve bakımı

- Sürücü şebekeden ayrıldıktan sonra da içindeki DC ara devre kapasitörleri yüklü kalabilir; servis öncesi üreticinin belirttiği süre kadar beklenmelidir [1]. Örneğin FC 51'de bu süre M1, M2 ve M3 gövdelerinde 4 dakika, M4 ve M5 gövdelerinde 15 dakikadır [4].
- Sürücü şebekeye bağlıyken motor her an çalışabilir [4].
- Kurulum, devreye alma ve bakım yalnız yetkili ve eğitimli personel tarafından yapılmalıdır [4].
- Toz, elektronik bileşenlerin üzerinde yalıtım katmanı gibi davranarak soğutmayı azaltır; bu yüzden soğutucu ve fanların düzenli olarak tozdan arındırılması önerilir [1].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez; güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin. İki teklif ancak aşağıdaki seçimler aynıysa karşılaştırılabilir, çünkü her biri teklif edilen cihazı ya da kurulumu değiştirir.

- **Güç ve giriş gerilimi.** Aynı aile içinde modeli güç ve gerilim sınıfı belirler; örneğin FC 101 0,25 kW ile 90 kW arasında, üç fazlı 200–240 V, 380–480 V ve 525–600 V girişle üretilir [2].
- **Koruma sınıfı ve kitler.** FC 101 IP20 ya da IP54 gövdeyle sunulur; IP21 isteğe bağlı bir kitle sağlanır [3].
- **Montaj yerinin koşulları.** Yüksek ortam sıcaklığı, yüksek rakım, yüksek anahtarlama frekansı ya da uzun motor kablosu akım düşürme gerektirebilir; bu durumlarda bir güç boyutu büyük cihaz seçilmesi önerilir [1].
- **Elektromanyetik uyumluluk kategorisi.** EN/IEC 61800-3'e göre C1 ve C2 konut ve ofis ortamı, C3 endüstriyel ortam içindir [1]. Teklifteki cihazın, kurulacağı ortamın kategorisine uyduğuna bakın.
- **Kurulum kalemleri.** Toplam maliyete cihazın yanında kurulum da girer: motor kablosunun türü ve uzunluğu (FC 51'de ekranlı kabloda azami 15 m, ekransız kabloda azami 50 m [4]), kaçak akım koruması kullanılacaksa besleme tarafındaki Tip B cihaz [1] ve şebeke, motor ve kontrol kablolarının ayrı döşenmesi [1].

## Frekans konvertörü seçiminde izlenecek yol

1. Uygulamanın değişken tork mu sabit tork mu olduğunu belirleyin [1].
2. Besleme gerilimine ve güç aralığına uygun aileyi seçin [2][4].
3. Montaj yerinin sıcaklık, rakım ve kablo uzunluğu koşullarını kontrol edin; gerekiyorsa bir üst güç boyutunu seçin [1].
4. Ortama uygun koruma sınıfını belirleyin [3][5].
5. Kurulumu elektromanyetik uyumluluk ve topraklama kurallarına göre planlayın [1].
6. Pompa sistemlerinde enerji tasarrufu hesabında statik basma yüksekliğini göz önüne alın [7].

## Sık sorulan sorular

### Frekans konvertörü ile invertör aynı şey mi?

Frekans konvertörü, elektronik değişken hız sürücülerinin en yaygın biçimidir [7]. İnvertör ise cihazın içinde DC gerilimi değişken AC'ye çeviren bölümün adıdır [1].

### Frekans konvertörü ne kadar enerji tasarrufu sağlar?

Tasarruf uygulamaya bağlıdır. Fan ve pompada hızı %20 azaltmak, üretici örneğinde elektrik tüketimini %50 azaltır [2]. FC 101 seçim kılavuzu da değişken tork uygulamalarında bu oranı tipik değer olarak verir [3]. Statik basma yüksekliği olan pompa sistemlerinde gerçek tasarruf ayrıca hesaplanmalıdır [7].

### Frekans konvertörü motorda ses yapar mı?

Anahtarlama frekansı düşük tutulursa motorda duyulabilir ses oluşur; yüksek tutulursa sürücüde ısı artar [1]. FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir [5]. Fan uygulamalarında katalogdaki ses değerinin hangi koşulda okunacağı [sessiz fan seçimi rehberinde](vh:yazi/sessiz-fan-secimi) anlatılır.

### Yangın modunda frekans konvertörü fanı durdurur mu?

FC 101'in yangın modu açıldığında sürücü kendini korumak için durmaz; kontrol sinyallerine, uyarılara ya da alarmlara bakmadan fanın çalışmasını sürdürür [3].

### Türkiye'de frekans konvertörleri için verimlilik şartı var mı?

Evet. AB tüzüğüne göre 1 Temmuz 2021'den beri üç fazlı girişli değişken hız sürücülerinin güç kayıpları IE2 sınırını aşmamalıdır [8]. Türkiye'de bu sürücüler, AB tüzüğü esas alınarak hazırlanan ve 28 Nisan 2021 tarihli Resmî Gazete'de yayımlanan Tebliğ'in kapsamındadır [10]; tebliğin sürücülere yönelik şartı değişiklik tebliğiyle 15 Ağustos 2021'den itibaren uygulanır [12].

### Frekans konvertörü teklifi için hangi bilgileri paylaşmalıyım?

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
  {
    // BLOG, doğrulanan metin sha 6e3eda3418ea, gövde sha 34eae81ca4e8 (tur 10, 2026-10-11: bağımsız Opus doğrulayıcı +
    // belirlenimci atıf/alıntı/kalıp kontrolleri; mevzuat kaynakları 2026-10-11 tarihinde resmî metinden yeniden okundu).
    // Yayın onayı Recep'ten, OPS penceresinde, 2026-10-11. Kapak karar 135'e göre kapak şablonu PR'ında eklenecek.
    kimlik: 'radyal-aksiyel-fan-secimi',
    konu: 'verimlilik',
    yayinTarihi: '2026-10-11',
    // Güncelleme tarihi 2026-10-14: gövdenin son değişikliği, alt başlıkların yenilenmesi (BLG-13, #1945; 14 Ekim
    // 2026'da birleşti); yayın günü 2026-10-11'di. Site haritası lastmod'u ve Article `dateModified` buradan
    // (INV-BILGI-MERKEZI-KART-1).
    // Güncelleme tarihi 2026-11-01 (BLG-29): sessiz fan rehberine iç bağlantı eklendi ("Fan ses gücü seviyesi nasıl okunur?").
    // Güncelleme tarihi 2026-11-04 (BLG-38, SEO-81): H1 "Radyal ve aksiyel fan farkı nedir?", fark tablosu, nedir ve kullanım alanları bölümleri; doğrulanmış metin taslak v4 (sha 1e7f013da8f7; tuzaklı + temiz kopya iki turda, tuzaklar 5/5 ve 5/5; fark turu). Slug değişmedi.
    guncellemeTarihi: '2026-11-04',
    urunler: [
      'vh:aile/nicotra-gebhardt-at-cift-emisli-radyal-fanlar',
      'vh:aile/nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar',
      'vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar',
      'vh:aile/nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar',
      'vh:aile/vortice-aksiyel-endustriyel-fanlar',
    ],
    diller: {
      tr: {
        slug: 'radyal-fan-mi-aksiyel-fan-mi',
        ozet: "Radyal ve aksiyel fan farkı: hava yönü, basınç ve debi, verim, ses, kirli hava ve kullanım alanları; kanat tipleri ve fan eğrisinin okunması.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140; meta açıklamasından AYRI alan, SEO-30): rehberin cümlelerini tekrarlamaz; yeni iddia, sayı ya da marka yok.
        kartOzeti: 'Uygulamanıza hangi fan tipinin uyduğunu bu rehberde bulun.',
        govde: `# Radyal ve aksiyel fan farkı nedir?

Aksiyel fan havayı pervane gibi fan ekseni doğrultusunda iter; radyal (santrifüj) fan ise havayı radyal yönde hızlandırıp kinetik enerjiyi basınca çevirir [1]. Pervane tipi aksiyel fanlar düşük basınçta yüksek debi üretir [1]; radyal düz kanatlı fanlar ise yüksek basınç gerektiren uygulamalarda yaygın kullanılır [1]. Kısaca: temiz hava, düşük basınç ve yüksek debi çoğunlukla aksiyel fanı; yüksek basınç ya da kirli, parçacıklı ve yüksek sıcaklıklı hava akımı çoğunlukla radyal fanı öne çıkarır [1].

## Radyal ve aksiyel fan arasındaki farklar

| Özellik | Aksiyel fan | Radyal (santrifüj) fan |
|---|---|---|
| Hava yönü | Hava fan eksenine paralel akar [1] | Hava akımı radyal yönde hızlandırılır [1] |
| Basınç ve debi | Pervane tipi düşük basınçta yüksek debi üretir; tüp tipi orta basınç ve yüksek debide, kılavuz kanatlı tip orta ila yüksek basınçlı uygulamalarda kullanılır [1] | Radyal düz kanatlı fanlar düşük ve orta debide, yüksek basınç gerektiren uygulamalarda yaygın kullanılır [1] |
| Verim | Pervane tipi görece düşük verimlidir; havayarı profilli, küçük boşluklu kılavuz kanatlı tip %85'e kadar çıkar [1] | Öne eğik kanatta %55–65; havayarı profilli geriye eğik kanatta %85'in üzerine çıkabilir [1] |
| Ses | Aynı debi için benzer bir santrifüj fandan daha hızlı dönmesi gerekir; bu yüzden bir ölçüde daha gürültülüdür, gürültü kolay sönümlenen yüksek frekanslarda yoğunlaşır [1] | Öne eğik kanatlı tip nispeten düşük devirde çalışabilir; bu düşük gürültü düzeyine karşılık gelir [1] |
| Kirli hava | Genellikle temiz hava uygulamalarında kullanılır; toz, duman ve buhar gibi küçük parçacıklı egzoz akımlarında da sık kullanılır; kayışlı tahrikli aksiyel fanda motor hava akımının dışında kalır, bu doğrudan tahrikli aksiyel fana göre yüksek sıcaklıklı, kirli ya da korozif ortamda üstünlük olabilir [1] | Nem ve parçacık içeriği yüksek "kirli" hava akımlarında sık kullanılır; radyal düz kanat toz, odun talaşı ve metal hurdasına uygundur, öne eğik kanat genellikle temiz havayla sınırlıdır [1] |
| Tipik kullanım | Temiz hava, düşük basınç, yüksek debi; çatı havalandırması (pervane tipi), kanallı HVAC ve egzoz (tüp tipi) [1] | Yüksek basınç, kirli hava akımları, malzeme taşıma, daha yüksek sıcaklıktaki sistemler [1] |
| Boyut, ağırlık, maliyet | Benzer kapasiteli santrifüj fandan daha kompakt, hafif ve düşük maliyetlidir [1] | Benzer kapasiteli aksiyel fana göre daha fazla dönen kütleye sahiptir ve daha az kompakttır [1] |

Aksiyel ve santrifüj fanların basınç, debi ve verim yetenekleri kısmen çakışır; çoğunlukla birbirinin yerine kullanılamazlar [1]. Terim notu: bu yazıda "radyal fan" ile "santrifüj fan" aynı tür için kullanılır (yazının terim tercihidir); "radyal düz" ve "radyal uçlu" ise santrifüj fanların kanat biçimleridir [1].

## Hangi durumda hangisi?

Seçim, debi, sıcaklık, basınç, hava özellikleri ve sistem yerleşimi gibi çalışma koşullarının bilinmesiyle başlar; bu koşullar önce aksiyel mi santrifüj mü gerektiğini belirler [1].

- Temiz hava, düşük basınç, yüksek debi: aksiyel fan (pervane tipi) [1].
- Kanallı HVAC tesisatı, orta basınç, yüksek debi: tüp tipi aksiyel fan [1].
- Yüksek basınç: çoğunlukla radyal fan; düşük ve orta debide yüksek basınçta radyal düz kanat yaygındır, kılavuz kanatlı aksiyel fan da orta ila yüksek basınçta kullanılır [1].
- Toz, odun talaşı ya da metal hurdası taşıyan hava: radyal düz kanat; küçük parçacıklı ya da yüksek nemli hava: radyal uçlu kanat [1].
- Çalışma koşulları geniş ölçüde değişiyorsa aksiyel fan özellikle uygun değildir; bazı santrifüj tipleri ise geniş çalışma koşullarına uyar [1].

## Radyal fan nedir ve nasıl çalışır?

Santrifüj (radyal) fan, havanın çarkın dönme eksenine dik yönde boşaltıldığı fan tasarımıdır [1]. Bu fan havayı radyal yönde hızlandırır ve kazandığı kinetik enerjiyi basınca dönüştürür [1]. Hava çark göbeğinden kanat uçlarına doğru ilerlerken kinetik enerji kazanır; bu enerji, hava boşaltmaya girmeden önce yavaşlarken statik basınç artışına çevrilir [1]. Radyal fanlar nispeten yüksek basınç üretebilir; sıklıkla "kirli" hava akımlarında (yüksek nem ve parçacık içeriği), malzeme taşıma uygulamalarında ve daha yüksek sıcaklıktaki sistemlerde kullanılır [1]. Endüstride en yaygın kullanılan fan tipidir; yüksek basıncı yüksek verimle üretebilir ve zorlu çalışma koşullarına göre yapılabilir [1]. Öne eğik, radyal düz, radyal uçlu ve geriye eğik gibi kanat biçimleri vardır [1]. Bazı santrifüj tipleri geniş ölçüde değişen çalışma koşullarına hizmet edebilir; bu önemli bir avantajdır [1]. Radyal düz kanatlı tip dayanıklı yapısıyla endüstrinin iş atı sayılır [1]. VentHub'da bu fanları [radyal fanlar](vh:kategori/centrifugal-fans) kategorisinde inceleyebilirsiniz.

## Radyal fanlarda kanat tipleri

Radyal fanlar kanat tipine göre öne eğik, radyal düz, radyal uçlu, geriye eğik gibi gruplara ayrılır [1]; kanat tipi verimi ve kirli havaya uygunluğu etkiler [1].

| Kanat tipi | Verim | Kirli ya da parçacıklı hava |
|---|---|---|
| Öne eğik | %55–65 [1] | Genellikle temiz hava uygulamalarıyla sınırlı [1] |
| Radyal düz kanat | — | Toz, odun talaşı ve metal hurdası taşıyan hava akımlarına uygun [1] |
| Radyal uçlu | %75'e kadar [1] | Küçük parçacıklı ve yüksek nemli hava akımlarına uygun [1] |
| Geriye eğik, havayarı profilli | %85'in üzerine çıkabilir [1] | Düşük çarpma açısı kanatlarda birikmeye yol açabilir [1] |

Radyal düz kanat için ilgili kılavuz bir verim yüzdesi vermez [1]. Geriye eğik kanatlı fanlarda en verimli olanlar havayarı profilli kanatlardır [1]. Bu kanatlar kaldırma kuvvetiyle çalıştığı için bu fan tipi tutunma kaybına (stall) bağlı kararsız çalışmaya karşı hassastır [1].

## Aksiyel fan nedir ve nasıl çalışır?

Aksiyel fan, havanın akışının çarkın dönme eksenine esas olarak paralel olduğu fandır; çark silindirik bir gövdenin içindedir [1]. Adından anlaşılacağı gibi havayı fanın ekseni boyunca hareket ettirir; hava, kanatların oluşturduğu aerodinamik kaldırma kuvvetiyle basınçlandırılır, tıpkı pervane ve uçak kanadı gibi [1]. Aksiyel fanlar bazen santrifüj fanlarla birbirinin yerine kullanılabilse de genellikle "temiz hava", düşük basınç ve yüksek debi uygulamalarında kullanılır [1]. Benzer kapasiteli santrifüj fanlardan daha az dönen kütleye sahiptir ve daha kompakttır [1]. Daha yüksek devirde çalışma eğilimindedir ve aynı kapasitedeki kanal içi santrifüj fanlardan biraz daha gürültülüdür; bu gürültü yüksek frekanslarda yoğunlaşır ve daha kolay sönümlenir [1]. Pervane tipi, tüp tipi ve kılavuz kanatlı olmak üzere üç temel türü vardır; ayrıntıları aşağıdaki bölümdedir [1]. Aksiyel fanların şiddetli bir tutunma kaybı bölgesi vardır; bu nedenle çalışma koşulları geniş ölçüde değişen sistemlere özellikle uygun değildirler; birçok aksiyel fanda bu sorun, tutunma kaybını önleyici donanımlı bir fan seçilerek çözülebilir [1]. VentHub'da bu fanları [aksiyel fanlar](vh:kategori/axial-industrial-fans) kategorisinde inceleyebilirsiniz.

## Aksiyel fan türleri

- **Pervane tipi.** Düşük basınçta yüksek debi üretir; görece düşük verimlidir ama basit yapısı sayesinde ucuzdur [1].
- **Tüp tipi (tubeaxial).** Orta basınç ve yüksek debi gerektiren uygulamalarda kullanılır ve kanallı HVAC tesisatına uygundur [1]. Motora doğrudan bağlanabildiği gibi kayışla da tahrik edilebilir [1].
- **Kılavuz kanatlı (vaneaxial).** Esasen tüp tipi bir fanın çıkışına, akışı düzelten ve havanın kinetik enerjisini basınca çeviren kanatlar eklenmiş hâlidir [1]. Havayarı profilli kanatlar ve küçük boşluklarla üretildiğinde verimi %85'e kadar çıkabilir [1].

Tahrik biçimi de seçimi etkiler: doğrudan tahrikte çark motor miline bağlıdır; bu basit ve verimli bir düzendir, ancak hız ayarında daha az esneklik sunar [1]. Kayışlı tahrikte fan hızı kasnak çapları değiştirilerek ayarlanabilir [1].

## Radyal ve aksiyel fanların kullanım alanları

Aksiyel fanlar:

- Çatı havalandırması: pervane tipi fanlar çatı havalandırma uygulamalarında sık kullanılır [1].
- Kanallı HVAC ve egzoz: tüp tipi fanlar kanallı HVAC tesisatına uygundur ve kanal kayıplarını yenecek basıncı üretebildiği için egzoz uygulamalarında sık kullanılır [1].
- Kazan egzozu: kılavuz kanatlı fanlar, kazan egzozunda indüklenmiş çekiş gibi orta ve yüksek basınçlı işlerde kullanılır [1].
- Sanayi havalandırması: bir üreticinin kataloğunda uzun gövdeli kanallı aksiyel fanlar yer alır; kanatları fan durdurulmuşken ayarlanabilir [3].
- Otopark: aksiyel fanlı itme tipi jet fanlar kullanılır [4].

Radyal fanlar:

- Toz, odun talaşı ve metal hurdası taşıyan hava akımları: radyal düz kanatlı fanlar [1].
- Katı parçacık taşıma servisleri: radyal uçlu fanlar, geniş çalışma boşlukları nedeniyle yaygın kullanılır [1].
- Malzeme taşıma ve daha yüksek sıcaklıktaki sistemler: santrifüj fanlar [1].
- Otopark: geriye kıvrık metal kanatlı santrifüj çarklı indüksiyon tipi jet fanlar kullanılır [4].

Tipten bağımsız not:

- Duman tahliyesi: yüksek sıcaklıktaki dumanın tahliyesi için tasarlanan fanlar EN 12101-3'e göre üçüncü taraf bir kuruluşça belgelendirilir [4].

## Fan eğrisi nasıl okunur?

Kayışlı bir radyal fan kataloğunda eğriler, fanın toplam basınç artışını debinin fonksiyonu olarak çift logaritmik bir diyagramda gösterir [2]. Bu diyagramda sistem direnç eğrileri düz çizgi olarak görünür [2]. Eğri üzerindeki uygulama sınırları, kararlı ve yüksek verimli çalışmanın beklenebileceği önerilen aralığı gösterir [2]. Diyagramdaki verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2].

Sistem eğrisi, bir sistemin basınç–debi karakteristiğinin grafik gösterimidir [1]. Fan eğrisinin sistem eğrisiyle aynı yönde eğimli olduğu bölgede çalışan fan kararsız çalışabilir [1]. Fan eğrisi sistem eğrisini birden fazla noktada keserse fan, "hunting" denen, kararlı bir çalışma noktası arayıp duran kararsız bir davranışa girebilir [1]. Radyal düz kanatlı fanlarda tutunma kaybı sorunları diğer fanlara göre daha az görülür [1]. Çalışma koşulları geniş ölçüde değişen sistemlerde aksiyel fan özellikle uygun değildir, çünkü şiddetli bir tutunma kaybı bölgesi vardır [1]; tutunma kaybı öne eğik ve geriye eğik santrifüj fanlarda da şiddetli olabilir [1].

## Fanı en yüksek verim noktasına yakın seçin

Bir fanı en yüksek verim noktasına yakın çalıştırmak performansı artırır, aşınmayı azaltır ve onarımlar arasındaki süreyi uzatır [1]. Çalışma noktası en yüksek verim noktasından uzaklaştıkça yatak yükleri ve gürültü artar [1]. Tasarımdaki güvenlik payı, ileride kapasite artırma beklentisi ve kirlenme payı, sistem ihtiyacından bir boy büyük fan seçilmesine yol açabilir [1]. Fan devri düşürüldüğünde debi devirle doğrusal, basınç devrin karesiyle, güç devrin küpüyle değişir [1].

## Montaj, hava yoğunluğu ve ses

Fan çıkışına yakın konumlandırılmış bir dirsek, iletilen debiyi %30'a kadar azaltan bir sistem etkisi yaratabilir [1]. Fan eğrilerinin çoğu standart hava yoğunluğu varsayımıyla çizilir; ölçülen statik basınç, gerçek hava yoğunluğu ile eğrinin çizildiği yoğunluk arasındaki farka göre düzeltilmelidir [1]. Ses basıncı ile ses gücü farkı ve dB(A) değerinin hangi koşulda okunacağı [sessiz fan seçimi rehberinde](vh:yazi/sessiz-fan-secimi) anlatılır.

## Fan seçiminde izlenecek yol

1. Sistemin gerektirdiği debiyi ve toplam basıncı belirleyin; sistem eğrisini çıkarın [1].
2. Havanın nem ve parçacık içeriğini belirleyin; bunlar fan tipi seçiminde önemli etkenlerdir [1].
3. Çalışma noktasının üretici eğrisinde önerilen kararlı ve verimli aralıkta olduğunu kontrol edin [2].
4. Gerçek hava yoğunluğu referans yoğunluktan farklıysa eğri değerlerini düzeltin [1][2].
5. Fan girişinde ve çıkışında sistem etkisi yaratacak dirsekleri azaltın [1].
6. Duman tahliyesi söz konusuysa fanın EN 12101-3 belgesini ve sınıfını isteyin [4]; patlayıcı ortam söz konusuysa, tüzüğün kapsam dışı koşulu fanın yalnız o ortamda çalışmak üzere belirtilmiş ve bu amaçla özel olarak tasarlanıp pazarlanmış olması olduğundan, bunu gösteren belgeyi üreticiden isteyin [5].

## Sık sorulan sorular

### Radyal fan mı daha verimli, aksiyel fan mı?

Tipe bağlıdır. Havayarı profilli geriye eğik radyal fanlarda verim %85'in üzerine çıkabilir [1]. Havayarı profilli, küçük boşluklu kılavuz kanatlı aksiyel fanlar da %85'e kadar verime ulaşabilir [1]. Öne eğik radyal fanlarda verim %55–65 aralığındadır [1].

### Aksiyel fan kanala takılır mı?

Tüp tipi aksiyel fanlar kanallı HVAC tesisatına uygundur [1]. Bir üreticinin sanayi havalandırma kataloğunda uzun gövdeli kanallı aksiyel fanlar bulunur; kanatları fan durdurulmuşken ayarlanabilir [3].

### Fan eğrisindeki verim her devirde geçerli mi?

Bir üretici kataloğunda verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2].

### Fazla büyük fan seçmenin zararı ne?

Büyük seçilen fan en yüksek verim noktasından uzakta çalışabilir; çalışma noktası bu noktadan uzaklaştıkça yatak yükleri ve gürültü artar [1].

### Fanlar için 327/2011 sayılı AB tüzüğü hâlâ geçerli mi?

Yürürlükten kalktı. (EU) 2024/1834 sayılı tüzük, 327/2011'i 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır [5]; eski tüzüğün ekleri yalnız başka ürünlere entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanır [7]. Türkiye'de tebliğin diğer hükümleri 24 Temmuz 2027'de yürürlüğe girer; o tarihe kadar önceki tebliğ yürürlükte kalır [6]. Türkiye'de eski tebliğin ekleri ise entegre fanlar için 24 Temmuz 2028'e, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [6].

## VentHub'da hangi radyal ve aksiyel fan serileri var?

Nicotra Gebhardt'ın radyal fan serileri [AT](vh:aile/nicotra-gebhardt-at-cift-emisli-radyal-fanlar), [ADH](vh:aile/nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar), [RDH](vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar) ve [DD](vh:aile/nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar) sayfalarındadır. Aksiyel tarafta Vortice'nin [Vorticel E serisi](vh:aile/vortice-aksiyel-endustriyel-fanlar) düşük basınçlı plaka tipi aksiyel fan serisidir [3]. Diğer fanları [radyal fanlar](vh:kategori/centrifugal-fans), [aksiyel fanlar](vh:kategori/axial-industrial-fans) ve [duman egzoz fanları](vh:kategori/smoke-exhaust-fans) kategorilerinde bulabilirsiniz. Karma akışlı ve çapraz akışlı türler dahil tüm [fan çeşitleri](vh:yazi/fan-cesitleri) için ayrı rehbere bakabilirsiniz.

## Teklif için hangi bilgiler gerekir?

Bu yazıda fiyat verilmez; güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklifin doğru fana dayanması için gerekli debi ve toplam basıncı [1], havanın temiz ya da parçacıklı olup olmadığını [1], taşınan havanın sıcaklığı ve yoğunluğunu [1][2], montaj yerindeki bağlantı düzenini [1] ve patlayıcı ortam ya da duman tahliyesi gibi özel bir kullanım olup olmadığını [4][5] bildirin.

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 5, 6–9, 11, 16–25, 32–34, 80 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 11.10.2026)
2. Nicotra Gebhardt, Centrifugal Fans AT, belt driven, Issue 2.5 EN, 2013, s. 70, 99 (üretici belgesi).
3. Vortice, Industrial Ventilation kataloğu, s. 4, 58, 64 (üretici belgesi).
4. Vortice, VORT JET FAN SYSTEM broşürü, s. 10 (üretici belgesi).
5. Avrupa Komisyonu, Commission Regulation (EU) 2024/1834, md. 1(3), 9, 10, EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1834 (erişim 11.10.2026)
6. T.C. Resmî Gazete, 07.02.2026, Sayı 33161, Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM-2026/2), md. 1, 10–12, geçici md. 1. https://www.resmigazete.gov.tr/eskiler/2026/02/20260207-4.htm (erişim 11.10.2026)
7. Avrupa Komisyonu, (AB) 2025/2481 sayılı Komisyon Tüzüğü (2024/1834'ü değiştiren tüzük), madde 1(4), Resmî Gazete (OJ L, 8.12.2025); metin EUR-Lex'ten alınan iki yerel kopyadan (HTML ve metin dışa aktarımı) okundu ve madde 9(1) bakımından Resmî Gazete metninin bir PDF kopyasıyla karşılaştırıldı, üçünde de aynıdır; EUR-Lex'in canlı sayfası 3 Kasım 2026'da bot doğrulaması verdiği için yeniden doğrulanamadı: http://data.europa.eu/eli/reg/2025/2481/oj

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Yazıdaki verim, debi ve basınç değerleri üretici belgelerinde ve kaynak rehberlerde verilen değerlerdir; kendi sisteminizdeki sonuç, montaj koşullarına ve hava yoğunluğuna göre farklı olabilir. Kurulum, devreye alma ve bakım yetkili ve eğitimli personel tarafından yapılmalıdır. Yasal şartlara ilişkin bilgiler yayın tarihindeki resmî metinlere dayanır; uygulamadan önce güncel metin kontrol edilmelidir.
`,
      },
    },
  },
  {
    // BLOG (BLG-15), doğrulanmış metin sha 7df50733df40, gövde sha ecee047da477 (2026-10-16). Yedi bağımsız doğrulama turu;
    // her Yönetmelik cümlesi için iddia tablosunda birincil kaynak satırı (Resmî Gazete + ek PDF sayfa/tablo + birebir alıntı),
    // MEVZUAT kontrolü yapılmadı (pencere kapalı): birincil metin BLOG + bağımsız doğrulayıcı. Yayın: Recep onayı
    // (OPS-167, 2026-10-16); yayın günü 17 Ekim 2026.
    kimlik: 'sessiz-fan-secimi',
    konu: 'konfor',
    yayinTarihi: '2026-10-17',
    // Güncelleme tarihi 2026-10-31: yalnız başlıkların yenilenmesi (BLG-25, SEO-71 sonucu: başlık ve H1'de "kanal fanı"; adres
    // değişmez). İçerik cümlesi değişmedi (R5.5 başlık-yalnız revizyon). Site haritası lastmod'u ve Article `dateModified` buradan.
    // Güncelleme tarihi 2026-11-01 (BLG-29): "Sessiz fan nedir?" ara başlığı ve çalışma tanımı cümlesi (üretici beyanına dayalı, tek üreticiye genellenmez), meta açıklamada "sessiz fan", kardeş yazılara
    // üç iç bağlantı. H1 ve title değişmedi (Recep kararı). Önceki değer: 2026-10-31 (BLG-25).
    // 2026-11-03 (BLG-30): terim hizası, "karışık akışlı" → "karma akışlı (karışık akışlı)" (ürün sayfalarının diliyle aynı); metin iddiası değişmedi.
    // Güncelleme tarihi 2026-11-07 (BLG-44, SEO-89): yalnız ekleme revizyonu, "sessiz kanal fanları" ve "sessiz çalışan kanal fanları" ifadeleri girişe ve SSS'ye eklendi; var olan başlık, madde, SSS ve meta açıklama aynen kaldı (fark kanıtı: silinen satır 0, R5.5 v0.18). Yeni iddia yok.
    // Güncelleme tarihi 2026-11-08 (BLG-26): H2 "kaç dB(A) yeterli?" sorgusuna göre (eski ifade korunur), Yönetmelik md.6(3), dB(A) tanımı md.4(a), terim hizası; doğrulanmış metin taslak v5 (sha256 5aff5e903c0f; beş tur, tuzaklı turlarda 7/7; Geo-SEO B6a okuması). Önceki değer: 2026-11-07 (BLG-44). ozet, kartOzeti, slug, urunler değişmedi.
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari'],
    // Kategori sayfalarından rehbere bağlantı (URN-140): gövdede bağlantısı olmayan kategoriler.
    ilgiliKategoriler: ['vh:kategori/bathroom-toilet-fans', 'vh:kategori/axial-industrial-fans'],
    diller: {
      tr: {
        slug: 'sessiz-fan-nasil-secilir',
        ozet: 'Sessiz fan nedir ve nasıl seçilir? Ses basıncı ile ses gücü farkını, ölçüm koşulunu ve yatak odası değerlerini okuyun; örnek: Vortice Lineo Quiet.',
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ya da konu listesini tekrarlamaz; yeni iddia, sayı ya da marka yok.
        kartOzeti: 'Ses değerini hangi koşulda okuyacağınızı bu rehberde bulun.',
        govde: `# Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü

Sessiz kanal fanı seçimi, katalogdaki ses değerinin hangi koşulda verildiğini okumakla başlar: ses basıncı düzeyi ölçüm noktasındaki sesi, ses gücü düzeyi ses kaynağının yaydığı sesi anlatır [1]. Vortice'nin Lineo Quiet kanal fanında ses değeri ayar noktasına göre çok değişir: Lineo 100 Quiet ES için gövde yayını 9,9 dB(A) · 4 V · gövde, 3 m ile 30,9 dB(A) · 10 V · gövde, 3 m arasındadır [2].

Bu yüzden "kaç dB?" sorusu tek başına cevaplanmaz; hangi yol (emiş, üfleme, gövde), hangi ayar noktası (katalogda ES modelleri için 4, 6, 8 ve 10 V sütunları [2]) ve hangi mesafe sorularıyla birlikte cevaplanır. Aşağıda bu üç koşul, yatak odası ve ofis gibi mekânların Yönetmelik sınırları ve Lineo Quiet'in katalog değerleri birlikte okunuyor [1][2].

Sessiz kanal fanları, yani sessiz çalışan kanal fanları, bu rehberde üreticisi yaydığı sesi azaltmak için tasarladığını belirten kanal fanları anlamında kullanılır; hangi değerin sessiz sayılacağı mekâna göre değişir ve katalogdaki ses değeri koşuluyla birlikte okunur [1][2].

## Sessiz fan nedir? Bir üretici örneği

Bu rehberde "sessiz fan", üreticisi yaydığı sesi azaltmak için tasarladığını belirten fan anlamında kullanılır; örnek Vortice Lineo Quiet'tir [2]. Vortice, Lineo Quiet ürünlerini ses emici kaplamayla tanımlar: kaplama dış gövdeye bütünleşiktir ve çevreye yayılan ses emisyonunu en aza indirmek için optimize edilmiştir [2].

Fan sesi dB(A) ile verilir. Yönetmeliğin tanımlar maddesi, A-ağırlıklı ses basınç düzeyini (dBA), insan işitme sisteminin düşük basınçlı seslere karşı en çok hassas olduğu orta ve yüksek frekanslara daha fazla ağırlık veren A-ağırlık şebekesi yardımıyla elde edilen tek sayılı bir ses düzeyi birimi olarak tanımlar [1].

Hangi değerin sessiz sayılacağı mekâna göre değişir. Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik, servis ekipmanından kaynaklanan gürültü için mekâna ve akustik performans sınıfına göre ayrı değerler verir; servis ekipmanını da ısıtma ve iklimlendirme sistemlerini sayan teknik donatılar olarak tanımlar [1]. Yönetmelik yayımından bir yıl sonra yürürlüğe girmiştir [1].

Dünya Sağlık Örgütü'nün 1999 tarihli topluluk gürültüsü rehberi, uyku bölünmesini önlemek için yatak odası iç mekân değerini sürekli gürültüde 30 dB LAeq, tek tek ses olaylarında 45 dB LAmax olarak verir [3]. Gürültüde düşük frekanslı bileşenler çoksa değerlerin kılavuz değerlerden de düşük olması gerekir [3].

## Ses gücü ile ses basıncı arasındaki fark nedir?

Yönetmelik ses basıncı düzeyini (Lp), ortamda belli bir noktada ölçülen ses basıncının 20 µPa referans ses basıncına oranından hesaplanan ve dB cinsinden verilen değer olarak tanımlar [1]. Ses gücü düzeyi (Lw) ise ses kaynağının yaydığı ses gücünün 10⁻¹² watt referans ses gücüne oranından hesaplanan değerdir [1].

Kısacası ses basıncı belirli bir noktadaki ses düzeyini, ses gücü kaynağın yaydığı sesi anlatır [1]. Vortice kataloğu iki büyüklüğü ayrı yayınlar: Lineo Quiet için ses gücünü Lw dB(A), ses basıncını Lp dB(A) olarak verir [2]. Isı geri kazanım cihazlarında aynı iki büyüklüğün nasıl verildiği [ısı geri kazanım cihazı rehberinde](vh:yazi/isi-geri-kazanim-cihazi-nedir) anlatılır.

Bina içindeki değerlendirme başka bir göstergeyle yapılır: Yönetmelik servis ekipmanından kaynaklanan iç gürültüyü sürekli ses için LAeq,nT, kesikli ses için LAF,max,nT göstergesiyle değerlendirir [1]. Katalogdaki 3 m mesafede hesaplanmış ses basıncı [2] ile oda içi LAeq,nT değeri [1] aynı koşulda verilmediği için doğrudan karşılaştırılmamalıdır.

### Ses gücü beyanı ve AB ekotasarım tüzükleri

Türkiye'de Yönetmelik, binalarda kullanılacak mekanik ve elektrik ekipmanın ses emisyon değerleri için üreticinin beyan ettiği spektral düzeyler ile A ağırlıklı ses gücü düzeyinin kullanılmasını, ses gücü düzeyinin ölçüldüğü standartla birlikte beyan edilmesini ister [1]. Avrupa Birliği'nde ses gücü beyanı ürün türüne bağlıdır. (AB) 1253/2014 sayılı Komisyon Tüzüğü, havalandırma ünitelerinin ürün bilgisinde konut havalandırma ünitelerinde A ağırlıklı ses gücü düzeyinin (LWA), iç mekânda kullanılması belirtilen konut dışı ünitelerde ise gövde ses gücü düzeyinin tam sayıya yuvarlanarak verilmesini ister [5]. Aynı Tüzük, (AB) 327/2011 tanımındaki, yalnızca bir gövde ile donatılmış eksenel ya da santrifüj fanları kapsamının dışında tutar [5].

Fanlara ilişkin (AB) 327/2011 sayılı Tüzük'ün metninde ses düzeyi gerekliliği yer almaz; bu Tüzük 24 Temmuz 2026'dan itibaren yürürlükten kalkmış, yerine (AB) 2024/1834 sayılı Tüzük geçmiştir; eski Tüzük'ün Ek I, II ve III'ü entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [6][7][9]. Yeni Tüzük'te gürültüyle ilgili tanımlı özellik, 10 kW ve üzeri elektrik giriş gücündeki eksenel fanlar için "düşük gürültülü fan"dır; Türkiye'de bu Tüzük'ün karşılığı 7 Şubat 2026 tarihli ve 33161 sayılı Resmî Gazete'de yayımlanan SGM-2026/2 sayılı Tebliğ'dir; Tebliğ'in yayımı tarihinde yürürlüğe giren maddeleri dışındaki hükümleri 24 Temmuz 2027'de yürürlüğe girer; Türkiye'de önceki Tebliğ'in (SVGM: 2019/15) Ek I, II ve III'ü diğer ürünlere entegre fanlar için 24 Temmuz 2028'e, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder, yani entegre fanlarda Türkiye tarihi AB tarihinden (24 Temmuz 2027) farklıdır [7][8].

## Vortice kataloğunda ses değeri hangi koşulda verilir?

Vortice kataloğu ses basıncını 3 m mesafede, serbest alanda hesaplanmış olarak verir [2]. Katalogdaki veriler 50 Hz besleme içindir [2].

Lineo Quiet modellerinde katalog sesi üç yol için ayrı verir: INTAKE, SUPPLY ve BREAKOUT sütunları; bu yazıda bunlar emiş, üfleme ve gövde yayını olarak okunur [2].

Bu yazıda her ses değeri koşuluyla yazılır: önce değer, sonra ayar noktası, yol ve mesafe; örneğin 9,9 dB(A) · 4 V · gövde, 3 m [2].

## Fanın sesini neler belirler?

ABD Enerji Bakanlığı ve AMCA'nın endüstri için hazırladığı fan sistemleri kılavuzuna göre bir fanın ürettiği gürültü fan tipine, debiye ve basınca bağlıdır [4]. Aynı kılavuz, fazla büyük seçilen fanların yüksek hava akımı gürültüsü oluşturduğunu belirtir [4]. Yüksek kapasitede çalıştırılıp debisi kısılan fanın da yüksek gürültü üretme eğilimi vardır [4].

Hız etkisini Lineo 100 Quiet ES (17170) üzerinde görmek mümkündür. Ses basıncı 3 m mesafede, serbest alanda hesaplanmıştır [2]:

| Ayar noktası [2] | Azami debi (m³/h) [2] | Üfleme Lp (dB(A)) [2] | Gövde Lp (dB(A)) [2] |
|---|---|---|---|
| 4 V [2] | 135 | 20,6 | 9,9 |
| 6 V [2] | 175 | 26,1 | 15,9 |
| 8 V [2] | 250 | 36,7 | 24,8 |
| 10 V [2] | 300 | 40,7 | 30,9 |

Ayar 4 V'tan 10 V'a çıkarken azami debi 135 m³/h'ten 300 m³/h'e, yani yaklaşık 2,2 katına çıkar; üfleme tarafında ses basıncı 20,1 dB(A), gövde yayınında 21,0 dB(A) artar (hesap: kataloğun iki satırının farkı) [2]. Aynı modelin sesi ayar noktasına göre üfleme ve gövde yollarında yaklaşık 20 dB(A) değişir (emiş yolunda 17,9 dB(A)); sessizlik model seçimi kadar çalıştırılan ayara da bağlıdır; bu, [2] tablosundaki farklardan çıkan yazarın okumasıdır.

Fan tipi de sesin yapısını etkiler. ABD Enerji Bakanlığı kılavuzuna göre aksiyel fanlar aynı kapasitedeki hat içi santrifüj fanlardan biraz daha gürültü çıkarma eğilimindedir; ancak bu gürültüde yüksek frekanslar baskın olma eğilimindedir ve yüksek frekanslar daha kolay azaltılır [4].

## Kanal fanında sessizlik nasıl sağlanır?

Yönetmelik, tesisat ve servis ekipmanlarından kaynaklanan gürültünün kontrolü için mekanik sistemlerde gürültü kontrolü kurallarını (EK-8) uygulamayı öngörür [1]. Bu kurallar fan seçimini, titreşim yalıtımını, kanal içi ses yalıtımını ve hız ayarını birlikte ele alır; ABD Enerji Bakanlığı kılavuzundaki yöntemler aynı başlıkları destekler [1][4]. Kanal fanının türleri ve kesit farkı için [kanal tipi fan rehberine](vh:yazi/kanal-tipi-fan-nedir) bakabilirsiniz.

### Sessiz fan tipi seçimi ve yerleşimi

EK-8, gürültü emisyonu azaltılmış sessiz fan tipinin seçilmesine, hava akımı, fan hızı ve statik basınç ayarlarıyla gürültünün azaltılmasına ve fanın hava türbülansını azaltacak biçimde yönlendirilmesine dikkat edilmesini öngörür [1]. Gürültüye çok hassas mekânların tavanında önlem alınmadan fan yerleştirilemez [1].

### Titreşim yalıtımı ve esnek yastık

EK-8, servis ekipmanlarının zemine bağlantılarında ve boru ile kanal bağlantılarında titreşim yalıtımı kullanılmasını ister [1]. Fan ve fancoil kutularının tavan panolarına ve ses köprüsü yapacak taşıyıcılara doğrudan temas etmemesi, arada esnek yastık kullanılması da aynı bölümde yer alır [1]. ABD Enerji Bakanlığı kılavuzu, fanın kauçuk gibi yumuşak bir malzemeye ya da uygun bir yay izolatörüne oturtularak aktarılan titreşim enerjisinin sınırlanmasını gürültü azaltma yöntemleri arasında sayar [4].

### Susturucu ve kanal içi ses yalıtımı

Yönetmeliğin ölçüm standartları listesinde havalandırma kanalına monte edilen susturucular için eklenti kaybı, akış gürültüsü ve toplam basınç kaybı ölçümlerini kapsayan TS EN ISO 7235 yer alır [1]. Kanal içi ses yalıtımı için Yönetmelik, kanal tasarımı sırasında kanal içi gürültü düzeyinin de hesaplanmasını ister; binanın özelliğinden dolayı EK-5.1'de verilen "asgari gürültü düzeyleri" aşılırsa kanal içi ses yalıtımı yapılır [1]. Tablo 5.1 ise izin verilen en yüksek iç gürültü düzeylerini verir; EK-8'in "asgari gürültü düzeyleri" ifadesinin bu değerlere karşılık geldiği yazarın okumasıdır [1]. ABD Enerji Bakanlığı kılavuzu gürültü azaltma yöntemleri arasında kanalı yalıtmayı ve ses sönümleyici malzeme ya da bölme (baffle) kullanmayı sayar [4].

### Hız kumandası ve devir ayarı (hız ayarı)

Katalog Lineo Quiet ES sürümünü iki hızlı, elektronik kontrollü EC fırçasız motorlu olarak tanımlar; her hız kurulumda ayarlanır, cihaz alternatif olarak tek hızda çalışabilir ve bu hız kullanıcı tarafından 0–10 V sinyaliyle ayarlanır [2]. AC sürümlü Lineo Quiet'te motor modele göre 2 ya da 3 hızlıdır [2]. Katalog hız kontrolü için AC modellerde TRIO-LINEO 503 üç hız seçiciyi, C5 0.5 ve C 1.5 hız ayarlayıcılarını, yalnız Ø250 ve Ø315 modeller için de C 2.5 hız ayarlayıcısını, ES modellerde POT-IT ve POT potansiyometrelerini kumanda olarak listeler (katalog başlığı CONTROLLERS) [2]. Katalog bu kumandaları İngilizce SPEED SELECTOR (hız seçici), SPEED CONTROLLER (hız ayarlayıcı) ve POTENTIOMETER (potansiyometre) diye adlandırır [2]. ABD Enerji Bakanlığı kılavuzu ise değişken hız sürücülerinin (VFD) düşük sistem talebinde hava akımı gürültüsünü azalttığını belirtir [4]. Motor hızını gerilimi ve frekansı değiştirerek ayarlayan sürücülerin ne olduğu [frekans konvertörü rehberinde](vh:yazi/frekans-konvertoru) anlatılır.


## Sessiz kanal fanında kaç dB(A) yeterli? Yatak odası, yaşam alanı ve ofiste ses sınırı kaç dB?

Katalogdaki fan değeri ile odanın sınırı farklı ölçülerdir. Yönetmelik, sürekli gürültü üreten servis ekipmanı için konutta gece yatak odasında C sınıfında 30 dB, D sınıfında 34 dB; yaşam alanında 35 ve 39 dB; büro özel odasında 40 ve 44 dB değerlerini odada ölçülen gürültü (LAeq,nT) olarak verir [1]. Bu sayılar fanın katalog dB(A) değeri değildir [1][2]. Bu yüzden "kaç dB(A) yeterli?" sorusunun fan kataloğundaki tek bir sayıyla cevabı yoktur; hedef, odada ölçülen düzeydir [1][2]. Yönetmeliğin EK-5 Tablo 5.1'i, sürekli gürültü üreten servis ekipmanı için iç gürültü sınırlarını mekâna, zaman dilimine ve akustik performans sınıfına göre verir; A sınıfı en yüksek, F sınıfı en düşük performansı gösterir [1]. Yeni yapılacak binalarda en az C, mevcut binalarda kullanım amacı değişirse ya da esaslı tadilat yapılırsa tadilatın etkilediği bağımsız birimlerde en az D sınıfı sağlanır [1].

| Mekân [1] | Zaman dilimi [1] | C sınıfı, LAeq,nT [1] | D sınıfı, LAeq,nT [1] |
|---|---|---|---|
| Konut, yatak odası | Gece (23.00–07.00) | 30 dB [1] | 34 dB [1] |
| Konut, yaşam alanı | 24 saat [1] | 35 dB [1] | 39 dB [1] |
| Konut, mutfak | 24 saat [1] | 35 dB [1] | 39 dB [1] |
| Konaklama, yatak odası | Gece (23.00–07.00) | 30 dB [1] | 34 dB [1] |
| Büro, özel oda | Gündüz–Akşam (07.00–23.00) | 40 dB [1] | 44 dB [1] |
| Büro, toplantı odası | Gündüz–Akşam (07.00–23.00) | 35 dB [1] | 39 dB [1] |

Tablo konut için yatak odası, yaşam alanı ve mutfak satırlarını verir [1]. Başlıktaki "ofis" bu yazıda Yönetmelikteki "Büro ve İdari Binalar" işlevinin özel oda ve toplantı odası satırları olarak ele alınır; işlevin diğer satırları tabloya alınmamıştır [1].

Yatak odası için Dünya Sağlık Örgütü'nün 1999 tarihli değeri 30 dB LAeq (sürekli gürültü) ve 45 dB LAmax (tek ses olayı) olarak yazılıdır [3]. Yönetmelik, işletmeye alma aşamasında idarenin istemesi hâlinde ölçümlerin TS EN ISO 10052 ve TS EN ISO 16032'ye göre yapılmasını, sonuçlar sınır değerlerden yüksek çıkarsa EK-8'e göre önlem alınmasını öngörür [1].

Bu tablodaki değerler odada ölçülen servis ekipmanı gürültüsüdür; katalogdaki 3 m serbest alan değeriyle aynı koşulda verilmez [1][2]. Katalog değeri 3 m serbest alanda hesaplandığı için oda içi sonucu tek başına göstermez [2].

## Örnek: Vortice Lineo Quiet'in ses değerleri

Vortice Lineo Quiet motor sürümü bakımından iki sürümle gelir: 2 ya da 3 hızlı AC motorlu Lineo Quiet ve EC fırçasız motorlu Lineo Quiet ES [2]. Vortice, Lineo ürün ailesini konut, ticari ya da endüstriyel mekânların kanallı havalandırması için tasarlanmış karma akışlı (karışık akışlı) kanal fanları olarak tanıtır; karma akışlı çarkı helisel fanların yüksek debisi ile santrifüj fanların yüksek basıncının birleşimi olarak anlatır, bu anlatım ses değeri iddiası değildir [2]. Katalog, susturmalı ürünlerde ses emici kabuğun bakım sonunda yeniden takıldığında özgün ses performansını test koşullarında geri kazandırdığını belirtir [2]. Tablolar Ø100, 125, 150, 200, 250 ve 315 mm modellerini içerir; katalogdaki Ø160 modeller tabloya alınmamıştır [2]. Ses basıncı 3 m mesafede, serbest alanda hesaplanmıştır [2].

Katalogda ES modelleri 4, 6, 8 ve 10 V sütunlarıyla verilir; katalog bu sütunların neyi ifade ettiğini ayrıca açıklamaz; bu yazı onlara ayar noktası der [2].

**EC motorlu Lineo Quiet ES, en düşük ve en yüksek ayar (4 V ve 10 V) [2]:**

| Model (kod) | Azami debi, ayar 4 V (m³/h) [2] | Üfleme Lp, 4 V (dB(A)) [2] | Gövde Lp, 4 V (dB(A)) [2] | Azami debi, ayar 10 V (m³/h) [2] | Üfleme Lp, 10 V (dB(A)) [2] | Gövde Lp, 10 V (dB(A)) [2] |
|---|---|---|---|---|---|---|
| Lineo 100 Quiet ES (17170) | 135 | 20,6 | 9,9 | 300 | 40,7 | 30,9 |
| Lineo 125 Quiet ES (17171) | 180 | 21 | 11,3 | 380 | 40 | 28,7 |
| Lineo 150 Quiet ES (17172) | 250 | 23,4 | 13,7 | 515 | 40,7 | 31 |
| Lineo 200 Quiet ES (17174) | 570 | 30,6 | 19,7 | 1145 | 47,7 | 35,8 |
| Lineo 250 Quiet ES (17175) | 750 | 37,3 | 24,7 | 1485 | 53,2 | 41 |
| Lineo 315 Quiet ES (17176) | 1400 | 41,2 | 33,5 | 2630 | 54,5 | 48,3 |

**AC motorlu Lineo Quiet, en düşük ve en yüksek hız [2]:**

| Model (kod) | Azami debi, en düşük hız (m³/h) [2] | Üfleme Lp, en düşük hız (dB(A)) [2] | Gövde Lp, en düşük hız (dB(A)) [2] | Azami debi, en yüksek hız (m³/h) [2] | Üfleme Lp, en yüksek hız (dB(A)) [2] | Gövde Lp, en yüksek hız (dB(A)) [2] |
|---|---|---|---|---|---|---|
| Lineo 100 Quiet (17160) | 150 | 22,5 | 16 | 260 | 35,1 | 28,4 |
| Lineo 125 Quiet (17161) | 190 | 21,1 | 12,3 | 320 | 35 | 26,9 |
| Lineo 150 Quiet (17162) | 255 | 23 | 14,4 | 510 | 40,5 | 31,6 |
| Lineo 200 Quiet (17164) | 805 | 38,7 | 27,5 | 1160 | 47,3 | 35,5 |
| Lineo 250 Quiet (17165) | 960 | 43,7 | 32,2 | 1550 | 53,7 | 41,9 |
| Lineo 315 Quiet (17166) | 2070 | 50,5 | 39,5 | 2890 | 57,4 | 47 |

Aynı çapta Quiet olmayan Lineo ile karşılaştırma: Ø200 AC modellerinde en yüksek hızda Lineo 200 Quiet (17164) gövde yayını 35,5 dB(A) · en yüksek hız · gövde, 3 m, emiş tarafı 48 dB(A) · en yüksek hız · emiş, 3 m'dir; azami debisi 1160 m³/h'tir [2]. Lineo 200 (17180) için 3 m serbest alan koşulunda gövde yayını 46,9 dB(A), emiş tarafı 55,4 dB(A) ve azami debi 1135 m³/h olarak verilir [2]. Katalogdaki KG değeri de farklıdır: Lineo 200 Quiet 8,6 kg, Lineo 200 4,9 kg [2].

Ürün sayfasında genel bilgiler, modellerin teknik özellikleri ve model listesi bulunur: [Vortice Lineo Quiet kanal fanları](vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari). Kanal içi kurulum için diğer modeller [kanal tipi fanlar](vh:kategori/duct-fans) kategorisindedir.

## Sessiz kanal fanı seçerken kontrol listesi

1. Ses değerinin koşulunu okuyun: yol (emiş, üfleme, gövde), ayar noktası ve mesafe [2].
2. Katalogdaki 3 m serbest alan değerini oda içi hedefle doğrudan karşılaştırmayın; hedef mekânın oda içi değeridir [1][2].
3. Fanın sürekli çalışacağı ayar noktasının satırını okuyun; düşük ve yüksek ayar arasındaki ses farkı modele göre değişir; Lineo 100 Quiet ES'te yaklaşık 20 dB(A) olduğu katalogdan okunur [2].
4. Gereğinden büyük fan seçmeyin; fazla büyük fan yüksek hava akımı gürültüsü üretir [4].
5. Fanı ve kanal bağlantılarını titreşim yalıtımıyla kurun; fan kutusunun tavan panosuna ve taşıyıcıya doğrudan değmemesine dikkat edin [1][4].
6. Kanal içi ses yalıtımı ihtiyacını sistemin ses hesabıyla belirleyin [1]; ses sönümleyici malzeme ya da bölme (baffle) kullanmak da gürültü azaltma yöntemleri arasında sayılır [4].
7. Hız kumandasını (0–10 V sinyali, hız seçici ya da hız ayarlayıcı) baştan planlayın [2].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez; güncel fiyat bilgisi için ürün sayfasından teklif isteyin. İki teklif ancak aşağıdaki seçimler aynıysa karşılaştırılabilir, çünkü her biri teklif edilen cihazı ya da kurulumu değiştirir; bu, yazarın çıkarımıdır.

- **Kanal çapı ve debi.** Lineo Quiet Ø100 ile Ø315 mm arasında kanal çaplarında üretilir ve azami debi çapla değişir; örneğin ES sürümünde 10 V ayarında azami debi Ø100'de 300 m³/h, Ø315'te 2630 m³/h'tir [2].
- **Motor sürümü.** AC sürümünde motor 2 ya da 3 hızlıdır, ES sürümünde motor elektronik kontrollü EC fırçasızdır [2].
- **Hız kumandası.** TRIO-LINEO 503, C5 0.5, C 1.5, C 2.5, POT-IT ve POT gibi kumanda ve ayarlayıcılar ayrı kodlu kumandalardır (katalog başlığı CONTROLLERS) [2].
- **Kurulum kalemleri.** Titreşim yalıtımı, esnek yastık ve kanal içi ses yalıtımı gürültü hedefine göre kurulumun parçası olabilir [1]; ses sönümleyici malzeme ya da bölme (baffle) kullanmak da kılavuzda gürültü azaltma yöntemi olarak sayılır [4].
- **Ses hedefi.** Yatak odası gibi düşük hedefli mekânlarda, hedefi sağlamak için yukarıdaki kalemlerin kapsamı genişleyebilir; bu, yazarın çıkarımıdır.

## Sık sorulan sorular

### En sessiz fan hangisidir? En sessiz kanal fanı hangisidir?

Tek bir fan "en sessiz" diye gösterilemez; ses değeri model, ayar noktası, yol ve mesafe koşuluyla verilir ve koşulları aynı olmayan değerler doğrudan karşılaştırılmaz [1][2]. Örnek olarak Lineo Quiet ailesinde katalogdaki en düşük gövde değeri 9,9 dB(A) · 4 V · gövde, 3 m'dir (Lineo 100 Quiet ES) [2].

### Yatak odasında ve ofiste fan gürültüsü en çok kaç dB olabilir?

Hedef mekâna bağlıdır. Yönetmelikte sürekli gürültü için konutta gece yatak odasında C sınıfında 30 dB, D sınıfında 34 dB; yaşam alanında 35 ve 39 dB; büro özel odasında 40 ve 44 dB değerleri verilir [1]. WHO'nun 1999 rehberi yatak odası için 30 dB LAeq ve 45 dB LAmax verir [3]. Yönetmelikteki bu sınırlar odada ölçülen servis ekipmanı gürültüsüne uygulanır; katalog değeri 3 m serbest alan değeridir [1][2].

### Katalogdaki ses değeri neden odada duyulan sesten farklı olabilir?

Katalog ses basıncını 3 m mesafede, serbest alanda hesaplanmış olarak verir [2]. Yönetmeliğin hedefi ise odada ölçülen LAeq,nT değeridir [1]. İki değer farklı koşullarda verildiği için doğrudan karşılaştırılmaz [1][2].

### Devri düşürünce fan sessizleşir mi? Hız ayarını düşürünce fan sessizleşir mi?

Katalog verisi bunu gösterir: Lineo 100 Quiet ES'te ayar 10 V'tan 4 V'a inerken üfleme tarafında ses basıncı 40,7 dB(A)'dan 20,6 dB(A)'ya, gövde yayınında 30,9 dB(A)'dan 9,9 dB(A)'ya düşer; azami debi 300 m³/h'ten 135 m³/h'e iner [2]. ABD Enerji Bakanlığı kılavuzu da değişken hız sürücülerinin düşük sistem talebinde hava akımı gürültüsünü azalttığını belirtir [4].

### Kanal fanında susturucu gerekir mi?

Cevap sistemin ses hesabına bağlıdır. Yönetmelik kanal tasarımında kanal içi gürültünün hesaplanmasını, EK-5.1'de verilen "asgari gürültü düzeyleri" aşılırsa kanal içi ses yalıtımı yapılmasını ister; Tablo 5.1 izin verilen en yüksek iç gürültü düzeylerini verir; bu ifadenin o değerlere karşılık geldiği yazarın okumasıdır [1]. Susturucular için eklenti kaybı, akış gürültüsü ve toplam basınç kaybı ölçümleri TS EN ISO 7235'te tanımlıdır [1].

### Aksiyel fan mı santrifüj (radyal) fan mı daha sessizdir?

ABD Enerji Bakanlığı kılavuzuna göre aksiyel fanlar aynı kapasitedeki hat içi santrifüj fanlardan biraz daha gürültü çıkarma eğilimindedir; bu gürültüde yüksek frekanslar baskın olma eğilimindedir ve yüksek frekanslar daha kolay azaltılır [4]. Kılavuz endüstriyel ve ticari fan uygulamalarını ele alır [4]. Seçim debi ve basınç gibi sistem ihtiyacına göre yapılır [4]. İki fan türünün farkı, fan eğrisi ve çalışma noktası [radyal fan mı aksiyel fan mı rehberinde](vh:yazi/radyal-aksiyel-fan-secimi) anlatılır.

### Sessiz kanal fanları (sessiz çalışan kanal fanları) nasıl seçilir?

Seçim, ses değerinin koşulunu (yol, ayar noktası ve mesafe) okumakla başlar [2]; katalogdaki 3 m serbest alan değeri oda içi hedefle doğrudan karşılaştırılmaz, hedef mekânın oda içi değeridir [1][2]. Adımlar yazının "Sessiz kanal fanı seçerken kontrol listesi" bölümünde sıralanır.

### Vortice Lineo Quiet kaç dB(A) ses çıkarır?

Lineo Quiet modellerinde katalogdaki en düşük gövde değeri 9,9 dB(A) · 4 V · gövde, 3 m (Lineo 100 Quiet ES), en yüksek gövde değeri 48,3 dB(A) · 10 V · gövde, 3 m'dir (Lineo 315 Quiet ES) [2]. Bunlar gövde yayını değerleridir; aynı modelde 10 V'ta emiş yolu 56,5 dB(A) · 10 V · emiş, 3 m, üfleme yolu 54,5 dB(A) · 10 V · üfleme, 3 m verir [2]. Ailenin en yüksek emiş değeri AC sürümünde Lineo 315 Quiet'in en yüksek hızında 58,4 dB(A) · en yüksek hız · emiş, 3 m'dir [2]. Katalog Lineo Quiet modellerinin ses değerlerini ayar noktası ya da hız bazında ayrı verir [2].

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. T.C. Resmî Gazete, 31.05.2017, Sayı 30082, Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik (Çevre ve Şehircilik Bakanlığı), md. 4, 6, 9, 13, 17, 18, 23, EK-5 Tablo 5.1, EK-8, EK-9. https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-7.htm ve ekleri https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-7-1.pdf (erişim 16.10.2026)
2. Vortice, LINEO Range kataloğu (dosya adı Doc_Pubblicita_Lineo_Range_193047.pdf), basılı künye Cod. 5.170.084.547 – Mayıs 2026 (son sayfada ayrıca 5.170.084.504, Şubat 2026 kodu da yazılıdır), s. 4–6, 10, 12, 15, 18, 21, 28 (üretici belgesi).
3. Dünya Sağlık Örgütü (WHO), Guidelines for Community Noise, Berglund, Lindvall, Schwela (ed.), 1999, bölüm 4.3 ve 4.3.1 (basılı s. 43). https://iris.who.int/handle/10665/66217 (erişim 16.10.2026)
4. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 22, 45 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 16.10.2026)
5. Avrupa Komisyonu, (AB) No 1253/2014 sayılı Komisyon Tüzüğü, 7 Temmuz 2014 (Resmî Gazete AB, L 337, 25.11.2014, s. 8), md. 1, 2, Ek IV ve Ek V. https://eur-lex.europa.eu/eli/reg/2014/1253/oj (erişim 16.10.2026)
6. Avrupa Komisyonu, (AB) No 327/2011 sayılı Komisyon Tüzüğü, 30 Mart 2011 (Resmî Gazete AB, L 90, 6.4.2011, s. 8). https://eur-lex.europa.eu/eli/reg/2011/327/oj (erişim 16.10.2026)
7. Avrupa Komisyonu, (AB) 2024/1834 sayılı Komisyon Tüzüğü, 3 Temmuz 2024 (Resmî Gazete AB, L, 4.7.2024), md. 2, 9, 10, Ek I ve Ek II. https://eur-lex.europa.eu/eli/reg/2024/1834/oj (erişim 16.10.2026)
8. T.C. Resmî Gazete, 07.02.2026, Sayı 33161, Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (2024/1834/AB) (SGM-2026/2), Sanayi ve Teknoloji Bakanlığı. https://www.resmigazete.gov.tr/eskiler/2026/02/20260207-4.htm (erişim 16.10.2026)
9. Avrupa Komisyonu, (AB) 2025/2481 sayılı Komisyon Tüzüğü, 2 Aralık 2025 ((AB) 2024/1834'ü değiştiren Tüzük; Resmî Gazete AB, L, 8.12.2025), md. 1. https://eur-lex.europa.eu/eli/reg/2025/2481/oj (erişim 16.10.2026)
10. T.C. Resmî Gazete, 31.05.2018, Sayı 30437, Binaların Gürültüye Karşı Korunması Hakkında Yönetmelikte Değişiklik Yapılmasına Dair Yönetmelik (Çevre ve Şehircilik Bakanlığı); md. 5'in beşinci ve altıncı fıkrasını, md. 11'in üçüncü fıkrasını, EK-3 ve EK-4'ü değiştirir; geçici madde 1'i ekler; [1] künyesinde sayılan madde ve eklere dokunmaz. https://www.resmigazete.gov.tr/eskiler/2018/05/20180531-2.htm (erişim 16.10.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Katalogdaki ses basıncı değerleri 3 m mesafede, serbest alanda hesaplanmıştır [2]; odanızdaki ses düzeyi montaja, kanal sistemine ve mekânın akustiğine göre farklı çıkabilir. Yönetmelik değerleri 31.05.2017 tarihli metin ve 31.05.2018 tarihli değişiklikle birlikte, WHO değerleri 1999 tarihli kılavuzdaki hâliyle aktarılmıştır; sonraki değişiklikler güncel resmî metinden izlenmelidir; yasal bilgi yayın tarihindedir [1][3][10]. Kurulum yetkili personelle yapılmalıdır.
`,
      },
    },
  },
  {
    // BLOG (BLG-18), doğrulanmış metin sha 4ced15b8860d; B8'de yalnız sessiz fan rehberine tek gezinme cümlesi eklendi
    // (iddia içermez) ve CA MD canlı ürün sayfası cümlesi ve H2 konu terimi (R11), kayıtlı metin sha 402fb77960ca, gövde sha 549f91804b16 (2026-10-25). Beş bağımsız doğrulama turu
    // (hedef üçtü, karşılanmadı); her turda tuzaklı kopya yakalandı. Mevzuat ve sessizlik/dB iddiası yok (R2.6 gerekmez).
    // Yayın: Recep yayın onayı (25 Ekim, OPS penceresi). Fiyat yok: kategori fiyat göstermiyor, yazı teklife yönlendirir.
    // BLG-22 (31 Ekim 2026, REC-397 sonrası): arşivlenen Vort Commercial In-Line yuvarlak kanal ailesi (sayfa 404) yerine aynı serinin
    // aktif dikdörtgen kanal ailesi; ölçüm: 200, canonical kendisi, noindex yok, 5 model (CA IL ... ES RECT), görünür ₺/TL 0, Teklif var.
    // Gövdede CA MD modellerinin yuvarlak ailede listelendiğini söyleyen artık yanlış cümle çıkarıldı; metin iddiası eklenmedi.
    kimlik: 'kanal-tipi-fan-nedir',
    konu: 'konfor',
    yayinTarihi: '2026-10-25',
    // 2026-11-03 (BLG-30): terim hizası, "karışık akışlı" → "karma akışlı (karışık akışlı)"; metin iddiası değişmedi.
    // Güncelleme tarihi 2026-11-04 (BLG-39, SEO-83): gövde yenilendi (kesit farkı, kullanım yerleri, seçim bilgileri, kaynaklar); doğrulanmış metin taslak v-son (sha c97467046789; tuzaklı + temiz kopya iki turda, tuzaklar 5/5 ve 5/5; fark turu). Slug, H1 ve ürün listesi değişmedi.
    // Güncelleme tarihi 2026-11-07 (BLG-41, SEO-86): giriş markasız "kanal fanları" tanımıyla başlar, tür sayımı ve "Kullanım alanları" başlığı eklendi; meta açıklama "kanal fanları nelerdir" ve "kullanım alanları" ifadelerini taşır. H1, başlık, adres ve ürün listesi aynı. Doğrulanmış metin taslak (sha e5bb7cdac23f; üç tur, tuzaklı ve temiz kopya). Not: BLG-39 içeriği 6 Kasım'da çıkmış, tarih 4 Kasım'da kalmıştı; bu tarih ikisini de kapsar.
    // Güncelleme tarihi 2026-11-07 (BLG-44, SEO-89): yalnız ekleme revizyonu, "Kanal fanı çeşitleri nelerdir?" bölümü eklendi (mevcut tür tablosu bu başlığın altında); var olan başlık, madde, SSS ve meta açıklama aynen kaldı (fark kanıtı: silinen satır 0, R5.5 v0.18). Yeni iddia yok.
    guncellemeTarihi: '2026-11-08',
    urunler: [
      'vh:aile/vortice-lineo-kanal-fanlari',
      'vh:aile/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari',
      'vh:aile/vortice-radon-serisi-kanal-fanlari',
    ],
    diller: {
      tr: {
        slug: 'kanal-tipi-fan-nedir-nerede-kullanilir',
        ozet: "Kanal fanları nelerdir, nerede kullanılır? Kullanım alanları, yuvarlak ve dikdörtgen kesit farkı, fan türleri ve seçimde bakılacak bilgiler.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz; yeni iddia, sayı ya da marka yok.
        kartOzeti: 'Kanal fanı seçmeden önce türleri ve takılacağı yerleri bu rehberde karşılaştırın.',
        govde: `# Kanal tipi fan nedir, nerede kullanılır? Fan türleri ve seçimde bakılacaklar

Kanal tipi fanlar kanala entegre edilerek havalandırma sistemlerinde çalışır; bağlandıkları kanalın kesiti yuvarlak ya da dikdörtgen olabilir [2]. ABD Enerji Bakanlığı rehberi fanları santrifüj ve aksiyel diye ikiye ayırır, kanallı iklimlendirme tesisatı için tüp tipi aksiyel fanı uygun tür olarak anlatır [1].

Kısaca:

- Çalışma: tüp tipi aksiyel fan, kanal kayıplarını yenecek basıncı oluşturduğu için egzoz uygulamalarında sık kullanılır [1].
- Kesit: fark fanın bağlandığı kanalın kesitindedir; bir firmanın bilgi sayfasına göre dikdörtgen olanı sıkışık alanlarda daha iyi yer kullanımı sağlar [2].
- Seçim: fan seçimi hava debisi, sıcaklık, basınç, hava akımının özellikleri ve sistem yerleşimi bilinerek başlar [1].
- Kullanım: bir üretici kataloğuna göre plastik reçine gövdeli bir seri asma tavana ya da çatı arasına monte edilir [4].

Kanal fanları (kanal tipi fanlar), havalandırma sistemlerinde kullanılan ve kanala entegre edilen fanlardır; bağlandıkları kanalın kesiti yuvarlak ya da dikdörtgen olabilir [2]. Hangi kanal fanlarının bulunduğu iki ölçüte göre anlatılır: kesite göre yuvarlak ve dikdörtgen [2]; fan türü olarak santrifüj ve aksiyel (tüp tipi, kılavuz kanatlı) [1] ve üretici anlatımıyla karma akışlı [4]. ABD Enerji Bakanlığı (U.S. Department of Energy, DOE) ile AMCA International'ın rehberi fanları santrifüj ve aksiyel olarak ikiye ayırır ve kanallı iklimlendirme tesisatına uygun tür olarak tüp tipi aksiyel fanı anlatır [1]; bir üretici kataloğu ise kanal fanı serilerinden birini karma akışlı (karışık akışlı) olarak tanımlar [4]. Kullanım alanları kaynaklarda egzoz uygulamaları [1], asma tavan ve çatı arası ile mutfak, tuvalet, laboratuvar, bar ve restoran gibi mekânlar [4] olarak geçer.

## Kanal tipi fan nasıl çalışır?

DOE rehberine göre tüp tipi aksiyel fanlar egzoz uygulamalarında sık kullanılır, çünkü kanal kayıplarını yenmeye yetecek basıncı oluşturur [1]. Rehber fanları iki ana türe ayırır: santrifüj ve aksiyel [1]. Santrifüj fan, dönen bir çarkla havanın hızını artırır; hava çarkın göbeğinden kanat uçlarına doğru ilerlerken kinetik enerji kazanır ve bu enerji, hava çıkışa girmeden önce yavaşlarken statik basınç artışına dönüşür [1]. Aksiyel fan ise havayı fanın ekseni boyunca hareket ettirir; hava, pervane ile uçak kanadındaki gibi kanat yüzeyinde oluşan aerodinamik kaldırma kuvvetiyle basınçlandırılır [1].

Aksiyel fanın silindirli türü tüp tipi aksiyel fandır: DOE rehberi bunu bir silindirin içine yerleştirilmiş pervane tipi fan olarak tanımlar ve hava akışı özelliklerini iyileştirdiği için pervane tipi fandan daha yüksek basınç ve daha iyi verim sağladığını yazar [1]. Tüp tipi aksiyel fanlar orta basınçlı, yüksek debili uygulamalarda kullanılır [1]. DOE rehberi, çıkışına kılavuz kanatlar eklenmiş tüp tipi aksiyel fanı kılavuz kanatlı (vaneaxial) aksiyel fan olarak tanımlar [1]. Karma akışlı fan DOE rehberinde tanımlanmaz; bir üretici kataloğu karma akışlı çarkı, helisel fanların yüksek debisini santrifüj fanların yüksek basıncıyla birleştiren çark olarak anlatır (üretici anlatımı) [4].

## Kanal fanı çeşitleri nelerdir?

Kanal fanı çeşitleri iki ölçüte göre anlatılır: kesite göre yuvarlak ve dikdörtgen [2]; fan türü olarak santrifüj ve aksiyel (tüp tipi, kılavuz kanatlı) [1] ve üretici anlatımıyla karma akışlı [4]. Tür tablosu çalışma ilkesini özetler; kesit farkı bir sonraki bölümdedir.

| Tür | Çalışma ilkesi | Kaynak |
|---|---|---|
| Santrifüj | Havayı radyal yönde hızlandırır, kinetik enerjiyi basınca çevirir | [1] |
| Aksiyel | Havayı fanın ekseni boyunca hareket ettirir | [1] |
| Tüp tipi aksiyel | Silindir içindeki pervane tipi fandır; orta basınç ve yüksek debili uygulamalara uygundur | [1] |
| Kılavuz kanatlı aksiyel | Tüp tipi aksiyel fana çıkış kanatları eklenmiş türdür | [1] |
| Karma akışlı (üretici anlatımı) | Yüksek debiyi santrifüj fanın yüksek basıncıyla birleştirir | [4] |

## Yuvarlak ve dikdörtgen kesit farkı nedir?

Fark, fanın bağlandığı kanalın kesitindedir. Bir firmanın bilgi sayfası yuvarlak kanal tipi fanı yuvarlak bir kanala entegre fan, dikdörtgen kanal tipi fanı ise dikdörtgen kesitli kanallara entegre fan olarak tanımlar; aynı sayfa dikdörtgen kesitli olanı büyük hava hacimlerini taşımak için tasarlanmış ve sıkışık alanlarda daha iyi yer kullanımı sağlayan fan olarak anlatır [2]. Aynı serinin üretici kataloğunda anlatılan karma akışlı kanal fanı serisi, standart yuvarlak kesitli borulara takılabildiği gibi özel montaj aksesuarlarıyla dikdörtgen hava kanallarına da takılabilir [3].

Sınırlar: firma yazısında [2] ve üretici kataloğunda [3] yuvarlak ve dikdörtgen kesit arasında sayıya dayalı bir debi, basınç ya da ses karşılaştırması verilmemiştir.

## Kanal tipi fan nerede kullanılır? Kullanım alanları

Kanal fanlarının kullanım alanları kaynaklarda yerleşime göre anlatılır: kanal hattının içinde ve kanal sisteminin ucunda [4]; uygulama olarak egzoz da anılır [1]. Kaynaklarda egzoz uygulamaları, asma tavan ve çatı arası ile dış mekân kullanım yeri olarak anılır [1][4]. DOE rehberi tüp tipi aksiyel fanların yer açısından da verimli olduğunu yazar [1]. Bir üretici kataloğunda plastik reçine gövdeli bir seri asma tavana ya da çatı arasına monte edilen kanal fanı olarak sunulur ve mutfak, tuvalet, laboratuvar, bar, restoran, çamaşırhane ve dükkân gibi konut, ticari ve endüstriyel mekânlar için uygun görülür; boyalı sac çelik gövdeli bir seri de asma tavan ve çatı arası kurulumu için tanımlanır (üretici anlatımı) [4]. Yüksekliği çok düşük bir seri, kısa asma tavanlara monte edilmeye elverişlidir [4].

Aynı katalog kanal sisteminin ucuna takılan türleri de listeler. Çelik sac duvar tipi fanlar laboratuvar, bar, restoran, çamaşırhane ve spor salonu gibi mekânların havalandırma ihtiyacını karşılar; çatı tipi fanlar çatıdan atış yapan ticari ve endüstriyel mekânlar için tanımlanmıştır (üretici anlatımı) [4]. Dış mekâna kurulmak üzere tasarlanmış boyalı sac çelik gövdeli kanal fanları da aynı katalogda yer alır [4].

| Yerleşim | Anlatılan kullanım | Kaynak |
|---|---|---|
| Egzoz uygulamaları | Tüp tipi aksiyel fan: kanal kayıplarını yenecek basınç, yer açısından verimli | [1] |
| Asma tavan ya da çatı arası, kanal içi | Mutfak, tuvalet, laboratuvar, bar, restoran, çamaşırhane, dükkân | [4] |
| Kısa asma tavan | Çok kısa yükseklik sayesinde kısa asma tavanlara uygun | [4] |
| Kanal ucunda, duvarda | Laboratuvar, bar, restoran, çamaşırhane, spor salonu | [4] |
| Kanal ucunda, çatıda | Çatıdan atış yapan ticari ve endüstriyel mekânlar | [4] |

## Kanal tipi fan seçerken hangi bilgilere bakılır?

DOE rehberine göre fan seçimi, hava debisi, sıcaklık, basınç, hava akımının özellikleri ve sistem yerleşimi gibi çalışma koşullarının bilinmesiyle başlar; fan, sistemin debi ve basınç gereksinimleri hesaplanarak seçilir [1]. Sistem eğrisi, damper, kanal, filtre ve dirsek gibi her bileşenin kaybı toplanarak hesaplanır; bileşenlerin etkileşiminden doğan performans değişimine sistem etkisi denir [1]. Gereğinden büyük seçilen fan, verimin en yüksek olduğu noktada çalışmaz, ağır durumlarda kararsız çalışabilir, fazla akış enerjisi üretir ve gürültüyü artırır [1].

| Seçim girdisi | Kaynak ne söylüyor | Kaynak |
|---|---|---|
| Debi ve basınç | Seçim, sistemin hava debisi ve basınç gereksiniminin hesabına dayanır | [1] |
| Sistem kayıpları | Damper, kanal, filtre, dirsek gibi bileşen kayıpları toplanır | [1] |
| Fan boyutu | Gereğinden büyük fan, verimin en yüksek olduğu noktada çalışmaz | [1] |
| Kesit ve montaj alanı | Üretici anlatımı: yuvarlak ya da dikdörtgen kanal [3]; firma bilgi yazısı: dikdörtgen kesitte sıkışık alan avantajı [2] | [2][3] |

Ses düzeyi seçimde belirleyiciyse [sessiz fan seçimi rehberi](vh:yazi/sessiz-fan-secimi) dB(A) değerlerinin hangi koşulda okunacağını anlatır; farklı fan türlerini karşılaştırmak için [fan çeşitleri rehberine](vh:yazi/fan-cesitleri) bakabilirsiniz.

## Sık sorulan sorular

### Kanal tipi fan asma tavanda kullanılabilir mi?

Üretici kataloğuna göre evet: plastik reçine gövdeli ve boyalı sac çelik gövdeli kanal fanı serileri asma tavana ya da çatı arasına monte edilen fanlar olarak tanımlanır [4].

### Kanal tipi fan dikdörtgen kanala takılabilir mi?

Üretici kataloğuna göre evet: karma akışlı kanal fanı serisi özel montaj aksesuarlarıyla dikdörtgen hava kanallarına takılabilir [3].

### Kanal tipi fan dışarıya ya da çatıya monte edilebilir mi?

Üretici kataloğuna göre dış mekâna kurulmak üzere tasarlanmış boyalı sac çelik gövdeli kanal fanları vardır; çatı tipi fanlar ise kanal sisteminin ucuna takılan ayrı bir türdür [4].

### Kanal tipi fan yatay mı dikey mi monte edilir?

Bir üretici kataloğunda karma akışlı kanal fanı serisi yatay ya da dikey kanallı montaj için tasarlanmıştır; başka bir seri yatay, dikey ya da eğimli monte edilebilir [4].

### Birden fazla kanal tipi fan seri ya da paralel bağlanabilir mi?

Bir üretici kataloğu, karma akışlı kanal fanı serisi için paralel ve seri bağlantı düzenlerini gösterir; paralel bağlantıda debinin, seri bağlantıda basıncın iki katına çıktığını yazar [3].

### Tüp tipi aksiyel fan ile kılavuz kanatlı aksiyel fan arasındaki fark nedir?

Fark çıkış kanatlarıdır: kılavuz kanatlı fanda bu kanatlar hava akış düzenini iyileştirir ve havanın kinetik enerjisini basınca çevirir [1].

### VentHub'da kanal tipi fan için teklif nasıl alınır?

İlgili aile ya da ürün sayfasındaki "Teknik Teklif İste" düğmesi teklif başlatır; teklifte gereken bilgiler yazının son bölümünde sıralanır.

## VentHub'da hangi kanal tipi fan serileri var?

VentHub'un [kanal tipi fanlar kategorisinde](vh:kategori/duct-fans) şu aileler listelenir: [AVenS dikdörtgen kanal tipi radyal fanlar](vh:aile/avens-dikdortgen-kanal-tipi-radyal-fanlar), [LINEO kanal fanları](vh:aile/vortice-lineo-kanal-fanlari), [LINEO Quiet sessiz kanal fanları](vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari), [Radon serisi kanal fanları](vh:aile/vortice-radon-serisi-kanal-fanlari) ve [VORT Commercial In-Line dikdörtgen kanal fanları](vh:aile/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari). Çap, model sayısı ve teknik değerler aile ve ürün sayfalarındadır.

## Teklif için hangi bilgiler gerekir?

Bu yazıda fiyat verilmez; güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklif için şu bilgileri hazırlayın: hava debisi, sıcaklık, basınç, hava akımının özellikleri, sistem yerleşimi, kanalın kesiti ve montaj alanı. Bu liste, DOE rehberinin fan seçimi için saydığı koşullara [1] ve kaynaklarda anılan kesit ve montaj bilgisine [2][3] dayanan yazarın derlemesidir.

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları kataloğun basılı sayfa numarasıdır. DOE rehberinde basılı sayfa numarası kullanılmıştır. Kaynak [3] ve [4] aynı üreticinin katalogları, [2] ise bu üreticinin bir serisini anlatan firma yazısıdır; üçü birbirinden bağımsız kaynak sayılmaz.

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 8, 17, 19, 22, 23. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 25.10.2026)
2. Avens Havalandırma, "LINEO Kanal Tipi Fanlar" bilgi yazısı (firma sitesi blog bölümü), https://www.avensair.com/lineo-kanal-tipi-fanlar (erişim 04.11.2026).
3. Vortice, Commercial Ventilation in Line kataloğu (dosya adı Commercial_Ventilation_in_Line_1.pdf), s. 5, 7 (üretici belgesi).
4. Vortice, In-Line Fans Range kataloğu (dosya adı Doc_Pubblicita_In-Line_Fans_Range_191875.pdf), s. 4, 5, 36, 42, 74, 78, 84, 90 (üretici belgesi).

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Katalog değerleri model ve çalışma noktasına göre değişebilir; kendi sisteminizde farklı çıkabilir. Kurulum yetkili personel tarafından yapılmalıdır.
`,
      },
    },
  },
  {
    // BLOG (BLG-20), doğrulanmış metin: taslak v5 sha 91bd6d389be1 (v4 sha 51065cd98f80 dört turda doğrulandı; v4→v5 farkı üç kaynaklı küçük değişiklik, OPS kararıyla tur 5 yok).
    // Kayıtlı gövde sha 5ddb2b9bdb57. Dört bağımsız doğrulama turu (hedef üçtü, karşılanmadı); her turda tuzaklı kopya yakalandı.
    // Mevzuat, enerji sınıfı (A/A+) ve sessizlik iddiası yok (R2.6 gerekmez; REC-392 Mevzuat yorumu bekliyor). Fiyat yok: ürün sayfaları teklife yönlendirir.
    // Yayın: Recep yayın onayı sonrası (OPS penceresi). Konu: Recep onayı 31 Ekim 2026 (OPS önerisi).
    kimlik: 'isi-geri-kazanim-cihazi-nedir',
    konu: 'verimlilik',
    yayinTarihi: '2026-10-31',
    // 1 Kasım 2026 (BLG-27): ısı geri kazanım yazısında kurulum türü adı "kanal tipi" terimine çevrildi (başlık, bağlantı metni, tablo, SSS); iddia kümesi aynı. Gövde sha yukarıdaki değerden farklıdır.
    guncellemeTarihi: '2026-11-08',
    urunler: [
      'vh:aile/vortice-vort-hr-isi-geri-kazanim',
      'vh:aile/vortice-vort-mono',
      'vh:aile/avens-isi-geri-kazanim-cihazlari',
    ],
    diller: {
      tr: {
        slug: 'isi-geri-kazanim-cihazi-nedir-nasil-secilir',
        ozet: "Isı geri kazanım cihazı egzoz havasının ısısını taze havaya aktarır. Çalışma prensibi, eşanjör türleri ve seçimde bakılacak debi, filtre, verim ve ses.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz; yeni iddia, sayı ya da marka yok.
        kartOzeti: 'Isı geri kazanım cihazı seçmeden önce türleri ve seçim ölçütlerini bu rehberde karşılaştırın.',
        govde: `# Isı geri kazanım cihazı nedir, nasıl seçilir?

Isı geri kazanım cihazı, egzoz havasıyla dışarı atılacak ısıyı içeri alınan taze havaya aktaran havalandırma cihazıdır [1][2]. Isı geri kazanımlı havalandırıcıda (HRV) hava-hava ısı eşanjörü iki yalıtılmış hava akımı arasında ısı aktarır [2]. Nemi de aktaran türe enerji geri kazanımlı havalandırıcı (ERV) denir [4][1].

Kısaca:

- Eşanjör: plakalı ve döner çarklı gibi türler vardır; nem geri kazanımı entalpi plakalı ve döner çarklı türlerde mümkündür [3].
- Verim: bir sertifika ölçütü (Passive House Institute, 2009) etkin kuru ısı geri kazanımını belirli koşullarda yüzde 75'ten yüksek ister [6].
- Filtre: Eurovent kılavuzunun genel önerisi filtrenin en az yılda bir değiştirilmesi, eşanjörün iki yılda bir temizlenmesidir; geçerli aralık cihazın üretici kılavuzundan okunur [3].
- Kurulum türü: kanal tipi merkezi ünite kanalla bağlanır; oda tipi ünite ayrı mahallere yerleştirilir [8][9].

Isı geri kazanım cihazı, binadan atılan egzoz havasının ısısını içeri alınan taze havaya aktaran havalandırma cihazıdır [1][2].

Bu yazı cihazın nasıl çalıştığını, eşanjör türlerini, verimin nasıl okunacağını ve seçerken hangi değerlere bakılacağını Eurovent, ABD Enerji Bakanlığı, Kanada Doğal Kaynaklar Bakanlığı, REHVA ve Passive House Institute kaynaklarına ve üretici belgelerine dayanarak anlatır. VentHub kataloğundaki 16 ısı geri kazanım modelinden 13'ü Vortice tablosunda, AVenS'in üç modeli ise tablonun altındaki paragrafta yer alır.

## Isı geri kazanım cihazı nedir?

İngilizce kaynaklarda bu cihaza heat-recovery ventilator denir, kısaltması HRV'dir; Türkçe karşılığı ısı geri kazanımlı havalandırıcıdır. Kanada Doğal Kaynaklar Bakanlığı HRV'yi iç ortamdaki bayat hava ile dış ortamdaki taze hava arasında ısı aktaran mekanik bir cihaz olarak tanımlar [2]. Nemi de aktaran türüne enerji geri kazanımlı havalandırıcı (ERV) denir [4][1]. Bu yazıda ısı geri kazanım cihazı, HRV ve ERV'nin ikisini de kapsar.

## Nasıl çalışır: egzoz ısısı taze havaya nasıl geçer?

Cihaz fanlar ya da üfleyiciler ve bir hava-hava ısı eşanjörü içerir; HRV'de eşanjör iki yalıtılmış hava akımı arasında ısı aktarır [2]. İşleyiş üç adımda özetlenir:

1. Binadan alınan egzoz havası ile dışarıdan alınan taze hava cihazdan geçer; HRV'de bu iki akım birbirinden yalıtılmış kalır [2], depolamalı oda tipi ünitelerde ise aynı eşanjör paketi iki yönde sırayla kullanılır [9].
2. Kışın sıcak egzoz havasının ısısı daha soğuk taze havaya geçer; yazın iç hava, daha sıcak taze havayı soğutur [1].
3. Dengeli sistemlerde taze hava normalde oturma ve yatak odalarına verilir, egzoz havası mutfak ve banyo gibi ıslak hacimlerden alınır [3].

Eurovent kılavuzu aynı işlevi şöyle tarif eder: eşanjör egzoz havasındaki enerjiyi dış hava akımına aktarır; bu enerji aksi hâlde atmosfere atılacaktır [3]. Enerji, havalandırma havasını kışın ya da ara mevsimde ısıtmak, yazın soğutmak için geri kazanılır [3].

## Isı geri kazanım ne işe yarar, nerelerde kullanılır?

Cihaz, havalandırmayla dışarı atılacak ısıyı taze havaya aktarır; ERV türleri nemi, yani gizli ısıyı da aktarır [3][4]. Vortice kataloğu ürün aileleri için evleri, konut ve ticari mekânları, küçük daireleri, ofisleri ve otel odalarını kullanım alanı olarak sayar [8]. ABD Enerji Bakanlığı'na göre enerji geri kazanımlı havalandırma sistemleri evin kontrollü havalandırılmasını sağlarken enerji kaybını en aza indirir [1]. Eurovent kılavuzu geri kazanımın havayı koşullandırmak için dış kaynaklardan çekilen enerji tüketimini önemli ölçüde azalttığını, bazı durumlarda tamamen ortadan kaldırdığını yazar [3].

Nem de önemlidir. Kışın dış havanın mutlak nemi düşük olduğu için havalandırma, iç ortamın bağıl nemini yaklaşık yüzde 30'luk hijyenik sınırın altına çekebilir; kılavuz bu nedenle ısı geri kazanımının yanında nem geri kazanımını da avantaj sayar [3].

Alan sınırları modele göre değişir. Vortice kataloğuna göre VORT HR 350 AVEL ailesi evler, konutlar ve ticari mekânların havalandırması için, 240 m²'ye kadar tasarlanmıştır [8]. VORT HR 300 NETI 180 m²'ye, VORT HR 450 AVEL D 260 m²'ye kadar; VORT INVISIBLE MINI TOP ise küçük daireler, ofisler ve otel odaları için 80 m²'ye kadar tarif edilir [8].

## Eşanjör türleri nelerdir: duyulur, entalpi, plakalı ve döner

Eşanjörler iki ayrı ölçüte göre ayrılır: neyi aktardıkları ve nasıl yapıldıkları.

| Eşanjörün aktardığı | Kaynaktaki ifade | Kaynak |
|---|---|---|
| Yalnız duyulur ısı (HRV) | Duyulur ısıyı aktarır, nemi aktarmaz | [4] |
| Duyulur ısı ve nem (ERV) | Sıcaklıkla birlikte nemi (gizli ısıyı) da aktarır | [4][1] |

Eurovent kılavuzu plakalı eşanjörlerin normalde nemi geri kazanmadığını, nem geçiren plakalı "entalpi" eşanjörlerinin bunun istisnası olduğunu belirtir; döner çarklarda ise nem geri kazanımı mümkündür ve nem geri kazanım verimi çark tipine bağlıdır [3].

| Eşanjörün yapısı | Kaynaktaki ifade | Kaynak |
|---|---|---|
| Plakalı (sabit plakalı) | Sabit plakalar üzerinden ısı geri kazanır; avantajları hava sızdırmazlığı ve hareketli parça olmamasıdır | [3] |
| Çapraz akışlı ve karşı akışlı | Hava akış düzenine göre ikiye ayrılır; en verimli olanlar karşı akışlı eşanjörlerdir | [3] |
| Döner çarklı | Dönen çarklar ısıyı kütlede biriktirerek geri kazanır | [3] |

ABD Enerji Bakanlığı'nın Nisan 2021 tarihli bir araştırma raporu, mevcut en verimli ERV'lerin birçoğunun altıgen, karşı akışlı çekirdek kullandığını, bu çekirdeklerin benzer taban alanında daha yüksek geri kazanım sağladığını ancak basınç düşümünü artırdığını yazar [5].

## Eşanjör verimi nasıl okunur?

Verimi okurken önce hangi koşulda ölçüldüğüne bakılır. Passive House Institute, 2009 tarihli sertifika ölçütünde koşulları açıkça yazar: dengeli debi, eksi 15 ile artı 10 °C arasındaki dış hava sıcaklığı ve iç ortamdan çekilen yaklaşık 20 °C'lik kuru havada etkin kuru ısı geri kazanımı yüzde 75'ten yüksek olmalıdır [6]. Bu değer, bir sertifika ölçütünün eşiğidir [6].

ABD Enerji Bakanlığı'nın 2014 tarihli Aldrich rehberine göre soğuk havada en sık yayımlanan geri kazanım ölçüsü görünür duyulur etkinliktir (ASEF) [4].

Verim debiyle değişir. ABD Enerji Bakanlığı'nın Nisan 2021 tarihli raporunda test edilen bir ERV çekirdeğinde kışın duyulur etkinlik 40 cfm'de (yaklaşık 68 m³/h) yüzde 80'in üzerindeyken 120 cfm'de (yaklaşık 204 m³/h) yüzde 65–70'e düşmüştür [5]. Rapor, havalandırma debisinin çekirdek performansını sıcaklık değişimlerinden daha çok etkilediğini de belirtir [5]. Bu sayılar raporda test edilen çekirdeğin ölçümüdür [5].

İç sızıntı da ölçülen verimi etkiler: Eurovent kılavuzu iç sızıntının ölçülen sıcaklık verimini saptırdığını ve değerin gerçeğe düzeltilmesi gerektiğini yazar [3]. Aynı kılavuza göre plakalı eşanjörlerde iç sızıntı genellikle döner çarklardan belirgin biçimde düşüktür [3]. İç sızıntı eşanjörün içindeki ve cihaz gövdesindeki küçük açıklıklardan, dış sızıntı ise gövdeden olur [7][3].

Üreticiler verimi farklı koşul ibareleriyle verir. Vortice kataloğu ısıl verimi HRS referans debisinde verir ve referans debiyi ve referans basınç farkını aynı sayfada yazar [8]; AVenS teknik belgesi verimi dengeli debide dipnotuyla verir [11]. İki değeri karşılaştırmadan önce koşulu okumak gerekir.

## Kanal tipi mi, oda tipi mi: iki kurulum türü nasıl ayrılır?

Kanal tipi merkezi ünite kanal bağlantılı tek bir cihazla, Vortice kataloğunda 80, 180, 240 ve 260 m²'ye kadar mahalleri havalandırmak için tarif edilir [8]; oda tipi ünite ise merkezsizdir (decentralized) ve yatak odası, banyo, oturma odası ile mutfak, çalışma odası gibi ayrı mahallere yerleştirilir [9]. Eurovent kılavuzu dengeli ısı geri kazanımlı sistemlerde besleme ve egzoz debilerinin terminal cihazlı tüm odalara göre boyutlandırıldığını yazar [3].

VentHub'daki [ısı geri kazanım kategorisi](vh:kategori/heat-recovery-vmc) iki alt kategoriye ayrılır: [kanal tipi ısı geri kazanım cihazları](vh:kategori/ducted-central-hrv) ve [oda tipi ısı geri kazanım cihazları](vh:kategori/single-room-hrv).

| Ölçüt | Kanal tipi merkezi ünite | Oda tipi ünite |
|---|---|---|
| Kapsadığı alan | Vortice kataloğu modellere göre 80, 180, 240 ve 260 m²'ye kadar olan mahaller için tarif eder [8] | Katalogda m² değeri verilmez; Vortice bu seriyi merkezsiz (decentralized) ısı geri kazanım ünitesi olarak adlandırır ve ayrı mahallere yerleştirir; Wi-Fi'li modeller yerel ağ üzerinden birbirleriyle haberleşebilir [9] |
| Isı geri kazanım yöntemi | Kataloglarda plastik, entalpi ve alüminyum plakalı eşanjörler geçer [8][11] | Seramik depolamalı eşanjör: fanın dönüş yönü periyodik değişir, eşanjör önce egzoz havasıyla ısınır, sonra bu ısıyı gelen soğuk havaya verir [9] |

## Isı geri kazanım cihazı seçerken hangi değerlere bakılır?

Seçim beş başlıkta ele alınır: debi ve basınç, ses seviyesi, filtre ve bakım, by-pass ve buzlanma, kurulum yeri. Her biri aşağıda ayrı anlatılır.

### Debi ve basınç

Eurovent kılavuzu, kişi başı havalandırma debilerinin konutun tamamı için saatte ortalama 0,5 hava değişimi hedefiyle birlikte boyutlandırmanın temelini oluşturduğunu yazar [3]. Kanalların, yüksek hava hızının yol açacağı gürültü ve basınç kaybını önleyecek büyüklükte olması gerekir [3]. Altıgen karşı akışlı çekirdekler daha yüksek geri kazanım sağlar ama basınç düşümünü artırır [5].

Vortice kataloğu her modelin en yüksek debisini ve basıncını teknik tabloda verir; bu değerler "VentHub kataloğundaki ısı geri kazanım cihazları" bölümündeki tabloda toplanmıştır [8][9].

### Ses seviyesi

Eurovent kılavuzu ses basıncı ile ses gücünü ayırır: ses basıncı insan kulağını doğrudan etkileyen ölçüdür, ses gücü ise havalandırma ekipmanının akustik performansını sınamak için kullanılır ve genellikle ürünün teknik belgesinde beyan edilir [3]. Tedarikçiler çoğu zaman ses basıncını oda emilimini 10 m² Sabin varsayarak verir; bu, ses basıncının ses gücünden 4 dB düşük çıkması demektir [3]. Vortice kataloğu teknik tabloda ses basıncını 3 m uzaklıkta, ses gücünü ise ayrı bir alanda verir [8]. dB(A) değerlerinin hangi koşulda okunacağı [sessiz fan seçimi rehberinde](vh:yazi/sessiz-fan-secimi) anlatılır.

ABD Enerji Bakanlığı rehberi birçok ERV ve HRV cihazının hatırı sayılır ses ürettiğini, yatak odası gibi hassas alanların yakınına kurulacaksa bunun dikkate alınmasını söyler [4].

### Filtre ve bakım

Eurovent kılavuzuna göre filtreler zamanında değiştirilmezse hijyen sorunları, aşırı enerji tüketimi ve debide düşüş yaşanabilir; konut havalandırma cihazları görsel filtre değişim uyarısıyla donatılır ve genel öneri filtrenin en az yılda bir değiştirilmesidir [3]. Aynı kılavuz eşanjörün iki yılda bir temizlenmesini önerir [3]. ABD Enerji Bakanlığı rehberi ise bakımın sistemden sisteme değiştiğini, bazı sistemlerin filtre ve ısı değişim ortamının üç ayda bir değiştirilmesini ya da temizlenmesini gerektirdiğini söyler [4]. Kaynaklar farklı aralıklar verdiği için geçerli aralık cihazın üretici kılavuzundan okunur.

### By-pass ve buzlanma

Termal by-pass, ısı geri kazanımına gerek olmadığında geri kazanımı devre dışı bırakır ve yazın dış hava iç havadan soğukken serbest soğutma sağlar [3]. Dış hava sıcaklığı 0 °C'nin altına inince eşanjörde yoğuşan suyun donma riski vardır; donma sınırı iç bağıl neme ve eşanjör verimine bağlıdır [3]. Eurovent kılavuzuna göre plakalı eşanjörlerde donma yaklaşık eksi 5 °C'de, döner çarklarda yaklaşık eksi 15 °C'de başlar; entalpi plakalı eşanjör kullanımı donma sınırını belirgin biçimde düşürebilir [3]. ABD Enerji Bakanlığı rehberi çoğu ERV ve HRV cihazında yoğuşma suyu tahliyesi ve buzlanma koruması bulunduğunu, bazı çözme aygıtlarının ek özellik olarak sipariş edildiğini yazar [4]. Vortice kataloğu VORT HR 350 AVEL ailesini otomatik mekanik by-pass ve otomatik buzlanma koruması ile, VORT HR 450 AVEL D modelini mekanik by-pass ve otomatik devreye giren buzlanma koruması ile tanımlar [8].

### Kurulum yeri ve erişim

ABD Enerji Bakanlığı rehberi bodrum ve çatı arasını ERV ve HRV cihazları için yaygın yerleşim yerleri olarak sayar [4]. Eurovent kılavuzu filtrelere ve eşanjöre kolay erişimin bakım için önemli olduğunu, tipik bir cihazda eşanjörü çıkarmanın 10-20 dakika sürdüğünü yazar [3].

## VentHub kataloğundaki ısı geri kazanım cihazları

Aşağıdaki tablodaki en yüksek debi, en yüksek basınç ve güç değerleri Vortice kataloğunun teknik tablolarından alınmıştır ve ürün sayfalarıyla aynıdır. Model adındaki sayı en yüksek debiyle aynı olmayabilir; örneğin VORT HR 450 AVEL D için katalogdaki teknik tabloda en yüksek debi 400 m³/h'dir [8]. Katalogun enerji verisi sayfalarında farklı referans değerler de yer alır [8]. Ses, verim ve filtre değerleri model teknik föylerinde yer alır; karşılaştırırken ölçüm koşuluna bakın.

| Aile ve model (katalog adı) | Kod | Kapsadığı alan | Eşanjör (katalog ifadesi) | En yüksek debi (m³/h) | En yüksek basınç (Pa) | Güç (W) | Kaynak |
|---|---|---|---|---|---|---|---|
| [Vort HR](vh:aile/vortice-vort-hr-isi-geri-kazanim): VORT HR 350 AVEL | 12106 | 240 m²'ye kadar [8] | Plastik (PS) karşı akışlı | 350 | 880 | 165 | [8] |
| Vort HR: VORT HR 350 AVEL H | 10911 | 240 m²'ye kadar [8] | Entalpi eşanjörü | 350 | 880 | 165 | [8] |
| Vort HR: VORT HR 450 AVEL D | 12101 | 260 m²'ye kadar [8] | Karşı akışlı çapraz akış, plastik reçine | 400 | 680 | 350 | [8] |
| Vort HR: VORT HR 300 NETI | 10930 | 180 m²'ye kadar [8] | Plastik (PS) karşı akışlı | 300 | 735 | 190 | [8] |
| Vort HR: VORT INVISIBLE MINI TOP | 12219 | 80 m²'ye kadar [8] | Karşı akışlı çapraz akış, plastik reçine | 120 | 375 | 64 | [8] |
| [Vort Mono](vh:aile/vortice-vort-mono): VORT HRW 30 MONO EVO, EVO HCS, EVO HCS Wi-Fi | 12434, 12436, 12443 | Oda tipi | Seramik depolamalı | 38 | 130 | 4 | [9] |
| Vort Mono: VORT HRW 40 MONO EVO, EVO HCS, EVO HCS Wi-Fi | 12435, 12437, 12444 | Oda tipi | Seramik depolamalı | 40 | 47 | 5 | [9] |
| Vort Mono: VORT HRW 60 MONO EVO HCS | 12431 | Oda tipi | Seramik depolamalı | 60 | 120 | 7 | [9] |
| Vort Mono: VORT HRW 60 MONO EVO HCS Wi-Fi | 12432 | Oda tipi | Seramik depolamalı | 60 | 120 | 8 | [9] |

[AVenS ısı geri kazanım cihazları](vh:aile/avens-isi-geri-kazanim-cihazlari) ailesinde AVenS 750, AVenS 1000 ve AVenS 2000 olmak üzere üç model vardır. Üretici ürün sayfası ise 750-5000 m³/h aralığında daha fazla model listeler; aynı sayfa G4 sınıfı temizlenebilir kaset filtreleri ve plug fanlı seçenekleri sayar [10], teknik belgeler eşanjörü alüminyum plakalı olarak tanımlar [11]. Modellerin taze hava debileri üretici teknik belgelerinde 750, 1000 ve 2000 m³/h olarak yazılıdır [11].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez. Kaynaklarda maliyete şu iki yerde değinilir: ABD Enerji Bakanlığı raporu altıgen karşı akışlı çekirdeklerin daha yüksek maliyetle geldiğini [5], Aldrich rehberi düşük güç tüketimli sistemlerin çoğu zaman daha pahalı olduğunu belirtir [4]. Güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin. [Isı geri kazanım kategorisi](vh:kategori/heat-recovery-vmc) ürün ailelerini listeler.

## Sık sorulan sorular

### Isı geri kazanım cihazı nem de geri kazanır mı?

Nem geri kazanımı cihaz türüne bağlıdır: ısı geri kazanımlı havalandırıcılar (HRV) nemi aktarmaz, enerji geri kazanımlı havalandırıcılar (ERV) aktarır [4]. Eurovent kılavuzuna göre nem geçiren entalpi plakalı eşanjörler ve döner çarklar nem geri kazanımı sağlayabilir [3]. Vortice kataloğu VORT HR 350 AVEL H modelini entalpi eşanjörüyle duyulur ve gizli ısıyı geri kazanan bir ünite olarak tanımlar [8].

### Kanal tipi ünite mi, oda tipi ünite mi seçilmeli?

Tüm konutu ya da tek bir mahalli, katalogdaki 80, 180, 240 ve 260 m²'ye kadar sınıflara göre tek cihaz ve kanalla havalandırmak isteyenler için kanal tipi merkezi ünite, yatak odası ya da oturma odası gibi ayrı mahallere birer merkezsiz ünite yerleştirmek isteyenler için oda tipi ünite uygundur [8][9]. Bu ayrım Vortice'in merkezi ve merkezsiz ünite tarifine dayanır; yukarıdaki karşılaştırma tablosu iki türün alan tanımını ve eşanjör yöntemini yan yana verir.

### Isı geri kazanım cihazı soğukta donar mı?

Dış hava 0 °C'nin altına inince eşanjörde yoğuşan su donabilir; donma sınırı iç bağıl neme ve eşanjör verimine bağlıdır [3]. Plakalı eşanjörlerde donma yaklaşık eksi 5 °C'de başlar; entalpi plakalı eşanjör kullanımı bu sınırı belirgin biçimde düşürebilir [3]. Çoğu cihazda buzlanma koruması bulunur, bazı çözme aygıtları ek özellik olarak sipariş edilir [4].

### Isı geri kazanım cihazının filtresi ne sıklıkla değişir?

Eurovent kılavuzunun genel önerisi filtrenin en az yılda bir değiştirilmesidir [3]; ABD Enerji Bakanlığı rehberi bazı sistemler için üç ayda bir değiştirme ya da temizleme belirtir [4]. Geçerli aralık için cihazın üretici kılavuzuna bakılır.

### Isı geri kazanım cihazı ses çıkarır mı?

ABD Enerji Bakanlığı rehberi birçok ERV ve HRV cihazının hatırı sayılır ses ürettiğini söyler [4]. Ses basıncı ve ses gücü ayrı ölçülerdir; üreticinin hangisini hangi uzaklıkta verdiğine bakılır [3].

### Isı geri kazanım cihazının fiyatı nedir?

Bu yazıda fiyat verilmez; güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin.

## Kaynaklar

Eurovent kılavuzunda ve ABD Enerji Bakanlığı belgelerinde verilen sayfa numaraları PDF sayfa sırasıdır; Eurovent kılavuzunun basılı numaraları yanda belirtilmiştir. Vortice belgelerinde basılı sayfa numarası ile PDF sırası aynıdır.

1. U.S. Department of Energy, Building Science Education Solution Center, "HVAC Energy Recovery Ventilation", https://bsesc.energy.gov/energy-basics/hvac-energy-recovery-ventilation (erişim 31.10.2026).
2. Natural Resources Canada, "Heat-recovery ventilators and energy-recovery ventilators", Mayıs 2017 (sayfa değişiklik tarihi 16.01.2025; sayfa kendini güncel olmayan bülten olarak işaretler, yalnız cihaz tarifi için kullanıldı), https://natural-resources.canada.ca/energy-efficiency/energy-efficiency-regulations/heat-recovery-ventilators-energy-recovery-ventilators (erişim 31.10.2026).
3. Eurovent, "Residential Heat Recovery Ventilation Units Guidebook", ilk baskı, Eylül 2021, PDF s. 4, 7, 13, 14, 16 (basılı s. 6-7, 12-13, 24-25, 26-27, 30-31), https://www.eurovent.eu/wp-content/uploads/2021-09-23-eurovent-rahu-guidebook-first-edition-en-web.pdf (erişim 31.10.2026).
4. U.S. Department of Energy, Building America, R. Aldrich, "Measure Guideline: Selecting Ventilation Systems for Existing Homes", Şubat 2014, PDF s. 12, 42, 44, 45, 46, https://www1.eere.energy.gov/buildings/publications/pdfs/building_america/measure_guide_ventilation_systems.pdf (erişim 31.10.2026).
5. U.S. Department of Energy, Steven Winter Associates, "Research and Development of a Ventilation-Integrated Comfort System", Nisan 2021, PDF s. 26, 45, https://www1.eere.energy.gov/buildings/pdfs/78352.pdf (erişim 31.10.2026).
6. Passive House Institute, "Requirements and testing procedures for energetic and acoustical assessment of Passive House ventilation systems < 600 m³/h for Certification as 'Passive House suitable component'" (belge tarihi 24.09.2009), s. 4, https://passivehouse.com/media/filer_public/61/3d/613dd3bb-c939-4f6e-8c85-ce80867333ad/03_reqs_and_testing_procedures_ventilation_en.pdf (erişim 31.10.2026).
7. REHVA Journal, W. Lawrance, "Internal leakage in air handling units: the outdoor air correction factor (OACF) and exhaust air transfer ratio (EATR)", https://www.rehva.eu/rehva-journal/chapter/internal-leakage-in-air-handling-units-the-outdoor-air-correction-factor-oacf-and-exhaust-air-transfer-ratio-eatr (erişim 31.10.2026).
8. Vortice, "Mechanical extract ventilation and heat recovery" kataloğu (dosya adı vortice-mev-iot-188510.pdf, Ocak 2025), s. 32, 33, 34, 36, 46, 47, 48, 52, 53, 55, 58, 59, 60 (üretici belgesi).
9. Vortice, "VORT MONO RANGE" kataloğu (dosya adı vortice-vort-mono-wifi-189860.pdf, Ocak 2025), s. 4, 14, 17 (üretici belgesi).
10. AVenS (Avensair), "Alüminyum eşanjörlü ısı geri kazanım cihazları AVenS 1000" ürün sayfası, https://www.avensair.com/aluminyum-esanjorlu-isi-geri-kazanim-cihazlari-avens-1000 (erişim 31.10.2026).
11. AVenS (Avensair), "Cihaz teknik bilgileri": AVENS 750 IGK (23.09.2024), AVENS 1000 IGK (13.11.2017, revizyon 15.11.2017; ürün sayfasında aynı metne sahip, 11.03.2026'da yüklenmiş ikinci bir dosya da bağlıdır), AVENS 2000 IGK (30.01.2024), her biri 4 sayfa, s. 1/4 ve 4/4, https://www.avensair.com/uploads/ (üretici belgesi, erişim 31.10.2026).

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Katalog değerleri model ve çalışma noktasına göre değişebilir; kendi sisteminizde farklı çıkabilir. Kurulum yetkili personel tarafından yapılmalıdır.
`,
      },
    },
  },
  {
    // BLOG (BLG-28), doğrulanmış metin: taslak v5 sha d4c707a340ad (v1-v5 beş turda doğrulandı, hedef üçtü, karşılanmadı; her turda tuzaklı kopya 5/5 yakalandı).
    // v5 → v6 farkı on küçük kapsam/terim düzeltmesidir (OPS kararıyla tam tur yok; fark ayrı bir doğrulayıcıya okutuldu). Taslak v6 sha 03af6be30421; kayıtlı gövde sha 2da9d06327b6.
    // Mevzuat iddiası yok (R2.6 gerekmez; Türkiye kapsamı için hüküm aktarılmaz). Fiyat yok: ürün sayfaları teklife yönlendirir.
    // Yayın: karar 121/c (profesyonel yazı AYNI adreste döner); birleşme ayrı OPS ve Recep onayıyla. yayinTarihi birleşme gününe göre güncellenir.
    kimlik: 'hava-perdesi',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-01',
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/vortice-ad-isiticisiz-hava-perdeleri', 'vh:aile/vortice-h-ad-elektrikli-isiticili-hava-perdeleri'],
    diller: {
      tr: {
        slug: 'hava-perdesi',
        ozet: "Hava perdesi kapı açıkken dış havanın içeri girişini azaltmaya çalışır. Çalışma ilkesi, enerji etkisinin sınırları, model ve montaj yüksekliği seçenekleri.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz.
        kartOzeti: 'Hava perdesi seçmeden önce kaynaklı model bilgisini ve enerji etkisinin sınırlarını bu rehberde okuyun.',
        govde: `# Hava perdesi nedir, nasıl seçilir?

Hava perdesi, kapı ya da geçiş açıklığının üstüne monte edilir ve açıklık boyunca aşağı doğru hava akımı üfler; kapı açıkken dış havanın içeri girişini sınırlamaya çalışır [1][3]. Katalog ısıtıcısız ve elektrikli ısıtıcılı olmak üzere iki seri sunar [1]; AMCA'nın bir bilgisayar modelleme çalışması enerji performansının kapı kullanım sıklığına ve bina girişinin yönüne bağlı olduğunu söyler [2].

Kısaca:

- Çalışma: perde, yazın soğutulmuş ve kışın ısıtılmış havanın kaçmasını önlemeyi amaçlar [1]; dış havanın içeri girişini sınırlamaya çalışır [3].
- Enerji: AMCA modelleme çalışmasına göre bina girişinin yönü, bina basıncı ve kapı kullanım sıklığı perdenin enerji performansını etkiler [2].
- Montaj: bir üretici kataloğuna göre en düşük montaj yüksekliği 2,3 m, önerilen en yüksek montaj yüksekliği 4 m'dir [1]; başka üreticilerde sınır farklı olabilir [4].

Hava perdesi, kapı ya da geçiş açıklığının üstüne monte edilen ve açıklık boyunca aşağı doğru hava akımı üfleyen cihazdır; bu akım kapı açıkken dış havanın içeri girişini sınırlamaya çalışır [1][3].

Bu yazı hava perdesinin nasıl çalıştığını, enerji etkisinin yayımlanmış çalışmalara göre ne kadar olduğunu, kataloğun sunduğu model, uzunluk, montaj yüksekliği ve ısıtıcı seçeneklerini Vortice kataloğuna, bir sektör derneği olan Hava Hareketi ve Kontrol Derneği'nin (Air Movement and Control Association, AMCA) modelleme çalışmasına ve Washington State University'nin (WSU) teknoloji veritabanı kaydına ve hava perdesi üreticisi Berner'in montaj notuna dayanarak anlatır; bir seçim formülü vermez, kaynakların ortaya koyduğu seçenekleri ve sınırları sıralar. VentHub kataloğunda hava perdesi kategorisi iki ürün ailesinden ve toplam sekiz modelden oluşur [6].

## Hava perdesi nasıl çalışır?

Vortice kataloğu hava perdesini kapıların ya da açıklıkların hizasına monte edilen ve farklı sıcaklıktaki bölgeleri ayıran görünmez bir engel olarak tarif eder; amaç yazın soğutulmuş havanın, kışın ısıtılmış havanın kaçmasını ve dışarıdan toz, egzoz gazı, duman, koku ve böceğin girmesini önlemektir [1]. WSU kaydı aynı cihazı, dış kapıların hemen içinden aşağı doğru üflenen ince bir hava perdesi olarak tanımlar; kapılar açıkken dış havanın ticari binanın içine üflenmesini engellemeyi amaçlar [3].

Cihaz yalnız bina girişinde değil, bina içinde de kullanılır. Katalog, ısıtılan bir alanla ısıtılmayan bir deponun ya da yemek salonuyla mutfağın birbirinden ayrılmasını örnek verir; böylece personelin geçişi kolaylaşır ve koku ile buharın taşınması önlenir [1].

## Hava perdesi ne kadar enerji tasarrufu sağlar?

Hava perdesinin sağladığı tasarruf sabit bir yüzde değildir [2][3]. AMCA'nın yayımladığı modelleme çalışması, bina girişinin yönünün, bina basıncının ve kapı kullanım sıklığının kapıdan içeri ve dışarı hava akışını ve dolayısıyla perdenin enerji performansını etkilediğini söyler [2]. İki kaynağın yüzdeleri farklı tabana göre hesaplanmıştır: AMCA çalışması yüzdeyi, karşılaştırılan giriş düzenine sahip binanın yıllık toplam ısıtma ve soğutma yükü üzerinden hesaplar [2]; WSU'nun aktardığı Pasifik Kuzeybatı Ulusal Laboratuvarı (PNNL) sonuçları ise toplam bina enerji kullanımına göredir [3]. Ayrıca karşılaştırma tabanları da farklıdır: AMCA perdeyi tek kapıyla ve vestibülle kıyaslar, PNNL sonuçları vestibülün tasarrufunu verir. Bu yüzden iki kaynağın yüzdeleri birbiriyle doğrudan karşılaştırılmaz. 

Vestibül, giriş kapısının önüne kurulan ara bölmedir; AMCA çalışması hava perdesini hem tek kapıyla hem vestibüllü girişle karşılaştırır [2]. 

İklim bölgesi numaralarını AMCA çalışması kullanır: 1. bölgede Miami, 2. bölgede Austin, 5. bölgede Chicago, 7. bölgede Fargo, 8. bölgede Fairbanks bulunur, yani küçük numara sıcak, büyük numara soğuk iklimdir [2]. Bu numaralar Türkiye'deki bölge sınıflarıyla karıştırılmamalıdır.


| Kaynak ve kapsam | Sonuç |
|---|---|
| AMCA modelleme çalışması: Chicago için ABD Enerji Bakanlığı orta ölçekli ofis referans binası, saatte 100 kişi geçişi, perde fan gücü 1,05 kW; modellenen perde jeti 15 m/s hızda, 20° dışa açılı ve iç tasarım sıcaklığında (kışın 21 °C, yazın 24 °C) üflenir; perde yalnız kullanım saatlerinde, kapı açıkken ve dış hava 10 °C'nin altında ya da 30 °C'nin üstündeyken çalışacak şekilde modellenmiş [2] | Isıtma ve soğutma yüküne göre, tek kapıya kıyasla yıllık tasarruf %1,4–2,3 (6 660–11 085 kWh); vestibüle göre %0,9–1,5 (4 169–7 205 kWh). Aralık, ısıtma, havalandırma ve iklimlendirme (HVAC) sisteminin ne kadar dengeli olduğuna bağlıdır [2] |
| AMCA modelleme çalışması: aynı bina, temel senaryo (saatte 100 kişi, besleme havası dönüş havasına eşit, dengeli sistem), iklim bölgeleri 3–8, vestibülle karşılaştırma [2] | Isıtma ve soğutma yüküne göre, sıcaklık kontrolüyle yıllık tasarruf %0,3–2,2; sıcaklık kontrolü olmadan iklim bölgeleri 3–5'te en çok %0,8 [2] |
| AMCA modelleme çalışması: aynı bina, iklim bölgeleri 1–2, tek kapıyla karşılaştırma [2] | Isıtma ve soğutma yüküne göre yıllık tasarruf %0,0–0,1; yazar bunu marjinal olarak niteler [2] |
| WSU kaydı: PNNL'nin hızlı yemek tesisi için vestibül sonucuna dayanan vekil tahmin [3] | Toplam bina enerjisine göre tipik tasarruf %4; WSU'nun kendi alt ve üst tahmini %1–6 [3] |
| WSU'nun aktardığı üretici testleri: rüzgâr ve geçiş yoğunluğuna göre kapı başına hava girişinde azalma [3] | %2–40; WSU bu sayıların toplam bina enerjisi hakkında bilgi vermediğini ve karşılaştırma tabanının vestibül mü açık giriş mi olduğunun belli olmadığını yazar [3] |

Modelde tasarrufun büyük bölümü ısıtmadan gelir; bu yüzden iklim bölgeleri 1–2'de toplam tasarruf marjinaldir [2]. AMCA çalışması bir bilgisayar modelidir: perde jetinin davranışı yaklaşık 350 hesaplamalı akışkanlar dinamiği benzetimiyle, tek kapıdan ve vestibülden hava girişi Yuill'in deneysel orifis denklemleriyle, bina enerjisi ve bina içi hava akışı TRNSYS ve CONTAM benzetim yazılımlarıyla hesaplanmıştır [2]. Kapı kullanım sıklığına göre yapılan duyarlılık analizinde sonuç negatife de döner: Austin'de tek kapıya göre yıllık toplam tasarruf −455 ile 330 kWh, Baltimore'da vestibüle göre −903 ile 383 kWh arasında değişir; Minneapolis'te aynı analizde vestibüle göre sonuç 1 244 ile 8 595 kWh arasında kalır [2]. Çalışma, kişi sayısıyla toplam tasarruf arasında belirgin bir ilişki saptanmadığını yazar [2]. Yazar sonuçların belirli bina, parametre ve modelleme yöntemine dayandığını, başka durumlara genellemenin ayrıca doğrulama gerektirebileceğini not eder [2]. Modellenen perdenin jet hızı 15 m/s, fan gücü 1,05 kW'tır ve perde iç tasarım sıcaklığında hava üfler; perdenin kendi ısıtma ve soğutma yükü hesaba katılmıştır [2]. Katalogdaki modellerin hava hızı 8,5–11 m/s, ısıtıcısız AD serisinin motor gücü en çok 350 W'tır, bu yüzden sonuçlar katalogdaki hiçbir modele doğrudan uygulanamaz [1][2]. Çalışmanın yazarı L. Wang'dır; çalışmayı yayımlayan AMCA, hava perdesi üreticilerinin de içinde bulunduğu hava sistemi ekipmanı üreticilerinin uluslararası derneğidir [2].

WSU kaydının dayandığı PNNL sonuçları 2010 tarihlidir ve tasarrufun bina türüne göre çok değiştiğini gösterir: hızlı yemek tesisinde %4,16, sıra dükkânlardan oluşan alışveriş merkezinde (strip mall) %5,61, oturmalı restoranda %1,89, orta ölçekli ofiste %0,23, ilk ve orta öğretim okullarında (primary ve secondary school) sırasıyla %0,29 ve %0,06 [3]. Bu değerler vestibül için hesaplanmıştır; WSU hava perdesi tasarrufunun vestibülünkine yakın olmasını bekler; aynı kayıt kendi taban tanımını vestibüllü giriş olarak yazar, bu yüzden %4'ün tabanı kayıtta tutarlı değildir [3].

Perdeyi çalıştıran fanın enerjisi de hesaba girer. AMCA modelinin Chicago senaryosunda perde yıllık 371 kWh fan enerjisi kullanır [2]. Kapı kullanımı arttıkça fan enerjisi de artar; duyarlılık analizinde Austin'de 56–756, Baltimore'da 72–978, Minneapolis'te 84–1 137 kWh arasında değişir [2]. WSU, üreticilerin tasarruf iddialarını değerlendirirken perdeyi çalıştıran fanın enerjisinin nadiren tartışıldığını not eder [3].

## Isıtıcılı mı, ısıtıcısız mı? Model ve uzunluk seçenekleri

Vortice kataloğu hava perdesini sekiz modelde sunar. Katalog metnine göre modeller dört uzunluk sınıfında (900, 1 200, 1 500 ve 2 000 mm) ve tek ya da üç fazlı beslemeyle gelir [1]; elektrikli ısıtıcı yalnız H serisinde vardır [1]. Teknik tabloda ısıtıcılı modellerin gövde uzunluğu 950, 1 230 ve 1 510 mm'dir [1]. VentHub'da ısıtıcısız modeller [Vortice AD Isıtıcısız Hava Perdeleri](vh:aile/vortice-ad-isiticisiz-hava-perdeleri) ailesinde, ısıtıcılı modeller [Vortice H AD Elektrikli Isıtıcılı Hava Perdeleri](vh:aile/vortice-h-ad-elektrikli-isiticili-hava-perdeleri) ailesinde yer alır; ikisi de [hava perdeleri](vh:kategori/air-curtains) kategorisindedir.

| Model kodu | Seri | Uzunluk (mm) | Besleme gerilimi (V) | Debi (m³/h) | Hava hızı (m/s) | Ses basıncı (dB(A)) | Ağırlık (kg) | Kaynak |
|---|---|---|---|---|---|---|---|---|
| 65195 | AD 900 | 900 | 230 | 1 100–1 400 | 9–11 | 55–57 | 10,0 | [1] |
| 65196 | AD 1200 | 1 200 | 230 | 1 600–1 900 | 9–11 | 56–58 | 12,5 | [1] |
| 65197 | AD 1500 | 1 500 | 230 | 2 000–2 500 | 9–11 | 57–59 | 15,5 | [1] |
| 65198 | AD 2000 | 2 000 | 230 | 2 900–3 600 | 9–11 | 59–61 | 20,5 | [1] |
| 65155 | H AD 900 M | 950 | 230 | 1 000–1 200 | 8,5–9,5 | 55–57 | 13,5 | [1] |
| 65156 | H AD 900 T | 950 | 380 | 1 000–1 200 | 8,5–9,5 | 55–57 | 13,5 | [1] |
| 65157 | H AD 1200 T | 1 230 | 380 | 1 500–1 700 | 8,5–9,5 | 56–58 | 16,0 | [1] |
| 65158 | H AD 1500 T | 1 510 | 380 | 1 900–2 200 | 8,5–9,5 | 57–59 | 18,0 | [1] |

Tablo değerleri Vortice kataloğunun teknik veri tablosundandır; debi ve hava hızı en düşük ve en yüksek kademeyi, ses basıncı 2 m mesafedeki değeri gösterir [1]. Katalog metni "2 700 m³/h'e kadar" yazar, ancak aynı katalogdaki teknik tablo AD 2000 için 3 600 m³/h verir [1]; bu yazı tabloyu esas alır. VentHub ürün sayfaları da en yüksek debiyi ısıtıcısız ailede 1 400–3 600 m³/h, ısıtıcılı ailede 1 200–2 200 m³/h olarak gösterir [6].

Katalog kapı genişliğine göre bir eşleme tablosu vermek yerine perdenin açıklığa olabildiğince yakın monte edilmesini ister ve geniş açıklıklar için perdelerin seri halinde monte edilebileceğini belirtir [1].

Katalog ısıtma elemanlarını PTC termistörlü, aşırı ısınmaya ve gerilim sıçramalarına karşı korumalı olarak tanımlar [1]. Kızılötesi uzaktan kumanda hız seçimini yapar; ısıtıcıyı açıp kapatma komutu yalnız H modellerinde vardır [1]. Isıtıcılı modellerde hava hızı ısıtıcısızlardan düşüktür (8,5–9,5 m/s ve 9–11 m/s) [1]. Cihaz ayrıca piyasadaki standart kapı sensörlerine bağlanabilir [1].

## Montaj yüksekliği ve hava hızı

Katalog en düşük montaj yüksekliğini 2,3 m, önerilen en yüksek montaj yüksekliğini 4 m olarak verir; hava hızının bu yüksekliğe kadar etkili olduğunu söyler [1]. Cihaz kapının üstüne ya da açıklığa olabildiğince yakın, yatay ve duvara monte edilir; amaç yanlardan hava geçişini önlemektir [1]. Ön emiş ızgaralı modeller tavanla perde arasında boşluk gerektirmediği için alçak tavanlı mekânlarda da kullanılabilir [1].

Hava perdesi üreticisi Berner, her modelin belirli bir en yüksek montaj yüksekliği için tasarlandığını, bu yüksekliğin aşılmasının zemin seviyesinde gereken hava hızını sağlamayı engellediğini ve performansı düşürdüğünü yazar [4]. Berner bunu 2,5 m'lik bir örnekle anlatır; sayı o üreticinin örneğidir [4]. Aynı kaynağa göre güçlü rüzgâr, bina içinde negatif basınç ve yoğun kapı kullanımı daha güçlü bir hava akımı gerektirir [4].

## Hava perdesi hangi mekânlarda kullanılır?

Vortice kataloğunun uygulama listesinde gıda sanayi, hastaneler ve laboratuvarlar, yemek hizmeti ve konaklama, bar ve restoranlar, ofisler ve okullar, depolar ve üretim bölümleri, süpermarketler, bankalar, yüzme havuzları ve spor merkezleri ile soğutmalı birimler (dış mekân montajı) bulunur [1]. Katalog uygulama listesinde gıda sanayisini, bölümler arasında iklimsel ve hijyenik ayrımın ve insan ile malın hızlı ve kolay geçişinin birlikte gerektiği yer olarak belirtir [1].

## ANSI/AMCA 220-21 standardı nedir?

ANSI/AMCA 220-21, hava perdesi ünitelerinin aerodinamik performans derecelendirmesi için laboratuvar test yöntemlerini adında taşıyan AMCA belgesidir [5]. AMCA'nın tanıtım sayfası belgenin okuyucuyu hava perdesi üniteleriyle tanıştırmayı amaçladığını, hava perdesi teorisini, bileşenleri, test ve derecelendirmeyi, yapımı, uygulamaları, seçimi, montajı ve bakımı kapsadığını yazar [5]. Bu yazının dayandığı Vortice kataloğunun hava perdesi sayfalarının metninde bu standarda ya da başka bir test standardına atıf yoktur [1]. Bu yüzden iki üreticinin debi ve hız değerlerini karşılaştırırken değerlerin hangi test yöntemine göre verildiğini sormanızı öneririz.

## Fiyatı belirleyen etkenler

Bu yazı fiyat vermez; güncel fiyat ve teklif için ürün sayfasındaki teklif formu kullanılır. Katalogdaki "available features and benefits paid" ifadesi seçeneklerin ücretli olup olmadığını belli etmez [1]. Katalogda modeller arasında değişen seçenekler uzunluk, elektrikli ısıtıcının olup olmaması (H serisi) ve besleme gerilimidir (230 V ya da 380 V) [1]. Kızılötesi uzaktan kumanda ve kapı sensörü bağlantısı serinin ortak özelliğidir; katalog ayrıca ısıtıcısız seri için RVG 1A (12835), ısıtıcılı seri için RVG 2A (12836) kodlu regülatörleri listeler [1]. Bu yazının kaynakları bu seçeneklerin fiyata etkisini ya da önem sırasını söylemez.

## Sık sorulan sorular

### Hava perdesi kapıyı tamamen kapatır mı?

Perde girişi azaltır; AMCA modelinde yıllık infiltrasyon (dışarıdan içeri hava girişi) azalması tek kapıya göre %62–67'dir, yani girişi tümüyle ortadan kaldırmaz [2]. Katalog hava perdesini görünmez bir engel olarak tarif eder; perdenin ürettiği hava akımı dış havanın içeri girişini güçleştirir [1]. Aynı modelde basınç farkı (dış eksi iç) −3,3 ile 6,9 Pa arasındayken perde girişi sıfıra indirir; 6,9 Pa'nın üstünde dış hava girişi başlar, −3,3 Pa'nın altında ise iç havanın dışarı çıkışı başlar [2]. Aynı çalışmada basınç farkı (dış basınç eksi iç basınç) −15 Pa'nın altına inince, yani iç basınç dış basıncın en az 15 Pa üstüne çıkınca, perde tek kapıdan daha fazla iç havanın dışarı akışına yol açabilir [2].

### Isıtıcılı hava perdesi şart mı?

Isıtıcı bir seçenektir: katalog ısıtıcısız AD ve elektrikli ısıtıcılı H AD olmak üzere iki seri sunar [1]. Bu yazının kaynakları ısıtıcılı bir modelin ısıtıcısıza göre ayrıca tasarruf sağladığını göstermez.

### Hava perdesi kaç metreye monte edilir?

Vortice kataloğuna göre en düşük montaj yüksekliği 2,3 m, önerilen en yüksek montaj yüksekliği 4 m'dir [1]. Başka üreticilerin modellerinde sınır farklı olabilir; Berner her modelin kendi en yüksek montaj yüksekliği olduğunu belirtir [4].

### Hava perdesi ne kadar ses çıkarır?

Vortice kataloğu 2 m mesafede ses basıncını modele göre 55–61 dB(A) verir; ısıtıcısız AD serisinde 55–61, ısıtıcılı H AD serisinde 55–59 dB(A) aralığındadır [1].

### Hava perdesi vestibülün yerine geçer mi?

Bir model çalışmasında karşılaştırılabilir sonuç vermiştir: AMCA çalışmasında perde, temel senaryoda iklim bölgeleri 3–8'de vestibülle karşılaştırılabilir performans göstermiştir [2]. WSU kaydı, ABD'de vestibül şartı bulunan binalarda hava perdesinin alternatif olarak kabulünün yetkililere enerji eşdeğerliği kanıtı sunularak istenebileceğini belirtir [3]. Bu yazı Türkiye'deki uygulamaya ilişkin bir hüküm aktarmaz; projede hangi çözümün uygun sayılacağına yetkili kurumun güncel kararı belirler.

### Hava perdesi bina içinde kullanılabilir mi?

Evet. Katalog, ısıtılan alanla ısıtılmayan depoyu ya da yemek salonuyla mutfağı ayırmak için bina içi kullanımı örnek verir [1].

### Uzun bir kapı açıklığı için tek perde yeterli olur mu?

Açıklık en uzun modelden genişse tek perde açıklığı kaplamaz. Katalogdaki en uzun model ısıtıcısız AD 2000'dir (2 000 mm); ısıtıcılı seride en uzun gövde 1 510 mm'dir [1]. Daha uzun açıklıklar için katalog perdelerin seri halinde monte edilebileceğini söyler [1].

## Kaynaklar

1. Vortice S.p.A., "Air Door Range" hava perdesi kataloğu, Mayıs 2025, kod 5.169.084.451, s. 3–6 (teknik veri tablosu s. 6).
2. AMCA International, L. Wang, "Investigation of the Impact of Building Entrance Air Curtain on Whole Building Energy Use", Short Summary ve Executive Summary, PDF s. 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14 ve 16 (yayın yılı belgede yazılı değildir). https://a.storyblok.com/f/152166/x/2f4055bc03/amca-air-curtain-study.pdf
3. Washington State University, teknoloji veritabanı kaydı "Air Curtains at Building Openings 194: Air Curtains vs. Vestibules" (Item ID 427; 2010 HVAC TAG; dayandığı PNNL çalışması 2010). https://e3tnw.org/ItemDetail.aspx-39.html?id=427
4. Berner International, "The Critical Importance of Correct Mounting Height for Air Curtains". https://berner.com/product-knowledge/the-critical-importance-of-correct-mounting-height-for-air-curtains/
5. AMCA International, "ANSI/AMCA Standard 220-21 | Laboratory Methods of Testing Air Curtain Units for Aerodynamic Performance Rating". https://amca.org/publish/publications-and-standards/amca-standards/amca-standard-220-21-laboratory-methods-of-testing-air-curtain-units-for-aerodynamic-performance-rating.html
6. VentHub, hava perdeleri kategori sayfası ile Vortice AD ve Vortice H AD ürün ailesi sayfaları, canlı sitede 1 Kasım 2026'da ölçüldü: https://venthub.com.tr/tr/category/hava-perdeleri, https://venthub.com.tr/tr/products/vortice-ad-isiticisiz-hava-perdeleri ve https://venthub.com.tr/tr/products/vortice-h-ad-elektrikli-isiticili-hava-perdeleri

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Enerji tasarrufu sayıları belirli bir bina modeline ve iklime aittir; kendi binanızda farklı çıkabilir. Montaj ve elektrik bağlantısı yetkili personelle yapılmalıdır. Katalog değerleri üretici beyanıdır ve yayın tarihindeki katalog sürümüne aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-31), doğrulanmış metin: taslak v7 (sha 728066b03deb) beş turda doğrulandı (v1-v7; hedef üçtü, karşılanmadı; her turda tuzaklı kopya 5/5 yakalandı).
    // v7 → v8 farkı iki cümledir ve ikisi de iddiayı daraltır (2037 geçiş tarihi çıkarıldı: 2025/2481 değişikliği doğrulanmadı ve kardeş rehber farklı tarih verir; giriş cümlesinde Vortice kapsamı karma akışlı üretici anlatımıyla sınırlandı). Taslak v8 sha 2917711c943b; kayıtlı gövde sha 141c5116ed7a.
    // Mevzuat: tür tanımları (AB) 2024/1834 madde 2(17)-(20), (25), madde 9(1), Ek III nokta 4 (OPS, EUR-Lex ham metni, 3 Kasım 2026); yürürlükten kalkan 327/2011 yalnız gaz yolu anlatımı için [5]. Fiyat yok: ürün sayfaları teklife yönlendirir.
    // Yayın: karar 121/c (profesyonel yazı AYNI adreste döner); birleşme ayrı OPS onayıyla. yayinTarihi birleşme gününe göre güncellenir.
    kimlik: 'fan-cesitleri',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-03',
    // Güncelleme tarihi 2026-11-04 (BLG-36): gövde türler çerçevesiyle yenilendi; doğrulanmış metin taslak v12 (sha cf6aaf30e82c; tuzaklı + temiz kopya iki turda, tuzaklar 5/5 ve 5/5; fark turu).
    // ilgiliKategoriler: 11 fan alt kategorisi (URN-151 kategori kartı).
    // BLG-40 (2026-11-06): H1 (= sayfa başlığı) ve meta açıklaması değişti; önceki H1 bir rakip sayfanın başlığıyla birebir aynıydı (GEO-SEO ölçümü). Gövde, slug ve ürün listesi aynı.
    // Güncelleme tarihi 2026-11-07 (BLG-44, SEO-89): yalnız ekleme revizyonu, kanal tipi, hücreli aspiratör, çapraz akışlı ve plug fan için H3 başlıklı yeni bölüm eklendi; var olan başlık, madde, SSS ve meta açıklama aynen kaldı (fark kanıtı: silinen satır 0, R5.5 v0.18). Yeni iddia yok.
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/vortice-lineo-kanal-fanlari', 'vh:aile/vortice-aksiyel-endustriyel-fanlar'],
    ilgiliKategoriler: [
      'vh:kategori/axial-industrial-fans',
      'vh:kategori/centrifugal-fans',
      'vh:kategori/duct-fans',
      'vh:kategori/roof-fans',
      'vh:kategori/bathroom-toilet-fans',
      'vh:kategori/smoke-exhaust-fans',
      'vh:kategori/cabinet-fans',
      'vh:kategori/plug-fans',
      'vh:kategori/corrosion-and-acid-resistant-fans',
      'vh:kategori/chimney-fans',
      'vh:kategori/industrial-ceiling-fans',
    ],
    diller: {
      tr: {
        slug: 'fan-cesitleri',
        ozet: "Fan çeşitleri akış yoluna göre aksiyel, radyal ve karma akışlı olarak ayrılır. AB tüzüğündeki akış açısı sınırları ve VentHub fan kategorileri bu yazıda.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Fan türlerini akış yoluna ve VentHub kategorilerine göre karşılaştırmak için bu rehberden başlayın; kategori sayfalarına buradan geçin.",
        govde: `# Fan türleri ve çeşitleri: aksiyel, radyal, karma akışlı fanlar

ABD Enerji Bakanlığı kılavuzu fanları iki ana türe ayırır: aksiyel ve santrifüj [2]. Hangi türün seçileceği hava özelliklerine, debiye, basınca ve sistem yerleşimine bağlıdır [2]. Yazı önce türleri, sonra seçime nereden başlanacağını anlatır; katalog kategorileri de sıralanır. Seçimde fanın uygulamadaki işi, yani gereken debi ve basınç, belirleyici girdi olarak anılır [2].

Kısaca:

- Aksiyel: fan, havayı dönme ekseni boyunca bir pervane gibi hareket ettirir; hafif ve kompakt olma eğilimindedir [2].
- Radyal: fan, havayı radyal yönde hızlandırır; sağlam, sessiz ve güvenilirdir [2].
- Karma akışlı: bir üretici beyanına göre çark, helisel fanın yüksek debisini santrifüj fanın yüksek basıncıyla birleştirir [3].

Havalandırmada kullanılan fan türleri, havanın fandan geçerken izlediği yola göre başlıca aksiyel, radyal (santrifüj), karma akışlı ve çapraz akışlı olarak ayrılır [1]. ABD Enerji Bakanlığı kılavuzu iki ana tür sayar: aksiyel ve santrifüj [2]; Avrupa Birliği'nin (AB) 2024/1834 sayılı fan tüzüğü karma akışlı ve çapraz akışlı fanı da kategori olarak sayar (madde 2(1)) [1]. Fan türünün seçimi hava özellikleri, debi, basınç ve sistem yerleşimine bağlıdır [2]; bu yazı projeye özel seçimin yerine geçmez. Yazı önce türleri, sonra seçime nereden başlanacağını anlatır; VentHub kataloğundaki fan kategorileri üçüncü bölümde sıralanır.

## Fanlar akış yoluna göre nasıl ayrılır?

Avrupa Birliği'nin (AB) 2024/1834 sayılı fan tüzüğü aksiyel, karma akışlı ve santrifüj fanı gazın çarktan geçen akış açısına göre ayırır: eksenel (bu yazıda aksiyel) fan, akış açısı 20 dereceden küçük olan fandır; karma akışlı fan, akış açısı 20 derece ve üzeri, 70 dereceden küçük olan fandır; santrifüj fan, akış açısı 70 derece ve üzeri olan fandır (madde 2(18), 2(20), 2(19)) [1]. Akış açısı, çarka giren ve çıkan gaz akışı yönleri arasındaki açıdır (madde 2(17)); hesapta kanat çıkış kenarında göbekteki ve dış çaptaki açıların ortalaması alınır (Ek III, nokta 4) [1].

| Tür | Akış açısı (2024/1834 madde 2) | Gazın çarktaki yolu (açıklama) | Kaynak notu | VentHub kategorisi |
|---|---|---|---|---|
| Aksiyel | 20 dereceden küçük [1] | Çarkın dönme ekseni doğrultusunda (eksenel) [5] | ABD Enerji Bakanlığı kılavuzu: hafif ve kompakt olma eğilimi [2] | Aksiyel fanlar [4] |
| Radyal (santrifüj) | 70 derece ve üzeri [1] | Çarka büyük ölçüde eksenel girer, eksene dik çıkar [5] | ABD Enerji Bakanlığı kılavuzu: havayı radyal yönde hızlandırır [2] | Radyal (santrifüj) fanlar; hücreli, plug ve gövdeli yapıları kapsar [4] |
| Karma akışlı | 20 derece ve üzeri, 70 dereceden küçük [1] | Santrifüj ve aksiyel tiplerin gaz yollarının arasında [5] | Üretici beyanı: helisel fanın yüksek debisi ile santrifüjün yüksek basıncını birleştirir [3] | Kanal tipi fanlar (karma akışlı aileler) [3][4] |

### Aksiyel fanlar

Aksiyel fan, havayı fanın dönme ekseni boyunca bir pervane gibi hareket ettiren fandır; hafif ve kompakt olma eğilimindedir [2]. AB tüzüğü eksenel (aksiyel) fanı akış açısı 20 dereceden küçük olan fan olarak tanımlar (madde 2(18)) [1]; yürürlükten kalkan 327/2011 madde 2 aynı fanı, gazı çarkın dönme ekseni doğrultusunda (eksenel yönde) iten fan olarak anlatıyordu [5].

### Radyal (santrifüj) fanlar

Radyal (santrifüj) fan, havayı radyal yönde hızlandırarak havanın yönünü değiştiren fandır; sağlam, sessiz ve güvenilirdir ve geniş bir koşul aralığında çalışabilir [2]. AB tüzüğü santrifüj fanı akış açısı 70 derece ve üzeri olan fan olarak tanımlar (madde 2(19)) [1]; yürürlükten kalkan 327/2011 madde 2 aynı fanı, gazın çarka büyük ölçüde eksenel yönde girdiği ve bu eksene dik yönde çıktığı fan olarak anlatıyordu [5]. Hangi fan tipinin uygulamaya uyduğu için [radyal ve aksiyel fan farkı rehberine](vh:yazi/radyal-aksiyel-fan-secimi) bakılabilir [4].

### Karma akışlı fanlar

Karma akışlı fan, çarktan geçen gaz yolu santrifüj ve aksiyel tiplerin gaz yolları arasında kalan fandır; yürürlükten kalkan 327/2011 madde 2 böyle anlatıyordu [5]. AB tüzüğü karma akışlı fanı akış açısı 20 derece ve üzeri, 70 dereceden küçük olan fan olarak tanımlar (madde 2(20)) [1]. Bir üreticinin kanal fanı kataloğu ürünlerini karma akışlı (mixed flow) kanal fanları olarak adlandırır [3]. Kanal tipi fanlar kategori sayfasında aynı tür "karışık akışlı" diye de yazılır [4].

## Fan seçimine nereden başlanır?

ABD Enerji Bakanlığı kılavuzu fan seçimine hava özellikleri, debi, basınç ve sistem yerleşimini bilerek başlanmasını söyler [2]. Kategori sayfaları kendi seçim sorularını verir; örneğin kanal tipi fanda seçimi kanal çapı veya kesiti, gereken debi, gürültü hassasiyeti ve hattın radon gibi özel bir tahliye görevi olup olmadığı belirler [4].

## VentHub'da hangi fan kategorileri ve serileri var?

Aşağıdaki kategoriler VentHub kataloğunun düzenidir ve her biri aynı ölçüte göre ayrılmamıştır: bazıları kullanım yerini (çatı, banyo, duman egzoz, şömine), bazıları yapıyı ya da malzemeyi (hücreli, plug, korozyona dayanımlı), biri işlevi (tavan vantilatörü) anlatır. Bu ayrım kaynaklı bir sınıflama değil, kataloğun düzeninin tarifidir. Bir fan hem bir akış yoluna hem bir kategoriye girebilir; örneğin hücreli aspiratör, kayış kasnaklı bir radyal fandır [4].

- Aksiyel fanlar kategorisi duvara monte edilen, düşük ve orta basınçlı aksiyel fanları kapsar [4]; modeller: [aksiyel fanlar](vh:kategori/axial-industrial-fans).
- Radyal (santrifüj) fanlar kategorisinin sayfası hücreli, plug ve gövdeli olmak üzere üç yapıyı tanıtır [4]; modeller: [radyal (santrifüj) fanlar](vh:kategori/centrifugal-fans).
- Kanal tipi fanlar havayı kanal hattının içinde taşır ve kanala seri bağlanır; kategoride karma akışlı iki LINEO ailesi (LINEO ve LINEO Quiet) de bulunur [3][4]; modeller: [kanal tipi fanlar](vh:kategori/duct-fans). Ayrıntı için [kanal tipi fan nedir rehberine](vh:yazi/kanal-tipi-fan-nedir), ses değeri için [sessiz fan rehberine](vh:yazi/sessiz-fan-secimi) bakın.
- Çatı tipi fanlar havayı binanın en üstünden dışarı atan, çatıya oturan fanlardır [4]; modeller: [çatı tipi fanlar](vh:kategori/roof-fans). Seçimde nelere bakıldığı için [çatı tipi fan rehberi](vh:yazi/cati-tipi-fan-nedir) okunabilir.
- Banyo ve tuvalet fanları nemin ve kokunun kaynağında alındığı küçük hacim fanlarıdır [4]; modeller: [banyo ve tuvalet fanları](vh:kategori/bathroom-toilet-fans).
- Duman egzoz fanları yangın hâlinde dumanı tahliye etmek üzere yüksek sıcaklıkta çalışmaya sertifikalı fanlardır [4]; modeller: [duman egzoz fanları](vh:kategori/smoke-exhaust-fans).
- Hücreli aspiratörler kayış kasnaklı hücreli radyal fanlardır [4]; modeller: [hücreli aspiratörler](vh:kategori/cabinet-fans).
- Plug fanlar geriye eğik kanatlı, tek emişli ve doğrudan tahrikli fanlardır [4]; modeller: [plug fanlar](vh:kategori/plug-fans); ayrıntı için [plug fan nedir, nerede kullanılır](vh:yazi/plug-fan-nedir) yazısına bakılabilir.
- Korozyona ve aside dayanımlı fanlar kategorisi santrifüj fanları kapsar [4]; modeller: [korozyona ve aside dayanımlı fanlar](vh:kategori/corrosion-and-acid-resistant-fans).
- Şömine ve baca fanları bacanın çekişini mekanik olarak destekleyen fanlardır [4]; modeller: [şömine ve baca fanları](vh:kategori/chimney-fans).
- Endüstriyel tavan vantilatörleri büyük hacimlerde havayı yavaş ama çok geniş bir alanda hareket ettiren büyük çaplı vantilatörlerdir; havayı dışarı atmaz, içerideki havayı karıştırır [4]; modeller: [endüstriyel tavan vantilatörleri](vh:kategori/industrial-ceiling-fans).

## Kanal tipi, hücreli aspiratör, çapraz akışlı ve plug fan nedir?

### Kanal tipi fanlar

Kanal tipi fanlar havayı kanal hattının içinde taşır ve kanala seri bağlanır [3][4]. Kanal tipi, bir kategoridir: VentHub'ın kanal tipi fan kategorisinde karma akışlı iki aile ile dikdörtgen kanal tipi radyal fanlar ailesi bulunur [3][4]. Ayrıntı için [kanal tipi fan nedir rehberine](vh:yazi/kanal-tipi-fan-nedir) bakın.

### Hücreli aspiratörler

Hücreli aspiratörler kayış kasnaklı hücreli radyal fanlardır [4]. Bir fan hem bir akış yoluna hem bir kategoriye girebilir; örneğin hücreli aspiratör, kayış kasnaklı bir radyal fandır [4].

### Çapraz akışlı fanlar

AB tüzüğü çapraz akışlı fanı, gaz yolu çarkın eksenine esasen dik olan ve çarka çevresinden girip çevresinden çıkan fan olarak tanımlar (madde 2(25)) [1]. İncelenen VentHub fan alt kategorileri arasında çapraz akışlı fan için ayrı bir kategori yoktur [4].

### Plug fanlar

Plug fanlar geriye eğik kanatlı, tek emişli ve doğrudan tahrikli fanlardır [4]; radyal (santrifüj) fanlar kategorisinin sayfası hücreli ve gövdeli yapılarla birlikte plug yapıyı da tanıtır [4]. Ayrıntı için [plug fan nedir, nerede kullanılır](vh:yazi/plug-fan-nedir) yazısına bakılabilir.

## Teklif için hangi bilgiler gerekir?

Bu yazı fiyat vermez ve fiyatı belirleyen etkenleri kaynakla sayamaz. Fan türü seçimini belirleyen girdiler hava özellikleri, debi, basınç ve sistem yerleşimidir [2]; kategoriye göre kanal çapı veya kesiti, çatı tipi ve eğimi ya da baca kesiti gibi girdiler eklenir [4]. Kategori sayfalarındaki ürünler için "Teklif İste" düğmesi bulunur [4].

## Bu yazının sınırları nelerdir?

Karma akışlı fanı diğer türlerle karşılaştıran bağımsız bir kaynak bu yazıda kullanılmamıştır; karma akışlı fanın avantajına ilişkin cümle bir üretici beyanıdır [3]. İncelenen VentHub fan alt kategorileri arasında çapraz akışlı fan için ayrı bir kategori yoktur, bu yüzden bu türün ürünleri yazıda ele alınmaz [4]. Tüzük jet fanı da ayrı bir kategori sayar (madde 2(1)) [1]; VentHub'daki otopark jet fanları kategorisi 3 Kasım 2026'da ürün listelemiyordu [4]. Jet fan bu yazıda tanımlanmaz.

Tablodaki gaz yolu sütunu okur için bir açıklamadır; tanım niteliğini yalnız akış açısı sütunu taşır [1]. Gaz yolu sütunu yürürlükten kalkan 327/2011 madde 2'nin anlatımına dayanır ve kullanılan metin legislation.gov.uk sitesindeki Birleşik Krallık sürümüdür [5]. 2024/1834 sayılı tüzük, 327/2011'i 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır (madde 9(1)) [1][6]; eski tüzüğün Ek I, II ve III'ü, (AB) 2025/2481 ile değiştirilen aynı fıkraya göre, başka ürünlere entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanları için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [6].

## Sık sorulan sorular

### Radyal fan mı santrifüj fan mı denir?

VentHub kataloğunda kategori "Radyal (Santrifüj)" adıyla anılır; VentHub kategori adı iki sözcüğü birlikte kullanır [4]. AB tüzüğünün tür tanımları arasında radyal fan yoktur, tür adı santrifüjdür (centrifugal); "radial" sözcüğü jet fan tanımında da geçer (madde 2(26)) [1]; yürürlükten kalkan 327/2011'de "radial" sözcüğü kanat biçimi için de geçiyordu [5].

### Karma akışlı fanın avantajı nedir?

Bir üretici kataloğu, karma akışlı çarkın helisel fanların yüksek debisini santrifüj fanların yüksek basıncıyla birleştirdiğini sayar [3]. Bu bir üretici beyanıdır; bu yazının kaynakları karma akışlı fanı diğer türlerle karşılaştırmaz.

### Kanal tipi fan hangi akış yoluna girer?

Kanal tipi, bir kategoridir. VentHub'ın kanal tipi fan kategorisinde karma akışlı iki aile ile dikdörtgen kanal tipi radyal fanlar ailesi bulunur [3][4]. Sayfada başka aileler de listelenir; onların akış yolu bu yazının kaynaklarında yoktur [4].

### Hücreli aspiratör hangi fan türüdür?

Hücreli aspiratörler kayış kasnaklı hücreli radyal fanlardır [4].

### Çapraz akışlı fan nedir?

AB tüzüğü çapraz akışlı fanı, gaz yolu çarkın eksenine esasen dik olan ve çarka çevresinden girip çevresinden çıkan fan olarak tanımlar (madde 2(25)) [1].

### VentHub'da hangi fan kategorileri var, teklif nasıl istenir?

Kategoriler yazının "VentHub'da hangi fan kategorileri ve serileri var?" bölümünde sıralanır; kategori sayfalarındaki ürünler için "Teklif İste" düğmesi bulunur [4].

## Kaynaklar

1. Avrupa Komisyonu, (AB) 2024/1834 sayılı Komisyon Tüzüğü, madde 2(1), 2(17)-(20), 2(25), 2(26) ve Ek III nokta 4, EUR-Lex (CELEX:32024R1834), ilk yayımlanan metin; (AB) 2025/2481 bu bentleri değiştirmez, madde 9(1) için 6 numaralı kaynağa bakınız: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1834 (erişim 03.11.2026)
2. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, PDF s. 7 ve 21. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 03.11.2026)
3. Vortice S.p.A., LINEO In-line mixed flow fans kataloğu, Cod. 5.170.084.547, Mayıs 2026 (son sayfada ayrıca 5.170.084.504, Şubat 2026 kodu da yazılıdır), s. 1, 4 ve 5 (bu çalışmada herkese açık bir adres doğrulanmadı; VentHub kaynak dizininde kayıtlıdır).
4. VentHub, fan alt kategorilerinin sayfaları (aksiyel, radyal, kanal tipi, çatı tipi, banyo ve tuvalet, duman egzoz, hücreli, plug, korozyona ve aside dayanımlı, şömine ve baca, endüstriyel tavan vantilatörleri, otopark jet fanları), canlı sitede 3 Kasım 2026'da ölçüldü: https://venthub.com.tr/tr/category/kanal-tipi-fanlar ve diğerleri aynı yol altında.
5. Avrupa Komisyonu, 327/2011 sayılı (AB) Tüzüğü, 2. madde (tanımlar: aksiyel fan, santrifüj fan, karma akışlı fan, çapraz akışlı fan, santrifüj radyal kanatlı fan); yürürlükten kalkmıştır, yalnız gaz yolu anlatımı için kullanıldı; Birleşik Krallık mevzuat sitesinde yayımlanan, Birleşik Krallık için değiştirilmiş sürüm, AB Resmî Gazete metniyle karşılaştırılmadı: https://www.legislation.gov.uk/eur/2011/327/article/2 (erişim 03.11.2026)
6. Avrupa Komisyonu, (AB) 2025/2481 sayılı Komisyon Tüzüğü (2024/1834'ü değiştiren tüzük), madde 1(4), Resmî Gazete (OJ L, 8.12.2025); metin EUR-Lex'ten alınan iki yerel kopyadan (HTML ve metin dışa aktarımı) okundu ve madde 9(1) bakımından Resmî Gazete metninin bir PDF kopyasıyla karşılaştırıldı, üçünde de aynıdır; EUR-Lex'in canlı sayfası 3 Kasım 2026'da bot doğrulaması verdiği için yeniden doğrulanamadı: http://data.europa.eu/eli/reg/2025/2481/oj

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Fan seçimi debi, basınç, ortam ve güvenlik gereklerine bağlıdır. Kurulum ve elektrik bağlantısı yetkili personelle yapılmalıdır. Katalog ve kategori bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-33), doğrulanmış metin: taslak v1m (sha aacd0e7bbd24). Makale çerçevesi (OPS-216, cetvel R3.3): markasız gövde, seri adları yalnız "VentHub'da hangi plug fan serileri var?" bölümünde ve Kaynaklar'da (toplam 4 ad; kapı en çok 8).
    // Kaynaklar: ASHRAE Terminology (plenum fan), IIR kaydı (Coward 1997), ABD Enerji Bakanlığı fan kılavuzu, Casals plug fan kataloğu CV092024 (VentHub kaynak dizini), VentHub kategori ve ürün sayfaları (3 Kasım 2026). Kayıtlı gövde sha 9fe065f9c225. Fiyat yok: kategori sayfası teklife yönlendirir.
    // Doğrulama: v1c-v1m, her turda tuzaklı + temiz kopya; son tur (9) tuzaklı 5/5, temiz yanlış 0. Recep okudu, yayın kararı Recep'te: birleşme ayrı OPS onayıyla; yayinTarihi birleşme gününe göre güncellenir.
    kimlik: 'plug-fan-nedir',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-06',
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/casals-enkelfan-ec-plug', 'vh:aile/casals-kentalfan-plug'],
    ilgiliKategoriler: ['vh:kategori/plug-fans'],
    diller: {
      tr: {
        slug: 'plug-fan-nedir',
        ozet: "Plug fan nedir? Çark ve tahrik yapısı, kullanım yerleri, seçim girdileri ve VentHub'daki plug fan serileri.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Plug fanın ne olduğunu, VentHub'daki iki seriyi ve seçimde gereken girdileri görmek için bu rehberden başlayın.",
        govde: `# Plug fan nedir, nasıl çalışır, nerede kullanılır?

Bir üreticinin kataloğunda EC ve IEC motorlu plug fanlar geriye eğik kanatlı, tek emişli, doğrudan tahrikli çarkı olan merkezkaç fanlardır [4]. Katalog bu fanları klima cihazı, plenum, kompresör, kurutucu, kabin ve fotovoltaik invertöre entegre edilmek üzere uygun görür [4]. Yazı çalışmayı, kullanım yerlerini ve seçim girdilerini sırayla anlatır.

Kısaca:

- Tahrik: ABD Enerji Bakanlığı kılavuzu doğrudan tahriki kayışlıya göre daha verimli, daha az yer kaplayan ve daha az bakım isteyen bir düzen olarak anar; doğrudan tahrikli fanın motorun devrinde dönmesi gerektiğini ve kullanım alanını sınırladığını da yazar [3].
- Seçim: ABD Enerji Bakanlığı kılavuzuna göre fan seçimi hava özellikleri, hava debisi, basınç ve sistem yerleşimini bilerek başlar [3].
- Seriler: VentHub'ın plug fan kategorisinde iki seri bulunur; biri harici rotorlu EC motorlu, biri IEC standart asenkron motorlu [5].

Plug fan, ASHRAE Journal'da 1997'de yayımlanan bir makalenin başlığında "unhoused (plug/plenum) fans" ifadesiyle geçen kasasız bir fan türüdür [2]; bir üreticinin kataloğundaki EC ve IEC motorlu plug fanlar geriye eğik kanatlı, tek emişli ve doğrudan tahrikli çarkı olan merkezkaç fanlardır [4]. ASHRAE sözlüğünde plenum fan girdisi vardır: tek girişli bir çarkla hava dağıtım sistemindeki bir plenum haznesini basınçlandıran fan düzeneği olarak tanımlanır [1]. Bu yazı fanın nasıl çalıştığını, nerelerde kullanıldığını ve seçimde hangi bilgilerin gerektiğini anlatır; VentHub'daki seriler en sonda kısaca sıralanır.

## Plug fan nasıl çalışır?

ABD Enerji Bakanlığı kılavuzunun sözlüğü merkezkaç fanı, havanın çarkın dönme eksenine dik yönde boşaltıldığı fan tasarımı olarak tanımlar; kanatları dönüş yönünden geriye doğru açılı fanlar bu kılavuzda merkezkaç fanların bir grubudur [3]. Katalogdaki EC ve IEC motorlu plug fanlarda çark geriye eğik kanatlı ve tek emişlidir [4]. ASHRAE sözlüğü plenum fan girdisinde çarkın tipik olarak kanat profilli ya da geriye eğik tasarımda olduğunu yazar; bu bilgi plenum fan içindir [1].

ABD Enerji Bakanlığı kılavuzu, çarkın motor miline doğrudan bağlandığı düzenin kayışlı tahrike göre daha yüksek verim, daha az yer ve daha az bakım gibi avantajları olduğunu belirtir [3]. Aynı kılavuz doğrudan tahrikli fanların motorun devrinde dönmesi gerektiğini ve bunun kullanılabilecekleri uygulamaları sınırladığını da yazar [3]. Plug fanların hepsi doğrudan tahrikli değildir: aynı katalogda doğrudan tahrikli serilerin yanında kayış tahrikli bir seri de yer alır [4].

ABD Enerji Bakanlığı kılavuzu doğrudan tahrikli fanın hız ayarını kayışlı düzene göre daha az esnek bulur; bu esnekliği eklemenin bir yolu olarak ayarlanabilir hız sürücüsünü gösterir [3]. Frekans dönüştürücünün ne işe yaradığı için [frekans konvertörü rehberine](vh:yazi/frekans-konvertoru), ürünler için [frekans konvertörleri kategorisine](vh:kategori/frequency-converters) bakılabilir.

## Hangi makinelerde kullanılır?

Katalogdaki EC ve IEC motorlu plug fanlar klima cihazlarına, plenumlara, kompresörlere, kurutuculara, kabinlere ve fotovoltaik invertörlere entegre edilmek üzere uygun görülür [4]. Bu kullanımlardan hangisinde hangi serinin tercih edileceği katalogda yazılı değildir [4].

Fan seçimi, ABD Enerji Bakanlığı kılavuzuna göre sistemin çalışma koşullarını bilerek başlar: hava özellikleri, hava debisi, basınç ve sistem yerleşimi [3]. Hava özellikleri nem, sıcaklık, yoğunluk ve kirlilik düzeyi gibi özellikleri kapsar [3].

## Seçimde hangi bilgiler gerekir?

Tablonun ilk üç satırı ABD Enerji Bakanlığı kılavuzunun fan seçimi ve doğrudan tahrikli fanda hız ayarı için verdiği bilgileri, son üç satır VentHub'ın plug fan kategorisinde seçimi belirleyen soruları gösterir.

| Girdi | Neyi belirler | Hangi kaynak sayıyor |
|---|---|---|
| Hava özellikleri, hava debisi, basınç ve sistem yerleşimi | Merkezkaç ya da eksenel fan türünden hangisinin gerektiğini birlikte belirler | ABD Enerji Bakanlığı kılavuzu [3] |
| Tahrik düzeni | Doğrudan tahrikli fan motorun devrinde döner, kayışlı düzene göre hız ayarı daha az esnektir | ABD Enerji Bakanlığı kılavuzu [3] |
| Hız ayarı ihtiyacı | Doğrudan tahrikte esnekliği ayarlanabilir hız sürücüsü ekler | ABD Enerji Bakanlığı kılavuzu [3] |
| Motor tipi | EC ya da IEC asenkron motor ailesi | VentHub plug fanlar kategorisi [5] |
| Besleme tipi | Tek faz ya da üç faz bağlantısı | VentHub plug fanlar kategorisi [5] |
| Model boyutu | Seri içinde model seçimi | VentHub plug fanlar kategorisi [5] |

## VentHub'da hangi plug fan serileri var?

VentHub'ın [plug fanlar](vh:kategori/plug-fans) kategorisinde iki Casals serisi bulunur: harici rotorlu EC motorlu [ENKELFAN](vh:aile/casals-enkelfan-ec-plug) ve IEC standart asenkron motorlu [KENTALFAN](vh:aile/casals-kentalfan-plug) [5]. İkisi de geriye eğik kanatlı, tek emişli ve doğrudan tahriklidir [4]. Model, besleme ve sıcaklık ayrıntıları ürün sayfalarındadır; ürün sayfalarında "Teknik Teklif İste" düğmesi bulunur [5].

## Teklif için hangi bilgiler gerekir?

Bu yazı fiyat vermez. VentHub'ın plug fan kategorisi seçimi hava debisi ve basınç, motor tipi, besleme tipi ve model boyutuna bağlar [5]; bu girdiler yukarıdaki tabloda toplanmıştır.

## Bu yazının sınırları nelerdir?

ASHRAE'nin tanımı plenum fan içindir; sözlükte plug fan adıyla yapılan sorguda girdi bulunamadı (tek yöntem: adres sorgusu) ve plug fan ile plenum fan arasındaki ilişki bu yazıda yalnızca bir makale başlığına dayanır; makalenin metnine erişilemediği için ayrıntıya girilmemiştir [1][2]. Katalogda ses değerinin ölçüm koşulu (mesafe, ortam) yazılı değildir, bu yüzden ses değerleri seriler arasında karşılaştırılmamalıdır [4]. İki motor tipi katalogda birbiriyle karşılaştırılmamıştır; bu yazı da bir üstünlük sonucu çıkarmaz [4].

## Sık sorulan sorular

### Plug fan ile plenum fan aynı şey midir?

ASHRAE sözlüğündeki tanım plenum fan içindir [1]. ASHRAE Journal'daki bir makalenin başlığı iki adı "plug/plenum" diye yan yana kullanır [2]; bu, iki adın yakın bir fan türü için kullanıldığına dair tek kaynaklı bir işarettir, bir tanım değildir.

### Plug fan her zaman doğrudan tahrikli midir?

Hayır. Katalogdaki EC ve IEC motorlu seriler doğrudan tahriklidir, bir seri ise kayış tahriklidir [4].

### Plug fanın koruma sınıfı nedir?

Katalogdaki EC motorlu plug fanın motoru IP54 korumalı ve B sınıfı yalıtımlıdır, IEC asenkron motorlu olanın motoru IP55 korumalı ve F sınıfı yalıtımlıdır [4]. IEC asenkron motorlu seri için talep üzerine 100 °C'ye ve IP66'ya kadar farklı üretim de mümkündür [4].

### Plug fan hangi sıcaklıkta çalışır?

Katalogdaki EC motorlu plug fanın çalışma sıcaklığı modele göre -20 ile 60 °C arasından -30 ile 40 °C arasına kadar değişir, IEC asenkron motorlu olanın sürekli çalışma sıcaklığı en çok 60 °C'dir [4].

### VentHub'da hangi plug fan serileri var, teklif nasıl istenir?

VentHub'ın plug fanlar kategorisinde EC motorlu ve IEC asenkron motorlu iki seri bulunur; ürün sayfalarında "Teknik Teklif İste" düğmesi vardır [5].

## Kaynaklar

1. ASHRAE, ASHRAE Terminology (A Comprehensive Glossary of Terms for the Built Environment), "plenum fan" girdisi; "plug fan" ve "unhoused fan" sorgularında girdi bulunamadı (tek yöntem: adres sorgusu). https://terminology.ashrae.org/?entry=plenum%20fan (erişim 03.11.2026)
2. C. W. Coward, "Unhoused (plug/plenum) fans: is their performance predictable?", ASHRAE Journal, cilt 39, sayı 10, Ekim 1997. Bibliyografik kayıt: International Institute of Refrigeration, kayıt no 1998-3086, https://iifiir.org/en/fridoc/unhoused-plug-plenum-fans-is-their-performance-predictable-109693 (yalnız kayıt okundu; makale metnine erişilmedi; erişim 03.11.2026)
3. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, PDF s. 8, 15, 21, 51, 79 ve 80 (basılı s. 4, 11, 17, 47, 75 ve 76). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 03.11.2026)
4. Casals, Plug fans — Technical Catalogue / Catálogo técnico (revizyon kodu CV092024), PDF s. 12, 16, 20 ve 21 (basılı s. 10, 14, 18 ve 19); VentHub kaynak dizininde kayıtlıdır (pdf_hash b7c9ad9cab1e).
5. VentHub, plug fanlar kategori sayfası ile iki ürün ailesi sayfası, canlı sitede 3 Kasım 2026'da ölçüldü: https://venthub.com.tr/tr/category/plug-fanlar, https://venthub.com.tr/tr/products/casals-enkelfan-ec-plug ve https://venthub.com.tr/tr/products/casals-kentalfan-plug

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Fan seçimi debi, basınç, ortam ve güvenlik gereklerine bağlıdır. Kurulum ve elektrik bağlantısı yetkili personelle yapılmalıdır. Katalog ve ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-45), doğrulanmış metin: taslak v12 (sha a97bd48354c6). Makale çerçevesi (cetvel R3.3): markasız gövde, seri adları yalnız "VentHub'da hangi korozyona dayanıklı fan serileri var?" bölümünde ve Kaynaklar'da.
    // Doğrulama: dört tur tam okuma, her turda tuzaklı + temiz kopya (tuzaklar 6/6, 7/7, 7/7, 7/7); GEO-SEO taslak okuması uygun; mevzuat satırları MEVZUAT paketinden (07.11.2026). Recep onayı 08.11.2026 (OPS). Fiyat, sıcaklık sınırı ve debi/basınç aralığı yok: kaynakta tek ve tarihli değer yok.
    kimlik: 'asit-fani-nedir-korozyona-dayanikli-fan-secimi',
    konu: 'guvenlik',
    yayinTarihi: '2026-11-08',
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/seat-serisi', 'vh:aile/jet-serisi', 'vh:aile/storm-serisi'],
    ilgiliKategoriler: ['vh:kategori/corrosion-and-acid-resistant-fans'],
    diller: {
      tr: {
        slug: 'asit-fani-nedir-korozyona-dayanikli-fan-secimi',
        ozet: "Asit fanı, yani korozyona dayanıklı fan nedir? Hangi ortamlarda gündeme gelir, PP asit fanı dahil hangi malzemeler anılır, motor nerede olmalı, ATEX ile ilişkisi.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Asit fanının ne olduğunu, hangi ortamlarda gündeme geldiğini ve malzeme, motor yeri ile ATEX açısından neye bakılacağını görmek için bu rehberden başlayın.",
        govde: `# Asit fanı nedir? Korozyona ve kimyasala dayanıklı fan nasıl seçilir

Asit fanı, havadaki aşındırıcı gaz, buhar ya da damlacıklara dayanacak malzemelerle yapılan fandır. Laboratuvar çeker ocağı, kapalı yüzme havuzu ve atık su arıtma kaynaklarda aşındırıcı ortam örnekleri olarak geçer [2][5][6]. Malzeme seçimi, kaynaklara göre tahliye edilen maddelerle uyuma bağlıdır; anılan malzemeler arasında polipropilen, PVC, cam elyaf ve kaplamalı çelik vardır [2][3][4].

Kısaca:

- Ortam: Texas State Üniversitesi'nin çeker ocak standardı çok korozif koşullarda cam elyaf, PVC ya da eşdeğeri fan önerir; bu tek bir üniversitenin kendi standardıdır [2].
- Motor: aynı standart, motorun kolay erişim için ve kirlenmesini önlemek amacıyla egzoz kanalının dışına monte edilmesini önerir [2].
- Seçim: yazarın derlemesine göre tahliye edilen maddeler listelenir, malzeme her madde için föylerden ve kılavuzlardan doğrulanır [2][3][4].

Asit fanı, havadaki aşındırıcı gaz, buhar ya da damlacıkların parçalarını bozmayacağı malzemelerle yapılan fandır. Bu yazı asit fanının hangi ortamlarda gündeme geldiğini, kaynaklarda hangi malzemelerin anıldığını, motorun yerini ve patlayıcı ortam (ATEX) ile ilişkisini anlatır; kaynaklar yazının sonunda listelenir.

## Asit fanı nedir?

Bu yazıda asit fanı, korozyona dayanıklı fan ve kimyasal dayanımlı fan aynı anlamda kullanılır. Polipropilenden (PP) yapılan asit fanına bu yazıda PP asit fanı denir. ABD'deki Texas State Üniversitesi'nin çeker ocak egzozu için yazdığı standart, egzoz kanalının, fanın ve yıkayıcının malzemesinin çeker ocakta kullanılan maddelerle uyumlu seçilmesini ister [2].

## Asit fanı ve korozyona dayanıklı fan hangi ortamlarda gündeme gelir?

VentHub'da bu ortamlar için [korozyona ve aside dayanımlı fanlar kategorisi](vh:kategori/corrosion-and-acid-resistant-fans) bulunur.

### Laboratuvar çeker ocağı

Laboratuvar çeker ocağı bu ortamlardan biridir. Texas State Üniversitesi'nin çeker ocak standardı egzoz fanı için korozyon düzeyine göre malzeme ayırır: çok korozif koşullarda cam elyaf, PVC ya da eşdeğeri fanlar kullanılmalı; düşük ve orta korozif koşullarda kaplamalı çelik, cam elyaf ya da PVC fanlar kullanılabilir [2]. Bu, tek bir üniversitenin kendi standardıdır.

### Kapalı yüzme havuzu

Kapalı yüzme havuzu bir diğer örnektir. Euro Inox'un havuz ortamında paslanmaz çelik rehberi kapalı havuz atmosferini yapı ortamında bulunabilecek en aşındırıcı ortamlardan biri olarak niteler ve en kötü korozyon koşullarının havuz suyuyla temas noktasında değil, havuzun üzerindeki havada, örneğin asma tavanların arkasında oluştuğunu yazar [6]. ABD Hastalık Kontrol ve Önleme Merkezleri (CDC) havuz havasındaki yüksek kloramin ve diğer uçucu bileşik düzeylerinin metal yapıları ve ekipmanı da bozabileceğini belirtir [7]; su arıtmada kullanılan kimyasalların aşındırıcı doğası nedeniyle, yanma ekipmanı bulunan ekipman odalarında tüm ekipmanda, özellikle yanma ekipmanında, korozyon beklenmesi gerektiğini de yazar [8]. Alıntılanan sayfalar fanı anmaz, yapı parçalarından ve ekipman odası ekipmanından söz eder; havuz ortamında fanın da gündeme gelebileceği yazarın çıkarımıdır.

### Atık su arıtma

Atık su arıtma tesisleri de kanal sisteminden geçen en aşındırıcı gazlardan bazılarını üretir; bir üreticinin cam elyaf takviyeli plastik (FRP) fan kataloğu bunlar arasında hidrojen sülfür, metan, amonyak ve klor sayar [5].

## Korozyona dayanıklı fanlarda hangi malzemeler kullanılır?

Kaynaklarda anılan malzemeler aşağıdaki tabloda toplanmıştır. Tablo malzemeleri iyiden kötüye sıralamaz; kaynaklar malzeme uyumunu tahliye edilen maddelere bağlar [2].

| Malzeme | Kaynakta ne yazıyor | Kaynak |
|---|---|---|
| Polipropilen (PP) | Asitlere ve alkalilere karşı çok iyi direnç gösterir. Aromatik, alifatik ve klorlu çözücülerde ve derişik nitrik asit gibi güçlü asitlerde zayıf kalır. Bir kimyasal direnç kılavuzu pH değeri değişen sistemler için kullanılacak en uygun malzemelerden biri olduğunu yazar | [3][4] |
| PVC | Çeker ocak egzozunda, çok korozif koşullarda cam elyafla birlikte, düşük ve orta korozif koşullarda da anılır | [2] |
| Cam elyaf (FRP) | Çeker ocak egzozunda çok korozif koşullar için anılır; bir FRP fan kataloğu hava akımına açık çelik parça bulunmadığını yazar | [2][5] |
| Kaplamalı çelik | Çeker ocak egzozunda düşük ve orta korozif koşullar için anılır; kimyasal etkiye karşı kanal için de kaplamalı yumuşak çelik gerekebilir | [1][2] |

Tablodaki polipropilen satırı bir malzeme föyüne ve bir kimyasal direnç kılavuzuna dayanır, fan föyüne değil [3][4]. Malzemelerin sıcaklık sınırı ayrıca belgelenir; bu yazıda sıcaklık sınırı verilmez, ilgili modelin ürün föyündeki değere bakılır.

## Korozyona dayanıklı fanın motoru nerede olmalı?

Çeker ocak standardı, fan motorunun kolay erişim için ve motorun kirlenmesini önlemek amacıyla egzoz kanalının dışına monte edilmesini önerir [2]. İngiltere Sağlık ve Güvenlik Kurumu'nun (HSE) yerel egzoz havalandırması kılavuzu ise kanal içindeki aksiyel fanı anlatırken, kirleticinin yanıcı ya da korozif olmadığı durumda motorun da kanalın içinde olduğunu yazar [1]. İki kaynak birlikte okunduğunda, kirletici korozifse motoru hava akımının dışında tutma yönünde bir ilke ortaya çıkar [1][2]; bu, yazarın çıkarımıdır.

## Korozyona dayanıklı fan ile ATEX aynı şey midir?

Üretici belgeleri patlayıcı ortama uygun sürümü ATEX adıyla anar ve 94/9/CE direktifine atıf yapar [13][14]; bu direktif 20 Nisan 2016'dan itibaren 2014/34/AB sayılı direktifle yürürlükten kaldırılmıştır [9]. 2014/34/AB direktifi muhtemel patlayıcı ortamda kullanılması amaçlanan teçhizatı ve koruyucu sistemleri kapsar; muhtemel patlayıcı ortamı yerel ve işletme koşulları nedeniyle patlayıcı hale gelebilecek ortam olarak tanımlar [9]. Türkiye'de muhtemel patlayıcı ortamda kullanılan teçhizata ilişkin yönetmelik 30 Haziran 2016 tarihli ve 29758 sayılı Resmî Gazete'de yayımlanmış ve yayımı tarihinde yürürlüğe girmiştir [10].

Korozyona dayanım fanın malzemesinin aşındırıcı maddelerle uyumuyla, patlayıcı ortama uygunluk ise teçhizatın patlayıcı ortamda kullanılmasıyla ilgilidir [2][9]; biri diğerinin yerine geçmez; bu, yazarın çıkarımıdır. Bir ortam ikisini birden taşıyabilir: bir FRP fan kataloğu atık suda en yaygın gaz olan hidrojen sülfürün yüksek derecede patlayıcı olduğunu yazar ve bu yüzden patlamaya dayanıklı motor kullanılmasını, fan gövdesinin iç yüzeyinin de statik elektriğe karşı topraklanmasını önerir [5].

2014/34/AB direktifinin Ek I bölümü, gaz, buhar, sis ya da hava/toz karışımı kaynaklı patlayıcı ortamın olası olmadığı ya da olsa bile seyrek ve kısa süreli olduğu yerler için tasarlanan teçhizatı kategori 3 olarak tanımlar [9]. Çalışanların korunmasına ilişkin 1999/92/AT sayılı direktif, normal çalışmada gaz, buhar veya sis halinde patlayıcı ortamın oluşmasının beklenmediği ve oluşsa da yalnızca kısa süre kalacağı yeri Bölge 2 olarak tanımlar; Bölge 2 ya da Bölge 22 için de, uygun olmaları koşuluyla, kategori 1, 2 veya 3 ekipmanı kabul eder [11]. Türkiye'de Çalışanların Patlayıcı Ortamların Tehlikelerinden Korunması Hakkında Yönetmelik (30 Nisan 2013 tarihli, 28633 sayılı Resmî Gazete) de Bölge 2 veya Bölge 22 için kategori 1, 2 veya 3 ekipmanı sayar [12].

## Asit fanı seçerken hangi adımlar izlenir?

Seçim, kaynaklardaki ilkelerden derlenen şu sırayla yapılabilir; sıra yazarın derlemesidir.

1. Tahliye edilecek maddeleri listeleyin; malzeme, bu maddelerle uyumuna göre seçilir [2].
2. Her malzemeyi madde bazında kimyasal direnç kılavuzlarında ya da föylerde doğrulayın [3][4].
3. Hava yoluna giren parçaların, yani kanalın, fanın ve varsa yıkayıcının malzemesini birlikte değerlendirin [1][2].
4. Motorun hava akımı içinde mi dışında mı olacağını belirleyin [1][2].
5. Ortamda patlayıcı atmosfer ihtimali varsa bunu korozyondan ayrı değerlendirin [9][11].
6. Teklif için gereken bilgileri toplayın (aşağıda).

Fan türlerinin genel sınıflaması için [fan çeşitleri rehberi](vh:yazi/fan-cesitleri), santrifüj ve aksiyel fanların ayrımı için [radyal ve aksiyel fan seçimi rehberi](vh:yazi/radyal-aksiyel-fan-secimi) okunabilir.

## Sık sorulan sorular

### PP (polipropilen) asit fanı her kimyasala dayanır mı?

Hayır. Bir polipropilen malzeme föyü, polipropilenin asitlere ve alkalilere karşı çok iyi, aromatik, alifatik ve klorlu çözücülere karşı zayıf dirençli olduğunu yazar [3]. Bir kimyasal direnç kılavuzu da polipropilenin derişik nitrik asit gibi güçlü asitlerde, klorlu hidrokarbonlarda, aromatik bileşiklerde ve yüksek derişimli serbest klorda uygun olmadığını belirtir [4]. Fanın kendi dayanımı ise modelin ürün föyündeki bilgiyle belirlenir.

### PP asit fanı santrifüj fan mıdır?

Üretici belgelerine göre SEAT, JET ve STORM serilerinin çarkı ileri eğimli santrifüj tipte, enjeksiyonla kalıplanmış PPH'den yapılır; JET serisi ayrıca çatı kaidesine monte, dikey boşaltmalı hat içi santrifüj fan olarak tanımlanır [13][14]. Santrifüj ve aksiyel fan ayrımı için [radyal ve aksiyel fan seçimi rehberi](vh:yazi/radyal-aksiyel-fan-secimi) okunabilir.

### Paslanmaz çelik korozif ortamda her zaman güvenli midir?

Hayır. Euro Inox rehberi, havuz atmosferinde 1.4301 (304) kalite paslanmaz çelik askı çubuklarındaki gerilimli korozyon çatlamasının 1985'te İsviçre'nin Uster kentindeki bir kapalı havuzun beton tavanının çökmesine yol açtığını anlatır [6]. Rehber, asma tavan bağlantı elemanları için yüksek alaşımlı paslanmaz çelikleri "şart" sayar [6]. Bu bulgu yapısal parçalar içindir; fanlar için ayrı bir değerlendirme gerekir; bu, yazarın çıkarımıdır.

### Kanalın ve yıkayıcının malzemesi de önemli mi?

Evet. Çeker ocak standardı egzoz kanalı, fan ve yıkayıcı malzemelerinin çeker ocakta kullanılan maddelerle uyumuna göre seçilmesini ister; kanal için termoplastik malzemelerin kullanılmamasını da şart koşar [2]. HSE kılavuzu da kimyasal etkiye karşı kanal için kaplamalı yumuşak çelik gerekebileceğini, korozif olmayan düşük sıcaklıklı uygulamalarda ise alüminyum ya da plastiğin (PVC, polipropilen) uygun olabileceğini yazar [1].

### FRP fanda hava akımına açık çelik parça tamamen yok mu?

Bir FRP fan kataloğu hava akımına açık çelik parça bulunmadığını yazar; aynı katalog hava akımıyla temas eden bağlantı elemanlarının paslanmaz çelikten olduğunu ve yangın geciktirici polyesterle kapsüllendiğini belirtir [5].

### VentHub'da asit fanı fiyatı için teklif nasıl alınır?

Ürün sayfalarındaki "Teknik Teklif İste" düğmesiyle teklif istenir; gereken bilgiler "Teklif için hangi bilgiler gerekir?" bölümünde sıralanır.

## VentHub'da hangi korozyona dayanıklı fan serileri var?

VentHub'un [korozyona ve aside dayanımlı fanlar kategorisinde](vh:kategori/corrosion-and-acid-resistant-fans) üç aile listelenir: [SEAT serisi](vh:aile/seat-serisi), [JET serisi](vh:aile/jet-serisi) ve [STORM serisi](vh:aile/storm-serisi). Üretici belgelerine göre SEAT serisinin gövdesi UV işlemli polipropilenden (PPH), çarkı enjeksiyonla kalıplanmış PPH'den yapılır [13]; JET ve STORM serilerinin gövdesi de polipropilendir, yalnız STORM 10'un gövdesi polietilendir [14]. Üç serinin belgesinde de motorun hava akımının dışında olduğu yazılıdır [13][14].

Üretici, ürünlerini tanıttığı bölümde uygulama alanları olarak laboratuvarları, kimya sanayiini, su arıtma tesislerini, hastaneleri, elektrokaplamayı ve üniversiteleri sayar [13]. JET serisi laboratuvar egzozu ve kimya sanayii gibi çok aşındırıcı uygulamalar için tanımlanır [14]. STORM serisi güvenlik kabinleri (STORM 10), yıkayıcılar, duman yakalama kolları ve filtre muhafazaları (STORM 12, 14, 16) için anılır [14]. Üç serinin belgelerinde de ATEX paragrafı yer alır; paragraf "SEAT Series Fans" için Zone II, kategori 3 G seçeneğinden söz eder [13][14]. Çap, model sayısı ve teknik değerler aile ve ürün sayfalarındadır.

## Teklif için hangi bilgiler gerekir?

Bu yazıda fiyat verilmez; güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklif için şu bilgileri hazırlayın: tahliye edilecek maddeler ve ortam, hava debisi ve basınç, tek faz ya da üç faz tercihi, motorun hava akımına göre konumu, patlayıcı ortam (ATEX) ihtimali ve montaj alanı. Bu liste, kaynaklardaki malzeme uyumu [2], motor yeri [1][2], fan boyutlandırması [2] ve patlayıcı ortam [9] ilkelerinden yola çıkan yazarın derlemesidir; tek faz ya da üç faz tercihi ve montaj alanı ilke kaynaklarına bağlanmamıştır.

## Kaynaklar

Sayfa numaraları PDF sayfa sırasıdır. Kaynak [1], [2], [5], [7] ve [8] ABD ve İngiltere kaynaklarıdır, [6] Avrupa merkezli bir paslanmaz çelik birliğinin rehberidir; hepsi ilke örneği olarak kullanılmıştır; Türkiye için geçerli hükümler ilgili Türk resmî metinlerinde aranmalıdır. Kaynak [5], [13] ve [14] üreticilerin kendi belgeleridir ve ürünlerini anlatır; tarafsız kaynak sayılmaz. Kaynak [6] paslanmaz çeliğin havuz ortamında kullanımına ilişkin bir rehberdir. Kaynak [3] ve [4] fan için değil, bir malzeme föyü ve bir kimyasal direnç kılavuzu olarak hazırlanmıştır.

1. UK Health and Safety Executive (HSE), HSG258 Controlling airborne contaminants at work: A guide to local exhaust ventilation (LEV), 3. baskı, 2017, s. 52 (¶172), s. 56 (¶190). https://www.hse.gov.uk/pubns/priced/hsg258.pdf (erişim 07.11.2026)
2. Texas State University, EHSRM Fume Hood Standard, "Exhaust System (General)", "Exhaust Ducts" ve "Exhaust Fan" bölümleri. https://gato-docs.its.txst.edu/risk-management/ehsrm-labsfty/EHSRM-Fume-Hood-Standard (erişim 07.11.2026)
3. White Knight (WK) Fluid Handling, Polypropylene (PP) malzeme föyü (27.02.2025), "General Properties". https://wkfluidhandling.com/wp-content/media/materials/pp-polypropylene.pdf (erişim 07.11.2026)
4. Chemline, Chemical Resistance Guide (CRG.11.03.2023), polipropilen bölümü. https://www.jmesales.com/content/docs/Chemline/Chemline.Chemical-Resistance-Guide.11.03.2023-1.pdf (erişim 07.11.2026)
5. Greenheck, BCSW-FRP Centrifugal Fans kataloğu (Nisan 2019), "Wastewater Treatment" ve "Corrosion Resistance" bölümleri, "Construction Features". https://content.greenheck.com/public/DAMProd/Original/10002/BCSWFRP_catalog.pdf (erişim 07.11.2026)
6. Euro Inox, Safe use of stainless steel in swimming pool environments, 2013, s. 5, 6, 7. https://www.edelstahl-rostfrei.de/fileadmin/user_upload/ISER/downloads/Safe_use_swimmingpools_EN.pdf (erişim 07.11.2026)
7. CDC, Model Aquatic Health Code 2018 ekleri, Preventing In-line Production of Toxic Chlorine Gas Events, s. 3. https://www.cdc.gov/model-aquatic-health-code/media/pdfs/Mini-MAHC-ANNEX-Chlorine-Gassing-508.pdf (erişim 07.11.2026)
8. CDC, Model Aquatic Health Code 2018 ekleri, Preventing Pool Chemical Injuries, s. 4. https://www.cdc.gov/model-aquatic-health-code/media/pdfs/Mini-MAHC-Annex-Preventing-Pool-Chemical-Injuries-508.pdf (erişim 07.11.2026)
9. Avrupa Parlamentosu ve Konseyi, Direktif 2014/34/AB (26 Şubat 2014, özgün metin), md. 1, md. 2(5), md. 43, Ek I. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0034 (erişim 07.11.2026)
10. Resmî Gazete, 30 Haziran 2016, sayı 29758, muhtemel patlayıcı ortamda kullanılan teçhizata ilişkin yönetmelik, md. 43(1). https://www.resmigazete.gov.tr/eskiler/2016/06/20160630-13.htm (erişim 25.09.2026; MEVZUAT kontrolü 07.11.2026)
11. Avrupa Parlamentosu ve Konseyi, Direktif 1999/92/AT, Ek I md. 2 ve Ek II Bölüm B. http://publications.europa.eu/resource/celex/31999L0092 (erişim 06.11.2026)
12. Resmî Gazete, 30 Nisan 2013, sayı 28633, Çalışanların Patlayıcı Ortamların Tehlikelerinden Korunması Hakkında Yönetmelik (MEVZUAT kontrolü, 07.11.2026).
13. SEAT, SEAT Series kataloğu (dosya adı SEAT-CATALOGUE.pdf), s. 5, 6 ve SEAT.pdf, s. 1 (üretici belgesi).
14. SEAT, JET (JET.pdf, s. 1) ve STORM (Storm_series.pdf, s. 1) belgeleri (üretici belgesi).

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Katalog değerleri model ve çalışma noktasına göre değişebilir; kendi sisteminizde farklı çıkabilir. Kurulum yetkili personel tarafından yapılmalıdır.
`,
      },
    },
  },
  {
    // BLOG (BLG-49), doğrulanmış metin: taslak v4 (sha f643f2b4d662). Makale çerçevesi (cetvel R3.3): markasız gövde, marka ve seri adları yalnız "VentHub'da hangi çatı tipi fan serileri var?" bölümünde ve Kaynaklar'da.
    // Doğrulama: dört tur tam okuma, her turda tuzaklı + temiz kopya (tuzaklar 5/5, 5/5, 5/5, 4/4); son tur temiz kopyada yanlış 0. Recep onayı 08.11.2026 (OPS). Mevzuat cümlesi yok (MEVZUAT paketi gerekmedi), fiyat yok: ürün sayfaları teklife yönlendirir.
    // Çatı fanına özgü bağımsız seçim kaynağı bulunamadı; seçim cümleleri üretici beyanı olarak etiketlidir, HSE ve CIBSE atış ilkesi olarak okunur (mesafe rakamı yok).
    kimlik: 'cati-tipi-fan-nedir',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-08',
    guncellemeTarihi: '2026-11-08',
    urunler: ['vh:aile/vortice-slimroof-cati-fanlari'],
    ilgiliKategoriler: ['vh:kategori/roof-fans'],
    diller: {
      tr: {
        slug: 'cati-tipi-fan-nedir-nasil-secilir',
        ozet: "Çatı tipi fan nedir? Çatıdan egzoz atarken hangi ilke belirleyicidir, çatıda hangi fan türleri kullanılır, seçimde hangi bilgiler gerekir ve VentHub'da hangi çatı tipi fan serileri var.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Çatı tipi fanın ne anlama geldiğini, egzoz atışında nelere dikkat edildiğini ve seçimde gereken bilgileri görmek için bu rehberden başlayın.",
        govde: `# Çatı tipi fan nedir, nasıl seçilir?

Bu yazıda çatı tipi fan, çatıya monte edilip havayı binanın dışına atan fan anlamında kullanılır; üretici sayfalarında terim egzoz çatı fanları için bu anlamda geçer, bazı üreticiler besleme çatı fanlarını da aynı adla sunar [4][6][8]. Bu yazı iki soru üzerinde durur: atılan hava binaya geri girecek mi [2] ve fan hangi koşulda çalışacak [1].

Kısaca:

- Atış yeri: kirletici ihmal edilebilir derişime inmedikçe egzoz havası binaya ya da başka binalara geri girmemeli; atış noktası binanın en yüksek noktasının belirgin biçimde üstünde olmalı [2].
- Fan türü: çatıda eksenel, merkezkaç ve karışık akışlı fanlar kullanılır; "çatı tipi" adı yerleşimi anlatır, tek bir fan türünü değil [1][4][6][8].
- Seçim girdileri: hava özellikleri, debi, basınç ve sistem yerleşimi; fazla büyük fan enerji ve bakım maliyetini artırır [1].
- Üretici beyanı: başlık, bakım erişimi ve motor seçenekleri üreticilere göre değişir; bu bilgiler üretici anlatımıdır [4][5][6].

## Çatıdan egzoz atarken hangi ilke belirleyicidir?

İngiltere Sağlık ve Güvenlik İdaresi'nin (HSE) yerel egzoz havalandırması rehberi, çekilen havanın temizlenmiş olsun olmasın, kirletici ihmal edilebilir derişime inmedikçe binaya ya da başka binalara geri girmemesi gerektiğini yazar [2]. Aynı rehber hedefi, havanın bina çevresindeki dolaşım girdaplarının ötesine atılması olarak koyar ve atış noktasının binanın en yüksek noktasının belirgin biçimde üstünde olmasını ister [2]. CIBSE'nin genel havalandırma rehberi de, yerel egzozlu sistemleri anlattığı yerde, egzoz havasının kapı, pencere ve diğer hava girişlerinden uzak tutulmasını söyler [3].

Bir üreticinin çatı fanı sayfası aynı amacı yukarı atışlı bir düzenle anlatır: karışık akışlı fan, egzoz havasının yeniden emilimini önlemek için kirleticileri binadan uzağa atar [6]. İlk iki kaynak çatı fanına özgü değildir: HSE rehberi işyerinde kirletici tahliyesi, CIBSE rehberi genel havalandırma için yazılmıştır [2][3]. Bu yüzden ilke olarak okunmalıdır; mesafe ya da yükseklik rakamı olarak değil.

## Çatıda hangi fan türleri kullanılır?

ABD Enerji Bakanlığı kılavuzu fanları iki ana türe ayırır: eksenel fanlar havayı fanın ekseni boyunca hareket ettirir, merkezkaç fanlar havayı radyal yönde hızlandırır; iki türün basınç, debi ve verimde örtüşen yetenekleri vardır ama genellikle birbirinin yerine kullanılamazlar [1]. Bir üreticinin fan türleri sayfası ise bir sınıflamayı havanın fan içindeki yörüngesine göre yapar ve santrifüj ile eksenelin yanına karışık akışlı (helikosantrifüj) türü ekler [4]. Çatıda üç türün de örneği görülür:

| Tür | Çatıdaki örnek | Kaynak |
|---|---|---|
| Eksenel (pervane tipi) | Pervane tipi fanlar yüksek debiyi düşük basınçta verir ve çatı havalandırmasında sık kullanılır | ABD Enerji Bakanlığı kılavuzu [1] |
| Merkezkaç (santrifüj) | Bir üreticinin çatıya monte, dikey atışlı, hat içi santrifüj fan serisi, laboratuvar egzozu ve kimya endüstrisi gibi çok korozif uygulamalar için anlatılır | Üretici beyanı [8] |
| Karışık akışlı | Bir üretici, egzozun yeniden emilimini önlemek için çatıda yukarı atışlı kayışlı karışık akışlı fan sunar | Üretici beyanı [6] |

## Üreticiler çatı fanlarını nasıl anlatıyor?

Aşağıdakiler üreticilerin kendi sayfalarındaki beyanlardır [4][5][7]. Bir üretici çatı fanı aralığının konut, ticari (tersiyer) ve endüstriyel uygulamaları kapsadığını yazar [4]. Aynı üreticinin bir serisi hava sıkılığı yüksek ve bakımı kolay, plastik ya da alüminyum başlıklıdır; eğilebilir sistemi tam sökmeden bakıma izin verir [4]. Bir başka seri yüksek verimli EC motorlu, bir diğeri kimya, petrokimya, laboratuvar ya da çeker ocak gibi ortamlarda korozyona dayanacak biçimde tasarlanmıştır [4].

İkinci bir üretici (ilk üreticinin sayfa altbilgisi, ikinci üreticinin adını taşıyan bir grup listesi verir [4][5]), başlığın yuvarlak tasarımının yağmur girişi riskini azalttığını, koruyucu başlığın motor ve pervane bakımı için kolayca çıkarıldığını ve EC motorun entegre elektronik kontrolle motoru optimum yükte çalıştırdığını bildirir [5]. Üçüncü bir üretici, dikey atışla egzoz havası çekmek için tasarladığı çatı fanı serisinin mutfak egzozu, proses havası ve sanayi fırınları gibi uygulamalarda tercih edilebileceğini ve sürekli çalışmada 120 °C'ye kadar hava sıcaklığına uygun olduğunu yazar [7].

## Teklif için hangi bilgiler gerekir?

Bu yazı fiyat vermez; bu iki ürün ailesinin sayfalarında fiyat gösterilmez, teklif istenir [9]. Fan seçiminin girdileri kılavuzda şöyle sayılır. ABD Enerji Bakanlığı kılavuzuna göre fan seçimi sistemin çalışma koşullarının bilinmesiyle başlar: hava özellikleri (nem, sıcaklık, yoğunluk, kirlilik düzeyi), hava debisi, basınç ve sistem yerleşimi; bu koşullar eksenel ya da merkezkaç fandan hangisinin gerektiğini belirler [1]. Aynı kılavuz belirsizlikleri fazla büyük fanla karşılamayı sorun sayar: yüksek enerji maliyeti, yüksek bakım ve azalan sistem güvenilirliği [1]. VentHub'ın çatı tipi fanlar kategorisi seçimi belirleyen soruları çatı tipi ve eğimi, gereken debi ve tahliye edilen havanın niteliği olarak sıralar [9].

Tahrikte kılavuz bir denge anlatır: eksenel fanlarda doğrudan tahrik motoru fanın arkasında, düşük sıcaklıkta ve temiz havada, hava akımıyla soğutabilir ama motora erişimi bir ölçüde kısıtlar, kayışlı tahrik ise fan hızı seçiminde esneklik verir ve motoru hava akımının dışında tutar [1]. Bir üretici çatı fanlarında doğrudan tahrikin bakım erişiminin zor olduğu yerde, kayışlı tahrikin devir ayarıyla sistem dengelemesi gereken yerde kullanıldığını yazar [6].

## VentHub'da hangi çatı tipi fan serileri var?

VentHub'ın [çatı tipi fanlar](vh:kategori/roof-fans) kategorisinde iki ürün ailesi bulunur: on modelli [Vortice Slimroof çatı fanları](vh:aile/vortice-slimroof-cati-fanlari) ve üç modelli Vortice Radon serisi [9]. Slimroof sayfasının başlığında 460–18.600 m³/h aralığı, ilk modelin açıklamasında radyal atış ve EC motor yazılıdır [9]. Radon serisi, kategori sayfasında radon tahliyesi için ayrı bir aile olarak anılır ve bu yazının kapsamı dışındadır [9]. Yukarıda ikinci üretici olarak anılan Vortice, bu kategorideki ürünlerin markasıdır [5][9]. Model ayrıntıları ürün sayfalarındadır; ürün sayfalarında "Teknik Teklif İste" düğmesi bulunur [9].

## Sık sorulan sorular

### Çatı tipi fan hangi fan türüdür?

Çatıda birden çok fan türü kullanılır [1][6][8]. Çatıda pervane tipi eksenel fanlar sık kullanılır [1]; üreticiler çatıya monte santrifüj ve karışık akışlı fanlar da sunar [6][8].

### Çatı fanında egzoz havası nereye atılmalı?

HSE rehberi atış noktasının binanın en yüksek noktasının belirgin biçimde üstünde olmasını, CIBSE ise egzozun kapı, pencere ve hava girişlerinden uzak tutulmasını ister [2][3]. Bu genel ilkelerdir; mesafe rakamı proje hesabına aittir.

### Fan boyutunu büyük seçmek güvenli midir?

Kaynak bunu önermez [1]. ABD Enerji Bakanlığı kılavuzu, tasarımcıların belirsizlikleri fazla büyük fan seçerek karşılamasının yüksek enerji maliyeti, yüksek bakım ve azalan sistem güvenilirliği gibi sorunlar doğurduğunu yazar [1].

### Çatı tipi fanda bakım nasıl yapılır?

Bu üreticiye göre değişir. Bir üretici eğilebilir sistemle tam sökmeden bakımı [4], bir diğeri kolay çıkarılan koruyucu başlığı [5] anlatır; kılavuz ise doğrudan tahrikli eksenel fanda motora erişimin bir ölçüde kısıtlı olduğunu yazar [1].

### VentHub'da hangi çatı tipi fanlar var, teklif nasıl istenir?

Kategoride Slimroof ve Radon olmak üzere iki ürün ailesi vardır; ürün sayfalarında "Teknik Teklif İste" düğmesi bulunur [9].

## Kaynaklar

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, PDF s. 13, 15, 21, 23 ve 26 (basılı s. 9, 11, 17, 19 ve 22). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 08.11.2026)
2. Health and Safety Executive (HSE), HSG258 Controlling airborne contaminants at work: A guide to local exhaust ventilation (LEV), 3. baskı, 2017, paragraf 220 ve 221 (PDF s. 62–63). https://books.hse.gov.uk/gempdf/hsg258.pdf (erişim 08.11.2026)
3. CIBSE, CIBSE Top Tips 1: Ventilation in Buildings, 2015. https://www.cibse.org/knowledge-research/knowledge-resources/engineering-guidance/cibse-top-tips/cibse-top-tips-1-ventilation-in-buildings-2015/ (erişim 08.11.2026)
4. Casals Ventilación, "Roof fans solutions by Casals" belge kitaplığı sayfası, "Types of fans" sayfası ve çatı fanları broşürü (2 sayfa; yalnız sayfa 2'deki bakım cümlesi). https://www.casals.com/en/documentation/document-library/roof-fans/ , https://www.casals.com/en/ventilation-tools/types-of-fans/ , https://www.casals.com/assets/uploads/cat_pdf/43579-roof-fans-flyer-casals.pdf (erişim 08.11.2026)
5. Vortice, SLIMROOF 355 T ES ürün sayfası. https://fanselectionpro.vortice.com/en/60/fans/33116-slimroof-355-t-es (erişim 08.11.2026)
6. Greenheck, Roof Fans. https://www.greenheck.com/products/fans/roof (erişim 08.11.2026)
7. Systemair, DVN Roof Fans. https://www.systemair.com/en/products/fans/roof-fans/dvn (erişim 08.11.2026)
8. SEAT Fans, JET Series (Fantech Pty Ltd broşürü, sayfa 4). https://www.fantech.com.au/images/Brochures/SEAT.pdf (erişim 08.11.2026)
9. VentHub, çatı tipi fanlar kategori sayfası, Slimroof ve Radon ürün ailesi sayfaları, canlı sitede 8 Kasım 2026'da ölçüldü: https://venthub.com.tr/tr/category/cati-tipi-fanlar , https://venthub.com.tr/tr/products/vortice-slimroof-cati-fanlari , https://venthub.com.tr/tr/products/vortice-radon-serisi-cati-fanlari

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Atış yeri ve mesafeleri projeye özel hesapla belirlenir; üretici beyanları üreticinin kendi sayfalarındaki bilgilerdir. Ürün bilgileri yayın tarihindeki sürüme aittir.
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
