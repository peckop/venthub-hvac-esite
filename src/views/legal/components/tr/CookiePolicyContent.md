---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\CookiePolicyContent.tsx
skeleton_hash: 85985f9ee991f929
entity_hashes:
  func:CookiePolicyContentTr: 0284b5d72d7677e5
  overview: 7744e91e555544e5
  style_tokens: 6460a848de07bdf3
generated_at: 2026-06-19T20:50:50Z
---

## Genel Bakış

Bu modül, VentHub platformunun Türkçe çerez politikası sayfası için gerekli içeriği sunan bir React bileşenidir. Kullanıcılara çerezlerin kullanımı, türleri ve yönetimi konusunda yasal bilgilendirmeyi sağlamakla sorumludur.

## Fonksiyon Grupları

### İçerik Görüntüleme

Çerez politikasının Türkçe metin ve bölümlerini tarayıcıda render eden bileşeni içerir.

- `CookiePolicyContentTr`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC uygulamasının yasal sayfalarında görüntülenen statik bir bileşen (content component) olup, cookie policy içeriğini sunar.

---

## FONKSİYON DETAYLARI

### CookiePolicyContentTr
**Ne yapar**: Bu fonksiyon, belirli bir dil (`lang` parametresi) için çerez politikası içeriğini render eden bir React bileşeni (`React.FC`) döndürür. Çerez politikası metinlerinin dinamik olarak yüklenmesini ve sunulmasını sağlar.

**Nasıl yapar**: Fonksiyon, bir `React.FC` türünde bir bileşen döndürür. Bileşenin kendisi, `lang` parametresini alır ve bu dile karşılık gelen çerez politikası içeriğini render eder. İçerik, `lang` parametresine bağlı olarak dinamik olarak import edilir (örneğin `import(`../content/${lang}/CookiePolicy`)`), bu da istenen dildeki bileşenin asenkron olarak yüklenmesini sağlar. Bileşen, yüklenen içeriği React fragment (`<>...</>`) içinde sararak sayfaya entegre eder.

**Parametreler**:
- `lang`: `string` — Bileşenin hangi dilde içerik göstereceğini belirten ISO dil kodu (örn: 'tr', 'en'). Doğrudan kullanılmaz, ancak döndürülen `React.FC` bileşeninin prop'u olarak beklenir.

**Dönüş**: `React.FC<{ lang: string }>` — Verilen `lang` prop'una göre ilgili dildeki çerez politikası içeriğini render eden, `React.FC` türünde bir React fonksiyonel bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/CookiePolicyContent.tsx::CookiePolicyContentTr
- **params**: `{ lang: string }` — component props'u olarak tanımlı; fonksiyon gövdesinde kullanılmıyor
- **ic_degiskenler**: yok (hiçbir local değişken tanımlanmamış, sadece JSX return ediliyor)
- **Dict Access**:
  - `legalConfig.sellerEmail` — `@/config/legal` import'undan gelen config nesnesinden iletişim e-posta adresi çekilir, 5. section'daki `<strong>` içinde render edilir
  - `legalConfig.lastUpdated` — `@/config/legal` import'undan gelen config nesnesinden politika güncelleme tarihi çekilir, 6. section'daki `<strong>` içinde render edilir
- **Dönüş**: JSX — React Fragment (`<>`) içinde 6 adet `<section>` elementi; çerez politikasının Türkçe metin içeriğini (tanım, türler, üçüncü taraf çerezleri, yönetim, iletişim, yürürlük tarihi) statik olarak render eden React element

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\CookiePolicyContent.tsx
  function: src\views\legal\components\tr\CookiePolicyContent.tsx::CookiePolicyContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookiePolicyContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `pl-6`, `space-y-1`