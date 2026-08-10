---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\TrustProofSection.tsx
skeleton_hash: 92e92fa9817ef079
entity_hashes:
  func:TrustProofSection: ff4459fea67ab188
  overview: ecbeef82efa3251a
  style_tokens: fd859472e8c1a696
generated_at: 2026-06-19T20:47:09Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ana sayfasında kullanıcıya güven kanıtı göstergeleri sunan bir React bileşenini içerir. Bileşen, dışarıdan sağlanan çeviri sözlüğü ve güven şeridi verilerini kullanarak içeriği dinamik olarak doldurur ve markanın güvenilirliğini vurgulayan görsel bir arayüz bölümü oluşturur.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, modülün tek temel işlevini yerine getiren bileşeni içerir; gelen çeviri ve güven şeridi verilerini işleyerek güven kanıtı bölümünü kullanıcıya sunar.
- TrustProofSection

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TrustProofSection
**Ne yapar**: Verilen çeviri sözlükleri (`dictionary` ve `trustStripDict`) kullanılarak güven kanıtı (trust proof) içeren bir React bileşeni oluşturur. Bu bileşen, uygulamanın ana sayfasında güvenilirlik göstergelerini görsel olarak sunar.  

**Nasıl yapar**: Fonksiyon, `dictionary` ve `trustStripDict` nesnelerini parametre olarak alır, bu verileri bileşenin içindeki metin ve görsel öğelere bağlar. Ardından, JSX yapısını döndürerek `TrustProofSectionProps` tipinde bir React fonksiyonel bileşeni üretir.  

**Parametreler**:
- `dictionary`: object — Genel metin çevirileri için kullanılan sözlük, bileşenin başlık ve açıklama metinlerini içerir.  
- `trustStripDict`: object — Güven kanıtı şeridiyle ilgili çevirileri barındıran sözlük, şerit üzerindeki etiket ve açıklamaları sağlar.  

**Dönüş**: React.FC\<TrustProofSectionProps\> — `TrustProofSectionProps` tipinde özellikler alabilen bir fonksiyonel React bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: next/image::Image
- import: react::React

---

## INTERFACES

### TrustProofDict
- `eyebrow?: string`
- `title?: string`
- `subtitle?: string`
- `visualAlt?: string`
- `badge?: string`
- `items?: Record<string, {`

### TrustStripDict

### TrustProofSectionProps
- `dictionary: TrustProofDict`
- `trustStripDict: TrustStripDict`

---

## SABİTLER
- **proofItems** (as_expression) — `[
  { 
    key: 'brands', 
    icon: (
      <svg width="20" height="20" ...`
- **trustStripKeys** (as_expression) — `['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuid...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\TrustProofSection.tsx::TrustProofSection
- **params**: ({ dictionary: t, trustStripDict: stripDict })
- **ic_degiskenler**:
  - `t` — dışarıdan gelen sözlük nesnesi; bileşen içinde metin (eyebrow, title, subtitle, vb.) sağlamak için kullanılır.
  - `stripDict` — dışarıdan gelen nesne; `trustStripKeys` elemanlarını karşılık gelen metinlerle eşleştirir.
  - `trustStripKeys` — dosyada tanımlı sabit dizi; güven rozetlerinin anahtarlarını tutar ve haritalama için döngüde kullanılır.
  - `proofItems` — dosyada tanımlı sabit dizi; detaylı kartların verisini (key, icon, vb.) içerir.
- **Dönüş**: JSX.Element (React bileşeni)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\TrustProofSection.tsx::trustStripKeys.map callback
- **params**: (key)
- **ic_degiskenler**:
  - `key` — `trustStripKeys` dizisinden gelen mevcut anahtar; React `key` özniteliği ve `stripDict` erişiminde kullanılır.
  - `t` — dış kapsamdaki sözlük nesnesi; rozet başlığı (`t.badge`) için yedek metin sağlar.
  - `stripDict` — dış kapsamdaki sözlük; `key` ile eşleşen değeri gösterir.
- **Dönüş**: JSX.Element (rozet kartı)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\TrustProofSection.tsx::proofItems.map callback
- **params**: (item, index)
- **ic_degiskenler**:
  - `item` — `proofItems` dizisinden gelen öğe; `key`, `icon` vb. alanları içerir.
  - `index` — öğenin dizideki konumu; animasyon gecikmesi sınıfını (`delayClass`) belirlemek için kullanılır.
  - `t` — dış kapsamdaki sözlük nesnesi; öğe metinlerini (`eyebrow`, `title`, `description`) almak için kullanılır.
  - `itemDict` — `t.items?.[item.key]` ifadesinden elde edilen nesne; eksikse boş alanlarla doldurulur.
  - `delayClass` — `index` değerine göre seçilen CSS sınıfı; animasyon gecikmesini ayarlar.
- **Dönüş**: JSX.Element (detaylı kart)

---

## NODE ID STANDARD

  file: src\components\home\TrustProofSection.tsx
  function: src\components\home\TrustProofSection.tsx::TrustProofSection

---

## DISA AKTARILANLAR (EXPORTS)
  export: TrustProofSection

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-xl`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `bg-slate-100`, `bg-slate-50`, `bg-slate-50/50`, `bg-white`, `border-slate-100`, `border-slate-200`, `from-slate-900/60`, `group-hover:bg-primary-navy`, `group-hover:bg-primary-navy/20`, `group-hover:text-white`, `hover:bg-white`, `hover:border-primary-navy/10`, `sm:text-6xl`, `text-4xl`
- **Layout:** `absolute`, `flex`, `flex-col`, `from-slate-900/60`, `gap-16`, `gap-3`, `gap-6`, `grid`, `grid-cols-2`, `h-12`, `h-2`, `h-full`, `hover:shadow-2xl`, `hover:shadow-primary-navy/5`, `hover:shadow-slate-200/50`
- **Varyant/Responsive:** `data-[in-view=true]:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${delayClass`, `-translate-x-4`, `aspect-video`, `border`, `data-[in-view=true]:opacity-100`, `data-[in-view=true]:translate-x-0`, `data-[in-view=true]:translate-y-0`, `delay-200`, `delay-300`, `duration-300`, `duration-500`, `duration-700`, `ease-out`, `font-bold`, `font-light`