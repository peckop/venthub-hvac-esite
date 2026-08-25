---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\tests\e2e\helpers\denoRuntime.ts
skeleton_hash: 42dab88bacb6a9a3
entity_hashes:
  func:DenoRuntimeSimulator:cleanup: 11766b4b0651eb09
  func:DenoRuntimeSimulator:constructor: c8bd196185514286
  func:DenoRuntimeSimulator:invokeFunction: dc0f077050e69d4d
  func:DenoRuntimeSimulator:loadFunction: 3a8e0fae20ee8799
  func:DenoRuntimeSimulator:setEnv: 1c17cf0de154984a
  func:DenoRuntimeSimulator:setEnvs: ee1e05f28e0c54af
  func:DenoRuntimeSimulator:setupGlobal: 7aef53f26f9e05f4
  func:setupDenoRuntime: ced5fd77752b313f
  overview: 622e59962c13886e
generated_at: 2026-08-25T07:35:02Z
---

## Genel Bakış

Bu modül, e2e testlerinde Deno runtime ortamını simüle etmek için kullanılır. `DenoRuntimeSimulator` sınıfı ve onu oluşturan `setupDenoRuntime` fonksiyonu aracılığıyla Deno tabanlı fonksiyonların test ortamında yüklenmesini ve çalıştırılmasını sağlar.

## Fonksiyon Grupları

### Kurulum ve Yapılandırma
Simülatörün oluşturulmasını ve çalışma ortamının hazırlanmasını sağlar. Ortam değişkenlerinin atanması ve global yapılandırmaların yapılması bu gruba dahildir.
- setupDenoRuntime, constructor, setupGlobal, setEnv, setEnvs

### Fonksiyon Yürütme
Deno tabanlı fonksiyonların yüklenmesini ve bir HTTP isteği ile çalıştırılmasını sağlar. Her iki fonksiyon da asenkron olarak çalışır ve Promise döndürür.
- loadFunction, invokeFunction

### Yaşam Döngüsü Yönetimi
Simülatörün temizlenmesinden ve kaynakların serbest bırakılmasından sorumludur.
- cleanup

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `options` parametresi (`DenoRuntimeOptions` tipinde) yoksa, `setupDenoRuntime` ve `DenoRuntimeSimulator.constructor` çağrılamaz; simülatör örneği oluşturulamaz.

[Aksiyom 2]: Eğer `functionPath` parametresi verilmeden `loadFunction` çağrılırsa, fonksiyon yüklenemez; döndürülen Promise çözümlenemez.

[Aksiyom 3]: Eğer `functionPath` ile belirtilen yolda geçerli bir fonksiyon dosyası yoksa, `loadFunction` başarısız olur; sonraki `invokeFunction` çağrısında çağrılabilir bir fonksiyon elde edilemez.

[Aksiyom 4]: Eğer `request` parametresi (`Request` tipinde) verilmeden `invokeFunction` çağrılırsa, fonksiyon çalıştırılamaz; `Response` üretilemez.

[Aksiyom 5]: Eğer `setupGlobal` çağrılmadan `setEnv`, `setEnvs`, `loadFunction` veya `invokeFunction` kullanılırsa, global ortam hazır olmadığından bu işlemler beklenildiği gibi çalışmayabilir.

[Aksiyom 6]: Eğer `cleanup` çağrılmadan simülatör kullanıma kapatılırsa, ayrılan kaynaklar serbest bırakılmaz; sonraki testlerde kirli durum kalabilir.

[Aksiyom 7]: Eğer `key` parametresi verilmeden `setEnv` çağrılırsa, environment değişkeni ayarlanamaz.

[Aksiyom 8]: Eğer `envs` parametresi (`Record<string, string>` tipinde) verilmeden `setEnvs` çağrılırsa, toplu environment değişkeni ataması yapılamaz.

---

## FONKSİYON DETAYLARI

