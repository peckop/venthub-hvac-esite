---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\page.tsx
skeleton_hash: 7f5ef772188d041e
entity_hashes:
  func:Page: e310741650765783
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:54:06Z
---

## Genel Bakış
Bu modül, yönetim panelinin ana sayfasını oluşturan bir React bileşenini tanımlar. Next.js App Router yapısı içinde yer alarak `/admin` rotasına karşılık gelir ve sayfanın temel düzenini sağlar. Bileşen, ilgili alt bileşenleri bir araya getirerek yönetim arayüzünü kullanıcıya sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bu grup, admin panelinin ana sayfasını render ederek kullanıcı arayüzünü sunmaktan sorumludur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, parametresiz bir React sayfa bileşeni olup `AdminDashboardPage` modülünü çağırmaktadır. Doğru çalışması için aşağıdaki koşulların sağlanması gerekir.

[Aksiyom 1]: Eğer `AdminDashboardPage` modülü içe aktarılmamış ya da tanımlı değilse, `Page` fonksiyonu çalıştırıldığında **`ReferenceError`** oluşur.

[Aksiyom 2]: Eğer `AdminDashboardPage` bileşeni React elementi döndürmek yerine `undefined` ya da geçersiz bir değer döndürürse, `Page` fonksiyonu çalıştırıldığında **React render hatası** oluşur.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, Next.js App Router yapısında admin sayfasının ana giriş noktasıdır. `<AdminDashboardPage />` bileşenini render ederek admin panosunu görüntüler.

**Nasıl yapar**: Herhangi bir parametre almaz; doğrudan `return <AdminDashboardPage />` ifadesiyle JSX öğesini döndürür. Sayfanın sunucu veya istemci tarafında render edilmesini sağlar.

**Parametreler**:
- Fonksiyon parametre almaz.

**Dönüş**: `JSX.Element` türünde bir React bileşeni döndürür. Özel olarak `<AdminDashboardPage />` değerini döner.

---

## SABİTLER
- **AdminDashboardPage** (call) — `nextDynamic(
  () => import('../../views/admin/AdminDashboardPage'),
  { ss...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `AdminDashboardPage` bileşenini render eder; dinamik olarak `next/dynamic` ile import edilmiş `AdminDashboardPage` çağrısı
- **Yan Etkiler**: Yok — saf render fonksiyonu

---

## NODE ID STANDARD

  file: src\app\admin\page.tsx
  function: src\app\admin\page.tsx::Page

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