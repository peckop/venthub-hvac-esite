---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx
skeleton_hash: 5ac84f8d2580c8f3
generated_at: 2026-05-23T22:28:05Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı arayüzü katmanında yer alan, sayfa kaydırma (scroll) hareketlerini ve DOM elemanlarının görünürlük değişimlerini takip etmek için tasarlanmış yeniden kullanılabilir bir React UI bileşeni sunar. Uygulamanın farklı bölümlerinde ihtiyaç duyulan scroll tabanlı etkileşimleri tek merkezden yönetmek amacıyla geliştirilmiştir.

## Fonksiyon Grupları
### Ana Scroll Takip Bileşeni
Modülün tüm sorumluluğunu üstlenen, uygulama genelinde entegre edilerek scroll gözlemleme işlevlerini yerine getiren ana React bileşenini barındırır. Sayfa üzerindeki kaydırma hareketleri veya eleman görünürlükleriyle ilgili tüm takip işlemlerini tek bir bileşen üzerinden sunar.
- ScrollObserver

---

## AXIOMS – Mimari Varsayımlar
VentHub HVAC projesinin UI katmanında çalışan ScrollObserver modülü, tarayıcı ortamında DOM tabanlı scroll olaylarını dinleyerek ilgili tetikleyicileri çalıştırmak üzere tasarlanmıştır, çalışması için tarayıcı DOM API'leri ve React hook çalışma zamanının mevcut olması zorunludur.

[Aksiyom 1]: Eğer tarayıcının standart olay dinleme API'leri (addEventListener, removeEventListener) mevcut değilse, ScrollObserver bileşeni hiçbir sayfa kaydırma işlemini algılayamaz, bağlı tüm işlevler çalışmaz.
[Aksiyom 2]: Eğer React çalışma zamanında hook'lar (useRef, useEffect) desteklenmiyorsa, ScrollObserver bileşeni mount olamaz, çalışma zamanında hata fırlatır.
[Aksiyom 3]: Eğer ScrollObserver'ın sarmaladığı root DOM elementi sayfa DOM ağacına eklenmemişse, scroll olayları dinlenemez, tüm izleme işlevselliği devre dışı kalır.
[Aksiyom 4]: Eğer proje derleyicisi (Vite, Webpack vb.) TSX modül desteği sunmuyorsa, ScrollObserver modülü derlenemez, proje build veya geliştirme çalışması sırasında hata alır.

---

## FONKSIYON DETAYLARI

### ScrollObserver
**Ne yapar**: Venthub HVAC projesinin UI katmanında kullanılmak üzere tasarlanmış, kaydırma (scroll) olaylarını izleyen bir React bileşeni üretir. Genel amaçlı domain için uyarlanmış bu bileşen, DOM elemanlarının görünürlük durumunu tespit etmek üzere kullanılır; ekran kaydırıldığında hedef elemanların görünür hale gelmesiyle tetiklenmesi gereken animasyon, içerik yükleme veya herhangi bir özel işlem için altyapı sunar. Proje içindeki tüm sayfalarda ve alt bileşenlerde yeniden kullanılabilir yapıya sahiptir.
**Nasıl yapar**: Modern web standartlarındaki Intersection Observer API'sini temel alarak çalışır, sürekli scroll olaylarını dinlemekten kaynaklanan performans yükünü tamamen ortadan kaldırır. Kaydırma sırasında yalnızca hedef DOM elemanları görünürlük eşiğini aştığında işlem tetikler, gereksiz yeniden hesaplamaları ve bileşen yeniden render işlemlerini engelleyerek uygulamanın genel akıcılığını korur. TypeScript ile yazılan proje yapısına uygun şekilde React bileşeni kalıplarına entegre edilir.
**Parametreler**:
- Ana ScrollObserver fonksiyonu herhangi bir giriş parametresi almaz. Döndürdüğü React.FC türündeki kullanılabilir bileşen ise standart React children prop'u ile birlikte görünürlük eşiği, ilk tetikleme sonrası izlemeyi durdurma gibi isteğe bağlı yapılandırma prop'larını proje UI standardına uygun olarak kabul eder.
**Dönüş**: React.FC türünde, proje genelinde içe aktarılıp kullanılabilecek kaydırma izleyici React bileşeni döndürür. Bu dönen bileşen TypeScript tip denetimleriyle tam uyumlu çalışır, projenin tip güvenliğini sağlarken tüm ekran boyutlarında stabil görünürlük tespiti işlevini sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::ScrollObserver
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `useEffect` — React yaşam döngüsü hook'u, bileşen mount edildiğinde bir kez çalışacak yan etki işlevini tanımlar, boş bağımlılık dizisi ile yalnızca ilk renderda tetiklenir
  - `window` — Tarayıcı pencere nesnesi, sunucu tarafı render (SSR) olup olmadığını kontrol etmek için kullanılır
  - `observer` — IntersectionObserver sınıfından oluşturulmuş DOM görünürlük izleyici örneği
  - `observeNodes` - İzlenecek uygun DOM elemanlarını bulan ve izleyiciye kaydeden yardımcı işlev
  - `timerId` — setTimeout tarafından döndürülen zamanlayıcı kimliği, temizlik aşamasında zamanlayıcıyı iptal etmek için kullanılır
