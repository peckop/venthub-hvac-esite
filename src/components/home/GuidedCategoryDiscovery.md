---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\GuidedCategoryDiscovery.tsx
skeleton_hash: 8963a76c7b2fd7c8
entity_hashes:
  func:GuidedCategoryDiscovery: 3b7f2bdef4872624
  overview: cc60fb76dc1f398d
  style_tokens: ba1e7efd5f41a7fe
generated_at: 2026-06-14T21:14:41Z
---

## Genel Bakış
Bu modül, ana sayfada kullanıcılara yönelik rehberli bir kategori keşfi deneyimi sunan tek bir React bileşeninden oluşur. Bileşen, dışarıdan beslenen bir kategori listesini (displayCategories) alır ve bu listeyi kullanarak ürünleri görsel ve metin tabanlı bir arayüzde sunarak kullanıcıları bilgilendirir.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve merkezi birimini oluşturarak, verilen kategori verisini kullanıcıya sunulan interaktif ve yönlendirici bir arayüze dönüştürür.
- GuidedCategoryDiscovery

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmediğinden, aksiyom üretilememektedir. Dolayısıyla, bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### GuidedCategoryDiscovery
**Ne yapar**: `displayCategories` prop’u ile sağlanan kategori listesini kullanarak, kullanıcıya yönlendirilmiş kategori keşfi arayüzünü render eden bir React bileşenidir.  
**Nasıl yapar**: Bileşen, `displayCategories` prop’unun varsayılan değerini boş bir dizi olarak alır; bu diziyi içeri harita yaparak her kategori için uygun görsel ve metin öğelerini oluşturur ve JSX döndürür. Prop tipi `GuidedCategoryDiscoveryProps` ile tip güvenliği sağlanır.  
**Parametreler**:
- displayCategories: [] — Gösterilecek kategori nesnelerinin dizisi; belirtilmezse boş dizidir.  
**Dönüş**: React.FC<GuidedCategoryDiscoveryProps> — Render edilmesi gereken kullanıcı arayüzünü tanımlayan fonksiyonel bileşen.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/routes::Routes
- import: @/utils/imageUtils::normalizeImageUrl
- import: next/image::Image
- import: next/link::Link
- import: react::React

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
- **params**: ( { displayCategories = [] } )
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, sayfadaki metinleri lokalize etmek için kullanılır
- **Dönüş**: React elementi (section yapısı)

### [N2_NASIL] AST Pointer: src/components/home/GuidedCategoryDiscovery.tsx::(anonymous map callback)
- **params**: ( category, idx )
- **ic_degiskenler**:
  - `finalSrc` — normalizeImageUrl fonksiyonu ile hesaplanan, kategori görselinin nihai URL'i
  - `delayClass` — idx mod 4'e göre belirlenen, animasyon gecikme sınıfı (delay-0, delay-100, delay-200, delay-300)
- **Dönüş**: React elementi (div yapısı)

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