---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BrandsShowcase.tsx
skeleton_hash: 91024db7e88f6112
entity_hashes:
  func:BrandsShowcase: 396bbfa4a2991af7
  func:Lane: 607c875efec6621a
  overview: 2292d0c89c7cdbbb
  style_tokens: 90e49e0ab0d8115d
generated_at: 2026-05-28T22:35:42Z
---

## Genel Bakış
`BrandsShowcase` modülü, HVAC markalarını bir kayan şerit içinde göstererek kullanıcıya dinamik bir marka vitrini sunar. `Lane` yardımcı bileşeni, marka listesini belirli bir süre boyunca yatay olarak kaydırarak sürekli bir görüntü akışı oluşturur; `BrandsShowcase` ise bu şeriti bir araya getirerek tamamlayıcı bir görsel deneyim sağlar.

## Fonksiyon Grupları
### Kaydırma Şeridi Mantığı
Bu grup, marka öğelerinin yatay bir şeritte görüntülenmesi ve belirli aralıklarla otomatik olarak kaydırılması işlevini üstlenir.  
- Lane  

### Ana Gösterim Bileşeni
Bu grup, kaydırma şeridini bir araya getirerek sayfada tam bir marka vitrini oluşturur; `Lane` bileşenini kullanarak markaların sürekli döngüsünü başlatır ve görsel bir sunum sağlar.  
- BrandsShowcase (Lane’i içerir)

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer Lane fonksiyonuna **items** argümanı geçilmezse, bileşen doğru bir şekilde render edilemez (ör. hata fırlatır veya boş çıktı üretir).  
[Aksiyom 2]: Eğer Lane fonksiyonuna **durationSec** argümanı geçilirse ve bu değer sıfır veya negatif bir sayıysa, animasyon süresi geçersiz olur ve beklenen kaydırma davranışı oluşmayabilir.  
[Aksiyom 3]: Eğer Lane fonksiyonuna **durationSec** argümanı geçilmezse, varsayılan değer **50 saniye** kullanılır ve bu değerin pozitif olduğu varsayılır.

---

## FONKSİYON DETAYLARI

### Lane
**Ne yapar**: `Lane` bileşeni, verilen `items` listesini belirli bir süre içinde gösteren bir şerit (lane) oluşturur.  
**Nasıl yapar**: Bileşen, `items` prop'undan gelen öğeleri yatay veya dikey bir düzenle render eder ve `durationSec` değeri (varsayılan 50 saniye) ile animasyon veya geçiş süresini kontrol eder.  
**Parametreler**:
- items: typeof HVAC_BRANDS — gösterilecek marka veya ürün öğelerinin listesi  
- durationSec: number — şeritin geçiş/animasyon süresi (saniye cinsinden), belirtilmezse 50 kullanılır  
**Dönüş**: React.FC — JSX elementi olarak şerit görüntüsünü döndürür

### BrandsShowcase
**Ne yapar**: `BrandsShowcase` bileşeni, markaları sergileyen bir gösterim alanı oluşturur.  
**Nasıl yapar**: Bileşen, iç içe `Lane` (veya benzeri) bileşenleri kullanarak marka listesini düzenli bir şekilde render eder; dışarıdan prop almaz, kendi iç veri kaynağını kullanır.  
**Parametreler**: (yok)  
**Dönüş**: React.FC — JSX elementi olarak marka gösterim alanını döndürür

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BrandsShowcase.tsx::Lane
- **params**: items, durationSec
- **ic_degiskenler**:
  - `repeated` — tripled array of items to create seamless marquee effect
- **Dönüş**: JSX element (React.ReactElement)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BrandsShowcase.tsx::Lane_map_callback
- **params**: brand, idx
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (Link wrapping brand item)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\BrandsShowcase.tsx::BrandsShowcase
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — translation function from useI18n for accessing localized strings
  - `brands` — constant array of HVAC brand objects imported from ../lib/brands
- **Dönüş**: JSX element (React.ReactElement)

---

## NODE ID STANDARD

  file: src\components\BrandsShowcase.tsx
  function: src\components\BrandsShowcase.tsx::Lane
  function: src\components\BrandsShowcase.tsx::BrandsShowcase

---

## DISA AKTARILANLAR (EXPORTS)
  export: BrandsShowcase
  export: Lane

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-loose`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-brands-radial`, `bg-cyan-500/40`, `bg-gradient-to-l`, `bg-gradient-to-r`, `bg-slate-200`, `bg-white`, `from-white`, `group-hover:bg-cyan-500`, `hover:text-cyan-600`, `sm:text-5xl`, `text-3xl`, `text-center`, `text-cyan-600`, `text-slate-400`, `text-slate-900`
- **Layout:** `absolute`, `flex`, `flex-col`, `from-white`, `gap-20`, `gap-4`, `gap-6`, `group-hover/brand:w-12`, `group-hover:w-16`, `h-24`, `h-px`, `inline-flex`, `items-center`, `justify-center`, `left-0`
- **Varyant/Responsive:** `group-hover/brand:`, `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-0.05em]`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-extralight`, `font-medium`, `grayscale`, `group`, `group-hover/brand:grayscale-0`, `group-hover/brand:opacity-100`, `group-hover/brand:scale-110`, `group/brand`, `inset-0`, `inset-y-0`