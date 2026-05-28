---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\HeroCarousel.tsx
skeleton_hash: 4c1485db4b4d7c76
entity_hashes:
  func:HeroCarousel: ab714744003cac86
  overview: 4f1991c46b287359
  style_tokens: 08751a5dc318cad7
generated_at: 2026-05-28T22:35:48Z
---

## Genel Bakış
`HeroCarousel` modülü, dışarıdan sağlanan `categories` dizisini alarak ana sayfanın üst kısmında görsel bir kaydırma (carousel) bileşeni oluşturur. Bileşen, her kategori için bir slayt üretir, gerekli ikon ve meta verileri tamamlar ve kaydırma geçişlerini yönetir.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, bileşenin dışarıdan gelen veriyi alıp UI’yı render etmesinden sorumludur.  
- HeroCarousel  

### Veri Hazırlama (İçsel Yardımcılar – varsayılan olarak dosyada tanımlı)
Bu grup, `categories` öğelerindeki eksik ikon ve meta verileri `IconMap` ve `FALLBACK_METADATA` kullanarak tamamlar.  
- (İçsel yardımcı fonksiyonlar, örn. ikon eşleştirme, metadata doldurma)

### Carousel Kontrolü
Bu grup, slayt geçişleri, otomatik kaydırma ve kullanıcı etkileşimlerini (örn. önceki/sonraki butonları) yönetir.  
- (Kaydırma zamanlayıcıları, navigasyon handler’ları)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### HeroCarousel
**Ne yapar**: `HeroCarousel` bir React fonksiyonel bileşenidir; bileşen, dışarıdan `categories` adlı bir prop alır.

**Nasıl yapar**: Fonksiyonun iç mantığı ve işleyişi kaynak kodunda yer almamaktadır; bu nedenle uygulanma şekli belirtilmemiştir.

**Parametreler**:
- `categories`: *type not specified* — Bileşene dışarıdan sağlanan veri; tip bilgisi kodda tanımlı değildir.

**Dönüş**: `React.FC<HeroCarouselProps>` — `HeroCarouselProps` tipinde bir React fonksiyonel bileşenini döndürür.

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
- **params**: `categories` — dışarıdan gelen kategori listesi
- **ic_degiskenler**:
  - `wrapCategory` — `useCategoryViewModel` hookundan gelen, bir kategori nesnesini ViewModel’e dönüştüren fonksiyon
  - `t` — `useI18n` hookundan gelen çeviri fonksiyonu
  - `currentIndex` — aktif slaytın indeksini tutan state
  - `setCurrentIndex` — `currentIndex` state’ini güncelleyen setter
  - `isAutoPlaying` — otomatik geçişin açık/kapalı olduğunu belirten boolean state
  - `setIsAutoPlaying` — `isAutoPlaying` state’ini güncelleyen setter
  - `timeoutRef` — `setTimeout` kimliğini saklayan ref
  - `mainCategoryVms` — `useMemo` ile hesaplanan, üst‑seviye kategorilerin ViewModel’leri
  - `handleNext` — sonraki slayta geçiş yapan, otomatik oynatmayı durduran fonksiyon
  - `handlePrev` — önceki slayta geçiş yapan, otomatik oynatmayı durduran fonksiyon
- **Dönüş**: JSX element (hero carousel UI) veya `null` (eğer `mainCategoryVms.length === 0`)

### [N2_NASIL] AST Pointer: src/components/HeroCarousel.tsx::mainCategoryVms (useMemo callback)
- **params**: yok
- **ic_degiskenler**:
  - `categories` — dışarıdan gelen kategori listesi (kapalı)
  - `wrapCategory` — kategori → ViewModel dönüştürücü
  - `c` — geçici kategori nesnesi (filter içinde)
  - `a`, `b` — sıralama karşılaştırması için kullanılan iki kategori nesnesi
  - `vm` — `wrapCategory` sonucunda elde edilen ViewModel
- **Dönüş**: `NonNullable<typeof vm>` tipinde ViewModel dizisi

### [N3_NASIL] AST Pointer: src/components/HeroCarousel.tsx::reset effect (useEffect callback)
- **params**: yok
- **ic_degiskenler**:
  - `currentIndex` — mevcut aktif indeks
  - `mainCategoryVms` — hesaplanan ViewModel dizisi
  - `setCurrentIndex` — indeks state’ini sıfırlayan setter
- **Dönüş**: yok (yan etki: gerekirse `currentIndex`i 0’a ayarlar)

### [N4_NASIL] AST Pointer: src/components/HeroCarousel.tsx::auto‑play effect (useEffect callback)
- **params**: yok
- **ic_degiskenler**:
  - `isAutoPlaying` — otomatik oynatma flag’i
  - `mainCategoryVms` — ViewModel dizisi
  - `timeoutRef` — timeout kimliğini tutan ref
  - `setCurrentIndex` — indeks state’ini güncelleyen setter
  - `currentIndex` — mevcut indeks (temizleme fonksiyonunda kullanılır)
