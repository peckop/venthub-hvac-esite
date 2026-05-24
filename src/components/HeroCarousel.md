---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\HeroCarousel.tsx
skeleton_hash: 4c1485db4b4d7c76
generated_at: 2026-05-23T22:16:39Z
---

## Genel Bakış
HeroCarousel modülü, verilen kategori listesini kullanarak bir öne çıkan görsel kaydırma (carousel) bileşeni oluşturur. Bu bileşen, sayfanın baş kısmında görsel içerikleri dinamik olarak göstererek kullanıcı deneyimini zenginleştirir.

## Fonksiyon Grupları
### Ana Bileşen
HeroCarousel fonksiyonu, dışarıdan gelen `categories` verisini alarak carousel yapısını render eder ve gerekli görsel geçişleri yönetir.
- HeroCarousel

---

## AXIOMS – Mimari Varsayımlar
HeroCarousel bileşeni, `categories` propunun bir dizi olduğu ve bu dizinin her öğesinin görüntüleme için gerekli metadata ve ikon bilgilerini içerdiği varsayımına dayanır; bu bilgiler eksik olduğunda `IconMap` ve `FALLBACK_METADATA` sabitleri kullanılarak tamamlanır.

[Aksiyom 1]: Eğer `categories` prop'u tanımsız, null veya boş bir dizi ise, bileşen hiçbir slayt render etmez (veya hata fırlatabilir, bu da içeriğin eksik olduğu anlamına gelir).  
[Aksiyom 2]: Eğer bir kategori öğesi `IconMap` nesnesinde karşılık gelen bir ikon anahtarına sahip değilse, `FALLBACK_METADATA` nesnesindeki varsayılan ikon değeri kullanılır.  
[Aksiyom 3]: Eğer bir kategori öğesi gerekli metadata alanlarını (örn. başlık, görsel URL vb.) içermiyorsa, bu eksik alanlar `FALLBACK_METADATA` nesnesinden alınarak tamamlanır.  
[Aksiyom 4]: Eğer `IconMap` veya `FALLBACK_METADATA` nesneleri tanımsız veya null ise, bileşen ikon ve metadata eksikliklerini düzeltemez verender sırasında beklenmeyen değerler veya hata ortaya çıkabilir.

---

## FONKSIYON DETAYLARI

### HeroCarousel
**Ne yapar**: HeroCarousel, ana sayfa hero bölümünde kategorileri gösteren bir carousels (slayt) bileşeni render eder.  
**Nasıl yapar**: Bileşen, `categories` prop'undan gelen veri listesini alıp, her bir kategori için bir slayt oluşturur ve genellikle bir kaydırma veya geçiş efekti sağlayan bir carousel kütüphanesi ile gösterir.  
**Parametreler**:  
- categories: React.ReactNode[] — Gösterilecek kategorilerin JSX elemanları veya veri objeleri dizisi.  
**Dönüş**: React.FC<HeroCarouselProps> — Render edilen hero carousel bileşenini döndürür; JSX olarak kullanıma hazır bir React elementi.

---

## INTERFACES

### HeroCarouselProps
- `categories: DomainCategory[]`

### CategoryFeature
- `icon: string`
- `title: string`
- `description?: string`

### CategoryMetadataExtended
- `hero_title?: string`
- `hero_description?: string`
- `technical_summary?: string`
- `features?: CategoryFeature[]`

---

## SABİTLER
- **FALLBACK_METADATA** (object) — `{
    'industrial-ventilation': {
        hero_title: 'Endüstriyel Havaland...`
- **IconMap** (object) — `{
    wind: Wind,
    shield: Shield,
    activity: Activity,
    zap: Za...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/HeroCarousel.tsx::HeroCarousel
- **params**: categories
- **ic_degiskenler**:
  - `wrapCategory` — ViewModel oluşturucu fonksiyonu, her kategori nesnesini UI için hazırlanan ViewModel'a dönüştürür.
  - `t` — i18n çeviri fonksiyonu, arayüz metinlerini mevcut dile göre çevirir.
  - `currentIndex` — Şu anda gösterilen slaytın indeksi; `setCurrentIndex` ile güncellenir.
  - `setCurrentIndex` — `currentIndex` state'ini güncelleyen setter fonksiyonu.
  - `isAutoPlaying` — Otomatik oynatma aktif mi? `true` ise slaytlar belirli aralıklarla değişir.
  - `setIsAutoPlaying` — `isAutoPlaying` state'ini güncelleyen setter fonksiyonu.
  - `timeoutRef` — `setTimeout` tarafından oluşturulan tutucuyu tutan `useRef`; otomatik oynatma zamanlayıcısını temizlemek için kullanılır.
  - `mainCategoryVms` — `useMemo` ile hesaplanan, üst‑level kategorilerin ViewModel listesi; filtrelenmiş, sıralanmış ve sarılmış kategorilerden oluşur.
  - `handleNext` — “Sonraki” butonuna tıklandığında çağrılan fonksiyon; otomatik oynatmayı durdurur ve indeksi bir artırır.
  - `handlePrev` — “Önceki” butonuna tıklandığında çağrılan fonksiyon; otomatik oynatmayı durdurur ve indeksi bir azaltır.
- **Dönüş**: JSX elementi (karusel UI) veya `null` (kategori yoksa).

### [N2_NASIL] AST Pointer: src/components/HeroCarousel.tsx::mainCategoryVmsFactory (useMemo callback)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `CategoryViewModel[]` — `categories` dizisinden `parent_id` olmayanları filtreler, isimlerine göre sıralar, her birini `wrapCategory` ile sarar ve `null` olmayan sonuçları döndürür.

### [N3_NASIL] AST Pointer: src/components/HeroCarousel.tsx::resetEffect (useEffect for index reset)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` (useEffect temizliği yok) — `currentIndex` değeri `mainCategoryVms.length`’e eşit veya büyükse indeksi `0`’a sıfırlar.

