---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useIsMounted.ts
skeleton_hash: 60e0e6a606c5ed0f
entity_hashes:
  func:useIsMounted: ae14f2fca3691906
  overview: 77f3711e51ed33d0
generated_at: 2026-05-28T22:37:46Z
---

## Genel Bakış
Bu modül, React tabanlı HVAC projesinde bileşen yaşam döngüsü yönetimi için geliştirilmiş özel bir hook içerir. Temel amacı, React bileşenlerinin sayfaya monte olup olmadığı durumunu güvenli bir şekilde takip ederek, bileşen kaldırıldıktan sonra gerçekleştirilen state güncellemelerinden kaynaklanan bellek sızıntıları ve çalışma zamanı hatalarını önlemektir.

## Fonksiyon Grupları
### Bileşen Montaj Durumu Takip İşlevi
React bileşenlerinin mount ve unmount durumlarını güvenli bir şekilde izleyen, asenkron işlem sonrası oluşabilecek hataları engellemek için kullanılan temel işlevi sunar.
- useIsMounted

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React ekosisteminde çalışan özel bir hook olarak, bileşen yaşam döngüsüne entegre şekilde bileşenin mount durumunu izler, çalışması için React runtime ortamının ve hook kullanım standartlarının tam olarak sağlanması zorunludur.

[Aksiyom 1]: Eğer React 16.8 veya daha yeni bir React runtime ortamı yoksa, hook'un içindeki temel React hook bağımlılıkları (useRef, useEffect) çalışmaz, modül hiçbir zaman doğru mount durumu döndüremez.
[Aksiyom 2]: Eğer hook, React hook kullanım kuralına uygun olarak sadece üst seviyede (koşulsuz şekilde bileşen veya başka özel hook içinde) çağrılmıyorsa, mount durumu için kullanılan referanslar birden fazla bileşen arasında çakışır, tüm çağrılar için yanlış durum değerleri döndürülür.
[Aksiyom 3]: Eğer React tarafından bileşene ait yaşam döngüsü event'leri (mount, unmount) doğru şekilde tetiklenmiyorsa, modül bileşenin unmount durumunu algılayamaz, daima true değeri döndürerek bellek sızıntılarına veya izin verilmeyen state güncellemelerine yol açar.
[Aksiyom 4]: Eğer hook React component tree bağlamı dışında çağrılıyorsa, hiçbir yaşam döngüsü tetikleyicisi çalışmaz, modül daima yanlış mount durumu döndürür.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useIsMounted.ts::useIsMounted
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — Bileşenin DOM'a mount olup olmadığını takip eden boolean state değişkeni, başlangıç değeri false olarak atanır
  - `setMounted` — React state setter fonksiyonu, `mounted` state değerini güncellemek için kullanılır
  - `useState` — React state hook'u, false başlangıç değeri ile mounted state'ini oluşturur
  - `useEffect` — React yan etki hook'u, boş bağımlılık dizisi ile sadece bileşen ilk mount olduğunda çalışacak şekilde yapılandırılır
- **Dönüş**: boolean tipinde `mounted` değeri (bileşenin güncel mount durumunu temsil eder)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useIsMounted.ts::useIsMounted#mount_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setMounted` — Üst kapsamdan devralınan React state setter fonksiyonu, `mounted` state değerini true olarak günceller
- **Dönüş**: yok (void)

---

## NODE ID STANDARD

  file: src\hooks\useIsMounted.ts
  function: src\hooks\useIsMounted.ts::useIsMounted

---

## DISA AKTARILANLAR (EXPORTS)
  export: useIsMounted