---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\logistics\page.tsx
skeleton_hash: 517c236f99fadd9e
entity_hashes:
  func:LogisticsPage: 70696f052bf11390
  overview: ab1d59ecc97d7bb1
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-28T22:35:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC yöneticilerinin lojistik operasyonlarını izlemek ve yönetmek için kullandığı web sayfasının giriş noktasıdır. Tek bileşenli bir yapısı olup, asıl lojistik arayüzünü ve işlevselliğini içeren bir alt bileşeni (`AdminLogisticsPage`) yükleyerek sayfayı sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
- Yönetici panelindeki lojistik sayfasının üst düzey bileşenini oluşturur ve render eder.
  - LogisticsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzası ve modül sabitleri temelinde çıkarılabilen sınırlı aksiyomlar tanımlanmıştır. Fonksiyon gövdesi sağlandığında aksiyomlar güncellenebilir.

**[Aksiyom 1]**: Eğer `AdminLogisticsPage` bileşeni modül kapsaminda tanımlı veya import edilmiş değilse, `LogisticsPage` bileşeni çağrıldığında `ReferenceError` veya `undefined` hata durumu oluşur ve sayfa render edilemez.

**[Aksiyom 2]**: Eğer `LogisticsPage` fonksiyonu parametresiz (`()`) olarak tanımlıysa ve bir React bileşeniyse, çağrıldığı bağlamda (`page.tsx` – Next.js App Router) bir React JSX/Element döndürmesi gerekir; aksi halde React render hatası oluşur.

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
- **AdminLogisticsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminLogisticsPage'),
  { ssr...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\logistics\page.tsx::LogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (`<AdminLogisticsPage />`) – React bileşeni olarak `AdminLogisticsPage` bileşenini render eder.

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