### [N4_NASIL] AST Pointer: src/components/HeroCarousel.tsx::autoPlayEffect (useEffect for auto‑play)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` veya cleanup fonksiyonu — `isAutoPlaying` true ve liste boş değilse 5 saniyelik bir `setTimeout` kurar; dönüş değeri olarak zamanlayıcıyı temizleyen cleanup fonksiyonunu döndürür.

### [N5_NASIL] AST Pointer: src/components/HeroCarousel.tsx::tickCallback (setTimeout inside autoPlayEffect)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` — `setCurrentIndex` ile mevcut indeksi bir artırır (modulo liste uzunluğu).

### [N6_NASIL] AST Pointer: src/components/HeroCarousel.tsx::autoPlayCleanup (cleanup function of autoPlayEffect)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` — Eğer `timeoutRef.current` tanımlıysa onu `clearTimeout` ile iptal eder.

### [N7_NASIL] AST Pointer: src/components/HeroCarousel.tsx::handleNext
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` — `setIsAutoPlaying(false)` ile otomatik oynatmayı durdurur ve `setCurrentIndex` ile indeksi bir artırır (sarar).

### [N8_NASIL] AST Pointer: src/components/HeroCarousel.tsx::handlePrev
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` — `setIsAutoPlaying(false)` ile otomatik oynatmayı durdurur ve `setCurrentIndex` ile indeksi bir azaltır (sarar).

### [N9_NASIL] AST Pointer: src/components/HeroCarousel.tsx::itemRenderer (mainCategoryVms.map callback)
- **params**: vm, idx
- **ic_degiskenler**:
  - `isActive` — Boolean; geçerli slaytın (`idx === currentIndex`) olup olmadığını gösterir, animasyon ve z‑index kontrolü için kullanılır.
  - `cat` — Ham kategori nesnesi (`vm.raw`); metadata ve diğer özelliklere erişim sağlar.
  - `meta` — Kategori metadata’sı; `FALLBACK_METADATA` ile birleştirilerek eksik alanlar tamamlanır.
  - `bgImage` — String; arkaplan görselinin URL’si, `vm.imageUrl` varsa onu kullanır, yoksa varsayılan yolunu oluşturur.
- **Dönüş**: JSX elementi — bir slaytın tamamını (arkaın, içerik, özellikler, butonlar) içeren `<div>`.

### [N10_NASIL] AST Pointer: src/components/HeroCarousel.tsx::ventImageOnError (VentImage onError handler)
- **params**: e
- **ic_degiskenler**:
  - `target` — HTMLImageElement; hatalı resmin `<img>` elementi, `onerror`’u temizleyerek ve `src`’i varsayılan görsele değiştirerek geri dönüşüm sağlar.
- **Dönüş**: `void`

### [N11_NASIL] AST Pointer: src/components/HeroCarousel.tsx::featureItemMapper (meta.features.map callback)
- **params**: f: CategoryFeature, i: number
- **ic_degiskenler**:
  - `Icon` — React bileşeni; `IconMap` üzerinden özelliğin ikonunu alır, bulunamazsa `Activity` ikonunu varsayılan olarak kullanır.
- **Dönüş**: JSX elementi — bir özelliğin ikonu, başlığı ve açıklamasını gösteren `<div>`.

### [N12_NASIL] AST Pointer: src/components/HeroCarousel.tsx::openLeadModalClick (button onClick)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` — `window.openLeadModal?.()` çağrısıyla lead modalını açar (varsa).

### [N13_NASIL] AST Pointer: src/components/HeroCarousel.tsx::progressIndicatorClick (progress button onClick)
- **params**: 
- **ic_degiskenler**: - yok
- **Dönüş**: `void` — `setIsAutoPlaying(false)` ile otomatik oynatmayı durdurur ve `setCurrentIndex(idx)` ile ilgili slayta geçer.

### [N14_NASIL] AST Pointer: src/components/HeroCarousel.tsx::progressItemMapper (progress indicators map callback)
- **params**: _, idx
- **ic_degiskenler**: - yok
- **Dönüş**: JSX elementi — slayt göstergesi butonu; aktifse geniş bir mavi çizgi, değilse ince gri bir çizgi gösterir ve tıklandığında ilgili slayta geçer.

---

## NODE ID STANDARD

  file: src\components\HeroCarousel.tsx
  function: src\components\HeroCarousel.tsx::HeroCarousel

---

## DISA AKTARILANLAR (EXPORTS)
  export: HeroCarousel