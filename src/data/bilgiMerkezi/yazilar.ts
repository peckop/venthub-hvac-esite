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
    // Güncelleme tarihi 2026-10-10: karar OPS'ta, 10 Ekim 2026. Liste kartı ve yazı künyesi "Güncelleme" olarak
    // basar; site haritası lastmod'u ve Article `dateModified` buradan. Önceki değer 2026-10-08: gövdenin son
    // değişikliği, #1755 ("Fiyatı belirleyen etkenler" giriş cümlesi); ondan önce 2026-10-06, #1733.
    guncellemeTarihi: '2026-10-10',
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

## Nasıl çalışır?

Bir frekans konvertörü dört ana bölümden oluşur: doğrultucu, DC ara devre, invertör (İngilizcesi inverter) ve kontrol birimi [1].

| Bölüm | Görevi |
|---|---|
| Doğrultucu | Şebekedeki 3 fazlı AC gerilimi diyot ya da SCR'larla darbeli DC gerilime çevirir [1] |
| DC ara devre | Endüktör ve kapasitörlerle bu gerilimi dengeler [1] |
| İnvertör | IGBT'lerle DC gerilimi, gerilimi ve frekansı değişken AC'ye çevirir [1] |

İnvertör, motora giden dalgayı kısa elektriksel darbelerle oluşturur; bu darbelerin tekrarlanma hızına anahtarlama frekansı denir [1]. Anahtarlama frekansı bir dengedir: düşük tutulursa motorda duyulabilir ses oluşur, yüksek tutulursa sürücüde ısı artar [1]. Örneğin Danfoss FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir ve fabrika ayarı 4 kHz'dir [5].

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

Bu yazıda fiyat verilmez; güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin. İki teklif ancak aşağıdaki seçimler aynıysa karşılaştırılabilir, çünkü her biri teklif edilen cihazı ya da kurulumu değiştirir.

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

### Frekans konvertörü ile invertör aynı şey mi?

