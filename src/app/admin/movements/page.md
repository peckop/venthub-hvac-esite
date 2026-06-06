---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\movements\page.tsx
skeleton_hash: 7804c758a3d6534d
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: c697ddf7c92cfa4f
  style_tokens: 9144ece4bffe7964
generated_at: 2026-06-06T21:53:56Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim panelindeki "Hareketler" (Movements) sayfasının ana giriş noktasıdır. Next.js uygulamasında admin arayüzünde hareket kayıtlarının görüntülendiği sayfayı sunar. Tek bileşenli yapısıyla, hareketlere ilişkin yönetim arayüzünün yüklenmesini ve render edilmesini sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Hareketler yönetim sayfasının ana bileşenini tanımlar ve Next.js sayfa yönlendirme yapısıyla entegre çalışarak istemci tarafında render işlemini gerçekleştirir.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon imzalarından (sadece `Page()` – parametresiz) çıkarılabilecek mimari varsayım bulunmamaktadır.

---

**Gerekçe:**

Modülde tanımlı tek fonksiyon imzası `Page()` olup herhangi bir parametre, return tipi veya zorunlu bağımlılık belirtmemektedir. Bu nedenle fonksiyon imzasına dayalı olarak hüküm yürütülebilecek bir aksiyom üretilememektedir.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Next.js uygulamasında admin movements sayfasının ana sayfa bileşenini.render eder. Bu fonksiyon, sayfa yoluna erişildiğinde tarayıcıda görüntülenecek olan React bileşenini döndürür.

**Nasıl yapar**: Fonksiyon minimal bir wrapper (kapsayıcı) yapısıyla çalışır. Herhangi bir state yönetimi, veri çekimi veya mantık içermez; doğrudan PageComponent adlı alt bileşeni çağırarak onun JSX çıktısını döndürür. Bu yapı, sayfa bileşeninin modular ve yeniden kullanılabilir olmasını sağlar.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `JSX.Element` — Sayfa yükleniğinde tarayıcıda render edilecek olan PageComponent bileşeninin JSX yapısını döndürür.

---

## SABİTLER
- **PageComponent** (call) — `nextDynamic(() => import('../../../views/admin/AdminMovementsPage'), {
  ssr...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/movements/page.tsx::(anonim_arrow_loading)
- **params**: ()
- **ic_degiskenler**: (yok — sadece JSX döndürür)
- **Dönüş**: JSX element — ekran ortasında dönen spinner animasyonu gösteren loading bileşeni

### [N2_NASIL] AST Pointer: src/app/admin/movements/page.tsx::Page
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `<PageComponent />` JSX — admin movements sayfasının ana bileşeni olarak dinamik yüklenmiş `PageComponent`'i render eder

---

## NODE ID STANDARD

  file: src\app\admin\movements\page.tsx
  function: src\app\admin\movements\page.tsx::Page

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
- **Renkler:** `border-b-2`, `border-primary-navy`
- **Layout:** `flex`, `h-12`, `items-center`, `justify-center`, `min-h-screen`, `w-12`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-spin`, `rounded-full`