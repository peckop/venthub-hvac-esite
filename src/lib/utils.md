---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\utils.ts
skeleton_hash: de0a20b8af7fe7b4
entity_hashes:
  func:buildWhatsAppLink: 5a13d41915079738
  func:cn: 2cda58c352da4d7c
  overview: dce777117b4a4d4d
generated_at: 2026-05-28T22:38:33Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin genel amaçlı yardımcı fonksiyonlarını içerir. Temel olarak arayüz geliştirme süreçlerinde kullanılan CSS sınıfı birleştirme işlevi ve kullanıcı iletişimini kolaylaştıran WhatsApp link oluşturma aracını sunar. Fonksiyonlar bağımsız ve odaklıdır, projenin farklı bölümlerinde yeniden kullanılmak üzere tasarlanmıştır.

## Fonksiyon Grupları
### CSS Sınıfı Yönetimi
Arayüzdeki dinamik CSS sınıflarını güvenli ve verimli bir şekilde birleştirmek için kullanılır. Bu işlev, koşullu sınıfları ve çakışmaları yöneterek temiz ve bakımı kolay stil tanımları oluşturmayı sağlar.
- cn()

### WhatsApp İletişim Entegrasyonu
Kullanıcıların doğrudan WhatsApp üzerinden iletişim kurmasını kolaylaştırır. Belirtilen telefon numarası ve mesaj ile önceden yapılandırılmış, tıklanabilir bir iletişim bağlantısı üretir.
- buildWhatsAppLink

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC projesinin genel yardımcı (utility) fonksiyonlarını içerir ve her biri belirli bir amacı olan bağımsız araçlar sunar.

[Aksiyom 1]: Eğer `buildWhatsAppLink` fonksiyonu çalıştırılacaksa, `phone` parametresi geçerli bir telefon numarası formatında olmalıdır. Eğer geçerli bir telefon numarası Formatında değilse, oluşturulan link WhatsApp tarafından tanınamaz ve iletişim başlatılamaz.

[Aksiyom 2]: Eğer `buildWhatsAppLink` fonksiyonu çalıştırılacaksa, `text` parametresi boş bir string ("") olmamalıdır. Eğer metin içeriği boş olursa, kullanıcı WhatsApp'a yönlendirildiğinde boş bir mesaj alanı ile karşılaşır ve bu beklenen bir kullanım deneyimi sağlamaz.

---

## FONKSİYON DETAYLARI

### cn
**Ne yapar**: Tailwind CSS sınıflarını birleştiren ve çözen bir yardımcı fonksiyondur. Koşullu sınıfları işlerken Tailwind'in özel çakışma kurallarını göz önünde bulundurarak tek ve tutarlı bir sınıf dizesi üretir.

**Nasıl yapar**: Fonksiyon, girdi olarak verilen sınıf değerlerini önce `clsx` kütüphanesi ile işler. Bu adım, koşullu nesneleri ve dizileri düz, birleşik bir dizeye dönüştürür. Ardından, elde edilen dizeyi `twMerge` kütüphanesine vererek Tailwind'e özgü çakışmaları (örneğin, `px-2` ve `px-4` gibi) otomatik olarak çözer ve geçerli olanı korur.

**Parametreler**:
- inputs: ClassValue[] — İşlenecek sınıf değerlerinin bir dizisi. Her eleman bir dize, nesne veya dize içeren dize olabilir. Koşullu sınıfları temsil etmek için kullanılır.

**Dönüş**: string — Tüm çakışmaları çözülmüş, tek ve geçerli bir Tailwind CSS sınıfı dizesi.

### buildWhatsAppLink
**Ne yapar**: Belirli bir telefon numarası ve mesaj metni ile kullanılmak üzere, `wa.me` formatında bir WhatsApp bağlantı linki (deeplink) oluşturur.

**Nasıl yapar**: Fonksiyon, girilen telefon numarasından rakam dışı tüm karakterleri temizleyerek standart bir format elde eder. Verilen metin dizesini URL parametreleri için güvenli hale getirmek üzere otomatik olarak kodlar. Ardından, temizlenmiş numara ve kodlanmış metni `https://wa.me/` URL'sine entegre ederek tam bir bağlantı linki üretir. İşlem sırasında bir hata oluşursa (geçersiz URL parametreleri gibi), sadece temizlenmiş telefon numarasını içeren basit bir bağlantı döner.

**Parametreler**:
- phone: string — Hedef WhatsApp kullanıcısının telefon numarası. Herhangi bir format kabul edilir; rakam dışı karakterler otomatik olarak temizlenir.
- text: string — WhatsApp'ta otomatik olarak açılacak ön-doldurulmuş mesaj. Fonksiyon tarafından URL kodlamasına tabi tutulur.

**Dönüş**: string — Oluşturulan, tarayıcıda veya uygulamalarda doğrudan açılabilir WhatsApp bağlantı linki (örn. `https://wa.me/905551234567?text=Merhaba`).

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/utils.ts::cn
- **params**: `...inputs: ClassValue[]`
- **ic_degiskenler**:
  - `inputs` — clsx ve twMerge'e iletilmek üzere spread edilen ClassValue dizisi
- **Dönüş**: `string` — çakışması giderilmiş birleştirilmiş Tailwind sınıf dizesi

### [N2_NASIL] AST Pointer: src/lib/utils.ts::buildWhatsAppLink
- **params**: (`phone: string`, `text: string`)
- **ic_degiskenler**:
  - `p` — `phone` değerinden tüm rakam dışı karakterlerin temizlenmiş hali; WhatsApp URL'sindeki numara (try bloğunda tanımlı)
  - `q` — `text` değerinden oluşturulmuş URLSearchParams dizesi; query parametresi olarak eklenecek (try bloğunda tanımlı)
  - `p` — catch bloğunda phone'dan yeniden türetilen temiz numara; hata durumunda fallback URL için kullanılır
- **Dönüş**: `string` — `https://wa.me/{p}` veya `https://wa.me/{p}?text={q}` formatında WhatsApp deep link

---

## NODE ID STANDARD

  file: src\lib\utils.ts
  function: src\lib\utils.ts::cn
  function: src\lib\utils.ts::buildWhatsAppLink

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildWhatsAppLink
  export: cn