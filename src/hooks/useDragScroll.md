---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts
skeleton_hash: dd772fadde55503c
generated_at: 2026-05-23T22:29:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kullanılmak üzere geliştirilmiş özel bir React kancası (hook) barındırır. Kullanıcıların içerik alanlarını fare veya dokunmatik girişlerle sürükleyerek kaydırmasını sağlayan işlevselliği sunar, uygulama içindeki kaydırılabilir listeler veya görsel paneller gibi alanlarda kullanıcı deneyimini iyileştirir.

## Fonksiyon Grupları
### Sürüklemeli Kaydırma İşlevi Yönetimi
Modüldeki tüm işlevselliği tek başına yöneten ana kanca, kullanıcı sürükleme girişlerini algılar, kaydırma pozisyonunu hesaplar ve ilgili DOM öğesine kaydırma işlemini uygular. Tüm bağımsız iş akışını kendi bünyesinde toplar.
- useDragScroll

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React tabanlı projelerde DOM elemanları üzerinde kullanıcı sürükleme eylemleriyle kaydırma işlevi sunan özel bir React hook'tur, doğru çalışması için React çalışma prensiplerine ve tarayıcı ortam koşullarının tamamının sağlanması zorunludur.

[Aksiyom 1]: Eğer useDragScroll() hook'u React'in hook çağırma kurallarına uymayan bir bağlamda (döngü içi, koşullu ifade içinde, React bileşeni/özel hook dışı bir yerde) çağrılırsa, React çalışma zamanı hatası fırlatır ve hook'un hiçbir işlevi çalışmaz.
[Aksiyom 2]: Eğer hook'un çalıştığı ortamda window, document gibi tarayıcıya özgü global DOM nesneleri mevcut değilse (sunucu tarafı render, Node.js gibi ortamlar), DOM olaylarını dinleyemediği için sürükleme kaydırma işlevi devreye girmez, çalışma zamanı referans hatası oluşur.
[Aksiyom 3]: Eğer hook tarafından scroll işlevinin uygulanacağı hedef kaydırılabilir DOM elemanına erişilemez, null/undefined olarak tespit edilirse, hiçbir elemana kaydırma işlevi eklenemediği için hook amacına ulaşamaz.
[Aksiyom 4]: Eğer çalıştırıldığı tarayıcı mousedown, mousemove, mouseup gibi temel fare etkileşim olaylarını desteklemiyorsa, kullanıcının sürükleme eylemleri algılanamadığı için kaydırma işlevi hiç çalışmaz.
[Aksiyom 5]: Eğer bileşen unmount olduğunda hook tarafından eklenen tüm DOM olay dinleyicilerini temizleyen temizleme fonksiyonu çalışmazsa, bellek sızıntısı oluşur ve uygulamanın genel performansı olumsuz etkilenir.

---

## FONKSIYON DETAYLARI

