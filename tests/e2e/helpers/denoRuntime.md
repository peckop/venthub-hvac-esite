---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\tests\e2e\helpers\denoRuntime.ts
skeleton_hash: fc8166db6e22e33b
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
generated_at: 2026-08-15T07:44:50Z
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

## FONKSİYON DETAYLARI

### setupDenoRuntime
**Ne yapar**: Bir `DenoRuntimeSimulator` nesnesi oluşturup döndüren fabrika fonksiyonudur. Bu, Deno çalışma zamanı simülasyonunun başlangıç noktasıdır ve test ortamını hazırlar.
**Nasıl yapar**: Verilen seçenekler (options) nesnesini alır ve `DenoRuntimeSimulator` sınıfından yeni bir实例 oluşturarak döndürür. Eğer seçenek belirtilmemişse varsayılan boş bir nesne kullanılır.
**Parametreler**:
- options: DenoRuntimeOptions — Simülasyon için kullanılacak seçenekler nesnesi. Ortam değişkenleri gibi yapılandırma ayarlarını içerir.
**Dönüş**: DenoRuntimeSimulator — Oluşturulan ve yapılandırılmış simülasyon nesnesi.

### constructor
**Ne yapar**: `DenoRuntimeSimulator` sınıfının yapıcı metodudur. Simülatörün başlangıç durumunu ayarlar, ortam değişkenlerini başlatır ve `globalThis` üzerindeki `Deno` nesnesini yedekler.
**Nasıl yapar**: Parametre olarak gelen `options` nesnesindeki `env` özelliği varsa, mevcut ortam değişkenlerini `this.envs` üzerine yayar. Ardından, global `Deno` nesnesinin orijinal referansını (`this.originalDeno`) saklar. Son olarak, `setupGlobal` metodunu çağırarak global `Deno` nesnesini stub (sahte) bir implementasyonla değiştirir.
**Parametreler**:
- options: `DenoRuntimeOptions = {}` — Sınıfın başlatma seçeneklerini içeren nesne. `env` özelliği ile başlangıç ortam değişkenleri (key-value çiftleri) sağlanabilir. Boş bırakılabilir.
**Dönüş**: `void` — Fonksiyon bir değer döndürmez.

### setupGlobal
**Ne yapar**: Global `Deno` nesnesini, test ortamında kullanılabilecek bir stub (sahte) implementasyonla değiştirir. Bu sayede, Edge fonksiyonların `Deno.serve` ve `Deno.env` çağrıları kontrol edilebilir hale gelir.
**Nasıl yapar**: `globalThis` üzerindeki `Deno` nesnesini, kendi içinde tanımlı bir nesne ile değiştirir. Bu stub nesne iki ana özellik sağlar: 1) `serve` fonksiyonu: Gelen argümanlara göre handler'ı (istek işleyiciyi) algılar ve bunu `this.activeHandler` ile `globalThis.__last_registered_handler__` üzerine kaydeder. Bu, testin later aşamada hangi handler'ın kaydedildiğini bulmasını sağlar. 2) `env` nesnesi: `get`, `set`, `delete` ve `toObject` metotlarıyla, `this.envs` üzerindeki ortam değişkenlerini yönetir.
**Parametreler**: Yok.
**Dönüş**: `void` — Fonksiyon bir değer döndürmez.

### setEnv
**Ne yapar**: Tek bir ortam değişkenini (key-value çiftini) simülatörün ortam havuzuna ekler veya günceller.
**Nasıl yapar**: `this.envs` nesnesinin, verilen `key` değerine karşılık gelen özelliğini, `value` parametresiyle doğrudan atar. Bu, `Deno.env` stub'ının kullandığı iç depolama alanını doğrudan değiştirir.
**Parametreler**:
- key: `string` — Ayarlanacak ortam değişkeninin adı.
- value: `string` — Ortam değişkenine atanacak değer.
**Dönüş**: `void` — Fonksiyon bir değer döndürmez.

