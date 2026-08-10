---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\silent-fan\SilentFanFAQ.tsx
skeleton_hash: 403265d46c0abcf5
entity_hashes:
  func:SilentFanFAQ: 514de334aa5d1d84
  func:tr: b282b53f03d688a5
  overview: b16446a0ec91f7da
  style_tokens: 325897ca39ea7e85
generated_at: 2026-06-19T20:47:07Z
---

## Genel Bakış
Bu modül, sessiz fan kategorisine ait Sıkça Sorulan Sorular (SSS) bölümünü kullanıcıya sunan bir React bileşenidir. Modül, içeriğin çoklu dil desteğiyle sunulmasını sağlayan basit bir çeviri yardımcı fonksiyonu da içerir.

## Fonksiyon Grupları
### Ana Bileşen
Sessiz fan ürünleriyle ilgili SSS içeriğini ekranda gösteren ana arayüz bileşenini tanımlar.
- SilentFanFAQ

### Yardımcı Fonksiyonlar
Bileşen içindeki metinlerin farklı dillere çevrilmesini sağlayan temel bir yerelleştirme (i18n) yardımcısı sunar.
- tr

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, fonksiyon imzaları ve modülün genel amacına dayanarak aşağıdaki gibi tanımlanmıştır.

[Aksiyom 1]: Eğer `tr` fonksiyonuna geçilen `key` parametresi, mevcut çeviri sözlüğünde (veya çeviri yönetim sisteminde) tanımlı değilse, `tr` fonksiyonu geçerli bir çeviri dizesi (string) üretemez ve bu durum bileşenin(`SilentFanFAQ`) metin içeriğinin eksik veya hatalı görüntülenmesine yol açar.

[Aksiyom 2]: Eğer `SilentFanFAQ` bileşeni, çeviri için gerekli bağlamı (context) veya yapılandırmayı içeren üst bileşenler tarafından çağrılmıyorsa, bileşen kendi içinde tanımlı sabit bir içeriğe sahip olmadığı için boş veya anlamsız bir SSS listesi görüntüler.

[Aksiyom 3]: Eğer `tr` fonksiyonu tarafından döndürülen çeviri dizesi, tarayıcıda desteklenmeyen veya hatalı karakter encoding'ine sahip bir Unicode karakter içeriyorsa, bileşenin görüntülenen metinleri bozuk (mojibake) olur.

[Aksiyom 4]: Eğer `SilentFanFAQ` bileşeni, prop'lar aracılığıyla harici bir SSS verisi (örn: `faqItems` listesi) almıyorsa ve kendi içinde de böyle bir veri kaynağı yoksa, bileşen hiçbir SSS madde render edemez.

---

## FONKSİYON DETAYLARI

### SilentFanFAQ
**Ne yapar**: SilentFan ürünüyle ilgili sık sorulan soruların (FAQ) bölümünü render eden bir React fonksiyonel bileşenidir.  
**Nasıl yapar**: Bileşen içeriği, genellikle bir `<div>` veya `<section>` içinde soru‑cevap çiftlerini içeren JSX döndürür; stil ve düzenleme dışarıdan aktarılan CSS veya stil kütüphaneleriyle sağlanır.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen; JSX elementi döndürerek UI'ya entegrasyon sağlar.

### tr
**Ne yapar**: Verilen bir çeviri anahtarına karşılık gelen yerelleştirilmiş metni elde etmek için kullanılan bir yardımcı fonksiyondur.  
**Nasıl yapar**: Fonksiyon, `key` parametresini bir çeviri sözlüğü veya i18n sağlayıcıyla eşleştirerek ilgili dizeyi bulur; bulununun sonucu genellikle bileşen metni olarak ayarlanır veya doğrudan döndürülür.  
**Parametreler**:  
- `key`: string — çevrilecek metnin anahtar kimliği.  
**Dönüş**: Açıklama dokümantasyonda dönüş tipi belirtilmemiştir; genellikle `void` (yan etkili bir güncelleme) veya çevrilen `string` döndürülebilir. Gerçek dönüş tipi projeye özel i18n yapılandırmasına bağlıdır.

---

## İTHALATLAR (IMPORTS)
- import: @/hooks/useScrollAnimation::scrollAnimationClasses
- import: @/hooks/useScrollAnimation::useScrollAnimation
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::HelpCircle
- import: lucide-react::Minus
- import: lucide-react::Plus
- import: react::React
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SilentFanFAQ.tsx::SilentFanFAQ
- **params**: (yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, key bazlı çeviri yapmak için kullanılır
  - `dict` — `useI18n()` hook'undan dönen sözlük nesnesi, categorySilentFan verisine erişim sağlar
  - `sectionRef` — `useScrollAnimation<HTMLElement>()` dönen ref, DOM section elemanına bağlanır (scroll animasyonu tetikleme)
  - `isVisible` — `useScrollAnimation()` dönen boolean, section'ın görünür olup olmadığını belirler, CSS sınıflarını koşullu aktif eder
  - `openIndex` — `useState<number | null>(0)` state değeri, hangi FAQ maddesinin açık olduğunu tutar (başlangıçta ilki açık)
  - `setOpenIndex` — state setter, tıklanan maddenin index'ini veya null atar
  - `tr` — inner helper fonksiyonu, `categorySilentFan.faq.` prefix'ini otomatik ekleyerek `t()` çağırır
  - `items` — `dict.categorySilentFan.faq.items` dizisi, FAQ maddeleri listesi; sözlükte yoksa boş dizi (`[]`) fallback
- **Dönüş**: React.ReactNode (JSX section — SSS bölümü, scroll animasyonlu, accordion yapılı FAQ bileşeni)

---

## NODE ID STANDARD

  file: src\components\category\sections\silent-fan\SilentFanFAQ.tsx
  function: src\components\category\sections\silent-fan\SilentFanFAQ.tsx::SilentFanFAQ
  function: src\components\category\sections\silent-fan\SilentFanFAQ.tsx::tr

---

## DISA AKTARILANLAR (EXPORTS)
  export: SilentFanFAQ

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-100`, `bg-blue-600`, `bg-slate-100`, `bg-slate-50`, `bg-white`, `border-blue-500`, `border-slate-200`, `border-slate-50`, `border-t`, `md:text-4xl`, `text-3xl`, `text-blue-600`, `text-center`, `text-left`, `text-lg`
- **Layout:** `flex`, `flex-shrink-0`, `gap-4`, `h-16`, `h-8`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `max-h-0`, `max-h-500px`, `max-w-4xl`, `overflow-hidden`, `shadow-blue-500/5`, `shadow-sm`
- **Varyant/Responsive:** `:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${isOpen`, `${scrollAnimationClasses.fadeUp(isVisible`, `:`, `border`, `duration-300`, `ease-in-out`, `focus-ring`, `font-bold`, `leading-relaxed`, `lg:px-8`, `mb-12`, `mb-6`, `mt-1`, `mx-auto`, `opacity-0`