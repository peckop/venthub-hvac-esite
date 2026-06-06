---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx
skeleton_hash: ecd28b653e17510e
entity_hashes:
  func:AboutPage: 7a07cf459964f7ab
  func:t: 470aecfc62464333
  overview: 9d68dc23ca71a802
  style_tokens: 6526e41f4914ea4c
generated_at: 2026-06-06T21:56:30Z
---

## Genel Bakış
VentHub HVAC projesinin “Hakkında” sayfasını sunan, dil destekli bir React bileşenidir. Modül, sayfanın tüm arayüz yapısını ve çok dilli metin gösterimini yönetir.

---



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

## INTERFACES

### AboutPageProps
- `lang?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AboutPage.tsx::AboutPage
- **params**: `({ lang = 'tr' })` — lang parametresi, sayfanın dilini belirler (varsayılan: 'tr')
- **ic_degiskenler**:
  - `dict` — lang parametresine göre seçilen sözlük nesnesi (en veya tr)
  - `t` — çeviri helper fonksiyonu, key.split('.') ile iç içe erişim yapar
  - `stats` — istatistik verilerini tutan dizi: {value, label, icon} nesnelerinden oluşur
  - `coreValues` — temel değerleri tutan dizi: {title, description, icon} nesnelerinden oluşur
- **Dönüş**: JSX elementi (React component)

### [N2_NASIL] AST Pointer: AboutPage.tsx::t
- **params**: `(key: string)` — çevrilecek metin anahtarı (örn: 'aboutPage.heroTitle')
- **ic_degiskenler**:
  - `parts` — key.split('.') ile oluşan nokta ayrılmış string dizisi
  - `current` — mevcut sözlük seviyesi (unknown tipinde başlatılır, Record<string, unknown> olarak cast edilir)
  - `obj` — current'ın Record<string, unknown> cast edilmiş hali
- **Dönüş**: string — çevrilmiş metin veya hata durumunda orijinal key

### [N3_NASIL] AST Pointer: AboutPage.tsx::stats_map_callback
- **params**: `(stat, i)` — stat: {value, label, icon} nesnesi; i: dizi indeksi
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (ScrollReveal içinde istatistik gösterimi)

### [N4_NASIL] AST Pointer: AboutPage.tsx::team_avatars_map_callback
- **params**: `i` — dizi indeksi
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (avatar görseli)

### [N5_NASIL] AST Pointer: AboutPage.tsx::hvac_brands_map_callback
- **params**: `(brand)` — HVAC_BRANDS dizisinden gelen brand nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (marka ikonu ve kart)

### [N6_NASIL] AST Pointer: AboutPage.tsx::coreValues_map_callback
- **params**: `(value, i)` — value: {title, description, icon} nesnesi; i: dizi indeksi
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (ScrollReveal içinde değer gösterimi)

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