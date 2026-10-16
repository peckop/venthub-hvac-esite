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
   * ZORUNLU ve `ozet`ten FARKLI olmalıdır: kart ile meta açıklaması aynı alandan geliyordu ve tam başlık
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
    guncellemeTarihi: '2026-10-14',
    urunler: ['vh:aile/danfoss-vlt-hvac-basic-drive-fc-101', 'vh:aile/danfoss-vlt-hvac-drive-fc-102', 'vh:aile/danfoss-vlt-micro-drive-fc-51'],
    diller: {
      tr: {
        slug: 'frekans-konvertoru-nedir',
        ozet: 'Frekans konvertörü, motora uyguladığı gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik bir kontrol cihazıdır.',
        // Kart metni yazının kendi bölüm başlıklarından ve seçim ölçütlerinden derlenir: yeni iddia, sayı ya da marka yok.
        kartOzeti:
          'Frekans konvertörünün nasıl çalıştığı, fan ve pompada neden kullanıldığı ve seçimde bakılacak ölçütler: besleme gerilimi, güç aralığı, koruma sınıfı, çalışma ortamı ve uygulamanın tork karakteristiği.',
        govde: `# Frekans konvertörü nedir, fan ve pompada nasıl seçilir?

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

Anahtarlama frekansı düşük tutulursa motorda duyulabilir ses oluşur; yüksek tutulursa sürücüde ısı artar [1]. FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir [5].

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
    guncellemeTarihi: '2026-10-14',
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
        ozet: 'Radyal ve aksiyel fanın farkı, kanat tipleri, fan eğrisinin okunması, çalışma noktası, montajın etkisi ve fanlar için güncel verimlilik şartları.',
        // Kart metni yazının kendi bölüm başlıklarından derlenir (meta açıklamasından AYRI alan, SEO-30): yeni iddia, sayı ya da marka yok.
        kartOzeti:
          'Radyal ve aksiyel fanların çalışma biçimi, radyal fanlarda kanat tipleri, kayışlı ve doğrudan tahrik arasındaki fark, fan eğrisinden çalışma noktasının okunması, hava yoğunluğu düzeltmesi ve fanlara ilişkin AB ile Türkiye verimlilik düzenlemeleri.',
        govde: `# Radyal fan mı aksiyel fan mı? Fan nasıl seçilir?

Aksiyel fan havayı pervane gibi fan ekseni doğrultusunda iter; radyal (santrifüj) fan ise havayı radyal yönde hızlandırıp kinetik enerjiyi basınca çevirir [1]. Pervane tipi aksiyel fanlar düşük basınçta yüksek debi üretir [1]; radyal düz kanatlı fanlar ise yüksek basınç gerektiren uygulamalarda yaygın kullanılır [1]. Doğru fan, sistemin gerektirdiği debi ve basıncın fan eğrisinde üreticinin önerdiği kararlı ve verimli bölgeye düştüğü fandır [2].

## Radyal ve aksiyel fan nedir?

Fanlar temelde iki tipe ayrılır: aksiyel ve santrifüj (radyal) [1]. Aksiyel fanlarda hava fan eksenine paralel akar; santrifüj fanda ise hava akımı radyal yönde hızlandırılır ve kazandığı kinetik enerji basınca dönüştürülür [1].

Aksiyel fanların başlıca üstünlükleri kompakt olmaları, düşük maliyetleri ve hafiflikleridir [1]. Aynı debiyi sağlamak için benzer bir santrifüj fandan daha hızlı dönmeleri gerekir; bu yüzden daha gürültülüdürler, ancak gürültüleri daha kolay sönümlenen yüksek frekanslarda yoğunlaşır [1].

## Radyal fanlarda kanat tipleri

| Kanat tipi | Verim | Kirli ya da parçacıklı hava |
|---|---|---|
| Öne eğik | %55–65 [1] | Genellikle temiz hava uygulamalarıyla sınırlı [1] |
| Radyal düz kanat | — | Toz, talaş ve metal kırıntısı taşıyan hava akımlarına uygun [1] |
| Radyal uçlu | %75'e kadar [1] | — |
| Geriye eğik, havayarı profilli | %85'in üzerine çıkabilir [1] | Düşük çarpma açısı kanatlarda birikmeye yol açabilir [1] |

Geriye eğik kanatlı fanlarda en verimli olanlar havayarı profilli kanatlardır [1]. Bu kanatlar kaldırma kuvvetiyle çalıştığı için bu fan tipi tutunma kaybına (stall) bağlı kararsız çalışmaya karşı hassastır [1].

## Aksiyel fan türleri

- **Pervane tipi.** Düşük basınçta yüksek debi üretir; görece düşük verimlidir ama basit yapısı sayesinde ucuzdur [1].
- **Tüp tipi (tubeaxial).** Orta basınç ve yüksek debi gerektiren uygulamalarda kullanılır ve kanallı HVAC tesisatına uygundur [1]. Motora doğrudan bağlanabildiği gibi kayışla da tahrik edilebilir [1].
- **Kılavuz kanatlı (vaneaxial).** Esasen tüp tipi bir fanın çıkışına, akışı düzelten ve havanın kinetik enerjisini basınca çeviren kanatlar eklenmiş hâlidir [1]. Havayarı profilli kanatlar ve küçük boşluklarla üretildiğinde verimi %85'e kadar çıkabilir [1].

Vortice'nin Industrial Ventilation kataloğundaki örneklerde MPC HP ve MPC ED serileri uzun gövdeli kanal tipi aksiyel fanlardır; kanatları fan durdurulmuşken ayarlanabilen yapıdadır [6]. Vortice [Vorticel E serisi](vh:aile/vortice-aksiyel-endustriyel-fanlar) ise düşük basınçlı plaka tipi aksiyel fan serisidir [6]. Otopark havalandırmasında kullanılan jet fanlar da iki gruba ayrılır: aksiyel fanlı itme tipi ve geriye kıvrık (backward-curved) metal kanatlı santrifüj çarklı indüksiyon tipi [7].

## Fanlarda kayışlı mı doğrudan tahrikli mi?

Doğrudan tahrikte çark motor miline bağlıdır; bu basit ve verimli bir düzendir, ancak hız ayarında daha az esneklik sunar [1]. Kayışlı tahrikte fan hızı kasnak çapları değiştirilerek ayarlanabilir [1]. Aksiyel fanlarda kayışlı tahrik motoru hava akımının dışında tutar; bu, yüksek sıcaklıklı, kirli ya da korozif ortamlarda bir üstünlük olabilir [1]. Aksiyel fanlarda düşük sıcaklıklı ve temiz havalı uygulamalarda ise doğrudan tahrik uygundur, çünkü fanın hemen arkasındaki motor hava akımıyla soğutulabilir [1].

| Seri (üretici belgesi) | Kanat | Tahrik |
|---|---|---|
| Nicotra Gebhardt AT | Öne eğik [2] | Kayışlı [2] |
| Nicotra Gebhardt ADH | Öne eğik [4] | Kayışlı [4] |
| Nicotra Gebhardt RDH | Geriye eğik [3] | Kayışlı [3] |
| Nicotra Gebhardt DD | Öne eğik [5] | Doğrudan tahrikli [5] |

Bu serilerin modellerini [AT](vh:aile/nicotra-gebhardt-at-cift-emisli-radyal-fanlar), [ADH](vh:aile/nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar), [RDH](vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar) ve [DD](vh:aile/nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar) sayfalarında; diğer fanları [radyal (santrifüj) fanlar](vh:kategori/centrifugal-fans), [aksiyel sanayi fanları](vh:kategori/axial-industrial-fans) ve [duman egzoz fanları](vh:kategori/smoke-exhaust-fans) kategorilerinde inceleyebilirsiniz.

## Fan eğrisi nasıl okunur?

Nicotra Gebhardt'ın kayışlı radyal fan kataloğunda (AT serisi) eğriler, fanın toplam basınç artışını debinin fonksiyonu olarak çift logaritmik bir diyagramda gösterir [2]. Bu diyagramda sistem direnç eğrileri düz çizgi olarak görünür [2]. Eğri üzerindeki uygulama sınırları, kararlı ve yüksek verimli çalışmanın beklenebileceği önerilen aralığı gösterir [2]. Diyagramdaki verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2]. Doğrudan tahrikli DD serisinin eğrisinde üretici, gri işaretli bölgede fanın kullanılmamasını önerir [5].

Sistem eğrisi, bir sistemin basınç–debi karakteristiğinin grafik gösterimidir [1]. Fan eğrisinin sistem eğrisiyle aynı yönde eğimli olduğu bölgede çalışan fan kararsız çalışabilir [1]. Fan eğrisi sistem eğrisini birden fazla noktada keserse fan, "hunting" denen, kararlı bir çalışma noktası arayıp duran kararsız bir davranışa girebilir [1]. Aksiyel fanların şiddetli bir tutunma kaybı bölgesi vardır; bu yüzden çalışma koşulları geniş ölçüde değişen sistemlere özellikle uygun değildir [1]. Radyal kanatlı fanlarda ise tutunma kaybı sorunları diğer fan tiplerine göre daha az görülür [1].

## Fanı en yüksek verim noktasına yakın seçin

Bir fanı en yüksek verim noktasına yakın çalıştırmak performansı artırır, aşınmayı azaltır ve onarımlar arasındaki süreyi uzatır [1]. Çalışma noktası en yüksek verim noktasından uzaklaştıkça yatak yükleri ve gürültü artar [1]. Damper (ayar klapesi) karşı basıncı artırarak fanın toplam çıkışını düşürür ve çalışma noktasını eğri üzerinde sola kaydırır [1].

Tasarımdaki güvenlik payı, ileride kapasite artırma beklentisi ve kirlenme payı, sistem ihtiyacından bir boy büyük fan seçilmesine yol açabilir [1]. ABD Enerji Bakanlığı'nın 2003 tarihli rehberinin aktardığı bir ABD Çevre Koruma Ajansı çalışmasında (rehberin dipnotundaki kaynak: Temmuz 1997 tarihli ENERGY STAR Buildings Upgrade Manual), bina fan sistemlerindeki fanların yaklaşık %60'ının gereğinden büyük seçildiği, yaklaşık %10'unun ise %60 oranında büyük seçildiği bulunmuştur [1].

Fan devri düşürüldüğünde debi devirle doğrusal, basınç devrin karesiyle, güç devrin küpüyle değişir [1]. Aynı rehbere göre fan devrini %20 azaltmak fan gücünü yaklaşık %50 azaltır [1].

## Montaj fanın performansını nasıl etkiler?

Sistem etkisi, sistem bileşenlerinin birbirini etkilemesinden doğan ve gerçek performansın hesaplanan performanstan sapması olarak görülen kayıptır [1]. Fan çıkışına yakın konumlandırılmış bir dirsek, iletilen debiyi %30'a kadar azaltan bir sistem etkisi yaratabilir [1].

## Hava yoğunluğu ve fan eğrisi düzeltmesi

Fan eğrilerinin çoğu standart hava yoğunluğu varsayımıyla çizilir [1]. Nicotra Gebhardt AT eğrilerinde fan girişindeki referans yoğunluk 1,2 kg/m³'tür [2]. Eğrideki basınç ve çark giriş gücü hava yoğunluğuyla doğru orantılıdır [2]. Bu yüzden ölçülen statik basınç, gerçek hava yoğunluğu ile eğrinin çizildiği yoğunluk arasındaki farka göre düzeltilmelidir [1].

Örnek varsayım: sıcak hava taşıyan bir sistemde yoğunluk 1,08 kg/m³ olsun ve eğrideki çalışma noktasında basınç 1.000 Pa okunsun. Basınç yoğunlukla doğru orantılı olduğundan aynı devir ve debide bu sistemde fanın vereceği basınç yaklaşık 1.000 × 1,08 / 1,2 = 900 Pa olur [2].

## Fan ses gücü seviyesi nasıl okunur?

Ses gücü seviyesi, bir ses kaynağından yayılan akustik güçtür ve watt ya da desibel cinsinden verilir [1]. Nicotra Gebhardt AT kataloğunda 1 m mesafedeki yaklaşık A ağırlıklı ses basıncı seviyesi, A ağırlıklı ses gücü seviyesinden 7 dB çıkarılarak bulunur [2].

## Fanlar için verimlilik mevzuatı

Avrupa Birliği'nde elektrik giriş gücü 125 W ile 500 kW arasında olan motorlarla tahrik edilen fanların ekotasarım gereklilikleri, 3 Temmuz 2024 tarihli (EU) 2024/1834 sayılı Komisyon Tüzüğü ile düzenlenir [8]. Bu tüzük, önceki (EU) No 327/2011 sayılı tüzüğü 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır [8]. Yeni tüzük genel olarak 24 Temmuz 2026'dan itibaren uygulanır [8]. Tüzük, 2 Aralık 2025 tarihli (EU) 2025/2481 sayılı Komisyon Tüzüğü ile değiştirilmiştir; bu değişikliğe göre, yeni tüzüğün Ek II'sinin ilk iki paragrafına uygun olarak, eski tüzüğün I, II ve III numaralı ekleri başka ürünlere entegre edilen fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [11].

Tüzüğün kapsam dışı bıraktığı fanlar arasında, yalnız 2014/34/AB sayılı Direktif anlamında patlayıcı ortamlarda çalışmak üzere tasarlanıp pazarlanan fanlar ile yalnız acil durum için, 300 °C ve üzerinde 1 saat ya da daha uzun çalışabilecek yangın güvenliği fanları da bulunur [8].

Türkiye'de aynı konu, 7 Şubat 2026 tarihli ve 33161 sayılı Resmî Gazete'de yayımlanan, (AB) 2024/1834 sayılı tüzük ile onu değiştiren (AB) 2025/2481 sayılı tüzük esas alınarak hazırlanan Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM-2026/2) ile düzenlenmiştir [9]. Tebliğ, diğer ürünlere entegre edilenler dahil bu güç aralığındaki fanların piyasaya arz edilmesi veya hizmete sunulması açısından çevreye duyarlı tasarım gerekliliklerini belirler [9]. Tebliğ, 20 Aralık 2019 tarihli ve 30984 sayılı Resmî Gazete'de yayımlanan önceki fan tebliğini yürürlükten kaldırır [9]. Bu hüküm de dahil tebliğin esas hükümleri 24 Temmuz 2027'de yürürlüğe girer; o tarihe kadar önceki tebliğ yürürlükte kalır [9].

## Patlayıcı ortam ve duman tahliyesi fanları

Yalnız patlayıcı ortamlarda çalışmak üzere tasarlanıp pazarlanan fanlar, yukarıda anlatılan verimlilik tüzüğünün kapsamı dışındadır [8].

Vortice, yüksek sıcaklıktaki dumanın tahliyesi için tasarlanan fanların EN 12101-3 standardına göre üçüncü taraf bir kuruluşça belgelendirildiğini belirtir [7]. Aynı belgeye göre en yaygın sınıflar, sırasıyla 300 °C ve 400 °C'de duman tahliyesinde 2 saat kesintisiz çalışmaya karşılık gelen F300/120 ve F400/120'dir [7]. Vortice'nin VORT JET A F400 serisi F400/120 sertifikalıdır [6].

## Fan montajı ve bakımı

- Fanın tesisata esnek bir bağlantıyla bağlanması titreşim ve gürültü yalıtımını iyileştirir [2].
- Tüm koruyucu tertibatlar takılıp bağlanmadan fan işletmeye alınmamalıdır [2].
- Nicotra Gebhardt'ın kayışlı AT serisi fanlarında kama kayışlar için doğru gerginlik, üreticinin belirttiği test kuvvetinin kayış açıklığının metresi başına 16 mm sehim oluşturduğu noktada elde edilir [2].
- Nicotra Gebhardt'ın kayışlı AT serisi fanlarındaki rulmanlar 40.000 çalışma saatlik nominal ömür için tasarlanmıştır [2].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez; güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklifleri karşılaştırırken aşağıdaki seçimlerin aynı olup olmadığına bakın.

- **Fan tipi ve kanat biçimi.** Öne eğik, radyal ve geriye eğik kanatlar ile aksiyel türler farklı verim aralıklarına sahiptir [1].
- **Debi ve basınç aralığı.** Aynı seri içinde boy büyüdükçe debi aralığı değişir; örneğin RDH serisinde 0180–0560 boyları 90.000 m³/h'e, 0630–1000 boyları 290.000 m³/h'e kadar çıkar [3].
- **Tahrik biçimi.** Kayışlı tahrik hız ayarında esneklik sunar, doğrudan tahrik daha basit bir düzendir [1].
- **Çark malzemesi.** Örneğin SEAT serisinde çark enjeksiyon kalıplı PPH'den üretilir [10].
- **Özel kullanım belgesi.** Vortice'ye göre, yüksek sıcaklıktaki dumanın tahliyesi için tasarlanan fanlar EN 12101-3'e göre belgelendirilir ve F300/120 ya da F400/120 gibi sınıflarla sunulur [7].
- **Kurulum kalemleri.** Esnek bağlantı ve koruyucu tertibatlar kurulumun parçasıdır [2].

## Fan seçiminde izlenecek yol

1. Sistemin gerektirdiği debiyi ve toplam basıncı belirleyin; sistem eğrisini çıkarın [1].
2. Havanın temiz mi, tozlu ya da parçacıklı mı olduğuna göre kanat tipini seçin [1].
3. Çalışma noktasının üretici eğrisinde önerilen kararlı ve verimli aralıkta olduğunu kontrol edin [2].
4. Gerçek hava yoğunluğu referans yoğunluktan farklıysa eğri değerlerini düzeltin [1][2].
5. Fan girişinde ve çıkışında sistem etkisi yaratacak dirsekleri azaltın [1].
6. Duman tahliyesi söz konusuysa fanın EN 12101-3 belgesini ve sınıfını isteyin [7]; patlayıcı ortam söz konusuysa, tüzüğün kapsam dışı koşulu fanın yalnız o ortamda çalışmak üzere belirtilmiş ve bu amaçla özel olarak tasarlanıp pazarlanmış olması olduğundan, bunu gösteren belgeyi üreticiden isteyin [8].

## Sık sorulan sorular

### Radyal fan mı daha verimli, aksiyel fan mı?

Tipe bağlıdır. Havayarı profilli geriye eğik radyal fanlarda verim %85'in üzerine çıkabilir [1]. Havayarı profilli, küçük boşluklu kılavuz kanatlı aksiyel fanlar da %85'e kadar verime ulaşabilir [1]. Öne eğik radyal fanlarda verim %55–65 aralığındadır [1].

### Aksiyel fan kanala takılır mı?

Tüp tipi aksiyel fanlar kanallı HVAC tesisatına uygundur [1]. Vortice'nin Industrial Ventilation kataloğundaki MPC HP ve MPC ED serileri de uzun gövdeli kanal tipi aksiyel fanlardır [6].

### Fan eğrisindeki verim her devirde geçerli mi?

Nicotra Gebhardt'ın kayışlı AT serisinin eğrilerinde verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2].

### Fazla büyük fan seçmenin zararı ne?

Büyük seçilen fan en yüksek verim noktasından uzakta çalışabilir; çalışma noktası bu noktadan uzaklaştıkça yatak yükleri ve gürültü artar [1].

### Fanlar için 327/2011 sayılı AB tüzüğü hâlâ geçerli mi?

Yürürlükten kalktı; ancak iki sınırlı istisna sürer. (EU) 2024/1834 sayılı tüzük, 327/2011'i 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır [8]. 2025/2481 sayılı değişiklik tüzüğüne göre, yeni tüzüğün Ek II'sinin ilk iki paragrafına uygun olarak, eski tüzüğün ekleri yalnız başka ürünlere entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanır [11]. Türkiye'de ise tebliğe göre, tebliğin Ek II'sinin ilk iki paragrafına uygun olarak, 24 Temmuz 2027'de yürürlükten kalkacak olan eski tebliğin ekleri, diğer ürünlere entegre fanlar için 24 Temmuz 2028'e, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [9].

### Fan teklifi için hangi bilgileri paylaşmalıyım?

Gerekli debi ve toplam basınç [1], havanın temiz ya da parçacıklı olup olmadığı [1], taşınan havanın sıcaklığı ve yoğunluğu [1][2], montaj yerindeki bağlantı düzeni [1] ve patlayıcı ortam ya da duman tahliyesi gibi özel bir kullanım olup olmadığı [7][8] teklifin doğru fana dayanmasını sağlar.

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 6–9, 11, 13, 17–24, 32–34, 80 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 11.10.2026)
2. Nicotra Gebhardt, Centrifugal Fans AT, belt driven, Issue 2.5 EN, 2013, s. 5, 70–71, 85, 99, 101 (üretici belgesi).
3. Nicotra Gebhardt, Centrifugal Fans RDH, belt driven, Issue 2.5 EN, 2013, s. 5, 7 (üretici belgesi).
4. Nicotra Gebhardt, Centrifugal Fans ADH, belt driven, Issue 2.5 EN, 2013, s. 5, 7 (üretici belgesi).
5. Nicotra Gebhardt, Centrifugal Fans direct driven with scroll, DD range, Issue 1.3, 2012, s. 6, 9 (üretici belgesi).
6. Vortice, Industrial Ventilation kataloğu, s. 4, 44–45, 58, 64 (üretici belgesi).
7. Vortice, VORT JET FAN SYSTEM broşürü, s. 10 (üretici belgesi).
8. Avrupa Komisyonu, Commission Regulation (EU) 2024/1834, md. 1(3), 9, 10, EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1834 (erişim 11.10.2026)
9. T.C. Resmî Gazete, 07.02.2026, Sayı 33161, Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM-2026/2), md. 1, 10–12, geçici md. 1. https://www.resmigazete.gov.tr/eskiler/2026/02/20260207-4.htm (erişim 11.10.2026)
10. SEAT Ventilation, SEAT Series — Specifications, s. 1 (üretici belgesi).
11. Avrupa Komisyonu, Commission Regulation (EU) 2025/2481 (2024/1834'ü değiştiren tüzük), md. 1(4), EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R2481 (erişim 11.10.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Örnek hesaptaki varsayım değerleri dışında, yazıdaki verim, debi ve basınç değerleri üretici belgelerinde ve kaynak rehberlerde verilen değerlerdir; kendi sisteminizdeki sonuç, montaj koşullarına ve hava yoğunluğuna göre farklı olabilir. Kurulum, devreye alma ve bakım yetkili ve eğitimli personel tarafından yapılmalıdır. Yasal şartlara ilişkin bilgiler yayın tarihindeki resmî metinlere dayanır; uygulamadan önce güncel metin kontrol edilmelidir.
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
    guncellemeTarihi: '2026-10-17',
    urunler: ['vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari'],
    diller: {
      tr: {
        slug: 'sessiz-fan-nasil-secilir',
        ozet: 'Sessiz fan seçerken ses basıncı ile ses gücü farkını, ölçüm koşulunu ve yatak odası değerlerini okuyun; Vortice Lineo Quiet katalog değerleri örnek.',
        // Kart metni yazının kendi bölüm başlıklarından derlenir: yeni iddia, sayı ya da marka yok.
        kartOzeti:
          'Sessiz fan seçerken ses basıncı ile ses gücü farkı, ölçüm koşulunun (yol, ayar noktası, mesafe) okunması, yatak odası ve ofis için resmî ses değerleri ve kanal fanında sessizliği sağlayan yöntemler.',
        govde: `# Sessiz fan nasıl seçilir? dB(A), ses gücü ve kanal fanı seçimi

Sessiz fan seçimi, katalogdaki ses değerinin hangi koşulda verildiğini okumakla başlar: ses basıncı düzeyi ölçüm noktasındaki sesi, ses gücü düzeyi ses kaynağının yaydığı sesi anlatır [1]. Vortice'nin Lineo Quiet kanal fanında ses değeri ayar noktasına göre çok değişir: Lineo 100 Quiet ES için gövde yayını 9,9 dB(A) · 4 V · gövde, 3 m ile 30,9 dB(A) · 10 V · gövde, 3 m arasındadır [2].

Bu yüzden "kaç dB?" sorusu tek başına cevaplanmaz; hangi yol (emiş, üfleme, gövde), hangi ayar noktası ve hangi mesafe sorularıyla birlikte cevaplanır. Aşağıda bu üç koşul, yatak odası ve ofis gibi mekânların resmî değerleri ve Lineo Quiet'in katalog değerleri birlikte okunuyor.

## Sessiz fan ne demek?

Vortice, LINEO QUIET ürünlerini ses emici kaplamayla tanımlar: kaplama dış gövdeye bütünleşiktir ve çevreye yayılan ses emisyonunu en aza indirmek için optimize edilmiştir [2].

Fan sesi dB(A) ile verilir. dB(A), insan işitme sisteminin en çok hassas olduğu orta ve yüksek frekanslara daha fazla ağırlık veren A-ağırlık şebekesiyle elde edilen tek sayılı bir ses düzeyi birimidir [1].

Hangi değerin sessiz sayılacağı mekâna göre değişir. Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik, servis ekipmanından kaynaklanan gürültü için mekâna ve akustik performans sınıfına göre ayrı değerler verir; servis ekipmanını da ısıtma ve iklimlendirme sistemlerini sayan teknik donatılar olarak tanımlar [1]. Yönetmelik yayımından bir yıl sonra yürürlüğe girmiştir [1].

Dünya Sağlık Örgütü'nün 1999 tarihli topluluk gürültüsü rehberi, uyku bölünmesini önlemek için yatak odası iç mekân değerini sürekli gürültüde 30 dB LAeq, tek tek ses olaylarında 45 dB LAmax olarak verir [3]. Gürültüde düşük frekanslı bileşenler çoksa değerlerin kılavuz değerlerden de düşük olması gerekir [3].

## Ses gücü ile ses basıncı arasındaki fark nedir?

Yönetmelik ses basıncı düzeyini (Lp), ortamda belli bir noktada ölçülen ses basıncının 20 µPa referans ses basıncına oranından hesaplanan ve dB cinsinden verilen değer olarak tanımlar [1]. Ses gücü düzeyi (Lw) ise ses kaynağının yaydığı ses gücünün 10⁻¹² watt referans ses gücüne oranından hesaplanan değerdir [1].

Kısacası ses basıncı belirli bir noktadaki ses düzeyini, ses gücü kaynağın yaydığı sesi anlatır [1]. Vortice kataloğu iki büyüklüğü ayrı yayınlar: Lineo Quiet için ses gücünü Lw dB(A), ses basıncını Lp dB(A) olarak verir [2].

Bina içindeki değerlendirme başka bir göstergeyle yapılır: Yönetmelik servis ekipmanından kaynaklanan iç gürültüyü sürekli ses için LAeq,nT, kesikli ses için LAF,max,nT göstergesiyle değerlendirir [1]. Katalogdaki 3 m mesafede hesaplanmış ses basıncı [2] ile oda içi LAeq,nT değeri [1] aynı koşulda verilmediği için doğrudan karşılaştırılmamalıdır.

### Ses gücü beyanı ve AB fan tüzükleri

Avrupa Birliği'nde ses gücü beyanı ürün türüne bağlıdır. (AB) 1253/2014 sayılı Komisyon Tüzüğü, havalandırma ünitelerinin ürün bilgisinde konut havalandırma ünitelerinde A ağırlıklı ses gücü düzeyinin (LWA), iç mekânda kullanılması belirtilen konut dışı ünitelerde ise gövde ses gücü düzeyinin tam sayıya yuvarlanarak verilmesini ister [5]. Aynı Tüzük, (AB) 327/2011 tanımındaki, yalnızca bir gövde ile donatılmış eksenel ya da santrifüj fanları kapsamının dışında tutar [5].

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

Ayar 4 V'tan 10 V'a çıkarken azami debi 135 m³/h'ten 300 m³/h'e, yani yaklaşık 2,2 katına çıkar; üfleme tarafında ses basıncı 20,1 dB(A), gövde yayınında 21,0 dB(A) artar (hesap: kataloğun iki satırının farkı) [2]. Aynı modelin sesi ayar noktasına göre üfleme ve gövde yollarında yaklaşık 20 dB(A) değişir (emiş yolunda 17,9 dB(A)); sessizlik model seçimi kadar çalıştırılan ayara da bağlıdır [2].

Fan tipi de sesin yapısını etkiler. ABD Enerji Bakanlığı kılavuzuna göre aksiyel fanlar aynı kapasitedeki hat içi santrifüj fanlardan biraz daha gürültü çıkarma eğilimindedir; ancak bu gürültüde yüksek frekanslar baskın olma eğilimindedir ve yüksek frekanslar daha kolay azaltılır [4].

## Kanal fanında sessizlik nasıl sağlanır?

Yönetmelik, tesisat ve servis ekipmanlarından kaynaklanan gürültünün kontrolü için mekanik sistemlerde gürültü kontrolü kurallarını (EK-8) uygulamayı öngörür [1]. Bu kurallar fan seçimini, titreşim yalıtımını, kanal içi ses yalıtımını ve hız ayarını birlikte ele alır; ABD Enerji Bakanlığı kılavuzundaki yöntemler aynı başlıkları destekler [1][4].

### Sessiz fan tipi seçimi ve yerleşimi

EK-8, gürültü emisyonu azaltılmış sessiz fan tipinin seçilmesine, hava akımı, fan hızı ve statik basınç ayarlarıyla gürültünün azaltılmasına ve fanın hava türbülansını azaltacak biçimde yönlendirilmesine dikkat edilmesini öngörür [1]. Gürültüye çok hassas mekânların tavanında önlem alınmadan fan yerleştirilemez [1].

### Titreşim yalıtımı ve esnek yastık

EK-8, servis ekipmanlarının zemine bağlantılarında ve boru ile kanal bağlantılarında titreşim yalıtımı kullanılmasını ister [1]. Fan ve fancoil kutularının tavan panolarına ve ses köprüsü yapacak taşıyıcılara doğrudan temas etmemesi, arada esnek yastık kullanılması da aynı bölümde yer alır [1]. ABD Enerji Bakanlığı kılavuzu, fanın kauçuk gibi yumuşak bir malzemeye ya da uygun bir yay izolatörüne oturtularak aktarılan titreşim enerjisinin sınırlanmasını gürültü azaltma yöntemleri arasında sayar [4].

### Susturucu ve kanal içi ses yalıtımı

Yönetmelik, kanal tasarımı sırasında kanal içi gürültü düzeyinin de hesaplanmasını ister; binanın özelliğinden dolayı EK-5.1'de verilen asgari gürültü düzeyleri (Tablo 5.1'deki izin verilen en yüksek iç gürültü düzeyleri) aşılırsa kanal içi ses yalıtımı yapılır [1]. ABD Enerji Bakanlığı kılavuzu gürültü azaltma yöntemleri arasında kanalı yalıtmayı ve ses sönümleyici malzeme ya da bölme (baffle) kullanmayı sayar [4]. Yönetmeliğin ölçüm standartları listesinde havalandırma kanalına monte edilen susturucular için eklenti kaybı, akış gürültüsü ve toplam basınç kaybı ölçümlerini kapsayan TS EN ISO 7235 yer alır [1].

### Hız kumandası ve devir ayarı

Katalog LINEO QUIET ES sürümünü iki hızlı, elektronik kontrollü EC fırçasız motorlu olarak tanımlar; her hız kurulumda ayarlanır, cihaz alternatif olarak tek hızda çalışabilir ve bu hız kullanıcı tarafından 0–10 V sinyaliyle ayarlanır [2]. AC sürümlü LINEO QUIET'te motor modele göre 2 ya da 3 hızlıdır [2]. Katalog hız kontrolü için AC modellerde TRIO-LINEO 503 üç hız seçiciyi, C5 0.5 ve C 1.5 hız ayarlayıcılarını, yalnız Ø250 ve Ø315 modeller için de C 2.5 hız ayarlayıcısını, ES modellerde POT-IT ve POT potansiyometrelerini aksesuar olarak listeler [2]. Katalog bu kumandaları İngilizce SPEED SELECTOR (hız seçici), SPEED CONTROLLER (hız ayarlayıcı) ve POTENTIOMETER (potansiyometre) diye adlandırır [2]. ABD Enerji Bakanlığı kılavuzu ise değişken hız sürücülerinin (VFD) düşük sistem talebinde hava akımı gürültüsünü azalttığını belirtir [4].


## Yatak odası, yaşam alanı ve ofiste ses sınırı kaç dB?

Yönetmeliğin EK-5 Tablo 5.1'i, sürekli gürültü üreten servis ekipmanı için iç gürültü sınırlarını mekâna, zaman dilimine ve akustik performans sınıfına göre verir; A sınıfı en yüksek, F sınıfı en düşük performansı gösterir [1]. Yeni yapılacak binalarda en az C, mevcut binalarda kullanım amacı değişirse ya da esaslı tadilat yapılırsa tadilatın etkilediği bağımsız birimlerde en az D sınıfı sağlanır [1].

| Mekân [1] | Zaman dilimi [1] | C sınıfı, LAeq,nT [1] | D sınıfı, LAeq,nT [1] |
|---|---|---|---|
| Konut, yatak odası | Gece (23.00–07.00) | 30 dB [1] | 34 dB [1] |
| Konut, yaşam alanı | 24 saat [1] | 35 dB [1] | 39 dB [1] |
| Konut, mutfak | 24 saat [1] | 35 dB [1] | 39 dB [1] |
| Konaklama, yatak odası | Gece (23.00–07.00) | 30 dB [1] | 34 dB [1] |
| Büro, özel oda | Gündüz–Akşam (07.00–23.00) | 40 dB [1] | 44 dB [1] |
| Büro, toplantı odası | Gündüz–Akşam (07.00–23.00) | 35 dB [1] | 39 dB [1] |

Tablo konut için yatak odası, yaşam alanı ve mutfak satırlarını verir [1]. Başlıktaki "ofis", Yönetmelikteki "Büro ve İdari Binalar" işlevinin özel oda ve toplantı odası satırlarına karşılık gelir [1].

Yatak odası için Dünya Sağlık Örgütü'nün 1999 tarihli değeri 30 dB LAeq (sürekli gürültü) ve 45 dB LAmax (tek ses olayı) olarak yazılıdır [3]. Yönetmelik, işletmeye alma aşamasında idarenin istemesi hâlinde ölçümlerin TS EN ISO 10052 ve TS EN ISO 16032'ye göre yapılmasını, sonuçlar sınır değerlerden yüksek çıkarsa EK-8'e göre önlem alınmasını öngörür [1].

Bu tablodaki değerler odada ölçülen servis ekipmanı gürültüsüdür; katalogdaki 3 m serbest alan değeriyle aynı koşulda verilmez [1][2]. Katalog değeri 3 m serbest alanda hesaplandığı için oda içi sonucu tek başına göstermez [2].

## Örnek: Vortice Lineo Quiet'in ses değerleri

Vortice Lineo Quiet iki sürümle gelir: 2 ya da 3 hızlı AC motorlu LINEO QUIET ve EC fırçasız motorlu LINEO QUIET ES [2]. Vortice, LINEO ürün ailesini konut, ticari ya da endüstriyel mekânların kanallı havalandırması için tasarlanmış karışık akışlı kanal fanları olarak tanıtır; karışık akışlı çarkı helisel fanların yüksek debisi ile santrifüj fanların yüksek basıncının birleşimi olarak anlatır, bu anlatım ses değeri iddiası değildir [2]. Katalog, susturmalı ürünlerde ses emici kabuğun bakım sonunda yeniden takıldığında özgün ses performansını test koşullarında geri kazandırdığını belirtir [2]. Tablolar Ø100, 125, 150, 200, 250 ve 315 mm modellerini içerir; katalogdaki Ø160 modeller tabloya alınmamıştır [2]. Ses basıncı 3 m mesafede, serbest alanda hesaplanmıştır [2].

Katalogda ES modelleri 4, 6, 8 ve 10 V sütunlarıyla verilir; bu yazı bu sütunlara ayar noktası der [2].

**EC motorlu LINEO QUIET ES, en düşük ve en yüksek ayar (4 V ve 10 V) [2]:**

| Model (kod) | Azami debi, ayar 4 V (m³/h) [2] | Üfleme Lp, 4 V (dB(A)) [2] | Gövde Lp, 4 V (dB(A)) [2] | Azami debi, ayar 10 V (m³/h) [2] | Üfleme Lp, 10 V (dB(A)) [2] | Gövde Lp, 10 V (dB(A)) [2] |
|---|---|---|---|---|---|---|
| Lineo 100 Quiet ES (17170) | 135 | 20,6 | 9,9 | 300 | 40,7 | 30,9 |
| Lineo 125 Quiet ES (17171) | 180 | 21 | 11,3 | 380 | 40 | 28,7 |
| Lineo 150 Quiet ES (17172) | 250 | 23,4 | 13,7 | 515 | 40,7 | 31 |
| Lineo 200 Quiet ES (17174) | 570 | 30,6 | 19,7 | 1145 | 47,7 | 35,8 |
| Lineo 250 Quiet ES (17175) | 750 | 37,3 | 24,7 | 1485 | 53,2 | 41 |
| Lineo 315 Quiet ES (17176) | 1400 | 41,2 | 33,5 | 2630 | 54,5 | 48,3 |

**AC motorlu LINEO QUIET, en düşük ve en yüksek hız [2]:**

| Model (kod) | Azami debi, en düşük hız (m³/h) [2] | Üfleme Lp, en düşük hız (dB(A)) [2] | Gövde Lp, en düşük hız (dB(A)) [2] | Azami debi, en yüksek hız (m³/h) [2] | Üfleme Lp, en yüksek hız (dB(A)) [2] | Gövde Lp, en yüksek hız (dB(A)) [2] |
|---|---|---|---|---|---|---|
| Lineo 100 Quiet (17160) | 150 | 22,5 | 16 | 260 | 35,1 | 28,4 |
| Lineo 125 Quiet (17161) | 190 | 21,1 | 12,3 | 320 | 35 | 26,9 |
| Lineo 150 Quiet (17162) | 255 | 23 | 14,4 | 510 | 40,5 | 31,6 |
| Lineo 200 Quiet (17164) | 805 | 38,7 | 27,5 | 1160 | 47,3 | 35,5 |
| Lineo 250 Quiet (17165) | 960 | 43,7 | 32,2 | 1550 | 53,7 | 41,9 |
| Lineo 315 Quiet (17166) | 2070 | 50,5 | 39,5 | 2890 | 57,4 | 47 |

Aynı çapta Quiet olmayan Lineo ile karşılaştırma: Ø200 AC modellerinde en yüksek hızda Lineo 200 Quiet (17164) gövde yayını 35,5 dB(A) · en yüksek hız · gövde, 3 m, emiş tarafı 48 dB(A) · en yüksek hız · emiş, 3 m'dir; azami debisi 1160 m³/h'tir [2]. Lineo 200 (17180) için aynı koşulda gövde yayını 46,9 dB(A), emiş tarafı 55,4 dB(A) ve azami debi 1135 m³/h olarak verilir [2]. Quiet gövdesi daha ağırdır: Lineo 200 Quiet 8,6 kg, Lineo 200 4,9 kg [2].

Ürün sayfasında genel bilgiler, modellerin teknik özellikleri ve model listesi bulunur: [Vortice Lineo Quiet kanal fanları](vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari). Kanal içi kurulum için diğer modeller [kanal tipi fanlar](vh:kategori/duct-fans) kategorisindedir.

## Sessiz fan seçerken kontrol listesi

1. Ses değerinin koşulunu okuyun: yol (emiş, üfleme, gövde), ayar noktası ve mesafe [2].
2. Katalogdaki 3 m serbest alan değerini oda içi hedefle doğrudan karşılaştırmayın; hedef mekânın oda içi değeridir [1][2].
3. Fanın sürekli çalışacağı ayar noktasının satırını okuyun; düşük ve yüksek ayar arasındaki ses farkı modele göre değişir; Lineo 100 Quiet ES'te yaklaşık 20 dB(A) olduğu katalogdan okunur [2].
4. Gereğinden büyük fan seçmeyin; fazla büyük fan yüksek hava akımı gürültüsü üretir [4].
5. Fanı ve kanal bağlantılarını titreşim yalıtımıyla kurun; fan kutusunun tavan panosuna ve taşıyıcıya doğrudan değmemesine dikkat edin [1][4].
6. Kanal içi ses yalıtımı ihtiyacını sistemin ses hesabıyla belirleyin [1]; ses sönümleyici malzeme ya da bölme (baffle) kullanmak da gürültü azaltma yöntemleri arasında sayılır [4].
7. Hız kumandasını (0–10 V sinyali, hız seçici ya da hız ayarlayıcı) baştan planlayın [2].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez; güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin. İki teklif ancak aşağıdaki seçimler aynıysa karşılaştırılabilir, çünkü her biri teklif edilen cihazı ya da kurulumu değiştirir.

- **Kanal çapı ve debi.** Lineo Quiet Ø100 ile Ø315 mm arasında kanal çaplarında üretilir ve azami debi çapla değişir; örneğin ES sürümünde 10 V ayarında azami debi Ø100'de 300 m³/h, Ø315'te 2630 m³/h'tir [2].
- **Motor sürümü.** AC sürümünde motor 2 ya da 3 hızlıdır, ES sürümünde motor elektronik kontrollü EC fırçasızdır [2].
- **Hız kumandası.** TRIO-LINEO 503, C5 0.5, C 1.5, C 2.5, POT-IT ve POT gibi kumanda ve ayarlayıcılar ayrı kodlu aksesuarlardır [2].
- **Kurulum kalemleri.** Titreşim yalıtımı, esnek yastık ve kanal içi ses yalıtımı gürültü hedefine göre kurulumun parçası olabilir [1]; ses sönümleyici malzeme ya da bölme (baffle) kullanmak da kılavuzda gürültü azaltma yöntemi olarak sayılır [4].
- **Ses hedefi.** Yatak odası gibi düşük hedefli mekânlarda, hedefi sağlamak için yukarıdaki kalemlerin kapsamı genişleyebilir [1].

## Sık sorulan sorular

### En sessiz fan hangisidir?

Tek bir fan "en sessiz" diye gösterilemez; ses değeri model, ayar noktası, yol ve mesafe koşuluyla verilir ve koşulları aynı olmayan değerler doğrudan karşılaştırılmaz [1][2]. Örnek olarak Lineo Quiet ailesinde katalogdaki en düşük gövde değeri 9,9 dB(A) · 4 V · gövde, 3 m'dir (Lineo 100 Quiet ES) [2].

### Yatak odasında ve ofiste fan gürültüsü en çok kaç dB olabilir?

Hedef mekâna bağlıdır. Yönetmelikte sürekli gürültü için konutta gece yatak odasında C sınıfında 30 dB, D sınıfında 34 dB; yaşam alanında 35 ve 39 dB; büro özel odasında 40 ve 44 dB değerleri verilir [1]. WHO'nun 1999 rehberi yatak odası için 30 dB LAeq ve 45 dB LAmax verir [3]. Yönetmelikteki bu sınırlar odada ölçülen servis ekipmanı gürültüsüne uygulanır; katalog değeri 3 m serbest alan değeridir [1][2].

### Katalogdaki ses değeri neden odada duyulan sesten farklı olabilir?

Katalog ses basıncını 3 m mesafede, serbest alanda hesaplanmış olarak verir [2]. Yönetmeliğin hedefi ise odada ölçülen LAeq,nT değeridir [1]. İki değer farklı koşullarda verildiği için doğrudan karşılaştırılmaz [1][2].

### Devri düşürünce fan sessizleşir mi?

Katalog verisi bunu gösterir: Lineo 100 Quiet ES'te ayar 10 V'tan 4 V'a inerken üfleme tarafında ses basıncı 40,7 dB(A)'dan 20,6 dB(A)'ya, gövde yayınında 30,9 dB(A)'dan 9,9 dB(A)'ya düşer; azami debi 300 m³/h'ten 135 m³/h'e iner [2]. ABD Enerji Bakanlığı kılavuzu da değişken hız sürücülerinin düşük sistem talebinde hava akımı gürültüsünü azalttığını belirtir [4].

### Kanal fanında susturucu gerekir mi?

Cevap sistemin ses hesabına bağlıdır. Yönetmelik kanal tasarımında kanal içi gürültünün hesaplanmasını, EK-5.1'de verilen asgari gürültü düzeyleri (Tablo 5.1'deki izin verilen en yüksek iç gürültü düzeyleri) aşılırsa kanal içi ses yalıtımı yapılmasını ister [1]. Susturucular için eklenti kaybı, akış gürültüsü ve toplam basınç kaybı ölçümleri TS EN ISO 7235'te tanımlıdır [1].

### Aksiyel fan mı santrifüj (radyal) fan mı daha sessizdir?

ABD Enerji Bakanlığı kılavuzuna göre aksiyel fanlar aynı kapasitedeki hat içi santrifüj fanlardan biraz daha gürültü çıkarma eğilimindedir; bu gürültüde yüksek frekanslar baskın olma eğilimindedir ve yüksek frekanslar daha kolay azaltılır [4]. Kılavuz endüstriyel ve ticari fan uygulamalarını ele alır [4]. Seçim debi ve basınç gibi sistem ihtiyacına göre yapılır [4].

### Vortice Lineo Quiet kaç dB(A) ses çıkarır?

Lineo Quiet modellerinde katalogdaki en düşük gövde değeri 9,9 dB(A) · 4 V · gövde, 3 m (Lineo 100 Quiet ES), en yüksek gövde değeri 48,3 dB(A) · 10 V · gövde, 3 m'dir (Lineo 315 Quiet ES) [2]. Katalog Lineo Quiet modellerinin ses değerlerini ayar noktası ya da hız bazında ayrı verir [2].

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. T.C. Resmî Gazete, 31.05.2017, Sayı 30082, Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik (Çevre ve Şehircilik Bakanlığı), md. 4, 9, 13, 17, 18, 23, EK-5 Tablo 5.1, EK-8, EK-9. https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-7.htm ve ekleri https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-7-1.pdf (erişim 16.10.2026)
2. Vortice, LINEO Range kataloğu (dosya adı Doc_Pubblicita_Lineo_Range_193047.pdf), basılı künye Cod. 5.170.084.547 – Mayıs 2026, s. 4–6, 10, 12, 15, 18, 21, 24, 28 (üretici belgesi).
3. Dünya Sağlık Örgütü (WHO), Guidelines for Community Noise, Berglund, Lindvall, Schwela (ed.), 1999, bölüm 4.3 ve 4.3.1 (basılı s. 43). https://iris.who.int/handle/10665/66217 (erişim 16.10.2026)
4. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 22, 45 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 16.10.2026)
5. Avrupa Komisyonu, (AB) No 1253/2014 sayılı Komisyon Tüzüğü, 7 Temmuz 2014 (Resmî Gazete AB, L 337, 25.11.2014, s. 8), md. 1, 2, Ek IV ve Ek V. https://eur-lex.europa.eu/eli/reg/2014/1253/oj (erişim 16.10.2026)
6. Avrupa Komisyonu, (AB) No 327/2011 sayılı Komisyon Tüzüğü, 30 Mart 2011 (Resmî Gazete AB, L 90, 6.4.2011, s. 8). https://eur-lex.europa.eu/eli/reg/2011/327/oj (erişim 16.10.2026)
7. Avrupa Komisyonu, (AB) 2024/1834 sayılı Komisyon Tüzüğü, 3 Temmuz 2024 (Resmî Gazete AB, L, 4.7.2024), md. 9, 10, Ek I ve Ek II. https://eur-lex.europa.eu/eli/reg/2024/1834/oj (erişim 16.10.2026)
8. T.C. Resmî Gazete, 07.02.2026, Sayı 33161, Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (2024/1834/AB) (SGM-2026/2), Sanayi ve Teknoloji Bakanlığı. https://www.resmigazete.gov.tr/eskiler/2026/02/20260207-4.htm (erişim 16.10.2026)
9. Avrupa Komisyonu, (AB) 2025/2481 sayılı Komisyon Tüzüğü, 2 Aralık 2025 ((AB) 2024/1834'ü değiştiren Tüzük; Resmî Gazete AB, L, 8.12.2025), md. 1. https://eur-lex.europa.eu/eli/reg/2025/2481/oj (erişim 16.10.2026)
10. T.C. Resmî Gazete, 31.05.2018, Sayı 30437, Binaların Gürültüye Karşı Korunması Hakkında Yönetmelikte Değişiklik Yapılmasına Dair Yönetmelik (Çevre ve Şehircilik Bakanlığı); md. 5'in beşinci ve altıncı fıkrasını, md. 11'in üçüncü fıkrasını, EK-3 ve EK-4'ü değiştirir; geçici madde 1'i ekler; [1] künyesinde sayılan madde ve eklere dokunmaz. https://www.resmigazete.gov.tr/eskiler/2018/05/20180531-2.htm (erişim 16.10.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Katalogdaki ses basıncı değerleri 3 m mesafede, serbest alanda hesaplanmıştır [2]; odanızdaki ses düzeyi montaja, kanal sistemine ve mekânın akustiğine göre farklı çıkabilir. Yönetmelik değerleri 31.05.2017 tarihli metin ve 31.05.2018 tarihli değişiklikle birlikte, WHO değerleri 1999 tarihli kılavuzdaki hâliyle aktarılmıştır; sonraki değişiklikler güncel resmî metinden izlenmelidir; yasal bilgi yayın tarihindedir [1][3][10]. Kurulum yetkili personelle yapılmalıdır.
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