- **Dönüş**: temizleme fonksiyonu (timeout varsa `clearTimeout`)

### [N5_NASIL] AST Pointer: src/components/HeroCarousel.tsx::handleNext
- **params**: yok
- **ic_degiskenler**:
  - `setIsAutoPlaying` — otomatik oynatmayı durduran setter
  - `setCurrentIndex` — bir sonraki indeksi hesaplayıp güncelleyen setter
  - `mainCategoryVms` — toplam slayt sayısını belirlemek için kullanılan dizi
- **Dönüş**: yok (state güncellemeleriyle yan etki)

### [N6_NASIL] AST Pointer: src/components/HeroCarousel.tsx::handlePrev
- **params**: yok
- **ic_degiskenler**:
  - `setIsAutoPlaying` — otomatik oynatmayı durduran setter
  - `setCurrentIndex` — bir önceki indeksi hesaplayıp güncelleyen setter
  - `mainCategoryVms` — toplam slayt sayısını belirlemek için kullanılan dizi
- **Dönüş**: yok (state güncellemeleriyle yan etki)

### [N7_NASIL] AST Pointer: src/components/HeroCarousel.tsx::render slide callback `(vm, idx) => {...}`
- **params**:
  - `vm` — tek bir kategori ViewModel’i
  - `idx` — o slaytın dizindeki konumu
- **ic_degiskenler**:
  - `isActive` — `idx === currentIndex` kontrolü, slaytın görünür olup olmadığını belirler
  - `cat` — `vm.raw` üzerinden alınan ham kategori nesnesi
  - `meta` — kategori meta verisi; `cat.metadata` ya da `FALLBACK_METADATA[vm.slug]` ya da `FALLBACK_METADATA['default']`
  - `bgImage` — arka plan resmi URL’si; koşullu olarak `vm.imageUrl` veya varsayılan yol
  - `target` — `onError` içinde kullanılan `HTMLImageElement` referansı
- **Dönüş**: JSX element (tek slayt)

### [N8_NASIL] AST Pointer: src/components/HeroCarousel.tsx::image onError handler `(e) => {...}`
- **params**: `e` — `React.SyntheticEvent` (image hata olayı)
- **ic_degiskenler**:
  - `target` — `e.target` olarak tiplenmiş `HTMLImageElement`; hatalı görseli yedek görsele yönlendirir
- **Dönüş**: yok (image `src`’i değiştirme yan etkisi)

### [N9_NASIL] AST Pointer: src/components/HeroCarousel.tsx::features map callback `(f: CategoryFeature, i: number) => {...}`
- **params**:
  - `f` — tek bir özellik nesnesi (`CategoryFeature`)
  - `i` — özellik dizisindeki indeks
- **ic_degiskenler**:
  - `Icon` — `IconMap` üzerinden bulunan ikon bileşeni veya varsayılan `Activity`
- **Dönüş**: JSX element (özellik kartı)

### [N10_NASIL] AST Pointer: src/components/HeroCarousel.tsx::lead modal opener `( ) => { window.openLeadModal?.() }`
- **params**: yok
- **ic_degiskenler**:
  - `window.openLeadModal` — global fonksiyon, varsa çağrılır
- **Dönüş**: yok (global fonksiyon yan etkisi)

### [N11_NASIL] AST Pointer: src/components/HeroCarousel.tsx::progress indicator button callback `(_, idx) => {...}`
- **params**:
  - `_` — kullanılmayan slide öğesi (placeholder)
  - `idx` — tıklanan gösterge indeksi
- **ic_degiskenler**:
  - `setIsAutoPlaying` — otomatik oynatmayı durdurur
  - `setCurrentIndex` — göstergeye tıklanınca aktif indeksi `idx` olarak ayarlar
- **Dönüş**: yok (state güncellemeleriyle yan etki)

---

## NODE ID STANDARD

  file: src\components\HeroCarousel.tsx
  function: src\components\HeroCarousel.tsx::HeroCarousel

---

## DISA AKTARILANLAR (EXPORTS)
  export: HeroCarousel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-hero`, `lg:h-hvac-hero-lg`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-gradient-to-r`, `bg-secondary-blue`, `bg-white/10`, `bg-white/30`, `bg-white/5`, `bg-zinc-900`, `border-white/10`, `border-white/20`, `from-black/80`, `hover:bg-blue-600`, `hover:bg-white/10`, `hover:bg-white/20`, `hover:bg-white/50`, `lg:text-7xl`
- **Layout:** `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `block`, `bottom-10`, `flex`, `flex-col`, `flex-wrap`, `from-black/80`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `h-1.5`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${idx`, `${isActive`, `-translate-x-1/2`, `:`, `===`, `border`, `currentIndex`, `duration-1000`, `duration-300`, `duration-hvac-glacial`, `ease-in-out`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-offset-black/50`