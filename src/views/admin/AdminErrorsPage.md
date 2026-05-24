---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx
skeleton_hash: 2f5b4133310167a3
generated_at: 2026-05-23T22:37:25Z
---

## Genel Bakış
Bu modül, VentHub HVAC sisteminin yönetici paneli için geliştirilmiş sistem hatalarını görüntüleyen React tabanlı bir sayfa bileşenidir. Yöneticilerin platformda oluşan tüm hataları tek bir arayüzde incelemesini sağlarken, hata kayıtlarındaki tarih bilgilerini okunabilir formata dönüştürmek için yerleşik bir yardımcı fonksiyon barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici arayüzünün hata listeleme sayfasını oluşturan ana React bileşenidir, tüm sayfa mantığını ve arayüz yapısını yöneterek adminlerin hata kayıtlarına erişimini sağlar.
- AdminErrorsPage

### Tarih Formatlama Yardımcıları
Hata kayıtlarındaki ham tarih nesnelerini kullanıcı dostu, okunabilir string formatına dönüştürmekten sorumludur, zaman damgalarının kullanıcı arayüzünde düzgün gösterilmesini sağlar.
- fmt

---

## AXIOMS – Mimari Varsayımlar
Bu React TypeScript tabanlı admin paneli hata görüntüleme sayfası modülünün sağlıklı çalışması için yerine getirilmesi gereken zorunlu mimari koşullar aşağıda listelenmiştir.

[Aksiyom 1]: Eğer bu sayfaya erişen kullanıcının admin yetkisine sahip olup olmadığını doğrulayan entegre yetkilendirme mekanizması yoksa, yetkisiz kullanıcılar sistemin hassas hata verilerine erişebilir, veri güvenliği ve gizliliği ihlali yaşanır.
[Aksiyom 2]: Eğer AdminErrorsPage componenti, sistemdeki tüm hata kayıtlarını çekeceği bir backend API'sine ya da component içine hata verisini iletecek bir state/prop aktarım altyapısına sahip değilse, sayfada hiçbir hata kaydı görüntülenemez, admin kullanıcıları hataları teşhis edemez.
[Aksiyom 3]: Eğer dahili tarih formatlama fonksiyonu fmt(), aldığı geçerli Date nesnesini okunabilir bir metne dönüştüremiyorsa, hata kayıtlarının zaman damgaları hatalı/okunamaz görünür, kronolojik hata takibi imkansız hale gelir.
[Aksiyom 4]: Eğer uygulamanın çalıştığı ortam, React fonksiyonel componentlerin ve TypeScript sözdiziminin çalışmasını desteklemiyorsa, AdminErrorsPage hiçbir şekilde render edilemez, admin paneli hata görüntüleme özelliği tamamen devre dışı kalır.

---

## FONKSIYON DETAYLARI

### AdminErrorsPage
**Ne yapar**: VentHub HVAC sisteminin yönetici paneli için geliştirilmiş hata kayıtları sayfası React bileşenidir. Yöneticilerin sistemde oluşan tüm hataları tek bir merkezden görüntülemesine ve incelemesine olanak tanır.
**Nasıl yapar**: Proje dizinindeki `src/views/admin/AdminErrorsPage.tsx` dosyası içinde tanımlanan React fonksiyonel bileşeni olarak çalışır. Yönetici arayüzünün hata yönetimi bölümünün tüm görsel ve işlevsel yapısını oluşturur, sayfa içindeki alt bileşenleri, hata listeleme mantığını ve kullanıcı etkileşimlerini bu ana bileşen üzerinden yönetir.
**Parametreler**: Herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür, bu bileşen yönetici panelinin rota yapısı içinde çağrılarak DOM'a eklenir ve hata sayfasını kullanıcıya sunar.

### fmt
**Ne yapar**: AdminErrorsPage bileşeni içinde kullanılmak üzere tasarlanmış tarih biçimlendirme yardımcı fonksiyonudur. Hata kayıtlarında yer alan tarihlerin kullanıcı tarafından okunabilir, anlaşılır bir formatta gösterilmesini sağlar.
**Nasıl yapar**: Girdi olarak aldığı JavaScript Date nesnesini alır, sistemde tanımlı standart bir tarih formatına dönüştürerek ekranda gösterilmek üzere hazırlar. Sadece AdminErrorsPage içindeki tarih formatlama ihtiyacını karşılamak için özel olarak geliştirilmiştir.
**Parametreler**:
- d: Date — Biçimlendirilecek geçerli bir JavaScript Date nesnesi, ilgili hata kaydının oluştuğu zaman bilgisini içerir.
**Dönüş**: Dönüş tipi resmi olarak tanımlanmamıştır, herhangi bir değer döndürmediği veya dönüş türünün belirlenmediği bilgisi mevcuttur.

---

## INTERFACES

