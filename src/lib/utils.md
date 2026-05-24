---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\utils.ts
skeleton_hash: de0a20b8af7fe7b4
generated_at: 2026-05-23T22:32:57Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin genel amaçlı yardımcı (utility) fonksiyonlarını barındırır. Hem arayüz geliştirme süreçlerinde ihtiyaç duyulan temel yardımcı işlevi hem de iletişim entegrasyonları için kullanılan link oluşturma aracını sunar. Projenin farklı bölümlerinde yeniden kullanılabilecek odaklı, küçük araçları tek bir noktada toplar.

## Fonksiyon Grupları
### CSS Sınıfı Yönetimi Yardımcısı
Arayüzdeki dinamik CSS sınıflarını birleştirmek, çakışmaları önlemek ve okunabilirliği artırmak için kullanılan işlevi içerir.
- cn()

### WhatsApp İletişim Linki Oluşturma
Kullanıcıların belirtilen telefon numarasına ve önceden tanımlanmış mesaj içeriğiyle doğrudan WhatsApp üzerinden iletişim kurmasını sağlayan özel linkler üretir.
- buildWhatsAppLink

---

## AXIOMS – Mimari Varsayımlar
Bu utility modülü, sınıf ismi birleştirme (cn()) ve WhatsApp iletişim bağlantısı oluşturma (buildWhatsAppLink()) işlevlerini sunar, doğru çalışması için fonksiyonlara iletilen girdilerin beklenen formatta olması ve çalışma zamanı ortamının temel string işleme yeteneklerine sahip olması zorunludur.

[Aksiyom 1]: Eğer buildWhatsAppLink fonksiyonuna iletilen phone parametresi geçerli formatta bir telefon numarası stringi değilse, oluşturulan WhatsApp bağlantısı kullanıcıyı doğru sohbete yönlendiremez.
[Aksiyom 2]: Eğer buildWhatsAppLink fonksiyonuna iletilen text parametresi URL standartlarına uygun kodlanmadan işlenmezse, bağlantı içindeki mesaj metni bozulur veya eksik iletilir.
[Aksiyom 3]: Eğer cn() fonksiyonuna iletilen argümanlar string, boolean veya boş (undefined/null) değerler dışında bir tipteyse, sınıf ismi birleştirme işlemi başarısız olur, geçersiz CSS sınıfı stringi üretilir.
[Aksiyom 4]: Eğer çalışma zamanı ortamı temel string işleme metotlarını (URL kodlama, string birleştirme vb.) desteklemiyorsa, modül içindeki her iki fonksiyon da çalışma zamanı hatası fırlatır.

---

## FONKSIYON DETAYLARI

### cn
**Ne yapar**: Tailwind CSS sınıflarını birleştirerek, sınıflar arası oluşabilecek tüm çakışmaları güvenli bir şekilde çözen bir işlevdir. Farklı türlerde gelen sınıf girdilerini tek bir geçerli CSS sınıfı stringine dönüştürerek, dinamik sınıf atamalarında sıkça karşılaşılan Tailwind çakışmalarını tamamen ortadan kaldırır.
**Nasıl yapar**: İşlevini iki özel aracı birleştirerek gerçekleştirir. Koşullu sınıf tanımlarını ve farklı türdeki sınıf girdilerini düzleştirmek için `clsx` kütüphanesini kullanır, Tailwind'e özgü sınıf geçersiz kılma işlemlerini yönetmek ve son sınıf setindeki kalan çakışmaları çözmek içinse `twMerge` fonksiyonunu devreye alır. Girdileri sırayla bu iki fonksiyondan geçirerek sorunsuz bir işlem akışı sağlar.
**Parametreler**:
- name: inputs — type: array of string | object | array — Birleştirilip işlenmesi gereken tüm CSS sınıfı değerlerini içeren girdi dizisidir. Bu dizide koşullu sınıf tanımları için mantıksal açıya sahip nesneler, çoklu sınıfı içeren stringler veya iç içe geçmiş sınıf dizeleri gibi farklı türde girdiler desteklenir.
**Dönüş**: string — Tüm çakışmaları çözülmüş, birleştirilmiş tek geçerli Tailwind CSS sınıfı stringi. Kullanıldığı yerde doğrudan elementin class özelliğine atanabilecek formattadır.

