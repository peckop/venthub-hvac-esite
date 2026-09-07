# Adres şeması + kategori ağacı + nitelik katmanı — TEK YAYIN geçiş planı

> **REC-191 · URUN · 2026-09-07**
> **Bu belge PLAN'dır. Uygulama YOK, migration YOK, prod yazımı YOK, kod YOK.**
> Uygulama Vitrin Faz 2'de, ayrı emirle ve Recep onayıyla koşar.

**KAYNAK/CETVEL:** `Kararlar — SEO ve Yayın` (K3 kategori adres geçişi, K4 IndexNow) ·
`Kararlar — Katalog ve Ürün Verisi` (K4 kategori verisi göçü) · REC-95 (nitelik katmanı) ·
REC-135 (ağaç boşlukları) · `docs/standards/canonical-url-standard.md` ·
`docs/plans/slug-localization-2026-08-10.md` §4 (segment göçünü kasten ertelemiş).
**Ölçüm tazeliği:** canlı site + canlı DB, 2026-09-07 08:0x–08:5xZ. Her sayı bu belgede ölçümle
işaretlidir; hatırlanan hiçbir sayı yok.

---

## 1. Niçin bu belge var

Recep 2026-09-07'de `https://venthub.com.tr/tr/category/fanlar/asit-dayanikli-fanlar` adresini
gösterip *"bu konunun kayıtları olmalı ve kararı da alınmıştı"* dedi. Haklıydı: karar yazılıydı
(**K3**), ben belgeye bakmadan konuşmuştum.

Kararı ararken asıl bulgu çıktı: **üç ayrı karar aynı adresleri değiştiriyor** ve hiçbiri
diğerinden haberdar değil. Ayrı ayrı yayınlanırlarsa aynı sayfa üç kez adres değiştirir.

| # | karar | ne der | adrese etkisi |
|---|---|---|---|
| K3 | Kararlar — SEO ve Yayın (2026-09-03, Recep) | `/category/` segmenti **kalkar**, kısa slug (`/tr/fanlar/korozyon-dayanimli`); eski adresler 301; hreflang + sitemap + GSC aynı yayında; **Vitrin Faz 2 ile**; ürün adresleri değişmez | 80 kategori adresi |
| K4-Kat | Kararlar — Katalog (2026-09-03, Recep) | Ağaç 15A ağacına göçer; boş üst kategoriler + boş alt dallar temizlenir; **Sığınak üst kategori olur**; ürün atamaları 15A'ya göre | ağaç derinliği = adres derinliği |
| REC-95 | (Backlog, karar 2026-08-27) | ATEX / mini aksiyel / asit dayanımlı **kategori değil**, niteliktir → rozet + filtre + vitrin sayfası | dal ağaçtan çıkar |

**Hüküm (OPS 2026-09-07 kabul):** üçü **tek yayında** gider. Gerekçe ölçülebilir: her adres
taşınması Google'da değer kaybı ve yeniden öğrenme süresi demektir; üç kez taşınan sayfa üç kez
sarsılır ve bedel üç katına çıkar.

---

## 2. Bugünkü durum — ölçüm

### 2.1 Büyüklük

| ölçüm | değer | nasıl ölçüldü |
|---|---|---|
| site haritası toplam adres | **194** | `sitemap.xml`, `<loc>` sayımı |
| kategori adresi | **80** | aynı, `/category/` içerenler |
| ürün adresi | **80** | aynı, `/products/` içerenler (ilk yazımda 82 demiştim — çürütme düzeltti) |
| taşınacak adres | **80** | ürün adresleri K3 gereği **değişmez** |
| aktif kök kategori | **6** | canlı DB, `parent_id is null and is_active` |
| pasif kök kategori | **7** (hepsi 0 ürün) | aynı |
| alt dal | **24**, 7'si pasif ve 0 ürünlü | canlı DB |
| kök slug ↔ mevcut sayfa adı çakışması | **0** | 23 TR slug × 13 rota adı karşılaştırması |

