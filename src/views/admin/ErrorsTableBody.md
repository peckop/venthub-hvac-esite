---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\ErrorsTableBody.tsx
skeleton_hash: 23a332acfe9d1e92
entity_hashes:
  func:ErrorsTableBody: ba1ec68351d28cea
  func:errorsFetcher: 60958894ebe71f12
  overview: ab50c4f500390533
  style_tokens: e38a63b8dd8d7926
generated_at: 2026-06-13T17:01:20Z
---

## Genel Bakış
Bu modül, admin panelindeki hata kayıtlarını gösteren bir tablonun gövde (body) bileşenini ve bu tabloyu besleyen verileri asenkron olarak çekmekten sorumlu olan bir yardımcı fonksiyonu içerir. Modül, Supabase veritabanı ile iletişim kurarak hata verilerini alır ve bunları bir React bileşeni aracılığıyla kullanıcıya sunar.

## Fonksiyon Grupları
### Veri Çekme ve Yönetim
Bu grup, modülün arkasındaki veri mantığını yönetir; Supabase istemcisini kullanarak belirli parametlere göre hata kayıtlarını asenkron olarak çeker.
- errorsFetcher

### Arayüz Gösterimi
Bu grup, çekilen hata verilerini kullanıcıya tablo形式ında sunan React bileşenini tanımlar ve yönetir.
- ErrorsTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdeleri (implementation) paylaşılmadığı için, fonksiyon imzasından türetilen **minimum** mimari varsayımlar aşağıdadır:

**[Aksiyom 1]:** Eğer `errorsFetcher` fonksiyonuna geçerli (non-null/non-undefined) bir `SupabaseClient<Database>` instance'ı sağlanmazsa, veritabanı sorgusu başarısız olur ve hata fırlatır.

**[Aksiyom 2]:** Eğer `errorsFetcher` fonksiyonuna geçerli bir `FetchParams` nesnesi (sayfa, filtre, sıralama vb. parametreler) sağlanmazsa, hata kayıtları doğru filtrelenemez veya sayfalanamaz.

**[Aksiyom 3]:** Eğer `ErrorsTableBody` bileşeni React bileşen ağacı (component tree) dış bir bağlamda render edilmeye çalışılırsa, React runtime hatası oluşur.

---

> ⚠️ **Not:** Fonksiyon gövdeleri (function bodies) paylaşılmadığından, iç mantığa dayalı daha spesifik aksiyomlar (örn: hata tablosu için beklenen minimum sütun seti, sayfa başına satır sayısı eşiği, belirli hata kodu aralıkları vb.) **bilinmiyor** olarak değerlendirilmiştir. Daha detaylı aksiyom üretimi için fonksiyon implementasyonlarının paylaşılması gereklidir.

---

## FONKSİYON DETAYLARI

### errorsFetcher
**Ne yapar**: Supabase veritabanından `client_errors` tablosuna sorgu yaparak hata kayıtlarını getirir. Filtreleme, sıralama ve sayfalama (pagination) işlemlerini yöneterek uygun formatta sonuç döndürür.

**Nasıl yapar**: Fonksiyon, `FetchParams` objesinden filtre parametrelerini (tarih aralığı, seviye, ortam) çıkarır ve Supabase sorgusuna dinamik olarak ekler. `level`, `env`, `from`, `to` filtreleri varsa sırasıyla `.eq()` ve `.gte()/.lte()` metodlarıyla uygulanır. `params.query` mevcutsa, `url` ve `message` alanlarında `ilike` operatörü ile arama yapılır (`.or()` kullanarak). Sıralama için `sortKey` parametresi kullanılır, varsayılan olarak `'at'` alanı tercih edilir. Son olarak `.range()` metodu ile sayfalama uygulanır ve `(data, error, count)` sonucu alınır. Hata durumunda exception fırlatılır.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase veritabanı istemcisi, Database generic tipi ile tip güvenliği sağlanmış 연결 nesnesi
- `params`: `FetchParams` — SorguParametreleri objesi, içeriğinde `filters` (level, env, from, to), `sort` (key, dir), `query` (arama metni), `page` ve `pageSize` alanlarını barındırır