### setEnvs
**Ne yapar**: Birden fazla ortam değişkenini (bir nesne olarak) simülatörün mevcut ortam havuzuna ekler veya günceller. Bu, mevcut değişkenleri korurken yeni olanları eklemek için kullanılır.
**Nasıl yapar**: `this.envs` nesnesini, önce mevcut değerleri (`...this.envs`) ve ardından yeni gelen `envs` parametresindeki değerleri (`...envs`) birleştirerek yeniden atar. Bu süreç, eski değişkenlerin üzerine yazılmasını sağlar, ancak `envs` içinde olmayan mevcut değişkenleri silmez.
**Parametreler**:
- envs: `Record<string, string>` — Eklenecek veya güncellenecek ortam değişkenlerini (key-value çiftleri) içeren nesne.
**Dönüş**: `void` — Fonksiyon bir değer döndürmez.

### loadFunction
**Ne yapar**: Belirtilen dosya yolundaki bir Edge fonksiyonunu (TypeScript modülünü) dinamik olarak yükler, derler ve çalıştırılabilir hale getirir. Fonksiyonun `Deno.serve` çağrısını yakalar ve istek işleyiciyi (handler) döndürür.
**Nasıl yapar**: 1) Önce, fonksiyonun daha önce yüklenip yüklenmediğini kontrol etmek için global bir registry (`__edge_function_handlers__`) kullanır. Eğer varsa, önbellekten döndürür. 2) Yoksa, dosyayı okur ve ESM import hatalarını önlemek için `@supabase/supabase-js` URL'lerini satır içi bir formata dönüştürür. 3) Fonksiyonun `_shared` dizinindeki bağımlılıklarını tarar ve derler (zincirleme referansları dahil). 4) Hem ana fonksiyon hem de bağımlılıklar için derlenmiş (.compiled.ts) dosyalar oluşturur. 5) Dinamik `import()` ile bu derlenmiş dosyayı yükler. 6) Modülün yüklenmesi sırasında global `Deno.serve` stub'ı tarafından yakalanan handler'ı (`this.activeHandler` veya `globalThis.__last_registered_handler__`) alır. 7) Bu handler'ı hem global hem de instance seviyesindeki registry'ye kaydeder ve döndürür.
**Parametreler**:
- functionPath: `string` — Yüklenecek Edge fonksiyonunun dosya yolu (ör. `./functions/api/hello/index.ts`).
**Dönüş**: `Promise<(req: Request) => Promise<Response> | Response>` — Yüklenen ve çalıştırılabilir hale getirilmiş, bir Request alıp Response döndüren asenkron istek işleyici (handler) fonksiyonu.

### invokeFunction
**Ne yapar**: Daha önce yüklenmiş (veya ilk kez yüklenmesi gereken) bir Edge fonksiyonunu, verilen bir HTTP isteği ile çalıştırır ve sonucu döndürür.
**Nasıl yapar**: `this.handlers` haritasında fonksiyon yoluna karşılık gelen handler'ı arar. Eğer handler bulunamazsa, `loadFunction` metodunu çağırarak fonksiyonu yükler ve handler'ı alır. Ardından, handler'ı asenkron olarak çağırarak isteği işler ve Response nesnesini döndürür.
**Parametreler**:
- functionPath: `string` — Çalıştırılacak Edge fonksiyonunun dosya yolu.
- request: `Request` — Fonksiyona geçirilecek HTTP isteği.
**Dönüş**: `Promise<Response>` — Fonksiyonun ürettiği HTTP yanıtını içeren bir Promise.

