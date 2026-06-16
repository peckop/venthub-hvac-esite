---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\en\PrivacyPolicyContent.tsx
skeleton_hash: e663a80a279a5b60
entity_hashes:
  func:PrivacyPolicyContentEn: 0b9028540cd295ad
  overview: 20980fb4e6c9124c
  style_tokens: 4e890ff82c62079d
generated_at: 2026-06-16T11:55:52Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasının İngilizce gizlilik politikası sayfasının içeriğini sunan bir React bileşenidir. Tek bileşenli bir yapıya sahip olup, yasal metinleri dil parametresine göre render etmek için kullanılır. Modül, uygulamanın gizlilik ve uyumluluk gereksinimlerini karşılamak üzere statik bir içerik sağlayıcısı olarak işlev görür.

## Fonksiyon Grupları

### Gizlilik Politikası İçerik Bileşeni
Bu grup, gizlilik politikasının İngilizce dilindeki yapısını ve metinlerini oluşturarak kullanıcıya sunan temel bileşeni içerir. Bileşen, dil parametresini alarak içeriği dinamik olarak biçimlendirebilir, ancak asıl işlevi yasal metinlerin tutarlı bir şekilde görüntülenmesini sağlamaktır.
- PrivacyPolicyContentEn

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/PrivacyPolicyContent.tsx::PrivacyPolicyContentEn
- **params**: `lang` — dil kodu (ör. "en"), localized URL'lerde ve href'lerde kullanılır
- **ic_degiskenler**: (fonksiyon gövdesinde yerel değişken tanımlanmamıştır)
  - `legalConfig.sellerTitle` — Yasal satıcı unvanı, "1) Data Controller" bölümünde rendered
  - `legalConfig.sellerAddress` — Satıcı adresi, controller bölümünde rendered
  - `legalConfig.sellerEmail` — Satıcı e-postası, controller bölümünde rendered
  - `legalConfig.sellerPhone` — Satıcı telefonu, controller bölümünde rendered
  - `legalConfig.retentionOrders` — Sipariş/fatura verisi saklama süresi, "6) Retention Periods" bölümünde rendered
  - `legalConfig.retentionSupport` — Destek yazışmaları saklama süresi, retention bölümünde rendered
  - `legalConfig.retentionMarketing` — Pazarlama onayları/verileri saklama süresi, retention bölümünde rendered
  - `legalConfig.retentionLogs` — Log ve güvenlik kayıtları saklama süresi, retention bölümünde rendered
  - `legalConfig.applicationEmail` — KVKK başvuru e-postası, "7) Your Rights" bölümünde rendered
  - `legalConfig.lastUpdated` — Politika güncelleme tarihi, "8) Updates" bölümünde rendered
  - `localizedHref(Routes.legal.cerez(), lang)` — Çerez politikası sayfası için localize edilmiş URL, `<Link>` href'inde kullanılır
  - `Routes.legal.cerez()` — Çerez politikası rotasını döndüren zincirsel metod çağrısı, `localizedHref`'e argüman olarak verilir
- **Dönüş**: JSX Fragment (`<><section>...</section>...</>`) — 8 bölümlük İngilizce gizlilik politikası içeriği; yan etki yok, state değiştirme yok, sadece statik render

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
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `pl-6`, `space-y-1`, `underline`