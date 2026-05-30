---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\tenantResolver.ts
skeleton_hash: c473c318a31b7bc6
entity_hashes:
  func:resolveTenant: 9caf7236d34e412f
  overview: 7802d22f60606102
generated_at: 2026-05-30T20:24:51Z
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
**Ne yapar**: Verilen host adresinden tenant bilgisini (tenantId ve slug) çözer. Geliştirme ortamı, localhost veya geçersiz subdomain durumlarında varsayılan tenant'ı döner.
**Nasıl yapar**: 
1. Host değerini temizler (port'u kaldırır ve küçük harfe çevirir).
2. Eğer host yoksa veya localhost/127.0.0.1 ise varsayılan tenant'ı döner.
3. Host'un sonu '.localhost' ise, ilk parçayı subdomain olarak alır.
4. Aksi halde, en az 3 parçalı ise ilk parçayı subdomain olarak alır.
5. Subdomain 'www' veya 'api' ise veya hiç yoksa, yine varsayılan tenant'ı döner.
6. Diğer durumlarda, varsayılan tenantId ile birlikte subdomain'i slug olarak döner.
**Parametreler**:
- host: string | null | undefined — Tenant'ın çözüleceği host adresi. Port içerebilir (örn. localhost:3000). Null veya undefined olabilir.
**Dönüş**: TenantInfo — { tenantId: string, slug: string } yapısında tenant bilgileri.

---

## INTERFACES

### TenantInfo
- `tenantId: string`
- `slug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/tenantResolver.ts::resolveTenant
- **params**: (host: string | null | undefined)
- **ic_degiskenler**:
  - `DEFAULT_TENANT_ID` — Varsayılan kiracı kimliği (ID) olarak kullanılan sabit dize.
  - `DEFAULT_SLUG` — Varsayılan kiracı tanımlayıcısı (slug) olarak kullanılan sabit dize.
  - `cleanHost` — Port bilgisi temizlenmiş, küçük harfe dönüştürülmüş ve boşlukları temizlenmiş host dizesi.
  - `parts` — cleanHost'un noktalarla分割 edilmesiyle elde edilen dize dizisi (array).
  - `subdomain` — parts dizisinden çıkarılan ve kiracı tanımlayıcısı olarak kullanılacak alt etki alanı dizesi (tanımsız olabilir).
- **Dönüş**: { tenantId: string, slug: string } (TenantInfo)

---

## NODE ID STANDARD

  file: src\lib\tenantResolver.ts
  function: src\lib\tenantResolver.ts::resolveTenant

---

## DISA AKTARILANLAR (EXPORTS)
  export: TenantInfo
  export: resolveTenant