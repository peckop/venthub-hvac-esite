---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx
skeleton_hash: c759c7f160863769
entity_hashes:
  func:AdminErrorsPage: a54e992b31a4d175
  func:fmt: f911ea01809e8b2a
  overview: b1c53ea2b726d7c3
  style_tokens: a98ae3ae7fce0104
generated_at: 2026-06-06T21:57:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelindeki hata yönetimi sayfasını sunar. Sistemde kaydedilen hata kayıtlarını yöneticilere listeleyerek inceleme olanağı sağlar ve tarihlerin okunabilir biçimde gösterilmesini destekler.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Tüm sayfa düzenini, veri çekme işlemlerini ve hata kayıtlarının kullanıcıya sunulmasını yöneten temel React bileşenidir.
- AdminErrorsPage

### Tarih Formatlama Yardımcıları
Hata kayıtlarındaki tarih nesnelerini, arayüzde gösterilmek üzere okunabilir ve standart bir metin formatına dönüştürmekle sorumludur.
- fmt

---

## AXIOMS – Mimari Varsayımlar
Bu modül için tanımlanan mimari varsayımlar, yalnızca fonksiyon imzalarından türetilmiştir.

[Aksiyom 1]: `fmt` fonksiyonuna geçilen `d` parametresi geçerli bir `Date` nesnesi olmalıdır. Eğer `d` geçerli (NaN içermeyen) bir `Date` nesnesi yoksa, fonksiyon tanımsız veya geçersiz bir tarih dizesi döndürür.

[Aksiyom 2]: `AdminErrorsPage` fonksiyonu (React bileşeni) herhangi bir parametre almaz; dolayısıyla hata listesi verisini dış kaynaklardan (context, custom hook, global state vb.) almalıdır. Eğer bu veri kaynağı bileşen yaşam döngüsünde erişilebilir değilse, bileşen boş/bozuk bir arayüz render eder.

