---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\CinematicProductShowcase.tsx
skeleton_hash: b257c0119503781f
entity_hashes:
  func:CinematicProductShowcase: 3aa8752ddebafcfc
  func:Hotspot: de57d250f854e416
  func:handleMouseLeave: 60d41c470a6d0032
  func:handleMouseMove: 717aaec7fdab40a5
  overview: 543d609da89f6ecb
  style_tokens: f822c8b8db2eb0c1
generated_at: 2026-06-19T20:47:08Z
---

## Genel Bakış
CinematicProductShowcase, ürünleri sinematik ve etkileşimli bir şekilde sergileyen bir React bileşenidir. Hotspot noktaları aracılığıyla kullanıcıların ürün üzerindeki ilgi alanlarını keşfetmesini sağlar. Fare hareketlerine bağlı olarak hotspot'ların aktif durumunu dinamik olarak yönetir.

## Fonksiyon Grupları
### UI Bileşenleri
Ürün görselleri üzerindeki interaktif noktaları ve ana gösterim alanını oluşturan bileşenlerdir.
- CinematicProductShowcase, Hotspot

### Etkileşim Kontrolcüleri
Fare girişlerini dinleyerek hotspot'ların görünürlük ve aktiflik durumlarını yöneten olay işleyicileridir.
- handleMouseMove, handleMouseLeave

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ürün görselleri üzerinde sinematik bir etkileşim deneyimi sunar. Hotspot'lar aracılığıyla kullanıcının ürün üzerindeki belirli noktalarla etkileşime girmesi hedeflenir.

[Aksiyom 1]: Eğer `productImages` array'i boş veya tanımsız ise, bileşen gösterilecek ürün içeriği bulamaz.

[Aksiyom 2]: Eğer `Hotspot` için `x` veya `y` değeri tanımsız ise, hotspot yanlış konumda render edilir.

[Aksiyom 3]: Eğer `Hotspot` için `onToggle` callback'i tanımsız ise, hotspot tıklanabilirlik işlevini yerine getiremez.

[Aksiyom 4]: Eğer `Hotspot` için `label` tanımsız ise, kullanıcının hotspot'un amacını anlaması güçleşir.

[Aksiyom 5]: Eğer `handleMouseMove` için `React.MouseEvent` parametresi geçilmezse, fare pozisyonu okunamaz ve hotspots güncellenemez.

[Aksiyom 6]: Eğer `handleMouseLeave` çağrılmazsa, aktif hotspot'lar temizlenmez ve istenmeyen aktif durumlar kalıcı olur.

[Aksiyom 7]: Eğer `Hotspot`'un `isActive` değeri `boolean` türünde değilse, hotspots'ın aktif/pasif durumu tutarsız çalışır.

[Aksiyom 8]: Eğer `productImages` array'i tanımsız elemanlar içerirse, ürün görselleri düzgün yüklenemez.

---

## FONKSİYON DETAYLARI

### Hotspot
**Ne yapar**: Hotspot bileşeni, belirli bir koordinatta (x, y) bir etiket ve detay bilgisi gösteren interaktif bir nokta oluşturur. Bu bileşen, aktif durumuna göre daha fazla bilgi sunabilir ve kullanıcı etkileşimi ile durumunu değiştirebilir.
**Nasıl yapar**: Hotspot, onToggle fonksiyonunu çağırarak aktif hot spot'un durumunu değiştirir. Eğer zaten aktif olan hot spot tıklanırsa deaktif eder, aksi halde aktif eder. Bu mantık, setActiveHotspot fonksiyonu ile yönetim merkezinde saklanan bir duruma bağlıdır.
**Parametreler**:
- x: number — Hot spot'un yatay konumunu belirtir.
- y: number — Hot spot'un dikey konumunu belirtir.
- label: string — Hot spot'un üzerinde görünecek kısa etiket metni.
- detail: string — Hot spot hakkında daha fazla bilgi sağlayan açıklama metni.
- isActive: boolean — Hot spot'un şu anda aktif olup olmadığını belirten bayrak.
- onToggle: () => void — Hot spot tıklandığında çağrılan, durumu değiştiren geri çağırma işlevi.
**Dönüş**: React.FC<HotspotProps> — Hotspot bileşenini döndürür.

### CinematicProductShowcase
**Ne yapar**: CinematicProductShowcase bileşeni, ürünleri sinematik bir şekilde sergileyen bir vitrin oluşturur. Bu bileşen, genellikle ana sayfada veya ürün sayfalarında kullanılarak ürünlerin görsel sunumunu zenginleştirir.
**Nasıl yapar**: Bileşen, ürün verilerini alarak sinematik efektlerle birlikte görsel bir gösteri sunar. Animasyonlar ve geçişler kullanarak ürünleri dikkat çekici bir şekilde sunabilir. Detaylı uygulama iç mantığı, sağlanan bilgilerde yer almamaktadır.
**Parametreler**: Parametre almaz.
**Dönüş**: React.FC — CinematicProductShowcase bileşenini döndürür.

