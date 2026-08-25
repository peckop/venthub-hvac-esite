---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\admin\pricing\RuleScopeTargetPicker.tsx
skeleton_hash: e267c406eaf62bd0
entity_hashes:
  func:RuleScopeTargetPicker: f4ade92279a11a9a
  overview: 2f50bfc7ddc59a2a
  style_tokens: 44e70660b758686a
generated_at: 2026-08-25T07:25:11Z
---

## Genel Bakış

RuleScopeTargetPicker, bir fiyatlandırma kuralının kapsam ve hedef seçimini sağlayan bir React bileşenidir. Bileşen, kapsam bilgisine göre uygun hedef seçeneklerini sunar ve kullanıcı seçimini `onChange` geri çağırma fonksiyonu aracılığıyla üst bileşene iletir. Devre dışı bırakma ve hata gösterme desteği de içerir.

## Fonksiyon Grupları

### Bileşen Tanımı

Tek bir bileşenden oluşan modül, kural kapsam-hedef seçimi için kullanıcı arayüzü sağlar. `scope` prop'una bağlı olarak hedef seçeneklerini belirler, `value` ile mevcut seçimi görüntüler ve kullanıcı etkileşimlerini `onChange` üzerinden bildirir. `disabled` ve `error` prop'ları ile erişilebilirlik ve doğrulama desteği sunar.

- RuleScopeTargetPicker

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarım yapılabilmektedir.

[Aksiyom 1]: Eğer `scope` prop'u sağlanmazsa, bileşen hangi tür hedef seçimi yapacağını bilemez — bileşenin doğru çalışması beklenemez.

[Aksiyom 2]: Eğer `value` prop'u sağlanmazsa, bileşen mevcut seçimi gösteremez — controlled component davranışı bozulur.

[Aksiyom 3]: Eğer `onChange` prop'u sağlanmazsa, kullanıcı seçimi değiştirdiğinde üst bileşene bildirim yapılamaz — bileşen salt okunur hale gelir.

[Aksiyom 4]: Eğer `disabled` true olarak ayarlanmazsa, bileşen varsayılan olarak etkileşimlidir (default: `false`).

[Aksiyom 5]: Eğer `error` null'dan farklı bir değer sağlanırsa, bileşen hata durumunu kullanıcıya gösterir — null olduğunda hata gösterilmez (default: `null`).

---

## FONKSİYON DETAYLARI

### RuleScopeTargetPicker

**Ne yapar**: Kuralların (rules) kapsam ve hedef seçimi için kullanılan bir React bileşenidir. Kullanıcıya belirli bir kapsam (scope) bağlamında hedef değer seçtiren bir arayüz sunar. Fiyatlandırma kurallarının hangi alanlara uygulanacağını belirlemek amacıyla kullanılır.

**Nasıl yapar**: Bileşen, aldığı `scope` prop'una bağlı olarak uygun seçim arayüzünü render eder. `value` prop'u ile mevcut seçili değeri görüntüler, `onChange` callback'i aracılığıyla kullanıcı seçim yaptığında üst bileşeni bilgilendirir. `disabled` prop'u true olduğunda bileşen etkileşime kapatılır. `error` prop'u dolu bir string olarak geldiğinde hata mesajını kullanıcıya gösterir. Varsayılan olarak `disabled` false, `error` null değerindedir.

**Parametreler**:
- scope: `RuleScope` (veya ilgili kapsam tipi) — Kuralın uygulanacağı kapsam türünü belirtir. Seçilebilir hedeflerin bu kapsama göre filtrelenmesini sağlar.
- value: `RuleScopeTarget` (veya ilgili hedef tipi) — Seçili olan mevcut hedef değeri temsil eder.
- onChange: `(value: RuleScopeTarget) => void` — Kullanıcı yeni bir hedef seçtiğinde çağrılan callback fonksiyonudur. Seçilen yeni değeri parametre olarak alır.
- disabled: `boolean` — Bileşenin etkileşim dışı bırakılıp bırakılmayacağını kontrol eder. Varsayılan değeri `false`'dur.
- error: `string | null` — Gösterilecek hata mesajını içerir. Varsayılan değeri `null`'dur; null veya boş olmadığında hata mesajı kullanıcıya görüntülenir.

