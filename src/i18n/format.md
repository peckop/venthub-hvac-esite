---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\i18n\format.ts
skeleton_hash: 4afe4bc846b54ef5
entity_hashes:
  func:formatCurrency: c74424c786c4ea7f
  func:formatNumber: 0816f48e81145d1c
  overview: cad42f6789244c28
generated_at: 2026-08-27T06:50:47Z
---

## Genel Bakış
Bu modül, sayısal değerlerin farklı diller ve bölgeler için uygun formatta gösterilmesini sağlayan uluslararasılaştırma (i18n) yardımcı fonksiyonlarını içerir. Tarayıcının yerleşik `Intl.NumberFormat` API'ini kullanarak para birimi ve genel sayı formatlaması yapar. Modül, `Lang` tipi ve `Intl.NumberFormatOptions` arayüzü ile çalışır.

## Fonksiyon Grupları
### Sayı ve Para Birimi Formatlama
Bu grup, ham sayı veya metin değerlerini belirtilen dil ayarlarına göre yerelleştirilmiş biçime dönüştürmekten sorumludur. `formatCurrency` para birimi gösterimi için, `formatNumber` ise genel sayısal gösterim için kullanılır; her ikisi de `Intl.NumberFormatOptions` yapılandırması alır.
- formatCurrency, formatNumber

## Bağımlılıklar
- **Dış Bağımlılık**: Tarayıcı ortamına ait `Intl.NumberFormat` API'i
- **İç Bağımlılık**: `Lang` tipi (başka bir modülden tanımlı)

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilecek varsayımlar listelenmiştir. Gövde tabanlı aksiyom üretilemez.

[Aksiyom 1]: Eğer `formatCurrency` çağrılırken `options` parametresinde `currency` alanı yoksa, TypeScript derleme hatası oluşur; çünkü imza `Intl.NumberFormatOptions & { currency: string }` olarak tanımlanmıştır ve `currency` zorunlu kılınmıştır.

[Aksiyom 2]: Eğer `lang` parametresi geçerli bir `Lang` değerini içermiyorsa, `Intl.NumberFormat` yapıcısı beklenen biçimlendirme çıktısını üretemez; çünkü `lang` değeri `Intl.NumberFormat`'a locale olarak aktarılır.

[Aksiyom 3]: Eğer `value` parametresi hem `string` hem de `number` tipi dışındaysa, fonksiyonun nasıl davrandığı bilinmiyor; çünkü imza yalnızca `string | number` kabul edecek şekilde tanımlanmıştır.

---

## FONKSİYON DETAYLARI

### formatCurrency
**Ne yapar**: Parasal bir değeri kullanıcının dil tercihine göre formatlar. Dil, kullanıcının okuma tercihidir; para birimi ise verinin bir olgusudur — bu ayrımı korur. Dilden para birimi türetmez; çağıranın belirttiği `currency` değerini kullanır.

**Nasıl yapar**: `lang` parametresinden bir locale türetir: `tr` ise `tr-TR`, aksi halde `en-US`. `style` ve `currency`ağını en sona yerleştirir; böylece çağıranın geçirdiği `maximumFractionDigits` gibi biçim ayarları korunur ama para birimi kazara ezilemez. Sayısal dönüşüm başarısız olsa bile (`isNaN`), doğru birimde sıfır değerini formatlar. `Intl.NumberFormat` geçersiz bir birim kodu nedeniyle hata fırlatırsa, dile göre simge uydurmaz — birimi olduğu gibi ham metin olarak yazar; yanlış para birimi göstermektense biçimsiz göstermeyi yeğler.

**Parametreler**:
- `value`: `string | number` — Formatlanacak parasal değer. String olarak geldiğinde `Number()` ile sayıya dönüştürülür.
- `lang`: `Lang` — Kullanıcının dil tercihi. `tr` değeri `tr-TR` locale'ine, diğer değerler `en-US` locale'ine eşlenir.
- `options`: `Intl.NumberFormatOptions & { currency: string }` — `Intl.NumberFormat` seçenekleri ile birlikte zorunlu `currency` alanını içerir. `currency` alanı para birimi kodunu belirtir (örneğin `TRY`, `USD`). Çağıran bu alanı sağlamak zorundadır; aksi halde fonksiyon para birimini belirleyemez.

**Dönüş**: Bilinmiyor. Kaynakta return tipi açıkça belirtilmemiştir. Fonksiyon, `Intl.NumberFormat.format()` sonucunu veya hata durumunda ham metin (`${Math.round(Number(value) || 0)} ${currency}`) döndürür.

### formatNumber

**Ne yapar**: Para-dışı sayısal değerleri (adet, hacim m³, hesaplama sonuçları vb.) aktif dile göre formatlanmış dize olarak döndürür. Türkçe dilinde binlik ayracı nokta ve ondalık ayracı virgül kullanırken (örn: 1.234,5), İngilizce dilinde binlik ayracı virgül ve ondalık ayracı nokta kullanır (örn: 1,234.5). Bu sayede uygulama genelinde dil tutarlılığı sağlanır.

