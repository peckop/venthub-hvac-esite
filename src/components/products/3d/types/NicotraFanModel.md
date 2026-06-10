---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx
skeleton_hash: 33d856cd0c07caf7
entity_hashes:
  func:NicotraFanModel: 2bdd08e329a67558
  overview: a1f2c486ca700a3e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:47:22Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesindeki 3D ürün görselleştirme altyapısının bir parçası olarak Nicotra marka fanlara ait üç boyutlu modeli React bileşeni olarak sunar. Parametre almayan, sabit bir 3D model gösteren bağımsız bir bileşendir ve ürün sayfalarında kullanılmak üzere dışa aktarılır.

## Fonksiyon Grupları
### 3D Fan Modeli Bileşeni
Projedeki Nicotra marka fanın três boyutlu modelini React ortamında render eden temel bileşendir. Bileşen, harici yapılandırma veya prop almadan sabit bir 3D model sunar.

- NicotraFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz ve modül sabitssiz bir React fonksiyonel bileşenidir; fonksiyon gövdesine erişilemediğinden çalışma koşulları ve bağımlılıklar çıkarılamamıştır.

**[Aksiyom 1]:** Eğer NicotraFanModel bileşeni çağrıldığında gerekli Three.js / React Three Fiber ortamı (Canvas, renderer) mevcut değilse, bileşen render hatası verir.

**[Aksiyom 2]:** Eğer bileşenin içerde yüklemesi beklenen 3D model dosyası (örn: `.glb`, `.gltf`) erişilebilir konumda değilse, model gösterimi boş veya hatalı olur.

**[Aksiyom 3]:** Eğer bileşen挂bir React ağaç içinde kullanılmıyorsa (örn: Canvas bağlamı dışında), Three.js bileşenleri bağlam hatası verir.

---

> **Not:** Fonksiyon imzası `NicotraFanModel()` olarak parametresiz tanımlanmış olup, fonksiyon gövdesine erişilmediği için bağımlılık listesi, prop gereksinimleri ve içsel koşullar **bilinmiyor** durumdadır. Yukarıdaki aksiyomlar, dosya uzantısından (.tsx) ve eski doküman bağlamından çıkarılabilecek minimum yapısal çıkarımları yansıtmaktadır.

---

## FONKSİYON DETAYLARI

### NicotraFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümünde yer alan 3B modelleme bileşenleri ailesinden biridir, yalnızca Nicotra marka fanlara ait 3B modeli React tabanlı uygulama içinde sunmak üzere tasarlanmış fonksiyonel bir React bileşenidir. Proje içindeki tüm fan 3B modelleri için belirlenen standart entegrasyon kurallarına uygun olarak çalışır.
**Nasıl yapar**: React'in fonksiyonel bileşen mimarisini kullanır, içerisinde projenin 3B sahne altyapısıyla uyumlu geometri, malzeme ve konumlandırma tanımlarını barındırır, uygulama içindeki 3B görüntüleme motoruyla entegre olarak modelin doğru şekilde sahne üzerinde render edilmesini sağlar.
**Parametreler**:
- NicotraFanModel fonksiyonuna tanımlı özel bir parametre aktarılmamaktadır, standart React.FC sözleşmesine uygun olarak React tarafından genel amaçlı sunulan children, style gibi yaygın bileşen prop'larını isteğe bağlı olarak kabul edebilir.
**Dönüş**: React.FC tipi, yani React uygulamasının JSX ağacında kullanılabilecek, Nicotra marka fana ait 3B modelini içeren bir React fonksiyonel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: NicotraFanModel.tsx::NicotraFanModel
- **params**: ()
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hookundan dönen malzeme objesi; galvanizedSteel, matteBlack, industrialSteel, ral5010 gibi malzemeleri içerir
  - `fanRef` — useRef<Group>(null) ile oluşturulan referans; rotor grubuna bağlanır, useFrame callback'inde rotation.x güncellenerek fan döndürülür
  - `sideShape` — useMemo ile hesaplanan logaritmik spiral profilli Shape nesnesi; salyangoz gövdenin yan sac şeklini tanımlar
- **Dönüş**: JSX elementi (`<group>` ile sarılmış tüm 3D model ağacı)

### [N2_NASIL] AST Pointer: NicotraFanModel.tsx::useFrame callback
- **params**: (state, delta)
  - `state` — React Three Fiber frame state objesi (bu fonksiyonda kullanılmıyor)
  - `delta` — iki frame arasındaki zaman farkı (saniye); dönüş hızını kontrol eder
- **ic_degiskenler**:
  - `fanRef.current` — fanRef'in mevcut değeri; null değilse rotorun X ekseninde döndürülmesi için kullanılır
- **Dönüş**: yok (yan etki: fanRef.current.rotation.x değerini `delta * 15` kadar azaltır)

### [N3_NASIL] AST Pointer: NicotraFanModel.tsx::useMemo callback (sideShape)
- **params**: ()
- **ic_degiskenler**:
  - `shape` — new Shape() ile oluşturulan boş shape nesnesi; logaritmik spiral ve delik tanımları için kullanılır
  - `segments` — spiral çizgi parçalarının sayısı; 48 olarak sabitlenmiştir
  - `th` — her iterasyondaki açı değeri (radyan); `(i / segments) * Math.PI * 2.2` ile hesaplanır
  - `r` — her açıdaki yarıçap; `0.3 + (th / (Math.PI * 2)) * 0.4` ile logaritmik olarak büyür
  - `shape` üzerinde hesaplanan `x` — cosinus ile hesaplanan x koordinatı: `Math.cos(th) * r`
  - `shape` üzerinde hesaplanan `y` — sinus ile hesaplanan y koordinatı: `Math.sin(th) * r`
  - `hole` — new Path() ile oluşturulan merkez deliği yolu; `absarc` ile 0.28 yarıçaplı daire çizilir
- **Dönüş**: Shape nesnesi (sideShape değişkenine atanır)

### [N4_NASIL] AST Pointer: NicotraFanModel.tsx::titleşak map callback (x)
- **params**: (x)
  - `x` — titreşim takozlarının x koordinatı; `[0.4, -0.4]` dizisinden gelir
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementleri (z mapped mesh'lerin dizisi)

### [N5_NASIL] AST Pointer: NicotraFanModel.tsx::iç map callback (z)
- **params**: (z)
  - `z` — titreşim takozlarının z koordinatı; `[0.4, -0.4]` dizisinden gelir
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (matteBlack malzemeli boxGeometry mesh)

### [N6_NASIL] AST Pointer: NicotraFanModel.tsx::kanat map callback
- **params**: (_, i)
  - `_` — Array(24).fill(0) elemanı (kullanılmıyor)
  - `i` — kanat indeksi (0-23 arası); her kanadın rotasyon açısı `(i / 24) * Math.PI * 2` olarak hesaplanır
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (galvanizedSteel malzemeli boxGeometry mesh — tek bir kanat)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\NicotraFanModel.tsx
  function: src\components\products\3d\types\NicotraFanModel.tsx::NicotraFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: NicotraFanModel

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