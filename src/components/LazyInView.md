---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\LazyInView.tsx
skeleton_hash: 1f246a34a210785e
generated_at: 2026-05-27T04:44:35Z
---

## Genel Bakış
`LazyInView.tsx` modülü, React uygulamalarında sayfa yüklenirken hemen ihtiyaç duyulmayan içerikleri erteleyerek performansı artıran bir gecikmeli yükleme (lazy loading) bileşeni sağlar. Bileşen, kendisi görüntü alanına (viewport) girene kadar bir yer tutucu (placeholder) gösterir; görünür hale geldiğinde ise tanımlanan yükleyici işlevi çağrılır ve dinamik içerik render edilir.

## Fonksiyon Grupları
### Ana Bileşen Tanımı
Modülün tek bir dışa aktarılmış React bileşenini içerir; bekleme ve yükleme durumlarını yöneterek öğelerin yalnızca gerekli olduğunda işlenmesini sağlar.
- LazyInView

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `loader` prop'u sağlanmazsa, TypeScript derleme hatası olur ve component render edilemez.  
[Aksiyom 2]: Eğer `placeholder` prop'u sağlanmazsa, varsayılan `<div className="min-h-[160px]" aria-hidden="true"/>` elementi kullanılır.  
[Aksiyom 3]: Eğer `loader` prop'u bir fonksiyon değilse (örneğin `null` veya `undefined`), component beklenen içerik yükleyemez ve beklenen davranışı göstermeyebilir.  
[Aksiyom 4]: Eğer `placeholder` prop'u bir JSX elementi değilse, component beklenen yer tutucu görünümünü sağlayamayabilir.

---

---

## FONKSIYON DETAYLARI

### LazyInView
**Ne yapar**: Verilen `loader` fonksiyonunu ve isteğe bağlı `placeholder` bileşenini alarak, içerik görünür olduğunda tembel (lazy) yükleme işlemini gerçekleştirir.  

**Nasıl yapar**: `loader` prop’u bir asenkron yükleme işlemi tanımlar; bileşen ekrana geldiğinde bu fonksiyon tetiklenir. `placeholder` prop’u, içerik henüz yüklenmemişken gösterilecek JSX öğesini temsil eder.  

**Parametreler**:
- `loader`: `() => Promise<T>` — İçeriği dinamik olarak getiren asenkron fonksiyon.
- `placeholder`: `React.ReactNode` — İçerik yüklenene kadar gösterilecek yedek UI öğesi. Varsayılan değer `<div className="min-h-160px" aria-hidden="true" />` dir.  

**Dönüş**: `void` (bileşen render edildiğinde yan etki oluşturur, doğrudan bir değer döndürmez).

---

## INTERFACES

### LazyInViewProps
- `loader: () => Promise<{ default: React.ComponentType<T> }>`
- `placeholder?: React.ReactNode`
- `rootMargin?: string`
- `once?: boolean`
- `className?: string`
- `componentProps?: T`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\LazyInView.tsx::LazyInView
- **params**: `loader`, `placeholder = <div className="min-h-160px" aria-hidden="true" />`, `rootMargin = '200px 0px'`, `once = true`, `className`, `componentProps`
- **ic_degiskenler**:
  - `ref` — `React.useRef<HTMLDivElement | null>(null)`: DOM elemanına referans tutar, IntersectionObserver ve event listener'ların hedefi.
  - `shouldLoad` — `React.useState(false)`'in değer kısmı: Bileşenin içeriğinin yüklenip yüklenmeyeceğini belirten boolean flag.
  - `setShouldLoad` — `React.useState(false)`'in set fonksiyonu: `shouldLoad` değerini `true` yapmak için kullanılır.
  - `Loaded` — `React.useState<React.ComponentType<T> | null>(null)`'in değer kısmı: Yüklenen modülün default export'ı (component) burada saklanır.
  - `setLoaded` — `React.useState<React.ComponentType<T> | null>(null)`'in set fonksiyonu: `Loaded` değerini günceller.
  - `enable` — `() => setShouldLoad(true)`: `pointerdown` ve `touchstart` event'leri tetiklendiğinde `shouldLoad`'u `true` yapar.
  - `el` — `ref.current`: Observer'ın gözlemleyeceği DOM elemanı.
  - `io` — `new IntersectionObserver(...)`: Görünürlük değişikliklerini izleyen observer nesnesi.
  - `entry` — `entries[0]`: Observer callback'inde gelen ilk `IntersectionObserverEntry`, elemanın görünür olup olmadığını kontrol eder.
  - `cancelled` — `false` başlangıç değeri: Asenkron `loader` çağrısının iptal edilip edilmediğini izler.
  - `mod` — `loader()` promise'inin çözüldüğü değer: Modülün default export'ı (`mod.default`) `Loaded` state'ine atanır.
- **Dönüş**: JSX `<div ref={ref} className={className}>…</div>` döndürür; fonksiyonun yan etkileri arasında event listener ekleme/kaldırma, IntersectionObserver yönetimi ve dinamik modül yüklemesi bulunur.

---

## NODE ID STANDARD

  file: src\components\LazyInView.tsx
  function: src\components\LazyInView.tsx::LazyInView

---

## DISA AKTARILANLAR (EXPORTS)
  export: LazyInView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** `min-h-160px`
- **Responsive:** (yok)