### 2.2 ⚠ Bugün canlıda duran kusur — aynı sayfa iki adreste

Site haritasındaki TR kategori adreslerinin **23'ü tek seviyeli, 17'si iki seviyeli**. Bu 17,
tek seviyelilerin **aynısı**: her alt kategori hem `/tr/category/<alt>` hem
`/tr/category/<üst>/<alt>` adresinden yayınlanıyor.

Ölçüm (2026-09-07):

```
/tr/category/asit-dayanikli-fanlar          → 200 · canonical: .../asit-dayanikli-fanlar
/tr/category/fanlar/asit-dayanikli-fanlar   → 200 · canonical: .../fanlar/asit-dayanikli-fanlar
```

**İki adres, aynı içerik, ve her biri KENDİNİ kanonik ilan ediyor.** İkisi de site haritasında.
Google için bunlar iki ayrı sayfadır; aynı içeriği iki yerde gördüğünde hangisini göstereceğine
kendi karar verir ve bağlantı değeri ikiye bölünür. **17 sayfa × 2 dil = 34 çift adres.**

Bu, planın konusu değil **bugünün kusurudur**; geçiş bunu kendiliğinden çözer (tek şema, tek
kanonik) ama geçiş Faz 2'ye kadar beklerse kusur da bekler. Ayrı ve küçük bir düzeltme olarak
öne alınabilir → **§8 karar kalemi K-A**.

#### ⚠ Çürütmenin düzeltmesi: iki adres aynı sayfa DEĞİL

İlk yazımda "aynı içerik" dedim. Çürütme ölçtü ve **yanlış** çıktı: iki rota farklı metadata
üretiyor ve **iki seviyeli olan sakat**:

| | `/tr/category/<alt>` | `/tr/category/<üst>/<alt>` |
|---|---|---|
| `og:url` | **var** | **YOK** |
| `CollectionPage` JSON-LD | **var** (2 eşleşme) | **YOK** (0) |
| `ListItem` (kırıntı yolu) | 5 | 2 |

Aynı asimetri `kanal-tipi-fanlar` ve EN karşılıklarında da ölçüldü.

**Sonuç — §4 K-E önerisi tersine döndü.** İlk hâlde "iki seviyeli kalsın" önermiştim; ölçüm,
hayatta bırakılması önerilen varyantın SEO bakımından **zayıf** olanı olduğunu söylüyor. Karar
şu ikisinden biri olmalı: (a) tek seviyeli şema seçilir (zengin metadata zaten orada) ya da
(b) iki seviyeli şema seçilirse **önce eksik metadata tamamlanır**, sonra geçiş yapılır. Eksik
metadatayla geçmek, 17 sayfayı kalıcı olarak zayıf hâline sabitler.

### 2.3 Yönlendirme zinciri

`/category/fanlar` (dil öneksiz, eski adres) → **4 hop** → `/tr/category/fanlar` (200).

Yeni geçişin 301'i bu zincirin **üstüne binerse** 5 hop olur. Google uzun zincirlerde değer
aktarımını azaltır, belli bir noktadan sonra takibi bırakır. → **§5 zincir kuralı**.

Doğru çalışan taraf: `/tr/category/fans` → 308 → `/tr/category/fanlar`. Yanlış dildeki slug
doğrusuna gidiyor; dil bazlı çift içerik **yok**.

### 2.4 Ağaç — hangi dal ne olacak

