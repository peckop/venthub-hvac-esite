---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\helpers\denoRuntime.ts
skeleton_hash: 7661456bfb584d1a
entity_hashes:
  func:DenoRuntimeSimulator:cleanup: 11766b4b0651eb09
  func:DenoRuntimeSimulator:constructor: c8bd196185514286
  func:DenoRuntimeSimulator:invokeFunction: dc0f077050e69d4d
  func:DenoRuntimeSimulator:loadFunction: d7add3f795080ab6
  func:DenoRuntimeSimulator:setEnv: 1c17cf0de154984a
  func:DenoRuntimeSimulator:setEnvs: ee1e05f28e0c54af
  func:DenoRuntimeSimulator:setupGlobal: 7aef53f26f9e05f4
  func:setupDenoRuntime: ced5fd77752b313f
  overview: 622e59962c13886e
generated_at: 2026-05-30T20:35:16Z
---

## Genel Bakış

Bu modül, uçucu (edge) fonksiyonların uçtan uca testleri için yalıtılmış bir Deno çalışma zamanı simülatörü sağlar. Temel amacı, testler sırasında gerçek bir Deno Deploy ortamına ihtiyaç duymadan fonksiyonları yükleyip çalıştırılabilir hale getirmektir.

## Fonksiyon Grupları

### Çalışma Zamanı Kurulumu
Test ortamını başlatmak ve yapılandırmakla sorumludur. Tek bir üst düzey kurulum fonksiyonu sunar ve simülatörün iç durumunu hazırlanmış bir şekilde teslim eder.
- `setupDenoRuntime`, `constructor`, `setupGlobal`

### Ortam Değişkeni Yönetimi
Test senaryoları sırasında gerekli olan ortam değişkenlerini (API anahtarı, bayraklar vb.) tanımlamak ve değiştirmek için kullanılır. Tekli ve toplu ayarlama imkânı sağlar.
- `setEnv`, `setEnvs`

### Fonksiyon Yükleme ve Çalıştırma
Belirtilen dosya yolundaki uçucu fonksiyonu yükler ve sağlanan HTTP isteğiyle çağırır. Bu grup, modülün asıl test hedefi olan istek–yanıt döngüsünü yürütür.
- `loadFunction`, `invokeFunction`

### Temizlik
Test çalıştıktan sonra oluşturulan kaynakları (küresel değişkenler, referanslar) serbest bırakarak bir sonraki testin yalıtılmış biçimde çalışmasını保证lar.
- `cleanup`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Deno runtime ortamını simüle eden bir test yardımcı modülüdür. Aşağıda modülün doğru çalışması için gerekli mimari varsayımlar listelenmektedir.

---

**[Aksiyom 1]:** Eğer `DenoRuntimeSimulator.constructor()` çağrılmadan önce `setupDenoRuntime()` fonksiyonu çağrılmamışsa, geçerli bir `DenoRuntimeOptions` nesnesi oluşturulamaz ve simülatör geçersiz bir durumda başlar.

**[Aksiyom 2]:** Eğer `DenoRuntimeSimulator.setupGlobal()` fonksiyonu çağrılmadan önce `setEnv()`, `setEnvs()`, `loadFunction()` veya `invokeFunction()` fonksiyonlarından biri çağrılırsa, global Deno ortamı henüz hazırlanmadığından bu işlemler başarısız olur.

**[Aksiyom 3]:** Eğer `loadFunction(functionPath)` fonksiyonu çağrılmadan `invokeFunction(functionPath, request)` fonksiyonu çağrılırsa, çağrılacak işlev runtime'a yüklenmediğinden `invokeFunction` başarısız olur.

**[Aksiyom 4]:** Eğer `cleanup()` fonksiyonu çağrıldıktan sonra `setEnv()`, `setEnvs()`, `loadFunction()` veya `invokeFunction()` gibi fonksiyonlardan herhangi biri tekrar çağrılırsa, temizlik işlemi yapıldığı için bu işlemler başarısız olur.

**[Aksiyom 5]:** Eğer `invokeFunction(functionPath, request)` fonksiyonunda `request` parametresi geçerli bir `Request` nesnesi değilse, fonksiyon geçersiz istek nedeniyle hata verir.

**[Aksiyom 6]:** Eğer `setEnv(key, value)` fonksiyonunda `key` boş bir string ise veya `setEnvs(envs)` fonksiyonunda `envs` boş bir nesne `{}` ise, hiçbir environment değişkeni ayarlanmaz ve runtime mevcut environment değerleriyle çalışmaya devam eder.

**[Aksiyom 7]:** Eğer `options` parametresi `DenoRuntimeOptions` tipinde değilse veya zorunlu alanları içermiyorsa, `setupDenoRuntime()` fonksiyonu hata fırlatır.

---

## FONKSİYON DETAYLARI

