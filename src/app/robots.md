---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\robots.ts
skeleton_hash: 59e37004f4c9248c
entity_hashes:
  func:robots: 04938e582a28c5d6
  overview: f391529836fd465a
generated_at: 2026-06-19T20:46:34Z
---

## Genel Bakış
Bu modül, Next.js uygulamasının arama motorları için `robots.txt` dosyasını dinamik olarak oluşturan bir rota işleyicisidir. Tek bir fonksiyon aracılığıyla tarayıcıların erişim izinlerini ve site haritası konumunu yapılandırarak site trafiğini ve indekslemeyi yönetir.

## Fonksiyon Grupları
### Robots Metadata Üretimi
Bu grup, arama motoru botlarının siteyi nasıl tarayacağına dair yapılandırma verisini programatik olarak oluşturur ve döndürür.
- robots

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasından çıkarılabilecek temel aksiyomlar tanımlanmıştır.

**[Aksiyom 1]**: Eğer `robots()` fonksiyonu çağrıldığında geçerli bir Next.js metadata formatında (MetadataRoute.Robots) dönüş sağlanmazsa, arama motorları siteyi taramak için gerekli kuralları alamaz ve varsayılan tarama davranışına geçilir.

**[Aksiyom 2]**: Eğer `robots()` fonksiyonu parametre almıyorsa, döndürülen robots.txt yapılandırması dinamik veriye (kullanıcı, istek bağlamı vb.) bağlı olamaz; statik veya modül-seviyesinde tanımlı sabitlerden oluşmalıdır.

**[Aksiyom 3]**: Eğer bu modül `/robots.ts` rotasında bir Next.js App Router metadata işleyicisi olarak kullanılıyorsa, dönüş değerinin `userAgent`, `allow`, `disallow` ve `sitemap` alanlarını içermesi beklenir; aksi halde arama motoru botları site haritasını bulamaz veya engellenen yolları yanlış yorumlar.

---

## FONKSİYON DETAYLARI

### robots

**Ne yapar**: Web sitesi için arama motoru botlarının (crawler) izlemesi gereken kuralları ve site haritası URL'ini tanımlayan metadata nesnesi oluşturur. Bu fonksiyon, Next.js'in built-in SEO desteği kapsamında search engine optimization süreçlerini yapılandırır.

**Nasıl yapar**: Fonksiyon sabit bir nesne döndürerek arama motoru botlarına sitenin hangi bölümlerine erişebileceği ve hangilerine erişemeyeceği talimatını verir. `SITE_URL` sabitini kullanarak dinamik site haritası URL'i oluşturur ve robots.txt dosyasının içeriğini programatik olarak tanımlar.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `MetadataRoute.Robots` — Next.js'in robots metadata tipi ile uyumlu nesne döndürür. Döndürülen nesne şu yapıya sahiptir:
- `rules`: Arama motoru botları için erişim kuralları
  - `userAgent: '*'` — Tüm botları kapsar
  - `allow: '/'` — Ana sayfaya ve genel erişime izin verir
  - `disallow` dizisi — `/admin/`, `/auth/`, `/account/`, `/checkout/` dizinlerini botlara kapatır
- `sitemap`: Site haritası dosyasının tam URL'i (`${SITE_URL}/sitemap.xml` formatında)

**Notlar**: `disallow` listesinde yer alan dizinler, kullanıcının oturum açmasını veya yetkilendirme gerektiren bölümlerdir. Bu alanların botlar tarafından indekslenmesi engellenerek, hassas sayfaların arama sonuçlarında görünmesi ve duplicate content sorunları önlenir.

---

## İTHALATLAR (IMPORTS)
- import: ../config/siteUrl::SITE_URL
- import: next::MetadataRoute

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/robots.ts::robots
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `MetadataRoute.Robots` — robots.txt yapısını döndürür; `rules` içinde user agent `*` için `/` yoluna izin verir, `/admin/`, `/auth/`, `/account/`, `/checkout/` yollarını engeller; `sitemap` alanı template literal ile `${SITE_URL}/sitemap.xml` olarak ayarlanır

---

## NODE ID STANDARD

  file: src\app\robots.ts
  function: src\app\robots.ts::robots

---

## DISA AKTARILANLAR (EXPORTS)
  export: robots