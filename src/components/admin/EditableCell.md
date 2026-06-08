---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\EditableCell.tsx
skeleton_hash: 6bceb8c2f03611c7
entity_hashes:
  func:EditableCell: c69e143b78ab0750
  overview: e0ead7dc16886f70
  style_tokens: 2f2ada2707ada249
generated_at: 2026-06-08T10:08:36Z
---

## Genel Bakış
`EditableCell`, yönetim paneli tablolarındaki hücrelerin tıklanarak düzenlenebilir hale getirilmesini sağlayan bir React bileşenidir. Değer, veri tipi ve yer tutucu gibi yapılandırma parametreleri alarak hücrenin görünümünü ve davranışını kontrol eder; düzenleme işlemi tamamlandığında kaydetme çağrısı ile değişiklikleri üst bileşene iletir.

## Fonksiyon Grupları
### Düzenlenebilir Hücre Bileşeni
Bu modül, tek bir kapsamlı bileşenden oluşur ve tablo hücrelerinin görüntülenmesi, düzenleme moduna geçişi ile değişikliklerin kaydedilmesi süreçlerini yönetir.
- EditableCell

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşeni olup hücre düzenleme işlevi için aşağıdaki mimari varsayımları içerir.

[Aksiyom 1]: Eğer `value` prop'u sağlanmazsa, bileşen hücrede gösterilecek başlangıç değerini bilemez ve boş/undefined bir durum oluşur.

[Aksiyom 2]: Eğer `onSave` callback fonksiyonu sağlanmazsa, kullanıcı düzenlemeyi tamamladığında değişiklikler üst bileşene iletilemez ve veri kaybı oluşur.

[Aksiyom 3]: Eğer `type` parametresi geçerli bir input tipi (örn: 'text', 'number') değilse, tarayıcı varsayılan text input davranışı gösterir.

[Aksiyom 4]: Hücre tıklanarak düzenleme moduna geçilemezse, kullanıcı hücre değerini hiçbir zaman düzenleyemez ve bileşen salt okunur hale gelir.

[Aksiyom 5]: Eğer düzenleme modunda input alanı oluşturulamazsa (örn: odak yönetimi başarısız olursa), kullanıcı değişiklik yapamaz ve düzenleme akışı bozulur.

[Aksiyom 6]: Eğer `onSave` çağrısı başarısız olursa veya hata fırlatırsa, üst bileşen hatayı ele alamaz ve kullanıcıya geri bildirim verilemez.

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

### [N1_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::EditableCell
- **params**: (value, onSave, type, placeholder, className, disabled, inputWidth)
- **ic_degiskenler**:
    - `editing` — Düzenleme modunda olup olmadığını kontrol eden boolean state
    - `draft` — Düzenlenen değerin geçici olarak tutulduğu state
    - `saving` — Kaydetme işleminin devam edip etmediğini gösteren boolean state
    - `inputRef` — Input elementine referans tutan ref nesnesi
    - `startEdit` — Düzenleme moduna giriş fonksiyonu (useCallback ile memoize)
    - `cancel` — Düzenlemeyi iptal eden fonksiyon (useCallback ile memoize)
    - `save` — Değişiklikleri kaydeden async fonksiyon (useCallback ile memoize)
    - `handleKeyDown` — Tuş olaylarını yöneten fonksiyon (useCallback ile memoize)
- **Dönüş**: React.ReactNode (JSX)

### [N2_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::useEffectCallback_1
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N3_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::useEffectCallback_2
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::startEdit
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N5_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::cancel
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N6_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::save
- **params**: ()
- **ic_degiskenler**:
    - `trimmed` — draft değerinin baş/son boşlukları temizlenmiş hali
    - `original` — Mevcut value parametresinin string karşılığı
- **Dönüş**: Promise<void>

### [N7_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::handleKeyDown
- **params**: (e: React.KeyboardEvent)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N8_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::onClickEditingView
- **params**: (e)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N9_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::onChangeInput
- **params**: (e)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N10_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::onBlurInput
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N11_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::onClickButton
- **params**: (e)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

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