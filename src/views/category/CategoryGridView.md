---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\category\CategoryGridView.tsx
skeleton_hash: f777c407c48b29e3
generated_at: 2026-05-23T22:39:29Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kategori sayfalarında kullanılan grid tipi kategori görünümü bileşenidir. React tabanlı olan bu bileşen, kategori hiyerarşisi, marka listesi ve kullanıcı türü gibi verileri alarak kullanıcı dostu bir kategori listeleme arayüzü oluşturur. Tüm kategori sayfalarında tutarlı bir görünüm ve işlevsellik sağlamak üzere tasarlanmıştır.

## Fonksiyon Grupları
### Kategori Grid Ana Bileşeni
Modülün temel işlevini yerine getiren tek ana fonksiyondur, gelen kategori, üst kategori, alt kategori, marka listesi ve profesyonel kullanım modu gibi parametreleri işleyerek kategori grid görünümünü kullanıcıya sunar.
- CategoryGridView

---

## AXIOMS – Mimari Varsayımlar
Bu sunum odaklı React kategorisi görünüm bileşeni, giriş olarak aldığı tüm prop'ların geçerli ve uygun formatta olmasını zorunlu kılar, aksi takdirde kategori hiyerarşisi, filtreleme ve kullanıcıya özel içerikler doğru şekilde çalışmaz.

[Aksiyom 1]: Eğer ana kategori nesnesi (category) yoksa, CategoryGridView bileşeni hiçbir çekirdek içerik gösteremez, çalışması başarısız olur.
[Aksiyom 2]: Eğer üst kategori nesnesi (parentCategory) mevcutken eksik veya geçersiz formatta gelirse, kategori hiyerarşisi navigasyonu doğru şekilde oluşturulamaz.
[Aksiyom 3]: Eğer alt kategoriler listesi (subCategories) yoksa veya boş olarak iletilirse, görünümdeki alt kategori listesi alanı boş kalır, alt kategorilere erişim sağlanamaz.
[Aksiyom 4]: Eğer mevcut markalar listesi (availableBrands) eksik iletilirse, kategori içindeki marka bazlı filtreleme özelliği kullanılamaz.
[Aksiyom 5]: Eğer profesyonel kullanıcı bayrağı (pro) eksik veya yanlış tipte iletilirse, profesyonel kullanıcılara özel tüm görünüm ve işlevsellikler doğru şekilde uygulanamaz.

---

## FONKSIYON DETAYLARI

### CategoryGridView
**Ne yapar**: VentHub HVAC platformunun kategori sayfasında, ürün kategorileri için ızgara tarzı gezinme arayüzünü oluşturan ana React bileşenidir. Kullanıcıların mevcut kategorinin temel detaylarını görmesini, iç içe geçmiş kategori hiyerarşisinde sorunsuz gezinmesini, mevcut markalara göre ürünleri filtrelemesini ve aktif abonelikleri varsa pro'ya özel içeriklere erişmesini sağlar. Uygulamadaki tüm kategori ile ilgili gezinme deneyimleri için birincil görünüm bileşeni olarak görev yapar.
**Nasıl yapar**: Dahili olarak veri çekmek yerine, yapılandırılmış kategori ve kullanıcıyla ilgili girdileri tüketerek arayüz içeriğini dinamik olarak oluşturan yeniden kullanılabilir bir sunum bileşeni olarak çalışır. Hiyerarşik bağlam sağlamak için parentCategory prop'unu kullanarak ekmek kırıntısı gezinmesi oluşturur, subCategories ve availableBrands dizilerini eşleyerek etkileşimli gezinme ve filtreleme öğelerini render eder. Pro boolean bayrağını kontrol ederek abonelik arkasında kilitlenen premium özellikleri koşullu olarak görüntüler, girdi prop'ları değiştiğinde yalnızca arayüzünü güncelleyerek verimli renderlama performansı sunar.
**Parametreler**:
- name: category, type: CategoryGridViewProps['category'] — Şu anda görüntülenmekte olan ana kategorinin tüm temel bilgilerini barındıran veri nesnesidir, ızgara görünümünün başlığı ve çekirdek içeriği için ana veri kaynağı olarak kullanılır.
- name: parentCategory, type: CategoryGridViewProps['parentCategory'] — Aktif kategorinin üst kategorisine ait veri nesnesidir, iç içe geçmiş kategori yapılarında gezinirken kullanıcılara hiyerarşik bağlam sunmak ve ekmek kırıntısı gezinmesini oluşturmak için kullanılır.
- name: subCategories, type: CategoryGridViewProps['subCategories'] — Mevcut görüntülenen kategoriye ait tüm alt kategorilerin listesidir, kullanıcıların daha derin kategori seviyelerine geçmesi için tıklanabilir ızgara öğeleri oluşturmak üzere kullanılır.
- name: availableBrands, type: CategoryGridViewProps['availableBrands'] — Mevcut kategori içinde sunulan tüm ürün markalarının listesidir, kategori ızgara görünümünde marka filtresi seçeneklerini render etmek için kullanılır.
- name: pro, type: CategoryGridViewProps['pro'] — Mevcut kullanıcının aktif VentHub pro aboneliğine sahip olup olmadığını belirten boolean bayraktır, ızgara görünümünde pro'ya özel özelliklerin ve içeriklerin görünürlüğünü yönetmek için kullanılır.
**Dönüş**: React.ReactElement — Bileşenin React fonksiyonel bileşeni tür tanımına uygun olarak, kategori ızgara görünümü arayüzünü tam olarak oluşturan, render edilmeye hazır bir React öğesi döndürür.

---

## INTERFACES

### CategoryGridViewProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `subCategories: DomainCategory[]`
- `availableBrands: string[]`
- `products: Product[]`
- `filters: CategoryFilters`
- `onUpdateFilters: (updates: Partial<CategoryFilters>) => void`
- `loading?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\category\CategoryGridView.tsx::CategoryGridView
- **params**: [category, parentCategory, subCategories, availableBrands, products, filters, onUpdateFilters, loading]
- **ic_degiskenler**: 
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm UI metinlerini çevirmek için kullanılır
- **Dönüş**: Kategori sayfası içeren JSX React elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\category\CategoryGridView.tsx::productsMapCallback
- **params**: [product]
- **ic_degiskenler**: 
  - `product.id` — Ürünün benzersiz kimliği, liste renderı için React anahtarı olarak kullanılır
  - `product` — Ürün verisi nesnesi, ProductCard bileşenine aktarılır
  - `filters.viewMode` - Aktif görünüm modu, ProductCard'ın layout ayarı olarak gönderilir
- **Dönüş**: Ürün verisiyle doldurulmuş ProductCard React bileşeni örneği

---

## NODE ID STANDARD

  file: src\views\category\CategoryGridView.tsx
  function: src\views\category\CategoryGridView.tsx::CategoryGridView

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryGridView