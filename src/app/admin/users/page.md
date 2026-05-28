---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\users\page.tsx
skeleton_hash: a1d1d34ac76683eb
entity_hashes:
  func:Page: c68e4a7cc2b89422
  overview: 3abd4459140e249f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-28T22:35:15Z
---

## Genel Bakış
Bu modül, yönetim panelindeki kullanıcı yönetimi sayfasının Next.js App Router üzerindeki giriş noktasıdır. Tek bir React bileşeni olan Page fonksiyonu, istemci tarafında dinamik olarak yüklediği AdminUsersPage görünümünü render ederek kullanıcı listeleme ve yönetim arayüzünü sunar.

## Fonksiyon Grupları
### Sayfa Giriş Noktası (Route Entry Point)
Bu grup, ilgili rotanın yükleyicisi olarak görev yapar. Modülün tek dışa aktarımı olan Page fonksiyonu, kullanıcı yönetimi arayüzünü tarayıcıya taşımak için ilgili UI bileşenini yükleyip render eder.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için belirgin fonksiyon gövdesi kodu sağlanmadığından, yalnızca mevcut fonksiyon imzası ve modül sabitleri referansıyla desteklenebilen minimal varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `AdminUsersPage` modülü import edilemez veya yüklenemez (örn. dosya yolu kırık, bağımlılık eksik) ise, `Page` bileşeni render hata verir veya boş sayfa döner.

[Aksiyom 2]: Eğer Next.js App Router yapısı veya `src/app/admin/users/page.tsx` dosya yolu değiştirilirse, bu sayfa route üzerinden erişilemez hale gelir.

[Aksiyom 3]: Eğer `AdminUsersPage` bileşeni `{ ssr: false }` seçeneğiyle dinamik import yapılıyorsa, client-side rendering zorunludur ve tarayıcı olmadan bileşen içeriği render edilemez.

[Aksiyom 4]: Eğer `Page` fonksiyonu parametre almıyorsa (mevcut imza: `Page()`), route parametreleri veya search params bu bileşen düzeyinde doğrudan erişilebilir değildir; gerekirse ilgili veriler `AdminUsersPage` içinde veya higher-order bileşen aracılığıyla sağlanmalıdır.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Admin kullanıcı yönetim sayfasını render eden üst seviye bir Next.js sayfa bileşenidir. Bu fonksiyon, tarayıcıda `/admin/users` rotasına erişildiğinde çağrılır ve kullanıcı arayüzünün başlangıç noktasını oluşturur.

**Nasıl yapar**: Fonksiyon, herhangi bir mantıksal işlem yapmadan doğrudan `AdminUsersPage` bileşenini döndürür. Bu yapı, Next.js App Router mimarisinde sayfa bileşenlerinin standart kalıbına uygun olarak tasarlanmıştır ve sorumlulukları ayrı tutarak modülerlik sağlar.

**Parametreler**:
- Parametre almamaktadır.

**Dönüş**: `JSX.Element` — `AdminUsersPage` React bileşenini içeren JSX yapısı döndürür.

---

## SABİTLER
- **AdminUsersPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminUsersPage'),
  { ssr: fa...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/users/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `AdminUsersPage` bileşeninin JSX'i

---

## NODE ID STANDARD

  file: src\app\admin\users\page.tsx
  function: src\app\admin\users\page.tsx::Page

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