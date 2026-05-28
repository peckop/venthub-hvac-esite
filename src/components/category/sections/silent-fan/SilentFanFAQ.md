---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\silent-fan\SilentFanFAQ.tsx
skeleton_hash: 6c6af5e226009042
entity_hashes:
  func:SilentFanFAQ: 514de334aa5d1d84
  func:tr: b282b53f03d688a5
  overview: 04a22bd0b6f69650
  style_tokens: 325897ca39ea7e85
generated_at: 2026-05-28T22:35:47Z
---

## Genel Bakış
Bu modül, sessiz fan kategorisiyle ilgili sık sorulan sorular (FAQ) içeriğini gösteren bir React bileşeni tanımlar. Ayrıca, içerik içinde kullanılan metinlerin çevirilerini sağlayan basit bir yardımcı fonksiyon içerir.

## Fonksiyon Grupları
### Bileşen Tanımı
Kullanıcı arayüzünde silent‑fan bölümünün FAQ kısmını render eden ana bileşeni oluşturur.
- SilentFanFAQ

### Yerelleştirme Yardımcı
Bileşen içindeki sabit metinlerin farklı dillere çevrilmesini kolaylaştıran bir çeviri işlevi sağlar.
- tr

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanFAQ.tsx::SilentFanFAQ
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, useI18n hookundan elde edilen i18n çeviri işlevi.
  - `dict` — i18n sözlüğü nesnesi, categorySilentFan.faq.items gibi çeviri verilerini içerir.
  - `sectionRef` — bölüm öğesine bağlanacak ref, useScrollAnimation ile scroll tabanlı animasyon için kullanılır.
  - `isVisible` — bölümün görünürlüğünü gösteren boolean değer, useScrollAnimation tarafından sağlanır.
  - `openIndex` — şu anda açık olan FAQ öğesinin indeksi (kapalıysa null) tutan useState durumu.
  - `setOpenIndex` — openIndex durumunu güncelleyen setter fonksiyonu.
  - `tr` — kategori özelı FAQ çeviri anahtarını oluşturan yardımcı fonksiyon, `categorySilentFan.faq.` öneki ekler.
  - `items` — dict.categorySilentFan.faq.items çeviri verisi, tanımlı değilse boş dizi.
- **Dönüş**: JSX elementi (React.FC) — tüm FAQ bölümünü render eden section öğesi.

### [N2_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanFAQ.tsx::tr
- **params**: key: string
- **ic_degiskenler**:
  - (yok) — fonksiyon gövdesinde yeni bir değişken tanımlanmaz; t dışarıdaki kapsamdan kapatılır.
- **Dönüş**: string — `categorySilentFan.faq.{key}` anahtarına karşılık gelen çevrilen metin.

### [N3_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanFAQ.tsx::map callback
- **params**: item: { q: string; a: string }, index: number
- **ic_degiskenler**:
  - `isOpen` — boolean, verilen index'in openIndex durumuyla eşleşip eşleşmediğini kontrol eder; true ise ilgili FAQ açıktır.
- **Dönüş**: JSX elementi — tek bir FAQ öğesini (başlık butonu ve içerik paneli) render eden div.

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