### ErrorRow
- `id: string`
- `at: string`
- `url?: string | null`
- `message: string`
- `stack?: string | null`
- `user_agent?: string | null`
- `release?: string | null`
- `env?: string | null`
- `level?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, UI metinlerini çevirmek için kullanılır
  - `lang` — useI18n hook'undan alınan mevcut dil kodu, tarih formatlamasında kullanılır
  - `dragScrollRef` — useDragScroll hook'undan dönen referans, sürükleyerek kaydırma işlevi için tablo kapsayıcısına atanır
  - `fmt` — Date nesnelerini YYYY-MM-DD formatına çeviren iç yardımcı fonksiyon
  - `now` — Mevcut tarihi tutan Date nesnesi, varsayılan tarih aralığını hesaplamak için kullanılır
  - `defaultToDate` - fmt ile formatlanmış bugünün tarihi, bitiş tarihi varsayılan değeri
  - `defaultFromDate` - fmt ile formatlanmış 7 gün önceki tarih, başlangıç tarihi varsayılan değeri
  - `rows` - Hata kayıtlarını tutan state dizisi, ErrorRow tipinde
  - `setRows` - rows state'ini güncelleyen setter fonksiyonu
  - `loading` - Veri çekme işleminin durumunu tutan state, boolean
  - `setLoading` - loading state'ini güncelleyen setter fonksiyonu
  - `error` - Oluşan hataları tutan state, string veya null
  - `setError` - error state'ini güncelleyen setter fonksiyonu
  - `total` - Toplam hata kayıt sayısını tutan state, number
  - `setTotal` - total state'ini güncelleyen setter fonksiyonu
  - `page` - Mevcut sayfa numarasını tutan state, number
  - `setPage` - page state'ini güncelleyen setter fonksiyonu
  - `q` - Arama sorgusunu tutan state, string
  - `setQ` - q state'ini güncelleyen setter fonksiyonu
  - `debouncedQ` - Gecikmeli arama sorgusunu tutan state, string
  - `setDebouncedQ` - debouncedQ state'ini güncelleyen setter fonksiyonu
  - `fromDate` - Filtre için başlangıç tarihini tutan state, string
  - `setFromDate` - fromDate state'ini güncelleyen setter fonksiyonu
  - `toDate` - Filtre için bitiş tarihini tutan state, string
  - `setToDate` - toDate state'ini güncelleyen setter fonksiyonu
  - `level` - Hata seviyesi filtresini tutan state, string
  - `setLevel` - level state'ini güncelleyen setter fonksiyonu
  - `env` - Ortam filtresini tutan state, string, varsayılan 'production'
  - `setEnv` - env state'ini güncelleyen setter fonksiyonu
  - `fetchErrors` - Hata kayıtlarını Supabase'den çeken async callback fonksiyonu
  - `pathname` - usePathname hook'undan alınan mevcut rota, sayfa değişimlerinde veriyi yeniden çekmek için kullanılır
  - `fetchRef` - fetchErrors fonksiyonunu tutan ref, gerçek zamanlı güncellemelerde en güncel fonksiyonu erişmek için kullanılır
  - `refetchTimer` - Yeniden çekme işlemini geciktirmek için setTimeout ID'sini tutan ref
  - `scheduleRefetch` - Veriyi 400ms gecikmeyle yeniden çekmeyi planlayan callback fonksiyonu
  - `expandedId` - Açık olan hata kaydının ID'sini tutan state, string veya null
  - `setExpandedId` - expandedId state'ini güncelleyen setter fonksiyonu
- **Dönüş**: React.FC, admin hata yönetimi sayfası JSX elementi döndürür

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::fmt
- **params**: (d: Date)
- **ic_degiskenler**:
  - `y` - Gelen tarih nesnesinin yıl değerini tutan değişken
  - `m` - Gelen tarih nesnesinin ay değerini 2 haneli string olarak formatlayan değişken
  - `day` - Gelen tarih nesnesinin gün değerini 2 haneli string olarak formatlayan değişken
- **Dönüş**: string, YYYY-MM-DD formatında tarih stringi döndürür

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::debounceQEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` - 300ms gecikme için oluşturulan setTimeout ID'si
  - `setDebouncedQ` - Arama sorgusunun boşluklarını kırparak debounced state'e atayan setter fonksiyonu
  - `q` - Trimlenen orijinal arama sorgusu
