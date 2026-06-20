---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\core\disposeSceneObject.ts
skeleton_hash: 20333ddc2f25a683
entity_hashes:
  func:disposeSceneObject: 09e4bce0d362eb1f
  func:isTexture: 5d5045b574da62d2
  overview: 7c948c72d891b333
generated_at: 2026-06-20T05:00:40Z
---

## Genel Bakış
Bu modül, Three.js tabanlı 3D sahnelerde nesne hiyerarşilerinin ve bağlı kaynakların (texture, geometri, malzeme) bellek yönetimini sağlar. Temel amacı, sahne temizleme işlemlerini merkezi olarak yöneterek olası bellek sızıntılarını önlemektir.

## Fonksiyon Grupları
### Kaynak Kontrol ve Doğrulama Fonksiyonları
Sahne nesnelerinin işlenmesi sırasında kaynakların türünü doğru bir şekilde belirlemeye yardımcı olan yardımcı kontrol fonksiyonları.
- isTexture

### Sahne Nesnesi İmha Fonksiyonları
Bir Object3D nesnesini ve tüm alt elemanlarını递归 olarak serbest bırakan ana temizlik fonksiyonu. İlgili texture, geometri ve malzeme kaynaklarını güvenli bir şekilde imha eder.
- disposeSceneObject

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Three.js sahne nesnelerinin (`Object3D`) bellek yönetimi ve temizleme işlemlerini gerçekleştirir.

**[Aksiyom 1]**: Eğer `disposeSceneObject` fonksiyonuna verilen `object` parametresi geçerli bir Three.js `Object3D` instance'ı değilse (örn. `null`, `undefined` veya farklı bir tipte bir nesne ise), fonksiyon hata verir veya beklenmeyen davranış gösterir.

**[Aksiyom 2]**: Eğer `isTexture` fonksiyonuna verilen `value` parametresi, Three.js `Texture` instance'ı ile karşılaştırılabilir bir yapıda değilse, fonksiyon `false` değeri döndürür.

**[Aksiyom 3]**: Eğer `disposeSceneObject` fonksiyonu成功 ile çalışırsa, verilen `object` ve ona bağlı tüm alt nesneler (child'lar), materyaller (materials) ve texture'lar bellekten serbest bırakılır; böylece WebGL kaynakları sızıntıya uğramaz.

---

## FONKSİYON DETAYLARI

### isTexture
**Ne yapar**: Verilen bir değerin, Three.js `Texture` nesnesi olup olmadığını belirleyen tür daraltma (type narrowing) fonksiyonudur. Fonksiyon true döndüğünde, TypeScript derleyicisi parametrenin `Texture` olduğunu bilir.

**Nasıl yapar**: Fonksiyon, gelen değerin nesne olup olmadığını kontrol eder. Ardından, nesnenin `isTexture` adlı bir özelliğinin `true` değerine sahip olup olmadığını ve bir `dispose` metodu içerip içermediğini doğrular. Bu kontroller, Three.js texture nesnelerinin belirgin özelliklerini hedef alarak güvenli bir tespit sağlar. Fonksiyonun dönüş tipi `value is Texture` olarak belirtilmiştir; bu, TypeScript'te bir tür koruma (type guard) işlevi görür.

**Parametreler**:
- value: unknown — Kontrol edilecek ham değer. Herhangi bir tipte olabilir.

**Dönüş**: `value is Texture` — Değer bir texture nesnesiyse `true`, değilse `false` döner. TypeScript'te bu tür, fonksiyonun çağrıldığı bağlamda parametrenin `Texture` olarak yeniden yazılmasını (narrows) sağlar.

### disposeSceneObject
**Ne yapar**: Three.js `Object3D` nesnesini (ve tüm alt nesnelerini) VRAM'den temizleyerek bellek sızıntılarını önleyen bir temizlik fonksiyonudur. R3F (React Three Fiber) gibideclaratif frameworksler otomatik temizlik yapsa da, `<primitive>` veya `useGLTF` gibi bileşenlerden elde edilen veya global cache'te tutulan nesneler için bu manuel temizlik zorunludur.

**Nasıl yapar**: Fonksiyon, verilen `object` üzerinde `traverse` metodunu kullanarak tüm alt ağaçta gezinir. Gezilen her `child` nesnesi bir `Mesh`_instance'ı ise; önce onun `geometry`'sini, sonra da `material`'ını (veya materyal dizisindeki her bir materyali) `dispose` ederek serbest bırakır. Her materyal serbest bırakılırken, materyalin tüm değerleri arasından `isTexture` fonksiyonu ile tespit edilen texture nesneleri de ayrıca `dispose` edilerek GPU belleğinden (VRAM) temizlenir. Bu işlem, sahne nesnelerinin tüm grafik kaynaklarını kapsamlı bir şekilde serbest bırakır.

**Parametreler**:
- object: Object3D — Temizlenecek olan 3D sahne nesnesi. Bu nesne ve tüm alt nesneleri işlenecektir.

**Dönüş**: void — Fonksiyon herhangi bir değer döndürmez; doğrudan nesne üzerinde temizlik işlemi gerçekleştirir.

---

## İTHALATLAR (IMPORTS)
- import: three::Mesh
- import: three::type { Object3D, Texture }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/core/disposeSceneObject.ts::isTexture
- **params**: (value: unknown)
- **ic_degiskenler**:
  - `value` — Kontrol edilecek nesne, bilinmeyen tipte bir değer olabilir
- **Dönüş**: value is Texture (tip koruyucu – value如果是Texture ise true, değilse false döner)

### [N2_NASIL] AST Pointer: src/components/products/3d/core/disposeSceneObject.ts::disposeSceneObject
- **params**: (object: Object3D)
- **ic_degiskenler**:
  - `child` — traverse() callback'inin parametresi, sahne grafiğindeki her bir çocuk nesneyi temsil eder
  - `materials` — child.material'ın dizi olup olmadığına göre normalize edilmiş materyal dizisi; dizi değilse tek elemanlı diziye sarılır
  - `material` — materials dizisi içindeki her bir materyal, döngü değişkeni
  - `value` — Object.values(material) ile elde edilen her bir materyal değeri, texture kontrolü için kullanılır
- **Dönüş**: void (yan etki: object ve tüm çocuklarının geometri, materyal ve texture'larını VRAM'den temizler)

---

## NODE ID STANDARD

  file: src\components\products\3d\core\disposeSceneObject.ts
  function: src\components\products\3d\core\disposeSceneObject.ts::isTexture
  function: src\components\products\3d\core\disposeSceneObject.ts::disposeSceneObject

---

## DISA AKTARILANLAR (EXPORTS)
  export: disposeSceneObject
  export: isTexture