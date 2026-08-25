---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ui\Pagination.tsx
skeleton_hash: d26d24749b77852e
entity_hashes:
  func:Pagination: d5dc6893f11dd914
  func:hrefFor: bb2c2d7ab62a390f
  overview: 60d8a3ff982f4f10
  style_tokens: f3a8db447437f6e3
generated_at: 2026-08-25T08:46:10Z
---

## Genel Bakış
Bu modül, kullanıcı arayüzünde sayfalama (pagination) bileşenini sağlar. Belirli bir sayfa numarası için uygun URL/route oluşturmayı ve toplam kayıt sayısı ile sayfa boyutuna göre gezinme arayüzü sunmayı amaçlar.

## Fonksiyon Grupları

### Bileşen
Sayfalama arayüzünü render eder; mevcut sayfa numarası, sayfa boyutu ve toplam kayıt sayısı bilgilerini kullanarak kullanıcıya gezinme seçenekleri sunar.
- Pagination

### Yardımcı Fonksiyonlar
Belirtilen hedef sayfa numarası için uygun route bilgisini oluşturur; bileşen içindeki sayfa bağlantılarında kullanılır.
- hrefFor

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `page` prop'u sağlanmazsa, bileşen bilinmiyor şekilde davranır (fonksiyon gövdesinde default değer belirtilmemiştir).

[Aksiyom 2]: Eğer `pageSize` prop'u sağlanmazsa, bileşen bilinmiyor şekilde davranır (fonksiyon gövdesinde default değer belirtilmemiştir).

[Aksiyom 3]: Eğer `total` prop'u sağlanmazsa, bileşen bilinmiyor şekilde davranır (fonksiyon gövdesinde default değer belirtilmemiştir).

[Aksiyom 4]: Eğer `hrefFor` fonksiyonuna geçerli bir `target` sayısal değeri sağlanmazsa, fonksiyon bilinmiyor şekilde davranır (fonksiyon gövdesi verilmemiştir).

[Aksiyom 5]: Eğer `PaginationProps` tipi tanımlı değilse, bileşen derleme hatası verir.

---

## FONKSİYON DETAYLARI

### Pagination
**Ne yapar**: Sunucu taraflı sayfalama (server-side pagination) için basit bir önceki/sonraki navigasyonu ve "Sayfa X / Y" bilgi göstergesi sunan bir React bileşeni oluşturur. Sayfa durumunu URL'deki `?page=` sorgu parametresinde tutar ve mevcut diğer sorgu parametrelerini korur.

**Nasıl yapar**: Bileşen, `useSearchParams` kancasını kullanarak tarayıcının URL'sindeki sorgu parametrelerini okur ve günceller. Sayfa numarası doğrudan URL'de saklandığından, tarayıcı geçmişi ve sayfa yenileme gibi durumlarda sayfa konumu korunur. `useSearchParams` kullandığı için çağıran tarafın `<Suspense>` ile sarmalanması zorunludur; sarmalanmazsa sayfa kabuğu istemciye zorlanır (SSR zehirlenmesi). Toplam sayfa sayısı `total` ve `pageSize` değerlerinden hesaplanır; mevcut sayfa `page` parametresinden alınır. Önceki ve sonraki butonları, ilgili sayfa numaralarına yönelik URL'ler oluşturarak kullanıcıyı yönlendirir.

**Parametreler**:
- page: number — Mevcut görüntülenen sayfa numarası
- pageSize: number — Her sayfada gösterilecek öğe sayısı
- total: number — Toplam öğe sayısı; bu değerden ve `pageSize`'den toplam sayfa sayısı hesaplanır

**Dönüş**: React.FC<PaginationProps> — PaginationProps arayüzüne uygun props alan ve JSX.Element döndüren bir React fonksiyonel bileşeni

### hrefFor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: next/link::Link
- import: next/navigation::usePathname
- import: next/navigation::useSearchParams
- import: next::type { Route }
- import: react::React

---

## INTERFACES

### PaginationProps
- `page: number`
- `pageSize: number`
- `total: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/ui/Pagination.tsx::Pagination
- **params**: `{ page, pageSize, total }` — sayfa numarası, sayfa boyutu ve toplam kayıt sayısı
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('common.paginationLabel')`, `t('common.paginationPrevious')`, `t('common.paginationStatus', { page, pageCount })`, `t('common.paginationNext')` çağrılarıyla metinleri yerelleştirir
  - `pathname` — `usePathname()` hook'undan gelen mevcut URL yolu; `hrefFor` içinde link URL'lerinin başına eklenir
  - `searchParams` — `useSearchParams()` hook'undan gelen mevcut URL search parametreleri; `hrefFor` içinde `searchParams?.toString()` ile string'e dönüştürülür, yoksa boş string kullanılır
  - `pageCount` — `Math.max(1, Math.ceil(total / Math.max(1, pageSize)))` hesaplamasıyla elde edilen toplam sayfa sayısı; `pageSize` sıfırsa `Math.max(1, pageSize)` ile 1'e sabitlenir
  - `hrefFor` — `(target: number) => Route` tipinde iç fonksiyon; verilen hedef sayfa numarasına göre tam URL döndürür
  - `hasPrev` — `page > 1` koşuluyla hesaplanan boolean; önceki sayfa bağlantısının gösterilip gösterilmeyeceğini belirler
  - `hasNext` — `page < pageCount` koşuluyla hesaplanan boolean; sonraki sayfa bağlantısının gösterilip gösterilmeyeceğini belirler
  - `linkClass` — aktif (tıklanabilir) durumdaki sayfa linklerine uygulanan Tailwind CSS sınıf string'i; `px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-light-gray bg-white text-primary-navy transition-colors hover:bg-light-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2`
  - `disabledClass` — devre dışı durumdaki sayfa linklerine uygulanan Tailwind CSS sınıf string'i; `px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-light-gray bg-light-gray/40 text-steel-gray cursor-not-allowed`
- **Dönüş**: `pageCount <= 1` olduğunda `null`, aksi halde `<nav>` elementi içeren JSX (React.ReactNode). `<nav>` içinde `hasPrev`/`hasNext` durumlarına göre `<Link>` veya `<span aria-disabled>` render edilir; ortada mevcut sayfa bilgisi gösterilir

### [N2_NASIL] AST Pointer: src/components/ui/Pagination.tsx::hrefFor
- **params**: `target: number` — gidilmek istenen hedef sayfa numarası
- **ic_degiskenler**:
  - `params` — `new URLSearchParams(searchParams?.toString() ?? '')` ile oluşturulan URLSearchParams nesnesi; üst kapsamdan gelen `searchParams` değerini kopyalar. `target <= 1` ise `params.delete('page')` ile `page` parametresi silinir, aksi halde `params.set('page', String(target))` ile hedef sayfa numarası yazılır
  - `qs` — `params.toString()` ile elde edilen query string; boşsa URL'ye eklenmez
- **Dönüş**: `Route` tipinde string — `${pathname}${qs ? \`?\${qs}\` : ''}` template literal ile oluşturulan tam URL yolu. `as Route` ile tip dönüşümü uygulanır

---

## NODE ID STANDARD

  file: src\components\ui\Pagination.tsx
  function: src\components\ui\Pagination.tsx::Pagination
  function: src\components\ui\Pagination.tsx::hrefFor

---

## DISA AKTARILANLAR (EXPORTS)
  export: Pagination

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-sm`
- **Layout:** `flex`, `gap-4`, `items-center`, `justify-center`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-bold`, `py-10`