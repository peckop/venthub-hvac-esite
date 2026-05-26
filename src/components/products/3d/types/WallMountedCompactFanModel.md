---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx
skeleton_hash: 9ce537b49bd29ad0
generated_at: 2026-05-23T22:25:41Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürün 3D görselleştirme altyapısında kullanılan, duvara monte kompakt fan modellerini renderlayan React bileşenini barındırır. Ürün kataloğunda fan türü ürünlerin 3 boyutlu olarak kullanıcılara sunulması sürecinde temel görev üstlenir.

## Fonksiyon Grupları
### Ana 3D Bileşeni
Modülün tüm sorumluluğunu üstlenen tek grup, duvara monte kompakt fanın 3 boyutlu modelini React uygulaması içinde kullanılabilir hale getirir, ürün sayfalarında doğru şekilde görüntülenmesini sağlar.
- WallMountedCompactFanModel

---

## AXIOMS – Mimari Varsayımlar
Venthub HVAC projesinin 3D ürün bileşenleri kategorisinde yer alan bu TypeScript React bileşeni, duvara monte kompakt fan modelinin 3D olarak görüntülenmesini sağlamak için tasarlanmıştır. Doğru çalışması, proje içindeki tüm ilgili bağımlılıkların, kaynak dosyalarının ve derleme altyapısının erişilebilir olmasına tamamen bağlıdır.

[Aksiyom 1]: Eğer React kütüphanesi proje bağımlılıklarında yüklenmiş ve bu bileşenin erişebileceği şekilde tanımlı değilse, bu TSX bileşeni hiçbir şekilde derlenemez ve çalışmaz.
[Aksiyom 2]: Eğer proje içinde 3D model renderlamak için kullanılan temel 3D altyapısı (Three.js, React Three Fiber vb.) yüklenmemiş ve bu bileşen tarafından erişilebilir değilse, fanın 3D modeli ekrana hiçbir şekilde çizilemez.
[Aksiyom 3]: Eğer bu bileşen tarafından kullanılan duvara monte kompakt fana ait tüm 3D model kaynak dosyaları (geometri, doku vb.) bileşenin erişebildiği dosya yolunda mevcut değilse, model eksik/hatalı renderlanır ya da hiç görüntülenmez.
[Aksiyom 4]: Eğer TypeScript derleyici yapılandırmasında src/components/products/3d/types/ dosya yolu tanımlı ve izin verilen derleme yolları arasına dahil edilmemişse, bu bileşen proje build adımında derlenemez ve hata fırlatır.
[Aksiyom 5]: Eğer bu bileşeni çağıran üst seviye ürün görüntüleme bileşenleri bu 3D modeline gerekli renderlama izinlerini ve bağlam verilerini sağlamıyorsa, fan modeli sadece statik bir şekil olarak kalır, tüm etkileşimli özellikleri devre dışı kalır.

---

## FONKSIYON DETAYLARI

### WallMountedCompactFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında kullanılmak üzere, duvara monte kompakt vantilatörün 3 boyutlu modelini barındıran bir React fonksiyonel bileşeni sunar. Projenin tip güvenliği standartlarına uygun olarak 3D ürün modelleri ailesinin bir parçası olarak yapılandırılmış, sadece bu spesifik vantilatör modelinin 3B olarak render edilmesini sağlar.
**Nasıl yapar**: TypeScript ile güçlendirilmiş tip güvenliği sunan bir yapı ile, React.FC türünde hazırlanmış bileşeni doğrudan döndüren bir fabrika yapısı sunar. Kaynak kodunun bulunduğu dizin itibarıyla tüm duvara monte kompakt vantilatörlere ait 3B görsel varlıkları ve geometrik tanımları içeren bileşeni projenin diğer bölümlerinin kullanımına sunar, projenin 3D modelleme entegrasyonlarıyla sorunsuz çalışacak şekilde önceden yapılandırılmıştır.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, uygulama içindeki herhangi bir noktada çağrıldığında, duvara monte kompakt vantilatörün 3D modelini React render süreci kapsamında ilgili ekrana çizmek üzere kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::WallMountedCompactFanModel
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `fanRef` — Three.js Group nesnesini referanslayan useRef, pervanenin rotasyonunu güncellemek için kullanılır
  - `useFrame` — @react-three/fiber hook'u, her karede çalışarak fan dönüşünü günceller
  - `plateGeometry` — useMemo ile önbelleğe alınan duvar montaj plakasının ExtrudeGeometry nesnesi
  - `COLORS` — Modelin tüm parçalarının renk kodlarını tutan sabit nesne, PLATE, BLACK_PARTS, BLADE_ORANGE, WIRE_GUARD anahtarları içerir
