---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\en\PreInformationContent.tsx
skeleton_hash: 027cc9e937e701aa
entity_hashes:
  func:PreInformationContentEn: 6f74928625bb225d
  overview: 6e28e54b80fc7693
  style_tokens: 4878090f8d777cca
generated_at: 2026-08-27T07:37:54Z
---

## Genel Bakış

Bu modül, VentHub platformunun yasal ön bilgilendirme sayfası için İngilizce içerik sunan sunumsal bir React bileşenidir. Statik JSX içeriği döndürür; durum yönetimi, API çağrısı veya koşullu mantık içermez. "en" klasöründe konumlanması, modülün çok dilli yapıda olduğunu ve her dil için ayrı bileşenler bulunduğunu gösterir.

## Fonksiyon Grupları

### Yasal İçerik Bileşeni
PreInformation sayfasının İngilizce versiyonunu render eden üst düzey React bileşeni. `lang` prop'u alır; ancak bileşen gövdesinde yalnızca İngilizce statik içerik döndürür.
- PreInformationContentEn

## Bağımlılıklar ve Mimari Notlar

**İç bağımlılıklar:** Bilinmiyor — verilen kaynakta başka modüllere yönelik import bilgisi yer almıyor.

**Dış bağımlılıklar:** React kütüphanesi (bileşen yapısı gereği). Ayrıca bileşenin düzgün biçimlendirilmiş görünmesi için ilgili CSS modül dosyasının (`PreInformationContent.module.css` veya karşılıklı import edilen stil dosyası) mevcut olması gerekir; aksi halde içerik okunaksız görünür.

**Dinamik/lazy yükleme:** Bilinmiyor — verilen kaynakta bu yönde bir bilgi yer almıyor.

**Mimari önem:** Bu bileşen, düzenleyici uyumluluk açısından kritik bir role sahiptir. İlan yayınlama akışı gibi zorunlu yasal ön bilgilendirme gerektiren sayfalarda çağrılmaması durumunda kullanıcıya yasal metin ulaşmaz ve uyumluluk riski doğar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarım yapılabilir. Gövdedeki mantıksal bağımlılıklar bilinmediği için kapsamlı aksiyom üretilemez.

[Aksiyom 1]: Eğer `lang` parametresi yoksa, bileşen hangi dili kullanacağını belirleyemez — ancak parametre kullanımının gövdede nasıl işlendiği bilinmiyor.

[Aksiyom 2]: Eğer döndürülen değer geçerli bir React bileşeni değilse, render süreci başarısız olur — ancak bu bileşenin hangi alt bileşenleri veya içeriği kullandığı bilinmiyor.

---

## FONKSİYON DETAYLARI

### PreInformationContentEn

**Ne yapar**: İngilizce dilinde ön bilgilendirme içeriğini görüntüleyen bir React bileşenidir. `legal` (yasal) görünüm katmanı altında yer alan bu bileşen, yasal ön bilgilendirme metninin İngilizce versiyonunu kullanıcıya sunar.

**Nasıl yapar**: Bileşen, aldığı `lang` parametresini kullanarak dil bazlı içerik gösterimi gerçekleştirir. Fonksiyon adındaki `En` soneki, bu bileşenin İngilizce içeriğe özel olduğunu gösterir. Bileşen, `React.FC<{ lang: string }>` tipinde bir fonksiyonel bileşen döndürür. Kaynak dosya yapısına göre `views/legal/components/en/` dizininde konumlanmıştır; bu da bileşenin yasal metinlerin İngilizce alt kategorisinde yer aldığını gösterir.

**Parametreler**:
- lang: string — Bileşenin çalışacağı dili belirten parametre. Bileşen bu değeri alarak dil uygunluğunu sağlar.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` parametresi alan bir React fonksiyonel bileşeni döndürür. Döndürülen bileşen, dışarıdan çağrıldığında kendi `lang` prop'unu bekler.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfigEn
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/PreInformationContent.tsx::PreInformationContentEn
- **params**:
  - `lang` — dil kodu; `localizedHref` fonksiyonuna iletilerek Link bileşenlerinin href'lerinin yerelleştirilmesinde kullanılır
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` dosyasından import edilen `legalConfigEn` nesnesi; satıcı bilgileri, kargo, garanti, iade gibi yasal metin verilerini taşır. Aşağıdaki alanlara erişilir:
    - `legalConfig.sellerTitle` — satıcı ticari unvanı
    - `legalConfig.sellerAddress` — satıcı adresi
    - `legalConfig.sellerPhone` — satıcı telefon numarası
    - `legalConfig.sellerEmail` — satıcı e-posta adresi
    - `legalConfig.kepAddress` — kayıtlı elektronik posta (KEP) adresi
    - `legalConfig.mersis` — MERSIS numarası
    - `legalConfig.tradeRegistryNo` — ticaret sicil numarası
    - `legalConfig.chamberOfCommerce` — ticaret odası bilgisi
    - `legalConfig.taxOffice` — vergi dairesi adı
    - `legalConfig.taxNumber` — vergi numarası
    - `legalConfig.etbisNo` — ETBIS kayıt numarası
    - `legalConfig.websiteUrl` — web sitesi URL'si
    - `legalConfig.shippingFee` — kargo/teslimat ücreti
    - `legalConfig.deliveryTime` — tahmini kargoya verilme süresi
    - `legalConfig.cargoCompanies` — anlaşmalı kargo firması
    - `legalConfig.returnAddress` — iade gönderim adresi
    - `legalConfig.returnShippingBearer` — iade kargo masrafını üstlenen taraf
    - `legalConfig.refundTime` — iade ödeme süresi
    - `legalConfig.warrantyPeriod` — garanti süresi
    - `legalConfig.usefulLife` — mevzuata göre faydalı ömür
    - `legalConfig.afterSalesService` — yetkili servis / satış sonrası iletişim
    - `legalConfig.lastUpdated` — formun son güncelleme tarihi
  - `localizedHref` — `@/utils/routes` dosyasından import edilen fonksiyon; Routes nesnesinden alınan yolu ve `lang` parametresini alarak yerelleştirilmiş href üretir
  - `Routes` — `@/utils/routes` dosyasından import edilen rota tanımları nesnesi; şu metotlara erişilir:
    - `Routes.legal.kvkk()` — KVKK Aydınlatma Metni sayfasının yolunu döndürür
    - `Routes.legal.gizlilik()` — Gizlilik Politikası sayfasının yolunu döndürür
  - `Link` — `next/link` paketinden import edilen bileşen; KVKK ve gizlilik sayfalarına yönlendirme bağlantıları oluşturmak için kullanılır
- **Dönüş**: `React.FC` — Fragment (`<>...</>`) içinde 15 adet `<section>` elementi döndüren JSX ağacı; İngilizce Ön Bilgi Formu'nun tüm bölümlerini (satıcı bilgisi, şikayet, malın özellikleri, fiyat, ödeme, teslimat, cayma hakkı, iade masrafları, cayma istisnaları, cayma formu, garanti, uyuşmazlık çözümü, sözleşme saklama, kişisel veriler, yürürlük tarihi) içerir

---

## NODE ID STANDARD

  file: src\views\legal\components\en\PreInformationContent.tsx
  function: src\views\legal\components\en\PreInformationContent.tsx::PreInformationContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationContentEn

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `border-light-gray`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`
- **Layout:** `p-4`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `list-disc`, `mb-2`, `mb-3`, `mt-2`, `pl-6`, `rounded-lg`, `space-y-1`, `underline`