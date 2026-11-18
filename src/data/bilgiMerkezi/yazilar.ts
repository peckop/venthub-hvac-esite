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
  /**
   * Yazı altı "ilgili yazılar" için elle seçilmiş yazı KİMLİKLERİ (URN-161; yazı kaydının `kimlik` alanı, `vh:` öneki YOK).
   * Doluysa `ilgiliYazilariSec` önce bu listeyi kullanır (sıra korunur, en çok üç); yok ya da boşsa konu/ortak aile
   * kuralı aynen çalışır. Listede olmayan, kendisi olan ya da o dilde yazılmamış kimlik sessizce atlanır.
   * Neden: aynı konuda çok yazı olunca "ilk üç" konu dışı yazı seçiyordu (hava perdesi → çatı fanı, aspiratör, plug fan).
   */
  ilgili?: readonly string[]
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
    // Güncelleme tarihi 2026-11-09 (BLG-56, R5.5 yalnız-ekleme revizyonu): elektromanyetik uyumluluk kategorilerinin kaynağı (Danfoss FC 102 kılavuzu) açıkça atfedildi.
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-82: yazı R3.5 okur gözü kurallarıyla yeniden düzenlendi (seçim yolu başa, yinelenen giriş ve şerhler çıktı); yeni iddia, sayı, kaynak yok.
    guncellemeTarihi: '2026-11-17',
    urunler: ['vh:aile/danfoss-vlt-hvac-basic-drive-fc-101', 'vh:aile/danfoss-vlt-hvac-drive-fc-102', 'vh:aile/danfoss-vlt-micro-drive-fc-51'],
    diller: {
      tr: {
        slug: 'frekans-konvertoru-nedir',
        ozet: 'Frekans konvertörü, motora uyguladığı gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik bir kontrol cihazıdır.',
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ya da konu listesini tekrarlamaz; yeni iddia, sayı ya da marka yok.
        kartOzeti: 'Konvertör seçimine nereden başlayacağınızı bu rehberde bulun.',
        govde: `# Frekans konvertörü nedir, fan ve pompada nasıl seçilir?

Frekans konvertörü, motora verdiği gerilimi ve frekansı değiştirerek motorun hızını ayarlayan elektronik kontrol cihazıdır [1]. Fan ve pompa için seçim besleme gerilimine, güç aralığına, koruma sınıfına, çalışma ortamına ve uygulamanın tork karakteristiğine bakılarak yapılır [1][2]. Fan ve pompada hız anma değerine göre %20 azaltıldığında, üretici belgesindeki örnekte elektrik tüketimi %50 azalır [2].

Kısaca:

- Tork: pompa ve fanlar değişken tork uygulamasıdır; bu uygulamada düşük hızda motor için ek soğutma ya da akım düşürme gerekmez [1].
- Enerji: santrifüj fan ve pompada küçük bir hız düşüşü güçte büyük bir düşüş getirir [2].
- Ortam: yüksek ortam sıcaklığı, yüksek rakım ve uzun motor kablosu akım düşürme gerektirebilir [1].
- Güç: FC 51 gerilim sınıfına göre 0,18 kW ile 22 kW, FC 101 0,25 kW ile 90 kW arasında güç sunar [2][6].

## Frekans konvertörü seçiminde izlenecek yol

1. Uygulamanın değişken tork mu sabit tork mu olduğunu belirleyin [1].
2. Besleme gerilimine ve güç aralığına uygun aileyi seçin [2][4].
3. Montaj yerinin sıcaklık, rakım ve kablo uzunluğu koşullarını kontrol edin; gerekiyorsa bir üst güç boyutunu seçin [1].
4. Ortama uygun koruma sınıfını belirleyin [3][5].
5. Kurulumu elektromanyetik uyumluluk ve topraklama kurallarına göre planlayın [1].
6. Pompa sistemlerinde enerji tasarrufu hesabında statik basma yüksekliğini göz önüne alın [7].

## Frekans konvertörü nedir?

Frekans konvertörü, motor hızını değiştirebilen ya da yükteki değişime rağmen sabit tutabilen bir kontrol cihazıdır [1]. ABD Enerji Bakanlığı, Europump ve Hydraulic Institute'un ortak pompa rehberine göre elektronik değişken hız sürücülerinin en yaygın biçimi, gerilim kaynaklı ve darbe genişlik modülasyonlu (PWM) frekans konvertörüdür [7]. Danfoss belgelerindeki "FC" kısaltması da "frequency converter", yani frekans konvertörü anlamına gelir [2].

## Frekans konvertörü nasıl çalışır?

Bir frekans konvertörü temel biçiminde dört ana bölüme ayrılabilir: doğrultucu, DC ara devre, invertör ve kontrol birimi [1].

| Bölüm | Görevi [1] |
|---|---|
| Doğrultucu | Şebekedeki 3 fazlı AC gerilimi diyot ya da SCR'larla darbeli DC gerilime çevirir |
| DC ara devre | Endüktör ve kapasitörlerle bu gerilimi dengeler |
| İnvertör | IGBT'lerle DC gerilimi, gerilimi ve frekansı değişken AC'ye çevirir |
| Kontrol birimi | Yazılım, donanımı çalıştırarak AC motoru kontrol eden ve düzenleyen değişken gerilimi üretir |

İnvertör, motora giden dalgayı kısa elektriksel darbelerle oluşturur; bu darbelerin tekrarlanma hızına anahtarlama frekansı denir [1]. Anahtarlama frekansı bir dengedir: düşük tutulursa motorda duyulabilir ses oluşur, yüksek tutulursa sürücüde ısı artar [1]. Örneğin Danfoss FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir ve fabrika ayarı 4 kHz'dir [5].

Hızı ayarlamanın temel yolu gerilimi ve frekansı birlikte değiştirmektir (V/Hz kontrolü); sürücü düşük hızlarda da tam tork verebilmek için bu oranı bir eğriye göre ayarlar [1]. Danfoss'un gerilim vektör kontrolü (VVC+), standart V/Hz kontrolüne göre hız ayarı ve yük torku değiştiğinde daha iyi dinamik tepki ve kararlılık sağlar [2][4].

## Fan ve pompada frekans konvertörü neden kullanılır?

Santrifüj fan ve pompalar orantı yasalarına (benzerlik yasaları) uyar: debi devirle doğru orantılı, basınç devrin karesiyle, güç ise devrin küpüyle orantılıdır [2]. Bu yüzden hızdaki küçük bir düşüş güçte büyük bir düşüş getirir [2]. Üretici belgesindeki örnekte hız anma değerine göre yalnız %20 azaltıldığında debi de %20 azalır, elektrik tüketimi ise %50 azalır [2].

Örnek varsayım: anma hızında 10 kW çeken bir fan düşünelim. Hız %80'e indirildiğinde güç 0,51 katına, yani yaklaşık 5,1 kW'a iner [2].

Bu hesap her sistemde aynı sonucu vermez. Aynı pompa rehberi, orantı yasalarını enerji tasarrufu hesabında doğrudan kullanmanın statik basma yüksekliği olan pompa sistemlerinde büyük hatalara yol açabileceğini belirtir [7]. Bu nedenle statik basma yüksekliği olan pompa sistemlerinde tasarruf ayrıca hesaplanmalıdır [7].

Frekans konvertörü, fan ya da pompanın hızını dahili kontrolüyle değiştirerek debiyi, seviyeyi ya da basıncı istenen değerde tutabilir [2].

## Frekans konvertörüyle yumuşak kalkış

Büyük motorlarda kalkış akımını sınırlamak için geleneksel olarak yıldız/üçgen yol verici ya da yumuşak yol verici kullanılır; frekans konvertörü kullanıldığında bu ayrı yol vericilere gerek kalmaz [1][2]. Frekans konvertörü motoru kalkındırırken anma akımından fazla akım çekmez [2].

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

| Özellik | FC 51 (VLT Micro Drive) | FC 101 (VLT HVAC Basic Drive) |
|---|---|---|
| Güç aralığı | 0,18–22 kW, gerilim sınıfına göre [6] | 0,25–90 kW [2] |
| Giriş | Tek faz 200–240 V; üç faz 200–240 V ve 380–480 V [4] | Üç faz 200–240 V, 380–480 V, 525–600 V [2] |
| Koruma sınıfı | IP20; kitle IP21 [5] | IP20, IP54; kitle IP21 [3] |
| Öne çıkan işlevler | Dahili süreç PI kontrolü, otomatik enerji optimizasyonu [6] | Uyku modu, yangın modu [3] |

FC 102'nin (VLT HVAC Drive) 355–800 kW gövdelerinde yerleşik PID kontrolü ve pompa kademeleme bulunur [1].

Bu üç ailenin modellerini [FC 51](vh:aile/danfoss-vlt-micro-drive-fc-51), [FC 101](vh:aile/danfoss-vlt-hvac-basic-drive-fc-101) ve [FC 102](vh:aile/danfoss-vlt-hvac-drive-fc-102) sayfalarında, tüm cihazları [frekans konvertörleri](vh:kategori/frequency-converters) kategorisinde inceleyebilirsiniz.

## HVAC uygulamalarına özel sürücü işlevleri

- **Uyku modu.** Debi düşük ya da sıfır olduğunda sürücü enerji tasarrufu için uyku moduna geçer; basınç ayar değerinin altına düştüğünde kendiliğinden yeniden başlar [3].
- **Yangın modu.** Sürücünün kendini korumak için durmasını engeller; merdiven basınçlandırma, otopark egzoz fanları ve duman tahliyesi gibi uygulamalarda fanın çalışmasını sürdürür [3].
- **Yerleşik PID kontrolü.** FC 102'nin 355–800 kW gövdelerinde, kapalı çevrim sistemlerde basıncı, debiyi ya da sıcaklığı korumak için dış kontrol cihazına duyulan ihtiyacı ortadan kaldırır; iki ayrı cihazdan gelen iki geri besleme sinyaliyle çalışabilir [1].
- **Otomatik enerji optimizasyonu.** FC 51'de HVAC uygulamalarında %5–15 enerji tasarrufu sağlar [6].
- **Pompa kademeleme.** FC 102'nin 355–800 kW gövdelerinde temel kademe kontrolü, değişken hızlı bir pompaya ek olarak sabit hızlı pompaları sırayla devreye alır [1].

## Üç fazlı girişli frekans konvertörlerinde verimlilik şartı var mı?

AB'nin 2019/1781 sayılı Komisyon Tüzüğü, 1 Temmuz 2021'den itibaren 0,12 kW ile 1000 kW arasındaki motorlarla kullanılan üç fazlı girişli değişken hız sürücülerinin güç kayıplarının IE2 verim düzeyine karşılık gelen en yüksek güç kaybını aşmamasını zorunlu kılar [8]. Tüzük 2021'de (EU) 2021/341 sayılı tüzükle değiştirildi; 24.01.2023 tarihli konsolide metinde sürücülere yönelik IE2 şartı ilk metindeki ifadesiyle yer alır [9].

Türkiye'de 0,12 kW ile 1000 kW arasındaki motorlarla çalışan üç fazlı girişli değişken hız sürücüleri, 28 Nisan 2021 tarihli ve 31468 sayılı Resmî Gazete'de yayımlanan Elektrik Motorlarının ve Değişken Hız Sürücülerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM: 2021/16) kapsamındadır; Tebliğ, AB'nin 2019/1781 sayılı Komisyon Tüzüğü ile onu değiştiren 2021/341 sayılı tüzük esas alınarak hazırlanmıştır [10]. Tebliğin sürücülere yönelik şartı, 29 Haziran 2021 tarihli değişiklik tebliğiyle (SGM: 2021/23) 15 Ağustos 2021'den itibaren uygulanır [10][12].

## Sürücü kurulumunda dikkat edilecekler

- Şebeke, motor ve kontrol kabloları birbirinden ayrı döşenmelidir; aksi hâlde istenmeyen davranış ya da düşük performans görülebilir [1].
- Motor kablosundaki hızlı gerilim değişimi (dU/dt), kablonun fazları ile ekranı ve ekran ile toprak arasında kaçak akımlar oluşturur; bu da sürücünün elektromanyetik yayılımını değiştirir [1].
- Danfoss FC 102 tasarım kılavuzuna göre sürücülerin elektromanyetik uyumluluk kategorileri (C1–C4) EN/IEC 61800-3 standardında tanımlanır: C1 ve C2 konut ve ofis ortamı, C3 endüstriyel ortam içindir [1]. Standardın güncel baskısı ayarlanabilir hızlı sürücü sistemlerinin EMC gerekliliklerini tanımlar [11].
- Motor yatak akımlarını önlemek için tahrik ucu olmayan tarafta yalıtımlı rulman kullanılması ve sürücü, motor ile tahrik edilen makinenin doğru topraklanması önerilir [1].
- Elektrik çarpmasına karşı kaçak akım koruma cihazı kullanılacaksa besleme tarafında yalnız Tip B cihaz kullanılmalıdır, çünkü sürücü toprak iletkeninde DC akım oluşturabilir [1].
- Sürücü patlayıcı ortama kurulmamalıdır; gerekiyorsa bu alanın dışındaki bir panoya yerleştirilir [1].
- Hava ile soğutma için sürücünün üstünde ve altında üreticinin belirttiği boşluk bırakılmalıdır; yetersiz boşluk aşırı ısınmaya ve performans düşüşüne yol açar [1].

## Sürücü güvenliği ve bakımı

- Sürücü şebekeden ayrıldıktan sonra da içindeki DC ara devre kapasitörleri yüklü kalabilir; servis öncesi üreticinin belirttiği süre kadar beklenmelidir [1]. Örneğin FC 51'de bu süre M1, M2 ve M3 gövdelerinde 4 dakika, M4 ve M5 gövdelerinde 15 dakikadır [4].
- Sürücü şebekeye bağlıyken motor her an çalışabilir [4].
- Kurulum, devreye alma ve bakım yalnız yetkili ve eğitimli personel tarafından yapılmalıdır [4].
- Toz, elektronik bileşenlerin üzerinde yalıtım katmanı gibi davranarak soğutmayı azaltır; bu yüzden soğutucu ve fanların düzenli olarak tozdan arındırılması önerilir [1].

## Teklif için hangi bilgiler gerekir?

Güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin. Doğru cihaz seçimi ve birebir karşılaştırılabilir teklif alabilmek için şu bilgileri paylaşmanız gerekir:

- **Güç ve giriş gerilimi.** Aynı aile içinde modeli güç ve gerilim sınıfı belirler; örneğin FC 101 0,25 kW ile 90 kW arasında, üç fazlı 200–240 V, 380–480 V ve 525–600 V girişle üretilir [2].
- **Koruma sınıfı ve kitler.** FC 101 IP20 ya da IP54 gövdeyle sunulur; IP21 isteğe bağlı bir kitle sağlanır [3].
- **Montaj yerinin koşulları.** Yüksek ortam sıcaklığı, yüksek rakım, yüksek anahtarlama frekansı ya da uzun motor kablosu akım düşürme gerektirebilir; bu durumlarda bir güç boyutu büyük cihaz seçilmesi önerilir [1].

## Sık sorulan sorular

### Frekans konvertörü ile invertör aynı şey mi?

İnvertör, frekans konvertörünün içinde DC gerilimi değişken AC'ye çeviren bölümün adıdır [1]. Elektronik değişken hız sürücülerinin en yaygın biçimi gerilim kaynaklı ve darbe genişlik modülasyonlu (PWM) frekans konvertörüdür; pompa rehberi ona çoğu zaman yanlışlıkla invertör dendiğini belirtir [7].

### Frekans konvertörü ne kadar enerji tasarrufu sağlar?

Fan ve pompada hızı %20 azaltmak, üretici örneğinde elektrik tüketimini %50 azaltır [2]. FC 101 seçim kılavuzu da değişken tork uygulamalarında bu oranı tipik değer olarak verir [3]. Tasarruf uygulamaya bağlıdır. Statik basma yüksekliği olan pompa sistemlerinde gerçek tasarruf ayrıca hesaplanmalıdır [7].

### Frekans konvertörü motorda ses yapar mı?

Anahtarlama frekansı düşük tutulursa motorda duyulabilir ses oluşur; yüksek tutulursa sürücüde ısı artar [1]. FC 51'de bu değer 2, 4, 8 ya da 16 kHz olarak seçilebilir [5].

İlgili rehber: [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi)

### Yangın modunda frekans konvertörü fanı durdurur mu?

Danfoss FC 101'de yangın modu açıldığında sürücü kendini korumak için durmaz; kontrol sinyallerine, uyarılara ya da alarmlara bakmadan fanın çalışmasını sürdürür [3].

### Türkiye'de frekans konvertörleri için verimlilik şartı var mı?

Evet. AB tüzüğüne göre 1 Temmuz 2021'den beri üç fazlı girişli değişken hız sürücülerinin güç kayıpları IE2 sınırını aşmamalıdır [8]. Türkiye'de bu sürücüler, AB tüzüğü esas alınarak hazırlanan ve 28 Nisan 2021 tarihli Resmî Gazete'de yayımlanan Tebliğ'in kapsamındadır [10]; tebliğin sürücülere yönelik şartı değişiklik tebliğiyle 15 Ağustos 2021'den itibaren uygulanır [12].

### Frekans konvertörü teklifi için hangi bilgileri paylaşmalıyım?

Motorun gücü, besleme gerilimi ve faz sayısı [2][4], uygulamanın değişken tork mu sabit tork mu olduğu [1], montaj yerinin sıcaklığı ve rakımı ile motor kablosunun uzunluğu [1] ve istenen koruma sınıfı [3][5] gerekir.

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
    // Güncelleme tarihi 2026-11-09 (BLG-63): AB-327/2011 durumu kayıtta "geçiş döneminde" oldu; SSS cevabı "Yürürlükten kalktı" yerine "Genel hükümleri yürürlükten kalktı; ekleri geçiş döneminde uygulanır" ve 327/2011'in genel hükümlerini kaldıran tüzük ifadesi. Yalnız bu iki cümle değişti; tarihler ve kaynaklar aynı. Önceki değer: 2026-11-08.
    // Güncelleme tarihi 2026-11-09 (BLG-56, R5.5 yalnız-ekleme): duman tahliyesi fanlarının EN 12101-3 belgelendirme cümlesine kaynak atfı (üretici broşürü) eklendi.
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-82: okur gözüyle yeniden düzenleme (R3.5); yeni iddia yok
    guncellemeTarihi: '2026-11-17',
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

Aksiyel fanda hava fan ekseni boyunca ilerler; radyal (santrifüj) fanda hava radyal yönde hızlandırılır ve kinetik enerji basınca dönüşür [1]. Temiz, düşük basınçlı ve yüksek debili hava akımlarında çoğunlukla aksiyel fan; yüksek basınç gerektiren ya da kirli, parçacıklı ve yüksek sıcaklıklı hava akımlarında çoğunlukla radyal fan öne çıkar [1].

Kısaca:

- Aksiyel fan: benzer kapasiteli santrifüj fandan daha kompakt, hafif ve düşük maliyetlidir; çalışma koşulları geniş ölçüde değişen sistemlere özellikle uygun değildir [1].
- Radyal fan: nispeten yüksek basınç üretebilir; nem ve parçacık içeriği yüksek hava akımlarında sık kullanılır [1].
- Seçim: debi, sıcaklık, basınç, hava özellikleri ve sistem yerleşimi gibi çalışma koşulları önce aksiyel mi santrifüj mü gerektiğini belirler [1].

## Radyal ve aksiyel fan arasındaki farklar

Radyal fan ile santrifüj fan aynı tür için kullanılır; "radyal düz" ve "radyal uçlu" ise santrifüj fanların kanat biçimleridir [1].

| Özellik | Aksiyel fan [1] | Radyal (santrifüj) fan [1] |
|---|---|---|
| Hava yönü | Hava fan eksenine paralel akar | Hava akımı radyal yönde hızlandırılır |
| Basınç ve debi | Pervane tipi düşük basınçta yüksek debi üretir; tüp tipi orta basınç ve yüksek debide, kılavuz kanatlı tip orta ila yüksek basınçlı uygulamalarda kullanılır | Radyal düz kanatlı fanlar düşük ve orta debide, yüksek basınç gerektiren uygulamalarda yaygın kullanılır |
| Verim | Pervane tipi görece düşük verimlidir; kanat profilli, küçük boşluklu kılavuz kanatlı tip %85'e kadar çıkar [1] | Öne eğik kanatta %55–65; kanat profilli geriye eğik kanatta %85'in üzerine çıkabilir [1] |
| Ses | Aynı debi için benzer bir santrifüj fandan daha hızlı dönmesi gerekir; bu yüzden bir ölçüde daha gürültülüdür, gürültü kolay sönümlenen yüksek frekanslarda yoğunlaşır | Öne eğik kanatlı tip nispeten düşük devirde çalışabilir; bu düşük gürültü düzeyine karşılık gelir |
| Kirli hava | Genellikle temiz hava uygulamalarında kullanılır; toz, duman ve buhar gibi küçük parçacıklı egzoz akımlarında da sık kullanılır | Nem ve parçacık içeriği yüksek "kirli" hava akımlarında sık kullanılır; radyal düz kanat toz, odun talaşı ve metal hurdasına uygundur, öne eğik kanat genellikle temiz havayla sınırlıdır |
| Tipik kullanım | Temiz hava, düşük basınç, yüksek debi; çatı havalandırması (pervane tipi), kanallı HVAC ve egzoz (tüp tipi) | Yüksek basınç, kirli hava akımları, malzeme taşıma, daha yüksek sıcaklıktaki sistemler |
| Boyut, ağırlık, maliyet | Benzer kapasiteli santrifüj fandan daha kompakt, hafif ve düşük maliyetlidir | Benzer kapasiteli aksiyel fana göre daha fazla dönen kütleye sahiptir ve daha az kompakttır |

Aksiyel ve santrifüj fanların basınç, debi ve verim yetenekleri kısmen çakışır; çoğunlukla birbirinin yerine kullanılamazlar [1].

## Hangi durumda hangisi?

Seçim, debi, sıcaklık, basınç, hava özellikleri ve sistem yerleşimi gibi çalışma koşullarının bilinmesiyle başlar; bu koşullar önce aksiyel mi santrifüj mü gerektiğini belirler [1].

- Temiz hava, düşük basınç, yüksek debi: aksiyel fan (pervane tipi) [1].
- Kanallı HVAC tesisatı, orta basınç, yüksek debi: tüp tipi aksiyel fan [1].
- Yüksek basınç: çoğunlukla radyal fan; düşük ve orta debide yüksek basınçta radyal düz kanat yaygındır, kılavuz kanatlı aksiyel fan da orta ila yüksek basınçta kullanılır [1].
- Toz, odun talaşı ya da metal hurdası taşıyan hava: radyal düz kanat; küçük parçacıklı ya da yüksek nemli hava: radyal uçlu kanat [1].
- Çalışma koşulları geniş ölçüde değişiyorsa aksiyel fan özellikle uygun değildir; bazı santrifüj tipleri ise geniş çalışma koşullarına uyar [1].

## Fan seçiminde izlenecek yol

1. Sistemin gerektirdiği debiyi ve toplam basıncı belirleyin; sistem eğrisini çıkarın [1].
2. Havanın nem ve parçacık içeriğini belirleyin; bunlar fan tipi seçiminde önemli etkenlerdir [1].
3. Çalışma noktasının üretici eğrisinde önerilen kararlı ve verimli aralıkta olduğunu kontrol edin [2].
4. Gerçek hava yoğunluğu referans yoğunluktan farklıysa eğri değerlerini düzeltin [1][2].
5. Fan girişindeki dirseği fana çok yakın yerleştirmeyin: girişten önce kanal çapının en az üç katı düz kanal bırakın, bu mümkün değilse giriş kutusu ya da akış düzeltici kullanın [1]. Çıkışta dirsek ve benzeri bağlantı parçalarını fandan yeterince uzağa yerleştirin [1].
6. Duman tahliyesi söz konusuysa fanın EN 12101-3 belgesini ve sınıfını isteyin [4].
7. Patlayıcı ortam söz konusuysa: (EU) 2024/1834 sayılı tüzüğün kapsam dışı koşulu, fanın yalnız o ortamda çalışmak üzere belirtilmiş ve bu amaçla özel olarak tasarlanıp pazarlanmış olmasıdır; bunu gösteren belgeyi üreticiden isteyin [5]. İlgili rehber: [Patlayıcı ortamda fan seçimi: ATEX, bölge ve kategori nedir?](vh:yazi/patlayici-ortamda-fan-secimi-atex).

## Radyal fan nedir ve nasıl çalışır?

Santrifüj (radyal) fan, havanın çarkın dönme eksenine dik yönde boşaltıldığı fan tasarımıdır [1]. Hava çark göbeğinden kanat uçlarına doğru ilerlerken kinetik enerji kazanır; bu enerji, hava boşaltmaya girmeden önce yavaşlarken statik basınç artışına çevrilir [1].

Radyal fanlar nispeten yüksek basınç üretebilir [1]. Endüstride en yaygın kullanılan fan tipidir; yüksek basıncı yüksek verimle üretebilir ve zorlu çalışma koşullarına göre yapılabilir [1]. Sıklıkla nem ve parçacık içeriği yüksek "kirli" hava akımlarında, malzeme taşıma uygulamalarında ve daha yüksek sıcaklıktaki sistemlerde kullanılır [1]. Bazı santrifüj tipleri geniş ölçüde değişen çalışma koşullarına hizmet edebilir [1].

VentHub'da bu fanları [radyal fanlar](vh:kategori/centrifugal-fans) kategorisinde inceleyebilirsiniz.

## Radyal fanlarda kanat tipleri

Radyal fanlar kanat tipine göre öne eğik, radyal düz, radyal uçlu, geriye eğik gibi gruplara ayrılır; kanat tipi verimi ve kirli havaya uygunluğu etkiler [1].

| Kanat tipi | Verim | Kirli ya da parçacıklı hava |
|---|---|---|
| Öne eğik | %55–65 [1] | Genellikle temiz hava uygulamalarıyla sınırlı [1] |
| Radyal düz kanat | — | Toz, odun talaşı ve metal hurdası taşıyan hava akımlarına uygun [1] |
| Radyal uçlu | %75'e kadar [1] | Küçük parçacıklı ve yüksek nemli hava akımlarına uygun [1] |
| Geriye eğik, kanat profilli | %85'in üzerine çıkabilir [1] | Düşük çarpma açısı kanatlarda birikmeye yol açabilir [1] |

Radyal düz kanatlı tip dayanıklı yapısıyla endüstrinin iş atı sayılır [1]. Geriye eğik kanatlı fanlarda en verimli olanlar kanat profilli kanatlardır [1]. Bu kanatlar kaldırma kuvvetiyle çalıştığı için bu fan tipi tutunma kaybına (stall) bağlı kararsız çalışmaya karşı hassastır [1].

## Aksiyel fan nedir ve nasıl çalışır?

Aksiyel fan, havanın akışının çarkın dönme eksenine esas olarak paralel olduğu fandır; çark silindirik bir gövdenin içindedir [1]. Hava, kanatların oluşturduğu aerodinamik kaldırma kuvvetiyle basınçlandırılır, tıpkı pervane ve uçak kanadı gibi [1].

Aksiyel fanlar bazen santrifüj fanlarla birbirinin yerine kullanılabilse de genellikle "temiz hava", düşük basınç ve yüksek debi uygulamalarında kullanılır [1]. Daha yüksek devirde çalışma eğilimindedir ve aynı kapasitedeki kanal içi santrifüj fanlardan biraz daha gürültülüdür; bu gürültü yüksek frekanslarda yoğunlaşır ve daha kolay sönümlenir [1].

Aksiyel fanların şiddetli bir tutunma kaybı bölgesi vardır; bu nedenle çalışma koşulları geniş ölçüde değişen sistemlere özellikle uygun değildirler [1]. Birçok aksiyel fanda bu sorun, tutunma kaybını önleyici donanımlı bir fan seçilerek çözülebilir [1].

VentHub'da bu fanları [aksiyel fanlar](vh:kategori/axial-industrial-fans) kategorisinde inceleyebilirsiniz.

## Aksiyel fan türleri

Aksiyel fanın pervane tipi, tüp tipi ve kılavuz kanatlı olmak üzere üç temel türü vardır [1].

- **Pervane tipi.** Düşük basınçta yüksek debi üretir; görece düşük verimlidir ama basit yapısı sayesinde ucuzdur [1].
- **Tüp tipi (tubeaxial).** Orta basınç ve yüksek debi gerektiren uygulamalarda kullanılır ve kanallı HVAC tesisatına uygundur [1]. Motora doğrudan bağlanabildiği gibi kayışla da tahrik edilebilir [1].
- **Kılavuz kanatlı (vaneaxial).** Esasen tüp tipi bir fanın çıkışına, akışı düzelten ve havanın kinetik enerjisini basınca çeviren kanatlar eklenmiş hâlidir [1]. Kanat profilli kanatlar ve küçük boşluklarla üretildiğinde verimi %85'e kadar çıkabilir [1].

Tahrik biçimi de seçimi etkiler. Doğrudan tahrikte çark motor miline bağlıdır; bu basit ve verimli bir düzendir, ancak hız ayarında daha az esneklik sunar [1]. Kayışlı tahrikte fan hızı kasnak çapları değiştirilerek ayarlanabilir [1]. Kayışlı tahrikli aksiyel fanda motor hava akımının dışında kalır; bu, doğrudan tahrikli aksiyel fana göre yüksek sıcaklıklı, kirli ya da korozif ortamda üstünlük olabilir [1].

## Radyal ve aksiyel fanların kullanım alanları

Aksiyel fanlar:

- Çatı havalandırması: pervane tipi fanlar çatı havalandırma uygulamalarında sık kullanılır [1].
- Kanallı HVAC ve egzoz: tüp tipi fanlar kanallı HVAC tesisatına uygundur ve kanal kayıplarını yenecek basıncı üretebildiği için egzoz uygulamalarında sık kullanılır [1].
- Kazan egzozu: kılavuz kanatlı fanlar, kazan egzozunda indüklenmiş çekiş gibi orta ve yüksek basınçlı işlerde kullanılır [1].
- Sanayi havalandırması: katalogda uzun gövdeli kanallı aksiyel fanlar yer alır; kanatları fan durdurulmuşken ayarlanabilir [3].
- Otopark: aksiyel fanlı itme tipi jet fanlar kullanılır [4].

Radyal fanlar:

- Toz, odun talaşı ve metal hurdası taşıyan hava akımları: radyal düz kanatlı fanlar [1].
- Katı parçacık taşıma servisleri: radyal uçlu fanlar, geniş çalışma boşlukları nedeniyle yaygın kullanılır [1].
- Malzeme taşıma ve daha yüksek sıcaklıktaki sistemler: santrifüj fanlar [1].
- Otopark: geriye kıvrık metal kanatlı santrifüj çarklı indüksiyon tipi jet fanlar kullanılır [4].

Tipten bağımsız olarak, yüksek sıcaklıktaki dumanın tahliyesi için tasarlanan fanlar EN 12101-3'e göre üçüncü taraf bir kuruluşça belgelendirilir [4].

## Fan debisi nedir ve kılavuzda hangi birimle verilir?

Fan debisi, fanın ya da sistemin birim zamanda geçirdiği hava hacmidir; ABD Enerji Bakanlığı kılavuzunun sözlüğü cfm birimini (dakikadaki fit küp; 1 cfm yaklaşık 1,70 m³/h) belirli bir fan veya sistem için akış hacmi olarak tanımlar [1]. Kılavuz basıncı inç su sütunu (in. wg; 1 in. wg yaklaşık 249 Pa) ile verir [1]. Fanın debi ve basınç çıktıları birbirine bağlıdır [1].

Üretici kataloglarını ve ürün sayfalarını karşılaştırırken debi ve basıncın hangi birimle yazıldığına bakın.

## Fan eğrisi nasıl okunur?

Fan eğrisi, fanın ürettiği basıncın ve gereken gücün fanın geçirebildiği hava debisi aralığı boyunca çizildiği grafiktir [1]. Kayışlı bir radyal fan kataloğunda eğriler, fanın toplam basınç artışını debinin fonksiyonu olarak çift logaritmik bir diyagramda gösterir; bu diyagramda sistem direnç eğrileri düz çizgi olarak görünür [2]. Eğri üzerindeki uygulama sınırları, kararlı ve yüksek verimli çalışmanın beklenebileceği önerilen aralığı gösterir [2]. Diyagramdaki verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2].

Sistem eğrisi, bir sistemin basınç–debi karakteristiğinin grafik gösterimidir; sistemin bileşenlerindeki kayıpların toplanmasıyla hesaplanır [1]. Kılavuza göre:

- Sistem eğrisi fan eğrisini en yüksek verim noktasının yakınında olmayan bir noktada keserse fan verimsiz çalışabilir [1].
- Fan eğrisinin sistem eğrisiyle aynı yönde eğimli olduğu bölgede çalışan fan kararsız çalışabilir [1].
- Fan eğrisi sistem eğrisini birden fazla noktada keserse fan, "hunting" denen, kararlı bir çalışma noktası arayıp duran kararsız bir davranışa girebilir [1].

Aksiyel fanların şiddetli bir tutunma kaybı bölgesi vardır; tutunma kaybı öne eğik ve geriye eğik santrifüj fanlarda da şiddetli olabilir [1]. Radyal düz kanatlı fanlarda tutunma kaybı sorunları diğer fanlara göre daha az görülür [1].

## Toplam basınç artışı ile statik basınç artışı nasıl ilişkilidir?

Kayışlı bir santrifüj fan kataloğunda eğriler fanın toplam basınç artışını gösterir [2]. Çıkıştaki dinamik basınç, fan çıkışındaki flanşlı kesit alanına göre alınır [2]. Statik basınç artışı şöyle bulunur:

- Fan çıkışına kanal takılıysa toplam basınç artışından çıkıştaki dinamik basınç çıkarılır [2].
- Kanal yoksa (serbest çıkış) dinamik basınç, serbest çıkış için verilen bir düzeltme katsayısıyla çarpılarak çıkarılır [2].

Bu, ilgili fan serisi için verilen hesap yöntemidir; başka kataloglarda gösterim ve katsayılar farklı olabilir.

## Fanı en yüksek verim noktasına yakın seçin

Bir fanı en yüksek verim noktasına yakın çalıştırmak performansı artırır, aşınmayı azaltır ve onarımlar arasındaki süreyi uzatır [1]. Çalışma noktası en yüksek verim noktasından uzaklaştıkça yatak yükleri ve gürültü artar [1]. Tasarımdaki güvenlik payı, ileride kapasite artırma beklentisi ve kirlenme payı, sistem ihtiyacından bir boy büyük fan seçilmesine yol açabilir [1].

Fan devri düşürüldüğünde debi devirle doğrusal, basınç devrin karesiyle, güç devrin küpüyle değişir [1].

## Montaj, hava yoğunluğu ve ses

Fan çıkışına yakın konumlandırılmış bir dirsek, iletilen debiyi %30'a kadar azaltan bir sistem etkisi yaratabilir [1]. Fan eğrilerinin çoğu standart hava yoğunluğu varsayımıyla çizilir; ölçülen statik basınç, gerçek hava yoğunluğu ile eğrinin çizildiği yoğunluk arasındaki farka göre düzeltilmelidir [1].

İlgili rehber: [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi).

## Sık sorulan sorular

### Radyal fan mı daha verimli, aksiyel fan mı?

Tipe bağlıdır. Kanat profilli geriye eğik radyal fanlarda verim %85'in üzerine çıkabilir [1]. Kanat profilli, küçük boşluklu kılavuz kanatlı aksiyel fanlar da %85'e kadar verime ulaşabilir [1]. Öne eğik radyal fanlarda verim %55–65 aralığındadır [1].

### Aksiyel fan kanala takılır mı?

Evet; tüp tipi aksiyel fanlar kanallı HVAC tesisatına uygundur [1]. Sanayi havalandırma kataloğunda uzun gövdeli kanallı aksiyel fanlar bulunur; kanatları fan durdurulmuşken ayarlanabilir [3].

### Fan eğrisindeki verim her devirde geçerli mi?

Kayışlı bir radyal fan kataloğunda diyagramdaki verim değeri yalnız en yüksek fan devrinde geçerlidir; devir düştükçe verim de düşer [2].

### Fazla büyük fan seçmenin zararı ne?

Büyük seçilen fan en yüksek verim noktasından uzakta çalışabilir; çalışma noktası bu noktadan uzaklaştıkça yatak yükleri ve gürültü artar [1].

### Fanlar için 327/2011 sayılı AB tüzüğü hâlâ geçerli mi?

Genel hükümleri yürürlükten kalktı; ekleri geçiş döneminde uygulanır.

- AB'de: (EU) 2024/1834 sayılı tüzük, 327/2011'in genel hükümlerini 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır [5]. Eski tüzüğün ekleri yalnız başka ürünlere entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanır [7].
- Türkiye'de: tebliğin diğer hükümleri 24 Temmuz 2027'de yürürlüğe girer; o tarihe kadar önceki tebliğ yürürlükte kalır [6]. Eski tebliğin ekleri ise entegre fanlar için 24 Temmuz 2028'e, yedek parça fanlar için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [6].

## VentHub'da hangi radyal ve aksiyel fan serileri var?

Nicotra Gebhardt'ın radyal fan serileri [AT](vh:aile/nicotra-gebhardt-at-cift-emisli-radyal-fanlar), [ADH](vh:aile/nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar), [RDH](vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar) ve [DD](vh:aile/nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar) sayfalarındadır. Aksiyel tarafta Vortice'nin [Vorticel E serisi](vh:aile/vortice-aksiyel-endustriyel-fanlar) düşük basınçlı plaka tipi aksiyel fan serisidir [3]. Diğer fanları [radyal fanlar](vh:kategori/centrifugal-fans), [aksiyel fanlar](vh:kategori/axial-industrial-fans) ve [duman egzoz fanları](vh:kategori/smoke-exhaust-fans) kategorilerinde bulabilirsiniz.

İlgili rehber: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri).

## Teklif için hangi bilgiler gerekir?

Güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklifin doğru fana dayanması için şunları bildirin:

- Gerekli debi ve toplam basınç [1].
- Havanın temiz ya da parçacıklı olduğu [1].
- Taşınan havanın sıcaklığı ve yoğunluğu [1][2].
- Montaj yerindeki bağlantı düzeni [1].
- Patlayıcı ortam ya da duman tahliyesi gibi özel bir kullanım olup olmadığı [4][5].

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 5, 6–9, 11, 16–25, 31, 32–34, 39–41, 75, 76, 80 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 11.10.2026)
2. Nicotra Gebhardt, Centrifugal Fans AT, belt driven, Issue 2.5 EN, 2013, s. 99, 104 (üretici belgesi).
3. Vortice, Industrial Ventilation kataloğu, s. 4, 58, 64 (üretici belgesi).
4. Vortice, VORT JET FAN SYSTEM broşürü, s. 10 (üretici belgesi).
5. Avrupa Komisyonu, Commission Regulation (EU) 2024/1834, md. 1(3), 9, 10, EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1834 (erişim 11.10.2026)
6. T.C. Resmî Gazete, 07.02.2026, Sayı 33161, Elektrik Giriş Gücü 125 W ile 500 kW Arasında Olan Motorlarla Tahrik Edilen Fanlarla İlgili Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM-2026/2), md. 1, 10–12, geçici md. 1. https://www.resmigazete.gov.tr/eskiler/2026/02/20260207-4.htm (erişim 11.10.2026)
7. Avrupa Komisyonu, (AB) 2025/2481 sayılı Komisyon Tüzüğü (2024/1834 sayılı tüzüğü değiştiren tüzük), madde 1(4), Resmî Gazete (OJ L, 8.12.2025). http://data.europa.eu/eli/reg/2025/2481/oj (erişim 17.11.2026)

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
    // Güncelleme tarihi 2026-11-09 (BLG-63): AB-327/2011 durumu kayıtta "geçiş döneminde" oldu; "bu Tüzük yürürlükten kalkmış" yerine "bu Tüzük'ün genel hükümleri yürürlükten kalkmış". Tek cümle; tarihler ve kaynaklar aynı. Önceki değer: 2026-11-08.
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: yazı R3.4 üslup kurallarıyla yeniden yazıldı (pilot); şerh, kendinden söz, tekrar ve ekotasarım takvimi çıktı, yeni iddia yok.
    // BLG-81: yazı okur sorusu sırasıyla yeniden kuruldu (kontrol listesi başa, tutanak gösterimi ve tek cümlelik bölüm çıktı); yeni iddia, sayı, kaynak yok.
    // BLG-81 tur 2: doğrulayıcı bulguları işlendi (Vortice/Lineo kaydı ve koşullar geri kondu; iki H2 eski adıyla korundu).
    guncellemeTarihi: '2026-11-17',
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

Sessiz kanal fanı seçerken fanın sürekli çalışacağı ayardaki ses değerine bakılır: Vortice Lineo Quiet kataloğunda aynı modelin sesi ayar noktasına ve yola (emiş, üfleme, gövde) göre değişir [2]. Bu katalogda ses basıncı 3 m mesafede, serbest alanda hesaplanır [2]; Binaların Gürültüye Karşı Korunması Hakkında Yönetmeliğin sınırı odada ölçülen düzey içindir [1].

Kısaca:

- Hedef: yeni binada en az C sınıfı aranır; bu sınıfta sürekli gürültü üreten servis ekipmanı için konutta gece yatak odası sınırı 30 dB'dir [1].
- Hız: Lineo 100 Quiet ES'te ayar 10 V'tan 4 V'a inerken 3 m'deki gövde yayını 30,9 dB(A)'dan 9,9 dB(A)'ya düşer [2].
- Boyut: fazla büyük seçilen fan yüksek hava akımı gürültüsü oluşturur [4].
- Montaj: fan ve kanal bağlantılarında titreşim yalıtımı kullanılır [1].

## Sessiz kanal fanı seçerken kontrol listesi

1. Hedefi odada ölçülecek düzey olarak koyun [1].
2. Fanın sürekli çalışacağı ayar noktasının satırını okuyun; düşük ve yüksek ayar arasındaki ses farkı modele göre değişir [2].
3. Ses değerinin koşulunu okuyun: yol (emiş, üfleme, gövde), ayar noktası ve mesafe [2].
4. Gereğinden büyük fan seçmeyin; fazla büyük fan yüksek hava akımı gürültüsü üretir [4].
5. Fanı ve kanal bağlantılarını titreşim yalıtımıyla kurun; fan kutusunun tavan panosuna ve taşıyıcıya doğrudan değmemesine dikkat edin [1][4].
6. Kanal tasarımında kanal içi gürültü düzeyini hesaplatın; binanın özelliğinden dolayı EK-5.1'de verilen gürültü düzeyleri aşılırsa kanal içi ses yalıtımı yapılır [1].
7. Hız kumandası seçeneklerine bakın: 0–10 V sinyali, hız seçici ya da hız ayarlayıcı [2].

## Sessiz fan nedir?

Vortice, Lineo Quiet'i yaydığı sesi azaltmak için tasarladığını belirttiği bir kanal fanı olarak tanıtır [2]. Lineo Quiet ürünlerinde ses emici kaplama dış gövdeye bütünleşiktir ve çevreye yayılan ses emisyonunu en aza indirmek için optimize edilmiştir [2].

Lineo Quiet modellerinde fan sesi dB(A) ile verilir [2]. dB(A), insan işitme sisteminin en çok hassas olduğu orta ve yüksek frekanslara daha fazla ağırlık veren, tek sayılı bir ses düzeyi birimidir [1].

## Ses gücü ile ses basıncı arasındaki fark nedir?

Ses gücü düzeyi (Lw) kaynağın yaydığı sesi, ses basıncı düzeyi (Lp) ortamda belli bir noktada ölçülen sesi gösterir [1]. Vortice kataloğunda iki büyüklük ayrı verilir: Lineo Quiet için ses gücü Lw dB(A) ile, ses basıncı Lp dB(A) ile gösterilir [2].

Bina içindeki değerlendirme başka bir göstergeyle yapılır: Yönetmelikte servis ekipmanından kaynaklanan iç gürültü sürekli ses için LAeq,nT, kesikli ses için LAF,max,nT göstergesiyle değerlendirilir [1]. Binalarda kullanılacak mekanik ve elektrik ekipmanın ses gücü düzeyinin, ölçüldüğü standartla birlikte beyan edilmesi gerekir [1].

## Vortice kataloğunda ses değeri hangi koşulda verilir?

Vortice kataloğunda ses basıncı 3 m mesafede, serbest alanda hesaplanmış olarak verilir [2]. Lineo Quiet modellerinde ses üç yol için ayrı verilir: emiş, üfleme ve gövde yayını [2]. ES modelleri 4, 6, 8 ve 10 V sütunlarıyla verilir [2]; bu sütunlar ayar noktası olarak okunur. Lineo Quiet teknik ve performans tablolarındaki veriler 50 Hz besleme içindir [2].

## Sessiz kanal fanında kaç dB(A) yeterli?

Katalog değeri 3 m mesafede, serbest alanda hesaplanan ses basıncıdır [2]; Yönetmeliğin sınırı odada ölçülen LAeq,nT değeri içindir [1]. Sınır mekâna göre değişir: Yönetmeliğin EK-5 Tablo 5.1'inde sürekli gürültü üreten servis ekipmanı için iç gürültü sınırları mekâna, zaman dilimine ve akustik performans sınıfına göre verilir [1]. Servis ekipmanı, ısıtma ve iklimlendirme sistemlerini de kapsayan teknik donatılardır [1].

C sınıfında sınır konutta gece yatak odası için 30 dB, yaşam alanı için 35 dB, büro özel odası için 40 dB'dir; D sınıfında bu değerler 34 dB, 39 dB ve 44 dB'dir [1].

| Mekân | Zaman dilimi [1] | C sınıfı (dB) [1] | D sınıfı (dB) [1] |
|---|---|---|---|
| Konut, yatak odası | Gece (23.00–07.00) [1] | 30 | 34 |
| Konut, yaşam alanı | 24 saat [1] | 35 | 39 |
| Konut, mutfak | 24 saat [1] | 35 | 39 |
| Konaklama, yatak odası | Gece (23.00–07.00) [1] | 30 | 34 |
| Büro, özel oda | Gündüz–Akşam (07.00–23.00) [1] | 40 | 44 |
| Büro, toplantı odası | Gündüz–Akşam (07.00–23.00) [1] | 35 | 39 |

A sınıfı en yüksek, F sınıfı en düşük performansı gösterir [1]. Yeni yapılacak binalarda en az C, mevcut binalarda kullanım amacı değişirse ya da esaslı tadilat yapılırsa tadilatın etkilediği bağımsız birimlerde en az D sınıfı sağlanır [1].

Yönetmelik uyarınca ölçümler, işletmeye alma aşamasında idarenin istemesi hâlinde TS EN ISO 10052 ve TS EN ISO 16032'ye göre yapılır; sonuçlar sınır değerlerden yüksek çıkarsa EK-8'deki önlemler uygulanır [1].

Dünya Sağlık Örgütü'nün (WHO) 1999 tarihli topluluk gürültüsü rehberinde yatak odası iç mekân değeri, uyku bölünmesini önlemek için sürekli gürültüde 30 dB LAeq, tek tek ses olaylarında 45 dB LAmax'tır [3]. Gürültüde düşük frekanslı bileşenler çoksa değerlerin kılavuz değerlerden de düşük olması gerekir [3].

## Fanın sesini neler belirler?

Endüstriyel havalandırma uygulamalarında bir fanın ürettiği gürültü fan tipine, debiye ve basınca bağlıdır [4]. Fazla büyük seçilen fanlar yüksek hava akımı gürültüsü oluşturur [4]. Yüksek kapasitede çalıştırılıp debisi kısılan fanın da yüksek gürültü üretme eğilimi vardır [4].

Hızın etkisi Lineo 100 Quiet ES (17170) değerlerinde görülür (ses basıncı 3 m, serbest alan) [2]:

| Ayar noktası (V) [2] | Azami debi (m³/h) | Üfleme (dB(A)) | Gövde (dB(A)) |
|---|---|---|---|
| 4 | 135 | 20,6 | 9,9 |
| 6 | 175 | 26,1 | 15,9 |
| 8 | 250 | 36,7 | 24,8 |
| 10 | 300 | 40,7 | 30,9 |

Bu modelde ayar 4 V'tan 10 V'a çıkarken azami debi 135 m³/h'ten 300 m³/h'e yükselir; üfleme sesi 20,6 dB(A)'dan 40,7 dB(A)'ya, gövde yayını 9,9 dB(A)'dan 30,9 dB(A)'ya çıkar [2].

Fan tipi de sesi etkiler: aksiyel fanlar, aynı kapasitedeki hat içi santrifüj fanlardan genellikle biraz daha gürültülüdür; bu gürültüde çoğunlukla yüksek frekanslar baskındır ve bunları azaltmak çoğu zaman daha kolaydır [4].

İlgili rehber: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

## Kanal fanında sessizlik nasıl sağlanır?

Yönetmelikte tesisat ve servis ekipmanlarından kaynaklanan gürültünün kontrolü için mekanik sistemlerde gürültü kontrolü kurallarının (EK-8) uygulanması öngörülür [1]. Bu kurallar fan seçimini, titreşim yalıtımını, kanal içi ses yalıtımını ve hız ayarını birlikte kapsar [1].

### Fan seçimi ve yerleşimi

EK-8'e göre gürültü emisyonu azaltılmış sessiz fan tipinin seçilmesine, gürültünün hava akımı, fan hızı ve statik basınç ayarlarıyla azaltılmasına ve fanın hava türbülansını azaltacak biçimde yönlendirilmesine dikkat edilir [1]. Gürültüye çok hassas mekânların tavanında önlem alınmadan fan yerleştirilemez [1].

### Titreşim yalıtımı

EK-8'e göre servis ekipmanlarının zemine bağlantılarında ve boru ile kanal bağlantılarında titreşim yalıtımı kullanılması gerekir [1]. Fan ve fancoil kutularının tavan panolarına ve ses köprüsü yapacak taşıyıcılara doğrudan temas etmemesi için arada esnek yastık kullanılır [1]. Fanın kauçuk gibi yumuşak bir malzemeye ya da uygun bir yay izolatörüne oturtulması aktarılan titreşim enerjisini sınırlar [4].

### Susturucu ve kanal içi ses yalıtımı

Yönetmeliğe göre kanal tasarımı sırasında kanal içi gürültü düzeyinin de hesaplanması gerekir; binanın özelliğinden dolayı EK-5.1'de verilen gürültü düzeyleri aşılırsa kanal içi ses yalıtımı yapılır [1]. Tablo 5.1, izin verilen en yüksek iç gürültü düzeylerini içerir [1]. Kanalı yalıtmak ve ses sönümleyici malzeme ya da bölme (baffle) kullanmak gürültü azaltma yöntemleri arasındadır [4]. Havalandırma kanalına monte edilen susturucuların eklenti kaybı, akış gürültüsü ve toplam basınç kaybı ölçümleri TS EN ISO 7235'te tanımlıdır [1].

### Hız kumandası

Lineo Quiet ES sürümü iki hızlı, elektronik kontrollü EC fırçasız motorludur; her hız kurulumda ayarlanır, cihaz alternatif olarak tek hızda çalışabilir ve bu hız kullanıcı tarafından 0–10 V sinyaliyle ayarlanır [2]. AC sürümlü Lineo Quiet'te motor modele göre 2 ya da 3 hızlıdır [2]. Değişken hız sürücüleri (VFD) düşük sistem talebinde hava akımı gürültüsünü azaltır [4].

İlgili rehber: [Frekans konvertörü nedir, fan ve pompada nasıl seçilir?](vh:yazi/frekans-konvertoru)

## Örnek: Vortice Lineo Quiet'in ses değerleri

Vortice'ye göre Lineo ürün ailesi, konut, ticari ya da endüstriyel mekânların kanallı havalandırması için tasarlanmış karma akışlı kanal fanlarıdır; karma akışlı çark, helisel fanların yüksek debisi ile santrifüj fanların yüksek basıncının birleşimidir [2]. Lineo Quiet iki motor sürümüyle gelir: 2 ya da 3 hızlı AC motorlu Lineo Quiet ve EC fırçasız motorlu Lineo Quiet ES [2]. Aşağıdaki tablolar Ø100, 125, 150, 200, 250 ve 315 mm modellerini içerir; katalogda ayrıca Ø160 modeller de bulunur [2].

EC motorlu Lineo Quiet ES, kataloğun verdiği en düşük ve en yüksek ayar noktası (ses basıncı 3 m, serbest alan) [2]:

| Model (kod) | Azami debi, 4 V (m³/h) [2] | Üfleme, 4 V (dB(A)) [2] | Gövde, 4 V (dB(A)) [2] | Azami debi, 10 V (m³/h) [2] | Üfleme, 10 V (dB(A)) [2] | Gövde, 10 V (dB(A)) [2] |
|---|---|---|---|---|---|---|
| Lineo 100 Quiet ES (17170) | 135 | 20,6 | 9,9 | 300 | 40,7 | 30,9 |
| Lineo 125 Quiet ES (17171) | 180 | 21 | 11,3 | 380 | 40 | 28,7 |
| Lineo 150 Quiet ES (17172) | 250 | 23,4 | 13,7 | 515 | 40,7 | 31 |
| Lineo 200 Quiet ES (17174) | 570 | 30,6 | 19,7 | 1145 | 47,7 | 35,8 |
| Lineo 250 Quiet ES (17175) | 750 | 37,3 | 24,7 | 1485 | 53,2 | 41 |
| Lineo 315 Quiet ES (17176) | 1400 | 41,2 | 33,5 | 2630 | 54,5 | 48,3 |

AC motorlu Lineo Quiet, en düşük ve en yüksek hız (ses basıncı 3 m, serbest alan) [2]:

| Model (kod) | Azami debi, en düşük hız (m³/h) | Üfleme, en düşük hız (dB(A)) | Gövde, en düşük hız (dB(A)) | Azami debi, en yüksek hız (m³/h) | Üfleme, en yüksek hız (dB(A)) | Gövde, en yüksek hız (dB(A)) |
|---|---|---|---|---|---|---|
| Lineo 100 Quiet (17160) | 150 | 22,5 | 16 | 260 | 35,1 | 28,4 |
| Lineo 125 Quiet (17161) | 190 | 21,1 | 12,3 | 320 | 35 | 26,9 |
| Lineo 150 Quiet (17162) | 255 | 23 | 14,4 | 510 | 40,5 | 31,6 |
| Lineo 200 Quiet (17164) | 805 | 38,7 | 27,5 | 1160 | 47,3 | 35,5 |
| Lineo 250 Quiet (17165) | 960 | 43,7 | 32,2 | 1550 | 53,7 | 41,9 |
| Lineo 315 Quiet (17166) | 2070 | 50,5 | 39,5 | 2890 | 57,4 | 47 |

Quiet olmayan Lineo ile fark aynı çapta görülür (ses basıncı 3 m, serbest alan): Ø200 AC modellerinde en yüksek hızda Lineo 200 Quiet (17164) gövdeden 35,5 dB(A), emişten 48 dB(A) ses verir ve azami debisi 1160 m³/h'tir; Lineo 200 (17180) gövdeden 46,9 dB(A), emişten 55,4 dB(A) ses verir ve azami debisi 1135 m³/h'tir [2].

Modellerin teknik özellikleri ve model listesi ürün sayfasındadır: [Vortice Lineo Quiet kanal fanları](vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari). Kanal içi kurulum için diğer modeller [kanal tipi fanlar](vh:kategori/duct-fans) kategorisindedir.

İlgili rehber: [Kanal tipi fan nedir, nerede kullanılır? Fan türleri ve seçimde bakılacaklar](vh:yazi/kanal-tipi-fan-nedir)

## Teklif için hangi bilgiler gerekir?

Güncel fiyat bilgisi için ürün sayfasından teklif isteyin.

- **Kanal çapı ve debi.** Teklif için kanal çapı ve istenen debi bilinmelidir; Lineo Quiet modellerinin nominal çapı 100 ile 315 mm arasındadır ve azami debi çapla değişir [2].
- **Motor sürümü.** AC ya da ES sürümünden hangisinin istendiği belirtilmelidir; AC sürümünde motor 2 ya da 3 hızlıdır, ES sürümünde motor elektronik kontrollü EC fırçasızdır [2].
- **Hız kumandası.** Hangi hız kumandasının kullanılacağı belirtilmelidir; AC modeller için hız seçici ve hız ayarlayıcılar, ES modeller için potansiyometreler ayrı kodlu kumandalardır [2].

## Sık sorulan sorular

### En sessiz kanal fanı hangisidir?

Lineo Quiet ailesinde en düşük ses basıncı Lineo 100 Quiet ES'in 4 V ayarındadır: gövdeden 9,9 dB(A), üflemeden 20,6 dB(A); bu ayarda azami debi 135 m³/h'tir [2]. Aynı model 10 V'ta 300 m³/h verir ve gövdeden 30,9 dB(A) ses yayar [2].

### Yatak odasında ve ofiste fan gürültüsü en çok kaç dB olabilir?

Yönetmelikte sürekli gürültü için konutta gece yatak odasında C sınıfında 30 dB, D sınıfında 34 dB; büro özel odasında 40 ve 44 dB değerleri verilir [1]. Yeni yapılacak binalarda en az C sınıfı sağlanır [1]. Bu sınırlar odada ölçülen servis ekipmanı gürültüsüne uygulanır [1]. WHO'nun 1999 değeri yatak odası için 30 dB LAeq ve 45 dB LAmax'tır [3].

### Devri düşürünce fan sessizleşir mi?

Lineo Quiet'te katalog verilerine göre ayar düştükçe ses düşer: Lineo 100 Quiet ES'te ayar 10 V'tan 4 V'a inerken gövde yayını 30,9 dB(A)'dan 9,9 dB(A)'ya düşer, azami debi 300 m³/h'ten 135 m³/h'e iner [2].

### Kanal fanında susturucu gerekir mi?

Yönetmeliğe göre kanal tasarımında kanal içi gürültü hesaplanır; binanın özelliğinden dolayı EK-5.1'de verilen gürültü düzeyleri aşılırsa kanal içi ses yalıtımı yapılır [1]. Havalandırma kanalına monte edilen susturucular ve hava sonlandırma birimleri için eklenti kaybı, akış gürültüsü ve toplam basınç kaybı ölçümleri TS EN ISO 7235'te tanımlıdır [1].

### Aksiyel fan mı santrifüj (radyal) fan mı daha sessizdir?

Aynı kapasitede aksiyel fanlar, hat içi santrifüj fanlardan genellikle biraz daha gürültülüdür; bu gürültüde çoğunlukla yüksek frekanslar baskındır ve bunları azaltmak çoğu zaman daha kolaydır [4]. Seçim debi ve basınç gibi sistem ihtiyacına göre yapılır [4].

### Vortice Lineo Quiet kaç dB(A) ses çıkarır?

Lineo Quiet modellerinde katalogdaki en düşük gövde değeri Lineo 100 Quiet ES'in 4 V ayarındaki 9,9 dB(A), en yüksek gövde değeri Lineo 315 Quiet ES'in 10 V ayarındaki 48,3 dB(A)'dır [2]. Lineo 315 Quiet ES 10 V'ta emişten 56,5 dB(A), üflemeden 54,5 dB(A) ses verir [2]. Ailenin en yüksek emiş değeri AC motorlu Lineo 315 Quiet'in en yüksek hızındaki 58,4 dB(A)'dır [2]. Bütün değerler 3 m mesafede, serbest alanda hesaplanmış ses basıncıdır [2].

## Kaynaklar

Üretici belgelerinde verilen sayfa numaraları PDF dosyasındaki sayfa sırasıdır; basılı sayfa numarasından farklı olabilir.

1. T.C. Resmî Gazete, 31.05.2017, Sayı 30082, Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik (Çevre ve Şehircilik Bakanlığı), md. 4, 6, 9, 13, 17, 18, EK-5 Tablo 5.1, EK-8, EK-9. https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-7.htm ve ekleri https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-7-1.pdf (erişim 16.10.2026)
2. Vortice, LINEO Range kataloğu (dosya adı Doc_Pubblicita_Lineo_Range_193047.pdf), basılı künye Cod. 5.170.084.547 – Mayıs 2026 (son sayfada ayrıca 5.170.084.504, Şubat 2026 kodu da yazılıdır), s. 4–6, 10, 12, 15, 18, 21, 24, 28 (üretici belgesi).
3. Dünya Sağlık Örgütü (WHO), Guidelines for Community Noise, Berglund, Lindvall, Schwela (ed.), 1999, bölüm 4.3 ve 4.3.1 (basılı s. 43). https://iris.who.int/handle/10665/66217 (erişim 16.10.2026)
4. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 22, 45 (basılı sayfa numaraları). https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 16.10.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. WHO değerleri 1999 tarihli kılavuza dayanır [3]. Kurulum yetkili personelle yapılmalıdır.
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
    // 11 Kasım (BLG-70): yalnız yazıdan yazıya iç bağlantı cümlesi eklendi; iddia yok
    // 12 Kasım (BLG-75): "Hava perdesi de bu yazıda ele alınmaz" kapsam cümlesi ve hava perdesi rehberine bağlantı eklendi; yalnız ekleme, iddia yok
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-82: okur gözüyle yeniden düzenleme (R3.5); yeni iddia yok; [3] için baskı yılı kaydı (BLG-84)
    guncellemeTarihi: '2026-11-17',
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

Kanal fanları (kanal tipi fanlar), havalandırma sistemlerinde kullanılan ve kanala entegre edilen fanlardır; bağlandıkları kanalın kesiti yuvarlak ya da dikdörtgen olabilir [2]. ABD Enerji Bakanlığı (DOE) ile AMCA International'ın rehberi fanları santrifüj ve aksiyel diye ikiye ayırır, kanallı iklimlendirme tesisatı için tüp tipi aksiyel fanı uygun tür olarak anlatır [1].

Kısaca:

- Kullanım: tüp tipi aksiyel fan egzoz uygulamalarında sık kullanılır [1]; kataloga göre plastik reçine gövdeli bir seri asma tavana ya da çatı arasına monte edilir [4].
- Kesit: bir firmanın bilgi sayfasına göre dikdörtgen kanal tipi fan sıkışık alanlarda daha iyi yer kullanımı sağlar [2].
- Seçim: hava debisi, sıcaklık, basınç, hava akımının özellikleri ve sistem yerleşimi gibi çalışma koşullarının bilinmesiyle başlar [1].
- Fan boyutu: gereğinden büyük seçilen fan, verimin en yüksek olduğu noktada çalışmaz [1].

## Kanal tipi fan seçerken hangi bilgilere bakılır?

Fan seçimi, hava debisi, sıcaklık, basınç, hava akımının özellikleri ve sistem yerleşimi gibi çalışma koşullarının bilinmesiyle başlar [1].

- **Debi ve basınç.** Fan, sistemin debi ve basınç gereksinimleri hesaplanarak seçilir [1].
- **Sistem kayıpları.** Sistem eğrisi, damper, kanal, filtre ve dirsek gibi her bileşenin kaybı toplanarak hesaplanır; bileşenlerin etkileşiminden doğan performans değişimine sistem etkisi denir [1].
- **Fan boyutu.** Gereğinden büyük seçilen fan, verimin en yüksek olduğu noktada çalışmaz, ağır durumlarda kararsız çalışabilir, fazla akış enerjisi üretir ve gürültüyü artırır [1].
- **Kesit ve montaj alanı.** 2016 baskılı üretici kataloğunda anlatılan karma akışlı kanal fanı serisi standart yuvarlak kesitli borulara, özel montaj aksesuarlarıyla dikdörtgen hava kanallarına da takılabilir [3]; bir firmanın bilgi sayfasına göre dikdörtgen kanal tipi fan sıkışık alanlarda daha iyi yer kullanımı sağlar [2].

İlgili rehberler: [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi), [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri).

## Kanal tipi fan nasıl çalışır?

DOE rehberi fanları iki ana türe ayırır: santrifüj ve aksiyel [1].

- **Santrifüj fan** dönen bir çarkla havanın hızını artırır; hava çarkın göbeğinden kanat uçlarına doğru ilerlerken kinetik enerji kazanır ve bu enerji, hava çıkışa girmeden önce yavaşlarken statik basınç artışına dönüşür [1].
- **Aksiyel fan** havayı fanın ekseni boyunca hareket ettirir; hava, pervane ile uçak kanadındaki gibi kanat yüzeyinde oluşan aerodinamik kaldırma kuvvetiyle basınçlandırılır [1].

Aksiyel fanın silindirli türü tüp tipi aksiyel fandır: DOE rehberi bunu bir silindirin içine yerleştirilmiş pervane tipi fan olarak tanımlar ve hava akışı özelliklerini iyileştirdiği için pervane tipi fandan daha yüksek basınç ve daha iyi verim sağladığını yazar [1]. Tüp tipi aksiyel fanlar orta basınçlı, yüksek debili uygulamalarda kullanılır [1]. Egzoz uygulamalarında sık kullanılır, çünkü kanal kayıplarını yenmeye yetecek basıncı oluşturur [1].

Çıkışına kılavuz kanatlar eklenmiş tüp tipi aksiyel fana kılavuz kanatlı (vaneaxial) aksiyel fan denir [1]. Katalogda karma akışlı çark, helisel fanların yüksek debisini santrifüj fanların yüksek basıncıyla birleştiren çark olarak anlatılır [4].

## Kanal fanı çeşitleri nelerdir?

Kanal fanları iki ölçüte göre ayrılır: kesite göre yuvarlak ve dikdörtgen [2]; fan türü olarak santrifüj ve aksiyel (tüp tipi, kılavuz kanatlı) [1] ve üretici anlatımıyla karma akışlı [4].

| Tür | Çalışma ilkesi |
|---|---|
| Santrifüj | Havayı radyal yönde hızlandırır, kinetik enerjiyi basınca çevirir [1] |
| Aksiyel | Havayı fanın ekseni boyunca hareket ettirir [1] |
| Tüp tipi aksiyel | Silindir içindeki pervane tipi fandır; orta basınç ve yüksek debili uygulamalara uygundur [1] |
| Kılavuz kanatlı aksiyel | Tüp tipi aksiyel fana çıkış kanatları eklenmiş türdür [1] |
| Karma akışlı (üretici anlatımı) | Yüksek debiyi santrifüj fanın yüksek basıncıyla birleştirir [4] |

## Yuvarlak ve dikdörtgen kesit farkı nedir?

Fark, fanın bağlandığı kanalın kesitindedir. Bir firmanın bilgi sayfası yuvarlak kanal tipi fanı yuvarlak bir kanala entegre fan, dikdörtgen kanal tipi fanı ise dikdörtgen kesitli kanallara entegre fan olarak tanımlar [2]. Aynı sayfa dikdörtgen kesitli olanı büyük hava hacimlerini taşımak için tasarlanmış ve sıkışık alanlarda daha iyi yer kullanımı sağlayan fan olarak anlatır [2].

Aynı serinin 2016 baskılı üretici kataloğunda anlatılan karma akışlı kanal fanı serisi, standart yuvarlak kesitli borulara takılabildiği gibi özel montaj aksesuarlarıyla dikdörtgen hava kanallarına da takılabilir [3].

## Kanal tipi fan nerede kullanılır? Kullanım alanları

Kanal fanlarının kullanım alanları kaynaklarda yerleşime göre anlatılır: kanal hattının içinde ve kanal sisteminin ucunda [4]; uygulama olarak egzoz da anılır [1].

Kanal içi için katalogda plastik reçine gövdeli bir seri asma tavana ya da çatı arasına monte edilen kanal fanı olarak sunulur ve konut, ticari ve endüstriyel mekânlar için uygun görülür; boyalı sac çelik gövdeli bir seri de asma tavan ve çatı arası kurulumu için tanımlanır [4]. Dış mekâna kurulmak üzere tasarlanmış boyalı sac çelik gövdeli kanal fanları da aynı katalogda yer alır [4]. Aynı katalog kanal sisteminin ucuna takılan türleri de listeler: çelik sac duvar tipi fanlar ve çatı tipi fanlar [4].

| Yerleşim | Anlatılan kullanım |
|---|---|
| Egzoz uygulamaları | Tüp tipi aksiyel fan: kanal kayıplarını yenecek basınç, yer açısından verimli [1] |
| Asma tavan ya da çatı arası, kanal içi | Plastik reçine gövdeli seri: mutfak, tuvalet, laboratuvar, bar, restoran, çamaşırhane ve dükkân gibi mekânlar [4] |
| Kısa asma tavan | Yüksekliği çok düşük bir seri, kısa asma tavanlara monte edilmeye elverişlidir [4] |
| Kanal ucunda, duvarda | Çelik sac duvar tipi fanlar: laboratuvar, bar, restoran, çamaşırhane ve spor salonu gibi mekânlar [4] |
| Kanal ucunda, çatıda | Çatı tipi fanlar: çatıdan atış yapan ticari ve endüstriyel mekânlar [4] |

İlgili rehberler: [Isı geri kazanım cihazı nedir, nasıl seçilir?](vh:yazi/isi-geri-kazanim-cihazi-nedir), [Hava perdesi nedir, nasıl seçilir?](vh:yazi/hava-perdesi), [Çatı tipi fan nedir, nasıl seçilir?](vh:yazi/cati-tipi-fan-nedir)

## Sık sorulan sorular

### Kanal tipi fan asma tavanda kullanılabilir mi?

Üretici kataloğuna göre evet: plastik reçine gövdeli ve boyalı sac çelik gövdeli kanal fanı serileri asma tavana ya da çatı arasına monte edilen fanlar olarak tanımlanır [4].

### Kanal tipi fan dikdörtgen kanala takılabilir mi?

2016 baskılı üretici kataloğuna göre evet: karma akışlı kanal fanı serisi özel montaj aksesuarlarıyla dikdörtgen hava kanallarına takılabilir [3].

### Kanal tipi fan dışarıya ya da çatıya monte edilebilir mi?

Üretici kataloğuna göre dış mekâna kurulmak üzere tasarlanmış boyalı sac çelik gövdeli kanal fanları vardır; çatı tipi fanlar ise kanal sisteminin ucuna takılan ayrı bir türdür [4].

### Kanal tipi fan yatay mı dikey mi monte edilir?

Katalogda karma akışlı kanal fanı serisi yatay ya da dikey kanallı montaj için tasarlanmıştır; başka bir seri yatay, dikey ya da eğimli monte edilebilir [4].

### Birden fazla kanal tipi fan seri ya da paralel bağlanabilir mi?

2016 baskılı katalogda karma akışlı kanal fanı serisi için paralel ve seri bağlantı düzenleri gösterilir; paralel bağlantıda debinin, seri bağlantıda basıncın iki katına çıktığı belirtilir [3].

### Tüp tipi aksiyel fan ile kılavuz kanatlı aksiyel fan arasındaki fark nedir?

Fark çıkış kanatlarıdır: kılavuz kanatlı fanda bu kanatlar hava akış düzenini iyileştirir ve havanın kinetik enerjisini basınca çevirir [1].

### VentHub'da kanal tipi fan için teklif nasıl alınır?

İlgili aile ya da ürün sayfasındaki "Teknik Teklif İste" düğmesi teklif başlatır.

## VentHub'da hangi kanal tipi fan serileri var?

VentHub'un [kanal tipi fanlar kategorisinde](vh:kategori/duct-fans) şu aileler listelenir:

- [AVenS dikdörtgen kanal tipi radyal fanlar](vh:aile/avens-dikdortgen-kanal-tipi-radyal-fanlar)
- [LINEO kanal fanları](vh:aile/vortice-lineo-kanal-fanlari)
- [LINEO Quiet sessiz kanal fanları](vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari)
- [Radon serisi kanal fanları](vh:aile/vortice-radon-serisi-kanal-fanlari)
- [VORT Commercial In-Line dikdörtgen kanal fanları](vh:aile/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari)

## Teklif için hangi bilgiler gerekir?

Güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklif için şu bilgileri hazırlayın:

- Hava debisi, sıcaklık ve basınç
- Hava akımının özellikleri
- Sistem yerleşimi
- Kanalın kesiti ve montaj alanı

## Kaynaklar

Üretici belgelerinde ve DOE rehberinde verilen sayfa numaraları basılı sayfa numarasıdır.

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 3, 4, 8, 17, 19, 22, 23. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 25.10.2026)
2. Avens Havalandırma, "LINEO Kanal Tipi Fanlar" bilgi yazısı (firma sitesi blog bölümü), https://www.avensair.com/lineo-kanal-tipi-fanlar (erişim 04.11.2026).
3. Vortice, Commercial Ventilation in Line kataloğu, Şubat 2016 baskısı, s. 5, 7 (üretici belgesi).
4. Vortice, In-Line Fans Range kataloğu, Ocak 2026 baskısı, s. 4, 5, 36, 42, 74, 78, 84, 90 (üretici belgesi).

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
    // 9 Kasım 2026 (BLG-62): Resmî Gazete'deki ekotasarım ve enerji etiketi tebliğleri (SGM-2021/18, 2021/19) yeni bölüm, SSS ve Kaynaklar 12-13 olarak eklendi (R5.5 yalnız ekleme).
    // 12 Kasım 2026 (BLG-62): yayın tarihi; bölüm 9 Kasım'da hazırlandı, canlıya 12 Kasım'da çıktı, lastmod yayın gününü izler.
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-82 okur gozu yeniden yazim
    guncellemeTarihi: '2026-11-17',
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

- Seçim: debi ve basınç, ses seviyesi, filtre ve bakım, by-pass ve buzlanma ile kurulum yeri değerlendirilir.
- Eşanjör: plakalı ve döner çarklı gibi türler vardır; nem geri kazanımı entalpi plakalı ve döner çarklı türlerde mümkündür [3].
- Verim: bir sertifika ölçütü (Passive House Institute, 2009) etkin kuru ısı geri kazanımını belirli koşullarda yüzde 75'ten yüksek ister [6].
- Kurulum türü: kanal tipi merkezi ünite kanalla bağlanır; oda tipi ünite ayrı mahallere yerleştirilir [8][9].

## Isı geri kazanım cihazı nedir?

İngilizce kaynaklarda bu cihaza heat-recovery ventilator denir, kısaltması HRV'dir; Türkçe karşılığı ısı geri kazanımlı havalandırıcıdır. Kanada Doğal Kaynaklar Bakanlığı HRV'yi iç ortamdaki bayat hava ile dış ortamdaki taze hava arasında ısı aktaran mekanik bir cihaz olarak tanımlar [2]. Nemi de aktaran türüne enerji geri kazanımlı havalandırıcı (ERV) denir [4][1]. Isı geri kazanım cihazı terimi HRV ve ERV'nin ikisini de kapsar.

## Isı geri kazanım cihazı seçerken hangi değerlere bakılır?

### Debi ve basınç

Eurovent kılavuzuna göre boyutlandırmanın temelini, kişi başı havalandırma debileri ile konutun tamamı için saatte ortalama 0,5 hava değişimi hedefi oluşturur [3]. Kanalların, yüksek hava hızının yol açacağı gürültü ve basınç kaybını önleyecek büyüklükte olması gerekir [3]. Altıgen karşı akışlı çekirdekler daha yüksek geri kazanım sağlar ama basınç düşümünü artırır [5].

Vortice kataloğu her modelin en yüksek debisini ve basıncını teknik tabloda verir [8][9].

### Ses seviyesi

Eurovent kılavuzuna göre ses basıncı insan kulağını doğrudan etkileyen ölçüdür; ses gücü ise havalandırma ekipmanının akustik performansını sınamak için kullanılır ve genellikle ürünün teknik belgesinde beyan edilir [3]. Tedarikçiler çoğu zaman ses basıncını oda emilimini 10 m² Sabin varsayarak verir; bu, ses basıncının ses gücünden 4 dB düşük çıkması demektir [3]. Vortice kataloğu teknik tabloda ses basıncını 3 m uzaklıkta, ses gücünü ise ayrı bir alanda verir [8].

ABD Enerji Bakanlığı rehberi birçok ERV ve HRV cihazının hatırı sayılır ses ürettiğini, yatak odası gibi hassas alanların yakınına kurulacaksa bunun dikkate alınmasını söyler [4].

İlgili rehber: [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi).

### Filtre ve bakım

Eurovent kılavuzuna göre filtreler zamanında değiştirilmezse hijyen sorunları, aşırı enerji tüketimi ve debide düşüş yaşanabilir; konut havalandırma cihazları görsel filtre değişim uyarısıyla donatılır [3]. Kılavuzun genel önerisi filtrenin en az yılda bir değiştirilmesi, eşanjörün iki yılda bir temizlenmesidir [3]. ABD Enerji Bakanlığı rehberi ise bakımın sistemden sisteme değiştiğini, bazı sistemlerin filtre ve ısı değişim ortamının üç ayda bir değiştirilmesini ya da temizlenmesini gerektirdiğini söyler [4]. Kaynaklar farklı aralıklar verdiği için geçerli aralık cihazın üretici kılavuzundan okunur.

### By-pass ve buzlanma

Termal by-pass, ısı geri kazanımına gerek olmadığında geri kazanımı devre dışı bırakır ve yazın dış hava iç havadan soğukken serbest soğutma sağlar [3].

Dış hava sıcaklığı 0 °C'nin altına inince eşanjörde yoğuşan suyun donma riski vardır; donma sınırı iç bağıl neme ve eşanjör verimine bağlıdır [3]. Eurovent kılavuzuna göre plakalı eşanjörlerde donma yaklaşık −5 °C'de, döner çarklarda yaklaşık −15 °C'de başlar; entalpi plakalı eşanjör kullanımı donma sınırını belirgin biçimde düşürebilir [3]. ABD Enerji Bakanlığı rehberi çoğu ERV ve HRV cihazında yoğuşma suyu tahliyesi ve buzlanma koruması bulunduğunu, bazı çözme aygıtlarının ek özellik olarak sipariş edildiğini yazar [4].

Vortice kataloğu VORT HR 350 AVEL ailesini otomatik mekanik by-pass ve otomatik buzlanma koruması ile, VORT HR 450 AVEL D modelini mekanik by-pass ve otomatik devreye giren buzlanma koruması ile tanımlar [8].

### Kurulum yeri ve erişim

ABD Enerji Bakanlığı rehberi bodrum ve çatı arasını ERV ve HRV cihazları için yaygın yerleşim yerleri olarak sayar [4]. Eurovent kılavuzu filtrelere ve eşanjöre kolay erişimin bakım için önemli olduğunu, tipik bir cihazda eşanjörü çıkarmanın 10-20 dakika sürdüğünü yazar [3].

## Kanal tipi mi, oda tipi mi: iki kurulum türü nasıl ayrılır?

Vortice kataloğunda kanal tipi merkezi ünite, kanal bağlantılı tek bir cihazla 80, 180, 240 ve 260 m²'ye kadar mahalleri havalandırmak için tarif edilir [8]. Oda tipi ünite ise Vortice'ye göre merkezsizdir (decentralized) ve yatak odası, banyo, oturma odası ile mutfak, çalışma odası gibi ayrı mahallere yerleştirilir [9]. Eurovent kılavuzu dengeli ısı geri kazanımlı sistemlerde besleme ve egzoz debilerinin terminal cihazlı tüm odalara göre boyutlandırıldığını yazar [3].

| Ölçüt | Kanal tipi merkezi ünite | Oda tipi ünite |
|---|---|---|
| Kapsadığı alan | Vortice kataloğu modellere göre 80, 180, 240 ve 260 m²'ye kadar olan mahaller için tarif eder [8] | Vortice kataloğunda m² değeri verilmez; katalog bu seriyi merkezsiz (decentralized) ısı geri kazanım ünitesi olarak adlandırır ve ayrı mahallere yerleştirir; Wi-Fi'li modeller yerel ağ üzerinden birbirleriyle haberleşebilir [9] |
| Isı geri kazanım yöntemi | Vortice kataloğunda ve AVenS teknik belgelerinde plastik, entalpi ve alüminyum plakalı eşanjörler geçer [8][11] | Seramik depolamalı eşanjör: fanın dönüş yönü periyodik değişir, eşanjör önce egzoz havasıyla ısınır, sonra bu ısıyı gelen soğuk havaya verir [9] |

VentHub'daki [ısı geri kazanım kategorisi](vh:kategori/heat-recovery-vmc) iki alt kategoriye ayrılır: [kanal tipi ısı geri kazanım cihazları](vh:kategori/ducted-central-hrv) ve [oda tipi ısı geri kazanım cihazları](vh:kategori/single-room-hrv).

## Nasıl çalışır: egzoz ısısı taze havaya nasıl geçer?

Cihaz fanlar ya da üfleyiciler ve bir hava-hava ısı eşanjörü içerir; HRV'de eşanjör iki yalıtılmış hava akımı arasında ısı aktarır [2]. Eşanjör egzoz havasındaki enerjiyi dış hava akımına aktarır; bu enerji aksi hâlde atmosfere atılacaktır [3]. Enerji, havalandırma havasını kışın ya da ara mevsimde ısıtmak, yazın soğutmak için geri kazanılır [3].

- Binadan alınan egzoz havası ile dışarıdan alınan taze hava cihazdan geçer; HRV'de bu iki akım birbirinden yalıtılmış kalır [2], depolamalı oda tipi ünitelerde ise aynı eşanjör paketi iki yönde sırayla kullanılır [9].
- Kışın sıcak egzoz havasının ısısı daha soğuk taze havaya geçer; yazın iç hava, daha sıcak taze havayı soğutur [1].
- Dengeli sistemlerde taze hava normalde oturma ve yatak odalarına verilir, egzoz havası mutfak ve banyo gibi ıslak hacimlerden alınır [3].

## Isı geri kazanım ne işe yarar, nerelerde kullanılır?

Cihaz, havalandırmayla dışarı atılacak ısıyı taze havaya aktarır; ERV türleri nemi, yani gizli ısıyı da aktarır [3][4]. ABD Enerji Bakanlığı'na göre enerji geri kazanımlı havalandırma sistemleri evin kontrollü havalandırılmasını sağlarken enerji kaybını en aza indirir [1]. Eurovent kılavuzu geri kazanımın havayı koşullandırmak için dış kaynaklardan çekilen enerji tüketimini önemli ölçüde azalttığını, bazı durumlarda tamamen ortadan kaldırdığını yazar [3].

Nem de önemlidir. Kışın dış havanın mutlak nemi düşük olduğu için havalandırma, iç ortamın bağıl nemini yaklaşık yüzde 30'luk hijyenik sınırın altına çekebilir; kılavuz bu nedenle ısı geri kazanımının yanında nem geri kazanımını da avantaj sayar [3].

Alan sınırları modele göre değişir. Vortice kataloğuna göre:

- VORT HR 350 AVEL ailesi evler, konutlar ve ticari mekânların havalandırması için, 240 m²'ye kadar tasarlanmıştır [8].
- VORT HR 300 NETI 180 m²'ye, VORT HR 450 AVEL D 260 m²'ye kadar tarif edilir [8].
- VORT INVISIBLE MINI TOP küçük daireler, ofisler ve otel odaları için 80 m²'ye kadar tarif edilir [8].

## Eşanjör türleri nelerdir: duyulur, entalpi, plakalı ve döner

Eşanjörler iki ayrı ölçüte göre ayrılır: neyi aktardıkları ve nasıl yapıldıkları.

| Eşanjörün aktardığı | Açıklama |
|---|---|
| Yalnız duyulur ısı (HRV) | Duyulur ısıyı aktarır, nemi aktarmaz [4] |
| Duyulur ısı ve nem (ERV) | Sıcaklıkla birlikte nemi (gizli ısıyı) da aktarır [4][1] |

Eurovent kılavuzu plakalı eşanjörlerin normalde nemi geri kazanmadığını, nem geçiren plakalı "entalpi" eşanjörlerinin bunun istisnası olduğunu belirtir; döner çarklarda ise nem geri kazanımı mümkündür ve nem geri kazanım verimi çark tipine bağlıdır [3].

| Eşanjörün yapısı | Açıklama [3] |
|---|---|
| Plakalı (sabit plakalı) | Sabit plakalar üzerinden ısı geri kazanır; avantajları hava sızdırmazlığı ve hareketli parça olmamasıdır |
| Çapraz akışlı ve karşı akışlı | Hava akış düzenine göre ikiye ayrılır; en verimli olanlar karşı akışlı eşanjörlerdir |
| Döner çarklı | Dönen çarklar ısıyı kütlede biriktirerek geri kazanır |

ABD Enerji Bakanlığı'nın Nisan 2021 tarihli bir araştırma raporu, mevcut en verimli ERV'lerin birçoğunun altıgen, karşı akışlı çekirdek kullandığını, bu çekirdeklerin benzer taban alanında daha yüksek geri kazanım sağladığını ancak basınç düşümünü artırdığını yazar [5].

## Eşanjör verimi nasıl okunur?

Verimi okurken önce hangi koşulda ölçüldüğüne bakılır. Passive House Institute, 2009 tarihli sertifika ölçütünde koşulları açıkça yazar: dengeli debi, −15 ile +10 °C arasındaki dış hava sıcaklığı ve iç ortamdan çekilen yaklaşık 20 °C'lik kuru havada etkin kuru ısı geri kazanımı yüzde 75'ten yüksek olmalıdır [6].

ABD Enerji Bakanlığı'nın 2014 tarihli Aldrich rehberine göre soğuk havada en sık yayımlanan geri kazanım ölçüsü görünür duyulur etkinliktir (ASEF) [4].

Verim debiyle değişir. ABD Enerji Bakanlığı'nın Nisan 2021 tarihli raporunda test edilen bir ERV çekirdeğinde kışın duyulur etkinlik 40 cfm'de (yaklaşık 68 m³/h) yüzde 80'in üzerindeyken 120 cfm'de (yaklaşık 204 m³/h) yüzde 65–70'e düşmüştür [5]. Rapor, havalandırma debisinin çekirdek performansını sıcaklık değişimlerinden daha çok etkilediğini de belirtir [5].

İç sızıntı da ölçülen verimi etkiler [3]. İç sızıntı eşanjörün içindeki ve cihaz gövdesindeki küçük açıklıklardan, dış sızıntı ise gövdeden olur [7][3]. Eurovent kılavuzu iç sızıntının ölçülen sıcaklık verimini saptırdığını ve değerin gerçeğe düzeltilmesi gerektiğini yazar [3]. Aynı kılavuza göre plakalı eşanjörlerde iç sızıntı genellikle döner çarklardan belirgin biçimde düşüktür [3].

Üreticiler verimi farklı koşul ibareleriyle verir. Vortice kataloğu ısıl verimi HRS referans debisinde verir ve referans debiyi ve referans basınç farkını aynı sayfada yazar [8]; AVenS teknik belgesi verimi dengeli debide dipnotuyla verir [11]. İki değeri karşılaştırmadan önce koşulu okumak gerekir.

## VentHub kataloğundaki ısı geri kazanım cihazları

En yüksek debi, en yüksek basınç ve güç değerleri Vortice kataloğunun teknik tablolarından alınmıştır [8][9]. Model adındaki sayı en yüksek debiyle aynı olmayabilir; örneğin VORT HR 450 AVEL D için Vortice kataloğundaki teknik tabloda en yüksek debi 400 m³/h'dir [8]. Kataloğun enerji verisi sayfalarında farklı referans değerler de yer alır [8].

Kanal tipi [Vort HR](vh:aile/vortice-vort-hr-isi-geri-kazanim) ailesi:

| Model [8] | Kod | Kapsadığı alan | Eşanjör (Vortice kataloğundaki ifade) | En yüksek debi (m³/h) | En yüksek basınç (Pa) | Güç (W) |
|---|---|---|---|---|---|---|
| VORT HR 350 AVEL | 12106 | 240 m²'ye kadar [8] | Plastik (PS) karşı akışlı | 350 | 880 | 165 |
| VORT HR 350 AVEL H | 10911 | 240 m²'ye kadar [8] | Entalpi eşanjörü | 350 | 880 | 165 |
| VORT HR 450 AVEL D | 12101 | 260 m²'ye kadar [8] | Karşı akışlı çapraz akış, plastik reçine | 400 | 680 | 350 |
| VORT HR 300 NETI | 10930 | 180 m²'ye kadar [8] | Plastik (PS) karşı akışlı | 300 | 735 | 190 |
| VORT INVISIBLE MINI TOP | 12219 | 80 m²'ye kadar [8] | Karşı akışlı çapraz akış, plastik reçine | 120 | 375 | 64 |

Oda tipi [Vort Mono](vh:aile/vortice-vort-mono) ailesi; eşanjör seramik depolamalıdır [9]:

| Model [9] | Kod | En yüksek debi (m³/h) | En yüksek basınç (Pa) | Güç (W) |
|---|---|---|---|---|
| VORT HRW 30 MONO EVO, EVO HCS, EVO HCS Wi-Fi | 12434, 12436, 12443 | 38 | 130 | 4 |
| VORT HRW 40 MONO EVO, EVO HCS, EVO HCS Wi-Fi | 12435, 12437, 12444 | 40 | 47 | 5 |
| VORT HRW 60 MONO EVO HCS | 12431 | 60 | 120 | 7 |
| VORT HRW 60 MONO EVO HCS Wi-Fi | 12432 | 60 | 120 | 8 |

[AVenS ısı geri kazanım cihazları](vh:aile/avens-isi-geri-kazanim-cihazlari) ailesinde AVenS 750, AVenS 1000 ve AVenS 2000 olmak üzere üç model vardır. Modellerin taze hava debileri AVenS teknik belgelerinde 750, 1000 ve 2000 m³/h olarak yazılıdır; teknik belgeler eşanjörü alüminyum plakalı olarak tanımlar [11]. AVenS ürün sayfası ise 750-5000 m³/h aralığında daha fazla model listeler; aynı sayfa G4 sınıfı temizlenebilir kaset filtreleri ve plug fanlı seçenekleri sayar [10].

İlgili rehber: [Plug fan nedir, nasıl çalışır, nerede kullanılır?](vh:yazi/plug-fan-nedir).

## Isı geri kazanım cihazları için ekotasarım ve enerji etiketi şartı var mı?

Türkiye'de havalandırma ünitelerini kapsayan bir çevreye duyarlı tasarım tebliği ve konut tipi havalandırma üniteleri için bir enerji etiketleme tebliği vardır; ikisi de 25 Mayıs 2021 tarihli ve 31491 sayılı Resmî Gazete'de yayımlanmıştır [12][13].

- **Ekotasarım tebliği:** Havalandırma Ünitelerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (SGM: 2021/18) [12]. Konut tipi ve konut dışı havalandırma ünitelerini kapsar; adı 1253/2014/AB sayılı AB tüzüğüne atıf yapar [12].
- **Enerji etiketi tebliği:** Konut Tipi Havalandırma Ünitelerinin Enerji Etiketlemesine Dair Tebliğ (SGM: 2021/19) [13]. Yalnız konut tipi üniteleri kapsar; adı 1254/2014/AB sayılı tüzüğe atıf yapar [13].

**Hangi ünite konut tipi sayılır?** Ekotasarım tebliği konut tipi havalandırma ünitesini, azami debisi 250 m³/h'ten fazla olmayan ya da 250 ile 1000 m³/h arasında azami debiye sahip olup kullanım amacının konut tipi havalandırma uygulamaları olduğu imalatçı tarafından özellikle belirtilen ünite olarak tanımlar [12]. Azami debi ve imalatçının kullanım amacı beyanı, ünitenin konut tipi mi konut dışı mı sayılacağını belirler [12][13].

**Kapsam dışı kalanlar.** Ekotasarım tebliği, donma koruması ya da buz çözme amaçlı ısı transferi dışında, ısı geri kazanımı için ısı eşanjörü ile birlikte ısı pompası içeren ya da ısı geri kazanım sistemine ilave olarak ısı transferine veya ısı atılmasına izin veren üniteleri kapsam dışı bırakır; etiket tebliği aynı istisnayı koyar [12][13]. Ekotasarım tebliğinin ikinci maddesi ayrıca istisnalar sayar [12].

## Fiyatı belirleyen etkenler

ABD Enerji Bakanlığı raporu altıgen karşı akışlı çekirdeklerin daha yüksek maliyetle geldiğini [5], Aldrich rehberi düşük güç tüketimli sistemlerin çoğu zaman daha pahalı olduğunu belirtir [4]. Güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin. [Isı geri kazanım kategorisi](vh:kategori/heat-recovery-vmc) ürün ailelerini listeler.

## Sık sorulan sorular

### Isı geri kazanım cihazı nem de geri kazanır mı?

Nem geri kazanımı cihaz türüne bağlıdır: ısı geri kazanımlı havalandırıcılar (HRV) nemi aktarmaz, enerji geri kazanımlı havalandırıcılar (ERV) aktarır [4]. Eurovent kılavuzuna göre nem geçiren entalpi plakalı eşanjörler ve döner çarklar nem geri kazanımı sağlayabilir [3]. Vortice kataloğu VORT HR 350 AVEL H modelini entalpi eşanjörüyle duyulur ve gizli ısıyı geri kazanan bir ünite olarak tanımlar [8].

### Kanal tipi ünite mi, oda tipi ünite mi seçilmeli?

Tüm konutu ya da tek bir mahalli, Vortice kataloğundaki 80, 180, 240 ve 260 m²'ye kadar sınıflara göre tek cihaz ve kanalla havalandırmak isteyenler için kanal tipi merkezi ünite uygundur [8]. Yatak odası ya da oturma odası gibi ayrı mahallere birer merkezsiz ünite yerleştirmek isteyenler için oda tipi ünite uygundur [9].

### Isı geri kazanım cihazı soğukta donar mı?

Dış hava 0 °C'nin altına inince eşanjörde yoğuşan su donabilir; donma sınırı iç bağıl neme ve eşanjör verimine bağlıdır [3]. Plakalı eşanjörlerde donma yaklaşık −5 °C'de başlar; entalpi plakalı eşanjör kullanımı bu sınırı belirgin biçimde düşürebilir [3]. Çoğu cihazda buzlanma koruması bulunur, bazı çözme aygıtları ek özellik olarak sipariş edilir [4].

### Isı geri kazanım cihazının filtresi ne sıklıkla değişir?

Eurovent kılavuzunun genel önerisi filtrenin en az yılda bir değiştirilmesidir [3]; ABD Enerji Bakanlığı rehberi bazı sistemler için üç ayda bir değiştirme ya da temizleme belirtir [4]. Geçerli aralık için cihazın üretici kılavuzuna bakılır.

### Isı geri kazanım cihazı ses çıkarır mı?

ABD Enerji Bakanlığı rehberi birçok ERV ve HRV cihazının hatırı sayılır ses ürettiğini söyler [4]. Ses basıncı ve ses gücü ayrı ölçülerdir; üreticinin hangisini hangi uzaklıkta verdiğine bakılır [3].

### Türkiye'de ısı geri kazanım cihazları için ekotasarım ya da enerji etiketi şartı var mı?

Türkiye'de havalandırma ünitelerini kapsayan bir çevreye duyarlı tasarım tebliği (SGM: 2021/18) ve konut tipi havalandırma üniteleri için bir enerji etiketleme tebliği (SGM: 2021/19) vardır [12][13]. Ekotasarım tebliği konut tipi ve konut dışı üniteleri, enerji etiketi tebliği yalnız konut tipi üniteleri kapsar [12][13]. Donma koruması ya da buz çözme dışında ısı geri kazanımı için ısı eşanjörü ile birlikte ısı pompası içeren üniteler iki tebliğin de kapsamı dışındadır; bu, tebliğlerdeki istisnalardan yalnızca biridir [12][13]. Cihazınızın kapsamda olup olmadığını imalatçıdan sorun.

### Isı geri kazanım cihazının fiyatı nedir?

Güncel fiyat ve stok bilgisi için ürün sayfasından teklif isteyin.

## Kaynaklar

Eurovent kılavuzunda ve ABD Enerji Bakanlığı belgelerinde verilen sayfa numaraları PDF sayfa sırasıdır; Eurovent kılavuzunun basılı numaraları yanda belirtilmiştir. Vortice belgelerinde basılı sayfa numarası ile PDF sırası aynıdır.

1. U.S. Department of Energy, Building Science Education Solution Center, "HVAC Energy Recovery Ventilation", https://bsesc.energy.gov/energy-basics/hvac-energy-recovery-ventilation (erişim 31.10.2026).
2. Natural Resources Canada, "Heat-recovery ventilators and energy-recovery ventilators", Mayıs 2017 (sayfa değişiklik tarihi 16.01.2025), https://natural-resources.canada.ca/energy-efficiency/energy-efficiency-regulations/heat-recovery-ventilators-energy-recovery-ventilators (erişim 31.10.2026).
3. Eurovent, "Residential Heat Recovery Ventilation Units Guidebook", ilk baskı, Eylül 2021, PDF s. 4, 7, 13, 14, 16 (basılı s. 6-7, 12-13, 24-25, 26-27, 30-31), https://www.eurovent.eu/wp-content/uploads/2021-09-23-eurovent-rahu-guidebook-first-edition-en-web.pdf (erişim 31.10.2026).
4. U.S. Department of Energy, Building America, R. Aldrich, "Measure Guideline: Selecting Ventilation Systems for Existing Homes", Şubat 2014, PDF s. 12, 42, 44, 45, 46, https://www1.eere.energy.gov/buildings/publications/pdfs/building_america/measure_guide_ventilation_systems.pdf (erişim 31.10.2026).
5. U.S. Department of Energy, Steven Winter Associates, "Research and Development of a Ventilation-Integrated Comfort System", Nisan 2021, PDF s. 26, 45, https://www1.eere.energy.gov/buildings/pdfs/78352.pdf (erişim 31.10.2026).
6. Passive House Institute, "Requirements and testing procedures for energetic and acoustical assessment of Passive House ventilation systems < 600 m³/h for Certification as 'Passive House suitable component'" (belge tarihi 24.09.2009), s. 4, https://passivehouse.com/media/filer_public/61/3d/613dd3bb-c939-4f6e-8c85-ce80867333ad/03_reqs_and_testing_procedures_ventilation_en.pdf (erişim 31.10.2026).
7. REHVA Journal, W. Lawrance, "Internal leakage in air handling units: the outdoor air correction factor (OACF) and exhaust air transfer ratio (EATR)", https://www.rehva.eu/rehva-journal/chapter/internal-leakage-in-air-handling-units-the-outdoor-air-correction-factor-oacf-and-exhaust-air-transfer-ratio-eatr (erişim 31.10.2026).
8. Vortice, "Mechanical extract ventilation and heat recovery" kataloğu (Ocak 2025), s. 32, 33, 34, 36, 46, 47, 48, 52, 53, 55, 58, 59, 60 (üretici belgesi).
9. Vortice, "VORT MONO RANGE" kataloğu (Ocak 2025), s. 4, 14, 17 (üretici belgesi).
10. AVenS (Avensair), "Alüminyum eşanjörlü ısı geri kazanım cihazları AVenS 1000" ürün sayfası, https://www.avensair.com/aluminyum-esanjorlu-isi-geri-kazanim-cihazlari-avens-1000 (erişim 31.10.2026).
11. AVenS (Avensair), "Cihaz teknik bilgileri": AVENS 750 IGK (23.09.2024), AVENS 1000 IGK (13.11.2017, revizyon 15.11.2017), AVENS 2000 IGK (30.01.2024), her biri 4 sayfa, s. 1/4 ve 4/4 (üretici belgesi, erişim 31.10.2026).
12. T.C. Resmî Gazete, 25.05.2021, Sayı 31491, Havalandırma Ünitelerinin Çevreye Duyarlı Tasarım Gerekliliklerine Dair Tebliğ (1253/2014/AB) (SGM: 2021/18). https://www.resmigazete.gov.tr/eskiler/2021/05/20210525-5.htm (erişim 09.11.2026)
13. T.C. Resmî Gazete, 25.05.2021, Sayı 31491, Konut Tipi Havalandırma Ünitelerinin Enerji Etiketlemesine Dair Tebliğ (1254/2014/AB) (SGM: 2021/19). https://www.resmigazete.gov.tr/eskiler/2021/05/20210525-6.htm (erişim 09.11.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Katalog değerleri model ve çalışma noktasına göre değişebilir; kendi sisteminizde farklı çıkabilir. Kurulum yetkili personel tarafından yapılmalıdır.
`,
      },
    },
  },
  {
    // BLOG (BLG-28), doğrulanmış metin: taslak v5 sha d4c707a340ad (v1-v5 beş turda doğrulandı, hedef üçtü, karşılanmadı; her turda tuzaklı kopya 5/5 yakalandı).
    // v5 → v6 farkı on küçük kapsam/terim düzeltmesidir (OPS kararıyla tam tur yok; fark ayrı bir doğrulayıcıya okutuldu). Taslak v6 sha 03af6be30421; kayıtlı gövde sha 2da9d06327b6.
    // Mevzuat iddiası: yalnız ekotasarım (SGM-2021/18) ve enerji etiketi (SGM-2021/19) tebliği kapsamı, MVZ-14 paketi + ham RG ile doğrulandı (BLG-62 tur 1-3); başka ülke/AB hükmü aktarılmaz. Fiyat yok: ürün sayfaları teklife yönlendirir.
    // Yayın: karar 121/c (profesyonel yazı AYNI adreste döner); birleşme ayrı OPS ve Recep onayıyla. yayinTarihi birleşme gününe göre güncellenir.
    kimlik: 'hava-perdesi',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-01',
    // 12 Kasım (BLG-75, URN-161): "ilgili yazılar" bloğu konuya göre açık kimlik listesiyle seçilir (önceki liste ortak "verimlilik" konusundan ilk üç yazıydı: çatı tipi, hücreli, plug fan); yazı gövdesi, başlık ve iddia değişmedi.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    ilgili: ['isi-geri-kazanim-cihazi-nedir', 'fan-cesitleri', 'kanal-tipi-fan-nedir'],
    // 18 Kasım (BLG-86, R5.1.2 küçük düzeltme): enerji bölümünün ilk cümlesi girişle tekrarı bırakıldı; iki SSS cevabının ilk cümlesi cevap verir hâle geldi; yeni iddia yok.
    urunler: ['vh:aile/vortice-ad-isiticisiz-hava-perdeleri', 'vh:aile/vortice-h-ad-elektrikli-isiticili-hava-perdeleri'],
    diller: {
      tr: {
        slug: 'hava-perdesi',
        ozet: "Hava perdesi kapı açıkken dış havanın içeri girişini azaltmaya çalışır. Çalışma ilkesi, enerji etkisinin sınırları, model ve montaj yüksekliği seçenekleri.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz.
        kartOzeti: 'Hava perdesi seçmeden önce kaynaklı model bilgisini ve enerji etkisinin sınırlarını bu rehberde okuyun.',
        govde: `# Hava perdesi nedir, nasıl seçilir?

Hava perdesi, kapı ya da geçiş açıklığının üstüne monte edilen ve açıklık boyunca aşağı doğru hava akımı üfleyen cihazdır; bu akım kapı açıkken dış havanın içeri girişini sınırlamaya çalışır [1][3]. Perdenin sağladığı tasarruf sabit bir yüzde değildir [2][3]; Hava Hareketi ve Kontrol Derneği'nin (AMCA) bir bilgisayar modelleme çalışmasına göre enerji performansı kapı kullanım sıklığına ve bina girişinin yönüne bağlıdır [2].

Kısaca:

- Seçenekler: Vortice kataloğunda modeller uzunluğa, elektrikli ısıtıcının olup olmamasına ve besleme gerilimine göre ayrılır [1].
- Montaj: Vortice kataloğuna göre en düşük montaj yüksekliği 2,3 m, önerilen en yüksek montaj yüksekliği 4 m'dir [1].
- Enerji: AMCA modelinde Chicago'daki orta ölçekli ofis referans binasında, saatte 100 kişi geçişle, tek kapıya kıyasla yıllık tasarruf ısıtma ve soğutma yüküne göre %1,4–2,3'tür [2].

## Hava perdesi nasıl çalışır?

Vortice kataloğu hava perdesini kapıların ya da açıklıkların hizasına monte edilen ve farklı sıcaklıktaki bölgeleri ayıran görünmez bir engel olarak tarif eder; amaç yazın soğutulmuş havanın, kışın ısıtılmış havanın kaçmasını ve dışarıdan toz, egzoz gazı, duman, koku ve böceğin girmesini önlemektir [1]. Washington State University (WSU) kaydı aynı cihazı, dış kapıların hemen içinden aşağı doğru üflenen ince bir hava perdesi olarak tanımlar; kapılar açıkken dış havanın ticari binanın içine üflenmesini engellemeyi amaçlar [3].

Cihaz yalnız bina girişinde değil, bina içinde de kullanılır. Vortice kataloğu, ısıtılan bir alanla ısıtılmayan bir deponun ya da yemek salonuyla mutfağın birbirinden ayrılmasını örnek verir; böylece personelin geçişi kolaylaşır ve koku ile buharın taşınması önlenir [1].

## Hava perdesi ne kadar enerji tasarrufu sağlar?

Tasarruf, binanın ve kullanımın koşullarına göre değişir: AMCA'nın yayımladığı modelleme çalışması, bina girişinin yönünün, bina basıncının ve kapı kullanım sıklığının kapıdan içeri ve dışarı hava akışını ve dolayısıyla perdenin enerji performansını etkilediğini söyler [2].

AMCA ve WSU yüzdeleri birbiriyle doğrudan karşılaştırılmaz, çünkü hem yüzdenin tabanı hem karşılaştırılan giriş farklıdır. AMCA çalışması yüzdeyi, karşılaştırılan giriş düzenine sahip binanın yıllık toplam ısıtma ve soğutma yükü üzerinden hesaplar [2]; WSU'nun aktardığı Pasifik Kuzeybatı Ulusal Laboratuvarı (PNNL) sonuçları ise toplam bina enerji kullanımına göredir [3]. AMCA perdeyi tek kapıyla ve vestibülle kıyaslar, PNNL sonuçları vestibülün tasarrufunu verir.

Vestibül, giriş kapısının önüne kurulan ara bölmedir; AMCA çalışması hava perdesini hem tek kapıyla hem vestibüllü girişle karşılaştırır [2]. İklim bölgesi numaralarını AMCA çalışması kullanır: 1. bölgede Miami, 2. bölgede Austin, 5. bölgede Chicago, 7. bölgede Fargo, 8. bölgede Fairbanks bulunur, yani küçük numara sıcak, büyük numara soğuk iklimdir [2]. Bu numaralar Türkiye'deki bölge sınıflarıyla karıştırılmamalıdır.

| Kaynak ve kapsam | Sonuç |
|---|---|
| AMCA modelleme çalışması: Chicago için ABD Enerji Bakanlığı orta ölçekli ofis referans binası, saatte 100 kişi geçişi [2] | Isıtma ve soğutma yüküne göre, tek kapıya kıyasla yıllık tasarruf %1,4–2,3 (6.660–11.085 kWh); vestibüle göre %0,9–1,5 (4.169–7.205 kWh). Aralık, ısıtma, havalandırma ve iklimlendirme (HVAC) sisteminin ne kadar dengeli olduğuna bağlıdır [2] |
| AMCA modelleme çalışması: aynı bina, temel senaryo (saatte 100 kişi, besleme havası dönüş havasına eşit, dengeli sistem), iklim bölgeleri 3–8, vestibülle karşılaştırma [2] | Isıtma ve soğutma yüküne göre, sıcaklık kontrolüyle yıllık tasarruf %0,3–2,2; sıcaklık kontrolü olmadan iklim bölgeleri 3–5'te en çok %0,8 [2] |
| AMCA modelleme çalışması: aynı bina, iklim bölgeleri 1–2, tek kapıyla karşılaştırma [2] | Isıtma ve soğutma yüküne göre yıllık tasarruf %0,0–0,1; yazar bunu marjinal olarak niteler [2] |
| WSU kaydı: PNNL'nin hızlı yemek tesisi için vestibül sonucuna dayanan vekil tahmin [3] | Toplam bina enerjisine göre tipik tasarruf %4; WSU'nun kendi alt ve üst tahmini %1–6 [3] |
| WSU'nun aktardığı üretici testleri: rüzgâr ve geçiş yoğunluğuna göre kapı başına hava girişinde azalma [3] | %2–40; WSU bu sayıların toplam bina enerjisi hakkında bilgi vermediğini ve karşılaştırma tabanının vestibül mü açık giriş mi olduğunun belli olmadığını yazar [3] |

AMCA modelinde tasarrufun büyük bölümü ısıtmadan gelir; bu yüzden iklim bölgeleri 1–2'de toplam tasarruf marjinaldir [2].

**Model neyi varsayar?** AMCA çalışması bir bilgisayar modelidir: perde jetinin davranışı yaklaşık 350 hesaplamalı akışkanlar dinamiği benzetimiyle, tek kapıdan ve vestibülden hava girişi Yuill'in deneysel orifis denklemleriyle, bina enerjisi ve bina içi hava akışı TRNSYS ve CONTAM benzetim yazılımlarıyla hesaplanmıştır [2]. Modellenen perdenin jet hızı 15 m/s, fan gücü 1,05 kW'tır ve perde iç tasarım sıcaklığında hava üfler; perdenin kendi ısıtma ve soğutma yükü hesaba katılmıştır [2]. Chicago senaryosunda jet 20° dışa açılıdır, iç tasarım sıcaklığı kışın 21 °C, yazın 24 °C'dir ve perde yalnız kullanım saatlerinde, kapı açıkken ve dış hava 10 °C'nin altında ya da 30 °C'nin üstündeyken çalışacak şekilde modellenmiştir [2]. Vortice kataloğundaki modellerin hava hızı 8,5–11 m/s, ısıtıcısız AD serisinin motor gücü en çok 350 W'tır; bu yüzden AMCA sonuçları katalogdaki hiçbir modele doğrudan uygulanamaz [1][2].

**AMCA modelinde kapı kullanım sıklığına göre tasarruf Austin ve Baltimore'da negatife de döner.** Duyarlılık analizinde Austin'de tek kapıya göre yıllık toplam tasarruf −455 ile 330 kWh, Baltimore'da vestibüle göre −903 ile 383 kWh arasında değişir; Minneapolis'te aynı analizde vestibüle göre sonuç 1.244 ile 8.595 kWh arasında kalır [2]. Çalışma, kişi sayısıyla toplam tasarruf arasında belirgin bir ilişki saptanmadığını yazar [2].

**Sonuçlar ne kadar genellenebilir?** Çalışmanın yazarı sonuçların belirli bina, parametre ve modelleme yöntemine dayandığını, başka durumlara genellemenin ayrıca doğrulama gerektirebileceğini not eder [2]. Çalışmayı yayımlayan AMCA, hava perdesi üreticilerinin de içinde bulunduğu hava sistemi ekipmanı üreticilerinin uluslararası derneğidir [2].

**Bina türüne göre vestibül sonuçları.** WSU kaydının dayandığı PNNL sonuçları 2010 tarihlidir ve tasarrufun bina türüne göre çok değiştiğini gösterir: hızlı yemek tesisinde %4,16, sıra dükkânlardan oluşan alışveriş merkezinde (strip mall) %5,61, oturmalı restoranda %1,89, orta ölçekli ofiste %0,23, ilk ve orta öğretim okullarında (primary ve secondary school) sırasıyla %0,29 ve %0,06 [3]. Bu değerler vestibül için hesaplanmıştır; WSU hava perdesi tasarrufunun vestibülünkine yakın olmasını bekler [3].

**Fanın kendi tüketimi.** Perdeyi çalıştıran fanın enerjisi de hesaba girer. AMCA modelinin Chicago senaryosunda perde yıllık 371 kWh fan enerjisi kullanır [2]. Kapı kullanımı arttıkça fan enerjisi de artar; duyarlılık analizinde Austin'de 56–756, Baltimore'da 72–978, Minneapolis'te 84–1.137 kWh arasında değişir [2]. WSU, üreticilerin tasarruf iddialarını değerlendirirken perdeyi çalıştıran fanın enerjisinin nadiren tartışıldığını not eder [3].

İlgili rehberler: [Isı geri kazanım cihazı nedir, nasıl seçilir?](vh:yazi/isi-geri-kazanim-cihazi-nedir), [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Isıtıcılı mı, ısıtıcısız mı? Model ve uzunluk seçenekleri

Vortice kataloğu hava perdesini sekiz modelde sunar; elektrikli ısıtıcı yalnız H serisinde vardır [1]. Katalog metnine göre modeller dört uzunluk sınıfında (900, 1.200, 1.500 ve 2.000 mm) ve tek ya da üç fazlı beslemeyle gelir [1]. Teknik tabloda ısıtıcılı modellerin gövde uzunluğu 950, 1.230 ve 1.510 mm'dir [1].

VentHub kataloğunda hava perdesi kategorisi iki ürün ailesinden ve toplam sekiz modelden oluşur [6]. Isıtıcısız modeller [Vortice AD Isıtıcısız Hava Perdeleri](vh:aile/vortice-ad-isiticisiz-hava-perdeleri) ailesinde, ısıtıcılı modeller [Vortice H AD Elektrikli Isıtıcılı Hava Perdeleri](vh:aile/vortice-h-ad-elektrikli-isiticili-hava-perdeleri) ailesinde yer alır; ikisi de [hava perdeleri](vh:kategori/air-curtains) kategorisindedir.

| Model kodu | Seri | Uzunluk (mm) | Besleme gerilimi (V) | Debi (m³/h) | Hava hızı (m/s) | Ses basıncı (dB(A)) | Ağırlık (kg) | Kaynak |
|---|---|---|---|---|---|---|---|---|
| 65195 | AD 900 | 900 | 230 | 1.100–1.400 | 9–11 | 55–57 | 10,0 | [1] |
| 65196 | AD 1200 | 1.200 | 230 | 1.600–1.900 | 9–11 | 56–58 | 12,5 | [1] |
| 65197 | AD 1500 | 1.500 | 230 | 2.000–2.500 | 9–11 | 57–59 | 15,5 | [1] |
| 65198 | AD 2000 | 2.000 | 230 | 2.900–3.600 | 9–11 | 59–61 | 20,5 | [1] |
| 65155 | H AD 900 M | 950 | 230 | 1.000–1.200 | 8,5–9,5 | 55–57 | 13,5 | [1] |
| 65156 | H AD 900 T | 950 | 380 | 1.000–1.200 | 8,5–9,5 | 55–57 | 13,5 | [1] |
| 65157 | H AD 1200 T | 1.230 | 380 | 1.500–1.700 | 8,5–9,5 | 56–58 | 16,0 | [1] |
| 65158 | H AD 1500 T | 1.510 | 380 | 1.900–2.200 | 8,5–9,5 | 57–59 | 18,0 | [1] |

Tablo değerleri Vortice kataloğunun teknik veri tablosundandır; debi ve hava hızı en düşük ve en yüksek kademeyi, ses basıncı 2 m mesafedeki değeri gösterir [1]. Katalog metni "2.700 m³/h'e kadar" yazar, ancak aynı katalogdaki teknik tablo AD 2000 için 3.600 m³/h verir [1]. VentHub ürün sayfaları da en yüksek debiyi ısıtıcısız ailede 1.400–3.600 m³/h, ısıtıcılı ailede 1.200–2.200 m³/h olarak gösterir [6].

**Uzunluk ve açıklık.** Vortice kataloğu kapı genişliğine göre bir eşleme tablosu vermek yerine perdenin açıklığa olabildiğince yakın monte edilmesini ister ve geniş açıklıklar için perdelerin seri halinde monte edilebileceğini belirtir [1].

**Isıtıcı ve kumanda.** Vortice kataloğu ısıtma elemanlarını PTC termistörlü, aşırı ısınmaya ve gerilim sıçramalarına karşı korumalı olarak tanımlar [1]. Kızılötesi uzaktan kumanda hız seçimini yapar; ısıtıcıyı açıp kapatma komutu yalnız H modellerinde vardır [1]. Isıtıcılı modellerde hava hızı ısıtıcısızlardan düşüktür (8,5–9,5 m/s ve 9–11 m/s) [1]. Cihaz ayrıca piyasadaki standart kapı sensörlerine bağlanabilir [1].

## Montaj yüksekliği ve hava hızı

Vortice kataloğu en düşük montaj yüksekliğini 2,3 m, önerilen en yüksek montaj yüksekliğini 4 m olarak verir; hava hızının bu yüksekliğe kadar etkili olduğunu söyler [1]. Cihaz kapının üstüne ya da açıklığa olabildiğince yakın, yatay ve duvara monte edilir; amaç yanlardan hava geçişini önlemektir [1]. Ön emiş ızgaralı modeller tavanla perde arasında boşluk gerektirmediği için alçak tavanlı mekânlarda da kullanılabilir [1].

Hava perdesi üreticisi Berner, her modelin belirli bir en yüksek montaj yüksekliği için tasarlandığını, bu yüksekliğin aşılmasının zemin seviyesinde gereken hava hızını sağlamayı engellediğini ve performansı düşürdüğünü yazar [4]. Berner bunu 2,5 m'lik bir örnekle anlatır; sayı o üreticinin örneğidir [4]. Aynı kaynağa göre güçlü rüzgâr, bina içinde negatif basınç ve yoğun kapı kullanımı daha güçlü bir hava akımı gerektirir [4].

## Hava perdesi hangi mekânlarda kullanılır?

Vortice kataloğunun uygulama listesinde gıda sanayi, hastaneler ve laboratuvarlar, yemek hizmeti ve konaklama, bar ve restoranlar, ofisler ve okullar, depolar ve üretim bölümleri, süpermarketler, bankalar, yüzme havuzları ve spor merkezleri ile soğutmalı birimler (dış mekân montajı) bulunur [1]. Katalog bu listede gıda sanayisini, bölümler arasında iklimsel ve hijyenik ayrımın ve insan ile malın hızlı ve kolay geçişinin birlikte gerektiği yer olarak belirtir [1].

## ANSI/AMCA 220-21 standardı nedir?

ANSI/AMCA 220-21, hava perdesi ünitelerinin aerodinamik performans derecelendirmesi için laboratuvar test yöntemlerini adında taşıyan AMCA belgesidir [5]. AMCA'nın tanıtım sayfası belgenin okuyucuyu hava perdesi üniteleriyle tanıştırmayı amaçladığını, hava perdesi teorisini, bileşenleri, test ve derecelendirmeyi, yapımı, uygulamaları, seçimi, montajı ve bakımı kapsadığını yazar [5]. Vortice kataloğunun hava perdesi sayfalarının metninde bu standarda ya da başka bir test standardına atıf yoktur [1]. Bu yüzden iki üreticinin debi ve hız değerleri karşılaştırılırken değerlerin hangi test yöntemine göre verildiğini sormak gerekir.

## Teklif için hangi bilgiler gerekir?

Güncel fiyat ve teklif için ürün sayfasındaki teklif formu kullanılır. Vortice kataloğunda modeller arasında değişen seçenekler uzunluk, elektrikli ısıtıcının olup olmaması (H serisi) ve besleme gerilimidir (230 V ya da 380 V) [1]. Katalog ayrıca ısıtıcısız seri için RVG 1A (12835), ısıtıcılı seri için RVG 2A (12836) kodlu regülatörleri listeler [1].

## Sık sorulan sorular

### Hava perdesi kapıyı tamamen kapatır mı?

Hayır; AMCA modelinde perde yıllık infiltrasyonu (dışarıdan içeri hava girişi) tek kapıya göre %62–67 azaltır, tümüyle ortadan kaldırmaz [2]. Vortice kataloğu hava perdesini görünmez bir engel olarak tarif eder; perdenin ürettiği hava akımı dış havanın içeri girişini güçleştirir [1]. AMCA modelinde basınç farkı (dış basınç eksi iç basınç) −3,3 ile 6,9 Pa arasındayken perde girişi sıfıra indirir; 6,9 Pa'nın üstünde dış hava girişi başlar, −3,3 Pa'nın altında ise iç havanın dışarı çıkışı başlar [2]. Aynı çalışmada basınç farkı −15 Pa'nın altına inince, yani iç basınç dış basıncın en az 15 Pa üstüne çıkınca, perde tek kapıdan daha fazla iç havanın dışarı akışına yol açabilir [2].

### Isıtıcılı hava perdesi şart mı?

Isıtıcı bir seçenektir: Vortice kataloğu ısıtıcısız AD ve elektrikli ısıtıcılı H AD olmak üzere iki seri sunar [1].

### Hava perdesi kaç metreye monte edilir?

Vortice kataloğuna göre en düşük montaj yüksekliği 2,3 m, önerilen en yüksek montaj yüksekliği 4 m'dir [1]. Başka üreticilerin modellerinde sınır farklı olabilir; Berner her modelin kendi en yüksek montaj yüksekliği olduğunu belirtir [4].

### Hava perdesi ne kadar ses çıkarır?

Vortice kataloğu 2 m mesafede ses basıncını modele göre 55–61 dB(A) verir; ısıtıcısız AD serisinde 55–61, ısıtıcılı H AD serisinde 55–59 dB(A) aralığındadır [1].

### Hava perdesi vestibülün yerine geçer mi?

Her zaman değil; bir model çalışmasında benzer sonuç vermiştir: AMCA çalışmasında perde, temel senaryoda iklim bölgeleri 3–8'de vestibülle karşılaştırılabilir performans göstermiştir [2]. WSU kaydı, ABD'de vestibül şartı bulunan binalarda hava perdesinin alternatif olarak kabulünün yetkililere enerji eşdeğerliği kanıtı sunularak istenebileceğini belirtir [3]. Projede hangi çözümün uygun sayılacağını yetkili kurumun güncel kararı belirler.

### Hava perdesi bina içinde kullanılabilir mi?

Evet. Vortice kataloğu, ısıtılan alanla ısıtılmayan depoyu ya da yemek salonuyla mutfağı ayırmak için bina içi kullanımı örnek verir [1].

### Uzun bir kapı açıklığı için tek perde yeterli olur mu?

Tek perdenin kaplayabileceği genişlik en uzun modelle sınırlıdır: Vortice kataloğundaki en uzun model ısıtıcısız AD 2000'dir (2.000 mm), ısıtıcılı seride en uzun gövde 1.510 mm'dir [1]. Daha geniş açıklıklar için katalog perdelerin seri halinde monte edilebileceğini söyler [1].

## Kaynaklar

1. Vortice S.p.A., "Air Door Range" hava perdesi kataloğu, Mayıs 2025, kod 5.169.084.451, s. 3–6 (teknik veri tablosu s. 6).
2. AMCA International, L. Wang, "Investigation of the Impact of Building Entrance Air Curtain on Whole Building Energy Use", Short Summary ve Executive Summary, PDF s. 1–8, 10–14 ve 16. https://a.storyblok.com/f/152166/x/2f4055bc03/amca-air-curtain-study.pdf
3. Washington State University, teknoloji veritabanı kaydı "Air Curtains at Building Openings 194: Air Curtains vs. Vestibules" (dayandığı PNNL çalışması 2010). https://e3tnw.org/ItemDetail.aspx-39.html?id=427
4. Berner International, "The Critical Importance of Correct Mounting Height for Air Curtains". https://berner.com/product-knowledge/the-critical-importance-of-correct-mounting-height-for-air-curtains/
5. AMCA International, "ANSI/AMCA Standard 220-21 | Laboratory Methods of Testing Air Curtain Units for Aerodynamic Performance Rating". https://amca.org/publish/publications-and-standards/amca-standards/amca-standard-220-21-laboratory-methods-of-testing-air-curtain-units-for-aerodynamic-performance-rating.html
6. VentHub, hava perdeleri kategori sayfası ile Vortice AD ve Vortice H AD ürün ailesi sayfaları (erişim: 1 Kasım 2026): https://venthub.com.tr/tr/category/hava-perdeleri, https://venthub.com.tr/tr/products/vortice-ad-isiticisiz-hava-perdeleri ve https://venthub.com.tr/tr/products/vortice-h-ad-elektrikli-isiticili-hava-perdeleri

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Enerji tasarrufu sayıları belirli bir bina modeline ve iklime aittir; kendi binanızda farklı çıkabilir. Montaj ve elektrik bağlantısı yetkili personelle yapılmalıdır. Katalog değerleri üretici beyanıdır ve yayın tarihindeki katalog sürümüne aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-31), doğrulanmış metin: taslak v7 (sha 728066b03deb) beş turda doğrulandı (v1-v7; hedef üçtü, karşılanmadı; her turda tuzaklı kopya 5/5 yakalandı).
    // v7 → v8 farkı iki cümledir ve ikisi de iddiayı daraltır (2037 geçiş tarihi çıkarıldı: 2025/2481 değişikliği doğrulanmadı ve kardeş rehber farklı tarih verir; giriş cümlesinde Vortice kapsamı karma akışlı üretici anlatımıyla sınırlandı). Taslak v8 sha 2917711c943b; kayıtlı gövde sha 141c5116ed7a.
    // Güncel durum (9 Kasım 2026, BLG-56 öneri 4): yukarıdaki "2037 çıkarıldı, 2025/2481 doğrulanmadı" notu v8 anına aittir ve bayatladı; (AB) 2025/2481 madde 1(4) sonradan ham metinden okundu (Kaynak 6) ve 2037 yedek parça tarihi gövdeye döndü (BLG-63). Gövde bu yorum için değişmedi.
    // Mevzuat: tür tanımları (AB) 2024/1834 madde 2(17)-(20), (25), madde 9(1), Ek III nokta 4 (OPS, EUR-Lex ham metni, 3 Kasım 2026); yürürlükten kalkan 327/2011 yalnız gaz yolu anlatımı için [5]. Fiyat yok: ürün sayfaları teklife yönlendirir.
    // Yayın: karar 121/c (profesyonel yazı AYNI adreste döner); birleşme ayrı OPS onayıyla. yayinTarihi birleşme gününe göre güncellenir.
    kimlik: 'fan-cesitleri',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-03',
    // Güncelleme tarihi 2026-11-04 (BLG-36): gövde türler çerçevesiyle yenilendi; doğrulanmış metin taslak v12 (sha cf6aaf30e82c; tuzaklı + temiz kopya iki turda, tuzaklar 5/5 ve 5/5; fark turu).
    // ilgiliKategoriler: 11 fan alt kategorisi (URN-151 kategori kartı).
    // BLG-40 (2026-11-06): H1 (= sayfa başlığı) ve meta açıklaması değişti; önceki H1 bir rakip sayfanın başlığıyla birebir aynıydı (GEO-SEO ölçümü). Gövde, slug ve ürün listesi aynı.
    // Güncelleme tarihi 2026-11-07 (BLG-44, SEO-89): yalnız ekleme revizyonu, kanal tipi, hücreli aspiratör, çapraz akışlı ve plug fan için H3 başlıklı yeni bölüm eklendi; var olan başlık, madde, SSS ve meta açıklama aynen kaldı (fark kanıtı: silinen satır 0, R5.5 v0.18). Yeni iddia yok.
    // Güncelleme tarihi 2026-11-09 (BLG-63): AB-327/2011 durumu kayıtta "geçiş döneminde" oldu; "327/2011'i yürürlükten kaldırmıştır" yerine "327/2011'in genel hükümlerini yürürlükten kaldırmıştır" ve Kaynaklar 5'te "genel hükümleri yürürlükten kalkmıştır". Madde 2 tanım cümlelerindeki "yürürlükten kalkan 327/2011" ifadesi aynen kaldı. Önceki değer: 2026-11-08.
    // 11 Kasım (BLG-70): yalnız yazıdan yazıya iç bağlantı cümlesi eklendi; iddia yok
    // 11 Kasım (BLG-71): H1 'Fan çeşitleri nelerdir?', giriş tanım cümlesi (AB 2024/1834 madde 2(1)), 'Endüstriyel fan çeşitleri dahil' H2 eki, aksiyel maddeye aile adı, Kaynak 2 künye sayfası, meta açıklama eki; doğrulanmış metin taslak v4 (sha acaea8cf51d1; tur 1-2 tuzaklı 5/5 ve 6/6 + temiz, tur 3 temiz BITTI)
    // 11 Kasım (BLG-71, Mevzuat düzeltmesi): giriş tanım cümlesi madde 2(1) fan tanımına göre yeniden yazıldı (sha a42b7ff8042b)
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    // 18 Kasım (BLG-86): Kaynak 5 Birleşik Krallık sitesi yerine EUR-Lex özgün metnine çevrildi (tanımlar ölçüldü: aksiyel, santrifüj, karma akışlı, çapraz akışlı aynı); gövde değişmedi.
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
        ozet: "Fan çeşitleri akış yoluna göre aksiyel, radyal ve karma akışlı olarak ayrılır. AB tüzüğündeki akış açısı sınırları ve VentHub fan kategorileri bu yazıda. Endüstriyel fan çeşitleri de VentHub kategorileri içinde listelenir.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Fan türlerini akış yoluna ve VentHub kategorilerine göre karşılaştırmak için bu rehberden başlayın; kategori sayfalarına buradan geçin.",
        govde: `# Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar

Havalandırmada kullanılan fanlar, havanın fandan geçerken izlediği yola göre başlıca aksiyel, radyal (santrifüj), karma akışlı ve çapraz akışlı olarak ayrılır [1]. ABD Enerji Bakanlığı kılavuzu iki ana tür sayar: aksiyel ve santrifüj [2]; Avrupa Birliği'nin (AB) 2024/1834 sayılı fan tüzüğüne göre fan aksiyel, santrifüj, çapraz akışlı, karma akışlı ya da jet olabilir (madde 2(1)) [1]. Hangi türün seçileceği hava özelliklerine, debiye, basınca ve sistem yerleşimine bağlıdır [2].

Kısaca:

- Aksiyel: fan, havayı dönme ekseni boyunca bir pervane gibi hareket ettirir; hafif ve kompakt olma eğilimindedir [2].
- Radyal: fan, havayı radyal yönde hızlandırır; sağlam, sessiz ve güvenilirdir [2].
- Karma akışlı: Vortice LINEO kataloğuna göre çark, helisel fanın yüksek debisini santrifüj fanın yüksek basıncıyla birleştirir [3].

## Fanlar akış yoluna göre nasıl ayrılır?

AB'nin 2024/1834 sayılı fan tüzüğü aksiyel, karma akışlı ve santrifüj fanı gazın çarktan geçen akış açısına göre ayırır: eksenel (aksiyel) fan, akış açısı 20 dereceden küçük olan fandır; karma akışlı fan, akış açısı 20 derece ve üzeri, 70 dereceden küçük olan fandır; santrifüj fan, akış açısı 70 derece ve üzeri olan fandır (madde 2(18), 2(20), 2(19)) [1]. Akış açısı, çarka giren ve çıkan gaz akışı yönleri arasındaki açıdır (madde 2(17)); hesapta kanat çıkış kenarında göbekteki ve dış çaptaki açıların ortalaması alınır (Ek III, nokta 4) [1].

| Tür | Akış açısı (2024/1834 madde 2) | Gazın çarktaki yolu (yürürlükten kalkan 327/2011 madde 2) | Kaynağın anlatımı | VentHub kategorisi |
|---|---|---|---|---|
| Aksiyel | 20 dereceden küçük [1] | Çarkın dönme ekseni doğrultusunda (eksenel) [5] | ABD Enerji Bakanlığı kılavuzu: hafif ve kompakt olma eğilimi [2] | Aksiyel fanlar [4] |
| Radyal (santrifüj) | 70 derece ve üzeri [1] | Çarka büyük ölçüde eksenel girer, eksene dik çıkar [5] | ABD Enerji Bakanlığı kılavuzu: havayı radyal yönde hızlandırır [2] | Radyal (santrifüj) fanlar; hücreli, plug ve gövdeli yapıları kapsar [4] |
| Karma akışlı | 20 derece ve üzeri, 70 dereceden küçük [1] | Santrifüj ve aksiyel tiplerin gaz yollarının arasında [5] | Vortice LINEO kataloğu: helisel fanın yüksek debisi ile santrifüjün yüksek basıncını birleştirir [3] | Kanal tipi fanlar (karma akışlı aileler) [3][4] |

**Tüzüklerin yürürlük durumu.** 2024/1834 sayılı tüzük, 327/2011'in genel hükümlerini 24 Temmuz 2026'dan itibaren yürürlükten kaldırmıştır (madde 9(1)) [1][6]; eski tüzüğün Ek I, II ve III'ü, (AB) 2025/2481 ile değiştirilen aynı fıkraya göre, başka ürünlere entegre fanlar için 24 Temmuz 2027'ye, yedek parça fanları için 24 Temmuz 2037'ye kadar uygulanmaya devam eder [6].

### Aksiyel fanlar

Aksiyel fan, havayı fanın dönme ekseni boyunca bir pervane gibi hareket ettiren fandır; hafif ve kompakt olma eğilimindedir [2]. AB tüzüğü eksenel fanı akış açısı 20 dereceden küçük olan fan olarak tanımlar (madde 2(18)) [1].

### Radyal (santrifüj) fanlar

Radyal (santrifüj) fan, havayı radyal yönde hızlandırarak havanın yönünü değiştiren fandır; sağlam, sessiz ve güvenilirdir ve geniş bir koşul aralığında çalışabilir [2]. AB tüzüğü santrifüj fanı akış açısı 70 derece ve üzeri olan fan olarak tanımlar (madde 2(19)) [1].

İlgili rehber: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

### Karma akışlı fanlar

Karma akışlı fan, çarktan geçen gaz yolu santrifüj ve aksiyel tiplerin gaz yolları arasında kalan fandır; yürürlükten kalkan 327/2011 madde 2 böyle anlatıyordu [5]. AB tüzüğü karma akışlı fanı akış açısı 20 derece ve üzeri, 70 dereceden küçük olan fan olarak tanımlar (madde 2(20)) [1]. Vortice LINEO kataloğunda ürünler karma akışlı (mixed flow) kanal fanları olarak adlandırılır [3]. VentHub'ın kanal tipi fanlar kategori sayfasında aynı tür "karışık akışlı" diye de yazılır [4].

## Fan seçimine nereden başlanır?

ABD Enerji Bakanlığı kılavuzu fan seçimine hava özellikleri, debi, basınç ve sistem yerleşimini bilerek başlanmasını söyler [2]. Aynı kılavuzda fanın uygulamadaki işi, yani gereken debi ve basınç, belirleyici girdi olarak anılır [2]. VentHub kategori sayfaları kendi seçim sorularını verir; örneğin kanal tipi fanda seçimi kanal çapı veya kesiti, gereken debi, gürültü hassasiyeti ve hattın radon gibi özel bir tahliye görevi olup olmadığı belirler [4].

## VentHub'da hangi fan kategorileri ve serileri var? Endüstriyel fan çeşitleri dahil

VentHub kataloğundaki kategoriler aynı ölçüte göre ayrılmamıştır: bazıları kullanım yerini (çatı, banyo, duman egzoz, şömine), bazıları yapıyı ya da malzemeyi (hücreli, plug, korozyona dayanımlı), biri işlevi (tavan vantilatörü) anlatır. Bir fan hem bir akış yoluna hem bir kategoriye girebilir; örneğin hücreli aspiratör, kayış kasnaklı bir radyal fandır [4].

- Aksiyel fanlar kategorisi duvara monte edilen, düşük ve orta basınçlı aksiyel fanları kapsar [4]; kategori sayfasındaki ailelerden biri Vortice Aksiyel Endüstriyel Fanlar'dır [4]; modeller: [aksiyel fanlar](vh:kategori/axial-industrial-fans).
- Radyal (santrifüj) fanlar kategorisinin sayfası hücreli, plug ve gövdeli olmak üzere üç yapıyı tanıtır [4]; modeller: [radyal (santrifüj) fanlar](vh:kategori/centrifugal-fans).
- Kanal tipi fanlar havayı kanal hattının içinde taşır ve kanala seri bağlanır; kategoride karma akışlı iki LINEO ailesi (LINEO ve LINEO Quiet) de bulunur [3][4]; modeller: [kanal tipi fanlar](vh:kategori/duct-fans). İlgili rehberler: [Kanal tipi fan nedir, nerede kullanılır? Fan türleri ve seçimde bakılacaklar](vh:yazi/kanal-tipi-fan-nedir), [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi).
- Çatı tipi fanlar havayı binanın en üstünden dışarı atan, çatıya oturan fanlardır [4]; modeller: [çatı tipi fanlar](vh:kategori/roof-fans). İlgili rehber: [Çatı tipi fan nedir, nasıl seçilir?](vh:yazi/cati-tipi-fan-nedir)
- Banyo ve tuvalet fanları nemin ve kokunun kaynağında alındığı küçük hacim fanlarıdır [4]; modeller: [banyo ve tuvalet fanları](vh:kategori/bathroom-toilet-fans). İlgili rehber: [Banyo ve tuvalet fanı nasıl seçilir?](vh:yazi/banyo-tuvalet-fani-secimi)
- Duman egzoz fanları yangın hâlinde dumanı tahliye etmek üzere yüksek sıcaklıkta çalışmaya sertifikalı fanlardır [4]; modeller: [duman egzoz fanları](vh:kategori/smoke-exhaust-fans).
- Hücreli aspiratörler kayış kasnaklı hücreli radyal fanlardır [4]; modeller: [hücreli aspiratörler](vh:kategori/cabinet-fans). İlgili rehber: [Hücreli aspiratör nedir, seçerken nelere bakılır?](vh:yazi/hucreli-aspirator-nedir)
- Plug fanlar geriye eğik kanatlı, tek emişli ve doğrudan tahrikli fanlardır [4]; modeller: [plug fanlar](vh:kategori/plug-fans). İlgili rehber: [Plug fan nedir, nasıl çalışır, nerede kullanılır?](vh:yazi/plug-fan-nedir)
- Korozyona ve aside dayanımlı fanlar kategorisi santrifüj fanları kapsar [4]; modeller: [korozyona ve aside dayanımlı fanlar](vh:kategori/corrosion-and-acid-resistant-fans). İlgili rehber: [Asit fanı nedir? Korozyona ve kimyasala dayanıklı fan nasıl seçilir](vh:yazi/asit-fani-nedir-korozyona-dayanikli-fan-secimi)
- Şömine ve baca fanları bacanın çekişini mekanik olarak destekleyen fanlardır [4]; modeller: [şömine ve baca fanları](vh:kategori/chimney-fans).
- Endüstriyel tavan vantilatörleri büyük hacimlerde havayı yavaş ama çok geniş bir alanda hareket ettiren büyük çaplı vantilatörlerdir; havayı dışarı atmaz, içerideki havayı karıştırır [4]; modeller: [endüstriyel tavan vantilatörleri](vh:kategori/industrial-ceiling-fans).

İlgili rehberler: [Hava perdesi nedir, nasıl seçilir?](vh:yazi/hava-perdesi), [Isı geri kazanım cihazı nedir, nasıl seçilir?](vh:yazi/isi-geri-kazanim-cihazi-nedir)

## Kanal tipi, hücreli aspiratör, çapraz akışlı ve plug fan nedir?

**Kanal tipi fanlar** havayı kanal hattının içinde taşır ve kanala seri bağlanır [3][4]. Kanal tipi, bir kategoridir: VentHub'ın kanal tipi fan kategorisinde karma akışlı iki aile ile dikdörtgen kanal tipi radyal fanlar ailesi bulunur [3][4].

**Hücreli aspiratörler** kayış kasnaklı hücreli radyal fanlardır [4].

**Çapraz akışlı fan**, AB tüzüğünün tanımına göre gaz yolu çarkın eksenine esasen dik olan ve çarka çevresinden girip çevresinden çıkan fandır (madde 2(25)) [1]. VentHub'ın fan kategorileri arasında çapraz akışlı fan için ayrı bir kategori yoktur [4].

**Plug fanlar** geriye eğik kanatlı, tek emişli ve doğrudan tahrikli fanlardır [4]; radyal (santrifüj) fanlar kategorisinin sayfası hücreli ve gövdeli yapılarla birlikte plug yapıyı da tanıtır [4].

## Teklif için hangi bilgiler gerekir?

Fan türü seçimini belirleyen girdiler hava özellikleri, debi, basınç ve sistem yerleşimidir [2]; kategoriye göre kanal çapı veya kesiti, çatı tipi ve eğimi ya da baca kesiti gibi girdiler eklenir [4]. Kategori sayfalarındaki ürünler için "Teklif İste" düğmesi bulunur [4].

## Sık sorulan sorular

### Radyal fan mı santrifüj fan mı denir?

VentHub kataloğunda iki ad birlikte kullanılır: kategori "Radyal (Santrifüj)" adını taşır [4]. AB tüzüğünün tür tanımları arasında radyal fan yoktur, tür adı santrifüjdür (centrifugal); "radial" sözcüğü jet fan tanımında da geçer (madde 2(26)) [1]; yürürlükten kalkan 327/2011'de "radial" sözcüğü kanat biçimi için de geçiyordu [5].

### Karma akışlı fanın avantajı nedir?

Vortice LINEO kataloğuna göre karma akışlı çark, helisel fanların yüksek debisini santrifüj fanların yüksek basıncıyla birleştirir [3].

### Kanal tipi fan hangi akış yoluna girer?

Kanal tipi, bir kategoridir. VentHub'ın kanal tipi fan kategorisi tek bir akış yoluna ait değildir: karma akışlı iki aile ile dikdörtgen kanal tipi radyal fanlar ailesi bulunur [3][4]. Kategori sayfasında başka aileler de listelenir [4].

### Hücreli aspiratör hangi fan türüdür?

Hücreli aspiratörler kayış kasnaklı hücreli radyal fanlardır [4].

### Çapraz akışlı fan nedir?

AB tüzüğü çapraz akışlı fanı, gaz yolu çarkın eksenine esasen dik olan ve çarka çevresinden girip çevresinden çıkan fan olarak tanımlar (madde 2(25)) [1].

### VentHub'da hangi fan kategorileri var, teklif nasıl istenir?

Kategoriler aksiyel, radyal (santrifüj), kanal tipi, çatı tipi, banyo ve tuvalet, duman egzoz, hücreli aspiratör, plug, korozyona ve aside dayanımlı, şömine ve baca fanları ile endüstriyel tavan vantilatörleridir; kategori sayfalarındaki ürünler için "Teklif İste" düğmesi bulunur [4].

## Kaynaklar

1. Avrupa Komisyonu, (AB) 2024/1834 sayılı Komisyon Tüzüğü, madde 2(1), 2(17)-(20), 2(25), 2(26) ve Ek III nokta 4, EUR-Lex (CELEX:32024R1834), ilk yayımlanan metin: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1834 (erişim 03.11.2026)
2. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, PDF s. 7, 21 ve 23. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 03.11.2026)
3. Vortice S.p.A., LINEO In-line mixed flow fans kataloğu, Cod. 5.170.084.547, Mayıs 2026, s. 1, 4 ve 5.
4. VentHub, fan alt kategorilerinin sayfaları (aksiyel, radyal, kanal tipi, çatı tipi, banyo ve tuvalet, duman egzoz, hücreli, plug, korozyona ve aside dayanımlı, şömine ve baca, endüstriyel tavan vantilatörleri): https://venthub.com.tr/tr/category/kanal-tipi-fanlar ve diğerleri aynı yol altında (erişim 03.11.2026).
5. Avrupa Komisyonu, 327/2011 sayılı (AB) Tüzüğü, 2. madde (tanımlar: aksiyel fan, santrifüj fan, karma akışlı fan, çapraz akışlı fan, santrifüj radyal kanatlı fan), EUR-Lex (CELEX:32011R0327), özgün metin: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011R0327 (erişim 18.11.2026)
6. Avrupa Komisyonu, (AB) 2025/2481 sayılı Komisyon Tüzüğü (2024/1834'ü değiştiren tüzük), madde 1(4), Resmî Gazete (OJ L, 8.12.2025): http://data.europa.eu/eli/reg/2025/2481/oj (erişim 03.11.2026)

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
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    // 18 Kasım (BLG-86, R5.1.2): "aynı şey midir" cevabının ilk cümlesi cevap verir; Kaynak 4'e Casals katalog adresi eklendi (revizyon kodu CV092024 PDF'te ölçüldü); yeni iddia yok.
    urunler: ['vh:aile/casals-enkelfan-ec-plug', 'vh:aile/casals-kentalfan-plug'],
    ilgiliKategoriler: ['vh:kategori/plug-fans'],
    diller: {
      tr: {
        slug: 'plug-fan-nedir',
        ozet: "Plug fan nedir? Çark ve tahrik yapısı, kullanım yerleri, seçim girdileri ve VentHub'daki plug fan serileri.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini, kategori sayfası metnini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Plug fanın ne olduğunu, VentHub'daki iki seriyi ve seçimde gereken girdileri görmek için bu rehberden başlayın.",
        govde: `# Plug fan nedir, nasıl çalışır, nerede kullanılır?

Plug fan, kasasız bir fan türüdür; ASHRAE Journal'da 1997'de yayımlanan bir makalenin başlığında "unhoused (plug/plenum) fans" ifadesiyle geçer [2]. Casals kataloğunda EC ve IEC motorlu plug fanlar geriye eğik kanatlı, tek emişli, doğrudan tahrikli çarkı olan radyal (santrifüj) fanlardır [4]. Casals bu fanları klima cihazı, plenum, kompresör, kurutucu, kabin ve fotovoltaik invertöre entegre edilmek üzere uygun görür [4].

Kısaca:

- Tahrik: ABD Enerji Bakanlığı kılavuzu doğrudan tahriki kayışlıya göre daha verimli, daha az yer kaplayan ve daha az bakım isteyen bir düzen olarak anar [3].
- Seçim: ABD Enerji Bakanlığı kılavuzuna göre fan seçimi hava özellikleri, hava debisi, basınç ve sistem yerleşimini bilerek başlar [3].
- Seriler: VentHub'ın plug fan kategorisinde iki seri bulunur; biri harici rotorlu EC motorlu, biri IEC standart asenkron motorlu [5].

**Plug fan ve plenum fan.** ASHRAE sözlüğünde plenum fan girdisi vardır: tek girişli bir çarkla hava dağıtım sistemindeki bir plenum haznesini basınçlandıran fan düzeneği olarak tanımlanır [1]. ASHRAE'nin tanımı plenum fan içindir [1]; plug fan ile plenum fan arasındaki ilişki yalnızca bir makale başlığına dayanır [2].

## Plug fan nasıl çalışır?

ABD Enerji Bakanlığı kılavuzunun sözlüğü santrifüj fanı, havanın çarkın dönme eksenine dik yönde boşaltıldığı fan tasarımı olarak tanımlar; kanatları dönüş yönünden geriye doğru açılı fanlar bu kılavuzda santrifüj fanların bir grubudur [3]. Casals kataloğundaki EC ve IEC motorlu plug fanlarda çark geriye eğik kanatlı ve tek emişlidir [4]. ASHRAE sözlüğü plenum fan girdisinde çarkın tipik olarak kanat profilli ya da geriye eğik tasarımda olduğunu yazar; bu bilgi plenum fan içindir [1].

**Doğrudan tahrik ne kazandırır, neyi sınırlar?** ABD Enerji Bakanlığı kılavuzu, çarkın motor miline doğrudan bağlandığı düzenin kayışlı tahrike göre daha yüksek verim, daha az yer ve daha az bakım gibi avantajları olduğunu belirtir [3]. Aynı kılavuz doğrudan tahrikli fanların motorun devrinde dönmesi gerektiğini ve bunun kullanılabilecekleri uygulamaları sınırladığını da yazar [3]. Plug fanların hepsi doğrudan tahrikli değildir: Casals kataloğunda doğrudan tahrikli serilerin yanında kayış tahrikli bir seri de yer alır [4].

**Doğrudan tahrikte hız ayarı.** ABD Enerji Bakanlığı kılavuzu doğrudan tahrikli fanın hız ayarını kayışlı düzene göre daha az esnek bulur; bu esnekliği eklemenin bir yolu olarak ayarlanabilir hız sürücüsünü gösterir [3]. VentHub'da hız sürücüleri [frekans konvertörleri](vh:kategori/frequency-converters) kategorisindedir.

İlgili rehber: [Frekans konvertörü nedir, fan ve pompada nasıl seçilir?](vh:yazi/frekans-konvertoru)

## Hangi makinelerde kullanılır?

Casals kataloğundaki EC ve IEC motorlu plug fanlar klima cihazlarına, plenumlara, kompresörlere, kurutuculara, kabinlere ve fotovoltaik invertörlere entegre edilmek üzere uygun görülür [4].

Fan seçimi, ABD Enerji Bakanlığı kılavuzuna göre sistemin çalışma koşullarını bilerek başlar: hava özellikleri, hava debisi, basınç ve sistem yerleşimi [3]. Hava özellikleri nem, sıcaklık, yoğunluk ve kirlilik düzeyi gibi özellikleri kapsar [3].

## Seçimde hangi bilgiler gerekir?

| Girdi | Neyi belirler | Hangi kaynak sayıyor |
|---|---|---|
| Hava özellikleri, hava debisi, basınç ve sistem yerleşimi | Santrifüj ya da aksiyel fan türünden hangisinin gerektiğini birlikte belirler | ABD Enerji Bakanlığı kılavuzu [3] |
| Tahrik düzeni | Doğrudan tahrikli fan motorun devrinde döner, kayışlı düzene göre hız ayarı daha az esnektir | ABD Enerji Bakanlığı kılavuzu [3] |
| Hız ayarı ihtiyacı | Doğrudan tahrikte esnekliği ayarlanabilir hız sürücüsü ekler | ABD Enerji Bakanlığı kılavuzu [3] |
| Motor tipi | EC ya da IEC asenkron motor ailesi | VentHub plug fanlar kategorisi [5] |
| Besleme tipi | Tek faz ya da üç faz bağlantısı | VentHub plug fanlar kategorisi [5] |
| Model boyutu | Seri içinde model seçimi | VentHub plug fanlar kategorisi [5] |

## VentHub'da hangi plug fan serileri var?

VentHub'ın [plug fanlar](vh:kategori/plug-fans) kategorisinde iki Casals serisi bulunur: harici rotorlu EC motorlu [ENKELFAN](vh:aile/casals-enkelfan-ec-plug) ve IEC standart asenkron motorlu [KENTALFAN](vh:aile/casals-kentalfan-plug) [5]. İkisi de geriye eğik kanatlı, tek emişli ve doğrudan tahriklidir [4]. Ürün sayfalarında "Teknik Teklif İste" düğmesi bulunur [5].

## Teklif için hangi bilgiler gerekir?

VentHub'ın plug fan kategorisi seçimi dört bilgiye bağlar [5]:

- Hava debisi ve basınç
- Motor tipi: EC ya da IEC asenkron motor
- Besleme tipi: tek faz ya da üç faz
- Model boyutu

İlgili rehberler: [Hücreli aspiratör nedir, seçerken nelere bakılır?](vh:yazi/hucreli-aspirator-nedir), [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Sık sorulan sorular

### Plug fan ile plenum fan aynı şey midir?

Aynı olduğu kaynaklarla gösterilemiyor: ASHRAE sözlüğündeki tanım yalnız plenum fan içindir [1]. İki adı yan yana getiren tek dayanak, ASHRAE Journal'daki bir makalenin "plug/plenum" başlığıdır [2].

### Plug fan her zaman doğrudan tahrikli midir?

Hayır. Casals kataloğundaki EC ve IEC motorlu seriler doğrudan tahriklidir, bir seri ise kayış tahriklidir [4].

### Plug fanın koruma sınıfı nedir?

Casals kataloğundaki EC motorlu plug fanın motoru IP54 korumalı ve B sınıfı yalıtımlıdır, IEC asenkron motorlu olanın motoru IP55 korumalı ve F sınıfı yalıtımlıdır [4]. IEC asenkron motorlu seri için talep üzerine 100 °C'ye ve IP66'ya kadar farklı üretim de mümkündür [4].

### Plug fan hangi sıcaklıkta çalışır?

Casals kataloğundaki EC motorlu plug fanın çalışma sıcaklığı modele göre -20 ile 60 °C arasından -30 ile 40 °C arasına kadar değişir, IEC asenkron motorlu olanın sürekli çalışma sıcaklığı en çok 60 °C'dir [4].

### VentHub'da hangi plug fan serileri var, teklif nasıl istenir?

VentHub'ın plug fanlar kategorisinde EC motorlu ve IEC asenkron motorlu iki seri bulunur; ürün sayfalarında "Teknik Teklif İste" düğmesi vardır [5].

## Kaynaklar

1. ASHRAE, ASHRAE Terminology (A Comprehensive Glossary of Terms for the Built Environment), "plenum fan" girdisi. https://terminology.ashrae.org/?entry=plenum%20fan (erişim 03.11.2026)
2. C. W. Coward, "Unhoused (plug/plenum) fans: is their performance predictable?", ASHRAE Journal, cilt 39, sayı 10, Ekim 1997. Bibliyografik kayıt: International Institute of Refrigeration, kayıt no 1998-3086, https://iifiir.org/en/fridoc/unhoused-plug-plenum-fans-is-their-performance-predictable-109693 (erişim 03.11.2026)
3. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, basılı s. 4, 11, 17, 47, 75 ve 76. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 03.11.2026)
4. Casals, Plug fans — Technical Catalogue / Catálogo técnico (revizyon kodu CV092024), basılı s. 10, 14, 18 ve 19. https://www.casals.com/assets/uploads/cat_pdf/82f7f-cata-logo-plug-fans_casals.pdf (erişim 18.11.2026)
5. VentHub, plug fanlar kategori sayfası ile iki ürün ailesi sayfası (erişim 03.11.2026): https://venthub.com.tr/tr/category/plug-fanlar, https://venthub.com.tr/tr/products/casals-enkelfan-ec-plug ve https://venthub.com.tr/tr/products/casals-kentalfan-plug

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
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    // 18 Kasım (BLG-86, R5.1.2): tek cümlelik "Atık su arıtma" bölümüne kaynaktaki ikinci bilgi (hidrojen sülfür atık suda en yaygın gaz, Kaynak 5) eklendi; zaten ATEX bölümünde aynı kaynakla yazılıydı.
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

- Ortam: Texas State Üniversitesi'nin kendi çeker ocak standardı çok korozif koşullarda cam elyaf, PVC ya da eşdeğeri fan önerir [2].
- Motor: aynı standart, motorun kolay erişim için ve kirlenmesini önlemek amacıyla egzoz kanalının dışına monte edilmesini önerir [2].
- Seçim: tahliye edilen maddeler listelenir, malzeme her madde için föylerden ve kılavuzlardan doğrulanır [2][3][4].

## Asit fanı seçerken hangi adımlar izlenir?

Seçimde şunlara bakılır:

- Tahliye edilecek maddeler listelenir; malzeme, bu maddelerle uyumuna göre seçilir [2].
- Her malzeme madde bazında kimyasal direnç kılavuzlarında ya da föylerde doğrulanır [3][4].
- Hava yoluna giren parçaların, yani kanalın, fanın ve varsa yıkayıcının malzemesi birlikte değerlendirilir [1][2].
- Motorun hava akımı içinde mi dışında mı olacağı belirlenir [1][2].
- Ortamda patlayıcı atmosfer ihtimali varsa bu, korozyondan ayrı değerlendirilir [9][11].

İlgili rehberler: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri), [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

## Asit fanı nedir?

Asit fanı, korozyona dayanıklı fan ve kimyasal dayanımlı fan aynı anlamda kullanılır. Polipropilenden (PP) yapılan asit fanına PP asit fanı denir. ABD'deki Texas State Üniversitesi'nin çeker ocak egzozu için yazdığı standart, egzoz kanalının, fanın ve yıkayıcının malzemesinin çeker ocakta kullanılan maddelerle uyumlu seçilmesini ister [2].

## Asit fanı ve korozyona dayanıklı fan hangi ortamlarda gündeme gelir?

VentHub'da laboratuvar çeker ocağı, kapalı yüzme havuzu ve atık su arıtma gibi ortamlar için [korozyona ve aside dayanımlı fanlar kategorisi](vh:kategori/corrosion-and-acid-resistant-fans) bulunur.

### Laboratuvar çeker ocağı

Laboratuvar çeker ocağı bu ortamlardan biridir. Texas State Üniversitesi'nin kendi çeker ocak standardı egzoz fanı için korozyon düzeyine göre malzeme ayırır: çok korozif koşullarda cam elyaf, PVC ya da eşdeğeri fanlar kullanılmalı; düşük ve orta korozif koşullarda kaplamalı çelik, cam elyaf ya da PVC fanlar kullanılabilir [2].

### Kapalı yüzme havuzu

Kapalı yüzme havuzu da aşındırıcı ortam örnekleri arasında geçer. Euro Inox'un havuz ortamında paslanmaz çelik rehberi kapalı havuz atmosferini yapı ortamında bulunabilecek en aşındırıcı ortamlardan biri olarak niteler ve en kötü korozyon koşullarının havuz suyuyla temas noktasında değil, havuzun üzerindeki havada, örneğin asma tavanların arkasında oluştuğunu yazar [6]. ABD Hastalık Kontrol ve Önleme Merkezleri (CDC) havuz havasındaki yüksek kloramin ve diğer uçucu bileşik düzeylerinin metal yapıları ve ekipmanı da bozabileceğini belirtir [7]; su arıtmada kullanılan kimyasalların aşındırıcı doğası nedeniyle, yanma ekipmanı bulunan ekipman odalarında tüm ekipmanda, özellikle yanma ekipmanında, korozyon beklenmesi gerektiğini de yazar [8].

### Atık su arıtma

Atık su arıtma tesisleri de kanal sisteminden geçen en aşındırıcı gazlardan bazılarını üretir; cam elyaf takviyeli plastik (FRP) fan kataloğunda bunlar arasında hidrojen sülfür, metan, amonyak ve klor sayılır [5]. Bunlardan hidrojen sülfür, atık suda en yaygın gazdır [5].

## Korozyona dayanıklı fanlarda hangi malzemeler kullanılır?

| Malzeme | Kaynakta ne yazıyor | Kaynak |
|---|---|---|
| Polipropilen (PP) | Asitlere ve alkalilere karşı çok iyi direnç gösterir. Aromatik, alifatik ve klorlu çözücülerde ve derişik nitrik asit gibi güçlü asitlerde zayıf kalır. pH değeri değişen sistemler için kullanılacak en uygun malzemelerden biri sayılır | [3][4] |
| PVC | Çeker ocak egzozunda, çok korozif koşullarda cam elyafla birlikte, düşük ve orta korozif koşullarda da anılır | [2] |
| Cam elyaf (FRP) | Çeker ocak egzozunda çok korozif koşullar için anılır; FRP fan kataloğunda hava akımına açık çelik parça bulunmadığı yazılıdır | [2][5] |
| Kaplamalı çelik | Çeker ocak egzozunda düşük ve orta korozif koşullar için anılır; kimyasal etkiye karşı kanal için de kaplamalı yumuşak çelik gerekebilir | [1][2] |

Malzemelerin sıcaklık sınırı ayrıca belgelenir; ilgili modelin ürün föyündeki değere bakılır.

## Korozyona dayanıklı fanın motoru nerede olmalı?

Texas State çeker ocak standardı, fan motorunun kolay erişim için ve motorun kirlenmesini önlemek amacıyla egzoz kanalının dışına monte edilmesini önerir [2]. İngiltere Sağlık ve Güvenlik Kurumu'nun (HSE) yerel egzoz havalandırması kılavuzu ise kanal içindeki aksiyel fanı anlatırken, kirleticinin yanıcı ya da korozif olmadığı durumda motorun da kanalın içinde olduğunu yazar [1].

## Korozyona dayanıklı fan ile ATEX aynı şey midir?

Korozyona dayanım ile ATEX ayrı konulardır: korozyona dayanım fanın malzemesinin aşındırıcı maddelerle uyumuyla, patlayıcı ortama uygunluk ise teçhizatın patlayıcı ortamda kullanılmasıyla ilgilidir [2][9]; biri diğerinin yerine geçmez. Bir ortam ikisini birden taşıyabilir: FRP fan kataloğunda atık suda en yaygın gaz olan hidrojen sülfürün yüksek derecede patlayıcı olduğu yazılıdır; bu yüzden patlamaya dayanıklı motor kullanılması, fan gövdesinin iç yüzeyinin de statik elektriğe karşı topraklanması önerilir [5].

**Hangi mevzuat geçerli?** Üretici SEAT'in belgeleri patlayıcı ortama uygun sürümü ATEX adıyla anar ve 94/9/CE direktifine atıf yapar [13][14]; bu direktif 20 Nisan 2016'dan itibaren 2014/34/AB sayılı direktifle yürürlükten kaldırılmıştır [9]. 2014/34/AB direktifi muhtemel patlayıcı ortamda kullanılması amaçlanan teçhizatı ve koruyucu sistemleri kapsar; muhtemel patlayıcı ortamı yerel ve işletme koşulları nedeniyle patlayıcı hale gelebilecek ortam olarak tanımlar [9]. Türkiye'de muhtemel patlayıcı ortamda kullanılan teçhizata ilişkin yönetmelik 30 Haziran 2016 tarihli ve 29758 sayılı Resmî Gazete'de yayımlanmış ve yayımı tarihinde yürürlüğe girmiştir [10].

İlgili rehber: [Patlayıcı ortamda fan seçimi: ATEX, bölge ve kategori nedir?](vh:yazi/patlayici-ortamda-fan-secimi-atex)

**Kategori ve bölge.** 2014/34/AB direktifinin Ek I bölümü, gaz, buhar, sis ya da hava/toz karışımı kaynaklı patlayıcı ortamın olası olmadığı ya da olsa bile seyrek ve kısa süreli olduğu yerler için tasarlanan teçhizatı kategori 3 olarak tanımlar [9]. Çalışanların korunmasına ilişkin 1999/92/AT sayılı direktif, normal çalışmada gaz, buhar veya sis halinde patlayıcı ortamın oluşmasının beklenmediği ve oluşsa da yalnızca kısa süre kalacağı yeri Bölge 2 olarak tanımlar; Bölge 2 ya da Bölge 22 için de, uygun olmaları koşuluyla, kategori 1, 2 veya 3 ekipmanı kabul eder [11]. Türkiye'de Çalışanların Patlayıcı Ortamların Tehlikelerinden Korunması Hakkında Yönetmelik (30 Nisan 2013 tarihli, 28633 sayılı Resmî Gazete) de Bölge 2 veya Bölge 22 için kategori 1, 2 veya 3 ekipmanı sayar [12].

## VentHub'da hangi korozyona dayanıklı fan serileri var?

VentHub'un [korozyona ve aside dayanımlı fanlar kategorisinde](vh:kategori/corrosion-and-acid-resistant-fans) üç aile listelenir: [SEAT serisi](vh:aile/seat-serisi), [JET serisi](vh:aile/jet-serisi) ve [STORM serisi](vh:aile/storm-serisi). SEAT belgelerine göre SEAT serisinin gövdesi UV işlemli polipropilenden (PPH), çarkı enjeksiyonla kalıplanmış PPH'den yapılır [13]; JET ve STORM serilerinin gövdesi de polipropilendir, yalnız STORM 10'un gövdesi polietilendir [14]. Üç serinin belgesinde de motorun hava akımının dışında olduğu yazılıdır [13][14].

SEAT, ürünlerini tanıttığı bölümde uygulama alanları olarak laboratuvarları, kimya sanayiini, su arıtma tesislerini, hastaneleri, elektrokaplamayı ve üniversiteleri sayar [13]. JET serisi laboratuvar egzozu ve kimya sanayii gibi çok aşındırıcı uygulamalar için tanımlanır [14]. STORM serisi güvenlik kabinleri (STORM 10), yıkayıcılar, duman yakalama kolları ve filtre muhafazaları (STORM 12, 14, 16) için anılır [14]. Üç serinin belgelerinde de ATEX paragrafı yer alır; paragraf "SEAT Series Fans" için Zone II, kategori 3 G seçeneğinden söz eder [13][14].

## Teklif için hangi bilgiler gerekir?

Güncel fiyat ve teklif için ürün sayfasındaki "Teknik Teklif İste" düğmesini kullanabilirsiniz. Teklif için şu bilgileri hazırlayın: tahliye edilecek maddeler ve ortam, hava debisi ve basınç, tek faz ya da üç faz tercihi, motorun hava akımına göre konumu, patlayıcı ortam (ATEX) ihtimali ve montaj alanı.

## Sık sorulan sorular

### PP (polipropilen) asit fanı her kimyasala dayanır mı?

Hayır. Polipropilen asitlere ve alkalilere karşı çok iyi, aromatik, alifatik ve klorlu çözücülere karşı zayıf dirençlidir [3]. Derişik nitrik asit gibi güçlü asitlerde, klorlu hidrokarbonlarda, aromatik bileşiklerde ve yüksek derişimli serbest klorda uygun değildir [4]. Fanın kendi dayanımı ise modelin ürün föyündeki bilgiyle belirlenir.

### PP asit fanı santrifüj fan mıdır?

SEAT belgelerine göre SEAT, JET ve STORM serilerinin çarkı öne eğik santrifüj tipte, enjeksiyonla kalıplanmış PPH'den yapılır; JET serisi ayrıca çatı kaidesine monte, dikey boşaltmalı hat içi santrifüj fan olarak tanımlanır [13][14].

### Paslanmaz çelik korozif ortamda her zaman güvenli midir?

Hayır. Euro Inox rehberi, havuz atmosferinde 1.4301 (304) kalite paslanmaz çelik askı çubuklarındaki gerilimli korozyon çatlamasının 1985'te İsviçre'nin Uster kentindeki bir kapalı havuzun beton tavanının çökmesine yol açtığını anlatır [6]. Rehber, asma tavan bağlantı elemanları için yüksek alaşımlı paslanmaz çelikleri "şart" sayar [6]. Anlatılan olay yapısal askı parçalarıyla ilgilidir [6].

### Kanalın ve yıkayıcının malzemesi de önemli mi?

Evet. Texas State çeker ocak standardı egzoz kanalı, fan ve yıkayıcı malzemelerinin çeker ocakta kullanılan maddelerle uyumuna göre seçilmesini ister; kanal için termoplastik malzemelerin kullanılmamasını da şart koşar [2]. HSE kılavuzu da kimyasal etkiye karşı kanal için kaplamalı yumuşak çelik gerekebileceğini, korozif olmayan düşük sıcaklıklı uygulamalarda ise alüminyum ya da plastiğin (PVC, polipropilen) uygun olabileceğini yazar [1].

### FRP fanda hava akımına açık çelik parça tamamen yok mu?

FRP fan kataloğunda hava akımına açık çelik parça bulunmadığı yazılıdır; aynı katalogda hava akımıyla temas eden bağlantı elemanlarının paslanmaz çelikten olduğu ve yangın geciktirici polyesterle kapsüllendiği belirtilir [5].

### VentHub'da asit fanı fiyatı için teklif nasıl alınır?

Ürün sayfalarındaki "Teknik Teklif İste" düğmesiyle teklif istenir.

## Kaynaklar

1. UK Health and Safety Executive (HSE), HSG258 Controlling airborne contaminants at work: A guide to local exhaust ventilation (LEV), 3. baskı, 2017, PDF s. 52 (¶172) ve 56 (¶190). https://www.hse.gov.uk/pubns/priced/hsg258.pdf (erişim 07.11.2026)
2. Texas State University, EHSRM Fume Hood Standard, "Exhaust System (General)", "Exhaust Ducts" ve "Exhaust Fan" bölümleri. https://gato-docs.its.txst.edu/risk-management/ehsrm-labsfty/EHSRM-Fume-Hood-Standard (erişim 07.11.2026)
3. White Knight (WK) Fluid Handling, Polypropylene (PP) malzeme föyü (27.02.2025), "General Properties". https://wkfluidhandling.com/wp-content/media/materials/pp-polypropylene.pdf (erişim 07.11.2026)
4. Chemline, Chemical Resistance Guide (CRG.11.03.2023), polipropilen bölümü. https://www.jmesales.com/content/docs/Chemline/Chemline.Chemical-Resistance-Guide.11.03.2023-1.pdf (erişim 07.11.2026)
5. Greenheck, BCSW-FRP Centrifugal Fans kataloğu (Nisan 2019), "Wastewater Treatment" ve "Corrosion Resistance" bölümleri, "Construction Features". https://content.greenheck.com/public/DAMProd/Original/10002/BCSWFRP_catalog.pdf (erişim 07.11.2026)
6. Euro Inox, Safe use of stainless steel in swimming pool environments, 2013, PDF s. 5, 6, 7. https://www.edelstahl-rostfrei.de/fileadmin/user_upload/ISER/downloads/Safe_use_swimmingpools_EN.pdf (erişim 07.11.2026)
7. CDC, Model Aquatic Health Code 2018 ekleri, Preventing In-line Production of Toxic Chlorine Gas Events, PDF s. 3. https://www.cdc.gov/model-aquatic-health-code/media/pdfs/Mini-MAHC-ANNEX-Chlorine-Gassing-508.pdf (erişim 07.11.2026)
8. CDC, Model Aquatic Health Code 2018 ekleri, Preventing Pool Chemical Injuries, PDF s. 4. https://www.cdc.gov/model-aquatic-health-code/media/pdfs/Mini-MAHC-Annex-Preventing-Pool-Chemical-Injuries-508.pdf (erişim 07.11.2026)
9. Avrupa Parlamentosu ve Konseyi, Direktif 2014/34/AB (26 Şubat 2014, özgün metin), md. 1, md. 2(5), md. 43, Ek I. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0034 (erişim 07.11.2026)
10. Resmî Gazete, 30 Haziran 2016, sayı 29758, muhtemel patlayıcı ortamda kullanılan teçhizata ilişkin yönetmelik, md. 43(1). https://www.resmigazete.gov.tr/eskiler/2016/06/20160630-13.htm (erişim 25.09.2026)
11. Avrupa Parlamentosu ve Konseyi, Direktif 1999/92/AT, Ek I md. 2 ve Ek II Bölüm B. http://publications.europa.eu/resource/celex/31999L0092 (erişim 06.11.2026)
12. Resmî Gazete, 30 Nisan 2013, sayı 28633, Çalışanların Patlayıcı Ortamların Tehlikelerinden Korunması Hakkında Yönetmelik (erişim 07.11.2026).
13. SEAT, SEAT Series kataloğu, PDF s. 5, 6 ve SEAT serisi ürün belgesi, PDF s. 1.
14. SEAT, JET serisi ürün belgesi (PDF s. 1) ve STORM serisi ürün belgesi (PDF s. 1).

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
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: satılmayan markanın cümlesi edilgen kuruldu (R3.4 m).
    // BLG-79: satılmayan markanın cümlesi edilgen kuruldu (R3.4 m).
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    // 18 Kasım (BLG-86): Radon ailesi ürün listesine ve metindeki bağlantıya eklendi (aile sayfası canlıda 200, 18 Kasım ölçümü); yeni iddia yok.
    urunler: ['vh:aile/vortice-slimroof-cati-fanlari', 'vh:aile/vortice-radon-serisi-cati-fanlari'],
    ilgiliKategoriler: ['vh:kategori/roof-fans'],
    diller: {
      tr: {
        slug: 'cati-tipi-fan-nedir-nasil-secilir',
        ozet: "Çatı tipi fan nedir? Çatıdan egzoz atarken hangi ilke belirleyicidir, çatıda hangi fan türleri kullanılır, seçimde hangi bilgiler gerekir ve VentHub'da hangi çatı tipi fan serileri var.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Çatı tipi fanın ne anlama geldiğini, egzoz atışında nelere dikkat edildiğini ve seçimde gereken bilgileri görmek için bu rehberden başlayın.",
        govde: `# Çatı tipi fan nedir, nasıl seçilir?

Çatı tipi fan, çatıya monte edilip havayı binanın dışına atan fan anlamında kullanılır; üretici sayfalarında terim egzoz çatı fanları için bu anlamda geçer, bazı üreticiler besleme çatı fanlarını da aynı adla sunar [4][6][8]. Seçimde iki soru sorulur: atılan hava binaya geri girecek mi [2] ve fan hangi koşulda çalışacak [1].

Kısaca:

- Atış yeri: HSE rehberine göre kirletici ihmal edilebilir derişime inmedikçe egzoz havası binaya ya da başka binalara geri girmemeli; atış noktası binanın en yüksek noktasının belirgin biçimde üstünde olmalı [2].
- Fan türü: çatıda aksiyel, santrifüj ve karma akışlı fanlar kullanılır; "çatı tipi" adı yerleşimi anlatır, tek bir fan türünü değil [1][4][6][8].
- Seçim girdileri: hava özellikleri, debi, basınç ve sistem yerleşimi [1].
- Üretici beyanı: başlık, bakım erişimi ve motor seçenekleri üreticilere göre değişir [4][5][6].

## Çatıdan egzoz atarken hangi ilke belirleyicidir?

İngiltere Sağlık ve Güvenlik İdaresi'nin (HSE) yerel egzoz havalandırması rehberi, çekilen havanın temizlenmiş olsun olmasın, kirletici ihmal edilebilir derişime inmedikçe binaya ya da başka binalara geri girmemesi gerektiğini yazar [2]. Aynı rehber hedefi, havanın bina çevresindeki dolaşım girdaplarının ötesine atılması olarak koyar ve atış noktasının binanın en yüksek noktasının belirgin biçimde üstünde olmasını ister [2]. CIBSE'nin genel havalandırma rehberi de, yerel egzozlu sistemleri anlattığı yerde, egzoz havasının kapı, pencere ve diğer hava girişlerinden uzak tutulmasını söyler [3].

Çatı fanı sayfasında aynı amaç yukarı atışlı bir düzenle anlatılır: karma akışlı fan, egzoz havasının yeniden emilimini önlemek için kirleticileri binadan uzağa atar [6]. HSE rehberi işyerinde kirletici tahliyesi, CIBSE rehberi genel havalandırma için yazılmıştır [2][3].

## Çatıda hangi fan türleri kullanılır?

ABD Enerji Bakanlığı kılavuzu fanları iki ana türe ayırır: aksiyel fanlar havayı fanın ekseni boyunca hareket ettirir, santrifüj fanlar havayı radyal yönde hızlandırır; iki türün basınç, debi ve verimde örtüşen yetenekleri vardır ama genellikle birbirinin yerine kullanılamazlar [1]. Casals'ın fan türleri sayfasında sınıflama havanın fan içindeki yörüngesine göre yapılır ve santrifüj ile aksiyelin yanına karma akışlı tür eklenir [4]. Çatıda üç türün de örneği görülür:

| Tür | Çatıdaki örnek | Kaynak |
|---|---|---|
| Aksiyel (pervane tipi) | Pervane tipi fanlar yüksek debiyi düşük basınçta verir ve çatı havalandırmasında sık kullanılır | ABD Enerji Bakanlığı kılavuzu [1] |
| Santrifüj | SEAT'ın JET serisi çatıya monte, dikey atışlı, hat içi santrifüj fandır; laboratuvar egzozu ve kimya endüstrisi gibi çok korozif uygulamalar için anlatılır | JET serisi broşürü [8] |
| Karma akışlı | Egzozun yeniden emilimini önlemek için çatıda yukarı atışlı kayışlı karma akışlı fan sunulur | Üretici beyanı [6] |

İlgili rehberler: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri), [Asit fanı nedir? Korozyona ve kimyasala dayanıklı fan nasıl seçilir](vh:yazi/asit-fani-nedir-korozyona-dayanikli-fan-secimi)

## Üreticiler çatı fanlarını nasıl anlatıyor?

Casals'ın sayfasına göre çatı fanı aralığı konut, ticari ve endüstriyel uygulamaları kapsar [4]. Serilerinden biri hava sıkılığı yüksek ve bakımı kolay, plastik ya da alüminyum başlıklıdır; eğilebilir sistemi tam sökmeden bakıma izin verir [4]. Bir başkası yüksek verimli EC motorludur, bir diğeri kimya, petrokimya, laboratuvar ya da çeker ocak gibi ortamlarda korozyona dayanacak biçimde tasarlanmıştır [4].

Vortice, Slimroof serisinde başlığın yuvarlak tasarımının yağmur girişi riskini azalttığını, koruyucu başlığın motor ve pervane bakımı için kolayca çıkarıldığını ve EC motorun entegre elektronik kontrolle motoru optimum yükte çalıştırdığını bildirir [5].

Dikey atışla egzoz havası çeken bir çatı fanı serisi mutfak egzozu, proses havası ve sanayi fırınları gibi uygulamalar için sunulur ve sürekli çalışmada 120 °C'ye kadar hava sıcaklığına uygundur [7].

## VentHub'da hangi çatı tipi fan serileri var?

VentHub'ın [çatı tipi fanlar](vh:kategori/roof-fans) kategorisinde iki ürün ailesi bulunur: on modelli [Vortice Slimroof çatı fanları](vh:aile/vortice-slimroof-cati-fanlari) ve üç modelli [Vortice Radon serisi çatı fanları](vh:aile/vortice-radon-serisi-cati-fanlari) [9]. Slimroof sayfasının başlığında 460–18.600 m³/h aralığı, ilk modelin açıklamasında radyal atış ve EC motor yazılıdır [9]. Radon serisi, kategori sayfasında radon tahliyesi için ayrı bir aile olarak anılır [9].

## Teklif için hangi bilgiler gerekir?

Ürün sayfalarında fiyat gösterilmez; teklif istenir [9]. Kategori sayfası seçimi belirleyen soruları çatı tipi ve eğimi, gereken debi ve tahliye edilen havanın niteliği olarak sıralar [9].

**Seçim neyle başlar?** ABD Enerji Bakanlığı kılavuzuna göre fan seçimi sistemin çalışma koşullarının bilinmesiyle başlar: hava özellikleri (nem, sıcaklık, yoğunluk, kirlilik düzeyi), hava debisi, basınç ve sistem yerleşimi; bu koşullar aksiyel ya da santrifüj fandan hangisinin gerektiğini belirler [1]. Aynı kılavuz belirsizlikleri fazla büyük fanla karşılamayı sorun sayar: yüksek enerji maliyeti, yüksek bakım ve azalan sistem güvenilirliği [1].

**Doğrudan tahrik mi, kayışlı mı?** ABD Enerji Bakanlığı kılavuzu tahrikte bir denge anlatır: aksiyel fanlarda doğrudan tahrik motoru fanın arkasında, düşük sıcaklıkta ve temiz havada, hava akımıyla soğutabilir ama motora erişimi bir ölçüde kısıtlar, kayışlı tahrik ise fan hızı seçiminde esneklik verir ve motoru hava akımının dışında tutar [1]. Üretici sayfasında doğrudan tahrik bakım erişiminin zor olduğu yerde, kayışlı tahrik devir ayarıyla sistem dengelemesi gereken yerde kullanılır [6].

## Sık sorulan sorular

### Çatı tipi fan hangi fan türüdür?

Tek bir tür değildir; çatıda birden çok fan türü kullanılır [1][6][8]. Çatıda pervane tipi aksiyel fanlar sık kullanılır [1]; üreticiler çatıya monte santrifüj ve karma akışlı fanlar da sunar [6][8].

### Çatı fanında egzoz havası nereye atılmalı?

HSE rehberi atış noktasının binanın en yüksek noktasının belirgin biçimde üstünde olmasını, CIBSE ise egzozun kapı, pencere ve hava girişlerinden uzak tutulmasını ister [2][3].

### Fan boyutunu büyük seçmek güvenli midir?

Hayır; gereğinden büyük seçilen fan yüksek enerji maliyeti, yüksek bakım ve azalan sistem güvenilirliği gibi sorunlar doğurur [1].

### Çatı tipi fanda bakım nasıl yapılır?

Bu üreticiye göre değişir. Casals eğilebilir sistemle tam sökmeden bakımı [4], Vortice kolay çıkarılan koruyucu başlığı [5] anlatır; ABD Enerji Bakanlığı kılavuzu ise doğrudan tahrikli aksiyel fanda motora erişimin bir ölçüde kısıtlı olduğunu yazar [1].

### VentHub'da hangi çatı tipi fanlar var, teklif nasıl istenir?

Kategoride Slimroof ve Radon olmak üzere iki ürün ailesi vardır; ürün sayfalarında "Teknik Teklif İste" düğmesi bulunur [9].

## Kaynaklar

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, s. 9, 11, 17, 19 ve 22. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 08.11.2026)
2. Health and Safety Executive (HSE), HSG258 Controlling airborne contaminants at work: A guide to local exhaust ventilation (LEV), 3. baskı, 2017, paragraf 220 ve 221. https://books.hse.gov.uk/gempdf/hsg258.pdf (erişim 08.11.2026)
3. CIBSE, CIBSE Top Tips 1: Ventilation in Buildings, 2015. https://www.cibse.org/knowledge-research/knowledge-resources/engineering-guidance/cibse-top-tips/cibse-top-tips-1-ventilation-in-buildings-2015/ (erişim 08.11.2026)
4. Casals Ventilación, "Roof fans solutions by Casals" belge kitaplığı sayfası, "Types of fans" sayfası ve çatı fanları broşürü (s. 2). https://www.casals.com/en/documentation/document-library/roof-fans/ , https://www.casals.com/en/ventilation-tools/types-of-fans/ , https://www.casals.com/assets/uploads/cat_pdf/43579-roof-fans-flyer-casals.pdf (erişim 08.11.2026)
5. Vortice, SLIMROOF 355 T ES ürün sayfası. https://fanselectionpro.vortice.com/en/60/fans/33116-slimroof-355-t-es (erişim 08.11.2026)
6. Greenheck, Roof Fans. https://www.greenheck.com/products/fans/roof (erişim 08.11.2026)
7. Systemair, DVN Roof Fans. https://www.systemair.com/en/products/fans/roof-fans/dvn (erişim 08.11.2026)
8. SEAT Fans, JET Series (Fantech Pty Ltd broşürü, s. 4). https://www.fantech.com.au/images/Brochures/SEAT.pdf (erişim 08.11.2026)
9. VentHub, çatı tipi fanlar kategori sayfası, Slimroof ve Radon ürün ailesi sayfaları (erişim 08.11.2026): https://venthub.com.tr/tr/category/cati-tipi-fanlar , https://venthub.com.tr/tr/products/vortice-slimroof-cati-fanlari , https://venthub.com.tr/tr/products/vortice-radon-serisi-cati-fanlari

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Atış yeri ve mesafeleri projeye özel hesapla belirlenir; üretici beyanları üreticinin kendi sayfalarındaki bilgilerdir. Ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-51), doğrulanmış metin: taslak v6 (sha 1315ed9bdbb3), iç bağ işaretli v7 (sha d3db53fa6879; metin v6 ile aynı). Makale çerçevesi (cetvel R3.3): markasız gövde, marka ve seri adları yalnız "VentHub'da hangi serilerin sayfasında ATEX bölgesi yazılı?" bölümünde ve Kaynaklar'da.
    // Doğrulama: altı tur tam okuma, her turda tuzaklı + temiz kopya (tuzaklar 6/6, 5/5, 6/6, 6/6, 7/7, 7/7); son tur temiz kopyada yanlış 0, kapsam aşımı 0. Recep yayın onayı 08.11.2026 (OPS). AB metinleri EUR-Lex ham metninden; TR yönetmelik adları ve madde numaraları MEVZUAT (MVZ-6, 8 Kasım) paketinden: resmigazete.gov.tr yayım tarihli ilk metinler, TR Ek-1 (kategori 3) okunmadı.
    // Fiyat yok. Vorticent CMS ATEX Zone 1 bilgisi ve JET "Kategori 3 G" ifadesi yalnız VentHub sayfalarındadır (etiketli). SEAT/STORM için bölge iddiası yok.
    kimlik: 'patlayici-ortamda-fan-secimi-atex',
    konu: 'guvenlik',
    yayinTarihi: '2026-11-08',
    // 9 Kasım 2026 (BLG-56 öneri 1-3, R5.5): RG 27.06.2020/31168 değişiklik yönetmeliği okundu (Bakanlık adı, bakan, değişmeyen maddeler, Kaynak 9), '99/92/AT' yazımı '1999/92/AT' birliğine getirildi, 28633 ve 29758 için tarama sınırı yazıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    // 18 Kasım (BLG-86): model adlarındaki T4 ve T2 için tek cümle eklendi (ürün sayfasında model adının parçası; bölge ayrı alandan okunur); yeni iddia yok.
    urunler: ['vh:aile/vortice-vorticent-cms-atex-santrifuj-fanlar', 'vh:aile/jet-serisi'],
    ilgiliKategoriler: ['vh:kategori/centrifugal-fans', 'vh:kategori/corrosion-and-acid-resistant-fans'],
    diller: {
      tr: {
        slug: 'patlayici-ortamda-fan-secimi-atex-bolge-kategori',
        ozet: "ATEX nedir, bölge ve ekipman kategorisi ne anlama gelir, bölge 2'de hangi kategori kullanılır, Türkiye'de karşılığı olan yönetmelikler hangileridir ve VentHub'da hangi serilerin sayfasında ATEX bölgesi yazılı.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Patlayıcı ortamda fan seçerken bölgenin ve ekipman kategorisinin ne demek olduğunu görmek için bu rehberden başlayın.",
        govde: `# Patlayıcı ortamda fan seçimi: ATEX, bölge ve kategori nedir?

ATEX, patlayıcı ortamlara ilişkin iki AB direktifine verilen addır: biri bu ortamlarda kullanılacak ekipmanı, öteki işyerinde çalışanların korunmasını düzenler [3]. Fan seçiminde iki soru sorulur: işyerindeki alan hangi bölgeye sınıflandırılmış [2][3] ve o bölgede hangi ekipman kategorisi kullanılabilir [2]. Gaz ortamında bölge 2 için kategori 3 ekipman sayılır [1][2].

Kısaca:

- Bölge: alanı işveren bölgelere ayırır [3]; bölge 2'de patlayıcı ortamın normal işletmede oluşması beklenmez, oluşursa kısa süre kalır [2].
- Kategori: kategori 3 ekipman, patlayıcı ortamın olası olmadığı ya da yalnız seyrek ve kısa süreli olduğu yerler içindir [1].
- Eşleşme: 1999/92/AT Ek II B'ye göre, patlamadan korunma belgesi aksini belirtmedikçe, ekipman ortamın türüne uygunsa, bölge 2 için kategori 1, 2 ya da 3, bölge 1 için 1 ya da 2 ekipman sayılır [2].

## ATEX hangi iki direktife verilen addır?

Health and Safety Executive'in (HSE) sayfası ATEX'i, patlayıcı ortamlara ilişkin iki Avrupa direktifine verilen ad olarak anlatır [3]. Bunlardan 2014/34/AB, üye devletlerin patlayıcı ortamlarda kullanılacak ekipman ve koruyucu sistemlere ilişkin yasalarının yakınlaştırılmasını; 1999/92/AT ise patlayıcı ortam riski altındaki çalışanların sağlık ve güvenliğinin korunması için asgari gereklilikleri kapsar [3]. 2014/34/AB'nin 1. maddesinin (1)(a) bendi de ana kapsamı aynı sözlerle çizer: patlayıcı ortamlarda kullanılması amaçlanan ekipman ve koruyucu sistemler [1].

Direktif "ekipmanı" makineler, aygıtlar, sabit ya da taşınabilir cihazlar, kontrol bileşenleri ve araçları ile algılama ya da önleme sistemleri olarak sayar; bunlar enerji üretimi, aktarımı, depolanması, ölçümü, kontrolü ve dönüşümü ve/veya malzeme işleme amaçlı olmalı ve kendi olası tutuşturma kaynaklarıyla patlama yaratabilmelidir [1]. Direktif metninde "fan" sözcüğü geçmez [1]. Direktife göre "potentially explosive atmosphere" (potansiyel olarak patlayıcı ortam), yerel ve işletme koşulları nedeniyle patlayıcı hâle gelebilen ortamdır (2. madde, 5. bent) [1].

2014/34/AB, 94/9/AT sayılı direktifi 20 Nisan 2016'dan itibaren yürürlükten kaldırmıştır (43. madde) [1].

## Bölge nedir, kim belirler?

HSE'ye göre işverenler, tehlikeli patlayıcı ortamın oluşabileceği alanları bölgelere sınıflandırmak zorundadır; bir bölgenin sınıfı, büyüklüğü ve yeri patlayıcı ortamın oluşma olasılığına ve oluşursa ne kadar kalacağına bağlıdır [3].

1999/92/AT'nin I. Eki bölge 2'yi şöyle tanımlar: gaz, buhar ya da sis hâlindeki yanıcı maddelerin havayla karışımından oluşan patlayıcı ortamın normal işletmede oluşması beklenmeyen, oluşsa bile yalnız kısa süre kalacak olan yer [2].

## Kategori ve "G" işareti ne anlatır?

2014/34/AB'nin I. Eki, kategori 3 ekipmanı, üreticinin belirlediği işletme parametrelerine uygun çalışabilecek ve normal düzeyde koruma sağlayacak biçimde tasarlanmış ekipman olarak tanımlar [1]. Aynı ek, bu kategorinin gaz, buhar, sis ya da hava/toz karışımlarından oluşan patlayıcı ortamın olası olmadığı ya da oluşsa bile yalnız seyrek ve kısa süreli olduğu alanlar için amaçlandığını yazar [1]. II. Ek, kategori 3 gaz ekipmanı için normal işletmede ortaya çıkabilecek öngörülebilir tutuşturma kaynaklarının önlenmesini ister [1].

Ekipman işaretindeki "G" harfi, II. ekipman grubunda gaz, buhar ya da sisin neden olduğu patlayıcı ortamları anlatır [1].

## Bölge ile kategori nasıl eşleşir?

1999/92/AT'nin II. Ekinin B bölümü, ekipman ve koruyucu sistemlerin seçim ölçütlerini verir ve hangi bölgede hangi kategorinin kullanılacağını sayar; liste, risk değerlendirmesine dayalı patlamadan korunma belgesi aksini belirtmedikçe ve ekipman gazlara, buharlara, sislere ve/veya tozlara uygun olmak koşuluyla geçerlidir [2]. Bu bölüm kategorileri 94/9/AT'ye atıfla verir [2]; o direktif 2014/34/AB ile yürürlükten kalkmıştır [1].

| Bölge | Kullanılacak ekipman kategorisi |
|---|---|
| Bölge 1 (ya da toz için bölge 21) | Kategori 1 veya 2 |
| Bölge 2 (ya da toz için bölge 22) | Kategori 1, 2 veya 3 |

Tabloda kategori 3, yalnız bölge 2 ya da bölge 22 için sayılır [2]. Bölge 1'de kategori 3 ekipman bu listede yer almaz [2].

## Türkiye'de karşılığı olan yönetmelikler hangileridir?

Ekipmana ilişkin 2014/34/AB, Türkiye'de Bilim, Sanayi ve Teknoloji Bakanlığı'nın 30 Haziran 2016 tarihli ve 29758 sayılı Resmî Gazete'de yayımlanan "Muhtemel Patlayıcı Ortamda Kullanılan Teçhizat ve Koruyucu Sistemler ile İlgili Yönetmelik (2014/34/AB)" başlıklı yönetmeliğe karşılık gelir; yönetmelik, Avrupa Birliği mevzuatına uyum çerçevesinde hazırlanmıştır (41. madde) ve yayımı tarihinde yürürlüğe girmiştir (43. madde) [7]. Teçhizat kategorilerinin sınıflandırması bu yönetmeliğin Ek-1'indedir (4. madde, birinci fıkra, (s) ve (ğ) bentleri) [7].

Çalışanların korunmasına ilişkin yönetmelik, 30 Nisan 2013 tarihli ve 28633 sayılı Resmî Gazete'de yayımlanan "Çalışanların Patlayıcı Ortamların Tehlikelerinden Korunması Hakkında Yönetmelik"tir [8]. Bu yönetmeliğin Ek-1'inde bölge 2, gaz, buhar ve sis halindeki yanıcı maddelerin hava ile karışarak normal çalışma koşullarında patlayıcı ortam oluşturma ihtimali olmayan yerler ya da böyle bir ihtimal olsa bile patlayıcı ortamın çok kısa bir süre için kalıcı olduğu yerler olarak tanımlanır; Ek-3, patlamadan korunma dokümanında aksi belirtilmedikçe, bölge 2 veya bölge 22 için kategori 1, 2 veya 3 ekipmanı, bölge 1 veya bölge 21 için kategori 1 veya 2 ekipmanı sayar [8].

27 Haziran 2020 tarihli ve 31168 sayılı Resmî Gazete'de yayımlanan değişiklik yönetmeliği Bakanlık tanımını Sanayi ve Teknoloji Bakanlığı olarak yazar ve yürütme maddesinde Sanayi ve Teknoloji Bakanını anar [9]; 4. maddenin birinci fıkrasındaki (s) ve (ğ) bentleri ile 41. ve 43. maddeler değiştirilen maddeler arasında yer almaz [9].

## VentHub'da hangi serilerin sayfasında ATEX bölgesi yazılı?

VentHub ürün sayfasına göre [Vorticent CMS ATEX serisinde](vh:aile/vortice-vorticent-cms-atex-santrifuj-fanlar) 12/5 T4 ve 14/5 T4 modelleri Zone 1'e; 16/6 T2, 22/9 T4, 25/10 T4, 28/11 T4, 31/12 T4, 35/14 T4, 40/16 T4 ve 45/18 T4 modelleri Zone 2'ye uygun işaretlidir [4]. Model adlarındaki T4 ve T2 yalnız ad olarak geçer; bölge, ürün sayfasındaki Zone 1 ve Zone 2 bilgisinden okunur [4]. [JET serisinde](vh:aile/jet-serisi) JET 20, JET 25 ve JET 30 modellerinin ATEX Bölge 2, Kategori 3 G'ye uygun, patlamaya dayanıklı motorlu versiyonları bulunur [5]; SEAT'ın JET 20 ürün sayfası Zone 2 versiyonun yalnız üç faz motorla sunulduğunu yazar [6].

İlgili rehberler: [Asit fanı nedir? Korozyona ve kimyasala dayanıklı fan nasıl seçilir](vh:yazi/asit-fani-nedir-korozyona-dayanikli-fan-secimi), [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Teklif için hangi bilgiler gerekir?

Önce işveren alanı sınıflandırır ve bölgeyi belirler [3]. Sonra, patlamadan korunma belgesi aksini belirtmedikçe, bölgeye uygun ekipman kategorisi seçilir [2]. Gaz, buhar ve sis için ekipman işaretinde "G" harfine bakılabilir [1].

## Sık sorulan sorular

### ATEX nedir?

Patlayıcı ortamlara ilişkin iki Avrupa direktifine verilen addır: biri ekipmana, biri çalışanların korunmasına ilişkindir [3].

### Bölge 2'de hangi ekipman kategorisi kullanılır?

1999/92/AT II. Ek B bölümüne göre, patlamadan korunma belgesi aksini belirtmedikçe ve ekipman gazlara, buharlara, sislere ve/veya tozlara uygun olmak koşuluyla, bölge 2 (ve toz için bölge 22) için kategori 1, 2 ya da 3 ekipman sayılır [2].

### Kategori 3 ne demektir?

2014/34/AB I. Ek'e göre normal düzeyde koruma sağlayan, patlayıcı ortamın olası olmadığı ya da yalnız seyrek ve kısa süreli oluştuğu alanlar için amaçlanan ekipman kategorisidir [1].

### Alanın hangi bölgede olduğuna kim karar verir?

HSE'ye göre alanı işveren sınıflandırır [3].

### Bölge 1'de kategori 3 ekipman kullanılabilir mi?

1999/92/AT II. Ek B bölümü, patlamadan korunma belgesi aksini belirtmedikçe, bölge 1 ve 21 için yalnız kategori 1 ya da 2 ekipmanı sayar; kategori 3 yalnız bölge 2 ve 22 satırındadır [2].

### Ekipman işaretindeki "G" harfi ne anlama gelir?

2014/34/AB'ye göre II. ekipman grubunda gaz, buhar ya da sisin neden olduğu patlayıcı ortamları gösterir [1].

## Kaynaklar

1. Avrupa Parlamentosu ve Konseyi, 2014/34/AB sayılı Direktif (26 Şubat 2014), madde 1, 2, 43; Ek I (2. Ekipman grubu II, c); Ek II (1.0.5, 2.3.1.1), EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0034 (erişim 08.11.2026)
2. Avrupa Parlamentosu ve Konseyi, 1999/92/AT sayılı Direktif (16 Aralık 1999), Ek I (Bölge 2) ve Ek II B, EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:31999L0092 (erişim 08.11.2026)
3. Health and Safety Executive (HSE), "ATEX and explosive atmospheres" sayfası (güncelleme 26.01.2026). https://www.hse.gov.uk/fireandexplosion/atex.htm (erişim 08.11.2026)
4. VentHub, Vortice Vorticent CMS ATEX santrifüj fanlar ürün sayfası. https://venthub.com.tr/tr/products/vortice-vorticent-cms-atex-santrifuj-fanlar (erişim 08.11.2026)
5. VentHub, JET serisi ürün ailesi sayfası. https://venthub.com.tr/tr/products/jet-serisi (erişim 08.11.2026)
6. SEAT Ventilation, JET 20 ürün sayfası. https://seat-ventilation.com/products/jet-20 (erişim 08.11.2026)
7. Bilim, Sanayi ve Teknoloji Bakanlığı, Muhtemel Patlayıcı Ortamda Kullanılan Teçhizat ve Koruyucu Sistemler ile İlgili Yönetmelik (2014/34/AB), Resmî Gazete, 30.06.2016, sayı 29758, madde 4, 41, 43. https://www.resmigazete.gov.tr/eskiler/2016/06/20160630-13.htm (erişim 08.11.2026)
8. Çalışma ve Sosyal Güvenlik Bakanlığı, Çalışanların Patlayıcı Ortamların Tehlikelerinden Korunması Hakkında Yönetmelik, Resmî Gazete, 30.04.2013, sayı 28633, Ek-1 ve Ek-3. https://www.resmigazete.gov.tr/eskiler/2013/04/20130430-6.htm (erişim 08.11.2026)
9. Sanayi ve Teknoloji Bakanlığı, Muhtemel Patlayıcı Ortamda Kullanılan Teçhizat ve Koruyucu Sistemler ile İlgili Yönetmelik (2014/34/AB)'te Değişiklik Yapılmasına Dair Yönetmelik, Resmî Gazete, 27.06.2020, sayı 31168. https://www.resmigazete.gov.tr/eskiler/2020/06/20200627-2.htm (erişim 09.11.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Alan sınıflandırması işverenin sorumluluğundadır. Üretici beyanları üreticinin kendi sayfalarındaki bilgilerdir. Ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-54), doğrulanmış metin: taslak v11 (sha 4477956e14a2). Makale çerçevesi (cetvel R3.3): markasız gövde, marka ve seri adları yalnız "VentHub'da hangi hücreli aspiratör serileri var?" bölümünde ve Kaynaklar'da.
    // Doğrulama: on tam tur (v1-v10), her turda tuzaklı + temiz kopya; son tam turda engelleyici 0, tuzaklı 9/9. Recep yayın onayı 08.11.2026 (OPS). Mevzuat cümlesi yok, fiyat yok: aile sayfaları teklife yönlendirir.
    // Hücre teriminin bağımsız tanımı incelenen kaynaklarda yok; tanım ürün listesi ve site anlatımına dayanır ve yazıda etiketlidir.
    kimlik: 'hucreli-aspirator-nedir',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-08',
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: iki H2 adı (başlık tekrarı uyarısı); gövde değişmedi.
    // BLG-79: bir H2 adı (başlık tekrarı uyarısı); gövde değişmedi.
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    urunler: ['vh:aile/avens-hucreli-aspiratorler-hf-fw', 'vh:aile/avens-hucreli-aspiratorler-hf-s'],
    ilgiliKategoriler: ['vh:kategori/cabinet-fans'],
    diller: {
      tr: {
        slug: 'hucreli-aspirator-nedir-secerken-nelere-bakilir',
        ozet: "Hücreli aspiratör nedir? Kanat tipi, kayışlı ve doğrudan tahrik, çalışma noktası ve kayış bakımı seçimi nasıl etkiler; teklif için hangi bilgiler gerekir.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Hücreli aspiratörün ne anlama geldiğini, kanat ve tahrik seçiminin neye bağlı olduğunu görmek için bu rehberden başlayın.",
        govde: `# Hücreli aspiratör nedir, seçerken nelere bakılır?

Hücreli aspiratör, AVenS'in 2026 ürün kataloğunda sık ya da seyrek kanatlı kayış kasnaklı hücreli radyal fan olarak anlatılan fan ailesidir [4]. 2003 tarihli ABD Enerji Bakanlığı ve AMCA rehberine göre seçim, sistemin çalışma koşullarının bilinmesiyle başlar: hava özellikleri, debi, basınç ve sistem yerleşimi [1].

Kısaca:

- Tanım: kayış kasnaklı radyal fan olarak adlandırılır [4].
- Seçim: sistem koşullarının bilinmesiyle başlar; fan en verimli noktasından uzaklaştıkça yatak yükü ve gürültü artar [1].
- Tahrik: kayış devir seçiminde esneklik sağlar, doğrudan tahrik daha verimli ve bakımı daha azdır [1].
- Kanat: geriye eğik biçimlerde kanat profilli fanların verimi yüzde 85'i aşabilir; rehber kanat profilli tipin stall ve aşınmaya duyarlı olduğunu da yazar [1].

## Hücreli aspiratör nedir?

2003 tarihli ABD Enerji Bakanlığı ile AMCA International ortak rehberi (DOE/AMCA rehberi) santrifüj fanları, havayı radyal yönde hızlandırıp hareket yönünü değiştiren, nispeten yüksek basınç üretebilen ve hava akımında nem ve partikül bulunan "kirli" hatlarda sık kullanılan fanlar olarak anlatır [1]. AVenS 2026 ürün kataloğu hücreli aspiratörleri "Hücreli aspiratörler" başlığı altında toplar, ailelerine sık ya da seyrek kanatlı kayış kasnaklı hücreli radyal fan der ve bunları 50 mm standart hücre paneli, dış cidarı elektrostatik toz boyalı, statik ve dinamik balansı ayarlı, yüksek performanslı radyal fanlar olarak tanımlar [4]. VentHub'ın kategori ve aile sayfaları aynı fanları çift cidar hücreli radyal fan aileleri olarak anlatır [5]. İlgili rehber: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri).

## Kanat tipleri arasında ne fark var?

DOE/AMCA rehberi santrifüj fanlarda öne eğik ve geriye eğik kanat ayrımını yapar [1].

**Öne eğik kanat** dönme yönünde kıvrılır; bu fan tipi nispeten düşük hızlarda çalışabilir, bu da düşük gürültü düzeyi anlamına gelir, ama verimi görece düşüktür (yüzde 55 ile 65 arası) ve motor aşırı yüklenmesini önlemek için tahrik motoru seçimine dikkat edilmesi gerekir [1].

**Geriye eğik kanat** dönme yönünden uzağa yatar; düz, eğri ve kanat profilli üç biçimi vardır, eğri kanatlı fanlar daha verimli olma eğilimindedir, düz kanatlılar ise daha sağlamdır; kanat profilli fanlarda verim yüzde 85'in üzerine çıkabilir [1]. DOE/AMCA rehberi geriye eğik kanatta düşük çarpma açısı nedeniyle partikül birikiminin kolaylaşabileceğini, kanat profilli tipin stall ve aşınmaya duyarlı olduğunu yazar [1]. Geriye eğik fanın güç eğrisi yüksek debide düşer; bu tip, yüksek debide sistem davranışının belirsiz olduğu durumlarda sık seçilir [1].

| Kanat tipi | Verim | Güç eğrisi | Seçim notu |
|---|---|---|---|
| Öne eğik | Yüzde 55 ile 65 [1] | Debiyle düzenli artar; tahrik motoru seçimine dikkat gerekir [1] | Nispeten düşük hızda çalışabilir, düşük gürültü [1] |
| Geriye eğik | Eğri kanatlı fanlar daha verimli olma eğiliminde (düz kanatlılar daha sağlam), kanat profili yüzde 85 üzeri [1] | Yüksek debide düşer [1] | Yüksek debide sistem davranışı belirsizse sık seçilir [1] |

AVenS 2026 ürün kataloğu eğim yönünü ve kanat sıklığını başka serilerde de belirtir [4]; örneğin Nicotra Gebhardt kataloglarında öne eğik kanatlı anlatılan ADH serisini [2] "Öne eğimli, sık kanatlı", geriye eğik kanatlı anlatılan RDH serisini [3] "Geriye eğimli, seyrek kanatlı" diye tanımlar [4]. Hücreli ailelerin başlıkları ise yalnız "sık kanatlı" ve "seyrek kanatlı" der [4].

## Kayışlı ve doğrudan tahrik arasında ne fark var?

DOE/AMCA rehberi doğrudan tahriklerin kayışlı tahrike göre daha yüksek verim, daha az yer ve daha düşük bakım gibi avantajları olduğunu yazar; doğrudan tahrikli fan motor devrinde dönmek zorundadır, kayışlı tahrik ise fan hızı seçiminde esneklik sağlar [1]. Kayışlı tahrikin bedeli de yazılıdır: yeni ve doğru ayarlı kayışlarda bile yüzde 5 ile 10 arasında güç iletimi kaybı olur [1]. VentHub'daki hücreli aileler yalnız kayış kasnaklıdır [4][5]; AVenS 2026 ürün kataloğunda doğrudan tahrikli hücreli model yoktur [4]. Doğrudan tahrik gerekiyorsa hücreli ailelerin dışına bakmak gerekir; DOE/AMCA rehberi her tahrik seçeneğinin avantajları ve sakıncaları olduğunu yazar [1]. İlgili rehber: [Plug fan nedir, nasıl çalışır, nerede kullanılır?](vh:yazi/plug-fan-nedir)

## Hücreli aspiratörde çalışma noktası neden önemlidir?

Fan performans eğrisinin önemli bir noktası, fanın en ekonomik çalıştığı en verimli noktadır; fanın çalışma noktası bu noktadan uzaklaştıkça yatak yükleri ve gürültü artar [1]. Çalışma noktasının fan eğrisi üzerindeki yeri, fanın ne kadar uygun boyutlandırıldığı hakkında da bir fikir verebilir [1]. DOE/AMCA rehberi, sistem eğrisinin her sistem bileşeninin kayıplarının toplanmasıyla hesaplandığını ve fan çıkışına yakın dirsek konmasının iletilen debiyi yüzde 30'a kadar düşürebilecek bir sistem etkisi yaratabileceğini yazar [1]. Boyutların gereğinden büyük seçilmesi verimsiz çalışma, aşırı hava gürültüsü ve düşük güvenilirlik doğurur [1]. İlgili rehber: [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi).

## Kayış ve kasnak bakımında nelere dikkat edilir?

Uygun kayış gerginliği genellikle tepe yükte kaymayı önleyen en düşük gerginliktir; doğru montaj da dikkatli hizalama ve gerginlik ayarı ister [1]. Rehberin bakım kontrol listesi kayışın durumunu, sıkılığını ve hizalamasını kontrol etmeyi sayar [1]. Yetersiz kayış gerginliği kayış çırpması ya da kayması yüzünden yüksek ses düzeylerine de yol açabilir [1]. İlgili rehber: [Frekans konvertörü nedir, fan ve pompada nasıl seçilir?](vh:yazi/frekans-konvertoru)

## VentHub'da hangi hücreli aspiratör serileri var?

VentHub'ın [hücreli aspiratörler](vh:kategori/cabinet-fans) kategorisinde ikisi de AVenS markalı iki aile bulunur [5]. [AVenS HF-FW](vh:aile/avens-hucreli-aspiratorler-hf-fw) altı modellidir ve sık kanatlı, kayış kasnaklı, çift cidar hücreli radyal fan ailesi olarak anlatılır [5]. [AVenS HF-S](vh:aile/avens-hucreli-aspiratorler-hf-s) yedi modellidir ve seyrek kanatlı, kayış kasnaklı, çift cidar hücreli radyal fan ailesi olarak, 25.000 m³/h debiye ve 11 kW motor gücüne kadar modellerle anlatılır [5]. AVenS'in 2026 ürün kataloğu HF-FW ailesinde 3.400 ile 18.000 m³/h, HF-S ailesinde 4.000 ile 25.000 m³/h debi değerlerini satır başına verir [4].

## Teklif için hangi bilgiler gerekir?

İlgili aile sayfalarında fiyat gösterilmez, teklif istenir [5]. Teklifte hazır bulundurulacak seçim girdileri şunlardır:

- Sistem koşulları: hava özellikleri (nem, sıcaklık, yoğunluk, kirletici düzeyi), hava debisi, basınç ve sistem yerleşimi [1].
- Tahrik: hücreli aileler kayış kasnaklıdır; kayışlı tahrik devir esnekliği sağlar [1][4].
- Aile: sık kanatlı ya da seyrek kanatlı aile seçimi [4][5].

## Sık sorulan sorular

### Hücreli aspiratör radyal fan mıdır?

AVenS 2026 ürün kataloğuna göre evet: katalog hücreli aspiratörleri kayış kasnaklı hücreli radyal fanlar olarak adlandırır [4]. DOE/AMCA rehberi santrifüj fanların havayı radyal yönde hızlandırdığını yazar [1]; rehber "radial" sözcüğünü fan türü adı olarak yalnız radyal kanatlı ve radyal uçlu tipler için kullanır, santrifüj fanın genel adı olarak kullanmaz [1].

### Sık kanatlı ile seyrek kanatlı fan aynı şey midir?

Hayır; AVenS 2026 ürün kataloğunda iki ayrı ailedir: biri sık kanatlı, öbürü seyrek kanatlı [4]. Hücreli ailelerin başlıklarında eğim yönü geçmez [4].

### Kayışlı fanda en çok bakım gerektiren parça hangisidir?

DOE/AMCA rehberine göre kayışlı fanlarda genellikle kayıştır; gerginliğin ve hizalamanın kontrolü bakımın parçasıdır [1].

### Kayışlı fanın devri nasıl değiştirilir ve güç nasıl etkilenir?

DOE/AMCA rehberine göre kasnak çapları değiştirilerek fan hızı artırılabilir; fan hızı ile güç tüketimi arasındaki ilişki üçüncü kuvvettir, yani devir arttıkça güç devrin üçüncü kuvvetiyle artar [1]. Hız artırımı belirgin biçimde daha fazla güç gerektirir, daha büyük bir motor isteyebilir ve dönen elemanların, yatakların ve millerin yapısal olarak değerlendirilmesini gerektirir [1]. Gereğinden büyük seçilmiş kayışlı bir fanda hızı düşürmek uygun olabilir ve gücün belirgin biçimde düşeceği durumda daha küçük bir motor değerlendirilmelidir [1].

### Yalnız fanı yavaşlatmak için frekans sürücü mü, kasnak değişimi mi?

DOE/AMCA rehberi, kayışlı tahrikli ve yükü görece sabit bir uygulamada yalnız fanı yavaşlatmak için frekans sürücü kullanmanın kasnak değişiminden büyük olasılıkla daha az ekonomik olduğunu yazar [1].

### VentHub'da hangi hücreli aspiratörler var?

Kategoride iki aile bulunur: sık kanatlı HF-FW ve seyrek kanatlı HF-S; teklif aile sayfalarından istenir [5].

## Kaynaklar

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, Nisan 2003, PDF s. 7, 8, 10, 12, 13, 15, 21–25, 29, 30, 33, 38–40, 51, 53 ve 54. https://www.energy.gov/sites/prod/files/2014/05/f16/fan_sourcebook.pdf (erişim 08.11.2026)
2. Nicotra Gebhardt, High performance centrifugal fan ADH katalog, Issue 2.5 EN, Ağustos 2013, PDF s. 1, 5 ve 8.
3. Nicotra Gebhardt, High performance centrifugal fan RDH katalog, Issue 2.5 EN, Ağustos 2013, PDF s. 1, 5, 7 ve 8.
4. AVenS, Ürün Fiyat Kataloğu 2026, s. 28, 49 ve 52–55.
5. VentHub, hücreli aspiratörler kategori sayfası ve HF-FW, HF-S aile sayfaları (erişim 08.11.2026): https://venthub.com.tr/tr/category/hucreli-aspiratorler , https://venthub.com.tr/tr/products/avens-hucreli-aspiratorler-hf-fw , https://venthub.com.tr/tr/products/avens-hucreli-aspiratorler-hf-s

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Hücreli ailelerin teknik özellikleri üretici teknik föyünden doğrulanmalıdır. Montaj ve elektrik bağlantısı yetkili personelle yapılır. Ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-55), doğrulanmış metin: taslak v15 (sha 4329bcb6430f). Makale çerçevesi (cetvel R3.3): markasız gövde, marka ve seri adları yalnız "VentHub'da hangi banyo ve tuvalet fanı serileri var?" bölümünde ve Kaynaklar'da.
    // Doğrulama: on tam tur (v1-v13), her turda tuzaklı + temiz kopya; son tam turda engelleyici 0, tuzaklı 10/10. MEVZUAT hükmü (MVZ-8): mevzuat cümleleri doğru; 'debi değeri verilmez' yalnız banyo ve tuvalet fanı için ve eklerin okunmadığı kaydıyla. Recep yayın onayı 08.11.2026 (OPS). Fiyat yok.
    kimlik: 'banyo-tuvalet-fani-secimi',
    konu: 'konfor',
    yayinTarihi: '2026-11-08',
    // 11 Kasım (BLG-70): yalnız yazıdan yazıya iç bağlantı cümlesi eklendi; iddia yok
    // Güncelleme tarihi 2026-11-16 (BLG-78): yazıdan yazıya bağlantı metinleri hedef yazının başlığıyla birebir yapıldı.
    // BLG-79: R3.4 üslup düzeltmesi; yalnız silme, daraltma ve özne değişikliği, yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: yapı düzeltmesi (Sınırlar başlığı, üretici kalıbı, teklif başlığı, SI karşılığı); yeni iddia yok.
    // BLG-79: Kısaca maddelerinden ABD birimleri çıkarıldı (R3.4 k).
    // BLG-79: Kısaca maddelerinden ABD birimleri çıkarıldı (R3.4 k).
    // Gemini dil incelemesi ve doğrulama sonrası okur gözüyle yeniden düzenlendi (BLG-82)
    guncellemeTarihi: '2026-11-18',
    urunler: ['vh:aile/vortice-punto-evo-flexo-banyo-fanlari', 'vh:aile/vortice-vort-quadro-evo', 'vh:aile/avens-qe-b-kasa-serisi'],
    ilgiliKategoriler: ['vh:kategori/bathroom-toilet-fans'],
    diller: {
      tr: {
        slug: 'banyo-ve-tuvalet-fani-nasil-secilir',
        ozet: "Banyo ve tuvalet fanı imar yönetmeliğine göre zorunlu mu? Debi, ses ve kumanda ölçütleri nelerdir; teklif için hangi bilgiler gerekir.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Banyo ve tuvalet fanı seçerken mevzuatın, debinin, sesin ve kumandanın nasıl ele alındığını görmek için bu rehberden başlayın.",
        govde: `# Banyo ve tuvalet fanı nasıl seçilir?

Banyo ve tuvalet fanı, nemi ve kirleticileri oluştuğu yerde odadan atan yerel egzoz fanıdır; ABD Enerji Bakanlığı banyo egzoz fanlarını bu türden sayar [5]. Türkiye'de incelenen iki yönetmeliğin gövde metninde bu fanlar için debi değeri yoktur [1][2]. Ölçütler yurt dışı kaynaklıdır [3][4].

Kısaca:

- Mevzuat: baca ya da mekanik havalandırma istenir, gövdede debi yoktur; bağımsız bölümün ıslak hacminde mekanik havalandırma yapılmazsa pencere net 0,30 × 0,30 m'den küçük olamaz [1].
- Debi: HVI belirli bir alana kadar olan banyoda debiyi alana göre önerir [4]; İngiltere konutlarında aralıklı egzozda banyo en az 15, tuvalet 6 l/s [3].
- Ses: ENERGY STAR, yaklaşık 17 ile 150 m³/h aralığındaki banyo fanlarında azami 2,0 sone ister [6].
- Kumanda: Vortice broşüründe nem eşiği, hareket algılama fanı açar, zamanlayıcı kapatır [10].

## Banyo ve tuvalet fanı ne işe yarar?

ABD Enerji Bakanlığı spot havalandırmayı, yerel egzoz fanlarıyla kirleticileri ve nemi kaynağında hızla uzaklaştırma olarak tanımlar [5]. Dünya Sağlık Örgütü'nün nem ve küf rehberi de olumsuz sağlık etkilerinden kaçınmanın en önemli yolu olarak iç yüzeylerde ve bina yapılarında kalıcı nemin ve mikrobiyal üremenin önlenmesini ya da en aza indirilmesini sayar ve havalandırmanın kirleticileri kaynağında (yerel egzoz) uzaklaştırması gerektiğini yazar [7]. İlgili rehberler: [Kanal tipi fan nedir, nerede kullanılır? Fan türleri ve seçimde bakılacaklar](vh:yazi/kanal-tipi-fan-nedir), [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri).

## Banyo ve tuvaletin havalandırılması imar yönetmeliğine göre zorunlu mu?

Planlı Alanlar İmar Yönetmeliği uygulama imar planı bulunan alanları kapsar (madde 2) [1]. Bu yönetmeliğe göre binalarda banyo, tuvalet ve benzeri kullanım alanlarının havalandırma bacası ile ya da mekanik havalandırma ile havalandırılması zorunludur (madde 32/9) [1]. Aynı yönetmelik, bağımsız bölümün tuvalet, banyo ve benzeri ıslak hacimlerinde mekanik havalandırma yapılmadığında yapılacak havalandırma penceresinin net 0,30 × 0,30 metreden küçük olamayacağını yazar (madde 39/6) [1]. Metin mekanik fanı tek yol olarak yazmaz, baca ya da mekanik havalandırma seçeneklerini birlikte sayar [1]. İlgili rehber: [Isı geri kazanım cihazı nedir, nasıl seçilir?](vh:yazi/isi-geri-kazanim-cihazi-nedir)

## Banyo fanı debisi için hangi ölçütler kullanılıyor?

Türkiye'de incelenen yönetmeliklerin gövde metninde banyo ve tuvalet fanı için debi değeri verilmez [1][2]; karşılaştırma için iki yurt dışı ölçüt kullanılır [3][4]. Home Ventilating Institute (HVI), 100 fit kareye (yaklaşık 9,3 m²) kadar olan banyoda fanın fit kare başına 1 CFM (m² başına yaklaşık 18,3 m³/h) hava sağlamasını önerir [4]. İngiltere'de (England) Approved Document F'in 1. cildi, aralıklı egzoz sistemleri için en düşük egzoz hızını banyo için 15 l/s, tuvalet için 6 l/s olarak Tablo 1.1'de verir [3]. Tuvalet için pencereyle havalandırma yönergesi alternatif olarak kullanılabilir; belge ayrıca daha az hava sızdırmaz konutlarda aralıklı egzoz fanlarının tüm ıslak hacimlere konmasını önerir (madde 1.47, rehber niteliğinde; kapsamı Tablo 1.6'da daha az hava sızdırmaz konut olarak verilir) [3].

İki ölçüt farklı birimde ve farklı mantıktadır: biri alan başına öneridir, öbürü en düşük egzoz hızıdır; bu yüzden yan yana okunamaz. HVI ABD kaynaklıdır, İngiltere belgesi yalnız İngiltere içindir; bu ölçütler Türkiye'de bağlayıcı değildir [3][4].

| Ölçüt | Değer | Geçerli olduğu yer | Kaynak |
|---|---|---|---|
| HVI banyo havalandırması önerisi | 100 ft²'ye (yaklaşık 9,3 m²) kadar olan banyoda ft² başına 1 CFM (m² başına yaklaşık 18,3 m³/h) [4] | Yer belirtilmemiş; ABD birimleriyle yazılmış sektör önerisi [4] | [4] |
| Approved Document F, Tablo 1.1 (banyo, aralıklı egzoz) | En az 15 l/s [3] | İngiltere (England) | [3] |
| Planlı Alanlar İmar Yönetmeliği, madde 32 ve 39 [1] | Gövde metninde debi değeri verilmez [1] | Türkiye (imar planlı alanlar) [1] | [1] |

## Banyo fanının sesi ve verimi hangi değerlerle anlatılır?

ABD'deki ENERGY STAR programının güncel ölçütleri, 10 ile 89 CFM (yaklaşık 17 ile 150 m³/h) arasındaki banyo ve yardımcı oda fanları için en az 2,8 CFM/W (W başına yaklaşık 4,8 m³/h) verim ve en çok 2,0 sone ses düzeyi ister; sone değeri belirli bir referans statik basınçtaki ölçüme bağlıdır [6]. ABD Enerji Bakanlığı, gürültülü havalandırma fanlarının verimli ve sessiz ENERGY STAR modelleriyle değiştirilmesini önerir [5]. Vortice'nin Punto Evo Flexo broşüründe ses basıncı 3 m uzaklıkta dB(A) olarak verilir: azami 90 m³/h debili bir modelde 26,9, azami 175 m³/h debili bir modelde 32,3 dB(A) [8]. Sone ile dB(A) farklı büyüklüklerdir. İlgili rehber: [Sessiz kanal fanı nasıl seçilir? dB(A) ve ses gücü](vh:yazi/sessiz-fan-secimi).

## Banyo fanı hangi kumanda türleriyle çalışır?

HVI, fanın banyo kullanıldıktan sonra 20 dakika açık bırakılmasını önerir [4]. Vortice'nin Residential Ventilation broşüründe Punto serisi için nem kumandalı ve hareket sensörlü çalışma biçimleri anlatılır: nem kumandalı modelde iç ortam bağıl nemi önceden ayarlanan değeri aştığında ürün otomatik açılır ve nem ayarlanan sınırın altına düştüğünde bir zamanlayıcı ürünü kapatır; hareket sensörlü modelde kişi odadan çıktıktan sonra ünite zamanlayıcı ayarına göre 3 ile 20 dakika çalışmaya devam eder [10]. VentHub'daki Punto Evo Flexo ailesinin dört modelinin hiçbirinde nem kumandası yoktur, ikisinde zamanlayıcı vardır ve hareket algılama model verisinde yer almaz [11].

## Geri akış panjuru ve koruma derecesi için üretici broşürleri ne yazar?

ABD Enerji Bakanlığı mutfak ve banyo tahliyelerinin doğrudan dışarıya gitmesini ve çatı arasına verilmemesi gerektiğini yazar [5]. Punto Evo Flexo, broşürüne göre dışarıya doğrudan ya da kısa kanallarla hava tahliyesi için tasarlanmış duvar tipi aksiyel fandır [8]. Punto Evo Flexo broşüründe fan kapalıyken istenmeyen hava girişini, Quadro Evo broşüründe kötü koku ve soğuk hava yayılmasını önleyen bir geri akış panjuru anlatılır [8][9].

Quadro Evo broşürüne göre çark nominal debilerde yüksek basınç düzeyleri sağlar [9]. Aynı serinin başka bir broşürü, odadan tahliye ağzına kadar izin verilen basınç kaybını çok katlı bir ortak ana kolon için verilen referans kurulumda (başlıca koşullar: 2,75 m oda yüksekliği, dirseksiz düz kanal, son üniteden çatı üstündeki çıkışa kanal en çok 1,5 m, tüm üniteler aynı anda çalışırken) 60 Pa olarak verir; bu değer o kurulumun koşullarına bağlıdır [9].

Quadro Evo broşürüne göre ürün, IP45 koruma derecesiyle banyonun 1. bölgesinde güvenli montaja uygundur [9].

## VentHub'da hangi banyo ve tuvalet fanı serileri var?

VentHub'ın [banyo ve tuvalet fanları](vh:kategori/bathroom-toilet-fans) kategorisinde dört aile bulunur [11]. [Punto Evo Flexo banyo fanları](vh:aile/vortice-punto-evo-flexo-banyo-fanlari) duvar ve tavan montajına uygun banyo-tuvalet aspiratörü olarak anlatılır [11]. [VORT Quadro Evo](vh:aile/vortice-vort-quadro-evo) duvar ya da tavan montajına uygun, bilyalı motorlu bir santrifüj kanal tipi fan olarak anlatılır [11]. [AVenS QE-B Kasa Serisi](vh:aile/avens-qe-b-kasa-serisi) gömme ya da duvar/tavan montajı için kullanılan temel fan kasası ve valf grubu olarak tanımlanır [11]. Dördüncü aile olan Bravo S ise fan değil, hava kalitesi sensörü olarak anlatılır [11].

## Teklif için hangi bilgiler gerekir?

İlgili ürün sayfalarında fiyat gösterilmez, teklif istenir [11]. Teklifte hazır bulundurulacak seçim girdileri şunlardır:

- Odanın alanı: HVI 100 fit kareye (yaklaşık 9,3 m²) kadar banyolarda alan başına, daha büyük banyolarda sıhhi tesisat elemanlarının sayısına ve türüne göre öneri verir [4].
- Montaj şekli: duvar, tavan ya da kanal bağlantısı kategori sayfasında anılır [11].
- Kanal uzunluğu ve çıkış: izin verilen basınç kaybı üretici ve kurulum referansına bağlıdır; Vortice'nin Quadro Evo değeri yalnız kendi referans kurulumu için verilmiştir [9].
- Kumanda tercihi: nem, zamanlayıcı ve hareket algılama [10].
- Ses beklentisi: sone ya da dB(A) ve ölçüm uzaklığı [6][8].
- Yerel gereksinim: baca, mekanik havalandırma ve pencere seçenekleri yönetmelikte yazılıdır [1].

## Sık sorulan sorular

### Banyo fanı kullanımdan sonra ne kadar açık kalmalı?

HVI, fanın banyo kullanıldıktan sonra 20 dakika açık bırakılmasını önerir [4]. Hareket sensörlü modelde ünite, kişi odadan çıktıktan sonra zamanlayıcı ayarına göre 3 ile 20 dakika çalışmaya devam eder [10].

### Banyo tahliyesi çatı arasına verilebilir mi?

ABD Enerji Bakanlığı mutfak ve banyo tahliyelerinin doğrudan dışarıya gitmesini ve çatı arasına verilmemesi gerektiğini yazar [5].

### Geri akış panjuru ne işe yarar?

Punto Evo Flexo broşüründe geri akış panjuru istenmeyen hava girişini, Quadro Evo broşüründe kötü koku ve soğuk hava yayılmasını önleyen parça olarak anlatılır [8][9].

### Spot havalandırma nedir?

ABD Enerji Bakanlığı spot havalandırmayı, yerel egzoz fanlarıyla kirleticileri ve nemi kaynağında hızla uzaklaştırma olarak tanımlar [5].

### Yönetmelik banyo ve tuvalet için fan mı pencere mi ister?

Yönetmelik mekanik fanı tek yol olarak yazmaz; Planlı Alanlar İmar Yönetmeliği banyo ve tuvaletin baca ya da mekanik havalandırmayla havalandırılmasını ister; bağımsız bölümün ıslak hacminde mekanik havalandırma yapılmadığında yapılacak pencere için net 0,30 × 0,30 metre alt sınırı vardır [1].

### VentHub'da hangi banyo ve tuvalet fanları var?

Kategoride iki fan ailesi, bir fan kasası serisi ve fan olmayan bir hava kalitesi sensörü ailesi (Bravo S) bulunur; teklif ürün sayfalarından istenir [11].

## Kaynaklar

1. Planlı Alanlar İmar Yönetmeliği, Resmî Gazete 03.07.2017, sayı 30113, madde 2, 32 ve 39; mevzuat.gov.tr, MevzuatNo=23722, güncel konsolide metin (erişim 08.11.2026).
2. Binalarda Enerji Performansı Yönetmeliği, Resmî Gazete 05.12.2008, sayı 27075, madde 17; mevzuat.gov.tr, MevzuatNo=13594, güncel konsolide metin (erişim 08.11.2026).
3. UK Government, Approved Document F: Ventilation, Volume 1: Dwellings, 2026 baskısı (24 Mart 2027'de, yüksek riskli bina işinde 24 Eylül 2027'de yürürlüğe girer) ve 2021 baskısı (15 Haziran 2022'de yürürlüğe girmiştir), Tablo 1.1 ve madde 1.47, England için. https://assets.publishing.service.gov.uk/media/6a9a918a01bbff0bf8f97e1b/Approved_Document_F__Volume_1_Dwellings.pdf , https://assets.publishing.service.gov.uk/media/61deba42d3bf7f054fcc243d/ADF1.pdf (erişim 08.11.2026)
4. Home Ventilating Institute (HVI), Bathroom Ventilation. https://www.hvi.org/resources/publications/bathroom-ventilation/ (erişim 08.11.2026)
5. U.S. Department of Energy, Energy Saver, Home Ventilation, s. 1 ve 2. https://www.energy.gov/sites/default/files/2021-08/ES-HomeVentilation_081021.pdf (erişim 08.11.2026)
6. ENERGY STAR, Ventilation Fans Key Product Criteria. https://www.energystar.gov/products/ventilation_fans/key_product_criteria (erişim 08.11.2026)
7. World Health Organization, WHO Guidelines for Indoor Air Quality: Dampness and Mould, 2009, PDF s. 6 ve basılı s. 51. https://iris.who.int/server/api/core/bitstreams/9261a374-7d3b-4825-a61e-0c09dea2af87/content (erişim 08.11.2026)
8. Vortice, Punto Evo Flexo konut havalandırma broşürü, s. 3, 4 ve 5.
9. Vortice, Quadro Evo konut havalandırma broşürleri (birinci broşür s. 3 ve 4; ikinci broşür s. 4 ve 13).
10. Vortice, Residential Ventilation broşürü (Punto serisi), s. 6.
11. VentHub, banyo ve tuvalet fanları kategori sayfası, Punto Evo Flexo, Quadro Evo ve QE-B kasa serisi ürün sayfaları ile Bravo S ürün sayfası (erişim 08.11.2026): https://venthub.com.tr/tr/category/banyo-tuvalet-fanlari , https://venthub.com.tr/tr/products/vortice-punto-evo-flexo-banyo-fanlari , https://venthub.com.tr/tr/products/vortice-vort-quadro-evo , https://venthub.com.tr/tr/products/avens-qe-b-kasa-serisi , https://venthub.com.tr/tr/products/vortice-bravo-s

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Yasal bilgi yayın tarihindeki metne aittir; yurt dışı kaynaklı ölçütler yalnız bilgi amaçlıdır. Elektrik bağlantısı ve montaj yetkili personelle yapılır; üretici beyanları üreticinin kendi belgelerindeki bilgilerdir. Ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-60), doğrulanmış metin: taslak v5 (sha 02362796975b). Kısa sektör sayfası (cetvel R3.3), okur gözüyle yeniden düzenlendi (R3.5, BLG-82): aile adları yalnız "VentHub'da hangi ATEX fan serileri var?" bölümünde ve Kaynaklar'da. JET serisi bu sürümde yazıdan çıkarıldı, ürün bağı metindeki iki aileye göre. Mevzuat paketi yok: Türkiye mevzuatı iddiası yok, yalnız ABD OSHA kuralları ve AB 1999/92/AT Direktifi. Fiyat yok.
    // Doğrulama: tuzaklı kopya 8/8, doğrulayıcı engelleyicileri kapatıldı, Gemini dil incelemesi cetvel R3.5 v ölçüsüyle işlendi (BLG-82); iddia tablosu kapıdan geçti (kırmızı 0).
    kimlik: 'boyahane-havalandirma-fani-secimi',
    konu: 'guvenlik',
    yayinTarihi: '2026-11-18',
    guncellemeTarihi: '2026-11-18',
    urunler: ['vh:aile/vortice-vorticent-cms-atex-santrifuj-fanlar', 'vh:aile/vortice-vort-e-atex-fanlar'],
    ilgiliKategoriler: [],
    diller: {
      tr: {
        slug: 'boyahane-havalandirma-fani-nasil-secilir',
        ozet: "Boyahane fanı seçerken egzoz havası miktarına, fan malzemesine ve topraklamaya, motor yerine ve elektrik donanımının patlayıcı ortama uygunluğuna bakılır.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Boyahane fanı seçerken egzoz havası miktarının, fan malzemesinin, motor yerinin ve patlayıcı ortam donanımının nasıl ele alındığını görmek için bu rehberden başlayın.",
        govde: `# Boyahane havalandırma fanı nasıl seçilir?

Boyahane havalandırma fanı seçilirken egzoz havasının miktarına, fanın malzemesine ve topraklanmasına, motorun yerine ve elektrik donanımının patlayıcı ortama uygunluğuna bakılır [2][3][4][5]. Hava miktarı ve motor yeri için ABD OSHA kuralları, donanım kategorisi için Avrupa Birliği'nin 1999/92/AT Direktifi hüküm koyar [2][4][5].

Kısaca:

- Hava miktarı: ABD OSHA kuralında kabinden atılan toplam hava, çözücü buharını alt patlama sınırının yüzde 25'ine seyreltecek kadar olmalıdır [2].
- Fan: yanıcı ortamlarda fanlar çoğunlukla demir dışı alaşımdan yapılır ve dönen parçalarıyla birlikte topraklanmalıdır [3].
- Motor: ABD kuralında yanıcı ve parlayıcı kaplama malzemesi püskürtülen kabinin ya da kanalın içine egzoz fanının motoru konmaz [5].
- Donanım: 1999/92/AT'de, patlamadan korunma belgesi aksini belirtmedikçe, Bölge (Zone) 1 için kategori 1 ya da 2, Bölge 2 için 1, 2 ya da 3 [4].

## Boyahane fanı seçiminde nelere bakılır?

| Konu | Dayanak | Hüküm ya da öneri |
|---|---|---|
| Hava miktarı | OSHA 1910.94 (ABD) | Çözücü buharı, alt patlama sınırının yüzde 25'ine seyreltilir [2] |
| Fan malzemesi | DOE/AMCA rehberi (ABD) | Çoğunlukla demir dışı alaşım; dönen parçalar dahil topraklama [3] |
| Fanın dönen elemanı | OSHA 1910.107 (ABD) | Yanıcı ve parlayıcı kaplama malzemesinin püskürtüldüğü işlemlerde demir dışı ya da kıvılcım çıkarmayan malzeme; ya da böyle bir malzemeden gövde veya kaplama [5] |
| Motor ve kayış | OSHA 1910.107 (ABD) | Yanıcı ve parlayıcı kaplama malzemesinin püskürtüldüğü kabinlerde motor kabin ve kanalın dışında; kayış, kayış ve kasnak kapatılmadıkça kabine ya da kanala girmez [5] |
| Kabin ve kanal | OSHA 1910.94 (ABD) | Yapımda yanıcı malzeme kullanılmaz [2] |
| Elektrik donanımı | OSHA 1910.107 (ABD) | Püskürtme alanında ve yanıcı kalıntı birikintisine maruz değilse, patlamaya dayanıklı tip [5] |
| Donanım kategorisi | 1999/92/AT Direktifi (AB) | Patlamadan korunma belgesi aksini belirtmedikçe Bölge 1'de kategori 1 ya da 2, Bölge 2'de 1, 2 ya da 3 [4] |

## Kirleticinin özellikleri neden havalandırma tasarımında önemlidir?

Toz, duman ve sis gibi proses kirleticileri aşındırıcı, yapışkan ya da yoğuşabilir olabilir, bazıları da yanıcı olabilir; İngiltere'nin Health and Safety Executive (HSE) kurumunun rehberine göre yerel havalandırmanın tasarımını bu özellikler belirler [1].

Seyrelmesi engellenen buhar-hava karışımı, örneğin kapalı bir alana aktığında, çöker; zehirli bir risk, malzemeye göre de yanıcı bir risk doğurabilir [1]. Çoğu işyerinde ise hava hareketi ve cereyan doymuş buhar-hava karışımını hızla seyreltir [1].

İlgili rehber: [Asit fanı nedir? Korozyona ve kimyasala dayanıklı fan nasıl seçilir](vh:yazi/asit-fani-nedir-korozyona-dayanikli-fan-secimi)

## Boyahane egzoz havası ne kadar olmalı?

ABD İş Sağlığı ve Güvenliği İdaresi'nin (OSHA) püskürtme kabinlerine ilişkin kuralında, kabinden atılan toplam hava hacmi çözücü buharını püskürtülen çözücünün alt patlama sınırının yüzde 25'ine seyreltecek büyüklükte olmalıdır [2]. Yeterli bir hava ikame sistemi bulunmayan kabinlerde kural, kabin açıklıklarından içeri giren havanın hızı için de asgari değerler verir [2].

## Boyahane fanının malzemesi ve motoru nasıl olmalı?

ABD Enerji Bakanlığı (DOE) ile AMCA International'ın 2003 tarihli ortak rehberine göre yanıcı ortamlarda fanlar, metalin metale temasından doğan kıvılcım riskini azaltmak için çoğunlukla demir dışı alaşımlardan yapılır; bazı uygulamalarda fanın belirli parçaları kıvılcıma dayanıklı malzemeden üretilebilir [3]. Statik deşarj kıvılcımını azaltmak için fan, dönen parçaları dahil topraklanmalıdır [3].

OSHA'nın 1910.107 numaralı kuralında, yanıcı ve parlayıcı kaplama malzemesinin püskürtüldüğü işlemlerde fan ve motor için şu hükümler vardır: fanın dönen elemanı demir dışı ya da kıvılcım çıkarmayan malzemeden olmalı veya gövde böyle bir malzemeden olmalı ya da onunla kaplanmalıdır; egzoz fanlarını çalıştıran elektrik motorları kabinin ya da kanalların içine konmaz; kayış, kayış ve kasnak tamamen kapatılmadıkça kabine ya da kanala girmez [5]. 1910.107 püskürtme alanını yanıcı buhar ya da sisin ya da yanıcı kalıntı, toz ve birikintilerin tehlikeli miktarda bulunduğu alan olarak tanımlar; bu alanda bulunan ve yanıcı kalıntı birikintisine maruz olmayan elektrik tesisatı ve donanımı patlamaya dayanıklı tipte olmalıdır [5].

OSHA'nın 1910.94 kuralında püskürtme kabininin ve ona bağlı besleme ve egzoz kanalının yapımında yanıcı malzeme kullanılmaz [2].

## Boyahanede bölge ve donanım kategorisi nasıl eşleşir?

Yanıcılık tehlikesi olan yerde yerel havalandırmanın tasarımı, bölgeleme ve patlama tahliyesi gibi konuları da hesaba katmalıdır [1]. Avrupa Birliği'nin 1999/92/AT sayılı Direktifinin Ek II B bölümüne göre patlayıcı atmosfer oluşabilecek yerlerde donanım ve koruyucu sistemler, patlamadan korunma belgesi aksini belirtmiyorsa, kategorilere göre seçilir: Bölge 1'de kategori 1 ya da 2, Bölge 2'de kategori 1, 2 ya da 3 donanım [4].

İlgili rehber: [Patlayıcı ortamda fan seçimi: ATEX, bölge ve kategori nedir?](vh:yazi/patlayici-ortamda-fan-secimi-atex)

## VentHub'da hangi ATEX fan serileri var?

VentHub aile sayfalarına göre [Vorticent CMS ATEX](vh:aile/vortice-vorticent-cms-atex-santrifuj-fanlar) serisinde 12/5 T4 ve 14/5 T4 (0,09 kW) modelleri fan için Ex h IIB+H2 T4 Gb, motor için Ex eb IIC T4 Gb işaretiyle Bölge 1'e; 14/5 T2 (0,25 kW), 16/6 T2, 22/9 T4, 25/10 T4, 28/11 T4, 31/12 T4, 35/14 T4, 40/16 T4 ve 45/18 T4 modelleri fan için Ex h IIB T3 Gc, motor için Ex ec IIC T3 Gc işaretiyle Bölge 2'ye uygundur [6]. Seri −20 °C ile 40 °C ortam sıcaklığı aralığında, toz içermeyen temiz hava taşımaya uygundur [6]. Bu koşul toz içeren havayı kapsamaz [6]. [VORT-E ATEX](vh:aile/vortice-vort-e-atex-fanlar) serisindeki 40320 modeli, patlayıcı toz ve gaz içeren (ATEX II 2G/D h T3/125°C X Gb/Db) ortamların havalandırılması için tasarlanmış ex-proof aksiyel sanayi fanıdır [6].

İlgili rehber: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Teklif için hangi bilgiler gerekir?

Teklif, aile sayfalarındaki "Teknik Teklif İste" düğmesiyle istenir [6]. Seçimde kullanılan bilgiler:

- Çözücü: püskürtülen çözücü, alt patlama sınırı, birim çözücü miktarının buhar hacmi ve dakikada buharlaşan çözücü miktarı; OSHA kuralındaki hava debisi bunlardan hesaplanır [2].
- Sistem koşulları: hava özellikleri, debi, basınç ve sistem yerleşimi [3].
- Alanın bölgesi: donanım kategorisi bölgeye göre seçilir [4].

İlgili rehber: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

## Sık sorulan sorular

### HSE rehberinde boya püskürtme kabini hangi muhafaza türüne örnek verilir?

HSE rehberinde boya püskürtme kabini, operatörü ve işlemi tamamen çevreleyen oda tipi muhafazalara verilen adlardan biri olarak geçer [1].

### Boyahane fanı ATEX olmak zorunda mı?

Alanda patlayıcı atmosfer oluşabiliyorsa AB'de evet: 1999/92/AT, patlamadan korunma belgesi aksini belirtmedikçe, donanımın bölgeye uygun kategoride seçilmesini ister [4].

### Boyahane egzozunda hava miktarı nasıl belirlenir?

ABD OSHA kuralında atılan toplam hava, püskürtülen çözücünün buharını alt patlama sınırının yüzde 25'ine seyreltecek kadar olmalıdır [2].

### Boyahane kanalı hangi malzemeden yapılmamalı?

ABD OSHA kuralına göre yanıcı malzemeden yapılmamalıdır [2].

### Yanıcı ortamda fan neden demir dışı alaşımdan yapılır?

Demir dışı alaşım, metalin metale temasından doğan kıvılcım riskini azaltmak için kullanılır [3].

## Kaynaklar

1. UK Health and Safety Executive (HSE), HSG258 Controlling airborne contaminants at work: A guide to local exhaust ventilation (LEV), 3. baskı, 2017, ¶44, ¶47, ¶48, ¶49, ¶110. https://books.hse.gov.uk/gempdf/hsg258.pdf (erişim 08.11.2026)
2. U.S. Occupational Safety and Health Administration, 29 CFR 1910.94(c) Spray finishing operations, (c)(3)(i)(b), (c)(6)(i), (c)(6)(ii); GPO CFR 2024 baskısı. https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol5/xml/CFR-2024-title29-vol5-sec1910-94.xml (erişim 08.11.2026)
3. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, Nisan 2003, basılı s. 4, 5 ve 17. https://www.energy.gov/sites/prod/files/2014/05/f16/fan_sourcebook.pdf (erişim 08.11.2026)
4. Avrupa Parlamentosu ve Konseyi, 1999/92/AT sayılı Direktif (16 Aralık 1999), Ek II B (donanım seçimi ölçütleri), EUR-Lex. https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:31999L0092 (erişim 09.11.2026)
5. U.S. Occupational Safety and Health Administration, 29 CFR 1910.107 Spray finishing using flammable and combustible materials, (a)(2) spraying area tanımı, (c)(6) elektrik tesisatı hükmü ve (d)(4), (d)(5), (d)(6) fan dönen elemanı, elektrik motoru ve kayış hükümleri, (n) kapsam; GPO CFR 2024 baskısı. https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol5/xml/CFR-2024-title29-vol5-sec1910-107.xml (erişim 18.11.2026)
6. VentHub, Vorticent CMS ATEX ve VORT-E ATEX aile sayfaları: https://venthub.com.tr/tr/products/vortice-vorticent-cms-atex-santrifuj-fanlar , https://venthub.com.tr/tr/products/vortice-vort-e-atex-fanlar (erişim 18.11.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Aktarılan kurallar yayın tarihindeki hâlleriyle verilmiştir ve Türkiye'deki yükümlülüklerin yerini tutmaz. Patlayıcı ortamda kullanılacak ekipmanın uygunluğu üreticinin teknik belgeleri ve yetkili uzman değerlendirmesiyle doğrulanmalıdır. Montaj ve elektrik bağlantısı yetkili personelle yapılır; ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-64), doğrulanmış metin: taslak v5 (sha 71e97cf912da). Kısa sektör sayfası (cetvel R3.3), okur gözüyle yeniden düzenlendi (R3.5, BLG-82): aile adları Kısaca maddesinde, "VentHub'da hangi endüstriyel havalandırma fanı serileri var?" bölümünde, son SSS cevabında ve Kaynaklar'da. Mevzuat paketi yok: Türkiye mevzuatı iddiası yok. Fiyat yok, debi yok.
    // Doğrulama: tuzaklı kopya 8/8, doğrulayıcı engelleyicileri kapatıldı, Gemini dil incelemesi cetvel R3.5 v ölçüsüyle işlendi (BLG-82); iddia tablosu kapıdan geçti (kırmızı 0).
    kimlik: 'atolye-havalandirma-fani-secimi',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-18',
    guncellemeTarihi: '2026-11-18',
    urunler: ['vh:aile/vortice-aksiyel-endustriyel-fanlar', 'vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar'],
    ilgiliKategoriler: [],
    diller: {
      tr: {
        slug: 'atolye-havalandirma-fani-nasil-secilir',
        ozet: "Atölye havalandırma fanı seçimi, havanın nem, sıcaklık, yoğunluk ve kirlilik düzeyi ile debi, basınç ve sistem yerleşimi bilinerek başlar.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Atölye fanı seçerken havalandırma ile zararlı maddelerin havadan uzaklaştırılmasının nasıl ayrıldığını görmek için bu rehberden başlayın.",
        govde: `# Atölye havalandırma fanı nasıl seçilir?

Atölye havalandırma fanı seçimi; taşınacak havanın nem, sıcaklık, yoğunluk ve kirlilik düzeyi gibi özellikleri, gereken hava debisi, basınç ve sistem yerleşimi bilinerek başlar [1]. Kaynak dumanı ve proseslerin ürettiği toz gibi zararlı maddelerin havadan uzaklaştırılması ise HSE'nin işyeri havalandırması rehberinin kapsamı dışındadır [2].

Kısaca:

- Havalandırma: HSE'ye göre havalandırma doğal yolla kapı, pencere ve diğer açıklıklardan, mekanik yolla fanlarla yapılır [2].
- VentHub aileleri: Vortice aksiyel endüstriyel fanlar ticari ve endüstriyel hacimlerin havalandırması için, Nicotra Gebhardt RDH radyal (santrifüj) fanlar ticari ve endüstriyel sistemlerde taze hava ve egzoz uygulamaları için tasarlanmıştır [3].
- Teklif: aile sayfalarındaki "Teknik Teklif İste" düğmesiyle istenir [3].

## Atölyede havalandırma ile zararlı maddelerin havadan uzaklaştırılması nasıl ayrılır?

HSE'nin işyeri havalandırması rehberinde havalandırma, dışarıdan temiz hava getirme ve iç havayı uzaklaştırma işlemidir; kaynak dumanı ve proseslerin ürettiği toz gibi zararlı maddelerin havadan uzaklaştırılması için rehber COSHH (Control of Substances Hazardous to Health Regulations) ile yerel egzoz havalandırması rehberlerine yönlendirir [2].

| İhtiyaç | HSE'de karşılığı [2] |
|---|---|
| Dışarıdan temiz hava getirmek, iç havayı uzaklaştırmak | İşyeri havalandırması rehberi; havalandırma doğal yolla ya da fanla mekanik yolla yapılır |
| Kaynak dumanı ve proses tozu gibi zararlı maddeleri havadan uzaklaştırmak | COSHH ve yerel egzoz havalandırması rehberleri |

İlgili rehber: [Boyahane havalandırma fanı nasıl seçilir?](vh:yazi/boyahane-havalandirma-fani-secimi)

## VentHub'da hangi endüstriyel havalandırma fanı serileri var?

Aksiyel fanlar santrifüj fanlarla zaman zaman birbirinin yerine kullanılabilse de çoğunlukla temiz havada, düşük basınçlı ve yüksek debili uygulamalarda kullanılır [1]. Santrifüj fanlar ise yüksek basıncı yüksek verimle üretebilir ve zorlu çalışma koşullarına uygun yapılabilir [1].

VentHub ailelerinden örnekler şunlardır. [Vortice aksiyel endüstriyel fanlar](vh:aile/vortice-aksiyel-endustriyel-fanlar), ticari ve endüstriyel hacimlerin havalandırması için tasarlanmış duvar tipi bir endüstriyel aksiyel fan ailesidir; farklı çaplarda, monofaze ve trifaze sürümleri bulunur [3]. [Nicotra Gebhardt RDH radyal fanlar](vh:aile/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar) ise ticari ve endüstriyel sistemlerde taze hava ve egzoz uygulamaları için özel olarak tasarlanmıştır [3].

İlgili rehber: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Teklif için hangi bilgiler gerekir?

Teklif, aile sayfalarındaki "Teknik Teklif İste" düğmesiyle istenir [3]. Fan seçiminin dayandığı çalışma koşulları şunlardır:

- Taşınacak havanın özellikleri: nem, sıcaklık, yoğunluk ve kirlilik düzeyi gibi [1].
- Gereken hava debisi [1].
- Basınç [1].
- Sistem yerleşimi [1].

İlgili rehber: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

## Sık sorulan sorular

### Havalandırmada uzaklaştırılan iç hava nasıl olabilir?

HSE'ye göre iç hava bayat olabilir, iş makineleri ve prosesler yüzünden sıcak ve nemli olabilir ya da kirletici ve başka safsızlıklar içerebilir [2].

### Mekanik havalandırma nedir?

Mekanik havalandırma, havayı fanlarla odalara veren ve odalardan alan havalandırmadır [2]. Küçük alanlarda ve binalarda fanlar odanın içinde olabilir; büyük binalarda kanal ve fan ağıyla odalara temiz hava üflenebilir ve/veya bayat hava çekilebilir [2].

### Doğal ve mekanik havalandırma farkı nedir?

Doğal havalandırma havayı kapılardan, pencerelerden ve menfez ya da ızgara gibi diğer açıklıklardan sağlar; mekanik havalandırma fan kullanır [2]. Birçok binada ikisi bir arada, farklı alanlarda kullanılır [2].

### Atölye fanı aksiyel mi radyal mi seçilir?

Bunu sistemin çalışma koşulları belirler: havanın özellikleri, hava debisi, basınç ve sistem yerleşimi, santrifüj ya da aksiyel fandan hangisinin gerektiğini gösterir [1].

### VentHub'da endüstriyel havalandırma için hangi fan aileleri var?

Örnekler Vortice aksiyel endüstriyel fanlar ile Nicotra Gebhardt RDH radyal fanlardır; teklif aile sayfalarındaki "Teknik Teklif İste" düğmesiyle istenir [3].

## Kaynaklar

1. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, Nisan 2003, basılı s. 4, 17 ve 19. https://www.energy.gov/sites/prod/files/2014/05/f16/fan_sourcebook.pdf (erişim 18.11.2026)
2. UK Health and Safety Executive (HSE), Ventilation in the workplace, Overview. https://www.hse.gov.uk/ventilation/index.htm (erişim 18.11.2026)
3. VentHub, Vortice aksiyel endüstriyel fanlar ve Nicotra Gebhardt RDH radyal fanlar aile sayfaları (erişim 18.11.2026): https://venthub.com.tr/tr/products/vortice-aksiyel-endustriyel-fanlar , https://venthub.com.tr/tr/products/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Montaj ve elektrik bağlantısı yetkili personelle yapılır. Ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-65), doğrulanmış metin: taslak v7 (sha 9177cf4fa3e7). Kısa sektör sayfası (cetvel R3.3), okur gözüyle yeniden düzenlendi (R3.5, BLG-82). Ürün bağları metindeki üç aileye göre: Hyperblade, aksiyel endüstriyel, Slimroof; önceki sürümdeki 61181 modeli metinden çıktı. Mevzuat paketi yok: Türkiye mevzuatı iddiası yok. Fiyat yok.
    // Doğrulama: tuzaklı kopya 8/8, doğrulayıcı engelleyicileri kapatıldı, Gemini dil incelemesi cetvel R3.5 v ölçüsüyle işlendi (BLG-82); iddia tablosu kapıdan geçti (kırmızı 0).
    kimlik: 'depo-havalandirma-fani-secimi',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-18',
    guncellemeTarihi: '2026-11-18',
    urunler: ['vh:aile/vortice-nordik-hvls-hyperblade', 'vh:aile/vortice-aksiyel-endustriyel-fanlar', 'vh:aile/vortice-slimroof-cati-fanlari'],
    ilgiliKategoriler: ['vh:kategori/industrial-ceiling-fans', 'vh:kategori/axial-industrial-fans', 'vh:kategori/roof-fans'],
    diller: {
      tr: {
        slug: 'depo-havalandirma-fani-nasil-secilir',
        ozet: "Depoda fan seçimi işe bağlıdır: havalandırma temiz hava getirip iç havayı uzaklaştırır, endüstriyel tavan vantilatörü içerideki havayı karıştırır.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Depoda havalandırma fanı ile endüstriyel tavan vantilatörünün farkını ve hangi ürün grubunun hangi işe uyduğunu görmek için bu rehberden başlayın.",
        govde: `# Depo havalandırma fanı nasıl seçilir?

Depoda fan seçimi önce yapılacak işe bağlıdır: havalandırma dışarıdan temiz hava getirip iç havayı uzaklaştırır [3], endüstriyel (büyük çaplı) tavan vantilatörü ise havayı dışarı atmadan içerideki havayı karıştırır [2]. Seçimi belirleyen sorular arasında tavan vantilatöründe tavan yüksekliği, kapsanacak alan ve asma noktasının taşıma kapasitesi, duvar tipi aksiyel ve çatı tipi fanda gereken debi vardır [2][4].

Kısaca:

- Havalandırma: Mekanik havalandırma havayı odalara vermek ve odalardan almak için fan kullanır; büyük binalarda kanal ve fan ağı kullanılabilir [3].
- Tavan vantilatörü: Endüstriyel tavan vantilatörü yazın serinlik hissi verir, kışın tavanda biriken sıcak havayı aşağı indirir [2].
- Seriler: VentHub'da endüstriyel tavan vantilatörleri kategorisinde Vortice Nordik HVLS Hyperblade ailesi ve 7 modeli bulunur [2].

## Depoda havalandırma ile hava karıştırma farkı nedir?

Havalandırmayla uzaklaştırılan iç hava bayat olabilir, makineler ve süreçler yüzünden sıcak ve nemli olabilir ya da kirletici içerebilir [3]. Mekanik havalandırmada fanlar havayı odalara verir ve odalardan alır; küçük alanlarda fan odanın içinde olabilir, büyük binalarda kanal ve fan ağı kullanılabilir [3].

| İş | Ne yapar | VentHub'da ürün grubu |
|---|---|---|
| Havalandırma (hava verme ve alma) | Dışarıdan temiz hava getirir, iç havayı uzaklaştırır [3] | Duvar tipi aksiyel fanlar (havalandırma için tasarlanmış) ve havayı binanın en üstünden dışarı atan çatı tipi fanlar [4] |
| Hava karıştırma | Havayı dışarı atmadan içerideki havayı karıştırır [2] | Endüstriyel tavan vantilatörleri [2] |

VentHub'daki duvar tipi aksiyel fanlar düşük ve orta basınçlı serilerdir ve spor salonu gibi ticari ve endüstriyel hacimlerin havalandırması için tasarlanmıştır [4].

İlgili rehberler: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi), [Çatı tipi fan nedir, nasıl seçilir?](vh:yazi/cati-tipi-fan-nedir)

## Endüstriyel tavan vantilatörü depoda ne işe yarar?

Endüstriyel tavan vantilatörleri, büyük hacimlerde havayı yavaş ama çok geniş bir alanda hareket ettiren büyük çaplı vantilatörlerdir; depo, spor salonu, fabrika ve showroom bunların tipik uygulamalarıdır [2]. Etkileri mevsime göre değişir:

| Mevsim | Endüstriyel tavan vantilatörünün etkisi [2] |
|---|---|
| Yaz | İçerideki havayı karıştırarak serinlik hissi verir |
| Kış | Tavanda biriken sıcak havayı aşağı indirir |

Çok sıcak havalarda iş yerinde ısı stresi riski artabilir; sıcaklığı kontrol etmenin örnek yolları arasında fan ya da klima kullanmak da sayılır [1].

## VentHub'da hangi depo havalandırma fanı serileri var?

[Endüstriyel tavan vantilatörleri](vh:kategori/industrial-ceiling-fans) kategorisinde [Vortice Nordik HVLS Hyperblade](vh:aile/vortice-nordik-hvls-hyperblade) ailesi bulunur [2]. Ailenin 7 modeli fırçasız EC motorlu, 5 kanatlı tavan vantilatörleridir; nominal kanat çapı 3,0 m ile 7,0 m arasındadır [2]. 3,0 m ve 4,0 m modellerin monofaze ve trifaze sürümü, 5,0 m, 6,0 m ve 7,0 m modellerin trifaze sürümü vardır; maksimum debi 79.400–330.800 m³/h aralığındadır [2].

Havalandırma için [aksiyel fanlar](vh:kategori/axial-industrial-fans) kategorisinde 16 modelli [Vortice aksiyel endüstriyel fanlar](vh:aile/vortice-aksiyel-endustriyel-fanlar) ailesi bulunur; maksimum debi 1.850–14.500 m³/h aralığındadır [4]. Patlayıcı ortam (ATEX) gerektiren uygulamalar için kategoride ayrı bir aile vardır [4]. [Çatı tipi fanlar](vh:kategori/roof-fans) kategorisinde [Vortice Slimroof çatı fanları](vh:aile/vortice-slimroof-cati-fanlari) ailesi bulunur [4].

İlgili rehberler: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri), [Patlayıcı ortamda fan seçimi: ATEX, bölge ve kategori nedir?](vh:yazi/patlayici-ortamda-fan-secimi-atex)

## Teklif için hangi bilgiler gerekir?

Aile sayfalarında teklif "Teknik Teklif İste" düğmesiyle istenir [2][4]. Ürün grubuna göre seçimi belirleyen sorular şunlardır:

- Endüstriyel tavan vantilatörü: tavan yüksekliği, kapsanacak alan ve asma noktasının taşıma kapasitesi [2]
- Aksiyel fan: gereken debi, fanın nominal çapı ve ortamda gaz ya da toz kaynaklı patlama riskinin bulunup bulunmadığı [4]
- Çatı tipi fan: çatı tipi ve eğimi, gereken debi ve tahliye edilen havanın niteliği [4]

## Sık sorulan sorular

### Endüstriyel tavan vantilatörü depoda havalandırmanın yerini tutar mı?

Hayır; endüstriyel tavan vantilatörü havayı dışarı atmaz, içerideki havayı karıştırır [2]. Havalandırma ise dışarıdan temiz hava getirip iç havayı uzaklaştırır [3].

### Endüstriyel tavan vantilatörü kışın işe yarar mı?

Evet; tavanda biriken sıcak havayı aşağı indirir [2].

### Doğal havalandırma ile mekanik havalandırma arasındaki fark nedir?

Doğal havalandırma havayı kapı, pencere ve ızgara gibi açıklıklardan sağlar; mekanik havalandırma havayı fanla içeri verir ve dışarı çıkarır [3]. Birçok binada ikisi birlikte bulunur [3].

### İyi havalandırma hangi sonuçlarla ilişkilendirilir?

Araştırmalar iyi havalandırmayı daha iyi sağlık, daha iyi konsantrasyon, ortamdan daha yüksek memnuniyet, işe daha düşük devamsızlık ve birçok hava kirleticisine daha az maruziyetle ilişkili bulmuştur [3].

### İş yerinde ısı stresine karşı sıcaklık nasıl kontrol edilir?

Isı kaynakları mümkünse kaldırılır ya da azaltılır ve sıcaklık mühendislik çözümleriyle kontrol edilir: süreçleri değiştirmek, fan ya da klima kullanmak ve makine gibi kaynakların ışınım ısısına karşı fiziksel engel koymak bunlara örnektir [1].

## Kaynaklar

1. UK Health and Safety Executive (HSE), Temperature in the workplace: Heat stress, https://www.hse.gov.uk/temperature/employer/heat-stress.htm (erişim 18.11.2026)
2. VentHub, Endüstriyel Tavan Vantilatörleri kategori sayfası ve Vortice Nordik HVLS Hyperblade aile sayfası: https://venthub.com.tr/tr/category/tavan-vantilatorleri , https://venthub.com.tr/tr/products/vortice-nordik-hvls-hyperblade (erişim 18.11.2026)
3. UK Health and Safety Executive (HSE), Ventilation in the workplace: Overview, https://www.hse.gov.uk/ventilation/index.htm (erişim 18.11.2026)
4. VentHub, Aksiyel Fanlar ve Çatı Tipi Fanlar kategori sayfaları ve Vortice Aksiyel Endüstriyel Fanlar aile sayfası: https://venthub.com.tr/tr/category/aksiyel-fanlar , https://venthub.com.tr/tr/category/cati-tipi-fanlar , https://venthub.com.tr/tr/products/vortice-aksiyel-endustriyel-fanlar (erişim 18.11.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Havalandırma ve ısı stresi bilgisi İngiltere Sağlık ve Güvenlik İdaresi'nin (HSE) rehberlerine dayanır; Türkiye'deki yasal yükümlülüklerin yerini tutmaz. Montaj ve elektrik bağlantısı yetkili personelle yapılır. Ürün bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-66), doğrulanmış metin: taslak v5 (sha 5864ff24e83c). Okur gözüyle yeniden düzenlendi (R3.5, BLG-82); H1 "Demir çelik tesislerinde ısı kontrolü ve havalandırma nasıl sağlanır?" oldu, adres (slug) ve kimlik değişmedi. Markasız gövde: VentHub'ın dört fan kategorisi "VentHub'da hangi fan serileri var?" bölümünde anılır, ürün (aile) bağı yok (urunler boş). Kaynaklar OSHA, HSE, DOE/AMCA ve VentHub kategori sayfaları. Mevzuat paketi yok: Türkiye mevzuatı iddiası yok. Fiyat yok, debi yok.
    // Doğrulama: tuzaklı kopya 8/8, doğrulayıcı engelleyicileri kapatıldı, Gemini dil incelemesi cetvel R3.5 v ölçüsüyle işlendi (BLG-82); iddia tablosu kapıdan geçti (kırmızı 0).
    kimlik: 'demir-celik-isi-kontrolu-havalandirma',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-18',
    guncellemeTarihi: '2026-11-18',
    urunler: [],
    ilgiliKategoriler: ['vh:kategori/industrial-ceiling-fans', 'vh:kategori/axial-industrial-fans', 'vh:kategori/centrifugal-fans', 'vh:kategori/roof-fans'],
    diller: {
      tr: {
        slug: 'demir-celik-tesisi-isi-kontrolu-havalandirma-kaynaklari',
        ozet: "Demir çelik tesislerinde ısıya maruziyet, OSHA'nın sıraladığı mühendislik kontrolleriyle azaltılabilir: genel havalandırma, soğutma fanları, yerel egzoz.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Demir çelik tesislerinde ısıya maruziyeti azaltan önlemleri ve VentHub'daki fan kategorilerini görmek için bu rehberden başlayın.",
        govde: `# Demir çelik tesislerinde ısı kontrolü ve havalandırma nasıl sağlanır?

Demir çelik tesislerinde ısıya maruziyet, OSHA'nın iş yerleri için sıraladığı mühendislik kontrolleriyle azaltılabilir: genel havalandırmayı artırmak, soğutma fanları, yüksek ısı ya da nem üretilen noktalarda yerel egzoz havalandırması, fırın duvarları gibi sıcak yüzeylerin yalıtımı ve ışınımlı ısıyı başka yöne çeviren yansıtıcı kalkanlar [2]. Demir çelik tesisleri ve dökümhaneler, kapalı alanda tehlikeli ısı maruziyetinin görülebildiği işler arasındadır [1].

Kısaca:

- Isı önlemleri: Süreçleri değiştirmek ve fan ya da klima kullanmak da sıcaklık kontrolü örnekleridir [3].
- Çalışma uygulamaları: Mühendislik kontrolleriyle serinletilemeyen yerlerde ısı stresi güvenli çalışmaya izin vermeyecek kadar yükselirse çalışma uygulamalarının değiştirilmesi önerilir [2].
- Fan serileri: VentHub'ın radyal (santrifüj) fanlar kategorisindeki fanlar aksiyel fanlara göre daha yüksek basınç üretir [5].
- Teklif: Fan seçimi hava özellikleri, hava debisi, basınç ve sistem yerleşimi bilinerek başlar [4].

## Demir çelik tesislerinde ısıya maruziyet hangi önlemlerle azaltılabilir?

OSHA'nın ve HSE'nin iş yerleri için verdiği listelerde yer alan önlemler şunlardır:

| Önlem | Nerede ya da nasıl | Kaynak |
|---|---|---|
| Genel havalandırmayı artırmak, soğutma fanları, klima | Mühendislik kontrolleri listesinde; klima örnekleri vinç ve inşaat ekipmanı kabinleri ile dinlenme odaları | [2] |
| Yerel egzoz havalandırması | Yüksek ısı ya da nem üretilen noktalarda | [2] |
| Püskürtmeli fanlar | İnce su damlacıkları püskürtür | [2] |
| Yansıtıcı kalkan | Işınımlı ısıyı başka yöne çevirir | [2] |
| Sıcak yüzey yalıtımı | Fırın duvarları gibi sıcak yüzeylerde | [2] |
| Süreci değiştirmek, fan ya da klima kullanmak | Sıcaklığı mühendislik çözümleriyle kontrol etme örnekleri | [3] |
| Fiziksel engeller | Işınımlı ısıya maruziyeti azaltır | [3] |

Bazı çalışma yerleri mühendislik kontrolleriyle serinletilemez; bu yerlerde ısı stresi güvenli çalışmaya izin vermeyecek kadar yükselirse çalışma uygulamalarının değiştirilmesi önerilir [2].

İlgili rehber: [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Demir çelik tesislerinde tehlikeli ısı maruziyeti görülür mü?

Evet. OSHA'nın ısı tablosunda kapalı alanda tehlikeli ısı maruziyetinin görülebildiği işler arasında demir çelik tesisleri ve dökümhaneler yer alır; tehlikeli ısı maruziyeti kapalı ya da açık alanda görülebilir [1]. HSE de dökümhaneleri ve izabe işlemlerini ısı stresinin görülebildiği iş yerlerine örnek verir [3].

## VentHub'da hangi fan serileri var?

VentHub'ın dört fan kategorisi sayfasındaki tanımlar şunlardır:

- [Endüstriyel tavan vantilatörleri](vh:kategori/industrial-ceiling-fans): büyük hacimlerde havayı yavaş ama çok geniş bir alanda hareket ettiren büyük çaplı tavan vantilatörleri; havayı dışarı atmaz, içerideki havayı karıştırır [5].
- [Aksiyel fanlar](vh:kategori/axial-industrial-fans): duvara monte edilen, düşük ve orta basınçlı, ticari ve endüstriyel hacimlerin havalandırması için tasarlanmış fanlar [5].
- [Radyal fanlar](vh:kategori/centrifugal-fans): havayı çarkın çevresine doğru fırlatarak basan, aksiyel fanlara göre daha yüksek basınç üreten fanlar; uzun kanal hatları, filtreli sistemler ve hücreli tesisatlar için tercih edilir [5].
- [Çatı tipi fanlar](vh:kategori/roof-fans): havayı binanın en üstünden dışarı atan, çatıya oturan fanlar [5].

İlgili rehber: [Çatı tipi fan nedir, nasıl seçilir?](vh:yazi/cati-tipi-fan-nedir)

## Teklif için hangi bilgiler gerekir?

ABD Enerji Bakanlığı kılavuzuna göre fan seçimi, sistemin çalışma koşullarını bilerek başlar [4]:

- Hava özellikleri: nem, sıcaklık, yoğunluk, kirlilik düzeyi gibi
- Hava debisi
- Basınç
- Sistem yerleşimi

Bu kategori sayfalarında her ürün ailesinin yanında "Teklif İste" düğmesi bulunur [5].

İlgili rehber: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

## Sık sorulan sorular

### Tehlikeli ısı yalnız sıcak hava dalgalarında mı görülür?

Hayır. OSHA'ya göre tehlikeli ısı maruziyeti, koşullar uygunsa yalnız sıcak hava dalgalarında değil, her mevsimde görülebilir [1].

### Mühendislik kontrolleriyle serinletilemeyen çalışma yerinde ne yapılır?

Isı stresi güvenli çalışmaya izin vermeyecek kadar yükselirse OSHA çalışma uygulamalarının değiştirilmesini önerir [2].

### Dökümhanelerde ısı stresine yol açan sıcak ortam nereden kaynaklanır?

HSE'ye göre bu iş yerlerinde sıcak ortam süreçten ya da kısıtlı alanlardan kaynaklanır; dökümhaneler ve izabe işlemleri örnekler arasındadır [3].

### Isıya karşı klima hangi yerlerde kullanılır?

OSHA'nın mühendislik kontrolleri listesinde klima için verilen örnekler klimalı vinç ve inşaat ekipmanı kabinleri ile dinlenme odalarıdır [2].

### VentHub'da radyal fan seçimini hangi sorular belirler?

VentHub'ın radyal fanlar kategori sayfası gereken basıncı, fanın bir hücre içine mi yoksa doğrudan santrale mi gireceğini ve kanat yönünü (öne ya da geriye eğik) sayar [5].

## Kaynaklar

1. U.S. Occupational Safety and Health Administration (OSHA), Heat - Overview: Working in Outdoor and Indoor Heat Environments, tablo "Hazardous heat exposure for Indoors or Outdoors". https://www.osha.gov/heat-exposure (erişim 18.11.2026)
2. OSHA, Heat - Engineering Controls, Work Practices, and Personal Protective Equipment. https://www.osha.gov/heat-exposure/controls (erişim 18.11.2026)
3. UK Health and Safety Executive (HSE), Temperature in the workplace: Heat stress. https://www.hse.gov.uk/temperature/employer/heat-stress.htm (erişim 18.11.2026)
4. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, basılı s. 17. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 18.11.2026)
5. VentHub, endüstriyel tavan vantilatörleri, aksiyel fanlar, radyal (santrifüj) fanlar ve çatı tipi fanlar kategori sayfaları (erişim 18.11.2026): https://venthub.com.tr/tr/category/tavan-vantilatorleri , https://venthub.com.tr/tr/category/aksiyel-fanlar , https://venthub.com.tr/tr/category/radyal-fanlar , https://venthub.com.tr/tr/category/cati-tipi-fanlar

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. OSHA ve HSE sırasıyla ABD ve Birleşik Krallık kurumlarıdır; bu bilgiler Türkiye'deki yükümlülüklerin yerini tutmaz. Montaj ve elektrik bağlantısı yetkili personelle yapılır. Kategori bilgileri yayın tarihindeki sürüme aittir.
`,
      },
    },
  },
  {
    // BLOG (BLG-67), doğrulanmış metin: taslak v5 (sha a9aa292f54b5). Kısa sektör sayfası (cetvel R3.3), okur gözüyle yeniden düzenlendi (R3.5, BLG-82); başlıkta, adreste ve kimlikte "restoran" yok (OPS kararı). Aile adı girişte, "VentHub'da hangi mutfak egzoz fanı serileri var?" bölümünde, iki SSS cevabında ve Kaynaklar'da. Mevzuat paketi yok: Türkiye mevzuatı iddiası yok. Fiyat yok.
    // Doğrulama: iddia tablosu kapıdan geçti (kırmızı 0); bu sürümde tuzaklı kol koşmadı; doğrulayıcı engelleyicileri kapatıldı, Gemini dil incelemesi cetvel R3.5 v ölçüsüyle işlendi (BLG-82).
    kimlik: 'mutfak-egzoz-fani-secimi',
    konu: 'verimlilik',
    yayinTarihi: '2026-11-18',
    guncellemeTarihi: '2026-11-18',
    urunler: ['vh:aile/vortice-vort-qbk-sal-kc-evo'],
    ilgiliKategoriler: [],
    diller: {
      tr: {
        slug: 'mutfak-egzoz-fani-nasil-secilir',
        ozet: "Mutfak egzoz fanı seçimi, havanın özellikleri ile debi, basınç ve sistem yerleşimi bilinerek başlar; gaz yakan cihazlarda tamamlama havası önemlidir.",
        // Kart metni YÖNLENDİRME cümlesidir (URN-140): rehberin cümlelerini ve meta açıklamasını tekrarlamaz.
        kartOzeti: "Mutfak egzoz fanı seçerken havanın özelliklerinin, tamamlama havasının ve motor konumunun nasıl ele alındığını görmek için bu rehberden başlayın.",
        govde: `# Mutfak egzoz fanı nasıl seçilir?

Mutfak egzoz fanının seçimi, taşınacak havanın nem, sıcaklık, yoğunluk ve kirlilik düzeyi gibi özellikleri ile gereken debi, basınç ve sistem yerleşimi bilinerek başlar [3]. VentHub'daki Vortice VORT QBK SAL KC Evo ailesi, sıcak, nemli ve kirli havayı dışarı atmak için tasarlanmış, yağ ve is yüklü havanın işlenmesine uygun hücreli bir mutfak egzoz fanı ailesidir [2].

Kısaca:

- Fan türü: radyal (santrifüj) fanlar yüksek nem ve partikül içeriğine sahip "kirli" hava akımlarında ve yüksek sıcaklıklı sistemlerde sık kullanılır [3].
- Motorun konumu: santrifüj fanlarda motor fan gövdesinin dışına konabilir [3].
- Tamamlama havası: gaz yakan cihazlar için yeterli tamamlama havası (makeup air) özellikle önemlidir [1].
- VentHub'da: ailede 315 ile 630 mm arasında nominal çaplı, monofaze ve trifaze modeller vardır [2].

## Mutfak egzoz fanı seçerken nelere bakılır?

Fan seçimini başlatan koşullar havanın özellikleri, debi, basınç ve sistem yerleşimidir; bu koşullar santrifüj ya da aksiyel fandan hangisinin gerektiğini belirler [3]. Ticari mutfakta gaz yakan cihazlar için yeterli tamamlama havası sağlamak da özellikle önemlidir [1].

| Ölçüt | Ne bakılır | Kaynak |
|---|---|---|
| Havanın özellikleri | Nem, sıcaklık, yoğunluk ve kirlilik düzeyi gibi özellikler | [3] |
| Debi, basınç ve yerleşim | Gereken hava debisi, basınç ve sistem yerleşimi; santrifüj ya da aksiyel fan seçimini bu koşullar belirler | [3] |
| Fan türü | Santrifüj fanlar yüksek nem ve partikül içeriğine sahip "kirli" hava akımlarında, malzeme taşımada ve yüksek sıcaklıklı sistemlerde sık kullanılır | [3] |
| Motorun konumu | Santrifüj fanlarda motor fan gövdesinin dışına konup çarka mil keçesiyle bağlanabildiği için partikül içeriği daha az önemlidir | [3] |
| Tamamlama havası | Gaz yakan cihazlarda yeterli hava girmemesi ve hatalı baca düzeni eksik yanmaya ve karbon monoksit gibi yanma ürünlerinin birikmesine yol açabilir | [1] |

İlgili rehber: [Radyal ve aksiyel fan farkı nedir?](vh:yazi/radyal-aksiyel-fan-secimi)

## Ticari mutfakta havalandırma neleri kapsar?

İngiltere Sağlık ve Güvenlik İdaresi'nin (HSE) yemek hizmeti sektörüne yönelik sıkça sorulan sorular sayfasına göre mutfak havalandırması güvenli ve konforlu bir çalışma ortamı için gereklidir [1]. Pişirmenin ürettiği duman, buhar ve ısıyı güvenli bir dış noktaya atmak için havalandırma gerekir; bu genellikle pişirme cihazlarının üstündeki kanopi davlumbazdan mekanik egzozla sağlanır [1]. Havalandırma sistemi mutfağın tamamında genel havalandırma da sağlamalıdır [1]. Katı yakıtlı cihazlar normal çalışmalarında karbon monoksit üretir ve zehirli dumanı uzaklaştıran uygun bir egzoz sistemi ister [1].

İlgili rehber: [Çatı tipi fan nedir, nasıl seçilir?](vh:yazi/cati-tipi-fan-nedir)

## VentHub'da hangi mutfak egzoz fanı serileri var?

VentHub'ın [Vortice VORT QBK SAL KC Evo](vh:aile/vortice-vort-qbk-sal-kc-evo) ailesi Radyal (Santrifüj) Fanlar kategorisindedir; ailenin maksimum debileri 2.540–22.100 m³/h aralığındadır [2]. Ailenin modelleri 315 ile 630 mm arasında nominal çaplı, monofaze ya da trifaze, 25 mm taşyünü iç izolasyonlu ve plug fanlı hücreli mutfak aspiratörleridir; motorları hava akımının dışında yer alır [2]. Örneğin aile sayfasında 43151 kodlu 315 mm'lik monofaze modelin en yüksek debisi 2.540 m³/h, en yüksek statik basıncı 370 Pa olarak verilir [2].

İlgili rehberler: [Hücreli aspiratör nedir, seçerken nelere bakılır?](vh:yazi/hucreli-aspirator-nedir), [Plug fan nedir, nasıl çalışır, nerede kullanılır?](vh:yazi/plug-fan-nedir), [Fan çeşitleri nelerdir? Aksiyel, radyal ve karma akışlı fanlar](vh:yazi/fan-cesitleri)

## Teklif için hangi bilgiler gerekir?

Teklif, aile sayfasındaki "Teknik Teklif İste" düğmesiyle istenir; sayfada 21 model listelenir [2]. Teklif için şu bilgiler hazırlanır:

- Debi ve basınç: fan seçimi gereken hava debisi ve basınç bilinerek başlar [3].
- Cihazların yakıt türü: gaz yakan cihazlarda yeterli tamamlama havası özellikle önemlidir; katı yakıtlı cihazlarda uygun bir egzoz sistemi bulunmalıdır [1].
- Nominal çap: 315 ile 630 mm arası [2].
- Besleme: monofaze ya da trifaze [2].

## Sık sorulan sorular

### Mutfakta havalandırma neden gerekir?

Ticari mutfakta güvenli ve konforlu bir çalışma ortamı için gerekir [1].

### Mutfak havalandırması yalnız davlumbazdan mı yapılır?

Hayır; ticari mutfakta havalandırma sistemi mutfağın tamamında genel havalandırma da sağlamalıdır [1].

### Katı yakıtlı pişirme cihazında egzoz neden gerekir?

Katı yakıtlı cihazlar normal çalışmalarında karbon monoksit ürettiği için gerekir [1].

### Mutfak egzoz fanında motorun hava akımı dışında olması ne sağlar?

Santrifüj fanlarda motor fan gövdesinin dışına konabildiği için partikül içeriği daha az önemlidir [3]. Vortice VORT QBK SAL KC Evo modellerinde motor hava akımının dışındadır [2].

### Mutfakta tamamlama havası verilmezse ne olur?

Gaz yakan cihazlarda yeterli hava girmemesi eksik yanmaya ve karbon monoksit birikimine yol açabilir [1].

### VentHub'da hangi mutfak egzoz fanı ailesi var?

VentHub'da Vortice VORT QBK SAL KC Evo ailesi bulunur [2]. Aile, Radyal (Santrifüj) Fanlar kategorisindedir [2].

## Kaynaklar

1. UK Health and Safety Executive (HSE), Frequently asked questions (Catering and hospitality), "Ventilation and temperature". https://www.hse.gov.uk/catering/faqs.htm (erişim 18.11.2026)
2. VentHub, Vortice VORT QBK SAL KC Evo aile sayfası. https://venthub.com.tr/tr/products/vortice-vort-qbk-sal-kc-evo (erişim 18.11.2026)
3. U.S. Department of Energy, AMCA International, Improving Fan System Performance — A Sourcebook for Industry, DOE/GO-102003-1294, 2003, basılı s. 3, 5 ve 17. https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/fan_sourcebook.pdf (erişim 08.11.2026)

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz. Mutfak havalandırması bilgisi İngiltere Sağlık ve Güvenlik İdaresi'nin (HSE) yemek hizmeti sektörüne yönelik sayfasındandır ve Türkiye'deki yükümlülükleri belirlemez. Montaj ve elektrik bağlantısı yetkili personelle yapılır. Ürün bilgileri yayın tarihindeki sürüme aittir.
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
