---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminOrdersPage.tsx
skeleton_hash: 80374e33b45796ac
entity_hashes:
  func:AdminOrdersPage: e43c6c3c6f2a0c99
  overview: cd2f2af45ddb107c
  style_tokens: 3c1b71aa89e552d3
generated_at: 2026-08-27T07:19:44Z
---

## Genel Bakış
`AdminOrdersPage`, yönetici panelinde siparişlerin listelendiği, sıralandığı ve yönetildiği ana sayfa bileşenidir. Modül, kargo gönderimi, not ekleme/silme, sipariş loglarını görüntüleme gibi işlemleri modal pencereler üzerinden yürütür. Ayrıca sipariş verilerini CSV olarak dışa aktarma ve toplu kargo iptali gibi toplu işlemleri de destekler.

## Fonksiyon Grupları
### Ana Bileşen ve Sayfa Yapısı
Ana bileşen sayfayı oluşturur ve sipariş tablosu, filtreleme ve arama gibi temel sayfa yapısını yönetir.
- AdminOrdersPage

### Modal Pencere Yönetimi
Siparişlerle ilgili farklı işlemleri gerçekleştirmek için açılıp kapatılan modal pencerelerin kontrolünü sağlar.
- openShipModal, closeShipModal, openLogsModal, closeLogsModal, openNotesModal, closeNotesModal

### Sipariş İşlemleri ve İş Mantığı
Kargo gönderimi, not ekleme/silme, toplu kargo iptali ve CSV dışa aktarma gibi temel iş mantığı işlemlerini yürütür.
- addNote, deleteNote, submitShip, bulkCancelShipping, exportCsv

### Sıralama Kontrolleri
Sipariş tablosunda farklı sütunlara göre sıralama yapma ve sıralama yönü göstergesini yönetme işlevlerini yerine getirir.
- toggleSort, sortIndicator

### Görünüm ve Biçimlendirme Yardımcıları
Sipariş durumunu, tarihleri, tutarları ve rozetleri kullanıcı dostu biçimde görüntülemek için yardımcı işlevler sağlar.
- prettyStatus, safeDate, formatAmount, badgeClass

### İzleme ve Log İşlevleri
Kargo takip URL'i oluşturma ve sipariş loglarını açma/kapama gibi izleme ile ilgili işlevleri yönetir.
- generateTrackingUrl, openLogsModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `addNote` fonksiyonu `noteId` parametresi olmadan çağrılırsa, not ekleme işlemi başarısız olur.
[Aksiyom 2]: Eğer `deleteNote` fonksiyonu `noteId` parametresi olmadan çağrılırsa, not silme işlemi başarısız olur.
[Aksiyom 3]: Eğer `bulkCancelShipping` fonksiyonu `orderIds` parametresi olmadan çağrılırsa, toplu kargo iptali başarısız olur.
[Aksiyom 4]: Eğer `submitShip` fonksiyonu `orderId` ve `carrier` parametreleri olmadan çağrılırsa, kargo gönderimi başarısız olur.
[Aksiyom 5]: Eğer `exportCsv` fonksiyonu `data` parametresi olmadan çağrılırsa, CSV dışa aktarma başarısız olur.
[Aksiyom 6]: Eğer `toggleSort` fonksiyonu `key` parametresi olmadan çağrılırsa, sıralama değiştirme başarısız olur.
[Aksiyom 7]: Eğer `generateTrackingUrl` fonksiyonu `carrier` ve `trackingNumber` parametreleri olmadan çağrılırsa, takip URL'si oluşturulamaz.
[Aksiyom 8]: Eğer `formatAmount` fonksiyonu `amount` parametresi olmadan çağrılırsa, tutar formatlanamaz.
[Aksiyom 9]: Eğer `safeDate` fonksiyonu `dateString` parametresi olmadan çağrılırsa, tarih formatlanamaz.
[Aksiyom 10]: Eğer `badgeClass` fonksiyonu `status` parametresi olmadan çağrılırsa, durum rozeti sınıfı belirlenemez.
[Aksiyom 11]: Eğer `prettyStatus` fonksiyonu `status` parametresi olmadan çağrılırsa, durum gösterimi başarısız olur.
[Aksiyom 12]: Eğer `openLogsModal`, `closeLogsModal`, `openNotesModal`, `closeNotesModal`, `openShipModal` veya `closeShipModal` fonksiyonları çağrılmazsa, ilgili modallar açılamaz veya kapatılamaz.

