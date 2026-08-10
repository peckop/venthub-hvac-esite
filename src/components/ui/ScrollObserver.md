---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ui\ScrollObserver.tsx
skeleton_hash: 164c78147076aa40
entity_hashes:
  func:ScrollObserver: 862e0356d80495a5
  overview: 165bc7baf7c13a58
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:39Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı arayüzü katmanında yer alan, sayfa kaydırma hareketlerini ve DOM elemanlarının görünürlük değişimlerini takip eden yeniden kullanılabilir bir React bileşenidir. Scroll tabanlı etkileşimleri merkezi bir yapıda yöneterek, uygulamanın farklı bölümlerinde tekrar eden scroll gözlemleme mantığını tek bir bileşende toplar.

## Fonksiyon Grupları
### Scroll Takip Bileşeni
Modülün tek ve ana bileşeni olarak sayfa kaydırma olaylarını ve eleman görünürlük değişimlerini izler; bu verileri tüketen alt bileşenlere veya mantık katmanlarına gözlem mekanizması sağlar.
- ScrollObserver

---

## AXIOMS – Mimari Varsayimlari

ScrollObserver modulu icin mimari varsayimlar, fonksiyon imzasindan (parametresiz bir React bileseni) ve modulun kaynak dosya konumundan cikarilmistir.

**[Aksiyom 1]:** Eger ScrollObserver bir React bileseni olarak render edilmiyorsa, bilesenin DOM'a baglanamaz ve scroll gozlemleme islevi calismaz.

**[Aksiyom 2]:** Eger tarayici ortami (window/document DOM erisimi) mevcut degilse, scroll olaylari veya IntersectionObserver gibi browser API'leri kullanilamaz ve bilesen islevsiz kalir.

**[Aksiyom 3]:** Eger ScrollObserver bir React icinde render ediliyorsa, bu modulun bağımsız (standalone) olarak calistirilmasi beklenmez; ust bilesen hiyerarsisi icinde var olmasi gerekir.

---

## FONKSİYON DETAYLARI

### ScrollObserver
**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni olan ScrollObserver'ı tanımlar. Adından anlaşıldığı üzere, belirli bir kaydırma (scroll) olayını gözlemlemek ve bu duruma tepki vermek için kullanılan bir UI bileşenidir.

**Nasıl yapar**: Fonksiyonel bir React bileşeni yapısında tanımlanmıştır. Bileşenin iç mantığı, prop'ları veya içinde bulunduğu durum (state) hakkında kaynak kodunda doğrudan bilgi verilmemiştir. Genel olarak, bir React bileşeni olarak render edeceği bir arayüzü ve davranışları belirleyen bir fonksiyondur.

**Parametreler**:
- Parametreler hakkında kaynak kodunda veya docstring'de belirli bir bilgi bulunmamaktadır. Bileşenin aldığı prop'lar, kullanıldığı bağlama göre değişiklik gösterebilir.

**Dönüş**: `React.FC` tipinde bir React bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: react::useEffect

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::ScrollObserver
- **params**: ()
- **ic_degiskenler**:
  - `useEffect` — React hook that manages side effects in functional components
- **Dönüş**: React.FC (bileşen `null` döndürür, yan etkisi useEffect ile IntersectionObserver kurulumudur)

### [N2_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::useEffectCallback
- **params**: ()
- **ic_degiskenler**:
  - `window` — typeof kontrolü ile tarayıcı ortamı olup olmadığı doğrulanır, sunucu tarafı renderingde çalışmayı engeller
  - `observer` — IntersectionObserver örneği, `data-observe` özellikli elementleri izler, görünür olduklarında `data-in-view` ekler
  - `observeNodes` — `data-observe` özellikli ve henüz izlenmemiş elementleri DOM'dan sorgulayan fonksiyon
  - `timerId` — setTimeout tarafından döndürülen zamanlayıcı ID'si, 100ms gecikme ile `observeNodes` çağrısını planlar
- **Dönüş**: Temizlik fonksiyonu (clearTimeout ve observer.disconnect)

### [N3_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::intersectionObserverCallback
- **params**: (entries, obs)
- **ic_degiskenler**:
  - `entries` — IntersectionObserverEntry dizisi, izlenen elementlerin durum bilgilerini içerir
  - `obs` — IntersectionObserver örneği, unobserve işlemi için kullanılır
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::forEachCallback
- **params**: (entry)
- **ic_degiskenler**:
  - `entry` — Tek bir IntersectionObserverEntry nesnesi, izlenen bir elementin durumunu temsil eder
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::observeNodes
- **params**: ()
- **ic_degiskenler**:
  - `document` — DOM'a erişim için kullanılır, querySelectorAll ile elementleri seçer
  - `observer` — Dış kapsamdaki IntersectionObserver örneği, seçilen elementleri izler
  - `el` — querySelectorAll ile bulunan her bir element, observer.observe() ile izlenir
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::querySelectorAllCallback
- **params**: (el)
- **ic_degiskenler**:
  - `el` — `[data-observe]` seçicisiyle bulunan tek bir HTMLElement
  - `observer` — Dış kapsamdaki IntersectionObserver örneği, bu elementi izler
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/components/ui/ScrollObserver.tsx::cleanupFunction
- **params**: ()
- **ic_degiskenler**:
  - `clearTimeout` — Tarayıcı global fonksiyonu, timerId ile belirtilen zamanlayıcıyı iptal eder
  - `timerId` — Dış kapsamdaki zamanlayıcı ID'si, observeNodes zamanlamasını temizler
  - `observer` — Dış kapsamdaki IntersectionObserver örneği, disconnect() ile tüm izlemeyi durdurur
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\ui\ScrollObserver.tsx
  function: src\components\ui\ScrollObserver.tsx::ScrollObserver

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollObserver

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)