---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx
skeleton_hash: 0c7e1c369b37db44
entity_hashes:
  func:TopicPage: f0965ed8eda6ce60
  overview: 288735bf511e8c87
  style_tokens: cc78d049395b1cf9
generated_at: 2026-05-27T17:46:37Z
---

## Genel Bakış
`TopicPage` bileşeni, bir konuya ait dinamik içeriği URL parametresi (`slug`) üzerinden alıp, ilgili veri kaynaklarından (örneğin API veya yerel veri dosyaları) konunun detaylarını çekerek kullanıcıya sunan bir sayfa bileşenidir. React‑router ile entegre çalışır ve sayfa başlığı, meta verileri ve içerik bölümlerini render eder.

## Fonksiyon Grupları
### Sayfa Veri Çekme ve Hazırlama
Bu grup, `slug` değerine göre konu verisini elde eder, hata ve yükleme durumlarını yönetir, ardından bileşenin render aşamasına hazır hâle getirir.  
- TopicPage

### UI Render ve Layout
Bu grup, alınan veri üzerinden başlık, açıklama, görseller ve ilgili alt bileşenleri (ör. `KnowledgeCard`, `RelatedTopics`) düzenleyerek kullanıcı arayüzünü oluşturur.  
- TopicPage (render kısmı)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TopicPage
**Ne yapar**: Bu React fonksiyonel bileşeni, VentHub HVAC platformundaki bilgi konularının tek sayfa görüntülenmesini sağlayan ana bileşendir. Aldığı benzersiz slug değeri ile hangi konunun içeriğinin yükleneceğini belirler ve kullanıcıya sunar.
**Nasıl yapar**: Bileşen, aldığı propSlug prop'u aracılığıyla görüntülenecek konunun benzersiz tanımlayıcısını alır. Bu tanımlayıcı kullanılarak ilgili konu verileri çekilir, ardından konu başlığı, detaylı içerik ve ilgili ek bileşenler render edilerek tam bir konu sayfası oluşturulur.
**Parametreler**:
- propSlug: string — Bileşene iletilen, görüntülenecek bilgi konusunun benzersiz tanımlayıcısı olan slug değeri
**Dönüş**: React.FC<TopicPageProps> tipinde bir React fonksiyonel bileşeni döner. Bu dönüş tipi, bileşenin TopicPageProps arayüzü ile tanımlanan propsları kabul ettiğini ve geçerli JSX elemanları ürettiğini belirtir.

---

## INTERFACES

### TopicPageProps
- `slug?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx::TopicPage
- **params**: `{ slug: propSlug }` – bileşene dışarıdan gelen `slug` özelliği, `propSlug` adıyla yerel değişkene atanır.
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan dönen çeviri fonksiyonu; `t(key)` ile i18n metinlerine erişir.
  - `params` — `useParams()` hookundan alınan URL parametreleri nesnesi.
  - `currentSlug` — `propSlug` mevcutsa onu, yoksa `params?.slug` değerini (string) tutar; konu kimliğini belirler.
  - `base` — `currentSlug` varsa `"knowledge.topics.${currentSlug}"` biçiminde, yoksa boş string; çeviri anahtarlarının ön ekini oluşturur.
  - `title` — `t(`${base}.title`)` çağrısıyla elde edilen konu başlığı metni.
  - `exists` — `currentSlug` tanımlı ve `title` çeviri anahtarına eşit değilse `true`; konunun varlığını gösterir.
  - `rawSteps` — `t(`${base}.steps`)` ile alınan ham adım verisi (herhangi bir tipte).
  - `steps` — `Array.isArray(rawSteps) ? rawSteps : []` ifadesiyle, `rawSteps` bir dizi ise onu, değilse boş dizi olarak tutar.
  - `rawPitfalls` — `t(`${base}.pitfalls`)` ile alınan ham risk verisi (herhangi bir tipte).
  - `pitfalls` — `Array.isArray(rawPitfalls) ? rawPitfalls : []` ifadesiyle, `rawPitfalls` bir dizi ise onu, değilse boş dizi olarak tutar.
- **Dönüş**: `JSX.Element` – koşula göre “bulunamadı” mesajı veya tam konu sayfası içeren JSX yapısını döner.

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