| dal | üst | ürün | durum | geçişte |
|---|---|---|---|---|
| Sığınak Havalandırma Fanları | Fanlar | 3 | aktif | **üst kategoriye çıkar** (K4-Kat) |
| **Asit Dayanımlı Fanlar** | Fanlar | **81** | aktif | **ağaçtan çıkar** (REC-95) — §2.5 |
| Ex-Proof (ATEX) Fanlar | Fanlar | 0 | pasif | ağaçtan çıkar (REC-95) |
| Otopark Jet Fanları · Jet Fans · Cam ve Pencere Tipi | Fanlar | 0 | pasif | hüküm REC-135 → Recep |
| Dikdörtgen Kanal Tipi · İklimlendirme Çözümleri | Commercial Ventilation (pasif kök) | 0 | pasif | aynı |
| Kanal İçi Hayalet Fanlar | Residential Ventilation (pasif kök) | 0 | pasif | aynı |
| 7 pasif kök (Air Conditioning, Summer/Commercial/Residential Ventilation, Electric Heating, Hygiene, Smart Home) | — | 0 | pasif | arşiv/silme → Recep |
| kalan 15 aktif dal | — | 30/31/36/83… | aktif | yalnız adresi değişir |

### 2.5 ⭐ Asit Dayanımlı Fanlar — ölçüm REC-95'ten ileri gidiyor

Canlı SELECT: bu dalın **81 ürününün tamamı SEAT markası**; SEAT markasının toplam ürün sayısı
da 81 (`Kararlar — Katalog` K3). Yani bu dal bir nitelik bile değil — **bir markanın tüm
ürünleri**, kategori kılığında.

**Öneri (hüküm Recep'in):** dal kategori ağacından çıkar. 81 ürün gerçek kategorilerine dağılır
(gövde tipine göre: santrifüj / aksiyel / kanal). "Asit dayanımlı" bir **nitelik** olarak
işaretlenir (REC-95 katmanı) ve marka sayfası (`/tr/brands/seat`) zaten var olan yüzeydir.

**Bu, planın en pahalı kalemidir** (81 ürünün yeniden atanması) ve **adres geçişinden ÖNCE
bitmelidir** — sonra yapılırsa aynı 81 ürünün sayfası ikinci kez taşınır.

#### ⚠ Çürütmenin düzeltmesi: bu öneri bugün UYGULANAMAZ

İlk yazımda "81 ürün gerçek kategorilerine dağılır (gövde tipine göre)" dedim. Çürütme ölçtü:

- **Dağıtacak veri yok.** `products` tablosunda `product_type` / `body_type` benzeri **hiçbir
  alan yok**; `technical_specs` içinde de yalnız sayısal ölçüler var (faz, devir, gerilim,
  ağırlık, çap, gürültü, güç, debi, basınç). Santrifüj / aksiyel / kanal ayrımı bu veriden
  **türetilemez**.
- **Dal saf değil.** İçinde `JET 30 ATEX`, `JET 20 ATEX`, `SEAT 20` birlikte duruyor — yani
  jet fan + ATEX + SEAT serisi karışmış. "Bir markanın tüm ürünleri" tanımım eksikti; doğrusu
  "bir markanın tüm ürünleri, üstelik kendi içinde birbirinden farklı üç şey".
- **Bağ tek.** Ürünler dala yalnız `subcategory_id` ile bağlı; dal kaldırılırsa 81 ürün
  **dalsız kalır**.

**Sonuç:** bu adım "bir SQL cümlesi" değil, **81 satırın elle sınıflandırılması** demektir ve
o iş Katalog şeridinin alanına girer. §3'e göre adres geçişinin ön koşulu olduğu için
**bütün plan buraya kilitleniyor**. Uygulama emri bu maliyeti açıkça taşımalı; aksi hâlde
"geçiş yakında" denip aylarca beklenir.

---

## 3. Sıra (değiştirilemez)

1. **AĞAÇ KESİNLEŞİR** — K4-Kat göçü · REC-135 boş dal hükmü · asit-dayanıklı dalın hükmü ·
   Sığınak'ın yükselmesi. Çıktı: **nihai kategori listesi** (kök + alt, her biri slug'lı).
   Bu adım bitmeden 2'ye geçilmez; ağaç değişirse adres de değişir ve iş baştan başlar.
2. **ADRES ŞEMASI — TEK YAYIN** — K3. Aşağıdaki §4–§7 bu adımı tarif eder.
3. **NİTELİK / FASET KATMANI** — REC-95 fazları. Adres şeması oturduktan sonra; nitelik
   sayfaları yeni şemaya göre doğar, eski şemaya göre doğup taşınmaz.

