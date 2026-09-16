# VentHub Ürün Yapısal Verisi Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** "Ürün ve aile sayfalarının arama motorlarına **hangi yapısal veriyi
> (JSON-LD / schema.org) beyan ettiği**" sorusunun karar veren tek doğruluk kaynağıdır.
> Çelişki durumunda bu cetvel kazanır.
>
> **Kapsam DIŞI, karıştırılmasın:** ürün **veritabanı** şeması → `product-schema-standard.md`
> (ayrı cetvel, ayrı şerit). Bu belge veritabanını değil, o verinin arama motoruna
> **nasıl beyan edildiğini** yönetir. Adresler/canonical → `INV-CANONICAL-*` kapıları.
>
> **SSOT kod:** `src/lib/seo/jsonld.ts`. Yapısal veri üreten ikinci bir yer YOKTUR ve açılmaz.

---

## 0. Niçin bu cetvel sonradan yazıldı (dürüstlük notu)

Bu belge 2026-09-08'de, **REC-269 bulgu 3** ile birlikte yazıldı. O ana kadar ürün yapısal
verisi için yazılı cetvel **yoktu**; kurallar kodun yorumlarında ve tek tek kapılarda
dağınık duruyordu. REC-269 ölçümü boşluğu adıyla tespit etti ve düzeltme işi cetveli
yazmayı da kapsadı (CLAUDE.md kural 1). Aşağıdaki maddelerin çoğu **yeni kural değil**,
zaten uygulanan ve kapıyla korunan hükümlerin yazıya geçirilmesidir; kaynağı her maddede
yazılıdır.

---

## 1. Aksiyomlar

* **A1 — Beyan, gerçeğin aynısıdır.** Yapısal veri müşteriye görünmez ama arama motoruna
  verilen bir **taahhüttür**. Vitrinde görünmeyen bir şeyi beyan etmek (fiyat), ya da
  elimizde olmayan bir şeyi varmış gibi yazmak (üretici kodu, temsili görsel) yanlış
  beyandır. Yanlış beyanın bedeli sıralama kaybı değil, **güven kaybıdır**.
* **A2 — Eksik alan, uydurulmuş alandan iyidir.** Bir alanın değeri yoksa alan **hiç
  yazılmaz**; `null`, boş dize ya da temsili bir yedek yazılmaz. schema.org bu alanların
  çoğunu zorunlu tutmaz.
