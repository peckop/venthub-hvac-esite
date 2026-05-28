---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\I18nContext.ts
skeleton_hash: 302e96caa0762906
entity_hashes:
  overview: 62a58f78d8be0f4b
generated_at: 2026-05-28T22:37:51Z
---

## Genel Bakış
`src\i18n\I18nContext.ts` modülü, VentHub HVAC projesinin uluslararasılaştırma (i18n) sisteminin temelini oluşturan React bağlam dosyasıdır. Proje içindeki tüm React bileşenlerinin ortak dil verilerine erişmesini sağlamak amacıyla React'in yerel `createContext` aracı kullanılarak bir `I18nContext` bağlam nesnesi oluşturur. Modül içerisinde herhangi bir özel işlev, ortam değişkeni veya harici sistem sorgulaması gerçekleştirilmez; yalnızca projenin yerel Türkçe dil sözlüğünü içe aktararak bağlam için temel dil kaynağını hazırlar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, uygulama genelinde uluslararasılaştırma (i18n) verilerini paylaşmak için React Context tabanlı I18nContext bağlamını sağlar, çalışması için context sağlama ve tüketme mekanizmalarını destekleyen bir React ortamında çalışması zorunludur.

[Aksiyom 1]: Eğer modülün çalıştığı ortam React Context API'sini desteklemiyorsa, I18nContext tanımı geçersiz olur, hiçbir i18n operasyonu çalışmaz.
[Aksiyom 2]: Eğer I18nContext, kendi sağlayıcısı (Provider) ile uygulama bileşen ağacında sarmalanmadan kullanılırsa, tüm context'i tüketen bileşenler i18n ile ilgili verilere erişemez, uygulama arayüzündeki tüm metinler çevirisiz kalır.
[Aksiyom 3]: Eğer I18nContext Provider'ı tarafından context içerisine geçerli dil ayarı ve çeviri sözlükleri aktarılmazsa, uygulama içerisindeki tüm çeviri istekleri başarısız olur, hiçbir metin doğru şekilde yerelleştirilemez.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### I18nContextType
- `lang: Lang`
- `setLang: (l: Lang) => void`
- `t: (key: string, paramsOrAlt?: Record<string, unknown> | string) => string`
- `dict: AppDictionary`

---

## TYPE ALIASES

### Lang
```typescript
type Lang = 'tr' | 'en'
```

### AppDictionary
```typescript
type AppDictionary = typeof tr
```

---

## SABİTLER
- **I18nContext** (call) — `createContext<I18nContextType | null>(null)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\i18n\I18nContext.ts::I18nContext
- **params**: (createContext çağrısına iletilen parametreler kaynakta belirtilmemiş)
- **ic_degiskenler**:
  - `createContext` — React'ten içe aktarılan context oluşturma fonksiyonu, I18nContext nesnesini üretmek için çağrılır
  - `tr` — ./dictionaries/tr konumundan içe aktarılan Türkçe dil sözlüğü, dosya kapsamında tanımlı
- **Dönüş**: React Context nesnesi, uluslararasılaştırma operasyonları için kullanılmak üzere oluşturulmuştur

---

## NODE ID STANDARD

  file: src\i18n\I18nContext.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppDictionary
  export: I18nContext
  export: I18nContextType
  export: Lang