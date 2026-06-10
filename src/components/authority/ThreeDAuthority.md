---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\authority\ThreeDAuthority.tsx
skeleton_hash: a5417eb78feadf0c
entity_hashes:
  func:Model: cad84f3d7aa627bb
  func:ThreeDAuthority: 719c18fa619c7fe9
  overview: 53fe48ece7de08da
  style_tokens: 79effa301ffb588d
generated_at: 2026-06-10T09:12:03Z
---

## Genel Bakış
Bu modül, bir 3‑boyutlu modelin görselleştirilmesi ve ona ait etkileşimli noktaların (hotspot) yönetimi için iki işlevselliği birleştirir. `ThreeDAuthority` bileşeni dışarıdan gelen veri paketini alır ve içindeki `Model` bileşenine yönlendirerek model yükleme ve hotspot gösterimini tek bir yerde sağlar.

## Fonksiyon Grupları
### Model Render ve Hotspot Yönetimi  
Model işlevi, verilen URL’den 3‑boyutlu sahneyi yükler, mevcut hotspot verilerini alır ve bu noktaları sahne içinde etkileşimli işaretçiler olarak ekler.  
- Model

### Üst‑Seviye Yetki ve Veri Bağlama  
ThreeDAuthority işlevi, dışarıdan gelen metadata (model URL’si ve hotspot tanımları) ve isteğe bağlı CSS sınıfını alır, bu bilgileri Model bileşenine aktararak bütünleşik bir 3‑D yetki görüntüsü oluşturur.  
- ThreeDAuthority

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için aşağıdaki varsayımlar geçerlidir:

[Aksiyom 1]: Eğer Model bileşenine `url` prop'u string olarak verilmezse, 3B model yüklenemez ve render hatası oluşur.  
[Aksiyom 2]: Eğer Model bileşenine `hotspots` prop'u verilmişse ama onun tipi `ThreeDMetadata['hotspots']` ile uyuşmuyorsa, hotspot işaretçileri doğru oluşturulamaz veya çalışma zamanı hatası olur.  
[Aksiyom 3]: Eğer ThreeDAuthority bileşenine `metadata` prop'u verilmezse veya `metadata.url` eksikse, Model bileşenine geçirilen `url` tanımsız olur ve model yüklenemez.  
[Aksiyom 4]: Eğer ThreeDAuthority bileşenine `metadata` prop'u verilmezse veya `metadata.hotspots` eksikse, Model bileşenine geçirilen `hotspots` tanımsız olur ve hotspot renderı atlanabilir veya hata verir.  
[Aksiyom 5]: Eğer ThreeDAuthority bileşenine `className` prop'u string olmayan bir değer verilirse, CSS sınıfı uygulanamaz ve olası bir type hatası oluşur.

---

## FONKSİYON DETAYLARI

### Model
**Ne yapar**: Verilen `url` ve opsiyonel `hotspots` ile bir 3D modeli render eder.  
**Nasıl yapar**: `url` parametresi kullanılarak model yüklenir; `hotspots` sağlanmışsa model üzerine bu noktalar eklenir (detaylı yükleme mantığı kaynak kodunda bulunur).  
**Parametreler**:
- `url`: string — render edilecek 3D modelinin adresi (GLB/GLTF formatında).  
- `hotspots`: ThreeDMetadata['hotspots']? — model üzerine eklemek isteğe bağlı etkileşim noktaları listesi; tanımlanmazsa hiçbir hotspot eklenmez.  
**Dönüş**: void — fonksiyon JSX elementi döndürür, açık bir değer döndürmez.

### ThreeDAuthority

**Ne yapar**: ThreeDAuthority, gerçek 3D ürün modellerini (GLB/GLTF formatında) interaktif olarak tarayıcıda render eden bir React bileşenidir. Bileşen, performans optimizasyonu için 'Click-to-Load' stratejisi uygulayarak başlangıçta hafif bir placeholder gösterir ve kullanıcı etkileşimi sonrasında tam 3D motorunu başlatır.

**Nasıl yapar**: Fonksiyon, React useState hook'u ile `isStarted` durumunu yönetir. Başlangıçta `isStarted` false olduğunda, animasyonlu bir yükleme ikonu ve "Click to Initialize Engine" yazısı içeren tıklanabilir bir placeholder bileşeni döndürür. Kullanıcı bu alana tıkladığında `isStarted` true olur ve bileşen tam 3D Canvas yapısına geçiş yapar. Canvas içinde React Three Fiber kütüphanesi kullanılarak PerspectiveCamera, ambientLight, spotLight, OrbitControls ve Model bileşenleri render edilir. `metadata` objesinden gelen yapılandırma değerleri (modelUrl, hotspots, autoRotate, initialZoom, environment, shadows) ile sahne özelleştirilir. frameloop parametresi, autoRotate aktifse 'always', değilse 'demand' olarak ayarlanarak performans optimizasyonu sağlanır.

