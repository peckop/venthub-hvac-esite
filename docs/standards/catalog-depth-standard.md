# Katalog Derinliği Cetveli — sayfa ne zaman açılır

> **Sürüm:** 1.0 · **Tarih:** 2026-08-23 · **Şerit:** URUN · **Görev:** T160-VH
> **Kapsam:** Vitrinde kaç kademe sayfa olur, bir ürün grubu ne zaman ikiye bölünür,
> anlatı hangi kademede elle yazılır. Veri taşıma / aile birleştirme bu cetvelin konusu
> DEĞİLDİR (Recep kapısı); burada yalnız kural ve ölçülmüş durum yazılır.
> **Karar sahibi:** Recep (2026-08-23 onayı). Ölçüm ve yazım: URUN. §2 I18N ile ortak.

## 0. Niçin var — aynı katalog, aynı hafta, iki farklı cevap

Bu cetvel bir tasarım tercihinden değil, **bir çelişkinin ölçülmesinden** doğdu.

**Hava perdeleri** (`air-curtains`): 8 ürün **tek ailede**. Kategori sayfasından dışarı çıkan
ürün bağlantısı **1**; o aile sayfasında 8 varyantın **hepsi** duruyor ve oradan dışarı çıkan
ürün bağlantısı **0**. Müşteri anlatıdan sepete **iki sayfada** varıyor.

**Kanal içi hayalet fanlar** (`inline-duct-fans`): aynı büyüklükteki 12 ürün **altı aileye
bölünmüş**, üstlerinde de doğrudan ürünü olmayan bir şemsiye aile var. **Üç kademe.**
Şemsiye sayfası canlıda HTTP 200 dönüyor, sitemap'te TR+EN duruyor, ama vitrinde hiçbir
yerden bağlantısı yok — kimsenin uğramadığı, arama motorunun gördüğü boş bir sayfa.

İkisi de aynı katalogda. İkisi de aynı hafta kuruldu (2026-08-11 ve 2026-08-21).
**Aynı soruya iki farklı cevap verilmiş olması, kuralın hiç yazılmamış olduğunun kanıtıdır.**

Kusur ne bölmenin kendisinde ne şemsiyenin varlığında: kusur, **kararın ölçütsüz alınmasında**.

## 1. K1 — Derinlik İKİ kademedir

```
Kategori sayfası          → anlatı + seçim (kartlar, karşılaştırma, sihirbaz)
  └─ Aile sayfası         → o serinin TÜM varyantları, tek sayfada
       └─ (ürün adresi)   → satın alma ucu; gezinme hedefi DEĞİL
```

**Üçüncü bir gezinme kademesi açılmaz.** Ürünün kendi adresi vardır ve olmalıdır — arama
motoru ürünleri ancak kendi adresleriyle listeler, müşteri paylaşırken o adrese ihtiyaç duyar.
Ama **vitrinde gezen kimse oraya düşmez**: aile sayfası varyantı yerinde seçtirir.

**Aile sayfası dışarı ürün bağlantısı vermez.** Bu ölçülebilir bir sözleşmedir ve bugün hava
perdesi ailesinde **zaten sağlanmaktadır** (dışarı çıkan ürün bağlantısı: 0). Yani K1 yeni bir
tasarım değil, katalogun **ölçülmüş çoğunluk davranışını** kurala çevirmektir: 38 ailenin
**37'si tek katmanlıdır**; iki katmanlı olan **tek** aile istisnadır.

### K1'in sayısal karşılığı — `VARIANT_PILL_MAX`

"Varyantı yerinde seçtirir" cümlesinin koddaki karşılığı **tek bir sabittir**:
`src/components/products/VariantSelector.tsx` → `VARIANT_PILL_MAX`.

Sabitin **altında** seçici ürünün yanında durur. **Üstünde** seçici gövdeden çıkar,
"N model" düğmesine ve sayfanın altındaki Modeller bölümüne dönüşür — sayfa değişmez
(K1 ihlali değildir) ama varyant artık *yerinde* seçilmez.

**Değer: 12** (Recep kararı, 2026-08-23; öncesi 8). Eski 8, hava perdesi ailesini
(tam 8 varyant) **tesadüfen** kapsıyordu ve o sayfa referans kabul edilmişti; 12'ye
çıkarmak tesadüfü kurala çevirir. Üst sınır serbest değildir: 20+ varyantta hap listesi
okunmaz hâle gelir ve `VARIANT_MATRIX_MIN` matris görünümünü devreye sokar.

