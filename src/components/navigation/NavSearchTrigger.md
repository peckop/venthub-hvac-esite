---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavSearchTrigger.tsx
skeleton_hash: 3fd500eca04776e8
entity_hashes:
  func:NavSearchTrigger: 685a255257840b8c
  overview: f880d1849bdfe091
  style_tokens: 76073a5206e1d6d6
generated_at: 2026-06-19T20:47:10Z
---

## Genel Bakış
`NavSearchTrigger` modülü, navigasyon çubuğunda arama işlevini başlatmak için kullanılan bir tetikleyici bileşeni tanımlar. Prop olarak aldığı etiket, kısayol ve erişilebilirlik bilgileriyle görsel ve erişilebilir bir buton render eder; tıklandığında dışarıdan sağlanan `onClick` callback'ini çalıştırır.

## Fonksiyon Grupları
### Bileşen Tanımı
Arama tetikleyicisinin UI render'ını ve prop işleme mantığını yönetir.  
- NavSearchTrigger   (tek fonksiyon)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `label` prop’u sağlanmazsa, **NavSearchTrigger** bileşeni görsel olarak bir metin gösteremez ve kullanıcı arayüzünde “etiket eksik” durumu ortaya çıkar.  

**Aksiyom 2**: Eğer `shortcutLabel` prop’u sağlanmazsa, bileşen klavye kısayolu bilgisini render edemez; sonuç olarak kullanıcı kısayol ipucunu göremez.  

**Aksiyom 3**: Eğer `ariaLabel` prop’u sağlanmazsa, bileşenin erişilebilirlik (ARIA) etiketi eksik olur; ekran okuyucular bileşeni tanımlayamaz ve erişilebilirlik testi başarısız olur.  

**Aksiyom 4**: Eğer `onClick` prop’u sağlanmazsa, bileşenin tıklama olayına bağlanacak bir geri çağırma fonksiyonu yoktur; bu durumda kullanıcı tıkladığında arama penceresi açılmaz ve işlevsel gereksinim karşılanmaz.

---

## FONKSİYON DETAYLARI

### NavSearchTrigger
**Ne yapar**: Kullanıcı arayüzünde arama işlevini tetikleyen bir buton ya da etkileşimli öğe oluşturur. Etiket, kısayol ve erişilebilirlik bilgileriyle birlikte tıklandığında verilen `onClick` geri çağrısını çalıştırır.  

**Nasıl yapar**: Gelen `props` değerlerini bir `<button>` (veya benzeri) elementine aktarır, `aria-label` ve klavye kısayolu göstergesi ekler, ardından `onClick` fonksiyonunu `onClick` olayına bağlar. Bileşen, `React.FC<NavSearchTriggerProps>` tipinde bir fonksiyonel bileşen olarak döndürülür.  

**Parametreler**:
- `label`: string — Görsel olarak gösterilecek metin etiketi.
- `shortcutLabel`: string (opsiyonel) — Klavye kısayolu göstergesi (ör. “Ctrl+K”).
- `ariaLabel`: string (opsiyonel) — Erişilebilirlik için kullanılan ARIA etiketi.
- `onClick`: () => void (opsiyonel) — Kullanıcı tıkladığında çalıştırılacak geri çağırma fonksiyonu.

**Dönüş**: React.FC\<NavSearchTriggerProps\> — Tanımlanan propsları kullanan bir React fonksiyonel bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/utils::cn
- import: react::React

---

## INTERFACES

### NavSearchTriggerProps
- `label: string`
- `shortcutLabel: string`
- `ariaLabel: string`
- `onClick: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavSearchTrigger.tsx::NavSearchTrigger
- **params**: (label, shortcutLabel, ariaLabel, onClick)
- **ic_degiskenler**:
  - `label` — button içinde gösterilecek metin
  - `shortcutLabel` — kısayol tuşu etiketi, `<kbd>` içinde görüntülenir
  - `ariaLabel` — butona atanacak ARIA etiketi, `aria-label` özniteliğinde kullanılır
  - `onClick` — butona tıklandığında çağrılacak olay işleyicisi, `onClick` özniteliğine atanır
- **Dönüş**: React elementi `<button>` ve içindeki JSX yapısı (buton, SVG, span, kbd)  
  Fonksiyon, verilen parametreleri kullanarak bir arayüz bileşeni oluşturur ve bu bileşeni döndürür.

---

## NODE ID STANDARD

  file: src\components\navigation\NavSearchTrigger.tsx
  function: src\components\navigation\NavSearchTrigger.tsx::NavSearchTrigger

---

## DISA AKTARILANLAR (EXPORTS)
  export: NavSearchTrigger

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `hover:shadow-[0_18px_36px_-24px_rgba(37,99,235,0.45)]`
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** (yok)

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-50`, `bg-white/80`, `border-slate-200`, `border-slate-200/80`, `hover:bg-white`, `hover:border-primary-navy/20`, `hover:text-primary-navy`, `text-left`, `text-sm`, `text-steel-gray`, `text-xs`
- **Layout:** `flex-1`, `gap-3`, `hidden`, `inline-flex`, `items-center`, `lg:block`, `md:block`, `min-w-0`, `shadow-hvac-nav-rail`, `shadow-sm`, `w-full`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy/20`, `font-medium`, `group`, `px-1.5`, `px-3`, `py-0.5`, `py-2.5`, `rounded-2xl`, `rounded-lg`, `shrink-0`