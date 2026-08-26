---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\3d\types\FlexibleDuctModel.tsx
skeleton_hash: be3af2fd6b58aab1
entity_hashes:
  func:FlexibleDuctModel: 3bca0ec1b35809a5
  func:updateWaveCurve: 6edc25976d31416d
  overview: 7399efaa6127c9e1
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:27:07Z
---

## Genel Bakış
Bu modül, 3B esnek kanal modelini temsil eden bir React bileşeni ve bu modele ait dalga eğrisini güncelleyen bir yardımcı fonksiyon içerir. Bileşen, modelin görsel sunumunu sağlarken, yardımcı fonksiyon animasyon veya dinamik güncellemeler için hesaplama işlemlerini gerçekleştirir.

## Fonksiyon Grupları
### Bileşen
Esnek kanal modelinin 3B görünümünü render eden ana bileşendir.
- FlexibleDuctModel

### Yardımcı Fonksiyonlar
Dalga eğrisinin zaman ve nokta havuzuna göre güncellenmesini sağlayan hesaplama fonksiyonlarını içerir.
- updateWaveCurve

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan çıkarılabilecek sınırlı varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `updateWaveCurve` fonksiyonuna `pointsPool` parametresi verilmezse, fonksiyonun davranışı bilinmiyor (gövde mevcut değil).

[Aksiyom 2]: Eğer `updateWaveCurve` fonksiyonuna `waveTime` parametresi verilmezse, fonksiyonun davranışı bilinmiyor (gövde mevcut değil).

[Aksiyom 3]: Eğer `pointsPool` dizisi boş bir dizi olarak verilirse, fonksiyonun nasıl bir sonuç üreteceği bilinmiyor (gövde mevcut değil).

[Aksiyom 4]: `FlexibleDuctModel` fonksiyonu parametre almaz; eğer bağımlı olduğu harici durum (state, context, store) mevcut değilse, bileşenin nasıl render edeceği bilinmiyor (gövde mevcut değil).

---

**Not:** Fonksiyon gövdeleri sağlanmadığından, bu modülün çalışması için gerekli kesin koşullar (eşik değerleri, null kontrolü, hata senaryoları vb.) belirlenememektedir. Daha doğru aksiyomlar için kaynak kodun gövde içeriklerinin sağlanması gerekmektedir.

---

## FONKSİYON DETAYLARI

### updateWaveCurve
**Ne yapar**: Animasyonlu dalga eğrisi noktalarını yerinde günceller. Verilen zaman parametresine bağlı olarak sinüs dalgası formunda 31 adet noktayı (0'dan 30'a kadar indeks) hesaplar ve bu noktaları doğrudan `pointsPool` dizisi üzerindeki `Vector3` nesnelerine yazar. Her çağrıda mevcut noktaların üzerine yazar; yeni dizi oluşturmaz.

**Nasıl yapar**: 30 segmentlik bir eğri üzerinde döngü kurar. Her segment için `t` değeri 0 ile 1 arasında normalize edilir. X ekseni `(t - 0.5) * 2.4` formülüyle -1.2 ile +1.2 arasında konumlandırılır. Dalga fazı `t * Math.PI * 2 - waveTime` ile hesaplanır; `waveTime` arttıkça dalga kayar (animasyon etkisi). Dalga genliği `Math.sin(t * Math.PI) * 0.3` ile hesaplanır; bu sayede eğrinin ortasında genlik maksimumken uçlarda sıfıra yaklaşır. Y ekseni bu genlik ile sinüs fazının çarpımıdır. Z ekseni her zaman 0'dır.

**Parametreler**:
- `waveTime: number` — Dalga animasyonunun zaman fazını belirler. Her karede artırılarak dalga kaydırma hareketi sağlanır.
- `pointsPool: Vector3[]` — Güncellenecek nokta havuzu. En az 31 eleman içermesi beklenir. Her elemanın `set()` metodu çağrılarak x, y, z değerleri atanır.

**Dönüş**: Belirtilmemiş. Fonksiyon gövdesinde `return` ifadesi yoktur; yan etkiyle çalışır (parametre olarak verilen `pointsPool` dizisini yerinde değiştirir).

### FlexibleDuctModel
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::CatmullRomCurve3
- import: three::Quaternion
- import: three::TorusGeometry
- import: three::TubeGeometry
- import: three::Vector3
- import: three::type { Group, Mesh }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::updateWaveCurve
- **params**: `waveTime: number`, `pointsPool: Vector3[]`
- **ic_degiskenler**:
  - `segments` — dalga eğrisinin kaç parçaya bölüneceğini belirten sabit değer (30)
  - `i` — döngü sayacı, 0'dan segments'e kadar iterasyon
  - `t` — normalize edilmiş parametre (`i / segments`), 0 ile 1 arasında değer alır
  - `x` — noktanın x koordinatı (`(t - 0.5) * 2.4`), -1.2 ile 1.2 aralığında
  - `wavePhase` — dalga fazı (`t * Math.PI * 2 - waveTime`), zamanla kayan sinüs fazı
  - `waveAmplitude` — dalga genliği (`Math.sin(t * Math.PI) * 0.3`), uçlarda sıfır ortada maksimum
  - `y` — noktanın y koordinatı (`Math.sin(wavePhase) * waveAmplitude`), dalga yüksekliği
- **Dönüş**: yok (void) — `pointsPool` dizisindeki Vector3 nesnelerini yerinde (in-place) günceller

### [N2_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::FlexibleDuctModel
- **params**: yok (React bileşeni, props almaz)
- **ic_degiskenler**:
  - `brushedAluminum` — `useResolveMaterials()` dönüşünden destructure edilen materyal, ana kanal gövdesinin materyali
  - `castBladeMat` — `useResolveMaterials()` dönüşünden destructure edilen materyal, spiral halkaların materyali
  - `meshRef` — `useRef<Mesh>(null)`, ana kanal mesh'ine referans, geometri mutasyonu için kullanılır
  - `spiralRef` — `useRef<Group>(null)`, spiral halkaları içeren group elementine referans
  - `timeRef` — `useRef(0)`, kümülatif zaman takibi, her frame'de `delta * 2` kadar artar
  - `pool` — `useMemo` ile oluşturulan nesne havuzu, bellek tahsislerini önlemek için kullanılır:
    - `pool.points` — 31 adet `Vector3`'ten oluşan dizi, eğri noktalarını tutar
    - `pool.curve` — `CatmullRomCurve3` eğri nesnesi, `pool.points` üzerinden oluşturulur
    - `pool.point` — geçici `Vector3`, `getPoint` çağrılarında hedef olarak kullanılır
    - `pool.tangent` — geçici `Vector3`, `getTangent` çağrılarında hedef olarak kullanılır
    - `pool.quaternion` — geçici `Quaternion`, spiral halka rotasyonları için kullanılır
    - `pool.up` — `Vector3(0, 0, 1)`, yukarı vektörü, `setFromUnitVectors` referansı
  - `initialTubeGeo` — `useMemo` ile oluşturulan `TubeGeometry`, başlangıç tüp geometrisi (64 segment, 0.28 yarıçap, 24 radial segment, açık değil)
  - `torusGeo` — `useMemo` ile oluşturulan `TorusGeometry`, spiral halka geometrisi (0.29 ana yarıçap, 0.018 tüp yarıçapı, 8 tubular segment, 24 radial segment)
  - `spiralCount` — spiral halka sayısı sabiti (20)
- **Dönüş**: JSX — `<group scale={[1.2, 1.2, 1.2]}>` içinde ana kanal mesh'i ve spiral halkaları içeren group döndürür

### [N3_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::pool useMemo callback
- **params**: yok
- **ic_degiskenler**:
  - `pointsArray` — boş `Vector3[]` dizisi, döngüde 31 adet `new Vector3()` ile doldurulur
  - `i` — döngü sayacı, 0'dan 30'a kadar iterasyon
- **Dönüş**: `{ points: Vector3[], curve: CatmullRomCurve3, point: Vector3, tangent: Vector3, quaternion: Quaternion, up: Vector3 }` — nesne havuzu

### [N4_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::initialTubeGeo useMemo callback
- **params**: yok
- **ic_degiskenler**: yok (dışarıdaki `pool` değişkenine erişir)
- **Dönüş**: `TubeGeometry` — `updateWaveCurve(0, pool.points)` çağrısıyla eğri noktaları sıfır zamanda hesaplanır, ardından `new TubeGeometry(pool.curve, 64, 0.28, 24, false)` ile tüp geometrisi oluşturulur

### [N5_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::torusGeo useMemo callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `TorusGeometry` — `new TorusGeometry(0.29, 0.018, 8, 24)` ile spiral halka geometrisi

### [N6_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::useEffect cleanup factory
- **params**: yok
- **ic_degiskenler**: yok (dışarıdaki `initialTubeGeo` ve `torusGeo` değişkenlerine erişir)
- **Dönüş**: cleanup fonksiyonu — `initialTubeGeo.dispose()` ve `torusGeo.dispose()` çağırarak GPU kaynaklarını serbest bırakır

### [N7_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::useFrame callback
- **params**: `_` (üçüncü taraf kamera/state, kullanılmıyor), `delta` (frame'ler arası geçen süre saniye)
- **ic_degiskenler**:
  - `geom` — `meshRef.current.geometry`, tüp geometrisi referansı, vertex pozisyonları buradan okunur/yazılır
  - `pos` — `geom.attributes.position`, geometrinin pozisyon buffer attribute'u
  - `posArray` — `pos.array as Float32Array`, ham vertex pozisyon verisi, doğrudan mutasyona uğratılır
  - `i` — outer döngü sayacı (0-64), tüpün uzunlamasına segmentlerini iterasyonlar
  - `u` — normalize edilmiş eğri parametresi (`i / 64`), 0 ile 1 arasında
  - `bx` — teğet vektörünün y bileşeni (`pool.tangent.y`), ikinci taban vektörü hesabında kullanılır
  - `by` — teğet vektörünün x bileşeninin negatifi (`-pool.tangent.x`), ikinci taban vektörü hesabında kullanılır
  - `bl` — ikinci taban vektörünün uzunluğu (`Math.hypot(bx, by) || 1`), normalize etmek için
  - `e2x` — normalize edilmiş ikinci taban vektörünün x bileşeni (`bx / bl`)
  - `e2y` — normalize edilmiş ikinci taban vektörünün y bileşeni (`by / bl`)
  - `j` — inner döngü sayacı (0-24), tüpün çevresel segmentlerini iterasyonlar
  - `v` — açı parametresi (`j / 24 * Math.PI * 2`), 0'dan 2π'ye
  - `c` — negatif kosinüs (`-Math.cos(v)`), three.js TubeGeometry convention'ı
  - `s` — sinüs (`Math.sin(v)`)
  - `idx` — vertex dizisi içindeki başlangıç indeksi (`(i * 25 + j) * 3`), her vertex 3 float (x,y,z)
  - `spiralCount` — `spiralRef.current.children.length`, spiral halka sayısı
  - `t` — spiral halka için normalize eğri parametresi (`i / (spiralCount - 1)`)
  - `child` — `spiralRef.current.children[i]`, tek bir spiral halka mesh'i, pozisyon ve rotasyonu güncellenir
- **Dönüş**: yok (void) — her frame'de tüp geometrisinin vertex pozisyonlarını ve spiral halkaların transformlarını günceller; yan etkiler: `pos.needsUpdate = true`, `geom.computeVertexNormals()`, `geom.computeBoundingBox()`, `geom.computeBoundingSphere()`

### [N8_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::Array.map callback
- **params**: `_` (dizinin elemanı, kullanılmıyor), `i` (indeks)
- **ic_degiskenler**: yok (dışarıdaki `torusGeo` ve `castBladeMat` değişkenlerine erişir)
- **Dönüş**: JSX — `<mesh key={i} geometry={torusGeo} material={castBladeMat} />` elementi

---

## NODE ID STANDARD

  file: FlexibleDuctModel.tsx
  function: FlexibleDuctModel.tsx::updateWaveCurve
  function: FlexibleDuctModel.tsx::FlexibleDuctModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: FlexibleDuctModel
  export: updateWaveCurve

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