---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\EditableCell.tsx
skeleton_hash: df7dad40afd16a13
entity_hashes:
  func:EditableCell: c69e143b78ab0750
  overview: afceb79d7ede9415
  style_tokens: 2f2ada2707ada249
generated_at: 2026-05-29T18:44:07Z
---

## Genel Bakış
`EditableCell`, yönetim paneli tablolarındaki hücrelerin tıklanarak düzenlenebilir hale getirilmesini sağlayan bir React bileşenidir. Değer, veri tipi ve yer tutucu gibi yapılandırma parametreleri alarak hücrenin görünümünü ve davranışını kontrol eder; düzenleme işlemi tamamlandığında kaydetme çağrısı ile değişiklikleri üst bileşene iletir.

## Fonksiyon Grupları
### Düzenlenebilir Hücre Bileşeni
Bu modül, tek bir kapsamlı bileşenden oluşur ve tablo hücrelerinin görüntülenmesi, düzenleme moduna geçişi ile değişikliklerin kaydedilmesi süreçlerini yönetir.
- EditableCell

---

## AXIOMS – Mimari Varsayımlar

Bu modül için varsayımlar, EditableCell bileşeninin doğru çalışması için zorunlu koşulları belirtir.

[Axiom 1]: Eğer onSave callback fonksiyonu sağlanmamışsa veya çağrılamıyorsa, kullanıcı düzenlemeleri kaydedemez ve hata oluşur.

[Axiom 2]: Eğer type parametresi geçerli bir HTML input type değeri (örn: text

---

## FONKSİYON DETAYLARI

### EditableCell
**Ne yapar**: EditableCell, kullanıcının bir hücredeki değeri düzenlemesine ve kaydetmesine olanak tanıyan bir React fonksiyonel bileşenidir. Inline düzenleme işlevselliği sağlar.

**Nasıl yapar**: Bileşen, `value`, `onSave`, `type`, `placeholder` ve `clas` prop'larını alır. `type` değerine göre uygun bir giriş elemanı (input, select vb.) render eder. Kullanıcı düzenleme işlemini tamamladığında `onSave` callback'ini tetikler. `placeholder`, değer boşken gösterilecek metni belirler. `clas` prop'u bileşene ek CSS sınıfları atamak için kullanılır.

**Parametreler**:
- `value`: any — Hücrede gösterilecek ve düzenlenecek olan mevcut değer.
- `onSave`: function — Kullanıcı değişikliği kaydettiğinde çağrılan geri çağrı fonksiyonu. Yeni değeri parametre olarak alır.
- `type`: string (varsayılan `'text'`) — Giriş elemanının türü (text, number, select vb.).
- `placeholder`: string (varsayılan `'-'`) — Değer boş veya tanımsız olduğunda gösterilen yer tutucu metin.
- `clas`: string — Bileşene uygulanacak ek CSS sınıf adı.

**Dönüş**: `React.FC<EditableCellProps>` — `EditableCellProps` arayüzüne sahip prop'lar bekleyen bir React fonksiyonel bileşeni döndürür. Bu bileşen, hücre düzenleme arayüzünü oluşturmak için kullanılır.

---

## INTERFACES

### EditableCellProps
- `value: string | number`
- `onSave: (newValue: string) => Promise<void>`
- `type?: 'text' | 'number'`
- `placeholder?: string`
- `className?: string`
- `disabled?: boolean`
- `inputWidth?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: EditableCell.tsx::EditableCell
- **params**: `value` — hücre mevcut değeri; `onSave` — async callback, düzenlenmiş değeri kaydetmek için çağrılır; `type` — input türü (varsayılan `'text'`); `placeholder` — değer boşsa gösterilen yer tutucu (varsayılan `'-'`); `className` — dışarıdan ek CSS sınıfı (varsayılan `''`); `disabled` — düzenlemeyi devre dışı bırakıp bırakmayacağı (varsayılan `false`); `inputWidth` — input genişlik CSS sınıfı (varsayılan `'w-24'`)
- **ic_degiskenler**:
  - `editing` — `useState<boolean>` — hücrenin düzenleme modunda olup olmadığını tutar
  - `draft` — `useState<string>` — input'taki geçici düzenleme değeri; `value`'dan türetilir, kaydetmeye kadar yerel tutulur
  - `saving` — `useState<boolean>` — `onSave` çağrısının devam edip etmediğini takip eder, bitene kadar input devre dışı kalır
  - `inputRef` — `useRef<HTMLInputElement>` — input DOM elemanına erişim sağlar, düzenleme moduna girildiğinde odaklama ve seçim için kullanılır
  - `useEffect` (draft senkron) — `value` değiştiğinde ve düzenleme modunda değilken `draft`'ı yeni `value` ile senkronize eder
  - `useEffect` (focus) — `editing` `true` olduğunda input'a otomatik focus veselectAll yapar
  - `startEdit` — `useCallback` — disabled veya saving değilse draft'ı value'dan doldurur ve editing modunu açar
  - `cancel` — `useCallback` — draft'ı orijinal value'ya sıfırlar ve editing modunu kapatır
  - `save` — `useCallback(async)` — draft trimlenmiş hali ile orijinal value karşılaştırır; değişiklik yoksa sadece modu kapatır, varsa `onSave(trimmed)` çağırır, hata olursa toast gösterir ve eski değere döner
  - `handleKeyDown` — `useCallback` — Enter tuşunda `save()`, Escape tuşunda `cancel()` tetikler
- **Dönüş**: `JSX.Element` — editing modunda `div` içinde `input` + optional spinner; normal modda `button` ile hücre değeri veya placeholder gösterilir

### [N2_NASIL] AST Pointer: EditableCell.tsx::useEffect[draft-senkron]
- **params**: yok (useEffect callback)
- **ic_degiskenler**:
  - `editing` — dış scope'tan; düzenleme modunda olup olmadığı kontrol edilir
  - `value` — dış scope'tan; hücrenin güncel değeri, String'e çevrilerek draft'a yazılır
  - `setDraft` — dış scope'tan; draft state setter'ı
- **Dönüş**: yok (yan etki: `editing` false iken `draft`'ı `String(value ?? '')` ile günceller)

### [N3_NASIL] AST Pointer: EditableCell.tsx::useEffect[focus]
- **params**: yok (useEffect callback)
- **ic_degiskenler**:
  - `editing` — dış scope'tan; düzenleme modunda olup olmadığı kontrol edilir
  - `inputRef` — dış scope'tan; input DOM elemanı referansı
- **Dönüş**: yok (yan etki: editing true ve inputRef.current mevcutsa `focus()` ve `select()` çağırır)

### [N4_NASIL] AST Pointer: EditableCell.tsx::startEdit
- **params**: yok
- **ic_degiskenler**:
  - `disabled` — dış scope'tan; hücre devre dışıysa düzenleme başlatılmaz
  - `saving` — dış scope'tan; kaydetme devam ediyorsa düzenleme başlatılmaz
  - `value` — dış scope'tan; mevcut değer `String(value ?? '')` ile draft'a yazılır
  - `setDraft` — dış scope'tan; draft state setter'ı
  - `setEditing` — dış scope'tan; editing state setter'ı
- **Dönüş**: yok (yan etki: disabled/saving değilse draft'ı value ile doldurup editing modunu açar)

### [N5_NASIL] AST Pointer: EditableCell.tsx::cancel
- **params**: yok
- **ic_degiskenler**:
  - `value` — dış scope'tan; mevcut değer `String(value ?? '')` ile draft'a geri yazılır
  - `setDraft` — dış scope'tan; draft state setter'ı
  - `setEditing` — dış scope'tan; editing state setter'ı
- **Dönüş**: yok (yan etki: draft'ı orijinal value'ya sıfırlar ve editing modunu kapatır)

### [N6_NASIL] AST Pointer: EditableCell.tsx::save
- **params**: yok
- **ic_degiskenler**:
  - `draft` — dış scope'tan; input'taki mevcut düzenleme değeri, `.trim()` ile boşlukları temizlenir → `trimmed`
  - `trimmed` — `draft.trim()` sonucu; karşılaştırma ve kaydetme için kullanılacak temizlenmiş değer
  - `original` — `String(value ?? '')`; hücrenin orijinal değeri, karşılaştırma ve hata durumunda geri dönüş için kullanılır
  - `value` — dış scope'tan; orijinal hücre değeri
  - `onSave` — dış scope'tan; async kaydetme callback'i, `onSave(trimmed)` ile çağrılır
  - `setEditing` — dış scope'tan; editing state setter'ı
  - `setSaving` — dış scope'tan; saving state setter'ı
  - `toast` — `sonner` import'undan; hata durumunda `toast.error('Güncelleme başarısız')` gösterir
- **Dönüş**: yok (yan etki: değişiklik varsa `onSave(trimmed)` çağırır; hata olursa draft'ı orijinal değere sıfırlar ve hata toast'u gösterir; finally bloğunda saving'i false yapar)

### [N7_NASIL] AST Pointer: EditableCell.tsx::handleKeyDown
- **params**: `e` — `React.KeyboardEvent` — tuş olayı nesnesi
- **ic_degiskenler**:
  - `e.key` — basılan tuşun adı; `'Enter'` veya `'Escape'` kontrol edilir
  - `e.preventDefault` — varsayılan tarayıcı davranışını engeller
  - `save` — dış scope'tan; kaydetme fonksiyonu, Enter tuşunda tetiklenir (`void save()`)
  - `cancel` — dış scope'tan; iptal fonksiyonu, Escape tuşunda tetiklenir
- **Dönüş**: yok (yan etki: Enter → `save()`, Escape → `cancel()` çağırır; her iki durumda da `preventDefault()` ile varsayılan davranış engellenir)

---

## NODE ID STANDARD

  file: src\components\admin\EditableCell.tsx
  function: src\components\admin\EditableCell.tsx::EditableCell

---

## DISA AKTARILANLAR (EXPORTS)
  export: EditableCell

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-transparent`, `border-2`, `border-b`, `border-dashed`, `border-primary-navy`, `border-primary-navy/30`, `border-slate-300`, `border-t-primary-navy`, `hover:border-primary-navy`, `hover:text-primary-navy`, `text-left`, `text-slate-400`, `text-sm`
- **Layout:** `gap-1`, `h-3.5`, `inline-block`, `inline-flex`, `items-center`, `p-0`, `w-3.5`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${className`, `${inputWidth`, `animate-spin`, `border`, `cursor-pointer`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-1`, `focus-visible:ring-primary-navy/50`, `px-1.5`, `py-0.5`, `rounded`, `rounded-full`, `transition-colors`