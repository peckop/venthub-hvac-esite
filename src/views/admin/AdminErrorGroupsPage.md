---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx
skeleton_hash: 9638f08d7e7c62f9
entity_hashes:
  func:AdminErrorGroupsPage: 2df4b29ac83c8598
  func:bulkApplyStatus: 2e737880df202268
  func:loadLatestClientErrors: e416e263b6cc2d92
  func:toggleSelect: b57335e143909cca
  func:toggleSort: 10891db6bc49b5bf
  func:updateAssignedTo: 115d7b001b19d674
  func:updateNotes: 57b7793991d9e6a2
  func:updateStatus: 6c7719de765f38dd
  overview: d1130a512219291d
  style_tokens: 5e40817d604cd18b
generated_at: 2026-05-28T22:39:07Z
---

## Genel Bakış
Bu modül, Venthub HVAC yönetici panelindeki hata grupları yönetim sayfasıdır. Sistemde kaydedilen istemci hatalarının gruplar halinde görüntülenmesini, sıralanmasını, durumlarının değiştirilmesini, sorumlu atanmasını ve toplu işlemler uygulanmasını sağlar.

## Fonksiyon Grupları

### Ana Bileşen ve Görünüm Kontrolleri
Sayfanın temel yapısını oluşturan ana React bileşeni ile yöneticinin hata gruplarını filtreleme ve seçim yapma gibi arayüz etkileşimlerini yöneten fonksiyonları içerir.
- AdminErrorGroupsPage, toggleSort, toggleSelect

### Hata Grubu Detay Yönetimi
Tek bir hata grubu üzerinde gerçekleştirilen durum güncelleme, kullanıcı atama, not ekleme ve gruba ait güncel hataları getirme gibi bireysel yönetim işlemlerini yöneten asenkron fonksiyonlardır.
- updateStatus, updateAssignedTo, updateNotes, loadLatestClientErrors

### Toplu İşlem Fonksiyonları
Birden fazla seçili hata grubuna aynı anda durum değişikliği uygulamak için kullanılan toplu işleme fonksiyonudur.
- bulkApplyStatus

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hata gruplarının yönetimi için bir yönetici arayüzü sunan React bileşenidir ve aşağıdaki mimari varsayımlara dayanır:

**[Aksiyom 1]:** Eğer backend API'si hata grupları için `open`, `resolved` veya `ignored` durum değerlerini desteklemiyorsa, `updateStatus` fonksiyonu geçersiz durum hatası ile karşılaşır.

**[Aksiyom 2]:** Eğer sıralama alanı olarak `last_seen` veya `count` dışında bir değer gönderilirse, `toggleSort` fonksiyonu beklenmeyen davranış gösterir (TypeScript seviyede engellenir).

**[Aksiyom 3]:** Eğer `bulkApplyStatus` çağrıldığında en az bir hata grubu seçilmediyse (`toggleSelect` ile `on=true` olarak işaretlenen grup yoksa), toplu durum güncellemesi uygulanacak hedef bulunamaz.

**[Aksiyom 4]:** Eğer `loadLatestClientErrors` fonksiyonuna geçersiz veya var olmayan bir `groupId` verilirse, sunucu tarafında ilgili hatalar bulunamaz ve boş sonuç döner.

**[Aksiyom 5]:** Eğer `updateAssignedTo` fonksiyonuna geçerli bir `userId` yerine boş string (`''`) verilirse, hata grubunun sorumluluğu kaldırılır (atanmamış duruma geçer).

**[Aksiyom 6]:** Eğer `updateNotes` fonksiyonuna boş string verilirse, hata grubunun not alanı temizlenir.

**[Aksiyom 7]:** Eğer `toggleSelect` fonksiyonu ile bir grup seçildiyse (`on=true`), `bulkApplyStatus` bu grubu hedeflemelidir; grup seçimi kaldırıldıysa (`on=false`) o grup toplu işlem kapsamı dışına çıkar.

---

## FONKSİYON DETAYLARI

### AdminErrorGroupsPage
**Ne yapar**: VentHub HVAC sisteminin admin paneline ait hata gruplarını görüntüleyen ve yöneten ana sayfa React bileşenidir. Tüm hata grubu yönetim işlevlerini barındıran ana arayüzü oluşturur, adminlerin sistemde oluşan tüm hata gruplarını tek bir yerden takip etmesini sağlar.
**Nasıl yapar**: Sayfa içindeki tüm alt işlevleri (sıralama, durum güncelleme, toplu işlemler, hata detayı yükleme vb.) yönetir, React bileşeni olarak sayfa yapısını oluşturur ve tüm kullanıcı etkileşimlerini işleyerek ilgili işlevleri tetikler. Yerel state yönetimi ile sayfa içindeki tüm verilerin güncel kalmasını sağlar.
**Parametreler**: Bu fonksiyona giriş parametresi tanımlanmamıştır.
**Dönüş**: React.FC türünde bir React sayfa bileşeni döndürür.

### toggleSort
**Ne yapar**: Hata grupları listesinin sıralama kriterini değiştiren işlevdir. Kullanıcıların listeyi istenen kritere göre sıralamasını sağlayarak hata gruplarını kolayca filtrelemesine imkan tanır.
**Nasıl yapar**: Gelen sıralama kriterine göre sayfanın sıralama state'ini günceller, mevcut sıralama yönünü tersine çevirir veya yeni kriteri uygulayarak hata grubu listesinin yeniden sıralanmasını tetikler.
**Parametreler**:
- name: by, type: 'last_seen' | 'count' — Sıralama yapılacak ana kriter, sadece son görülme zamanı (last_seen) veya hata oluşum sayısı (count) değerlerini alabilir
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

### updateStatus
**Ne yapar**: Tek bir hata grubunun mevcut durumunu güncelleyen işlevdir. Hata gruplarını açık, çözülmüş veya yok sayılmış olarak işaretlemek için kullanılır, hata yaşam döngüsü takibini mümkün kılar.
**Nasıl yapar**: Gelen hata grubu kimliği ile eşleşen kaydı bulur, hem yerel state'teki hem de arka plan sunucusundaki ilgili kaydın durum alanını yeni gelen değerle güncelleyerek verilerin senkronize kalmasını sağlar.
**Parametreler**:
- name: id, type: string — Durumu güncellenecek hata grubunun benzersiz kimliği
- name: newStatus, type: 'open' | 'resolved' | 'ignored' — Hata grubuna atanacak yeni durum, sadece açık (open), çözülmüş (resolved) veya yok sayılmış (ignored) değerlerini alabilir
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

### updateAssignedTo
**Ne yapar**: Bir hata grubuna sorumlu kullanıcı atayan veya mevcut atamayı kaldıran işlevdir. Hata gruplarının sorumluluk dağılımını yöneterek hangi hatanın kim tarafından inceleneceğini takip etmeyi sağlar.
**Nasıl yapar**: İlgili hata grubu kaydının atanmış kullanıcı kimliği alanını günceller, atama kaldırılmak istendiğinde gelen boş string değeri ile kaydın atama alanını sıfırlar, hem yerel hem sunucu verisini günceller.
**Parametreler**:
- name: id, type: string — Atama işlemi yapılacak hata grubunun benzersiz kimliği
- name: userId, type: string | '' — Hata grubuna atanacak kullanıcının benzersiz kimliği, mevcut atamayı kaldırmak için boş string değeri kullanılır
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

### updateNotes
**Ne yapar**: Bir hata grubuna özel not ekleme veya mevcut notları güncelleme işlevidir. Adminlerin hata grupları hakkında ek bilgi, çözüm adımları veya notlar saklamasını sağlayarak hata inceleme sürecini destekler.
**Nasıl yapar**: Gelen hata grubu kimliği ile eşleşen kaydın notlar alanını yeni girilen metin ile günceller, hem yerel state hem de sunucu üzerindeki veriyi senkronize olarak güncel tutar.
**Parametreler**:
- name: id, type: string — Notları güncellenecek hata grubunun benzersiz kimliği
- name: notes, type: string — Hata grubuna kaydedilecek yeni not metni
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

### loadLatestClientErrors
**Ne yapar**: Belirli bir hata grubu ile ilişkili en son istemci tarafı hatalarını sunucudan yükleyen işlevdir. Hata grubu detaylarını görüntülerken ilgili son hataları listelemek için kullanılır, hata kök nedenini analiz etmeye yardımcı olur.
**Nasıl yapar**: İstenen hata grubunun kimliği ile sunucudan ilgili son istemci hatalarını çeker, sayfa içindeki detay panelinde görüntülenmek üzere yüklenen verileri yerel state'e kaydeder.
**Parametreler**:
- name: groupId, type: string — İstemci hataları yüklenecek hata grubunun benzersiz kimliği
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

