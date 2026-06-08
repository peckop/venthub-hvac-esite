---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\AxialFanModel.tsx
skeleton_hash: d2f953275e03b370
entity_hashes:
  func:AxialFanModel: cc382cf8a620825d
  overview: 9af3beb0b9e91054
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, eksenli fan için 3D modelleme yapan bir React bileşenini tanımlar. Temel fan geometrisini ve isteğe bağlı susturucu (silencer) eklemesini yöneterek, verilen parametrelere göre 3B sahneyi render eder.

## Fonksiyon Grupları
### 3B Fan Modeli Oluşturma
Bileşen, eksenli fanın temel yapısını ve opsiyonel susturucu uzantısını oluşturarak 3B sahneye yerleştirir.
- AxialFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi erişilebilir olmadığından, yalnızca fonksiyon imzasından türetilebilecek temel tip ve değer aralığı varsayımları tanımlanmıştır.

[Aksiyom 1]: Eğer `hasSilencer` boolean değilse (örn. undefined, null veya farklı bir tip gelirse), React bileşeninin beklenmeyen davranış göstermesi veya hata fırlatması olur.
[Aksiyom 2]: Eğer `silencerRadius` sayısal bir değer (Number) değilse veya negatif/sıfır gelirse, 3D geometri oluşturma sırasında hatalı model üretimi veya render hatası olur.
[Aksiyom 3]: Eğer `silencerLength` sayısal bir değer (Number) değilse veya negatif gelirse, 3D geometri oluşturma sırasında hatalı model üretimi veya render hatası olur.
[Aksiyom 4]: Eğer `hasSilencer` `true` olarak ayarlandığında `silencerRadius` veya `silencerLength` anlamsız (NaN, Infinity) değerler alırsa, susturucu geometrisinin boyutları hesaplanamaz ve 3D sahnedeki model bozuk render edilir.
[Aksiyom 5]: Eğer `silencerLength` default değeri tam olarak tanımlanmamışsa (fonksiyon imzasında "0." olarak kesilmiş görünüyor), bileşen bu parametre için geçerli bir sayısal default bekler; aksi halde susturucu uzunluğu `undefined` kalır ve geometri hesaplaması hatalı sonuç üretir.

---

## FONKSİYON DETAYLARI

### AxialFanModel
**Ne yapar**: AxialFanModel bileşenini render eder, gelen `hasSilencer`, `silencerRadius` ve `silencerLength` özelliklerine göre modelin yapılandırmasını yapar.  
**Nasıl yapar**: Fonksiyon, props nesnesinden `hasSilencer`, `silencerRadius` ve `silencerLength` değerlerini destructuring alır; belirtilmemişse varsayılan değerler (`false`, `0.58`, `0`) kullanılır. Daha sonra bu değerlere dayalı olarak silencerin eklenip eklenmeyeceği ve boyutları belirlenerek ilgili JSX/3D model çıktısı üretilir.  
**Parametreler**:
- hasSilencer: boolean — Silencerin modelde bulunup bulunmayacağını kontrol eder; true ise silencer eklenir.
- silencerRadius: number — Silencerin yarıçapını metre cinsinden tanımlar; varsayılan değer 0.58.
- silencerLength: number — Silencerin uzunluğunu metre cinsinden tanımlar; varsayılan değer 0.  
**Dönüş**: Dönüş tipi kaynak kodunda belirtilmemiştir; belirsiz (void veya JSX olabilir).

---

## INTERFACES

### AxialFanModelProps
- `hasSilencer?: boolean`
- `silencerRadius?: number`
- `silencerLength?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AxialFanModel.tsx::AxialFanModel
- **params**:
  - `hasSilencer` — susturucu eklenip eklenmediğini belirler (varsayılan: `false`)
  - `silencerRadius` — susturucu yarıçapı (varsayılan: `0.58`)
  - `silencerLength` — susturucu uzunluğu (varsayılan: `0.7`)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen materyal nesnesi; içinde `glossyBlack`, `bladeBlack`, `logoRed`, `matteBlack` barındırır, tüm 3D mesh'lerin malzemelerini sağlar
  - `fanRef` — `useRef<THREE.Group>` ile oluşturulan referans; `useFrame` callback'i içinde pervane grubunun `rotation.z` değerini değiştirerek pervaneyi döndürmek için kullanılır
  - `bladeGeometry` — `useMemo` ile oluşturulmuş orak-tipi kanat geometrisi (`THREE.ExtrudeGeometry`); 7 adet siyah kanat için ortak geometri, bağımlılık dizisi boş `[]` olduğundan yalnızca ilk render'da hesaplanır
- **Dönüş**: JSX — 3B sahne ağacı (group, mesh, geometri ve malzemelerden oluşan React element ağacı); susturucu, silindirik kovan, flanşlar, pervane grubu (7 kanat, motor, marka logosu), tel kafes ve klemens kutusunu render eder

---

## NODE ID STANDARD

  file: src\components\products\3d\types\AxialFanModel.tsx
  function: src\components\products\3d\types\AxialFanModel.tsx::AxialFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: AxialFanModel

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