---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts
skeleton_hash: 6ce946fde0ea1c53
entity_hashes:
  func:createTimerClock: 1d910dacdf033235
  overview: 187ea45b56401b65
generated_at: 2026-05-28T22:38:50Z
---

## Genel Bakış
VentHub HVAC projesinin 3 boyutlu görselleştirme katmanı için Three.js ile uyumlu yardımcı utility fonksiyonlarını barındıran bu modül, 3B sahnelerde gereken temel yardımcı işlemleri merkezileştirir. Proje genelinde tutarlı 3B araç kullanımı sağlamak amacıyla tasarlanan modül, şu anda zamanlama ve animasyon senkronizasyonu için gerekli bileşenleri sunar.

## Fonksiyon Grupları
### Zamanlama ve Animasyon Yardımcıları
3B sahnedeki animasyonların ve zamanbağımlı işlemlerin senkronize çalışması için gereken özelleştirilmiş saat nesnesini oluşturmakla sorumludur. Three.js'in standart zamanlama yapısını proje ihtiyaçlarına göre sarmalayarak tutarlı zaman yönetimi sağlar.
- createTimerClock

---

## AXIOMS – Mimari Varsayımlar
Bu modül VentHub HVAC projesinin Three.js tabanlı görselleştirme katmanı için zamanlayıcı (kronometre) nesnesi üreten yardımcı fonksiyonlar barındırır, yalnızca projeye entegre Three.js kütüphanesi ve çalışma zamanı zamanlama API'leri erişilebilir olduğunda amaçlandığı şekilde çalışır.

[Aksiyom 1]: Eğer proje bağımlılıklarında Three.js kütüphanesinin Clock sınıfı veya uyumlu zamanlama nesnesi erişilebilir değilse, createTimerClock() fonksiyonu çalışmaz, zamanlayıcı nesnesi oluşturulamaz.
[Aksiyom 2]: Eğer modülün çalıştığı ortamda (tarayıcı/Node.js çalışma zamanı) standart zamanlama API'leri erişilemez durumdaysa, createTimerClock() ile oluşturulan kronometrenin zaman akışı doğru hesaplanamaz, animasyonlar veya zaman tabanlı işlemler düzensiz çalışır.
[Aksiyom 3]: Eğer createTimerClock() fonksiyonu tarafından döndürülen zamanlayıcı nesnesi referansı, bu modülü kullanan bileşende kaydedilmez ve yönetilmezse, kronometre başlatılamaz, durdurulamaz veya sıfırlanamaz, zaman tabanlı tüm görselleştirme işlevleri devre dışı kalır.

---

## FONKSİYON DETAYLARI

### createTimerClock
**Ne yapar**: VentHub HVAC projesinin üç boyutlu görselleştirme modülünde kullanılmak üzere, zaman takibi işlemlerini gerçekleştirebilen özel bir saat nesnesi oluşturur. Bu saat nesnesi, HVAC sistemlerinin simülasyon akışını, cihazların çalışma sürelerini veya 3B ortamdaki animasyonların zamanlamasını yönetmek için tasarlanmıştır.
**Nasıl yapar**: Proje içerisinde three-utils.ts modülünde tanımlı olan özel ClockShim sınıfını örnekleyerek bağımsız bir zamanlayıcı döndürür. Kendi iç zaman sayacını sıfırdan başlatan nesne, harici bir zaman bağımlılığı olmadan proje içindeki tüm zaman ölçüm işlemlerini kendi üzerinde toplar, Three.js orijinal saat nesnesinin eksik kalan özelliklerini tamamlayan ek mantıklarla entegre çalışır.
**Parametreler**: Bu fonksiyon herhangi bir girdi parametresi almaz.
**Dönüş**: ClockShim tipinde bir zamanlayıcı nesnesi döndürür. Bu nesne, Three.js projelerindeki standart Clock sınıfı ile uyumlu çalışan, zaman farkı hesaplama, duraklatma/devam ettirme, toplam çalışma süresini döndürme gibi tüm temel zaman yönetimi özelliklerini barındırır.

---

## INTERFACES

### ClockShim
A THREE.Clock-compatible shim using the modern THREE.Timer. This prevents deprecation warnings from THREE.Clock while maintaining compatibility with @react-three/fiber's state.clock.
- `getDelta: () => number`
- `getElapsedTime: () => number`
- `isClock: boolean`
- `start: () => void`
- `stop: () => void`
- `elapsedTime?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts::createTimerClock
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` — THREE.Timer sınıfından oluşturulmuş temel zamanlayıcı nesnesi, tüm clock metotlarının zaman hesaplamalarında kullanılır
  - `clockShim` — Oluşturulan timer nesnesinin ClockShim tipine dönüştürülmüş hali, react-three/fiber ile uyumlu clock arayüzü sağlamak için genişletilir
  - `clockShim.getDelta` — R3F'nin döngüsünde çağırdığı standart clock metodu, zamanı güncelleyip delta süreyi döndürmek üzere tanımlanır
  - `clockShim.getElapsedTime` — R3F tarafından animasyon süresi hesaplamak için kullanılan standart metot, toplam geçen süreyi döndürmek üzere tanımlanır
  - `clockShim.isClock` — R3F'nün tip kontrollerinde sorun yaşamaması için ayarlanan boolean bayrak, nesnenin clock olarak tanınmasını sağlar
  - `clockShim.elapsedTime` — R3F mantığı ve shader'ları tarafından doğrudan okunmak üzere tanımlanan property, her erişimde güncel toplam geçen süreyi sunar
  - `clockShim.start` — Standart clock başlatma metodu, boş gövde ile gelecekteki kullanımlar için tanımlanır
  - `clockShim.stop` — Standart clock durdurma metodu, boş gövde ile ihtiyaç halinde doldurulmak üzere tanımlanır
- **Dönüş**: ClockShim

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts::createTimerClock.<anonim>.clockShim.getDelta
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` — Üst kapsamdaki THREE.Timer nesnesi, zamanlama işlemlerini yönetir
  - `timer.update()` — Timer'ın zamanını güncellemek için çağrılan metot, her getDelta çağrısında zamanın yenilenmesini sağlar
  - `timer.getDelta()` — Son güncellemeden bu yana geçen süreyi döndüren timer metodu, bu fonksiyonun dönüş değeri olarak kullanılır
- **Dönüş**: number (geçen süre değeri)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts::createTimerClock.<anonim>.clockShim.getElapsedTime
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` — Üst kapsamdaki THREE.Timer nesnesi, zamanlama işlemlerini yönetir
  - `timer.getElapsed()` — Timer'ın başlangıcından bu yana geçen toplam süreyi döndüren metot, bu fonksiyonun dönüş değeri olarak kullanılır
- **Dönüş**: number (toplam geçen süre değeri)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts::createTimerClock.<anonim>.clockShim.elapsedTime.get
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` — Üst kapsamdaki THREE.Timer nesnesi, zamanlama işlemlerini yönetir
  - `timer.getElapsed()` — Timer'ın başlangıcından bu yana geçen toplam süreyi döndüren metot, elapsedTime property'sinin her erişiminde güncel değeri sunmak için kullanılır
- **Dönüş**: number (toplam geçen süre değeri)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts::createTimerClock.<anonim>.clockShim.start
- **params**: (parametre yok)
- **ic_degiskenler**: (yok, boş gövde)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\three-utils.ts::createTimerClock.<anonim>.clockShim.stop
- **params**: (parametre yok)
- **ic_degiskenler**: (yok, boş gövde)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\utils\three-utils.ts
  function: src\utils\three-utils.ts::createTimerClock

---

## DISA AKTARILANLAR (EXPORTS)
  export: ClockShim
  export: createTimerClock