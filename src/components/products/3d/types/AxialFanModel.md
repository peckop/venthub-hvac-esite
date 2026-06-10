---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\AxialFanModel.tsx
skeleton_hash: e8650f2aab7838d3
entity_hashes:
  func:AxialFanModel: 8551c3a6d8fbc329
  overview: 8d8849829616f430
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:42:36Z
---

## Genel Bakış
Bu modül, eksenli fanların 3D görselleştirilmesini sağlayan bir React bileşenini tanımlar. Verilen parametrelere göre fan geometrisini ve isteğe bağlı susturucu uzantısını oluşturarak Three.js sahnesine yerleştirir.

## Fonksiyon Grupları
### 3B Eksenli Fan Modelleme
Bileşen, eksenli fanın temel yapısını ve opsiyonel susturucu bileşenini oluşturarak 3D sahneye render eder.
- AxialFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi erişilebilir olmadığından, yalnızca fonksiyon imzasından türetilebilecek temel tip ve değer aralığı varsayımları tanımlanmıştır.

[Aksiyom 1]: Eğer `hasSilencer` boolean tipinde değilse (örn. undefined veya string geçilirse), bileşen beklenmedik davranış gösterebilir veya susturucu durumu yanlış yorumlanabilir.

[Aksiyom 2]: Eğer `hasSilencer` false ise, `silencerRadius` ve `silencerLength` değerleri 3D modelde susturucu geometrisi oluşturmak için kullanılmaz.

[Aksiyom 3]: Eğer `silencerRadius` negatif bir değer alırsa, 3D geometri oluşturma sırasında hata oluşur veya geçersiz bir mesh üretilebilir.

[Aksiyom 4]: Eğer `silencerLength` negatif bir değer alırsa, 3D geometri oluşturma sırasında hata oluşur veya geçersiz bir mesh üretilebilir.

[Aksiyom 5]: `silencerRadius` ve `silencerLength` değerleri `hasSilencer` true olduğunda birlikte tutarlı olmalıdır — susturucu boyutu fan çapına göre anlamlı bir aralıkta olmalıdır (spesifik eşik değerleri bilinmiyor).

[Aksiyom 6]: `silencerLength`'in varsayılan değeri `0.` olarak tanımlanmıştır; bu durumda susturucu uzunluğu sıfır olacağından, `hasSilencer` true olsa bile görünür bir susturucu geometrisi oluşmayabilir.

---

## FONKSİYON DETAYLARI

### AxialFanModel

**Ne yapar**: Three.js sahnesinde gerçekçi bir eksantrik (a eksenli) fan modeli oluşturur. 7 orak kanatlı, siyah cilalı çelik gövdeli, opsiyonel susturucu (silencer) eklenebilir 3D bir fan bileşeni render eder. BVN referans tarzında, siyah cilalı yüzeyler, kırmızı logo bölgesi ve sık aralıklı tel kafes ile detaylı bir endüstriyel fan modeli sunar.

**Nasıl yapar**: Bileşen, `useFanMaterials` hook'u ile malzemeleri alır ve `useMemo` ile optimization yapılmış orak kanat geometrisi oluşturur. `useFrame` hook'u ile her karede pervaneyi 15 birim/saniye hızıyla döndürür. JSX yapısında 5 ana alt gruptan oluşur: susturucu (opsiyonel), silindirik kovan, motor ve pervane grubu, tel kafes ve klemens kutusu. Kanat geometrisi Bezier eğrileri ile hücum kenarı, uç ve firar kenarı tanımlanarak extrude edilir.

**Parametreler**:
- `hasSilencer`: boolean — Susturucu eklenip eklenmeyeceğini belirler. Varsayılan değer `false`
- `silencerRadius`: number — Susturucu yarıçapı (birim: meter). Varsayılan değer `0.58`
- `silencerLength`: number — Susturucu uzunluğu (birim: meter). Varsayılan değer `0.7`

**Dönüş**: JSX.Element — 3D fan modelini temsil eden React Three Fiber bileşeni. Grup elemanı içinde silindirik kovan, dönen pervane grubu (7 siyah orak kanat + kırmızı logo), sabit motor, 8 konsantrik halkalı ve 8 radyal telli tel kafes, ile klemens kutusu içerir.

**Dahili Bileşenler**:
- **Silencer**: Opsiyonel susturucu birimi, fanın arkasına (-0.7 z pozisyonu) yerleştirilir
- **Silindirik Kovan**: Cilalı siyah malzemeden, 0.55 yarıçapında, 0.5 yüksekliğinde silindirik gövde ve ön/arka flanşlar
- **Pervane Grubu**: `fanRef` referansı ile dönen kısım. 0.16 yarıçapında siyah göbek, 0.08 yarıçapında kırmızı logo diski ve 7 adet siyah orak kanat
- **Tel Kafes**: 0.1-0.55 aralığında 8 konsantrik halka ve 0-315 derece aralığında 8 radyal çubuk
- **Klemens Kutusu**: 0.12x0.15x0.08 boyutunda siyah kutu, üstte konumlandırılmış

**Blade Geometrisi Detayı**: Orak kanat geometrisi `ExtrudeGeometry` ile oluşturulur. Hücum kenarı `(0.1, 0.15)` kontrol noktası ile dışa doğru kavis alır, uç noktası `(0.38, 0.05)` ile `(0.38, -0.15)` arasında geriye kıvrılır, firar kenarı göbeğe dönüş yapar. Extrude derinliği 0.015, bevel kalınlığı ve boyutu 0.005 birimdir. Her kanat `0.45` pitch, `0.15` ve `-0.15` açılarıyla hava itme yönünde döndürülmüştür.

**Konumlandırma**: Ana grup `[0, 0, 0]` pozisyonunda, `0.85` ölçeğinde ve `y ekseni üzerinde -Math.PI/4` döndürülmüş olarak render edilir.

---

## INTERFACES

### AxialFanModelProps
- `hasSilencer?: boolean`
- `silencerRadius?: number`
- `silencerLength?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AxialFanModel.tsx::AxialFanModel
- **params**: (hasSilencer: boolean = false, silencerRadius: number = 0.58, silencerLength: number = 0.7)
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hookundan dönen material objesi, 3D modelin malzemelerini (parlak siyah, kanat siyahı, logo kırmızısı, mat siyah) içerir
  - `fanRef` — useRef<Group>(null) ile oluşturulan referans, fan pervanesinin dönme animasyonu için kullanılır
  - `bladeGeometry` — useMemo ile bellekte tutulan ExtrudeGeometry objesi, orak şeklindeki fan kanatının 3D geometrisini tanımlar (shape ve extrudeSettings ile)
  - `shape` — bladeGeometry içinde tanımlanan Shape objesi, kanat profilinin 2D yolunu (bezierCurveTo ile) oluşturur
  - `extrudeSettings` — bladeGeometry içinde tanımlanan ayar objesi, geometrinin derinlik ve bukulum (bevel) parametrelerini içerir
- **Dönüş**: JSX elementi (React component)

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