### toggleSelect
**Ne yapar**: Tek bir hata grubunun toplu işlemler için seçilme durumunu değiştiren işlevdir. Kullanıcıların birden fazla hata grubu üzerinde toplu işlem yapabilmesi için seçim yapmalarını sağlar, tek tek işlem yapma yükünü ortadan kaldırır.
**Nasıl yapar**: İlgili hata grubunun seçili olup olmadığını belirten bayrağı, girilen on parametresinin değerine göre ayarlar, true değeri ile hata grubunu toplu işlem seçim listesine ekler, false değeri ile listeden çıkarır.
**Parametreler**:
- name: id, type: string — Seçim durumu güncellenecek hata grubunun benzersiz kimliği
- name: on, type: boolean — Hata grubunun seçili olup olmayacağını belirten boolean değer, true ise seçilir, false ise seçim listesinden çıkarılır
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

### bulkApplyStatus
**Ne yapar**: Önceden toggleSelect ile seçilmiş tüm hata gruplarına toplu olarak aynı durum atamasını yapan işlevdir. Birden fazla hatayı tek seferde yönetmek için kullanılır, adminlerin aynı işlemi tekrar tekrar yapma yükünü azaltır.
**Nasıl yapar**: Seçilmiş tüm hata gruplarının kimliklerini toplar, updateStatus işlevini her bir kimlik için çağırarak aynı yeni durumu tüm seçili hata gruplarına uygular, toplu işlem sonrası seçim listesini sıfırlar.
**Parametreler**: Bu fonksiyona giriş parametresi tanımlanmamıştır.
**Dönüş**: Dönüş türü belirtilmemiştir, void türündedir.

---

## INTERFACES

### ErrorGroup
- `id: string`
- `signature: string`
- `level: string | null`
- `last_message: string | null`
- `url_sample: string | null`
- `env: string | null`
- `release: string | null`
- `first_seen: string`
- `last_seen: string`
- `count: number`
- `status: 'open' | 'resolved' | 'ignored'`
- `assigned_to: string | null`
- `notes: string | null`

### AdminUserOpt
- `id: string`
- `email: string`
- `full_name?: string | null`

### ClientErrorRow
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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::mount_init_localstorage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `c` — localStorage'dan okunan görünür sütun ayarlarının JSON string değeri
  - `d` — localStorage'dan okunan tablo yoğunluk ayarının string değeri
  - `setVisibleCols` — görünür sütunları güncelleyen state setter fonksiyonu
  - `setDensity` — tablo yoğunluğunu güncelleyen state setter fonksiyonu
  - `STORAGE_KEY` — localStorage anahtarları için kullanılan sabit önek
- **Dönüş**: void (sunucu tarafında erken dönüş yapar)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::save_visible_cols_to_localstorage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `visibleCols` — güncel görünür sütun state değeri
  - `STORAGE_KEY` — localStorage anahtarları için kullanılan sabit önek
- **Dönüş**: void

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::save_density_to_localstorage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `density` — güncel tablo yoğunluk state değeri
  - `STORAGE_KEY` — localStorage anahtarları için kullanılan sabit önek
- **Dönüş**: void

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::toggleSort
- **params**: by: 'last_seen' | 'count'
- **ic_degiskenler**:
  - `setSortBy` — sıralama sütununu güncelleyen state setter
  - `setSortDir` — sıralama yönünü güncelleyen state setter
  - `prev` — setSortBy callback'inde gelen önceki sortBy değeri
  - `d` — setSortDir callback'inde gelen önceki sortDir değeri
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::setSortBy_internal_callback
- **params**: prev (önceki sortBy değeri)
- **ic_degiskenler**:
  - `by` — üst kapsamdaki toggleSort fonksiyonundan gelen sıralama sütunu
  - `setSortDir` — sıralama yönünü güncelleyen state setter
