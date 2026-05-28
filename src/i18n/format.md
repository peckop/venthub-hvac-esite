---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\format.ts
skeleton_hash: a1aee483816db6d5
entity_hashes:
  func:formatCurrency: a5c5acb7b633147a
  overview: 272343283b681615
generated_at: 2026-05-28T22:37:51Z
---

## Genel Bakış
VentHub HVAC projesinin uluslararasılaştırma (i18n) katmanında yer alan bu modül, farklı diller ve bölgesel ayarlar için para birimi değerlerinin yerel standartlara uygun şekilde formatlanmasını sağlar. Tarayıcının yerleşik uluslararası formatlama API'sini kullanarak uygulama genelinde tutarlı, kullanıcının konumuna uygun para gösterimleri üretir.

## Fonksiyon Grupları
### Para Birimi Formatlama İşlevleri
Modülün temel sorumluluğu olan para birimi formatlama işlemini gerçekleştirir, gelen sayı veya metin türündeki ham para değerlerini belirtilen dil ve özel formatlama seçeneklerine göre standartlaştırır.
- formatCurrency

---

## AXIOMS – Mimari Varsayımlar
Bu i18n modülündeki formatCurrency fonksiyonu, para birimi değerlerinin hedef dile uygun standart formatta sunulmasını sağlamak için çalışır, doğru çalışması yalnızca aldığı parametrelerin ve çalıştığı ortamın belirli zorunlu koşulları karşılamasıyla mümkündür.

[Aksiyom 1]: Eğer lang parametresi desteklenen geçerli Lang türündeki değerlerden biri değilse, Intl.NumberFormat nesnesi oluşturulamaz ve formatlama işlemi tamamen başarısız olur.
[Aksiyom 2]: Eğer value parametresi geçerli bir sayıya dönüştürülemeyen string veya sayı olarak geçersiz bir değerse, formatlanacak geçerli para miktarı elde edilemez ve çıktı olarak yanlış veya hata değeri döner.
[Aksiyom 3]: Eğer çalışma ortamında standart ECMAScript Intl.NumberFormat API'si desteklenmiyorsa, formatCurrency fonksiyonu hiçbir şekilde çalışamaz ve para formatlama işlemi gerçekleştirilemez.
[Aksiyom 4]: Eğer options parametresi Intl.NumberFormatOptions arayüzüne uygun değilse veya para formatlaması için zorunlu alanlar eksik/geçersizse, Intl.NumberFormat doğru para birimi formatını oluşturamaz ve çıktı hatalı olur.

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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\i18n\format.ts::formatCurrency
- **params**: value: string | number, lang: Lang, options: Intl.NumberFormatOptions (varsayılan: {})
- **ic_degiskenler**:
  - `v` — Giriş olarak alınan value değişkeninin sayısal türe çevrilmiş hali; NaN kontrolü ve para biçimlendirme işleminde kullanılır
  - `locale` — Intl.NumberFormat API'si için kullanılacak yerel ayar kodu, lang değeri 'tr' ise 'tr-TR', diğer tüm durumlarda 'en-US' olarak atanır
  - `currency` — Kullanılacak para birimi kodu, sabit olarak 'TRY' olarak tanımlanır
- **Dönüş**: Biçimlendirilmiş para birimi string'i; geçersiz sayısal giriş veya hata durumunda varsayılan formatlanmış yedek string değerleri döndürür

---

## NODE ID STANDARD

  file: src\i18n\format.ts
  function: src\i18n\format.ts::formatCurrency

---

## DISA AKTARILANLAR (EXPORTS)
  export: formatCurrency