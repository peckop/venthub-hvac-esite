---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx
skeleton_hash: 8c0363a870125911
entity_hashes:
  func:RoundDuctFanModel: d2c6b37b5aca3633
  overview: 5cccf555702118a3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:49:22Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında yer alır. Yuvarlak kanal fanı tipi için özel olarak tasarlanmış, projede HVAC ürünlerinin üç boyutlu olarak sunulmasını sağlayan bir React bileşenini içerir. Bileşen, fan modelinin geometrisini oluşturarak kullanıcıya ekranda 3D olarak gösterir.

## Fonksiyon Grupları
### Yuvarlak Kanal Fanı 3D Model Bileşeni
Modülün tek ve temel sorumluluğu olan yuvarlak kanal fanının 3D modelini oluşturan ve render eden React bileşenini barındırır. Bu bileşen, ürünün 3D ürün katmanı içindeki bu spesifik fan tipi için ayrılmış görselleştirme görevini yerine getirir.
- RoundDuctFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari fonksiyon gövdesinden çıkarılabilir özel aksiyom tanımlanamamıştır. Fonksiyon imzası parametresizdir (`RoundDuctFanModel()`) ve modül sabitleri tanımlı değildir.

---

## FONKSİYON DETAYLARI

### RoundDuctFanModel
**Ne yapar**: VentHub HVAC projesinin ürün kategorisindeki yuvarlak kanallı fanların 3 boyutlu görselleştirmesini sağlamak amacıyla geliştirilmiş temel React bileşenidir. Proje içerisinde HVAC sistemleri bileşenlerinin 3D olarak kullanıcı arayüzünde sunulması sürecinde, sadece yuvarlak kanal fanı modelini render etmek için özel olarak tasarlanmıştır.
**Nasıl yapar**: Projenin src/components/products/3d/types dizininde tanımlanan bu fonksiyon, React ekosisteminin standart fonksiyonel bileşen standartlarına uygun olarak yapılandırılmıştır. Çağrıldığında projenin kullandığı 3D render altyapısıyla entegre çalışabilecek, fan modelini kullanıcı ekranına çizebilecek nitelikte bir React bileşeni oluşturur ve kullanıma sunar.
**Parametreler**:
- Bu ana fonksiyonun tanımında belirtilen herhangi bir giriş parametresi bulunmamaktadır. Fonksiyon kendisine ait herhangi bir parametre almaksızın çalışır.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, projenin ilgili ürün sayfalarında veya diğer üst bileşenlerinde çağrılarak yuvarlak kanal fanının 3 boyutlu modelini kullanıcı arayüzünde başarıyla render etme görevini yerine getirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx::RoundDuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'u tarafından sağlanan materyal nesnesi; JSX'te `materials.ral7035`, `materials.matteBlack`, `materials.fanRed` olarak 3D objelere atanır.
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan React ref'i; iç pervane grubuna (`<group ref={fanRef}>`) bağlanarak `useFrame` içinde döndürülmesi için referans tutar.
- **Dönüş**: JSX (`<group>` elementi, 3D fan modelinin tüm geometrisini ve yapısını döndürür)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx::useFrameCallback
- **params**: `(state, delta)`
  - `state` — Three.js frame state nesnesi, fonksiyon içinde kullanılmaz.
  - `delta` — Son kareden bu yana geçen süre (saniye); `fanRef.current.rotation.z` güncellenirken hız çarpanı olarak kullanılır.
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `fanRef.current.rotation.z` değerini `delta * 15` kadar azaltarak pervaneyi döndürür)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx::mapCallback
- **params**: `(_, i)`
  - `_` — Dizinin mevcut elemanı (kullanılmaz).
  - `i` — Dizideki indeks; 9 bıçağın açısal pozisyonunu hesaplamak için `(i / 9) * Math.PI * 2` formülünde kullanılır.
- **ic_degiskenler**: (yok)
- **Dönüş**: `<mesh>` JSX elementi (her bir pervane bıçağı geometrisini döndürür)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\RoundDuctFanModel.tsx
  function: src\components\products\3d\types\RoundDuctFanModel.tsx::RoundDuctFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: RoundDuctFanModel

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