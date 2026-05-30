---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useTenant.tsx
skeleton_hash: 3d8ee542900cffd2
entity_hashes:
  func:TenantProvider: 55e323a184679af4
  func:useTenant: 1b557639af7ddf07
  overview: ea8d03008ab03037
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-30T21:35:31Z
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

**Ne yapar**: Tenant (kiracı) yapılandırma bilgilerini alt bileşenlere sağlamak için React Context Provider olarak görev yapar. Uygulama içindeki tüm bileşenlerin kiracıya özel ayarlara erişebilmesini mümkün kılar.

**Nasıl yapar**: `TenantContext.Provider` bileşenini sarmalayarak, `value` propundan gelen `TenantConfig` nesnesini tüm alt bileşen hiyerarşisine aktarır. Bu sayede derinlerdeki herhangi bir bileşen, prop drilling yapmaksızın kiracı bilgilerine ulaşabilir. Bileşen saf bir sarmalayıcıdır ve herhangi bir mantık içermez.

**Parametreler**:
- `value`: `TenantConfig` — Alt bileşenlere aktarılacak kiracı yapılandırma nesnesi. Kiracının kimliği, alt alanı, özellik bayrakları gibi tüm bilgileri içerir.
- `children`: `React.ReactNode` — Provider içinde sarılacak alt bileşenler. Bu prop, provider'ın içeriğinde rendered her şeyi kapsar.

**Dönüş**: `JSX.Element` — `TenantContext.Provider` ile sarılmış children bileşenlerini döndürür.

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
- **params**: `value` — Provider'a geçirilen TenantConfig değeri, alt bileşenlere context olarak sağlanır; `children` — Provider içinde sarılan React çocuk bileşenleri
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<TenantContext.Provider>` ile sarılmış children bileşenleri döner

### [N2_NASIL] AST Pointer: src/hooks/useTenant.tsx::useTenant
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — `useContext(TenantContext)` çağrısıyla elde edilen TenantConfig değeri; mevcut tenant bilgilerini tutar
  - `isDefaultTenant` — Boolean; tenant'ın varsayılan tenant olup olmadığını kontrol eder (`context.id === 'd3b07384-d113-495f-a558-8c38634e0000'` veya `context.subdomain === 'default'`)
  - `viewer3d` — Boolean; 3D görüntüleyici özelliğinin aktif olup olmadığını belirler — varsayılan tenant ise veya `context.features?.viewer3d` undefined ise `true`, aksi halde `!!context.features.viewer3d` değeri alınır
  - `engineeringCalculators` — Boolean; mühendislik hesaplayıcı özelliğini belirler — aynı mantıkla hesaplanır
  - `pdfExports` — Boolean; PDF dışa aktarma özelliğini belirler — aynı mantıkla hesaplanır
- **Dönüş**: `TenantConfig` — `context` objesinin spread edilip `features` alanının `viewer3d`, `engineeringCalculators`, `pdfExports` değerleriyle genişletilmiş hali; context undefined ise `Error` fırlatılır

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