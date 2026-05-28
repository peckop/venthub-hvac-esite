---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 3a744f7714238bb9
entity_hashes:
  func:AccountReturnsPage: b01b740ffc8dc4da
  overview: 094ef3e3bb6279cc
  style_tokens: d5328287ff24abb4
generated_at: 2026-05-28T22:38:52Z
---

## Genel Bakış
`AccountReturnsPage` bileşeni, kullanıcıların iade işlemlerini görüntüleyebildiği ve yönetebildiği bir sayfa sunar. React/TypeScript ortamında, ilgili veri çekme, durum yönetimi ve UI render işlemlerini tek bir bileşende birleştirir.

## Fonksiyon Grupları
### Sayfa Render ve Veri Yönetimi
Bu grup, iade listelerinin alınması, sayfa durumunun (loading, error, empty) yönetilmesi ve UI’nın oluşturulmasından sorumludur.  
- AccountReturnsPage   (sayfanın ana bileşeni, veri çekme ve render akışını kontrol eder)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AccountReturnsPage
**Ne yapar**: Kullanıcının iade taleplerini listeleyen, yeni iade talebi oluşturulmasını sağlayan ve iade sürecinin durumunu görsel bir zaman çizelgesiyle izletecek bir sayfa bileşeni sunar.  

**Nasıl yapar**:  
- `useAuth`, `useI18n`, `useSearchParams` ve `useRouter` gibi React hook’larıyla kimlik, çeviri, URL parametreleri ve yönlendirme bilgilerini alır.  
- `useEffect` içinde iki ayrı asenkron yükleme fonksiyonu (`load` ve `loadOrders`) çalıştırarak Supabase’dan iade kayıtlarını (`venthub_returns`) ve ilgili siparişleri (`venthub_orders`) çeker, hataları yönetir ve bileşen durumlarını (`rows`, `orders`, `loading`) günceller.  
- Kullanıcı bir sipariş ID’siyle (`?new=`) sayfayı açarsa modal otomatik olarak gösterilir.  
- Form durumunu (`form`) ve modal görünürlüğünü (`openModal`) `useState` ile yönetir.  
- `handleCreate` fonksiyonu, form doğrulaması yapar, yeni iade kaydını Supabase’a ekler, başarılı olduğunda listeyi yeniler ve kullanıcıyı yönlendirir.  
- `statusClass`, `getStatusIcon`, `getStatusLabel` ve `getReturnTimeline` yardımcı fonksiyonları, iade durumuna göre stil, ikon, etiket ve zaman çizelgesi adımlarını üretir.  
- Render aşamasında, yükleme, boş liste, filtreleme ve iade kartları gibi UI durumlarını koşullu olarak gösterir; ayrıca yeni iade oluşturmak için modal içerir.  

**Parametreler**: *Bu fonksiyon dışarıdan parametre almaz.*  

**Dönüş**: `void` – React bileşeni olarak JSX döndürür, doğrudan bir değer üretmez.

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

### [N1_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::AccountReturnsPage
- **params**: (none)
- **ic_degiskenler**:
  - `mounted` — effect yaşam döngüsü boyunca bileşenin hâlâ monte edilmiş olup olmadığını izler; temizleme fonksiyonunda `false` yapılır.
  - `load` — returns verisini Supabase’dan çeken ve `setRows`, `setLoading` durumlarını yöneten async iç fonksiyon.
- **Dönüş**: yok (React bileşeni render eder, yan etkileri `useEffect` içinde yönetir)

### [N2_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::load
- **params**: (none)
- **ic_degiskenler**:
  - `list` — Supabase sorgusundan dönen returns listesi (`data` kısmı).
  - `error` — Supabase sorgusundan dönen hata nesnesi.
- **Dönüş**: yok (durum günceller, hata fırlatır)

### [N3_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::loadOrders
- **params**: (none)
- **ic_degiskenler**:
  - `data` — Supabase’dan çekilen sipariş kayıtları.
  - `error` — Supabase sorgusundan dönen hata nesnesi.
  - `fb` — alternatif sorgu (sütun eksikliği/400 hatası durumunda) sonucu.
