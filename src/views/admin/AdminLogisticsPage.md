---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: 7e7afc0bbf27d1a2
entity_hashes:
  func:AdminLogisticsPage: 5503bc8a0114509c
  overview: 32b1a2d808cb740c
  style_tokens: ed7e03291afa4b48
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
AdminLogisticsPage, VentHub HVAC yönetici panelinde lojistik süreçlerin merkezi olarak yönetildiği React bileşenidir. Sipariş takibi, stok yönetimi ve teslimat süreçleri gibi lojistik operasyonların görüntülenmesi ve kontrolü için yönetici arayüzü sunar. Yetkili kullanıcılar için tek sayfalık bir yönetim paneli olarak tasarlanmıştır.

## Fonksiyon Grupları
### Yönetim Sayfası Bileşeni
Lojistik verilerinin sunumunu ve yönetici etkileşimini tek bir bileşen üzerinde yoğunlaştıran ana React bileşenidir.
- AdminLogisticsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, sadece fonksiyon imzasından ve bileşen türünden çıkarılabilecek minimal varsayımlar tanımlanmıştır.

**[Aksiyom 1]:** Eğer `AdminLogisticsPage` bir React bileşeni olarak çağrılacaksa, bileşen geçerli bir JSX/React elementi döndürmelidir;aksi takdirde React render hatası oluşur.

**[Aksiyom 2]:** Eğer `AdminLogisticsPage()` çağrıldığında parametre (props) geçilmeyecekse, bileşen dış veri bağımlılıklarını kendi iç state'inden veya context/provider'larından karşılamalıdır; aksi halde gerekli verilere erişemez.

**[Aksiyom 3]:** Eğer bu bileşen yönetici panelinde bir sayfa olarak konumlandırılacaksa, üst seviye layout bileşeni (Router/Layout) içinde render edilmelidir; aksi halde sayfa yapısı tutarsız görünür.

---

## FONKSİYON DETAYLARI

### AdminLogisticsPage
**Ne yapar**: VentHub HVAC projesinin yönetici paneline ait lojistik yönetimi sayfası bileşenidir. Sistem üzerindeki tüm lojistik süreçlerinin görüntülenmesi, takibi ve yönetimi için yetkili yönetici kullanıcılara özel ana arayüzü sunar. Sadece yönetici seviyesindeki erişim haklarına sahip kullanıcıların ulaşabileceği bir içerik sunumu sağlar.
**Nasıl yapar**: Kaynak kodunun bulunduğu C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx dosyası içerisinde tanımlı React tabanlı bir sayfa bileşeni olarak çalışır. İçerisinde lojistik yönetimi için gereken alt bileşenleri, ilgili veri akışlarını ve erişim kontrolü mantığını barındırarak, belirtilen genel domain kapsamında lojistik operasyonlarını yönetme imkanı tanır.
**Parametreler**: Fonksiyona geçirilmesi tanımlanmış herhangi bir parametre bulunmamaktadır.
**Dönüş**: Dönüş tipi hakkında resmi bir tanım bulunmamaktadır, React tabanlı sayfa bileşeni olması nedeniyle kullanıcıya görüntülenmek üzere JSX formatında arayüz elementleri döndürmesi beklenir.

---

## INTERFACES

### LogisticsRow
- `id: string`
- `order_number: string`
- `customer_name: string`
- `created_at: string`
- `carrier: string`
- `tracking_number: string`
- `saved: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::AdminLogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, tüm sayfa metinleri buna bağlanır
  - `canWrite` — `useRole()` hook'undan dönen rol kontrol fonksiyonu
  - `hasWriteAccess` — `canWrite('logistics')` çağrısının boolean sonucu, yazma yetkisi olup olmadığını tutar
  - `dragScrollRef` — `useDragScroll<HTMLDivElement>()` hook'undan dönen ref, yatay kaydırma tablosuna bağlanır
  - `rows` — `useState<LogisticsRow[]>([])` state'i, bekleyen siparişlerin listesini tutar
  - `loading` — `useState(true)` state'i, veri yükleme durumunu tutar
  - `saving` — `useState(false)` state'i, toplu kayıt işlemi durumunu tutar
  - `globalCarrier` — `useState('Yurtiçi')` state'i, tüm satırlara uygulanacak varsayılan kargo firması
  - `fetchPendingOrders` — `useCallback` ile sarılmış asenkron fonksiyon, bekleyen siparişleri çeker
  - `pathname` — `usePathname()` hook'undan dönen mevcut sayfa yolu, useEffect bağımlılığı olarak kullanılır
  - `updateRow` — tek bir satırın carrier veya tracking_number alanını güncelleyen fonksiyon
  - `applyGlobalCarrier` — `globalCarrier` değerini kaydedilmemiş tüm satırlara uygular
  - `generateTrackingUrl` — kargo firması ve takip numarasına göre takip URL'i üretir
  - `handleBulkSubmit` — tüm takip numaralarını toplu olarak sunucuya gönderen asenkron fonksiyon
- **Dönüş**: JSX (React bileşeni, sayfa UI'ını render eder)

---

## NODE ID STANDARD

  file: src\views\admin\AdminLogisticsPage.tsx
  function: src\views\admin\AdminLogisticsPage.tsx::AdminLogisticsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminLogisticsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/10`, `bg-cyan-500/5`, `bg-emerald-400/10`, `bg-emerald-500/3`, `bg-surface-deep/20`, `bg-white/2`, `bg-white/20`, `bg-white/5`, `border-b`, `border-collapse`, `border-cyan-500/20`, `border-emerald-400/20`, `border-t`, `border-white/10`, `border-white/5`
- **Layout:** `absolute`, `backdrop-blur-xl`, `block`, `bottom-0`, `custom-scrollbar`, `flex`, `flex-1`, `flex-col`, `gap-1.5`, `gap-4`, `gap-6`, `h-12`, `h-64`, `inline-flex`, `items-center`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `focus:`, `group-hover/submit:`, `group-hover:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!bg-surface-deep/60`, `!font-mono`, `!py-2`, `!rounded-xl`, `!text-xs`, `$`, `${adminButtonPrimaryClass`, `${adminCardClass`, `${adminInputClass`, `${adminSelectClass`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `-mr-32`, `-mt-32`, `:`