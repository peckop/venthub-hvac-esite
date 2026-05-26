---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BentoGrid.tsx
skeleton_hash: 976b573fe52900a7
generated_at: 2026-05-23T21:55:35Z
---

## Genel Bakış
`BentoGrid` bileşeni, `BentoCard` kartlarını kullanarak esnek ve yanıt veren bir ızgara düzeni sunar. Kartlar farklı boyutlarda görüntülenerek içerik öğeleri (başlık, resim, video vb.) düzenli bir şekilde yerleştirilir ve kullanıcı arayüzünde görsel olarak çekici bir sunum sağlanır.

## Fonksiyon Grupları
### Kart Tanımı
Bu grup, tek bir öğeyi görsel bir kart olarak nasıl gösterileceğini tanımlar.  
- BentoCard

### Izgara Düzeni ve Yerleştirme
Bu grup, kartların nasıl düzenleneceği ve ızgara içinde nasıl konumlandırılacağına ilişkin mantığı içerir.  
- BentoGrid

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer BentoCard'a **item** prop'u verilmezse, içeriği render edilemez ve hata veya boş görüntü oluşur.  
[Aksiyom 2]: Eğer BentoCard'a **large** prop'u verilmezse, large değeri `undefined` olur ve boyutlandırma mantığı beklenmedik şekilde çalışabilir.  
[Aksiyom 3]: Eğer BentoGrid'e **BentoCard olmayan** çocuklar verilmişse, ızgara stilleri beklendiği gibi uygulanmayabilir.  
[Aksiyom 4]: Eğer BentoGrid'e **hiç çocuk** verilmezse, boş bir konteyner render edilir ve hiç kart görünmez.

---

## FONKSIYON DETAYLARI

### BentoCard
**Ne yapar**: Verilen `BentoItem` verisini bir kart olarak render eder; `large` bayrağı true olduğunda kartı daha büyük boyutta gösterir.  
**Nasıl yapar**: Fonksiyon, `item` özelliğinden gelen başlık, açıklama ve görsel gibi verileri içeren bir JSX yapısı döndürür; `large` varsa stil sınıfına ekstra bir sınıf ekleyerek boyutu artırır.  
**Parametreler**:
- item: BentoItem — Kartın içeriğini belirleyen veri nesnesi (başlık, açıklama, ikon vb.)
- large: boolean — Kartın genişletilmiş görünüm için kullanılan opsiyonel bayrak  
**Dönüş**: React.FC — JSX elementi döndüren bir React fonksiyon bileşeni.

### BentoGrid
**Ne yapar**: Ana sayfada kategoriler ve uygulama alanlarını görsel bir ızgara düzeninde sunar.  
**Nasıl yapar**: Sabit bir veri listesini (kategori başlıkları, açıklamalar ve ikonlar) harita üzerinden dönerek her biri için `BentoCard` bileşenini render eder; büyük kartlar için `large` prop’u belirli öğelerde true olarak geçirilir.  
**Parametreler**: (yok)  
**Dönüş**: React.FC — JSX elementi döndüren bir React fonksiyon bileşeni.

---

## INTERFACES

### BentoItem
- `title: string`
- `subtitle?: string`
- `image: string`
- `video?: string`
- `topic?: string | null`
- `hrefProducts?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/BentoGrid.tsx::BentoCard
- **params**: item, large
- **ic_degiskenler**:
  - `t` — translation function from useI18n used for localized strings.
  - `videoRef` — ref to HTMLVideoElement for controlling video playback.
  - `mounted` — boolean state indicating component has mounted.
  - `setMounted` — setter function for mounted state.
  - `isCoarse` — boolean indicating if primary input is coarse touch (pointer: coarse) used to disable video hover on touch devices.
- **Dönüş**: JSX element (React component rendering a Bento card).

### [N2_NASIL] AST Pointer: src/components/BentoGrid.tsx::useEffect callback
- **params**: (none)
- **ic_degiskenler**: (none)
- **Dönüş**: yok (sets mounted state to true).

### [N3_NASIL] AST Pointer: src/components/BentoGrid.tsx::BentoGrid
- **params**: (none)
- **ic_degiskenler**:
  - `t` — translation function from useI18n used for localized strings.
  - `items` — array of BentoItem objects containing gallery items data (title, subtitle, image, video, topic, hrefProducts).
- **Dönüş**: JSX element (React component rendering the Bento grid section).

---

## NODE ID STANDARD

  file: src\components\BentoGrid.tsx
  function: src\components\BentoGrid.tsx::BentoCard
  function: src\components\BentoGrid.tsx::BentoGrid

---

## DISA AKTARILANLAR (EXPORTS)
  export: BentoCard
  export: BentoGrid

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `auto-rows-[140px]`, `md:auto-rows-[180px]`, `sm:auto-rows-[160px]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `bg-white/20`, `bg-white/90`, `border-light-gray`, `from-black/50`, `md:text-3xl`, `text-2xl`, `text-industrial-gray`, `text-lg`, `text-sm`, `text-steel-gray`, `text-white`, `text-white/90`, `text-xs`, `to-transparent`
- **Layout:** `absolute`, `bottom-3`, `drop-shadow`, `flex`, `flex-col`, `from-black/50`, `gap-2`, `gap-3`, `grid`, `grid-cols-2`, `group-hover:opacity-100`, `h-full`, `inline-flex`, `items-center`, `left-3`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
