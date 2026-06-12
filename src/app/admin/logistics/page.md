---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\logistics\page.tsx
skeleton_hash: ae8daa961131c5fc
entity_hashes:
  func:LogisticsPage: 70696f052bf11390
  overview: 08b82d6ebca3f7e4
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:53:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC yöneticilerinin lojistik operasyonlarını izlemek ve yönetmek için kullandığı web sayfasının giriş noktasıdır. Tek bileşenli bir yapıya sahip olup, asıl lojistik arayüzünü ve işlevselliğini barındıran `AdminLogisticsPage` alt bileşenini doğrudan sunarak sayfayı render eder. Sayfa, Next.js App Router yapısında çalışır ve yönetici panelindeki lojistik bölümüne erişim sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Yönetim panelindeki lojistik sayfasının üst düzey yapısını oluşturur ve kullanıcıya sunar.
- LogisticsPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için yalnızca fonksiyon imzası ve modül sabitleri temelinde çıkarılabilen sınırlı aksiyomlar tanımlanmıştır. Fonksiyon gövdesi sağlandığında aksiyomlar güncellenebilir.

**[Aksiyom 1]**: Eğer `AdminLogisticsPage` modülü veya bileşeni yoksa veya import edilemezse, `LogisticsPage` bileşeni düzgün render edilemez.

---

## FONKSİYON DETAYLARI

### LogisticsPage
**Ne yapar**: `LogisticsPage` bileşenini render eder ve `<AdminLogisticsPage />` JSX elemanını döndürür. Bu sayede yönetim panelindeki lojistik sayfası kullanıcıya sunulur.  

**Nasıl yapar**: Fonksiyon, hiçbir parametre almaz ve doğrudan JSX ifadesi `<AdminLogisticsPage />`'i return eder. React'in fonksiyonel bileşen yapısını kullanarak, bileşenin kendisi bir React elementidir.  

**Parametreler**:
- *Yok* — Fonksiyon parametre almaz.

**Dönüş**: JSX element (`<AdminLogisticsPage />`) – React tarafından işlenen bir `ReactElement` tipindedir.

---

## SABİTLER
- **AdminLogisticsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminLogisticsPage'),
  {...`

---

## NODE ID STANDARD

  file: src\app\admin\logistics\page.tsx
  function: src\app\admin\logistics\page.tsx::LogisticsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: LogisticsPage

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