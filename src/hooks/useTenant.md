---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useTenant.tsx
skeleton_hash: a75eef71f2e931f3
entity_hashes:
  func:TenantProvider: 55e323a184679af4
  func:useTenant: 1b557639af7ddf07
  overview: ea8d03008ab03037
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T08:36:25Z
---

## Genel Bakış
Bu modül, uygulama genelinde kiracı (tenant) yapılandırmasının paylaşılmasını sağlayan bir React Context mekanizması sunar. TenantProvider bileşeni, alt bileşenlere yapılandırma değerini aktarır; useTenant hook'u ise bu değeri tüketmek için kullanılır.

## Fonksiyon Grupları

### Context Sağlayıcı
Kiracı yapılandırmasını React bileşen ağacı boyunca erişilebilir kılan provider bileşenidir. value özelliği aracılığıyla aldığı yapılandırma verisini alt bileşenlere iletir.
- TenantProvider

### Context Tüketici
Mevcut kiracı yapılandırmasına erişim sağlayan custom hook'tur. TenantProvider tarafından sağlanan context değerini okuyarak TenantConfig tipinde bir nesne döndürür.
- useTenant

---

## AXIOMS – Mimari Varsayımlar

Bu modül, tenant (kiracı) yapılandırma bilgisini React bileşen ağacı boyunca sağlayan bir Context/Hook modülüdür.

[Aksiyom 1]: Eğer `useTenant` hook'u, bir `TenantProvider` bileşeni tarafından sarılmamış bir bileşen ağacında çağrılırsa, `TenantContext`'ten okunan değer tanımsız (undefined) olur ve `TenantConfig` tipinde geçerli bir nesne döndürülemez.

[Aksiyom 2]: Eğer `TenantProvider` bileşenine `value` prop'u sağlanmazsa, context değeri tanımsız olur ve alt bileşenlerdeki `useTenant` çağrısı geçerli bir `TenantConfig` elde edemez.

[Aksiyom 3]: Eğer `TenantContext` bir React context nesnesi olarak oluşturulmamışsa, `TenantProvider` ve `useTenant` işlevsiz kalır; provider değer iletemez, hook değer okuyamaz.

---

## FONKSİYON DETAYLARI

### TenantProvider
**Ne yapar**: React bileşeni olarak çalışır ve alt bileşenlere (`children`) kiracı (tenant) yapılandırma bilgisini (`value`) sağlamak için `TenantContext.Provider` sarmalayıcısı görevi görür. Bu bileşen, uygulama genelinde kiracı bilgisinin erişilebilir olmasını sağlayan temel yapılandırma katmanıdır.

**Nasıl yapar**: Gelen `value` ve `children` parametrelerini doğrudan `TenantContext.Provider` bileşenine aktarır. `value` prop'u aracılığıyla sağlanan kiracı yapılandırması, alt bileşen ağacındaki tüm `useTenant` hook'u çağrıları tarafından erişilebilir hale gelir. Bileşen herhangi bir ek işlem, filtreleme veya dönüştürme yapmaz; sadece context sağlama mekanizması olarak çalışır.

**Parametreler**:
- value: `TenantProviderProps["value"]` — Kiracı yapılandırma bilgisini içeren nesne. Bu değer, `TenantContext.Provider`'a doğrudan aktarılır ve alt bileşenler tarafından `useTenant` hook'u aracılığıyla okunabilir.
- children: `TenantProviderProps["children"]` — Kiracı context'inin sağlanacağı alt React bileşenleri.

**Dönüş**: JSX elementi döndürür. `TenantContext.Provider` bileşeni içinde sarılmış `children` bileşenlerini render eder.

### useTenant
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../utils/tenantServer::type { TenantConfig }
- import: react::React
- import: react::createContext
- import: react::useContext

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
- **params**: `value` — TenantProviderProps tipinde, TenantContext.Provider'a aktarılacak değer; `children` — TenantProviderProps tipinde, Provider içinde render edilecek alt bileşenler
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi — `<TenantContext.Provider>` içinde `children` render edilir, `value` prop olarak verilir

### [N2_NASIL] AST Pointer: src/hooks/useTenant.tsx::useTenant
- **params**: yok
- **ic_degiskenler**:
  - `context` — `useContext(TenantContext)` çağrısıyla elde edilen mevcut tenant yapılandırması; undefined ise hata fırlatır
  - `isDefaultTenant` — `context.id === 'd3b07384-d113-495f-a558-8c38634e0000'` veya `context.subdomain === 'default'` koşullarından biri sağlanırsa `true` olan boolean değer
  - `viewer3d` — `isDefaultTenant` true ise veya `context.features?.viewer3d` undefined ise `true`, aksi halde `!!context.features.viewer3d` sonucu olan boolean
  - `engineeringCalculators` — `isDefaultTenant` true ise veya `context.features?.engineeringCalculators` undefined ise `true`, aksi halde `!!context.features.engineeringCalculators` sonucu olan boolean
  - `pdfExports` — `isDefaultTenant` true ise veya `context.features?.pdfExports` undefined ise `true`, aksi halde `!!context.features.pdfExports` sonucu olan boolean
- **Dönüş**: `TenantConfig` — `context` değerini spread edip `features` alanını `viewer3d`, `engineeringCalculators`, `pdfExports` ile üzerine yazarak döndürür

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