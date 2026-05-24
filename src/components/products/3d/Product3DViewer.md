---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx
skeleton_hash: e0b3af0734045fbc
generated_at: 2026-05-23T22:24:08Z
---

## Genel Bakış
Bu modül, üç boyutlu ürün modellerini görüntülemek ve etkileşimli bir şekilde manipüle etmek için bir React bileşeni sağlar. Modelin yüklenmesi, döndürülmesi ve farklı görünüm açılarından incelenmesi gibi işlevleri bir araya getirir; ayrıca beklenmeyen hataların yakalanıp kullanıcıya gösterilmesi için bir hata sınırı bileşeni içerir.

## Fonksiyon Grupları
### Ana Görüntüleme ve Etkileşim
Bileşenin temel görüntüleme ve kullanıcı etkileşimlerini yöneten fonksiyonlar bu grupta yer alır. Ürün modelinin yüklenmesi, sahnenin döndürülmesi ve farklı kamera açısından bakım seçenekleri sağlanır.
- Loader
- ModelRotator
- Product3DViewer
- handleViewChange

### Hata Yönetimi
Bileşenin render sürecinde oluşabilecek istisnaları yakalayıp kullanıcıya anlamlı bir hata mesajı göstermek için tasarlanmış sınıf ve yöntemler bu grupta bulunur. Hata durumunda yedek bir arayüz sunarak uygulamanın çökmesini önler.
- ErrorBoundary (constructor, getDerivedStateFromError, render)

---

## AXIOMS – Mimari Varsayımlar
Modülün doğru çalışması için aşağıdaki varsayımlar gerekir.

[Aksiyom 1]: Eğer Product3DViewer component'ine **slug** prop'u geçilmezse, ürün modeli yüklenemez.  
[Aksiyom 2]: Eğer Product3DViewer component'ine **modelType** prop'u geçilmezse, model tipi belirlenemez.  
[Aksiyom 3]: Eğer Product3DViewer component'ine **onClose** prop'u geçilmezse, kapatma işlevi tanımlı olmaz.  
[Aksiyom 4]: Eğer Product3DViewer component'ine **isFullscreen** prop'u **true** olarak geçilirse, fullscreen modu etkinleştirilir (varsayılan **false** değeri bu davranışı değiştirir).  
[Aksiyom 5]: Eğer ModelRotator component'ine **rotationRef** prop'u geçilmezse veya **rotationRef.current** **null** ise, model döndürülemez.  
[Aksiyom 6]: Eğer ModelRotator component'ine **enabled** prop'u **false** olarak geçilirse, model etkileşimli döndürme devre dışı bırakılır.  
[Aksiyom 7]: Eğer handleViewChange fonksiyonuna **view** parametresi **'front' | 'top' | 'right' | 'back' | 'bottom' | 'left' | 'iso'** dışında bir değer geçilirse, fonksiyonun davranışı belirsizdir.  
[Aksiyom 8]: Eğer ErrorBoundary constructor'ına **t** prop'u (çeviri fonksiyonu) geçilmezse, hata mesajları çevrilemez.  
[Aksiyom 9]: Eğer ErrorBoundary.getDerivedStateFromError fonksiyonuna **error** parametresi **null** geçilirse, hata durumu state'e yansıtılmaz.  
[Aksiyom 10]: Eğer ErrorBoundary.render metodu component state'inde **error** bilgisi yoksa, **children** prop'u render edilir.  
[Aksiyom 11]: Eğer Loader component'i render edilirken bir JSX elementi döndürmezse, UI'de hiçbir şey gösterilmez.

---

## FONKSIYON DETAYLARI

### Loader
**Ne yapar**: Yüklenme durumunu gösteren basit bir bileşen render eder.  
**Nasıl yapar**: Fonksiyon parametre almaz ve doğrudan JSX döndürür; bu JSX, metin stilini ve arka planını tanımlayan bir `<div>` öğesini içerir.  
**Parametreler**:  
- Parametre yok  
**Dönüş**: `<Html center><div className="text-primary-navy font-bold text-sm bg-white/80 px-2 py-1 rounded">…</div>` şeklinde bir JSX elemanı.

### ModelRotator
**Ne yapar**: Verilen çocukları bir THREE.js grup öğesinin içine sararak, bu gruba bir referans bağlar.  
**Nasıl yapar**: `children`, `enabled` ve `rotationRef` özelliklerini alır; `rotationRef` üzerinden grup referansını ayarlar ve ardından `<group ref={rotationRef}>{children}</group>` JSX'ini döndürür.  
**Parametreler**:  
- children: React.ReactNode — Grup içinde render edilecek içerik  
- enabled: boolean — Dönüşümün etkin olup olmadığını belirler (şu anki uygulama doğrudan kullanmıyor olabilir)  
- rotationRef: React.MutableRefObject<THREE.Group | null> — THREE.js grup nesnesine referans tutmak için kullanılan mutable ref  
**Dönüş**: `<group ref={rotationRef}>{children}</group>` JSX elemanı.

