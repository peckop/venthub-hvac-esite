---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminAuditLogPage.tsx
skeleton_hash: e74a330a9f326f55
entity_hashes:
  func:AdminAuditLogPage: 8228aa5d40a8a979
  overview: 83860b5a121fa408
  style_tokens: a7fe3ab3ca0c1259
generated_at: 2026-06-13T18:03:10Z
---

## Genel Bakış
VentHub HVAC uygulamasının yönetici panelinde yer alan denetim günlüğü sayfasını sunan React bileşenidir. Sistem üzerinde gerçekleştirilen kullanıcı ve sistem aktivitelerinin kayıtlarını yetkili yöneticilere görüntüleme arayüzü sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek sorumluluğu olan yönetici denetim günlüğü sayfasının kullanıcı arayüzünü ve sayfa düzeyindeki işlevselliği tanımlar.
- AdminAuditLogPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Verilen fonksiyon gövdesi bulunmamaktadır; yalnızca fonksiyon imzası (`AdminAuditLogPage() -> React.FC`) mevcuttur. Mimari varsayımların üretilmesi için fonksiyon gövdesindeki kod yapısına, bağımlılıklara, koşullara veya hata yönetimine ilişkin bilgilere ihtiyaç vardır. Mevcut bilgilerle üretilen aksiyomlar spekülatif olur ve bu durum aksiyomların güvenilirliğini zedeleyeceğinden, modül için aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminAuditLogPage
**Ne yapar**: Bu fonksiyon, uygulamanın admin denetim kayıtları sayfasını.render eder. Denetim kayıtlarını (admin_audit_log) DataTableKit kullanarak server-mode'da gösteren bir sayfa oluşturur.

**Nasıl yapar**: Sayfa, bir başlık ve Suspense bileşeni içerir. Veri, URL parametreleri ve filtre durumu AuditLogTableBody bileşeni tarafından useAdminTable özel kancasıyla yönetilir. useSearchParams kancası Suspense ile sarılmıştır, bu da CLAUDE.md kuralı 5 / K2'ye uygun şekilde yükleme durumlarının doğru işlenmesini sağlar.

**Parametreler**: Bu fonksiyon parametre almaz.

**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Bu bileşen, denetim kayıtları sayfasının tamamını temsil eder ve Suspense ile sarılmış bir yapıda veri yüklemeyi yönetir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\admin\AdminAuditLogPage.tsx::AdminAuditLogPage
- **params**: (yok)
- **ic_degiskenler**: 
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, JSX içinde admin sayfası başlık ve alt başlık metinlerini çevirmek için kullanılır (admin.titles.audit ve admin.audit.subtitle anahtarları ile)
- **Dönüş**: JSX elementi — Admin denetim günlükleri sayfasını render eden React bileşeni, Suspense ile sarılmış AuditLogTableBody içeren bir div döndürür

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
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `pb-20`, `space-y-4`