- **Dönüş**: önceki veya yeni sortBy değeri

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::debounce_search_cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` - kurulan setTimeout ID'si
  - `setDebouncedQ` - arama sorgusunu 300ms gecikmeyle güncelleyen state setter
  - `q` - girilen güncel ham arama sorgusu
- **Dönüş**: clearTimeout'u çağıran temizleme fonksiyonu, void

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::load_admin_users
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `supabase.rpc('admin_list_users')` - admin yetkisiyle kullanıcı listesi çeken secure RPC çağrısı
  - `data` - RPC'den dönen kullanıcı listesi ham verisi
  - `error` - RPC çağrısı sırasında oluşan hata
  - `list` - formatlanmış AdminUserOpt tipinde kullanıcı listesi
  - `u` - map fonksiyonunda işlenen tek kullanıcı nesnesi
  - `setUsers` - kullanıcı listesini state'e kaydeden setter
- **Dönüş**: void

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::map_raw_user_to_adminopt
- **params**: u (ham kullanıcı nesnesi)
- **ic_degiskenler**:
  - `u.id` - kullanının benzersiz ID'si
  - `u.email` - kullanının email adresi
  - `u.full_name` - kullanının tam adı (null olabilir)
- **Dönüş**: formatlanmış AdminUserOpt tipinde kullanıcı nesnesi

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::fetch_error_groups
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` - yükleme durumunu ayarlayan state setter
  - `setError` - hata durumunu ayarlayan state setter
  - `supabase.from('error_groups')` - error_groups tablosundan sorgu oluşturan Supabase client
  - `sortBy` - güncel sıralama sütunu
  - `sortDir` - güncel sıralama yönü
  - `fromDate` - filtre için başlangıç tarihi
  - `toDate` - filtre için bitiş tarihi
  - `level` - filtre için hata seviyesi
  - `status` - filtre için grup durumu
  - `assigned` - filtre için atanan kullanıcı ID'si
  - `debouncedQ` - gecikmeli arama sorgusu
  - `like` - SQL ILIKE operatörü için wildcard'lı arama deseni
  - `from` - sayfalama için başlangıç indeksi
  - `to` - sayfalama için bitiş indeksi
  - `PAGE_SIZE` - tek sayfada gösterilecek kayıt sayısı sabiti
  - `data` - sorgudan dönen error grubu listesi
  - `error` - sorgu hatası
  - `count` - toplam kayıt sayısı
  - `setRows` - error grubu satırlarını state'e kaydeden setter
  - `setTotal` - toplam kayıt sayısını state'e kaydeden setter
  - `e` - yakalanan hata nesnesi
- **Dönüş**: Promise<void>

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::schedule_refetch
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `refetchTimer.current` - mevcut bekleyen zamanlayıcı ID'si
  - `fetchRef.current` - verileri tekrar yükleyen ana fetch fonksiyonu referansı
- **Dönüş**: void

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::setup_realtime_channel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ch` - oluşturulan Supabase realtime kanal nesnesi
  - `supabase.channel` - realtime kanal oluşturan Supabase metodu
  - `scheduleRefetch` - veri yeniden yüklemeyi zamanlayan fonksiyon
  - `supabase.removeChannel` - kanalı temizleyen Supabase metodu
- **Dönüş**: kanalı temizleyen useEffect temizleme fonksiyonu, void

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::updateStatus
- **params**: id: string, newStatus: 'open' | 'resolved' | 'ignored'
- **ic_degiskenler**:
  - `prev` - güncelleme öncesi mevcut satır listesi yedeği
  - `setRows` - satır listesini güncelleyen state setter
  - `r` - map fonksiyonunda işlenen tek error grubu satırı
  - `supabase.from('error_groups').update` - durum güncellemesi yapan Supabase sorgusu
  - `error` - sorgu sırasında oluşan hata
- **Dönüş**: Promise<void>

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::updateAssignedTo
- **params**: id: string, userId: string | ''
- **ic_degiskenler**:
  - `val` - boş string gelmesi halinde null'a çevrilen atanacak kullanıcı ID'si
  - `prev` - güncelleme öncesi satır listesi yedeği
  - `setRows` - satır listesini güncelleyen state setter
  - `r` - map'te işlenen tek satır
  - `supabase.from('error_groups').update` - atanan kullanıcıyı güncelleyen Supabase sorgusu
  - `error` - sorgu hatası
- **Dönüş**: Promise<void>

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::updateNotes
- **params**: id: string, notes: string
- **ic_degiskenler**:
  - `prev` - güncelleme öncesi satır listesi yedeği
  - `setRows` - satır listesini güncelleyen state setter
  - `r` - map'te işlenen tek satır
  - `supabase.from('error_groups').update` - notları güncelleyen Supabase sorgusu
  - `error` - sorgu hatası
- **Dönüş**: Promise<void>

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::loadLatestClientErrors
- **params**: groupId: string
- **ic_degiskenler**:
  - `queryResult` - client_errors tablosundan dönen sorgu sonucu
  - `supabase.from('client_errors').select` - hata kayıtlarını çeken Supabase sorgusu
  - `data` - sorgudan dönen client hatası listesi
  - `error` - sorgu hatası
  - `setLatestClientErrors` - yüklenen son hataları state'e kaydeden setter
- **Dönüş**: Promise<void>

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::export_all_error_groups
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `CHUNK` - toplu veri çekerken kullanılacak parça boyutu sabiti (1000)
  - `offset` - sorgu için mevcut başlangıç ofseti
  - `all` - birleştirilmiş tüm error grubu listesi
  - `makeQuery` - filtreleri ve sıralamayı uygulayan sorgu üretici fonksiyon
  - `data` - parça sorgusundan dönen veri
  - `error` - parça sorgusu hatası
  - `chunk` - çeken mevcut veri parçası
  - `header` - CSV dosyasının başlık satırı
  - `escape` - CSV değerlerini özel karakterler için formatlayan fonksiyon
  - `rowsCsv` - tüm satırların CSV formatına çevrilmiş listesi
  - `csv` - birleştirilmiş tam CSV string'i
  - `blob` - CSV'den oluşturulan Blob nesnesi
  - `url` - Blob için oluşturulan geçici URL
  - `a` - indirme işlemi için oluşturulan <a> DOM elementi
  - `e` - yakalanan hata nesnesi
- **Dönüş**: Promise<void>

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::csv_escape_value
- **params**: v: unknown
- **ic_degiskenler**:
  - `s` - değeri string'e çevrilip temizlenmiş hali
- **Dönüş**: CSV uyumlu formatlanmış string

### [N18_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::toggleSelect
- **params**: id: string, on: boolean
- **ic_degiskenler**:
  - `setSelectedIds` - seçili satır ID'lerini güncelleyen state setter
  - `prev` - önceki seçili ID listesi
  - `x` - filter fonksiyonunda işlenen ID
- **Dönüş**: void

### [N19_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx::bulkApplyStatus
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `selectedIds` - seçili olan tüm satır ID'leri
  - `setSavingBulk` - toplu güncelleme yükleme durumunu ayarlayan setter
  - `bulkStatus` - uygulanacak toplu durum değeri
  - `supabase.from('error_groups').update` - birden fazla satırın durumunu güncelleyen Supabase sorgusu
  - `error` - sorgu hatası
  - `setRows` - satır listesini güncelleyen state setter
  - `r` - map'te işlenen tek satır
  - `setSelectedIds` - seçili ID'leri sıfırlayan setter
  - `e` - yakalanan hata nesnesi
- **Dönüş**: Promise<void>

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage["AdminErrorGroupsPage"]
    AdminErrorGroupsPage_tsx__bulkApplyStatus["bulkApplyStatus"]
    AdminErrorGroupsPage_tsx__loadLatestClientErrors["loadLatestClientErrors"]
    AdminErrorGroupsPage_tsx__toggleSelect["toggleSelect"]
    AdminErrorGroupsPage_tsx__toggleSort["toggleSort"]
    AdminErrorGroupsPage_tsx__updateAssignedTo["updateAssignedTo"]
    AdminErrorGroupsPage_tsx__updateNotes["updateNotes"]
    AdminErrorGroupsPage_tsx__updateStatus["updateStatus"]
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateStatus
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateAssignedTo
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__toggleSort
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateNotes
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__loadLatestClientErrors
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__toggleSelect
```

