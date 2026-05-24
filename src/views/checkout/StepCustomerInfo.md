---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\StepCustomerInfo.tsx
skeleton_hash: 0f6c10a75d5ca248
generated_at: 2026-05-23T22:40:44Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ödeme (checkout) akışının müşteri bilgilerini girme adımını yöneten React bileşenidir. Üst bileşenden aldığı mevcut müşteri bilgisi verisini ve güncelleme fonksiyonunu kullanarak kullanıcının bilgilerini düzenlemesine olanak tanır. Çoklu dil desteği için gelen çeviri fonksiyonuyla arayüz metinlerini kullanıcının dil tercihine uygun şekilde sunar.

## Fonksiyon Grupları
### Ana Müşteri Bilgisi Adımı Bileşeni
Modülün tek ana sorumluluğu olan ödeme akışının müşteri bilgisi girme adımının tüm işlevlerini üstlenir. Üst bileşenle veri alışverişi yaparak kullanıcı tarafından yapılan bilgi güncellemelerini iletir ve adım arayüzünü kullanıcıya sunar.
- StepCustomerInfo

---

## AXIOMS – Mimari Varsayımlar
Bu checkout sürecinin müşteri bilgisi girişi adımına ait React bileşeninin çalışması, kendisine aktarılan tüm zorunlu prop'ların eksiksiz ve doğru biçimde sağlanmasına tamamen bağlıdır.

[Aksiyom 1]: Eğer mevcut müşteri bilgilerini içeren customerInfo nesnesi prop olarak sağlanmazsa, bilgi giriş alanları boş veya geçersiz state ile yüklenir, kullanıcı doğru bilgiyi giremez.
[Aksiyom 2]: Eğer customerInfo nesnesini güncellemek için kullanılan setCustomerInfo state setter fonksiyonu sağlanmazsa, kullanıcının girdiği yeni bilgiler kaydedilemez, sonraki sipariş adımlarına aktarılamaz.
[Aksiyom 3]: Eğer arayüz metinlerini yönetmek için kullanılan t fonksiyonu sağlanmazsa, ekrandaki tüm etiket, uyarı ve buton metinleri yüklenemez, kullanıcı arayüzü kullanılamaz hale gelir.

---

## FONKSIYON DETAYLARI

### StepCustomerInfo
**Ne yapar**: VentHub HVAC projesinin ödeme (checkout) sürecinin müşteri bilgileri giriş adımını oluşturan React fonksiyonel bileşenidir. Ödeme akışı sırasında kullanıcının müşteri bilgilerini girebileceği, yönetebileceği ve doğrulayabileceği arayüzü sunar, tüm süreçte üst bileşenlerle senkronize çalışarak müşteri verilerinin bütünlüğünü korur.
**Nasıl yapar**: Üst bileşenden alınan mevcut müşteri bilgisi verisini temel alarak arayüzü renderlar, kullanıcı tarafından yapılan tüm bilgi güncellemelerini kendisine prop olarak gelen state setter fonksiyonu aracılığıyla üst bileşene ileterek merkezi state yönetimini destekler. Çeviri fonksiyonu prop'u üzerinden arayüzdeki tüm metinleri çoklu dil desteğine uygun olarak gösterir, tanımlanmış StepCustomerInfoProps tip kontrolü ile type safety sağlayarak güvenilir bir bileşen yapısı sunar.
**Parametreler**:
- customerInfo: StepCustomerInfoProps üzerinden aktarılan müşteri verisi nesnesi — Üst bileşenden iletilen, mevcut müşterinin tüm kişisel ve iletişim bilgilerini içeren nesnedir, bileşen tarafından arayüzdeki başlangıç değerleri olarak kullanılır.
- setCustomerInfo: StepCustomerInfoProps üzerinden aktarılan state setter fonksiyonu — Üst bileşenin müşteri bilgisi state'ini güncellemek için kullanılan fonksiyondur, kullanıcı tarafından girilen yeni bilgileri alarak üst bileşendeki state'i yeniler.
- t: StepCustomerInfoProps üzerinden aktarılan çeviri fonksiyonu — Uluslararasılaştırma (i18n) süreçlerinde kullanılan fonksiyondur, arayüzdeki statik metinlerin kullanıcının tercih ettiği dile uygun olarak gösterilmesini sağlar.
**Dönüş**: React.FC<StepCustomerInfoProps> — Tanımlanan tiplere uygun React fonksiyonel bileşeni döndürür, bu bileşen ödeme sürecinin müşteri bilgileri adımının tüm kullanıcı arayüzünü ve kullanıcı etkileşimlerini sorumluluğunda yürütür.

---

## INTERFACES

### StepCustomerInfoProps
- `customerInfo: CheckoutCustomerInfo`
- `setCustomerInfo: (info: CheckoutCustomerInfo) => void`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\StepCustomerInfo.tsx::StepCustomerInfo
- **params**: (customerInfo, setCustomerInfo, t)
- **ic_degiskenler**:
  - `customerInfo` — Müşteri kişisel bilgilerini tutan state nesnesi, form inputlarının mevcut değerlerini sağlamak için kullanılır
  - `setCustomerInfo` — customerInfo state'ini güncellemek için kullanılan React state setter fonksiyonu, her input değişikliğinde ilgili alanı günceller
  - `t` — Çoklu dil desteği için kullanılan çeviri (i18n) fonksiyonu, tüm form başlıkları, etiketleri ve placeholder metinlerini getirmek için kullanılır
  - `customerInfo.name` — customerInfo nesnesinde müşterinin ad-soyad bilgisini tutan alan, isim inputunun değeri olarak atanır
  - `customerInfo.email` — customerInfo nesnesinde müşterinin e-posta adresini tutan alan, e-posta inputunun değeri olarak kullanılır
  - `customerInfo.phone` — customerInfo nesnesinde müşterinin telefon numarasını tutan alan, telefon inputunun değeri olarak atanır
  - `customerInfo.identityNumber` — customerInfo nesnesinde müşterinin kimlik numarasını tutan alan, kimlik numarası inputunun değeri olarak kullanılır
  - `e.target.value` — Input değişikliklerinde tetiklenen event nesnesinden alınan güncel input değeri, setCustomerInfo ile ilgili müşteri bilgisi alanına yazılır
  - `User` — Lucide-react'ten import edilen kullanıcı ikonu, form başlığının solunda gösterilmek üzere kullanılır
- **Dönüş**: Checkout sürecinin müşteri bilgileri adımının kullanıcı arayüzünü oluşturan React JSX elementi, bilgi giriş inputları ve görsel bileşenler içerir

---

## NODE ID STANDARD

  file: src\views\checkout\StepCustomerInfo.tsx
  function: src\views\checkout\StepCustomerInfo.tsx::StepCustomerInfo

---

## DISA AKTARILANLAR (EXPORTS)
  export: StepCustomerInfo