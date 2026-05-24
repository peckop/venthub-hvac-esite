---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\destek\konular\[slug]\page.tsx
skeleton_hash: 2e2b8e50f763d702
generated_at: 2026-05-23T21:49:38Z
---

## Genel Bakış
Bu modül, Next.js dinamik rotalama ile “destek/konular” bölümünde her bir konu için statik sayfalar oluşturur. Konu slug’larını önceden belirleyip Next.js derleme sürecine bildirir, ardından gelen slug’a göre ilgili veriyi getirerek sayfayı render eder.

## Fonksiyon Grupları
### Statik Parametre Üretimi
Veri kaynağındaki tüm konu slug’larını toplar ve Next.js’in statik sayfa yollarını önceden oluşturmasını sağlar.
- generateStaticParams

### Sayfa Render ve Veri Çekme
URL’den alınan slug parametresini çözümler, ilgili konu verisini asenkron olarak getirir ve kullanıcıya sunulacak UI bileşenlerini oluşturur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### generateStaticParams
**Ne yapar**: Bu fonksiyon, Next.js'in statik sayfa üretimi (Static Generation) için gerekli olan statik yolları (paths) tanımlar. Uygulamada dinamik rota olarak `slug` parametresine sahip sayfaların derleme zamanında hangi değerlerle oluşturulacağını belirler.

**Nasıl yapar**: Herhangi bir parametre almaz; doğrudan `topics` adlı bir diziyi kullanarak `map` işlemiyle her bir öğeyi `slug` anahtarı altında döndürür. Bu sayede Next.js, `topics` dizisindeki her `slug` değeri için ayrı bir statik sayfa oluşturur.

**Parametreler**: Yok (parametresiz fonksiyon).

**Dönüş**: `{ slug: string }` şeklinde nesnelerden oluşan bir dizi. Her nesne, bir statik sayfanın yolunu temsil eden `slug` değerini içerir.

### Page
**Ne yapar**: Bu fonksiyon, dinamik `[slug]` rotasındaki sayfanın ana React bileşenidir. Gelen `slug` parametresini alarak asıl içerik bileşeni olan `PageComponent`'i bu değerle birlikte render eder.

**Nasıl yapar**: `params` prop'u aracılığıyla bir `Promise` nesnesi alır; bu promise, `slug` değerini içeren bir nesne çözümler. Fonksiyon `await` kullanarak bu değeri elde eder ve `<PageComponent slug={slug} />` şeklinde iç bileşene iletir.

**Parametreler**:
- `params`: `Promise<{ slug: string }>` — Dinamik rota parametrelerini temsil eden, çözümlendiğinde `slug` değerini veren bir Promise nesnesi.

**Dönüş**: JSX elemanı — `<PageComponent>` bileşeni, `slug` prop'u ile birlikte döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\destek\konular\[slug]\page.tsx::generateStaticParams
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `topics` — `tr.knowledge.topics` nesnesinin anahtarlarından oluşan dizi; her bir slug için statik yol oluşturmak amacıyla `map` ile dönülür.
- **Dönüş**: Her öğesi `{ slug: string }` biçiminde nesnelerden oluşan bir dizi.

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\destek\konular\[slug]\page.tsx::Page
- **params**:
  - `params` — rota parametrelerini saran bir Promise; `await` ile çözümlenerek `slug` değeri elde edilir.
- **ic_degiskenler**:
  - `slug` — `params`’tan çözümlenen slug değeri; `PageComponent` bileşenine prop olarak aktarılır.
- **Dönüş**: `PageComponent`’i `slug` prop’u ile render eden JSX öğesi (React elemanı).

---

## NODE ID STANDARD

  file: src\app\destek\konular\[slug]\page.tsx
  function: src\app\destek\konular\[slug]\page.tsx::generateStaticParams
  function: src\app\destek\konular\[slug]\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: generateStaticParams