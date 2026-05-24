---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\PaymentIframeContainer.tsx
skeleton_hash: 5bac558917d71a75
generated_at: 2026-05-23T22:40:35Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme adımında kullanılan bu modül, müşterilerin güvenli bir şekilde ödeme işlemini gerçekleştirmesi için ödeme penceresini (iframe) barındıran React bileşenini sunar. Iyzico ödeme altyapısı ile entegre çalışarak ödeme sürecinin güvenliğini sağlar, ödeme sayfasındaki yardım paneli gibi ek arayüz elemanlarının görünürlük durumunu da yönetir.

## Fonksiyon Grupları
### Ana Ödeme Iframe Yönetim Bileşeni
Modülün tüm temel sorumluluklarını üstlenen bu bileşen, ödeme süreci için gerekli tüm girdileri alarak güvenli ödeme iframe'ini sayfaya entegre eder, ek arayüz elemanlarının durumunu kontrol eder.
- PaymentIframeContainer

---

## AXIOMS – Mimari Varsayımlar
Bu React bileşeni, Iyzico tabanlı ödeme işlemleri için gömülü ödeme iframe'i sunar, doğru çalışması için aldığı tüm prop'ların beklenen format ve işlevde iletilmesi, ödeme sağlayıcısının servislerine erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer geçerli bir ödeme oturumuna ait iyzToken prop olarak iletilmezse, ödeme sağlayıcısı kimlik doğrulama hatası nedeniyle iframe'i yüklemez, kullanıcı ödeme işlemini tamamlayamaz.
[Aksiyom 2]: Eğer güvenli ve ödeme sağlayıcısı standartlarına uygun paymentFrameContent içeriği iletilmezse, ödeme iframe'i boş yüklenir veya hatalı içerik göstererek ödeme sürecini kesintiye uğratır.
[Aksiyom 3]: Eğer setShowHelp prop olarak geçerli bir React durum değiştirici (setter) fonksiyonu iletilmezse, yardım modülünün açılıp kapatma işlevleri çalışmaz, kullanıcı ödeme sırasında yardım bilgilerine erişemez.
[Aksiyom 4]: Eğer showHelp prop olarak geçerli bir boole değeri iletilmezse, yardım modülünün görünürlük durumu yanlış yönetilir, gerektiğinde açılmaz veya gereksiz yere ekranda kalır.
[Aksiyom 5]: Eğer bileşenin barındığı domain, Iyzico'nun ödeme servisleriyle cross-origin iletişim kurma iznine sahip değilse, güvenlik kısıtlamaları nedeniyle ödeme iframe'i hiç yüklenemez.

---

## FONKSIYON DETAYLARI

### PaymentIframeContainer
**Ne yapar**: VentHub HVAC projesinin ödeme adımında kullanılan, iyzico tabanlı ödeme işlemleri için sarmalayıcı React bileşenidir. Ödeme iframe'ini yönetir, ödeme süreci için gerekli doğrulama verilerini iletir ve ödeme sırasında erişilebilen yardım panelinin durumunu kontrol eder. Kullanıcıların güvenli ödeme akışını sorunsuz tamamlamasını sağlamak için tüm gerekli prop ve state yönetimini bir araya toplar.
**Nasıl yapar**: TypeScript ile tip güvenliği sağlanarak yazılmıştır, tanımlandığı `PaymentIframeContainerProps` arayüzü üzerinden gelen tüm prop'ları doğrular. Ödeme işlemi için zorunlu olan güvenlik token'ını alarak ödeme iframe'ine iletecek şekilde yapılandırılır, yardım paneli için üst component'ten aldığı state ve state setter fonksiyonunu kullanarak görünürlük yönetimini gerçekleştirir. React.FC olarak tanımlanarak ödeme akışına özel tüm işlevleri tek bir sarmalayıcı bileşen altında toplar.
**Parametreler**:
- iyzToken: `string` — iyzico ödeme hizmeti tarafından ödeme işlemi öncesi üretilen, işlemin güvenliğini ve doğruluğunu sağlamak için kullanılan benzersiz güvenlik token'ıdır
- paymentFrameContent: `React.ReactNode` — Ödeme iframe'i içerisinde görüntülenecek veya iframe ile birlikte sunulacak ödeme arayüzü bileşenleridir, ödeme formunun içeriğini oluşturur
- showHelp: `boolean` — Ödeme sırasında kullanıcının erişebileceği yardım panelinin mevcut görünürlük durumunu tutan boolean değeridir, true ise yardım paneli ekranda görünür
- setShowHelp: `(value: boolean) => void` — Yardım panelinin görünürlük durumunu üst component'te güncellemek için kullanılan React state setter fonksiyonudur, buton tıklamaları gibi etkileşimlerle yardım panelini açıp kapatmak için kullanılır
**Dönüş**: `React.FC<PaymentIframeContainerProps>` — Tanımladığı prop tiplerini kabul eden, ödeme iframe'i ve yardım paneli yönetimini üstlenen React fonksiyonel bileşeni döndürür. Bu bileşen, checkout sayfası içerisinde çağrılarak güvenli ödeme akışını başlatır.

---

## INTERFACES

### PaymentIframeContainerProps
- `iyzToken: string`
- `paymentFrameContent: string`
- `showHelp: boolean`
- `setShowHelp: (v: boolean | ((p: boolean) => boolean)) => void`
- `progressPct: number`
- `overlayStep: number`
- `t: (key: string, params?: Record<string, unknown>) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\PaymentIframeContainer.tsx::PaymentIframeContainer
- **params**: (iyzToken, paymentFrameContent, showHelp, setShowHelp, progressPct, overlayStep, t)
- **ic_degiskenler**:
  - `iyzToken` — iyzico ödeme entegrasyonu kimlik doğrulama token'i, iyzipay ödeme formunun `data-token` özniteliğine aktarılır
  - `paymentFrameContent` — iyzToken mevcut değilken kullanılacak ham HTML ödeme çerçevesi içeriği, `dangerouslySetInnerHTML` ile DOM'a enjekte edilir
  - `showHelp` — yardım metinlerinin görünürlüğünü kontrol eden boolean state değeri, değerine göre yardım bloğu render edilir
  - `setShowHelp` — `showHelp` state'ini güncellemek için kullanılan state setter fonksiyonu, yardım butonunun tıklama olayında çağrılarak state değerini tersine çevirir
  - `progressPct` — ödeme süreci ilerleme çubuğunun doluluk oranını temsil eden sayısal değer, ilerleme çubuğunun genişlik stil özelliğine bind edilir
  - `overlayStep` — ödeme sürecinin mevcut adımını belirten sayısal değer (1,2,3), adıma göre uygun çeviri metnini göstermek için kullanılır
  - `t` — uluslararasılaştırma çeviri fonksiyonu, tüm arayüz metinlerinin çevrilmiş halini almak için kullanılır
  - `CreditCard` — lucide-react'ten import edilen kredi kartı ikonu bileşeni, ödeme bölümü başlığında gösterilir
  - `Lock` — lucide-react'ten import edilen kilit ikonu bileşeni, güvenli ödeme başlığında gösterilir
  - `CheckCircle` — lucide-react'ten import edilen onay işareti ikonu bileşeni, ödeme formu hazırlanırken yüklenme ekranında gösterilir
- **Dönüş**: React JSX elementi, ödeme iframe'i ve tüm ilgili arayüz bileşenlerini içeren ana kapsayıcı bileşen

---

## NODE ID STANDARD

  file: src\views\checkout\PaymentIframeContainer.tsx
  function: src\views\checkout\PaymentIframeContainer.tsx::PaymentIframeContainer

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentIframeContainer