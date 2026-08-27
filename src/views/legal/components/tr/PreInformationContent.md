---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\tr\PreInformationContent.tsx
skeleton_hash: dbac69402f63e40d
entity_hashes:
  func:PreInformationContentTr: 63b467db8ee319d4
  overview: 6c8ef3c64c9a5692
  style_tokens: 4878090f8d777cca
generated_at: 2026-08-27T07:40:30Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasının yasal bilgilendirme bölümünde Türkçe olarak görüntülenen ön bilgilendirme içeriğini sunan bir React bileşenini içerir. Modül, dil destekli bir yapıya sahip olup farklı dil varyantları için ayrı bileşenler olarak tasarlanmıştır. Tek bir fonksiyonel bileşen içerir ve yasal sayfalarda kullanılmak üzere tasarlanmıştır.

## Fonksiyon Grupları

### Dil Destekli İçerik Sunumu
Bu grup, belirli bir dildeki yasal ön bilgilendirme içeriğini render eden bileşeni içerir. Bileşen, dil parametresi alarak içeriğin uygun dilde görüntülenmesini sağlar.
- PreInformationContentTr

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### PreInformationContentTr

**Ne yapar**: Bu fonksiyon, Türkçe ön bilgi içeriği bileşenini oluşturan bir React fonksiyon bileşeni (functional component) tanımlar. Dosya konumundan (`views/legal/components/tr/`) anlaşılacağı üzere, yasal sayfalara ait Türkçe ön bilgi metinlerini görüntülemek için kullanılır.

**Nasıl yapar**: Fonksiyon, `lang` parametresini destructuring yöntemiyle alır ve bir React fonksiyon bileşeni (`React.FC`) döndürür. Docstring boş bırakılmıştır; bu nedenle iç mantık hakkında kaynakta bilgi bulunmamaktadır.

**Parametreler**:
- `lang`: `{ lang: string }` — Bileşenin hangi dilde içerik göstereceğini belirten dil kodu parametresi. Obje yapısından çıkarılarak alınır.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` prop'u alan bir React fonksiyon bileşeni döndürür. Döndürülen bileşen, kendisi de `lang` parametresi alacak şekilde yapılandırılmıştır.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/PreInformationContent.tsx::PreInformationContentTr
- **params**: `lang` — bileşen prop'u olarak gelen dil kodu (ör. "tr"), `localizedHref` çağrılarında kullanılır
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` modülünden import edilen yapılandırma nesnesi; satıcı bilgileri, kargo, iade, garanti gibi tüm yasal metin verilerini taşır
  - `legalConfig.sellerTitle` — satıcı ünvanı (§1, §10 bölümlerinde kullanılır)
  - `legalConfig.sellerAddress` — satıcı adresi (§1, §10 bölümlerinde kullanılır)
  - `legalConfig.sellerPhone` — satıcı telefon numarası (§1, §2 bölümlerinde kullanılır)
  - `legalConfig.sellerEmail` — satıcı e-posta adresi (§1, §2, §7, §10, §13 bölümlerinde kullanılır)
  - `legalConfig.kepAddress` — KEP adresi (§1, §2 bölümlerinde kullanılır)
  - `legalConfig.mersis` — MERSİS numarası (§1 bölümünde kullanılır)
  - `legalConfig.tradeRegistryNo` — ticaret sicil numarası (§1 bölümünde kullanılır)
  - `legalConfig.chamberOfCommerce` — kayıtlı olunan ticaret odası (§1 bölümünde kullanılır)
  - `legalConfig.taxOffice` — vergi dairesi adı (§1 bölümünde kullanılır)
  - `legalConfig.taxNumber` — vergi numarası (§1 bölümünde kullanılır)
  - `legalConfig.etbisNo` — ETBİS kayıt numarası (§1 bölümünde kullanılır)
  - `legalConfig.websiteUrl` — site URL'si, "www." ön ekiyle birlikte gösterilir (§1 bölümünde kullanılır)
  - `legalConfig.shippingFee` — kargo/teslimat ücreti bilgisi (§4 bölümünde kullanılır)
  - `legalConfig.deliveryTime` — öngörülen teslim/kargoya veriliş süresi (§6 bölümünde kullanılır)
  - `legalConfig.cargoCompanies` — taşıyıcı firma bilgisi (§6, §8 bölümlerinde kullanılır)
  - `legalConfig.returnAddress` — iade gönderim adresi (§7 bölümünde kullanılır)
  - `legalConfig.returnShippingBearer` — iade kargo masrafını kimin karşıladığı bilgisi (§8 bölümünde kullanılır)
  - `legalConfig.refundTime` — bedel iade süresi (§8 bölümünde kullanılır)
  - `legalConfig.warrantyPeriod` — garanti süresi (§11 bölümünde kullanılır)
  - `legalConfig.usefulLife` — Bakanlıkça belirlenen kullanım ömrü (§11 bölümünde kullanılır)
  - `legalConfig.afterSalesService` — yetkili servis / satış sonrası hizmet bilgisi (§11 bölümünde kullanılır)
  - `legalConfig.lastUpdated` — formun son güncelleme tarihi (§15 bölümünde kullanılır)
  - `localizedHref` — `@/utils/routes` modülünden import edilen fonksiyon; verilen route ve dil kodundan lokalize edilmiş href üretir
  - `Routes` — `@/utils/routes` modülünden import edilen route tanımları nesnesi
  - `Routes.legal.kvkk()` — KVKK aydınlatma metni sayfasının route fonksiyonu; `localizedHref` ile `lang` parametresi kullanılarak href üretilir
  - `Routes.legal.gizlilik()` — gizlilik politikası sayfasının route fonksiyonu; `localizedHref` ile `lang` parametresi kullanılarak href üretilir
  - `Link` — `next/link` modülünden import edilen bileşen; §14 bölümünde KVKK ve gizlilik politikası bağlantıları için kullanılır
- **Dönüş**: `React.ReactNode` — 15 bölümden oluşan Ön Bilgilendirme Formu'nun Türkçe içeriğini JSX olarak döndürür (satıcı bilgileri, iletişim, ürün nitelikleri, bedel, ödeme, teslimat, cayma hakkı, iade, garanti, uyuşmazlık çözümü, sözleşme saklama, kişisel veriler, yürürlük)

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\PreInformationContent.tsx
  function: src\views\legal\components\tr\PreInformationContent.tsx::PreInformationContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationContentTr

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