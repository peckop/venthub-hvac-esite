---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\GuidedCategoryDiscovery.tsx
skeleton_hash: bb4c9176e8c993df
entity_hashes:
  func:GuidedCategoryDiscovery: 3b7f2bdef4872624
  overview: a1eb122d99c941ad
  style_tokens: ba1e7efd5f41a7fe
generated_at: 2026-06-07T20:34:31Z
---

## Genel Bakış
Bu modül, ana sayfada kullanıcılara yönlendirilmiş bir kategori keşfi deneyimi sunan bir React bileşenini tanımlar. Bileşen, dışarıdan gelen kategori listesini alarak görsel ve metin tabanlı bir arayüz oluşturur ve kullanıcıları farklı HVAC ürünleri hakkında bilgilendirir.

## Fonksiyon Grupları
### Bileşen Tanımları
Ana sayfada kategori keşfi arayüzünü oluşturarak ve kullanıcıya farklı HVAC ürün kategorilerini görsel ve metin öğeleriyle sunarak yönlendirici bir deneyim sağlar.
- GuidedCategoryDiscovery

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzalarından türetilebilen temel mimari varsayımlar tanımlanmıştır. `normalizeImageUrl` yardımcısının imzası verilmediğinden, ona ilişkin aksiyom belirlenememiştir.

**[Aksiyom 1]:** Eğer `displayCategories` bir array (`Array`) tipinde değilse, bileşen render sırasında hata verir veya beklenmedik davranış gösterir.
*Gerekçe:* Fonksiyon imzası `displayCategories = []` olarak tanımlıdır; varsayılan değer bir array olduğundan, prop'un da array olması beklenir.

**[Aksiyom 2]:** Eğer `displayCategories` boş array (`[]`) olarak kalırsa (prop hiç verilmezse veya boş geçilirse), bileşen "boş durum" (empty state) gösterimi sunmalıdır.
*Gerekçe:* Varsayılan değerin `[]` olarak ayarlanması, boş listenin geçerli ve ele alınması gereken bir durum olduğunu ima eder.

**[Aksiyom 3]:** Eğer `displayCategories` içindeki elemanlar `null` veya `undefined` değerler içerirse, bileşen bu elemanları render ederken hata alır.
*Gerekçe:* Fonksiyon imzasında elemanların filtrelenmesine veya null-check'e ilişkin bir zorunluluk belirtilmemiştir; bu nedenle array'in geçerli objelerden oluştuğu varsayılır.

**[Aksiyom 4]:** Eğer `displayCategories` herhangi bir prop olarak hiç geçirilmezse, bileşen `[]` (boş array) ile başlatılır ve kendi başına veri üretmez.
*Gerekçe:* Fonksiyon imzasında `displayCategories`'in供（sourcing）için bir mechanism tanımlanmamıştır; bileşen tamamen dışarıdan gelen veriye bağımlıdır (sunulan veriyi sunar, kendi başına fetch/db çağrısı yapmaz).

---

## FONKSİYON DETAYLARI

### GuidedCategoryDiscovery
**Ne yapar**: `displayCategories` prop’u ile sağlanan kategori listesini kullanarak, kullanıcıya yönlendirilmiş kategori keşfi arayüzünü render eden bir React bileşenidir.  
**Nasıl yapar**: Bileşen, `displayCategories` prop’unun varsayılan değerini boş bir dizi olarak alır; bu diziyi içeri harita yaparak her kategori için uygun görsel ve metin öğelerini oluşturur ve JSX döndürür. Prop tipi `GuidedCategoryDiscoveryProps` ile tip güvenliği sağlanır.  
**Parametreler**:
- displayCategories: [] — Gösterilecek kategori nesnelerinin dizisi; belirtilmezse boş dizidir.  
**Dönüş**: React.FC<GuidedCategoryDiscoveryProps> — Render edilmesi gereken kullanıcı arayüzünü tanımlayan fonksiyonel bileşen.

---

## INTERFACES

### CategoryViewModelLite
- `id: string`
- `slug: string`
- `displayName: string`
- `description: string`
- `image_url: string | null`

### GuidedCategoryDiscoveryProps
- `displayCategories?: CategoryViewModelLite[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/GuidedCategoryDiscovery.tsx::GuidedCategoryDiscovery
- **params**: (`displayCategories = []`)
- **ic_degiskenler**:
  (yok)
- **Dönüş**: JSX (React element) - Kategori kartlarını gösteren bölüm HTML'i

### [N2_NASIL] AST Pointer: src/components/home/GuidedCategoryDiscovery.tsx::(category, idx) => { ... }
- **params**: (`category`, `idx`)
- **ic_degiskenler**:
  - `finalSrc` — normalizeImageUrl ile elde edilen kategori görseli URL'si, FALLBACK_CATEGORY_IMAGE ile yedekleniyor
  - `delayClass` — idx modulo 4'e göre animasyon gecikme sınıfı (delay-0, delay-100, delay-200, delay-300)
- **Dönüş**: JSX (kategori kartı için React elementi)

---

## NODE ID STANDARD

  file: src\components\home\GuidedCategoryDiscovery.tsx
  function: src\components\home\GuidedCategoryDiscovery.tsx::GuidedCategoryDiscovery

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModelLite
  export: GuidedCategoryDiscovery

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-relaxed`, `tracking-hvac-tight`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `bg-slate-100`, `bg-slate-950`, `bg-slate-950/40`, `bg-white`, `bg-white/30`, `border-b`, `border-l`, `border-r`, `border-t`, `border-white/20`, `from-slate-950/80`, `group-hover:bg-cyan-500`, `group-hover:bg-slate-950/20`, `group-hover:border-cyan-500/50`
- **Layout:** `absolute`, `block`, `bottom-8`, `flex`, `flex-col`, `flex-shrink-0`, `from-slate-950/80`, `gap-4`, `gap-6`, `group-hover:max-h-24`, `group-hover:w-24`, `h-4`, `h-full`, `h-px`, `items-center`
- **Varyant/Responsive:** `data-[in-view=true]:`, `group-hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${delayClass`, `-translate-x-4`, `aspect-square`, `data-[in-view=true]:opacity-100`, `data-[in-view=true]:translate-x-0`, `data-[in-view=true]:translate-y-0`, `delay-200`, `delay-300`, `duration-1.5s`, `duration-500`, `duration-700`, `ease-out`, `font-bold`, `font-extralight`, `font-light`