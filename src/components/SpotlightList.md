---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\SpotlightList.tsx
skeleton_hash: 8b7b0b4d8c4518b8
entity_hashes:
  func:SpotlightList: 358dd251b6a56278
  func:onMove: 0f9106ce87047fd0
  overview: bdffe404d7317486
  style_tokens: e561a3ecabc90f8b
generated_at: 2026-05-28T22:37:15Z
---

## Genel Bakış
Venthub HVAC projesinin arayüzünde yer alan bu modül, odaklanmış (spotlight) liste bileşenini oluşturur ve kullanıcıların listedeki öğelerle, özellikle de öğeleri taşıma yoluyla, etkileşim kurmasını sağlar. Üst bileşenlerden gelen veriye ve olay işleyicilerine bağımlı olarak çalışır.

## Fonksiyon Grupları
### Ana Bileşen
Listenin genel yapısını ve görünümünü oluşturur. Listelenecek verileri alır ve arayüzde render edilmesini yönetir.
- SpotlightList

### Kullanıcı Etkileşimi İşleyicileri
Liste üzerindeki fare hareketleri gibi etkileşimleri yakalar ve üst bileşene iletir, böylece öğe taşıma gibi dinamik işlemlerin tetiklenmesini sağlar.
- onMove

---

## AXIOMS – Mimari Varsayımlar
Bu modül için React tabanlı arayüzde çalışacak bir liste bileşeni varsayımları tanımlanmıştır.

[Aksiyom 1]: Eğer React ortamı (JSX/TSX derleyicisi) yoksa, SpotlightList bileşeni sayfada render edilemez.

[Aksiyon 2]: Eğer onMove fonksiyonu çağrıldığında geçerli bir olay nesnesi (Event) parametresi verilmezse, liste öğesi taşıma işlemi doğru işlenemez.

[Aksiyom 3]: Eğer bileşen props olarak gerekli veri (liste öğeleri) almazsa, boş veya hatalı bir liste gösterilir.

---

## FONKSİYON DETAYLARI

### SpotlightList

**Ne yapar**: SpotlightList, React functional component yapısında tanımlı bir UI bileşenidir ve projede spot ışığı efektli bir liste gösterimi sağlamakla görevlidir.

**Nasıl yapar**: React.FC (Functional Component) dönüş tipiyle tanımlanmıştır. Bu yapı, React'ın modern fonksiyonel bileşen paradigmına uygun olarak state ve lifecycle yönetimini hooks ile gerçekleştirir.

**Parametreler**:

- Bu fonksiyon dışarıdan parametre almamaktadır.

**Dönüş**: `React.FC` — React Functional Component dönüş tipi ile bir JSX elementi döndürür.

