---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useRole.ts
skeleton_hash: fc1011af39009897
entity_hashes:
  func:useRole: 86c3bf52308dd229
  overview: 90cbd0f7f32b7b04
generated_at: 2026-06-19T06:24:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde React uygulaması için tasarlanmış özel bir hook olup, kullanıcının oturum açmış rolünü ve buna bağlı erişim izinlerini yönetir. Uygulama genelinde yetkilendirme kontrolleri için standart bir arayüz sunar ve bileşenlerin rol tabanlı mantık yazmasını kolaylaştırır.

## Fonksiyon Grupları
### Rol Bilgisi Sağlama Hook'u
Mevcut kullanıcının rol bilgisini alarak, bileşenlere yetki denetimi için gerekli izin ve erişim durumlarını hesaplar ve sunar.
- useRole

---

## AXIOMS – Mimari Varsayımlar
Bu modül için verilen bilgiler (fonksiyon gövdesi kodu) yetersiz olduğundan, yalnızca fonksiyon imzasından çıkarılabilecek minimum varsayımlar listelenmektedir.

[Aksiyom 1]: Eğer `useRole()` hook'u bir React bileşeni dışında调用edilirse (örn: düz bir fonksiyon içinde), React kuralı ihlali olur ve hata fırlatılır.

[Aksiyom 2]: Eğer hook'un bağlı olduğu React bileşeni bileşen hiyerarşisinde bir React.Provider (context) içinde yer almıyorsa, hook'un bağımlı olduğu context değeri (`undefined` veya `null`) olur.

[Aksiyom 3]: Eğer `useRole()` fonksiyonu parametre almıyorsa, fonksiyon çağrılırken herhangi bir argüman geçilirse TypeScript derleme hatası olur.

---

**Not:** Bu modül için fonksiyon gövdesi kodu paylaşılmamıştır. Yukarıdaki aksiyomlar yalnızca fonksiyon imzası (`useRole()` — parametresiz) ve React hook yapısının standart kurallarından türetilmiştir. Hook'un hangi context'i tükettiği, hangi değerleri döndürdüğü veya hangi iç mantığı barındırdığı bilinmediğinden, fonksiyona özgü iş aksiyomları tanımlanamamıştır.

---

## FONKSİYON DETAYLARI

### useRole
**Ne yapar**: Mevcut kullanıcının Rol Tabanlı Erişim Kontrolü (RBAC) izinlerini değerlendiren özel bir React hook'udur. `useAuth` hook'undan ham rol bilgisini alır ve uygulamanın izin matrisiyle (`src/lib/rbac.ts`) birleştirerek kullanıma hazır, bağlı izin kontrol fonksiyonları içeren bir nesne döner.

**Nasıl yapar**: `useAuth` hook'unu çağırarak mevcut kullanıcının `role` değerini ve yükleme durumlarını (`authLoading`, `roleLoading`) alır. `useCallback` hook'unu kullanarak `canAccess` ve `canWrite` fonksiyonlarını, bağımlılık dizisi olarak yalnızca `role` değerini vererek stabilize eder. Bu optimizasyon, fonksiyonların referans eşitliğini koruyarak tüketici bileşenlerdeki gereksiz yeniden render'ları ve potansiyel sonsuz döngüleri engeller. Son olarak, `useMemo` ile tüm dönüş nesnesini, bağımlılık dizisindeki değerler (`role`, `loading`, `roleLoading`, `canAccess`, `canWrite`) değiştikçe yeniden hesaplar.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Aşağıdaki alanları içeren bir nesne döner:
- `role` — Kullanıcının mevcut rolü (string veya tanımsız olabilir, `useAuth`'tan gelir).
- `loading` — Kimlik doğrulama veya rol yükleme işlemlerinden herhangi birinin devam edip etmediğini belirten boolean değer. Hem `authLoading` hem de `roleLoading` true ise true olur.
- `roleLoading` — Sadece rol bilgisinin yüklenip yüklenmediğini belirten boolean değer.
- `canAccess` — `canAccessPage(role, path)` fonksiyonuna bağlı bir kontrol fonksiyonu. Verilen bir URL yolunun (`path`), kullanıcının mevcut rolüyle erişilebilir olup olmadığını kontrol eder.
- `canWrite` — `canWriteRbac(role, entity)` fonksiyonuna bağlı bir kontrol fonksiyonu. Verilen bir varlığın (`entity`, örneğin 'user', 'report'), kullanıcının mevcut rolüyle yazılıp yazılamayacağını kontrol eder.
- `isReadOnly` — `isReadOnly(role)` fonksiyonunun sonucu. Kullanıcının rolünün salt okunur olup olmadığını belirten boolean değer.

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
  - `role` — `useAuth()` hookundan destructured, kullanıcının mevcut RBAC rolü
  - `authLoading` — `useAuth()` hookundan destructured (`loading` alias'ı ile), authentication durumunun yüklenme flag'i
  - `roleLoading` — `useAuth()` hookundan destructured, rol verisinin yüklenme flag'i
  - `loading` — `authLoading || roleLoading` birleşik yükleme durumu; herhangi bir auth veya rol yüklemesi devam ediyorsa `true`
  - `canAccess` — `useCallback` ile sarılmış memoize fonksiyon; verilen bir `path` string'i için `canAccessPage(role, path)` çağırarak kullanıcının o sayfaya erişebilip erişemeyeceğini kontrol eder. `[role]` bağımlılığı ile stabilite sağlanır
  - `canWrite` — `useCallback` ile sarılmış memoize fonksiyon; verilen bir `entity` string'i için `canWriteRbac(role, entity)` çağırarak kullanıcının o varlığa yazma izni olup olmadığını kontrol eder. `[role]` bağımlılığı ile stabilite sağlanır
- **Dönüş**: `useMemo` ile sarılmış obje — `{ role, loading, roleLoading, canAccess, canWrite, isReadOnly }` formatında. `isReadOnly` doğrudan `isReadOnly(role)` çağrısı ile hesaplanır (sadece okuma izni varsa `true`). Bağımlılık dizisi: `[role, loading, roleLoading, canAccess, canWrite]`. Dönüş tipi React hook nesnesi; yan etki olarak bileşenlere rol tabanlı erişim kontrol fonksiyonları ve yükleme durumları sağlar

---

## NODE ID STANDARD

  file: src\hooks\useRole.ts
  function: src\hooks\useRole.ts::useRole

---

## DISA AKTARILANLAR (EXPORTS)
  export: useRole