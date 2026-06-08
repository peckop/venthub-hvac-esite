---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx
skeleton_hash: 0c186e3542b04fd1
entity_hashes:
  func:SmokeExhaustFanModel: c61745ed6f96bf83
  overview: 384ff5fde93c0465
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunun ürün sergisinde yer alan duman tahliye fanının 3 boyutlu modelini görselleştirmek için tasarlanmış bir React bileşenidir. Modül, 3D ürün modelleri kategorisindeki bu spesifik fanın tarayıcı içinde doğru ve verimli bir şekilde render edilmesini sağlamakla yükümlüdür.

## Fonksiyon Grupları
### Ana 3B Fan Bileşeni
Bu grup, modülün tek ve temel bileşeni olan fanın 3D modelinin tüm render mantığını ve görünüm akışını yönetir.
- SmokeExhaustFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon imzası `SmokeExhaustFanModel()` olarak verilmiş olup herhangi bir parametre, modül sabiti veya return türü bilgisi mevcut değildir. Fonksiyon gövdesi kodu paylaşılmadığı için, sadece imzadan çıkarılabilecek mimari bir koşul belirlenememiştir. Docstring ve yorumlardan bilgi çıkarılamayacağından, varsayımlar yalnızca fonksiyon gövdesine dayanmalıdır.

---

## FONKSİYON DETAYLARI

### SmokeExhaustFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler modülünde kullanılan duman tahliye fanı 3B model bileşenidir. Projenin src/components/products/3d/types dizininde yer alan bu React bileşeni, platformun ilgili sayfalarında duman egzoz fanının 3 boyutlu olarak görüntülenmesini sağlar. Ürün detay ekranlarında kullanıcının fan modelini incelemesine olanak tanıyan temel yapı taşlarından biridir.
**Nasıl yapar**: Bir React bileşeni olarak çalışan yapı, kendi içindeki 3B model yükleme ve renderlama süreçlerini bağımsız olarak yönetir. Projenin kullandığı 3B grafik altyapısı ile uyumlu çalışarak modeli ilgili sahneye entegre eder, gerekli konumlandırma, ölçekleme ve görünürlük ayarlarını kendi iç mantığı ile gerçekleştirir.
**Parametreler**: Bu fonksiyona ait herhangi bir giriş parametresi tanımında belirtilmemiştir, fonksiyona herhangi bir dış değer aktarılmaz.
**Dönüş**: Tanımında belirtildiği üzere dönüş tipi void veya bilinmiyor olarak kaydedilmiştir. React bileşeni olarak çalışması nedeniyle asıl görevi ilgili 3B modeli ekrana render etmek olduğundan herhangi bir işlem sonucu değeri döndürmez.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/SmokeExhaustFanModel.tsx::SmokeExhaustFanModel
- **params**: (yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hook'undan dönen malzeme nesnesi; fan için gerekli tüm materyalleri içerir (smokeCoating, castBladeMat, boltMaterial, matteBlack)
  - `rotorRef` — THREE.Group referansı; rotor grubuna referans tutar, useFrame ile döndürmek için kullanılır
  - `bladeGeometry` — useMemo ile hesaplanan ve bellek sızıntısını önlemek için önbelleğe alınan THREE.ExtrudeGeometry nesnesi; 6 rotor bıçağının geometrisini tanımlar
- **Dönüş**: JSX elementi (React bileşeni)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/SmokeExhaustFanModel.tsx::useFrameCallback
- **params**: (state, delta)
  - `state` — React-Three-Fiber frame state nesnesi (kullanılmıyor)
  - `delta` — Son frame ile arasındaki zaman farkı (saniye cinsinden)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (useFrame yan etki callback'i)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/SmokeExhaustFanModel.tsx::useMemoBladeGeometryCallback
- **params**: (yok)
- **ic_degiskenler**:
  - `shape` — THREE.Shape nesnesi; bıçağın 2D kesit şeklini tanımlar (Bezier eğrileri ile)
  - `extrudeSettings` — Object literal; ExtrudeGeometry için ExtrudeSettings parametreleri (depth, bevel ayarları)
- **Dönüş**: THREE.ExtrudeGeometry nesnesi

### [N4_NASIL] AST Pointer: src/components/products/3d/types/SmokeExhaustFanModel.tsx::flangeMapCallback
- **params**: (zPos, i)
  - `zPos` — Flanşın Z eksenindeki konumu (0.38 veya -0.38)
  - `i` — Flanş indeksi (0 veya 1)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi (flanş grubu)

### [N5_NASIL] AST Pointer: src/components/products/3d/types/SmokeExhaustFanModel.tsx::boltMapCallback
- **params**: (_, b)
  - `_` — Kullanılmayan değer (Array(16) elemanı)
  - `b` — Civata indeksi (0-15 arası)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi (civata mesh'i)

### [N6_NASIL] AST Pointer: src/components/products/3d/types/SmokeExhaustFanModel.tsx::bladeMapCallback
- **params**: (_, i)
  - `_` — Kullanılmayan değer (Array(6) elemanı)
  - `i` — Bıçak indeksi (0-5 arası)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi (bıçak grubu)

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