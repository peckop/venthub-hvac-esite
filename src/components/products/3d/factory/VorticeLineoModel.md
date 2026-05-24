---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\VorticeLineoModel.tsx
skeleton_hash: 44b4850e8bddb8bf
generated_at: 2026-05-23T22:20:20Z
---

## Genel Bakış
VorticeLineoModel, Vortice Lineo ürününün üç boyutlu görselleştirmesini sağlayan bir React bileşenidir. Bileşen, parçaların patlama efekti, seçimi, izolasyonu ve tıklama olaylarını yöneterek kullanıcı etkileşimini mümkün kılar.

## Fonksiyon Grupları
### Ana Render ve Etkileşim
Bileşen, 3D modeli çizmek, patlama düzeyini ayarlamak, seçilen ve izole edilen parçaları takip etmek ve parçalara tıklandığında dışarıya geri bildirim vermekten sorumludur.
- VorticeLineoModel

---

## AXIOMS – Mimari Varsayımlar
VorticeLineoModel componentinin beklendiği gibi çalışabilmesi için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer explode prop'u sağlanmazsa, varsayılan değer 0 kullanılır ve model patlama efekti gösterilmez.  
[Aksiyom 2]: Eğer onPartClick prop'u tanımlanmazsa, bir parçaya tıklandığında hiçbir işlem gerçekleşmez.  
[Aksiyom 3]: Eğer selectedPart prop'u tanımlanmazsa, hiçbir parça seçili olarak işaretlenmez.  
[Aksiyom 4]: Eğer isolatedPart prop'u tanımlanmazsa, hiçbir parça izole edilmez.

---

## FONKSIYON DETAYLARI

### VorticeLineoModel
**Ne yapar**: Vortice Lineo 100 fanının yüksek fidelite 3D montajını render eden bir React bileşeni döndürür; gövde, kolluklar, terminal kutusu ve impeller gibi profesyonel geometrileri birleştirir.  
**Nasıl yapar**: Props üzerinden alınan `explode`, `onPartClick`, `selectedPart`, `isolatedPart` ve `hiddenParts` değerlerini kullanarak her bir parça'nın görünürlüğünü, vurgulanmasını ve etkileşimini ayarlar; içsel olarak alt bileşenleri (ör. Housing, Clamp, TerminalBox, Impeller) monte eder ve gerektiğinde patlama efekti uygular.  
**Parametreler**:
- explode: number — Modelin parçalarının ne kadar ayrıştırılacağını belirleyen sayı; 0 değeri tam montajı gösterir.  
- onPartClick: (partName: string) => void — Kullanıcı bir parça üzerine tıkladığında çağrılan geri çağırım fonksiyonu; tıklanan parçanın adı string olarak geçirilir.  
- selectedPart: string | null — Şu anda seçili parça adı; null ise hiçbir parça seçili değildir.  
- isolatedPart: string | null — İzole edilmek istenen parça adı; null ise izolasyon uygulanmaz.  
- hiddenParts: string[] — Görünmez tutulacak parçaların adı listesi; bu listedeki parçalar render edilmez.  
**Dönüş**: React.FC — Props'u kabul eden ve Vortice Lineo 100 fanının 3D modelini render eden bir fonksiyonel React bileşeni.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\VorticeLineoModel.tsx::VorticeLineoModel
- **params**: explode (number, varsayılan 0), onPartClick ((partName: string) => void | undefined), selectedPart (string | null | undefined), isolatedPart (string | null | undefined), hiddenParts (string[] | undefined, varsayılan [])
- **ic_degiskenler**:
  - `blueprint` — modelin yapılandırma nesnesi; slug, scale ve parçalar (Chassis, Clamps, Details, Rotor) içeren dizi; her parça için component, position ve rotation bilgileri içerir; <Assembler> tarafından 3D sahneyi oluşturmak için kullanılır.
- **Dönüş**: React elementi (JSX) – <group> içinde sarmalanmış <Assembler> bileşeni, Vortice Lineo modelini render eder.

---

## NODE ID STANDARD

  file: src\components\products\3d\factory\VorticeLineoModel.tsx
  function: src\components\products\3d\factory\VorticeLineoModel.tsx::VorticeLineoModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: VorticeLineoModel