Bekçi: `src/__tests__/conformance/variant-selector-threshold.test.ts` (INV-VARIANT-PILL-1)
— sınırın 12'nin altına düşürülmesini ve PDP'nin sabiti atlayıp kendi sayısını yazmasını
engeller. Sabotaj iki yönde kırmızı verir.

### Recep'in netleştirmesi

> **Yeni sayfa yalnız gerçek bir karar noktasında açılır, keyfi olarak değil.**

Müşteri bir yerde "hangisi?" diye duruyorsa orası bir sayfadır. Durmuyorsa — sadece bir sayı
değişiyorsa — orası sayfa değil, **aynı sayfadaki seçicidir**. Dağınıklık bu tek cümleyle
engellenir.

### K1.1 — Anlatının konusu bir SERİ ise, tetikleyici ve kapsam SERİdir (2026-08-28)

**Kural.** Anlatı ve sihirbaz K1'in yerinde — **kategori sayfasında** — kalır. Ama anlatının
konusu tek bir seriyse ve o seri kategorisini konu-dışı serilerle paylaşıyorsa:

1. **Görünme koşulu** kategori slug'ı değil, **kategorinin o seriyi içermesidir.**
2. **Sihirbazın aday kümesi** kategori değil **o serinin ailesidir** (`family_id`).
3. İkisi **tek bir sabitten** beslenir. Ayrı yazılırlarsa anlatı görünür ama sihirbaz başka
   ürün önerir — ve bu kusuru **hiçbir sayı göstermez**.

**Niçin var (ölçüldü, 2026-08-28).** Sessiz fan anlatısı + sihirbazı `inline-duct-fans`
kategorisine bağlıydı; o kategori pasif ve **0 serili**, yani koşul hiçbir zaman açılmadı —
beş bileşenlik anlatı ve sihirbaz kullanıcıya **bir kez bile görünmedi**. Düzeltirken doğal
refleks "kategoriye taşı" idi; ölçüm onu çürüttü:

| `duct-fans` altındaki seri | model | anlatının konusu mu |
|---|---|---|
| `vortice-lineo-quiet` | 12 | **evet** |
| `vortice-lineo` | 7 | hayır |
| `vortice-radon-range-circular` | 5 | hayır |
| `vortice-vort-commercial-in-line-circular` | 7 | hayır |
| `vortice-vort-commercial-in-line-rectangular` | 5 | hayır |

Kategori kapsamı **24 sessiz olmayan modeli** de aday sayardı: sihirbaz "sessiz fan öner"
derken sessiz olmayan ürün önerebilirdi. Bugünkü kusurun aynası — hiç görünmemek yerine
**yanlış vaat vermek**.

**K1 ile çelişmez.** Sayfa sayısı değişmiyor, üçüncü gezinme kademesi açılmıyor; değişen tek
şey, kategori sayfasındaki bir bölümün *hangi veriye bakarak* açıldığı.

**Neden ayrı kategori açılmadı.** "Sessiz" bir ürün TİPİ değil, bir ÖZELLİKtir; katalog
omurgası kararı kategori eksenini ürün tipi olarak sabitledi. Özellik başına kategori açmak
"ATEX", "asit dayanımlı" için de istenir ve omurgayı zamanla dağıtır. (Recep kararı,
AskUserQuestion onayı, 2026-08-28.)

**Yürürlük noktası.** `src/views/category/CategoryLandingView.tsx` → `SESSIZ_FAN_SERISI` sabiti;
`src/lib/services/wizard.service.ts` → `getWizardCandidates(supabase, familySlug)`.

**Bekçi.** `src/__tests__/conformance/silent-fan-series-binding.test.ts` — `INV-SILENTFAN-SERI-1`.

## 2. K2 — Aile ne zaman bölünür: YAZILABİLİRLİK TESTİ

> **Bu bölüm I18N ile ortaktır** (bölme kararı doğrudan çeviri yüküne dönüşür).
> Aşağıdaki ölçüt URUN tarafından yazıldı; I18N'in eksen katkısı §2.3'e eklenecektir.

### 2.1 Ölçüt

Bir alt grup **ayrı aile olur** ancak ve ancak:

> O gruba **iki dilde de** kendine özgü, spec tablosunu tekrarlamayan **bir paragraf**
> yazılabiliyorsa.

Yazılabiliyorsa gerçek bir karar noktasıdır → **ayrı aile**.
Yazılamıyorsa — ya da yazılan paragraf spec'in cümleye dökülmüş hâliyse → **ayrı aile değil**,
aynı sayfada seçici.

### 2.2 Niçin bu ölçüt

