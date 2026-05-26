---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\EditableCell.tsx
skeleton_hash: 68ab2fd6998e4d6d
generated_at: 2026-05-23T21:52:30Z
---

## Genel Bakış
`EditableCell` bileşeni, tablo veya form gibi veri listelerinde hücrelerin satır içinde düzenlenebilmesini sağlayan yeniden kullanılabilir bir UI elemanıdır. Verilen değeri gösterir, kullanıcı etkileşimiyle düzenleme moduna geçer ve değişiklikleri `onSave` callback’i aracılığıyla dışa aktarır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `value` parametresi `undefined` veya `null` ise, bileşen varsayılan olarak `placeholder` değerini gösterir.  
[Aksiyom 2]: Eğer `type` parametresi `'text'` değilse, bileşen `type` değerini geçerli bir HTML input tipine dönüştürmek için ek bir kontrol yapar; aksi halde `type` değeri doğrudan kullanılır.  
[Aksiyom 3]: Eğer `onSave` fonksiyonu sağlanmazsa, bileşen herhangi bir kaydetme işlemi gerçekleştirmez ve kullanıcı girişini yalnızca yerel state içinde tutar.  
[Aksiyom 4]: Eğer `placeholder` değeri `'-'` olarak bırakılırsa, bu karakterler hücre boş olduğunda gösterilir; aksi halde `placeholder` değeri görsel olarak gizlenir.  
[Aksiyom 5]: Eğer `clas` (muhtemelen `className`) parametresi sağlanmazsa, bileşen varsayılan CSS sınıfı eklemez; bu durumda stil uygulaması dış kaynaklardan gelmelidir.

---

---

## FONKSIYON DETAYLARI

### EditableCell
**Ne yapar**: EditableCell, bir tablo hücresinin doğrudan düzenlenebilmesini sağlayan bir React fonksiyonel bileşenidir. Kullanıcı, mevcut değeri görüntüleyebilir ve hücreye tıklayarak bir giriş alanı aracılığıyla değeri değiştirebilir; değişiklikler kaydedildiğinde belirtilen geri çağırım fonksiyonu tetiklenir.

**Nasıl yapar**: Bileşen, `value` prop'u ile aldığı mevcut değeri statik olarak gösterir. Kullanıcı hücreye tıkladığında, bir `input` (veya belirtilen `type`’a göre uygun giriş elemanı) ile değiştirme moduna geçer. Değer değiştirildiğinde ve kaydetme eylemi gerçekleştiğinde (örneğin, Enter’a basma veya alanın odağını kaybetme), `onSave` fonksiyonu yeni değerle çağrılır ve bileşen tekrar salt okunur moda döner.

**Parametreler**:
- `value`: `any` — Hücrede görüntülenen ve düzenlenebilen mevcut değer.
- `onSave`: `(value: any) => void` — Kullanıcı düzenlemeyi tamamlayıp kaydettiğinde çağrılan geri çağırım fonksiyonu; yeni değer parametre olarak iletilir.
- `type`: `'text' | 'number' | 'email'` (varsayılan: `'text'`) — Düzenleme modunda kullanılacak input türü.
- `placeholder`: `string` (varsayılan: `'-'`) — Giriş alanı boş olduğunda gösterilen yer tutucu metin.
- `className`: `string` (opsiyonel) — Bileşenin kök öğesine uygulanacak ek CSS sınıf adı.

**Dönüş**: `React.FC<EditableCellProps>` — Bileşen, React fonksiyonel bileşeni olarak tanımlanmıştır ve bir JSX elemanı döndürür.

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
- **params**: `value`, `onSave`, `type` (varsayılan `'text'`), `placeholder` (varsayılan `'-'`), `className` (varsayılan `''`), `disabled` (varsayılan `false`), `inputWidth` (varsayılan `'w-24'`)
- **ic_degiskenler**:
  - `editing` — `useState<boolean>`, düzenleme modunun açık/kapalı olduğunu tutar
  - `draft` — `useState<string>`, input alanındaki geçici değer
  - `saving` — `useState<boolean>`, kaydetme işleminin devam edip etmediğini belirtir
  - `inputRef` — `useRef<HTMLInputElement>`, input elementine referans
  - `startEdit` — `useCallback`, düzenleme modunu başlatan fonksiyon
  - `cancel` — `useCallback`, düzenlemeyi iptal eden fonksiyon
  - `save` — `useCallback`, async kaydetme fonksiyonu
  - `handleKeyDown` — `useCallback`, klavye olaylarını işleyen fonksiyon
- **Dönüş**: `React.ReactNode` (JSX output: düzenleme modunda `<div>` içinde `<input>`, aksi halde `<button>`)

### [N2_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::useEffect_callback (draft senkronizasyonu)
- **params**: yok
- **ic_degiskenler**: yok (kullandığı dış değişkenler: `editing`, `value`, `setDraft`)
- **Dönüş**: yok (void)

### [N3_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::useEffect_callback (input odaklama)
- **params**: yok
- **ic_degiskenler**: yok (kullandığı dış değişkenler: `editing`, `inputRef`)
- **Dönüş**: yok (void)

### [N4_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::startEdit
- **params**: yok
- **ic_degiskenler**: yok (kullandığı dış değişkenler: `disabled`, `saving`, `value`, `setDraft`, `setEditing`)
- **Dönüş**: yok (void) — erken dönüş durumu `return` ile

### [N5_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::cancel
- **params**: yok
- **ic_degiskenler**: yok (kullandığı dış değişkenler: `value`, `setDraft`, `setEditing`)
- **Dönüş**: yok (void)

### [N6_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::save
- **params**: yok
- **ic_degiskenler**:
  - `trimmed` — `draft.trim()` sonucu elde edilen temizlenmiş string
  - `original` — `String(value ?? '')` ile elde edilen orijinal değer
- **Dönüş**: `Promise<void>` (async) — `onSave(trimmed)` çağrısı sonrası `setEditing(false)` ile tamamlanır; hata durumunda `setDraft(original)`, `toast.error('Güncelleme başarısız')` ve `setEditing(false)` çalışır

### [N7_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::handleKeyDown
- **params**: `e` (`React.KeyboardEvent`)
- **ic_degiskenler**: yok (kullandığı dış değişkenler: `save`, `cancel`)
- **Dönüş**: yok (void) — `e.preventDefault()` ve `void save()` veya `cancel()` çağrıları

### [N8_NASIL] AST Pointer: src/components/admin/EditableCell.tsx::onClick_handler
- **params**: `e` (`React.MouseEvent`)
- **ic_degiskenler**: yok (kullandığı dış değişken: `startEdit`)
- **Dönüş**: yok (void) — `e.stopPropagation()` ve `startEdit()` çağrısı

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
- **Renkler:** `bg-transparent`, `border-2`, `border-b`, `border-dashed`, `border-primary-navy`, `border-primary-navy/30`, `border-slate-300`, `border-t-primary-navy`, `text-left`, `text-slate-400`, `text-sm`
- **Layout:** `gap-1`, `h-3.5`, `inline-block`, `inline-flex`, `items-center`, `p-0`, `w-3.5`
- **Responsive:** (yok)
