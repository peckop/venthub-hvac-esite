---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\tr\KvkkContent.tsx
skeleton_hash: e6afac47ecfdd02a
entity_hashes:
  func:KvkkContentTr: ce8aa32329dc415e
  overview: 9ac8e2b6eeaddd22
  style_tokens: 93d28fc913e27f7d
generated_at: 2026-08-27T07:39:45Z
---

## Genel Bakış
Bu modül, Türkçe KVKK (Kişisel Verilerin Korunması Kanunu) metnini kullanıcı arayüzünde görüntülemek için kullanılan bir React bileşeni içerir. Modül, yasal içerik sunumunu tek bir bileşen üzerinden gerçekleştirir ve dil parametresi alarak çalışır.

## Fonksiyon Grupları
### Ana Bileşen
KVKK yasal metnini render eden ve dil parametresine göre içerik sunan ana bileşendir.
- KvkkContentTr

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### KvkkContentTr
**Ne yapar**: Docstring boş bırakılmıştır. Fonksiyon adı ve dosya yolu (`src\views\legal\components\tr\KvkkContent.tsx`) bir React fonksiyonel bileşeni olduğunu gösterir. Bileşenin `lang` adında bir prop aldığı ve yine `lang: string` tipinde prop alan bir React fonksiyonel bileşeni döndürdüğü belirtilmiştir.

**Nasıl yapar**: İç mantık hakkında verilen kaynakta bilgi bulunmamaktadır. Docstring boş olduğundan uygulama detayı bilinmemektedir.

**Parametreler**:
- lang: string — Bileşenin aldığı prop. Destructuring ile alınır. Detaylı açıklama verilmemiştir.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` prop'u alan bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/KvkkContent.tsx::KvkkContentTr
- **params**: `lang` — bileşen prop'u; `localizedHref` fonksiyonuna ikinci argüman olarak geçilir, dil duyarlı URL üretiminde kullanılır
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` modülünden varsayılan olarak import edilen yapılandırma nesnesi; KVKK aydınlatma metnindeki tüm şirket bilgileri ve saklama süreleri bu nesneden okunur
  - `legalConfig.sellerTitle` — veri sorumlusu şirket unvanı; "1) Veri Sorumlusunun Kimliği" bölümünde `<strong>` içinde gösterilir
  - `legalConfig.sellerAddress` — şirket posta adresi; kimlik bölümünde ve "10) Başvuru Yöntemi" bölümünde ıslak imzalı başvuru adresi olarak gösterilir
  - `legalConfig.sellerPhone` — şirket telefon numarası; kimlik bölümünde gösterilir
  - `legalConfig.sellerEmail` — şirket e-posta adresi; kimlik bölümünde ve "8) Ticari Elektronik İleti ve İYS" bölümünde ret bildirim adresi olarak gösterilir
  - `legalConfig.kepAddress` — şirket KEP (Kayıtlı Elektronik Posta) adresi; kimlik bölümünde ve başvuru yöntemi bölümünde gösterilir
  - `legalConfig.mersis` — MERSİS numarası; kimlik bölümünde gösterilir
  - `legalConfig.taxOffice` — vergi dairesi adı; kimlik bölümünde `legalConfig.taxNumber` ile birlikte gösterilir
  - `legalConfig.taxNumber` — vergi numarası; kimlik bölümünde `legalConfig.taxOffice` ile birlikte gösterilir
  - `legalConfig.verbisNo` — VERBİS kayıt numarası; kimlik bölümünde gösterilir
  - `legalConfig.cargoCompanies` — kargo firması adları; "5) Aktarım Yapılan Taraflar" bölümünde lojistik hizmet sağlayıcı olarak gösterilir
  - `legalConfig.retentionOrders` — sipariş ve faturalandırma kayıtları için saklama süresi; "7) Saklama Süreleri" bölümünde gösterilir
  - `legalConfig.retentionSupport` — müşteri destek yazışmaları için saklama süresi; saklama süreleri bölümünde gösterilir
  - `legalConfig.retentionMarketing` — pazarlama izin ve kayıtları için saklama süresi; saklama süreleri bölümünde gösterilir
  - `legalConfig.retentionLogs` — log ve güvenlik kayıtları için saklama süresi; saklama süreleri bölümünde gösterilir
  - `legalConfig.iysBrandCode` — İleti Yönetim Sistemi marka kodu; "8) Ticari Elektronik İleti ve İYS" bölümünde gösterilir
  - `legalConfig.applicationEmail` — KVKK başvuru e-posta adresi; "10) Başvuru Yöntemi" bölümünde gösterilir
  - `legalConfig.lastUpdated` — aydınlatma metninin son güncelleme tarihi; "13) Yürürlük" bölümünde gösterilir
  - `localizedHref` — `@/utils/routes` modülünden import edilen fonksiyon; `Routes.legal.cerez()` ve `lang` argümanlarıyla çağrılarak çerez politikası sayfasının dile duyarlı URL'sini üretir
  - `Routes` — `@/utils/routes` modülünden import edilen rota tanımları nesnesi; `Routes.legal.cerez()` erişimi ile çerez politikası sayfasının yolunu alır
  - `Link` — `next/link` modülünden import edilen bileşen; çerez politikası bağlantısını oluşturmak için kullanılır
- **Dönüş**: React JSX — `<>...</>` fragment içinde 13 adet `<section>` elementinden oluşan KVKK aydınlatma metni içeriği

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\KvkkContent.tsx
  function: src\views\legal\components\tr\KvkkContent.tsx::KvkkContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: KvkkContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`, `text-xs`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`, `underline`