---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\silent-fan\SilentFanProblem.tsx
skeleton_hash: 666108ab9c17b196
entity_hashes:
  func:SilentFanProblem: f3ccc67c9bb4f247
  func:tr: b282b53f03d688a5
  overview: 9c713c60ca011b94
  style_tokens: 3b3553271e7a0f67
generated_at: 2026-05-28T22:35:47Z
---

## Genel Bakış
Bu modül, sessiz fan kategorisiyle ilgili bir sorun bildirim bölümünü gösteren bir React bileşeni içerir. Ayrıca, kullanıcı arayüzündeki metinlerin çevirilerini sağlayan küçük bir yardımcı fonksiyon bulunur.

## Fonksiyon Grupları
### Kullanıcı Arayüzü Bileşeni
Kategori sayfasındaki sessiz fan sorunlarını listeleyen ve görüntüleyen ana bileşeni tanımlar.
- SilentFanProblem

### Çeviri Yardımcısı
Bileşen içinde kullanılan sabit metinlerin farklı dillere çevrilmesini yönetir.
- tr

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `SilentFanProblem()` fonksiyonu çağrılmazsa, bileşen render edilmez ve ekrana hiçbir çıktı üretilmez.  
[Aksiyom 2]: Eğer `tr` fonksiyonuna string tipinde olmayan bir argüman geçilirse, TypeScript derleme hatası oluşur.

---

## FONKSİYON DETAYLARI

### SilentFanProblem
**Ne yapar**: SilentFanProblem, silent fan (sessiz fan) ile ilgili sorunları gösteren bir React bileşenidir.  
**Nasıl yapar**: Bileşen, JSX döndürerek kullanıcı arayüzüne ilgili bilgileri, uyarıları veya çözüm önerilerini yerleştirir.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: React.FC türünde bir fonksiyon döndürür; bu fonksiyon render edildiğinde bileşenin UI çıktısını üretir.

### tr
**Ne yapar**: tr fonksiyonu, verilen bir anahtar (key) ile çeviri veya yerelleştirme metnini elde etmek için kullanılır.  
**Nasıl yapar**: Fonksiyon, key parametresini alarak çeviri tablosundan veya i18n kaynağından ilgili dizeyi bulur ve genellikle bu değeri bir state güncellemesi, bir özellik değeri veya bir side‑effect ile kullanır.  
**Parametreler**:  
- key: string — çevrilecek metnin anahtar kimliği  
**Dönüş**: Fonksiyonun dönüş tipi belirsiz (void veya bilinmiyor); genellikle bir değer döndürmez, yerine yan etkiler üzerinden çeviri işlemini gerçekleştirir.

---

## INTERFACES

### PainPoint
- `title: string`
- `description: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanProblem.tsx::SilentFanProblem
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, useI18n'den gelir; kategoriSilentFan.problem alanındaki çevirileri almak için kullanılır.
  - `dict` — i18n sözlüğü nesnesi; tüm çevirileri içerir, `dict.categorySilentFan.problem` ile problem bölümü verilerine erişim sağlar.
  - `sectionRef` — bölüm elementine bağlanan ref; useScrollAnimation ile scroll‑tabanlı animasyonları tetiklemek için kullanılır.
  - `isVisible` — bölümün şu anda viewport içinde görünür olup olmadığını gösteren boolean; `scrollAnimationClasses.fadeUp(isVisible)` ile animasyon sınıflarını kontrol eder.
  - `tr` — pomoclı fonksiyon; verilen anahtarın önüne `categorySilentFan.problem.` ekleyip `t` ile çeviri döndürür.
  - `pDict` — `dict.categorySilentFan.problem` kısaltması; painPoints, visual.withoutPoints, visual.withPoints gibi tüm problem bölümü verilerine hızlı erişim sağlar.
  - `icons` — `[VolumeX, Zap, Activity, Info]` Lucide ikonlarının dizisi; her pain point kartı için sırayla ikon seçmek için kullanılır.
  - `colors` — metin ve arka plan CSS sınıflarını tanımlayan nesneler dizisi; her pain point kartına farklı renk teması (mavi, turuncu, mor, pembe) uygulanmasını sağlar.
  - `painPoints` — `pDict.painPoints` veya boş dizin; her birinin `title` ve `description` alanlarını taşıyan pain point nesnelerinin listesi; kartları render etmek için `.map` ile iterate edilir.
- **Dönüş**: React.FC (JSX döndüren fonksiyonel bileşen)

### [N2_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanProblem.tsx::tr
- **params**: `key: string`
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (fonksiyon sadece çeviri dizesini döndürür, ancak imzada `void` olarak belirtilmiştir)

### [N3_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanProblem.tsx::painPoints.map callback
- **params**: `point: PainPoint, index: number`
- **ic_degiskenler**:
  - `Icon` — `icons[index % icons.length]` ile seçilen Lucide ikon bileşeni; kartın üst kısmında gösterilir.
  - `color` — `colors[index % colors.length]` ile seçilen renk nesnesi; kartın arka plan ve ikon rengini belirler.
- **Dönüş**: JSX.Element (tek bir pain point kartı)

### [N4_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanProblem.tsx::visual.withoutPoints.map callback
- **params**: `p, i`
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (tek bir "without" liste öğesi; kırmızı nokta ve metin)

### [N5_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanProblem.tsx::visual.withPoints.map callback
- **params**: `p, i`
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (tek bir "with" liste öğesi; mavi nokta ve metin)

---

## NODE ID STANDARD

  file: src\components\category\sections\silent-fan\SilentFanProblem.tsx
  function: src\components\category\sections\silent-fan\SilentFanProblem.tsx::SilentFanProblem
  function: src\components\category\sections\silent-fan\SilentFanProblem.tsx::tr

---

## DISA AKTARILANLAR (EXPORTS)
  export: SilentFanProblem

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/20`, `bg-blue-400`, `bg-blue-500`, `bg-blue-500/20`, `bg-gradient-to-b`, `bg-gradient-to-r`, `bg-red-400`, `bg-red-500`, `bg-white`, `border-blue-400/30`, `border-gray-100`, `border-white/10`, `from-black/80`, `from-gray-50`, `hover:border-gray-200`
- **Layout:** `absolute`, `backdrop-blur-md`, `block`, `flex`, `from-black/80`, `from-gray-50`, `gap-2`, `gap-4`, `gap-8`, `grid`, `grid-cols-2`, `h-1.5`, `h-10`, `h-8`, `h-full`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${color.bg`, `${scrollAnimationClasses.fadeUp(isVisible`, `${scrollAnimationClasses.scaleIn(isVisible`, `aspect-video`, `border`, `duration-300`, `font-bold`, `font-semibold`, `group`, `group-hover:scale-110`, `inset-0`, `lg:px-8`, `mb-1`, `mb-12`, `mb-2`