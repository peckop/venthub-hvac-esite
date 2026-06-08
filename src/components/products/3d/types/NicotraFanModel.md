---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx
skeleton_hash: a8aa382bd56c1c31
entity_hashes:
  func:NicotraFanModel: 2bdd08e329a67558
  overview: 6c60b44af10ab744
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinde Nicotra marka fanlara ait 3D modelin React bileşeni olarak sunulmasını sağlar. Projedeki 3D ürün görselleştirme altyapısının bir parçası olarak, ilgili ürün sayfalarında entegre edilmek üzere tek bir dışa aktarılan bileşen sunar.

## Fonksiyon Grupları
### Ana 3D Fan Modeli Bileşeni
Modülün temel ve tek dışa aktarılan bileşeni olarak Nicotra fanının 3D modelini React uyumlu şekilde render eder.
- NicotraFanModel

---

## AXIOMS – Mimari Varsayımlar
NicotraFanModel, parametresiz ve sabit tanımsız bir React 3D model bileşenidir; dış bağımlılıkları ve çalışma koşulları fonksiyon gövdesinden çıkarılamamıştır.

**[Aksiyom 1]:** Eğer React çalışma ortamı (rendering context) yoksa, bileşen JSX döndüremez ve uygulama hata verir.

**[Aksiyom 2]:** Eğer 3D modelleme kütüphanesi (örn: Three.js / React Three Fiber) modül ortamında yüklü ve erişilebilir değilse, bileşen render işlemi başarısız olur.

**[Aksiyom 3]:** Eğer Nicotra fan modeline ait 3D varlık (geometry/texture dosyası) erişilebilir konumda değilse, model boş veya hatalı görüntülenir.

> **Not:** Fonksiyon imzasında (`NicotraFanModel()`) hiç prop parametresi tanımlı değildir; bu durum bileşenin tamamen sabit/static bir 3D model sunduğunu, dışarıdan yapılandırma almadığını gösterir. Fonksiyon gövdesine erişilemediği için 3D kütüphane bağımlılıkları ve varlık yolları doğrulanamamıştır.

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

### [N1_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::component_body
- **params**: () — parametresiz anonim ok fonksiyonu, React.FC döner
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen malzeme nesnesi; galvanizedSteel, matteBlack, industrialSteel, ral5010 gibi Three.js materyallerini barındırır
  - `fanRef` — `useRef<THREE.Group>(null)` ile oluşturulan referans; fan rotoruna (`<group ref={fanRef}`) bağlanır, useFrame içinde döndürmek için kullanılır
  - `sideShape` — `useMemo` ile hesaplanan `THREE.Shape` nesnesi; salyangoz gövdesinin yan sac profilini (logaritmik spiral + merkez delik) temsil eder, extrudeGeometry argümanı olarak kullanılır
- **useFrame callback** — `(state, delta) => { ... }` bloğu; her karede `fanRef.current.rotation.x` değerini `delta * 15` kadar azaltarak fan rotorunu X ekseni etrafında döndürür
- **useMemo callback** — `() => { ... }` bloğu; spiral profil geometrisini hesaplar, `[]` bağımlılık dizisi sayesinde yalnızca bir kez hesaplanır
- **Dönüş**: JSX — `<group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}` ile sarılmış 4 alt gruptan (X-Şasi, Salyangoz Gövde, Rotor, Motor) oluşan 3D sahne

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