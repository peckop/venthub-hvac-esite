---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\InputField.tsx
skeleton_hash: 2c4bf169494b0683
generated_at: 2026-05-23T21:56:08Z
---

## Genel Bakış
`InputField.tsx` modülü, HVAC hesaplayıcıları içinde kullanıcıdan veri almak için yeniden kullanılabilir temel form elemanlarını içerir. Bu dosyada, tek bir değer giren **InputField** ve birden fazla seçenekten tek bir seçim yapan **RadioGroup** bileşenleri tanımlanmıştır; her ikisi de ortak özellikleri paylaşarak tutarlı bir kullanıcı arayüzü sağlar.

## Fonksiyon Grupları
### Form Giriş Bileşenleri
Bu grup, kullanıcıdan alınan bilgileri işlemek ve üst bileşenlere iletmek için gerekli olan kullanıcı arayüzü bileşenlerini toplar.  
- InputField, RadioGroup  

Her iki bileşen de etiket, mevcut değer ve değişiklik bildirimi gibi temel özellikleri alır; `InputField` sayısal veya metin tabanlı tek alan girdisi sunarken, `RadioGroup` önceden belirlenmiş seçenekler arasında tek bir seçim yapmayı ve hata gösterimi ile sütun düzeni gibi ek düzenlemeleri mümkün kılar.

---

## AXIOMS – Mimari Varsayımlar
[Bu modül için özel aksiyom tanımlanmamıştır.]  

- Eğer **InputField** bileşenine `type` prop’u verilmezse, varsayılan olarak `'number'` kullanılır.  
- Eğer **InputField** bileşenine `placeholder` prop’u verilmezse, giriş kutusu placeholder özelliği olmadan render edilir.  
- Eğer **InputField** bileşenine `onChange` prop’u verilmezse, değer değişiklikleri üst bileşene iletilmez.  
- Eğer **RadioGroup** bileşenine `options` prop’u verilmezse, seçenek listesi boş olduğu için hiçbir radyo düğmesi gösterilmez.  
- Eğer **RadioGroup** bileşenine `onChange` prop’u verilmezse, seçenek değişiklikleri üst bileşene iletilmez.  
- Eğer **RadioGroup** bileşenine `error` prop’u verilmezse, hata mesajı gösterilmez.  
- Eğer **RadioGroup** bileşenine `columns` prop’u verilmezse, sütun düzeni belirtilmediği için bileşen tek sütun varsayılan davranışına bağlıdır (bu davranış stil veya diğer prop’lar tarafından belirlenir).

---

## FONKSIYON DETAYLARI

### InputField
**Ne yapar**: Kullanıcıdan veri girişi almak için stilize edilmiş bir giriş alanı render eder;Tooltip, birim gösterimi ve hata mesajı gibi ek bileşenleri içerir.  
**Nasıl yapar**: Props olarak gelen `label`, `value`, `onChange`, `type` ve `placeholder` değerlerini kullanarak bir `<input>` elementi oluşturur; ek olarak Tooltip, birim ve hata gösterimi için iç içe bileşenler render eder.  
**Parametreler**:
- label: string — Giriş alanının üstünde gösterilecek açıklama metni  
- value: string | number — Şu anki giriş değeri, kontrolü dışarıdan yönetmek için kullanılır  
- onChange: (value: string | number) => void — Kullanıcı değeri değiştirdiğinde çağrılan geri çağırım fonksiyonu  
- type: string — HTML input tipi (varsayılan: 'number'); metin, sayı, vb. türleri belirler  
- placeholder: string — Giriş alanı boşken gösterilecek ipucu metni  
**Dönüş**: React.FC<InputFieldProps> — Props'u alan ve JSX döndüren bir React fonksiyon bileşeni  

### RadioGroup
**Ne yapar**: Seçenekler arasında tek bir seçime izin veren bir radyo grubu oluşturur; seçili değeri, etiket ve hata durumu gibi bilgileri gösterir.  
**Nasıl yapar**: `options` prop'undan gelen seçenek listesini iterate ederek her bir seçenek için bir `<input type="radio">` ve ilişkili `<label>` elementi render eder; `value` ve `onChange` props'u ile seçilen değeri yönetir, `error` varsa hata mesajını gösterir.  
**Parametreler**:
- label: string — Radyo grubunun üstünde gösterilecek açıklama metni  
- value: string | number — Şu anda seçili olan seçeneğin değeri  
- onChange: (value: string | number) => void — Kullanıcı farklı bir seçenek işaretlediğinde çağrılan geri çağırım fonksiyonu  
- options: Array<{ value: string | number; label: string }> — Gösterilecek radyo seçeneklerinin listesi; her seçenek bir değer ve görüntülenecek etiket içerir  
- error: string | null — Gösterilecek hata mesajı; null veya boş string ise hata gösterilmez  
- columns: number — Seçeneklerin kaç sütunda düzenleneceğini belirten sayı (ör. 2 için iki sütunlu düzen)  
**Dönüş**: React.FC<RadioGroupProps> — Props'u alan ve JSX döndüren bir React fonksiyon bileşeni

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

### [N1_NASIL] AST Pointer: src/components/calculators/InputField.tsx::InputField
- **params**: label, value, onChange, type = 'number', placeholder, unit, min, max, step = 0.1, tooltip, error, disabled = false
- **ic_degiskenler**: 
  - `id` — unique ID generated by React.useId() for associating the label with the input and tooltip
- **Dönüş**: React.FC<InputFieldProps>

### [N2_NASIL] AST Pointer: src/components/calculators/InputField.tsx::RadioGroup
- **params**: label, value, onChange, options, error, columns = 2, tooltip
- **ic_degiskenler**: yok
- **Dönüş**: React.FC<RadioGroupProps>

---

## NODE ID STANDARD

  file: src\components\calculators\InputField.tsx
  function: src\components\calculators\InputField.tsx::InputField
  function: src\components\calculators\InputField.tsx::RadioGroup

---

## DISA AKTARILANLAR (EXPORTS)
  export: InputField
  export: RadioGroup