---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLogisticsPage.tsx
skeleton_hash: 1bcb5c4931118983
entity_hashes:
  func:AdminLogisticsPage: 5503bc8a0114509c
  overview: dcb0b691b468e74f
  style_tokens: ed7e03291afa4b48
generated_at: 2026-06-06T21:57:38Z
---

## Genel Bakış
AdminLogisticsPage, VentHub HVAC projesinin yönetici panelinde lojistik süreçlerin yönetimini sağlayan tek sayfalık bir React bileşenidir. Modül, admin arayüzünde lojistik verilerinin görüntülenmesi ve yönetilmesi için gerekli arayüzü tek başına sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici arayüzündeki lojistik yönetim sayfasının tüm görünüm ve mantığını içeren ana bileşendir. Bu bileşen, lojistik modülünün yönetici panelindeki temsilcisidir.
- AdminLogisticsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, sadece fonksiyon imzasından çıkarılabilecek minimal varsayımlar tanımlanmıştır.

**[Aksiyom 1]:** Eğer `AdminLogisticsPage` bileşeni çağrıldığında geçerli bir React render bağlamı (context) yoksa, bileşen düzgün render edilemez ve hata oluşur.

**[Aksiyom 2]:** Eğer React render ortamı (DOM veya test ortamı) mevcut değilse, bileşen JSX döndüremez.

---

> **Not:** Fonksiyon gövdesi verilmediği için, component'in bağımlılıkları (store, servisler, alt bileşenler), state yönetimi, useEffect hook'ları veya conditional rendering mantığı hakkında aksiyom üretilememektedir. Detaylı mimari varsayımlar için fonksiyon gövdesi gereklidir.

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
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, tüm UI metinleri buna bağlı
  - `canWrite` — useRole() hook'undan dönen yetki kontrol fonksiyonu
  - `hasWriteAccess` — canWrite('logistics') sonucu boolean, yazma yetkisi varsa true
  - `dragScrollRef` — useDragScroll<HTMLDivElement>() hook'undan dönen ref, tablonun yatay sürükleme kaydırması için kullanılır
  - `rows` — useState<LogisticsRow[]>([]) state'i, bekleyen sipariş satırlarını tutar, tüm tablo verisi burada
  - `loading` — useState(true) state'i, veri yükleme durumunu takip eder
  - `saving` — useState(false) state'i, toplu gönderim sırasında kaydetme durumunu takip eder
  - `globalCarrier` — useState('Yurtiçi') state'i, üst kısımdaki küresel kargo şirketi seçimi
  - `fetchPendingOrders` — useCallback ile sarılmış async fonksiyon, Supabase'den bekleyen siparişleri çeker ve rows state'ini günceller
  - `pathname` — usePathname() hook'undan dönen mevcut URL yolu, fetchPendingOrders'ı tetiklemek için useEffect bağımlılığında kullanılır
  - `updateRow` — (id: string, field, val: string) => void fonksiyonu, belirli bir satırın carrier veya tracking_number alanını günceller
  - `applyGlobalCarrier` — () => void fonksiyonu, kaydedilmemiş tüm satırlara globalCarrier değerini uygular
  - `generateTrackingUrl` — (carrier: string, tracking: string) => string | null fonksiyonu, kargo firmasına göre takip URL'i üretir
  - `handleBulkSubmit` — async () => void fonksiyonu, tüm takip numarası girilmiş satırları toplu olarak Supabase Edge Function'a gönderir
- **Dönüş**: JSX (React bileşeni, return ile UI render eder)

---

### [N2_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::fetchPendingOrders
- **params**: (parametre yok — useCallback içinde tanımlı closure)
- **ic_degiskenler**:
  - `data` — supabase.from('view_admin_orders').select(...) çağrısından dönen ham satır verisi (dizi)
  - `error` — supabase sorgusundan dönen hata nesnesi, truthy ise throw edilir
  - `err` — catch bloğu tarafından yakalanan bilinmeyen hata türü
- **Dönüş**: void — setRows() ile state'i günceller, hata olursa toast.error gösterir, finally'de setLoading(false) yapar

---

### [N3_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::updateRow
- **params**: (id: string, field: 'carrier' | 'tracking_number', val: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — setRows ileprevState callback'inde r.id eşleşen satırın ilgili alanını val ile günceller ve saved'ı false yapar

---

### [N4_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::applyGlobalCarrier
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — setRows ile saved olmayan tüm satırların carrier alanını globalCarrier değerine set eder, toast.success gösterir

---

### [N5_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::generateTrackingUrl
- **params**: (carrier: string, tracking: string)
- **ic_degiskenler**:
  - `c` — carrier parametresinin lowercase'e çevrilmiş hali, kargo firması adını contains kontrolü için kullanılır
- **Dönüş**: string | null — kargo firmasına karşılık gelen takip URL'i string döner; eşleşme yoksa null döner. Eşleşen firmalar: yurtici, aras, mng, ptt

---

### [N6_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::handleBulkSubmit
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `targets` — rows.filter(r => r.tracking_number.trim() !== '' && !r.saved) ile elde edilen, takip numarası girilmiş ve henüz kaydedilmemiş satırlar dizisi
  - `errCount` — let ile tanımlı sayaç, hata oluşan istek sayısını tutar, başlangıçta 0
  - `results` — Promise.all(...) ile elde edilen dizi, her eleman {id: string, ok: boolean} formatında; id satır kimliği, ok başarılı olup olmadığını belirtir
- **Dönüş**: void — targets boşsa toast.error ile uyarı gösterip erken return yapar; setSaving(true) ile başlar, Promise.all ile tüm satırları paralel olarak supabase.functions.invoke('admin-update-shipping') çağrısıyla gönderir, ardından setRows ile başarılısatırların saved'ini true yapar, hata sayısına göre toast gösterir, finally'de setSaving(false) yapar

---

### [N7_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::fetchPendingOrders (async inner — Promise.all map callback)
- **params**: (row: LogisticsRow)
- **ic_degiskenler**:
  - `turl` — generateTrackingUrl(row.carrier, row.tracking_number) çağrısından dönen takip URL'i (string veya null)
  - `fnErr` — supabase.functions.invoke('admin-update-shipping') çağrısından dönen hata nesnesi; error destructuring ile alınır, !fnErr ile ok boolean üretilir
- **Dönüş**: { id: row.id, ok: !fnErr } — satır id'si ve başarılı olup olmadığı boolean

---

### [N8_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::fetchPendingOrders (async inner — setRows map callback)
- **params**: (r — supabase'den gelen ham satır objesi)
- **ic_degiskenler**: (yok — doğrudan field erişimi ile dönüş objesi oluşturulur)
- **Dönüş**: LogisticsRow objesi: { id: String(r.id), order_number: String(r.order_number || ...substring(0,8)), customer_name: String(r.customer_name || t('common.none')), created_at: String(r.created_at), carrier: String(r.carrier || 'Yurtiçi'), tracking_number: String(r.tracking_number || ''), saved: false }

---

### [N9_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::handleBulkSubmit (inner — setRows prevState callback)
- **params**: (prev — LogisticsRow[] mevcut state dizisi)
- **ic_degiskenler**:
  - `res` — results.find(x => x.id === r.id) ile bulunan, o satıra karşılık gelen {id, ok} sonucu; bulunamazsa undefined
- **Dönüş**: LogisticsRow[] — her satır için res.ok ise saved:true ile güncellenmiş satır, değilse errCount++ ile sayaç artırılıp aynı satır döner

---

### [N10_NASIL] AST Pointer: src/views/admin/AdminLogisticsPage.tsx::useEffect (pathname değişimi callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — fetchPendingOrders() çağırır; bağımlılıklar [fetchPendingOrders, pathname]

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