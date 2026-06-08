---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx
skeleton_hash: dfe4cdea0afb8b94
entity_hashes:
  func:ExproofFanModel: 9ab526a69ad42620
  overview: 7f95db9ecbcd6088
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
VentHub HVAC platformunun ürün 3B bileşenleri koleksiyonunda yer alan bu modül, patlamaya dayanıklı (exproof) fan ürünlerinin ürün detay sayfalarında kullanılacak 3D modellerini render etmek amacıyla geliştirilmiştir. React tabanlı mimariye uygun olarak yapılandırılan modül, exproof fanlara özel 3B görselleştirme işini tek bir ana bileşen üzerinden yürütür.

## Fonksiyon Grupları
### Ana 3B Bileşeni
Modülün temel sorumluluğu olan exproof fan 3D modelini ekrana döker, ürün sayfası altyapısıyla uyumlu çalışacak şekilde yapılandırılır ve ilgili 3B sahne öğelerini yönetir.
- ExproofFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı 3D ürün modeli bileşeni, exproof (patlamaya dayanıklı) sınıfı HVAC fan ürünlerinin 3 boyutlu görselleştirmesini gerçekleştirmek için tasarlanmıştır, doğru çalışması için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer ExproofFanModel bileşeninin bulunduğu üst React ağacında 3D renderlama altyapısı (React Three Fiber, Three.js vb.) entegre edilmemişse, 3D fan modeli ekrana çizilemez, kullanıcıya boş veya hata veren içerik gösterilir.
[Aksiyom 2]: Eğer bu bileşene üst bileşenler tarafından exproof fan modelinin geometri, materyal ve model dosyalarına erişim izni ve bağlantı sağlanmamışsa, 3D modelin yüklenmesi başarısız olur, ürün görselleştirme işlemi gerçekleştirilemez.
[Aksiyom 3]: Eğer ExproofFanModel'in çalıştığı kullanıcı tarayıcısında WebGL 3D renderlama desteği bulunmuyorsa, 3D içerik oluşturma işlemi hiç başlayamaz, bileşen tamamen işlevsiz kalır.
[Aksiyom 4]: Eğer bu bileşene exproof fan ürünlerinin standart tip tanımları aktarılmamışsa, modele ait ürün özellikleriyle eşleşen özelleştirilmiş görselleştirme yapılamaz, yanlış veya eksik fan modeli gösterimi oluşur.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::ExproofFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` - useFanMaterials hook'undan alınan, tüm 3D modelin mesh'leri için gerekli renk ve kaplama ayarlarını içeren materyal nesnesi
  - `scrollShape` - useMemo ile önbelleğe alınan, salyangoz fan gövdesinin 2D dış konturunu tanımlayan THREE.Shape nesnesi
  - `Bolt` - içinde tanımlanan, krom cıvata 3D modelini oluşturan iç React bileşeni
- **Dönüş**: Tüm exproof fan 3D modelini içeren Three.js JSX group elementi, React.FC türünde

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::scrollShape_creator
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` - salyangoz gövdenin 2D hattını oluşturmak için başlatılan THREE.Shape nesnesi, üzerinde çizim metotları çağrılarak kontur tamamlanır
- **Dönüş**: Tamamlanmış salyangoz konturunu içeren THREE.Shape nesnesi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::Bolt
- **params**: { position: [number, number, number] }
- **ic_degiskenler**:
  - `position` - parametreden alınan, cıvatanın 3D sahada yerleştirileceği 3 boyutlu koordinat dizisi
  - `materials.boltChrome` - ana fonksiyondan erişilen, cıvata için kullanılan krom kaplama materyali
- **Dönüş**: Cıvata modelini oluşturan, konumlandırılmış Three.js JSX group elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::cooling_fin_map_callback
- **params**: _, i
- **ic_degiskenler**:
  - `i` - map döngüsünün indeksi, benzersiz key değeri olarak ve her kanat için ayrı rotasyon açısı hesaplamasında kullanılır
  - `materials.motorSilver` - motor gövdesi ve kanatları için kullanılan alüminyum rengi materyal
- **Dönüş**: Tek bir soğutma kanadını temsil eden Three.js mesh elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::bolt_position_map_callback
- **params**: angle, i
- **ic_degiskenler**:
  - `angle` - cıvatanın yerleştirileceği açı (derece cinsinden), Math.cos/Math.sin ile 3D koordinatlara dönüştürülür
  - `i` - döngü indeksi, benzersiz key değeri olarak kullanılır
  - `Bolt` - ana fonksiyonda tanımlanan cıvata bileşeni
- **Dönüş**: Açıya göre konumlandırılmış Bolt bileşeni

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::concentric_ring_map_callback
- **params**: r, i
- **ic_degiskenler**:
  - `r` - torus geometrisinin ana yarıçapı, her halka için farklı boyut ayarlamada kullanılır
  - `i` - döngü indeksi, benzersiz key değeri olarak kullanılır
  - `materials.matteBlack` - koruma ızgarası elemanları için kullanılan mat siyah materyal
- **Dönüş**: Tek bir konsentrik koruma halkasını temsil eden Three.js mesh elementi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\ExproofFanModel.tsx::radial_wire_map_callback
- **params**: angle, i
- **ic_degiskenler**:
  - `angle` - radyal telin rotasyon açısı (derece cinsinden), radyana çevrilerek mesh rotasyonunda kullanılır
  - `i` - döngü indeksi, benzersiz key değeri olarak kullanılır
  - `materials.matteBlack` - koruma ızgarası elemanları için kullanılan mat siyah materyal
- **Dönüş**: Tek bir radyal koruma telini temsil eden Three.js mesh elementi

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