## NODE ID STANDARD

  file: src\views\admin\AdminErrorGroupsPage.tsx
  function: src\views\admin\AdminErrorGroupsPage.tsx::AdminErrorGroupsPage
  function: src\views\admin\AdminErrorGroupsPage.tsx::toggleSort
  function: src\views\admin\AdminErrorGroupsPage.tsx::updateStatus
  function: src\views\admin\AdminErrorGroupsPage.tsx::updateAssignedTo
  function: src\views\admin\AdminErrorGroupsPage.tsx::updateNotes
  function: src\views\admin\AdminErrorGroupsPage.tsx::loadLatestClientErrors
  function: src\views\admin\AdminErrorGroupsPage.tsx::toggleSelect
  function: src\views\admin\AdminErrorGroupsPage.tsx::bulkApplyStatus

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorGroupsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/10`, `bg-cyan-500/10`, `bg-gray-50`, `bg-rose-500/10`, `bg-sky-500/10`, `bg-surface-deep`, `bg-white`, `bg-white/5`, `border-b`, `border-cyan-500/20`, `border-red-100`, `border-t`, `border-white/10`, `border-white/5`, `hover:bg-white/10`
- **Layout:** `!h-10`, `!h-8`, `backdrop-blur-md`, `flex`, `flex-col`, `gap-1`, `gap-2`, `gap-3`, `grid`, `grid-cols-1`, `h-7`, `inline-flex`, `items-center`, `justify-between`, `justify-center`
- **Varyant/Responsive:** `:`, `disabled:`, `hover:`, `last:`, `md:` önekleri
- **Yardımcı Sınıflar:** `!px-2`, `!py-1`, `!text-xs`, `$`, `${adminCardClass`, `${adminInputClass`, `${adminSelectClass`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `${cellPad`, `${headPad`, `:`, `===`, `border`, `break-all`