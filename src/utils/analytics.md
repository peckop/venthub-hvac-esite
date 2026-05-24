---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\analytics.ts
skeleton_hash: 850bc2150819ea68
generated_at: 2026-05-23T22:33:22Z
---

## Genel Bakış
VentHub HVAC projesinde yer alan analiz amaçlı utility modülüdür, uygulama genelinde gerçekleşen tüm kullanıcı ve sistem olaylarının merkezi olarak takibini sağlamak için tasarlanmıştır. Tüm takip işlemlerini tek bir noktada toplayarak analiz süreçlerinde tutarlı veri toplamayı garanti eder.

## Fonksiyon Grupları
### Olay Takibi
Uygulamada kaydedilmesi gereken olayları, yanlarında gelen ek parametrelerle birlikte analiz sistemine iletmekle sorumludur, tüm proje genelinde standartlaştırılmış bir takip arayüzü sunar.
- trackEvent

---

## AXIOMS – Mimari Varsayımlar
Bu modülün yalnızca olay takibi işlevini yerine getirebilmesi için bağlı olduğu harici analiz servislerinin çalışma ortamında erişilebilir olması ve giriş parametrelerinin tip uyumluluğunun sağlanması zorunludur.

[Aksiyom 1]: Eğer trackEvent fonksiyonunun bağlı olduğu harici olay takibi/analiz servisi çalıştırma ortamında tanımlı ve erişilebilir değilse, gönderilen hiçbir olay kaydedilemez, modül temel işlevini yerine getiremez.
[Aksiyom 2]: Eğer trackEvent fonksiyonuna gönderilen name parametresi geçerli, boş olmayan bir string değilse, ilgili olay takip sisteminde doğru şekilde sınıflandırılamaz, tüm analiz süreçlerinde hatalı veya eksik veri oluşmasına neden olur.
[Aksiyom 3]: Eğer trackEvent fonksiyonuna gönderilen params nesnesi JSON ile seri hale getirilebilir bir yapıda değilse (örneğin döngüsel referans içeriyorsa), olay parametreleri takip servisine aktarılamaz, eksik bilgilerle kayıt oluşturulur.

---

## FONKSIYON DETAYLARI

### trackEvent
**Ne yapar**: Güvenli şekilde bir analiz etkinliğini takip eder, etkinlik verisini GA4 (`gtag`) veya GTM (`dataLayer`) servislerine ileterek işlemeyi devreder. Hiçbir analiz servisi mevcut değilse, geliştirme veya hata ayıklama modlarında konsola etkinlik bilgilerini loglar, aksi takdirde herhangi bir aksiyon almadan sorunsuz çalışmaya devam eder.
**Nasıl yapar**: Çalışma ortamında önce GA4'e ait gtag fonksiyonunun veya GTM'ye ait dataLayer nesnesinin varlığını kontrol eder. İlgili servislerden herhangi biri mevcutsa, almış olduğu etkinlik adı ve ek parametreleri ilgili servise iletir. Eğer hiçbir analiz servisi yüklenmemişse, çalışma moduna göre hareket eder; geliştirme ya da debug modlarında etkinlik detaylarını tarayıcı konsoluna loglar, üretim ortamında ise herhangi bir ekstra işlem yapmadan çalışmaya devam eder.
**Parametreler**:
- name: string — Takip edilecek etkinliğin adı (örneğin 'add_to_cart')
- params: Record<string, unknown> — Etkinliğe ait ek parametreler ve metadata, varsayılan olarak boş nesnedir
**Dönüş**: void, herhangi bir değer döndürmez.

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