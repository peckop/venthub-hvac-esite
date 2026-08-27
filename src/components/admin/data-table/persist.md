---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\data-table\persist.ts
skeleton_hash: 7638dd7219e0847c
entity_hashes:
  func:colsKey: be658c8a07bd5c9f
  func:densityKey: baed2cf1288edf5d
  func:loadColumnVisibility: 6de0d1f25c09c863
  func:loadDensity: 763f774c77788895
  func:saveColumnVisibility: 42203d8914dd0f82
  func:saveDensity: c8bd7bf6174fa743
  overview: 4087fb32a2109943
generated_at: 2026-08-27T08:10:40Z
---

## Genel Bakış
Bu modül, veri tablosu bileşeninin (data-table) kullanıcı tercihlerini (sütun görünürlüğü ve yoğunluk) kalıcı olarak saklamak ve yüklemekten sorumludur. Yerel depolama (localStorage) üzerinde anahtar-tabanlı bir yapı kullanarak, kullanıcın tablo düzeni tercihlerinin oturumlar arası korunmasını sağlar.

## Fonksiyon Grupları
### Anahtar Üretimi
Bu grup, veri tablosu tercihlerini depolamak için benzersiz ve tutarlı yerel depolama anahtarları oluşturur. Fonksiyonlar, verilen bir temel anahtarı (persistKey) ile sütun görünürlüğü ve yoğunluk için alt anahtarlar türetir.
- densityKey, colsKey

### Depolama İşlemleri
Bu grup, yerel depolama ile doğrudan etkileşime girerek tercihleri okuma (yükleme) ve yazma (kaydetme) işlemlerini yönetir. Fonksiyonlar, belirli bir anahtarla ilişkili veriyi depolar veya depolamadan okur ve hataları yönetir.
- loadDensity, saveDensity, loadColumnVisibility, saveColumnVisibility

---

## AXIOMS – Mimari Varsayımlar

Bu modül, veri tablosu yapılandırmasını (yoğunluk ve sütun görünürlüğü) yerel depolama (`localStorage`) aracılığıyla kalıcı hale getirmek için bir araç seti sunar.

