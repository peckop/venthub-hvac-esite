---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\CheckoutProgress.tsx
skeleton_hash: 84dfed65cdf896e6
generated_at: 2026-05-23T22:40:23Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme (checkout) sürecinde kullanılan bu modül, kullanıcıların ödeme akışındaki mevcut konumunu anlamasına yardımcı olan temel bir kullanıcı arayüzü bileşeni barındırır. Ödeme adımlarını gösteren ilerleme göstergesi olarak çalışır, kullanıcının istediği takdirde tekrar alışveriş sepetine dönmesini sağlayan işlevselliği de destekler.

## Fonksiyon Grupları
### Ana Ödeme İlerlemesi Bileşeni
Modüldeki tek ana React bileşeni olarak ödeme sürecinin mevcut adımını kullanıcıya iletmek, çok dilli içerik desteği sunmak ve sepete geri dönüş işlemini tetiklemekle sorumludur.
- CheckoutProgress

---

## AXIOMS – Mimari Varsayımlar
Bu React bileşeni, sipariş ödeme (checkout) sürecinin adım ilerlemesini kullanıcıya göstermek ve sepete geri dönme işlemini yönetmek için aldığı tüm zorunlu prop'ların geçerli ve eksiksiz iletilmesini zorunlu kılar. Aksi takdirde bileşen beklenen işlevselliği yerine getiremez.

[Aksiyom 1]: Eğer bileşene iletilmesi gereken `step` prop'u yoksa, hangi ödeme adımında olunulduğu belirlenemez, kullanıcıya sürecin mevcut konumu doğru gösterilemez.
[Aksiyom 2]: Eğer arayüz metinlerini çevirmek için kullanılan `t` prop'u yoksa, bileşen üzerindeki tüm metinler çevrilemez, kullanıcı arayüzü işlevsiz ve okunamaz hale gelir.
[Aksiyom 3]: Eğer sepete geri dönme işlemini tetikleyen `onBackToCart` geri çağırım fonksiyonu yoksa, bileşen içindeki sepete dönme butonu çalışmaz, kullanıcının ödeme sürecinden ayrılıp sepetine dönmesi engellenir.

---

## FONKSIYON DETAYLARI

### CheckoutProgress
**Ne yapar**: VentHub HVAC platformunun ödeme (checkout) sürecinde kullanıcının mevcut adımını görselleştiren, akış takibini sağlayan bir React kullanıcı arayüzü bileşenidir. Kullanıcının ödeme sürecinde nerede olduğunu kolayca anlamasını sağlarken, tek tıkla sepet sayfasına geri dönmesine imkan tanır. Sadece Checkout sayfasının üst bölümünde kullanılarak tüm ödeme akışı boyunca sabit kalan bir ilerleme göstergesi sunar.
**Nasıl yapar**: Bileşen, kendisine iletilen step prop'u ile mevcut aktif adımı tespit eder, tamamlanmış ve bekleyen adımları kullanıcı arayüzünde görsel olarak ayırt eder. Uluslararasılaştırma (i18n) sistemiyle entegre çalışarak tüm arayüz metinlerini çeviri fonksiyonu ile yerelleştirir, kullanıcının sepete dönme isteğini tetikleyen butona tıklandığında üst bileşenden alınan onBackToCart geri çağrı fonksiyonunu çalıştırır. Aldığı prop'lardaki değişimlere göre dinamik olarak güncellenen bir ilerleme gösterimi sunar.
**Parametreler**:
- name: step, type: CheckoutProgressProps içinde tanımlı adım türü (genellikle sayı veya özel enum) — Kullanıcının ödeme sürecinde şu anda bulunduğu aktif adımı temsil eder, bileşenin hangi adımı vurgulayacağını ve göstereceğini doğrudan belirler.
- name: t, type: (çeviri anahtarı: string) => string — i18n altyapısı tarafından sağlanan, arayüzdeki tüm metinleri kullanıcının dil ayarına göre çeviren fonksiyondur. Adım başlıkları, buton metinleri gibi tüm kullanıcıya görünen içeriklerin yerelleştirilmesini sağlar.
- name: onBackToCart, type: () => void — Kullanıcının "sepete geri dön" butonuna tıklaması durumunda tetiklenen, üst bileşen tarafından iletilen geri çağrı fonksiyonudur. Kullanıcının sepet sayfasına yönlendirilmesi veya ilgili durumun üst bileşende yönetilmesini sağlar.
**Dönüş**: React.FC<CheckoutProgressProps> türünde, kullanıcının ödeme sürecindeki konumunu gösteren etkileşimli kullanıcı arayüzü elementi döndürür. Bu bileşen, aldığı prop'lardaki değişimlere göre anlık olarak güncellenir ve tüm modern web standartlarına uygun olarak render edilir.

---

## INTERFACES

### CheckoutProgressProps
- `step: number`
- `t: (key: string) => string`
- `onBackToCart: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\CheckoutProgress.tsx::CheckoutProgress
- **params**: step, t, onBackToCart
- **ic_degiskenler**:
  - `ArrowLeft` — lucide-react'ten importlanan sol ok ikonu, sepete dönme butonunda gösterilir
  - `SecurityRibbon` — Proje içinden importlanan güvenlik bileşeni, ödeme sayfasında güvenlik bilgisini görüntüler
  - `[1,2,3,4]` — Ödeme adımı numaralarını içeren sabit dizi, adım arayüzlerini oluşturmak için yinelenir
- **Dönüş**: React.ReactNode, tüm ödeme süreci arayüzünü sarmalayan boş React fragmenti içindeki JSX ağacı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\CheckoutProgress.tsx::[1,2,3,4].map callback
- **params**: n, idx
- **ic_degiskenler**:
  - `step` — Closure üzerinden erişilen ana bileşenden gelen mevcut ödeme adımı, adım ve çubukların aktif/pasif renklerini belirler
  - `t` — Closure üzerinden erişilen çeviri fonksiyonu, her adımın dil uyumlu metinini almak için kullanılır
  - `React.Fragment` — Tek adım ve aradaki çubuğu sarmalamak için kullanılan React boş fragmenti
- **Dönüş**: React.ReactNode, tek ödeme adımı ve gerektiğinde aradaki ilerleme çubuğunu içeren JSX elemanı

---

## NODE ID STANDARD

  file: src\views\checkout\CheckoutProgress.tsx
  function: src\views\checkout\CheckoutProgress.tsx::CheckoutProgress

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutProgress