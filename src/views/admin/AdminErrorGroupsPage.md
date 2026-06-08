---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorGroupsPage.tsx
skeleton_hash: cdc389217ed218f5
entity_hashes:
  func:AdminErrorGroupsPage: 2df4b29ac83c8598
  func:bulkApplyStatus: 2e737880df202268
  func:loadLatestClientErrors: e416e263b6cc2d92
  func:toggleSelect: b57335e143909cca
  func:toggleSort: 10891db6bc49b5bf
  func:updateAssignedTo: 115d7b001b19d674
  func:updateNotes: 57b7793991d9e6a2
  func:updateStatus: 6c7719de765f38dd
  overview: fda4ea54cce394c0
  style_tokens: 5e40817d604cd18b
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
Bu modül, yönetici panelindeki hata gruplarını görüntülemek ve yönetmek için kullanılan bir React sayfasıdır. Hata gruplarını filtreleme, sıralama, tek tek veya toplu olarak durum güncelleme, sorumlu atama ve not ekleme gibi işlemleri merkezi bir arayüzden sunar.

## Fonksiyon Grupları
### Sayfa Yapısı ve Listeleme Kontrolleri
Ana bileşeni oluşturarak sayfanın temel yapısını kurar ve hata gruplarının sıralama ile seçim durumlarını yönetir.
- AdminErrorGroupsPage, toggleSort, toggleSelect

### Bireysel Hata Grubu İşlemleri
Belirli bir hata grubu üzerinde durum değişikliği, sorumlu atama, not güncelleme ve detaylı hata kayıtlarını yükleme gibi operasyonları gerçekleştirir.
- updateStatus, updateAssignedTo, updateNotes, loadLatestClientErrors

### Toplu İşlemler
Birden fazla seçili hata grubuna aynı anda durum değişikliği uygulayarak verimli toplu yönetim sağlar.
- bulkApplyStatus

---

## AXIOMS – Mimari Varsayımlar
Bu modül, yönetici panelinde hata gruplarını yönetmek için bir arayüz sunar. Temel varsayımlar, hata gruplarının ve ilişkili verilerin (kullanıcılar, hata kayıtları) varlığına dayanır.

[Aksiyom 1]: Eğer bir hata grubu ID'si (id) verilmemişse veya geçerli bir hata grubunu temsil etmiyorsa, `updateStatus`, `updateAssignedTo`, `updateNotes` ve `loadLatestClientErrors` fonksiyonları bu grup üzerinde geçerli bir işlem yapamaz; API çağrıları hata ile sonuçlanır veya sessizce başarısız olur.

[Aksiyom 2]: Eğer `updateAssignedTo` fonksiyonuna boş bir string ('') verilse bile, bu bir geçerli operasyondur (sorumlunun kaldırılması). Fonksiyon, geçerli bir kullanıcı ID'si veya boş bir değer almalıdır; aksi halde API isteği reddedilir.

[Aksiyom 3]: Eğer `toggleSort` fonksiyonu çağrılmadan önce mevcut sıralama durumu (state) bilinmiyorsa veya geçerli bir başlangıç değeri ('last_seen' veya 'count') yoksa, sıralama yönü (artan/azalan) tanımsız olur ve beklenmedik bir sıralama sonucu üretilir.

[Aksiyom 4]: Eğer `bulkApplyStatus` fonksiyonu çağrıldığında hiç bir hata grubu seçilmemişse (seçim durumu 'on' olan grup listesi boşsa), toplu durum güncelleme operasyonu çalıştırılmaz; herhangi bir API çağrısı yapılmaz.

[Aksiyom 5]: Eğer `loadLatestClientErrors` fonksiyonuna geçerli bir `groupId` verilirse, bu fonksiyon o gruba ait son istemci hatalarını (muhtemelen bir dizi/liste) yükler. `groupId` geçerli bir hata grubunu göstermiyorsa, yükleme işlemi hata ile sonuçlanır.

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

### [N1_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::AdminErrorGroupsPage
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesi verilmemiş, sadece importlar ve imza mevcut)
- **Dönüş**: React.FC

### [N2_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::toggleSort
- **params**: (by: 'last_seen' | 'count')
- **ic_degiskenler**: (fonksiyon içinde yeni değişken tanımlanmamış)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::updateStatus
- **params**: (id: string, newStatus: 'open' | 'resolved' | 'ignored')
- **ic_degiskenler**: 
  - `prev` — güncelleme öncesi rows dizisinin referansı, hata durumunda geri almak için saklanır
  - `error` — supabase.from('error_groups').update() yanıtından destructuring ile alınan hata objesi
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::updateAssignedTo
- **params**: (id: string, userId: string | '')
- **ic_degiskenler**: 
  - `val` — userId boş string ise null, değilse userId olarak atanır (atama için normalize değer)
  - `prev` — güncelleme öncesi rows dizisinin referansı, hata durumunda geri almak için saklanır
  - `error` — supabase.from('error_groups').update() yanıtından destructuring ile alınan hata objesi
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::updateNotes
- **params**: (id: string, notes: string)
- **ic_degiskenler**: 
  - `prev` — güncelleme öncesi rows dizisinin referansı, hata durumunda geri almak için saklanır
  - `error` — supabase.from('error_groups').update() yanıtından destructuring ile alınan hata objesi
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::loadLatestClientErrors
- **params**: (groupId: string)
- **ic_degiskenler**: 
  - `queryResult` — supabase.from('client_errors').select() sorgu sonucu obje
  - `data` — queryResult'dan destructuring ile alınan satır dizisi
  - `error` — queryResult'dan destructuring ile alınan hata objesi
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::toggleSelect
- **params**: (id: string, on: boolean)
- **ic_degiskenler**: (fonksiyon içinde yeni değişken tanımlanmamış)
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src\views\admin\AdminErrorGroupsPage.tsx::bulkApplyStatus
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `error` — supabase.from('error_groups').update() yanıtından destructuring ile alınan hata objesi
  - `e` — try-catch bloğu tarafından yakalanan hata (console.error için)
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
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateStatus
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__toggleSelect
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__loadLatestClientErrors
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__toggleSort
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateNotes
    AdminErrorGroupsPage_tsx__AdminErrorGroupsPage --> AdminErrorGroupsPage_tsx__updateAssignedTo
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