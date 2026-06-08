---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\InputField.tsx
skeleton_hash: 0743c22f96e8b325
entity_hashes:
  func:InputField: 67cc20ea60eef576
  func:RadioGroup: 3547a0581eb094b6
  overview: 886525d7c102a6da
  style_tokens: d04e77e09b4ac40e
generated_at: 2026-06-08T10:08:47Z
---

## Genel Bakış  
Bu modül, kullanıcı arayüzünde veri girişi için iki temel bileşen sunar: tek bir sayısal veya metin alanı ve bir radyo grup. Her iki bileşen de etiket, değer, değişiklik işleyici ve isteğe bağlı görsel ayarları alarak, form elemanlarını tek bir yerde tutarak kodun yeniden kullanılabilirliğini artırır.

## Fonksiyon Grupları  

### Giriş Alanı Bileşeni  
Bu grup, tek bir giriş alanı oluşturur. Kullanıcıdan sayı veya metin alır, etiket ve yer tutucu ile birlikte değişiklikleri üst bileşene iletir.  
- InputField  

### Radyo Grubu Bileşeni  
Bu grup, birden çok radyo butonunu sütun düzeninde gösterir. Seçilen değeri, hata mesajını ve seçenek listesini yönetir, değişiklikleri üst bileşene iletir.  
- RadioGroup

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `InputField` bileşenine `label` parametresi sağlanmazsa, bileşen render edilemez ve UI’da boş etiket gösterilir.

**Aksiyom 2**: Eğer `InputField` bileşenine `value` parametresi, `type` parametresiyle uyumlu bir veri tipi (ör. `type='number'` ise sayı) değilse, giriş alanı hatalı veri alır ve beklenmeyen davranış (ör. NaN gösterimi) ortaya çıkar.

**Aksiyom 3**: Eğer `InputField` bileşenine `onChange` callback’i verilmezse, kullanıcı etkileşimi (değer değişikliği) yakalanamaz ve form durumu güncellenmez.

**Aksiyom 4**: Eğer `InputField` bileşenine `type` parametresi `'number'` dışındaki bir değer verilirse, bileşen o tipte bir HTML input oluşturur; ancak `type` değeri desteklenmeyen bir tipse (ör. `'unknown'`) tarayıcı varsayılan olarak `text` tipine düşer.

**Aksiyom 5**: Eğer `InputField` bileşenine `placeholder` parametresi sağlanmazsa, giriş alanı boş bir yer tutucu gösterir; bu durum UI/UX açısından kabul edilebilir bir durumdur.

**Aksiyom 6**: Eğer `RadioGroup` bileşenine `label` parametresi sağlanmazsa, radyo grubunun başlığı eksik olur ve kullanıcıya grup hakkında bilgi verilmez.

**Aksiyom 7**: Eğer `RadioGroup` bileşenine `value` parametresi, `options` içinde tanımlı bir değerle eşleşmezse, hiçbir radyo butonu seçili gelmez ve UI’da tutarsız bir durum oluşur.

**Aksiyom 8**: Eğer `RadioGroup` bileşenine `onChange` callback’i verilmezse, kullanıcı bir seçenek seçtiğinde seçimin dışarıya aktarımı gerçekleşmez; bu da formun doğru şekilde güncellenmemesine yol açar.

**Aksiyom 9**: Eğer `RadioGroup` bileşenine `options` parametresi eksik veya boş bir dizi olarak verilirse, radyo butonları oluşturulamaz ve bileşen render hatası verir.

**Aksiyom 10**: Eğer `RadioGroup` bileşenine `error` parametresi sağlanmazsa, hata mesajı gösterilmez; bu durum hatalı girişlerin kullanıcıya bildirilmemesine neden olabilir ancak bileşenin çalışmasını engellemez.

**Aksiyom 11**: Eğer `RadioGroup` bileşenine `columns` parametresi sağlanmazsa, radyo butonları tek sütun halinde (default layout) düzenlenir.

---

## FONKSİYON DETAYLARI

### InputField
**Ne yapar**: Kullanıcıdan sayısal veri girişi almak için tasarlanmış bir React bileşenidir; etiket, placeholder, birim ve hata mesajı gibi ek UI öğelerini içerir.  
**Nasıl yapar**: Props olarak gelen `label`, `value`, `onChange`, `type` ve `placeholder` değerlerini kullanarak bir `<input>` elemanı oluşturur; `type` varsayılan olarak `'number'` olduğundan sayısal girişe odaklanır. Tooltip ve birim göstergesi eklenerek kullanıcı deneyimi artırılır; hata durumu varsa `error` prop’u üzerinden görsel geri bildirim sağlanır.  
**Parametreler**:
- `label`: string — Giriş alanının üstünde gösterilecek açıklama metni.  
- `value`: string | number — Kontrol edilen giriş değerinin mevcut durumu.  
- `onChange`: (newValue: string | number) => void — Değer değiştiğinde tetiklenen geri çağırma fonksiyonu.  
- `type`: string — HTML input tipini belirler; varsayılan `'number'`.  
- `placeholder`: string — Kullanıcıya örnek bir değer göstermek için kullanılan yer tutucu metin.  
**Dönüş**: React.FC<InputFieldProps> — Tanımlanan prop tipleriyle uyumlu bir fonksiyonel React bileşeni.

