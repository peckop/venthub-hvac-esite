---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useHideOnScroll.ts
skeleton_hash: 487831d2e25b9a1a
entity_hashes:
  func:useHideOnScroll: 8147a4dacc20e5ab
  overview: 12bcf4529d8cd3f7
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki bileşenlerin, kullanıcı kaydırma hareketlerine tepki olarak akıllı bir şekilde gösterilip gizlenmesini sağlayan `useHideOnScroll` adında özel bir React hook'u içerir. Hook, yapılandırılabilir bir kaydırma eşik değeri ile çalışır; tarayıcıdaki kaydırma olaylarını dinleyerek, tüketen bileşenlere arayüz elemanının güncel görünürlük durumunu (göster veya gizle) iletir.

## Fonksiyon Grupları
### Merkezi Kaydırma Davranışı Hook'u
Kullanıcı kaydırma hareketlerini izleyerek, belirlenen eşik değerine göre bir UI elemanının görünürlüğü için gerekli durum mantığını uygular ve sonuç durumunu bileşenlere sunar.
- useHideOnScroll

---

## AXIOMS – Mimari Varsayımlar
Bu React hook'u, kaydırma olaylarını dinleyerek UI elemanlarının görünürlüğünü yönetmek üzere tasarlandığı için tarayıcı ortamı ve React bağlamına bağlıdır.

[Aksiyom 1]: Eğer tarayıcı ortamı (window ve document nesneleri) yoksa, hook scroll olaylarını dinleyemez ve görünürlük durumu güncellenemez.
[Aksiyom 2]: Eğer hook, React bileşen hiyerarşisi dışında (örn. doğrudan bir JavaScript dosyasında) kullanılırsa, React bağlamı ve state yönetimi başarısız olur.
[Aksiyom 3]: Eğer `threshold` parametresi bir sayısal değer olarak sağlanmazsa (örn. string veya null), eşik karşılaştırmaları beklenmeyen davranış gösterir.
[Aksiyom 4]: Eğer sayfa içeriği kaydırılamıyorsa (yani `scrollHeight` pencere yüksekliğine eşit veya daha küçükse), tetiklenecek kaydırma olayı oluşmaz ve görünürlük durumu başlangıç değerinde kalır.
[Aksiyom 5]: Eğer `threshold` değeri 0 olarak

---

## FONKSİYON DETAYLARI

### useHideOnScroll
**Ne yapar**: Kullanıcıların scroll hareketlerini izleyerek UI elemanlarının görünürlüğünü dinamik olarak yönetmek için tasarlanmış özel bir React hookudur. Kullanıcının yukarı ya da aşağı yönde scroll yapıp yapmadığını, belirtilen scroll eşiğini geçip geçmediğini ve sayfanın en başında olup olmadığını tespit ederek tüm bu durum bilgilerini kullanıma sunar. Özellikle gezinme çubukları, bildirim bannerları gibi kaydırmayla birlikte görünürlüğünü değiştirmek istenen UI bileşenleri için gerekli state verilerini tek merkezden sağlar.
**Nasıl yapar**: Tarayıcının yerleşik scroll olay dinleyicisini kullanarak her scroll hareketinde anlık dikey scroll pozisyonunu kaydeder, önceki kaydedilmiş scroll pozisyonuyla mevcut pozisyonu kıyaslayarak scroll yönünü otomatik olarak hesaplar. Kullanıcı tarafından yapılandırılabilen piksel cinsinden eşik değerini mevcut scroll mesafesiyle karşılaştırır, eşik değerinin aşılıp aşılmadığını sürekli olarak kontrol eder. Sayfanın en üstündeyken (scroll pozisyonu 0ken) özel durum bayrağını aktif hale getirerek tüm state bilgilerini güncel tutar.
**Parametreler**:
- options: UseHideOnScrollOptions — Hook'un çalışma prensibini yapılandırmak için kullanılan tek konfigürasyon nesnesi, opsiyonel olarak tanımlanabilir, içindeki tüm özellikler isteğe bağlıdır.
- options.threshold: number — Scroll durumunun güncellenmeden önce kullanıcının ne kadar piksel scroll yapması gerektiğini belirten eşik değeri, varsayılan olarak 50 piksel olarak ayarlanmıştır, isteğe bağlı olarak proje ihtiyacına göre farklı bir değer atanabilir.
**Dönüş**: HideOnScrollState türünde boolean tipinde durum bayrakları içeren bir nesne döndürür. Bu nesne içindeki bayraklar; kullanıcının scroll yönü, belirtilen eşik değeri geçip geçmediği ve sayfanın en üstünde olup olmama gibi tüm gerekli scroll durumlarını barındırır, UI elemanlarının görünürlüğünü yönetmek için doğrudan kullanılabilir.

---

## İTHALATLAR (IMPORTS)
- import: react::useEffect
- import: react::useRef
- import: react::useState

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

### [N1_NASIL] AST Pointer: src/hooks/useHideOnScroll.ts::useHideOnScroll
- **params**:
  - `{ threshold = 50 }` — scroll mesafesi eşiği (piksel), default 50; bu değerin altındaysa sayfa üstte kabul edilir
  - destructured from `UseHideOnScrollOptions`, outer default `{}`
- **ic_degiskenler**:
  - `state` — `useState` hook'u; mevcut scroll durum nesnesini tutar (`isScrolled`, `isScrollingDown`, `isScrollingUp`, `isAtTop` alanlarını içerir)
  - `setState` — `state`'i güncellemek için kullanılan setter fonksiyonu
  - `lastScrollY` — `useRef(0)`; bir sonraki scroll kontrolünde karşılaştırma yapılmak üzere bir önceki `window.scrollY` değeri saklanır
  - `ticking` — `useRef(false)`; `requestAnimationFrame` ile scroll event throttling'i kontrol eden bayrak; true ise yeni frame kuyruğa alınmaz
- **Dönüş**: `state` (tip: `HideOnScrollState`) — `{ isScrolled, isScrollingDown, isScrollingUp, isAtTop }`

---

## NODE ID STANDARD

  file: src\hooks\useHideOnScroll.ts
  function: src\hooks\useHideOnScroll.ts::useHideOnScroll

---

## DISA AKTARILANLAR (EXPORTS)
  export: useHideOnScroll