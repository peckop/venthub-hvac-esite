---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\whatsapp.ts
skeleton_hash: c727517c04e461de
entity_hashes:
  func:createWhatsAppLink: 48e63882e6e926f6
  func:formatPhoneNumber: d061dc961d242dd9
  func:generateContactMessage: e8ee883ed141fd52
  func:generateFAQSupportMessage: 4d0baf056a250a84
  func:generateStockInquiryMessage: 70140afcddbd0bcd
  func:generateSupportMessage: c235bb122d3c44da
  func:generateTechnicalQuoteMessage: 06a0d3f0059092a0
  func:getStockInquiryLink: 5b98cfd06bb736c1
  func:getSupportLink: c9557dee0e999816
  func:getWhatsAppNumber: 1b0300022a29e138
  func:isWhatsAppAvailable: 424fa5ec202a97c6
  overview: 3ca7064f9419922a
generated_at: 2026-06-08T08:58:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde WhatsApp üzerinden müşteri ve iç iletişim süreçlerini kolaylaştırmak için geliştirilmiş bir utility modülüdür. Tüm WhatsApp entegrasyonu ile ilgili işlevleri tek merkezde toplayarak, uygulama içinde tutarlı bir iletişim altyapısı sunar. Telefon numarası formatlama, senaryoya özel mesaj şablonları oluşturma ve tek tıkla kullanılabilir iletişim linkleri üretme gibi temel sorumlulukları üstlenir.

## Fonksiyon Grupları
### Temel WhatsApp Altyapı Fonksiyonları
WhatsApp hizmetinin kullanılabilirliğini kontrol eden, sistemdeki kayıtlı resmi WhatsApp numarasını çeken ve telefon numaralarını standart formata dönüştüren temel işlevleri barındırır.
- getWhatsAppNumber, isWhatsAppAvailable, formatPhoneNumber

### Mesaj Şablonu Üretici Fonksiyonları
Stok sorgulama, müşteri desteği, teknik teklif, SSS ve genel iletişim gibi farklı kullanım senaryolarına özel dinamik WhatsApp mesaj içerikleri üreten fonksiyonları içerir.
- generateStockInquiryMessage, generateSupportMessage, generateTechnicalQuoteMessage, generateFAQSupportMessage, generateContactMessage

### WhatsApp Link Üretici Fonksiyonları
Numara formatlama ve mesaj şablonu oluşturma işlevlerini birleştirerek, kullanıcıların doğrudan tıklayarak WhatsApp sohbetini açabileceği standart iletişim linkleri üretir. Hem genel amaçlı hem de senaryoya özel link üretici fonksiyonları barındırır.
- createWhatsAppLink, getStockInquiryLink, getSupportLink

---

## AXIOMS – Mimari Varsayımlar
Bu modül, WhatsApp iletişimi için telefon numarası formatlama, şablonlu mesaj üretme ve paylaşılabilir sohbet bağlantısı oluşturma işlemlerini gerçekleştirir, doğru çalışması için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer çalışma zamanında cihazda veya sunucuda erişilebilir bir WhatsApp istemcisi/API erişimi yoksa, isWhatsAppAvailable() fonksiyonu doğru kullanılabilirlik durumunu döndüremez, tüm üretilen WhatsApp bağlantıları işlevsiz kalır.
[Aksiyom 2]: Eğer telefon numarası alan tüm fonksiyonlara (formatPhoneNumber, createWhatsAppLink vb.) iletilen string, geçerli bir telefon numarası desenine uymuyorsa, numara başarıyla formatlanamaz ve oluşturulan sohbet bağlantıları açılamaz.
[Aksiyom 3]: Eğer fonksiyon imzalarında zorunlu (opsiyonel olmayan) olarak tanımlanan phone, message, productName gibi parametreler ilgili fonksiyonlara iletilmezse, istenen mesaj veya bağlantı oluşturulamaz, çalışma zamanında hata meydana gelir.
[Aksiyom 4]: Eğer WhatsApp tarafından kullanılan resmi wa.me deep link standardı erişilemez olursa veya kullanım dışı kalırsa, createWhatsAppLink ve tüm get...Link prefixli fonksiyonlar tarafından üretilen bağlantılar çalışmaz.
[Aksiyom 5]: Eğer modül içinde önceden tanımlı sabit mesaj şablonları yoksa, sıfır veya sadece opsiyonel parametre alan generateFAQSupportMessage(), generateContactMessage() gibi fonksiyonlar geçerli bir ileti metni üretemez.
[Aksiyom 6]: Eğer opsiyonel parametre olarak tanımlanan sku, subject, projectInfo, name gibi ek bilgiler ilgili fonksiyonlara iletilmezse, üretilen mesajlarda ilgili detaylar eksik kalır, iletilerin içeriği yetersiz olur.

