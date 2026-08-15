---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\shell\navCookie.ts
skeleton_hash: c3b5675adc1fdad3
entity_hashes:
  func:navCookieName: 8c2f093215264277
  overview: 0ea1a0c140fc2427
generated_at: 2026-08-15T11:55:34Z
---

## Genel Bakış
Bu modül, admin panelinin navigasyon sistemi için çerez (cookie) adı yönetimini sağlamakla sorumludur. Temel işlevi, çoklu kiracı (multi-tenant) ortamında her bir kiracıya (tenant) özgü, benzersiz ve öngörülebilir bir çerez ismi üretmektir. Bu, farklı kiracı oturumlarının tarayıcı seviyesinde çakışmasını önleyerek güvenlik ve veri izolasyonu sağlar.

## Fonksiyon Grupları
### Çerez Kimlik Üretimi
Bu grup, navigasyon durumunu saklamak için kullanılan çerezin adını, sistemdeki benzersiz kiracı tanımlayıcısını kullanarak oluşturur.
- navCookieName

---

## AXIOMS – Mimari Varsayımlar

Bu modül için tanımlanmış fonksiyon imzasından çıkarılabilen minimal mimari varsayımlar aşağıdadır. Fonksiyon gövdesi ve implementasyon detayları paylaşılmadığı için, varsayımlar salt imza bilgisine dayanmaktadır.

**[Aksiyom 1]:** Eğer `tenantId` parametresi `string` tipinde değilse veya sağlanmamışsa, fonksiyon beklenmeyen bir çıktı üretir veya hata oluşur.

---

**Not:** Bu modül sadece tek bir ham fonksiyon imzasından ibarettir (`navCookieName(tenantId: string) -> string`). Fonksiyon gövdesi, modül sabitleri veya implementasyon detayları paylaşılmadığından, daha fazla domain-specific aksiyom (eşik değerleri, validasyon kuralları, cookie formatı vb.) **bilinmiyor** olarak belirtilmelidir. Ek varsayımlar üretilmemiştir.

---

## FONKSİYON DETAYLARI

### navCookieName

**Ne yapar**: Verilen tenant kimliğine özel, sol navigasyon menüsünün durumunu saklamak için kullanılan çerez adını (cookie name) üretir. Bu çerez adı, istemci tarafında (tarayıcı) ve sunucu tarafında (RSC/SSR) aynı yerden okunarak navigasyon durumunun her iki ortamda da tutarlı olmasını sağlar.

**Nasıl yapar**: Fonksiyon, parametre olarak aldığı `tenantId` değerini bir string'e dönüştürdükten sonra, RFC 6265 standardına aykırı olan tüm token dışı karakterleri (`A-Za-z0-9_-` karakter kümesi dışındaki her şey) bir regex ile temizler. Ardından temizlenmiş safe değerini `vh_admin_nav_` ön ekine ekleyerek benzersiz bir çerez adı döndürür. Çerez kullanılmasının temel nedeni, `localStorage`'ın sunucu tarafında okunamıyor olmasıdır; bu durum React Server Components (RSC) layout bileşeninin başlangıç değerini bilememesine ve SSR sırasında menünün yanlış varsayılan değerle render edilerek ilk boyamada görsel bir "zıplamaya" (layout shift) neden olmasına yol açar. shadcn/ui Sidebar bileşeni de aynı sebeple çerez tabanlı bir yaklaşım benimsemiştir.

**Parametreler**:
- `tenantId`: `string` — Kiracı (tenant) tanımlayıcısı. Bu değer, çerez adının kiracıya özgü olmasını sağlamak için kullanılır. İçerisindeki RFC 6265'e uygun olmayan karakterler otomatik olarak temizlenir.

**Dönüş**: `string` — Oluşturulan çerez adı. Format: `vh_admin_nav_{safeTenantId}` şeklinde, örneğin `vh_admin_nav_tenantABC123`. Dönüş değeri her zaman RFC 6265 standardına uygun bir cookie-name formatındadır, çünkü token dışı karakterler fonksiyon içinde filtrelenir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/shell/navCookie.ts::navCookieName
- **params**: `(tenantId: string)`
- **ic_degiskenler**:
  - `safe` — `String(tenantId)` değerinden RFC 6265 çerez adı kurallarına aykırı tüm karakterlerin (`[^A-Za-z0-9_-]`) boşluk ile değiştirilmesiyle elde edilen, çerez adında kullanılabilir hale getirilmiş temiz metin.
- **Dönüş**: `vh_admin_nav_${safe}` — Çerez adı前缀'i (`vh_admin_nav_`) ile temizlenmiş `tenantId`'nin birleşiminden oluşan, tam bir çerez adı stringi.

---

## NODE ID STANDARD

  file: src\components\admin\shell\navCookie.ts
  function: src\components\admin\shell\navCookie.ts::navCookieName

---

## DISA AKTARILANLAR (EXPORTS)
  export: navCookieName