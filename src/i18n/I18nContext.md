---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\I18nContext.ts
skeleton_hash: e6d6e8b6a44ec265
entity_hashes:
  overview: 0ce19631cc889ffb
generated_at: 2026-06-06T08:44:39Z
---

## Genel Bakış
`src/i18n/I18nContext.ts` modülü, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısını tanımlayan bir React bağlam dosyasıdır. Dosya düzeyinde `createContext` kullanılarak `I18nContext` oluşturulur ve projedeki tüm bileşenlerin dil ayarlarına, çeviri fonksiyonuna (`t`) ve sözlük verilerine erişmesi sağlanır. Modül herhangi bir ortam değişkeni, harici API veya veritabanı sorgulaması yapmaz; yalnızca yerel Türkçe sözlüğü içe aktararak bağlam için temel dil kaynağını hazırlar.

## Modül Yapısı (Tanımlar)
### Bağlam ve Tipler
Modül, projede kullanılacak dil seçeneklerini (`tr` | `en`) temsil eden `Lang` tipini ve çeviri sisteminin sözleşme yapısını tanımlar.

- **I18nContextType** — Bağlamda taşınan verilerin yapısını belirler: geçerli dil ayarı, dil değiştirme fonksiyonu, çeviri fonksiyonu ve aktif sözlük nesnesi.
- **I18nContext** — `createContext` ile oluşturulmuş, uygulama geninde `Provider` aracılığıyla tüketilecek React bağlam nesnesidir.
- **Sözlük Bağımlılığı** — `tr` (Türkçe) sözlüğü `./dictionaries/tr` yolundan içe aktarılır; bağlamın varsayılan dil kaynağı olarak kullanılır.

---



---

## FONKSİYON DETAYLARI

---

## INTERFACES

### I18nContextType
- `lang: Lang`
- `setLang: (l: Lang) => void`
- `t: (key: TranslationKeyInput, paramsOrAlt?: Record<string, unknown> | string) => string`
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

### NestedKeyOf
```typescript
type NestedKeyOf = <T, Prefix extends string = ''>
```

### TranslationKeys
```typescript
type TranslationKeys = NestedKeyOf<typeof tr>
```

### TranslationKeyInput
Geçiş stratejisi: Autocomplete sağlar ama henüz sözlükte olmayan string literal anahtarları da kabul eder.
```typescript
type TranslationKeyInput = TranslationKeys | (string & Record<never, never>)
```

---

## SABİTLER
- **I18nContext** (call) — `createContext<I18nContextType | null>(null)`

---

## AST POINTERS

Bu dosyada **fonksiyon gövdesi bulunmamaktadır**. Dosya yalnızca bir React Context nesnesi oluşturur ve dışa aktarır.

---

### [N1_NASIL] AST Pointer: i18n/I18nContext.ts::I18nContext (Context Oluşturma)

- **params**: —
- **ic_degiskenler**:
  - `I18nContext` — `createContext(tr)` çağrısı ile oluşturulan React Context nesnesi; uygulama genelinde çeviri (i18n) değerlerini sağlamak için kullanılır; başlangıç değeri olarak `tr` sözlüğü (Türkçe) verilmiştir
- **Dönüş**: — (dosya düzeyinde sadece `I18nContext` sabiti tanımlanıp export edilir; fonksiyon dönüşü yoktur)

---

**Not:** Bu dosyada herhangi bir fonksiyon gövdesi, method veya sınıf tanımı bulunmamaktadır. Dosyanın tek amacı `createContext` çağrısı ile bir context nesnesi oluşturup dışa aktarmaktır.

---

## NODE ID STANDARD

  file: src\i18n\I18nContext.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppDictionary
  export: I18nContext
  export: I18nContextType
  export: Lang
  export: TranslationKeyInput
  export: TranslationKeys