### useDragScroll
**Ne yapar**: Kaydırılabilir bir konteyner elementine eklendiğinde yatay sürükleerek kaydırma (drag-to-scroll) işlevselliği sağlayan bir callback referansı sunar. Fare etkileşimlerini kullanarak dokunmatik cihazlardaki kaydırma (panning) deneyimini masaüstü ortamında simüle eder, ayrıca sürükleme işlemi sırasında kazara tıklama tetiklenmesini önlemek için bir hareket eşik değeri kullanır.
**Nasıl yapar**: İlgili DOM konteynerine fare basma, fare hareketi ve fare bırakma olaylarını dinleyerek çalışır. Kullanıcı fareyi tıklayıp basılı tuttuğunda başlangıç imleç konumunu ve konteynerin mevcut yatay kaydırma değerini kaydeder. Fare hareket ettikçe başlangıç konumu ile anlık imleç konumu arasındaki farkı hesaplar ve bu farkı kullanarak konteynerin kaydırma konumunu günceller. Tanımlı hareket eşiği aşılmadan gerçekleştirilen kısa tıklama hareketlerinde kazara kaydırma veya tıklama çakışmalarını engelleyen mantık çalıştırır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi kabul etmez.
**Dönüş**: Kaydırılabilir konteyner DOM elementine atanmak üzere tasarlanmış bir callback referansı döndürür. Bu referans, drag-scroll işlevselliğinin ilgili elemente tanımlanmasını sağlar ve tüm fare olay dinleyicilerini işlevselliğin kullanıldığı element ile ilişkilendirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::useDragScroll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cleanupRef` — React useRef hook'u ile oluşturulmuş, önceki event listener temizleme fonksiyonunu saklayan referans, başlangıç değeri null
  - `callbackRef` — React useCallback hook'u ile sarılmış, DOM node'u üzerine drag scroll davranışı ekleyen React ref callback'i
- **Dönüş**: callbackRef (drag scroll davranışı ekleyen ref callback fonksiyonu)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::callbackRef
- **params**: [node: T | null]
- **ic_degiskenler**:
  - `cleanupRef.current` — Daha önce kaydedilmiş temizlik fonksiyonu, mevcutsa çalıştırılıp null olarak ayarlanır
  - `el` — Gelen node'un atandığı yerel değişken, işlenecek DOM elementi olarak kullanılır
  - `isDown` — Fare sol tuşunun basılı olup olmadığını takip eden boolean durum bayrağı
  - `startX` — Başlangıçtaki farenin elemente göre X konumu, scroll kaydırma miktarını hesaplamak için saklanır
  - `scrollLeft` — Başlangıçtaki elementin mevcut scrollLeft değeri, sürükleme sırasında güncel kaydırma konumunu hesaplamak için saklanır
  - `hasDragged` - Kullanıcının sürükleme eşiğini geçip geçmediğini takip eden boolean bayrak, click event'ini engellemek için kullanılır
  - `DRAG_THRESHOLD` — Sürükleme olarak sayılmak için gereken minimum piksel mesafesi, sabit 5 değeri
  - `startClientX` — Başlangıçtaki farenin sayfa üzerindeki mutlak X konumu, sürükleme mesafesini hesaplamak için saklanır
  - `el.style.cursor` — DOM elementinin imleç stilini ayarlamak için kullanılır, grab/grabbing değerleri alır
  - `el.style.touchAction` — Dokunmatik hareket davranışını ayarlamak için kullanılan element stili, pan-x değeri atanır
  - `handleMouseDown` — mousedown event'i için tanımlanan işleyici fonksiyon
  - `handleMouseLeave` — mouseleave event'i için tanımlanan işleyici fonksiyon
  - `handleMouseUp` — mouseup event'i için tanımlanan işleyici fonksiyon
  - `handleMouseMove` — mousemove event'i için tanımlanan işleyici fonksiyon
  - `handleClick` — click event'i için tanımlanan işleyici fonksiyon
  - `window` — Tarayıcı pencere nesnesi, global mouseup event listener'ı eklemek/silmek için kullanılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::handleMouseDown
- **params**: [e: MouseEvent]
- **ic_degiskenler**:
  - `e.button` — Basılan fare tuşunu kontrol etmek için kullanılır, sadece sol tuş (0) işleme alınır
  - `isDown` — Fare basılı durumu true olarak ayarlanır, sürükleme aktif hale gelir
  - `hasDragged` — Yeni tıklama başlangıcında sürükleme bayrağı false olarak sıfırlanır
  - `startClientX` — Tıklama anındaki farenin sayfa X konumu kaydedilir
  - `startX` — Tıklama anındaki farenin elemente göre X konumu kaydedilir
  - `scrollLeft` — Tıklama anındaki elementin mevcut scrollLeft değeri kaydedilir
  - `el.style.cursor` — Sürükleme sırasında 'grabbing' olarak ayarlanır
  - `el.style.userSelect` — Metin seçimini engellemek için 'none' olarak ayarlanır
  - `el.style.scrollBehavior` — Sürükleme sırasında yumuşak kaydırmayı kapatmak için 'auto' olarak ayarlanır
- **Dönüş**: yok (sol tuş harici durumlarda erken return)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::handleMouseLeave
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isDown` — Fare elementten çıkınca basılı durumu false olarak ayarlanır
  - `el.style.cursor` — Normal imleç stiline geri dönmek için 'grab' olarak ayarlanır
  - `el.style.userSelect` — Metin seçimini tekrar açmak için boş string olarak ayarlanır
  - `el.style.scrollBehavior` — Varsayılan kaydırma davranışına geri dönmek için boş string olarak ayarlanır
- **Dönüş**: yok (basılı değilse erken return)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::handleMouseUp
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isDown` — Fare tuşu bırakılınca basılı durumu false olarak ayarlanır
  - `el.style.cursor` — Normal imleç stiline geri dönmek için 'grab' olarak ayarlanır
  - `el.style.userSelect` — Metin seçimini tekrar açmak için boş string olarak ayarlanır
  - `el.style.scrollBehavior` — Varsayılan kaydırma davranışına geri dönmek için boş string olarak ayarlanır
- **Dönüş**: yok (basılı değilse erken return)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::handleMouseMove
- **params**: [e: MouseEvent]
- **ic_degiskenler**:
  - `isDown` — Sadece fare basılıysa işlem yapılır
  - `x` — Mevcut farenin elemente göre X konumu hesaplanır
  - `walk` — Sürükleme mesafesi, 1.5 çarpanı ile ivme eklenerek hesaplanır
  - `distance` — Başlangıçtan bu yana kaydedilen toplam sürükleme mesafesi mutlak değer olarak alınır
  - `DRAG_THRESHOLD` — Mesafe eşik değerini geçerse sürükleme olarak işlem yapılır
  - `hasDragged` — İlk kez eşik geçildiğinde sürükleme bayrağı true olarak ayarlanır
  - `e.preventDefault()` — Varsayılan fare davranışını engeller, seçim vs oluşmasını önler
  - `el.scrollLeft` — Hesaplanan walk değerine göre elementin yatay kaydırma konumu güncellenir
- **Dönüş**: yok (basılı değilse erken return)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::handleClick
- **params**: [e: MouseEvent]
- **ic_degiskenler**:
  - `hasDragged` — Eğer sürükleme yapılmışsa click event'i iptal edilir
  - `e.preventDefault()` — Click'in varsayılan davranışını engeller
  - `e.stopPropagation()` — Click event'inin üst DOM elementlerine yayılmasını durdurur
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useDragScroll.ts::cleanupCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `el.removeEventListener` — Elemente eklenen tüm event listener'ları kaldırır
  - `window.removeEventListener` — Pencereye eklenen mouseup event listener'ını kaldırır
  - `handleMouseDown, handleMouseLeave, handleMouseUp, handleMouseMove, handleClick` — Tüm işleyici fonksiyonları event listener'lardan silmek için kullanılır
  - `window` — Tarayıcı pencere nesnesi, global listener'ı silmek için kullanılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useDragScroll.ts
  function: src\hooks\useDragScroll.ts::useDragScroll

---

## DISA AKTARILANLAR (EXPORTS)
  export: useDragScroll