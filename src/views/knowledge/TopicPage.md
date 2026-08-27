---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\knowledge\TopicPage.tsx
skeleton_hash: 2a38901c920a434b
entity_hashes:
  func:TopicPage: f0965ed8eda6ce60
  overview: 6055c95ad4a87f00
  style_tokens: cc78d049395b1cf9
generated_at: 2026-08-27T07:33:49Z
---

## Genel Bakış
TopicPage, belirli bir konu (topic) sayfasını görüntülemek için kullanılan bir React bileşenidir. Bileşen, bir `slug` parametresi alarak ilgili konu verisini getirir ve kullanıcıya sunar. Modül tek bir bileşen fonksiyonundan oluşur.

## Fonksiyon Grupları

### Sayfa Bileşeni
Konu sayfasının tamamını render etmekten sorumludur. Dışarıdan gelen `slug` değeriyle (veya prop olarak iletilen `propSlug` ile) hangi konunun gösterileceğini belirler.
- TopicPage

## Bağımlılıklar
Modülün iç veya dış bağımlılıkları, dinamik/lazy yüklenen alt modülleri veya mimari önemine ilişkin bilgi kaynakta belirtilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TopicPage
**Ne yapar**: TopicPage, bir konu (topic) sayfasını görüntülemek için kullanılan bir React fonksiyon bileşenidir. Bileşen, `slug` parametresini alarak ilgili konu içeriğini render eder.

**Nasıl yapar**: Bileşen, aldığı props nesnesinden `slug` değerini `propSlug` adıyla destructuring ederek çıkarır. Dosya yolu (`src\views\knowledge\TopicPage.tsx`) göz önüne alındığında, bilgi (knowledge) modülü altında yer alan bir sayfa bileşenidir. Docstring boş bırakıldığından iç mantığı hakkında kaynakta ek bilgi bulunmamaktadır.

**Parametreler**:
- slug: propSlug — Bileşenin render edeceği konuyu belirleyen slug (URL-dostu benzersiz tanımlayıcı) değeridir. Props nesnesinden destructuring ile çıkarılır ve bileşen içinde `propSlug` adıyla kullanılır. Tip bilgisi `TopicPageProps` arayüzünde tanımlıdır.

**Dönüş**: `React.FC<TopicPageProps>` — `TopicPageProps` arayüzünde tanımlı props alan bir React fonksiyon bileşeni (Function Component) döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/Seo::Seo
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/applicationLinks::getCategoryUrlFromTopic
- import: framer-motion::motion
- import: lucide-react::AlertCircle
- import: lucide-react::ArrowLeft
- import: lucide-react::ArrowRight
- import: lucide-react::BookOpen
- import: lucide-react::CheckCircle2
- import: next/image::Image
- import: next/link::Link
- import: next/navigation::useParams
- import: react::React

---

## INTERFACES

### TopicPageProps
- `slug?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/knowledge/TopicPage.tsx::TopicPage
- **params**: `{ slug: propSlug }` — bileşen prop'u; slug değeri dışarıdan gelebilir
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; i18n anahtarlarını metne çevirir
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen lokalize rota nesnesi; `Routes.destek.home()` ve `Routes.contact()` gibi metotlar içerir
  - `params` — `useParams()` hook'undan dönen Next.js URL parametreleri nesnesi; `params?.slug` ile erişilir
  - `currentSlug` — prop'tan gelen `propSlug` değeri varsa onu kullanır, yoksa `params?.slug` değerini string olarak atar; konu tanımlayıcısı
  - `base` — i18n çeviri anahtarı tabanı; `currentSlug` varsa `knowledge.topics.${currentSlug}` şeklinde oluşturulur, yoksa boş string
  - `title` — `t(`${base}.title`)` çağrısıyla alınan konu başlık metni
  - `exists` — `currentSlug` var VE `title` değeri `${base}.title` ile aynı değilse true; konunun veritabanında mevcut olup olmadığını belirler
  - `rawSteps` — `t(`${base}.steps`)` çağrısıyla alınan ham adım verisi; dizi olmayabilir
  - `steps` — `rawSteps` bir dizi ise kendisi, değilse boş dizi `[]`; adımların güvenli listesi
  - `rawPitfalls` — `t(`${base}.pitfalls`)` çağrısıyla alınan ham tuzak verisi; dizi olmayabilir
  - `pitfalls` — `rawPitfalls` bir dizi ise kendisi, değilse boş dizi `[]`; tuzakların güvenli listesi
- **Dönüş**: JSX element — `exists` false ise "konu bulunamadı" hata bölümü (AlertCircle ikonu, geri dönüş linki); true ise tam sayfa içeriği (Seo, hero bölümü, adımlar kartı, tuzaklar kartı, aksiyon butonları)

---

## NODE ID STANDARD

  file: src\views\knowledge\TopicPage.tsx
  function: src\views\knowledge\TopicPage.tsx::TopicPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: TopicPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `tracking-hvac-loose`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50/30`, `bg-amber-500`, `bg-cyan-500`, `bg-cyan-500/10`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `border-amber-100/50`, `border-cyan-500/20`, `border-slate-100`, `border-slate-200`, `hover:bg-cyan-600`, `hover:bg-slate-50`, `hover:text-slate-950`, `hover:text-white`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-12`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `grid`, `h-1.5`, `h-20`, `h-8`, `inline-flex`, `items-center`, `justify-center`
- **Varyant/Responsive:** `active:`, `dark:`, `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `border`, `dark:prose-invert`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `group`, `group-hover:scale-150`, `group-hover:translate-x-2`, `inset-0`, `leading-relaxed`, `leading-tight`, `lg:px-8`, `mb-10`