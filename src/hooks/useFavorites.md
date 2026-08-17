---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\hooks\useFavorites.ts
skeleton_hash: c63e5adff3a23d94
entity_hashes:
  func:readIds: af9317674fdf837a
  func:useFavorites: dcf6b0f3ad596563
  overview: 0ff10d420319610b
generated_at: 2026-08-16T11:27:41Z
---

## Genel Bakış
`useFavorites` React kancası, kullanıcının uygulama içinde favori olarak işaretlediği kaynakların kimliklerini yönetir. Bu kancayı kullanan bileşenler, tercih edilen kaynakların listesini okuyabilir veya bu listeyi güncelleyebilir. Modül, verileri yerel tarayıcı deposunda (localStorage) saklayarak tercihlerin kalıcılığını sağlar.

## Fonksiyon Grupları
### Veri Erişimi ve Saklama
Bu grup, favori kimliklerinin yerel depodan okunmasını sağlar ve verilerin nasıl alındığını tanımlar.
- readIds: Yerel depodaki favori kimliklerini bir dizi olarak okur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediği için, yalnızca fonksiyon imzalarından çıkarılabilecek minimum varsayımlar tanımlanmıştır.

---

**[Aksiyom 1]**: Eğer `readIds()` çağrıldığında, fonksiyonun dönüş tipi `string[]` formatında (string dizisi) sağlanmazsa, bu fonksiyonu tüketen bileşenler beklenmeyen davranış gösterir.

**[Aksiyom 2]**: Eğer `useFavorites()` bir React hook'u olarak kullanılmıyorsa (örn: koşullu çağrı, döngü içinde çağrı vb.), React kuralları ihlal edilir ve bileşen hata verir.

**[Aksiyom 3]**: Eğer `readIds()` içinde erişilen depolama mekanizması (localStorage, API vb.) müsait değilse veya bozuksa, `string[]` dönüşü garanti edilemez.

---

> **Not**: Fonksiyon gövdeleri (impl. detayları) verilmediği için depolama mekanizması, veri doğrulama kuralları, eşik değerleri veya hata yönetimiyle ilgili ek aksiyomlar **bilinmiyor** olarak işaretlenmiştir. Mimari review için `readIds()` ve `useFavorites()` gövdelerinin paylaşılması önerilir.

---

## FONKSİYON DETAYLARI

### readIds
**Ne yapar**: Tarayıcı `localStorage`'ından favori ürün kimliklerinin (`string[]`) listesini okur. Sunucu tarafında (SSR) veya hata durumunda boş bir dizi döner, böylece uygulama kırılmadan çalışmaya devam eder.

**Nasıl yapar**: Fonksiyon öncelikle `typeof window === 'undefined'` kontrolü ile ortamın sunucu tarafı olup olmadığını anlar; sunucu tarafındaysa doğrudan boş dizi döner. Tarayıcı tarafında `window.localStorage.getItem` ile ham veriyi (`raw`) çeker, `JSON.parse` ile ayrıştırır. Ayrıştırılan verinin bir dizi olup olmadığını `Array.isArray` ile doğrular ve elemanların yalnızca `string` tipinde olanlarını filtreleyerek döner. `JSON.parse` veya其他 hatalarda `try-catch` bloğu yakalanır ve sessizce boş dizi döner. Bu fonksiyon modül seviyesinde bir yardımcı (utility) fonksiyonu olup hook dışına çıkarılmıştır; böylece hem hook hem doğrudan okuma senaryolarında yeniden kullanılabilir.

**Parametreler**:
- Parametre yoktur.

**Dönüş**: `string[]` — Geçerli favori ürün kimliklerinden oluşan dizi. Hiçbir koşulda `undefined` veya `null` dönmez; hata veya boş durumlarda `[]` döner.

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

### [N1_NASIL] AST Pointer: `src/hooks/useFavorites.ts`::readIds
- **params**: (yok)
- **ic_degiskenler**:
  - `raw` — `window.localStorage.getItem(STORAGE_KEY)` ile okunan ham JSON string; `null` olabilir
  - `parsed` — `JSON.parse(raw)` sonucu elde edilen bilinmeyen tipli değer; ham veri `raw` varsa parse edilir, yoksa boş dizi `[]` atanır
- **Dönüş**: `string[]` — `parsed` bir dizi ise yalnızca string olan elemanları filtreleyerek döner; window tanımsızsa, parse/tip hatası yakalanırsa veya dizi değilse boş dizi `[]` döner
- **Yan etkiler**: Yok (pure function)

---

### [N2_NASIL] AST Pointer: `src/hooks/useFavorites.ts`::useFavorites
- **params**: (yok)
- **ic_degiskenler**:
  - `ids` — `useState<string[]>([])` ile oluşturulan state dizisi; favori ürün ID'lerini tutar
  - `sync` — `useEffect` içinde tanımlanan callback; `readIds()` çağırıp sonucu `setIds` ile state'e yazar, tarayıcı storage ve `CHANGE_EVENT` olaylarını dinler
  - `write` — `useCallback` ile sarılmış callback `(next: string[]) => void`; `next` dizisini `window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))` ile localStorage'a yazar, `setIds(next)` ile state'i günceller ve `window.dispatchEvent(new Event(CHANGE_EVENT))` ile custom event fırlatır; localStorage yazma hatası yakalanır ve sessizce geçilir
  - `isFavorite` — `useCallback` ile sarılmış `(productId: string) => boolean`; `ids.includes(productId)` ile verilen `productId`'nin favorilerde olup olmadığını kontrol eder
  - `toggleFavorite` — `useCallback` ile sarılmış `(productId: string) => void`; `productId` favorilerdeyse `ids.filter(x => x !== productId)` ile çıkarıp, değilse `[...ids, productId]` ile ekleyip sonucu `write`'a iletir
  - `removeFavorite` — `useCallback` ile sarılmış `(productId: string) => void`; `ids.filter(x => x !== productId)` ile verilen `productId`'yi favorilerden çıkarıp sonucu `write`'a iletir
- **Dönüş**: `useMemo` sonucu `{ favorites: ids, isFavorite, toggleFavorite, removeFavorite }` nesnesi; bağımlılıkları `ids`, `isFavorite`, `toggleFavorite`, `removeFavorite`
- **Yan etkiler**: `useEffect` ile `window`'a `'storage'` ve `CHANGE_EVENT` event listener'ları eklenir; bileşen unmount'ta temizlenir; `write` callback'i localStorage'a yazar ve custom event fırlatır

---

## NODE ID STANDARD

  file: src\hooks\useFavorites.ts
  function: src\hooks\useFavorites.ts::readIds
  function: src\hooks\useFavorites.ts::useFavorites

---

## DISA AKTARILANLAR (EXPORTS)
  export: readIds
  export: useFavorites