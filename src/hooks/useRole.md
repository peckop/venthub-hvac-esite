---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useRole.ts
skeleton_hash: 2c18158cd6a4a6f5
generated_at: 2026-05-23T22:30:18Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde React özel hook'u olarak geliştirilmiş, kullanıcı rollerini yönetmek üzere tasarlanmıştır. src/hooks dizininde yer alan bu modül, uygulama genelinde yetkilendirme ve erişim kontrolü süreçlerinde kullanılacak merkezi bir rol yönetimi işlevi sunar. Tüm uygulama bileşenlerinin standart bir yöntemle kullanıcı rolü bilgisine erişmesini sağlar.

## Fonksiyon Grupları
### Rol Yönetim Hook Grubu
Uygulama içindeki kullanıcı rollerini almak, işlemek ve ilgili tüketici bileşenlere sunmakla sorumludur, yetki bazlı işlem ve erişim kontrolleri için temel altyapıyı oluşturur.
- useRole

---

## AXIOMS – Mimari Varsayımlar
Bu React özel hook modülü, uygulama içindeki kullanıcı rol bilgisini yönetmek ve erişmek üzere tasarlanmıştır, doğru çalışması için React hook çalışma zamanı koşullarının ve rol verisini sağlayan üst katmanda bir bağlam sağlayıcısının varlığı zorunludur.

[Aksiyom 1]: Eğer useRole() fonksiyonu React hook çağırma kurallarına aykırı bir şekilde (koşullu çağrı, bileşen/özel hook dışı çağrı gibi) çağrılırsa, React çalışma zamanı hatası oluşur, hiçbir rol bilgisine erişim sağlanamaz.
[Aksiyom 2]: Eğer useRole() hookunun rol verisini çektiği React Context sağlayıcısı, hooku kullanan bileşenin üstündeki uygulama ağacında mount edilmemişse, geçerli kullanıcı rolü okunamaz, tüm rol tabanlı yetkilendirme işlemleri başarısız olur.

---

## FONKSIYON DETAYLARI

### useRole
**Ne yapar**: React uygulamaları için özel olarak geliştirilmiş bir hook olup, mevcut oturum açmış kullanıcının Rol Tabanlı Erişim Kontrolü (RBAC) izinlerini hesaplar ve kullanıma hazır hale getirir. Uygulama genelinde tutarlı bir şekilde izin denetimi yapmayı sağlayarak, her bileşende tekrar izin mantığı yazma gereksinimini ortadan kaldırır. Sisteme tanımlı kullanıcı rollerine göre özelleştirilmiş erişim kontrolleri sunar.
**Nasıl yapar**: Önce `useAuth` hook'u aracılığıyla mevcut kullanıcının ham rol bilgisini çeker. Ardından uygulamanın `src/lib/rbac.ts` konumunda tanımlı merkezi izin matrisini içe aktarır. Bu iki veriyi birleştirerek, mevcut kullanıcının rolüne özel olarak bağlanmış izin kontrolü fonksiyonlarını içeren bir nesne oluşturur ve döndürür. Tüm izin hesaplamalarını merkezi olarak tek bir noktada yaparak tutarsızlık riskini ortadan kaldırır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: İçerisinde mevcut kullanıcının rolü ve bu role özel olarak bağlanmış izin kontrolü fonksiyonlarını barındıran bir nesne döndürür. Dönen nesnenin `role` anahtarı aracılığıyla mevcut kullanıcının ham rolüne erişilebilir, ayrıca içerdiği yardımcı fonksiyonlar ile izin kontrolleri doğrudan gerçekleştirilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useRole.ts::useRole
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `role` — useAuth hook'undan alınan kullanıcının yetki rolü, tüm RBAC kontrol fonksiyonlarında ve dönüş objesinde kullanılır
  - `authLoading` — useAuth hook'undan alınan kimlik doğrulama yükleme durumu, genel `loading` değişkeninin hesaplanmasında kullanılır
  - `roleLoading` — useAuth hook'undan alınan rol yükleme durumu, genel `loading` değişkeninin hesaplanmasında ve dönüş objesinde kullanılır
  - `loading` — `authLoading` ve `roleLoading` değerlerinin OR'lanmasıyla hesaplanan genel yükleme durumu, dönüş objesine eklenir
  - `useAuth` — Kimlik ve rol verilerini sağlayan harici hook, fonksiyon içinde çağrılarak gerekli durumlar alınır
  - `canAccessPage` — RBAC kütüphanesinden import edilen sayfa erişim kontrol fonksiyonu, `canAccess` yardımcı fonksiyonu içinde çağrılır
  - `canWrite` (RBAC fonksiyonu) — RBAC kütüphanesinden import edilen yazma yetkisi kontrol fonksiyonu, dönüş objesindeki `canWrite` yardımcı fonksiyonu içinde çağrılır
  - `isReadOnly` (RBAC fonksiyonu) — RBAC kütüphanesinden import edilen salt okunur durumu kontrol fonksiyonu, `role` parametresiyle çağrılarak dönüş objesine eklenir
  - `path` (canAccess içi parametre) — canAccess fonksiyonuna alınan hedef sayfa yolu, `canAccessPage` RBAC fonksiyonuna iletilir
  - `entity` (canWrite içi parametre) — canWrite yardımcı fonksiyonuna alınan hedef varlık adı, `canWrite` RBAC fonksiyonuna iletilir
- **Dönüş**: İçinde `role`, `loading`, `roleLoading` durumları, yetki kontrolü için `canAccess`, `canWrite` yardımcı fonksiyonları ve `isReadOnly` bayrağını barındıran nesne

---

## NODE ID STANDARD

  file: src\hooks\useRole.ts
  function: src\hooks\useRole.ts::useRole

---

## DISA AKTARILANLAR (EXPORTS)
  export: useRole