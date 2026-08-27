---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useLocalizedRoutes.ts
skeleton_hash: 7a040af28515001e
entity_hashes:
  func:createLocalizedProxy: 4d95c08749380726
  func:useLocalizedRoutes: 7a3cb2d3169a4afe
  overview: 9cb31a2460306030
generated_at: 2026-08-27T08:36:15Z
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
**Ne yapar**: Verilen bir nesneyi JavaScript `Proxy` ile sarmalayarak, bu nesne üzerindeki fonksiyon çağrılarının ve iç içe nesne erişimlerinin otomatik olarak yerelleştirilmiş (localized) URL'ler üretmesini sağlar. Rota tanımlarını dil duyarlı hale getirmek için kullanılır.

**Nasıl yapar**: `Proxy` nesnesi oluşturarak `get` tuzağı (trap) tanımlar. Bir özelliğe erişildiğinde `Reflect.get` ile değeri alır ve üç senaryoya göre hareket eder: Eğer değer bir fonksiyonsa, bu fonksiyonu saran yeni bir fonksiyon döndürür; saran fonksiyon orijinal fonksiyonu çağırarak elde ettiği URL'yi `localizedHref` fonksiyonu ile dile göre dönüştürür. Eğer değer null olmayan bir nesneseyse, aynı mantıkla o nesne için de özyinelemeli (recursive) olarak yeni bir `createLocalizedProxy` çağrısı yapar; böylece iç içe geçmiş rota nesnelerinin tamamı yerelleştirilir. Diğer durumlarda (primitif değerler) değeri olduğu gibi döndürür.

**Parametreler**:
- target: `T` (burada `T extends object`) — Yerelleştirilecek hedef nesne. Genellikle rota tanımlarını içeren bir nesnedir.
- lang: `string` — Hedef dil kodu. URL'lerin hangi dile göre yerelleştirileceğini belirtir.

**Dönüş**: `T` tipinde bir `Proxy` nesnesi döndürür. Bu proxy, orijinal nesneyle aynı arayüze sahiptir ancak fonksiyon çağrıları ve iç içe nesne erişimleri yerelleştirilmiş URL'ler üretir.

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

### [N1_NASIL] AST Pointer: src/hooks/useLocalizedRoutes.ts::createLocalizedProxy
- **params**: `target` — T tipinde, proxy ile sarılacak hedef nesne; `lang` — string, yerelleştirme için dil kodu
- **ic_degiskenler**:
  - `t` — Proxy get handler'ında yakalanan hedef nesne (target ile aynı referans)
  - `prop` — Proxy get handler'ında erişilen özellik adı (string | symbol)
  - `value` — `Reflect.get(t, prop)` ile elde edilen özelliğin değeri
  - `args` — Özellik fonksiyon ise, o fonksiyona iletilen bilinmeyen türdeki argüman dizisi
  - `originalUrl` — `(value as RouteFunction)(...args)` çağrısından dönen orijinal URL string'i
- **Dönüş**: T — `new Proxy(target, ...)` ile oluşturulan proxy nesnesi; özellik fonksiyon ise `localizedHref(originalUrl, lang)` sonucu, nesne ise özyinelemeli `createLocalizedProxy(value, lang)` sonucu, diğer durumlarda ham değer döner

### [N2_NASIL] AST Pointer: src/hooks/useLocalizedRoutes.ts::useLocalizedRoutes
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang` — `useI18n()` çağrısından destructure edilen mevcut dil kodu
- **Dönüş**: `useMemo(() => createLocalizedProxy(Routes, lang), [lang])` — `lang` değişkenine bağlı olarak hesaplanan, `Routes` nesnesinin yerelleştirilmiş proxy kopyası

---

## NODE ID STANDARD

  file: src\hooks\useLocalizedRoutes.ts
  function: src\hooks\useLocalizedRoutes.ts::createLocalizedProxy
  function: src\hooks\useLocalizedRoutes.ts::useLocalizedRoutes

---

## DISA AKTARILANLAR (EXPORTS)
  export: createLocalizedProxy
  export: useLocalizedRoutes