---

## FONKSİYON DETAYLARI

### getWhatsAppNumber
**Ne yapar**: Ortam değişkenlerinden WhatsApp telefon numarasını alır, temizler ve geçerliliğini kontrol eder. Eğer ortam değişkeni eksikse veya numara 10 haneden kısaysa null döndürür, kullanıma hazır sadece sayılardan oluşan bir numara sunar.
**Nasıl yapar**: Öncelikle ilgili ortam değişkenindeki ham numara değerini çeker, tüm sayısal olmayan karakterleri temizler. Sonra temizlenmiş numaranın uzunluğunu kontrol eder, 10 hane veya daha uzunsa geçerli sayarak ilgili değeri döndürür, aksi halde null döndürür.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz
**Dönüş**: string | null — Yalnızca sayılardan oluşan temizlenmiş geçerli telefon numarasını, eğer numara geçersiz veya mevcut değilse null değerini döndürür.

### formatPhoneNumber
**Ne yapar**: Ham olarak girilen herhangi bir formatta telefon numarasını WhatsApp kullanımı için uygun hale getirir, tüm sayısal olmayan karakterleri kaldırarak sadece rakamlardan oluşan bir string oluşturur.
**Nasıl yapar**: Gelen ham telefon numarası stringi üzerinden tüm sayı dışındaki karakterleri (+, parantez, tire, boşluk vb.) siler, sadece sayısal değerleri koruyarak WhatsApp entegrasyonu için uygun formatta bir string hazırlar.
**Parametreler**:
- phone: string — '+90 (555) 123-4567' gibi farklı formatlarda olabilen ham telefon numarası stringi
**Dönüş**: string — Tamamen sayılardan oluşan, WhatsApp kullanımına uygun telefon numarası temsilini döndürür.

### createWhatsAppLink
**Ne yapar**: Verilen hedef telefon numarası ve önceden doldurulacak mesaj ile tam formatlanmış wa.me WhatsApp API bağlantısı oluşturur, bu bağlantı tıklandığında doğrudan WhatsApp uygulaması veya web sürümünü açar.
**Nasıl yapar**: Gelen telefon numarası ve mesajı URL standartlarına uygun şekilde kodlar, wa.me domaini ile birleştirerek eksiksiz bir HTTPS URL'si oluşturur, mesajın sohbet açıldığında otomatik olarak metin alanına gelmesini sağlar.
**Parametreler**:
- phone: string — Mesaj gönderilecek hedef telefon numarası
- message: string — WhatsApp sohbetinde otomatik olarak doldurulacak ilk metin mesajı
**Dönüş**: string — WhatsApp'ı açmak için kullanılabilecek eksiksiz HTTPS URL'sini döndürür.

### generateStockInquiryMessage
**Ne yapar**: Ürün stok durumu hakkında soru sormak için standart, önceden doldurulmuş Türkçe bir mesaj oluşturur, isteğe bağlı olarak ürün SKU bilgisini de mesaja ekleyerek kişiselleştirilmiş bir metin sunar.
**Nasıl yapar**: Hazır şablonundaki Türkçe mesaja, gelen ürün adı ve varsa SKU bilgisini yerleştirerek kullanıcının herhangi bir ek düzenleme yapmasına gerek kalmadan doğrudan gönderebileceği bir stok sorgusu mesajı hazırlar.
**Parametreler**:
- productName: string — Stok durumu sorgulanacak ürünün adı
- sku?: string — İsteğe bağlı olarak ürünün Stok Takip Numarası (SKU) tanımlayıcısı
**Dönüş**: string — Stok durumu hakkında soru içeren formatlanmış Türkçe bir mesaj döndürür.

### generateSupportMessage
**Ne yapar**: Genel destek talebi başlatmak için formatlanmış Türkçe bir mesaj oluşturur, isteğe bağlı olarak destek talebinin konusunu mesaja ekleyerek kişiselleştirilmiş bir destek başlangıç metni sunar.
**Nasıl yapar**: Varsayılan selamlama ve yardım talebi şablonuna, eğer konu bilgisi girilmişse konu başlığını ekleyerek eksiksiz bir destek mesajı oluşturur, kullanıcının sohbeti başlatırken ek metin girmesine gerek kalmadan doğrudan göndermesini sağlar.
**Parametreler**:
- subject?: string — İsteğe bağlı olarak destek talebinin konusu veya konu hakkındaki detay
**Dönüş**: string — Destek görüşmesi başlatmak için formatlanmış Türkçe bir mesaj döndürür.

### generateTechnicalQuoteMessage
**Ne yapar**: Teknik teklif talebi göndermek için yapılandırılmış Türkçe bir mesaj oluşturur, isteğe bağlı olarak ilgili ürün ve proje detaylarını mesaja dahil ederek kapsamlı bir teklif talebi metni sunar.
**Nasıl yapar**: Teklif talebi için hazırlanmış şablon mesaja, girilmişse ürün adı ve proje kapsamı hakkındaki detayları ekleyerek kişiselleştirilmiş, tüm gerekli bilgileri içeren bir mesaj oluşturur.
**Parametreler**:
- productName?: string — İsteğe bağlı olarak ilgilenilen spesifik ürünün adı
- projectInfo?: string — İsteğe bağlı olarak projenin kapsamı hakkındaki detaylar
**Dönüş**: string — Teknik teklif talebi için formatlanmış Türkçe bir mesaj döndürür.

### generateFAQSupportMessage
**Ne yapar**: SSS (Sıkça Sorulan Sorular) sayfasında aradığı cevabı bulamayan kullanıcılar için standart Türkçe bir yardım talebi mesajı oluşturur, herhangi bir parametreye gerek duymadan sabit şablonunu doğrudan sunar.
**Nasıl yapar**: Önceden tanımlanmış sabit şablonundaki metni doğrudan döndürerek, kullanıcının herhangi bir ek bilgi girmesine gerek kalmadan doğrudan destek ekibine gönderebileceği bir mesaj sunar.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz
**Dönüş**: string — SSS bağlamında yardım talep eden standart Türkçe bir mesaj döndürür, örnek çıktısı "Merhaba! SSS sayfasında aradığım bilgiyi bulamadım. Bana yardımcı olabilir misiniz?" şeklindedir.

### generateContactMessage
**Ne yapar**: Genel iletişim talepleri için formatlanmış Türkçe bir mesaj oluşturur, isteğe bağlı olarak gönderenin adı ve talebin konusunu mesaja ekleyerek kişiselleştirilmiş bir iletişim başlangıç metni sunar.
**Nasıl yapar**: Genel iletişim için hazırlanmış şablon mesaja, girilmişse gönderenin adı ve talep konusunu ekleyerek kullanıcının doğrudan gönderebileceği eksiksiz bir iletişim mesajı oluşturur.
**Parametreler**:
- name?: string — İsteğe bağlı olarak mesajı gönderen kişinin adı
- subject?: string — İsteğe bağlı olarak sorgulamanın konusu
**Dönüş**: string — Genel iletişim başlatmak için uygun formatlanmış Türkçe bir mesaj döndürür.

### isWhatsAppAvailable
**Ne yapar**: Mevcut çalışma ortamında WhatsApp özelliğinin tam olarak yapılandırılmış ve kullanıma hazır olup olmadığını kontrol eder, sadece geçerli bir numara mevcutsa hizmetin kullanılabileceğini bildirir.
**Nasıl yapar**: İçinde getWhatsAppNumber fonksiyonunu çağırarak geçerli bir WhatsApp numarasının ortam değişkenlerinde mevcut olup olmadığını denetler, elde edilen sonuca göre boolean bir durum değeri döndürür.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz
**Dönüş**: boolean — Eğer ortam değişkenlerinde geçerli bir WhatsApp numarası mevcutsa true, aksi takdirde false değerini döndürür.

### getStockInquiryLink
**Ne yapar**: Belirli bir ürünün stok durumu sorgusu için özel olarak hazırlanmış eksiksiz bir WhatsApp URL'si oluşturur, eğer WhatsApp hizmeti mevcut ortamda yapılandırılmamışsa null döndürür.
**Nasıl yapar**: Önce WhatsApp'ın kullanılabilirliğini isWhatsAppAvailable fonksiyonu ile kontrol eder, geçerliyse generateStockInquiryMessage ile stok sorgusu mesajını oluşturur, son olarak createWhatsAppLink ile sistemdeki geçerli WhatsApp numarası kullanılarak tam URL'yi birleştirir. Herhangi bir aşamada geçersizlik durumunda null döndürür.
**Parametreler**:
- productName: string — Stok durumu sorgulanacak ürünün adı
- sku?: string — İsteğe bağlı olarak ürünün Stok Takip Numarası (SKU)
**Dönüş**: string | null — Tam olarak yapılandırılmış kullanılabilir WhatsApp URL'sini, eğer WhatsApp hizmeti yapılandırılmamışsa null değerini döndürür.

### getSupportLink
**Ne yapar**: Bu fonksiyon, genel destek sorguları için tam ve kullanıma hazır bir WhatsApp mesaj URL'i oluşturur. Fonksiyon, belirtilen destek konusunu (subject) içeren bir mesaj linki üretir ve bu linki doğrudan kullanıma sunar.

**Nasıl yapar**: Fonksiyon首先 `getWhatsAppNumber()` yardımıyla yapılandırılmış WhatsApp telefon numarasını alır. Eğer numara mevcut değilse (yani WhatsApp yapılandırılmamışsa) `null` değeri döndürerek sonlanır. Numara mevcutsa, opsiyonel olarak verilen `subject` parametresini kullanarak `generateSupportMessage()` ile bir mesaj metni oluşturur. Son olarak, `createWhatsAppLink()` fonksiyonunu çağırarak telefon numarası ve mesajı birleştirip tam bir WhatsApp URL'i üretir.

**Parametreler**:
- subject: string | undefined — Destek isteğinin konusu veya başlığı. Opsiyonel bir parametredir; sağlanmazsa varsayılan bir destek mesajı oluşturulur.

**Dönüş**: string | null — WhatsApp'ın yapılandırılmış olup olmadığına göre tam URL stringi veya `null`. Eğer geçerli bir WhatsApp numarası yapılandırılmışsa, `https://api.whatsapp.com/send?phone=...&text=...` formatında bir URL döndürür; aksi halde `null` döner.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: whatsapp.ts::getWhatsAppNumber
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envWa` — `process.env.NEXT_PUBLIC_SHOP_WHATSAPP` değerini tutar; WhatsApp numarası ENV'den okunur
  - `raw` — envWa string ve boş değilse_trim'lenmiş hali, değilse boş string; normalize öncesi ham değer
  - `normalized` — raw değerinden `\D` (rakam dışı) karakterleri temizler; sadece rakamlar kalır
- **Dönüş**: `string | null` — normalize edilmiş numara 10+ haneliyse string, değilse null

---

### [N2_NASIL] AST Pointer: whatsapp.ts::formatPhoneNumber
- **params**: `phone: string` — biçimlendirilecek ham telefon numarası
- **ic_degiskenler**: (yok — doğrudan return)
- **Dönüş**: `string` — phone içinden rakam dışı tüm karakterlerin kaldırılmış hali

---

### [N3_NASIL] AST Pointer: whatsapp.ts::createWhatsAppLink
- **params**: `phone: string` — WhatsApp numarası, `message: string` — gönderilecek mesaj metni
- **ic_degiskenler**: (yok — doğrudan return)
- **Dönüş**: `string` — `buildWhatsAppLink(phone, message)` import'lu lib/utils fonksiyonunun dönüşü; WhatsApp deep-link URL'i

---

### [N4_NASIL] AST Pointer: whatsapp.ts::generateStockInquiryMessage
- **params**: `productName: string` — ürün adı, `sku?: string` — opsiyonel SKU kodu
- **ic_degiskenler**: (yok — template literal doğrudan return)
- **Dönüş**: `string` — stok sorgulama mesajı; productName her zaman, SKU sadece varsa mesaja dahil edilir

---

### [N5_NASIL] AST Pointer: whatsapp.ts::generateSupportMessage
- **params**: `subject?: string` — opsiyonel destek konusu
- **ic_degiskenler**:
  - `baseMessage` — sabit selamlama metni: `'Merhaba! Size nasıl yardımcı olabilirim?'`
- **Dönüş**: `string` — subject varsa baseMessage'a `\n\nKonu: {subject}` eklenir, yoksa sadece baseMessage döner

---

### [N6_NASIL] AST Pointer: whatsapp.ts::generateTechnicalQuoteMessage
- **params**: `productName?: string` — opsiyonel ürün adı, `projectInfo?: string` — opsiyonel proje bilgisi
- **ic_degiskenler**:
  - `message` — `'Merhaba! Teknik teklif talebi:'` ile başlar, koşullara göre追加_satırlarla genişletilir
- **Dönüş**: `string` — productName varsa `\nÜrün: {productName}`, projectInfo varsa `\nProje Bilgileri: {projectInfo}`, yoksa varsayılan proje detay talebi eklenir

---

### [N7_NASIL] AST Pointer: whatsapp.ts::generateFAQSupportMessage
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan return)
- **Dönüş**: `string` — SSS destek talep mesajı sabit metin olarak döner

---

### [N8_NASIL] AST Pointer: whatsapp.ts::generateContactMessage
- **params**: `name?: string` — opsiyonel kullanıcı adı, `subject?: string` — opsiyonel mesaj konusu
- **ic_degiskenler**:
  - `message` — `'Merhaba!'` ile başlar, koşullara göre追加_satırlarla genişletilir; son olarak yardim talep satırı eklenir
- **Dönüş**: `string` — name varsa ` Ben {name}.`, subject varsa `\n\nKonu: {subject}` eklenir, her durumda `\n\nSize nasıl yardımcı olabilirim ? ` ile biter

---

### [N9_NASIL] AST Pointer: whatsapp.ts::isWhatsAppAvailable
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan return)
- **Dönüş**: `boolean` — `getWhatsAppNumber()` null değilse true, null ise false

---

### [N10_NASIL] AST Pointer: whatsapp.ts::getStockInquiryLink
- **params**: `productName: string` — ürün adı, `sku?: string` — opsiyonel SKU kodu
- **ic_degiskenler**:
  - `phone` — `getWhatsAppNumber()` dönüşü; ENV'den okunan normalize edilmiş WhatsApp numarası veya null
  - `message` — `generateStockInquiryMessage(productName, sku)` dönüşü; stok sorgulama mesajı metni
- **Dönüş**: `string | null` — phone null ise null döner; değilse `createWhatsAppLink(phone, message)` ile WhatsApp linki döner

---

### [N11_NASIL] AST Pointer: whatsapp.ts::getSupportLink
- **params**: `subject?: string` — opsiyonel destek konusu
- **ic_degiskenler**:
  - `phone` — `getWhatsAppNumber()` dönüşü; ENV'den okunan normalize edilmiş WhatsApp numarası veya null
  - `message` — `generateSupportMessage(subject)` dönüşü; destek mesajı metni
- **Dönüş**: `string | null` — phone null ise null döner; değilse `createWhatsAppLink(phone, message)` ile WhatsApp linki döner

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    whatsapp_ts__createWhatsAppLink["createWhatsAppLink"]
    whatsapp_ts__formatPhoneNumber["formatPhoneNumber"]
    whatsapp_ts__generateContactMessage["generateContactMessage"]
    whatsapp_ts__generateFAQSupportMessage["generateFAQSupportMessage"]
    whatsapp_ts__generateStockInquiryMessage["generateStockInquiryMessage"]
    whatsapp_ts__generateSupportMessage["generateSupportMessage"]
    whatsapp_ts__generateTechnicalQuoteMessage["generateTechnicalQuoteMessage"]
    whatsapp_ts__getStockInquiryLink["getStockInquiryLink"]
    whatsapp_ts__getSupportLink["getSupportLink"]
    whatsapp_ts__getWhatsAppNumber["getWhatsAppNumber"]
    whatsapp_ts__isWhatsAppAvailable["isWhatsAppAvailable"]
    whatsapp_ts__getSupportLink --> whatsapp_ts__getWhatsAppNumber
    whatsapp_ts__isWhatsAppAvailable --> whatsapp_ts__getWhatsAppNumber
    whatsapp_ts__getSupportLink --> whatsapp_ts__generateSupportMessage
    whatsapp_ts__getStockInquiryLink --> whatsapp_ts__getWhatsAppNumber
    whatsapp_ts__getStockInquiryLink --> whatsapp_ts__generateStockInquiryMessage
    whatsapp_ts__getSupportLink --> whatsapp_ts__createWhatsAppLink
    whatsapp_ts__getStockInquiryLink --> whatsapp_ts__createWhatsAppLink
```

## NODE ID STANDARD

  file: src\utils\whatsapp.ts
  function: src\utils\whatsapp.ts::getWhatsAppNumber
  function: src\utils\whatsapp.ts::formatPhoneNumber
  function: src\utils\whatsapp.ts::createWhatsAppLink
  function: src\utils\whatsapp.ts::generateStockInquiryMessage
  function: src\utils\whatsapp.ts::generateSupportMessage
  function: src\utils\whatsapp.ts::generateTechnicalQuoteMessage
  function: src\utils\whatsapp.ts::generateFAQSupportMessage
  function: src\utils\whatsapp.ts::generateContactMessage
  function: src\utils\whatsapp.ts::isWhatsAppAvailable
  function: src\utils\whatsapp.ts::getStockInquiryLink
  function: src\utils\whatsapp.ts::getSupportLink

---

## DISA AKTARILANLAR (EXPORTS)
  export: createWhatsAppLink
  export: formatPhoneNumber
  export: generateContactMessage
  export: generateFAQSupportMessage
  export: generateStockInquiryMessage
  export: generateSupportMessage
  export: generateTechnicalQuoteMessage
  export: getStockInquiryLink
  export: getSupportLink
  export: getWhatsAppNumber
  export: isWhatsAppAvailable