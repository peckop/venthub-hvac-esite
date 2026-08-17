---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\shell\themeCookie.ts
skeleton_hash: 2c7c17fe1487aba8
entity_hashes:
  func:adminThemeCookieName: 1a1e272b635e1209
  func:parseAdminTheme: 9536bc7f12912b75
  func:serializeAdminTheme: 435f2c545db53218
  overview: aa8fce602e3b1c9d
generated_at: 2026-08-15T18:15:44Z
---

## Genel Bakış
Bu modül, admin panelinin tema tercihlerinin (örneğin koyu/aydınlık mod, renk vurgusu) tarayıcı çerezleri (cookies) üzerinden saklanması ve okunması için gerekli yardımcı fonksiyonları içerir. Temelde, çerez adını oluşturmayı, tema tercihlerini depolanabilir bir metin formatına dönüştürmeyi ve bu metinden tercihleri yeniden yapılandırmayı sağlar. Modül, admin shell bileşenleri tarafından tema yönetimi süreçlerinde bağımsız bir yardımcı (utility) katman olarak kullanılır.

## Fonksiyon Grupları
### Çerez Adı Oluşturma
Bu grup, belirli bir kiracıya (tenant) özgü çerez adını üretmekle sorumludur, böylece farklı kiracıların tema ayarları birbirine karışmaz.
- adminThemeCookieName

### Tema Verisi Serileştirme ve Ayrıştırma
Bu grup, iç tema tercihlerini ve çözülmüş (resolved) değerleri depolanabilir bir metin dizisine dönüştürmeyi (serialize) ve bu metinden tercihleri geri okuyarak yapılandırmayı (parse) sağlar.
- serializeAdminTheme, parseAdminTheme

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin tema tercihlerinin cookie tabanlı depolanması için aşağıdaki mimari varsayımları içerir.

[Aksiyom 1]: Eğer `tenantId` parametresi boş string veya geçersiz bir değerse, `adminThemeCookieName` tarafından üretilen cookie adı tutarsız veya çakışmaya açık olur.

[Aksiyom 2]: Eğer `serializeAdminTheme` tarafından üretilen string, `parseAdminTheme`'ın beklediği formatı karşılamıyorsa, tema tercihi bozulur ve geçersiz parsed değer döner.

[Aksiyom 3]: Eğer `raw` parametresi undefined ise, `parseAdminTheme` varsayılan veya boş bir `ParsedAdminTheme` döndürmelidir.

[Aksiyom 4]: Eğer `ADMIN_THEME_COOKIE_MAX_AGE` sabiti geçerli bir saniye cinsinden süre içermiyorsa, cookie'nin tarayıcıda kalma süresi belirsiz olur.

[Aksiyom 5]: Eğer `preference` veya `resolved` parametrelerinden herhangi biri null veya beklenmeyen bir tipteyse, `serializeAdminTheme` geçersiz bir string üretir.

---

## FONKSİYON DETAYLARI

### adminThemeCookieName
**Ne yapar**: Bu fonksiyon, belirli bir kiracıya (tenant) ait admin tema çerezinin benzersiz adını oluşturur. Her kiracının kendi tema ayarını saklaması için özel bir çerez adı üretir.

**Nasıl yapar**: Fonksiyon, verilen `tenantId` parametrelerini bir string template literal kullanarak `"vh_admin_theme_"` önekiyle birleştirir. Bu, her kiracının çerezlerinin birbiriyle çakışmasını önler ve çerezlerin kiracı bazlı izole edilmesini sağlar.

**Parametreler**:
- tenantId: string — Tema ayarının ait olduğu kiracının benzersiz tanımlayıcısı.

**Dönüş**: string — Oluşturulan, formatı `"vh_admin_theme_{tenantId}"` olan çerez adı.

### serializeAdminTheme
**Ne yapar**: Admin tema tercihini ve bu tercihe karşılık gelen çözülmüş (gerçek uygulanan) tema değerini tek bir string formatında birleştirerek saklanabilir hale getirir.

**Nasıl yapar**: Fonksiyon, `preference` ve `resolved` parametrelerini alır ve aralarına `:` (iki nokta üst üste) karakteri koyarak bir string oluşturur. Bu basit bir serileştirme formatıdır ve `parseAdminTheme` fonksiyonu tarafından tersine dönüştürülebilir.

**Parametreler**:
- preference: AdminThemePreference — Kullanıcının seçtiği tema tercihi (light, dark veya system olabilir).
- resolved: AdminThemeResolved — Tercihe göre aslında uygulanan veya çözülen somut tema (light veya dark).

**Dönüş**: string — `"preference:resolved"` formatında serileştirilmiş tema bilgisi.

### parseAdminTheme
**Ne yapar**: Bir çerez değerinden alınan ham string'i ayrıştırarak yapılandırılmış bir `ParsedAdminTheme` nesnesine dönüştürür. Bozuk veya tanınmayan değerleri sessizce varsayılan ayara düşürerek hata yönetimi yapar.

