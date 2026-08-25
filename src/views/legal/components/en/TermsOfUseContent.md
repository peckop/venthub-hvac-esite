---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\legal\components\en\TermsOfUseContent.tsx
skeleton_hash: 901c2fcd180664d0
entity_hashes:
  func:TermsOfUseContentEn: 2d425a97c4f30297
  overview: 55f2a6482c0be2a4
  style_tokens: c2df28d44e819ffd
generated_at: 2026-08-25T07:48:22Z
---

## Genel Bakış

Bu modül, İngilizce dilindeki Kullanım Şartları (Terms of Use) sayfasının içeriğini görüntülemekten sorumlu bir React bileşeni içerir. `src/views/legal/components/en/` yolunda yer alması, yasal sayfaların dile göre ayrılmış bir yapıda organize edildiğini gösterir. Modül, dışarıdan bir `lang` parametresi alarak dil bağlamında içerik sunar.

## Fonksiyon Grupları

### İçerik Görüntüleme Bileşeni

Kullanım Şartları metninin İngilizce versiyonunu kullanıcı arayüzünde render eder. Tek bir bileşenden oluşan modül, yasal içerik sunumunda kullanılan temel yapı taşıdır.

- TermsOfUseContentEn

## Bağımlılıklar

**Dış Bağımlılıklar:** React kütüphanesi (bileşen tipi tanımı için kullanılır).

**İç Bağımlılıklar:** Modülün kendi içinde çağrılan başka bir fonksiyon bulunmuyor.

**Dinamik/Lazy Yüklenen Modüller:** Kaynakta bu yönde bir bilgi yer almıyor.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TermsOfUseContentEn

**Ne yapar**: İngilizce dilindeki Kullanım Koşulları (Terms of Use) sayfasının içeriğini görüntüleyen bir React fonksiyonel bileşenidir. Bileşen, dil bilgisini parametre olarak alır ve kullanım koşulları metnini kullanıcı arayüzünde sunar.

**Nasıl yapar**: Fonksiyon, destructuring yöntemiyle aldığı `lang` parametresini kullanarak İngilizce kullanım koşulları içeriğini render eder. Bileşenin iç render mantığı ve hangi alt bileşenleri kullandığı kaynakta belirtilmemiştir.

**Parametreler**:
- lang: string — Bileşenin çalışacağı dili belirten dil kodu. Destructuring ile doğrudan props nesnesinden çıkarılır.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` prop'u alan bir React fonksiyonel bileşeni döndürür. `React.FC` (Function Component) tipi, bu fonksiyonun bir React bileşeni olduğunu ve `{ lang: string }` tipinde props beklediğini belirtir.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfigEn
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/TermsOfUseContent.tsx::TermsOfUseContentEn
- **params**: `lang` — dil kodu, `localizedHref` çağrılarında URL yerelleştirme için kullanılır
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` dosyasından import edilen `legalConfigEn` nesnesi; satıcı bilgileri ve yapılandırma değerleri sağlar
  - `legalConfig.websiteUrl` — web sitesi alan adı; `<h2>` başlığında "www.{legalConfig.websiteUrl}" şeklinde gösterilir
  - `legalConfig.sellerTitle` — satıcı unvanı; hizmet sağlayıcı bölümünde ve fikri mülkiyet bölümünde `<strong>` içinde gösterilir
  - `legalConfig.sellerAddress` — satıcı adresi; iletişim bilgisi olarak `<strong>` içinde gösterilir
  - `legalConfig.sellerEmail` — satıcı e-posta adresi; iletişim bilgisi olarak ve yetkisiz kullanım bildirimi yönlendirmesinde `<strong>` içinde gösterilir
  - `legalConfig.sellerPhone` — satıcı telefon numarası; iletişim bilgisi olarak `<strong>` içinde gösterilir
  - `legalConfig.mersis` — MERSIS numarası; iletişim bilgisi olarak `<strong>` içinde gösterilir
  - `legalConfig.tradeRegistryNo` — ticaret sicil numarası; iletişim bilgisi olarak `<strong>` içinde gösterilir
  - `legalConfig.etbisNo` — ETBIS kayıt numarası; iletişim bilgisi olarak `<strong>` içinde gösterilir
  - `legalConfig.lastUpdated` — son güncelleme tarihi; değişiklikler bölümünde `<strong>` içinde gösterilir
  - `localizedHref` — `@/utils/routes` dosyasından import edilen fonksiyon; rota ve dil parametresi alarak yerelleştirilmiş URL üretir
  - `localizedHref(Routes.legal.mesafeliSatis(), lang)` — Mesafeli Satış Sözleşmesi sayfasının yerelleştirilmiş URL'si; `<Link>` bileşeninin `href` prop'una atanır
  - `localizedHref(Routes.legal.onBilgilendirme(), lang)` — Ön Bilgilendirme Formu sayfasının yerelleştirilmiş URL'si; `<Link>` bileşeninin `href` prop'una atanır
  - `localizedHref(Routes.legal.kvkk(), lang)` — KVKK Aydınlatma Metni sayfasının yerelleştirilmiş URL'si; `<Link>` bileşeninin `href` prop'una atanır
  - `localizedHref(Routes.legal.gizlilik(), lang)` — Gizlilik Politikası sayfasının yerelleştirilmiş URL'si; `<Link>` bileşeninin `href` prop'una atanır
  - `Routes` — `@/utils/routes` dosyasından import edilen rota tanımları nesnesi; `Routes.legal.mesafeliSatis()`, `Routes.legal.onBilgilendirme()`, `Routes.legal.kvkk()`, `Routes.legal.gizlilik()` metotlarına erişilir
  - `Link` — `next/link` paketinden import edilen bileşen; hukuki belgelere yönlendirme bağlantılarında kullanılır
  - `React` — `react` paketinden import edilen modül; JSX dönüşü için kullanılır
- **Dönüş**: `React.ReactNode` — bir React Fragment (`<>...</>`) içinde 11 adet `<section>` bileşeni döndürür; kullanım koşulları maddelerini (hizmet sağlayıcı, hizmet kapsamı, üyelik, ürün bilgisi, fiyatlandırma, fikri mülkiyet, yasaklı kullanım, sorumluluk reddi, kişisel veriler, uyuşmazlık çözümü, değişiklikler) İngilizce olarak render eder

---

## NODE ID STANDARD

  file: TermsOfUseContent.tsx
  function: TermsOfUseContent.tsx::TermsOfUseContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: TermsOfUseContentEn

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