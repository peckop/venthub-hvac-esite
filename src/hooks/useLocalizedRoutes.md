---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useLocalizedRoutes.ts
skeleton_hash: 04da0f3115ca38f1
entity_hashes:
  func:createLocalizedProxy: b213c316ec0c2854
  func:useLocalizedRoutes: d8dba6cf829a1dea
  overview: 9cb31a2460306030
generated_at: 2026-06-15T17:03:48Z
---

## Genel Bakış
Bu modül, React uygulamasında tanımlı merkezi rota nesnesini, o anki aktif dile göre dinamik olarak sarmalayan bir hook ve yardımcı fonksiyonlar sağlar. Temel amacı, her dil için ayrı rota tanımları oluşturmak yerine, bir Proxy yapısı kullanarak rota erişimlerinde dil ön ekini otomatik ekleyerek URL'leri oluşturmaktır.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Temel URL yerelleştirme mantığını ve merkezi rota nesnesi üzerine dinamik bir erişim katmanı (Proxy) oluşturma işini içerir.
- `createLocalizedProxy`

### Ana Hook
Aktif dil bilgisini React Context üzerinden alarak, uygulama genelinde kullanılabilir yerelleştirilmiş bir rota nesnesi (Routes) sunar.
- `useLocalizedRoutes`

---

## AXIOMS – Mimari Varsayımlar

[Genel Varsayım]: Bu modül, çalışması için bir dil bağlamı (dil kodu) ve bu bağlamı sağlayan bir React context'e erişim gerektirir.

**Aksiyom 1:** Eğer `useLocalizedRoutes` hook'u, bir React component içinde `useLocalizedContext` veya benzeri bir context hook'u tarafından sağlanan geçerli bir `lang` (dil kodu) değeri alamıyorsa, hook geçersiz veya varsayılan (örn: 'en') bir dil koduyla çalışmaya devam eder; ancak beklenen dil seçimi çalışmaz.

