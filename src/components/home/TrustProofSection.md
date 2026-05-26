---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\TrustProofSection.tsx
skeleton_hash: 3990bf5913c326a6
generated_at: 2026-05-26T12:21:16Z
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

## FONKSIYON DETAYLARI

### TrustProofSection
**Ne yapar**: Verilen çeviri sözlükleri (`dictionary` ve `trustStripDict`) kullanılarak güven kanıtı (trust proof) içeren bir React bileşeni oluşturur. Bu bileşen, uygulamanın ana sayfasında güvenilirlik göstergelerini görsel olarak sunar.  

**Nasıl yapar**: Fonksiyon, `dictionary` ve `trustStripDict` nesnelerini parametre olarak alır, bu verileri bileşenin içindeki metin ve görsel öğelere bağlar. Ardından, JSX yapısını döndürerek `TrustProofSectionProps` tipinde bir React fonksiyonel bileşeni üretir.  

**Parametreler**:
- `dictionary`: object — Genel metin çevirileri için kullanılan sözlük, bileşenin başlık ve açıklama metinlerini içerir.  
- `trustStripDict`: object — Güven kanıtı şeridiyle ilgili çevirileri barındıran sözlük, şerit üzerindeki etiket ve açıklamaları sağlar.  

**Dönüş**: React.FC\<TrustProofSectionProps\> — `TrustProofSectionProps` tipinde özellikler alabilen bir fonksiyonel React bileşeni.

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