Çünkü **paragraf yazılamayan yerde karar da yoktur.** "Lineo 150, Lineo 125'ten daha büyük
çaplıdır" bir paragraf değil, spec satırının cümlesidir; müşteriye hiçbir şey öğretmez ve
kanal çapını zaten bilen kişi o sayıyı tablodan okur. Buna karşılık "hava perdesinde ısıtıcılı
model kapı önü sıcaklık kaybını telafi eder, ısıtıcısız model yalnız hava bariyeri kurar"
gerçek bir karardır — müşteri bunu bilmeden seçemez.

Ölçüt **kasten insan yargısına** dayanır ve makineye devredilmez: "bu ayrım paragraf hak ediyor
mu" sorusunun cevabı üründe değil, **müşterinin kafasındaki soruda** yaşar.

### 2.3 İki dil şartı niçin var

Paragraf **tek dilde** yazılabiliyor ama diğerinde yazılamıyorsa, o ayrım muhtemelen dile özgü
bir alışkanlıktır, ürün gerçeği değil. Ayrıca her ayrı aile **iki çeviri** demektir; ölçüt bu
maliyeti kararın içine koyar.

#### 2.3.1 Test ADA değil PARAGRAFA uygulanır — ölçüldü

> Aile **adının** iki dilde de kulağa doğru gelmesi, ölçütün geçtiği anlamına **gelmez**.

Ölçüm (canlı DB, 2026-08-23, 38 aile): **13 ailenin `name_i18n` değeri TR ve EN'de birebir
aynı dize.** Hepsi saf marka/model adı — `Danfoss VLT HVAC Basic Drive FC 101`,
`Vortice Bravo S`, `Vortice Lineo 100/125/150/200/250/315 Quiet`,
`Vortice Nordik HVLS Hyperblade`, `Vortice VORT Mono / QBK SAL KC Evo / Quadro Evo`.
Hiçbirinde Türkçe harf ya da Türkçe kelime yok.

Bu **kusur değil** — marka adı çevrilmez, tr = en olması doğrudur. Ama sonucu şudur: bu 13
ailede **ad, bölme kararı hakkında sıfır bilgi taşır.** Dize zaten dilden bağımsız olduğu için
"iki dilde de yazılabiliyor" sınaması orada hiçbir şey ölçmez — her zaman geçer. Ölçüt
§2.1'in dediği gibi **paragrafa** uygulanmalıdır; ada uygulanan hâli **boş bir sınavdır**:
hep yeşil yanar, hiçbir bölmeyi engellemez.

Uygulama notu: bir bölme önerisi değerlendirilirken "adı iki dilde de düzgün" cümlesi
gerekçe olarak **kabul edilmez**; iki dilde yazılmış iki paragraf istenir.

#### 2.3.2 "İki çeviri" maliyeti eksik ölçüyor — dört yüzey var

`product_families` tablosunda çeviri taşıyan **dört** alan var (hepsi `jsonb`).
Bugünkü doluluk (38 aile, silinmemiş):

| yüzey | iki dilde dolu |
|---|---|
| `name_i18n` | 38 / 38 |
| `description` | 38 / 38 |
| `meta_title` | **0 / 38** |
| `meta_description` | **0 / 38** |

`meta_title` ve `meta_description` 38 ailenin **hepsinde `NULL`** — boş nesne bile değil,
hiç yazılmamış. Yani her aile bugün *iki çeviri ödenmiş + iki çeviri ödenmemiş* hâlde yaşıyor
ve ödenmeyen taraf SEO yüzeyi. Yeni bir aile açmak, **zaten tamamı ödenmemiş** bir borca bir
kalem daha ekler.

Bu, bölme kararını yasaklamaz; kararın **gerçek fiyatını** görünür kılar. Ölçüt "iki çeviri"
derken kastedilen alt sınırdır, tavan değil.

> **Kapsam sınırı:** `meta_*` alanlarının boş olması I18N şeridinin bulgusu ama ÜRÜN/SEO
> alanının işidir. Burada yalnız **maliyet kalemi olarak** kayda geçiyor.

#### 2.3.3 Her yeni aile, bir karışık-dilli dize daha demektir

Aile adları **tek dizede iki dil** taşır: `Vortice Lineo Quiet Kanal Fanları`. Ölçüm
(2026-08-23): **38 adın 36'sı `i` harfi içeriyor.**

Bunun bedeli `docs/standards/i18n-localization-standard.md` ekseni I'de yazılı ve
`INV-7` kapısıyla korunuyor: veri kaynaklı özel ada CSS `text-transform: uppercase`
uygulanamaz, çünkü `uppercase` **dile duyarlıdır** ve `lang="tr"` altında `Vortice → VORTİCE`
olur. Elemana `lang` vermek de çözmez: dize karışık dilli olduğu için `lang="tr"` markayı,
`lang="en"` Türkçe kelimeleri bozar.

