---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\sitemap.ts
skeleton_hash: ebc623b3db63a7de
entity_hashes:
  func:sitemap: 07414dd0bcd23791
  overview: 1f20e97deb68e19e
generated_at: 2026-05-29T11:36:50Z
---

## Genel Bakış
Bu modül, Next.js uygulaması için site haritasını (sitemap) dinamik olarak oluşturmaktan sorumludur. Asenkron bir fonksiyon kullanarak uygulamadaki kategoriler ve ürünler gibi farklı içerik türlerinin URL'lerini toplar ve arama motorları için gerekli olan son değişiklik tarihi, değişim sıklığı ve öncelik gibi meta verilerle zenginleştirerek standart bir site haritası yapısı üretir.

## Fonksiyon Grupları
### Site Haritası Oluşturma
Bu grup, uygulamanın tüm rotalarının (hem statik hem de dinamik) taranarak arama motoru dostu bir site haritası verisi hazırlanmasını yönetir.
- sitemap

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz ve asenkron çalışan bir site haritası oluşturucusudur. Fonksiyon gövdesi verilmediği için sadece imzadan çıkarılabilecek minimum mimari varsayımlar aşağıdadır.

**[Aksiyom 1]**: Eğer `sitemap()` fonksiyonu bir parametre ile çağrılırsa, fonksiyon beklenmeyen davranış gösterir veya hata oluşur.

**[Aksiyom 2]**: Eğer fonksiyon asenkron (promise) olarak çağrılmazsa veya dönen değerin `await` edilmesi gerekirken edilmezse, site haritası verisi düzgün işlenemez.

**[Aksiyom 3]**: Eğer fonksiyonun çalışması için gerekli veri kaynakları (örn: kategoriler, ürünler listesi) erişilebilir değilse, site haritası eksik veya boş döner.

**[Aksiyom 4]**: Eğer Next.js site haritası API'sinin beklediği response formatı (Content-Type: application/xml vb.) sağlanmazsa, arama motorları site haritasını tanıyamaz.

---

## FONKSİYON DETAYLARI

### sitemap
**Ne yapar**: Bu fonksiyon, web sitesinin tüm sayfalarını (statik sayfalar, kategoriler, markalar ve ürünler) arama motorları için yapılandırılmış bir site haritası formatında, çoklu dil desteğiyle (Türkçe ve İngilizce) oluşturur.
**Nasıl yapar**: Fonksiyon, site URL'sini ve desteklenen dilleri temel alır. Asenkron olarak kategori ve ürün verilerini çeker. Ardından, tanımlanmış statik rotaları, çekilen kategori verilerine göre kategori rotalarını, önceden tanımlı `HVAC_BRANDS` dizisinden marka rotalarını ve geçerli bir `slug` değeri olan ürünler için ürün rotalarını, her biri için yerelleştirilmiş URL'ler, son güncellenme tarihi, değişim sıklığı ve öncelik gibi meta verilerle birleştirip döndürür.
**Parametreler**:
Bu fonksiyon parametre almaz.
**Dönüş**: `Promise<MetadataRoute.Sitemap>` - Tüm sayfaları (statik, kategori, marka ve ürün) ve bunların dil alternatiflerini içeren, arama motoru optimizasyonu için hazırlanmış bir site haritası dizisi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/sitemap.ts::sitemap
- **params**: (parametre yok)
- **ic_degiskenler**: 
  `baseUrl` — SITE_URL sabitinden alınan site temel URL'si, tüm sitemap girdilerinin oluşturulmasında kullanılır
  `locales` — Desteklenen dil kodlarını içeren dizi ('tr' ve 'en')
  `categories` — Veritabanından getCategories() ile çekilen tüm kategorilerin dizisi, hata durumunda boş dizi döner
  `products` — Veritabanından getAllProducts() ile çekilen tüm ürünlerin dizisi, hata durumunda boş dizi döner
  `staticRoutesList` — Sitemap'e dahil edilecek sabit sayfa rotalarının (path'lerin) listesi
  `staticRoutes` — Her dil için sabit rotaların sitemap girdilerini oluşturan dizi
  `categoryRoutes` — Her dil ve kategori için kategori sayfalarının sitemap girdilerini oluşturan dizi
  `brandRoutes` — Her dil ve marka için marka sayfalarının sitemap girdilerini oluşturan dizi
  `productRoutes` — Her dil ve ürün (slug'ı olan) için ürün sayfalarının sitemap girdilerini oluşturan dizi
- **Dönüş**: Promise<MetadataRoute.Sitemap> — Tüm statik, kategori, marka ve ürün rotalarının birleşimi olan sitemap dizisi

---

## NODE ID STANDARD

  file: src\app\sitemap.ts
  function: src\app\sitemap.ts::sitemap

---

## DISA AKTARILANLAR (EXPORTS)
  export: sitemap