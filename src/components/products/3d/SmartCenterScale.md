---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\SmartCenterScale.tsx
skeleton_hash: 170e8ef52df1e15b
generated_at: 2026-05-23T22:21:41Z
---

## Genel Bakış
SmartCenterScale, bir React bileşeni olarak, içeriğinin boyutunu ve konumunu ayarlamak için tasarlanmıştır. Bileşen, `enabled`, `targetSize` ve `shift` gibi özellikleri kullanarak çocuk elementleri ölçeklendirir ve kaydırır, böylece 3B bir ortamda merkezi bir ölçekleme etkisi sağlar.

## Fonksiyon Grupları
### Temel Renderleme ve Ölçeklendirme
Bileşenin tek işlevi, gelen özelliklere göre çocuk içeriğini ölçeklendirip konumlandırmaktır; bu sayede kullanıcı tarafından belirlenen hedef boyuta ve kaydırma değerine göre görsel öğeler dinamik olarak ayarlanır.

---

## AXIOMS – Mimari Varsayımlar
Bu modülün davranışı, prop tanımlarına ve varsayılan değerlerine bağlıdır.

[Aksiyom 1]: Eğer `enabled` prop'ı sağlanmazsa, varsayılan olarak `true` değeri kullanılır.  
[Aksiyom 2]: Eğer `targetSize` prop'ı sağlanmazsa, varsayılan olarak `1.0` değeri kullanılır.  
[Aksiyom 3]: Eğer `children` prop'ı sağlanmazsa, component'in render ettiği içerik boş olur (hiçbir çocuk elementi yok).  
[Aksiyom 4]: Eğer `shift` prop'ı sağlanmazsa, fonksiyon imzasında geçerli bir default değeri belirtilmediği için shift'in değeri belirsiz/tanımsız olur ve bu durum component'in davranışını etkileyebilir.

---

## FONKSIYON DETAYLARI

### SmartCenterScale
**Ne yapar**: SmartCenterScale, bir 3D modelin geometrik merkezini hesaplayıp (0,0,0) noktasına taşıyarak otomatik merkezleme yapar; ardından modeli belirtilen `targetSize` değerine uygun şekilde ölçekleyerek normalize eder. Ayrıca hesaplama tamamlanana kadar modelin görüntüsünün titreşmesini (flicker) önleyen bir mekanizma sağlar.

**Nasıl yapar**: Bileşen, içindeki `children` olarak verilen 3D modeli alır; önce modelin sınırlayıcı kutusunu (bounding box) kullanarak merkez noktasını bulur ve bu merkezi origemine getiren bir çeviri matrisi uygular. Sonra modelin en büyük boyutunu ölçer, `targetSize` ile oranını alır ve bu oranı tüm eksenlerde ölçek faktörü olarak kullanarak modeli yeniden boyutlandırır. `enabled` prop’u false olduğunda bu işlemler atlanır ve `shift` prop’u ile ek bir translasyon (ofset) uygulanabilir; bu sayede merkezleme ve ölçekleme sonrası model istenen bir miktar kaydırılabilir.

**Parametreler**:
- children: React.ReactNode — 3D modelini veya sahnedeki diğer öğeleri temsil eden JSX içeriği.
- enabled: boolean — Varsayılan `true`. Özelliğin aktif olup olmadığını kontrol eder; `false` olduğunda merkezleme ve ölçekleme atlanır.
- targetSize: number — Varsayılan `1.0`. Modelin en uzun ekseni bu değere eşitlemek için kullanılan hedef boyut.
- shift: number[] — Varsayılan `[0, 0, 0]` (belirtilen parçalı ifadeye göre). Modelin merkezlenip ölçeklendikten sonra uygulanacak ekstra translasyon vektörü (x, y, z).

**Dönüş**: React.FC<SmartCenterScaleProps> — `SmartCenterScaleProps` tipini alan ve işlenen 3D içeriği render eden bir fonksiyonel React bileşeni döner. Bu bileşen, JSX içinde doğrudan kullanılarak sahnedeki modelin otomatik olarak merkezlenip ölçeklenmesini sağlar.

---

## INTERFACES

### SmartCenterScaleProps
- `children: React.ReactNode`
- `enabled?: boolean`
- `targetSize?: number`
- `shift?: [number, number, number]`
- `visibleDelay?: number`
- `alignment?: 'center' | 'bottom'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SmartCenterScale.tsx::SmartCenterScale
- **params**: children, enabled, targetSize, shift, visibleDelay, alignment
- **ic_degiskenler**:
  - `groupRef` — ref objesi, THREE.Group öğesine erişmek ve onun dönüşümünü (position, scale) güncellemek için kullanılır.
  - `isVisible` — grupun görünürlüğünü kontrol eden durum durumu; true olduğunda `<group>` görünür olur.
  - `setIsVisible` — `isVisible` durumunu güncelleyen setter fonksiyonu.
  - `isLocked` — bir kez ölçekleme işlemi tamamlandıktan sonra yeniden hesaplamayı engellemek için kullanılan mutable ref.
  - `frameCount` — `useFrame` tarafından her frame artan sayaç; görünürlük gecikmesi (`visibleDelay`) için kullanılır.
- **Dönüş**: JSX elementi (`<group ref={groupRef} visible={isVisible || !enabled}> {children} </group>`) döndürür; bu da bileşenin render çıktısıdır.

### [N2_NASIL] AST Pointer: SmartCenterScale.tsx::useFrame_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `enabled` — prop; false olduğunda hesaplama atlanır.
  - `isLocked` — ref; true olduğunda hesaplama atlanır (bir kez kilitlendikten sonra).
  - `groupRef` — ref; grup objesi null değilse işlem yapılır.
  - `frameCount` — ref; her frame artırılır ve `visibleDelay` ile karşılaştırılır.
  - `visibleDelay` — prop; ilk birkaç frame'de hesaplama ertelenmesini sağlar.
  - `targetSize` — prop; nesnenin hedef boyutu (ölçek faktörü hesaplamasında kullanılır).
  - `alignment` — prop; 'bottom' olduğunda y-ekseni offseti ayarlanır.
  - `shift` — prop; x, y, z eksenlerinde ekstra kaydırma değeri.
  - `setIsVisible` — durum setter; hesaplama tamamlandığında görünürlüğü true yapar.
  - `box` — `THREE.Box3` örneği; grup nesnesinin sınırlayıcı kutusunu hesaplar.
  - `center` — `THREE.Vector3`; sınırlayıcı kutunun merkezi koordinatları.
  - `size` — `THREE.Vector3`; sınırlayıcı kutunun boyutları (x, y, z).
  - `maxDim` — sayı; `size.x`, `size.y`, `size.z` içindeki en büyük değer; ölçek faktörü için kullanılır.
  - `scaleFactor` — sayı; `targetSize / maxDim` oranı; grupün uniform ölçeğini belirler.
  - `yOffset` — sayı; grupün y-ekseni konumunu hizalama ve shift ile ayarlar.
- **Dönüş**: (yok) — fonksiyon sadece yan etkiler yapar (grupün position ve scale'ını günceller, durumunu ve kilidi ayarlar).

### [N3_NASIL] AST Pointer: SmartCenterScale.tsx::useEffect_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `timer` — `setTimeout` tarafından dönen kimlik; 500 ms sonra `setIsVisible(true)` çağrısı için kullanılır.
  - `setIsVisible` — dış kapsaptan alınan durum setter; zaman aşımı sonrası grupun zorla görünür yapılması için kullanılır.
  - `clearTimeout` — global fonksiyon; `timer` kimliğini iptal etmek için kullanılır (cleanup içinde).
- **Dönüş**: fonksiyon bir cleanup fonksiyonu döner: `() => clearTimeout(timer)`. Bu, komponent unmount olduğunda zamanlayıcıyı temizler.

---

## NODE ID STANDARD

  file: src\components\products\3d\SmartCenterScale.tsx
  function: src\components\products\3d\SmartCenterScale.tsx::SmartCenterScale

---

## DISA AKTARILANLAR (EXPORTS)
  export: SmartCenterScale

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Responsive:** (yok)
