---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\AdminSkeleton.tsx
skeleton_hash: 68755857c27aac1d
entity_hashes:
  func:AdminSkeleton: 77330e168e73e66f
  overview: f3781a370e1b4261
  style_tokens: 9e8ea6f4cb9e6a4c
generated_at: 2026-08-27T08:00:41Z
---

## Genel Bakış
Bu modül, admin panelinde veri yüklenirken gösterilen iskelet (skeleton) yükleme bileşenini içerir. Tek bir bileşenden oluşur ve `variant`, `rows`, `count`, `fields` gibi özellikleri alarak farklı admin ekranlarına uyum sağlayacak şekilde yapılandırılabilir. Yükleme sırasında kullanıcılara görsel bir geri bildirim sunmak amacıyla kullanılır.

## Fonksiyon Grupları

### Skeleton Yükleme Bileşeni
Admin panelinin çeşitli görünümlerinde veri yüklenirken gösterilen iskelet/placeholder arayüzü oluşturur. `variant` özelliğiyle farklı ekran türlerine, `rows`, `count` ve `fields` özellikleriyle ise satır sayısı, öğe sayısı ve alan sayısı gibi detaylara göre özelleştirilebilir bir yükleme durumu sunar.
- AdminSkeleton

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `variant` prop'u sağlanmazsa, bileşenin davranışı bilinmiyor (fonksiyon gövdesi mevcut değil, zorunlu prop olarak tanımlanmıştır).

[Aksiyom 2]: Eğer `rows` prop'u sağlanmazsa, varsayılan değer olarak 5 kullanılır.

[Aksiyom 3]: Eğer `count` prop'u sağlanmazsa, varsayılan değer olarak 4 kullanılır.

[Aksiyom 4]: Eğer `fields` prop'u sağlanmazsa, varsayılan değer olarak 6 kullanılır.

---

## FONKSİYON DETAYLARI

### AdminSkeleton
**Ne yapar**: Admin panelindeki farklı sayfa düzenlerinin (tablo, kartlar, form) yükleme sırasında gösterilecek iskelet (skeleton) bileşenlerini oluşturur. Kullanıcıya içeriğin yüklendiğini gösteren animasyonlu yer tutucular render eder.

**Nasıl yapar**: `variant` parametresinin değerine göre üç farklı JSX yapısından birini döndürür. `'table'` varyantında, sabit 5 sütunlu bir tablo başlığı ve `rows` parametresi kadar veri satırı oluşturur; her hücre `animate-pulse` sınıfıyla yanıp sönen gri kutucuklar içerir. `'cards'` varyantında, `count` parametresi kadar yan yana (responsive grid ile) kart skeleton'u üretir; her kartta küçük bir etiket ve büyük bir sayı alanı ile sağda bir ikon alanı bulunur. Diğer tüm durumlarda (form varyantı), `fields` parametresi kadar form alanı skeleton'u oluşturur; üstte bir başlık, ortada iki sütunlu grid içinde etiket ve input alanları, altta ise iptal ve kaydet butonlarının skeleton'larını render eder. Her varyantta `bg-admin-surface`, `border-admin-border`, `rounded-admin-lg` gibi Tailwind CSS sınıflarıyla tutarlı bir admin teması uygulanır.

**Parametreler**:
- `variant`: `'table' | 'cards' | string` — Hangi skeleton düzeninin gösterileceğini belirler. `'table'` tablo iskeleti, `'cards'` kart iskeleti, diğer değerler form iskeleti render eder.
- `rows`: `number` (varsayılan: `5`) — Tablo varyantında oluşturulacak veri satırı sayısıdır.
- `count`: `number` (varsayılan: `4`) — Kart varyantında oluşturulacak kart sayısıdır.
- `fields`: `number` (varsayılan: `6`) — Form varyantında oluşturulacak form alanı sayısıdır.

**Dönüş**: Belirtilmemiş. Kaynak kodda dönüş tipi açıkça tanımlanmamıştır; React fonksiyonel bileşeni olarak JSX yapısı döndürür ancak kesin TypeScript dönüş tipi bilinmiyor.

---

## İTHALATLAR (IMPORTS)
- import: react::React

---

## INTERFACES

### AdminSkeletonProps
- `variant: 'table' | 'cards' | 'form'`
- `rows?: number`
- `count?: number`
- `fields?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AdminSkeleton.tsx::AdminSkeleton
- **params**:
  - `variant` — hangi skeleton çeşidinin gösterileceğini belirler; `'table'`, `'cards'` veya form (varsayılan) değerlerinden birini alır
  - `rows` — varsayılan değeri `5`; `variant === 'table'` olduğunda tablodaki satır sayısını belirler
  - `count` — varsayılan değeri `4`; `variant === 'cards'` olduğunda gösterilecek kart sayısını belirler
  - `fields` — varsayılan değeri `6`; form varyantında gösterilecek form alanlarının sayısını belirler
- **ic_degiskenler**:
  - `_` — `[...Array(...)].map((_, i) => ...)` callback'inde kullanılan, dizi elemanının kendisini temsil eden ama işlenmeyen değişken
  - `i` — map callback'inde dizi index'i; `key` prop'u olarak kullanılır (tablo başlıkları, tablo satırları, kartlar, form alanları)
  - `j` — tablo varyantında iç içe map'te sütun index'i; `key` prop'u olarak kullanılır ve 5 sütunlu `<td>` öğelerini oluşturur
- **Dönüş**: JSX (React.ReactNode) — `variant` değerine göre üç farklı skeleton yapısı döndürür:
  - `'table'`: 5 sütun başlığı + `rows` kadar satırdan oluşan tablo skeleton'u
  - `'cards'`: `count` kadar kart skeleton'u (grid düzeninde)
  - form (varsayılan): `fields` kadar form alanı + buton skeleton'u içeren form yapısı

---

## NODE ID STANDARD

  file: src\components\admin\AdminSkeleton.tsx
  function: src\components\admin\AdminSkeleton.tsx::AdminSkeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSkeleton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-admin-surface-3`, `bg-transparent`, `border-admin-accent/30`, `border-admin-border`, `border-b`, `border-t`, `text-left`
- **Layout:** `flex`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-10`, `h-12`, `h-14`, `h-3`, `h-4`, `h-6`, `h-8`, `items-center`, `justify-between`
- **Varyant/Responsive:** `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `divide-admin-border`, `divide-y`, `group`, `mb-10`, `ml-1`, `mt-10`, `pt-8`, `rounded-admin-lg`, `rounded-admin-md`, `rounded-full`, `space-y-3`, `space-y-4`, `space-y-8`