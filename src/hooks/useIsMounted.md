---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useIsMounted.ts
skeleton_hash: a2364f930e9df71b
entity_hashes:
  func:useIsMounted: ae14f2fca3691906
  overview: 050973256d3540a7
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu modül, React bileşenlerinin sayfaya monte olup olmadığını takip eden özel bir hook sunar. Temel amacı, bileşen kaldırıldıktan sonra tetiklenen asenkron işlemlerden kaynaklanan state güncellemelerini ve olası bellek sızıntılarını önlemektir.

## Fonksiyon Grupları
### Bileşen Montaj Durumu Takibi
Bileşenin mount/unmount yaşam döngüsünü izleyerek, kaldırılmış bileşenlerdeki state güncellemelerine karşı koruma sağlar.
- useIsMounted

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React'ın hooks mekanizması ve yaşam döngüsüne temel dayalı bir koruyucu yapı sunduğu için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `useIsMounted` hook'u bir React fonksiyonel bileşeninin en üst seviyesinde (top-level) çağrılmazsa, React'ın "Invalid hook call" hatası oluşur.

[Aksiyom 2]: Eğer hook'u çağıran bileşen unmount edildiğinde (kaldırıldığında) React'ın `useEffect` temizleme fonksiyonu tetiklenmezse, mount durumu yanlış bir şekilde `true` olarak kalır ve bileşen kaldırıldıktan sonra state güncellemeleri attempted olur, bu da potansiyel bellek sızıntısına yol açar.

[Aksiyom 3]: Eğer React sürümü 16.8 veya üzeri değilse (hooks desteği yoksa), `useIsMounted` hook'u hiç çalıştırılamaz.

[Aksiyom 4]: Eğer SSR (Sunucu tarafı oluşturma) sırasında `useEffect` çalışıyormuş gibi davranılırsa (ki React 18+ ile bu değişti), mounted durumu sunucu ve istemci arasında farklılık göstererek Hydration Mismatch hatasına yol açar.

---

## FONKSİYON DETAYLARI

### useIsMounted
**Ne yapar**: Next.js 15 ve genel SSR (Sunucu Tarafı Oluşturma) mimarilerinde Hydration Mismatch (Sıvılandırma Uyumsuzluğu) hatalarını önlemek için kullanılan özel bir React hook'tur. İlk sunucu tarafı render sürecinde false değeri döndürür, bileşen istemcide tam olarak mount olduktan sonra true değerine geçer. Yaygın kullanım senaryosunda, true değerine geçene kadar iskelet (skeleton) yükleme bileşeni gösterilerek yalnızca istemci tarafında çalışması gereken bileşenlerin erken render edilmesi engellenir, sunucu ve istemci içerikleri arasındaki uyumsuzluklardan kaynaklanan hatalar ortadan kaldırılır.
**Nasıl yapar**: React hook standartlarına uygun olarak çalışır, dahili olarak bileşenin mount durumunu takip eden bir durum değişkeni kullanır. İstemci tarafında yalnızca mount sonrası tetiklenen useEffect hook'u aracılığıyla durumunu true olarak günceller. Sunucu tarafı render süreçlerinde useEffect hiçbir zaman tetiklenmediği için sunucuda daima false değeri döndürülür, bu da sunucu ile istemci içerikleri arasındaki uyumsuzluğun temelini ortadan kaldırır. İstemcide mount işlemi tamamlandıktan sonra durum kalıcı olarak true kalır, tüm yeniden render süreçlerinde de doğru değer sunulmaya devam edilir.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi kabul etmez, bağımsız olarak çalışır
**Dönüş**: Boolean tipinde bir değer döndürür. Sunucu tarafı ilk render sırasında ve istemcide bileşen henüz mount olmadan false, bileşen istemcide başarıyla mount edildikten sonra kalıcı olarak true değerini döndürür. Döndürülen bu değer, yalnızca istemci tarafında çalıştırılması gereken bileşenlerin render koşulunu belirlemek için kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useIsMounted.ts::useIsMounted
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — useState hook'undan dönen boolean state değeri; bileşen挂载(mount) olup olmadığını tutar, başlangıçta `false`'tur
  - `setMounted` — useState hook'undan dönen setter fonksiyonu; `mounted` state'ini güncellemek için kullanılır, useEffect içinde `true` olarak çağrılır
  - `useEffect(() => { setMounted(true); }, [])` — React useEffect hook'u; bağımlılık dizisi boş `[]` olduğu için bileşen ilk挂载olduğunda bir kez çalışır ve `setMounted(true)` çağırarak mounted durumunu `true`'ya ayarlar
- **Dönüş**: `mounted` (boolean) — bileşen挂载 durumunu temsil eden boolean değer

---

## NODE ID STANDARD

  file: src\hooks\useIsMounted.ts
  function: src\hooks\useIsMounted.ts::useIsMounted

---

## DISA AKTARILANLAR (EXPORTS)
  export: useIsMounted