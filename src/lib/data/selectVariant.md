---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\data\selectVariant.ts
skeleton_hash: 6ccfa44bfd139a48
entity_hashes:
  func:selectVariant: ac5f2e14be230ef9
  overview: de5b89a98f0e8505
generated_at: 2026-08-25T08:44:09Z
---

## Genel Bakış

Bu modül, bir varyant koleksiyonu içerisinden istenen bir SKU değerine göre uygun varyantın seçilmesini sağlayan tek bir fonksiyon içerir. Varyant seçimi işlevini merkezi bir noktadan yöneterek, SKU tabanlı varyant çözümleme ihtiyacını karşılar.

## Fonksiyon Grupları

### Varyant Seçimi

Belirtilen SKU değerine göre varyant listesinden uygun eşleşmeyi bulur ve bir `VariantSelection<T>` sonucu döndürür. SKU null veya undefined olarak verildiğinde de uygun bir sonuç üretir.

- selectVariant

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir. Aksiyomlar yalnızca fonksiyon gövdesinden türetilir; imza, docstring veya değişken isimlerinden çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### selectVariant
**Ne yapar**: Ürün varyantları listesinden istenen SKU'ya uygun varyantı seçen generic bir yardımcı fonksiyondur. Dört farklı durumu yönetir: liste boşsa, istenen SKU belirtilmemişse, tam eşleşme bulunursa ve istenen varyant mevcut değilse. Her durumda uygun bir `VariantSelection<T>` nesnesi döndürerek çağıran koda durum bilgisi sağlar.

**Nasıl yapar**: Fonksiyon öncelikle `requestedSku` parametresini normalize eder; boşluklardan arındırılmış ve geçerli bir değer olup olmadığını kontrol eder. Eğer varyant listesi boşsa `kind: 'empty'` durumuyla birlikte istenen SKU bilgisini döndürür. İstenen SKU belirtilmemişse listenin ilk elemanını varsayılan varyant olarak `kind: 'default'` ile döndürür. İstenen SKU ile eşleşen bir varyant bulunursa `kind: 'exact'` durumuyla eşleşen varyantı döndürür. Hiçbir eşleşme bulunamadığında ise ilk varyantı `kind: 'stale'` olarak işaretleyerek döndürür; bu durumda boş sayfa göstermek yerine ilk varyant görüntülenir ancak çağıran kod URL'yi kanonik hale getirebilir. Generic yapısı sayesinde `VariantLike` arayüzünü uygulayan herhangi bir tiple çalışabilir.

**Parametreler**:
- variants: readonly T[] — Seçim yapılacak varyantların bulunduğu salt okunur dizi. T tipi `VariantLike` arayüzünü genişletmelidir.
- requestedSku: string | null | undefined — Kullanıcının istediği varyantın SKU kodu. null, undefined veya boş string olabilir.

**Dönüş**: `VariantSelection<T>` — Dört farklı `kind` değerinden birini içeren bir nesne döndürür: `empty` (liste boş, `requestedSku` içerir), `default` (ilk varyant, `variant` içerir), `exact` (eşleşen varyant, `variant` içerir) veya `stale` (ilk varyant ve `requestedSku` içerir, istenen varyant bulunamadığında kullanılır).

---

## TYPE ALIASES

### VariantLike
`?sku=` → varyant seçimi (saf). NİÇİN AYRI BİR DOSYA: Bu karar daha önce `ProductDetailPageView` içinde tek satırdı: `variants.find((v) => v.sku === skuParam) ?? variants[0]` Davranışı şuydu: **eşleşmeyen bir SKU sessizce ailenin ilk varyantına düşer.** Kullanıcı başka kapasitedeki bir ürünün fiyatı
```typescript
type VariantLike = { sku: string }
```

### VariantSelection
```typescript
type VariantSelection = <T extends VariantLike>
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/data/selectVariant.ts::selectVariant
- **params**:
  - `variants` — readonly T[] dizisi; VariantLike arayüzünü uygulayan varyant koleksiyonu
  - `requestedSku` — string | null | undefined; istenen varyantın SKU değeri
- **ic_degiskenler**:
  - `requested` — requestedSku && requestedSku.trim() koşulu sağlanırsa requestedSku, sağlanmazsa null; boşluk karakterlerinden arındırılmış istenen SKU veya null
  - `first` — variants[0]; dizinin ilk elemanı, dizi boşsa undefined
  - `match` — variants.find((v) => v.sku === requested); requested ile sku değeri eşleşen varyant, bulunamazsa undefined
- **Dönüş**: VariantSelection<T>; dört durumdan biri:
  - `{ kind: 'empty', requestedSku: requested }` — variants dizisi boşsa
  - `{ kind: 'default', variant: first }` — requested null ise (istenilen SKU yoksa)
  - `{ kind: 'exact', variant: match }` — requested ile birebir eşleşen varyant bulunduysa
  - `{ kind: 'stale', variant: first, requestedSku: requested }` — requested var ama eşleşen varyant bulunamadıysa; ilk varyant stale olarak işaretlenir, çağıran URL'yi kanonikleştirir

---

## NODE ID STANDARD

  file: src\lib\data\selectVariant.ts
  function: src\lib\data\selectVariant.ts::selectVariant

---

## DISA AKTARILANLAR (EXPORTS)
  export: VariantLike
  export: VariantSelection
  export: selectVariant