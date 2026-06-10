---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\SmartCenterScale.tsx
skeleton_hash: a01bca5288142610
entity_hashes:
  func:SmartCenterScale: b7830112d0facb88
  overview: 209ac57b4adbad6d
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:38:17Z
---

## Genel Bakış
SmartCenterScale, React tabanlı 3B uygulamalarda kullanılan bir bileşen olarak, çocuk elementlerin boyutunu ve konumunu optimize ederek merkezi bir ölçekleme sağlar. Bileşen, enabled, targetSize ve shift özellikleri sayesinde, 3B nesnelerin hedef boyuta göre yeniden boyutlandırılmasını ve kaydırılmasını kontrol eder.

## Fonksiyon Grupları
### Merkezi Ölçeklendirme ve Konumlandırma
Bileşenin temel sorumluluğu, 3D modelin geometrik merkezini hesaplayıp orijine taşımak ve belirtilen hedef boyuta göre ölçeklemektir; bu işlem sırasında modelin titreşmesini önleyerek stabil bir görsel sunum sağlar.
- SmartCenterScale

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar, fonksiyon imzası ve eski dokümandan anlaşılan davranış üzerine kuruludur.

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa, bileşen render edilecek bir içeriğe sahip olmadığından görünür bir çıktı üretmez veya boş bir bileşen döner.

[Aksiyom 2]: Eğer `enabled` parametresi `false` değerine ayarlanırsa, modül içeriği üzerinde ölçekleme ve konumlandırma（shift）dönüşümleri uygulanmaz; bileşen orijinal boyut ve konumda kalır.

[Aksiyom 3]: Eğer `targetSize` parametresi `0`'a eşit veya daha küçük bir değer alırsa, ölçekleme faktörü geçersiz olur ve modülün davranışı tanımsızdır（örn. hata oluşabilir veya bileşen görünmez hale gelebilir）.

[Aksiyom 4]: Eğer `shift` parametresi 3 elemanlı bir vektör（[x, y, z]）formatında sağlanmazsa, 3B konumlandırma hesaplaması yapılamaz ve modülün davranışı tanımsızdır.

[Aksiyom 5]: Eğer `shift` vektörünün herhangi bir bileşeni（x, y veya z）negatif veya pozitif bir kaymayı temsil ediyorsa, bu değerler modülün 3B uzayındaki koordinat dönüşümü için doğrudan kullanılır; değerlerin mutlak büyüklüğüne veya işaretine dair herhangi bir kısıtlama（eşik değer）bilinmemektedir.

---

## FONKSİYON DETAYLARI

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
- **params**: (children, enabled, targetSize, shift, visibleDelay, alignment)
- **ic_degiskenler**:
  - `groupRef` — useRef ile oluşturulmuş Three.js Group referansı, sahnedeki group elemanını kontrol etmek için kullanılır
  - `isVisible` — useState ile oluşturulmuş boolean state, group'un görünürlüğünü kontrol eder
  - `isLocked` — useRef ile oluşturulmuş boolean, ölçekleme hesaplamasının kilitlenip kilitlenmediğini tutar
  - `frameCount` — useRef ile oluşturulmuş sayı, frame sayısını takip eder
- **Dönüş**: JSX element (<group> componenti)

### [N2_NASIL] AST Pointer: SmartCenterScale.tsx::useFrame_callback
- **params**: (delta_time — useFrame tarafından sağlanan delta zaman değeri, kullanılmıyor)
- **ic_degiskenler**:
  - `box` — Box3 instance, groupRef.current nesnesinin bounding box'ını hesaplar
  - `center` — Vector3 instance, bounding box'ın merkez koordinatlarını tutar
  - `size` — Vector3 instance, bounding box'ın boyutlarını tutar
  - `maxDim` — number, size.x, size.y ve size.z değerlerinin en büyüğü
  - `scaleFactor` — number, targetSize değerine ulaştırmak için hesaplanan ölçek faktörü
  - `yOffset` — number, alignment parametresine göre hesaplanan Y ekseni offset değeri
- **Dönüş**: void (yan etkiler: groupRef.current.position, groupRef.current.scale, setIsVisible, isLocked.current)

### [N3_NASIL] AST Pointer: SmartCenterScale.tsx::useEffect_callback
- **params**: (none)
- **ic_degiskenler**:
  - `timer` — setTimeout ID'si, 500ms sonra isVisible'ı true yapmak için kullanılır
- **Dönüş**: cleanup fonksiyonu (clearTimeout(timer))

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
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)