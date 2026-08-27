---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\category\sections\FAQ.tsx
skeleton_hash: d13285b9414302fd
entity_hashes:
  func:FAQ: 09e0c00f56bbdf5d
  overview: 93d5af423fe50354
  style_tokens: 44e8cc594d8dadd1
generated_at: 2026-08-27T07:03:58Z
---

## Genel Bakış
Bu modül, kategori sayfalarında görünen Sık Sorulan Sorular (SSS) bölümünü render eden tek bir React bileşeni sunar. Bileşen, sabit bir soru-cevap listesini akordiyon (accordion) yapısında sunarak kullanıcıların soruları tek tek açıp kapatabilmesini sağlar. Modül, uluslararasılaştırma desteği için i18n altyapısından yararlanır.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve temel bileşeni olan FAQ, SSS bölümünün tamamını (başlık, sorular ve cevaplar) oluşturur ve yönetir. Kullanıcı etkileşimiyle akordiyon öğelerinin açık/kapalı durumunu kontrol eder.
- FAQ

## Dış Bağımlılıklar
- **Routes** (utils/routes): Sayfa yönlendirme ve bağlantı yapılandırması için kullanılır.
- **use** (i18n/I18nProvider): Çoklu dil desteği sağlamak amacıyla metinlerin uluslararasılaştırılmasında kullanılır.

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
- import: ../../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::ChevronDown
- import: lucide-react::ChevronUp
- import: lucide-react::HelpCircle
- import: react::React
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/FAQ.tsx::FAQ
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; metin anahtarlarını yerel metinlere dönüştürmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota nesnesi; `Routes.contact()` çağrılarak iletişim sayfası URL'si elde edilir
  - `openIndex` — `useState<number | null>(0)` ile oluşturulan state; şu an açık olan SSS kartının indeksini tutar, başlangıç değeri `0`'dır
  - `setOpenIndex` — `openIndex` state'ini güncelleyen setter fonksiyonu; tıklama olayında `isOpen ? null : index` değeri atanır
  - `faqs` — SSS verilerini içeren dizi; her eleman `t('category.faq.qN')` ile soru ve `t('category.faq.aN')` ile cevap alanlarına sahip 6 öğelik sabit dizi
  - `faq` — `faqs.map` callback parametresi; tek bir SSS elemanını temsil eder, `.question` ve `.answer` alanlarına sahiptir
  - `index` — `faqs.map` callback parametresi; mevcut elemanın dizideki sıfır-tabanlı indeks numarası
  - `isOpen` — `openIndex === index` karşılaştırma sonucu; bu SSS kartının şu an genişletilmiş olup olmadığını gösteren boolean değer
- **Dönüş**: JSX — `<section>` kök elemanı içeren React bileşeni; SSS başlığı, accordion kartları ve iletişim CTA bağlantısı içerir

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