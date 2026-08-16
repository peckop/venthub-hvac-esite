---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\app\admin\quotes\page.tsx
skeleton_hash: 37d6aa080da39cfd
entity_hashes:
  func:Loading: 657ee72781ec51d8
  func:Page: 21a709ac71299cff
  overview: 5b1a16aab3aba293
  style_tokens: f00e706f0d7166cc
generated_at: 2026-08-16T11:35:26Z
---

## Genel Bakış

Bu modül, admin paneli içindeki teklifler (quotes) yönetimi sayfasını tanımlayan bir Next.js sayfa bileşenidir. Modül, sayfa yüklenirken gösterilecek durum ekranı ve asıl sayfa içeriğini render eden iki ana bileşenden oluşur.

## Fonksiyon Grupları

### Sayfa Bileşenleri
Modül, admin panelindeki teklif listeleme ve yönetim sayfasını oluşturur.
- Loading, Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül minimal bir Next.js sayfa yapısından oluşmaktadır. Aşağıda yalnızca verilen fonksiyon imzaları ve modül sabitlerine dayalı varsayımlar listelenmektedir.

---

**[Aksiyom 1]:** Eğer `AdminQuotesPage` modülü (bileşeni) import edilebilir konumda (module path) değilse, `Page()` bileşeni render edilemez ve uygulama hata verir.

**[Aksiyom 2]:** Eğer `Page()` bileşeni çağrıldığında `AdminRecipesPage` bileşeni bir React/JSX bileşeni değilse (örn: undefined, null veya geçersiz bir modül), React render hatası oluşur.

**[Aksiyom 3]:** Eğer Next.js runtime `loading.tsx` dosyasını desteklemiyorsa, `Loading()` bileşeni asla tetiklenmez ve sayfa yükleme durumunda kullanıcıya geri bildirim verilmez.

**[Aksiyom 4]:** Bu modül, `/admin/quotes` route'u altında çalışmaktadır; eğer Next.js router yapısı bu path'i yönlendirmiyorsa, `Page()` bileşeri hiçbir zaman erişilebilir olmaz.

---

> **Not:** Bu modüldeki `Page()` ve `Loading()` fonksiyonlarının gövdesinde herhangi bir logic, prop, state veya API çağrısı tespit edilememiştir. Dolayısıyla fonksiyonel aksiyomlar (veri bağımlılığı, eşik değerleri, kabul kriterleri vb.) üretilememiştir. Modülün mevcut durumu, yalnızca `AdminRecipesPage` bileşenini sarman (wrap) basit bir yer tutucu (placeholder) yapıdadır.

---

## FONKSİYON DETAYLARI

### Loading
**Ne yapar**: Bu fonksiyon, bir React "Yükleniyor" (Loading) durumunu temsil eden bir bileşendir. Kullanıcı arayüzünde asenkron bir işlem (veri çekme gibi) sırasında geçici bir gösterge veya mesaj sunar.
**Nasıl yapar**: Fonksiyon, React'te tanımlanmış fonksiyonel bir bileşendir. `use client` yönergesi ile işaretlenmiş olup, istemci tarafında (tarayıcıda) çalışacak dinamik bir bileşendir. Fonksiyon gövdesi boş olsa da, Next.js'in dinamik segmentleri için otomatik olarak tanımlanmış bir yüklenme arayüzü bileşenidir ve çağrı yerinde JSX ile bir yükleme göstergesi (spinner, metin vb.) render etmesi beklenir.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `JSX.Element` — Bileşenin render ettiği yükleme arayüzü JSX yapısını döndürür.

### Page
**Ne yapar**: Bu fonksiyon, `/admin/quotes` rotasının temel sayfa bileşenidir. Sayfanın tamamını sarmalayan ve içeriği oluşturan üst düzey yapıdır.
**Nasıl yapar**: Fonksiyon, doğrudan `AdminQuotesPage` adlı bileşeni döndüren bir React kaplayıcı (wrapper) bileşendir. Next.js sayfa yönlendirmesi mantığıyla çalışır ve rotanın ana içeriğini render eder. Gövdesi basit bir bileşen dönüşümüdür.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `JSX.Element` — `AdminQuotesPage` bileşeninin oluşturduğu tüm sayfa içeriğini (JSX) döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **AdminQuotesPage** (call) — `nextDynamic(
  () => import('../../../views/admin/quotes/AdminQuotesPage'),
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/quotes/page.tsx::Loading
- **params**: ()
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan elde edilen çeviri fonksiyonu; `t('admin.common.loading')` çağrısıyla yüklenme metnini döner
- **Dönüş**: JSX — `className="p-8 text-center text-slate-400 animate-pulse"` özellikli div, içeriğinde `t('admin.common.loading')` çevirisi; pulse animasyonlu loading göstergesi

### [N2_NASIL] AST Pointer: src/app/admin/quotes/page.tsx::Page
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<AdminQuotesPage />` bileşeninin render edilmesi; AdminQuotesPage'i Next.js dynamic import ile sarılmış olarak döner

---

## NODE ID STANDARD

  file: src\app\admin\quotes\page.tsx
  function: src\app\admin\quotes\page.tsx::Loading
  function: src\app\admin\quotes\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Loading
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