- **Dönüş**: yok (`setOrders` ile durum günceller)

### [N4_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::prefillEffect
- **params**: (none)
- **ic_degiskenler**:
  - `prefillOrderId` — URL parametresi veya dışarıdan gelen ön‑doldurma değeri.
- **Dönüş**: yok (modal açma yan etkisi)

### [N5_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::reasonOptions
- **params**: (none)
- **ic_degiskenler**: (none, sadece sabit dizi döner)
- **Dönüş**: `string[]` — iade nedenleri listesi

### [N6_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::submitReturn
- **params**: (none)
- **ic_degiskenler**:
  - `form.order_id` — seçilen sipariş kimliği.
  - `form.reason` — seçilen iade nedeni.
  - `form.description` — isteğe bağlı açıklama.
  - `payload` — Supabase `venthub_returns` tablosuna eklenecek veri nesnesi.
  - `error` — insert işleminden dönen hata.
  - `list` — yeni eklenen iade sonrası güncellenen returns listesi.
- **Dönüş**: yok (toast gösterir, modal kapatır, form sıfırlar, yönlendirir)

### [N7_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::statusClass
- **params**: `s: string`
- **ic_degiskenler**:
  - `v` — `s` değerinin küçük harfe çevrilmiş hali; sınıf seçimi için kullanılır.
- **Dönüş**: `string` — CSS sınıfı

### [N8_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getStatusIcon
- **params**: `status: string`
- **ic_degiskenler**: (none, sadece `status` üzerinden switch)
- **Dönüş**: `JSX.Element` — ilgili Lucide‑react ikonu

### [N9_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getStatusLabel
- **params**: `status: string`
- **ic_degiskenler**: (none, sadece `status` üzerinden i18n lookup)
- **Dönüş**: `string` — yerelleştirilmiş durum etiketi

### [N10_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getReturnTimeline
- **params**: `currentStatus: string`
- **ic_degiskenler**:
  - `allSteps` — normal akıştaki adımların sabit dizisi.
  - `currentIndex` — `currentStatus`’ın `allSteps` içindeki konumu.
- **Dönüş**: `TimelineStep[]` — her adımın tamamlanma ve mevcut olma bilgisiyle dönen dizi

### [N11_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::renderOption
- **params**: `o: OrderLite`
- **ic_degiskenler**: (none, sadece `o` üzerinden değer okur)
- **Dönüş**: `JSX.Element` — `<option>` öğesi

### [N12_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::renderReturnRow
- **params**: `r: ReturnRow`
- **ic_degiskenler**:
  - `o` — `orders` dizisinden `r.order_id` eşleşen sipariş.
  - `code` — sipariş numarası ya da return id’den türetilen gösterim kodu.
  - `timeline` — `getReturnTimeline(r.status)` sonucu.
- **Dönüş**: `JSX.Element` — iade satırı kartı markup’u

--- 

*Not: Fonksiyon isimleri, kod içinde açıkça tanımlı olan adlardan alınmıştır; anonim arrow fonksiyonlar (useEffect callbackleri vb.) için mantıksal bir adlandırma yapılmıştır.*

---

## NODE ID STANDARD

  file: src\views\account\AccountReturnsPage.tsx
  function: src\views\account\AccountReturnsPage.tsx::AccountReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountReturnsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-primary-navy/5`, `bg-red-500`, `bg-slate-100`, `bg-slate-50`, `bg-slate-50/80`, `bg-slate-900/40`, `bg-white`, `border-b`, `border-b-2`, `border-primary-navy`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-t`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `h-1`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${statusClass(r.status`, `${statusFilter`, `${step.completed`, `:`, `===`, `animate-in`, `animate-spin`, `border`, `cancelled`, `duration-200`, `fade-in`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `focus-visible:ring-primary-navy/50`