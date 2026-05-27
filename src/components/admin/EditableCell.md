---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\EditableCell.tsx
skeleton_hash: 68ab2fd6998e4d6d
entity_hashes:
  func:EditableCell: c69e143b78ab0750
  overview: 4312d2a15431d150
  style_tokens: 2f2ada2707ada249
generated_at: 2026-05-27T18:10:39Z
---

## Genel Bakış
`EditableCell` bileşeni, yönetim panelindeki tablo hücrelerinin düzenlenebilir olmasını sağlayan bir React fonksiyonel bileşenidir. Gelen değer, tip ve yer tutucu gibi parametreleri alır, kullanıcı etkileşimi sonrası değişikliği `onSave` callback’i ile dışarı aktarır.

## Fonksiyon Grupları
### Düzenlenebilir Hücre Bileşeni
Bu grup, hücrenin görüntülenmesi, düzenleme moduna geçişi ve kaydedilmesi süreçlerini yönetir.  
- EditableCell  

(İçeride kullanılan yardımcı fonksiyonlar (ör. durum yönetimi, olay işleyicileri) bu bileşenin içinde tanımlanır ve dışarıdan ayrı bir fonksiyon olarak listelenmez.)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `onSave` fonksiyonu sağlanmazsa, hücrede yapılan değişiklikler kalıcı olarak kaydedilemez ve kullanıcıya bir hata/uyarı gösterilir.  

**Aksiyom 2**: Eğer `type` parametresi belirtilmezse, varsayılan olarak `'text'` tipi kullanılır; bu tip dışındaki bir değer verilirse, tip `'text'` olarak düşürülür.  

**Aksiyom 3**: Eğer `placeholder` parametresi belirtilmezse, varsayılan değer `'-'` kullanılır; bu değer gösterim amaçlıdır ve gerçek veri kaybına yol açmaz.  

**Aksiyom 4**: Eğer `value` parametresi `null` veya `undefined` ise, hücre içeriği `placeholder` değeriyle gösterilir; bu durumda `onSave` çağrısı yapılmadan önce kullanıcı bir giriş yapmalıdır.  

**Aksiyom 5**: Eğer `type` değeri desteklenmeyen bir formatta (ör. `'binary'`, `'object'` vb.) ise, davranış **bilinmiyor**; bu durumda uygulama bir istisna fırlatabilir veya tip `'text'`e geri dönebilir (tasarım kararına bağlı).  

**Domain‑specific kural**: `type` parametresi için kabul edilen değerler **bilinmiyor**; mevcut kod tabanında tanımlı olabilecek tipler (`'text'`, `'number'`, `'date'` vb.) proje dokümantasyonunda belirtilmelidir.  

Bu aksiyomlar, `EditableCell` bileşeninin temel çalışma koşullarını ve eksik/girişik parametrelerin sistem üzerindeki etkilerini tanımlar.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\EditableCell.tsx::EditableCell
- **params**: (value, onSave, type = 'text', placeholder = '-', className = '', disabled = false, inputWidth = 'w-24')
- **ic_degiskenler**:
  - `editing` — hücrenin düzenleme modunda olup olmadığını tutan boolean state.
  - `setEditing` — `editing` state'ini güncelleyen set fonksiyonu.
  - `draft` — kullanıcı tarafından düzenlenen geçici değer; başlangıçta `value`'nun string temsili.
  - `setDraft` — `draft` state'ini güncelleyen set fonksiyonu.
  - `saving` — kaydetme işlemi devam ederken gösterilen boolean state.
  - `setSaving` — `saving` state'ini güncelleyen set fonksiyonu.
  - `inputRef` — `<input>` elementine referans tutan `useRef` nesnesi.
  - `startEdit` — düzenleme moduna geçişi başlatan, `disabled` veya `saving` durumunda işlem yapmayan callback.
  - `cancel` — düzenleme iptal edildiğinde `draft`'ı orijinal `value`'ya sıfırlayan ve `editing`i kapatan callback.
  - `save` — `draft`'ı `trim()` edip `onSave` async fonksiyonuna gönderen, hata durumunda toast bildirimi gösteren ve ilgili state'leri yöneten async callback.
    - `trimmed` — `draft`'ın baş ve sondaki boşlukları kaldırılmış hali.
    - `original` — komponentin başlangıçtaki `value`'nun string temsili.
  - `handleKeyDown` — klavye olaylarını dinleyen, `Enter` tuşunda `save`i, `Escape` tuşunda `cancel`ı tetikleyen callback.
    - `e` — `React.KeyboardEvent` nesnesi, tuş bilgisi ve `preventDefault` metodunu içerir.
- **Dönüş**: React element (JSX) – düzenleme modunda bir `<input>` ve kaydetme animasyonu, düzenleme modunda değilken bir `<button>` döndürür.

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