---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\3d\core\disposeSceneObject.ts
skeleton_hash: effdd69655ea8ad1
entity_hashes:
  func:disposeSceneObject: 09e4bce0d362eb1f
  func:isTexture: 5d5045b574da62d2
  overview: 7c948c72d891b333
generated_at: 2026-08-25T07:26:11Z
---

## Genel Bakış
Bu modül, Three.js tabanlı 3D sahne nesnelerinin ve bunlara bağlı kaynakların (texture, geometri, materyal vb.) bellekten düzgün şekilde serbest bırakılmasını sağlar. Sahne temizleme işlemleri sırasında kullanılan yardımcı kontrol fonksiyonlarını ve ana temizleme mantığını içerir.

## Fonksiyon Grupları

### Yardımcı Kontrol Fonksiyonları
Verilen bir değerin texture olup olmadığını tespit ederek temizleme sırasında doğru işlem yapılmasını sağlar.
- isTexture

### Kaynak Temizleme Fonksiyonları
Verilen bir 3D nesneyi ve bu nesneye bağlı tüm alt nesneleri, materyalleri, geometrileri ve texture'ları bellekten serbest bırakır.
- disposeSceneObject

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### isTexture
**Ne yapar**: Verilen bilinmeyen tipdeki değerin Three.js Texture nesnesi olup olmadığını denetler. TypeScript type guard fonksiyonu olarak çalışır; bu fonksiyonun true döndürdüğü durumlarda TypeScript, parametre olan `value` değişkenini `Texture` tipiyle daraltır (type narrowing).

**Nasıl yapar**: Dört koşulu AND operatörüyle birleştirerek kontrol eder. İlk olarak değerin bir nesne olup olmadığına (`typeof value === 'object'`), ardından null olmadığına bakar. Sonrasında değerin `isTexture` özelliğinin `true` olup olmadığını kontrol eder — bu, Three.js Texture nesnelerinin standart bir özellik bayrağıdır. Son olarak değerin `dispose` adında bir fonksiyon tipinde özelliğe sahip olup olmadığını denetler. Dört koşulun tamamı sağlandığında true döner, aksi halde false döner.

**Parametreler**:
- value: unknown — Texture olup olmadığı denetlenecek bilinmeyen türde değer

**Dönüş**: value is Texture — TypeScript type guard dönüşü. Fonksiyon true döndüğünde çağrılan kapsamda `value` parametresi `Texture` tipi olarak güvenle kullanılabilir hale gelir.

### disposeSceneObject
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: three::Mesh
- import: three::type { Object3D, Texture }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/core/disposeSceneObject.ts::isTexture
- **params**: `value: unknown`
- **ic_degiskenler**:
  - `value` — kontrol edilen nesne; `typeof` ile object olup olmadığı, null olup olmadığı, `isTexture` özelliğinin `true` olup olmadığı ve `dispose` özelliğinin function olup olmadığı kontrol edilir
- **Dönüş**: `boolean` (TypeScript type guard — `value is Texture`)

### [N2_NASIL] AST Pointer: src/components/products/3d/core/disposeSceneObject.ts::disposeSceneObject
- **params**: `object: Object3D`
- **ic_degiskenler**:
  - `object` — sahne nesnesi; `traverse` metodu ile tüm alt nesneleri dolaşmak için kullanılır
  - `child` — `traverse` callback parametresi; her alt nesneyi temsil eder, `instanceof Mesh` ile kontrol edilir
  - `materials` — `child.material` dizisi ise kendisi, tek materyal ise tek elemanlı diziye dönüştürülmüş hali
  - `material` — `materials` dizisi üzerindeki for-of döngüsü değişkeni; her materyali temsil eder, null kontrolü yapılır ve `dispose()` ile temizlenir
  - `value` — `Object.values(material)` ile elde edilen materyal özelliklerinin her biri; `isTexture` ile texture olup olmadığı kontrol edilir, texture ise `dispose()` ile VRAM'den temizlenir
- **Dönüş**: `void`

---

## NODE ID STANDARD

  file: disposeSceneObject.ts
  function: disposeSceneObject.ts::isTexture
  function: disposeSceneObject.ts::disposeSceneObject

---

## DISA AKTARILANLAR (EXPORTS)
  export: disposeSceneObject
  export: isTexture