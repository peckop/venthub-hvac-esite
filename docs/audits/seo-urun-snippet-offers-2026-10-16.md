# Ürün snippet'leri KRİTİK sorunu: fiyatsız ürün için yapılandırılmış veri (SEO-56, 2026-10-16)

Cetvel: `docs/standards/yayin-gorunurluk-denetim-standard.md` (şema denetimi), `docs/standards/rendering-cache-standard.md` (fiyat yüzeyi). Yöntem: Search Console raporu (yerleşik tarayıcı oturumu, 16 Ekim), haritadaki 93 adresin ham HTML'inde JSON-LD sayımı (yalnız GET), Google belgesinin okunması. Canlıya yazım yok. Sorgu/arama verisi bu dosyaya girmedi (P6).

## 1. Sorun ne

Search Console "Alışveriş > Ürün snippet'leri" raporu: 2 geçersiz öğe, 0 geçerli, tek sorun türü, KRİTİK: `hasVariant.offers`, `review` ya da `aggregateRating` belirtilmelidir. İlk tespit tarihi 16.10.2026, rapor son güncelleme 15.10.2026. Etkilenen iki adres, ikisi de aynı gün Google'ın taradığı sayfalar: `/tr/products/danfoss-vlt-micro-drive-fc-51` ve `/tr/products/danfoss-vlt-hvac-basic-drive-fc-101` (SEO-54'te dizin isteği gönderilen adresler).

## 2. Kalıp ölçümü (canlı HTML, haritadaki 93 TR adres)

| Ölçüt | Değer |
|---|---|
| Haritada ProductGroup JSON-LD'si olan adres | 47 (hepsi aile sayfası `/tr/products/<aile>`) |
| Bu sayfalarda toplam varyant (`hasVariant`) | 441 |
| `offers` taşıyan varyant | 0 (47 sayfanın 47'sinde, 441 varyantın 441'inde yok) |
| ProductGroup düzeyinde `review`, `aggregateRating`, `offers` | 0 sayfada |
| Tekil `Product` düğümlü sayfa | 0 |
| Diğer sayfalar | kategori ve marka, bilgi merkezi, ana sayfa: CollectionPage, Article, Brand, Organization, BreadcrumbList; Ürün işaretlemesi yok |

Yani sorun iki sayfaya özgü değildir. Search Console yalnız Google'ın şimdiye kadar taradığı iki adresi saymıştır; 47 aile sayfasının hepsi aynı kalıpta ve Google taradıkça her biri "geçersiz öğe" olarak eklenecektir (tahmin: 47 öğe; ölçülmedi, tarama hızına bağlı).

## 3. Sebep: kasıtlı davranış ve belge kuralının çarpışması

Kod: `src/lib/seo/jsonld.ts` `buildProductGroupJsonLd`. Fiyatsız ya da teklif kipindeki varyantta `offers` HİÇ yazılmaz (REC-111: vitrin "Teklif Alın" derken şemada gerçek fiyat yayınlanmasın). Bu doğru bir karardır ve korunmalıdır. Çarpışan kural: Google belgesine göre ürün snippet'i için `review`, `aggregateRating` ya da `offers` alanlarından en az biri ZORUNLUDUR (Search Central, "Product snippet structured data", Required properties). Teklif ve fiyat taşımayan, yorumu da olmayan bir ProductGroup bu zorunluluğu karşılayamaz; hata kalıbı kod hatası değil, "fiyatsız ürün + ürün işaretlemesi" kombinasyonudur.

## 4. Seçenekler

| Seçenek | Sonuç | Hüküm |
|---|---|---|
| A. Fiyatı olmayan ailede ProductGroup/Product yazma; yerine kategori ve seri sayfalarında zaten kullanılan `CollectionPage` + `ItemList` (model adları) yaz | Search Console'daki ürün öğeleri sıfıra iner; fiyat sızmaz; kalıp yeni açılacak katalog sayfalarına da otomatik uygulanır | ÖNERİLEN |
| B. Olduğu gibi bırak | Sayfa sıralaması etkilenmez (hata yalnız zengin sonuç uygunluğunu kapatır, zaten uygun değiliz), ama her taranan aile sayfası "kritik" öğe olarak eklenir, "Düzeltmeyi doğrula" başarısız olur, Recep'e e-posta gelmeye devam eder | Önerilmez |
| C. `aggregateRating` ya da `review` ekle | Gerçek, görünür yorum yok; uydurma yasak | Yasak |
| D. `Offer` ekle, `price: 0` yaz | Belgede `price: 0` "ödemesiz erişilebilir ürün" demektir; teklif kipindeki ürünü ücretsiz ilan etmek yanlış beyan | Yasak |
| E. `Offer` ekle, fiyatsız | `price` Offer'ın zorunlu alanıdır; hata türü değişir ("price eksik"), çözülmez | Çözmez |

## 5. Öneri (ÜRÜN kodu, tek noktada ölçeklenir)

1. `buildProductGroupJsonLd` içinde karar: ailenin TÜM varyantlarında geçerli ve görünür fiyat (offers üretilen) varsa `ProductGroup` (bugünkü biçim); en az bir varyantta teklif kipi ya da fiyat yoksa `ProductGroup`/`Product` düğümü HİÇ üretilmez ve yerine `buildSeriesLandingJsonLd` ile aynı şekil (`CollectionPage` + `mainEntity` `ItemList`, fiyat yok) yazılır. Marka bilgisi `CollectionPage` üzerinde `about: Brand` olarak taşınabilir.
2. Tek çağrı noktası (`aileSayfasi.tsx`; `ProductDetailPageView.tsx` içindeki yorum model dalının da ProductGroup'a bağlanacağını söylüyor, o zaman aynı kural orada da uygulanmalı): bütün katalog teklif kipiyle açılsa da kalıp yüzlerce sayfaya TEK değişiklikle uygulanır; sayfa başına işaretleme eklenmez.
3. Kapı: "teklif kipindeki ürünün JSON-LD'sinde `Product`/`ProductGroup` yok, `offers` yok" ve "tüm varyantı fiyatlı ailede `offers` var" iki yönlü testle kilitlenir.
4. Karışık aile (bazı varyant fiyatlı, bazısı fiyatsız) bugün YOK (47/47 hepsi fiyatsız). Çıkarsa yukarıdaki kural CollectionPage'e düşer; kısmi `hasVariant` yazılmaz (grubu eksik gösterir).

Ölçülmeyenler: Google'ın bu sayfaları hangi hızla tarayacağı; ürün işaretlemesinin yapay zekâ cevaplarında alıntıya katkısı (kanıt bulunamadı, sayfa metni aynı bilgileri taşıyor); Rich Results Test sonucu (ÜRÜN düzeltmesi canlıya çıkınca canlı test ve Search Console doğrulaması ile ölçülür).

## 6. Sonraki adımlar

| Adım | Sahip |
|---|---|
| Kod: A seçeneği (tek fonksiyon + iki yönlü test) | URUN |
| Canlıda ham HTML ölçümü: 47 sayfada `Product`/`ProductGroup` yok, `CollectionPage` var | GEO-SEO |
| FC 51 ve FC 101 için dizin isteği (yeniden tarama) + Search Console "Düzeltmeyi doğrula" | GEO-SEO |
| Doğrulama sonucunu bekleme (Google birkaç gün ile iki hafta arası sürer, süre ölçülecek) | GEO-SEO |