### onMove
**Ne yapar**: SpotlightList bileşeni içinde tanımlanan, fare hareketi olaylarını yöneten özel React olay işleyicisidir. İlgili HTML div elemanı üzerinde gerçekleşen fare taşıma, sürükleme gibi etkileşimleri algılayıp bu etkileşimlere uygun olarak liste görünümünü veya liste öğelerinin konumunu güncellemekle sorumludur. Kullanıcıların liste öğeleriyle etkileşim kurmasını sağlayan temel işlevlerden biridir.
**Nasıl yapar**: Tetiklendiği fare olayı nesnesinin içerdiği tüm verileri okuyarak, olayın gerçekleştiği konum, kaynak eleman gibi bilgileri işler. Elde ettiği verileri SpotlightList bileşeninin yerel state'ine yansıtarak ilgili görsel veya mantıksal güncellemeleri tetikler. React'in standart olay yönetimi prensiplerine uygun olarak çalışarak, gerektiğinde olay varsayılanlarını engellemek veya olayın üst elemanlara yayılmasını durdurmak gibi ek işlemler de gerçekleştirebilir.
**Parametreler**:
- e: React.MouseEvent<HTMLDivElement> — Fare hareketi olayının tüm detaylarını barındıran olay nesnesidir. Olayın tetiklendiği HTML div elemanı, fare imlecinin ekrandaki konumu, basılı tuşlar gibi tüm etkileşim verilerini içerir.
**Dönüş**: `React.MouseEventHandler<HTMLDivElement>` türünde çalıştırılabilir bir olay işleyicisi döndürür. Bu dönen işleyici, ilgili div elemanının fare hareketi olaylarına yanıt olarak tetiklenebilir hale gelir, liste üzerindeki tüm fare tabanlı etkileşimlerin doğru şekilde yönetilmesini sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/SpotlightList.tsx`::SpotlightList (bileşen gövdesi)
- **params**: (parametre yok — anonim arrow function, React.FC olarak döner)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; bileşen içindeki tüm metinlerin çevirisi için kullanılır
  - `ref` — `useRef<HTMLDivElement | null>(null)`, spotlight grid konteynerinin DOM referansı; `onMove` handler'ında `getBoundingClientRect()` ile pozisyon hesaplamak ve CSS custom property'leri ayarlamak için kullanılır
  - `ITEMS` — Spotlight kartlarının sabit dizisi (`as const` ile tip daraltılmış); her eleman `{ title, desc, href }` şeklindedir; JSX'te `.map()` ile döngüye alınarak `<a>` kartları render edilir
  - `onMove` — `React.MouseEventHandler<HTMLDivElement>` tipinde event handler; fare hareketinde CSS custom property'leri `--sx` ve `--sy` olarak ayarlar; JSX'te div'in `onMouseMove` prop'una bağlanır
- **Dönüş**: JSX — `<section>` elemanı; başlık, altyazı ve 4 spotlight kartından oluşan grid yapısı döner

---

### [N2_NASIL] AST Pointer: `src/components/SpotlightList.tsx`::onMove
- **params**:
  - `e` — `React.MouseEvent<HTMLDivElement>`, fare hareketi event nesnesi; `e.clientX` ve `e.clientY` ile fare koordinatları okunur
- **ic_degiskenler**:
  - `el` — `ref.current` değerinin atanması; spotlight grid konteynerinin DOM elementi; null kontrolü yapıldıktan sonra üzerinde `getBoundingClientRect()` ve `style.setProperty()` çağrıları yapılır; null ise fonksiyon erken return ile çıkar
  - `rect` — `el.getBoundingClientRect()` sonucu; elementin viewport'a göre pozisyon (`left`, `top`) ve boyut (`width`, `height`) bilgilerini içerir; fare pozisyonunun yüzdesel hesaplamasında kullanılır
  - `x` — `((e.clientX - rect.left) / rect.width) * 100` formülü ile hesaplanan fare pozisyonunun yatay yüzdesi; `--sx` CSS custom property'sine `%` birimi ile atanır
  - `y` — `((e.clientY - rect.top) / rect.height) * 100` formülü ile hesaplanan fare pozisyonunun dikey yüzdesi; `--sy` CSS custom property'sine `%` birimi ile atanır
- **Dönüş**: yok (void) — yan etki olarak `el.style.setProperty('--sx', ...)` ve `el.style.setProperty('--sy', ...)` çağrılır; bu CSS custom property'leri JSX'teki radial-gradient overlay'ini fare pozisyonuna göre hareket ettirir

---

### [N3_NASIL] AST Pointer: `src/components/SpotlightList.tsx`::map callback (it)
- **params**:
  - `it` — `ITEMS` dizisinin bir elemanı; `{ title: string, desc: string, href: string }` yapısındadır; `title` kart başlığı, `desc` kart açıklama metni, `href` tıklama yönlendirme rotası
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<a>` anchor elemanı; `it.title` hem `key` prop'u hem kart başlığı olarak, `it.desc` kart açıklama metni olarak, `it.href` yönlendirme linki olarak kullanılır; hover'da `shadow-md` efekti veren stillendirilmiş kart render edilir

---

## NODE ID STANDARD

  file: src\components\SpotlightList.tsx
  function: src\components\SpotlightList.tsx::SpotlightList
  function: src\components\SpotlightList.tsx::onMove

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpotlightList

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `border-light-gray`, `md:text-3xl`, `text-2xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xs`
- **Layout:** `absolute`, `gap-3`, `grid`, `grid-cols-1`, `hover:shadow-md`, `lg:grid-cols-4`, `max-w-7xl`, `p-4`, `relative`, `sm:grid-cols-2`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-semibold`, `inset-0`, `lg:px-8`, `mb-4`, `mt-1`, `mx-auto`, `pointer-events-none`, `px-4`, `py-8`, `rounded-2xl`, `rounded-xl`, `sm:px-6`, `transition`