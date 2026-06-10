---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DuctFanModel.tsx
skeleton_hash: 63ae5f6c33ecb1c7
entity_hashes:
  func:DuctFanModel: 461e0a9fd96af6bf
  func:RectangularDuctFanModel: c575246c49ae9f50
  overview: 2912870854893677
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:45:04Z
---

## Genel Bakış
Bu modül, HVAC sistemlerinde kullanılan kanal tipi fanları için 3D model ve bileşen tanımları içeren bir React modülüdür. Temel bir kanal fanı yapısını ve belirli bir dikdörtgen kanal fanı türü için özel bir bileşeni tanımlar; her iki bileşen de harici parametre almaz ve iç yapılandırma ile çalışır.

## Fonksiyon Grupları
### Model ve Yapı Tanımları
Havalandırma kanalı fanlarının temel veri yapısını ve genel 3D model bileşenini tanımlar.
- DuctFanModel

### Özelleşmiş Bileşen Tanımları
Belirli bir kanal fanı türü (örneğin dikdörtgen kesitli) için çalışacak, dışarıdan veri almayan özel bir React bileşeni oluşturur.
- RectangularDuctFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için belirtilen iki React bileşeni, dış parametre almadan çalışır. Mimari varsayımlar, bu bileşenlerin tutarlı 3D veri yapısına ve geometri oluşturmaya yönelik varsayılan değerlere olan bağımlılıklarını tanımlar.

**[Aksiyom 1]:** Eğer `DuctFanModel` bileşeninin dahili veri yapısı (örneğin, kanal kesiti, kanat tasarımı veya motor yerleşimi için gerekli alanlar) tutarsız veya eksikse, 3D model düzgün oluşturulamaz ve bileşen.render() hata verir veya görünmez olur.

**[Aksiyom 2]:** Eğer `RectangularDuctFanModel` bileşeni, temel `DuctFanModel` yapısal sözleşmesinden (örneğin, bir üst sınıftan türetilmiş olma veya belirli bir veri interface'ini uygulama) saparsa, dikdörtgen kanal fanı için beklenen geometrik şekil (dikdörtgen prizma) oluşturulamaz.

**[Aksiyom 3]:** Eğer 3D geometri oluşturma işleminde (muhtemelen bir Three.js veya benzeri kütüphane ile) kullanılan parametreler (örneğin, segment sayısı, yüzey detay seviyesi) modülün dahili sabitleri tarafından tanımlanmamışsa, performans veya görsellik kabul edilemez düzeyde düşebilir.

---

## FONKSİYON DETAYLARI

### DuctFanModel
**Ne yapar**: Bu fonksiyon, 3D bir kanal tipi (round duct) fan modelini oluşturur ve sahneye yerleştirir. Fanın ana gövdesini, montaj ayağını, elektrik klemens kutusunu ve sürekli dönen pervane kanatlarını temsil eden geometrik şekilleri bir araya getirerek gerçekçi bir HVAC bileşeni görseli sunar.

**Nasıl yapar**: Three.js kütüphanesi ile oluşturulan React Three Fiber bileşenidir. useRef hook'u ile pervane grubuna referans alarak useFrame içinde her render döngüsünde bu referansın rotation.y değerini delta zamanı ile artırarak pervaneyi sürekli döndürür. useFanMaterials() özel hook'undan merkezi malzemeleri (galvanizedSteel vb.) çeker. useMemo ile sadece bir kez oluşturulan kırmızı metalik bir bıçak malzemesi tanımlar. Tüm model, scale ve rotation değerleri ayarlanmış bir `<group>` içinde, birbirine bağlı silindir ve kutu geometrileriyle inşa edilir.

**Parametreler**:
- Fonksiyonun herhangi bir parametresi yoktur. Bu, props almayan bir React fonksiyonel bileşenidir.

**Dönüş**: `JSX.Element` (veya React bileşeni dönüş tipi). Fonksiyon, tanımlanan 3D geometrileri ve malzemeleri içeren bir React Three Fiber JSX ağacını return eder. TypeScript tanımlamasında dönüş tipi açıkça belirtilmemiştir, ancak uygulama içinde bir React bileşeni olarak kullanılır.

### RectangularDuctFanModel
**Ne yapar**: Bu fonksiyon, dikdörtgen kanal fanı modelini gösteren bir React fonksiyonel bileşenidir. Tasarımcılar ve mühendisler tarafından fanın截面 görünümünü incelemek için kullanılır.  
**Nasıl yapar**: `React.FC` tipini uygulayarak props alabilir ve bu props üzerinden genişlik, yükseklik, malzeme gibi özellikleri alarak dinamik JSX üretir; props tanımlanmadığı sürece varsayılan değerlerle çalışır.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünden bir fonksiyon döndürür; bu, JSX elementi döndüren bir fonksiyon anlamına gelir ve React tarafından doğrudan render edilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DuctFanModel.tsx::DuctFanModel
- **params**: parametre yok
- **ic_degiskenler**:
  - `fanRef` — useRef ile oluşturulmuş bir Group referansı, pervane grubunu referans almak için kullanılır; useFrame içinde fanRef.current.rotation.y güncellenerek pervane döndürülür.
  - `materials` — useFanMaterials() hook'undan dönen malzeme nesnesi, fanın farklı kısımları için malzemeler (galvanizedSteel vb.) içerir.
  - `localBladeColor` — useMemo ile oluşturulmuş yerel bir MeshStandardMaterial, pervane rengini (#be123c kırmızı) belirler; metalness 0.6, roughness 0.4 değerlerine sahiptir.
  - `state` — useFrame hook'unun sağladığı state, şu anda kullanılmıyor (sadece delta kullanılıyor).
  - `delta` — son kare ile bu kare arasındaki zaman farkı, pervane dönüş hızını belirlemek için kullanılır.
  - `z` — [-0.2, 0.2] array'inin map callback'indeki eleman, taşıyıcı ayağın Z eksenindeki pozisyonunu belirler.
  - `i` — [-0.2, 0.2] array'inin map callback'indeki index, benzersiz key için kullanılır.
  - `rot` — [0, 45, 90, 135, 180, 225, 270, 315] array'inin map callback'indeki eleman (derece cinsinden), pervane kanadının döndürüleceği açıyı belirler.
  - `i` — [0, 45, 90, 135, 180, 225, 270, 315] array'inin map callback'indeki index, benzersiz key için kullanılır.
- **Dönüş**: React JSX elementi, 3D yuvarlak kanal fanı modelini temsil eden group elementleri ve mesh'ler; ana gövde, taşıyıcı ayak, klemens kutusu ve dönen pervane içerir.

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DuctFanModel.tsx::RectangularDuctFanModel
- **params**: parametre yok
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hook'undan dönen malzeme nesnesi, farklı malzemeler (galvanizedSteel, industrialSteel, matteBlack, brushedAluminum) içerir.
  - `x` — [-0.5, 0.5] array'inin map callback'indeki eleman, yan panellerin X eksenindeki pozisyonunu belirler.
  - `i` — [-0.5, 0.5] array'inin map callback'indeki index, benzersiz key için kullanılır.
- **Dönüş**: React JSX elementi, dikdörtgen kanal fanı modelini temsil eden group elementleri ve mesh'ler; ana gövde, yan paneller, klemens kutusu ve dönen pervane mili içerir.

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DuctFanModel.tsx
  function: src\components\products\3d\types\DuctFanModel.tsx::DuctFanModel
  function: src\components\products\3d\types\DuctFanModel.tsx::RectangularDuctFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DuctFanModel
  export: RectangularDuctFanModel

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