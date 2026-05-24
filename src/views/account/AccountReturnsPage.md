---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 495418f85c94e7a0
generated_at: 2026-05-23T22:36:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kullanıcı hesapları bölümünde yer alan iade işlemleri sayfasını oluşturan ana React bileşenidir. Kullanıcıların hesapları üzerinden açtıkları tüm iade taleplerini ve geçmiş iade kayıtlarını tek bir arayüzde görüntülemesini ve yönetmesini sağlayan, hesap bölümünün iadeler alt sayfasının ana giriş noktasıdır.

## Fonksiyon Grupları
### Ana Sayfa Yönetim Bileşeni
Hesap iadeleri sayfasının tüm arayüz düzenini ve temel işleyişini yöneten tek ana bileşendir. Sayfada görüntülenecek içerikleri düzenler, ihtiyaç duyulan alt bileşenleri entegre ederek kullanıcının iade işlemlerine sorunsuz erişmesini sağlar.
- AccountReturnsPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı hesap iade kayıtları sayfa bileşeninin doğru şekilde çalışması, projedeki genel frontend altyapısı, kimlik doğrulama ve servis entegrasyonlarının eksiksiz olmasına bağlıdır.

[Aksiyom 1]: Eğer projeye ait React çalışma zamanı (runtime) ortamı yoksa, bu sayfa bileşeni hiçbir şekilde render edilemez.
[Aksiyom 2]: Eğer projenin frontend yönlendirme (routing) mekanizması bu sayfa için tanımlanmamışsa, kullanıcılar AccountReturnsPage sayfasına hiçbir şekilde erişemez.
[Aksiyom 3]: Eğer projenin global kimlik doğrulama (auth) altyapısı, kullanıcının oturumunu ve bu sayfaya erişim yetkisini doğrulayacak şekilde entegre edilmemişse, bu sayfa yetkisiz erişime açık kalır veya erişim hatası fırlatır.
[Aksiyom 4]: Eğer bu modülün import etmesi gereken ortak proje UI bileşenleri veya bağımlılıkları bulundukları konumlarda mevcut değilse, sayfa tam olarak yüklenemez ve görüntülenemez.
[Aksiyom 5]: Eğer kullanıcıya ait hesap iade kayıtlarını çekecek backend API uç noktaları erişilebilir durumda değilse, sayfada hiçbir iade verisi gösterilemez.
[Aksiyom 6]: Eğer projenin global durum yönetimi (state management) altyapısı mevcut kullanıcının kimlik bilgilerini bu sayfa ile paylaşamıyorsa, iade kayıtları doğru kullanıcıya ait olacak şekilde filtrelenemez.

---

## FONKSIYON DETAYLARI

### AccountReturnsPage
**Ne yapar**: VentHub HVAC projesinin hesap yönetimi modülünde yer alan, kullanıcıların kendi hesapları üzerinden gerçekleştirdikleri tüm iade işlemlerini görüntülemek ve yönetmek için tasarlanmış ana sayfa bileşenidir. Genel amaçlı dokümantasyon tipiyle işaretlenmiş, hesap işlevleri kapsamında kullanıcının iade geçmişine erişmesini sağlayan temel sayfadır.
**Nasıl yapar**: React tabanlı proje yapısında sayfa düzeyinde bir bileşen olarak çalışır, projenin `src/views/account` dizininde konumlanarak hesap rotaları kapsamında çağrılır. İlgili hesap iadeleri sayfasının kullanıcı arayüzünü ekrana render etmek üzere tasarlanmıştır, kamuoyuyla paylaşılan fonksiyon imzasında ek işlem mantığına ait herhangi bir detay belirtilmemiştir.
**Parametreler**: Tanımlı herhangi bir giriş parametresi almaz, fonksiyon imzasında parametre listesi tamamen boştur.
**Dönüş**: Resmi olarak dönüş tipi tanımlanmamış, void veya bilinmiyor olarak işaretlenmiştir. .tsx uzantılı React sayfa bileşeni olmasının gerekliliği olarak, ekrana basılacak sayfa içeriğini temsil eden JSX elementleri döndürmesi beklenir.

---

## INTERFACES

### ReturnRow
- `id: string`
- `order_id: string`
- `reason: string`
- `description?: string | null`
- `status: string`
- `created_at: string`

### OrderLite
- `id: string`
- `order_number: string`
- `created_at: string`

