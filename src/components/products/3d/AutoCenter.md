---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\AutoCenter.tsx
skeleton_hash: f3dfc5b0d20062b8
generated_at: 2026-05-23T22:18:25Z
---

## Genel Bakış
Bu modül, üç boyutlu içerikleri belirli bir merkez noktasına hizalamak ve isteğe bağlı olarak kaydırmak için kullanılan bir React bileşeni sağlar. Bileşen, içeriği sarmalayarak etkinleştirildiğinde otomatik ortalama işlevi gerçekleştirirken, kapatıldığında içeriği olduğu gibi bırakır.

## Fonksiyon Grupları
### Ana Bileşen
Bileşen, dışarıdan gelen çocuk öğeleri alıp, etkinleştirme ve kaydırma parametrelerine göre onların konumunu ayarlayan temel işlevi yerine getirir.
- AutoCenter

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer **children** prop'u sağlanmazsa, component hiçbir içerik render etmez.  
[Aksiyom 2]: Eğer **enabled** prop'u açıkça **false** olarak verilmezse (veya verilmezse), varsayılan değer **true** kabul edilir ve component centering etkin olur.  
[Aksiyom 3]: Eğer **shift** prop'u verilmezse, varsayılan değer **[0, 0, 0]** kullanılır ve component hiçbir kaydırma uygulamaz.  
[Aksiyom 4]: Eğer **shift** prop'u **[number, number, number]** formatında bir dizi değilse (örneğin uzunluğu 3 değil veya elemanları sayı değilse), component'in konumlandırma sonucu beklenen gibi olmayabilir.

---

## FONKSIYON DETAYLARI

### AutoCenter
**Ne yapar**: Verilen çocukları otomatik olarak ortalar ve isteğe bağlı olarak manuel bir kaydırma (shift) uygular.  
**Nasıl yapar**: Bileşen, `children` içindeki öğelerin sınırlayıcı kutusunu ölçerek bu kutunun merkezini hesaplar ve gerekli çeviri (translate) dönüşümünü uygular; `enabled` false ise işlem yapmaz ve sadece `shift` değeri eklenir.  
**Parametreler**:
- children: React.ReactNode — Ortalanacak içeriği temsil eden React düğümleri.  
- enabled: boolean — Otomatik merkezleme işlemini etkinleştirip/devre dışı bırakır; varsayılan değer `true`.  
- shift: [number, number, number] — X, Y, Z eksenlerinde uygulanacak ek kaydırma vektörü; varsayılan değer `[0,0,0]`.  
**Dönüş**: React.FC — Ortalanmış ve kaydırılmış `children` içeren bir React elementi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/AutoCenter.tsx::AutoCenter
- **params**: children, enabled, shift
- **ic_degiskenler**: 
  - `groupRef` — REF to THREE.Group for the wrapper group, initialized with useRef(null)
  - `isLocked` — REF boolean flag to lock after first calculation, initialized false
  - `frameCount` — REF numeric frame counter, initialized 0
- **Dönüş**: JSX.Element (returns <group ref={groupRef}>{children}</group>)

### [N2_NASIL] AST Pointer: src/components/products/3d/AutoCenter.tsx::useFrame callback
- **params**: (none)
- **ic_degiskenler**: 
  - `box` — THREE.Box3 instance holding the bounding box of groupRef.current
  - `center` — THREE.Vector3 to store the center of the box
  - `yOffset` — number: vertical offset computed as -center.y + shift[1]
  - `xOffset` — number: horizontal offset from shift[0]
  - `zOffset` — number: depth offset from shift[2]
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\products\3d\AutoCenter.tsx
  function: src\components\products\3d\AutoCenter.tsx::AutoCenter

---

## DISA AKTARILANLAR (EXPORTS)
  export: AutoCenter