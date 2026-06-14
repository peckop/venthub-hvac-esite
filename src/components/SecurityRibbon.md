---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\SecurityRibbon.tsx
skeleton_hash: 8868b245364bfa62
entity_hashes:
  func:SecurityRibbon: a7c5f379d943c103
  overview: 08117376b2a86eee
  style_tokens: 3e379506fde07599
generated_at: 2026-06-14T22:16:29Z
---

## Genel Bakış
SecurityRibbon, Venthub HVAC platformunda kullanıcı güvenini artırmak amacıyla tasarlanmış bir React UI bileşenidir. Ödeme sayfalarında veya güven vurgulanan alanlarda marka ve ödeme sağlayıcısı bilgilerini gösteren özelleştirilebilir bir güvenlik bannerı sunar. Bileşen, farklı görünüm varyantlarıyla farklı tasarım ihtiyaçlarına uyum sağlar.

## Fonksiyon Grupları
### Güvenlik Bannerı Bileşeni
Kullanıcıya marka güveni ve ödeme güvenliği mesajlarını iletmekle sorumlu olan React bileşeni. Marka adı, ödeme sağlayıcısı ve görünüm varyantı gibi parametreler aracılığıyla farklı senaryolara uyarlanabilir.
- SecurityRibbon

---

## AXIOMS – Mimari Varsayımlar

Bu React UI bileşeni (SecurityRibbon), marka adı ve ödeme sağlayıcısı bilgilerini gösteren bir güvenlik şeridi/banner componentidir.

**[Aksiyom 1]:** Eğer `variant` geçerli bir değer değilse (örneğin fonksiyon imzasında `'banne'` olarak kesilmiş/parsellenmemiş bir değer gönderilmişse), bileşen beklenmeyen görünüm sergileyebilir veya rendering hatası oluşur.

**[Aksiyom 2]:** Eğer `brandName` parametresi sağlanmazsa, bileşen varsayılan olarak `'Venthub HVAC'` değerini kullanır; bu nedenle bileşen her zaman bir marka adı ile çalışır.

**[Aksiyom 3]:** Eğer `providerName` parametresi sağlanmazsa, bileşen varsayılan olarak `'iyzico'` ödeme sağlayıcısını kullanır; bu nedenle bileşen her zaman bir ödeme sağlayıcı bilgisi ile çalışır.

**[Aksiyom 4]:** Fonksiyon imzasındaki `variant` parametresinin varsayılan değeri `'banne'` olarak kesilmiş/parsellenmemiş görünmektedir — bu durum, variant'ın beklenen tam değeri (muhtemelen `'banner'`) yerine geçersiz bir string ile başlatılmasına neden olur.

---

## FONKSİYON DETAYLARI

### SecurityRibbon
**Ne yapar**: Venthub HVAC platformu için kullanıcı güvenini artırmak amacıyla güvenlik bilgilerini ekranlarda bir şerit olarak sunan React fonksiyonel bileşenidir. Genellikle ödeme gibi hassas süreçlerde kullanıcının karşısına çıkarak güvenilir marka ve hizmet sağlayıcı bilgilerini iletmek için tasarlanmıştır, eksik kalan prop değerleri için ön tanımlı varsayılanlar sunarak herhangi bir çalışma hatası oluşmadan kullanılır.
**Nasıl yapar**: React'in modern fonksiyonel bileşen yapısı kullanılarak geliştirilen bileşen, kendisine iletilen tüm prop'ları destruct ederek kullanır. Eğer herhangi bir prop harici olarak değer gönderilmeden çağrılırsa tanımlı varsayılan değerleri devreye alır, gelen varyant prop'una göre farklı görsel tasarımlar oluşturarak güvenlik şeridini ihtiyaç duyulan şekilde ekrana yansıtır. Tüm güvenlik şeridi ile ilgili metinsel ve görsel mantığı tek bir bileşende toplayarak proje genelinde yeniden kullanılabilirliği ve bakım kolaylığını artırır.
**Parametreler**:
- brandName: string — Güvenlik şeritinde gösterilecek ana platform markasının ismidir, eğer harici olarak özel bir değer gönderilmezse varsayılan olarak 'Venthub HVAC' değeri kullanılır.
- providerName: string — Güvenlik hizmetini sunan üçüncü taraf sağlayıcının (genellikle ödeme sağlayıcısı) ismidir, varsayılan değeri 'iyzico'dur, ihtiyaç duyulması halinde farklı sağlayıcı isimleriyle kolayca özelleştirilebilir.
- variant: string — Güvenlik şeridinin görsel görünümünü belirleyen, hangi banner tasarımıyla ekrana yansıtılacağını ayarlayan parametredir, farklı kullanım senaryoları için farklı tasarım seçenekleri sunulmasını sağlar.
**Dönüş**: React.FC<SecurityRibbonProps> tipinde, işlenmeye hazır React bileşeni döndürür. Bu döndürülen element, uygulamadaki herhangi bir bileşen içinde import edilip kullanılabilir, kendisine iletilen tüm prop ve varsayılan değerlere göre dinamik olarak içeriğini ve görünümünü oluşturan güvenlik şeridi olarak çalışır.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: lucide-react::CreditCard
- import: lucide-react::Lock
- import: lucide-react::ShieldCheck
- import: react::React

---

## INTERFACES

### SecurityRibbonProps
- `brandName?: string`
- `providerName?: string`
- `variant?: 'banner' | 'card'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SecurityRibbon.tsx::SecurityRibbon
- **params**:
  - `brandName` — marka adı, varsayılan `'Venthub HVAC'`
  - `providerName` — ödeme sağlayıcı adı, varsayılan `'iyzico'`
  - `variant` — bileşen görünüm varyantı, varsayılan `'banner'`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; string localization için kullanılır
  - `base` — bileşenin dış sarmalayıcı div'ine uygulanacak koşullu CSS class string'i; `variant === 'banner'` kontrolüne göre padding (`p-4 md:p-5` veya `p-3`) değişir
  - `badge` — güvenlik rozetlerine (PCI DSS, 3D Secure, 256‑bit SSL) uygulanacak sabit CSS class string'i
- **Dönüş**: JSX — `Lock`, `ShieldCheck`, `CreditCard` ikonları ve `t()` ile çevrilmiş brandName/providerName değerlerini gösteren güvenlik bilgi ribonu

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
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `rounded-full`