### setupDenoRuntime
**Ne yapar**: Verilen seçeneklerle bir `DenoRuntimeSimulator` örneği oluşturup döndüren bir fabrika fonksiyonudur. Deno runtime ortamını simüle etmek için giriş noktasıdır.
**Nasıl yapar**: Parametre olarak aldığı `DenoRuntimeOptions` nesnesini doğrudan `DenoRuntimeSimulator` sınıfının constructor'ına aktararak yeni bir örnek oluşturur ve bu örneği döndürür. Seçenekler boş nesne olarak varsayılan değer alır.
**Parametreler**:
- options: DenoRuntimeOptions — Deno runtime simülasyonu için yapılandırma seçenekleri; varsayılan değeri boş nesnedir (`{}`)

**Dönüş**: `DenoRuntimeSimulator` — Oluşturulan simülatör örneğini döndürür.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### setupGlobal
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### setEnv
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### setEnvs
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### loadFunction
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### invokeFunction
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### cleanup
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## INTERFACES

### DenoRuntimeOptions
- `env?: Record<string, string>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::setupDenoRuntime
- **params**: `options: DenoRuntimeOptions = {}`
- **ic_degiskenler**: yok
- **Dönüş**: `DenoRuntimeSimulator`

### [N2_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.constructor
- **params**: `options: DenoRuntimeOptions = {}`
- **ic_degiskenler**: yok
- **Dönüş**: yok
- **Yan etkiler**: `this.envs` alanını `options.env` değerinin kopyasıyla başlatır; `this.originalDeno` alanını `globalThis.Deno` referansıyla saklar; `this.setupGlobal()` metodunu çağırır

### [N3_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setupGlobal
- **params**: yok
- **ic_degiskenler**:
  - `self` — `this` referansını saklayan değişken, iç fonksiyonlardan sınıfa erişmek için kullanılır
  - `handler` — `Deno.serve` stub'ı içinde tanımlanan, yakalanan istek işleyici fonksiyonu
  - `arg1` — `serve` fonksiyonunun birinci parametresi; fonksiyon veya nesne olabilir
  - `arg2` — `serve` fonksiyonunun ikinci parametresi; opsiyonel, fonksiyon olabilir
- **Dönüş**: yok
- **Yan etkiler**: `globalThis.Deno` nesnesini stub'lar; `Deno.serve`, `Deno.env.get`, `Deno.env.set`, `Deno.env.delete`, `Deno.env.toObject` metotlarını tanımlar; yakalanan handler'ı `self.activeHandler` ve `globalThis.__last_registered_handler__` atar

### [N4_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setEnv
- **params**: `key: string`, `value: string`
- **ic_degiskenler**: yok
- **Dönüş**: yok
- **Yan etkiler**: `this.envs[key]` alanını `value` değeriyle günceller

### [N5_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setEnvs
- **params**: `envs: Record<string, string>`
- **ic_degiskenler**: yok
- **Dönüş**: yok
- **Yan etkiler**: `this.envs` alanını mevcut değerler ile `envs` parametresinin birleşimiyle değiştirir (spread operatörü ile)

### [N6_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.loadFunction
- **params**: `functionPath: string`
- **ic_degiskenler**:
  - `globalHandlers` — `globalThis.__edge_function_handlers__` erişimi; daha önce yüklenmiş handler'ların global kayıt defteri
  - `handler` — globalHandlers'tan alınan veya yüklenen istek işleyici fonksiyonu
  - `fs` — dinamik olarak import edilen Node.js `fs` modülü; dosya okuma/yazma işlemleri için
  - `path` — dinamik olarak import edilen Node.js `path` modülü; dosya yolu çözümleme için
  - `rand` — rastgele üretilen 8 karakterlik dize; derlenmiş dosya adlarında benzersizlik sağlamak için
  - `sharedDir` — `functionPath`'in dizinine göre `../_shared` dizininin mutlak yolu
  - `sharedRefRe` — `_shared/` dizinine yapılan import'ları yakalamak için kullanılan regex pattern
  - `collectSharedRefs` — kaynak kodu tarayarak `_shared/` referanslarını toplayan fonksiyon
  - `inlineSupabaseUrl` — `esm.sh/@supabase/supabase-js` URL'lerini yerel modül adına dönüştüren fonksiyon
  - `content` — `functionPath` dosyasının UTF-8 içeriği
  - `sharedNames` — bulunan tüm `_shared` dosya adlarını tutan Set
  - `queue` — BFS kuyruğu; `_shared` dosyaları arasındaki zincirleme referansları keşfetmek için
  - `name` — kuyruktan çıkarılan `_shared` dosya adı
  - `abs` — `_shared` dosyasının mutlak yolu
  - `compiledNameOf` — dosya adını derlenmiş ad formatına dönüştüren fonksiyon (`.ts` → `.compiled.{rand}.ts`)
  - `sharedCompiledPaths` — derlenmiş `_shared` dosyalarının yollarını tutan dizi
  - `src` — derlenen `_shared` dosyasının kaynak kodu
  - `other` — `_shared` dosyaları arasındaki çapraz referansları düzeltmek için kullanılan döngü değişkeni
  - `outPath` — derlenmiş `_shared` dosyasının yazılacağı tam yol
  - `compiledContent` — derlenmiş ana fonksiyon dosyasının içeriği
  - `compiledPath` — derlenmiş ana fonksiyon dosyasının yolu
  - `err` — import sırasında oluşan hata nesnesi
- **Dönüş**: `Promise<(req: Request) => Promise<Response> | Response>`
- **Yan etkiler**: Geçici derlenmiş dosyalar oluşturur ve `this.tempFiles` dizisine ekler; `this.activeHandler` ve `globalThis.__last_registered_handler__` alanlarını sıfırlar; derlenmiş modülü dinamik olarak import eder; handler'ı `globalHandlers` ve `this.handlers` Map'lerine kaydeder

### [N7_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.invokeFunction
- **params**: `functionPath: string`, `request: Request`
- **ic_degiskenler**:
  - `handler` — `this.handlers` Map'inden alınan veya `this.loadFunction` ile yüklenen istek işleyici fonksiyonu
- **Dönüş**: `Promise<Response>`
- **Yan etkiler**: Handler bulunamazsa `this.loadFunction` çağrısı yapar; handler'ı `request` parametresiyle çağırarak Response üretir

### [N8_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.cleanup
- **params**: yok
- **ic_degiskenler**:
  - `fs` — `require('fs')` ile yüklenen veya dinamik `import('fs')` ile alınan dosya sistemi modülü
  - `file` — `this.tempFiles` dizisindeki geçici dosya yolu; her biri silinmeye çalışılır
- **Dönüş**: yok
- **Yan etkiler**: `globalThis.Deno` nesnesini `this.originalDeno` değerine geri yükler veya siler; `this.tempFiles` dizisindeki tüm geçici derlenmiş dosyaları silmeye çalışır

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    denoRuntime_ts__cleanup["cleanup"]
    denoRuntime_ts__constructor["constructor"]
    denoRuntime_ts__invokeFunction["invokeFunction"]
    denoRuntime_ts__loadFunction["loadFunction"]
    denoRuntime_ts__setEnv["setEnv"]
    denoRuntime_ts__setEnvs["setEnvs"]
    denoRuntime_ts__setupDenoRuntime["setupDenoRuntime"]
    denoRuntime_ts__setupGlobal["setupGlobal"]
```

## NODE ID STANDARD

  file: denoRuntime.ts
  function: denoRuntime.ts::setupDenoRuntime
  class: denoRuntime.ts::DenoRuntimeSimulator

---

## DISA AKTARILANLAR (EXPORTS)
  export: DenoRuntimeSimulator
  export: setupDenoRuntime

---

## BILEŞIM (CONTAINS)
  contains: ((req
  contains: Record<string, string>
  contains: Request)
  contains: any
  contains: string[]