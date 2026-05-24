---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\routes.ts
skeleton_hash: 4325be468f760ec9
generated_at: 2026-05-23T22:34:41Z
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

## FONKSIYON DETAYLARI

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

### [N2_NASIL] AST Pointer: src/utils/routes.ts::anonim_urun_route_olusturucu
- **params**: [slug: string]
- **ic_degiskenler**:
  - `slug` — Ürün slug girişi, route oluşturmak için temel değer
  - `validSlug` — assertProductSlug ile doğrulanmış güvenli ürün slug değeri
  - `encodeURIComponent` — validSlug'ı URL standartlarına uygun güvenli formata çeviren method
- **Dönüş**: Route (tipinde `/products/${validSlug}` formatında rota stringi)

---

### [N3_NASIL] AST Pointer: src/utils/routes.ts::anonim_urun_listeleme_route_olusturucu
- **params**: [params?: { brand?: string, limit?: number }]
- **ic_degiskenler**:
  - `params` — Filtreleme ve sayfalama parametrelerini içeren opsiyonel nesne
  - `params.brand` — Marka filtresi değeri, varsa sorgu parametresine eklenir
  - `params.limit` — Sonuç sayısı limiti, varsa stringe çevrilerek sorguya eklenir
  - `query` — Sorgu parametreleri oluşturmak için kullanılan URLSearchParams nesnesi
  - `qs` — String formatına çevrilmiş tam sorgu parametreleri zinciri
- **Dönüş**: Route (tipinde `/products` veya `/products?${qs}` formatında rota stringi)

---

### [N4_NASIL] AST Pointer: src/utils/routes.ts::anonim_urun_detay_route_olusturucu
- **params**: [idOrSlug: string]
- **ic_degiskenler**:
  - `idOrSlug` — Ürün kimliği veya slug değeri, route oluşturmak için giriş
  - `encodeURIComponent` — idOrSlug'ı URL güvenli formata çeviren method
- **Dönüş**: Route (tipinde `/products` veya `/products/${idOrSlug}` formatında rota stringi)

---

### [N5_NASIL] AST Pointer: src/utils/routes.ts::anonim_kategori_route_olusturucu
- **params**: [slug: string, subSlug?: string]
- **ic_degiskenler**:
  - `slug` — Ana kategori slug değeri, route'un temel parçası
  - `subSlug` — Opsiyonel alt kategori slug değeri, geçerliyse route'a eklenir
  - `encodeURIComponent` — slug ve subSlug'ı URL güvenli formata çeviren method
- **Dönüş**: Route (tipinde `/category/${slug}` veya `/category/${slug}/${subSlug}` formatında rota stringi)

---

### [N6_NASIL] AST Pointer: src/utils/routes.ts::anonim_marka_route_olusturucu
- **params**: [slug: string]
- **ic_degiskenler**:
  - `slug` — Marka slug değeri, route oluşturmak için giriş
  - `encodeURIComponent` — marka slug'ını URL güvenli formata çeviren method
- **Dönüş**: Route (tipinde `/brands/${slug}` formatında rota stringi)

---

### [N7_NASIL] AST Pointer: src/utils/routes.ts::anonim_odeme_basari_route_olusturucu
- **params**: [orderId?: string, status?: string]
- **ic_degiskenler**:
  - `orderId` — Opsiyonel sipariş kimliği, sorgu parametresine eklenir
  - `status` — Opsiyonel sipariş durumu, varsa sorgu parametresine eklenir
  - `query` — Sorgu parametreleri oluşturmak için kullanılan URLSearchParams nesnesi
- **Dönüş**: Route (tipinde `/payment-success` veya `/payment-success?${query.toString()}` formatında rota stringi)

---

### [N8_NASIL] AST Pointer: src/utils/routes.ts::anonim_giris_sayfasi_route_olusturucu
- **params**: [redirect?: string, error?: string]
- **ic_degiskenler**:
  - `redirect` — Giriş sonrası yönlendirilecek path, opsiyonel parametre
  - `error` — Giriş hatası mesajı, opsiyonel parametre
  - `url` — Sabit giriş sayfası temel path'i `/auth/login`
  - `params` — Sorgu parametreleri oluşturmak için kullanılan URLSearchParams nesnesi
  - `qs` — String formatına çevrilmiş tam sorgu parametreleri zinciri
- **Dönüş**: Route (tipinde `/auth/login` veya `/auth/login?${qs}` formatında rota stringi)

---

## NODE ID STANDARD

  file: src\utils\routes.ts
  function: src\utils\routes.ts::assertProductSlug

---

## DISA AKTARILANLAR (EXPORTS)
  export: Routes
  export: assertProductSlug