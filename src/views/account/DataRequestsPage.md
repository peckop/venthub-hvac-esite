---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\account\DataRequestsPage.tsx
skeleton_hash: 639b6c8851b7cec0
entity_hashes:
  func:DataRequestsPage: a91b40fa1a74fd39
  func:handleSubmit: 460293fdfa9263b6
  overview: 2513cf2ef74b5f92
  style_tokens: 5b0dfe7c560b99c6
generated_at: 2026-08-27T06:50:17Z
---

## Genel Bakış
Bu modül, kullanıcıların veri taleplerini iletebildikleri bir hesap sayfasıdır. Bir form aracılığıyla talep gönderimini yönetir. React fonksiyonel bileşeni olarak yapılandırılmıştır.

## Fonksiyon Grupları

### Sayfa Bileşeni ve Form Yönetimi
Ana sayfa bileşeni, veri talepleri formunu görüntüler ve kullanıcı etkileşimlerini yönlendirir. Form gönderimi sırasında asenkron işlem gerçekleştirilir.
- DataRequestsPage, handleSubmit

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığından, modülün doğru çalışması için gerekli koşullar belirlenememektedir. Yalnızca fonksiyon imzaları (`DataRequestsPage` ve `handleSubmit`) mevcut olup, bunlar davranışsal çıkarım için yeterli değildir.

---

## FONKSİYON DETAYLARI

### DataRequestsPage
**Ne yapar**: KVKK başvuru kanalı olarak hizmet eden sayfa bileşenidir. Veri sahibinin kendi verilerine erişim, düzeltme, silme gibi haklarını kullanabilmesi için bir form yüzü sunar. T063 PR-2 kapsamında tanımlanmış olup, uygunluk cetveli `legal-compliance-standard.md §3.6` olarak belirlenmiştir.

**Nasıl yapar**: Bileşen, iki şeyi bilinçli olarak içermez: "Hesabımı sil" düğmesi yoktur — bu kasıtlı bir eksikliktir çünkü §3.1'e göre bu hukuki bir zorunluluk değildir ve teknik olarak tam silme değil anonimleştirme işlemidir; yanlış yazılmış bir düğme mevzuata aykırı kayıt oluşturabilir. Bileşen `React.FC` tipinde bir fonksiyon bileşeni olarak tanımlanmıştır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür.

### handleSubmit
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../i18n/datetime::formatDate
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/kvkk/dueState::computeDueState
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::AlertCircle
- import: lucide-react::Clock
- import: lucide-react::Loader2
- import: lucide-react::Send
- import: lucide-react::ShieldCheck
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/DataRequestsPage.tsx::DataRequestsPage
- **params**: yok
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu; metinleri dile göre çevirir
  - `lang` — useI18n hook'undan gelen dil kodu; formatDate fonksiyonuna parametre olarak geçilir
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi; `user.email` ve `user.id` alanlarına erişilir
  - `rows` — useState ile tutulan DataSubjectRequest dizisi; kullanıcının veri taleplerini barındırır
  - `setRows` — rows state'ini güncelleyen setter fonksiyonu
  - `loading` — useState ile tutulan boolean; veri yükleme durumunu belirtir
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `reqType` — useState ile tutulan seçili talep türü; varsayılan değeri `'access'`
  - `setReqType` — reqType state'ini güncelleyen setter fonksiyonu; select onChange'de kullanılır
  - `sending` — useState ile tutulan boolean; form gönderimi sırasında true olur
  - `setSending` — sending state'ini güncelleyen setter fonksiyonu
  - `refresh` — useCallback ile tanımlanmış async fonksiyon; `listDataSubjectRequests` çağırarak rows'u günceller, bağımlılığı `[t]`
  - `handleSubmit` — useCallback ile tanımlanmış async fonksiyon; form submit olayını işler
  - `now` — `new Date()` ile oluşturulan anlık tarih nesnesi; `computeDueState` fonksiyonuna ikinci argüman olarak geçilir
- **Dönüş**: JSX elementi (sayfa düzenini oluşturan React bileşeni)

### [N2_NASIL] AST Pointer: src/views/account/DataRequestsPage.tsx::refresh
- **params**: yok
- **ic_degiskenler**:
  - `data` — `listDataSubjectRequests(supabaseBrowserClient)` çağrısından dönen DataSubjectRequest dizisi; `setRows(data)` ile rows state'ine atanır
  - `e` — catch bloğunda yakalanan hata nesnesi; `console.error` ile loglanır
- **Dönüş**: yok (void); yan etkisi: `setLoading` ve `setRows` state güncellemeleri, hata durumunda `toast.error` çağrısı

### [N3_NASIL] AST Pointer: src/views/account/DataRequestsPage.tsx::handleSubmit
- **params**: `e` — React.FormEvent; form submit olayı nesnesi
- **ic_degiskenler**:
  - `email` — `user?.email` ile elde edilen kullanıcı e-posta adresi; yoksa `toast.error` ile hata gösterilir ve fonksiyondan çıkılır
  - `err` — catch bloğunda yakalanan hata nesnesi; `console.error` ile loglanır
- **Dönüş**: yok (void); yan etkisi: `createDataSubjectRequest` çağrısı, `toast.success`/`toast.error` bildirimleri, `refresh()` çağrısı, `setSending` state güncellemesi

### [N4_NASIL] AST Pointer: src/views/account/DataRequestsPage.tsx::(value) => (REQUEST_TYPES.map callback)
- **params**: `value` — REQUEST_TYPES dizisindeki her bir talep türü string değeri
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (`<option>`); `key` ve `value` olarak `value` kullanılır, içeriği `t('account.dataRequests.types.${value}')` çeviri çağrısıdır

### [N5_NASIL] AST Pointer: src/views/account/DataRequestsPage.tsx::(r) => (rows.map callback)
- **params**: `r` — DataSubjectRequest nesnesi; rows dizisindeki her bir veri talebini temsil eder
- **ic_degiskenler**:
  - `due` — `computeDueState(r, now)` çağrısından dönen nesne; `due.frozen`, `due.overdue`, `due.daysLeft` alanlarına erişilir
- **Dönüş**: JSX elementi (`<li>`); talep türü, alınma tarihi, durum etiketi, kalan gün/gecikme/finalize bilgisi, `r.outcome` ve `r.retained_data_note` alanlarını koşullu olarak görüntüler

---

## NODE ID STANDARD

  file: src\views\account\DataRequestsPage.tsx
  function: src\views\account\DataRequestsPage.tsx::DataRequestsPage
  function: src\views\account\DataRequestsPage.tsx::handleSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: DataRequestsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-md`, `rounded-hvac-sm`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/20`, `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-l-2`, `border-light-gray`, `border-primary-navy`, `hover:bg-secondary-blue`, `text-2xl`, `text-center`, `text-error-red`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`
- **Layout:** `block`, `flex`, `gap-1.5`, `gap-2`, `gap-3`, `h-6`, `inline-flex`, `items-center`, `items-start`, `justify-between`, `justify-center`, `max-w-3xl`, `min-w-0`, `p-4`, `p-6`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `mb-1`, `mb-1.5`, `mb-3`, `mb-4`, `mb-6`