### setupDenoRuntime
**Ne yapar**: Bir `DenoRuntimeSimulator` nesnesi oluşturup döndüren fabrika fonksiyonudur. Bu, Deno çalışma zamanı simülasyonunun başlangıç noktasıdır ve test ortamını hazırlar.
**Nasıl yapar**: Verilen seçenekler (options) nesnesini alır ve `DenoRuntimeSimulator` sınıfından yeni bir实例 oluşturarak döndürür. Eğer seçenek belirtilmemişse varsayılan boş bir nesne kullanılır.
**Parametreler**:
- options: DenoRuntimeOptions — Simülasyon için kullanılacak seçenekler nesnesi. Ortam değişkenleri gibi yapılandırma ayarlarını içerir.
**Dönüş**: DenoRuntimeSimulator — Oluşturulan ve yapılandırılmış simülasyon nesnesi.

### constructor
**Ne yapar**: `DenoRuntimeSimulator` sınıfının yapıcı metodudur ve nesne başlatılırken gerekli iç durumları ayarlar.
**Nasıl yapar**: Seçenekler nesnesinden ortam değişkenlerini (`env`) kopyalayarak `this.envs` özelliğine atar. Mevcut global `Deno` nesnesini (`globalThis.Deno`) saklar (`originalDeno`) ve `setupGlobal` metodunu çağırarak sahte Deno ad alanını kurar.
**Parametreler**:
- options: DenoRuntimeOptions — Simülasyon yapılandırması. Opsiyonel olup, belirtilmezse boş bir nesne kullanılır.
**Dönüş**: void (Dönüş değeri yoktur; nesne yan etkiler yaratır.)

### setupGlobal
**Ne yapar**: `globalThis` üzerindeki `Deno` ad alanını, testler için kullanılabilir sahte bir implementasyonla (stub) değiştirir.
**Nasıl yapar**: `globalThis.Deno` özelliğini, `serve` fonksiyonunu ve `env` nesnesini içeren bir stub nesce ile yeniden tanımlar. `serve` stub'u, çağrıldığında işleyiciyi (`handler`) yakalar ve kaydeder. `env` stub'u ise ortam değişkenlerini simülasyonun iç durumu olan `this.envs` üzerinden yönetir (get, set, delete, toObject).
**Parametreler**: Parametre almaz.
**Dönüş**: void (Dönüş değeri yoktur; global durumu değiştirir.)

### setEnv
**Ne yapar**: Simülasyon ortamında belirli bir ortam değişkenini ayarlar veya günceller.
**Nasıl yapar**: `this.envs` nesnesinde belirtilen anahtar (`key`) için yeni bir değer (`value`) ataması yapar. Bu, simülasyonun ortam değişkenleri havuzunu doğrudan etkiler.
**Parametreler**:
- key: string — Ayarlanacak ortam değişkeninin adı.
- value: string — Ortam değişkenine atanacak değer.
**Dönüş**: void (Dönüş değeri yoktur.)

### setEnvs
**Ne yapar**: Birden fazla ortam değişkenini toplu olarak simülasyon ortamına ekler veya mevcut olanları günceller.
**Nasıl yapar**: Mevcut `this.envs` nesnesini, verilen `envs` nesnesiyle birleştirir (spread operatörü ile). Bu, hem yeni değişkenleri ekler hem de mevcut olanları üzerine yazar.
**Parametreler**:
- envs: Record<string, string> — Eklenecek veya güncellenecek ortam değişkenlerini içeren anahtar-değer çiftleri nesnesi.
**Dönüş**: void (Dönüş değeri yoktur.)

