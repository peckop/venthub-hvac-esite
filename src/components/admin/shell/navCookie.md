---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\admin\shell\navCookie.ts
skeleton_hash: b94a2f7431e005bc
entity_hashes:
  func:navCookieName: 8a86dcbe310f0bfe
  overview: 0ea1a0c140fc2427
generated_at: 2026-08-25T07:25:02Z
---

## Genel Bakış

Bu modül, navigasyon ile ilişkili çerez (cookie) adının oluşturulmasıyla ilgilenen küçük bir yardımcı modüldür. Tenant bazlı cookie adı üretme sorumluluğunu üstlenir.

## Fonksiyon Grupları

### Cookie Adı Üretimi
Tenant kimliğine dayalı olarak navigasyon çerezinin adını dize (string) olarak döndürür. Modülün tek fonksiyonu olan `navCookieName`, bu işlevi yerine getirir.

- navCookieName

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `tenantId` parametresi yoksa, fonksiyon çağrılamaz; imzası zorunlu bir parametre olarak tanımlanmıştır.

[Aksiyom 2]: Fonksiyon gövdesi verilmediğinden, döndürülen cookie adının nasıl oluşturulduğu, hangi formata sahip olduğu ve hangi kurallara tabi olduğu bilinmiyor.

---

## FONKSİYON DETAYLARI

### navCookieName
**Ne yapar**: Sol navigasyon durumunun (sidebar açık/kapalı) saklandığı çerezin adını oluşturur. Bu çerez adı hem istemci tarafında hem de sunucu tarafında aynı fonksiyon aracılığıyla üretildiğinden, taraflar arasında tutarlılık sağlanır. Çerez kullanılma sebebi, localStorage'un sunucu tarafında okunamamasıdır; aksi halde RSC (React Server Component) layout bileşeni başlangıç değerini bilemeyeceği için SSR (Server-Side Rendering) her zaman yanlış varsayılanla render eder ve ilk boyama anında menü zıplaması yaşanır. shadcn/ui Sidebar kütüphanesi de aynı gerekçeyle çerez tercih etmektedir.

**Nasıl yapar**: Fonksiyon, aldığı `tenantId` parametresini string'e dönüştürür ve ardından RFC 6265 standardına uygun olmayan karakterleri (harf, rakam, alt çizgi ve tire dışındaki her şeyi) regex ile boş string ile değiştirerek temizler. Elde edilen güvenli string'in önüne `vh_admin_nav_` sabit öneki eklenerek tam çerez adı oluşturulur. Bu sayede her tenant için benzersiz ve geçerli bir çerez adı üretilmiş olur.

**Parametreler**:
- `tenantId`: `string` — Çerez adının tenant'a özgü olması için kullanılan kiracı tanımlayıcısı. Fonksiyon içinde `String()` ile zorla string'e dönüştürüldüğünden, sayı gibi farklı tipte değerler de kabul edilir ancak tip imzası string olarak belirtilmiştir.

**Dönüş**: `string` — RFC 6265'e uygun, `vh_admin_nav_` önekiyle başlayan ve ardından temizlenmiş `tenantId` değerinin geldiği tam çerez adı. Örneğin `tenantId` değeri `"abc-123"` ise dönüş `"vh_admin_nav_abc-123"` olacaktır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/shell/navCookie.ts::navCookieName
- **params**: `tenantId` — tenant (kiracı) kimlik bilgisi, string olarak alınır
- **ic_degiskenler**:
  - `safe` — `tenantId` değerinin `String()` ile metne dönüştürülüp, regex `/[^A-Za-z0-9_-]/g` ile RFC 6265 cookie-name standardına uygun olmayan tüm karakterlerin boş dizeyle değiştirilmesi sonucu elde edilen güvenli çerez adı parçası
- **Dönüş**: `string` — `vh_admin_nav_` sabit ön eki ile `safe` değişkeninin template literal ile birleştirilmesinden oluşan çerez adı

---

## NODE ID STANDARD

  file: navCookie.ts
  function: navCookie.ts::navCookieName

---

## DISA AKTARILANLAR (EXPORTS)
  export: navCookieName