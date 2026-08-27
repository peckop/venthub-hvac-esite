---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useFavorites.ts
skeleton_hash: fe4dedc11d2e5faf
entity_hashes:
  func:readIds: af9317674fdf837a
  func:useFavorites: dcf6b0f3ad596563
  overview: 0ff10d420319610b
generated_at: 2026-08-27T08:35:40Z
---

## Genel Bakış

Bu modül, kullanıcıların favori öğelerini yönetmek için bir React custom hook sunar. Favori ID'lerini yerel depodan okuyan bir yardımcı fonksiyon ve bu veriyi React bileşenlerine sağlayan bir hook içerir. Modül, favori ekleme/çıkarma ve favori durumunu sorgulama işlevlerini tek bir merkezi noktadan sunar.

## Fonksiyon Grupları

### Veri Erişim
Yerel depodan (muhtemelen localStorage) favori öğelerin ID listesini okur ve dizi olarak döndürür. Bu fonksiyon, hook tarafından çağırılarak başlangıç verisini sağlar.
- readIds

### React Hook
Bileşenlerin favori yönetimine erişmesini sağlayan ana hook'tur. `readIds` fonksiyonunu çağırarak mevcut favori ID'lerini yükler ve bileşenlere favori durumunu sorgulama, ekleme veya çıkarma imkânı sunar.
- useFavorites

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdeleri verilmemiştir. Mimari varsayımlar yalnızca fonksiyon gövdelerinden üretilebilir; imzalar tek başına davranış, bağımlılık veya hata senaryoları hakkında güvenilir bilgi sağlamaz.

---

## FONKSİYON DETAYLARI

### readIds
**Ne yapar**: Tarayıcının `localStorage` alanında saklanan favori ürün kimliklerini okur ve dizi olarak döndürür. Sunucu tarafı render (SSR) ortamlarında veya okuma sırasında oluşan hatalarda güvenli bir şekilde boş dizi döndürerek uygulamanın çökmesini engeller.

**Nasıl yapar**: Fonksiyon önce `typeof window === 'undefined'` kontrolü yaparak sunucu tarafında çalışıp çalışmadığını denetler; sunucu tarafındaysa boş dizi döndürür. Ardından `window.localStorage.getItem(STORAGE_KEY)` ile ham veriyi okur. Ham veri varsa `JSON.parse` ile çözümleyerek `parsed` değişkenine atar; yoksa boş dizi kullanır. Çözümlenen değer bir dizi ise (`Array.isArray(parsed)`) her elemanı `typeof x === 'string'` kontrolünden geçirerek yalnızca string olanları filtreler ve döndürür. Dizi değilse boş dizi döndürür. `try-catch` bloğu ile `JSON.parse` veya diğer işlemler sırasında oluşabilecek herhangi bir hata yakalanır ve hata durumunda boş dizi döndürülür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `string[]` — `localStorage`'dan okunan ve doğrulanan favori ürün kimliklerinin dizisi. Hata durumunda veya sunucu tarafında boş dizi döndürülür.

### useFavorites
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: useFavorites.ts::readIds
- **params**: yok
- **ic_degiskenler**:
  - `raw` — `window.localStorage.getItem(STORAGE_KEY)` çağrısının sonucu; localStorage'dan okunan ham JSON string'i veya null
  - `parsed` — `raw` varsa `JSON.parse(raw)` ile parse edilen değer, yoksa boş dizi `[]`; `unknown` tipinde
- **Dönüş**: `string[]` — localStorage'dan okunan, string tipindeki ID'lerin filtrelenmiş dizisi; hata durumunda veya SSR ortamında boş dizi

### [N2_NASIL] AST Pointer: useFavorites.ts::useFavorites
- **params**: yok
- **ic_degiskenler**:
  - `ids` — `useState<string[]>([])` ile başlatılan state; mevcut favori ürün ID'lerinin listesi
  - `setIds` — `ids` state'ini güncelleyen React setter fonksiyonu
  - `sync` — useEffect içinde tanımlanan fonksiyon; `readIds()` çağrısının sonucunu `setIds` ile state'e aktarır
  - `write` — `useCallback` ile tanımlanan fonksiyon; parametre olarak `next: string[]` alır, `window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))` ile localStorage'a yazar (hata durumunda sessizce geçer), ardından `setIds(next)` ile state'i günceller ve `window.dispatchEvent(new Event(CHANGE_EVENT))` ile özel bir olay yayınlar
  - `isFavorite` — `useCallback` ile tanımlanan fonksiyon; parametre olarak `productId: string` alır, `ids.includes(productId)` ile ürünün favori olup olmadığını boolean olarak döndürür
  - `toggleFavorite` — `useCallback` ile tanımlanan fonksiyon; parametre olarak `productId: string` alır, ürün zaten favorilerdeyse `ids.filter(x => x !== productId)` ile çıkarır, değilse `[...ids, productId]` ile ekler; sonucu `write` fonksiyonuna iletir
  - `removeFavorite` — `useCallback` ile tanımlanan fonksiyon; parametre olarak `productId: string` alır, `ids.filter(x => x !== productId)` ile ürünü favorilerden çıkarır; sonucu `write` fonksiyonuna iletir
- **Dönüş**: `useMemo` ile döndürülen obje `{ favorites: ids, isFavorite, toggleFavorite, removeFavorite }` — `favorites` mevcut ID listesini, diğerleri ilgili fonksiyonları temsil eder

---

## NODE ID STANDARD

  file: src\hooks\useFavorites.ts
  function: src\hooks\useFavorites.ts::readIds
  function: src\hooks\useFavorites.ts::useFavorites

---

## DISA AKTARILANLAR (EXPORTS)
  export: readIds
  export: useFavorites