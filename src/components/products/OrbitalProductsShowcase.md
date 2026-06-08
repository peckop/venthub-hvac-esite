---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\OrbitalProductsShowcase.tsx
skeleton_hash: 77475059a00392ea
entity_hashes:
  func:CarouselItems: 8743b05fe58c4b61
  func:MotionTransitionFix: 1a110cb52e216641
  func:OrbitalCard: 5f8b11d8a7df6582
  func:OrbitalProductsShowcase: bd6af57cea7cdfce
  func:PlaceholderWireframe: 898e3b157cc5ab58
  func:Stage: 2be6dd08d71373b2
  func:SuspendedCardMaterial: 54a137dad175681b
  func:getRadius: b18a5bb0ae26a40e
  func:handlePointerDownFull: c1d2f3b5b3e63706
  func:handlePointerMove: aa98993324c3949d
  func:handlePointerOut: 16e97883514593a3
  func:handlePointerOver: b0b11be743d1be3d
  func:handlePointerUp: 47dcb3f345fcf0ef
  overview: 770a2185271f5119
  style_tokens: 41b9c7751fc87745
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, ürünleri 3 boyutlu yörüngesel bir vitrinde interaktif olarak sergileyen bir React/Three.js bileşenidir. Kullanıcıların ürün kartlarıyla fare etkileşimleri (üzerine gelme, tıklama, sürükleme) kurarak vitrini gezmesini sağlar ve bu süreçte paylaşılan durum üzerinden tüm alt bileşenlerin koordineli çalışmasını yönetir.

## Fonksiyon Grupları
### Ana Vitrin ve Koordinasyon
Sergileme sisteminin üst düzey kontrolünü ve tüm etkileşim akışını (sürükleme, odak, duraklama) koordine eden ana bileşenleri barındırır.
- OrbitalProductsShowcase, CarouselItems

### 3B Sahne ve Geometrik Hesaplamalar
Ürünlerin dairesel dizideki konumlarını hesaplayan yardımcı fonksiyonları ve 3B sahne yapısını oluşturur.
- Stage, getRadius

### Kart Görselleştirme ve Malzemeler
Ürün kartlarının 3D görünümünü, yer tutucu modelleri, animasyon düzeltmelerini ve Malzeme (materyal) ayarlarını tanımlar.
- OrbitalCard, PlaceholderWireframe, SuspendedCardMaterial, MotionTransitionFix

### İşaretleyici (Pointer) Etkileşimleri
Kullanıcının fare ile sahne üzerindeki sürükleme ve bırakma işlemlerini yöneten olay işleyicileri içerir.
- handlePointerOver, handlePointerOut, handlePointerDownFull, handlePointerMove, handlePointerUp

---

## AXIOMS – Mimari Varsayımlar

Bu modül, 3B yörüngesel vitrin sistemi için aşağıdaki zorunlu koşullara bağlıdır:

---

## FONKSİYON DETAYLARI

### Stage
**Ne yapar**: Orbital ürün karuselinin hemen yüklenen sahne zemini ve özel efektlerini oluşturan React bileşenidir. 3B sahnenin temel altyapısını oluşturarak tüm alt içeriklerin üzerinde çalışmasını sağlar.
**Nasıl yapar**: OrbitalProductsShowcase ana bileşeninin yükleme sırasının en başında çalışır, kendisine iletilen paylaşılmış durum referansını tüm alt bileşenlere ileterek tüm sahne öğelerinin ortak durumu paylaşmasını sağlar. Gerçek zamanlı efektleri sahne zeminiyle bütünleştirerek sorunsuz bir görsel deneyim sunar.
**Parametreler**:
- name: sharedState, type: React.MutableRefObject<SharedState> — Tüm sahne içindeki bileşenlerin paylaştığı ortak durumu tutan değiştirilebilir referans nesnesi
**Dönüş**: React.FC türünde, karusel sahnesini oluşturan React bileşeni döndürür.

### getRadius
**Ne yapar**: Orbital karusel içindeki ürün kartlarının 3B alanda düzgün dağılması için gerekli sahne yarıçapını hesaplayan yardımcı fonksiyondur.
**Nasıl yapar**: Toplam ürün sayısı, kart boyutları ve model ölçeği gibi değişkenlere göre optimum yarıçap değerini hesaplar, böylece kartlar birbiriyle çakışmadan düzgün bir dairesel düzende yer alır.
**Parametreler**: Bulunmamaktadır
**Dönüş**: Dönüş tipi belirtilmemiştir, karusel düzenlemesi için gerekli yarıçap değerini döndürmesi amaçlanmıştır.

