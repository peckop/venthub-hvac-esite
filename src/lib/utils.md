---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\utils.ts
skeleton_hash: bf2da76717d645d4
entity_hashes:
  func:buildWhatsAppLink: 5a13d41915079738
  func:cn: 2cda58c352da4d7c
  overview: 0d255118ec884be0
generated_at: 2026-06-08T10:10:57Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin genel yardımcı fonksiyonlarını içerir. Arayüz stil yönetimini ve WhatsApp iletişim entegrasyonunu kolaylaştıran bağımsız ve yeniden kullanabilir araçlar sunar.

## Fonksiyon Grupları
### CSS Sınıfı Yönetimi
Tailwind CSS sınıflarını dinamik ve koşullu olarak birleştirerek temiz, bakımı kolay stil tanımları oluşturmayı sağlar.
- cn()

### WhatsApp İletişim Entegrasyonu
Kullanıcıların doğrudan WhatsApp üzerinden iletişim kurmasını kolaylaştıran, telefon numarası ve mesaj ile tıklanabilir bağlantılar üretir.
- buildWhatsAppLink

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Verilen modüldeki fonksiyonların (`cn`, `buildWhatsAppLink`) gövdeleri paylaşılmamıştır. Mimari varsayımlar yalnızca fonksiyon gövdelerinden üretilmelidir; docstring'lerden veya fonksiyon adlarından çıkarım yapılmaz. Gövde bilgisi olmadan modüle özgü koşul–sonuç ilişkileri belirlenemez.

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
- **params**: `...inputs: ClassValue[]` — clsx'e aktarılan bir veya birden fazla CSS class value'su
- **ic_degiskenler**:
  - `inputs` — clsx fonksiyonuna parametre olarak giden, ClassValue[] tipinde rest parametresi; birden fazla CSS class ifadesini tutar
- **Dönüş**: `twMerge(clsx(inputs))` — clsx ile birleştirilmiş class'ları, Tailwind çakışmalarını çözerek döndürür

### [N2_NASIL] AST Pointer: src/lib/utils.ts::buildWhatsAppLink
- **params**: `phone: string, text: string`
- **ic_degiskenler**:
  - `p` — `phone` parametresinden rakam dışı tüm karakterlerin (`+`, `-`, `()`, boşluk vb.) temizlendiği, sadece rakamlardan oluşan telefon numarası
  - `q` — `text` parametresinin `URLSearchParams` ile URL-safe query string'e dönüştürülmüş hali
- **Dönüş**: `https://wa.me/{p}?text={q}` formatında WhatsApp doğrudan mesaj bağlantısı; hata durumunda sadece `https://wa.me/{p}`

**Try bloğu detayı**: `p` ve `q` oluşturulur; `q` boş değilse `?${q}` eklenerek tam URL döndürülür.
**Catch bloğu detayı**: Sadece `p` oluşturulur, query parametresi olmadan `https://wa.me/${p}` döndürülür.

---

## NODE ID STANDARD

  file: src\lib\utils.ts
  function: src\lib\utils.ts::cn
  function: src\lib\utils.ts::buildWhatsAppLink

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildWhatsAppLink
  export: cn