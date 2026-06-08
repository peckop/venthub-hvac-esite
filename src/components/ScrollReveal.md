---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ScrollReveal.tsx
skeleton_hash: 1d5c6fded933b5c6
entity_hashes:
  func:ScrollReveal: 5164aa702775b185
  overview: 7c3e9f948c132ef9
  style_tokens: fce5caac08f51876
generated_at: 2026-06-08T10:08:35Z
---

## Genel Bakış
ScrollReveal, VentHub HVAC projesinde kaydırma tabanlı animasyonlar için kullanılan bir React sarmalayıcı bileşenidir. İçeriğin ekran görünür alanında belirdiğinde seçilen animasyon efektini uygulayarak görsel geçişler sağlar. Esnek yapılandırması ile farklı HTML elementlerine ve animasyon türlerine adapte olabilir.

## Fonksiyon Grupları

### Kaydırma Animasyonu Bileşeni
ScrollReveal, çocuk bileşenleri sarmalayarak kaydırma olaylarını izler ve görünümde belirdiğinde animasyon efektlerini tetikler. Farklı HTML elementleri, animasyon türleri ve sıralı gecikmeler ile özelleştirilebilir yapı sunar.
- ScrollReveal

---

## AXIOMS – Mimari Varsayımlar

ScrollReveal bileşeni, kaydırma tabanlı animasyonları çocuklar için uygulayan bir sarmalayıcı component'tir.

**[Aksiyom 1 - Zorunlu Animation Prop'u]:** Eğer `animation` parametresi verilmezse, bileşen geçerli bir animasyon uygulayamaz ve çocuk bileşenler animasyon olmadan rendered olur.

**[Aksiyom 2 - Zorunlu Children Prop'u]:** Eğer `children` parametresi verilmezse, bileşen render edilecek bir içerik barındırmaz ve animasyon uygulanacak bir hedef olmaz.

**[Aksiyom 3 - StaggerIndex Sıralama Bağımlılığı]:** Eğer `staggerIndex` parametresi verilmezse, bileşen sıralı animasyon (stagger) zamanlamasında bağımsız/tek başına çalışır, diğer ScrollReveal bileşenlerinden bağımsız tetiklenir.

**[Aksiyom 4 - As Prop'u Geçerli Component']):** Eğer `as` prop'u geçerli bir React component'i (Comp) içermeyen bir değer alırsa, bileşen geçerli bir HTML elementi veya component olarak render edilemez ve hata oluşur.

**[Aksiyom 5 - ClassName Varsayılan Davranış]:** `className` parametresi verilmezse boş string (`''`) kullanılır, bu durumda bileşene ek CSS sınıfı uygulanmaz.

---

## FONKSİYON DETAYLARI

### ScrollReveal

**Ne yapar**: ScrollReveal, çocuk bileşenlerin sayfa kaydırma (scroll) sırasında belirli animasyon efektleriyle görünür olmasını sağlayan sarmalayıcı (wrapper) bir React bileşeniderek. Görünmezlikten görünürlüğe geçiş animasyonlarını kontrol ederek kullanıcı deneyimini zenginleştirir.

**Nasıl yapar**: Bileşen, belirtilen animasyon türüne göre çocuk elemanları sarar ve scroll pozisyonuna bağlı olarak animasyon tetiklerini yönetir. `as` prop'u ile hangi HTML elementi (div, section, article vb.) olarak render edileceği belirlenebilir. `staggerIndex` parametresi ile çoklu elemanlarda animasyonların sıralı ve gecikmeli tetiklenmesi sağlanarak kademeli görünüm efektleri elde edilir.

**Parametreler**:
- `children` — `React.ReactNode` — Scroll animasyonu uygulanacak alt bileşenler veya içerik. Bileşenin sarmalayacağı tüm JSX içeriği bu prop üzerinden iletilir.
- `animation` — `AnimationType` — Uygulanacak animasyon stilini tanımlar (örn. fade-in, slide-up, scale vb.). Hangi geçiş efektinin kullanılacağını belirler.
- `className` — `string` — Ek CSS sınıf adları eklemek için kullanılır. Varsayılan değeri boş dizedir (`''`). Bileşenin stilini özelleştirmek için opsiyonel olarak verilir.
- `staggerIndex` — `number | undefined` — Birden fazla ScrollReveal bileşeni kullanıldığında animasyonların sıralı tetiklenmesi için gecikme indeksini belirtir. Değer arttıkça animasyon daha geç tetiklenir.
- `as` — `ElementType` — Bileşenin hangi HTML elementi olarak render edileceğini belirler. Varsayılan olarak `div` kullanılır; `section`, `article`, `span` gibi farklı elementler atanabilir.

**Dönüş**: `React.FC<ScrollRevealProps>` — Bileşen, children'ı sarmalayan ve scroll tabanlı animasyon uygulayan bir React fonksiyonel bileşeni döndürür. Render edilen eleman, belirlenen HTML elementi (`as` prop'u) içinde animasyon durumuna göre stil değişiklikleri uygulanmış şekilde döner.

---

## INTERFACES

### ScrollRevealProps
- `children: React.ReactNode`
- `animation: 'fadeUp' | 'scaleIn' | 'fadeIn' | 'slideLeft'`
- `className?: string`
- `staggerIndex?: number`
- `as?: 'div' | 'section' | 'h1' | 'p'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/ScrollReveal.tsx::ScrollReveal
- **params**:
  - `children` — bileşen içinde render edilecek React çocuk elemanları
  - `animation` — hangi scroll animasyonunun uygulanacağını belirten anahtar, `scrollAnimationClasses` dict'inde lookup için kullanılır
  - `className` — üzerine eklenecek ek CSS sınıf adları, varsayılan `''`
  - `staggerIndex` — stagger (sıralı) animasyon için indeks, tanımlıysa `scrollAnimationClasses.staggerChild`'a geçirilir
  - `as` (Component olarak yeniden adlandırılmış) — render edilecek HTML elemanı veya bileşen, varsayılan `'div'`
- **ic_degiskenler**:
  - `ref` — `useScrollAnimation<HTMLElement>` hook'unun döndürdüğü ref objesi; bileşene atanarak viewport izleme başlatılır
  - `visible` — `useScrollAnimation` hook'unun döndürdüğü boolean; elemanın viewport'a girip girmediğini belirtir
  - `animClass` — `scrollAnimationClasses[animation](visible)` çağrısından elde edilen CSS sınıf dizgisi; animasyonun görünür/gizli durumuna göre uygun sınıfı seçer
  - `style` — `staggerIndex` tanımlıysa `scrollAnimationClasses.staggerChild(staggerIndex)` çağrısıyla dönen inline style nesnesi; tanımlı değilse `undefined`
- **Dönüş**: `JSX.Element` — `Component` elemanının `ref`, `className` (`animClass` + `className` birleşimi) ve `style` özellikleriyle sarılmış `{children}` içeriği

---

## NODE ID STANDARD

  file: src\components\ScrollReveal.tsx
  function: src\components\ScrollReveal.tsx::ScrollReveal

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollReveal

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
- **Yardımcı Sınıflar:** `${animClass`, `${className`