### PlaceholderWireframe
**Ne yapar**: 3B yükleme animasyonu için kullanılan geçici wireframe şeklini oluşturan React bileşenidir. Gerçek 3B model veya dokü yüklenene kadar gösterilir.
**Nasıl yapar**: Girilen ölçek değerine göre boyutlandırılarak ekrana çizilir, yükleme sürecinde boşluk oluşturmadan kullanıcıya bir görsel ipucu sunar. Sahne içindeki konumuna uygun olarak ölçeklenerek orantısızlık yaratmaz.
**Parametreler**:
- name: scale, type: number | opsiyonel, varsayılan değeri 1 — Wireframe'in genel boyut çarpanını belirten ölçek değeri
**Dönüş**: Dönüş tipi belirtilmemiştir, React elementi olarak ekrana wireframe içeriği sunar.

### SuspendedCardMaterial
**Ne yapar**: Kategori dışı standart resimli kartlar için dokü yüklenene kadar bekleyen özel materyal bileşenidir.
**Nasıl yapar**: Kendisine iletilen son görsel yolu üzerinden doküyü yüklemeye çalışır, yükleme tamamlanana kadar geçici materyal kullanır. Fare kartın üzerindeyse (hovered) ekstra görsel efektler uygulayarak etkileşim olduğunu belli eder.
**Parametreler**:
- name: finalPath, type: string | null — Kartın yüklenecek son doküsünün dosya yolu, null olması durumunda geçici materyal sürekli gösterilir
- name: hovered, type: boolean — Fare imlecinin kart üzerinde olup olmadığını belirten bayrak, materyale ekstra efektler uygulamak için kullanılır
**Dönüş**: Dönüş tipi belirtilmemiştir, 3B kart üzerinde kullanılmak üzere hazırlanmış materyal öğesini döndürür.

### OrbitalCard
**Ne yapar**: 3B karusel içinde yer alan tek bir ürün kartını oluşturan ana ürün bileşenidir. Tüm kullanıcı etkileşimlerini ve kartın görsel özelliklerini yönetir.
**Nasıl yapar**: Kendisine iletilen ürün verisi, ortak durum ve geri çağırım fonksiyonlarını kullanarak 3B alanda konumlandırılır, sürükleme, tıklama, odaklama gibi tüm kullanıcı aksiyonlarını işler. Ön plana alma, sürükleme durumu ayarlama gibi işlemleri tetikler, kartın üzerine ipucu görselleri ekler ve model ölçeğine göre boyutlandırılır.
**Parametreler**:
- name: item, type: ProductItem — Kartın üzerinde gösterileceği ürün verisini içeren nesne
- name: index, type: number — Kartın karusel içindeki sıra numarası
- name: total, type: number — Karusel içindeki toplam kart sayısı
- name: sharedState, type: React.MutableRefObject<SharedState> — Tüm kartların paylaştığı ortak durumu tutan değiştirilebilir referans nesnesi
- name: onHover, type: (hovering: boolean) => void — Fare kart üzerine geldiğinde veya ayrıldığında tetiklenen, durumunu ileten geri çağırım fonksiyonu
- name: onBringToFront, type: (index: number) => void — Kartı en ön plana almak için tetiklenen, sıra numarasını ileten geri çağırım fonksiyonu
- name: setIsDragging, type: (dragging: boolean) => void — Kartın sürüklenme durumunu ayarlamak için kullanılan geri çağırım fonksiyonu
- name: isDraggingRef, type: React.MutableRefObject<boolean> — Kartın o anda sürüklenip sürüklenmediğini tutan değiştirilebilir referans
- name: onCardClick, type: (itemId: string, event?: MouseEvent) => void | opsiyonel — Kart tıklandığında tetiklenen, ürün kimliğini ve isteğe bağlı fare olayını ileten geri çağırım
- name: onFocusedItemChange, type: (itemId: string | null) => void | opsiyonel — Odaklanan ürün değiştiğinde tetiklenen, yeni odaklanan ürün kimliğini veya null değerini ileten geri çağırım
- name: isFrontCard, type: boolean — Kartın o anda en ön planda olup olmadığını belirten bayrak
- name: shouldShowTapHint, type: boolean — Kart üzerinde tıklama ipucunun gösterilip gösterilmeyeceğini belirten bayrak
- name: shouldShowDragHint, type: boolean — Kart üzerinde sürükleme ipucunun gösterilip gösterilmeyeceğini belirten bayrak
- name: modelScale, type: number — Kart 3B modelinin genel boyut çarpanını belirten ölçek değeri
**Dönüş**: React.FC türünde, tek ürün kartını ekrana çizen React bileşeni döndürür.

