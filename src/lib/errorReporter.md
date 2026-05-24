---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\errorReporter.ts
skeleton_hash: a9a1ef9b05b73e77
generated_at: 2026-05-23T22:31:01Z
---

## Genel Bakış
VentHub HVAC projesinde kullanılan bu modül, tüm uygulama genelinde hata yönetimini standartlaştıran merkezi bir hata raporlama bileşenidir. Uygulamanın farklı katmanlarında oluşabilecek her türlü hatayı, ait olduğu bağlamsal bilgilerle birlikte standart formatta raporlamak üzere tasarlanmıştır. Tüm hata raporlama taleplerini tek noktada toplayarak loglama ve hata takibi süreçlerinde tutarlılık sağlar.

## Fonksiyon Grupları
### Merkezi Hata Raporlama İşlevi
Tüm uygulama genelindeki hata raporlama ihtiyaçlarını karşılamak üzere tasarlanmış tek ana fonksiyonu barındırır. Gelen hataları ve isteğe bağlı bağlam bilgilerini işleyerek standart bir raporlama süreci başlatır.
- reportError

---

## AXIOMS – Mimari Varsayımlar
Bu hata raporlama modülünün sistemdeki hataları doğru şekilde toplaması ve iletmesi için çalışma zamanı ortamının ve girdi parametrelerinin belirlenen yapıda, erişilebilir durumda olması zorunludur.

[Aksiyom 1]: Eğer raporlanmak üzere gönderilen err parametresi null, undefined veya çalışma zamanında okunamıyorsa, hata raporu oluşturulamaz veya eksik içerikle üretilir.
[Aksiyom 2]: Eğer opsiyonel olarak sağlanan context parametresi string anahtarlarına sahip bir kayıt yapısında değilse, hataya ait bağlam bilgisi hata raporuna eklenemez.
[Aksiyom 3]: Eğer modülün çalıştığı runtime ortamı, TypeScript ile derlenmiş ECMAScript kodlarını çalıştıramıyorsa, errorReporter modülü hiç yüklenemez ve hiçbir hata raporlanamaz.
[Aksiyom 4]: Eğer hata raporlarının iletileceği çalışma zamanı çıkış kanalı (konsol, log servisi vb.) erişilemez veya kullanılamıyorsa, oluşturulan hata raporu hiçbir şekilde saklanamaz veya iletilemez.

---

## FONKSIYON DETAYLARI

### reportError
**Ne yapar**: Uygulama içerisinde oluşan hataları, tanımlanmış özel raporlayıcıya güvenli bir şekilde ileten standart bir hata raporlama utility fonksiyonudur. Hiçbir özel raporlayıcı tanımlanmamışsa geliştirme ortamında hatayı görünür kılan bir geri dönüş mekanizması sunarken, üretim ortamında uygulamanın ana akışının çökmesini önlemek amacıyla sessizce çalışmasını sonlandırır. Tüm uygulama genelinde tutarlı hata raporlama standartları oluşturmak için tasarlanmıştır.
**Nasıl yapar**: İlk olarak bilinmeyen türünde gelen hata değerini güvenli bir şekilde işleyerek tür kaynaklı hataların önüne geçer, ardından sistemde yapılandırılmış manuel bir raporlayıcı olup olmadığını kontrol eder. Eğer raporlayıcı mevcutsa hatayı ve varsa ilişkili bağlam verisini bu raporlayıcıya ileterek raporlamayı tamamlar. Raporlayıcı yoksa çalışma ortamını kontrol eder: geliştirme ortamında konsol gibi araçlar üzerinden hatayı ve bağlamını geliştiriciye sunar, üretim ortamında ise hiçbir işlem yapmadan uygulamanın çalışmaya devam etmesini sağlar.
**Parametreler**:
- name: err, type: unknown — Raporlanacak olan hata nesnesi ya da bilinmeyen türündeki herhangi bir sorun değeri, uygulama içinde fırlatılan tüm istisnalar veya beklenmedik durum değerleri bu parametre üzerinden iletilir
- name: context, type: Record<string, unknown> — Hatanın oluştuğu ortama ait isteğe bağlı metaveri veya bağlam bilgileri, hatanın kök nedenini analiz etmek için faydalı olan kullanıcı oturumu, işlem adımları, işlem kimliği gibi ek verileri içerebilir
**Dönüş**: void, herhangi bir değer döndürmez, raporlama işlemi başarısız olsa bile uygulama akışını etkileyecek herhangi bir istisna fırlatmaz, tüm hata durumlarını kendi bünyesinde yönetir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\errorReporter.ts::reportError
- **params**: err: unknown, context?: Record<string, unknown>
- **ic_degiskenler**:
  - `manualReporter` — Gelen hata ve bağlam verisini iletmek için koşullu olarak çağrılan önceden tanımlı özel hata raporlama fonksiyonu
  - `typeof window` — Kodun tarayıcı ortamında çalışıp çalışmadığını tespit etmek için kullanılan global nesne tipi sorgusu
  - `process.env.NODE_ENV` — Uygulamanın çalışma ortamının production olup olmadığını kontrol etmek için erişilen çevre değişkeni
  - `console.warn` — Geliştirme ortamında hata ve bağlam bilgisini konsola loglamak için çağrılan konsol fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\lib\errorReporter.ts
  function: src\lib\errorReporter.ts::reportError

---

## DISA AKTARILANLAR (EXPORTS)
  export: reportError