---

## 4. Hedef adres şeması

K3'ün lafzı: `/tr/fanlar/korozyon-dayanimli`. Yani:

| bugün | yarın |
|---|---|
| `/tr/category/fanlar` | `/tr/fanlar` |
| `/tr/category/fanlar/kanal-tipi-fanlar` | `/tr/fanlar/kanal-tipi-fanlar` |
| `/en/category/fans/duct-fans` | `/en/fans/duct-fans` |
| `/tr/category/asit-dayanikli-fanlar` (tek seviyeli ikiz) | **kalkar** — §2.2 |
| `/tr/products/<slug>` | **değişmez** (K3) |

**Kararlar (uygulama emrinde kesinleşir, plan bunları işaret eder):**

- **K-1 · Alt kategori tek seviyede mi yaşayacak?** K3 örneği iki seviye gösteriyor
  (`/tr/fanlar/korozyon-dayanimli`). Bugünkü ikiz adreslerden **tek seviyeli olan kalkar**,
  iki seviyeli kalır. Tersi de mümkün (daha kısa adres) ama üst-alt ilişkisini adresten siler
  ve içerik hiyerarşisini zayıflatır. **Öneri: iki seviye kalsın.**
- **K-2 · Dil öneki korunur.** `/tr` ve `/en` kalkmıyor; K3 yalnız `/category/` diyor.

---

## 5. Zincir kuralı — tek hop

**Kural:** her eski adres, **tek 301 ile** son hâline gider. Yeni yönlendirme eski
yönlendirmenin üstüne eklenmez; eski kuralların **hedefleri yeniden yazılır**.

Somut: `next.config.mjs`'te bugün 13 eski Türkçe→İngilizce kategori yönlendirmesi var
(`/category/fanlar` → `/category/fans`). Geçişte bunların hedefleri doğrudan yeni şemaya
çevrilir, yeni bir katman eklenmez.

### ⚠ Çürütmenin düzeltmesi: "≤ 1" ölçütü tutturulamaz

İlk yazımda kabul ölçütünü `num_redirects ≤ 1` koymuştum. Çürütme bu 4 hop'un **nereden**
geldiğini ölçtü ve ölçütün matematiksel olarak imkânsız olduğunu gösterdi:

```
/category/fanlar
  308 → /category/fans/       next.config.mjs:64 — ':path*' BOŞKEN sondaki eğik çizgi kalıyor
  308 → /category/fans        eğik çizgi normalizasyonu (çerçevenin kendi davranışı)
  307 → /tr/category/fans     middleware dil enjeksiyonu — dosyanın kendi yorumu "deterministik
                              değil" diyor, bu yüzden kalıcı yönlendirmeye çevrilemez
  308 → /tr/category/fanlar   sayfanın slug yerelleştirmesi
  200
```

`www` ile giriş bir hop daha ekliyor → **5 hop**.

**Düzeltilmiş ölçüt (iki ayrı bütçe):**

| adres sınıfı | bütçe | gerekçe |
|---|---|---|
| dil önekli adres (`/tr/...`, `/en/...`) | **≤ 1 hop** | tek katman bizim; tutturulabilir |
| dil öneksiz eski adres (`/category/...`) | **≤ 3 hop** | dil enjeksiyonu + eğik çizgi normalizasyonu bizim kontrolümüzde değil |

**Ve bugünden düzeltilebilecek bedava bir hop var:** `next.config.mjs:64-76`'daki 13 kuralın
`:path*` deseni, yol boşken sonda eğik çizgi bırakıyor ve bu tek başına bir fazladan sıçrama
üretiyor. Bu, geçişi beklemeden düzeltilebilir → **§8 karar kalemi K-G**.

---

## 6. Ad alanı çakışması — kapı gerekir

Kategoriler kök seviyeye çıkınca `/tr/<kategori-slug>` ile `/tr/<sayfa-adı>` **aynı ad alanını**
paylaşır. Bugün çakışma yok (ölçüldü: 23 slug × 13 rota adı). Ama yarın bir kategoriye
`iletisim`, `markalar`, `sepet` gibi bir slug verilirse **sayfa gölgelenir** ve hiçbir test bunu
görmez.

**Gereken kapı (INV önerisi `INV-ADRES-CAKISMA-1`):** kategori slug'ı, uygulamadaki rota adları
kümesiyle kesişemez. Kesişirse kırmızı. Kapı hem TR hem EN slug'ını ölçer, hem de rota listesini
dosya sisteminden **türetir** (elle yazılmış liste bayatlar → evren muhafızı).

#### ⚠ Çürütmenin düzeltmesi: sonuç doğru, evrenim dardı

"Çakışma 0" sonucu doğrulandı — ama benim ölçtüğüm evren eksikti (23 slug). Gerçek evren
**37 kategori × 2 dil = 74 slug**, ve rezerve adlar da 13 değil: `src/app/[lang]/` altındaki
13 dizine ek olarak **`admin`** (middleware `/tr/admin*` → 308 `/admin*`), **`api`**, ve
`next.config.mjs`'teki kendi yönlendirme kaynakları da aynı ad alanını tutuyor. Genişletilmiş
evrende de kesişim **0** — yani sonucum doğruydu ama **şansla**; kapının evreni bu geniş
listeyi almalı.

**Çürütmenin bulduğu YENİ risk (planda yoktu):** hedef şemada `/[lang]/[kategori]` dinamik
segmenti 13 statik kardeşin yanına gelir. Bugün `/tr/fanlar` **404** dönüyor (ölçüldü); yeni
şemada **bilinen olmayan her `/tr/xyz` adresi** kategori sorgusuna girip öyle 404 olur. Yani
her yazım hatası ve her bot taraması bir veritabanı sorgusu demektir. Uygulama emri bunun için
ya bir kısa-devre listesi ya da önbellek öngörmeli.

---

## 7. SEO ölçütü ve yayın kontrol listesi

### 7.1 Aynı yayında değişecek olanlar

Bunlar **birlikte** gider; yarısı yeni yarısı eski kalırsa Google çelişki görür:

- [ ] sayfa adresleri (rota yapısı)
- [ ] her sayfanın kendini beyan ettiği kanonik adres
- [ ] dil eşleşmeleri (hreflang: tr / en / x-default)
- [ ] site haritası
- [ ] sitenin kendi iç bağlantıları — **§7.1-b'deki yedi yüzeyin HEPSİ**; "tek noktadan
      çözülür" İDDİASI ÇÜRÜDÜ, aşağıya bak
- [ ] eski adres → yeni adres kalıcı yönlendirmeleri (tek hop, §5)
- [ ] IndexNow anahtarı + bildirim (K4-SEO: tam bu yayında)
- [ ] Google Search Console: yeni site haritası bildirimi

### 7.1-b ⚠ ÇÜRÜTMENİN EN AĞIR BULGUSU — "tek çözücü" YANLIŞTI

İlk yazımda *"tek kaynak `getLocalizedCategorySlug` + `Routes.category`, kopya çözücü yok
(ölçüldü)"* dedim. **Bu cümle yanlıştı ve ölçümüm sığdı** — yalnız çözücü fonksiyonun
çağrılarını saymıştım, oysa asıl mesele adres dizesini **çözücüye hiç uğramadan** kuran
yerler. Çürütme yedi kaçak buldu:

| # | yer | ne yapıyor | not |
|---|---|---|---|
| 1 | `supabase/migrations/20260826220000_search_suggestions_family_route.sql:128` — canlı `get_search_suggestions` fonksiyonu | `'/category/' || c.slug` ile adres üretiyor | **VERİTABANININ İÇİNDE** — kod incelemesi görmez, düzeltmesi **migration ister** (kural 13: merge = prod). REC-79/REC-114 aynı sınıftı |
| 2 | `src/config/applications.ts:23,32,41` | `href: '/category/fans'` elle yazılmış | üstelik EN slug'ı sabitlenmiş |
| 3 | `src/utils/applicationLinks.ts:7-9` | `'/category/air-curtains'` eşlemesi | aynı sınıf |
| 4 | `src/lib/seo/jsonld.ts:161` | JSON-LD adresi kendi kuruyor | yapısal veri yanlış adres yayınlar |
| 5 | `src/app/api/webhook/supabase/route.ts:172-183` | ISR tazeleme yollarını elle kuruyor | **§8-2**: bozulursa veri değişir, sayfa değişmez, hiçbir test görmez |
| 6 | kategori sayfalarının kendi `page.tsx`'leri (`:101,102,152` ve `:134,135,170`) | kanonik / dil eşleşmesi / yönlendirme dizeleri elle | |
| 7 | `src/app/sitemap.ts` | `Routes.category` üzerinden — **bu temiz**, ama listede adıyla anılmalı | |

**Sonuç:** geçişin "tek dosyada biter" tarafı yok. Uygulama emri bu yedi yüzeyi **tek tek**
listelemek ve her birini yayın kontrol listesine koymak zorundadır. 1 numaralı kalem ayrıca
bir **migration** demektir ve Recep kapısına tabidir.

### 7.1-c ⚠ Ürün sayfaları da etkileniyor — "ürün adresleri değişmez" yanıltıcıydı

Ürün **adresi** değişmiyor (K3 doğru), ama ürün **sayfası** değişiyor: kırıntı yolu ve
`BreadcrumbList` yapısal verisi kategori adresi taşıyor.

Ölçüm (`/tr/products/vortice-lineo-quiet`): sayfada `/tr/category/…` **4 kez** geçiyor —
2 görünür bağlantı + 2 yapısal veri satırı.

**Sonuç:** 80 kategori adresine ek olarak **80 ürün sayfası** da yeniden taranmalıdır. Geçişin
büyüklüğü "80 adres" değil, **160 sayfa**. §9'daki "ürün adresleri kapsam dışı" satırı bu
yüzden yanıltıcıydı; düzeltildi.

### 7.2 Faset/nitelik sayfaları (REC-95 katmanı için, şimdiden bağlayıcı)

- Faset **kombinasyonları indekslenmez**; kanonik daima kategori ya da seri sayfasıdır.
- Yalnız arama değeri ölçülmüş **5–10 kombinasyon** için elle sabit sayfa açılır ve bunlar
  kendi kanoniklerine sahiptir.
- Gerekçe: kombinasyon sayfaları sınırsız üretilebilir; hepsi indekslenirse tarama bütçesi
  tükenir ve zayıf içerik siteyi aşağı çeker.

### 7.3 Yayın sonrası ölçüm (iki hafta)

- Search Console kapsam raporu: "bulunamadı" biriken adres **0** olmalı.
- Eski adres örneklemi (en az 20 adres) tek hop veriyor mu — otomatik ölçüm.
- Site haritasındaki her adres 200 dönüyor mu — otomatik ölçüm.
- Trafik düşüşü beklenir ve normaldir; **kalıcı** düşüş normal değildir.

---

## 8. Recep'te bekleyen karar kalemleri