### cleanup
**Ne yapar**: Simülatörün oluşturduğu yan etkileri (değişiklikleri) geri alır. Global `Deno` nesnesini orijinal haline döndürür ve derleme sürecinde oluşturulan geçici dosyaları temizler.
**Nasıl yapar**: 1) Eğer `this.originalDeno` tanımlıysa, onu `globalThis.Deno` üzerine atayarak orijinal duruma döner. Eğer tanımlı değilse (başlangıçta mevcut değildiyse), `globalThis.Deno`'yu silerek global ortamı temizler. 2) `this.tempFiles` dizisinde kayıtlı tüm geçici `.compiled.ts` dosyalarını siler. Bu işlem için Node.js `fs` modülünü kullanır. `require` kullanılamıyorsa (ESM ortamı), dinamik `import()` ile asenkron olarak dener.
**Parametreler**: Yok.
**Dönüş**: `void` — Fonksiyon bir değer döndürmez.

---

## INTERFACES

### DenoRuntimeOptions
- `env?: Record<string, string>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::setupDenoRuntime
- **params**: (options: DenoRuntimeOptions = {})
- **ic_degiskenler**: (yok)
- **Dönüş**: DenoRuntimeSimulator

### [N2_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.constructor
- **params**: (options: DenoRuntimeOptions = {})
- **ic_degiskenler**:
  - `this.envs` — globalThis.Deno.env stub'unda kullanılacak ortam değişkenleri sözlüğü, options.env'den kopyalanarak oluşturulur
  - `this.originalDeno` — orijinal Deno nesnesinin referansı, cleanup() fonksiyonunda geri yüklenmek üzere saklanır
- **Dönüş**: yok (constructor)

### [N3_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setupGlobal
- **params**: (yok)
- **ic_degiskenler**:
  - `self` — this referansının saklanması, inner function'larda kullanılmak üzere
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setEnv
- **params**: (key: string, value: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.setEnvs
- **params**: (envs: Record<string, string>)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.loadFunction
- **params**: (functionPath: string)
- **ic_degiskenler**:
  - `globalHandlers` — (globalThis as any).__edge_function_handlers__ global handler sözlüğü
  - `handler` — işlevden alınan handler fonksiyonu, globalHandlers'dan veya yeni yüklenen modülden
  - `fs` — await import('fs') ile yüklenen dosya sistemi modülü
  - `path` — await import('path') ile yüklenen path modülü
  - `rand` — Math.random().toString(36).substring(2, 10) ile oluşturulan benzersiz rastgele string
  - `sharedDir` — _shared klasörünün mutlak yolu, path.resolve ile hesaplanır
  - `sharedRefRe` — /['"`][^'"`]*_shared\/([A-Za-z0-9_.-]+\.ts)['"`]/g regular expression'i
  - `content` — fs.readFileSync(functionPath, 'utf-8') ile okunan fonksiyon kaynak kodu
  - `sharedNames` — Set<string>, _shared bağımlılıklarının adlarını tutar
  - `queue` — collectSharedRefs sonucu alınan _shared dosya adları dizisi
  - `compiledNameOf` — isim fonksiyonu, .compiled.{rand}.ts dönüşümü yapar
  - `sharedCompiledPaths` — string[] derlenmiş _shared dosyalarının yolları
  - `compiledContent` — inlineSupabaseUrl ve shared referans dönüşümleri yapılmış derlenmiş kod
  - `compiledPath` — derlenmiş ana fonksiyon dosyasının yolu
  - `err` — import hatası durumunda yakalanan hata nesnesi
- **Dönüş**: Promise<(req: Request) => Promise<Response> | Response>

### [N7_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.invokeFunction
- **params**: (functionPath: string, request: Request)
- **ic_degiskenler**:
  - `handler` — this.handlers sözlüğünden alınan veya loadFunction ile yüklenen handler fonksiyonu
- **Dönüş**: Promise<Response>

### [N8_NASIL] AST Pointer: tests/e2e/helpers/denoRuntime.ts::DenoRuntimeSimulator.cleanup
- **params**: (yok)
- **ic_degiskenler**:
  - `fs` — require('fs') veya import('fs') ile yüklenen dosya sistemi modülü
  - `file` — this.tempFiles dizisindeki her bir geçici dosya yolu
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