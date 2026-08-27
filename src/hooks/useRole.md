---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useRole.ts
skeleton_hash: 64b5da2aadc4dc55
entity_hashes:
  func:useRole: 86c3bf52308dd229
  overview: 90cbd0f7f32b7b04
generated_at: 2026-08-27T08:36:20Z
---

## Genel Bakış

`useRole.ts` modülü, `useRole` adında tek bir fonksiyon içeren bir modüldür. Modül adındaki "use" ön eki ve dosya uzantısı, bunun bir React özel kancası (custom hook) olduğunu gösterir. Modülün sorumluluğu, rol bilgisine erişim sağlamaktır; ancak fonksiyonun dahili çalışma detayları verilen kaynakta yer almamaktadır.

## Fonksiyon Grupları

### Rol Yönetimi
Bu grup, rol bilgisini sağlayan tek bir fonksiyondan oluşur. Modülün tüm sorumluluğu bu fonksiyon üzerinde toplanmıştır.
- useRole

## Bağımlılıklar ve Mimari Notlar

- **İç bağımlılıklar:** Tek fonksiyon bulunduğu için modül içi çağrı ilişkisi yoktur.
- **Dış bağımlılıklar:** Kaynak kodu verilmediği için hangi dış modüllere bağlı olduğu bilinmiyor.
- **Dinamik/lazy yükleme:** Bilinmiyor.
- **Mimari önem:** Modül, adından anlaşılacağı üzere rol tabanlı bir mekanizmanın parçasıdır; ancak bu mekanizmanın kapsamı ve diğer modüllerle nasıl etkileştiği hakkında kaynakta bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmediğinden, modülün doğru çalışması için gerekli koşullar belirlenememektedir. Yalnızca fonksiyon imzası (`useRole()`, parametresiz) mevcuttur; gövde içeriği bilinmediğinden hangi bağımlılıklara, durumlara veya eşik değerlerine ihtiyaç duyulduğu tespit edilemez.

---

## FONKSİYON DETAYLARI

### useRole
**Ne yapar**: Mevcut kullanıcının Rol Tabanlı Erişim Kontrolü (RBAC) izinlerini değerlendiren özel bir React hook'udur. `useAuth`'tan gelen ham rol bilgisini, uygulamanın izin matrisi (`src/lib/rbac.ts`) ile birleştirerek erişim kontrol fonksiyonları üretir ve tüketen bileşenlere sunar.

**Nasıl yapar**: Öncelikle `useAuth` hook'undan `role`, `authLoading` (kodda `loading` olarak yeniden adlandırılmış) ve `roleLoading` değerlerini alır. Yükleme durumunu bu iki loading değerinin mantıksel OR'u olarak hesaplar. Ardından `canAccess` ve `canWrite` fonksiyonlarını `useCallback` ile sarar; bu sayede `role` değeri değişmediği sürece bu fonksiyonların referansları sabit kalır. Koddaki kritik yoruma göre bu stabilite zorunludur çünkü tüketen bileşenler (CommandPalette, AdminRealtimeNotifications gibi) bu fonksiyonları `useMemo`/`useCallback`/`useEffect` bağımlılıklarında kullanmaktadır; her render'da yeni referans dönülmesi sonsuz render döngüsüne yol açar. Son olarak tüm değerleri `useMemo` ile sarılmış bir nesne olarak döndürür; bu nesne yalnızca bağımlılıklar (`role`, `loading`, `roleLoading`, `canAccess`, `canWrite`) değiştiğinde yeniden oluşturulur.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `useMemo` ile sarılmış bir nesne döndürür. Kesin TypeScript dönüş tipi kaynak kodda belirtilmemiştir (bilinmiyor). Dönen nesne şu alanları içerir:
- `role`: `useAuth`'tan gelen kullanıcının mevcut rolü
- `loading`: `authLoading` ile `roleLoading` değerlerinin mantıksal OR'u; herhangi bir yükleme süreci devam ederken `true` olur
- `roleLoading`: `useAuth`'tan gelen rol yükleme durumu
- `canAccess`: `(path: string) => boolean` — verilen yol (path) için sayfa erişim izni olup olmadığını kontrol eden fonksiyon; `canAccessPage` fonksiyonunu `role` ile bağlayarak çalışır
- `canWrite`: `(entity: string) => boolean` — verilen varlık (entity) için yazma izni olup olmadığını kontrol eden fonksiyon; `canWriteRbac` fonksiyonunu `role` ile bağlayarak çalışır
- `isReadOnly`: `isReadOnly(role)` çağrısının sonucu; kullanıcının salt okunup modda olup olmadığını belirtir

---

## İTHALATLAR (IMPORTS)
- import: ../lib/rbac::canAccessPage
- import: ../lib/rbac::canWrite
- import: ../lib/rbac::isReadOnly
- import: ./useAuth::useAuth
- import: react::useCallback
- import: react::useMemo

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useRole.ts::useRole
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `role` — `useAuth()` fonksiyonundan destructure edilen kullanıcı rolü; `canAccess`, `canWrite` callback'lerinde ve dönüş objesindeki `isReadOnly` hesaplamasında bağımlılık olarak kullanılır
  - `authLoading` — `useAuth()` fonksiyonundan destructure edilen kimlik doğrulama yükleme durumu (kaynakta `loading` olarak yeniden adlandırılmış); `loading` hesaplamasında kullanılır
  - `roleLoading` — `useAuth()` fonksiyonundan destructure edilen rol yükleme durumu; `loading` hesaplamasında ve dönüş objesinde kullanılır
  - `loading` — `authLoading || roleLoading` ifadesinin sonucu; dönüş objesinde kullanılır
  - `canAccess` — `useCallback` ile sarılmış fonksiyon; `path` parametresi alır ve `canAccessPage(role, path)` çağrısını yapar; bağımlılık dizisi `[role]`
  - `canWrite` — `useCallback` ile sarılmış fonksiyon; `entity` parametresi alır ve `canWriteRbac(role, entity)` çağrısını yapar; bağımlılık dizisi `[role]`
- **Dönüş**: `useMemo` ile sarılmış obje `{ role, loading, roleLoading, canAccess, canWrite, isReadOnly: isReadOnly(role) }`; bağımlılık dizisi `[role, loading, roleLoading, canAccess, canWrite]`

---

## NODE ID STANDARD

  file: src\hooks\useRole.ts
  function: src\hooks\useRole.ts::useRole

---

## DISA AKTARILANLAR (EXPORTS)
  export: useRole