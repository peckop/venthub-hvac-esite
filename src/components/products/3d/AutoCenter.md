---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\AutoCenter.tsx
skeleton_hash: 9ff8526ee667760a
entity_hashes:
  func:AutoCenter: 7e5fd029da989dd5
  overview: 3be99e46f5543048
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
AutoCenter modülü, üç boyutlu sahnelerde çocuk bileşenleri otomatik olarak belirli bir merkez noktasına hizalamak için tasarlanmış bir React konteyner bileşenidir. Bileşen, etkinleştirildiğinde içeriğin sınırlayıcı kutusunu hesaplayarak merkezleme işlemini otomatik olarak uygular ve opsiyonel bir kaydırma (shift) parametresi ile bu konumu ince ayarlamaya olanak tanır.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, modülün temel ve tek işlevini yerine getiren merkezi bileşeni barındırır. Bileşen, çocuk düğümlerini alır, merkezleme mantığını çalıştırır ve gerekli konumlandırma dönüşümlerini uygular.
- AutoCenter

---

## AXIOMS – Mimari Varsayımlar
Bu modül, 3D bir sahne içinde çocuk bileşenlerini merkeze hizalamak ve konumlandırmak için kullanılır.

[Aksiyom 1]: Eğer **children** prop'u bir React node içermiyorsa, bileşen hiçbir içerik render etmez.
[Aksiyom 2]: Eğer **enabled** prop'u `false` olarak ayarlanmazsa (veya verilmezse), bileşen varsayılan olarak children bileşeninin otomatik ortalama (centering) işlemini uygular.
[Aksiyom 3]: Eğer **shift** prop'u bir dizi olarak verilmezse (veya verilmezse), bileşen varsayılan olarak `[0, 0, 0]` kaydırma vektörünü kullanır.
[Aksiyom 4]: Eğer **shift** prop'u olarak verilen dizinin uzunluğu 3 değilse veya elemanları sayısal değillerse, bileşen beklenmedik davranış gösterebilir.

---

## FONKSİYON DETAYLARI

### AutoCenter
**Ne yapar**: 3D sahne içindeki çocuk bileşenlerin otomatik olarak merkezlenmesini sağlayan bir React sarmalayıcı (wrapper) bileşenidir. Bileşen, içeriğinin bounding box hesaplamasını kontrol ederek modelin sahnede dengeli bir şekilde konumlandırılmasını temin eder.

**Nasıl yapar**: Eski versiyonda yaşanan bir sorunu çözüme kavuşturmak için yeniden tasarlanmıştır. Önceki sürüm `useLayoutEffect` ve `Box3.setFromObject()` yöntemlerini kullanıyordu; bu yöntem, animasyonlu parçacıklar dahil tüm alt objeleri taradığından, parçacıklar hareket ettikçe bounding box merkezi kayıyor ve model istemsizce "zıplıyordu". Yeni stabil sürümde bu sorun giderilerek güvenilir bir merkezleme davranışı sağlanmıştır.

**Parametreler**:
- `children`: React.ReactNode — Merkezlenecek olan 3D model veya bileşen içeriği. Bu parametre zorunludur ve bileşenin render edeceği çocuk elemanları temsil eder.
- `enabled`: boolean — Otomatik merkezleme işlevinin aktif olup olmadığını kontrol eder. Varsayılan değeri `true`'dur. `false` olarak ayarlandığında merkezleme devre dışı kalır.
- `shift`: [number, number, number] — [x, y, z] formatında bir dizi. Otomatik merkezleme üzerine eklenecek manuel kaydırma (offset) değerini belirtir. Varsayılan değeri `[0, 0, 0]` olup herhangi bir kaydırma yapmaz.

**Dönüş**: `React.FC<{ children: React.ReactNode; enabled?: boolean; shift?: [number, number, number] }>` — Otomatik merkezleme mantığını içeren ve çocuk bileşenlerini sarmalayan bir React işlevsel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\AutoCenter.tsx::AutoCenter
- **params**: ({ children, enabled = true, shift = [0, 0, 0] })
- **ic_degiskenler**:
  - `groupRef` — useRef ile oluşturulmuş, THREE.Group türünde bir referans. 3D nesne grubunu temsil eder, Bounding Box hesaplaması ve pozisyon ayarlaması için kullanılır.
  - `isLocked` — useRef ile oluşturulmuş, boolean değer tutar. Centering işleminin yapılıp yapılmadığını gösterir, true olduğunda useFrame callback'i artık çalışmayı durdurur.
  - `frameCount` — useRef ile oluşturulmuş, frame sayısını tutar. İlk 3 frame'i atlamak için kullanılır.
- **Dönüş**: JSX elementi olarak <group ref={groupRef}>{children}</group> döner. Fonksiyonun ana görevi, children elementlerini bir 3D grup içinde sarmalamak ve useFrame hook'u ile bu grubun dikey (Y) merkezini hesaplayarak otomatik olarak yukarı kaydırmaktır.

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\AutoCenter.tsx::useFrame callback
- **params**: () => (parametre yok, useFrame hook'unun callback parametresi olarak çağrılır)
- **ic_degiskenler**:
  - **Dış menzilden erişilenler (closure)**:
    - `isLocked` — useRef nesnesinin .current değeri. true ise fonksiyon erken döner (kilitli).
    - `enabled` — AutoCenter bileşeninin enabled prop'u. false ise fonksiyon erken döner (devre dışı).
    - `groupRef` — useRef nesnesinin .current değeri, THREE.Group nesnesi. Pozisyon ayarlaması için kullanılır.
    - `frameCount` — useRef nesnesinin .current değeri. Frame sayacını artırır.
    - `shift` — AutoCenter bileşeninin shift prop'u. Varsayılan offset değerleri için kullanılır.
  - **Fonksiyon içinde tanımlananlar**:
    - `box` — new THREE.Box3() instance. Grubun sınırlarını hesaplamak için kullanılır.
    - `center` — new THREE.Vector3() instance. Bounding box'ın merkezini tutar.
    - `yOffset` — number. Y ekseni için hesaplanan offset (-center.y + shift[1]).
    - `xOffset` — number. X ekseni için shift[0] değerinden alınan offset.
    - `zOffset` — number. Z ekseni için shift[2] değerinden alınan offset.
- **Dönüş**: Yok (void). Yan etkisi olarak groupRef.current'ın pozisyonunu günceller ve isLocked.current'ı true yapar. Fonksiyonun amacı, her frame'de (ilk 3 frame hariç) 3D grubun bounding box'ını hesaplayıp, grubun Y eksenindeki merkezini shift[1] değeri ile ayarlayarak otomatik olarak yukarı kaydırmaktır, ardından kilitleyerek tekrar hesap yapmayı durdurur.

---

## NODE ID STANDARD

  file: src\components\products\3d\AutoCenter.tsx
  function: src\components\products\3d\AutoCenter.tsx::AutoCenter

---

## DISA AKTARILANLAR (EXPORTS)
  export: AutoCenter

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