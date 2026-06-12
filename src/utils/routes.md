---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\routes.ts
skeleton_hash: 4325be468f760ec9
entity_hashes:
  func:assertProductSlug: 7cc00756c332a6af
  overview: d85c95fb607dc832
generated_at: 2026-05-28T22:38:49Z
---

## Genel Bakış
VentHub HVAC projesinin rota yönetim süreçlerini destekleyen bir yardımcı program modülüdür. Uygulama içi rotalarda kullanılan ürün tanımlayıcılarının geçerliliğini denetleyerek rota bütünlüğünü korumak için temel doğrulama işlevleri sunar. Beklenmedik tanımlayıcı kaynaklı hataları rota seviyesinde önlemeye yardımcı olur.

## Fonksiyon Grupları
### Ürün Slug Doğrulama İşlevleri
Rotalarda kullanılan ürün benzersiz tanımlayıcılarının (slug) standartlara uygunluğunu kontrol etmekle sorumludur. Gelen slug değerlerini doğrulayarak geçersiz tanımlayıcıların rotalarda kullanılmasını engeller.
- assertProductSlug

---

## AXIOMS – Mimari Varsayımlar
Bu rota yönetimi modülü, VentHub HVAC sistemindeki ürün rotalarını yönetmek ve ürün slug'larının geçerliliğini doğrulamak amacıyla tasarlanmıştır, doğru ve hatasız çalışması için aşağıdaki mimari koşulların sürekli olarak sağlanması zorunludur.

[Aksiyom 1]: Eğer assertProductSlug fonksiyonuna gönderilen giriş parametresi string tipinde değilse, slug doğrulama işlemi başarısız olur, tüm ürün rotası yönlendirmeleri hatalı çalışır.
[Aksiyom 2]: Eğer modül sabiti olarak tanımlanan Routes nesnesi tanımlı değilse veya içinde tüm geçerli ürün slug'larını barındırmıyorsa, assertProductSlug fonksiyonu geçerli slug'ları dahi reddeder, var olan ürünlere kullanıcı erişimi engellenir.
[Aksiyom 3]: Eğer assertProductSlug fonksiyonu herhangi bir ürün rotasına gelen istek işlenmeden önce çağrılmazsa, geçersiz slug'lı istekler sistemde işlenemeyen sunucu veya yönlendirme hatalarına yol açar.
[Aksiyom 4]: Eğer kullanıcı isteğinden gelen slug formatı, Routes nesnesinde tanımlı slug anahtarlarının formatıyla (büyük/küçük harf, özel karakter uyumu) uyuşmuyorsa, geçerli bir ürün slug'ı dahi doğrulanamaz, ürün erişimi engellenir.

---

## FONKSİYON DETAYLARI

### assertProductSlug
**Ne yapar**: Ürün slug değerinin geçerliliğini doğrulayan bir kontrol fonksiyonudur. Gelen tanımlayıcının geçerli bir ürün slug'ı olup olmadığını denetler, eğer gelen değer ID veya UUID formatındaysa çalıştığı ortama özel aksiyonlar alır. Hem geliştirme sürecinde hızlı hata yakalama sağlamak hem de canlı üretim ortamında servis sürekliliğini korumak amacıyla tasarlanmıştır.
**Nasıl yapar**: İlk olarak aldığı string değerinin ID veya UUID formatında olup olmadığını tespit eder, ardından çalıştığı ortamı (geliştirme/üretim) ortam değişkenleri üzerinden okur. Geliştirme (Development) ortamında doğrulama başarısız olursa fail-fast prensibi gereği hemen hata fırlatarak geliştiricinin sorunu erken aşamada fark etmesini sağlar. Üretim (Production) ortamında ise sistemi kesintiye uğratmamak için hatalı durumu sadece loglar, orijinal değeri Middleware'in entegre 308 kalıcı yönlendirme mekanizmasını kullanabilmesi için olduğu gibi geri döndürür.
**Parametreler**:
- name: slug, type: string — Doğrulanması gereken ürün odaklı URL tanımlayıcısı (slug) değeri; hatalı kullanım durumunda ID veya UUID formatında da fonksiyona iletilebilir.
**Dönüş**: string tipi değer döndürür. Doğrulama başarılı olursa orijinal geçerli slug değerini her ortamda iletir. Doğrulama başarısız olsa bile üretim ortamında orijinal gelen değeri, Middleware'in yönlendirme mekanizmasını tetikleyebilmesi için geri iletir.

---

## SABİTLER
- **Routes** (object) — `{
  home: () => '/' as Route,
  
  // Eşsiz Link Yönetimi
  product: (slu...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/routes.ts::assertProductSlug
- **params**: [slug: string]
- **ic_degiskenler**:
  - `slug` — Doğrulanması gereken ürün slug girişi
  - `uuidRegex` — UUID formatını tanımlayan, slug'ın UUID olup olmadığını kontrol etmek için kullanılan regex deseni
  - `process.env.NODE_ENV` — Çalışma ortamının üretim olup olmadığını tespit etmek için kullanılan ortam değişkeni
  - `Error` — Geliştirme ortamında UUID kullanımı tespit edildiğinde fırlatılan özel hata nesnesi
  - `console.error` — Üretim ortamında UUID sızıntısını loglamak için kullanılan konsol methodu
- **Dönüş**: string (doğrulanmış geçerli slug veya boş string)

---

## NODE ID STANDARD

  file: src\utils\routes.ts
  function: src\utils\routes.ts::assertProductSlug

---

## DISA AKTARILANLAR (EXPORTS)
  export: Routes
  export: assertProductSlug