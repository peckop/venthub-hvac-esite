---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\errorReporter.ts
skeleton_hash: a9a1ef9b05b73e77
entity_hashes:
  func:reportError: 08ffee8a5f783d08
  overview: 99b24f9de09b5423
generated_at: 2026-05-28T22:37:58Z
---

## Genel Bakış
VentHub HVAC projesindeki bu modül, uygulama genelinde oluşabilecek her türlü hatayı merkezi bir noktada toplayarak standart bir raporlama süreci başlatır. Hatalarla birlikte opsiyonel bağlam bilgilerini de alarak tutarlı ve izlenebilir hata kayıtları oluşturmayı amaçlar.

## Fonksiyon Grupları
### Merkezi Hata Raporlama
Tüm uygulama katmanlarından gelen hata raporlama taleplerini tek bir giriş noktası üzerinden karşılar. Alınan hata nesnesi ve varsa bağlam bilgisi işlenerek standart raporlama akışı tetiklenir.
- reportError

---

## AXIOMS – Mimari Varsayımlar
Bu hata raporlama modülünün sistemdeki hataları doğru şekilde toplaması ve iletmesi için çalışma zamanı ortamının ve girdi parametrelerinin belirlenen yapıda, erişilebilir durumda olması zorunludur.

[Aksiyom 1]: Eğer raporlanmak üzere gönderilen err parametresi null, undefined veya çalışma zamanında okunamıyorsa, hata raporu oluşturulamaz veya eksik içerikle üretilir.
[Aksiyom 2]: Eğer opsiyonel olarak sağlanan context parametresi string anahtarlarına sahip bir kayıt yapısında değilse, hataya ait bağlam bilgisi hata raporuna eklenemez.
[Aksiyom 3]: Eğer modülün çalıştığı runtime ortamı, TypeScript ile derlenmiş ECMAScript kodlarını çalıştıramıyorsa, errorReporter modülü hiç yüklenemez ve hiçbir hata raporlanamaz.
[Aksiyom 4]: Eğer hata raporlarının iletileceği çalışma zamanı çıkış kanalı (konsol, log servisi vb.) erişilemez veya kullanılamıyorsa, oluşturulan hata raporu hiçbir şekilde saklanamaz veya iletilemez.

---

## FONKSİYON DETAYLARI

### reportError

**Ne yapar**: Yapılandırılmış hata raporlayıcısına (manualReporter) hata bilgisini güvenli bir şekilde iletir. Hata raporlayıcı kurulmamışsa geliştirme ortamında konsola uyarı yazdırarak sessiz bir geri dönüş sağlar; üretim ortamında ise uygulamanın çökmesini önlemek adına tamamen sessiz kalır.

**Nasıl yapar**: Fonksiyon öncelikle modül seviyesinde tanımlı `manualReporter` değişkeninin varlığını kontrol eder. Eğer bir raporlayıcı kuruluysa, hata nesnesini ve opsiyonel bağlam bilgisini doğrudan bu raporlayıcıya aktarır. Raporlayıcı kurulu değilse, ortamın tarayıcı tabanlı olup olmadığını ve `NODE_ENV` değerinin `production` olup olmadığını kontrol eder. Geliştirme ortamındaysa, hatanın raporlanmadığını belirten bir uyarı mesajını konsola yazar; üretim ortamında ise herhangi bir işlem yapmaz.

**Parametreler**:
- `err`: unknown — Raporlanacak hata nesnesi veya bilinmeyen türdeki değer. Fonksiyon, bu değeri doğrudan raporlayıcıya iletir.
- `context` (opsiyonel): Record\<string, unknown\> — Hata çevresindeki opsiyonel metadata veya bağlam bilgisi. Örneğin, hatanın oluştuğu sayfa, kullanıcı durumu veya ek ayarlar gibi bilgiler taşınabilir.

**Dönüş**: void — Fonksiyon herhangi bir değer döndürmez. Hata raporlama işlemi yan etki olarak gerçekleştirilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/errorReporter.ts::reportError
- **params**:
  - `err: unknown` — raporlanacak hata nesnesi
  - `context?: Record<string, unknown>` — opsiyonel bağlam bilgisi, hatayla ilişkili ek veriler
- **ic_degiskenler**: (yerel değişken yok)
- **Referanslar**:
  - `manualReporter` — modül seviyesinde tanımlı, yüklenmiş hata raporlayıcı fonksiyon; varsa çağrılır
  - `window` — tarayıcı ortam kontrolü, `typeof window !== 'undefined'`
  - `process.env.NODE_ENV` — ortam değişkeni, production olmadığında fallback uyarı basılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\lib\errorReporter.ts
  function: src\lib\errorReporter.ts::reportError

---

## DISA AKTARILANLAR (EXPORTS)
  export: reportError