---

## FONKSİYON DETAYLARI

### AdminOrdersPage

**Ne yapar**: Admin panelindeki sipariş yönetim sayfasını render eden React fonksiyonel bileşenidir. Sayfa, ince bir yapı ("thin-page") olarak tasarlanmış olup tüm veri işleme, sıralama, filtreleme ve modal mantığını alt bileşenlere devreder.

**Nasıl yapar**: Bileşen, sayfa yapısını iki ana bölümden oluşturur: bir header alanı ve bir list/board toggle (geçiş) alanı. Tüm veri çekme (fetch), sıralama (sort), filtreleme (filter) ve modal açma/kapama mantığı `OrdersTableBody` alt bileşeni içinde, `useAdminTable` hook'u kullanılarak sunucu modunda (server-mode) gerçekleştirilir. `OrdersTableBody` içindeki `useSearchParams` tüketici bileşeni, React Suspense sınırı ile sarılmıştır; bu sayede arama parametrelerine bağlı asenkron yüklemeler güvenli bir şekilde askıya alınabilir ve yükleme durumu gösterilebilir. Bu mimari tercih, CLAUDE.md Kural 5 / K2 kapsamında zorunlu kılınmış bir uygulamadır.

**Parametreler**:
- Bu bileşenin tanımlı prop parametresi yoktur. Bileşen, iç state'ini ve verilerini hook'lar (useAdminTable) ile URL arama parametreleri (useSearchParams) üzerinden yönetir.

**Dönüş**: `React.FC` — Siparişler yönetim sayfasını oluşturan React fonksiyonel bileşeni. Bileşen, header ve sipariş tablosu/kanban görünümü arasındaki geçiş anahtarını (toggle) içeren JSX döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./AdminOrdersBoard::AdminOrdersBoard
- import: ./OrdersTableBody::OrdersTableBody
- import: lucide-react::KanbanSquare
- import: lucide-react::LayoutList
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminOrdersPage.tsx::AdminOrdersPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, sayfadaki metinleri lokalize eder (admin.titles.orders, admin.orders.boardSubtitle, admin.orders.subtitle, admin.orders.view_list, admin.orders.view_board)
  - `viewMode` — React.useState ile oluşturulan state değişkeni, mevcut görünüm modunu tutar ('list' veya 'board')
  - `setViewMode` — viewMode state'ini güncelleyen setter fonksiyonu, butonlara tıklama ile çağrılır
- **Dönüş**: JSX elemanı (div yapısı içinde header ve koşullu AdminOrdersBoard veya Suspense ile sarılmış OrdersTableBody bileşeni)

---

## NODE ID STANDARD

  file: src\views\admin\AdminOrdersPage.tsx
  function: src\views\admin\AdminOrdersPage.tsx::AdminOrdersPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminOrdersPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-surface`, `border-admin-border`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-accent-fg`, `text-admin-fg-muted`, `text-xs`
- **Layout:** `flex`, `flex-col`, `gap-1`, `gap-2`, `gap-6`, `h-full`, `items-center`, `justify-between`, `md:flex-row`, `md:items-center`, `p-1`, `shadow-admin-lg`
- **Varyant/Responsive:** `:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `board`, `border`, `duration-500`, `font-semibold`, `list`, `pb-2`, `pb-20`, `px-6`, `py-2.5`, `rounded-admin-lg`, `rounded-admin-md`, `shrink-0`