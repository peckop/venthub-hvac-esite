---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx
skeleton_hash: ebcb58b4e3e45923
entity_hashes:
  func:ApplicationSolutions: 93f4bfc3e2d056b5
  overview: 26527ace9a268eaa
  style_tokens: a60445c0b91a13d5
generated_at: 2026-06-15T17:02:32Z
---

## Genel Bakış
Bu modül, ana sayfada farklı uygulama çözümlerini (örneğin park, mutfak, giriş, konfor alanları) görsel kartlar halinde sunan bir React arayüz bileşenidir. Bileşen, dışarıdan sağlanan bir çeviri sözlüğü (`dictionary`) kullanarak tüm başlık ve açıklamaları dinamik olarak doldurur. Temel sorumluluğu, sabit bir çözüm listesini alıp düzenli bir grid yapısında kullanıcıya sunmaktır.

## Fonksiyon Grupları
### Arayüz Bileşeni
Bu grup, sayfada belirli uygulama alanlarına ait çözüm kartlarını render eden ana ve tek bileşeni kapsar. Bileşen, props olarak gelen çeviri sözlüğü ile metinleri lokalize eder ve solutions dizisindeki verileri kartlara dönüştürerek arayüzü oluşturur.
- `ApplicationSolutions`

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki koşulların sağlanması gerekir.

**Aksiyom 1**: Eğer `dictionary` (t) prop'u sağlanmazsa, çözüm kartlarındaki başlık, açıklama ve diğer metin alanları boş.render edilir veya hata oluşur.

**Aksiyom 2**: Eğer `dictionary` yapısında `solutions` ile eşleşen anahtarlar (park, mutfak, giriş, konfor vb.) yoksa, ilgili çözüm kartlarında çeviri metinleri gösterilmez.

**Aksiyom 3**: Eğer `lang` prop'u sağlanmazsa, dil-sensitive içerik gösterimi (varsa) çalışmayabilir.

**Aksiyom 4**: Eğer `solutions` sabit dizisi boşsa, bileşen hiçbir çözüm kartı render etmez.

**Aksiyom 5**: Eğer `solutions` dizisindeki herhangi bir elemanın `dictionary` yapısında karşılığı yoksa, o karta ait metin alanları boş kalır.

---

## FONKSİYON DETAYLARI

### ApplicationSolutions
**Ne yapar**: HVAC sektöründe sunulan uygulama çözümlerini (endüstriyel tesisat, iklimlendirme, soğutma sistemleri vb.) interaktif bir bileşen olarak görüntüler. Bu bileşen, ana sayfada firma tarafından sunulan farklı uygulama alanlarını ve çözüm önerilerini kullanıcılara görsel ve metinsel olarak sunar.

**Nasıl yapar**: Fonksiyon, bir React functional component yapısındadır ve bağımsız bir component olarak export edilir. Fonksiyon parametre olarak destructuring ile alınan bir `dictionary` (t olarak yeniden adlandırılmış) ve `lang` (dil kodu) değerlerini kullanır. `dictionary` objesi, bileşen içindeki tüm metinlerin çok dilli (i18n) olmasını sağlar; böylece farklı dillerde içerik gösterimi dinamik olarak gerçekleştirilir. Bileşen, `ApplicationSolutionsProps` arayüzünde tanımlı prop'ları kabul eder ve JSX markup döndürerek tarayıcıda render edilebilir bir yapı üretir.

**Parametreler**:
- `dictionary` : `object` (t olarak yeniden adlandırılmış) — Çok dilli metin içeriklerini içeren sözlük/çeviri objesi. Bileşen içindeki başlıklar, açıklamalar ve diğer metinsel içerikler bu obje üzerinden dinamik olarak çekilir.
- `lang` : `string` — Aktif dil kodunu belirtir (örn: "tr", "en", "de"). Sözlük içeriğinin hangi dilde sunulacağını ve olası dil bazlı yönlendirme mantığını belirler.

**Dönüş**: `React.FC<ApplicationSolutionsProps>` tipinde bir fonksiyonel React component döndürür. Bu component, `ApplicationSolutionsProps` arayüzünde tanımlı tüm prop'ları destekler ve React JSX elementi (ReactElement veya JSX.Element) olarak render edilebilir yapıdadır.

---

---

## İTHALATLAR (IMPORTS)
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/image::Image
- import: next/link::Link
- import: react::React

---

## INTERFACES

### SolutionItem
- `id: 'parking' | 'kitchen' | 'entrance' | 'comfort'`
- `categorySlug: string`
- `subSlug?: string`
- `image: string`
- `span: string`

### LocalizedDict
- `eyebrow: string`
- `title: string`
- `subtitle: string`
- `viewAll: string`
- `items: Record<string, {`

### ApplicationSolutionsProps
- `dictionary: LocalizedDict`
- `lang: string`

---

## SABİTLER
- **solutions** (array) — `[
  {
    id: 'parking',
    categorySlug: 'industrial-ventilation',
    ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/ApplicationSolutions.tsx::ApplicationSolutions
- **params**: `({ dictionary: t, lang })` — `t` (dictionary object, localization metinleri ve ürün verileri içerir), `lang` (aktif dil kodu, URL oluşturmada kullanılır)
- **ic_degiskenler**:
  - `itemDict` — `t.items[item.id]` erişimiyle elde edilen sözlük nesnesi; `item.id` anahtarına karşılık gelen çözüm verisini tutar, erişilemezse boş alanlı bir nesne döner
  - `delayClass` — `index` değerine göre mod 5 hesaplamasıyla seçilen CSS gecikme sınıfı dizesi (ör. 'delay-0', 'delay-150'); animasyon sıralamasını belirler
- **Dönüş**: JSX elementi (ReactFC türünde)

### [N2_NASIL] AST Pointer: src/components/home/ApplicationSolutions.tsx::map_callback
- **params**: `(item, index)` — `item` (solutions dizisindeki mevcut eleman), `item.id`, `item.image`, `item.span`, `item.categorySlug`, `item.subSlug` özellikleri kullanılır; `index` (mevcut elemanın dizindeki konumu)
- **ic_degiskenler**:
  - `itemDict` — N1_NASIL'deki aynı değişken, map callback'i içinde tanımlanır ve `t.items[item.id]` erişimi ile doldurulur
  - `delayClass` — N1_NASIL'deki aynı değişken, map callback'i içinde hesaplanır
- **Dönüş**: JSX elementi (çözüm kartını temsil eder)

---

## NODE ID STANDARD

  file: src\components\home\ApplicationSolutions.tsx
  function: src\components\home\ApplicationSolutions.tsx::ApplicationSolutions

---

## DISA AKTARILANLAR (EXPORTS)
  export: ApplicationSolutions

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `bg-slate-100`, `bg-slate-200`, `bg-slate-50/50`, `bg-white`, `bg-white/10`, `border-white/10`, `border-white/20`, `from-slate-950/90`, `group-hover:bg-cyan-600`, `group-hover:text-cyan-600`, `sm:text-6xl`, `text-2xl`, `text-4xl`, `text-center`
- **Layout:** `-skew-x-12`, `absolute`, `backdrop-blur-md`, `backdrop-blur-xl`, `block`, `flex`, `flex-col`, `flex-wrap`, `from-slate-950/90`, `gap-2`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`
- **Varyant/Responsive:** `data-[in-view=true]:`, `group-hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${delayClass`, `${item.span`, `-translate-x-4`, `-translate-y-4`, `border`, `data-[in-view=true]:opacity-100`, `data-[in-view=true]:translate-x-0`, `data-[in-view=true]:translate-y-0`, `delay-100`, `delay-200`, `delay-300`, `duration-1000`, `duration-500`, `duration-700`, `ease-out`