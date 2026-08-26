---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\hooks\useDragScroll.ts
skeleton_hash: f543371fbdfe6cc5
entity_hashes:
  func:useDragScroll: 285567f9f95bbe2e
  overview: 65551040518f5649
generated_at: 2026-08-25T07:27:13Z
---

## Genel Bakış

Bu modül, sürükleme tabanlı kaydırma (drag scroll) işlevselliği sağlayan bir React hook'u içerir. Modül, `useDragScroll` adında tek bir dışa aktarılan fonksiyondan oluşur. Modülün amacı, kullanıcıların fare veya dokunma hareketleriyle içerik kaydırma işlemini gerçekleştirmesini sağlamaktır.

## Fonksiyon Grupları

### Ana Hook

Modülün tek ve ana fonksiyonudur. Sürükleme ile kaydırma davranışını yöneten bir React hook'u olarak tanımlanmıştır.

- useDragScroll

---

**Not:** Kaynak kodu incelenmediğinden, fonksiyonun döndürdüğü değerler, kabul ettiği parametreler ve iç işleyişi hakkında detaylı bilgi verilememektedir. Detaylı bilgi için kaynak dosyanın incelenmesi gerekir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, `useDragScroll` fonksiyonunun çalışma koşulları, bağımlılıkları ve davranışları hakkında fonksiyon gövdesine dayalı bir çıkarım yapılamamaktadır.

---

## FONKSİYON DETAYLARI

### useDragScroll
**Ne yapar**: Bir kapsayıcı öğeye yatay sürükleme ile kaydırma (drag-to-scroll) işlevselliği sağlayan bir callback ref döndürür. Fare olaylarını yöneterek dokunmatik ekran benzeri kaydırma deneyimi simüle eder ve sürükleme sırasında kazara tıklamaları önlemek için bir eşik (threshold) mekanizması içerir.

**Nasıl yapar**: Fonksiyon, React'in `useRef` ve `useCallback` hook'larını kullanarak bir callback ref oluşturur. Bu callback ref, DOM öğesine bağlandığında (`node` parametresi null değilse) fare olaylarını dinlemeye başlar. Fare aşağısına basıldığında (`mousedown`) sürükleme durumu başlatılır ve başlangıç pozisyonu kaydedilir. Fare hareket ettikçe (`mousemove`), basılı tutuluyorsa ve belirlenen eşik değeri (`DRAG_THRESHOLD = 5` piksel) aşılmışsa, öğenin `scrollLeft` değeri güncellenerek yatay kaydırma gerçekleştirilir. Kaydırma hızı, hareket miktarının 1.5 katı ile çarpılarak ayarlanır. Eşik değeri aşıldığında `hasDragged` bayrağı true yapılır ve bu durumda `click` olayı engellenerek kazara tıklamalar önlenir. Fare bırakıldığında (`mouseup`) veya öğeden çıktığında (`mouseleave`) sürükleme durumu sıfırlanır ve stiller eski haline döner. Fonksiyon, her yeni `node` bağlandığında önceki olay dinleyicilerini temizleyerek bellek sızıntısını önler. `cleanupRef` kullanılarak bileşenUnmount olduğunda veya yeni bir öğe bağlandığında tüm olay dinleyicileri kaldırılır.

**Parametreler**:
- Fonksiyon parametre almaz. Ancak döndürülen callback ref'in generic tipi `T extends HTMLElement = HTMLDivElement` ile belirlenir; bu, ref'in varsayılan olarak `HTMLDivElement` öğelerine atanacağını, ancak `HTMLElement`'i genişleten herhangi bir öğe tipiyle de kullanılabileceğini gösterir.

