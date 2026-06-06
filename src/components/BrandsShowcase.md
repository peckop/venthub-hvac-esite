---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BrandsShowcase.tsx
skeleton_hash: 2bdb96d68efadb02
entity_hashes:
  func:BrandsShowcase: 396bbfa4a2991af7
  func:Lane: 607c875efec6621a
  overview: a64c9ee274fd0d0f
  style_tokens: 90e49e0ab0d8115d
generated_at: 2026-06-06T21:54:43Z
---

## Genel Bakış

`BrandsShowcase` modülü, HVAC markalarını sürekli kayan bir şerit (marquee) formatında sunan bir vitrin bileşenidir. Modül, marka logolarının kesintisiz döngü halinde akmasını sağlayarak dinamik ve görsel çekici bir marka tanıtımı oluşturur.

## Fonksiyon Grupları

### Kaydırma Şeridi Bileşeni
Tek bir şerit (lane) üzerindeki marka öğelerini belirli bir sürede otomatik olarak kaydıran yardımcı bileşeni tanımlar. Varsayılan 50 saniyelik döngü süresi ile sürekli bir animasyon akışı sağlar.
- Lane

### Ana Vitrin Bileşeni
Sayfada tam bir marka vitrini oluşturarak kaydırma şeridini yapılandırır ve kullanıma sunar. İçerisinde `Lane` bileşenini çağırarak HVAC markalarının gösterimini başlatır.
- BrandsShowcase

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HVAC markalarını kaydırılabilir bir şerit içinde gösteren bir vitrin bileşenidir. `Lane` yardımcı bileşeni listedeki öğeleri belirtilen sürede yatay olarak kaydırarak sürekli bir akış oluşturur; `BrandsShowcase` ise bu şeriti sayfada sunan ana bileşendir.

[Aksiyom 1]: Eğer `Lane` bileşenine `items` argümanı sağlanmazsa, kaydırılacak marka içeriği bulunmayacağından şerit boş veya hatalı görüntülenir.

[Aksiyom 2]: Eğer `Lane` bileşenine sağlanan `items` boş bir dizi ise (`[]`), şerit içeriği olmadan çalışır ve kaydırma animasyonu anlamsız hale gelir.

[Aksiyom 3]: Eğer `durationSec` olarak `0` veya negatif bir değer verilirse, kaydırma animasyon süresi geçersiz olacağından animasyon düzgün çalışmaz veya çok hızlı/hatalı akar.

[Aksiyom 4]: Eğer `BrandsShowcase` bileşeni içinde `Lane` bileşenine geçirilen `items` dizisi `Lane` bileşeninin beklediği formata (örn: img src, alt text içeren nesneler) uymuyorsa, öğeler düzgün render edilmez.

[Aksiyom 5]: Eğer `durationSec` çok küçük bir değer olarak (örn: `1`) ayarlanırsa, marka logoları okunamayacak kadar hızlı kayar; çok büyük bir değer olarak ayarlanırsa ise kaydırma neredeyse görünmez hale gelir.

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

### [N1_NASIL] AST Pointer: BrandsShowcase.tsx::Lane
- **params**: `{ items, durationSec = 50 }`
- **ic_degiskenler**:
  - `repeated` — `items` dizisini üç kez tekrarlayarak oluşturulan dizi, sonsuz kaydırma animasyonu için kullanılır.
- **Dönüş**: JSX elementi (React bileşeni)

### [N2_NASIL] AST Pointer: BrandsShowcase.tsx::(brand, idx) => (...)
- **params**: `(brand, idx)`
- **ic_degiskenler**:
  - Yok
- **Dönüş**: JSX elementi (Link bileşeni)

### [N3_NASIL] AST Pointer: BrandsShowcase.tsx::BrandsShowcase
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu
  - `brands` — HVAC_BRANDS sabitinden alınan marka dizisi
- **Dönüş**: JSX elementi (React bileşeni)

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