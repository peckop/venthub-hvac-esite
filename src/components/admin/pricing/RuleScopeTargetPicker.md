---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\pricing\RuleScopeTargetPicker.tsx
skeleton_hash: b1935d9f1f895f0f
entity_hashes:
  func:RuleScopeTargetPicker: f4ade92279a11a9a
  overview: 2f50bfc7ddc59a2a
  style_tokens: 28af80a09e6e7523
generated_at: 2026-08-14T09:14:32Z
---

## Genel Bakış
RuleScopeTargetPicker, fiyatlandırma kurallarının hangi kapsam (scope) hedeflerine uygulanacağını seçen bir React bileşenidir. Seçilen kapsam türüne göre dinamik bir arayüz sunarak, kullanıcıya kuralların hedef kitlesini (örn. tüm ürünler, belirli bir kategori veya ürün grubu) tanımlama imkanı verir.

## Fonksiyon Grupları
### Kapsam Hedefi Seçim Arayüzü
Bileşen, üst seviyeden gelen kapsam türüne (scope) bağlı olarak uygun hedef seçici arayüzünü (örneğin dropdown, çoklu seçim listesi) oluşturur ve kullanıcının seçtiği hedefi yönetir.
- RuleScopeTargetPicker

### Bileşen Durumu ve İletişim Yönetimi
Bileşen, kontrollü (controlled) bir bileşen olarak çalışır; üst bileşenden gelen değer ve durum bilgilerini (seçili değer, devre dışı bırakma, hata) yönetir ve seçim değişimlerini üst bileşene bildirir.
- scope, value, onChange, disabled, error parametreleri bu yönetim için kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşeni olup `scope`, `value` ve `onChange` zorunlu props'larına dayanır. Aşağıdaki varsayımlar fonksiyon imzasından türetilmiştir.

---

**[Aksiyom 1 – Zorunlu Prop Bağımlılığı]:** Eğer `scope` prop'u sağlanmazsa, bileşen hangi kapsam hedeflerini göstereceğini bilemez ve doğru render edilemez.

**[Aksiyom 2 – Zorunlu Prop Bağımlılığı]:** Eğer `value` prop'u sağlanmazsa, bileşen hangi değerin seçili olduğunu bilemez ve kontrolsüz (uncontrolled) bir bileşen haline gelir; bu durum bileşenin amacına aykırıdır.

**[Aksiyom 3 – Callback Bağımlılığı]:** Eğer `onChange` prop'u sağlanmazsa, kullanıcı hedef seçimini değiştirdiğinde üst bileşene bildirim yapılamaz; bileşen işlevsel olarak izole kalır.

**[Aksiyom 4 – Disabled Varsayılanı]:** `disabled` prop'u açıkça `true` olarak verilmediği sürece (`false` varsayılanı ile), bileşen etkileşime açık olarak çalışır.

**[Aksiyom 5 – Error Gösterim Koşulu]:** `error` prop'u `null` (varsayılan) olmadığında, bileşen hata durumunu görsel olarak göstermelidir; `null` olduğunda hata gösterimi yapılmaz.

---

> **Not:** Bileşenin gövdesi (function body) paylaşılmadığından, hangi `scope` değerlerinin desteklendiği, `value`'nun beklenen veri tipi veya iç mantık hakkında kesin çıkarım yapılamamıştır. Yukarıdaki aksiyomlar yalnızca fonksiyon imzasından türetilen minimum zorunlulukları ifade eder.

---

## FONKSİYON DETAYLARI

### RuleScopeTargetPicker

**Ne yapar**: Admin pricing modülünde bir fiyatlandırma kuralının (pricing rule) kapsam hedefinin (scope target) seçilmesini sağlayan React bileşenidir. Kullanıcının mevcut kapsam türüne göre uygun hedefleri seçmesine olanak tanır.

