---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Silencer.tsx
skeleton_hash: 0d417fee6be9a360
entity_hashes:
  func:Silencer: b0d56de6b93be1bd
  overview: ae5f7c5e5d83ff51
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-12T10:21:26Z
---

## Genel Bakış
Bu modül, HVAC ürünlerinin 3 boyutlu görselleştirilmesinde kullanılan, silindirik bir susturucu parçasını temsil eden yapılandırımlı bir React bileşenidir. Bileşen, parçanın temel geometrik özelliklerini ve 3D sahadaki konumunu belirleyen parametreler alır.

## Fonksiyon Grupları
### Bileşen Tanımı ve Oluşturma
Bu grup, modülün tek ve temel işlevini tanımlar; susturucu parçasının geometrisini ve görünümünü belirleyen bir React fonksiyonel bileşeni sağlar.
- Silencer

---

## AXIOMS – Mimari Varsayımlar

Bu modül, 3D sahada silindirik bir susturucu parçası oluşturan bir React bileşenidir. Aşağıdaki mimari varsayımlar fonksiyon imzasından türetilmiştir.

[Aksiyom 1]: Eğer `radius` parametresi negatif veya sıfır değer alırsa, geçersiz silindirik geometri oluşur (geometrik olarak tanımsız).

[Aksiyom 2]: Eğer `length` parametresi negatif veya sıfır değer alırsa, geçersiz silindirik geometri oluşur (geometrik olarak tanımsız).

[Aksiyom 3]: Eğer `position` parametresi 3 elemanlı bir dizi [x, y, z] formatında verilmezse, bileşenin 3D sahadaki konumu tanımsız olur.

[Aksiyom 4]: Eğer bileşen bir 3D sahne bağlamı (örn: Three.js sahnesi) dışında render edilirse, geometrik nesne görüntülenemez.

[Aksiyom 5]: Eğer `radius` ve `length` değerleri arasındaki oran aşırı derecede farklılaşır (örn: radius ≫ length veya length ≫ radius), susturucu geometrisi gerçekçi bir görünüm kazanamaz; bunun için eşik değer bilinmiyor.

---

**Not:** Bu modül için belirli eşik değerleri (minimum/maximum radius, length) veya kabul kriterleri fonksiyon imzasında tanımlanmamıştır. Sadece geometrik tanımlılık varsayımları çıkarılmıştır.

---

## FONKSİYON DETAYLARI

### Silencer
**Ne yapar**: Silencer bileşeni, HVAC sistemlerinde ses azaltma amacıyla kullanılan bir susturucu (silencer) modelini oluşturur. Silindir şeklinde bir dış kabuk ve iç kısmında delikli yüzey barındırarak gürültüyü düşürür.  
**Nasıl yapar**: Bileşen, verilen `radius`, `length` ve `position` parametrelerini kullanarak bir silindir geometrisi üretir; iç yüzeye delikli bir pattern ekleyerek ses emme özelliğini simüle eder ve bu geometriyi React üzerinden JSX olarak döndürür.  
**Parametreler**:
- radius: number — Silindirin yarıçapı (metre cinsinden), varsayılan değer 0.6  
- length: number — Silindirin uzunluğu (metre cinsinden), varsayılan değer 0.8  
- position: number[] — Silencerin 3D uzayda konumunu belirten [x, y, z] koordinatları, varsayılan değer [0, 0, 0]  
**Dönüş**: React.FC<SilencerProps> — Bir React fonksiyonel bileşeni döndürür; render edildiğinde silencerin 3D modelini ekrana çizer.

---

## INTERFACES

### SilencerProps
- `radius?: number`
- `length?: number`
- `position?: [number, number, number]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::Silencer
- **params**: (`radius` — Genlik yarıçapı, varsayılan 0.6; `length` — Uzunluk, varsayılan 0.8; `position` — 3B konum vektörü, varsayılan [0,0,0])
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen malzeme nesnesi. 3B modellere uygulanacak malzemeleri (galvanizedSteel, industrialSteel, matteBlack) içerir.
  - `_perforationGeometry` — `useMemo` ile hesaplanan ve önbelleğe alınan iç delikli yüzey geometrisi. `radius` değişkenine bağlı olarak yeniden hesaplanır.
- **Dönüş**: JSX elementi (React bileşeni). `group` elementi içinde 3D silansör modelini render eder.

### [N2_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — Three.js `Shape` nesnesi. Deliklerin oluşturulacağı temel şekil.
  - `holeRadius` — Deliklerin oluşturulacağı halka yarıçapı. `radius * 0.85` hesaplanır.
  - `holeCount` — Oluşturulacak delik sayısı. Sabit 12.
  - `angle` — Döngü içinde her deliğin açısı. `(i / holeCount) * Math.PI * 2` ile hesaplanır.
  - `hx` — Deliğin merkezinin x koordinatı. `Math.cos(angle) * holeRadius` ile hesaplanır.
  - `hy` — Deliğin merkezinin y koordinatı. `Math.sin(angle) * holeRadius` ile hesaplanır.
  - `hole` — Three.js `Path` nesnesi. Tek bir daire deliğini temsil eder. `shape.holes` dizisine eklenir.
- **Dönüş**: `ShapeGeometry` nesnesi. Deliklerle oluşturulmuş 2B şekilden türetilmiş geometri.

### [N3_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::map callback (perforation rings)
- **params**: (`_` — Kullanılmayan mevcut eleman, `i` — Dizideki mevcut indeks)
- **ic_degiskenler**:
  - `zPos` — Halkanın z-ekseni üzerindeki konumu. `length` ve `i` değerlerinden hesaplanır: `-length / 2 + (i + 1) * (length / 7)`.
- **Dönüş**: JSX elementi. Delikli iç yüzeydeki akustik halka geometrisini render eden `mesh`.

### [N4_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::map callback (structural reinforcement rings)
- **params**: (`z` — Halkanın z ekseni konumu, `i` — Dizideki mevcut indeks)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi. Yapısal destek halkasını (torus) render eden `mesh`.

### [N5_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::map callback (mounting brackets)
- **params**: (`angle` — Braketin döndürme açısı (derece), `i` — Dizideki mevcut indeks)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi. Montaj braketini ( kutu geometrisi ) içeren `group`.

---

## NODE ID STANDARD

  file: src\components\products\3d\parts\Silencer.tsx
  function: src\components\products\3d\parts\Silencer.tsx::Silencer

---

## DISA AKTARILANLAR (EXPORTS)
  export: Silencer

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