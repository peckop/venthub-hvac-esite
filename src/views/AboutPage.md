---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx
skeleton_hash: 045c65bd8217683b
entity_hashes:
  func:AboutPage: 7a07cf459964f7ab
  func:t: 470aecfc62464333
  overview: 81b35718fe56b07f
  style_tokens: 6526e41f4914ea4c
generated_at: 2026-06-19T20:48:37Z
---

## Genel Bakış
VentHub HVAC projesinin "Hakkında" sayfasını sunan, çok dilli destek sağlayan bir React bileşen modülüdür. Modül, belirli bir dile göre çevrilmiş metin içeriğini göstererek sayfa yapısını oluşturur ve kullanıcıya dil seçimine uygun bilgilendirme sunar.

## Fonksiyon Grupları

### Sayfa Oluşturma ve Görüntüleme
Bu grup, "Hakkında" sayfasının ana yapısını ve bileşen hiyerarşisini oluşturarak kullanıcı arayüzünü tarayıcıda render eder.
- `AboutPage`

### Çeviri ve Yerelleştirme
Bu grup, sayfa içindeki dinamik metinlerin farklı dillere göre çevrilmesini sağlar ve dil bağlamına göre doğru içeriği döndürür.
- `t`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çeviri destekli bir React bileşenidir ve `lang` parametresi ile dil seçimini, `t` fonksiyonu ile çok dilli metin gösterimini sağlar.

[Aksiyom 1]: Eğer `t` fonksiyonu modülün erişim alanında (import, context veya prop yoluyla) mevcut değilse, bileşen doğru çevrilmiş metinleri gösteremez ve hata alır.

[Aksiyom 2]: Eğer `t` fonksiyonu, `lang` propertisi tarafından belirlenen dili desteklemiyorsa, bileşen yanlış veya eksik çeviriler gösterebilir.

[Aksiyom 3]: Eğer `t` fonksiyonuna geçilen anahtarlar (key) ilgili dil için çeviri sözlüğünde yoksa, bileşen boş veya hedeflenen metin yerine anahtarı gösterebilir (veya hata fırlatabilir, bu `t` fonksiyonunun tasarımına bağlıdır).

[Aksiyom 4]: Eğer `lang` propertisi geçilmezse, bileşen varsayılan olarak 'tr' (Türkçe) dilini kullanır.

---

## FONKSİYON DETAYLARI

### AboutPage
**Ne yapar**: Uygulamanın "Hakkında" sayfasını oluşturup tarayıcıda gösteren bir React fonksiyonel bileşenidir. Kullanıcıya projenin veya uygulamanın genel bilgilerini sunar.

**Nasıl yapar**: Fonksiyon, React bileşeni olarak tanımlanmıştır ve props olarak `lang` parametresini alır. `lang` parametresi, sayfanın hangi dilde görüntüleneceğini belirler; bu parametre verilmezse varsayılan olarak `'tr'` (Türkçe) kullanılır. Bileşen, muhtemelen ilgili dil seçeneğine göre sayfa içeriğini render eder, ancak iç yapısı verilmemiştir.

**Parametreler**:
- `lang`: string — Sayfanın görüntüleneceği dil kodunu belirtir. Örneğin `'tr'` Türkçe, `'en'` İngilizce içindir. Opsiyonel bir parametredir ve verilmezse `'tr'` değerini alır.

**Dönüş**: `React.FC<AboutPageProps>` tipinde bir React bileşeni döndürür. `AboutPageProps` tipi, bu fonksiyonun kabul ettiği prop'ların yapısını tanımlayan bir arayüzdür, ancak bu arayüzün detayları verilmemiştir.

### t
**Ne yapar**: Uygulama içinde kullanılan bir çeviri (i18n) fonksiyonudur. Verilen bir metin anahtarına karşılık gelen dil çevirisini sözlük nesnesinden bulup döndürür.

**Nasıl yapar**: Fonksiyon, `key` parametresini nokta (`.`) karakterine göre bir diziye böler. Bu dizi, iç içe geçmiş bir sözlük yapısında (`dict`) arama yapmak için kullanılır. Döngüyle her bir anahtar parçasını kontrol ederek `current` değişkenini günceller. Arama sırasında herhangi bir seviyede anahtar bulunamazsa, orijinal `key`字符串i döndürür. Eğer tüm parçalar başarıyla eşleşirse ve sonuç bir `string` ise bu çeviriyi, değilse yine orijinal `key`'i döndürür.

**Parametreler**:
- `key`: string — Çevirisi istenen metnin anahtarı. Nokta ile ayrılmış iç içe yapıları temsil edebilir (örneğin `'menu.home'`). Bu anahtar, `dict` nesnesinde aranacak yolu belirtir.

**Dönüş**: `string` tipinde bir değer döndürür. Bulunan çeviri metni veya herhangi bir eşleşme olmaması durumunda girdiğimiz orijinal `key`字符串i geri verir.

---

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/ScrollReveal::ScrollReveal
- import: ../components/Seo::Seo
- import: ../data/brands::HVAC_BRANDS
- import: ../i18n/dictionaries/en::en
- import: ../i18n/dictionaries/tr::tr
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/image::Image
- import: next/link::Link
- import: react::React

---

## INTERFACES

### AboutPageProps
- `lang?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AboutPage.tsx::AboutPage
- **params**: `{ lang = 'tr' }` — Sayfa dili, varsayılan olarak 'tr' (Türkçe)
- **ic_degiskenler**:
  - `dict` — Seçilen dile göre sözlük objesi; lang === 'en' ise `en` import'u, aksi halde `tr` kullanılır
  - `t` — Çeviri helper fonksiyonu; dot-notation ile key split edip sözlük içinde gezinerek string değer döner; bulunamazsa key'in kendisini döner
  - `stats` — İstatistik verileri dizisi; 4 elemanlı, her biri `{ value, label, icon }` yapısında (deneyim: '15+', distribütörlük: '5', tamamlanan proje: '500+', nakliye ağı: '81')
  - `coreValues` — Temel değerler dizisi; 3 elemanlı, her biri `{ title, description, icon }` yapısında (precision, standards, trust)
- **Dönüş**: JSX — Sayfanın tam HTML yapısı (hero, istatistikler, hikaye, markalar, değerler, CTA bölümleri dahil)

### [N2_NASIL] AST Pointer: AboutPage.tsx::t
- **params**: `(key: string)` — Nokta ile ayrılmış çeviri anahtarı (örn: 'aboutPage.title')
- **ic_degiskenler**:
  - `parts` — `key.split('.')` ile oluşturulmuş nokta-parçaları dizisi; her biri sözlük hiyerarşisinde bir seviyeyi temsil eder
  - `current` — Sözlük içinde gezinirken mevcut değer; başlangıçta `dict` objesi, döngü ilerledikçe iç içe objelere girer
  - `obj` — `current`'ın `Record<string, unknown>` olarak tip dönüşümü (cast); her döngü adımında erişim için kullanılır
  - `part` — For-of döngüsünün mevcut parçası; `parts` dizisinden sırayla alınan sözlük seviye anahtarı
- **Dönüş**: `string` — Çeviri sözlüğünden bulunan string değer veya bulunamazsa orijinal `key`字符串i

---

## NODE ID STANDARD

  file: src\views\AboutPage.tsx
  function: src\views\AboutPage.tsx::AboutPage
  function: src\views\AboutPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: AboutPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-4`, `border-b`, `border-cyan-500/20`, `border-slate-100`, `border-slate-200`, `border-white`, `border-white/10`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-12`, `gap-16`, `gap-24`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-2`, `h-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-space-x-4`, `animate-pulse`, `aspect-square`, `border`, `brightness-0`, `brightness-50`, `duration-1000`, `duration-500`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`, `group`