Frekans konvertörü, elektronik değişken hız sürücülerinin en yaygın biçimidir [7]. İnvertör ise cihazın içinde DC gerilimi değişken AC'ye çeviren bölümün adıdır [1].

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
  {
    // BLOG, doğrulanan metin sha cba52ba2ec9f, gövde sha cb0372b1d223 (tur 6, 2026-10-11: bağımsız Opus doğrulayıcı +
    // belirlenimci atıf/alıntı/kalıp kontrolleri; mevzuat kaynakları 2026-10-11 tarihinde resmî metinden yeniden okundu).
    // Yayın onayı Recep'ten, OPS penceresinde, 2026-10-11. Kapak karar 135'e göre kapak şablonu PR'ında eklenecek.
    kimlik: 'radyal-aksiyel-fan-secimi',
    konu: 'verimlilik',
    yayinTarihi: '2026-10-11',
    // Güncelleme tarihi = yayın günü: site haritası lastmod'u ve Article `dateModified` buradan (INV-BILGI-MERKEZI-KART-1).
    guncellemeTarihi: '2026-10-11',
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
        govde: `# Radyal fan mı aksiyel fan mı? Fan nasıl seçilir

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
- **Kılavuz kanatlı (vaneaxial).** Esasen tüp tipi bir fanın çıkışına, akışı düzelten ve havanın kinetik enerjisini basınca çeviren kanatlar eklenmiş hâlidir [1]. Havayarı profilli kanatlar ve dar toleranslarla üretildiğinde verimi %85'e kadar çıkabilir [1].

Vortice'nin Industrial Ventilation kataloğundaki örneklerde MPC HP ve MPC ED serileri uzun gövdeli kanal tipi aksiyel fanlardır; kanatları fan durdurulmuşken ayarlanabilen yapıdadır [6]. Vortice [Vorticel E serisi](vh:aile/vortice-aksiyel-endustriyel-fanlar) ise düşük basınçlı plaka tipi aksiyel fan serisidir [6]. Otopark havalandırmasında kullanılan jet fanlar da iki gruba ayrılır: aksiyel fanlı itme tipi ve geriye kıvrık (backward-curved) metal kanatlı santrifüj çarklı indüksiyon tipi [7].

## Kayışlı mı doğrudan tahrikli mi?

Doğrudan tahrikte çark motor miline bağlıdır; bu basit ve verimli bir düzendir, ancak hız ayarında daha az esneklik sunar [1]. Kayışlı tahrikte fan hızı kasnak çapları değiştirilerek ayarlanabilir [1]. Aksiyel fanlarda kayışlı tahrik motoru hava akımının dışında tutar; bu, yüksek sıcaklıklı, kirli ya da korozif ortamlarda bir üstünlük olabilir [1]. Aksiyel fanlarda düşük sıcaklıklı ve temiz havalı uygulamalarda ise doğrudan tahrik uygundur, çünkü fanın hemen arkasındaki motor hava akımıyla soğutulabilir [1].

| Seri (üretici belgesi) | Kanat | Tahrik |
|---|---|---|
| Nicotra Gebhardt AT | Öne eğik [2] | Kayışlı [2] |
| Nicotra Gebhardt ADH | Öne eğik [4] | Kayışlı [4] |
| Nicotra Gebhardt RDH | Geriye eğik [3] | Kayışlı [3] |
| Nicotra Gebhardt DD | Öne eğik [5] | Doğrudan tahrikli [5] |

Bu serilerin modellerini [AT](vh:aile/nicotra-gebhardt-at-cift-emisli-radyal-fanlar), [ADH](vh:aile/nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar), [RDH](vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar) ve [DD](vh:aile/nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar) sayfalarında; tüm fanları [radyal fanlar](vh:kategori/centrifugal-fans), [aksiyel endüstriyel fanlar](vh:kategori/axial-industrial-fans) ve [duman tahliye fanları](vh:kategori/smoke-exhaust-fans) kategorilerinde inceleyebilirsiniz.

## Fan eğrisi nasıl okunur?

Nicotra Gebhardt'ın kayışlı radyal fan kataloğunda (AT serisi) eğriler, fanın toplam basınç artışını debinin fonksiyonu olarak çift logaritmik bir diyagramda gösterilir [2]. Bu diyagramda sistem direnç eğrileri düz çizgi olarak görünür [2]. Eğri üzerindeki uygulama sınırları, kararlı ve yüksek verimli çalışmanın beklenebileceği önerilen aralığı gösterir [2]. Diyagramdaki verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2]. Doğrudan tahrikli DD serisinin eğrisinde üretici, gri işaretli bölgede fanın kullanılmamasını önerir [5].

Sistem eğrisi, bir sistemin basınç–debi karakteristiğinin grafik gösterimidir [1]. Fan eğrisinin sistem eğrisiyle aynı yönde eğimli olduğu bölgede çalışan fan kararsız çalışabilir [1]. Fan eğrisi sistem eğrisini birden fazla noktada keserse fan, "hunting" denen, kararlı bir çalışma noktası arayıp duran kararsız bir davranışa girebilir [1]. Aksiyel fanların şiddetli bir tutunma kaybı bölgesi vardır; bu yüzden çalışma koşulları geniş ölçüde değişen sistemlere özellikle uygun değildir [1]. Radyal kanatlı fanlarda ise tutunma kaybı sorunları diğer fan tiplerine göre daha az görülür [1].

## En yüksek verim noktasına yakın seçin

Bir fanı en yüksek verim noktasına yakın çalıştırmak performansı artırır, aşınmayı azaltır ve onarımlar arasındaki süreyi uzatır [1]. Çalışma noktası en yüksek verim noktasından uzaklaştıkça yatak yükleri ve gürültü artar [1]. Damper (ayar klapesi) karşı basıncı artırarak fanın toplam çıkışını düşürür ve çalışma noktasını eğri üzerinde sola kaydırır [1].

Tasarımdaki güvenlik payı, ileride kapasite artırma beklentisi ve kirlenme payı, sistem ihtiyacından bir boy büyük fan seçilmesine yol açabilir [1]. ABD Enerji Bakanlığı'nın 2003 tarihli rehberinin aktardığı bir ABD Çevre Koruma Ajansı çalışmasında (rehberin dipnotundaki kaynak: Temmuz 1997 tarihli ENERGY STAR Buildings Upgrade Manual), bina fan sistemlerindeki fanların yaklaşık %60'ının gereğinden büyük seçildiği, yaklaşık %10'unun ise %60 oranında büyük seçildiği bulunmuştur [1].

Fan devri düşürüldüğünde debi devirle doğrusal, basınç devrin karesiyle, güç devrin küpüyle değişir [1]. Aynı rehbere göre fan devrini %20 azaltmak fan gücünü yaklaşık %50 azaltır [1].

## Montaj fanın performansını nasıl etkiler?

Sistem etkisi, sistem bileşenlerinin birbirini etkilemesinden doğan ve gerçek performansın hesaplanan performanstan sapması olarak görülen kayıptır [1]. Fan çıkışına yakın konumlandırılmış bir dirsek, iletilen debiyi %30'a kadar azaltan bir sistem etkisi yaratabilir [1].

## Hava yoğunluğu ve eğri düzeltmesi

Fan eğrilerinin çoğu standart hava yoğunluğu varsayımıyla çizilir [1]. Nicotra Gebhardt AT eğrilerinde fan girişindeki referans yoğunluk 1,2 kg/m³'tür [2]. Eğrideki basınç ve çark giriş gücü hava yoğunluğuyla doğru orantılıdır [2]. Bu yüzden ölçülen statik basınç, gerçek hava yoğunluğu ile eğrinin çizildiği yoğunluk arasındaki farka göre düzeltilmelidir [1].

Örnek varsayım: sıcak hava taşıyan bir sistemde yoğunluk 1,08 kg/m³ olsun ve eğrideki çalışma noktasında basınç 1.000 Pa okunsun. Basınç yoğunlukla doğru orantılı olduğundan aynı devir ve debide bu sistemde fanın vereceği basınç yaklaşık 1.000 × 1,08 / 1,2 = 900 Pa olur [2].

## Ses değerleri nasıl okunur?

Ses gücü seviyesi, bir ses kaynağından yayılan akustik güçtür ve watt ya da desibel cinsinden verilir [1]. Nicotra Gebhardt AT kataloğunda 1 m mesafedeki yaklaşık A ağırlıklı ses basıncı seviyesi, A ağırlıklı ses gücü seviyesinden 7 dB çıkarılarak bulunur [2].

## Fanlar için verimlilik mevzuatı

Avrupa Birliği'nde elektrik giriş gücü 125 W ile 500 kW arasında olan motorlarla tahrik edilen fanların ekotasarım gereklilikleri, 3 Temmuz 2024 tarihli (EU) 2024/1834 sayılı Komisyon Tüzüğü ile düzenlenir [8]. Bu tüzük, önceki (EU) No 327/2011 sayılı tüzüğü 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır [8]. Yeni tüzük genel olarak 24 Temmuz 2026'dan itibaren uygulanır [8]. Tüzük, 2 Aralık 2025 tarihli (EU) 2025/2481 sayılı Komisyon Tüzüğü ile değiştirilmiştir; bu değişikliğe göre, yeni tüzüğün Ek II'sinin ilk iki paragrafına uygun olarak, eski tüzüğün I, II ve III numaralı ekleri başka ürünlere entegre edilen fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [11].

Tüzüğün kapsam dışı bıraktığı fanlar arasında, yalnız 2014/34/AB sayılı Direktif anlamında patlayıcı ortamlarda çalışmak üzere tasarlanıp pazarlanan fanlar ile yalnız acil durum için, 300 °C ve üzerinde 1 saat ya da daha uzun çalışabilecek yangın güvenliği fanları da bulunur [8].

Türkiye'de aynı konu, 7 Şubat 2026 tarihli ve 33161 sayılı Resmî Gazete'de yayımlanan, (AB) 2024/1834 sayılı tüzük ile onu değiştiren (AB) 2025/2481 sayılı tüzük esas alınarak hazırlanan Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM-2026/2) ile düzenlenir [9]. Tebliğ, diğer ürünlere entegre edilenler dahil bu güç aralığındaki fanların piyasaya arz edilmesi veya hizmete sunulması açısından çevreye duyarlı tasarım gerekliliklerini belirler [9]. Tebliğ, 20 Aralık 2019 tarihli ve 30984 sayılı Resmî Gazete'de yayımlanan önceki fan tebliğini yürürlükten kaldırır [9]. Bu hüküm de dahil tebliğin esas hükümleri 24 Temmuz 2027'de yürürlüğe girer [9].

## Patlayıcı ortam ve duman tahliyesi

Yalnız patlayıcı ortamlarda çalışmak üzere tasarlanıp pazarlanan fanlar, yukarıda anlatılan verimlilik tüzüğünün kapsamı dışındadır [8].

Vortice, yüksek sıcaklıktaki dumanın tahliyesi için tasarlanan fanların EN 12101-3 standardına göre üçüncü taraf bir kuruluşça belgelendirildiğini belirtir [7]. Aynı belgeye göre en yaygın sınıflar, sırasıyla 300 °C ve 400 °C'de duman tahliyesinde 2 saat kesintisiz çalışmaya karşılık gelen F300/120 ve F400/120'dir [7]. Vortice'nin VORT JET A F400 serisi F400/120 sertifikalıdır [6].

## Montaj ve bakım

- Fanın tesisata esnek bir bağlantıyla bağlanması titreşim ve gürültü yalıtımını iyileştirir [2].
- Tüm koruyucu tertibatlar takılıp bağlanmadan fan işletmeye alınmamalıdır [2].
- Nicotra Gebhardt'ın kayışlı fanlarında doğru gerginlik, üreticinin belirttiği test kuvvetinin kayış açıklığının metresi başına 16 mm sehim oluşturduğu noktada elde edilir [2]. Aynı üretici, ölçü işaretleri arasındaki uzunluğun belirtilen uzama değeri kadar artmasıyla da doğru gerginliğin elde edildiğini söyler; bu işlem rulmanın aşırı zorlanmaması için iki aşamada yapılmalıdır [2].
- Nicotra Gebhardt'ın kayışlı AT serisi fanlarındaki rulmanlar 40.000 çalışma saatlik nominal ömür için tasarlanmıştır [2].

## Fiyatı belirleyen etkenler

Bu yazıda fiyat verilmez; güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklifleri karşılaştırırken aşağıdaki seçimlerin aynı olup olmadığına bakın; her biri teklif edilen fanı ya da kurulumu değiştirir.

- **Fan tipi ve kanat biçimi.** Öne eğik, radyal ve geriye eğik kanatlar ile aksiyel türler farklı verim aralıklarına sahiptir [1].
- **Debi ve basınç aralığı.** Aynı seri içinde boy büyüdükçe debi aralığı değişir; örneğin RDH serisinde 0180–0560 boyları 90.000 m³/h'e, 0630–1000 boyları 290.000 m³/h'e kadar çıkar [3].
- **Tahrik biçimi.** Kayışlı tahrik hız ayarında esneklik sunar, doğrudan tahrik daha basit bir düzendir [1].
- **Çark malzemesi.** Örneğin SEAT serisinde çark enjeksiyon kalıplı PPH'den üretilir [10].
- **Özel kullanım belgesi.** Duman tahliye fanları EN 12101-3'e göre belgelendirilir ve F300/120 ya da F400/120 gibi sınıflarla sunulur [7].
- **Kurulum kalemleri.** Esnek bağlantı ve koruyucu tertibatlar kurulumun parçasıdır [2].

## İzlenecek yol

1. Sistemin gerektirdiği debiyi ve toplam basıncı belirleyin; sistem eğrisini çıkarın [1].
2. Havanın temiz mi, tozlu ya da parçacıklı mı olduğuna göre kanat tipini seçin [1].
3. Çalışma noktasının üretici eğrisinde önerilen kararlı ve verimli aralıkta olduğunu kontrol edin [2].
4. Gerçek hava yoğunluğu referans yoğunluktan farklıysa eğri değerlerini düzeltin [1][2].
5. Fan girişinde ve çıkışında sistem etkisi yaratacak dirsekleri ve daralmaları azaltın [1].
6. Duman tahliyesi söz konusuysa fanın EN 12101-3 belgesini ve sınıfını isteyin [7]; patlayıcı ortam söz konusuysa fanın o ortam için tasarlanıp pazarlandığını gösteren belgeyi üreticiden isteyin [8].

## Sık sorulan sorular

### Radyal fan mı daha verimli, aksiyel fan mı?

Tipe bağlıdır. Havayarı profilli geriye eğik radyal fanlarda verim %85'in üzerine çıkabilir [1]. Havayarı profilli, dar toleranslı kılavuz kanatlı aksiyel fanlar da %85'e kadar verime ulaşabilir [1]. Öne eğik radyal fanlarda verim %55–65 aralığındadır [1].

### Aksiyel fan kanala takılır mı?

Tüp tipi aksiyel fanlar kanallı HVAC tesisatına uygundur [1]. Vortice'nin Industrial Ventilation kataloğundaki MPC HP ve MPC ED serileri de uzun gövdeli kanal tipi aksiyel fanlardır [6].

### Fan eğrisindeki verim her devirde geçerli mi?

Nicotra Gebhardt'ın kayışlı AT, ADH ve RDH serilerinin eğrilerinde verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2].

### Fazla büyük fan seçmenin zararı ne?

Büyük seçilen fan en yüksek verim noktasından uzakta çalışır; bu durumda yatak yükleri ve gürültü artar [1].

### 327/2011 sayılı AB tüzüğü hâlâ geçerli mi?

Yürürlükten kalktı; ancak iki sınırlı istisna sürer. (EU) 2024/1834 sayılı tüzük, 327/2011'i 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır [8]. 2025/2481 sayılı değişiklik tüzüğüne göre, yeni tüzüğün Ek II'sinin ilk iki paragrafına uygun olarak, eski tüzüğün ekleri yalnız başka ürünlere entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanır [11]. Türkiye'de ise tebliğe göre, tebliğin Ek II'sinin ilk iki paragrafına uygun olarak, 24 Temmuz 2027'de yürürlükten kalkacak olan eski tebliğin ekleri, diğer ürünlere entegre fanlar için 24 Temmuz 2028'e, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [9].

### Doğru teklif için hangi bilgileri paylaşmalıyım?

Gerekli debi ve toplam basınç [1], havanın temiz ya da parçacıklı olup olmadığı [1], taşınan havanın sıcaklığı ve yoğunluğu [1][2], montaj yerindeki bağlantı düzeni [1] ve patlayıcı ortam ya da duman tahliyesi gibi özel bir kullanım olup olmadığı [7][8] teklifin doğru fana dayanmasını sağlar.

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 6–9, 11, 13, 17–24, 32–34, 80 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 11.10.2026)
2. Nicotra Gebhardt, Centrifugal Fans AT, belt driven, Issue 2.5 EN, 2013, s. 5, 70–71, 85, 99, 101 (üretici belgesi).
3. Nicotra Gebhardt, Centrifugal Fans RDH, belt driven, Issue 2.5 EN, 2013, s. 5, 7 (üretici belgesi).
4. Nicotra Gebhardt, Centrifugal Fans ADH, belt driven, Issue 2.5 EN, 2013, s. 5, 7 (üretici belgesi).
5. Nicotra Gebhardt, Centrifugal Fans direct driven with scroll, DD range, Issue 1.3, 2012, s. 6, 9 (üretici belgesi).
6. Vortice, Industrial Ventilation kataloğu, s. 4, 45, 58, 64 (üretici belgesi).
7. Vortice, VORT JET FAN SYSTEM broşürü, s. 10 (üretici belgesi).
8. Avrupa Komisyonu, Commission Regulation (EU) 2024/1834, EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1834 (erişim 11.10.2026)
9. T.C. Resmî Gazete, 07.02.2026, Sayı 33161, Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM-2026/2). https://www.resmigazete.gov.tr/eskiler/2026/02/20260207-4.htm (erişim 11.10.2026)
10. SEAT Ventilation, SEAT Series — Specifications, s. 1 (üretici belgesi).
11. Avrupa Komisyonu, Commission Regulation (EU) 2025/2481 (2024/1834'ü değiştiren tüzük), EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R2481 (erişim 11.10.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Örnek hesaptaki varsayım değerleri dışında, yazıdaki verim, debi ve basınç değerleri üretici belgelerinde ve kaynak rehberlerde verilen değerlerdir; kendi sisteminizdeki sonuç, montaj koşullarına ve hava yoğunluğuna göre farklı olabilir. Kurulum, devreye alma ve bakım yetkili ve eğitimli personel tarafından yapılmalıdır. Yasal şartlara ilişkin bilgiler yayın tarihindeki resmî metinlere dayanır; uygulamadan önce güncel metin kontrol edilmelidir.
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