### RadioGroup
**Ne yapar**: Belirli bir seçenek kümesi arasından tek bir seçim yapılmasını sağlayan bir radyo buton grubu bileşenidir; etiket, hata mesajı ve sütun düzeni gibi ek özellikler sunar.  
**Nasıl yapar**: `options` dizisindeki her bir öğe için bir `<input type="radio">` oluşturur, `value` prop’u seçili öğeyi belirler ve `onChange` geri çağırmasıyla seçim değişikliklerini üst bileşene iletir. `columns` parametresi, radyo butonlarının kaç sütun halinde düzenleneceğini kontrol eder; `error` varsa ilgili stil ve mesaj gösterilir.  
**Parametreler**:
- `label`: string — Radyo grubunun başlığı veya açıklama metni.  
- `value`: string | number — Şu anda seçili olan radyo butonunun değeri.  
- `onChange`: (newValue: string | number) => void — Seçim değiştiğinde tetiklenen geri çağırma fonksiyonu.  
- `options`: Array<{ label: string; value: string | number }> — Her bir radyo butonunun gösterilecek etiketi ve değeri.  
- `error`: string (opsiyonel) — Doğrulama hatası durumunda gösterilecek mesaj.  
- `columns`: number (opsiyonel) — Radyo butonlarının kaç sütun içinde yer alacağını belirler.  
**Dönüş**: React.FC<RadioGroupProps> — Tanımlanan prop tipleriyle uyumlu bir fonksiyonel React bileşeni.

---

## INTERFACES

### InputFieldProps
- `label: string`
- `value: string | number`
- `onChange: (value: string) => void`
- `type?: 'text' | 'number'`
- `placeholder?: string`
- `unit?: string`
- `min?: number`
- `max?: number`
- `step?: number`
- `tooltip?: string`
- `error?: string`
- `disabled?: boolean`

### RadioGroupProps
- `label: string`
- `value: string`
- `onChange: (value: string) => void`
- `options: { label: string; value: string; description?: string; icon?: React.ReactNode }[]`
- `error?: string`
- `columns?: number`
- `tooltip?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\calculators\InputField.tsx::InputField
- **params**: `label, value, onChange, type = 'number', placeholder, unit, min, max, step = 0.1, tooltip, error, disabled = false`
- **ic_degiskenler**:
  - `id` — `React.useId()` ile oluşturulan benzersiz element id’si; `<label>` ve `<input>` elementlerinin `htmlFor` ve `id` özelliklerinde kullanılır.
- **Dönüş**: JSX/React element (bir `<div>` içinde label, input ve isteğe bağlı tooltip, unit ve hata mesajı içerir).

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\calculators\InputField.tsx::RadioGroup
- **params**: `label, value, onChange, options, error, columns = 2, tooltip`
- **ic_degiskenler**: *(yok)*
- **Dönüş**: JSX/React element (bir `<div>` içinde label, isteğe bağlı tooltip, dinamik olarak oluşturulmuş radio‑butonlar ve hata mesajı içerir).

---

## NODE ID STANDARD

  file: src\components\calculators\InputField.tsx
  function: src\components\calculators\InputField.tsx::InputField
  function: src\components\calculators\InputField.tsx::RadioGroup

---

## DISA AKTARILANLAR (EXPORTS)
  export: InputField
  export: RadioGroup

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-danger-red/5`, `bg-gray-100`, `bg-industrial-gray`, `bg-primary-navy/5`, `bg-white`, `border-4`, `border-danger-red`, `border-light-gray`, `border-primary-navy`, `border-t-industrial-gray`, `border-transparent`, `focus-visible:border-primary-navy`, `hover:border-steel-gray`, `text-danger-red`, `text-industrial-gray`
- **Layout:** `absolute`, `bottom-full`, `flex`, `gap-2`, `gap-3`, `grid`, `items-center`, `left-1/2`, `max-w-xs`, `p-4`, `relative`, `right-4`, `sm:grid-cols-${columns`, `top-1/2`, `top-full`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${disabled`, `${error`, `${unit`, `${value`, `-translate-x-1/2`, `-translate-y-1/2`, `:`, `===`, `border`, `cursor-help`, `cursor-not-allowed`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `font-medium`