**Dönüş**: `Promise<FetchResult<ErrorRow>>` — Asenkron olarak çözünen bir Promise döndürür. `FetchResult` tipi iki alan içerir: `rows` (ErrorRow[] tipinde hata kayıtları dizisi) ve `totalMatched` (toplam eşleşen kayıt sayısı, number tipinde). Veri yoksa `rows` boş dizi, `totalMatched` ise 0 döner.

### ErrorsTableBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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

### [N1_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::errorsFetcher
- **params**: (`supabase: SupabaseClient<Database>`, `params: FetchParams`)
- **ic_degiskenler**:
  - `level` — `params.filters.level` dizisinin ilk elemanı, hata seviyesi filtresi (error, warn, info)
  - `env` — `params.filters.env` dizisinin ilk elemanı, ortam filtresi (production, development, preview)
  - `from` — `params.filters.from` dizisinin ilk elemanı, başlangıç tarihi filtresi
  - `to` — `params.filters.to` dizisinin ilk elemanı, bitiş tarihi filtresi
  - `query` — Supabase sorgu nesnesi, client_errors tablosuna veri çekmek için oluşturulur
  - `sortKey` — Sıralama anahtarı, varsayılan olarak 'at' (zaman damgası)
  - `like` — Arama sorgusu için LIKE kalıbı, `%${params.query}%` formatında
  - `offset` — Sayfalama için-ofset hesaplaması, `(params.page - 1) * params.pageSize`
  - `data` — Supabase sorgusundan dönen veri dizisi (ErrorRow[])
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `count` — Toplam eşleşen kayıt sayısı (sayfalama için)
- **Dönüş**: `Promise<FetchResult<ErrorRow>>` — `rows` ve `totalMatched` içeren nesne

### [N2_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::ErrorsTableBody
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n` hook'undan gelen çeviri fonksiyonu
  - `lang` — `useI18n` hook'undan gelen güncel dil kodu
  - `tenantId` — `useTenant` hook'undan gelen kiracı ID'si
  - `defaultFrom` — `useMemo` ile hesaplanan varsayılan başlangıç tarihi (son 7 günün başı)
  - `defaultTo` — `useMemo` ile hesaplanan varsayılan bitiş tarihi (bugün)
  - `initialFilters` — `useMemo` ile oluşturulan başlangıç filtre değerleri (env: production, from ve to varsayılan tarihler)
  - `table` — `useAdminTable` hook'undan dönen tablo durumu ve yöntemleri
  - `reloadRef` — `table.reload` fonksiyonunu tutan ref nesnesi
  - `refetchTimer` — Realtime yenileme için debounce zamanlayıcı ID'sini tutan ref
  - `setFilter` — `table.filtering` nesnesinden alınan filtre ayarlama fonksiyonu
  - `setQuery` — `table.filtering` nesnesinden alınan arama sorgusu ayarlama fonksiyonu
  - `filters` — Mevcut filtre değerlerini içeren nesne (level, env, from, to)
  - `levelVal` — Seçili hata seviyesi filtresinin değeri (input için)
  - `envVal` — Seçili ortam filtresinin değeri (select için)
  - `fromVal` — Seçili başlangıç tarihi filtresinin değeri (date input için)
  - `toVal` — Seçili bitiş tarihi filtresinin değeri (date input için)
  - `envOptions` — `useMemo` ile oluşturulan ortam seçenekleri dizisi (production, preview, development, all)
  - `columns` — `useMemo` ile oluşturulan tablo kolon tanımları dizisi
- **Dönüş**: JSX (React bileşeni) — `DataTableKit` ve `AdminToolbar` içeren tablo görünümü

### [N3_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::useMemo-callback-defaultDates
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fmt` — Date nesnesini `YYYY-MM-DD` formatına dönüştüren yardımcı fonksiyon
  - `now` — Güncel tarih ve saat nesnesi (`new Date()`)
  - `y` — Yıl değeri (`d.getFullYear()`)
  - `m` — Ay değeri, 2 haneli (`String(d.getMonth() + 1).padStart(2, '0')`)
  - `day` — Gün değeri, 2 haneli (`String(d.getDate()).padStart(2, '0')`)