**Nasıl yapar**: Fonksiyonel bir React bileşenidir (React.FC). Props olarak aldığı `scope` değerine bağlı olarak hangi hedeflerin sunulacağını belirler. Seçim değişikliklerini üst bileşene `onChange` callback'i aracılığıyla iletir. `disabled` prop'u ile pasif duruma getirilebilir, `error` prop'u ile validasyon hataları gösterilebilir.

**Parametreler**:
- `scope` — Seçili kapsam türünü belirten değer. Kapsam türüne bağlı olarak bileşen内部hangi hedef seçeneklerin sunulacağını kontrol eder.
- `value` — Bileşenin controlled olarak yönettiği mevcut seçili hedef değeri.
- `onChange` — Kullanıcı yeni bir hedef seçtiğinde çağrılan geri çağırma fonksiyonu (callback). Seçilen yeni değeri üst bileşene iletir.
- `disabled` — `boolean` türünde, varsayılan değeri `false`. Bileşenin etkileşim dışı bırakılıp bırakılmayacağını belirler. `true` olduğunda kullanıcı bileşen üzerinde seçim yapamaz.
- `error` — `string | null` türünde, varsayılan değeri `null`. Bileşen altında gösterilecek hata mesajını taşır. `null` olduğunda hata gösterilmez.

**Dönüş**: `React.FC<RuleScopeTargetPickerProps>` — Tipi tanımlanmış React fonksiyonel bileşeni. Bileşen, kapsam türüne göre filtrelenmiş hedef seçim arayüzü render eder.

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

### [N1_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::RuleScopeTargetPicker
- **params**: (scope, value, onChange, disabled = false, error = null)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu
  - `brands` — useState: Marka listesi state'i (BrandOption[]), scope 2 için supabase'den yüklenir
  - `categories` — useState: Kategori listesi state'i (CategoryOption[]), scope 3 için supabase'den yüklenir
  - `term` — useState: Ürün arama terimi input değeri
  - `results` — useState: Arama sonuçları listesi (ProductOption[])
  - `searching` — useState: Arama devam ediyor mu flag'i (boolean)
  - `selectedProduct` — useState: Seçili ürün nesnesi veya null (ProductOption | null)
  - `errorText` — Hata mesajını JSX olarak formatlayan değişken; error prop'u varsa `<p>` elemanı, yoksa null
- **Dönüş**: JSX — scope değerine göre koşullu render:
  - `scope === 4`: null (hiçbir şey render etmez)
  - `scope === 2`: Marka select dropdown UI
  - `scope === 3`: Kategori select dropdown UI
  - `scope === 0` veya `1`: Ürün arama input + sonuç listesi UI

### [N2_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-2-brands]
- **params**: () => cleanup fonksiyonu
- **ic_degiskenler**:
  - `alive` — Cleanup flag'i: bileşen unmount edildiğinde state güncellemesini engeller
- **Dönüş**: cleanup fonksiyonu (alive = false)

### [N3_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-2-brands]::async
- **params**: () => Promise<void>
- **ic_degiskenler**: (yok)
- **Dönüş**: void — supabase'den brands tablosunu çeker, `setBrands(data)` ile state'i günceller

### [N4_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-2-brands]::cleanup
- **params**: () => void
- **ic_degiskenler**: (yok)
- **Dönüş**: void — alive flag'ini false yapar

### [N5_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-3-categories]
- **params**: () => cleanup fonksiyonu
- **ic_degiskenler**:
  - `alive` — Cleanup flag'i: bileşen unmount edildiğinde state güncellemesini engeller
- **Dönüş**: cleanup fonksiyonu (alive = false)

### [N6_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-3-categories]::async
- **params**: () => Promise<void>
- **ic_degiskenler**: (yok)
- **Dönüş**: void — supabase'den categories tablosunu çeker, `setCategories(data)` ile state'i günceller

### [N7_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-3-categories]::cleanup
- **params**: () => void
- **ic_degiskenler**: (yok)
- **Dönüş**: void — alive flag'ini false yapar

### [N8_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-0-1-selectedProduct]
- **params**: () => cleanup fonksiyonu
- **ic_degiskenler**:
  - `alive` — Cleanup flag'i: bileşen unmount edildiğinde state güncellemesini engeller
