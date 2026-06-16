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
generated_at: 2026-06-16T11:56:27Z
---

## Genel Bakış

Bu modül, VentHub platformunun Türkçe çerez politikası sayfası için gerekli içeriği sunan bir React bileşenidir. Kullanıcılara çerezlerin kullanımı, türleri ve yönetimi konusunda yasal bilgilendirmeyi sağlamakla sorumludur.

## Fonksiyon Grupları

### İçerik Görüntüleme

Çerez politikasının Türkçe metin ve bölümlerini tarayıcıda render eden bileşeni içerir.

- `CookiePolicyContentTr`

---

**Not:** Modül yapısı son derece basittir — tek bir sunucu tarafı (stateless) React bileşeninden oluşur. Harici bağımlılığı sadece React kütüphanesidir; herhangi bir API çağrısı, state yönetimi veya alt bileşen kullanımı bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC uygulamasının yasal sayfalarında görüntülenen statik bir bileşen (content component) olup, cookie policy içeriğini sunar.

---

**[Aksiyom 1]:** Eğer `lang` prop'u (`string` tipinde) sağlanmazsa, bileşen React tarafından derleme/zaman hatası verir; bileşen düzgün render edilemez.

**[Aksiyom 2]:** Eğer `lang` prop'u geçerli bir string değeri içermiyorsa (örn. `undefined`, `null`), bileşen beklenmeyen davranış gösterebilir veya boş/eksik içerik döndürür.

**[Aksiyom 3]:** Bileşen statik cookie policy içeriği sunduğu için, bileşen içinde API çağrısı veya dış bağımlılık bulunduğu varsayılmaz; tüm içerik bileşen içinde tanımlıdır.

**[Aksiyom 4]:** Bileşenin adındaki `Tr` soneki, bu bileşenin **Türkçe** dilinde cookie policy içeriğini görüntülediğini belirtir; `lang` prop'u ile dil seçimi arasında bir bağlantı olup olmadığı bilinmemektedir (fonksiyon gövdesinde doğrulanmamıştır).

---

> **Not:** Bu dosya `source_type: doc` olarak işaretlendiğinden, bileşenin gerçek kod gövdesi analiz edilmemiştir. Yukarıdaki aksiyomlar yalnızca fonksiyon imzasından türetilmiştir.

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