---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\format.ts
skeleton_hash: bf4c7a43c3f640fd
entity_hashes:
  func:formatCurrency: a5c5acb7b633147a
  func:formatNumber: 0816f48e81145d1c
  overview: cd7da0082c9ccc54
generated_at: 2026-06-19T20:48:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısının temel bir parçasıdır ve sayısal değerlerin farklı diller ve bölgeler için uygun formatta gösterilmesini sağlar. Tarayıcının yerleşik `Intl.NumberFormat` API'ini kullanarak para birimi ve genel sayı formatları için uygulama genelinde tutarlı, kullanıcıya özel çıktılar üretir.

## Fonksiyon Grupları
### Para Birimi ve Sayı Formatlama İşlevleri
Modülün temel sorumluluğu, ham sayı veya metin değerlerini belirtilen dil ve bölgesel ayarlara göre standart formata dönüştürmektir; para birimi ve genel sayısal gösterimler için tutarlı ve yerelleştirilmiş çıktılar sağlar.
- formatCurrency, formatNumber

---

## AXIOMS – Mimari Varsayımlar

Bu modül, tarayıcı ortamında `Intl.NumberFormat` API'sine güvenerek para birimi ve sayı formatlaması yapar. Fonksiyonların doğru çalışması için aşağıdaki koşulların var olması gerekir.

[Aksiyom 1]: Eğer `lang` parametresi geçerli bir BCP 47 dil etiketi (örneğin `'en-US'`, `'tr-TR'`) yoksa, `Intl.NumberFormat` nesnesi oluşturulamaz veya beklenmeyen bir hata fırlatılır.

[Aksiyom 2]: Eğer `value` parametresi, `Intl.NumberFormat` tarafından parse edilebilen geçerli bir sayısal bir string veya number değilse, fonksiyon `NaN` veya geçersiz bir formatlanmış değer döndürür.

[Aksiyom 3]: Eğer `options` parametresi, `Intl.NumberFormat` yapıcısının kabul ettiği geçerli bir `Intl.NumberFormatOptions` nesnesi (örneğin `{ style: 'currency', currency: 'TRY' }`) değilse, tarayıcı varsayılan değerleri kullanır ve bu da beklenmeyen bir para birimi formatına yol açabilir.

[Aksiyom 4]: Eğer modül, tarayıcı API'si (`Intl.NumberFormat`) desteklenmeyen bir ortamda (örneğin bazı Node.js sürümleri) çalıştırılırsa, `formatCurrency` ve `formatNumber` fonksiyonları doğrudan hata fırlatır veya`undefined` döndürür.

---

## FONKSİYON DETAYLARI

### formatCurrency
**Ne yapar**: venthub-hvac projesinin i18n modülü içerisinde yer alan, gönderilen para değerini belirtilen dil ayarları ve özel biçimlendirme seçenekleri doğrultusunda uluslararası standartlara uygun para birimi formatına dönüştüren yardımcı bir fonksiyondur. Tüm uygulama genelinde tutarlı para biçimlendirmesi sağlamak amacıyla kullanılır, uluslararasılaştırma ihtiyaçlarını karşılamak için tasarlanmıştır.
**Nasıl yapar**: TypeScript/JavaScript ortamlarında yerleşik olarak bulunan Intl.NumberFormat API'sinden faydalanarak biçimlendirme işlemini gerçekleştirir. Giriş olarak alınan değeri önce işlenebilir formata dönüştürür, ardından parametre olarak alınan dil ve biçimlendirme seçeneklerini ilgili API'ye ileterek bölgesel ayarlara uygun, doğru formatlanmış bir para değeri oluşturur.
**Parametreler**:
- name: value, type: string | number — Biçimlendirilmek istenen para değeri, hem string formatında metin olarak hem de doğrudan sayısal değer olarak giriş kabul edilir.
- name: lang, type: Lang — Uygulama tarafından desteklenen dilleri temsil eden özel tanımlı tipte dil parametresi, biçimlendirmenin uyum sağlayacağı bölgesel dili belirler.
- name: options, type: Intl.NumberFormatOptions — Yerleşik Intl.NumberFormat API'sinin kabul ettiği tüm özel biçimlendirme ayarlarını içeren nesne; para birimi kodu, ondalık basamak sayısı, para birimi simgesinin görüntülenme şekli gibi ayarları barındırır.
**Dönüş**: Fonksiyonun dönüş tipi tanımlarda net olarak belirtilmemiştir, void olabileceği ifade edilmiştir, herhangi bir standart geri dönüş değeri için resmi bir tanımlama yapılmamıştır.

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
- **params**: `(value: string | number, lang: Lang, options: Intl.NumberFormatOptions = {})`
- **ic_degiskenler**:
  - `v` — `value`'nun number karşılığı; string gelirse `Number(value)` ile parse edilir, number ise doğrudan kullanılır
  - `locale` — `lang` değerine göre Intl locale stringi; `'tr'` ise `'tr-TR'`, diğer durumlarda `'en-US'`
  - `currency` — para birimi kodu; `options.currency` varsa onu kullanır, yoksa dile göre fallback (`en` → `'USD'`, `tr` → `'TRY'`)
  - `symbol` — catch bloğunda para birimi sembolü; `lang === 'en'` ise `'$'`, aksi halde `'₺'` — formatlama hata verdiğinde fallback çıktı için kullanılır
- **Dönüş**: `string` — formatlanmış para birimi stringi (örn. `"1.234,56 ₺"`, `"$1,234.56"`) veya hata/durum fallback'leri (`"0 ₺"`, `"$0"`, `"$1234"`)

---

### [N2_NASIL] AST Pointer: src/i18n/format.ts::formatNumber
- **params**: `(value: string | number, lang: Lang, options: Intl.NumberFormatOptions = {})`
- **ic_degiskenler**:
  - `v` — `value`'nun number karşılığı; string gelirse `Number(value)` ile parse edilir, number ise doğrudan kullanılır
  - `locale` — `lang` değerine göre Intl locale stringi; `'tr'` ise `'tr-TR'`, diğer durumlarda `'en-US'`
- **Dönüş**: `string` — formatlanmış sayı stringi (örn. `"1.234,56"`, `"1,234.56"`) veya hata/durum fallback'leri (`"0"`, value'nun string karşılığı)

---

## NODE ID STANDARD

  file: src\i18n\format.ts
  function: src\i18n\format.ts::formatCurrency
  function: src\i18n\format.ts::formatNumber

---

## DISA AKTARILANLAR (EXPORTS)
  export: formatCurrency
  export: formatNumber