- **Dönüş**: 3D fan modelini içeren React Three.js group JSX componenti

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::useFrame_callback
- **params**: state, delta
- **ic_degiskenler**: 
  - `fanRef.current` — Pervane grubunun mevcut Three.js nesnesi, null kontrolü yapılır
  - `fanRef.current.rotation.z` — Pervane grubu'nun z eksenindeki rotasyon değeri, her karede güncellenir
  - `delta` — Son kareden geçen süre, dönüş hızını platform bağımsız yapmak için kullanılır
- **Dönüş**: yok, yalnızca yan etki (rotasyon değeri güncellenir)

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::useMemo_plateGeometry_callback
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `shape` — Montaj plakasının ana şeklini tanımlayan Three.js Shape nesnesi
  - `holeRadius` — Montaj deliklerinin yarıçapı (0.03)
  - `holeOffset` — Montaj deliklerinin köşelerden uzaklığı (0.42)
  - `corners` - Dört montaj deliğinin koordinatlarını tutan 2D dizi
  - `hole` — Her bir montaj deliği için oluşturulan Three.js Path nesnesi
  - `centerHole` — Plakanın ortasındaki büyük delik için oluşturulan Three.js Path nesnesi
  - `shape.holes` — Şekle eklenen tüm deliklerin dizisi, montaj ve orta deliği buraya eklenir
- **Dönüş**: Tanımlanan şekle göre üretilmiş Three.js ExtrudeGeometry nesnesi

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::corners_forEach_callback
- **params**: [x, y]
- **ic_degiskenler**: 
  - `x` — O anki montaj deliğinin x koordinatı
  - `y` — O anki montaj deliğinin y koordinatı
  - `hole` — O anki montaj deliği için oluşturulan Three.js Path nesnesi
  - `hole.absarc` — Dairsel delik şeklini tanımlayan Path methodu
  - `holeRadius` — Üst kapsamdaki delik yarıçapı değeri
  - `shape.holes` — Ana şekle yeni oluşturulan deliği eklemek için kullanılan delikler dizisi
- **Dönüş**: yok, deliği ana şekle ekler

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::cooling_fins_map_callback
- **params**: _, i
- **ic_degiskenler**: 
  - `i` — Soğutma kanatçığının indeksi, benzersiz key olarak kullanılır
  - `rotation` — Kanatçığın dairesel olarak konumlanması için hesaplanan 3D rotasyon dizisi
  - `boxGeometry` — Kanatçığın boyutlarını tanımlayan Three.js kutu geometrisi
  - `meshStandardMaterial` — Kanatçığın materyali, siyah renkli
  - `COLORS.BLACK_PARTS` — Siyah parçalar için tanımlı renk kodu
- **Dönüş**: Soğutma kanatçığını temsil eden React Three.js mesh componenti

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::motor_arms_map_callback
- **params**: angle, i
- **ic_degiskenler**: 
  - `i` — Motor kolunun indeksi, benzersiz key olarak kullanılır
  - `angle` — Kolun derece cinsinden açısı
  - `rotation` — Açının radyana çevrilmiş hali, gruba uygulanan 3D rotasyon dizisi
  - `boxGeometry` — Motor kolunun boyutlarını tanımlayan kutu geometrisi
  - `meshStandardMaterial` — Kolun materyali, siyah renkli
  - `COLORS.BLACK_PARTS` — Siyah renk kodu
- **Dönüş**: Motor kolunu temsil eden React Three.js group componenti

