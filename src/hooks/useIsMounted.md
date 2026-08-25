---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\hooks\useIsMounted.ts
skeleton_hash: fddb67ba3050ee3f
entity_hashes:
  func:useIsMounted: ae14f2fca3691906
  overview: 050973256d3540a7
generated_at: 2026-08-25T07:26:55Z
---

## Genel Bakış

Bu modül, bir React bileşeninin hâlâ monte edilmiş (mounted) olup olmadığını kontrol eden tek bir hook sunar. Genellikle asenkron işlemler tamamlandığında bileşen unmount edilmişse state güncellemesinin yapılmamasını sağlamak amacıyla kullanılır.

## Fonksiyon Grupları

### Bileşen Monte Durumu Takibi

Bileşenin yaşam döngüsü boyunca monte edilip edilmediğini izleyerek, unmount edilmiş bileşenlerde state güncellemesi gibi güvensiz işlemleri engellemeye yarar.

- useIsMounted

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### useIsMounted
**Ne yapar**: Next.js 15 veya genel SSR (Sunucu Tarafı Render) mimarisinde Hydration Mismatch (Uyum Sağlama Uyuşmazlığı) hatalarını önlemek amacıyla kullanılan bir React custom hook'udur. İlk render aşamasında (sunucu tarafında) `false` değeri döner; istemci tarafında bileşen mount edildikten sonra `true` değerine geçer. Bu sayede, yalnızca istemci tarafında çalışması gereken bileşenlerin sunucu tarafında render edilmesi engellenir.

**Nasıl yapar**: `useState` hook'u ile `mounted` adında bir durum değişkeni oluşturulur ve başlangıç değeri `false` olarak ayarlanır. `useEffect` hook'u, boş bir bağımlılık dizisi (`[]`) ile birlikte kullanılır; bu yapı, efektin yalnızca bileşen istemci tarafında mount edildiğinde bir kez çalışmasını sağlar. Efekt çalıştığında `setMounted(true)` çağrılarak durum güncellenir ve fonksiyon `mounted` değerini döndürür. Sunucu tarafında `useEffect` çalışmayacağı için değer `false` olarak kalır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `boolean` — Bileşenin istemci tarafında mount edilip edilmediğini gösteren boolean değer. Sunucu tarafında ve ilk istemci render'ında `false`, istemci tarafında mount işlemi tamamlandıktan sonra `true` döner.

---

## İTHALATLAR (IMPORTS)
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useIsMounted.ts::useIsMounted
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — `useState(false)` ile oluşturulan state değişkeni; bileşenin mount edilip edilmediğini gösteren boolean değer, başlangıç değeri `false`
  - `setMounted` — `useState`'ten dönen setter fonksiyonu; `mounted` state'ini güncellemek için kullanılır
  - `useEffect` içindeki callback — bileşen ilk mount edildiğinde `setMounted(true)` çağrısını yapar; boş dependency array `[]` sayesinde yalnızca ilk render'da çalışır
- **Dönüş**: `mounted` — boolean, bileşen mount edildikten sonra `true` olur

---

## NODE ID STANDARD

  file: useIsMounted.ts
  function: useIsMounted.ts::useIsMounted

---

## DISA AKTARILANLAR (EXPORTS)
  export: useIsMounted