### handlePointerOver
**Ne yapar**: 3B sahne üzerindeki Three.js nesneleri üzerine fare imleci geldiğinde tetiklenen olay işleyici fonksiyonudur.
**Nasıl yapar**: Fare imlecinin 3B nesne üzerinde olduğunu algılar, ilgili kartın hover durumunu güncellemek için gerekli aksiyonları tetikler, görsel efektlerin devreye girmesini sağlar.
**Parametreler**:
- name: e, type: ThreeEvent<PointerEvent> — Three.js tarafından üretilen, fare üzerine gelme olayını içeren olay nesnesi
**Dönüş**: Dönüş tipi belirtilmemiştir, olay işleyici olarak çalışır.

### handlePointerOut
**Ne yapar**: 3B sahne üzerindeki Three.js nesnelerinden fare imleci ayrıldığında tetiklenen olay işleyici fonksiyonudur.
**Nasıl yapar**: Fare imlecinin nesneden ayrıldığını algılar, ilgili kartın aktif hover durumunu sıfırlar, uygulanan ekstra görsel efektleri kaldırır.
**Parametreler**:
- name: e, type: ThreeEvent<PointerEvent> — Three.js tarafından üretilen, fare ayrılma olayını içeren olay nesnesi
**Dönüş**: Dönüş tipi belirtilmemiştir, olay işleyici olarak çalışır.

### CarouselItems
**Ne yapar**: Tüm ürün kartlarını ve karusel mantığını yöneten, React Suspense bileşeni içinde çalışan ana koleksiyon bileşenidir.
**Nasıl yapar**: Kendisine iletilen ürün listesini alarak 3B karusel içinde düzenler, duraklatma, sürükleme, etkileşim tetikleme gibi tüm karusel işlevlerini yönetir. Alt kartlara gerekli tüm prop ve geri çağırım fonksiyonlarını iletir, ipucu sisteminin farklı aşamalarını yönetir, tüm ürünler yüklendiğinde hazırlık durumunu bildiren onReady geri çağırımını tetikler.
**Parametreler**:
- name: items, type: ProductItem[] — Karusel içinde gösterilecek tüm ürünlerin verisini içeren dizi
- name: isPaused, type: boolean — Karusel otomatik döngüsünün duraklatılıp duraklatılmadığını belirten bayrak
- name: onHover, type: (h: boolean) => void — Herhangi bir kartın üzerine gelindiğinde tetiklenen, durumunu ileten geri çağırım
- name: dragDelta, type: number — Kullanıcının sürükleme işlemiyle oluşturduğu konum değişikliği değeri
- name: onInteract, type: () => void — Kullanıcı herhangi bir etkileşimde bulunduğunda tetiklenen geri çağırım fonksiyonu
- name: sharedState, type: React.MutableRefObject<SharedState> — Tüm karusel öğelerinin paylaştığı ortak durumu tutan değiştirilebilir referans nesnesi
- name: isDraggingRef, type: React.MutableRefObject<boolean> — Herhangi bir kartın o anda sürüklenip sürüklenmediğini tutan değiştirilebilir referans
- name: setIsDragging, type: (val: boolean) => void — Genel sürükleme durumunu ayarlamak için kullanılan geri çağırım fonksiyonu
- name: onCardClick, type: (itemId: string, event?: MouseEvent) => void | opsiyonel — Herhangi bir kart tıklandığında tetiklenen, ürün kimliğini ve isteğe bağlı fare olayını ileten geri çağırım
- name: onFocusedItemChange, type: (itemId: string | null) => void | opsiyonel — Odaklanan ürün değiştiğinde tetiklenen, yeni odaklanan ürün kimliğini veya null değerini ileten geri çağırım
- name: onFrontCardChange, type: (itemId: string) => void | opsiyonel — En ön plandaki ürün değiştiğinde tetiklenen, yeni ön plandaki ürün kimliğini ileten geri çağırım
- name: shouldShowTapHint, type: boolean — Tüm kartlar üzerinde tıklama ipucunun gösterilip gösterilmeyeceğini belirten bayrak
- name: shouldShowDragHint, type: boolean — Tüm kartlar üzerinde sürükleme ipucunun gösterilip gösterilmeyeceğini belirten bayrak
- name: hintStage, type: 'idle' | 'tap' | 'drag' | 'cooldown' | 'finished' — İpucu sisteminin o andaki aşamasını belirten durum değeri
- name: onStageChange, type: (stage: 'idle' | 'tap' | 'drag' | 'cooldown' | 'finished') => void — İpucu aşaması değiştiğinde tetiklenen, yeni aşamayı ileten geri çağırım fonksiyonu
- name: modelScale, type: number — Tüm kart 3B modellerinin genel boyut çarpanını belirten ölçek değeri
- name: onReady, type: () => void — Tüm karusel öğeleri yüklendiğinde ve hazır olduğunda tetiklenen geri çağırım fonksiyonu
**Dönüş**: React.FC türünde, tüm ürün kartlarını ve karusel mantığını yöneten React bileşeni döndürür.

### MotionTransitionFix
**Ne yapar**: Framer Motion ölçek geçişleri sırasında React Three Fiber (R3F) başlangıç karelerini zorla render etmeye yarayan iç yardımcı fonksiyondur.
**Nasıl yapar**: Global window nesnesine gereksiz yeniden boyutlandırma olayları eklemeden, Framer Motion ile R3F arasındaki ölçek geçişi uyumsuzluğunu giderir, ilk karelerin doğru şekilde renderlanmasını sağlayarak görsel bozuklukları ortadan kaldırır.
**Parametreler**: Bulunmamaktadır
**Dönüş**: Dönüş tipi belirtilmemiştir, geçiş sırasında gerekli render işlemlerini tetikleyen iç yardımcı olarak çalışır.

### OrbitalProductsShowcase
**Ne yapar**: Tüm orbital ürün karuselini kapsayan ana üst React bileşenidir. Tüm alt bileşenleri birleştirerek tek bir kullanılabilir bileşen olarak sunar.
**Nasıl yapar**: İçinde Stage, CarouselItems, MotionTransitionFix gibi tüm alt bileşenleri bütünleştirir, dışarıdan alınan tüm prop ve geri çağırım fonksiyonlarını ilgili alt bileşenlere ileterek tüm karusel sisteminin sorunsuz çalışmasını sağlar. Harici duraklatma, ürün tıklama, odak ve ön planda olan ürün değişikliği gibi işlevleri destekler.
**Parametreler**:
- name: items, type: ProductItem[] — Karusel içinde gösterilecek tüm ürünlerin verisini içeren dizi
- name: onCardClick, type: (itemId: string, event?: MouseEvent) => void | opsiyonel — Herhangi bir kart tıklandığında dışarıya bildirmek için kullanılan geri çağırım fonksiyonu
- name: externalPause, type: boolean, varsayılan değeri false — Karusel otomatik döngüsünün dışarıdan gelen bir komutla duraklatılıp duraklatılmadığını belirten bayrak
- name: onFocusedItemChange, type: (itemId: string | null) => void | opsiyonel — Odaklanan ürün değiştiğinde dışarıya bildirmek için kullanılan geri çağırım
- name: onFrontCardChange, type: (itemId: string) => void | opsiyonel — En ön plandaki ürün değiştiğinde dışarıya bildirmek için kullanılan geri çağırım
*Girilen imza uyarınca kalan tüm özellikler `OrbitalProductsShowcaseProps` türü içinde tanımlıdır*
**Dönüş**: `React.FC<OrbitalProductsShowcaseProps>` türünde, tüm orbital ürün karuselini kapsayan ana React bileşeni döndürür.

### handlePointerDownFull
**Ne yapar**: Kullanıcının ekranda bir parmağını veya fare tıklamasını başlattığında tetiklenen olay işleyicisidir. Bu fonksiyon, orbital ürün vitrini üzerinde sürükleme veya kaydırma etkileşiminin başlangıç noktasını yakalamak için kullanılır. Pointer olayının başladığını tespit ederek sürükleme sürecini başlatır.

**Nasıl yapar**: Gelen React.PointerEvent nesnesini alarak etkileşimin başlangıç koordinatlarını (clientX, clientY) veya gerekli diğer özelliklerini kaydeder. Sürükleme modunun aktif hale gelmesini sağlar ve sonraki pointer hareketlerini yakalamaya hazırlanır.

**Parametreler**:
- e: React.PointerEvent — Kullanıcının ekranda tıkladığında veya dokunduğunda oluşan olay nesnesi. Başlangıç pozisyonu ve pointer kimliği gibi bilgileri içerir.