### Product3DViewer
**Ne yapar**: Belirtilen ürünün 3D modelini görüntüleyen bir bileşen render eder; tam ekran modu ve kapatma işlevi için props kabul eder.  
**Nasıl yapar**: `slug`, `modelType`, `isFullscreen` (varsayılan false) ve `onClose` props'larını alır; bu bilgilere dayalı olarak 3D görüntüleyiciyi oluşturur ve gerekirse tam ekran veya kapatma kontrollerini sağlar.  
**Parametreler**:  
- slug: string — Görüntülenecek ürünün benzersiz tanımlayıcısı  
- modelType: string — Kullanılacak 3D modelinin türü veya formatı  
- isFullscreen: boolean (varsayılan: false) — Bileşenin tam ekran olarak görüntülenip görüntülenmeyeceği  
- onClose: function — Bileşen kapatıldığında çağrılacak geri çağırım fonksiyonu  
**Dönüş**: `React.FC<Product3DViewerProps>` türünde bir fonksiyon bileşeni.

### handleViewChange
**Ne yapar**: Kamera veya görünüme belirli bir yön (ön, üst, sağ, arka, alt, sol, izometrik) ayarlar.  
**Nasıl yapar**: `view` parametresi olarak kabul edilen litéral birleşim türünden bir değer alır ve bu değere göre iç durum veya görüntüleme matrisini günceller (detaylı uygulama sağlanmadı).  
**Parametreler**:  
- view: 'front' | 'top' | 'right' | 'back' | 'bottom' | 'left' | 'iso' — Uygulanacak görünüme yön  
**Dönüş**: Bilinmiyor (verilen bilgiye göre `void` veya dönüş değeri yoktur).

### constructor (ErrorBoundary.constructor)
**Ne yapar**: `ErrorBoundary` sınıfının örneğini oluşturur ve başlangıç props'larını alır.  
**Nasıl yapar**: `props` nesnesini alır; bu nesne içinde `children` (render edilecek içerik) ve `t` (çeviri işlevi) özelliklerini bulur ve sınıfın durumunu başlatır (detaylı durum başlatma kodu verilmedi).  
**Parametreler**:  
- props: { children: React.ReactNode, t: (key: string) => string } — Bileşenin içeriği ve çeviri fonksiyonu  
**Dönüş**: Bilinmiyor (constructor genellikle `void` döndürür).

### getDerivedStateFromError
**Ne yapar**: Bir hata oluştuğunda `ErrorBoundary` bileşeninin durumunu günceller; hata durumunu göstermek için state'i ayarlar.  
**Nasıl yapar**: Yakalanan `error` nesnesini alır ve `{ hasError: true, error }` şeklinde bir nesne döndürerek React'in bu state'i kullanarak hata UI'sini render etmesini sağlar.  
**Parametreler**:  
- error: Error — Yakalanan hata nesnesi  
**Dönüş**: `{ hasError: true, error }` nesnesi.

### render (ErrorBoundary.render)
**Ne yapar**: Hata yoksa bileşenin çocuklarını render eder; hata durumu varsa bu metot tarafından alternatif UI render edilmez (sağlanan bilgiye göre sadece çocuklar döner).  
**Nasıl yapar**: Bileşenin mevcut `this.props.children` özelliğini döndürür; bu, hata sınırı içinde yer alan içeriği gösterir.  
**Parametreler**:  
- Parametre yok  
**Dönüş**: `this.props.children` (render edilecek çocuk JSX elemanları).

---

## INTERFACES

### Product3DViewerProps
- `slug?: string`
- `modelType?: string`
- `isFullscreen?: boolean`
- `onToggleFullscreen?: () => void`
- `onClose?: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::Loader
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `progress` — useProgress hook'undan alınan 3D model yükleme ilerlemesi yüzdesi
- **Dönüş**: React.JSX.Element

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::ErrorBoundary.constructor
- **params**: { children: React.ReactNode, t: (key: string) => string }
- **ic_degiskenler**:
  - `this.state` — Bileşen hata durumunu tutan state nesnesi, `hasError` (hata varlığı flag'i) ve `error` (oluşan hata nesnesi) alanlarını içerir
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::ErrorBoundary.getDerivedStateFromError
- **params**: { error: Error }
- **ic_degiskenler**:
  - `hasError` — Hata oluştuğunu belirten sabit true değeri
  - `error` — Oluşan orijinal hata nesnesi
- **Dönüş**: { hasError: boolean, error: Error }

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::ErrorBoundary.render
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.state.hasError` — Bileşende hata oluşup oluşmadığını tutan state flag'i
  - `this.props.t` — Çeviri metinlerini getiren i18n fonksiyonu
  - `this.state.error?.message` — Oluşan hatanın kullanıcıya gösterilecek mesajı
  - `this.props.children` — Hata sınırı tarafından sarmalanan alt bileşenler