---

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::AdminErrorsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tenantId` — Mevcut kiracının benzersiz kimliği, useTenant() hook'undan alınır
  - `t` — Çeviri fonksiyonu, useI18n() hook'undan alınır
  - `lang` — Mevcut dil kodu, useI18n() hook'undan alınır
  - `dragScrollRef` — Sürükleme ile yatay kaydırma için ref, useDragScroll() hook'undan alınır
  - `fmt` — Tarih nesnesini YYYY-MM-DD formatına çeviren yerel yardımcı fonksiyon
  - `now` — Şu anki tarih ve saati temsil eden Date nesnesi
  - `defaultToDate` — Bugün için oluşturulmuş tarih stringi (varsayılan bitiş tarihi)
  - `defaultFromDate` — 6 gün öncesi için oluşturulmuş tarih stringi (varsayılan başlangıç tarihi)
  - `rows` — Hata satırlarını tutan state değişkeni (ErrorRow[])
  - `loading` — Veri yükleme durumunu tutan state değişkeni (boolean)
  - `error` — Hata mesajını tutan state değişkeni (string | null)
  - `total` — Toplam hata sayısını tutan state değişkeni (number)
  - `page` — Mevcut sayfa numarasını tutan state değişkeni (number)
  - `q` — Arama sorgusunu tutan state değişkeni (string)
  - `debouncedQ` — Debounce edilmiş arama sorgusu (string)
  - `fromDate` — Başlangıç tarih filtresini tutan state değişkeni (string)
  - `toDate` — Bitiş tarih filtresini tutan state değişkeni (string)
  - `level` — Hata seviyesi filtresini tutan state değişkeni (string)
  - `env` — Ortam filtresini tutan state değişkeni (string)
  - `fetchErrors` — Supabase'den hata verilerini çeken asenkron fonksiyon (useCallback ile sarılmış)
  - `pathname` — Mevcut URL yolunu temsil eden değişken, usePathname() hook'undan alınır
  - `fetchRef` — fetchErrors fonksiyonunu tutan ref değişkeni
  - `refetchTimer` — Otomatik yenileme için zamanlayıcı ID'sini tutan ref değişkeni
  - `scheduleRefetch` — Yenileme işlemini zamanlayan fonksiyon (useCallback ile sarılmış)
  - `expandedId` — Genişletilmiş satırın ID'sini tutan state değişkeni (string | null)
- **Dönüş**: React.FC (React Function Component)

### [N2_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::fmt
- **params**: (d: Date)
- **ic_degiskenler**:
  - `y` — Yıl bilgisini tutan yerel değişken (d.getFullYear() çağrısıyla alınır)
  - `m` — Ay bilgisini tutan yerel değişken (String(d.getMonth() + 1).padStart(2, '0') ile formatlanır)
  - `day` — Gün bilgisini tutan yerel değişken (String(d.getDate()).padStart(2, '0') ile formatlanır)
- **Dönüş**: `${y}-${m}-${day}` formatında tarih stringi

### [N3_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::debounceEffect
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — setTimeout ile oluşturulmuş zamanlayıcı ID'si, 300ms gecikmeyle debounce edilmiş sorguyu günceller
- **Dönüş**: Temizleme fonksiyonu (clearTimeout ile timer'ı iptal eder)

### [N4_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::fetchErrors
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi, client_errors tablosunu sorgulamak için oluşturulur
  - `like` — LIKE sorgusu için arama deseni, `%${debouncedQ}%` formatında oluşturulur
  - `from` — Sayfalama için başlangıç indeksi, (page - 1) * PAGE_SIZE ile hesaplanır
  - `to` — Sayfalama için bitiş indeksi, from + PAGE_SIZE - 1 ile hesaplanır
  - `data` — Supabase sorgusundan dönen ham veri (ErrorRow[])
  - `error` — Supabase sorgusundan dölen hata nesnesi
  - `count` — Supabase sorgusundan dönen toplam kayıt sayısı
- **Dönüş**: Promise<void> (setRows, setTotal, setError ve setLoading state güncellemeleri yapar)

### [N5_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::scheduleRefetch
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (refetchTimer.current zamanlayıcısını ayarlar veya temizler)

### [N6_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::setupRealtimeChannel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ch` — Supabase Realtime kanal nesnesi, `client-errors-${tenantId}` kanalına abone olur
- **Dönüş**: Temizleme fonksiyonu (kanalı kaldırır ve zamanlayıcıyı temizler)

### [N7_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::onRealtimeChange
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (scheduleRefetch() fonksiyonunu çağırır)

### [N8_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::cleanupRealtimeChannel
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (supabase.removeChannel() ve clearTimeout() ile temizlik yapar)

### [N9_NASIL] AST Pointer: src/views/admin/AdminErrorsPage.tsx::renderRow
- **params**: (r: ErrorRow)
- **ic_degiskenler**: (yok)
- **Dönüş**: ReactJSX.Element (Her hata satırı için JSX fragment)

---

## NODE ID STANDARD

  file: src\views\admin\AdminErrorsPage.tsx
  function: src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage
  function: src\views\admin\AdminErrorsPage.tsx::fmt

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-rose-50`, `bg-sky-50`, `bg-surface-deep`, `bg-surface-deep/40`, `bg-surface-deep/80`, `bg-white/3`, `bg-white/5`, `border-b`, `border-red-100`, `border-t`, `border-white/10`, `border-white/5`, `hover:bg-white/10`, `hover:bg-white/2`
- **Layout:** `backdrop-blur-md`, `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `gap-6`, `grid`, `inline-flex`, `items-center`, `justify-between`, `justify-end`, `max-h-80`, `md:grid-cols-2`, `min-w-full`, `overflow-auto`
- **Varyant/Responsive:** `:`, `disabled:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminCardClass`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `${r.level`, `:`, `===`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-30`, `error`, `font-black`, `font-bold`, `font-medium`, `font-mono`, `glass-strong`