- **Dönüş**: `{ defaultTo: string, defaultFrom: string }` — Formatlanmış tarih字符串leri

### [N4_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::fmt-dateFormatter
- **params**: (`d: Date`)
- **ic_degiskenler**:
  - `y` — Yıl değeri (`d.getFullYear()`)
  - `m` — Ay değeri, 2 haneli (`String(d.getMonth() + 1).padStart(2, '0')`)
  - `day` — Gün değeri, 2 haneli (`String(d.getDate()).padStart(2, '0')`)
- **Dönüş**: `string` — `YYYY-MM-DD` formatında tarih字符串i

### [N5_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::useEffect-realtimeSubscription
- **params**: (parametre yok, closure içinde `tenantId`, `reloadRef`, `refetchTimer` kullanır)
- **ic_degiskenler**:
  - `ch` — Supabase realtime kanalı (`supabaseBrowserClient.channel`)
  - `refetchTimer.current` — Timer referansı, debounce için kullanılır
  - `reloadRef.current` — `table.reload` fonksiyonu, veriyi yeniden çeker
- **Dönüş**: Cleanup fonksiyonu — kanalı kaldırır ve timer'ı temizler

### [N6_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::realtimeCallback-debounceReload
- **params**: (parametre yok, closure içinde `refetchTimer` ve `reloadRef` kullanır)
- **ic_degiskenler**:
  - `refetchTimer.current` — Mevcut timer ID'si, varsa iptal edilir
- **Dönüş**: yok (yan etki: 400ms debounce ile reload fonksiyonu çağrılır)

### [N7_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::cleanupCallback-removeChannel
- **params**: (parametre yok, closure içinde `ch`, `refetchTimer` kullanır)
- **ic_degiskenler**:
  - `refetchTimer.current` — Timer referansı, temizlenir
- **Dönüş**: yok (yan etki: kanalı kaldırır ve timer'ı temizler)

### [N8_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::resetFiltersCallback
- **params**: (parametre yok, closure içinde `setQuery`, `setFilter`, `defaultFrom`, `defaultTo` kullanır)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: tüm filtreleri varsayılana sıfırlar)

### [N9_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::useMemo-envOptions
- **params**: (parametre yok, closure içinde `t` kullanır)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ value: string, label: string }[]` — Ortam seçenekleri dizisi

### [N10_NASIL] AST Pointer: src\views\admin\ErrorsTableBody.tsx::useMemo-columns
- **params**: (parametre yok, closure içinde `t`, `lang` kullanır)
- **ic_degiskenler**: (yok)
- **Dönüş**: `AdminColumn<ErrorRow>[]` — Tablo kolon tanımları dizisi (at, level, message, url)

---

## NODE ID STANDARD

  file: src\views\admin\ErrorsTableBody.tsx
  function: src\views\admin\ErrorsTableBody.tsx::errorsFetcher
  function: src\views\admin\ErrorsTableBody.tsx::ErrorsTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: ErrorsTableBody
  export: errorsFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-rose-50`, `bg-sky-50`, `bg-surface-deep`, `bg-surface-deep/40`, `bg-surface-deep/80`, `border-b`, `border-white/5`, `text-amber-300/80`, `text-amber-400`, `text-amber-700`, `text-cyan-400`, `text-right`, `text-rose-700`, `text-sky-700`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-6`, `grid`, `inline-flex`, `items-center`, `justify-between`, `max-h-80`, `md:grid-cols-2`, `overflow-auto`, `p-4`
- **Varyant/Responsive:** `:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `border`, `error`, `font-black`, `font-bold`, `font-medium`, `font-mono`, `leading-relaxed`, `mb-3`, `ml-4`, `pb-2`, `px-2`, `py-0.5`