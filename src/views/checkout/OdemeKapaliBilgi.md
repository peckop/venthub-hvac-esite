---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\views\checkout\OdemeKapaliBilgi.tsx
skeleton_hash: 5b4473cedcf55765
entity_hashes:
  func:OdemeKapaliBilgi: 93714afd24653501
  overview: 2040a2ed743aa406
  style_tokens: 851f356ba32aba85
generated_at: 2026-08-28T11:56:49Z
---

## Genel Bakış
Bu modül, ödeme sürecinin (checkout) kapalı olduğu durumlarda kullanıcıya bilgilendirme mesajı gösteren bir React bileşeni içerir. Tek bir fonksiyonel bileşenden oluşan minimal bir modüldür.

## Fonksiyon Grupları

### Kullanıcı Arayüzü Bileşeni
Ödeme işleminin kullanılamadığı durumda ekrana bilgilendirici bir içerik render eder.
- OdemeKapaliBilgi

## Bağımlılıklar ve Mimari Notlar

- **İç bağımlılık:** Tek fonksiyon içerdiğinden iç çağrı ilişkisi bulunmuyor.
- **Dış bağımlılık:** Kaynak dosyada hangi modüllerin import edildiği belirtilmemiştir; bilinmiyor.
- **Mimari önem:** Checkout akışının bir parçası olarak, ödeme servisinin kapalı olduğu senaryoda kullanıcı deneyimini koruyan bir kenar durum (edge case) bileşenidir.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### OdemeKapaliBilgi
**Ne yapar**: Ödeme yolunun kapalı olduğu durumlarda kullanıcıya bilgi kartı gösteren bir React fonksiyonel bileşenidir. Şirket kuruluşu henüz tamamlanmadığında ödeme işleminin gerçekleştirilemeyeceğini kullanıcıya bildirmek amacıyla kullanılır. Recep talimatı doğrultusunda 2026-08-28 tarihinde oluşturulmuştur.

**Nasıl yapar**: Herhangi bir dış parametre almayan bir fonksiyonel bileşen olarak tanımlanmıştır. Fonksiyon çağrıldığında `React.FC` tipinde bir bileşen döndürür. Docstring bilgisine göre bileşen, ödeme yolunun kapalı olduğunu belirten bir bilgi kartı arayüzü render eder. Bileşenin iç yapısı (hangi JSX elemanlarını kullandığı, stil bilgisi, koşullu render mantığı vb.) verilen kaynakta detaylandırılmamıştır.

**Parametreler**:
- Fonksiyon tanımlamasında herhangi bir parametre belirtilmemiştir.

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipinde bir değer döndürür. Bu, bileşenin JSX olarak render edilebilir bir React elemanı ürettiği anlamına gelir.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/whatsapp::getSupportLink
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/OdemeKapaliBilgi.tsx::OdemeKapaliBilgi
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `checkout.kapali.baslik`, `checkout.kapali.aciklama`, `checkout.kapali.whatsappCta`, `checkout.kapali.emailCta` anahtarlarıyla metinleri çözümlemek için kullanılır
  - `lang` — `useI18n()` hook'undan destructure edilen mevcut dil kodu; `getSupportLink` fonksiyonuna ikinci argüman olarak aktarılır
  - `whatsappLink` — `getSupportLink(t('checkout.kapali.baslik'), lang)` çağrısının dönüş değeri; koşullu olarak `<a>` elementinin `href` niteliğine atanır, falsy ise WhatsApp butonu render edilmez
- **Dönüş**: JSX — ödeme kapalı bilgi sayfasını gösteren tam sayfa düzeni; beyaz kart içinde başlık (`h1`), açıklama (`p`) ve iki buton (koşullu WhatsApp linki, sabit e-posta linki `mailto:info@venthub.com.tr`) içerir

---

## NODE ID STANDARD

  file: src\views\checkout\OdemeKapaliBilgi.tsx
  function: src\views\checkout\OdemeKapaliBilgi.tsx::OdemeKapaliBilgi

---

## DISA AKTARILANLAR (EXPORTS)
  export: OdemeKapaliBilgi

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-lg`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-white`, `border-light-gray`, `border-primary-navy`, `hover:bg-air-blue`, `hover:bg-secondary-blue`, `text-2xl`, `text-center`, `text-primary-navy`, `text-steel-gray`, `text-white`
- **Layout:** `flex`, `flex-col`, `gap-3`, `inline-flex`, `items-center`, `justify-center`, `max-w-xl`, `min-h-screen`, `p-8`, `shadow-sm`, `sm:flex-row`, `w-full`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-secondary-blue`, `font-bold`, `font-semibold`, `mb-3`, `mb-8`, `px-4`, `px-6`, `py-16`, `py-3`, `transition-colors`