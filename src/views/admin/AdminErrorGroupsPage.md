---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx
skeleton_hash: 6a2cf5ad7fb8cfd4
entity_hashes:
  func:AdminErrorGroupsPage: 2df4b29ac83c8598
  func:bulkApplyStatus: 2e737880df202268
  func:loadLatestClientErrors: e416e263b6cc2d92
  func:toggleSelect: b57335e143909cca
  func:toggleSort: 10891db6bc49b5bf
  func:updateAssignedTo: 115d7b001b19d674
  func:updateNotes: 57b7793991d9e6a2
  func:updateStatus: 6c7719de765f38dd
  overview: 2bc670ce94cd0c60
  style_tokens: 5e40817d604cd18b
generated_at: 2026-05-30T20:26:00Z
---

## Genel Bakış
Bu modül, Venthub HVAC yönetici panelindeki hata grupları yönetim sayfasıdır. Yöneticilerin sistemde kaydedilen istemci hatalarını gruplar halinde görüntülemesine, grupları farklı kriterlere göre sıralamasına, tek tek veya toplu olarak durumlarını değiştirmesine, sorumlu kullanıcı ataması yapmasına ve notlar eklemesine olanak tanır. Modül, hem genel listeleme ve filtreleme hem de detaylı hata yönetimi için gerekli arayüz ve işlevsellikleri tek bir bileşen altında toplar.

## Fonksiyon Grupları
### Ana Sayfa Yapısı ve Görünüm Kontrolleri
Modülün temelini oluşturan ana React bileşeni ile yöneticinin hata grupları listesini sıralamasını ve gruplar üzerinde toplu seçim yapmasını sağlayan arayüz etkileşim fonksiyonlarını kapsar.
- AdminErrorGroupsPage, toggleSort, toggleSelect

### Bireysel Hata Grubu Yönetim İşlemleri
Belirli bir hata grubu üzerinde tek tek gerçekleştirilen durum güncelleme, sorumlu atama, not ekleme ve o gruba ait en son hata kayıtlarını getirme gibi detaylı yönetim operasyonlarını yöneten asenkron fonksiyonlardır.
- updateStatus, updateAssignedTo, updateNotes, loadLatestClientErrors

### Toplu İşlem Yönetimi
Seçili olan birden fazla hata grubuna aynı anda belirli bir durum değişikliğini uygulamak için kullanılan, verimliliği artıran toplu işleme fonksiyonudur.
- bulkApplyStatus

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hata grupları yönetim sayfası olarak API tabanlı CRUD işlemleri ve toplu seçim mekanizması üzerine kurulmuştur.

**[Aksiyom 1]**: Eğer `updateStatus` fonksiyonuna geçilen `id` değerine karşılık gelen hata grubu sunucuda mevcut değilse, durum güncelleme isteği başarısız olur.

**[Aksiyom 2]**: Eğer `toggleSort` fonksiyonuna geçilen `by` parametresi `'last_seen'` veya `'count'` değerlerinden biri değilse, sıralama yanlısı çalışır veya çalışma zamanı hatası oluşur (TypeScript enum contract).

**[Aksiyom 3]**: Eğer `loadLatestClientErrors` fonksiyonuna geçilen `groupId` değerine ait hata grubu sunucuda mevcut değilse, istemci hata listesi boş döner veya 404 hatası oluşur.

**[Aksiyom 4]**: Eğer `updateAssignedTo` fonksiyonuna geçilen `userId` değeri boş string (`''`) değilse, bu userId'nin geçerli bir kullanıcı kimliğine karşılık gelmesi gerekir; aksi takdirde atama işlemi başarısız olur.

**[Aksiyom 5]**: Eğer `bulkApplyStatus` fonksiyonu çağrıldığında hiçbir hata grubu seçilmemiş (`toggleSelect` ile `on: true` olarak işaretlenmemiş) ise, toplu durum güncelleme hiçbir kayıt üzerinde etkili olmaz.

**[Aksiyom 6]**: Eğer `updateNotes` fonksiyonuna geçilen `id` değerine karşılık gelen hata grubu mevcut değilse, not güncelleme isteği başarısız olur.

**[Aksiyom 7]**: Eğer `updateStatus` fonksiyonuna geçilen `newStatus` değeri `'open'`, `'resolved'` veya `'ignored'` değerlerinden biri değilse, durum geçersiz kabul edilir ve güncelleme yapılmaz (sabit üç durum döngüsü: open↔resolved↔ignored).

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

### [N1_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::toggleSort
- **params**: `by: 'last_seen' | 'count'` — sıralanacak sütun
- **ic_degiskenler**:
  - `prev` — mevcut sıralama sütununun önceki değeri
  - `d` — mevcut sıralama yönü (asc/desc)
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::updateStatus
- **params**: `id: string` — güncellenecek satır ID'si, `newStatus: 'open' | 'resolved' | 'ignored'` — yeni durum
- **ic_degiskenler**:
  - `prev` — güncelleme öncesi satır listesi (hata durumunda geri almak için)
  - `rs` — satır listesi (map callback içinde)
  - `r` — dönüştürülen her bir satır
  - `error` — supabase update sonucu hata
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::updateAssignedTo
- **params**: `id: string` — güncellenecek satır ID'si, `userId: string | ''` — atanacak kullanıcı ID'si (boş string = kaldır)
- **ic_degiskenler**:
  - `val` — userId boşsa null, değilse userId
  - `prev` — güncelleme öncesi satır listesi
  - `rs` — satır listesi (map callback içinde)
  - `r` — dönüştürülen her bir satır
  - `error` — supabase update sonucu hata
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::updateNotes
- **params**: `id: string` — güncellenecek satır ID'si, `notes: string` — yeni not içeriği
- **ic_degiskenler**:
  - `prev` — güncelleme öncesi satır listesi
  - `rs` — satır listesi (map callback içinde)
  - `r` — dönüştürülen her bir satır
  - `error` — supabase update sonucu hata
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::loadLatestClientErrors
- **params**: `groupId: string` — hata grubu ID'si
- **ic_degiskenler**:
  - `queryResult` — supabase sorgu sonucu (data ve error içeren obje)
  - `data` — queryResult'dan çıkarılan client_errors satırları
  - `error` — queryResult'dan çıkarılan hata
- **Dönüş**: yok (state güncelleme侧 etkisi: setLatestClientErrors)

### [N6_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::toggleSelect
- **params**: `id: string` — satır ID'si, `on: boolean` — seçili mi
- **ic_degiskenler**:
  - `prev` — önceki seçili ID listesi
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: AdminErrorGroupsPage.tsx::bulkApplyStatus
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — supabase update sonucu hata
  - `prev` — bulk güncelleme öncesi satır listesi (callback içinde)
  - `r` — dönüştürülen her bir satır (callback içinde)
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok

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
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateNotes
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__toggleSelect
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateAssignedTo
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__loadLatestClientErrors
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__toggleSort
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateStatus
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