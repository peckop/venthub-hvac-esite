---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminAuditLogPage.tsx
skeleton_hash: faa129e425bec71a
generated_at: 2026-05-23T22:36:55Z
---

## Genel Bakış
Bu modül, VentHub HVAC sisteminin yönetici paneline ait denetim kayıtları (audit log) sayfasını oluşturan React bileşenini barındırır. Yalnızca yetkili yöneticilerin erişebildiği bu sayfa, sistemdeki tüm işlem kayıtlarını görüntülemek amacıyla tasarlanmıştır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Denetim kayıtları sayfasının tüm temel React yapısını ve kullanıcı arayüzü işleyişini üstlenir, yöneticiye sistem kayıtlarını listeleyen arayüzü sunar.
- AdminAuditLogPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı admin denetim kaydı görüntüleme sayfa modülünün doğru çalışması için kimlik yetkilendirme servisleri, denetim kayıtlarını servis eden backend API'si, proje içi ortak UI bağımlılıkları ve yönlendirme mekanizmasının sorunsuz çalışması zorunludur.

[Aksiyom 1]: Eğer kullanıcının admin yetkisine sahip olduğunu doğrulayan kimlik yetkilendirme servisi yoksa/calışmıyorsa, ya yetkisiz kullanıcılar hassas denetim kayıtlarına erişebilir ya da yetkili admin kullanıcıları bile bu sayfaya hiç giremez.
[Aksiyom 2]: Eğer geçmiş denetim kayıtlarını çeken backend API servisi erişilemez durumdaysa, sayfa hiçbir kaydı görüntüleyemez, tamamen boş kalır.
[Aksiyom 3]: Eğer proje içerisinde kullanılan ortak React tabanlı UI componentleri (tablo, filtreleme, sayfalama vb.) bu modül tarafından import edilemiyorsa, sayfa hiç render edilemez, uygulama çalışma zamanında hata verir.
[Aksiyom 4]: Eğer admin paneli içindeki yönlendirme (routing) mekanizması bu sayfayı doğru şekilde yetkilendirilmiş kullanıcılara sunmuyorsa, hiçbir yetkili kullanıcı bu denetim kaydı sayfasına erişemez.

---

## FONKSIYON DETAYLARI

### AdminAuditLogPage
**Ne yapar**: VentHub HVAC platformunun yönetici paneli kapsamında erişime sunulan denetim kayıtları (audit log) sayfasını oluşturan React fonksiyonel bileşenidir. Sadece yetkili yönetici kullanıcıların sistemde gerçekleşen tüm işlemlerin kayıtlarını merkezi bir arayüz üzerinden görüntülemesini sağlayan özel bir sayfa arayüzünü yükler.
**Nasıl yapar**: Projenin kaynak kodunda src/views/admin dizininde konumlanan bu bileşen, TypeScript kullanılarak tip güvenliği sağlanacak şekilde tanımlanmıştır. Yönetici paneli sayfalarının genel mimarisiyle uyumlu çalışacak şekilde yapılandırılmış, yalnızca denetim kayıtları sayfasının tüm görsel ve işlevsel süreçlerini yönetmek üzere oluşturulmuştur.
**Parametreler**: Bu fonksiyonel bileşen herhangi bir giriş parametresi kabul etmez, tanımında herhangi bir bağımsız değişken tanımlanmamıştır.
**Dönüş**: React.FC türünde geçerli bir React fonksiyonel bileşeni döndürür. Bu dönüş değeri, React tarafından işlenerek tarayıcıda yönetici denetim kayıtları sayfasının tüm kullanıcı arayüzü öğelerinin render edilmesini sağlar.

---

## INTERFACES

### AuditRow
- `id: string`
- `at: string`
- `actor: string | null`
- `table_name: string`
- `row_pk: string | null`
- `action: string`
- `comment: string | null`
- `before: unknown`
- `after: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::AdminAuditLogPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t, lang` — useI18n hook'undan dönen çeviri fonksiyonu ve aktif dil kodu
  - `dragScrollRef` — Sürükleyerek yatay kaydırma işlemi için tablo kapsayıcısına atanan ref nesnesi
  - `router` — Next.js yönlendirme işlemleri için kullanılan useRouter hook nesnesi
  - `rows` — Denetim logu kayıtlarını tutan AuditRow tipinde state dizisi
  - `setRows` — rows state'ini güncelleyen setter fonksiyonu
  - `loading` — Log yükleme işleminin aktifliğini tutan state
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `error` — Yükleme sırasında oluşan hata mesajını tutan string|null tipinde state
  - `setError` — error state'ini güncelleyen setter fonksiyonu
  - `total` - Sorguya uyan toplam log sayısını tutan state
  - `setTotal` — total state'ini güncelleyen setter fonksiyonu
  - `page` - Sayfalama için mevcut sayfa numarasını tutan state
  - `setPage` — page state'ini güncelleyen setter fonksiyonu
  - `q` - Arama input değerini tutan state
  - `setQ` — q state'ini güncelleyen setter fonksiyonu
  - `debouncedQ` - Geciktirilmiş arama değeri, sık state değişimini önlemek için kullanılır
  - `setDebouncedQ` — debouncedQ state'ini güncelleyen setter fonksiyonu
  - `fromDate` - Filtreleme için başlangıç tarihini tutan state
  - `setFromDate` — fromDate state'ini güncelleyen setter fonksiyonu
  - `toDate` - Filtreleme için bitiş tarihini tutan state
  - `setToDate` — toDate state'ini güncelleyen setter fonksiyonu
  - `action` - İşlem türü filtresini tutan state
  - `setAction` — action state'ini güncelleyen setter fonksiyonu
  - `batch` - Batch ID filtresini tutan state
  - `setBatch` — batch state'ini güncelleyen setter fonksiyonu
  - `pathname` - usePathname hook'undan dönen mevcut sayfa yolu
  - `searchParams` - useSearchParams hook'undan dönen URL sorgu parametreleri nesnesi
  - `expandedId` - Detayları açılmış log kaydının ID'sini tutan string|null tipinde state
  - `setExpandedId` — expandedId state'ini güncelleyen setter fonksiyonu
  - `fetchLogs` - Logları veritabanından çeken memoize edilmiş callback fonksiyonu
