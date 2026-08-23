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

### Recep'in netleştirmesi

> **Yeni sayfa yalnız gerçek bir karar noktasında açılır, keyfi olarak değil.**

Müşteri bir yerde "hangisi?" diye duruyorsa orası bir sayfadır. Durmuyorsa — sadece bir sayı
değişiyorsa — orası sayfa değil, **aynı sayfadaki seçicidir**. Dağınıklık bu tek cümleyle
engellenir.

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
