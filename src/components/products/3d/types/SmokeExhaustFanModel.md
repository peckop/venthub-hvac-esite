---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx
skeleton_hash: 062084050a189af2
generated_at: 2026-05-23T22:25:10Z
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

## FONKSIYON DETAYLARI

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

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx::useFrame_callback
- **params**: (state, delta)
- **ic_degiskenler**:
  - `state` — useFrame hook'u tarafından gelen global sahne state nesnesi, kullanılmaz
  - `delta` — frame arası geçen zaman, rotorun sabit hızda dönmesini sağlamak için çarpan olarak kullanılır
  - `rotorRef.current` — rotor grubu referansının mevcut örneği, dönüş animasyonu için rotation.z değeri güncellenir
- **Dönüş**: yok

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx::useMemo_bladeGeometry_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — THREE.Shape nesnesi, 2D pervane kesitini çizmek ve tanımlamak için kullanılır
  - `extrudeSettings` — THREE.ExtrudeGeometry ayarları nesnesi, 3D extrüzyon derinliği, pahlama (bevel) parametrelerini içerir
- **Dönüş**: THREE.ExtrudeGeometry nesnesi, fan pervanelerinin son 3D geometrisi

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx::flange_map_callback
- **params**: (zPos, i)
- **ic_degiskenler**:
  - `zPos` — flanşın Z ekseni konumu, iki ayrı flanşın farklı konumda durmasını sağlar
  - `i` — flanşın index değeri, benzersiz anahtar oluşturmak ve cıvata konumlarını ayarlamak için kullanılır
  - `materials.smokeCoating` — duman kaplaması materyali, gövde ve flanş sabit bileşenlerinde kullanılır
  - `materials.boltMaterial` — metal cıvata materyali, flanşlardaki sabitleme cıvatalarına uygulanır
- **Dönüş**: Tek flanş grubunu temsil eden `<group>` JSX elementi

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx::bolt_map_callback
- **params**: (_, b)
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı değeri
  - `b` — cıvata index değeri, cıvatanın dairesel konumunu hesaplamak ve benzersiz anahtar oluşturmak için kullanılır
  - `i` — üst kapsamdaki flanş index'i, cıvatanın Z ekseni konumunu ayarlamak için kullanılır
  - `materials.boltMaterial` — metal cıvata materyali, her cıvata mesh'ine uygulanır
- **Dönüş**: Tek cıvatayı temsil eden `<mesh>` JSX elementi

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx::blade_map_callback
- **params**: (_, i)
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı değeri
  - `i` — pervane index değeri, 6 pervanenin eşit açılarla yerleştirilmesini sağlamak ve benzersiz anahtar oluşturmak için kullanılır
  - `bladeGeometry` — önbelleğe alınan pervane 3D geometrisi, her pervane mesh'ine uygulanır
  - `materials.castBladeMat` — döküm metal pervane materyali, tüm fan pervanelerine uygulanır
- **Dönüş**: Tek pervaneyi içeren `<group>` JSX elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SmokeExhaustFanModel.tsx
  function: src\components\products\3d\types\SmokeExhaustFanModel.tsx::SmokeExhaustFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SmokeExhaustFanModel