**Parametreler**:
- `metadata`: ThreeDAuthorityProps — 3D sahne yapılandırma bilgilerini içeren obje. İçerisinde `modelUrl` (3D model dosya yolu), `hotspots` (etkileşimli noktalar dizisi), ve `config` (sahne ayarları) alanları bulunur. `config` içinde `autoRotate` (otomatik döndürme), `initialZoom` (başlangıç zoom mesafesi), `environment` (ortam preset'i, varsayılan 'studio'), ve `shadows` (gölge durumu) özellikleri yer alır.
- `className`: string — Varsayılan değeri boş string olan opsiyonel parametre. Bileşenin kök elementine ek CSS sınıfı eklemek için kullanılır. Dışarıdan stillendirme ve layout kontrolü sağlar.

**Dönüş**: JSX.Element — Bileşen her durumda bir React JSX yapısı döndürür. `isStarted` durumuna göre ya placeholder yapısı ya da tam 3D Canvas yapısı render edilir. Return type olarak `JSX.Element` veya `React.ReactElement` kullanılır.

---

## INTERFACES

### ThreeDAuthorityProps
- `metadata: ThreeDMetadata`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/authority/ThreeDAuthority.tsx`::Model
- **params**:
  - `url: string` — 3D model dosyasının URL adresi, useGLTF'e doğrudan verilir
  - `hotspots?: ThreeDMetadata['hotspots']` — opsiyonel hotspots dizisi, 3D sahne üzerinde interaktif noktalar tanımlar
- **ic_degiskenler**:
  - `scene` — useGLTF(url) hook'undan dönen GLTF sahne objesi, `<primitive object={scene}>` ile Canvas'a yerleştirilir
  - `spot` — hotspots.map() iterator callback içindeki mevcut hotspots elemanı, `spot.position`, `spot.label`, `spot.description` erişimleri yapılır
  - `idx` — hotspots.map() iterator callbackindeki indeks, `<Html key={idx}>` olarak React key olarak kullanılır
- **Dönüş**: JSX — `<group>` içinde `<primitive>` ve maplenmiş `<Html>` hotspot bileşenleri döner

### [N2_NASIL] AST Pointer: `src/components/authority/ThreeDAuthority.tsx`::ThreeDAuthority
- **params**:
  - `metadata: ThreeDAuthorityProps` — 3D bileşenin yapılandırma verisi, `metadata.modelUrl`, `metadata.hotspots`, `metadata.config?.autoRotate`, `metadata.config?.initialZoom`, `metadata.config?.environment`, `metadata.config?.shadows` alanları erişilir
  - `className: string` (varsayılan `''`) — dışarıdan ek stillendirme sınıfı, motion.div'in className birleştirilmesinde kullanılır
- **ic_degiskenler**:
  - `isStarted` — React.useState(false) state'inden dönen boolean değer, 3D motorun başlatılıp başlatılmadığını tutar; `false` iken placeholder UI, `true` iken Canvas render edilir
  - `setIsStarted` — React.useState'den dönen state setter fonksiyonu, onClick handler içinde `setIsStarted(true)` çağrılarak 3D sahne başlatılır
- **Dönüş**: JSX — `isStarted === false` iken tıklanabilir placeholder `<motion.div>` (spinner animasyonlu "Click to Initialize Engine" ekranı); `isStarted === true` iken `<Canvas>` içeren tam interaktif 3D görünüm (`Model`, `Environment`, `ContactShadows`, `OrbitControls`, `PerspectiveCamera` bileşenleriyle birlikte) döner

---

## NODE ID STANDARD

  file: src\components\authority\ThreeDAuthority.tsx
  function: src\components\authority\ThreeDAuthority.tsx::Model
  function: src\components\authority\ThreeDAuthority.tsx::ThreeDAuthority

---

## DISA AKTARILANLAR (EXPORTS)
  export: Model
  export: ThreeDAuthority

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `bg-white`, `bg-white/50`, `bg-white/90`, `border-2`, `border-primary-navy`, `border-slate-200`, `border-t-transparent`, `border-white`, `text-center`, `text-industrial-gray`, `text-slate-400`, `text-slate-500`, `text-steel-gray`
- **Layout:** `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `bottom-4`, `flex`, `flex-col`, `group-hover:block`, `h-16`, `h-2`, `h-4`, `h-8`, `hidden`, `items-center`, `justify-center`, `left-4`
- **Varyant/Responsive:** `group-hover:` önekleri
- **Yardımcı Sınıflar:** `${className`, `animate-pulse`, `animate-spin`, `animate-spin-slow`, `border`, `cursor-pointer`, `font-black`, `font-bold`, `group`, `group-hover:scale-110`, `inset-0`, `leading-tight`, `mb-1`, `mb-2`, `mt-1`