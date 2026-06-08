---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts
skeleton_hash: 453dab1aa88bd1a0
entity_hashes:
  func:useDragScroll: 285567f9f95bbe2e
  overview: 65551040518f5649
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki kaydırılabilir içerik alanları için geliştirilmiş özel bir React kancasıdır. Kullanıcıların fare veya dokunmatik girişlerle sürükleme hareketi yaparak yatay kaydırma gerçekleştirmesini sağlar, böylece ürün listeleri veya görsel galeriler gibi geniş içerik alanlarında doğal bir etkileşim deneyimi sunar.

## Fonksiyon Grupları
### Sürüklemeli Kaydırma İşlevi
Tek bileşenli modülün tüm sorumluluğunu üstlenen ana kancadır. Sürükleme başlangıç noktalarını takip eder, hareket mesafesini hesaplar ve hedef DOM elemanının kaydırma konumunu buna göre günceller.
- `useDragScroll`

---

## AXIOMS – Mimari Varsayımlar

Bu hook parametresiz olarak çağrılmalıdır; hiçbir bağımsız değişken kabul etmez.

[Aksiyom 1]: Eğer `useDragScroll` bir React component içinde调用edilmezse, hook kuralları ihlal edilir ve React zamanlayıcı hatası oluşur.

[Aksiyom 2]: Eğer hook'un döndürdüğü DOM referansı (ref) bir kaydırılabilir DOM öğesine bağlanmazsa, sürükleme kaydırma işlevselliği çalışmaz.

> **Not:** Fonksiyon gövdesi sağlandığında bu aksiyomlar güncellenecektir. Mevcut bilgi sadece fonksiyon imzasına (`useDragScroll()`) dayanmaktadır.

---

## FONKSİYON DETAYLARI

