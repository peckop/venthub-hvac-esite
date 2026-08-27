---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\AutoCenter.tsx
skeleton_hash: 780a64c9eae7c864
entity_hashes:
  func:AutoCenter: 7e5fd029da989dd5
  overview: 9be491c8c9204cb2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:37:16Z
---

## Genel Bakış
AutoCenter modülü, 3D sahnelerdeki çocuk bileşenlerin otomatik olarak merkeze hizalanmasını sağlayan bir React sarmalayıcı bileşenidir. Bileşen, içeriğin sınırlayıcı kutusunu hesaplayarak modelin sahnede dengeli bir şekilde konumlandırılmasını sağlar. Opsiyonel kaydırma parametresi ile bu konumlandırma ince ayara olanak tanır.

## Fonksiyon Grupları
### Merkezleme Bileşeni
Modülün tek ve temel bileşenini oluşturur. Çocuk düğümleri alır, merkezleme mantığını uygular ve gerekli konumlandırma dönüşümlerini hesaplar.
- AutoCenter

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar fonksiyon imzasından çıkarılmıştır:

[Aksiyom 1]: Eğer `children` parametresi sağlanmazsa, bileşen render edilecek içeriğe sahip olmadığından merkezleme işlemi uygulanacak bir hedef bulunmaz.

[Aksiyom 2]: Eğer `enabled` parametresi `false` olarak ayarlanırsa, modül merkezleme mantığını devre dışı bırakır ve children bileşenleri transform uygulanmadan render edilir.

[Aksiyom 3]: Eğer `shift` parametresi verilmezse, varsayılan olarak `[0, 0, 0]` kullanılır; bu durumda herhangi bir eksende kaydırma uygulanmaz.

[Aksiyom 4]: Eğer `shift` dizisi 3 elemandan farklı uzunlukta sağlanırsa, bu beklenmeyen bir giriş olur ve x, y, z ekseni kaydırma değerlerinin tam olarak karşılanması mümkün olmaz.

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

### [N1_NASIL] AST Pointer: src\components\products\3d\AutoCenter.tsx::AutoCenter
- **params**: ({ children, enabled = true, shift = [0, 0, 0] })
- **ic_degiskenler**:
  - `groupRef` — useRef<Group>(null): Three.js Group nesnesine referans, 3D grubun DOM elementine erişmek için kullanılır
  - `isLocked` — useRef(false): Merkezleme işlemi tamamlandıktan sonra kilitlenme durumunu tutar
  - `frameCount` — useRef(0): Frame sayacını tutar, ilk birkaç frame'i atlamak için kullanılır
- **Dönüş**: JSX elementi (<group ref={groupRef}>{children}</group>)

### [N2_NASIL] AST Pointer: src\components\products\3d\AutoCenter.tsx::useFrame_callback
- **params**: () => { ... }
- **ic_degiskenler**:
  - `box` — new Box3().setFromObject(groupRef.current): Grubun bounding box'ını hesaplar
  - `center` — new Vector3(): Bounding box'ın merkezini tutar
  - `yOffset` — -center.y + shift[1]: Y ekseni için hesaplanan ofset, merkezleme ve shift değerini birleştirir
  - `xOffset` — shift[0]: X ekseni için ofset değeri, shift parametresinden alınır
  - `zOffset` — shift[2]: Z ekseni için ofset değeri, shift parametresinden alınır
- **Dönüş**: yok (yan etki: groupRef.current.position'ı ayarlar, isLocked.current'ı true yapar)

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