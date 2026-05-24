---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx
skeleton_hash: c4dbc4a4b59c355f
generated_at: 2026-05-23T22:35:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı arayüzündeki Hakkında sayfasını oluşturan React tabanlı bir görünüm modülüdür. Uygulama içindeki bu statik sayfa, ziyaretçilere proje, ekip veya hizmetlerle ilgili bilgileri sunmak üzere tasarlanmıştır ve basit, tek bileşenli bir yapıya sahiptir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tüm sorumluluğunu üstlenen bu grup, Hakkında sayfasının React tabanlı işleyişini ve arayüz yapısını tek bir bileşen üzerinden yönetir.
- AboutPage

---

## AXIOMS – Mimari Varsayımlar
VentHub HVAC projesinin istemci tarafı uygulamasında yer alan, hakkında sayfasını render eden React TypeScript view bileşenidir. Bu modülün başarıyla derlenmesi, yayınlanması ve son kullanıcılara sunulabilmesi için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer projeye React kütüphanesi entegre edilmemiş veya AboutPage bileşeninin kullandığı JSX sözdizimini desteklemeyen bir React sürümü kullanılıyorsa, AboutPage bileşeni hiçbir şekilde render edilemez, uygulama çalışma zamanında hata fırlatır.
[Aksiyom 2]: Eğer projenin TypeScript derleyici yapılandırmasında TSX dosyalarını işleyip derleyecek ayarlar tanımlanmamışsa, AboutPage modülü derleme aşamasında hata üretir, uygulama üretim ortamına yüklenemez.
[Aksiyom 3]: Eğer uygulamanın istemci tarafı yönlendirme (routing) mekanizmasında, hakkında sayfasına ait rota için AboutPage bileşenini yükleyecek yapılandırma yapılmamışsa, son kullanıcılar hiçbir şekilde AboutPage içeriğine erişemez.
[Aksiyom 4]: Eğer AboutPage modülünün sabit kaynak dosya yolu (src/views/AboutPage.tsx) değiştirilirse, bu modülü proje içinden içe aktaran tüm bağımlı modüller içe aktarma hatası alır, uygulama derlenemez.

---

## FONKSIYON DETAYLARI

### AboutPage
**Ne yapar**: Venthub HVAC projesinin kullanıcı arayüzündeki hakkında sayfasını oluşturan ana React bileşenidir, proje hakkında genel bilgileri son kullanıcılara sunmak üzere geliştirilmiştir. Uygulamanın statik içerikli sayfalarından biri olarak, rota sistemi üzerinden erişildiğinde kullanıcıya gösterilir.
**Nasıl yapar**: Projenin src/views dizininde yer alan AboutPage.tsx dosyası içinde tanımlanır, projenin rota yapısında ilgili rotaya istek geldiğinde tetiklenir ve içerdiği tüm arayüz öğelerini tarayıcıda sırayla render eder. Sadece kendi bileşen alanı içinde çalışarak diğer uygulama bileşenleriyle uyumlu çalışacak şekilde yapılandırılmıştır.
**Parametreler**:
- Herhangi bir giriş parametresi almaz
**Dönüş**: React.FC tipinde, DOM'a eklenmek üzere geçerli bir React bileşeni döndürür. Bu döndürülen bileşen, hakkında sayfasının tüm kullanıcı arayüzü öğelerini ve içeriklerini barındırır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx::AboutPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, SEO başlığında kullanılır
  - `useI18n` — Çoklu dil desteği sağlayan hook, içinden çeviri fonksiyonu çekilir
  - `heroBadgeRef` — Hero bölümündeki rozet elemanının scroll animasyonu için DOM referansı
  - `heroBadgeVisible` — Hero rozetinin scroll ile görünür olup olmadığını belirten boolean state
  - `useScrollAnimation` — Elemanların scroll ile animasyonlu görünmesini sağlayan hook, threshold parametresi alır
  - `heroTitleRef` — Hero başlık elemanının scroll animasyonu DOM referansı
  - `heroTitleVisible` — Hero başlığının görünürlük state'i
  - `heroTextRef` — Hero açıklama metni elemanının scroll animasyonu DOM referansı
  - `heroTextVisible` — Hero metninin görünürlük state'i
  - `statsRef` — İstatistikler grid elemanının scroll animasyonu DOM referansı
  - `statsVisible` — İstatistikler gridinin görünürlük state'i
  - `storyRef` - Hikaye bölümü görseli elemanının scroll animasyonu DOM referansı
  - `storyVisible` — Hikaye bölümü görselinin görünürlük state'i
  - `valuesRef` — Değerler grid elemanının scroll animasyonu DOM referansı
  - `valuesVisible` — Değerler gridinin görünürlük state'i
  - `scrollAnimationClasses` — Animasyon sınıflarını içeren nesne, elemanlara stillendirme için uygulanır
  - `stats` — Şirket istatistiklerini tutan nesne dizisi, her eleman value, label, icon alanlarına sahiptir
  - `coreValues` — Şirketin temel değerlerini tutan nesne dizisi, her eleman title, description, icon alanlarına sahiptir
  - `Seo` — Arama motoru optimizasyonu bileşeni, sayfa başlığı ve açıklaması prop'u alır
  - `Image` — Next.js resim optimizasyonu bileşeni, tüm sayfa görselleri için kullanılır
  - `Link` — Next.js client tarafı yönlendirme bileşeni, CTA butonlarında kullanılır
  - `Routes.contact` — İletişim sayfası yolunu döndüren rota fonksiyonu, Link'in href prop'una atanır
  - `Routes.products` — Ürünler sayfası yolunu döndüren rota fonksiyonu, Link'in href prop'una atanır
  - `HVAC_BRANDS` — Yetkili markaların listesini tutan sabit dizi, marka şeridinde iterasyon için kullanılır
  - `BrandIcon` — Marka ikonlarını render eden bileşen, her marka için uygun ikonu gösterir