- **Dönüş**: React.JSX.Element

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::ModelRotator
- **params**: { children: React.ReactNode, enabled: boolean, rotationRef: React.MutableRefObject<THREE.Group | null> }
- **ic_degiskenler**:
  - `gl` — useThree hook'undan alınan Three.js WebGL rendering context nesnesi
  - `camera` — useThree hook'undan alınan Three.js sahne kamera nesnesi
  - `isDragging` — Kullanıcının fare ile sürükleme yapıp yapmadığını izleyen useRef nesnesi
  - `previousMouse` — Son fare tıklama/hareketinden önceki x/y koordinatlarını saklayan useRef nesnesi
  - `canvas` — Three.js tarafından kullanılan DOM canvas elementi
  - `handlePointerDown` — Fare tıklama olayını işleyen, sürüklemeyi başlatan fonksiyon
  - `handlePointerUp` — Fare bırakma olayını işleyen, sürüklemeyi bitiren fonksiyon
  - `handlePointerMove` — Fare hareketi olayını işleyen, serbest döndürmeyi hesaplayan fonksiyon
  - `dx` — Hareket sırasındaki fare x ekseni değişimi
  - `dy` — Hareket sırasındaki fare y ekseni değişimi
  - `speed` — Serbest döndürme hassasiyetini ayarlayan sabit çarpan
  - `camRight` — Kamera'nın dünya koordinat sistemindeki sağ eksen vektörü
  - `camUp` — Kamera'nın dünya koordinat sistemindeki yukarı eksen vektörü
- **Dönüş**: React.JSX.Element

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::Product3DViewer
- **params**: { slug: string, modelType: string, isFullscreen: boolean = false, onClose: () => void }
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu
  - `showGrid, setShowGrid` — Izgara katmanının gösterilip gösterilmeyeceğini yöneten state ve güncelleme fonksiyonu
  - `autoRotate, setAutoRotate` — Modelin otomatik dönme durumunu yöneten state ve güncelleme fonksiyonu
  - `showViewMenu, setShowViewMenu` — Görünüm değiştirme menüsünün açık olup olmadığını yöneten state ve güncelleme fonksiyonu
  - `rotationMode, setRotationMode` — Döndürme modunu (orbit/serbest) yöneten state ve güncelleme fonksiyonu
  - `controlsRef` — OrbitControls bileşenine erişmek için kullanılan useRef nesnesi
  - `modelGroupRef` — 3D modelin ait olduğu THREE.Group nesnesine erişmek için kullanılan useRef nesnesi
  - `tb` — Tam ekran/normal modda toolbar boyut ve stillerini tutan yapılandırma nesnesi
  - `handleReset` — Bileşeni varsayılan ayarlarına sıfırlayan useCallback ile oluşturulmuş fonksiyon
  - `handleViewChange` — Kamera konumunu ön tanımlı görünümlere ayarlayan fonksiyon
  - `handleKeyDown` — Klavye kısayollarını işleyen olay fonksiyonu
  - `placement` — getModelPlacement utility'sinden alınan modelin konum ve rotasyon ayarları
- **Dönüş**: React.JSX.Element

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\Product3DViewer.tsx::handleViewChange
- **params**: { view: 'front' | 'top' | 'right' | 'back' | 'bottom' | 'left' | 'iso' }
- **ic_degiskenler**:
  - `setAutoRotate` — Otomatik dönmeyi kapatan state güncelleme fonksiyonu
  - `setShowViewMenu` — Görünüm menüsünü kapatan state güncelleme fonksiyonu
  - `controlsRef.current` - Aktif OrbitControls nesnesi
  - `modelGroupRef.current` — Modelin bağlı olduğu THREE.Group nesnesi
  - `dist` — Kamera ile model arası sabit mesafe değeri
  - `cam` — OrbitControls tarafından kullanılan kamera nesnesi
- **Dönüş**: yok

---

## Çağrı Haritası

### Disariya Cagrilar (Outgoing)
- **Product3DViewer()** fonksiyonu, görüntü değişikliğini işlemek için **handleViewChange** fonksiyonunu çağırır.

### Disaridan Cagrilanlar (Incoming)
- Veri sağlanmadı; bu modülü dışarıdan çağıran fonksiyon veya dosya belirtilmemiş.

### Ic Ice Fonksiyonlar (Nested)
- Yok

---

## DOSYA-İÇİ ÇAĞRI GRAFİĞİ
  Product3DViewer() → handleViewChange()

```mermaid
graph LR
    Product3DViewer["Product3DViewer()"] --> handleViewChange["handleViewChange()"]
```

---

## NODE ID STANDARD

  file: src\components\products\3d\Product3DViewer.tsx
  function: src\components\products\3d\Product3DViewer.tsx::Loader
  function: src\components\products\3d\Product3DViewer.tsx::ModelRotator
  function: src\components\products\3d\Product3DViewer.tsx::Product3DViewer
  function: src\components\products\3d\Product3DViewer.tsx::handleViewChange
  class: src\components\products\3d\Product3DViewer.tsx::ErrorBoundary

---

## DISA AKTARILANLAR (EXPORTS)
  export: ErrorBoundary
  export: Loader
  export: ModelRotator
  export: Product3DViewer

---

## BILEŞIM (CONTAINS)
  contains: ReactNode
  contains: error: Error | null }>
  contains: t: (key: string) => string }
  contains: { hasError: boolean