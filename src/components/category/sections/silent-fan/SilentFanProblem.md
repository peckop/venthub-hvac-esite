---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\silent-fan\SilentFanProblem.tsx
skeleton_hash: 71ddba8df99b75f5
entity_hashes:
  func:SilentFanProblem: f3ccc67c9bb4f247
  func:tr: b282b53f03d688a5
  overview: c3d80f54b946782d
  style_tokens: 3b3553271e7a0f67
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
Bu modül, sessiz fan kategorisindeki sorunları ve çözümleri kullanıcıya gösteren bir React bileşeni sunar. Bileşen, farklı dil destekleri için bir çeviri yardımcısı kullanarak metinleri yerelleştirir.

## Fonksiyon Grupları
### Kullanıcı Arayüzü Bileşeni
Sessiz fan ile ilgili olası sorunları, uyarıları ve çözüm önerilerini listeleyen ana sayfa bileşenini oluşturur.
- SilentFanProblem

### Çeviri ve Yerelleştirme
Bileşen içindeki tüm sabit metinlerin, tanımlı bir dilden autre bir dile çevrilmesini veya yerelleştirme anahtarlarıyla eşleştirilmesini sağlar.
- tr

---

## AXIOMS – Mimari Varsayımlar

Modül, bir React bileşeni olup kullanıcı arayüzü sunar ve çeviri yardımcısı kullanarak metinleri yerelleştirir.

[Aksiyom 1]: Eğer `tr` fonksiyonu için tanımlı bir çeviri yardımcısı (örneğin bir context veya global fonksiyon) yoksa, bileşen içindeki tüm sabit metinler çevrilmemiş veya hatalı gösterimle sonuçlanır.

[Aksiyom 2]: Eğer `tr` fonksiyonuna geçilen `key` parametresi, tanımlı bir çeviri anahtarı listesinde mevcut değilse, `tr` fonksiyonu hata döndürür veya `key`'nin kendisini döndürür (bileşenin tasarımına bağlı).

[Aksiyom 3]: Eğer bileşen farklı bir dil ortamında çalıştırılıyorsa (örneğin, kullanıcının tarayıcı dili veya uygulama dili ayarı farklıysa) ve ilgili dil için çeviri tanımlı değilse, `tr` fonksiyonu varsayılan bir dile (örneğin İngilizce) fallback yapar.

[Aksiyom 4]: Eğer `SilentFanProblem` bileşeni bir React bağlamında (context) dışarıdan bağımlılık olarak `tr` fonksiyonunu almıyorsa, bileşen kendi içinde tanımlı bir `tr` fonksiyonu kullanmalıdır; aksi halde çeviri yapılamaz.

[Aksiyom 5]: Eğer bileşen, sessiz fan kategorisine ait sorun ve çözüm listelerini göstermek için bir dizi (array) veri kullanıyorsa, bu verinin yapılandırması (örneğin her bir sorun-çözüm çiftinin alanları) `tr` anahtarlarıyla uyumlu olmalıdır; aksi halde eksik veya hatalı gösterim oluşur.

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

### [N1_NASIL] AST Pointer: SilentFanProblem.tsx::SilentFanProblem
- **params**: (yok)
- **ic_degiskenler**:
  - `t` — `useI18n` hook'undan dönen çeviri fonksiyonu, key karşılıklarını İngilizce metne çevirir
  - `dict` — `useI18n` hook'undan dönen tam sözlük nesnesi, alt objelere erişim sağlar
  - `sectionRef` — `useScrollAnimation<HTMLElement>` hook'undan dönen ref nesnesi, section DOM elementine bağlanır
  - `isVisible` — `useScrollAnimation` hook'undan dönen boolean, section'ın viewport'a girip girmediğini belirler
  - `tr` — lokal çeviri fonksiyonu, `t(`categorySilentFan.problem.${key}`)` çağırarak belirli bir key'i çevirir
  - `pDict` — `dict.categorySilentFan.problem` erişiminden elde edilen sözlük nesnesi, problem bölümünün tüm metin verilerini tutar
  - `icons` — `[VolumeX, Zap, Activity, Info]` lucide-react ikon bileşenleri dizisi, her pain point kartına bir ikon atanır
  - `colors` — dört nesneden oluşan renk dizisi, her nesne `text` (metin rengi class'ı) ve `bg` (arka plan rengi class'ı) içerir
  - `painPoints` — `pDict.painPoints || []` ifadesinden elde edilen dizi, problem kartlarının verilerini (başlık, açıklama) taşır
- **Dönüş**: JSX — `<section>` elementi, tüm problem bölümünü render eder

### [N2_NASIL] AST Pointer: SilentFanProblem.tsx::tr
- **params**: `key: string` — çevrilecek metin anahtarı
- **ic_degiskenler**: (yok)
- **Dönüş**: `t(...)` çağırımı sonucu çevrilmiş string döner; imza tanımında `yok` olarak belirtilmiştir

### [N3_NASIL] AST Pointer: SilentFanProblem.tsx::painPoints_map_callback
- **params**: `point: PainPoint` (mevcut pain point nesnesi), `index: number` (dizideki indeks)
- **ic_degiskenler**:
  - `Icon` — `icons[index % icons.length]` hesaplamasından elde edilen ikon bileşeni, mevcut karta atanacak lucide ikonu
  - `color` — `colors[index % colors.length]` hesaplamasından elde edilen renk nesnesi, `.text` ve `.bg` erişimleriyle card stilini belirler
- **Dönüş**: JSX — `<div>` elementi, bir pain point kartını render eder; `point.title` ve `point.description` kullanılır

### [N4_NASIL] AST Pointer: SilentFanProblem.tsx::withoutPoints_map_callback
- **params**: `p` (string, "without" listesindeki bir madde metni), `i` (number, indeks)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<li>` elementi, `p` değerini kırmızı renkli madde işaretiyle listeler

### [N5_NASIL] AST Pointer: SilentFanProblem.tsx::withPoints_map_callback
- **params**: `p` (string, "with" listesindeki bir madde metni), `i` (number, indeks)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<li>` elementi, `p` değerini mavi renkli madde işaretiyle listeler

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