Yani her yeni aile, kasa/harmanlama kurallarının kapsamına giren **bir dize daha** ekler.
Aileyi bölmek bu bedeli çoğaltır; birleştirmek azaltır.

## 3. K3 — Anlatı üç kademelidir

374 ürün ve ~31 kategoriye elde yazılmış anlatı ölçeklenmez. Anlatı **kademelenir**:

| kademe | ne | kime |
|---|---|---|
| **1 — elle yazılmış** | özgün anlatı, görsel, bölümler, karşılaştırma | üst kategoriler (~13) ve gerçek **karar aileleri** |
| **2 — şablon + sözlük anahtarı** | aynı iskelet, verisi sözlükten gelen metin | katalogun kütlesi |
| **3 — spec tablosu + görsel** | anlatı yok; tablo ve görsel yeterlidir | ayrım taşımayan varyantlar |

Kademe 2'nin uygulanabilirliği **kanıtlıdır**: T150'de sessiz fan sihirbazının 82 sözlük
anahtarı TR+EN üretildi; şablon + anahtar yolu ölçekleniyor.

**Kademe seçimi K2'nin sonucudur:** paragraf yazılabiliyorsa kademe 1, yazılamıyorsa 2 ya da 3.
Üç kural tek karara bağlanır.

## 4. Kapı

Cetvelin **makineye devredilebilir** kısmı K1'dir; K2 insan yargısıdır, K3 K2'nin sonucudur.

`scripts/db/checks/catalog-integrity.mjs` → **`family-nested`**: bir ailenin üst ailesi varsa
sayar. K1'in ihlali tam olarak budur — üçüncü gezinme kademesi ancak aile hiyerarşisiyle doğar.

Taban (`catalog-integrity-baseline.json`) **yalnız kısalır**: bugünkü ihlaller gerekçesiyle
affedilmiştir, **yeni ihlal eklenemez**. Yani bugünkü Lineo yapısı kurala aykırı olarak
**kayıtlıdır** ve düzeltilmesi Recep kapısındadır; ama **ikinci bir tanesi doğamaz**.

K2 için makine kapısı **yoktur ve olmamalıdır** — "bu ayrım paragraf hak ediyor mu" sorusu
ölçülemez. Bunun yerine kapı K2'nin **sonucunu** ölçer: paragrafı olmayan bir aile kademe 1
anlatısı taşıyorsa, o anlatı ya yazılmamıştır ya da yazılamayan bir ayrımı anlatmaya
çalışmaktadır.

## 4b. K4 — Görünüm modu veriye bağlıdır, tercihe değil (2026-08-26)

### 4b.1 Niçin bu madde eklendi

Bu cetvel şimdiye kadar **derinliği** yönetiyordu (kaç kademe sayfa olur), **görünüm modunu**
yönetmiyordu (o sayfa neyi listeler). O boşlukta canlı bir müşteri kaybı yaşadı ve **hiçbir
kapı görmedi** — CLAUDE.md kural 1'in tarif ettiği durumun ta kendisi.

**Ölçüm (2026-08-26, prod, tarayıcıda, ana içerik bölgesi sayıldı — footer hariç):**

| adres | mod | alt kategori | aktif ürün | ileriye giden bağlantı |
|---|---|---|---|---|
| `/tr/category/isi-geri-kazanim` | showcase | 0 | 16 | **0** |
| `/tr/category/endustriyel-tavan-vantilatorleri` | showcase | 0 | 7 | **0** |
| `/tr/category/endustriyel-havalandirma` | showcase | 7 | 225 | 7 alt kategori kartı |
| `/tr/category/aksiyel-sanayi-fanlari` | series | 0 | 16 | 1 aile kartı |

Sebep: `CategoryShowcaseView` yalnız `subCategories` alır, `families` **almaz**; showcase'te
sayfalama da kapalıdır. Yani alt kategorisi olmayan bir showcase kategorisi **hiçbir şey**
listelemez. Bileşen bozuk değildi — **veri yokken boşa düşüyordu.** Etkilenen: 27 aktif ürün.

Not: metin taraması bu kusuru göremez. Sözlük dizeleri RSC yüküne serileştiği için her iki
görünüme özgü ibareler **her sayfada** geçer; gösterge iki durumu ayırt etmez. Ölçüm ancak
tarayıcıda **yapısal** olarak (render edilmiş bağlantı sayımı) yapılabilir.

