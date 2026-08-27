---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminDataRequestsTableBody.tsx
skeleton_hash: 1aa10776b8b74d5a
entity_hashes:
  func:AdminDataRequestsTableBody: b5d28b85602c376e
  func:handleAdvance: 7d1914eaa5d3a97e
  func:handleCreate: 9301925a0b42520d
  overview: cd75a37133bf76a3
  style_tokens: b03bd00cd88982c4
generated_at: 2026-08-27T06:51:24Z
---

## Genel Bakış

Bu modül, admin panelinde veri isteklerinin listelendiği tablonun gövde bileşenini sunar. Yeni veri isteği oluşturma ve mevcut istekleri ileri duruma taşıma gibi asenkron işlemleri içerir. Bileşen, tablo satırlarını render ederken bu işlem fonksiyonlarını kullanıcı etkileşimlerine bağlı olarak çağırır.

## Fonksiyon Grupları

### Bileşen ve Görsel Yapı
Ana React bileşeni olarak tablo gövdesini oluşturur ve render eder. `handleCreate` ile `handleAdvance` fonksiyonlarını tanımlayarak kullanıcı etkileşimlerine yanıt verir.
- AdminDataRequestsTableBody

### Veri İstek İşlemleri
Veri isteklerinin oluşturulması ve durumlarının ilerletilmesi gibi asenkron veri işleme görevlerini üstlenir. Her iki fonksiyon da bileşen içinde tanımlanır ve kullanıcı aksiyonları tetiklediğinde çalıştırılır.
- handleCreate, handleAdvance

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri verilmediğinden, `AdminDataRequestsTableBody`, `handleCreate` ve `handleAdvance` fonksiyonlarının doğru çalışması için hangi koşulların gerektiğini belirlemek mümkün değildir. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir.

---

## FONKSİYON DETAYLARI

### AdminDataRequestsTableBody
**Ne yapar**: KVKK talep defterinin tablo gövdesini oluşturan React bileşenidir. Client-mode çalışır; kayıt hacmi düşük, süre sıralaması kritik bir alandır. Varsayılan sıralama `due_at` alanına göre ARTAN şekilde yapılır, böylece en yakın son tarihe sahip kayıtlar üstte görüntülenir.

**Nasıl yapar**: Gecikme durumunu belirlemek için `computeDueState` saf fonksiyonunu kullanır. Bu fonksiyon `due_at` değerini veritabanından okur ve 30 gün hesaplamasını burada YENİDEN YAPMAZ (INV-KVKK-1 R2 kuralı gereği). Bileşen, KVKK veri taleplerinin listelenmesi, sıralanması ve yönetimi için gerekli arayüzü sağlar.

**Parametreler**:
- Parametre almaz (fonksiyon tanımı `def AdminDataRequestsTableBody()` şeklinde parametresizdir)

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür.

### handleCreate
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### handleAdvance
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/types::type { AdminColumn }
- import: ../../components/admin/overlay/AdminModal::AdminModal
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: ../../types/database.types::type { Database }
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/kvkk/dueState::computeDueState
- import: @/lib/kvkk/dueState::isTerminalStatus
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { SupabaseClient }
- import: react::React
- import: react::useCallback
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::fetch fonksiyonu (supabase anonim async)
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `_params` — FetchParams tipinde, kullanılmıyor (alt çizgi ile işaretli)
- **ic_degiskenler**:
  - `data` — supabase sorgusundan dönen satır dizisi; `error` yoksa kullanılır
  - `error` — supabase sorgusundan dönen hata nesnesi; varsa throw ile fırlatılır
  - `rows` — `data ?? []` ifadesiyle null ise boş diziye düşen nihai satır dizisi
- **Dönüş**: `Promise<FetchResult<DataSubjectRequest>>` — `{ rows, totalMatched: rows.length }` nesnesi

### [N2_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::handleCreate
- **params**: yok (arrow function, closure değişkenlerini kullanır)
- **ic_degiskenler**:
  - `email` — state; kullanıcının girdiği e-posta adresi; `.trim()` ile boşlukları temizlenir
  - `saving` — state boolean; işlem sırasında butonu kilitlemek için kontrol edilir
  - `setSaving` — state setter; işlem başlangıcında `true`, bitişinde `false` yapılır
  - `hasWriteAccess` — boolean; `mutateWithAudit` içinde `canWrite` olarak iletilir
  - `reqType` — state; seçilen talep türü (request_type)
  - `identityVerified` — state boolean; kimlik doğrulama durumu
  - `supabaseBrowserClient` — modül seviyesinde tanımlı Supabase istemcisi
  - `t` — i18n çeviri fonksiyonu; toast mesajları için kullanılır
  - `table` — DataTableKit referansı; `.reload()` ile tabloyu yeniler
  - `setCreateOpen` — state setter; modal kapatmak için `false` yapılır
  - `setEmail` — state setter; form temizliği için `''` yapılır
  - `setIdentityVerified` — state setter; form temizliği için `false` yapılır
  - `err` — catch bloğundaki hata nesnesi; `console.error` ile loglanır
- **Dönüş**: yok (yan etki: veritabanına INSERT, toast gösterimi, form sıfırlama, tablo yenileme)

### [N3_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::afterFrom (mutateWithAudit parametresi)
- **params**: `row` — yeni oluşturulan veri nesnesi (createDataSubjectRequest dönüşü)
- **ic_degiskenler**:
  - `row.id` — oluşturulan kaydın birincil anahtarı
  - `row.request_type` — talep türü
  - `row.identity_verified_at` — kimlik doğrulama zaman damgası; `!== null` ile boolean'a dönüştürülür
  - `row.due_at` — son tarih
- **Dönüş**: `{ id, request_type, identity_verified: boolean, due_at }` — denetim izi nesnesi; e-posta bilinçli olarak dahil edilmez

### [N4_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::createDataSubjectRequest fn (mutateWithAudit içindeki fn)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `supabaseBrowserClient` — modül seviyesindeki Supabase istemcisi; birinci argüman olarak iletilir
  - `email` — state; `.trim()` ile temizlenmiş e-posta; `applicant_email` alanına atanır
  - `reqType` — state; seçilen talep türü; `request_type` alanına atanır
  - `identityVerified` — state boolean; `true` ise `new Date().toISOString()`, değilse `null`; `identity_verified_at` alanına atanır
- **Dönüş**: `Promise` (createDataSubjectRequest servis fonksiyonunun dönüşü)

### [N5_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::handleAdvance
- **params**: yok (arrow function, closure değişkenlerini kullanır)
- **ic_degiskenler**:
  - `advanceRow` — state; ilerletilecek satır nesnesi; yoksa fonksiyon erken döner
  - `saving` — state boolean; işlem sırasında butonu kilitlemek için kontrol edilir
  - `setSaving` — state setter; işlem başlangıcında `true`, bitişinde `false` yapılır
  - `nextStatus` — state; hedef durum değeri
  - `outcome` — state; sonuç metni; `.trim()` ile boşlukları temizlenir
  - `retainedNote` — state; saklanan veri notu; `.trim()` ile boşlukları temizlenir
  - `hasWriteAccess` — boolean; `mutateWithAudit` içinde `canWrite` olarak iletilir
  - `t` — i18n çeviri fonksiyonu; toast mesajları için kullanılır
  - `table` — DataTableKit referansı; `.reload()` ile tabloyu yeniler
  - `setAdvanceRow` — state setter; modal kapatmak için `null` yapılır
  - `setOutcome` — state setter; form temizliği için `''` yapılır
  - `setRetainedNote` — state setter; form temizliği için `''` yapılır
  - `target` — `advanceRow`'un yerel kopyası; `target.id` UPDATE işleminde kullanılır
  - `finalizing` — `isTerminalStatus(nextStatus)` dönüşü; nihai durumdaysa outcome zorunlu kılınır
  - `err` — catch bloğundaki hata nesnesi; `console.error` ile loglanır
- **Dönüş**: yok (yan etki: veritabanına UPDATE, toast gösterimi, form sıfırlama, tablo yenileme)

### [N6_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::updateDataSubjectRequest fn (mutateWithAudit içindeki fn)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `supabaseBrowserClient` — modül seviyesindeki Supabase istemcisi; birinci argüman olarak iletilir
  - `target` — `advanceRow` yerel kopyası; `.id` ikinci argüman olarak iletilir
  - `nextStatus` — state; hedef durum; `status` alanına atanır
  - `outcome` — state; `.trim() || null`; `outcome` alanına atanır
  - `retainedNote` — state; `.trim() || null`; `retained_data_note` alanına atanır
- **Dönüş**: `Promise` (updateDataSubjectRequest servis fonksiyonunun dönüşü)

### [N7_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::columns fonksiyonu
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu; sütun başlıkları ve hücre içerikleri için kullanılır
  - `lang` — mevcut dil kodu; `formatDate` fonksiyonuna iletilir
  - `now` — anlık zaman; `computeDueState` fonksiyonuna ikinci argüman olarak iletilir
  - `hasWriteAccess` — boolean; actions sütununda buton görünürlüğünü kontrol eder
  - `computeDueState` — import edilen fonksiyon; satır ve anlık zaman ile hesaplama yapar
  - `formatDate` — tarih biçimlendirme fonksiyonu; `received_at` ve `due_at` için kullanılır
  - `adminTableActionPrimaryClass` — CSS sınıf adı; aksiyon butonuna uygulanır
  - `setAdvanceRow` — state setter; aksiyon butonuna tıklanınca satırı ayarlar
  - `setNextStatus` — state setter; aksiyon butonuna tıklanınca mevcut durumu ayarlar
  - `setOutcome` — state setter; aksiyon butonuna tıklanınca sonucu ayarlar
  - `setRetainedNote` — state setter; aksiyon butonuna tıklanınca notu ayarlar
  - `r` — her hücre fonksiyonundaki satır parametresi (cell callback'lerinde)
  - `due` — `computeDueState(r, now)` dönüşü; `frozen`, `overdue`, `daysLeft` alanları kullanılır
- **Dönüş**: `Array` — sütun tanımları dizisi; her eleman `{ key, header, sortable?, facetAccessor?, hideable?, defaultHidden?, cell }` içerir

### [N8_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::identity_verified_at cell fonksiyonu
- **params**: `r` — satır nesnesi (DataSubjectRequest)
- **ic_degiskenler**:
  - `r.identity_verified_at` — kimlik doğrulama zaman damgası; truthy ise onay ikonu, falsy ise uyarı ikonu gösterilir
  - `t` — i18n çeviri fonksiyonu; `identityVerified` ve `identityMissing` anahtarları için kullanılır
- **Dönüş**: `JSX.Element` — `ShieldCheck` veya `ShieldQuestion` ikonlu metin

### [N9_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::daysLeft cell fonksiyonu
- **params**: `r` — satır nesnesi (DataSubjectRequest)
- **ic_degiskenler**:
  - `r` — satır nesnesi; `computeDueState` fonksiyonuna birinci argüman olarak iletilir
  - `now` — anlık zaman; `computeDueState` fonksiyonuna ikinci argüman olarak iletilir
  - `due` — `computeDueState(r, now)` dönüşü nesne
  - `due.frozen` — boolean; talep dondurulmuşsa `true`
  - `due.overdue` — boolean; süre aşılmışsa `true`
  - `due.daysLeft` — number; kalan gün sayısı; negatif ise mutlak değeri gösterilir
  - `t` — i18n çeviri fonksiyonu; `frozen`, `overdue`, `today`, `remaining` anahtarları için kullanılır
- **Dönüş**: `JSX.Element` — duruma göre `CheckCircle2`, `AlertTriangle` veya `Clock` ikonlu metin

### [N10_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::actions cell fonksiyonu
- **params**: `r` — satır nesnesi (DataSubjectRequest)
- **ic_degiskenler**:
  - `r` — satır nesnesi; onClick içinde state setter'lara iletilir
  - `hasWriteAccess` — boolean; `false` ise buton render edilmez (null döner)
  - `t` — i18n çeviri fonksiyonu; buton etiketi için `advance.title` anahtarı
  - `adminTableActionPrimaryClass` — CSS sınıf adı; butona uygulanır
  - `setAdvanceRow` — state setter; tıklanan satırı ayarlar
  - `setNextStatus` — state setter; `r.status as RequestStatus` değerini atar
  - `setOutcome` — state setter; `r.outcome ?? ''` değerini atar
  - `setRetainedNote` — state setter; `r.retained_data_note ?? ''` değerini atar
- **Dönüş**: `JSX.Element | null` — `hasWriteAccess` true ise buton, değilse null

### [N11_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::onClick (actions içinde)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `r` — dış scope'dan gelen satır nesnesi; state setter'lara değer olarak iletilir
  - `setAdvanceRow` — state setter; `r` nesnesini atar
  - `setNextStatus` — state setter; `r.status` değerini `RequestStatus` tipine cast ederek atar
  - `setOutcome` — state setter; `r.outcome ?? ''` değerini atar
  - `setRetainedNote` — state setter; `r.retained_data_note ?? ''` değerini atar
- **Dönüş**: yok (yan etki: state güncellemeleri, modal açma)

### [N12_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::request_type option fonksiyonu
- **params**: `value` — select option değeri (request_type string)
- **ic_degiskenler**:
  - `value` — option değeri; hem `key` hem `value` attribute'u olarak kullanılır
  - `t` — i18n çeviri fonksiyonu; `admin.dataRequests.types.${value}` anahtarını çözer
- **Dönüş**: `JSX.Element` — `<option>` elemanı

### [N13_NASIL] AST Pointer: AdminDataRequestsTableBody.tsx::status option fonksiyonu
- **params**: `value` — select option değeri (status string)
- **ic_degiskenler**:
  - `value` — option değeri; hem `key` hem `value` attribute'u olarak kullanılır
  - `t` — i18n çeviri fonksiyonu; `admin.dataRequests.statuses.${value}` anahtarını çözer
- **Dönüş**: `JSX.Element` — `<option>` elemanı

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    AdminDataRequestsTableBody_tsx__AdminDataRequestsTableBody["AdminDataRequestsTableBody"]
    AdminDataRequestsTableBody_tsx__handleAdvance["handleAdvance"]
    AdminDataRequestsTableBody_tsx__handleCreate["handleCreate"]
```

## NODE ID STANDARD

  file: src\views\admin\AdminDataRequestsTableBody.tsx
  function: src\views\admin\AdminDataRequestsTableBody.tsx::AdminDataRequestsTableBody
  function: src\views\admin\AdminDataRequestsTableBody.tsx::handleCreate
  function: src\views\admin\AdminDataRequestsTableBody.tsx::handleAdvance

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminDataRequestsTableBody

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-admin-fg`, `text-admin-fg-muted`, `text-error-red`, `text-sm`, `text-success-green`, `text-warning-orange`, `text-xs`
- **Layout:** `block`, `flex`, `gap-1.5`, `gap-2`, `inline`, `inline-flex`, `items-center`, `justify-end`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-medium`, `font-semibold`, `mb-1.5`, `mr-1.5`, `mt-1.5`, `space-y-4`