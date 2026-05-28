---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx
skeleton_hash: 72b54455bc94e755
entity_hashes:
  func:ApplicationSolutions: f0529a9d9f6e077f
  overview: f3aec9e6945fdf3a
  style_tokens: a60445c0b91a13d5
generated_at: 2026-05-28T22:35:51Z
---

## Genel Bakış
Bu modül, ana sayfada dört farklı uygulama çözümünü (park, mutfak, giriş, konfor) kullanıcıya sunan bir React fonksiyonel bileşeni içerir. Bileşen, dışarıdan aldığı çeviri sözlüğü sayesinde tüm metinleri dinamik olarak doldurur ve çözüm kartlarını görsel bir düzen içinde render eder.

## Fonksiyon Grupları
### Arayüz Bileşeni
Bu grup, çözüm kartlarını düzenleyerek ekrana basan ana bileşeni kapsar; çeviri desteği ile arayüz metinleri dinamik hale getirilir.
- ApplicationSolutions

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki koşulların sağlanması gerekir.

**Aksiyom 1**: Eğer `dictionary` (prop) sağlanmazsa, `t` tanımsız olur ve çeviri fonksiyonu (`t(...)`) çağrıldığında çalışma zamanı hatası oluşur.  

**Aksiyom 2**: Eğer `solutions` sabiti (dizi) tanımlı değilse veya `undefined`/`null` ise, bileşen render aşamasında `solutions.map` gibi bir işlem yapılmaya çalışıldığında tip hatası ortaya çıkar.  

**Aksiyom 3**: Eğer `solutions` dizisi boş (`[]`) ise, bileşen hiçbir çözüm öğesi render etmez ve kullanıcı arayüzünde boş bir alan (veya varsayılan placeholder) gösterilir.  

**Aksiyom 4**: Eğer `solutions` dizisi içinde beklenen alanlar (ör. `title`, `description`, `icon` vb.) eksikse, ilgili UI öğeleri render edilemez ve bu alanlar için boş değerler gösterilir; ancak bileşenin genel render süreci kesilmez.  

**Aksiyom 5**: Eğer `dictionary` içinde istenen çeviri anahtarları bulunmazsa, `t` fonksiyonu varsayılan olarak anahtar adını döndürür (veya boş string) ve UI’da eksik metin gösterilir; uygulama çökmez.  

**Aksiyom 6**: Eğer `solutions` dizisi çok büyük (ör. binlerce öğe) ise, render performansı düşer; bu durum modülün tasarım sınırları içinde kabul edilir (performans eşiği belirtilmemiştir).  

**Aksiyom 7**: Eğer `dictionary` bir fonksiyon değilse (ör. nesne veya başka bir tip), `t` çağrısı sırasında tip hatası oluşur ve bileşen render edilemez.  

> **Not:** Bu aksiyomlar yalnızca fonksiyon imzası ve modül sabitlerinden (`solutions` dizisi) türetilmiştir; kod gövdesi, yorumlar veya docstring’lerden ek bilgi çıkarılmamıştır.

---

## FONKSİYON DETAYLARI

### ApplicationSolutions
**Ne yapar**: Bu bileşen, uygulamanın "Uygulama Çözümleri" bölümünü oluşturmak ve görüntülemekle sorumludur. Kullanıcıya sunulacak çözümlerin listesini veya detaylarını içeren arayüzü temsil eder. Genellikle ana sayfa veya ilgili sayfalarda yer alarak ürün veya hizmet çözümlerini sergiler.

**Nasıl yapar**: Bileşen, dışarıdan `dictionary` adında bir prop (genellikle `t` olarak aliaslanır) alarak içerik yönetimi veya çoklu dil desteği sağlar. Bu veriyi kullanarak JSX yapısını oluşturur ve `ApplicationSolutionsProps` tipine uygun bir React bileşeni döndürür. İçerik, prop olarak gelen sözlüğe dinamik olarak bağlanır.

**Parametreler**:
- dictionary: object (t olarak aliaslanmıştır) — Bileşen içindeki metinlerin, başlıkların veya verilerin yerelleştirilmesi veya sağlanması için kullanılan nesne.

**Dönüş**: `React.FC<ApplicationSolutionsProps>` — Uygulama çözümleri arayüzünü tanımlayan ve render eden bir React Fonksiyonel Bileşeni.

---

## INTERFACES

### SolutionItem
- `id: 'parking' | 'kitchen' | 'entrance' | 'comfort'`
- `href: string`
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

---

## SABİTLER
- **solutions** (array) — `[
  { 
    id: 'parking', 
    href: '/category/industrial-ventilation/jet...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx::ApplicationSolutions
- **params**: ({ dictionary: t })
- **ic_degiskenler**:
  - `t` — dışarıdan gelen çeviri nesnesi; `t.eyebrow`, `t.title`, `t.subtitle`, `t.viewAll` ve `t.items` gibi alanları içerir.
  - `solutions` — dosya üstünde tanımlı sabit dizi; her eleman `id`, `href`, `image`, `span` gibi alanlar taşır.
- **Dönüş**: React element (JSX) – bir `<section>` yapısı döner; yan etkisi yoktur, sadece UI üretir.

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx::(item, index) => { … }
- **params**: (item, index)
- **ic_degiskenler**:
  - `item` — `solutions` dizisinden gelen tek bir öğe; `id`, `href`, `image`, `span` vb. alanları vardır.
  - `index` — `solutions.map` içinde öğenin sırası, gecikme sınıfı hesaplamak için kullanılır.
  - `itemDict` — `t.items[item.id]` üzerinden alınan çeviri nesnesi; bulunamazsa `{ title: '', eyebrow: '', description: '', point1: '', point2: '' }` varsayılanı kullanılır.
  - `delayClass` — `index % 5` sonucuna göre `'delay-0' | 'delay-150' | 'delay-300' | 'delay-500' | 'delay-700'` değerlerinden birini alır; animasyon gecikmesini belirler.
- **Dönüş**: React element (JSX) – bir `<div>` içinde `<Link>` ve `<Image>` bileşenleriyle kart UI’sı döner; yan etkisi yoktur.

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