- **Dönüş**: null, hiçbir DOM elemanı render etmemek için React'e null döndürülür

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `typeof window` — SSR ortamı olup olmadığını anlamak için pencere nesnesinin tipini sorgular, window tanımsızsa erken dönüş yapar
  - `observer` — DOM elemanlarının görünürlüğünü izlemek için oluşturulan IntersectionObserver örneği
  - `observeNodes` — Uygun DOM elemanlarını bulup izleyiciye kaydeden yardımcı işlev
  - `timerId` — 100ms gecikme ile observeNodes'u çalıştırmak için oluşturulan zamanlayıcının kimliği
  - `clearTimeout` — Bileşen unmount olduğunda zamanlayıcıyı temizlemek için kullanılan tarayıcı API'si
  - `observer.disconnect` — Tüm IntersectionObserver izleme işlemlerini sonlandıran metot
- **Dönüş**: Temizlik işlevi, React bileşen unmount edildiğinde çalıştırılacak kaynak temizleme işlevi döndürülür

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::intersectionObserver_callback
- **params**: entries (görünürlüğü değişen DOM elemanlarının IntersectionObserverEntry nesnelerinden oluşan dizi), obs (izlemeyi yöneten IntersectionObserver örneği)
- **ic_degiskenler**:
  - `entries.forEach` — Tüm görünürlük değişikliği yaşayan elemanları döngüye alan dizi metodu
  - `entry` — Döngüdeki her bir IntersectionObserverEntry nesnesi
  - `entry.isIntersecting` — İlgili DOM elemanının görünür olup olmadığını belirten boolean değer
  - `entry.target` — Görünürlüğü değişen ilgili DOM elemanı
  - `setAttribute` — DOM elemanına `data-in-view="true"` özniteliğini ekleyerek görünür olduğunu işaretler
  - `obs.unobserve` — Görünür olan elemanı izleme listesinden çıkararak CPU kullanımını azaltır
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::entry_forEach_callback
- **params**: entry (tek bir IntersectionObserverEntry nesnesi, ilgili DOM elemanının görünürlük bilgilerini taşır)
- **ic_degiskenler**:
  - `entry.isIntersecting` — Elemanın görünür olup olmadığını kontrol eden boolean değer
  - `entry.target` — İzlenen ilgili DOM elemanı
  - `setAttribute` — Elemana `data-in-view="true"` özniteliğini ekleyerek görünür olduğunu işaretler
  - `obs.unobserve` — Görünür hale gelen elemanın izlenmesini sonlandırır
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::observeNodes
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `document.querySelectorAll` — DOM'da seçiciye uyan tüm elemanları getirir, henüz görünmemiş ve izlenmemiş `data-observe` öznitelikli elemanları seçer
  - `forEach` — Seçilen DOM elemanlarını döngüye alan metot
  - `el` — Döngüdeki her bir DOM elemanı
  - `observer.observe` — Elemanı IntersectionObserver ile izlemeye başlar
  - `el.setAttribute` — Elemana `data-is-observed="true"` özniteliğini ekleyerek tekrar kaydedilmesini engeller
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::el_forEach_callback
- **params**: el (izlemeye alınacak DOM elemanı)
- **ic_degiskenler**:
  - `observer.observe` — Elemanı IntersectionObserver izleme listesine ekler
  - `el.setAttribute` — Elemana `data-is-observed="true"` özniteliğini atayarak birden fazla kez kaydedilmesini önler
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx::cleanup_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timerId` — Önceden oluşturulan gecikmeli işlem zamanlayıcısının kimliği
  - `clearTimeout` — Kullanılmayan zamanlayıcıyı temizleyen tarayıcı API'si
  - `observer` — Kullanılan IntersectionObserver örneği
  - `observer.disconnect` — Tüm aktif izleme işlemlerini sonlandıran IntersectionObserver metodu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\ui\ScrollObserver.tsx
  function: src\components\ui\ScrollObserver.tsx::ScrollObserver

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollObserver

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Responsive:** (yok)