### SupabaseError
- `code?: string`
- `status?: number`
- `message?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::useEffectCleanup_load
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — Bileşen mount durumunu takip eden bayrak, asenkron işlemlerde state güncellemesi yapmadan önce mount kontrolü için kullanılır
  - `load` — İade listesini yükleyen asenkron fonksiyon
  - `user` — Oturum açmış kullanıcı nesnesi, kullanıcı mevcutsa yükleme işlemini tetikler
  - `setLoading` — Yükleme state'ini güncelleyen setter fonksiyonu
  - `setRows` — İade listesini state'e kaydeden setter fonksiyonu
- **Dönüş**: () => void (Bileşen unmount olduğunda çalışan temizleme fonksiyonu)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::load
- **params**: ()
- **ic_degiskenler**:
  - `setLoading` — Yükleme durumunu güncelleyen state setter
  - `supabase` — Supabase veritabanı istemcisi, sorgu işlemleri için kullanılır
  - `list` — Supabase'den gelen iade listesi verisi, `data` olarak alınır
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `mounted` — Bileşen mount durumu bayrağı, state güncellemeden önce kontrol edilir
  - `setRows` — İade listesini state'e kaydeden setter
  - `e` — Catch bloğunda yakalanan genel işlem hatası
  - `toast.error` — Kullanıcıya hata bildirimi gösteren toast fonksiyonu
  - `t` — Çeviri fonksiyonu, i18n sistemi için kullanılır
- **Dönüş**: Promise<void>

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::useEffectCleanup_loadOrders
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — Bileşen mount durumunu takip eden bayrak
  - `loadOrders` — Kullanıcı siparişlerini yükleyen asenkron fonksiyon
  - `user` — Oturum açmış kullanıcı nesnesi, kullanıcı mevcutsa yüklemeyi tetikler
  - `setOrders` — Sipariş listesini state'e kaydeden setter fonksiyonu
- **Dönüş**: () => void (Bileşen unmount temizleme fonksiyonu)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::loadOrders
- **params**: ()
- **ic_degiskenler**:
  - `data` — Supabase'den gelen sipariş verisi, ilk veya fallback sorgudan alınır
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `supabase` — Supabase veritabanı istemcisi
  - `user?.id` — Oturum açmış kullanıcının ID'si, siparişleri filtrelemek için kullanılır
  - `fb` — order_number sütunu eksikse çalıştırılan fallback sorgusunun sonucu
  - `mounted` — Bileşen mount durumu bayrağı
  - `setOrders` — Sipariş listesini state'e kaydeden setter
  - `o` — Map fonksiyonunda işlenen her bir sipariş nesnesi
  - `e` — Catch bloğunda yakalanan genel işlem hatası
- **Dönüş**: Promise<void>

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::formatOrderForState
- **params**: (o)
- **ic_degiskenler**:
  - `o.id` — İşlenen siparişin benzersiz kimliği
  - `o.created_at` — Siparişin oluşturulma tarihi
  - `o.order_number` — Siparişin görünür numarası, yoksa ID kullanılır
- **Dönüş**: {id: string, created_at: string, order_number: string} Standartlaştırılmış sipariş nesnesi

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::openModalIfPrefill
- **params**: ()
- **ic_degiskenler**:
  - `prefillOrderId` — URL'den gelen önceden seçili sipariş ID'si
  - `setOpenModal` — İade oluşturma modalının açık durumunu ayarlayan setter
- **Dönüş**: void

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getReturnReasonsList
- **params**: ()
- **ic_degiskenler**: Liste içindeki sabit string değerler: Türkçe iade sebepleri
- **Dönüş**: string[] Kullanıcıya sunulacak iade sebepleri listesi

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::handleCreateReturn
- **params**: ()
- **ic_degiskenler**:
  - `form.order_id` — Formda seçilen sipariş ID'si
  - `form.reason` — Formda seçilen iade sebebi
  - `toast.error` — Hata bildirimi gösteren toast fonksiyonu
  - `t` — Çeviri fonksiyonu
  - `payload` — Supabase'e gönderilecek iade verisi paketi
  - `user?.id` — Oturum açmış kullanıcının ID'si, iade kaydına eklenir
  - `form.description` — Forma yazılan isteğe bağlı iade açıklaması
  - `supabase` — Supabase veritabanı istemcisi
  - `error` — Supabase insert işleminden dönen hata nesnesi
  - `toast.success` — Başarı bildirimi gösteren toast fonksiyonu
  - `setOpenModal` — Modalı kapatan setter
  - `setForm` — Form state'ini sıfırlayan setter
  - `list` — Yeniden yüklenen güncel iade listesi verisi
  - `setRows` — Yeni iade listesini state'e kaydeden setter
  - `router.push` — Next.js router metodu, kullanıcıyı iadeler sayfasına yönlendirir
  - `e` — Catch bloğunda yakalanan genel işlem hatası
- **Dönüş**: Promise<void>

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::statusClass
- **params**: (s: string)
- **ic_degiskenler**:
  - `v` — Gelen durum string'inin küçük harfe çevrilmiş hali, karşılaştırmalarda kullanılır
- **Dönüş**: string Duruma özel Tailwind CSS renk sınıfları

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getStatusIcon
- **params**: (status: string)
- **ic_degiskenler**: Switch case ile tüm durumlar kontrol edilir, ilgili lucide-react ikonları seçilir
- **Dönüş**: JSX.Element Duruma uygun React ikon bileşeni

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getStatusLabel
- **params**: (status: string)
- **ic_degiskenler**:
  - `t` — Çeviri fonksiyonu, durum anahtarına göre çeviriyi çeker
- **Dönüş**: string Çevrilmiş durum etiketi veya ham durum string'i

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getReturnTimeline
- **params**: (currentStatus: string)
- **ic_degiskenler**:
  - `allSteps` — Tüm standart iade süreci adımlarının sabit listesi
  - `currentIndex` — Mevcut durumun allSteps listesindeki indeksi, tamamlanma durumu hesaplamak için kullanılır
  - `step` — Map fonksiyonunda işlenen her bir adım nesnesi
  - `index` — Adımın listedeki sıra numarası
- **Dönüş**: TimelineStep[] Tamamlanma ve aktiflik durumları eklenmiş süreç adımları listesi

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::formatTimelineStep
- **params**: (step, index)
- **ic_degiskenler**:
  - `step` — Orijinal adım nesnesi
  - `index` — Adımın listedeki sıra numarası
  - `currentIndex` — Mevcut aktif durumun listedeki indeksi, tamamlanma/aktiflik durumu hesaplamak için kullanılır
- **Dönüş**: Geliştirilmiş adım nesnesi (completed, isCurrent özellikleri eklenmiş)

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderStatusFilterButton
- **params**: (opt)
- **ic_degiskenler**:
  - `opt.value` — Filtre seçeneğinin kayıtlı değeri
  - `setStatusFilter` — Seçilen filtreyi state'e kaydeden setter
  - `statusFilter` — Mevcut aktif filtre değeri, butonun stilini belirler
  - `opt.label` — Filtre butonunda gösterilecek etiket metni
- **Dönüş**: JSX.Element Durum filtresi butonu bileşeni

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderReturnCard
- **params**: (r)
- **ic_degiskenler**:
  - `r` — İşlenen iade nesnesinin tamamı
  - `orders` — Tüm kullanıcı siparişleri listesi, iadeye ait siparişi bulmak için kullanılır
  - `o` — İadeye ait bulunan sipariş nesnesi
  - `code` — Siparişin görünür kısa kodu
  - `timeline` — İade süreci adımları listesi
  - `router.push` — Kullanıcıyı sipariş detay sayfasına yönlendiren router metodu
  - `formatDate` — Tarih formatlama fonksiyonu
  - `lang` — Mevcut dil ayarı, tarih formatlamak için kullanılır
  - `statusClass` — Duruma göre CSS sınıflarını döndüren fonksiyon
  - `getStatusIcon` — Duruma göre ikon döndüren fonksiyon
  - `getStatusLabel` — Duruma göre etiket döndüren fonksiyon
- **Dönüş**: JSX.Element İade kartı bileşeni

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderTimelineStep
- **params**: (step, index)
- **ic_degiskenler**:
  - `step` — İşlenen süreç adımı nesnesi
  - `index` — Adımın listedeki sıra numarası
  - `timeline.length` — Tüm adımların sayısı, aradaki bağlantı çizgisini çizmek için kullanılır
- **Dönüş**: JSX.Element Süreç adımı bileşeni

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderOrderOption
- **params**: (o)
- **ic_degiskenler**:
  - `o.id` — Siparişin benzersiz ID'si, option değeri olarak kullanılır
  - `o.order_number` — Siparişin görünür numarası
  - `o.created_at` — Siparişin oluşturulma tarihi
  - `formatDate` — Tarih formatlama fonksiyonu
  - `lang` — Mevcut dil ayarı, tarih formatlamak için kullanılır
- **Dönüş**: JSX.Element Select elementi için sipariş option bileşeni

---

## NODE ID STANDARD

  file: src\views\account\AccountReturnsPage.tsx
  function: src\views\account\AccountReturnsPage.tsx::AccountReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountReturnsPage