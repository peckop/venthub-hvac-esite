---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ProductsHero.tsx
skeleton_hash: 93075d4dc41a48bb
generated_at: 2026-05-23T22:26:16Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürünler sayfasının kullanıcının ilk etkileşime girdiği üst (hero) bölümünü oluşturan bir React bileşenini barındırır. Üst bileşenlerden aldığı prop'lar aracılığıyla sayfa içindeki arama işlevini yönetir ve bu işlevi hero bölümünde entegre eder.

## Fonksiyon Grupları
### Ana Ürünler Hero Bileşeni
Ürünler sayfasının ana üst bölümünü render eden, arama girişinin değerini, değişiklik tetikleyicisini ve giriş referansını üst bileşenlerden alarak çalışan tek sorumlu bileşendir.
- ProductsHero

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı ürünler sayfası üst (hero) bileşeni, çalışması için üst bileşenden zorunlu olarak iletilen prop'ların geçerli biçimde sağlanmasını varsayar; arama işlevlerinin sorunsuz çalışması bu prop'ların bütünlüğüne bağlıdır.

[Aksiyom 1]: Eğer üst bileşenden iletilen `searchValue` string değeri sağlanmaz veya geçersiz bir tipte gönderilirse, arama input'u doğru şekilde gösterilemez, kullanıcı girdiği arama sorgusunu ekranda göremez.
[Aksiyom 2]: Eğer arama girdisindeki değişiklikleri üst bileşene bildirmek için gereken `onSearchChange` fonksiyonu sağlanmazsa, kullanıcının input'a yaptığı tüm değişiklikler yakalanamaz, arama işlevi hiç çalışmaz.
[Aksiyom 3]: Eğer arama input'una dışarıdan erişim için iletilen `searchInputRef` React ref nesnesi geçersiz biçimde gönderilirse, bileşen dışından bu input'a odaklanma, değerini okuma gibi işlemler yapılamaz.

---

## FONKSIYON DETAYLARI

### ProductsHero
**Ne yapar**: VentHub HVAC platformunun ürün hub'ında kullanılan ana giriş (hero) bölümünü oluşturan React bileşenidir. Ürünler kataloğuna erişim öncesi kullanıcıya görsel bir karşılama bölümü sunan yapı, LCP (En Büyük İçerik Boyanması) performansı odaklı olarak optimize edilmiştir. Bölüm içerisinde kullanıcıların ürünleri filtreleyerek arayabileceği beyaz bir arama çubuğu, koyu lacivert gradyan ile zenginleştirilmiş endüstriyel bir arka plan görseli barındırır.
**Nasıl yapar**: React fonksiyonel bileşeni olarak, aldığı prop'ları içerisindeki arama giriş elemanına ileterek tam etkileşimli bir yapı oluşturur. LCP optimizasyonu sayesinde sayfa yükleme sürecinde en büyük ve en önemli görsel ve metinsel içeriklerin en kısa sürede kullanıcıya sunulmasını sağlar, bu da hem kullanıcı deneyimini hem de arama motoru sıralamalarını olumlu yönde etkiler. Arka planındaki gradyan ve endüstriyel görsel kombinasyonu, platformun HVAC odaklı kimliği ile tam uyumlu bir görünüm oluşturur.
**Parametreler**:
- searchValue: string — Arama çubuğunda anlık olarak görüntülenen mevcut arama terimini tutan dinamik değer
- onSearchChange: function — Arama çubuğundaki değer değişikliklerini üst bileşene iletmek için kullanılan geri çağırım (callback) fonksiyonu
- searchInputRef: React.RefObject<HTMLInputElement> — Arama giriş elemanına DOM seviyesinde erişim sağlamak için kullanılan React referans nesnesi
**Dönüş**: React.FC<ProductsHeroProps> — Tanımlı prop tipleriyle tam uyumlu, uygulamanın ilgili sayfasına entegre edilerek ürün hub'ı hero bölümünü ekrana render eden React fonksiyonel bileşeni döndürür.

---

## INTERFACES

### ProductsHeroProps
- `searchValue: string`
- `onSearchChange: (value: string) => void`
- `searchInputRef?: React.RefObject<HTMLInputElement>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsHero.tsx::ProductsHero
- **params**: searchValue, onSearchChange, searchInputRef
  - `searchValue` — arama inputunda gösterilen mevcut metin değeri, arama filtresi olarak kullanılır
  - `onSearchChange` — arama inputunda metin değişikliği olduğunda tetiklenen callback fonksiyonu, üst bileşene yeni arama değerini iletmek için kullanılır
  - `searchInputRef` — arama input elementine erişmek için kullanılan ref nesnesi, DOM manipülasyonu için aktarılır
- **ic_degiskenler**:
  - `t` — `useI18n` hookundan alınan çok dilli çeviri fonksiyonu, bileşen içindeki tüm metinleri dinamik olarak çevirmek için kullanılır
- **Dönüş**: JSX React elementi, ürünler sayfasının ana hero bölümünü oluşturan, arka plan görseli, dekoratif SVG'ler, başlık metni ve arama çubuğu içeren section elementi döndürülür

---

## NODE ID STANDARD

  file: src\components\products\ProductsHero.tsx
  function: src\components\products\ProductsHero.tsx::ProductsHero

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsHero