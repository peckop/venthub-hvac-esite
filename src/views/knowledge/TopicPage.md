---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx
skeleton_hash: 89dc924cf7ee0cc8
entity_hashes:
  func:TopicPage: f0965ed8eda6ce60
  overview: 6055c95ad4a87f00
  style_tokens: cc78d049395b1cf9
generated_at: 2026-06-19T20:50:58Z
---

## Genel Bakış
TopicPage bileşeni, VentHub HVAC platformunda bilgi tabanındaki belirli bir konunun kapsamlı sayfa görünümünü sağlayan temel React bileşenidir. URL yapısından gelen benzersiz `slug` parametresini kullanarak ilgili konunun tüm içeriğini, başlığını ve ilişkili verilerini dinamik olarak çeker, yönetir ve kullanıcılara sunar. Bileşen, veri çekme sürecindeki yükleme, hata ve kısmi veri durumlarını ele alarak dayanıklı bir kullanıcı deneyimi hedefler.

## Fonksiyon Grupları
### Sayfa Verisi Yönetimi ve Koordinasyon
Bu grup, bileşenin temel yaşam döngüsünü ve veri akışını yönetir. Alınan `slug` parametresinin geçerliliğini kontrol eder, ilgili konu verisini bir API veya veri kaynağından asenkron olarak çeker ve bu sürecin yaratacağı farklı durumları (yükleme, hata, başarı) koordine eder.
- TopicPage

### Kullanıcı Arayüzü Oluşturma ve Render
Veri çekme sürecinin başarılı olması durumunda, elde edilen veriler kullanılarak konu sayfasının tamamı oluşturulur. Bu, sayfanın başlığı, ana zengin içeriği, meta bilgileri ve potansiyel olarak ilişkili diğer konulara bağlantılar sunan kartlar gibi UI bileşenlerinin render edilmesini kapsar.
- TopicPage

## Mimari Önem ve Bağımlılıklar
Bu modül, bilgi tabanı alt sisteminin görünüm katmanında kritik bir noktadır ve doğrudan URL rotasyonuna bağlıdır. Dış bağımlılık olarak, ilgili konu verisini sağlayan bir API servisine veya veri kaynağına bağlanır; bu bağlantı koptuğunda veya veri eksik olduğunda bileşenin kendi başına hata yönetimi ve yeniden deneme mekanizması sunması beklenir. İçeride, potansiyel olarak yükleme göstergesi (spinner), hata bileşeni ve zengin içerik editörü gibi alt bileşenlere bağımlıdır; bu alt bileşenler genellikle lazy (tembel) veya dinamik olarak yüklenebilir. Bileşen, slug parametresinin değişmesine tepki vererek state'i sıfırlamalı ve yeni veri çekme döngüsünü başlatmalıdır; aksi takdirde eski veriyle hatalı bir render oluşabilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, yalnızca fonksiyon imzası ve modül sabitlerinden çıkarılmıştır.

---

[Aksiyom 1]: Eğer `slug` parametresi çağrıya sağlanmazsa, bileşen ilgili konu verisini çekemez ve sayfa içeriği render edilemez.

[Aksiyom 2]: Eğer `slug` parametresi geçersiz veya sistemde eşleşmeyen bir değer içeriyorsa, veri çekme işlemi başarısız olur ve bileşen hata durumuna geçer.

[Aksiyom 3]: Eğer `slug` parametresi `null`, `undefined` veya boş string olarak iletilirse, veri isteği anlamsız bir sorgu ile gönderilir veya hiç gönderilmez; bileşen kararlı bir durumda kalamaz (ne yükleme ne de hata durumu tetiklenir; davranış belirsizdir).

---

**Not:** Fonksiyon imzasında `slug` parametresi için herhangi bir default değer tanımlanmamıştır; bu nedenle çağrıcı tarafından zorunlu olarak sağlanmalıdır. Modül sabitleri tanımlı değildir. Bileşen iç veri çekme mantığı, API uç noktaları ve hata yönetimi detayları fonksiyon gövdesinden çıkarılamadığından bu konularda aksiyom üretilmemiştir.

---

## FONKSİYON DETAYLARI

### TopicPage
**Ne yapar**: Bu React fonksiyonel bileşeni, VentHub HVAC platformundaki bilgi konularının tek sayfa görüntülenmesini sağlayan ana bileşendir. Aldığı benzersiz slug değeri ile hangi konunun içeriğinin yükleneceğini belirler ve kullanıcıya sunar.
**Nasıl yapar**: Bileşen, aldığı propSlug prop'u aracılığıyla görüntülenecek konunun benzersiz tanımlayıcısını alır. Bu tanımlayıcı kullanılarak ilgili konu verileri çekilir, ardından konu başlığı, detaylı içerik ve ilgili ek bileşenler render edilerek tam bir konu sayfası oluşturulur.
**Parametreler**:
- propSlug: string — Bileşene iletilen, görüntülenecek bilgi konusunun benzersiz tanımlayıcısı olan slug değeri
**Dönüş**: React.FC<TopicPageProps> tipinde bir React fonksiyonel bileşeni döner. Bu dönüş tipi, bileşenin TopicPageProps arayüzü ile tanımlanan propsları kabul ettiğini ve geçerli JSX elemanları ürettiğini belirtir.

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

### [N1_NASIL] AST Pointer: `src/views/knowledge/TopicPage.tsx`::TopicPage
- **params**: `{ slug: propSlug }` —父组件den gelen topic slug'u, opsiyonel olarak doğrudan verilebilir
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, tüm metinler bu ile çekilir
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen lokalize rota nesnesi, `.destek.home()` ve `.contact()` çağrılır
  - `params` — `useParams()` ile elde edilen Next.js parametre nesnesi, `params?.slug` erişimi yapılır
  - `currentSlug` — `propSlug` varsa onu, yoksa `params?.slug`'ı string olarak alan birleşik slug değişkeni
  - `base` — çeviri key prefix'i, formatı `knowledge.topics.${currentSlug}`; `currentSlug` yoksa boş string
  - `title` — `${base}.title` ile çekilen çevirilmiş konu başlığı metni
  - `exists` — boolean; `currentSlug` mevcut VE `title`'ın hala çeviri key'ine eşit olmadığı durumda `true` (yani konu bulunabilir)
  - `rawSteps` — `${base}.steps` ile çekilen hammadde adım dizisi (array veya string/diğer olabilir)
  - `steps` — `rawSteps` bir dizi ise onu, değilse boş dizi `[]` dönen güvenli adım listesi
  - `rawPitfalls` — `${base}.pitfalls` ile çekilen hammadde tuzak/tuzaklar dizisi
  - `pitfalls` — `rawPitfalls` bir dizi ise onu, değilse boş dizi `[]` dönen güvenli tuzak listesi
- **Dönüş**: JSX — `exists` `false` ise "konu bulunamadı" uyarı sayfası JSX'i erken return ile döner; `true` ise `<Seo>` + hero section + steps/pitfalls grid + aksiyon footer içeren tam topic sayfası JSX'i döner

---

### [N2_NASIL] AST Pointer: `src/views/knowledge/TopicPage.tsx`::steps.map callback
- **params**: `(s: string, i: number)` — `s`: mevcut adım metni, `i`: dizi index'i (key olarak kullanılır)
- **ic_degiskenler**:
  - `s` — `$steps` dizisinden gelen tek bir adım metni, `<p>` içinde render edilir
  - `i` — dizi index'i, `key={i}` olarak React key'e ve nokta göstergesi için kullanılır
- **Dönüş**: JSX — her adım için cyan nokta + metin paragrafı içeren flex satır div'i

---

### [N3_NASIL] AST Pointer: `src/views/knowledge/TopicPage.tsx`::pitfalls.map callback
- **params**: `(s: string, i: number)` — `s`: mevcut tuzak/tavsiye metni, `i`: dizi index'i (key olarak kullanılır)
- **ic_degiskenler**:
  - `s` — `$pitfalls` dizisinden gelen tek bir tuzak/tavsiye metni, `<p>` içinde render edilir
  - `i` — dizi index'i, `key={i}` olarak React key'e kullanılır
- **Dönüş**: JSX — her tuzak için amber `CheckCircle2` ikonu + metin paragrafı içeren flex satır div'i

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