**Nasıl yapar**: Fonksiyon, ham string'i `:` karakterinden bölerek iki parçaya ayırır. İlk parça (`rawPreference`) 'light', 'dark' veya 'system' değerlerinden biriyle eşleşmeli; eşleşmezse `ADMIN_THEME_DEFAULT` kullanılır. İkinci parça (`rawResolved`) sadece 'light' veya 'dark' olabilir. Tercih 'system' ise çözülmüş değer çerezden alınmaya çalışılır, bu da mümkün değilse `ADMIN_THEME_RESOLVED_DEFAULT` kullanılır. Diğer durumlarda (light veya dark tercih edildiğinde), çözülmüş değer doğrudan tercihin kendisine eşitlenir; çerezdeki çözüm parçası yok sayılır. Bu mantık, çerezin elle düzenlenmesi durumunda bile tutarlı bir durum sağlar.

**Parametreler**:
- raw: string | undefined — Ayrıştırılacak ham çerez değeri. `undefined` olabilir.

**Dönüş**: ParsedAdminTheme — `{ preference: AdminThemePreference, resolved: AdminThemeResolved }` yapısında bir nesne. Tercihin ve uygulanan somut temanın bilgisini içerir.

---

## INTERFACES

### ParsedAdminTheme
- `preference: AdminThemePreference`
- `resolved: AdminThemeResolved`

---

## TYPE ALIASES

### AdminThemePreference
ADMIN TEMA TERCİHİ — çerez sözleşmesi Neden çerez, localStorage değil: localStorage SUNUCUDA okunamaz. Tercih sunucuda bilinmezse ilk boyama daima varsayılan temayla yapılır ve koyu temayı seçmiş kullanıcı her sayfa yüklemesinde beyaz bir kare görür (FOUC). Aynı gerekçeyle sol menü tercihi de çerezd
```typescript
type AdminThemePreference = 'light' | 'dark' | 'system'
```

### AdminThemeResolved
```typescript
type AdminThemeResolved = 'light' | 'dark'
```

---

## SABİTLER
- **ADMIN_THEME_COOKIE_MAX_AGE** (binary_expression) — `60 * 60 * 24 * 365`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/admin/shell/themeCookie.ts::adminThemeCookieName`
- **params**: `tenantId: string` — tenant tanımlayıcısı, cookie adının bir parçası olarak kullanılır
- **ic_degiskenler**: (yok)
- **Dönüş**: Template literal `` `vh_admin_theme_${tenantId}` `` — tenant'a özel cookie adı döndürür

---

### [N2_NASIL] AST Pointer: `src/components/admin/shell/themeCookie.ts::serializeAdminTheme`
- **params**:
  - `preference: AdminThemePreference` — kullanıcının tema tercihi (light/dark/system)
  - `resolved: AdminThemeResolved` — sonucu çözülmüş tema değeri (light/dark)
- **ic_degiskenler**: (yok)
- **Dönüş**: Template literal `` `${preference}:${resolved}` `` — iki değeri `:` ile birleştirerek cookie değeri üretir

---

### [N3_NASIL] AST Pointer: `src/components/admin/shell/themeCookie.ts::parseAdminTheme`
- **params**: `raw: string | undefined` — cookie'den okunan ham değer, tanımsız olabilir
- **ic_degiskenler**:
  - `[rawPreference, rawResolved]` — `raw` değerinin (boş stringe fallback ile) `:` karakteriyle split edilmesiyle elde edilen destructured array; `rawPreference` tercihi, `rawResolved` ise çözülmüş değeri tutar
  - `preference: AdminThemePreference` — `rawPreference`'ın `light`, `dark` veya `system` olup olmadığına göre doğrulanmış tema tercihi; geçersizse `ADMIN_THEME_DEFAULT` sabitine düşer
  - `resolvedFromCookie: AdminThemeResolved | null` — `rawResolved`'ın `light` veya `dark` olup olmadığına göre çözülmüş değer ya da `null`
  - `resolved: AdminThemeResolved` — nihai çözülmüş tema; `preference === 'system'` ise `resolvedFromCookie` (yoksa `ADMIN_THEME_RESOLVED_DEFAULT`) kullanılır, değilse `preference`'ın kendisi döndürülür
- **Dönüş**: `{ preference, resolved }` — `ParsedAdminTheme` nesnesi döndürür

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    themeCookie_ts__adminThemeCookieName["adminThemeCookieName"]
    themeCookie_ts__parseAdminTheme["parseAdminTheme"]
    themeCookie_ts__serializeAdminTheme["serializeAdminTheme"]
```

## NODE ID STANDARD

  file: src\components\admin\shell\themeCookie.ts
  function: src\components\admin\shell\themeCookie.ts::adminThemeCookieName
  function: src\components\admin\shell\themeCookie.ts::serializeAdminTheme
  function: src\components\admin\shell\themeCookie.ts::parseAdminTheme

---

## DISA AKTARILANLAR (EXPORTS)
  export: ADMIN_THEME_COOKIE_MAX_AGE
  export: AdminThemePreference
  export: AdminThemeResolved
  export: adminThemeCookieName
  export: parseAdminTheme
  export: serializeAdminTheme