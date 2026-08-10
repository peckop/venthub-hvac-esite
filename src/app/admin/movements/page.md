---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\movements\page.tsx
skeleton_hash: 1a1e4ed3c0375a2e
entity_hashes:
  func:Page: 9c08060caeb88969
  overview: 9da4b48a024a6a7c
  style_tokens: 9144ece4bffe7964
generated_at: 2026-06-19T20:46:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim panelindeki "Hareketler" (Movements) sayfasının ana giriş noktasıdır. Tek bileşenli yapısıyla, hareketlere ilişkin yönetim arayüzünün yüklenmesini ve istemci tarafında render edilmesini sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Hareketler yönetim sayfasının ana bileşenini tanımlar ve Next.js sayfa yönlendirme yapısıyla entegre çalışarak istemci tarafında render işlemini gerçekleştirir.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js `app` router yapısında yer alan bir sayfa bileşenidir. Verilen fonksiyon imzası (`Page()` – parametresiz) ve modül yapısından (sadece `PageComponent` çağrısı) çıkarılabilecek minimum mimari varsayımlar aşağıdadır.

**[Aksiyom 1]:** Eğer `PageComponent` modül ortamında tanımlı değilse veya yüklenemezse, `Page()` fonksiyonu bir `ReferenceError` / `ImportError` ile karşılaşır ve sayfa hiç render edilemez.

**[Aksiyom 2]:** Eğer Next.js app router yapılandırması `/admin/movements` rota yolunu geçerli bir sayfa olarak tanımıyorsa, `Page()` fonksiyonu hiç çağrılmaz ve kullanıcı bu sayfaya erişemez.

**[Aksiyom 3]:** Fonksiyon parametresiz (`Page()`) olduğundan, bu sayfa dinamik rota parametrelerine (`params`, `searchParams`) bağımsızdır. Eğer ileride dinamik parametre kullanımı gerekirse, fonksiyon imzasının güncellenmesi zorunludur; aksi halde ilgili verilere erişilemez.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Ana sayfa bileşenini Suspense sarmalayıcısı ile sararak, asenkron yüklemeler sırasında kullanıcıya animasyonlu bir yükleme göstergesi sunar ve yükleme tamamlandığında asıl sayfa bileşenini render eder.

**Nasıl yapar**: React'in `Suspense` API'sini kullanarak iç bileşenlerin (`PageComponent`) yüklenme sürecini yönetir. `fallback` prop'u aracılığıyla, `PageComponent` henüz hazır olmadığında ekranda ortalanmış, dönen bir animasyonlu spinner (yüksekliği ve genişliği 12 birim olan, primary-navy renkli alt kenarlıklı yuvarlak) gösterir. Bu sayede kullanıcı deneyimi kesintisiz hale gelir.

**Parametreler**:
- Parametre almaz (propsuz fonksiyonel bileşen)

**Dönüş**: `React.ReactNode` — Suspense ile sarılmış JSX yapısı döndürür. İçerisinde loading fallback'i ve `PageComponent` bileşenini barındırır.

---

## İTHALATLAR (IMPORTS)
- import: next/dynamic::nextDynamic
- import: react::React
- import: react::Suspense

---

## SABİTLER
- **PageComponent** (call) — `nextDynamic(() => import('../../../views/admin/AdminMovementsPage'), {
  ssr...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/movements/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan JSX döner)
- **Dönüş**: JSX element — `Suspense` sarıcı içinde `PageComponent` render eder; `fallback` olarak spinner JSX'i verilmiştir

### [N2_NASIL] AST Pointer: src/app/admin/movements/page.tsx::(anonim fallback arrow)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan JSX döner)
- **Dönüş**: JSX element — yükleme durumunda gösterilen spinner (animasyonlu `div`)

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