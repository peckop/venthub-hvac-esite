---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\tenantResolver.ts
skeleton_hash: c473c318a31b7bc6
entity_hashes:
  func:resolveTenant: c08cc2e05c8a4513
  overview: 7802d22f60606102
generated_at: 2026-05-30T21:35:44Z
---

## Genel Bakış
Tenant resolver modülü, multi-tenant HVAC sisteminde isteklerin doğru kiracıya yönlendirilmesini sağlayan temel çözümleme bileşenidir. Modül, hostname bilgisini alarak ilgili kiracının tanım bilgilerini döndürür.

## Fonksiyon Grupları
### Kiracı Çözümleme
Sistem isteklerinin hostname adresinden hangi kiracıya ait olduğunu belirleyen çözümleme fonksiyonu.
- resolveTenant

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından türetilebilecek temel varsayımlar aşağıdadır:

**[Aksiyom 1]:** Eğer `host` parametresi `null` veya `undefined` olarak verilirse, fonksiyonun bir kiracı (tenant) çözümlümesi (resolve) yapamayacağı ve muhtemelen `null` veya `undefined` döneceği kabul edilir. *Eğer bu koşul sağlanmazsa, fonksiyonun beklenmeyen bir hata (exception) üretmesi veya geçersiz bir kiracı tanımlaması yapması olur.*

**[Aksiyom 2]:** Fonksiyonun çağrılabilir (callable) olduğu ve geçerli bir `host` (string) değer aldığında, o host'a karşılık gelen kiracı bilgisini (tenant) döndüreceği varsayılır. *Eğer fonksiyon çağrılabilir değilse veya geçersiz bir host değeriyse, fonksiyonun hata fırlatması (throw) veya beklenmeyen bir değer döndürmesi olur.*

---

## FONKSİYON DETAYLARI

### resolveTenant

**Ne yapar**: Verilen hostname bilgisinden tenant bilgisini (tenantId ve slug) çıkarır. Hostname'deki subdomain yapısını analiz ederek hangi kiracının (tenant) isteği yönettiğini belirler. Geliştirme ortamı ve varsayılan alan adları için önceden tanımlı default değerler döndürür.

**Nasıl yapar**: Fonksiyon öncelikle hostname'in varlığını kontrol eder. Yoksa veya boşsa varsayılan tenant bilgisini döndürür. Hostname mevcutsa, port bilgisini temizler (örn: `localhost:3000` → `localhost`) ve küçük harfe çevirir. Ardından hostname'in yapısal analizini yapar: `.localhost` ile biten adresler için ikinci parçayı, standart domainler için ise üç veya daha fazla parçalı yapının ilk parçasını subdomain olarak çıkarır. `www` veya `api` gibi özel subdomain'ler varsayılan tenant'a yönlendirilir, diğer durumlarda çıkarılan subdomain slug olarak döndürülür.

**Parametreler**:
- `host`: `string | null | undefined` — Tenant bilgisinin çıkarılacağı hostname adresi. Port içerebilir (örn: `tenant1.venthub.com:3000`). Null veya undefined olabilir, bu durumda varsayılan tenant döner.

**Dönüş**: `TenantInfo` nesnesi döndürür. Bu nesne şu alanları içerir:
- `tenantId` (string): Tenant'ın benzersiz tanımlayıcı UUID'si. Tüm durumlarda varsayılan `d3b07384-d113-495f-a558-8c38634e0000` değerini döner.
- `slug` (string): Tenant'ın kısa adı. Varsayılan olarak `'default'` döner, geçerli bir subdomain mevcutsa bu değer slug olarak atanır.

---

## INTERFACES

### TenantInfo
- `tenantId: string`
- `slug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/tenantResolver.ts::resolveTenant
- **params**:
  - `host: string | null | undefined` — istek gelen hostname, subdomain tespiti için kullanılır
- **ic_degiskenler**:
  - `DEFAULT_TENANT_ID` — sabit default tenant ID (`'d3b07384-d113-495f-a558-8c38634e0000'`), tüm dönüşlerde kullanılır
  - `DEFAULT_SLUG` — sabit default slug (`'default'`), subdomain bulunamadığında döndürülür
  - `cleanHost` — host'un port kısmından arındırılmış, trimlenmiş, lowercase hali (`host.split(':')[0].trim().toLowerCase()`)
  - `parts` — cleanHost'un `'.'` karakteri ile split edilmesiyle oluşan string dizisi
  - `subdomain` — `parts[0]`'dan çıkarılan potansiyel tenant slug'u; bazı koşullarda `undefined` kalır
- **Dict Access**:
  - `parts[0]` — hostname parçalarının ilk elemanı, subdomain adayı
  - `parts.length` — hostname parçalarının sayısı, subdomain ayrıştırma koşulunda karar verir
- **Dönüş**: `{ tenantId: string, slug: string }` — `TenantInfo` nesnesi; subdomain `'www'`/`'api'` veya yoksa default tenant döner, geçerli subdomain varsa slug olarak extract edilen subdomain döner

---

## NODE ID STANDARD

  file: src\lib\tenantResolver.ts
  function: src\lib\tenantResolver.ts::resolveTenant

---

## DISA AKTARILANLAR (EXPORTS)
  export: TenantInfo
  export: resolveTenant