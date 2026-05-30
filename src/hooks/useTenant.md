---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useTenant.tsx
skeleton_hash: 3dd2073efcae03d8
entity_hashes:
  func:TenantProvider: 16227bbe335256af
  func:useTenant: 29a7443f19ec9980
  overview: ea8d03008ab03037
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-30T20:24:39Z
---

## Genel Bakış
Bu modül, uygulama genelinde tenant (kiracı) yapılandırma bilgilerini yönetmek ve sağlamak için kullanılır. Temel olarak bir React Context sağlayıcısı ve bu bağlamdaki değerleri tüketmek için bir hook oluşturur. Bu yapı, farklı kiracı verilerinin bileşenler arasında tutarlı bir şekilde paylaşılmasını mümkün kılar.

## Fonksiyon Grupları
### Context Sağlayıcı
Uygulamanın belirli bir bölgesine veya tümüne, tenant ile ilgili yapılandırma değerlerini sağlamakla sorumludur.
- TenantProvider

### Erişim Hook'u
Tenant yapılandırma bilgilerine, sağlayıcı içindeki herhangi bir bileşenden erişim imkanı sunar.
- useTenant

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React Context API kullanarak tenant (kiracı) bilgisini alt bileşenlere sağlayan bir sağlayıcı-tüketici (provider-consumer) kalıbı uygular.

**[Aksiyom 1 – Provider Zorunluluğu]:** Eğer `useTenant()` çağrılan herhangi bir bileşen, bir `TenantProvider` içinde sarılmamışsa, `TenantContext` değeri `undefined`/`null` olur ve bileşen geçerli bir tenant bilgisine erişemez.

**[Aksiyom 2 – Value Prop Zorunluluğu]:** Eğer `TenantProvider`'a `value` prop'u sağlanmamışsa (fonksiyon imzasında default değer yoktur), geçersiz bir `undefined` değer bağlanır ve alt bileşenler hatalı tenant verisi alır.

**[Aksiyom 3 – Children Prop Zorunluluğu]:** Eğer `TenantProvider`'a `children` prop'u sağlanmamışsa, provider hiçbir alt bileşen sarmalamaz ve `useTenant()` hiçbir bileşen tarafından çağrılamaz; provider anlamsız (no-op) olur.

**[Aksiyom 4 – Tekrarlı Sarmalama Riski]:** Eğer `TenantProvider` kendi içinden başka bir `TenantProvider` ile sarmalanırsa, iç içe bağlanan her `value` prop'u önceki değeri覆蓋 (override) eder; dıştaki provider'ın değeri `useTenant()` çağrısıyla erişilemez hale gelir.

**[Aksiyom 5 – Tek Kullanım Bağlamı]:** Eğer `TenantContext` başka bir bağlamda (başka bir component tree'de) çağrılmışsa ve o ağaçta `TenantProvider` bulunmuyorsa, `useTenant()` geçerli bir değer üretemez.

---

## FONKSİYON DETAYLARI

### TenantProvider
**Ne yapar**: Tenant bilgilerini (kiracı yapılandırmasını) tüm alt bileşenlere erişilebilir hale getirmek için React Context Provider olarak görev yapar. Uygulama genelinde tenant verisinin prop drilling olmadan paylaşılmasını sağlar.

**Nasıl yapar**: `TenantContext.Provider` bileşenini sarmalayarak, `value` prop'u olarak aldığı tenant yapılandırmasını React'ın context mekanizması aracılığıyla tüm alt bileşen zincirine aktarır. Sadece sarmalama (wrapping) işlemi yapar, herhangi bir veri dönüşümü veya mantık içermez.

**Parametreler**:
- `value`: `TenantConfig` — Alt bileşenlere dağıtılacak olan tenant yapılandırma nesnesi. ID, subdomain, özellik bayrakları gibi tüm tenant bilgilerini barındırır.
- `children`: `React.ReactNode` — Provider içerisine yerleştirilecek alt bileşenler. Bu bileşenler Provider'ın çocuğu olarak context değerine erişebilir.

**Dönüş**: `JSX.Element` — `TenantContext.Provider` ile sarmalanmış children bileşenlerini döndürür.

### useTenant
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## INTERFACES

### TenantProviderProps
- `value: TenantConfig`
- `children: React.ReactNode`

---

## SABİTLER
- **TenantContext** (call) — `createContext<TenantConfig | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useTenant.tsx::TenantProvider
- **params**: `{ value, children }` — `value` context olarak sağlanan tenant yapılandırması, `children` olarak render edilecek React elemanları
- **ic_degiskenler**:
  - Yok — parametreler doğrudan JSX içinde kullanılıyor
- **Dönüş**: JSX elemanı (`<TenantContext.Provider>` ile sarmalanmış children)

### [N2_NASIL] AST Pointer: src/hooks/useTenant.tsx::useTenant
- **params**: Yok
- **ic_degiskenler**:
  - `context` — `useContext(TenantContext)` ile alınan mevcut tenant context değeri
  - `isDefaultTenant` — tenant'ın varsayılan tenant olup olmadığını kontrol eden boolean bayrak
  - `viewer3d` — 3D görüntüleyici özelliğinin aktif olup olmadığını belirleyen boolean
  - `engineeringCalculators` — mühendislik hesaplayıcılarının aktif olup olmadığını belirleyen boolean
  - `pdfExports` — PDF dışa aktarma özelliğinin aktif olup olmadığını belirleyen boolean
- **Dönüş**: `TenantConfig` — orijinal context'i genişletilmiş ve özellik bayrakları hesaplanmış yapılandırma nesnesi

---

## NODE ID STANDARD

  file: src\hooks\useTenant.tsx
  function: src\hooks\useTenant.tsx::TenantProvider
  function: src\hooks\useTenant.tsx::useTenant

---

## DISA AKTARILANLAR (EXPORTS)
  export: TenantProvider
  export: TenantProviderProps
  export: useTenant

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)