### buildWhatsAppLink
**Ne yapar**: WhatsApp uygulaması üzerinden doğrudan iletişim başlatmak için kullanılan standart wa.me formatında derin bağlantı (deeplink) oluşturan bir işlevdir. Farklı formatlarda girilen telefon numarası ve özel karakter içeren mesaj metinlerini standartlara uygun şekilde işleyerek kullanılabilir bir bağlantı haline getirir.
**Nasıl yapar**: İlk olarak girilen telefon numarasındaki tüm rakam dışı karakterleri temizleyerek, herhangi bir formatta gelen telefon numarasını standart numara formatına dönüştürür. Ardından mesaj metnini URL güvenli hale getirmek için URL kodlaması uygulayarak bağlantının bozulmasını önler. İşlenmiş bu iki değeri wa.me domain yapısına yerleştirerek tam teşekküllü bir WhatsApp bağlantısı oluşturur.
**Parametreler**:
- name: phone — type: string — WhatsApp bağlantısı oluşturulacak hedef telefon numarası. Ülke kodu, parantez, boşluk veya özel karakter içeren herhangi bir formattaki girdi kabul edilir, fonksiyon içinden tüm rakam dışı karakterler otomatik olarak temizlenir.
- name: text — type: string — WhatsApp üzerinden hedef numaraya otomatik olarak yüklenecek mesaj metni. Bağlantıda sorunsuz şekilde kullanılabilmesi için URL kodlamasına tabi tutulur.
**Dönüş**: Kaynak kodda dönüş türü olarak void veya bilinmiyor olarak belirtilmiştir, uydurma bilgi üretmek yasaklandığı için ek varsayımda bulunulmamıştır. Fonksiyonun temel amacı wa.me formatında geçerli bir WhatsApp derin bağlantısı oluşturmaktır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\utils.ts::cn
- **params**: [...inputs: ClassValue[]]
- **ic_degiskenler**:
  - `inputs` — Birden fazla ClassValue tipinde sınıf değeri alan rest parametresi, sınıf birleştirme işlemi için clsx ve twMerge fonksiyonlarına aktarılır
  - `clsx` — Gelen sınıf değerlerini birleştirmek için kullanılan üçüncü parti clsx kütüphanesi fonksiyonu
  - `twMerge` — Tailwind CSS sınıfı çakışmalarını çözmek için kullanılan üçüncü parti tailwind-merge kütüphanesi fonksiyonu
- **Dönüş**: Birleştirilmiş ve çakışmaları giderilmiş sınıf string'i

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\utils.ts::buildWhatsAppLink
- **params**: [phone: string, text: string]
- **ic_degiskenler**:
  - `phone` — WhatsApp mesajının gönderileceği hedef telefon numarası, sadece rakamları kalacak şekilde temizlenerek linke eklenir
  - `text` — WhatsApp üzerinden otomatik olarak yazılacak mesaj metni, URL kodlanarak linkin sorgu parametresine eklenir
  - `p (try bloğu)` — Gelen phone parametresini stringe çevirip, rakam dışı tüm karakterleri temizleyen değişken, WhatsApp linkinin numara bölümünü oluşturur
  - `q` — Gelen text parametresini stringe çevirip URLSearchParams ile kodlayarak, linke eklenmek üzere sorgu string'i haline getiren değişken
  - `p (catch bloğu)` — Herhangi bir hata durumunda tekrar phone parametresini temizleyen, temel WhatsApp linkinin numara bölümünü oluşturan değişken
  - `URLSearchParams` — Metinleri URL güvenli sorgu parametrelerine dönüştürmek için kullanılan yerleşik API
- **Dönüş**: Oluşturulan tam WhatsApp URL string'i, hata durumunda sorgu parametresi olmadan temel link döndürülür

---

## NODE ID STANDARD

  file: src\lib\utils.ts
  function: src\lib\utils.ts::cn
  function: src\lib\utils.ts::buildWhatsAppLink

---

## DISA AKTARILANLAR (EXPORTS)
  export: buildWhatsAppLink
  export: cn