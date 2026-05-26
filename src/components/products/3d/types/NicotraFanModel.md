---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx
skeleton_hash: 2757b76fcef78562
generated_at: 2026-05-23T22:24:50Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinde ürünlerin 3D görselleştirilmesi süreçlerinde kullanılan, Nicotra marka fanlara özel 3D model React bileşenini barındırıyor. Projenin 3D ürün tipleri kategorisinde yer alan bu modül, ilgili ürün görselleştirmelerinde entegre edilmek üzere tek ana bileşen sunuyor.

## Fonksiyon Grupları
### Ana 3D Fan Modeli Bileşeni
Modülün tek dışa aktarılan temel bileşeni olarak Nicotra marka fanların 3D modelini React uyumlu şekilde hayata geçirir, projenin ilgili bölümlerinde kullanılabilir hale getirir.
- NicotraFanModel

---

## AXIOMS – Mimari Varsayımlar
Venthub projesi kapsamında geliştirilen 3D HVAC ürün modeli olan NicotraFanModel TSX bileşeninin sorunsuz çalışması için proje içindeki React çalışma zamanı, 3D render altyapısı ve model dosyasının erişilebilirliği zorunludur.

[Aksiyom 1]: Eğer proje React çalışma zamanı ortamı mevcut değilse, bu TSX bileşeni derlenemez ve hiçbir şekilde çalışmaz.
[Aksiyom 2]: Eğer projedeki 3D ürünleri işleyen 3D render kütüphanesi (React Three Fiber vb.) kurulu veya erişilebilir değilse, NicotraFanModel 3D sahnesine eklenemez, çalışma zamanında render hatası oluşur.
[Aksiyom 3]: Eğer Nicotra fanına ait 3D model dosyası (glb, obj vb.) bileşenin erişebileceği bir dosya yolunda bulunmuyorsa, fan modeli kullanıcı arayüzünde hiç görüntülenmez.
[Aksiyom 4]: Eğer bu bileşenin TypeScript tür tanımları projenin TS yapılandırmasına uyumsuz ise, geliştirme ortamında derleme hatası alınır, üretim sürümü oluşturulamaz.

---

## FONKSIYON DETAYLARI

### NicotraFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümünde yer alan 3B modelleme bileşenleri ailesinden biridir, yalnızca Nicotra marka fanlara ait 3B modeli React tabanlı uygulama içinde sunmak üzere tasarlanmış fonksiyonel bir React bileşenidir. Proje içindeki tüm fan 3B modelleri için belirlenen standart entegrasyon kurallarına uygun olarak çalışır.
**Nasıl yapar**: React'in fonksiyonel bileşen mimarisini kullanır, içerisinde projenin 3B sahne altyapısıyla uyumlu geometri, malzeme ve konumlandırma tanımlarını barındırır, uygulama içindeki 3B görüntüleme motoruyla entegre olarak modelin doğru şekilde sahne üzerinde render edilmesini sağlar.
**Parametreler**:
- NicotraFanModel fonksiyonuna tanımlı özel bir parametre aktarılmamaktadır, standart React.FC sözleşmesine uygun olarak React tarafından genel amaçlı sunulan children, style gibi yaygın bileşen prop'larını isteğe bağlı olarak kabul edebilir.
**Dönüş**: React.FC tipi, yani React uygulamasının JSX ağacında kullanılabilecek, Nicotra marka fana ait 3B modelini içeren bir React fonksiyonel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx::NicotraFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'undan alınan malzeme nesnesi, tüm 3B mesh'lere malzeme atamak için kullanılır
  - `materials.galvanizedSteel` — Paslanmaz çelik malzeme, şase, salyangoz gövdesi, rotor ve kanatlarda kullanılır
  - `materials.matteBlack` — Mat siyah malzeme, titreşim takozlarında kullanılır
  - `materials.industrialSteel` — Endüstriyel çelik malzeme, atış ağzında kullanılır
  - `materials.ral5010` — RAL5010 mavi malzeme, motor bileşeninde kullanılır
  - `fanRef` — THREE.Group tipi referans, dönen fan rotorunun sahne referansını tutar
  - `sideShape` — useMemo ile önbelleğe alınan salyangoz yan profilini tutan THREE.Shape nesnesi
  - `useFrame` — @react-three/fiber frame güncelleme hook'u, fan dönüşünü her karede güncellemek için kullanılır
  - `useMemo` — React önbellekleme hook'u, yan profil geometrisini sadece bir kere oluşturmak için kullanılır
- **Dönüş**: Tüm fan 3B bileşenlerini içeren JSX group elemanı, React.FC çıktısı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx::useFrame_rotation_callback
- **params**: state, delta
- **ic_degiskenler**:
  - `state` — @react-three/fiber tarafından gönderilen sahne durumu nesnesi
  - `delta` — Son kareden geçen zaman farkı, donanıma bağlı olmadan sabit hızda dönüş sağlamak için kullanılır
  - `fanRef.current` — Fan rotorunun mevcut sahne referansı, null kontrolünden sonra erişilir
  - `fanRef.current.rotation.x` — Rotorun X eksenindeki dönüş açısı, her karede güncellenir
- **Dönüş**: yok, sadece rotor dönüşünü güncelleyen yan etki üretir

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx::useMemo_sideShape_generator
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — Yeni oluşturulan THREE.Shape nesnesi, salyangoz gövdesinin yan profilini tanımlar
  - `segments` — Spiral profilin segment sayısı, sabit 48 olarak tanımlı
  - `i` — Döngü sayacı, 0'dan segments değerine kadar artar
  - `th` — Her segment için hesaplanan açı değeri, spiral koordinatlarını hesaplamak için kullanılır
  - `r` — Her açı için hesaplanan yarıçap, logaritmik spiralin boyutunu belirler
  - `x` — Mevcut segmentin X koordinatı, şekil çizgisi için kullanılır
  - `y` — Mevcut segmentin Y koordinatı, şekil çizgisi için kullanılır
  - `hole` — Merkezdeki delik için oluşturulan THREE.Path nesnesi
  - `shape.holes` — Şeklin delikler listesi, merkez deliğini eklemek için kullanılır
- **Dönüş**: Tamamlanmış salyangoz yan profili, THREE.Shape tipi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx::vibration_pads_x_map_callback
- **params**: x
- **ic_degiskenler**:
  - `x` — Mevcut takozun X konumu değeri, 0.4 veya -0.4
  - `[0.4, -0.4]` — Z konumları için sabit dizi, tüm Z eksenindeki takoz konumlarını üretir
  - `${x}-${z}` — Her takoz için benzersiz React listeleme anahtarı
  - `materials.matteBlack` — Takozlar için kullanılan mat siyah malzeme
- **Dönüş**: X konumuna göre üretilen tüm Z konumundaki takoz mesh'leri listesi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx::vibration_pads_z_map_callback
- **params**: z
- **ic_degiskenler**:
  - `x` — Üst scope'dan gelen takozun X konumu değeri
  - `z` — Mevcut takozun Z konumu değeri, 0.4 veya -0.4
  - `position[0]` — Mesh'in X konumu, x değeri ile atanır
  - `position[1]` — Mesh'in Y konumu, sabit -0.05
  - `position[2]` — Mesh'in Z konumu, z değeri ile atanır
  - `boxGeometry.args[0]` — Takoz kutusunun X boyutu, sabit 0.1
  - `boxGeometry.args[1]` — Takoz kutusunun Y boyutu, sabit 0.05
  - `boxGeometry.args[2]` — Takoz kutusunun Z boyutu, sabit 0.1
- **Dönüş**: Tek bir titreşim takozu mesh JSX elemanı

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\NicotraFanModel.tsx::rotor_blades_map_callback
- **params**: _, i
- **ic_degiskenler**:
  - `_` — Kullanılmayan dizi elemanı, sabit 0 değeri
  - `i` — Kanat indeksi, 0'dan 23'e kadar artar
  - `key` — Kanat için benzersiz React listeleme anahtarı, i değeri kullanılır
  - `rotation[1]` — Kanatın Y eksenindeki dönüş açısı, her kanat eşit açıda dağılacak şekilde hesaplanır
  - `position[0]` — Kanatın X konumu, sabit 0.36
  - `position[1]` — Kanatın Y konumu, sabit 0
  - `position[2]` — Kanatın Z konumu, sabit 0
  - `boxGeometry.args[0]` — Kanat kutusunun X boyutu, sabit 0.02
  - `boxGeometry.args[1]` — Kanat kutusunun Y boyutu, sabit 0.58
  - `boxGeometry.args[2]` — Kanat kutusunun Z boyutu, sabit 0.1
  - `materials.galvanizedSteel` — Kanatlar için kullanılan paslanmaz çelik malzeme
- **Dönüş**: Tek bir rotor kanatı mesh JSX elemanı

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
- **Responsive:** (yok)