[Aksiyom 1]: Eğer `loadDensity` fonksiyonu çağrıldığında, `persistKey` için yerel depolamada (`localStorage`) daha önce bir `density` değeri kaydedilmemişse, fonksiyon varsayılan bir `Density` nesnesi döndürür (bu nesnenin içeriği ve yapısı bilinmiyor, çünkü docstring'den bilgi çıkarılmaz).
[Aksiyom 2]: Eğer `loadColumnVisibility` fonksiyonu çağrıldığında, `persistKey` için yerel depolamada (`localStorage`) daha önce bir `visibility` kaydı yoksa, fonksiyon `defaults` parametresi olarak verilen `Record<string, boolean>` değerini doğrudan döndürür.
[Aksiyom 3]: Eğer `saveDensity` veya `saveColumnVisibility` fonksiyonları, `persistKey` olarak geçerli bir dize alamazsa (örn. boş dize veya `null`/`undefined`), kayıt işlemi sessizce başarısız olur veya beklenmeyen davranışlar oluşur (hata yönetimi bilinmiyor).
[Aksiyom 4]: Eğer yerel depolama (`localStorage`) doluysa, erişilemez durumdaysa veya tarayıcı politikaları tarafından engelleniyorsa, `saveDensity` ve `saveColumnVisibility` fonksiyonları verileri kalıcı olarak kaydedemez.
[Aksiyom 5]: `densityKey` ve `colsKey` fonksiyonları, aynı `persistKey` için her zaman aynı dize değerlerini döndürmelidir; aksi halde depolanan veriler tutarsız hale gelir.
[Aksiyom 6]: Bu modül, tarayıcı ortamında (`window.localStorage` nesnesinin mevcut ve işlevsel olduğu bir ortam) çalışmak üzere tasarlanmıştır. Sunucu tarafı (Node.js) gibi `localStorage`'ın bulunmadığı bir ortamda çalıştırılırsa, çalışma zamanı hataları oluşur.

---

## FONKSİYON DETAYLARI

### densityKey
**Ne yapar**: Verilen `persistKey` değeri için localStorage'da kullanılacak tam depolama anahtarını (storage key) oluşturur. Oluşturulan anahtar, `KEY_PREFIX` sabiti ile başlar ve `:density` sonekiyle biter.

**Nasıl yapar**: Template literal kullanarak `KEY_PREFIX` sabitini, `persistKey` parametresini ve `:density` sonekini birleştirip tek bir string döndürür.

**Parametreler**:
- persistKey: string — Tablo bileşeninin benzersiz tanımlayıcısı; depolama anahtarının orta kısmını oluşturur.

**Dönüş**: string — Oluşturulan tam depolama anahtarı (örneğin `KEY_PREFIX` değeri `"vh"` ise ve `persistKey` `"users"` ise sonuç `"vh:users:density"` olur).

### colsKey
**Ne yapar**: Verilen bir anahtar için yerel depolamada sütun görünürlüğü tercihlerini saklamak üzere oluşturulacak benzersiz depolama anahtarını üretir.
**Nasıl yapar**: Sabit bir ön ek (`KEY_PREFIX`) ile verilen `persistKey` parametresonu birleştirir ve sonuna `:cols` ekleyerek tam bir yerel depolama anahtarı döndürür. `densityKey` fonksiyonuyla aynı yapıyı kullanır, ancak farklı bir son ekle sütun görünürlüğü verisi için ayrıştırır.
**Parametreler**:
- persistKey: string — Bu bileşen (veya tablo) için benzersiz tanımlayıcı bir anahtar.
**Dönüş**: string — Yerel depolamada kullanılabilecek tam formatta anahtar dizesi.

### loadDensity
**Ne yapar**: Yerel depolamadan satır yoğunluğu tercihini (örn. `compact` veya `comfortable`) okur. Değer eksik, geçersiz veya okunamıyorsa `comfortable` (veya `DEFAULT_DENSITY` sabiti) değerini döndürür.
**Nasıl yapar**: Önce ortamın sunucu tarafı olup olmadığını kontrol eder (`window` nesnesi yoksa). Ardından `densityKey` fonksiyonunu kullanarak depolama alanını okumaya çalışır. Okunan ham değer `compact` veya `comfortable` ise onu doğrudan döndürür. Herhangi bir hata oluşursa (depolama kullanılamıyorsa, engellenmişse veya değer geçersizse) sessizce `DEFAULT_DENSITY` değerine geri döner.
**Parametreler**:
- persistKey: string — Okunacak tercihin ait olduğu bileşen tanımlayıcısı.
**Dönüş**: Density — Geçerli bir yoğunluk değeri (`"compact"` veya `"comfortable"`).

### saveDensity
**Ne yapar**: Verilen satır yoğunluğu değerini yerel depolamaya en iyi çabayla kaydeder. Kayıt başarısız olursa (kota dolu, özel mod, SSR ortamı) hatayı yutar.
**Nasıl yapar**: Ortamın sunucu tarafı olup olmadığını kontrol eder. Değilse, `densityKey` fonksiyonunu kullanarak oluşturulan anahtar ile `density` değerini yerel depolamaya yazmaya çalışır. Herhangi bir yazma hatası oluşursa sessizce işlevini sonlandırır, çünkü tercihleri saklama bir "best-effort" (en iyi çaba) işlemidir.
**Parametreler**:
- persistKey: string — Kaydedilecek tercihin ait olduğu bileşen tanımlayıcısı.
- density: Density — Kaydedilecek yoğunluk değeri (`"compact"` veya `"comfortable"`).
**Dönüş**: void

### loadColumnVisibility
**Ne yapar**: Yerel depolamadan sütun görünürlük ayarlarını okur ve bunları verilen varsayılan değerlerle birleştirir. Depolanan değerler, mevcut sütunlar için varsayılanların üzerine yazılır; depolamada olmayan yeni sütunlar ise varsayılan görünürlüklerini korur.
**Nasıl yapar**: Ortam kontrolü ve `colsKey` ile depolama okuma işlemi `loadDensity`'e benzer. Ancak burada JSON dizisi parse edilir ve doğrulanır (null, dizi veya geçersiz tiplere karşı). Geçerli bir nesne elde edildiğinde, `defaults` nesnesinin tüm anahtarları için döngüye girilir. Depolanan nesnede karşılık gelen anahtar varsa ve değeri bir boolean ise bu değer `merged` nesnesine yazılır; böylece depolanan tercihler varsayılanların üzerine yazılır. Hata veya geçersiz veri durumunda `{...defaults}` döndürülerek tüm sütunların başlangıç görünürlüklerine dönülür.
**Parametreler**:
- persistKey: string — Görünürlük ayarlarının ait olduğu bileşen tanımlayıcısı.
- defaults: Record<string, boolean> — Sütun adlarını (anahtar) ve başlangıç görünürlüklerini (boolean) içeren nesne.
**Dönüş**: Record<string, boolean> — Birleştirilmiş sütun görünürlük ayarlarını içeren nesne.

### saveColumnVisibility
**Ne yapar**: Verilen sütun görünürlük nesnesini yerel depolamaya en iyi çabayla JSON olarak kaydeder. Kayıt başarısız olursa hatayı yutar.
**Nasıl yapar**: Ortam kontrolü sonrası, `colsKey` fonksiyonuyla oluşturulan anahtarı kullanarak `visibility` nesnesini `JSON.stringify` ile dizgie çevirip yerel depolamaya yazar. Depolama alanı dolu, özel modda veya erişilemezse oluşan hata sessizce yakalanır ve işlev sonlanır.
**Parametreler**:
- persistKey: string — Kaydedilecek ayarların ait olduğu bileşen tanımlayıcısı.
- visibility: Record<string, boolean> — Sütun adlarını ve istenen görünürlük durumlarını (boolean) içeren nesne.
**Dönüş**: void

---

## İTHALATLAR (IMPORTS)
- import: @/types/admin-shared::type { Density }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: persist.ts::densityKey
- **params**: `persistKey` — bir dize; depolama anahtarının benzersiz parçası
- **ic_degiskenler**: yok
- **Dönüş**: `string` — `KEY_PREFIX` sabiti, `persistKey` ve `:density` parçalarından oluşan birleşik depolama anahtarı dizesi

### [N2_NASIL] AST Pointer: persist.ts::colsKey
- **params**: `persistKey` — bir dize; depolama anahtarının benzersiz parçası
- **ic_degiskenler**: yok
- **Dönüş**: `string` — `KEY_PREFIX` sabiti, `persistKey` ve `:cols` parçalarından oluşan birleşik depolama anahtarı dizesi

### [N3_NASIL] AST Pointer: persist.ts::loadDensity
- **params**: `persistKey` — bir dize; hangi tablonun yoğunluk tercihini yükleyeceğini belirler
- **ic_degiskenler**:
  - `raw` — `window.localStorage.getItem(densityKey(persistKey))` çağrısının sonucu; depodan okunan ham dize değeridir. `"compact"` veya `"comfortable"` ise doğrudan dönüş değeri olarak kullanılır
- **Dönüş**: `Density` — depodan okunan geçerli yoğunluk değeri; `window` tanımsızsa, `raw` geçerli bir değer değilse veya depolama erişilemezse `DEFAULT_DENSITY` sabiti döner

### [N4_NASIL] AST Pointer: persist.ts::saveDensity
- **params**: `persistKey` — bir dize; hangi tablonun yoğunluk tercihini kaydedeceğini belirler, `density` — kaydedilecek `Density` türünde değer
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak `window.localStorage.setItem(densityKey(persistKey), density)` çağrısıyla değeri depoya yazar. `window` tanımsızsa veya depolama erişilemezse hiçbir işlem yapmaz

### [N5_NASIL] AST Pointer: persist.ts::loadColumnVisibility
- **params**: `persistKey` — bir dize; hangi tablonun sütun görünürlüğünü yükleyeceğini belirler, `defaults` — `Record<string, boolean>` türünde varsayılan sütun görünürlük eşlemesi
- **ic_degiskenler**:
  - `raw` — `window.localStorage.getItem(colsKey(persistKey))` çağrısının sonucu; depodan okunan ham JSON dizesidir. Boşsa `{ ...defaults }` döner
  - `parsed` — `JSON.parse(raw)` sonucu; `unknown` tipinde ayrıştırılmış değerdir. `null`, nesne olmayan veya dizi ise `{ ...defaults }` döner
  - `merged` — `{ ...defaults }` ile oluşturulan `Record<string, boolean>` kopyası; `parsed` nesnesinden gelen geçerli boolean değerlerle güncellenir
  - `key` — `Object.keys(defaults)` döngüsünde kullanılan dize; her varsayılan sütun adını temsil eder
  - `value` — `(parsed as Record<string, unknown>)[key]` erişimiyle elde edilen değer; `typeof value === 'boolean"` koşulunu sağlıyorsa `merged[key]` atanır
- **Dönüş**: `Record<string, boolean>` — depodaki geçerli boolean değerlerle birleştirilmiş sütun görünürlük eşlemesi. `window` tanımsızsa, `raw` boşsa, `parsed` geçerli bir nesne değilse veya depolama erişilemezse `{ ...defaults }` döner

### [N6_NASIL] AST Pointer: persist.ts::saveColumnVisibility
- **params**: `persistKey` — bir dize; hangi tablonun sütun görünürlüğünü kaydedeceğini belirler, `visibility` — `Record<string, boolean>` türünde kaydedilecek sütun görünürlük eşlemesi
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak `window.localStorage.setItem(colsKey(persistKey), JSON.stringify(visibility))` çağrısıyla eşlemenin JSON temsilini depoya yazar. `window` tanımsızsa veya depolama erişilemezse hiçbir işlem yapmaz

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    persist_ts__colsKey["colsKey"]
    persist_ts__densityKey["densityKey"]
    persist_ts__loadColumnVisibility["loadColumnVisibility"]
    persist_ts__loadDensity["loadDensity"]
    persist_ts__saveColumnVisibility["saveColumnVisibility"]
    persist_ts__saveDensity["saveDensity"]
    persist_ts__loadDensity --> persist_ts__densityKey
    persist_ts__saveDensity --> persist_ts__densityKey
    persist_ts__loadColumnVisibility --> persist_ts__colsKey
    persist_ts__saveColumnVisibility --> persist_ts__colsKey
```

## NODE ID STANDARD

  file: src\components\admin\data-table\persist.ts
  function: src\components\admin\data-table\persist.ts::densityKey
  function: src\components\admin\data-table\persist.ts::colsKey
  function: src\components\admin\data-table\persist.ts::loadDensity
  function: src\components\admin\data-table\persist.ts::saveDensity
  function: src\components\admin\data-table\persist.ts::loadColumnVisibility
  function: src\components\admin\data-table\persist.ts::saveColumnVisibility

---

## DISA AKTARILANLAR (EXPORTS)
  export: colsKey
  export: densityKey
  export: loadColumnVisibility
  export: loadDensity
  export: saveColumnVisibility
  export: saveDensity