### useDragScroll
**Ne yapar**: Kaydırılabilir bir konteyner elementine eklendiğinde yatay sürükleerek kaydırma (drag-to-scroll) işlevselliği sağlayan bir callback referansı sunar. Fare etkileşimlerini kullanarak dokunmatik cihazlardaki kaydırma (panning) deneyimini masaüstü ortamında simüle eder, ayrıca sürükleme işlemi sırasında kazara tıklama tetiklenmesini önlemek için bir hareket eşik değeri kullanır.
**Nasıl yapar**: İlgili DOM konteynerine fare basma, fare hareketi ve fare bırakma olaylarını dinleyerek çalışır. Kullanıcı fareyi tıklayıp basılı tuttuğunda başlangıç imleç konumunu ve konteynerin mevcut yatay kaydırma değerini kaydeder. Fare hareket ettikçe başlangıç konumu ile anlık imleç konumu arasındaki farkı hesaplar ve bu farkı kullanarak konteynerin kaydırma konumunu günceller. Tanımlı hareket eşiği aşılmadan gerçekleştirilen kısa tıklama hareketlerinde kazara kaydırma veya tıklama çakışmalarını engelleyen mantık çalıştırır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi kabul etmez.
**Dönüş**: Kaydırılabilir konteyner DOM elementine atanmak üzere tasarlanmış bir callback referansı döndürür. Bu referans, drag-scroll işlevselliğinin ilgili elemente tanımlanmasını sağlar ve tüm fare olay dinleyicilerini işlevselliğin kullanıldığı element ile ilişkilendirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: useDragScroll.ts::useDragScroll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cleanupRef` — useRef tarafından yönetilen, temizleme işlevini tutan referans. Mevcut temizleme işlevi varsa çağrılır ve sıfırlanır, yoksa node yoksa çıkılır.
  - `callbackRef` — useCallback ile sarılmış, düğüm referansı alarak sürükleme kaydırma (drag scroll) özelliklerini ayarlayan asıl işlev. Boş bağımlılık dizisi ile sadece bir kez oluşturulur.
- **Dönüş**: callbackRef (React.RefCallback<T>)

### [N1_NASIL] AST Pointer: useDragScroll.ts::(node: T | null) => { ... } (callbackRef içindeki işlev)
- **params**: `node: T | null` — sürükleme kaydırmanın uygulanacağı HTML elementi veya null
- **ic_degiskenler**:
  - `cleanupRef` — outer scope'tan referansla erişilen, temizleme işlevini tutan ref
  - `el` — parametreden gelen node, event listener'ların ekleneceği element
  - `isDown` — mouse basılı durumunu takip eden boolean
  - `startX` — sürükleme başladığında mouse'un sayfadaki X pozisyonu minus elementin offset lefti
  - `scrollLeft` — sürükleme başladığında elementin mevcut scrollLeft değeri
  - `hasDragged` — sürükleme eşiği aşılıp aşılmadığını (sürüklenme olduğunu) gösteren boolean
  - `DRAG_THRESHOLD` — sürüklenme olarak sayılacak minimum piksel mesafesi (5px)
  - `startClientX` — sürükleme başladığında mouse'un sayfadaki pageX değeri
  - `handleMouseDown` — mouse basma olayını yöneten iç işlev
  - `handleMouseLeave` - mouse elementten ayrıldığında çalışan iç işlev
  - `handleMouseUp` - mouse bırakma olayını yöneten (global window'dan dinlenen) iç işlev
  - `handleMouseMove` - mouse hareketini yöneten, kaydırmayı hesaplayan iç işlev
  - `handleClick` - tıklama olayını yöneten, sürükleme sonrası tıklamayı engelleyen iç işlev
- **Dönüş**: yok (yan etki: elemente event listener ekler, temizleme işlevini ref'e kaydeder)

### [N1_NASIL] AST Pointer: useDragScroll.ts::handleMouseDown(e: MouseEvent)
- **params**: `e: MouseEvent` — mouse basma olayı
- **ic_degiskenler**:
  - `e.button` — olayın hangi mouse tuşuyla tetiklendiğini belirtir (0 = sol tuş)
  - `e.pageX` — mouse'un sayfadaki yatay pozisyonu
  - `el` — outer scope'tan referansla erişilen element
  - `isDown`, `hasDragged`, `startClientX`, `startX`, `scrollLeft` — outer scope'tan referansla erişilen değişkenler
- **Dönüş**: yok (yan etki: durum değişkenlerini ayarlar, element stillerini değiştirir)

### [N1_NASIL] AST Pointer: useDragScroll.ts::handleMouseLeave()
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isDown`, `el` — outer scope'tan referansla erişilen değişkenler
- **Dönüş**: yok (yan etki: isDown'ı false yapar, elementin cursor ve userSelect stillerini sıfırlar)

### [N1_NASIL] AST Pointer: useDragScroll.ts::handleMouseUp()
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isDown`, `el` — outer scope'tan referansla erişilen değişkenler
- **Dönüş**: yok (yan etki: isDown'ı false yapar, elementin cursor ve userSelect stillerini sıfırlar)

### [N1_NASIL] AST Pointer: useDragScroll.ts::handleMouseMove(e: MouseEvent)
- **params**: `e: MouseEvent` — mouse hareket olayı
- **ic_degiskenler**:
  - `e.pageX` — mouse'un mevcut sayfadaki yatay pozisyonu
  - `el`, `isDown`, `startX`, `scrollLeft`, `hasDragged`, `startClientX`, `DRAG_THRESHOLD` — outer scope'tan referansla erişilen değişkenler
  - `x` — elementin sol kenarına göre mouse'un yatay pozisyonu (e.pageX - el.offsetLeft)
  - `walk` — kaydırma miktarı (x - startX) çarpanıyla hesaplanır
  - `distance` — sürükleme başlangıcından itibaren yatay mesafe (Math.abs ile mutlak değer)
- **Dönüş**: yok (yan etki: elementin scrollLeft değerini değiştirerek kaydırma yapar, hasDragged ve e.preventDefault ile sürükleme durumunu yönetir)

### [N1_NASIL] AST Pointer: useDragScroll.ts::handleClick(e: MouseEvent)
- **params**: `e: MouseEvent` — tıklama olayı
- **ic_degiskenler**:
  - `hasDragged` — outer scope'tan referansla erişilen, sürükleme olup olmadığını gösteren değişken
- **Dönüş**: yok (yan etki: sürükleme olmuşsa e.preventDefault ve e.stopPropagation ile tıklamayı engeller)

---

## NODE ID STANDARD

  file: src\hooks\useDragScroll.ts
  function: src\hooks\useDragScroll.ts::useDragScroll

---

## DISA AKTARILANLAR (EXPORTS)
  export: useDragScroll