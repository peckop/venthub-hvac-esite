---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\BrandsShowcase.tsx
skeleton_hash: ff89f158a8590368
entity_hashes:
  func:BrandsShowcase: 396bbfa4a2991af7
  func:Lane: 607c875efec6621a
  overview: 5afeff1221c0bd64
  style_tokens: 90e49e0ab0d8115d
generated_at: 2026-08-27T13:04:43Z
---

## Genel Bakış

`BrandsShowcase` modülü, HVAC markalarını sürekli kayan bir şerit (marquee) formatında sunan bir vitrin bileşenidir. Modül, marka logolarının kesintisiz döngü halinde akmasını sağlayarak dinamik ve görsel açıdan çekici bir marka tanıtımı oluşturur.

## Fonksiyon Grupları

### Kaydırma Şeridi Bileşeni
Tek bir şerit üzerindeki marka öğelerini belirli bir sürede otomatik olarak kaydıran yardımcı bileşendir. Varsayılan 50 saniyelik döngü süresi ile sürekli bir animasyon akışı sağlar.
- Lane

### Ana Vitrin Bileşeni
Sayfada tam bir marka vitrini oluşturarak kaydırma şeridini yapılandırır ve kullanıma sunar. İçerisinde `Lane` bileşenini çağırarak HVAC markalarının gösterimini başlatır.
- BrandsShowcase

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HVAC markalarını sürekli kayan şeritler halinde gösteren bir vitrin bileşenidir.

**[Aksiyom 1]**: Eğer `HVAC_BRANDS` adında bir veri kaynağı (marka listesi) tanımlı değilse, `Lane` bileşeninin `items` parametresi için tip referansı (`typeof HVAC_BRANDS`) çözülemez ve bileşen derlenemez.

**[Aksiyom 2]**: Eğer `items` parametresi boş bir dizi olarak verilirse, şerit üzerinde gösterilecek marka öğesi olmayacağından animasyon akışı gerçekleşmez.

**[Aksiyom 3]**: Eğer `durationSec` değeri sıfır veya negatif olursa, CSS animasyon süresi geçersiz olacağından kayma hareketi düzgün çalışmaz. Varsayılan değer 50 saniyedir.

**[Aksiyom 4]**: Eğer `BrandsShowcase` bileşeni içinde `Lane` bileşeni kullanılmıyorsa, eski dokümanda belirtilen "kayıt şeridini yapılandırır ve kullanıma sunar" davranışı yerine getirilemez.

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

## İTHALATLAR (IMPORTS)
- import: ../data/brands::HVAC_BRANDS
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ./HVACIcons::BrandIcon
- import: framer-motion::motion
- import: next/link::Link
- import: react::React
- import: react::useMemo

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BrandsShowcase.tsx::Lane
- **params**: `items` (typeof HVAC_BRANDS), `durationSec` (number, varsayılan değer: 50)
- **ic_degiskenler**:
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota fonksiyonları nesnesi; `Routes.brand(brand.slug)` çağrılarak marka detay sayfası URL'i üretilir
  - `repeated` — `useMemo` ile hesaplanan, `items` dizisinin 3 kez (`[...items, ...items, ...items]`) tekrar edilerek birleştirilmiş hali; bağımlılık dizisi `[items]`
  - `brand` — `repeated.map()` callback'indeki her bir marka nesnesi; `.slug` ve `.name` alanlarına erişilir
  - `idx` — `repeated.map()` callback'indeki döngü indeksi; key üretimi için `${brand.slug}-${idx}` şeklinde kullanılır
- **Dönüş**: JSX elementi — `div.relative.overflow-hidden.group` kök elemanı; içinde `style` (inline CSS keyframes), `div.flex.marquee-premium-track` (marka kartlarının kaydırıldığı bant) ve `repeated.map()` ile üretilen `Link` öğeleri içerir

---

### [N2_NASIL] AST Pointer: BrandsShowcase.tsx::BrandsShowcase
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('brands.sectionTitle')`, `t('brands.subtitlePart1')`, `t('brands.subtitlePart2')`, `t('brands.viewAll')` çağrılarıyla metinler alınır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota fonksiyonları nesnesi; `Routes.brands()` çağrılarak tüm markalar sayfası URL'i üretilir
  - `brands` — `HVAC_BRANDS` import'undan gelen marka listesi; `Lane` bileşenine `items` prop'u olarak aktarılır
- **Dönüş**: JSX elementi — `section.relative.bg-white` kök elemanı; arka plan atmosferi (`div.bg-brands-radial`), başlık alanı (`motion.div` ve `motion.h2` ile animasyonlu), kenar solma efektli `Lane` carousel'i (`durationSec={70}`) ve "tümünü gör" CTA linki (`Routes.brands()`) içerir

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