- **Dönüş**: React.FC JSX elementi, admin denetim logu sayfası arayüzü

### [N2_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::debounceEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — setTimeout tarafından döndürülen zaman aşımı kimliği, temizleme işlemi için kullanılır
  - `setDebouncedQ` — Geciktirilmiş arama değerini güncelleyen setter fonksiyonu
  - `q` — Orijinal arama input değeri, trimlenerek geciktirilmiş state'e aktarılır
- **Dönüş**: Zaman aşımını temizleyen React efekt cleanup fonksiyonu

### [N3_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::fetchLogs
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — Yükleme state'ini açıp kapatan setter fonksiyonu
  - `setError` — Hata mesajı state'ini güncelleyen setter fonksiyonu
  - `ensureSessionFresh` — Kullanıcı oturumunun geçerliliğini kontrol eden yardımcı fonksiyon
  - `supabase` — Supabase veritabanı istemcisi, sorgular için kullanılır
  - `query` — Aşamalı olarak filtreler eklenen Supabase sorgu nesnesi
  - `fromDate` — Sorguda kullanılan başlangıç tarihi filtresi
  - `toDate` — Sorguda kullanılan bitiş tarihi filtresi
  - `action` — Sorguda kullanılan işlem türü filtresi
  - `debouncedQ` — Sorguda tam metin araması için kullanılan geciktirilmiş arama değeri
  - `like` — Supabase ILIKE operatörü için hazırlanmış % ile sarmalanmış arama deseni
  - `batch` — Sorguda batch ID'si ile filtreleme için kullanılan değer
  - `from` — Sayfalama için sorgunun başlayacağı satır indeksi
  - `to` — Sayfalama için sorgunun biteceği satır indeksi
  - `PAGE_SIZE` — Sayfa başına kayıt sayısı sabiti, sayfalama hesaplamaları için kullanılır
  - `data` — Sorgudan dönen log kayıtları dizisi
  - `error` — Sorgu sırasında oluşan Supabase hata nesnesi
  - `count` — Sorguya uyan toplam kayıt sayısı
  - `setRows` — Log kayıtları state'ini güncelleyen setter
  - `setTotal` — Toplam kayıt sayısı state'ini güncelleyen setter
- **Dönüş**: Promise<void>, async yükleme işlemi tamamlandığında çözülen boş söz

### [N4_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::searchParamsEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `searchParams` — URL sorgu parametreleri nesnesi, içinden batch parametresi okunur
  - `b` — URL'den okunup temizlenmiş (trimlenmiş) batch ID değeri
  - `setBatch` — Batch filtresi state'ini güncelleyen setter fonksiyonu
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::clearBatchOnClick
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setBatch` — Batch filtresi state'ini sıfırlayan setter fonksiyonu
  - `window.location.href` — Mevcut sayfanın tam URL'si, yeni URL oluşturmak için kullanılır
  - `url` — Oluşturulan yeni URL nesnesi, üzerinden batch sorgu parametresi silinir
  - `router.push` — Next.js yönlendirme fonksiyonu, güncellenmiş URL'ye yönlendirir
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::rowsMapCallback
- **params**: r (işlenecek tek denetim logu satırı, AuditRow tipinde)
- **ic_degiskenler**:
  - `r.id` — Mevcut log kaydının benzersiz kimliği, React anahtarı ve genişletme kontrolü için kullanılır
  - `expandedId` — Şu anda detayları açık olan log kaydının ID'si
  - `formatDateTime` — Tarih biçimlendirme fonksiyonu, log zamanını kullanıcı dilinde gösterir
  - `r.at` — Log kaydının oluşturulma zamanı
  - `lang` — Aktif kullanıcı dili, tarih biçimlendirme için kullanılır
  - `r.action` — Logdaki işlem türü (INSERT/UPDATE/DELETE/CUSTOM)
  - `r.table_name` — İşlem yapılan veritabanı tablosunun adı
  - `r.row_pk` — İşlem yapılan satırın birincil anahtarı
  - `r.comment` — Log kaydına eklenmiş yorum metni
  - `setExpandedId` — Genişletilmiş kayıt ID'sini güncelleyen setter, detayları açıp kapatmak için kullanılır
  - `t` — Çeviri fonksiyonu, "Gizle" / "Detaylar" metinleri için kullanılır
  - `r.before` — İşlem öncesi JSON verisi, değişiklik karşılaştırması için kullanılır
  - `r.after` — İşlem sonrası JSON verisi, değişiklik karşılaştırması için kullanılır
  - `JsonDiffViewer` — JSON değişikliklerini görselleştiren bileşen, detaylar açıkken render edilir
- **Dönüş**: React.Fragment, mevcut log satırı için tablo satırları ve isteğe bağlı detay satırı içeren fragment

---

## NODE ID STANDARD

  file: src\views\admin\AdminAuditLogPage.tsx
  function: src\views\admin\AdminAuditLogPage.tsx::AdminAuditLogPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAuditLogPage