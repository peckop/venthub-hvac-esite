# Yazı Türleri Haritası (Harita) — v0.1 TASLAK

> **Ne yönetir:** Sitedeki her metin alanının hangi cetvelle yazıldığı, kimin yazdığı, kimin cetvel sahibi
> olduğu ve arama tarafının (GEO-SEO) o alanda neyi ölçtüğü, neyi önerdiği, hangi kapıyı işlettiği. Bu belge
> bir **haritadır, cetvel değil**: kuralı koymaz, kuralın nerede durduğunu gösterir.
> **Niçin var:** Recep sordu (6 Kasım 2026): farklı alanlarda yazı yazılıyor, kim ne yapacak, kesimler bilinmeli.
> Kart BLG-43. Altı departman kendi satırını doğruladı (BLOG, GEO-SEO, URUN, KATALOG, ALTYAPI, HARİTA); görüşlerin
> tam metni kartta ve depo dışı taslakta durur, burada kopyalanmaz (kopya üçüncü bir gerçek kaynağı olur).
> **Sahibi:** HARİTA şeridi yalnız bu belgenin **biçiminin** sahibidir (sütunlar, README satırı, Cuma gözden
> geçirmesi). **Satır içeriğinin sahibi o satırdaki cetvelin sahibidir:** BLOG, URUN, GEO-SEO, KATALOG.
> Başkasının cetveli sahibine sorulmadan değiştirilmez.
> **Son doğrulama:** 2026-11-06 (BLOG; altı departman görüşüne ve cetvellerin başlık ve sahip satırlarına karşı).
> **Gözden geçirme:** her Cuma, her rolün öz-değerlendirmesindeki "bayat kart ya da kayıt" maddesine bağlı;
> yeni görev açılmaz. 14 günü aşan "Son doğrulama" hücresi belge-tazelik ölçümüne düşer.

## Kurallar (bu belgenin)

1. Hücrede **cetvel adı ve bölüm numarası** yazılır; cetvelin içeriği kopyalanmaz.
2. **Yazan** ile **Cetvel sahibi** ayrı sütundur. Metni yazan hat cetvelin sahibi olmayabilir.
3. **Arama verisi** (sorgu, sıra, tıklama, gösterim) bu belgeye ve örneklerine yazılmaz. Ölçümün durduğu yer:
   `~/VentHub-Olcum-Arsiv/geo-seo/INDEKS.md` (GEO-SEO; değer değil, yer).
4. **Ölçülmeden hedef sayfa kararı yok:** aynı sorgu hem ürün ya da kategori sayfasına hem rehbere uyuyorsa
   hangisinin hedefleneceğini GEO-SEO SERP türüne bakarak yazar, öbür sayfa iç bağlantıyla yönlendirir.
   Önce `olcum-defteri.mjs --sor` ile daha önce ölçülüp ölçülmediğine bakılır (`geo-olcum-standard` D8).
5. **Kalıp kararı** tek ölçümle verilmez: bir kalıbı doğrulamak ya da değiştirmek için aynı yönde en az iki
   yazının ölçümü gerekir; ölçüm tarihi satıra yazılır.
6. GEO-SEO hiçbir satırda **yazan** değildir: SEO'nun rolü üç parçadır, **ölçüm · öneri · kapı**.

## Harita

| Alan | Kalıp / cetvel | Yazan | Cetvel sahibi | SEO: ölçüm | SEO: öneri | SEO: kapı | Kod ve betik | Yeni sitede | Son doğrulama |
|---|---|---|---|---|---|---|---|---|---|
| Rehber yazısı: genel (nedir, nasıl seçilir) | `rehber-yazisi-standard` R3.3 (makale tarzı) | BLOG | BLOG | yazım öncesi arama talebi ve marka/model listesi B1a; 14. gün ölçümü; dizin takip defteri (`dizin-sistemleri-standard` D7); "daha önce ölçüldü mü" (`geo-olcum-standard` D8) | taslak okuması B6a | canlı kapı ve lastmod kuralı (`yayin-gorunurluk-denetim-standard` Y2) | sayfa ve rota URUN; yazı kaydı BLOG (`yazilar.ts` gövde ve tarih alanları) | açık: Design İçerik'e hangi kurallar geçer (ayrı kart) | 2026-11-06 BLOG, GEO-SEO |
| Rehber yazısı: çeşit ve hub | `rehber-yazisi-standard` hub kalıbı | BLOG | BLOG | aynı | aynı | aynı | aynı | aynı | 2026-11-06 BLOG |
| Rehber yazısı: ürün ve aile bağlantılı | `rehber-yazisi-standard` R3.3; ürün bağı yalnız `vh:aile/...` kimliği, fiyat yok | BLOG | BLOG | aynı | aynı | aynı | fikstür tamlık testi (BLG-42) | aynı | 2026-11-06 BLOG |
| Ürün ve aile sayfası metni | `vitrin-metni-standard` K1-K10 | KATALOG içerik hattı (kaynak: katalog); BLOG yazmaz | URUN | hedef sorgu ve SERP türü | başlık ve meta önerisi (yazmaz) | canlı kapı: title ve meta kusur ölçümü (Y2) | betik ve yazma kapısı kodu KATALOG (`scripts/icerik-hatti/**`); sayfa, zincir ve JSON-LD URUN; CI, bağımlılık ve güvenlik kapıları ALTYAPI; canlı yazım OPS | metin Design İçerik'ten; vitrin kodu ve başlık, meta, JSON-LD üreticisi URUN'da (OPS-180 C aşaması) | 2026-11-06 URUN, KATALOG, ALTYAPI |
| Kategori title ve meta (DB alanı) | kalıp cetveli açık | **açık** | açık | bulgu, canlı kapı ölçümü, IndexNow, Google | bulgu OPS'a | canlı kapı (Y2) | plan dosyası URUN; canlı yazım OPS | Design İçerik (Recep onayıyla) | 2026-11-06 URUN, GEO-SEO |
| Kategori ve marka açıklaması, ana sayfa, hakkımızda | `vitrin-genel-metin-standard` TASLAK, eski sitede yürürlükte değil | BLOG | BLOG | M5 kapı ölçümü | liste önerisi | M5 kapı KODU GEO-SEO (SEO-20); LİSTE ayrı veri dosyası, sahibi BLOG; yürürlüğe girmeden çalışmaz | kategori kısa metni DB alanından gelir (rehber kartında da görünür), BLOG yazmaz | karar Recep (Design'a giden her not Recep onayıyla) | 2026-11-06 BLOG, GEO-SEO |
| Kategori adı | `kategori-adlandirma-standard` | URUN (yalnız sözlüğe yazar) | URUN | — | — | — | adı değiştirmek Recep ve Design kararı | Design İçerik | 2026-11-06 URUN |
| Föy (PDF) yazı tipi | `foy-yazi-tipi-standard` | URUN | URUN | — | — | — | — | — | 2026-11-06 URUN |
| Föy içeriği | **cetvel yok**; föy işi açılınca yazılır | açık | yok | — | — | — | — | — | 2026-11-06 OPS hükmü |
| UnoPIM ürün verisi (marka, kategori, fiyat ve KDV alanı, adres) | `product-schema-standard`, `catalog-ingestion-standard` | KATALOG | KATALOG | adres alanını kapıda ölçer | — | canlı kapı | yazım betikleri KATALOG; adres alanı değerini Design belirler | canlıya geçiş Recep kapısı | 2026-11-06 KATALOG |
| llms.txt, dizin takibi, ölçüm arşivi | `dizin-sistemleri-standard`, `geo-olcum-standard`, `yayin-gorunurluk-denetim-standard`, `pazar-olcum-standard` | GEO-SEO | GEO-SEO | dizin isteği (Google, Bing, Yandex, IndexNow); YAP ve TEKRAR dışındaki adres × motor'a istek atılmaz (D7) | — | — | — | adres tabanlı, yeni sitede çalışır; eşikler yeniden ölçülür | 2026-11-06 GEO-SEO |
| Bilgi merkezi yönlendirme betiği | — (OPS hükmü, 6 Kasım) | BLOG | BLOG | — | — | — | `bilgiMerkeziYonlendirmeleri` | — | 2026-11-06 BLOG |

## Kesişim kuralları

- **Rehber ve içerik değişince tarih:** yazı içeriği değişince `guncellemeTarihi` aynı PR'da değişir (site haritası
  lastmod ve Article dateModified aynı alanı izler). Tarih alanı BLOG'un, ölçen kapı GEO-SEO'nundur.
- **Rehberden ürüne bağ:** yalnız `vh:aile/...` kimliğiyle. Bağlanan sayfanın sayı alanları yazıdaki tabloyla
  karşılaştırılır; fark KATALOG'a gider, BLOG sayıyı kendi başına düzeltmez.
- **Yeni aile ya da kategori bağlanınca** test kataloğu (`sahteKaynak.ts`) aynı PR'da güncellenir; eksiği
  `fiksturTamlik.test.ts` adıyla söyler.
- **Canlıya yazan betik değişirse** onay yolu kural 13 ve OPS'tur; ALTYAPI'nın payı betiğin koştuğu CI kapılarıdır.

## Açık noktalar

| Konu | Durum | Karar yeri |
|---|---|---|
| `vitrin-metni-standard` satır 8 ve 230 "yazma kapıları ALTYAPI" diyor; araç envanteri, son commit'ler ve rol kartları KATALOG'u gösteriyor | bayat, düzeltme URUN'un | URUN |
| "Makale tarzı" kalıbı tek rakip ölçümünden çıktı | ölçülüyor; 14. gün ölçümleri (rehber yazıları BLG-39 ve BLG-40) sonra, en az iki yazıda aynı yön | BLOG, GEO-SEO |
| `vitrin-genel-metin-standard` yeni sitede kural olarak kullanılacak mı | eski sitede yürürlüğe girmez (karar 412); yeni sitede Recep kararı | Recep |
| Kategori title ve meta satırının yazanı | yol bugünkü: GEO-SEO bulgusu, OPS emri, URUN planı, OPS canlı yazım, Recep onayıyla | OPS |
| Yeni sitede GEO-SEO kapı eşikleri (title, meta, şablon, bilinen kusur) | bugünkü sitenin kusurlarına göre yazıldı; yeni sitenin ilk yayınında yeniden ölçülür | GEO-SEO |
| `docs/roller/cetvel-sahipligi.md` kayıt eksikleri (rehber-yazisi, vitrin-metni, vitrin-genel-metin, dizin-sistemleri, geo-olcum, yayin-gorunurluk, pazar-olcum, icerik-hatti betikleri) | kapandı (7 Kasım, HARİTA HRT-115): sekiz cetvelin hepsi başlıkta `Sahibi` taşıyor; sahiplik tablosu yalnız başlığında sahibi olmayan cetvelleri tutar, eksik kayıt yok. Betik sahipliği rol kartı Dosyalar satırlarında: `scripts/icerik-hatti/**` KATALOG, `scripts/hafiza/**` ALTYAPI (ARAÇ ikincil), `scripts/arac/**` ARAÇ | HARİTA |