### handleMouseMove
**Ne yapar**: handleMouseMove, fare hareketi olayını işleyerek bileşen içindeki fare konumunu günceller veya fare hareketine bağlı işlevsellik sağlar.
**Nasıl yapar**: Bu işlev, farenin harekettiği her noktada çağrılır ve olay nesnesinden fare koordinatlarını alarak bileşenin durumunu güncelleyebilir. Fare hareketine bağlı animasyonlar, etkileşimler veya konum hesaplamaları yapabilir. Sağlanan bilgilerde iç mantık detayı bulunmamaktadır.
**Parametreler**:
- e: React.MouseEvent — Fare hareketi olayı nesnesini temsil eder ve fare konumu gibi bilgileri içerir.
**Dönüş**: void — Fonksiyon bir değer döndürmez.

### handleMouseLeave
**Ne yapar**: handleMouseLeave, fare bileşenin alanından ayrıldığında çağrılan bir olay işleyicisidir ve fare bırakma durumunu yönetir.
**Nasıl yapar**: Bu işlev, fare bileşenin sınırlarından çıktığında tetiklenir ve genellikle fare ile ilişkilendirilmiş geçici durumları sıfırlamak veya etkileşimleri sonlandırmak için kullanılır. Fare離開后, bileşenin görünümünü veya durumunu orijinal haline döndürebilir. İç mantık detayı sağlanmamıştır.
**Parametreler**: Parametre almaz.
**Dönüş**: void — Fonksiyon bir değer döndürmez.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: framer-motion::AnimatePresence
- import: framer-motion::motion
- import: framer-motion::useMotionValue
- import: framer-motion::useSpring
- import: framer-motion::useTransform
- import: next/image::Image
- import: react::React
- import: react::useRef
- import: react::useState

---

## INTERFACES

### HotspotProps
- `x: number`
- `y: number`
- `label: string`
- `detail: string`
- `isActive: boolean`
- `onToggle: () => void`

---

## SABİTLER
- **productImages** (array) — `[
  { 
    src: '/images/vortice_lineo_futuristic.webp', 
    label: 'Futu...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CinematicProductShowcase.tsx::Hotspot
- **params**: `{ x, y, label, detail, isActive, onToggle }`
  - `x` — Hotspot'ın yatay yüzdesel konumu (CSS left için)
  - `y` — Hotspot'ın dikey yüzdesel konumu (CSS top için)
  - `label` — Hotspot butonunun görünen etiket metni
  - `detail` — Tooltip içinde gösterilen açıklama metni
  - `isActive` — Hotspot'ın şu an açık olup olmadığını belirten boolean
  - `onToggle` — Hotspot'a tıklandığında çağrılan toggle fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu
- **Dönüş**: JSX (tooltip ve hotspot butonu)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    CinematicProductShowcase_tsx__CinematicProductShowcase["CinematicProductShowcase"]
    CinematicProductShowcase_tsx__Hotspot["Hotspot"]
    CinematicProductShowcase_tsx__handleMouseLeave["handleMouseLeave"]
    CinematicProductShowcase_tsx__handleMouseMove["handleMouseMove"]
```

## NODE ID STANDARD

  file: src\components\home\CinematicProductShowcase.tsx
  function: src\components\home\CinematicProductShowcase.tsx::Hotspot
  function: src\components\home\CinematicProductShowcase.tsx::CinematicProductShowcase
  function: src\components\home\CinematicProductShowcase.tsx::handleMouseMove
  function: src\components\home\CinematicProductShowcase.tsx::handleMouseLeave

---

## DISA AKTARILANLAR (EXPORTS)
  export: CinematicProductShowcase
  export: Hotspot

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-hero`, `hover:shadow-glow-lg`, `rounded-hvac-3xl`, `shadow-glow-md`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-500`, `bg-cyan-500/10`, `bg-cyan-500/20`, `bg-cyan-500/50`, `bg-cyan-grid`, `bg-gradient-to-r`, `bg-grid-100`, `bg-indigo-500/10`, `bg-slate-900`, `bg-slate-900/95`, `bg-slate-950`, `bg-white`, `bg-white/1`, `bg-white/10`
- **Layout:** `absolute`, `backdrop-blur-3xl`, `backdrop-blur-xl`, `bg-cyan-grid`, `bg-grid-100`, `bottom-0`, `bottom-10`, `bottom-full`, `drop-shadow-cinematic-drop`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-20`, `gap-3`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${activeImageIdx`, `${isActive`, `-inset-1`, `-translate-x-1/2`, `-translate-y-1.5`, `:`, `===`, `animate-ping`, `animate-pulse`, `aspect-square`, `blur-120`, `blur-150`, `blur-3xl`, `border`, `content-auto`