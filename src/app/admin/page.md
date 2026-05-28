---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\page.tsx
skeleton_hash: abafacd2feb2ac3d
entity_hashes:
  func:Page: e310741650765783
  overview: 3abd4459140e249f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-28T22:35:01Z
---

## Genel Bakış
Bu modül, yönetim panelinin ana sayfasını oluşturan React bileşenini tanımlar. Sayfanın temel düzenini sağlar ve ilgili alt bileşenleri bir araya getirerek kullanıcılara yönetim işlevlerine erişim imkanı sunar.

## Fonksiyon Grupları
### Sayfa Render Grubu
Bu grup, admin panosunun ana sayfasını render ederek kullanıcı arayüzünü sunmaktan sorumludur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Next.js App Router içinde bir sayfa bileşeni olarak çalıştığı için aşağıdaki koşulların sağlanması gerekir.

**Aksiyom 1**: Eğer `AdminDashboardPage` bileşeni tanımlı ya da içe aktarılmış değilse, `Page` fonksiyonu çalıştırıldığında **render hatası** oluşur.  
**Aksiyom 2**: Eğer Next.js’in **App Router** (yani `app/` dizini ve `page.tsx` konumu) kullanılmazsa, `Page` fonksiyonu **yönlendirme/rota** mekanizması tarafından tanınmaz ve `/admin` yolu erişilemez.  
**Aksiyom 3**: Eğer React ortamı (React 18+ ve JSX desteği) sağlanmazsa, `Page` fonksiyonu **JSX’i yorumlayamaz** ve **runtime hatası** verir.  
**Aksiyom 4**: Eğer `Page` fonksiyonu dışarıdan **props** bekler ya da alırsa, ancak tanımda parametre yoksa, **props kaybı** meydana gelir ve bileşen beklenen veri akışını sağlayamaz. (Bu durumda fonksiyon imzası parametresiz olduğundan, props kullanılmaz.)  
**Aksiyom 5**: Eğer `AdminDashboardPage` bileşeni **server‑side** (ör. `export const dynamic = 'force-dynamic'`) ya da **client‑side** (ör. `use client`) olarak yanlış şekilde işaretlenmişse, `Page` bileşeni **uyumsuz render** davranışı sergileyebilir (ör. hydration hatası).  

### Domain‑specific kurallar
- **Next.js sürümü**: Bu sayfanın doğru çalışması için proje **Next.js 13+** (App Router destekli) olmalıdır.  
- **React sürümü**: React 18 veya daha yeni bir sürüm gereklidir; aksi takdirde JSX dönüşümü başarısız olur.  
- **Dosya konumu**: `page.tsx` dosyasının `src/app/admin/` altında bulunması zorunludur; farklı bir konumda ise `/admin` rotası otomatik olarak oluşturulmaz.  

Bu koşullar sağlanmadığında belirtilen sonuçlar ortaya çıkar; aksi takdirde `Page` fonksiyonu sorunsuz bir şekilde `<AdminDashboardPage />` bileşenini render eder.

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
- **AdminDashboardPage** (call) — `dynamic(
  () => import('../../views/admin/AdminDashboardPage'),
  { ssr: f...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (React bileşeni olarak `<AdminDashboardPage />` döndürür)

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