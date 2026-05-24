---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\authority\ThreeDAuthority.tsx
skeleton_hash: 5889f50b0077d368
generated_at: 2026-05-23T22:01:08Z
---

## Genel Bakış
Bu modül, bir 3‑boyutlu modelin görselleştirilmesi ve ona ait etkileşimli noktaların (hotspot) yönetimi için iki işlevselliği birleştirir. `ThreeDAuthority` bileşeni dışarıdan gelen veri paketini alır ve içindeki `Model` bileşenine yönlendirerek model yükleme ve hotspot gösterimini tek bir yerde sağlar.

## Fonksiyon Grupları
### Model Render ve Hotspot Yönetimi  
Model işlevi, verilen URL’den 3‑boyutlu sahneyi yükler, mevcut hotspot verilerini alır ve bu noktaları sahne içinde etkileşimli işaretçiler olarak ekler.  
- Model

### Üst‑Seviye Yetki ve Veri Bağlama  
ThreeDAuthority işlevi, dışarıdan gelen metadata (model URL’si ve hotspot tanımları) ve isteğe bağlı CSS sınıfını alır, bu bilgileri Model bileşenine aktararak bütünleşik bir 3‑D yetki görüntüsü oluşturur.  
- ThreeDAuthority

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için aşağıdaki varsayımlar geçerlidir:

[Aksiyom 1]: Eğer Model bileşenine `url` prop'u string olarak verilmezse, 3B model yüklenemez ve render hatası oluşur.  
[Aksiyom 2]: Eğer Model bileşenine `hotspots` prop'u verilmişse ama onun tipi `ThreeDMetadata['hotspots']` ile uyuşmuyorsa, hotspot işaretçileri doğru oluşturulamaz veya çalışma zamanı hatası olur.  
[Aksiyom 3]: Eğer ThreeDAuthority bileşenine `metadata` prop'u verilmezse veya `metadata.url` eksikse, Model bileşenine geçirilen `url` tanımsız olur ve model yüklenemez.  
[Aksiyom 4]: Eğer ThreeDAuthority bileşenine `metadata` prop'u verilmezse veya `metadata.hotspots` eksikse, Model bileşenine geçirilen `hotspots` tanımsız olur ve hotspot renderı atlanabilir veya hata verir.  
[Aksiyom 5]: Eğer ThreeDAuthority bileşenine `className` prop'u string olmayan bir değer verilirse, CSS sınıfı uygulanamaz ve olası bir type hatası oluşur.

---

## FONKSIYON DETAYLARI

### Model
**Ne yapar**: Verilen `url` ve opsiyonel `hotspots` ile bir 3D modeli render eder.  
**Nasıl yapar**: `url` parametresi kullanılarak model yüklenir; `hotspots` sağlanmışsa model üzerine bu noktalar eklenir (detaylı yükleme mantığı kaynak kodunda bulunur).  
**Parametreler**:
- `url`: string — render edilecek 3D modelinin adresi (GLB/GLTF formatında).  
- `hotspots`: ThreeDMetadata['hotspots']? — model üzerine eklemek isteğe bağlı etkileşim noktaları listesi; tanımlanmazsa hiçbir hotspot eklenmez.  
**Dönüş**: void — fonksiyon JSX elementi döndürür, açık bir değer döndürmez.

### ThreeDAuthority
**Ne yapar**: Gerçek 3D ürün modellerini (GLB/GLTF) interaktif olarak render eder ve performansı artırmak için “Click‑to‑Load” stratejisini kullanır.  
**Nasıl yapar**: `metadata` prop’undan model URL ve hotspots bilgilerini çıkarır, bu bilgileri `Model` component’ına geçirir; `className` prop’sı kök elemana uygulanarak ek stillendirme mümkün olur.  
**Parametreler**:
- `metadata`: ThreeDAuthorityProps — modelin URL ve opsiyonel hotspots gibi tüm gerekli veri yapısını içerir.  
- `className`: string — komponentin kök elemanına eklenmek istenen ek CSS sınıfı; varsayılan değer boş string ('').  
**Dönüş**: void — fonksiyon JSX elementi döndürür, açık bir değer döndürmez.

---

## INTERFACES

### ThreeDAuthorityProps
- `metadata: ThreeDMetadata`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/authority/ThreeDAuthority.tsx::Model
- **params**: url, hotspots
- **ic_degiskenler**:
  - `url` — string prop providing the GLTF model URL
  - `hotspots` — optional array of hotspot metadata objects
  - `scene` — GLTF scene object returned by `useGLTF(url)`
  - `spot` — current hotspot element from `.map` iteration
  - `idx` — index of the current hotspot in the array
- **Dönüş**: JSX element (React fragment) representing the 3D model with its hotspots

### [N2_NASIL] AST Pointer: src/components/authority/ThreeDAuthority.tsx::ThreeDAuthority
- **params**: metadata, className
- **ic_degiskenler**:
  - `metadata` — prop object containing `modelUrl`, `hotspots`, and `config`
  - `className` — optional CSS class string (defaults to empty string)
  - `isStarted` — boolean state flag indicating whether the 3D engine has been initialized
  - `setIsStarted` — state setter function used to set `isStarted` to true
- **Dönüş**: JSX element (`motion.div`) rendering either the initialization placeholder or the full 3D canvas with model, lights, controls, and overlay.

---

## NODE ID STANDARD

  file: src\components\authority\ThreeDAuthority.tsx
  function: src\components\authority\ThreeDAuthority.tsx::Model
  function: src\components\authority\ThreeDAuthority.tsx::ThreeDAuthority

---

## DISA AKTARILANLAR (EXPORTS)
  export: Model
  export: ThreeDAuthority