- **Dönüş**: JSX element, AboutPage sayfasının tamamını içeren React bileşeni çıktısı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx::stats_map_callback
- **params**: (stat, i)
- **ic_degiskenler**:
  - `stat` — İstatistikler dizisinden gelen mevcut iterasyon elemanı, value ve label alanları kullanılır
  - `i` — İstatistik elemanının dizi indeksi, key değeri ve sıralı animasyon için kullanılır
  - `scrollAnimationClasses.fadeUp` — Yukarıdan görünme animasyonu sınıfını döndüren fonksiyon, statsVisible ile çağrılır
  - `scrollAnimationClasses.staggerChild` — Sıralı animasyon için gecikme stili üreten fonksiyon, indeks i ile çağrılır
  - `statsVisible` — Üst kapsamda tanımlanan istatistikler gridinin görünürlük state'i
- **Dönüş**: JSX element, tek bir istatistik kartını temsil eden div elementi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx::team_avatar_map_callback
- **params**: (i)
- **ic_degiskenler**:
  - `i` — Avatar elemanının dizi indeksi, key değeri olarak kullanılır
  - `Image` — Next.js resim bileşeni, takım üyesi avatarını yüklemek için kullanılır
- **Dönüş**: JSX element, tek bir takım üyesi avatarını temsil eden div elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx::brands_map_callback
- **params**: (brand)
- **ic_degiskenler**:
  - `brand` — HVAC_BRANDS dizisinden gelen mevcut iterasyon elemanı, slug ve name alanları kullanılır
  - `BrandIcon` — Marka ikonunu render eden bileşen, brand.name prop'u ile çağrılır
- **Dönüş**: JSX element, tek bir marka kartını temsil eden div elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx::corevalues_map_callback
- **params**: (value, i)
- **ic_degiskenler**:
  - `value` — coreValues dizisinden gelen mevcut iterasyon elemanı, icon, title, description alanları kullanılır
  - `i` — Değer elemanının dizi indeksi, key değeri ve sıralı animasyon için kullanılır
  - `scrollAnimationClasses.fadeUp` — Yukarıdan görünme animasyonu sınıfını döndüren fonksiyon, valuesVisible ile çağrılır
  - `scrollAnimationClasses.staggerChild` — Sıralı animasyon için gecikme stili üreten fonksiyon, indeks i ile çağrılır
  - `valuesVisible` — Üst kapsamda tanımlanan değerler gridinin görünürlük state'i
- **Dönüş**: JSX element, tek bir temel değer kartını temsil eden div elementi

---

## NODE ID STANDARD

  file: src\views\AboutPage.tsx
  function: src\views\AboutPage.tsx::AboutPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AboutPage