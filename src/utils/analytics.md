---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\analytics.ts
skeleton_hash: 850bc2150819ea68
entity_hashes:
  func:trackEvent: a39f838e00080681
  overview: 6ae77f9a934c8a05
generated_at: 2026-05-28T22:38:59Z
---

## Genel Bakış
VentHub HVAC projesindeki analiz utility modülüdür. Tek bir merkezi fonksiyonla tüm uygulama içi olayların harici analiz servislerine veya geliştirme modunda konsola kaydedilmesini sağlar.

## Fonksiyon Grupları
### Olay Takibi
Uygulamadaki tüm analiz olaylarını standart bir arayüz üzerinden harici servislere veya konsola yönlendirerek merkezi veri toplama sorumluluğunu üstlenir.
- trackEvent

---



---

## FONKSİYON DETAYLARI

### trackEvent
**Ne yapar**: Bu fonksiyon, bir analitik (analytics) olayını güvenli bir şekilde izlemeyi sağlar. Görevi, belirtilen olay adı ve ilişkili parametreleri, mevcut bir analitik servisine (Google Analytics 4 veya Google Tag Manager) iletir. Eğer böyle bir servis yoksa sessizce işlevsiz kalır veya geliştirme ortamında bir log mesajı basarak hata vermeden çalışmaya devam eder.

**Nasıl yapar**: Fonksiyon首先, tarayıcı ortamında olup olmadığını kontrol eder. Ardından, `window.gtag` fonksiyonunun varlığına bakarak GA4'e, yoksa `window.dataLayer` dizisinin varlığına bakarak GTM'ye olayı göndermeyi dener. Herhangi bir servise olay iletilememişse ve ortam geliştirme (development) modundaysa, `DEBUG_ANALYTICS` bayrağı aktifse konsola bilgilendirici bir uyarı loglar. Tüm işlem bir `try-catch` bloğu içinde gerçekleşir; olası analitik hataları yakalanarak ana uygulamanın çökmesi engellenir.

**Parametreler**:
- `name`: `string` — İzlenecek olayın adıdır. Örneğin 'add_to_cart', 'page_view' gibi bir string olmalıdır.
- `params`: `Record<string, unknown>` — Olaya ilişkilendirilecek ek parametreler veya meta verileri temsil eder. Nesne formatındadır ve fonksiyon çağrısında belirtilmezse boş bir nesne (`{}`) olarak atanır.

**Dönüş**: Fonksiyon herhangi bir değer dönmez (`void`). Sadece bir yan etki (analitik servise olay gönderme veya konsola log yazma) oluşturur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/analytics.ts::trackEvent
- **params**: 
  - `name: string` - Takip edilecek analitik olayının benzersiz ismi
  - `params: Record<string, unknown>` - Olayla ilişkili ek verileri içeren nesne, varsayılan olarak boş nesne atanır
- **ic_degiskenler**:
  - `delivered` - Analitik olayın gtag veya dataLayer takip sistemlerinden herhangi birine başarıyla iletilip iletilmediğini takip eden boolean bayrak
  - `typeof window` - Kodun sunucu tarafında mı çalıştığını tespit etmek için tarayıcı pencere nesnesinin varlığını kontrol eden ifade
  - `window.gtag` - Google Analytics entegrasyonu varsa mevcut olan global gtag fonksiyonu, olay göndermek için çalıştırılır
  - `window.dataLayer` - Google Tag Manager entegrasyonu varsa mevcut olan global veri dizisi, gtag mevcut değilse olay bu diziye eklenir
  - `window.DEBUG_ANALYTICS` - Analitik olaylarının konsola loglanıp loglanmayacağını kontrol eden global boolean bayrak
  - `process.env.NODE_ENV` - Uygulamanın çalışma ortamını (geliştirme/üretim) belirten ortam değişkeni, geliştirme ortamında düşük iletilen olaylar için ek loglama yapılır
  - `console.warn` - Tarayıcı konsoluna uyarı logu yazdırmak için kullanılan API, debug modunda olay detaylarını yazdırır
- **Dönüş**: yok (void), herhangi bir değer döndürmez, sadece yan etki olarak analitik olayları gönderir, loglar; oluşan hataları yutarak uygulamanın çökmesini engeller

---

## NODE ID STANDARD

  file: src\utils\analytics.ts
  function: src\utils\analytics.ts::trackEvent

---

## DISA AKTARILANLAR (EXPORTS)
  export: trackEvent