**Nasıl yapar**: Fonksiyon önce gelen `value` parametresinin string olup olmadığını kontrol eder; string ise `Number()` ile sayıya dönüştürür. Dönüştürme sonucu `NaN` ise doğrudan `'0'` dizesini döndürerek hata durumunu güvenli biçimde ele alır. Ardından `lang` parametresine göre uygun locale dizgesini belirler (`'tr'` için `'tr-TR'`, diğer durumlarda `'en-US'`) ve `Intl.NumberFormat` nesnesi oluşturarak sayıyı o locale'e özgü kurallara göre formatlar. `Intl.NumberFormat` constructor'ı opsiyonel `options` parametresini de kabul eder; bu sayedeondalık basamak sayısı gibi ek formatlama ayarları yapılabilir. Herhangi bir beklenmedik hata oluşursa `catch` bloğu devreye girer ve orijinal `value` değerini string olarak döndürür.

**Parametreler**:
- `value`: `string | number` — Formatlanacak sayısal değer. String olarak gelirse sayıya dönüştürülür; sayı olarak gelirse doğrudan kullanılır.
- `lang`: `Lang` — Aktif dil ayarını belirtir. `'tr'` değerini aldığında Türkçe locale (`tr-TR`), diğer değerlerde İngilizce locale (`en-US`) kullanılır.
- `options`: `Intl.NumberFormatOptions` *(opsiyonel, varsayılan: `{}`)* — `Intl.NumberFormat` tarafından desteklenen formatlama seçenekleri. Ondalık basamak sayısı, minimum/on maksimum ondalık basamak, birim gösterimi gibi ayarları içerir.

**Dönüş**: `string` — Locale'e göre formatlanmış sayısal değer dizesi. Girdi `NaN` ise `'0'` dizesi, hata oluştuğunda ise orijinal değerin string karşılığı döner.

**Not**: Bu fonksiyon para birimi formatlaması için değildir; para birimi formatlaması için `formatCurrency` fonksiyonu kullanılmalıdır.

---

## İTHALATLAR (IMPORTS)
- import: ./I18nContext::Lang

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/format.ts::formatCurrency
- **params**:
  - `value` — `string | number` tipinde, biçimlendirilecek sayısal değer
  - `lang` — `Lang` tipinde, dil seçimi ('tr' veya diğer)
  - `options` — `Intl.NumberFormatOptions & { currency: string }` tipinde, biçimlendirme seçenekleri ve zorunlu `currency` alanı
- **ic_degiskenler**:
  - `currency` — `options` objesinden çıkarılan para birimi kodu (destructuring ile)
  - `locale` — `lang === 'tr'` koşuluna göre `'tr-TR'` veya `'en-US'` değerini alan yerel ayar string'i
  - `intlOptions` — `Intl.NumberFormatOptions` tipinde, `maximumFractionDigits: 2` varsayılanı üzerine `options` yayılıp ardından `style: 'currency'` ve `currency` alanlarının en sona yazıldığı nihai seçenekler objesi
  - `v` — `value` parametresinin `typeof` kontrolüyle sayıya dönüştürülmüş hali; string ise `Number(value)`, değilse doğrudan `value`
- **Dönüş**: `string` — `Intl.NumberFormat` ile biçimlendirilmiş para birimi string'i; `isNaN(v)` ise sıfırın biçimlendirilmiş hali; `try` bloğu hata fırlatırsa `${Math.round(Number(value) || 0)} ${currency}` fallback string'i

### [N2_NASIL] AST Pointer: src/i18n/format.ts::formatNumber
- **params**:
  - `value` — `string | number` tipinde, biçimlendirilecek sayısal değer
  - `lang` — `Lang` tipinde, dil seçimi ('tr' veya diğer)
  - `options` — `Intl.NumberFormatOptions` tipinde, varsayılanı `{}` olan biçimlendirme seçenekleri
- **ic_degiskenler**:
  - `v` — `value` parametresinin `typeof` kontrolüyle sayıya dönüştürülmüş hali; string ise `Number(value)`, değilse doğrudan `value`
  - `locale` — `lang === 'tr'` koşuluna göre `'tr-TR'` veya `'en-US'` değerini alan yerel ayar string'i
- **Dönüş**: `string` — `isNaN(v)` ise `'0'`; aksi halde `Intl.NumberFormat` ile biçimlendirilmiş sayı string'i; `try` bloğu hata fırlatırsa `String(value)` fallback string'i

---

## NODE ID STANDARD

  file: src\i18n\format.ts
  function: src\i18n\format.ts::formatCurrency
  function: src\i18n\format.ts::formatNumber

---

## DISA AKTARILANLAR (EXPORTS)
  export: formatCurrency
  export: formatNumber