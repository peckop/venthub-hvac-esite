---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\SecurePaymentOverlay.tsx
skeleton_hash: 6b77d0737b6e26dc
generated_at: 2026-05-23T22:40:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme adımında kullanılan güvenli ödeme kaplama (overlay) React bileşenini barındırır. Ödeme işlemi süresince kullanıcılara sunulan geçici ekranın görünürlüğünü, işlem adımlarını ve ilerleme yüzdesini yönetir. Ödeme akışının kullanıcıya şeffaf bir şekilde aktarılmasını sağlayarak güvenli ödeme deneyimini destekler.

## Fonksiyon Grupları
### Ana Ödeme Kaplama Bileşeni
Modülün tüm sorumluluğunu üstlenen ana React bileşenidir, aldığı girdilere göre ödeme kaplamasının tüm temel durumlarını ve görünümünü yönetir.
- SecurePaymentOverlay

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı güvenli ödeme kaplama bileşeni, aldığı tüm giriş prop'larının üst bileşen tarafından geçerli formatta ve doğru değerlerle iletilmesi şartıyla çalışır, aksi takdirde ödeme arayüzü kullanıcıya doğru şekilde sunulamaz.

[Aksiyom 1]: Eğer overlayVisible boolean türünde geçerli bir görünürlük durumu değeri olarak iletilmezse, ödeme kaplaması gerektiğinde gösterilemez veya gizlenemez, kullanıcı arayüzünde kalıcı olarak açık kalma veya hiç açılmama gibi beklenmedik hatalar oluşur.
[Aksiyom 2]: Eğer overlayStep ödeme sürecinin mevcut adımını temsil eden geçerli bir değer olarak iletilmezse, kullanıcıya ödeme sürecinde hangi aşamada olduğu bildirilemez, kullanıcı süreci takip edemez.
[Aksiyom 3]: Eğer overlayPercent ödeme sürecinin tamamlanma oranını temsil eden sayısal bir değer olarak iletilmezse, arayüzdeki ilerleme göstergesi çalışmaz, kullanıcıya sürecin ilerlemesi yanlış aktarılır.
[Aksiyom 4]: Eğer uluslararasılaştırma (çeviri) fonksiyonu t geçerli olarak iletilmezse, kaplama arayüzündeki tüm metin içerikleri doğru şekilde gösterilemez, çok dilli kullanım imkanı ortadan kalkar.

---

## FONKSIYON DETAYLARI

### SecurePaymentOverlay
**Ne yapar**: VentHub HVAC sisteminin ödeme onayı (checkout) sürecinde güvenli ödeme akışını kullanıcıya sunan React bileşenidir. Ödeme sürecinin ilerleyişini gösteren geçici bir ekran örtüsü olarak çalışır, kullanıcının ödeme adımlarını takip etmesini ve sürecin durumunu görmesini sağlar.
**Nasıl yapar**: Kendisine iletilen prop değerlerini kullanarak arayüzünü dinamik olarak günceller. Görünürlük durumu, aktif adım ve tamamlanma yüzdesi bilgilerini işleyerek kullanıcıya doğru arayüzü sunar, ayrıca çeviri fonksiyonu ile metinleri kullanıcının dil tercihine uygun şekilde görüntüler.
**Parametreler**:
- overlayVisible: boolean — Güvenli ödeme örtüsünün ekranda görünür olup olmayacağını belirten boolean değer, true değeri aldığında bileşen aktif olarak ekrana gelir
- overlayStep: string | number — Ödeme sürecinin şu anki aktif adımını tanımlayan değer, adımın sıra numarası veya metinsel açıklaması olabilir
- overlayPercent: number — Ödeme sürecinin toplam tamamlanma oranını yüzde olarak ifade eden sayısal değer, genellikle 0 ile 100 arasında değer alır ve arayüzdeki ilerleme çubuğunda kullanılır
- t: Function — Uluslararasılaştırma (i18n) entegrasyonu için kullanılan çeviri fonksiyonu, bileşen içindeki tüm kullanıcıya yönelik metinleri ilgili dile çevirerek gösterir
**Dönüş**: React.FC<SecurePaymentOverlayProps> — Tanımlanmış prop tiplerine uygun bir React fonksiyonel bileşeni olarak, güvenli ödeme sürecini gösteren arayüz elementini DOM'a eklemek için gerekli React çıktısını döndürür.

---

## INTERFACES

### SecurePaymentOverlayProps
- `overlayVisible: boolean`
- `overlayStep: number`
- `overlayPercent: number`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\SecurePaymentOverlay.tsx::SecurePaymentOverlay
- **params**: [overlayVisible, overlayStep, overlayPercent, t]
- **ic_degiskenler**: 
  - `overlayVisible` — Ödeme katmanının görünürlüğünü kontrol eden boolean değer; false olması halinde fonksiyon doğrudan null döndürerek katmanı render etmez
  - `overlayStep` — Ödeme sürecindeki mevcut adımı belirten tamsayı değer; adım durum metni ve ilerleme adımlarının vurgulanması için kullanılır
  - `overlayPercent` -- Ödeme sürecindeki toplam ilerleme yüzdesini tutan sayısal değer; ilerleme çubuğunun genişliğini dinamik olarak ayarlamak için kullanılır
  - `t` — Çeviri fonksiyonu; arayüzdeki tüm metinleri ilgili dile çevirmek için kullanılır, 10 farklı arayüz metni anahtarıyla çağrılır
  - `Lock` — lucide-react kütüphanesinden import edilen ikon bileşeni; güvenlik göstergesi olarak katman başlığında render edilir
- **Dönüş**: overlayVisible false ise null, aksi halde güvenli ödeme katmanı içeren React JSX elementi

---

## NODE ID STANDARD

  file: src\views\checkout\SecurePaymentOverlay.tsx
  function: src\views\checkout\SecurePaymentOverlay.tsx::SecurePaymentOverlay

---

## DISA AKTARILANLAR (EXPORTS)
  export: SecurePaymentOverlay