---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx
skeleton_hash: 9c98f4bb854d9145
generated_at: 2026-05-23T22:04:04Z
---

## Genel Bakış
Bu modül, uygulama çözümlerini gösteren bir React bileşeni içerir. Bileşen, çeviri sözlüğünü prop olarak alarak arayüz metinlerini dinamik olarak doldurur ve kullanıcıya ilgili çözümleri sunar.

## Fonksiyon Grupları
### Kullanıcı Arayüzü Renderlama
Bileşen, uygulama çözümlerini görsel olarak düzenler ve görüntüler.
- ApplicationSolutions

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `dictionary` prop’u sağlanmazsa, `t` tanımsız olur ve çeviri fonksiyonu çağrıldığında çalışma zamanı hatası oluşur.  
[Aksiyom 2]: Eğer `solutions` dizisi boşsa, bileşen herhangi bir çözüm öğesi render etmez ve boş bir alan gösterir.

---

## FONKSIYON DETAYLARI

### ApplicationSolutions
**Ne yapar**: ApplicationSolutions fonksiyonu, dictionary propunu alarak bir React bileşeni oluşturur.  
**Nasıl yapar**: Fonksiyon, gelen `t` (dictionary) propunu kullanarak çeviri sağlayacak JSX döndürür; bu sayede bileşen ekrana renders edilir.  
**Parametreler**:  
- dictionary: t — çeviri fonksiyonunu içeren nesne, genellikle i18n veya benzeri bir kütüphaneden gelir  
**Dönüş**: React.FC<ApplicationSolutionsProps> türünde bir React fonksiyonel bileşeni, UI'yi render eder.

---

## INTERFACES

### SolutionItem
- `id: 'parking' | 'kitchen' | 'entrance' | 'comfort'`
- `href: string`
- `image: string`
- `span: string`

### LocalizedDict
- `eyebrow: string`
- `title: string`
- `subtitle: string`
- `viewAll: string`
- `items: Record<string, {`

### ApplicationSolutionsProps
- `dictionary: LocalizedDict`

---

## SABİTLER
- **solutions** (array) — `[
  { 
    id: 'parking', 
    href: '/category/industrial-ventilation/jet-fa...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx::ApplicationSolutions
- **params**: dictionary: t
- **ic_degiskenler**: 
  - *yok* — fonksiyon gövdesinde yeni bir değişken tanımı bulunmamaktadır; dışarıdan `solutions` sabiti ve `t` parametresi kullanılır.
- **Dönüş**: React.FC<ApplicationSolutionsProps> (JSX elementi döner)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\ApplicationSolutions.tsx::(item, index) => {}
- **params**: item, index
- **ic_degiskenler**: 
  - `itemDict` — `t.items[item.id]` değerini alır; tanımsızsa `{ title: '', eyebrow: '', description: '', point1: '', point2: '' }` varsayılan nesnesini kullanarak kartın başlık, altyazı, açıklama ve iki özellik metni için veri kaynağı sağlar.
  - `delayClass` — `['delay-0','delay-150','delay-300','delay-500','delay-700'][index % 5]` ifadesiyle indekse göre 0, 150, 300, 500, 700 ms gecikme sınıfı seçer; bu sınıf öğeye stagger (dağınık) fade‑up animasyonu uygulanmasını sağlar.
- **Dönüş**: JSX.Element (map içinde döndürülen `<div>` kartı)

---

## NODE ID STANDARD

  file: src\components\home\ApplicationSolutions.tsx
  function: src\components\home\ApplicationSolutions.tsx::ApplicationSolutions

---

## DISA AKTARILANLAR (EXPORTS)
  export: ApplicationSolutions