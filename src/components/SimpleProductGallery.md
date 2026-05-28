---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\SimpleProductGallery.tsx
skeleton_hash: 43203a9a558f7018
entity_hashes:
  func:SimpleProductGallery: 075a0dcd63164c24
  overview: 66bf30b534632de2
  style_tokens: 53f28be412fb3039
generated_at: 2026-05-28T22:37:00Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinde yer alan, ürünleri kullanıcıya görsel olarak düzenli bir biçimde sunmak üzere tasarlanmış basit bir React galeri bileşenidir. Ürün listeleme veya detay sayfalarında ürün görsellerini ve temel bilgilerini sergilemek amacıyla oluşturulmuş, projeye bağımsız olarak dahil edilebilen bir UI bileşenidir.

## Fonksiyon Grupları
### Ana Galeri Bileşeni
Modülün tek sorumluluğu olan ürün galerisini oluşturmak, tüm yapılandırmasını yönetmek ve kullanıcı arayüzünü ekrana yazdırmaktan sorumlu ana React bileşenidir.
- SimpleProductGallery

---

## AXIOMS – Mimari Varsayımlar
React tabanlı basit ürün galerisi bileşeni SimpleProductGallery, çalışma ortamı, iletilen giriş verileri ve ilişkili tüm frontend varlıkları erişilebilir olduğu takdirde amaçlandığı gibi çalışır.

[Aksiyom 1]: Eğer proje genelinde React 16.8 ve üzeri bir çalışma zamanı ortamı yoksa, bu fonksiyonel bileşen hiç yüklenemez, çalışma zamanı veya derleme hatası oluşur.
[Aksiyom 2]: Eğer SimpleProductGallery bileşenine galeride gösterilecek geçerli, erişilebilir dosya yollarına sahip ürün görselleri listesi giriş olarak iletilmezse, galeride hiçbir içerik gösterilemez, boş bir bileşen alanı oluşur.
[Aksiyom 3]: Eğer bileşenin stil tanımlarına (CSS, CSS Module, Tailwind vb. proje özel stil altyapısı) erişim yoksa, galeri öğeleri düzensiz sıralanmış veya görünmez olarak yansıtılır, kullanıcı deneyimi tamamen bozulur.
[Aksiyom 4]: Eğer projenin frontend derleyicisi (Vite, Next.js, CRA vb.) TSX dosyasını derleyemeyecek yapıdaysa, tüm uygulama derleme aşamasında hata alır, yayınlanamaz.
[Aksiyom 5]: Eğer galeri içi gezinme, görsel etkileşimleri için gerekli React olay işleme altyapısı çalışmıyorsa, kullanıcı galeri özelliklerini kullanamaz, galeri işlevsiz kalır.

---

## FONKSİYON DETAYLARI

### SimpleProductGallery
**Ne yapar**: VentHub HVAC projesinde kullanılan basit ürün galerisi React bileşenidir. Ürün detay sayfalarında satışa sunulan ısıtma, soğutma ve havalandırma ekipmanlarına ait görselleri kullanıcılara sunmak, bu görseller arasında kolayca geçiş yapma imkanı tanımak üzere tasarlanmıştır. Kullanıcıların ürün ile ilgili tüm çekilmiş görselleri tek bir merkezi arayüz üzerinden incelemesini sağlayarak ürün sayfalarının kullanıcı deneyimini artırır.
**Nasıl yapar**: React standartlarına uygun fonksiyonel bileşen yapısında geliştirilmiştir, içsel durum (state) yönetimi ile şu anda aktif olarak ana alanda görüntülenen ürün görselini sürekli olarak takip eder. Kullanıcıların küçük önizleme (thumbnail) görsellerinden herhangi birine tıklama durumunda aktif görsel bilgisini güncelleyerek ana ekranda gösterilen görseli değiştirir. Sadece temel galeri işlevlerini sunarak hafif, temiz ve proje genelinde tüm ürün detay sayfalarında yeniden kullanılabilir bir yapıya sahiptir.
**Parametreler**: Bileşenin temel imzasında açıkça tanımlanmış herhangi bir giriş parametresi bulunmamaktadır. React çalışma prensiplerine uygun olarak bileşene prop olarak ürün görselleri listesi, galeri görünüm ayarları gibi özellikler iletilebilir, ancak tanımda belirtilen zorunlu parametre bulunmaz.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Bu bileşen DOM ağacına işlendiğinde SimpleProductGallery arayüzünü ekrana render eder, kullanıcı etkileşimlerine anlık olarak yanıt vererek galeri içindeki aktif görseli gerektiğinde günceller.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SimpleProductGallery.tsx::SimpleProductGallery
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan, çeviri anahtarlarına göre metin döndüren i18n fonksiyonu; `t('home.galleryTitle')` ve `t('home.gallerySubtitle')` çağrılarıyla galeri başlıkları için kullanılır
  - `useI18n` — projenin uluslararasılaştırma sağlayıcısından çeviri fonksiyonunu getiren React hook çağrısı
  - `images` — galeride gösterilecek placeholder resimlerin dosya yollarını tutan string dizisi; map fonksiyonuyla işlenerek galeri öğeleri oluşturulur
- **Dönüş**: Ürün galerisi arayüzünü içeren React JSX section elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SimpleProductGallery.tsx::images.map_callback
- **params**: src, i
- **ic_degiskenler**: (yok)
- **Dönüş**: Her galeri öğesi için oluşturulan, kart yapısına sahip React JSX div elementi; `i` parametresi React liste renderı için benzersiz `key` değeri olarak kullanılır

---

## NODE ID STANDARD

  file: src\components\SimpleProductGallery.tsx
  function: src\components\SimpleProductGallery.tsx::SimpleProductGallery

---

## DISA AKTARILANLAR (EXPORTS)
  export: SimpleProductGallery

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-200`, `border-gray-300`, `md:text-3xl`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-steel-gray`
- **Layout:** `gap-3`, `grid`, `grid-cols-3`, `max-w-7xl`, `md:grid-cols-6`, `sm:grid-cols-4`, `w-full`
- **Varyant/Responsive:** `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `aspect-square`, `border`, `cursor-pointer`, `font-bold`, `group`, `lg:px-8`, `mb-6`, `mt-2`, `mx-auto`, `px-4`, `py-8`, `rounded-lg`, `sm:px-6`