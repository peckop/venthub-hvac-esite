---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\SeriesCard.tsx
skeleton_hash: d5dbc3aad85a1db0
generated_at: 2026-05-23T22:26:34Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler bölümünde kullanılan React tabanlı bir kullanıcı arayüzü bileşeni barındırır. Ürün serilerini kart formatında görüntülemek için tasarlanan bileşen, ilgili serinin temel bilgilerini toplayarak kullanıcıların ilgili seri detay sayfasına erişmesini sağlar. Tamamen sunum odaklı çalışan modül, ürün listeleme sayfalarında tutarlı kart görünümü sunmak amacıyla kullanılır.

## Fonksiyon Grupları
### Ana Ürün Serisi Kart Bileşeni
Kendisine iletilen seri adı, görseli, ürün sayısı, en düşük fiyat ve yönlendirme linki gibi verileri işleyerek kartın tüm görsel ve işlevsel altyapısını yönetir, kullanıcı arayüzünde uygun şekilde render edilmesini sağlar.
- SeriesCard

---

## AXIOMS – Mimari Varsayımlar
Bu sunum bileşeni olan SeriesCard, ürün serilerini kullanıcıya eksiksiz göstermek ve detay sayfasına yönlendirmek için tüm zorunlu prop'ların üst bileşenden formatına uygun, eksiksiz olarak iletilmesini varsayar.

[Aksiyom 1]: Eğer name prop'u üst bileşenden iletilmezse, ürün serisinin adı görüntülenemez, kullanıcı ilgili seriyi tanıyamaz.
[Aksiyom 2]: Eğer image prop'u geçerli bir resim kaynağı olarak iletilmezse, ürün serisinin kapak görseli yüklenmez, görsel alanı hatalı veya boş olarak gösterilir.
[Aksiyom 3]: Eğer productCount sayısal bir değer olarak iletilmezse, seride bulunan toplam ürün sayısı doğru şekilde kullanıcıya sunulamaz.
[Aksiyom 4]: Eğer minPrice prop'u geçerli sayısal bir fiyat değeri olarak iletilmezse, serinin başlangıç fiyatı görüntülenemez.
[Aksiyom 5]: Eğer href prop'u geçerli bir yönlendirme adresi olarak iletilmezse, kart tıklamasındaki detay sayfası yönlendirmesi çalışmaz, kullanıcı serinin detaylarına erişemez.

---

## FONKSIYON DETAYLARI

### SeriesCard
**Ne yapar**: Ürün serilerini görselleştirmek için tasarlanmış bir React kart bileşenidir. Kullanıcı arayüzünde herhangi bir ürün serisinin temel bilgilerini tek bir kart üzerinde toplayarak sunar, kullanıcıların ilgili serinin detay sayfasına erişmesini sağlayan tıklanabilir bir arayüz öğesi olarak çalışır. Venthub HVAC uygulamasının ürün listeleme arayüzlerinde serileri kategorize etmek ve sunmak için kullanılır.
**Nasıl yapar**: Kendisine iletilen prop verilerini kullanarak kartın tüm içeriğini dinamik olarak doldurur, gelen her veriyi doğru arayüz alanında görüntüler. TypeScript ile tanımlanmış SeriesCardProps tipini kullanarak prop türlerinin güvenliğini sağlar, React'in fonksiyonel bileşen yapısıyla çalışarakJSX çıktısı üretir. Tıklandığında kendisine iletilen href adresine yönlendirme işlemini tetikler.
**Parametreler**:
- name: any — Ürün serisinin resmi görünen adı, kartın başlık alanında kullanılarak serinin kimliğini belirtir
- image: any — Seriyi temsil eden kapak görselinin erişim adresi veya dosya yolu, kartın görsel bölümünde yüklenerek serinin görsel temsilini sunar
- productCount: any — İlgili seri bünyesinde yer alan toplam ürün sayısı, kart üzerinde serinin içeriğinin büyüklüğünü kullanıcılara bildirmek için görüntülenir
- minPrice: any — Serideki tüm ürünler arasındaki en düşük geçerli fiyat, kullanıcılara seriye başlangıç fiyatını göstermek üzere kullanılır
- href: any — Kullanıcı kartı tıkladığında yönlendirileceği ürün serisi detay sayfasının bağlantısı, yönlendirme işlemi için kullanılır
**Dönüş**: React.FC<SeriesCardProps> — Props türü tanımlanmış, uygulama arayüzünde kullanılabilir bir React fonksiyonel bileşeni döndürür, bu bileşen tanımlanan tüm prop verilerini işleyerek görsel kart çıktısını üretir.

---

## INTERFACES

### SeriesCardProps
- `name: string`
- `image?: string`
- `productCount: number`
- `minPrice: number`
- `href: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\SeriesCard.tsx::SeriesCard
- **params**: [name, image, productCount, minPrice, href]
- **ic_degiskenler**:
  - `lang` — useI18n hook'undan alınan mevcut uygulama dili kodu, para birimi formatlamada kullanılır
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm arayüz metinlerinin yerelleştirilmesinde kullanılır
  - `useI18n` — projenin I18n sağlayıcısından dil ve çeviri fonksiyonunu çekmek için kullanılan custom hook
  - `formatCurrency` — i18n modülünden alınan para formatlama fonksiyonu, minimum fiyatı kullanıcının diline uygun biçimlendirir
  - `Link` — Next.js Link bileşeni, kart tıklandığında istemci tarafı yönlendirme yapmak için kullanılır
  - `Image` — Next.js Image bileşeni, serinin resmi varsa optimize edilmiş şekilde yüklemek için kullanılır
- **Dönüş**: React JSX elementi, HVAC ürün serisini tanıtmak için oluşturulmuş tıklanabilir etkileşimli kart arayüzü

---

## NODE ID STANDARD

  file: src\components\products\SeriesCard.tsx
  function: src\components\products\SeriesCard.tsx::SeriesCard

---

## DISA AKTARILANLAR (EXPORTS)
  export: SeriesCard