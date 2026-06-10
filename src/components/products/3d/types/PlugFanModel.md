---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\PlugFanModel.tsx
skeleton_hash: 1ead6ef037badd4a
entity_hashes:
  func:PlugFanModel: b85fe612276b43fc
  overview: e48f3eec2a768329
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:47:53Z
---

## Genel Bakış
VentHub HVAC platformunun 3D ürün görselleştirme altyapısında yer alan bu modül, fişli tip fan (Plug Fan) ürününü three.js ve React ekosistemi kullanarak tarayıcıda üç boyutlu olarak sunan bağımsız bir bileşendir. Model asset'lerini yükler, sahneye yerleştirir ve üst bileşenlere dışa aktarılan tek bir fonksiyonel React bileşeni olarak render işlemini yönetir.

## Fonksiyon Grupları

### 3D Fan Modeli Bileşeni
Modülün tek ve temel sorumluluğu olan bu bileşen, Plug Fan ürününün 3D model dosyalarını React çalışma ortamında yükleyip tarayıcı tabanlı three.js sahnesinde görselleştirir; konum, ölçek ve döndürme gibi parametreleri alarak istenen formatta render eder.
- PlugFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (iç实现) paylaşılmamıştır. Mevcut bilgiler yalnızca fonksiyon imzası ve genel doküman açıklamasıdır. Aşağıdaki varsayımlar bu kısıtlı bilgiye dayanarak çıkarılmıştır:

[Aksiyom 1]: Eğer `PlugFanModel` bir React JSX bileşeni olarak kullanılmazsa (doğrudan `createElement` ile çağrılsa veya geçersiz bir yere yerleştirilse), React render hatası oluşur.

[Aksiyom 2]: Eğer `PlugFanModel` bileşeni çağrı paramsız (`PlugFanModel()` şeklinde) beklenen bir bağlamda prop'larla çağrılırsa, fazladan prop'lar yoksayılır veya TypeScript derleme uyarısı verir; bileşen dış bağımlılık olarak tanımlı bir prop'a erişemez.

[Aksiyom 3]: Eğer bileşenin çalışması için zorunlu olan 3D renderlama ortamı (örn: Three.js canvas, React Three Fiber sağlayıcısı) mevcut değilse, 3D model ekranda renderlanamaz.

---

**Not:** Fonksiyon gövdesi paylaşılmadığı için, bileşenin iç bağımlılıkları, yüklediği modeller, kullandığı materyaller veya varsayılan değerleri hakkında kesin çıkarım yapılamamaktadır. Yukarıdaki aksiyomlar yalnızca fonksiyon imzasındaki **parametresiz çağrı** gerçeğine ve React bileşen yapısının doğasına dayanmaktadır.

---

## FONKSİYON DETAYLARI

### PlugFanModel
**Ne yapar**: VentHub HVAC projesinin 3D ürün bileşenleri dizininde yer alan bu fonksiyon, fişli fan (plug fan) olarak adlandırılan HVAC ekipmanının 3 boyutlu modelini React tabanlı uygulamada görüntülemek üzere kullanılacak bir React bileşeni döndürür. Projenin ürün gösterim akışında özel fan modellerinin 3B sahnelere entegre edilmesini sağlayan temel bileşen görevi görür, sadece ilgili ürün kategorisinin 3B temsilinde kullanılır.
**Nasıl yapar**: TypeScript tabanlı yapısı gereği React'in resmi bileşen standartlarına uygun bir React.FC (Fonksiyonel Bileşen) nesnesi döndürerek, React'in yaşam döngüsü kuralları çerçevesinde 3B fan modelini uygulamanın görüntüleme katmanına entegre eder. Kaynak dosya konumu gereği sadece projenin ürünlere özel 3D bileşenler akışında çağrılır, fişli fan dışındaki farklı ürün modellerinin gösteriminde kullanılmaz.
**Parametreler**:
- Bu fonksiyon herhangi bir girdi parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu dönen bileşen, fişli fanın 3B modelini React uygulamasının ilgili görüntüleme alanına eklemek, güncellemek ve yönetmek için tasarlanmıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: types/PlugFanModel.tsx::PlugFanModel
- **params**: (yok)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen 3D materyal nesneleri; içinde `galvanizedSteel`, `industrialSteel`, `safetyOrange`, `ral7035`, `matteBlack` gibi materyal referansları barındırır, JSX'te mesh'lerin `material` prop'larında kullanılır
  - `fanRef` — `useRef<Group>(null)` ile oluşturulmuş React ref nesnesi; Three.js `Group` tipinde bir referans tutar, `useFrame` callback'inde fan pervanesinin `rotation.z` değerini değiştirmek için `fanRef.current` üzerinden erişilir; JSX'te pervane grubuna `ref={fanRef}` olarak bağlanır