* **A3 — Tek doğruluk kaynağı.** Vitrinde bir hükmü veren fonksiyon neyse, yapısal veride
  de **o fonksiyon** çağrılır. İkinci bir kopya yazmak, gün gelip ayrışacak iki gerçek
  üretir. (Ölçülmüş vaka: teklif modu iki yerde ayrı yazılmıştı; 80 ürün adresinin
  72'sinde vitrin "Teklif Alın" derken JSON-LD gerçek fiyat yayınlıyordu — REC-111.)
* **A4 — Yapısal veri dili bilir.** `/en` sayfasının beyanı Türkçe ad taşıyamaz; ad ve
  açıklama vitrinin kullandığı dil çözücüsünden geçer (REC-108, REC-110).

---

## 2. Aile sayfası — `ProductGroup`

Aile sayfası tek `Product` değil, `ProductGroup` + `hasVariant[]` yayınlar.

| alan | kural | kaynak / kapı |
| -- | -- | -- |
| `productGroupID` | `family.slug` | REC-105 |
| `name` | `familyName(family, lang)` — ham kolon YASAK | REC-108 |
| `url` | aile adresi; **varyant adresi yazılmaz** | F5-B |
| `image` | **varsa yazılır, yoksa alan hiç yazılmaz** (§2.1) | `INV-URUNGRUBU-GORSEL-1` |
| `brand` | `family.brand_name` varsa | — |
| `hasVariant[]` | her varyant için `Product` (§3) | — |

### 2.1 Grup görseli — kapak kuralı KOPYALANMAZ

Grup görseli, **varyant sırasına göre ilk görselli varyantın ilk görselidir**. Bu kural
yeni değildir: `family.service.ts` (`getSeriesLanding`) ve `get_family_detail` RPC'si aynı
kapak kuralını uygular. Builder, sırayı zaten koruyan `hasVariant` dizisinden ilk görselli
düğümü seçer — yani kuralı **yeniden yazmadan** aynı sonucu verir.

**Ayrı bir "grup kapağı" kuralı icat etmek yasaktır**: üçüncü bir doğruluk kaynağı olur ve
gün gelir üçü ayrışır (A3).

Hiçbir varyantın görseli yoksa **alan hiç yazılmaz** (A2). Yedek/temsili görsel koymak,
arama motoruna "o ailenin ürünü budur" demektir ve yanlış beyandır.

> **Ölçüm, 2026-09-08 (canlı):** 47 ailenin **34'ü** bu kuralla görsel türetir, **13'ünde**
> hiç ürün görseli yoktur. O 13 aileyi kod değil **katalog verisi** kapatır. Kapı yeşilken
> bile bu 13 aile görselsiz kalır; kapı bunu kusur saymaz çünkü kusur orada değildir.

### 2.2 `variesBy` — BUGÜN BEYAN EDİLMEZ, ve bu bir eksiklik değil karardır

`variesBy`, varyantların hangi eksende ayrıştığını (çap, debi, gövde) söyler. **Bugün
yazılmaz**, çünkü varyantlarda o ekseni taşıyan yapılandırılmış özellik yoktur. Ekseni
beyan edip varyantlarda o özelliği vermemek, A1'in ihlalidir: Google'a "bu eksende
ayrışıyorlar" deyip ekseni gösterememek, hiç söylememekten kötüdür.

**Ön koşul:** ayrışma ekseninin varyant düzeyinde yapılandırılmış veri olarak var olması
(katalog verisi işi). O koşul sağlanmadan bu alanı ekleyen değişiklik **reddedilir**.

---

## 3. Varyant düğümü — `Product`

| alan | kural | kaynak / kapı |
| -- | -- | -- |
| `name` | `getProductDisplayName(variant, family, lang)` — ham `variant.name` YASAK | REC-110 |
| `sku` | **yazılır.** Satıcının kendi kodudur, bizimdir, beyanı doğrudur | REC-272 |
| `mpn` | yalnız `model_code` varsa. **`sku`'ya düşmek YASAK** (§3.1) | `INV-IC-KOD-SIZINTISI-1` |
| `image` | varyantın ilk görseli varsa | — |
| `offers` | yalnız teklif modu KAPALI ve fiyat geçerliyken (§3.2) | REC-111 |

### 3.1 `mpn` ≠ `sku`

`mpn` **üreticinin** kodudur, `sku` **bizim** kodumuzdur. `model_code` yokken `sku`'ya
düşmek, arama motoruna "üreticinin kodu budur" diye yanlış beyandır. `getProductModelLabel`
kod yoksa `null` döner ve alan hiç yazılmaz.

> Bu kusur üç yüzeyde birden yaşadı ve **bir test onu sabitlemişti** (`mpn = model_code ??
> sku` diye ölçüyordu). Bugün 374 ürünün 374'ünde `model_code` dolu olduğu için yedek dal
> hiç çalışmıyordu — yani kusur **uyuyordu** ve kaynağında kodu olmayan ilk ürün geldiği
> gün sessizce uyanacaktı (REC-272).

### 3.2 Fiyat — teklif modunda `offers` YAZILMAZ

Karar `quoteModeHesapla(mainCategory, variant)` ile verilir; vitrinle **aynı fonksiyon**.
Görünmeyen bir fiyatı yapısal veride bildirmek Google politikasının ihlalidir. Fiyatı
`null`, 0 veya negatif olan varyanta da `offers` yazılmaz — "0,00 ₺" beyanı fiyatsızlığın
yanlış yazılışıdır.

`mainCategory` bilinmiyorsa (`null`) hüküm **güvenli tarafa düşer**: teklif modu varsayılır.

---

## 4. Değişiklik kuralı

Bu cetvele bir alan eklemek isteyen değişiklik şunları getirmek zorundadır:

1. **Alanın değerinin nereden geldiği** — vitrinde o hükmü veren fonksiyonun adı (A3).
2. **Değer yoksa ne olacağı** — cevap A2 gereği "alan hiç yazılmaz" olmalıdır.
3. **Bir kapı** (`INV-*`) ve o kapının **sabotajla** kırmızı verdiğinin kanıtı.
4. Beyanın **doğru olduğunun ölçümü** — kaç kayıtta alan dolar, kaçında boş kalır ve
   boş kalanların sebebi kod mu veri mi.

---

## 5. Bilinen sınırlar

* Bu cetvelin kapıları **builder'ın sözleşmesini** ölçer, canlı sayfayı değil. Fonksiyonun
  sayfada çağrıldığını ve çıktının HTML'e basıldığını başka kapılar tutar.
* `aggregateRating` / `review` **hiç yayınlanmıyor** — gerçek değerlendirme verimiz yok.
  Uydurulmuş puan A1'in en ağır ihlalidir ve Google yaptırımı doğrudan cezadır.
* Kategori sayfası `CollectionPage` + `ItemList` yayınlar; bu cetvelin kapsamında ama
  bugün ayrı bir hüküm gerektirmemiştir.