- **Dönüş**: cleanup fonksiyonu (alive = false)

### [N9_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-0-1-selectedProduct]::async
- **params**: () => Promise<void>
- **ic_degiskenler**: (yok)
- **Dönüş**: void — supabase'den products tablosunda value ID'li ürünü çeker, `setSelectedProduct(data)` ile state'i günceller

### [N10_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[scope-0-1-selectedProduct]::cleanup
- **params**: () => void
- **ic_degiskenler**: (yok)
- **Dönüş**: void — alive flag'ini false yapar

### [N11_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[search-debounce]
- **params**: () => cleanup fonksiyonu
- **ic_degiskenler**:
  - `needle` — term'in trim edilmiş hali: arama terimi
  - `alive` — Cleanup flag'i: timer callback'inde state güncellemesini engeller
  - `timer` — setTimeout ID'si: debounce için zamanlayıcı referansı
- **Dönüş**: cleanup fonksiyonu (alive = false, clearTimeout(timer))

### [N12_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[search-debounce]::timeoutCallback
- **params**: () => void
- **ic_degiskenler**: (yok)
- **Dönüş**: void — async arama işlemini başlatır

### [N13_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[search-debounce]::asyncSearch
- **params**: () => Promise<void>
- **ic_degiskenler**:
  - `pattern` — ILIKE sorgusu için wildcards eklenmiş arama deseni (örn: "%iphone%")
- **Dönüş**: void — supabase'den products tablosunda name/sku alanlarında arama yapar, `setResults(data ?? [])` ve `setSearching(false)` ile state'leri günceller

### [N14_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::useEffect[search-debounce]::cleanup
- **params**: () => void
- **ic_degiskenler**: (yok)
- **Dönüş**: void — alive flag'ini false yapar ve timer'ı temizler

### [N15_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::pickProduct
- **params**: (product: ProductOption)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — selectedProduct state'ini product'a, term'i boş string'e, results'ı boş array'e set eder; onChange(product.id) çağırarak üst bileşene bildirir

### [N16_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::clearProduct
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void — selectedProduct'ı null'a, term'i boş string'e, results'ı boş array'e set eder; onChange(null) çağırarak seçimi temizler

### [N17_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::mapBrands
- **params**: (b: BrandOption)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<option>` elemanı — b.id value, b.name görünür metin olarak marka seçeneği render eder

### [N18_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::mapCategories
- **params**: (c: CategoryOption)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<option>` elemanı — c.id value, c.name görünür metin olarak kategori seçeneği render eder

### [N19_NASIL] AST Pointer: RuleScopeTargetPicker.tsx::mapResults
- **params**: (p: ProductOption)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<li>` elemanı — p.name ve pSKU bilgileri ile arama sonucu satırı render eder, pickProduct(p) onClick handler'ı bağlar

---

## NODE ID STANDARD

  file: src\components\admin\pricing\RuleScopeTargetPicker.tsx
  function: src\components\admin\pricing\RuleScopeTargetPicker.tsx::RuleScopeTargetPicker

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
- **Renkler:** `bg-cyan-400/5`, `border-cyan-400/20`, `border-white/10`, `focus-visible:bg-white/5`, `hover:bg-white/10`, `hover:bg-white/5`, `hover:text-white`, `text-cyan-400`, `text-left`, `text-rose-400`, `text-slate-400`, `text-slate-500`, `text-sm`, `text-white`, `text-xs`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `flex`, `gap-3`, `items-center`, `left-4`, `max-h-60`, `overflow-y-auto`, `p-1`, `relative`, `right-4`, `top-1/2`, `w-full`
- **Varyant/Responsive:** `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-translate-y-1/2`, `animate-spin`, `border`, `divide-white/5`, `divide-y`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/40`, `font-black`, `font-bold`, `font-mono`, `glass`, `leading-relaxed`, `ml-auto`, `mt-1`