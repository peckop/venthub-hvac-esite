---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx
skeleton_hash: 4726f670bf91f4bf
entity_hashes:
  func:AboutPage: 7a07cf459964f7ab
  func:t: 470aecfc62464333
  overview: 508336c7594890ab
  style_tokens: 6526e41f4914ea4c
generated_at: 2026-05-28T22:39:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin Hakkında sayfasını oluşturan bir React görünümüdür. Sayfa, proje veya ekip hakkında bilgi vermek için tasarlanmış, dil destekli tek bileşenli bir arayüz sunar. Modül, sayfa yapısını ve çok dilli metinleri yönetmek için gerekli temel işlevleri içerir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tüm arayüz ve render sorumluluğunu üstlenen, sayfanın ana yapısını ve düzenini tanımlayan React bileşeni.
- AboutPage

### Dil Destek Fonksiyonu
Sayfa içindeki metinleri, belirtilen dile göre çevirmek ve yerelleştirme sağlamak için kullanılan bir yardımcı fonksiyon.
- t

---

## AXIOMS – Mimari Varsayımlar
VentHub HVAC projesinin istemci tarafı uygulamasında yer alan, hakkında sayfasını render eden React TypeScript view bileşenidir. Bu modülün başarıyla derlenmesi, yayınlanması ve son kullanıcılara sunulabilmesi için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer projeye React kütüphanesi entegre edilmemiş veya AboutPage bileşeninin kullandığı JSX sözdizimini desteklemeyen bir React sürümü kullanılıyorsa, AboutPage bileşeni hiçbir şekilde render edilemez, uygulama çalışma zamanında hata fırlatır.
[Aksiyom 2]: Eğer projenin TypeScript derleyici yapılandırmasında TSX dosyalarını işleyip derleyecek ayarlar tanımlanmamışsa, AboutPage modülü derleme aşamasında hata üretir, uygulama üretim ortamına yüklenemez.
[Aksiyom 3]: Eğer uygulamanın istemci tarafı yönlendirme (routing) mekanizmasında, hakkında sayfasına ait rota için AboutPage bileşenini yükleyecek yapılandırma yapılmamışsa, son kullanıcılar hiçbir şekilde AboutPage içeriğine erişemez.
[Aksiyom 4]: Eğer AboutPage modülünün sabit kaynak dosya yolu (src/views/AboutPage.tsx) değiştirilirse, bu modülü proje içinden içe aktaran tüm bağımlı modüller içe aktarma hatası alır, uygulama derlenemez.

---

## FONKSİYON DETAYLARI

### AboutPage
**Ne yapar**: Uygulamanın "Hakkında" sayfasını oluşturup tarayıcıda gösteren bir React fonksiyonel bileşenidir. Kullanıcıya projenin veya uygulamanın genel bilgilerini sunar.

**Nasıl yapar**: Fonksiyon, React bileşeni olarak tanımlanmıştır ve props olarak `lang` parametresini alır. `lang` parametresi, sayfanın hangi dilde görüntüleneceğini belirler; bu parametre verilmezse varsayılan olarak `'tr'` (Türkçe) kullanılır. Bileşen, muhtemelen ilgili dil seçeneğine göre sayfa içeriğini render eder, ancak iç yapısı verilmemiştir.

**Parametreler**:
- `lang`: string — Sayfanın görüntüleneceği dil kodunu belirtir. Örneğin `'tr'` Türkçe, `'en'` İngilizce içindir. Opsiyonel bir parametredir ve verilmezse `'tr'` değerini alır.

**Dönüş**: `React.FC<AboutPageProps>` tipinde bir React bileşeni döndürür. `AboutPageProps` tipi, bu fonksiyonun kabul ettiği prop'ların yapısını tanımlayan bir arayüzdür, ancak bu arayüzün detayları verilmemiştir.

### t
**Ne yapar**: Uygulama içinde kullanılan bir çeviri (i18n) fonksiyonudur. Verilen bir metin anahtarına karşılık gelen dil çevirisini sözlük nesnesinden bulup döndürür.

**Nasıl yapar**: Fonksiyon, `key` parametresini nokta (`.`) karakterine göre bir diziye böler. Bu dizi, iç içe geçmiş bir sözlük yapısında (`dict`) arama yapmak için kullanılır. Döngüyle her bir anahtar parçasını kontrol ederek `current` değişkenini günceller. Arama sırasında herhangi bir seviyede anahtar bulunamazsa, orijinal `key`字符串i döndürür. Eğer tüm parçalar başarıyla eşleşirse ve sonuç bir `string` ise bu çeviriyi, değilse yine orijinal `key`'i döndürür.

**Parametreler**:
- `key`: string — Çevirisi istenen metnin anahtarı. Nokta ile ayrılmış iç içe yapıları temsil edebilir (örneğin `'menu.home'`). Bu anahtar, `dict` nesnesinde aranacak yolu belirtir.

**Dönüş**: `string` tipinde bir değer döndürür. Bulunan çeviri metni veya herhangi bir eşleşme olmaması durumunda girdiğimiz orijinal `key`字符串i geri verir.

---

## INTERFACES

### AboutPageProps
- `lang?: string`

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
  function: src\views\AboutPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: AboutPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-4`, `border-b`, `border-cyan-500/20`, `border-slate-100`, `border-slate-200`, `border-white`, `border-white/10`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-12`, `gap-16`, `gap-24`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-2`, `h-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-space-x-4`, `animate-pulse`, `aspect-square`, `border`, `brightness-0`, `brightness-50`, `duration-1000`, `duration-500`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`, `group`