---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\inventory\report\page.tsx
skeleton_hash: a90c7fedc66c4a2a
entity_hashes:
  func:InventoryReportPage: bfcc8ccf4dbc326a
  overview: 186bde0cd4ca9cee
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-27T17:59:05Z
---

## Genel Bakış
Bu modül, yönetim panelindeki envanter rapor sayfasının ana giriş noktasıdır. Tek bir fonksiyon, sayfanın üst düzey bileşenini dinamik olarak yükleyip render eder, böylece raporların listesi, grafikleri ve filtreleme seçenekleri tek bir sayfada birleşir.

## Fonksiyon Grupları
### Sayfa Render ve Bileşen Yönlendirme
Bu grup, rapor sayfasının kök bileşenini tanımlar ve asıl görünüm katmanına (view) yönlendirme yaparak sayfa içeriğini kullanıcıya sunar.  
- InventoryReportPage

---

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InventoryReportPage
**Ne yapar**: `InventoryReportPage` bileşenini render eder ve `<AdminInventoryReportPage />` JSX elemanını döndürür. Bu sayede yönetim panelindeki envanter raporu sayfası görüntülenir.  

**Nasıl yapar**: Fonksiyon, React fonksiyonel bileşeni olarak tanımlanmıştır; içinde tek bir return ifadesi bulunur ve doğrudan `AdminInventoryReportPage` bileşenini JSX olarak döndürür.  

**Parametreler**:  
- *Hiç yok* — Fonksiyon parametre almaz; sabit bir bileşen döndürür.  

**Dönüş**:  
- `JSX.Element` — `<AdminInventoryReportPage />` bileşenini temsil eden JSX elemanı.

---

## SABİTLER
- **AdminInventoryReportPage** (call) — `dynamic(
  () => import('../../../../views/admin/AdminInventoryReportPage'),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\inventory\report\page.tsx::InventoryReportPage
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (React bileşeni `<AdminInventoryReportPage />` döndürür)

---

## NODE ID STANDARD

  file: src\app\admin\inventory\report\page.tsx
  function: src\app\admin\inventory\report\page.tsx::InventoryReportPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryReportPage

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