- **Dönüş**: cleanup fonksiyonu, bileşen unmount olduğunda zamanlayıcıyı temizler

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::fetchErrors
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` - Veri çekme başladığında loading state'ini true yapan setter
  - `setError` - Hata durumunu sıfırlayan setter
  - `supabase` - Supabase istemcisi, veritabanı sorguları için kullanılır
  - `query` - Supabase sorgu nesnesi, filtreler ve sıralama eklenerek geliştirilir
  - `fromDate` - Sorguda kullanılan başlangıç tarihi filtresi
  - `toDate` - Sorguda kullanılan bitiş tarihi filtresi
  - `level` - Sorguda kullanılan hata seviyesi filtresi
  - `env` - Sorguda kullanılan ortam filtresi
  - `debouncedQ` - Sorguda kullanılan arama terimi
  - `like` - SQL ILIKE operatörü için formatlanmış jokerli arama stringi
  - `page` - Mevcut sayfa numarası, sayfalama hesaplamasında kullanılır
  - `from` - Sayfalama için sorgunun başlangıç indeksi
  - `to` - Sayfalama için sorgunun bitiş indeksi
  - `PAGE_SIZE` - Sayfa başına kayıt sayısı, sabit
  - `data` - Supabase'den dönen hata kayıtları dizisi
  - `error` - Sorgu sırasında oluşan hata nesnesi
  - `count` - Toplam eşleşen kayıt sayısı
  - `setRows` - Çekilen verileri rows state'ine atayan setter
  - `setTotal` - Toplam kayıt sayısını total state'ine atayan setter
  - `setError` - Hata durumunda hata mesajını ayarlayan setter
  - `t` - Çeviri fonksiyonu, genel hata mesajı için kullanılır
- **Dönüş**: Promise<void>, async işlem sonrası değer döndürmez

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::scheduleRefetch
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `refetchTimer.current` - Önceki zamanlayıcının ID'si, varsa temizlenir
  - `fetchRef.current` - En güncel fetchErrors fonksiyonu, 400ms sonra çalıştırılır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::realtimeChannelEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `supabase` - Supabase istemcisi, gerçek zamanlı kanal oluşturmak için kullanılır
  - `ch` - Oluşturulan gerçek zamanlı kanal nesnesi
  - `scheduleRefetch` - Veritabanı değişikliği tetiklendiğinde veriyi yeniden çekmeyi planlayan fonksiyon
- **Dönüş**: cleanup fonksiyonu, kanal aboneliğini ve zamanlayıcıyı temizler

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::postgresChangeHandler
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `scheduleRefetch` - Veritabanı değişikliği sonrası veriyi yeniden çekmeyi tetikleyen fonksiyon
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::realtimeCleanupCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `supabase` - Supabase istemcisi, kanalı kaldırmak için kullanılır
  - `ch` - Kapatılacak gerçek zamanlı kanal nesnesi
  - `refetchTimer.current` - Devam eden varsa zamanlayıcı, temizlenir
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx::rowsMapCallback
- **params**: (r: ErrorRow)
- **ic_degiskenler**:
  - `r.id` - Hata kaydının benzersiz ID'si, React anahtarı ve genişletme kontrolü için kullanılır
  - `r.at` - Hata oluşum tarihi, formatlanarak tabloda gösterilir
  - `formatDateTime` - Tarih formatlama fonksiyonu, r.at değerini kullanıcıya uygun formatta gösterir
  - `lang` - Mevcut dil kodu, tarih formatlamasında kullanılır
  - `r.level` - Hata seviyesi, renklendirme ve gösterim için kullanılır
  - `r.message` - Hata mesajı, tabloda gösterilir
  - `r.url` - Hatanın oluştuğu URL, tabloda gösterilir
  - `setExpandedId` - Tıklama sonrası hata detayını açmak/kapatmak için ID'yi ayarlayan setter
  - `expandedId` - Mevcut açık olan hata ID'si, detayın gösterilip gösterilmeyeceğini kontrol eder
  - `t` - Çeviri fonksiyonu, "Detayları Göster/Gizle" metinleri için kullanılır
  - `r.stack` - Hata yığını, detay açıldığında gösterilir
  - `r.user_agent` - Kullanıcının tarayıcı bilgisi, detaylarda gösterilir
  - `r.release` - Uygulama sürümü, detaylarda gösterilir
  - `r.env` - Hatanın oluştuğu ortam, detaylarda gösterilir
- **Dönüş**: React.ReactFragment, her hata kaydı için tablo satırı ve opsiyonel detay satırı içeren fragment döndürür

---

## ÇAĞRI HARİTASI

### Disariya Cagrilar (Outgoing)
AdminErrorsPage() fonksiyonu, metin formatlama ve çıktı alma işlemleri için standart fmt modülünü çağırmaktadır.

### Disaridan Cagrilanlar (Incoming)
Sağlanan çağrı verisinde bu modülü kullanan herhangi bir dış dosya veya fonksiyon belirtilmemiştir.

### Ic Ice Fonksiyonlar (Nested)
Yok

---

## DOSYA-İÇİ ÇAĞRI GRAFİĞİ
  AdminErrorsPage() → fmt()

```mermaid
graph LR
    AdminErrorsPage["AdminErrorsPage()"] --> fmt["fmt()"]
```

---

## NODE ID STANDARD

  file: src\views\admin\AdminErrorsPage.tsx
  function: src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage
  function: src\views\admin\AdminErrorsPage.tsx::fmt

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorsPage