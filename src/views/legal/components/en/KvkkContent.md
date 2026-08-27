---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\en\KvkkContent.tsx
skeleton_hash: 690a1a09d07cfe91
entity_hashes:
  func:KvkkContentEn: 6d754c2438921901
  overview: 272dfd637a338bd1
  style_tokens: 93d28fc913e27f7d
generated_at: 2026-08-27T07:37:14Z
---

## Genel Bakış
KVKK (Kişisel Verilerin Korunması Kanunu) metinlerinin İngilizce versiyonunu görüntülemek için kullanılan bir React bileşen modülüdür. Modül, hukuki içerik sayfasında yer alacak statik metin ve düzeni sağlamakla sorumludur. Bileşen, dil bilgisini dışarıdan prop olarak alır.

## Fonksiyon Grupları

### Hukuki İçerik Gösterimi
KVKK aydınlatma metninin İngilizce çevirisini içeren React bileşenini oluşturur. Bileşen, aldığı dil prop'u ile çalışır ve yasal zorunluluk kapsamında bulunması gereken veri işleme şartları, kullanıcı hakları ve aydınlatma metinlerini yapılandırılmış biçimde sunar.
- KvkkContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesine erişim sağlanmadığından, `lang` parametresinin nasıl kullanıldığı, hangi koşulların gerektiği veya hangi dallanmaların yapıldığı belirlenememektedir. Yalnızca fonksiyon imzasından `lang` adında bir `string` parametre aldığı ve bir React bileşeni döndürdüğü bilinmektedir; ancak bu bilgi tek başına bir aksiyom üretmek için yeterli değildir.

---

## FONKSİYON DETAYLARI

### KvkkContentEn
**Ne yapar**: KVKK (Kişisel Verilerin Korunması Kanunu) İngilizce içeriğini görüntüleyen bir React fonksiyonel bileşenidir. Dosya yolu `views\legal\components\en\KvkkContent.tsx` olarak belirtilen bu bileşen, yasal bilgilendirme sayfasının İngilizce dilindeki metin içeriğini sunar.

**Nasıl yapar**: Fonksiyonun iç mantığı verilen kaynakta belirtilmemiştir. Bileşen, aldığı `lang` prop'u doğrultusunda İngilizce KVKK metinlerini render eden bir React fonksiyonel bileşeni (`React.FC`) olarak tanımlanmıştır.

**Parametreler**:
- `lang`: `string` — Bileşenin hangi dilde çalışacağını belirten dil kodu parametresi. Props nesnesinden destructure edilerek alınır.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` prop'u alan bir React fonksiyonel bileşeni döndürür. Döndürülen bileşen, `lang` tipinde bir string prop kabul eden bir JSX yapısı üretir.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfigEn
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/KvkkContent.tsx::KvkkContentEn
- **params**: `{ lang }` — dil kodu, cookie politikası linkinin yönlendirmesinde kullanılır
- **ic_degiskenler**:
  - `lang` — parametre; `localizedHref(Routes.legal.cerez(), lang)` çağrısında dil bazlı href üretmek için kullanılır
  - `legalConfig` — `@/config/legal` dosyasından import edilen `legalConfigEn` nesnesi; KVKK aydınlatma metnindeki tüm şirket bilgilerini sağlar. Şu alanlara erişilir:
    - `legalConfig.sellerTitle` — veri sorumlusu unvanı
    - `legalConfig.sellerAddress` — şirket adresi
    - `legalConfig.sellerPhone` — şirket telefonu
    - `legalConfig.sellerEmail` — şirket e-posta adresi (aydınlatma metninde ve ticari elektronik ileti iptal bilgisinde kullanılır)
    - `legalConfig.kepAddress` — KEP adresi (başvuru kanalı olarak gösterilir)
    - `legalConfig.mersis` — MERSIS numarası
    - `legalConfig.taxOffice` — vergi dairesi
    - `legalConfig.taxNumber` — vergi numarası
    - `legalConfig.verbisNo` — VERBIS kayıt numarası
    - `legalConfig.cargoCompanies` — kargo/kurye firmaları bilgisi
    - `legalConfig.retentionOrders` — sipariş ve fatura kayıt saklama süresi
    - `legalConfig.retentionSupport` — müşteri destek yazışmaları saklama süresi
    - `legalConfig.retentionMarketing` — pazarlama onayları saklama süresi
    - `legalConfig.retentionLogs` — log ve güvenlik kayıtları saklama süresi
    - `legalConfig.iysBrandCode` — İYS marka kodu
    - `legalConfig.applicationEmail` — KVKK başvuru e-posta adresi
    - `legalConfig.lastUpdated` — aydınlatma metninin son güncelleme tarihi
  - `Routes` — `@/utils/routes` dosyasından import edilen rota tanımları nesnesi; `Routes.legal.cerez()` çağrısı ile cookie politikası sayfasının yolunu üretir
  - `localizedHref` — `@/utils/routes` dosyasından import edilen fonksiyon; `Routes.legal.cerez()` ve `lang` parametresini alarak dil yerelleştirilmiş href döndürür
  - `Link` — `next/link` bileşeni; cookie politikası sayfasına yönlendiren `<Link>` elemanında kullanılır
- **Dönüş**: `React.ReactNode` — KVKK aydınlatma metninin 13 bölümünü içeren JSX fragment (`<>...</>`)

---

## NODE ID STANDARD

  file: src\views\legal\components\en\KvkkContent.tsx
  function: src\views\legal\components\en\KvkkContent.tsx::KvkkContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: KvkkContentEn

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