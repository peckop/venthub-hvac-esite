---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\CheckoutProgress.tsx
skeleton_hash: d1eb6163a4658ba4
entity_hashes:
  func:CheckoutProgress: 49b0cf86a525644a
  overview: 9c6eb086dfed68a0
  style_tokens: 755270530bcb7865
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun online ödeme (checkout) sürecindeki kullanıcı arayüzünü yöneten temel bir React bileşenidir. Ödeme akışının hangi adımda olduğunu görsel olarak gösterir ve kullanıcının istendiğinde sepetine geri dönmesini sağlayarak sürecin esnekliğini destekler. Modülün temel odak noktası, kullanıcının ödeme sürecindeki konumunu net bir şekilde iletmek ve basit bir geri dönüş mekanizması sunmaktır.

## Fonksiyon Grupları
### Ödeme İlerlemesi Bileşeni
Modülün çekirdek işlevini yerine getiren tek ana React bileşenidir. Ödeme adımının görsel sunumunu, çoklu dil desteği entegrasyonunu ve sepete geri dönme eylemini yönetir.
- CheckoutProgress

---

## AXIOMS – Mimari Varsayımlar

Bu React bileşeni, ödeme sürecinde mevcut adımı göstermek ve sepete geri dönüş işlemini yönetmek için üç bağımsız prop'a bağlıdır.

**[Aksiyom 1]:** Eğer `step` prop'u sağlanmazsa, mevcut ödeme adımının hangisi olduğu belirsizleşir ve ilerleme göstergesi doğru konumu gösteremez.

**[Aksiyom 2]:** Eğer `t` (çeviri fonksiyonu) prop'u sağlanmazsa, bileşen metinleri çeviremez ve kullanıcıya çok dilli içerik sunulamaz.

**[Aksiyom 3]:** Eğer `onBackToCart` callback'i sağlanmazsa, kullanıcının sepete geri dönme isteği tetiklenemez ve bu işlevsellik pasif kalır.

**[Aksiyom 4]:** Eğer `step` geçerli bir değer (örn: adımlardan birini temsil etmeyen null/undefined) ise, bileşen hangi adımın aktif olduğunu bilemez ve tüm adımlar aynı görünüme sahip olabilir.

---

## FONKSİYON DETAYLARI

### CheckoutProgress

**Ne yapar**: CheckoutProgress, e-ticaret checkout sürecinde kullanıcının hangi adımda olduğunu gösteren ilerleme göstergesi (progress stepper) bileşenidir. Kullanıcıya sipariş sürecinin kaç aşamadan oluştuğunu ve şu an hangi aşamada olduğunu görsel olarak sunar.

**Nasıl yapar**: Bileşen, mevcut step parametresine göre hangi adımda olunduğunu kontrol eder ve buna uygun olarak ilerleme çubuğunu/adımlarını render eder. Her adım için tamamlanmış, aktif veya henüz gelmemiş durumları görsel olarak farklı şekilde gösterir. translation fonksiyonu (t) kullanılarak adım isimleri farklı dillere göre dinamik olarak çevrilir. Kullanıcı Sepete Dön butonuna tıkladığında onBackToCart callback fonksiyonu tetiklenerek checkout sürecinden çıkış yapılmasını sağlar.

**Parametreler**:
- `step` — number — Kullanıcının bulunduğu mevcut checkout adımını belirten sayısal değer (örneğin 1 = adres bilgileri, 2 = ödeme, 3 = onay gibi)
- `t` — (key: string) => string —Uluslararasılaştırma (i18n) için kullanılan çeviri fonksiyonu. Parametre olarak alınan key değerine karşılık gelen çevrilmiş metni döndürür
- `onBackToCart` — () => void — Kullanıcı "Sepete Dön" işlemi yapmak istediğinde çağrılan geri çağıurma fonksiyonu. Checkout sürecini iptal edip kullanıcıyı alışveriş sepetine yönlendirir

**Dönüş**: `React.FC<CheckoutProgressProps>` — CheckoutProgressProps arayüzüne uygun özellikler alan ve JSX element döndüren React fonksiyonel bileşeni

---

## INTERFACES

### CheckoutProgressProps
- `step: number`
- `t: (key: string) => string`
- `onBackToCart: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/CheckoutProgress.tsx::CheckoutProgress
- **params**:
  - `step` — mevcut ödeme adımını belirten sayı (1-4 arası), progress bar ve adımstillendirmesi için koşullu sınıflandırmada kullanılır (`step >= n`, `step > n`)
  - `t` — çeviri fonksiyonu, `t('checkout.backToCart')`, `t('checkout.title')`, `t('checkout.steps.step1')`...`step4` çağrısıyla metin çevirisi döndürür
  - `onBackToCart` — sepete dön butonuna tıklandığında çağrılan callback fonksiyonu, `<button onClick={onBackToCart}>` içinde bağlanır
- **ic_degiskenler**:
  (fonksiyon gövdesinde harici değişken bildirimi yoktur — doğrudan JSX return edilir)
- **Alt Fonksiyon (map callback)**: `(n, idx) => (...)`
  - `n` — `[1, 2, 3, 4]` dizisinin mevcut elemanı, adım numarasını temsil eder; koşullu CSS sınıf belirlemede (`step >= n`) ve adım etiketi seçiminde (`n === 1`, `n === 2`, ...) kullanılır
  - `idx` — map dizisinin indeks numarası (0-3); `{idx < 2}` koşuluyla ilk üç adım arasında bağlama çizgisi (`<div>`) render edilip edilmeyeceği kontrol edilir
- **Dönüş**: JSX — `<>` fragment içinde header (geri butonu + başlık), `SecurityRibbon` bileşeni ve 4 adımlık progress bar barındıran React fragment
- **Yan etkileri**: `onBackToCart` çağrısı buton tıklamasıyla tetiklenir; `SecurityRibbon` bileşeni render edilir (güvenlik şeridi görseli)

---

## NODE ID STANDARD

  file: src\views\checkout\CheckoutProgress.tsx
  function: src\views\checkout\CheckoutProgress.tsx::CheckoutProgress

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutProgress

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-light-gray`, `bg-primary-navy`, `border-2`, `border-light-gray`, `hover:text-primary-navy`, `text-3xl`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-white`
- **Layout:** `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-2`, `h-1`, `h-8`, `hidden`, `items-center`, `justify-center`, `min-w-110px`, `sm:flex`, `w-8`
- **Varyant/Responsive:** `:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${step`, `:`, `>`, `>=`, `font-bold`, `font-medium`, `font-semibold`, `mb-4`, `mb-8`, `mt-1`, `n`, `rounded-full`, `space-x-2`, `transition-colors`