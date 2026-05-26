---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\SecurityRibbon.tsx
skeleton_hash: 280aae49acbb2909
generated_at: 2026-05-23T22:27:17Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunda kullanılmak üzere geliştirilmiş React tabanlı bir kullanıcı arayüzü bileşeni barındırır. Platformun güvenilirliğini ve ödeme güvenliğini vurgulamak için tasarlanan güvenlik şeridi/banner bileşeni, farklı kullanım senaryolarına göre özelleştirilebilir şekilde çalışır.

## Fonksiyon Grupları
### Ana Güvenlik Şeridi Bileşeni
Modülün temel sorumluluğunu üstlenen bu bileşen, marka ismi, ödeme sağlayıcısı ismi ve görünüm varyantı gibi parametreler alarak ihtiyaca uygun güvenlik bannerı oluşturur.
- SecurityRibbon

---

## AXIOMS – Mimari Varsayımlar
React tabanlı SecurityRibbon UI bileşeni, marka ve ödeme sağlayıcısı bilgilerini kullanıcıya göstermek üzere tasarlanmış güvenlik bandı bileşenidir, doğru çalışması için React çalışma zamanının mevcutluğu ve kendisine iletilen prop'ların belirlenen tiplere uygun olması zorunludur.

[Aksiyom 1]: Eğer SecurityRibbon bileşeni bir React çalışma zamanı içinde çalıştırılmazsa, bileşen hiçbir şekilde render edilemez, kullanıcıya hiçbir içerik gösterilemez.
[Aksiyom 2]: Eğer brandName prop'u geçerli string tipinde bir değer olarak iletilmezse, varsayılan değerin devreye girememesi durumunda bantta boş veya tanımsız marka ismi gösterilir, marka kimliği tutarsızlığı oluşur.
[Aksiyom 3]: Eğer providerName prop'u geçerli string tipinde bir değer olarak iletilmezse, varsayılan değerin kullanılamaması halinde bantta yanlış veya görünmeyen ödeme sağlayıcısı bilgisi gösterilir, kullanıcının platforma olan güvenini olumsuz etkiler.
[Aksiyom 4]: Eğer variant prop'u geçerli görünüm tipinde bir string olarak iletilmezse, bant stil bozukluklarıyla veya yanlış düzenle render edilir, bulunduğu sayfanın arayüz bütünlüğünü bozar.

---

## FONKSIYON DETAYLARI

### SecurityRibbon
**Ne yapar**: Venthub HVAC platformu için kullanıcı güvenini artırmak amacıyla güvenlik bilgilerini ekranlarda bir şerit olarak sunan React fonksiyonel bileşenidir. Genellikle ödeme gibi hassas süreçlerde kullanıcının karşısına çıkarak güvenilir marka ve hizmet sağlayıcı bilgilerini iletmek için tasarlanmıştır, eksik kalan prop değerleri için ön tanımlı varsayılanlar sunarak herhangi bir çalışma hatası oluşmadan kullanılır.
**Nasıl yapar**: React'in modern fonksiyonel bileşen yapısı kullanılarak geliştirilen bileşen, kendisine iletilen tüm prop'ları destruct ederek kullanır. Eğer herhangi bir prop harici olarak değer gönderilmeden çağrılırsa tanımlı varsayılan değerleri devreye alır, gelen varyant prop'una göre farklı görsel tasarımlar oluşturarak güvenlik şeridini ihtiyaç duyulan şekilde ekrana yansıtır. Tüm güvenlik şeridi ile ilgili metinsel ve görsel mantığı tek bir bileşende toplayarak proje genelinde yeniden kullanılabilirliği ve bakım kolaylığını artırır.
**Parametreler**:
- brandName: string — Güvenlik şeritinde gösterilecek ana platform markasının ismidir, eğer harici olarak özel bir değer gönderilmezse varsayılan olarak 'Venthub HVAC' değeri kullanılır.
- providerName: string — Güvenlik hizmetini sunan üçüncü taraf sağlayıcının (genellikle ödeme sağlayıcısı) ismidir, varsayılan değeri 'iyzico'dur, ihtiyaç duyulması halinde farklı sağlayıcı isimleriyle kolayca özelleştirilebilir.
- variant: string — Güvenlik şeridinin görsel görünümünü belirleyen, hangi banner tasarımıyla ekrana yansıtılacağını ayarlayan parametredir, farklı kullanım senaryoları için farklı tasarım seçenekleri sunulmasını sağlar.
**Dönüş**: React.FC<SecurityRibbonProps> tipinde, işlenmeye hazır React bileşeni döndürür. Bu döndürülen element, uygulamadaki herhangi bir bileşen içinde import edilip kullanılabilir, kendisine iletilen tüm prop ve varsayılan değerlere göre dinamik olarak içeriğini ve görünümünü oluşturan güvenlik şeridi olarak çalışır.

---

## INTERFACES

### SecurityRibbonProps
- `brandName?: string`
- `providerName?: string`
- `variant?: 'banner' | 'card'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SecurityRibbon.tsx::SecurityRibbon
- **params**: brandName (varsayılan değer: 'Venthub HVAC'), providerName (varsayılan değer: 'iyzico'), variant (varsayılan değer: 'banner')
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, ödeme sayfasındaki güvenlik metinlerini yerelleştirmek için kullanılır
  - `base` — ana kapsayıcı div'in Tailwind CSS sınıflarını birleştiren string, gelen variant parametresine göre dolgu (padding) değerlerini ayarlar
  - `badge` — tüm güvenlik rozetlerinin ortak Tailwind CSS sınıflarını tutan string, PCI DSS, 3D Secure, 256-bit SSL rozetleri için ortak stil sağlar
- **Dönüş**: React JSX elementi, güvenli ödeme bilgisini gösteren UI şeriti döndürür

---

## NODE ID STANDARD

  file: src\components\SecurityRibbon.tsx
  function: src\components\SecurityRibbon.tsx::SecurityRibbon

---

## DISA AKTARILANLAR (EXPORTS)
  export: SecurityRibbon

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy/10`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xs`
- **Layout:** `flex`, `flex-wrap`, `gap-2`, `gap-3`, `h-9`, `items-center`, `justify-between`, `justify-center`, `w-9`
- **Responsive:** (yok)