**Dönüş**: `React.FC<RuleScopeTargetPickerProps>` — `RuleScopeTargetPickerProps` arayüzüne uygun props alan bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminInputClass
- import: ../../../utils/adminUi::adminSelectClass
- import: ../../../utils/adminUi::adminSelectStyle
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::Loader2
- import: lucide-react::Search
- import: lucide-react::X
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### BrandOption
Kural kapsamının HEDEF seçicisi (scope ↔ hedef DB CHECK'inin UI karşılığı): 2 marka → marka listesi · 3 kategori → kategori listesi · 0/1 ürün → aramalı seçim. scope 4 (global) hedef almaz — bileşen hiçbir şey render etmez.
- `id: string`
- `name: string`

### CategoryOption
- `id: string`
- `name: string`

### ProductOption
- `id: string`
- `name: string`
- `sku: string`

### RuleScopeTargetPickerProps
- `scope: number`
- `value: string | null`
- `onChange: (targetId: string | null) => void`
- `disabled?: boolean`
- `error?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::RuleScopeTargetPicker
- **params**: `scope`, `value`, `onChange`, `disabled` (varsayılan: `false`), `error` (varsayılan: `null`)
- **ic_degiskenler**:
  - `t` — `useI8n()` kancasından alınan çeviri fonksiyonu; UI metinlerini yerelleştirmek için kullanılır
  - `brands` — `useState<BrandOption[]>([])` ile oluşturulan durum; marka listesini tutar
  - `setBrands` — `brands` durumunu güncelleyici fonksiyon
  - `categories` — `useState<CategoryOption[]>([])` ile oluşturulan durum; kategori listesini tutar
  - `setCategories` — `categories` durumunu güncelleyici fonksiyon
  - `term` — `useState('')` ile oluşturulan durum; ürün arama terimini tutar
  - `setTerm` — `term` durumunu güncelleyici fonksiyon
  - `results` — `useState<ProductOption[]>([])` ile oluşturulan durum; ürün arama sonuçlarını tutar
  - `setResults` — `results` durumunu güncelleyici fonksiyon
  - `searching` — `useState(false)` ile oluşturulan durum; arama yapılıp yapılmadığını gösteren boolean
  - `setSearching` — `searching` durumunu güncelleyici fonksiyon
  - `selectedProduct` — `useState<ProductOption | null>(null)` ile oluşturulan durum; seçili ürünü tutar
  - `setSelectedProduct` — `selectedProduct` durumunu güncelleyici fonksiyon
  - `alive` — useEffect cleanup fonksiyonu içinde bileşen hâlâ aktif mi diye kontrol eden boolean; asenkron işlemlerin iptalini sağlar
  - `data` — Supabase sorgularından dönen veri; marka, kategori veya ürün bilgilerini içerir
  - `needle` — `term.trim()` sonucu; arama teriminin boşluklardan arındırılmış hali
  - `pattern` — `needle`'dan türetilen LIKE deseni; `%` ve `,` karakterleri temizlenip `%` ile çevrelenir
  - `timer` — `setTimeout` ile oluşturulan zamanlayıcı kimliği; debounce mekanizması için kullanılır
  - `errorText` — `error` prop'u varsa hata mesajını gösteren JSX elementi, yoksa `null`
  - `b` — `brands.map()` içindeki her marka nesnesi; `b.id` ve `b.name` kullanılır
  - `c` — `categories.map()` içindeki her kategori nesnesi; `c.id` ve `c.name` kullanılır
  - `p` — `results.map()` içindeki her ürün nesnesi; `p.id`, `p.name` ve `p.sku` kullanılır
- **Dönüş**: `scope` değerine göre farklı JSX elementleri; `scope === 4` ise `null`, `scope === 2` ise marka seçici, `scope === 3` ise kategori seçici, diğer durumlarda ürün arama bileşeni

### [N2_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::useEffect (marka listesi)
- **params**: (yok — useEffect callback'i)
- **ic_degiskenler**:
  - `alive` — bileşen hâlâ aktif mi diye kontrol eden boolean; cleanup fonksiyonu `false` yapar
  - `data` — `supabase.from('brands').select('id, name').order('name')` sorgusundan dönen marka verisi
- **Dönüş**: cleanup fonksiyonu (`() => { alive = false }`)

### [N3_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::useEffect (kategori listesi)
- **params**: (yok — useEffect callback'i)
- **ic_degiskenler**:
  - `alive` — bileşen hâlâ aktif mi diye kontrol eden boolean; cleanup fonksiyonu `false` yapar
  - `data` — `supabase.from('categories').select('id, name').order('name')` sorgusundan dönen kategori verisi
- **Dönüş**: cleanup fonksiyonu (`() => { alive = false }`)

### [N4_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::useEffect (ürün geri yükleme)
- **params**: (yok — useEffect callback'i)
- **ic_degiskenler**:
  - `alive` — bileşen hâlâ aktif mi diye kontrol eden boolean; cleanup fonksiyonu `false` yapar
  - `data` — `supabase.from('products').select('id, name, sku').eq('id', value).maybeSingle()` sorgusundan dönen ürün verisi
- **Dönüş**: cleanup fonksiyonu (`() => { alive = false }`)

### [N5_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::useEffect (ürün araması)
- **params**: (yok — useEffect callback'i)
- **ic_degiskenler**:
  - `needle` — `term.trim()` sonucu; arama teriminin boşluklardan arındırılmış hali
  - `alive` — bileşen hâlâ aktif mi diye kontrol eden boolean; cleanup fonksiyonu `false` yapar
  - `timer` — `setTimeout` ile oluşturulan zamanlayıcı kimliği; 300ms gecikme için kullanılır
  - `pattern` — `needle`'dan türetilen LIKE deseni; `%` ve `,` karakterleri temizlenip `%` ile çevrelenir
  - `data` — `supabase.from('products').select('id, name, sku').is('deleted_at', null).or(...).order('name').limit(SEARCH_LIMIT)` sorgusundan dönen ürün verisi
- **Dönüş**: cleanup fonksiyonu (`() => { alive = false; clearTimeout(timer) }`)

### [N6_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::pickProduct
- **params**: `product` (tip: `ProductOption`)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `selectedProduct` durumunu `product` yapar, `term`'ü boşaltır, `results`'u boşaltır, `onChange(product.id)` çağırır

### [N7_NASIL] AST Pointer: src/components/admin/pricing/RuleScopeTargetPicker.tsx::clearProduct
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `selectedProduct` durumunu `null` yapar, `term`'ü boşaltır, `results`'u boşaltır, `onChange(null)` çağırır

---

## NODE ID STANDARD

  file: RuleScopeTargetPicker.tsx
  function: RuleScopeTargetPicker.tsx::RuleScopeTargetPicker

---

## DISA AKTARILANLAR (EXPORTS)
  export: RuleScopeTargetPicker

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-surface`, `border-admin-accent/30`, `border-admin-border`, `focus-visible:bg-admin-surface-2`, `hover:bg-admin-surface-2`, `hover:bg-admin-surface-3`, `hover:text-admin-fg`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-left`, `text-sm`, `text-xs`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `flex`, `gap-3`, `items-center`, `left-4`, `max-h-60`, `overflow-y-auto`, `p-1`, `relative`, `right-4`, `top-1/2`, `w-full`
- **Varyant/Responsive:** `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-translate-y-1/2`, `animate-spin`, `border`, `divide-admin-border`, `divide-y`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `font-bold`, `font-mono`, `font-semibold`, `leading-relaxed`, `ml-auto`, `mt-1`, `px-4`