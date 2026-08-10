---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\SeriesCard.tsx
skeleton_hash: bd3a185721788a46
entity_hashes:
  func:SeriesCard: cf8b7a8f3470f163
  overview: d4236c58f6d08940
  style_tokens: f167f421a986922b
generated_at: 2026-06-19T20:47:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler bölümünde kullanılan React tabanlı bir kullanıcı arayüzü bileşeni barındırır. Ürün serilerini kart formatında görüntülemek için tasarlanan bileşen, ilgili serinin temel bilgilerini toplayarak kullanıcıların ilgili seri detay sayfasına erişmesini sağlar. Tamamen sunum odaklı çalışan modül, ürün listeleme sayfalarında tutarlı kart görünümü sunmak amacıyla kullanılır.

## Fonksiyon Grupları
### Ana Ürün Serisi Kart Bileşeni
Kendisine iletilen seri adı, görseli, ürün sayısı, en düşük fiyat ve yönlendirme linki gibi verileri işleyerek kartın tüm görsel ve işlevsel altyapısını yönetir, kullanıcı arayüzünde uygun şekilde render edilmesini sağlar.
- SeriesCard

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### SeriesCard

**Ne yapar**: HVAC ürün serilerini kart formatında gösteren bir UI bileşenidir. Her bir ürün serisi için görsel, isim, ürün sayısı, minimum fiyat ve detay sayfasına yönlendirme linki gibi bilgileri kart içinde sunar.

**Nasıl yapar**: Bileşen, SeriesCardProps tipinde tanımlanan prop'ları alır ve bu verileri kullanarak seriyi temsil eden bir kart bileşeni render eder. Gelen name, image, productCount, minPrice ve href değerlerini kartın ilgili bölümlerine yerleştirerek kullanıcıya ürün serisi hakkında özet bilgi sunar. href prop'u ile kullanıcıyı ilgili ürün serisinin detay sayfasına yönlendirir.

**Parametreler**:
- name: string — Ürün serisinin adını belirtir, kart üzerinde başlık olarak görüntülenir
- image: string — Ürün serisine ait görselin URL'ini veya yolunu temsil eder, kartın görsel alanında kullanılır
- productCount: number — İlgili serideki toplam ürün sayısını belirtir, kart üzerinde bilgi olarak gösterilir
- minPrice: number — Serideki ürünlerin başlangıç fiyatını veya minimum fiyatını temsil eder, fiyat aralığının alt sınırını gösterir
- href: string — Ürün serisinin detay sayfasına yönlendirme linkini belirtir, kart tıklandığında bu adrese navigasyon sağlanır

**Dönüş**: `React.FC<SeriesCardProps>` — SeriesCardProps arayüzüne uygun olarak yapılandırılmış bir React fonksiyonel bileşeni döndürür. Bu bileşen, verilen prop'lara göre render edilmiş bir ürün serisi kartı sunar.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/format::formatCurrency
- import: next/image::Image
- import: next/link::Link
- import: react::React

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

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/10`, `bg-slate-100`, `bg-slate-50`, `bg-white`, `bg-white/90`, `border-slate-100`, `border-slate-50`, `border-t`, `group-hover:bg-primary-navy`, `group-hover:text-primary-navy`, `group-hover:text-white`, `hover:border-primary-navy/20`, `text-lg`, `text-primary-navy`, `text-slate-300`
- **Layout:** `absolute`, `backdrop-blur-md`, `flex`, `flex-1`, `flex-col`, `h-10`, `h-full`, `hover:shadow-series-card-hover`, `items-center`, `justify-between`, `justify-center`, `left-4`, `line-clamp-2`, `overflow-hidden`, `p-6`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `aspect-4/3`, `border`, `duration-300`, `duration-500`, `duration-700`, `font-bold`, `group`, `group-hover:scale-110`, `hover:-translate-y-1`, `mb-2`, `mb-6`, `mt-auto`, `object-contain`, `pt-4`, `px-3`