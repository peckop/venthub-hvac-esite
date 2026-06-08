---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx
skeleton_hash: 89abb80d68fa0a96
entity_hashes:
  func:FlexibleCable: 7422952d69466487
  func:JetFanModel: b12c8fa3c1846be6
  overview: 8a7cf9e540eb1306
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformu için geliştirilen, jet fan tipi ekipmanın React tabanlı 3D modelini ve bu modelin içinde yer alan yardımcı bileşenleri barındırır. Modülün temel amacı, ürünün 3B sahnede gerçekçi ve etkileşimli bir şekilde görselleştirilmesini sağlamaktır.

## Fonksiyon Grupları
### Ana 3B Model Bileşeni
Modülün dışarıya açılan temel bileşenini oluşturur; jet fanın ana 3B geometrisini ve görünümünü tanımlar.
- JetFanModel

### Yardımcı Alt Bileşenler
Ana modelin yapısında yer alan, belirli bir parça veya özellik için kullanıma özel, yeniden kullanılabilir görsel bileşenleri içerir.
- FlexibleCable

---

## AXIOMS – Mimari Varsayımlar

Bu modül, jet fan tipi HVAC ekipmanının 3D görselleştirme bileşenlerini içerir.

**[Aksiyom 1 - Materials Zorunluluğu]:** `FlexibleCable` bileşeni çağrılmak için `materials` parametresi `FanMaterials` tipinde sağlanmalıdır. Eğer `FanMaterials` tipinde `materials` parametresi sağlanmazsa, bileşen derleme zamanında tip hatası verir veya render sırasında çalışmayı durdurur.

**[Aksiyom 2 - FanMaterials Tip Bağımlılığı]:** `FanMaterials` tipi bu modül dışında tanımlı olmalıdır. Eğer `FanMaterials` tipi tanımsız veya ithal edilemez (import edilemez) olursa, `FlexibleCable` bileşeninin imzası compile edilemez ve modül kullanılamaz hale gelir.

**[Aksiyom 3 - JetFanModel Veri Bağımlılığı]:** `JetFanModel` bileşeni parameterez olarak hiçbir veri almaz. Eğer `JetFanModel`'in render işlemi için gerekli veriler (malzeme, geometri, konum vb.) React context veya üst bileşen prop'ları aracılığıyla sağlanmazsa, bileşen boş veya hatalı render edilir.

**[Aksiyom 4 - Bileşen İlişkisi Varsayımı]:** `JetFanModel` ana bileşen olarak, `FlexibleC供` gibi alt bileşenleri kendi içinde barındırabilir. Eğer `JetFanModel` içinde `FlexibleCable` kullanılacaksa, `materials` prop'u `JetFanModel`'e gelen veriden türetilerek sağlanmalıdır; aksi halde alt bileşen hata verir.

---

## FONKSİYON DETAYLARI

### JetFanModel
**Ne yapar**: VentHub HVAC projesinin ürünler bölümündeki 3B görselleştirme katmanında kullanılmak üzere jet fan tipi HVAC ekipmanlarının 3 boyutlu React bileşenini tanımlar. Söz konusu jet fanların kullanıcı arayüzünde 3B sahada gösterilmesini sağlayan temel işlevsel bileşendir.
**Nasıl yapar**: React fonksiyonel bileşeni standardında tanımlanır, proje içindeki tiplendirme kurallarına uygun olarak jet fan 3B modelinin tüm yapılandırma, konumlandırma ve temel etkileşim mantığını barındırır. Kaynak kodunun bulunduğu JetFanModel.tsx tip tanım dosyasında proje genelinde kullanılan tiplerle uyumlu çalışacak şekilde yapılandırılır.
**Parametreler**: Bu fonksiyona ait tanımlanmış herhangi bir giriş parametresi bulunmamaktadır.
**Dönüş**: React.FC tipi döndürür, yani React ekosistemi tarafından işlenip kullanılabilecek bir React fonksiyonel bileşeni döndürür. Bu bileşen 3B sahaya yerleştirilerek kullanıcıya gösterilebilir.

### FlexibleCable
**Ne yapar**: Jet fan modellerine bağlı esnek bağlantı kablolarının 3B görselleştirmesini oluşturan yardımcı React bileşenidir. Jet fanların elektrik veya mekanik bağlantılarını temsil eden kabloların 3B sahada doğru şekilde gösterilmesini sağlar.
**Nasıl yapar**: Kendisine iletilen malzeme verilerine göre kablonun 3B modelindeki görünüm, renk, doku ve diğer görsel özelliklerini yapılandırır. Kablonun bağlı olduğu iki bağlantı noktası arasında otomatik olarak konumlanmasını sağlayarak 3B sahadaki bütünlüğü korur.
**Parametreler**:
- name: materials, type: FanMaterials — 3B kablo modelinde kullanılacak tüm malzeme özelliklerini içeren FanMaterials tipinde nesnedir. Kablonun renk, doku, şeffaflık gibi görsel ayarlarını belirlemek için kullanılır.
**Dönüş**: Tanımda açık bir dönüş tipi belirtilmemiştir, React bileşeni standartlarına uygun olarak JSX formatında 3B sahada işlenecek görsel öğeleri döndürmesi beklenir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/products/3d/types/JetFanModel.tsx`::JetFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen FanMaterials nesnesi; tüm 3D mesh'lerin renk ve yüzey malzemelerini (jetOrange, greyBox, matteBlack, cableGrey, brushedAluminum) sağlar
  - `fanRef` — `useRef<THREE.Group>(null)` ile oluşturulan React ref nesnesi; iç pervane rotorunu referans alarak useFrame içinde döndürmek için kullanılır
- **useFrame callback ic degiskenler**:
  - `state` — `@react-three/fiber` tarafından sağlanan frame state nesnesi (bu fonksiyonda kullanılmıyor, sadece imza gereği mevcut)
  - `delta` — iki frame arasındaki zaman farkı (saniye); `fanRef.current.rotation.y -= delta * 25` ifadesinde pervane hızı için kullanılır
- **Dönüş**: JSX — `<group>` içinde 3D jet fan modeli (ana silindirik gövde, elektrik kutusu, kablo girişi, montaj ayakları, iç pervane rotoru)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\JetFanModel.tsx
  function: src\components\products\3d\types\JetFanModel.tsx::JetFanModel
  function: src\components\products\3d\types\JetFanModel.tsx::FlexibleCable

---

## DISA AKTARILANLAR (EXPORTS)
  export: FlexibleCable
  export: JetFanModel

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