**Dönüş**: void — Fonksiyon herhangi bir değer döndürmez.

### handlePointerMove
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### handlePointerUp
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## INTERFACES

### ProductItem
- `id: string`
- `title: string`
- `image: string`
- `categorySlug?: string`
- `modelType?: string`

### OrbitalProductsShowcaseProps
- `items: ProductItem[]`
- `onCardClick?: (itemId: string, event?: MouseEvent) => void`
- `externalPause?: boolean`
- `onFocusedItemChange?: (itemId: string | null) => void`
- `onFrontCardChange?: (itemId: string) => void`
- `modelScale?: number`
- `containerHeight?: string | number`
- `skipHints?: boolean`

### SharedState
- `rotation: number`
- `target: number | null`
- `velocity: number`
- `pauseUntil: number`
- `startTime: number`
- `isReady: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::Stage
- **params**: `{ sharedState }` — SharedState ref objesi, rotation/target/velocity/isReady gibi paylaşım durumlarını taşır
- **ic_degiskenler**:
  - `getRadius` — İç fonksiyon; sharedState.current.isReady false ise 0, true ise zamanla 0'dan CONFIG.radius'a ease-out animasyonu hesaplar
  - `currentRadius` — getRadius() çağrı sonucu; halka geometrisinin yarıçapı olarak kullanılır
- **Dönüş**: JSX (`<group>`) — Genişleyen halka, zemin ve sparkles parçacıkları içeren 3D sahne zemini

### [N2_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::getRadius
- **params**: (yok)
- **ic_degiskenler**:
  - `sharedState.current.isReady` — Okunur; false ise 0 döner
  - `sharedState.current.startTime` — Referans zaman;:animatedan bu yana geçen süreyi hesaplar
  - `elapsed` — (Date.now() - startTime) / 2000; 0-1 arası normalized süre
- **Dönüş**: `number` — CONFIG.radius * ease-out sonucu yarıçap değeri

### [N3_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::PlaceholderWireframe
- **params**: `{ scale = 1 }` — Wireframe boyut çarpanı, varsayılan 1
- **ic_degiskenler**:
  - `meshRef` — `useRef<THREE.Mesh>`; icosahedron mesh'e referans, rotasyon animasyonu için kullanılır
  - `useFrame` callback parametresi `state` — Three.js frame state; `state.clock.elapsedTime` ile zaman alır
- **Dönüş**: JSX (`<group>`) — Yüzen, dönen wireframe icosahedron (placeholder model)

### [N4_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::SuspendedCardMaterial
- **params**: `{ finalPath, hovered }` — finalPath: texture dosya yolu veya null; hovered: fare üzerine gelindi mi
- **ic_degiskenler**:
  - `texture` — `useTexture(finalPath || placeholder)` çağrısıyla yüklenen THREE texture
- **Dönüş**: JSX (`<meshStandardMaterial>`) — Şeffaf, emissive glow efektli mesh materyali

### [N5_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::OrbitalCard
- **params**: `{ item, index, total, sharedState, onHover, onBringToFront, setIsDragging, isDraggingRef, onCardClick, onFocusedItemChange, isFrontCard, shouldShowTapHint, shouldShowDragHint, modelScale }`
- **ic_degiskenler**:
  - `groupRef` — `useRef` grubun 3D pozisyonunu ve scale'ini manipüle etmek için
  - `meshRef` — `useRef` 2D plane mesh'e referans
  - `lastIsNearRef` — `useRef<boolean>` Kartın önde/arkada olma durumunu takip eder, değişiklik olduğunda setIsNearFront tetikler
  - `targetScaleRef` — `useRef<THREE.Vector3>` 3D ikon için hedef scale lerp hedefi
  - `pointerDownPos` — `useRef` Tıklama ayrımı için basıldığı nokta koordinatı
  - `pointerDownTime` — `useRef` Tıklama ayrımı için basılma zamanı
  - `hover` — `useState<boolean>` Fare üzerine gelindi durumu
  - `isNearFront` — `useState` Kartın kameraya yakın olup olmadığı
  - `setShowTapHint` — useState setter; tap hint göster/gizle
  - `finalPath` — `useMemo` ile hesaplanan, kategori slug varsa null, yoksa SUPABASE URL ile birleştirilmiş görsel yolu
  - `triggerAction` — useCallback; sürükleme/tıklama ayrımı yaparak tıklama işlemini yönetir (tıklama → onCardClick veya onBringToFront)
  - `handleDoubleClick` — Çift tıklama handler'ı; `router.push(Routes.category(item.id))` ile kategori sayfasına yönlendirir
  - `useFrame` callback içindeki yerel değişkenler:
    - `now` — Date.now() mevcut zaman
    - `elapsedSec` — Referans zamandan bu yana geçen saniye
    - `personalDelay` — `index * ANIM_STAGGER_DELAY` Her kartın kişisel giriş gecikmesi
    - `allCardsEntered` — Tüm kartların giriş animasyonu tamamlandı mı
    - `localProgress` — 0-1 arası kişisel giriş animasyonu ilerlemesi
    - `vacuumEase` — Expo.easeOut eğrisi; hızlı çekim + nazik oturma
    - `arch` — Sinüs kavisi; Y ekseninde parabolik yay
    - `easeOutCubic` — Cubic ease-out; scale için yumuşatma
    - `baseAngle` — `(index / total) * 2π` Kartın dairesel konumu
    - `currentAngle` — baseAngle + sharedState rotation (giriş tamamlanıysa)
    - `targetX`, `targetZ`, `targetY` — Hedef orbit pozisyonu
    - `startX`, `startZ`, `startY` — Vacumm giriş başlangıç noktası
    - `x`, `z`, `y` — Lerp ile hesaplanan güncel pozisyon
    - `currentRadius` — CONFIG.radius okuması
    - `isNear` — `z > currentRadius * 0.3` Kameraya yakınlık kontrolü
    - `normalizedZ` — Z ekseni 0-1 arası normalize
    - `baseScale` — frontScale/backScale arası interpolated ölçek
    - `hoverZOffset` — Hover'da kameraya doğru kayma mesafesi
    - `hoverScaleBoost` — Hover'da ölçek artışı
    - `finalScale` — Hover + ease-out çarpanlı nihai ölçek
    - `hoverTargetZ` — Hover offset eklenmiş hedef Z
    - `pulseMultiplier` — Sabit 1 (pulse efekti devre dışı)
    - `pulsedScale` — Nihai uygulanacak ölçek
    - `mat` — `meshRef.current.material` MeshStandardMaterial cast
- **Dönüş**: JSX (`<group>`) — Orbital kart, 2D plane veya 3D ikon wrapper ile birlikte

### [N6_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::handlePointerOver
- **params**: `(e: ThreeEvent<PointerEvent>)` — Three.js pointer over olayı
- **ic_degiskenler**: (yok — doğrudan state/ref günceller)
- **Dönüş**: yok — `setHover(true)`, `onHover(true)`, `document.body.style.cursor = 'pointer'` yan etkisi

### [N7_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::handlePointerOut
- **params**: `(e: ThreeEvent<PointerEvent>)` — Three.js pointer out olayı
- **ic_degiskenler**: (yok — doğrudan state/ref günceller)
- **Dönüş**: yok — `setHover(false)`, `onHover(false)`, `document.body.style.cursor = 'auto'` yan etkisi

### [N8_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::CarouselItems
- **params**: `{ items, isPaused, onHover, dragDelta, onInteract, sharedState, isDraggingRef, setIsDragging, onCardClick, onFocusedItemChange, onFrontCardChange, shouldShowTapHint, shouldShowDragHint, hintStage, onStageChange, modelScale, onReady }`
- **ic_degiskenler**:
  - `camera` — `useThree()` ile alınan Three.js kamera referansı; nefes alma efekti için pozisyonu güncellenir
  - `lastFrontCardRef` — `useRef<string | null>` Bir önceki öndeki kartın ID'si, değişiklik kontrolü için
  - `frontCardId` — `useState<string | null>` Güncel öndeki kart ID'si
  - `frontCardChangeCountRef` — `useRef` Öndeki kart değiştirme sayacı; hint aşaması geçişi için kullanılır
  - `hasBeenFocusedRef` — `useRef` Kullanıcı bir karta odaklandı mı flag'i
  - `swayOffsetRef` — `useRef` Drag hint期间 sallanma offset'i
  - `useFrame` callback içindeki yerel değişkenler:
    - `elapsedTime` — `state.clock.elapsedTime` Kamera nefes alma zamanı
    - `now` — Date.now()
    - `elapsedSec` — Animasyon başlangıcından bu yana geçen saniye
    - `isEntryCompleted` — Tüm kartların giriş animasyonu bitti mi
    - `isPausedByClick` — Tıklama kaynaklı duraklama aktif mi
    - `friction` — 0.95 momentum sürtünme katsayısı
    - `diff` — target - rotation farkı
    - `dragSpeed` — dragDelta * 0.005 sürükleme hızı
    - `currentSpeed` — delta * CONFIG.autoRotateSpeed oto döndürme hızı
    - `t` — Drag hint sallanma zamanı (3sn döngü)
    - `step` — `2π / items.length` Kartlar arası açısal adım
    - `maxSway` — step * 0.8 maksimum sallanma açısı
    - `targetSway` — Hedef sallanma offset'i
    - `swayDelta` — Hedef ile mevcut offset farkı
    - `total`, `currentRot`, `closestTarget`, `shortestDiff` — SNAP mantığı için açısal hesaplamalar
    - `currentTime` — Date.now()
    - `isCarouselRotating` — Carousel'in şu an dönüp dönmeme durumu
    - `frontIndex` — Öndeki kartın indeksi
    - `frontItem` — Öndeki kart objesi
    - `count` — frontCardChangeCountRef.current kopyası
  - `onBringToFront` callback içinde:
    - `total`, `baseAngle`, `currentRot`, `targetPos`, `diff`, `shortestDiff` — Hedef karta döndürme açısal hesaplamaları
- **Dönüş**: JSX (`<group>`) — `items.map()` ile OrbitalCard bileşenlerini render eder

### [N9_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::MotionTransitionFix
- **params**: (yok)
- **ic_degiskenler**:
  - `invalidate` — `useThree()` ile alınan R3F invalidate fonksiyonu
  - `interval` — `setInterval(() => invalidate(), 50)` 50ms'de bir frame yeniden çizimi tetikler
- **Dönüş**: `null` — Yan etki: Framer Motion 400ms geçiş süresince canvas'ı yeniden çizdirir

### [N10_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::OrbitalProductsShowcase
- **params**: `{ items, onCardClick, externalPause, onFocusedItemChange, onFrontCardChange, modelScale, containerHeight, skipHints }`
- **ic_degiskenler**:
  - `isPaused` — `useState(false)` Carousel duraklama durumu
  - `dragDelta` — `useState(0)` Sürükleme hareket miktarı
  - `focusedItemId` — `useState<string | null>` Odaklanılmış kart ID'si
  - `containerRef` — `useRef<HTMLDivElement>` Container DOM elemanı referansı
  - `isInView` — `useInView(containerRef)` Container görünür alanda mı (200px margin)
  - `hintStage` — `useState<'idle' | 'tap' | 'drag' | 'cooldown' | 'finished'>` İpucu animasyonu aşaması
  - `isDraggingRef` — `useRef(false)` Sürükleme durumu ref
  - `sharedState` — `useRef<SharedState>` Orbit paylaşım durumu objesi (rotation, target, velocity, pauseUntil, startTime, isReady)
  - `handleItemsReady` — `useCallback` Items yüklendiğinde sharedState.isReady = true yapar, startTime kaydeder
  - `shouldShowTapHint` — `hintStage === 'tap'` Tap hint.visible flag
  - `shouldShowDragHint` — `hintStage === 'drag'` Drag hint.visible flag
  - `handleSetIsDragging` — `useCallback` isDraggingRef.current günceller
  - `handleFocusedItemChangeInternal` — `useCallback` setFocusedItemId + parent onFocusedItemChange çağırır
  - `lastX` — `useRef(0)` Sürükleme için son fare X pozisyonu
  - `isDraggingState` — `useState(false)` UI cursor değişikliği için sürükleme durumu
  - `handlePointerDownFull` — Pointer down handler; sürükleme başlatır
  - `handlePointerMove` — Pointer move handler; deltaX hesaplar
  - `handlePointerUp` — Pointer up handler; sürükleme bitirir
  - ResizeObserver callback: Container boyut değişikliklerinde `window.dispatchEvent(new Event('resize'))` tetikler
  - useEffect cleanup'ları: hintStage geçiş timer'ları (cooldown→finished 15sn, tap→drag 4sn, drag→cooldown 3sn)
- **Dönüş**: JSX — Canvas içeren `<div>` container, gradient overlay'leri, Stage, Environment, CarouselItems

### [N11_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::handlePointerDownFull
- **params**: `(e: React.PointerEvent)` — DOM pointer down olayı
- **ic_degiskenler**: (yok — doğrudan state/ref günceller)
- **Dönüş**: yok — `isDraggingRef.current = true`, `setIsDraggingState(true)`, `lastX.current = e.clientX`, `setDragDelta(0)` yan etkisi

### [N12_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::handlePointerMove
- **params**: `(e: React.PointerEvent)` — DOM pointer move olayı
- **ic_degiskenler**:
  - `delta` — `e.clientX - lastX.current` Mevcut ile önceki X pozisyonu farkı
- **Dönüş**: yok — `lastX.current = e.clientX`, `setDragDelta(delta)` yan etkisi

### [N13_NASIL] AST Pointer: OrbitalProductsShowcase.tsx::handlePointerUp
- **params**: (yok)
- **ic_degiskenler**: (yok — doğrudan state/ref günceller)
- **Dönüş**: yok — `isDraggingRef.current = false`, `setIsDraggingState(false)`, 50ms sonra `setDragDelta(0)` yan etkisi

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    OrbitalProductsShowcase_tsx__CarouselItems["CarouselItems"]
    OrbitalProductsShowcase_tsx__MotionTransitionFix["MotionTransitionFix"]
    OrbitalProductsShowcase_tsx__OrbitalCard["OrbitalCard"]
    OrbitalProductsShowcase_tsx__OrbitalProductsShowcase["OrbitalProductsShowcase"]
    OrbitalProductsShowcase_tsx__PlaceholderWireframe["PlaceholderWireframe"]
    OrbitalProductsShowcase_tsx__Stage["Stage"]
    OrbitalProductsShowcase_tsx__SuspendedCardMaterial["SuspendedCardMaterial"]
    OrbitalProductsShowcase_tsx__getRadius["getRadius"]
    OrbitalProductsShowcase_tsx__handlePointerDownFull["handlePointerDownFull"]
    OrbitalProductsShowcase_tsx__handlePointerMove["handlePointerMove"]
    OrbitalProductsShowcase_tsx__handlePointerOut["handlePointerOut"]
    OrbitalProductsShowcase_tsx__handlePointerOver["handlePointerOver"]
    OrbitalProductsShowcase_tsx__handlePointerUp["handlePointerUp"]
    OrbitalProductsShowcase_tsx__Stage --> OrbitalProductsShowcase_tsx__getRadius
```

