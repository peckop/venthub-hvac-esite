# Google Search Central denetimi: canlı site × resmî kurallar (2026-10-25)

Kanban: SEO-61 (üst kayıt REC-461). Sahip: GEO-SEO. Cetvel: `docs/standards/yayin-gorunurluk-denetim-standard.md`,
`docs/standards/geo-olcum-standard.md`. Yöntem: elle ölçüm (depo dışı kısa betik), salt okuma, canlıya yazım yok.

## Kapsam ve yöntem

- **Sayım (tam):** canlı `https://venthub.com.tr/sitemap.xml` içindeki **94 adresin tamamı** sunucu HTML'i olarak çekildi
  (yönlendirme elle izlendi, istemci JavaScript'i çalıştırılmadı = Googlebot'un ilk taradığı HTML). Her adreste: HTTP durumu,
  yönlendirme sayısı, `<title>`, meta açıklama, `meta robots` + `X-Robots-Tag`, `rel=canonical`, `rel=alternate hreflang`,
  `<html lang>`, H1 sayısı, sunucu HTML görünür kelime sayısı (script/style/svg hariç), JSON-LD türleri, `og:url`, site
  haritası `lastmod`.
- **Temsili örnek:** her sayfa türünden en az bir adres olacak biçimde 25 adres (aşağıdaki tablo).
- **Search Console:** "Sayfayı dizine ekleme" raporu (25 Ekim okuması) neden satırları ve iki satırın adres listesi;
  yalnız **site adresleri** okundu, sorgu verisi okunmadı/yazılmadı (P6).
- **Kod karşılaştırması:** bulgunun bilinçli bir karardan mı geldiği `src/app/sitemap.ts`, `src/app/[lang]/layout.tsx`,
  `src/app/[lang]/legal/*/page.tsx` okunarak ayrıldı.
- Ölçüm verisi (adres başına JSON) depo dışındadır: `C:/tmp/vh-arsiv/geo-seo/denetim-461/sonuc.json`. Tekrar koşmak için
  aynı ölçüm kalemleri yeterlidir; betik bu PR'da depoya alınmadı (tek seferlik denetim).

Resmî kaynaklar (Google Search Central): sayfa başlığı ve açıklama (`/search/docs/appearance/title-link`,
`/search/docs/appearance/snippet`), standart adres (`/search/docs/crawling-indexing/consolidate-duplicate-urls`),
yerelleştirilmiş sürümler (`/search/docs/specialty/international/localized-versions`), robots meta
(`/search/docs/crawling-indexing/robots-meta-tag`), site haritası (`/search/docs/crawling-indexing/sitemaps/build-sitemap`),
dizin raporu nedenleri (Search Console Yardım, "Sayfa dizine ekleme raporu").

## Özet sayılar (94 adres, 25 Ekim)

| Ölçüt | Sonuç | Resmî kurala göre |
|---|---|---|
| HTTP 200 | 94 / 94 | Uygun |
| Yönlendirmeyle açılan harita adresi | 0 | Uygun |
| `rel=canonical` var ve kendisini gösteriyor | 94 / 94 | Uygun |
| Birden fazla canonical | 0 | Uygun |
| Title boş / tekrar eden | 0 / 0 | Uygun |
| Title 60 karakterden uzun | 5 (en uzun 72) | Kural değil; arama sonucunda kısalabilir |
| Meta açıklama boş / tekrar eden | 0 / 0 | Uygun |
| Meta açıklama cümle ortasında "…" ile kesik | **24** | Uygun değil (bulgu 2) |
| H1 yok | 0 | Uygun |
| Aynı H1 iki kez | **47** (ürün ailesi sayfalarının tamamı) | Kural ihlali değil; bulgu 4 |
| Harita adresinde `noindex` | **3** (yasal sayfalar) | Çelişki (bulgu 3) |
| `X-Robots-Tag: noindex` | 0 | Uygun |
| `hreflang` etiketi | 0 | EN kapalıyken tutarlı (bulgu 5) |
| `<html lang="tr">` | 94 / 94 | Uygun |
| Sunucu HTML 200 kelimenin altında | 2 (`/tr/contact` 184, `/tr/category/siginak-havalandirma` 195) | Bilgi |
| JSON-LD yok | 8 (ürünler, markalar, iletişim, hakkımızda, ürün seçici, yasal) | Bilgi |
| Haritada `lastmod` yok | 15 (statik sayfalar) | Bilinçli: uydurma tarih yazılmıyor (REC-454) |
| robots.txt | `Allow: /`, yalnız `/admin/ /auth/ /account/ /checkout/` kapalı, Sitemap satırı var | Uygun |

Search Console "Sayfayı dizine ekleme" (25 Ekim): dizinde **155**, dizinde değil **127**. Nedenler: `noindex` 64 (EN ağacı
`EN_YAYIN` kapalı, sepet, yasal), yönlendirmeli 9 (eski adresler, 308), **keşfedildi–şu anda dizinde değil 49**,
kopya–Google farklı standart seçti 2 ve standart seçilmemiş kopya 1 (eski iç içe kategori adresleri; ikisi de 308 ile yeni
adrese gidiyor, ölçüldü), tarandı–şu anda dizinde değil 2, sunucu hatası 0.

## En kritik 5

1. **Site haritasının yarısı Google'ın dizininde değil.** "Keşfedildi – şu anda dizine eklenmemiş" listesindeki 49 adresin
   **49'u da site haritamızda**: 47 ürün ailesi sayfasının **38'i**, 28 kategorinin **11'i**. Google bu durumda adresi
   bildiğini ama henüz taramadığını söyler; küçük bir sitede bunun sebebi tarama bütçesi değil, Google'ın sayfaya öncelik
   vermemesidir. Sayfaların kendisi teknik olarak temiz (200, canonical kendisi, sunucu HTML'i dolu, medyan 566 kelime).
   **Öneri:** (a) Google dizin isteği kuyruğunda bu 49 adres öne alınır (günlük sınır ~11, yaklaşık 5 gün; GEO-SEO);
   (b) ana sayfa ve kategori sayfalarından bu ailelere giden iç bağlantılar sayılır, kategorisiz ya da tek bağlantılı aile
   kalmaz (sayfa sahibi); (c) 14 gün sonra aynı rapor yeniden okunur.
2. **24 sayfada meta açıklama cümle ortasında kesiliyor.** Ürün ailesi ve marka sayfalarında açıklama ~150 karakterde
   "…" ile bitiyor (örnek: FC 101 "…sunan bir…", 16 Ekim'de bildirildi, hâlâ aynı). Google açıklama için karakter sınırı
   koymaz; sayfayı doğru özetleyen tam cümle ister, kesik metinde kendi snippet'ini yazar. **Öneri:** açıklama üreticisi
   metni kelime ortasında değil cümle sonunda bitirsin; 160'ı aşıyorsa son tam cümlede kessin, "…" eklemesin.
3. **Yasal üç sayfa hem `noindex` hem site haritasında.** `/tr/legal/kvkk`, `gizlilik-politikasi`, `cerez-politikasi`
   `noindex, follow` basıyor (URN-97, `yasalDizinDisi()`), ama `src/app/sitemap.ts` (satır 116-118) onları sabit listeyle
   ekliyor. Aynı dosyanın sepet için yazdığı kural ("dizine kapalı adres haritada ilan edilmez") burada çiğneniyor; Search
   Console'da "gönderildi ama noindex" olarak görünür. **Öneri:** site haritası yasal satırları aynı `yasalDizinDisi()`
   koşuluyla süzsün (tek koşul, iki yüzey).
4. **Ürün ailesi sayfalarının 47'sinde aynı H1 iki kez geliyor.** Sunucu HTML'inde başlık iki kez yazılıyor (büyük
   olasılıkla mobil ve masaüstü düzen ayrı çiziliyor). Google birden fazla H1'i cezalandırmaz; ama aynı başlığın iki kez
   okunması ekran okuyucu için tekrar, sayfa ana başlığı için belirsizliktir. **Öneri:** tek H1 kalsın, ikinci görünüm
   `aria-hidden` ya da `<p>`/`<div>` olsun. Hangi bileşenin iki kez çizdiği bu denetimde ölçülmedi.
5. **EN açılış günü için hreflang hazırlığı yok.** EN ağacı bilinçli olarak `noindex, follow` (`EN_YAYIN` kapalı,
   `src/app/[lang]/layout.tsx`); bu yüzden bugün hreflang olmaması doğru. Ama EN sayfa `<html lang="tr">` basıyor ve hiçbir
   sayfada `hreflang` / `x-default` üretimi görünmüyor. EN açıldığı gün Google'ın istediği üçlü (her sürümde kendine ve
   karşı sürüme karşılıklı hreflang, `x-default`, sürümün kendi canonical'ı) aynı anda gelmezse iki dil birbirinin kopyası
   sayılabilir. **Öneri:** `EN_YAYIN` açılışının kabul listesine bu üçlü + `lang="en"` yazılsın; açılış günü bu denetim
   hreflang karşılıklılığı için yeniden koşulur (ölçüm betiği karşılıklılığı zaten sınıyor).

## Temsili 25 adres

Tür başına seçim: ana 1, genel sayfa 5, bilgi merkezi dizini 1, rehber 3, kategori 6, ürün ailesi 6, marka 2, yasal 1.
"Açıklama kesik" = son karakter nokta, ünlem, soru ya da parantez değil.

| # | Adres (yol) | Tür | HTTP | Title kr. | Açıklama kr. / kesik | H1 | Canonical = kendisi | robots | Sunucu HTML kelime | lastmod |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/tr` | ana | 200 | 61 | 175 / hayır | 1 | evet | index, follow | 1270 | yok |
| 2 | `/tr/products` | genel | 200 | 56 | 163 / hayır | 1 | evet | index, follow | 1153 | yok |
| 3 | `/tr/brands` | genel | 200 | 18 | 142 / hayır | 1 | evet | - | 361 | yok |
| 4 | `/tr/contact` | genel | 200 | 18 | 124 / hayır | 1 | evet | - | 184 | yok |
| 5 | `/tr/about` | genel | 200 | 20 | 181 / hayır | 1 | evet | - | 283 | yok |
| 6 | `/tr/urun-secici` | genel | 200 | 48 | 119 / hayır | 1 | evet | - | 202 | yok |
| 7 | `/tr/bilgi-merkezi` | bilgi dizini | 200 | 54 | 113 / hayır | 1 | evet | - | 301 | 2026-10-17 |
| 8 | `/tr/bilgi-merkezi/frekans-konvertoru-nedir` | rehber | 200 | 65 | 130 / hayır | 1 | evet | - | 2552 | 2026-10-14 |
| 9 | `/tr/bilgi-merkezi/radyal-fan-mi-aksiyel-fan-mi` | rehber | 200 | 58 | 145 / hayır | 1 | evet | - | 2599 | 2026-10-14 |
| 10 | `/tr/bilgi-merkezi/sessiz-fan-nasil-secilir` | rehber | 200 | 72 | 148 / hayır | 1 | evet | - | 3403 | 2026-10-17 |
| 11 | `/tr/category/aksesuarlar` | kategori | 200 | 54 | 115 / hayır | 1 | evet | - | 211 | 2026-08-27 |
| 12 | `/tr/category/isi-geri-kazanim` | kategori | 200 | 59 | 152 / hayır | 1 | evet | - | 406 | 2026-08-31 |
| 13 | `/tr/category/banyo-tuvalet-fanlari` | kategori | 200 | 55 | 142 / hayır | 1 | evet | - | 272 | 2026-08-31 |
| 14 | `/tr/category/elektrikli-kanal-isiticilari` | kategori | 200 | 59 | 119 / hayır | 1 | evet | - | 207 | 2026-08-27 |
| 15 | `/tr/category/hucreli-aspiratorler` | kategori | 200 | 60 | 118 / hayır | 1 | evet | - | 235 | 2026-10-06 |
| 16 | `/tr/category/korozyona-ve-aside-dayanimli-fanlar` | kategori | 200 | 55 | 138 / hayır | 1 | evet | - | 298 | 2026-10-06 |
| 17 | `/tr/products/avens-bvu-siginak-havalandirma-uniteleri` | ürün ailesi | 200 | 46 | 149 / evet | 2 | evet | - | 403 | 2026-10-06 |
| 18 | `/tr/products/avens-isi-geri-kazanim-cihazlari` | ürün ailesi | 200 | 42 | 127 / hayır | 2 | evet | - | 420 | 2026-10-06 |
| 19 | `/tr/products/danfoss-vlt-hvac-basic-drive-fc-101` | ürün ailesi | 200 | 45 | 153 / evet | 2 | evet | - | 653 | 2026-10-09 |
| 20 | `/tr/products/nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar` | ürün ailesi | 200 | 59 | 108 / hayır | 2 | evet | - | 493 | 2026-10-06 |
| 21 | `/tr/products/vortice-deumido-nem-alma-cihazlari` | ürün ailesi | 200 | 44 | 150 / evet | 2 | evet | - | 540 | 2026-10-10 |
| 22 | `/tr/products/vortice-radon-serisi-cati-fanlari` | ürün ailesi | 200 | 43 | 119 / hayır | 2 | evet | - | 552 | 2026-10-16 |
| 23 | `/tr/brands/vortice` | marka | 200 | 39 | 152 / evet | 1 | evet | - | 267 | yok |
| 24 | `/tr/brands/seat` | marka | 200 | 36 | 82 / hayır | 1 | evet | - | 248 | yok |
| 25 | `/tr/legal/kvkk` | yasal | 200 | 40 | 83 / hayır | 1 | evet | noindex, follow | 823 | yok |

"robots: -" = sayfada `meta robots` yok, varsayılan `index, follow` geçerli.

## Bilinçli olduğu ölçülen durumlar (bulgu değil)

- EN ağacının `noindex, follow` olması ve site haritasının yalnız TR adres içermesi: `EN_YAYIN` kapalı
  (`src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx`).
- 15 statik adreste `lastmod` olmaması: tarih yalnız kaydın kendi `updated_at`'inden yazılıyor, uydurma tarih yok
  (`src/app/sitemap.ts`, REC-454).
- Ürün ailesi sayfalarında `Product`/`ProductGroup` yerine `CollectionPage` + `ItemList`: teklif kipinde fiyatsız ürün için
  karar 379 ve URN-138 (SEO-56; Search Console ürün snippet'i doğrulaması 25 Ekim'de "Başarılı").
- Search Console'daki 3 "kopya" satırı eski iç içe kategori adresleri; ikisi 308 ile yeni adrese gidiyor (ölçüldü).

## Diğer bulgular (düşük öncelik)

- Ana sayfada `og:url` `https://venthub.com.tr` (canonical `/tr`); sosyal paylaşım önizlemesi için canonical ile aynı olmalı.
- 5 title 60 karakteri aşıyor (ana sayfa, iki rehber, iki Vortice ailesi); arama sonucunda kısalabilir, kural ihlali değil.
- 2 sayfa sunucu HTML'inde 200 kelimenin altında (`/tr/contact`, `/tr/category/siginak-havalandirma`).
- 8 sayfada JSON-LD yok (genel sayfalar ve yasal); zorunlu değil.

## Sahiplik

| Bulgu | Önerilen sahip |
|---|---|
| 1 (dizin isteği kuyruğu, 14. gün okuması) | GEO-SEO |
| 1 (iç bağlantı sayımı), 2, 4 | Ürün/sayfa şablonu sahibi |
| 3, 5 (site haritası süzgeci, EN açılış kabul listesi) | Site haritası ve dil katmanı sahibi |

Dağıtımı OPS yapar; bu rapor yalnız ölçüm ve öneridir.
