---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx
skeleton_hash: 062084050a189af2
entity_hashes:
  func:SmokeExhaustFanModel: c61745ed6f96bf83
  overview: dbcf102fe547cb19
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:50Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunda ürünler bölümünde konumlanan, duman tahliye fanının 3 boyutlu modelini render etmek için geliştirilmiş React bileşenidir. Proje içindeki 3B ürün tipleri kategorisinde yer alan bu modül, platformun 3B görünüm özelliklerinde fan modelinin sorunsuz şekilde gösterilmesini sağlar.

## Fonksiyon Grupları
### Ana 3B Fan Bileşeni
Modülün temel sorumluluğunu üstlenen bu grup, duman tahliye fanının 3B modelinin tüm işleyiş ve render sürecini tek başına yönetir.
- SmokeExhaustFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı 3D duman egzoz fanı modeli bileşeninin doğru çalışması, uygulamanın temel React çalışma zamanı ve 3D model rendering altyapısının erişilebilir olmasına bağlıdır.

[Aksiyom 1]: Eğer React JSX çalışma zamanı bu bileşenin çalıştığı ortamda mevcut değilse, bileşen hiçbir şekilde render edilemez ve uygulama genelinde çalışma zamanı hatası oluşur.
[Aksiyom 2]: Eğer 3D model bileşenlerinin çalışması için gerekli olan temel 3D rendering kütüphanesi ortama yüklenmemişse, bu modül hedeflediği duman egzoz fanı modelini ekrana çizemez.
[Aksiyom 3]: Eğer bu modülün kullanması gereken 3D model asset dosyaları (model dosyaları, kaplama vb.) erişilebilir değilse, model yüklemesi başarısız olur ve kullanıcıya boş veya hata içeren bir görsel alan sunulur.
[Aksiyom 4]: Eğer bu bileşenin çalışması için ihtiyaç duyduğu temel tip tanımları modülün erişebileceği konumda bulunmuyorsa, TypeScript derlemesi başarısız olur ve uygulama build süreci kesilir.

---

## FONKSİYON DETAYLARI

### SmokeExhaustFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler modülünde kullanılan duman tahliye fanı 3B model bileşenidir. Projenin src/components/products/3d/types dizininde yer alan bu React bileşeni, platformun ilgili sayfalarında duman egzoz fanının 3 boyutlu olarak görüntülenmesini sağlar. Ürün detay ekranlarında kullanıcının fan modelini incelemesine olanak tanıyan temel yapı taşlarından biridir.
**Nasıl yapar**: Bir React bileşeni olarak çalışan yapı, kendi içindeki 3B model yükleme ve renderlama süreçlerini bağımsız olarak yönetir. Projenin kullandığı 3B grafik altyapısı ile uyumlu çalışarak modeli ilgili sahneye entegre eder, gerekli konumlandırma, ölçekleme ve görünürlük ayarlarını kendi iç mantığı ile gerçekleştirir.
**Parametreler**: Bu fonksiyona ait herhangi bir giriş parametresi tanımında belirtilmemiştir, fonksiyona herhangi bir dış değer aktarılmaz.
**Dönüş**: Tanımında belirtildiği üzere dönüş tipi void veya bilinmiyor olarak kaydedilmiştir. React bileşeni olarak çalışması nedeniyle asıl görevi ilgili 3B modeli ekrana render etmek olduğundan herhangi bir işlem sonucu değeri döndürmez.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx::SmokeExhaustFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'u ile temin edilen, tüm fan bileşenlerinde kullanılan materyaller nesnesi
  - `rotorRef` — THREE.Group tipinde referans, fan rotorunun dönüş animasyonunu kontrol etmek için kullanılır
  - `useFrame` — react-three-fiber kütüphanesinin her render frame'de çalışan hook'u, rotor dönüşünü uygular
  - `bladeGeometry` — useMemo ile önbelleğe alınan, fan pervanelerinin 3D geometrisi nesnesi
- **Dönüş**: React Three Fiber `<group>` JSX elementi, 3D duman egzos fanı modelini temsil eder

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SmokeExhaustFanModel.tsx
  function: src\components\products\3d\types\SmokeExhaustFanModel.tsx::SmokeExhaustFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SmokeExhaustFanModel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)