## NODE ID STANDARD

  file: src\components\products\OrbitalProductsShowcase.tsx
  function: src\components\products\OrbitalProductsShowcase.tsx::Stage
  function: src\components\products\OrbitalProductsShowcase.tsx::getRadius
  function: src\components\products\OrbitalProductsShowcase.tsx::PlaceholderWireframe
  function: src\components\products\OrbitalProductsShowcase.tsx::SuspendedCardMaterial
  function: src\components\products\OrbitalProductsShowcase.tsx::OrbitalCard
  function: src\components\products\OrbitalProductsShowcase.tsx::handlePointerOver
  function: src\components\products\OrbitalProductsShowcase.tsx::handlePointerOut
  function: src\components\products\OrbitalProductsShowcase.tsx::CarouselItems
  function: src\components\products\OrbitalProductsShowcase.tsx::MotionTransitionFix
  function: src\components\products\OrbitalProductsShowcase.tsx::OrbitalProductsShowcase
  function: src\components\products\OrbitalProductsShowcase.tsx::handlePointerDownFull
  function: src\components\products\OrbitalProductsShowcase.tsx::handlePointerMove
  function: src\components\products\OrbitalProductsShowcase.tsx::handlePointerUp

---

## DISA AKTARILANLAR (EXPORTS)
  export: CarouselItems
  export: MotionTransitionFix
  export: OrbitalCard
  export: OrbitalProductsShowcase
  export: PlaceholderWireframe
  export: ProductItem
  export: Stage
  export: SuspendedCardMaterial

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/20`, `bg-cyan-950/30`, `bg-gradient-to-l`, `bg-gradient-to-r`, `bg-slate-900/70`, `bg-slate-900/80`, `border-2`, `border-cyan-400/40`, `border-cyan-500/50`, `border-cyan-500/60`, `border-slate-700/50`, `from-surface-darker`, `md:text-sm`, `text-cyan-300`, `text-slate-200`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `from-surface-darker`, `gap-24`, `gap-3`, `h-16`, `h-18`, `h-8`, `h-9`, `items-center`, `justify-center`, `left-0`, `relative`
- **Varyant/Responsive:** `active:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `active:cursor-grabbing`, `animate-ping`, `animate-pulse`, `blur-md`, `border`, `cursor-grab`, `font-medium`, `font-semibold`, `inset-0`, `inset-y-0`, `pointer-events-none`, `px-3`, `px-4`, `py-1.5`, `rounded-full`