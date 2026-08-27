---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\BrandsShowcase.tsx
skeleton_hash: 21e6e5421fcfb065
entity_hashes:
  func:BrandsShowcase: 396bbfa4a2991af7
  func:Lane: 607c875efec6621a
  overview: 5afeff1221c0bd64
  style_tokens: 90e49e0ab0d8115d
generated_at: 2026-08-27T07:53:05Z
---

## Genel Bakış

`BrandsShowcase` modülü, HVAC markalarını sürekli kayan bir şerit (marquee) formatında sunan bir vitrin bileşenidir. Modül, marka logolarının kesintisiz döngü halinde akmasını sağlayarak dinamik ve görsel çekici bir marka tanıtımı oluşturur.

## Fonksiyon Grupları

### Kaydırma Şeridi Bileşeni
Tek bir şerit üzerindeki marka öğelerini belirli bir sürede otomatik olarak kaydıran yardımcı bileşendir. Varsayılan 50 saniyelik döngü süresi ile sürekli bir animasyon akışı sağlar.
- Lane

### Ana Vitrin Bileşeni
Sayfada tam bir marka vitrini oluşturarak kaydırma şeridini yapılandırır ve kullanıma sunar. İçerisinde `Lane` bileşenini çağırarak HVAC markalarının gösterimini başlatır.
- BrandsShowcase

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilen varsayımlar listelenmiştir.

[Aksiyom 1]: Eğer `items` parametres

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

### [N1_NASIL] AST Pointer: src/components/BrandsShowcase.tsx::Lane
- **params**: `items` — HVAC_BRANDS dizisi türünde marka listesi, `durationSec` — animasyon süresi (varsayılan 50 saniye)
- **ic_degiskenler**:
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen, yerelleştirilmiş rota oluşturma fonksiyonları nesnesi
  - `repeated` — `useMemo` ile `items` dizisinin üç kez (`[...items, ...items, ...items]`) birleştirilmesiyle oluşan kaydırma animasyonu için tekrarlanmış dizi
  - `brand` — `repeated.map` içinde her bir marka nesnesi (`brand.slug` ve `brand.name` özelliklerine erişilir)
  - `idx` — `repeated.map` içinde her bir elemanın dizideki sayısal indeksi
- **Dönüş**: JSX — sonsuz kaydırma (marquee) animasyonlu marka logosu ızgarası bileşeni

### [N2_NASIL] AST Pointer: src/components/BrandsShowcase.tsx::(map callback)
- **params**: `brand` — tek bir marka nesnesi, `idx` — dizideki indeks numarası
- **ic_degiskenler**:
  - `brand` — marka nesnesi; `brand.slug` Link href'inde rota parametresi olarak, `brand.name` ise `BrandIcon` bileşenine prop olarak ve metin etiketinde kullanılır
  - `idx` — `key` prop'unu benzersiz kılmak için `brand.slug` ile birlikte birleştirilir (`${brand.slug}-${idx}`)
- **Dönüş**: JSX — tek bir marka için Link içinde logo, çizgi göstergesi ve isim etiketi içeren kart bileşeni

### [N3_NASIL] AST Pointer: src/components/BrandsShowcase.tsx::BrandsShowcase
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; `t('brands.sectionTitle')`, `t('brands.subtitlePart1')`, `t('brands.subtitlePart2')`, `t('brands.viewAll')` anahtarlarıyla metinleri çözer
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota fonksiyonları nesnesi; `Routes.brand(brand.slug)` ve `Routes.brands()` çağrılarıyla kullanılır
  - `brands` — `HVAC_BRANDS` sabitinden gelen marka listesi; `Lane` bileşenine `items` prop'u olarak aktarılır
- **Dönüş**: JSX — marka vitrin bölümü; başlık animasyonu, kenar solma efektli `Lane` kaydırma bileşeni ve "tümünü gör" bağlantısı içeren tam sayfa bölümü

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