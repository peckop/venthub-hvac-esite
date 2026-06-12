---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\audit-logs\page.tsx
skeleton_hash: e4fefe528f4949f7
entity_hashes:
  func:Page: fd2706f7cd85c29f
  overview: 2907a29989d3f1d8
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-08T10:08:11Z
---

## Genel Bakış
Bu modül, yönetim panelindeki denetim günlükleri sayfasının giriş noktasıdır. Next.js'in dinamik import özelliğini kullanarak asıl sayfa bileşenini istemci tarafında tembel (lazy) yükler ve `/admin/audit-logs` rotasını sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Root bileşeni tanımlar ve dinamik yükleme ile asıl sayfa içeriğini render eder. Yönetim panelinin ilgili rotasına karşılık gelen sarmalayıcı sayfa yapısını oluşturur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Next.js uygulamasında bir admin sayfası için üst seviye bir React bileşenidir.

[Aksiyom 1]: Eğer Next.js runtime ortamında dinamik import (next/dynamic) desteği yoksa, modülün ana sayfa içeriği (`AdminAuditLogsPage`) yüklenemez ve sayfa boş kalır.
[Aksiyom 2]: Eğer React Suspense bileşeni için bir fallback (yükleniyor durumu) bileşeni tanımlı değilse, asıl sayfa içeriği yüklenirken kullanıcıya boş veya hatalı bir ekran gösterilir.
[Aksiyom 3]: Eğer modül, `/admin/audit-logs` rotası için doğru bir sayfa bileşeni olarak (Next.js App Router yapısında) yapılandırılmamışsa, bu rotaya erişildiğinde 404 hatası veya beklenmeyen bir sayfa görüntülenir.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, admin denetim kayıtları (audit logs) sayfasının üst seviye React bileşenidir. Asıl sayfa içeriğini Suspense ile sararak yükleme durumunda kullanıcıya animasyonlu bir loading göstergesi sunar.

**Nasıl yapar**: Fonksiyon, `useI18n` hook'u aracılığıyla çoklu dil desteği sağlayan çeviri fonksiyonunu alır. Ardından React'in `Suspense` bileşenini kullanarak `AdminAuditLogsPage` bileşenini sarar. Veri yüklenirken fallback olarak animasyonlu bir loading div'i gösterir; bu div, `animate-pulse` sınıfı sayesinde soluk bir animasyon efekti oluşturur ve `common.loading` çeviri anahtarı ile kullanıcının diline uygun "Yükleniyor" mesajını display eder.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz. Next.js App Router yapısında otomatik olarak sayfa bileşeni olarak yüklenir.

**Dönüş**: `JSX.Element` — Suspense sarmalayıcısı içinde sarılmış `AdminAuditLogsPage` bileşenini döndürür. Yükleme sırasında fallback UI (animasyonlu loading div'i) render edilir.

---

## SABİTLER
- **AdminAuditLogsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminAuditLogPage'),
  { ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/audit-logs/page.tsx::Page
- **params**: parametre yok
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, 'common.loading' gibi anahtarlarla metin çevirisi yapar
- **Dönüş**: JSX element (React Suspense bileşeni, AdminAuditLogsPage'ı sarar, yüklenme durumunda fallback gösterir)

---

## NODE ID STANDARD

  file: src\app\admin\audit-logs\page.tsx
  function: src\app\admin\audit-logs\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`