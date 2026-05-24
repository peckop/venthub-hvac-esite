---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts
skeleton_hash: e4dacaed6135c161
generated_at: 2026-05-23T22:29:38Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin frontend katmanında kategori yönetimi işlevlerini merkezileştirmek üzere geliştirilmiş özel bir React view model hook'udur. Uygulamanın görüntü (view) katmanı ile veri işleme katmanı arasında köprü kurarak, tüm kategori ile ilgili işlemlerin tutarlı bir şekilde yönetilmesini sağlar. Tek bir giriş noktası sunarak kategori state'inin, iş mantığının ve erişim metodlarının tek yerden kontrol edilmesini mümkün kılar.

## Fonksiyon Grupları
### Ana View Model Hook'u
Kategori yönetimi için ihtiyaç duyulan tüm durum takibi, iş mantığını ve görüntü katmanının kullanabileceği tüm metot ve verileri tek bir arayüz altında sunar, uygulamanın ilgili bölümlerinde kolayca entegre edilebilir.
- useCategoryViewModel

---

## AXIOMS – Mimari Varsayımlar
Bu React özel view model hook'u, kategori odaklı kullanıcı arayüzü işlevlerinin state yönetimini ve iş mantığını barındırmak için tasarlanmıştır, çalışması için React çalışma ortamı ve uygulama içi bağımlılıklarının eksiksiz olması zorunludur.

[Aksiyom 1]: Eğer bu hook sadece React bileşenleri veya diğer özel React hookları içinde çağrılmıyorsa (React hook kullanım kuralları ihlal ediliyorsa), hookun state ve yaşam döngüsü yönetimi bozulur, çalışma zamanı hataları fırlatır.
[Aksiyom 2]: Eğer hookun kullandığı kategori verilerini sağlayan API entegrasyonu, merkezi state yapısı veya bağlam (context) nesnesi uygulama içinde tanımlı ve erişilebilir değilse, hiçbir kategori odaklı işlem yürütülemez, kullanıcı arayüzü boş veya hatalı görünür.
[Aksiyom 3]: Eğer modülün import ettiği temel React hookları (useState, useEffect, useContext gibi) çalıştığı ortamda mevcut değilse, hook hiçbir şekilde çalışmaz, uygulama başlatılamaz.
[Aksiyom 4]: Eğer bu hooku kullanan üst bileşenler, hookun döndürdüğü state ve işlevleri doğru şekilde tüketmiyorsa, kategori seçimi, filtreleme gibi temel işlevler çalışmaz, kullanıcı deneyimi başarısız olur.

---

## FONKSIYON DETAYLARI

### useCategoryViewModel
**Ne yapar**: VentHub HVAC projesinin kategori yönetimi süreçleri için tasarlanmış gelişmiş ölçekli ViewModel hook'udur. Tüm UI katmanının kategori ile ilgili işlemleri için tek doğru kaynak (source of truth) olarak görev yapar, UI temsilinde tutarlılığı garanti eder. Kategori ve ürün gruplama iş mantığını tek bir noktada merkezileştirerek, proje genelinde dağınık işlevlerin önüne geçer.
**Nasıl yapar**: React hook standardında tasarlanmış yapısı ile, kategori yönetimi için ihtiyaç duyulan tüm yardımcı işlevleri içerir ve bu işlevleri dışa açarak UI katmanının erişimini sağlar. Tüm kategori ile ilgili veri işleme mantığını kendi bünyesinde barındırarak, UI katmanının ham veri ile uğraşmasına gerek bırakmaz, tutarlı bir işleyiş sunar.
**Parametreler**:
Bu fonksiyon herhangi bir girdi parametresi almaz.
**Dönüş**: İki adet işlev barındıran bir JavaScript nesnesi döndürür. Nesne içerisinde kategori verisini sarmalayan `wrapCategory` ve ürünleri serilere göre gruplayan `groupProductsBySeries` fonksiyonları yer alır, UI katmanı bu fonksiyonları doğrudan kullanabilir.

---

### wrapCategory
**Ne yapar**: useCategoryViewModel hook'u tarafından dışa açılan, ham kategori verisini UI kullanımına uygun şekilde standartlaştıran yardımcı fonksiyondur. Farklı kaynaklardan gelen düzensiz kategori verilerini tek bir formata sokarak UI'da tutarlı temsil sağlar. Eksik veri alanlarını tamamlayarak olası UI hatalarının önüne geçer.
**Nasıl yapar**: Gelen ham kategori verisini alarak tüm doğrulama, dönüşüm ve standartlaştırma işlemlerini uygular. UI'da kullanılacak formatlamaları önceden hesaplar, veri tiplerini normalize eder, eksik olabilecek zorunlu alanları varsayılan değerlerle doldurarak işlenmiş veriyi geri döndürür.
**Parametreler**:
- name: rawCategoryData, type: object — İşlenmemiş, herhangi bir kaynaktan gelen ham kategori verisini içeren nesne, kategori kimliği, adı, açıklaması gibi temel alanları barındırır.
**Dönüş**: Tüm UI katmanları tarafından aynı standartta kullanılabilecek, doğrulanmış ve standartlaştırılmış kategori nesnesi döndürür.