**Aksiyom 2:** Eğer `createLocalizedProxy(target, lang)` fonksiyonuna `lang` parametresi olarak boş bir string (`""`) veya `undefined` verilirse, fonksiyon orijinal `target` nesnesini hiçbir dönüşüm yapmadan (URL'leri dil ön eki eklemeden) döndürür; bu durumda localizasyon başarısız olur.

**Aksiyom 3:** Eğer `createLocalizedProxy(target, lang)` fonksiyonuna `target` parametresi olarak geçersiz bir değer (örn: `null`, `undefined`, bir string) verilse ve fonksiyon bu değeri bir JavaScript Proxy nesnesine sarmaya çalışırsa, çalışma zamanı hatası oluşur veya beklenmeyen davranışlar gözlemlenir; çünkü Proxy, belirli bir nesne (Object) referansı bekler.

**Aksiyom 4:** Eğer `useLocalizedRoutes` hook'u bir React component dışından çağrılırsa (örn: bir event handler içinde veya bir utility fonksiyon içinde), React hook kurallarını ihlal edeceğinden çalışma zamanı hatası oluşur.

**Aksiyom 5:** Eğer `createLocalizedProxy` fonksiyonu tarafından oluşturulan Proxy nesnesi, asıl nesnenin (`target`) olmayan bir özelliğine erişmeye çalışırsa, `get` trap'inde tanımsız (`undefined`) değer döndürür veya bir hata fırlatır; bu durum, orijinal nesnenin yapısına bağlıdır.

---

## FONKSİYON DETAYLARI

### createLocalizedProxy

**Ne yapar**: Verilen bir nesneyi JavaScript Proxy ile sararak, tüm fonksiyon çağrılarının sonuçlarını otomatik olarak lokalize eder. Bu sayede bir route nesnesi üzerindeki fonksiyonlar çağrıldığında, dönen URL'ler seçilen dile göre otomatik dönüşüme uğrar.

**Nasıl yapar**: JavaScript Proxy nesnesi oluşturarak target nesnesinin her bir property erişimini yakalar. `get` trap'i içinde drei senaryoyu yönetir: Eğer erişilen değer bir fonksiyon ise, bu fonksiyonu bir wrapper ile sarar ve orijinal fonksiyonun döndürdüğü URL'yi `localizedHref` fonksiyonu ile dile dönüştürür. Eğer değer null olmayan bir object ise, recursive olarak kendini tekrar çağırarak iç içe nesneleri de proxy ile sarar. Diğer tüm durumlarda (primitive değerler, string'ler, sayılar vb.) değeri olduğu gibi döndürür. `Reflect.get` kullanılarak orijinal nesnenin property değeri güvenli bir şekilde alınır.

**Parametreler**:
- `target: T extends object` — Proxy ile sarılacak kaynak nesne. Fonksiyonlar veya iç içe nesneler içerebilen herhangi bir nesne tipi olabilir.
- `lang: string` — Hedef lokalizasyon dili. URL'lerin dönüştürüleceği dil kodunu belirtir (örn: "tr", "en", "de").

**Dönüş**: `T` — Orijinal nesnenin tipi ile aynı olan bir Proxy nesnesi döndürülür. TypeScript jenerik yapısı sayesinde, çağrı yapan kodun tip güvenliği korunurken, tüm property erişimleri ve fonksiyon çağrıları localize edilmiş şekilde çalışır.

### useLocalizedRoutes
**Ne yapar**: Aktif dil context'ine duyarlı, yerelleştirilmiş bir Routes proxy nesnesi döner.  
**Nasıl yapar**: `useI18n()` hook'u üzerinden aktif dili okur ve `createLocalizedProxy` fonksiyonunu kullanarak `Routes` nesnesini bu dile göre sarmalar.  
**Dönüş**: Yerelleştirilmiş rota fonksiyonlarını içeren dinamik Proxy nesnesi.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: ../utils/routes::Routes
- import: ../utils/routes::localizedHref
- import: react::useMemo

---

## TYPE ALIASES

### RouteFunction
```typescript
type RouteFunction = (...args: unknown[]) => string
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: useLocalizedRoutes.ts::createLocalizedProxy
- **params**: `(target: T, lang: string)`
- **ic_degiskenler**:
  - `value` — `Reflect.get(t, prop)` ile proxy target'ından erişilen property'nin ham değeri; fonksiyon mu nesne mi olduğunu belirlemek için kullanılır
  - `t` — Proxy handler `get` trap'indeki orijinal target referansı
  - `prop` — Proxy'ye erişilen property adı (symbol veya string)
  - `originalUrl` — `value` bir fonksiyon olduğunda, o fonksiyonun `args` ile çağrılmasından dönen orijinal URL string'i; `localizedHref`'e girdi olarak verilir
  - `args` — Proxy üzerinden çağrılan orijinal route fonksiyonuna aktarılan argümanlar dizisi
- **Dönüş**: `new Proxy(target, handler)` — `target` objesinin her property erişimini `localizedHref` ile sarmalayan proxy nesnesi (tip: T)

### [N2_NASIL] AST Pointer: useLocalizedRoutes.ts::useLocalizedRoutes
- **params**: `(yok)`
- **ic_degiskenler**:
  - `lang` — `useI18n()` hook'unun dönüşünden destructure edilen mevcut dil kodu string'i; proxy'nin href dönüştürmelerinde hangi dilin kullanılacağını belirler
- **Dönüş**: `useMemo` ile sarılmış `createLocalizedProxy(Routes, lang)` sonucu; `Routes` objesinin tüm href fonksiyonlarını otomatik localize eden proxy nesnesi; `lang` değiştiğinde yeniden hesaplanır

---

## NODE ID STANDARD

  file: src\hooks\useLocalizedRoutes.ts
  function: src\hooks\useLocalizedRoutes.ts::createLocalizedProxy
  function: src\hooks\useLocalizedRoutes.ts::useLocalizedRoutes

---

## DISA AKTARILANLAR (EXPORTS)
  export: createLocalizedProxy
  export: useLocalizedRoutes