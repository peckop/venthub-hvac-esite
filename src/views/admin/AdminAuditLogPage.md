---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminAuditLogPage.tsx
skeleton_hash: 70abd3db6590fef6
entity_hashes:
  func:AdminAuditLogPage: 50d17db2bc55805a
  overview: 7ad01a8799bdff81
  style_tokens: d2a1c3bee3a34f52
generated_at: 2026-06-06T21:57:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının yönetici panelinde yer alan denetim günlüğü sayfasını sunan React bileşenidir. Sistem üzerinde gerçekleştirilen kullanıcı ve sistem aktivitelerinin kayıtlarını yetkili yöneticilere görüntüleme arayüzü sağlar. Projenin admin rotaları altında konumlandırılmış olup, yalnızca admin şablonu içinde render edilmek üzere tasarlanmıştır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek sorumluluğu olan yönetici denetim günlüğü sayfasının kullanıcı arayüzünü ve sayfa düzeyindeki işlevselliği tanımlar.
- AdminAuditLogPage

---



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

### [N1_NASIL] AST Pointer: AdminAuditLogPage.tsx::AdminAuditLogPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, UI metinlerini çevirir
  - `lang` — useI18n hook'undan gelen mevcut dil kodu
  - `dragScrollRef` — useDragScroll hook'undan gelen ref nesnesi, sürükleme ile yatay kaydırma için DOM referansı
  - `router` — useRouter hook'undan gelen Next.js yönlendirici nesnesi, sayfa yönlendirmeleri için
  - `rows` — AuditRow[] türünde state, sunucudan çekilen denetim logu satırlarını tutar
  - `loading` — boolean state, veri yükleme durumunu belirtir
  - `error` — string|null türünde state, hata mesajını tutar
  - `total` — number state, toplam log sayısını tutar (sayfalama için)
  - `page` — number state, mevcut sayfa numarasını tutar
  - `q` — string state, arama çubuğuna girilen ham arama sorgusunu tutar
  - `debouncedQ` — string state, debounce uygulanmış arama sorgusunu tutar
  - `fromDate` — string state, filtre için başlangıç tarihini tutar (YYYY-MM-DD formatında)
  - `toDate` — string state, filtre için bitiş tarihini tutar (YYYY-MM-DD formatında)
  - `action` — string state, filtre için aksiyon türünü tutar (INSERT, UPDATE, DELETE, CUSTOM)
  - `batch` — string state, filtre için batch ID'sini tutar
  - `expandedId` — string|null türünde state, genişletilmiş satırın ID'sini tutar
  - `pathname` — usePathname hook'undan gelen mevcut sayfa yolunu tutar
  - `searchParams` — useSearchParams hook'undan gelen URL arama parametrelerini tutar
- **Dönüş**: React.FC (React fonksiyonel component)

### [N2_NASIL] AST Pointer: AdminAuditLogPage.tsx::debounceEffect
- **params**: () — useEffect callback'i olarak çağrılır
- **ic_degiskenler**:
  - `t` — setTimeout sonucu oluşturulan zamanlayıcı ID'si, debounce gecikmesini kontrol eder
- **Dönüş**: void (clearTimeout cleanup fonksiyonu döndürür)

### [N3_NASIL] AST Pointer: AdminAuditLogPage.tsx::fetchLogs
- **params**: () — useCallback ile sarılmış async fonksiyon
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi, filtreler ve sayfalama ile oluşturulur
  - `like` — string, debounce edilmiş arama sorgusunu LIKE operatörü için formatlar
  - `from` — number, sayfalama için başlangıç indeksini hesaplar
  - `to` — number, sayfalama için bitiş indeksini hesaplar
  - `data` — AuditRow[]|null, Supabase'den dönen veri dizisi
  - `error` — any türünde Supabase hatası
  - `count` — number|null, toplam kayıt sayısını döner
  - `e` — Error türünde yakalanan hata nesnesi
- **Dönüş**: Promise<void> (async fonksiyon)

### [N4_NASIL] AST Pointer: AdminAuditLogPage.tsx::searchParamsEffect
- **params**: () — useEffect callback'i olarak çağrılır
- **ic_degiskenler**:
  - `b` — string, searchParams'dan alınan batch parametresinin temizlenmiş hali
- **Dönüş**: void

### [N5_NASIL] AST Pointer: AdminAuditLogPage.tsx::clearBatchHandler
- **params**: () — onClick handler olarak çağrılır
- **ic_degiskenler**:
  - `url` — URL nesnesi, mevcut sayfa URL'sini temsil eder
- **Dönüş**: void

### [N6_NASIL] AST Pointer: AdminAuditLogPage.tsx::renderRow
- **params**: `r` — AuditRow türünde, tek bir denetim log satırı
- **ic_degiskenler**:
  - (ic değişken yok — sadece parametre `r` kullanılır)
- **Dönüş**: JSX.Element (React fragment ve tr elemanları)

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