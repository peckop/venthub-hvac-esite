---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts
skeleton_hash: 2bed405d7e5d7641
generated_at: 2026-05-23T22:30:14Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kullanılan, kaydırma hareketlerine göre kullanıcı arayüzü elemanlarının görünürlüğünü yönetmek üzere tasarlanmış özel bir React hook'u barındırır. Yapılandırılabilir bir kaydırma eşik değeriyle esnek kullanım sunar, görünürlük durumunu tüketen bileşenlere ileterek arayüz elemanlarının dinamik olarak gösterilip gizlenmesini sağlar.

## Fonksiyon Grupları
### Çekirdek Kaydırma Tepkisi Yönetimi
Kullanıcıların ekran kaydırma hareketlerini izler, tanımlanan eşik değerine göre UI elemanlarının görünürlüğü için gerekli durumu üretir ve tüketen bileşenlere sunar.
- useHideOnScroll

---

## AXIOMS – Mimari Varsayımlar
Bu React hook'u, tarayıcı ortamında çalışarak scroll hareketlerini dinleyen, 50 piksel varsayılan eşik değerine göre bir öğenin görünürlüğünü yönetir; doğru çalışması için tarayıcı DOM API'lerine ve React hooks çalışma zamanına erişimi zorunludur.

[Aksiyom 1]: Eğer tarayıcının window nesnesi, scroll olayını dinleme ve scroll konumunu okuma API'leri (scrollY, addEventListener) erişilemezse, scroll hareketleri takip edilemez, görünürlük değişikliği hiçbir şekilde tetiklenemez.
[Aksiyom 2]: Eğer modülün çalıştığı ortamda useState ve useEffect gibi temel React hook'ları erişilemezse, durum yönetimi ve olay dinleyicilerinin yaşam döngüsü entegrasyonu yapılamaz, modül hiç çalışmaz.
[Aksiyom 3]: Eğer threshold parametresi olarak geçerli pozitif sayısal bir değer iletilmez ve varsayılan 50 değerinin devreye alınması engellenirse, kaydırma miktarının eşikle karşılaştırılması yapılamaz, öğe yanlış zamanlarda gizlenir veya gösterilir.
[Aksiyom 4]: Eğer bileşen unmount olduğunda hook'un kullandığı useEffect temizleme fonksiyonu çalışmazsa, eski scroll olay dinleyicileri temizlenemez, uygulama genelinde bellek sızıntısı ve performans düşüklüğü oluşur.

---

## FONKSIYON DETAYLARI

### useHideOnScroll
**Ne yapar**: Kullanıcıların scroll hareketlerini izleyerek UI elemanlarının görünürlüğünü dinamik olarak yönetmek için tasarlanmış özel bir React hookudur. Kullanıcının yukarı ya da aşağı yönde scroll yapıp yapmadığını, belirtilen scroll eşiğini geçip geçmediğini ve sayfanın en başında olup olmadığını tespit ederek tüm bu durum bilgilerini kullanıma sunar. Özellikle gezinme çubukları, bildirim bannerları gibi kaydırmayla birlikte görünürlüğünü değiştirmek istenen UI bileşenleri için gerekli state verilerini tek merkezden sağlar.
**Nasıl yapar**: Tarayıcının yerleşik scroll olay dinleyicisini kullanarak her scroll hareketinde anlık dikey scroll pozisyonunu kaydeder, önceki kaydedilmiş scroll pozisyonuyla mevcut pozisyonu kıyaslayarak scroll yönünü otomatik olarak hesaplar. Kullanıcı tarafından yapılandırılabilen piksel cinsinden eşik değerini mevcut scroll mesafesiyle karşılaştırır, eşik değerinin aşılıp aşılmadığını sürekli olarak kontrol eder. Sayfanın en üstündeyken (scroll pozisyonu 0ken) özel durum bayrağını aktif hale getirerek tüm state bilgilerini güncel tutar.
**Parametreler**:
- options: UseHideOnScrollOptions — Hook'un çalışma prensibini yapılandırmak için kullanılan tek konfigürasyon nesnesi, opsiyonel olarak tanımlanabilir, içindeki tüm özellikler isteğe bağlıdır.
- options.threshold: number — Scroll durumunun güncellenmeden önce kullanıcının ne kadar piksel scroll yapması gerektiğini belirten eşik değeri, varsayılan olarak 50 piksel olarak ayarlanmıştır, isteğe bağlı olarak proje ihtiyacına göre farklı bir değer atanabilir.
**Dönüş**: HideOnScrollState türünde boolean tipinde durum bayrakları içeren bir nesne döndürür. Bu nesne içindeki bayraklar; kullanıcının scroll yönü, belirtilen eşik değeri geçip geçmediği ve sayfanın en üstünde olup olmama gibi tüm gerekli scroll durumlarını barındırır, UI elemanlarının görünürlüğünü yönetmek için doğrudan kullanılabilir.

---

## INTERFACES

### UseHideOnScrollOptions
- `threshold?: number`

### HideOnScrollState
- `isScrolled: boolean`
- `isScrollingDown: boolean`
- `isScrollingUp: boolean`
- `isAtTop: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts::useHideOnScroll
- **params**: [{ threshold = 50 }: UseHideOnScrollOptions, varsayılan değer {}]
- **ic_degiskenler**:
  - `state` — React useState ile oluşturulan, scroll durumlarını tutan HideOnScrollState tipi nesne
  - `setState` — state nesnesini güncellemek için kullanılan React state setter fonksiyonu
  - `lastScrollY` — son kaydedilen dikey scroll konumunu saklayan useRef nesnesi, başlangıç değeri 0
  - `ticking` — requestAnimationFrame ile ardışık gereksiz güncellemeleri engellemek için kullanılan kilit değişkenini tutan useRef nesnesi, başlangıç değeri false
  - `useEffect` — scroll olaylarını yönetmek için kullanılan React hook'u, bağımlılık dizisi [threshold]
- **Dönüş**: HideOnScrollState tipi state nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — tarayıcı window nesnesi, sunucu tarafı çalışması için typeof kontrolü yapılır
  - `updateScrollDir` — scroll durumu değiştiğinde state'i güncellemek için tanımlanan iç fonksiyon
  - `onScroll` — window scroll olayına bağlanan event handler fonksiyonu
  - `window.addEventListener` — window nesnesine scroll event listener ekleyen API çağrısı
  - `updateScrollDir()` — bileşen mount edildiğinde ilk scroll durumunu hesaplamak için çağrılan fonksiyon
  - `window.removeEventListener` — bileşen unmount olduğunda scroll event listener'ı kaldıran API
- **Dönüş**: () => void tipinde event listener temizleme fonksiyonu

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts::updateScrollDir
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `scrollY` — window.scrollY'den alınan mevcut dikey scroll konumu
  - `setState` — ana fonksiyondaki state'i güncellemek için kullanılan setter fonksiyonu
  - `lastScrollY.current` — son kaydedilen scroll konumunu işlem sonunda güncellemek için kullanılan ref değeri
  - `ticking.current` — işlem tamamlandıktan sonra kilit mekanizmasını devre dışı bırakmak için ayarlanan ref değeri
- **Dönüş**: yok (void)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts::setState_prev_callback
- **params**: [prevState: önceki HideOnScrollState nesnesi]
- **ic_degiskenler**:
  - `scrollY` — updateScrollDir'den gelen mevcut dikey scroll konumu
  - `isAtTop` — scroll'un en başta olup olmadığını tutan değişken, scrollY < threshold olarak hesaplanır
  - `isScrolled` — herhangi bir kaydırma yapılıp yapılmadığını tutan değişken, scrollY > 0 olarak hesaplanır
  - `isScrollingDown` — aşağı doğru kaydırma yapılıp yapılmadığını tutan değişken, önceki state'ten alınır ve güncellenir
  - `isScrollingUp` — yukarı doğru kaydırma yapılıp yapılmadığını tutan değişken, önceki state'ten alınır ve güncellenir
  - `Math.abs` — scroll konumları arasındaki farkın mutlak değerini hesaplayan yerleşik fonksiyon
  - `lastScrollY.current` — scroll yönü hesaplamak için kullanılan önceki scroll konumunu tutan ref değeri
  - `threshold` — ana fonksiyondan gelen minimum kaydırma eşiği değişkeni
- **Dönüş**: durum değişmemişse prevState, güncellenmişse yeni HideOnScrollState nesnesi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts::onScroll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ticking.current` — çoklu gereksiz güncellemeyi engellemek için kontrol edilen kilit değeri
  - `window.requestAnimationFrame` — tarayıcının bir sonraki repaint öncesi güncelleme yapması için çağrılan API
  - `updateScrollDir` — requestAnimationFrame içine geçilen state güncelleme fonksiyonu
- **Dönüş**: yok (void)

---

## NODE ID STANDARD

  file: src\hooks\useHideOnScroll.ts
  function: src\hooks\useHideOnScroll.ts::useHideOnScroll

---

## DISA AKTARILANLAR (EXPORTS)
  export: useHideOnScroll