### 4b.2 Kural

> **Bir kategori sayfası, ileriye giden en az bir yol göstermek zorundadır** — ya alt kategori
> kartı, ya aile/ürün kartı. Hiçbir mod, sayfayı çıkışsız bırakmayı meşrulaştırmaz.

Bunun sonucu olarak **görünüm modu tek başına bir tercih değildir; verinin onu taşıyıp
taşımadığıyla birlikte geçerlidir**:

| mod | ne gösterir | veri şartı |
|---|---|---|
| `showcase` | alt kategori kartları + anlatı | **en az 1 alt kategori** |
| `landing` | aile kartları + karar anlatısı | en az 1 aile |
| `series` | aile kartları (teknik) | en az 1 aile |

Şart sağlanmıyorsa mod **düşer**: `showcase` → `series`. Düşme sessiz bir çare değil,
**kuralın kendisidir** — `display_mode` sütunu bir niyet beyanıdır, sayfanın çıkışsız
kalmasına izin veren bir yetki değil.

### 4b.3 Yürürlük noktası ve bekçi

Kuralın koddaki karşılığı tek bir fonksiyondur:
`src/views/CategoryMasterView.tsx` → `etkinGorunumModu(displayMode, altKategoriSayisi)`.

Mod **iki yerde** tüketilir: hangi görünümün çizileceği ve sayfalamanın gösterilip
gösterilmeyeceği. İkisi ayrı hesaplanırsa sessizce ayrışır — bu dosyada zaten bir kez ayrıştı.
Bu yüzden kural **tek kaynak** olarak yazılır ve bekçi bunu da kilitler.

Bekçi: `src/__tests__/conformance/category-view-reach.test.ts` (INV-CATEGORY-REACH-1).
Sabotaj **üç yönde** kırmızı verir: (1) düşme kuralı sökülünce, (2) aşırı düzeltilip her
showcase düşürülünce, (3) sayfalama ham modu yeniden okuyunca.

### 4b.4 Kapsam dışı — ayrı kalemler

- **Boş kategoriler.** `parking-jet-fan` ana kategorisinin 0 alt kategorisi ve 0 ürünü var;
  `hygiene-sanitizer`, `summer-ventilation`, `air-conditioning` de boş. Bu bir **veri**
  kararıdır (gizle / doldur / sil) ve bu cetvelin konusu değildir.
- **Ölü kod.** `CategoryMasterView`'in `switch` `default:` dalı ve `CategoryGridView`
  ulaşılamaz: `useCategoryViewModel` `'grid'` değerini `'series'`e çevirir ve sütunda 0 adet
  `'grid'` vardır. `knip` bunu yakalayamaz çünkü dosya **import ediliyor**.

## 5. Ölçülmüş durum (2026-08-23, canlı DB)

| ölçüm | sonuç |
|---|---|
| toplam aile | **38** |
| tek katmanlı (üst ailesi yok) | **37** |
| iki katmanlı (üst ailesi var) | **6** (hepsi Lineo Quiet çocukları) |
| ebeveyn aile | **1** (`vortice-lineo-quiet`) |
| doğrudan ürünü olmayan aile | **1** (aynı şemsiye) |

Yani **iki kademeli yapı katalogda tek örnektir**, desen değil. 2026-08-21'deki aile
ayrışmasından kalmıştır ve o ayrışma bu cetvelin ölçütünü uygulamamıştır (ölçüt o gün
yazılı değildi).

## 6. Kapsam dışı

- **Lineo'nun birleştirilmesi** (6 çap → tek aile): bu cetvele dayalı **prod veri yazımı**,
  Recep kapısı. Cetvel inince önerilecektir.
- **Şema değişikliği** (aile hiyerarşisinin tablodan kaldırılması): ayrı iş; bugünkü kural
  hiyerarşiyi **kullanmamayı** söyler, sütunu silmeyi değil.
- **Ürün adresinin kaldırılması**: yapılmaz. K1 adresin **var** olmasını, gezinme hedefi
  **olmamasını** söyler.

## 7. İlgili

- `docs/standards/category-taxonomy-standard.md` — kategori ağacı ve slug lokalizasyonu
- `docs/standards/storefront-design-standard.md` — vitrin görsel dili
- `docs/standards/product-selection-wizard-standard.md` — seçim sihirbazları (kuyruğun sonunda)
- `scripts/db/checks/catalog-integrity.mjs` — `family-nested`, `family-empty`, `product-no-subcategory`
- `docs/audits/t140-*` — aile ayrışması ölçümleri
