---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\en\PrivacyPolicyContent.tsx
skeleton_hash: 2752987676be08fc
entity_hashes:
  func:PrivacyPolicyContentEn: 0b9028540cd295ad
  overview: 18acb08d3e5f1974
  style_tokens: c2df28d44e819ffd
generated_at: 2026-08-27T07:38:23Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasının İngilizce gizlilik politikası sayfasının içeriğini sunan bir React bileşenidir. Tek bileşenli bir yapıya sahip olup, yasal metinleri dil parametresine göre render etmek için kullanılır. Modül, uygulamanın gizlilik ve uyumluluk gereksinimlerini karşılamak üzere statik bir içerik sağlayıcısı olarak işlev görür.

## Fonksiyon Grupları

### Gizlilik Politikası İçerik Bileşeni

Bu grup, gizlilik politikasının İngilizce dilindeki yapısını ve metinlerini oluşturarak kullanıcıya sunan temel bileşeni içerir. Bileşen, dil parametresini alarak içeriği dinamik olarak biçimlendirebilir, ancak asıl işlevi yasal metinlerin tutarlı bir şekilde görüntülenmesini sağlamaktır.

- PrivacyPolicyContentEn

## Bağımlılıklar ve Mimari Notlar

- **İç bağımlılıklar**: Kaynakta başka bir iç modüle çağrı bilgisi yer almamaktadır.
- **Dış bağımlılıklar**: React kütüphanesine bağlıdır; bileşen `React.FC` tipi ile tanımlanmıştır.
- **Dinamik/lazy yükleme**: Kaynakta bu yönde bir bilgi bulunmamaktadır.
- **Mimari önem**: Uygulamanın yasal uyumluluk katmanında yer alır; gizlilik politikasının İngilizce sürümünü sunan tek sorumlu bileşendir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzası (`PrivacyPolicyContentEn({ lang })`) mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir.

---

## FONKSİYON DETAYLARI

### PrivacyPolicyContentEn

**Ne yapar**: PrivacyPolicyContentEn, gizlilik politikası içeriğini İngilizce dilinde render eden bir React fonksiyonel bileşenidir. Bu bileşen, dil parametresini alarak ilgili içeriği görüntüler.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak tanımlanmıştır. `React.FC` generic tipi ile `lang` parametresinin string olduğu belirtilmiştir. Bileşen, prop olarak alınan `lang` değerine göre İngilizce gizlilik politikası içeriğini render eder.

**Parametreler**:
- `lang`: `string` — Bileşenin hangi dilde içerik göstereceğini belirten dil kodu parametresi

**Dönüş**: `React.FC<{ lang: string }>` — `lang` string parametresi alan bir React fonksiyonel bileşeni döner. Bu bileşen, gizlilik politikası içeriğini İngilizce olarak render eder.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfigEn
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/PrivacyPolicyContent.tsx::PrivacyPolicyContentEn
- **params**: `lang` — dil kodu (string), URL'lerin yerelleştirilmesinde kullanılır
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` dosyasından `legalConfigEn` olarak import edilen yapılandırma nesnesi; satıcı bilgileri, saklama süreleri, web sitesi URL'si gibi yasal metin sabitlerini içerir
  - `legalConfig.sellerTitle` — veri sorumlusunun unvanı
  - `legalConfig.sellerAddress` — veri sorumlusunun adresi
  - `legalConfig.sellerPhone` — veri sorumlusunun telefon numarası
  - `legalConfig.sellerEmail` — veri sorumlusunun e-posta adresi
  - `legalConfig.websiteUrl` — web sitesi URL'si
  - `legalConfig.cargoCompanies` — kargo/kurye firmalarının adları
  - `legalConfig.retentionOrders` — sipariş ve fatura verilerinin saklama süresi
  - `legalConfig.retentionSupport` — destek yazışmalarının saklama süresi
  - `legalConfig.retentionMarketing` — pazarlama izin/verilerinin saklama süresi
  - `legalConfig.retentionLogs` — log ve güvenlik kayıtlarının saklama süresi
  - `legalConfig.applicationEmail` — KVKK hakları başvuru e-posta adresi
  - `legalConfig.lastUpdated` — politikanın son güncelleme tarihi
  - `localizedHref` — `@/utils/routes` dosyasından import edilen fonksiyon; verilen rota ve dil parametresiyle yerelleştirilmiş URL üretir
  - `Routes` — `@/utils/routes` dosyasından import edilen rota tanımları nesnesi
  - `Routes.legal.kvkk()` — KVKK Aydınlatma Metni sayfasının rotasını döndüren fonksiyon çağrısı
  - `Routes.legal.cerez()` — Çerez Politikası sayfasının rotasını döndüren fonksiyon çağrısı
  - `Link` — `next/link` paketinden import edilen React bileşeni; istemci tarafı navigasyonu sağlar
  - `lang` (parametre) — `localizedHref` çağrılarında ikinci argüman olarak kullanılarak URL'lerin dile göre şekillendirilmesini sağlar
- **Dönüş**: `React.ReactNode` — Gizlilik Politikası içeriğini İngilizce olarak sunan JSX fragment'ı; 11 adet `<section>` bloğundan oluşur (veri sorumlusu, toplanan veriler, işleme amaçları, paylaşım, uluslararası aktarımlar, çerezler, saklama süreleri, veri güvenliği, çocukların verileri, haklar, güncellemeler)

---

## NODE ID STANDARD

  file: src\views\legal\components\en\PrivacyPolicyContent.tsx
  function: src\views\legal\components\en\PrivacyPolicyContent.tsx::PrivacyPolicyContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: PrivacyPolicyContentEn

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`, `underline`