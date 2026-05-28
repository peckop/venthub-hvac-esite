---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\applicationLinks.ts
skeleton_hash: a3f89a40a70ad803
generated_at: 2026-05-23T22:33:23Z
---

## Genel Bakış
VentHub HVAC projesinin utility modüllerinden biri olan applicationLinks.ts, uygulama içi bağlantı üretimi ve standartlaştırılması işlemlerini üstlenir. Proje genelinde tutarlı URL formatlarının kullanılmasını sağlamak amacıyla konu etiketlerinden kategori sayfalarına yönlendiren geçerli bağlantılar oluşturmak için tasarlanmıştır.

## Fonksiyon Grupları
### Kategori URL Oluşturma İşlevleri
Konu (topic) kimliklerini işleyerek ilgili kategori sayfalarının erişilebilir uygulama içi bağlantılarını üretmekle sorumludur.
- getCategoryUrlFromTopic

---

## AXIOMS – Mimari Varsayımlar
Bu modül, konu (topic) slug'larını kategori URL'lerine eşlemek için sabit bir eşleşme tablosu kullanır, tüm işlevselliği bu eşleşme tablosunun ve giriş parametrelerinin geçerliliğine bağlıdır.

[Aksiyom 1]: Eğer TOPIC_TO_CATEGORY_URL sabiti tanımlı ve erişilebilir değilse, getCategoryUrlFromTopic fonksiyonu hiçbir şekilde geçerli kategori URL'si döndüremez, tüm konu kaynaklı uygulama içi linkler çalışmaz.
[Aksiyom 2]: Eğer getCategoryUrlFromTopic fonksiyonuna gönderilen topicSlug parametresi string türünde değilse, nesne anahtarı olarak kullanılamaz, fonksiyon çalışma zamanı hatası fırlatır.
[Aksiyom 3]: Eğer işleme alınan topicSlug string değeri, TOPIC_TO_CATEGORY_URL nesnesinde tanımlı anahtarlar arasında mevcut değilse, getCategoryUrlFromTopic fonksiyonu geçersiz veya tanımsız değer döndürür, ilgili link yönlendirmeleri başarısız olur.
[Aksiyom 4]: Eğer TOPIC_TO_CATEGORY_URL nesnesinde tutulan kategori URL değerleri geçerli URL formatına sahip değilse, döndürülen linkler hedef sayfalara yönlendirme yapamaz, kullanıcı deneyimini ve uygulama kararlılığını bozar.

---

## FONKSIYON DETAYLARI

### getCategoryUrlFromTopic
**Ne yapar**: Bilgi merkezindeki bir konunun benzersiz slug'ından ilgili ürün kategori sayfası için tam erişim URL'si üretir. Daha iyi kullanıcı deneyimi sağlanması amacıyla kullanılması önerilen bu fonksiyon, oluşturduğu standart URL ile doğrudan doğru ürün kategorisi sayfasına yönlendirme yapılmasını mümkün kılar. Kullanıcıların yanlış veya çalışmayan bağlantılarla karşılaşmasını önleyen güvenilir bir yönlendirme değeri sunar.
**Nasıl yapar**: Uygulama içinde tanımlı merkezi kayıt defteri (Registry) entegrasyonu kullanarak gelen konu slug'ını standart kategori sayfası yoluna dönüştürür. Manuel URL oluşturma süreçlerinde ortaya çıkabilecek yazım hataları veya yol çakışmalarını ortadan kaldıran, uygulama genelinde tutarlı bağlantı yapısı sağlayan bir mantık ile çalışır.
**Parametreler**:
- name: topicSlug, type: string — Bilgi merkezindeki konunun benzersiz kısa kimliği (slug'ı), örnek olarak HVAC sistemleri için 'hava-perdesi' değeri verilebilir
**Dönüş**: string tipinde, ilgili ürün kategori sayfasına sorunsuz erişim sağlamak için kullanılabilecek tam, geçerli URL değerini döndürür

---

## SABİTLER
- **TOPIC_TO_CATEGORY_URL** (object) — `{
    'hava-perdesi': '/category/air-curtains',
    'jet-fan': '/category/j...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/applicationLinks.ts::getCategoryUrlFromTopic
- **params**: [topicSlug: string]
- **ic_degiskenler**:
  - `topicSlug` — Fonksiyona parametre olarak gelen, işlem yapılacak konunun benzersiz URL uyumlu kimliği (slug)
  - `TOPIC_TO_CATEGORY_URL[topicSlug]` — Global tanımlı konu-kategori URL eşleşme nesnesinden, gelen topicSlug değerine karşılık gelen kategori URL'si
  - `'/products'` - Gelen topicSlug için eşleşen kategori URL'si bulunamadığında kullanılacak varsayılan ürünler sayfası URL'si
- **Dönüş**: string — Gelen konu slug'ına ait kategori URL'si veya eşleşme yoksa varsayılan /products URL'si

---

## NODE ID STANDARD

  file: src\utils\applicationLinks.ts
  function: src\utils\applicationLinks.ts::getCategoryUrlFromTopic

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategoryUrlFromTopic