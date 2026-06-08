---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminAuditLogPage.tsx
skeleton_hash: 1a2e899b84ab1132
entity_hashes:
  func:AdminAuditLogPage: 50d17db2bc55805a
  overview: e5218eb356c499d1
  style_tokens: d2a1c3bee3a34f52
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının yönetici panelinde yer alan denetim günlüğü sayfasını sunan React bileşenidir. Sistem üzerinde gerçekleştirilen kullanıcı ve sistem aktivitelerinin kayıtlarını yetkili yöneticilere görüntüleme arayüzü sağlar. Projenin admin rotaları altında konumlandırılmış olup, yalnızca admin şablonu içinde render edilmek üzere tasarlanmıştır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek sorumluluğu olan yönetici denetim günlüğü sayfasının kullanıcı arayüzünü ve sayfa düzeyindeki işlevselliği tanımlar.
- AdminAuditLogPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Verilen bilgiler (fonksiyon imzası, sabitler ve eski dokü

---

## FONKSİYON DETAYLARI

### AdminAuditLogPage
**Ne yapar**: VentHub HVAC projesinin admin paneline ait sistem denetim günlükleri (audit log) sayfasını oluşturan React bileşenidir. Yalnızca yetkili yönetici kullanıcıların erişebildiği bu sayfa, platform üzerinde gerçekleştirilen tüm kullanıcı ve sistem aktivitelerinin kaydedildiği günlükleri görüntülemek amacıyla tasarlanmıştır. Projenin admin rotaları altında çağrılarak yönetici kullanıcıların karşısına denetim kayıtları arayüzünü çıkarır.
**Nasıl yapar**: TypeScript ile yazılmış bir React fonksiyonel bileşeni olarak tanımlanmış, projenin src/views/admin dizini altında yer alan AdminAuditLogPage.tsx dosyasında barınmaktadır. React rota yönetim sistemi tarafından tetiklendiğinde ana admin şablonu içine yerleştirilerek ekrana render edilir, kendi iç yapısında gerekli veri yönetimi ve arayüz düzenleme işlemlerini yürüterek denetim kayıtlarını kullanıcıya sunar.
**Parametreler**: Herhangi bir giriş parametresi almaz, standart React sayfa bileşeni olarak rota sistemi tarafından çağrılır, tüm ihtiyaç duyduğu verileri ve bağlamları içindeki araçlar ve servisler aracılığıyla kendi bünyesinde karşılar.
**Dönüş**: React.FC türünde bir değer döndürür. Bu dönen değer, React tarafından işlenerek DOM'a eklenmek üzere hazırlanmış, denetim günlükleri sayfasının kullanıcı arayüzünü oluşturan React fonksiyonel bileşen instance'ıdır.

---

## INTERFACES

### AuditRow
- `id: string`
- `at: string`
- `actor: string | null`
- `table_name: string`
- `row_pk: string | null`
- `action: string`
- `comment: string | null`
- `before: unknown`
- `after: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\admin\AdminAuditLogPage.tsx::AdminAuditLogPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, UI metinlerini uluslararasılaştırma için kullanılır
  - `lang` — `useI18n()` hook'undan gelen dil kodu, `formatDateTime` fonksiyonuna tarih formatı için传递 edilir
  - `dragScrollRef` — `useDragScroll<HTMLDivElement>()` hook'undan dönen ref, yatay kaydırılabilir tablo konteynerine bağlanır
  - `router` — `useRouter()` hook'undan gelen Next.js yönlendirme nesnesi, URL manipülasyonu ve navigasyon için kullanılır
  - `rows` — `AuditRow[]` tipinde state, Supabase'den çekilen denetim kayıtlarını tutar
  - `loading` — `boolean` tipinde state, veri yükleme durumunu gösterir (skeleton gösterilip gösterilmeyeceğini belirler)
  - `error` — `string | null` tipinde state, hata mesajını tutar, varsa ekranda rose renkli bant olarak gösterilir
  - `total` — `number` tipinde state, filtrelenmiş toplam kayıt sayısını tutar, sayfalama hesaplamalarında kullanılır
  - `page` — `number` tipinde state, aktif sayfa numarasını tutar, varsayılan 1
  - `q` — `string` tipinde state, arama kutusunun ham değerini tutar (debounce öncesi)
  - `debouncedQ` — `string` tipinde state, 300ms debounce sonucu oluşmuş arama terimini tutar, API sorgusunda kullanılır
  - `fromDate` — `string` tipinde state, başlangıç tarih filtresi (YYYY-MM-DD formatında input'tan gelir)
  - `toDate` — `string` tipinde state, bitiş tarih filtresi (YYYY-MM-DD formatında input'tan gelir)
  - `action` — `string` tipinde state, seçilen aksiyon filtresi (INSERT/UPDATE/DELETE/CUSTOM)
  - `batch` — `string` tipinde state, batch ID filtresi, URL search params'dan okunur
  - `pathname` — `usePathname()` hook'undan gelen mevcut URL yolu, `fetchLogs` yeniden çağrıldığında tetikleyici olarak kullanılır
  - `searchParams` — `useSearchParams()` hook'undan gelen URL parametreleri, `batch` parametreini okumak için kullanılır
  - `expandedId` — `string | null` tipinde state, detayı genişletilmiş satırın ID'sini tutar
- **Dönüş**: JSX — AdminAuditLogPage bileşeninin render ettiği JSX yapısı (header, filtre bannerı, toolbar, tablo, pagination, hata bantı)

---

## NODE ID STANDARD

  file: src\views\admin\AdminAuditLogPage.tsx
  function: src\views\admin\AdminAuditLogPage.tsx::AdminAuditLogPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAuditLogPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/5`, `bg-black/40`, `bg-cyan-400/3`, `bg-cyan-500/10`, `bg-emerald-500/10`, `bg-rose-500/10`, `bg-rose-500/5`, `bg-slate-500/10`, `bg-surface-deep/40`, `bg-surface-deep/60`, `bg-transparent`, `bg-white/2`, `border-amber-500/20`, `border-cyan-500/20`, `border-emerald-500/20`
- **Layout:** `!h-10`, `!h-8`, `!p-0`, `!w-10`, `flex`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `items-center`, `justify-between`, `justify-center`, `max-w-xs`, `overflow-hidden`, `overflow-x-auto`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `focus-within:`, `group-focus-within:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `!bg-white/5`, `!border-white/10`, `!px-3`, `!rounded-xl`, `$`, `${adminButtonSecondaryClass`, `${adminTableActionClass`, `${adminTableCellClass`, `${expandedId`, `:`, `===`, `DELETE`, `INSERT`, `UPDATE`, `animate-in`