**Dönüş**: `T` tipindeki bir DOM öğesine atanabilen bir callback ref döndürür. Bu ref, `useCallback` ile sarılmış olup bağımlılık dizisi boş (`[]`) olduğundan sadece bir kez oluşturulur. Ref, öğeye bağlandığında sürükleme olay dinleyicilerini ekler, null olarak çağrıldığında (örneğin öğe DOM'dan kaldırıldığında) ise mevcut temizleme fonksiyonunu çalıştırarak tüm olay dinleyicilerini kaldırır.

---

## İTHALATLAR (IMPORTS)
- import: react::useCallback
- import: react::useRef

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useDragScroll.ts::useDragScroll
- **params**: ()
- **ic_degiskenler**:
  - `cleanupRef` — useRef ile oluşturulmuş ref; önceki bağlanmış DOM node'un temizleme fonksiyonunu saklar, yeni bağlama yapıldığında eski temizleme çalıştırılır
  - `callbackRef` — useCallback ile oluşturulmuş, bağımlılık dizisi boş []; DOM node'u bağlandığında sürükleme olaylarını ekleyen ref callback fonksiyonu
- **Dönüş**: callbackRef (ref callback fonksiyonu)

### [N2_NASIL] AST Pointer: src/hooks/useDragScroll.ts::callbackRef (useCallback içindeki fonksiyon)
- **params**: `node: T | null` — bağlanan DOM elementi veya null
- **ic_degiskenler**:
  - `el` — node parametresinin kendisi; üzerinde stil değişiklikleri yapılan ve olay dinleyicileri eklenen DOM elementi
  - `isDown` — boolean; fare tuşunun basılı olup olmadığını izler, sürükleme sırasında true olur
  - `startX` — number; sürükleme başlangıcında `e.pageX - el.offsetLeft` hesaplanan X pozisyonu
  - `scrollLeft` — number; sürükleme başlangıcındaki `el.scrollLeft` değeri
  - `hasDragged` — boolean; sürükleme eşik değerini aşıp aşmadığını izler, click olayını engellemek için kullanılır
  - `DRAG_THRESHOLD` — sabit 5; sürükleme sayılması için gereken minimum piksel mesafesi
  - `startClientX` — number; fare tıklama başlangıcındaki `e.pageX` değeri, eşik kontrolü için kullanılır
  - `handleMouseDown` — mousedown olay yöneticisi; sürükleme durumunu başlatır, stilleri günceller
  - `handleMouseLeave` — mouseleave olay yöneticisi; fare elementten çıkarsa sürükleme durumunu sıfırlar
  - `handleMouseUp` — mouseup olay yöneticisi; fare tuşu bırakıldığında sürükleme durumunu sıfırlar
  - `handleMouseMove` — mousemove olay yöneticisi; sürükleme sırasında scrollLeft hesaplar ve uygular
  - `handleClick` — click olay yöneticisi (capture: true); sürükleme gerçekleştiyse click'i engeller
- **Dönüş**: yok (undefined)

### [N3_NASIL] AST Pointer: src/hooks/useDragScroll.ts::handleMouseDown
- **params**: `e: MouseEvent` — fare tıklama olayı
- **ic_degiskenler**: yok (dış scope değişkenlerini kullanır: isDown, hasDragged, startClientX, startX, scrollLeft, el)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/hooks/useDragScroll.ts::handleMouseLeave
- **params**: ()
- **ic_degiskenler**: yok (dış scope değişkenlerini kullanır: isDown, el)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/hooks/useDragScroll.ts::handleMouseUp
- **params**: ()
- **ic_degiskenler**: yok (dış scope değişkenlerini kullanır: isDown, el)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/hooks/useDragScroll.ts::handleMouseMove
- **params**: `e: MouseEvent` — fare hareket olayı
- **ic_degiskenler**:
  - `x` — `e.pageX - el.offsetLeft` hesaplanan güncel fare X pozisyonu
  - `walk` — `(x - startX) * 1.5` hesaplanan kaydırma mesafesi, 1.5x çarpanıyla
  - `distance` — `Math.abs(e.pageX - startClientX)` hesaplanan fare hareket mesafesi, eşik kontrolü için
- **Dönüş**: yok (dış scope değişkenlerini kullanır: isDown, startX, startClientX, DRAG_THRESHOLD, hasDragged, scrollLeft, el)

### [N7_NASIL] AST Pointer: src/hooks/useDragScroll.ts::handleClick
- **params**: `e: MouseEvent` — click olayı
- **ic_degiskenler**: yok (dış scope değişkenini kullanır: hasDragged)
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/hooks/useDragScroll.ts::cleanupRef.current (temizleme fonksiyonu)
- **params**: ()
- **ic_degiskenler**: yok (dış scope değişkenlerini kullanır: el, handleMouseDown, handleMouseUp, handleMouseLeave, handleMouseMove, handleClick)
- **Dönüş**: yok; tüm olay dinleyicilerini (mousedown, mouseup, mouseleave, mousemove, click) kaldırır

---

## NODE ID STANDARD

  file: useDragScroll.ts
  function: useDragScroll.ts::useDragScroll

---

## DISA AKTARILANLAR (EXPORTS)
  export: useDragScroll