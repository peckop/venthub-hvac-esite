---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\core\ContextLossRecovery.tsx
skeleton_hash: fc59270232a8dc42
entity_hashes:
  func:ContextLossRecovery: 4d21632035775208
  overview: 8a94f0c75220a1b4
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:05:32Z
---

## Genel Bakış

Bu modül, 3D ürünlerin çekirdek katmanında yer alan bir React bileşenidir. Modülün adı, WebGL veya benzeri bir grafik bağlamının kaybı durumunda kurtarma mantığını ele aldığını gösterir. Kaynak kodu incelenmediğinden, bileşenin dahili çalışma detayları ve alt bileşenlerle etkileşimi bilinmiyor.

## Fonksiyon Grupları

### Ana Bileşen
Modülde yalnızca tek bir dışa aktarılan fonksiyon bulunmaktadır. Bu fonksiyon, bileşenin kendisini temsil eder ve bağlam kaybı senaryosunda kullanıcıya geri bildirim veya otomatik kurtarma davranışı sunar.

- ContextLossRecovery

## Notlar

Kaynak kodu verilmediğinden fonksiyonlar arası çağrı ilişkileri, iç/dış bağımlılıklar, dinamik yüklenen modüller ve alt fonksiyonlar hakkında bilgi verilememektedir. Modülün tam mimari rolünü anlamak için kaynak dosyanın incelenmesi gerekir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, `ContextLossRecovery` bileşeninin doğru çalışması için hangi koşulların var olması gerektiği belirlenememektedir. Yalnızca fonksiyon imzası (`ContextLossRecovery()` — parametresiz, varsayılan değer yok) bilinmektedir. Gövde verilmeden aksiyom üretmek, kaynağın söylemediği bilgiyi uydurmak anlamına gelir.

---

## FONKSİYON DETAYLARI

### ContextLossRecovery
**Ne yapar**: WebGL context kaybı durumunda (GPU reset, bellek sorunları veya Safari'nin context-limiti nedeniyle) sayfanın çökmesini önleyen bir kurtarma bileşenidir. `webglcontextlost` olayında `preventDefault` çağırarak tarayıcının WebGL context'ini tamamen terk etmesini engeller; `webglcontextrestored` olayında ise `invalidate` ile Three.js sahnesinin yeniden çizilmesini tetikler.

**Nasıl yapar**: `useThree` hook'u aracılığıyla mevcut WebGL renderer (`gl`) ve yeniden çizim tetikleyicisi (`invalidate`) referanslarını alır. `useEffect` içinde canvas elementine iki olay dinleyicisi ekler: `webglcontextlost` dinleyicisi, olay nesnesi üzerinde `event.preventDefault()` çağırarak tarayıcının context kaybını "pes et" olarak yorumlamasını engeller; `webglcontextrestored` dinleyicisi ise `invalidate()` çağırarak Three.js'in sahneyi yeniden çizmesini sağlar. Bileşen kaldırıldığında veya `gl`/`invalidate` değişkenleri değiştiğinde, cleanup fonksiyonu ile her iki olay dinleyicisi canvas elementinden kaldırılır. Bileşen herhangi bir görsel öğe oluşturmaz, yalnızca `null` döndürür.

**Parametreler**:
- Bu fonksiyon parametre almaz. React fonksiyonel bileşeni olarak çalışır ve gerekli bağımlılıkları `useThree` hook'undan elde eder.

**Dönüş**: `null` — Bileşen herhangi bir JSX öğesi oluşturmaz; yalnızca yan etki (side effect) olarak olay dinleyicilerini yönetir.

---

## İTHALATLAR (IMPORTS)
- import: @react-three/fiber::useThree
- import: react::useEffect

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ContextLossRecovery.tsx::ContextLossRecovery
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `gl` — `useThree((s) => s.gl)` ile alınan WebGL renderer nesnesi; canvas elementine erişimde kullanılır
  - `invalidate` — `useThree((s) => s.invalidate)` ile alınan sahne invalidasyon fonksiyonu; context restore edildiğinde çağrılır
- **Dönüş**: `null` (JSX döndürmez, yalnızca yan etki olarak event listener ekler)

### [N2_NASIL] AST Pointer: ContextLossRecovery.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `canvas` — `gl.domElement` ile alınan HTML canvas elementi; webglcontextlost ve webglcontextrestored event'lerinin ekleneceği hedef
  - `handleLost` — `webglcontextlost` event handler'ı; `event.preventDefault()` çağırarak context kaybının varsayılan davranışını engeller
  - `handleRestored` — `webglcontextrestored` event handler'ı; `invalidate()` çağırarak sahneyi yeniden çizdirir
- **Dönüş**: cleanup fonksiyonu — `canvas.removeEventListener` ile `webglcontextlost` ve `webglcontextrestored` listener'larını kaldırır

### [N3_NASIL] AST Pointer: ContextLossRecovery.tsx::handleLost
- **params**: `event: Event` — yakalanan webglcontextlost olay nesnesi
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok (void)

### [N4_NASIL] AST Pointer: ContextLossRecovery.tsx::handleRestored
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok (void)

### [N5_NASIL] AST Pointer: ContextLossRecovery.tsx::cleanup fonksiyonu
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok; dış kapsamdan `canvas` ve `handleLost`, `handleRestored` kullanılır)
- **Dönüş**: yok (void)

---

## NODE ID STANDARD

  file: src\components\products\3d\core\ContextLossRecovery.tsx
  function: src\components\products\3d\core\ContextLossRecovery.tsx::ContextLossRecovery

---

## DISA AKTARILANLAR (EXPORTS)
  export: ContextLossRecovery

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