---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ProductsHero.tsx
skeleton_hash: 1919306813c30043
entity_hashes:
  func:ProductsHero: 23bf6f05c6d119a9
  overview: 9bf8d11aa62d961e
  style_tokens: e2ac21d82aa84114
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış  
ProductsHero, ürün sayfasının üst kısmında yer alan arama çubuğu ve başlık bileşenini oluşturan bir React fonksiyonel bileşendir. Kullanıcı arama girdisini kontrol eder, değişiklikleri üst bileşene iletir ve referans üzerinden doğrudan DOM erişimi sağlar.

## Fonksiyon Grupları  
### UI ve Etkileşim  
Bu grup, bileşenin görsel düzenini ve kullanıcı etkileşimini yönetir.  
- ProductsHero  

Bu tek fonksiyon, arama alanının değerini alır, değişiklikleri `onSearchChange` ile geri bildirir ve `searchInputRef` ile DOM referansını sağlar. Bileşen, arama kutusunu ve başlık/alt başlık gibi statik metinleri render eder.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `searchValue` sağlanmazsa, arama kutusu boş gösterilir ve kullanıcı arama yapamaz.

**Aksiyom 2**: Eğer `onSearchChange` bir fonksiyon değilse veya tanımlı değilse, arama girdisi değiştiğinde hiçbir geri bildirim gerçekleşmez ve UI’da “debounce” ya da “live‑search” gibi davranışlar çalışmaz.

**Aksiyom 3**: Eğer `searchInputRef` bir geçerli React ref nesnesi (ör. `React.createRef()` ya da `useRef()`) değilse, dışarıdan bu input elemanına odaklanma / değer set etme gibi işlemler gerçekleştirilemez ve odak yönetimi hatalı olur.

**Aksiyom 4**: Eğer `searchValue` bir `string` tipinde değilse (ör. `null`, `undefined` veya başka bir tip), bileşen render sırasında tip hatası verir ve UI’da arama kutusunun değeri gösterilemez.

**Aksiyom 5**: Eğer `onSearchChange` fonksiyonu, beklenen imzaya (ör. `(event: React.ChangeEvent<HTMLInputElement>) => void`) uymuyorsa, arama kutusundaki değişiklikler doğru şekilde işlenmez ve uygulama mantığı bozulur.

**Aksiyom 6**: Eğer `searchInputRef` sağlanmazsa, bileşen içinde `ref` üzerinden doğrudan DOM elemanına erişim (ör. `focus()`) mümkün olmaz; bu da otomatik odaklama gibi özelliklerin çalışmamasına yol açar.

---

## FONKSİYON DETAYLARI

### ProductsHero
**Ne yapar**: Ürünler sayfasının üst kısmında yer alan hero bölümü oluşturur; koyu lacivert bir degrade, endüstriyel arka plan görseli ve beyaz bir arama çubuğu içerir.  

**Nasıl yapar**: Gelen `searchValue`, `onSearchChange` ve `searchInputRef` propslarını kullanarak arama çubuğunu kontrol eder, stil ve görselleri LCP (Largest Contentful Paint) optimizasyonuna uygun şekilde ayarlar ve JSX içinde hero tasarımını render eder.  

**Parametreler**:
- `searchValue`: string — Arama giriş alanının mevcut değeri.
- `onSearchChange`: (event: React.ChangeEvent\<HTMLInputElement\>) => void — Arama metni değiştiğinde tetiklenen geri çağırma fonksiyonu.
- `searchInputRef`: React.RefObject\<HTMLInputElement\> — Arama girişine doğrudan erişim sağlamak için kullanılan ref nesnesi.

**Dönüş**: React.FC\<ProductsHeroProps\> — Tanımlanan props tipine sahip bir fonksiyonel React bileşeni.

---

## INTERFACES

### ProductsHeroProps
- `searchValue: string`
- `onSearchChange: (value: string) => void`
- `searchInputRef?: React.RefObject<HTMLInputElement>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsHero.tsx::ProductsHero
- **params**: (searchValue, onSearchChange, searchInputRef)
- **ic_degiskenler**:
  - `t` — `useI18n` hook'undan alınan çeviri fonksiyonu; UI metinlerini yerelleştirmek için kullanılır
- **Dönüş**: React.ReactElement (JSX)

---

## NODE ID STANDARD

  file: src\components\products\ProductsHero.tsx
  function: src\components\products\ProductsHero.tsx::ProductsHero

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsHero

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-surface-navy`, `bg-transparent`, `bg-white`, `bg-white/10`, `border-0`, `from-surface-navy/80`, `group-focus-within:bg-cyan-400/10`, `group-focus-within:text-cyan-500`, `lg:text-5xl`, `md:text-4xl`, `md:text-lg`, `text-3xl`, `text-base`, `text-center`
- **Layout:** `absolute`, `drop-shadow-md`, `flex`, `flex-col`, `from-surface-navy/80`, `h-80`, `h-full`, `items-center`, `justify-center`, `left-4`, `max-w-3xl`, `max-w-xl`, `min-h-320px`, `overflow-hidden`, `relative`
- **Varyant/Responsive:** `focus-visible:`, `focus-within:`, `group-focus-within:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `blur-xl`, `focus-visible:outline-none`, `focus-within:ring-2`, `focus-within:ring-cyan-400/50`, `font-bold`, `group`, `inset-0`, `mb-8`, `md:py-24`, `mt-4`, `mx-auto`, `object-cover`, `opacity-20`, `opacity-40`, `pl-12`