- **Dönüş**: `JSX.Element` — Plug Fan 3D modelini oluşturan React elementi; içinde emiş hunisi, pervane (7 kanatlı geriye eğimli), motor (soğutma kanatçıkları ve klemens kutusu dahil) ve taban kaidesi bulunan `<group>` yapısı döner; dış group'a `scale={[0.7, 0.7, 0.7]}` ve `rotation={[0, Math.PI / 4, 0]}` uygulanır

---

### [N2_NASIL] AST Pointer: types/PlugFanModel.tsx::useFrame_callback
- **params**: (yok — useFrame'in state/delta parametreleri kullanılmamış)
- **ic_degiskenler**: (yok)
  - `fanRef.current` — dış scope'daki `fanRef` referansının mevcut Three.js Group nesnesine erişimi; `null` kontrolü yapıldıktan sonra `rotation.z` alanına `-0.1` eklenerek pervanenin her frame'de kendi ekseni etrafında dönmesi sağlanır
- **Dönüş**: yok (yan etki: her frame'de `fanRef.current.rotation.z` güncellenir)

---

### [N3_NASIL] AST Pointer: types/PlugFanModel.tsx::blade_map_callback
- **params**:
  - `_` — `Array(7).fill(0)` ile üretilen boş eleman, kullanılmıyor
  - `i` — kanat indeksi (0–6); her bir kanatın dairesel konumunu hesaplamak için kullanılır, `(i / 7) * Math.PI * 2` formülü ile 7 kanat eşit aralıklarla dağıtılır
- **ic_degiskenler**: (yok)
  - `materials.safetyOrange` — outer scope'taki `materials` üzerinden erişilen turuncu materyal; her kanat mesh'ine uygulanır
- **Dönüş**: `JSX.Element` — tek bir pervane kanadını temsil eden `<group>` elementi; `rotation={[0, 0, (i / 7) * Math.PI * 2]}` ile dairesel konumlandırılmış, içinde `boxGeometry args={[0.015, 0.3, 0.25]}` boyutlarında bir `<mesh>` barındırır

---

### [N4_NASIL] AST Pointer: types/PlugFanModel.tsx::cooling_fin_map_callback
- **params**:
  - `_` — `Array(12).fill(0)` ile üretilen boş eleman, kullanılmıyor
  - `i` — kanatçık indeksi (0–11); her bir soğutma kanatçığının dairesel konumunu hesaplamak için kullanılır, `(i / 12) * Math.PI * 2` formülü ile 12 kanatçık eşit aralıklarla dağıtılır
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element` — tek bir motor soğutma kanatçığını temsil eden `<mesh>` elementi; `rotation={[0, (i / 12) * Math.PI * 2, 0]}` ile Y ekseni etrafında dairesel konumlandırılmış, `position={[0.18, 0, 0]}` ile motor gövdesinin dış yüzeyine yerleştirilmiş, `boxGeometry args={[0.04, 0.35, 0.02]}` boyutlarında ve inline `<meshStandardMaterial color="#94a3b8" />` materyaline sahiptir

---

## NODE ID STANDARD

  file: src\components\products\3d\types\PlugFanModel.tsx
  function: src\components\products\3d\types\PlugFanModel.tsx::PlugFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: PlugFanModel

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