| # | karar | not |
|---|---|---|
| **K-A** | §2.2'deki çift adres kusuru **şimdi mi** düzeltilsin, geçişe mi bırakılsın? | Bugün 34 çift adres canlıda. Geçiş beklerse kusur da bekler. Küçük ve ayrı bir düzeltme olarak öne alınabilir. |
| **K-B** | Boş 7 alt dal: kalsın / kapansın / birleşsin (REC-135) | Hepsi 0 ürün ve pasif. |
| **K-C** | 7 pasif kök kategori: arşiv mi silme mi (REC-135) | Hepsi 0 ürün. |
| **K-D** | Asit Dayanımlı Fanlar (81 SEAT ürünü) ağaçtan çıksın mı, ürünler nereye dağılsın? | §2.5. Planın en pahalı kalemi; adres geçişinden **önce** bitmeli. |
| **K-E** | K-1: alt kategori adresi iki seviyeli mi kalsın (öneri: evet) | §4. |
| **K-F** | Geçişin zamanı: K3 "Vitrin Faz 2 ile" diyor. Faz 2 uzarsa maliyet artar mı? | Bugün 194 adres var ve GSC 2026-08-29'da kuruldu; birikim az, geçiş **bugün en ucuz**. Adres sayısı arttıkça bedel artar. |
| **K-G** | `next.config.mjs:64-76`'daki 13 kuralın sondaki eğik çizgi kusuru **şimdi mi** düzeltilsin? | Çürütme buldu. Her eski adrese **bedava bir fazladan sıçrama** ekliyor, bugün canlıda. Geçişten bağımsız, küçük ve tek dosyalık. |

---

## 8-b. Çürütmenin bulduğu, planda HİÇ olmayan yüzeyler

Bunlar ilk yazımda yoktu; uygulama emrinin kontrol listesine **zorunlu** olarak girer:

| # | yüzey | kanıt | niçin patlar |
|---|---|---|---|
| 1 | **Statik üretim** — `generateStaticParams` + `revalidate = 3600` | `category/[categorySlug]/page.tsx:62,64` · `[subCategorySlug]/page.tsx:60,62` | şema değişince önceden üretilen parametre şekli değişir |
| 2 | **ISR tazeleme yolları** | `api/webhook/supabase/route.ts:172-183, 204, 357` | yollar elle `/category/` ile kuruluyor; güncellenmezse **veri değişir, sayfa değişmez ve hiçbir test görmez** — 2026-08-15'te 1044 fiyat satırının başına gelen tam bu |
| 3 | **Arama önerileri (DB fonksiyonu)** | `get_search_suggestions` | **migration ister**, kural 13 gereği merge = prod → Recep kapısı |
| 4 | **IndexNow zinciri** | `lib/seo/indexnow.ts` + `route.ts:574` | bildirimi 2 numaradan besleniyor; o bozuksa Bing'e **yanlış adresler** bildirilir |
| 5 | `public/_redirects` | Netlify kalıntısı, Vercel'de ölü | zararsız ama ad alanı ölçümünde evrene dahil edilmeli |

**Çürütmenin eledikleri (risk sanılıp ölçümle düşenler):** Google Merchant / ürün beslemesi ve
e-posta şablonlarında kategori adresi **yok** — depo tarandı, böyle bir yüzey bulunamadı.

---

## 9. Kapsam dışı

- Ürün **adresleri** (K3: değişmez) — ama ürün **sayfaları** kapsam İÇİNDE (§7.1-c: kırıntı
  yolu + yapısal veri kategori adresi taşıyor, 80 sayfa yeniden taranır).
- Nitelik katmanının kendisi (REC-95 fazları — bu plan yalnız sırasını ve SEO kuralını bağlar).
- 15A ağacının içeriği (K4-Kat, Katalog şeridi).
- Bu belgenin uygulaması: kod, migration, `next.config` satırı — **hiçbiri bu işte yok**.

---

## 10. Geri alma

Adres geçişi **geri alınabilir ama bedava değildir**: geri dönüş ikinci bir taşınmadır ve Google
açısından iki sarsıntı eder. Bu yüzden geri alma planı "eski hâle dön" değil, **ileri düzeltme**
olmalıdır:

- Yayın öncesi tam adres eşleme tablosu dosyaya yazılır (eski → yeni, 80 satır) ve commit'lenir.
  Bir adres yanlış eşlenmişse **o satır düzeltilir**, şema geri alınmaz.
- Yayın, kategori sayfalarının canlı ölçümüyle doğrulanır; 200 dönmeyen tek bir adres varsa
  yayın tamamlanmış sayılmaz.
