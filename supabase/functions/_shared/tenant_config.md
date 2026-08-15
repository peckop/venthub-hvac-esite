---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\_shared\tenant_config.ts
skeleton_hash: 865a8d4b605a94c6
entity_hashes:
  func:getTenantBranding: 6ae9f5f873d6872c
  overview: 727819c400487687
generated_at: 2026-08-15T09:05:28Z
---

## Genel Bakış
Bu modül, Supabase edge fonksiyonları arasında kiracıya (tenant) özel yapılandırma bilgilerini sağlamak için paylaşımlı yardımcı fonksiyonlar sunar. Temel olarak, HTTP isteklerinden kiracı tanımlayıcısının çıkarılması ve bu tanımlayıcıya karşılık gelen kiracının marka bilgilerinin merkezi olarak getirilmesi işlemlerini yönetir.

## Fonksiyon Grupları
### Kiracı Kimlik Yönetimi
HTTP isteklerinden kiracı tanımlayıcısını analiz edip standart bir biçime dönüştürerek, sistem genelinde kullanılabilir hale getirir.
- resolveTenantId

### Kiracı Marka Bilgisi Sağlama
Belirli bir kiracı tanımlayıcısına ait marka ve görsel yapılandırma bilgilerini asenkron olarak getirerek, kiracıya özel arayüzlerin dinamik olarak oluşturulmasını destekler.
- getTenantBranding

---

## AXIOMS – Mimari Varsayımlar

Bu modül için **fonksiyon gövdesi (function body) paylaşılmamıştır**. Axiom'lar sadece fonksiyon gövdesinden üretilebilir.

---

## FONKSİYON DETAYLARI

### getTenantBranding
**Ne yapar**: Belirli bir kiracıya (tenant) ait marka yapılandırmasını (branding) asenkron olarak getirir. İşlem, veritabanı yapılandırması, ortam değişkenleri ve sabit kodlanmış varsayılan değerler之间ında kademeli bir fallback mekanizması uygular.

**Nasıl yapar**: Fonksiyon, Supabase service role anahtarı ile bir istemci oluşturarak veritabanından kiracının `config` alanını çeker. Elde edilen veritabanı yapılandırması (hem `snake_case` hem de `camelCase` anahtarlarla kontrol edilir) önceliklidir. Eğer veritabanında değer bulunamazsa, sırasıyla Deno ortam değişkenleri (`BRAND_NAME`, `BRAND_LOGO_URL`, vb.) ve en son olarak sabit kodlanmış VentHub varsayılan değerleri kullanılır. Bu fallback zinciri, her bir marka özelliği için ayrı ayrı uygulanır.

**Parametreler**:
- `tenantId`: `string` — Marka yapılandırması getirilecek kiracının benzersiz tanımlayıcısı.

**Dönüş**: `Promise<TenantBranding>` — Kiracının resolved edilmiş marka yapılandırmasını içeren bir nesne döndürür. `TenantBranding` tipinin şu özelliklere sahip olduğu varsayılır: `brandName: string`, `brandLogoUrl: string`, `brandPrimaryColor: string`, `emailFrom: string`.

---

## İTHALATLAR (IMPORTS)
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## INTERFACES

### TenantBranding
- `brandName: string`
- `brandLogoUrl: string`
- `brandPrimaryColor: string`
- `emailFrom: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/tenant_config.ts::getTenantBranding
- **params**: (tenantId: string)
- **ic_degiskenler**:
    - `supabaseUrl` — Supabase proje URL'si, environment variable'dan alınır, Supabase istemcisi oluşturmada kullanılır
    - `serviceKey` — Supabase servis rolü anahtarı, environment variable'dan alınır, yetkilendirme için kullanılır
    - `dbConfig` — Tenant yapılandırması için boş bir nesne olarak başlatılır, veritabanından yüklenen config verisi burada saklanır
    - `supabase` — createClient fonksiyonu ile oluşturulan Supabase istemcisi, veritabanı sorguları yapmak için kullanılır
    - `data` — Supabase sorgusundan dönen veri, tenant'ın config alanını içerir (başarılı olursa)
    - `error` — Supabase sorgusundan dönen hata nesnesi (başarısız olursa)
    - `brandName` — Marka adı, dbConfig'den veya environment variable'dan çözümlenir, fallback olarak 'VentHub' kullanılır
    - `brandLogoUrl` — Marka logo URL'si, dbConfig'den veya environment variable'dan çözümlenir, varsayılan VentHub logosu kullanılır
    - `brandPrimaryColor` — Marka birincil rengi, dbConfig'den veya environment variable'dan çözümlenir, varsayılan '#2563eb' kullanılır
    - `emailFrom` — E-posta gönderen adresi, dbConfig'den veya environment variable'dan çözümlenir, varsayılan VentHub adresi kullanılır
- **Dönüş**: TenantBranding nesnesi (brandName, brandLogoUrl, brandPrimaryColor, emailFrom alanlarını içerir)

---

## NODE ID STANDARD

  file: supabase\functions\_shared\tenant_config.ts
  function: supabase\functions\_shared\tenant_config.ts::getTenantBranding

---

## DISA AKTARILANLAR (EXPORTS)
  export: TenantBranding
  export: getTenantBranding