---

### groupProductsBySeries
**Ne yapar**: useCategoryViewModel hook'u tarafından dışa açılan, kategori altındaki HVAC ürünlerini ait oldukları serilere göre gruplayan yardımcı fonksiyondur. Ürünlerin seri bazında düzenlenerek UI'da sunulmasını sağlar, büyük ürün listelerinin okunabilirliğini artırır.
**Nasıl yapar**: Gelen ürün listesini her bir ürünün serisi bilgisine göre sınıflandırır, aynı seriye ait tüm ürünleri tek bir grup altında toplar. Opsiyonel olarak seri isimlerine göre alfabetik sıralama işlemini uygulayarak gruplanmış veriyi UI kullanımına hazır hale getirir.
**Parametreler**:
- name: productList, type: array<object> — Gruplanması gereken tüm HVAC ürünlerini içeren nesne dizisi, her bir ürün nesnesi kendi ait olduğu seri bilgisini barındırır.
**Dönüş**: Seri isimlerini anahtar olarak kullanan, her anahtar altında o seriye ait tüm ürünlerin listesini barındıran bir JavaScript nesnesi döndürür, bu nesne doğrudan UI listelemelerinde kullanılabilir.

---

## INTERFACES

### CategoryViewModel
- `id: string`
- `slug: string`
- `displayName: string`
- `marketingTitle: string`
- `description: string`
- `imageUrl: string | null`
- `parentId: string | null`
- `level: number`
- `displayMode: 'showcase' | 'landing' | 'series' | 'grid'`
- `raw: DomainCategory`

### SeriesGroup
- `name: string`
- `products: DomainProduct[]`
- `image?: string`
- `minPrice: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::useCategoryViewModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan, metinleri çevirmek için kullanılan i18n fonksiyonu
  - `wrapCategory` — useMemo ile önbelleğe alınan, DomainCategory nesnesini CategoryViewModel formatına dönüştüren fonksiyon
  - `groupProductsBySeries` — useMemo ile önbelleğe alınan, DomainProduct listesini serilerine göre gruplayan fonksiyon
- **Dönüş**: İki adet dönüşüm fonksiyonu (`wrapCategory`, `groupProductsBySeries`) içeren nesne

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::wrapCategory_callback
- **params**: (category: DomainCategory | null | undefined)
- **ic_degiskenler**:
  - `tKey` — Kategori için çeviri anahtarı, `category.translation_key` mevcut değilse `category.slug` kullanılır
  - `translationPath` — Çeviri için kullanılan tam i18n yol ifadesi, `common.categoryList.${tKey}` formatında oluşturulur
  - `translatedName` — `t()` fonksiyonu ile alınan çevrilmiş kategori adı
  - `displayName` - Kullanıcıya gösterilecek kategori adı, çeviri başarısız olursa `category.menu_label` veya `category.name` kullanılır
  - `marketingTitle` — Pazarlama amaçlı kullanılan başlık, `category.marketing_title` mevcut değilse `displayName` kullanılır
  - `meta` — Kategorinin metadata nesnesi, geçersiz/boşsa boş nesne atanır
  - `displayMode` — Kategorinin UI'deki görünüm modu, varsayılan olarak `series` atanır
  - `rawDisplayMode` — Ham görünüm modu değeri, önce `category.display_mode` sonra `meta.display_mode` değerleri alınır
- **Dönüş**: CategoryViewModel | null

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::groupProductsBySeries_callback
- **params**: (products: DomainProduct[])
- **ic_degiskenler**:
  - `seriesMap` — Ürünleri seri isimlerine göre gruplamak için kullanılan anahtar-değer nesnesi
- **Dönüş**: İsme göre sıralanmış SeriesGroup nesnelerinden oluşan dizi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::products_forEach_callback
- **params**: (product: DomainProduct)
- **ic_degiskenler**:
  - `meta` — Ürünün metadata nesnesi, geçersiz/boşsa boş nesne atanır
  - `seriesName` — Ürünün ait olduğu seri adı, önce `meta.series` sonra ürün isminin ilk kelimesi kullanılır
  - `product.name.split(' ')[0]` — Ürün isminin ilk kelimesi, seri adı yedeği olarak kullanılır
  - `product.name.split(' ')[1]` — Ürün isminin ikinci kelimesi, ilk kelime marka ise seri adı olarak kullanılır
  - `seriesMap` — Üst fonksiyonda tanımlanan serileri gruplayan kayıt nesnesi
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useCategoryViewModel.ts
  function: src\hooks\useCategoryViewModel.ts::useCategoryViewModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModel
  export: SeriesGroup
  export: useCategoryViewModel