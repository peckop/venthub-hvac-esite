---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\FAQ.tsx
skeleton_hash: e37ce1098854250f
entity_hashes:
  func:FAQ: 09e0c00f56bbdf5d
  overview: 2819faae975a53e8
  style_tokens: 44e8cc594d8dadd1
generated_at: 2026-06-14T21:00:10Z
---

## Genel Bakış
Bu modül, kategori sayfalarında görünen Sık Sorulan Sorular (SSS) bölümünürender eden tek bir React bileşeni sunar. Bileşen, sabit bir soru-cevap listesini alır ve bunları akordiyon (accordion) yapısında sunarak kullanıcıların soruları tek tek açıp kapatabilmesini sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve temel bileşeni olan FAQ, SSS bölümünün tamamını (başlık, sorular ve cevaplar) oluşturur ve yönetir.
- FAQ()

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### FAQ
**Ne yapar**: FAQ bileşeni, hava perdeleriyle ilgili sık sorulan soruları (SSS) bir akordiyon (accordion) biçiminde gösterir. Kullanıcıya soruya tıkladığında ilgili cevabı açıp kapatarak bilgiye hızlı erişim sağlar.

**Nasıl yapar**: Bileşen içindeki veri (örnek olarak sabit bir soru‑cevap listesi) harita fonksiyonu ile dönüştürülür; her bir soru için bir akordiyon öğesi oluşturulur ve tıklama olayıyla durum durumu (open/close) yönetilir. Sonuç olarak JSX döndürülür ve React tarafından render edilir.

**Parametreler**: Yok

**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen döner; bu, JSX elementi üreten ve React ağacına entegrasyon sağlayan bir fonksiyon anlamına gelir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/routes::Routes
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::ChevronDown
- import: lucide-react::ChevronUp
- import: lucide-react::HelpCircle
- import: react::React
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/FAQ.tsx::FAQ
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu; `t('category.faq.q1')` gibi anahtarlarla çok dilli çeviri dizesi üretir
  - `openIndex` — useState ile tutulan state; hangi FAQ maddesinin açık olduğunu index olarak saklar; başlangıç değeri `0` (ilk madde açık), `null` ise hepsi kapalı
  - `setOpenIndex` — openIndex state'ini güncelleyen setter fonksiyonu; tıklama ile openIndex değiştirilir
  - `faqs` — 6 elemanlı array; her eleman `{ question: string, answer: string }` yapısındadır; `t()` çağrılarıyla çeviri anahtarlarından doldurulur
  - `faq` — `faqs.map` callback'inde mevcut eleman; `{ question, answer }` yapısında
  - `index` — `faqs.map` callback'inde mevcut elemanın dizin numarası (0-5 arası)
  - `isOpen` — `openIndex === index` karşılaştırmasıyla hesaplanan boolean; ilgili maddenin açık olup olmadığını belirler; JSX'te koşullu className ve animasyon mantığını kontrol eder
- **Dönüş**: JSX — `<section>` ile sarılmış FAQ bölümü; accordion yapısında soru-cevap listesi, üst başlık (`HelpCircle` ikonu + heading + subtitle), ve iletişim CTA linki (`Routes.contact()`) içeren React functional component; `setOpenIndex(isOpen ? null : index)` ile state güncellenir (yan etki)

### [N2_NASIL] AST Pointer: src/components/category/sections/FAQ.tsx::(faq, index) => { ... } (map callback)
- **params**: (`faq` — faqs dizisindeki mevcut eleman `{ question: string, answer: string }`, `index` — elemanın dizin numarası)
- **ic_degiskenler**:
  - `isOpen` — `openIndex === index` karşılaştırmasıyla hesaplanan boolean; akordeon maddesinin açık olup olmadığını belirler; JSX'te koşullu className (`border-blue-200 shadow-md` vs `border-gray-200`, `bg-blue-50` vs `bg-white hover:bg-gray-50`, `text-blue-700` vs `text-gray-900`) ve animasyon (`max-h-96` vs `max-h-0`) mantığını kontrol eder
- **Dönüş**: JSX — tek bir FAQ maddesi `<div>` elementi; `<button>` ile tıklama handler'ı (`setOpenIndex(isOpen ? null : index)`), `ChevronUp`/`ChevronDown` ikon koşullu gösterimi, `faq.question` başlık içeriği, `faq.answer` cevap içeriği; `isOpen` durumuna göre border renk-gölge, arka plan rengi ve metin rengi koşullu olarak değişir

---

## NODE ID STANDARD

  file: src\components\category\sections\FAQ.tsx
  function: src\components\category\sections\FAQ.tsx::FAQ

---

## DISA AKTARILANLAR (EXPORTS)
  export: FAQ

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-gray-50`, `bg-white`, `border-blue-200`, `border-gray-200`, `hover:bg-gray-50`, `hover:text-blue-700`, `md:text-4xl`, `text-3xl`, `text-blue-500`, `text-blue-600`, `text-blue-700`, `text-center`, `text-gray-400`, `text-gray-600`
- **Layout:** `flex`, `flex-shrink-0`, `gap-2`, `gap-4`, `inline-flex`, `items-center`, `justify-between`, `max-h-0`, `max-h-96`, `max-w-3xl`, `overflow-hidden`, `p-5`, `p-6`, `shadow-md`, `w-full`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${isOpen`, `:`, `border`, `duration-300`, `focus-ring`, `font-bold`, `font-semibold`, `leading-relaxed`, `lg:px-8`, `mb-12`, `mb-4`, `mt-12`, `mx-auto`, `pt-0`, `px-4`