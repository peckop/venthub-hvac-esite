---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\categories\[id]\builder\page.tsx
skeleton_hash: 6f66d930456963ac
entity_hashes:
  func:CategoryBuilderPage: b1b2565a20b825f9
  overview: 152bd8ffebcdcce2
  style_tokens: 5aeaea31beafa07a
generated_at: 2026-06-08T10:08:11Z
---

## Genel Bakış
`CategoryBuilderPage`, yönetim panelinde belirli bir kategorinin yapısal düzenlemelerini yapmak için kullanılan tam ekran bir sayfa oluşturucu (page builder) bileşenidir. URL'den gelen asenkron `id` parametresini çözerek, bu kimliği ilgili alt bileşenlere iletir ve kullanıcıya kategori bazlı içerik oluşturma veya düzenleme arayüzü sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Veri Akışı
Bu grup, asenkron URL parametrelerinin çözümü ve sayfanın ana yapısının oluşturulmasından sorumludur. Tek bir bileşen olarak, sayfanın tüm render mantığını ve alt bileşenlere veri aktarımını yönetir.
- CategoryBuilderPage

---

## AXIOMS – Mimari Varsayımlar
[Aksiyom 1]: Eğer `params` `Promise<{ id: string }>` türünde çözümlenemezse (örn. `await` edilmeden kullanılırsa), sayfa render edilemez ve hata oluşur.
[Aksiyom 2]: Eğer `params` içindeki `id` alanı bir `string` içermiyorsa, ilgili kategori bulunamaz ve hata oluşur.

---

## FONKSİYON DETAYLARI

### CategoryBuilderPage

**Ne yapar**: Next.js App Router'da dinamik bir sayfa rotası olarak görev yapan bu bileşen, verilen kategori ID'sine karşılık gelen tam ekran sayfa düzenleyicisi (Page Builder) görünümünü render eder. Kullanıcıya kategori bazlı bir otorite editörü sunar ve geçersiz ID durumunda hata gösterir.

**Nasıl yapar**: Fonksiyon, Next.js'in `params` prop'unu `Promise` tabanlı yapıdan `use` hook'u ile çözerek `id` değerini çıkarır. Eğer `id` boş veya tanımsız ise merkezi bir hata mesajı içeren tam ekran bir `div` döndürür. Aksi halde `CategoryBuilderView` bileşenini `categoryId` prop'u ile birlikte çağırarak ana düzenleyici arayüzünü render eder.

**Parametreler**:
- `params`: `Promise<{ id: string }>` — Next.js App Router tarafından otomatik olarak enjekte edilen dinamik rota parametreleri nesnesi. İçerisinde `id` alanı bulunur ve bu alan kategorinin benzersiz tanımlayıcısıdır. Promise tabanlı yapıda olduğu için `use` hook'u ile çözümlenmesi gerekir.

**Dönüş**: `JSX.Element` — Geçerli bir `id` mevcutsa `CategoryBuilderView` bileşeninin sarmalanmış hali; aksi takdirde hata durumu için merkezi bir `div` bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/categories/[id]/builder/page.tsx::CategoryBuilderPage
- **params**: `{ params: Promise<{ id: string }> }` — Next.js tarafından sağlanan route parametreleri, Promise olarak gelir
- **ic_degiskenler**:
  - `id` — `use(params)` hook'u ile Promise'ten çözülen kategori ID'si (string), URL'deki `[id]` segmentinden gelir
- **Dönüş**: JSX element (React component) — `id` yoksa hata mesajı div'i, varsa `CategoryBuilderView` component'i
- **Yan etkiler**: Yok (stateless sunucu component)
- **Notlar**: `use()` hook'u React 19 ile gelen Promise unwrap fonksiyonudur; `CategoryBuilderView` component'ine `categoryId` prop'u olarak geçirilir

---

## NODE ID STANDARD

  file: src\app\admin\categories\[id]\builder\page.tsx
  function: src\app\admin\categories\[id]\builder\page.tsx::CategoryBuilderPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryBuilderPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-surface-deep`, `text-slate-400`, `text-xs`
- **Layout:** `flex`, `h-screen`, `items-center`, `justify-center`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-mono`, `tracking-widest`, `uppercase`