### loadFunction
**Ne yapar**: Belirtilen dosya yolundaki bir edge fonksiyonunu (TypeScript modülünü) yükler, derler ve çalıştırılabilir bir işleyici (handler) olarak kaydeder.
**Nasıl yapar**: Öncelikle global bir işleyici havuzundan fonksiyonu arar; Eğer daha önce yüklenmişse doğrudan onu döndürür. Aksi halde, dosyayı okur, `@supabase/supabase-js` importlarını düzeltir (ESM URL'lerini modül referanslarına dönüştürür), benzersiz bir isimle geçici bir derlenmiş dosya oluşturur ve `import()` ile dinamik olarak yükler. Yükleme sırasında `Deno.serve` çağrısı yapılarak işleyici yakalanır ve hem global hem de iç havuza kaydedilir. Paylaşılan yapılandırma dosyası (`_shared/tenant_config.ts`) varsa benzer şekilde işlenir.
**Parametreler**:
- functionPath: string — Yüklenecek edge fonksiyonunun tam dosya yolu (ör. `/functions/my-function/index.ts`).
**Dönüş**: Promise<(req: Request) => Promise<Response> | Response> — Fonksiyonun işleyicisi (handler). Bu, bir Request alıp Response döndüren asenkron bir fonksiyondur.

### invokeFunction
**Ne yapar**: Yüklenmiş bir edge fonksiyonunu belirtilen HTTP isteğiyle çalıştırır ve sonucu döndürür.
**Nasıl yapar**: Verilen fonksiyon yolu için önceden yüklenmiş bir işleyici arar. Eğer işleyici bulunamazsa, `loadFunction` metodunu çağırarak fonksiyonu yükler. Ardından, yakaladığı işleyiciyi verilen istekle çağırır ve ortaya çıkan yanıtı döndürür.
**Parametreler**:
- functionPath: string — Çalıştırılacak edge fonksiyonunun dosya yolu.
- request: Request — Fonksiyona iletilcek HTTP istek nesnesi.
**Dönüş**: Promise<Response> — Fonksiyonun döndürdüğü HTTP yanıtı.

### cleanup
**Ne yapar**: Deno çalışma zamanı simülasyonunu temizler, global durumu eski haline getirir ve oluşturulan geçici dosyaları siler.
**Nasıl yapar**: Öncelikle, `setupGlobal` tarafından değiştirilen `globalThis.Deno` nesnesini, saklanan `originalDeno` ile geri yükler (eğer orijinal mevcutsa). Ardından, `loadFunction` sırasında oluşturulan geçici derlenmiş dosyaları (`tempFiles` dizisi) dosya sistemi üzerinden silmeye çalışır. Bu işlem için `fs` modülünü senkron veya asenkron olarak kullanabilir.
**Parametreler**: Parametre almaz.
**Dönüş**: void (Dönüş değeri yoktur; temizlik yan etkileri gerçekleştirir.)

---

## INTERFACES

### DenoRuntimeOptions
- `env?: Record<string, string>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::setupDenoRuntime
- **params**: `options: DenoRuntimeOptions = {}` — Deno runtime simülatörü için yapılandırma seçenekleri (opsiyonel, boş obje varsayılan)
- **ic_degiskenler**: (yok)
- **Dönüş**: `DenoRuntimeSimulator` — yeni oluşturulan simülatör instance'ı

---

### [N2_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.constructor
- **params**: `options: DenoRuntimeOptions = {}` — opsiyonel yapılandırma seçenekleri
- **ic_degiskenler**:
  - `options.env` — options objesinden gelen ortam değişkenleri sözlüğü
- **Dönüş**: yok (constructor)

---

### [N3_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setupGlobal
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `self` — instance referansı, iç içe fonksiyonlardan erişim sağlamak için saklanır
- **Dönüş**: yok

---

### [N4_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setEnv
- **params**: `key: string, value: string` — ayarlanacak ortam değişkeninin adı ve değeri
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

---

### [N5_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setEnvs
- **params**: `envs: Record<string, string>` — toplu olarak ayarlanacak ortam değişkenleri sözlüğü
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

---

### [N6_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.loadFunction
- **params**: `functionPath: string` — yüklenecek Edge fonksiyonunun dosya yolu
- **ic_degiskenler**:
  - `globalHandlers` — `(globalThis as any).__edge_function_handlers__` — global fonksiyon handler registry'si, zaten yüklenmiş fonksiyonları cache'lemek için kullanılır
  - `handler` — yüklenen veya önbellekten alınan `(req: Request) => any` fonksiyon handler'ı
  - `fs` — dinamik import ile yüklenen Node.js `fs` modülü, dosya okuma/yazma işlemleri için
  - `path` — dinamik import ile yüklenen Node.js `path` modülü, dosya yolları üzerinde çözümleme için
  - `rand` — `Math.random().toString(36).substring(2, 10)` — derlenen geçici dosya adlarında çakışma önlemek için rastgele字符串
  - `sharedPath` — `path.resolve(...)` ile hesaplanan `_shared/tenant_config.ts` dosyasının tam yolu
  - `sharedCompiledCreated` — boolean, tenant_config derleme dosyasının oluşturulup oluşturulmadığını takip eder
  - `sharedCompiledPath` — derlenmiş tenant_config geçici dosya yolu
  - `sharedContent` — `fs.readFileSync(sharedPath, 'utf-8')` — tenant_config.ts dosyasının ham içeriği
  - `sharedCompiledContent` — supabase-js esm.sh URL'lerinin yerine koyulmuş derlenmiş tenant_config içeriği
  - `content` — `fs.readFileSync(functionPath, 'utf-8')` — Edge fonksiyonun ham TS içeriği
  - `compiledContent` — supabase-js URL替换 ve tenant_config yol替换 uygulanmış derlenmiş fonksiyon içeriği
  - `compiledPath` — derlenmiş fonksiyonun yazılacağı geçici dosya yolu
- **Dönüş**: `Promise<(req: Request) => Promise<Response> | Response>` — yüklenen handler fonksiyonu

---

### [N7_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.invokeFunction
- **params**: `functionPath: string, request: Request` — çalıştırılacak fonksiyonun dosya yolu ve HTTP isteği
- **ic_degiskenler**:
  - `handler` — `this.handlers.get(functionPath)` ile alınan veya `this.loadFunction()` ile yüklenen handler fonksiyonu
- **Dönüş**: `Promise<Response>` — handler'ın döndürdüğü HTTP yanıtı

---

### [N8_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fs` — `require('fs')` ile yüklenen Node.js fs modülü, geçici dosyaları silmek için
  - `file` — `this.tempFiles` dizisindeki her bir geçici dosya yolunu temsil eder
- **Dönüş**: yok

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

  file: tests\e2e\helpers\denoRuntime.ts
  function: tests\e2e\helpers\denoRuntime.ts::setupDenoRuntime
  class: tests\e2e\helpers\denoRuntime.ts::DenoRuntimeSimulator

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