---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx
skeleton_hash: 354e6cd6a8427029
entity_hashes:
  func:ExproofFanModel: 9ab526a69ad42620
  overview: 7368b48961b4d2a7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:45:24Z
---

## Genel Bakış
VentHub HVAC platformunda patlamaya dayanıklı (exproof) fan ürünlerinin 3 boyutlu görselleştirilmesini sağlayan React bileşenidir. Ürün detay sayfalarında kullanılmak üzere tasarlanmış, 3D model renderlama altyapısıyla entegre çalışan tek bir modül.

## Fonksiyon Grupları
### Ana 3B Bileşeni
Exproof fan ürünlerinin 3D modelini ekrana döken, React Three Fiber veya benzeri 3D render kütüphaneleriyle uyumlu çalışan temel bileşeni barındırır.
- ExproofFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, props almayan bir React bileşenidrop; doğru çalışması için dış bağımlılıklara ve ortam koşullarına bağlıdır.

[Aksiyom 1]: Eğer React ortamı (React kütüphanesi ve JSX/TSX derleyici desteği) mevcut değilse, bileşen render edilemez ve hata fırlatır.

[Aksiyom 2]: Eğer 3D modelleme/renderleme kütüphanesi (örn: Three.js, React Three Fiber) ortamda bulunmuyorsa, exproof fan 3D modeli görüntülenemez.

[Aksiyom 3]: Eğer bileşen bir React bileşen ağacı içinde çağrılmazsa (örn: bir `div` içine doğrudan yerleştirilirse), React hata mekanizması devreye girer.

[Aksiyom 4]: Eğer 3D model dosyası (fan modeli kaynak varlığı) erişilebilir konumda değilse, model görünmez veya yükleme hatası oluşur.

[Aksiyom 5]: Eğer bileşen çağrılmadan önce gerekli 3D sahne (Canvas/Scene) altyapısı hazırlanmamışsa, bileşen kendi içinde bu altyapıyı sağlamıyorsa render başarısız olur (bileşenin kendi içinde 3D sahne oluşturup oluşturmadığı bilinmiyor).

---

**Not:** Fonksiyon imzası `ExproofFanModel()` olarak tanımlı olup parametre almamaktadır. Bileşen gövdesi paylaşılmadığı için, 3D model yükleme mekanizması, hata yönetimi ve render stratejisi gibi iç uygulama detayları hakkında kesin varsayımlarda bulunulamamıştır.

---

## FONKSİYON DETAYLARI

### ExproofFanModel
**Ne yapar**: VentHub HVAC projesinin ürünler bölümünde kullanılan, patlamaya dayanıklı (exproof) fanların 3B modelini render eden React fonksiyonel bileşenidir. Sadece exproof fan ürünleri için özel olarak geliştirilmiş bu bileşen, platformdaki ürün detay sayfalarında fanın 3 boyutlu görünümünü kullanıcıya sunmakla görevlidir. Proje içindeki 3B ürün modeli standartlarına uygun olarak tüm exproof fan tipleri için tutarlı bir görselleştirme sunar.
**Nasıl yapar**: React tabanlı projenin mevcut 3B bileşen altyapısını kullanarak, exproof fanlara özgü 3B geometri ve görsel ayarlarını yükleyerek sahneye entegre eder. Kaynak dosyası projenin ürün 3B tipleri dizininde konumlanarak diğer fan ve ürün modelleriyle aynı entegrasyon kurallarına uyar, projenin kullandığı harici 3B kütüphaneleri kullanarak modelin kullanıcı tarafından etkileşimli olarak incelenmesini sağlar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz
**Dönüş**: React.FC türünde, React ekosistemiyle tam uyumlu, ekranda render edilebilir bir fonksiyonel bileşen döndürür. Döndürülen bu bileşen, exproof fanın 3B modelini DOM'a eklemek ve kullanıcı etkileşimlerini yönetmek üzere hazırlanmıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::ExproofFanModel
- **params**: () -> React.FC
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` Hook'unun retorno değeri; motor, gövde, cıvata ve koruma ızgarası için gerekli tüm Three.js materyallerini (metal, lastik, boya vb.) sağlar.
  - `scrollShape` — `useMemo` ile optimize edilmiş bir `Shape` nesnesi; salyangoz gövdesinin (scroll housing) 2D dış konturunu tanımlar, `extrudeGeometry` için temel geometriyi oluşturur.
  - `Bolt` — Fonksiyonel React bileşeni; belirtilen `position` dizisi (3D koordinat) ile cıvata geometrisini (silindir gövde + yarım küre baş) render eder.
- **Dönüş**: `React.FC` (JSX ile motor, salyangoz gövdesi, emiş ünitesi ve atış ağzını oluşturan bir React fonksiyon bileşeni)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::scrollShape
- **params**: () -> void (parametre yok)
- **ic_degiskenler**:
  - `shape` — Yeni oluşturulmuş bir `Shape` nesnesi; `moveTo`, `lineTo`, `quadraticCurveTo` metotlarıyla çizgi ve eğri noktaları tanımlanarak salyangoz formu dış konturu oluşturulur.
- **Dönüş**: `Shape` (Three.js Shape objesi, `extrudeGeometry` için kullanılır)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::Bolt
- **params**: `position` — `[number, number, number]` tipinde 3D koordinat dizisi; cıvatanın sahne içindeki (x, y, z) konumunu belirler.
- **ic_degiskenler**: (yok — parametre dışında iç değişken içermeyen saf bir bileşen)
- **Dönüş**: `JSX.Element` (`<group>` içinde `cylinderGeometry` ve `sphereGeometry` ile oluşturulmuş cıvata görseli)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\ExproofFanModel.tsx
  function: src\components\products\3d\types\ExproofFanModel.tsx::ExproofFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: ExproofFanModel

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