---

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::fan_blades_map_callback
- **params**: _, i
- **ic_degiskenler**: 
  - `i` — Pervane kanadının indeksi, benzersiz key olarak kullanılır
  - `rotation` — Kanadın dairesel olarak konumlanması için hesaplanan 3D rotasyon dizisi
  - `boxGeometry` — Kanadın boyutlarını tanımlayan kutu geometrisi
  - `meshStandardMaterial` — Turuncu renkli kanat materyali, emissif özellikli
  - `COLORS.BLADE_ORANGE` — Pervane kanatları için tanımlı turuncu renk kodu
- **Dönüş**: Pervane kanadını temsil eden React Three.js group componenti

---

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::standoffs_x_map_callback
- **params**: x
- **ic_degiskenler**: 
  - `x` — Standoff'un x eksenindeki konumu
- **Dönüş**: y koordinatlarını işleyen iç map fonksiyonu, standoff grubunu döndürür

---

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::standoffs_y_map_callback
- **params**: y
- **ic_degiskenler**: 
  - `y` — Standoff'un y eksenindeki konumu
  - `x` — Üst kapsamdaki standoff'un x konumu
  - `key` — group'un benzersiz kimlik anahtarı
  - `cylinderGeometry` — Standoff ve başlığının silindir geometrileri
  - `meshStandardMaterial` — Metalik gri renkli materyal
  - `COLORS.WIRE_GUARD` — Tel kafes parçaları için tanımlı renk kodu
- **Dönüş**: Standoff'u temsil eden React Three.js group componenti

---

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::frame_v_map_callback
- **params**: x
- **ic_degiskenler**: 
  - `x` — Dikey çerçeve çubuğunun x konumu
  - `key` — mesh'in benzersiz kimlik anahtarı
  - `boxGeometry` — Dikey çubuğun boyutlarını tanımlayan kutu geometrisi
  - `meshStandardMaterial` — Metalik gri renkli materyal
  - `COLORS.WIRE_GUARD` — Tel kafes renk kodu
- **Dönüş**: Dikey çerçeve çubuğunu temsil eden React Three.js mesh componenti

---

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::frame_h_map_callback
- **params**: y
- **ic_degiskenler**: 
  - `y` — Yatay çerçeve çubuğunun y konumu
  - `key` — mesh'in benzersiz kimlik anahtarı
  - `boxGeometry` — Yatay çubuğun boyutlarını tanımlayan kutu geometrisi
  - `meshStandardMaterial` — Metalik gri renkli materyal
  - `COLORS.WIRE_GUARD` — Tel kafes renk kodu
- **Dönüş**: Yatay çerçeve çubuğunu temsil eden React Three.js mesh componenti

---

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::wire_guards_rings_map_callback
- **params**: _, i
- **ic_degiskenler**: 
  - `i` — Halkanın indeksi, benzersiz key olarak kullanılır
  - `key` — mesh'in benzersiz kimlik anahtarı
  - `ringGeometry` — Halkanın iç ve dış yarıçapını indekse göre hesaplayan halka geometrisi
  - `meshStandardMaterial` — Metalik gri renkli materyal
  - `COLORS.WIRE_GUARD` — Tel kafes renk kodu
- **Dönüş**: Tel kafes halkasını temsil eden React Three.js mesh componenti

---

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::radial_wires_map_callback
- **params**: angle, i
- **ic_degiskenler**: 
  - `i` — Radyal telin indeksi, benzersiz key olarak kullanılır
  - `angle` — Telin derece cinsinden açısı
  - `rotation` — Açının radyana çevrilmiş hali, 3D rotasyon dizisi
  - `boxGeometry` — Telin boyutlarını tanımlayan kutu geometrisi
  - `meshStandardMaterial` — Metalik gri renkli materyal
  - `COLORS.WIRE_GUARD` — Tel kafes renk kodu
- **Dönüş**: Radyal teli temsil eden React Three.js mesh componenti

---

## NODE ID STANDARD

  file: src\components\products\3d\types\WallMountedCompactFanModel.tsx
  function: src\components\products\3d\types\WallMountedCompactFanModel.tsx::WallMountedCompactFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: WallMountedCompactFanModel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Responsive:** (yok)