- Tam geri dönüş yalnız şema düzeyinde bir hata (ör. kitlesel 404) hâlinde ve Recep kararıyla.

---

## 11. Bağımsız çürütme — sonuç: **BLOK** (ve düzeltmeler yukarı işlendi)

Plan, yazan şerit tarafından onaylanmadı; bağımsız bir denetçiye *"bu planı çürüt, emin
değilsen FAIL de"* diye verildi (OPS emri: 80 adres taşınıyor, zorunlu). Sonuç **BLOK** ve
üç sebebi de haklı çıktı. **Bu bölüm çürütmeyi özetler; düzeltmelerin kendisi ilgili
bölümlere işlendi** — plan artık çürütülmüş hâliyle okunur.

| # | çürütmenin bulduğu | nereye işlendi | derece |
|---|---|---|---|
| 1 | "Tek çözücü, kopya yok" **yanlış** — yedi kaçak, biri **canlı DB fonksiyonu** | §7.1-b (yeni) | **BLOK** |
| 2 | `num_redirects ≤ 1` ölçütü **tutturulamaz** (4 hop'un 3'ü bizim katmanımız değil) | §5 düzeltildi, iki bütçe | **BLOK** |
| 3 | 81 ürünü dağıtacak **veri yok** (`products`'ta gövde tipi alanı yok, dal saf değil) | §2.5 (yeni alt bölüm) | **BLOK** |
| 4 | İki adres **aynı sayfa değil**; hayatta bırakmayı önerdiğim varyant `og:url` ve `CollectionPage` **eksik** | §2.2 (yeni alt bölüm), K-E tersine döndü | YÜKSEK |
| 5 | "Ürün adresleri değişmez" **yanıltıcı** — ürün sayfaları kategori adresi taşıyor, +80 sayfa | §7.1-c (yeni), §9 | YÜKSEK |
| 6 | Ad alanı sonucu doğru ama **evrenim dardı** (23 yerine 74 slug; `admin`/`api` eksik) + yeni risk: bilinmeyen her adres DB'ye gidecek | §6 | ORTA |
| 7 | §3 sırası, henüz verilmemiş bir karara (K-E) bağlı → "değiştirilemez" değil **koşullu** | aşağıda | ORTA |
| 8 | Beş yüzey planda **hiç yoktu**: statik üretim, ISR yolları, DB fonksiyonu, IndexNow zinciri, ölü artefakt | §8-b (yeni) | **BLOK** |
| 9 | Ürün adresi sayısı 82 değil **80** | §2.1 | DÜŞÜK |

**7 numaraya cevabım:** haklı. §3'ün "değiştirilemez" ifadesi fazla güçlüydü. Doğrusu: sıra,
**K-E iki seviyeli şemayı seçerse** zorunludur (adres ebeveyn slug'ı taşıdığı için ağaç
değişimi adresi değiştirir); **tek seviyeli şema seçilirse** bağımlılık kopar ve ağaç ile adres
işleri paralel koşabilir. Yani sıra karara bağlıdır, kararın kendisi K-E'dir.

**Çürütmenin bağımsız DOĞRULADIĞI iddialar** (ölçmediğim şeyi "doğru" saymamak için):
site haritası 194 / kategori 80 · çift adres kusurunun gerçekliği (5 dal × TR+EN, tek canonical
etiketi, ölçüm tuzağına düşülmemiş) · 23+17 dağılımı · 4 hop · `/tr/category/fans` tek hop ve
dil bazlı çift içerik olmaması · 13 eski yönlendirme · 81/81 SEAT · genişletilmiş evrende
çakışmanın yine 0 olması · hreflang üçlüsünün bugün yayınlanıyor olması.

---

*Yazan: URUN şeridi, 2026-09-07. Bağımsız çürütme aynı gün koştu, BLOK verdi, düzeltmeler
işlendi. **Plan bu hâliyle de "uygula" demiyor** — Recep'in §8'deki yedi karar kalemine
cevabı olmadan uygulama emri yazılamaz.*
