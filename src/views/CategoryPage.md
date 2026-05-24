---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CategoryPage.tsx
skeleton_hash: d6a1aef6630b0f1d
generated_at: 2026-05-23T22:39:51Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunun görünüm katmanında yer alan kategori sayfası React bileşenidir. İlgili kategori, alt kategoriler ve ürünlere ait başlangıç verilerini alarak kullanıcılara özel kategori içerikli bir sayfa sunmak üzere tasarlanmıştır.

## Fonksiyon Grupları
### Kategori Sayfası Ana Bileşeni
Modülün tek ana sorumluluğunu üstlenen bu React fonksiyonu, dışarıdan aktarılan başlangıç verilerini alarak kategori sayfasının temel yapısını oluşturur ve ilgili içeriği kullanıcıya sunacak şekilde render eder.
- CategoryPage

---

## AXIOMS – Mimari Varsayımlar
Bu React CategoryPage view modülünün kategori içeriğini eksiksiz ve hatasız şekilde kullanıcıya sunması, aldığı üç zorunlu prop'un geçerli ve uygun formatta parent component tarafından sağlanması zorunludur.

[Aksiyom 1]: Eğer initialCategory prop'u geçerli bir ana kategori nesnesi olarak sağlanmazsa, sayfada kategori başlığı, açıklaması gibi temel kategori meta verileri gösterilemez, sayfa hatalı içerikle veya boş başlıkla render edilir.
[Aksiyom 2]: Eğer initialProducts prop'u geçerli bir ürün listesi olarak sağlanmazsa, kategori altında listelenecek ürünler hiç gösterilemez, sayfa üzerindeki ürün sıralama, filtreleme gibi işlevler çalışmaz.
[Aksiyom 3]: Eğer initialSubCategories prop'u geçerli bir alt kategori listesi olarak sağlanmazsa, sayfa içindeki alt kategori navigasyon yapısı oluşturulamaz, kullanıcı mevcut alt kategorilere erişim sağlayamaz.

---

## FONKSIYON DETAYLARI

### CategoryPage
**Ne yapar**: VentHub HVAC projesinde dinamik kategori sayfasının ana giriş noktası olarak görev yapar. Kategori sayfasında ihtiyaç duyulan tüm iş mantığı ve sunum süreçlerini Unified Category Shell olarak adlandırılan CategoryMasterView bileşenine devreder, sayfanın sorunsuz bir şekilde render edilmesi için gerekli tüm başlangıç verilerini hedef bileşene güvenli şekilde iletir.
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanan CategoryPage, kendisine iletilen tüm başlangıç verilerini doğrudan delegasyon yaptığı CategoryMasterView bileşenine ileterek kendi başına ek işlem yürütmez. Tüm ürün filtreleme, alt kategori gezintisi, state yönetimi ve kullanıcı etkileşimleri gibi süreçlerin tamamen CategoryMasterView üzerinden yönetilmesini sağlar, bu şekilde kod tekrarı önlenir ve kategori mantığı tek merkezde toplanır.
**Parametreler**:
- initialCategory: CategoryPageProps prop'u — Sayfanın ait olduğu ana kategorinin tüm temel verilerini içeren başlangıç nesnesi, kategori kimliği, adı, açıklaması gibi gerekli meta verileri barındırır
- initialProducts: CategoryPageProps prop'u — Kategori sayfasında görüntülenecek ürünlerin ilk yükleme anındaki tam listesini içeren dizi, sayfa açıldığında anında ürünlerin kullanıcıya sunulmasını sağlar
- initialSubCategories: CategoryPageProps prop'u — Ana kategoriye bağlı tüm alt kategorilerin başlangıç listesini tutan dizi, kullanıcının alt kategoriler arasında rahatça gezinmesine olanak tanıyan verileri içerir
**Dönüş**: React.FC<CategoryPageProps> tipinde geçerli bir React bileşeni döndürür. Dönen bileşen, kategori sayfasının DOM ağacına işlenmesi için gerekli tüm React elementlerini ve alt bileşen referanslarını içerir, sayfanın tarayıcıda sorunsuz bir şekilde render edilmesini sağlar.

---

## INTERFACES

### CategoryPageProps
- `initialCategory?: DomainCategory | null`
- `initialProducts?: DomainProduct[]`
- `initialSubCategories?: DomainCategory[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\CategoryPage.tsx::CategoryPage
- **params**: [initialCategory, initialProducts, initialSubCategories]
- **ic_degiskenler**: Lokal değişken tanımlanmamıştır, yalnızca fonksiyona gelen giriş parametreleri kullanılmıştır
- **Dönüş**: Gelen parametreleri iletetilen CategoryMasterView bileşenini içeren React JSX elementi

---

## NODE ID STANDARD

  file: src\views\CategoryPage.tsx
  function: src\views\CategoryPage.tsx::CategoryPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryPage
  export: CategoryPageProps